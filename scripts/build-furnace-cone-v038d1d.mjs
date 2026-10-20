import fs from 'node:fs';import {createRequire} from 'node:module';
// The approved pixels are the material source, not a new procedural aesthetic.
// Remap the illustrated elliptical wedge into R=225, ±.66. Only its crisp,
// inward-clipped danger rim is generated; reference text/smoke/background are excluded.
const require=createRequire('C:/Users/Tim Pro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const source=process.argv[2]||'production-v038d1d-cone-fournaise/assets/reference-variante-a.png';
const data=fs.readFileSync(source).toString('base64');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage();
 const result=await page.evaluate(async data=>{
  const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();
  if(img.width!==1672||img.height!==941)throw Error('Expected approved 1672×941 reference');
  const source=document.createElement('canvas');source.width=img.width;source.height=img.height;
  const sc=source.getContext('2d');sc.drawImage(img,0,0);const pixels=sc.getImageData(0,0,img.width,img.height).data;
  const W=230,H=280,R=225,A=.66,scale=3;
  function frame(f){
   const c=document.createElement('canvas');c.width=W*scale;c.height=H*scale;const ctx=c.getContext('2d'),out=ctx.createImageData(c.width,c.height);
   for(let py=0;py<c.height;py++)for(let px=0;px<c.width;px++){
    const x=(px+.5)/scale-2,y=(py+.5)/scale-140,r=Math.hypot(x,y),a=Math.atan2(y,x);
    if(r>R||Math.abs(a)>A)continue;
    const sx=81+r/R*795*Math.cos(a*.5/A),sy=412+r/R*455*Math.sin(a*.5/A);
    const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy,j=(py*c.width+px)*4;
    for(let k=0;k<3;k++){
     const at=(xx,yy)=>pixels[(yy*img.width+xx)*4+k];
     let v=(at(ix,iy)*(1-fx)+at(ix+1,iy)*fx)*(1-fy)+(at(ix,iy+1)*(1-fx)+at(ix+1,iy+1)*fx)*fy;
     if(f<4){
      const wave=Math.sin(x*.067+y*.043+f*Math.PI/2)*.025;
      v*=1+wave*(r>12&&r<220?1:0);
     }else if(f===4)v*=k===0?.43:k===1?.19:.12;
     else v=v*.085+(k===0?25:k===1?18:15);
     out.data[j+k]=Math.round(Math.min(255,v));
    }out.data[j+3]=255;
   }
   ctx.putImageData(out,0,0);ctx.scale(scale,scale);ctx.translate(2,140);
   const sector=new Path2D();sector.moveTo(0,0);sector.arc(0,0,R,-A,A);sector.closePath();
   ctx.save();ctx.clip(sector);
   if(f<4){
    for(const [w,col]of [[5,'#ff7d08'],[3.3,'#ffca22'],[1.7,'#fff681']]){
     ctx.lineWidth=w;ctx.strokeStyle=col;ctx.stroke(sector);
    }
    const core=ctx.createRadialGradient(0,0,0,0,0,15);core.addColorStop(0,'#ffffdc');core.addColorStop(.3,'#fffca8');core.addColorStop(1,'#fff06b00');
    ctx.fillStyle=core;ctx.fill(sector);
   }else{
    ctx.strokeStyle=f===4?'#b94b20':'#633526';ctx.lineWidth=2.8;ctx.stroke(sector);
   }
   ctx.restore();return c;
  }
  const atlas=document.createElement('canvas');atlas.width=690;atlas.height=560;const ac=atlas.getContext('2d');ac.imageSmoothingQuality='high';
  let master;
  for(let f=0;f<6;f++){
   const c=frame(f),native=document.createElement('canvas');native.width=W;native.height=H;
   const nc=native.getContext('2d');nc.imageSmoothingQuality='high';nc.drawImage(c,0,0,W,H);
   // High-quality reduction can ring beyond the geometry. Reapply the exact
   // sector at final native resolution so transparent guard pixels stay clear.
   nc.globalCompositeOperation='destination-in';nc.beginPath();nc.moveTo(2,140);nc.arc(2,140,R,-A,A);nc.closePath();nc.fill();
   ac.drawImage(native,f%3*W,Math.floor(f/3)*H);if(f===0)master=c.toDataURL('image/png').split(',')[1];
  }
  return {atlas:atlas.toDataURL('image/png').split(',')[1],master};
 },data);
 const dest='src/assets/furnace-cone-v038d1d';fs.mkdirSync(dest,{recursive:true});
 const bytes=Buffer.from(result.atlas,'base64');fs.writeFileSync(dest+'/cone-a.png',bytes);
 const prod='production-v038d1d-cone-fournaise/';fs.mkdirSync(prod+'assets',{recursive:true});
 fs.writeFileSync(prod+'assets/master-a.png',Buffer.from(result.master,'base64'));
 const metadata={source,method:'Approved reference pixels remapped from elliptical sector to exact gameplay sector',reference:{apex:[81,412],rx:795,ry:455,halfAngle:.5},radius:225,spread:.66,frames:6,activeFrames:4,width:690,height:560,bytes:bytes.length,rgba:690*560*4};
 fs.writeFileSync(prod+'notes/material.json',JSON.stringify(metadata,null,2));console.log(metadata);
}finally{await browser.close();}
