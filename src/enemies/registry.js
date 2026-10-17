import {ForgeActor} from '../forge/actors.js';
import {FORGE_ENEMIES} from '../forge/config.js';
import {DepthsActor} from '../depths/actors.js';
import {DEPTHS_ENEMIES} from '../depths/config.js';
import {RiftActor} from '../rift/actors.js';
import {RIFT_ENEMIES} from '../rift/config.js';
import {ShaftActor,SHAFT_ENEMIES} from '../shaft-actors.js';
import { GalleryRat } from './rat.js';
import { FiredampMiner } from './miner.js';
import { AutonomousDrill } from './drill.js';
import { RAT, MINER, DRILL } from './stats.js';
import { MadWagon, WAGON_SPAWNS, chooseWagonRail, WAGON_SPAWN_CLEARANCE } from './wagon.js';
import { Draisine } from './draisine.js';
import { WAGON, DRAISINE } from './rail-stats.js';

export const ENEMY_TYPES = Object.freeze({
  ...Object.fromEntries(Object.entries(FORGE_ENEMIES).map(([kind,stats])=>[kind,Object.freeze({name:stats.name,stats,create:(id,x,y)=>new ForgeActor(id,kind,x,y),texture:kind,color:stats.color,rotationOffset:null})])),
  ...Object.fromEntries(Object.entries(DEPTHS_ENEMIES).map(([kind,stats])=>[kind,Object.freeze({name:stats.name,stats,create:(id,x,y)=>new DepthsActor(id,kind,x,y),texture:kind,color:stats.color,rotationOffset:null})])),
  ...Object.fromEntries(Object.entries(RIFT_ENEMIES).map(([kind,stats])=>[kind,Object.freeze({name:stats.name,stats,create:(id,x,y)=>new RiftActor(id,kind,x,y),texture:kind,color:stats.color,rotationOffset:null})])),
  ...Object.fromEntries(Object.entries(SHAFT_ENEMIES).map(([kind,stats])=>[kind,Object.freeze({name:stats.name,stats,create:(id,x,y)=>new ShaftActor(id,kind,x,y),texture:kind,color:stats.color,rotationOffset:kind==='deepdriller'?0:null})])),
  wagon: Object.freeze({name:'Wagon Fou',stats:WAGON,create:(id,x,y)=>new MadWagon(id,x,y),texture:'wagon',color:0xf1b25f,rotationOffset:0,spawnPoints:WAGON_SPAWNS,selectSpawn:chooseWagonRail,minSpawnDistance:WAGON_SPAWN_CLEARANCE}),
  draisine: Object.freeze({name:'Draisine',stats:DRAISINE,create:(id,x,y)=>new Draisine(id,x,y),texture:'draisine',color:0x7ce6da,rotationOffset:0}),
  rat: Object.freeze({ name: 'Rat de galerie', stats: RAT, create: (id, x, y) => new GalleryRat(id, x, y), texture: 'rat', color: 0xe88883, rotationOffset: -Math.PI / 2 }),
  miner: Object.freeze({ name: 'Mineur grisouteux', stats: MINER, create: (id, x, y) => new FiredampMiner(id, x, y), texture: 'miner', color: 0xc29c65, rotationOffset: null }),
  drill: Object.freeze({ name: 'Foreuse autonome', stats: DRILL, create: (id, x, y) => new AutonomousDrill(id, x, y), texture: 'drill', color: 0xb8a0fa, rotationOffset: 0 }),
});
export function createEnemy(kind, id, x, y) {
  const definition = ENEMY_TYPES[kind];
  if (!definition) throw Error('Unknown enemy type: ' + kind);
  return definition.create(id, x, y);
}
