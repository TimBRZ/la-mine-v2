import {isPureProjectile} from '../projectile-attacks.js';
import {dangerCircle,dangerLane} from '../combat-art.js';import {ROOM} from '../config.js';
import {RIFT_ENEMIES,RIFT_BOSSES,radialAngles} from './config.js';
export function riftTextures(texture){
 texture('arena-rift',450,800,g=>{
  g.fillStyle(0x10191b).fillRect(0,0,450,800);g.fillStyle(0x202b2b).fillRect(28,116,394,550);
  for(let y=120;y<660;y+=64)for(let x=32;x<415;x+=65){g.fillStyle((x+y)%3?0x273230:0x293333).fillTriangle(x,y,x+60,y+8,x+29,y+58);g.lineStyle(2,0x121d1d).lineBetween(x,y,x+29,y+58);}
  for(const [x,y] of [[40,210],[400,390],[50,550],[380,140]]){g.lineStyle(5,0x597b62,.65).lineBetween(x,y,x+12,y+30).lineBetween(x+12,y+30,x-5,y+60);g.lineStyle(2,0xa9d382,.65).lineBetween(x,y,x+12,y+30);}
  for(const x of [22,428]){g.lineStyle(8,0x695448).lineBetween(x,140,x,620);for(let y=170;y<620;y+=110){g.fillStyle(0x3c514d).fillTriangle(x-10,y+18,x,y-16,x+11,y+18);g.lineStyle(2,0x83cdb3).strokeTriangle(x-10,y+18,x,y-16,x+11,y+18);}}
  g.lineStyle(4,0x968258).strokeRect(28,116,394,550);for(const x of [55,395])for(const y of [130,650])g.fillStyle(0xf1d68c).fillCircle(x,y,4);
 });
 for(const [id,s] of Object.entries({...RIFT_ENEMIES,...RIFT_BOSSES})){
  const boss=Object.hasOwn(RIFT_BOSSES,id),size=boss?84:48,c=size/2;texture(id,size,size,g=>{
   g.fillStyle(0x101c1d).fillCircle(c,c,c-3);g.lineStyle(boss?4:3,s.color).strokeCircle(c,c,c-7);g.fillStyle(0x40584b).fillCircle(c,c,c-10);
   if(id==='crawler'){for(const side of [-1,1])for(let i=0;i<3;i++)g.lineStyle(3,0xabc098).lineBetween(c+side*13,c-10+i*10,c+side*22,c-16+i*12);g.fillStyle(0xe3dc9c).fillTriangle(c-9,c-9,c,c-22,c+9,c-9);}
   if(id==='spitter'||id==='blower'){g.fillStyle(0x172c2b).fillCircle(c,c,c*.48);g.lineStyle(4,0xb78a58).strokeCircle(c,c,c*.48);for(let i=0;i<3;i++)g.fillStyle(s.color).fillCircle(c-7+i*7,c,3);g.fillStyle(0x72947c).fillRect(c-7,3,14,c*.4);}
   if(id==='burster'||id==='core'){g.fillStyle(0xcfdd8c).fillTriangle(c,c*.38,c*.55,c*1.2,c*1.5,c);g.fillStyle(0x9ad6c0).fillTriangle(c*1.5,c,c,c*1.7,c*.55,c*1.2);for(const a of [0,2.1,4.2])g.lineStyle(3,0x2c3e37).lineBetween(c,c,c+Math.cos(a)*(c-5),c+Math.sin(a)*(c-5));}
   if(id==='splitter'){g.fillStyle(0x9b7855).fillRect(17,20,50,40);g.fillStyle(0xe3cfa1).fillTriangle(12,54,35,15,35,65).fillTriangle(72,54,49,15,49,65);g.fillStyle(0xaadb99).fillRect(37,28,10,22);}
   g.fillStyle(0xffecaa).fillCircle(c,boss?12:8,boss?4:3);
  });
 }
}
export const riftLabel=e=>({charge:'CHARGE',fan8:'ÉVENTAIL ×8',fissures:'FISSURES',circle8:'CERCLE ×8',pockets:'4 POCHES',cone:'SOUFFLE',double:'DOUBLE ×8',rain:'PLUIE !',orb:'ORBE',spit:'GAZ !',blast:'EXPLOSION !'})[e.pattern]||'';
export function drawRift(g,run,drawGas=null){
 if(!run.rift)return;
 for(const h of run.rift.ground.items){if(drawGas?.(g,h))continue;if(h.kind==='fissure')dangerLane(g,h.x,h.y,h.x2,h.y2,h.width,h.active);else {dangerCircle(g,h.x,h.y,h.radius,h.active);g.lineStyle(2,0x92e8b0,h.active?.9:.5).strokeCircle(h.x,h.y,h.radius*.65);}}
 for(const e of run.enemies)if(!isPureProjectile(e)&&e.riftType&&e.active&&['warning','charge','burst'].includes(e.phase)){
  if(e.pattern==='charge'){const dx=Math.cos(e.chargeAngle),dy=Math.sin(e.chargeAngle),tx=dx>0?(ROOM.right-e.x)/dx:dx<0?(ROOM.left-e.x)/dx:Infinity,ty=dy>0?(ROOM.bottom-e.y)/dy:dy<0?(ROOM.top-e.y)/dy:Infinity,l=Math.min(363,tx,ty);dangerLane(g,e.x,e.y,e.x+dx*l,e.y+dy*l,e.radius,e.phase==='charge');}
  else for(const angle of e.shotAngles||[]){const a=e.phase==='burst'?angle+Math.PI/8:angle;const l=['double','circle8'].includes(e.pattern)?85:110;dangerLane(g,e.x,e.y,e.x+Math.cos(a)*l,e.y+Math.sin(a)*l,3);}
 }
 for(const b of run.rift.shots.bursts){dangerCircle(g,b.x,b.y,25,false);for(const a of radialAngles(0,6))g.lineStyle(2,0xf0d18a,.8).lineBetween(b.x+Math.cos(a)*25,b.y+Math.sin(a)*25,b.x+Math.cos(a)*55,b.y+Math.sin(a)*55);}
}
