import { Enemy } from '../enemy.js';
import { RAT } from './stats.js';
export class GalleryRat extends Enemy {
  constructor(id, x, y) { super(id, x, y, RAT); this.kind = 'rat'; }
  update(dt,player,attacks,pressure={}) {
    const flank=pressure.tuning?.flank||0;
    const distance=Math.hypot(player.x-this.x,player.y-this.y);
    if(!flank || distance<90) { super.update(dt,player);return; }
    if(!this.tick(dt))return;
    const camping=pressure.stillSeconds>=pressure.tuning.campAfter;
    const angle=Math.atan2(player.y-this.y,player.x-this.x)+(this.id%2?1:-1)*flank*(camping?1:.55);
    this.angle=angle;
    const speed=this.stats.speed*(this.flash>0?.35:1);
    this.move(dt,Math.cos(angle)*speed,Math.sin(angle)*speed);
  }
}
