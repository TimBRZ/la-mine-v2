// Riveted, bevelled machines, generated once. Front faces +X.
export function makeRailTextures(texture) {
  texture('wagon',52,42,g=>{
    g.fillStyle(0x172024).fillRoundedRect(3,1,42,9,3).fillRoundedRect(3,32,42,9,3);
    g.fillStyle(0x77868a).fillRect(7,3,8,5).fillRect(31,3,8,5).fillRect(7,34,8,5).fillRect(31,34,8,5);
    g.fillStyle(0x744627).fillRoundedRect(2,9,44,24,3);
    g.fillStyle(0xe4a55b).fillRect(6,12,35,18);
    g.fillStyle(0x353a3b).fillRect(9,14,25,14);
    g.fillStyle(0x536068).fillCircle(16,20,6).fillCircle(28,21,5);
    g.lineStyle(3,0xffd697).lineBetween(7,11,7,30).lineBetween(39,11,39,30);
    g.fillStyle(0xdce4ce).fillRect(45,14,6,14);
    g.fillStyle(0xf4ca62).fillTriangle(22,17,30,21,22,25);
    g.lineStyle(1.5,0xffdfa0).lineBetween(7,11,39,11);
    g.fillStyle(0x1c2b30).fillRect(44,12,8,3).fillRect(44,27,8,3);
    for(const x of [9,37])for(const y of [12,29])g.fillStyle(0xffe0a3).fillCircle(x,y,1.3);
    g.fillStyle(0x859c98).fillTriangle(11,18,20,15,19,22).fillTriangle(22,25,28,17,32,25);
    g.fillStyle(0xfff2b3).fillRect(47,17,3,8);
  });
  texture('draisine',50,44,g=>{
    g.fillStyle(0x1b292e).fillCircle(11,6,6).fillCircle(36,6,6).fillCircle(11,38,6).fillCircle(36,38,6);
    g.fillStyle(0x598582).fillRoundedRect(4,10,38,24,4);
    g.fillStyle(0x8fded0).fillRect(8,13,26,18);
    g.fillStyle(0x244c53).fillRect(13,15,16,14);
    g.lineStyle(3,0xd2ede1).lineBetween(19,8,19,35).lineBetween(11,8,27,8);
    g.fillStyle(0x618f9a).fillRect(30,17,18,10);
    g.fillStyle(0xeaffce).fillRect(43,18,6,8);
    g.fillStyle(0xcc945e).fillCircle(8,22,3);
    g.lineStyle(1.5,0xd4f0de).lineBetween(7,11,34,11);
    for(const x of [11,36])for(const y of [6,38]){g.fillStyle(0x91a4a0).fillCircle(x,y,3);g.fillStyle(0x26373b).fillCircle(x,y,1);}
    g.fillStyle(0xc98d56).fillRect(10,13,3,18).fillRect(31,13,3,18);
    g.fillStyle(0x1a3138).fillRect(36,19,11,3);
    g.fillStyle(0xb3ebe1).fillRect(16,19,9,2).fillRect(16,24,9,2);
  });
}
