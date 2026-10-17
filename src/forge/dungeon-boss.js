import {ForgeActor} from './actors.js';
import {FORGE_PATTERNS} from './config.js';
import {updatePressure,pressureRoles,repositionBoss} from './boss-pressure.js';
export class ForgeDungeonBoss extends ForgeActor{
 constructor(...args){super(...args);this.ultimateUsed=false;this.plan=null;this.dungeonRecovery=false;this.patternUses={};}
 get fixedPosition(){return this.dungeonRecovery||!!this.plan||super.fixedPosition;}
 update(dt,p,attacks=[],context={}){
  // Explicit legacy pattern calls remain available for historical diagnostics.
  // Normal factory-created bosses exclusively select the dungeon kit.
  if(!this.plan&&!this.dungeonRecovery&&this.phase!=='positioning'&&FORGE_PATTERNS[this.pattern])return super.update(dt,p,attacks,context);
  this.previousX=this.x;this.previousY=this.y;if(!this.tick(dt))return;
  updatePressure(this,dt,p);pressureRoles(context.forge.director);
  if(this.plan){context.forge.director.update(this,dt,p);return;}
  if(this.dungeonRecovery){this.phaseTime-=dt;if(this.phaseTime<=0){this.dungeonRecovery=false;this.phase='positioning';this.phaseTime=this.final?(this.hp<this.maxHealth*.5?.12:.2):(this.hp<this.maxHealth*.5?.35:.55);}return;}
  // Compatibility of direct recover() diagnostics; never used by dungeon plans.
  if(this.phase==='recovery')return super.update(dt,p,attacks,context);
  repositionBoss(this,dt,p,context.forge.run.enemies);this.phaseTime-=dt;
  if(this.phaseTime<=0){if(!context.forge.director.beginReady(this))this.phaseTime=.2;}
 }
}
