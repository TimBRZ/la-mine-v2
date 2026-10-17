import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HERO_SHEET, HERO_CLIPS, preloadHeroAnimation, registerHeroFrames, createHeroAnimationState, advanceHeroAnimation, applyHeroAnimation } from '../src/hero-animation.js';

function textures(width=640,height=512) {
  const frames=new Map();
  const texture={getSourceImage:()=>({width,height}),has:i=>frames.has(i),get:i=>frames.get(i),add:(i,source,cutX,cutY,cutWidth,cutHeight)=>frames.set(i,{source,cutX,cutY,cutWidth,cutHeight})};
  return {exists:key=>key===HERO_SHEET.key,get:()=>texture,frames};
}
const ticks=(state,input,seconds)=>{for(let n=0;n<Math.round(seconds*100);n++)advanceHeroAnimation(state,input,.01);return state;};

test('V033 hero sheet: 20 transparent uniformly sized authored poses, complete clips',()=>{
  const svg=fs.readFileSync(new URL('../src/assets/combat-v033/hero-sheet.svg',import.meta.url),'utf8');
  assert.match(svg,/width="640" height="512"/);
  assert.equal((svg.match(/width="128" height="128" viewBox="0 0 128 128"/g)||[]).length,20);
  assert.equal((svg.match(/<title>hero_/g)||[]).length,20);
  assert.doesNotMatch(svg,/<(?:image|filter|foreignObject)\b/);
  assert.equal(Object.values(HERO_CLIPS).reduce((sum,c)=>sum+c.count,0),20);
  assert.deepEqual(Object.values(HERO_CLIPS).flatMap(c=>Array.from({length:c.count},(_,i)=>c.first+i)),Array.from({length:20},(_,i)=>i));
});

test('V033 hero load and frame registration rasterize once and are idempotent',()=>{
  let request;
  preloadHeroAnimation({load:{svg:(...args)=>request=args}});
  assert.deepEqual(request,[HERO_SHEET.key,HERO_SHEET.url,{width:640,height:512}]);
  const manager=textures();
  assert.equal(registerHeroFrames(manager),true);
  assert.equal(registerHeroFrames(manager),true);
  assert.equal(manager.frames.size,20);
  assert.deepEqual(manager.frames.get(19),{source:0,cutX:512,cutY:384,cutWidth:128,cutHeight:128});
});

test('V033 missing/truncated sheet and malformed frames preserve the legacy image',()=>{
  assert.equal(registerHeroFrames({exists:()=>false}),false);
  assert.equal(registerHeroFrames(textures(128,128)),false);
  const bad=textures();bad.frames.set(0,{cutX:0,cutY:0,cutWidth:127,cutHeight:128});
  assert.equal(registerHeroFrames(bad),false);
  const image={setTexture:()=>assert.fail('Legacy image must stay intact')};
  assert.equal(applyHeroAnimation(image,{exists:()=>false},createHeroAnimationState(),{},.01),null);
  assert.equal(applyHeroAnimation(image,bad,createHeroAnimationState(),{},.01),null);
});

test('V033 run follows actual movement and returns to idle without attack timer',()=>{
  const state=createHeroAnimationState(), input=Object.freeze({moving:true});
  assert.equal(advanceHeroAnimation(state,input,.04).frame,4);
  assert.equal(ticks(state,input,.09).frame,5);
  assert.equal(ticks(state,input,.45).state,'run');
  advanceHeroAnimation(state,{moving:false},.04);
  assert.equal(state.state,'idle');assert.equal(state.frame,0);
});

test('V033 shoot follows event, returns to idle and cannot prevent movement',()=>{
  const state=createHeroAnimationState();
  assert.equal(advanceHeroAnimation(state,{shot:true},.02).frame,10);
  assert.equal(ticks(state,{},.06).frame,11);
  assert.equal(ticks(state,{},.1).state,'idle');
  advanceHeroAnimation(state,{shot:true},0);
  advanceHeroAnimation(state,{moving:true},.01);
  assert.equal(state.state,'run');
  advanceHeroAnimation(state,{shot:true,moving:true},.01);
  assert.equal(state.state,'run');
});

test('V033 repeated SMG shots restart visual recoil without creating shots',()=>{
  const state=createHeroAnimationState();
  advanceHeroAnimation(state,{shot:true},0);ticks(state,{},.06);
  assert.equal(state.frame,11);
  advanceHeroAnimation(state,{shot:true},.01);
  assert.equal(state.frame,10);assert.equal(state.elapsed,0);
  assert.deepEqual(Object.keys(state).sort(),['elapsed','finished','frame','state']);
});

test('V033 hit has short priority and death finishes once, with no resurrection',()=>{
  const state=createHeroAnimationState();
  advanceHeroAnimation(state,{hit:true,shot:true},0);
  assert.equal(state.frame,13);
  ticks(state,{moving:true},.08);assert.equal(state.frame,14);
  ticks(state,{moving:true},.07);assert.equal(state.state,'run');
  advanceHeroAnimation(state,{dead:true,hit:true},0);assert.equal(state.frame,15);
  ticks(state,{moving:true,shot:true},.7);
  assert.equal(state.state,'death');assert.equal(state.frame,19);assert.equal(state.finished,true);
});

test('V033 reduced motion retains event state and static final death without bob',()=>{
  const state=createHeroAnimationState();
  advanceHeroAnimation(state,{moving:true},0,true);
  advanceHeroAnimation(state,{moving:true},.1,true);assert.equal(state.frame,4);
  advanceHeroAnimation(state,{dead:true},0,true);assert.equal(state.frame,19);
});

test('V033 texture application never writes combat inputs or image geometry',()=>{
  const manager=textures();registerHeroFrames(manager);
  const image={setTexture:(...args)=>{image.last=args;return image;}};
  const input=Object.freeze({moving:false,shot:true,hit:false,dead:false});
  const pose=applyHeroAnimation(image,manager,createHeroAnimationState(),input,.02);
  assert.deepEqual(image.last,[HERO_SHEET.key,10]);assert.equal(pose.state,'shoot');
  assert.deepEqual(input,{moving:false,shot:true,hit:false,dead:false});
  assert.equal(advanceHeroAnimation(createHeroAnimationState(),{},NaN).elapsed,0);
});
