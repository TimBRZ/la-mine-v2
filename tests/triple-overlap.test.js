import {PreInstantRun as HistoricalTripleRun} from './instant-fire-compat.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {Run} from './v026-before-src-snapshot/run.js';import {Run as PreviousRun} from './v024-pre-overlap-src-snapshot/run.js';
import {tripleOwners,updateTripleBoss} from './v026-before-src-snapshot/triple-pressure.js';import {diagnoseTriple} from './triple-overlap-metrics.mjs';
for(const zone of ['galleries','tracks','shaft59'])test('triple '+zone+' historical pre-instant overlaps two threats, sometimes three, with two major owners maximum',()=>{
 const early=diagnoseTriple(zone,false,false,HistoricalTripleRun),late=diagnoseTriple(zone,true,false,HistoricalTripleRun),old=diagnoseTriple(zone,false,true);
 assert.ok(early.dualSeconds>30&&early.dualSeconds>old.dualSeconds);assert.ok(early.tripleSeconds>1);assert.ok(late.dualSeconds>early.dualSeconds);
 for(const r of [early,late]){assert.ok(r.longestCalm<1.25);assert.ok(r.activeDualSeconds>5);assert.ok(r.maxMajor<=2);assert.ok(r.maxBolts<=8);assert.ok(r.maxZones<=3);assert.ok(r.maxWagons<=2);assert.ok(Object.values(r.begins).every(n=>n>=10));}
});
test('major reservation and lingering circle count even after the owner dies',()=>{
 const r=new Run(()=>.5,{}, {zoneId:'shaft59'});r.hostileProjectiles.reservations.set(9,6);assert.ok(tripleOwners(r,true).has(9));r.hostileProjectiles.reservations.clear();Object.assign(r.hostileProjectiles.pool[0],{active:true,owner:9,bossMajor:true});assert.ok(tripleOwners(r,true).has(9));
});
test('a queued Wagon summon keeps its major slot until end-of-frame emission',()=>{
 const r=new Run(()=>.5,{}, {zoneId:'tracks'});r.waveIndex=18;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';r.weapon.cooldown=999;
 const [a,b,c]=r.enemies;for(const e of r.enemies)e.warmup=0;
 a.phase='warning';a.pattern='wagon';a.tripleMajor=true;a.phaseTime=0;
 b.phase='warning';b.pattern='ram';b.tripleMajor=true;b.phaseTime=2;
 c.phase='positioning';c.phaseTime=0;c.attackCount=0;
 r.update(.01);assert.ok(r.enemies.some(e=>e.summoner===a.id));assert.equal(c.phase,'positioning');assert.equal(tripleOwners(r,true).size,2);
});
test('full major budget delays a third charge without consuming the attack or shortening its warning',()=>{
 const r=new Run(()=>.5,{}, {zoneId:'tracks'});r.waveIndex=18;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';const [a,b,c]=r.enemies;
 a.warmup=0;a.phase='positioning';a.phaseTime=0;a.attackCount=0;
 for(const e of [b,c]){e.warmup=0;e.phase='warning';e.phaseTime=1;e.tripleMajor=true;}
 updateTripleBoss(r,a,.01,[],{});assert.equal(a.phase,'positioning');assert.equal(a.attackCount,0);
 c.phase='recovery';c.hazards=[];updateTripleBoss(r,a,.2,[],{});assert.equal(a.phase,'warning');assert.equal(a.phaseTime,a.spec.warning);
});
test('a circle can overlap one ground owner; a third major owner waits',()=>{
 const r=new Run(()=>.5,{}, {zoneId:'shaft59'});r.waveIndex=18;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';r.weapon.cooldown=999;
 const [a,b,c]=r.enemies;for(const e of r.enemies){e.warmup=0;e.phaseTime=0;}a.attackCount=1;b.attackCount=1;c.attackCount=0;
 r.update(.01);assert.equal(r.shaftHazards.items.length,1);assert.equal(r.hostileProjectiles.reservations.size,1);assert.equal(c.phase,'positioning');assert.equal(tripleOwners(r,true).size,2);
});
test('second half is based on initial global health including bosses already killed',()=>{
 const r=new Run(()=>.5,{}, {zoneId:'shaft59'});r.waveIndex=18;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';const total=r.tripleStartingHealth;
 r.enemies[0].hp=0;r.enemies[1].hp=0;const b=r.enemies[2];b.warmup=0;b.phase='positioning';b.phaseTime=10;
 assert.ok(b.hp<total*.5);updateTripleBoss(r,b,.01,[],{});assert.ok(Math.abs(b.phaseTime-(10-.01/.55))<1e-9);
});
test('a projectile budget conflict extends the visible warning instead of dropping a final attack',()=>{
 const r=new Run(()=>.5,{}, {zoneId:'shaft59'});r.waveIndex=18;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';r.weapon.cooldown=999;
 const b=r.enemies[1];b.warmup=0;b.phase='warning';b.phaseTime=0;b.pattern='steam';b.fanAttack=true;b.attackAngle=0;
 for(const p of r.hostileProjectiles.pool)Object.assign(p,{active:true,owner:99,bossMajor:true,x:40,y:150,angle:0,distance:0,spec:{speed:0,range:400,radius:6,damage:.5}});
 const events=r.update(.01);assert.ok(events.some(e=>e.type==='boss-shot-delayed'));assert.equal(b.phase,'warning');assert.equal(b.phaseTime,.35);
 r.hostileProjectiles.clear();b.phaseTime=0;assert.ok(r.update(.01).some(e=>e.type==='enemy-shot'));
});
for(const zoneId of ['galleries','tracks','shaft59'])test('solo bosses and normal waves remain identical in '+zoneId,()=>{
 for(const wave of [1,5,10,15]){
  const a=new Run(()=>.5,{}, {zoneId}),b=new PreviousRun(()=>.5,{}, {zoneId});
  for(const r of [a,b])if(wave>1){r.waveIndex=wave-2;r.wavePhase='cleared';r.enterNextWave();}
  for(let i=0;i<900;i++){const input={x:Math.cos(i/110),y:Math.sin(i/110)};assert.deepEqual(a.update(1/60,input),b.update(1/60,input));}
  assert.deepEqual(JSON.parse(JSON.stringify(a.enemies)),JSON.parse(JSON.stringify(b.enemies)));assert.deepEqual(JSON.parse(JSON.stringify(a.player)),JSON.parse(JSON.stringify(b.player)));
 }
});
test('triple patch leaves every unrelated source file byte-identical',async()=>{
 const hashes=JSON.parse(await readFile(new URL('./v024-pre-overlap-hashes.json',import.meta.url)));for(const [file,hash]of Object.entries(hashes))if(!['run.js','bosses.js','shaft-actors.js'].includes(file))assert.equal(createHash('sha256').update(await readFile(new URL('./v026-before-src-snapshot/'+file,import.meta.url))).digest('hex'),hash,file);
});
