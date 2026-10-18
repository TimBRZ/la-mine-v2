import {advanceProjectileEndings,recordProjectileEnding,clearProjectileEndings} from './projectile-endings.js';
import {noteProjectileEmission} from './projectile-attacks.js';
import { ROOM } from './config.js';
import { segmentCircle } from './math.js';
import { DRILL_BOLT } from './enemies/stats.js';
import { fanAngles } from './enemy-volley.js';
import {circleAngles,BOSS_PATTERNS} from './boss-patterns.js';

export class EnemyProjectiles {
  constructor() { this.pool = Array.from({ length: DRILL_BOLT.capacity }, (_, id) => ({ id, active: false }));this.reservations=new Map(); }
  reserveCircle(owner,count) {
    const active=this.pool.filter(p=>p.active);
    if(!owner.active||![6,8].includes(count)||this.reservations.size||active.some(p=>p.bossMajor||p.bossFan||p.owner===owner.id)||this.pool.length-active.length<count)return false;
    this.reservations.set(owner.id,count);return true;
  }
  syncOwners(enemies){for(const id of this.reservations.keys())if(!enemies.some(e=>e.id===id&&e.alive))this.reservations.delete(id);}
  fireCircle(owner,angle,count) {
    if(!this.reservations.has(owner.id)&&!this.reserveCircle(owner,count))return false;
    if(!owner.active||this.reservations.get(owner.id)!==count){this.reservations.delete(owner.id);return false;}
    const spec={...(owner.projectileSpec||DRILL_BOLT),maxActive:count,speed:BOSS_PATTERNS.circleSpeed,range:BOSS_PATTERNS.circleRange,damage:.5};
    for(const direction of circleAngles(angle,count))this.fire(owner,direction,spec,false,true);
    this.reservations.delete(owner.id);return true;
  }
  fireVolley(owner,angle,fan=false) {
    if(!fan)return this.fire(owner,angle);
    const active=this.pool.filter(p=>p.active),own=active.filter(p=>p.owner===owner.id);
    // All three or none; one boss fan at a time, eight hostile projectiles total.
    if(!owner.active||own.length||this.pool.length-active.length-[...this.reservations.values()].reduce((a,b)=>a+b,0)<3||owner.kind==='boss'&&active.some(p=>p.bossFan||p.bossMajor))return false;
    const base=owner.projectileSpec||DRILL_BOLT;
    const spec={...base,maxActive:3,speed:Math.min(base.speed,120),damage:Math.min(base.damage,.5)};
    for(const direction of fanAngles(angle))this.fire(owner,direction,spec,owner.kind==='boss');
    return true;
  }
  fire(owner, angle, override=null, bossFan=false, bossMajor=false) {
    if(!bossMajor&&this.reservations.has(owner.id))return false;
    const spec=override||owner.projectileSpec||DRILL_BOLT;
    if (!owner.active || this.pool.filter(p => p.active && p.owner === owner.id).length >= (spec.maxActive||1)) return false;
    const reserved=[...this.reservations.entries()].reduce((sum,[id,count])=>sum+(bossMajor&&id===owner.id?0:count),0);
    if(this.pool.filter(p=>!p.active).length<=reserved)return false;
    const bolt = this.pool.find(p => !p.active);
    if (!bolt) return false;
    const muzzle = owner.radius + spec.radius + 2;
    Object.assign(bolt, { active: true, owner: owner.id, angle, distance: 0, spec, bossFan, bossMajor,
      x: owner.x + Math.cos(angle) * muzzle, y: owner.y + Math.sin(angle) * muzzle });
    noteProjectileEmission(owner);
    return true;
  }
  update(dt, player, previous, onHit) {
    advanceProjectileEndings(this,dt);
    for (const bolt of this.pool) {
      if (!bolt.active) continue;
      const spec=bolt.spec;
      const step = Math.min(spec.speed * dt, spec.range - bolt.distance);
      const x = bolt.x + Math.cos(bolt.angle) * step, y = bolt.y + Math.sin(bolt.angle) * step;
      // Relative swept collision includes player motion and prevents tunnelling.
      const hit = segmentCircle(bolt.x - previous.x, bolt.y - previous.y, x - player.x, y - player.y, 0, 0, player.radius + spec.radius);
      recordProjectileEnding(this,bolt,x,y,hit,step);
      bolt.x = x; bolt.y = y; bolt.distance += step;
      if (hit !== null) { bolt.active = false; onHit(spec.damage); }
      if (bolt.distance >= spec.range || x < ROOM.left || x > ROOM.right || y < ROOM.top || y > ROOM.bottom) bolt.active = false;
    }
  }
  clear() { clearProjectileEndings(this); for (const bolt of this.pool) bolt.active = false;this.reservations.clear(); }
}
