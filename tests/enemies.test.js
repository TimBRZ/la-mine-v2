import {UpgradeFlow as LegacyFlow} from './v021-final-src-snapshot/upgrades.js';
// Exact historical replay keeps its original hostile shots; other tests use live Run.
import {Run as LegacyRun} from './legacy-volley-run.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_TYPES, createEnemy } from '../src/enemies/registry.js';
import { RAT, MINER, DRILL, DRILL_BOLT } from '../src/enemies/stats.js';
import { EnemyProjectiles } from '../src/enemy-projectiles.js';
import { Player } from '../src/player.js';
import { resolveExplosions } from '../src/explosions.js';
import { Projectiles } from '../src/combat.js';
import { RoomLoot } from '../src/wave-loot.js';
import { Run } from '../src/run.js';
import { StationaryFire } from '../src/stationary-fire.js';
import { readFileSync } from 'node:fs';
import { WAVES } from '../src/waves.js';
import { Haveuse, HAVEUSE } from '../src/boss.js';
import { UPGRADES, UpgradeFlow } from '../src/upgrades.js';
import { enterFixtureRoom, steer } from './run-helpers.js';
const active = (kind, id = 1, x = 150, y = 300) => { const e = createEnemy(kind, id, x, y); e.warmup = 0; return e; };

