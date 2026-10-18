import {projectileEndings,PROJECTILE_END_CAPACITY} from './projectile-endings.js';
import {rivetCompatible} from './enemy-rivet-vfx.js';
export const RIVET_IMPACT=Object.freeze({key:'rivet-impact-v038c6b-b1',url:'./src/assets/rivet-impact-v038c6b/impact-b1.svg',cell:64,frames:6,width:384,height:64,display:40,duration:.18,capacity:32,depth:7.6});
const names=['0','1','2','3','4','5'];
export function preloadRivetImpact(scene){const s=RIVET_IMPACT;scene.load.svg(s.key,s.url,{width:s.width,height:s.height});}
function sourceValid(t){return t?.source?.[0]?.width===384&&t.source[0].height===64;}
function frameValid(t,i){const f=t.has(names[i])&&t.get(names[i]);return !!f&&f.cutX===i*64&&f.cutY===0&&f.cutWidth===64&&f.cutHeight===64&&(!f.sourceIndex||f.sourceIndex===0)&&(!f.texture||f.texture===t)&&(!f.source||f.source===t.source[0]);}
export function registerRivetImpact(textures){if(!textures?.exists(RIVET_IMPACT.key))return false;const t=textures.get(RIVET_IMPACT.key);if(!sourceValid(t))return false;for(let i=0;i<6;i++){if(!t.has(names[i]))t.add(names[i],0,i*64,0,64,64);if(!frameValid(t,i))return false;}return true;}
function ready(textures){if(!textures?.exists(RIVET_IMPACT.key))return false;const t=textures.get(RIVET_IMPACT.key);if(!sourceValid(t))return false;for(let i=0;i<6;i++)if(!frameValid(t,i))return false;return true;}
export class RivetImpactView{
 constructor(scene){
  this.scene=scene;this.run=null;this.pool=null;this.zone=null;this.serial=0;this.generation=0;this.next=0;this.recycled=0;this.spawned=0;this.peak=0;this.sprites=[];this.slots=[];
  if(registerRivetImpact(scene.textures))this.allocate();
  scene.events?.once('shutdown',()=>this.destroy());
 }
 allocate(){if(this.sprites.length)return;for(let i=0;i<RIVET_IMPACT.capacity;i++){this.sprites.push(this.scene.add.image(0,0,'__WHITE').setDepth(RIVET_IMPACT.depth).setVisible(false));this.slots.push({active:false,start:0,x:0,y:0,angle:0});}}
 clear(){for(let i=0;i<this.slots.length;i++){const p=this.slots[i];p.active=false;p.start=p.x=p.y=p.angle=0;this.sprites[i].setVisible(false).setTexture('__WHITE');}this.next=0;}
 emit(event,start){
  let index=-1;for(let k=0;k<this.slots.length;k++){const i=(this.next+k)%this.slots.length;if(!this.slots[i].active){index=i;break;}}
  if(index<0){index=this.next;this.recycled++;} // Bounded visual recycling; never suppress a collision.
  const p=this.slots[index];p.active=true;p.start=start;p.x=event.x;p.y=event.y;p.angle=event.angle;this.next=(index+1)%this.slots.length;this.spawned++;
 }
 update(run,owners){
  const pool=run.hostileProjectiles;if(!pool)return;const journal=projectileEndings(pool),zone=run.world?.id,now=run.elapsed||0;
  if(this.run!==run||this.pool!==pool||this.zone!==zone){const reused=this.pool===pool;this.clear();this.run=run;this.pool=pool;this.zone=zone;this.serial=reused?journal.serial:journal.floor;this.generation=journal.generation;}
  if(this.generation!==journal.generation){this.clear();this.generation=journal.generation;this.serial=journal.floor;}
  // No queued replay when the atlas is absent/corrupt. Existing hurt feedback survives.
  const valid=ready(this.scene.textures)||registerRivetImpact(this.scene.textures);if(valid)this.allocate();else this.clear();
  for(let i=0;i<this.slots.length;i++)if(this.slots[i].active&&now-this.slots[i].start>=RIVET_IMPACT.duration){const p=this.slots[i];p.active=false;p.start=p.x=p.y=p.angle=0;this.sprites[i].setVisible(false).setTexture('__WHITE');}
  for(let n=Math.max(this.serial+1,journal.serial-PROJECTILE_END_CAPACITY+1);n<=journal.serial;n++){
   const e=journal.records[(n-1)%PROJECTILE_END_CAPACITY];if(e.serial!==n||e.reason==='range')continue;
   const age=Math.max(0,journal.clock-e.time);if(!valid||age>=RIVET_IMPACT.duration)continue;
   const owner=run.enemies.find(a=>a.id===e.owner)||owners?.get(e.owner);
   if(rivetCompatible(e,owner,zone))this.emit(e,now-age);
  }
  this.serial=journal.serial;let active=0;
  for(let i=0;i<this.slots.length;i++){
   const p=this.slots[i],sprite=this.sprites[i];if(!p.active)continue;const age=Math.max(0,now-p.start);
   if(age>=RIVET_IMPACT.duration){p.active=false;p.start=p.x=p.y=p.angle=0;sprite.setVisible(false).setTexture('__WHITE');continue;}
   const frame=this.scene.reducedMotion?(age<.06?1:4):Math.min(5,Math.floor(age/RIVET_IMPACT.duration*6));
   sprite.setTexture(RIVET_IMPACT.key,names[frame]).setOrigin(.5,.5).setDisplaySize(40,40).setPosition(p.x,p.y).setRotation(p.angle).setVisible(true);active++;
  }
  this.peak=Math.max(this.peak,active);
 }
 destroy(){this.clear();for(const p of this.sprites)p.destroy?.();this.sprites.length=0;this.slots.length=0;this.run=this.pool=this.scene=null;}
}
