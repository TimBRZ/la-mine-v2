import {ZONES} from '../menu/state.js';
import {WEAPONS} from '../weapons.js';
import {localDay,validDay} from '../crates.js';

export const LEADERBOARD_VERSION=1;
export const CLIENT_VERSION='0.29.0';
// Single ordered catalogue; only playable zones are eligible for records.
export const RANKED_ZONES=Object.freeze(ZONES.filter(z=>z.playable).map((z,index)=>Object.freeze({id:z.id,name:z.name,order:index+1})));
export const zoneRank=id=>RANKED_ZONES.find(z=>z.id===id)?.order||0;
export function leaderboardWeek(now=Date.now()) {
 if(!localDay(now))return null;const d=new Date(now),start=new Date(d.getFullYear(),d.getMonth(),d.getDate());start.setDate(start.getDate()-(start.getDay()+6)%7);return localDay(start.getTime());
}
export function nextMonday(key) {const d=new Date(key+'T00:00:00');d.setDate(d.getDate()+7);return d.getTime();}
const timestamp=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))&&Boolean(localDay(Date.parse(value)));
export function validPerformance(value) {
 if(!value||!zoneRank(value.zone_id)||!Object.hasOwn(WEAPONS,value.weapon_id)||!Number.isInteger(value.max_wave)||value.max_wave<1||value.max_wave>20||typeof value.completed!=='boolean'||value.completed&&value.max_wave!==20)return null;
 if(!Number.isSafeInteger(value.duration_ms)||value.duration_ms<1||value.duration_ms>7*86400000||!timestamp(value.run_started_at)||!timestamp(value.run_finished_at)||Date.parse(value.run_finished_at)<Date.parse(value.run_started_at))return null;
 if(typeof value.run_id!=='string'||!value.run_id.length||value.run_id.length>100||typeof value.client_version!=='string'||value.client_version.length>24)return null;
 const reached=value.depth_reached_ms;
 if(reached!==null&&(!Number.isSafeInteger(reached)||reached<0||reached>value.duration_ms))return null;
 return {run_id:value.run_id,zone_id:value.zone_id,max_wave:value.max_wave,completed:value.completed,duration_ms:value.duration_ms,depth_reached_ms:reached,weapon_id:value.weapon_id,run_started_at:new Date(value.run_started_at).toISOString(),run_finished_at:new Date(value.run_finished_at).toISOString(),client_version:value.client_version,kills:Number.isSafeInteger(value.kills)&&value.kills>=0?Math.min(value.kills,100000):0};
}
export function compareDepth(a,b) {
 const level=zoneRank(b.zone_id)-zoneRank(a.zone_id)||b.max_wave-a.max_wave;
 if(level)return level;
 return (a.depth_reached_ms??Infinity)-(b.depth_reached_ms??Infinity)||0;
}
export const compareTime=(a,b)=>a.duration_ms-b.duration_ms;
export const emptyLeaderboard=()=>({version:LEADERBOARD_VERSION,name:'JOUEUR LOCAL',depth:null,times:{},weekly:{key:null,best:null},lastRun:null});
export function sanitizeLeaderboard(value) {
 const next=emptyLeaderboard();if(value?.version!==LEADERBOARD_VERSION)return next;
 if(typeof value.name==='string')next.name=value.name.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,24)||next.name;
 next.depth=validPerformance(value.depth);next.lastRun=validPerformance(value.lastRun);
 for(const zone of RANKED_ZONES){const p=validPerformance(value.times?.[zone.id]);if(p?.completed&&p.zone_id===zone.id)next.times[zone.id]=p;}
 if(validDay(value.weekly?.key)&&leaderboardWeek(new Date(value.weekly.key+'T12:00:00').getTime())===value.weekly.key){next.weekly.key=value.weekly.key;const p=validPerformance(value.weekly.best);if(p&&leaderboardWeek(Date.parse(p.run_finished_at))===next.weekly.key)next.weekly.best=p;}
 return next;
}
export function rollLeaderboard(value,now=Date.now()) {
 const next=sanitizeLeaderboard(value),key=leaderboardWeek(now);
 if(key&&(!next.weekly.key||key>next.weekly.key))next.weekly={key,best:null};
 return next;
}
export function recordPerformance(value,performance,now=Date.now()) {
 const p=validPerformance(performance);if(!p||!leaderboardWeek(now))return null;
 const next=rollLeaderboard(value,now);
 if(!next.depth||compareDepth(p,next.depth)<0)next.depth=p;
 if(p.completed&&(!next.times[p.zone_id]||compareTime(p,next.times[p.zone_id])<0))next.times[p.zone_id]=p;
 if(leaderboardWeek(Date.parse(p.run_finished_at))===next.weekly.key&&(!next.weekly.best||compareDepth(p,next.weekly.best)<0))next.weekly.best=p;
 if(!next.lastRun||Date.parse(p.run_finished_at)>=Date.parse(next.lastRun.run_finished_at))next.lastRun=p;
 return next;
}
