import {historicalSource,PreInstantRun} from './instant-fire-compat.js';
import {riftMetrics} from './v027-metrics.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {Run} from '../src/run.js';import {legacyRunWithCracheferRetry} from './crachefer-patch-compat.js';
const OldRun=await legacyRunWithCracheferRetry(new URL('./v027-before-src-snapshot/run.js',import.meta.url));
import {RIFT_LIMITS,RIFT_PATTERNS,RIFT_BOSSES,radialAngles,spreadAngles} from '../src/rift/config.js';import {RiftGround,riftHazardTouches} from '../src/rift/combat.js';
import {createBoss} from '../src/bosses.js';import {createEnemy} from '../src/enemies/registry.js';import {ZONE_CONFIGS,zoneRewards} from '../src/zones.js';
import {zoneAvailable,completeZone,sanitizeProgress} from '../src/zone-progress.js';import {LocalProfileStorage,emptyProfile} from '../src/local-profile-storage.js';import {Wallet} from '../src/wallet.js';import {ZONES,MenuState} from '../src/menu/state.js';
import {V027_FILES} from './v027-authorized-files.js';import {simulateV027} from './v027-simulation.mjs';
const stage=(id='splitter')=>{const r=new Run(()=>.5,{}, {zoneId:'rift'});r.untilSpawn=999;r.weapon.cooldown=999;const e=RIFT_BOSSES[id]?createBoss(1,id,[225,260]):createEnemy(id,1,225,260);e.warmup=0;r.enemies=[e];r.player.x=225;r.player.y=530;return {r,e};};
const step=(r,s)=>{const events=[];for(let i=0;i<Math.round(s*60);i++)events.push(...r.update(1/60));return events;};
test('V027 Zone 4 requires a completed Puits, legacy wins migrate and Zone 5 still requires a Rift victory',()=>{
 for(const p of [{},{tracksCompleted:true},{riftUnlocked:true}])assert.equal(zoneAvailable('rift',p),false);
 const p=completeZone('shaft59',{tracksCompleted:true}).progress;assert.equal(zoneAvailable('rift',p),true);assert.equal(zoneAvailable('rift',{shaftCompleted:true}),true);
 assert.equal(ZONES[3].name,'LA FAILLE DE GRISOU');assert.equal(ZONES[4].playable,true);assert.equal(zoneAvailable(ZONES[4].id,p),false);assert.deepEqual(new MenuState().launch('rift',p),{weaponId:'shotgun',zoneId:'rift'});
});
test('V027 20 waves introduce each new mob progressively, keep choices and boss schedule',()=>{
 const z=ZONE_CONFIGS.rift;assert.equal(z.waves.length,20);assert.deepEqual(z.choices,ZONE_CONFIGS.shaft59.choices);assert.equal(z.epicAfter,19);
 assert.deepEqual(z.waves.filter(w=>w.boss).map(w=>w.id),['rift-5','rift-10','rift-15','rift-20']);assert.equal(z.waves[19].bosses.length,3);
 assert.ok(z.waves[0].enemies.includes('crawler'));assert.ok(!z.waves.slice(0,4).some(w=>w.enemies.includes('burster')));assert.ok(z.waves[5].enemies.includes('burster'));assert.ok(z.waves.filter(w=>!w.boss).every(w=>w.maxAlive<=12));
});
test('V027 first win adds one diamond once across reload, retaining every old meta field',()=>{
 let raw=JSON.stringify({...emptyProfile(),wallet:{coal:34,iron:12,diamond:3,token:2},levels:{power:1,health:2,mechanics:0,mobility:1},progress:{shaftCompleted:true},relief:{startedAt:1700000000000},talents:['porion-eye'],crates:{count:4,lastDaily:'2099-01-01'}});
 const storage=new LocalProfileStorage({getItem:()=>raw,setItem:(_,v)=>raw=v});const w=new Wallet(storage),before=w.snapshot;
 const run={world:ZONE_CONFIGS.rift,status:'won',completedWaves:20,collectedRewards:{coal:0,iron:0,diamond:0,token:0}};
 const gains=w.claim(run,()=>.99,{crateRandom:()=>.99});assert.equal(gains.diamond,1);assert.equal(w.snapshot.progress.riftCompleted,true);
 const second=new Wallet(storage);assert.equal(second.claim({...run},()=>.99,{crateRandom:()=>.99}).diamond,0);
 for(const key of ['levels','talents','relief','crates'])assert.deepEqual(second.snapshot[key],before[key]);assert.equal(second.snapshot.wallet.diamond,4);
 assert.equal(completeZone('shaft59',second.snapshot.progress).progress.riftCompleted,true);
});
test('V027 rewards are 118 coal / 11 guaranteed iron with unchanged tokens and a small diamond chance',()=>{
 const sum=plans=>plans.reduce((s,p)=>({coal:s.coal+p.coal,iron:s.iron+p.iron,token:s.token+p.token,diamond:s.diamond+p.diamond}),{coal:0,iron:0,token:0,diamond:0});
 const r=sum(zoneRewards(ZONE_CONFIGS.rift,()=>.99));assert.equal(r.coal,118);assert.equal(r.iron,11);assert.equal(r.token,0);assert.equal(r.diamond,0);
 assert.equal(sanitizeProgress({riftCompleted:true}).shaftCompleted,true);
});
for(const kind of ['crawler','spitter','burster'])test('V027 '+kind+' spawns safely, takes weapon damage, dies and credits physical drops/Grisou',()=>{
 const {r,e}=stage(kind);r.weapon.cooldown=0;r.grisou.enabled=true;e.hp=1;e.x=225;e.y=430;const events=step(r,2);assert.ok(events.some(v=>v.type==='kill'&&v.id===e.id));assert.equal(e.alive,false);assert.equal(r.loot.deaths.size,1);assert.equal(r.grisou.kills,1);
 const fresh=new Run(()=>.5,{}, {zoneId:'rift'});fresh.spawn();assert.ok(fresh.enemies.every(e=>Math.hypot(e.x-fresh.player.x,e.y-fresh.player.y)>180&&e.warmup>0));
});
test('V027 crawler advances in zigzags without attack pauses',()=>{const {r,e}=stage('crawler');const xs=[];for(let i=0;i<100;i++){r.update(1/60);xs.push(e.x);}assert.ok(Math.max(...xs)-Math.min(...xs)>8);assert.ok(e.y>350);assert.equal(e.phase,'positioning');});
test('V027 spitter flees a close player, locks a warned pocket and repositions after it',()=>{
 const {r,e}=stage('spitter');r.player.x=245;r.player.y=260;step(r,.2);assert.ok(e.x<225);r.player.x=225;r.player.y=500;e.phaseTime=0;r.update(.01);assert.equal(e.phase,'warning');const h={...r.shaftHazards.items[0]};r.player.x=60;step(r,.5);assert.equal(r.shaftHazards.items[0].x,h.x);assert.equal(r.shaftHazards.items[0].active,false);step(r,1.3);assert.equal(e.phase,'recovery');assert.ok(Math.hypot(e.x-225,e.y-260)>15);
});
test('V027 burster accelerates near the player and warns its explosion at low HP',()=>{
 const {r,e}=stage('burster');e.phaseTime=10;const y=e.y;step(r,.2);const far=e.y-y;e.x=225;e.y=430;const closeY=e.y;step(r,.2);assert.ok(e.y-closeY>far*1.5);e.hp=10;e.phaseTime=0;r.update(.01);assert.equal(e.pattern,'blast');assert.equal(e.phase,'warning');assert.ok(r.shaftHazards.items[0].warning>1);
});
test('V027 death shards warn before six slow radial projectiles and cannot recurse',()=>{
 const {r,e}=stage('burster');e.hp=0;r.rift.deaths([{type:'kill',id:e.id}]);assert.equal(r.rift.shots.bursts.length,1);assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,0);r.rift.deaths([{type:'kill',id:e.id}]);assert.equal(r.rift.shots.bursts.length,1);
 const s=r.rift.shots;for(let i=0;i<60;i++)s.update(1/60,r.player,r.player,()=>{});assert.equal(s.pool.filter(b=>b.active).length,0);for(let i=0;i<8;i++)s.update(1/60,r.player,r.player,()=>{});assert.equal(s.pool.filter(b=>b.active).length,6);for(let i=0;i<240;i++)s.update(1/60,r.player,r.player,()=>{});assert.equal(s.bursts.length,0);assert.equal(s.pool.filter(b=>b.active).length,0);
});
test('V027 environment gas/explosion pockets warn, damage, expire and never fill the arena',()=>{
 const r=new Run(()=>.5,{}, {zoneId:'rift'});r.waveIndex=1;r.untilSpawn=999;r.rift.ground.until=0;step(r,.1);assert.equal(r.shaftHazards.items.length,2);const h=r.shaftHazards.items[0];assert.equal(h.active,false);r.player.x=h.x;r.player.y=h.y;const hp=r.player.hp;step(r,1);assert.equal(r.player.hp,hp);step(r,.8);assert.ok(r.player.hp<hp);step(r,1);assert.equal(r.shaftHazards.items.length,0);
});
for(const [id,pattern] of [['splitter','charge'],['splitter','fan8'],['splitter','fissures'],['blower','circle8'],['blower','pockets'],['blower','cone'],['core','double'],['core','rain'],['core','orb']])test('V027 '+id+' executes '+pattern+' with a full locked warning',()=>{
 const {r,e}=stage(id);assert.equal(r.rift.begin(e,pattern,r.player),true);const x=e.x,y=e.y,a=e.attackAngle;if(RIFT_PATTERNS[pattern].count){r.update(0);assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,pattern==='double'?8:RIFT_PATTERNS[pattern].count);if(pattern==='double'){step(r,.65);assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,16);}return;}step(r,.6);assert.equal(e.phase,'warning');assert.equal(e.x,x);assert.equal(e.y,y);assert.equal(e.attackAngle,a);
 step(r,RIFT_PATTERNS[pattern].warning-.6+.05);
 if(pattern==='charge'){assert.equal(e.phase,'charge');const locked=e.chargeAngle;r.player.x=50;step(r,.4);assert.equal(e.chargeAngle,locked);assert.ok(e.y-y>100);}
 else if(RIFT_PATTERNS[pattern].ground){assert.equal(r.shaftHazards.items.length,RIFT_PATTERNS[pattern].ground);assert.ok(r.shaftHazards.items.every(h=>h.active));}
 else {assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,pattern==='double'?8:RIFT_PATTERNS[pattern].count);if(pattern==='double'){step(r,.65);assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,16);}}
});
test('V027 fan8 is symmetrical, circle8 is evenly spaced and safe gaps remain',()=>{const a=spreadAngles(.7,8,Math.PI*.72);for(let i=0;i<8;i++)assert.ok(Math.abs(a[i]+a[7-i]-1.4)<1e-9);const c=radialAngles(.2,8);assert.ok(Math.abs(c[1]-c[0]-Math.PI/4)<1e-9);assert.ok(2*120*Math.sin(Math.PI/8)>2*(13+5));});
test('V027 four pockets and fissures leave safe positions and collide only after activation',()=>{
 for(const pattern of ['pockets','fissures']){const {r,e}=stage(pattern==='fissures'?'splitter':'blower');r.rift.begin(e,pattern,r.player);const h=r.shaftHazards.items[0];assert.equal(h.active,false);let safe=0;for(let x=60;x<400;x+=20)for(let y=150;y<630;y+=20)if(r.shaftHazards.items.every(h=>!riftHazardTouches(h,{x,y,radius:13})))safe++;assert.ok(safe>150,safe);}
});
test('V027 orb expires into a separately warned six-shot burst, without homing',()=>{
 const {r,e}=stage('core');r.rift.begin(e,'orb',r.player);r.update(0);const b=r.hostileProjectiles.pool.find(b=>b.active),a=b.angle;r.player.x=60;step(r,.4);assert.equal(b.angle,a);step(r,2);assert.ok(r.rift.shots.bursts.length>0);const warning=r.rift.shots.bursts[0].warning;assert.ok(warning>0);step(r,1.2);assert.ok(r.hostileProjectiles.pool.filter(b=>b.active).length>=6);
});
for(const id of Object.keys(RIFT_BOSSES))test('V027 '+id+' resumes within 0.5 s and has faster low-HP cycles',()=>{
 const {r,e}=stage(id);e.recover();const x=e.x,y=e.y;step(r,.25);assert.equal(e.x,x);assert.equal(e.y,y);step(r,.25);assert.ok(Math.hypot(e.x-x,e.y-y)>8);e.hp=e.maxHealth*.4;e.recover();assert.equal(e.phaseTime,.75);
});
test('V027 atomic budgets delay whole patterns instead of silently dropping them',()=>{
 const {r,e}=stage('core');for(let i=0;i<10;i++)Object.assign(r.hostileProjectiles.pool[i],{active:true,owner:99});assert.equal(r.rift.begin(e,'double',r.player),false);assert.equal(e.phase,'positioning');r.hostileProjectiles.clear();assert.equal(r.rift.begin(e,'double',r.player),true);assert.equal(r.hostileProjectiles.reservations.get(e.id),16);
 const other=createBoss(2,'blower',[120,200]);other.warmup=0;r.enemies.push(other);assert.equal(r.rift.begin(other,'circle8',r.player),true);assert.equal(r.hostileProjectiles.free(),0);
 assert.equal(r.rift.release(e),true);assert.equal(r.rift.release(other),true);assert.equal(r.rift.release(e,true),true);assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,24);
});
test('V027 ground budget delays a fifth danger and rejects four fissures',()=>{const g=new RiftGround();assert.equal(g.request(1,[{x:100,y:200},{x:300,y:200},{x:100,y:500},{x:300,y:500}]),true);assert.equal(g.request(2,[{x:200,y:300}]),false);g.clear();assert.equal(g.request(1,Array(4).fill({x:100,y:200,x2:300,y2:200}),{kind:'fissure'}),false);});
for(const zoneId of ['galleries','tracks','shaft59'])test('Historical pre-instant contract: V027 preserves actual normal/solo/triple combat of '+zoneId,()=>{
 for(const wave of [1,5,10,15,20]){const a=new PreInstantRun(()=>.5,{}, {zoneId}),b=new OldRun(()=>.5,{}, {zoneId});for(const r of [a,b])if(wave>1){r.waveIndex=wave-2;r.wavePhase='cleared';r.enterNextWave();}for(let i=0;i<650;i++){const input={x:Math.cos(i/110),y:Math.sin(i/110)};assert.deepEqual(a.update(1/60,input),b.update(1/60,input));}assert.deepEqual(JSON.parse(JSON.stringify(a.enemies)),JSON.parse(JSON.stringify(b.enemies)));}
});
test('V027 retains all unrelated source bytes, including weapons and perks',async()=>{const hashes=JSON.parse(await historicalSource(new URL('./v027-before-hashes.json',import.meta.url)));for(const [f,h]of Object.entries(hashes))if(!V027_FILES.includes(f))assert.equal(createHash('sha256').update(await historicalSource(new URL('../src/'+f,import.meta.url))).digest('hex'),h,f);});
for(const weaponId of ['shotgun','smg','grisoux'])test('V027 complete Rift is winnable with '+weaponId+' and stays within safety limits',async()=>{const r=simulateV027({weaponId});await writeFile(new URL('./v027-run-'+weaponId+'.json',import.meta.url),JSON.stringify(r,null,2));assert.equal(r.status,'won',JSON.stringify(r));assert.equal(r.wave,20);assert.equal(r.bosses.length,4);assert.equal(r.choices,6);assert.ok(r.maxBolts<=24);assert.ok(r.maxZones<=4);assert.ok(r.maxEntities<=12);assert.equal(r.movingShots,0);assert.equal(r.rewards.coal,118);assert.equal(r.rewards.iron,11);});

