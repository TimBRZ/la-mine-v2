import {ROOM} from './config.js';
export const BOSS_PATTERNS=Object.freeze({circleWarning:1.5,crossWarning:1.85,circleSpeed:105,circleRange:420,railSeconds:1.15,railWidth:16});
export const circleAngles=(angle,count)=>Array.from({length:count},(_,i)=>angle+i*Math.PI*2/count);
export function prepareCircle(boss,context={}) {
  const count=!boss.final&&boss.hp<boss.maxHealth*.5&&((boss.circleCount||0)%2===1)?8:6;
  if(context.reserveCircle&&!context.reserveCircle(boss,count))return false;
  boss.circleCount=(boss.circleCount||0)+1;
  boss.circleShots=count;
  // Half-sector rotation on alternate circles; fixed for the whole warning.
  boss.circleAngle=boss.circleCount%2?0:Math.PI/count;
  boss.projectilePattern='circle';boss.fanAttack=false;
  // Projectile-only ring: readiness and reservation are sufficient.
  boss.phaseTime=0;
  return true;
}
export const circleShot=boss=>({type:'enemy-shot',owner:boss.id,angle:boss.circleAngle,pattern:'circle',count:boss.circleShots});
export function switchRails(boss,player,context={}) {
  boss.railCount=(boss.railCount||0)+1;
  boss.crossPattern=!boss.final&&boss.hp<boss.maxHealth*.5&&boss.railCount%4===0&&(context.canCross?.(boss)??true);
  const horizontal=boss.railCount%2===1;
  const x=Math.max(ROOM.left+65,Math.min(ROOM.right-65,player.x));
  const y=Math.max(ROOM.top+65,Math.min(ROOM.bottom-65,player.y));
  const rail=(horizontal,position)=>({x:horizontal?ROOM.left:position,y:horizontal?position:ROOM.top,
    x2:horizontal?ROOM.right:position,y2:horizontal?position:ROOM.bottom,
    width:BOSS_PATTERNS.railWidth,active:false,time:BOSS_PATTERNS.railSeconds});
  boss.railOrientation=boss.crossPattern?'cross':horizontal?'horizontal':'vertical';
  if(boss.crossPattern){boss.phaseTime=BOSS_PATTERNS.crossWarning;return [rail(true,y),rail(false,x)];}
  const position=horizontal?y:x,low=horizontal?ROOM.top:ROOM.left,high=horizontal?ROOM.bottom:ROOM.right;
  const second=position+((position<(low+high)/2)?125:-125);
  return boss.final?[rail(horizontal,position)]:[rail(horizontal,position),rail(horizontal,second)];
}
