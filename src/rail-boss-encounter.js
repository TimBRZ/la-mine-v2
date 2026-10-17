import { MadWagon, WAGON_SPAWNS, chooseWagonRail, WAGON_SPAWN_CLEARANCE } from './enemies/wagon.js';
// Summons never enlarge the fixed reward budget, and vanish with their owner.
export const BOSS_WAGON_LIMIT=2;
export function bossWagonSpawn(run) {
  if(run.enemies.filter(e=>e.alive&&e.summoner&&!e.retired).length>=BOSS_WAGON_LIMIT)return undefined;
  const safe=WAGON_SPAWNS.filter(([x,y])=>Math.hypot(x-run.player.x,y-run.player.y)>WAGON_SPAWN_CLEARANCE&&run.enemies.every(e=>!e.alive||e.retired||Math.hypot(x-e.x,y-e.y)>e.radius+30));
  return chooseWagonRail(safe,run.player);
}
export function summonRailWagon(run,owner) {
  if(!owner.alive)return false;
  const point=bossWagonSpawn(run);
  if(!point)return false;
  const wagon=new MadWagon(++run.nextEnemyId,...point);wagon.summoner=owner.id;
  run.enemies.push(wagon);return true;
}
export function retireBossWagons(run,dt) {
  for(const e of run.enemies)if(e.summoner&&e.phase==='stopped') {
    e.contactDamage=0;e.retireRemaining=Math.max(0,(e.retireRemaining??.6)-dt);
    if(e.retireRemaining===0)e.retired=true;
  }
}
