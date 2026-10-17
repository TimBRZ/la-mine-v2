import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WEAPON_VISUALS,WEAPON_VFX,WEAPON_VFX_ATLAS,WEAPON_VFX_DEPTH,weaponVisual,preloadWeaponVisuals,registerWeaponVisualFrames,vfxFrame,useWeaponVfx} from '../src/weapon-visuals.js';

test('V033 weapons retain display pivots and forward barrel axes without game imports',()=>{
 for(const id of ['shotgun','smg','grisoux']){
  const visual=weaponVisual(id);assert.equal(visual.originX,.5);assert.equal(visual.originY,.45);assert.equal(visual.width,id==='smg'?32:34);
  const svg=readFileSync(new URL('../'+visual.url,import.meta.url),'utf8');assert.match(svg,/width="128" height="128"/);assert.doesNotMatch(svg,/<(?:image|script|filter)\b/);
 }
 assert.equal(new Set(Object.values(WEAPON_VISUALS).map(v=>v.key)).size,3);
 assert.doesNotMatch(readFileSync(new URL('../src/weapon-visuals.js',import.meta.url),'utf8'),/from ['"]\.\/(?:combat|weapons|run|config)/);
});
test('V033 atlas registers equal stable cells once and respects texture bounds',()=>{
 const added=new Map(),texture={source:[{width:512,height:128}],has:name=>added.has(name),add:(name,...v)=>added.set(name,v),get:name=>{const[,cutX,cutY,cutWidth,cutHeight]=added.get(name);return{cutX,cutY,cutWidth,cutHeight};}};
 const textures={exists:()=>true,get:()=>texture};assert.equal(registerWeaponVisualFrames(textures),true);assert.equal(added.size,41);
 assert.equal(registerWeaponVisualFrames(textures),true);assert.equal(added.size,41);
 for(const [,x,y,w,h]of added.values()){assert.equal(w,32);assert.equal(h,32);assert.ok(x>=0&&x+w<=512&&y>=0&&y+h<=128);}
 const manifest=JSON.parse(readFileSync(new URL('../production-v033/weapons-atlas-manifest.json',import.meta.url),'utf8'));
 for(const item of manifest.strips){assert.equal(WEAPON_VFX[item.name].start,item.start);assert.equal(WEAPON_VFX[item.name].frames,item.frames);}
 assert.equal(WEAPON_VFX_ATLAS.width*WEAPON_VFX_ATLAS.height*4,262144);
 assert.ok(WEAPON_VFX_DEPTH<8);
});
test('V033 effects progress visually with clamping and only energy projectile loops',()=>{
 assert.equal(vfxFrame('muzzle-smg',0),'muzzle-smg-0');assert.equal(vfxFrame('muzzle-smg',.018),'muzzle-smg-1');assert.equal(vfxFrame('muzzle-smg',10),'muzzle-smg-1');
 assert.equal(vfxFrame('projectile-energy',.16),'projectile-energy-0');assert.equal(vfxFrame('projectile-energy',.04),'projectile-energy-1');
 assert.equal(vfxFrame('impact-energy',-3),'impact-energy-0');assert.equal(vfxFrame('unknown',0),null);
});
test('V033 missing atlas or frames leaves image fallback untouched',()=>{
 const image={setTexture(){assert.fail('fallback must stay untouched');}};
 assert.equal(registerWeaponVisualFrames({exists:()=>false}),false);
 assert.equal(useWeaponVfx(image,{exists:()=>false},'impact-energy'),null);
 assert.equal(useWeaponVfx(image,{exists:()=>true,get:()=>({has:()=>false})},'impact-energy'),null);
});
test('V033 loader requests small fixed SVG rasterization and valid named frame selects',()=>{
 const requests=[];preloadWeaponVisuals({load:{svg:(...args)=>requests.push(args)}});assert.equal(requests.length,4);
 assert.deepEqual(requests.at(-1)[2],{width:512,height:128});
 const calls=[],image={setTexture(...v){calls.push(v);return this;},setOrigin(...v){calls.push(v);return this;}};
 const visual=useWeaponVfx(image,{exists:()=>true,get:()=>({source:[{width:512,height:128}],has:()=>true,get:()=>({cutX:192,cutY:0,cutWidth:32,cutHeight:32})})},'muzzle-grisoux',.04);
 assert.equal(visual.originX,0);assert.deepEqual(calls[0],['combat-v033-vfx','muzzle-grisoux-1']);assert.deepEqual(calls[1],[0,.5]);
});
test('V033 truncated atlas and malformed frame dimensions use fallback',()=>{
 const malformed={source:[{width:256,height:128}],has:()=>false,add(){assert.fail('truncated atlas must not register');}};
 assert.equal(registerWeaponVisualFrames({exists:()=>true,get:()=>malformed}),false);
 const broken={source:[{width:512,height:128}],has:()=>true,get:()=>({cutX:0,cutY:0,cutWidth:16,cutHeight:32})};
 assert.equal(registerWeaponVisualFrames({exists:()=>true,get:()=>broken}),false);
 assert.equal(useWeaponVfx({setTexture(){assert.fail('malformed frame must not render');}},{exists:()=>true,get:()=>broken},'muzzle-shotgun'),null);
});
