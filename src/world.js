import { roomRewards } from './rewards.js';
import { PRESSURE, FINAL_BOSS } from './difficulty.js';
export { BOSS_SPECS } from './difficulty.js';

const anchors = [[65,154],[225,144],[385,154],[386,300],[386,460],[385,605],[225,620],[65,605],[64,460],[64,300]];
const stages = [
  { totals:[6,8,9,10], caps:[3,4,4,5], interval:.95, group:2, roster:['rat','rat','miner'] },
  { totals:[10,12,13,14], caps:[6,7,7,8], interval:.7, group:4, roster:['rat','drill','rat','miner','rat','miner'] },
  { totals:[14,16,17,18], caps:[8,9,9,10], interval:.6, group:4, roster:['rat','miner','drill','rat','miner','rat'] },
  { totals:[18,20,22,22], caps:[10,11,12,12], interval:.5, group:5, roster:['rat','miner','drill','rat','miner','rat','drill'] },
];
const bossIds = ['haveuse','crachefer','effondreur'];
const waves = stages.flatMap((stage, tier) => [
  ...stage.totals.map((total, index) => ({
    id:`galleries-${tier*5+index+1}`, total, maxAlive:stage.caps[index],
    interval:stage.interval-index*.06, group:stage.group, pressure:PRESSURE[tier], spawns:anchors,
    enemies:Array.from({length:total},(_,i)=>tier===0&&index===0?'rat':tier===0&&index>=2&&i%5===0?'drill':stage.roster[i%stage.roster.length]),
  })),
  { id:`galleries-${tier*5+5}`, total:tier===3?3:1, maxAlive:tier===3?3:1, interval:1, group:1,
    boss:true, final:tier===3, bosses:tier===3?bossIds:[bossIds[tier]],
    healthScale:tier===3?FINAL_BOSS.healthScale:1, spawns:tier===3?[[110,210],[225,165],[340,210]]:[[225,220]], enemies:[],
  },
]);
export const WORLD = Object.freeze({
  id:'galleries', name:'LES GALERIES', choices:Object.freeze([4,9,14,18]), epicAfter:19,
  waves:Object.freeze(waves.map(w=>Object.freeze({...w,enemies:Object.freeze(w.enemies),bosses:Object.freeze(w.bosses||[]),spawns:Object.freeze(w.spawns.map(p=>Object.freeze([...p])))}))),
});

// The original five reward rolls are distributed over twenty waves. Same full
// run budget, probabilities and RNG calls; no change to the saved economy.
export function worldRewards(random=Math.random, count=WORLD.waves.length) {
  const old=Array.from({length:5},(_,i)=>roomRewards(i+1,random));
  return Array.from({length:count},(_,index)=>{
    const group=Math.floor(index*5/count), start=Math.ceil(group*count/5), end=Math.ceil((group+1)*count/5);
    const offset=index-start, size=end-start, source=old[group];
    return Object.fromEntries(Object.entries(source).map(([key,value])=>[key,
      key==='coal'?Math.floor(value*(offset+1)/size)-Math.floor(value*offset/size):offset===size-1?value:0]));
  });
}
