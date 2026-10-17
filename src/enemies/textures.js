// Small local sprites baked once; silhouette, metal edges and lamp highlights.
import { makeRailTextures } from './rail-textures.js';
import { makeRailBossTextures } from '../rail-boss-view.js';
export function makeEnemyTextures(texture) {
  makeRailTextures(texture); makeRailBossTextures(texture);
  texture('rat',34,40,g=>{
    g.lineStyle(4,0x16191c).lineBetween(17,12,8,3).lineBetween(8,3,3,7);
    g.lineStyle(2,0xb27d71).lineBetween(17,12,8,3).lineBetween(8,3,3,7);
    g.fillStyle(0x182020).fillEllipse(17,22,27,27);
    g.fillStyle(0x895953).fillEllipse(17,21,23,26);
    g.fillStyle(0xb37f6e).fillEllipse(15,18,17,19);
    g.fillStyle(0x463c3b).fillTriangle(6,24,28,24,17,39);
    g.fillStyle(0xc99a83).fillTriangle(8,24,26,24,17,36);
    for(const x of [7,27]){g.fillStyle(0x242b2b).fillCircle(x,21,6);g.fillStyle(0xc38074).fillCircle(x,21,4);}
    g.fillStyle(0x392d2c).fillCircle(12,28,3).fillCircle(22,28,3);
    g.fillStyle(0xffdf95).fillCircle(12,28,1.6).fillCircle(22,28,1.6);
    g.fillStyle(0x1d2627).fillCircle(17,36,2.5);
    g.lineStyle(1,0xe0b898).lineBetween(6,32,12,33).lineBetween(22,33,29,32);
    g.lineStyle(2,0xdbc0a0,.5).lineBetween(12,12,14,19);
  });
  texture('miner',54,60,g=>{
    g.fillStyle(0x141e21).fillRoundedRect(5,17,44,37,7);
    g.fillStyle(0x293e42).fillRect(12,47,12,12).fillRect(30,47,12,12);
    g.fillStyle(0x819189).fillRect(12,55,12,3).fillRect(30,55,12,3);
    g.fillStyle(0x775f43).fillRoundedRect(3,26,12,23,4).fillRoundedRect(39,26,12,23,4);
    g.fillStyle(0xb7945a).fillRoundedRect(11,23,32,27,4);
    g.fillStyle(0x394c4c).fillRect(16,30,22,20);
    g.lineStyle(3,0xddb769).lineBetween(17,25,21,45).lineBetween(37,25,33,45);
    g.fillStyle(0x1b292c).fillRect(13,39,28,4);g.fillStyle(0xd1b47c).fillRect(24,39,6,4);
    g.fillStyle(0xc9a582).fillRoundedRect(16,10,22,20,5);
    g.fillStyle(0x24383c).fillRoundedRect(17,19,20,8,3);
    g.fillStyle(0x8caa9e).fillRect(19,20,5,3).fillRect(30,20,5,3);
    g.fillStyle(0x6a4d2d).fillRoundedRect(11,3,32,16,7);
    g.fillStyle(0xd9a447).fillRoundedRect(13,3,28,13,6);
    g.lineStyle(2,0xf2d795).lineBetween(18,6,32,6);
    g.fillStyle(0x302e24).fillRect(22,7,10,10);g.fillStyle(0xffedb1).fillCircle(27,11,3);
    g.fillStyle(0x6b5238).fillRect(46,15,3,34);
    g.lineStyle(3,0xa8b9b2).lineBetween(40,15,51,18).lineBetween(51,18,53,23);
  });
  texture('drill',54,42,g=>{
    g.fillStyle(0x101a20).fillRoundedRect(2,1,33,11,3).fillRoundedRect(2,30,33,11,3);
    for(const x of [5,13,21,29])g.fillStyle(0x606c70).fillRect(x,3,4,6).fillRect(x,33,4,6);
    g.fillStyle(0x3f4254).fillRoundedRect(2,9,32,24,4);
    g.fillStyle(0x9383b2).fillRoundedRect(5,11,25,19,3);
    g.lineStyle(2,0xcfbcdb).lineBetween(7,12,27,12);
    g.fillStyle(0x243339).fillRect(10,16,15,10);
    g.fillStyle(0xe4b175).fillRect(12,17,3,8).fillRect(18,17,3,8);
    g.fillStyle(0x26373c).fillTriangle(30,7,30,35,54,21);
    g.fillStyle(0xc3cec4).fillTriangle(32,11,32,31,52,21);
    g.fillStyle(0x6b8180).fillTriangle(32,21,32,31,52,21);
    g.lineStyle(2,0x425b64).lineBetween(37,15,37,28).lineBetween(43,18,43,25);
    g.fillStyle(0xffefad).fillCircle(27,14,2);
  });
}
