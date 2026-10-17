import {validPerformance,RANKED_ZONES} from './records.js';
import {WEAPONS} from '../weapons.js';
import {RemoteError} from './remote-api.js';
import {PlayerIdentityService} from './player-identity-service.js';
export function remotePayload(performance){
 const p=validPerformance(performance);
 if(!p||p.duration_ms>86400000||p.duration_ms<Math.max(p.max_wave*1000,p.completed?60000:1000)||!p.client_version.trim()||p.client_version!==p.client_version.trim()||/[\x00-\x1f\x7f]/.test(p.client_version))return null;
 return {zone_id:p.zone_id,max_wave:p.max_wave,completed:p.completed,duration_ms:p.duration_ms,weapon_id:p.weapon_id,client_version:p.client_version};
}
export class RemoteLeaderboardStore{
 constructor(api,{mock=false}={}){this.api=api;this.identity=new PlayerIdentityService(api);this.mock=mock;this.submissions=new Map();}
 record(p){
  if(this.submissions.has(p?.run_id))return this.submissions.get(p.run_id);
  const payload=remotePayload(p);if(!payload)return Promise.resolve({ok:false,reason:'invalid'});
  const operation=(async()=>{
   try{
    const identity=await this.identity.get();if(!identity.authenticated)return {ok:false,reason:'unauthenticated'};
    const result=await this.api.request('/api/mine/runs',{method:'POST',body:payload});
    if(result?.ok!==true)throw new RemoteError('unavailable');
    return {ok:true};
   }catch(error){return {ok:false,reason:error.reason||'unavailable'};}
  })();this.submissions.set(p.run_id,operation);return operation;
 }
 async read(_now,{category,zoneId}){
  if(!['depth','time','weekly'].includes(category)||!RANKED_ZONES.some(z=>z.id===zoneId))throw new RangeError('Classement inconnu');
  const identity=await this.identity.get();
  const data=await this.api.request('/api/mine/leaderboard/'+category+(category==='time'?'?zone_id='+encodeURIComponent(zoneId):''));
  if(data?.category!==category||!Array.isArray(data.entries)||data.entries.length>50||category==='time'&&data.zone_id!==zoneId||category==='weekly'&&!/^\d{4}-\d{2}-\d{2}$/.test(data.week_key))throw new RemoteError('unavailable');
  const ids=new Set();
  const rows=data.entries.map(row=>{
   if(!Number.isInteger(row.rank)||row.rank<1||typeof row.player_id!=='string'||!row.player_id||ids.has(row.player_id)||typeof row.display_name!=='string'||row.display_name.length>100||!RANKED_ZONES.some(z=>z.id===row.zone_id)||!Object.hasOwn(WEAPONS,row.weapon_id)||!Number.isSafeInteger(row.duration_ms)||row.duration_ms<=0||row.duration_ms>86400000||category==='time'&&row.zone_id!==zoneId||category!=='time'&&(!Number.isInteger(row.max_wave)||row.max_wave<1||row.max_wave>20))throw new RemoteError('unavailable');
   ids.add(row.player_id);
   return {rank:row.rank,playerId:row.player_id,name:row.display_name,isLocal:identity.authenticated&&row.player_id===identity.player_id,isDemo:false,performance:{zone_id:row.zone_id,max_wave:category==='time'?20:row.max_wave,completed:category==='time',duration_ms:row.duration_ms,weapon_id:row.weapon_id,depth_reached_ms:null}};
  });
  // Server ordering and ranks are authoritative: no sort, re-ranking or local/demo injection.
  return {mode:'remote',mock:this.mock,category,zoneId,weekKey:data.week_key,available:true,rows,local:rows.find(r=>r.isLocal)||null,localName:identity.display_name,authenticated:identity.authenticated};
 }
}
