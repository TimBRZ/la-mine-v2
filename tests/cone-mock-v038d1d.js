import {FURNACE_CONE as S} from '../src/furnace-cone-vfx.js';
export function mock(present=true){
 const frames=new Map(),source={width:S.width,height:S.height},texture={source:[source],has:k=>frames.has(k),get:k=>frames.get(k),add:(k,_,x,y,w,h)=>frames.set(k,{cutX:x,cutY:y,cutWidth:w,cutHeight:h,source,sourceIndex:0})};
 const textures={present,exists:k=>textures.present&&k===S.key,get:()=>texture},images=[],graphics=[],hooks=[];let count=0;
 const make=()=>{const calls=[],mask={destroy(){mask.dead=true;}},g={calls,mask};
  for(const name of ['setDepth','setMask','setVisible','setPosition','setRotation','setAlpha','fillStyle','fillRect','lineStyle','beginPath','moveTo','lineTo','arc','strokePath','lineBetween','strokeRect','fillCircle','fillPoints','strokePoints','destroy'])g[name]=(...args)=>{g[name+'Args']=args;calls.push([name,...args]);return g;};
  g.clear=()=>{calls.length=0;return g;};g.createGeometryMask=()=>mask;graphics.push(g);count++;return g;
 };
 const scene={textures,reducedMotion:false,events:{once:(_,f)=>hooks.push(f)},make:{graphics:make},add:{graphics:make,image:()=>{
  const p={calls:[]};for(const name of ['setDepth','setMask','setVisible','setTexture','setOrigin','setDisplaySize','setCrop','setPosition','setRotation','setAlpha','destroy'])p[name]=(...args)=>{p[name+'Args']=args;p.calls.push([name,...args]);return p;};images.push(p);count++;return p;
 }}};
 return {scene,textures,texture,frames,images,graphics,g:make(),count:()=>count,shutdown:()=>hooks.forEach(f=>f())};
}
