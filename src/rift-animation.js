import {projectileAnimationReleased,isPureProjectile} from './projectile-attacks.js';
// Zone 4 presentation adapter. It only reads actors; no combat callback or timer.
import * as legacy from './enemy-animation.js';
import {RIFT_SHEETS} from './rift-sprite-catalog.js';
import {modernFrame,visualClip} from './enemy-visual-frame.js';
import {preloadBursterVisual,trustedBursterTexture,trustedBursterFrame,applyBursterIdle} from './burster-visual.js';
export {RIFT_SHEETS};
export const createEnemyAnimation=legacy.createEnemyAnimation;
export const clearEnemyDeaths=legacy.clearEnemyDeaths;
export const retireEnemyView=legacy.retireEnemyView;
export function enemySheet(id,zone){return RIFT_SHEETS[id]||legacy.enemySheet(id,zone);}
export function preloadEnemyAnimations(scene){
 legacy.preloadEnemyAnimations(scene);
 for(const s of Object.values(RIFT_SHEETS))if(s.id!=='burster')scene.load.svg(s.key,s.url,{width:s.width,height:s.height});
 preloadBursterVisual(scene);
}
export function registerEnemyFrames(textures){
 const ready=legacy.registerEnemyFrames(textures);
 for(const s of Object.values(RIFT_SHEETS))try{
  if(s.id==='burster'&&!trustedBursterTexture(textures,s.key))continue;
  if(!textures?.exists(s.key))continue;
  const t=textures.get(s.key),im=t.getSourceImage?.();if(im?.width!==s.width||im?.height!==s.height)continue;
  let valid=true;for(let i=0;i<s.frames;i++){
   const x=i%s.columns*s.cell,y=Math.floor(i/s.columns)*s.cell;
   if(!t.has(i))t.add(i,0,x,y,s.cell,s.cell);
   const f=t.get(i);if(f?.cutX!==x||f?.cutY!==y||f?.cutWidth!==s.cell||f?.cutHeight!==s.cell){valid=false;break;}
  }if(valid||modernFrame(textures,s,0).frame!==null)ready.add(s.id);
 }catch{/* Invalid sheet keeps the procedural legacy image. */}
 return ready;
}
export function advanceRiftAnimation(s,a,e,dt=0,reduced=false){
 const delta=Number.isFinite(dt)?Math.max(0,Math.min(dt,.1)):0,moving=Math.hypot(e.x-a.x,e.y-a.y)>.025;
 a.x=e.x;a.y=e.y;
 const warning=e.phase==='warning'&&!isPureProjectile(e);
 if(warning&&a.phase!=='warning')a.warning=Math.max(.0001,e.phaseTime||1);
 // Read actual phase transitions. Core's second salvo leaves burst, not warning.
 const released=(a.phase==='warning'&&!warning&&e.phase!=='charge')||(a.phase==='burst'&&e.phase==='recovery');
 a.release=projectileAnimationReleased(a,e)||released?.25:Math.max(0,a.release-delta);
 const family=s.clips['prepare_'+e.pattern]?'_'+e.pattern:'';
 let next=e.dead?'death':warning?'prepare'+family:e.phase==='charge'||a.release>0?'attack'+family:e.flash>0&&e.flash>a.flash?'hit':e.phase==='recovery'?'recovery':moving?'move':'idle';
 if(!visualClip(s,next))next=e.dead?'death':'idle';
 if(a.state!==next){a.state=next;a.elapsed=0;}else a.elapsed+=delta;
 const c=visualClip(s,next)||{first:0,count:1,fps:next==='death'?10:1,loop:next!=='death'};let offset;
 if(next.startsWith('prepare'))offset=Math.min(c.count-1,Math.floor(Math.max(0,1-(e.phaseTime??0)/a.warning)*c.count));
 else {const step=Math.floor(a.elapsed*c.fps+1e-8);offset=c.loop?step%c.count:Math.min(c.count-1,step);}
 a.frame=c.first+(reduced?(next==='death'?c.count-1:0):offset);
 a.finished=next==='death'&&a.elapsed>=c.count/c.fps;a.phase=e.phase;a.flash=e.flash||0;
 // Rift's established renderer is fixed in all movement/aim directions.
 return {frame:a.frame,flip:false,rotation:0};
}
export function applyEnemyAnimation(body,textures,s,a,e,dt,reduced=false){
 if(e.kind==='burster'&&(s.id!=='burster'||s.key!==RIFT_SHEETS.burster.key))s=RIFT_SHEETS.burster;
 if(!RIFT_SHEETS[s.id]||s.key!==RIFT_SHEETS[s.id].key)return legacy.applyEnemyAnimation(body,textures,s,a,e,dt,reduced);
 const pose=advanceRiftAnimation(s,a,e,dt,reduced);
 try{
  const selected=s.id==='burster'&&!trustedBursterTexture(textures,s.key)?{frame:null,reason:'unverified_or_missing_burster'}:modernFrame(textures,s,pose.frame);a.visualReason=selected.reason;
  if(s.id==='burster'&&selected.frame!==null&&!trustedBursterFrame(textures,s.key,selected.frame)){selected.frame=null;a.visualReason='foreign_frame_source';}
  if(selected.frame===null){
   if(s.id==='burster'&&applyBursterIdle(body,textures)){a.visualReason='final_static_fallback';return true;}
   return false;
  }
  body.setTexture(s.key,selected.frame).setOrigin(.5,.5).setDisplaySize(s.displayWidth,s.displayHeight).setPosition(0,0).setFlipX(false).setRotation(0);return true;
 }catch{a.visualReason='texture_error';return false;}
}
export function updateEnemyDeaths(scene,dt){
 if(!scene.enemyDeaths)return;
 scene.enemyDeaths=scene.enemyDeaths.filter(v=>{
  const ok=applyEnemyAnimation(v.body,scene.textures,v.sheet,v.animation,v.death,dt,scene.reducedMotion);
  v.body.setAlpha(Math.max(0,1-v.animation.elapsed/.65));
  if(!ok||v.animation.finished){v.container.destroy();return false;}return true;
 });
}
