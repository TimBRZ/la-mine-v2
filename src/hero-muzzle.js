// Presentation only. Never writes Player, Weapon or Projectiles.
// Compute the socket from the actual displayed weapon transform, including
// origin, size, recoil, rotation and mirroring. `out` is reused by the scene.
export function weaponMuzzleAnchor(out,visual,gun,held,hasGrip,shape){
 let x=0,y=0;
 if(held&&held.active!==false&&held.displayWidth>0){
  x=held.x+((hasGrip?visual.barrel.x/128:1)-held.originX)*held.displayWidth;
  y=held.y+((hasGrip?visual.barrel.y/128:.5)-held.originY)*held.displayHeight;
 }else{
  // Procedural fallback: rightmost rectangle edge, in the weapon container.
  for(const [cx,cy,w]of shape)if(cx+w/2>x){x=cx+w/2;y=cy;}
 }
 x*=gun.scaleX;y*=gun.scaleY;
 const c=Math.cos(gun.rotation),s=Math.sin(gun.rotation);
 out.x=gun.x+c*x-s*y;out.y=gun.y+s*x+c*y;return out;
}

// One reusable state per projectile VIEW, not on the simulation object.
// hitIds is allocated by Projectiles.fire for each launch and stays the same
// through piercing: it identifies a launch even when a pool slot is recycled
// without an intervening draw, at the same distance and angle.
export function projectileVisualPosition(state,pellet,muzzle){
 if(!pellet.active){state.launch=null;return state;}
 if(state.launch!==pellet.hitIds){
  state.launch=pellet.hitIds;state.startDistance=pellet.distance;
  state.anchorX=muzzle.x;state.anchorY=muzzle.y;
  state.dx=muzzle.x-pellet.x;state.dy=muzzle.y-pellet.y;
  // Smooth convergence to the unchanged hit path, without moving backwards.
  state.blendDistance=Math.max(64,2*Math.hypot(state.dx,state.dy));
 }
 const t=Math.min(1,Math.max(0,(pellet.distance-state.startDistance)/state.blendDistance));
 const weight=1-t*t*(3-2*t);
 state.x=pellet.x+state.dx*weight;state.y=pellet.y+state.dy*weight;
 return state;
}
