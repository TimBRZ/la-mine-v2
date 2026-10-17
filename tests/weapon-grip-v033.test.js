import {historicalSource} from './instant-fire-compat.js';
import {v036bChanged} from './v036b-authorized-files.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import{createHash}from'node:crypto';
import{weaponVisual,heldWeaponPose}from'../src/weapon-visuals.js';
import{withoutCracheferRetry}from'./crachefer-patch-compat.js';
const degrees=[-90,-45,0,45,90,-135,180,135];
test('Grip patch changes only two presentation modules; sprites, every gameplay module and hero animations remain byte-identical',()=>{
 const baseline=JSON.parse(historicalSource(new URL('../production-v033/weapon-grip-patch/before-hashes.json',import.meta.url)));
 for(const f of baseline)if(!v036bChanged(f.file)&&!['src/room-scene.js','src/weapon-visuals.js','src/enemies/view.js'].includes(f.file))assert.equal(createHash('sha256').update(withoutCracheferRetry(f.file,historicalSource(new URL('../'+f.file,import.meta.url)))).digest('hex'),f.sha256,f.file);
});
for(const id of ['shotgun','smg','grisoux'])test('Grip stays on the visible glove and barrel rotates around it in all eight directions: '+id,()=>{
 const visual=weaponVisual(id);assert.ok(visual.grip.x>20&&visual.grip.x<70);assert.ok(visual.grip.y>=64&&visual.grip.y<90);
 for(const d of degrees)for(const recoil of [0,6,50]){
  const a=d*Math.PI/180,pose=heldWeaponPose(id,a,recoil),mirror=Math.cos(a)<-.1?-1:1;
  assert.equal(pose.mirror,mirror);assert.equal(pose.angle,a);assert.ok(Math.hypot(pose.x-mirror*11.7,pose.y+.4)<=2.7,'connection to glove '+d);
  const dx=pose.muzzleX-pose.x,dy=pose.muzzleY-pose.y;
  assert.ok(Math.abs(dx*Math.cos(a)+dy*Math.sin(a)-(visual.barrel.x-visual.grip.x)*visual.width/128)<1e-10,'barrel stays forward');
  assert.ok(Math.abs(-dx*Math.sin(a)+dy*Math.cos(a)-(visual.barrel.y-visual.grip.y)*visual.height/128*mirror)<1e-10,'mirror around grip');
 }
});
test('Grip offsets are continuous across high/neutral/low boundaries and left transitions have a bounded visual speed',()=>{
 for(const deg of [-145,-35,35,145]){
  const a=heldWeaponPose('grisoux',(deg-.0001)*Math.PI/180),b=heldWeaponPose('grisoux',(deg+.0001)*Math.PI/180);
  assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<.0001);
 }
 for(const dt of [1/165,1/60,1/30,.04]){
  let x=11.7;for(let i=0;i<60;i++){const p=heldWeaponPose('grisoux',Math.PI,0,x,dt);assert.ok(Math.abs(p.handX-x)<=Math.min(3,90*dt)+1e-10);x=p.handX;}
  assert.ok(x<0);
 }
});
test('Integrated renderer preserves frozen player/weapon/projectile state and applies grip, mirror, recoil and visual muzzle',async()=>{
 globalThis.Phaser={Scene:class{}};const{RoomScene}=await import('../src/room-scene.js');const{registerHeroFrames,createHeroAnimationState}=await import('../src/hero-animation.js');
 const texture={frames:new Map(),getSourceImage:()=>({width:640,height:512}),has(n){return this.frames.has(n);},add(n,_s,x,y,w,h){this.frames.set(n,{cutX:x,cutY:y,cutWidth:w,cutHeight:h});},get(n){return this.frames.get(n);}};
 const textures={exists:k=>k==='combat-v033-hero-sheet',get:()=>texture};registerHeroFrames(textures);
 const image=()=>{const o={x:0,y:0,rotation:0,scaleX:1,scaleY:1};for(const key of ['setTexture','setDisplaySize','setFlipX','setRotation','setAlpha','setTint','clearTint','setVisible','setFillStyle'])o[key]=(...a)=>{o[key]=o[key];o[key+'Args']=a;return o;};o.setRotation=a=>{o.rotation=a;return o;};o.setPosition=(x,y)=>{o.x=x;o.y=y;return o;};o.setScale=(x,y=x)=>{o.sx=o.scaleX=x;o.sy=o.scaleY=y;return o;};o.setOrigin=(x,y)=>{o.ox=o.originX=x;o.oy=o.originY=y;return o;};return o;};
 for(const id of ['shotgun','smg','grisoux'])for(const d of degrees){
  const player=Object.freeze({x:225,y:414,angle:d*Math.PI/180,hp:5,vx:0,vy:0,invulnerable:0});
  const weapon=Object.freeze({recoil:6,flash:.05,definition:Object.freeze({id,effects:Object.freeze({color:0xffffff,muzzle:1})})});
  const run=Object.freeze({player,weapon,elapsed:1,projectiles:Object.freeze({pool:Object.freeze([])})});const saved=JSON.stringify(run);
  const s={run,textures,heroSheetReady:true,heroAnimation:createHeroAnimationState(),playerView:image(),gun:image(),heldWeapon:Object.assign(image(),{displayWidth:weaponVisual(id).width,displayHeight:weaponVisual(id).height,active:true}),muzzle:image(),shadow:image(),weaponHasGrip:true,weaponGripX:null,reducedMotion:false,damageAlpha:0,mode:'playing',visualShot:true,visualHit:false,shotAge:1,footstepTime:0};
  RoomScene.prototype.drawHero.call(s,1/60);assert.equal(JSON.stringify(run),saved);
  const v=weaponVisual(id),p=heldWeaponPose(id,player.angle,6);assert.equal(s.heldWeapon.ox,v.grip.x/128);assert.equal(s.heldWeapon.oy,v.grip.y/128);assert.equal(s.gun.sy,p.mirror);assert.equal(s.gun.x,s.playerView.x+p.x);assert.ok(Math.abs(s.muzzle.x-(s.playerView.x+p.muzzleX))<1e-9);
  s.heroSheetReady=false;RoomScene.prototype.drawHero.call(s,1/60);assert.equal(s.heldWeapon.ox,0);assert.equal(s.heldWeapon.oy,.45);assert.equal(s.gun.sy,1);assert.equal(JSON.stringify(run),saved);
 }
});
