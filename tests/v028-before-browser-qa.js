import {tripleOwners} from '../src/triple-pressure.js';
import {createBoss} from '../src/bosses.js';
import {summonRailWagon} from '../src/rail-boss-encounter.js';
import {energyPilot} from './v027-pilot.js';
import { railBossPilot } from './rail-boss-pilot.js';
import { EPIC_UPGRADES } from '../src/epic-upgrades.js';
import { TRACKS, zoneRewards } from '../src/zones.js';
import { skipReservedBoss } from './tracks-normal-qa.js';
import { TALENTS } from '../src/talents.js';
// Browser fixtures live outside src and cannot be loaded by the normal server.
// Real scene/render/UI/combat; test-only steering, seeded perks, memory wallet.
import { COMBAT_APPEARANCES } from '../src/combat-appearances.js';
import { RoomScene } from '../src/room-scene.js';
import { RoomLoot } from '../src/wave-loot.js';
import { UpgradeFlow, UPGRADES } from '../src/upgrades.js';
import { Wallet } from '../src/wallet.js';
import { LocalProfileStorage } from '../src/local-profile-storage.js';
import { HOUR_MS } from '../src/relief.js';
import { steer, enterFixtureRoom } from './run-helpers.js';
import { createEnemy, ENEMY_TYPES } from '../src/enemies/registry.js';
import { worldRewards } from '../src/world.js';
import { Run } from '../src/run.js';

const panel = document.createElement('details');
panel.style.cssText = 'position:fixed;top:0;left:0;z-index:100;width:100%;max-height:95vh;overflow:auto;font:10px monospace;color:#fff;background:#192326';
panel.innerHTML = '<summary>QA V0.27 · profil QA isolé</summary><div id="qa-actions"></div><pre id="qa-report" style="white-space:pre-wrap;max-height:180px;overflow:auto"></pre>';
panel.querySelector('summary').style.cssText='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:8px;line-height:10px';
document.body.append(panel);
const report = panel.querySelector('#qa-report');

