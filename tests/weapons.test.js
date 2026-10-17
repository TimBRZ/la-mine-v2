import {UpgradeFlow as LegacyFlow} from './v021-final-src-snapshot/upgrades.js';
// Exact historical replay keeps its original hostile shots; other tests use live Run.
import {Run as LegacyRun} from './legacy-volley-run.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { Run } from '../src/run.js';
import { Gamin } from '../src/weapon.js';
import { GAMIN } from '../src/config.js';
import { WEAPONS, weaponDefinition } from '../src/weapons.js';
import { Projectiles, pelletDamage } from '../src/combat.js';
import { createEnemy } from '../src/enemies/registry.js';
import { Haveuse } from '../src/boss.js';
import { drawUpgrades, UpgradeFlow, UPGRADES } from '../src/upgrades.js';
import { resolveExplosions } from '../src/explosions.js';
import { steer } from './run-helpers.js';

const active = kind => { const e=createEnemy(kind,1,200,300);e.warmup=0;return e; };
test('two weapon definitions preserve every shotgun V0.6 parameter and reject unknown weapons',()=>{
 assert.deepEqual(Object.keys(WEAPONS),['shotgun','smg','grisoux']);
 for(const [k,v] of Object.entries(GAMIN))assert.equal(WEAPONS.shotgun[k],v);
 assert.throws(()=>weaponDefinition('laser'),RangeError);
 assert.equal(new Run().weapon.definition.id,'shotgun');
 assert.equal(new Run(Math.random,{}, {weaponId:'smg'}).weapon.definition.id,'smg');
});
test('SMG produces one finite accurate weak projectile with longer range and lighter effects',()=>{
 const w=new Gamin('smg'),pool=new Projectiles(),events=[],p={x:60,y:300,angle:0};
 w.update(.01,p,[active('miner')],pool,events);
 const bullets=pool.pool.filter(p=>p.active);assert.equal(bullets.length,1);assert.equal(bullets[0].angle,0);
 assert.equal(pelletDamage(0,WEAPONS.smg),5);assert.ok(5<pelletDamage(0));
 assert.ok(WEAPONS.smg.range>GAMIN.range);assert.ok(w.interval<GAMIN.cooldown);
 assert.equal(WEAPONS.smg.effects.shake,0);assert.ok(w.recoil<5);
});
test('SMG cannot fire during movement or braking and resumes promptly when settled',()=>{
 const run=new Run(Math.random,{}, {weaponId:'smg'});run.untilSpawn=999;
 const e=active('miner');e.hp=9999;e.speed=0;run.enemies=[e];run.player.x=100;run.player.y=300;
 for(let i=0;i<12;i++) assert.ok(!run.update(1/60,{x:0,y:1}).some(e=>e.type==='shot'));
 let fired=false;
 for(let i=0;i<12;i++){const ev=run.update(1/60,{x:0,y:0});if(run.player.vx||run.player.vy)assert.ok(!ev.some(e=>e.type==='shot'));fired ||=ev.some(e=>e.type==='shot');}
 assert.ok(fired);
 assert.ok(!run.update(1/60,{x:.001,y:0}).some(e=>e.type==='shot'));
});
test('SMG fires rapidly for 20 seconds without nonfinite bullets or pool growth',()=>{
 const w=new Gamin('smg'),pool=new Projectiles(),e=active('miner');e.hp=99999;
 let shots=0;const times=[];
 for(let i=0;i<1200;i++){const events=[];w.update(1/60,{x:60,y:300,angle:0},[e],pool,events);pool.update(1/60,[e],events);if(events.some(e=>e.type==='shot')){shots++;times.push(i/60);}assert.equal(pool.pool.length,84);assert.ok(pool.pool.filter(p=>p.active).every(p=>Number.isFinite(p.angle)&&Number.isFinite(p.x)));}
 assert.ok(shots>=145&&shots<=168);
 for(let i=1;i<times.length;i++)assert.ok(times[i]-times[i-1]>=.12-1e-9);
});
for(const kind of ['rat','miner','drill','boss'])test('SMG real bullets kill '+kind+' with sustained damage',()=>{
 const e=kind==='boss'?new Haveuse(1,200,300):active(kind);e.warmup=0;e.x=200;e.y=300;
 const hp=e.hp,pool=new Projectiles();let hits=0;
 while(e.alive&&hits<400){pool.fire(100,300,0,0,WEAPONS.smg);pool.update(.2,[e],[],{x:100,y:300});hits++;}
 assert.equal(e.alive,false);assert.equal(hits,Math.ceil(hp/(5*(kind==='boss'?.9:1))));
 if(kind==='miner')assert.equal(hits,18);
});
test('compatible perks appear for both weapons and shotgun-only perks never enter SMG offers',()=>{
 for(const weaponId of ['shotgun','smg']){
  const run=new Run(Math.random,{}, {weaponId}),seen=new Set();let seed=9;
  for(let i=0;i<300;i++){const offered=drawUpgrades(run,()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296));assert.equal(offered.length,3);for(const c of offered){seen.add(c.id);assert.ok(WEAPONS[weaponId].perks.includes(c.id));}}
  assert.deepEqual([...seen].sort(),[...WEAPONS[weaponId].perks].sort());
 }
 const run=new Run(Math.random,{}, {weaponId:'smg'}),flow=new UpgradeFlow(run);flow.open();
 assert.equal(flow.choose('buckshot'),false);
 for(const p of UPGRADES)run.upgradeRanks[p.id]=p.maxRanks;
 assert.equal(drawUpgrades(run).length,0);
});
test('all four permanent stats and generic perks apply to the SMG base',()=>{
 const run=new Run(Math.random,{power:2,mechanics:2,health:2,mobility:2},{weaponId:'smg'});
 assert.equal(run.weapon.interval,.12*.9);assert.equal(run.projectiles.damageMultiplier,1.1);assert.equal(run.player.hp,5.5);
 const speed=run.player.speed;UPGRADES.find(p=>p.id==='boots').apply(run);run.player.boostSeconds=1.5;assert.equal(run.player.effectiveSpeed,speed*1.3);
 UPGRADES.find(p=>p.id==='trigger').apply(run);assert.equal(run.weapon.interval,.12*.9*.75);
 run.player.hp/=2;UPGRADES.find(p=>p.id==='plates').apply(run);assert.equal(run.player.hp/run.player.maxHealth,.5);
 UPGRADES.find(p=>p.id==='grisou').apply(run);assert.equal(run.grisou.enabled,true);
});
test('Grisou propagates an SMG kill through the existing explosion resolver',()=>{
 const run=new Run(()=>0,{}, {weaponId:'smg'}),e=active('rat'),near=active('rat');near.id=2;near.x+=20;e.hp=5;
 run.enemies=[e,near];run.grisou={enabled:true,kills:5};
 const events=[];run.projectiles.fire(100,300,0,0,WEAPONS.smg);run.projectiles.update(.2,run.enemies,events,run.player);
 resolveExplosions(events,run.enemies,run.grisou);assert.ok(events.some(e=>e.type==='explosion'));assert.equal(near.alive,false);
});
for(const weaponId of ['shotgun','smg'])test('complete '+weaponId+' run preserves drops, collection and all twenty waves',()=>{
 const UpgradeFlow=LegacyFlow;
 let seed=weaponId==='shotgun'?1:5;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const run=new LegacyRun(rng,{}, {weaponId,rewardRandom:()=>.99}),flow=new UpgradeFlow(run,rng);
 // V0.15: legal SMG heat build, unchanged combat assertions and no stat overrides.
 const priority=weaponId==='smg'?['critical-heat','trigger','heat','plates','boots','piercing','magazine']:['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn'];
 const choose=()=>flow.choose(priority.find(id=>flow.offered.some(c=>c.id===id)));
 flow.open();choose();let shots=0;
 for(let i=0;i<36000&&run.status==='playing';i++){
  const input=steer(run),events=run.update(1/60,input);
  if(events.some(e=>e.type==='shot')){shots++;assert.equal(input.x,0);assert.equal(input.y,0);assert.equal(run.player.vx,0);assert.equal(run.player.vy,0);}
  assert.ok(run.loot.activeCount<=20);assert.equal(run.projectiles.pool.length,84);
  if(flow.afterCombat())choose();
 }
 assert.equal(run.status,'won');assert.equal(run.kills,235);assert.equal(flow.count,6);assert.ok(shots>0);assert.equal(run.loot.activeCount,0);
 assert.deepEqual(run.collectedRewards,{coal:94,iron:8,diamond:0,token:0});
});

