import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {WHITEHOT_PLATES as S,WhitehotPlatesView,preloadWhitehotPlates,registerWhitehotPlates,isWhitehotPlate,coldCentreTop,coldCentreBottom} from '../src/furnace-whitehot-plates-vfx.js';
import {beforeWhitehotVisual} from './whitehot-visual-delta.js';
import {Run} from '../src/run.js';import {createBoss} from '../src/bosses.js';
import {makeBossPlan} from '../src/forge/boss-patterns.js';import {forgeTouches} from '../src/forge/geometry.js';
import {drawForge} from '../src/forge/art.js';
const hash=b=>createHash('sha256').update(b).digest('hex'),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function mock(present=true){
 const frames=new Map(),source={width:S.width,height:S.height},texture={source:[source],has:k=>frames.has(k),get:k=>frames.get(k),add:(k,_,x,y,w,h)=>frames.set(k,{cutX:x,cutY:y,cutWidth:w,cutHeight:h,source,sourceIndex:0})};
 const textures={present,exists:k=>textures.present&&k===S.key,get:()=>texture},images=[],graphics=[],hooks=[];let count=0;
 const make=()=>{const calls=[],mask={destroy(){mask.dead=true;}},g={calls,mask};
  for(const name of ['setDepth','setMask','setVisible','setPosition','setRotation','setAlpha','fillStyle','fillRect','lineStyle','beginPath','moveTo','lineTo','arc','strokePath','lineBetween','strokeRect','fillCircle','fillPoints','strokePoints','destroy'])g[name]=(...args)=>{calls.push([name,...args]);return g;};
  g.clear=()=>{calls.length=0;return g;};g.createGeometryMask=()=>mask;graphics.push(g);count++;return g;
 };
 const scene={textures,reducedMotion:false,events:{once:(_,f)=>hooks.push(f)},make:{graphics:make},add:{graphics:make,image:()=>{
  const p={calls:[]};for(const name of ['setDepth','setMask','setVisible','setTexture','setOrigin','setDisplaySize','setCrop','setPosition','setRotation','setAlpha','destroy'])p[name]=(...args)=>{p[name+'Args']=args;p.calls.push([name,...args]);return p;};images.push(p);count++;return p;
 }}};
 return {scene,textures,texture,frames,images,graphics,g:make(),count:()=>count,shutdown:()=>hooks.forEach(f=>f())};
}
function fixture(){
 const r=new Run(()=>.3,{}, {zoneId:'forge',weaponId:'smg',rewardRandom:()=>.3,talentRandom:()=>.3});
 r.waveIndex=4;r.spawned=r.wave.total;r.weapon.cooldown=1e6;r.player.hp=r.player.maxHealth=1e6;r.player.x=225;r.player.y=500;
 const e=createBoss(1,'furnace',[225,270],1,{final:false,slot:0});e.warmup=0;e.hp=e.maxHealth*.24;r.enemies=[e];
 assert.equal(r.forge.director.select(e),'whiteFurnace');r.forge.director.start(e,'whiteFurnace');r.update(1/60);return r;
}
function advance(r,predicate){for(let i=0;i<1000&&!predicate();i++)r.update(1/60);assert.ok(predicate());}
const render=(v,f,r)=>{f.g.clear();v.begin(r);drawForge(f.g,r,null,null,null,v);};
const snap=r=>JSON.stringify({player:r.player,enemies:r.enemies,ground:r.forge.ground.items,shots:r.forge.shots.pool,elapsed:r.elapsed,history:r.forge.director.history,status:r.status});

