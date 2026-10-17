// QA only: skip reserved boss slots, without kills, rewards, healing or victory.
export function skipReservedBoss(run) {
  if(run.wavePhase!=='cleared'||run.choicePending||run.paused)return false;
  if(run.waveNumber===19)return true;
  if(run.world.waves[run.waveIndex+1]?.boss){run.waveIndex++;run.enterNextWave();}
  return false;
}
