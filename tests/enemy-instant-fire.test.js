import {beforeLampistVisual} from './lampist-visual-delta.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {Run} from '../src/run.js';
import {createEnemy} from '../src/enemies/registry.js';
import {createBoss} from '../src/bosses.js';
import {Run as OldRun} from '../production-v038c1b-instant-fire/before/src/run.js';
import {createEnemy as oldEnemy} from '../production-v038c1b-instant-fire/before/src/enemies/registry.js';
import {createBoss as oldBoss} from '../production-v038c1b-instant-fire/before/src/bosses.js';
import {EnemyProjectiles} from '../src/enemy-projectiles.js';
import {EnemyProjectiles as OldShots} from '../production-v038c1b-instant-fire/before/src/enemy-projectiles.js';
import {rivetCompatible} from '../src/enemy-rivet-vfx.js';
import {isPureProjectile,projectileAnimationReleased} from '../src/projectile-attacks.js';
import {enemySheet,createEnemyAnimation,advanceEnemyAnimation} from '../src/enemy-animation.js';
import {cases,scenario,measure} from '../production-v038c1b-instant-fire/scenarios.js';
import {drawRift} from '../src/rift/art.js';
import {drawDepths} from '../src/depths/art.js';
import {drawForge} from '../src/forge/art.js';
import {EnemyAttacksView} from '../src/enemies/view.js';
const api={Run,createEnemy,createBoss},old={Run:OldRun,createEnemy:oldEnemy,createBoss:oldBoss};
const live=r=>r.hostileProjectiles.pool.filter(p=>p.active);
const changed=['boss-patterns.js','bosses.js','rail-bosses.js','shaft-actors.js','enemies/drill.js','enemies/draisine.js','rift/actors.js','depths/actors.js','forge/actors.js','run.js','triple-pressure.js','enemy-projectiles.js','rift/combat.js','enemy-rivet-vfx.js','enemies/view.js','rift/art.js','depths/art.js','forge/art.js','enemy-animation.js','rift-animation.js','depths-animation.js','forge-animation-state.js','projectile-attacks.js'];

for(const c of cases)test('INSTANT current update: '+c.label,()=>{
 const now=measure(api,c),before=measure(old,c);
 assert.equal(now.tick,0);assert.equal(now.shots,c.shots);assert.ok(before.ms>=800,JSON.stringify(before));
 const a=scenario(api,c),b=scenario(old,c);
 a.r.update(1/120);for(let i=0;i<=before.tick;i++)b.r.update(1/120);
 assert.deepEqual(live(a.r).map(p=>p.spec),live(b.r).map(p=>p.spec),'damage/speed/radius/range');
 assert.equal(a.e.cooldown,b.e.cooldown,'cooldown value');
 assert.equal(a.e.phaseTime,b.e.phaseTime,'recovery/burst duration');
 assert.notEqual(a.e.phase,'warning');
});

test('INSTANT Zone2 wave15 is switchman and circle6/8 uses existing Rivet family',()=>{
 const r=new Run(()=>.5,{}, {zoneId:'tracks'});assert.equal(r.world.waves[14].bosses[0],'switchman');
 for(const c of cases.filter(c=>['crachefer','switchman'].includes(c.id))){const {r,e}=scenario(api,c);r.update(1/120);for(const p of live(r))assert.ok(rivetCompatible(p,e,c.zone));}
 for(const c of cases.filter(c=>['compressor','firedamp','blower','core','lampist'].includes(c.id))){const {r,e}=scenario(api,c);r.update(1/120);for(const p of live(r))assert.equal(rivetCompatible(p,e,c.zone),false);}
});

