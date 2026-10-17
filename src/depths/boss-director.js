import {ROOM} from '../config.js';
import {clampToRoom} from '../math.js';
import {DEPTHS_LIMITS} from './config.js';
import {BOSS_KITS,LATE_KITS,ULTIMATES,makeBossPlan,point,ray,clamp} from './boss-patterns.js';

// Only this controller owns the new boss state machine. Standard enemies keep their clock.
export class DepthsBossDirector {
 constructor(combat){this.combat=combat;this.run=combat.run;this.nextCombo=7;this.comboIndex=0;this.history=[];this.stamp=-1;}
 clearOwner(e){this.combat.ground.items=this.combat.ground.items.filter(h=>h.owner!==e.id||!h.controlled);}
 busy(){return this.combat.majorOwners();}
 canStart(e,major=true,ultimate=false){
  const c=this.combat,others=this.busy();
  if(c.ground.items.some(h=>h.owner===e.id)||c.shots.pool.some(b=>b.active&&b.owner===e.id))return false;
  const ultimateBoss=this.run.enemies.find(b=>b.alive&&b.bossSequence?.plan.ultimate&&b.phase!=='recovery');
  if(ultimateBoss&&ultimateBoss!==e)return false;
  // Queue a living boss's threshold attack: finish committed dangers, then grant an exclusive slot.
  if(!ultimate&&major&&this.run.enemies.some(b=>b.alive&&b.kind==='boss'&&b.hp<=b.maxHealth*.25&&!b.ultimateUsed))return false;
  if(ultimate&&(others.size||c.ground.items.length||c.shots.pool.some(b=>b.active)))return false;
  return !major||others.size+(c.ground.items.some(h=>h.environment)?1:0)<DEPTHS_LIMITS.majors;
 }
 start(e,pattern,custom){
  const plan=custom||makeBossPlan(e,this.run.player,pattern),major=pattern!=='major-dark';
  if(!this.canStart(e,major,plan.ultimate))return false;
  e.bossSequence={plan,index:0,state:'pending',elapsed:0,geometry:[],hits:0};e.pattern=pattern;e.major=major;e.phase='warning';e.phaseTime=0;e.attackCount++;
  if(plan.ultimate)e.ultimateUsed=true;
  this.history.push({time:this.run.elapsed||0,boss:e.bossId,pattern,ultimate:!!plan.ultimate});if(this.history.length>200)this.history.shift();
  return true;
 }
 coordinate(dt){
  if(this.stamp===this.run.elapsed)return;this.stamp=this.run.elapsed;
  if(!this.run.wave.final){this.nextCombo=7;return;}
  this.nextCombo-=dt;if(this.nextCombo>0)return;
  const find=id=>this.run.enemies.find(e=>e.alive&&e.active&&e.bossId===id&&!e.bossSequence&&e.phase==='positioning');
  const pairs=[['lampmajor','dynamiter'],['lampmajor','blackmass'],['dynamiter','blackmass']];
  const [aId,bId]=pairs[this.comboIndex%3],a=find(aId),b=find(bId);
  if(!a||!b||this.busy().size||this.combat.ground.items.length||this.combat.shots.pool.some(s=>s.active))return;
  // Freeze the shared plan once; the second boss never retargets the player's later position.
  const p={...this.run.player},corridor=ray(b,Math.atan2(p.y-b.y,p.x-b.x),800,b.radius);
  const base=(steps)=>({steps,recovery:1.25,ultimate:false});
  let pa,pb,name;
  if(this.comboIndex%3===0){name='combo-light';pa=base([{label:'SUIS LA BANDE CLAIRE',warning:1.2,duration:4.2,geometry:()=>[],guide:'light'}]);pb=base([130,290,180].map((x,i)=>({label:'CHARGES HORS LUMIÈRE · '+(i+1),warning:i?1.3:1.4,duration:.35,safeBand:x,geometry:()=>[{shape:'rect',x:ROOM.left,y:ROOM.top+8,w:x-55-ROOM.left,h:ROOM.bottom-ROOM.top-16,charge:true},{shape:'rect',x:x+55,y:ROOM.top+8,w:ROOM.right-x-55,h:ROOM.bottom-ROOM.top-16,charge:true}]})));}
  else if(this.comboIndex%3===1){name='combo-corridor';pa=base([{label:'COULOIR = CHARGE',warning:.9,duration:3.1,geometry:()=>[],guide:'corridor',corridor}]);pb=base([{label:'CHARGE DANS LE COULOIR',warning:1.6,duration:1.7,geometry:()=>[{...corridor}],rush:310}]);}
  else {name='combo-heavy';pa=base([{label:'DÉMOLITION AVANT LE SLAM',warning:1.3,duration:1.4,sequence:true,geometry:()=>[-1,1].map((side,n)=>({shape:'circle',...point({x:p.x+side*95,y:p.y},55),radius:44,charge:true,delay:n*.65,life:.32,order:n+1}))}]);pb=base([{label:'SLAM APRÈS LES EXPLOSIONS',warning:3,duration:.35,geometry:e=>[{shape:'circle',x:e.x,y:e.y,radius:100}]}]);}
  if(this.start(a,name,{...pa,pattern:name})&&this.start(b,name,{...pb,pattern:name})){a.comboPartner=b.id;b.comboPartner=a.id;this.comboIndex++;const late=this.run.enemies.reduce((n,b)=>n+Math.max(0,b.hp),0)<this.run.tripleStartingHealth*.5;this.nextCombo=late?6.5:8;}
 }
 prepare(e){
  const s=e.bossSequence,step=s.plan.steps[s.index],c=this.combat;
  const geometry=step.geometry(e,this.run.player).map(h=>({...h}));
  const slots=Math.min(3,geometry.length),charges=geometry.filter(h=>h.charge).length;
  if(c.ground.items.length+Math.min(geometry.length,step.sequence?3:4)>DEPTHS_LIMITS.ground||charges&&c.ground.items.filter(h=>h.charge).length+Math.min(charges,slots)>DEPTHS_LIMITS.charges)return false;
  if(step.fragments&&!c.shots.reserve(e,step.fragments))return false;
  Object.assign(s,{state:step.tracking?'tracking':'locked',elapsed:0,geometry,origin:{x:e.x,y:e.y},base:geometry.map(h=>({...h})),step});
  e.phase='warning';e.phaseTime=(step.tracking||0)+step.warning;e.chargeAngle=step.rush?Math.atan2(geometry[0].y2-e.y,geometry[0].x2-e.x):undefined;e.attackAngle=geometry[0]?.shape==='line'?Math.atan2(geometry[0].y2-e.y,geometry[0].x2-e.x):e.angle;
  this.syncHazards(e);return true;
 }
 syncHazards(e){
  const s=e.bossSequence,step=s.step,c=this.combat;this.clearOwner(e);
  const active=s.state==='active',elapsed=active?s.elapsed:0;
  const visible=s.geometry.filter(h=>!step.sequence||!active||elapsed<(h.delay||0)+(h.life||.32)).slice(0,step.sequence?3:4);
  for(const h of visible)c.ground.items.push({...h,owner:e.id,controlled:true,major:e.major,kind:Number.isFinite(h.x2)?'fissure':'explosion',damage:.5,warning:active?Math.max(0,(h.delay||0)-elapsed):Math.max(0,e.phaseTime),remaining:1,active:active&&(!step.sequence||elapsed>=(h.delay||0)&&elapsed<(h.delay||0)+(h.life||.32))});
 }
 finish(e){this.clearOwner(e);e.phase='recovery';e.phaseTime=e.bossSequence.plan.recovery;e.bossSequence.state='recovery';e.chargeAngle=undefined;e.major=false;e.recoveryElapsed=0;}
 update(e,dt){
  this.coordinate(dt);e.previousX=e.x;e.previousY=e.y;if(!e.tick(dt))return;e.age+=dt;
  let s=e.bossSequence;
  if(!s){
   e.phase='positioning';e.phaseTime-=dt;e.reposition(dt,this.run.player);if(e.phaseTime>0)return;
   const ultimate=e.hp<=e.maxHealth*.25&&!e.ultimateUsed;
   // When a combo is due, let two bosses meet at readiness without freezing their movement.
   if(this.run.wave.final&&this.nextCombo<=0&&!ultimate){const wait=e.comboWait=(e.comboWait||0)+dt;if(wait<2.2)return;e.comboWait=0;}
   const kit=e.hp<e.maxHealth*.5?LATE_KITS[e.bossId]:BOSS_KITS[e.bossId];
   if(!this.start(e,ultimate?ULTIMATES[e.bossId]:kit[e.attackCount%kit.length])){e.phaseTime=.12;return;}
   s=e.bossSequence;
  }
  if(s.state==='pending'){if(!this.prepare(e))return;}
  if(s.state==='recovery'){
   e.phaseTime-=dt;e.recoveryElapsed+=dt;
   if(e.phaseTime<=0){e.bossSequence=null;e.phase='positioning';e.phaseTime=e.final?.35:e.hp<e.maxHealth*.5?.4:.6;}
   return;
  }
  const step=s.step;if(s.plan.pattern==='major-blackout'&&s.index>0)this.combat.darkness.remaining=Math.max(.25,this.combat.darkness.remaining);s.elapsed+=dt;e.phaseTime=Math.max(0,e.phaseTime-dt);
  if(s.state==='tracking'){
   s.geometry=step.geometry(e,this.run.player);s.base=s.geometry.map(h=>({...h}));e.attackAngle=Math.atan2(s.geometry[0].y2-e.y,s.geometry[0].x2-e.x);
   if(s.elapsed>=step.tracking){s.state='locked';s.elapsed=0;e.phaseTime=step.warning;}
  } else if(s.state==='locked'&&s.elapsed>=step.warning){s.state='active';s.elapsed=0;e.phase='charge';e.phaseTime=step.duration;
   if(step.dark){cDark(this.combat,e.final);}
  }
  if(s.state==='active'){
   const t=Math.min(1,s.elapsed/step.duration);
   if(step.sweep){const a=Math.atan2(s.base[0].y2-s.origin.y,s.base[0].x2-s.origin.x)+step.sweep*t;s.geometry=[ray(s.origin,a,700,17)];}
   if(step.cross){s.geometry=s.base.map((h,i)=>({...h,x:h.x+(i?80*t:0),x2:h.x2+(i?80*t:0),y:h.y+(i?0:110*t),y2:h.y2+(i?0:110*t)}));}
   if(step.grow)s.geometry=s.base.map(h=>({...h,x2:h.x+(h.x2-h.x)*Math.max(.12,t),y2:h.y+(h.y2-h.y)*Math.max(.12,t)}));
   if(step.wave)s.geometry=s.base.map(h=>({...h,inner:85+110*t,radius:110+110*t}));
   if(step.rush){e.x+=Math.cos(e.chargeAngle)*step.rush*dt;e.y+=Math.sin(e.chargeAngle)*step.rush*dt;clampToRoom(e,ROOM);s.geometry=[];if(e.x<=ROOM.left+e.radius||e.x>=ROOM.right-e.radius||e.y<=ROOM.top+e.radius||e.y>=ROOM.bottom-e.radius)s.elapsed=step.duration;}
   if(step.reposition||step.toCenter){const dest=step.toCenter?{x:225,y:391}:point({x:450-s.origin.x,y:s.origin.y+80},80),d=Math.hypot(dest.x-e.x,dest.y-e.y);if(d>1){const l=Math.min(d,(step.toCenter?140:90)*dt);e.x+=(dest.x-e.x)/d*l;e.y+=(dest.y-e.y)/d*l;clampToRoom(e,ROOM);}}
   if(s.elapsed>=step.duration){
    if(step.fragments){const h=s.base[0];if(!this.combat.shots.emit({...e,x:h.x,y:h.y,radius:0},Array.from({length:6},(_,i)=>i*Math.PI/3),{speed:95,range:210,major:true,radius:5}))return;}
    this.clearOwner(e);s.index++;if(s.index>=s.plan.steps.length){this.finish(e);return;}s.state='pending';e.phase='warning';e.phaseTime=0;return;
   }
  }
  this.syncHazards(e);
 }
}
function cDark(c,final){c.darkness.remaining=final?2:3;c.darkness.prelude=0;c.darkness.cooldown=Math.max(c.darkness.cooldown,5);c.darkness.until=Math.max(c.darkness.until,6);c.darkness.rocksAttempted=true;c.darkness.count++;}
