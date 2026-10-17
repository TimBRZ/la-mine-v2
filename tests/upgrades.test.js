import { steer as shortRangeStressPilot } from './v013-run-helpers-backup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { Run } from '../src/run.js';
import { Enemy } from '../src/enemy.js';
import { Projectiles, CLOSE_RANGE } from '../src/combat.js';
import { UpgradeFlow, UPGRADES, drawUpgrades } from '../src/upgrades.js';
import { resolveExplosions, GRISOU } from '../src/explosions.js';
import { RavensDialogue, PHRASES } from '../src/ravens.js';
import { GAMIN, PLAYER } from '../src/config.js';
import { steer } from './run-helpers.js';

function random(seed) { return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296); }
function flowFor(run, id) {
  for (let seed = 1; seed < 1000; seed++) {
    if (drawUpgrades(run, random(seed)).some(item => item.id === id)) return new UpgradeFlow(run, random(seed));
  }
  throw new Error('No valid offer for ' + id);
}
function select(run, id) { const flow = flowFor(run, id); assert.equal(flow.open(), true); assert.equal(flow.choose(id), true); return flow; }
function active(id, x, y, hp = 42) { const enemy = new Enemy(id, x, y); enemy.warmup = 0; enemy.hp = hp; return enemy; }

test('choice freezes every combat timer, projectile, spawn and damage, then resumes', () => {
  const run = new Run(), flow = flowFor(run, 'boots');
  run.enemies = [active(1, run.player.x, run.player.y)];
  run.projectiles.fire(225, 300, 0); run.player.vx = 10;
  assert.equal(flow.open(), true); assert.equal(flow.open(), false);
  const before = JSON.stringify(run);
  for (let i = 0; i < 300; i++) assert.deepEqual(run.update(.04, { x: 1, y: 1 }), []);
  assert.equal(JSON.stringify(run), before);
  assert.equal(flow.choose('boots'), true);
  run.update(.04, { x: 1, y: 0 });
  assert.ok(run.elapsed > 0); assert.ok(run.player.x > 225);
});

test('all sixteen perks are offered and selectable through the actual flow', () => {
  assert.equal(UPGRADES.length, 16);
  for (const upgrade of UPGRADES) {
    const run = new Run(Math.random,{}, {weaponId:['magazine','heat','piercing'].includes(upgrade.id)?'smg':upgrade.category==='GRISOU X'?'grisoux':'shotgun'});
    if(upgrade.requires)select(run,upgrade.requires);
    const flow = select(run, upgrade.id);
    assert.equal(run.upgradeRanks[upgrade.id], 1);
    assert.equal(flow.count, 1); assert.equal(run.paused, false);
    run.update(.01); assert.ok(run.elapsed > 0);
  }
});

test('1000 seeded offers have three distinct cards and three categories when available', () => {
  const seen = new Set(), combinations = new Set();
  for (let seed = 1; seed <= 1000; seed++) {
    const cards = drawUpgrades(new Run(), random(seed));
    assert.equal(cards.length, 3);
    assert.equal(new Set(cards.map(c => c.id)).size, 3);
    assert.equal(new Set(cards.map(c => c.category)).size, 3);
    cards.forEach(c => seen.add(c.id));
    combinations.add(cards.map(c => c.id).sort().join(','));
  }
  assert.equal(seen.size, 7); assert.ok(combinations.size > 10);
});

test('unoffered/unknown cards cannot be selected; a double click applies once', () => {
  const run = new Run(), flow = flowFor(run, 'buckshot');
  assert.equal(flow.choose('buckshot'), false);
  flow.open();
  const missing = UPGRADES.find(item => !flow.offered.some(card => card.id === item.id));
  assert.equal(flow.choose(missing.id), false); assert.equal(flow.choose('unknown'), false);
  assert.equal(run.paused, true);
  assert.equal(flow.choose('buckshot'), true); assert.equal(flow.choose('buckshot'), false);
  assert.equal(run.weapon.pellets, 11); assert.deepEqual(flow.history, ['buckshot']);
});

test('original six perks still affect actual projectile count, speed and cooldown', () => {
  const run = new Run();
  select(run, 'buckshot'); select(run, 'boots'); select(run, 'trigger');
  run.weapon.update(.01, run.player, [active(1, 250, 414)], run.projectiles, []);
  assert.equal(run.projectiles.pool.filter(p => p.active).length, 11);
  assert.equal(run.weapon.cooldown, GAMIN.cooldown / .8 * .75);
  for (let i = 0; i < 15; i++) run.player.update(.016, { x: 1, y: 0 });
  assert.ok(run.player.vx > PLAYER.speed);
});

