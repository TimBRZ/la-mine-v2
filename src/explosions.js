export const GRISOU = Object.freeze({ radius: 76, damage: 28 });
export const UNSTABLE_GRISOU = Object.freeze({ radius:130, damage:140 });

// Five kills arm Grisou; the sixth explodes. Explosion kills also advance the
// counter. Every death is processed once and the live enemy cap bounds chains.
export function resolveExplosions(events, enemies, grisou) {
  if (!grisou?.enabled) return;
  const queue = events.filter(event => event.type === 'kill');
  const processed = new Set();
  const spec = grisou.everyKill ? UNSTABLE_GRISOU : GRISOU;
  for (let index = 0; index < queue.length; index++) {
    const death = queue[index];
    if (processed.has(death.id)) continue;
    processed.add(death.id);
    grisou.kills++;
    if (!grisou.everyKill && grisou.kills < 6) continue;
    grisou.kills = 0;
    events.push({ type: 'explosion', x: death.x, y: death.y, radius: spec.radius });
    for (const enemy of enemies) {
      if (!enemy.active || Math.hypot(enemy.x - death.x, enemy.y - death.y) > spec.radius) continue;
      const angle = Math.atan2(enemy.y - death.y, enemy.x - death.x);
      enemy.hit(spec.damage, angle, 80);
      const hit = { type: enemy.alive ? 'hit' : 'kill', id: enemy.id, x: enemy.x, y: enemy.y, angle };
      events.push(hit);
      if (!enemy.alive) queue.push(hit);
    }
  }
}
