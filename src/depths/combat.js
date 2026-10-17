import {DepthsBossDirector} from './boss-director.js';
import {bossHazardTouches,PATTERN_LABELS} from './boss-patterns.js';
import {ROOM} from '../config.js';
import {segmentCircle} from '../math.js';
import {RiftProjectiles} from '../rift/combat.js';
import {spreadAngles} from '../rift/config.js';
import {DEPTHS_LIMITS,DEPTHS_PATTERNS,DEPTHS_CYCLES} from './config.js';
import {EXTINCTION_PRESSURE as PRESSURE} from './pressure.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function depthsHazardTouches(h,p){if(h.shape)return bossHazardTouches(h,p);return Number.isFinite(h.x2)?segmentCircle(h.x,h.y,h.x2,h.y2,p.x,p.y,h.width+p.radius)!==null:Math.hypot(h.x-p.x,h.y-p.y)<h.radius+p.radius;}
export function lane(e,a,length=460){const dx=Math.cos(a),dy=Math.sin(a),tx=dx>0?(ROOM.right-e.x)/dx:dx<0?(ROOM.left-e.x)/dx:Infinity,ty=dy>0?(ROOM.bottom-e.y)/dy:dy<0?(ROOM.top-e.y)/dy:Infinity,l=Math.min(length,tx,ty);return {x:e.x,y:e.y,x2:e.x+dx*l,y2:e.y+dy*l};}
export class DepthsGround {
 constructor(){this.items=[];}
 clear(){this.items=[];}
 request(owner,points,spec={}) {
  if(this.items.some(h=>h.owner===owner)||this.items.length+points.length>DEPTHS_LIMITS.ground||spec.charge&&this.items.filter(h=>h.charge).length+points.length>DEPTHS_LIMITS.charges)return false;
  points.forEach((p,i)=>{const radius=spec.radius||38,line=Number.isFinite(p.x2);this.items.push({...p,x:line?p.x:clamp(p.x,ROOM.left+radius+8,ROOM.right-radius-8),y:line?p.y:clamp(p.y,ROOM.top+radius+8,ROOM.bottom-radius-8),owner,radius,width:spec.width||10,warning:spec.warning+(spec.stagger||0)*i,remaining:spec.duration,active:false,damage:.5,charge:!!spec.charge,major:!!spec.major,environment:spec.environment===true,order:spec.stagger?i+1:0,kind:spec.environment?'rock':line?'fissure':'explosion'});});return true;
 }
 update(dt,run,events) {
  this.items=this.items.filter(h=>h.environment?(run.spawned<run.wave.total||run.enemies.some(e=>e.alive)):run.enemies.some(e=>e.alive&&e.id===h.owner));
  for(const h of this.items){if(h.controlled){if(h.active&&depthsHazardTouches(h,run.player))run.damagePlayer(h.damage,events);continue;}if(!h.active){h.warning-=dt;if(h.warning<=0)h.active=true;}else h.remaining-=dt;if(h.active&&depthsHazardTouches(h,run.player))run.damagePlayer(h.damage,events);}
  this.items=this.items.filter(h=>h.remaining>0);
 }
}
export class Extinctions {
 constructor(run){this.run=run;this.clear();}
 get lateWave(){return this.run?.waveNumber>=16&&this.run?.waveNumber<=19;}
 get advanced(){return this.run?.waveNumber>=11&&this.run?.waveNumber<=19;}
 get finalLate(){return this.run?.wave.final&&this.run.enemies.reduce((s,e)=>s+Math.max(0,e.hp),0)<this.run.tripleStartingHealth*.5;}
 get rockChance(){return this.finalLate?PRESSURE.finalLateRockChance:this.advanced?PRESSURE.advancedRockChance:PRESSURE.rockChance;}
 clear(){this.remaining=0;this.prelude=0;this.restored=0;this.until=this.lateWave?4.5:this.advanced?6:this.run?.wave.final?6:9;this.cooldown=0;this.count=0;this.rocksAttempted=false;this.rockEvents=0;}
 start(final=false){if(this.remaining>0||this.cooldown>0)return false;this.remaining=final?2:3;this.prelude=PRESSURE.prelude;this.restored=0;this.rocksAttempted=false;const tier=final?(this.finalLate?'finalLate':'final'):this.lateWave?'late':this.advanced?'advanced':'normal';this.until=PRESSURE[tier+'Interval'];this.cooldown=PRESSURE[tier+'Cooldown'];this.count++;return true;}
 update(dt,run){
  const active=this.active;
  this.restored=Math.max(0,this.restored-dt);
  // The visual prelude is separate: no hidden haste or ground damage beforehand.
  if(this.prelude>0){const elapsed=Math.min(this.prelude,dt);this.prelude=Math.max(0,this.prelude-dt);this.remaining=Math.max(0,this.remaining-(dt-elapsed));}
  else this.remaining=Math.max(0,this.remaining-dt);
  if(active&&!this.active)this.restored=PRESSURE.returnLight;
  this.cooldown=Math.max(0,this.cooldown-dt);this.until=Math.max(0,this.until-dt);
  if(this.until===0&&(run.enemies.some(e=>e.alive)||run.spawned<run.wave.total))this.start(run.wave.final);
  if(this.active&&!this.rocksAttempted){this.rocksAttempted=true;if(run.random()<this.rockChance&&run.depths?.requestExtinctionRocks())this.rockEvents++;}
 }
 get active(){return this.remaining>0&&this.prelude===0;}
 get notice(){return this.prelude>0?'ALERTE · EXTINCTION IMMINENTE':this.active?(this.run?.wave.boss?'EXTINCTION · DANGERS VISIBLES':'EXTINCTION · ENNEMIS PLUS VIFS'):this.restored>0?'COURANT RÉTABLI':'';}
}
export class DepthsCombat {
 constructor(run){this.run=run;this.ground=new DepthsGround();this.shots=new RiftProjectiles();this.darkness=new Extinctions(run);this.bosses=new DepthsBossDirector(this);}
 majorOwners(){const ids=new Set();for(const e of this.run.enemies)if(e.alive&&e.kind==='boss'&&e.major&&['warning','charge'].includes(e.phase))ids.add(e.id);for(const h of this.ground.items)if(h.major)ids.add(h.owner);for(const b of this.shots.pool)if(b.active&&b.bossMajor)ids.add(b.owner);return ids;}
 begin(e,pattern,p) {
  if(PATTERN_LABELS[pattern])return this.bosses.start(e,pattern);
  // Paired lunges remain readable even when several melee reinforcements wait.
  if(e.kind==='blackmaw'&&this.run.enemies.filter(b=>b.alive&&b.kind==='blackmaw'&&['warning','charge'].includes(b.phase)).length>=2)return false;
  // A shared blackout cooldown cannot produce a misleading EXTINCTION warning.
  // Continue the boss cycle while the lighting is still recovering.
  if(pattern==='blackout'&&this.darkness.cooldown>DEPTHS_PATTERNS.blackout.warning){const cycle=DEPTHS_CYCLES[e.bossId];return this.begin(e,cycle[(cycle.indexOf(pattern)+1)%cycle.length],p);}
  const spec=DEPTHS_PATTERNS[pattern],owners=this.majorOwners();
  const rockSlot=this.run.wave.final&&this.ground.items.some(h=>h.environment)?1:0;
  if(spec.major&&(owners.has(e.id)||owners.size+rockSlot>=DEPTHS_LIMITS.majors)){
   // A third boss can contribute a light pattern instead of waiting for a turn.
   const light=e.final&&!owners.has(e.id)?{lampmajor:'light',dynamiter:'lob'}[e.bossId]:null;
   return light?this.begin(e,light,p):false;
  }
  const angle=Math.atan2(p.y-e.y,p.x-e.x);
  let points=[];
  if(spec.ground) {
   if(pattern==='beam')points=[lane(e,angle)];
   else if(pattern==='cracks')points=[-.75,0,.75].map(offset=>lane(e,angle+offset,240));
   else if(pattern==='slam')points=[e];
   else if(pattern==='plant')points=[{x:e.x+Math.cos(angle)*20,y:e.y+Math.sin(angle)*20}];
   else if(pattern==='charges')points=[[-85,0],[0,75],[85,0]].map(([x,y])=>({x:clamp(p.x,160,290)+x,y:clamp(p.y,225,520)+y}));
   else if(pattern==='chain')points=[-1,0,1].map(i=>({x:clamp(p.x,160,290)+i*90,y:clamp(p.y,240,530)+i*50}));
   else points=[p];
   if(!this.ground.request(e.id,points,spec))return false;
  }
  if(spec.count&&!this.shots.reserve(e,spec.count))return false;
  Object.assign(e,{pattern,major:spec.major,phase:'warning',phaseTime:spec.warning,attackAngle:angle,chargeAngle:spec.seconds?angle:undefined});
  // The missing eighth direction is a deliberate safe passage in the slow ring.
  e.shotAngles=pattern==='ring'?Array.from({length:7},(_,i)=>angle+Math.PI/4+i*Math.PI/4):spec.count?spreadAngles(angle,spec.count,pattern==='fan'?Math.PI*.7:Math.PI*.2):[];
  return true;
 }
 release(e) {
  const spec=DEPTHS_PATTERNS[e.pattern];
  if(e.pattern==='blackout')this.darkness.start(this.run.wave.final);
  if(!spec.count)return true;
  return this.shots.emit(e,e.shotAngles,{speed:spec.speed,range:300,major:spec.major,radius:5});
 }
 requestExtinctionRocks(){
  if(this.run.enemies.some(e=>e.alive&&e.bossSequence?.plan.ultimate&&e.phase!=='recovery'))return false;
  const r=this.run;if(r.wavePhase!=='combat'||r.spawned>=r.wave.total&&!r.enemies.some(e=>e.alive))return false;
  // In the triple, rocks reserve one major-pressure slot until they disappear.
  if(r.wave.final&&this.majorOwners().size>=DEPTHS_LIMITS.majors)return false;
  const x=clamp(r.player.x,100,350),y=clamp(r.player.y,185,595),side=x>225?-1:1;
  const points=[{x,y},{x:x+side*105,y:y+(y>390?-80:80)}];
  // Prefer three in late waves, fall back to two if only two slots are free.
  if(this.darkness.lateWave&&this.ground.items.length<=2)points.push({x:x+side*25,y:y+(y>390?-150:150)});
  return this.ground.request(0,points,{environment:true,warning:PRESSURE.rockWarning,duration:PRESSURE.rockDuration,radius:PRESSURE.rockRadius});
 }
 updateActor(e,dt,attacks,context) {
  if(e.kind==='boss'&&(!e.pattern||e.bossSequence||e.phase==='positioning')){this.bosses.update(e,dt);return;}
  if(e.final&&['positioning','recovery'].includes(e.phase)&&e.pattern!=='rush'){
   const late=this.run.enemies.reduce((s,b)=>s+b.hp,0)<this.run.tripleStartingHealth*.5;e.phaseTime-=dt*(late?.35:.2);
  }
  e.update(dt,this.run.player,attacks,{...context,depths:this});
 }
 pending(){return this.ground.items.length>0||this.shots.pool.some(b=>b.active);}
}
