import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {cases,scenario,measure} from '../production-v038c1b-instant-fire/scenarios.js';
import {cadence,current,previous} from '../production-v038c1c-reconciliation/cadence.mjs';
import {EnemyProjectiles} from '../src/enemy-projectiles.js';import {RiftProjectiles} from '../src/rift/combat.js';
import {isPureProjectile,projectileMuzzleClear} from '../src/projectile-attacks.js';
import {diagnoseTriple} from './triple-overlap-metrics.mjs';
import {rivetCompatible} from '../src/enemy-rivet-vfx.js';
import {historicalSource} from './instant-fire-compat.js';
import {DEPTHS_PATTERNS} from '../src/depths/config.js';import {FORGE_PATTERNS} from '../src/forge/config.js';import {RIFT_PATTERNS} from '../src/rift/config.js';
import {instantFirePilot} from './instant-fire-pilot.js';
import {inspect} from 'node:util';
import {beforeLampistTestAdapter} from './lampist-visual-delta.js';

for(const c of cases)test('C1c cadence, cooldown and ready-tick emission: '+c.label,()=>{
 const a=cadence(current,c),b=cadence(previous,c),removed=measure(previous,c).ms/1000;
 assert.equal(a.times.length,3);assert.equal(b.times.length,3);
 assert.deepEqual(a.after,b.after,'post-emission recovery/cooldown values must be identical');
 assert.ok(Math.abs((b.interval-a.interval)-removed)<1/120+1e-8,JSON.stringify({c:c.label,a,b,removed}));
 assert.equal(a.times[0],0);
 for(const n of [1,2])assert.ok(a.times[n]-a.ready[n]<=1/120+1e-8,'no wait after ready');
 if(c.id==='switchman'&&c.count===1)assert.ok(a.intra.every(t=>Math.abs(t-.325)<1e-8));
 if(c.id==='core'&&c.count===0)assert.ok(a.intra.every(t=>Math.abs(t-.65)<1e-8));
});

for(const c of cases)test('C1c contact cannot spawn inside player or consume a ready attack: '+c.label,()=>{
 const {r,e}=scenario(current,c);r.player.x=e.x;r.player.y=e.y+e.radius+r.player.radius;
 const count=e.attackCount;r.update(0);
 assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,0);
 assert.equal(e.attackCount,count);assert.equal(e.phase,'positioning');
 assert.equal(e.kind==='drill'?e.cooldown:e.phaseTime,0);
 r.player.y=e.y+175;r.update(0);
 assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,c.shots);
 for(const b of r.hostileProjectiles.pool.filter(b=>b.active))assert.ok(Math.hypot(b.x-r.player.x,b.y-r.player.y)>r.player.radius+b.spec.radius);
});

for(let heading=0;heading<8;heading++)test('C1c muzzle geometry at short/mid/long distances, direction '+heading,()=>{
 const angle=heading*Math.PI/4,owner={id:1,kind:'drill',active:true,x:225,y:390,radius:18};
 for(const distance of [65,150,280]){
  const p={x:owner.x+Math.cos(angle)*distance,y:owner.y+Math.sin(angle)*distance,radius:13};assert.equal(projectileMuzzleClear(owner,p),true);
  for(const pool of [new EnemyProjectiles(),new RiftProjectiles()]){
   if(pool instanceof RiftProjectiles)assert.equal(pool.emit(owner,[angle],{radius:6,speed:105,range:360}),true);else assert.equal(pool.fire(owner,angle),true);
   const b=pool.pool.find(b=>b.active);assert.equal(b.angle,angle);assert.equal(b.distance,0);
   assert.ok(Math.abs(Math.hypot(b.x-owner.x,b.y-owner.y)-(owner.radius+b.spec.radius+2))<1e-8);
   assert.ok(Math.hypot(b.x-p.x,b.y-p.y)>p.radius+b.spec.radius);
  }
 }
});

for(const c of cases)test('C1c pending attack retains its pattern when player reaches muzzle: '+c.label,()=>{
 const {r,e}=scenario(current,c);r.update(0);r.hostileProjectiles.clear();
 // Model admission retry of the already-selected pattern, with no new selection.
 e.phase='warning';e.phaseTime=0;const count=e.attackCount,pattern=e.pattern;
 r.player.x=e.x;r.player.y=e.y+e.radius+r.player.radius;r.update(0);
 assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,0);assert.equal(e.attackCount,count);assert.equal(e.pattern,pattern);
 r.player.y=e.y+175;r.update(0);assert.equal(r.hostileProjectiles.pool.filter(b=>b.active).length,c.shots);
});

