import {ROOM} from './config.js';
import {FORGE_PATTERNS} from './forge/config.js';
export const SCORIFIER_TRAIL=Object.freeze({key:'scorifier-thermal-trail-v038c5-a1',url:'./src/assets/scorifier-thermal-trail-v038c5/trail-a1.svg',width:88,height:144,frames:6,loop:.8,capacity:3,radius:12});
const names=Array.from({length:6},(_,i)=>Object.freeze(['l'+i,'m'+i,'r'+i]));Object.freeze(names);
export function preloadScorifierTrail(scene){const s=SCORIFIER_TRAIL;scene.load.svg(s.key,s.url,{width:s.width,height:s.height});}
function sourceValid(t){return t?.source?.[0]?.width===88&&t.source[0].height===144;}
function valid(t,i,j){const f=t.has(names[i][j])&&t.get(names[i][j]);return !!f&&f.cutX===(j===0?0:j===1?12:76)&&f.cutY===i*24&&f.cutWidth===(j===1?64:12)&&f.cutHeight===24&&(!f.sourceIndex||f.sourceIndex===0)&&(!f.texture||f.texture===t)&&(!f.source||f.source===t.source[0]);}
export function registerScorifierTrail(textures){if(!textures.exists(SCORIFIER_TRAIL.key))return false;const t=textures.get(SCORIFIER_TRAIL.key);if(!sourceValid(t))return false;for(let i=0;i<6;i++)for(let j=0;j<3;j++){if(!t.has(names[i][j]))t.add(names[i][j],0,j===0?0:j===1?12:76,i*24,j===1?64:12,24);if(!valid(t,i,j))return false;}return true;}
export function isScorifierTrail(run,h){if(run?.world?.id!=='forge'||h.dungeon||h.shape!=='line'||!h.heat||h.width!==12||!h.owner||h.done||h.remaining<=0&&!h.cooling||!Number.isFinite(h.x+h.y+h.x2+h.y2))return false;for(const e of run.enemies)if(e.id===h.owner)return e.alive&&e.kind==='scorifier'&&e.forgeType==='scorifier';return false;}
// Nominal remaining-clock projection, clamped with the SAME body-wall bounds as charge.
// Does not mutate charge or compensate its existing discrete final-step overshoot.
export function scorifierPreviewLength(e){const a=e.chargeAngle,s=FORGE_PATTERNS.scorch;if(!Number.isFinite(a))return 0;const dx=Math.cos(a),dy=Math.sin(a),tx=dx>1e-10?(ROOM.right-e.radius-e.x)/dx:dx< -1e-10?(ROOM.left+e.radius-e.x)/dx:Infinity,ty=dy>1e-10?(ROOM.bottom-e.radius-e.y)/dy:dy< -1e-10?(ROOM.top+e.radius-e.y)/dy:Infinity;return Math.max(0,Math.min(s.speed*(e.phase==='charge'?Math.max(0,Math.min(s.seconds,e.phaseTime)):s.seconds),tx,ty));}
// A closed capsule outline. Stroke inset keeps the visible boundary inside radius.
function capsule(g,x,y,length,a,r){const ux=Math.cos(a),uy=Math.sin(a),nx=-uy*r,ny=ux*r,bx=x+ux*length,by=y+uy*length;g.beginPath().moveTo(x+nx,y+ny).lineTo(bx+nx,by+ny).arc(bx,by,r,a+Math.PI/2,a-Math.PI/2,true).lineTo(x-nx,y-ny).arc(x,y,r,a-Math.PI/2,a-3*Math.PI/2,true).closePath().strokePath();}
export class ScorifierTrailView{
 constructor(scene){this.scene=scene;this.run=null;this.used=0;this.ready=false;registerScorifierTrail(scene.textures);this.outline=scene.add.graphics().setDepth(16);this.preview=scene.add.graphics().setDepth(16.1);this.sprites=Array.from({length:9},()=>scene.add.image(0,0,'__WHITE').setDepth(7.85).setVisible(false));scene.events?.once('shutdown',()=>this.destroy());}
 begin(run){this.run=run;this.used=0;this.outline.clear();this.preview.clear();for(const p of this.sprites)p.setVisible(false);const ts=this.scene.textures;this.ready=ts.exists(SCORIFIER_TRAIL.key);if(this.ready){const t=ts.get(SCORIFIER_TRAIL.key);this.ready=sourceValid(t);for(let i=0;this.ready&&i<6;i++)for(let j=0;this.ready&&j<3;j++)this.ready=valid(t,i,j);}}
 drawHazard(h){if(!this.ready||!isScorifierTrail(this.run,h)||this.used>=3)return false;const index=this.used++*3,dx=h.x2-h.x,dy=h.y2-h.y,length=Math.hypot(dx,dy),a=length?Math.atan2(dy,dx):0,cool=h.cooling>0,alpha=cool?Math.max(0,Math.min(1,h.cooling/.3)):1,g=this.outline;
  if(h.active||cool){const frame=cool?(h.cooling>.15?4:5):this.scene.reducedMotion?0:Math.floor((Math.max(0,h.elapsed||0)+1e-8)/SCORIFIER_TRAIL.loop*4)%4;for(let j=0;j<3;j++){const p=this.sprites[index+j];p.setTexture(SCORIFIER_TRAIL.key,names[frame][j]).setOrigin(j===0?1:0,.5).setDisplaySize(j===1?Math.max(length,.0001):12,24).setRotation(a).setPosition(j===2?h.x2:h.x,j===2?h.y2:h.y).setAlpha(alpha).setVisible(j!==1||length>0);}}
  g.lineStyle(3,0x211b20,alpha);capsule(g,h.x,h.y,length,a,10.5);
  g.lineStyle(h.active&&!cool?1.5:1,cool?0x8c5739:h.active?0xffbb45:0xffce6b,cool?alpha*.6:h.active?1:.6);capsule(g,h.x,h.y,length,a,h.active&&!cool?11.25:11.5);
  return true;
 }
 drawPreview(e){if(!this.ready||this.run?.world?.id!=='forge'||!e.active||!e.alive||e.kind!=='scorifier'||e.forgeType!=='scorifier'||e.pattern!=='scorch'||(e.phase!=='warning'&&e.phase!=='charge'))return false;const length=scorifierPreviewLength(e),a=e.chargeAngle,g=this.preview,ux=Math.cos(a),uy=Math.sin(a),nx=-uy,ny=ux,color=e.phase==='charge'?0xf9a543:0xffda7c;
  // Contact envelope: radius 19, shorter at every charge tick; outline, no hot fill.
  g.lineStyle(1.2,0x171b1d,.7);capsule(g,e.x,e.y,length,a,e.radius-.6);
  g.lineStyle(1,color,e.phase==='charge'?.65:.9);capsule(g,e.x,e.y,length,a,e.radius-.5);
  for(let d=15;d<length-4;d+=28){const x=e.x+ux*d,y=e.y+uy*d;g.lineStyle(4,0x231e20,.9).lineBetween(x-ux*7+nx*5,y-uy*7+ny*5,x,y).lineBetween(x,y,x-ux*7-nx*5,y-uy*7-ny*5);g.lineStyle(2.1,color,.95).lineBetween(x-ux*7+nx*5,y-uy*7+ny*5,x,y).lineBetween(x,y,x-ux*7-nx*5,y-uy*7-ny*5);}
  return true;
 }
 destroy(){for(const p of this.sprites)p.destroy();this.sprites.length=0;this.outline.destroy();this.preview.destroy();this.run=null;this.used=0;this.ready=false;}
}
