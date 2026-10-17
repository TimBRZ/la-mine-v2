import {V021_FILES} from './v021-authorized-files.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createBoss} from '../src/bosses.js';
import {RAIL_BOSS_SPECS,railHazardTouches} from '../src/rail-bosses.js';
import {summonRailWagon} from '../src/rail-boss-encounter.js';
import {Run} from '../src/run.js';
import {TRACKS} from '../src/zones.js';
import {EnemyProjectiles} from '../src/enemy-projectiles.js';
import {Player} from '../src/player.js';
import {MenuState} from '../src/menu/state.js';
import {simulateBosses} from './v018-step4-simulation.mjs';
import {TRACKS_WAVES as OLD_TRACKS_WAVES} from './v018-step3-src-snapshot/tracks-waves.js';
const boss=(id,options={})=>{const b=createBoss(1,id,[150,280],1,options);b.warmup=0;return b;};
const step=(b,n,p={x:300,y:400},a=[])=>{for(let i=0;i<n*120;i++)b.update(1/120,p,a);return a;};
test('three distinct rail bosses populate 5/10/15/20, menu still refuses tracks',()=>{
 assert.equal(Object.keys(RAIL_BOSS_SPECS).length,3);
 for(const n of [5,10,15,20]){const r=new Run(()=>.5,{}, {world:TRACKS});r.waveIndex=n-2;r.wavePhase='cleared';assert.equal(r.enterNextWave(),true);assert.equal(r.enemies.length,n===20?3:1);assert.deepEqual(r.enemies.map(e=>e.bossId),TRACKS.waves[n-1].bosses);}
 assert.equal(new MenuState().launch('tracks'),null);assert.ok(RAIL_BOSS_SPECS.stationmaster.speed>60);assert.ok(RAIL_BOSS_SPECS.locomotive.health>RAIL_BOSS_SPECS.stationmaster.health);
});
for(const id of ['stationmaster','locomotive'])test(id+' locks a visible warning before charge and recovers without teleportation',()=>{
 const b=boss(id);b.phaseTime=0;b.update(.01,{x:320,y:280});assert.equal(b.phase,'warning');const x=b.x,y=b.y,angle=b.chargeAngle;
 step(b,b.spec.warning-.1,{x:280,y:520});assert.equal(b.phase,'warning');assert.equal(b.x,x);assert.equal(b.y,y);assert.equal(b.chargeAngle,angle);
 while(b.phase==='warning')b.update(1/120,{x:280,y:520});
 const startX=b.x,startY=b.y;step(b,.1,{x:280,y:520});assert.equal(b.phase,'charge');assert.ok(Math.abs(Math.atan2(b.y-startY,b.x-startX)-angle)<1e-8);
 while(b.phase==='charge')b.update(1/120,{x:280,y:520});const endX=b.x,endY=b.y;step(b,.6,{x:280,y:520});assert.equal(b.phase,'recovery');const moved=Math.hypot(b.x-endX,b.y-endY);assert.ok(moved>0&&moved<=b.spec.speed*.6+1);
});
test('stationmaster wagon passage is periodic, safe, bounded and uses the ordinary telegraph',()=>{
 const r=new Run(()=>.5,{}, {world:TRACKS}),b=boss('stationmaster');r.enemies=[b];r.nextEnemyId=1;
 const a=step(b,20);assert.ok(a.some(a=>a.type==='summon-wagon'));
 assert.equal(summonRailWagon(r,b),true);const w=r.enemies[1];assert.equal(w.kind,'wagon');assert.ok(w.warmup>0);assert.equal(w.phase,'warning');assert.ok(Math.hypot(w.x-r.player.x,w.y-r.player.y)>180);
 assert.equal(summonRailWagon(r,b),true);assert.equal(r.enemies.length,3);assert.equal(summonRailWagon(r,b),false);
});
test('summons neither mint drops nor survive their owner, even on the death frame',()=>{
 const r=new Run(()=>.5,{}, {world:TRACKS});r.waveIndex=3;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';const b=r.enemies[0];b.warmup=0;
 summonRailWagon(r,b);const w=r.enemies[1];w.warmup=0;w.x=r.player.x;w.y=r.player.y;w.phase='stopped';w.contactDamage=1;
 b.hp=0;r.update(.01);assert.equal(r.enemies.length,0);assert.equal(r.player.hp,5);assert.equal(r.loot.deaths.size,0);
});
test('locomotive steam is warned, bounded, damages only when active and expires',()=>{
 const b=boss('locomotive');b.attackCount=1;b.phaseTime=0;b.update(.01,{x:260,y:280});assert.equal(b.pattern,'steam');assert.equal(b.hazards.length,1);
 const h=b.hazards[0],p={x:h.x,y:h.y,radius:13};assert.equal(railHazardTouches(h,p),false);step(b,1.4);assert.equal(railHazardTouches(h,p),true);step(b,1.7);assert.equal(b.hazards.length,0);
});
test('switchman has two locked avoidable solo rails and only one in the final',()=>{
 for(const final of [false,true]){const b=boss('switchman',{final});b.phaseTime=0;b.update(.01,{x:280,y:400});assert.equal(b.hazards.length,final?1:2);const h=b.hazards[0];assert.equal(h.y,400);assert.equal(railHazardTouches(h,{x:220,y:400,radius:13}),false);
 step(b,1.3,{x:280,y:520});assert.equal(h.y,400);assert.equal(railHazardTouches(h,{x:220,y:400,radius:13}),true);assert.equal(railHazardTouches(h,{x:220,y:460,radius:13}),false);step(b,1.3);assert.equal(b.hazards.length,0);}
});
test('mechanical burst is exactly two slow shots, with lateral dodge available',()=>{
 const b=boss('switchman');b.attackCount=1;b.phaseTime=0;const p=new Player();p.x=330;p.y=280;const origin={x:b.x,y:b.y};const a=[];b.update(.01,p,a);assert.equal(a.length,1);a.push(...step(b,1.8,p));assert.equal(a.length,2);assert.ok(a.every(a=>a.type==='enemy-shot'));assert.equal(a[0].angle,a[1].angle);
 for(const dodge of [false,true]){const pool=new EnemyProjectiles();p.x=330;p.y=280;p.vx=p.vy=0;for(const shot of a)pool.fire({...b,...origin,active:true},shot.angle);let hits=0;
 for(let i=0;i<200;i++){const prev={x:p.x,y:p.y};p.update(1/60,{x:0,y:dodge?1:0});pool.update(1/60,p,prev,()=>hits++);}assert.equal(hits,dodge?0:2);}
});
test('boss charge and rail/steam damage use live Run collisions and ordinary invulnerability',()=>{
 const r=new Run(()=>.5);r.spawned=r.wave.total;r.weapon.cooldown=999;const b=boss('locomotive');r.enemies=[b];b.hazards=[{x:r.player.x,y:r.player.y,radius:54,active:true,time:1}];b.phase='recovery';b.phaseTime=2;
 r.update(.02);assert.equal(r.player.hp,4);r.update(.02);assert.equal(r.player.hp,4);
});
test('stationmaster hits a stationary target but a warning-time lateral dodge avoids the charge',()=>{
 for(const dodge of [false,true]){const r=new Run(()=>.5);r.spawned=r.wave.total;r.weapon.cooldown=999;r.player.x=300;r.player.y=280;
 const b=boss('stationmaster');b.phaseTime=0;r.enemies=[b];for(let i=0;i<170;i++)r.update(1/60,{x:0,y:dodge&&i<45?1:0});assert.equal(r.player.hp,dodge?5:4);}
});
test('shooting an invoked wagon credits no additional wave death or resource',()=>{
 const r=new Run(()=>.5,{}, {world:TRACKS});r.waveIndex=3;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';r.weapon.cooldown=999;
 const b=r.enemies[0];b.warmup=0;b.x=350;b.y=190;b.phaseTime=999;summonRailWagon(r,b);
 const w=r.enemies[1];w.warmup=0;w.x=150;w.y=300;w.hp=1;r.projectiles.fire(140,300,0);r.update(.02);
 assert.equal(r.kills,1);assert.equal(r.waveKills,0);assert.equal(r.loot.deaths.size,0);assert.equal(r.loot.activeCount,0);
});
test('triple openings are staggered and hazards/bolts/summons remain bounded',()=>{
 const bosses=['stationmaster','locomotive','switchman'].map((id,slot)=>createBoss(slot+1,id,[[110,210],[225,165],[340,210]][slot],.95,{final:true,slot}));const first=[null,null,null];let simultaneous=0;
 for(let frame=0;frame<7200;frame++){
   for(let i=0;i<3;i++){bosses[i].update(1/60,{x:225,y:500},[]);if(first[i]===null&&bosses[i].phase==='warning')first[i]=frame/60;}
   if(bosses.every(b=>['warning','charge','burst'].includes(b.phase)||b.hazards.some(h=>h.active)))simultaneous++;
 }
 assert.ok(first[1]-first[0]>.4);assert.ok(first[2]-first[1]>.4);assert.ok(bosses.every(b=>b.restScale>1));
 assert.ok(simultaneous/7200<.1,'Three major warnings/attacks must not persist together');
});
for(const weaponId of ['shotgun','smg'])for(const n of [5,10,15,20])test(weaponId+' defeats boss '+n+' with legal perk prefix, no damage/HP overrides',()=>{
 const r=simulateBosses({weaponId,boss:n,seed:weaponId==='shotgun'?1:5});assert.equal(r.bossTimes.length,1);assert.ok(r.hp>0);assert.ok(r.bossTimes[0].seconds>10&&r.bossTimes[0].seconds<75);assert.ok(r.maxAlive<=4);assert.ok(r.maxBolts<=8);assert.ok(r.maxHazards<=2);assert.ok(r.maxSummons<=1);
});
for(const weaponId of ['shotgun','smg'])test('full tracks run completes with '+weaponId+' and activated Zone 2 reward budget',()=>{
 // New wagon targeting changes the fixed replay; keep full victory/reward assertions.
 const r=simulateBosses({weaponId,seed:weaponId==='shotgun'?2:1});assert.equal(r.status,'won');assert.equal(r.wave,20);assert.equal(r.choices,6);assert.equal(r.bossTimes.length,4);assert.deepEqual(r.rewards,{coal:108,iron:9,diamond:0,token:0});assert.ok(r.maxDrops<=20);assert.ok(r.maxSummons<=1);
});
test('old boss behavior body, normal tracks waves and all economy stay unchanged',async()=>{
 assert.deepEqual(TRACKS.waves.filter(w=>!w.boss),OLD_TRACKS_WAVES.filter(w=>!w.boss));
 const read=f=>readFile(new URL(f,import.meta.url),'utf8');const old=await read('./v018-step3-src-snapshot/bosses.js'),current=(await read('./v021-final-src-snapshot/bosses.js')).replace('    aimFan(this,player);\n','').replace("        this.fanAttack=this.bossId==='crachefer'&&this.attackCount%2===0;\n",'').replace('attacks.push(enemyShot(this,player))',"attacks.push({type:'enemy-shot',owner:this.id,angle:this.attackAngle})");
 assert.equal(current.slice(current.indexOf('// Both'),current.indexOf('export function createBoss')),old.slice(old.indexOf('// Both'),old.indexOf('export function createBoss')));
 for(const f of ['wallet.js','rewards.js','zones.js','weapon.js','combat.js','upgrades.js','epic-upgrades.js','talents.js','permanent-upgrades.js','relief.js','crates.js'].filter(f=>!V021_FILES.includes(f)))assert.equal(await read('../src/'+f),await read('./v018-step3-src-snapshot/'+f),f);
});
