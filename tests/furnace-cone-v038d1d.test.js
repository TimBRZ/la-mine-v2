import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {FURNACE_CONE as S,FurnaceConeView,preloadFurnaceCone,registerFurnaceCone,isFurnaceCone} from '../src/furnace-cone-vfx.js';
import {beforeConeVisual} from './cone-visual-delta.js';
import {mock} from './cone-mock-v038d1d.js';
import {Run} from '../src/run.js';import {createBoss} from '../src/bosses.js';
import {forgeTouches} from '../src/forge/geometry.js';import {drawForge} from '../src/forge/art.js';
const hash=b=>createHash('sha256').update(b).digest('hex'),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function fixture(triple=false,late=false){
 const r=new Run(()=>.3,{}, {zoneId:'forge',weaponId:'smg',rewardRandom:()=>.3,talentRandom:()=>.3});
 r.waveIndex=triple?19:4;r.spawned=r.wave.total;r.weapon.cooldown=1e6;r.player.hp=r.player.maxHealth=1e6;r.player.x=225;r.player.y=500;
 r.enemies=(triple?['furnace','hammer','boiler']:['furnace']).map((b,i)=>createBoss(i+1,b,triple?[[110,210],[225,165],[340,210]][i]:[225,270],triple?.76:1,{final:triple,slot:i}));
 for(const e of r.enemies){e.warmup=0;if(late)e.hp=e.maxHealth*.49;}
 r.tripleStartingHealth=r.enemies.reduce((s,e)=>s+e.maxHealth,0);
 r.forge.director.start(r.enemies[0],'furnaceCone');r.update(1/60);return r;
}
const hazard=r=>r.forge.ground.items.find(h=>h.planId==='furnaceCone');
function advance(r,predicate){for(let i=0;i<700&&!predicate();i++)r.update(1/60);assert.ok(predicate());}
const render=(v,f,r)=>{f.g.clear();v.begin(r);drawForge(f.g,r,null,null,null,null,v);};
const snap=r=>JSON.stringify({player:r.player,enemies:r.enemies,ground:r.forge.ground.items,shots:r.forge.shots.pool,elapsed:r.elapsed,history:r.forge.director.history,status:r.status});
test('D1D preserves every earlier source byte except three exact hooks and every older test assertion',()=>{
 const before=JSON.parse(fs.readFileSync('tests/cone-before-v038d1d.json'));
 for(const [p,h]of Object.entries(before))if(p.startsWith('src/')||p.endsWith('.test.js'))assert.equal(hash(p.startsWith('src/')?beforeConeVisual(p.slice(4),fs.readFileSync(p)):fs.readFileSync(p)),h,p);
 const adapter=fs.readFileSync('tests/whitehot-visual-delta.js','utf8').replace("import {beforeConeVisual} from './cone-visual-delta.js';\n",'').replace('\n bytes=beforeConeVisual(file,bytes);','');
 assert.equal(hash(adapter),before['tests/whitehot-visual-delta.js']);
 for(const p of ['tests/furnace-turn-visual-delta.js','tests/v038b3-authorized-files.js'])assert.equal(hash(fs.readFileSync(p)),before[p]);
});
test('D1D atlas loads with six exact tight frame cuts and 1545600 RGBA bytes',()=>{
 const args=[];preloadFurnaceCone({load:{image:(...a)=>args.push(a)}});assert.deepEqual(args,[[S.key,S.url]]);
 const f=mock();assert.ok(registerFurnaceCone(f.textures));assert.equal(f.frames.size,6);assert.equal(S.width*S.height*4,1545600);
 const png=fs.readFileSync(S.url);assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),690);assert.equal(png.readUInt32BE(20),560);assert.ok(png.length<700000);
});
for(const defect of ['missing','size','frame','cut','source','texture','sourceIndex'])test('D1D '+defect+' preserves the exact old procedural fallback',()=>{
 const f=mock(),v=new FurnaceConeView(f.scene),r=fixture();
 if(defect==='missing')f.textures.present=false;if(defect==='size')f.texture.source[0].height=512;if(defect==='frame')f.frames.delete('1');
 if(defect==='cut')f.frames.get('2').cutY=179;if(defect==='source')f.frames.get('0').source={};if(defect==='texture')f.frames.get('3').texture={};if(defect==='sourceIndex')f.frames.get('4').sourceIndex=1;
 render(v,f,r);const old=mock();drawForge(old.g,r);assert.deepEqual(f.g.calls,old.g.calls);assert.equal(v.used,0);assert.equal(v.sprite.setVisibleArgs[0],false);
});
for(const late of [false,true])test('D1D exact original geometry, timings, damage and mobility '+(late?'low HP':'high HP'),()=>{
 const r=fixture(false,late),e=r.enemies[0],p=e.plan,h=hazard(r);
 assert.equal(h.radius,225);assert.equal(h.spread,.66);near(h.spread*2*180/Math.PI,75.63042895726866);
 near(p.events[0].warning,late?1.316:1.4);assert.equal(p.events[0].duration,.65);assert.equal(p.tracking,.35);near(p.end,late?2.016:2.1);
 assert.equal(p.recovery,late?.95:1.1);assert.equal(h.damage,.5);assert.equal(p.mobility.category,'ATTACK_LOCKED_DIRECTION');assert.equal(p.mobility.rate,32.199999999999996);
});
test('D1D bounded initial tracking then direction lock while the origin keeps following the moving boss',()=>{
 const r=fixture(),e=r.enemies[0],h=hazard(r),a=h.angle,f=mock(),v=new FurnaceConeView(f.scene);
 r.player.x=400;r.player.y=300;
 for(let i=0;i<10;i++){const old=h.angle;r.update(1/60);assert.ok(Math.abs(h.angle-old)<=.65/60+1e-9);render(v,f,r);near(v.sprite.setRotationArgs[0],h.angle);near(v.sprite.setPositionArgs[0],h.x);}
 assert.notEqual(h.angle,a);assert.equal(e.plan.locked,false);advance(r,()=>e.plan.locked);near(e.plan.time,.35);
 const locked=h.angle,x=h.x,y=h.y;r.player.x=40;r.player.y=600;
 for(let i=0;i<20;i++){r.update(1/60);near(h.angle,locked);near(h.x,e.x);near(h.y,e.y);render(v,f,r);near(v.sprite.setRotationArgs[0],locked);}
 assert.ok(Math.hypot(h.x-x,h.y-y)>1);
});
test('D1D telegraph, active frames and cooling share the same origin, radius, opening and display scale',()=>{
 const r=fixture(),h=hazard(r),f=mock(),v=new FurnaceConeView(f.scene);render(v,f,r);
 const initial=v.sprite.setAlphaArgs[0];assert.equal(v.sprite.setTextureArgs[1],'4');
 h.warning=h.warningTotal*.1;render(v,f,r);assert.ok(v.sprite.setAlphaArgs[0]>initial);assert.ok(v.sprite.setAlphaArgs[0]<.71);
 for(const [time,frame]of [[0,'0'],[.2,'1'],[.4,'2'],[.6,'3'],[.8,'0']]){
  h.active=true;h.elapsed=time;render(v,f,r);assert.equal(v.sprite.setTextureArgs[1],frame);
  assert.deepEqual(v.sprite.setOriginArgs,[2/230,.5]);assert.deepEqual(v.sprite.setDisplaySizeArgs,[230,280]);assert.deepEqual(v.sprite.setPositionArgs,[h.x,h.y]);
 }
 f.scene.reducedMotion=true;render(v,f,r);assert.equal(v.sprite.setTextureArgs[1],'0');
 h.active=false;h.cooling=.3;h.remaining=0;render(v,f,r);assert.equal(v.sprite.setTextureArgs[1],'5');assert.equal(v.sprite.setAlphaArgs[0],.3);
});
test('D1D continuous inset outline reaches radius 225 without protruding beyond either ray',()=>{
 const r=fixture(),h=hazard(r),f=mock(),v=new FurnaceConeView(f.scene);h.active=true;render(v,f,r);
 const c=v.outline.calls,a=c.find(c=>c[0]==='arc'),m=c.find(c=>c[0]==='moveTo');
 near(a[3]+.6,225);near(m[1]*Math.sin(.66),.6);
 for(let i=0;i<=100;i++){const angle=a[4]+(a[5]-a[4])*i/100;assert.ok(a[3]<=225);assert.ok(Math.abs(angle)<.66);}
 assert.equal(v.sprite.setDepthArgs[0],7.9);assert.equal(v.outline.setDepthArgs[0],16);
 assert.ok(c.some(c=>c[0]==='fillPoints'));assert.ok(c.some(c=>c[0]==='strokePath'));
});
test('D1D side and terminal edges use original hero-radius collision without inventing safe space',()=>{
 const r=fixture(),h=hazard(r),d=125,rad=r.player.radius;
 const at=(distance,angle)=>forgeTouches(h,{x:h.x+distance*Math.cos(angle),y:h.y+distance*Math.sin(angle),radius:rad});
 assert.equal(at(d,h.angle),true);assert.equal(at(d,h.angle+.66),true);
 assert.equal(at(d,h.angle+.66+Math.asin(rad/d)+.001),false);
 assert.equal(at(225,h.angle),true);assert.equal(at(238.001,h.angle),false);
});
for(const pattern of ['furnaceTurn','whiteFurnace','sectors','whiteMarch'])test('D1D never intercepts '+pattern+' or changes its procedural commands',()=>{
 const r=fixture(),h=hazard(r);h.planId=pattern;const f=mock(),v=new FurnaceConeView(f.scene);render(v,f,r);const old=mock();drawForge(old.g,r);assert.deepEqual(f.g.calls,old.g.calls);assert.equal(v.used,0);
});
test('D1D malformed geometry, dead/foreign owner and duplicate cones fail atomically',()=>{
 for(const mutate of [r=>hazard(r).radius++,r=>hazard(r).spread+=.001,r=>hazard(r).x=NaN,r=>r.enemies[0].hp=0,r=>r.enemies[0].bossId='hammer',r=>r.forge.ground.items.push({...hazard(r)})]){
  const r=fixture(),f=mock(),v=new FurnaceConeView(f.scene);mutate(r);v.begin(r);assert.equal(v.ready,false);
 }
});
for(const triple of [false,true])test('D1D full '+(triple?'triple Zone 6':'solo')+' replay is observational, fixed-pool and cleans up',()=>{
 const r=fixture(triple),control=fixture(triple),f=mock(),v=new FurnaceConeView(f.scene),count=f.count();let max=0,active=false,cool=false;
 for(let i=0;i<300;i++){
  r.update(1/60);control.update(1/60);const before=snap(r);render(v,f,r);assert.equal(snap(r),before);assert.equal(snap(r),snap(control));
  max=Math.max(max,v.used);active||=!!hazard(r)?.active;cool||=!!hazard(r)?.cooling;
 }
 assert.equal(max,1);assert.ok(active);assert.ok(cool);assert.equal(f.count(),count);assert.equal(f.images.length,1);
});
test('D1D cached outline is stable within a phase and cleanup is idempotent on shutdown or texture loss',()=>{
 const r=fixture(),f=mock(),v=new FurnaceConeView(f.scene);render(v,f,r);
 const path=v.outline.calls.filter(c=>['arc','lineTo','strokePath'].includes(c[0]));
 for(let i=0;i<60;i++)render(v,f,r);
 assert.deepEqual(v.outline.calls.filter(c=>['arc','lineTo','strokePath'].includes(c[0])),path);
 f.textures.present=false;render(v,f,r);assert.equal(v.used,0);assert.equal(v.sprite.setVisibleArgs[0],false);
 f.textures.present=true;render(v,f,r);assert.equal(v.used,1);
 r.forge.ground.items.length=0;render(v,f,r);assert.equal(v.used,0);
 f.shutdown();v.destroy();assert.equal(v.destroyed,true);assert.equal(v.hazard,null);assert.equal(v.texture,null);assert.equal(v.mask.dead,true);
});
