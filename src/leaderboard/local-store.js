import {emptyLeaderboard,sanitizeLeaderboard,rollLeaderboard,recordPerformance} from './records.js';

export const LEADERBOARD_KEY='la-mine-v2:leaderboard-local:v1';
// Store interface: read(now, query), record(performance, now). A remote adapter
// may return Promises and read() entries for the query instead of demo rows.
// The service/UI always await these results. No remote adapter exists yet.
// This key never contains demo players and never writes the game wallet key.
export class LocalLeaderboardStore {
 constructor(storage){try{this.storage=storage===undefined?window.localStorage:storage;}catch{this.storage=null;}this.available=Boolean(this.storage);}
 load(){
  try{if(!this.storage)throw Error('storage');const raw=this.storage.getItem(LEADERBOARD_KEY);if(raw===null){this.available=true;return emptyLeaderboard();}const parsed=JSON.parse(raw);if(parsed?.version!==1)throw Error('version');this.available=true;return sanitizeLeaderboard(parsed);}
  catch{this.available=false;return emptyLeaderboard();}
 }
 write(state){try{if(!this.storage)throw Error('storage');this.storage.setItem(LEADERBOARD_KEY,JSON.stringify(sanitizeLeaderboard(state)));this.available=true;return true;}catch{this.available=false;return false;}}
 read(now=Date.now()) {const before=this.load(),state=rollLeaderboard(before,now);if(this.available&&before.weekly.key!==state.weekly.key)this.write(state);return {state,available:this.available};}
 record(performance,now=Date.now()) {
  const before=this.load();if(!this.available)return {ok:false,reason:'storage'};
  const next=recordPerformance(before,performance,now);if(!next)return {ok:false,reason:'invalid'};
  if(JSON.stringify(next)===JSON.stringify(before))return {ok:true};
  return this.write(next)?{ok:true}:{ok:false,reason:'storage'};
 }
 rename(name){const state=this.load();if(!this.available)return false;state.name=name;return this.write(state);}
}
