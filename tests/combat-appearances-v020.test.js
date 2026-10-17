import {V021_FILES} from './v021-authorized-files.js';
import {withoutWagonTargeting} from './wagon-targeting-compat.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {COMBAT_APPEARANCES as ART,preloadCombatAppearances,useCombatAppearance,createAppearanceMotion,appearancePose,animateCombatAppearance} from '../src/combat-appearances.js';

test('V0.20 preserves every V0.19 module outside the two entity renderers the version label and authorized wagon targeting',async()=>{
  const root=new URL('./v019-final-src-snapshot/',import.meta.url);
  async function walk(prefix='') {for(const entry of await readdir(new URL(prefix,root),{withFileTypes:true})) {
    const path=prefix+entry.name;
    if(entry.isDirectory()){await walk(path+'/');continue;}
    if(['room-scene.js','enemies/view.js',...V021_FILES].includes(path))continue;
    let current=await readFile(new URL('../src/'+path,import.meta.url),'utf8');
    if(path==='menu/main-menu.js')current=current.replaceAll('V0.20','V0.19');
    assert.equal(withoutWagonTargeting(path,current),await readFile(new URL(path,root),'utf8'),path);
  }}await walk();
  for(const file of ['style.css','server.mjs','index.html'].filter(f=>!V021_FILES.includes(f))) {
    const current=await readFile(new URL('../'+file,import.meta.url),'utf8');
    const previous=await readFile(new URL('./v019-final-'+file+'.backup',import.meta.url),'utf8');
    assert.equal(current.replaceAll('0.33','0.19').replaceAll('Trois armes','Deux armes'),previous,file);
  }
});
test('the catalogue covers exactly the hero, both weapons, five enemies and six bosses',()=>{
  assert.deepEqual(Object.keys(ART).sort(),['hero','shotgun','smg','grisoux','rat','miner','drill','wagon','draisine','haveuse','crachefer','effondreur','stationmaster','locomotive','switchman'].sort());
  assert.equal(new Set(Object.values(ART).map(a=>a.key)).size,15);
  assert.ok(Object.isFrozen(ART));
});
test('all entity assets are distinct local SVGs with bounded download and decoded texture budgets',async()=>{
  let bytes=0;const contents=[];
  for(const art of Object.values(ART)) {
    const svg=await readFile(new URL('../'+art.url,import.meta.url),'utf8');
    bytes+=Buffer.byteLength(svg);contents.push(svg);
    assert.match(svg,/viewBox="0 0 128 128"/);
    assert.match(svg,/<path/);assert.match(svg,/<title>/);
    assert.doesNotMatch(svg,/<(?:script|filter|image|foreignObject|text)\b|href=|url\((?!#)/i);
    assert.ok(Buffer.byteLength(svg)<12000,art.id);
    assert.ok(art.width<=88&&art.height<=88&&Object.isFrozen(art));
  }
  assert.equal(new Set(contents).size,15);assert.ok(bytes<120000);
  assert.ok(15*128*128*4<1024*1024);
});
test('preloading rasterizes each local asset once at a small fixed size',()=>{
  const queue=[];preloadCombatAppearances({load:{svg:(...args)=>queue.push(args)}});
  assert.equal(queue.length,15);
  for(const [key,url,size] of queue){assert.ok(key.startsWith('combat-v020-'));assert.ok(url.startsWith('./src/assets/combat-v020/'));assert.deepEqual(size,{width:128,height:128});}
});
test('a failed asset keeps the existing fallback intact and loaded assets use catalogue anchors',()=>{
  const calls=[],image=new Proxy({},{get:(_,name)=>(...args)=>{calls.push([name,...args]);return image;}});
  assert.equal(useCombatAppearance(image,'hero',{exists:()=>false}),null);assert.equal(calls.length,0);
  assert.equal(useCombatAppearance(image,'unknown',{exists:()=>true}),null);
  assert.equal(useCombatAppearance(image,'hero',{exists:()=>true}),ART.hero);
  assert.deepEqual(calls,[['setTexture',ART.hero.key],['setOrigin',.5,.62],['setDisplaySize',46,52]]);
});
test('human silhouettes stay upright and mechanical aiming follows the exact gameplay angle',()=>{
  for(const art of Object.values(ART))for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]) {
    const entity=Object.freeze({x:100,y:300,angle,active:true}),pose=appearancePose(art,createAppearanceMotion(100,300),entity,1/60);
    if(['travel','rail'].includes(art.orientation)) {
      const sign=pose.flipX?-1:1;
      assert.ok(Math.abs(sign*Math.cos(pose.rotation)-Math.cos(angle))<1e-9);
      assert.ok(Math.abs(sign*Math.sin(pose.rotation)-Math.sin(angle))<1e-9);
      assert.ok(Math.abs(pose.rotation)<=Math.PI/2);
    } else {
      assert.equal(pose.rotation,art.orientation==='rotate'?angle:0);
      assert.equal(pose.flipX,art.orientation==='flip'&&Math.cos(angle)<-.1);
    }
  }
});
test('movement, idle and hit poses stay below one pixel of displacement and never mutate combat or consume its RNG',()=>{
  const random=Math.random;Math.random=()=>{throw Error('Presentation consumed combat RNG');};
  try {for(const art of Object.values(ART)) {
    const motion=createAppearanceMotion(100,300),shared=motion.pose;
    for(let i=0;i<300;i++) {
      const entity=Object.freeze({x:100+i,y:300,angle:i/30,active:true,flash:i%10?0:.1,radius:18,hp:5,vx:60,vy:0});
      const before=JSON.stringify(entity),pose=appearancePose(art,motion,entity,1/60);
      assert.equal(pose,shared);assert.equal(JSON.stringify(entity),before);
      assert.ok(Math.abs(pose.y)<1);assert.ok(Math.abs(pose.scaleX/(art.width/128)-1)<.05);
      assert.ok(Math.abs(pose.scaleY/(art.height/128)-1)<.05);
      for(const value of [pose.rotation,pose.scaleX,pose.scaleY,pose.y])assert.ok(Number.isFinite(value));
    }
  }}finally {Math.random=random;}
});
test('reduced motion removes bob, squash, hit and spawn scale but preserves aiming',()=>{
  for(const art of Object.values(ART)) {
    const pose=appearancePose(art,createAppearanceMotion(0,0),{x:100,y:300,angle:Math.PI,flash:.1,active:false,warmup:1.4},.04,true);
    assert.equal(pose.y,0);assert.equal(pose.scaleX,art.width/128);assert.equal(pose.scaleY,art.height/128);
    const normal=appearancePose(art,createAppearanceMotion(0,0),{x:100,y:300,angle:Math.PI,flash:.1,active:false,warmup:1.4},.04,false);
    assert.equal(pose.rotation,normal.rotation);assert.equal(pose.flipX,normal.flipX);
  }
});
test('movement settles smoothly, long frames are bounded and each run can reset animation state',()=>{
  const motion=createAppearanceMotion(0,0),entity={x:2,y:0,active:true};
  appearancePose(ART.hero,motion,entity,99);assert.equal(motion.time,.04);assert.ok(motion.move>0&&motion.move<1);
  const moving=motion.move;appearancePose(ART.hero,motion,entity,1/60);assert.ok(motion.move>0&&motion.move<moving);
  for(let i=0;i<90;i++)appearancePose(ART.hero,motion,entity,1/60);
  assert.ok(motion.move<.000001);
  assert.deepEqual(createAppearanceMotion(2,0),{x:2,y:0,time:0,move:0,pose:{}});
});
test('boss arrival grows only its sprite from a bounded scale without altering warmup or position',()=>{
  const entity=Object.freeze({x:200,y:250,angle:0,active:false,warmup:1.4});
  const pose=appearancePose(ART.haveuse,createAppearanceMotion(200,250),entity,0);
  assert.equal(pose.scaleX,ART.haveuse.width/128*.86);assert.equal(Math.abs(pose.y),0);assert.equal(entity.warmup,1.4);
});
test('animation applies only image transforms and leaves sprite creation to the existing pool lifecycle',()=>{
  const calls=[],image=new Proxy({},{get:(_,name)=>(...args)=>{calls.push([name,...args]);return image;}});
  animateCombatAppearance(image,ART.miner,createAppearanceMotion(100,200),{x:100,y:200,angle:Math.PI,active:true},1/60);
  assert.deepEqual(calls.map(c=>c[0]),['setFlipX','setRotation','setScale']);
});
