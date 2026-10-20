import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {HEATING_SECTORS as S,HeatingSectorsView,preloadHeatingSectors,registerHeatingSectors} from '../src/furnace-heating-sectors-vfx.js';
import {beforeSectorsVisual} from './sectors-visual-delta.js';import {mock} from './sectors-mock-v038d1e.js';
import {Run} from '../src/run.js';import {createBoss} from '../src/bosses.js';import {makeBossPlan} from '../src/forge/boss-patterns.js';
import {forgeTouches} from '../src/forge/geometry.js';import {drawForge} from '../src/forge/art.js';
import {forgeEscapeReport} from '../src/forge/geometry.js';import {bossHazards} from '../src/forge/boss-director.js';
const hash=b=>createHash('sha256').update(b).digest('hex'),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function fixture(late=false,triple=false){
 const r=new Run(()=>.3,{}, {zoneId:'forge',weaponId:'smg',rewardRandom:()=>.3,talentRandom:()=>.3});
 r.waveIndex=triple?19:4;r.spawned=r.wave.total;r.weapon.cooldown=1e6;r.player.hp=r.player.maxHealth=1e6;r.player.x=225;r.player.y=500;
 r.enemies=(triple?['furnace','hammer','boiler']:['furnace']).map((b,i)=>createBoss(i+1,b,triple?[[110,210],[225,165],[340,210]][i]:[225,270],triple?.76:1,{final:triple,slot:i}));
 for(const e of r.enemies){e.warmup=0;if(late)e.hp=e.maxHealth*.49;}r.tripleStartingHealth=r.enemies.reduce((s,e)=>s+e.maxHealth,0);
 r.forge.director.start(r.enemies[0],'sectors');r.update(1/60);return r;
}
const hazards=r=>r.forge.ground.items.filter(h=>h.planId==='sectors');
const render=(v,f,r)=>{f.g.clear();v.begin(r);drawForge(f.g,r,null,null,null,null,null,v);};
const snap=r=>JSON.stringify({player:r.player,enemies:r.enemies,ground:r.forge.ground.items,shots:r.forge.shots.pool,elapsed:r.elapsed,history:r.forge.director.history,status:r.status});
test('D1E freezes all earlier source bytes except exact presentation hooks and all 1833 old assertions',()=>{
 const before=JSON.parse(fs.readFileSync('tests/sectors-before-v038d1e.json'));
 for(const [p,h]of Object.entries(before))if(p.startsWith('src/')||p.endsWith('.test.js'))assert.equal(hash(p.startsWith('src/')?beforeSectorsVisual(p.slice(4),fs.readFileSync(p)):fs.readFileSync(p)),h,p);
 const adapter=fs.readFileSync('tests/cone-visual-delta.js','utf8').replace("import {beforeSectorsVisual} from './sectors-visual-delta.js';\n",'').replace('\n bytes=beforeSectorsVisual(file,bytes);','');
 assert.equal(hash(adapter),before['tests/cone-visual-delta.js']);
 for(const p of ['tests/whitehot-visual-delta.js','tests/furnace-turn-visual-delta.js','tests/v038b3-authorized-files.js'])assert.equal(hash(fs.readFileSync(p)),before[p]);
});
test('D1E approved compact PNG loads six exact frames in a single shared atlas',()=>{
 const calls=[];preloadHeatingSectors({load:{image:(...a)=>calls.push(a)}});assert.deepEqual(calls,[[S.key,S.url]]);
 const f=mock();assert.ok(registerHeatingSectors(f.textures));assert.equal(f.frames.size,6);
 const png=fs.readFileSync(S.url);assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),426);assert.equal(png.readUInt32BE(20),380);assert.equal(S.width*S.height*4,647520);
});
for(const defect of ['missing','size','frame','cut','source','texture','sourceIndex'])test('D1E '+defect+' returns exact old sectors, never another plate renderer',()=>{
 const f=mock(),v=new HeatingSectorsView(f.scene),r=fixture(true);
 if(defect==='missing')f.textures.present=false;if(defect==='size')f.texture.source[0].height=512;if(defect==='frame')f.frames.delete('1');
 if(defect==='cut')f.frames.get('2').cutY=10;if(defect==='source')f.frames.get('0').source={};if(defect==='texture')f.frames.get('3').texture={};if(defect==='sourceIndex')f.frames.get('4').sourceIndex=1;
 render(v,f,r);const old=mock();drawForge(old.g,r);assert.deepEqual(f.g.calls,old.g.calls);assert.equal(v.used,0);assert.ok(v.sprites.every(p=>!p.setVisibleArgs[0]));
 assert.equal(v.base.setVisibleArgs[0],false);assert.equal(v.outline.setVisibleArgs[0],false);
});
for(const [ratio,count]of [[.51,2],[.5,2],[.499,3]])test('D1E threshold '+ratio+' gives '+count+' unchanged rectangles with one simultaneous event',()=>{
 const r=fixture(),e=r.enemies[0];e.hp=e.maxHealth*ratio;const p=makeBossPlan(e,'sectors',r.player),ev=p.events[0];
 assert.equal(p.events.length,1);assert.equal(ev.at,0);assert.equal(ev.duration,1.8);near(ev.warning,ratio<.5?1.269:1.35);
 assert.deepEqual(ev.points.map(h=>[h.x,h.y,h.w,h.h]),[[121,265,142,190],[329,520,142,190],[329,265,142,150]].slice(0,count));
 near(p.end,ratio<.5?3.119:3.2);assert.equal(p.tracking,0);assert.equal(p.locked,true);
});
for(const late of [false,true])test('D1E '+(late?'three':'two')+' plaques stay fixed despite mobile boss, all phases activate together',()=>{
 const r=fixture(late),f=mock(),v=new HeatingSectorsView(f.scene),start=[r.enemies[0].x,r.enemies[0].y],states=new Set();let initial;
 for(let i=0;i<215;i++){
  const hs=hazards(r);if(hs.length){
   assert.equal(hs.length,late?3:2);const geometry=hs.map(h=>[h.x,h.y,h.w,h.h]);initial??=geometry;assert.deepEqual(geometry,initial);
   assert.equal(new Set(hs.map(h=>h.cooling?'cool':h.active?'active':'warning')).size,1);
   hs.forEach(h=>assert.equal(h.damage,.5));states.add(hs[0].cooling?'cool':hs[0].active?'active':'warning');
   render(v,f,r);assert.equal(v.used,hs.length);
   for(const h of hs){const p=v.sprites[h.index];assert.deepEqual(p.setPositionArgs,[h.x,h.y]);assert.deepEqual(p.setDisplaySizeArgs,[142,190]);assert.deepEqual(p.setCropArgs,[2,(190-h.h)/2+2,138,h.h-4]);}
  }r.update(1/60);
 }assert.deepEqual([...states],['warning','active','cool']);assert.notDeepEqual([r.enemies[0].x,r.enemies[0].y],start);
});
test('D1E HP crossing after plan creation cannot add/remove/recolour a rectangle',()=>{
 for(const late of [false,true]){
  const r=fixture(late),f=mock(),v=new HeatingSectorsView(f.scene);r.enemies[0].hp=r.enemies[0].maxHealth*(late?.9:.4);render(v,f,r);assert.equal(v.used,late?3:2);
 }
});
test('D1E preserves existing triple evacuation refusal for BOTH rectangle counts, without bypassing admission',()=>{
 for(const late of [false,true]){
  const r=fixture(late,true),e=r.enemies[0],report=forgeEscapeReport(bossHazards(e,e.plan.events[0]),r.player);
  assert.equal(report.spans,false);near(report.largestColdFraction,.26666666666666666);
  assert.ok(r.forge.director.rejected>0);assert.equal(hazards(r).length,0);
 }
});
test('D1E telegraph heat progression, synchronized four active images, reduced motion and harmless cooling',()=>{
 const r=fixture(true),hs=hazards(r),f=mock(),v=new HeatingSectorsView(f.scene);
 for(const progress of [0,.25,.65,1]){
  hs.forEach(h=>h.warning=h.warningTotal*(1-progress));render(v,f,r);
  assert.ok(v.sprites.every(p=>p.setTextureArgs[1]==='4'));near(v.sprites[0].setAlphaArgs[0],Math.pow(progress,1.7)*.85);
 }
 for(const [time,frame]of [[0,'0'],[.2,'1'],[.4,'2'],[.6,'3'],[.8,'0']]){
  hs.forEach(h=>{h.active=true;h.elapsed=time;});render(v,f,r);assert.ok(v.sprites.every(p=>p.setTextureArgs[1]===frame&&p.setAlphaArgs[0]===1));
 }
 f.scene.reducedMotion=true;render(v,f,r);assert.ok(v.sprites.every(p=>p.setTextureArgs[1]==='0'));
 hs.forEach(h=>{h.active=false;h.cooling=.3;h.remaining=0;});render(v,f,r);assert.ok(v.sprites.every(p=>p.setTextureArgs[1]==='5'&&p.setAlphaArgs[0]===.65));
 const h=hs[0];r.player.x=h.x;r.player.y=h.y;r.player.invulnerable=0;const hp=r.player.hp;r.update(1/60);assert.equal(r.player.hp,hp);
});
test('D1E all base/contour pixels are inside the real rectangles; terrain and safe lanes untouched',()=>{
 const r=fixture(true),f=mock(),v=new HeatingSectorsView(f.scene);hazards(r).forEach(h=>h.active=true);render(v,f,r);
 assert.deepEqual(v.base.calls.filter(c=>c[0]==='fillRect'),hazards(r).map(h=>['fillRect',h.x-h.w/2,h.y-h.h/2,h.w,h.h]));
 assert.deepEqual(v.outline.calls.filter(c=>c[0]==='strokeRect'),hazards(r).map(h=>['strokeRect',h.x-h.w/2+.75,h.y-h.h/2+.75,h.w-1.5,h.h-1.5]));
 assert.ok(v.sprites.every(p=>p.setDepthArgs[0]===7.9));assert.equal(v.outline.setDepthArgs[0],16);
});
test('D1E actual safe centre lanes account for radius13 and preserve the short third plate',()=>{
 const r=fixture(true),hs=hazards(r),hit=(x,y)=>hs.some(h=>forgeTouches(h,{x,y,radius:13}));
 for(const x of [205,225,245])for(const y of [200,265,340,400,520,600])assert.equal(hit(x,y),false,`${x},${y}`);
 for(const y of [353,380,412])assert.equal(hit(329,y),false);
 assert.equal(hit(329,352.99),true);assert.equal(hit(329,412.01),true);
 assert.equal(hit(192,265),true);assert.equal(hit(204.99,265),true);assert.equal(hit(205,265),false);
 assert.equal(hit(245.01,265),true);assert.equal(hit(121,265),true);
});
test('D1E rejects partial/duplicate/mismatched groups atomically',()=>{
 for(const mutate of [r=>hazards(r)[0].w++,r=>hazards(r)[1].warning-=.01,r=>hazards(r)[2].attackToken++,r=>r.forge.ground.items.splice(0,1),r=>r.forge.ground.items.push({...hazards(r)[0]}),r=>r.enemies[0].hp=0]){
  const r=fixture(true),f=mock(),v=new HeatingSectorsView(f.scene);mutate(r);render(v,f,r);assert.equal(v.used,0);assert.equal(v.ready,false);
 }
});
for(const pattern of ['furnaceTurn','whiteFurnace','furnaceCone','whiteMarch','forgePressure','whiteHammer'])test('D1E leaves '+pattern+' entirely on its previous path',()=>{
 const r=fixture(true);hazards(r).forEach(h=>h.planId=pattern);const f=mock(),v=new HeatingSectorsView(f.scene);render(v,f,r);
 const old=mock();drawForge(old.g,r);assert.deepEqual(f.g.calls,old.g.calls);assert.equal(v.used,0);
});
for(const triple of [false,true])test('D1E observational '+(triple?'triple':'solo')+' replay preserves simulation and fixed pool',()=>{
 const r=fixture(true,triple),control=fixture(true,triple),f=mock(),v=new HeatingSectorsView(f.scene),count=f.count();let maximum=0;
 for(let i=0;i<330;i++){
  r.update(1/60);control.update(1/60);const before=snap(r);render(v,f,r);assert.equal(snap(r),before);assert.equal(snap(r),snap(control));maximum=Math.max(maximum,v.used);
 }assert.equal(maximum,triple?0:3);if(triple)assert.ok(r.forge.director.rejected>0);assert.equal(f.count(),count);assert.equal(f.images.length,3);
});
test('D1E caches phase geometry, hides stale objects and destroys its pool exactly once',()=>{
 const r=fixture(true),f=mock(),v=new HeatingSectorsView(f.scene);render(v,f,r);
 const rects=v.outline.calls.filter(c=>c[0]==='strokeRect');for(let i=0;i<100;i++)render(v,f,r);
 assert.deepEqual(v.outline.calls.filter(c=>c[0]==='strokeRect'),rects);
 f.textures.present=false;render(v,f,r);assert.equal(v.used,0);f.textures.present=true;render(v,f,r);assert.equal(v.used,3);
 r.forge.ground.items.length=0;render(v,f,r);assert.equal(v.used,0);assert.equal(v.outline.setVisibleArgs[0],false);
 f.shutdown();v.destroy();assert.equal(v.sprites.length,0);assert.equal(v.texture,null);
});
