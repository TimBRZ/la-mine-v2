import {V021_FILES} from './v021-authorized-files.js';
import {withoutWagonTargeting} from './wagon-targeting-compat.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {dangerLane,dangerCircle,paintArena,COMBAT_ART} from '../src/combat-art.js';
import {paintBoss} from '../src/boss-art.js';
import {makeTextures} from '../src/textures.js';
import {Effects} from '../src/effects.js';
import {LootView} from '../src/loot-view.js';
import {drawRailWarning} from '../src/enemies/rail-view.js';
import {drawRailBoss} from '../src/rail-boss-view.js';
import {RailBoss} from '../src/rail-bosses.js';
import {VISUAL_FILES} from './v019-visual-files.js';

function drawing() {
  const calls=[];const g=new Proxy({},{get:(_,method)=>(...args)=>{
    for(const value of args)if(typeof value==='number')assert.ok(Number.isFinite(value),method+' requires finite coordinates');
    calls.push([method,...args]);return g;
  }});return {g,calls};
}
test('V0.18 modules remain byte-identical outside authorized wagon targeting, including runs, bosses, rewards, upgrades and saved progression',async()=>{
  const root=new URL('./v018-final-src-snapshot/',import.meta.url);
  async function walk(prefix='') {for(const e of await readdir(new URL(prefix,root),{withFileTypes:true})) {
    const path=prefix+e.name;if(e.isDirectory()){await walk(path+'/');continue;}
    if(VISUAL_FILES.includes(path)||V021_FILES.includes(path))continue;
    const old=await readFile(new URL(path,root),'utf8');let now=await readFile(new URL('../src/'+path,import.meta.url),'utf8');
    if(path==='menu/main-menu.js')now=now.replace(/V0\.(19|20)/g,'V0.18');
    assert.equal(withoutWagonTargeting(path,now),old,path);
  }}await walk();
});
test('the two arenas have distinct deterministic artwork and bounded one-time drawing work',()=>{
  const outputs=[];
  for(const tracks of [false,true]) {
    const a=drawing(),b=drawing();paintArena(a.g,tracks);paintArena(b.g,tracks);
    assert.deepEqual(a.calls,b.calls);assert.ok(a.calls.length<1600);outputs.push(a.calls);
  }
  assert.notDeepEqual(...outputs);
});
test('lane borders follow the exact threat radius and direction, including diagonal and reverse lanes',()=>{
  for(const [x,y,x2,y2,r] of [[40,220,410,220,18],[410,220,40,220,18],[60,180,380,600,32]]) {
    const {g,calls}=drawing();dangerLane(g,x,y,x2,y2,r);
    assert.deepEqual(calls[0],['lineStyle',r*2,COMBAT_ART.warning,.14]);
    const len=Math.hypot(x2-x,y2-y),nx=-(y2-y)/len*r,ny=(x2-x)/len*r;
    assert.ok(calls.some(c=>JSON.stringify(c)===JSON.stringify(['lineBetween',x-nx,y-ny,x2-nx,y2-ny])));
    assert.ok(calls.length<70);
  }
  const {g,calls}=drawing();dangerLane(g,10,10,10,10,18);assert.equal(calls.length,0);
});
test('ground warning and active attack share the same radius but visibly change color',()=>{
  const warning=drawing(),active=drawing();dangerCircle(warning.g,200,300,54);dangerCircle(active.g,200,300,54,true);
  for(const d of [warning,active])assert.ok(d.calls.some(c=>c[0]==='strokeCircle'&&c[3]===54));
  assert.ok(warning.calls.some(c=>c[0]==='lineStyle'&&c[2]===COMBAT_ART.warning));
  assert.ok(active.calls.some(c=>c[0]==='lineStyle'&&c[2]===COMBAT_ART.danger));
});
test('wagon warning renderer neither changes its locked trajectory nor draws after its run ends',()=>{
  const enemy=Object.freeze({kind:'wagon',alive:true,phase:'warning',x:40,y:300,endX:410,radius:18});
  const {g,calls}=drawing();assert.equal(drawRailWarning(g,enemy),true);assert.ok(calls.length>0);
  const ended=drawing();drawRailWarning(ended.g,{...enemy,phase:'stopped'});assert.equal(ended.calls.length,0);
});
for(const id of ['stationmaster','locomotive','switchman'])test('rail boss warnings render finite geometry without mutating attacks: '+id,()=>{
  const b=new RailBoss('test',id);b.warmup=0;
  for(let n=0;n<4;n++) {
    b.beginWarning({x:200,y:500});const before=JSON.stringify(b),d=drawing();drawRailBoss(d.g,b);
    assert.equal(JSON.stringify(b),before);assert.ok(d.calls.length<200);
  }
});
test('six boss silhouettes generate distinct small sprites',()=>{
  const art=['haveuse','crachefer','effondreur','stationmaster','locomotive','switchman'].map(id=>{const d=drawing();paintBoss(d.g,id);assert.ok(d.calls.length<200);return JSON.stringify(d.calls);});
  assert.equal(new Set(art).size,6);
});
test('all combat textures fit within 88 pixels with no external image or shader',()=>{
  const {g,calls}=drawing();makeTextures({make:{graphics:()=>g}});
  const textures=calls.filter(c=>c[0]==='generateTexture');
  for(const key of ['player','rat','miner','drill','wagon','draisine','haveuse','crachefer','effondreur','stationmaster','locomotive','switchman','pellet','muzzle'])assert.ok(textures.some(c=>c[1]===key),key);
  for(const c of textures)if(['arena-shaft59','arena-rift','arena-depths','arena-forge'].includes(c[1]))assert.deepEqual(c.slice(2),[450,800]);else assert.ok(c[2]<=88&&c[3]<=88);
});
test('effects stay inside a 48-sprite pool, reuse objects and expire without touching the global random generator',()=>{
  let creations=0;const sprites=[];const scene={add:{image:()=>{creations++;const d=drawing();sprites.push(d);return d.g;}}};
  const fx=new Effects(scene),random=Math.random;Math.random=()=>{throw Error('Visual effects consumed combat RNG');};
  try {for(let i=0;i<200;i++){fx.burst(200,300,0xffffff,100);fx.ring(200,300,0xffffff,3);}assert.equal(fx.items.filter(i=>i.life>0).length,48);fx.update(1);assert.ok(fx.items.every(i=>i.life<=0));fx.burst(0,0,0,2);fx.clear();assert.ok(fx.items.every(i=>i.life===0));}
  finally {Math.random=random;}
  assert.equal(creations,48);
});
test('loot attraction trails are short, pooled, visual-only, and omitted for reduced motion',()=>{
  const d=drawing(),scene={add:{graphics:()=>d.g,text:()=>drawing().g}},view=new LootView(scene);
  const drop={id:0,x:100,y:200,age:1,active:true,amount:1,resource:'diamond'},loot={pool:[drop],phase:'collecting'};
  view.update(loot,false);drop.x=200;const before=JSON.stringify(loot);d.calls.length=0;view.update(loot,false);
  assert.equal(JSON.stringify(loot),before);assert.ok(d.calls.some(c=>c[0]==='lineBetween'&&c[1]===200&&c[3]===180));
  d.calls.length=0;drop.x=300;view.update(loot,true);assert.ok(!d.calls.some(c=>c[0]==='lineStyle'&&c[1]===3&&c[3]===.35));
});