test('stationary firing is official even with obsolete A option; gameplay exposes no A/B UI', () => {
  const run = new Run(Math.random, {}, { fireMode: 'A' });
  assert.ok(run.fireControl instanceof StationaryFire);
  run.untilSpawn = 999; run.enemies = [active('miner', 1, 300, 414)];
  for (let i = 0; i < 10; i++) assert.ok(!run.update(.02, { x: 1, y: 0 }).some(e => e.type === 'shot'));
  const source = readFileSync(new URL('../src/room-scene.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /PrototypeFireToggle|fireToggle|fireMode/);
});
test('three original enemies remain registered: rat is smaller, faster and weaker than the miner', () => {
  assert.deepEqual(Object.keys(ENEMY_TYPES).filter(id=>!['stoker','riveter','scorifier','lampist','blaster','blackmaw','wagon','draisine','deepdriller','surveyor','gasminer','crawler','spitter','burster'].includes(id)), ['rat', 'miner', 'drill']);
  assert.ok(RAT.speed > MINER.speed * 2 && RAT.health < MINER.health / 3);
  assert.ok(RAT.radius < MINER.radius && RAT.contactDamage < MINER.contactDamage);
  assert.equal(new Set(['rat','miner','drill'].map(id => ENEMY_TYPES[id].texture)).size, 3);
  assert.throws(() => createEnemy('other', 1, 0, 0));
});
test('rat and miner pursue directly at their separate speeds, respecting spawn telegraph', () => {
  for (const kind of ['rat', 'miner']) {
    const e = createEnemy(kind, 1, 150, 300), p = { x: 350, y: 300 };
    e.update(.1, p); assert.equal(e.x, 150);
    e.warmup = 0; e.update(.1, p);
    assert.equal(e.x, 150 + ENEMY_TYPES[kind].stats.speed * .1); assert.equal(e.y, 300);
  }
});
test('drill approaches from far away, retreats nearby and holds its firing distance', () => {
  for (const [distance, direction] of [[200, 1], [60, -1], [140, 0]]) {
    const e = active('drill'); e.cooldown = 999;
    e.update(.1, { x: e.x + distance, y: e.y });
    assert.equal(Math.sign(e.x - 150), direction);
  }
});
test('drill emits a single fan on the ready tick, then retains recovery and cooldown after damage', () => {
 const e=active('drill'),attacks=[],p={x:300,y:300};e.cooldown=0;e.update(.01,p,attacks);
 assert.equal(e.phase,'recovery');assert.equal(attacks.length,1);assert.equal(attacks[0].fan,true);
 assert.equal(attacks[0].angle,Math.atan2(p.y-e.y,p.x-e.x));const shot=structuredClone(attacks[0]);e.hit(1,1,80);
 for(let i=0;i<30;i++)e.update(.04,{x:300,y:450},attacks);
 assert.equal(attacks.length,1);assert.deepEqual(attacks[0],shot);assert.equal(e.phase,'positioning');assert.ok(e.cooldown>0);
});
test('dead drill never fires; projectile pool enforces one live bolt per owner and eight total', () => {
  const e = active('drill'); e.phase = 'warning'; e.phaseTime = .01; e.hp = 0;
  const attacks = []; e.update(.04, { x: 300, y: 300 }, attacks); assert.equal(attacks.length, 0);
  const bolts = new EnemyProjectiles(); assert.equal(bolts.fire(e, 0), false);
  for (let id = 1; id <= 8; id++) {
    const owner = active('drill', id); assert.equal(bolts.fire(owner, 0), true); assert.equal(bolts.fire(owner, 0), false);
  }
  assert.equal(bolts.fire(active('drill', 9), 0), false); assert.equal(bolts.pool.length, 8);
  bolts.clear(); assert.ok(bolts.pool.every(b => !b.active));
});
test('slow drill bolt hits a stationary player but a mobile lateral dodge avoids it', () => {
  assert.ok(DRILL_BOLT.speed < new Player().speed);
  for (const dodge of [false, true]) {
    const p = new Player(); p.x = 310; p.y = 300;
    const bolts = new EnemyProjectiles(); bolts.fire(active('drill'), 0);
    let hits = 0;
    for (let i = 0; i < 100; i++) {
      const previous = { x: p.x, y: p.y };
      p.update(.02, { x: 0, y: dodge ? 1 : 0 });
      bolts.update(.02, p, previous, () => hits++);
    }
    assert.equal(hits, dodge ? 0 : 1);
  }
});
test('hostile projectiles collide continuously, expire on walls/range and recycle slots', () => {
  const bolts = new EnemyProjectiles(), e = active('drill');
  bolts.fire(e, 0); const p = { x: 240, y: 300, radius: 13 }; let hits = 0;
  bolts.update(1, p, p, () => hits++); assert.equal(hits, 1);
  assert.equal(bolts.fire(e, 0), true);
  const far = { x: 100, y: 600, radius: 13 };
  bolts.update(5, far, far, () => { throw Error('Unexpected hit'); });
  assert.ok(bolts.pool.every(b => !b.active));
});
test('all three types take real shotgun damage, die once and produce the existing room drops', () => {
  for (const kind of Object.keys(ENEMY_TYPES)) {
    const e = active(kind), projectiles = new Projectiles(), loot = new RoomLoot(1, 6), events = [];
    e.hp = 1; projectiles.fire(e.x, e.y, 0); projectiles.update(0, [e], events, new Player());
    assert.equal(e.alive, false); assert.equal(events.filter(e => e.type === 'kill').length, 1);
    for (const event of events) if (event.type === 'kill') loot.onKill(event);
    assert.equal(loot.emitted.coal, 1); assert.equal(loot.activeCount, 1);
  }
});
test('Grisou damages and chains through each enemy type without changing its perk rules', () => {
  for (const kind of Object.keys(ENEMY_TYPES)) {
    const e = active(kind); e.hp = 20;
    const events = [{ type: 'kill', id: 99, x: e.x - 10, y: e.y }];
    resolveExplosions(events, [e], {enabled:true,kills:5});
    assert.equal(e.alive, false); assert.equal(events.filter(e => e.type === 'explosion').length, 1);
    assert.equal(events.filter(e => e.type === 'kill' && e.id === 1).length, 1);
  }
});
test('Canon scie uses real player distance for every type, not distance travelled by the pellet', () => {
  for (const kind of Object.keys(ENEMY_TYPES)) {
    const damage = distance => {
      const e = active(kind), pool = new Projectiles();
      pool.fire(e.x - 5, e.y, 0, .6); pool.update(0, [e], [], { x: e.x - distance, y: e.y });
      return e.maxHealth - e.hp;
    };
    assert.ok(Math.abs(damage(70) / damage(70.01) - 1.6) < 1e-10);
  }
});

test('fixed wave distribution introduces rats, then miners, then drills and mixes all three in wave 4', () => {
  const expected = [['rat'], ['rat','miner'], ['drill','rat','miner'], ['drill','rat','miner']];
  for (let index = 0; index < 4; index++) {
    assert.deepEqual([...new Set(WAVES[index].enemies)], expected[index]);
    assert.equal(WAVES[index].enemies.length, WAVES[index].total);
    assert.ok(WAVES[index].maxAlive <= 8);
  }
  assert.equal(WAVES[4].boss, true); assert.equal(WAVES[4].enemies.length, 0);
  assert.deepEqual(WAVES.slice(0,5).map(r => r.total), [6,8,9,10,1]);
});
test('actual spawning uses each wave ordered roster and honors the live cap', () => {
  for (let room = 1; room <= 4; room++) {
    const run = new Run(); enterFixtureRoom(run, room);
    const kinds = [];
    for (let i = 0; i < run.wave.total; i++) {
      run.enemies = [];
      assert.equal(run.spawn(), true); kinds.push(run.enemies[0].kind);
    }
    assert.deepEqual(kinds, run.wave.enemies); assert.equal(run.spawn(), false);
  }
});
test('contact damage distinguishes rat and miner and shares invulnerability with drill bolts', () => {
  for (const kind of Object.keys(ENEMY_TYPES)) {
    const run = new Run(); run.untilSpawn = 999;
    run.enemies = [active(kind, 1, run.player.x, run.player.y)];
    run.update(0);
    const expected = 5 - ENEMY_TYPES[kind].stats.contactDamage;
    assert.equal(run.player.hp, expected);
    run.damagePlayer(1, []); assert.equal(run.player.hp, expected);
    assert.equal(run.damageTaken, 5 - expected);
  }
});
test('pause freezes a live drill recovery and hostile projectile; resuming does not burst fire', () => {
  const run = new Run(); run.untilSpawn = 999;
  const e = active('drill', 1, 80, 200); e.cooldown = 0;
  run.player.x = 270; run.player.y = 200; run.enemies = [e]; run.weapon.cooldown = 999;
  const shot=run.update(.01); assert.equal(e.phase, 'recovery');assert.equal(shot.filter(e=>e.type==='enemy-shot').length,1);
  run.hostileProjectiles.fire(active('drill', 9, 80, 600), 0);
  run.paused = true; const before = JSON.stringify(run);
  for (let i = 0; i < 100; i++) run.update(.04);
  assert.equal(JSON.stringify(run), before);
  run.paused = false;
  assert.ok(!run.update(.04).some(e => e.type === 'enemy-shot'));
});
test('same-frame shotgun kill cancels the drill attack and final collection clears hostile bolts', () => {
  const run = new Run(); run.untilSpawn = 999; run.spawned = run.wave.total;
  const e = active('drill', 1, 100, 200); e.hp = 1; e.phase = 'warning'; e.phaseTime = 0;
  run.enemies = [e]; run.projectiles.fire(e.x, e.y, 0);
  run.hostileProjectiles.fire(active('drill', 9, 60, 500), 0);
  const events = run.update(0);
  assert.equal(events.filter(e => e.type === 'enemy-shot').length, 0);
  assert.equal(run.wavePhase, 'collecting'); assert.equal('exitOpen' in run, false);
  assert.ok(run.hostileProjectiles.pool.every(p => !p.active));
});
test('death, replay and wave changes cannot retain hostile projectiles', () => {
  const run = new Run();
  run.hostileProjectiles.fire(active('drill'), 0); run.player.hp = 0; run.update(0);
  assert.equal(run.status, 'lost'); assert.ok(run.hostileProjectiles.pool.every(b => !b.active));
  const fresh = new Run(); assert.ok(fresh.hostileProjectiles.pool.every(b => !b.active));
  fresh.hostileProjectiles.fire(active('drill'), 0); enterFixtureRoom(fresh, 2);
  assert.ok(fresh.hostileProjectiles.pool.every(b => !b.active));
});
test('Haveuse retains its exact stats, solitary encounter and contact damage', () => {
  assert.deepEqual(HAVEUSE, { health:1215, radius:30, speed:60, chaseSeconds:1.7, warningSeconds:.9, chargeSeconds:.65, chargeSpeed:340, recoverySeconds:.7, damageTaken:.9, enrage:.8 });
  const run = new Run(); enterFixtureRoom(run, 5);
  assert.equal(run.enemies.length, 1); assert.ok(run.enemies[0] instanceof Haveuse);
  assert.equal(run.enemies[0].contactDamage, 1); assert.equal(run.spawn(), false);
  assert.ok(run.hostileProjectiles.pool.every(b => !b.active));
});
test('Bottes widens the escape speed gap against rats and Plaques preserves fractional tank damage ratio', () => {
  const run = new Run(), gap = run.player.speed - RAT.speed;
  UPGRADES.find(p => p.id === 'boots').apply(run);
  run.player.boostSeconds=1.5;assert.ok(run.player.effectiveSpeed - RAT.speed > gap);
  run.player.hurt(MINER.contactDamage); const ratio = run.player.hp / run.player.maxHealth;
  UPGRADES.find(p => p.id === 'plates').apply(run);
  assert.ok(Math.abs(run.player.hp / run.player.maxHealth - ratio) < 1e-12);
});
test('complete wave 4 and boss run uses all enemy types, bounded bolts, stationary shots and unchanged rewards', () => {
 const UpgradeFlow=LegacyFlow;
  let seed = 1; // V0.15 real-combat regression seed, no healing or stat override.
  const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const run = new LegacyRun(rng, {}, { rewardRandom: () => .99 }), flow = new UpgradeFlow(run, rng);
  const choose = () => flow.choose(['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn'].find(id => flow.offered.some(c => c.id === id)));
  flow.open(); choose();
  const seen = new Set(); let room4Kills = 0, enemyShots = 0, maxBolts = 0, mixed = false;
  for (let i = 0; i < 36000 && run.status === 'playing'; i++) {
    for (const e of run.enemies) seen.add(e.kind);
    if (run.waveNumber === 4 && new Set(run.enemies.map(e => e.kind)).size === 3) mixed = true;
    const input = steer(run), events = run.update(1/60, input);
    if (input.x || input.y || run.player.vx || run.player.vy) assert.ok(!events.some(e => e.type === 'shot'));
    if (run.waveNumber === 4) room4Kills += events.filter(e => e.type === 'kill').length;
    enemyShots += events.filter(e => e.type === 'enemy-shot').length;
    const bolts = run.hostileProjectiles.pool.filter(b => b.active).length;
    maxBolts = Math.max(maxBolts, bolts);
    assert.ok(bolts <= 8 && run.enemies.length <= 12 && run.loot.activeCount <= 20);
    if (flow.afterCombat()) choose();
  }
  assert.equal(run.status, 'won'); assert.deepEqual([...seen].sort(), ['boss','drill','miner','rat']);
  assert.equal(room4Kills, 10); assert.equal(mixed, true); assert.ok(enemyShots > 0 && maxBolts > 0);
  assert.equal(run.kills,235); assert.equal(flow.count,6);
  assert.deepEqual(run.collectedRewards, { coal:94, iron:8, diamond:0, token:0 });
  assert.ok(run.hostileProjectiles.pool.every(b => !b.active));
});

test('dense mixed combat remains finite and bounded with three simultaneous drill projectiles', () => {
  const run = new Run(); run.waveIndex = 3; run.spawned = 7; run.untilSpawn = 999;
  run.player.invulnerable = 999; run.weapon.cooldown = 999; // Isolated stress fixture, no altered production stats.
  run.enemies = ['rat','rat','miner','miner','drill','drill','drill'].map((kind,i) => active(kind,i+1,60+i*50,180));
  for (const e of run.enemies.filter(e => e.kind === 'drill')) run.hostileProjectiles.fire(e,Math.PI/2);
  assert.equal(run.hostileProjectiles.pool.filter(b => b.active).length, 3);
  for (let i = 0; i < 2400; i++) {
    run.update(1/60, {x:Math.sin(i/30),y:Math.cos(i/30)});
    assert.equal(run.hostileProjectiles.pool.length, 8);
    assert.equal(run.enemies.length, 7);
    assert.ok(run.enemies.every(e => Number.isFinite(e.x) && Number.isFinite(e.y)));
    assert.ok(run.hostileProjectiles.pool.filter(b => b.active).every(b => Number.isFinite(b.x) && Number.isFinite(b.y)));
  }
});
