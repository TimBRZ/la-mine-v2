// V0.22: health and idle/recovery pressure only. Warnings, charges and damage
// retain their durations; the final encounter keeps its staggered opening.
export const BOSS_TUNING=Object.freeze({
  haveuse:Object.freeze({health:1.35,activity:.78,enrage:.78}),
  crachefer:Object.freeze({health:1.30,activity:.72,enrage:.78}),
  effondreur:Object.freeze({health:1.25,activity:.75,enrage:.78}),
  stationmaster:Object.freeze({health:1.30,activity:.78,enrage:.82}),
  locomotive:Object.freeze({health:1.25,activity:.78,enrage:.82}),
  switchman:Object.freeze({health:1.30,activity:.75,enrage:.82}),
});
export const bossHealth=(id,base)=>Math.round(base*BOSS_TUNING[id].health);
export function bossActivityScale(boss) {
  const rule=BOSS_TUNING[boss.bossId||'haveuse'];
  return (boss.restScale||1)*rule.activity*(boss.hp<=boss.maxHealth*.5?rule.enrage:1);
}
