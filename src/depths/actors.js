import {isPureProjectile,projectileMuzzleClear} from '../projectile-attacks.js';
import {Enemy} from '../enemy.js';
import {ROOM} from '../config.js';
import {clampToRoom} from '../math.js';
import {DEPTHS_ENEMIES,DEPTHS_BOSSES,DEPTHS_PATTERNS,DEPTHS_CYCLES} from './config.js';
import {extinctionModifiers,EXTINCTION_PRESSURE,depthsRestRate,DEPTHS_LATE_CYCLES} from './pressure.js';

export class DepthsActor extends Enemy {
 constructor(id,type,x=225,y=220,{final=false,slot=0}={}) {
  const spec=DEPTHS_ENEMIES[type]||DEPTHS_BOSSES[type];super(id,x,y,spec);
  Object.assign(this,{spec,depthsType:type,kind:DEPTHS_BOSSES[type]?'boss':type,bossId:DEPTHS_BOSSES[type]?type:undefined,final,phase:'positioning',phaseTime:.9+slot*.4,attackCount:0,age:0,previousX:x,previousY:y,sweptContact:true,recoveryElapsed:0});
 }
 get fixedPosition(){return !['positioning','recovery'].includes(this.phase);}
 reposition(dt,p,retreat=false) {
  const a=Math.atan2(p.y-this.y,p.x-this.x),d=Math.hypot(p.x-this.x,p.y-this.y),type=this.depthsType;
  const ranged=['lampist','lampmajor','dynamiter'].includes(type);
  const radial=retreat?-1:ranged?(d<185?-1:d>255?1:0):1;
  const lateral=type==='blackmaw'?Math.sin(Math.floor(this.age*3)+this.id)*.85:(this.attackCount%2?-.8:.8);
  let vx=Math.cos(a)*radial-Math.sin(a)*lateral,vy=Math.sin(a)*radial+Math.cos(a)*lateral;
  if(this.escape>0)this.escape-=dt;
  else if(this.x<ROOM.left+this.radius+18&&vx<0||this.x>ROOM.right-this.radius-18&&vx>0||this.y<ROOM.top+this.radius+18&&vy<0||this.y>ROOM.bottom-this.radius-18&&vy>0)this.escape=.55;
  if(this.escape>0){vx=225-this.x;vy=390-this.y;}
  const len=Math.hypot(vx,vy)||1,speed=this.spec.speed*(this.kind==='boss'&&this.hp<this.maxHealth*.5?1.12:1)*(this.extinctionSpeed||1);
  this.angle=a;this.move(dt,vx/len*speed,vy/len*speed);
 }
 nextPattern(){const cycle=this.hp<this.maxHealth*.5?DEPTHS_LATE_CYCLES[this.bossId]:DEPTHS_CYCLES[this.bossId];return this.kind==='boss'?cycle[this.attackCount%cycle.length]:{lampist:'light',blaster:'plant',blackmaw:'leap'}[this.kind];}
 recover(){this.phase='recovery';this.recoveryElapsed=0;this.phaseTime=this.pattern==='rush'?1.65:this.kind==='boss'?.95:this.kind==='blackmaw'?.75:this.kind==='blaster'?EXTINCTION_PRESSURE.blasterRecovery:1.45;this.chargeAngle=undefined;}
 update(dt,p,attacks=[],context={}) {
  const modifiers=extinctionModifiers(this,context.depths?.darkness.active);
  modifiers.clock*=depthsRestRate(this,context.depths?.run);
  this.extinctionSpeed=modifiers.speed;
  this.previousX=this.x;this.previousY=this.y;if(!this.tick(dt))return;this.age+=dt;this.phaseTime-=dt*modifiers.clock;
  if(this.phase==='positioning') {
   this.reposition(dt,p);const d=Math.hypot(p.x-this.x,p.y-this.y);
   if(this.phaseTime>0||this.kind==='blaster'&&d>65||this.kind==='blackmaw'&&d>220||this.kind==='lampist'&&(d<145||d>310))return;
   if(isPureProjectile(this,this.nextPattern())&&!projectileMuzzleClear(this,p,5))return;if(!context.depths?.begin(this,this.nextPattern(),p)){this.phaseTime=isPureProjectile(this,this.nextPattern())?0:.18;return;}this.attackCount++;
   // A planted charge stays on the ground while its owner visibly retreats.
   if(this.pattern==='plant'){this.recover();return;}
  }
  if(this.phase==='warning'&&isPureProjectile(this)){this.phaseTime=0;if(!projectileMuzzleClear(this,p,5))return;}
  if(this.phase==='warning'&&this.phaseTime<=0) {
   const spec=DEPTHS_PATTERNS[this.pattern];
   if(spec.seconds){this.phase='charge';this.phaseTime=spec.seconds;}
   else if(context.depths?.release(this))this.recover();else this.phaseTime=.2;
  } else if(this.phase==='charge') {
   const spec=DEPTHS_PATTERNS[this.pattern];this.x+=Math.cos(this.chargeAngle)*spec.speed*dt;this.y+=Math.sin(this.chargeAngle)*spec.speed*dt;clampToRoom(this,ROOM);
   if(this.phaseTime<=0||this.x<=ROOM.left+this.radius||this.x>=ROOM.right-this.radius||this.y<=ROOM.top+this.radius||this.y>=ROOM.bottom-this.radius)this.recover();
  } else if(this.phase==='recovery') {
   this.recoveryElapsed+=dt*modifiers.clock;
   const moveAfter=this.kind==='boss'?(this.pattern==='rush'?.7:.18):.3;
   if(this.recoveryElapsed>moveAfter)this.reposition(dt,p,this.kind==='blaster');
   if(this.phaseTime<=0){this.phase='positioning';this.phaseTime=this.kind==='boss'?.3:this.kind==='blaster'?EXTINCTION_PRESSURE.blasterRest:.65;}
  }
 }
 hit(damage,angle,force){super.hit(damage,angle,this.kind==='boss'||this.fixedPosition?0:force);}
}
