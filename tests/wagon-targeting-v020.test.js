import {V021_FILES} from './v021-authorized-files.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Run} from '../src/run.js';
import {chooseWagonRail,WAGON_SPAWNS,WAGON_SPAWN_CLEARANCE} from '../src/enemies/wagon.js';
import {WAGON} from '../src/enemies/rail-stats.js';
import {summonRailWagon} from '../src/rail-boss-encounter.js';
import {createEnemy} from '../src/enemies/registry.js';
import {withoutWagonTargeting} from './wagon-targeting-compat.js';
const world={id:'wagon-target-test',choices:[],waves:[{total:1,maxAlive:12,group:1,interval:.5,enemies:['wagon'],spawns:WAGON_SPAWNS}]};
function setup(x=225,y=310) {
  const r=new Run(()=>.5,{}, {world});r.player.x=x;r.player.y=y;r.weapon.cooldown=999;return r;
}
test('wagon selects the nearest authorized rail across the arena, including the exact center',()=>{
  for(const x of [40,100,225,350,410])for(const y of [150,190,250,310,380,450,520,580,640]) {
    const r=setup(x,y);assert.equal(r.spawn(),true);const w=r.enemies[0];
    assert.equal(Math.abs(w.y-y),Math.min(...WAGON_SPAWNS.map(p=>Math.abs(p[1]-y))));
    assert.ok(WAGON_SPAWNS.some(p=>p[0]===w.x&&p[1]===w.y));
    assert.ok(Math.hypot(w.x-x,w.y-y)>WAGON_SPAWN_CLEARANCE);
    assert.equal(w.radius,WAGON.radius);
  }
});
test('rail ranking keeps stable ties, accepts no unsafe fallback and never mutates its candidates',()=>{
  const points=Object.freeze([Object.freeze([46,190]),Object.freeze([404,310])]);
  assert.equal(chooseWagonRail(points,{y:250}),points[0]);
  assert.equal(chooseWagonRail([],{y:250}),undefined);
});
test('blocked nearest rail falls back to the nearest free rail; all blocked endpoints defer spawning',()=>{
  const r=setup();r.enemies=WAGON_SPAWNS.filter(p=>p[1]===310).map(([x,y],i)=>createEnemy('miner',i+50,x,y));
  assert.equal(r.spawn(),true);assert.equal(r.enemies.at(-1).y,190);
  const blocked=setup();blocked.enemies=WAGON_SPAWNS.map(([x,y],i)=>createEnemy('miner',i+50,x,y));
  assert.equal(blocked.spawn(),false);assert.equal(blocked.spawned,0);
});
test('selection samples the current player position anew for each wagon, then locks before warning',()=>{
  for(const y of [190,450,580]) {
    const r=setup(225,y);assert.equal(r.spawn(),true);const w=r.enemies[0];
    const locked={x:w.x,y:w.y,endX:w.endX,angle:w.chargeAngle};
    r.player.y=y===580?190:580;
    for(let i=0;i<90;i++)w.update(1/60,r.player);
    assert.equal(w.phase,'warning');assert.equal(w.x,locked.x);assert.equal(w.y,locked.y);
    assert.equal(w.endX,locked.endX);assert.equal(w.chargeAngle,locked.angle);
  }
});
test('a charging wagon never steers after the player changes rails and finishes harmlessly',()=>{
  const r=setup();r.spawn();const w=r.enemies[0],start=w.x,y=w.y,angle=w.chargeAngle;
  for(let i=0;i<240;i++) {
    r.player.x=i%2?70:370;r.player.y=i%2?150:630;w.update(1/60,r.player);
    assert.equal(w.y,y);assert.equal(w.chargeAngle,angle);
    assert.ok((w.x-start)*Math.cos(angle)>=0);
  }
  assert.equal(w.phase,'stopped');assert.equal(w.x,w.endX);assert.equal(w.contactDamage,0);
});
test('targeted rail hits a stationary player but allows a delayed mobile dodge after the warning',()=>{
  for(const dodge of [false,true]) {
    const r=setup();r.spawn();const w=r.enemies[0],start=w.x;
    for(let i=0;i<240;i++) {
      r.update(1/60,{x:0,y:dodge&&i>=70&&i<100?1:0});
      if(i<100)assert.equal(w.x,start,'no instantaneous charge');
    }
    assert.equal(r.player.hp,dodge?5:4);
  }
});
test('boss-invoked wagons use the same threatening safe rail with the V0.23 two-Wagon limit',()=>{
  const r=setup(225,580),owner={id:80,alive:true,x:100,y:200,radius:26};r.enemies=[owner];
  assert.equal(summonRailWagon(r,owner),true);const w=r.enemies[1];
  assert.equal(w.y,580);assert.ok(Math.hypot(w.x-225,w.y-580)>140);
  assert.equal(w.summoner,80);assert.equal(w.phase,'warning');assert.equal(w.phaseTime,1.1);
  assert.equal(summonRailWagon(r,owner),true);assert.equal(summonRailWagon(r,owner),false);
});
test('validated visuals, hitboxes, other enemies and economy are unchanged; edits are only wagon spawn selection',async()=>{
  const hashes=JSON.parse(await readFile(new URL('./v020-before-wagon-targeting.json',import.meta.url),'utf8'));
  const changed=['run.js','enemies/registry.js','enemies/wagon.js','rail-boss-encounter.js'];
  for(const [file,hash] of Object.entries(hashes).filter(([file])=>!V021_FILES.includes(file))) {
    const current=await readFile(new URL('../src/'+file,import.meta.url));
    if(changed.includes(file))assert.deepEqual(withoutWagonTargeting(file,current),await readFile(new URL('./v020-before-wagon-targeting/src/'+file,import.meta.url)),file);
    else assert.equal(createHash('sha256').update(current).digest('hex'),hash,file);
  }
});
