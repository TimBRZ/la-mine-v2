// Historical V0.22 replay; current boss patterns use v023-simulation.mjs.
import {Run} from './v022-final-src-snapshot/run.js';import {UpgradeFlow} from './v022-final-src-snapshot/upgrades.js';import {energyPilot} from './v022-pilot.js';
export function buildPriority(weaponId){return weaponId==='grisoux'?['double-cannon','conduit','plates','rapid-coil','trigger','reinforced-conduit','energy-overload','energy-arc','boots','capacitor','grisou']:weaponId==='smg'?['critical-heat','heat','plates','trigger','boots','piercing','magazine','grisou']:['double-cannon','buckshot','plates','trigger','boots','double','grisou','sawn'];}
export function simulateV022({weaponId='grisoux',zoneId='galleries',seed=1,rank=2,talents=[],priority=buildPriority(weaponId)}={}) {
 const initialSeed=seed,random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const r=new Run(random,{power:rank,health:rank,mechanics:rank,mobility:rank},{weaponId,zoneId,talents,talentRandom:()=>.99,rewardRandom:()=>.99}),f=new UpgradeFlow(r,random);
 const choose=()=>f.choose(priority.find(id=>f.offered.some(p=>p.id===id))||f.offered[0].id);f.open();choose();
 let maxBolts=0,movingShots=0,fans=0,start=0,wave=0;const bosses=[];
 for(let i=0;i<1200*60&&r.status==='playing';i++){
  const input=energyPilot(r),events=r.update(1/60,input);
  if(r.wave.boss&&r.wavePhase==='combat'&&wave!==r.waveNumber){wave=r.waveNumber;start=r.elapsed;}
  if(r.wave.boss&&r.wavePhase==='collecting'&&wave===r.waveNumber){bosses.push({wave,seconds:Number((r.elapsed-start).toFixed(2)),hp:r.player.hp});wave=0;}
  if(f.afterCombat())choose();movingShots+=events.filter(e=>e.type==='shot'&&(input.x||input.y)).length;
  fans+=events.filter(e=>e.type==='enemy-shot'&&e.fan).length;maxBolts=Math.max(maxBolts,r.hostileProjectiles.pool.filter(b=>b.active).length);
 }
 return {weaponId,zoneId,seed:initialSeed,rank,talents,status:r.status,wave:r.waveNumber,hp:r.player.hp,seconds:Number(r.elapsed.toFixed(2)),kills:r.kills,perks:r.upgradeRanks,choices:f.count,rewards:r.collectedRewards,maxBolts,movingShots,fans,bosses};
}
