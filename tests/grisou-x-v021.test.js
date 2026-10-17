import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {WEAPONS} from '../src/weapons.js';
import {WEAPONS as OLD_WEAPONS} from './v020-final-src-snapshot/weapons.js';
import {Weapon} from '../src/weapon.js';
import {Projectiles} from '../src/combat.js';
import {Run} from '../src/run.js';
import {MenuState} from '../src/menu/state.js';
import {drawUpgrades} from '../src/upgrades.js';
import {drawEpics} from '../src/epic-upgrades.js';
import {createEnemy} from '../src/enemies/registry.js';
import {EnemyProjectiles} from '../src/enemy-projectiles.js';
import {GalleryBoss} from '../src/bosses.js';
import {RailBoss} from '../src/rail-bosses.js';
import {FAN_ANGLE} from '../src/enemy-volley.js';
import {V021_FILES} from './v021-authorized-files.js';
import {simulateV021} from './v021-simulation.mjs';
const active=(kind,id=1,x=100,y=300)=>{const e=createEnemy(kind,id,x,y);e.warmup=0;return e;};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('Grisou X is selectable, launches either unlocked zone and offers existing compatible perks/epics',()=>{
  const menu=new MenuState();assert.equal(menu.selectWeapon('grisoux'),true);
  assert.equal(menu.launch('galleries').weaponId,'grisoux');
  const r=new Run(()=>.5,{}, {weaponId:'grisoux',zoneId:'tracks'});
  assert.equal(r.weapon.definition.name,'GRISOU X');assert.equal(r.world.id,'tracks');
  assert.equal(drawUpgrades(r,()=>.5).length,3);assert.equal(drawEpics(r).length,3);
  assert.deepEqual(drawEpics(r).map(p=>p.id),['double-cannon','unstable-grisou','iron-rain']);
});
test('shotgun and SMG definitions retain V0.20 values except the explicit V0.31 distance penalty',()=>{
  const {distancePenaltyStart,distancePenalty,...shotgun}=WEAPONS.shotgun;
  assert.deepEqual(shotgun,OLD_WEAPONS.shotgun);assert.deepEqual(WEAPONS.smg,OLD_WEAPONS.smg);
  assert.equal(distancePenaltyStart,45);assert.equal(distancePenalty,.15);
});
test('Grisou X emits exactly three symmetric energy projectiles only while stopped',()=>{
  const w=new Weapon('grisoux'),pool=new Projectiles(),p={x:70,y:300,angle:0},events=[];
  w.update(.1,p,[active('miner')],pool,events,()=>.5,false);assert.equal(events.length,0);
  w.update(.1,p,[active('miner')],pool,events,()=>.5,true);
  const shots=pool.pool.filter(p=>p.active);assert.equal(shots.length,3);
  near(shots[0].angle,-.05);near(shots[1].angle,0);near(shots[2].angle,.05);
  assert.ok(shots.every(p=>!p.piercing&&p.maxTargets===1));
  w.update(.1,p,[active('miner')],pool,events);assert.equal(events.length,1);
});
test('energy penetration deals exactly 100/70/50/35 after conduit perks percent and vanishes before a fifth target',()=>{
  const targets=Array.from({length:5},(_,i)=>active('miner',i+1,100+i*50));
  const before=targets.map(e=>e.hp),pool=new Projectiles();pool.fire(50,300,0,0,WEAPONS.grisoux,{piercing:true,maxTargets:4});
  pool.update(.5,targets,[]);
  for(let i=0;i<5;i++)near(before[i]-targets[i].hp,11*[1,.7,.5,.35,0][i]);
  assert.equal(pool.pool[0].active,false);assert.deepEqual(pool.pool[0].hitIds,[1,2,3,4]);
});
test('a kill never consumes the remaining penetration and the next target is hit in the same frame',()=>{
  const a=active('rat',1,100),b=active('miner',2,170);a.hp=1;
  const pool=new Projectiles(),events=[];pool.fire(50,300,0,0,WEAPONS.grisoux,{piercing:true,maxTargets:4});pool.update(.25,[a,b],events);
  assert.equal(a.alive,false);near(90-b.hp,7.7);assert.equal(pool.pool[0].active,true);
  assert.deepEqual(events.map(e=>e.type),['kill','hit']);assert.ok(events.every(e=>e.energy&&e.continuing));
  pool.update(.01,[a,b],events);assert.equal(events.length,2);
});
test('energy projectiles expire at range/borders, reuse the pool and never duplicate a hit',()=>{
  const pool=new Projectiles(),e=active('miner',1,120),events=[];
  pool.fire(100,300,0,0,WEAPONS.grisoux);pool.update(.03,[e],events);pool.update(.01,[e],events);
  assert.equal(events.length,1);pool.update(1,[],events);assert.equal(pool.pool[0].active,false);
  const same=pool.pool[0];pool.fire(50,300,0,0,WEAPONS.grisoux);assert.equal(pool.pool[0],same);assert.deepEqual(same.hitIds,[]);
  assert.equal(pool.pool.length,84);
});
for(const kind of ['drill','draisine'])test(kind+' immediately fires three symmetric directions aimed at the player at release',()=>{
  const e=active(kind),events=[],p={x:260,y:300};e.cooldown=0;e.phaseTime=0;e.update(.01,p,events);
  assert.equal(e.phase,'recovery');assert.equal(events.length,1);
  assert.equal(events.length,1);assert.equal(events[0].fan,true);
  const angle=Math.atan2(p.y-e.y,p.x-e.x);near(events[0].angle,angle);
  const pool=new EnemyProjectiles();assert.equal(pool.fireVolley(e,events[0].angle,true),true);
  const bolts=pool.pool.filter(p=>p.active);assert.equal(bolts.length,3);
  for(const [i,offset] of [-FAN_ANGLE,0,FAN_ANGLE].entries())near(bolts[i].angle,angle+offset);
  const fixed=bolts.map(b=>b.angle);p.x=40;p.y=140;pool.update(.1,p,p,()=>{});
  assert.deepEqual(bolts.map(b=>b.angle),fixed);assert.ok(bolts.every(b=>b.spec.speed<=120&&b.spec.damage<=.5));
});
test('fan allocation is atomic, capped at eight bolts, and prohibits simultaneous boss fans',()=>{
  const pool=new EnemyProjectiles(),a=active('drill',1),b=active('draisine',2),c=active('drill',3);
  assert.equal(pool.fireVolley(a,0,true),true);assert.equal(pool.fireVolley(b,0,true),true);
  assert.equal(pool.fireVolley(c,0,true),false);assert.equal(pool.pool.filter(b=>b.active).length,6);
  assert.equal(pool.fireVolley(a,0,true),false);pool.clear();a.kind=b.kind='boss';
  assert.equal(pool.fireVolley(a,0,true),true);assert.equal(pool.fireVolley(b,0,true),false);
  pool.clear();assert.equal(pool.fireVolley(b,0,true),true);
});
test('slow fans can be dodged after release and overlapping hits respect player invulnerability',()=>{
  for(const dodge of [false,true]) {
    const r=new Run(),p=r.player;p.x=230;p.y=300;const e=active('drill');
    r.hostileProjectiles.fireVolley(e,0,true);
    for(let i=0;i<120;i++) {
      const previous={x:p.x,y:p.y};p.update(1/60,{x:0,y:dodge&&i>=12?1:0});
      r.hostileProjectiles.update(1/60,p,previous,d=>r.damagePlayer(d,[]));
    }
    assert.equal(p.hp,dodge?5:4.5);
  }
});
test('Crachefer mixes simple/fan/circle shots; Aiguilleur preserves rails between simple and fan patterns',()=>{
  const c=new GalleryBoss(1,'crachefer');c.warmup=0;const modes=[];
  for(let i=0;i<4;i++){c.phase='positioning';c.phaseTime=0;c.update(.01,{x:225,y:500},[]);modes.push(c.fanAttack);}
  assert.deepEqual(modes,[false,true,false,false]);assert.equal(c.projectilePattern,'circle');assert.equal(c.circleShots,6);
  const a=new RailBoss(2,'switchman',{final:true}),patterns=[];
  for(let i=0;i<6;i++){a.beginWarning({x:225,y:500});patterns.push([a.pattern,a.fanAttack]);}
  assert.deepEqual(patterns,[['rails',false],['burst',false],['rails',false],['burst',true],['rails',false],['burst',false]]);
});
test('V0.21 keeps all unrequested production files and validated Rat/Wagon visuals byte-identical',async()=>{
  const hashes=JSON.parse(await readFile(new URL('./v020-final-hashes.json',import.meta.url)));
  for(const [file,hash] of Object.entries(hashes))if(!V021_FILES.includes(file))assert.equal(createHash('sha256').update(await readFile(new URL('../src/'+file,import.meta.url))).digest('hex'),hash,file);
});
test('Grisou X art is lightweight local SVG and the three-card menu uses the existing selection mechanism',async()=>{
  const svg=await readFile(new URL('../src/assets/combat-v020/grisoux.svg',import.meta.url),'utf8');
  assert.ok(Buffer.byteLength(svg)<6000);assert.doesNotMatch(svg,/<script|<image|<filter|foreignObject/);
  const menu=await readFile(new URL('../src/menu/weapon-selector.js',import.meta.url),'utf8');assert.match(menu,/Object.values\(WEAPONS\)/);
});
for(const weaponId of ['shotgun','smg','grisoux'])test('historical V0.21 full Zone 2 with '+weaponId+' has real fans, legal choices and unchanged reward budget',()=>{
  const r=simulateV021({weaponId,zoneId:'tracks',seed:1,rank:2});
  assert.equal(r.status,'won');assert.equal(r.wave,20);assert.equal(r.choices,6);assert.equal(r.kills,277);
  assert.ok(r.volleys>0);assert.ok(r.maxBolts<=8);assert.equal(r.movingShots,0);
  assert.deepEqual(r.rewards,{coal:108,iron:9,diamond:0,token:0});
});
test('historical V0.21 Grisou X completes all twenty Galeries waves with real enemy fans',()=>{
  const r=simulateV021({weaponId:'grisoux',zoneId:'galleries',seed:1,rank:2});
  assert.equal(r.status,'won');assert.equal(r.wave,20);assert.equal(r.choices,6);assert.equal(r.kills,235);assert.ok(r.volleys>0);
  assert.deepEqual(r.rewards,{coal:94,iron:8,diamond:0,token:0});
});
