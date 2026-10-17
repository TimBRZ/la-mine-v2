import {dangerCircle,dangerLane} from './combat-art.js';
export function shaftTextures(texture){
  texture('deepdriller',60,48,g=>{g.fillStyle(0x172327).fillRoundedRect(2,2,36,44,5);g.fillStyle(0x92744b).fillRoundedRect(6,8,30,32,4);g.fillStyle(0xd5b565).fillRect(11,12,18,6);g.fillStyle(0xd0dedd).fillTriangle(34,5,59,24,34,43);g.lineStyle(3,0x586e73).lineBetween(40,13,40,35).lineBetween(47,18,47,30);g.fillStyle(0xffed99).fillCircle(27,13,4);});
  texture('surveyor',44,52,g=>{g.lineStyle(4,0x9aacac).lineBetween(22,20,4,49).lineBetween(22,20,40,49);g.fillStyle(0x293e47).fillRoundedRect(6,12,32,24,6);g.fillStyle(0xb1754e).fillRect(11,18,22,9);g.fillStyle(0xa9f0ed).fillCircle(22,22,6);g.lineStyle(3,0xd5cc97).lineBetween(22,12,22,2);g.fillStyle(0xee947c).fillCircle(22,3,3);});
  texture('gasminer',42,50,g=>{g.fillStyle(0x202c29).fillRect(7,29,10,20).fillRect(26,29,10,20);g.fillStyle(0x447b63).fillRoundedRect(3,13,36,29,8);g.fillStyle(0xa6d897).fillRoundedRect(10,15,22,21,7);g.lineStyle(3,0xd8a862).lineBetween(8,24,34,24);g.fillStyle(0x1c2828).fillRoundedRect(10,3,22,13,4);g.fillStyle(0xefb273).fillRect(14,7,14,4);g.fillStyle(0xf5eac0).fillCircle(21,29,4);});
  for(const [id,color] of [['cager',0xd4a75f],['compressor',0xb2c9cb],['firedamp',0x9de3ad]])texture(id,84,84,g=>{
    g.fillStyle(0x102024).fillRoundedRect(8,8,68,68,9);g.lineStyle(3,color).strokeRoundedRect(12,12,60,60,7);
    if(id==='cager'){g.fillStyle(0x665d4d).fillRect(18,17,48,48);for(const x of [23,35,47,59])g.fillStyle(color).fillRect(x,18,4,47);g.fillStyle(0xeb8c66).fillTriangle(17,67,67,67,42,80);g.lineStyle(3,0x778e96).lineBetween(29,0,29,12).lineBetween(55,0,55,12);}
    if(id==='compressor'){for(const x of [18,48]){g.fillStyle(0x617980).fillRoundedRect(x,16,18,50,8);g.lineStyle(3,color).lineBetween(x,30,x+18,30).lineBetween(x,54,x+18,54);}g.fillStyle(0xa86649).fillCircle(42,43,14);g.fillStyle(0xf2deb1).fillCircle(42,43,9);g.lineStyle(3,0xaa4d43).lineBetween(42,43,49,38);}
    if(id==='firedamp'){g.fillStyle(0x335748).fillCircle(42,42,28);g.fillStyle(0x88be85).fillCircle(42,42,20);g.lineStyle(5,0xb57854).strokeCircle(42,42,24).lineBetween(16,42,68,42);g.fillStyle(0xe8ffc5).fillTriangle(40,20,30,45,52,39).fillTriangle(52,39,39,64,40,38);}
    g.fillStyle(0xffe6a6).fillCircle(42,10,4);g.fillStyle(0x1b2b30).fillRect(5,71,22,10).fillRect(57,71,22,10);
  });
  texture('arena-shaft59',450,800,g=>{
    g.fillStyle(0x111b20).fillRect(0,0,450,800);g.fillStyle(0x222d31).fillRect(28,116,394,550);
    for(let y=116;y<666;y+=55)for(let x=28;x<422;x+=56){g.fillStyle((x+y)%3?0x273236:0x2c3739).fillRect(x+2,y+2,52,51);g.lineStyle(1,0x3d494a,.6).lineBetween(x+8,y+8,x+42,y+8);}
    for(const x of [28,422]){g.lineStyle(10,0x60584a).lineBetween(x,116,x,666);g.lineStyle(3,0xb0804e).lineBetween(x,116,x,666);for(let y=140;y<650;y+=105){g.fillStyle(0x172125).fillRect(x-13,y,26,50);g.fillStyle(0xd4a65f).fillRect(x-8,y+6,16,5);g.fillStyle(0xc1604a).fillRect(x-8,y+39,16,5);}}
    for(const x of [155,295])g.lineStyle(3,0x121d20,.7).lineBetween(x,120,x,662);
    for(const y of [122,658]){g.lineStyle(9,0x576260).lineBetween(32,y,418,y);for(let x=35;x<415;x+=25)g.lineStyle(3,0xceaa61).lineBetween(x,y-4,x+10,y+4);}
  });
}
export function drawShaftHazards(g,run){
  for(const h of run.shaftHazards?.items||[])if(h.vertical)dangerLane(g,h.x,h.y-90,h.x,h.y+90,14,h.active);else dangerCircle(g,h.x,h.y,h.radius,h.active);
  for(const e of run.enemies)if(e.shaftType&&Number.isFinite(e.chargeAngle)&&['warning','charge'].includes(e.phase)){
    const length=e.spec.chargeSpeed*e.spec.chargeSeconds;
    dangerLane(g,e.x,e.y,e.x+Math.cos(e.chargeAngle)*length,e.y+Math.sin(e.chargeAngle)*length,e.radius,e.phase==='charge');
  }
}
