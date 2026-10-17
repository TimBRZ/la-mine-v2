const gallery = [[65,154],[225,144],[385,154],[386,384],[385,605],[65,605],[64,384]];
const flanks = [[64,190],[386,260],[64,410],[386,560],[64,600],[386,160]];
const encounters = [
  ['rat','rat','rat','rat','rat','rat'],
  ['miner','rat','rat','miner','rat','rat','miner','rat','rat','rat'],
  ['drill','miner','miner','miner','drill','miner','miner','miner','drill','miner','miner','miner'],
  ['rat','miner','drill','rat','rat','miner','rat','drill','rat','miner','rat','rat','drill','miner','rat','rat'],
  [],
];

// Fixed layouts and pacing. No procedural generation or historical data.
export const ROOMS = Object.freeze([
  { id: 'gallery', name: 'GALERIE D’ENTRÉE', total: 6, maxAlive: 3, interval: 1.8, color: 0x263438, accent: 0x91b09a, spawns: gallery },
  { id: 'rails', name: 'VOIE DES WAGONNETS', total: 10, maxAlive: 4, interval: 1.4, color: 0x303431, accent: 0xc5a16b, spawns: gallery },
  { id: 'pipes', name: 'CONDUITES DE PRESSION', total: 12, maxAlive: 5, interval: 1.1, color: 0x203339, accent: 0x78b6bb, spawns: flanks },
  { id: 'danger', name: 'GALERIE INSTABLE', total: 16, maxAlive: 7, interval: .85, color: 0x28282d, accent: 0xd58165, spawns: gallery },
  { id: 'machine', name: 'CHAMBRE DES MACHINES', total: 1, maxAlive: 1, interval: 1, color: 0x30302b, accent: 0xe6b65b, boss: true, spawns: [[225,220]] },
].map((room, index) => Object.freeze({ ...room, enemies: Object.freeze(encounters[index]), spawns: Object.freeze(room.spawns.map(p => Object.freeze([...p]))) })));

export const EXIT = Object.freeze({ x: 185, y: 613, width: 80, height: 43 });
export const TRANSITION_SECONDS = .6;
export function insideExit(player) {
  return player.x >= EXIT.x && player.x <= EXIT.x + EXIT.width &&
    player.y >= EXIT.y && player.y <= EXIT.y + EXIT.height;
}
