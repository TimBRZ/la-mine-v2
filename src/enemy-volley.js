export const FAN_ANGLE=22*Math.PI/180;
export const fanAngles=angle=>[angle-FAN_ANGLE,angle,angle+FAN_ANGLE];
// The visible fan follows the aim during its warning, then locks when emitted.
export function aimFan(owner,player) {
  if(owner.fanAttack&&owner.phase==='warning')owner.attackAngle=Math.atan2(player.y-owner.y,player.x-owner.x);
}
export function enemyShot(owner,player) {
  if(owner.fanAttack)owner.attackAngle=Math.atan2(player.y-owner.y,player.x-owner.x);
  return {type:'enemy-shot',owner:owner.id,angle:owner.attackAngle,...(owner.fanAttack?{fan:true}: {})};
}
