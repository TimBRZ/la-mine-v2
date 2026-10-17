import { ENEMY, ROOM } from './config.js';
import { clamp, clampToRoom } from './math.js';

export class Enemy {
  constructor(id, x, y, stats = ENEMY) {
    this.stats = stats;
    Object.assign(this, { id, x, y, radius: stats.radius, hp: stats.health, warmup: stats.telegraph, pushX: 0, pushY: 0, flash: 0 });
    this.maxHealth = stats.health;
    this.contactDamage = stats.contactDamage ?? 1;
  }
  get alive() { return this.hp > 0; }
  get active() { return this.alive && this.warmup <= 0; }
  tick(dt) {
    this.warmup = Math.max(0, this.warmup - dt);
    this.flash = Math.max(0, this.flash - dt);
    return this.active;
  }
  update(dt, player) {
    if (!this.tick(dt)) return;
    const dx = player.x - this.x, dy = player.y - this.y, distance = Math.hypot(dx, dy) || 1;
    this.angle = Math.atan2(dy, dx);
    const speed = this.flash > 0 ? this.stats.speed * .35 : this.stats.speed;
    this.move(dt, dx / distance * speed, dy / distance * speed);
  }
  move(dt, vx, vy) {
    this.x += (vx + this.pushX) * dt;
    this.y += (vy + this.pushY) * dt;
    this.pushX *= Math.exp(-9 * dt);
    this.pushY *= Math.exp(-9 * dt);
    clampToRoom(this, ROOM);
  }
  hit(damage, angle, force) {
    this.hp = Math.max(0, this.hp - damage);
    this.flash = .09;
    this.pushX = clamp(this.pushX + Math.cos(angle) * force, -170, 170);
    this.pushY = clamp(this.pushY + Math.sin(angle) * force, -170, 170);
  }
}
