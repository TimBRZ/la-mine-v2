// Small pooled decoration, below telegraphs (depth 8), hazards and actors.
// Reads committed combat only; no emitters, random calls, timers or gameplay writes.
export class ForgeSpriteVfx {
 constructor(scene){this.g=scene.add.graphics().setDepth(7);this.primitives=0;}
 update(run,reduced=false){const g=this.g;g.clear();this.primitives=0;if(!run.forge||reduced)return;
  const dot=(x,y,r,c,a)=>{if(this.primitives>=48)return;g.fillStyle(c,a).fillCircle(x,y,r);this.primitives++;};
  const spark=(x,y,dx,dy,c,a)=>{if(this.primitives>=48)return;g.lineStyle(1.5,c,a).lineBetween(x,y,x+dx,y+dy);this.primitives++;};
  for(const e of run.enemies){if(!e.forgeType||!e.active||!e.alive)continue;const facing=Math.cos(e.chargeAngle??e.attackAngle??e.angle??0)<0?-1:1;
   const active=run.forge.ground.items.filter(h=>h.owner===e.id&&h.active&&!h.cooling),fresh=active.find(h=>h.elapsed<.18);
   if(e.forgeType==='riveter'&&e.phase==='recovery'&&e.recoveryElapsed<.12&&run.forge.shots.pool.some(b=>b.active&&b.owner===e.id)){
    spark(e.x+22*facing,e.y+5,5*facing,-3,0xffd6a0,.6);spark(e.x+22*facing,e.y+5,5*facing,3,0xffd6a0,.6);
   }
   if(e.forgeType==='scorifier'&&e.phase==='charge')for(const j of [-1,1])spark(e.x-12*facing,e.y+17+j*2,-5*facing,j*2,0xd8864d,.45);
   if(fresh){const t=fresh.elapsed/.18,a=(1-t)*.4;
    if(e.forgeType==='stoker')dot(e.x+19*facing,e.y+5,2+2*t,0xd9844d,a);
    if(e.forgeType==='hammer'&&fresh.shape!=='wave')for(const j of [-1,0,1])spark(fresh.x+j*(4+t*6),fresh.y+2,j*3,-3,0xc3b49a,a);
    if(e.forgeType==='boiler')for(const j of [-1,1])dot(e.x+j*(25+t*7),e.y-9,2+3*t,0xa7bfc2,a);
    if(e.forgeType==='furnace')for(const j of [-1,1])spark(e.x+j*10,e.y-4,j*3,-2,0xffad32,a);
   }
   const recovery=e.dungeonRecovery&&run.forge.director.history.findLast(h=>h.type==='recovery'&&h.boss===e.bossId);
   if(recovery&&e.phaseTime>recovery.duration-.18)for(const j of [-1,1])dot(e.x+j*22,e.y-14,2,0xa7bfc2,.18);
  }
 }
}
