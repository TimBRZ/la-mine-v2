import {projectileMuzzleClear} from '../projectile-attacks.js';
import {moveBetweenAttacks,recoveryMotion,motionLocked} from '../enemy-mobility.js';
import {aimFan,enemyShot} from '../enemy-volley.js';
import { Enemy } from '../enemy.js';
import { DRILL } from './stats.js';
import { aimedPoint } from '../difficulty.js';

export class AutonomousDrill extends Enemy {
  constructor(id, x, y) {
    super(id, x, y, DRILL);
    this.kind = 'drill';this.fanAttack=true;this.attackCount=0;
    this.phase = 'positioning';
    this.phaseTime = 0;
    this.cooldown = 1 + (id % 3) * .25;
    this.attackAngle = 0;
  }
  get fixedPosition(){return motionLocked(this);}
  update(dt, player, attacks = [], pressure = {}) {
    if (!this.tick(dt)) return;
    recoveryMotion(this,dt,player);
    aimFan(this,player);
    if (this.phase === 'warning' || this.phase === 'recovery') {
      // Locked warning; recovery movement is handled before this attack clock.
      this.pushX = this.pushY = 0;
      this.phaseTime = Math.max(0, this.phaseTime - dt);
      if (this.phaseTime > 0) return;
      if (this.phase === 'warning') {
        if(!projectileMuzzleClear(this,player))return;
        attacks.push(enemyShot(this,player));
        this.phase = 'recovery'; this.phaseTime = this.fanAttack?1.1:DRILL.recoverySeconds;
      } else {
        this.phase = 'positioning'; this.cooldown = DRILL.cooldownSeconds;
      }
      return;
    }
    const tuning=pressure.tuning;
    const rate=tuning ? pressure.stillSeconds>=tuning.campAfter?tuning.campRate:tuning.drillRate : 1;
    this.cooldown = Math.max(0, this.cooldown - dt*rate);
    const dx = player.x - this.x, dy = player.y - this.y, distance = Math.hypot(dx, dy) || 1;
    this.angle = Math.atan2(dy, dx);
    if (this.cooldown === 0 && distance <= DRILL.attackRange && projectileMuzzleClear(this,player)) {
      this.phase = 'warning'; this.phaseTime = DRILL.warningSeconds;this.fanAttack=this.attackCount++%2===0;
      const target=aimedPoint(player,tuning?.lead||0);
      this.attackAngle = Math.atan2(target.y-this.y,target.x-this.x);
      this.pushX = this.pushY = 0;
      attacks.push(enemyShot(this,player));
      this.phase='recovery';this.phaseTime=this.fanAttack?1.1:DRILL.recoverySeconds;
      return;
    }
    moveBetweenAttacks(this,dt,player);
  }
}
