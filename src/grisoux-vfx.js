// Presentation only. Gameplay/perk events remain the source of truth.
import {combatVfxSpec as previousSpec,useCombatVfx as previousVfx,muzzleVisible as previousMuzzle} from './smg-vfx.js';
import {useWeaponVfx} from './weapon-visuals.js';
const sheet=(id,frames,cw,ch,duration,width,height,fallback,originX=.5,loop=false)=>Object.freeze({key:'grisoux-v038b3-'+id,url:'./src/assets/grisoux-v038b3/'+id+'-v1.svg',frames,cellWidth:cw,cellHeight:ch,duration,width,height,fallback,originX,originY:.5,loop});
export const GRISOUX_VFX=Object.freeze({
 'muzzle-grisoux':sheet('flash',3,32,32,.06,24,20,'muzzle-grisoux',0),
 // The round core (20,10) is the visual socket, not the middle of the tail.
 'projectile-energy':Object.freeze({...sheet('orb',4,32,20,.09,18,11.25,'projectile-energy',20/32,true),stableShape:true}),
 'impact-energy':sheet('impact',4,32,32,.09,20,20,'impact-energy'),
 conduction:sheet('conduit',4,64,16,.09,34,10,'conduction'),
 'arc-energy':sheet('arc',4,128,16,.09,64,8,'conduction',0),
 'overload-grisoux':sheet('overload',6,64,64,.12,60,60,'overload-energy'),
});
export const GRISOUX_CAPS=Object.freeze({'impact-energy':6,conduction:6,'arc-energy':3,'overload-grisoux':2});
export const GRISOUX_LEGACY_BOLT=sheet('bolt',4,32,16,.09,20,9,'projectile-energy',.5,true);
const sheets=[...Object.values(GRISOUX_VFX),GRISOUX_LEGACY_BOLT];
export const combatVfxSpec=kind=>GRISOUX_VFX[kind]||previousSpec(kind);
export function preloadGrisouxVfx(scene){for(const s of sheets)scene.load.svg(s.key,s.url,{width:s.frames*s.cellWidth,height:s.cellHeight});}
function valid(t,s){return t?.source?.[0]?.width===s.frames*s.cellWidth&&t.source[0].height===s.cellHeight;}
function frameValid(t,s,i){if(!t.has(String(i)))return false;const f=t.get(String(i));return f.cutX===i*s.cellWidth&&f.cutY===0&&f.cutWidth===s.cellWidth&&f.cutHeight===s.cellHeight;}
export function registerGrisouxVfx(textures){let ready=true;for(const s of sheets){
 if(!textures.exists(s.key)){ready=false;continue;}const t=textures.get(s.key);if(!valid(t,s)){ready=false;continue;}
 for(let i=0;i<s.frames;i++){if(!t.has(String(i)))t.add(String(i),0,i*s.cellWidth,0,s.cellWidth,s.cellHeight);if(!frameValid(t,s,i))ready=false;}
 }return ready;}
export function useCombatVfx(image,textures,kind,elapsed=0){const s=GRISOUX_VFX[kind];if(!s)return previousVfx(image,textures,kind,elapsed);
 const age=Number.isFinite(elapsed)?Math.max(0,elapsed):0,step=Math.floor(age/s.duration*s.frames),i=s.loop?step%s.frames:Math.min(s.frames-1,step);
 if(textures.exists(s.key)){const t=textures.get(s.key);if(valid(t,s)&&frameValid(t,s,i)){image.setTexture(s.key,String(i)).setOrigin(s.originX,s.originY);return s;}}
 // Only an unavailable/unusable orb may fall back to the previous energy bolt.
 if(kind==='projectile-energy'&&textures.exists(GRISOUX_LEGACY_BOLT.key)){
  const b=GRISOUX_LEGACY_BOLT,t=textures.get(b.key);
  if(valid(t,b)&&frameValid(t,b,i)){image.setTexture(b.key,String(i)).setOrigin(b.originX,b.originY);return b;}
 }
 const fallback=useWeaponVfx(image,textures,s.fallback,elapsed);
 // The old conduction art remains energy-only; anchor its stretched chain at source.
 if(fallback&&kind==='arc-energy')image.setOrigin(0,.5);
 return fallback;
}
export function muzzleVisible(id,age,legacy){return id==='grisoux'?age>=0&&age<.06:previousMuzzle(id,age,legacy);}
// No nova on an Arc kill, an ordinary kill, or a final/non-piercing impact.
// Perks cannot change while a projectile is in flight in the current run flow.
export function overloadFeedback(event,weapon){return event.type==='kill'&&event.energy===true&&event.source!=='arc'&&event.continuing===true&&weapon.energyOverload===true;}
