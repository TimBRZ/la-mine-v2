import fs from 'node:fs';import {createRequire} from 'node:module';
// Production only: extract the approved illustrated lava, removing perspective
// and its border. Runtime uses one shared material at native scale, cropped for
// the shorter third rectangle. No new texture family is invented.
const require=createRequire('C:/Users/Tim Pro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright'),root='production-v038d1e-secteurs-chauffe/';
const source=process.argv[2]||root+'assets/reference-a.png';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const p=await browser.newPage(),out=await p.evaluate(async data=>{
  const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();
  if(img.width!==1536||img.height!==1024)throw Error('Expected approved 1536×1024 board');
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
  const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const src=ctx.getImageData(0,0,c.width,c.height).data;
  const W=142,H=190,atlas=document.createElement('canvas');atlas.width=W*3;atlas.height=H*2;
  const ac=atlas.getContext('2d'),masters=[];
  for(let f=0;f<6;f++){
   const tile=document.createElement('canvas');tile.width=W;tile.height=H;const tc=tile.getContext('2d'),d=tc.createImageData(W,H);
   // Inside left plate of the approved ACTIVE / PROGRESSION panels.
   const q=f===4?[[370,324],[444,324],[434,471],[352,471]]:[[685,324],[754,324],[746,471],[666,471]];
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const u=(x+.5)/W,v=(y+.5)/H,topX=q[0][0]*(1-u)+q[1][0]*u,topY=q[0][1]*(1-u)+q[1][1]*u;
    const bx=q[3][0]*(1-u)+q[2][0]*u,by=q[3][1]*(1-u)+q[2][1]*u,sx=topX*(1-v)+bx*v,sy=topY*(1-v)+by*v;
    const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy,j=(y*W+x)*4;
    for(let k=0;k<3;k++){
     const at=(xx,yy)=>src[(yy*c.width+xx)*4+k];
     let z=(at(ix,iy)*(1-fx)+at(ix+1,iy)*fx)*(1-fy)+(at(ix,iy+1)*(1-fx)+at(ix+1,iy+1)*fx)*fy;
     if(f<4)z*=1+.022*Math.sin(x*.08+y*.07+f*Math.PI/2);
     if(f===5)z=z*(k===0?.28:k===1?.10:.07)+(k===0?17:9);
     d.data[j+k]=Math.min(255,Math.round(z));
    }d.data[j+3]=255;
   }
   tc.putImageData(d,0,0);ac.drawImage(tile,f%3*W,Math.floor(f/3)*H);
   if(f===0||f===4||f===5)masters.push({name:f===0?'active':f===4?'heat':'cool',png:tile.toDataURL().split(',')[1]});
  }
  return {atlas:atlas.toDataURL().split(',')[1],masters};
 },fs.readFileSync(source).toString('base64'));
 const dir='src/assets/furnace-heating-sectors-v038d1e';fs.mkdirSync(dir,{recursive:true});
 const png=Buffer.from(out.atlas,'base64');fs.writeFileSync(dir+'/sectors-a.png',png);
 for(const m of out.masters)fs.writeFileSync(root+'assets/master-'+m.name+'.png',Buffer.from(m.png,'base64'));
 const meta={source,width:426,height:380,cellWidth:142,cellHeight:190,frames:6,activeFrames:4,loop:.8,bytes:png.length,rgba:426*380*4,method:'Approved active/progression material sampled from the reference; native crop for the 150-unit plate'};
 fs.writeFileSync(root+'notes/material.json',JSON.stringify(meta,null,2));console.log(meta);
}finally{await browser.close();}
