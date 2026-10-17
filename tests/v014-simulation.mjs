import { Run } from './legacy-volley-run.js';
import { UpgradeFlow, UPGRADES } from './v021-final-src-snapshot/upgrades.js';
import { EPIC_UPGRADES } from './v021-final-src-snapshot/epic-upgrades.js';
import { tacticalPilot as steer } from './tactical-pilot.js';
export const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
export const preferred=['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn'];
export function simulate({weaponId='shotgun',seed=1,camp=false,levels={},boss=0,encounter=0,maxSeconds=900,priority=preferred,pilot=steer,buildOverride}={}) {
  const rng=seeded(seed),run=new Run(rng,levels,{weaponId,rewardRandom:()=>.99}),flow=new UpgradeFlow(run,rng);
  const choose=()=>flow.choose(priority.find(id=>flow.offered.some(p=>p.id===id)));
  const startWave=boss||encounter;
  if(startWave) {
    const build=buildOverride||(weaponId==='shotgun'?['trigger','buckshot','trigger','boots','double','double-cannon']:['trigger','piercing','trigger','boots','plates','total-piercing']);
    const count=startWave<=9?2:startWave<=14?3:startWave<=18?4:startWave===19?5:6;
    for(const id of build.slice(0,count)){[...UPGRADES,...EPIC_UPGRADES].find(p=>p.id===id).apply(run);run.upgradeRanks[id]=(run.upgradeRanks[id]||0)+1;}
    run.waveIndex=startWave-2;run.wavePhase='cleared';run.enterNextWave();
  } else {flow.open();choose();}
  let moves=0,shots=0,badShots=0,frames=0,maxAlive=0,maxBolts=0,maxDrops=0;
  const bosses=[],waves=[];let wave=0,start=0,startHP=5,combatStart=null,patterns=0;
  for(;frames<maxSeconds*60&&run.status==='playing';frames++) {
    if(run.waveNumber!==wave){wave=run.waveNumber;start=run.elapsed;startHP=run.player.hp;combatStart=null;patterns=0;}
    if(run.wavePhase==='combat'&&combatStart===null)combatStart=run.elapsed;
    const phases=run.enemies.map(e=>e.phase);
    const input=camp?{x:0,y:0}:pilot(run),events=run.update(1/60,input);
    for(let i=0;i<run.enemies.length;i++)if(run.enemies[i].phase==='warning'&&phases[i]!=='warning')patterns++;
    moves+=Number(Boolean(input.x||input.y));shots+=events.filter(e=>e.type==='shot').length;
    if(input.x||input.y)badShots+=events.filter(e=>e.type==='shot').length;
    maxAlive=Math.max(maxAlive,run.enemies.length);maxBolts=Math.max(maxBolts,run.hostileProjectiles.pool.filter(p=>p.active).length);maxDrops=Math.max(maxDrops,run.loot.activeCount);
    if(events.some(e=>e.type==='wave-loot')) {
      const record={wave,combatSeconds:run.elapsed-combatStart,totalSeconds:run.elapsed-start,hpLost:startHP-run.player.hp,patterns};
      waves.push(record);if(run.wave.boss)bosses.push(record);
      if(startWave)break;
    }
    if(flow.afterCombat())choose();
  }
  return {weaponId,seed,camp,levels,isolatedBoss:boss,isolatedWave:encounter,status:startWave&&run.wavePhase==='collecting'?'won':run.status,wave:run.waveNumber,kills:run.kills,seconds:run.elapsed,hp:run.player.hp,perks:run.upgradeRanks,bosses,waves,moveRatio:moves/(frames||1),shots,badShots,maxAlive,maxBolts,maxDrops,rewards:run.collectedRewards};
}
