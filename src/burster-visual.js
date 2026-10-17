import {BURSTER_SVG,BURSTER_IDLE_SVG,BURSTER_KEY,BURSTER_IDLE_KEY} from './burster-bonbonne-art-v1.js';
export {BURSTER_KEY,BURSTER_IDLE_KEY};
const trusted=new WeakMap();
export function trustedBursterTexture(textures,key){
 const t=textures?.exists(key)&&textures.get(key),proof=t&&trusted.get(t);
 return !!proof&&proof.key===key&&proof.source===t.getSourceImage?.();
}
export function trustedBursterFrame(textures,key,frame){
 if(!trustedBursterTexture(textures,key))return false;
 const t=textures.get(key),f=t.get(frame);
 return !!f&&(f.sourceIndex===undefined||f.sourceIndex===0)&&(!f.texture||f.texture===t)&&(!f.source||f.source.image===t.getSourceImage());
}
export function preloadBursterVisual(scene){
 for(const [key,svg,width,height] of [[BURSTER_KEY,BURSTER_SVG,384,256],[BURSTER_IDLE_KEY,BURSTER_IDLE_SVG,64,64]]){
  if(trustedBursterTexture(scene.textures,key))continue;
  // A pre-existing key is not proof of identity, even with matching dimensions.
  if(scene.textures.exists(key))scene.textures.remove(key);
  scene.load.once('filecomplete-svg-'+key,(_key,_type,source)=>{
   const t=scene.textures.exists(key)&&scene.textures.get(key);
   if(t&&t.getSourceImage()===source&&source.width===width&&source.height===height)trusted.set(t,{key,source});
  });
  // Data is embedded from the immutable production sheet: no stale SVG URL,
  // partial network response, concept path, or same-sized foreign sheet.
  scene.load.svg(key,'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg))),{width,height});
 }
}
export function applyBursterIdle(body,textures){
 if(!trustedBursterTexture(textures,BURSTER_IDLE_KEY))return false;
 const t=textures.get(BURSTER_IDLE_KEY),im=t.getSourceImage();
 if(im.width!==64||im.height!==64)return false;
 if(t.has('__BASE')&&!trustedBursterFrame(textures,BURSTER_IDLE_KEY,'__BASE'))return false;
 body.setTexture(BURSTER_IDLE_KEY).setOrigin(.5,.5).setDisplaySize(48,48).setPosition(0,0).setFlipX(false).setRotation(0).setVisible(true);
 return true;
}
