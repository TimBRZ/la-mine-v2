import {isPureProjectile} from './projectile-attacks.js';
import {ForgeCombat} from './forge/combat.js';
import {DepthsCombat} from './depths/combat.js';
import {RiftCombat} from './rift/combat.js';
import {updateTripleBoss} from './triple-pressure.js';
import {ShaftHazards} from './shaft-hazards.js';
import { RunTalents } from './talents.js';
import { railHazardTouches } from './rail-bosses.js';
import { summonRailWagon, bossWagonSpawn, retireBossWagons } from './rail-boss-encounter.js';
import { ROOM } from './config.js';
import { clampToRoom, segmentCircle } from './math.js';
import { Player } from './player.js';
import { createEnemy, ENEMY_TYPES } from './enemies/registry.js';
import { EnemyProjectiles } from './enemy-projectiles.js';
import { Weapon } from './weapon.js';
import { Projectiles } from './combat.js';
import { resolveExplosions } from './explosions.js';
import { createBoss } from './bosses.js';
import { ZONE_CONFIGS, zoneRewards } from './zones.js';
import { WORLD } from './world.js';
import { ARENA, WAVE_READY_SECONDS, BOSS_INTRO_SECONDS } from './waves.js';
import { applyPermanentStats } from './permanent-upgrades.js';
import { StationaryFire } from './stationary-fire.js';
import { WaveLoot } from './wave-loot.js';
import { emptyWallet } from './resources.js';

