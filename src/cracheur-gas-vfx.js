// Presentation only. Hazard ownership, clocks and geometry remain authoritative.
export const CRACHEUR_GAS=Object.freeze({key:'cracheur-gas-v038c3-a1',url:'./src/assets/cracheur-gas-v038c3/active-a1.svg',cell:96,frames:4,width:384,height:96,loop:.8,capacity:2});
export function preloadCracheurGas(scene){const s=CRACHEUR_GAS;scene.load.svg(s.key,s.url,{width:s.width,height:s.height});}
function sourceValid(t){return t?.source?.[0]?.width===384&&t.source[0].height===96;}
function frameValid(t,i){const f=t.has(String(i))&&t.get(String(i));return f&&f.cutX===i*96&&f.cutY===0&&f.cutWidth===96&&f.cutHeight===96;}
export function registerCracheurGas(textures){
 const s=CRACHEUR_GAS;if(!textures.exists(s.key))return false;const t=textures.get(s.key);if(!sourceValid(t))return false;
 for(let i=0;i<s.frames;i++){if(!t.has(String(i)))t.add(String(i),0,i*96,0,96,96);if(!frameValid(t,i))return false;}return true;
}
export function isCracheurGas(run,h){
 if(run.world?.id!=='rift'||h.kind!=='gas'||!h.owner||h.remaining<=0)return false;
 for(const e of run.enemies)if(e.id===h.owner)return e.alive&&e.riftType==='spitter'&&e.kind==='spitter';
 return false;
}
export class CracheurGasView{
 constructor(scene){
  this.scene=scene;this.used=0;this.run=null;registerCracheurGas(scene.textures);
  this.sprites=Array.from({length:CRACHEUR_GAS.capacity},()=>scene.add.image(0,0,'__WHITE').setDepth(7.9).setVisible(false));
  scene.events?.once('shutdown',()=>this.destroy());
  this.draw=(g,h)=>this.drawHazard(g,h);
 }
 begin(run){this.run=run;this.used=0;for(const s of this.sprites)s.setVisible(false);}
 drawHazard(g,h){
  if(!this.run||!isCracheurGas(this.run,h)||this.used>=this.sprites.length)return false;
  const textures=this.scene.textures,s=CRACHEUR_GAS;if(!textures.exists(s.key))return false;
  const t=textures.get(s.key);if(!sourceValid(t))return false;
  // Even the warning falls back coherently if the active atlas is incomplete.
  for(let i=0;i<s.frames;i++)if(!frameValid(t,i))return false;
  const sprite=this.sprites[this.used++],r=h.radius;
  if(h.active){
   const age=Math.max(0,2-h.remaining),frame=this.scene.reducedMotion?0:Math.floor((age+1e-8)/s.loop*s.frames)%s.frames;
   sprite.setTexture(s.key,String(frame)).setOrigin(.5,.5).setDisplaySize(r*2,r*2).setPosition(h.x,h.y).setVisible(true);
  }
  // All contours live above all gas sprites, including overlapping hazards.
  const color=h.active?0xa3ff87:0x9ce9d4;
  g.fillStyle(h.active?0x51bb62:0x8cdbc9,h.active?.09:.035).fillCircle(h.x,h.y,r);
  g.lineStyle(h.active?3:2,0x101f20,.95).strokeCircle(h.x,h.y,r);
  g.lineStyle(h.active?1.7:1,color,1).strokeCircle(h.x,h.y,r);
  // Short, stable breaks between bright segments; no size pulse or fake clock.
  g.lineStyle(h.active?2.1:1.2,color,1);
  for(let i=0;i<8;i++){const a=i*Math.PI/4+.045;g.beginPath();g.arc(h.x,h.y,r,a,a+Math.PI/4-.13,false);g.strokePath();}
  return true;
 }
 destroy(){for(const s of this.sprites)s.destroy();this.sprites.length=0;this.run=null;this.used=0;}
}
