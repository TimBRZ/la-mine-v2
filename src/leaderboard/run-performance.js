import {CLIENT_VERSION} from './records.js';
let serial=0;
// Observes existing clocks; no change to combat or random-number consumption.
export class RunPerformance {
 constructor(run,now=Date.now()){this.id=String(now)+'-'+(++serial);this.startedAt=now;this.wave=run.waveNumber;this.reachedMs=0;this.done=false;}
 observe(run,now=Date.now()) {
  if(this.done)return null;
  if(run.waveNumber>this.wave){this.wave=run.waveNumber;this.reachedMs=Math.round(run.elapsed*1000);}
  if(!['won','lost'].includes(run.status))return null;this.done=true;
  return {run_id:this.id,zone_id:run.world.id,max_wave:this.wave,completed:run.status==='won'&&run.completedWaves===20,duration_ms:Math.max(1,Math.round(run.elapsed*1000)),depth_reached_ms:this.reachedMs,weapon_id:run.weapon.definition.id,run_started_at:new Date(this.startedAt).toISOString(),run_finished_at:new Date(Math.max(now,this.startedAt)).toISOString(),client_version:CLIENT_VERSION,kills:run.kills};
 }
}
