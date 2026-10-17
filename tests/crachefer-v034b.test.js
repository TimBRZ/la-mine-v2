import {createBoss as BeforeBoss} from '../production-v034b/before/src/bosses.js';
import {historicalSource} from './instant-fire-compat.js';
import {v036bChanged} from './v036b-authorized-files.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {Run} from '../src/run.js';
import {Run as BeforeRun} from '../production-v034b/before/src/run.js';
import {ENEMY_SHEETS,createEnemyAnimation,advanceEnemyAnimation,applyEnemyAnimation} from '../src/enemy-animation.js';
import {COMBAT_APPEARANCES,createAppearanceMotion,appearancePose} from '../src/combat-appearances.js';
import {DRILL_BOLT} from '../src/enemies/stats.js';
import {fanAngles} from '../src/enemy-volley.js';
import {circleAngles} from '../src/boss-patterns.js';
import {scenario,step,summary} from './instant-crachefer-scenario.js';
import {withoutCracheferRetry} from './crachefer-patch-compat.js';
import {beforeVisualDiagnostic} from './visual-diagnostic-compat.js';
const sheet=ENEMY_SHEETS.crachefer;
const hash=b=>createHash('sha256').update(b).digest('hex');

test('Crachefer patch changes exactly the authorised retry condition, preserving all other production bytes',()=>{
 const baseline=JSON.parse(historicalSource(new URL('../production-v034b/crachefer-patch/before-hashes.json',import.meta.url)));
 for(const f of baseline.filter(f=>f.file.startsWith('src/')&&!v036bChanged(f.file))){
  let bytes=beforeVisualDiagnostic(f.file,historicalSource(new URL('../'+f.file,import.meta.url)));
  // V035B delegates the same renderer entry points; retain every other byte check.
  if(['src/room-scene.js','src/enemies/view.js'].includes(f.file))bytes=Buffer.from(bytes.toString().replace("from './rift-animation.js'","from './enemy-animation.js'").replace("from '../rift-animation.js'","from '../enemy-animation.js'"));
  assert.equal(hash(withoutCracheferRetry(f.file,bytes)),f.sha256,f.file);
 }
 const current=historicalSource(new URL('../src/run.js',import.meta.url),'utf8');
 assert.equal(current.split("else if(this.wave.final||this.rift||owner.bossId==='crachefer')").length,2);
});

for(const low of [false,true])test('Crachefer original omission is reproduced before V034B, hp low='+low,()=>{
 const s=scenario(BeforeRun,{low},BeforeBoss);while(s.cycles.length<100&&s.tick<100000)step(s);
 assert.equal(s.cycles.length,100);assert.equal(s.missing,low?37:5);
 const recorded=JSON.parse(fs.readFileSync(new URL('../production-v034b/crachefer-patch/diagnosis-before.json',import.meta.url)));
 const old=recorded.find(r=>r.low===low&&r.name==='pre-V034B'),art=recorded.find(r=>r.low===low&&r.name==='V034B');
 assert.deepEqual(s.cycles,old.cycles);assert.deepEqual(old.cycles,art.cycles);
});

for(const low of [false,true])for(const final of [false,true])test('Crachefer 100 complete cycles: selected -> projectile, never empty ATTACK, low='+low+' final='+final,()=>{
 const s=scenario(Run,{low,final}),a=createEnemyAnimation(s.boss);let previous,visualAttacks=0,visualRecovery=0,visualPrepare=0;
 while(s.cycles.length<100&&s.tick<100000){
  const events=step(s),saved=JSON.stringify(s.boss);
  advanceEnemyAnimation(sheet,a,s.boss,1/60);
  assert.equal(JSON.stringify(s.boss),saved);
  if(a.state!==previous){
   if(a.state==='attack'){visualAttacks++;assert.ok(events.some(e=>e.type==='enemy-shot'));}
   if(a.state==='prepare')visualPrepare++;
   if(a.state==='recovery')visualRecovery++;
  }
  if(events.some(e=>e.type==='boss-shot-delayed')){assert.equal(s.boss.phase,'warning');assert.equal(s.boss.phaseTime,0);assert.notEqual(a.state,'prepare');assert.notEqual(a.state,'attack');}
  previous=a.state;
 }
 assert.equal(s.cycles.length,100);assert.equal(s.missing,0);assert.equal(s.emitted,100);assert.equal(s.selected,100);
 assert.equal(visualAttacks,100);assert.equal(visualPrepare,0);
 // The existing .25 s ATTACK clip covers the shorter late-triple recovery.
 assert.equal(visualRecovery,final&&low?0:99);
 assert.equal(s.trace.filter(e=>e.event==='state'&&e.to==='positioning').length,99);
 assert.ok(s.maxBolts<=DRILL_BOLT.capacity);assert.ok(s.delayed>0);
});

