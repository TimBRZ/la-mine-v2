import {ROOM} from './config.js';

// Movement only: attack clocks, locked warnings and world-space hazards stay
// owned by each actor. Different ranges/settles keep the trio desynchronised.
export const MOBILITY=Object.freeze({
  haveuse:{min:65,max:125,lateral:.35,settle:.35},
  crachefer:{min:210,max:260,lateral:.75,settle:.3},
  effondreur:{min:110,max:180,lateral:.65,settle:.4},
  stationmaster:{min:85,max:145,lateral:.45,settle:.3},
  locomotive:{min:45,max:95,lateral:.2,settle:.4},
  switchman:{min:175,max:230,lateral:.8,settle:.3},
  cager:{min:90,max:150,lateral:.5,settle:.3},
  compressor:{min:170,max:235,lateral:.7,settle:.4},
  firedamp:{min:165,max:235,lateral:1,speed:76,settle:.25},
  deepdriller:{min:60,max:100,lateral:.2,settle:.3},
  surveyor:{min:190,max:245,lateral:.55,speed:62,retreat:86,settle:.25},
  gasminer:{min:0,max:0,lateral:0,settle:.3},
  drill:{min:125,max:155,lateral:.55,settle:.3},
  draisine:{min:160,max:205,lateral:.65,settle:.3},
});
const profile=e=>MOBILITY[e.bossId||e.kind];
export function moveBetweenAttacks(e,dt,player) {
  const p=profile(e);if(!p||!e.active||dt<=0)return;
  const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy),a=d?Math.atan2(dy,dx):0;
  const radial=d<p.min?-1:d>p.max?1:0;
  const side=(e.attackCount||e.id)%2?-1:1;
  let vx=Math.cos(a)*radial-Math.sin(a)*p.lateral*side;
  let vy=Math.sin(a)*radial+Math.cos(a)*p.lateral*side;
  // A brief inward leg avoids oscillating across an edge threshold. Charges
  // never use this steering, and warnings keep their original position.
  const margin=e.radius+18;
  const outward=e.x<ROOM.left+margin&&vx<0||e.x>ROOM.right-margin&&vx>0||
    e.y<ROOM.top+margin&&vy<0||e.y>ROOM.bottom-margin&&vy>0;
  if(!(e.mobilityEscape>0)&&outward)e.mobilityEscape=.55;
  if(e.mobilityEscape>0){
    e.mobilityEscape=Math.max(0,e.mobilityEscape-dt);
    vx=(ROOM.left+ROOM.right)/2-e.x;vy=(ROOM.top+ROOM.bottom)/2-e.y;
  }
  const length=Math.hypot(vx,vy)||1;
  let speed=radial<0&&p.retreat?p.retreat:p.speed??e.spec?.speed??e.stats.speed;
  if(e.kind==='gasminer'&&d<150)speed*=1.12;
  if(e.kind!=='boss'&&e.flash>0)speed*=.35;
  e.angle=a;e.move(dt,vx/length*speed,vy/length*speed);
}
export function recoveryMotion(e,dt,player) {
  if(e.phase!=='recovery'){e.recoveryElapsed=0;return;}
  const before=e.recoveryElapsed||0;e.recoveryElapsed=before+dt;
  const settle=profile(e)?.settle??.35;
  const moving=Math.max(0,e.recoveryElapsed-settle)-Math.max(0,before-settle);
  moveBetweenAttacks(e,moving,player);
}
export function motionLocked(e) {
  return !['positioning','chase'].includes(e.phase)&&!(e.phase==='recovery'&&(e.recoveryElapsed||0)>(profile(e)?.settle??.35));
}
