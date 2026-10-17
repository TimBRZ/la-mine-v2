import {historicalSource,PreInstantRun} from './instant-fire-compat.js';
import test from 'node:test';import assert from 'node:assert/strict';import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {Run} from '../src/run.js';import {legacyRunWithCracheferRetry} from './crachefer-patch-compat.js';
const BeforeRun=await legacyRunWithCracheferRetry(new URL('./zone5-before-src/run.js',import.meta.url));
import {createEnemy} from '../src/enemies/registry.js';import {createBoss} from '../src/bosses.js';
import {DEPTHS_ENEMIES,DEPTHS_BOSSES,DEPTHS_PATTERNS} from '../src/depths/config.js';
import {DepthsGround,Extinctions,depthsHazardTouches} from '../src/depths/combat.js';import {applyDepthsLighting,drawDepths} from '../src/depths/art.js';
import {ZONE_CONFIGS,zoneRewards} from '../src/zones.js';import {sanitizeProgress,completeZone,zoneAvailable,zoneCompleted} from '../src/zone-progress.js';
import {ZONES,MenuState} from '../src/menu/state.js';import {Wallet} from '../src/wallet.js';import {emptyProfile,LocalProfileStorage} from '../src/local-profile-storage.js';
import {RANKED_ZONES,compareDepth,recordPerformance} from '../src/leaderboard/records.js';import {LocalLeaderboardStore} from '../src/leaderboard/local-store.js';
import {ZONE5_FILES} from './zone5-authorized-files.js';import {simulateZone5} from './zone5-simulation.mjs';import {depthsMetrics} from './zone5-metrics.mjs';
const stage=(id='lampmajor')=>{const r=new Run(()=>.5,{}, {zoneId:'depths'});r.untilSpawn=999;r.weapon.cooldown=999;const e=DEPTHS_BOSSES[id]?createBoss(1,id,[225,240]):createEnemy(id,1,225,240);e.warmup=0;r.enemies=[e];r.player.x=225;r.player.y=510;return {r,e};};
const step=(r,s,input)=>{const events=[];for(let i=0;i<Math.round(s*60);i++)events.push(...r.update(1/60,input));return events;};
test('Zone 5 unlocks only after Rift victory; future reservation remains locked',()=>{
 for(const p of [{},{shaftCompleted:true},{depthsUnlocked:true}])assert.equal(zoneAvailable('depths',p),false);
 const p=completeZone('rift',{shaftCompleted:true}).progress;assert.equal(zoneAvailable('depths',p),true);assert.equal(zoneCompleted('depths',p),false);assert.deepEqual(new MenuState().launch('depths',p),{weaponId:'shotgun',zoneId:'depths'});
 assert.equal(ZONES[4].name,'LES PROFONDEURS NOIRES');assert.equal(ZONES[6].playable,false);assert.equal(ZONE_CONFIGS.future6,undefined);assert.equal(zoneAvailable('future6',{depthsCompleted:true}),false);
});
test('Zone 5 has 20 waves, six normal choices including opening and epic before triple',()=>{
 const z=ZONE_CONFIGS.depths;assert.equal(z.waves.length,20);assert.deepEqual(z.choices,ZONE_CONFIGS.rift.choices);assert.equal(z.epicAfter,19);
 assert.deepEqual(z.waves.filter(w=>w.boss).map(w=>[w.id,w.bosses]),[['depths-5',['lampmajor']],['depths-10',['dynamiter']],['depths-15',['blackmass']],['depths-20',['lampmajor','dynamiter','blackmass']]]);
 for(const [i,id]of ['lampist','blaster','blackmaw'].entries())assert.ok(z.waves[i].enemies.includes(id));assert.equal(z.waves[0].enemies.every(id=>id==='lampist'),true);assert.equal(z.waves[18].enemies.length,35);
});
test('Zone 5 first victory credits exactly two diamonds once across reload without changing meta',()=>{
 let raw=JSON.stringify({...emptyProfile(),progress:{riftCompleted:true},wallet:{coal:30,iron:12,diamond:7,token:2},crates:{count:3,lastDaily:'2099-01-01'},levels:{power:2,health:2,mechanics:1,mobility:1}});
 const storage=new LocalProfileStorage({getItem:()=>raw,setItem:(_,s)=>raw=s}),w=new Wallet(storage),before=w.snapshot;
 const victory={world:ZONE_CONFIGS.depths,status:'won',completedWaves:20,collectedRewards:{coal:0,iron:0,diamond:0,token:0}};
 assert.equal(w.claim(victory,()=>.99,{crateRandom:()=>.99}).diamond,2);assert.equal(w.snapshot.wallet.diamond,9);
 const reload=new Wallet(storage);assert.equal(reload.claim({...victory},()=>.99,{crateRandom:()=>.99}).diamond,0);assert.equal(zoneCompleted('depths',reload.snapshot.progress),true);
 for(const key of ['levels','talents','relief','crates'])assert.deepEqual(reload.snapshot[key],before[key]);
 assert.equal(completeZone('depths',{}).firstDiamond,0);
});
test('Legacy profiles keep fields and unlock derivation; loss/incomplete victory never unlocks',()=>{
 for(const progress of [{},{galleriesCompleted:true},{shaftCompleted:true},{riftCompleted:true}]){const p=sanitizeProgress(progress);assert.equal(p.depthsCompleted===true,false);assert.deepEqual(sanitizeProgress(p),p);}
 assert.equal(sanitizeProgress({depthsCompleted:true}).riftCompleted,true);
 for(const [status,completedWaves]of [['lost',20],['won',19]]){let raw=JSON.stringify({...emptyProfile(),progress:{riftCompleted:true}});const w=new Wallet(new LocalProfileStorage({getItem:()=>raw,setItem:(_,v)=>raw=v}));const result=w.claim({world:ZONE_CONFIGS.depths,status,completedWaves,collectedRewards:{coal:0,iron:0,diamond:0,token:0}},()=>.99,{crateRandom:()=>.99});assert.equal(result.diamond,0);assert.equal(zoneCompleted('depths',w.snapshot.progress),false);}
});
test('Zone 5 normal reward budget remains bounded: 123 coal, 12 iron, unchanged token rules',()=>{const plans=zoneRewards(ZONE_CONFIGS.depths,()=>.99);assert.equal(plans.reduce((s,p)=>s+p.coal,0),123);assert.equal(plans.reduce((s,p)=>s+p.iron,0),12);assert.equal(plans.reduce((s,p)=>s+p.token+p.diamond,0),0);});
test('Local ranking includes Zone 5 in correct order and persists through reload',()=>{
 assert.deepEqual(RANKED_ZONES.map(z=>z.id),['galleries','tracks','shaft59','rift','depths','forge']);const now=Date.now(),p={run_id:'depths-proof',zone_id:'depths',max_wave:20,completed:true,duration_ms:500000,depth_reached_ms:450000,weapon_id:'grisoux',run_started_at:new Date(now-500000).toISOString(),run_finished_at:new Date(now).toISOString(),client_version:'0.29.0',kills:256};
 assert.ok(compareDepth(p,{...p,zone_id:'rift'})<0);assert.equal(recordPerformance(null,p,now).times.depths.run_id,p.run_id);
 let raw=null;const storage={getItem:()=>raw,setItem:(_,s)=>raw=s};assert.equal(new LocalLeaderboardStore(storage).record(p,now).ok,true);assert.equal(new LocalLeaderboardStore(storage).read(now).state.depth.zone_id,'depths');
});
for(const kind of Object.keys(DEPTHS_ENEMIES))test(kind+' spawns away, takes all weapons, dies, drops loot and triggers Grisou',()=>{
 const fresh=new Run(()=>.5,{}, {zoneId:'depths'});fresh.waveIndex=['lampist','blaster','blackmaw'].indexOf(kind);assert.equal(fresh.spawn(),true);assert.ok(Math.hypot(fresh.enemies[0].x-fresh.player.x,fresh.enemies[0].y-fresh.player.y)>180);assert.ok(fresh.enemies[0].warmup>.8);
 for(const weaponId of ['shotgun','smg','grisoux']){const r=new Run(()=>.5,{}, {zoneId:'depths',weaponId}),e=createEnemy(kind,1,225,420);r.untilSpawn=999;r.player.x=225;r.player.y=500;e.hp=1;e.warmup=0;r.enemies=[e];r.grisou.enabled=true;const events=step(r,2);assert.ok(events.some(v=>v.type==='kill'&&v.id===e.id),weaponId);assert.equal(r.loot.deaths.size,1);assert.equal(r.grisou.kills,1);}
});
test('Lampiste retreats at short range, strafes at midrange and locks its luminous fan',()=>{const {r,e}=stage('lampist');r.player.y=280;step(r,.2);assert.ok(e.y<240);r.player.y=480;e.phaseTime=0;step(r,.02);assert.equal(e.phase,'recovery');assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,3);const a=e.shotAngles.slice();r.player.x=55;step(r,.6);assert.deepEqual(e.shotAngles,a);assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,3);assert.ok(r.hostileProjectiles.pool.filter(b=>b.active).every(b=>b.spec.speed===118));});
test('Boutefeu plants, retreats while charge warns, then explosion damages and expires',()=>{
 const {r,e}=stage('blaster');r.player.y=300;e.phaseTime=0;step(r,.02);assert.equal(e.phase,'recovery');assert.equal(r.shaftHazards.items.length,1);const h={...r.shaftHazards.items[0]},x=e.x,y=e.y;assert.equal(depthsHazardTouches(h,r.player),true);step(r,.7);assert.ok(Math.hypot(e.x-x,e.y-y)>20);assert.equal(r.shaftHazards.items[0].active,false);assert.equal(r.shaftHazards.items[0].x,h.x);
 e.phaseTime=999;e.reposition=()=>{};r.player.x=h.x;r.player.y=h.y;const hp=r.player.hp;step(r,1);assert.ok(r.player.hp<hp);step(r,.4);assert.equal(r.shaftHazards.items.length,0);
});
test('Gueule-Noire leap locks before movement and allows a lateral dodge',()=>{const {r,e}=stage('blackmaw');r.player.y=410;e.phaseTime=0;step(r,.02);assert.equal(e.phase,'warning');const a=e.chargeAngle,x=e.x,y=e.y,hp=r.player.hp;step(r,.7,{x:1,y:0});assert.equal(e.x,x);assert.equal(e.y,y);assert.equal(e.chargeAngle,a);step(r,.3);assert.equal(e.phase,'charge');assert.equal(e.chargeAngle,a);step(r,.6);assert.equal(e.phase,'recovery');assert.equal(r.player.hp,hp);});
for(const [id,patterns]of Object.entries({lampmajor:['beam','fan','blackout'],dynamiter:['charges','chain','ring','lob'],blackmass:['rush','slam','cracks','blackout']}))for(const pattern of patterns)test(id+' warns and executes '+pattern,()=>{
 const {r,e}=stage(id);assert.equal(r.depths.begin(e,pattern,r.player),true);const x=e.x,y=e.y,a=e.attackAngle;if(DEPTHS_PATTERNS[pattern].count){r.update(0);assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,DEPTHS_PATTERNS[pattern].count);assert.deepEqual(r.hostileProjectiles.pool.filter(b=>b.active).map(b=>b.angle),e.shotAngles);assert.equal(e.phase,'recovery');return;}step(r,.6);assert.equal(e.phase,'warning');assert.equal(e.x,x);assert.equal(e.y,y);assert.equal(e.attackAngle,a);const spec=DEPTHS_PATTERNS[pattern];step(r,spec.warning-.6+.05);
 if(spec.seconds){assert.equal(e.phase,'charge');const a=e.chargeAngle;r.player.x=55;step(r,.3);assert.equal(e.chargeAngle,a);}
 else if(spec.ground)assert.ok(r.shaftHazards.items.some(h=>h.active));
 else if(spec.count)assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,spec.count);
 else {assert.ok(r.depths.darkness.prelude>0);step(r,.31);assert.equal(r.depths.darkness.active,true);}
});
test('Extinctions have finite duration, cool down, pause correctly and reset between waves',()=>{
 const r=new Run(()=>.5,{}, {zoneId:'depths'});r.untilSpawn=999;step(r,9.4);assert.equal(r.depths.darkness.active,true);const n=r.depths.darkness.count;r.paused=true;const t=r.depths.darkness.remaining;step(r,1);assert.equal(r.depths.darkness.remaining,t);r.paused=false;step(r,3.1);assert.equal(r.depths.darkness.active,false);assert.equal(r.depths.darkness.count,n);
 const d=new Extinctions();assert.equal(d.start(true),true);assert.equal(d.remaining,2);assert.equal(d.start(true),false);
 r.wavePhase='cleared';r.enterNextWave();assert.equal(r.depths.darkness.active,false);
});
test('Lighting touches only background: player/enemy/projectile/telegraph layers remain intact',()=>{
 const calls=[],background={setTint:c=>calls.push(c),clearTint:()=>calls.push('clear')};applyDepthsLighting(background,{wavePhase:'combat',depths:{darkness:{active:true}}});assert.deepEqual(calls,[0x505868]);applyDepthsLighting(background,{wavePhase:'collecting',depths:{darkness:{active:true}}});assert.equal(calls[1],'clear');
 const {r,e}=stage();r.depths.begin(e,'beam',r.player);const ops=[];const g=new Proxy({}, {get:(_,key)=>(...args)=>{ops.push([key,args]);return g;}});drawDepths(g,r);const before=structuredClone(ops);ops.length=0;r.depths.darkness.start();drawDepths(g,r);assert.deepEqual(ops,before);
});
test('Every ground pattern has safe positions; warning collision does not damage; chains are ordered',()=>{
 for(const pattern of ['beam','charges','chain','lob','slam','cracks']){const {r,e}=stage();r.depths.begin(e,pattern,r.player);let safe=0;for(let x=55;x<395;x+=20)for(let y=150;y<625;y+=20)if(r.shaftHazards.items.every(h=>!depthsHazardTouches(h,{x,y,radius:13})))safe++;assert.ok(safe>100,pattern+':'+safe);
 const h=r.shaftHazards.items[0];r.player.x=h.x;r.player.y=h.y;e.contactDamage=0;const hp=r.player.hp;step(r,.5);assert.equal(r.player.hp,hp);step(r,1.1);assert.ok(r.player.hp<hp||pattern==='charges');
 if(pattern==='chain')assert.deepEqual(r.shaftHazards.items.map(h=>h.order),[1,2,3]);}
});
test('Atomic reservations enforce 24 projectiles, five hazards and three charges without partial attacks',()=>{
 const {r,e}=stage();for(let i=0;i<20;i++)Object.assign(r.hostileProjectiles.pool[i],{active:true,owner:99});assert.equal(r.depths.begin(e,'fan',r.player),false);assert.equal(e.phase,'positioning');r.hostileProjectiles.clear();assert.equal(r.depths.begin(e,'fan',r.player),true);assert.equal(r.hostileProjectiles.reservations.get(e.id),6);
 const g=new DepthsGround(),s={warning:1,duration:.3,charge:true};assert.equal(g.request(1,[{x:100,y:200},{x:200,y:200},{x:300,y:200}],s),true);assert.equal(g.request(2,[{x:200,y:400}],s),false);assert.equal(g.request(2,[{x:100,y:500},{x:300,y:500}],{...s,charge:false}),true);assert.equal(g.request(3,[{x:200,y:400}],{...s,charge:false}),false);assert.equal(g.items.length,5);
});
test('Death cancels owned ground/reservations, remaining projectiles expire and wave cleans up',()=>{const {r,e}=stage();r.spawned=r.wave.total;r.depths.begin(e,'beam',r.player);e.hp=0;step(r,.1);assert.equal(r.shaftHazards.items.length,0);assert.equal(r.hostileProjectiles.reservations.size,0);assert.equal(r.wavePhase,'collecting');});
test('Triple overlaps two and three bosses, never exceeds caps, has no long silence',async()=>{
 const values=[depthsMetrics(),depthsMetrics(true)];await writeFile(new URL('./zone5-triple-metrics.json',import.meta.url),JSON.stringify(values,null,2));
 for(const m of values){assert.ok(m.dual>30,JSON.stringify(m));assert.ok(m.tripleEngaged>3);assert.ok(m.major<=2);assert.ok(m.bolts<=24);assert.ok(m.ground<=5);assert.ok(m.longestCalm<2);assert.ok(Object.values(m.distance).every(d=>d>500));assert.equal(m.forbiddenCombos,0);assert.ok(m.darkSeconds>0&&m.darkSeconds<20);}
 assert.ok(values[1].dual>=values[0].dual-2);
});
for(const zoneId of ['galleries','tracks','shaft59','rift'])test('Historical pre-instant contract: Actual '+zoneId+' combat is unchanged at every boss and a normal wave',()=>{for(const wave of [1,5,10,15,20]){const a=new PreInstantRun(()=>.5,{}, {zoneId}),b=new BeforeRun(()=>.5,{}, {zoneId});for(const r of [a,b])if(wave>1){r.waveIndex=wave-2;r.wavePhase='cleared';r.enterNextWave();}for(let i=0;i<600;i++){const input={x:Math.cos(i/110),y:Math.sin(i/110)};assert.deepEqual(a.update(1/60,input),b.update(1/60,input));}assert.deepEqual(JSON.parse(JSON.stringify(a.enemies)),JSON.parse(JSON.stringify(b.enemies)));}});
test('All unrelated source bytes are unchanged, including remote leaderboard and auth client',async()=>{const hashes=JSON.parse(await historicalSource(new URL('./zone5-before-hashes.json',import.meta.url)));for(const[f,h]of Object.entries(hashes))if(!ZONE5_FILES.includes(f))assert.equal(createHash('sha256').update(await historicalSource(new URL('../src/'+f,import.meta.url))).digest('hex'),h,f);});
for(const weaponId of ['shotgun','smg','grisoux'])test('Full Zone 5 is winnable with '+weaponId+' using ordinary input and legal upgrades',async()=>{const r=simulateZone5({weaponId});await writeFile(new URL('./zone5-run-'+weaponId+'.json',import.meta.url),JSON.stringify(r,null,2));assert.equal(r.status,'won',JSON.stringify(r));assert.equal(Object.keys(r.waves).length,20);assert.equal(r.bosses.length,4);assert.equal(r.choices,6);assert.equal(r.movingShots,0);assert.ok(r.maxBolts<=24&&r.maxZones<=5&&r.maxCharges<=3&&r.maxMajors<=2);assert.ok(r.extinctions>10);assert.equal(r.rewards.coal,123);});
