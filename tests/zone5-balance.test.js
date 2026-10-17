import {historicalSource,PreInstantRun} from './instant-fire-compat.js';
import {ZONE6_FILES} from './zone6-authorized-files.js';
import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {Run} from '../src/run.js';import {Run as BeforeRun} from './zone5-balance-before-src/run.js';
import {createEnemy} from '../src/enemies/registry.js';import {DepthsActor} from '../src/depths/actors.js';import {DepthsActor as BeforeActor} from './zone5-balance-before-src/depths/actors.js';
import {DEPTHS_ENEMIES,DEPTHS_BOSSES,DEPTHS_PATTERNS} from '../src/depths/config.js';import * as Before from './zone5-balance-before-src/depths/config.js';
import {DEPTHS_WAVES} from '../src/depths/waves.js';import {DEPTHS_WAVES as BEFORE_WAVES} from './zone5-balance-before-src/depths/waves.js';
import {applyDepthsLighting,drawDepths} from '../src/depths/art.js';import {DepthsGround,depthsHazardTouches} from '../src/depths/combat.js';
import {pressureTrace} from './zone5-balance-simulation.mjs';
const target={x:225,y:500};
const mob=kind=>{const e=new DepthsActor(1,kind,225,220);e.warmup=0;e.phaseTime=999;return e;};
const context=active=>({depths:{darkness:{active}}});
const tick=(r,s,input={x:0,y:0})=>{for(let i=0;i<Math.round(s*60);i++)r.update(1/60,input);};
const run=()=>{const r=new Run(()=>0,{}, {zoneId:'depths',rewardRandom:()=>.99});r.untilSpawn=999;r.weapon.cooldown=999;return r;};
test('Balance patch preserves all actor HP, damage, hitboxes, patterns and wind-up timings',()=>{assert.deepEqual(DEPTHS_ENEMIES,Before.DEPTHS_ENEMIES);assert.deepEqual(DEPTHS_BOSSES,Before.DEPTHS_BOSSES);assert.deepEqual(DEPTHS_PATTERNS,Before.DEPTHS_PATTERNS);});
test('Extinction melee motion gains exactly 12 percent and reverts on next update',()=>{
 const a=mob('blackmaw'),b=mob('blackmaw');a.update(.1,target,[],context(false));b.update(.1,target,[],context(true));const distance=e=>Math.hypot(e.x-225,e.y-220);assert.ok(Math.abs(distance(b)/distance(a)-1.12)<1e-10);
 b.update(.1,target,[],context(false));assert.equal(b.extinctionSpeed,1);
 for(const kind of ['lampist','blaster','lampmajor','dynamiter','blackmass']){const a=mob(kind),b=mob(kind);a.update(.1,target,[],context(false));b.update(.1,target,[],context(true));assert.equal(a.x,b.x);assert.equal(a.y,b.y);}
});
test('Gueule-Noire recovers sooner, but locked leap and pre-leap warning remain identical',()=>{
 const a=mob('blackmaw'),b=mob('blackmaw');a.recover();b.recover();for(let i=0;i<41;i++){a.update(1/60,target,[],context(false));b.update(1/60,target,[],context(true));}assert.equal(a.phase,'recovery');assert.equal(b.phase,'positioning');
 for(const phase of ['warning','charge']){const a=mob('blackmaw'),b=mob('blackmaw');for(const e of [a,b])Object.assign(e,{phase,phaseTime:.5,pattern:'leap',chargeAngle:1});a.update(.1,target,[],context(false));b.update(.1,{x:50,y:400},[],context(true));assert.equal(a.x,b.x);assert.equal(a.y,b.y);assert.equal(a.phaseTime,b.phaseTime);assert.equal(b.chargeAngle,1);}
});
test('Lampiste rests less and resumes lateral reposition earlier and releases a ready light volley immediately',()=>{
 const a=mob('lampist'),b=mob('lampist');a.recover();b.recover();for(let i=0;i<17;i++){a.update(1/60,target,[],context(false));b.update(1/60,target,[],context(true));}assert.equal(a.x,225);assert.notEqual(b.x,225);assert.ok(b.phaseTime<a.phaseTime);
 for(const e of [a,b])Object.assign(e,{phase:'warning',phaseTime:1,pattern:'light',attackAngle:1});a.update(.1,target,[],{depths:{release:()=>true,darkness:{active:false}}});b.update(.1,target,[],{depths:{release:()=>true,darkness:{active:true}}});assert.equal(a.phase,'recovery');assert.equal(b.phase,'recovery');assert.equal(a.phaseTime,b.phaseTime);
});
test('Boutefeu has shorter pose downtime but the same charge fuse and damage',()=>{const e=mob('blaster'),old=new BeforeActor(1,'blaster',225,220);e.recover();old.recover();assert.ok(e.phaseTime<old.phaseTime&&e.phaseTime>=1.3*.85);e.phaseTime=.01;e.update(.02,target,[],context(false));assert.equal(e.phaseTime,.51);assert.equal(DEPTHS_PATTERNS.plant.warning,1.5);assert.equal(e.contactDamage,old.contactDamage);});
test('Prelude warns before gameplay pressure and light restores cleanly without a black screen',()=>{
 const r=run(),d=r.depths.darkness;d.start();assert.equal(d.active,false);assert.match(d.notice,/IMMINENTE/);assert.equal(d.remaining,3);let tint;const bg={setTint:v=>tint=v,clearTint:()=>tint=null};applyDepthsLighting(bg,r);assert.equal(tint,0x9298a5);
 tick(r,.32);assert.equal(d.active,true);applyDepthsLighting(bg,r);assert.equal(tint,0x505868);tick(r,3);assert.equal(d.active,false);assert.match(d.notice,/RÉTABLI/);applyDepthsLighting(bg,r);assert.equal(tint,null);tick(r,.2);assert.equal(d.notice,'');
});
test('Rocks have a 35 percent one-shot roll, never retry under saturated caps',()=>{
 for(const [value,expected]of [[0,true],[.349,true],[.35,false],[.99,false]]){const r=run();let calls=0;r.random=()=>{calls++;return value;};r.depths.darkness.start();tick(r,.4);assert.equal(r.depths.ground.items.some(h=>h.environment),expected);assert.equal(calls,1);tick(r,.3);assert.equal(calls,1);}
 const r=run();r.depths.ground.request(0,Array.from({length:4},(_,i)=>({x:80+i*80,y:200})),{environment:true,warning:5,duration:1});r.depths.darkness.start();tick(r,.4);assert.equal(r.depths.ground.items.length,4);r.depths.ground.clear();tick(r,.3);assert.equal(r.depths.ground.items.length,0);
});
test('Two local rocks lock their positions, warn, damage, expire and leave broad safe space',()=>{
 const r=run();r.depths.darkness.start();tick(r,.32);const hs=r.depths.ground.items;assert.equal(hs.length,2);assert.ok(hs.every(h=>h.kind==='rock'&&!h.charge&&!h.active&&h.warning>1.3));const x=hs[0].x,y=hs[0].y,hp=r.player.hp;
 tick(r,1);assert.equal(r.player.hp,hp);assert.equal(hs[0].x,x);assert.equal(hs[0].y,y);tick(r,.4);assert.equal(r.player.hp,hp-.5);tick(r,.5);assert.equal(r.depths.ground.items.length,0);
 let safe=0;for(let px=60;px<390;px+=20)for(let py=150;py<630;py+=20)if(hs.every(h=>!depthsHazardTouches(h,{x:px,y:py,radius:13})))safe++;assert.ok(safe>300);
});
test('An extinction cannot leave a rock behind a cleared wave or start threats in an intermission',()=>{
 const r=run();assert.equal(r.depths.requestExtinctionRocks(),true);r.spawned=r.wave.total;tick(r,.02);assert.equal(r.depths.ground.items.length,0);assert.equal(r.wavePhase,'collecting');assert.equal(r.depths.requestExtinctionRocks(),false);
});
test('Rocks fit inside the five-danger cap and cannot bypass the three-charge cap',()=>{
 const r=run(),g=r.depths.ground;assert.equal(g.request(1,Array(3).fill({x:150,y:200}),{warning:2,duration:.3,charge:true}),true);assert.equal(r.depths.requestExtinctionRocks(),true);assert.equal(g.items.length,5);assert.equal(g.request(2,[{x:200,y:200}],{warning:2,duration:.3,charge:true}),false);assert.equal(g.items.filter(h=>h.charge).length,3);
});
test('Triple keeps two major slots including environmental pressure; third boss uses a light fan',()=>{
 const r=run();r.waveIndex=18;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';for(const e of r.enemies)e.warmup=0;const [lamp,dynamite,mass]=r.enemies;
 assert.equal(r.depths.begin(dynamite,'ring',r.player),true);assert.equal(r.depths.begin(mass,'rush',r.player),true);assert.equal(r.depths.requestExtinctionRocks(),false);assert.equal(r.depths.begin(lamp,'beam',r.player),true);assert.equal(lamp.pattern,'light');assert.equal(lamp.major,false);assert.equal(r.depths.majorOwners().size,2);
 r.depths.shots.clear();r.depths.ground.clear();for(const e of r.enemies){e.phase='positioning';e.major=false;}assert.equal(r.depths.requestExtinctionRocks(),true);assert.equal(r.depths.begin(lamp,'beam',r.player),true);assert.equal(r.depths.begin(mass,'rush',r.player),false);assert.equal(r.depths.majorOwners().size,1);
});
test('Normal waves are progressively denser and late waves mix melee with ranged support',()=>{
 for(let i=0;i<20;i++){const a=DEPTHS_WAVES[i],b=BEFORE_WAVES[i];if(a.boss)assert.deepEqual(a,b);else {assert.ok(a.total>b.total);assert.ok(a.maxAlive>=b.maxAlive);assert.ok(a.interval<b.interval);if(i>=15){assert.ok(a.enemies.slice(0,5).includes('blackmaw'));assert.ok(a.enemies.slice(0,5).includes('lampist'));assert.ok(a.enemies.slice(0,5).includes('blaster'));assert.equal(a.kindCaps.blaster,3);assert.equal(a.kindCaps.lampist,3);}}}
});
test('Late waves and triple get more frequent but still finite and separated extinctions',()=>{
 const frequencies=[];for(const wave of [1,16,20]){const r=run();r.waveIndex=wave-1;r.depths.darkness.clear();r.enemies=[createEnemy('lampist',1,60,160)];let count=0;for(let i=0;i<60*60;i++){const before=r.depths.darkness.count;r.depths.darkness.update(1/60,r);count+=r.depths.darkness.count-before;}frequencies.push(count);assert.ok(r.depths.darkness.remaining<=3);}
 assert.ok(frequencies[1]>frequencies[0]);assert.ok(frequencies[2]>=5);
});
test('Darkness never attenuates the danger drawing or the player/enemy/projectile layers',()=>{
 const r=run();r.depths.requestExtinctionRocks();const calls=[],g=new Proxy({}, {get:(_,k)=>(...args)=>{calls.push([k,args]);return g;}});drawDepths(g,r);const lit=structuredClone(calls);calls.length=0;r.depths.darkness.remaining=2;r.depths.darkness.prelude=0;drawDepths(g,r);assert.deepEqual(calls,lit);assert.ok(calls.some(([k])=>k==='strokeTriangle'));
});
for(const wave of [16,17,18,19,20])test('Sustained wave '+wave+' respects all caps, including rocks and triple pressure slots',()=>{
 const before=pressureTrace({wave,previous:true}),after=pressureTrace({wave});assert.ok(after.maxProjectiles<=24);assert.ok(after.maxGround<=5);assert.ok(after.maxCharges<=3);assert.ok(after.maxMajors<=2);assert.ok(after.maxPressureSlots<=2);assert.ok(after.darkSeconds>before.darkSeconds);
 if(wave<20){assert.ok(after.meanEnemies>before.meanEnemies);assert.ok(after.rockSeconds>0);}else assert.ok(after.movingBossSeconds>40);
});
for(const zoneId of ['galleries','tracks','shaft59','rift'])test('Historical pre-instant contract: Balance patch leaves '+zoneId+' simulation and rewards unchanged',()=>{
 for(const wave of [1,16,19,20]){const a=new PreInstantRun(()=>.5,{}, {zoneId,rewardRandom:()=>.99}),b=new BeforeRun(()=>.5,{}, {zoneId,rewardRandom:()=>.99});for(const r of [a,b])if(wave>1){r.waveIndex=wave-2;r.wavePhase='cleared';r.enterNextWave();}for(let i=0;i<600;i++){const input={x:Math.cos(i/110),y:Math.sin(i/110)};assert.deepEqual(a.update(1/60,input),b.update(1/60,input));}assert.deepEqual(JSON.parse(JSON.stringify(a.enemies)),JSON.parse(JSON.stringify(b.enemies)));assert.deepEqual(a.rewardPlans,b.rewardPlans);}
});
test('All source outside Zone 5 and its alert label is byte-identical, including weapons and economy',async()=>{
 const allowed=[...ZONE6_FILES,'depths/actors.js','depths/art.js','depths/combat.js','depths/waves.js','arena-view.js'];const hashes=JSON.parse(await historicalSource(new URL('./zone5-balance-before-hashes.json',import.meta.url)));for(const[f,h]of Object.entries(hashes))if(!allowed.includes(f))assert.equal(createHash('sha256').update(await historicalSource(new URL('../src/'+f,import.meta.url))).digest('hex'),h,f);
});
