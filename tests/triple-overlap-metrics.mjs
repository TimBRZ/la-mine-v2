import {Run} from '../src/run.js';
import {Run as PreviousRun} from './v024-pre-overlap-src-snapshot/run.js';
export function diagnoseTriple(zoneId,half=false,before=false,CurrentRun=Run) {
 const r=new (before?PreviousRun:CurrentRun)(()=>.5,{}, {zoneId});r.waveIndex=18;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';r.weapon.cooldown=1e6;
 // Diagnostic only: keep all three bosses alive for equal observation windows.
 // No-fire, no-damage instrumentation is never used to establish winnability.
 r.damagePlayer=()=>false;if(half)r.enemies.forEach(b=>b.hp=b.maxHealth*.49);
 let dual=0,triple=0,calm=0,longestCalm=0,maxMajor=0,maxBolts=0,maxZones=0,maxWagons=0,activeDual=0,tripleEngaged=0;const begins={};
 for(let i=0;i<64*60;i++){
  const prior=new Map(r.enemies.filter(e=>e.kind==='boss').map(b=>[b.id,{phase:b.phase,count:b.attackCount}]));
  r.update(1/60,{x:Math.cos(i/150),y:Math.sin(i/150)});
  const bosses=r.enemies.filter(e=>e.kind==='boss'),engaged=new Set(),major=new Set(),danger=new Set();
  for(const b of bosses){if(b.attackCount!==prior.get(b.id)?.count||b.phase==='warning'&&prior.get(b.id)?.phase!=='warning')begins[b.bossId]=(begins[b.bossId]||0)+1;
   if(['warning','charge','burst'].includes(b.phase)){engaged.add(b.id);if(b.phase==='charge')danger.add(b.id);if(b.tripleMajor||b.phase==='charge'||b.bossId==='effondreur'||b.projectilePattern==='circle'||['charge','ram','steam','rails','wagon','front','cable','pressure','gas','blast'].includes(b.pattern)&&!b.shaftType||['front','cable','pressure','gas','blast'].includes(b.pattern))major.add(b.id);}
   if(b.hazards?.length||b.zones?.length){engaged.add(b.id);major.add(b.id);if(b.hazards?.some(h=>h.active)||b.zones?.length&&b.phase==='recovery')danger.add(b.id);}}
  for(const h of r.shaftHazards?.items||[]){engaged.add(h.owner);major.add(h.owner);if(h.active)danger.add(h.owner);}
  for(const p of r.hostileProjectiles.pool)if(p.active){engaged.add(p.owner);danger.add(p.owner);if(p.bossMajor)major.add(p.owner);}
  for(const e of r.enemies)if(e.summoner){engaged.add(e.summoner);major.add(e.summoner);if(e.phase==='charge')danger.add(e.summoner);}
  if(i>=240){tripleEngaged+=bosses.filter(b=>engaged.has(b.id)||Math.hypot(b.x-b.previousX,b.y-b.previousY)>.01).length===3?1/60:0;dual+=engaged.size>=2?1/60:0;triple+=engaged.size===3?1/60:0;activeDual+=danger.size>=2?1/60:0;calm=engaged.size?0:calm+1/60;longestCalm=Math.max(longestCalm,calm);maxMajor=Math.max(maxMajor,major.size);}
  maxBolts=Math.max(maxBolts,r.hostileProjectiles.pool.filter(p=>p.active).length);maxZones=Math.max(maxZones,r.shaftHazards?.items.length||0);maxWagons=Math.max(maxWagons,r.enemies.filter(e=>e.summoner).length);
 }
 return {zoneId,half,before,tripleEngagedSeconds:+tripleEngaged.toFixed(2),dualSeconds:+dual.toFixed(2),tripleSeconds:+triple.toFixed(2),activeDualSeconds:+activeDual.toFixed(2),longestCalm:+longestCalm.toFixed(2),maxMajor,maxBolts,maxZones,maxWagons,begins};
}
