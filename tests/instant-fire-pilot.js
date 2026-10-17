// Current instant-fire QA pilot: keep more flight space for ranged weapons.
// SMG stop windows receive priority to use its short legal firing cadence.
// Input selection only; no game fields, HP, seeds, cooldowns or upgrades changed.
import {forecastBossHazard,bossHazardDistance} from './v036b-pilot-geometry.js';
// QA inputs only: forecast visible motion/bolts, never edit the combat model.
import {tacticalPilot} from './tactical-pilot.js';
import {ROOM} from '../src/config.js';
const memory=new WeakMap();
function lineDistance(x,y,h){const dx=h.x2-h.x,dy=h.y2-h.y,t=Math.max(0,Math.min(1,((x-h.x)*dx+(y-h.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-h.x-t*dx,y-h.y-t*dy);}
export function instantFirePilot(run) {
  const p=run.player,zero={x:0,y:0};if(run.wavePhase!=='combat')return zero;
  const enemies=run.enemies.filter(e=>e.alive);if(!enemies.length&&!run.hostileProjectiles.pool.some(b=>b.active)&&!run.shaftHazards?.items.length&&!run.rift?.shots.bursts.length)return zero;
  const bolts=run.hostileProjectiles.pool.filter(b=>b.active),last=memory.get(run)||zero;
  if(!['shaft59','rift','depths'].includes(run.world.id)&&run.weapon.definition.id==='shotgun'&&!bolts.length&&!enemies.some(e=>e.hazards?.length||e.fanAttack&&e.phase==='warning'))return tacticalPilot(run);
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
        if(['rat','miner','deepdriller','gasminer','crawler','burster','blackmaw','blaster'].includes(e.kind)&&e.phase!=='warning'&&e.phase!=='charge'){const a=Math.atan2(y-ey,x-ex);ex+=Math.cos(a)*e.stats.speed*(e.kind==='burster'&&Math.hypot(x-ex,y-ey)<170?1.9:1)*available;ey+=Math.sin(a)*e.stats.speed*available;}
        if((e.riftType||e.depthsType)&&e.kind==='boss'&&['positioning','recovery'].includes(e.phase)){ex+=(e.x-e.previousX)*60*available;ey+=(e.y-e.previousY)*60*available;}
        if(Number.isFinite(e.chargeAngle)&&(e.phase==='charge'||e.phase==='warning')){
          const seconds=Math.max(0,available-(e.phase==='warning'?e.phaseTime:0)),speed=e.kind==='wagon'?310:(e.depthsType?(e.pattern==='leap'?260:310):(e.riftType?330:e.spec?.chargeSpeed||300));
          ex+=Math.cos(e.chargeAngle)*speed*seconds;ey+=Math.sin(e.chargeAngle)*speed*seconds;
          if(e.kind==='wagon')ex=Math.max(Math.min(e.x,e.endX),Math.min(Math.max(e.x,e.endX),ex));
        }
        const d=Math.hypot(x-ex,y-ey)-p.radius-e.radius;minSpace=Math.min(minSpace,d);
        if(e.contactDamage>0)danger+=Math.max(0,30-d)**2*(d<0?8:1);
        for(const h of e.hazards||e.zones||[]) {
          if(!h.active&&e.phase==='warning'&&e.phaseTime>t)continue;
          const d=h.radius?Math.hypot(x-h.x,y-h.y)-h.radius-p.radius:lineDistance(x,y,h)-h.width-p.radius;
          danger+=Math.max(0,18-d)**2*4;
        }
      }
      for(const h of run.shaftHazards?.items||[]){if(h.controlled){const f=forecastBossHazard(run,h,t);if(f){const d=bossHazardDistance(f,{x,y,radius:p.radius});danger+=Math.max(0,24-d)**2*6;}continue;}if(!h.active&&h.warning>t+.2)continue;const d=h.kind==='fissure'?lineDistance(x,y,h)-h.width-p.radius:h.vertical?Math.hypot(Math.max(0,Math.abs(x-h.x)-14),Math.max(0,Math.abs(y-h.y)-90))-p.radius:Math.hypot(x-h.x,y-h.y)-h.radius-p.radius;danger+=Math.max(0,22-d)**2*6;}
      for(const b of run.rift?.shots.bursts||[])if(b.warning<t+.2){const d=Math.hypot(x-b.x,y-b.y)-55;danger+=Math.max(0,20-d)**2*4;}
      for(const b of bolts) {
        const d=Math.hypot(x-b.x-Math.cos(b.angle)*b.spec.speed*t,y-b.y-Math.sin(b.angle)*b.spec.speed*t)-p.radius-b.spec.radius;
        danger+=Math.max(0,23-d)**2*5;
      }
    }
    const x=p.x+input.x*55,y=p.y+input.y*55;
    const distance=enemies.length?Math.min(...enemies.map(e=>Math.hypot(x-e.x,y-e.y))):run.weapon.range*(run.weapon.definition.id==='shotgun'?.66:.8);
    const range=run.weapon.range;
    let score=-danger+Math.min(75,minSpace)*.3-Math.abs(distance-range*(run.weapon.definition.id==='shotgun'?.66:.8))*.22;
    if(distance>range-12)score-=(distance-range+12)*1.5;
    if(i<0&&distance<range-8)score+=run.weapon.cooldown<.16?(run.weapon.definition.id==='grisoux'?70:150):18;
    score+=(input.x*last.x+input.y*last.y)*3;
    if(x<ROOM.left+22||x>ROOM.right-22||y<ROOM.top+22||y>ROOM.bottom-22)score-=25;
    if(score>best){best=score;chosen=input;}
  }
  memory.set(run,chosen);return chosen;
}

