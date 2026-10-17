import { dangerLane } from '../combat-art.js';
export function drawRailWarning(g,enemy) {
  if(enemy.kind!=='wagon')return false;
  if(!enemy.alive||!['warning','charge'].includes(enemy.phase))return true;
  dangerLane(g,enemy.x,enemy.y,enemy.endX,enemy.y,enemy.radius,enemy.phase==='charge');
  return true;
}
