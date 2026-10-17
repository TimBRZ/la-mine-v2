import {isPureProjectile} from '../projectile-attacks.js';
import {LampistShotView} from '../lampist-projectile-vfx.js';
import {EnemyRivetView} from '../enemy-rivet-vfx.js';
import {useDepthsBossMaster} from '../depths/boss-view.js';
import {useForgeMaster} from '../forge/boss-view.js';
import {forgeLabel} from '../forge/art.js';
import {depthsLabel} from '../depths/art.js';
import {riftLabel} from '../rift/art.js';
import {circleAngles} from '../boss-patterns.js';
import {fanAngles} from '../enemy-volley.js';
import { useCombatAppearance, createAppearanceMotion, animateCombatAppearance } from '../combat-appearances.js';
import { dangerLane, COMBAT_ART } from '../combat-art.js';
import { ENEMY_TYPES } from './registry.js';
import { drawRailWarning } from './rail-view.js';
import { ROOM } from '../config.js';
import { DRILL_BOLT } from './stats.js';
import { BOSS_SPECS } from '../boss-catalog.js';
import {enemySheet,createEnemyAnimation,applyEnemyAnimation} from '../forge-animation.js';
import {localDebugEnabled} from '../debug-zones.js';
import {BURSTER_IDLE_KEY,trustedBursterTexture,applyBursterIdle} from '../burster-visual.js';

