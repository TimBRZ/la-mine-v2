import { PRESSURE } from './difficulty.js';

const anchors=Object.freeze([[65,154],[385,154],[65,300],[385,300],[65,460],[385,460],[65,605],[385,605]].map(Object.freeze));
// Columns: miners, wagons, draisines, rats, drills. One row per normal wave.
// Boss slots are reserved separately; no placeholder combat or reward is granted.
const tiers=[
  {cap:[4,4,5,6],interval:1.05,group:2,wagons:1,draisines:2,counts:[
    [6,1,0,0,0],[5,1,0,3,0],[5,2,1,3,0],[6,3,3,0,0]]},
  {cap:[6,7,8,8],interval:.82,group:3,wagons:2,draisines:2,counts:[
    [5,3,2,2,0],[6,3,3,2,0],[6,4,3,2,0],[7,4,4,2,0]]},
  {cap:[8,9,10,10],interval:.72,group:3,wagons:2,draisines:3,counts:[
    [7,4,4,1,1],[8,4,5,1,1],[8,5,5,1,1],[8,5,6,1,1]]},
  {cap:[10,11,12,12],interval:.62,group:4,wagons:2,draisines:3,counts:[
    [8,5,6,1,1],[9,6,6,2,1],[10,7,6,2,1],[10,7,6,2,1]]},
];
const kinds=['miner','wagon','draisine','rat','drill'];
const bossIds=Object.freeze(['stationmaster','locomotive','switchman']);
function interleave(counts) {
  const remaining=[...counts],enemies=[];
  while(remaining.some(n=>n>0))for(let i=0;i<kinds.length;i++)if(remaining[i]>0){enemies.push(kinds[i]);remaining[i]--;}
  return Object.freeze(enemies);
}
export const TRACKS_WAVES=Object.freeze(tiers.flatMap((tier,t)=>[
  ...tier.counts.map((counts,i)=>{
    const enemies=interleave(counts);
    return Object.freeze({id:'tracks-'+(t*5+i+1),total:enemies.length,enemies,
      composition:Object.freeze(Object.fromEntries(kinds.map((kind,j)=>[kind,counts[j]]))),
      maxAlive:tier.cap[i],interval:tier.interval-i*.04,group:tier.group,
      kindCaps:Object.freeze({wagon:tier.wagons,draisine:tier.draisines,drill:1}),
      pressure:PRESSURE[t],spawns:anchors,bosses:Object.freeze([])});
  }),
  Object.freeze({id:'tracks-'+(t*5+5),boss:true,reservedBoss:false,final:t===3,
    bosses:t===3?bossIds:Object.freeze([bossIds[t]]),total:t===3?3:1,maxAlive:t===3?3:1,
    interval:1,group:1,healthScale:t===3?.95:1,enemies:Object.freeze([]),
    spawns:t===3?Object.freeze([[110,210],[225,165],[340,210]].map(Object.freeze)):Object.freeze([Object.freeze([225,220])])}),
]));
