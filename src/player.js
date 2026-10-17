import { PLAYER, ROOM } from './config.js';
import { approach, clampToRoom } from './math.js';

export class Player {
  constructor() {
    Object.assign(this, { x: 225, y: 414, vx: 0, vy: 0, speed: PLAYER.speed, radius: PLAYER.radius, hp: PLAYER.health, maxHealth: PLAYER.health, invulnerable: 0, angle: -Math.PI / 2 });
    this.shotBoost=false;this.boostSeconds=0;
  }
  get effectiveSpeed(){return this.speed*(this.boostSeconds>0?1.3:1);}
  update(dt, input) {
    this.boostSeconds=Math.max(0,this.boostSeconds-dt);
    const length = Math.max(1, Math.hypot(input.x, input.y));
    const acceleration = input.x || input.y ? PLAYER.acceleration : PLAYER.braking;
    this.vx = approach(this.vx, input.x / length * this.effectiveSpeed, acceleration * dt);
    this.vy = approach(this.vy, input.y / length * this.effectiveSpeed, acceleration * dt);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    clampToRoom(this, ROOM);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    if (Math.hypot(this.vx, this.vy) > 20) this.moveAngle = Math.atan2(this.vy, this.vx);
  }
  hurt(damage = 1) {
    if (this.invulnerable > 0 || this.hp <= 0) return false;
    this.hp = Math.max(0, this.hp - damage);
    this.invulnerable = PLAYER.invulnerability;
    return true;
  }
}
