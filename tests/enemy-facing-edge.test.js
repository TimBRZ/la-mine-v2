import {historicalSource} from './instant-fire-compat.js';
import {V038B1_CHANGED} from './v038b1-authorized-files.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import{createHash}from'node:crypto';
import{ROOM}from'../src/config.js';import{stableFacing,mobileFacing,facingIntent,FACING_AXIS_RATIO}from'../src/enemy-facing.js';
import{edgeTrace}from'../production-v037c/facing-edge-v2/trace.mjs';import{before}from'../production-v037c/facing-edge-v2/before.mjs';
import{advanceForgeAnimation}from'../src/forge-animation-state.js';import{FORGE_SHEETS}from'../src/forge-sprite-catalog.js';import{advanceDepthsAnimation,DEPTHS_SHEETS}from'../src/depths-animation.js';
import{advanceEnemyAnimation,ENEMY_SHEETS,createEnemyAnimation}from'../src/enemy-animation.js';
import{appearancePose,createAppearanceMotion,COMBAT_APPEARANCES}from'../src/combat-appearances.js';
const of=await before('forge-animation-state.js'),od=await before('depths-animation.js');
for(const id of ['stoker','riveter','scorifier','lampist','blaster','blackmaw'])for(const wall of ['left','right'])for(const direction of ['up','down'])test(`Edge facing ${id} ${wall}/${direction}: 3600 real movement frames, zero parasite flips`,()=>{
 const s=FORGE_SHEETS[id]||DEPTHS_SHEETS[id],advance=FORGE_SHEETS[id]?advanceForgeAnimation:advanceDepthsAnimation,old=FORGE_SHEETS[id]?of.advanceForgeAnimation:od.advanceDepthsAnimation;
 for(let run=0;run<20;run++){
  const a=edgeTrace(id,wall,direction,advance,s),b=edgeTrace(id,wall,direction,old,s);assert.ok(b.flips>0);
  for(let i=0;i<a.trace.length;i++){const n=a.trace[i],o=b.trace[i];assert.deepEqual(n.position,o.position);assert.deepEqual(n.afterCollision,o.afterCollision);assert.equal(n.pose.frame,o.pose.frame);if(n.flip)assert.ok(Math.abs(n.logicalDirection.x)>=Math.abs(n.logicalDirection.y)*FACING_AXIS_RATIO,'every flip has a meaningful logical horizontal direction');}
  if(id!=='blackmaw')assert.equal(a.flips,0);
 }
});
test('Edge facing: source distinguishes logical intention from strong alternating corrected X',()=>{const e={forgeType:'stoker',angle:-Math.PI/2,phase:'positioning'},a={facing:true,phase:'positioning'};for(let i=0;i<10000;i++){const dx=i%2?72:-55,dy=-64;const v=facingIntent(e,dx,dy);assert.equal(v.source,'logical-heading');assert.ok(Math.abs(v.x)<1e-10);assert.equal(mobileFacing(a,e,dx,dy,true),true);}e.angle=0;assert.equal(mobileFacing(a,e,-72,-64,true),false);e.angle=Math.PI;assert.equal(mobileFacing(a,e,72,-64,true),true);});
test('Edge facing: dominant-axis gate holds 0.35/0.44 ratios and accepts 0.46 immediately',()=>{const a={facing:true};for(const x of [.35,.44,-.35,-.44])assert.equal(stableFacing(a,x,1),true);assert.equal(stableFacing(a,.46,1),false);assert.equal(stableFacing(a,-.46,1),true);});
test('Edge facing: missing logical heading uses displacement, never stale attack angle',()=>{const e={forgeType:'stoker',attackAngle:Math.PI,phase:'positioning'},a={facing:true};assert.equal(facingIntent(e,1,0).source,'displacement-fallback');assert.equal(mobileFacing(a,e,1,0,true),false);});
for(const id of ['rat','miner'])for(const wall of ['left','right'])test(`Edge facing ${id} ${wall}: 6000 alternating corrections, instant exit and crossing`,()=>{
 const radius=14,x=wall==='left'?ROOM.left+radius+2:ROOM.right-radius-2,e={kind:id,radius,x,y:300,angle:Math.PI},a=createEnemyAnimation(e),m=createAppearanceMotion(e.x,e.y);
 advanceEnemyAnimation(ENEMY_SHEETS[id],a,e,0);appearancePose(COMBAT_APPEARANCES[id],m,e,0);
 for(let i=0;i<6000;i++){e.angle=i%120<60?-Math.PI/2:Math.PI/2;e.y+=Math.sin(e.angle)*.7;e.x=x+(i%2?1:-1)*.5;const frozen=JSON.stringify(e);assert.equal(advanceEnemyAnimation(ENEMY_SHEETS[id],a,e,1/60).flip,true);assert.equal(appearancePose(COMBAT_APPEARANCES[id],m,e,1/60).flipX,true);assert.equal(JSON.stringify(e),frozen);}
 e.angle=0;e.x++;assert.equal(advanceEnemyAnimation(ENEMY_SHEETS[id],a,e,.016).flip,false);assert.equal(appearancePose(COMBAT_APPEARANCES[id],m,e,.016).flipX,false);e.angle=Math.PI;e.x-=2;assert.equal(advanceEnemyAnimation(ENEMY_SHEETS[id],a,e,.016).flip,true);
});
test('Edge facing: Rat still faces actual travel/knockback away from walls',()=>{const e={kind:'rat',radius:14,x:200,y:300,angle:0},a=createEnemyAnimation(e),m=createAppearanceMotion(e.x,e.y);e.x-=1;for(const p of [advanceEnemyAnimation(ENEMY_SHEETS.rat,a,e,.016),appearancePose(COMBAT_APPEARANCES.rat,m,e,.016)]){assert.equal(p.flip??p.flipX,true);assert.ok(Math.abs(p.rotation)<1e-12);}});
test('Edge facing: only helper and two Rat renderer call sites change; every other src byte intact',()=>{const hashes=JSON.parse(historicalSource('production-v037c/facing-edge-v2/before-hashes.json'));for(const[f,h]of Object.entries(hashes))if(![...V038B1_CHANGED,'enemy-facing.js','enemy-animation.js','combat-appearances.js'].includes(f))assert.equal(createHash('sha256').update(historicalSource('src/'+f)).digest('hex'),h,f);});