test('Grisou explodes only on the sixth death and damages nearby active enemies only', () => {
  for (const [kills, expected] of [[5, true], [4, false]]) {
    const enemies = [active(2, 210, 300), active(3, 390, 300), new Enemy(4, 210, 300)];
    const events = [{ type: 'kill', id: 1, x: 200, y: 300 }];
    let calls = 0;
    resolveExplosions(events, enemies, {enabled:true,kills}, () => { calls++; });
    assert.equal(calls, 0);
    assert.equal(events.some(e => e.type === 'explosion'), expected);
    assert.equal(enemies[0].hp, expected ? 42 - GRISOU.damage : 42);
    assert.equal(enemies[1].hp, 42); assert.equal(enemies[2].hp, 42);
  }
});

test('chain explosions terminate, process each death once and do not touch player HP', () => {
  const run = new Run(() => 0);
  select(run, 'grisou'); run.grisou.kills=5;
  run.player.x = 200; run.player.y = 300;
  run.enemies = [active(1, 200, 300, 1), active(2, 260, 300, 20), active(3, 265, 300, 20)];
  run.weapon.cooldown = 999;
  run.projectiles.fire(200, 300, 0);
  const events = run.update(0);
  assert.equal(run.kills, 3); assert.equal(run.enemies.length, 0);
  assert.equal(events.filter(e => e.type === 'explosion').length, 1);
  assert.equal(new Set(events.filter(e => e.type === 'kill').map(e => e.id)).size, 3);
  assert.equal(run.player.hp, 5);
});

test('an unselected Grisou never rolls or explodes', () => {
  const events = [{ type: 'kill', id: 1, x: 200, y: 300 }];
  resolveExplosions(events, [], 0, () => { throw new Error('Unexpected RNG'); });
  assert.equal(events.length, 1);
});

function damageAt(playerDistance, bonus) {
  const pool = new Projectiles(), enemy = active(1, 220, 300);
  pool.fire(210, 300, 0, bonus);
  pool.update(.01, [enemy], [], { x: enemy.x - playerDistance, y: enemy.y });
  return 42 - enemy.hp;
}
test('Canon scie adds exactly 60% only at real player-target distance <=70 at impact', () => {
  const base = damageAt(50, 0);
  assert.ok(Math.abs(damageAt(50, .6) - base * 1.6) < 1e-10);
  assert.ok(Math.abs(damageAt(CLOSE_RANGE, .6) - base * 1.6) < 1e-10);
  assert.equal(damageAt(CLOSE_RANGE + .01, .6), base);
  // Same pellet origin and path, different current player location.
  assert.equal(damageAt(200, .6), base);
});

test('Double detente rolls once and fires two identical nonrecursive spread volleys', () => {
  for (const [roll, count] of [[.299, 14], [.3, 7]]) {
    const run = new Run(); select(run, 'double');
    let calls = 0; const events = [], angles = [];
    const projectiles = { fire: (_x, _y, angle) => angles.push(angle) };
    const rng = () => { calls++; return roll; };
    run.weapon.update(.01, run.player, [active(1, 250, 414)], projectiles, events, rng);
    assert.equal(angles.length, count); assert.equal(calls, 1);
    if (count === 14) assert.deepEqual(angles.slice(0, 7), angles.slice(7));
    assert.equal(events.filter(e => e.extra).length, count === 14 ? 1 : 0);
    run.weapon.update(.01, run.player, [active(1, 250, 414)], projectiles, events, rng);
    assert.equal(calls, 1); assert.equal(angles.length, count);
  }
});

test('Plaques grants protection without changing HP, including fractional or zero health', () => {
  for (const hp of [5, 2.5, .3, 0]) {
    const run = new Run(); run.player.hp = hp;
    select(run, 'plates');
    assert.equal(run.player.maxHealth, 5);
    assert.ok(Math.abs(run.player.hp / run.player.maxHealth - hp / 5) < 1e-10);
  }
});

test('every perk stops at its cap; capped cards disappear; exhausted pool cannot pause', () => {
  const run = new Run();
  for (const perk of UPGRADES.filter(p=>run.weapon.definition.perks.includes(p.id))) {
    for (let rank = 0; rank < perk.maxRanks; rank++) select(run, perk.id);
    assert.equal(drawUpgrades(run, random(1)).some(c => c.id === perk.id), false);
  }
  assert.equal(run.weapon.pellets, 15);
  assert.ok(run.player.speed < 323);
  assert.ok(run.weapon.interval > .39);
  assert.equal(run.weapon.doubleChance, .6); assert.equal(run.grisou.enabled, true);
  assert.ok(run.weapon.closeBonus <= 1.2);
  assert.ok(run.player.maxHealth < 10.369);
  assert.equal(new UpgradeFlow(run).open(), false);
  assert.equal(run.paused, false);
});

