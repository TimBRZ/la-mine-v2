import {ROOM} from '../config.js';import {segmentCircle} from '../math.js';
export function forgeTouches(h,p,padding=0){
 const r=(p.radius||0)+padding;
 if(h.shape==='arm')return segmentCircle(h.x,h.y,h.x+Math.cos(h.angle)*h.length,h.y+Math.sin(h.angle)*h.length,p.x,p.y,h.width+r)!==null;
 if(h.shape==='wave'){
  const d=Math.hypot(p.x-h.x,p.y-h.y),a=Math.atan2(p.y-h.y,p.x-h.x),delta=Math.abs(Math.atan2(Math.sin(a-h.gapAngle),Math.cos(a-h.gapAngle)));
  return Math.abs(d-h.radius)<h.width+r&&delta>h.gap-Math.asin(Math.min(1,r/Math.max(d,1)));
 }
 if(h.shape==='plate')return Math.abs(p.x-h.x)<h.w/2+r&&Math.abs(p.y-h.y)<h.h/2+r;
 if(h.shape==='line')return segmentCircle(h.x,h.y,h.x2,h.y2,p.x,p.y,h.width+r)!==null;
 if(h.shape==='cone'){
  const d=Math.hypot(p.x-h.x,p.y-h.y),a=Math.atan2(p.y-h.y,p.x-h.x)-h.angle,delta=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));
  return d<h.radius+r&&(d<=r||delta<h.spread+Math.asin(Math.min(1,r/Math.max(d,1))));
 }
 const radius=h.impactRadius&&(!h.active||h.elapsed<.25)?h.impactRadius:h.radius;
 return Math.hypot(p.x-h.x,p.y-h.y)<radius+r;
}
// Admission-only flood fill. 24 px cells, conservative player-radius padding:
// a large connected cold region must span the arena and be reachable before heat.
export function forgeEscapeReport(hazards,player={x:225,y:500,radius:13}){
 const cells=[],step=24;let cols=0,rows=0;
 for(let y=ROOM.top+18;y<=ROOM.bottom-18;y+=step){let c=0;for(let x=ROOM.left+18;x<=ROOM.right-18;x+=step){cells.push({x,y,radius:player.radius||13,safe:hazards.every(h=>!forgeTouches(h,{x,y,radius:player.radius||13},step*.71))});c++;}cols=c;rows++;}
 const seen=new Set();let best=0,escape=false,spans=false;
 for(let start=0;start<cells.length;start++){if(seen.has(start)||!cells[start].safe)continue;const stack=[start];seen.add(start);let size=0,minX=cols,maxX=0,minY=rows,maxY=0,near=Infinity;
  while(stack.length){const id=stack.pop(),p=cells[id],x=id%cols,y=Math.floor(id/cols);size++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);near=Math.min(near,Math.hypot(p.x-player.x,p.y-player.y));
   for(const [nx,ny]of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){const j=ny*cols+nx;if(nx<0||nx>=cols||ny<0||ny>=rows||seen.has(j)||!cells[j].safe)continue;seen.add(j);stack.push(j);}
  }
  const spanning=minX===0&&maxX===cols-1||minY===0&&maxY===rows-1;best=Math.max(best,size);if(spanning&&size>=cells.length*.35){spans=true;if(near<135)escape=true;}
 }
 return {ok:escape&&spans,largestColdFraction:best/cells.length,spans,escape};
}
