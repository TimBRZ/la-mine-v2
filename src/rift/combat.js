import {noteProjectileEmission} from '../projectile-attacks.js';
import {ROOM} from '../config.js';import {segmentCircle} from '../math.js';
import {EnemyProjectiles} from '../enemy-projectiles.js';
import {RIFT_LIMITS,RIFT_PATTERNS,radialAngles,spreadAngles} from './config.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function riftHazardTouches(h,p){return h.kind==='fissure'?segmentCircle(h.x,h.y,h.x2,h.y2,p.x,p.y,h.width+p.radius)!==null:Math.hypot(h.x-p.x,h.y-p.y)<h.radius+p.radius;}
export class RiftGround {
 constructor(){this.items=[];this.until=4;this.sequence=0;}
 clear(){this.items=[];this.until=4;}
 request(owner,points,{warning=1.5,duration=1,radius=38,damage=.5,label='GRISOU !',kind='gas'}={}){
  if(this.items.length+points.length>RIFT_LIMITS.ground||this.items.some(h=>h.owner===owner))return false;
  if(kind==='fissure'&&points.length>RIFT_LIMITS.fissures)return false;
  for(const p of points)this.items.push({owner,x:clamp(p.x,ROOM.left+radius+12,ROOM.right-radius-12),y:clamp(p.y,ROOM.top+radius+12,ROOM.bottom-radius-12),x2:p.x2,y2:p.y2,width:10,radius,warning,remaining:duration,active:false,damage,label,kind});
  return true;
 }
 update(dt,run,events){
  this.items=this.items.filter(h=>h.owner===0||run.enemies.some(e=>e.id===h.owner&&e.alive));
  for(const h of this.items){if(!h.active){h.warning-=dt;if(h.warning<=0)h.active=true;}else h.remaining-=dt;if(h.active&&riftHazardTouches(h,run.player))run.damagePlayer(h.damage,events);}
  this.items=this.items.filter(h=>h.remaining>0);
  if(!run.wave.gasInterval||run.wave.boss||run.spawned>=run.wave.total&&!run.enemies.some(e=>e.alive))return;
  this.until-=dt;if(this.until<=0){const seq=this.sequence++,points=[{x:105+(seq%2)*235,y:240+(seq%3)*145},{x:340-(seq%2)*235,y:490-(seq%2)*170}];
   if(this.request(0,points,{warning:1.65,duration:seq%2?2.2:.55,radius:40,kind:seq%2?'gas':'explosion'})){this.until=run.wave.gasInterval;events.push({type:'rift-gas',quote:'Ça, faut surtout pas marcher dedans.'});}else this.until=.5;
  }
 }
}
export class RiftProjectiles extends EnemyProjectiles {
 constructor(){super();this.pool=Array.from({length:RIFT_LIMITS.projectiles},(_,id)=>({id,active:false}));this.bursts=[];}
 free(){return this.pool.filter(p=>!p.active).length-[...this.reservations.values()].reduce((s,n)=>s+n,0);}
 reserve(owner,count){if(this.reservations.has(owner.id)||this.pool.some(p=>p.active&&p.owner===owner.id)||this.bursts.some(b=>b.owner===owner.id)||this.free()<count)return false;this.reservations.set(owner.id,count);return true;}
 emit(owner,angles,{speed=105,range=290,orb=false,major=true,radius=5}={}){
  const held=this.reservations.get(owner.id)||0;
  if(this.free()+held<angles.length)return false;
  const left=held-angles.length;if(left>0)this.reservations.set(owner.id,left);else this.reservations.delete(owner.id);
  for(const angle of angles){const b=this.pool.find(p=>!p.active),m=owner.radius+radius+2;Object.assign(b,{active:true,owner:owner.id,angle,distance:0,x:owner.x+Math.cos(angle)*m,y:owner.y+Math.sin(angle)*m,bossMajor:major&&owner.kind==='boss',bossFan:false,orb,spec:{speed,range,radius,damage:.5,color:orb?0xd4ee72:0x85e8c3}});}noteProjectileEmission(owner);return true;
 }
 warnBurst(owner,x,y,death=false){if(this.bursts.some(b=>b.owner===owner))return;this.bursts.push({owner,x:clamp(x,50,400),y:clamp(y,138,644),warning:1.1,death});}
 update(dt,p,previous,onHit){
  const orbs=this.pool.filter(b=>b.active&&b.orb);super.update(dt,p,previous,onHit);
  for(const b of orbs)if(!b.active){b.orb=false;this.warnBurst(b.owner,b.x,b.y);}
  for(const b of this.bursts){b.warning-=dt;if(b.warning<=0&&this.emit({id:b.owner,x:b.x,y:b.y,radius:0,kind:'burst'},radialAngles(0,6),{speed:95,range:230,major:false})){b.done=true;}}
  this.bursts=this.bursts.filter(b=>!b.done);
 }
 clear(){super.clear();this.bursts=[];}
}
export class RiftCombat {
 constructor(run){this.run=run;this.ground=new RiftGround();this.shots=new RiftProjectiles();}
 majorOwners(){const r=this.run,ids=new Set();for(const b of r.enemies)if(b.kind==='boss'&&b.alive&&b.major&&['warning','burst','charge'].includes(b.phase))ids.add(b.id);for(const h of this.ground.items)if(h.owner&&r.enemies.some(b=>b.id===h.owner&&b.kind==='boss'))ids.add(h.owner);for(const b of this.shots.pool)if(b.active&&b.bossMajor)ids.add(b.owner);for(const id of this.shots.reservations.keys())if(r.enemies.some(b=>b.id===id&&b.kind==='boss'&&b.major))ids.add(id);return ids;}
 begin(e,pattern,p){
  const spec=RIFT_PATTERNS[pattern],others=this.majorOwners();others.delete(e.id);
  if(spec.major&&(this.ground.items.some(h=>h.owner===e.id)||this.shots.pool.some(b=>b.active&&b.owner===e.id&&b.bossMajor)))return false;
  if(this.run.wave.final&&spec.major&&others.size>=RIFT_LIMITS.majors)return false;
  if(spec.count&&!this.shots.reserve(e,spec.count))return false;
  let points=[];
  if(spec.ground){
   if(pattern==='fissures'){const horizontal=e.attackCount%2===0;points=Array.from({length:3},(_,i)=>horizontal?{x:70,y:230+i*150,x2:380,y2:230+i*150}:{x:115+i*110,y:165,x2:115+i*110,y2:615});}
   else if(spec.ground===4)points=[[-85,-85],[85,-85],[-85,85],[85,85]].map(([x,y])=>({x:clamp(p.x,155,295)+x,y:clamp(p.y,265,515)+y}));
   else points=[pattern==='blast'?e:p];
   if(!this.ground.request(e.id,points,{warning:spec.warning,duration:spec.duration,radius:pattern==='blast'?58:spec.ground===4?34:38,kind:pattern==='fissures'?'fissure':pattern==='spit'?'gas':'explosion'}))return false;
  }
  e.pattern=pattern;e.major=spec.major;e.phase='warning';e.phaseTime=spec.warning;e.attackAngle=Math.atan2(p.y-e.y,p.x-e.x);e.chargeAngle=pattern==='charge'?e.attackAngle:undefined;
  e.shotAngles=pattern==='fan8'?spreadAngles(e.attackAngle,8,Math.PI*.72):pattern==='cone'?spreadAngles(e.attackAngle,5,Math.PI*.6):['double','circle8'].includes(pattern)?radialAngles(e.attackCount*.23,8):pattern==='orb'?[e.attackAngle]:[];
  return true;
 }
 release(e,second=false){const spec=RIFT_PATTERNS[e.pattern];if(!spec.count)return true;const angles=second?e.shotAngles.map(a=>a+Math.PI/8):e.shotAngles;return this.shots.emit(e,angles,{speed:spec.speed,range:e.pattern==='orb'?160:290,orb:e.pattern==='orb',major:spec.major,radius:e.pattern==='orb'?10:5});}
 updateActor(e,dt,attacks,context){if(e.kind==='boss'&&e.final&&['positioning','recovery'].includes(e.phase)){const late=this.run.enemies.filter(b=>b.kind==='boss').reduce((s,b)=>s+b.hp,0)<this.run.tripleStartingHealth*.5;e.phaseTime-=dt*(1/(late?.58:.78)-1);}e.update(dt,this.run.player,attacks,{...context,rift:this});}
 deaths(events){for(const event of events)if(event.type==='kill'){const e=this.run.enemies.find(e=>e.id===event.id);if(e?.kind==='burster')this.shots.warnBurst(e.id,e.x,e.y,true);}}
 pending(){return this.ground.items.length>0||this.shots.bursts.length>0||this.shots.pool.some(b=>b.active);}
 canSpawn(kind){return kind!=='burster'||this.shots.bursts.length<RIFT_LIMITS.deathWarnings-2;}
}
