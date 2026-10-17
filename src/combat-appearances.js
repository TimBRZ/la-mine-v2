// Presentation catalogue: replace an SVG here without touching combat definitions.
import {stableFacing,travelFacing} from './enemy-facing.js';
const define=(id,width,height,orientation='rotate',originY=.5,pace=10,bounce=.55)=>Object.freeze({
  id,key:'combat-v020-'+id,url:'./src/assets/combat-v020/'+id+'.svg',
  width,height,orientation,originX:.5,originY,pace,bounce,
});
export const COMBAT_APPEARANCES=Object.freeze({
  hero:define('hero',46,52,'flip',.62,14,.65),
  rat:define('rat',42,36,'travel',.54,22,.4),
  miner:define('miner',62,66,'flip',.62,8,.65),
  drill:define('drill',58,50,'rotate',.52,12,.25),
  wagon:define('wagon',59,52,'rail',.52,17,.2),
  draisine:define('draisine',58,53,'rotate',.52,13,.3),
  haveuse:define('haveuse',88,88,'rotate',.5,9,.3),
  crachefer:define('crachefer',84,84,'rotate',.5,8,.25),
  effondreur:define('effondreur',86,86,'rotate',.5,7,.35),
  stationmaster:define('stationmaster',82,86,'flip',.61,11,.7),
  locomotive:define('locomotive',88,88,'rotate',.5,8,.2),
  switchman:define('switchman',86,86,'flip',.6,9,.45),
  shotgun:define('shotgun',34,34,'weapon',.45,0,0),
  grisoux:define('grisoux',34,34,'weapon',.45,0,0),
  smg:define('smg',32,32,'weapon',.45,0,0),
});
export function preloadCombatAppearances(scene) {
  for(const art of Object.values(COMBAT_APPEARANCES))scene.load.svg(art.key,art.url,{width:128,height:128});
}
export function useCombatAppearance(image,id,textures) {
  const art=COMBAT_APPEARANCES[id];
  if(!art||!textures.exists(art.key))return null; // Existing V0.19 texture is the load-failure fallback.
  image.setTexture(art.key).setOrigin(art.originX,art.originY).setDisplaySize(art.width,art.height);
  return art;
}
export function createAppearanceMotion(x,y) {return {x,y,time:0,move:0,pose:{}};}

// Only local presentation state changes. Positions, velocities, radii and timers are read-only.
export function appearancePose(art,motion,entity,dt,reducedMotion=false) {
  dt=Math.max(0,Math.min(.04,dt||0));
  const dx=entity.x-motion.x,dy=entity.y-motion.y;
  const moving=dt>0&&Math.hypot(dx,dy)>.025?1:0;
  motion.x=entity.x;motion.y=entity.y;motion.time+=dt;
  motion.move+=(moving-motion.move)*Math.min(1,dt*12);
  let angle=Number.isFinite(entity.angle)?entity.angle:0;
  // Profile artwork: mirror on leftward travel, then tilt toward the exact heading.
  // This keeps feet/wheels below the body instead of rotating them overhead.
  if(art.orientation==='travel'&&moving)angle=Math.atan2(dy,dx);
  if(art.id==='rat'){
    if(moving||motion.travelAngle===undefined)motion.travelAngle=angle;
    else angle=motion.travelAngle;
  }
  if(art.orientation==='rail'&&Number.isFinite(entity.chargeAngle))angle=entity.chargeAngle;
  const directional=art.orientation==='travel'||art.orientation==='rail';
  const left=art.id==='rat'?travelFacing(motion,entity,angle):Math.cos(angle)<0;
  const walk=Math.sin(motion.time*art.pace),idle=Math.sin(motion.time*2.4);
  const amount=reducedMotion?0:motion.move;
  const spawn=entity.active===false?Math.max(.86,1-Math.min(1,(entity.warmup||0)/1.4)*.14):1;
  const hit=!reducedMotion&&entity.flash>0?.025:0;
  Object.assign(motion.pose,{
    flipX:directional?left:art.id==='miner'?stableFacing(motion,Math.cos(angle),Math.sin(angle),.1):art.orientation==='flip'&&Math.cos(angle)<-.1,
    rotation:directional?(left?Math.atan2(-Math.sin(angle),-Math.cos(angle)):angle):art.orientation==='rotate'?angle:0,
    scaleX:art.width/128*(reducedMotion?1:spawn*(1+walk*amount*.018+hit)),
    scaleY:art.height/128*(reducedMotion?1:spawn*(1-walk*amount*.018-hit+idle*(1-amount)*.006)),
    y:reducedMotion?0:-Math.abs(walk)*art.bounce*amount-idle*.15*(1-amount),
  });
  return motion.pose;
}
export function animateCombatAppearance(image,art,motion,entity,dt,reducedMotion=false) {
  const pose=appearancePose(art,motion,entity,dt,reducedMotion);
  image.setFlipX(pose.flipX).setRotation(pose.rotation).setScale(pose.scaleX,pose.scaleY);
  return pose;
}
