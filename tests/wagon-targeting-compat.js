// Historical snapshots exclude only the explicitly authorized wagon spawn policy.
// Every other byte remains protected; the new policy has separate behavior tests.
export function withoutWagonTargeting(file,source) {
  const buffer=Buffer.isBuffer(source);let s=String(source);
  if(file==='enemies/wagon.js')s=s.replace('export const WAGON_SPAWN_CLEARANCE=140;\n','').replace(/\n\/\/ Only rank safe, authorized rail endpoints supplied by the spawn pipeline\.\n\/\/ Stable ties preserve its side\/occupancy policy\. The constructor locks this rail\.\nexport function chooseWagonRail\(points,player\) \{\n  return points\.reduce\(\(best,point\)=>!best\|\|Math\.abs\(point\[1\]-player\.y\)<Math\.abs\(best\[1\]-player\.y\)\?point:best,undefined\);\n\}\n/,'');
  if(file==='enemies/registry.js')s=s.replace(', chooseWagonRail, WAGON_SPAWN_CLEARANCE','').replace(',selectSpawn:chooseWagonRail,minSpawnDistance:WAGON_SPAWN_CLEARANCE','');
  if(file==='run.js')s=s.replace('(ENEMY_TYPES[kind].minSpawnDistance || 180)','180').replace('ENEMY_TYPES[kind].selectSpawn ? ENEMY_TYPES[kind].selectSpawn(free,this.player) : free[0]','free[0]');
  if(file==='rail-boss-encounter.js')s=s.replace(', chooseWagonRail, WAGON_SPAWN_CLEARANCE','').replace('const safe=WAGON_SPAWNS.filter','const point=WAGON_SPAWNS.find').replace('>WAGON_SPAWN_CLEARANCE&&','>180&&').replace('  const point=chooseWagonRail(safe,run.player);\n','');
  return buffer?Buffer.from(s):s;
}
