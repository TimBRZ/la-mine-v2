import {historicalSource} from './instant-fire-compat.js';
import {v036bChanged} from './v036b-authorized-files.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import{createHash}from'node:crypto';
import{BURSTER_KEY,BURSTER_IDLE_KEY,preloadBursterVisual}from'../src/burster-visual.js';
import{BURSTER_SVG,BURSTER_IDLE_SVG,BURSTER_SHA256}from'../src/burster-bonbonne-art-v1.js';
import{RIFT_SHEETS,createEnemyAnimation,advanceRiftAnimation,registerEnemyFrames,applyEnemyAnimation,retireEnemyView,updateEnemyDeaths}from'../src/rift-animation.js';
import{loadTestBurster}from'./burster-texture-fixture.js';import{makeEnemyView,updateEnemyView}from'../src/enemies/view.js';import{createEnemy}from'../src/enemies/registry.js';import{Run}from'../src/run.js';
import{RIFT_SHEETS as oldCatalog}from'../production-eclateur-bonbonne/before/src/rift-sprite-catalog.js';
const s=RIFT_SHEETS.burster,hash=b=>createHash('sha256').update(b).digest('hex');
function textures(){const t={map:new Map(),exists(k){return this.map.has(k)},get(k){return this.map.get(k)}};loadTestBurster(t,{idle:true});registerEnemyFrames(t);return t;}
function item(key){const b={texture:{key},frame:{name:0},visible:true,x:0,y:0};for(const m of ['setAlpha','setOrigin','setDisplaySize','setPosition','setFlipX','setRotation','setScale','setTint','clearTint','setY','setText','setStrokeStyle','setDepth'])b[m]=()=>b;b.setTexture=(key,frame)=>{b.texture={key};b.frame={name:frame};return b;};b.setVisible=v=>{b.visible=v;return b;};b.destroy=()=>{b.destroyed=true;};return b;}
function scene(t=textures()){return {textures:t,run:{world:{id:'rift'}},add:new Proxy({},{get:()=> (_x,_y,key)=>item(key)}),enemyViews:new Map()};}
test('BOTTLE distinct versioned source, key and embedded image identify only the approved master',()=>{
 assert.equal(s.master,'v035a-eclateur-bonbonne-final/master/eclateur-bonbonne.svg');assert.equal(hash(fs.readFileSync(s.master)),s.masterSha256);assert.match(s.url,/burster-bonbonne-v1\.svg$/);assert.notEqual(s.key,oldCatalog.burster.key);assert.equal(BURSTER_KEY,s.key);assert.ok(s.key.endsWith(BURSTER_SHA256.slice(0,8)));assert.equal(hash(BURSTER_SVG),BURSTER_SHA256);assert.equal(BURSTER_SVG,fs.readFileSync(s.url.slice(2),'utf8'));
 const urls=[];preloadBursterVisual({textures:{exists:()=>false},load:{once(){},svg:(k,u)=>urls.push([k,u])}});assert.deepEqual(urls.map(x=>x[0]),[BURSTER_KEY,BURSTER_IDLE_KEY]);assert.ok(urls.every(x=>x[1].startsWith('data:image/svg+xml;base64,')));assert.ok(!BURSTER_SVG.includes('hydraulique'));
});
test('BOTTLE 20 bounded frames, stable cells and original collision-size presentation',()=>{
 assert.equal(s.frames,20);assert.deepEqual([s.width,s.height,s.cell],[384,256,64]);assert.deepEqual([s.displayWidth,s.displayHeight,s.originY],[48,48,.5]);assert.equal(s.textureBytes+64*64*4,409600);assert.equal((BURSTER_SVG.match(/viewBox="180 155 410 470"/g)||[]).length,20);assert.ok(BURSTER_IDLE_SVG.includes('viewBox="180 155 410 470"'));assert.doesNotMatch(BURSTER_SVG,/<(?:image|script|animate|filter)\b/);
});
test('BOTTLE five progressive pressure frames follow real telegraph without changing the actor',()=>{
 const e=createEnemy('burster',1,225,300),a=createEnemyAnimation(e);e.phase='warning';e.pattern='blast';const got=[];
 for(const time of [1.25,.99,.74,.49,.01]){e.phaseTime=time;const before=JSON.stringify(e);advanceRiftAnimation(s,a,e,.016);got.push(a.frame);assert.equal(JSON.stringify(e),before);}assert.deepEqual(got,[4,5,6,7,8]);
});
test('BOTTLE idle move pressure attack recovery hit death use only their mapped frames',()=>{
 const e=createEnemy('burster',1,225,300),a=createEnemyAnimation(e);const states=[];const tick=()=>{advanceRiftAnimation(s,a,e,.02);states.push(a.state);assert.ok(a.frame>=0&&a.frame<20);};tick();e.x++;tick();e.phase='warning';e.phaseTime=1.25;tick();e.phase='recovery';tick();for(let i=0;i<20;i++)advanceRiftAnimation(s,a,e,.02);tick();e.phase='positioning';e.flash=.1;tick();e.dead=true;tick();assert.deepEqual(states,['idle','move','prepare','attack','recovery','hit','death']);
});
test('BOTTLE partial sheet failure uses modern neutral or independent bottle, never archived keys',()=>{
 const t=textures(),sc=scene(t),e=createEnemy('burster',1,225,300),v=makeEnemyView(sc,e);e.phase='warning';e.phaseTime=1.25;t.get(s.key).get(4).cutWidth=1;updateEnemyView(v,e,false,.01);assert.equal(v.body.texture.key,s.key);assert.equal(v.body.frame.name,0);t.map.delete(s.key);updateEnemyView(v,e,false,.01);assert.equal(v.body.texture.key,BURSTER_IDLE_KEY);t.map.delete(BURSTER_IDLE_KEY);updateEnemyView(v,e,false,.01);assert.equal(v.body.visible,false);
});
test('BOTTLE an old cached hydraulic texture under the new key is rejected at source identity',()=>{
 const t=textures(),foreign={...t.get(s.key),getSourceImage:()=>({width:384,height:256})};t.map.set(s.key,foreign);const sc=scene(t),e=createEnemy('burster',1,225,300),v=makeEnemyView(sc,e);updateEnemyView(v,e,false,.01);assert.equal(v.body.texture.key,BURSTER_IDLE_KEY);assert.notEqual(v.body.texture.key,oldCatalog.burster.key);
});
test('BOTTLE 300 appearances and all ordinary transitions never select the old skin',()=>{
 const sc=scene();for(let i=0;i<300;i++){const e=createEnemy('burster',i,225,300),v=makeEnemyView(sc,e);assert.equal(v.body.texture.key,s.key);for(const phase of ['positioning','warning','recovery','positioning']){e.phase=phase;e.phaseTime=1.25;for(let k=0;k<20;k++){updateEnemyView(v,e,false,.02);assert.equal(v.body.texture.key,s.key);assert.equal(v.body.visible,true);}}v.container.destroy();}
});
test('BOTTLE death visual cleanup is bounded and never owns a live gameplay actor',()=>{
 const sc=scene();for(let i=0;i<20;i++){const e=createEnemy('burster',i,225,300),v=makeEnemyView(sc,e);sc.enemyViews.set(i,v);retireEnemyView(sc,i);}assert.equal(sc.enemyViews.size,0);assert.equal(sc.enemyDeaths.length,12);for(let i=0;i<30;i++)updateEnemyDeaths(sc,.02);assert.equal(sc.enemyDeaths.length,0);
});
test('BOTTLE gameplay attack and death burst run identically with or without visual ticks',()=>{
 const a=new Run(()=>.4,{}, {zoneId:'rift'}),b=new Run(()=>.4,{}, {zoneId:'rift'});for(const r of [a,b]){r.enemies=[createEnemy('burster',1,225,300)];r.enemies[0].warmup=0;r.player.x=225;r.player.y=370;}
 const visual=createEnemyAnimation(a.enemies[0]);let sawGround=false;for(let i=0;i<220;i++){for(const r of [a,b]){r.rift.updateActor(r.enemies[0],1/60,[],{});r.rift.ground.update(1/60,r,[]);}if(i%3===0)advanceRiftAnimation(s,visual,a.enemies[0],.05);assert.deepEqual(a.enemies,b.enemies);assert.deepEqual(a.rift.ground.items,b.rift.ground.items);sawGround ||= a.rift.ground.items.some(g=>g.active);}
 assert.ok(sawGround);for(const r of [a,b]){r.enemies[0].hp=0;r.rift.deaths([{type:'kill',id:1}]);}let peak=0;for(let i=0;i<72;i++){for(const r of [a,b])r.rift.shots.update(1/60,r.player,{...r.player},()=>{});advanceRiftAnimation(s,visual,{...a.enemies[0],dead:true},.016);peak=Math.max(peak,a.rift.shots.pool.filter(p=>p.active).length);assert.deepEqual(a.rift.shots.pool,b.rift.shots.pool);assert.deepEqual(a.rift.shots.bursts,b.rift.shots.bursts);}assert.equal(peak,6);assert.equal(a.enemies[0].radius,19);
});
test('BOTTLE every previous gameplay file, old art, approved master and five other sheets is byte-identical',()=>{
 const before=JSON.parse(historicalSource('production-eclateur-bonbonne/before-hashes.json'));for(const r of before.filter(r=>r.file.startsWith('src/')&&!v036bChanged(r.file)&&!['src/rift-sprite-catalog.js','src/burster-visual.js'].includes(r.file)))assert.equal(hash(historicalSource(r.file)),r.sha256,r.file);for(const id of ['crawler','spitter','splitter','blower','core'])assert.deepEqual(RIFT_SHEETS[id],oldCatalog[id]);assert.equal(hash(historicalSource(s.master)),s.masterSha256);
});
