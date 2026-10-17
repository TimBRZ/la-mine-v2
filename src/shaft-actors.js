import {projectileMuzzleClear} from './projectile-attacks.js';
import {moveBetweenAttacks,recoveryMotion,motionLocked} from './enemy-mobility.js';
import {Enemy} from './enemy.js';
import {ROOM} from './config.js';
import {clampToRoom} from './math.js';
import {prepareCircle,circleShot} from './boss-patterns.js';
const spec=(name,health,radius,speed,color,extra={})=>Object.freeze({name,health,radius,speed,color,telegraph:1,contactDamage:1,rest:2.8,warning:1.3,chargeSpeed:220,chargeSeconds:.4,damageTaken:1,...extra});
export const SHAFT_ENEMIES=Object.freeze({
  deepdriller:spec('Foreur de fond',105,20,46,0xc7a25f,{chargeSpeed:320,chargeSeconds:1.15,rest:.45}),
  surveyor:spec('Sondeur',65,16,56,0x8bcbdb,{contactDamage:.5}),
  gasminer:spec('Grisouteux',48,15,85,0x9cd397,{contactDamage:.5}),
});
export const SHAFT_BOSSES=Object.freeze({
  cager:spec('LE CAGEUR',1600,29,66,0xd4a75f,{chargeSpeed:275,chargeSeconds:.55,quote:'J’espère que t’as signé la décharge.'}),
  compressor:spec('LE COMPRESSEUR',2100,31,38,0xb2c9cb,{quote:'La pression monte. Bouge.'}),
  firedamp:spec('LE GRISOU',2400,29,48,0x9de3ad,{quote:'Celui-là, j’le laisserais pas approcher.'}),
});
const PATTERNS={deepdriller:['charge'],surveyor:['impact'],gasminer:['blast'],cager:['charge','front','cable'],compressor:['steam','radial','pressure'],firedamp:['gas','blast','energy']};
export class ShaftActor extends Enemy {
  constructor(id,type,x=225,y=220,{final=false,slot=0}={}) {
    const s=SHAFT_ENEMIES[type]||SHAFT_BOSSES[type];super(id,x,y,s);
    this.shaftType=type;this.spec=s;this.kind=SHAFT_BOSSES[type]?'boss':type;this.bossId=this.kind==='boss'?type:undefined;
    this.final=final;this.phase='positioning';this.phaseTime=final?2+slot*1.7:2;this.attackCount=0;
    this.previousX=x;this.previousY=y;this.sweptContact=true;this.chargeAngle=undefined;
    this.projectileSpec={speed:105,radius:6,range:360,damage:.5,maxActive:1,color:s.color};
  }
  get fixedPosition(){return motionLocked(this);}
  recover(){this.phase='recovery';this.phaseTime=this.spec.rest*(this.kind==='boss'&&this.hp<this.maxHealth*.5?.86:1)*(this.final?1.35:1);this.chargeAngle=undefined;}
  beginWarning(player,context={}) {
    const patterns=PATTERNS[this.shaftType];this.pattern=patterns[this.attackCount++%patterns.length];
    this.phase='warning';this.phaseTime=this.spec.warning;this.projectilePattern=null;this.fanAttack=false;
    this.attackAngle=this.angle=Math.atan2(player.y-this.y,player.x-this.x);
    if(this.pattern==='charge'){this.chargeAngle=this.attackAngle;return;}
    if(['steam','energy'].includes(this.pattern)){this.fanAttack=this.pattern==='steam';return;}
    if(this.pattern==='radial'){if(!prepareCircle(this,context)){this.pattern='steam';this.fanAttack=true;}return;}
    const front={x:this.x+Math.cos(this.angle)*85,y:this.y+Math.sin(this.angle)*85};
    const points=this.pattern==='gas'&&!this.final?[{x:player.x-65,y:player.y},{x:player.x+65,y:player.y}]:[this.pattern==='front'?front:this.pattern==='blast'?this:player];
    const radius=this.pattern==='blast'?62:this.pattern==='pressure'?52:36;
    // Ground budget is shared; final concurrency is admitted by triple-pressure.
    if(!context.shaftAttack?.(this,points,{warning:1.5,duration:this.pattern==='pressure'?1.4:.7,radius,vertical:this.pattern==='cable',label:({impact:'SONDE !',gas:'GAZ !',blast:'EXPLOSION !',front:'IMPACT !',cable:'CÂBLE !',pressure:'PRESSION !'})[this.pattern]})){if(this.final){this.attackCount--;this.phase='positioning';this.phaseTime=.25;}else this.recover();return;}
    this.phaseTime=1.5;
  }
  update(dt,player,attacks=[],context={}) {
    this.previousX=this.x;this.previousY=this.y;if(!this.tick(dt))return;
    recoveryMotion(this,dt,player);
    this.phaseTime-=dt;
    const distance=Math.hypot(player.x-this.x,player.y-this.y);
    if(this.phase==='positioning'){
      this.angle=Math.atan2(player.y-this.y,player.x-this.x);
      const ranged=['surveyor','compressor','firedamp'].includes(this.shaftType);
      const next=PATTERNS[this.shaftType][this.attackCount%PATTERNS[this.shaftType].length];
      moveBetweenAttacks(this,dt,player);
      if(this.phaseTime<=0&&(!['steam','energy','radial'].includes(next)||projectileMuzzleClear(this,player))&&((ranged&&(this.shaftType!=='surveyor'||distance>=160&&distance<=285))||this.kind==='boss'||(!ranged&&distance<(this.shaftType==='gasminer'?108:340))))this.beginWarning(player,context);
    }
    if(this.phase==='warning'&&['steam','energy','radial'].includes(this.pattern)){this.phaseTime=0;if(!projectileMuzzleClear(this,player))return;}
    if(this.phase==='warning'&&this.phaseTime<=0){
      if(this.pattern==='charge'){this.phase='charge';this.phaseTime=this.spec.chargeSeconds;}
      else{if(this.projectilePattern==='circle')attacks.push(circleShot(this));else if(['steam','energy'].includes(this.pattern))attacks.push({type:'enemy-shot',owner:this.id,angle:this.attackAngle,fan:this.fanAttack});this.recover();}
    }else if(this.phase==='charge'){
      this.x+=Math.cos(this.chargeAngle)*this.spec.chargeSpeed*dt;this.y+=Math.sin(this.chargeAngle)*this.spec.chargeSpeed*dt;clampToRoom(this,ROOM);
      const wall=this.x<=ROOM.left+this.radius||this.x>=ROOM.right-this.radius||this.y<=ROOM.top+this.radius||this.y>=ROOM.bottom-this.radius;
      if(this.phaseTime<=0||(this.kind==='deepdriller'&&wall))this.recover();
    }else if(this.phase==='recovery'&&this.phaseTime<=0){this.phase='positioning';this.phaseTime=1.2;}
  }
  hit(damage,angle,force){super.hit(damage,angle,this.kind==='boss'?0:force);}
}
