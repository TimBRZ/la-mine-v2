import {V021_FILES} from './v021-authorized-files.js';
import { VISUAL_FILES } from './v019-visual-files.js';
import { preserveWorkshopHint } from './v017-protected-copy.js';
import { TALENT_FILES } from './v016-authorized-files.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD, worldRewards } from '../src/world.js';
import { roomRewards } from '../src/rewards.js';
import { createBoss } from '../src/bosses.js';
import { Haveuse } from '../src/boss.js';
import { Run } from '../src/run.js';
import { UpgradeFlow, drawUpgrades } from '../src/upgrades.js';
import { EPIC_UPGRADES } from '../src/epic-upgrades.js';
import { Projectiles } from '../src/combat.js';
import { WEAPONS } from '../src/weapons.js';
import { createEnemy } from '../src/enemies/registry.js';
import { resolveExplosions } from '../src/explosions.js';
import { finishFixtureRoom, enterFixtureRoom } from './run-helpers.js';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('world configuration contains twenty bounded encounters and four boss milestones',()=>{
  assert.equal(WORLD.waves.length,20);
  assert.deepEqual(WORLD.waves.flatMap((w,i)=>w.boss?[i+1]:[]),[5,10,15,20]);
  assert.deepEqual(WORLD.waves[19].bosses,['haveuse','crachefer','effondreur']);
  assert.deepEqual(WORLD.choices,[4,9,14,18]);assert.equal(WORLD.epicAfter,19);
  for(const w of WORLD.waves){assert.ok(w.maxAlive<=12);assert.equal(w.total,w.boss?w.bosses.length:w.enemies.length);}
});
test('twenty-wave rewards preserve every original full-run budget and probability',()=>{
  for(const value of [0,.009,.02,.08,.2,.5,.99]) {
    const sum=plans=>plans.reduce((out,p)=>{for(const k in p)out[k]=(out[k]||0)+p[k];return out;},{});
    assert.deepEqual(sum(worldRewards(()=>value)),sum(Array.from({length:5},(_,i)=>roomRewards(i+1,()=>value))));
    assert.ok(worldRewards(()=>value).every(p=>p.coal<=8));
  }
});
test('boss factory preserves Haveuse and applies final health scaling explicitly',()=>{
  const boss=createBoss(1,'haveuse',[225,220]);assert.ok(boss instanceof Haveuse);assert.equal(boss.hp,1215);
  assert.equal(createBoss(2,'haveuse',[110,210],.6).hp,729);
});
test('Crachefer locks aim on its immediate ranged shot and never fires while dead',()=>{
  const b=createBoss(1,'crachefer',[225,220]),p={x:225,y:500},attacks=[];
  b.warmup=0;b.phaseTime=0;b.update(.01,p,attacks);assert.equal(b.phase,'recovery');assert.equal(attacks.length,1);
  const angle=b.attackAngle;p.x=350;
  for(let i=0;i<10;i++)b.update(.04,p,attacks);
  assert.equal(attacks.length,1);assert.equal(attacks[0].angle,angle);assert.equal(b.phase,'recovery');
  b.hp=0;b.phase='warning';b.phaseTime=0;b.update(.04,p,attacks);assert.equal(attacks.length,1);
});
test('Effondreur locks two ground warnings then activates and expires its zone',()=>{
  const b=createBoss(1,'effondreur',[225,220]),p={x:200,y:500},attacks=[];
  b.warmup=0;b.phaseTime=0;b.update(.01,p,attacks);
  assert.equal(b.phase,'warning');assert.equal(b.zones.length,2);
  p.x=350;for(let i=0;i<34;i++)b.update(.04,p,attacks);
  assert.equal(b.phase,'recovery');assert.equal(b.zones[0].x,200);assert.equal(attacks.length,0);
  for(let i=0;i<36;i++)b.update(.04,p,attacks);assert.equal(b.zones.length,0);
});

