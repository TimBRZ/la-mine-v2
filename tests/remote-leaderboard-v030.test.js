import {historicalSource} from './instant-fire-compat.js';
import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {leaderboardConfig} from '../src/leaderboard/config.js';import {RemoteAPI} from '../src/leaderboard/remote-api.js';import {RemoteLeaderboardStore,remotePayload} from '../src/leaderboard/remote-store.js';import {PlayerIdentityService} from '../src/leaderboard/player-identity-service.js';import {mockFetch} from '../src/leaderboard/mock-api.js';import {createLeaderboardService} from '../src/leaderboard/create-service.js';import {LeaderboardService} from '../src/leaderboard/service.js';import {LocalLeaderboardStore,LEADERBOARD_KEY} from '../src/leaderboard/local-store.js';import {V030_FILES} from './v030-authorized-files.js';
let serial=0;const now=Date.now();const perf=(overrides={})=>({run_id:'remote-'+(++serial),zone_id:'tracks',max_wave:20,completed:true,duration_ms:300000,depth_reached_ms:290000,weapon_id:'grisoux',client_version:'0.29.0',run_started_at:new Date(now-300000).toISOString(),run_finished_at:new Date(now).toISOString(),kills:42,...overrides});
const memory=()=>{const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
function adapter(scenario='connected',override){const calls=[],fetch=mockFetch(scenario),api=new RemoteAPI({timeoutMs:30,fetchImpl:async(path,init)=>{calls.push({path,init});return override?override(path,init,fetch):fetch(path,init);}});return {calls,api,store:new RemoteLeaderboardStore(api,{mock:true})};}

test('V030 local default, debug opt-in and same-origin configuration',()=>{
 for(const href of [undefined,'http://localhost:5177/','http://localhost:5177/?leaderboard=remote','https://example.com/?debug=1&leaderboard=remote'])assert.equal(leaderboardConfig(href).mode,'local');
 assert.equal(leaderboardConfig('http://192.168.1.15:5185/?debug=1&leaderboard=remote').mode,'remote');
 assert.equal(leaderboardConfig('http://localhost:5185/?debug=1&leaderboard=mock').mock,true);
 assert.throws(()=>leaderboardConfig('http://localhost:5185/?debug=1',{mode:'remote',baseUrl:'https://example.com'}));
});
test('V030 default factory remains local, standalone and compatible with old storage',async()=>{
 const storage=memory();storage.setItem('la-mine-v2:prototype-meta:v1','old save untouched');const service=createLeaderboardService({storage,href:'http://localhost/'});await service.recordPerformance(perf());assert.equal(service.remoteStore,null);assert.equal((await service.getBoard()).rows.length,11);assert.equal(storage.getItem('la-mine-v2:prototype-meta:v1'),'old save untouched');
});
test('V030 identity allowlist discards sensitive fields and preserves canonical id',async()=>{
 const {api}=adapter('connected',(path,init,next)=>path.endsWith('/identity')?Response.json({authenticated:true,player_id:'server-123',display_name:'REAL NAME',password_hash:'never keep',expires_at:'ignore'}):next(path,init));
 assert.deepEqual(await new PlayerIdentityService(api).get(),{authenticated:true,player_id:'server-123',display_name:'REAL NAME'});
});
test('V030 all remote boards retain backend order and ranks, no demo or local insertion',async()=>{
 const {store}=adapter('connected',(path,init,next)=>path.includes('/leaderboard/')?Response.json({category:path.includes('/time')?'time':path.endsWith('weekly')?'weekly':'depth',zone_id:'tracks',week_key:'2026-10-05',entries:[{rank:7,player_id:'mock-a',display_name:'Same',zone_id:'tracks',max_wave:1,duration_ms:500000,weapon_id:'smg'},{rank:9,player_id:'other',display_name:'Same',zone_id:'tracks',max_wave:20,duration_ms:100000,weapon_id:'shotgun'}]}):next(path,init));
 const service=new LeaderboardService(new LocalLeaderboardStore(memory()),{remoteStore:store});
 for(const category of ['depth','time','weekly']){const board=await service.getBoard({category,zoneId:'tracks'});assert.deepEqual(board.rows.map(r=>r.rank),[7,9]);assert.equal(board.rows.length,2);assert.equal(board.local.playerId,'mock-a');assert.equal(board.rows[1].isLocal,false);assert.ok(board.rows.every(r=>!r.isDemo));}
});
test('V030 HTTP paths, cookie credentials and strict six-field payload never send browser id',async()=>{
 const {store,calls}=adapter();const p=perf({player_id:'forged',display_name:'forged'});assert.equal((await store.record(p)).ok,true);
 for(const category of ['depth','time','weekly'])await store.read(now,{category,zoneId:'tracks'});
 const posts=calls.filter(c=>c.init.method==='POST');assert.equal(posts.length,1);assert.equal(posts[0].path,'/api/mine/runs');assert.deepEqual(Object.keys(JSON.parse(posts[0].init.body)).sort(),['client_version','completed','duration_ms','max_wave','weapon_id','zone_id']);
 assert.ok(calls.some(c=>c.path==='/api/mine/leaderboard/time?zone_id=tracks'));assert.ok(calls.every(c=>c.init.credentials==='include'&&c.init.cache==='no-store'&&c.init.redirect==='error'));
 assert.doesNotMatch(posts[0].init.body,/run_id|player_id|display_name|kills|forged/);
});
test('V030 simultaneous repeated submission and later refresh do not post twice',async()=>{
 const {store,calls}=adapter();const p=perf();await Promise.all([store.record(p),store.record({...p}),store.record(p)]);await store.read(now,{category:'depth',zoneId:'tracks'});await store.record(p);assert.equal(calls.filter(c=>c.init.method==='POST').length,1);
});
test('V030 anonymous player can read boards but cannot submit and has no highlighted row',async()=>{
 const {store,calls}=adapter('anonymous');assert.deepEqual(await store.record(perf()),{ok:false,reason:'unauthenticated'});const b=await store.read(now,{category:'depth',zoneId:'tracks'});assert.equal(b.localName,'NON CONNECTÉ');assert.equal(b.local,null);assert.equal(b.rows.length,2);assert.ok(!calls.some(c=>c.init.method==='POST'));
});
test('V030 POST failures preserve local records, remain unsaved remotely and never retry',async()=>{
 const {store,calls}=adapter('post-error'),storage=memory(),service=new LeaderboardService(new LocalLeaderboardStore(storage),{remoteStore:store});const p=perf();const result=await service.recordPerformance(p);assert.equal(result.ok,false);assert.equal(result.localSaved,true);assert.equal(JSON.parse(storage.getItem(LEADERBOARD_KEY)).depth.run_id,p.run_id);await service.getBoard();await service.recordPerformance(p);assert.equal(calls.filter(c=>c.init.method==='POST').length,1);assert.match(service.submissionMessage,/Échec/);
});
test('V030 local write happens before a pending network submission',async()=>{
 const storage=memory();let release;const pending=new Promise(resolve=>release=resolve);const service=new LeaderboardService(new LocalLeaderboardStore(storage),{remoteStore:{record:()=>pending}});const p=perf(),submission=service.recordPerformance(p);await new Promise(resolve=>setTimeout(resolve,0));assert.equal(JSON.parse(storage.getItem(LEADERBOARD_KEY)).depth.run_id,p.run_id);release({ok:true});assert.equal((await submission).ok,true);
});
test('V030 outage fallback and explicit local return leave records intact',async()=>{
 const {store,calls}=adapter('offline'),storage=memory(),service=new LeaderboardService(new LocalLeaderboardStore(storage),{remoteStore:store});await service.recordPerformance(perf());const b=await service.getBoard();assert.equal(b.remoteUnavailable,true);assert.equal(b.rows.length,11);assert.ok(b.local);service.useLocal();const count=calls.length;await service.recordPerformance(perf());assert.equal((await service.getBoard()).remoteUnavailable,false);assert.equal(calls.length,count);
});
test('V030 explicit local return clears stale remote submission feedback',async()=>{
 const {store}=adapter(),service=new LeaderboardService(new LocalLeaderboardStore(memory()),{remoteStore:store});await service.recordPerformance(perf());assert.match(service.submissionMessage,/MOCK/);service.useLocal();await service.recordPerformance(perf());assert.equal(service.submissionMessage,'');
});
test('V030 timeout bounds hung fetch AND JSON parsing without aggressive retries',async()=>{
 for(const fetchImpl of [()=>new Promise(()=>{}),async()=>({ok:true,json:()=>new Promise(()=>{})})]){const api=new RemoteAPI({fetchImpl,timeoutMs:5});await assert.rejects(api.ensureTemp(),/timeout/);await assert.rejects(api.ensureTemp(),/timeout/);}
});
test('V030 native browser fetch keeps its global receiver',async(t)=>{
 t.mock.method(globalThis,'fetch',function(){assert.equal(this,globalThis);return Promise.resolve(Response.json({environment:'mine-leaderboard-temp-v030'}));});
 await new RemoteAPI().ensureTemp();
});
test('V030 non-TEMP endpoint is rejected before identity or write request',async()=>{
 const calls=[],api=new RemoteAPI({fetchImpl:async p=>{calls.push(p);return Response.json({environment:'production'});}}),store=new RemoteLeaderboardStore(api);assert.equal((await store.record(perf())).ok,false);assert.deepEqual(calls,['/__mine_temp__/status']);
});
test('V030 backend bounds reject impossible records before any request while local save remains possible',async()=>{
 const {store,calls}=adapter();for(const change of [{duration_ms:59000},{duration_ms:86400001},{max_wave:19},{weapon_id:'laser'},{client_version:' '},{client_version:'\nx'}]){assert.equal(remotePayload(perf(change)),null);assert.equal((await store.record(perf(change))).reason,'invalid');}assert.equal(calls.length,0);
});
test('V030 malformed identity and malformed board trigger safe local fallback',async()=>{
 for(const badIdentity of [null,{authenticated:true,player_id:1,display_name:'x'},{authenticated:'true'},{authenticated:true,player_id:'x',display_name:''}]){const {api}=adapter('connected',(p,i,next)=>p.endsWith('/identity')?Response.json(badIdentity):next(p,i));await assert.rejects(new PlayerIdentityService(api).get());}
 const {store}=adapter('connected',(p,i,next)=>p.includes('/leaderboard/')?Response.json({category:'depth',entries:[{rank:1}]}):next(p,i));const service=new LeaderboardService(new LocalLeaderboardStore(memory()),{remoteStore:store});assert.equal((await service.getBoard()).remoteUnavailable,true);
});
test('V030 no identity, cookie or mock data is persisted by remote mode',async()=>{
 const storage=memory(),service=createLeaderboardService({storage,href:'http://localhost/?debug=1&leaderboard=mock'});await service.getBoard();await service.recordPerformance(perf());assert.deepEqual([...storage.data.keys()],[LEADERBOARD_KEY]);assert.doesNotMatch(storage.getItem(LEADERBOARD_KEY),/mock-a|MINEUR MOCK|cookie|authenticated|password/);
});
test('V030 preserves every previous source outside the three integration files',async()=>{
 const hashes=JSON.parse(await historicalSource(new URL('./v030-step3-before-hashes.json',import.meta.url)));for(const [f,h] of Object.entries(hashes))if(!V030_FILES.includes(f))assert.equal(createHash('sha256').update(await historicalSource(new URL('../src/'+f,import.meta.url))).digest('hex'),h,f);
});
