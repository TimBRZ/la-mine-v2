// Presentation only: no simulation imports, combat mutations or animation timers.
export const WEAPON_VFX_DEPTH=7; // Existing hostile telegraphs remain above these decorations.
export const WEAPON_VFX_ATLAS=Object.freeze({key:'combat-v033-vfx',url:'./src/assets/combat-v033/vfx-atlas.svg',width:512,height:128,cell:32,columns:16});
const strip=(start,frames,duration,options={})=>Object.freeze({start,frames,duration,originX:.5,originY:.5,...options});
export const WEAPON_VFX=Object.freeze({
 'muzzle-shotgun':strip(0,3,.065,{originX:0,width:32,height:26}),
 'muzzle-smg':strip(3,2,.035,{originX:0,width:19,height:16}),
 'muzzle-grisoux':strip(5,3,.07,{originX:0,width:28,height:24}),
 'impact-ballistic':strip(8,4,.12,{width:23,height:23}),
 'impact-energy':strip(12,5,.17,{width:27,height:27}),
 'overload-energy':strip(17,6,.22,{width:40,height:40}),
 spark:strip(23,4,.14,{width:10,height:10}),
 'projectile-energy':strip(27,4,.16,{loop:true,width:24,height:24}),
 dust:strip(31,4,.22,{width:18,height:18}),
 conduction:strip(35,4,.13,{width:26,height:26}),
 'projectile-shotgun':strip(39,1,1,{width:18,height:18}),
 'projectile-smg':strip(40,1,1,{width:24,height:24}),
});
const weapon=(id,width,details)=>Object.freeze({id,key:'combat-v033-'+id,url:'./src/assets/combat-v033/'+id+'.svg',width,height:width,originX:.5,originY:.45,...details});
export const WEAPON_VISUALS=Object.freeze({
 shotgun:weapon('shotgun',34,{grip:Object.freeze({x:24,y:70}),barrel:Object.freeze({x:124,y:52}),muzzle:'muzzle-shotgun',impact:'impact-ballistic',recoilScale:1.2,color:0xf0ecdf}),
 smg:weapon('smg',32,{grip:Object.freeze({x:35,y:72}),barrel:Object.freeze({x:120,y:55}),muzzle:'muzzle-smg',impact:'impact-ballistic',recoilScale:1,color:0xf0ecdf}),
 grisoux:weapon('grisoux',34,{grip:Object.freeze({x:57,y:81}),barrel:Object.freeze({x:117,y:57}),muzzle:'muzzle-grisoux',impact:'impact-energy',recoilScale:1.1,color:0x82e8c2}),
});
export function weaponVisual(id) { return WEAPON_VISUALS[id]||WEAPON_VISUALS.shotgun; }
// Source-space grip coordinates, not a gameplay socket. Canvas Y points down.
// Keep the glove connection through recoil; only the remaining <=1px is gun kick.
export function heldWeaponPose(id,angle,recoil=0,previousX=null,dt=0) {
 const visual=weaponVisual(id),c=Math.cos(angle),s=Math.sin(angle),mirror=c<-.1?-1:1;
 const targetX=mirror*(11.7-.7*Math.abs(s));
 const travel=Math.min(3,90*Math.max(0,dt));
 const handX=previousX==null?targetX:previousX+Math.max(-travel,Math.min(travel,targetX-previousX));
 const kick=Math.min(1,Math.max(0,recoil)*visual.recoilScale*.12);
 const x=handX-c*kick,y=-.4+1.2*s-s*kick;
 const bx=(visual.barrel.x-visual.grip.x)*visual.width/128;
 const by=(visual.barrel.y-visual.grip.y)*visual.height/128*mirror;
 return {x,y,handX,mirror,angle,muzzleX:x+c*bx-s*by,muzzleY:y+s*bx+c*by};
}
export function preloadWeaponVisuals(scene) {
 for(const visual of Object.values(WEAPON_VISUALS))scene.load.svg(visual.key,visual.url,{width:128,height:128});
 scene.load.svg(WEAPON_VFX_ATLAS.key,WEAPON_VFX_ATLAS.url,{width:WEAPON_VFX_ATLAS.width,height:WEAPON_VFX_ATLAS.height});
}
function validAtlas(texture) {
 const source=texture?.source?.[0];
 return source?.width===WEAPON_VFX_ATLAS.width&&source?.height===WEAPON_VFX_ATLAS.height;
}
function validFrame(texture,name,index) {
 if(!texture.has(name))return false;
 const frame=texture.get(name),{cell,columns}=WEAPON_VFX_ATLAS;
 return frame.cutX===(index%columns)*cell&&frame.cutY===Math.floor(index/columns)*cell&&frame.cutWidth===cell&&frame.cutHeight===cell;
}
export function registerWeaponVisualFrames(textures) {
 if(!textures.exists(WEAPON_VFX_ATLAS.key))return false;
 const texture=textures.get(WEAPON_VFX_ATLAS.key),{cell,columns}=WEAPON_VFX_ATLAS;
 if(!validAtlas(texture))return false;
 for(const [kind,visual] of Object.entries(WEAPON_VFX))for(let i=0;i<visual.frames;i++){
  const name=kind+'-'+i,cellIndex=visual.start+i;
  if(texture.has(name)&&!validFrame(texture,name,cellIndex))return false;
  if(!texture.has(name))texture.add(name,0,(cellIndex%columns)*cell,Math.floor(cellIndex/columns)*cell,cell,cell);
 }
 return true;
}
export function vfxFrame(kind,elapsed=0) {
 const visual=WEAPON_VFX[kind];if(!visual)return null;
 const time=Number.isFinite(elapsed)?Math.max(0,elapsed):0;
 const step=Math.floor(time/visual.duration*visual.frames);
 return kind+'-'+(visual.loop?step%visual.frames:Math.min(visual.frames-1,step));
}
// A failed/partial load returns null and leaves the caller's existing fallback untouched.
export function useWeaponVfx(image,textures,kind,elapsed=0) {
 const visual=WEAPON_VFX[kind],frame=vfxFrame(kind,elapsed);
 if(!visual||!textures.exists(WEAPON_VFX_ATLAS.key))return null;
 const texture=textures.get(WEAPON_VFX_ATLAS.key),index=visual.start+Number(frame.slice(frame.lastIndexOf('-')+1));
 if(!validAtlas(texture)||!validFrame(texture,frame,index))return null;
 image.setTexture(WEAPON_VFX_ATLAS.key,frame).setOrigin(visual.originX,visual.originY);
 return visual;
}

