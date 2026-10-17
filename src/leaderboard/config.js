import {localDebugEnabled} from '../debug-zones.js';
export const LEADERBOARD_CONFIG=Object.freeze({mode:'local',baseUrl:'',timeoutMs:2500});
// Remote is an explicit, nonpersistent local test option. Never enable production here.
export function leaderboardConfig(href=globalThis.location?.href,defaults=LEADERBOARD_CONFIG){
 let url;try{url=new URL(href);}catch{return {...LEADERBOARD_CONFIG};}
 if(!localDebugEnabled(url.href))return {...LEADERBOARD_CONFIG};
 const selected=url.searchParams.get('leaderboard')||defaults.mode;
 if(!['remote','mock'].includes(selected))return {...LEADERBOARD_CONFIG};
 const base=new URL(defaults.baseUrl||url.origin,url.origin);
 if(base.origin!==url.origin||base.username||base.password||base.search||base.hash)throw Error('Une seule origine locale TEMP est autorisée.');
 return {mode:'remote',mock:selected==='mock',scenario:url.searchParams.get('mock')||'connected',baseUrl:base.origin,timeoutMs:defaults.timeoutMs};
}
