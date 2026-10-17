import {historicalSource} from './instant-fire-compat.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {ZONE_CONFIGS,zoneRewards} from '../src/zones.js';import {ZONE_CONFIGS as OLD,zoneRewards as oldRewards} from './v023-final-src-snapshot/zones.js';
import {Run} from '../src/run.js';import {createEnemy} from '../src/enemies/registry.js';import {createBoss} from '../src/bosses.js';
import {ShaftHazards,shaftHazardTouches} from '../src/shaft-hazards.js';import {zoneAvailable,zoneCompleted,sanitizeProgress} from '../src/zone-progress.js';
import {LocalProfileStorage,emptyProfile} from '../src/local-profile-storage.js';import {Wallet} from '../src/wallet.js';import {simulateV024} from './v024-simulation.mjs';import {V024_FILES} from './v024-authorized-files.js';
const zone=ZONE_CONFIGS.shaft59;
const fixture=()=>{let raw=JSON.stringify({...emptyProfile(),progress:{tracksCompleted:true}});const storage=new LocalProfileStorage({getItem:()=>raw,setItem:(_,v)=>raw=v});return {storage,wallet:new Wallet(storage)};};
const win=(id='shaft59')=>({world:ZONE_CONFIGS[id],status:'won',completedWaves:20,collectedRewards:{coal:113,iron:10,diamond:0,token:0}});
test('V024 legacy tracks victories unlock shaft; missing or forged unlock flags do not',()=>{
 assert.equal(zoneAvailable('shaft59'),false);assert.equal(zoneAvailable('shaft59',{galleriesCompleted:true}),false);assert.equal(zoneAvailable('shaft59',{shaftUnlocked:true}),false);assert.equal(zoneAvailable('shaft59',{tracksCompleted:true}),true);assert.equal(zoneAvailable('depths',{shaftCompleted:true}),false);
});
test('V024 tracks victory unlocks shaft persistently; loss and partial victory do not',()=>{
 const {wallet,storage}=fixture();wallet.profile.progress={galleriesCompleted:true};storage.write(wallet.snapshot);
 wallet.claim({...win('tracks'),status:'lost'},()=>.99);assert.equal(zoneAvailable('shaft59',wallet.snapshot.progress),false);
 wallet.claim({...win('tracks'),completedWaves:19},()=>.99);assert.equal(zoneAvailable('shaft59',wallet.snapshot.progress),false);
 wallet.claim(win('tracks'),()=>.99);assert.equal(zoneAvailable('shaft59',new Wallet(storage).snapshot.progress),true);
});
test('V024 first shaft victory adds exactly one diamond, persists completion and cannot be reclaimed after reload',()=>{
 const {wallet,storage}=fixture(),r=win();assert.equal(wallet.claim(r,()=>.99).diamond,1);wallet.claim(r,()=>.99);const w=new Wallet(storage);assert.equal(w.snapshot.wallet.diamond,1);assert.equal(zoneCompleted('shaft59',w.snapshot.progress),true);assert.equal(w.claim(win(),()=>.99).diamond,0);assert.equal(zoneAvailable('depths',w.snapshot.progress),false);
});
test('V024 old profile resource balances, upgrades, talents and crate extension survive sanitizing progress',()=>{
 const {wallet,storage}=fixture();wallet.profile.wallet={coal:100,iron:25,diamond:3,token:2};wallet.profile.levels.power=2;wallet.profile.talents=['cold-blood'];wallet.profile.crates={count:2,lastDaily:null};storage.write(wallet.snapshot);
 const w=new Wallet(storage);assert.deepEqual(w.snapshot.wallet,wallet.snapshot.wallet);assert.equal(w.snapshot.levels.power,2);assert.deepEqual(w.snapshot.talents,['cold-blood']);assert.equal(w.crateCount,2);assert.equal(w.snapshot.progress.shaftUnlocked,true);
});
test('V024 preserves original zone definitions and every reward RNG branch',()=>{
 for(const id of ['galleries','tracks']){assert.deepEqual(ZONE_CONFIGS[id],OLD[id]);for(const r of [0,.01,.04,.1,.5,.99])assert.deepEqual(zoneRewards(ZONE_CONFIGS[id],()=>r),oldRewards(OLD[id],()=>r));}
});
test('V024 twenty waves introduce enemies progressively, retain choice schedule and end with the three bosses',()=>{
 assert.equal(zone.waves.length,20);assert.deepEqual(zone.waves.flatMap((w,i)=>w.boss?[i+1]:[]),[5,10,15,20]);assert.deepEqual(zone.waves[19].bosses,['cager','compressor','firedamp']);assert.deepEqual(zone.choices,OLD.tracks.choices);assert.equal(zone.epicAfter,19);
 assert.ok(zone.waves[0].enemies.includes('deepdriller'));assert.ok(!zone.waves.slice(0,4).some(w=>w.enemies.includes('gasminer')));assert.ok(zone.waves[5].enemies.includes('gasminer'));
 for(const w of zone.waves){assert.ok(w.maxAlive<=12);assert.equal(w.total,w.boss?w.bosses.length:w.enemies.length);if(w.boss)assert.ok(!w.instability);}
 assert.ok(zone.waves.filter(w=>w.instability).length>5);assert.ok(zone.waves.some(w=>!w.boss&&!w.instability));
});
test('V024 normal spawn opportunity frequency is about 20 percent higher than tracks, without increasing entity cap',()=>{
 for(let tier=0;tier<4;tier++){const previous=OLD.tracks.waves.slice(tier*5,tier*5+4).reduce((s,w)=>s+w.interval,0)/4;const ratio=previous/zone.waves[tier*5].interval;assert.ok(ratio>1.15&&ratio<1.25);}
});
test('V024 reward budget is 113 coal, 10 guaranteed iron, modest diamond bonus and unchanged tokens',()=>{
 const sum=(z,r)=>zoneRewards(z,()=>r).reduce((a,p)=>{for(const k in a)a[k]+=p[k];return a;},{coal:0,iron:0,diamond:0,token:0});
 assert.deepEqual(sum(zone,.99),{coal:113,iron:10,diamond:0,token:0});assert.equal(sum(zone,0).diamond,sum(OLD.galleries,0).diamond+1);assert.equal(sum(zone,0).token,sum(OLD.galleries,0).token);
});
for(const kind of ['deepdriller','surveyor','gasminer'])test('V024 '+kind+' has a safe spawn, takes weapon damage and participates in kill/drop/Grisou flow',()=>{
 const r=new Run(()=>.5,{}, {zoneId:'shaft59',weaponId:'grisoux'});r.waveIndex=5;r.untilSpawn=999;r.spawned=r.wave.total;r.grisou.enabled=true;
 const e=createEnemy(kind,1,225,330);e.warmup=0;r.enemies=[e];r.player.x=225;r.player.y=470;e.hp=1;
 let kills=0;for(let i=0;i<120&&!kills;i++)kills+=r.update(1/60).filter(v=>v.type==='kill').length;
 assert.equal(e.alive,false);assert.equal(kills,1);assert.equal(r.grisou.kills,1);assert.equal(r.loot.deaths.size,1);
});
test('V024 deep driller warns and locks its extended charge; cannot home after commitment',()=>{
 const e=createEnemy('deepdriller',1,200,250);e.warmup=0;e.phaseTime=0;e.update(.01,{x:280,y:250});assert.equal(e.phase,'warning');const a=e.chargeAngle,x=e.x,y=e.y;for(let i=0;i<90;i++)e.update(1/60,{x:60,y:600});assert.equal(e.chargeAngle,a);assert.ok(Math.abs(Math.atan2(e.y-y,e.x-x)-a)<1e-8);assert.ok(e.x>x&&e.x<320);
});
test('V024 surveyor approaches at range and retreats if too close',()=>{
 const e=createEnemy('surveyor',1,200,250);e.warmup=0;e.update(.1,{x:210,y:250});assert.ok(e.x<200);e.x=200;e.update(.1,{x:400,y:600});assert.ok(e.x>200);
});
test('V024 gas explosion warns, locks its location and has no recursive enemy explosions',()=>{
 const e=createEnemy('gasminer',1,200,250),hazards=new ShaftHazards();e.warmup=0;e.phaseTime=0;e.update(.01,{x:240,y:250},[],{shaftAttack:(o,p,s)=>hazards.request(o.id,p,s)});assert.equal(e.phase,'warning');assert.equal(hazards.items.length,1);const h=hazards.items[0];assert.equal(h.active,false);assert.equal(h.radius,62);const locked=h.x;e.x=350;assert.equal(h.x,locked);
});
test('V024 ground budget is shared, atomic, locked and removes dead owners',()=>{
 const h=new ShaftHazards(),r=new Run(()=>.5,{}, {zoneId:'shaft59'});r.enemies=[createEnemy('surveyor',1,100,200)];assert.ok(h.request(1,[r.player]));assert.ok(!h.request(1,[r.player]));assert.ok(h.request(0,[{x:100,y:200},{x:300,y:500}]));assert.equal(h.request(2,[r.player]),false);r.enemies[0].hp=0;h.update(.01,r,[]);assert.equal(h.items.length,2);
});
test('V024 instability damages only after warning, can be dodged, expires and leaves safe space',()=>{
 for(const dodge of [false,true]){const r=new Run(()=>.5,{}, {zoneId:'shaft59'}),h=r.shaftHazards;h.request(0,[r.player]);const hp=r.player.hp;h.update(1,r,[]);assert.equal(r.player.hp,hp);if(dodge)r.player.x+=100;h.update(.5,r,[]);assert.equal(r.player.hp,dodge?hp:hp-.5);h.update(1,r,[]);assert.equal(h.items.length,0);}
});
test('V024 cable hazard is vertical, bounded and avoidable on either side',()=>{
 const h=new ShaftHazards();h.request(1,[{x:220,y:116}],{vertical:true});const p=h.items[0];assert.ok(p.y-90>=116);assert.ok(shaftHazardTouches(p,{x:220,y:p.y+70,radius:13}));assert.ok(!shaftHazardTouches(p,{x:300,y:p.y,radius:13}));
});
for(const id of zone.bosses)test('V024 '+id+' executes its three distinct warned attacks and can die',()=>{
 const b=createBoss(1,id,[225,240]),h=new ShaftHazards(),patterns=[];b.warmup=0;const ctx={shaftAttack:(o,p,s)=>h.request(o.id,p,s),reserveCircle:()=>true};
 for(let i=0;i<3;i++){h.clear();b.beginWarning({x:225,y:480},ctx);patterns.push(b.pattern);assert.equal(b.phase,'warning');assert.equal(b.phaseTime,b.projectilePattern==='circle'?0:['steam','energy','charge'].includes(b.pattern)?1.3:1.5);const events=[];for(let f=0;f<110;f++)b.update(1/60,{x:225,y:480},events,ctx);if(['steam','radial','energy'].includes(b.pattern))assert.ok(events.some(e=>e.type==='enemy-shot'));}
 assert.equal(new Set(patterns).size,3);b.hit(99999,0,0);assert.equal(b.alive,false);
});
test('V024 triple admits two ground owners while the third retains its next attack',()=>{
 const r=new Run(()=>.5,{}, {zoneId:'shaft59'});r.waveIndex=18;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';r.weapon.cooldown=999;
 for(const b of r.enemies){b.warmup=0;b.phaseTime=0;b.attackCount=b.bossId==='cager'?2:b.bossId==='compressor'?2:0;}
 r.update(.01);assert.equal(new Set(r.shaftHazards.items.map(h=>h.owner)).size,2);assert.ok(r.enemies.some(e=>e.phase==='positioning'));assert.equal(r.hostileProjectiles.reservations.size,0);
});
test('V024 gameplay modules outside the zone extension, all prior art, weapons and meta systems remain byte-identical',async()=>{
 const hashes=JSON.parse(await historicalSource(new URL('./v023-final-hashes.json',import.meta.url)));for(const [file,hash]of Object.entries(hashes))if(!V024_FILES.includes(file))assert.equal(createHash('sha256').update(await historicalSource(new URL('../src/'+file,import.meta.url))).digest('hex'),hash,file);
});
for(const weaponId of ['shotgun','smg','grisoux'])test('V024 full shaft run with '+weaponId+' wins through four boss encounters within all budgets',()=>{
 const r=simulateV024({weaponId,zoneId:'shaft59'});assert.equal(r.status,'won');assert.equal(r.wave,20);assert.equal(r.choices,6);assert.equal(r.bosses.length,4);assert.ok(r.maxZones<=3&&r.maxZones>0);assert.ok(r.groundWarnings>0);assert.ok(r.maxBolts<=8);assert.ok(r.maxEntities<=12);assert.equal(r.movingShots,0);assert.deepEqual(r.rewards,{coal:113,iron:10,diamond:0,token:0});
});
