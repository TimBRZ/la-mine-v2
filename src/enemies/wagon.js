import { Enemy } from '../enemy.js';
import { ROOM } from '../config.js';
import { WAGON } from './rail-stats.js';

export const WAGON_SPAWN_CLEARANCE=140;
export const WAGON_SPAWNS=Object.freeze([190,310,450,580].flatMap(y=>
  [ROOM.left+WAGON.radius,ROOM.right-WAGON.radius].map(x=>Object.freeze([x,y]))));

// Only rank safe, authorized rail endpoints supplied by the spawn pipeline.
// Stable ties preserve its side/occupancy policy. The constructor locks this rail.
export function chooseWagonRail(points,player) {
  return points.reduce((best,point)=>!best||Math.abs(point[1]-player.y)<Math.abs(best[1]-player.y)?point:best,undefined);
}

export class MadWagon extends Enemy {
  constructor(id,x,y) {
    super(id,x,y,WAGON);
    this.kind='wagon';this.phase='warning';this.phaseTime=WAGON.warningSeconds;
    this.angle=this.chargeAngle=x<(ROOM.left+ROOM.right)/2?0:Math.PI;
    this.endX=this.angle===0?ROOM.right-this.radius:ROOM.left+this.radius;
    this.previousX=x;this.previousY=y;
    this.fixedPosition=true;this.sweptContact=true;
  }
  update(dt) {
    this.previousX=this.x;this.previousY=this.y;
    if(!this.tick(dt))return;
    if(this.phase==='stopped')this.contactDamage=0;
    if(this.phase==='warning') {
      this.phaseTime-=dt;
      if(this.phaseTime<=0)this.phase='charge';
    } else if(this.phase==='charge') {
      const distance=Math.min(Math.abs(this.endX-this.x),WAGON.speed*dt);
      this.x+=Math.sign(this.endX-this.x)*distance;
      if(this.x===this.endX)this.phase='stopped';
    }
  }
  // A rail vehicle cannot be knocked sideways or have its locked path moved.
  hit(damage,angle,force) {super.hit(damage,angle,force);this.pushX=this.pushY=0;}
}
