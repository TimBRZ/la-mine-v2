import {Run} from '../src/run.js';import {Run as BeforeRun} from './zone5-balance-before-src/run.js';
import {UpgradeFlow} from '../src/upgrades.js';import {energyPilot} from './zone5-pilot.js';import {buildPriority} from './zone5-simulation.mjs';
import {writeFile} from 'node:fs/promises';
export function pressureTrace({wave=19,previous=false,random=()=>.2}={}){
 const Model=previous?BeforeRun:Run,r=new Model(random,{}, {zoneId:'depths',rewardRandom:()=>.99});r.waveIndex=wave-2;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';r.weapon.cooldown=999;r.damagePlayer=()=>false;
 const out={wave,previous,seconds:60,meanEnemies:0,meanProjectiles:0,meanGround:0,movingBossSeconds:0,darkSeconds:0,maxProjectiles:0,maxGround:0,maxCharges:0,maxMajors:0,maxPressureSlots:0,rockSeconds:0};
 for(let i=0;i<3600;i++){
  r.update(1/60,{x:Math.cos(i/170),y:Math.sin(i/170)});const bolts=r.hostileProjectiles.pool.filter(b=>b.active).length,ground=r.depths.ground.items,majors=r.depths.majorOwners().size,rock=ground.some(h=>h.environment);
  out.meanEnemies+=r.enemies.length/3600;out.meanProjectiles+=bolts/3600;out.meanGround+=ground.length/3600;out.darkSeconds+=r.depths.darkness.active?1/60:0;out.rockSeconds+=rock?1/60:0;
  out.maxProjectiles=Math.max(out.maxProjectiles,bolts);out.maxGround=Math.max(out.maxGround,ground.length);out.maxCharges=Math.max(out.maxCharges,ground.filter(h=>h.charge).length);out.maxMajors=Math.max(out.maxMajors,majors);out.maxPressureSlots=Math.max(out.maxPressureSlots,majors+(r.wave.final&&rock?1:0));
  out.movingBossSeconds+=r.enemies.some(e=>e.kind==='boss'&&Math.hypot(e.x-e.previousX,e.y-e.previousY)>0)?1/60:0;
 }
 return out;
}
export function balanceRun(weaponId,seed=1){
 const initialSeed=seed,random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const r=new Run(random,{power:2,health:2,mechanics:2,mobility:2},{zoneId:'depths',weaponId,rewardRandom:()=>.99,talentRandom:()=>.99}),f=new UpgradeFlow(r,random),priority=buildPriority(weaponId);
 const choose=()=>f.choose(priority.find(id=>f.offered.some(p=>p.id===id))||f.offered[0].id);f.open();choose();
 const waves={};let maxProjectiles=0,maxGround=0,maxCharges=0,maxMajors=0,maxPressureSlots=0,movingShots=0;
 for(let i=0;i<1800*60&&r.status==='playing';i++){
  const n=r.waveNumber,input=energyPilot(r),combat=r.wavePhase==='combat',events=r.update(1/60,input),ground=r.depths.ground.items,bolts=r.hostileProjectiles.pool.filter(b=>b.active).length,majors=r.depths.majorOwners().size;
  const w=waves[n]||={seconds:0,combatSeconds:0,movingSeconds:0,darkSeconds:0,rockSeconds:0,meanEnemies:0,meanProjectiles:0,meanGround:0,hp:0};w.seconds+=1/60;w.hp=r.player.hp;
  if(combat){w.combatSeconds+=1/60;w.movingSeconds+=(input.x||input.y)?1/60:0;w.meanEnemies+=r.enemies.length/60;w.meanProjectiles+=bolts/60;w.meanGround+=ground.length/60;w.darkSeconds+=r.depths.darkness.active?1/60:0;w.rockSeconds+=ground.some(h=>h.environment)?1/60:0;}
  maxProjectiles=Math.max(maxProjectiles,bolts);maxGround=Math.max(maxGround,ground.length);maxCharges=Math.max(maxCharges,ground.filter(h=>h.charge).length);maxMajors=Math.max(maxMajors,majors);maxPressureSlots=Math.max(maxPressureSlots,majors+(r.wave.final&&ground.some(h=>h.environment)?1:0));movingShots+=events.filter(e=>e.type==='shot'&&(input.x||input.y)).length;
  if(f.afterCombat())choose();
 }
 for(const w of Object.values(waves)){for(const k of ['meanEnemies','meanProjectiles','meanGround'])w[k]/=w.combatSeconds||1;for(const k of Object.keys(w))if(typeof w[k]==='number')w[k]=+w[k].toFixed(3);}
 return {weaponId,seed:initialSeed,rank:2,status:r.status,wave:r.waveNumber,seconds:+r.elapsed.toFixed(2),hp:r.player.hp,damageTaken:r.damageTaken,perks:r.upgradeRanks,rewards:r.collectedRewards,maxProjectiles,maxGround,maxCharges,maxMajors,maxPressureSlots,movingShots,waves};
}
if(process.argv[1]?.endsWith('zone5-balance-simulation.mjs')){
 const runs=[];for(const weapon of ['shotgun','smg','grisoux'])for(const seed of [1,2,3]){const r=balanceRun(weapon,seed);runs.push(r);console.log(JSON.stringify({weapon,seed,status:r.status,wave:r.wave,seconds:r.seconds,hp:r.hp}));}
 const traces=[16,17,18,19,20].map(wave=>({before:pressureTrace({wave,previous:true}),after:pressureTrace({wave})}));
 await writeFile(new URL('./zone5-balance-simulations.json',import.meta.url),JSON.stringify({runs,traces},null,2));
}
