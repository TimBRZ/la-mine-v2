import {UpgradeFlow as LegacyFlow} from './v021-final-src-snapshot/upgrades.js';
// Exact historical replay keeps its original hostile shots; other tests use live Run.
import {Run as LegacyRun} from './legacy-volley-run.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RESOURCES, emptyWallet } from '../src/resources.js';
import { runRewards } from '../src/rewards.js';
import { PERMANENT_UPGRADES, MAX_LEVEL, emptyLevels, upgradeCost } from '../src/permanent-upgrades.js';
import { LocalProfileStorage, STORAGE_KEY, emptyProfile, sanitizeProfile } from '../src/local-profile-storage.js';
import { Wallet } from '../src/wallet.js';
import { Run } from '../src/run.js';
import { Enemy } from '../src/enemy.js';
import { UPGRADES } from '../src/upgrades.js';
import { PLAYER, GAMIN } from '../src/config.js';
import { steer } from './run-helpers.js';
import { UpgradeFlow } from '../src/upgrades.js';
const memory = () => { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), data }; };
const terminal = (completedWaves, status = 'lost') => ({ completedWaves, status });
const funded = () => { const storage = new LocalProfileStorage(memory()); const profile = emptyProfile(); profile.wallet = { coal: 5000, iron: 500, diamond: 20, token: 7 }; storage.write(profile); return new Wallet(storage); };

