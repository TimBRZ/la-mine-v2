import {compareDepth,compareTime,RANKED_ZONES,recordPerformance} from './records.js';
import {demoLeaderboard} from './demo.js';

export class LeaderboardService {
 constructor(store,{demo=demoLeaderboard,remoteStore=null}={}){this.store=store;this.demo=demo;this.pending=null;this.remoteStore=remoteStore;this.localOnly=false;this.submissionMessage='';}
 useLocal(){this.localOnly=true;this.submissionMessage='';}
 async recordPerformance(performance,now=Date.now()) {
  const next=recordPerformance(this.pending,performance,now);if(!next)return {ok:false,reason:'invalid'};
  this.pending=next;const local=await this.flushPending(now);
  if(!this.remoteStore||this.localOnly){this.submissionMessage='';return local;}
  const target=this.remoteStore.mock?'MOCK (simulé)':'TEMP';
  this.submissionMessage=`Envoi au classement ${target}…`;
  let remote;try{remote=await this.remoteStore.record(performance);}catch{remote={ok:false,reason:'unavailable'};}
  this.submissionMessage=remote.ok?`Résultat enregistré · classement ${target}.`:remote.reason==='unauthenticated'?'NON CONNECTÉ · résultat distant non envoyé.':remote.reason==='invalid'?`Résultat hors limites du classement ${target} · envoi distant ignoré.`:`Échec de l’envoi ${target} · aucun nouvel envoi automatique.`;
  if(!local.ok)this.submissionMessage+=' Stockage local indisponible.';
  return {...remote,localSaved:local.ok};
 }
 async flushPending(now) {
  if(!this.pending)return {ok:true};
  const batch=this.pending,records=[batch.depth,...Object.values(batch.times),batch.weekly.best,batch.lastRun].filter(Boolean),unique=new Map(records.map(p=>[p.run_id,p]));
  try{for(const p of unique.values()){const result=await this.store.record(p,now);if(!result.ok)return result;}}
  catch{return {ok:false,reason:'storage'};}
  if(this.pending===batch)this.pending=null;return {ok:true};
 }
 async getBoard({category='depth',zoneId=RANKED_ZONES[0].id}={},now=Date.now()) {
  if(!['depth','time','weekly'].includes(category)||!RANKED_ZONES.some(z=>z.id===zoneId))throw new RangeError('Classement inconnu');
  await this.flushPending(now);
  let remoteUnavailable=false;
  if(this.remoteStore&&!this.localOnly){try{return await this.remoteStore.read(now,{category,zoneId});}catch{remoteUnavailable=true;}}
  const {state,available,entries}=await this.store.read(now,{category,zoneId});
  const performance=category==='time'?state.times[zoneId]:category==='weekly'?state.weekly.best:state.depth;
  const rows=(entries??this.demo(category,zoneId)).map(row=>({...row,performance:{...row.performance}}));
  if(performance)rows.push({playerId:'local',name:state.name,isLocal:true,isDemo:false,performance});
  const compare=category==='time'?compareTime:compareDepth;
  rows.sort((a,b)=>compare(a.performance,b.performance)||a.playerId.localeCompare(b.playerId));
  let rank=0;const ranked=rows.map((row,i)=>{if(!i||compare(row.performance,rows[i-1].performance)!==0)rank=i+1;return {...row,rank};});
  return {category,zoneId,weekKey:state.weekly.key,available:available&&!this.pending,rows:ranked,local:ranked.find(r=>r.isLocal)||null,localName:state.name,remoteUnavailable};
 }
}
