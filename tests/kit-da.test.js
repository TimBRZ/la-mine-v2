import {V021_FILES} from './v021-authorized-files.js';
import { VISUAL_FILES } from './v019-visual-files.js';
import { preserveWorkshopHint } from './v017-protected-copy.js';
import { TALENT_FILES } from './v016-authorized-files.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { heroPresentation, kitImage } from '../src/menu/kit.js';

const root = new URL('../src/assets/kit-da/', import.meta.url);
test('DA kit assets exist, remain local and fit the 100 KB payload budget', async () => {
  const { assets } = JSON.parse(await readFile(new URL('manifest.json', root)));
  assert.equal(assets.length, 17);
  let total = 0;
  for (const asset of assets) {
    assert.match(asset.file, /^[a-z-]+\.(svg|webp)$/);
    const bytes = (await stat(new URL(asset.file, root))).size;
    assert.equal(bytes, asset.bytes);
    total += bytes;
    if (asset.file.endsWith('.svg')) {
      const svg = await readFile(new URL(asset.file, root), 'utf8');
      assert.match(svg, /viewBox=/);
      assert.doesNotMatch(svg, /<script|<foreignObject|<filter|<animate|<image|(?:href|src)=/);
    }
  }
  assert.ok(total < 100 * 1024);
});
test('hero loadout describes and displays exactly the selected weapon', () => {
  for (const [id, name] of [['shotgun','FUSIL À POMPE'],['smg','MITRAILLETTE']]) {
    const markup = heroPresentation(id);
    assert.ok(markup.includes('Mineur équipé : '+name));
    assert.ok(markup.includes('/'+id+'.svg'));
    assert.ok(markup.includes('/miner.webp'));
    assert.doesNotMatch(markup, /https?:|<button/);
  }
  assert.throws(() => heroPresentation('other'), RangeError);
  assert.throws(() => kitImage('../other'), RangeError);
});
test('protected V0.9 resources, base stats and upgrade costs stay unchanged outside authorized reworks', async () => {
  // V0.14 explicitly retunes boss/rat/drill behavior; difficulty-v014 covers it.
  const baseline = JSON.parse(await readFile(new URL('./v09-protected-baseline.json',import.meta.url)));
  for (const [file, hash] of Object.entries(baseline).filter(([file])=>!V021_FILES.includes(file)).filter(([file])=>!VISUAL_FILES.includes(file)).filter(([file])=>!TALENT_FILES.includes(file))) {
    // Authorized changes: V0.10 persistence, V0.11 waves, V0.12 weapon/perk effects,
    // V0.13 injection of a distributed budget into the existing loot collector.
    // New V0.12 tests cover modified modules and protect all excluded systems.
    // Migration, old rewards/purchases and new persistence are covered by meta/relief tests.
    if (['wallet.js','local-profile-storage.js','run.js','upgrades.js','rewards.js','weapon.js','weapons.js','combat.js','room-loot.js','boss.js','enemies/rat.js','enemies/drill.js'].includes(file)) continue;
    const actual = createHash('sha256').update(preserveWorkshopHint(file,await readFile(new URL('../src/'+file,import.meta.url)))).digest('hex');
    assert.equal(actual,hash,file);
  }
});
test('both local servers serve the kit with explicit SVG and WebP MIME types', async () => {
  for (const file of ['../server.mjs','./browser-qa-server.mjs'].filter(f=>!V021_FILES.includes(f))) {
    const source = await readFile(new URL(file,import.meta.url),'utf8');
    assert.match(source, /'\.svg': 'image\/svg\+xml'/);
    assert.match(source, /'\.webp': 'image\/webp'/);
    assert.match(source, /'\.jpg': 'image\/jpeg'/);
    assert.match(source, /'\.jpeg': 'image\/jpeg'/);
    assert.match(source, /'\.png': 'image\/png'/);
  }
});
