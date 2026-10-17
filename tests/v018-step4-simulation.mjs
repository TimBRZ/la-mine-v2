import {Run} from './legacy-volley-run.js';
import {TRACKS} from './v021-final-src-snapshot/zones.js';
import {UpgradeFlow,UPGRADES} from './v021-final-src-snapshot/upgrades.js';
import {EPIC_UPGRADES} from './v021-final-src-snapshot/epic-upgrades.js';
import {railBossPilot} from './rail-boss-pilot.js';
export function simulateBosses({weaponId='shotgun',seed=1,boss=0,rank=2,talents=[]}={}) {
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const levels={power:rank,health:rank,mechanics:rank,mobility:rank};
 const run=new Run(random,levels,{world:TRACKS,weaponId,rewardRandom:()=>.99,talents,talentRandom:()=>.99}),flow=new UpgradeFlow(run,random);
 const priority=weaponId==='smg'?['critical-heat','trigger','heat','plates','boots','piercing','magazine']:['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn'];
 const choose=()=>flow.choose(priority.find(id=>flow.offered.some(p=>p.id===id))||flow.offered[0].id);
 if(boss){
   // Legal prefix, same number of choices as a run reaching this checkpoint.
   const build=weaponId==='shotgun'?['trigger','buckshot','boots','plates','double','double-cannon']:['trigger','heat','boots','plates','trigger','critical-heat'];
   const count=boss===5?2:boss===10?3:boss===15?4:6;
   for(const id of build.slice(0,count)){[...UPGRADES,...EPIC_UPGRADES].find(p=>p.id===id).apply(run);run.upgradeRanks[id]=(run.upgradeRanks[id]||0)+1;}
   run.waveIndex=boss-2;run.wavePhase='cleared';run.enterNextWave();
 }else{flow.open();choose();}
 let wave=0,start=0,maxAlive=0,maxBolts=0,maxHazards=0,maxSummons=0,maxDrops=0,frames=0,work=0;
 const times=[],bossTimes=[];
 for(;frames<900*60&&run.status==='playing';frames++){
   if(run.wave.boss&&run.wavePhase==='combat'&&wave!==run.waveNumber){wave=run.waveNumber;start=run.elapsed;}
   const input=railBossPilot(run),at=performance.now(),events=run.update(1/60,input);const elapsed=performance.now()-at;work+=elapsed;times.push(elapsed);
   maxAlive=Math.max(maxAlive,run.enemies.length);maxBolts=Math.max(maxBolts,run.hostileProjectiles.pool.filter(p=>p.active).length);maxHazards=Math.max(maxHazards,run.enemies.reduce((s,e)=>s+(e.hazards?.length||0),0));maxSummons=Math.max(maxSummons,run.enemies.filter(e=>e.summoner).length);maxDrops=Math.max(maxDrops,run.loot.activeCount);
   if(run.wave.boss&&events.some(e=>e.type==='wave-loot')){bossTimes.push({wave:run.waveNumber,seconds:run.elapsed-start,hp:run.player.hp});if(boss)break;}
   if(flow.afterCombat())choose();
 }
 times.sort((a,b)=>a-b);
 return {weaponId,boss,rank,status:run.status,wave:run.waveNumber,hp:run.player.hp,seconds:run.elapsed,bossTimes,maxAlive,maxBolts,maxHazards,maxSummons,maxDrops,kills:run.kills,choices:flow.count,rewards:run.collectedRewards,meanMs:work/times.length,p95Ms:times[Math.floor(times.length*.95)]};
}
