import {RiveterMuzzleView} from './riveter-muzzle.js';
// Visual-only allowlist. Shared pools/colors do not imply shared projectile identity.
export const ENEMY_RIVET=Object.freeze({key:'enemy-rivet-standard-v038c1',url:'./src/assets/enemy-rivet-v038c1/rivet-v1.svg',frames:3,cellWidth:40,cellHeight:24,duration:.12,width:26,height:15.6,originX:25/40,originY:.5});
export function rivetCompatible(bolt,owner,zone){
 if(!owner||bolt.orb)return false;
 if(bolt.bossMajor&&!(owner.kind==='boss'&&['crachefer','switchman'].includes(owner.bossId)))return false;
 if(owner.kind==='drill'||owner.kind==='draisine')return true;
 if(owner.kind==='boss')return owner.bossId==='crachefer'||owner.bossId==='switchman';
 return owner.kind==='riveter'&&zone==='forge';
}
export function preloadEnemyRivet(scene){const s=ENEMY_RIVET;scene.load.svg(s.key,s.url,{width:s.frames*s.cellWidth,height:s.cellHeight});}
function valid(t){const s=ENEMY_RIVET;return t?.source?.[0]?.width===s.frames*s.cellWidth&&t.source[0].height===s.cellHeight;}
function validFrame(t,i){if(!t.has(String(i)))return false;const f=t.get(String(i));return f.cutX===i*40&&f.cutY===0&&f.cutWidth===40&&f.cutHeight===24;}
export function registerEnemyRivet(textures){const s=ENEMY_RIVET;if(!textures.exists(s.key))return false;const t=textures.get(s.key);if(!valid(t))return false;let ready=true;for(let i=0;i<s.frames;i++){if(!t.has(String(i)))t.add(String(i),0,i*40,0,40,24);if(!validFrame(t,i))ready=false;}return ready;}
export function useEnemyRivet(sprite,textures,bolt,reducedMotion=false){
 const s=ENEMY_RIVET,age=bolt.distance/bolt.spec.speed,frame=reducedMotion?0:Math.floor(Math.max(0,age)/s.duration*s.frames)%s.frames;
 if(!textures.exists(s.key))return false;const t=textures.get(s.key);if(!valid(t)||!validFrame(t,frame))return false;
 sprite.setTexture(s.key,String(frame)).setOrigin(s.originX,s.originY).setDisplaySize(s.width,s.height).setPosition(bolt.x,bolt.y).setRotation(bolt.angle).setVisible(true);return true;
}
export class EnemyRivetView{
 constructor(scene){this.scene=scene;this.muzzle=new RiveterMuzzleView();registerEnemyRivet(scene.textures);this.sprites=Array.from({length:24},()=>scene.add.image(0,0,'__WHITE').setDepth(24).setVisible(false));this.owners=new Map();this.seen=new Set();this.run=null;}
 begin(run){this.muzzle.begin(run);if(this.run!==run){this.run=run;this.owners.clear();}this.seen.clear();for(const e of run.enemies){this.owners.set(e.id,e);this.seen.add(e.id);}for(const b of run.hostileProjectiles.pool)if(b.active)this.seen.add(b.owner);for(const id of this.owners.keys())if(!this.seen.has(id))this.owners.delete(id);for(const s of this.sprites)s.setVisible(false);}
 draw(bolt,zone){
  const sprite=this.sprites[bolt.id],owner=this.owners.get(bolt.owner);
  if(!sprite||!rivetCompatible(bolt,owner,zone))return false;
  const ready=useEnemyRivet(sprite,this.scene.textures,bolt,this.scene.reducedMotion);
  if(owner.kind==='riveter'&&zone==='forge')this.muzzle.position(sprite,bolt,owner,this.scene.enemyViews?.get(bolt.owner)?.body);
  return ready;
 }
}
