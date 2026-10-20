import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire('C:/Users/Tim Pro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json'),{chromium}=require('playwright');
const root='production-v038d1g-marche-a-blanc/',source=root+'assets/master-generated.png';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const p=await browser.newPage(),out=await p.evaluate(async data=>{
  const image=new Image();image.src='data:image/png;base64,'+data;await image.decode();
  const input=document.createElement('canvas');input.width=image.width;input.height=image.height;const ctx=input.getContext('2d');ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,input.width,input.height).data,midX=Math.floor(input.width/2),midY=Math.floor(input.height/2);
  const solid=(x,y)=>{const i=(y*input.width+x)*4;return pixels[i+3]>240&&pixels[i]>150;};
  let left=0,right=input.width-1,top=0,bottom=input.height-1;
  while(!solid(left,midY))left++;while(!solid(right,midY))right--;while(!solid(midX,top))top++;while(!solid(midX,bottom))bottom--;
  // Texture packing/normalization only: perfect 94-unit footprint, no external
  // particles. Runtime owns the exact circular contour and order markers.
  const tile=document.createElement('canvas');tile.width=tile.height=96;const tc=tile.getContext('2d');
  tc.save();tc.beginPath();tc.arc(48,48,46.25,0,Math.PI*2);tc.clip();tc.drawImage(image,left,top,right-left+1,bottom-top+1,1,1,94,94);tc.restore();
  const raw=tc.getImageData(0,0,96,96),atlas=document.createElement('canvas');atlas.width=288;atlas.height=192;const ac=atlas.getContext('2d'),masters=[];
  for(let f=0;f<6;f++){
   const d=new ImageData(new Uint8ClampedArray(raw.data),96,96);
   for(let y=0;y<96;y++)for(let x=0;x<96;x++){
    const i=(y*96+x)*4;if(!d.data[i+3])continue;
    const pulse=f<4?1+.025*Math.sin(x*.09+y*.08+f*Math.PI/2):1;
    for(let k=0;k<3;k++)d.data[i+k]=Math.round(d.data[i+k]*pulse*(f===4?[.6,.2,.13][k]:f===5?[.26,.10,.08][k]:1));
   }
   tc.putImageData(d,0,0);ac.drawImage(tile,(f%3)*96,Math.floor(f/3)*96);
   masters.push({name:f<4?'active-'+f:f===4?'heat':'cool',png:tile.toDataURL().split(',')[1]});
  }
  return {atlas:atlas.toDataURL().split(',')[1],masters,crop:{left,top,right,bottom},input:{width:input.width,height:input.height}};
 },fs.readFileSync(source).toString('base64'));
 const dir='src/assets/furnace-white-march-disc-v038d1g';fs.mkdirSync(dir,{recursive:true});const atlas=Buffer.from(out.atlas,'base64');fs.writeFileSync(dir+'/disc-a.png',atlas);
 for(const m of out.masters)fs.writeFileSync(root+'assets/master-'+m.name+'.png',Buffer.from(m.png,'base64'));
 const meta={source,input:out.input,crop:out.crop,width:288,height:192,cell:96,diameter:94,frames:6,activeFrames:4,loop:.8,bytes:atlas.length,rgbaBytes:288*192*4};
 fs.writeFileSync(root+'notes/material.json',JSON.stringify(meta,null,2));console.log(meta);
}finally{await browser.close();}
