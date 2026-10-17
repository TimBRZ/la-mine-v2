import {UpgradeFlow as LegacyFlow} from './v021-final-src-snapshot/upgrades.js';
// Exact historical replay keeps its original hostile shots; other tests use live Run.
import {Run as LegacyRun} from './legacy-volley-run.js';
import {V021_FILES} from './v021-authorized-files.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {TALENTS,RunTalents,sanitizeTalents} from '../src/talents.js';
import {Wallet} from '../src/wallet.js';
import {LocalProfileStorage,emptyProfile,sanitizeProfile} from '../src/local-profile-storage.js';
import {Run} from '../src/run.js';
import {Run as OldRun} from './v015-src-snapshot/run.js';
import {UpgradeFlow,drawUpgrades} from '../src/upgrades.js';
import {UpgradeFlow as OldFlow} from './v015-src-snapshot/upgrades.js';
import {MenuState} from '../src/menu/state.js';
import {steer} from './run-helpers.js';
const rng=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const ids=TALENTS.map(t=>t.id);
const fixture=()=>{let raw=JSON.stringify({...emptyProfile(),wallet:{coal:5000,iron:500,diamond:10,token:7},relief:{startedAt:1700000000000}});const backend={getItem:()=>raw,setItem:(_,v)=>{raw=v;}};return {backend,wallet:new Wallet(new LocalProfileStorage(backend))};};
test('eight stable single-rank talents, centralized positive costs and no Grisou token',()=>{
 assert.equal(TALENTS.length,8);assert.equal(new Set(ids).size,8);
 for(const t of TALENTS){assert.ok(t.name&&t.description);assert.equal(t.cost.token,undefined);for(const n of Object.values(t.cost))assert.ok(Number.isInteger(n)&&n>0);}
 assert.deepEqual(sanitizeTalents(['unknown','magnet','magnet',true]),['magnet']);
 const menu=new MenuState();assert.equal(menu.navigate('talents'),true);
});
test('old profiles migrate without losing wallet, Atelier or Relève; corrupt talent entries are ignored',()=>{
 const old={...emptyProfile(),wallet:{coal:12,iron:3,diamond:1,token:9},relief:{startedAt:1700000000000}};
 assert.deepEqual(sanitizeProfile(old),old);assert.deepEqual(sanitizeProfile({...old,talents:['magnet','bad','magnet']}).talents,['magnet']);
});
for(const t of TALENTS)test('atomic purchase and reload: '+t.id,()=>{
 const {wallet,backend}=fixture(),before=wallet.snapshot;
 assert.equal(wallet.buyTalent(t.id),true);assert.equal(wallet.buyTalent(t.id),false);
 const next=new Wallet(new LocalProfileStorage(backend));assert.deepEqual(next.snapshot.talents,[t.id]);
 for(const k of ['coal','iron','diamond','token'])assert.equal(next.snapshot.wallet[k],before.wallet[k]-(t.cost[k]||0));
 assert.deepEqual(next.snapshot.levels,before.levels);assert.deepEqual(next.snapshot.relief,before.relief);
});
test('insufficient funds, unknown ID and write failure do not debit or unlock',()=>{
 const {wallet,backend}=fixture();assert.equal(wallet.buyTalent('bad'),false);
 const before=wallet.snapshot;backend.setItem=()=>{throw Error('blocked');};assert.equal(wallet.buyTalent('magnet'),false);assert.deepEqual(wallet.snapshot,before);
 const poor=new Wallet(new LocalProfileStorage({getItem:()=>null,setItem:()=>{}}));assert.equal(poor.buyTalent('magnet'),false);
});
test('stale wallet cannot repurchase a talent or restore its spent resources',()=>{
 const {wallet,backend}=fixture(),stale=new Wallet(new LocalProfileStorage(backend));wallet.buyTalent('magnet');assert.equal(stale.buyTalent('magnet'),false);assert.deepEqual(stale.snapshot,wallet.snapshot);
});
test('new run snapshots unlocks, existing run stays unchanged and charges reset',()=>{
 const {wallet}=fixture(),old=new Run(rng(1),{}, {talents:wallet.snapshot.talents});wallet.buyTalent('last-breath');
 const next=new Run(rng(1),{}, {talents:wallet.snapshot.talents});assert.equal(old.talents.has('last-breath'),false);assert.equal(next.talents.has('last-breath'),true);next.talents.revived=true;assert.equal(new Run(rng(1),{}, {talents:wallet.snapshot.talents}).talents.revived,false);
});
test('Good Start pauses for a second real choice, grants exactly one extra perk',()=>{
 const r=new Run(rng(1),{}, {talents:['good-start']}),f=new UpgradeFlow(r,rng(2));f.open();f.choose(f.offered[0].id);
 assert.equal(r.paused,true);assert.equal(f.afterCombat(),true);assert.equal(f.offered.length,3);f.choose(f.offered[0].id);assert.equal(f.count,2);assert.equal(r.paused,false);assert.equal(f.afterCombat(),false);assert.equal(f.count,2);
});
test('reroll consumes once, changes the set when alternatives exist, grants no perk',()=>{
 const r=new Run(rng(1),{}, {talents:['porion-eye']}),f=new UpgradeFlow(r,rng(3));f.open();const before=f.offered.map(p=>p.id).sort();assert.equal(f.reroll(),true);assert.notDeepEqual(f.offered.map(p=>p.id).sort(),before);assert.equal(f.reroll(),false);assert.equal(f.count,0);assert.deepEqual(r.upgradeRanks,{});assert.equal(r.paused,true);
});
test('epic choice has all three epics: cannot consume a useless identical reroll',()=>{
 const r=new Run(rng(1),{}, {talents:['porion-eye']}),f=new UpgradeFlow(r,rng(3));r.waveIndex=18;r.choicePending=true;f.open();assert.ok(f.offered.every(p=>p.epic));assert.equal(f.reroll(),false);assert.equal(r.talents.rerolled,false);
});
for(const wave of [5,10,15,20,4])test('First Aid completion at wave '+wave,()=>{
 const r=new Run(rng(1),{}, {talents:['first-aid']});r.waveIndex=wave-1;r.wavePhase='collecting';r.loot.phase='done';r.player.hp=2;const events=r.update(0);assert.equal(r.player.hp,[5,10,15].includes(wave)?2.5:2);r.talents.complete(r,events);assert.equal(r.player.hp,[5,10,15].includes(wave)?2.5:2);
});
test('healing respects Atelier max HP and never exceeds it',()=>{
 const r=new Run(rng(1),{health:5},{talents:['first-aid']});r.waveIndex=4;r.player.hp=r.player.maxHealth-.1;r.talents.complete(r,[]);assert.equal(r.player.hp,r.player.maxHealth);
});
test('Prospector is a once-per-completed-wave extra; physical budget and rares unchanged',()=>{
 const r=new Run(rng(1),{}, {talents:['prospector'],talentRandom:()=>0}),plan={...r.loot.plan};r.wavePhase='collecting';r.loot.phase='done';r.update(0);r.talents.complete(r,[]);assert.deepEqual(r.collectedRewards,{coal:0,iron:1,diamond:0,token:0});assert.deepEqual(r.loot.plan,plan);
 const no=new Run(rng(1),{}, {talents:['prospector'],talentRandom:()=>.15});no.talents.complete(no,[]);assert.equal(no.collectedRewards.iron,0);
});
test('magnet extends pickup and reduces collection time without minting value',()=>{
 const plain=new Run(rng(1),{}, {rewardRandom:()=>.99}),plus=new Run(rng(1),{}, {talents:['magnet'],rewardRandom:()=>.99});
 for(const r of [plain,plus]){r.loot.spawn('coal',1,100,300);const d=r.loot.pool[0];d.x=r.player.x+25;d.y=r.player.y;r.loot.update(0,r.player,[]);}
 assert.equal(plain.loot.collected.coal,0);assert.equal(plus.loot.collected.coal,1);
 const duration=talents=>{const r=new Run(rng(1),{}, {talents,rewardRandom:()=>.99});r.loot.beginCollection(r.player);for(const d of r.loot.pool.filter(d=>d.active)){d.x=60;d.y=160;}let n=0;for(;r.loot.phase!=='done';n++)r.loot.update(1/60,r.player,[]);return {n,value:r.loot.collected};};
 const a=duration([]),b=duration(['magnet']);assert.ok(b.n<a.n);assert.deepEqual(b.value,a.value);
});
for(const weaponId of ['shotgun','smg'])test('Cold Blood changes settling only for '+weaponId,()=>{
 const a=new Run(rng(1),{}, {weaponId}),b=new Run(rng(1),{}, {weaponId,talents:['cold-blood']});assert.equal(a.weapon.interval,b.weapon.interval);assert.equal(a.player.speed,b.player.speed);assert.equal(a.fireControl.update(.05,a.player,{x:0,y:0}),false);assert.equal(b.fireControl.update(.05,b.player,{x:0,y:0}),true);b.player.vx=1;assert.equal(b.fireControl.update(.1,b.player,{x:0,y:0}),false);
});
test('Last Breath rescues one lethal hit, retains ordinary grace, second death loses',()=>{
 const r=new Run(rng(1),{}, {talents:['last-breath']}),e=[];r.player.hp=.5;r.damagePlayer(5,e);assert.equal(r.player.hp,1);assert.equal(r.talents.revived,true);assert.ok(e.some(e=>e.type==='talent'));const grace=r.player.invulnerable;
 const plain=new Run();plain.damagePlayer(1,[]);assert.equal(grace,plain.player.invulnerable);r.player.invulnerable=0;r.damagePlayer(5,[]);r.update(0);assert.equal(r.status,'lost');
});
test('Lucky Hand reduces ranked appearance across many seeds, never violates caps',()=>{
 let base=0,lucky=0;for(let i=1;i<=3000;i++){for(const talent of [false,true]){const r=new Run(rng(1),{}, {talents:talent?['lucky-hand']:[]});r.upgradeRanks.trigger=1;const cards=drawUpgrades(r,rng(i));if(cards.some(p=>p.id==='trigger'))talent?lucky++:base++;assert.ok(cards.every(p=>p.rank<=p.maxRanks));}}assert.ok(lucky<base*.9,{base,lucky});assert.ok(lucky>0);
});
test('no talents replays complete V0.15 run exactly including boss timings and rewards',()=>{
 const UpgradeFlow=LegacyFlow;
 const play=(R,F)=>{const random=rng(1),r=new R(random,{}, {rewardRandom:()=>.99}),f=new F(r,random),priority=['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn'];const choose=()=>f.choose(priority.find(id=>f.offered.some(p=>p.id===id)));f.open();choose();for(let i=0;i<40000&&r.status==='playing';i++){r.update(1/60,steer(r));if(f.afterCombat())choose();}return {status:r.status,elapsed:r.elapsed,hp:r.player.hp,perks:r.upgradeRanks,rewards:r.collectedRewards,kills:r.kills};};
 const a=play(OldRun,OldFlow),b=play(LegacyRun,UpgradeFlow);assert.equal(b.status,'won');assert.deepEqual(b,a);
});
test('V0.16 preserves combat balance, boss AI, waves, Atelier costs, Relève and resources byte for byte',async()=>{
 for(const file of ['boss-weapon-balance.js','combat.js','weapon.js','world.js','difficulty.js','boss.js','enemies/rat.js','enemies/drill.js','enemies/miner.js','permanent-upgrades.js','relief.js','resources.js','epic-upgrades.js'].filter(f=>!V021_FILES.includes(f)))assert.deepEqual(await readFile(new URL('../src/'+file,import.meta.url)),await readFile(new URL('./v015-src-snapshot/'+file,import.meta.url)),file);
});