class QAScene extends RoomScene {
  create() {
    super.create();
    this.qaStorage = new LocalProfileStorage({ getItem: () => localStorage.getItem('la-mine-v2:qa-v027'), setItem: (_,value) => localStorage.setItem('la-mine-v2:qa-v027',value) });
    this.wallet = new Wallet(this.qaStorage);
    this.menu.wallet = this.ui.wallet = this.ui.workshop.wallet = this.wallet;
    this.menu.refreshBalance(); this.menu.refreshRelief();
    this.manualRead = this.movement.read.bind(this.movement);
    this.qaLabels = [];
    this.qaHold = true;
    for (const [label, action] of [
      ...['haveuse','crachefer','effondreur','stationmaster','locomotive','switchman','cager','compressor','firedamp','deepdriller','surveyor','gasminer','drill','draisine'].map(kind=>['Mobilité : '+kind,()=>this.mobilityQA(kind)]),
      ['Mobilité : observer 8 s',()=>{const trace=[];let distance=0;for(let i=0;i<480;i++){const e=this.run.enemies[0],x=e?.x,y=e?.y,phase=e?.phase;super.update(0,1000/60);if(e&&['positioning','chase','recovery'].includes(phase))distance+=Math.hypot(e.x-x,e.y-y);if(i%30===0&&e)trace.push({time:i/60,x:e.x,y:e.y,phase:e.phase});}this.metrics.mobilityTrace=trace;this.metrics.repositionDistance=distance;this.publishQA();}],
      ['Faille : victoire Puits QA',()=>{this.wallet.profile.progress={tracksCompleted:true};this.qaStorage.write(this.wallet.snapshot);this.wallet.claim({world:{id:'shaft59'},status:'won',completedWaves:20,collectedRewards:{coal:0,iron:0,diamond:0,token:0}},()=>.99,{crateRandom:()=>.99});this.showMenu('zones');}],
      ...['crawler','spitter','burster','splitter','blower','core','triple','gas','fan8','fissures','circle8','pockets','double','rain','orb'].map(kind=>['Faille : '+kind,()=>this.riftQA(kind)]),
      ['Triple : capturer chevauchement',()=>{this.captureOverlap=true;this.qaHold=false;}],
      ['Puits : victoire Zone 2 QA',()=>{this.wallet.profile.progress={galleriesCompleted:true};this.qaStorage.write(this.wallet.snapshot);this.wallet.claim({world:TRACKS,status:'won',completedWaves:20,collectedRewards:{coal:0,iron:0,diamond:0,token:0}},()=>.99,{crateRandom:()=>.99});this.showMenu('zones');}],
      ...['ennemis','instabilite','cager','compressor','firedamp','triple'].map(kind=>['Puits : '+kind,()=>this.shaftQA(kind)]),
      ...['wagons','horizontal','vertical','cross','circle6','circle8'].map(kind=>['Polish : '+kind,()=>this.polishQA(kind)]),
      ['Polish : avancer 0,8 s',()=>{for(let i=0;i<48;i++)super.update(0,1000/60);this.publishQA();}],
      ['Polish : activer',()=>{for(let i=0;i<130;i++)super.update(0,1000/60);this.publishQA();}],
      ['Énergie : base',()=>this.energyQA(false)],
      ['Énergie : arc',()=>{this.energyQA(false);UPGRADES.find(p=>p.id==='energy-arc').apply(this.run);this.run.upgradeRanks['energy-arc']=1;}],
      ['Énergie : cartes',()=>{this.energyQA(false);UPGRADES.find(p=>p.id==='conduit').apply(this.run);this.run.upgradeRanks.conduit=1;this.upgrades.offered=['reinforced-conduit','energy-overload','capacitor'].map(id=>({...UPGRADES.find(p=>p.id===id),rank:1}));this.upgrades.active=true;this.run.paused=true;this.showChoice({});}],
      ['Énergie : conduit III',()=>this.energyQA(true)],
      ['Énergie : tirer',()=>{for(let i=0;i<12;i++)super.update(0,1000/60);this.publishQA();}],
      ['Plaques : impact',()=>{const e=createEnemy('miner',99,this.run.player.x,this.run.player.y);e.warmup=0;this.run.enemies.push(e);this.run.weapon.cooldown=999;super.update(0,1000/60);this.publishQA();}],
      ['DA : arrêter au choix épique',()=>{this.captureChoice=19;}],
      ['Parcours V0.27 : préparer',()=>{this.journey=true;this.qaHold=true;this.showMenu('home');}],
      ['Parcours V0.27 : Atelier 2',()=>{this.wallet.profile.levels={power:2,health:2,mechanics:2,mobility:2};this.qaStorage.write(this.wallet.snapshot);this.showMenu('zones');}],
      ['Parcours V0.27 : pause capture',()=>{this.qaHold=true;}],
      ['Parcours V0.27 : reprendre',()=>{this.qaHold=false;}],
      ['Parcours V0.27 : défaite',()=>{this.choices.hide();this.run.paused=false;this.run.player.hp=0;this.mode='playing';this.qaHold=false;}],

      ...[[5,'Chef de Gare'],[10,'Locomotive'],[15,'Aiguilleur'],[20,'Triple']].map(([n,name])=>['Boss rail : aperçu '+name,()=>this.railBossQA(n,'shotgun',true)]),
      ['Boss rail : triple Fusil',()=>this.railBossQA(20,'shotgun')],
      ['Boss rail : triple Mitraillette',()=>this.railBossQA(20,'smg')],
      ['Voies : normales Fusil', () => this.tracksQA('shotgun')],
      ['Voies : normales Mitraillette', () => this.tracksQA('smg')],
      ['Voies : capture 19', () => {this.tracksCapture=19;this.qaHold=false;}],
      ['Wagon : cibler haut',()=>this.targetWagonQA(310)],
      ['Wagon : cibler bas',()=>this.targetWagonQA(580)],
      ['Wagon : esquiver',()=>{for(let i=0;i<36;i++)this.run.update(1/60,{x:0,y:-1});this.drawActors(1/60);this.publishQA();}],
      ['Wagon : traverser',()=>{for(let i=0;i<150;i++)this.run.update(1/60,{x:0,y:0});this.drawActors(1/60);this.publishQA();}],
      ['Orientation : Rat et Wagon',()=>this.directionQA()],
      ['Orientation : avancer',()=>{for(let i=0;i<24;i++){for(const e of this.run.enemies)e.update(1/60,this.run.player,[]);this.drawActors(1/60);}this.publishQA();}],
      ['Rail : télégraphes', () => this.railQA('preview')],
      ['Rail : rafale', () => this.railQA('burst')],
      ['Rail : combat fusil', () => this.railQA('combat','shotgun')],
      ['Rail : combat mitraillette', () => this.railQA('combat','smg')],
      ['Rail : pression 12', () => this.railQA('stress','smg')],
      ['Réinitialiser portefeuille QA', () => { localStorage.removeItem('la-mine-v2:qa-v027'); this.wallet = new Wallet(this.qaStorage); this.menu.wallet = this.ui.wallet = this.ui.workshop.wallet = this.wallet; this.menu.show('home'); }],
      ...[1,8,24,48].map(hours => ['Relève '+hours+' h', () => { this.wallet.profile.relief = {startedAt:Date.now()-hours*HOUR_MS}; this.qaStorage.write(this.wallet.snapshot); this.showMenu('relief'); }]),
      ['Piloter la run lancée', () => { this.qaAuto = true; this.qaHold = false; this.qaSteps = 4; this.resetMetrics('V0.27 navigation'); this.movement.read = () => steer(this.run); }],
      ['Défaite de contrôle', () => { this.start(this.menu.state.weaponId); this.choices.hide(); this.run.paused = false; this.run.player.hp = 0; this.mode = 'playing'; this.qaHold = false; this.qaAuto = false; this.qaSteps = 1; this.resetMetrics('défaite'); }],
      ['Run complète fusil', () => this.beginQA('shotgun',1)],
      ['Run complète mitraillette', () => this.beginQA('smg',5,false,0,true)],
      ['Run complète mitraillette · Atelier 2', () => this.beginQA('smg',5,false,2)],
      ['Focus boss', () => this.focusQA()],
      ['Provision Caisses QA', () => { this.wallet.profile.wallet={coal:100,iron:20,diamond:2,token:7};this.wallet.profile.crates={count:3,lastDaily:null};this.qaStorage.write(this.wallet.snapshot);this.showMenu('crates'); }],
      ['Victoire QA aujourd’hui', () => this.crateVictoryQA(0)],
      ['Victoire QA demain', () => this.crateVictoryQA(1)],
      ['Défaite QA sans caisse', () => this.crateVictoryQA(0,true)],
      ['Prochaine caisse : Diamant', () => { const open=this.wallet.openCrate.bind(this.wallet);this.wallet.openCrate=()=>{this.wallet.openCrate=open;return open(()=>.9);}; }],
      ['Prochaine caisse : Jeton', () => { const open=this.wallet.openCrate.bind(this.wallet);this.wallet.openCrate=()=>{this.wallet.openCrate=open;return open(()=>.99);}; }],
      ['Provision Talents QA', () => { this.wallet.profile.wallet={coal:5000,iron:500,diamond:10,token:7};this.qaStorage.write(this.wallet.snapshot);this.showMenu('talents'); }],
      ['Run Talents fusil', () => this.beginQA('shotgun',7,false,0,false,true)],
      ['Run Talents mitraillette', () => this.beginQA('smg',7,false,0,true,true)],
      ['Diagnostic pilotes', () => this.diagnosePilots()],
      ['Aperçu Crachefer', () => this.bossPreview(10)],
      ['Aperçu Effondreur', () => this.bossPreview(15)],
      ['Aperçu triple', () => this.bossPreview(20)],
      ['Épique Fusil', () => { this.beginQA('shotgun',1); this.captureChoice=19; }],
      ['Épique Mitraillette', () => { this.beginQA('smg',5,false,2); this.captureChoice=19; }],
      ['Triple boss', () => { this.beginQA('shotgun',1); this.captureBoss=20; }],
      ['Vague 19', () => { this.beginQA('shotgun',1); this.captureWave=19; }],
      ['Crachefer', () => { this.beginQA('shotgun',1); this.captureBoss=10; }],
      ['Effondreur', () => { this.beginQA('shotgun',1); this.captureBoss=15; }],
      ['Build perforant complet', () => this.beginQA('smg',1,true,5)],
      ['Perks Fusil', () => this.perksQA('shotgun')],
      ['Perks Mitraillette', () => this.perksQA('smg')],
      ['Grisou garanti', () => this.perksQA('grisou')],
      ['Bouclier de vague', () => this.perksQA('shield')],
      ['Refroidir en mouvement', () => { this.run.update(.04,{x:1,y:0}); this.drawActors(0); this.publishQA(); }],
      ['Vague 4 mitraillette', () => { this.beginQA('smg'); this.captureRoom4 = true; }],
      ['Arrêt sur vague 4', () => { this.beginQA(); this.captureRoom4 = true; }],
      ['Arrêt intro boss', () => { this.beginQA(); this.captureBoss = true; }],
      ['Arrêt choix vague 2', () => { this.beginQA(); this.captureChoice = 2; }],
      ['Arrêt choix vague 4', () => { this.beginQA(); this.captureChoice = 4; }],
      ['Continuer la run', () => { this.tracksCapture=0; this.qaHold = false; this.captureWave=0; this.captureRoom4 = false; this.captureBoss = false; this.captureChoice = 0; if (this.mode !== 'choice') {this.mode = 'playing'; this.ui.hide();} }],
      ['Trois ennemis', () => this.enemiesQA(false)],
      ['Foreuse : visée', () => this.enemiesQA(true)],
      ['Foreuse : esquive', () => this.drillQA()],
      ['Pression maximale', () => this.pressureQA()],
      ['18 drops', () => this.dropsQA(4, 16)],
      ['4 ressources boss', () => this.dropsQA(5, 1)],
      ['Aspirer', () => { this.run.wavePhase = 'collecting'; this.run.loot.beginCollection(this.run.player); this.qaHold = false; this.qaAuto = false; this.qaSteps = 1; }],
    ]) {
      const button = document.createElement('button');
      button.textContent = label;
      button.style.cssText = 'width:auto;min-height:32px;margin:2px;padding:4px;font-size:10px';
      button.onclick = () => { action(); panel.open = false; };
      panel.querySelector('#qa-actions').append(button);
    }
  }
  resetMetrics(mode) {
    this.metrics = { mode, explosions:0, maxHeat:0, maxPellets:0, shieldHits:0, shots: 0, movingShots: 0, enemyShots: 0, maxBolts: 0, seen: [], room4Kills: 0, room4Mixed: false, pickups: 0, maxDrops: this.run.loot.activeCount, frames: 0, workMs: 0, magnetDurations: [] };
    this.arenaAtStart = this.arenaView.base.background;
    this.metrics.waveHistory = [];
    this.metrics.checkpoints=[];
    this.metrics.maxAlive=0;this.metrics.bosses=[];this.metrics.bossTimes=[];this.metrics.movingFrames=0;
    let timedWave=0,combatStart=0;
    const update = this.run.update.bind(this.run);
    this.run.update = (dt, input) => {
      // Exact same fixed timestep as the Node run fixtures, independent of the
      // milliseconds/seconds floating-point conversion in the Phaser scene.
      if(this.run.wave.boss&&this.run.wavePhase==='combat'&&timedWave!==this.run.waveNumber){timedWave=this.run.waveNumber;combatStart=this.run.elapsed;}
      const events = update(this.qaAuto ? 1/60 : dt, input);
      this.metrics.maxFocus=Math.max(this.metrics.maxFocus||0,this.run.weapon.focus?.bonus||0);
      if(input.x||input.y)this.metrics.movingFrames++;
      if(this.run.wave.boss&&events.some(e=>e.type==='wave-loot'))this.metrics.bossTimes.push({wave:this.run.waveNumber,seconds:this.run.elapsed-combatStart});
      if(this.run.wave.final){this.metrics.overlapFrames=(this.metrics.overlapFrames||0)+(tripleOwners(this.run).size>=2?1:0);this.metrics.threeFrames=(this.metrics.threeFrames||0)+(tripleOwners(this.run).size>=3?1:0);this.metrics.maxMajors=Math.max(this.metrics.maxMajors||0,tripleOwners(this.run,true).size);}
      this.metrics.maxZones=Math.max(this.metrics.maxZones||0,this.run.shaftHazards?.items.length||0);this.metrics.maxAlive=Math.max(this.metrics.maxAlive,this.run.enemies.length);
      for(const e of this.run.enemies)if(e.bossId&&!this.metrics.bosses.includes(e.bossId))this.metrics.bosses.push(e.bossId);
      this.metrics.maxHeat=Math.max(this.metrics.maxHeat,this.run.weapon.heat);
      this.metrics.maxPellets=Math.max(this.metrics.maxPellets,this.run.projectiles.pool.filter(p=>p.active).length);
      this.metrics.explosions+=events.filter(e=>e.type==='explosion').length;
      this.metrics.shieldHits+=events.filter(e=>e.type==='shield-hit').length;
      const state = this.run.waveNumber + ':' + this.run.wavePhase;
      if(this.metrics.checkpoints.at(-1)?.wave!==this.run.waveNumber)this.metrics.checkpoints.push({wave:this.run.waveNumber,hp:this.run.player.hp,time:this.run.elapsed,x:this.run.player.x,y:this.run.player.y});
      if (this.metrics.waveHistory.at(-1) !== state) this.metrics.waveHistory.push(state);
      for (const e of this.run.enemies) if (!this.metrics.seen.includes(e.kind)) this.metrics.seen.push(e.kind);
      this.metrics.maxBolts = Math.max(this.metrics.maxBolts, this.run.hostileProjectiles.pool.filter(b => b.active).length);
      if (this.run.waveNumber === 4 && new Set(this.run.enemies.map(e => e.kind)).size === 3) this.metrics.room4Mixed = true;
      for (const event of events) {
        if (event.type === 'enemy-shot') {this.metrics.enemyShots++;if(event.fan)this.metrics.fans=(this.metrics.fans||0)+1;}
        if (event.type === 'kill' && this.run.waveNumber === 4) this.metrics.room4Kills++;
        if (event.type === 'shot') {
          this.metrics.shots++;
          if (input.x || input.y || this.run.player.vx || this.run.player.vy) this.metrics.movingShots++;
        }
        if (event.type === 'loot-collected') this.metrics.pickups++;
        if (event.type === 'wave-loot') this.collectStarted = this.run.elapsed;
        if (['wave-clear', 'won'].includes(event.type) && this.collectStarted != null) {
          this.metrics.magnetDurations.push(Number((this.run.elapsed - this.collectStarted).toFixed(3)));
          this.collectStarted = null;
        }
      }
      this.metrics.maxDrops = Math.max(this.metrics.maxDrops, this.run.loot.activeCount);
      return events;
    };
  }
  crateVictoryQA(offset,lost=false) {
    const date=new Date();date.setDate(date.getDate()+offset);
    const run={status:lost?'lost':'won',completedWaves:lost?19:20,collectedRewards:{coal:0,iron:0,diamond:0,token:0}};
    this.wallet.claim(run,()=>.99,{now:date.getTime(),crateRandom:()=>.99});this.showMenu('crates');
    report.textContent=JSON.stringify({fixture:'Fin de run simulée, sans ressources',award:this.wallet.crateClaims.get(run)||null,profile:this.wallet.snapshot});
  }
  focusQA() {
    this.start('smg');this.upgrades.choose(this.upgrades.offered[0].id);this.choices.hide();
    enterFixtureRoom(this.run,5);
    this.qaAuto=false;this.qaHold=false;this.qaSteps=1;this.mode='playing';this.ui.hide();
    this.movement.read=()=>({x:0,y:0});this.showcase='focus';
    this.resetMetrics('Focus réel sur boss 5');this.drawActors(0);this.publishQA();
  }
  bossPreview(number) {
    this.start();this.upgrades.choose(this.upgrades.offered[0].id);this.choices.hide();
    enterFixtureRoom(this.run,number);
    for(const e of this.run.enemies){e.warmup=0;e.phaseTime=0;e.update(.01,this.run.player,[]);}
    this.qaAuto=false;this.qaHold=true;this.mode='playing';this.ui.hide();
    this.drawActors(0);this.resetMetrics('aperçu contrôlé '+number);this.publishQA();
  }
  diagnosePilots() {
    this.qaHold=true;const rows=[];
    for(const weaponId of ['shotgun','smg'])for(const startSeed of [1,2,9,16,42,77,123,300,999]) {
      let seed=startSeed;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
      const run=new Run(rng,{}, {weaponId,rewardRandom:()=>.99}),flow=new UpgradeFlow(run,rng);
      const choose=()=>flow.choose(['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn'].find(id=>flow.offered.some(p=>p.id===id)));
      flow.open();choose();
      for(let i=0;i<36000&&run.status==='playing';i++){run.update(1/60,steer(run));if(flow.afterCombat())choose();}
      rows.push({weaponId,seed:startSeed,status:run.status,wave:run.waveNumber,hp:run.player.hp,seconds:run.elapsed,perks:flow.history});
    }
    report.textContent=JSON.stringify(rows,null,2);
  }
  chooseQA() {
    const id = (this.journey?(this.run.weapon.definition.id==='smg'?['critical-heat','heat','plates','trigger','boots','piercing','magazine','grisou']:this.run.weapon.definition.id==='grisoux'?['double-cannon','conduit','plates','rapid-coil','trigger','reinforced-conduit','energy-overload','energy-arc','boots','capacitor','grisou']:['double-cannon','buckshot','plates','trigger','boots','double','grisou','sawn']):this.heatBuild ? ['critical-heat','trigger','heat','plates','boots','piercing','magazine'] : this.specialBuild ? ['total-piercing','piercing','heat','magazine','trigger','plates','grisou','boots'] : ['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn']).find(id => this.upgrades.offered.some(c => c.id === id));
    this.upgrades.choose(id||this.upgrades.offered[0].id); this.choices.hide(); this.mode = 'playing'; this.ui.hide();
  }
  start(weaponId = 'shotgun', zoneId = 'galleries') {
    for (const label of this.qaLabels || []) label.destroy();
    this.qaLabels = [];
    this.showcase = null;this.tracksNormal=false;this.railBossOnly=0;
    super.start(weaponId, zoneId);
    if(this.journey) {
      let seed=weaponId==='shotgun'&&zoneId==='tracks'?2:1;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
      this.run.random=rng;this.run.rewardRandom=()=>.99;this.run.rewardPlans=zoneRewards(this.run.world,()=>.99);this.run.loot.plan={...this.run.rewardPlans[0]};
      this.specialBuild=false;this.heatBuild=weaponId==='smg';this.upgrades=new UpgradeFlow(this.run,rng);this.upgrades.open();this.showChoice({first:true});
      this.qaAuto=true;this.qaHold=false;this.qaSteps=8;
      this.captureBoss=this.captureWave=this.captureChoice=this.captureRoom4=false;
      this.resetMetrics('V0.27 parcours '+zoneId+' '+weaponId);
      this.movement.read=()=>energyPilot(this.run);
      return;
    }
    if (this.menu.state.launching) {
      let seed = 16; const rng = () => ((seed = (Math.imul(seed,1664525) + 1013904223) >>> 0) / 4294967296);
      this.run.random = rng; this.run.rewardRandom = () => .99;
      this.upgrades = new UpgradeFlow(this.run, rng); this.upgrades.open(); this.showChoice({ first: true });
    }
  }
  beginQA(weaponId = 'shotgun', startSeed = 1, specialBuild = false, atelierRank = 0, heatBuild = false, talentBuild = false) {
    this.specialBuild = specialBuild;this.heatBuild=heatBuild;
    this.qaLevels={power:atelierRank,health:atelierRank,mechanics:atelierRank,mobility:atelierRank};
    this.wallet.profile.levels={...this.qaLevels};
    this.wallet.profile.talents=talentBuild?TALENTS.map(t=>t.id):[];
    this.qaStorage.write(this.wallet.snapshot);
    this.start(weaponId);
    let seed = startSeed;
    const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    this.run.random = rng;
    let talentSeed=startSeed+12345;this.run.talents.random=()=>((talentSeed=(Math.imul(talentSeed,1664525)+1013904223)>>>0)/4294967296);
    this.run.rewardRandom = () => .99;
    this.run.rewardPlans=worldRewards(()=>.99);
    this.run.loot.plan={...this.run.rewardPlans[0]};
    this.upgrades = new UpgradeFlow(this.run, rng); this.upgrades.open(); this.chooseQA();
    this.qaAuto = true; this.qaHold = false; this.qaSteps = 4;
    this.captureBoss = false; this.captureChoice = 0; this.captureRoom4 = false;
    this.captureWave=0;
    this.resetMetrics('V0.27 ' + weaponId + ' · Atelier '+atelierRank);
    this.metrics.seed=startSeed;this.metrics.levels={...this.qaLevels};
    this.movement.read = () => steer(this.run);
  }
  railBossQA(number,weaponId,preview=false) {
    this.start(weaponId);this.choices.hide();this.ui.hide();this.mode='playing';
    let seed=weaponId==='shotgun'?1:5;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    this.run=new Run(random,{power:2,health:2,mechanics:2,mobility:2},{world:{...TRACKS,id:'rail-boss-qa'},weaponId,rewardRandom:()=>.99});
    const build=weaponId==='shotgun'?['trigger','buckshot','boots','plates','double','double-cannon']:['trigger','heat','boots','plates','trigger','critical-heat'];
    for(const id of build.slice(0,number===5?2:number===10?3:number===15?4:6)){[...UPGRADES,...EPIC_UPGRADES].find(p=>p.id===id).apply(this.run);this.run.upgradeRanks[id]=(this.run.upgradeRanks[id]||0)+1;}
    this.upgrades=new UpgradeFlow(this.run,random);this.run.waveIndex=number-2;this.run.wavePhase='cleared';this.run.enterNextWave();
    this.drawWeapon();this.qaAuto=true;this.qaSteps=1;this.qaHold=preview;this.railBossOnly=number;
    this.captureBoss=this.captureWave=this.captureChoice=this.captureRoom4=false;
    this.movement.read=()=>railBossPilot(this.run);
    if(preview){this.run.wavePhase='combat';for(const e of this.run.enemies){e.warmup=0;e.phaseTime=0;if(e.bossId==='locomotive')e.attackCount=1;e.update(.01,this.run.player,[]);}}
    this.resetMetrics('V0.27 boss '+number+' '+weaponId+(preview?' aperçu contrôlé':''));this.drawActors(0);this.publishQA();
  }
  tracksQA(weaponId) {
    this.beginQA(weaponId,weaponId==='shotgun'?1:5,false,2,weaponId==='smg');
    this.run.world=TRACKS;this.tracksNormal=true;this.tracksCapture=4;this.qaSteps=4;
    this.run.loot=new RoomLoot(1,TRACKS.waves[0].total,()=>.99,this.run.rewardPlans[0]);
    this.metrics.mode='V0.27 normales '+weaponId+' Atelier 2';
  }
  targetWagonQA(y) {
    this.start();this.choices.hide();this.ui.hide();this.mode='playing';this.qaHold=true;this.qaAuto=false;
    const world={id:'wagon-target-qa',name:'QA WAGON CIBLÉ',choices:[],waves:[{total:1,maxAlive:1,group:1,interval:.5,enemies:['wagon'],spawns:[[46,190],[404,580]]}]};
    this.run=new Run(()=>.5,{}, {world});this.run.player.x=225;this.run.player.y=y;this.run.weapon.cooldown=999;
    this.upgrades=new UpgradeFlow(this.run);this.run.spawn();
    for(let i=0;i<45;i++)this.run.update(1/60);
    this.drawWeapon();this.resetMetrics('Wagon ciblage '+y);this.drawActors(0);this.publishQA();
  }
  directionQA() {
    this.start();this.choices.hide();this.ui.hide();this.run.paused=false;this.mode='playing';
    this.qaHold=true;this.qaAuto=false;this.run.player.x=225;this.run.player.y=330;
    this.run.enemies=Array.from({length:8},(_,i)=>{
      const a=i*Math.PI/4,e=createEnemy('rat',i+1,225+Math.cos(a)*120,330+Math.sin(a)*120);
      e.warmup=0;e.angle=a-Math.PI;return e;
    });
    for(const [id,x,y] of [[9,46,515],[10,404,605]]) {
      const e=createEnemy('wagon',id,x,y);e.x=x===46?95:355;e.warmup=0;this.run.enemies.push(e);
    }
    this.run.spawned=10;this.run.untilSpawn=999;
    this.resetMetrics('Orientation Rat et Wagon');this.drawActors(0);this.publishQA();
  }
  railQA(mode,weaponId='shotgun') {
    this.start(weaponId);this.choices.hide();this.ui.hide();this.mode='playing';
    const kinds=mode==='stress'?Array.from({length:12},(_,i)=>i%2?'draisine':'wagon'):['wagon','draisine'];
    const world={id:'rail-fixture',name:'QA ENNEMIS FERROVIAIRES',choices:[],waves:[{total:kinds.length,maxAlive:12,group:2,interval:.8,enemies:kinds,spawns:[[60,190],[390,580],[60,580],[390,190]]}]};
    this.run=new Run(()=>.5,{}, {weaponId,world,rewardRandom:()=>.99});this.upgrades=new UpgradeFlow(this.run);this.drawWeapon();
    this.run.player.x=225;this.run.player.y=505;
    this.qaAuto=true;this.qaSteps=1;this.qaHold=mode==='preview'||mode==='burst';
    this.captureBoss=this.captureWave=this.captureChoice=this.captureRoom4=false;
    this.movement.read=()=>steer(this.run);
    if(this.qaHold) {
      const wagon=createEnemy('wagon',1,46,285),draisine=createEnemy('draisine',2,335,370);
      wagon.warmup=draisine.warmup=0;draisine.phaseTime=0;draisine.update(.01,this.run.player,[]);
      this.run.enemies=[wagon,draisine];this.run.spawned=2;
      if(mode==='burst')for(let i=0;i<75;i++){const shots=[];draisine.update(1/60,this.run.player,shots);this.run.hostileProjectiles.update(1/60,this.run.player,this.run.player,()=>{});for(const s of shots)this.run.hostileProjectiles.fireVolley(draisine,s.angle,s.fan);}
      for(const e of this.run.enemies)this.qaLabels.push(this.add.text(e.x===46?102:e.x,e.y+37,ENEMY_TYPES[e.kind].name.toUpperCase(),{fontFamily:'system-ui',fontSize:'12px',fontStyle:'bold',color:'#fff0d4',stroke:'#182326',strokeThickness:3}).setOrigin(.5).setDepth(35));
    }
    this.resetMetrics('V0.27 '+mode+' '+weaponId);this.drawActors(0);this.publishQA();
  }
  enemiesQA(warning) {
    this.start(); this.choices.hide(); this.run.paused = false;
    this.upgrades = new UpgradeFlow(this.run);
    this.run.waveIndex = 3; this.run.waveElapsed = 3; this.run.spawned = 3; this.run.untilSpawn = 999;
    this.run.player.x = 225; this.run.player.y = 530;
    this.run.enemies = [['rat', 85, 265], ['miner', 225, 320], ['drill', 350, 265]].map(([kind, x, y], i) => {
      const e = createEnemy(kind, i + 1, x, y); e.warmup = 0;
      e.angle = Math.atan2(this.run.player.y - y, this.run.player.x - x);
      if (kind === 'drill' && warning) { e.phase = 'warning'; e.phaseTime = .9; e.attackAngle = e.angle; }
      const label = this.add.text(x, y + 45, ENEMY_TYPES[kind].name.replace(' de galerie', '').replace(' grisouteux', '').replace(' autonome', ''), { fontFamily:'system-ui', fontSize:'12px', color:'#ece6dc' }).setOrigin(.5).setDepth(30);
      this.qaLabels.push(label);
      return e;
    });
    this.qaHold = true; this.qaAuto = false; this.qaSteps = 1; this.movement.read = this.manualRead; this.mode = 'playing'; this.ui.hide();
     this.drawActors(0);
    this.resetMetrics('ennemis'); this.publishQA();
  }
  riftQA(kind) {
    this.journey=false;this.start('grisoux');this.run=new Run(()=>.5,{}, {weaponId:'grisoux',zoneId:'rift'});this.drawWeapon();this.choices.hide();this.ui.hide();this.mode='playing';
    this.run.paused=false;this.run.untilSpawn=999;this.run.weapon.cooldown=999;this.qaHold=true;this.qaAuto=false;this.qaSteps=1;this.movement.read=()=>({x:0,y:0});this.run.damagePlayer=()=>false;
    this.upgrades=new UpgradeFlow(this.run);this.run.player.x=225;this.run.player.y=510;
    if(kind==='triple'){this.run.waveIndex=18;this.run.wavePhase='cleared';this.run.enterNextWave();this.run.wavePhase='combat';this.run.enemies.forEach(b=>b.warmup=0);}
    else if(kind==='gas'){this.run.waveIndex=1;this.run.rift.ground.until=0;this.run.update(.01);}
    else {const actor=['crawler','spitter','burster','splitter','blower','core'].includes(kind)?kind:['fan8','fissures'].includes(kind)?'splitter':['circle8','pockets'].includes(kind)?'blower':'core';
      const e=['crawler','spitter','burster'].includes(actor)?createEnemy(actor,99,225,250):createBoss(99,actor,[225,250]);e.warmup=0;this.run.enemies=[e];if(kind!==actor)this.run.rift.begin(e,kind,this.run.player);
    }
    for(const view of this.enemyViews.values())view.container.destroy();this.enemyViews.clear();this.resetMetrics('V0.27 '+kind);this.drawActors(0);this.publishQA();
  }
  mobilityQA(kind) {
    this.journey=false;this.start('grisoux');this.run=new Run(()=>.5,{}, {weaponId:'grisoux',zoneId:'shaft59'});
    this.drawWeapon();this.choices.hide();this.ui.hide();this.mode='playing';this.run.paused=false;this.run.wavePhase='combat';this.run.untilSpawn=999;
    this.run.enemies=[['deepdriller','surveyor','gasminer','drill','draisine'].includes(kind)?createEnemy(kind,99,190,270):createBoss(99,kind,[190,270])];
    // Isolated no-fire/no-damage observation, never used for victory validation.
    this.run.damagePlayer=()=>false;this.run.enemies[0].warmup=0;this.run.weapon.cooldown=999;this.run.player.x=260;this.run.player.y=510;
    this.qaHold=true;this.qaAuto=false;this.movement.read=()=>({x:0,y:0});this.resetMetrics('V0.27 mobilité '+kind);this.drawActors(0);this.publishQA();
  }
  shaftQA(kind) {
    this.journey=false;this.start('grisoux');this.run=new Run(()=>.5,{}, {weaponId:'grisoux',zoneId:'shaft59'});this.drawWeapon();this.choices.hide();this.ui.hide();this.mode='playing';
    this.run.paused=false;this.run.untilSpawn=999;this.run.weapon.cooldown=999;this.qaHold=true;this.qaAuto=false;this.qaSteps=1;this.movement.read=()=>({x:0,y:0});this.upgrades=new UpgradeFlow(this.run);
    this.run.player.x=225;this.run.player.y=490;
    if(['ennemis','instabilite'].includes(kind)){
      this.run.enemies=['deepdriller','surveyor','gasminer'].map((id,i)=>createEnemy(id,i+1,95+i*125,300));this.run.enemies.forEach(e=>{e.warmup=0;});
      if(kind==='instabilite')this.run.shaftHazards.request(0,[this.run.player],{radius:42,warning:1.6});
    }else{
      const wave=kind==='triple'?20:kind==='cager'?5:kind==='compressor'?10:15;this.run.waveIndex=wave-2;this.run.wavePhase='cleared';this.run.enterNextWave();this.run.wavePhase='combat';
      this.run.enemies.forEach(b=>{b.warmup=0;b.phaseTime=0;});this.run.update(.01);
    }
    for(const view of this.enemyViews.values())view.container.destroy();this.enemyViews.clear();
    this.resetMetrics('V0.27 '+kind);this.drawActors(0);this.publishQA();
  }
  polishQA(kind) {
    this.start('grisoux');this.run=new Run(()=>.5,{}, {weaponId:'grisoux',zoneId:kind.startsWith('circle')?'galleries':'tracks'});this.drawWeapon();this.choices.hide();this.ui.hide();this.mode='playing';
    this.run.paused=false;this.run.waveIndex=(kind.startsWith('circle')?10:kind==='wagons'?5:15)-2;this.run.wavePhase='cleared';this.run.choicePending=false;this.run.enterNextWave();this.run.wavePhase='combat';
    this.upgrades=new UpgradeFlow(this.run);this.run.weapon.cooldown=999;this.qaHold=true;this.qaAuto=false;this.qaSteps=1;this.movement.read=()=>({x:0,y:0});
    const b=this.run.enemies[0];b.warmup=0;b.phaseTime=0;this.run.player.x=225;this.run.player.y=450;
    if(kind==='wagons'){summonRailWagon(this.run,b);b.attackCount=2;for(let i=0;i<66;i++)super.update(0,1000/60);}
    else if(kind.startsWith('circle')){b.x=225;b.y=320;b.attackCount=3;if(kind==='circle8'){b.hp=b.maxHealth*.4;b.circleCount=1;}this.run.update(.01);}
    else {b.railCount=kind==='horizontal'?0:kind==='vertical'?1:3;if(kind==='cross')b.hp=b.maxHealth*.4;this.run.update(.01);}
    this.resetMetrics('V0.27 '+kind);this.drawActors(0);this.publishQA();
  }
  energyQA(build) {
    this.start('grisoux');this.choices.hide();this.run.paused=false;this.mode='playing';this.ui.hide();
    this.qaHold=true;this.qaAuto=false;this.qaSteps=1;this.run.untilSpawn=999;
    this.run.player.x=90;this.run.player.y=390;this.movement.read=()=>({x:0,y:0});
    this.run.enemies=[170,245,320].map((x,i)=>{const e=createEnemy('miner',i+1,x,390);e.warmup=0;e.update=()=>{};e.hp=i?90:5;return e;});
    for(const id of ['boots','plates',...(build?['conduit','reinforced-conduit','reinforced-conduit']:[])]){UPGRADES.find(p=>p.id===id).apply(this.run);this.run.upgradeRanks[id]=(this.run.upgradeRanks[id]||0)+1;}
    this.resetMetrics('Énergie '+(build?'Conduit III':'base'));this.drawActors(0);this.publishQA();
  }
  perksQA(kind) {
    this.start(kind === 'smg' ? 'smg' : 'shotgun');
    this.choices.hide(); this.run.paused=false; this.mode='playing'; this.ui.hide();
    this.showcase=kind; this.qaAuto=false; this.qaHold=false; this.qaSteps=1;
    this.run.player.x=110;this.run.player.y=390;this.run.untilSpawn=999;
    this.movement.read=()=>({x:0,y:0});
    const ids=kind==='smg'?['magazine','heat','piercing']:kind==='shotgun'?['buckshot','double','sawn']:kind==='grisou'?['grisou']:['plates','boots'];
    for(const id of ids){UPGRADES.find(p=>p.id===id).apply(this.run);this.run.upgradeRanks[id]=1;}
    this.run.random=()=>0;
    this.run.enemies=[180,225,270].map((x,index)=>{
      const e=createEnemy('miner',index+1,x,390);e.warmup=0;e.update=()=>{};e.hp=10000;return e;
    });
    if(kind==='grisou'){this.run.grisou.kills=5;this.run.enemies.forEach(e=>e.hp=1);}
    this.resetMetrics('perks '+kind);
    if(kind==='shield')this.qaHold=true;
    this.drawActors(0);this.publishQA();
  }
  drillQA() {
    this.enemiesQA(false);
    for (const label of this.qaLabels) label.destroy(); this.qaLabels = [];
    this.run.enemies = [createEnemy('drill', 3, 225, 230)];
    this.run.enemies[0].warmup = 0; this.run.enemies[0].cooldown = 0;
    this.run.player.x = 225; this.run.player.y = 410;
    this.run.weapon.cooldown = 999; // Isolate the hostile telegraph/projectile for manual dodge QA.
    this.movement.read = this.manualRead;
    this.qaHold = false; this.qaSteps = 1;
  }
  pressureQA() {
    this.enemiesQA(false);
    for (const label of this.qaLabels) label.destroy(); this.qaLabels = [];
    this.run.enemies = [['rat',80,320],['rat',320,430],['miner',220,230],['miner',90,520],['drill',70,190],['drill',340,190],['drill',355,590]].map(([kind,x,y], i) => {
      const e = createEnemy(kind,i+1,x,y); e.warmup = 0;
      e.angle = Math.atan2(this.run.player.y-y,this.run.player.x-x);
      if (kind === 'drill') this.run.hostileProjectiles.fire(e,e.angle);
      return e;
    });
    this.run.spawned = 7;
    // Fixture replaces IDs with other types; production IDs stay unique per run.
    for (const view of this.enemyViews.values()) view.container.destroy();
    this.enemyViews.clear();
    this.run.hostileProjectiles.update(.35, this.run.player, this.run.player, () => {});
    this.drawActors(0); this.resetMetrics('pression'); this.publishQA();
  }
  dropsQA(number, count) {
    this.start(); this.choices.hide(); this.run.paused = false;
    this.upgrades = new UpgradeFlow(this.run);
    this.run.waveIndex = number - 1; this.run.spawned = this.run.wave.total;
    this.run.enemies = []; this.run.player.x = 350; this.run.player.y = 565;
    this.run.loot = new RoomLoot(number, count, () => 0);
    for (let id = 1; id <= count; id++) this.run.loot.onKill({ id, x: 80 + ((id - 1) % 4) * 70, y: 230 + Math.floor((id - 1) / 4) * 70 });
    this.qaAuto = false; this.qaHold = true; this.mode = 'playing'; this.ui.hide();
    this.movement.read = () => ({ x: 0, y: 0 });
    this.run.waveElapsed = 3;  this.drawActors(0);
    this.resetMetrics('drops'); this.publishQA();
  }
  publishQA() {
    const run = this.run;
    document.querySelector('.hud .eyebrow').textContent=run.world.name;
    const data = { ...this.metrics,mobility:run.enemies.map(e=>({id:e.bossId||e.kind,x:e.x,y:e.y,phase:e.phase,recoveryElapsed:e.recoveryElapsed})),tripleEngaged:tripleOwners(run).size,tripleMajors:run.rift?run.rift.majorOwners().size:tripleOwners(run,true).size,riftBursts:run.rift?.shots.bursts,hostileCount:run.hostileProjectiles.pool.filter(b=>b.active).length,shaftHazards:run.shaftHazards?.items, bossPatterns:run.enemies.filter(e=>e.kind==='boss').map(e=>({id:e.bossId,pattern:e.pattern,projectilePattern:e.projectilePattern,circleShots:e.circleShots,railOrientation:e.railOrientation,phase:e.phase,phaseTime:e.phaseTime,hazards:e.hazards})),bossWagons:run.enemies.filter(e=>e.summoner).map(e=>({id:e.id,x:e.x,y:e.y,phase:e.phase,retire:e.retireRemaining})), energyBuild:{targets:run.weapon.maxTargets,piercing:run.weapon.piercing,boost:run.player.boostSeconds,plates:run.shield,enemies:run.enemies.map(e=>({id:e.id,hp:e.hp}))}, wagonTargeting:this.run.enemies.filter(e=>e.kind==='wagon').map(e=>({x:e.x,y:e.y,endX:e.endX,chargeAngle:e.chargeAngle,phase:e.phase,warning:e.phaseTime,player:{x:run.player.x,y:run.player.y}})), loadedAppearances:Object.values(COMBAT_APPEARANCES).filter(a=>this.textures.exists(a.key)).map(a=>a.id), entitySprites:this.enemyViews.size+2, status: run.status, phase: run.wavePhase, wave: run.waveNumber,
      arenaUnchanged: this.arenaAtStart === this.arenaView.base.background, elapsed: Number(run.elapsed.toFixed(2)), talents:[...run.talents.ids],revived:run.talents.revived,heat:run.weapon.heat, perks:run.upgradeRanks, hp: run.player.hp, kills: run.kills, choices: this.upgrades?.count, drops: run.loot.activeCount,
      collected: run.collectedRewards, wallet: this.wallet.snapshot.wallet, zone:run.world.id, progress:this.wallet.snapshot.progress, firstVictory:this.wallet.zoneClaims.get(run)?.firstDiamond||0, crates:this.wallet.snapshot.crates, crateAward:this.wallet.crateClaims.get(run),
      meanUpdateRenderMs: this.metrics.frames ? Number((this.metrics.workMs / this.metrics.frames).toFixed(3)) : 0 };
    report.textContent = JSON.stringify(data, null, 2);
    panel.querySelector('summary').textContent = `QA ${this.metrics.mode} · ${run.status} · vague ${run.waveNumber} · ${run.kills} kills · ${run.loot.activeCount} drops`;
  }
  update(time, milliseconds) {
    if (!this.metrics || this.qaHold) return;
    const started = performance.now();
    for (let step = 0; step < this.qaSteps; step++) {
      if (this.qaAuto && this.mode === 'choice') this.chooseQA();
      if(this.tracksNormal&&skipReservedBoss(this.run)){this.qaHold=true;break;}
      super.update(time, this.qaAuto ? 1000 / 60 : milliseconds);
      if(this.captureOverlap&&this.run.wave.final&&tripleOwners(this.run).size===3){this.captureOverlap=false;this.qaHold=true;break;}
      if(this.railBossOnly&&this.run.wavePhase==='cleared'){this.qaHold=true;break;}
      if(this.tracksNormal&&this.run.waveNumber===this.tracksCapture&&this.run.wavePhase==='combat'&&this.run.enemies.length>=Math.min(5,this.run.wave.maxAlive)&&this.run.enemies.some(e=>e.active&&e.phase==='warning')){this.qaHold=true;break;}
      if ((this.captureBoss && this.run.waveNumber === (this.captureBoss===true?5:this.captureBoss) && this.run.wavePhase === 'preparing') || (this.captureChoice === this.run.waveNumber && this.mode === 'choice') || (this.captureWave===this.run.waveNumber && this.run.enemies.length>=8)) { this.qaHold = true; break; }
      if (this.showcase && ((this.showcase === 'focus' && this.run.weapon.focus?.bonus >= .25) || (this.showcase === 'smg' && this.run.weapon.heat >= .4) || (this.showcase === 'shotgun' && this.metrics.shots > 0) || (this.showcase === 'grisou' && this.metrics.explosions > 0))) { this.qaHold=true; break; }
      if (this.captureRoom4 && this.run.waveNumber === 4 && new Set(this.run.enemies.map(e => e.kind)).size === 3 && this.run.enemies.some(e => e.kind === 'drill' && e.phase === 'warning')) {
        this.qaHold = true; break;
      }
    }
    this.metrics.maxEffects=Math.max(this.metrics.maxEffects||0,this.effects.items.filter(p=>p.life>0).length);
    this.metrics.frames++;
    this.metrics.workMs += performance.now() - started;
    this.publishQA();
    if (this.mode === 'result') this.qaHold = true;
  }
}
new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: 450, height: 800,
  backgroundColor: '#182326', audio: { noAudio: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, powerPreference: 'low-power' }, fps: { target: 60 },
  input: { activePointers: 3 }, scene: [QAScene] });
