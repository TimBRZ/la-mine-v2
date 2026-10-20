import {preloadWhiteMarch} from './furnace-white-march-vfx.js';
import {applyCombatRenderLayers} from './combat-render-layers.js';
import {preloadHeatingSectors} from './furnace-heating-sectors-vfx.js';
import {preloadFurnaceCone} from './furnace-cone-vfx.js';
import {preloadWhitehotPlates} from './furnace-whitehot-plates-vfx.js';
import {preloadFurnaceArm} from './furnace-rotating-arm-vfx.js';
import {preloadRivetImpact} from './rivet-impact-vfx.js';
import {preloadScorifierTrail} from './scorifier-thermal-trail-vfx.js';
import {preloadChauffeurPlate} from './chauffeur-heat-plate-vfx.js';
import {preloadCracheurGas} from './cracheur-gas-vfx.js';
import {preloadLampistShot} from './lampist-projectile-vfx.js';
import {preloadEnemyRivet} from './enemy-rivet-vfx.js';
import {ForgeSpriteVfx} from './forge-sprite-vfx.js';
import {weaponMuzzleAnchor,projectileVisualPosition} from './hero-muzzle.js';
import {preloadShotgunVfx,registerShotgunVfx} from './shotgun-vfx.js';
import {preloadSmgVfx,registerSmgVfx} from './smg-vfx.js';
import {preloadGrisouxVfx,registerGrisouxVfx,useCombatVfx,muzzleVisible,overloadFeedback} from './grisoux-vfx.js';
import {preloadDepthsBossMasters} from './depths/boss-view.js';
import {preloadForgeMasters} from './forge/boss-view.js';
import { preloadCombatAppearances, useCombatAppearance, createAppearanceMotion, animateCombatAppearance } from './combat-appearances.js';
import { preloadHeroAnimation, registerHeroFrames, createHeroAnimationState, applyHeroAnimation } from './hero-animation.js';
import { preloadWeaponVisuals, registerWeaponVisualFrames, weaponVisual, heldWeaponPose, useWeaponVfx, WEAPON_VFX_DEPTH } from './weapon-visuals.js';
import {ContractTracker} from './contract-tracker.js';
import {createLeaderboardService} from './leaderboard/create-service.js';
import {RunPerformance} from './leaderboard/run-performance.js';
import { zoneAvailable } from './zone-progress.js';
import { MainMenu } from './menu/main-menu.js';
import { WORLD } from './config.js';
import { Run } from './run.js';
import { MovementInput } from './input.js';
import { Effects } from './effects.js';
import { UI } from './ui.js';
import { UpgradeFlow } from './upgrades.js';
import { UpgradeOverlay } from './upgrade-overlay.js';
import { makeTextures } from './textures.js';
import { ArenaView } from './arena-view.js';
import { Wallet } from './wallet.js';
import { LootView } from './loot-view.js';
import { makeEnemyView, updateEnemyView, EnemyAttacksView } from './enemies/view.js';
import {ensureForgeSheets,releaseForgeSheets,ensureDepthsSheets,releaseDepthsSheets,preloadEnemyAnimations,registerEnemyFrames,retireEnemyView,updateEnemyDeaths,clearEnemyDeaths} from './forge-animation.js';

