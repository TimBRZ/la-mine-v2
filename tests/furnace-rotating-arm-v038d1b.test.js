import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {FURNACE_ARM as S,FurnaceArmView,preloadFurnaceArm,registerFurnaceArm,isFurnaceArm} from '../src/furnace-rotating-arm-vfx.js';
import {Run} from '../src/run.js';
import {createBoss} from '../src/bosses.js';
import {makeBossPlan,makeComboPlans} from '../src/forge/boss-patterns.js';
import {forgeTouches} from '../src/forge/geometry.js';
import {drawForge} from '../src/forge/art.js';
import {beforeFurnaceTurnVisual} from './furnace-turn-visual-delta.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const hash=b=>createHash('sha256').update(b).digest('hex');
function mock(present=true){
 const frames=new Map(),source={width:S.width,height:S.height};
 const texture={source:[source],has:k=>frames.has(k),get:k=>frames.get(k),add:(k,_,x,y,w,h)=>frames.set(k,{cutX:x,cutY:y,cutWidth:w,cutHeight:h,source,sourceIndex:0})};
 const textures={present,exists:k=>textures.present&&k===S.key,get:()=>texture};
 const images=[],graphics=[],hooks=[];let allocations=0;
 const make=()=>{
  const calls=[],mask={destroy(){mask.dead=true;}};const g={calls,mask};
  for(const name of ['setDepth','setMask','setVisible','setPosition','setRotation','setAlpha','fillStyle','fillRect','lineStyle','beginPath','moveTo','lineTo','arc','strokePath','lineBetween','fillCircle','fillPoints','strokePoints','destroy'])g[name]=(...args)=>{calls.push([name,...args]);return g;};
  g.clear=()=>{calls.length=0;return g;};g.createGeometryMask=()=>mask;graphics.push(g);allocations++;return g;
 };
 const scene={textures,reducedMotion:false,events:{once:(_,f)=>hooks.push(f)},make:{graphics:make},add:{graphics:make,image:()=>{
  const p={};for(const name of ['setDepth','setMask','setVisible','setTexture','setOrigin','setDisplaySize','setPosition','setRotation','setAlpha','destroy'])p[name]=(...args)=>{p[name+'Args']=args;return p;};
  images.push(p);allocations++;return p;
 }}};
 return {scene,textures,texture,frames,images,graphics,g:make(),allocations:()=>allocations,shutdown:()=>hooks.forEach(f=>f())};
}
function fixture({triple=false,late=false,reverse=false}={}){
 const r=new Run(()=>.3,{}, {zoneId:'forge',weaponId:'smg',rewardRandom:()=>.3,talentRandom:()=>.3});
 r.waveIndex=triple?19:4;r.spawned=r.wave.total;r.weapon.cooldown=1e6;r.player.hp=r.player.maxHealth=1e6;
 r.player.x=225;r.player.y=500;
 r.enemies=(triple?['furnace','hammer','boiler']:['furnace']).map((id,i)=>createBoss(i+1,id,triple?[[110,210],[225,165],[340,210]][i]:[225,270],triple?.76:1,{final:triple,slot:i}));
 for(const e of r.enemies){e.warmup=0;if(late)e.hp=e.maxHealth*.49;}
 if(reverse)r.enemies[0].patternUses.furnaceTurn=1;
 r.tripleStartingHealth=r.enemies.reduce((a,e)=>a+e.maxHealth,0);
 r.forge.director.start(r.enemies[0],'furnaceTurn');r.update(1/60);return r;
}
const snapshot=r=>JSON.stringify({player:r.player,enemies:r.enemies,ground:r.forge.ground.items,shots:r.forge.shots.pool,elapsed:r.elapsed,history:r.forge.director.history,status:r.status});
const render=(v,f,r)=>{v.begin(r);drawForge(f.g,r,null,null,v);};

