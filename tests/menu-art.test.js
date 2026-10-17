import test from 'node:test';
import assert from 'node:assert/strict';
import { uiIcon, decorateResources, zoneIllustration } from '../src/menu/art.js';
import { weaponArt, minerPortrait } from '../src/menu/character.js';
import { ZONES } from '../src/menu/state.js';

test('resource decoration replaces only decorative icons, preserving amounts and resource labels', () => {
  const ids = ['coal','iron','diamond','token'];
  const rows = ids.map((id,i) => ({id, amount:[9400,12,3,1][i], name:['Charbon','Fer','Diamant','Jeton Grisou'][i], icon:{innerHTML:'legacy'}}));
  const before = rows.map(({id,amount,name}) => ({id,amount,name}));
  const classes = new Set();
  const list = { querySelector: selector => rows.find(row => selector === '.resource-'+row.id+' i').icon, classList:{add: name=>classes.add(name)} };
  assert.equal(decorateResources(list),list);
  assert.deepEqual(rows.map(({id,amount,name})=>({id,amount,name})),before);
  for(const row of rows) assert.match(row.icon.innerHTML,/aria-hidden="true"/);
  assert.ok(classes.has('polished-resources'));
});
test('menu icons and mining-place artwork remain small decorative vectors without external assets or filters', () => {
  const names=['coal','iron','diamond','token','home','zones','workshop','talents','relief','crates','lock','power','health','mechanics','mobility'];
  for(const name of names){const svg=uiIcon(name);assert.match(svg,/aria-hidden="true"/);assert.doesNotMatch(svg,/<image|<filter|<animate|https?:/);}
  assert.throws(()=>uiIcon('unknown'),RangeError);
  const places=ZONES.map((_,index)=>zoneIllustration(index));
  assert.equal(new Set(places).size,7);
  for(const art of places){assert.ok(art.length<3000);assert.match(art,/aria-hidden="true"/);assert.doesNotMatch(art,/<a\b|<button|<filter|<image|https?:/);}
  assert.equal(ZONES.filter(z=>z.playable).length,6);
});
test('illustrated equipment stays distinct while portraits retain explicit accessible weapon names', () => {
  assert.notEqual(weaponArt('shotgun'),weaponArt('smg'));
  assert.match(minerPortrait('shotgun'),/role="img" aria-label="Mineur équipé : FUSIL À POMPE"/);
  assert.match(minerPortrait('smg'),/role="img" aria-label="Mineur équipé : MITRAILLETTE"/);
  for(const id of ['shotgun','smg'])assert.doesNotMatch(minerPortrait(id),/<filter|<image|<animate|https?:/);
});