test('D1C keeps every previous source byte except exact visual hooks, and every prior test assertion',()=>{
 const before=JSON.parse(fs.readFileSync('tests/whitehot-before-v038d1c.json'));
 for(const [p,h]of Object.entries(before))if(p.startsWith('src/')||p.endsWith('.test.js'))assert.equal(hash(p.startsWith('src/')?beforeWhitehotVisual(p.slice(4),fs.readFileSync(p)):fs.readFileSync(p)),h,p);
 const helper=fs.readFileSync('tests/furnace-turn-visual-delta.js','utf8').replace("import {beforeWhitehotVisual} from './whitehot-visual-delta.js';\n",'').replace(' bytes=beforeWhitehotVisual(file,bytes);\n','');
 assert.equal(hash(helper),before['tests/furnace-turn-visual-delta.js']);
 const allow=fs.readFileSync('tests/v038b3-authorized-files.js','utf8').replace('"furnace-whitehot-plates-vfx.js","assets/furnace-whitehot-plates-v038d1c/plates-a.svg",','');
 assert.equal(hash(allow),before['tests/v038b3-authorized-files.js']);
});
test('D1C exact two-wave rectangles, natural low-health times, static boss, final cone and recovery',()=>{
 const r=fixture(),e=r.enemies[0],p=e.plan;
 assert.deepEqual(p.events.slice(0,2).map(v=>v.points.map(h=>[h.x,h.y,h.w,h.h])),[[[225,178,394,124],[225,390,394,110],[225,606,394,120]],[[225,153,394,74],[225,350,394,110],[225,576,394,180]]]);
 assert.deepEqual(p.events.map(v=>v.at),[0,2.9,5.8]);near(p.events[0].warning,1.786);near(p.events[1].warning,1.786);near(p.events[2].warning,1.363);
 assert.deepEqual(p.events.map(v=>v.duration),[.65,.65,.6]);assert.equal(p.recovery,1.5);near(p.end,7.813);assert.equal(p.mobility.category,'ATTACK_STATIC');assert.equal(p.mobility.rate,0);
 const c=p.events[2].points[0];assert.equal(c.shape,'cone');assert.equal(c.radius,225);assert.equal(c.spread,.66);assert.equal(p.tracking,0);assert.equal(p.locked,true);
 assert.ok(r.forge.ground.items.every(h=>h.damage===.5));
});
test('D1C compact shared six-cell material and exact frame cuts; no external content, blur or arena bitmap',()=>{
 const args=[];preloadWhitehotPlates({load:{svg:(...a)=>args.push(a)}});
 assert.deepEqual(args,[[S.key,S.url,{width:788,height:540}]]);const f=mock();assert.ok(registerWhitehotPlates(f.textures));assert.equal(f.frames.size,6);
 assert.equal(S.activeFrames,4);assert.equal(S.loop,.8);assert.equal(S.width*S.height*4,1702080);
 const svg=fs.readFileSync(S.url,'utf8');assert.doesNotMatch(svg,/<image|<filter|<animate|<script|blur|gradient|href=/i);assert.ok(Buffer.byteLength(svg)<12000);
});
for(const defect of ['missing','size','frame','cut','source','texture','sourceIndex'])test('D1C '+defect+' falls back to exact old plates AND old safe-zone commands',()=>{
 const f=mock(),v=new WhitehotPlatesView(f.scene),r=fixture();
 if(defect==='missing')f.textures.present=false;if(defect==='size')f.texture.source[0].height=512;if(defect==='frame')f.frames.delete('1');
 if(defect==='cut')f.frames.get('2').cutY=179;if(defect==='source')f.frames.get('0').source={};if(defect==='texture')f.frames.get('3').texture={};if(defect==='sourceIndex')f.frames.get('4').sourceIndex=1;
 render(v,f,r);const old=mock();drawForge(old.g,r);assert.deepEqual(f.g.calls,old.g.calls);assert.equal(v.used,0);assert.equal(v.drawSafeZones(),false);
 assert.ok(f.images.every(p=>!p.setVisibleArgs[0]));assert.equal(v.base.calls.length,0);assert.equal(v.outline.calls.length,0);
});
for(const order of [1,2])test('D1C wave '+order+' exact plate footprint and crop, fixed border and undistorted thermal material',()=>{
 const r=fixture();advance(r,()=>r.forge.ground.items.some(h=>h.order===order&&h.active));
 const f=mock(),v=new WhitehotPlatesView(f.scene);render(v,f,r);assert.equal(v.used,3);
 for(let i=0;i<3;i++){
  const h=v.hazards[i],p=f.images[i];assert.deepEqual(p.setPositionArgs,[h.x,h.y]);assert.deepEqual(p.setDisplaySizeArgs,[394,180]);assert.deepEqual(p.setCropArgs,[4,(180-h.h)/2+4,386,h.h-8]);
  const [,cy,,ch]=p.setCropArgs;near(h.y-90+cy,h.y-h.h/2+4);near(h.y-90+cy+ch,h.y+h.h/2-4);
  assert.ok(v.base.calls.some(c=>c[0]==='fillRect'&&c[1]===28&&c[2]===h.y-h.h/2&&c[3]===394&&c[4]===h.h));
 }
 assert.ok(f.images.every(p=>p.setDepthArgs[0]<8));assert.ok(v.outline.calls.find(c=>c[0]==='setVisible')[1]);
});
for(const [order,band,raw,usable]of [[1,0,[240,335],[253,322]],[1,1,[445,546],[458,533]],[2,0,[190,295],[203,282]],[2,1,[405,486],[418,473]]])test(`D1C safe centre, upper/lower edges, left/right travel: wave ${order} band ${band+1}`,()=>{
 const r=fixture();advance(r,()=>r.forge.ground.items.some(h=>h.order===order&&h.active));
 const hs=r.forge.ground.items,a=hs[band],b=hs[band+1],r0=r.player.radius;
 assert.equal(r0,13);assert.deepEqual([a.y+a.h/2,b.y-b.h/2],raw);assert.deepEqual([coldCentreTop(a,r0),coldCentreBottom(b,r0)],usable);
 const hit=(x,y)=>hs.some(h=>forgeTouches(h,{x,y,radius:r0}));
 for(const x of [41,80,220,225,230,370,409])for(const y of [usable[0],(usable[0]+usable[1])/2,usable[1]])assert.equal(hit(x,y),false);
 for(const y of [usable[0]-.01,usable[1]+.01,raw[0]+9,raw[1]-9])assert.equal(hit(225,y),true);
 const f=mock(),v=new WhitehotPlatesView(f.scene);render(v,f,r);
 assert.ok(v.base.calls.some(c=>c[0]==='fillRect'&&c[1]===41&&c[2]===usable[0]&&c[3]===368&&c[4]===usable[1]-usable[0]));
 const outline=v.outline.calls.find(c=>c[0]==='strokeRect'&&c[2]===usable[0]+.5);assert.deepEqual(outline,['strokeRect',41.5,usable[0]+.5,367,usable[1]-usable[0]-1]);
});
test('D1C radius-dependent centre guide follows real collision and never copies the old four-unit inset',()=>{
 const r=fixture();r.player.radius=17;const f=mock(),v=new WhitehotPlatesView(f.scene);render(v,f,r);
 assert.ok(v.base.calls.some(c=>c[0]==='fillRect'&&c[1]===45&&c[2]===257&&c[4]===61));
 assert.equal(forgeTouches(v.hazards[0],{x:225,y:249,radius:13}),true);
});
test('D1C telegraph progression, active four-frame loop, reduced motion and immediate neutral extinction',()=>{
 const r=fixture(),f=mock(),v=new WhitehotPlatesView(f.scene);render(v,f,r);
 const firstAlpha=f.images[0].setAlphaArgs[0];assert.equal(f.images[0].setTextureArgs[1],'4');
 for(const h of r.forge.ground.items)h.warning=h.warningTotal*.2;
 render(v,f,r);assert.ok(f.images[0].setAlphaArgs[0]>firstAlpha);assert.ok(f.images[0].setAlphaArgs[0]<1);
 for(const [time,frame]of [[0,'0'],[.2,'1'],[.4,'2'],[.6,'3'],[.8,'0']]){
  for(const h of r.forge.ground.items){h.active=true;h.elapsed=time;}
  render(v,f,r);assert.ok(f.images.every(p=>p.setTextureArgs[1]===frame));assert.equal(f.images[0].setAlphaArgs[0],1);
 }
 f.scene.reducedMotion=true;render(v,f,r);assert.equal(f.images[0].setTextureArgs[1],'0');
 for(const h of r.forge.ground.items){h.active=false;h.cooling=.3;h.remaining=0;}
 render(v,f,r);assert.equal(f.images[0].setTextureArgs[1],'5');assert.equal(f.images[0].setAlphaArgs[0],.25);
 assert.equal(v.outline.calls.filter(c=>c[0]==='strokeRect').length,3);
});
test('D1C phase-independent cold geometry stays fixed across warning progress and active animation',()=>{
 const r=fixture(),f=mock(),v=new WhitehotPlatesView(f.scene);render(v,f,r);
 const extract=()=>v.base.calls.filter(c=>c[0]==='fillRect'&&c[1]===41);
 const a=extract();for(const h of r.forge.ground.items)h.warning*=.2;render(v,f,r);assert.deepEqual(extract(),a);
 for(const h of r.forge.ground.items){h.active=true;h.elapsed=.4;}render(v,f,r);assert.deepEqual(extract(),a);
 for(const h of r.forge.ground.items)h.elapsed=.6;render(v,f,r);assert.deepEqual(extract(),a);
});
test('D1C partial or malformed waves fail atomically',()=>{
 for(const mode of ['two','duplicate','owner','token','phase','order','height']){
  const r=fixture(),f=mock(),v=new WhitehotPlatesView(f.scene),hs=r.forge.ground.items;
  if(mode==='two')hs.pop();if(mode==='duplicate')hs.push({...hs[0]});if(mode==='owner')hs[1].owner=9;if(mode==='token')hs[1].attackToken++;
  if(mode==='phase')hs[1].active=true;if(mode==='order')hs[1].order=2;if(mode==='height')hs[2].h--;
  render(v,f,r);assert.equal(v.ready,false,mode);assert.equal(v.used,0);
 }
});
test('D1C rejects cone, other patterns, normal stoker plates, other worlds and final bosses',()=>{
 const r=fixture(),h=r.forge.ground.items[0];
 for(const patch of [{shape:'cone'},{planId:'sectors'},{planId:'furnaceTurn'},{planId:'whiteMarch'},{planId:'furnaceCone'},{planId:'forgePressure'},{dungeon:false},{heat:false},{style:'boiler'},{style:'stoker'},{x:224},{w:390},{done:true}])assert.equal(isWhitehotPlate(r,{...h,...patch}),false);
 r.enemies[0].final=true;assert.equal(isWhitehotPlate(r,h),false);r.enemies[0].final=false;r.world={id:'rift'};assert.equal(isWhitehotPlate(r,h),false);
});
test('D1C full real replay preserves both waves, order, intervals, damage, mobility and complete cone drawing',()=>{
 const a=fixture(),b=fixture(),f=mock(),v=new WhitehotPlatesView(f.scene),count=f.count(),pool=[...v.sprites],phases=new Set();
 let maximum=0,coneFrames=0,neutralGap=false,hadFirst=false;
 for(let i=0;i<580;i++){
  assert.deepEqual(a.update(1/60),b.update(1/60));const before=snap(a);render(v,f,a);assert.equal(snap(a),before);assert.equal(snap(a),snap(b));
  maximum=Math.max(maximum,v.used);
  if(v.ready){const h=v.hazards[0];phases.add(h.order+':'+(h.cooling?'cool':h.active?'active':'warning'));hadFirst=true;}
  else if(hadFirst&&!a.forge.ground.items.length&&a.enemies[0].plan?.index===1)neutralGap=true;
  if(a.forge.ground.items.some(h=>h.planId==='whiteFurnace'&&h.shape==='cone')){
   coneFrames++;const old=mock();drawForge(old.g,a);assert.deepEqual(f.g.calls,old.g.calls);assert.equal(v.used,0);assert.equal(v.base.calls.length,0);assert.equal(v.outline.calls.length,0);
  }
 }
 assert.equal(maximum,3);assert.ok(coneFrames>100&&neutralGap);assert.deepEqual([...phases],['1:warning','1:active','1:cool','2:warning','2:active','2:cool']);
 assert.equal(f.count(),count);assert.deepEqual(v.sprites,pool);
});
test('D1C cleanup on death, reset, texture removal, scene shutdown and late recovery is bounded',()=>{
 const r=fixture(),f=mock(),v=new WhitehotPlatesView(f.scene),pool=[...v.sprites];render(v,f,r);assert.equal(v.used,3);
 f.textures.present=false;render(v,f,r);assert.equal(v.used,0);f.textures.present=true;render(v,f,r);assert.equal(v.used,3);assert.deepEqual(v.sprites,pool);
 r.enemies[0].hp=0;r.forge.ground.update(0,r,[]);render(v,f,r);assert.equal(v.used,0);assert.ok(f.images.every(p=>!p.setVisibleArgs[0]));
 v.begin(new Run());assert.equal(v.ready,false);f.shutdown();v.destroy();assert.equal(v.sprites.length,0);assert.ok(v.mask.dead);
});
test('D1C phase-stable graphics and unchanged crop/frame are reused during warning updates',()=>{
 const r=fixture(),f=mock(),v=new WhitehotPlatesView(f.scene);render(v,f,r);
 const rects=v.base.calls.filter(c=>c[0]==='fillRect').length;
 for(let i=0;i<30;i++){for(const h of r.forge.ground.items)h.warning-=.01;render(v,f,r);}
 assert.equal(v.base.calls.filter(c=>c[0]==='fillRect').length,rects);
 assert.ok(f.images.every(p=>p.calls.filter(c=>c[0]==='setCrop').length===1));
});
