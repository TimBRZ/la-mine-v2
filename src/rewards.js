import { emptyWallet } from './resources.js';

// Shared V0.4 economy. Roll once per room, independently of combat RNG.
export function roomRewards(number, random = Math.random) {
  const rewards = emptyWallet();
  rewards.coal = [0, 10, 14, 18, 22, 30][number] || 0;
  if (number === 2 && random() < .25) rewards.iron = 1;
  if (number === 3 && random() < .6) rewards.iron = 2;
  if (number === 4) { rewards.iron = 3; if (random() < .05) rewards.diamond = 1; }
  if (number === 5) {
    rewards.iron = 5;
    if (random() < .12) rewards.diamond = 1;
    if (random() < .01) rewards.token = 1;
  }
  return rewards;
}

// Provisional room rewards. Only completed rooms count, including on defeat.
export function runRewards(run, random = Math.random) {
  const rewards = emptyWallet();
  if (!['won', 'lost'].includes(run.status)) return rewards;
  // Live V0.5 runs use the collected ledger: never reroll or credit a second time.
  if (run.collectedRewards) return { ...run.collectedRewards };
  // V0.4 summary compatibility (also used by the economy regression fixtures).
  const completed = Math.max(0, Math.min(run.status === 'won' ? 5 : 4, Math.trunc(run.completedWaves ?? run.completedRooms) || 0));
  for (let number = 1; number <= completed; number++) {
    const room = roomRewards(number, random);
    for (const id of Object.keys(rewards)) rewards[id] += room[id];
  }
  return rewards;
}
