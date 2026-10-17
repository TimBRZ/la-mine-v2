import {writeFile} from 'node:fs/promises';import {energyPilot} from './forge-pilot.js';import {buildPriority} from './zone5-simulation.mjs';
const phase=process.argv[2]||'after',root=phase==='before'?'./v031-before-src/':'../src/';
const {Run}=await import(root+'run.js'),{UpgradeFlow}=await import(root+'upgrades.js');
const results=[];
for(const zoneId of ['rift','depths','forge'])for(const weaponId of ['shotgun','smg','grisoux'])for(const initialSeed of [1,2]){
 let seed=initialSeed;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296),r=new Run(rng,{power:2,health:2,mechanics:2,mobility:2},{zoneId,weaponId,rewardRandom:()=>.99,talentRandom:()=>.99}),flow=new UpgradeFlow(r,rng),priority=buildPriority(weaponId),bosses={},waves={};
 const choose=()=>flow.choose(priority.find(id=>flow.offered.some(p=>p.id===id))||flow.offered[0].id);flow.open();choose();
 for(let i=0;i<1800*60&&r.status==='playing';i++){const n=r.waveNumber;r.update(1/60,energyPilot(r));waves[n]=(waves[n]||0)+1/60;if(r.wave.boss&&r.wavePhase==='combat')bosses[n]=(bosses[n]||0)+1/60;if(flow.afterCombat())choose();}
 const result={zoneId,weaponId,seed:initialSeed,rank:2,status:r.status,wave:r.waveNumber,seconds:r.elapsed,damage:r.damageTaken,hp:r.player.hp,kills:r.kills,perks:r.upgradeRanks,bosses,waves};results.push(result);console.log(JSON.stringify(result));
 await writeFile(new URL('v031-'+phase+'-zones.json',import.meta.url),JSON.stringify(results,null,2));
}
