import { paintBoss } from './boss-art.js';
import { dangerLane, dangerCircle } from './combat-art.js';
import { ROOM } from './config.js';
export function drawRailBoss(g,boss) {
  for(const h of boss.hazards||[]) {
    if(h.radius)dangerCircle(g,h.x,h.y,h.radius,h.active);
    else dangerLane(g,h.x,h.y,h.x2,h.y2,h.width,h.active);
  }
  if(!boss.hazards||!Number.isFinite(boss.chargeAngle)||!['warning','charge'].includes(boss.phase))return;
  const dx=Math.cos(boss.chargeAngle),dy=Math.sin(boss.chargeAngle);
  const tx=dx>0?(ROOM.right-boss.radius-boss.x)/dx:dx<0?(ROOM.left+boss.radius-boss.x)/dx:Infinity;
  const ty=dy>0?(ROOM.bottom-boss.radius-boss.y)/dy:dy<0?(ROOM.top+boss.radius-boss.y)/dy:Infinity;
  const length=Math.max(0,Math.min(boss.spec.chargeSpeed*boss.spec.chargeSeconds,tx,ty));
  dangerLane(g,boss.x,boss.y,boss.x+dx*length,boss.y+dy*length,boss.radius,boss.phase==='charge');
}
export function makeRailBossTextures(texture) {
  for(const id of ['stationmaster','locomotive','switchman'])texture(id,84,84,g=>paintBoss(g,id));
}
