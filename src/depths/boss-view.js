import {ROOM} from '../config.js';
import {dangerCircle,dangerLane} from '../combat-art.js';
import {PATTERN_LABELS} from './boss-patterns.js';
export function bossSequenceLabel(e){const s=e.bossSequence;if(!s)return PATTERN_LABELS[e.pattern]||'';if(s.state==='recovery')return 'RÉCUPÉRATION · TIRE !';return (s.state==='locked'?'VERROUILLÉ\n':s.state==='tracking'?'VISÉE\n':'')+(s.step?.label||PATTERN_LABELS[e.pattern]);}
function arrow(g,x,y,a,color=0xffe49b){g.lineStyle(3,color,1).lineBetween(x,y,x-Math.cos(a-.5)*10,y-Math.sin(a-.5)*10).lineBetween(x,y,x-Math.cos(a+.5)*10,y-Math.sin(a+.5)*10);}
export function drawBossHazard(g,h){
 const color=h.active?0xff775c:0xffd57a;
 if(h.shape==='ring'){drawClippedRing(g,h,color);}
 else if(h.shape==='rect'){g.fillStyle(color,h.active?.3:.12).fillRect(h.x,h.y,h.w,h.h);g.lineStyle(2,color,1).strokeRect(h.x,h.y,h.w,h.h);}
 else if(Number.isFinite(h.x2))dangerLane(g,h.x,h.y,h.x2,h.y2,h.width,h.active);
 else dangerCircle(g,h.x,h.y,h.radius,h.active);
}
export function drawBossPlans(g,run,drawOrder){
 for(const e of run.enemies){const s=e.bossSequence;if(!e.active||!s||!s.step||s.state==='recovery')continue;const step=s.step;
  if(step.sequence){
   const points=s.base;g.lineStyle(2,0xf9c381,.7);
   if(step.linked)for(let i=1;i<points.length;i++)g.lineBetween(points[i-1].x,points[i-1].y,points[i].x,points[i].y);
   for(const h of points){if(s.state==='active'&&s.elapsed>(h.delay||0)+(h.life||.32))continue;
    if(!run.depths.ground.items.some(z=>z.owner===e.id&&z.order===h.order)) {g.lineStyle(2,0xffd57a,.7).strokeCircle(h.x,h.y,h.radius||15);}
    drawOrder(g,h.shape==='rect'?h.x+h.w/2:h.x,h.shape==='rect'?h.y+h.h/2:h.y,h.order);
   }
  }
  if(step.sweep){const h=s.base[0],a=Math.atan2(h.y2-h.y,h.x2-h.x);g.lineStyle(2,0xffe49b,.5);const r=85;for(let i=1;i<=14;i++){const aa=a+step.sweep*(i-1)/14,bb=a+step.sweep*i/14;g.lineBetween(h.x+Math.cos(aa)*r,h.y+Math.sin(aa)*r,h.x+Math.cos(bb)*r,h.y+Math.sin(bb)*r);}arrow(g,h.x+Math.cos(a+step.sweep)*r,h.y+Math.sin(a+step.sweep)*r,a+step.sweep+Math.PI/2);}
  if(step.cross)for(const [i,h]of s.base.entries())arrow(g,(h.x+h.x2)/2,(h.y+h.y2)/2,i?0:Math.PI/2);
  if(step.dark){for(const p of [{x:105,y:300},{x:345,y:490}]){g.fillStyle(0xffefad,.12).fillCircle(p.x,p.y,42);g.lineStyle(2,0xffefad,.9).strokeCircle(p.x,p.y,42);g.fillStyle(0xffefad).fillCircle(p.x,p.y,5);}}
  if(step.guide==='light'){const x=run.enemies.find(b=>b.id===e.comboPartner)?.bossSequence?.step?.safeBand||130;g.fillStyle(0xffedaf,.14).fillRect(x-55,124,110,534);g.lineStyle(2,0xffedaf).strokeRect(x-55,124,110,534);}
  if(step.guide==='corridor'){const h=step.corridor;dangerLane(g,h.x,h.y,h.x2,h.y2,h.width,false);arrow(g,h.x2,h.y2,Math.atan2(h.y2-h.y,h.x2-h.x));}
  if(step.ringCharges){const h=s.base[0],r=(h.inner+h.radius)/2;for(let i=0;i<8;i++){const a=i*Math.PI/4;g.fillStyle(0xe7a82b).fillRect(h.x+Math.cos(a)*r-4,h.y+Math.sin(a)*r-4,8,8);}arrow(g,h.x,h.y-r,step.label.startsWith('INTÉRIEUR')?-Math.PI/2:Math.PI/2);}
  if(s.state==='locked'){g.lineStyle(2,0xfff2cb).strokeCircle(e.x,e.y,e.radius+6);}
 }
}

export const BOSS_MASTERS=Object.freeze(Object.fromEntries(['lampmajor','dynamiter','blackmass'].map(id=>[id,Object.freeze({id,key:'depths-static-v036b-'+id,url:'./src/assets/boss-v036b/'+id+'.svg',width:84,height:84,originX:.5,originY:.5,orientation:'flip',pace:0,bounce:0})])));
export function preloadDepthsBossMasters(scene){for(const art of Object.values(BOSS_MASTERS))scene.load.svg(art.key,art.url,{width:128,height:128});}
export function useDepthsBossMaster(image,id,textures){const art=BOSS_MASTERS[id];if(!art||!textures.exists(art.key))return null;image.setTexture(art.key).setOrigin(.5).setDisplaySize(84,84);return art;}

// Clip annular bands to the arena, so an edge slam never paints over the HUD.
export function clipArenaPolygon(points){
 let out=points;
 for(const [axis,edge,sign]of [['x',ROOM.left,1],['x',ROOM.right,-1],['y',ROOM.top,1],['y',ROOM.bottom,-1]]){
  const input=out;out=[];if(!input.length)break;
  for(let i=0;i<input.length;i++){const a=input[i],b=input[(i+1)%input.length],insideA=(a[axis]-edge)*sign>=0,insideB=(b[axis]-edge)*sign>=0;if(insideA)out.push(a);if(insideA!==insideB){const t=(edge-a[axis])/(b[axis]-a[axis]);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}}
 }
 return out;
}
function drawClippedRing(g,h,color){
 const pt=(r,a)=>({x:h.x+Math.cos(a)*r,y:h.y+Math.sin(a)*r}),inside=p=>p.x>=ROOM.left&&p.x<=ROOM.right&&p.y>=ROOM.top&&p.y<=ROOM.bottom;
 g.fillStyle(color,h.active?.35:.13);g.lineStyle(2,color,1);
 for(let i=0;i<48;i++){const a=i*Math.PI/24,b=(i+1)*Math.PI/24,oa=pt(h.radius,a),ob=pt(h.radius,b),ia=pt(h.inner,a),ib=pt(h.inner,b),polygon=clipArenaPolygon([oa,ob,ib,ia]);if(polygon.length>=3)g.fillPoints(polygon,true);for(const[p,q]of[[oa,ob],[ia,ib]])if(inside(p)&&inside(q))g.lineBetween(p.x,p.y,q.x,q.y);}
}
