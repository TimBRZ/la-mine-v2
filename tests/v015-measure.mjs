import {writeFile} from 'node:fs/promises';
import {simulate} from './v015-simulation.mjs';

export const BUILDS=[
  {name:'fusil-moyen',weaponId:'shotgun',build:['trigger','boots','plates','buckshot','double']},
  {name:'fusil-fort',weaponId:'shotgun',build:['trigger','trigger','buckshot','plates','boots']},
  {name:'fusil-double-canon',weaponId:'shotgun',build:['trigger','trigger','buckshot','plates','boots','double-cannon']},
  {name:'fusil-proximite',weaponId:'shotgun',build:['sawn','trigger','sawn','boots','double','point-blank']},
  {name:'fusil-grisou',weaponId:'shotgun',build:['trigger','buckshot','trigger','boots','grisou','unstable-grisou']},
  {name:'smg-moyen',weaponId:'smg',build:['trigger','boots','plates','magazine','plates']},
  {name:'smg-perforation',weaponId:'smg',build:['piercing','trigger','boots','trigger','plates','total-piercing']},
  {name:'smg-surchauffe',weaponId:'smg',build:['heat','trigger','boots','magazine','plates']},
  {name:'smg-epique',weaponId:'smg',build:['trigger','piercing','trigger','boots','heat','critical-heat']},
];
const matrix=[];
for(const rank of [0,2,5])for(const build of BUILDS)for(const boss of [5,10,15,20]) {
  const options={weaponId:build.weaponId,buildOverride:build.build,boss,levels:{power:rank,health:rank,mechanics:rank,mobility:rank}};
  const before=simulate({...options,baseline:true}),after=simulate(options);
  matrix.push({build:build.name,rank,boss,before,after});
}
await writeFile(new URL('./v015-boss-matrix.json',import.meta.url),JSON.stringify(matrix,null,2));
for(const rank of [0,2,5])for(const name of BUILDS.map(b=>b.name)) {
  console.log(rank,name,JSON.stringify(matrix.filter(r=>r.rank===rank&&r.build===name).map(r=>({boss:r.boss,before:r.before.status==='won'?Number(r.before.bosses[0].combatSeconds.toFixed(2)):null,beforeStatus:r.before.status,after:Number((r.after.bosses[0]?.combatSeconds||r.after.seconds).toFixed(2)),status:r.after.status,hp:r.after.hp}))));
}
