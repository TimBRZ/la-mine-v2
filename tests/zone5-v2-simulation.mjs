import {Run} from '../src/run.js';import {Run as BeforeRun} from './zone5-v2-before-src/run.js';
import {UpgradeFlow} from '../src/upgrades.js';import {energyPilot} from './zone5-pilot.js';import {buildPriority} from './zone5-simulation.mjs';import {writeFile} from 'node:fs/promises';
// Both versions receive the same legal pilot, loadout and RNG seed. No immunity.
export function v2Run(weaponId,seed=1,previous=false){
 const initialSeed=seed,random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296),Model=previous?BeforeRun:Run;
 const r=new Model(random,{power:2,health:2,mechanics:2,mobility:2},{zoneId:'depths',weaponId,rewardRandom:()=>.99,talentRandom:()=>.99}),f=new UpgradeFlow(r,random),priority=buildPriority(weaponId);
 const choose=()=>f.choose(priority.find(id=>f.offered.some(p=>p.id===id))||f.offered[0].id);f.open();choose();
 const waves={};let dangerCooldown=0;const caps={projectiles:0,ground:0,charges:0,majors:0,leaps:0};
 for(let i=0;i<1800*60&&r.status==='playing';i++){
  const n=r.waveNumber,combat=r.wavePhase==='combat',input=energyPilot(r);r.update(1/60,input);
  const ground=r.depths.ground.items,bolts=r.hostileProjectiles.pool.filter(b=>b.active),enemies=r.enemies.filter(e=>e.alive),majors=r.depths.majorOwners().size;
  const w=waves[n]||={seconds:0,combatSeconds:0,movingSeconds:0,dangerSeconds:0,dangerEpisodes:0,enemySeconds:0,groundSeconds:0,darkSeconds:0,damageTaken:0,hp:0};w.seconds+=1/60;w.hp=r.player.hp;w.damageTaken=r.damageTaken;
  // Reproducible proxy: simultaneous nearby committed attacks, incoming bolts or ground warnings.
  const near=e=>Math.hypot(e.x-r.player.x,e.y-r.player.y),sources=new Set(enemies.filter(e=>['warning','charge'].includes(e.phase)&&near(e)<320).map(e=>e.id));
  for(const b of bolts)if(near(b)<160)sources.add(b.owner);for(const h of ground)if(near(h)<(h.radius||40)+90)sources.add(h.owner);
  dangerCooldown=Math.max(0,dangerCooldown-1/60);if(combat){w.combatSeconds+=1/60;w.movingSeconds+=(input.x||input.y)?1/60:0;w.enemySeconds+=enemies.length/60;w.groundSeconds+=ground.length/60;w.darkSeconds+=r.depths.darkness.active?1/60:0;if(sources.size>=2){w.dangerSeconds+=1/60;if(!dangerCooldown)w.dangerEpisodes++;dangerCooldown=2;}}
  caps.projectiles=Math.max(caps.projectiles,bolts.length);caps.ground=Math.max(caps.ground,ground.length);caps.charges=Math.max(caps.charges,ground.filter(h=>h.charge).length);caps.majors=Math.max(caps.majors,majors);caps.leaps=Math.max(caps.leaps,enemies.filter(e=>e.kind==='blackmaw'&&['warning','charge'].includes(e.phase)).length);
  if(f.afterCombat())choose();
 }
 const total=k=>Object.values(waves).reduce((s,w)=>s+w[k],0);return {weaponId,seed:initialSeed,previous,status:r.status,wave:r.waveNumber,seconds:r.elapsed,damageTaken:r.damageTaken,hp:r.player.hp,dangerSeconds:total('dangerSeconds'),dangerEpisodes:total('dangerEpisodes'),bossSeconds:Object.fromEntries([5,10,15,20].map(n=>[n,waves[n]?.combatSeconds??null])),caps,waves};
}
if(process.argv[1]?.endsWith('zone5-v2-simulation.mjs')){
 const pairs=[];for(const weapon of ['shotgun','smg','grisoux'])for(const seed of [1,2,3]){const before=v2Run(weapon,seed,true),after=v2Run(weapon,seed);pairs.push({before,after});console.log(JSON.stringify({weapon,seed,before:{status:before.status,seconds:before.seconds,damage:before.damageTaken,danger:before.dangerSeconds},after:{status:after.status,wave:after.wave,seconds:after.seconds,damage:after.damageTaken,danger:after.dangerSeconds},caps:after.caps}));}
 await writeFile(new URL('./zone5-v2-simulations.json',import.meta.url),JSON.stringify({method:'Same pilot/Atelier 2/seeds 1–3. Danger = >=2 nearby threat owners; episode split by 2 s without overlapping threats. No forced damage or immunity.',pairs},null,2));
}
