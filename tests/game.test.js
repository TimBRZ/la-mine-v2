import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { Player } from '../src/player.js';
import { Enemy } from '../src/enemy.js';
import { Gamin, nearestTarget } from '../src/weapon.js';
import { Projectiles, pelletDamage } from '../src/combat.js';
import { Run } from '../src/run.js';
import { MovementInput } from '../src/input.js';
import { segmentCircle, stickVector } from '../src/math.js';
import { GAMIN, ENEMY, ROOM, PLAYER } from '../src/config.js';
import { steer, collectFixtureLoot } from './run-helpers.js';

function activeEnemy(id, x, y) { const enemy = new Enemy(id, x, y); enemy.warmup = 0; return enemy; }
const idle = { x: 0, y: 0 };

test('player accelerates promptly, brakes, and never exceeds speed diagonally', () => {
  const p = new Player();
  for (let i = 0; i < 12; i++) p.update(1 / 60, { x: 1, y: 1 });
  assert.ok(Math.abs(Math.hypot(p.vx, p.vy) - PLAYER.speed) < .001);
  const start = p.x;
  for (let i = 0; i < 10; i++) p.update(1 / 60, idle);
  assert.equal(p.vx, 0); assert.equal(p.vy, 0);
  assert.ok(p.x > start && p.x - start < 15);
});

test('all four closed room boundaries contain the complete player body', () => {
  for (const input of [{ x: -1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }]) {
    const p = new Player();
    for (let i = 0; i < 600; i++) p.update(1 / 60, input);
    assert.ok(p.x >= ROOM.left + p.radius && p.x <= ROOM.right - p.radius);
    assert.ok(p.y >= ROOM.top + p.radius && p.y <= ROOM.bottom - p.radius);
  }
});

test('joystick has a deadzone, proportional movement and a bounded diagonal magnitude', () => {
  assert.deepEqual(stickVector(2, 3), idle);
  assert.ok(stickVector(22, 0).x > 0 && stickVector(22, 0).x < 1);
  const vector = stickVector(500, -500);
  assert.ok(Math.abs(Math.hypot(vector.x, vector.y) - 1) < 1e-12);
  assert.ok(vector.x > 0 && vector.y < 0);
});

function inputHarness() {
  const input = new EventEmitter();
  const keys = Object.fromEntries('W,A,S,D,Z,Q,UP,DOWN,LEFT,RIGHT'.split(',').map(k => [k, { isDown: false }]));
  input.keyboard = { addKeys: () => keys, resetKeys: () => { for (const k of Object.values(keys)) k.isDown = false; } };
  const circle = () => ({ setStrokeStyle() { return this; }, setDepth() { return this; }, setPosition() { return this; },
    setRadius() { return this; }, setAlpha() { return this; }, setFillStyle() { return this; } });
  const canvas = new EventTarget();
  const movement = new MovementInput({ input, add: { circle }, game: { canvas } }, () => true);
  return { input, keys, canvas, movement };
}

test('WASD, ZQSD and arrow key states all control the actual input module', () => {
  const { keys, movement } = inputHarness();
  for (const [key, expected] of [['W', [0, -1]], ['Z', [0, -1]], ['UP', [0, -1]], ['A', [-1, 0]],
    ['Q', [-1, 0]], ['LEFT', [-1, 0]], ['S', [0, 1]], ['DOWN', [0, 1]], ['D', [1, 0]], ['RIGHT', [1, 0]]]) {
    keys[key].isDown = true;
    assert.deepEqual(Object.values(movement.read()), expected);
    keys[key].isDown = false;
  }
  movement.destroy();
});

test('touch joystick owns one pointer, handles release outside and touch cancellation', () => {
  const { input, movement, canvas } = inputHarness();
  input.emit('pointerdown', { id: 1, x: 220, y: 700 });
  input.emit('pointermove', { id: 1, x: 264, y: 700 });
  assert.deepEqual(movement.read(), { x: 1, y: 0 });
  input.emit('pointerdown', { id: 2, x: 80, y: 400 });
  input.emit('pointermove', { id: 2, x: 20, y: 400 });
  input.emit('pointerup', { id: 2 });
  assert.deepEqual(movement.read(), { x: 1, y: 0 });
  input.emit('pointerupoutside', { id: 1 });
  assert.deepEqual(movement.read(), idle);
  input.emit('pointerdown', { id: 3, x: 200, y: 500 });
  input.emit('pointermove', { id: 3, x: 200, y: 430 });
  assert.equal(movement.read().y, -1);
  canvas.dispatchEvent(new Event('touchcancel'));
  assert.deepEqual(movement.read(), idle);
  movement.destroy();
  assert.equal(input.listenerCount('pointerdown'), 0);
});

