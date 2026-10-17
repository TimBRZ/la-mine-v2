// Enemy tuning is independent from the T2, perks, room budgets and boss.
export const RAT = Object.freeze({ health: 22, radius: 10, speed: 118, telegraph: .7, contactDamage: .5 });
export const MINER = Object.freeze({ health: 90, radius: 20, speed: 46, telegraph: .7, contactDamage: 1.5 });
export const DRILL = Object.freeze({ health: 48, radius: 16, speed: 54, telegraph: .7, contactDamage: .5,
  minDistance: 125, maxDistance: 155, attackRange: 230, warningSeconds: .9, recoverySeconds: .6, cooldownSeconds: 2.4 });
export const DRILL_BOLT = Object.freeze({ speed: 145, radius: 6, damage: 1, range: 420, capacity: 8 });
