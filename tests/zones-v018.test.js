import test from 'node:test';
import assert from 'node:assert/strict';
import { TRACKS, ZONE_CONFIGS, zoneRewards } from '../src/zones.js';
import { zoneAvailable, sanitizeProgress } from '../src/zone-progress.js';
import { LocalProfileStorage, emptyProfile, sanitizeProfile } from '../src/local-profile-storage.js';
import { Wallet } from '../src/wallet.js';
const fixture=()=>{let raw=null;const storage=new LocalProfileStorage({getItem:()=>raw,setItem:(_,v)=>raw=v});return {storage,wallet:new Wallet(storage)};};
const win=id=>({world:ZONE_CONFIGS[id],status:'won',completedWaves:20,collectedRewards:{coal:0,iron:0,diamond:0,token:0}});
const claim=(wallet,run)=>wallet.claim(run,()=>.99,{crateRandom:()=>.99});
test('V0.18 legacy saves stay intact and tracks/zone3 requires a tracks victory',()=>{
 assert.deepEqual(sanitizeProfile(emptyProfile()),emptyProfile());assert.equal(zoneAvailable('tracks'),false);assert.equal(zoneAvailable('shaft59',{galleriesCompleted:true,tracksCompleted:true}),true);
 assert.deepEqual(sanitizeProgress({tracksUnlocked:true}),{shaftUnlocked:false,shaftCompleted:false,shaftFirstVictoryClaimed:false,galleriesCompleted:false,tracksUnlocked:false,tracksCompleted:false,tracksFirstVictoryClaimed:false});
});
test('full galleries victory permanently unlocks tracks; loss/incomplete win do not',()=>{
 const {storage,wallet}=fixture();for(const run of [{...win('galleries'),status:'lost'},{...win('galleries'),completedWaves:19}])claim(wallet,run);
 assert.equal(zoneAvailable('tracks',wallet.snapshot.progress),false);claim(wallet,win('galleries'));assert.equal(zoneAvailable('tracks',new Wallet(storage).snapshot.progress),true);
});
test('first tracks victory grants one diamond exactly once across instances and reload',()=>{
 const {storage,wallet}=fixture();claim(wallet,win('galleries'));const stale=new Wallet(storage),run=win('tracks');
 assert.equal(claim(wallet,run).diamond,1);assert.equal(claim(wallet,run).diamond,1);assert.equal(wallet.snapshot.wallet.diamond,1);
 assert.equal(claim(stale,win('tracks')).diamond,0);assert.equal(new Wallet(storage).snapshot.wallet.diamond,1);assert.equal(stale.snapshot.progress.tracksCompleted,true);
});
test('tracks has 20 bounded waves, bosses at 5/10/15 and triple20, unchanged choice schedule',()=>{
 assert.equal(TRACKS.waves.length,20);assert.deepEqual(TRACKS.waves.flatMap((w,i)=>w.boss?[i+1]:[]),[5,10,15,20]);assert.deepEqual(TRACKS.waves[19].bosses,TRACKS.bosses);
 assert.deepEqual(TRACKS.choices,ZONE_CONFIGS.galleries.choices);assert.equal(TRACKS.epicAfter,19);
 for(const w of TRACKS.waves){assert.ok(w.maxAlive<=12);assert.equal(w.total,w.boss?w.bosses.length:w.enemies.length);}
 assert.ok(TRACKS.waves[0].enemies.includes('wagon'));assert.ok(TRACKS.waves[5].enemies.includes('draisine'));
 const total=w=>w.waves.filter(w=>!w.boss).reduce((s,w)=>s+w.total,0);const ratio=total(TRACKS)/total(ZONE_CONFIGS.galleries);assert.ok(ratio>=1.15&&ratio<=1.25);
});
test('tracks reward budget is 108 coal, 9 guaranteed iron, unchanged tokens and small diamond bonus',()=>{
 const sum=plans=>plans.reduce((s,p)=>{for(const k in p)s[k]+=p[k];return s;},{coal:0,iron:0,diamond:0,token:0});
 assert.deepEqual(sum(zoneRewards(TRACKS,()=>.99)),{coal:108,iron:9,diamond:0,token:0});assert.deepEqual(sum(zoneRewards(TRACKS,()=>0)),{coal:108,iron:12,diamond:3,token:1});
 assert.deepEqual(sum(zoneRewards(ZONE_CONFIGS.galleries,()=>.99)),{coal:94,iron:8,diamond:0,token:0});
});
