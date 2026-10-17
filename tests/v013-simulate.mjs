import {writeFile} from 'node:fs/promises';
import {Run} from '../src/run.js';
import {UpgradeFlow} from '../src/upgrades.js';
import {steer} from './run-helpers.js';
const reports=[];
for(const weaponId of ['shotgun','smg'])for(const startSeed of [1,9,16,42,77,123,300,999]) {
  let seed=startSeed;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const r=new Run(rng,{}, {weaponId,rewardRandom:()=>.99}),f=new UpgradeFlow(r,rng);
  const choose=()=>f.choose(['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn'].find(id=>f.offered.some(c=>c.id===id)));
  f.open();choose();let maxAlive=0,shots=0,badShots=0;const waves=[];let previous=0;
  for(let i=0;i<54000&&r.status==='playing';i++) {
    const input=steer(r),events=r.update(1/60,input);if(f.afterCombat())choose();
    maxAlive=Math.max(maxAlive,r.enemies.length);
    const fired=events.filter(e=>e.type==='shot').length;shots+=fired;if(input.x||input.y)badShots+=fired;
    if(r.waveNumber!==previous){waves.push({wave:r.waveNumber,time:r.elapsed,hp:r.player.hp});previous=r.waveNumber;}
  }
  const report={weaponId,seed:startSeed,status:r.status,wave:r.waveNumber,kills:r.kills,seconds:r.elapsed,hp:r.player.hp,perks:f.history,maxAlive,shots,badShots,rewards:r.collectedRewards,waves};
  reports.push(report);console.log(JSON.stringify({...report,waves:undefined}));
}
await writeFile(new URL('./v013-simulation-report.json',import.meta.url),JSON.stringify(reports,null,2));
