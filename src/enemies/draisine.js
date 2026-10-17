import {projectileMuzzleClear} from '../projectile-attacks.js';
import {moveBetweenAttacks,recoveryMotion,motionLocked} from '../enemy-mobility.js';
import {aimFan,enemyShot} from '../enemy-volley.js';
import { Enemy } from '../enemy.js';
import { DRAISINE, DRAISINE_BOLT } from './rail-stats.js';

export class Draisine extends Enemy {
  constructor(id,x,y) {
    super(id,x,y,DRAISINE);
    this.kind='draisine';this.fanAttack=true;this.phase='positioning';this.phaseTime=1+(id%3)*.3;
    this.attackAngle=0;this.attackCount=0;this.burstLeft=0;
    this.projectileSpec=DRAISINE_BOLT;
  }
  get fixedPosition(){return motionLocked(this);}
  update(dt,player,attacks=[]) {
    if(!this.tick(dt))return;
    recoveryMotion(this,dt,player);
    aimFan(this,player);
    this.phaseTime-=dt;
    if(this.phase==='positioning') {
      const dx=player.x-this.x,dy=player.y-this.y,distance=Math.hypot(dx,dy)||1;
      this.angle=Math.atan2(dy,dx);
      if(this.phaseTime<=0&&distance<=DRAISINE.attackRange&&projectileMuzzleClear(this,player)) {
        this.phase='burst';this.phaseTime=0;this.burstLeft=1;
        this.attackAngle=this.angle;this.pushX=this.pushY=0;
      } else {
        moveBetweenAttacks(this,dt,player);
        return;
      }
    }
    this.pushX=this.pushY=0;
    if(this.phaseTime>0)return;
    if(this.phase==='warning') {
      this.phase='burst';this.burstLeft=1;
    }
    if(this.phase==='burst') {
      if(!projectileMuzzleClear(this,player))return;
      // One three-way fan replaces the old two-shot burst; no tracking in flight.
      attacks.push(enemyShot(this,player));
      this.burstLeft--;this.phaseTime=DRAISINE.burstInterval;
      if(!this.burstLeft){this.phase='recovery';this.phaseTime=1.1;this.attackCount++;}
    } else if(this.phase==='recovery') {
      this.phase='positioning';this.phaseTime=DRAISINE.cooldownSeconds;
    }
  }
}
