import {projectileMuzzleClear} from './projectile-attacks.js';
import {ForgeDungeonBoss} from './forge/dungeon-boss.js';
import {ForgeActor} from './forge/actors.js';
import {FORGE_BOSSES} from './forge/config.js';
import {DepthsActor} from './depths/actors.js';
import {DEPTHS_BOSSES} from './depths/config.js';
import {RiftActor} from './rift/actors.js';
import {RIFT_BOSSES} from './rift/config.js';
import {moveBetweenAttacks,recoveryMotion} from './enemy-mobility.js';
import {ShaftActor,SHAFT_BOSSES} from './shaft-actors.js';
import {prepareCircle,circleShot} from './boss-patterns.js';
import {aimFan,enemyShot} from './enemy-volley.js';
import { Enemy } from './enemy.js';
import { RailBoss, RAIL_BOSS_SPECS } from './rail-bosses.js';
import { Haveuse } from './boss.js';
import { BOSS_SPECS, FINAL_BOSS, bossRestScale, aimedPoint } from './difficulty.js';
import { ROOM } from './config.js';

// Both new machines have only three states: positioning, warning, recovery.
export class GalleryBoss extends Enemy {
  constructor(id, bossId) {
    super(id,225,220);
    this.kind='boss'; this.bossId=bossId; this.spec=BOSS_SPECS[bossId];
    this.hp=this.maxHealth=this.spec.health; this.radius=28; this.warmup=1.4;
    this.phase='positioning'; this.phaseTime=this.spec.rest*bossRestScale(this);
    this.previousX=this.x; this.previousY=this.y;
    this.zones=[];
    this.attackCount=0;
  }
  update(dt,player,attacks=[],context={}) {
    this.previousX=this.x; this.previousY=this.y;
    this.warmup=Math.max(0,this.warmup-dt); this.flash=Math.max(0,this.flash-dt);
    if(!this.active)return;
    recoveryMotion(this,dt,player);
    aimFan(this,player);
    for(const zone of this.zones)zone.time-=dt;
    this.zones=this.zones.filter(z=>z.time>0);
    this.phaseTime-=dt;
    if(this.phase==='positioning') {
      moveBetweenAttacks(this,dt,player);
      if(this.phaseTime<=0) {
        if(this.bossId==='crachefer'&&!projectileMuzzleClear(this,player))return;
        this.phase='warning';this.phaseTime=this.spec.warning;
        const target=aimedPoint(player,this.spec.lead||0);
        this.attackAngle=Math.atan2(target.y-this.y,target.x-this.x);
        this.attackCount++;this.projectilePattern=null;
        this.fanAttack=this.bossId==='crachefer'&&(this.hp<=this.maxHealth*.5?this.attackCount%3!==1:this.attackCount%2===0);
        if(this.bossId==='crachefer'&&this.attackCount%4===0)prepareCircle(this,context);
        if(this.bossId==='effondreur') {
          const speed=Math.hypot(player.vx||0,player.vy||0);
          const angle=speed>20?Math.atan2(player.vy,player.vx):this.angle+(this.attackCount%2?1:-1)*Math.PI/2;
          const radius=this.spec.zoneRadius;
          this.zones=Array.from({length:this.spec.zoneCount},(_,i)=>({
            x:Math.max(ROOM.left+radius,Math.min(ROOM.right-radius,player.x+Math.cos(angle)*i*110)),
            y:Math.max(ROOM.top+radius,Math.min(ROOM.bottom-radius,player.y+Math.sin(angle)*i*110)),
            radius,time:this.spec.warning+this.spec.zoneSeconds,
          }));
        }
      }
    }
    if(this.bossId==='crachefer'&&this.phase==='warning'){this.phaseTime=0;if(!projectileMuzzleClear(this,player))return;}
    if(this.phase==='warning'&&this.phaseTime<=0) {
      if(this.bossId==='crachefer')attacks.push(this.projectilePattern==='circle'?circleShot(this):enemyShot(this,player));
      this.phase='recovery';this.phaseTime=this.bossId==='effondreur'?this.spec.zoneSeconds:this.spec.recovery*bossRestScale(this);
    } else if(this.phase==='recovery'&&this.phaseTime<=0) {
      this.phase='positioning';this.phaseTime=this.spec.rest*bossRestScale(this);
    }
  }
  hit(damage,angle,force) { super.hit(damage*this.spec.damageTaken,angle,force);this.pushX=this.pushY=0; }
}

export function createBoss(id,bossId,position,healthScale=1,options={}) {
  const rail=Object.hasOwn(RAIL_BOSS_SPECS,bossId);
  const shaft=Object.hasOwn(SHAFT_BOSSES,bossId);
  const boss=Object.hasOwn(FORGE_BOSSES,bossId)?new ForgeDungeonBoss(id,bossId,...position,options):Object.hasOwn(DEPTHS_BOSSES,bossId)?new DepthsActor(id,bossId,...position,options):Object.hasOwn(RIFT_BOSSES,bossId)?new RiftActor(id,bossId,...position,options):shaft?new ShaftActor(id,bossId,...position,options):rail?new RailBoss(id,bossId,options):bossId==='haveuse'?new Haveuse(id):new GalleryBoss(id,bossId);
  boss.final=Boolean(options.final);boss.bossId=bossId; [boss.x,boss.y]=position;
  boss.previousX=boss.x;boss.previousY=boss.y;
  boss.hp=boss.maxHealth=Math.round(boss.maxHealth*healthScale);
  if(options.final&&!rail&&!shaft) {
    boss.restScale=FINAL_BOSS.restScale;
    // Use one shared opening base: different per-boss rest times would otherwise
    // cancel the stagger and launch Haveuse/Crachefer almost simultaneously.
    boss.phaseTime=FINAL_BOSS.openingRest+(options.slot||0)*FINAL_BOSS.entryStagger;
  }
  if(options.final)boss.phaseTime=.9+(options.slot||0)*.45;
  return boss;
}
