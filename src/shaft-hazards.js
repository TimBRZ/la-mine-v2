import {segmentCircle} from './math.js';
import {ROOM} from './config.js';
// Shared budget for ground attacks and environmental instability. No chains.
export class ShaftHazards {
  constructor(){this.items=[];this.until=5;this.sequence=0;}
  clear(){this.items=[];this.until=5;}
  request(owner,points,{warning=1.4,duration=.8,radius=38,damage=.5,label='INSTABLE !',vertical=false}={}) {
    if(this.items.length+points.length>3||this.items.some(h=>h.owner===owner))return false;
    for(const p of points)this.items.push({owner,x:Math.max(ROOM.left+radius+15,Math.min(ROOM.right-radius-15,p.x)),y:Math.max(ROOM.top+(vertical?105:radius+15),Math.min(ROOM.bottom-(vertical?105:radius+15),p.y)),radius,warning,remaining:duration,active:false,damage,label,vertical});
    return true;
  }
  update(dt,run,events){
    this.items=this.items.filter(h=>h.owner===0||run.enemies.some(e=>e.id===h.owner&&e.alive));
    for(const h of this.items){if(!h.active){h.warning-=dt;if(h.warning<=0)h.active=true;}else h.remaining-=dt;
      if(h.active&&shaftHazardTouches(h,run.player))run.damagePlayer(h.damage,events);
    }
    this.items=this.items.filter(h=>h.remaining>0);
    if(!run.wave.instability||run.wave.boss)return;
    this.until-=dt;
    if(this.until<=0){
      // Alternate player pressure and fixed machinery vents. All points lock now.
      const p=++this.sequence%2?run.player:{x:110+(this.sequence%3)*110,y:300+(this.sequence%2)*210};
      if(this.request(0,[p],{warning:1.6,duration:1,radius:42,label:'SOL INSTABLE'})){this.until=run.wave.instability;events.push({type:'shaft-warning'});}else this.until=1;
    }
  }
}

export function shaftHazardTouches(h,p){return h.vertical?segmentCircle(h.x,h.y-90,h.x,h.y+90,p.x,p.y,14+p.radius)!==null:Math.hypot(p.x-h.x,p.y-h.y)<h.radius+p.radius;}
