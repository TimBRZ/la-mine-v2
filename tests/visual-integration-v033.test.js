import {historicalSource} from './instant-fire-compat.js';
import {v036bChanged} from './v036b-authorized-files.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {V033_NEW_FILES} from './v033-authorized-files.js';
import {withoutCracheferRetry} from './crachefer-patch-compat.js';
import {Run} from '../src/run.js';
import {Run as PreviousRun} from '../production-v033/before/src/run.js';
import {advanceHeroAnimation,createHeroAnimationState} from '../src/hero-animation.js';
import {Effects} from '../src/effects.js';
import {vfxFrame,WEAPON_VFX_DEPTH} from '../src/weapon-visuals.js';
const root=new URL('../',import.meta.url),hash=b=>createHash('sha256').update(b).digest('hex');
test('V033 only changes the two renderers and labels: gameplay, old assets, UI, saves and all zones remain byte-identical',()=>{
 const allowed=['src/enemies/view.js','src/room-scene.js','src/effects.js','src/menu/main-menu.js','index.html','package.json','package-lock.json','server.mjs','README.md'];
 const baseline=JSON.parse(historicalSource(new URL('production-v033/before-hashes.json',root)));
 for(const f of baseline)if(!v036bChanged(f.file)&&!allowed.includes(f.file))assert.equal(hash(withoutCracheferRetry(f.file,historicalSource(new URL(f.file,root)))),f.sha256,f.file);
 const actual=fs.readdirSync(new URL('src/',root),{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>e.parentPath.replaceAll('\\','/').split('/src/')[1]+'/'+e.name).map(s=>s.replace(/^undefined\//,''));
 assert.equal(actual.length,baseline.filter(f=>f.file.startsWith('src/')).length+V033_NEW_FILES.length);
 for(const p of V033_NEW_FILES)assert.ok(fs.existsSync(new URL('src/'+p,root)),p);
});
const random=()=>{let seed=1927;return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);};
for(const zoneId of ['galleries','rift','forge'])for(const weaponId of ['shotgun','smg','grisoux'])test('V033 rendered animation ticks preserve exact gameplay replay: '+zoneId+'/'+weaponId,()=>{
 const a=new Run(random(),{}, {zoneId,weaponId}),b=new PreviousRun(random(),{}, {zoneId,weaponId}),state=createHeroAnimationState();
 for(let i=0;i<720;i++){
  const input=i%150<75?{x:0,y:0}:{x:Math.cos(i/100),y:Math.sin(i/100)};
  const events=a.update(1/60,input);assert.deepEqual(events,b.update(1/60,input));
  const p=Object.freeze({...a.player});advanceHeroAnimation(state,{moving:Math.hypot(p.vx,p.vy)>1,shot:events.some(e=>e.type==='shot'),hit:events.some(e=>e.type==='hurt'),dead:p.hp<=0},1/60);
  for(const pellet of a.projectiles.pool)if(pellet.active)vfxFrame(pellet.definition.energy?'projectile-energy':'projectile-shotgun',pellet.distance/pellet.definition.pelletSpeed);
  assert.deepEqual({...a.player},{...b.player});assert.equal(JSON.stringify(a.projectiles.pool),JSON.stringify(b.projectiles.pool));assert.equal(a.weapon.cooldown,b.weapon.cooldown);assert.equal(a.weapon.recoil,b.weapon.recoil);
 }
});
test('V033 pooled atlas impacts retain the fixed48 budget, expire and fall back without gameplay RNG',()=>{
 let created=0;const sprites=[];const image=()=>{const s={x:0,y:0};for(const method of ['setVisible','setDepth','setTexture','setOrigin','setTint','setScale','setRotation','setAlpha','setDisplaySize'])s[method]=(...args)=>{s[method+'Args']=args;return s;};s.setPosition=(x,y)=>{s.x=x;s.y=y;return s;};created++;sprites.push(s);return s;};
 const fx=new Effects({add:{image},textures:{exists:()=>false}}),old=Math.random;
 Math.random=()=>{throw Error('combat RNG touched');};try{for(let i=0;i<300;i++){fx.clip('impact-energy',100,100);fx.burst(100,100,0xffffff,8);}assert.equal(created,48);assert.ok(fx.items.every(e=>e.life>0));fx.update(1);assert.ok(fx.items.every(e=>e.life<=0));fx.clear();}finally{Math.random=old;}
 assert.ok(sprites.every(s=>s.setDepthArgs[0]===WEAPON_VFX_DEPTH&&s.setDepthArgs[0]<8));
});
test('V033 result animation never advances simulation, claims a reward or changes player coordinates',async()=>{
 globalThis.Phaser={Scene:class{}};
 const {RoomScene}=await import('../src/room-scene.js');let rendered=0;
 const scene={run:{player:{hp:0,x:100,y:200},update:()=>assert.fail('simulation tick')},mode:'result',drawHero:dt=>{rendered++;assert.equal(dt,.04);},wallet:{claim:()=>assert.fail('reward')}};
 RoomScene.prototype.update.call(scene,0,500);assert.equal(rendered,1);assert.deepEqual(scene.run.player,{hp:0,x:100,y:200});
});