test('C1c QA pilot only chooses normalized inputs; never changes HP, tuning or any run field',()=>{
 for(const weaponId of ['shotgun','smg','grisoux']){
  const r=new current.Run(()=>.5,{}, {zoneId:'depths',weaponId});r.spawn();
  const snapshot=()=>inspect(r,{depth:null,maxArrayLength:null,maxStringLength:null,sorted:true});
  for(let i=0;i<120;i++){const before=snapshot(),input=instantFirePilot(r);assert.equal(snapshot(),before);assert.ok(Math.hypot(input.x,input.y)<=1+1e-10);r.update(1/60,input);}
 }
});

for(const [type,table]of [['rift',RIFT_PATTERNS],['depths',DEPTHS_PATTERNS],['forge',FORGE_PATTERNS]])for(const [pattern,spec]of Object.entries(table))if(spec.ground||spec.seconds)test('C1c protected whitelist '+type+':'+pattern,()=>{
 const e={[type+'Type']:'fixture',pattern};assert.equal(isPureProjectile(e),false);
});
test('C1c all composite boss sequences, plans and ultimates retain telegraphs even with projectile labels',()=>{
 for(const marker of ['bossSequence','plan'])for(const pattern of ['ring','steam','rivets','fan','orb'])assert.equal(isPureProjectile({forgeType:'boiler',pattern,[marker]:{state:'warning'}}),false);
 for(const [bossId,pattern]of [['stationmaster','charge'],['locomotive','steam'],['switchman','rails'],['cager','front'],['compressor','pressure'],['firedamp','gas']])assert.equal(isPureProjectile({bossId,pattern,shaftType:['cager','compressor','firedamp'].includes(bossId)?bossId:undefined}),false);
});

test('C1c planted charge recovery does not advance on its selection tick (non-projectile regression)',()=>{
 const setups=[current,previous].map(api=>{const r=new api.Run(()=>.5,{}, {zoneId:'depths'}),e=api.createEnemy('blaster',1,225,300);e.warmup=0;e.phaseTime=0;r.enemies=[e];r.player.x=225;r.player.y=350;r.untilSpawn=999;r.weapon.cooldown=999;return {r,e};});
 for(let i=0;i<65;i++){
  for(const {r}of setups)r.update(1/60);
  assert.equal(setups[0].e.recoveryElapsed,setups[1].e.recoveryElapsed);
  assert.equal(setups[0].e.phaseTime,setups[1].e.phaseTime);
  assert.deepEqual(setups[0].r.shaftHazards.items,setups[1].r.shaftHazards.items);
 }
});
for(const zone of ['galleries','tracks','shaft59'])test('C1c current triple: two threats, three engaged, unchanged safety caps '+zone,()=>{
 const early=diagnoseTriple(zone),late=diagnoseTriple(zone,true);
 for(const m of [early,late]){assert.ok(m.dualSeconds>30);assert.ok(m.activeDualSeconds>5);assert.ok(m.tripleSeconds>0);assert.ok(m.tripleEngagedSeconds>30);assert.ok(m.longestCalm<1.25);assert.ok(m.maxMajor<=2&&m.maxBolts<=8&&m.maxZones<=3&&m.maxWagons<=2);assert.ok(Object.values(m.begins).every(n=>n>=10));}
 assert.ok(late.dualSeconds>early.dualSeconds);
});
test('C1c Zone2 wave15: exact six angles, current-tick Rivet B, no warning and no reservation leak',()=>{
 const c=cases.find(c=>c.label.startsWith('Zone 2')), {r,e}=scenario(current,c);r.update(0);const shots=r.hostileProjectiles.pool.filter(b=>b.active);
 assert.equal(shots.length,6);assert.equal(e.phase,'recovery');assert.equal(r.hostileProjectiles.reservations.size,0);
 shots.forEach((b,i)=>{assert.ok(Math.abs(b.angle-e.circleAngle-i*Math.PI/3)<1e-9);assert.equal(b.distance,0);assert.equal(rivetCompatible(b,e,'tracks'),true);});
});
test('C1c historic guards retain all C1b fingerprints with only exact reviewed C1c inverse patches',()=>{
 for(const file of Object.keys(JSON.parse(fs.readFileSync('production-v038c1c-reconciliation/notes/approved-delta.json'))))historicalSource('src/'+file);
 const initial=fs.readFileSync('production-v038c1c-reconciliation/before-tests/enemy-instant-fire.test.js');
 assert.deepEqual(beforeLampistTestAdapter(fs.readFileSync('tests/enemy-instant-fire.test.js')),initial,'all 51 C1b assertions retained; only exact C2 visual byte adapter allowed');
});
