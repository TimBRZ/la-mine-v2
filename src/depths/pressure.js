// Zone 5 only. These modifiers never change damage, HP, wind-ups or locked leaps.
export const EXTINCTION_PRESSURE=Object.freeze({
 meleeSpeed:1.12,meleeRecoveryRate:1.12,rangedRestRate:1.12,
 prelude:.3,returnLight:.18,rockChance:.35,
 rockWarning:1.35,rockDuration:.4,rockRadius:34,
 normalInterval:12,advancedInterval:9.5,lateInterval:7.5,finalInterval:10,finalLateInterval:8.5,
 normalCooldown:9,advancedCooldown:8,lateCooldown:6.5,finalCooldown:8,finalLateCooldown:7,
 advancedRockChance:.5,finalLateRockChance:.5,
 blasterRecovery:1.15,blasterRest:.51,lampistAdvancedRate:1.12,
 bossRestRate:1.12,bossLateRestRate:1.32,
});
export const DEPTHS_LATE_CYCLES={
 lampmajor:['beam','fan','blackout','beam','light','beam'],
 dynamiter:['chain','ring','charges','chain','lob'],
 blackmass:['rush','slam','cracks','rush','slam','cracks','blackout'],
};
export function depthsRestRate(actor,run){
 if(!['positioning','recovery'].includes(actor.phase))return 1;
 if(actor.kind==='lampist'&&run?.waveNumber>=11&&run.waveNumber<=19)return EXTINCTION_PRESSURE.lampistAdvancedRate;
 if(actor.kind==='boss')return actor.hp<actor.maxHealth*.5?EXTINCTION_PRESSURE.bossLateRestRate:EXTINCTION_PRESSURE.bossRestRate;
 return 1;
}
export function extinctionModifiers(actor,active){
 return {
  speed:active&&actor.kind==='blackmaw'?EXTINCTION_PRESSURE.meleeSpeed:1,
  clock:active&&(actor.kind==='blackmaw'&&actor.phase==='recovery')?EXTINCTION_PRESSURE.meleeRecoveryRate:
   active&&actor.kind==='lampist'&&['positioning','recovery'].includes(actor.phase)?EXTINCTION_PRESSURE.rangedRestRate:1,
 };
}
