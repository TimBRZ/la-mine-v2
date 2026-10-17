import test from 'node:test';
import assert from 'node:assert/strict';
import { MenuState, ZONES, FUTURE_SECTIONS } from '../src/menu/state.js';
import { Run } from '../src/run.js';
import { Wallet } from '../src/wallet.js';
import { LocalProfileStorage } from '../src/local-profile-storage.js';
import { minerPortrait } from '../src/menu/character.js';

test('menu starts at home with shotgun; only galleries can launch and future sections cannot navigate', () => {
  const menu = new MenuState();
  assert.equal(menu.page, 'home'); assert.equal(menu.weaponId, 'shotgun');
  assert.equal(ZONES.length, 7); assert.equal(ZONES.filter(z => z.playable).length, 6);
  assert.equal(ZONES[0].name, 'LES GALERIES');
  for (const zone of ZONES.slice(1)) { assert.equal(menu.launch(zone.id), null); assert.equal(menu.launching, false); }
  assert.equal(menu.launch('unknown'), null);
  for (const section of FUTURE_SECTIONS) assert.equal(menu.navigate(section), false);
  assert.equal(menu.page, 'home');
});
test('both weapons survive navigation and yield the existing five-wave run with unchanged base stats', () => {
  for (const weaponId of ['shotgun', 'smg']) {
    const menu = new MenuState(); assert.equal(menu.selectWeapon(weaponId), true);
    menu.navigate('zones'); menu.navigate('home'); menu.navigate('zones');
    const options = menu.launch('galleries'); assert.deepEqual(options, { weaponId });
    const rng = () => .99;
    const launched = new Run(rng, {}, {...options,rewardRandom:rng}), direct = new Run(rng, {}, { weaponId,rewardRandom:rng });
    assert.equal(launched.weapon.definition.id, weaponId);
    assert.deepEqual(launched, direct);
    assert.equal(launched.waveNumber, 1); assert.equal(launched.player.hp, 5);
  }
});
test('launch latch prevents double-tap starts and selection cannot mutate an active run', () => {
  const menu = new MenuState(); menu.selectWeapon('smg');
  assert.ok(menu.launch('galleries')); assert.equal(menu.launch('galleries'), null);
  assert.equal(menu.selectWeapon('shotgun'), false); assert.equal(menu.navigate('home'), false);
  assert.equal(menu.weaponId, 'smg');
});
test('victory or defeat returns to menu without unlocking future zones or losing selected weapon', () => {
  for (const status of ['won','lost']) {
    const menu = new MenuState(); menu.selectWeapon('smg');
    const run = new Run(Math.random, {}, menu.launch('galleries')); run.status = status;
    menu.returnTo('home'); assert.equal(menu.page,'home'); assert.equal(menu.weaponId,'smg');
    assert.equal(menu.launching, false); assert.equal(menu.launch('tracks'), null);
    menu.navigate('zones'); assert.deepEqual(menu.launch('galleries'), {weaponId:'smg'});
  }
});
test('menu navigation and weapon choices do not write, migrate or spend the existing profile', () => {
  const data = new Map(); let writes = 0;
  const backend = { getItem: key => data.get(key) || null, setItem: (key,value) => { writes++; data.set(key,value); } };
  const wallet = new Wallet(new LocalProfileStorage(backend));
  const before = JSON.stringify(wallet.snapshot), beforeWrites = writes;
  const menu = new MenuState();
  for (let i=0; i<20; i++) { menu.selectWeapon(i%2 ? 'smg':'shotgun'); menu.navigate('zones'); menu.returnTo(); }
  assert.equal(JSON.stringify(wallet.snapshot),before); assert.equal(writes,beforeWrites);
});
test('invalid weapon cannot replace a valid selection and each portrait identifies its equipped weapon', () => {
  const menu = new MenuState(); menu.selectWeapon('smg');
  assert.equal(menu.selectWeapon('laser'),false); assert.equal(menu.weaponId,'smg');
  const shotgun = minerPortrait('shotgun'), smg = minerPortrait('smg');
  assert.match(shotgun,/Mineur équipé : FUSIL À POMPE/); assert.match(smg,/Mineur équipé : MITRAILLETTE/);
  assert.notEqual(shotgun,smg); assert.doesNotMatch(smg,/<image|https?:|<animate/);
});
