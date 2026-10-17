import {fanAngles} from '../src/enemy-volley.js';
// QA only. The pilot reads ordinary visible enemy positions and warnings and
// returns movement input; it never edits HP, enemies, damage or weapon state.
const memory=new WeakMap();
const lane=(q,b,width,length)=>{
  const dx=q.x-b.x,dy=q.y-b.y,forward=dx*Math.cos(b.angle)+dy*Math.sin(b.angle);
  return forward>-15&&forward<length&&Math.abs(-dx*Math.sin(b.angle)+dy*Math.cos(b.angle))<width;
};
export function tacticalPilot(run) {
  const zero={x:0,y:0},p=run.player;
  if(run.wavePhase!=='combat')return zero;
  // Spawn telegraphs are visible too: never walk into a newly appearing rat.
  const enemies=run.enemies.filter(e=>e.alive);
  if(!enemies.length)return zero;
  const nearest=q=>Math.min(...enemies.map(e=>Math.hypot(q.x-e.x,q.y-e.y)));
  const zones=enemies.flatMap(e=>e.zones||[]);
  const bolts=run.hostileProjectiles.pool.filter(b=>b.active);
  const warnings=enemies.filter(e=>e.phase==='warning'&&Number.isFinite(e.attackAngle));
  const charges=enemies.filter(e=>Number.isFinite(e.chargeAngle)&&['warning','charge'].includes(e.phase));
  const threatened=q=>zones.some(z=>Math.hypot(q.x-z.x,q.y-z.y)<z.radius+22)
    ||bolts.some(b=>lane(q,b,29,130))
    ||warnings.some(e=>(e.fanAttack?fanAngles(e.attackAngle):[e.attackAngle]).some(angle=>lane(q,{x:e.x,y:e.y,angle},32,420)))
    ||charges.some(e=>lane(q,{x:e.x,y:e.y,angle:e.chargeAngle},e.radius+25,e.kind==='wagon'?Math.abs(e.endX-e.x):290));
  const clearance=q=>Math.min(...enemies.map(e=>{
    const approach=e.kind==='rat'?118:e.kind==='miner'?46:e.kind==='boss'&&e.phase==='chase'?54:0;
    return Math.hypot(q.x-e.x,q.y-e.y)-e.radius-p.radius-approach*.3;
  }));
  const range=run.weapon.range,dist=nearest(p),ready=run.weapon.definition.id==='smg'||run.weapon.cooldown<.2;
  if(ready&&dist<range-8&&clearance(p)>15&&!threatened(p))return zero;
  const last=memory.get(run)||zero;let best=-Infinity,move=zero;
  const lookahead=Math.min(72,range*.4);
  for(let i=0;i<32;i++) {
    const angle=i*Math.PI/16,x=Math.cos(angle),y=Math.sin(angle),q={x:p.x+x*lookahead,y:p.y+y*lookahead};
    if(q.x<49||q.x>401||q.y<137||q.y>645)continue;
    const space=clearance(q),target=nearest(q);
    let score=Math.min(145,space)-Math.abs(target-Math.min(range*.7,180))*.25;
    if(target>range-12)score-=(target-range+12)*1.5;
    if(threatened(q))score-=250;
    // A running wagon cannot be crossed safely just because the destination
    // lies beyond its lane. Read its visible locked rail along the input path.
    for(const e of charges.filter(e=>e.kind==='wagon'&&e.phase==='charge')) {
      for(let step=1;step<=4;step++) {
        const probe={x:p.x+(q.x-p.x)*step/4,y:p.y+(q.y-p.y)*step/4};
        if(lane(probe,{x:e.x,y:e.y,angle:e.chargeAngle},e.radius+p.radius+8,Math.abs(e.endX-e.x))){score-=400;break;}
      }
    }
    score+=Math.min(q.x-49,401-q.x,q.y-137,645-q.y)*.12+(x*last.x+y*last.y)*12;
    for(const e of enemies) {
      const vx=q.x-p.x,vy=q.y-p.y,t=Math.max(0,Math.min(1,((e.x-p.x)*vx+(e.y-p.y)*vy)/(lookahead*lookahead)));
      if(Math.hypot(p.x+vx*t-e.x,p.y+vy*t-e.y)<e.radius+p.radius+9)score-=350;
    }
    if(score>best){best=score;move={x,y};}
  }
  memory.set(run,move);return move;
}