test('SMG hits beyond shotgun reach, expires at its own range, and snapshots permanent damage',()=>{
 const target=active('miner');target.x=310;
 const pool=new Projectiles();pool.damageMultiplier=1.25;pool.fire(60,300,0,0,WEAPONS.smg);pool.damageMultiplier=1;
 const events=[];pool.update(.4,[target],events);assert.equal(target.hp,90-6.25);assert.equal(events[0].type,'hit');
 const shotgun=new Projectiles();shotgun.fire(60,300,0);shotgun.update(.4,[target],[]);assert.equal(target.hp,90-6.25);
 const far=active('miner');far.x=390;pool.fire(60,300,0,0,WEAPONS.smg);pool.update(1,[far],[]);assert.equal(far.hp,90);assert.ok(pool.pool.every(p=>!p.active));
});
test('maximum SMG cadence and damage build keeps fixed pools and finite combat state',()=>{
 const run=new Run(()=>.99,{power:5,mechanics:5,health:5,mobility:5},{weaponId:'smg'});run.untilSpawn=999;
 const e=active('miner');e.hp=1e8;e.update=()=>{}; // Immobile target isolates pool/cadence stress.
run.enemies=[e];run.player.x=100;run.player.y=300;
 for(let i=0;i<2;i++)UPGRADES.find(p=>p.id==='trigger').apply(run);
 let shots=0,max=0;
 for(let i=0;i<3600;i++){shots+=run.update(1/60).filter(e=>e.type==='shot').length;max=Math.max(max,run.projectiles.pool.filter(p=>p.active).length);}
 assert.ok(shots>850);assert.ok(max<10);assert.equal(run.projectiles.pool.length,84);assert.ok(Number.isFinite(e.hp));assert.equal(run.player.hp,6.25);
});
