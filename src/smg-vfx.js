// Visual-only SMG layer. Other weapons delegate unchanged to the previous resolver.
import {combatVfxSpec as previousSpec,useCombatVfx as previousVfx} from './shotgun-vfx.js';
import {useWeaponVfx} from './weapon-visuals.js';
const sheet=(id,frames,cellHeight,duration,width,height,originX,fallback)=>Object.freeze({key:'smg-v038b2-'+id,url:'./src/assets/smg-v038b2/'+id+'-v1.svg',frames,cellWidth:32,cellHeight,duration,width,height,originX,originY:.5,fallback});
export const SMG_VFX=Object.freeze({
 'muzzle-smg':sheet('flash',3,32,.05,19,16,0,'muzzle-smg'),
 'projectile-smg':sheet('tracer',1,16,1,16,5,.5,'projectile-smg'),
 'impact-smg':sheet('impact',3,32,.075,16,16,.5,'impact-ballistic'),
});
export const SMG_IMPACT_CAP=6;
export const combatVfxSpec=kind=>SMG_VFX[kind]||previousSpec(kind);
export function preloadSmgVfx(scene){for(const s of Object.values(SMG_VFX))scene.load.svg(s.key,s.url,{width:s.frames*s.cellWidth,height:s.cellHeight});}
function valid(t,s){return t?.source?.[0]?.width===s.frames*s.cellWidth&&t.source[0].height===s.cellHeight;}
function frameValid(t,s,i){if(!t.has(String(i)))return false;const f=t.get(String(i));return f.cutX===i*s.cellWidth&&f.cutY===0&&f.cutWidth===s.cellWidth&&f.cutHeight===s.cellHeight;}
export function registerSmgVfx(textures){let ready=true;for(const s of Object.values(SMG_VFX)){
 if(!textures.exists(s.key)){ready=false;continue;}const t=textures.get(s.key);if(!valid(t,s)){ready=false;continue;}
 for(let i=0;i<s.frames;i++){if(!t.has(String(i)))t.add(String(i),0,i*s.cellWidth,0,s.cellWidth,s.cellHeight);if(!frameValid(t,s,i))ready=false;}
 }return ready;}
export function useCombatVfx(image,textures,kind,elapsed=0){const s=SMG_VFX[kind];if(!s)return previousVfx(image,textures,kind,elapsed);
 if(textures.exists(s.key)){const t=textures.get(s.key),age=Number.isFinite(elapsed)?Math.max(0,elapsed):0,i=Math.min(s.frames-1,Math.floor(age/s.duration*s.frames));
  if(valid(t,s)&&frameValid(t,s,i)){image.setTexture(s.key,String(i)).setOrigin(s.originX,s.originY);return s;}}
 return useWeaponVfx(image,textures,s.fallback,elapsed);
}
// Pure presentation clock: never writes Weapon.flash/cooldown or influences firing.
export function muzzleVisible(weaponId,shotAge,legacyFlash){return weaponId==='smg'?shotAge>=0&&shotAge<SMG_VFX['muzzle-smg'].duration:legacyFlash>0;}
