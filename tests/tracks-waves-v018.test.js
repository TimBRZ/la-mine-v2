import {zoneRewards as liveRewards,ZONE_CONFIGS as liveZones} from '../src/zones.js';
import {zoneRewards as baselineRewards,ZONE_CONFIGS as baselineZones} from './v023-final-src-snapshot/zones.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { TRACKS } from '../src/zones.js';
import { WORLD } from '../src/world.js';
import { Run } from '../src/run.js';
import { createEnemy } from '../src/enemies/registry.js';
import { MenuState } from '../src/menu/state.js';
import { simulateNormals } from './v018-step3-simulation.mjs';
test('20 central tracks slots; bosses enabled at 5/10/15/20, future reservations never auto-won',()=>{
 assert.equal(TRACKS.waves.length,20);
 assert.deepEqual(TRACKS.waves.flatMap((w,i)=>w.boss?[i+1]:[]),[5,10,15,20]);
 for(const n of [5,10,15,20]){const reserved={...TRACKS,waves:TRACKS.waves.map(w=>w.boss?{...w,reservedBoss:true}:w)};const r=new Run(()=>.5,{}, {world:reserved});r.waveIndex=n-2;r.wavePhase='cleared';assert.equal(r.enterNextWave(),false);assert.equal(r.waveNumber,n-1);assert.equal(r.status,'playing');assert.equal(r.completedWaves,0);}
 assert.equal(new MenuState().launch('tracks'),null);
});
for(const tier of [0,1,2,3])test('tier '+(tier+1)+' has four readable compositions with safe caps and progressive timing',()=>{
 const waves=TRACKS.waves.slice(tier*5,tier*5+4);
 for(const w of waves){assert.equal(Object.values(w.composition).reduce((a,b)=>a+b,0),w.total);for(const [kind,count] of Object.entries(w.composition))assert.equal(w.enemies.filter(e=>e===kind).length,count);
 assert.ok(w.maxAlive<=12);assert.ok(w.interval>=.5);assert.ok(w.group<=4);assert.ok(w.kindCaps.wagon<=2);assert.ok(w.kindCaps.draisine<=3);assert.equal(w.kindCaps.drill,1);assert.ok(Object.isFrozen(w));}
 for(let i=1;i<4;i++){assert.ok(waves[i].total>=waves[i-1].total);assert.ok(waves[i].maxAlive>=waves[i-1].maxAlive);}
});
test('early teaching sequence and railway majority, with rats and drills secondary',()=>{
 assert.deepEqual(TRACKS.waves[0].composition,{miner:6,wagon:1,draisine:0,rat:0,drill:0});assert.ok(TRACKS.waves[1].composition.rat>0);
 assert.equal(TRACKS.waves[2].composition.draisine,1);assert.equal(TRACKS.waves[3].composition.draisine,3);
 const totals={};for(const w of TRACKS.waves.filter(w=>!w.boss))for(const [k,n] of Object.entries(w.composition))totals[k]=(totals[k]||0)+n;
 assert.ok(totals.miner>totals.wagon);assert.ok(totals.miner>totals.draisine);assert.ok((totals.rat+totals.drill)/271<.2);
 assert.ok(TRACKS.waves.slice(0,10).every(w=>!w.enemies.includes('drill')));assert.ok(TRACKS.waves[10].enemies.includes('drill'));
});
test('normal entrant pressure rises 15–25% over galleries, without health inflation',()=>{
 const total=w=>w.filter(w=>!w.boss).reduce((s,w)=>s+w.total,0);
 const ratio=total(TRACKS.waves)/total(WORLD.waves);assert.ok(ratio>=1.15&&ratio<=1.25);assert.equal(total(TRACKS.waves),271);
 for(let i=0;i<20;i++)if(!TRACKS.waves[i].boss)assert.deepEqual(TRACKS.waves[i].pressure,WORLD.waves[i].pressure);
 assert.ok(TRACKS.waves[18].maxAlive>TRACKS.waves[0].maxAlive);assert.ok(TRACKS.waves[18].interval<TRACKS.waves[0].interval);
});
test('per-kind caps defer spawns without consuming an entry; free slot resumes',()=>{
 const r=new Run(()=>.5,{}, {world:TRACKS});r.spawned=1;r.enemies=[createEnemy('wagon',1,46,190)];assert.equal(r.wave.enemies[1],'wagon');assert.equal(r.spawn(),false);assert.equal(r.spawned,1);r.enemies=[];assert.equal(r.spawn(),true);assert.equal(r.spawned,2);assert.ok(Math.hypot(r.enemies[0].x-r.player.x,r.enemies[0].y-r.player.y)>180);
});
for(const weaponId of ['shotgun','smg'])test('all 16 normal waves survive with '+weaponId+', legal perks/Atelier2, safe spawns and exact collected budget',()=>{
 const r=simulateNormals({weaponId,seed:weaponId==='shotgun'?1:5,levels:{power:2,health:2,mechanics:2,mobility:2}});
 assert.equal(r.done,true);assert.equal(r.status,'playing');assert.equal(r.kills,271);assert.equal(r.waves.length,16);assert.equal(r.spawnUnsafe,0);assert.equal(r.badShots,0);
 assert.ok(r.maxAlive<=12);assert.ok(r.maxBolts<=8);assert.ok(r.maxDrops<=20);assert.ok(r.overlapSeconds>20);
 assert.deepEqual(r.choices.map(c=>c.wave),[1,4,9,14,18,19]);assert.deepEqual(r.choices.map(c=>c.epic),[false,false,false,false,false,true]);
 assert.deepEqual(r.rewards,{coal:84,iron:3,diamond:0,token:0});for(const n of [4,9,14,19])assert.ok(r.waves.find(w=>w.wave===n)?.hp>0);
});
test('step 3 leaves the staged reward function unchanged',async()=>{
 // Existing V0.17 replay and protected-system tests remain in the full suite.
 const old=await readFile(new URL('./v018-step2-src-zones.js.backup',import.meta.url),'utf8'),now=await readFile(new URL('../src/zones.js',import.meta.url),'utf8');
 for(const id of ['galleries','tracks'])for(const roll of [0,.01,.04,.2,.5,.99])assert.deepEqual(liveRewards(liveZones[id],()=>roll),baselineRewards(baselineZones[id],()=>roll));
});
