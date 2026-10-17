import {UpgradeFlow as LegacyFlow} from './v021-final-src-snapshot/upgrades.js';
// Exact historical replay keeps its original hostile shots; other tests use live Run.
import {Run as LegacyRun} from './legacy-volley-run.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RoomLoot, LOOT } from '../src/wave-loot.js';
import { roomRewards, runRewards } from '../src/rewards.js';
import { emptyWallet } from '../src/resources.js';
import { Run } from '../src/run.js';
import { Enemy } from '../src/enemy.js';
import { Wallet } from '../src/wallet.js';
import { LocalProfileStorage } from '../src/local-profile-storage.js';
import { UpgradeFlow } from '../src/upgrades.js';
import { finishFixtureRoom, enterFixtureRoom, collectFixtureLoot, steer } from './run-helpers.js';

const kill = (loot, id) => loot.onKill({ id, x: 70 + id * 10, y: 180 });
const player = { x: 380, y: 600 };
test('real enemy death spawns a drop, repeated death cannot mint resources', () => {
  const run = new Run(); run.untilSpawn = 999; run.loot.enemyCount=1;
  const enemy = new Enemy(1, 100, 200); enemy.warmup = 0; enemy.hp = 1;
  run.enemies.push(enemy); run.spawned = 1;
  run.projectiles.fire(100, 200, 0);
  const events = run.update(0), event = events.find(e => e.type === 'kill');
  assert.ok(event); assert.equal(run.loot.activeCount, 1);
  const before = { ...run.loot.emitted };
  run.loot.onKill(event); assert.deepEqual(run.loot.emitted, before);
});
test('drops remain still throughout combat and passing over one collects exactly once', () => {
  const loot = new RoomLoot(1, 6); kill(loot, 1);
  const drop = loot.pool.find(d => d.active), position = [drop.x, drop.y];
  for (let i = 0; i < 1000; i++) loot.update(.04, player, []);
  assert.deepEqual([drop.x, drop.y], position); assert.equal(loot.activeCount, 1);
  const events = [];
  loot.update(.04, { x: drop.x, y: drop.y }, events);
  loot.update(.04, { x: drop.x, y: drop.y }, events);
  assert.equal(events.length, 1); assert.equal(loot.collected.coal, 1);
});
test('end-of-wave breath precedes accelerating magnetism and collection completes even while running away', () => {
  const loot = new RoomLoot(4, 16, () => 0);
  for (let id = 1; id <= 16; id++) kill(loot, id);
  assert.equal(loot.activeCount, 18);
  const drop = loot.pool[0], x = drop.x, y = drop.y;
  loot.beginCollection(player);
  for (let i = 0; i < 4; i++) loot.update(.04, player, []);
  assert.deepEqual([drop.x, drop.y], [x, y]);
  loot.update(.04, player, []);
  const firstStep = Math.hypot(drop.x - x, drop.y - y), next = { x: drop.x, y: drop.y };
  loot.update(.04, player, []);
  assert.ok(Math.hypot(drop.x - next.x, drop.y - next.y) > firstStep);
  let frames = 0;
  while (loot.phase !== 'done' && frames++ < 60) loot.update(.04, { x: 225 + Math.sin(frames / 10) * 170, y: 600 }, []);
  assert.equal(loot.phase, 'done'); assert.equal(loot.activeCount, 0);
  assert.deepEqual(loot.collected, loot.plan);
});
test('collection blocks the next wave; completed rewards persist without doubling', () => {
  const run = new Run();
  run.player.x = 225; run.player.y = 635;
  run.spawned = run.wave.total; run.enemies = [];
  run.update(0);
  assert.equal(run.wavePhase, 'collecting'); assert.equal('exitOpen' in run, false);
  assert.equal(run.completedWaves, 0); assert.deepEqual(run.collectedRewards, emptyWallet());
  collectFixtureLoot(run);
  assert.equal('exitOpen' in run, false); assert.equal(run.collectedRewards.coal, 2);
  run.update(.01);
  for (let i = 0; i < 16; i++) run.update(.04);
  assert.equal(run.waveNumber, 2); assert.equal(run.loot.activeCount, 0);
  assert.equal(run.collectedRewards.coal, 2);
});
test('pause freezes drops, magnet delay and totals; choices only start after collection', () => {
  const run = new Run(); enterFixtureRoom(run, 4);
  run.spawned = run.wave.total; run.enemies = []; run.update(0);
  const flow = new UpgradeFlow(run);
  assert.equal(flow.afterCombat(), false);
  run.paused = true; const before = JSON.stringify(run);
  for (let i = 0; i < 20; i++) run.update(.04);
  assert.equal(JSON.stringify(run), before);
  run.paused = false; collectFixtureLoot(run);
  assert.equal(flow.afterCombat(), true);
});
test('defeat keeps completed waves only; provisional pickups of the unfinished room are discarded', () => {
  const run = new Run(); enterFixtureRoom(run, 2);
  run.loot.enemyCount=1; run.loot.onKill({ id: 99, x: run.player.x, y: run.player.y });
  run.update(0); assert.ok(run.loot.collected.coal > 0);
  run.player.hp = 0; run.update(0);
  assert.equal(run.status, 'lost'); assert.equal(run.loot.activeCount, 0);
  assert.deepEqual(runRewards(run), { coal: 2, iron: 0, diamond: 0, token: 0 });
});
test('boss collection precedes victory; wallet and result consume the exact collected ledger without RNG or duplicate gains', () => {
  const run = new Run(Math.random, {}, { rewardRandom: () => 0 }); enterFixtureRoom(run, 20);
  for(const enemy of run.enemies){enemy.warmup=0;enemy.hp=1;run.projectiles.fire(enemy.x,enemy.y,0);}
  run.projectiles.fire(run.enemies[0].x, run.enemies[0].y, 0); run.update(0);
  assert.equal(run.status, 'playing'); assert.equal(run.wavePhase, 'collecting'); assert.equal('exitOpen' in run, false);
  assert.ok(run.loot.activeCount >= 4);
  collectFixtureLoot(run); assert.equal(run.status, 'won');
  const expected = { coal: 94, iron: 11, diamond: 2, token: 1 };
  assert.deepEqual(run.collectedRewards, expected);
  const wallet = new Wallet(new LocalProfileStorage({ getItem: () => null, setItem: () => {} }));
  const failRng = () => { throw Error('No second reward roll'); };
  assert.deepEqual(wallet.claim(run, failRng), expected);
  assert.deepEqual(wallet.claim(run, failRng), expected);
  assert.deepEqual(wallet.snapshot.wallet, expected);
  assert.deepEqual(runRewards(run, failRng), expected);
  assert.equal(wallet.buy('power'), true); assert.equal(wallet.snapshot.wallet.coal, 64);
});
test('drop plan preserves V0.4 rare thresholds and combat RNG is independent', () => {
  assert.equal(roomRewards(4, () => .05).diamond, 0);
  assert.equal(roomRewards(4, () => .049).diamond, 1);
  assert.equal(roomRewards(5, () => .12).diamond, 0);
  assert.equal(roomRewards(5, () => .119).diamond, 1);
  assert.equal(roomRewards(5, () => .01).token, 0);
  assert.equal(roomRewards(5, () => .009).token, 1);
  const run = new Run(() => { throw Error('Rewards must not roll combat RNG'); }, {}, { rewardRandom: () => 0 });
  enterFixtureRoom(run, 20);
  assert.equal(run.loot.plan.token, 1);
});
test('100000 physical boss drop budgets preserve diamond and token rarity', () => {
  let seed = 4567, diamonds = 0, tokens = 0;
  const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 100000; i++) {
    const loot = new RoomLoot(5, 1, rng); kill(loot, 1);
    diamonds += loot.emitted.diamond; tokens += loot.emitted.token;
  }
  assert.ok(diamonds > 11500 && diamonds < 12500);
  assert.ok(tokens > 850 && tokens < 1150);
});
test('all room drop pools are bounded and conserve every unit with or without early pickup', () => {
  for (const early of [true, false]) for (const [index, count] of [6, 10, 15, 18, 1].entries()) {
    const loot = new RoomLoot(index + 1, count, () => 0);
    for (let id = 1; id <= count; id++) {
      kill(loot, id);
      assert.ok(loot.activeCount <= 20); assert.equal(loot.pool.length, LOOT.capacity);
      if (early) for (const drop of loot.pool) if (drop.active) loot.update(0, drop, []);
    }
    loot.beginCollection(player);
    for (let i = 0; i < 100; i++) loot.update(.04, player, []);
    assert.equal(loot.phase, 'done'); assert.deepEqual(loot.collected, loot.plan);
    const before = { ...loot.collected }; loot.beginCollection(player); loot.update(.04, player, []);
    assert.deepEqual(loot.collected, before);
  }
});
test('mode B complete twenty-wave combat with stop-and-dodge steering uses real shots, drops and six perks', () => {
 const UpgradeFlow=LegacyFlow;
  let seed = 1; // V0.15 real-combat regression seed, no healing or stat override.
  const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const run = new LegacyRun(rng, {}, { fireMode: 'B', rewardRandom: () => .99 });
  const flow = new UpgradeFlow(run, rng);
  const choose = () => flow.choose(['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn'].find(id => flow.offered.some(c => c.id === id)));
  flow.open(); choose();
  let badShots = 0;
  for (let i = 0; i < 36000 && run.status === 'playing'; i++) {
    const input = steer(run);
    const events = run.update(1 / 60, input);
    if ((input.x || input.y || run.player.vx || run.player.vy) && events.some(e => e.type === 'shot')) badShots++;
    if (flow.afterCombat()) choose();
  }
  assert.equal(badShots, 0);
  assert.equal(run.status, 'won', `room ${run.waveNumber}, hp ${run.player.hp}, kills ${run.kills}`);
  assert.equal(run.kills,235); assert.equal(flow.count,6);
  assert.equal(run.collectedRewards.coal, 94); assert.equal(run.loot.activeCount, 0);
});