test('D1B preserves every previous source byte except exact presentation hooks and every existing test assertion',()=>{
 const before=JSON.parse(fs.readFileSync('tests/furnace-turn-before-v038d1b.json'));
 for(const [p,h]of Object.entries(before))if(p.startsWith('src/')||p.endsWith('.test.js'))assert.equal(hash(p.startsWith('src/')?beforeFurnaceTurnVisual(p.slice(4),fs.readFileSync(p)):fs.readFileSync(p)),h,p);
 const helper=fs.readFileSync('tests/rivet-impact-visual-delta.js','utf8').replace("import {beforeFurnaceTurnVisual} from './furnace-turn-visual-delta.js';\n",'').replace('bytes=beforeFurnaceTurnVisual(file,bytes);','');
 assert.equal(hash(helper),before['tests/rivet-impact-visual-delta.js']);
});
test('D1B versioned six-cell atlas loads at 2x resolution with one texture, 4 active frames and a 0.8s loop',()=>{
 const calls=[];preloadFurnaceArm({load:{svg:(...args)=>calls.push(args)}});
 assert.deepEqual(calls,[[S.key,S.url,{width:2124,height:64}]]);
 const f=mock();assert.ok(registerFurnaceArm(f.textures));assert.equal(f.frames.size,6);
 assert.equal(S.activeFrames,4);assert.equal(S.loop,.8);assert.equal(S.width*S.height*4,543744);
 const svg=fs.readFileSync(S.url,'utf8');
 assert.doesNotMatch(svg,/<image|<filter|<animate|<script|blur|gradient|href=/i);
 assert.equal((svg.match(/id="active-/g)||[]).length,4);
 assert.match(svg,/<clipPath id="capsule"><rect x="2" y="2" width="173" height="28" rx="14"/);
 assert.ok(Buffer.byteLength(svg)<10000);
});
test('D1B admitted gameplay retains 145 / 14 capsules, 0.42 spin, 1.4 warning, 2.5 active, 0.5 damage and opposition',()=>{
 const r=fixture(),[a,b]=r.forge.ground.items,e=r.enemies[0];
 assert.equal(a.length,145);assert.equal(a.width,14);assert.equal(a.duration,2.5);assert.equal(a.warningTotal,1.4);assert.equal(a.damage,.5);
 assert.equal(a.spin,.42);near(b.angle-a.angle,Math.PI);near(e.plan.mobility.rate,32.2);assert.equal(e.plan.recovery,1.1);
 const low=fixture({late:true,reverse:true});assert.equal(low.forge.ground.items[0].spin,-.42);near(low.forge.ground.items[0].warningTotal,1.316);assert.equal(low.enemies[0].plan.recovery,.95);
});
for(const defect of ['absent','size','frame','cut','source','texture','sourceIndex'])test('D1B '+defect+' uses the exact old procedural view for both arms',()=>{
 const f=mock(),v=new FurnaceArmView(f.scene),r=fixture();
 if(defect==='absent')f.textures.present=false;
 if(defect==='size')f.texture.source[0].width=1024;
 if(defect==='frame')f.frames.delete('2');
 if(defect==='cut')f.frames.get('0').cutWidth=352;
 if(defect==='source')f.frames.get('1').source={};
 if(defect==='texture')f.frames.get('3').texture={};
 if(defect==='sourceIndex')f.frames.get('4').sourceIndex=1;
 render(v,f,r);const legacy=mock();drawForge(legacy.g,r);
 assert.equal(v.ready,false);assert.deepEqual(f.g.calls,legacy.g.calls);
 assert.ok(f.images.every(p=>p.setVisibleArgs[0]===false));
 assert.equal(v.outline.calls.length,0);
});
for(const angle of [0,Math.PI/4,Math.PI/2,Math.PI,3*Math.PI/2,2*Math.PI])test('D1B complete capsule alignment at renderer angle '+angle,()=>{
 const r=fixture(),[a,b]=r.forge.ground.items,f=mock(),v=new FurnaceArmView(f.scene);
 a.angle=angle;b.angle=angle+Math.PI;a.active=b.active=true;
 render(v,f,r);assert.equal(v.used,2);assert.equal(f.images.length,2);
 for(let i=0;i<2;i++){
  const h=r.forge.ground.items[i],p=f.images[i];
  assert.deepEqual(p.setPositionArgs,[h.x,h.y]);assert.equal(p.setRotationArgs[0],h.angle);
  assert.deepEqual(p.setDisplaySizeArgs,[177,32]);assert.deepEqual(p.setOriginArgs,[16/177,.5]);
  // Frame coordinates (after 2x downscale): start 16, cap centre 161,
  // capsule tips 2 and 175. Compare those endpoints to the collision geometry.
  const origin=p.setOriginArgs[0]*p.setDisplaySizeArgs[0];
  near(2-origin,-14);near(161-origin,145);near(175-origin,159);
  const x=h.x+Math.cos(h.angle)*158.9,y=h.y+Math.sin(h.angle)*158.9;
  assert.equal(forgeTouches(h,{x,y,radius:0}),true);
  assert.equal(forgeTouches(h,{x:h.x+Math.cos(h.angle)*159.1,y:h.y+Math.sin(h.angle)*159.1,radius:0}),false);
 }
 const arcs=v.outline.calls.filter(c=>c[0]==='arc');assert.equal(arcs.length,4);
 near(arcs[1][3]+1.5/2,14);near(arcs[3][3]+1.5/2,14);
});
test('D1B center is continuously covered while the sides stay cold; no full disk or external glow',()=>{
 const r=fixture(),[a,b]=r.forge.ground.items;a.angle=0;b.angle=Math.PI;
 assert.ok([a,b].some(h=>forgeTouches(h,{x:a.x,y:a.y,radius:0})));
 for(const d of [-80,80])assert.ok([a,b].every(h=>!forgeTouches(h,{x:a.x,y:a.y+d,radius:13})));
 const f=mock(),v=new FurnaceArmView(f.scene);render(v,f,r);
 assert.equal(v.outline.calls.filter(c=>c[0]==='fillCircle'||c[0]==='fillPoints').length,0);
 assert.ok(f.images.every(p=>p.setDepthArgs[0]<8));assert.equal(S.outlineDepth,16);assert.ok(S.outlineDepth<20);
 assert.deepEqual(v.clip.calls.find(c=>c[0]==='fillRect'),['fillRect',28,116,394,550]);
 assert.ok(f.images.every(p=>p.setMaskArgs[0]===v.mask));
});
test('D1B animation changes only the inside frame; hazard clocks own warning, activation, cooling and reduced motion',()=>{
 const r=fixture(),f=mock(),v=new FurnaceArmView(f.scene);
 render(v,f,r);assert.ok(f.images.every(p=>p.setTextureArgs[1]==='4'));
 for(const [t,frame]of [[0,'0'],[.2,'1'],[.4,'2'],[.6,'3'],[.8,'0'],[2.4,'0']]){
  for(const h of r.forge.ground.items){h.active=true;h.elapsed=t;}
  render(v,f,r);assert.ok(f.images.every(p=>p.setTextureArgs[1]===frame));assert.ok(f.images.every(p=>p.setDisplaySizeArgs[0]===177&&p.setDisplaySizeArgs[1]===32));
 }
 f.scene.reducedMotion=true;for(const h of r.forge.ground.items)h.elapsed=.5;
 render(v,f,r);assert.ok(f.images.every(p=>p.setTextureArgs[1]==='0'));
 for(const h of r.forge.ground.items){h.active=false;h.cooling=.15;h.remaining=0;}
 render(v,f,r);assert.ok(f.images.every(p=>p.setTextureArgs[1]==='5'));near(f.images[0].setAlphaArgs[0],.275);
});
test('D1B tangential arrows reverse with signed gameplay spin and remain inside the actual capsule',()=>{
 const vectors=[];
 for(const reverse of [false,true]){
  const r=fixture({late:reverse,reverse}),f=mock(),v=new FurnaceArmView(f.scene),h=r.forge.ground.items[0];render(v,f,r);
  const lines=v.outline.calls.filter(c=>c[0]==='lineBetween');assert.equal(lines.length,6);
  const l=lines[0];vectors.push([l[3]-l[1],l[4]-l[2]]);
  for(const line of lines.slice(0,3))for(const offset of [1,3])assert.ok(forgeTouches(h,{x:h.x+Math.cos(h.angle)*line[offset]-Math.sin(h.angle)*line[offset+1],y:h.y+Math.sin(h.angle)*line[offset]+Math.cos(h.angle)*line[offset+1],radius:0}));
 }
 near(vectors[0][0],-vectors[1][0]);near(vectors[0][1],-vectors[1][1]);
});
test('D1B malformed pairs fail atomically, with no partial new arm',()=>{
 for(const mode of ['one','third','opposition','owner','centre','phase']){
  const r=fixture(),f=mock(),v=new FurnaceArmView(f.scene),hs=r.forge.ground.items;
  if(mode==='one')hs.pop();if(mode==='third')hs.push({...hs[0]});
  if(mode==='opposition')hs[1].angle+=.1;if(mode==='owner')hs[1].owner=99;if(mode==='centre')hs[1].x+=.1;if(mode==='phase')hs[1].active=true;
  render(v,f,r);assert.equal(v.ready,false,mode);assert.equal(v.used,0);assert.ok(f.images.every(p=>!p.setVisibleArgs[0]));
 }
});
test('D1B allowlist excludes other patterns, other bosses, normal enemies, foreign worlds and stale hazards',()=>{
 const r=fixture(),h=r.forge.ground.items[0];assert.ok(isFurnaceArm(r,h));
 for(const patch of [{planId:'sectors'},{planId:'furnaceCone'},{planId:'whiteMarch'},{planId:'whiteFurnace'},{planId:'rotatingPurge'},{style:'boiler'},{style:'hammer'},{dungeon:false},{heat:false},{shape:'line'},{length:160},{width:17},{spin:.4},{x:NaN},{owner:99},{done:true}])assert.equal(isFurnaceArm(r,{...h,...patch}),false,JSON.stringify(patch));
 r.world={id:'rift'};assert.equal(isFurnaceArm(r,h),false);
 r.world={id:'forge'};r.enemies[0].hp=0;assert.equal(isFurnaceArm(r,h),false);
});
test('D1B every other furnace pattern and every combo retains exact procedural drawing',()=>{
 const r=fixture({triple:true}),f=mock(),v=new FurnaceArmView(f.scene);
 for(const id of ['sectors','furnaceCone','whiteMarch','whiteFurnace','forgePressure','whiteHammer','pressureCadence']){
  const plans=id.includes('Pressure')||id==='whiteHammer'||id==='pressureCadence'?makeComboPlans(id,r.enemies,r.player):[[r.enemies[0],makeBossPlan(r.enemies[0],id,r.player)]];
  r.forge.ground.items=plans.flatMap(([e,p])=>p.events.flatMap(ev=>ev.points.map(h=>({...h,owner:e.id,planId:id,dungeon:true,heat:ev.heat,warning:ev.warning,remaining:ev.duration,active:false,cooling:0}))));
  f.g.clear();render(v,f,r);const old=mock();drawForge(old.g,r);assert.deepEqual(f.g.calls,old.g.calls,id);assert.equal(v.used,0);
 }
});
for(const triple of [false,true])for(const reverse of [false,true])test(`D1B real replay, moving origin and no renderer mutation: triple=${triple} reverse=${reverse}`,()=>{
 const a=fixture({triple,late:reverse,reverse}),b=fixture({triple,late:reverse,reverse}),f=mock(),v=new FurnaceArmView(f.scene);
 let seen=false,moved=false,previous=null,active=false,cooling=false;const pool=[...v.sprites],allocations=f.allocations();
 for(let i=0;i<480;i++){
  const input={x:i>120?.3:0,y:0};assert.deepEqual(a.update(1/60,input),b.update(1/60,input));
  const before=snapshot(a);f.g.clear();render(v,f,a);assert.equal(snapshot(a),before);assert.equal(snapshot(a),snapshot(b));
  if(v.ready){
   seen=true;const h=v.first,p=f.images[0];active||=h.active;cooling||=h.cooling>0;
   if(previous&&h.active&&previous.active&&h.attackToken===previous.token)near(h.angle-previous.angle,h.spin/60);
   if(previous&&h.x!==previous.x||previous&&h.y!==previous.y)moved=true;
   previous={x:h.x,y:h.y,angle:h.angle,active:h.active,token:h.attackToken};
   assert.deepEqual(p.setPositionArgs,[h.x,h.y]);near(p.setRotationArgs[0],h.angle);
   if(!h.cooling){near(h.x,a.enemies[0].x);near(h.y,a.enemies[0].y);}
  }
  assert.ok(a.forge.ground.items.length<=5);assert.ok(a.forge.majorOwners().size<=2);
 }
 assert.ok(seen&&moved&&active&&cooling);assert.deepEqual(v.sprites,pool);assert.equal(f.allocations(),allocations);
});
test('D1B cleanup on death, reset, foreign zone, missing texture, and shutdown is bounded and idempotent',()=>{
 const f=mock(),v=new FurnaceArmView(f.scene),r=fixture();render(v,f,r);assert.equal(v.used,2);
 r.enemies[0].hp=0;r.forge.ground.update(0,r,[]);render(v,f,r);assert.equal(v.used,0);assert.ok(f.images.every(p=>!p.setVisibleArgs[0]));
 render(v,f,fixture());assert.equal(v.used,2);v.begin(new Run());assert.ok(f.images.every(p=>!p.setVisibleArgs[0]));
 f.shutdown();v.destroy();assert.equal(v.sprites.length,0);assert.ok(f.images.every(p=>p.destroyArgs));assert.ok(v.mask.dead);
});
test('D1B successful late loading recovers from old fallback without recreating its pool',()=>{
 const f=mock(false),v=new FurnaceArmView(f.scene),r=fixture(),pool=[...v.sprites];render(v,f,r);assert.equal(v.ready,false);
 f.textures.present=true;render(v,f,r);assert.equal(v.ready,true);assert.deepEqual(v.sprites,pool);assert.equal(v.used,2);
});
test('D1B local outline commands are cached across moving frames, invalidated only by phase or direction',()=>{
 const f=mock(),v=new FurnaceArmView(f.scene),r=fixture();render(v,f,r);
 const arcs=()=>v.outline.calls.filter(c=>c[0]==='arc').length;
 assert.equal(arcs(),4);
 for(let i=0;i<60;i++){
  for(const h of r.forge.ground.items){h.x+=.3;h.y+=.2;h.angle+=.007;}
  render(v,f,r);
  assert.equal(arcs(),4);
  assert.deepEqual(v.outline.calls.filter(c=>c[0]==='setPosition').at(-1),['setPosition',v.first.x,v.first.y]);
  assert.deepEqual(v.outline.calls.filter(c=>c[0]==='setRotation').at(-1),['setRotation',v.first.angle]);
 }
 for(const h of r.forge.ground.items)h.active=true;
 render(v,f,r);assert.equal(arcs(),4);assert.equal(v.outlineState,1);
});