for(let direction=0;direction<8;direction++)test('INSTANT muzzle, collision and flight unchanged, direction '+direction,()=>{
 for(const d of [65,100,200]){
  const a=new EnemyProjectiles(),b=new OldShots(),e=createEnemy('drill',1,225,390);e.warmup=0;
  const angle=direction*Math.PI/4,p={x:e.x+Math.cos(angle)*d,y:e.y+Math.sin(angle)*d,radius:12};
  a.fire(e,angle);b.fire(e,angle);assert.deepEqual(a.pool,b.pool);
  const q=a.pool.find(p=>p.active);assert.ok(Math.hypot(q.x-p.x,q.y-p.y)>q.spec.radius+p.radius);
  assert.ok(Math.abs(Math.hypot(q.x-e.x,q.y-e.y)-(e.radius+q.spec.radius+2))<1e-10);
  const hitsA=[],hitsB=[];for(let tick=0;tick<240;tick++){a.update(1/120,p,p,d=>hitsA.push(d));b.update(1/120,p,p,d=>hitsB.push(d));assert.deepEqual(a.pool,b.pool);}assert.deepEqual(hitsA,hitsB);
 }
});

test('INSTANT animation follows successful emission only; rendering cannot create a projectile',()=>{
 const c=cases.find(c=>c.id==='crachefer'),{r,e}=scenario(api,c),a=createEnemyAnimation(e),sheet=enemySheet(e.bossId);
 for(let i=0;i<50;i++)advanceEnemyAnimation(sheet,a,e,1/60);
 assert.equal(live(r).length,0);assert.notEqual(a.state,'attack');
 r.update(1/120);const state=JSON.stringify(r);advanceEnemyAnimation(sheet,a,e,1/60);
 assert.equal(a.state,'attack');assert.equal(JSON.stringify(r),state);
 const view={};assert.equal(projectileAnimationReleased(view,e),true);assert.equal(projectileAnimationReleased(view,e),false);
});

test('INSTANT Crachefer blocked pool retries first free tick without preview or lost shot',()=>{
 const {r,e}=scenario(api,cases.find(c=>c.id==='crachefer'));
 for(const p of r.hostileProjectiles.pool)Object.assign(p,{active:true,owner:99,x:60,y:150,angle:0,distance:0,spec:{speed:0,range:400,radius:6,damage:.5}});
 r.update(1/120);assert.equal(e.phase,'warning');assert.equal(e.phaseTime,0);assert.equal(projectileAnimationReleased({},e),false);
 assert.ok(isPureProjectile(e));r.hostileProjectiles.clear();r.update(1/120);assert.equal(live(r).length,1);assert.equal(e.phase,'recovery');
});

test('INSTANT caps and reservations stay atomic',()=>{
 const a=new EnemyProjectiles(),b=new OldShots(),e=createBoss(1,'crachefer',[225,250]);e.warmup=0;
 assert.equal(a.reserveCircle(e,6),b.reserveCircle(e,6));assert.equal(a.fireCircle(e,.2,6),b.fireCircle(e,.2,6));assert.deepEqual(a.pool,b.pool);
 const other=createBoss(2,'switchman',[250,200]);other.warmup=0;
 assert.equal(a.fireVolley(other,0,true),false);assert.equal(a.reserveCircle(other,6),false);assert.equal(a.pool.length,8);assert.equal(a.pool.filter(p=>p.active).length,6);
});

test('INSTANT second Aiguilleur shot keeps original320ms interval',()=>{
 const {r,e}=scenario(api,cases.find(c=>c.id==='switchman'));r.update(.001);assert.equal(live(r).length,1);
 // First shot must leave its owner's one-shot quota before the second is valid.
 r.hostileProjectiles.clear();e.update(.319,r.player,[]);const attacks=[];e.update(.002,r.player,attacks);assert.equal(attacks.length,1);
});

test('INSTANT Core double keeps650ms separation and16-shot reservation',()=>{
 const {r,e}=scenario(api,cases.find(c=>c.id==='core'));r.update(.001);assert.equal(live(r).length,8);assert.equal(r.hostileProjectiles.reservations.get(e.id),8);
 e.update(.649,r.player,[],{rift:r.rift});assert.equal(live(r).length,8);e.update(.002,r.player,[],{rift:r.rift});assert.equal(live(r).length,16);
});

