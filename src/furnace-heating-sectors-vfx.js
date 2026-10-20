export const HEATING_SECTORS=Object.freeze({
 key:'furnace-heating-sectors-v038d1e-a',url:'./src/assets/furnace-heating-sectors-v038d1e/sectors-a.png',
 width:426,height:380,cellWidth:142,cellHeight:190,frames:6,activeFrames:4,loop:.8,capacity:3,
});
const frames=Object.freeze(['0','1','2','3','4','5']);
const xs=Object.freeze([121,329,329]),ys=Object.freeze([265,520,265]),heights=Object.freeze([190,190,150]);
export function preloadHeatingSectors(scene){scene.load.image(HEATING_SECTORS.key,HEATING_SECTORS.url);}
function sourceValid(t){return t?.source?.[0]?.width===426&&t.source[0].height===380;}
function frameValid(t,i){
 const f=t.has(frames[i])&&t.get(frames[i]);
 return !!f&&f.cutX===i%3*142&&f.cutY===Math.floor(i/3)*190&&f.cutWidth===142&&f.cutHeight===190
  &&(!f.sourceIndex||f.sourceIndex===0)&&(!f.texture||f.texture===t)&&(!f.source||f.source===t.source[0]);
}
export function registerHeatingSectors(textures){
 if(!textures.exists(HEATING_SECTORS.key))return false;const t=textures.get(HEATING_SECTORS.key);if(!sourceValid(t))return false;
 for(let i=0;i<6;i++){if(!t.has(frames[i]))t.add(frames[i],0,i%3*142,Math.floor(i/3)*190,142,190);if(!frameValid(t,i))return false;}return true;
}
export function isHeatingSector(run,h){
 if(run?.world?.id!=='forge'||!h.dungeon||!h.heat||h.style!=='furnace'||h.planId!=='sectors'||h.shape!=='plate'
  ||h.done||h.remaining<=0&&!h.cooling||h.order!==1||!Number.isInteger(h.index)||h.index<0||h.index>2
  ||h.x!==xs[h.index]||h.y!==ys[h.index]||h.w!==142||h.h!==heights[h.index])return false;
 for(let i=0;i<run.enemies.length;i++){const e=run.enemies[i];if(e.id===h.owner)return e.alive&&e.kind==='boss'&&e.bossId==='furnace'&&e.forgeType==='furnace';}
 return false;
}
export class HeatingSectorsView{
 constructor(scene){
  this.scene=scene;this.ready=false;this.used=0;this.count=0;this.phase=-1;this.cachedCount=0;this.destroyed=false;
  this.hazards=[null,null,null];this.frameIds=[-1,-1,-1];this.cropHeights=[0,0,0];
  registerHeatingSectors(scene.textures);this.texture=scene.textures.exists(HEATING_SECTORS.key)?scene.textures.get(HEATING_SECTORS.key):null;
  // Exact rectangles are wholly inside the arena. No mask or exterior glow is
  // needed; the untouched terrain between them remains the safe-space cue.
  this.base=scene.add.graphics().setDepth(7.8).setVisible(false);
  this.outline=scene.add.graphics().setDepth(16).setVisible(false);
  this.sprites=Array.from({length:3},()=>scene.add.image(0,0,'__WHITE').setDepth(7.9).setVisible(false));
  scene.events?.once('shutdown',()=>this.destroy());
 }
 begin(run){
  if(this.destroyed)return;this.ready=false;this.used=0;this.count=0;
  this.base.setVisible(false);this.outline.setVisible(false);
  for(let i=0;i<3;i++){this.hazards[i]=null;this.sprites[i].setVisible(false);}
  const items=run.forge?.ground.items;if(!items)return;
  for(let i=0;i<items.length;i++){
   const h=items[i];if(h.planId!=='sectors')continue;
   if(!isHeatingSector(run,h)||this.hazards[h.index])return;
   this.hazards[h.index]=h;this.count++;
  }
  if(this.count!==2&&this.count!==3||!this.hazards[0]||!this.hazards[1])return;
  const a=this.hazards[0];
  // Do not re-read HP to decide the count: the existing plan owns the count,
  // even if HP crosses 50% while its already-created rectangles are active.
  for(let i=1;i<this.count;i++){const b=this.hazards[i];if(!b||b.owner!==a.owner||b.attackToken!==a.attackToken||b.active!==a.active||b.cooling!==a.cooling||b.warning!==a.warning||b.elapsed!==a.elapsed)return;}
  const ts=this.scene.textures;if(!ts.exists(HEATING_SECTORS.key))return;
  const t=ts.get(HEATING_SECTORS.key);if(t!==this.texture){registerHeatingSectors(ts);this.texture=t;for(let i=0;i<3;i++)this.frameIds[i]=-1;}
  if(!sourceValid(t))return;for(let i=0;i<6;i++)if(!frameValid(t,i))return;
  const phase=a.cooling?2:a.active?1:0;
  if(this.phase!==phase||this.cachedCount!==this.count){this.build(phase);this.phase=phase;this.cachedCount=this.count;}
  const progress=Math.max(0,Math.min(1,1-a.warning/a.warningTotal)),cool=Math.max(0,a.cooling/.3);
  this.base.setAlpha(phase===2?cool*.45:1).setVisible(true);
  this.outline.setAlpha(phase===2?cool*.5:phase===1?1:.9+.1*progress).setVisible(true);
  this.ready=true;
 }
 build(phase){
  this.base.clear();this.outline.clear();
  for(let i=0;i<this.count;i++){
   const h=this.hazards[i],x=h.x-h.w/2,y=h.y-h.h/2;
   this.base.fillStyle(phase===1?0xf77e16:phase===0?0x9a281c:0x44241d,phase===0?.17:1).fillRect(x,y,h.w,h.h);
   // All stroke pixels stay inside the actual rectangle, including corners.
   this.outline.lineStyle(1.5,phase===1?0xffe76e:phase===0?0xff7044:0x8b4930,1).strokeRect(x+.75,y+.75,h.w-1.5,h.h-1.5);
  }
 }
 drawHazard(h){
  if(!this.ready||this.destroyed||h!==this.hazards[h.index])return false;
  const i=h.index,phase=h.cooling?2:h.active?1:0;
  const frame=phase===2?5:phase===0?4:this.scene.reducedMotion?0:Math.floor((Math.max(0,h.elapsed||0)+1e-8)/.8*4)%4,p=this.sprites[i];
  if(this.frameIds[i]!==frame||this.cropHeights[i]!==h.h){
   p.setTexture(HEATING_SECTORS.key,frames[frame]).setOrigin(.5,.5).setDisplaySize(142,190).setCrop(2,(190-h.h)/2+2,138,h.h-4);
   this.frameIds[i]=frame;this.cropHeights[i]=h.h;
  }
  const progress=Math.max(0,Math.min(1,1-h.warning/h.warningTotal));
  p.setPosition(h.x,h.y).setRotation(0).setAlpha(phase===2?Math.max(0,h.cooling/.3)*.65:phase===1?1:Math.pow(progress,1.7)*.85).setVisible(true);
  this.used++;return true;
 }
 destroy(){
  if(this.destroyed)return;this.destroyed=true;for(let i=0;i<3;i++){this.sprites[i].destroy();this.hazards[i]=null;}
  this.sprites.length=0;this.base.destroy();this.outline.destroy();this.texture=null;this.ready=false;this.used=0;
 }
}
