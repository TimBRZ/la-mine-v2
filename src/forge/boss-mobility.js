import {approachCorridor,corridorLimit} from './boss-pressure.js';
export const ATTACK_STATIC='ATTACK_STATIC',ATTACK_MOBILE='ATTACK_MOBILE',ATTACK_LOCKED_DIRECTION='ATTACK_LOCKED_DIRECTION';
// Windows use the attack clock, not the player position. Delayed admissions pause it.
const profiles={
 sectors:[ATTACK_MOBILE,.4,150],furnaceCone:[ATTACK_LOCKED_DIRECTION,.35,80],
 furnaceTurn:[ATTACK_MOBILE,.35,140],whiteMarch:[ATTACK_MOBILE,.45,150],
 doubleBeat:[ATTACK_MOBILE,.35,16,1.55,2.05],forgeRhythm:[ATTACK_MOBILE,.35,12,1.42,1.85],
 counterStroke:[ATTACK_LOCKED_DIRECTION,.35,12,1.55,1.9],
 sideValves:[ATTACK_LOCKED_DIRECTION,.55,140],rotatingPurge:[ATTACK_MOBILE,.35,140],
 groundPressure:[ATTACK_MOBILE,.6,130],pressureWave:[ATTACK_LOCKED_DIRECTION,.4,35,0,.9],
};
export function mobilityProfile(plan,bossId){
 if(plan.ultimate)return {category:ATTACK_STATIC,speed:0,limit:0,from:0,to:0};
 let p=profiles[plan.id];
 if(plan.combo||plan.attackClass==='LIGHT')p=bossId==='hammer'?[ATTACK_LOCKED_DIRECTION,.35,65,0,plan.events[0].at>0?plan.events[0].at-.05:plan.events[0].warning-.1]:[ATTACK_LOCKED_DIRECTION,bossId==='boiler'?.55:.4,190];
 const [category=ATTACK_STATIC,speed=0,limit=0,from=0,to=Infinity]=p||[];
 // Phase II hammer's second/final impacts happen earlier; retain their anchors.
 return {category,speed,limit,from,to:plan.id==='doubleBeat'?Math.min(to,plan.events[1].at+plan.events[1].warning-.05):plan.id==='forgeRhythm'&&plan.late?1.7:to};
}
export function prepareBossMobility(e,plan,p,others=[]){
 const profile=mobilityProfile(plan,e.bossId),v=approachCorridor(e,p,profile.limit,others);
 const limit=corridorLimit(e,v,Math.min(profile.limit,v.limit),others);
 const windows=plan.id==='forgeRhythm'?[[profile.from,profile.to],[plan.events[1].at+plan.events[1].warning+.24,plan.events[2].at+plan.events[2].warning-.05]]:null;
 plan.mobility={...profile,limit:windows?corridorLimit(e,v,Math.min(v.limit,30),others):limit,windows,startX:e.x,startY:e.y,vx:v.vx,vy:v.vy,closing:v.closing,rate:e.spec.speed*profile.speed};
}
export function travel(m,t){
 if(!m?.limit||!m.rate)return 0;
 const elapsed=m.windows?m.windows.reduce((s,[a,b])=>s+Math.max(0,Math.min(t,b)-a),0):Math.max(0,Math.min(t,m.to)-m.from);
 // Constant, bounded translation to a frozen destination. No late steering.
 return Math.min(m.limit,m.rate*elapsed);
}
export function moveBossAttack(e,plan,t){
 const m=plan.mobility,d=travel(m,t);if(!m)return;
 e.x=m.startX+m.vx*d;e.y=m.startY+m.vy*d;
}
export function driftingHazard(h,plan){
 if(!['furnaceTurn','rotatingPurge','furnaceCone','sideValves'].includes(plan.id))return h;
 return {...h,drift:{...plan.mobility},driftTime:plan.time};
}