test('HUD touches do not move the player and focus loss can clear every held input', () => {
  const { input, movement, keys } = inputHarness();
  input.emit('pointerdown', { id: 1, x: 100, y: 30 });
  input.emit('pointermove', { id: 1, x: 200, y: 30 });
  assert.deepEqual(movement.read(), idle);
  keys.D.isDown = true;
  movement.clear();
  assert.deepEqual(movement.read(), idle);
  movement.destroy();
});

test('auto targeting selects the nearest alive, active enemy within short range', () => {
  const p = new Player();
  const near = activeEnemy(1, p.x + 90, p.y), far = activeEnemy(2, p.x + 170, p.y);
  const spawning = new Enemy(3, p.x + 25, p.y), dead = activeEnemy(4, p.x + 20, p.y);
  dead.hp = 0;
  assert.equal(nearestTarget(p, [far, spawning, dead, near]), near);
  assert.equal(nearestTarget(p, [spawning, dead, activeEnemy(5, p.x + 220, p.y)]), null);
});

test('one automatic shotgun discharge produces seven separate symmetric pellet angles', () => {
  const p = new Player(), weapon = new Gamin(), bullets = new Projectiles(), events = [];
  weapon.update(1 / 60, p, [activeEnemy(1, p.x, p.y - 120)], bullets, events);
  const live = bullets.pool.filter(p => p.active);
  assert.equal(live.length, 7);
  assert.equal(new Set(live.map(p => p.angle)).size, 7);
  assert.ok(Math.abs(live.at(-1).angle - live[0].angle - GAMIN.spread) < 1e-10);
  assert.equal(events[0].type, 'shot');
  assert.ok(weapon.flash > 0 && weapon.recoil > 0);
});

test('shotgun cooldown stays slow and never fires at a nonexistent target', () => {
  const p = new Player(), weapon = new Gamin(), bullets = new Projectiles(), events = [];
  weapon.update(.01, p, [], bullets, events);
  assert.equal(events.length, 0);
  const target = activeEnemy(1, p.x + 100, p.y);
  for (let i = 0; i < 120; i++) weapon.update(1 / 60, p, [target], bullets, events);
  assert.equal(events.filter(e => e.type === 'shot').length, 3);
});

test('swept collision hits crossed circles at low frame rates, not only end positions', () => {
  assert.ok(segmentCircle(0, 0, 100, 0, 50, 0, 10) === .4);
  assert.equal(segmentCircle(0, 0, 100, 0, 50, 40, 10), null);
  const bullets = new Projectiles(), target = activeEnemy(1, 100, 300), events = [];
  bullets.fire(50, 300, 0);
  bullets.update(.12, [target], events);
  assert.ok(target.hp < ENEMY.health);
  assert.equal(events.length, 1);
  assert.equal(bullets.pool.filter(p => p.active).length, 0);
});

test('one pellet stops at the first target even if the enemy list is reversed', () => {
  const bullets = new Projectiles(), near = activeEnemy(1, 100, 300), far = activeEnemy(2, 160, 300);
  bullets.fire(50, 300, 0);
  bullets.update(.2, [far, near], []);
  assert.ok(near.hp < ENEMY.health);
  assert.equal(far.hp, ENEMY.health);
});

test('close shots cause more damage, react with knockback, and can kill in one discharge', () => {
  assert.ok(pelletDamage(20) > pelletDamage(170));
  const fireAt = distance => {
    const p = new Player(), weapon = new Gamin(), bullets = new Projectiles(), events = [];
    const target = activeEnemy(1, p.x, p.y - distance);
    weapon.update(.01, p, [target], bullets, events);
    for (let i = 0; i < 30; i++) bullets.update(1 / 120, [target], events);
    return { target, events };
  };
  const close = fireAt(45), distant = fireAt(175);
  assert.equal(close.target.hp, 0);
  assert.ok(distant.target.hp > 0 && distant.target.hp < ENEMY.health);
  assert.ok(close.target.pushY < 0);
  assert.equal(close.events.filter(e => e.type === 'kill').length, 1);
});

