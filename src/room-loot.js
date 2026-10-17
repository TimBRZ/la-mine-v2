import { ROOM } from './config.js';
import { emptyWallet } from './resources.js';
import { roomRewards } from './rewards.js';

export const LOOT = Object.freeze({ capacity: 20, breath: .18, initialSpeed: 160, acceleration: 1800, maxSpeed: 1400, pickupRadius: 21 });

export class RoomLoot {
  constructor(number, enemyCount, random = Math.random, plan = null) {
    this.plan = plan ? { ...plan } : roomRewards(number, random);
    this.enemyCount = enemyCount;
    this.deaths = new Set();
    this.emitted = emptyWallet();
    this.collected = emptyWallet();
    this.pool = Array.from({ length: LOOT.capacity }, (_, id) => ({ id, active: false }));
    this.phase = 'combat';
    this.elapsed = 0;
    this.pickupScale=1;this.magnetScale=1;
  }
  get activeCount() { return this.pool.reduce((n, drop) => n + Number(drop.active), 0); }
  spawn(resource, amount, x, y) {
    if (amount <= 0) return;
    const drop = this.pool.find(item => !item.active);
    // Defensive merging, never discard value if a future encounter fills the pool.
    if (!drop) {
      const existing = this.pool.find(item => item.resource === resource);
      if (!existing) throw Error('Loot capacity exceeded');
      existing.amount += amount;
    } else {
      const index = ['coal', 'iron', 'diamond', 'token'].indexOf(resource);
      const angle = index * Math.PI / 2 + .4;
      Object.assign(drop, { active: true, resource, amount, age: 0,
        x: Math.max(ROOM.left + 9, Math.min(ROOM.right - 9, x + Math.cos(angle) * 18)),
        y: Math.max(ROOM.top + 9, Math.min(ROOM.bottom - 9, y + Math.sin(angle) * 18)) });
    }
    this.emitted[resource] += amount;
  }
  onKill(event) {
    if (this.phase !== 'combat' || this.deaths.has(event.id) || this.deaths.size >= this.enemyCount) return;
    this.deaths.add(event.id);
    const count = this.deaths.size;
    this.spawn('coal', Math.floor(this.plan.coal * count / this.enemyCount) - this.emitted.coal, event.x, event.y);
    if (count >= Math.ceil(this.enemyCount / 2)) this.spawn('iron', this.plan.iron - this.emitted.iron, event.x, event.y);
    if (count === this.enemyCount) for (const resource of ['diamond', 'token']) this.spawn(resource, this.plan[resource] - this.emitted[resource], event.x, event.y);
  }
  beginCollection(player) {
    if (this.phase !== 'combat') return;
    // Reconcile any missing death notifications once; the room budget is fixed.
    for (const resource of Object.keys(this.plan)) this.spawn(resource, this.plan[resource] - this.emitted[resource], player.x, player.y);
    this.phase = 'collecting';
    this.elapsed = 0;
  }
  update(dt, player, events) {
    if (this.phase === 'done') return;
    if (this.phase === 'collecting') this.elapsed += dt;
    const magnetTime = Math.max(0, this.elapsed - LOOT.breath);
    const speed = Math.min(LOOT.maxSpeed, LOOT.initialSpeed + LOOT.acceleration * magnetTime);
    for (const drop of this.pool) {
      if (!drop.active) continue;
      drop.age += dt;
      const dx = player.x - drop.x, dy = player.y - drop.y, distance = Math.hypot(dx, dy);
      const step = magnetTime > 0 ? speed * (this.magnetScale||1) * dt : 0;
      if (distance <= LOOT.pickupRadius * (this.pickupScale||1) || (step > 0 && distance <= step)) {
        drop.active = false;
        this.collected[drop.resource] += drop.amount;
        events.push({ type: 'loot-collected', resource: drop.resource, amount: drop.amount, x: player.x, y: player.y });
      } else if (step > 0) {
        drop.x += dx / distance * step;
        drop.y += dy / distance * step;
      }
    }
    if (this.phase === 'collecting' && this.elapsed >= LOOT.breath && this.activeCount === 0) this.phase = 'done';
  }
  discard() {
    for (const drop of this.pool) drop.active = false;
    this.collected = emptyWallet();
    this.phase = 'done';
  }
}
