import { LOOT } from './room-loot.js';

const COLORS = { coal: 0x637075, iron: 0xb18d73, diamond: 0x9af4ed, token: 0xffce54 };
export class LootView {
  constructor(scene) {
    // One graphics batch and a fixed label pool, independent of resource quantity.
    this.previous=Array.from({length:LOOT.capacity},()=>({x:0,y:0,active:false}));
    this.graphics = scene.add.graphics().setDepth(6);
    this.labels = Array.from({ length: LOOT.capacity }, () => scene.add.text(0, 0, '', {
      fontFamily: 'system-ui', fontSize: '10px', fontStyle: 'bold', color: '#eee8da',
      stroke: '#111b20', strokeThickness: 3,
    }).setOrigin(.5).setDepth(7).setVisible(false));
  }
  update(loot, reducedMotion) {
    const g = this.graphics;
    g.clear();
    for (const drop of loot.pool) {
      const label = this.labels[drop.id];
      label.setVisible(drop.active && drop.amount > 1);
      const previous=this.previous[drop.id];
      if (!drop.active) {previous.active=false;continue;}
      const { x, resource, amount } = drop;
      const y = drop.y - (reducedMotion ? 0 : Math.sin(Math.min(1, drop.age / .16) * Math.PI) * 5);
      const color = COLORS[resource];
      if(!reducedMotion&&previous.active&&loot.phase==='collecting') {
        const dx=previous.x-x,dy=previous.y-drop.y,length=Math.hypot(dx,dy),scale=Math.min(1,20/(length||1));
        g.lineStyle(3,color,.35).lineBetween(x,drop.y,x+dx*scale,drop.y+dy*scale);
      }
      previous.x=x;previous.y=drop.y;previous.active=true;
      g.fillStyle(0x080e12, .55).fillEllipse(x, drop.y + 6, 19, 7);
      if (resource === 'token') {
        const radius = reducedMotion ? 12 : 12 + Math.sin(drop.age * 5) * 1.5;
        g.lineStyle(1.5, color, .65).strokeCircle(x, y, radius);
        g.fillStyle(0x80601f).fillCircle(x, y, 8);
        g.lineStyle(2, color).strokeCircle(x, y, 8);
        g.fillStyle(color).fillTriangle(x, y - 6, x - 4, y + 3, x + 4, y + 3);
        g.fillStyle(0xfff4c5).fillCircle(x, y + 5, 1.5);
      } else if (resource === 'diamond') {
        g.fillStyle(color, .12).fillCircle(x, y, 12);
        g.fillStyle(color).fillTriangle(x, y - 8, x - 7, y, x + 7, y);
        g.fillStyle(0x4fabae).fillTriangle(x - 7, y, x + 7, y, x, y + 8);
        g.lineStyle(1, 0xe3fffc).lineBetween(x - 4, y - 2, x, y - 6);
      } else if (resource === 'iron') {
        g.fillStyle(color).fillRoundedRect(x - 8, y - 5, 16, 10, 2);
        g.lineStyle(2, 0xe0c2a6).lineBetween(x - 5, y - 3, x + 5, y - 3);
        g.lineStyle(2, 0x715d50).lineBetween(x - 6, y + 4, x + 6, y + 4);
      } else {
        g.fillStyle(0x151f26).fillTriangle(x-9,y+4,x-5,y-7,x+5,y-5).fillTriangle(x-9,y+4,x+5,y-5,x+9,y+5);
        g.fillStyle(0x536872).fillTriangle(x-5,y-7,x+5,y-5,x-1,y+2);
        g.fillStyle(0x8ea19e).fillTriangle(x-5,y-6,x+2,y-5,x-2,y-2);
        g.lineStyle(1,color).lineBetween(x-8,y+5,x+8,y+5);
        g.lineStyle(1.5, 0x91a1a6).lineBetween(x - 4, y - 3, x + 1, y - 4);
      }
      if (amount > 1) label.setPosition(x, y + 13).setText('×' + amount);
    }
  }
}
