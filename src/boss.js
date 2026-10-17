import {moveBetweenAttacks,recoveryMotion} from './enemy-mobility.js';
import { Enemy } from './enemy.js';
import { ROOM } from './config.js';
import { clampToRoom } from './math.js';
import { HAVEUSE_TUNING, bossRestScale } from './difficulty.js';

export const HAVEUSE = HAVEUSE_TUNING;

export class Haveuse extends Enemy {
  constructor(id) {
    super(id, 225, 220);
    this.kind = 'boss';this.bossId='haveuse';
    this.spec = HAVEUSE;
    this.hp = this.maxHealth = HAVEUSE.health;
    this.radius = HAVEUSE.radius;
    this.warmup = 1.4;
    this.phase = 'chase';
    this.phaseTime = HAVEUSE.chaseSeconds*bossRestScale(this);
    this.chargeAngle = Math.PI / 2;
    this.previousX = this.x; this.previousY = this.y;
  }
  update(dt, player) {
    this.previousX = this.x; this.previousY = this.y;
    this.warmup = Math.max(0, this.warmup - dt);
    this.flash = Math.max(0, this.flash - dt);
    if (!this.active) return;
    recoveryMotion(this,dt,player);
    this.phaseTime -= dt;
    if (this.phase === 'chase') {
      moveBetweenAttacks(this,dt,player);
      if (this.phaseTime <= 0) {
        this.phase = 'warning'; this.phaseTime = HAVEUSE.warningSeconds;
        // Lock the direction before the charge. The warning never tracks dodge.
        this.chargeAngle = Math.atan2(player.y - this.y, player.x - this.x);
      }
    } else if (this.phase === 'warning') {
      if (this.phaseTime <= 0) { this.phase = 'charge'; this.phaseTime = HAVEUSE.chargeSeconds; }
    } else if (this.phase === 'charge') {
      this.angle = this.chargeAngle;
      this.x += Math.cos(this.chargeAngle) * HAVEUSE.chargeSpeed * dt;
      this.y += Math.sin(this.chargeAngle) * HAVEUSE.chargeSpeed * dt;
      const wall = this.x <= ROOM.left + this.radius || this.x >= ROOM.right - this.radius ||
        this.y <= ROOM.top + this.radius || this.y >= ROOM.bottom - this.radius;
      if (wall || this.phaseTime <= 0) { this.phase = 'recovery'; this.phaseTime = HAVEUSE.recoverySeconds * bossRestScale(this); }
    } else if (this.phaseTime <= 0) {
      this.phase = 'chase'; this.phaseTime = HAVEUSE.chaseSeconds * bossRestScale(this);
    }
    clampToRoom(this, ROOM);
  }
  hit(damage, angle, force) {
    super.hit(damage * HAVEUSE.damageTaken, angle, force);
    // Heavy machine: hit flash remains, but pellets cannot cancel its telegraph.
    this.pushX = this.pushY = 0;
  }
}
