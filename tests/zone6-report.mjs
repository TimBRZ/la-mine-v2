import fs from 'node:fs';
const files=['zone6-simulations.json','zone6-atelier5-simulations.json'];
const result=files.map(file=>{
 const runs=JSON.parse(fs.readFileSync(new URL(file,import.meta.url)));
 const mean=(a,f)=>a.length?a.reduce((s,r)=>s+f(r),0)/a.length:null;
 return {file,arms:['shotgun','smg','grisoux'].map(weaponId=>{
  const all=runs.filter(r=>r.weaponId===weaponId),won=all.filter(r=>r.status==='won');
  return {weaponId,rank:all[0].rank,victories:won.length,attempts:all.length,
   meanAttemptSeconds:mean(all,r=>r.seconds),meanVictorySeconds:mean(won,r=>r.seconds),
   meanDamage:mean(all,r=>r.damageTaken),
   meanHazards:mean(all,r=>Object.values(r.waves).reduce((s,w)=>s+w.hazardSeconds,0)/Object.values(r.waves).reduce((s,w)=>s+w.combatSeconds,0)),
   bossesCompleted:Object.fromEntries([5,10,15,20].map(n=>[n,mean(all.filter(r=>r.wave>n||r.status==='won'),r=>r.bosses[n])])),
   noColdRoute:all.reduce((s,r)=>s+r.noColdRoute,0),minimumColdFraction:Math.min(...all.map(r=>r.minColdFraction)),
   maximums:Object.fromEntries(['bolts','ground','heat','majors'].map(k=>[k,Math.max(...all.map(r=>r.caps[k]))]))};
 })};
});
fs.writeFileSync(new URL('zone6-summary.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
