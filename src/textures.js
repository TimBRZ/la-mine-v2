import {forgeTextures} from './forge/art.js';
import {depthsTextures} from './depths/art.js';
import {riftTextures} from './rift/art.js';
import {shaftTextures} from './shaft-art.js';
import { paintBoss } from './boss-art.js';
import { createArenaArt } from './combat-art.js';
import { makeEnemyTextures } from './enemies/textures.js';
export function makeTextures(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const texture = (name, width, height, draw) => {
    g.clear(); draw(g); g.generateTexture(name, width, height);
  };
  makeEnemyTextures(texture);shaftTextures(texture);riftTextures(texture);depthsTextures(texture);forgeTextures(texture);
  texture('player', 40, 40, g => {
    g.fillStyle(0x123b36).fillCircle(20, 22, 15);
    g.fillStyle(0x86ddc2).fillCircle(20, 19, 12);
    g.fillStyle(0x508b7f).fillRoundedRect(7, 20, 26, 12, 5);
    g.fillStyle(0xe7b16b).fillRoundedRect(8, 4, 24, 14, 7);
    g.fillStyle(0xf4d9a4).fillRect(18, 5, 4, 9);
    g.fillStyle(0x1b3133).fillRoundedRect(12, 17, 16, 6, 2);
    g.lineStyle(2,0xffe6ae).lineBetween(12,7,17,6);
    g.fillStyle(0x263e40).fillCircle(20,10,5);g.fillStyle(0xfff1bf).fillCircle(20,10,3);
    g.fillStyle(0xc1e8cf).fillRect(13,18,4,2).fillRect(23,18,4,2);
    g.fillStyle(0x183d39).fillRect(9,31,8,5).fillRect(23,31,8,5);
  });
  texture('enemy', 40, 40, g => {
    g.fillStyle(0x683c3c).fillTriangle(5, 13, 3, 2, 16, 9).fillTriangle(25, 9, 37, 2, 35, 13);
    g.fillStyle(0xcc7969).fillRoundedRect(5, 8, 30, 27, 8);
    g.fillStyle(0xeba18a).fillRoundedRect(10, 10, 21, 10, 5);
    g.fillStyle(0x2c2b31).fillRect(11, 21, 5, 5).fillRect(24, 21, 5, 5);
    g.fillStyle(0xf9ceb1).fillRect(16, 29, 8, 2);
  });
  texture('haveuse',84,84,g=>paintBoss(g,'haveuse'));
  texture('energy',24,10,g=>{g.fillStyle(0x50ffd2,.3).fillRoundedRect(0,0,24,10,5);g.fillStyle(0x193e48).fillRoundedRect(8,1,15,8,4);g.fillStyle(0x86ffcf).fillRoundedRect(3,3,20,4,2);g.fillStyle(0xeefff1).fillCircle(20,5,3);});
  texture('pellet', 16, 6, g => {
    g.fillStyle(0xe7ad5e, .3).fillRoundedRect(0, 1, 16, 4, 2);
    g.fillStyle(0x192527,.7).fillRoundedRect(5,0,11,6,2);
    g.fillStyle(0xffd494).fillRoundedRect(3,2,12,2,1);
    g.fillStyle(0xfffae1).fillRect(12,1,4,4);
  });
  texture('crachefer',84,84,g=>paintBoss(g,'crachefer'));
  texture('effondreur',84,84,g=>paintBoss(g,'effondreur'));
  texture('muzzle', 36, 30, g => {
    g.fillStyle(0xf4bf68, .65).fillTriangle(0, 15, 31, 1, 31, 29);
    g.fillStyle(0xfff1ca).fillTriangle(0,15,24,9,24,21);
    g.fillStyle(0xfffcdf).fillTriangle(0,15,16,12,16,18);
  });
  texture('spark', 6, 4, g => g.fillStyle(0xffffff).fillRect(0, 0, 6, 4));
  texture('ring', 40, 40, g => g.lineStyle(2, 0xffffff).strokeCircle(20, 20, 17));
  g.destroy();
}

export function drawRoom(scene) {
  const g = createArenaArt(scene);
  const label = scene.add.text(225, 86, '', { fontFamily: 'system-ui', fontSize: '9px', color: '#a6b9b4', letterSpacing: 2 }).setOrigin(.5);
  const hint = scene.add.text(225, 688, 'ARRÊTE-TOI POUR TIRER · BOUGE POUR ESQUIVER', { fontFamily: 'system-ui', fontSize: '8px', color: '#7c9091', letterSpacing: 1 }).setOrigin(.5);
  return { background: g, label, hint };
}
