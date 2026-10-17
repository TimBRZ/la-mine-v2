import {isPureProjectile,projectileMuzzleClear} from '../projectile-attacks.js';
import {Enemy} from '../enemy.js';import {ROOM} from '../config.js';import {clampToRoom} from '../math.js';import {FORGE_ENEMIES,FORGE_BOSSES,FORGE_PATTERNS,FORGE_CYCLES,FORGE_LATE_CYCLES} from './config.js';
export class ForgeActor extends Enemy{
 constructor(id,type,x=225,y=220,{final=false,slot=0}={}){const spec=FORGE_ENEMIES[type]||FORGE_BOSSES[type];super(id,x,y,spec);Object.assign(this,{spec,forgeType:type,kind:FORGE_BOSSES[type]?'boss':type,bossId:FORGE_BOSSES[type]?type:undefined,final,phase:'positioning',phaseTime:.8+slot*.4,attackCount:0,previousX:x,previousY:y,sweptContact:true,recoveryElapsed:0});}
 get fixedPosition(){return !['positioning','recovery'].includes(this.phase);}
 reposition(dt,p){const a=Math.atan2(p.y-this.y,p.x-this.x),d=Math.hypot(p.x-this.x,p.y-this.y),melee=['scorifier','hammer'].includes(this.forgeType),radial=melee?1:d<175?-1:d>255?1:0,side=this.attackCount%2?-.85:.85;let vx=Math.cos(a)*radial-Math.sin(a)*side,vy=Math.sin(a)*radial+Math.cos(a)*side;
  if(this.x<ROOM.left+this.radius+16&&vx<0||this.x>ROOM.right-this.radius-16&&vx>0||this.y<ROOM.top+this.radius+16&&vy<0||this.y>ROOM.bottom-this.radius-16&&vy>0){vx=225-this.x;vy=390-this.y;}const len=Math.hypot(vx,vy)||1,speed=this.spec.speed*(this.kind==='boss'&&this.hp<this.maxHealth*.5?1.12:1);this.angle=a;this.move(dt,vx/len*speed,vy/len*speed);
 }
 nextPattern(run){if(this.kind!=='boss')return this.kind==='stoker'?'heat':this.kind==='scorifier'?'scorch':run?.waveNumber>=11?'rivets':'rivet';const cycles=this.hp<this.maxHealth*.5?FORGE_LATE_CYCLES:FORGE_CYCLES,c=cycles[this.bossId];return c[this.attackCount%c.length];}
 recover(){this.phase='recovery';this.recoveryElapsed=0;this.phaseTime=this.pattern==='ram'?1.5:this.kind==='boss'?.9:this.kind==='scorifier'?.7:this.kind==='stoker'?1:1.1;this.chargeAngle=undefined;}
 update(dt,p,attacks=[],context={}){this.previousX=this.x;this.previousY=this.y;if(!this.tick(dt))return;const run=context.forge?.run,rest=['positioning','recovery'].includes(this.phase),late=this.hp<this.maxHealth*.5,globalLate=this.final&&run?.enemies.reduce((s,b)=>s+Math.max(0,b.hp),0)<run?.tripleStartingHealth*.5;const rate=rest&&this.kind==='boss'?(late?1.32:1.12)+(this.final?(globalLate?.35:.2):0):1;this.phaseTime-=dt*rate;
  if(this.phase==='positioning'){this.reposition(dt,p);if(this.phaseTime>0||this.kind==='scorifier'&&Math.hypot(p.x-this.x,p.y-this.y)>230)return;if(isPureProjectile(this,this.nextPattern(run))&&!projectileMuzzleClear(this,p,5))return;if(!context.forge?.begin(this,this.nextPattern(run),p)){this.phaseTime=isPureProjectile(this,this.nextPattern(run))?0:.18;return;}this.attackCount++;}
  if(this.phase==='warning'&&isPureProjectile(this)){this.phaseTime=0;if(!projectileMuzzleClear(this,p,5))return;}
  if(this.phase==='warning'&&this.phaseTime<=0){const spec=FORGE_PATTERNS[this.pattern];if(spec.seconds){this.phase='charge';this.phaseTime=spec.seconds;}else if(context.forge?.release(this))this.recover();else this.phaseTime=.2;}
  else if(this.phase==='charge'){const s=FORGE_PATTERNS[this.pattern];this.x+=Math.cos(this.chargeAngle)*s.speed*dt;this.y+=Math.sin(this.chargeAngle)*s.speed*dt;clampToRoom(this,ROOM);if(this.phaseTime<=0||this.x<=ROOM.left+this.radius||this.x>=ROOM.right-this.radius||this.y<=ROOM.top+this.radius||this.y>=ROOM.bottom-this.radius)this.recover();}
  else if(this.phase==='recovery'){this.recoveryElapsed+=dt*rate;if(this.recoveryElapsed>(this.pattern==='ram'?.65:.18))this.reposition(dt,p);if(this.phaseTime<=0){this.phase='positioning';this.phaseTime=this.kind==='boss'?.22:.5;}}
 }
 hit(d,a,f){super.hit(d,a,this.kind==='boss'||this.fixedPosition?0:f);}
}
