import { GAMIN } from './config.js';
import { weaponDefinition } from './weapons.js';
import { BossFocus, shotgunBossScale } from './boss-weapon-balance.js';

export function nearestTarget(player, enemies, range = GAMIN.range) {
  let target = null, best = range * range;
  for (const enemy of enemies) {
    if (!enemy.active) continue;
    const squared = (enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2;
    if (squared < best) { best = squared; target = enemy; }
  }
  return target;
}

export class Weapon {
  constructor(id = 'shotgun') {
    this.definition = weaponDefinition(id);
    this.cooldown = 0; this.recoil = 0; this.flash = 0;
    this.pellets = this.definition.pellets; this.interval = this.definition.cooldown;
    this.range = this.definition.range; this.spread = this.definition.spread;
    this.closeBonus = 0; this.doubleChance = 0;
    this.magazine = false; this.overheat = false; this.piercing = false;
    this.damageBoost = 1; this.maxTargets = this.definition.energy ? 1 : 2; this.criticalHeat = false;
    this.energyOverload=false;this.energyArc=false;
    this.focus = id==='smg' ? new BossFocus() : null;
    this.resetStance();
  }
  resetStance() { this.stoppedFor = 0; this.heat = 0; this.focus?.reset(); }
  update(dt, player, enemies, projectiles, events, random = Math.random, canFire = true) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.recoil *= Math.exp(-22 * dt);
    this.flash = Math.max(0, this.flash - dt);
    const target = nearestTarget(player, enemies, this.range);
    if(this.focus) {
      if(this.focus.targetId!==null&&!enemies.some(e=>e.id===this.focus.targetId&&e.alive))this.focus.reset();
      this.focus.update(dt,!canFire);
    }
    this.stoppedFor = canFire ? this.stoppedFor + dt : 0;
    this.heat = this.overheat && canFire && target ? Math.min(.4, this.heat + dt * .1) : 0;
    if (target) player.angle = Math.atan2(target.y - player.y, target.x - player.x);
    else if (player.moveAngle !== undefined) player.angle = player.moveAngle;
    if (!canFire || !target || this.cooldown > 0) return;
    this.cooldown = this.interval / (this.magazine && this.stoppedFor <= 2 ? 1.3 : 1);
    this.recoil = this.definition.effects.recoil;
    this.flash = this.definition.effects.flash;
    this.discharge(player, projectiles, events);
    if(player.shotBoost)player.boostSeconds=1.5;
    if (this.doubleChance > 0 && random() < this.doubleChance) {
      // Exactly one extra volley; discharge never rolls another proc.
      this.discharge(player, projectiles, events, true);
      this.flash = .10;
      this.recoil = 8;
    }
  }
  discharge(player, projectiles, events, extra = false) {
    for (let index = 0; index < this.pellets; index++) {
      const angle = player.angle + (this.pellets === 1 ? 0 : index / (this.pellets - 1) - .5) * this.spread;
      // All pellets originate ahead of the body, but close enough to hit an
      // enemy already touching it. Range and damage use actual travelled length.
      projectiles.fire(player.x + Math.cos(player.angle) * 16, player.y + Math.sin(player.angle) * 16, angle, this.closeBonus, this.definition,
        { range: this.range, damageBoost: this.damageBoost * (1 + this.heat + (this.criticalHeat && this.heat >= .4 ? 1 : 0)), piercing: this.piercing, maxTargets:this.maxTargets,
          bossScale:this.definition.id==='shotgun'?shotgunBossScale(this.pellets,this.definition.pellets,extra):1, focus:this.focus,
          energyOverload:this.energyOverload,energyArc:this.energyArc });
    }
    events.push({ type: 'shot', x: player.x, y: player.y, angle: player.angle, extra });
  }
}

// Historical export retained for existing regression tests.
export { Weapon as Gamin };
