import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {applyCombatRenderLayers,COMBAT_LAYERS as L} from '../src/combat-render-layers.js';
import {beforeLayeringVisual} from './layering-visual-delta.js';
const object=(depth=7)=>({depth,changes:0,setDepth(d){this.depth=d;this.changes++;return this;}});
function scene(){return {pelletViews:[object(),object()],muzzle:object(),forgeSpriteVfx:{g:object(),muzzleGraphics:object()},
 enemyAttacksView:{bolts:object(24),warning:object(8),rivets:{sprites:[object(24)]},lampistShots:{sprites:[object(24)]},rivetImpacts:{sprites:[object(7.6)]}},
 effects:{items:['impact-shotgun','impact-smg','impact-energy','conduction','arc-energy','overload-grisoux','dust',null].map(clip=>({clip,sprite:object()}))},
 arenaView:{warning:object(8),...Object.fromEntries(['heatingSectors','whitehotPlates','furnaceCone','furnaceArm','scorifierTrail'].map(k=>[k,{base:object(7.8),sprites:[object(7.9)],outline:object(16),preview:object(16.1)}]))}};}
test('D1F preserves every previous source, asset and test byte except exact renderer integration',()=>{
 const hash=b=>createHash('sha256').update(b).digest('hex'),baseline=JSON.parse(fs.readFileSync('tests/layering-before-v038d1f.json'));
 for(const [p,h]of Object.entries(baseline)){
  let bytes=fs.readFileSync(p);
  if(p.startsWith('src/'))bytes=beforeLayeringVisual(p.slice(4),bytes);
  if(p==='tests/sectors-visual-delta.js')bytes=Buffer.from(bytes.toString().replace("import {beforeLayeringVisual} from './layering-visual-delta.js';\n",'').replace('\n bytes=beforeLayeringVisual(file,bytes);',''));
  assert.equal(hash(bytes),h,p);
 }
});
test('D1F ordered semantic layers keep flight between ground and actors and critical contours over actors',()=>{
 assert.ok(L.FLOOR<L.GROUND_BASE&&L.GROUND_BASE<L.GROUND_HAZARD&&L.GROUND_HAZARD<L.GROUND_MARKINGS);
 assert.ok(L.GROUND_MARKINGS<L.PROJECTILE&&L.PROJECTILE<L.HOSTILE_PROJECTILE&&L.HOSTILE_PROJECTILE<L.ACTOR);
 assert.ok(L.ACTOR<L.HERO&&L.HERO<L.HELD_WEAPON&&L.HELD_WEAPON<L.CRITICAL_TELEGRAPH&&L.CRITICAL_TELEGRAPH<L.UI);
});
for(const name of ['heatingSectors','whitehotPlates','furnaceCone','furnaceArm','scorifierTrail'])test('D1F '+name+' player and hostile shots above ground, below critical contour',()=>{
 const s=scene();applyCombatRenderLayers(s);const hazard=s.arenaView[name];
 for(const shot of [...s.pelletViews,s.enemyAttacksView.bolts,...s.enemyAttacksView.rivets.sprites,...s.enemyAttacksView.lampistShots.sprites]){
  assert.ok(shot.depth>hazard.sprites[0].depth);assert.ok(shot.depth<L.ACTOR);assert.ok(shot.depth<hazard.outline.depth);
 }
 assert.equal(hazard.sprites[0].depth,7.9);assert.equal(hazard.base.depth,7.8);assert.equal(hazard.outline.depth,L.CRITICAL_TELEGRAPH);
});
test('D1F all contact feedback above ground, energy contact retained above enemies, dust not lifted',()=>{
 const s=scene();applyCombatRenderLayers(s);
 assert.equal(s.muzzle.depth,L.CONTACT);assert.equal(s.forgeSpriteVfx.muzzleGraphics.depth,L.CONTACT);assert.equal(s.forgeSpriteVfx.g.depth,7);
 assert.equal(s.enemyAttacksView.rivetImpacts.sprites[0].depth,L.CONTACT);
 assert.deepEqual(s.effects.items.map(p=>p.sprite.depth),[12,12,16,16,16,16,7,12]);
});
test('D1F stable ordering and no redundant setDepth calls across unchanged frames',()=>{
 const s=scene();applyCombatRenderLayers(s);const first=JSON.stringify(s);
 for(let i=0;i<5000;i++)applyCombatRenderLayers(s);assert.equal(JSON.stringify(s),first);
});
test('D1F pooled impact reuse, late allocation and depth reset are corrected before render',()=>{
 const s=scene();applyCombatRenderLayers(s);s.effects.items[0].sprite.setDepth(7);s.enemyAttacksView.rivetImpacts.sprites.push(object(7.6));
 s.effects.items[6].clip='impact-smg';applyCombatRenderLayers(s);
 assert.equal(s.effects.items[0].sprite.depth,12);assert.equal(s.effects.items[6].sprite.depth,12);
 assert.ok(s.enemyAttacksView.rivetImpacts.sprites.every(p=>p.depth===12));
});
test('D1F compositor cannot access or mutate simulation state',()=>{
 const s=scene();Object.defineProperty(s,'run',{get(){throw Error('Simulation access forbidden');}});applyCombatRenderLayers(s);
});
test('D1F room applies policy after all pooled updates and only once per draw',()=>{
 const src=fs.readFileSync('src/room-scene.js','utf8');assert.equal(src.split('applyCombatRenderLayers(this);').length,2);
 assert.match(src,/this\.arenaView\.update\(run\);\s*this\.lootView\.update\(run\.loot, this\.reducedMotion\);\s*applyCombatRenderLayers\(this\);/);
});
