// Isolated diagnostic fixture: no profile, rewards or production tuning writes.
import {Run} from '../src/run.js';
import {createBoss} from '../src/bosses.js';
export function scenario(RunType=Run,{low=false,final=false}={},bossFactory=createBoss) {
 const run=new RunType(()=>.4);
 run.waveIndex=run.world.waves.findIndex(w=>final?w.final:w.bosses?.length===1&&w.bosses[0]==='crachefer');
 const boss=bossFactory(1,'crachefer',[225,380],1,{final});
 if(low)boss.hp=boss.maxHealth*.4;
 run.enemies=[boss];run.spawned=run.wave.total;run.tripleStartingHealth=boss.maxHealth;
 run.weapon.update=()=>{};run.player.hp=1e9;
 return {run,boss,tick:0,selected:0,emitted:0,delayed:0,missing:0,maxBolts:0,trace:[],cycles:[],pending:null};
}
export function step(s) {
 const {run,boss}=s;
 if(boss.phase==='positioning'){
  const angle=boss.attackCount*Math.PI/4,distance=boss.attackCount%2?65:270;
  run.player.x=Math.max(42,Math.min(408,boss.x+Math.cos(angle)*distance));
  run.player.y=Math.max(130,Math.min(652,boss.y+Math.sin(angle)*distance));
 }
 const count=boss.attackCount,phase=boss.phase,events=run.update(1/60,{x:0,y:0});s.tick++;
 const pattern=boss.projectilePattern||(boss.fanAttack?'fan':'single');
 if(boss.attackCount!==count){
  s.selected++;s.pending={attack:boss.attackCount,pattern,prepare:s.tick,player:{x:run.player.x,y:run.player.y},boss:{x:boss.x,y:boss.y}};
  s.trace.push({tick:s.tick,event:'prepare',...s.pending});
 }
 for(const e of events)if(e.type==='enemy-shot'||e.type==='boss-shot-delayed'){
  if(e.type==='enemy-shot')s.emitted++;else s.delayed++;
  s.trace.push({tick:s.tick,event:e.type,attack:boss.attackCount,pattern,angle:e.angle,
   projectiles:run.hostileProjectiles.pool.filter(p=>p.active).map(p=>({id:p.id,x:p.x,y:p.y,angle:p.angle,distance:p.distance,owner:p.owner}))});
 }
 if(s.pending&&(events.some(e=>e.type==='enemy-shot')||phase==='warning'&&boss.phase!=='warning')){
  const fired=events.some(e=>e.type==='enemy-shot');if(!fired)s.missing++;
  s.cycles.push({...s.pending,release:s.tick,fired});s.pending=null;
 }
 if(phase!==boss.phase)s.trace.push({tick:s.tick,event:'state',from:phase,to:boss.phase});
 s.maxBolts=Math.max(s.maxBolts,run.hostileProjectiles.pool.filter(p=>p.active).length);
 return events;
}
export function summary(s){return {selected:s.selected,completed:s.cycles.length,emitted:s.emitted,delayed:s.delayed,missing:s.missing,maxBolts:s.maxBolts,ticks:s.tick};}
