import { Run } from './legacy-volley-run.js';
import { TRACKS } from './v021-final-src-snapshot/zones.js';
import { WORLD } from './v021-final-src-snapshot/world.js';
import { UpgradeFlow } from './v021-final-src-snapshot/upgrades.js';
import { tacticalPilot } from './tactical-pilot.js';
import { skipReservedBoss } from './tracks-normal-qa.js';
export function simulateNormals({weaponId='shotgun',seed=1,galleries=false,levels={}}={}) {
 const world=galleries?WORLD:TRACKS;
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const run=new Run(random,levels,{world,weaponId,rewardRandom:()=>.99}),flow=new UpgradeFlow(run,random);
 const priorities=weaponId==='smg'?['critical-heat','trigger','heat','plates','boots','piercing','magazine']:['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn'];
 const choices=[];const choose=()=>{choices.push({wave:run.waveNumber,epic:flow.offered.some(p=>p.epic)});flow.choose(priorities.find(id=>flow.offered.some(p=>p.id===id))||flow.offered[0].id);};flow.open();choose();
 const waves=[],times=[];let done=false,maxAlive=0,maxBolts=0,maxDrops=0,moves=0,enemyShots=0,badShots=0,spawnUnsafe=0,overlapFrames=0,start=0,wave=0;
 const spawn=run.spawn.bind(run);run.spawn=()=>{const ok=spawn();if(ok){const e=run.enemies.at(-1);if(Math.hypot(e.x-run.player.x,e.y-run.player.y)<=(e.kind==='wagon'?140:180))spawnUnsafe++;}return ok;};
 for(let i=0;i<72000&&run.status==='playing'&&!done;i++){
   if(run.waveNumber!==wave){wave=run.waveNumber;start=run.elapsed;}
   const input=tacticalPilot(run),at=performance.now(),events=run.update(1/60,input);times.push(performance.now()-at);
   moves+=Number(Boolean(input.x||input.y));enemyShots+=events.filter(e=>e.type==='enemy-shot').length;
   if(input.x||input.y)badShots+=events.filter(e=>e.type==='shot').length;
   maxAlive=Math.max(maxAlive,run.enemies.length);maxBolts=Math.max(maxBolts,run.hostileProjectiles.pool.filter(p=>p.active).length);maxDrops=Math.max(maxDrops,run.loot.activeCount);
   if(run.enemies.filter(e=>e.active&&['warning','charge','burst'].includes(e.phase)).length>=2)overlapFrames++;
   if(events.some(e=>e.type==='wave-clear'))waves.push({wave,hp:run.player.hp,seconds:run.elapsed-start,kills:run.waveKills});
   if(flow.afterCombat())choose();done=skipReservedBoss(run);
 }
 times.sort((a,b)=>a-b);
 return {weaponId,done,status:run.status,wave:run.waveNumber,hp:run.player.hp,kills:run.kills,seconds:run.elapsed,damage:run.damageTaken,movementFraction:moves/times.length,enemyShots,maxAlive,maxBolts,maxDrops,badShots,spawnUnsafe,overlapSeconds:overlapFrames/60,choices,waves,rewards:run.collectedRewards,meanMs:times.reduce((s,t)=>s+t,0)/times.length,p95Ms:times[Math.floor(times.length*.95)]};
}