const bossView = { texture: 'haveuse', color: 0xeab173, rotationOffset: Math.PI / 2 };
export function makeEnemyView(scene, enemy) {
  const boss = enemy.kind === 'boss', spec = boss ? enemy.bossId && enemy.bossId!=='haveuse' ? {...bossView,texture:enemy.bossId,color:BOSS_SPECS[enemy.bossId].color} : bossView : ENEMY_TYPES[enemy.kind];
  const burster=enemy.kind==='burster';
  const body = scene.add.image(0, 0, burster?(trustedBursterTexture(scene.textures,BURSTER_IDLE_KEY)?BURSTER_IDLE_KEY:'__WHITE'):spec.texture);
  if(burster)body.setVisible(false);
  if((enemy.shaftType||enemy.riftType||enemy.depthsType||enemy.forgeType)&&enemy.kind==='boss')spec.rotationOffset=null;
  const appearance=useForgeMaster(body,boss?enemy.forgeType:null,scene.textures)||useDepthsBossMaster(body,enemy.depthsType,scene.textures)||useCombatAppearance(body,boss?enemy.bossId||'haveuse':enemy.kind,scene.textures);
  const motion=createAppearanceMotion(enemy.x,enemy.y);
  const candidate=enemySheet(boss?enemy.bossId||'haveuse':enemy.kind,scene.run?.world?.id);
  const sheet=candidate;
  const legacy={key:body.texture?.key||spec.texture,frame:body.frame?.name,originX:body.originX,originY:body.originY,width:body.displayWidth,height:body.displayHeight};
  const shadow = scene.add.ellipse(0, enemy.radius, boss ? 65 : enemy.radius * 2.2, boss ? 25 : enemy.radius * .8, 0x0c1216, .5);
  const ring = scene.add.circle(0, 0, enemy.radius + 8).setStrokeStyle(2, spec.color, .8);
  const width = enemy.radius * 2;
  const healthBack = scene.add.rectangle(-width / 2, -enemy.radius - 14, width, 3, 0x101a1e).setOrigin(0, .5);
  const health = scene.add.rectangle(-width / 2, -enemy.radius - 14, width, 3, spec.color).setOrigin(0, .5);
  const aimLabel = scene.add.text(0, -enemy.radius - 24, 'VISÉE', { fontFamily: 'system-ui', fontSize: '11px', fontStyle: 'bold', color: '#ffe0a5', stroke: '#17282e', strokeThickness: 3 }).setOrigin(.5).setVisible(false);
  const container = scene.add.container(enemy.x, enemy.y, [shadow, ring, body, healthBack, health, aimLabel]).setDepth(15);
  const animation=sheet?createEnemyAnimation(enemy):null;
  if(sheet){const shown=applyEnemyAnimation(body,scene.textures,sheet,animation,enemy,0,scene.reducedMotion);if(burster)body.setVisible(shown);}
  return { appearance, motion, body, shadow, ring, healthBack, health, aimLabel, container, spec, width, boss, sheet, animation, textures:scene.textures, legacy, depthsContext:scene.run?.forge||scene.run?.depths, visualDebug:typeof location!=='undefined'&&localDebugEnabled(location.href) };
}
export function updateEnemyView(view, enemy, reducedMotion, dt=0) {
  view.container.setPosition(enemy.x, enemy.y);
  view.body.setVisible(true).setAlpha((enemy.active?1:.35)*(enemy.retireRemaining===undefined?1:enemy.retireRemaining/.6)).setRotation(view.spec.rotationOffset === null ? 0 : (enemy.angle || 0) + view.spec.rotationOffset);
  if(view.appearance) {
    const pose=animateCombatAppearance(view.body,view.appearance,view.motion,enemy,dt,reducedMotion);
    view.body.setPosition(0,pose.y);
  }
  const modern=view.sheet&&applyEnemyAnimation(view.body,view.textures,view.sheet,view.animation,enemy,dt,reducedMotion,view.depthsContext);
  if(!modern&&(view.sheet||enemy.kind==='burster')){
    if(enemy.kind==='burster')view.body.setVisible(applyBursterIdle(view.body,view.textures));
    else {
    const old=view.legacy;
    view.body.setTexture(old.key,old.frame).setOrigin(old.originX,old.originY).setDisplaySize(old.width,old.height).setFlipX(false);
    if(view.appearance)animateCombatAppearance(view.body,view.appearance,view.motion,enemy,0,reducedMotion);
    }
  }
  if(view.visualDebug){
    const state=enemy.active===false?'spawn':view.animation?.state||enemy.phase||'idle';
    const record={entity:enemy.bossId||enemy.kind,state,texture:view.body.texture.key,animation:view.animation?.state||null,fallback:!!view.sheet&&!modern,fallback_reason:view.animation?.visualReason||null};
    const signature=JSON.stringify(record);
    if(signature!==view.visualLog){console.info('[VISUAL]',record);view.visualLog=signature;}
  }
  view.shadow.setVisible(enemy.active);
  if (enemy.flash > 0) view.body.setTint(0xffe3b9);
  else view.body.clearTint();
  const spawnScale = view.boss ? .65 + .35 * Math.sin((.7 - enemy.warmup) * 14) ** 2 : .8 + .2 * Math.sin(enemy.warmup * 14) ** 2;
  view.ring.setVisible(!enemy.active).setScale(reducedMotion ? 1 : spawnScale);
  const headY=view.appearance?-view.appearance.height*view.appearance.originY-4:-enemy.radius-14;
  view.health.setY(headY);view.healthBack.setY(headY);
  view.health.setVisible(enemy.active && !view.boss && enemy.hp < enemy.maxHealth).setDisplaySize(view.width * enemy.hp / enemy.maxHealth, 3);
  view.healthBack.setVisible(enemy.active && !view.boss && enemy.hp < enemy.maxHealth);
  view.aimLabel.setText(enemy.kind==='drill'?'VISÉE':enemy.kind==='wagon'?'VOIE !':enemy.projectileSpec?'RAFALE ×2':enemy.bossId==='effondreur'?'ÉBOULEMENT':enemy.bossId==='crachefer'?'CRACHEFER':'CHARGE');
  if(enemy.fanAttack)view.aimLabel.setText('ÉVENTAIL ×3');
  view.aimLabel.setY(enemy.y+headY-10<148?enemy.radius+24:headY-10);
  view.aimLabel.setVisible(enemy.active && (enemy.kind === 'wagon' || enemy.projectileSpec || enemy.kind === 'drill' || enemy.kind === 'boss' || enemy.bossId==='crachefer' || enemy.bossId==='effondreur') && enemy.phase === 'warning');
  if(enemy.shaftType){view.aimLabel.setText(({charge:'CHARGE',front:'IMPACT',cable:'CÂBLE',steam:'VAPEUR ×3',radial:'SOUFFLE',pressure:'PRESSION',gas:'GAZ !',blast:'EXPLOSION !',energy:'ÉNERGIE',impact:'SONDE !'})[enemy.pattern]||'');}
  if(enemy.depthsType){view.aimLabel.setText(depthsLabel(enemy));view.aimLabel.setFontSize(enemy.bossSequence?'9px':'11px');view.aimLabel.setVisible(enemy.active&&(enemy.phase==='warning'||enemy.bossSequence&&enemy.phase==='recovery'));}
  if(enemy.forgeType){view.aimLabel.setText(forgeLabel(enemy));view.aimLabel.setVisible(enemy.active&&(enemy.phase==='warning'||enemy.dungeonRecovery));if(enemy.plan||enemy.dungeonRecovery)view.aimLabel.setFontSize('9px');}
  if(enemy.riftType){view.aimLabel.setText(riftLabel(enemy));view.aimLabel.setVisible(enemy.active&&enemy.phase==='warning');}
  if(enemy.projectilePattern==='circle')view.aimLabel.setText('CERCLE ×'+enemy.circleShots);
  if(enemy.hazards){view.aimLabel.setText(({charge:'CHARGE',ram:'BÉLIER',steam:'VAPEUR',rails:'AIGUILLAGE',burst:'RAFALE ×2',wagon:'WAGON !'})[enemy.pattern]||'');if(enemy.fanAttack)view.aimLabel.setText('ÉVENTAIL ×3');view.aimLabel.setY(enemy.y-enemy.radius-24<148?enemy.radius+22:-enemy.radius-24);view.aimLabel.setVisible(enemy.active&&enemy.phase==='warning');if(enemy.projectilePattern==='circle')view.aimLabel.setText('CERCLE ×'+enemy.circleShots);if(enemy.pattern==='rails')view.aimLabel.setText(enemy.crossPattern?'CROIX !':enemy.railOrientation==='vertical'?'RAILS VERTICAUX':'RAILS HORIZONTAUX');}
  if(isPureProjectile(enemy))view.aimLabel.setVisible(false);
}
export class EnemyAttacksView {
  constructor(scene) {
    this.warning = scene.add.graphics().setDepth(8);
    this.bolts = scene.add.graphics().setDepth(24);
    this.rivets = new EnemyRivetView(scene);
    this.lampistShots = new LampistShotView(scene);
  }
  update(run) {
    const g = this.warning;
    g.clear();
    for (const e of run.enemies) {
      if(isPureProjectile(e)||e.riftType||e.depthsType||e.forgeType)continue;
      if(drawRailWarning(g,e))continue;
      if(e.shaftType&&!['steam','energy','radial'].includes(e.pattern))continue;
      if(e.hazards&&e.pattern!=='burst')continue;
      if ((!e.projectileSpec && e.kind !== 'drill' && e.bossId!=='crachefer') || !e.active || e.phase !== 'warning') continue;
      const circle=e.projectilePattern==='circle';
      for(const angle of circle?circleAngles(e.circleAngle,e.circleShots):e.fanAttack?fanAngles(e.attackAngle):[e.attackAngle]) {
      const dx = Math.cos(angle), dy = Math.sin(angle);
      const tx = dx > 0 ? (ROOM.right - e.x) / dx : dx < 0 ? (ROOM.left - e.x) / dx : Infinity;
      const ty = dy > 0 ? (ROOM.bottom - e.y) / dy : dy < 0 ? (ROOM.top - e.y) / dy : Infinity;
      const length = Math.min(circle?95:(e.projectileSpec||DRILL_BOLT).range, tx, ty);
      dangerLane(g,e.x,e.y,e.x+dx*length,e.y+dy*length,(e.projectileSpec||DRILL_BOLT).radius+2);
      }
      g.lineStyle(2,COMBAT_ART.warning,.95).strokeCircle(e.x,e.y,e.radius+5);
    }
    const b = this.bolts;
    b.clear();
    this.rivets.begin(run);
    this.lampistShots.begin(run);
    for (const bolt of run.hostileProjectiles.pool) {
      if (!bolt.active) continue;
      if(this.lampistShots.draw(bolt,run.world?.id))continue;
      if(this.rivets.draw(bolt,run.world?.id))continue;
      const spec=bolt.spec||DRILL_BOLT;
      b.lineStyle(3, spec.color||0xb8a0fa, .6).lineBetween(bolt.x, bolt.y, bolt.x - Math.cos(bolt.angle) * 17, bolt.y - Math.sin(bolt.angle) * 17);
      b.fillStyle(spec.color?0x203238:0x44305f).fillCircle(bolt.x, bolt.y, spec.radius + 2);
      b.fillStyle(0xffb481).fillCircle(bolt.x, bolt.y, spec.radius);
      b.fillStyle(0xfff2cf).fillCircle(bolt.x,bolt.y,Math.max(1,spec.radius*.4));
      b.lineStyle(2, 0xff7658).strokeCircle(bolt.x, bolt.y, spec.radius);
    }
  }
}