test('V027 triple overlaps real attacks, all bosses move, late phase increases overlap without budget overflow',()=>{
 const early=riftMetrics(),late=riftMetrics(true);assert.ok(early.dual>45);assert.ok(early.triple>10);assert.ok(late.dual>early.dual);assert.ok(late.triple>early.triple);assert.ok(late.meanBolts>early.meanBolts);
 for(const r of [early,late]){assert.ok(r.major<=2);assert.ok(r.bolts<=24);assert.ok(r.ground<=4);assert.ok(r.longestCalm<1);assert.ok(Object.values(r.distance).every(d=>d>1000));}
});
test('V027 a boss cannot layer its next major over its own lingering major; waiting boss still moves',()=>{
 const {r,e}=stage('splitter');r.rift.begin(e,'fan8',r.player);r.rift.release(e);e.recover();e.phase='positioning';e.phaseTime=0;e.attackCount=2;
 const x=e.x,y=e.y;step(r,.1);assert.equal(e.phase,'positioning');assert.equal(e.attackCount,2);assert.ok(Math.hypot(e.x-x,e.y-y)>1);
});

test('V027 last enemy death finishes warned shards before collection; no fresh gas after clearance',()=>{
 const {r,e}=stage('burster');r.spawned=r.wave.total;e.hp=1;e.y=430;r.weapon.cooldown=0;
 for(let i=0;i<60&&e.alive;i++)r.update(1/60);
 assert.equal(e.alive,false);assert.equal(r.wavePhase,'combat');assert.equal(r.rift.shots.bursts.length,1);
 r.damagePlayer=()=>false;for(let i=0;i<360&&r.wavePhase==='combat';i++)r.update(1/60);assert.equal(r.wavePhase,'collecting');assert.equal(r.rift.shots.bursts.length,0);
});
