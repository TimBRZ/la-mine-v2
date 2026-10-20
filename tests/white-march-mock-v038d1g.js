import {WHITE_MARCH as S} from '../src/furnace-white-march-vfx.js';
export function mock(){
 const frames=new Map(),source={width:S.width,height:S.height},texture={source:[source],has:k=>frames.has(k),get:k=>frames.get(k),add:(k,_,x,y,w,h)=>frames.set(k,{cutX:x,cutY:y,cutWidth:w,cutHeight:h,source,sourceIndex:0})};
 const textures={present:true,exists:k=>textures.present&&k===S.key,get:()=>texture},images=[],graphics=[],hooks=[];
 function object(){const p={calls:[],dead:0};for(const m of ['setDepth','setVisible','setPosition','setRotation','setAlpha','setTexture','setOrigin','setDisplaySize','fillStyle','fillCircle','lineStyle','strokeCircle','lineBetween','fillPoints','strokePoints'])p[m]=(...a)=>{p[m+'Args']=a;p.calls.push([m,...a]);return p;};p.clear=()=>{p.calls.length=0;return p;};p.destroy=()=>p.dead++;return p;}
 const scene={textures,reducedMotion:false,events:{once:(_,f)=>hooks.push(f)},add:{graphics:()=>{const g=object();graphics.push(g);return g;},image:()=>{const p=object();images.push(p);return p;}}};
 const g=object();return {scene,textures,texture,frames,images,graphics,g,shutdown:()=>hooks.forEach(f=>f())};
}
