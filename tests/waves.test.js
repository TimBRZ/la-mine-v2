import {V021_FILES} from './v021-authorized-files.js';
import { VISUAL_FILES } from './v019-visual-files.js';
import { preserveWorkshopHint } from './v017-protected-copy.js';
import { TALENT_FILES } from './v016-authorized-files.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Run } from '../src/run.js';
import { WAVES, ARENA, waveProgress, BOSS_INTRO_SECONDS } from '../src/waves.js';
import { UpgradeFlow } from '../src/upgrades.js';
import { ArenaView } from '../src/arena-view.js';
import { finishFixtureRoom, enterFixtureRoom } from './run-helpers.js';

test('one arena persists across all twenty waves and replay uses the same arena definition', () => {
  const run = new Run();
  for (let n=1;n<=20;n++) {
    enterFixtureRoom(run,n);
    assert.equal(run.arena,ARENA);
    assert.equal(run.wave,WAVES[n-1]);
  }
  assert.equal(new Run().arena,ARENA);
});

test('tracker marks completed waves only after collection and identifies the final boss', () => {
  const run = new Run();
  assert.deepEqual(waveProgress(run).map(s=>s.state),WAVES.map((_,i)=>i?'future':'active'));
  assert.deepEqual(waveProgress(run).map(s=>s.boss),WAVES.map((_,i)=>(i+1)%5===0));
  for (let n=1;n<=20;n++) {
    enterFixtureRoom(run,n);
    assert.deepEqual(waveProgress(run).map(s=>s.state),WAVES.map((_,i)=>i<n-1?'done':i===n-1?'active':'future'));
    run.spawned=run.wave.total; run.enemies=[]; run.update(0);
    assert.equal(waveProgress(run)[n-1].state,'active');
    for(let i=0;i<200&&run.wavePhase==='collecting';i++)run.update(.04);
    assert.equal(waveProgress(run)[n-1].state,'done');
  }
  assert.equal(run.status,'won');
  assert.ok(waveProgress(run).every(s=>s.state==='done'));
});

test('wave 4 collection and choice must finish before a unique protected boss intro', () => {
  const run=new Run(), flow=new UpgradeFlow(run,()=>.3);
  enterFixtureRoom(run,4);
  finishFixtureRoom(run);
  for(let i=0;i<20;i++)run.update(.04);
  assert.equal(run.waveNumber,4); assert.equal(run.enterNextWave(),false);
  flow.afterCombat();
  const before=JSON.stringify(run);
  run.update(.04); assert.equal(JSON.stringify(run),before);
  flow.choose(flow.offered[0].id);
  const events=run.update(0);
  assert.equal(events.filter(e=>e.type==='wave-enter'&&e.boss).length,1);
  assert.equal(run.preparationRemaining,BOSS_INTRO_SECONDS);
  const boss=JSON.stringify(run.enemies[0]),hp=run.player.hp;
  for(let i=0;i<50;i++) {
    assert.deepEqual(run.update(.04),[]);
    assert.equal(JSON.stringify(run.enemies[0]),boss);
    assert.equal(run.player.hp,hp);
  }
  assert.equal(run.wavePhase,'preparing');
  for(let i=0;i<6;i++)run.update(.04);
  assert.equal(run.wavePhase,'combat');
});

test('next-wave preparation preserves safe position and delays all hostile engagement', () => {
  for(const [x,y] of [[60,150],[380,620],[225,400]]) {
    const run=new Run(); run.player.x=x;run.player.y=y;
    finishFixtureRoom(run);run.update(0);
    const hp=run.player.hp;
    for(let i=0;i<15;i++)run.update(.04,{x:1,y:1});
    assert.equal(run.player.hp,hp); assert.equal(run.enemies.length,0);
    assert.equal(run.player.x,x);assert.equal(run.player.y,y);
    while(run.wavePhase==='preparing')run.update(.04);
    assert.equal(run.spawn(),true);
    assert.ok(Math.hypot(run.enemies[0].x-x,run.enemies[0].y-y)>180);
    assert.ok(run.enemies[0].warmup>0);
  }
});

test('boss spawn recentres only an unsafe player and cannot heal or change equipped stats', () => {
  for(const [x,y,moves] of [[225,220,true],[65,620,false]]) {
    const run=new Run(()=>.5,{health:2},{weaponId:'smg'});
    enterFixtureRoom(run,4);finishFixtureRoom(run);
    const flow=new UpgradeFlow(run,()=>.3);flow.afterCombat();flow.choose(flow.offered[0].id);
    run.player.x=x;run.player.y=y;run.player.hp=2.25;
    const stats=[run.player.maxHealth,run.weapon.damage,run.weapon.definition.id,JSON.stringify(run.upgradeRanks)];
    run.update(0);
    assert.equal(run.player.hp,2.25);
    assert.deepEqual([run.player.maxHealth,run.weapon.damage,run.weapon.definition.id,JSON.stringify(run.upgradeRanks)],stats);
    assert.equal(run.player.x!==x||run.player.y!==y,moves);
    assert.ok(Math.hypot(run.enemies[0].x-run.player.x,run.enemies[0].y-run.player.y)>=200);
  }
});

test('arena drawing is constructed once: updates never create scenery, doors or a fade', () => {
  let creations=0;
  // Phaser-like fluent objects; all creation calls are counted separately.
  const make=()=>{creations++;const target={text:'',texture:{key:'arena-galleries'}};const obj=new Proxy(target,{get:(t,k)=>k in t?t[k]:(...args)=>{if(k==='setText')t.text=args[0];return obj;}});return obj;};
  const scene={textures:{exists:()=>false},make:{graphics:make},add:{image:make,graphics:make,text:make,rectangle:()=>{throw Error('No transition fade');}}};
  const view=new ArenaView(scene), count=creations, base=view.base.background;
  const run=new Run();
  for(let n=1;n<=20;n++){enterFixtureRoom(run,n);view.update(run);assert.equal(creations,count);assert.equal(view.base.background,base);}
  assert.equal('door' in view,false);assert.equal('fade' in view,false);
});

test('V0.11 protected systems stay unchanged apart from the V0.12 weapon rework', async () => {
  // V0.14 explicitly retunes boss/rat/drill behavior; difficulty-v014 covers it.
  const baseline=JSON.parse(await readFile(new URL('./v011-protected-baseline.json',import.meta.url)));
  for(const [file,hash] of Object.entries(baseline).filter(([file])=>!V021_FILES.includes(file)).filter(([file])=>!VISUAL_FILES.includes(file)).filter(([file])=>!TALENT_FILES.includes(file)).filter(([file])=>!['weapons.js','weapon.js','boss.js','enemies/rat.js','enemies/drill.js'].includes(file))) assert.equal(createHash('sha256').update(preserveWorkshopHint(file,await readFile(new URL('../src/'+file,import.meta.url)))).digest('hex'),hash,file);
});

test('current UI and zone wording use waves and no mandatory exit instruction', async () => {
  for(const file of ['src/ui.js','src/menu/state.js','src/weapon-overlay.js','index.html'].filter(f=>!V021_FILES.includes(f))) {
    const source=await readFile(new URL('../'+file,import.meta.url),'utf8');
    assert.doesNotMatch(source,/salle|rejoins la sortie/i,file);
  }
});
