import { UpgradeFlow } from '../src/upgrades.js';

export function collectFixtureLoot(run) {
  for (let i = 0; i < 150 && run.wavePhase === 'collecting'; i++) run.update(.04);
  if (run.wavePhase === 'collecting') throw Error('Collection did not finish');
}
export function finishFixtureRoom(run) {
  run.spawned = run.wave.total; run.enemies = [];
  run.update(0);
  collectFixtureLoot(run);
}
export function enterFixtureRoom(run, number) {
  while (run.waveNumber < number) {
    finishFixtureRoom(run);
    if (run.choicePending) {
      const flow = new UpgradeFlow(run, () => .3); flow.afterCombat(); flow.choose(flow.offered[0].id);
    }
    run.update(0);
    for (let i = 0; i < 100 && run.wavePhase === 'preparing'; i++) run.update(.04);
  }
}

const patrol = new WeakMap();
// Test-only steering. No automated player exists in shipped source.
export function steer(run) {
  const p = run.player;
  if (run.wavePhase !== 'combat') return { x:0, y:0 };
  let x = 0, y = 0;
  const enemies = run.enemies.filter(e => e.active).sort((a,b) => Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
  const distance = enemies.length ? Math.hypot(enemies[0].x - p.x, enemies[0].y - p.y) : Infinity;
  const charging = enemies.some(e => e.kind === 'boss' && Number.isFinite(e.chargeAngle) && ['warning', 'charge'].includes(e.phase));
  const zones=enemies.flatMap(e=>e.zones||[]);
  const danger=zones.find(z=>Math.hypot(p.x-z.x,p.y-z.y)<z.radius+35);
  const ranged = run.weapon.definition.id === 'smg';
  const threats = [
    ...run.hostileProjectiles.pool.filter(b => b.active).map(b => ({x:b.x,y:b.y,angle:b.angle})),
    ...enemies.filter(e => (e.kind === 'drill'||e.bossId==='crachefer') && e.phase === 'warning').map(e => ({x:e.x,y:e.y,angle:e.attackAngle})),
  ];
  const threat = threats.find(b => {
    const dx=p.x-b.x,dy=p.y-b.y;
    return dx*Math.cos(b.angle)+dy*Math.sin(b.angle)>0 && Math.abs(-dx*Math.sin(b.angle)+dy*Math.cos(b.angle))<35;
  });
  if (ranged) {
    if (run.wavePhase !== 'combat') return {x:0,y:0};
    const state=patrol.get(run)||{escaping:false}; patrol.set(run,state);
    if(distance<90||charging||threat||danger)state.escaping=true;
    if(distance>155&&!charging&&!threat&&!danger)state.escaping=false;
    if(!state.escaping&&distance<268)return {x:0,y:0};
    let best=-Infinity,move={x:0,y:0};
    for(let i=0;i<32;i++) {
      const angle=i*Math.PI/16,x=Math.cos(angle),y=Math.sin(angle);
      const nx=p.x+x*90,ny=p.y+y*90;
      if(nx<50||nx>400||ny<145||ny>635)continue;
      let score=Math.min(...enemies.map(e=>Math.hypot(nx-e.x,ny-e.y)-e.radius));
      score+=Math.min(nx-50,400-nx,ny-145,635-ny)*.15;
      if(state.move)score+=(x*state.move.x+y*state.move.y)*20;
      for(const z of zones)if(Math.hypot(nx-z.x,ny-z.y)<z.radius+30)score-=200;
      if(enemies.length && distance>260&&!state.escaping)score=-Math.abs(Math.hypot(nx-enemies[0].x,ny-enemies[0].y)-220);
      for(const b of threats){const dx=nx-b.x,dy=ny-b.y;if(dx*Math.cos(b.angle)+dy*Math.sin(b.angle)>0&&Math.abs(-dx*Math.sin(b.angle)+dy*Math.cos(b.angle))<40)score-=120;}
      for(const e of enemies.filter(e=>e.kind==='boss'&&['warning','charge'].includes(e.phase))) {
        if(Math.abs(-(nx-e.x)*Math.sin(e.chargeAngle)+(ny-e.y)*Math.cos(e.chargeAngle))<70)score-=150;
      }
      if(score>best){best=score;move={x,y};}
    }
    state.move=move;return move;
  }
  // Brake earlier at useful shotgun range now that wave changes retain position.
  if (run.wavePhase === 'combat' && distance > 60 && distance < Math.min(180, run.weapon.range - .1) && !charging && !danger && !threat && run.weapon.cooldown < .3) return { x: 0, y: 0 };
  if (enemies.length) {
    const e = enemies[0], dx = e.x-p.x, dy = e.y-p.y, d = Math.hypot(dx,dy)||1;
    const advance = d > Math.min(145, run.weapon.range * .8) ? 1 : d < 95 ? -1 : 0;
    x = dx/d*advance-dy/d*.5; y = dy/d*advance+dx/d*.5;
    for (const enemy of enemies) {
      const ex = p.x-enemy.x, ey = p.y-enemy.y, distance = Math.hypot(ex,ey)||1;
      const safe = enemy.kind === 'boss' ? 120 : 105;
      if (distance < safe) { x += ex/distance*(safe-distance)/22; y += ey/distance*(safe-distance)/22; }
      if (enemy.kind === 'boss' && Number.isFinite(enemy.chargeAngle) && ['warning','charge'].includes(enemy.phase)) {
        const ax = Math.cos(enemy.chargeAngle), ay = Math.sin(enemy.chargeAngle);
        const cross = ex * -ay + ey * ax;
        if (Math.abs(cross) < 90) {
          const sign = cross >= 0 ? 1 : -1;
          x += -ay * sign * 5; y += ax * sign * 5;
        }
      }
    }
    if(danger) {const dx=p.x-danger.x,dy=p.y-danger.y,d=Math.hypot(dx,dy)||1;x+=dx/d*6||3;y+=dy/d*6;}
    if(threat) {const cross=-(p.x-threat.x)*Math.sin(threat.angle)+(p.y-threat.y)*Math.cos(threat.angle);const sign=cross>=0?1:-1;x-=Math.sin(threat.angle)*sign*5;y+=Math.cos(threat.angle)*sign*5;}
    if (p.x < 85) x += (85-p.x)/15;
    if (p.x > 365) x -= (p.x-365)/15;
    if (p.y < 175) y += (175-p.y)/15;
    if (p.y > 605) y -= (p.y-605)/15;
  }
  return { x,y };
}
