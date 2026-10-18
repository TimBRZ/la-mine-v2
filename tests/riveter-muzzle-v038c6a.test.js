import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {getRiveterMuzzle,faceRiveterShot,RiveterMuzzleView} from '../src/riveter-muzzle.js';
import {FORGE_SHEETS,advanceForgeAnimation,createEnemyAnimation} from '../src/forge-animation.js';
import {ENEMY_RIVET,EnemyRivetView} from '../src/enemy-rivet-vfx.js';
import {ForgeSpriteVfx} from '../src/forge-sprite-vfx.js';
import {Run} from '../src/run.js';import {createEnemy} from '../src/enemies/registry.js';
import {projectileMuzzleClear,noteProjectileEmission} from '../src/projectile-attacks.js';
import {beforeRiveterMuzzleVisual} from './riveter-muzzle-visual-delta.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function body(frame=17,flip=false){return {texture:{key:FORGE_SHEETS.riveter.key},frame:{name:String(frame)},flipX:flip,displayWidth:52,displayHeight:52,x:0,y:0,rotation:0,visible:true};}
function run(wave=11,n=1){const r=new Run(()=>.3,{}, {zoneId:'forge',rewardRandom:()=>.3,talentRandom:()=>.3});r.waveIndex=wave-1;r.spawned=r.wave.total;r.weapon.cooldown=1e6;r.player.hp=r.player.maxHealth=1e6;r.forge.ground.until=1e6;r.enemies=Array.from({length:n},(_,i)=>createEnemy('riveter',i+1,100+i*70,260));for(const e of r.enemies){e.warmup=0;e.phaseTime=0;}r.player.x=225;r.player.y=550;return r;}
function mock(){const frames=new Map(),t={source:[{width:120,height:24}],has:k=>frames.has(k),get:k=>frames.get(k),add:(k,_,x,y,w,h)=>frames.set(k,{cutX:x,cutY:y,cutWidth:w,cutHeight:h})};const lines=[],images=[];const scene={enemyViews:new Map(),textures:{exists:()=>true,get:()=>t},add:{image(){const p={};for(const m of ['setDepth','setVisible','setTexture','setOrigin','setDisplaySize','setPosition','setRotation'])p[m]=(...a)=>{p[m+'Args']=a;return p;};images.push(p);return p;},graphics(){const g={};for(const m of ['setDepth','clear','fillStyle','fillCircle','lineStyle'])g[m]=()=>g;g.lineBetween=(...a)=>{lines.push(a);return g;};return g;}}};return {scene,lines,images,frames,t};}
function display(r,f,v,fx,states=new Map()){
 for(const e of r.enemies){let a=states.get(e.id);if(!a){a=createEnemyAnimation(e);states.set(e.id,a);}const p=advanceForgeAnimation(FORGE_SHEETS.riveter,a,e,1/60);f.scene.enemyViews.set(e.id,{body:body(p.frame,p.flip)});}
 fx.update(r);v.begin(r);for(const b of r.hostileProjectiles.pool)if(b.active)v.draw(b,'forge');return states;
}
const hash=b=>createHash('sha256').update(b).digest('hex');
test('C6A byte lock: gameplay, all assets, anti-flip and every existing test preserved',()=>{
 const before=JSON.parse(fs.readFileSync('tests/riveter-before-hashes-v038c6a.json'));
 for(const [p,h]of Object.entries(before))if(p.startsWith('src/')||p.endsWith('.test.js'))assert.equal(hash(p.startsWith('src/')?beforeRiveterMuzzleVisual(p.slice(4),fs.readFileSync(p)):fs.readFileSync(p)),h,p);
});
for(let direction=0;direction<8;direction++)test('C6A common mouth, real fan angles and sparks in direction '+direction,()=>{
 const r=run(),e=r.enemies[0],angle=direction*Math.PI/4;e.x=225;e.y=390;e.angle=angle;r.player.x=e.x+Math.cos(angle)*140;r.player.y=e.y+Math.sin(angle)*140;
 const f=mock(),v=new EnemyRivetView(f.scene),fx=new ForgeSpriteVfx(f.scene),a=createEnemyAnimation(e);a.facing=Math.cos(angle)>=0;
 const states=new Map([[e.id,a]]);r.update(1/60);const before=JSON.stringify(r.hostileProjectiles.pool);display(r,f,v,fx,states);
 const point={};assert.ok(getRiveterMuzzle(point,e,f.scene.enemyViews.get(e.id).body));const shots=r.hostileProjectiles.pool.filter(b=>b.active);assert.equal(shots.length,3);assert.equal(f.lines.length,2);
 for(const b of shots){const p=v.sprites[b.id];near(p.setPositionArgs[0],point.x);near(p.setPositionArgs[1],point.y);near(p.setRotationArgs[0],b.angle);assert.deepEqual(p.setDisplaySizeArgs,[26,15.6]);}
 for(const l of f.lines){near(l[0],point.x);near(l[1],point.y);const dx=l[2]-l[0],dy=l[3]-l[1];near(dx*Math.cos(point.angle)+dy*Math.sin(point.angle),5);near(Math.abs(-dx*Math.sin(point.angle)+dy*Math.cos(point.angle)),3);}
 if(Math.abs(Math.cos(angle))>.5){assert.equal(a.facing,Math.cos(angle)<0);assert.ok((point.x-e.x)*Math.cos(angle)>0);}
 near(shots[1].angle-shots[0].angle,.17);near(shots[2].angle-shots[1].angle,.17);assert.equal(JSON.stringify(r.hostileProjectiles.pool),before);
});
for(const [from,to]of [[0,Math.PI],[Math.PI,0],[-Math.PI/2,Math.PI/4],[Math.PI/2,-3*Math.PI/4]])for(const delay of [0,1])test(`C6A real emission overrides stale facing ${from} -> ${to}, delay ${delay}`,()=>{
 const r=run(),e=r.enemies[0];e.angle=from;const a=createEnemyAnimation(e);advanceForgeAnimation(FORGE_SHEETS.riveter,a,e,0);if(delay)advanceForgeAnimation(FORGE_SHEETS.riveter,a,e,1/60);
 r.player.x=e.x+Math.cos(to)*140;r.player.y=e.y+Math.sin(to)*140;r.forge.begin(e,'rivets',r.player);r.forge.release(e);e.recover();const p=advanceForgeAnimation(FORGE_SHEETS.riveter,a,e,0);assert.equal(p.flip,Math.cos(to)<0);assert.equal(a.state,'attack');
 for(let i=0;i<7;i++)assert.equal(advanceForgeAnimation(FORGE_SHEETS.riveter,a,e,1/60).flip,p.flip);
});
test('C6A vertical dead band retained even at repeated real emissions; no emission does not force aim',()=>{
 const e={kind:'riveter',attackAngle:0},a={facing:true};faceRiveterShot(a,e,false);assert.equal(a.facing,true);
 for(let i=0;i<10000;i++){e.attackAngle=(i%2?1:-1)*Math.PI/2+(i%3-1)*.15;faceRiveterShot(a,e,true);assert.equal(a.facing,true);}
 faceRiveterShot(a,{kind:'stoker',attackAngle:0},true);assert.equal(a.facing,true);
});
test('C6A socket follows actual attack, hit, static, flip, scale, body rotation and parent matrix',()=>{
 const e={kind:'riveter',x:100,y:200},p={},b=body();assert.ok(getRiveterMuzzle(p,e,b));near(p.x,113.6034216863);near(p.y,202.7358143963);
 b.frame.name='18';getRiveterMuzzle(p,e,b);near(p.x,113.1669091851);b.frame.name='24';getRiveterMuzzle(p,e,b);near(p.x,113.2722552073);
 b.texture.key=FORGE_SHEETS.riveter.idleKey;b.frame.name='__BASE';b.flipX=true;b.displayWidth=104;b.displayHeight=104;b.rotation=Math.PI/2;getRiveterMuzzle(p,e,b);near(p.x,100-2*5.30075638085);near(p.y,200-2*13.8148639126);
 b.parentContainer={getWorldTransformMatrix:()=>({transformPoint:(x,y,out)=>Object.assign(out,{x:300+2*x,y:400+3*y})})};getRiveterMuzzle(p,e,b);near(p.x,300-4*5.30075638085);near(p.y,400-6*13.8148639126);
 b.texture.key='foreign';assert.equal(getRiveterMuzzle(p,e,b),false);b.texture.key=FORGE_SHEETS.riveter.key;b.frame.name='999';assert.equal(getRiveterMuzzle(p,e,b),false);b.frame.name='17';b.visible=false;assert.equal(getRiveterMuzzle(p,e,b),false);
});
test('C6A frozen visual origin rejoins real path and never follows moving or dead owner',()=>{
 const e={id:1,kind:'riveter',x:100,y:200},b={id:0,owner:1,active:true,x:125.75,y:200,angle:0,distance:2.75,spec:{speed:165}},r={hostileProjectiles:{pool:[b]}},v=new RiveterMuzzleView(),p={setPosition(x,y){this.x=x;this.y=y;}};v.begin(r);v.position(p,b,e,body());const x=p.x,y=p.y;
 e.x=300;e.y=500;v.position(p,b,e,body(24,true));near(p.x,x);near(p.y,y);
 b.x+=20;b.distance+=20;v.position(p,b,e,null);near(p.x,b.x+(x-125.75)*.5);near(p.y,b.y+(y-200)*.5);
 b.x+=20;b.distance+=20;v.position(p,b,e,null);near(p.x,b.x);near(p.y,b.y);
 b.active=false;v.begin(r);Object.assign(b,{active:true,x:323,y:500,distance:0});v.begin(r);v.position(p,b,e,body());near(p.x,313.6034216863);
});
test('C6A partial loading never attaches airborne shot late; fallback remains usable',()=>{
 const e={id:1,kind:'riveter',x:100,y:200},b={id:0,active:true,owner:1,x:123,y:200,distance:0,spec:{speed:165}},v=new RiveterMuzzleView(),r={hostileProjectiles:{pool:[b]}},p={setPosition(x,y){this.x=x;this.y=y;}};v.begin(r);v.position(p,b,e,null);b.distance=10;b.x+=10;v.position(p,b,e,body());near(p.x,b.x);
 v.begin({hostileProjectiles:{pool:[b]}});v.position(p,b,e,body());near(p.x,b.x);
 const f=mock(),view=new EnemyRivetView(f.scene);f.scene.enemyViews.set(e.id,{body:body()});const rr={enemies:[e],hostileProjectiles:{pool:[b]}};view.begin(rr);f.scene.textures.exists=()=>false;assert.equal(view.draw(b,'forge'),false);assert.equal(view.sprites[0].setVisibleArgs[0],false);
});
for(const kind of ['drill','draisine','crachefer','switchman'])test('C6A leaves other Rivet user unchanged: '+kind,()=>{
 const f=mock(),v=new EnemyRivetView(f.scene),e={id:1,kind:['crachefer','switchman'].includes(kind)?'boss':kind,bossId:kind,x:100,y:200},b={id:0,active:true,owner:1,x:130,y:210,angle:1.4,distance:0,spec:{speed:165}},r={enemies:[e],hostileProjectiles:{pool:[b]}};f.scene.enemyViews.set(1,{body:body()});v.begin(r);assert.ok(v.draw(b,'forge'));assert.deepEqual(v.sprites[0].setPositionArgs,[130,210]);assert.deepEqual(v.sprites[0].setRotationArgs,[1.4]);
});
test('C6A close-distance admission and fan hitbox margin unchanged for eight directions',()=>{
 for(let i=0;i<8;i++)for(const d of [0,30,41,42,42.001,43,60]){const r=run(),e=r.enemies[0],a=i*Math.PI/4;e.x=225;e.y=390;r.player.x=225+Math.cos(a)*d;r.player.y=390+Math.sin(a)*d;if(d===42)continue;assert.equal(projectileMuzzleClear(e,r.player,5),d>42);r.forge.updateActor(e,0,[],{});const bs=r.hostileProjectiles.pool.filter(b=>b.active);assert.equal(bs.length,d>42?3:0);for(const b of bs)assert.ok(Math.hypot(b.x-r.player.x,b.y-r.player.y)>r.player.radius+b.spec.radius);}
});
for(const wave of [2,11])test('C6A real replay '+wave+': same combat with/without render, live pool, damage and cadence',()=>{
 const r=run(wave,4),control=run(wave,4),f=mock(),v=new EnemyRivetView(f.scene),fx=new ForgeSpriteVfx(f.scene),states=new Map(),ids=[...v.sprites];let peak=0,shots=0;
 for(let i=0;i<900;i++){const input={x:Math.sin(i*.03),y:Math.cos(i*.02)};assert.deepEqual(r.update(1/60,input),control.update(1/60,input));display(r,f,v,fx,states);assert.deepEqual(r.hostileProjectiles.pool,control.hostileProjectiles.pool);assert.deepEqual(r.enemies,control.enemies);assert.deepEqual(r.player,control.player);const live=r.hostileProjectiles.pool.filter(b=>b.active);peak=Math.max(peak,live.length);shots=Math.max(shots,...r.enemies.map(e=>e.attackCount));for(const b of live){assert.equal(b.spec.speed,165);assert.equal(b.spec.damage,.5);assert.equal(b.spec.range,350);assert.equal(b.spec.radius,4);}f.lines.length=0;}
 assert.equal(peak,wave<11?4:12);assert.ok(shots>2);assert.deepEqual(v.sprites,ids);assert.equal(v.sprites.length,24);
});
test('C6A sparks remain exactly two under 120ms, and reduced motion disables them',()=>{
 const r=run(),e=r.enemies[0],f=mock(),fx=new ForgeSpriteVfx(f.scene);r.forge.begin(e,'rivet',r.player);r.forge.release(e);e.recover();f.scene.enemyViews.set(e.id,{body:body()});for(const t of [0,.05,.119,.12,.15]){e.recoveryElapsed=t;f.lines.length=0;fx.update(r);assert.equal(f.lines.length,t<.12?2:0);}e.recoveryElapsed=0;f.lines.length=0;fx.update(r,true);assert.equal(f.lines.length,0);
});