export class Run {
  constructor(random = Math.random, levels = {}, options = {}) {
    Object.assign(this, { player: new Player(), weapon: new Weapon(options.weaponId), projectiles: new Projectiles(), enemies: [], spawned: 0, kills: 0, elapsed: 0, untilSpawn: .45, status: 'playing' });
    this.random = random;
    this.fireControl = new StationaryFire();
    this.hostileProjectiles = new EnemyProjectiles();
    this.grisou = { enabled: false, kills: 0 };
    this.shieldRank = 0; this.shield = 0; this.shieldSeconds = 0;
    this.upgradeRanks = {};
    this.waveIndex = 0;
    this.world = options.world || (options.zoneId ? ZONE_CONFIGS[options.zoneId] : null) || WORLD;
    this.shaftHazards=this.world.gimmick==='instability'?new ShaftHazards():null;
    if(this.world.id==='rift'){this.rift=new RiftCombat(this);this.shaftHazards=this.rift.ground;this.hostileProjectiles=this.rift.shots;}
    if(this.world.id==='depths'){this.depths=new DepthsCombat(this);this.shaftHazards=this.depths.ground;this.hostileProjectiles=this.depths.shots;}
    if(this.world.id==='forge'){this.forge=new ForgeCombat(this);this.shaftHazards=this.forge.ground;this.hostileProjectiles=this.forge.shots;}
    this.wavePhase = 'combat';
    this.waveElapsed = 0;
    this.stillSeconds = 0;
    this.lastSpawnPoint = null;
    this.waveKills = 0;
    this.nextEnemyId = 0;
    this.choicePending = false;
    this.arena = ARENA;
    this.preparationRemaining = 0;
    this.damageTaken = 0;
    this.completedWaves = 0;
    this.rewardRandom = options.rewardRandom || Math.random;
    this.rewardPlans = zoneRewards(this.world, this.rewardRandom);
    this.collectedRewards = emptyWallet();
    this.loot = new WaveLoot(this.waveNumber, this.wave.total, this.rewardRandom, this.rewardPlans[this.waveIndex]);
    applyPermanentStats(this, levels);
    this.talents=new RunTalents(options.talents,options.talentRandom||Math.random);
    this.talents.configure(this);
  }
  get wave() { return this.world.waves[this.waveIndex]; }
  get waveNumber() { return this.waveIndex + 1; }
  refreshShield() { this.shield = this.shieldRank; this.shieldSeconds = 0; }
  enterNextWave() {
    // Incomplete content is a reservation, never an empty boss victory.
    if(this.world.waves[this.waveIndex+1]?.reservedBoss)return false;
    if (this.status !== 'playing' || this.wavePhase !== 'cleared' || this.choicePending || this.paused || this.waveIndex >= this.world.waves.length - 1) return false;
    this.waveIndex++;
    this.wavePhase = 'preparing'; this.waveElapsed = 0; this.waveKills = 0;
    this.stillSeconds=0;this.lastSpawnPoint=null;
    this.preparationRemaining = this.wave.boss ? BOSS_INTRO_SECONDS : WAVE_READY_SECONDS;
    this.spawned = 0; this.untilSpawn = .45; this.enemies = [];
    this.loot = new WaveLoot(this.waveNumber, this.wave.total, this.rewardRandom, this.rewardPlans[this.waveIndex]);
    this.talents.configureLoot(this.loot);
    this.fireControl.reset();
    this.weapon.resetStance();
    this.refreshShield();
    this.player.boostSeconds=0;
    this.hostileProjectiles.clear();
    this.shaftHazards?.clear();this.depths?.darkness.clear();
    this.player.vx = this.player.vy = 0;
    this.weapon.flash = this.weapon.recoil = 0;
    for (const pellet of this.projectiles.pool) pellet.active = false;
    if (this.wave.boss) {
      // Keep the existing boss spawn and behaviour; only move a player too close
      // to its entry point. No healing, stat reset or change to the arena.
      if (this.wave.spawns.some(([x,y])=>Math.hypot(this.player.x-x,this.player.y-y)<200)) {
        this.player.x = 225; this.player.y = 500;
      }
      this.enemies = this.wave.bosses.map((id,i)=>createBoss(++this.nextEnemyId,id,this.wave.spawns[i],this.wave.healthScale,{final:this.wave.final,slot:i}));
      this.spawned = this.enemies.length;
      this.tripleStartingHealth=this.enemies.reduce((sum,e)=>sum+e.maxHealth,0);
    }
    return true;
  }
  spawn() {
    if (this.wavePhase !== 'combat' || this.wave.boss || this.spawned >= this.wave.total || this.enemies.length >= this.wave.maxAlive) return false;
    // Fixed arena and fixed spawn anchors, not procedural generation. Choose a
    // distant safe anchor; a visible telegraph precedes every pursuer.
    const kind = this.wave.enemies[this.spawned];
    if(this.rift&&!this.rift.canSpawn(kind))return false;
    const kindCap=this.wave.kindCaps?.[kind];
    if(kindCap && this.enemies.filter(e=>e.alive&&e.kind===kind).length>=kindCap)return false;
    const spawnPoints = ENEMY_TYPES[kind].spawnPoints || this.wave.spawns;
    const rotated = spawnPoints.map((_, i) => spawnPoints[(i + this.spawned * 3) % spawnPoints.length]);
    const free = rotated.filter(([x, y]) => Math.hypot(x - this.player.x, y - this.player.y) > (ENEMY_TYPES[kind].minSpawnDistance || 180) && this.enemies.every(e => Math.hypot(x - e.x, y - e.y) > (kind === 'drill' && e.kind === 'drill' ? 140 : 42)));
    const camping=this.wave.pressure && this.stillSeconds>=this.wave.pressure.campAfter;
    if(camping && kind==='rat' && this.lastSpawnPoint)free.sort((a,b)=>Math.hypot(...b.map((v,i)=>v-this.lastSpawnPoint[i]))-Math.hypot(...a.map((v,i)=>v-this.lastSpawnPoint[i])));
    const point = ENEMY_TYPES[kind].selectSpawn ? ENEMY_TYPES[kind].selectSpawn(free,this.player) : free[0];
    if (!point) return false;
    this.spawned++;
    const enemy=createEnemy(kind, ++this.nextEnemyId, ...point);
    enemy.hp=enemy.maxHealth=Math.round(enemy.maxHealth*(this.wave.pressure?.[kind+'Health']||1));
    this.lastSpawnPoint=point;
    this.enemies.push(enemy);
    return true;
  }
  update(dt, input = { x: 0, y: 0 }) {
    const events = [];
    if (this.status !== 'playing' || this.paused) return events;
    // Pause/focus handled by the scene. A hitch never advances a lethal second.
    dt = Math.min(Math.max(dt, 0), .04);
    this.elapsed += dt;
    if (this.wavePhase === 'preparing') {
      this.waveElapsed += dt;
      this.preparationRemaining = Math.max(0, this.preparationRemaining - dt);
      if (this.preparationRemaining === 0) this.wavePhase = 'combat';
      return events;
    }
    this.waveElapsed += dt;
    const previousPlayer = { x: this.player.x, y: this.player.y };
    this.player.update(dt, input);
    if (this.wavePhase === 'collecting') {
      this.loot.update(dt, this.player, events);
      if (this.loot.phase === 'done') {
        for (const id of Object.keys(this.collectedRewards)) this.collectedRewards[id] += this.loot.collected[id];
        this.completedWaves = this.waveNumber;
        this.talents.complete(this,events);
        this.wavePhase = 'cleared';
        if (this.waveNumber === this.world.waves.length) { this.status = 'won'; events.push({ type: 'won' }); }
        else {
          this.choicePending = this.world.choices.includes(this.waveNumber) || this.waveNumber === this.world.epicAfter;
          events.push({ type: 'wave-clear', wave: this.waveNumber });
        }
      }
      return events;
    }
    if (this.wavePhase === 'cleared') {
      if (this.enterNextWave()) events.push({ type:'wave-enter', wave:this.waveNumber, boss:Boolean(this.wave.boss) });
      return events;
    }
    this.untilSpawn -= dt;
    if (this.untilSpawn <= 0 && this.spawned < this.wave.total && this.enemies.length < this.wave.maxAlive) {
      let spawned = false;
      for (let i=0;i<this.wave.group;i++) { if(!this.spawn())break; spawned=true; }
      if (spawned) this.untilSpawn = this.wave.interval;
    }
    const attacks = [];
    this.stillSeconds=Math.hypot(this.player.vx,this.player.vy)<8 && !input.x && !input.y ? this.stillSeconds+dt : 0;
    this.hostileProjectiles.syncOwners(this.enemies);
    const majorBusy=owner=>this.enemies.some(e=>e!==owner&&e.alive&&((e.projectilePattern==='circle'&&['warning','burst'].includes(e.phase))||(e.crossPattern&&(e.phase==='warning'||e.hazards?.length))));
    const pressure={shaftAttack:(owner,points,spec)=>Boolean(this.shaftHazards&&this.shaftHazards.request(owner.id,points,spec)),tuning:this.wave.pressure,stillSeconds:this.stillSeconds,
      canSummonWagon:()=>Boolean(bossWagonSpawn(this)),
      reserveCircle:(owner,count)=>!majorBusy(owner)&&this.hostileProjectiles.reserveCircle(owner,count),
      canCross:owner=>!majorBusy(owner)&&!this.hostileProjectiles.reservations.size&&!this.hostileProjectiles.pool.some(p=>p.active&&p.bossMajor)};
    this.depths?.darkness.update(dt,this);
    for (const enemy of this.enemies) {if(this.forge)this.forge.updateActor(enemy,dt,attacks,pressure);else if(this.depths)this.depths.updateActor(enemy,dt,attacks,pressure);else if(this.rift)this.rift.updateActor(enemy,dt,attacks,pressure);else updateTripleBoss(this,enemy,dt,attacks,pressure);}
    retireBossWagons(this,dt);
    // Small separation stops identical pursuers collapsing into one stack.
    for (let i = 0; i < this.enemies.length; i++) for (let j = i + 1; j < this.enemies.length; j++) {
      const a = this.enemies[i], b = this.enemies[j];
      if (!a.active || !b.active) continue;
      const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy);
      const separation = a.radius + b.radius;
      if (distance > 0 && distance < separation) {
        const step = Math.min((separation - distance) / 2, 45 * dt);
        const planted = enemy => enemy.fixedPosition;
        if (!planted(a)) { a.x -= dx / distance * step; a.y -= dy / distance * step; }
        if (!planted(b)) { b.x += dx / distance * step; b.y += dy / distance * step; }
        clampToRoom(a, ROOM); clampToRoom(b, ROOM);
      }
    }
    const canFire = this.fireControl.update(dt, this.player, input);
    this.weapon.update(dt, this.player, this.enemies, this.projectiles, events, this.random, canFire);
    this.projectiles.update(dt, this.enemies, events, this.player);
    resolveExplosions(events, this.enemies, this.grisou);
    this.rift?.deaths(events);
    for (const event of events) if (event.type === 'kill') { this.kills++; if(!this.enemies.find(e=>e.id===event.id)?.summoner){this.waveKills++; this.loot.onKill(event);} }
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      if(enemy.summoner&&!this.enemies.some(e=>e.id===enemy.summoner&&e.alive))continue;
      for(const hazard of enemy.hazards||[])if(railHazardTouches(hazard,this.player))this.damagePlayer(1,events);
      if (enemy.bossId === 'effondreur' && enemy.phase === 'recovery') {
        for (const zone of enemy.zones) if(Math.hypot(this.player.x-zone.x,this.player.y-zone.y)<zone.radius+this.player.radius) this.damagePlayer(1,events);
      }
      const touching = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y) <= enemy.radius + this.player.radius;
      const swept = enemy.kind === 'boss' && segmentCircle(enemy.previousX, enemy.previousY, enemy.x, enemy.y, this.player.x, this.player.y, enemy.radius + this.player.radius) !== null;
      const sweptRelative = enemy.sweptContact && segmentCircle(enemy.previousX-previousPlayer.x, enemy.previousY-previousPlayer.y, enemy.x-this.player.x, enemy.y-this.player.y, 0, 0, enemy.radius+this.player.radius) !== null;
      if ((!touching && !swept && !sweptRelative) || enemy.contactDamage<=0) continue;
      if (this.damagePlayer(enemy.contactDamage, events)) {
        const angle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
        enemy.hit(0, angle, 170);
      }
    }
    this.shaftHazards?.update(dt,this,events);
    this.hostileProjectiles.update(dt, this.player, previousPlayer, damage => this.damagePlayer(damage, events));
    for (const attack of attacks) {
      const owner = this.enemies.find(enemy => enemy.id === attack.owner && enemy.alive);
      if(attack.type==='summon-wagon'){if(owner&&this.player.hp>0&&!summonRailWagon(this,owner)){owner.fallbackCharge(this.player);events.push({type:'summon-fallback',owner:owner.id});}continue;}
      // A drill killed by this frame's shotgun/explosion cannot fire posthumously.
      if (owner && this.player.hp > 0) {
        const fired=attack.pattern==='circle'?this.hostileProjectiles.fireCircle(owner,attack.angle,attack.count):this.hostileProjectiles.fireVolley(owner,attack.angle,attack.fan);
        if(fired)events.push({...attack,x:owner.x,y:owner.y});
        else if(this.wave.final||this.rift||owner.bossId==='crachefer'){owner.phase='warning';owner.phaseTime=isPureProjectile(owner)?0:.35;events.push({type:'boss-shot-delayed',owner:owner.id});}
      }
    }
    this.enemies = this.enemies.filter(enemy => enemy.alive && !enemy.retired && (!enemy.summoner || this.enemies.some(e=>e.id===enemy.summoner&&e.alive)));
    this.hostileProjectiles.syncOwners(this.enemies);
    this.loot.update(dt, this.player, events);
    if (this.player.hp <= 0) { this.status = 'lost'; this.loot.discard(); this.hostileProjectiles.clear(); }
    else if (this.spawned === this.wave.total && this.enemies.length === 0 && !this.rift?.pending() && !this.depths?.pending() && !this.forge?.pending()) {
      this.wavePhase = 'collecting';
      this.shaftHazards?.clear();
      this.weapon.resetStance();
      this.loot.beginCollection(this.player);
      this.weapon.flash = this.weapon.recoil = 0;
      for (const pellet of this.projectiles.pool) pellet.active = false;
      this.hostileProjectiles.clear();
      events.push({ type: 'wave-loot', wave: this.waveNumber });
    }
    if (this.status !== 'playing') events.push({ type: this.status });
    return events;
  }
  damagePlayer(damage, events) {
    if (this.player.invulnerable > 0 || this.player.hp <= 0) return false;
    const before = this.player.hp;
    if(damage<=0)return false;
    const absorbed = this.shield>0 ? damage : 0;
    if(absorbed)this.shield--;
    if (!this.player.hurt(damage - absorbed)) return false;
    if (absorbed) events.push({ type:'shield-hit', x:this.player.x, y:this.player.y });
    this.talents.rescue(this.player,events);
    this.damageTaken += Math.max(0,before - this.player.hp);
    if (before > this.player.hp) events.push({ type: 'hurt', x: this.player.x, y: this.player.y });
    return true;
  }
}
