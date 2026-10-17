import {V021_FILES} from './v021-authorized-files.js';
import { VISUAL_FILES } from './v019-visual-files.js';
import { RAIL_INTEGRATION_FILES } from './v018-rail-integration.js';
import { preserveWorkshopHint } from './v017-protected-copy.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {CRATE_RULES,CRATE_REWARDS,localDay,validDay,sanitizeCrates,drawCrateReward} from '../src/crates.js';
import {Wallet} from '../src/wallet.js';
import {LocalProfileStorage,emptyProfile,sanitizeProfile,MAX_RESOURCE} from '../src/local-profile-storage.js';
import {MenuState} from '../src/menu/state.js';
const day1=new Date(2026,9,6,12).getTime(),day2=new Date(2026,9,7,12).getTime();
const win=()=>({status:'won',completedWaves:20,collectedRewards:{coal:94,iron:8,diamond:0,token:0}});
function fixture(crates={count:3,lastDaily:null}){
 let raw=JSON.stringify({...emptyProfile(),wallet:{coal:5000,iron:500,diamond:10,token:7},talents:['magnet'],relief:{startedAt:day1},crates});
 const backend={getItem:()=>raw,setItem:(_,v)=>{raw=v;}};
 const storage=new LocalProfileStorage(backend);return {backend,storage,wallet:new Wallet(storage)};
}
test('Crates page is a destination and returning keeps selected weapon',()=>{const m=new MenuState();m.selectWeapon('smg');assert.equal(m.navigate('crates'),true);m.navigate('talents');m.navigate('relief');assert.equal(m.weaponId,'smg');});
test('central table totals 100%, contains only existing resource rewards, no crate loop',()=>{
 assert.equal(CRATE_REWARDS.reduce((n,r)=>n+r.weight,0),100);
 assert.deepEqual([...new Set(CRATE_REWARDS.map(r=>r.resource))],['coal','iron','diamond','token']);
 for(const r of CRATE_REWARDS)assert.ok(r.weight>0&&Number.isInteger(r.amount)&&r.amount>0);
});
let cumulative=0;
for(const reward of CRATE_REWARDS){const low=cumulative,high=cumulative+reward.weight;cumulative=high;test('reward interval '+reward.resource+' '+reward.amount,()=>{
 for(const p of [low,(low+high)/2,high-1e-7])assert.deepEqual(drawCrateReward(()=>p/100),reward);
});}
test('unknown or invalid random values cannot create rewards',()=>{for(const n of [NaN,Infinity,-1,1])assert.throws(()=>drawCrateReward(()=>n),RangeError);});
test('local calendar boundary, valid dates and leap years are respected',()=>{
 assert.equal(localDay(new Date(2026,9,6,23,59,59).getTime()),'2026-10-06');assert.equal(localDay(new Date(2026,9,7,0,0).getTime()),'2026-10-07');
 assert.equal(validDay('2024-02-29'),true);for(const s of ['2026-02-29','2026-13-01','2026-01-00','bad',null])assert.equal(validDay(s),false);
 assert.equal(localDay(NaN),null);
});
test('old profile remains exact; optional crate extension sanitizes corrupt counts and dates',()=>{
 const old={...emptyProfile(),talents:['magnet'],relief:{startedAt:day1}};assert.deepEqual(sanitizeProfile(old),old);
 for(const count of [-1,NaN,1.5,'3'])assert.equal(sanitizeCrates({count,lastDaily:'bad'}).count,0);
 assert.deepEqual(sanitizeCrates({count:1e9,lastDaily:'2026-10-06'}),{count:CRATE_RULES.maxCount,lastDaily:'2026-10-06'});
});
test('empty stock prevents opening without drawing or mutating wallet',()=>{const {wallet}=fixture({count:0,lastDaily:null}),before=wallet.snapshot;assert.deepEqual(wallet.openCrate(()=>{throw Error('draw');}),{ok:false,reason:'empty'});assert.deepEqual(wallet.snapshot,before);});
for(const [p,resource,amount] of [[0,'coal',100],[.7,'iron',10],[.9,'diamond',1],[.99,'token',1]])test('open atomically consumes one crate and saves '+resource,()=>{
 const {wallet,storage}=fixture(),before=wallet.snapshot,r=wallet.openCrate(()=>p);assert.deepEqual(r,{ok:true,reward:{resource,amount}});assert.equal(wallet.crateCount,2);assert.equal(wallet.snapshot.wallet[resource],before.wallet[resource]+amount);
 const reloaded=new Wallet(storage);assert.deepEqual(reloaded.snapshot,wallet.snapshot);assert.deepEqual(reloaded.snapshot.talents,before.talents);assert.deepEqual(reloaded.snapshot.levels,before.levels);assert.deepEqual(reloaded.snapshot.relief,before.relief);
});
test('failed opening write leaves stock and resources unchanged; retry once works',()=>{
 const {wallet,backend}=fixture(),before=wallet.snapshot,write=backend.setItem;backend.setItem=()=>{throw Error('quota');};assert.equal(wallet.openCrate(()=>0).ok,false);assert.deepEqual(wallet.snapshot,before);backend.setItem=write;assert.equal(wallet.openCrate(()=>0).ok,true);assert.equal(wallet.crateCount,2);
});
test('resource safety ceiling is checked before drawing, no paid rerolls or silent truncation',()=>{
 const {wallet,storage}=fixture();const p=wallet.snapshot;p.wallet.coal=MAX_RESOURCE;storage.write(p);assert.deepEqual(wallet.openCrate(()=>{throw Error('draw');}),{ok:false,reason:'capacity'});assert.equal(wallet.crateCount,3);
});
test('sequential stale instances cannot open the same last crate twice',()=>{
 const {wallet,storage}=fixture({count:1,lastDaily:null}),other=new Wallet(storage);assert.equal(wallet.openCrate(()=>0).ok,true);assert.equal(other.openCrate(()=>0).ok,false);assert.equal(other.snapshot.wallet.coal,5100);
});
test('multiple successive openings are bounded and credit exactly once each',()=>{
 const {wallet}=fixture({count:20,lastDaily:null});for(let i=0;i<20;i++)assert.equal(wallet.openCrate(()=>.4).ok,true);assert.equal(wallet.crateCount,0);assert.equal(wallet.snapshot.wallet.coal,9000);assert.equal(wallet.openCrate(()=>.4).ok,false);
});
test('first daily victory, repeated claim and second victory same day',()=>{
 const {wallet}=fixture({count:0,lastDaily:null}),a=win();wallet.claim(a,()=>.99,{now:day1,crateRandom:()=>.99});assert.equal(wallet.crateCount,1);assert.equal(wallet.snapshot.crates.lastDaily,'2026-10-06');
 wallet.claim(a,()=>{throw Error('resources reroll');},{now:day2,crateRandom:()=>{throw Error('crate reroll');}});assert.equal(wallet.crateCount,1);
 wallet.claim(win(),()=>.99,{now:day1,crateRandom:()=>.99});assert.equal(wallet.crateCount,1);
});
test('daily date survives reload and next local day awards again; backwards clock does not',()=>{
 const {wallet,storage}=fixture({count:0,lastDaily:null});wallet.claim(win(),()=>.99,{now:day1,crateRandom:()=>.99});const reloaded=new Wallet(storage);reloaded.claim(win(),()=>.99,{now:day1,crateRandom:()=>.99});assert.equal(reloaded.crateCount,1);reloaded.claim(win(),()=>.99,{now:day2,crateRandom:()=>.99});assert.equal(reloaded.crateCount,2);reloaded.claim(win(),()=>.99,{now:day1,crateRandom:()=>.99});assert.equal(reloaded.crateCount,2);
});
test('bonus victory chance boundary and daily+random can stack',()=>{
 const {wallet}=fixture({count:0,lastDaily:null}),a=win();wallet.claim(a,()=>.99,{now:day1,crateRandom:()=>.099999});assert.equal(wallet.crateCount,2);assert.deepEqual(wallet.crateClaims.get(a),{daily:1,bonus:1});wallet.claim(win(),()=>.99,{now:day1,crateRandom:()=>.1});assert.equal(wallet.crateCount,2);
});
test('defeat and incomplete synthetic victory never award or draw crates; resources unchanged',()=>{
 const {wallet}=fixture({count:0,lastDaily:null});for(const r of [{...win(),status:'lost'},{...win(),completedWaves:19}]){const before=wallet.snapshot.wallet;wallet.claim(r,()=>.99,{now:day1,crateRandom:()=>{throw Error('no draw');}});assert.equal(wallet.crateCount,0);assert.equal(wallet.snapshot.wallet.coal,before.coal+94);assert.equal(wallet.snapshot.wallet.iron,before.iron+8);}
});
test('daily grant at stock ceiling cannot overflow count or consume unavailable daily reward',()=>{
 const {wallet}=fixture({count:CRATE_RULES.maxCount,lastDaily:null});wallet.claim(win(),()=>.99,{now:day1,crateRandom:()=>0});assert.equal(wallet.crateCount,CRATE_RULES.maxCount);assert.equal(wallet.snapshot.crates.lastDaily,null);
});
test('exchange spends exactly three tokens, persists crate and refuses insufficient balance',()=>{
 const {wallet,storage}=fixture({count:0,lastDaily:null});assert.equal(wallet.exchangeTokens().ok,true);assert.equal(wallet.snapshot.wallet.token,4);assert.equal(wallet.crateCount,1);assert.equal(wallet.exchangeTokens().ok,true);assert.equal(wallet.snapshot.wallet.token,1);assert.equal(wallet.crateCount,2);assert.equal(wallet.exchangeTokens().ok,false);assert.equal(new Wallet(storage).snapshot.wallet.token,1);
});
test('exchange write failure and stock cap never spend tokens',()=>{
 const {wallet,backend}=fixture(),before=wallet.snapshot;backend.setItem=()=>{throw Error('blocked');};assert.equal(wallet.exchangeTokens().ok,false);assert.deepEqual(wallet.snapshot,before);
 const full=fixture({count:CRATE_RULES.maxCount,lastDaily:null}).wallet;assert.equal(full.exchangeTokens().ok,false);assert.equal(full.snapshot.wallet.token,7);
});
test('Atelier, talents and Relève transactions preserve crate count/date after reload',()=>{
 const {wallet,storage}=fixture({count:2,lastDaily:'2026-10-06'});wallet.buy('power');wallet.buyTalent('good-start');wallet.claimRelief(day1+3600000);const reloaded=new Wallet(storage);assert.deepEqual(reloaded.snapshot.crates,{count:2,lastDaily:'2026-10-06'});assert.equal(reloaded.snapshot.levels.power,1);assert.ok(reloaded.snapshot.talents.includes('good-start'));assert.equal(reloaded.snapshot.relief.startedAt,day1+3600000);
});
test('V0.17 leaves all V0.16 combat/talent/Atelier/Relève/drop code byte-identical',async()=>{
 const root=new URL('./v016-src-snapshot/',import.meta.url),allowed=[...V021_FILES,...VISUAL_FILES,...RAIL_INTEGRATION_FILES,'wallet.js','local-profile-storage.js','ui.js','menu/main-menu.js','menu/state.js','menu/menu.css'];
 async function visit(prefix=''){for(const entry of await readdir(new URL(prefix,root),{withFileTypes:true})){const file=prefix+entry.name;if(entry.isDirectory())await visit(file+'/');else if(!allowed.includes(file))assert.deepEqual(await readFile(new URL(file,root)),preserveWorkshopHint(file,await readFile(new URL('../src/'+file,import.meta.url))),file);}}await visit();
});
