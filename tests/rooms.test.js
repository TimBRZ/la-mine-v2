import {UpgradeFlow as LegacyFlow} from './v021-final-src-snapshot/upgrades.js';
// Exact historical replay keeps its original hostile shots; other tests use live Run.
import {Run as LegacyRun} from './legacy-volley-run.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { Run } from '../src/run.js';
import { WAVES, WAVE_READY_SECONDS } from '../src/waves.js';
import { Haveuse, HAVEUSE } from '../src/boss.js';
import { UpgradeFlow } from '../src/upgrades.js';
import { finishFixtureRoom, enterFixtureRoom, collectFixtureLoot, steer } from './run-helpers.js';

test('twenty fixed waves, four escalating stages and a triple final', () => {
  assert.equal(WAVES.length, 20);
  assert.equal(new Set(WAVES.map(r=>r.id)).size, 20);
  assert.deepEqual(WAVES.map(r=>r.total), [6,8,9,10,1,10,12,13,14,1,14,16,17,18,1,18,20,22,22,3]);
  assert.ok(WAVES.slice(1,4).every((r,i)=>r.interval < WAVES[i].interval));
  const run = new Run();
  assert.equal(run.waveNumber, 1); assert.equal(run.wavePhase,'combat');
  assert.equal(run.completedWaves,0); assert.equal('exitOpen' in run, false);
});

test('empty room does not clear before all planned enemies have spawned', () => {
  const run = new Run();
  run.untilSpawn = 100;
  run.update(.04); assert.equal(run.wavePhase,'combat');
  run.spawned = run.wave.total - 1;
  run.update(.04); assert.equal(run.wavePhase,'combat');
  run.spawned = run.wave.total;
  run.enemies = [new Haveuse(1)]; run.update(0);
  assert.equal(run.wavePhase,'combat');
  run.enemies[0].hp=0; run.update(0);
  assert.equal(run.wavePhase,'collecting'); assert.equal('exitOpen' in run, false);
  collectFixtureLoot(run);
  assert.equal(run.wavePhase,'cleared'); assert.equal('exitOpen' in run, false);
});

test('automatic next wave needs no exit and keeps position during preparation', () => {
  const run = new Run();
  run.player.x=100; run.player.y=414; run.update(0);
  assert.equal(run.wavePhase,'combat');
  finishFixtureRoom(run);
  assert.equal(run.spawn(),false);
  run.update(0);
  assert.equal(run.waveNumber,2); assert.equal(run.wavePhase,'preparing');
  assert.equal(run.preparationRemaining,WAVE_READY_SECONDS);
  for(let i=0;i<16;i++)run.update(.04);
  assert.equal(run.wavePhase,'combat');
  assert.equal(run.player.x,100); assert.equal(run.player.y,414);
  assert.equal(run.enterNextWave(),false);
});

test('PV, player object, weapons and perks persist; obsolete combat state is cleared', () => {
  const run = new Run(), player=run.player, weapon=run.weapon;
  run.player.hp=2.5; run.player.maxHealth=6;
  run.weapon.pellets=9; run.grisou.enabled=true; run.upgradeRanks.buckshot=1;
  run.projectiles.fire(50,300,0);
  enterFixtureRoom(run,2);
  assert.equal(run.player,player); assert.equal(run.weapon,weapon);
  assert.equal(run.player.hp,2.5); assert.equal(run.player.maxHealth,6);
  assert.equal(run.weapon.pellets,9); assert.equal(run.grisou.enabled,true);
  assert.equal(run.upgradeRanks.buckshot,1);
  assert.equal(run.enemies.length,0);
  assert.ok(run.projectiles.pool.every(p=>!p.active));
});

test('choices happen initially and after waves 4, 9, 14, 18 and 19, never from a kill threshold', () => {
  const run = new Run(), flow = new UpgradeFlow(run,()=>.3);
  assert.equal(flow.open(),true); flow.choose(flow.offered[0].id);
  run.kills=12; assert.equal(flow.afterCombat(),false);
  for(let number=1;number<20;number++) {
    finishFixtureRoom(run);
    const expected=[4,9,14,18,19].includes(number);
    assert.equal(run.choicePending,expected);
    if(expected) {
      assert.equal('exitOpen' in run, false);
      run.player.x=225;run.player.y=635;run.update(0);
      assert.equal(run.wavePhase,'cleared');
      assert.equal(flow.afterCombat(),true);
      assert.equal(flow.choose('unknown'),false);
      const offered=flow.offered[0].id;
      assert.equal(flow.choose(offered),true);
      assert.equal(flow.choose(offered),false);
    } else assert.equal(flow.afterCombat(),false);
    assert.equal('exitOpen' in run, false);
    run.player.x=225;run.player.y=635;run.update(0);
    while(run.wavePhase==='preparing')run.update(.04);
    assert.equal(run.waveNumber,number+1);
  }
  assert.equal(flow.count,6);
});

