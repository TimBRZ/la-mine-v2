import {V021_FILES} from './v021-authorized-files.js';
import {withoutWagonTargeting} from './wagon-targeting-compat.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MenuState } from '../src/menu/state.js';
import { MainMenu } from '../src/menu/main-menu.js';
import { Run } from '../src/run.js';
import { TRACKS, ZONE_CONFIGS, zoneRewards } from '../src/zones.js';
import { sanitizeProgress, completeZone } from '../src/zone-progress.js';
import { Wallet } from '../src/wallet.js';
import { LocalProfileStorage, emptyProfile } from '../src/local-profile-storage.js';
import { HOUR_MS } from '../src/relief.js';

const today=new Date(2026,9,6,12).getTime();
const terminal=(zone,status='won',waves=20)=>({world:ZONE_CONFIGS[zone],status,completedWaves:waves,collectedRewards:{coal:108,iron:9,diamond:0,token:0}});
function fixture(profile=emptyProfile()) {
  let raw=JSON.stringify(profile),writes=0;
  const storage=new LocalProfileStorage({getItem:()=>raw,setItem:(_,value)=>{raw=value;writes++;}});
  return {storage,wallet:new Wallet(storage),writes:()=>writes};
}
const claim=(w,r,now=today)=>w.claim(r,()=>.99,{now,crateRandom:()=>.99});