for(const [zone,id,count]of [['galleries','effondreur',0],['tracks','stationmaster',0],['tracks','locomotive',1],['tracks','switchman',0],['shaft59','cager',0],['shaft59','compressor',2],['shaft59','firedamp',0],['rift','splitter',2],['rift','blower',1]])test('INSTANT preserves non-projectile warning: '+id+'/'+count,()=>{
 const c={zone,id,count,wave:1},a=scenario(api,c),b=scenario(old,c);
 for(let i=0;i<60;i++){a.r.update(1/120);b.r.update(1/120);assert.equal(a.e.phase,b.e.phase);assert.equal(a.e.phaseTime,b.e.phaseTime);}
 assert.equal(a.e.phase,'warning');assert.equal(isPureProjectile(a.e),false);assert.equal(live(a.r).length,0);
 assert.deepEqual(a.e.hazards,b.e.hazards);assert.deepEqual(a.e.zones,b.e.zones);
 assert.deepEqual((a.r.rift||a.r.depths||a.r.forge)?.ground.items,(b.r.rift||b.r.depths||b.r.forge)?.ground.items);
});

test('INSTANT composite boss patterns and delayed orb explosion are not reclassified',()=>{
 assert.equal(isPureProjectile({riftType:'core',pattern:'orb',bossSequence:{}}),false);
 assert.equal(isPureProjectile({forgeType:'boiler',pattern:'steam',plan:{}}),false);
 const {r}=scenario(api,cases.find(c=>c.id==='core'&&c.shots===1));r.update(1/120);
 for(const p of live(r))p.distance=p.spec.range;
 r.hostileProjectiles.update(.001,r.player,r.player,()=>{});
 assert.equal(r.hostileProjectiles.bursts.length,1);assert.ok(r.hostileProjectiles.bursts[0].warning>1);
 assert.equal(live(r).length,0);
});

function graphics(log=[]){let g;g=new Proxy({},{get:(_,key)=>(...args)=>{log.push([key,...args]);return g;}});return g;}
for(const [zone,id,draw]of [['rift','core',drawRift],['depths','lampist',drawDepths],['forge','riveter',drawForge]])test('INSTANT no ghost/line/orb preview even during budget wait in '+zone,()=>{
 const {r,e}=scenario(api,cases.find(c=>c.id===id));r.update(.001);r.hostileProjectiles.clear();
 e.phase='warning';e.phaseTime=2;e.shotAngles=[0,.2,-.2];const log=[];draw(graphics(log),r);assert.equal(log.length,0);
});
test('INSTANT legacy projectile preview absent, while rail warning still renders',()=>{
 const calls=[],scene={textures:{exists:()=>false},add:{graphics:()=>graphics(calls),image:()=>graphics()}};
 const view=new EnemyAttacksView(scene);calls.length=0;
 const {r,e}=scenario(api,cases.find(c=>c.id==='switchman'));r.update(.001);r.hostileProjectiles.clear();e.phase='warning';e.phaseTime=2;
 view.update(r);assert.equal(calls.filter(([name])=>!['clear','setDepth'].includes(name)).length,0);
 const wagon=createEnemy('wagon',2,60,350);wagon.warmup=0;wagon.phase='warning';wagon.endX=380;
 r.enemies=[wagon];calls.length=0;view.update(r);
 assert.ok(calls.some(([name])=>name==='lineBetween'));assert.equal(wagon.phase,'warning');
});

test('INSTANT byte lock: all configs, player logic, assets, hazard directors and existing tests retained',()=>{
 for(const f of JSON.parse(fs.readFileSync('production-v038c1b-instant-fire/notes/before-hashes.json'))){
  if(changed.includes(f.path.replace(/^src\//,'')))continue;
  assert.equal(createHash('sha256').update(beforeLampistVisual(f.path.replace(/^src\//,''),fs.readFileSync(f.path))).digest('hex'),f.hash,f.path);
 }
});

