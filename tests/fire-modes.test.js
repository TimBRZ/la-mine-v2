import test from 'node:test';
import assert from 'node:assert/strict';
import { Run } from '../src/run.js';
import { Enemy } from '../src/enemy.js';
import { Gamin } from '../src/weapon.js';
import { Projectiles } from '../src/combat.js';
import { UPGRADES } from '../src/upgrades.js';
import { LegacyFire } from './legacy-fire.js';

function fixture(mode) {
  const run = new Run(() => 0);
  if (mode === 'A') run.fireControl = new LegacyFire('A');
  run.untilSpawn = 999;
  const enemy = new Enemy(1, 340, 414);
  enemy.warmup = 0; enemy.hp = 100000;
  run.enemies.push(enemy);
  return run;
}
test('mode A matches the V0.4 weapon events and pellets while moving', () => {
  const run = fixture('A'), weapon = new Gamin(), projectiles = new Projectiles(), expected = [];
  run.player.update(.04, { x: 1, y: 0 });
  weapon.update(.04, run.player, run.enemies, projectiles, expected, () => 0);
  run.player.x = 225; run.player.vx = 0;
  const actual = run.update(.04, { x: 1, y: 0 }).filter(e => e.type === 'shot');
  assert.deepEqual(actual, expected);
  assert.equal(run.weapon.cooldown, weapon.cooldown);
  assert.deepEqual(run.projectiles.pool.filter(p => p.active).map(p => p.angle), projectiles.pool.filter(p => p.active).map(p => p.angle));
});
test('mode B blocks movement, braking and tiny input; resumes within 120 ms at base speed', () => {
  const run = fixture('B');
  for (let i = 0; i < 20; i++) assert.ok(!run.update(.01, { x: 1, y: 0 }).some(e => e.type === 'shot'));
  let firstShot = 0;
  for (let i = 1; i <= 12; i++) {
    const shots = run.update(.01).filter(e => e.type === 'shot');
    if (run.player.vx !== 0) assert.equal(shots.length, 0);
    if (shots.length && !firstShot) firstShot = i;
  }
  assert.ok(firstShot > 0 && firstShot <= 12);
  run.weapon.cooldown = 0;
  assert.ok(!run.update(.01, { x: .001, y: 0 }).some(e => e.type === 'shot'));
});
test('mode B never releases a queued shot on movement onset, wall input or rapid stop/start', () => {
  const run = fixture('B');
  for (let i = 0; i < 100; i++) {
    run.weapon.cooldown = 0;
    run.player.x = 409;
    const events = run.update(.02, { x: i % 2 ? 0 : 1, y: 0 });
    assert.ok(!events.some(e => e.type === 'shot'));
  }
});
test('mode B preserves cooldown; switching A/B cannot reset cadence or create an extra volley', () => {
  const run = fixture('A');
  assert.equal(run.update(.01).filter(e => e.type === 'shot').length, 1);
  const cooldown = run.weapon.cooldown;
  run.fireControl.setMode('B');
  for (let i = 0; i < 10; i++) assert.ok(!run.update(.01).some(e => e.type === 'shot'));
  assert.ok(run.weapon.cooldown < cooldown && run.weapon.cooldown > 0);
  run.fireControl.setMode('A');
  assert.ok(!run.update(.01).some(e => e.type === 'shot'));
});
test('all seven perks retain their effects in both firing modes, including the double volley', () => {
  const builds = [];
  for (const mode of ['A', 'B']) {
    const run = fixture(mode);
    for (const perk of UPGRADES.filter(p=>run.weapon.definition.perks.includes(p.id))) perk.apply(run);
    const events = [];
    for (let i = 0; i < 6; i++) events.push(...run.update(.02));
    assert.equal(events.filter(e => e.type === 'shot').length, 2);
    builds.push([run.weapon.pellets, run.weapon.interval, run.weapon.closeBonus, run.weapon.doubleChance, run.grisou.enabled, run.player.speed, run.player.maxHealth]);
  }
  assert.deepEqual(builds[0], builds[1]);
  assert.deepEqual(builds[0].slice(0, 5), [11, .9 / .8 * .75, .6, .3, true]);
});
