import {preloadBursterVisual,BURSTER_KEY,BURSTER_IDLE_KEY} from '../src/burster-visual.js';
// Simulate only the real loader-completion boundary; never bypass provenance.
export function loadTestBurster(t,{idle=false}={}){
 const saved=t.map.get(BURSTER_KEY),callbacks=new Map();
 t.remove=k=>t.map.delete(k);
 preloadBursterVisual({textures:t,load:{once:(event,fn)=>callbacks.set(event,fn),svg(key,_url,size){
  if(key===BURSTER_IDLE_KEY&&!idle)return;
  const texture=key===BURSTER_KEY&&saved?saved:{frames:new Map(),has(n){return this.frames.has(n)},get(n){return this.frames.get(n)},add(n,_s,x,y,w,h){this.frames.set(n,{cutX:x,cutY:y,cutWidth:w,cutHeight:h})},remove(n){this.frames.delete(n)}};
  const image={width:size.width,height:size.height};texture.getSourceImage=()=>image;t.map.set(key,texture);
  callbacks.get('filecomplete-svg-'+key)(key,'svg',image);
 }}});return t;
}
