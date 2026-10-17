import {writeFile} from 'node:fs/promises';
import {simulate} from './v016-simulation.mjs';
import {TALENTS} from '../src/talents.js';
const rows=[];
for(const weaponId of ['shotgun','smg'])for(const rank of [0,2,5])for(const seed of [1,5,7])for(const talents of [[],TALENTS.map(t=>t.id)]) {
 const priority=weaponId==='smg'?['critical-heat','trigger','heat','plates','boots','piercing','magazine']:undefined;
 rows.push(simulate({weaponId,seed,talents,levels:{power:rank,health:rank,mechanics:rank,mobility:rank},priority}));
}
await writeFile(new URL('./v016-run-comparison.json',import.meta.url),JSON.stringify(rows,null,2));
console.log(rows.map(r=>({weapon:r.weaponId,rank:r.levels.power,seed:r.seed,talents:r.talents.length,status:r.status,seconds:r.seconds,final:r.bosses.find(b=>b.wave===20)?.combatSeconds})));