for(let direction=0;direction<8;direction++)test('Crachefer aim, muzzle and retained gameplay at '+direction*45+' degrees',()=>{
 const angle=direction*Math.PI/4;
 for(const pattern of ['single','fan','circle']){
  const {run,boss}=scenario(Run);boss.warmup=0;boss.x=225;boss.y=380;boss.angle=boss.attackAngle=angle;
  boss.phase='warning';boss.phaseTime=.01;boss.fanAttack=pattern==='fan';boss.projectilePattern=pattern==='circle'?'circle':null;
  boss.circleAngle=angle;boss.circleShots=6;if(pattern==='circle')assert.ok(run.hostileProjectiles.reserveCircle(boss,6));
  run.player.x=boss.x+Math.cos(angle)*100;run.player.y=boss.y+Math.sin(angle)*100;
  const a=createEnemyAnimation(boss);advanceEnemyAnimation(sheet,a,boss,0);
  const events=run.update(1/60,{x:0,y:0});assert.equal(events.filter(e=>e.type==='enemy-shot').length,1);
  const pose=advanceEnemyAnimation(sheet,a,boss,1/60);assert.equal(a.state,'attack');assert.equal(pose.rotation,angle);assert.equal(pose.flip,false);
  const legacy=appearancePose(COMBAT_APPEARANCES.crachefer,createAppearanceMotion(boss.x,boss.y),boss,1/60);assert.equal(legacy.rotation,angle);
  const bolts=run.hostileProjectiles.pool.filter(p=>p.active),angles=pattern==='circle'?circleAngles(angle,6):pattern==='fan'?fanAngles(angle):[angle];
  assert.equal(bolts.length,angles.length);
  bolts.forEach((p,i)=>{assert.ok(Math.abs(Math.cos(p.angle)-Math.cos(angles[i]))<1e-10&&Math.abs(Math.sin(p.angle)-Math.sin(angles[i]))<1e-10);assert.equal(p.distance,0);assert.ok(Math.abs(Math.hypot(p.x-boss.x,p.y-boss.y)-(boss.radius+p.spec.radius+2))<1e-10);});
  run.hostileProjectiles.update(1/60,run.player,run.player,()=>assert.fail('premature impact'));
  assert.ok(bolts.every(p=>p.active&&p.distance>0));
 }
});

test('Crachefer refusal retains pattern and locked single aim; capacity release fires exactly once then recovers',()=>{
 const {run,boss}=scenario(Run);boss.warmup=0;boss.phase='warning';boss.phaseTime=.01;boss.attackAngle=.3;run.player.y=boss.y+120;
 for(const p of run.hostileProjectiles.pool)Object.assign(p,{active:true,owner:boss.id,angle:0,x:70,y:140,distance:0,spec:DRILL_BOLT});
 let events=run.update(1/60,{x:0,y:0});assert.ok(events.some(e=>e.type==='boss-shot-delayed'));assert.equal(boss.phase,'warning');assert.equal(boss.attackAngle,.3);
 run.hostileProjectiles.clear();run.player.x=100;run.player.y=600;
 let fired=0;for(let i=0;i<22;i++){events=run.update(1/60,{x:0,y:0});fired+=events.filter(e=>e.type==='enemy-shot').length;}
 assert.equal(fired,1);assert.equal(boss.phase,'recovery');assert.equal(run.hostileProjectiles.pool.find(p=>p.active).angle,.3);
});

test('Crachefer visual interruption and missing sheet cannot cancel projectiles; legacy and sheet replays are identical',()=>{
 const modes=['sheet','fallback','interrupted'],results=[];
 for(const mode of modes){
  const s=scenario(Run,{low:true}),motion=createAppearanceMotion(s.boss.x,s.boss.y);let a=createEnemyAnimation(s.boss);
  while(s.cycles.length<100&&s.tick<100000){step(s);const snapshot=JSON.stringify(s.boss);
   if(mode==='sheet')advanceEnemyAnimation(sheet,a,s.boss,1/60);
   else if(mode==='fallback'){
    assert.equal(applyEnemyAnimation({}, {exists:()=>false},sheet,a,s.boss,1/60),false);
    appearancePose(COMBAT_APPEARANCES.crachefer,motion,s.boss,1/60);
   }else if(s.tick%11===0){a=createEnemyAnimation(s.boss);advanceEnemyAnimation(sheet,a,s.boss,.04);}
   assert.equal(JSON.stringify(s.boss),snapshot);
  }
  results.push({summary:summary(s),cycles:s.cycles,pool:s.run.hostileProjectiles.pool,player:s.run.player});
 }
 assert.deepEqual(results[0],results[1]);assert.deepEqual(results[0],results[2]);assert.equal(results[0].summary.missing,0);
});

test('Crachefer killed while pending never emits posthumously or reserves projectile slots',()=>{
 const {run,boss}=scenario(Run);boss.warmup=0;boss.phase='warning';boss.phaseTime=.35;boss.hp=0;
 for(let i=0;i<30;i++)assert.ok(!run.update(1/60,{x:0,y:0}).some(e=>e.type==='enemy-shot'));
 assert.equal(run.hostileProjectiles.reservations.size,0);assert.ok(run.hostileProjectiles.pool.every(p=>!p.active));
});
