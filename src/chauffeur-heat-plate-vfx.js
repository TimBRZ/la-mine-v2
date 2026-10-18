// Presentation only: every phase and coordinate comes from the admitted hazard.
export const CHAUFFEUR_PLATE=Object.freeze({key:'chauffeur-heat-plate-v038c4-a1',url:'./src/assets/chauffeur-heat-plate-v038c4/plate-a1.svg',cellWidth:76,cellHeight:88,frames:6,activeFrames:4,width:456,height:88,loop:.8,capacity:3});
const frames=Object.freeze(['0','1','2','3','4','5']);
export function preloadChauffeurPlate(scene){const s=CHAUFFEUR_PLATE;scene.load.svg(s.key,s.url,{width:s.width,height:s.height});}
function sourceValid(t){return t?.source?.[0]?.width===456&&t.source[0].height===88;}
function frameValid(t,i){const f=t.has(frames[i])&&t.get(frames[i]);return f&&f.cutX===i*76&&f.cutY===0&&f.cutWidth===76&&f.cutHeight===88&&(!f.sourceIndex||f.sourceIndex===0)&&(!f.texture||f.texture===t)&&(!f.source||f.source===t.source[0]);}
export function registerChauffeurPlate(textures){
 const s=CHAUFFEUR_PLATE;if(!textures.exists(s.key))return false;const t=textures.get(s.key);if(!sourceValid(t))return false;
 for(let i=0;i<s.frames;i++){if(!t.has(frames[i]))t.add(frames[i],0,i*76,0,76,88);if(!frameValid(t,i))return false;}return true;
}
export function isChauffeurPlate(run,h){
 if(run.world?.id!=='forge'||h.shape!=='plate'||!h.heat||h.dungeon||!h.owner||h.w!==76||h.h!==88||h.done||h.remaining<=0&&!h.cooling)return false;
 for(const e of run.enemies)if(e.id===h.owner)return e.alive&&e.kind==='stoker'&&e.forgeType==='stoker';
 return false;
}
export class ChauffeurPlateView{
 constructor(scene){
  this.scene=scene;this.run=null;this.used=0;this.ready=false;registerChauffeurPlate(scene.textures);
  this.sprites=Array.from({length:CHAUFFEUR_PLATE.capacity},()=>scene.add.image(0,0,'__WHITE').setDepth(7.9).setVisible(false));
  this.draw=(g,h)=>this.drawHazard(g,h);scene.events?.once('shutdown',()=>this.destroy());
 }
 begin(run){
  this.run=run;this.used=0;for(const sprite of this.sprites)sprite.setVisible(false);
  const textures=this.scene.textures;this.ready=!!textures.exists(CHAUFFEUR_PLATE.key);
  if(this.ready){const t=textures.get(CHAUFFEUR_PLATE.key);this.ready=sourceValid(t);for(let i=0;this.ready&&i<6;i++)this.ready=!!frameValid(t,i);}
 }
 drawHazard(g,h){
  if(!this.ready||!this.run||!isChauffeurPlate(this.run,h)||this.used>=this.sprites.length)return false;
  const sprite=this.sprites[this.used++],x=h.x-h.w/2,y=h.y-h.h/2,cooling=h.cooling>0;
  if(h.active||cooling){
   const frame=cooling?(h.cooling>.15?4:5):this.scene.reducedMotion?0:Math.floor((Math.max(0,h.elapsed||0)+1e-8)/CHAUFFEUR_PLATE.loop*4)%4;
   sprite.setTexture(CHAUFFEUR_PLATE.key,frames[frame]).setOrigin(.5,.5).setDisplaySize(h.w,h.h).setPosition(h.x,h.y).setRotation(0).setAlpha(cooling?Math.max(0,Math.min(1,h.cooling/.3)):1).setVisible(true);
  }else{
   const progress=Math.max(0,Math.min(1,1-h.warning/h.warningTotal));
   g.fillStyle(0xffcf55,.035+.075*progress).fillRect(x,y,h.w,h.h);
  }
  // Every outline is above every plate sprite, including synthetic overlap QA.
  // Strokes are inset: no visible heat outside the authoritative 76 x 88 area.
  const color=cooling?0x8b9699:h.active?0xffb638:0xffdd68,alpha=cooling?Math.max(0,Math.min(.6,h.cooling/.3)) :1;
  g.lineStyle(4,0x171b1d,alpha).strokeRect(x+2,y+2,h.w-4,h.h-4);
  g.lineStyle(h.active&&!cooling?2:1.5,color,alpha).strokeRect(x+2,y+2,h.w-4,h.h-4);
  if(!h.active&&!cooling){
   g.lineStyle(2.5,0xffe991,1);
   g.lineBetween(x+2,y+13,x+2,y+2).lineBetween(x+2,y+2,x+13,y+2);
   g.lineBetween(x+h.w-13,y+2,x+h.w-2,y+2).lineBetween(x+h.w-2,y+2,x+h.w-2,y+13);
   g.lineBetween(x+2,y+h.h-13,x+2,y+h.h-2).lineBetween(x+2,y+h.h-2,x+13,y+h.h-2);
   g.lineBetween(x+h.w-13,y+h.h-2,x+h.w-2,y+h.h-2).lineBetween(x+h.w-2,y+h.h-2,x+h.w-2,y+h.h-13);
  }
  return true;
 }
 destroy(){for(const sprite of this.sprites)sprite.destroy();this.sprites.length=0;this.run=null;this.used=0;this.ready=false;}
}
