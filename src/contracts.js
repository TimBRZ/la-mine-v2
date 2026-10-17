import {localDay,validDay} from './crates.js';

// Rewards are deliberately below a full run. No ordinary contract gives tokens.
export const CONTRACT_REWARDS=Object.freeze({dailyCombat:{coal:10},dailyProgress:{iron:1},dailyVariety:{iron:1},weeklyCombat:{coal:200},weeklyProgress:{diamond:1},weeklyActivity:{iron:15},dailyBonus:{crate:1},weeklyBonus:{token:1}});
const define=(id,period,group,title,metric,target,reward,extra={})=>Object.freeze({id,period,group,title,metric,target,reward:CONTRACT_REWARDS[reward],...extra});
export const CONTRACTS=Object.freeze([
 define('d-k75','daily','combat','Éliminer 75 ennemis','kills',75,'dailyCombat'),
 define('d-k120','daily','combat','Éliminer 120 ennemis','kills',120,'dailyCombat'),
 define('d-boss','daily','combat','Battre 2 boss','bosses',2,'dailyCombat'),
 define('d-w10','daily','progress','Atteindre la vague 10','wave',10,'dailyProgress'),
 define('d-w15','daily','progress','Atteindre la vague 15','wave',15,'dailyProgress'),
 define('d-win','daily','progress','Terminer une zone','wins',1,'dailyProgress'),
 ...[['shotgun','Fusil à pompe'],['smg','Mitraillette'],['grisoux','Grisou X']].map(([weapon,name])=>define('d-'+weapon,'daily','variety','Jouer une run avec le '+name,'weaponRun',1,'dailyVariety',{weapon,note:'Victoire ou défaite après 60 s et au moins une vague terminée.'})),
 define('d-coal','daily','variety','Collecter 100 Charbon en run','coal',100,'dailyVariety'),
 define('d-iron','daily','variety','Collecter 10 Fer en run','iron',10,'dailyVariety'),
 define('d-grisou','daily','variety','Déclencher Coup de Grisou 5 fois','grisou',5,'dailyVariety'),
 define('d-epic','daily','variety','Choisir un perk épique','epic',1,'dailyVariety'),
 define('w-k500','weekly','combat','Éliminer 500 ennemis','kills',500,'weeklyCombat'),
 define('w-k1000','weekly','combat','Éliminer 1 000 ennemis','kills',1000,'weeklyCombat'),
 define('w-boss','weekly','combat','Battre 10 boss','bosses',10,'weeklyCombat'),
 define('w-win3','weekly','progress','Terminer 3 zones','wins',3,'weeklyProgress'),
 define('w-win5','weekly','progress','Terminer 5 zones','wins',5,'weeklyProgress'),
 define('w-arms2','weekly','progress','Gagner avec 2 armes différentes','wonWeapon',2,'weeklyProgress'),
 define('w-arms3','weekly','progress','Gagner avec les 3 armes','wonWeapon',3,'weeklyProgress'),
 define('w-wave20','weekly','progress','Atteindre la vague 20 trois fois','wave20',3,'weeklyProgress'),
 define('w-rift','weekly','progress','Terminer La Faille de Grisou','riftWin',1,'weeklyProgress',{requiresRift:true}),
 define('w-crates','weekly','activity','Ouvrir 3 Caisses du Mineur','crates',3,'weeklyActivity'),
 define('w-choices','weekly','activity','Réaliser 10 Choix du Contremaître','choices',10,'weeklyActivity'),
 define('w-iron','weekly','activity','Collecter 50 Fer en run','iron',50,'weeklyActivity'),
]);
export const contractById=id=>CONTRACTS.find(c=>c.id===id);
const weapons=['shotgun','smg','grisoux'];
const count=(n,max=100000)=>Number.isSafeInteger(n)&&n>=0?Math.min(n,max):0;
export function contractDates(now=Date.now()) {
 const day=localDay(now);if(!day)return null;
 const d=new Date(now),monday=new Date(d.getFullYear(),d.getMonth(),d.getDate());monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
 const tomorrow=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1),nextWeek=new Date(monday);nextWeek.setDate(nextWeek.getDate()+7);
 return {daily:day,weekly:localDay(monday.getTime()),dailyReset:tomorrow.getTime(),weeklyReset:nextWeek.getTime()};
}
function select(period,key,riftAvailable) {
 const [y,m,d]=key.split('-').map(Number),serial=Math.floor(Date.UTC(y,m-1,d)/86400000),index=period==='daily'?serial:Math.floor(serial/7);
 const groups=period==='daily'?['combat','progress','variety']:['combat','progress','activity'];
 return groups.map((group,i)=>{const pool=CONTRACTS.filter(c=>c.period===period&&c.group===group&&(!c.requiresRift||riftAvailable));return {id:pool[((index+i)%pool.length+pool.length)%pool.length].id,value:0,claimed:false,weapons:[]};});
}
export function sanitizeContracts(value) {
 const result={};
 for(const period of ['daily','weekly']) {
  const cycle=value?.[period];if(!validDay(cycle?.key)||!Array.isArray(cycle.rows)||cycle.rows.length!==3)continue;
  if(period==='weekly'&&contractDates(new Date(cycle.key+'T12:00:00').getTime()).weekly!==cycle.key)continue;
  const groups=new Set();let valid=true;
  const rows=cycle.rows.map(row=>{const c=contractById(row?.id);if(!c||c.period!==period||groups.has(c.group)){valid=false;return null;}groups.add(c.group);
   const used=[...new Set((Array.isArray(row.weapons)?row.weapons:[]).filter(w=>weapons.includes(w)))];
   const n=c.metric==='wonWeapon'?Math.min(c.target,used.length):count(row.value,c.target);
   return {id:c.id,value:n,claimed:n===c.target&&row.claimed===true,weapons:c.metric==='wonWeapon'?used:[]};
  });
  if(valid)result[period]={key:cycle.key,rows,bonusClaimed:rows.every(r=>r.value===contractById(r.id).target)&&cycle.bonusClaimed===true};
 }
 return result;
}
export function cycleContracts(value,now=Date.now(),riftAvailable=false) {
 const next=sanitizeContracts(value),dates=contractDates(now);if(!dates)return next;
 for(const period of ['daily','weekly'])if(!next[period]||dates[period]>next[period].key)next[period]={key:dates[period],rows:select(period,dates[period],riftAvailable),bonusClaimed:false};
 // Backward clock changes never reopen an older claim cycle.
 return next;
}
export function advanceContracts(value,activity,now=Date.now(),riftAvailable=false) {
 const next=cycleContracts(value,now,riftAvailable);
 const dates=contractDates(now);
 for(const [period,cycle] of Object.entries(next))for(const row of cycle.rows){const c=contractById(row.id);if(row.claimed||cycle.key!==dates?.[period])continue;
  if(c.metric==='wonWeapon') {if(weapons.includes(activity.wonWeapon)&&!row.weapons.includes(activity.wonWeapon))row.weapons.push(activity.wonWeapon);row.value=Math.min(c.target,row.weapons.length);}
  else if(c.metric==='weaponRun'){if(activity.weaponRun===c.weapon)row.value=1;}
  else if(c.metric==='wave')row.value=Math.min(c.target,Math.max(row.value,count(activity.wave)));
  else row.value=Math.min(c.target,row.value+count(activity[c.metric]));
 }
 return next;
}
export function contractReady(row){return row.value===contractById(row.id)?.target&&!row.claimed;}
export function contractBadge(state){return Object.values(state||{}).reduce((n,c)=>n+c.rows.filter(contractReady).length+Number(!c.bonusClaimed&&c.rows.every(r=>r.value===contractById(r.id).target)),0);}
export function contractClaim(value,period,key,id) {
 const next=sanitizeContracts(value),cycle=next[period];if(!cycle||cycle.key!==key)return null;
 if(id==='bonus') {if(cycle.bonusClaimed||!cycle.rows.every(r=>r.value===contractById(r.id).target))return null;cycle.bonusClaimed=true;return {state:next,reward:CONTRACT_REWARDS[period+'Bonus']};}
 const row=cycle.rows.find(r=>r.id===id);if(!row||!contractReady(row))return null;row.claimed=true;return {state:next,reward:contractById(id).reward};
}
