import { WEAPON_VFX, WEAPON_VFX_DEPTH, useWeaponVfx } from './weapon-visuals.js';
import {SHOTGUN_IMPACT_CAP} from './shotgun-vfx.js';
import {SMG_IMPACT_CAP} from './smg-vfx.js';
import {combatVfxSpec,useCombatVfx,GRISOUX_CAPS} from './grisoux-vfx.js';
export class Effects {
  constructor(scene) {
    this.seed=0x19c2;
    this.textures=scene.textures;
    this.items = Array.from({ length: 48 }, () => ({ sprite: scene.add.image(0, 0, 'spark').setVisible(false).setDepth(WEAPON_VFX_DEPTH), life: 0 }));
  }
  random() { this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296; }
  burst(x, y, color, count, direction = null) {
    count=Math.min(8,count);
    for (let i = 0; i < count; i++) {
      const item = this.items.find(p => p.life <= 0);
      if (!item) break;
      const angle = direction === null ? this.random() * Math.PI * 2 : direction + (this.random() - .5) * 1.9;
      const speed = 35 + this.random() * 110;
      Object.assign(item, { life: .15 + this.random() * .2, maxLife: .35, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, ring: false, clip: null, fallbackKind:null });
      item.sprite.setDepth(WEAPON_VFX_DEPTH).setTexture('spark').setPosition(x, y).setTint(color).setScale(.6 + this.random() * .7).setRotation(angle).setVisible(true).setAlpha(1);
    }
  }
  ring(x, y, color, endScale = 1.7) {
    const item = this.items.find(p => p.life <= 0);
    if (!item) return;
    Object.assign(item, { life: .22, maxLife: .22, vx: 0, vy: 0, ring: true, endScale, clip: null, fallbackKind:null });
    item.sprite.setDepth(WEAPON_VFX_DEPTH).setRotation(0).setTexture('ring').setPosition(x, y).setTint(color).setScale(.6).setVisible(true).setAlpha(1);
  }
  // Mini-sheet animations share the existing fixed pool and never own combat events.
  clip(kind,x,y,angle=0,scale=1,targetId=null,width=null) {
    if(GRISOUX_CAPS[kind]){
      let count=0;
      for(const p of this.items)if(p.life>0&&(p.clip===kind||p.fallbackKind===kind)){
        if(targetId!==null&&p.targetId===targetId)return false;
        count++;
      }
      if(count>=GRISOUX_CAPS[kind])return false;
    }
    if(kind==='impact-shotgun'||kind==='impact-smg'){
      let count=0;
      for(const p of this.items)if(p.life>0&&p.clip===kind){
        if(targetId!==null&&p.targetId===targetId)return false;
        count++;
      }
      if(count>=(kind==='impact-smg'?SMG_IMPACT_CAP:SHOTGUN_IMPACT_CAP))return false;
    }
    const spec=combatVfxSpec(kind),item=this.items.find(p=>p.life<=0);
    if(!spec||!item)return false;
    if(!this.textures||!useCombatVfx(item.sprite,this.textures,kind,0)) {
      if(GRISOUX_CAPS[kind]){
        // Last-resort existing energy spark; still counts against the same cap.
        Object.assign(item,{life:.06,maxLife:.06,vx:0,vy:0,ring:false,clip:null,fallbackKind:kind,targetId});
        item.sprite.setDepth(WEAPON_VFX_DEPTH).setTexture('spark').setOrigin(.5).setPosition(x,y).setRotation(angle).setTint(0x82e8c2).setScale(1).setAlpha(1).setVisible(true);
        return false;
      }
      this.burst(x,y,kind.includes('energy')||kind==='conduction'||kind==='overload-grisoux'?0x82e8c2:0xbfccc6,2,angle);
      return false;
    }
    Object.assign(item,{life:spec.duration,maxLife:spec.duration,vx:0,vy:0,ring:false,clip:kind,clipScale:scale,clipWidth:width,targetId,fallbackKind:null});
    // Compact energy feedback sits over enemy bodies (15), below hero (20) and hostile bolts (24).
    item.sprite.setDepth(GRISOUX_CAPS[kind]?16:WEAPON_VFX_DEPTH).setPosition(x,y).setRotation(angle).setDisplaySize(width??spec.width*scale,spec.height*scale).setTint(0xffffff).setAlpha(1).setVisible(true);
    return true;
  }
  energyArc(event) {
    const dx=event.endX-event.x,dy=event.endY-event.y,length=Math.hypot(dx,dy);
    if(event.type!=='energy-arc'||!Number.isFinite(length)||length<=0)return false;
    return this.clip('arc-energy',event.x,event.y,Math.atan2(dy,dx),1,null,length);
  }
  update(dt) {
    for (const item of this.items) {
      if (item.life <= 0) continue;
      item.life -= dt;
      item.sprite.setVisible(item.life > 0);
      item.sprite.x += item.vx * dt; item.sprite.y += item.vy * dt;
      item.vx *= Math.exp(-5 * dt); item.vy *= Math.exp(-5 * dt);
      item.sprite.setAlpha(Math.max(0, item.life / item.maxLife));
      if(item.clip&&item.life>0) {
        const spec=useCombatVfx(item.sprite,this.textures,item.clip,item.maxLife-item.life);
        if(spec)item.sprite.setDisplaySize(item.clipWidth??spec.width*item.clipScale,spec.height*item.clipScale);
        else {item.life=0;item.sprite.setVisible(false);}
      }
      if (item.ring) item.sprite.setScale(.6 + (1 - item.life / item.maxLife) * (item.endScale - .6));
    }
  }
  clear() { for (const item of this.items) { item.life = 0; item.sprite.setVisible(false); } }
}
