import {historicalSource} from './instant-fire-compat.js';
import {v036bChanged} from './v036b-authorized-files.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import{createHash}from'node:crypto';
import{ENEMY_SHEETS,enemySheet,registerEnemyFrames,createEnemyAnimation,advanceEnemyAnimation,applyEnemyAnimation,retireEnemyView,updateEnemyDeaths,ENEMY_DEATH_LIMIT}from'../src/enemy-animation.js';
import{Run}from'../src/run.js';import{Run as BeforeRun}from'../production-v034b/before/src/run.js';
import{withoutCracheferRetry}from'./crachefer-patch-compat.js';
const hash=b=>createHash('sha256').update(b).digest('hex');
function textures(){const map=new Map(Object.values(ENEMY_SHEETS).map(s=>[s.key,{frames:new Map(),getSourceImage:()=>({width:s.width,height:s.height}),has(n){return this.frames.has(n);},get(n){return this.frames.get(n);},add(n,_s,x,y,w,h){this.frames.set(n,{cutX:x,cutY:y,cutWidth:w,cutHeight:h});}}]));return{exists:k=>map.has(k),get:k=>map.get(k),map};}
test('V034B immutable masters, gameplay, collision, economy, saves and legacy artwork remain byte-identical',()=>{
 const baseline=JSON.parse(historicalSource(new URL('../production-v034b/before-hashes.json',import.meta.url)));
 // Generated run reports are outputs, validated by their simulation tests, not immutable source fixtures.
 const allowed=['tests/v028-run.json','tests/v027-run-shotgun.json','tests/v027-run-smg.json','tests/v027-run-grisoux.json','tests/zone5-run-shotgun.json','tests/zone5-run-smg.json','tests/zone5-run-grisoux.json','tests/zone5-triple-metrics.json','tests/zone5-metrics.mjs','tests/zone5-pilot.js','src/room-scene.js','src/enemies/view.js','tests/v033-authorized-files.js','tests/visual-integration-v033.test.js','tests/weapon-grip-v033.test.js','tests/rift-v027.test.js','tests/zone5.test.js','tests/zone6.test.js','tests/weapon-balance-v031.test.js'];
 for(const e of baseline.filter(e=>!v036bChanged(e.file)&&!allowed.includes(e.file)))assert.equal(hash(withoutCracheferRetry(e.file,historicalSource(new URL('../'+(e.file.startsWith('tests/')&&fs.existsSync('production-v038c1c-reconciliation/before-tests/'+e.file.slice(6))?'production-v038c1c-reconciliation/before-tests/'+e.file.slice(6):e.file),import.meta.url)))),e.sha256,e.file);
});
test('V034B all registered sheets have contiguous clips, bounded texture sizes and correct approved master hashes',()=>{
 const t=textures();assert.equal(registerEnemyFrames(t).size,Object.keys(ENEMY_SHEETS).length);
 for(const s of Object.values(ENEMY_SHEETS)){
  assert.equal(hash(fs.readFileSync(new URL('../'+s.master,import.meta.url))),s.masterSha256);
  const svg=fs.readFileSync(new URL('../'+s.url.slice(2),import.meta.url),'utf8');assert.ok(svg.includes('<defs>')&&svg.includes('viewBox="0 0 128 128"'));assert.ok(!svg.includes('<image'));
  const master=fs.readFileSync(new URL('../'+s.master,import.meta.url),'utf8');for(const leaf of master.match(/<(?:path|circle|ellipse|rect|polygon|polyline|line)\b[^>]*\/>/g))assert.ok(svg.includes(leaf),'Approved path lost: '+s.id);
  let n=0;for(const c of Object.values(s.clips)){assert.equal(c.first,n);n+=c.count;}assert.equal(n,s.frames);assert.ok(s.width<=1024&&s.height<=1024);assert.ok(s.clips.death.count<=8);
  assert.equal(s.clips.prepare!==undefined,!['rat','miner'].includes(s.id));
 }
});
test('V034B missing, malformed or corrupt textures fall back without touching the image',()=>{
 const s=Object.values(ENEMY_SHEETS)[0],e=Object.freeze({x:100,y:200,angle:0}),a=createEnemyAnimation(e),body=new Proxy({},{get:()=>()=>assert.fail('invalid sheet applied')});
 assert.equal(registerEnemyFrames({exists:()=>false}).size,0);
 const t=textures();t.get(s.key).getSourceImage=()=>({width:1,height:1});assert.ok(!registerEnemyFrames(t).has(s.id));
 assert.equal(applyEnemyAnimation(body,{exists:()=>false},s,a,e,.016),false);
 const valid=textures();registerEnemyFrames(valid);valid.get(s.key).get(0).cutX=1;valid.get(s.key).get(1).cutX=1;valid.get(s.key).getSourceImage=()=>({width:1,height:1});assert.equal(applyEnemyAnimation(body,valid,s,a,e,0),false);
 assert.ok(!registerEnemyFrames(valid).has(s.id));
});
test('V034B shared enemy types retain modern artwork in every zone',()=>{for(const id of Object.keys(ENEMY_SHEETS)){for(const z of ['rift','depths','forge',undefined])assert.equal(enemySheet(id,z),ENEMY_SHEETS[id]);assert.ok(enemySheet(id,'galleries'));}});
for(const s of Object.values(ENEMY_SHEETS))test('V034B '+s.id+': immutable physics, eight headings, preparation and death are visual only',()=>{
 for(let i=0;i<8;i++){
  const angle=i*Math.PI/4,e=Object.freeze({x:100+Math.cos(angle)*2,y:200+Math.sin(angle)*2,angle,chargeAngle:angle,phase:'positioning',radius:17,hp:50,flash:0}),a=createEnemyAnimation({x:100,y:200});
  const before=JSON.stringify(e),p=advanceEnemyAnimation(s,a,e,.016);assert.equal(JSON.stringify(e),before);
  if(['travel','rail'].includes(s.orientation)){const heading=p.rotation+(p.flip?Math.PI:0);assert.ok(Math.abs(Math.cos(heading)-Math.cos(angle))<1e-8);assert.ok(Math.abs(Math.sin(heading)-Math.sin(angle))<1e-8);}
  if(s.orientation==='rotate')assert.equal(p.rotation,angle);if(['fixed','flip'].includes(s.orientation))assert.equal(p.rotation,0);
 }
 if(s.clips.prepare){const a=createEnemyAnimation({x:0,y:0}),e={x:0,y:0,phase:'warning',phaseTime:1.1};advanceEnemyAnimation(s,a,Object.freeze(e),.016);assert.equal(a.frame,s.clips.prepare.first);advanceEnemyAnimation(s,a,Object.freeze({...e,phaseTime:.01}),.1);assert.equal(a.frame,s.clips.prepare.first+2);advanceEnemyAnimation(s,a,Object.freeze({...e,phase:'recovery'}),.016);assert.equal(a.state,'attack');}
 const a=createEnemyAnimation({x:0,y:0});for(let i=0;i<50;i++)advanceEnemyAnimation(s,a,Object.freeze({x:0,y:0,dead:true}),.02);assert.ok(a.finished);assert.equal(a.frame,s.clips.death.first+s.clips.death.count-1);
});
test('V034B corpses are bounded, detached from live actors and fully disposed',()=>{
 const s=Object.values(ENEMY_SHEETS)[0],t=textures();registerEnemyFrames(t);let destroyed=0;
 const item=()=>{const o={};for(const m of ['setVisible','setDepth','setTexture','setOrigin','setDisplaySize','setPosition','setFlipX','setRotation','setAlpha','clearTint'])o[m]=()=>o;o.destroy=()=>destroyed++;return o;};
 const scene={textures:t,enemyViews:new Map(),reducedMotion:false};for(let i=0;i<30;i++){const v={sheet:s,animation:createEnemyAnimation({x:0,y:0}),container:{...item(),x:100,y:200},body:item()};for(const k of ['shadow','ring','health','healthBack','aimLabel'])v[k]=item();scene.enemyViews.set(i,v);retireEnemyView(scene,i);}
 assert.equal(scene.enemyViews.size,0);assert.equal(scene.enemyDeaths.length,ENEMY_DEATH_LIMIT);for(let i=0;i<50;i++)updateEnemyDeaths(scene,.02);assert.equal(scene.enemyDeaths.length,0);assert.equal(destroyed,30);
});
const random=()=>{let seed=243;return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);};
for(const zoneId of ['galleries','tracks','shaft59'])for(const weaponId of ['shotgun','smg'])test('V034B exact combat replay with rendered enemies '+zoneId+'/'+weaponId,()=>{
 const opts=()=>({zoneId,weaponId,rewardRandom:random(),talentRandom:random()}),a=new Run(random(),{},opts()),b=new BeforeRun(random(),{},opts()),states=new Map();
 for(let i=0;i<900;i++){const input=i%200<100?{x:0,y:0}:{x:Math.cos(i/130),y:Math.sin(i/130)};assert.deepEqual(a.update(1/60,input),b.update(1/60,input));for(const e of a.enemies){const s=enemySheet(e.bossId||e.kind,zoneId);if(s){if(!states.has(e.id))states.set(e.id,createEnemyAnimation(e));const saved=JSON.stringify(e);advanceEnemyAnimation(s,states.get(e.id),e,1/60);assert.equal(JSON.stringify(e),saved);}}assert.deepEqual({...a.player},{...b.player});assert.equal(JSON.stringify(a.enemies),JSON.stringify(b.enemies));assert.equal(JSON.stringify(a.projectiles.pool),JSON.stringify(b.projectiles.pool));}
});