test('boss is created once on entering wave 5; no normal spawns or exit', () => {
  const run=new Run();enterFixtureRoom(run,5);
  assert.equal(run.enemies.length,1);
  assert.ok(run.enemies[0] instanceof Haveuse);
  assert.equal(run.enemies[0].hp,HAVEUSE.health);
  assert.equal(run.spawn(),false);
  assert.equal('exitOpen' in run, false);
});

test('boss warning locks a direction, does not move, then charges and recovers', () => {
  const boss=new Haveuse(1), player={x:225,y:500};
  boss.warmup=0;boss.phaseTime=.01;
  boss.update(.02,player);assert.equal(boss.phase,'warning');
  const start={x:boss.x,y:boss.y}, angle=boss.chargeAngle;
  player.x=350;
  for(let i=0;i<20;i++)boss.update(.04,player);
  assert.equal(boss.phase,'warning');assert.equal(boss.x,start.x);assert.equal(boss.y,start.y);
  assert.equal(boss.chargeAngle,angle);
  for(let i=0;i<3;i++)boss.update(.04,player);
  assert.equal(boss.phase,'charge');
  boss.update(.04,player);assert.ok(boss.y>start.y);
  for(let i=0;i<20;i++)boss.update(.04,player);
  assert.equal(boss.phase,'recovery');
});

test('telegraphed charge hurts a stationary player but can be dodged laterally', () => {
  for(const dodge of [false,true]) {
    const run=new Run();enterFixtureRoom(run,5);
    const boss=run.enemies[0];
    const initialHp=run.player.hp;
    run.player.x=225;run.player.y=414;run.weapon.cooldown=999;
    boss.warmup=0;boss.phase='warning';boss.phaseTime=HAVEUSE.warningSeconds;boss.chargeAngle=Math.PI/2;
    for(let i=0;i<95;i++)run.update(1/60,dodge?{x:1,y:0}:{x:0,y:0});
    if(dodge) assert.equal(run.player.hp,initialHp);
    else assert.ok(run.player.hp<initialHp);
  }
});

test('boss death wins globally and player death loses; terminal states are inert', () => {
  const won=new Run();enterFixtureRoom(won,20);
  for(const enemy of won.enemies){enemy.warmup=0;enemy.hp=1;won.projectiles.fire(enemy.x,enemy.y,0);}
  won.projectiles.fire(won.enemies[0].x,won.enemies[0].y,0);
  won.update(0);
  assert.equal(won.status,'playing'); assert.equal(won.wavePhase,'collecting');
  collectFixtureLoot(won);
  assert.equal(won.status,'won');assert.equal(won.completedWaves,20);
  const lost=new Run();lost.player.hp=0;lost.update(0);assert.equal(lost.status,'lost');
  for(const run of [won,lost]) {
    const before=JSON.stringify(run);run.update(1,{x:1,y:1});
    assert.equal(JSON.stringify(run),before);
  }
  const fresh=new Run();assert.equal(fresh.waveNumber,1);assert.equal(fresh.player.hp,5);
  assert.deepEqual(fresh.upgradeRanks,{});assert.equal(fresh.damageTaken,0);
});

test('pause freezes an in-flight transition and boss charge, no delayed room callbacks', () => {
  const run=new Run();finishFixtureRoom(run);
  run.player.x=225;run.player.y=635;run.update(0);run.paused=true;
  const before=JSON.stringify(run);
  for(let i=0;i<100;i++)run.update(.04);
  assert.equal(JSON.stringify(run),before);
  run.paused=false;for(let i=0;i<16;i++)run.update(.04);
  assert.equal(run.waveNumber,2);
  enterFixtureRoom(run,5);run.paused=true;
  const bossBefore=JSON.stringify(run.enemies[0]);run.update(.04);
  assert.equal(JSON.stringify(run.enemies[0]),bossBefore);
});

test('real combat can finish a twenty-wave run with six choices and no healing/reset', () => {
 const UpgradeFlow=LegacyFlow;
  let seed = 1; // V0.15 real-combat regression seed, no healing or stat override.
  const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const run=new LegacyRun(rng),flow=new UpgradeFlow(run,rng),visited=new Set([1]);
  flow.open();
  const choose=()=> {
    const preferred=['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn'];
    flow.choose(preferred.find(id=>flow.offered.some(c=>c.id===id)));
  };
  choose();
  for(let i=0;i<36000&&run.status==='playing';i++) {
    run.update(1/60,steer(run));
    if(flow.afterCombat()) choose();
    visited.add(run.waveNumber);
  }
  assert.equal(run.status,'won','room '+run.waveNumber+' kills '+run.kills+' hp '+run.player.hp);
  assert.equal(visited.size,20);assert.equal(run.kills,235);
  assert.equal(flow.count,6);assert.ok(run.player.hp>0);
  assert.ok(run.elapsed<600);
});
