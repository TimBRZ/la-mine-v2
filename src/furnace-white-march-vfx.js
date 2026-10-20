import {COMBAT_LAYERS} from './combat-render-layers.js';
export const WHITE_MARCH=Object.freeze({key:'furnace-white-march-disc-v038d1g-a',url:'./src/assets/furnace-white-march-disc-v038d1g/disc-a.png',width:288,height:192,cell:96,radius:47,frames:6,activeFrames:4,loop:.8,capacity:3});
const names=Object.freeze(['0','1','2','3','4','5']);
export function preloadWhiteMarch(scene){scene.load.image(WHITE_MARCH.key,WHITE_MARCH.url);}
function sourceValid(t){return t?.source?.[0]?.width===288&&t.source[0].height===192;}
function frameValid(t,i){const f=t.has(names[i])&&t.get(names[i]);return !!f&&f.cutX===i%3*96&&f.cutY===Math.floor(i/3)*96&&f.cutWidth===96&&f.cutHeight===96&&(!f.sourceIndex||f.sourceIndex===0)&&(!f.texture||f.texture===t)&&(!f.source||f.source===t.source[0]);}
export function registerWhiteMarch(textures){
 if(!textures.exists(WHITE_MARCH.key))return false;const t=textures.get(WHITE_MARCH.key);if(!sourceValid(t))return false;
 for(let i=0;i<6;i++){if(!t.has(names[i]))t.add(names[i],0,i%3*96,Math.floor(i/3)*96,96,96);if(!frameValid(t,i))return false;}return true;
}
export function isWhiteMarchDisc(run,h){
 if(run?.world?.id!=='forge'||h.planId!=='whiteMarch'||!h.dungeon||!h.heat||h.style!=='furnace'||h.shape!=='circle'||h.radius!==47||h.index!==0
  ||!Number.isInteger(h.order)||h.order<1||h.order>3||!Number.isFinite(h.x)||!Number.isFinite(h.y)||h.x<85||h.x>365||h.y<180||h.y>600
  ||h.done||h.remaining<=0&&!h.cooling)return false;
 for(const e of run.enemies)if(e.id===h.owner)return e.alive&&e.kind==='boss'&&e.bossId==='furnace'&&e.forgeType==='furnace';
 return false;
}
export class WhiteMarchView{
 constructor(scene){
  this.scene=scene;this.ready=false;this.used=0;this.destroyed=false;this.hazards=[null,null,null];this.phases=[-1,-1,-1];this.frames=[-1,-1,-1];
  registerWhiteMarch(scene.textures);this.texture=scene.textures.exists(WHITE_MARCH.key)?scene.textures.get(WHITE_MARCH.key):null;
  this.bases=Array.from({length:3},()=>scene.add.graphics().setDepth(COMBAT_LAYERS.GROUND_BASE).setVisible(false));
  this.outlines=Array.from({length:3},()=>scene.add.graphics().setDepth(COMBAT_LAYERS.CRITICAL_TELEGRAPH).setVisible(false));
  this.sprites=Array.from({length:3},()=>scene.add.image(0,0,'__WHITE').setDepth(COMBAT_LAYERS.GROUND_HAZARD).setVisible(false));
  scene.events?.once('shutdown',()=>this.destroy());
 }
 begin(run){
  if(this.destroyed)return;this.ready=false;this.used=0;
  for(let i=0;i<3;i++){this.hazards[i]=null;this.bases[i].setVisible(false);this.outlines[i].setVisible(false);this.sprites[i].setVisible(false);}
  const items=run.forge?.ground.items;if(!items)return;let first=null;
  for(const h of items){
   if(h.planId!=='whiteMarch')continue;
   if(!isWhiteMarchDisc(run,h)||this.hazards[h.order-1]||first&&(first.owner!==h.owner||first.attackToken!==h.attackToken))return;
   first??=h;this.hazards[h.order-1]=h;
  }
  if(!first)return;const ts=this.scene.textures;if(!ts.exists(WHITE_MARCH.key))return;const t=ts.get(WHITE_MARCH.key);
  if(t!==this.texture){registerWhiteMarch(ts);this.texture=t;this.frames.fill(-1);}
  if(!sourceValid(t))return;for(let i=0;i<6;i++)if(!frameValid(t,i))return false;
  this.ready=true;
 }
 build(i,phase){
  const b=this.bases[i],g=this.outlines[i];b.clear();g.clear();
  b.fillStyle(phase===0?0x9a281c:phase===1?0xf77e16:0x44241d,phase===0?.17:1).fillCircle(0,0,47);
  // Complete stroke inside the exact 47-unit danger radius.
  g.lineStyle(1.5,phase===0?0xff7044:phase===1?0xffe76e:0x8b4930,1).strokeCircle(0,0,46.25);
  if(phase===0){g.lineStyle(.8,0xffac64,.8).strokeCircle(0,0,7);for(const sign of [-1,1])g.lineBetween(sign*8,0,sign*10,0).lineBetween(0,sign*8,0,sign*10);}
  // Preserve the existing one/two/three-dot order cue with a tiny dark rim.
  if(phase!==2)for(let n=0;n<=i;n++){const x=(n-i/2)*7;g.fillStyle(0x421a13,.9).fillCircle(x,0,2.5);g.fillStyle(0xfff2b7,1).fillCircle(x,0,1.4);}
 }
 drawHazard(h){
  if(!this.ready||this.destroyed||h!==this.hazards[h.order-1])return false;
  const i=h.order-1,phase=h.cooling?2:h.active?1:0,progress=Math.max(0,Math.min(1,1-h.warning/h.warningTotal)),cool=Math.max(0,Math.min(1,h.cooling/.3));
  if(this.phases[i]!==phase){this.build(i,phase);this.phases[i]=phase;}
  const frame=phase===2?5:phase===0?4:this.scene.reducedMotion?0:Math.floor((Math.max(0,h.elapsed||0)+1e-8)/.8*4)%4,p=this.sprites[i];
  if(this.frames[i]!==frame){p.setTexture(WHITE_MARCH.key,names[frame]).setOrigin(.5).setDisplaySize(96,96);this.frames[i]=frame;}
  p.setPosition(h.x,h.y).setRotation(0).setAlpha(phase===0?Math.pow(progress,1.8)*.6:phase===1?1:cool*.7).setVisible(true);
  this.bases[i].setPosition(h.x,h.y).setAlpha(phase===2?cool*.45:1).setVisible(true);
  this.outlines[i].setPosition(h.x,h.y).setAlpha(phase===2?cool*.6:phase===0?.85+.15*progress:1).setVisible(true);
  this.used++;return true;
 }
 destroy(){
  if(this.destroyed)return;this.destroyed=true;
  for(let i=0;i<3;i++){this.bases[i].destroy();this.outlines[i].destroy();this.sprites[i].destroy();this.hazards[i]=null;}
  this.bases.length=this.outlines.length=this.sprites.length=0;this.texture=null;this.ready=false;this.used=0;
 }
}
