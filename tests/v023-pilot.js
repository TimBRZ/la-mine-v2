// QA inputs only: forecast visible motion/bolts, never edit the combat model.
import {tacticalPilot} from './tactical-pilot.js';
import {ROOM} from '../src/config.js';
const memory=new WeakMap();
export function energyPilot(run) {
  const p=run.player,zero={x:0,y:0};if(run.wavePhase!=='combat')return zero;
  const enemies=run.enemies.filter(e=>e.alive);if(!enemies.length)return zero;
  const bolts=run.hostileProjectiles.pool.filter(b=>b.active),last=memory.get(run)||zero;
  if(run.weapon.definition.id==='shotgun'&&!bolts.length&&!enemies.some(e=>e.hazards?.length||e.fanAttack&&e.phase==='warning'))return tacticalPilot(run);
  let best=-Infinity,chosen=zero;
  for(let i=-1;i<32;i++) {
    const input=i<0?zero:{x:Math.cos(i*Math.PI/16),y:Math.sin(i*Math.PI/16)};
    let danger=0,minSpace=200;
    for(const t of [.1,.25,.45]) {
      const x=Math.max(ROOM.left+p.radius,Math.min(ROOM.right-p.radius,p.x+input.x*(p.effectiveSpeed||p.speed)*t));
      const y=Math.max(ROOM.top+p.radius,Math.min(ROOM.bottom-p.radius,p.y+input.y*(p.effectiveSpeed||p.speed)*t));
      for(const e of enemies) {
        let ex=e.x,ey=e.y;
        const available=Math.max(0,t-(e.warmup||0));
        if(['rat','miner'].includes(e.kind)){const a=Math.atan2(y-ey,x-ex);ex+=Math.cos(a)*e.stats.speed*available;ey+=Math.sin(a)*e.stats.speed*available;}
        if(e.phase==='charge'||e.phase==='warning'&&Number.isFinite(e.chargeAngle)){
          const seconds=Math.max(0,available-(e.phase==='warning'?e.phaseTime:0)),speed=e.kind==='wagon'?310:e.spec?.chargeSpeed||300;
          ex+=Math.cos(e.chargeAngle)*speed*seconds;ey+=Math.sin(e.chargeAngle)*speed*seconds;
          if(e.kind==='wagon')ex=Math.max(Math.min(e.x,e.endX),Math.min(Math.max(e.x,e.endX),ex));
        }
        const d=Math.hypot(x-ex,y-ey)-p.radius-e.radius;minSpace=Math.min(minSpace,d);
        if(e.contactDamage>0)danger+=Math.max(0,30-d)**2*(d<0?8:1);
        for(const h of e.hazards||e.zones||[]) {
          if(!h.active&&e.phase==='warning'&&e.phaseTime>t)continue;
          const d=h.radius?Math.hypot(x-h.x,y-h.y)-h.radius-p.radius:(h.x===h.x2?Math.abs(x-h.x):Math.abs(y-h.y))-h.width-p.radius;
          danger+=Math.max(0,18-d)**2*4;
        }
      }
      for(const b of bolts) {
        const d=Math.hypot(x-b.x-Math.cos(b.angle)*b.spec.speed*t,y-b.y-Math.sin(b.angle)*b.spec.speed*t)-p.radius-b.spec.radius;
        danger+=Math.max(0,23-d)**2*5;
      }
    }
    const x=p.x+input.x*55,y=p.y+input.y*55;
    const distance=Math.min(...enemies.map(e=>Math.hypot(x-e.x,y-e.y)));
    const range=run.weapon.range;
    let score=-danger+Math.min(75,minSpace)*.3-Math.abs(distance-range*.66)*.22;
    if(distance>range-12)score-=(distance-range+12)*1.5;
    if(i<0&&distance<range-8)score+=run.weapon.cooldown<.16?70:18;
    score+=(input.x*last.x+input.y*last.y)*3;
    if(x<ROOM.left+22||x>ROOM.right-22||y<ROOM.top+22||y>ROOM.bottom-22)score-=25;
    if(score>best){best=score;chosen=input;}
  }
  memory.set(run,chosen);return chosen;
}
