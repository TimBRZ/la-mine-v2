import {BOSS_LABELS} from './boss-patterns.js';
import {ROOM} from '../config.js';
import {clipArenaPolygon} from '../depths/boss-view.js';
export const FORGE_MASTERS=Object.fromEntries(['furnace','hammer','boiler'].map(id=>[id,{key:'forge-static-v037b-'+id,url:'./src/assets/boss-v037b/'+id+'.svg',width:84,height:84,originX:.5,originY:.5,orientation:'fixed',pace:0,bounce:0}]));
export function preloadForgeMasters(scene){for(const a of Object.values(FORGE_MASTERS))scene.load.svg(a.key,a.url,{width:128,height:128});}
export function useForgeMaster(body,id,textures){const a=FORGE_MASTERS[id];if(!a||!textures.exists(a.key))return null;body.setTexture(a.key).setOrigin(.5).setDisplaySize(84,84);return a;}
export function dungeonLabel(e){return e.dungeonRecovery?'DÉCOMPRESSION · TIRE !':({'light-furnace':'POINT DE CHAUFFE','light-hammer':'IMPACT LOCAL','light-boiler':'PRESSION LOCALE'}[e.pattern]||BOSS_LABELS[e.pattern]||'');}
export function drawDungeonSafeZones(g,run){
 for(const e of run.enemies){if(e.plan?.id!=='whiteFurnace')continue;
  const plates=run.forge.ground.items.filter(h=>h.owner===e.id&&h.shape==='plate'&&!h.cooling).sort((a,b)=>a.y-b.y);
  for(let i=1;i<plates.length;i++){const top=plates[i-1].y+plates[i-1].h/2,bottom=plates[i].y-plates[i].h/2;if(bottom-top<50)continue;
   g.fillStyle(0x8fd1bd,.12).fillRect(ROOM.left+4,top+4,ROOM.right-ROOM.left-8,bottom-top-8);
   g.lineStyle(2,0x8fd1bd,.8).strokeRect(ROOM.left+4,top+4,ROOM.right-ROOM.left-8,bottom-top-8);
  }
 }
}
const point=(h,r,a)=>({x:h.x+Math.cos(a)*r,y:h.y+Math.sin(a)*r});
function polygon(g,points){const p=clipArenaPolygon(points);if(p.length>2){g.fillPoints(p,true);g.strokePoints(p,true);}}
export function drawDungeonHazard(g,h){
 const color=h.cooling?0x97b9a4:h.style==='boiler'?0xb7e8ed:h.style==='hammer'?0xffe1a0:0xff8650,alpha=h.cooling?.08:h.active?.36:.13;
 g.fillStyle(color,alpha);g.lineStyle(h.active?3:2,color,h.cooling?.3:.95);
 if(h.shape==='wave'){
  const a=h.gapAngle+h.gap,b=h.gapAngle+Math.PI*2-h.gap;
  for(let i=0;i<40;i++){const aa=a+(b-a)*i/40,bb=a+(b-a)*(i+1)/40;polygon(g,[point(h,Math.max(0,h.radius-h.width),aa),point(h,h.radius+h.width,aa),point(h,h.radius+h.width,bb),point(h,Math.max(0,h.radius-h.width),bb)]);}
  // Inner region and the notch are safe; preview the outward motion.
  if(!h.active){g.lineStyle(1,color,.35);for(const rr of [h.startRadius+35,h.endRadius])for(let i=0;i<24;i++){const aa=a+(b-a)*i/24,bb=a+(b-a)*(i+1)/24,pa=point(h,rr,aa),pb=point(h,rr,bb);if([pa,pb].every(p=>p.x>ROOM.left&&p.x<ROOM.right&&p.y>ROOM.top&&p.y<ROOM.bottom))g.lineBetween(pa.x,pa.y,pb.x,pb.y);}}
 }else if(h.shape==='arm'||h.shape==='line'){
  const a=h.shape==='arm'?h.angle:Math.atan2(h.y2-h.y,h.x2-h.x),len=h.shape==='arm'?h.length:Math.hypot(h.x2-h.x,h.y2-h.y),dx=Math.cos(a+Math.PI/2)*h.width,dy=Math.sin(a+Math.PI/2)*h.width;
  polygon(g,[{x:h.x+dx,y:h.y+dy},{x:h.x+Math.cos(a)*len+dx,y:h.y+Math.sin(a)*len+dy},{x:h.x+Math.cos(a)*len-dx,y:h.y+Math.sin(a)*len-dy},{x:h.x-dx,y:h.y-dy}]);
  if(h.spin){const p=point(h,Math.min(90,len),a),b=a+Math.sign(h.spin)*Math.PI/2;g.lineStyle(3,color).lineBetween(p.x,p.y,p.x+Math.cos(b)*16,p.y+Math.sin(b)*16).lineBetween(p.x+Math.cos(b)*16,p.y+Math.sin(b)*16,p.x+Math.cos(b-.6)*7,p.y+Math.sin(b-.6)*7);}
 }else if(h.shape==='plate'){polygon(g,[{x:h.x-h.w/2,y:h.y-h.h/2},{x:h.x+h.w/2,y:h.y-h.h/2},{x:h.x+h.w/2,y:h.y+h.h/2},{x:h.x-h.w/2,y:h.y+h.h/2}]);}
 else if(h.shape==='cone'){polygon(g,[{x:h.x,y:h.y},...Array.from({length:25},(_,i)=>point(h,h.radius,h.angle-h.spread+2*h.spread*i/24))]);}
 else {const pts=Array.from({length:40},(_,i)=>point(h,h.radius,i*Math.PI/20));polygon(g,pts);if(h.style==='hammer'){g.lineStyle(2,color).lineBetween(h.x-10,h.y,h.x+10,h.y).lineBetween(h.x,h.y-10,h.x,h.y+10);}}
 if(h.order&&!h.cooling){for(let i=0;i<h.order;i++)g.fillStyle(color).fillCircle(h.x+(i-(h.order-1)/2)*7,Math.max(ROOM.top+5,Math.min(ROOM.bottom-5,h.y)),2);}
}
