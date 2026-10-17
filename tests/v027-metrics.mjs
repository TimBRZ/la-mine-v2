import {Run} from '../src/run.js';
export function riftMetrics(late=false){
 const r=new Run(()=>.5,{}, {zoneId:'rift'});r.waveIndex=18;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';r.weapon.cooldown=999;r.damagePlayer=()=>false;if(late)for(const b of r.enemies)b.hp=b.maxHealth*.49;
 let dual=0,triple=0,major=0,bolts=0,ground=0,calm=0,longestCalm=0,sumBolts=0;const distance={},patterns={};
 for(let i=0;i<64*60;i++){
  const prev=r.enemies.map(e=>({id:e.id,x:e.x,y:e.y,phase:e.phase}));r.update(1/60,{x:Math.cos(i/170),y:Math.sin(i/170)});
  const active=new Set();for(const e of r.enemies){const p=prev.find(p=>p.id===e.id);if(p&&['positioning','recovery'].includes(p.phase))distance[e.bossId]=(distance[e.bossId]||0)+Math.hypot(e.x-p.x,e.y-p.y);if(['warning','burst','charge'].includes(e.phase))active.add(e.id);if(e.phase==='warning'&&p?.phase!=='warning')patterns[e.bossId+':'+e.pattern]=(patterns[e.bossId+':'+e.pattern]||0)+1;}
  for(const b of r.hostileProjectiles.pool)if(b.active)active.add(b.owner);for(const h of r.shaftHazards.items)active.add(h.owner);
  if(i>=240){dual+=active.size>=2?1/60:0;triple+=active.size>=3?1/60:0;calm=active.size?0:calm+1/60;longestCalm=Math.max(longestCalm,calm);sumBolts+=r.hostileProjectiles.pool.filter(b=>b.active).length;}
  major=Math.max(major,r.rift.majorOwners().size);bolts=Math.max(bolts,r.hostileProjectiles.pool.filter(b=>b.active).length);ground=Math.max(ground,r.shaftHazards.items.length);
 }
 return {late,dual,triple,major,bolts,ground,longestCalm,meanBolts:sumBolts/3600,distance,patterns};
}
