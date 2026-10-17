import {EPIC_UPGRADES} from './epic-upgrades.js';
// Passive observer: never writes to Run or changes random draws/combat timing.
export class ContractTracker {
 constructor(){this.lastWave=0;this.choices=0;this.epic=false;this.finished=false;this.killed=new Set();}
 observe(run,events=[],bossIds=[]) {
  const activity={};
  if(run.waveNumber>this.lastWave){activity.wave=run.waveNumber;if(this.lastWave<20&&run.waveNumber===20)activity.wave20=1;this.lastWave=run.waveNumber;}
  for(const e of events){
   if(e.type==='kill'&&!this.killed.has(e.id)){this.killed.add(e.id);activity.kills=(activity.kills||0)+1;if(bossIds.includes(e.id))activity.bosses=(activity.bosses||0)+1;}
   if(e.type==='explosion')activity.grisou=(activity.grisou||0)+1;
   if(e.type==='loot-collected'&&['coal','iron'].includes(e.resource))activity[e.resource]=(activity[e.resource]||0)+e.amount;
  }
  const choices=Object.values(run.upgradeRanks).reduce((a,b)=>a+b,0),epic=EPIC_UPGRADES.some(p=>run.upgradeRanks[p.id]>0);
  if(choices>this.choices)activity.choices=choices-this.choices;this.choices=choices;
  if(epic&&!this.epic)activity.epic=1;this.epic=epic;
  if(!this.finished&&['won','lost'].includes(run.status)) {
   this.finished=true;
   if(run.elapsed>=60&&run.completedWaves>=1)activity.weaponRun=run.weapon.definition.id;
   if(run.status==='won'&&run.completedWaves===20){activity.wins=1;activity.wonWeapon=run.weapon.definition.id;if(run.world.id==='rift')activity.riftWin=1;}
  }
  return activity;
 }
}
