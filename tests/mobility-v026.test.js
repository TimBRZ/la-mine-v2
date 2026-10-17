import {PreInstantRun as HistoricalTripleRun} from './instant-fire-compat.js';
import {historicalSource} from './instant-fire-compat.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {createBoss} from '../src/bosses.js';import {createEnemy} from '../src/enemies/registry.js';
import {MOBILITY} from '../src/enemy-mobility.js';import {ROOM} from '../src/config.js';
import {Run} from '../src/run.js';import {updateTripleBoss} from '../src/triple-pressure.js';
import {V026_FILES} from './v026-authorized-files.js';import {diagnoseTriple} from './triple-overlap-metrics.mjs';
const player={x:280,y:480,radius:13},bossIds=['haveuse','crachefer','effondreur','stationmaster','locomotive','switchman','cager','compressor','firedamp'];
const tick=(e,seconds,p=player,context={shaftAttack:()=>true})=>{const out=[];for(let i=0;i<Math.round(seconds*60);i++)e.update(1/60,p,out,context);return out;};
for(const id of bossIds)test('V026 '+id+' resumes movement within 0.45 s without consuming its attack clock',()=>{
 const e=createBoss(1,id,[200,260]);e.warmup=0;e.phase='recovery';e.phaseTime=3;
 tick(e,.2);assert.equal(e.x,200);assert.equal(e.y,260);
 tick(e,.3);assert.ok(Math.hypot(e.x-200,e.y-260)>1);assert.equal(e.phase,'recovery');assert.ok(Math.abs(e.phaseTime-2.5)<1e-8);
 const x=e.x,y=e.y;tick(e,.5);assert.ok(Math.hypot(e.x-x,e.y-y)>10);
});
for(const id of bossIds)test('V026 '+id+' repositions at ideal range and along room edges, but holds its warning',()=>{
 const e=createBoss(1,id,[200,300]);e.warmup=0;e.phase='positioning';if(id==='haveuse')e.phase='chase';e.phaseTime=10;
 const p={x:200,y:300+(MOBILITY[id].min+MOBILITY[id].max)/2};tick(e,.5,p);assert.ok(Math.hypot(e.x-200,e.y-300)>8);
 e.x=ROOM.left+e.radius;e.y=ROOM.top+e.radius;tick(e,.5,{x:0,y:0});assert.ok(e.x>ROOM.left+e.radius||e.y>ROOM.top+e.radius);
 e.phase='warning';e.phaseTime=2;const x=e.x,y=e.y;if(id==='crachefer'){const shots=tick(e,1/60);assert.equal(shots.length,1);assert.equal(e.phase,'recovery');}else tick(e,.5);assert.equal(e.x,x);assert.equal(e.y,y);
});
test('V026 waiting third major boss moves while the validated concurrency gate holds its attack',()=>{
 const r=new Run(()=>.5,{}, {zoneId:'shaft59'});r.waveIndex=18;r.wavePhase='cleared';r.enterNextWave();
 const [a,b,c]=r.enemies;for(const e of r.enemies)e.warmup=0;
 for(const e of [a,b]){e.phase='warning';e.phaseTime=10;e.tripleMajor=true;}
 c.phase='positioning';c.phaseTime=0;c.attackCount=0;const x=c.x,y=c.y;
 for(let i=0;i<60;i++)updateTripleBoss(r,c,1/60,[],{});
 assert.equal(c.phase,'positioning');assert.equal(c.attackCount,0);assert.ok(Math.hypot(c.x-x,c.y-y)>30);
});
test('V026 Foreur charges over 350 px on its locked line, stops at walls and recovers quickly',()=>{
 const e=createEnemy('deepdriller',1,200,160);e.warmup=0;e.phaseTime=0;tick(e,1/60,{x:200,y:470});assert.equal(e.phase,'warning');const a=e.chargeAngle,x=e.x,y=e.y;
 tick(e,1.25,{x:390,y:200});assert.equal(e.phase,'warning');assert.equal(e.x,x);assert.equal(e.y,y);
 while(e.phase==='warning')e.update(1/60,{x:390,y:200});assert.equal(e.chargeAngle,a);
 tick(e,1.1,{x:390,y:200});assert.ok(e.y-y>350);assert.ok(Math.abs(e.x-x)<2);
 tick(e,.7);assert.notEqual(e.phase,'charge');const endY=e.y;tick(e,.2);assert.notEqual(e.y,endY);
 e.phase='charge';e.chargeAngle=0;e.phaseTime=1;e.x=ROOM.right-e.radius-1;e.update(1/60,player);assert.equal(e.phase,'recovery');assert.equal(e.x,ROOM.right-e.radius);
});
test('V026 Sondeur flees, stays catchable, approaches far targets and only starts probes at range',()=>{
 const e=createEnemy('surveyor',1,220,300);e.warmup=0;e.phaseTime=0;tick(e,.3,{x:240,y:300});assert.ok(e.x<205);assert.equal(e.phase,'positioning');assert.ok(Math.hypot(e.x-220,e.y-300)<30);
 e.x=200;e.y=250;e.phaseTime=10;tick(e,.2,{x:400,y:580});assert.ok(e.y>250);
 e.x=200;e.y=250;e.phaseTime=0;tick(e,1/60,{x:200,y:465});assert.equal(e.phase,'warning');
 const x=e.x,y=e.y;e.phase='recovery';e.phaseTime=2;tick(e,.6,{x:220,y:280});assert.ok(Math.hypot(e.x-x,e.y-y)>20);
});
test('V026 Grisouteux is 25 percent faster with bounded proximity acceleration and unchanged blast warning',()=>{
 const e=createEnemy('gasminer',1,200,200);e.warmup=0;e.phaseTime=10;assert.equal(e.stats.speed,85);tick(e,.1,{x:200,y:550});assert.ok(Math.abs(e.y-208.5)<.01);
 e.x=200;e.y=200;tick(e,.1,{x:200,y:300});assert.ok(Math.abs(e.y-209.52)<.01);
 let spec;e.phaseTime=0;tick(e,1/60,{x:200,y:300},{shaftAttack:(_,points,s)=>{spec=s;return true;}});assert.equal(e.phase,'warning');assert.equal(e.phaseTime,1.5);assert.equal(spec.radius,62);assert.ok(150*spec.warning>62+13);assert.equal(e.stats.contactDamage,.5);
});
for(const id of ['drill','draisine'])test('V026 '+id+' moves after a short recovery, retains warning and emits its original volley',()=>{
 const e=createEnemy(id,1,200,250);e.warmup=0;e.phase='warning';e.phaseTime=.1;e.attackAngle=0;
 const events=tick(e,.2,{x:350,y:250});assert.equal(events.length,1);assert.equal(events[0].type,'enemy-shot');assert.equal(events[0].fan,true);
 const x=e.x,y=e.y;tick(e,.7,{x:350,y:250});assert.ok(Math.hypot(e.x-x,e.y-y)>10);assert.equal(e.fixedPosition,false);
});
test('V026 firedamp has the fastest inter-pattern movement of its trio',()=>{assert.ok(MOBILITY.firedamp.speed>createBoss(1,'cager',[200,200]).spec.speed);});
for(const zone of ['galleries','tracks','shaft59'])test('V026 '+zone+' historical pre-instant triple remains simultaneous and bounded after mobility',()=>{
 for(const half of [false,true]){const r=diagnoseTriple(zone,half,false,HistoricalTripleRun);assert.ok(r.dualSeconds>30,JSON.stringify(r));assert.ok(r.tripleSeconds>1);assert.ok(r.longestCalm<1.25);assert.ok(r.maxMajor<=2);assert.ok(r.maxBolts<=8);assert.ok(r.maxZones<=3);assert.ok(r.maxWagons<=2);}
});
test('V026 preserves all unrelated source bytes including attack concurrency, weapons, visual orientation, economy and saves',async()=>{
 const hashes=JSON.parse(await historicalSource(new URL('./v026-before-hashes.json',import.meta.url)));
 for(const [file,hash] of Object.entries(hashes))if(!V026_FILES.includes(file))assert.equal(createHash('sha256').update(await historicalSource(new URL('../src/'+file,import.meta.url))).digest('hex'),hash,file);
});