test('exactly four resources and four permanent upgrades, capped at five', () => {
  assert.deepEqual(RESOURCES.map(item => item.id), ['coal', 'iron', 'diamond', 'token']);
  assert.equal(PERMANENT_UPGRADES.length, 4); assert.equal(MAX_LEVEL, 5);
});
test('completed waves grant progressive rewards, defeat keeps cleared waves only', () => {
  const expected = [0, 10, 24, 42, 64];
  for (let room = 0; room <= 4; room++) assert.equal(runRewards(terminal(room), () => .99).coal, expected[room]);
  assert.deepEqual(runRewards(terminal(0)), emptyWallet());
  assert.deepEqual(runRewards(terminal(4), () => 0), { coal: 64, iron: 6, diamond: 1, token: 0 });
});
test('boss rewards require victory and completed wave five', () => {
  assert.deepEqual(runRewards(terminal(5, 'won'), () => 0), { coal: 94, iron: 11, diamond: 2, token: 1 });
  assert.deepEqual(runRewards(terminal(5, 'won'), () => .99), { coal: 94, iron: 8, diamond: 0, token: 0 });
  assert.equal(runRewards(terminal(5), () => 0).token, 0);
  assert.deepEqual(runRewards(terminal(4, 'playing')), emptyWallet());
});
test('seeded 100000 victories preserve rarity hierarchy, token near one percent', () => {
  let seed = 1234;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const totals = emptyWallet();
  for (let i = 0; i < 100000; i++) {
    const gains = runRewards(terminal(5, 'won'), random);
    for (const id of Object.keys(totals)) totals[id] += gains[id];
  }
  assert.ok(totals.coal > totals.iron * 5);
  assert.ok(totals.diamond > 16000 && totals.diamond < 18000);
  assert.ok(totals.token > 850 && totals.token < 1150);
  assert.ok(totals.iron > totals.diamond * 20 && totals.diamond > totals.token * 10);
});
test('wave two iron is uncommon, wave three iron more frequent; exact probability boundaries', () => {
  assert.equal(runRewards(terminal(2), () => .249).iron, 1);
  assert.equal(runRewards(terminal(2), () => .25).iron, 0);
  assert.equal(runRewards(terminal(3), () => .59).iron, 2);
  assert.equal(runRewards(terminal(3), () => .60).iron, 0);
  assert.equal(runRewards(terminal(5, 'won'), () => .01).token, 0);
});
test('wallet credits a terminal run exactly once, does not consume combat RNG', () => {
  const wallet = new Wallet(new LocalProfileStorage(memory()));
  const run = terminal(5, 'won');
  const gains = wallet.claim(run, () => 0);
  assert.deepEqual(wallet.claim(run, () => { throw Error('must not reroll'); }), gains);
  gains.coal = 999;
  assert.equal(wallet.snapshot.wallet.coal, 94);
  assert.equal(wallet.claim(terminal(1, 'playing')), null);
});
test('wallet totals accumulate across distinct runs and persist in a single isolated key', () => {
  const backend = memory(), wallet = new Wallet(new LocalProfileStorage(backend));
  wallet.claim(terminal(1), () => .99); wallet.claim(terminal(2), () => .99);
  assert.equal(wallet.snapshot.wallet.coal, 34);
  assert.deepEqual([...backend.data.keys()], [STORAGE_KEY]);
  assert.deepEqual(new Wallet(new LocalProfileStorage(backend)).snapshot, wallet.snapshot);
});
test('costs are exact, first ranks coal only, never tokens', () => {
  assert.deepEqual(upgradeCost(0), { coal: 30, iron: 0, diamond: 0, token: 0 });
  assert.deepEqual(upgradeCost(4), { coal: 220, iron: 20, diamond: 1, token: 0 });
  for (let i = 0; i < 5; i++) assert.equal(upgradeCost(i).token, 0);
  assert.equal(upgradeCost(5), null);
});
test('purchases deduct every cost and preserve token; maximum cannot overspend', () => {
  const wallet = funded();
  for (const { id } of PERMANENT_UPGRADES) {
    for (let i = 0; i < 5; i++) {
      const before = wallet.snapshot, cost = upgradeCost(i);
      assert.equal(wallet.buy(id), true);
      for (const resource of RESOURCES) assert.equal(wallet.snapshot.wallet[resource.id], before.wallet[resource.id] - cost[resource.id]);
    }
    const before = wallet.snapshot;
    assert.equal(wallet.buy(id), false); assert.deepEqual(wallet.snapshot, before);
  }
  assert.equal(wallet.snapshot.wallet.token, 7);
});
test('insufficient resources and unknown upgrades never mutate profile', () => {
  const wallet = new Wallet(new LocalProfileStorage(memory())), before = wallet.snapshot;
  assert.equal(wallet.buy('power'), false); assert.equal(wallet.buy('unknown'), false);
  assert.deepEqual(wallet.snapshot, before);
});
test('purchased levels and balances survive a new storage/service instance', () => {
  const wallet = funded(); wallet.buy('power'); wallet.buy('health');
  const reloaded = new Wallet(wallet.storage);
  assert.deepEqual(reloaded.snapshot, wallet.snapshot);
  assert.equal(reloaded.snapshot.levels.power, 1);
});
test('profile rejects foreign resources, invalid values, old schemas and clamps caps', () => {
  const profile = sanitizeProfile({ version: 1, wallet: { coal: -1, iron: 4.5, diamond: 2, token: 99999999, gold: 90 }, levels: { power: 99, health: '5' } });
  assert.deepEqual(profile.wallet, { coal: 0, iron: 0, diamond: 2, token: 999999 });
  assert.equal(profile.levels.power, 5); assert.equal(profile.levels.health, 0);
  assert.deepEqual(sanitizeProfile({ version: 2 }), emptyProfile());
});
test('corrupt or unavailable storage degrades to memory without breaking rewards/purchases', () => {
  const corrupt = new LocalProfileStorage({ getItem: () => '{', setItem: () => { throw Error('quota'); } });
  const wallet = new Wallet(corrupt);
  wallet.claim(terminal(5, 'won'), () => .99);
  assert.equal(wallet.buy('power'), true);
  assert.equal(wallet.saved, false);
  assert.equal(wallet.snapshot.wallet.coal, 64);
});
test('permanent bonuses apply once at next run start, no live mutation', () => {
  const wallet = funded(), current = new Run(Math.random, wallet.snapshot.levels);
  wallet.buy('power'); wallet.buy('health'); wallet.buy('mechanics'); wallet.buy('mobility');
  assert.equal(current.player.hp, PLAYER.health); assert.equal(current.weapon.interval, GAMIN.cooldown);
  const next = new Run(Math.random, wallet.snapshot.levels);
  assert.equal(next.player.hp, PLAYER.health * 1.05);
  assert.equal(next.player.maxHealth, next.player.hp);
  assert.equal(next.player.speed, PLAYER.speed * 1.05);
  assert.equal(next.weapon.interval, GAMIN.cooldown * .95);
  assert.equal(next.projectiles.damageMultiplier, 1.05);
  assert.deepEqual(next.upgradeRanks, {});
});
test('power increases real pellet damage while existing close-range perk still stacks', () => {
  const damage = (power, closeBonus) => {
    const run = new Run(Math.random, { power });
    const enemy = new Enemy(1, 250, 414); enemy.warmup = 0;
    run.projectiles.fire(241, 414, 0, closeBonus);
    run.projectiles.update(.01, [enemy], [], run.player);
    return enemy.maxHealth - enemy.hp;
  };
  assert.ok(Math.abs(damage(1, 0) / damage(0, 0) - 1.05) < 1e-10);
  assert.ok(Math.abs(damage(1, .35) / damage(1, 0) - 1.35) < 1e-10);
});
test('perks remain stronger and apply normally on the permanent base', () => {
  const run = new Run(Math.random, { health: 1, mechanics: 1, mobility: 1 });
  UPGRADES.find(item => item.id === 'boots').apply(run);
  UPGRADES.find(item => item.id === 'plates').apply(run);
  UPGRADES.find(item => item.id === 'trigger').apply(run);
  run.player.boostSeconds=1.5;assert.equal(run.player.effectiveSpeed, PLAYER.speed * 1.05 * 1.3);
  assert.equal(run.player.maxHealth, PLAYER.health * 1.05);
  assert.equal(run.weapon.interval, GAMIN.cooldown * .95 * .75);
});
test('all permanent bonuses are modest and bounded at maximum rank', () => {
  const levels = Object.fromEntries(Object.keys(emptyLevels()).map(id => [id, 99]));
  const run = new Run(Math.random, levels);
  assert.equal(run.player.hp, 6.25); assert.equal(run.projectiles.damageMultiplier, 1.25);
  assert.equal(run.weapon.interval, GAMIN.cooldown * .75);
  assert.equal(run.player.speed, PLAYER.speed * 1.25);
});

