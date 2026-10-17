import {FORGE_BOSSES} from './forge/config.js';
import {DEPTHS_BOSSES} from './depths/config.js';
import {RIFT_BOSSES} from './rift/config.js';
import {SHAFT_BOSSES} from './shaft-actors.js';
import { BOSS_SPECS as GALLERY_BOSSES } from './difficulty.js';
import { RAIL_BOSS_SPECS } from './rail-bosses.js';
export const BOSS_SPECS=Object.freeze({...GALLERY_BOSSES,...RAIL_BOSS_SPECS,...SHAFT_BOSSES,...RIFT_BOSSES,...DEPTHS_BOSSES,...FORGE_BOSSES});
