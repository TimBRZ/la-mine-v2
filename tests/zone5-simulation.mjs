import {Run} from '../src/run.js';import {UpgradeFlow} from '../src/upgrades.js';import {instantFirePilot as energyPilot} from './instant-fire-pilot.js';
export function buildPriority(weaponId){return weaponId==='grisoux'?['double-cannon','conduit','plates','rapid-coil','trigger','reinforced-conduit','energy-overload','energy-arc','boots','capacitor','grisou']:weaponId==='smg'?['critical-heat','heat','plates','trigger','boots','piercing','magazine','grisou']:['double-cannon','buckshot','plates','trigger','boots','double','grisou','sawn'];}
export function simulateZone5({weaponId='grisoux',zoneId='depths',seed=1,rank=2,talents=[],priority=buildPriority(weaponId),pilot=energyPilot}={}) {
 const initialSeed=seed,random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const r=new Run(random,{power:rank,health:rank,mechanics:rank,mobility:rank},{weaponId,zoneId,talents,talentRandom:()=>.99,rewardRandom:()=>.99}),f=new UpgradeFlow(r,random);
 const choose=()=>f.choose(priority.find(id=>f.offered.some(p=>p.id===id))||f.offered[0].id);f.open();choose();
 let maxBolts=0,movingShots=0,fans=0,start=0,wave=0,circles=0,maxSummons=0,maxEntities=0;const bosses=[];let maxMajors=0,maxCharges=0,extinctions=0;const waves={};let maxZones=0,groundWarnings=0;
 for(let i=0;i<1800*60&&r.status==='playing';i++){
  const input=pilot(r),beforeWave=r.waveNumber,events=r.update(1/60,input);
  const w=waves[beforeWave]||={seconds:0,maxBolts:0,maxGround:0,hp:r.player.hp};w.seconds+=1/60;w.hp=r.player.hp;w.maxBolts=Math.max(w.maxBolts,r.hostileProjectiles.pool.filter(b=>b.active).length);w.maxGround=Math.max(w.maxGround,r.shaftHazards?.items.length||0);
  maxMajors=Math.max(maxMajors,r.depths?.majorOwners().size||0);maxCharges=Math.max(maxCharges,r.shaftHazards?.items.filter(h=>h.charge).length||0);if(r.depths?.darkness.active)extinctions+=1/60;
  if(r.wave.boss&&r.wavePhase==='combat'&&wave!==r.waveNumber){wave=r.waveNumber;start=r.elapsed;}
  if(r.wave.boss&&r.wavePhase==='collecting'&&wave===r.waveNumber){bosses.push({wave,seconds:Number((r.elapsed-start).toFixed(2)),hp:r.player.hp});wave=0;}
  if(f.afterCombat())choose();movingShots+=events.filter(e=>e.type==='shot'&&(input.x||input.y)).length;
  maxZones=Math.max(maxZones,r.shaftHazards?.items.length||0);groundWarnings+=events.filter(e=>['shaft-warning','rift-gas'].includes(e.type)).length;circles+=events.filter(e=>e.pattern==='circle').length;maxSummons=Math.max(maxSummons,r.enemies.filter(e=>e.summoner).length);maxEntities=Math.max(maxEntities,r.enemies.length);
  fans+=events.filter(e=>e.type==='enemy-shot'&&e.fan).length;maxBolts=Math.max(maxBolts,r.hostileProjectiles.pool.filter(b=>b.active).length);
 }
 return {weaponId,zoneId,seed:initialSeed,rank,talents,status:r.status,wave:r.waveNumber,hp:r.player.hp,seconds:Number(r.elapsed.toFixed(2)),kills:r.kills,perks:r.upgradeRanks,choices:f.count,rewards:r.collectedRewards,maxBolts,movingShots,fans,circles,maxZones,groundWarnings,maxSummons,maxEntities,bosses,maxMajors,maxCharges,extinctions,waves};
}
