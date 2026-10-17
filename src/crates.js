// One crate, gameplay sources only. No recursive crate rewards.
export const CRATE_RULES=Object.freeze({victoryChance:.1,tokenCost:3,maxCount:999999,animationMs:1100});
export const CRATE_REWARDS=Object.freeze([
  {resource:'coal',amount:100,weight:35},
  {resource:'coal',amount:200,weight:25},
  {resource:'iron',amount:10,weight:15},
  {resource:'iron',amount:20,weight:10},
  {resource:'diamond',amount:1,weight:8},
  {resource:'diamond',amount:2,weight:5},
  {resource:'token',amount:1,weight:2},
].map(Object.freeze));
export function localDay(now=Date.now()) {
  const d=new Date(now);
  if(!Number.isFinite(d.getTime())||d.getFullYear()<1000||d.getFullYear()>9999)return null;
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
}
export function validDay(day) {
  if(typeof day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(day))return false;
  const [y,m,d]=day.split('-').map(Number);
  return localDay(new Date(y,m-1,d,12).getTime())===day;
}
export function sanitizeCrates(value) {
  return {count:Number.isSafeInteger(value?.count)&&value.count>=0?Math.min(value.count,CRATE_RULES.maxCount):0,
    lastDaily:validDay(value?.lastDaily)?value.lastDaily:null};
}
export function drawCrateReward(random=Math.random) {
  const value=random();
  if(!Number.isFinite(value)||value<0||value>=1)throw new RangeError('Invalid crate draw');
  let total=0;
  for(const reward of CRATE_REWARDS){total+=reward.weight;if(value*100<total)return {...reward};}
  return {...CRATE_REWARDS.at(-1)};
}
export function victoryCrates(run,state,now,random=Math.random) {
  const next=sanitizeCrates(state),award={daily:0,bonus:0};
  if(run.status!=='won'||run.completedWaves!==20)return {state:next,...award};
  const day=localDay(now);
  // A backwards clock cannot repeat an already claimed local day.
  if(day&&(!next.lastDaily||day>next.lastDaily)&&next.count<CRATE_RULES.maxCount){next.count++;next.lastDaily=day;award.daily=1;}
  if(random()<CRATE_RULES.victoryChance&&next.count<CRATE_RULES.maxCount){next.count++;award.bonus=1;}
  return {state:next,...award};
}
