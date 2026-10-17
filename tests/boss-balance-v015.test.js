import {V021_FILES} from './v021-authorized-files.js';
import { VISUAL_FILES } from './v019-visual-files.js';
import { RAIL_INTEGRATION_FILES } from './v018-rail-integration.js';
import { preserveWorkshopHint } from './v017-protected-copy.js';
import { TALENT_FILES } from './v016-authorized-files.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {BossFocus, BOSS_WEAPON_BALANCE, shotgunBossScale} from '../src/boss-weapon-balance.js';
import {Run} from '../src/run.js';
import {Projectiles} from '../src/combat.js';
import {WEAPONS} from '../src/weapons.js';
import {UPGRADES} from '../src/upgrades.js';
import {EPIC_UPGRADES} from '../src/epic-upgrades.js';
import {createEnemy} from '../src/enemies/registry.js';
import {simulate} from './v015-simulation.mjs';

test('V0.15 preserves every V0.14 wave, enemy, boss, reward, perk, shop and storage rule',async()=>{
  const baseline=JSON.parse(await readFile(new URL('./v015-protected-baseline.json',import.meta.url)));
  for(const [file,hash] of Object.entries(baseline).filter(([file])=>!V021_FILES.includes(file)).filter(([file])=>!VISUAL_FILES.includes(file)).filter(([file])=>!TALENT_FILES.includes(file) && !RAIL_INTEGRATION_FILES.includes(file)))assert.equal(createHash('sha256').update(preserveWorkshopHint(file,await readFile(new URL('../src/'+file,import.meta.url)))).digest('hex'),hash,file);
});
test('focus ramps on consecutive primary boss hits, never exceeds 25 percent',()=>{
  const f=new BossFocus(),boss={id:1,kind:'boss'},bonuses=[];
  for(let i=0;i<1000;i++)bonuses.push(f.hit(boss,f.epoch,true));
  assert.deepEqual(bonuses.slice(0,5),[0,.03,.06,.09,.12]);
  assert.equal(Math.max(...bonuses),.25);assert.equal(f.bonus,.25);assert.ok(f.hits<=9);
});
test('target switch or primary normal enemy resets focus; piercing followers cannot steal it',()=>{
  const f=new BossFocus(),boss={id:1,kind:'boss'};
  for(let i=0;i<20;i++)f.hit(boss,f.epoch,true);
  assert.equal(f.hit({id:2,kind:'boss'},f.epoch,false),0);assert.equal(f.targetId,1);assert.equal(f.bonus,.25);
  assert.equal(f.hit({id:2,kind:'boss'},f.epoch,true),0);assert.equal(f.targetId,2);assert.equal(f.bonus,.03);
  for(let i=0;i<10;i++)f.hit({id:2,kind:'boss'},f.epoch,true);
  assert.equal(f.hit({id:3,kind:'miner'},f.epoch,true),0);assert.equal(f.targetId,null);assert.equal(f.bonus,0);
});
test('brief dodge retains focus, prolonged movement invalidates even already flying bullets',()=>{
  const f=new BossFocus(),boss={id:1,kind:'boss'};
  for(let i=0;i<20;i++)f.hit(boss,f.epoch,true);
  f.update(.3,true);assert.equal(f.bonus,.25);f.update(.01,false);
  const oldEpoch=f.epoch;f.update(1.01,true);assert.equal(f.bonus,0);
  f.update(.01,false);assert.equal(f.hit(boss,oldEpoch,true),0);assert.equal(f.hits,0);
  assert.equal(f.hit(boss,f.epoch,true),0);assert.equal(f.hits,1);
});
test('wave/stance reset and a new weapon cannot inherit focus; heat still resets immediately',()=>{
  const r=new Run(()=>.5,{}, {weaponId:'smg'}),boss={id:1,kind:'boss',alive:true,active:true,x:200,y:400};
  for(let i=0;i<20;i++)r.weapon.focus.hit(boss,r.weapon.focus.epoch,true);
  r.weapon.overheat=true;r.weapon.heat=.4;
  r.weapon.update(.1,{x:100,y:400,angle:0},[boss],r.projectiles,[],()=>.5,false);
  assert.equal(r.weapon.heat,0);assert.equal(r.weapon.focus.bonus,.25);
  r.weapon.resetStance();assert.equal(r.weapon.focus.bonus,0);
  assert.equal(new Run(()=>.5,{}, {weaponId:'smg'}).weapon.focus.bonus,0);
});
const target=(kind,id=1,x=160)=>{const e=createEnemy('miner',id,x,400);e.kind=kind;e.warmup=0;e.hp=e.maxHealth=100000;return e;};
const apply=(run,ids)=>{for(const id of ids){[...UPGRADES,...EPIC_UPGRADES].find(p=>p.id===id).apply(run);run.upgradeRanks[id]=(run.upgradeRanks[id]||0)+1;}};
function volley(kind,ids=[],distance=60) {
  const r=new Run(()=>0),e=target(kind,1,100+distance);apply(r,ids);
  r.player.x=100;r.player.y=400;r.weapon.update(0,r.player,[e],r.projectiles,[],()=>0,true);
  r.projectiles.update(.2,[e],[],r.player);return 100000-e.hp;
}
test('ordinary enemy damage and the base shotgun volley have no boss-wide nerf',()=>{
  assert.equal(volley('boss'),volley('miner'));
  const base=volley('miner'),doubled=volley('miner',['double-cannon']);assert.equal(doubled,base*2);
  assert.ok(volley('boss',['sawn'])>volley('boss')*1.5);
});
test('Double Canon keeps both volleys but its extra boss volley has the localized weight',()=>{
  const normal=volley('boss');
  assert.ok(Math.abs(volley('boss',['double-cannon'])/normal-(1+BOSS_WEAPON_BALANCE.shotgun.extraVolleyWeight))<1e-9);
  const r=new Run(()=>0);apply(r,['double','double','double-cannon']);const e=target('boss');r.player.x=100;r.player.y=400;
  const events=[];r.weapon.update(0,r.player,[e],r.projectiles,events,()=>0,true);
  assert.equal(events.length,2);assert.equal(r.projectiles.pool.filter(p=>p.active).length,14);
  assert.equal(shotgunBossScale(7,7,false),1);
});
test('Point blank alone stays at +100 percent; only stacked boss proximity reaches the cap',()=>{
  const normal=volley('boss');assert.equal(volley('boss',['point-blank']),normal*2);
  const boss=volley('boss',['sawn','sawn','point-blank']);
  const mob=volley('miner',['sawn','sawn','point-blank']);
  assert.ok(Math.abs(boss/normal-2.2)<1e-9);assert.ok(Math.abs(mob/normal-3.2)<1e-9);
  assert.equal(volley('boss',['point-blank'],120),volley('boss',[],120));
});
test('focus enhances only the primary boss and preserves ordinary piercing damage exactly',()=>{
  const f=new BossFocus(),boss=target('boss',1,160),second=target('miner',2,210),third=target('miner',3,260);
  for(let i=0;i<20;i++)f.hit(boss,f.epoch,true);
  const pool=new Projectiles();pool.fire(100,400,0,0,WEAPONS.smg,{piercing:true,maxTargets:3,focus:f});
  pool.update(.3,[boss,second,third],[],{x:100,y:400});
  assert.deepEqual([boss,second,third].map(e=>Number((100000-e.hp).toFixed(3))),[6.25,4,3.2]);
  assert.equal(f.targetId,boss.id);
});
for(const weaponId of ['shotgun','smg'])test(`${weaponId}: every normal wave is identical to the frozen V0.14 simulation`,()=>{
  for(const encounter of [1,2,3,4,6,7,8,9,11,12,13,14,16,17,18,19]) {
    const before=simulate({weaponId,encounter,baseline:true}),after=simulate({weaponId,encounter});
    delete before.baseline;delete after.baseline;assert.deepEqual(after,before,'wave '+encounter);
  }
});

for(const weaponId of ['shotgun','smg'])for(const boss of [5,10,15,20])test('V0.15 '+weaponId+' beats boss '+boss+' without Atelier',()=>{
  const r=simulate({weaponId,boss});assert.equal(r.status,'won');assert.equal(r.badShots,0);
});
test('paired final encounters narrow the strong-build gap without changing boss stats',()=>{
  const sg={weaponId:'shotgun',boss:20,buildOverride:['trigger','trigger','buckshot','plates','boots','double-cannon']};
  const smg={weaponId:'smg',boss:20,buildOverride:['piercing','trigger','boots','trigger','plates','total-piercing']};
  const time=(o,baseline=false)=>simulate({...o,baseline}).bosses[0].combatSeconds;
  const a=time(sg,true),b=time(sg),c=time(smg,true),d=time(smg);
  assert.ok(b>a*1.2);assert.ok(d<c*.9);assert.ok(d/b<1.8);assert.ok(d/b<c/a);
});
