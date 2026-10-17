import {isPureProjectile} from '../projectile-attacks.js';
import {bossSequenceLabel,drawBossHazard,drawBossPlans} from './boss-view.js';
import {dangerCircle,dangerLane} from '../combat-art.js';
import {DEPTHS_ENEMIES,DEPTHS_BOSSES,DEPTHS_PATTERNS} from './config.js';
import {lane} from './combat.js';
export const depthsLabel=e=>bossSequenceLabel(e)||({light:'LAMPE ×3',plant:'CHARGE POSÉE',leap:'BOND',beam:'FAISCEAU',fan:'ÉVENTAIL ×6',blackout:'EXTINCTION',charges:'3 CHARGES',chain:'CHAÎNE 1 → 3',ring:'ONDE · PASSAGE',lob:'CHARGE !',rush:'CHARGE LOURDE',slam:'IMPACT',cracks:'FISSURES'})[e.pattern]||'';
// Only the static background is dimmed. All combat layers retain full contrast.
export function applyDepthsLighting(background,run){const dark=run.depths?.darkness;if(run.wavePhase==='combat'&&dark?.prelude>0)background.setTint(0x9298a5);else if(dark?.active&&run.wavePhase==='combat')background.setTint(0x505868);else background.clearTint();}
export function depthsTextures(texture) {
 texture('arena-depths',450,800,g=>{
  g.fillStyle(0x0a1019).fillRect(0,0,450,800);g.fillStyle(0x232b39).fillRect(28,116,394,550);
  for(let y=126;y<650;y+=60)for(let x=32;x<415;x+=64){g.fillStyle(0x2d3443).fillTriangle(x,y,x+54,y+9,x+22,y+50);g.lineStyle(2,0x141c29).lineBetween(x,y,x+22,y+50);}
  for(const x of [19,431]){g.lineStyle(9,0x776b60).lineBetween(x,135,x+5,285).lineBetween(x+5,285,x-4,465).lineBetween(x-4,465,x,642);g.lineStyle(4,0x384958).lineBetween(x+9,140,x+9,375).lineBetween(x+9,392,x+9,620);for(let y=190;y<630;y+=110){g.lineStyle(4,0x131c2a).lineBetween(x,y,x+17,y+33);g.fillStyle(0xffe9a5).fillRect(x-3,y,6,5);}}
  for(let i=0;i<36;i++)g.fillStyle(0xa3b0c2,.25).fillCircle(45+i*79%360,150+i*113%485,1);
  g.lineStyle(3,0x8993a1).strokeRect(28,116,394,550);
 });
 for(const [id,s] of Object.entries({...DEPTHS_ENEMIES,...DEPTHS_BOSSES})) {
  const boss=!!DEPTHS_BOSSES[id],size=boss?84:48,c=size/2;
  texture(id,size,size,g=>{
   g.fillStyle(0x101623).fillRoundedRect(3,4,size-6,size-8,10);
   if(['blackmaw','blackmass'].includes(id)){
    g.fillStyle(0x424f67).fillTriangle(5,c+13,c,6,size-5,c+13).fillRoundedRect(7,c-6,size-14,c,8);
    g.lineStyle(3,s.color).strokeTriangle(5,c+13,c,6,size-5,c+13);
    for(const side of [-1,1]){g.fillStyle(0xe2efff).fillRect(c+side*(boss?12:7)-3,c-7,6,4);g.fillStyle(0x8796b2).fillTriangle(c+side*(c-3),c,c+side*(c-3),size-6,c+side*8,size-11);}
    g.fillStyle(0x121a25).fillRect(c-8,c+5,16,6);
   } else {
    g.fillStyle(0x596373).fillRoundedRect(9,14,size-18,size-20,6);g.lineStyle(3,s.color).strokeRoundedRect(9,14,size-18,size-20,6);
    g.fillStyle(0x9f8d62).fillRoundedRect(c-13,4,26,13,5);g.fillStyle(0xe9f4ff).fillCircle(c,10,4);
    if(['lampist','lampmajor'].includes(id)){
     g.fillStyle(0x1c2639).fillCircle(c,c+5,boss?20:12);g.lineStyle(3,0xffe49b).strokeCircle(c,c+5,boss?20:12);g.fillStyle(0xffedb1).fillCircle(c,c+5,boss?13:7);g.fillStyle(0xffffff).fillCircle(c-2,c+2,boss?5:3);
    } else {
     for(const side of [-1,0,1]){g.fillStyle(0xda765e).fillRoundedRect(c+side*9-3,c-6,7,boss?27:18,2);g.lineStyle(2,0xffe3a1).lineBetween(c+side*9,c-6,c+side*9+4,c-12);}
     g.fillStyle(0xf7d6a5).fillRect(c-13,c+7,26,4);
    }
   }
  });
 }
}
export function drawDepths(g,run) {
 if(!run.depths)return;
 drawBossPlans(g,run,drawOrder);
 for(const h of run.depths.ground.items){
  if(h.controlled){drawBossHazard(g,h);continue;}
  if(Number.isFinite(h.x2))dangerLane(g,h.x,h.y,h.x2,h.y2,h.width,h.active);
  else {dangerCircle(g,h.x,h.y,h.radius,h.active);g.lineStyle(2,0xffedaf).strokeCircle(h.x,h.y,9);if(h.order)drawOrder(g,h.x,h.y,h.order);if(h.kind==='rock'){g.fillStyle(0x15202c).fillTriangle(h.x-9,h.y+7,h.x-3,h.y-10,h.x+11,h.y+5);g.lineStyle(2,0xe5efff).strokeTriangle(h.x-9,h.y+7,h.x-3,h.y-10,h.x+11,h.y+5);}}
 }
 for(const e of run.enemies)if(!isPureProjectile(e)&&e.depthsType&&e.active&&!e.bossSequence&&['warning','charge'].includes(e.phase)){
  const spec=DEPTHS_PATTERNS[e.pattern];
  if(spec.seconds){const h=lane(e,e.chargeAngle,spec.speed*spec.seconds);dangerLane(g,h.x,h.y,h.x2,h.y2,e.radius,e.phase==='charge');}
  else for(const a of e.shotAngles||[]){const h=lane(e,a,e.pattern==='ring'?90:125);dangerLane(g,h.x,h.y,h.x2,h.y2,4);}
  if(e.pattern==='blackout'){g.lineStyle(3,0xd5e5ff).strokeCircle(e.x,e.y,e.radius+9);}
 }
}
function drawOrder(g,x,y,n){
 g.fillStyle(0x101827).fillCircle(x,y,12);g.lineStyle(2.5,0xffffff);
 const paths={1:[[-3,-5],[0,-7],[0,7],[-4,7],[4,7]],2:[[-4,-7],[4,-7],[4,0],[-4,0],[-4,7],[4,7]],4:[[-4,-7],[-4,0],[4,0],[2,0],[2,-7],[2,7]],3:[[-4,-7],[4,-7],[4,0],[-3,0],[4,0],[4,7],[-4,7]]};
 const points=paths[n];for(let i=1;i<points.length;i++)g.lineBetween(x+points[i-1][0],y+points[i-1][1],x+points[i][0],y+points[i][1]);
}
