import {isPureProjectile} from '../projectile-attacks.js';
import {dungeonLabel,drawDungeonHazard,drawDungeonSafeZones} from './boss-view.js';
import {dangerLane,dangerCircle} from '../combat-art.js';import {FORGE_ENEMIES,FORGE_BOSSES,FORGE_PATTERNS,FORGE_PLATES} from './config.js';import {forgeLane} from './combat.js';
export const forgeLabel=e=>dungeonLabel(e)||({heat:'PLAQUE CHAUDE',rivet:'RIVET',rivets:'RIVETS ×3',scorch:'RUÉE · TRAÎNÉE',plates:'PLAQUES BRÛLANTES',jet:'JET DE CHALEUR',slam:'PILON !',doubleSlam:'DOUBLE IMPACT',ring:'ONDE · PASSAGE',ram:'CHARGE LOURDE',steam:'VAPEUR',valves:'SOUPAPES 1 → 4',general:'SURCHAUFFE',tap:'IMPACT'})[e.pattern]||'';
export function forgeTextures(texture){
 texture('arena-forge',450,800,g=>{g.fillStyle(0x14191c).fillRect(0,0,450,800);g.fillStyle(0x272d32).fillRect(28,116,394,550);
  for(const p of FORGE_PLATES){g.fillStyle(0x343a3e).fillRoundedRect(p.x-p.w/2,p.y-p.h/2,p.w,p.h,4);g.lineStyle(2,0x101b22).strokeRoundedRect(p.x-p.w/2,p.y-p.h/2,p.w,p.h,4);for(const dx of [-1,1])for(const dy of [-1,1])g.fillStyle(0x788083).fillCircle(p.x+dx*(p.w/2-8),p.y+dy*(p.h/2-8),2);}
  for(const x of [12,438]){g.lineStyle(8,0x6b625c).lineBetween(x,140,x,640);g.lineStyle(2,0xc59a73).lineBetween(x-2,140,x-2,640);for(let y=165;y<640;y+=100){g.fillStyle(0x15171a).fillRect(x-9,y,18,45);g.fillStyle(0xba6c44).fillRect(x-5,y+9,10,28);g.fillStyle(0xf7ba78,.65).fillRect(x-3,y+13,6,18);}}
  for(let y=132;y<250;y+=12){g.lineStyle(2,0x858384).strokeEllipse(53,y,7,11).strokeEllipse(397,y+7,7,11);}g.lineStyle(3,0x979797).strokeRect(28,116,394,550);
 });
 for(const [id,s]of Object.entries({...FORGE_ENEMIES,...FORGE_BOSSES})){const boss=!!FORGE_BOSSES[id],size=boss?84:48,c=size/2;texture(id,size,size,g=>{
  g.fillStyle(0x11191d).fillRoundedRect(3,5,size-6,size-8,8);g.fillStyle(0x535c62).fillRoundedRect(8,10,size-16,size-18,6);g.lineStyle(3,s.color).strokeRoundedRect(8,10,size-16,size-18,6);
  if(['stoker','furnace'].includes(id)){g.fillStyle(0x211713).fillRoundedRect(c-12,c-8,24,boss?33:22,5);g.fillStyle(0xf7a264).fillTriangle(c-9,c+13,c-5,c-3,c,c+1).fillTriangle(c-2,c+13,c+5,c-8,c+10,c+13);g.fillStyle(0xfff0b8).fillTriangle(c-3,c+12,c+2,c+1,c+5,c+12);for(const dx of [-9,0,9])g.lineStyle(3,0x41372e).lineBetween(c+dx,c-8,c+dx,c+18);}
  else if(['scorifier','hammer'].includes(id)){g.fillStyle(0x8b9294).fillRect(5,c-13,size-10,14);g.lineStyle(3,s.color).strokeRect(5,c-13,size-10,14);g.fillStyle(0xe47e56).fillRect(c-5,c+1,10,15);g.fillStyle(0x8b9294).fillTriangle(7,c+16,c,c+6,size-7,c+16);}
  else if(id==='riveter'){g.fillStyle(0xc8cdca).fillRect(c-5,2,10,c+14);g.fillStyle(0x202a31).fillRect(c-3,0,6,8);g.fillStyle(0xffe9bd).fillCircle(c,c+6,5);g.fillStyle(0x879094).fillRect(4,c+1,8,17);}
  else {g.fillStyle(0x75818a).fillEllipse(c,c+4,size-25,size-17);g.fillStyle(0x20272b).fillCircle(c,c,15);g.lineStyle(3,0xffd6a0).strokeCircle(c,c,15);g.lineStyle(3,0xeef6ff).lineBetween(c,c,c+8,c-8);for(const dx of [-1,1]){g.fillStyle(0xaeb9bf).fillRect(c+dx*29-4,c-8,8,27);g.fillStyle(0xeee5d0).fillCircle(c+dx*29,c-11,6);}}
  g.fillStyle(0xf0f3e3).fillRect(c-8,14,5,3).fillRect(c+3,14,5,3);g.fillStyle(0x182126).fillRect(8,size-8,10,6).fillRect(size-18,size-8,10,6);
 });}
}
export function drawForge(g,run){if(!run.forge)return;drawDungeonSafeZones(g,run);
 for(const h of run.forge.ground.items){if(h.dungeon){drawDungeonHazard(g,h);continue;}const color=h.cooling?0x8eb5b9:h.active?0xff8050:0xffd58c,alpha=h.cooling?.12:h.active?.35:.08+.17*(1-h.warning/h.warningTotal);
  if(h.shape==='plate'){g.fillStyle(color,alpha).fillRoundedRect(h.x-h.w/2,h.y-h.h/2,h.w,h.h,4);g.lineStyle(h.active?4:2,color).strokeRoundedRect(h.x-h.w/2,h.y-h.h/2,h.w,h.h,4);for(let j=-1;j<=1;j++)g.lineStyle(2,color,h.cooling?.3:.9).lineBetween(h.x-21,h.y+j*18+8,h.x+21,h.y+j*18-8);}
  else if(h.shape==='line'){if(h.cooling)g.lineStyle(h.width*2,0x8eb5b9,.15).lineBetween(h.x,h.y,h.x2,h.y2);else dangerLane(g,h.x,h.y,h.x2,h.y2,h.width,h.active);if(h.order)for(let i=0;i<h.order;i++)g.fillStyle(0xfff5cf).fillCircle(h.x+(h.x2-h.x)*.65+(i-(h.order-1)/2)*6,h.y+(h.y2-h.y)*.65,2);}
  else if(h.shape==='cone'){const a=h.angle-h.spread,b=h.angle+h.spread;g.fillStyle(color,alpha).slice(h.x,h.y,h.radius,a,b,false).fillPath();g.lineStyle(3,color).beginPath().moveTo(h.x,h.y).lineTo(h.x+Math.cos(a)*h.radius,h.y+Math.sin(a)*h.radius).arc(h.x,h.y,h.radius,a,b,false).closePath().strokePath();}
  else if(h.cooling)g.lineStyle(2,0x8eb5b9,.4).strokeCircle(h.x,h.y,h.radius);
  else dangerCircle(g,h.x,h.y,h.impactRadius&&(!h.active||h.elapsed<.25)?h.impactRadius:h.radius,h.active);
  if(h.heat&&!h.cooling){g.lineStyle(2,0xffefc9).lineBetween(h.x-7,h.y+5,h.x-3,h.y-7).lineBetween(h.x,h.y+5,h.x+4,h.y-7).lineBetween(h.x+7,h.y+5,h.x+11,h.y-7);}
 }
 for(const e of run.enemies)if(!isPureProjectile(e)&&e.forgeType&&e.active&&['warning','charge'].includes(e.phase)){const s=FORGE_PATTERNS[e.pattern];if(!s)continue;if(s.seconds){const h=forgeLane(e,e.chargeAngle,s.speed*s.seconds,e.radius);dangerLane(g,h.x,h.y,h.x2,h.y2,h.width,e.phase==='charge');}else for(const a of e.shotAngles||[]){const h=forgeLane(e,a,e.pattern==='ring'?90:145,3);dangerLane(g,h.x,h.y,h.x2,h.y2,h.width);}}
}
