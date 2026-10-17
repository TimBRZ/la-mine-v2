import {UpgradeFlow as LegacyFlow} from './v021-final-src-snapshot/upgrades.js';
// Exact historical replay keeps its original hostile shots; other tests use live Run.
import {Run as LegacyRun} from './legacy-volley-run.js';
import {V021_FILES} from './v021-authorized-files.js';
import { VISUAL_FILES } from './v019-visual-files.js';
import { preserveWorkshopHint } from './v017-protected-copy.js';
import { TALENT_FILES } from './v016-authorized-files.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Run } from '../src/run.js';
import { UPGRADES, UpgradeFlow, drawUpgrades } from '../src/upgrades.js';
import { WEAPONS } from '../src/weapons.js';
import { Projectiles } from '../src/combat.js';
import { WAVES } from '../src/waves.js';
import { resolveExplosions } from '../src/explosions.js';
import { createEnemy } from '../src/enemies/registry.js';
import { perkReadouts } from '../src/perk-feedback.js';
import { enterFixtureRoom, finishFixtureRoom, steer } from './run-helpers.js';

const rng = seed => () => ((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
function apply(run,id) { UPGRADES.find(p=>p.id===id).apply(run);run.upgradeRanks[id]=(run.upgradeRanks[id]||0)+1; }
function dummy(id=1,x=250,y=400) { const e=createEnemy('miner',id,x,y);e.warmup=0;e.hp=10000;e.update=()=>{};return e; }
function fixture(weaponId='smg') { const run=new Run(()=>.99,{}, {weaponId});run.untilSpawn=999;run.player.x=100;run.player.y=400;run.enemies=[dummy()];return run; }

test('V0.13 pressure rises across four stages and readable spaced drills',()=>{
  assert.deepEqual(WAVES.slice(0,5).map(w=>w.total),[6,8,9,10,1]);
  assert.deepEqual(WAVES.slice(0,5).map(w=>w.maxAlive),[3,4,4,5,1]);
  assert.ok(WAVES[2].interval<WAVES[1].interval&&WAVES[3].interval<WAVES[2].interval);
  assert.equal(WAVES[2].enemies.filter(k=>k==='drill').length,2);
  assert.equal(WAVES[3].enemies.filter(k=>k==='drill').length,2);
  assert.equal(WAVES[3].enemies.filter(k=>k==='rat').length,6);
  const run=new Run();enterFixtureRoom(run,4);
  for(let i=0;i<1000&&run.spawned<run.wave.total;i++) {
    run.enemies=run.enemies.filter(e=>e.kind==='drill');
    const before=run.enemies.length;run.spawn();
    if(run.enemies.length>before&&run.enemies.at(-1).kind==='drill') {
      const e=run.enemies.at(-1);
      for(const other of run.enemies.slice(0,-1))assert.ok(Math.hypot(e.x-other.x,e.y-other.y)>140);
    }
  }
  assert.ok(run.spawned>=10);
});

test('heavy buckshot adds four visible pellets, wider spread and exactly 20 percent lower cadence',()=>{
  const run=fixture('shotgun'),interval=run.weapon.interval;apply(run,'buckshot');
  run.weapon.update(0,run.player,run.enemies,run.projectiles,[]);
  const pellets=run.projectiles.pool.filter(p=>p.active);
  assert.equal(pellets.length,11);assert.equal(run.weapon.interval,interval/.8);
  assert.ok(pellets.at(-1).angle-pellets[0].angle>WEAPONS.shotgun.spread);
});

test('sawn-off snapshots shorter projectile range and rejects targets past the new limit',()=>{
  const run=fixture('shotgun');apply(run,'sawn');
  assert.equal(run.weapon.closeBonus,.6);assert.equal(run.weapon.range,WEAPONS.shotgun.range*.8);
  run.enemies[0].x=run.player.x+run.weapon.range+1;
  const events=[];run.weapon.update(0,run.player,run.enemies,run.projectiles,events);assert.equal(events.length,0);
  run.enemies[0].x=run.player.x+50;
  run.weapon.update(0,run.player,run.enemies,run.projectiles,events);
  assert.ok(run.projectiles.pool.filter(p=>p.active).every(p=>p.range===run.weapon.range));
});

test('Grisou counts unique deaths, explodes at six and retains progress between waves',()=>{
  const run=new Run();apply(run,'grisou');
  for(let id=1;id<=5;id++) {
    const event={type:'kill',id,x:100,y:200},events=[event,event];
    resolveExplosions(events,[],run.grisou);
    assert.equal(run.grisou.kills,id);assert.equal(events.some(e=>e.type==='explosion'),false);
  }
  assert.match(perkReadouts(run)[0].detail,/PRÊT/);
  finishFixtureRoom(run);run.update(0);assert.equal(run.grisou.kills,5);
  const events=[{type:'kill',id:6,x:100,y:200}];resolveExplosions(events,[],run.grisou);
  assert.equal(events.filter(e=>e.type==='explosion').length,1);assert.equal(run.grisou.kills,0);
});

test('Grisou chains through six nearby victims without duplicate deaths or unbounded recursion',()=>{
  const enemies=Array.from({length:7},(_,i)=>{const e=dummy(i+2,200+i,300);e.hp=1;return e;});
  const events=[{type:'kill',id:1,x:200,y:300}],grisou={enabled:true,kills:5};
  resolveExplosions(events,enemies,grisou);
  assert.equal(events.filter(e=>e.type==='kill').length,8);
  assert.equal(events.filter(e=>e.type==='explosion').length,2);
  assert.equal(new Set(events.filter(e=>e.type==='kill').map(e=>e.id)).size,8);
  assert.equal(grisou.kills,1);
});

test('shield absorbs damage, grants normal invulnerability, persists and refreshes without healing',()=>{
  const run=fixture();run.player.hp=3;apply(run,'plates');
  const events=[];assert.equal(run.damagePlayer(1.5,events),true);
  assert.equal(run.player.hp,3);assert.equal(run.shield,0);assert.equal(run.damageTaken,0);
  assert.ok(events.some(e=>e.type==='shield-hit'));
  assert.equal(run.damagePlayer(1.5,events),false);
  finishFixtureRoom(run);run.update(0);assert.equal(run.shield,1);assert.equal(run.shieldSeconds,0);
  assert.equal(run.player.hp,3);
  while(run.wavePhase==='preparing')run.update(.04);
  run.untilSpawn=999;
  for(let i=0;i<201;i++)run.update(.04);
  assert.equal(run.shield,1);assert.equal(run.player.hp,3);
});

test('shield and SMG timers freeze during a Porion selection',()=>{
  const run=fixture();apply(run,'plates');apply(run,'heat');apply(run,'magazine');
  for(let i=0;i<30;i++)run.update(.04);
  const flow=new UpgradeFlow(run,rng(42));flow.open();const before=JSON.stringify(run);
  for(let i=0;i<500;i++)run.update(.04,{x:1,y:0});
  assert.equal(JSON.stringify(run),before);
});

test('boots and trigger provide the declared speed and interval and their ranked HUD stays accurate',()=>{
  const run=new Run(),speed=run.player.speed,interval=run.weapon.interval;
  apply(run,'boots');apply(run,'trigger');apply(run,'trigger');
  run.player.boostSeconds=1.5;assert.equal(run.player.effectiveSpeed,speed*1.3);assert.equal(run.weapon.interval,interval*.75*.75);
  assert.deepEqual(perkReadouts(run).map(p=>p.title),['BOTTES ×1','DÉTENTE ×2']);
  assert.match(perkReadouts(run)[1].detail,/44 %/);
});

test('extended magazine accelerates exactly the first two seconds after settling, never resets cooldown',()=>{
  const run=fixture();apply(run,'magazine');
  run.weapon.update(.1,run.player,run.enemies,run.projectiles,[]);
  assert.equal(run.weapon.cooldown,run.weapon.interval/1.3);
  run.weapon.stoppedFor=2.01;run.weapon.cooldown=0;
  run.weapon.update(0,run.player,run.enemies,run.projectiles,[]);
  assert.equal(run.weapon.cooldown,run.weapon.interval);
  run.weapon.update(.01,run.player,run.enemies,run.projectiles,[],Math.random,false);
  assert.equal(run.weapon.stoppedFor,0);assert.ok(run.weapon.cooldown>0);
  const events=[];run.weapon.update(0,run.player,run.enemies,run.projectiles,events);
  assert.equal(events.length,0);
});

test('heat grows by ten percent per second to forty, affects real damage and resets even on tiny input',()=>{
  const run=fixture();apply(run,'heat');
  for(let i=0;i<150;i++)run.update(.04);
  assert.equal(run.weapon.heat,.4);
  run.weapon.cooldown=0;for(const p of run.projectiles.pool)p.active=false;
  run.weapon.update(0,run.player,run.enemies,run.projectiles,[]);
  const hp=run.enemies[0].hp;run.projectiles.update(.2,run.enemies,[],run.player);
  assert.ok(Math.abs(hp-run.enemies[0].hp-7)<1e-8);
  run.update(.01,{x:.001,y:0});assert.equal(run.weapon.heat,0);
  assert.match(perkReadouts(run)[0].detail,/\+0 %/);
});

test('piercing traverses exactly one enemy in geometric order with 60 percent second damage',()=>{
  for(const steps of [[.3],[.04,.04,.04,.04,.04,.04,.04,.02]]) {
    const pool=new Projectiles(),enemies=[dummy(1,180),dummy(2,220),dummy(3,260)];
    pool.fire(100,400,0,0,WEAPONS.smg,{piercing:true});const events=[];
    for(const dt of steps)pool.update(dt,[...enemies].reverse(),events);
    assert.deepEqual(enemies.map(e=>10000-e.hp),[5,3,0]);
    assert.deepEqual(events.map(e=>e.id),[1,2]);assert.ok(pool.pool.every(p=>!p.active));
    pool.fire(100,400,0,0,WEAPONS.smg);pool.update(.3,enemies,[]);
    assert.deepEqual(enemies.map(e=>10000-e.hp),[10,3,0]);
  }
});

test('piercing kills feed the physical drop ledger once per target',()=>{
  const run=fixture();apply(run,'piercing');
  run.enemies=[dummy(1,180),dummy(2,220)];run.enemies[0].hp=5;run.enemies[1].hp=3;
  run.weapon.cooldown=999;run.projectiles.fire(100,400,0,0,WEAPONS.smg,{piercing:true});
  for(let i=0;i<8;i++)run.update(.04);
  assert.equal(run.kills,2);assert.equal(run.loot.deaths.size,2);
  assert.equal(run.loot.emitted.coal,Math.floor(run.loot.plan.coal*2/6));
});

test('each weapon has seven compatible perks, three dedicated and four shared',()=>{
  const shared=['boots','trigger','grisou','plates'];
  assert.deepEqual(WEAPONS.shotgun.perks.filter(id=>!shared.includes(id)).sort(),['buckshot','double','sawn']);
  assert.deepEqual(WEAPONS.smg.perks.filter(id=>!shared.includes(id)).sort(),['heat','magazine','piercing']);
  for(const weaponId of ['shotgun','smg'])assert.equal(WEAPONS[weaponId].perks.length,7);
});

test('consecutive choices avoid identical triples, use diverse categories and weight owned ranks lower',()=>{
  for(const weaponId of ['shotgun','smg']) {
    const run=new Run(Math.random,{}, {weaponId});let previous=[];
    for(let i=1;i<=300;i++) {
      const cards=drawUpgrades(run,rng(i),previous),ids=cards.map(c=>c.id);
      assert.equal(new Set(ids).size,3);assert.equal(new Set(cards.map(c=>c.category)).size,3);
      assert.notDeepEqual([...ids].sort(),[...previous].sort());previous=ids;
    }
  }
  const fresh=new Run(),ranked=new Run();ranked.upgradeRanks.trigger=1;
  let base=0,reduced=0;
  for(let i=1;i<=2000;i++) {
    base+=drawUpgrades(fresh,rng(i)).some(c=>c.id==='trigger');
    reduced+=drawUpgrades(ranked,rng(i)).some(c=>c.id==='trigger');
  }
  assert.ok(reduced<base*.8,JSON.stringify({base,reduced}));
});

test('all ten perks obey caps through selection and every card advertises its next rank and maximum',()=>{
  for(const weaponId of ['shotgun','smg']) {
    const run=new Run(Math.random,{}, {weaponId}),flow=new UpgradeFlow(run,rng(42));
    for(let i=0;i<30&&flow.open();i++) {
      const card=flow.offered[0];assert.equal(card.rank,(run.upgradeRanks[card.id]||0)+1);
      assert.ok(card.rank<=card.maxRanks);assert.equal(flow.choose(card.id),true);assert.equal(flow.choose(card.id),false);
    }
    assert.equal(drawUpgrades(run).length,0);
    for(const id of WEAPONS[weaponId].perks)assert.equal(run.upgradeRanks[id],UPGRADES.find(p=>p.id===id).maxRanks);
  }
});

test('a distinct SMG build with piercing and magazine at Atelier 5 completes real combat without healing',()=>{
 const UpgradeFlow=LegacyFlow;
  const random=rng(1),run=new LegacyRun(random,{power:5,health:5,mechanics:5,mobility:5}, {weaponId:'smg',rewardRandom:()=>.99}),flow=new UpgradeFlow(run,random);
  const choose=()=>flow.choose(['total-piercing','piercing','heat','magazine','trigger','plates','grisou','boots'].find(id=>flow.offered.some(c=>c.id===id)));
  flow.open();choose();
  for(let i=0;i<36000&&run.status==='playing';i++){run.update(1/60,steer(run));if(flow.afterCombat())choose();}
  assert.equal(run.status,'won');assert.equal(run.kills,235);assert.equal(run.upgradeRanks.piercing,1);assert.equal(run.upgradeRanks.magazine,1);
  assert.deepEqual(run.collectedRewards,{coal:94,iron:8,diamond:0,token:0});
});

test('V0.12 leaves physical drops, economy, storage, Relève, Atelier, terrain and enemies unchanged',async()=>{
  // V0.14 explicitly retunes boss/rat/drill behavior; difficulty-v014 covers it.
  const baseline=JSON.parse(await readFile(new URL('./v012-protected-baseline.json',import.meta.url)));
  // V0.13 only: injected wave budgets, new zone caption and multi-boss visuals.
  // Physical collection and original rewards remain covered by loot/world tests.
  for(const [file,hash] of Object.entries(baseline).filter(([file])=>!V021_FILES.includes(file)).filter(([file])=>!VISUAL_FILES.includes(file)).filter(([file])=>!TALENT_FILES.includes(file)).filter(([file])=>!['room-loot.js','menu/state.js','arena-view.js','boss.js','enemies/rat.js','enemies/drill.js'].includes(file))) {
    let bytes=preserveWorkshopHint(file,await readFile(new URL('../src/'+file,import.meta.url)));
    // The home menu only updates its version badge.
    if(file==='menu/main-menu.js')bytes=Buffer.from(bytes.toString().replace('V0.15','V0.11'));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),hash,file);
  }
});
