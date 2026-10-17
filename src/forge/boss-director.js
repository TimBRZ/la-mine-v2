import {FORGE_LIMITS} from './config.js';
import {BOSS_KITS,BOSS_ULTIMATES,COMBO_NAMES,makeBossPlan,makeComboPlans} from './boss-patterns.js';
import {bossEscapeRoute,projectBossHazard} from './boss-safety.js';
import {prepareBossMobility,moveBossAttack,driftingHazard} from './boss-mobility.js';
import {makeBossLight} from './boss-light.js';
import {forgeEscapeReport} from './geometry.js';
import {distanceBand} from './boss-pressure.js';
export function bossHazards(e,ev){return ev.points.map(p=>driftingHazard({...p,owner:e.id,planId:e.plan?.id,attackToken:e.plan?.token,dungeon:true,heat:ev.heat,major:e.plan?.attackClass!=='LIGHT',warning:ev.warning,warningTotal:ev.warning,active:false,remaining:ev.duration,duration:ev.duration,elapsed:0,cooling:0,damage:.5},e.plan||{}));}
export class ForgeBossDirector{
 constructor(combat){this.combat=combat;this.comboIndex=0;this.nextCombo=0;this.history=[];this.rejected=0;}
 get run(){return this.combat.run;}
 record(event){this.history.push({time:this.run.elapsed,...event});if(this.history.length>160)this.history.shift();}
 select(e){if(!e.final&&!e.ultimateUsed&&e.hp<=e.maxHealth*.25)return BOSS_ULTIMATES[e.bossId];const kit=BOSS_KITS[e.bossId];if(e.bossId==='hammer'&&e.hp<e.maxHealth*.5&&e.attackCount%3===2)return 'forgeRhythm';if(distanceBand(e,this.run.player)==='TOO_CLOSE'&&e.attackCount%3===1)return {furnace:['sectors','whiteMarch'],hammer:['counterStroke','targetStrike'],boiler:['sideValves','pressureWave']}[e.bossId][Math.floor(e.attackCount/3)%2];return kit[e.attackCount%kit.length];}
 start(e,id,plan=makeBossPlan(e,id,this.run.player)){
  const major=plan.attackClass!=='LIGHT';
  if(e.plan||e.dungeonRecovery||e.phase==='recovery'||major&&this.combat.majorOwners().size>=FORGE_LIMITS.majors)return false;
  if(!major&&this.combat.ground.items.some(h=>h.owner===e.id&&!h.major&&!h.cooling))return false;
  plan.token=e.attackCount+1;
  plan.attackClass=major?'MAJOR':'LIGHT';prepareBossMobility(e,plan,this.run.player,this.run.enemies);
  Object.assign(e,{plan,pattern:id,major,phase:'warning',phaseTime:plan.events[0].warning,attackAngle:Math.atan2(this.run.player.y-e.y,this.run.player.x-e.x)});
  if(plan.ultimate)e.ultimateUsed=true;
  e.attackCount++;e.patternUses[id]=(e.patternUses[id]||0)+1;this.record({type:'start',boss:e.bossId,id,attackClass:plan.attackClass});return true;
 }
 tryCombo(){
  const bosses=this.run.enemies.filter(e=>e.alive&&e.final&&e.forgeType&&e.active);
  if(bosses.length<2||this.run.elapsed<this.nextCombo||this.combat.majorOwners().size)return false;
  for(let i=0;i<3;i++){
   const name=COMBO_NAMES[(this.comboIndex+i)%3],pairs=makeComboPlans(name,bosses,this.run.player);
   if(pairs.length!==2)continue;
   // Do not skip a temporarily busy pair: that would repeatedly favour the
   // shortest combo and starve pressureCadence. A dead member may be skipped.
   if(pairs.some(([e])=>e.plan||e.dungeonRecovery||e.phase==='recovery'))return false;
   for(const [e,p]of pairs){p.combo=true;this.start(e,name,p);}
   this.comboIndex=(this.comboIndex+i+1)%3;this.record({type:'combo',id:name});
   this.nextCombo=this.run.elapsed+(this.run.enemies.reduce((s,b)=>s+b.hp,0)<this.run.tripleStartingHealth*.5?2.4:2.8);
   return true;
  }return false;
 }
 beginReady(e){
  const light=(brief=false)=>this.start(e,'light-'+e.bossId,makeBossLight(e,this.run.player,{brief,cadence:this.run.enemies.some(b=>b.plan?.id==='pressureCadence')}));
  if(e.final&&this.run.enemies.filter(b=>b.alive&&b.final).length>=2){
   if(this.tryCombo()||e.plan)return !!e.plan;
   const owners=this.combat.majorOwners();
   // A free boss does not wait for everyone else's recovery. During a pair's
   // combo it contributes one small danger, without taking a third major slot.
   const bosses=this.run.enemies.filter(b=>b.alive&&b.final),next=COMBO_NAMES[this.comboIndex];
   const pair=makeComboPlans(next,bosses,this.run.player);
   if(this.run.elapsed>=this.nextCombo&&pair.length===2){
    if(pair.some(([b])=>b===e)){
     const partner=pair.find(([b])=>b!==e)?.[0];
     const wait=partner?.plan?Math.max(0,partner.plan.end-partner.plan.time)+partner.plan.recovery:partner?.dungeonRecovery?partner.phaseTime:0;
     // A short local action fills a long partner delay; never interrupt a
     // recovery or delay a pair that is already almost ready.
     return wait>2.1?light(true):false;
    }
    return light();
   }
   if(owners.size>=2||this.run.enemies.some(b=>b.plan?.combo))return light();
   // Keep the next pair available when its combo is due, but allow a light
   // while another boss recovers. No global movement-only cooldown.
   if(this.run.elapsed>=this.nextCombo&&owners.size===0){
    const others=this.run.enemies.filter(b=>b!==e&&b.alive&&b.final);
    if(others.some(b=>b.dungeonRecovery))return light();
   }
   return this.start(e,this.select(e));
  }
  return this.start(e,this.select(e));
 }
 admit(e,ev){
  const g=this.combat.ground,c=bossHazards(e,ev);
  if(g.items.length+c.length>FORGE_LIMITS.ground||g.items.filter(h=>h.heat).length+c.filter(h=>h.heat).length>FORGE_LIMITS.heat)return false;
  // A postponed admission must not collapse the validated wave/impact cadence.
  for(const a of c)for(const b of g.items){
   if(b.cooling||a.planId!=='pressureCadence'&&b.planId!=='pressureCadence')continue;
   if(!([a.shape,b.shape].includes('wave')&&[a.shape,b.shape].includes('circle')))continue;
   const start=b.active?0:Math.max(0,b.warning),end=start+b.remaining;
   if(a.warning<end&&a.warning+a.remaining>start)return false;
  }
  const report=bossEscapeRoute([...g.items,...c],this.run.player,Math.min(4,ev.warning+ev.duration));
  if(!report.ok){this.rejected++;return false;}
  // In triple, retain a broad connected cold region as well as a timed route.
  // Check the projected moving/rotating geometry, not merely its first frame.
  if(e.final)for(let t=0;t<=ev.warning+ev.duration;t+=.2){
   const live=[...g.items,...c].filter(h=>!h.cooling&&(h.active?t<h.remaining:t<h.warning+h.remaining));
   if(!forgeEscapeReport(live.map(h=>projectBossHazard(h,t)),this.run.player).spans){this.rejected++;return false;}
  }
  g.items.push(...c);return true;
 }
 update(e,dt,p){
  const plan=e.plan;
  if(!plan)return;
  if(plan.retry>0){plan.retry-=dt;return;}
  // Only the initial cone anticipation may track, at a bounded angular speed.
  if(!plan.locked){
   const h=plan.events[0].points[0],target=Math.atan2(p.y-e.y,p.x-e.x),delta=Math.atan2(Math.sin(target-h.angle),Math.cos(target-h.angle));
   h.angle+=Math.max(-.65*dt,Math.min(.65*dt,delta));e.attackAngle=h.angle;
   for(const live of this.combat.ground.items)if(live.owner===e.id&&live.shape==='cone')live.angle=h.angle;
   if(plan.time+dt>=plan.tracking){plan.locked=true;this.record({type:'lock',boss:e.bossId,id:plan.id,angle:h.angle});}
  }
  const ev=plan.events[plan.index];
  if(ev&&plan.time+dt>=ev.at){
   if(!this.admit(e,ev)){plan.retry=.2;e.phase='warning';return;}
   this.record({type:'telegraph',boss:e.bossId,id:plan.id,order:plan.index+1});plan.index++;
  }
  plan.time+=dt;
  moveBossAttack(e,plan,plan.time);
  for(const h of this.combat.ground.items)if(h.owner===e.id&&h.drift)h.driftTime=plan.time;
  const owned=this.combat.ground.items.filter(h=>h.owner===e.id&&h.attackToken===plan.token&&!h.cooling);
  e.phase=owned.some(h=>h.active)?'charge':'warning';
  e.phaseTime=Math.max(0,plan.events[0].warning-plan.time);
  if(plan.index===plan.events.length&&plan.time>=plan.end&&(plan.attackClass==='LIGHT'||!owned.length)){
   e.plan=null;e.phase='recovery';e.phaseTime=plan.recovery;e.dungeonRecovery=true;e.major=false;
   this.record({type:'recovery',boss:e.bossId,id:plan.id,duration:plan.recovery});
  }
 }
}
export function updateBossHazard(h,dt){
 const next=projectBossHazard(h);if(h.drift){h.x=next.x;h.y=next.y;}
 if(h.active){if(h.shape==='arm')h.angle=next.angle;if(h.shape==='wave')h.radius=next.radius;}
}
