import { PLAYER } from './config.js';

export const PERMANENT_UPGRADES = Object.freeze([
  { id: 'power', name: 'Puissance', description: '+5 % dégâts de base / niveau' },
  { id: 'health', name: 'Robustesse', description: '+5 % PV maximum / niveau' },
  { id: 'mechanics', name: 'Mécanique', description: '−5 % délai de tir / niveau' },
  { id: 'mobility', name: 'Mobilité', description: '+5 % vitesse / niveau' },
]);
export const MAX_LEVEL = 5;
export const emptyLevels = () => Object.fromEntries(PERMANENT_UPGRADES.map(({ id }) => [id, 0]));
const COSTS = [
  { coal: 30, iron: 0, diamond: 0, token: 0 },
  { coal: 60, iron: 0, diamond: 0, token: 0 },
  { coal: 100, iron: 6, diamond: 0, token: 0 },
  { coal: 150, iron: 12, diamond: 0, token: 0 },
  { coal: 220, iron: 20, diamond: 1, token: 0 },
];
export function upgradeCost(level) {
  return Number.isInteger(level) && level >= 0 && level < MAX_LEVEL ? { ...COSTS[level] } : null;
}
// Called once by the Run constructor. Perks then operate on these base stats.
export function applyPermanentStats(run, levels = {}) {
  const rank = id => Math.max(0, Math.min(MAX_LEVEL, Math.trunc(levels[id]) || 0));
  run.player.maxHealth = PLAYER.health * (1 + .05 * rank('health'));
  run.player.hp = run.player.maxHealth;
  run.player.speed = PLAYER.speed * (1 + .05 * rank('mobility'));
  run.weapon.interval = run.weapon.definition.cooldown * (1 - .05 * rank('mechanics'));
  run.projectiles.damageMultiplier = 1 + .05 * rank('power');
}
