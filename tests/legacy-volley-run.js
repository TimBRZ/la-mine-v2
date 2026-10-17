// Historical regression fixtures: run the frozen V0.21 weapons, collisions, rewards
// and progression against the V0.20 enemy shots these scenarios were designed for.
// Current V0.22 behavior and full live runs are tested in builds-v022.test.js.
import {Run as LiveRun} from './v021-final-src-snapshot/run.js';
import {AutonomousDrill} from './v020-final-src-snapshot/enemies/drill.js';
import {Draisine} from './v020-final-src-snapshot/enemies/draisine.js';
import {GalleryBoss} from './v020-final-src-snapshot/bosses.js';
import {RailBoss} from './v020-final-src-snapshot/rail-bosses.js';
function legacy(e) {
  const prototype=e.kind==='drill'?AutonomousDrill.prototype:e.kind==='draisine'?Draisine.prototype:e.bossId==='crachefer'?GalleryBoss.prototype:e.bossId==='switchman'?RailBoss.prototype:null;
  if(prototype){e.update=prototype.update;e.fanAttack=false;if(e.bossId==='switchman')e.beginWarning=prototype.beginWarning;}
}
export class Run extends LiveRun {
  spawn(){const ok=super.spawn();if(ok)legacy(this.enemies.at(-1));return ok;}
  update(...args){for(const e of this.enemies)legacy(e);return super.update(...args);}
  enterNextWave(){const ok=super.enterNextWave();for(const e of this.enemies)legacy(e);return ok;}
}
