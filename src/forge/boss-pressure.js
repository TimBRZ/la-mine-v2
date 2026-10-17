import {ROOM} from '../config.js';
// Dungeon bosses only. Distances are in arena pixels, not display pixels.
export const BOSS_RANGES={furnace:{near:115,far:190,pace:.95},hammer:{near:75,far:130,pace:.72},boiler:{near:90,far:155,pace:1}};
export function distanceBand(e,p){const d=Math.hypot(p.x-e.x,p.y-e.y),r=BOSS_RANGES[e.bossId];return d>r.far?'TOO_FAR':d<r.near?'TOO_CLOSE':'GOOD_RANGE';}
export function updatePressure(e,dt,p){
 const band=distanceBand(e,p);e.distanceBand=band;e.farTime=band==='TOO_FAR'?(e.farTime||0)+dt:0;
 e.pressureCooldown=Math.max(0,(e.pressureCooldown||0)-dt);
 if(e.pressureMode==='PRESSURE_APPROACH'){
  e.pressureLeft-=dt;
  if(band!=='TOO_FAR'||e.pressureLeft<=0){e.pressureMode='NORMAL';e.pressureCooldown=3;e.farTime=0;}
 }else if(e.farTime>=2.5&&!e.pressureCooldown){e.pressureMode='PRESSURE_APPROACH';e.pressureLeft=2.5;}
}
export function pressureRoles(d){
 if(d.pressureStamp===d.run.elapsed)return;d.pressureStamp=d.run.elapsed;
 const bosses=d.run.enemies.filter(e=>e.alive&&e.final&&BOSS_RANGES[e.bossId]),order=['furnace','boiler','hammer'];
 const available=e=>!e.dungeonRecovery&&e.phase!=='recovery'&&(!e.plan||e.plan.mobility?.speed>0);
 const current=bosses.find(e=>e.id===d.pressureOwner),candidates=bosses.filter(available);
 if(bosses.length<2){for(const e of bosses)e.pressureBoss=false;return;}
 if(!current||!available(current)||d.run.elapsed>=(d.pressureUntil||0)){
  const start=((d.pressureIndex??-1)+1)%3;
  const chosen=Array.from({length:3},(_,i)=>order[(start+i)%3]).map(id=>candidates.find(e=>e.bossId===id)).find(Boolean);
  if(chosen){d.pressureOwner=chosen.id;d.pressureIndex=order.indexOf(chosen.bossId);d.pressureUntil=d.run.elapsed+5;d.record({type:'pressure-role',boss:chosen.bossId});}
 }
 for(const e of bosses)e.pressureBoss=e.id===d.pressureOwner&&available(e);
}
// One straight segment sampled at preparation; never homing during an attack.
export function pressureDirection(e,p){
 const r=BOSS_RANGES[e.bossId],a=Math.atan2(p.y-e.y,p.x-e.x),d=Math.hypot(p.x-e.x,p.y-e.y),side=e.attackCount%2?-1:1;
 const goal=e.pressureBoss?r.near:(r.near+r.far)/2;
 if(d>goal+8)return {vx:Math.cos(a),vy:Math.sin(a),closing:true,limit:Math.max(0,d-r.near)};
 if(d<r.near)return {vx:-Math.cos(a),vy:-Math.sin(a),closing:false,limit:r.near-d+12};
 let vx=-Math.sin(a)*side,vy=Math.cos(a)*side;if(vx*(225-e.x)+vy*(390-e.y)<0){vx=-vx;vy=-vy;}
 return {vx,vy,closing:false,limit:70};
}
export function corridorLimit(e,v,limit,others=[]){
 let safe=Math.min(limit,...[[v.vx,ROOM.left+e.radius+8-e.x,ROOM.right-e.radius-8-e.x],[v.vy,ROOM.top+e.radius+8-e.y,ROOM.bottom-e.radius-8-e.y]].map(([n,lo,hi])=>n>0?Math.max(0,hi/n):n<0?Math.max(0,lo/n):Infinity));
 // Preserve a player-width gap between machines rather than closing a pincer.
 for(const b of others){if(b===e||!b.alive)continue;const dx=b.x-e.x,dy=b.y-e.y,along=dx*v.vx+dy*v.vy,perp=Math.abs(dx*v.vy-dy*v.vx),gap=e.radius+b.radius+34;
  if(along>0&&perp<gap)safe=Math.min(safe,Math.max(0,along-Math.sqrt(gap*gap-perp*perp)));
 }return Math.max(0,safe);
}
export function repositionBoss(e,dt,p,others){
 e.steerLeft=(e.steerLeft||0)-dt;
 if(!e.pressureSteer||e.steerLeft<=0){e.pressureSteer=approachCorridor(e,p,65,others);e.steerLeft=.55;}
 const v=e.pressureSteer,r=BOSS_RANGES[e.bossId],boost=e.pressureMode==='PRESSURE_APPROACH'?1.15:1;
 let step=e.spec.speed*r.pace*boost*dt;
 if(v.closing)step=Math.min(step,Math.max(0,Math.hypot(p.x-e.x,p.y-e.y)-r.near));
 step=corridorLimit(e,v,step,others);e.x+=v.vx*step;e.y+=v.vy*step;e.angle=Math.atan2(v.vy,v.vx);
}
export function approachCorridor(e,p,max,others){
 const direct=pressureDirection(e,p);let best=direct,score=corridorLimit(e,direct,Math.min(max,direct.limit),others);
 if(direct.closing&&score<25){for(const angle of [-.65,.65,-1,1]){
  const c=Math.cos(angle),s=Math.sin(angle),v={...direct,vx:direct.vx*c-direct.vy*s,vy:direct.vx*s+direct.vy*c};
  const value=corridorLimit(e,v,Math.min(max,v.limit),others)*c;if(value>score){score=value;best=v;}
 }}return best;
}
