// Run-local energy rules; neither persistent progression nor the other weapons.
export const ENERGY = Object.freeze({attenuation:Object.freeze([1,.7,.5,.35]),arcRange:95,arcScale:.35,killPenaltyScale:.5});
export function reinforceConduit(weapon) {
  weapon.maxTargets=Math.min(4,weapon.maxTargets+1);
  weapon.piercing=true;
}
export function energyArc(origin,damage,enemies,events) {
  let target=null,distance=ENERGY.arcRange;
  for(const enemy of enemies) {
    if(!enemy.active||enemy.id===origin.id)continue;
    const d=Math.hypot(enemy.x-origin.x,enemy.y-origin.y);
    if(d<distance){target=enemy;distance=d;}
  }
  if(!target)return;
  const angle=Math.atan2(target.y-origin.y,target.x-origin.x);
  target.hit(damage*ENERGY.arcScale,angle,0);
  events.push({type:'energy-arc',x:origin.x,y:origin.y,endX:target.x,endY:target.y});
  // Arc deaths feed drops/Grisou normally, but never call this function again.
  events.push({type:target.alive?'hit':'kill',id:target.id,x:target.x,y:target.y,angle,energy:true,source:'arc'});
}
