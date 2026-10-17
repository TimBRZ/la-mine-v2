// Presentation state only. A symmetric dead band remembers the last valid side.
import {ROOM} from './config.js';
// x/y may be a displacement or a unit aim vector: the threshold is dimensionless.
export const FACING_AXIS_RATIO=.45;
export function stableFacing(state,x,y,threshold=.18){
 const length=Math.hypot(x,y);
 if(Number.isFinite(length)&&length>0&&Math.abs(x)/length>threshold&&Math.abs(x)>=Math.abs(y)*FACING_AXIS_RATIO)state.facing=x<0;
 return !!state.facing;
}

// These actors retain their logical heading BEFORE edge escape / push / clamp.
// They expose no desired-velocity field. Use that heading rather than copying
// their AI here or inferring intent from the final physical displacement.
export function facingIntent(entity,dx,dy){
 if((entity.forgeType||entity.depthsType||entity.kind==='rat'||entity.kind==='miner')&&Number.isFinite(entity.angle))
  return {x:Math.cos(entity.angle),y:Math.sin(entity.angle),source:'logical-heading'};
 return {x:dx,y:dy,source:'displacement-fallback'};
}

export function travelFacing(state,entity,angle,threshold=.1){
 // Rat profiles keep their established travel/knockback orientation away from
 // side walls. 24 units cover the 16/18-unit escape margins plus one move step.
 const atSide=Number.isFinite(entity.radius)&&(entity.x-ROOM.left-entity.radius<=24||ROOM.right-entity.radius-entity.x<=24);
 const intent=atSide?facingIntent(entity,Math.cos(angle),Math.sin(angle)):{x:Math.cos(angle),y:Math.sin(angle)};
 return stableFacing(state,intent.x,intent.y,threshold);
}

// Mobile humanoids: travel while positioning, committed aim on warning/charge.
// A repeated render with no new displacement must NOT fall back to stale aim.
export function mobileFacing(state,entity,dx,dy,moving){
 if(state.facing===undefined)stableFacing(state,Math.cos(entity.angle??state.angle),Math.sin(entity.angle??state.angle));
 if(!entity.dead){
  if(entity.phase==='positioning'&&moving){const intent=facingIntent(entity,dx,dy);stableFacing(state,intent.x,intent.y);}
  else if(entity.phase==='warning'&&state.phase!=='warning'){
   const angle=entity.attackAngle??entity.angle;
   stableFacing(state,Math.cos(angle),Math.sin(angle));
  }else if(entity.phase==='charge'&&state.phase!=='charge'){
   stableFacing(state,Math.cos(entity.chargeAngle),Math.sin(entity.chargeAngle));
  }
 }
 // Initialize even for a vertical/unknown spawn so later idle frames retain it.
 state.facing=!!state.facing;
 return state.facing;
}