for(const weaponId of ['shotgun','smg'])test('all eight talents complete real '+weaponId+' combat without overrides',async()=>{
 const {simulate}=await import('./v016-simulation.mjs');
 const priority=weaponId==='smg'?['critical-heat','trigger','heat','plates','boots','piercing','magazine']:undefined;
 const r=simulate({weaponId,seed:7,talents:ids,priority});
 assert.equal(r.status,'won');assert.equal(r.kills,235);assert.equal(r.badShots,0);assert.equal(Object.values(r.perks).reduce((a,b)=>a+b,0),7);
 assert.ok(r.bosses.at(-1).combatSeconds>25);assert.equal(r.rewards.coal,94);assert.ok(r.rewards.iron>=8&&r.rewards.iron<=28);assert.equal(r.rewards.token,0);
});
test('talent unlocks survive Atelier purchase, Relève claim and result credit',()=>{
 const {wallet,backend}=fixture();wallet.buyTalent('magnet');wallet.buy('power');assert.equal(wallet.claimRelief(1700003600000).ok,true);
 const r=new Run();r.status='lost';wallet.claim(r,()=>.99);
 const reloaded=new Wallet(new LocalProfileStorage(backend));assert.deepEqual(reloaded.snapshot.talents,['magnet']);assert.equal(reloaded.snapshot.levels.power,1);assert.equal(reloaded.snapshot.relief.startedAt,1700003600000);
});
