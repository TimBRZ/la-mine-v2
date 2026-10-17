import { ROOM } from './config.js';
import { WEAPONS } from './weapons.js';
import { segmentCircle } from './math.js';
import { BOSS_WEAPON_BALANCE } from './boss-weapon-balance.js';
import {ENERGY,energyArc} from './energy-build.js';

export function pelletDamage(distance, definition = WEAPONS.shotgun) {
  const base = Math.round(definition.damage * (1 - definition.falloff * Math.min(1, distance / definition.range)));
  // Preserve the existing close-range burst and rounding. Apply only the
  // weapon's optional distance penalty, using actual flight length at impact.
  const start = definition.distancePenaltyStart ?? 0;
  const progress = Math.max(0, Math.min(1, (distance - start) / Math.max(1, definition.range - start)));
  return base * (1 - (definition.distancePenalty ?? 0) * progress);
}
export const CLOSE_RANGE = 70;

export class Projectiles {
  constructor() { this.damageMultiplier = 1; this.pool = Array.from({ length: 84 }, (_, id) => ({ id, active: false })); }
  fire(x, y, angle, closeBonus = 0, definition = WEAPONS.shotgun, options = {}) {
    const pellet = this.pool.find(item => !item.active);
    if (pellet) Object.assign(pellet, { active: true, definition, x, y, angle, distance: 0, closeBonus,
      range: options.range ?? definition.range, piercing: Boolean(options.piercing), hitIds: [],
      maxTargets: options.piercing ? Math.min(definition.energy?4:3,options.maxTargets||2) : 1,
      energyOverload:Boolean(options.energyOverload),energyArc:Boolean(options.energyArc),energyFactor:1,
      bossScale:options.bossScale??1,focus:options.focus||null,focusEpoch:options.focus?.epoch??0,
      damageMultiplier: this.damageMultiplier * (options.damageBoost ?? 1) });
  }
  update(dt, enemies, events, player = null) {
    for (const pellet of this.pool) {
      if (!pellet.active) continue;
      const definition = pellet.definition;
      const travel = Math.min(definition.pelletSpeed * dt, pellet.range - pellet.distance);
      const nextX = pellet.x + Math.cos(pellet.angle) * travel;
      const nextY = pellet.y + Math.sin(pellet.angle) * travel;
      const hits = [];
      for (const enemy of enemies) {
        if (!enemy.active || pellet.hitIds.includes(enemy.id)) continue;
        const t = segmentCircle(pellet.x, pellet.y, nextX, nextY, enemy.x, enemy.y, enemy.radius + 2);
        if (t !== null) hits.push({ hit: enemy, fraction: t });
      }
      hits.sort((a,b) => a.fraction - b.fraction);
      for (const { hit, fraction } of hits) {
        if (!pellet.active) break;
        if(!hit.active)continue;
        const close = player && Math.hypot(player.x - hit.x, player.y - hit.y) <= CLOSE_RANGE;
        const boss=hit.kind==='boss';
        const closeBonus=boss&&definition.id==='shotgun'?Math.min(pellet.closeBonus,BOSS_WEAPON_BALANCE.shotgun.closeBonusCap):pellet.closeBonus;
        const focus=pellet.focus?.hit(hit,pellet.focusEpoch,pellet.hitIds.length===0)||0;
        const attenuation=definition.energy?pellet.energyFactor:((pellet.maxTargets === 3 ? .8 : .6) ** pellet.hitIds.length);
        const damage = pelletDamage(pellet.distance + travel * fraction, definition) * pellet.damageMultiplier * (1 + (close ? closeBonus : 0)) * attenuation * (boss?pellet.bossScale*(1+focus):1);
        hit.hit(damage, pellet.angle, definition.knockback);
        pellet.hitIds.push(hit.id);
        events.push({ type: hit.alive ? 'hit' : 'kill', id: hit.id, x: hit.x, y: hit.y, angle: pellet.angle, piercing: pellet.piercing, ...(definition.energy?{energy:true,continuing:pellet.hitIds.length<pellet.maxTargets}: {}) });
        if(definition.energy) {
          const index=pellet.hitIds.length;
          const ratio=(ENERGY.attenuation[index]||0)/ENERGY.attenuation[index-1];
          pellet.energyFactor*=1-(1-ratio)*(!hit.alive&&pellet.energyOverload?ENERGY.killPenaltyScale:1);
          if(!hit.alive&&pellet.energyArc)energyArc(hit,damage,enemies,events);
        }
        pellet.active = pellet.hitIds.length < pellet.maxTargets;
      }
      pellet.x = nextX; pellet.y = nextY; pellet.distance += travel;
      if (pellet.distance >= pellet.range || nextX < ROOM.left || nextX > ROOM.right || nextY < ROOM.top || nextY > ROOM.bottom) pellet.active = false;
    }
  }
}