export class RoomScene extends Phaser.Scene {
  constructor() { super('Room'); }
  preload() { preloadWhiteMarch(this); preloadHeatingSectors(this); preloadFurnaceCone(this); preloadWhitehotPlates(this); preloadFurnaceArm(this); preloadRivetImpact(this); preloadScorifierTrail(this); preloadChauffeurPlate(this); preloadCracheurGas(this); preloadLampistShot(this); preloadEnemyRivet(this); preloadForgeMasters(this); preloadDepthsBossMasters(this); preloadCombatAppearances(this); preloadHeroAnimation(this); preloadWeaponVisuals(this); preloadShotgunVfx(this); preloadSmgVfx(this); preloadGrisouxVfx(this); preloadEnemyAnimations(this); }
  create() {
    makeTextures(this);
    this.heroSheetReady=registerHeroFrames(this.textures);
    registerWeaponVisualFrames(this.textures);
    registerShotgunVfx(this.textures);
    registerSmgVfx(this.textures);
    registerGrisouxVfx(this.textures);
    this.enemySheetsReady=registerEnemyFrames(this.textures);
    this.heroAnimation=createHeroAnimationState();this.visualShot=false;this.visualHit=false;this.visualTime=0;this.shotAge=1;this.footstepTime=0;
    this.mode = 'intro';
    this.wallet = new Wallet();
    this.leaderboard=createLeaderboardService();
    this.run = new Run();
    this.arenaView = new ArenaView(this);
    // Movement instructions remain below the joystick; this space holds perk readouts.
    this.arenaView.base.hint.setVisible(false);
    this.perkAura = this.add.graphics().setDepth(19);
    this.perkFlash = this.add.text(0,0,'',{fontFamily:'system-ui',fontSize:'12px',fontStyle:'bold',color:'#ffe3a0',stroke:'#172126',strokeThickness:3}).setOrigin(.5).setDepth(50).setVisible(false);
    this.perkFlashSeconds = 0;
    this.lootView = new LootView(this);
    this.enemyAttacksView = new EnemyAttacksView(this);
    this.forgeSpriteVfx = new ForgeSpriteVfx(this);
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.enemyViews = new Map();
    this.shadow = this.add.ellipse(225, 429, 31, 12, 0x0b1216, .5).setDepth(9);
    this.playerView = this.add.image(225, 414, 'player').setDepth(20);
    this.heroAppearance=useCombatAppearance(this.playerView,'hero',this.textures);
    this.heroMotion=createAppearanceMotion(225,414);
    this.gun = this.add.container(225, 414).setDepth(21);
    this.drawWeapon();
    this.muzzle = this.add.image(0, 0, 'muzzle').setOrigin(0, .5).setDepth(WEAPON_VFX_DEPTH).setVisible(false);
    this.pelletViews = this.run.projectiles.pool.map(() => this.add.image(0, 0, 'pellet').setDepth(WEAPON_VFX_DEPTH).setVisible(false));
    this.effects = new Effects(this);
    this.damageWash = this.add.rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, 0xdd6e62, 0).setDepth(80);
    this.damageAlpha = 0;
    this.movement = new MovementInput(this, () => this.mode === 'playing');
    this.ui = new UI(() => this.start(this.run.weapon.definition.id, this.run.world.id), () => this.resumeRun(), this.wallet, () => this.showMenu('home'));
    this.menu = new MainMenu(document.querySelector('.shell'), this.wallet, {
      leaderboard:this.leaderboard,
      onLaunch: (id, zoneId) => this.start(id, zoneId),
      onWorkshop: onClose => this.ui.openWorkshop(onClose),
    });
    this.choices = new UpgradeOverlay(document.querySelector('.shell'), id => {
      if (this.mode !== 'choice' || !this.upgrades.choose(id)) return false;
      this.trackContracts();
      if(this.upgrades.afterCombat()){this.showChoice({first:true,bonus:true});return true;}
      this.movement.clear();
      this.mode = 'playing';
      this.ui.hide();
      if (document.hidden || !document.hasFocus()) this.pauseRun();
      return true;
    },()=>{if(this.mode==='choice'&&this.upgrades.reroll())this.showChoice({});});
    this.game.canvas.tabIndex = 0;
    this.pauseRun = () => {
      if (this.mode !== 'playing') return;
      this.mode = 'paused';
      this.movement.clear();
      this.run.player.vx = this.run.player.vy = 0;
      this.ui.pause();
    };
    this.visibility = () => { if (document.hidden) this.pauseRun(); };
    window.addEventListener('blur', this.pauseRun);
    document.addEventListener('visibilitychange', this.visibility);
    this.input.keyboard.on('keydown-ESC', this.pauseRun);
    this.events.once('shutdown', () => {
      clearEnemyDeaths(this);
      this.movement.destroy(); this.ui.destroy(); this.choices.destroy(); this.menu.destroy();
      window.removeEventListener('blur', this.pauseRun);
      document.removeEventListener('visibilitychange', this.visibility);
    });
    this.drawActors(0);
    this.showMenu('home');
  }
  showMenu(page = 'home') {
    this.mode = 'menu';
    this.movement.clear();
    this.choices.hide();
    this.ui.hide();
    this.menu.show(page);
  }
  drawWeapon() {
    this.gun.removeAll(true);
    this.weaponGripX=null;
    const weapon=this.run.weapon.definition.id;
    const held=this.add.image(0,0,'pellet');
    this.heldWeapon=held;
    const visual=weaponVisual(weapon);
    const art=this.textures.exists(visual.key)?visual:useCombatAppearance(held,weapon,this.textures);
    if(art===visual)held.setTexture(visual.key).setDisplaySize(visual.width,visual.height);
    this.weaponHasGrip=art===visual;
    if(art){held.setOrigin(this.weaponHasGrip?visual.grip.x/128:0,this.weaponHasGrip?visual.grip.y/128:art.originY);this.gun.add(held);}
    else {held.destroy();this.gun.add(this.run.weapon.definition.shape.map(parts=>this.add.rectangle(...parts)));}
    document.querySelector('.hud strong').textContent = this.run.weapon.definition.name;
  }
  start(weaponId = 'shotgun', zoneId = 'galleries') {
    this.wallet.refreshSavedProfile();
    if(!zoneAvailable(zoneId, this.wallet.snapshot.progress))return false;
    this.menu.hide();
    for (const view of this.enemyViews.values()) view.container.destroy();
    this.enemyViews.clear();
    clearEnemyDeaths(this);
    if(zoneId==='depths')ensureDepthsSheets(this);else releaseDepthsSheets(this);
    if(zoneId==='forge')ensureForgeSheets(this);else releaseForgeSheets(this);
    this.effects.clear();
    this.perkFlashSeconds = 0; this.perkFlash.setVisible(false);
    this.pelletViews.forEach(view => view.setVisible(false));
    this.run = new Run(Math.random, this.wallet.snapshot.levels, { weaponId, zoneId, talents:this.wallet.snapshot.talents });
    this.contractTracker=new ContractTracker();
    this.runPerformance=new RunPerformance(this.run);
    this.wallet.contractState();
    this.heroMotion=createAppearanceMotion(this.run.player.x,this.run.player.y);
    this.heroAnimation=createHeroAnimationState();this.visualShot=false;this.visualHit=false;this.shotAge=1;this.footstepTime=0;
    this.menu.state.zoneId=zoneId;
    document.querySelector('.hud .eyebrow').textContent=this.run.world.name;
    this.drawWeapon();
    this.upgrades = new UpgradeFlow(this.run);
    this.damageAlpha = 0;
    this.movement.clear();
    this.mode = 'playing';
    this.ui.updateHealth(this.run.player.hp, this.run.player.maxHealth);
    this.ui.hide();
    this.drawActors(0);
    this.upgrades.open();
    this.showChoice({ first: true, context: 'general' });
  }
  showChoice(options) {
    this.mode = 'choice';
    this.movement.clear();
    this.cameras.main.shakeEffect.reset();
    const context = this.upgrades.offered.some(item => item.id === 'grisou') ? 'explosions' : this.upgrades.offered[0].context;
    this.choices.show({ ...options, context, rerollOwned:this.run.talents.has('porion-eye'),rerollAvailable:!this.run.talents.rerolled,rerollUsed:this.run.talents.rerolled }, this.upgrades.offered);
  }
  resumeRun() { this.movement.clear(); this.mode = 'playing'; this.ui.hide(); }
  makeEnemyView(enemy) {
    return makeEnemyView(this, enemy);
  }
  drawHero(dt) {
    const run = this.run, p = run.player;
    const speed = Math.hypot(p.vx, p.vy);
    const bob = (this.reducedMotion?0:Math.sin(run.elapsed * 20)) * Math.min(1.1, speed / 212);
    const recoil = run.weapon.recoil;
    const pose=this.heroSheetReady?applyHeroAnimation(this.playerView,this.textures,this.heroAnimation,{moving:speed>1,shot:this.visualShot,hit:this.visualHit,dead:p.hp<=0},dt,this.reducedMotion):null;
    let y=bob;
    if(pose){this.playerView.setOrigin(.5,.62).setDisplaySize(46,52).setFlipX(Math.cos(p.angle)<-.1).setRotation(0);y=0;}
    else {
      // Reapply the old appearance if a new frame disappeared at runtime.
      this.heroAppearance=useCombatAppearance(this.playerView,'hero',this.textures);
      if(this.heroAppearance)y=animateCombatAppearance(this.playerView,this.heroAppearance,this.heroMotion,p,dt,this.reducedMotion).y;
      else this.playerView.setTexture('player').setOrigin(.5).setScale(1).setRotation(0);
    }
    this.playerView.setPosition(p.x - Math.cos(p.angle) * recoil * .3, p.y + y - Math.sin(p.angle) * recoil * .3);
    this.playerView.setAlpha(p.invulnerable > 0 ? this.reducedMotion?.8:.65+.25*Math.sin(run.elapsed*17) : 1);
    if(this.damageAlpha>.05)this.playerView.setTint(0xffb88f);else this.playerView.clearTint();
    this.shadow.setPosition(p.x, p.y + 14);
    const visual=weaponVisual(run.weapon.definition.id),kick=recoil*visual.recoilScale;
    const grip=this.weaponHasGrip&&pose?heldWeaponPose(visual.id,p.angle,recoil,this.weaponGripX,dt):null;
    if(this.weaponHasGrip)this.heldWeapon.setOrigin(grip?visual.grip.x/128:0,grip?visual.grip.y/128:visual.originY);
    if(grip){
      this.weaponGripX=grip.handX;
      this.gun.setVisible(p.hp>0).setPosition(this.playerView.x+grip.x,this.playerView.y+grip.y).setScale(1,grip.mirror).setRotation(p.angle);
    }else this.gun.setVisible(p.hp>0).setPosition(p.x-Math.cos(p.angle)*kick,p.y-Math.sin(p.angle)*kick+3).setScale(1).setRotation(p.angle);
    this.muzzleAnchor??={x:0,y:0};
    weaponMuzzleAnchor(this.muzzleAnchor,visual,this.gun,this.heldWeapon,this.weaponHasGrip,run.weapon.definition.shape);
    this.shotAge=this.visualShot?0:this.shotAge+dt;
    const muzzle=useCombatVfx(this.muzzle,this.textures,visual.muzzle,this.shotAge);
    if(muzzle)this.muzzle.setTint(0xffffff).setDisplaySize(muzzle.width,muzzle.height);
    else this.muzzle.setTexture('muzzle').setOrigin(0,.5).setTint(run.weapon.definition.effects.color||0xffffff).setScale((.6+run.weapon.flash*5)*run.weapon.definition.effects.muzzle);
    this.muzzle.setVisible(muzzleVisible(visual.id,this.shotAge,run.weapon.flash)&&this.mode==='playing'&&p.hp>0).setPosition(this.muzzleAnchor.x,this.muzzleAnchor.y).setRotation(p.angle);
    this.visualShot=false;this.visualHit=false;
    if(speed>40&&!this.reducedMotion&&p.hp>0&&this.mode==='playing'){
      this.footstepTime+=dt;if(this.footstepTime>=.18){this.footstepTime%=.18;this.effects?.clip('dust',p.x-Math.sign(p.vx)*5,p.y+14,0,.65);}
    }else this.footstepTime=0;
  }
  drawActors(dt) {
    const run=this.run,p=run.player;
    this.visualTime+=dt;this.drawHero(dt);
    for (const pellet of run.projectiles.pool) {
      const view=this.pelletViews[pellet.id];view.setVisible(pellet.active);
      view.muzzleSpawn??={launch:null};
      if(!pellet.active){view.muzzleSpawn.launch=null;continue;}
      const kind=pellet.definition.energy?'projectile-energy':pellet.definition.id==='smg'?'projectile-smg':'projectile-shotgun';
      const spec=useCombatVfx(view,this.textures,kind,this.reducedMotion?0:pellet.distance/pellet.definition.pelletSpeed);
      if(spec)view.setDisplaySize(spec.width*(pellet.piercing&&!spec.stableShape?1.15:1),spec.height).setTint(0xffffff);
      else view.setTexture(pellet.definition.energy?'energy':'pellet').setOrigin(.5).setTint(pellet.definition.energy?0xffffff:pellet.piercing?0x8cecff:0xffffff).setScale(pellet.definition.energy?(pellet.piercing?1.4:.85):pellet.piercing?1.6:1,1);
      const position=projectileVisualPosition(view.muzzleSpawn,pellet,this.muzzleAnchor);
      view.setPosition(position.x,position.y).setRotation(pellet.angle);
    }
    this.perkAura.clear();
    this.perkFlashSeconds = Math.max(0, this.perkFlashSeconds - dt);
    this.perkFlash.setVisible(this.perkFlashSeconds > 0);
    if (run.shield > 0) this.perkAura.lineStyle(3,0x8cecff,.9).strokeCircle(p.x,p.y,24).strokeRect(p.x-7,p.y-34,14,9);
    if(p.boostSeconds>0)this.perkAura.lineStyle(2,0xffd475,.8).strokeCircle(p.x,p.y+13,17);
    if (run.weapon.heat > 0) {
      const critical=run.weapon.criticalHeat&&run.weapon.heat>=.4;
      this.perkAura.lineStyle(critical?3:2,critical?0xdabaff:0xffae54,.3 + run.weapon.heat).strokeCircle(p.x,p.y,19);
    }
    const ids = new Set(run.enemies.map(enemy => enemy.id));
    for (const [id, view] of this.enemyViews) if (!ids.has(id)) { view.container.destroy(); this.enemyViews.delete(id); }
    for (const enemy of run.enemies) {
      if (!this.enemyViews.has(enemy.id)) this.enemyViews.set(enemy.id, this.makeEnemyView(enemy));
      const view = this.enemyViews.get(enemy.id);
      updateEnemyView(view, enemy, this.reducedMotion, dt);
    }
    this.forgeSpriteVfx.update(run,this.reducedMotion);
    this.enemyAttacksView.update(run);
    this.effects.update(dt);
    this.damageAlpha = Math.max(0, this.damageAlpha - dt * .8);
    this.damageWash.setFillStyle(0xdd6e62, this.damageAlpha);
    this.ui?.updateHealth(p.hp, p.maxHealth);
    this.ui?.updateRun(run);
    this.arenaView.update(run);
    this.lootView.update(run.loot, this.reducedMotion);
    applyCombatRenderLayers(this);
  }
  update(_time, milliseconds) {
    if (!this.run) return;
    if(this.mode!=='paused')updateEnemyDeaths(this,Math.min(milliseconds/1000,.04));
    if(this.mode==='result'&&this.run.player.hp<=0){this.drawHero(Math.min(milliseconds/1000,.04));return;}
    if(this.mode!=='playing')return;
    const dt = Math.min(milliseconds / 1000, .04);
    const bossIds=this.run.enemies.filter(e=>e.kind==='boss').map(e=>e.id);
    const events = this.run.update(dt, this.movement.read());
    this.trackContracts(events,bossIds);
    const performance=this.runPerformance?.observe(this.run);
    if(performance){
      const resultRun=this.run;
      this.leaderboard.recordPerformance(performance).then(()=>{
        if(this.run!==resultRun||this.mode!=='result'||!this.leaderboard.submissionMessage)return;
        const notice=document.createElement('p');notice.className='save-notice';notice.setAttribute('role','status');notice.textContent=this.leaderboard.submissionMessage;this.ui.rewards.append(notice);
      });
    }
    const hitIds = new Set();
    let collectedFeedback=false;
    for (const event of events) {
      if(event.type==='loot-collected'&&!collectedFeedback) {
        collectedFeedback=true;
        this.effects.ring(event.x,event.y,0x9ee2cd,.95);
        if(!this.reducedMotion)this.effects.burst(event.x,event.y,0xf9d78e,2);
      } else if(event.type==='talent') {
        this.showPerkFlash(event.label,this.run.player.x,this.run.player.y);this.perkFlashSeconds=1.1;
      } else if (event.type === 'wave-enter') {
        clearEnemyDeaths(this);
        this.effects.clear();
        this.movement.clear();
        if (this.run.wave.boss) this.ui.bossIntro();
      } else if (event.type === 'shot') {
        this.visualShot=true;
        if(!this.run.weapon.definition.energy&&this.run.weapon.definition.id!=='smg')this.effects.burst(event.x + Math.cos(event.angle) * 28, event.y + Math.sin(event.angle) * 28, this.run.weapon.definition.effects.color||0xf2c681, this.reducedMotion?0:event.extra?3:Math.min(2,this.run.weapon.definition.effects.particles), event.angle);
        if (event.extra&&!this.run.weapon.definition.energy) this.effects.ring(event.x + Math.cos(event.angle) * 28, event.y + Math.sin(event.angle) * 28, 0xffd475, 2.8);
        if (event.extra) this.showPerkFlash('DOUBLE !',event.x,event.y);
        if (!this.reducedMotion && this.run.weapon.definition.effects.shake) this.cameras.main.shake(event.extra ? 85 : 65, event.extra ? .0024 : this.run.weapon.definition.effects.shake);
      } else if (event.type === 'explosion') {
        this.showPerkFlash('GRISOU !',event.x,event.y);
        this.effects.burst(event.x, event.y, 0xffbb50, this.reducedMotion?0:8);
        this.effects.ring(event.x, event.y, 0xffbb50, event.radius / 20);
        if(!this.reducedMotion)this.effects.clip('overload-energy',event.x,event.y);
        if (!this.reducedMotion) this.cameras.main.shake(90, .003);
      } else if (event.type === 'kill') {
        this.impactFeedback(event);
        const boss=this.enemyViews.get(event.id)?.boss;
        retireEnemyView(this,event.id,event);
        if(!event.energy)this.effects.burst(event.x,event.y,boss?0xffc777:0xa5b7a8,this.reducedMotion?0:boss?8:4);
        if(!event.energy)this.effects.ring(event.x,event.y,boss?0xffcf8c:0xa5b7a8,boss?3:1.15);
      } else if (event.type === 'hit' && !hitIds.has(event.id)) {
        hitIds.add(event.id);
        const impactShown=this.impactFeedback(event);
        if(impactShown!==false&&!event.energy&&this.run.weapon.definition.id!=='smg')this.effects.burst(event.x, event.y, event.energy?0x86ffcf:0xffd48e, this.reducedMotion?0:this.run.weapon.definition.effects.impact, event.angle);
      } else if(event.type==='energy-arc') {
        if(!this.reducedMotion)this.effects.energyArc(event);
      } else if (event.type === 'shield-hit') {
        this.showPerkFlash('COUP BLOQUÉ !',event.x,event.y);
        this.effects.burst(event.x,event.y,0x8cecff,this.reducedMotion?0:6);
        this.effects.ring(event.x,event.y,0x8cecff,3);
      } else if (event.type === 'hurt') {
        this.visualHit=true;
        this.damageAlpha = .12;
        this.effects.burst(event.x,event.y,0xffba85,this.reducedMotion?0:4);
        this.effects.ring(event.x,event.y,0xff9576,1.8);
        if (!this.reducedMotion) this.cameras.main.shake(100, .004);
      }
    }
    this.drawActors(dt);
    if (this.run.status !== 'playing') {
      this.mode = 'result'; this.movement.clear(); this.ui.result(this.run, this.wallet.claim(this.run));
    } else if (this.upgrades.afterCombat()) {
      this.showChoice({ important: true, context: 'shotgun' });
    }
  }
  impactFeedback(event) {
    if(this.reducedMotion)return; // Existing brief enemy tint remains the stable hit cue.
    if(event.type!=='hit'&&event.type!=='kill')return false;
    const radius=this.enemyViews.get(event.id)?.width/2||12,angle=event.angle||0;
    // Presentation at the entry edge, never an altered collision/impact location.
    const x=event.x-Math.cos(angle)*radius*.9,y=event.y-Math.sin(angle)*radius*.9;
    if(!event.energy&&this.run.weapon.definition.id==='shotgun')return this.effects.clip('impact-shotgun',x,y,angle,1,event.id);
    if(!event.energy&&this.run.weapon.definition.id==='smg')return this.effects.clip('impact-smg',x,y,angle,1,event.id);
    const shown=this.effects.clip(event.energy?'impact-energy':'impact-ballistic',x,y,angle,1,event.id);
    if(event.energy&&event.continuing)this.effects.clip('conduction',event.x,event.y,angle,1,event.id);
    if(overloadFeedback(event,this.run.weapon))this.effects.clip('overload-grisoux',event.x,event.y,0,1,event.id);
    return shown;
  }
  showPerkFlash(label,x,y) {
    this.perkFlashSeconds = .4;
    this.perkFlash.setText(label).setPosition(Math.max(85,Math.min(365,x)),Math.max(150,y-35));
  }
  trackContracts(events=[],bossIds=[]) {
    const activity=this.contractTracker?.observe(this.run,events,bossIds);
    if(activity&&Object.keys(activity).length)this.wallet.recordContracts(activity);
  }
}
