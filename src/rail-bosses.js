import {projectileMuzzleClear} from './projectile-attacks.js';
import {moveBetweenAttacks,recoveryMotion,motionLocked} from './enemy-mobility.js';
import {prepareCircle,circleShot,switchRails} from './boss-patterns.js';
import {bossHealth,bossActivityScale} from './boss-tuning.js';
import {aimFan,enemyShot} from './enemy-volley.js';
import { Enemy } from './enemy.js';
import { ROOM } from './config.js';
import { clampToRoom, segmentCircle } from './math.js';
import { DRAISINE_BOLT } from './enemies/rail-stats.js';

export const RAIL_BOSS_SPECS=Object.freeze({
  stationmaster:Object.freeze({name:'LE CHEF DE GARE',health:bossHealth('stationmaster',1150),radius:26,speed:84,rest:2.1,warning:1,chargeSpeed:350,chargeSeconds:.65,recovery:1.1,damageTaken:.9,color:0xf1b25f,quote:'Lui, il a pas raté son train.'}),
  locomotive:Object.freeze({name:'LA LOCOMOTIVE',health:bossHealth('locomotive',1650),radius:32,speed:32,rest:2.5,warning:1.3,chargeSpeed:190,chargeSeconds:.5,recovery:1.4,damageTaken:.9,color:0xef9273,quote:'Ça, tu l’arrêtes pas avec une pelle.'}),
  switchman:Object.freeze({name:'L’AIGUILLEUR',health:bossHealth('switchman',1900),radius:27,speed:54,rest:2.3,warning:1.25,recovery:1.3,damageTaken:.9,color:0x7ce6da,quote:'Regarde les rails, pas mes lunettes.'}),
});
export class RailBoss extends Enemy {
  constructor(id,bossId,{final=false,slot=0}={}) {
    const spec=RAIL_BOSS_SPECS[bossId];
    super(id,225,220,{...spec,telegraph:1.4,contactDamage:bossId==='locomotive'?1.5:1});
    this.kind='boss';this.bossId=bossId;this.spec=spec;this.final=final;
    this.phase='positioning';this.phaseTime=final?1.6+slot*1.25:spec.rest*bossActivityScale(this);
    this.restScale=final?1.45:1;this.attackCount=0;this.hazards=[];
    this.previousX=this.x;this.previousY=this.y;
    if(bossId==='switchman')this.projectileSpec=DRAISINE_BOLT;
  }
  get fixedPosition(){return motionLocked(this);}
  beginWarning(player,context={}) {
    this.phase='warning';this.phaseTime=this.spec.warning;
    this.attackCount++;this.projectilePattern=null;this.crossPattern=false;
    this.pattern=this.bossId==='stationmaster'?(this.attackCount%3===0?'wagon':'charge'):
      this.bossId==='locomotive'?(this.attackCount%2?'ram':'steam'):(this.attackCount%2?'rails':'burst');
    if(this.pattern==='wagon'&&context.canSummonWagon&&!context.canSummonWagon())this.pattern='charge';
    this.fanAttack=this.bossId==='switchman'&&this.pattern==='burst'&&(this.hp<=this.maxHealth*.5?this.attackCount%6!==2:this.attackCount%4===0);
    if(this.bossId==='switchman'&&this.pattern==='burst'&&this.attackCount%6===0)prepareCircle(this,context);
    this.attackAngle=Math.atan2(player.y-this.y,player.x-this.x);
    this.chargeAngle=['charge','ram'].includes(this.pattern)?this.attackAngle:undefined;
    if(this.pattern==='steam') {
      const radius=54,x=this.x+Math.cos(this.attackAngle)*80,y=this.y+Math.sin(this.attackAngle)*80;
      this.hazards=[{x:Math.max(ROOM.left+radius,Math.min(ROOM.right-radius,x)),y:Math.max(ROOM.top+radius,Math.min(ROOM.bottom-radius,y)),radius,active:false,time:1.6}];
    }
    if(this.pattern==='rails') {
      this.hazards=switchRails(this,player,context);
    }
  }
  update(dt,player,attacks=[],context={}) {
    this.previousX=this.x;this.previousY=this.y;
    if(!this.tick(dt))return;
    recoveryMotion(this,dt,player);
    aimFan(this,player);
    for(const h of this.hazards)if(h.active)h.time-=dt;
    this.hazards=this.hazards.filter(h=>h.time>0);
    this.phaseTime-=dt;
    if(this.phase==='positioning') {
      moveBetweenAttacks(this,dt,player);
      if(this.phaseTime<=0){if(this.bossId==='switchman'&&(this.attackCount+1)%2===0&&!projectileMuzzleClear(this,player))return;this.beginWarning(player,context);}
    }
    if(this.phase==='warning'&&this.pattern==='burst')this.phaseTime=0;
    if(this.phase==='warning'&&this.phaseTime<=0) {
      if(['charge','ram'].includes(this.pattern)){this.phase='charge';this.phaseTime=this.spec.chargeSeconds;}
      else if(this.pattern==='burst'){this.phase='burst';this.phaseTime=0;this.burstLeft=this.projectilePattern==='circle'||this.fanAttack?1:2;}
      else {
        if(this.pattern==='wagon')attacks.push({type:'summon-wagon',owner:this.id});
        for(const h of this.hazards)h.active=true;
        this.recover();
      }
    } else if(this.phase==='charge') {
      this.angle=this.chargeAngle;this.x+=Math.cos(this.angle)*this.spec.chargeSpeed*dt;this.y+=Math.sin(this.angle)*this.spec.chargeSpeed*dt;
      const wall=this.x<=ROOM.left+this.radius||this.x>=ROOM.right-this.radius||this.y<=ROOM.top+this.radius||this.y>=ROOM.bottom-this.radius;
      clampToRoom(this,ROOM);if(wall||this.phaseTime<=0)this.recover();
    }
    if(this.phase==='burst'&&this.phaseTime<=0) {
      if(!projectileMuzzleClear(this,player))return;
      attacks.push(this.projectilePattern==='circle'?circleShot(this):enemyShot(this,player));
      this.phaseTime=.32;if(!--this.burstLeft)this.recover();
    } else if(this.phase==='recovery'&&this.phaseTime<=0) {
      this.phase='positioning';this.phaseTime=this.spec.rest*bossActivityScale(this);
    }
  }
  fallbackCharge(player){this.pattern='charge';this.phase='warning';this.phaseTime=this.spec.warning;this.attackAngle=this.chargeAngle=Math.atan2(player.y-this.y,player.x-this.x);}
  recover(){this.phase='recovery';this.phaseTime=Math.max(this.spec.recovery*bossActivityScale(this),...this.hazards.map(h=>h.time));}
  hit(damage,angle,force){super.hit(damage*this.spec.damageTaken,angle,force);this.pushX=this.pushY=0;}
}
export function railHazardTouches(h,player) {
  if(!h.active)return false;
  return h.radius?Math.hypot(player.x-h.x,player.y-h.y)<h.radius+player.radius:
    segmentCircle(h.x,h.y,h.x2,h.y2,player.x,player.y,h.width+player.radius)!==null;
}
