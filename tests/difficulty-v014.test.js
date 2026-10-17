import {V021_FILES} from './v021-authorized-files.js';
import { VISUAL_FILES } from './v019-visual-files.js';
import { preserveWorkshopHint } from './v017-protected-copy.js';
import { TALENT_FILES } from './v016-authorized-files.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Run } from '../src/run.js';
import { WORLD } from '../src/world.js';
import { PRESSURE, BOSS_SPECS, FINAL_BOSS, bossRestScale } from '../src/difficulty.js';
import { createEnemy } from '../src/enemies/registry.js';
import { createBoss } from '../src/bosses.js';
import { enterFixtureRoom } from './run-helpers.js';
import { simulate } from './v014-simulation.mjs';
import { Projectiles } from '../src/combat.js';
import { WEAPONS } from '../src/weapons.js';

test('protected V0.14 weapons, perks, economy, drops, menus and storage are byte-identical',async()=>{
  const baseline=JSON.parse(await readFile(new URL('./v014-protected-baseline.json',import.meta.url)));
  // V0.15 authorizes boss-only combat and a small Focus indicator.
  for(const [file,hash] of Object.entries(baseline).filter(([file])=>!V021_FILES.includes(file)).filter(([file])=>!VISUAL_FILES.includes(file)).filter(([file])=>!TALENT_FILES.includes(file)).filter(([file])=>!['weapon.js','combat.js','ui.js'].includes(file)))assert.equal(createHash('sha256').update(preserveWorkshopHint(file,await readFile(new URL('../src/'+file,import.meta.url)))).digest('hex'),hash,file);
});
test('immobility only influences enemy decisions: no enemy means no damage or hazard',()=>{
  const r=new Run();r.waveIndex=18;r.untilSpawn=9999;
  for(let i=0;i<1000;i++)r.update(.04);
  assert.ok(r.stillSeconds>30);assert.equal(r.player.hp,5);assert.equal(r.damageTaken,0);
  assert.equal(r.enemies.length,0);assert.ok(r.hostileProjectiles.pool.every(p=>!p.active));
  const still=r.stillSeconds;r.paused=true;r.update(.04);assert.equal(r.stillSeconds,still);
  r.paused=false;r.update(.04,{x:1,y:0});assert.equal(r.stillSeconds,0);
});
test('camping retains its reposition cooldown modifier with immediate drill shots',()=>{
  const counts=[];
  for(const stillSeconds of [0,10]) {
    const e=createEnemy('drill',1,225,200),p={x:225,y:350,vx:80,vy:0};e.warmup=0;
    const events=[];let releases=0;
    for(let i=0;i<1500;i++) {
      const count=events.length;e.update(.02,p,events,{tuning:PRESSURE[3],stillSeconds});
      if(events.length>count){releases++;assert.equal(e.phase,'recovery');assert.ok(Number.isFinite(events.at(-1).angle));}
    }
    counts.push(events.length);assert.equal(releases,events.length);assert.ok(releases>0);
  }
  assert.ok(counts[1]>counts[0],counts.join('/'));
});
test('rat flanks take opposite approach angles and still close on the player',()=>{
  const p={x:225,y:500};const rats=[createEnemy('rat',1,225,200),createEnemy('rat',2,225,200)];
  for(const e of rats){e.warmup=0;e.update(.04,p,[],{tuning:PRESSURE[3],stillSeconds:10});assert.ok(e.y>200);}
  assert.ok(rats[0].x<225&&rats[1].x>225);
});
test('stage one is unchanged while later groups, live caps and miner presence increase',()=>{
  assert.deepEqual(WORLD.waves.slice(0,4).map(w=>[w.total,w.maxAlive,w.group]),[[6,3,2],[8,4,2],[9,4,2],[10,5,2]]);
  for(const n of [6,11,16,19]) {
    const r=new Run();enterFixtureRoom(r,n);const old=n<10?5:n<15?7:n===19?11:9;
    assert.ok(r.wave.maxAlive>old);assert.ok(r.wave.group>=4);
    const minerIndex=r.wave.enemies.indexOf('miner');r.spawned=minerIndex;r.spawn();
    assert.ok(r.enemies.at(-1).maxHealth>=77);
  }
  assert.equal(WORLD.waves.length,20);assert.equal(WORLD.waves.reduce((n,w)=>n+w.total,0),235);
});
test('camping rats use widely separated safe anchors and still telegraph their spawn',()=>{
  const r=new Run();enterFixtureRoom(r,19);r.stillSeconds=12;
  const points=[];
  for(let i=0;i<r.wave.total;i++)if(r.wave.enemies[i]==='rat'){
    r.enemies=[];r.spawned=i;assert.equal(r.spawn(),true);const e=r.enemies[0];
    assert.ok(Math.hypot(e.x-r.player.x,e.y-r.player.y)>180);assert.ok(e.warmup>0);points.push([e.x,e.y]);
  }
  assert.ok(Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1])>300);
});
test('all boss warnings stay unchanged below half HP; only downtime intensifies',()=>{
  for(const id of Object.keys(BOSS_SPECS)) {
    const b=createBoss(1,id,[225,220]);b.warmup=0;b.phase='recovery';b.phaseTime=0;
    b.update(.01,{x:225,y:500},[]);const normal=b.phaseTime;
    b.hp=b.maxHealth*.49;b.phase='recovery';b.phaseTime=0;b.update(.01,{x:225,y:500},[]);
    assert.ok(b.phaseTime<normal);assert.ok(bossRestScale(b)<.8);
    b.phaseTime=0;b.update(.01,{x:225,y:500},[]);
    if(id==='crachefer'){assert.equal(b.phase,'recovery');assert.equal(b.phaseTime,b.spec.recovery*bossRestScale(b));}else{assert.equal(b.phase,'warning');assert.equal(b.phaseTime,id==='haveuse'?.9:BOSS_SPECS[id].warning);}
    const hp=b.hp;b.hit(100,0,0);assert.equal(hp-b.hp,90);
  }
});
test('final machines have staggered openings and moderate recovery without extra damage',()=>{
  const r=new Run();enterFixtureRoom(r,20);
  for(const b of r.enemies){assert.equal(b.restScale,FINAL_BOSS.restScale);assert.equal(b.contactDamage,1);assert.equal(b.hp,Math.round(BOSS_SPECS[b.bossId].health*FINAL_BOSS.healthScale));}
  assert.equal(new Set(r.enemies.map(b=>b.phaseTime)).size,3);
  for(let i=1;i<3;i++)assert.ok(r.enemies[i].phaseTime-r.enemies[i-1].phaseTime>=.44);
});
test('Effondreur limits its warnings to two bounded, locked and expiring ground zones',()=>{
  const b=createBoss(1,'effondreur',[225,220]),p={x:80,y:500,vx:100,vy:0};b.warmup=0;b.phaseTime=0;
  b.update(.01,p,[]);assert.equal(b.zones.length,2);const centers=b.zones.map(z=>[z.x,z.y]);
  for(const z of b.zones){assert.ok(z.x-z.radius>=28&&z.x+z.radius<=422);assert.ok(z.y-z.radius>=116&&z.y+z.radius<=666);}
  p.x=350;b.update(.5,p,[]);assert.deepEqual(b.zones.map(z=>[z.x,z.y]),centers);
  for(let i=0;i<120;i++)b.update(.02,p,[]);assert.equal(b.zones.length,0);
});

