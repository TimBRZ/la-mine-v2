import { WORLD } from './world.js';
export const WAVES = WORLD.waves;


export const ARENA = Object.freeze({id:'galleries',name:'LES GALERIES',color:0x263438,accent:0x91b09a});
export const WAVE_READY_SECONDS = .6;
export const BOSS_INTRO_SECONDS = 2.2;
export function waveProgress(run) {
  return (run.world || WORLD).waves.map((wave, index) => ({
    number: index + 1,
    boss: Boolean(wave.boss),
    final: Boolean(wave.final),
    state: index < run.completedWaves ? 'done' : index === run.waveIndex ? 'active' : 'future',
  }));
}
