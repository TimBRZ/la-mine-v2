import test from 'node:test';
import assert from 'node:assert/strict';
import { RELIEF, HOUR_MS, reliefStock, reliefTime } from '../src/relief.js';
import { Wallet } from '../src/wallet.js';
import { LocalProfileStorage, STORAGE_KEY, MAX_RESOURCE } from '../src/local-profile-storage.js';
import { MenuState, FUTURE_SECTIONS } from '../src/menu/state.js';

const START = 1700000000000;
test('Relève is a menu destination; Talents and Caisses accessible and weapons persist',()=>{
  const menu=new MenuState();menu.selectWeapon('smg');
  assert.deepEqual(FUTURE_SECTIONS,[]);
  assert.equal(menu.navigate('relief'),true);assert.equal(menu.page,'relief');
  assert.equal(menu.navigate('crates'),true);
  assert.equal(menu.navigate('unknown'),false);
  menu.navigate('zones');assert.equal(menu.weaponId,'smg');
  menu.launch('galleries');assert.equal(menu.navigate('relief'),false);
});
function fixture(profile) {
  const data = new Map(profile ? [[STORAGE_KEY,JSON.stringify(profile)]] : []);
  const backend = { getItem:key=>data.get(key)??null, setItem:(key,value)=>data.set(key,value) };
  const storage = new LocalProfileStorage(backend);
  return { data,backend,storage,wallet:new Wallet(storage) };
}
for (const [hours,coal,iron] of [[1,12,1],[8,96,8],[24,288,24],[48,288,24]]) {
  test(`Relève after ${hours}h gives ${coal} coal and ${iron} iron only`,()=>{
    const stock=reliefStock(START,START+hours*HOUR_MS);
    assert.deepEqual(stock.gains,{coal,iron,diamond:0,token:0});
    assert.equal(stock.elapsedMs,Math.min(hours,24)*HOUR_MS);
    assert.equal(stock.full,hours>=24);
  });
}
test('integer gains, badge threshold and displayed 8h32 example',()=>{
  assert.equal(reliefStock(START,START+299999).available,false);
  assert.equal(reliefStock(START,START+300000).available,true);
  const stock=reliefStock(START,START+512*60000);
  assert.deepEqual(stock.gains,{coal:102,iron:8,diamond:0,token:0});
  assert.equal(reliefTime(stock.elapsedMs),'08 h 32');
  assert.equal(reliefTime(24*HOUR_MS),'24 h 00');
  assert.deepEqual(RELIEF,{coalPerHour:12,ironPerHour:1,maxHours:24});
});
test('first V0.10 opening extends the existing save without changing balances or levels',()=>{
  const old={version:1,wallet:{coal:93,iron:12,diamond:7,token:3},levels:{power:2,health:1,mechanics:3,mobility:0}};
  const {wallet,data}=fixture(old);
  assert.equal(wallet.reliefState(START).available,false);
  assert.deepEqual(wallet.snapshot.wallet,old.wallet);assert.deepEqual(wallet.snapshot.levels,old.levels);
  assert.deepEqual([...data.keys()],[STORAGE_KEY]);
  assert.equal(JSON.parse(data.get(STORAGE_KEY)).relief.startedAt,START);
});
test('pending gains stay outside wallet across reloads until explicit claim',()=>{
  const {wallet,storage}=fixture();wallet.reliefState(START);
  const reload=new Wallet(storage);
  assert.equal(reload.reliefState(START+8*HOUR_MS).gains.coal,96);
  assert.equal(reload.snapshot.wallet.coal,0);
  assert.equal(reload.snapshot.relief.startedAt,START);
});
test('claim saves balance and timestamp together; repeated click and reload cannot double-credit',()=>{
  const {wallet,storage}=fixture();wallet.reliefState(START);
  const now=START+8*HOUR_MS;
  assert.deepEqual(wallet.claimRelief(now),{ok:true,gains:{coal:96,iron:8,diamond:0,token:0}});
  assert.equal(wallet.claimRelief(now).reason,'empty');
  const reload=new Wallet(storage);assert.equal(reload.claimRelief(now).reason,'empty');
  assert.equal(reload.snapshot.wallet.coal,96);assert.equal(reload.snapshot.relief.startedAt,now);
  assert.equal(reload.reliefState(now+HOUR_MS).gains.coal,12);
  assert.equal(reload.snapshot.wallet.coal,96);
});
test('a second stale wallet sees an already saved claim',()=>{
  const {wallet,storage}=fixture();wallet.reliefState(START);
  const stale=new Wallet(storage),now=START+HOUR_MS;
  assert.equal(wallet.claimRelief(now).ok,true);
  assert.equal(stale.claimRelief(now).reason,'empty');
  assert.equal(stale.snapshot.wallet.coal,12);
});
test('failed atomic write keeps stock and wallet, retry succeeds only once',()=>{
  const {wallet,backend,storage}=fixture();wallet.reliefState(START);
  const write=backend.setItem;backend.setItem=()=>{throw Error('quota');};
  assert.equal(wallet.claimRelief(START+HOUR_MS).reason,'storage');
  assert.equal(wallet.snapshot.wallet.coal,0);
  assert.equal(wallet.snapshot.relief.startedAt,START);
  backend.setItem=write;
  const reload=new Wallet(storage);
  assert.equal(reload.claimRelief(START+HOUR_MS).ok,true);
  assert.equal(reload.snapshot.wallet.coal,12);
  assert.equal(reload.claimRelief(START+HOUR_MS).reason,'empty');
});
test('negative elapsed time, invalid dates and nonfinite clocks never mint resources',()=>{
  for(const time of [NaN,Infinity,-1,'yesterday',8640000000000001]) {
    assert.equal(reliefStock(time,START).available,false);
    const {wallet}=fixture();wallet.reliefState(START);
    assert.equal(wallet.claimRelief(time).reason,'clock');
    assert.equal(wallet.snapshot.relief.startedAt,START);
  }
  assert.equal(reliefStock(START,START-1).elapsedMs,0);
});
test('corrupt or future persisted timestamp restarts safely without losing the old wallet',()=>{
  for(const startedAt of ['bad',null,-3,START+HOUR_MS]) {
    const {wallet}=fixture({version:1,wallet:{coal:42,diamond:3,token:2},levels:{power:2},relief:{startedAt}});
    assert.equal(wallet.reliefState(START).available,false);
    assert.equal(wallet.snapshot.relief.startedAt,START);
    assert.equal(wallet.snapshot.wallet.coal,42);assert.equal(wallet.snapshot.wallet.token,2);
    assert.equal(wallet.reliefState(START+HOUR_MS).gains.coal,12);
  }
});
test('claims preserve rare resources, upgrade levels and exact workshop costs',()=>{
  const {wallet}=fixture({version:1,wallet:{coal:30,iron:0,diamond:2,token:3},levels:{}});
  wallet.reliefState(START);wallet.claimRelief(START+HOUR_MS);
  assert.equal(wallet.buy('power'),true);
  assert.deepEqual(wallet.snapshot.wallet,{coal:12,iron:1,diamond:2,token:3});
  assert.equal(wallet.snapshot.levels.power,1);
  assert.equal(wallet.snapshot.relief.startedAt,START+HOUR_MS);
});
test('resource safety ceiling is respected and a full wallet does not destroy pending stock',()=>{
  const {wallet}=fixture({version:1,wallet:{coal:MAX_RESOURCE,iron:MAX_RESOURCE},levels:{},relief:{startedAt:START}});
  assert.equal(wallet.claimRelief(START+24*HOUR_MS).reason,'full');
  assert.equal(wallet.snapshot.relief.startedAt,START);
});
test('a run reward write preserves the pending Relève timestamp and does not auto-credit it',()=>{
  const {wallet,storage}=fixture();wallet.reliefState(START);
  wallet.claim({status:'won',completedWaves:5},()=>.99);
  assert.deepEqual(wallet.snapshot.wallet,{coal:94,iron:8,diamond:0,token:0});
  const reload=new Wallet(storage);
  assert.equal(reload.snapshot.relief.startedAt,START);
  assert.equal(reload.reliefState(START+HOUR_MS).gains.coal,12);
});
test('a stale run or workshop writer cannot restore an already claimed period',()=>{
  const {wallet,storage}=fixture();wallet.reliefState(START);
  const other=new Wallet(storage);wallet.claimRelief(START+24*HOUR_MS);
  other.claim({status:'lost',completedWaves:1},()=>.99);
  assert.equal(other.snapshot.wallet.coal,298);
  assert.equal(other.snapshot.relief.startedAt,START+24*HOUR_MS);
  assert.equal(other.buy('power'),true);
  assert.equal(new Wallet(storage).claimRelief(START+24*HOUR_MS).reason,'empty');
});
