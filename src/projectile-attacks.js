import {RIFT_PATTERNS} from './rift/config.js';
import {DEPTHS_PATTERNS} from './depths/config.js';
import {FORGE_PATTERNS} from './forge/config.js';

// Classify moving shots, not labels or major-pressure budgets. Composite hazards
// (orb detonation, planted charges, boss sequences) keep their own warning clocks.
export function isPureProjectile(e,pattern=e.pattern){
 if(e.bossSequence||e.plan)return false;
 const spec=e.forgeType?FORGE_PATTERNS[pattern]:e.depthsType?DEPTHS_PATTERNS[pattern]:e.riftType?RIFT_PATTERNS[pattern]:null;
 if(spec)return !!spec.count&&!spec.ground&&!spec.seconds;
 if(e.shaftType)return ['steam','energy','radial'].includes(pattern);
 if(e.kind==='drill'||e.kind==='draisine')return true;
 return e.bossId==='crachefer'||e.bossId==='switchman'&&pattern==='burst';
}

// Admission only: retain the ready attack while bodies touch. The muzzle and
// projectile geometry stay unchanged; no new cooldown or hidden preparation.
// The bound covers every direction of a fan/radial, including an orb's radius.
export function projectileMuzzleClear(e,p,radius=6){
 return Math.hypot(p.x-e.x,p.y-e.y)>e.radius+(p.radius||0)+2*radius+2;
}

// Presentation signal emitted only after a real pool allocation. Weak ownership
// leaves the simulation entities and save data untouched.
const emissions=new WeakMap();
export function noteProjectileEmission(owner){emissions.set(owner,(emissions.get(owner)||0)+1);}
export function projectileAnimationReleased(animation,owner){
 const serial=emissions.get(owner)||0;
 if(!serial||serial===animation.projectileSerial)return false;
 animation.projectileSerial=serial;return true;
}
