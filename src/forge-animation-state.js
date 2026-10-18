import {projectileAnimationReleased,isPureProjectile} from './projectile-attacks.js';
// Read-only view of the authoritative combat. Animation never starts a danger.
import {mobileFacing} from './enemy-facing.js';
import {faceRiveterShot} from './riveter-muzzle.js';
const clamp=n=>Math.max(0,Math.min(.9999,Number.isFinite(n)?n:0));
export function forgePose(e,context,moving,a){
 const plan=e.plan;
 if(e.dead)return {state:'death'};
 if(e.dungeonRecovery)return {state:a.ultimate?'ultimate_recovery':'recovery',progress:1-e.phaseTime/(a.recoveryDuration||1)};
 if(!plan){
  if(e.phase==='warning'&&!isPureProjectile(e))return {state:'prepare',progress:1-e.phaseTime/a.warning};
  if(e.phase==='charge')return {state:e.forgeType==='scorifier'?'charge':'attack'};
  if(a.release>0)return {state:'attack',progress:1-a.release/.26};
  if(e.phase==='recovery')return {state:'recovery',progress:(e.recoveryElapsed||0)/(e.forgeType==='scorifier'?.7:1)};
  return {state:moving?(e.pressureMode==='PRESSURE_APPROACH'||e.pressureBoss?'pressure':'move'):'idle'};
 }
 // Actual admitted hazards, not the planned timestamps: safety can postpone admission.
 const owned=(context?.ground?.items||[]).filter(h=>h.owner===e.id&&h.attackToken===plan.token&&!h.cooling);
 const active=owned.filter(h=>h.active).sort((x,y)=>x.elapsed-y.elapsed)[0];
 const warning=owned.filter(h=>!h.active).sort((x,y)=>x.warning-y.warning)[0];
 let state='hold',progress,order=active?.order??warning?.order??plan.index;
 if(e.bossId==='hammer'){
  const strike=owned.filter(h=>h.active&&h.shape!=='wave').sort((x,y)=>x.elapsed-y.elapsed)[0];
  const mark=owned.filter(h=>!h.active&&h.shape!=='wave').sort((x,y)=>x.warning-y.warning)[0];
  if(strike){state='impact';progress=strike.elapsed/Math.max(.01,strike.duration);order=strike.order;}
  else if(mark){state=plan.ultimate?'ultimate_prepare':'prepare';progress=1-mark.warning/mark.warningTotal;order=mark.order;
   if(mark.warning<.09){state='attack';progress=1-mark.warning/.09;}
  }
  else if(a.strikeAge<.45){state='rebound';progress=a.strikeAge/.45;}
  if(moving&&state==='prepare')state='move_prepare';
 }else if(active){
  state=e.bossId==='boiler'?(active.shape==='wave'?'wave':'purge'):
    plan.id==='furnaceCone'||active.shape==='cone'?'cone':plan.id==='furnaceTurn'?'rotor':plan.id==='whiteMarch'?'march':'attack';
  progress=active.elapsed/Math.max(.01,active.duration);
  if(moving)state=state==='rotor'?'move_rotor':state==='march'?'march':'move_attack';
 }else if(warning){
  state=moving?'move_prepare':plan.ultimate?'ultimate_prepare':e.bossId==='boiler'?'pressurize':'prepare';
  progress=1-warning.warning/warning.warningTotal;
 }else if(moving)state='move_prepare';
 // No idle interruption between repeated strokes, casts, combo steps or ultimates.
 return {state,progress,order};
}
export function advanceForgeAnimation(s,a,e,dt=0,reduced=false,context){
 const delta=Number.isFinite(dt)?Math.max(0,Math.min(dt,.1)):0,dx=e.x-a.x,dy=e.y-a.y;
 const moving=Math.hypot(dx,dy)>.025;
 let angle=e.chargeAngle??e.attackAngle??e.angle??a.angle;
 if(e.phase==='positioning'&&moving)angle=Math.atan2(dy,dx);
 if(['stoker','riveter','scorifier'].includes(s.id))mobileFacing(a,e,dx,dy,moving);
 else if(Math.abs(Math.cos(angle))>.18)a.facing=Math.cos(angle)<0;
 a.angle=angle;a.x=e.x;a.y=e.y;a.walkClock=(a.walkClock||0)+(moving?delta:0);
 if(e.phase==='warning'&&a.phase!=='warning')a.warning=Math.max(.001,e.phaseTime||1);
 if(e.plan){a.ultimate=e.plan.ultimate;a.recoveryDuration=e.plan.recovery;}
 const released=projectileAnimationReleased(a,e);
 if(s.id==='riveter')faceRiveterShot(a,e,released);
 a.release=released||a.phase==='warning'&&e.phase==='recovery'&&!e.dungeonRecovery?.26:Math.max(0,(a.release||0)-delta);
 a.strikeAge=(a.strikeAge??99)+delta;
 const selected=forgePose(e,context,moving,a);let next=selected.state;
 if(next==='impact')a.strikeAge=0;
 if(!e.dead&&e.flash>0&&e.flash>(a.flash||0)&&!e.plan&&!['warning','charge'].includes(e.phase))a.hitLeft=.12;else a.hitLeft=Math.max(0,(a.hitLeft||0)-delta);
 if(a.hitLeft>0&&!e.dead)next='hit';
 if(!s.clips[next])next=next==='pressure'?'move':'idle';
 const token=e.plan?e.plan.token+':'+selected.order:e.phase;
 if(a.state!==next||a.token!==token){a.state=next;a.elapsed=0;a.token=token;}else a.elapsed+=delta;
 const c=s.clips[next],walking=['move','pressure','move_prepare','move_attack','move_rotor','march','charge'].includes(next);
 let offset=c.loop?Math.floor((walking?a.walkClock:a.elapsed)*c.fps)%c.count:selected.progress!==undefined&&next!=='hit'?Math.floor(clamp(selected.progress)*c.count):Math.min(c.count-1,Math.floor(a.elapsed*c.fps));
 if(reduced)offset=next==='death'?c.count-1:0;
 a.frame=c.first+offset;a.finished=next==='death'&&a.elapsed>=c.count/c.fps;a.phase=e.phase;a.flash=e.flash||0;
 return {frame:a.frame,flip:!!a.facing,rotation:0};
}
