import {ROOM} from '../config.js';
import {forgeTouches} from './geometry.js';
import {travel} from './boss-mobility.js';
// The same time projection is used for damage, telegraphs and safety checks.
export function projectBossHazard(h,seconds=0){
 if(h.drift){const d=travel(h.drift,h.driftTime+seconds);h={...h,x:h.drift.startX+h.drift.vx*d,y:h.drift.startY+h.drift.vy*d};}
 const t=Math.max(0,(h.elapsed||0)+seconds-(h.active?0:Math.max(0,h.warning||0)));
 if(h.shape==='arm')return {...h,angle:h.baseAngle+(h.spin||0)*t};
 if(h.shape==='wave')return {...h,radius:h.startRadius+(h.endRadius-h.startRadius)*Math.min(1,t/h.duration)};
 return h;
}
export function dangerousAt(h,t){return !h.cooling&&(h.active?t<h.remaining:t>=h.warning&&t<h.warning+h.remaining);}
// Time-expanded reachability, not a static union of every future impact.
// A 20 px cardinal step per .1 s is slower than the unupgraded player (212 px/s).
// Padding includes half a simulation step; the returned witness is replay-tested.
export function bossEscapeRoute(hazards,p,horizon=3){
 const step=20,dt=.1,r=p.radius||13,cells=[];let cols=0;
 for(let y=ROOM.top+r+3;y<=ROOM.bottom-r-3;y+=step){let n=0;for(let x=ROOM.left+r+3;x<=ROOM.right-r-3;x+=step){cells.push({x,y,radius:r});n++;}cols=n;}
 const safe=(cell,t)=>hazards.every(h=>!dangerousAt(h,t)||!forgeTouches(projectBossHazard(h,t),cell,7));
 let ids=new Set();
 for(let i=0;i<cells.length;i++)if(Math.hypot(cells[i].x-p.x,cells[i].y-p.y)<25&&safe(cells[i],0))ids.add(i);
 if(!ids.size)return {ok:false,reason:'start',reachable:0};
 let min=ids.size;
 for(let k=1;k<=Math.ceil(horizon/dt);k++){
  const next=new Set(),t=k*dt;
  for(const id of ids)for(const j of [id,id-1,id+1,id-cols,id+cols]){
   if(j<0||j>=cells.length||Math.abs(j%cols-id%cols)>1||next.has(j))continue;
   if(safe(cells[j],t)&&safe(cells[j],t-dt/2))next.add(j);
  }
  if(!next.size)return {ok:false,reason:'blocked',at:t,reachable:0};
  ids=next;min=Math.min(min,ids.size);
 }
 return {ok:true,reachable:ids.size,minReachable:min};
}
