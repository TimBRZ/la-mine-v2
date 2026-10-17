// Presentation-only Zone 6 adapter. No combat callbacks, writes or timer ownership.
import * as previous from './depths-animation.js';
import {FORGE_SHEETS} from './forge-sprite-catalog.js';
import {modernFrame} from './enemy-visual-frame.js';
export {FORGE_SHEETS};
export const ensureDepthsSheets=previous.ensureDepthsSheets,releaseDepthsSheets=previous.releaseDepthsSheets;
export const createEnemyAnimation=previous.createEnemyAnimation,clearEnemyDeaths=previous.clearEnemyDeaths,retireEnemyView=previous.retireEnemyView;
const proof=new WeakMap(),pending=new WeakMap(),epochs=new WeakMap();
export const fingerprint=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return(h>>>0).toString(16);};
export function trustedForge(textures,key){const t=textures?.exists(key)&&textures.get(key),p=t&&proof.get(t);return !!p&&p.key===key&&p.source===t.getSourceImage?.();}
function queue(scene,key,svg,width,height,epoch){
 if(trustedForge(scene.textures,key))return;
 if(scene.textures.exists(key))scene.textures.remove(key);
 scene.load.once('filecomplete-svg-'+key,(_key,_type,source)=>{const t=scene.textures.exists(key)&&scene.textures.get(key);if(epoch!==undefined&&epochs.get(scene)!==epoch){if(t)scene.textures.remove(key);return;}if(t&&source===t.getSourceImage()&&source.width===width&&source.height===height){proof.set(t,{key,source});registerForgeFrames(scene.textures);}});
 scene.load.svg(key,'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg))),{width,height});
}
export function preloadEnemyAnimations(scene){previous.preloadEnemyAnimations(scene);for(const s of Object.values(FORGE_SHEETS))queue(scene,s.idleKey,s.idleSvg,s.cell,s.cell);}
export function ensureForgeSheets(scene){
 if(pending.has(scene))return pending.get(scene);
 const epoch=epochs.get(scene)||0;epochs.set(scene,epoch);
 const task=Promise.all(Object.values(FORGE_SHEETS).map(async s=>{try{const data=await import(s.moduleUrl);if(data.id!==s.id||data.key!==s.key||data.svg.length!==s.length||fingerprint(data.svg)!==s.fingerprint)throw Error('Identity mismatch '+s.id);if(epochs.get(scene)===epoch)queue(scene,s.key,data.svg,s.width,s.height,epoch);}catch(error){console.warn('[V037C] Master statique conservé : '+s.id,error.message);}})).then(()=>{if(!scene.load.isLoading())scene.load.start();});pending.set(scene,task);return task;
}
// Called after old views/death renderers are destroyed; only our own optional atlases.
export function releaseForgeSheets(scene){epochs.set(scene,(epochs.get(scene)||0)+1);for(const s of Object.values(FORGE_SHEETS))if(scene.textures.exists(s.key))scene.textures.remove(s.key);pending.delete(scene);}
export function enemySheet(id,zone){return FORGE_SHEETS[id]||previous.enemySheet(id,zone);}
export function registerForgeFrames(textures){const ready=new Set();for(const s of Object.values(FORGE_SHEETS)){if(!trustedForge(textures,s.key))continue;const t=textures.get(s.key);for(let i=0;i<s.frames;i++)if(!t.has(i))t.add(i,0,i%s.columns*s.cell,Math.floor(i/s.columns)*s.cell,s.cell,s.cell);ready.add(s.id);}return ready;}
export function registerEnemyFrames(textures){return new Set([...previous.registerEnemyFrames(textures),...registerForgeFrames(textures)]);}
export {advanceForgeAnimation} from './forge-animation-state.js';
import {advanceForgeAnimation} from './forge-animation-state.js';
function set(body,s,key,frame,flip){body.setTexture(key,frame).setOrigin(.5,.5).setDisplaySize(s.displayWidth,s.displayHeight).setPosition(0,0).setFlipX(flip).setRotation(0).setVisible(true);}
export function applyEnemyAnimation(body,textures,s,a,e,dt,reduced=false,context){
 s=FORGE_SHEETS[e.forgeType||e.bossId||e.kind]||FORGE_SHEETS[s.id]||s;
 if(!FORGE_SHEETS[s.id]||s.key!==FORGE_SHEETS[s.id].key)return previous.applyEnemyAnimation(body,textures,s,a,e,dt,reduced,context);
 const p=advanceForgeAnimation(s,a,e,dt,reduced,context);
 try{if(trustedForge(textures,s.key)){const f=modernFrame(textures,s,p.frame),t=textures.get(s.key),frame=f.frame!==null&&t.get(f.frame);if(frame&&(!frame.source||frame.source.image===t.getSourceImage())&&(!frame.texture||frame.texture===t)&&(!frame.sourceIndex||frame.sourceIndex===0)){set(body,s,s.key,f.frame,p.flip);a.visualReason=f.reason;return true;}}
 if(trustedForge(textures,s.idleKey)){set(body,s,s.idleKey,undefined,p.flip);a.visualReason='approved_static_fallback';return true;}
 }catch{/* No legacy/foreign texture ever selected for a Zone 6 entity. */}
 body.setVisible(false);a.visualReason='missing_verified_master';return true;
}
export function updateEnemyDeaths(scene,dt){
 if(!scene.enemyDeaths)return;
 const prior={textures:scene.textures,reducedMotion:scene.reducedMotion,enemyDeaths:scene.enemyDeaths.filter(v=>!FORGE_SHEETS[v.sheet.id])};
 previous.updateEnemyDeaths(prior,dt);const kept=new Set(prior.enemyDeaths);
 scene.enemyDeaths=scene.enemyDeaths.filter(v=>{
  if(!FORGE_SHEETS[v.sheet.id])return kept.has(v);
  applyEnemyAnimation(v.body,scene.textures,v.sheet,v.animation,v.death,dt,scene.reducedMotion);
  const duration=v.sheet.clips.death.count/v.sheet.clips.death.fps;
  v.body.setAlpha(Math.max(0,1-Math.max(0,v.animation.elapsed-duration*.65)/(duration*.35)));
  if(v.animation.finished){v.container.destroy();return false;}return true;
 });
}
