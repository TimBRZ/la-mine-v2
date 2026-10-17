import {writeFile} from 'node:fs/promises';
import {simulate} from './v014-simulation.mjs';
const reports=[];
const measure=options=>{const start=performance.now(),result=simulate(options);result.cpuMs=performance.now()-start;reports.push(result);};
for(const weaponId of ['shotgun','smg']) {
  for(let seed=1;seed<=30;seed++)measure({weaponId,seed});
  for(const seed of [1,2,3,7,8,9,11,12,18,24])measure({weaponId,seed,levels:{power:2,health:2,mechanics:2,mobility:2}});
  measure({weaponId,seed:1,camp:true});
  for(const boss of [5,10,15,20])measure({weaponId,boss});
  for(const encounter of [16,17,18,19])for(const camp of [false,true])measure({weaponId,encounter,camp});
}
await writeFile(new URL('./v014-simulation-report.json',import.meta.url),JSON.stringify(reports,null,2));
for(const r of reports.filter(r=>r.status==='won'||r.isolatedWave||r.isolatedBoss||r.camp))console.log(JSON.stringify({...r,waves:undefined,rewards:undefined}));
