import {projectileAnimationReleased,isPureProjectile} from './projectile-attacks.js';
import {ENEMY_SHEETS} from './enemy-sprite-catalog.js';
import {stableFacing,travelFacing} from './enemy-facing.js';
import {modernFrame,visualClip} from './enemy-visual-frame.js';
export {ENEMY_SHEETS};
export const ENEMY_DEATH_LIMIT=12;
export function enemySheet(id,_zone){return ENEMY_SHEETS[id]||null;}
export function preloadEnemyAnimations(scene){for(const s of Object.values(ENEMY_SHEETS))scene.load.svg(s.key,s.url,{width:s.width,height:s.height});}
export function registerEnemyFrames(textures){
 const ready=new Set();
 for(const s of Object.values(ENEMY_SHEETS))try{
  if(!textures?.exists(s.key))continue;
  const t=textures.get(s.key),image=t?.getSourceImage?.();
  if(image?.width!==s.width||image?.height!==s.height)continue;
  let valid=true;
  for(let i=0;i<s.frames;i++){
   const x=i%6*128,y=Math.floor(i/6)*128;
   if(!t.has(i))t.add(i,0,x,y,128,128);
   const f=t.get(i);if(f?.cutX!==x||f?.cutY!==y||f?.cutWidth!==128||f?.cutHeight!==128){valid=false;break;}
  }
  if(valid||modernFrame(textures,s,0).frame!==null)ready.add(s.id);
 }catch{/* Loader or malformed texture: preserve the old renderer. */}
 return ready;
}
export function createEnemyAnimation(e){return {state:'idle',elapsed:0,frame:0,x:e.x,y:e.y,angle:e.angle||0,phase:null,warning:0,release:0,flash:0,burstLeft:e.burstLeft,finished:false};}
export function advanceEnemyAnimation(s,a,e,dt=0,reduced=false){
 const delta=Number.isFinite(dt)?Math.max(0,Math.min(dt,.1)):0,dx=e.x-a.x,dy=e.y-a.y,moving=Math.hypot(dx,dy)>.025;
 if(s.orientation==='travel'&&moving)a.angle=Math.atan2(dy,dx);
 else if(s.orientation==='rail')a.angle=e.chargeAngle??e.angle??a.angle;
 else if(s.orientation!=='travel')a.angle=e.angle||0;
 a.x=e.x;a.y=e.y;
 const enteringWarning=e.phase==='warning'&&a.phase!=='warning';
 if(enteringWarning)a.warning=Math.max(.0001,e.phaseTime||e.warningRemaining||1);
 const released=a.phase==='warning'&&e.phase!=='warning'&&e.phase!=='charge';
 const burst=e.phase==='burst'&&Number.isFinite(e.burstLeft)&&e.burstLeft<a.burstLeft;
 if(projectileAnimationReleased(a,e)||released||burst)a.release=.25;else a.release=Math.max(0,a.release-delta);
 const family=s.id==='switchman'&&e.pattern==='rails'&&e.railOrientation==='vertical'?'vertical':e.pattern;
 const vertical=s.clips['prepare_'+family]?'_'+family:'';
 let next=e.dead?'death':e.phase==='warning'&&!isPureProjectile(e)?'prepare'+vertical:e.phase==='charge'||a.release>0?'attack'+vertical:e.flash>0&&e.flash>a.flash?'hit':e.phase==='recovery'||e.phase==='stopped'?'recovery':moving?'move':'idle';
 if(!visualClip(s,next))next=e.dead?'death':'idle';
 if(a.state!==next){a.elapsed=0;a.state=next;}else a.elapsed+=delta;
 const c=visualClip(s,next)||{first:0,count:1,fps:next==='death'?10:1,loop:next!=='death'};let offset;
 if(next.startsWith('prepare'))offset=Math.min(c.count-1,Math.floor(Math.max(0,1-(e.phaseTime??e.warningRemaining??0)/a.warning)*c.count));
 else {const step=Math.floor(a.elapsed*c.fps+1e-8);offset=c.loop?step%c.count:Math.min(c.count-1,step);}
 a.frame=c.first+(reduced?(next==='death'?c.count-1:0):offset);
 a.finished=next==='death'&&a.elapsed>=c.count/c.fps;
 a.phase=e.phase;a.flash=e.flash||0;a.burstLeft=e.burstLeft;
 const left=s.id==='rat'?travelFacing(a,e,a.angle):Math.cos(a.angle)<0,directional=['travel','rail'].includes(s.orientation);
 const flip=s.id==='miner'?stableFacing(a,Math.cos(a.angle),Math.sin(a.angle),.1):s.orientation==='flip'&&Math.cos(a.angle)<-.1;
 return {frame:a.frame,flip:directional?left:flip,rotation:directional?(left?Math.atan2(-Math.sin(a.angle),-Math.cos(a.angle)):a.angle):s.orientation==='rotate'?a.angle:0};
}
export function applyEnemyAnimation(body,textures,s,a,e,dt,reduced=false){
 const pose=advanceEnemyAnimation(s,a,e,dt,reduced);
 try{
  const selected=modernFrame(textures,s,pose.frame);a.visualReason=selected.reason;
  if(selected.frame===null)return false;
  body.setTexture(s.key,selected.frame).setOrigin(.5,s.originY).setDisplaySize(s.displayWidth,s.displayHeight).setPosition(0,0).setFlipX(pose.flip).setRotation(pose.rotation);
  return true;
 }catch{a.visualReason='texture_error';return false;}
}
// Visual corpses reuse the already allocated view, never the simulation entity.
export function retireEnemyView(scene,id,position){
 const v=scene.enemyViews.get(id);if(!v?.sheet)return;
 scene.enemyViews.delete(id);scene.enemyDeaths??=[];
 if(scene.enemyDeaths.length>=ENEMY_DEATH_LIMIT)scene.enemyDeaths.shift().container.destroy();
 if(Number.isFinite(position?.x)&&Number.isFinite(position?.y))v.container.setPosition(position.x,position.y);
 v.death={x:v.container.x,y:v.container.y,angle:v.animation.angle,chargeAngle:v.animation.angle,dead:true};
 for(const part of ['shadow','ring','health','healthBack','aimLabel'])v[part].setVisible(false);
 v.container.setDepth(7);v.body.clearTint();scene.enemyDeaths.push(v);
}
export function updateEnemyDeaths(scene,dt){
 if(!scene.enemyDeaths)return;
 scene.enemyDeaths=scene.enemyDeaths.filter(v=>{
  const ok=applyEnemyAnimation(v.body,scene.textures,v.sheet,v.animation,v.death,dt,scene.reducedMotion);
  v.body.setAlpha(Math.max(0,1-v.animation.elapsed/.65));
  if(!ok||v.animation.finished){v.container.destroy();return false;}return true;
 });
}
export function clearEnemyDeaths(scene){for(const v of scene.enemyDeaths||[])v.container.destroy();scene.enemyDeaths=[];}
