import {projectileAnimationReleased,isPureProjectile} from './projectile-attacks.js';
// Presentation-only Zone 5 adapter. No combat callbacks, writes or timer ownership.
import * as previous from './rift-animation.js';
import {mobileFacing} from './enemy-facing.js';
import {DEPTHS_SHEETS} from './depths-sprite-catalog.js';
import {modernFrame} from './enemy-visual-frame.js';
export {DEPTHS_SHEETS};
export const createEnemyAnimation=previous.createEnemyAnimation,clearEnemyDeaths=previous.clearEnemyDeaths,retireEnemyView=previous.retireEnemyView;
const proof=new WeakMap(),pending=new WeakMap(),epochs=new WeakMap();
export const fingerprint=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return(h>>>0).toString(16);};
export function trustedDepths(textures,key){const t=textures?.exists(key)&&textures.get(key),p=t&&proof.get(t);return !!p&&p.key===key&&p.source===t.getSourceImage?.();}
function queue(scene,key,svg,width,height,epoch){
 if(trustedDepths(scene.textures,key))return;
 if(scene.textures.exists(key))scene.textures.remove(key);
 scene.load.once('filecomplete-svg-'+key,(_key,_type,source)=>{const t=scene.textures.exists(key)&&scene.textures.get(key);if(epoch!==undefined&&epochs.get(scene)!==epoch){if(t)scene.textures.remove(key);return;}if(t&&source===t.getSourceImage()&&source.width===width&&source.height===height){proof.set(t,{key,source});registerDepthsFrames(scene.textures);}});
 scene.load.svg(key,'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg))),{width,height});
}
export function preloadEnemyAnimations(scene){previous.preloadEnemyAnimations(scene);for(const s of Object.values(DEPTHS_SHEETS))queue(scene,s.idleKey,s.idleSvg,s.cell,s.cell);}
export function ensureDepthsSheets(scene){
 if(pending.has(scene))return pending.get(scene);
 const epoch=epochs.get(scene)||0;epochs.set(scene,epoch);
 const task=Promise.all(Object.values(DEPTHS_SHEETS).map(async s=>{try{const data=await import(s.moduleUrl);if(data.id!==s.id||data.key!==s.key||data.svg.length!==s.length||fingerprint(data.svg)!==s.fingerprint)throw Error('Identity mismatch '+s.id);if(epochs.get(scene)===epoch)queue(scene,s.key,data.svg,s.width,s.height,epoch);}catch(error){console.warn('[V036C] Master statique conservé : '+s.id,error.message);}})).then(()=>{if(!scene.load.isLoading())scene.load.start();});pending.set(scene,task);return task;
}
// Called after old views/death renderers are destroyed; only our own optional atlases.
export function releaseDepthsSheets(scene){epochs.set(scene,(epochs.get(scene)||0)+1);for(const s of Object.values(DEPTHS_SHEETS))if(scene.textures.exists(s.key))scene.textures.remove(s.key);pending.delete(scene);}
export function enemySheet(id,zone){return DEPTHS_SHEETS[id]||previous.enemySheet(id,zone);}
export function registerDepthsFrames(textures){const ready=new Set();for(const s of Object.values(DEPTHS_SHEETS)){if(!trustedDepths(textures,s.key))continue;const t=textures.get(s.key);for(let i=0;i<s.frames;i++)if(!t.has(i))t.add(i,0,i%s.columns*s.cell,Math.floor(i/s.columns)*s.cell,s.cell,s.cell);ready.add(s.id);}return ready;}
export function registerEnemyFrames(textures){return new Set([...previous.registerEnemyFrames(textures),...registerDepthsFrames(textures)]);}
export function bossClip(e){const s=e.bossSequence;if(!s)return null;const st=s.state,step=s.step||{},id=e.bossId,active=st==='active',prep=st==='locked'||st==='tracking'||st==='pending';
 if(st==='recovery'&&id==='blackmass'&&step.rush)return(e.recoveryElapsed||0)<.2?'impact':'stun';
 if(st==='recovery')return id==='dynamiter'&&s.plan.ultimate?'reload':s.plan.ultimate?'ultimate_recovery':id==='blackmass'&&step.rush?'stun':'recovery';
 if(id==='lampmajor'){
  if(step.dark)return active?'move':s.plan.ultimate?'command':'extinction';
  if(step.sweep)return active?'sweep':'sweep_prepare';
  if(step.tracking)return st==='tracking'?'aim':active?'fire':'lock';
  if(step.cross)return active?'sweep':'sweep_prepare';
  return active?'attack':'command';
 }
 if(id==='dynamiter'){
  if(step.fragments)return active?'throw':'throw_prepare';
  if(s.plan.ultimate)return active?'detonate':'arm';
  return active?'detonate':step.linked?'chain_prepare':'prepare';
 }
 if(id==='blackmass'){
  if(step.toCenter)return active?'move':'charge_prepare';
  if(step.rush)return active?'charge':'charge_prepare';
  if(e.pattern==='mass-triple'&&s.index<2)return(s.index===0?'left':'right')+(prep?'_prepare':'');
  if(e.pattern==='mass-triple'&&s.index===2)return active?'slam':'center_prepare';
  if(step.grow||step.wave||s.geometry?.some(h=>h.shape==='ring'))return 'hold';
  return active?'slam':s.plan.ultimate?'ultimate_prepare':'slam_prepare';
 }return prep?'prepare':'attack';
}
export function advanceDepthsAnimation(s,a,e,dt=0,reduced=false,context){
 const delta=Number.isFinite(dt)?Math.max(0,Math.min(dt,.1)):0,dx=e.x-a.x,dy=e.y-a.y,moving=Math.hypot(dx,dy)>.025,seq=e.bossSequence;
 let angle=e.chargeAngle??e.attackAngle??e.angle??a.angle;
 if(e.phase==='positioning'&&moving)angle=Math.atan2(dy,dx);
 // Hold facing through an announced/active attack, flip only across a wide dead zone.
 if(['lampist','blaster','blackmaw'].includes(s.id))mobileFacing(a,e,dx,dy,moving);
 else if(Math.abs(Math.cos(angle))>.18)a.facing=Math.cos(angle)<0;
 a.angle=angle;a.x=e.x;a.y=e.y;
 if(e.phase==='warning'&&a.phase!=='warning')a.warning=Math.max(.001,e.phaseTime||1);
 const released=a.phase==='warning'&&e.phase==='recovery';a.release=projectileAnimationReleased(a,e)||released?.26:Math.max(0,(a.release||0)-delta);
 let next=e.dead?'death':bossClip(e)|| (e.phase==='warning'&&!isPureProjectile(e)?'prepare':e.phase==='charge'||a.release>0?'attack':e.phase==='recovery'?'recovery':moving?'move':'idle');
 // Boutefeu places immediately in the established gameplay; animate the committed placement,
 // then depress the T-handle when its existing charge actually activates (never trigger it here).
 if(s.id==='blaster'&&!e.dead){if(e.phase==='recovery'&&(e.recoveryElapsed||0)<.3)next='prepare';else if(context?.ground?.items.some(h=>h.owner===e.id&&h.active))next='detonate';}
 if(!e.dead&&e.flash>0&&e.flash>(a.flash||0)&&!['warning','charge'].includes(e.phase)){a.hitLeft=.12;}else a.hitLeft=Math.max(0,(a.hitLeft||0)-delta);
 if(a.hitLeft>0&&!e.dead)next='hit';
 if(!s.clips[next])next=e.dead?'death':'idle';
 const token=seq?e.pattern+':'+seq.index+':'+seq.state:e.phase;
 if(a.state!==next||a.token!==token){a.state=next;a.elapsed=0;a.token=token;}else a.elapsed+=delta;
 const c=s.clips[next];let progress=null;
 if(seq&&['tracking','locked','active','recovery'].includes(seq.state)){const duration=seq.state==='tracking'?seq.step.tracking:seq.state==='locked'?seq.step.warning:seq.state==='recovery'?seq.plan.recovery:seq.step.duration;progress=seq.state==='recovery'?e.recoveryElapsed/duration:seq.elapsed/duration;
  if(next==='impact')progress=e.recoveryElapsed/.2;
  if(next==='stun')progress=(e.recoveryElapsed-.2)/Math.max(.01,seq.plan.recovery-.2);
  if(next==='detonate'&&seq.step.sequence)progress=(seq.elapsed%(seq.step.linked?.72:.65))/.32;
 }else if(next==='prepare')progress=s.id==='blaster'?(e.recoveryElapsed||0)/.3:1-(e.phaseTime||0)/a.warning;
 else if(e.phase==='charge')progress=1-(e.phaseTime||0)/.52;
 let offset=progress!==null&&!c.loop?Math.floor(Math.max(0,Math.min(.9999,progress))*c.count):c.loop?Math.floor(a.elapsed*c.fps)%c.count:Math.min(c.count-1,Math.floor(a.elapsed*c.fps));
 if(reduced)offset=next==='death'?c.count-1:0;
 a.frame=c.first+offset;a.finished=next==='death'&&a.elapsed>=c.count/c.fps;a.phase=e.phase;a.flash=e.flash||0;
 return{frame:a.frame,flip:!!a.facing,rotation:0};
}
function set(body,s,key,frame,flip){body.setTexture(key,frame).setOrigin(.5,.5).setDisplaySize(s.displayWidth,s.displayHeight).setPosition(0,0).setFlipX(flip).setRotation(0).setVisible(true);}
export function applyEnemyAnimation(body,textures,s,a,e,dt,reduced=false,context){
 if(e.depthsType&&DEPTHS_SHEETS[e.depthsType])s=DEPTHS_SHEETS[e.depthsType];
 if(!DEPTHS_SHEETS[s.id]||s.key!==DEPTHS_SHEETS[s.id].key)return previous.applyEnemyAnimation(body,textures,s,a,e,dt,reduced);
 const p=advanceDepthsAnimation(s,a,e,dt,reduced,context);
 try{if(trustedDepths(textures,s.key)){const f=modernFrame(textures,s,p.frame),t=textures.get(s.key),frame=f.frame!==null&&t.get(f.frame);if(frame&&(!frame.source||frame.source.image===t.getSourceImage())&&(!frame.texture||frame.texture===t)&&(!frame.sourceIndex||frame.sourceIndex===0)){set(body,s,s.key,f.frame,p.flip);a.visualReason=f.reason;return true;}}
 if(trustedDepths(textures,s.idleKey)){set(body,s,s.idleKey,undefined,p.flip);a.visualReason='approved_static_fallback';return true;}
 }catch{/* No legacy/foreign texture ever selected for a Zone 5 entity. */}
 body.setVisible(false);a.visualReason='missing_verified_master';return true;
}
export function updateEnemyDeaths(scene,dt){if(!scene.enemyDeaths)return;scene.enemyDeaths=scene.enemyDeaths.filter(v=>{const ours=!!DEPTHS_SHEETS[v.sheet.id];const ok=applyEnemyAnimation(v.body,scene.textures,v.sheet,v.animation,v.death,dt,scene.reducedMotion);const duration=ours?v.sheet.clips.death.count/v.sheet.clips.death.fps:.65;v.body.setAlpha(Math.max(0,1-Math.max(0,v.animation.elapsed-duration*.65)/(duration*.35)));if(!ok||v.animation.finished){v.container.destroy();return false;}return true;});}