test('menu unlock comes from a saved full galleries win, preserving selected weapon and launch latch',()=>{
  const {wallet,storage}=fixture(),state=new MenuState();state.selectWeapon('smg');
  let launches=[];const menu={state,wallet,hide:()=>{},onLaunch:(weaponId,zoneId)=>launches.push({weaponId,zoneId})};
  assert.equal(MainMenu.prototype.launch.call(menu,'tracks'),false);
  claim(wallet,terminal('galleries'));menu.wallet=new Wallet(storage);
  assert.equal(MainMenu.prototype.launch.call(menu,'tracks'),true);
  assert.equal(MainMenu.prototype.launch.call(menu,'tracks'),false);
  assert.deepEqual(launches,[{weaponId:'smg',zoneId:'tracks'}]);
  state.returnTo('home');assert.equal(state.zoneId,'tracks');assert.equal(state.weaponId,'smg');
  for(const id of ['shaft59','depths','grisou','unknown'])assert.equal(state.launch(id,menu.wallet.snapshot.progress),null);
});
for(const weaponId of ['shotgun','smg'])test('menu options launch complete tracks content and existing meta stats: '+weaponId,()=>{
  const state=new MenuState();state.selectWeapon(weaponId);
  const options=state.launch('tracks',{galleriesCompleted:true});
  const run=new Run(()=>.5,{power:2,health:2,mechanics:2,mobility:2},{...options,talents:['magnet','last-breath'],rewardRandom:()=>.99});
  assert.equal(run.world,TRACKS);assert.equal(run.weapon.definition.id,weaponId);assert.equal(run.world.waves.length,20);
  assert.deepEqual(run.world.waves.filter(w=>w.boss).map(w=>w.bosses),[['stationmaster'],['locomotive'],['switchman'],['stationmaster','locomotive','switchman']]);
  assert.ok(run.world.enemies.includes('wagon')&&run.world.enemies.includes('draisine'));
  assert.ok(run.player.maxHealth>5);assert.ok(run.talents.has('magnet'));assert.ok(run.talents.has('last-breath'));
  assert.deepEqual(run.rewardPlans,zoneRewards(TRACKS,()=>.99));
});
test('completion, unique diamond and normal gains commit together and survive stale wallets and reload',()=>{
  const f=fixture();claim(f.wallet,terminal('galleries'));const stale=new Wallet(f.storage);
  const r=terminal('tracks'),before=f.writes();assert.equal(claim(f.wallet,r).diamond,1);assert.equal(f.writes(),before+1);
  assert.deepEqual(f.wallet.snapshot.progress,{shaftUnlocked:true,shaftCompleted:false,shaftFirstVictoryClaimed:false,galleriesCompleted:true,tracksUnlocked:true,tracksCompleted:true,tracksFirstVictoryClaimed:true});
  assert.equal(claim(stale,terminal('tracks')).diamond,0);
  const reloaded=new Wallet(f.storage);assert.equal(reloaded.snapshot.wallet.diamond,1);assert.equal(reloaded.snapshot.wallet.coal,324);
  assert.equal(claim(reloaded,terminal('tracks')).diamond,0);assert.equal(reloaded.snapshot.wallet.diamond,1);
});
test('old completed tracks saves migrate without a second first-win diamond',()=>{
  const p=sanitizeProgress({tracksCompleted:true});assert.equal(p.tracksFirstVictoryClaimed,true);
  assert.equal(completeZone('tracks',p).firstDiamond,0);
  assert.equal(completeZone('tracks',{galleriesCompleted:true,tracksFirstVictoryClaimed:true}).firstDiamond,0);
});
test('defeat and incomplete victory cannot unlock or claim the unique award',()=>{
  const {wallet}=fixture();claim(wallet,terminal('galleries','lost',19));assert.equal(wallet.snapshot.progress,undefined);
  claim(wallet,terminal('galleries'));const before=wallet.snapshot.progress;
  for(const r of [terminal('tracks','lost',19),terminal('tracks','won',19)])assert.equal(claim(wallet,r).diamond,0);
  assert.deepEqual(wallet.snapshot.progress,before);assert.equal(wallet.snapshot.wallet.coal,432);
});
for(const order of [['galleries','tracks'],['tracks','galleries']])test('one daily crate shared across zones: '+order.join(' then '),()=>{
  const {wallet,storage}=fixture({...emptyProfile(),progress:{galleriesCompleted:true}});
  const first=terminal(order[0]);claim(wallet,first);assert.equal(wallet.crateClaims.get(first).daily,1);
  const next=new Wallet(storage),second=terminal(order[1]);claim(next,second);assert.equal(next.crateClaims.get(second).daily,0);assert.equal(next.crateCount,1);
  const tomorrow=terminal('tracks');claim(next,tomorrow,today+24*HOUR_MS);assert.equal(next.crateClaims.get(tomorrow).daily,1);assert.equal(next.crateCount,2);
});
test('legacy meta survives zone progression, Atelier, talents, Relève and crate actions',()=>{
  const old={...emptyProfile(),wallet:{coal:5000,iron:500,diamond:10,token:7},levels:{power:1,health:1,mechanics:1,mobility:1},talents:['magnet'],relief:{startedAt:today-8*HOUR_MS},crates:{count:2,lastDaily:null}};
  const {wallet,storage}=fixture(old);claim(wallet,terminal('galleries'));claim(wallet,terminal('tracks'));
  assert.deepEqual(wallet.snapshot.levels,old.levels);assert.deepEqual(wallet.snapshot.talents,old.talents);assert.deepEqual(wallet.snapshot.relief,old.relief);
  const progress=wallet.snapshot.progress;assert.equal(wallet.buy('power'),true);assert.equal(wallet.buyTalent('cold-blood'),true);
  assert.equal(wallet.claimRelief(today).ok,true);assert.equal(wallet.openCrate(()=>0).ok,true);
  const saved=new Wallet(storage).snapshot;assert.deepEqual(saved.progress,progress);assert.equal(saved.levels.power,2);assert.ok(saved.talents.includes('cold-blood'));assert.equal(saved.wallet.token,7);
});
test('unavailable storage keeps completion and gains together in memory without a repeat award',()=>{
  const wallet=new Wallet(new LocalProfileStorage(null));wallet.profile.progress={galleriesCompleted:true};
  assert.equal(claim(wallet,terminal('tracks')).diamond,1);assert.equal(wallet.saved,false);
  assert.equal(claim(wallet,terminal('tracks')).diamond,0);assert.equal(wallet.snapshot.wallet.diamond,1);
});
test('validated step 4 rules remain byte-identical outside authorized wagon targeting',async()=>{
  for(const file of ['boss.js','bosses.js','boss-catalog.js','rail-bosses.js','rail-boss-encounter.js','tracks-waves.js','world.js','zones.js','weapons.js','weapon.js','combat.js','rewards.js','wallet.js','crates.js','relief.js','talents.js','permanent-upgrades.js','upgrades.js','epic-upgrades.js','enemies/registry.js','enemies/wagon.js','enemies/draisine.js'].filter(f=>!V021_FILES.includes(f))) {
    assert.deepEqual(withoutWagonTargeting(file,await readFile(new URL('../src/'+file,import.meta.url))),await readFile(new URL('./v018-step4-src-snapshot/'+file,import.meta.url)),file);
  }
});
test('package, server, document and visible UI identify current V0.33 consistently',async()=>{
  const read=f=>readFile(new URL('../'+f,import.meta.url),'utf8');assert.equal(JSON.parse(await read('package.json')).version,'0.33.0');
  const lock=JSON.parse(await read('package-lock.json'));assert.equal(lock.version,'0.33.0');assert.equal(lock.packages[''].version,'0.33.0');
  for(const f of ['server.mjs','index.html','src/menu/main-menu.js','README.md'])assert.match(await read(f),/V0\.33/);
  for(const f of ['server.mjs','index.html','src/menu/main-menu.js'].filter(f=>!V021_FILES.includes(f)))assert.doesNotMatch(await read(f),/V0\.(14|17|18|19|20)/);
});
