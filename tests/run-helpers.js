import { UpgradeFlow } from '../src/upgrades.js';

export function collectFixtureLoot(run) {
  for (let i = 0; i < 150 && run.wavePhase === 'collecting'; i++) run.update(.04);
  if (run.wavePhase === 'collecting') throw Error('Collection did not finish');
}
export function finishFixtureRoom(run) {
  run.spawned = run.wave.total; run.enemies = [];
  run.update(0);
  collectFixtureLoot(run);
}
export function enterFixtureRoom(run, number) {
  while (run.waveNumber < number) {
    finishFixtureRoom(run);
    if (run.choicePending) {
      const flow = new UpgradeFlow(run, () => .3); flow.afterCombat(); flow.choose(flow.offered[0].id);
    }
    run.update(0);
    for (let i = 0; i < 100 && run.wavePhase === 'preparing'; i++) run.update(.04);
  }
}

// V0.14: react to visible danger lanes and the denser mixed waves.
export { tacticalPilot as steer } from './tactical-pilot.js';