test('full combat victory feeds wallet, purchase and next run with reset perks', () => {
 const UpgradeFlow=LegacyFlow;
  let seed = 1; // V0.15 real-combat regression seed, no healing or stat override.
  const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const wallet = new Wallet(new LocalProfileStorage(memory()));
  const run = new LegacyRun(rng, wallet.snapshot.levels), flow = new UpgradeFlow(run, rng);
  const choose = () => flow.choose(['double-cannon','buckshot','trigger','boots','double','plates','grisou','sawn'].find(id => flow.offered.some(card => card.id === id)));
  flow.open(); choose();
  for (let i = 0; i < 36000 && run.status === 'playing'; i++) { run.update(1 / 60, steer(run)); if (flow.afterCombat()) choose(); }
  assert.equal(run.status, 'won'); assert.equal(run.completedWaves, 20);
  const gains = wallet.claim(run, () => .99);
  assert.equal(gains.coal, 94); assert.equal(wallet.buy('power'), true);
  const next = new Run(rng, wallet.snapshot.levels);
  assert.equal(next.projectiles.damageMultiplier, 1.05);
  assert.deepEqual(next.upgradeRanks, {}); assert.equal(next.waveNumber, 1);
  assert.equal(wallet.snapshot.wallet.coal, 64);
});
