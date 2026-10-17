// Browser fixtures live outside src and cannot be loaded by the normal server.
// Real scene/render/UI/combat; test-only steering, seeded perks, memory wallet.
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
panel.style.cssText = 'position:fixed;top:0;left:0;z-index:100;width:100%;font:10px monospace;color:#fff;background:#192326';
panel.innerHTML = '<summary>QA V0.15 · profil QA isolé</summary><div id="qa-actions"></div><pre id="qa-report" style="white-space:pre-wrap;max-height:180px;overflow:auto"></pre>';
document.body.append(panel);
const report = panel.querySelector('#qa-report');

class QAScene extends RoomScene {
  create() {
    super.create();
    this.qaStorage = new LocalProfileStorage({ getItem: () => localStorage.getItem('la-mine-v2:qa-v015'), setItem: (_,value) => localStorage.setItem('la-mine-v2:qa-v015',value) });
    this.wallet = new Wallet(this.qaStorage);
    this.menu.wallet = this.ui.wallet = this.ui.workshop.wallet = this.wallet;
    this.menu.refreshBalance(); this.menu.refreshRelief();
    this.manualRead = this.movement.read.bind(this.movement);
    this.qaLabels = [];
    this.qaHold = true;
    for (const [label, action] of [
      ['Réinitialiser portefeuille QA', () => { localStorage.removeItem('la-mine-v2:qa-v015'); this.wallet = new Wallet(this.qaStorage); this.menu.wallet = this.ui.wallet = this.ui.workshop.wallet = this.wallet; this.menu.show('home'); }],
      ...[1,8,24,48].map(hours => ['Relève '+hours+' h', () => { this.wallet.profile.relief = {startedAt:Date.now()-hours*HOUR_MS}; this.qaStorage.write(this.wallet.snapshot); this.showMenu('relief'); }]),
      ['Piloter la run lancée', () => { this.qaAuto = true; this.qaHold = false; this.qaSteps = 4; this.resetMetrics('V0.15 navigation'); this.movement.read = () => steer(this.run); }],
      ['Défaite de contrôle', () => { this.start(this.menu.state.weaponId); this.choices.hide(); this.run.paused = false; this.run.player.hp = 0; this.mode = 'playing'; this.qaHold = false; this.qaAuto = false; this.qaSteps = 1; this.resetMetrics('défaite'); }],
      ['Run complète fusil', () => this.beginQA('shotgun',1)],
      ['Run complète mitraillette', () => this.beginQA('smg',5,false,0,true)],
      ['Run complète mitraillette · Atelier 2', () => this.beginQA('smg',5,false,2)],
      ['Focus boss', () => this.focusQA()],
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
      ['Continuer la run', () => { this.qaHold = false; this.captureWave=0; this.captureRoom4 = false; this.captureBoss = false; this.captureChoice = 0; if (this.mode !== 'choice') {this.mode = 'playing'; this.ui.hide();} }],
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
      this.metrics.maxAlive=Math.max(this.metrics.maxAlive,this.run.enemies.length);
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
        if (event.type === 'enemy-shot') this.metrics.enemyShots++;
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
    const id = (this.heatBuild ? ['critical-heat','trigger','heat','plates','boots','piercing','magazine'] : this.specialBuild ? ['total-piercing','piercing','heat','magazine','trigger','plates','grisou','boots'] : ['double-cannon','total-piercing','buckshot','trigger','piercing','boots','double','plates','heat','magazine','grisou','sawn']).find(id => this.upgrades.offered.some(c => c.id === id));
    this.upgrades.choose(id); this.choices.hide(); this.mode = 'playing'; this.ui.hide();
  }
  start(weaponId = 'shotgun') {
    for (const label of this.qaLabels || []) label.destroy();
    this.qaLabels = [];
    this.showcase = null;
    super.start(weaponId);
    if (this.menu.state.launching) {
      let seed = 16; const rng = () => ((seed = (Math.imul(seed,1664525) + 1013904223) >>> 0) / 4294967296);
      this.run.random = rng; this.run.rewardRandom = () => .99;
      this.upgrades = new UpgradeFlow(this.run, rng); this.upgrades.open(); this.showChoice({ first: true });
    }
  }
  beginQA(weaponId = 'shotgun', startSeed = 1, specialBuild = false, atelierRank = 0, heatBuild = false) {
    this.specialBuild = specialBuild;this.heatBuild=heatBuild;
    this.qaLevels={power:atelierRank,health:atelierRank,mechanics:atelierRank,mobility:atelierRank};
    this.wallet.profile.levels={...this.qaLevels};
    this.start(weaponId);
    let seed = startSeed;
    const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    this.run.random = rng;
    this.run.rewardRandom = () => .99;
    this.run.rewardPlans=worldRewards(()=>.99);
    this.run.loot.plan={...this.run.rewardPlans[0]};
    this.upgrades = new UpgradeFlow(this.run, rng); this.upgrades.open(); this.chooseQA();
    this.qaAuto = true; this.qaHold = false; this.qaSteps = 4;
    this.captureBoss = false; this.captureChoice = 0; this.captureRoom4 = false;
    this.captureWave=0;
    this.resetMetrics('V0.15 ' + weaponId + ' · Atelier '+atelierRank);
    this.metrics.seed=startSeed;this.metrics.levels={...this.qaLevels};
    this.movement.read = () => steer(this.run);
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
    const data = { ...this.metrics, status: run.status, phase: run.wavePhase, wave: run.waveNumber,
      arenaUnchanged: this.arenaAtStart === this.arenaView.base.background, elapsed: Number(run.elapsed.toFixed(2)), heat:run.weapon.heat, perks:run.upgradeRanks, hp: run.player.hp, kills: run.kills, choices: this.upgrades?.count, drops: run.loot.activeCount,
      collected: run.collectedRewards, wallet: this.wallet.snapshot.wallet,
      meanUpdateRenderMs: this.metrics.frames ? Number((this.metrics.workMs / this.metrics.frames).toFixed(3)) : 0 };
    report.textContent = JSON.stringify(data, null, 2);
    panel.querySelector('summary').textContent = `QA ${this.metrics.mode} · ${run.status} · vague ${run.waveNumber} · ${run.kills} kills · ${run.loot.activeCount} drops`;
  }
  update(time, milliseconds) {
    if (!this.metrics || this.qaHold) return;
    const started = performance.now();
    for (let step = 0; step < this.qaSteps; step++) {
      if (this.qaAuto && this.mode === 'choice') this.chooseQA();
      super.update(time, this.qaAuto ? 1000 / 60 : milliseconds);
      if ((this.captureBoss && this.run.waveNumber === (this.captureBoss===true?5:this.captureBoss) && this.run.wavePhase === 'preparing') || (this.captureChoice === this.run.waveNumber && this.mode === 'choice') || (this.captureWave===this.run.waveNumber && this.run.enemies.length>=8)) { this.qaHold = true; break; }
      if (this.showcase && ((this.showcase === 'focus' && this.run.weapon.focus?.bonus >= .25) || (this.showcase === 'smg' && this.run.weapon.heat >= .4) || (this.showcase === 'shotgun' && this.metrics.shots > 0) || (this.showcase === 'grisou' && this.metrics.explosions > 0))) { this.qaHold=true; break; }
      if (this.captureRoom4 && this.run.waveNumber === 4 && new Set(this.run.enemies.map(e => e.kind)).size === 3 && this.run.enemies.some(e => e.kind === 'drill' && e.phase === 'warning')) {
        this.qaHold = true; break;
      }
    }
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
