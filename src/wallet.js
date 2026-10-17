import { CRATE_RULES, CRATE_REWARDS, sanitizeCrates, drawCrateReward, victoryCrates } from './crates.js';
import {cycleContracts,advanceContracts,contractClaim,contractDates} from './contracts.js';
import { TALENTS } from './talents.js';
import { completeZone } from './zone-progress.js';
import { RESOURCES } from './resources.js';
import { PERMANENT_UPGRADES, upgradeCost } from './permanent-upgrades.js';
import { LocalProfileStorage, MAX_RESOURCE } from './local-profile-storage.js';
import { runRewards } from './rewards.js';
import { reliefStock, validTimestamp } from './relief.js';

export class Wallet {
  constructor(storage = new LocalProfileStorage()) {
    this.storage = storage;
    this.profile = storage.read();
    this.claims = new WeakMap();
    this.crateClaims = new WeakMap();
    this.zoneClaims = new WeakMap();
    this.contractPending=[];
  }
  get snapshot() { return structuredClone(this.profile); }
  get saved() { return this.storage.available; }
  refreshSavedProfile() {
    if (!this.storage.available) return;
    const stored = this.storage.read();
    if (this.storage.available && (stored.relief || stored.talents || stored.crates || stored.progress || stored.contracts)) this.profile = stored;
  }
  contractState(now=Date.now()) {this.recordContracts({},now);return structuredClone(this.profile.contracts||{});}
  recordContracts(activity,now=Date.now()) {
    if(!contractDates(now))return false;
    if(Object.keys(activity).length)this.contractPending.push({activity,now});
    const stored=this.storage.read();
    if(!this.storage.available)return false;
    this.profile=stored;
    const next=this.snapshot;
    next.contracts=cycleContracts(next.contracts,now,Boolean(next.progress?.shaftCompleted));
    for(const pending of this.contractPending) {
      const updated=advanceContracts(next.contracts,pending.activity,pending.now,Boolean(next.progress?.shaftCompleted));
      const dates=contractDates(pending.now);
      for(const period of ['daily','weekly'])if(next.contracts[period]?.key===dates[period])next.contracts[period]=updated[period];
    }
    if(JSON.stringify(next.contracts)===JSON.stringify(this.profile.contracts)){this.contractPending=[];return true;}
    if(!this.storage.write(next))return false;
    this.profile=next;this.contractPending=[];return true;
  }
  claimContract(period,key,id,now=Date.now()) {
    if(!contractDates(now))return {ok:false,reason:'clock'};
    if(!this.recordContracts({},now)||!this.storage.available)return {ok:false,reason:'storage'};
    // Re-read immediately before one atomic reward + claimed-state write.
    this.refreshSavedProfile();
    const award=contractClaim(cycleContracts(this.profile.contracts,now,Boolean(this.profile.progress?.shaftCompleted)),period,key,id);
    if(!award)return {ok:false,reason:'unavailable'};
    const next=this.snapshot;
    for(const [resource,amount] of Object.entries(award.reward)) {
      if(resource==='crate') {next.crates=sanitizeCrates(next.crates);if(next.crates.count+amount>CRATE_RULES.maxCount)return {ok:false,reason:'full'};next.crates.count+=amount;}
      else {if(next.wallet[resource]+amount>MAX_RESOURCE)return {ok:false,reason:'full'};next.wallet[resource]+=amount;}
    }
    next.contracts=award.state;
    if(!this.storage.write(next))return {ok:false,reason:'storage'};
    this.profile=next;return {ok:true,reward:{...award.reward}};
  }
  reliefState(now = Date.now()) {
    if (!validTimestamp(now)) return reliefStock(null, now);
    const start = this.profile.relief?.startedAt;
    if (!validTimestamp(start) || start > now) {
      // Invalid/future dates start a fresh period; no retroactive free stock.
      this.profile.relief = { startedAt: now };
      this.storage.write(this.profile);
    }
    return reliefStock(this.profile.relief.startedAt, now);
  }
  claimRelief(now = Date.now()) {
    if (!validTimestamp(now)) return { ok:false, reason:'clock' };
    // Re-read before crediting so a previous claim from another instance is seen.
    const stored = this.storage.read();
    if (!this.storage.available) return { ok:false, reason:'storage' };
    if (stored.relief) this.profile = stored;
    const stock = this.reliefState(now);
    if (!stock.available) return { ok:false, reason:'empty' };
    const next = this.snapshot;
    const gains = { ...stock.gains };
    for (const id of ['coal','iron']) {
      gains[id] = Math.min(gains[id], MAX_RESOURCE - next.wallet[id]);
      next.wallet[id] += gains[id];
    }
    if (!gains.coal && !gains.iron) return { ok:false, reason:'full' };
    next.relief = { startedAt: now };
    // Wallet + timestamp are committed in ONE localStorage write. On failure,
    // keep both stock and balance unchanged, so reload cannot duplicate a claim.
    if (!this.storage.write(next)) return { ok:false, reason:'storage' };
    this.profile = next;
    return { ok:true, gains };
  }
  claim(run, random = Math.random, {now=Date.now(),crateRandom=Math.random} = {}) {
    if (!['won', 'lost'].includes(run.status)) return null;
    if (this.claims.has(run)) return { ...this.claims.get(run) };
    this.refreshSavedProfile();
    const gains = runRewards(run, random);
    if(run.status==='won'&&run.completedWaves===20&&['galleries','tracks','shaft59','rift','depths','forge'].includes(run.world?.id)) {
      const award=completeZone(run.world.id,this.profile.progress);
      this.profile.progress=award.progress;
      gains.diamond+=award.firstDiamond;
      this.zoneClaims.set(run,award);
    }
    for (const { id } of RESOURCES) this.profile.wallet[id] = Math.min(MAX_RESOURCE, this.profile.wallet[id] + gains[id]);
    if(run.status==='won'&&run.completedWaves===20) {
      const award=victoryCrates(run,this.profile.crates,now,crateRandom);
      this.profile.crates=award.state;this.crateClaims.set(run,{daily:award.daily,bonus:award.bonus});
    }
    this.claims.set(run, Object.freeze({ ...gains }));
    this.storage.write(this.profile);
    return gains;
  }
  get crateCount() { return this.profile.crates?.count||0; }
  readCrateProfile() {
    const stored=this.storage.read();
    if(!this.storage.available)return false;
    this.profile=stored;return true;
  }
  exchangeTokens() {
    if(!this.readCrateProfile())return {ok:false,reason:'storage'};
    if(this.profile.wallet.token<CRATE_RULES.tokenCost)return {ok:false,reason:'tokens'};
    if(this.crateCount>=CRATE_RULES.maxCount)return {ok:false,reason:'full'};
    const next=this.snapshot;next.crates=sanitizeCrates(next.crates);next.crates.count++;
    next.wallet.token-=CRATE_RULES.tokenCost;
    if(!this.storage.write(next))return {ok:false,reason:'storage'};
    this.profile=next;return {ok:true};
  }
  openCrate(random=Math.random) {
    if(!this.readCrateProfile())return {ok:false,reason:'storage'};
    if(!this.crateCount)return {ok:false,reason:'empty'};
    // Check before drawing, so a full wallet cannot turn retries into rerolls.
    if(CRATE_REWARDS.some(r=>this.profile.wallet[r.resource]>MAX_RESOURCE-r.amount))return {ok:false,reason:'capacity'};
    const reward=drawCrateReward(random),next=this.snapshot;
    next.crates.count--;next.wallet[reward.resource]+=reward.amount;
    next.contracts=advanceContracts(next.contracts,{crates:1},Date.now(),Boolean(next.progress?.shaftCompleted));
    // Credit before animation: navigation/reload cannot lose or duplicate loot.
    if(!this.storage.write(next))return {ok:false,reason:'storage'};
    this.profile=next;return {ok:true,reward:{resource:reward.resource,amount:reward.amount}};
  }
  canBuyTalent(id) {
    this.refreshSavedProfile();
    const talent=TALENTS.find(t=>t.id===id);
    return Boolean(talent&&!this.profile.talents?.includes(id)&&Object.entries(talent.cost).every(([r,n])=>this.profile.wallet[r]>=n));
  }
  buyTalent(id) {
    // Atomic debit + unlock; failures leave both unchanged and can be retried.
    if(!this.canBuyTalent(id))return false;
    const next=this.snapshot,talent=TALENTS.find(t=>t.id===id);
    for(const [r,n] of Object.entries(talent.cost))next.wallet[r]-=n;
    next.talents=[...(next.talents||[]),id];
    if(!this.storage.write(next))return false;
    this.profile=next;return true;
  }
  canBuy(id) {
    this.refreshSavedProfile();
    if (!PERMANENT_UPGRADES.some(item => item.id === id)) return false;
    const cost = upgradeCost(this.profile.levels[id]);
    return Boolean(cost && RESOURCES.every(({ id: resource }) => this.profile.wallet[resource] >= cost[resource]));
  }
  buy(id) {
    if (!this.canBuy(id)) return false;
    const cost = upgradeCost(this.profile.levels[id]);
    for (const { id: resource } of RESOURCES) this.profile.wallet[resource] -= cost[resource];
    this.profile.levels[id]++;
    this.storage.write(this.profile);
    return true;
  }
}
