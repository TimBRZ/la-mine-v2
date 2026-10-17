import {UpgradeFlow as LegacyFlow} from './v021-final-src-snapshot/upgrades.js';
// Exact historical replay keeps its original hostile shots; other tests use live Run.
import {Run as LegacyRun} from './legacy-volley-run.js';
import {V021_FILES} from './v021-authorized-files.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Run } from '../src/run.js';
import { Run as OldRun } from './v017-src-snapshot/run.js';
import { UpgradeFlow } from '../src/upgrades.js';
import { UpgradeFlow as OldFlow } from './v017-src-snapshot/upgrades.js';
import { tacticalPilot } from './tactical-pilot.js';
import { createEnemy, ENEMY_TYPES } from '../src/enemies/registry.js';
import { WAGON, DRAISINE, DRAISINE_BOLT } from '../src/enemies/rail-stats.js';
import { WAGON_SPAWNS } from '../src/enemies/wagon.js';
import { EnemyProjectiles } from '../src/enemy-projectiles.js';
import { resolveExplosions } from '../src/explosions.js';
import { Player } from '../src/player.js';
import { ROOM } from '../src/config.js';
const active=(kind,id=1,x=60,y=300)=>{const e=createEnemy(kind,id,x,y);e.warmup=0;return e;};
const step=(e,seconds,p={x:280,y:300},attacks=[])=>{for(let t=0;t<seconds;t+=1/120)e.update(1/120,p,attacks);return attacks;};
const world=kinds=>({id:'rail-test',choices:[],waves:[{total:kinds.length,maxAlive:12,group:1,interval:.5,enemies:kinds,spawns:[[60,190],[390,580]]}]});
test('rail enemies register distinct stats and textures without changing the original roster',()=>{
 for(const kind of ['wagon','draisine']){const e=createEnemy(kind,1,60,300);assert.equal(e.kind,kind);assert.ok(e.hp>0);assert.ok(ENEMY_TYPES[kind].texture);}
 assert.equal(new Set(Object.values(ENEMY_TYPES).map(e=>e.texture)).size,17);
});
test('wagon warns 1.1 seconds after spawn, locks a straight rail and resists knockback',()=>{
 const e=active('wagon');step(e,1);assert.equal(e.phase,'warning');assert.equal(e.x,60);
 const y=e.y,angle=e.chargeAngle;e.hit(1,Math.PI/2,170);step(e,.2,{x:200,y:550});assert.equal(e.phase,'charge');assert.equal(e.y,y);assert.equal(e.chargeAngle,angle);assert.ok(e.x>60);
});
test('wagon spawn uses rail edges, never within 180 pixels of player, and defers blocked spawns',()=>{
 for(const [x,y] of WAGON_SPAWNS){const r=new Run(()=>.5,{}, {world:world(['wagon'])});r.player.x=x;r.player.y=y;assert.equal(r.spawn(),true);const e=r.enemies[0];assert.ok(Math.hypot(e.x-x,e.y-y)>180);assert.ok([ROOM.left+WAGON.radius,ROOM.right-WAGON.radius].includes(e.x));}
 const r=new Run(()=>.5,{}, {world:world(['wagon'])});r.enemies=WAGON_SPAWNS.map(([x,y],i)=>active('miner',i,x,y));assert.equal(r.spawn(),false);assert.equal(r.spawned,0);
});
test('wagon hits a stationary player and a lateral dodge during the warning avoids contact',()=>{
 for(const dodge of [false,true]){const r=new Run(()=>.5,{}, {world:world(['wagon'])});r.player.x=230;r.player.y=300;r.spawned=1;r.enemies=[active('wagon')];r.weapon.cooldown=999;
 for(let i=0;i<180;i++)r.update(1/60,dodge&&i<45?{x:0,y:1}:{x:0,y:0});assert.equal(r.player.hp,dodge?5:4);}
});
test('wagon ends at the opposite rail edge, then is harmless, destructible and finite',()=>{
 for(const x of [ROOM.left+WAGON.radius,ROOM.right-WAGON.radius]){const e=active('wagon',1,x);step(e,4);assert.equal(e.phase,'stopped');assert.equal(e.x,e.endX);assert.ok(Math.abs(e.x-x)>350);assert.equal(e.contactDamage,0);const end=e.x;step(e,5);assert.equal(e.x,end);e.hit(999,0,100);assert.equal(e.alive,false);}
});
test('draisine retreats nearby, approaches from far away and strafes at medium distance',()=>{
 for(const [d,radial] of [[70,-1],[180,0],[270,1]]){const e=active('draisine',1,90);e.phaseTime=100;e.update(.1,{x:90+d,y:300});assert.equal(Math.sign(e.x-90),radial);assert.notEqual(e.y,300);}
});
test('draisine immediately emits one three-way volley then rests without homing',()=>{
 const e=active('draisine'),a=[],p={x:270,y:300};e.phaseTime=0;e.update(.01,p,a);
 assert.equal(e.phase,'recovery');assert.equal(a.length,1);assert.equal(a[0].fan,true);assert.equal(a[0].angle,Math.atan2(p.y-e.y,p.x-e.x));
 const shot=structuredClone(a[0]);step(e,2,{x:270,y:500},a);assert.equal(a.length,1);assert.deepEqual(a[0],shot);
});
test('draisine burst projectiles hit with bounded damage but can be dodged; pool stays at eight',()=>{
 assert.ok(DRAISINE_BOLT.speed<new Player().speed);
 for(const dodge of [false,true]){const e=active('draisine'),pool=new EnemyProjectiles(),p=new Player();p.x=280;p.y=300;
 assert.equal(pool.fire(e,0),true);assert.equal(pool.fire(e,0),true);assert.equal(pool.fire(e,0),false);
 let hits=0;for(let i=0;i<240;i++){const prev={x:p.x,y:p.y};p.update(1/60,{x:0,y:dodge?1:0});pool.update(1/60,p,prev,d=>{assert.equal(d,.5);hits++;});}assert.equal(hits,dodge?0:2);assert.ok(pool.pool.every(p=>!p.active));}
 const pool=new EnemyProjectiles();for(let i=1;i<=20;i++)pool.fire(active('draisine',i),0);assert.equal(pool.pool.filter(p=>p.active).length,8);pool.clear();assert.equal(pool.pool.filter(p=>p.active).length,0);
});
test('dead draisine never emits a queued burst',()=>{const e=active('draisine');e.phase='burst';e.burstLeft=2;e.phaseTime=0;e.hit(999,0,0);assert.equal(step(e,3).length,0);assert.equal(new EnemyProjectiles().fire(e,0),false);});
for(const weaponId of ['shotgun','smg'])for(const kind of ['wagon','draisine'])test(weaponId+' kills '+kind+' through live combat and collects its exact drops once',()=>{
 const r=new Run(()=>.5,{}, {weaponId,world:world([kind]),rewardRandom:()=>.99});r.spawned=1;r.player.x=260;r.player.y=300;
 const e=active(kind,1,180);if(kind==='wagon'){e.phase='stopped';e.endX=e.x;}else e.phaseTime=100;
 r.enemies=[e];let deaths=0;for(let i=0;i<2400&&r.status==='playing';i++){const events=r.update(1/60);deaths+=events.filter(e=>e.type==='kill').length;}
 assert.equal(r.status,'won');assert.equal(deaths,1);assert.equal(r.kills,1);assert.equal(r.loot.deaths.size,1);assert.deepEqual(r.collectedRewards,r.rewardPlans[0]);
});
test('Coup de Grisou damages both rail enemies and counts their deaths/drops only once',()=>{
 const r=new Run(()=>.5,{}, {world:world(['wagon','draisine']),rewardRandom:()=>.99});r.enemies=[active('wagon',1,170),active('draisine',2,200)];
 for(const e of r.enemies)e.hit(e.hp-20,0,0);const events=[{type:'kill',id:99,x:180,y:300}];resolveExplosions(events,r.enemies,{enabled:true,kills:5});
 const deaths=events.filter(e=>e.type==='kill'&&e.id!==99);assert.equal(deaths.length,2);assert.ok(r.enemies.every(e=>!e.alive));for(const e of [...deaths,...deaths])r.loot.onKill(e);assert.equal(r.loot.deaths.size,2);assert.deepEqual(r.loot.emitted,r.rewardPlans[0]);
});
test('a rail death from the SMG triggers Coup de Grisou through the real run pipeline',()=>{
 const r=new Run(()=>.5,{}, {weaponId:'smg',world:world(['wagon','draisine']),rewardRandom:()=>.99});
 r.player.x=270;r.player.y=300;r.spawned=2;r.grisou.enabled=true;r.grisou.kills=5;
 const wagon=active('wagon',1,190),draisine=active('draisine',2,165);
 wagon.phase='stopped';wagon.endX=wagon.x;wagon.hp=1;draisine.hp=20;draisine.phase='warning';draisine.phaseTime=10;
 r.enemies=[wagon,draisine];const events=[];
 for(let i=0;i<600&&r.status==='playing';i++)events.push(...r.update(1/60));
 assert.equal(events.filter(e=>e.type==='explosion').length,1);assert.equal(r.kills,2);assert.equal(r.status,'won');assert.equal(r.loot.deaths.size,2);
});
test('a draisine killed on its firing frame cannot release its pending projectile',()=>{
 const r=new Run(()=>.5,{}, {world:world(['draisine'])});r.spawned=1;
 const e=active('draisine',1,200);e.hp=1;e.phase='burst';e.phaseTime=0;e.burstLeft=2;r.enemies=[e];
 r.projectiles.fire(190,300,0);r.weapon.cooldown=100;
 const events=r.update(.02);assert.equal(r.kills,1);assert.ok(!events.some(e=>e.type==='enemy-shot'));assert.ok(r.hostileProjectiles.pool.every(p=>!p.active));
});
test('Zone1 enemies, bosses, waves, weapon balance, rewards remain byte-identical',async()=>{
 for(const file of ['boss.js','difficulty.js','world.js','weapon.js','combat.js','explosions.js','enemies/stats.js','enemies/rat.js','enemies/miner.js','enemies/drill.js','room-loot.js','rewards.js'].filter(f=>!V021_FILES.includes(f)))assert.deepEqual(await readFile(new URL('../src/'+file,import.meta.url)),await readFile(new URL('./v017-src-snapshot/'+file,import.meta.url)),file);
});
for(const weaponId of ['shotgun','smg'])test('full Zone1 '+weaponId+' run replays V0.17 exactly after rail integration',()=>{
 const UpgradeFlow=LegacyFlow;
 const play=(R,F)=>{let seed=weaponId==='shotgun'?1:5;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);const r=new R(random,{}, {weaponId,rewardRandom:()=>.99}),flow=new F(r,random);
 const priority=weaponId==='smg'?['critical-heat','trigger','heat','plates','boots','piercing','magazine']:['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn'];
 const choose=()=>flow.choose(priority.find(id=>flow.offered.some(p=>p.id===id)));flow.open();choose();for(let i=0;i<40000&&r.status==='playing';i++){r.update(1/60,tacticalPilot(r));if(flow.afterCombat())choose();}
 return {status:r.status,hp:r.player.hp,elapsed:r.elapsed,kills:r.kills,rewards:r.collectedRewards,perks:r.upgradeRanks};};
 const current=play(LegacyRun,UpgradeFlow);assert.equal(current.status,'won');assert.deepEqual(current,play(OldRun,OldFlow));
});
