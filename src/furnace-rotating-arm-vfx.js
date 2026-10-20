import {ROOM} from './config.js';

// Version B is a material inside the admitted capsules, never a second clock.
// Six atlas cells: four 0.8s-loop active frames, warning, cooling. 2x raster.
export const FURNACE_ARM=Object.freeze({
 key:'furnace-rotating-arm-v038d1b',url:'./src/assets/furnace-rotating-arm-v038d1b/arm-b.svg',
 width:2124,height:64,cellWidth:354,cellHeight:64,frames:6,activeFrames:4,loop:.8,
 length:145,radius:14,padding:2,displayWidth:177,displayHeight:32,originX:16/177,originY:.5,
 capacity:2,depth:7.9,outlineDepth:16,
});
const frames=Object.freeze(['0','1','2','3','4','5']);
export function preloadFurnaceArm(scene){const s=FURNACE_ARM;scene.load.svg(s.key,s.url,{width:s.width,height:s.height});}
function sourceValid(t){return t?.source?.[0]?.width===2124&&t.source[0].height===64;}
function frameValid(t,i){
 const f=t.has(frames[i])&&t.get(frames[i]);
 return !!f&&f.cutX===i*354&&f.cutY===0&&f.cutWidth===354&&f.cutHeight===64
  &&(!f.sourceIndex||f.sourceIndex===0)&&(!f.texture||f.texture===t)&&(!f.source||f.source===t.source[0]);
}
export function registerFurnaceArm(textures){
 if(!textures.exists(FURNACE_ARM.key))return false;
 const t=textures.get(FURNACE_ARM.key);if(!sourceValid(t))return false;
 for(let i=0;i<6;i++){if(!t.has(frames[i]))t.add(frames[i],0,i*354,0,354,64);if(!frameValid(t,i))return false;}return true;
}
export function isFurnaceArm(run,h){
 if(run?.world?.id!=='forge'||!h.dungeon||!h.heat||h.shape!=='arm'||h.style!=='furnace'
  ||h.planId!=='furnaceTurn'||h.length!==145||h.width!==14||!h.owner||h.done
  ||h.remaining<=0&&!h.cooling||!Number.isFinite(h.x+h.y+h.angle+h.spin)||Math.abs(h.spin)!==.42)return false;
 for(let i=0;i<run.enemies.length;i++){const e=run.enemies[i];if(e.id===h.owner)return e.alive&&e.kind==='boss'&&e.bossId==='furnace'&&e.forgeType==='furnace';}
 return false;
}
function pairValid(a,b){
 return a&&b&&a.owner===b.owner&&a.attackToken===b.attackToken&&a.active===b.active
  &&a.cooling===b.cooling&&a.spin===b.spin&&Math.abs(a.x-b.x)<1e-7&&Math.abs(a.y-b.y)<1e-7
  &&Math.abs(Math.cos(a.angle-b.angle)+1)<1e-9;
}
// The inner semicircles overlap: draw only the union's exterior, no false seam
// or central safe hole. Insets keep the entire stroke within radius 14.
function outerArm(g,angle,r){
 const c=Math.cos(angle),s=Math.sin(angle),nx=-s*r,ny=c*r,bx=c*145,by=s*145;
 g.beginPath().moveTo(nx,ny).lineTo(bx+nx,by+ny)
  .arc(bx,by,r,angle+Math.PI/2,angle-Math.PI/2,true)
  .lineTo(-nx,-ny).strokePath();
}
function directionArrow(g,angle,spin,alpha){
 const c=Math.cos(angle),s=Math.sin(angle),sign=Math.sign(spin),nx=-s*sign,ny=c*sign;
 const x=c*82,y=s*82;
 // Telegraph marker fully inside the capsule, tangent to the real spin.
 g.lineStyle(1.5,0xffe7a2,alpha).lineBetween(x-nx*5,y-ny*5,x+nx*5,y+ny*5)
  .lineBetween(x+nx*5,y+ny*5,x+nx+c*3,y+ny+s*3)
  .lineBetween(x+nx*5,y+ny*5,x+nx-c*3,y+ny-s*3);
}
export class FurnaceArmView{
 constructor(scene){
  this.scene=scene;this.run=null;this.first=null;this.second=null;this.ready=false;this.used=0;this.destroyed=false;this.outlineState=-1;
  registerFurnaceArm(scene.textures);
  this.texture=scene.textures.exists(FURNACE_ARM.key)?scene.textures.get(FURNACE_ARM.key):null;
  this.outline=scene.add.graphics().setDepth(FURNACE_ARM.outlineDepth);
  this.clip=scene.make.graphics({x:0,y:0,add:false});
  this.clip.fillStyle(0xffffff).fillRect(ROOM.left,ROOM.top,ROOM.right-ROOM.left,ROOM.bottom-ROOM.top);
  this.mask=this.clip.createGeometryMask();this.outline.setMask(this.mask);
  this.sprites=Array.from({length:2},()=>scene.add.image(0,0,'__WHITE').setDepth(FURNACE_ARM.depth).setMask(this.mask).setVisible(false));
  scene.events?.once('shutdown',()=>this.destroy());
 }
 begin(run){
  if(this.destroyed)return;
  this.run=run;this.first=null;this.second=null;this.ready=false;this.used=0;this.outline.setVisible(false);
  for(let i=0;i<2;i++)this.sprites[i].setVisible(false);
  this.prepare(run);
  if(!this.ready){this.outline.clear();this.outlineState=-1;}
 }
 prepare(run){
  const hazards=run.forge?.ground.items;if(!hazards)return;
  for(let i=0;i<hazards.length;i++)if(isFurnaceArm(run,hazards[i])){
   if(!this.first)this.first=hazards[i];else if(!this.second)this.second=hazards[i];else return;
  }
  if(!pairValid(this.first,this.second))return;
  const ts=this.scene.textures;if(!ts.exists(FURNACE_ARM.key))return;
  const t=ts.get(FURNACE_ARM.key);
  // A late successful load or a recreated texture may register once. A damaged
  // existing atlas is not repaired silently; it uses the old procedural view.
  if(t!==this.texture){registerFurnaceArm(ts);this.texture=t;}
  if(!sourceValid(t))return;
  for(let i=0;i<6;i++)if(!frameValid(t,i))return;
  this.ready=true;
 }
 drawHazard(h){
  if(!this.ready||this.destroyed||h!==this.first&&h!==this.second)return false;
  const cooling=h.cooling>0,active=h.active&&!cooling;
  const frame=cooling?5:!active?4:this.scene.reducedMotion?0:Math.floor((Math.max(0,h.elapsed||0)+1e-8)/.8*4)%4;
  const alpha=cooling?Math.min(1,h.cooling/.3)*.55:1;
  const sprite=this.sprites[h===this.first?0:1];
  sprite.setTexture(FURNACE_ARM.key,frames[frame]).setOrigin(FURNACE_ARM.originX,.5)
   .setDisplaySize(177,32).setPosition(h.x,h.y).setRotation(h.angle).setAlpha(alpha).setVisible(true);
  if(h===this.first){
   const g=this.outline,state=(cooling?2:active?1:0)+(h.spin<0?3:0);
   // Cache both local outlines. Only phase / signed direction rebuilds them;
   // the Graphics transform follows the same current origin and angle.
   if(state!==this.outlineState){
    g.clear();
    for(let i=0;i<2;i++){
     const angle=i*Math.PI;
     g.lineStyle(3,0x171b20,1);outerArm(g,angle,12.5);
     g.lineStyle(active?1.5:1,cooling?0x9b6847:active?0xffaf3d:0xffd27a,1);outerArm(g,angle,active?13.25:13.5);
     if(!cooling)directionArrow(g,angle,h.spin,active?.5:1);
    }
    this.outlineState=state;
   }
   g.setPosition(h.x,h.y).setRotation(h.angle).setAlpha(cooling?alpha*.6:active?.95:.85).setVisible(true);
  }
  this.used++;return true;
 }
 destroy(){
  if(this.destroyed)return;this.destroyed=true;
  for(let i=0;i<this.sprites.length;i++)this.sprites[i].destroy();
  this.sprites.length=0;this.outline.destroy();this.mask.destroy();this.clip.destroy();
  this.run=null;this.first=null;this.second=null;this.texture=null;this.ready=false;this.used=0;
 }
}
