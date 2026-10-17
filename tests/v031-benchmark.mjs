import {writeFile} from 'node:fs/promises';
const phase=process.argv[2]||'after',root=phase==='before'?'./v031-before-src/':'../src/';
const {Run}=await import(root+'run.js'),{UPGRADES}=await import(root+'upgrades.js'),{EPIC_UPGRADES}=await import(root+'epic-upgrades.js'),{Enemy}=await import(root+'enemy.js'),{WEAPONS}=await import(root+'weapons.js'),{pelletDamage}=await import(root+'combat.js');
export const BUILDS={shotgun:{medium:['buckshot','trigger','plates'],strong:['buckshot','buckshot','trigger','trigger','double','double-cannon']},smg:{medium:['heat','trigger','plates'],strong:['heat','trigger','trigger','magazine','plates','critical-heat']},grisoux:{medium:['conduit','rapid-coil','plates'],strong:['conduit','reinforced-conduit','rapid-coil','trigger','plates','double-cannon']}};
const scenarios=[{id:'A-close',distance:60,hp:500,radius:18},{id:'B-medium',distance:150,hp:500,radius:18},{id:'C-three-aligned',distance:60,hp:120,radius:18,count:3},{id:'D-boss',distance:150,hp:1800,radius:28,boss:true},{id:'E-boss-medium-build',distance:150,hp:1800,radius:28,boss:true,build:'medium'},{id:'F-boss-strong-build',distance:150,hp:1800,radius:28,boss:true,build:'strong'},{id:'G-close-boss',distance:60,hp:1800,radius:28,boss:true},{id:'H-range230',distance:230,hp:500,radius:18}];
BUILDS.grisoux.arc=['conduit','reinforced-conduit','capacitor','energy-overload','energy-arc','double-cannon'];
scenarios.push({id:'I-group-strong-build',distance:60,hp:120,radius:18,count:3,build:'strong'});
function measure(weaponId,s,infinite=false){const r=new Run(()=>.99,{}, {weaponId}),p=r.player;p.x=70;p.y=390;p.angle=0;let seed=12;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(const id of BUILDS[weaponId][s.build]||[])[...UPGRADES,...EPIC_UPGRADES].find(v=>v.id===id).apply(r);
 const enemies=Array.from({length:s.count||1},(_,i)=>{const e=new Enemy(i+1,p.x+s.distance+i*50,p.y,{health:infinite?1e8:s.hp,radius:s.radius,speed:0,telegraph:0});e.kind=s.boss?'boss':'dummy';return e;});
 const start=enemies.reduce((n,e)=>n+e.hp,0);let seconds=0,shots=0,hits=0;
 for(let i=0;i<(infinite?30:120)*240&&enemies.some(e=>e.alive);i++){const events=[];r.weapon.update(1/240,p,enemies,r.projectiles,events,rng,true);r.projectiles.update(1/240,enemies,events,p);seconds+=1/240;shots+=events.filter(e=>e.type==='shot').length;hits+=events.filter(e=>e.type==='hit'||e.type==='kill').length;}
 const damage=start-enemies.reduce((n,e)=>n+e.hp,0);return {seconds,ttk:enemies.some(e=>e.alive)?null:seconds,dps:damage/seconds,damage,shots,hits};
}
const rows=[];for(const weaponId of Object.keys(WEAPONS))for(const s of scenarios)rows.push({weaponId,scenario:s.id,distance:s.distance,build:s.build||'none',perks:BUILDS[weaponId][s.build]||[],...measure(weaponId,s),sustained30:measure(weaponId,s,true).dps});
const arcScenario={distance:60,hp:120,radius:18,count:3,build:'arc'};rows.push({weaponId:'grisoux',scenario:'J-group-arc-overload',perks:BUILDS.grisoux.arc,...measure('grisoux',arcScenario),sustained30:measure('grisoux',arcScenario,true).dps});
const definitions=Object.values(WEAPONS).map(d=>({id:d.id,damage:d.damage,pellets:d.pellets,interval:d.cooldown,range:d.range,spreadRadians:d.spread,idealPointBlankDps:d.damage*d.pellets/d.cooldown,travelSamples:[0,20,45,70,100,140,170,192].map(distance=>({distance,damage:pelletDamage(distance,d)}))}));
await writeFile(new URL('v031-'+phase+'-benchmark.json',import.meta.url),JSON.stringify({phase,definitions,rows},null,2));console.log(JSON.stringify({phase,definitions,rows},null,2));
