// Frozen V0.21 replay for historical assertions; live runs use v022-simulation.mjs.
import {Run} from './v021-final-src-snapshot/run.js';
import {UpgradeFlow} from './v021-final-src-snapshot/upgrades.js';
import {energyPilot} from './v021-pilot.js';
export function simulateV021({weaponId='grisoux',zoneId='galleries',seed=1,rank=2}={}) {
  const initialSeed=seed;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const r=new Run(random,{power:rank,health:rank,mechanics:rank,mobility:rank},{weaponId,zoneId,rewardRandom:()=>.99}),f=new UpgradeFlow(r,random);
  const priorities=weaponId==='smg'?['critical-heat','trigger','heat','plates','boots','piercing','magazine']:weaponId==='grisoux'?['double-cannon','trigger','plates','boots','double','grisou']:['double-cannon','buckshot','trigger','plates','boots','double','grisou','sawn'];
  const choose=()=>f.choose(priorities.find(id=>f.offered.some(p=>p.id===id))||f.offered[0].id);
  f.open();choose();let maxBolts=0,movingShots=0,volleys=0;
  for(let i=0;i<900*60&&r.status==='playing';i++){
    const input=energyPilot(r),events=r.update(1/60,input);if(f.afterCombat())choose();
    movingShots+=events.filter(e=>e.type==='shot'&&(input.x||input.y)).length;
    volleys+=events.filter(e=>e.type==='enemy-shot'&&e.fan).length;
    maxBolts=Math.max(maxBolts,r.hostileProjectiles.pool.filter(b=>b.active).length);
  }
  return {weaponId,zoneId,seed:initialSeed,rank,status:r.status,wave:r.waveNumber,hp:r.player.hp,seconds:r.elapsed,kills:r.kills,choices:f.count,rewards:r.collectedRewards,maxBolts,movingShots,volleys};
}
