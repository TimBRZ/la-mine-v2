import {historicalSource} from './instant-fire-compat.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {CONTRACTS,CONTRACT_REWARDS,contractById,contractDates,cycleContracts,sanitizeContracts,advanceContracts,contractReady,contractBadge} from '../src/contracts.js';
import {ContractTracker} from '../src/contract-tracker.js';import {Wallet} from '../src/wallet.js';import {LocalProfileStorage,emptyProfile,sanitizeProfile,MAX_RESOURCE} from '../src/local-profile-storage.js';
import {MenuState} from '../src/menu/state.js';import {Run} from '../src/run.js';import {UpgradeFlow} from '../src/upgrades.js';import {energyPilot} from './v027-pilot.js';import {buildPriority} from './v027-simulation.mjs';import {V028_FILES} from './v028-authorized-files.js';
const now=new Date(2026,9,8,12).getTime(),day=n=>new Date(2026,9,8+n,12).getTime();
function memory(profile=emptyProfile()){let raw=JSON.stringify(profile);return {fail:false,getItem:()=>raw,setItem(_k,v){if(this.fail)throw Error('quota');raw=v;}};}
function fixture(id,at=now){const c=contractById(id),state=cycleContracts(null,at,true),cycle=state[c.period];cycle.rows[cycle.rows.findIndex(r=>contractById(r.id).group===c.group)]={id,value:0,claimed:false,weapons:[]};return state;}
function ready(period='daily',at=now){const state=cycleContracts(null,at,true);for(const row of state[period].rows){const c=contractById(row.id);row.value=c.target;if(c.metric==='wonWeapon')row.weapons=['shotgun','smg','grisoux'].slice(0,c.target);}return state;}
function row(state,id){return state[contractById(id).period].rows.find(r=>r.id===id);}
test('V028 three daily + three weekly contracts and C2G remains a future view',async()=>{
 const state=cycleContracts(null,now);for(const c of Object.values(state))assert.equal(c.rows.length,3);
 const menu=new MenuState();assert.equal(menu.navigate('contracts'),true);
 const view=await readFile(new URL('../src/menu/contracts-view.js',import.meta.url),'utf8');assert.match(view,/CONTRATS C2G/);assert.match(view,/BIENTÔT/);assert.doesNotMatch(view,/fetch\(|https?:/);
});
test('V028 local dates roll at midnight and Monday, including year/month boundaries',()=>{
 assert.equal(contractDates(new Date(2026,9,11,23,59).getTime()).weekly,'2026-10-05');assert.equal(contractDates(new Date(2026,9,12,0).getTime()).weekly,'2026-10-12');
 assert.equal(contractDates(new Date(2027,0,1).getTime()).weekly,'2026-12-28');
 assert.equal(contractDates(new Date(2026,9,8,23,59).getTime()).daily,'2026-10-08');assert.equal(contractDates(new Date(2026,9,9).getTime()).daily,'2026-10-09');assert.equal(contractDates(NaN),null);
});
test('V028 daily/weekly rotation avoids identical consecutive sets and duplicate families for 400 days',()=>{
 let lastDaily,lastWeek,lastWeekKey;for(let i=0;i<400;i++){const state=cycleContracts(null,day(i),true);for(const c of Object.values(state))assert.equal(new Set(c.rows.map(r=>contractById(r.id).group)).size,3);const daily=state.daily.rows.map(r=>r.id).join();assert.notEqual(daily,lastDaily);lastDaily=daily;if(state.weekly.key!==lastWeekKey){const weekly=state.weekly.rows.map(r=>r.id).join();assert.notEqual(weekly,lastWeek);lastWeek=weekly;lastWeekKey=state.weekly.key;}}
});
test('V028 locked Faille never selected; existing cycle stays stable after unlocking',()=>{
 for(let i=0;i<100;i++)assert.ok(!cycleContracts(null,day(i*7),false).weekly.rows.some(r=>r.id==='w-rift'));
 const state=cycleContracts(null,now,false);assert.deepEqual(cycleContracts(state,now,true),state);
});
test('V028 all count objectives advance and clamp without automatically claiming',()=>{
 for(const c of CONTRACTS.filter(c=>!['weaponRun','wonWeapon','wave'].includes(c.metric))){let state=fixture(c.id);state=advanceContracts(state,{[c.metric]:c.target+20},now,true);assert.equal(row(state,c.id).value,c.target,c.id);assert.equal(row(state,c.id).claimed,false);assert.equal(contractReady(row(state,c.id)),true);}
});
test('V028 wave objectives take the maximum, not a sum',()=>{let state=fixture('d-w15');for(const wave of [5,5,3,10])state=advanceContracts(state,{wave},now);assert.equal(row(state,'d-w15').value,10);state=advanceContracts(state,{wave:20},now);assert.equal(row(state,'d-w15').value,15);});
test('V028 weapon runs match the actual weapon and winning diversity is unique',()=>{
 let state=fixture('d-smg');state=advanceContracts(state,{weaponRun:'shotgun'},now);assert.equal(row(state,'d-smg').value,0);state=advanceContracts(state,{weaponRun:'smg'},now);assert.equal(row(state,'d-smg').value,1);
 state=fixture('w-arms3');for(const weapon of ['shotgun','shotgun','laser','smg'])state=advanceContracts(state,{wonWeapon:weapon},now);assert.equal(row(state,'w-arms3').value,2);state=advanceContracts(state,{wonWeapon:'grisoux'},now);assert.equal(row(state,'w-arms3').value,3);
});
test('V028 rollover clears progress/unclaimed rewards only in the expired cycle',()=>{
 const state=ready();state.weekly.rows[0].value=1;const next=cycleContracts(state,day(1),true);assert.ok(next.daily.rows.every(r=>r.value===0&&!r.claimed));assert.deepEqual(next.weekly,state.weekly);const week=cycleContracts(state,day(4),true);assert.equal(week.weekly.key,'2026-10-12');assert.ok(week.weekly.rows.every(r=>r.value===0));
});
test('V028 backwards time never reopens old claims or credits future cycles',()=>{const state=ready();state.daily.bonusClaimed=true;assert.deepEqual(cycleContracts(state,day(-8),true),state);assert.deepEqual(advanceContracts(state,{kills:1000},day(-8),true),state);});
test('V028 old profiles stay compatible, unrelated fields survive contract writes',()=>{
 const profile={...emptyProfile(),wallet:{coal:10,iron:2,diamond:3,token:4},levels:{power:1,health:2,mechanics:0,mobility:0},relief:{startedAt:now},talents:['porion-eye'],crates:{count:2,lastDaily:'2026-10-08'},progress:{shaftCompleted:true}};
 const old=sanitizeProfile(profile),w=new Wallet(new LocalProfileStorage(memory(profile)));w.contractState(now);w.recordContracts({kills:20},now);const next=w.snapshot;delete next.contracts;assert.deepEqual(next,old);assert.equal(emptyProfile().contracts,undefined);
});
test('V028 invalid saved contracts are bounded and cannot inject rewards',()=>{
 const state=ready();state.daily.rows[0].value=Infinity;state.weekly.rows[0].id='invented';const clean=sanitizeContracts(state);assert.equal(clean.daily.rows[0].value,0);assert.equal(clean.daily.rows[0].claimed,false);assert.equal(clean.weekly,undefined);assert.deepEqual(sanitizeContracts({daily:{key:'2026-02-31',rows:[]}}),{});
});
test('V028 completed contracts do not credit anything until explicit claim',()=>{
 const w=new Wallet(new LocalProfileStorage(memory({...emptyProfile(),contracts:fixture('d-k75')})));w.recordContracts({kills:75},now);assert.equal(w.snapshot.wallet.coal,0);assert.ok(contractBadge(w.snapshot.contracts)>0);const cycle=w.snapshot.contracts.daily;assert.equal(w.claimContract('daily',cycle.key,'d-k75',now).ok,true);assert.equal(w.snapshot.wallet.coal,10);assert.equal(w.claimContract('daily',cycle.key,'d-k75',now).ok,false);
});
test('V028 reload and separate wallet instances prevent repeated claims',()=>{
 const backend=memory({...emptyProfile(),contracts:ready()}),a=new Wallet(new LocalProfileStorage(backend)),b=new Wallet(new LocalProfileStorage(backend));const {key,rows}=a.snapshot.contracts.daily;
 assert.equal(a.claimContract('daily',key,rows[0].id,now).ok,true);assert.equal(b.claimContract('daily',key,rows[0].id,now).ok,false);assert.deepEqual(b.snapshot.wallet,a.snapshot.wallet);
});
test('V028 reward + claim is atomic on storage failure, retry succeeds once',()=>{
 const backend=memory({...emptyProfile(),contracts:ready()}),w=new Wallet(new LocalProfileStorage(backend)),before=w.snapshot,{key,rows}=before.contracts.daily;backend.fail=true;assert.equal(w.claimContract('daily',key,rows[0].id,now).ok,false);assert.deepEqual(w.snapshot,before);backend.fail=false;assert.equal(w.claimContract('daily',key,rows[0].id,now).ok,true);assert.equal(w.claimContract('daily',key,rows[0].id,now).ok,false);
});
test('V028 queued progress retries after write failure without duplication',()=>{
 const backend=memory({...emptyProfile(),contracts:fixture('d-k75')}),w=new Wallet(new LocalProfileStorage(backend));backend.fail=true;assert.equal(w.recordContracts({kills:20},now),false);backend.fail=false;w.contractState(now);w.contractState(now);assert.equal(row(w.snapshot.contracts,'d-k75').value,20);
});
test('V028 a full wallet does not consume the reward',()=>{
 const profile={...emptyProfile(),contracts:ready()};const c=profile.contracts.daily.rows.find(r=>contractById(r.id).reward.coal);profile.wallet.coal=MAX_RESOURCE;const w=new Wallet(new LocalProfileStorage(memory(profile)));assert.equal(w.claimContract('daily',profile.contracts.daily.key,c.id,now).reason,'full');assert.equal(row(w.snapshot.contracts,c.id).claimed,false);
});
test('V028 daily bonus adds exactly one crate manually without changing daily victory crate stamp',()=>{
 const profile={...emptyProfile(),contracts:ready(),crates:{count:2,lastDaily:'2026-10-08'}},w=new Wallet(new LocalProfileStorage(memory(profile)));assert.equal(w.crateCount,2);assert.equal(w.claimContract('daily',profile.contracts.daily.key,'bonus',now).ok,true);assert.equal(w.crateCount,3);assert.equal(w.snapshot.crates.lastDaily,'2026-10-08');assert.equal(w.claimContract('daily',profile.contracts.daily.key,'bonus',now).ok,false);
});
test('V028 weekly bonus gives exactly one token, separate from ordinary rewards',()=>{
 const w=new Wallet(new LocalProfileStorage(memory({...emptyProfile(),contracts:ready('weekly')}))),key=w.snapshot.contracts.weekly.key;
 for(const r of w.snapshot.contracts.weekly.rows)assert.equal(w.claimContract('weekly',key,r.id,now).ok,true);assert.equal(w.snapshot.wallet.token,0);assert.equal(w.claimContract('weekly',key,'bonus',now).ok,true);assert.equal(w.snapshot.wallet.token,1);assert.equal(w.claimContract('weekly',key,'bonus',now).ok,false);
});
test('V028 incomplete bonuses and expired UI claim keys are refused',()=>{
 const w=new Wallet(new LocalProfileStorage(memory({...emptyProfile(),contracts:ready()}))),key=w.snapshot.contracts.daily.key;assert.equal(w.claimContract('weekly',w.snapshot.contracts.weekly.key,'bonus',now).ok,false);assert.equal(w.claimContract('daily',key,'bonus',day(1)).ok,false);
});
test('V028 crate opening advances only crates, not run-resource contracts',()=>{
 const at=Date.now(),contracts=fixture('w-crates',at);contracts.daily=fixture('d-coal',at).daily;
 const profile={...emptyProfile(),contracts,crates:{count:3,lastDaily:null}},w=new Wallet(new LocalProfileStorage(memory(profile)));for(let i=0;i<3;i++)assert.equal(w.openCrate(()=>0).ok,true);assert.equal(row(w.snapshot.contracts,'w-crates').value,3);assert.equal(row(w.snapshot.contracts,'d-coal').value,0);assert.equal(w.openCrate(()=>0).ok,false);assert.equal(row(w.snapshot.contracts,'w-crates').value,3);
});
test('V028 relief and contract payouts never advance run collection objectives',()=>{
 const at=Date.now(),profile={...emptyProfile(),contracts:fixture('d-coal',at),relief:{startedAt:at-3600000}},w=new Wallet(new LocalProfileStorage(memory(profile)));
 assert.equal(w.claimRelief(at).ok,true);assert.equal(row(w.snapshot.contracts,'d-coal').value,0);w.recordContracts({coal:100},at);const before=row(w.snapshot.contracts,'d-coal').value;assert.equal(w.claimContract('daily',w.snapshot.contracts.daily.key,'d-coal',at).ok,true);assert.equal(row(w.snapshot.contracts,'d-coal').value,before);
});
test('V028 weekly unique-weapon progress survives reload and double observations',()=>{
 const backend=memory({...emptyProfile(),contracts:fixture('w-arms3')}),w=new Wallet(new LocalProfileStorage(backend));w.recordContracts({wonWeapon:'shotgun'},now);const reloaded=new Wallet(new LocalProfileStorage(backend));reloaded.recordContracts({wonWeapon:'shotgun'},now);reloaded.recordContracts({wonWeapon:'smg'},now);assert.equal(row(reloaded.snapshot.contracts,'w-arms3').value,2);
});
test('V028 a failed crate opening cannot progress the weekly objective',()=>{
 const at=Date.now(),backend=memory({...emptyProfile(),contracts:fixture('w-crates',at),crates:{count:1,lastDaily:null}}),w=new Wallet(new LocalProfileStorage(backend));backend.fail=true;assert.equal(w.openCrate(()=>0).ok,false);assert.equal(row(w.snapshot.contracts,'w-crates').value,0);assert.equal(w.crateCount,1);
});
test('V028 passive tracker detects individual boss deaths, collection, Grisou and choices once',()=>{
 const r=new Run(),t=new ContractTracker();r.upgradeRanks={'double-cannon':1,plates:2};let activity=t.observe(r,[{type:'kill',id:1},{type:'kill',id:2},{type:'kill',id:1},{type:'explosion'},{type:'loot-collected',resource:'coal',amount:7},{type:'loot-collected',resource:'iron',amount:2}],[2]);assert.deepEqual(activity,{wave:1,kills:2,bosses:1,grisou:1,coal:7,iron:2,choices:3,epic:1});assert.deepEqual(t.observe(r,[{type:'kill',id:1}],[1]),{});
 r.waveIndex=19;assert.equal(t.observe(r).wave20,1);assert.deepEqual(t.observe(r),{});
});
test('V028 tracker rejects instant weapon runs and distinguishes losses from full victories',()=>{
 for(const status of ['lost','won']){const r=new Run(()=>.5,{}, {weaponId:'smg',zoneId:'rift'}),t=new ContractTracker();r.status=status;r.elapsed=200;r.completedWaves=status==='won'?20:2;const a=t.observe(r);assert.equal(a.weaponRun,'smg');assert.equal(a.wins,status==='won'?1:undefined);assert.equal(a.riftWin,status==='won'?1:undefined);assert.deepEqual(t.observe(r),{});}
 const r=new Run(),t=new ContractTracker();r.status='lost';assert.equal(t.observe(r).weaponRun,undefined);
});
test('V028 observer never mutates run state or changes random consumption',()=>{const r=new Run(()=>.5),before=structuredClone({...r,random:null,rewardRandom:null,talents:null,rift:null}),t=new ContractTracker();t.observe(r,[{type:'kill',id:3}]);assert.deepEqual(structuredClone({...r,random:null,rewardRandom:null,talents:null,rift:null}),before);});
test('V028 rewards have bounded daily/weekly budgets and no ordinary token reward',()=>{
 for(const c of CONTRACTS)assert.equal(c.reward.token,undefined);assert.equal(CONTRACT_REWARDS.dailyCombat.coal,10);assert.equal(CONTRACT_REWARDS.dailyProgress.iron+CONTRACT_REWARDS.dailyVariety.iron,2);assert.deepEqual(CONTRACT_REWARDS.weeklyBonus,{token:1});
});
test('V028 all gameplay/meta/debug source outside explicit observer integration remains byte-identical',async()=>{
 const hashes=JSON.parse(await historicalSource(new URL('./v028-before-hashes.json',import.meta.url)));for(const [f,h]of Object.entries(hashes))if(!V028_FILES.includes(f))assert.equal(createHash('sha256').update(await historicalSource(new URL('../src/'+f,import.meta.url))).digest('hex'),h,f);
});
test('V028 complete Faille run with live contract tracking and normal damage',async()=>{
 let seed=1;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296),r=new Run(random,{power:2,health:2,mechanics:2,mobility:2},{weaponId:'grisoux',zoneId:'rift',talentRandom:()=>.99,rewardRandom:()=>.99}),f=new UpgradeFlow(r,random),t=new ContractTracker(),w=new Wallet(new LocalProfileStorage(memory({...emptyProfile(),contracts:fixture('d-k120')})));
 const totals={},record=a=>{for(const [k,v]of Object.entries(a))if(typeof v==='number')totals[k]=(totals[k]||0)+v;if(Object.keys(a).length)w.recordContracts(a,now);};
 const choose=()=>{f.choose(buildPriority('grisoux').find(id=>f.offered.some(p=>p.id===id))||f.offered[0].id);record(t.observe(r));};f.open();choose();
 for(let i=0;i<1800*60&&r.status==='playing';i++){const ids=r.enemies.filter(e=>e.kind==='boss').map(e=>e.id),events=r.update(1/60,energyPilot(r));record(t.observe(r,events,ids));if(f.afterCombat())choose();}
 assert.equal(r.status,'won');assert.equal(totals.kills,r.kills);assert.equal(totals.bosses,6);assert.equal(totals.choices,f.count);assert.equal(totals.coal,r.collectedRewards.coal);assert.equal(totals.iron,r.collectedRewards.iron);assert.equal(totals.wins,1);assert.equal(totals.wave20,1);assert.equal(row(w.snapshot.contracts,'d-k120').value,120);assert.equal(w.snapshot.wallet.coal,0);
 await writeFile(new URL('./v028-run.json',import.meta.url),JSON.stringify({status:r.status,elapsed:r.elapsed,hp:r.player.hp,kills:r.kills,totals,contracts:w.snapshot.contracts},null,2));
});