test('all twenty waves collect once, pause for six correct choices, and win only at twenty',()=>{
  for(const weaponId of ['shotgun','smg']) {
    const r=new Run(()=>.5,{}, {weaponId,rewardRandom:()=>0}),f=new UpgradeFlow(r,()=>.5),choices=[0];
    f.open();f.choose(f.offered[0].id);
    for(let n=1;n<=20;n++) {
      assert.equal(r.waveNumber,n);const before={...r.collectedRewards};
      finishFixtureRoom(r);
      for(const key in before)assert.equal(r.collectedRewards[key],before[key]+r.rewardPlans[n-1][key]);
      assert.equal(r.status,n===20?'won':'playing');assert.equal(r.loot.activeCount,0);
      if(f.afterCombat()) {
        choices.push(n);assert.equal(f.offered.length,3);
        for(const card of f.offered)assert.equal(Boolean(card.epic),n===19);
        if(n===19)assert.ok(f.offered.every(card=>card.weapon===weaponId));
        const before=JSON.stringify(r);r.update(.04);assert.equal(JSON.stringify(r),before);
        f.choose(f.offered[0].id);
      }
      if(n<20){r.update(0);while(r.wavePhase==='preparing')r.update(.04);}
    }
    assert.deepEqual(choices,[0,4,9,14,18,19]);assert.equal(f.count,6);
    assert.deepEqual(r.collectedRewards,{coal:94,iron:11,diamond:2,token:1});
  }
});
test('epics never enter normal offers, are weapon-specific and cannot be double-selected',()=>{
  for(const weaponId of ['shotgun','smg']) {
    const r=new Run(()=>.5,{}, {weaponId}),f=new UpgradeFlow(r);
    for(let i=0;i<100;i++)assert.ok(drawUpgrades(r).every(p=>!p.epic));
    enterFixtureRoom(r,19);finishFixtureRoom(r);assert.equal(f.afterCombat(),true);
    assert.deepEqual(f.offered.map(p=>p.id),EPIC_UPGRADES.filter(p=>p.weapon===weaponId).map(p=>p.id));
    assert.equal(f.choose(EPIC_UPGRADES.find(p=>p.weapon!==weaponId).id),false);
    const id=f.offered[0].id;assert.equal(f.choose(id),true);assert.equal(f.choose(id),false);
    assert.equal(r.upgradeRanks[id],1);
  }
});
test('spawn groups overlap living enemies, stay distant, telegraph and respect every cap',()=>{
  for(let n=1;n<=20;n++) {
    const r=new Run();enterFixtureRoom(r,n);if(r.wave.boss)continue;
    r.untilSpawn=0;r.weapon.cooldown=999;r.update(0);
    assert.equal(r.enemies.length,r.wave.group);
    for(const e of r.enemies){assert.ok(e.warmup>0);assert.ok(Math.hypot(e.x-r.player.x,e.y-r.player.y)>180);}
    const ids=r.enemies.map(e=>e.id);r.untilSpawn=0;r.update(0);
    assert.ok(ids.every(id=>r.enemies.some(e=>e.id===id)));assert.ok(r.enemies.length>ids.length);
    for(let i=0;i<20;i++)r.spawn();assert.ok(r.enemies.length<=r.wave.maxAlive);
  }
});
test('triple boss intro contains three distinct machines with reduced HP and safe entry positions',()=>{
  const r=new Run();enterFixtureRoom(r,20);
  assert.deepEqual(r.enemies.map(b=>b.bossId),['haveuse','crachefer','effondreur']);
  assert.deepEqual(r.enemies.map(b=>b.hp),[972,1373,1560]);assert.equal(r.spawned,3);assert.equal(r.spawn(),false);
  for(const b of r.enemies)assert.ok(Math.hypot(b.x-r.player.x,b.y-r.player.y)>=200);
  r.enemies[0].hp=0;r.update(0);assert.equal(r.wavePhase,'combat');
});
test('ground danger hits only after warning, can be escaped, freezes on pause and ends with its owner',()=>{
  for(const dodge of [false,true]) {
    const r=new Run();enterFixtureRoom(r,15);const b=r.enemies[0];
    b.warmup=0;b.phaseTime=0;r.weapon.cooldown=999;r.update(.01);
    const hp=r.player.hp;for(let i=0;i<30;i++)r.update(.04);assert.equal(r.player.hp,hp);
    const time=b.zones[0].time;r.paused=true;r.update(.04);assert.equal(b.zones[0].time,time);r.paused=false;
    if(dodge){r.player.x=65;r.player.y=650;};
    for(let i=0;i<8;i++)r.update(.04);assert.equal(r.player.hp,dodge?hp:hp-1);
    b.hp=0;const after=r.player.hp;r.update(.04);assert.equal(r.player.hp,after);
  }
});
const dummy=(id,x)=>{const e=createEnemy('miner',id,x,400);e.warmup=0;e.hp=1000;return e;};
test('Double Canon emits exactly two nonrecursive volleys while moving still blocks shots',()=>{
  const r=new Run();EPIC_UPGRADES[0].apply(r);const events=[];
  r.player.x=100;r.player.y=400;
  r.weapon.update(0,r.player,[dummy(1,170)],r.projectiles,events,()=>0,true);
  assert.equal(events.length,2);assert.equal(r.projectiles.pool.filter(p=>p.active).length,14);
  r.weapon.cooldown=0;r.weapon.update(.04,r.player,[dummy(2,170)],r.projectiles,events,()=>0,false);assert.equal(events.length,2);
});
test('unstable Grisou explodes once per death and a three-boss chain remains finite',()=>{
  const r=new Run();EPIC_UPGRADES[1].apply(r);
  const enemies=[1,2,3].map((id)=>{const b=createBoss(id,'haveuse',[200+id*10,400]);b.warmup=0;b.hp=id===1?0:100;return b;});
  const events=[{type:'kill',id:1,x:210,y:400},{type:'kill',id:1,x:210,y:400}];
  resolveExplosions(events,enemies,r.grisou);
  assert.equal(events.filter(e=>e.type==='explosion').length,3);assert.ok(enemies.every(e=>!e.alive));
});
test('Point blank adds exactly 100 percent base close damage, without boosting far damage',()=>{
  const r=new Run();EPIC_UPGRADES[2].apply(r);assert.equal(r.weapon.closeBonus,1);
  const damage=(closeBonus,distance)=>{const pool=new Projectiles(),e=dummy(1,100+distance);pool.fire(100,400,0,closeBonus);pool.update(.2,[e],[],{x:100,y:400});return 1000-e.hp;};
  assert.equal(damage(1,60),2*damage(0,60));assert.equal(damage(1,120),damage(0,120));
});
test('total piercing hits at most three distinct targets with 100, 80, 64 percent damage',()=>{
  const pool=new Projectiles(),enemies=[1,2,3,4].map((id)=>dummy(id,100+id*40));
  pool.fire(100,400,0,0,WEAPONS.smg,{piercing:true,maxTargets:3});pool.update(.3,enemies,[],{x:100,y:400});
  assert.deepEqual(enemies.map(e=>Number((1000-e.hp).toFixed(3))),[5,4,3.2,0]);
});
test('critical heat grants its final damage only at maximum and motion clears heat',()=>{
  const r=new Run(()=>.5,{}, {weaponId:'smg'});EPIC_UPGRADES[4].apply(r);r.player.x=100;r.player.y=400;
  const e=dummy(1,180);for(let i=0;i<110;i++)r.weapon.update(.04,r.player,[e],r.projectiles,[],()=>.5,true);
  assert.equal(r.weapon.heat,.4);r.weapon.cooldown=0;r.projectiles.pool.forEach(p=>p.active=false);
  r.weapon.update(0,r.player,[e],r.projectiles,[],()=>.5,true);assert.equal(r.projectiles.pool.find(p=>p.active).damageMultiplier,2.4);
  r.weapon.update(.04,r.player,[e],r.projectiles,[],()=>.5,false);assert.equal(r.weapon.heat,0);
});
test('iron rain increases cadence by 50 percent with 15 percent less damage per bullet',()=>{
  const r=new Run(()=>.5,{}, {weaponId:'smg'}),base=r.weapon.interval;EPIC_UPGRADES[5].apply(r);
  assert.equal(r.weapon.interval,base/1.5);assert.equal(r.weapon.damageBoost,.85);assert.ok(.85*1.5>1.27);
});
test('V0.13 protected systems remain intact outside the authorized V0.14 enemy changes',async()=>{
  // V0.14 explicitly retunes boss/rat/drill behavior; difficulty-v014 covers it.
  const baseline=JSON.parse(await readFile(new URL('./v013-protected-baseline.json',import.meta.url)));
  for(const [file,hash] of Object.entries(baseline).filter(([file])=>!V021_FILES.includes(file)).filter(([file])=>!VISUAL_FILES.includes(file)).filter(([file])=>!TALENT_FILES.includes(file)).filter(([file])=>!['boss.js','enemies/rat.js','enemies/drill.js'].includes(file)))assert.equal(createHash('sha256').update(preserveWorkshopHint(file,await readFile(new URL('../src/'+file,import.meta.url)))).digest('hex'),hash,file);
});
test('Crachefer fires a real bounded slow bolt; lateral motion can dodge its locked aim',()=>{
  for(const dodge of [false,true]) {
    const r=new Run();enterFixtureRoom(r,10);r.weapon.cooldown=999;r.player.x=225;r.player.y=400;
    const b=r.enemies[0];b.warmup=0;b.phase='warning';b.attackAngle=Math.PI/2;b.phaseTime=.01;
    const hp=r.player.hp;r.update(.02);assert.equal(r.hostileProjectiles.pool.filter(p=>p.active).length,1);
    for(let i=0;i<55;i++)r.update(.04,dodge?{x:1,y:0}:{x:0,y:0});
    assert.equal(r.player.hp,dodge?hp:hp-1);assert.equal(r.hostileProjectiles.pool.length,8);
  }
});
