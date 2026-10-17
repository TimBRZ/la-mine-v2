import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
import {RemoteAPI} from '../src/leaderboard/remote-api.js';import {RemoteLeaderboardStore} from '../src/leaderboard/remote-store.js';
const base='http://127.0.0.1:5185';let serial=0;
const performance=changes=>{const now=Date.now();return {run_id:'integration-'+now+'-'+(++serial),zone_id:'tracks',max_wave:20,completed:true,duration_ms:300000,depth_reached_ms:1000,weapon_id:'grisoux',client_version:'0.29.0',run_started_at:new Date(now-600000).toISOString(),run_finished_at:new Date(now).toISOString(),kills:0,...changes};};
async function actor(name){
 const response=await fetch(base+'/__test__/session/'+name,{method:'POST',headers:{Origin:base}});assert.equal(response.status,200);
 const cookie=response.headers.get('set-cookie').split(';')[0];
 const api=new RemoteAPI({baseUrl:base,fetchImpl:(url,init)=>fetch(url,{...init,headers:{...init.headers,Cookie:cookie,Origin:base,'Sec-Fetch-Site':'same-origin'}})});
 return {store:new RemoteLeaderboardStore(api),cookie};
}
const a=await actor('a'),b=await actor('b');
assert.equal((await a.store.record(performance({}))).ok,true);
assert.equal((await b.store.record(performance({duration_ms:250000,weapon_id:'smg'}))).ok,true);
assert.equal((await a.store.record(performance({zone_id:'rift',max_wave:18,completed:false,duration_ms:240000}))).ok,true);
assert.equal((await b.store.record(performance({zone_id:'rift',duration_ms:350000}))).ok,true);
assert.equal((await b.store.record(performance({duration_ms:600000}))).ok,true);
const boards={};for(const category of ['depth','time','weekly']){
 const board=await a.store.read(Date.now(),{category,zoneId:'tracks'});
 assert.deepEqual(board.rows.map(r=>r.playerId),['temp-b','temp-a']);assert.equal(board.localName,'TIM TEMP');assert.equal(board.local.rank,2);
 if(category==='time')assert.deepEqual(board.rows.map(r=>r.performance.duration_ms),[250000,300000]);
 boards[category]=board;
}
const invalid=await actor('invalid');
assert.equal((await invalid.store.record(performance({}))).reason,'unauthenticated');
const denied=await fetch(base+'/api/mine/runs',{method:'POST',headers:{Cookie:invalid.cookie,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({zone_id:'tracks',max_wave:20,completed:true,duration_ms:300000,weapon_id:'smg',client_version:'0.29.0'})});
assert.equal(denied.status,401);
await writeFile(new URL('./v030-temp-integration.json',import.meta.url),JSON.stringify({real_temp_backend:true,real_cgweb_proxies:true,submitted_runs:5,invalid_session_status:denied.status,boards},null,2));
console.log('TEMP integration passed: two sessions, five submissions, three ranked boards, worse time preserved, invalid session rejected.');
