import {ROOM} from './config.js';

export const WHITEHOT_PLATES=Object.freeze({
 key:'furnace-whitehot-plates-v038d1c-a',url:'./src/assets/furnace-whitehot-plates-v038d1c/plates-a.svg',
 width:788,height:540,cellWidth:394,cellHeight:180,frames:6,activeFrames:4,loop:.8,capacity:3,
});
const frames=Object.freeze(['0','1','2','3','4','5']);
const ys=Object.freeze([178,390,606,153,350,576]),heights=Object.freeze([124,110,120,74,110,180]);
export function preloadWhitehotPlates(scene){const s=WHITEHOT_PLATES;scene.load.svg(s.key,s.url,{width:s.width,height:s.height});}
function sourceValid(t){return t?.source?.[0]?.width===788&&t.source[0].height===540;}
function frameValid(t,i){
 const f=t.has(frames[i])&&t.get(frames[i]);
 return !!f&&f.cutX===i%2*394&&f.cutY===Math.floor(i/2)*180&&f.cutWidth===394&&f.cutHeight===180
  &&(!f.sourceIndex||f.sourceIndex===0)&&(!f.texture||f.texture===t)&&(!f.source||f.source===t.source[0]);
}
export function registerWhitehotPlates(textures){
 if(!textures.exists(WHITEHOT_PLATES.key))return false;const t=textures.get(WHITEHOT_PLATES.key);if(!sourceValid(t))return false;
 for(let i=0;i<6;i++){if(!t.has(frames[i]))t.add(frames[i],0,i%2*394,Math.floor(i/2)*180,394,180);if(!frameValid(t,i))return false;}return true;
}
export function isWhitehotPlate(run,h){
 if(run?.world?.id!=='forge'||!h.dungeon||!h.heat||h.style!=='furnace'||h.planId!=='whiteFurnace'||h.shape!=='plate'
  ||h.done||h.remaining<=0&&!h.cooling||h.x!==225||h.w!==394||h.order!==1&&h.order!==2
  ||!Number.isInteger(h.index)||h.index<0||h.index>2)return false;
 const index=(h.order-1)*3+h.index;
 if(h.y!==ys[index]||h.h!==heights[index])return false;
 for(let i=0;i<run.enemies.length;i++){const e=run.enemies[i];if(e.id===h.owner)return e.alive&&!e.final&&e.kind==='boss'&&e.bossId==='furnace'&&e.forgeType==='furnace';}
 return false;
}
// Collision is strict AABB expansion by the player's radius, not point-in-rect
// and not rounded rectangle collision. The cold guide is for the PLAYER CENTRE.
export function coldCentreTop(upper,radius){return upper.y+upper.h/2+radius;}
export function coldCentreBottom(lower,radius){return lower.y-lower.h/2-radius;}
export class WhitehotPlatesView{
 constructor(scene){
  this.scene=scene;this.run=null;this.ready=false;this.used=0;this.destroyed=false;
  this.hazards=[null,null,null];this.frameIds=[-1,-1,-1];this.cropHeights=[0,0,0];this.cacheOrder=0;this.cachePhase=-1;this.cacheRadius=-1;
  registerWhitehotPlates(scene.textures);this.texture=scene.textures.exists(WHITEHOT_PLATES.key)?scene.textures.get(WHITEHOT_PLATES.key):null;
  this.base=scene.add.graphics().setDepth(7.8);this.outline=scene.add.graphics().setDepth(16);
  this.clip=scene.make.graphics({x:0,y:0,add:false});this.clip.fillStyle(0xffffff).fillRect(ROOM.left,ROOM.top,394,550);
  this.mask=this.clip.createGeometryMask();this.base.setMask(this.mask);this.outline.setMask(this.mask);
  this.sprites=Array.from({length:3},()=>scene.add.image(0,0,'__WHITE').setDepth(7.9).setMask(this.mask).setVisible(false));
  scene.events?.once('shutdown',()=>this.destroy());
 }
 prepare(run){
  const items=run.forge?.ground.items;if(!items)return;
  let count=0;
  for(let i=0;i<items.length;i++)if(isWhitehotPlate(run,items[i])){
   const h=items[i];if(this.hazards[h.index])return;this.hazards[h.index]=h;count++;
  }
  if(count!==3)return;
  const a=this.hazards[0];
  for(let i=1;i<3;i++){const b=this.hazards[i];if(b.owner!==a.owner||b.attackToken!==a.attackToken||b.order!==a.order||b.active!==a.active||b.cooling!==a.cooling)return;}
  if(!Number.isFinite(run.player?.radius)||run.player.radius<0)return;
  const ts=this.scene.textures;if(!ts.exists(WHITEHOT_PLATES.key))return;
  const t=ts.get(WHITEHOT_PLATES.key);
  if(t!==this.texture){registerWhitehotPlates(ts);this.texture=t;for(let i=0;i<3;i++)this.frameIds[i]=-1;}
  if(!sourceValid(t))return;for(let i=0;i<6;i++)if(!frameValid(t,i))return;
  this.ready=true;
 }
 begin(run){
  if(this.destroyed)return;
  this.run=run;this.ready=false;this.used=0;this.base.setVisible(false);this.outline.setVisible(false);
  for(let i=0;i<3;i++){this.hazards[i]=null;this.sprites[i].setVisible(false);}
  this.prepare(run);
  if(!this.ready){this.base.clear();this.outline.clear();this.cachePhase=-1;return;}
  const h=this.hazards[0],phase=h.cooling?2:h.active?1:0,r=run.player.radius;
  if(this.cacheOrder!==h.order||this.cachePhase!==phase||this.cacheRadius!==r){
   this.buildSurfaces(phase,r);this.cacheOrder=h.order;this.cachePhase=phase;this.cacheRadius=r;
  }
  const alpha=phase===2?Math.max(0,h.cooling/.3)*.35:1;
  this.base.setAlpha(alpha).setVisible(true);this.outline.setAlpha(alpha).setVisible(true);
 }
 buildSurfaces(phase,r){
  const g=this.base,o=this.outline;g.clear();o.clear();
  for(let i=0;i<3;i++){
   const h=this.hazards[i],x=h.x-h.w/2,y=h.y-h.h/2;
   g.fillStyle(phase===2?0x363c3e:0x30231f,1).fillRect(x,y,h.w,h.h);
   // Full border lies INSIDE the exact rectangle, including square corners.
   o.lineStyle(phase===1?1.5:1,phase===2?0x6c7475:phase===1?0xffbc62:0xc8794f,phase===2?.5:1)
    .strokeRect(x+.75,y+.75,h.w-1.5,h.h-1.5);
  }
  if(phase===2)return;
  for(let i=1;i<3;i++){
   const upper=this.hazards[i-1],lower=this.hazards[i],top=upper.y+upper.h/2,bottom=lower.y-lower.h/2;
   const a=coldCentreTop(upper,r),b=coldCentreBottom(lower,r),left=ROOM.left+r,right=ROOM.right-r;
   // Neutral shoulders reserve the body's clearance. Only the dark central
   // lane and its inset cool outline promise a safe centre position.
   g.fillStyle(0x41494e,1).fillRect(ROOM.left,top,394,bottom-top);
   if(b<=a||right<=left)continue;
   g.fillStyle(0x101e28,1).fillRect(left,a,right-left,b-a);
   g.lineStyle(1,0x687278,.5);
   for(let x=ROOM.left+3;x<ROOM.right-8;x+=18){
    g.lineBetween(x,top+2,x+6,Math.min(a-2,top+8));
    g.lineBetween(x,Math.max(b+2,bottom-8),x+6,bottom-2);
   }
   o.lineStyle(1,0x94b8c6,.8).strokeRect(left+.5,a+.5,right-left-1,b-a-1);
  }
 }
 drawSafeZones(){return this.ready&&!this.destroyed;}
 drawHazard(h){
  if(!this.ready||this.destroyed||h!==this.hazards[h.index])return false;
  const i=h.index,cooling=h.cooling>0,active=h.active&&!cooling;
  const frame=cooling?5:!active?4:this.scene.reducedMotion?0:Math.floor((Math.max(0,h.elapsed||0)+1e-8)/.8*4)%4;
  const p=this.sprites[i];
  if(this.frameIds[i]!==frame||this.cropHeights[i]!==h.h){
   p.setTexture(WHITEHOT_PLATES.key,frames[frame]).setOrigin(.5,.5).setDisplaySize(394,180)
    .setCrop(4,(180-h.h)/2+4,386,h.h-8);
   this.frameIds[i]=frame;this.cropHeights[i]=h.h;
  }
  const progress=Math.max(0,Math.min(1,1-h.warning/h.warningTotal));
  p.setPosition(h.x,h.y).setRotation(0).setAlpha(cooling?Math.max(0,h.cooling/.3)*.25:active?1:.4+.6*progress).setVisible(true);
  this.used++;return true;
 }
 destroy(){
  if(this.destroyed)return;this.destroyed=true;
  for(let i=0;i<3;i++){this.sprites[i].destroy();this.hazards[i]=null;}
  this.sprites.length=0;this.base.destroy();this.outline.destroy();this.mask.destroy();this.clip.destroy();
  this.run=null;this.texture=null;this.ready=false;this.used=0;
 }
}
