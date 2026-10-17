// Compact industrial sprites. All geometry stays visual; boss stats live elsewhere.
function rivets(g,points) {for(const [x,y] of points){g.fillStyle(0x14242a).fillCircle(x,y,2.5);g.fillStyle(0xb6c2b1).fillCircle(x-.5,y-.5,1);}}
function treads(g) {
  g.fillStyle(0x0d181e).fillRoundedRect(5,22,16,55,5).fillRoundedRect(63,22,16,55,5);
  for(let y=27;y<74;y+=9)g.fillStyle(0x687977).fillRect(8,y,10,4).fillRect(66,y,10,4);
}
function plate(g,x,y,w,h,color,light) {
  g.fillStyle(0x14242a).fillRoundedRect(x-3,y-3,w+6,h+6,5);
  g.fillStyle(color).fillRoundedRect(x,y,w,h,4);
  g.lineStyle(2,light,.85).lineBetween(x+4,y+2,x+w-4,y+2);
  g.lineStyle(3,0x182b30,.6).lineBetween(x+3,y+h-2,x+w-3,y+h-2);
}
export function paintBoss(g,id) {
  if(id==='stationmaster') {
    g.fillStyle(0x14242a).fillRoundedRect(21,55,17,25,4).fillRoundedRect(47,55,17,25,4);
    g.fillStyle(0x9ca99c).fillRect(22,74,15,4).fillRect(48,74,15,4);
    plate(g,23,31,37,34,0xb87d38,0xffd58d);
    g.fillStyle(0x29434a).fillRect(29,34,24,26);
    g.lineStyle(4,0xf7d784).lineBetween(28,33,38,58).lineBetween(56,33,46,58);
    g.fillStyle(0xb69370).fillRoundedRect(30,13,24,21,6);
    g.fillStyle(0x1e343b).fillRoundedRect(25,6,34,14,5).fillRect(22,18,40,5);
    g.fillStyle(0xd5a759).fillRect(29,15,26,3).fillCircle(42,12,3);
    g.fillStyle(0x243c43).fillRect(33,25,7,4).fillRect(45,25,7,4);
    g.lineStyle(7,0x273c40).lineBetween(60,41,73,48).lineBetween(23,42,13,29);
    g.lineStyle(4,0xae8350).lineBetween(11,60,11,15);
    g.fillStyle(0x14242a).fillCircle(11,14,10);g.fillStyle(0xc24f39).fillCircle(11,14,7);
    g.fillStyle(0xffb568).fillCircle(9,12,3);
    rivets(g,[[26,34],[57,34],[27,60],[56,60]]);return;
  }
  treads(g);
  if(id==='locomotive') {
    plate(g,22,24,40,49,0x824e3c,0xe2a276);
    g.fillStyle(0x1c3036).fillRoundedRect(26,10,32,48,13);
    g.fillStyle(0x627c7b).fillRoundedRect(30,12,24,45,11);
    g.fillStyle(0x36535a).fillRect(43,15,8,35);
    g.lineStyle(3,0xc79265).lineBetween(29,27,55,27).lineBetween(29,43,55,43);
    g.fillStyle(0x0e1f27).fillCircle(42,15,10);g.fillStyle(0xa6b6a8).fillCircle(42,15,7);g.fillStyle(0x233e47).fillCircle(42,15,4);
    g.fillStyle(0x263b40).fillTriangle(18,16,66,16,42,1);
    g.lineStyle(2,0xd0b17d).lineBetween(21,14,42,3).lineBetween(42,3,63,14);
    g.fillStyle(0x273b3d).fillRect(29,58,26,11);g.fillStyle(0xf9d88b).fillCircle(42,62,5);g.fillStyle(0xfff4c8).fillCircle(41,61,2);
    rivets(g,[[24,30],[60,30],[25,68],[59,68]]);return;
  }
  if(id==='switchman') {
    plate(g,21,29,42,43,0x347d76,0xb8e6c7);
    g.lineStyle(7,0x142c32).lineBetween(22,47,64,6).lineBetween(62,47,20,6);
    g.lineStyle(3,0xcda15f).lineBetween(22,47,64,6).lineBetween(62,47,20,6);
    for(const x of [20,64]){g.fillStyle(0x132a31).fillCircle(x,9,7);g.fillStyle(x===20?0xd67946:0x91d8b1).fillCircle(x,9,4);}
    plate(g,28,39,28,18,0x203d43,0x749f94);
    g.lineStyle(2,0xa0e8ce).lineBetween(31,51,38,51).lineBetween(38,51,43,43).lineBetween(43,43,51,43);
    for(const x of [30,42,54])g.fillStyle(0xefcc85).fillCircle(x,64,2);
    rivets(g,[[25,33],[59,33],[25,69],[59,69]]);return;
  }
  if(id==='haveuse') {
    plate(g,22,27,40,46,0xb58b42,0xf6d692);
    g.fillStyle(0x29434a).fillRoundedRect(29,36,26,24,4);
    g.fillStyle(0xffd383).fillRect(32,42,7,7).fillRect(46,42,7,7);
    g.fillStyle(0x516d6b).fillRect(29,58,26,6);
    plate(g,11,12,62,12,0x8ea49a,0xe7e6c0);
    for(let x=13;x<70;x+=10){g.fillStyle(0x233a40).fillTriangle(x,13,x+9,13,x+4,1);g.fillStyle(0xdce0b9).fillTriangle(x+2,12,x+7,12,x+4,4);}
    rivets(g,[[26,31],[58,31],[26,68],[58,68]]);
  } else if(id==='crachefer') {
    plate(g,21,28,42,43,0x665777,0xb7a5c6);
    g.fillStyle(0x13262e).fillCircle(42,46,20);g.fillStyle(0xab7853).fillCircle(42,46,16);g.fillStyle(0xe6a458).fillCircle(42,46,12);
    for(const x of [33,41,49])g.fillStyle(0x263c40).fillRect(x,36,3,21);
    plate(g,32,9,20,24,0x6e8784,0xe4dcad);
    g.fillStyle(0x162e37).fillRect(35,3,14,16);g.fillStyle(0xb5bdb0).fillRect(30,2,24,6);g.fillStyle(0x0a1b23).fillRect(34,2,16,3);
    rivets(g,[[25,32],[59,32],[25,67],[59,67]]);
  } else {
    plate(g,23,29,38,42,0x945d46,0xe9a274);
    for(const x of [27,52]){g.fillStyle(0x273e42).fillRect(x,21,6,41);g.fillStyle(0xa4b8aa).fillRect(x+1,24,3,30);}
    plate(g,9,6,66,20,0x97aaa0,0xf0e9c0);
    g.fillStyle(0x526e70).fillRect(12,18,60,6);
    for(let x=17;x<69;x+=12)g.fillStyle(0xd0a35e).fillRect(x,8,6,8);
    g.fillStyle(0x213840).fillRect(36,30,12,28);g.fillStyle(0xf9ba75).fillRect(39,33,6,10);
    rivets(g,[[13,12],[71,12],[26,66],[58,66]]);
  }
}