for(const weaponId of ['shotgun','smg'])for(const encounter of [16,17,18,19]) {
  test(`${weaponId}: wave ${encounter} can be dodged with a legal build but defeats stationary camping`,()=>{
    // Isolated encounter, base HP and legal perks for that checkpoint. No healing,
    // invulnerability override, altered damage or cleared enemies during combat.
    const active=simulate({weaponId,encounter}),camp=simulate({weaponId,encounter,camp:true});
    assert.equal(active.status,'won');assert.equal(camp.status,'lost');
    assert.ok(active.hp>camp.hp);assert.ok(camp.seconds<15);
    assert.ok(active.moveRatio>.15);assert.equal(camp.moveRatio,0);
    assert.equal(active.badShots,0);assert.ok(active.maxAlive<=12);
    assert.ok(active.maxBolts<=8&&active.maxDrops<=20);
  });
}

for(const weaponId of ['shotgun','smg'])for(const boss of [5,10,15,20]) {
  test(`${weaponId}: boss ${boss} shows several complete patterns and stays beatable`,()=>{
    // This isolated SMG final uses Atelier 2; both complete base-level runs are
    // separately covered by weapons.test, without healing or stat overrides.
    const levels=weaponId==='smg'&&boss===20?{power:2,health:2,mechanics:2,mobility:2}:{};
    const r=simulate({weaponId,boss,levels});
    assert.equal(r.status,'won');assert.equal(r.bosses.length,1);
    assert.ok(r.bosses[0].patterns>=3);assert.ok(r.bosses[0].combatSeconds>12);
    assert.ok(r.bosses[0].combatSeconds<100);assert.equal(r.badShots,0);
    assert.ok(r.maxBolts<=8&&r.maxDrops<=20);
  });
}

test('a late miner survives a real base shotgun volley, then dies to sustained fire',()=>{
  const r=new Run();enterFixtureRoom(r,19);r.spawned=r.wave.enemies.indexOf('miner');r.spawn();
  const miner=r.enemies[0];miner.warmup=0;miner.x=160;miner.y=400;
  const pool=new Projectiles(),events=[];
  for(let i=0;i<7;i++)pool.fire(116,400,0,0,WEAPONS.shotgun);
  pool.update(.1,[miner],events,{x:100,y:400});
  assert.ok(miner.alive&&miner.hp<miner.maxHealth);
  for(let i=0;i<7;i++)pool.fire(116,400,0,0,WEAPONS.shotgun);
  pool.update(.1,[miner],events,{x:100,y:400});assert.equal(miner.alive,false);
  assert.equal(events.filter(e=>e.type==='kill').length,1);
});

test('twelve simultaneous enemies remain finite under a minute of density stress',()=>{
  const r=new Run();enterFixtureRoom(r,19);
  // Stress-only protection keeps the full population alive for the whole sample.
  r.player.invulnerable=999;r.weapon.cooldown=999;
  let peak=0;
  for(let i=0;i<3600;i++) {
    r.update(1/60,{x:Math.sin(i/120),y:Math.cos(i/120)});
    peak=Math.max(peak,r.enemies.length);
    assert.ok(r.enemies.length<=12);assert.equal(r.hostileProjectiles.pool.length,8);
    assert.equal(r.projectiles.pool.length,84);assert.ok(r.loot.activeCount<=20);
    assert.ok(r.enemies.every(e=>Number.isFinite(e.x)&&Number.isFinite(e.y)));
  }
  assert.equal(peak,12);
});
