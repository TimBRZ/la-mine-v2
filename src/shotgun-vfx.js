// Presentation only. Versioned keys isolate these sheets from every other weapon.
import {WEAPON_VFX,useWeaponVfx} from './weapon-visuals.js';
const sheet=(id,file,frames,duration,width,height,originX,fallback)=>Object.freeze({key:'shotgun-v038b1-'+id,url:'./src/assets/shotgun-v038b1/'+file+'-v1.svg',frames,duration,width,height,originX,originY:.5,cell:64,fallback});
export const SHOTGUN_VFX=Object.freeze({
 'muzzle-shotgun':sheet('flash','flash',3,.065,32,26,0,'muzzle-shotgun'),
 'projectile-shotgun':sheet('pellet','pellet',1,1,18,18,.5,'projectile-shotgun'),
 'impact-shotgun':sheet('impact','impact',4,.12,23,23,.5,'impact-ballistic'),
});
export const SHOTGUN_IMPACT_CAP=8;
export const combatVfxSpec=kind=>SHOTGUN_VFX[kind]||WEAPON_VFX[kind];
export function preloadShotgunVfx(scene){for(const s of Object.values(SHOTGUN_VFX))scene.load.svg(s.key,s.url,{width:s.frames*s.cell,height:s.cell});}
function validTexture(t,s){return t?.source?.[0]?.width===s.frames*s.cell&&t.source[0].height===s.cell;}
function validFrame(t,s,i){if(!t.has(String(i)))return false;const f=t.get(String(i));return f.cutX===i*s.cell&&f.cutY===0&&f.cutWidth===s.cell&&f.cutHeight===s.cell;}
export function registerShotgunVfx(textures){let ready=true;for(const s of Object.values(SHOTGUN_VFX)){
 if(!textures.exists(s.key)){ready=false;continue;}const t=textures.get(s.key);
 if(!validTexture(t,s)){ready=false;continue;}
 for(let i=0;i<s.frames;i++){if(!t.has(String(i)))t.add(String(i),0,i*s.cell,0,s.cell,s.cell);if(!validFrame(t,s,i))ready=false;}
 }return ready;}
export function useCombatVfx(image,textures,kind,elapsed=0){const s=SHOTGUN_VFX[kind];
 if(s&&textures.exists(s.key)){const t=textures.get(s.key),time=Number.isFinite(elapsed)?Math.max(0,elapsed):0,i=Math.min(s.frames-1,Math.floor(time/s.duration*s.frames));
  if(validTexture(t,s)&&validFrame(t,s,i)){image.setTexture(s.key,String(i)).setOrigin(s.originX,s.originY);return s;}
 }
 return useWeaponVfx(image,textures,s?.fallback||kind,elapsed);
}
