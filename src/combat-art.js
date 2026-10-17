// Visual-only palette and geometry. No random calls: rendering never consumes combat RNG.
export const COMBAT_ART=Object.freeze({ink:0x10191d,warning:0xffc46b,danger:0xff795f,edge:0xffedd0,steel:0x819895,copper:0xb47a51});

export function dangerLane(g,x,y,x2,y2,radius,active=false) {
  const dx=x2-x,dy=y2-y,length=Math.hypot(dx,dy);
  if(length<1)return;
  const ux=dx/length,uy=dy/length,nx=-uy*radius,ny=ux*radius;
  const color=active?COMBAT_ART.danger:COMBAT_ART.warning;
  g.lineStyle(radius*2,color,active?.23:.14).lineBetween(x,y,x2,y2);
  for(const sign of [-1,1]) {
    g.lineStyle(5,COMBAT_ART.ink,.8).lineBetween(x+nx*sign,y+ny*sign,x2+nx*sign,y2+ny*sign);
    g.lineStyle(2,color,.95).lineBetween(x+nx*sign,y+ny*sign,x2+nx*sign,y2+ny*sign);
  }
  // Repeated directional chevrons stay inside the actual threat corridor.
  const wing=Math.min(radius*.55,7);
  for(let d=26;d<length-8;d+=44) {
    const px=x+ux*d,py=y+uy*d;
    g.lineStyle(2,color,.8).lineBetween(px-ux*7-uy*wing,py-uy*7+ux*wing,px,py).lineBetween(px,py,px-ux*7+uy*wing,py-uy*7-ux*wing);
  }
}

export function dangerCircle(g,x,y,radius,active=false) {
  const color=active?COMBAT_ART.danger:COMBAT_ART.warning;
  g.fillStyle(color,active?.22:.1).fillCircle(x,y,radius);
  g.lineStyle(6,COMBAT_ART.ink,.8).strokeCircle(x,y,radius);
  g.lineStyle(2.5,color,1).strokeCircle(x,y,radius);
  g.lineStyle(1,color,.4).strokeCircle(x,y,Math.max(1,radius-5));
  for(let a=0;a<Math.PI*2;a+=Math.PI/4) {
    const c=Math.cos(a),s=Math.sin(a);
    g.lineStyle(3,color,.95).lineBetween(x+c*(radius-11),y+s*(radius-11),x+c*(radius-3),y+s*(radius-3));
  }
  g.lineStyle(2,COMBAT_ART.edge,.85).lineBetween(x-5,y,x+5,y).lineBetween(x,y-5,x,y+5);
  if(active)for(const [dx,dy,r] of [[-10,3,9],[7,-8,11],[13,8,7]])g.fillStyle(color,.09).fillCircle(x+dx,y+dy,r);
}

function track(g,x,y,length,horizontal,color) {
  for(let d=0;d<length;d+=27) {
    const px=horizontal?x+d:x-19,py=horizontal?y-19:y+d;
    g.fillStyle(0x0d171b,.5).fillRect(px+2,py+3,horizontal?9:38,horizontal?38:9);
    g.fillStyle(color,.46).fillRect(px,py,horizontal?9:38,horizontal?38:9);
    g.lineStyle(1,0xcb9c6a,.2).lineBetween(px,py,px+(horizontal?8:36),py+2);
  }
  for(const offset of [-12,12]) {
    const a=horizontal?[x,y+offset,x+length,y+offset]:[x+offset,y,x+offset,y+length];
    g.lineStyle(5,0x121e22,.8).lineBetween(...a);
    g.lineStyle(2,0x78918f,.4).lineBetween(...a);
  }
}

