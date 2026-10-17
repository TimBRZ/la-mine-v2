import {bossHealth,bossActivityScale} from './boss-tuning.js';
// V0.14 encounter tuning. Telegraph lengths and damage stay readable; pressure
// changes recovery/positioning, never causes damage merely for standing still.
export const PRESSURE = Object.freeze([
  {campAfter:7,drillRate:1,campRate:1.1,lead:0,flank:0,ratHealth:.45,minerHealth:.45,drillHealth:.45},
  {campAfter:6,drillRate:1.15,campRate:1.45,lead:.15,flank:.28,ratHealth:.5,minerHealth:.85,drillHealth:.55},
  {campAfter:5.5,drillRate:1.25,campRate:1.6,lead:.2,flank:.38,ratHealth:.55,minerHealth:1,drillHealth:.65},
  {campAfter:5,drillRate:1.35,campRate:1.7,lead:.22,flank:.45,ratHealth:.6,minerHealth:1.1,drillHealth:.75},
].map(Object.freeze));

export const HAVEUSE_TUNING = Object.freeze({health:bossHealth('haveuse',900),radius:30,speed:60,
  chaseSeconds:1.7,warningSeconds:.9,chargeSeconds:.65,chargeSpeed:340,recoverySeconds:.7,
  damageTaken:.9,enrage:.8});
export const BOSS_SPECS = Object.freeze({
  haveuse:Object.freeze({...HAVEUSE_TUNING,name:'LA HAVEUSE',color:0xe6b65b}),
  crachefer:Object.freeze({name:'LE CRACHEFER',color:0xb8a0fa,health:bossHealth('crachefer',1320),speed:64,rest:1.2,
    warning:1.1,recovery:.75,lead:.22,damageTaken:.9,enrage:.8}),
  effondreur:Object.freeze({name:'L’EFFONDREUR',color:0xf28870,health:bossHealth('effondreur',1560),speed:42,rest:1.5,
    warning:1.35,zoneSeconds:1.4,zoneRadius:48,zoneCount:2,damageTaken:.9,enrage:.8}),
});
export const FINAL_BOSS = Object.freeze({healthScale:.8,restScale:1.15,openingRest:1.955,entryStagger:.65});

export function bossRestScale(boss) {
  return bossActivityScale(boss);
}

export function aimedPoint(player,seconds=0) {
  // Modest prediction, visible for the entire warning and never homing.
  const dx=(player.vx||0)*seconds,dy=(player.vy||0)*seconds;
  const scale=Math.min(1,40/(Math.hypot(dx,dy)||1));
  return {x:player.x+dx*scale,y:player.y+dy*scale};
}
