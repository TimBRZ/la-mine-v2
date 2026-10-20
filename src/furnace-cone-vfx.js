import {ROOM} from './config.js';
export const FURNACE_CONE=Object.freeze({
 key:'furnace-cone-v038d1d-a',url:'./src/assets/furnace-cone-v038d1d/cone-a.png',
 width:690,height:560,cellWidth:230,cellHeight:280,originX:2,originY:140,
 radius:225,spread:.66,frames:6,activeFrames:4,loop:.8,capacity:1,
});
const frames=Object.freeze(['0','1','2','3','4','5']);
export function preloadFurnaceCone(scene){const s=FURNACE_CONE;scene.load.image(s.key,s.url);}
function sourceValid(t){return t?.source?.[0]?.width===690&&t.source[0].height===560;}
function frameValid(t,i){
 const f=t.has(frames[i])&&t.get(frames[i]);
 return !!f&&f.cutX===i%3*230&&f.cutY===Math.floor(i/3)*280&&f.cutWidth===230&&f.cutHeight===280
  &&(!f.sourceIndex||f.sourceIndex===0)&&(!f.texture||f.texture===t)&&(!f.source||f.source===t.source[0]);
}
export function registerFurnaceCone(textures){
 if(!textures.exists(FURNACE_CONE.key))return false;const t=textures.get(FURNACE_CONE.key);if(!sourceValid(t))return false;
 for(let i=0;i<6;i++){if(!t.has(frames[i]))t.add(frames[i],0,i%3*230,Math.floor(i/3)*280,230,280);if(!frameValid(t,i))return false;}return true;
}
export function isFurnaceCone(run,h){
 if(run?.world?.id!=='forge'||!h.dungeon||!h.heat||h.style!=='furnace'||h.planId!=='furnaceCone'||h.shape!=='cone'
  ||h.radius!==225||h.spread!==.66||h.done||h.remaining<=0&&!h.cooling
  ||!Number.isFinite(h.x)||!Number.isFinite(h.y)||!Number.isFinite(h.angle))return false;
 for(let i=0;i<run.enemies.length;i++){const e=run.enemies[i];if(e.id===h.owner)return e.alive&&e.kind==='boss'&&e.bossId==='furnace'&&e.forgeType==='furnace';}
 return false;
}
export class FurnaceConeView{
 constructor(scene){
  this.scene=scene;this.hazard=null;this.ready=false;this.used=0;this.frameId=-1;this.phase=-1;this.destroyed=false;
  registerFurnaceCone(scene.textures);this.texture=scene.textures.exists(FURNACE_CONE.key)?scene.textures.get(FURNACE_CONE.key):null;
  this.clip=scene.make.graphics({x:0,y:0,add:false});this.clip.fillStyle(0xffffff).fillRect(ROOM.left,ROOM.top,394,550);this.mask=this.clip.createGeometryMask();
  this.sprite=scene.add.image(0,0,'__WHITE').setDepth(7.9).setMask(this.mask).setVisible(false);
  this.outline=scene.add.graphics().setDepth(16).setMask(this.mask).setVisible(false);
  scene.events?.once('shutdown',()=>this.destroy());
 }
 begin(run){
  if(this.destroyed)return;this.ready=false;this.used=0;this.hazard=null;this.sprite.setVisible(false);this.outline.setVisible(false);
  const items=run.forge?.ground.items;if(!items)return;
  let count=0;for(let i=0;i<items.length;i++)if(isFurnaceCone(run,items[i])){this.hazard=items[i];count++;}
  if(count!==1){this.hazard=null;return;}
  const ts=this.scene.textures;if(!ts.exists(FURNACE_CONE.key))return;
  const t=ts.get(FURNACE_CONE.key);
  if(t!==this.texture){registerFurnaceCone(ts);this.texture=t;this.frameId=-1;}
  if(!sourceValid(t))return;for(let i=0;i<6;i++)if(!frameValid(t,i))return;
  this.ready=true;
 }
 buildOutline(phase){
  const g=this.outline;g.clear();
  // Offset both rays inward by half the stroke width. The circular stroke
  // reaches exactly R=225; the apex never protrudes behind the real origin.
  const inset=.6,r=225-inset,a=.66-Math.asin(inset/r),apex=inset/Math.sin(.66);
  g.lineStyle(1.2,phase===1?0xfff36b:phase===0?0xc15327:0x70432e,1)
   .beginPath().moveTo(apex,0).lineTo(r*Math.cos(a),-r*Math.sin(a))
   .arc(0,0,r,-a,a,false).lineTo(apex,0).strokePath();
  // Small connector above the boss, still strictly within the same sector.
  if(phase===1)g.fillStyle(0xfff6a2,.9).fillPoints([{x:0,y:0},{x:12,y:-4},{x:12,y:4}],true);
 }
 drawHazard(h){
  if(!this.ready||this.destroyed||h!==this.hazard)return false;
  const phase=h.cooling?2:h.active?1:0,frame=phase===2?5:phase===0?4:this.scene.reducedMotion?0:Math.floor((Math.max(0,h.elapsed||0)+1e-8)/.8*4)%4;
  const p=this.sprite;
  if(this.frameId!==frame){p.setTexture(FURNACE_CONE.key,frames[frame]).setOrigin(2/230,.5).setDisplaySize(230,280);this.frameId=frame;}
  if(this.phase!==phase){this.buildOutline(phase);this.phase=phase;}
  const progress=Math.max(0,Math.min(1,1-h.warning/h.warningTotal));
  const alpha=phase===2?Math.max(0,h.cooling/.3)*.3:phase===1?1:.23+.47*progress;
  p.setPosition(h.x,h.y).setRotation(h.angle).setAlpha(alpha).setVisible(true);
  this.outline.setPosition(h.x,h.y).setRotation(h.angle).setAlpha(phase===0?.5+.5*progress:phase===2?alpha:1).setVisible(true);
  this.used=1;return true;
 }
 destroy(){
  if(this.destroyed)return;this.destroyed=true;this.sprite.destroy();this.outline.destroy();this.mask.destroy();this.clip.destroy();
  this.hazard=null;this.texture=null;this.ready=false;this.used=0;
 }
}