export function paintArena(g,railway=false) {
  g.fillStyle(0x101a1e).fillRect(0,0,450,800);
  g.fillStyle(railway?0x18292c:0x292a25).fillRoundedRect(12,98,426,585,9);
  g.fillStyle(0x080f13).fillRoundedRect(20,108,410,570,5);
  g.fillStyle(railway?0x243438:0x303630).fillRect(28,116,394,550);
  // Deterministic broad stone slabs / steel plates, baked into one small texture.
  for(let row=0;row<11;row++)for(let col=0;col<8;col++) {
    const x=29+col*49,y=117+row*50,v=(row*19+col*7)%5;
    if(railway)g.fillStyle([0x28393b,0x263638,0x243336,0x29383a,0x253437][v]).fillRect(x,y,47,48);
    else {
      g.fillStyle([0x414236,0x343e32,0x27332c,0x3e4235,0x303b30][v],.42).fillRoundedRect(x+v,y+v,45-v,46-v,7+v);
      g.fillStyle(0x9c9571,.06).fillTriangle(x+5,y+6,x+33,y+8,x+8,y+22);
    }
    g.lineStyle(1,0x09171b,.23).lineBetween(x+5,y+47,x+44,y+47);
    if(v===1||v===3)g.lineStyle(1,railway?0x9b6b48:0x788171,.16).lineBetween(x+10,y+12,x+21,y+19).lineBetween(x+21,y+19,x+18,y+28);
    if(railway&&v===2)g.fillStyle(0xc39368,.19).fillCircle(x+5,y+5,1).fillCircle(x+42,y+43,1);
  }
  if(railway)for(const y of [215,395,585])track(g,32,y,385,true,0x966442);
  else track(g,225,119,540,false,0x8b7852);
  for(const y of [250,400,550])for(const x of [16,434]) {
    g.fillStyle(railway?0x453a2f:0x3d4840).fillTriangle(x-10,y+20,x,y-22,x+10,y+14);
    g.lineStyle(1,0x9fa17d,.25).lineBetween(x,y-20,x+6,y+9);
  }
  // Peripheral equipment lives outside the open movement area.
  for(const y of [154,304,454,604])for(const x of [6,427]) {
    g.fillStyle(railway?0x64432e:0x514733).fillRect(x,y-25,17,64);
    g.fillStyle(railway?0x977051:0x7c6847).fillRect(x+3,y-25,4,64);
    for(const yy of [y-20,y+31])g.fillStyle(0x1b2527).fillRect(x,yy,17,7).fillStyle(0x95a6a0).fillCircle(x+8,yy+3,1.5);
  }
  for(const [x,y] of [[25,184],[425,334],[25,484],[425,624]]) {
    const dir=x<200?1:-1,color=railway?0xd3b77a:0xf5c169;
    for(let i=3;i>=1;i--)g.fillStyle(color,.018).fillTriangle(x,y-10,x+dir*(45+i*14),y-25-i*8,x+dir*(45+i*14),y+25+i*8);
    g.fillStyle(0x121b1d).fillRoundedRect(x-7,y-12,14,24,3);
    g.fillStyle(0x8e794f).fillRect(x-5,y-9,10,18);
    g.fillStyle(color).fillRect(x-3,y-6,6,12);
    g.lineStyle(2,0x3f4638).lineBetween(x-6,y,x+6,y);
  }
  g.lineStyle(2,railway?0x826447:0x737154,.8).strokeRect(27,115,396,552);
  for(const x of [29,384])for(let i=0;i<5;i++) {
    g.fillStyle(i%2?0xc39654:0x253035,.65).fillRect(x+i*7,112,7,4);
    g.fillStyle(i%2?0xc39654:0x253035,.65).fillRect(x+i*7,667,7,4);
  }
  // Header/footer fascia, independent from the walkable floor.
  g.fillStyle(0x0d171b,.7).fillRect(14,686,422,78);
  g.lineStyle(1,0x65776d,.25).lineBetween(24,685,426,685);
}

export function createArenaArt(scene) {
  const g=scene.make.graphics({x:0,y:0,add:false});
  for(const [id,railway] of [['arena-galleries',false],['arena-tracks',true]])if(!scene.textures.exists(id)){g.clear();paintArena(g,railway);g.generateTexture(id,450,800);}
  g.destroy();
  return scene.add.image(0,0,'arena-galleries').setOrigin(0).setDepth(-10);
}