test('fallback still offers distinct cards when only shotgun upgrades remain', () => {
  const run = new Run();
  for (const item of UPGRADES) if (item.category !== 'FUSIL À POMPE') run.upgradeRanks[item.id] = item.maxRanks;
  const cards = drawUpgrades(run, random(8));
  assert.equal(cards.length, 3); assert.equal(new Set(cards.map(c => c.id)).size, 3);
});

test('double stacks display the total chance and reliable Grisou does not stack', () => {
  const run = new Run(); select(run, 'grisou'); select(run, 'double');
  assert.equal(drawUpgrades(run).some(c=>c.id==='grisou'),false);
  for (const id of ['double']) {
    const flow = flowFor(run, id); flow.open();
    assert.ok(flow.offered.find(c => c.id === id).stat.startsWith('60 %'));
    flow.choose(id);
  }
});

test('wave choice fires once and never interrupts an ended run', () => {
  const run = new Run(), flow = new UpgradeFlow(run);
  run.kills = 11; assert.equal(flow.afterCombat(), false);
  run.waveIndex = 1; run.wavePhase = 'cleared'; run.choicePending = true;
  assert.equal(flow.afterCombat(), true);
  flow.choose(flow.offered[0].id);
  assert.equal(flow.afterCombat(), false);
  for (const status of ['won', 'lost']) {
    const ended = new Run(); ended.kills = 24; ended.status = status;
    assert.equal(new UpgradeFlow(ended).afterCombat(), false);
  }
});

test('replay resets all perks, HP limits and probabilities', () => {
  const previous = new Run(); for (const perk of UPGRADES.filter(p=>previous.weapon.definition.perks.includes(p.id))) select(previous, perk.id);
  const fresh = new Run();
  assert.deepEqual(fresh.upgradeRanks, {});
  assert.equal(fresh.weapon.pellets, 7); assert.equal(fresh.weapon.interval, GAMIN.cooldown);
  assert.equal(fresh.player.speed, PLAYER.speed); assert.equal(fresh.player.maxHealth, 5);
  assert.equal(fresh.weapon.doubleChance, 0); assert.equal(fresh.weapon.closeBonus, 0);
  assert.equal(fresh.grisou.enabled, false);
});

test('maximum build remains bounded during a full simulated run', () => {
  const run = new Run(() => 0);
  for (const perk of UPGRADES.filter(p=>run.weapon.definition.perks.includes(p.id))) for (let rank = 0; rank < perk.maxRanks; rank++) select(run, perk.id);
  const flow = new UpgradeFlow(run);
  for (let i = 0; i < 36000 && run.status === 'playing'; i++) {
    // Retain the original closer-range pilot for the stacked Canon scie stress fixture.
    const events = run.update(1/60, shortRangeStressPilot(run));
    if(flow.afterCombat())flow.choose(flow.offered[0].id); // only the guaranteed epic remains after normal caps
    assert.ok(run.enemies.length <= 12);
    assert.ok(events.filter(e => e.type === 'explosion').length <= 12);
    assert.ok(run.projectiles.pool.length === 84);
    assert.ok(Number.isFinite(run.player.hp));
  }
  assert.notEqual(run.status, 'playing');
});

test('Ravens retains contexts, fallback and no immediate repeated phrase', () => {
  const dialogue = new RavensDialogue(() => 0);
  for (const context of ['general','shotgun','explosions','mobility','boss','token','death','victory','survival','close','cadence']) {
    const a = dialogue.phrase(context), b = dialogue.phrase(context);
    assert.ok(PHRASES[context].includes(a)); assert.notEqual(a, b);
  }
  assert.ok(PHRASES.general.includes(dialogue.phrase('unknown')));
});

test('Ravens appearance frequency remains unchanged', () => {
  const absent = new RavensDialogue(() => .9);
  assert.equal(absent.appears(), false);
  assert.equal(absent.appears({ first: true }), true);
  assert.equal(absent.appears({ important: true }), true);
  for (const context of ['boss', 'token', 'death', 'victory']) assert.equal(absent.appears({ context }), true);
  assert.equal(new RavensDialogue(() => .1).appears(), true);
});
