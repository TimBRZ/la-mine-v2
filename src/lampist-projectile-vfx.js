// Presentation only: one atlas, two uniform scales. No simulation writes.
export const LAMPIST_SHOT=Object.freeze({key:'lampist-light-shot-v038c2',url:'./src/assets/lampist-light-shot-v038c2/shot-v1.svg',frames:4,cellWidth:96,cellHeight:32,duration:.16,width:44,majorWidth:62,originX:64/96,originY:.5,capacity:24});
export function lampistShotKind(b,owner,zone){
 if(zone!=='depths'||!b.active||b.orb||!owner||owner.bossSequence)return null;
 const spec=b.spec;
 if(!spec||spec.radius!==5||spec.range!==300)return null;
 if(owner.kind==='lampist'&&owner.pattern==='light'&&spec.speed===118)return 'lampist';
 if(owner.bossId==='lampmajor'&&((owner.pattern==='light'&&spec.speed===118)||(owner.pattern==='fan'&&spec.speed===110)))return 'lampistMajor';
 return null;
}
export function preloadLampistShot(scene){const s=LAMPIST_SHOT;scene.load.svg(s.key,s.url,{width:s.cellWidth*s.frames,height:s.cellHeight});}
const valid=t=>t?.source?.[0]?.width===384&&t.source[0].height===32;
function frameValid(t,i){if(!t.has(String(i)))return false;const f=t.get(String(i));return f.cutX===i*96&&f.cutY===0&&f.cutWidth===96&&f.cutHeight===32;}
export function registerLampistShot(textures){
 const s=LAMPIST_SHOT;if(!textures.exists(s.key))return false;const t=textures.get(s.key);if(!valid(t))return false;
 for(let i=0;i<4;i++){if(!t.has(String(i)))t.add(String(i),0,i*96,0,96,32);if(!frameValid(t,i))return false;}return true;
}
// Socket measured on the approved master inside its square sprite viewport.
// Freeze this offset at emission; owner movement/flip cannot pull an in-flight shot.
export function lampistMuzzleOffset(owner,body,b,kind){
 if(!body?.texture?.key?.startsWith('depths-v036c-'))return null;
 const major=kind==='lampistMajor',x=major?249/833.08:94/359.7,y=major?183/833.08:80/359.7;
 const muzzle=owner.radius+b.spec.radius+2;
 return {x:(body.flipX?-1:1)*x*body.displayWidth+(body.x||0)-Math.cos(b.angle)*muzzle,y:y*body.displayHeight+(body.y||0)-Math.sin(b.angle)*muzzle};
}
export function useLampistShot(sprite,textures,b,kind,reduced=false,offset=null){
 if(!['lampist','lampistMajor'].includes(kind)||!b.active)return false;
 const s=LAMPIST_SHOT,age=b.distance/b.spec.speed,i=reduced?0:Math.floor(Math.max(0,age)/s.duration*4)%4;
 if(!textures.exists(s.key))return false;const t=textures.get(s.key);if(!valid(t)||!frameValid(t,i))return false;
 const width=kind==='lampistMajor'?s.majorWidth:s.width,scale=width/96;
 const blend=Math.max(0,1-b.distance/40);
 sprite.setTexture(s.key,String(i)).setOrigin(s.originX,s.originY).setDisplaySize(width,width/3).setPosition(b.x+(offset?.x||0)*blend,b.y+(offset?.y||0)*blend).setRotation(b.angle);
 // At birth only the body is visible; reveal the short trail over travelled distance.
 // This never moves the gameplay muzzle and never draws a trail before a real shot.
 const crop=Math.max(0,42-b.distance/scale);sprite.setCrop?.(crop,0,96-crop,32);
 sprite.setVisible(true);return true;
}
export class LampistShotView{
 constructor(scene){
  this.scene=scene;registerLampistShot(scene.textures);this.sprites=Array.from({length:24},()=>scene.add.image(0,0,'__WHITE').setDepth(24).setVisible(false));
  this.owners=new Map();this.seen=new Set();this.kinds=Array(24).fill(null);this.last=Array(24).fill(-1);this.ids=Array(24).fill(null);this.specs=Array(24).fill(null);this.offsets=Array(24).fill(null);this.run=null;
  scene.events?.once('shutdown',()=>this.destroy());
 }
 begin(run){
  if(this.run!==run){this.run=run;this.owners.clear();this.kinds.fill(null);this.last.fill(-1);this.ids.fill(null);this.specs.fill(null);this.offsets.fill(null);}
  this.seen.clear();for(const e of run.enemies){this.owners.set(e.id,e);this.seen.add(e.id);}
  for(const b of run.hostileProjectiles.pool)if(b.active)this.seen.add(b.owner);
  for(const id of this.owners.keys())if(!this.seen.has(id))this.owners.delete(id);
  for(let i=0;i<this.sprites.length;i++){this.sprites[i].setVisible(false);const b=run.hostileProjectiles.pool[i];if(!b?.active){this.kinds[i]=null;this.last[i]=-1;this.ids[i]=null;}}
 }
 draw(b,zone){
  const i=b.id;if(!b.active||!this.sprites[i])return false;
  if(this.ids[i]!==b.owner||this.specs[i]!==b.spec||this.last[i]<0||b.distance<this.last[i]){const owner=this.owners.get(b.owner);this.kinds[i]=lampistShotKind(b,owner,zone);this.ids[i]=b.owner;this.specs[i]=b.spec;this.offsets[i]=this.kinds[i]?lampistMuzzleOffset(owner,this.scene.enemyViews?.get(b.owner)?.body,b,this.kinds[i]):null;}
  this.last[i]=b.distance;
  return useLampistShot(this.sprites[i],this.scene.textures,b,this.kinds[i],this.scene.reducedMotion,this.offsets[i]);
 }
 destroy(){for(const s of this.sprites)s.destroy?.();this.sprites.length=0;this.owners.clear();this.seen.clear();this.kinds.fill(null);this.last.fill(-1);this.ids.fill(null);this.specs.fill(null);this.offsets.fill(null);this.run=null;}
}
