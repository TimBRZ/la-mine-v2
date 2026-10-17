import {ForgeBossDirector,updateBossHazard} from './boss-director.js';
import {BOSS_KITS,BOSS_ULTIMATES} from './boss-patterns.js';
import {ROOM} from '../config.js';import {RiftProjectiles} from '../rift/combat.js';import {FORGE_LIMITS,FORGE_PATTERNS,FORGE_PLATES} from './config.js';import {forgeTouches,forgeEscapeReport} from './geometry.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function forgeLane(e,a,length,width=12){const dx=Math.cos(a),dy=Math.sin(a),tx=dx>0?(ROOM.right-e.radius-e.x)/dx:dx<0?(ROOM.left+e.radius-e.x)/dx:Infinity,ty=dy>0?(ROOM.bottom-e.radius-e.y)/dy:dy<0?(ROOM.top+e.radius-e.y)/dy:Infinity,l=Math.max(0,Math.min(length,tx,ty));return {shape:'line',x:e.x,y:e.y,x2:e.x+dx*l,y2:e.y+dy*l,width};}
export class ForgeGround{
 constructor(run){this.run=run;this.clear();}
 clear(){this.items=[];this.until=5;this.rejected=0;}
 request(owner,points,spec={}){
  if(this.items.some(h=>h.owner===owner)||this.items.length+points.length>FORGE_LIMITS.ground||spec.heat&&this.items.filter(h=>h.heat).length+points.length>FORGE_LIMITS.heat)return false;
  const candidates=points.map((p,i)=>({shape:'circle',radius:36,...p,owner,heat:!!spec.heat,major:!!spec.major,warning:spec.warning+(spec.stagger||0)*i,warningTotal:spec.warning+(spec.stagger||0)*i,active:false,remaining:spec.duration,elapsed:0,cooling:0,damage:.5,order:spec.stagger?i+1:0}));
  if(!forgeEscapeReport([...this.items.filter(h=>!h.cooling),...candidates],this.run.player).ok){this.rejected++;return false;}
  this.items.push(...candidates);return true;
 }
 update(dt,run,events){
  this.items=this.items.filter(h=>h.owner===0?(run.spawned<run.wave.total||run.enemies.some(e=>e.alive)):run.enemies.some(e=>e.alive&&e.id===h.owner));
  for(const h of this.items){if(h.cooling){h.cooling-=dt;if(h.cooling<=0)h.done=true;continue;}if(!h.active){h.warning-=dt;if(h.warning<=0)h.active=true;}else {h.elapsed+=dt;h.remaining-=dt;if(h.remaining<=0){h.active=false;h.cooling=.3;continue;}}if(h.dungeon)updateBossHazard(h,dt);if(h.active&&forgeTouches(h,run.player))run.damagePlayer(h.damage,events);}
  this.items=this.items.filter(h=>!h.done);
  if(!run.wave.heatInterval||run.wavePhase!=='combat'||run.spawned>=run.wave.total&&!run.enemies.some(e=>e.alive))return;
  this.until-=dt;if(this.until<=0){const point=run.forge.nearestPlates(1)[0];this.until=this.request(0,[point],{warning:1.3,duration:2.3,heat:true})?run.wave.heatInterval:.65;}
 }
}
export class ForgeCombat{
 constructor(run){this.run=run;this.ground=new ForgeGround(run);this.shots=new RiftProjectiles();this.director=new ForgeBossDirector(this);}
 nearestPlates(count){const p=this.run.player;return FORGE_PLATES.filter(a=>!this.ground.items.some(h=>h.shape==='plate'&&h.x===a.x&&h.y===a.y)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,count).map(p=>({...p,shape:'plate'}));}
 majorOwners(){const ids=new Set();for(const e of this.run.enemies)if(e.alive&&e.kind==='boss'&&e.major&&['warning','charge'].includes(e.phase))ids.add(e.id);for(const h of this.ground.items)if(h.major&&!h.cooling)ids.add(h.owner);for(const b of this.shots.pool)if(b.active&&b.bossMajor)ids.add(b.owner);return ids;}
 begin(e,pattern,p){
  if(e.kind==='boss'&&(BOSS_KITS[e.bossId]?.includes(pattern)||BOSS_ULTIMATES[e.bossId]===pattern))return this.director.start(e,pattern);
  const spec=FORGE_PATTERNS[pattern],owners=this.majorOwners();
  if(pattern==='scorch'&&this.run.enemies.filter(b=>b.alive&&b.kind==='scorifier'&&['warning','charge'].includes(b.phase)).length>=FORGE_LIMITS.rushes)return false;
  if(spec.major&&(owners.has(e.id)||owners.size>=FORGE_LIMITS.majors))return this.lightFallback(e,pattern,p);
  const angle=Math.atan2(p.y-e.y,p.x-e.x);let points=[];
  if(['heat','plates','general'].includes(pattern)){let count=pattern==='plates'&&e.hp<e.maxHealth*.5?3:spec.ground;const free=FORGE_LIMITS.heat-this.ground.items.filter(h=>h.heat).length;if(pattern==='plates')count=Math.min(count,free);if(count<1)return this.lightFallback(e,pattern,p);points=this.nearestPlates(count);}
  else if(pattern==='scorch')points=[forgeLane(e,angle,spec.speed*spec.seconds)];
  else if(pattern==='jet')points=[{shape:'cone',x:e.x,y:e.y,angle,spread:.6,radius:180}];
  else if(pattern==='slam')points=[{x:clamp(e.x,135,315),y:clamp(e.y,230,560),radius:34,impactRadius:86}];
  else if(pattern==='doubleSlam')points=[{x:clamp(p.x-65,125,325),y:clamp(p.y,220,580),radius:68},{x:clamp(p.x+65,125,325),y:clamp(p.y+75,220,580),radius:68}];
  else if(pattern==='tap')points=[{x:clamp(p.x,90,360),y:clamp(p.y,180,600),radius:38}];
  else if(pattern==='valves')points=Array.from({length:4},(_,i)=>forgeLane(e,angle+i*Math.PI/2,115,12));
  if(spec.count&&!this.shots.reserve(e,spec.count))return false;
  if(points.length&&!this.ground.request(e.id,points,{...spec,warning:spec.warning+(pattern==='scorch'?spec.seconds:0)}))return this.lightFallback(e,pattern,p);
  Object.assign(e,{pattern,major:spec.major,phase:'warning',phaseTime:spec.warning,attackAngle:angle,chargeAngle:spec.seconds?angle:undefined});
  e.shotAngles=pattern==='ring'?Array.from({length:7},(_,i)=>angle+(i+1)*Math.PI/4):spec.count?Array.from({length:spec.count},(_,i)=>angle+(i-(spec.count-1)/2)*(pattern==='steam'?.28:.17)):[];return true;
 }
 lightFallback(e,pattern,p){const fallback=e.kind==='boss'?(e.bossId==='hammer'?'tap':'rivets'):null;return fallback&&fallback!==pattern&&!this.majorOwners().has(e.id)?this.begin(e,fallback,p):false;}
 release(e){const spec=FORGE_PATTERNS[e.pattern];if(!spec.count)return true;const ok=this.shots.emit(e,e.shotAngles,{speed:spec.speed,range:350,major:spec.major,radius:4});if(ok)for(const b of this.shots.pool)if(b.active&&b.owner===e.id)b.spec.color=0xffd6a0;return ok;}
 updateActor(e,dt,attacks,context){e.update(dt,this.run.player,attacks,{...context,forge:this});}
 pending(){return this.ground.items.length>0||this.shots.pool.some(b=>b.active);}
}
