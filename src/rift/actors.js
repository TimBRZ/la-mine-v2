import {isPureProjectile,projectileMuzzleClear} from '../projectile-attacks.js';
import {Enemy} from '../enemy.js';
import {ROOM} from '../config.js';
import {clampToRoom} from '../math.js';
import {RIFT_ENEMIES,RIFT_BOSSES,RIFT_PATTERNS,RIFT_CYCLES} from './config.js';
export class RiftActor extends Enemy {
 constructor(id,type,x=225,y=220,{final=false,slot=0}={}){
  const spec=RIFT_ENEMIES[type]||RIFT_BOSSES[type];super(id,x,y,spec);this.spec=spec;this.riftType=type;this.kind=RIFT_BOSSES[type]?'boss':type;this.bossId=this.kind==='boss'?type:undefined;
  this.final=final;this.phase='positioning';this.phaseTime=.9+slot*.4;this.attackCount=0;this.age=0;this.previousX=x;this.previousY=y;this.sweptContact=true;this.recoveryElapsed=0;
 }
 get fixedPosition(){return !['positioning','recovery'].includes(this.phase);}
 reposition(dt,p){
  const dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx),type=this.riftType;
  const ranged=['spitter','blower','core'].includes(type);const radial=ranged?(d<180?-1:d>235?1:0):1;
  const side=this.attackCount%2?-1:1,lateral=type==='crawler'?Math.sin(this.age*5+this.id)*.65:ranged?.75*side:.25*side;
  let vx=Math.cos(a)*radial-Math.sin(a)*lateral,vy=Math.sin(a)*radial+Math.cos(a)*lateral;
  if(this.escape>0)this.escape-=dt;else if(this.x<ROOM.left+this.radius+18&&vx<0||this.x>ROOM.right-this.radius-18&&vx>0||this.y<ROOM.top+this.radius+18&&vy<0||this.y>ROOM.bottom-this.radius-18&&vy>0)this.escape=.55;
  if(this.escape>0){vx=225-this.x;vy=390-this.y;}
  let speed=this.spec.speed;if(type==='burster')speed*=d<170?1.9:1;if(type==='core'&&this.hp<this.maxHealth*.5)speed*=1.12;
  const len=Math.hypot(vx,vy)||1;this.angle=a;this.move(dt,vx/len*speed,vy/len*speed);
 }
 nextPattern(){
  if(this.kind!=='boss')return this.kind==='spitter'?'spit':'blast';
  const cycle=this.hp<this.maxHealth*.5&&this.riftType==='splitter'?['charge','fan8','charge','fan8','fissures']:this.hp<this.maxHealth*.5&&this.riftType==='core'?['double','orb','double','rain']:RIFT_CYCLES[this.riftType];return cycle[this.attackCount%cycle.length];
 }
 recover(){this.phase='recovery';this.phaseTime=this.kind==='boss'?(this.hp<this.maxHealth*.5?.75:1.1):1.6;this.recoveryElapsed=0;this.chargeAngle=undefined;}
 update(dt,p,attacks=[],context={}){
  this.previousX=this.x;this.previousY=this.y;if(!this.tick(dt))return;this.age+=dt;this.phaseTime-=dt;
  if(this.kind==='crawler'){this.reposition(dt,p);return;}
  if(this.phase==='positioning'){
   this.reposition(dt,p);const d=Math.hypot(p.x-this.x,p.y-this.y);
   if(this.phaseTime>0||this.kind==='spitter'&&(d<150||d>300)||this.kind==='burster'&&d>95&&this.hp>this.maxHealth*.35)return;
   const pattern=this.nextPattern();if(isPureProjectile(this,pattern)&&!projectileMuzzleClear(this,p,pattern==='orb'?10:5))return;if(!context.rift?.begin(this,pattern,p)){this.phaseTime=isPureProjectile(this,this.nextPattern())?0:.18;return;}
   this.attackCount++;
  }
  if(this.phase==='warning'&&isPureProjectile(this)){this.phaseTime=0;if(!projectileMuzzleClear(this,p,this.pattern==='orb'?10:5))return;}
  if(this.phase==='warning'&&this.phaseTime<=0){
   if(this.pattern==='charge'){this.phase='charge';this.phaseTime=RIFT_PATTERNS.charge.seconds;}
   else if(context.rift?.release(this)){if(this.pattern==='double'){this.phase='burst';this.phaseTime=.65;}else this.recover();}
   else this.phaseTime=.2; // Keep the visible warning when admission is delayed.
  }else if(this.phase==='burst'&&this.phaseTime<=0){if(!projectileMuzzleClear(this,p,5))return;if(context.rift?.release(this,true))this.recover();else this.phaseTime=.2;}
  else if(this.phase==='charge'){
   this.x+=Math.cos(this.chargeAngle)*330*dt;this.y+=Math.sin(this.chargeAngle)*330*dt;clampToRoom(this,ROOM);
   if(this.phaseTime<=0||this.x<=ROOM.left+this.radius||this.x>=ROOM.right-this.radius||this.y<=ROOM.top+this.radius||this.y>=ROOM.bottom-this.radius)this.recover();
  }else if(this.phase==='recovery'){
   this.recoveryElapsed+=dt;if(this.recoveryElapsed>.3)this.reposition(dt,p);
   if(this.phaseTime<=0){this.phase='positioning';this.phaseTime=this.kind==='boss'?.25:.6;}
  }
 }
 hit(damage,angle,force){super.hit(damage,angle,this.kind==='boss'?0:force);}
}