test('pellets expire at short range, cannot hit remote targets, and reuse a bounded pool', () => {
  const bullets = new Projectiles(), target = activeEnemy(1, 350, 300);
  const storage = bullets.pool;
  for (let i = 0; i < 300; i++) { bullets.fire(80, 300, 0); bullets.update(.04, [target], []); }
  for (let i = 0; i < 8; i++) bullets.update(.04, [target], []);
  assert.equal(target.hp, ENEMY.health);
  assert.equal(bullets.pool, storage); assert.equal(storage.length, 84);
  assert.ok(storage.every(p => !p.active));
});

test('enemies telegraph before pursuing and remain inside the same fixed room', () => {
  const p = new Player(), enemy = new Enemy(1, 70, 160);
  enemy.update(.2, p);
  assert.equal(enemy.x, 70);
  const before = Math.hypot(enemy.x - p.x, enemy.y - p.y);
  for (let i = 0; i < 60; i++) enemy.update(1 / 60, p);
  assert.ok(Math.hypot(enemy.x - p.x, enemy.y - p.y) < before);
  assert.ok(enemy.x >= ROOM.left + enemy.radius);
});

test('contact damages the player once per invulnerability interval, never once per pellet or enemy', () => {
  const r = new Run();
  r.untilSpawn = 100;
  r.weapon.cooldown = 100;
  r.enemies = [activeEnemy(1, 225, 414), activeEnemy(2, 225, 414)];
  r.update(.01, idle);
  assert.equal(r.player.hp, PLAYER.health - 1);
  r.update(.01, idle);
  assert.equal(r.player.hp, PLAYER.health - 1);
  r.player.invulnerable = 0;
  r.enemies[0].x = r.player.x; r.enemies[0].y = r.player.y;
  r.update(.01, idle);
  assert.equal(r.player.hp, PLAYER.health - 2);
});

test('spawn anchors are safely distant and simultaneous enemies are capped', () => {
  const r = new Run();
  r.spawn();
  assert.ok(Math.hypot(r.enemies[0].x - r.player.x, r.enemies[0].y - r.player.y) > 180);
  for (let i = 0; i < 6000 && r.status === 'playing'; i++) {
    r.update(1 / 60, idle);
    assert.ok(r.enemies.length <= ENEMY.maxAlive);
    assert.ok(r.spawned <= r.wave.total);
  }
});

test('warm-up wave clears before automatic progression', () => {
  for (const moving of [false, true]) {
    const run = new Run();
    for (let i = 0; i < 7200 && run.wavePhase === 'combat' && run.status === 'playing'; i++) run.update(1/60, moving ? steer(run) : idle);
    assert.equal(run.status, 'playing');
    collectFixtureLoot(run);
    assert.equal(run.wavePhase, 'cleared');
    assert.equal(run.kills, 6);
    assert.equal(run.waveNumber, 1);
    run.update(0); assert.equal(run.waveNumber, 2);
    assert.ok(run.player.hp > 0);
  }
});
test('a finished run is inert and replay starts clean with no persistent progression', () => {
  const r = new Run(); r.status = 'lost'; r.player.hp = 0;
  const before = JSON.stringify(r);
  assert.deepEqual(r.update(.03, { x: 1, y: 1 }), []);
  assert.equal(JSON.stringify(r), before);
  const replay = new Run();
  assert.equal(replay.player.hp, PLAYER.health); assert.equal(replay.kills, 0);
  assert.equal(replay.spawned, 0); assert.equal(replay.weapon.cooldown, 0);
  assert.ok(replay.projectiles.pool.every(p => !p.active));
});

test('a long frame is bounded rather than simulating a whole second of contact damage', () => {
  const r = new Run();
  r.update(5, { x: 1, y: 0 });
  assert.equal(r.elapsed, .04);
  assert.ok(r.player.x - 225 < 10);
});
