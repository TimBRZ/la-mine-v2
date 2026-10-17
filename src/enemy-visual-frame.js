// Presentation only: a missing clip/frame must not change the machine's skin.
export function modernFrame(textures,s,requested){
 const cell=s.cell||128,columns=s.columns||6;
 if(!textures?.exists(s.key))return {frame:null,reason:'missing_texture'};
 const t=textures.get(s.key),image=t?.getSourceImage?.();
 if(image?.width!==s.width||image?.height!==s.height)return {frame:null,reason:'invalid_source'};
 const valid=n=>{const f=t.has(n)&&t.get(n);return Number.isInteger(n)&&n>=0&&n<s.frames&&f?.cutWidth===cell&&f?.cutHeight===cell&&f.cutX===n%columns*cell&&f.cutY===Math.floor(n/columns)*cell;};
 if(valid(requested))return {frame:requested,reason:null};
 const idle=s.clips.idle||{first:0,count:1};
 for(let n=idle.first;n<idle.first+idle.count;n++){
  if(!valid(n)){
   // Rebuild neutral frame metadata from a verified source image, never redraw it.
   if(t.has(n))t.remove?.(n);
   t.add(n,0,n%columns*cell,Math.floor(n/columns)*cell,cell,cell);
  }
  if(valid(n))return {frame:n,reason:'neutral_modern_frame'};
 }
 return {frame:null,reason:'invalid_neutral_frames'};
}
export function visualClip(s,name){
 const c=s.clips[name];
 return c&&Number.isInteger(c.first)&&c.count>0&&Number.isFinite(c.fps)&&(c.fps>0||name.startsWith('prepare')&&c.fps===0)?c:null;
}
