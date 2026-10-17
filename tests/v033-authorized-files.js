import {V038B3_NEW_FILES} from './v038b3-authorized-files.js';
import {V038B2_NEW_FILES} from './v038b2-authorized-files.js';
import {V038B1_NEW_FILES} from './v038b1-authorized-files.js';
import {V036C_NEW_FILES} from './v036c-authorized-files.js';
import {V036B_FILES,V036B_NEW_FILES} from './v036b-authorized-files.js';
// Presentation-only authorization. All gameplay is locked by the immediate V033 snapshot test.
import {ENEMY_SHEETS} from '../src/enemy-sprite-catalog.js';
import {RIFT_SHEETS} from '../src/rift-sprite-catalog.js';
export const V035B_NEW_FILES=['burster-bonbonne-art-v1.js','assets/enemies-v035b/burster-bonbonne-v1.svg','burster-visual.js','burster-final-art-66fe46f1.js','enemy-visual-frame.js','rift-animation.js','rift-sprite-catalog.js',...Object.keys(RIFT_SHEETS).map(id=>'assets/enemies-v035b/'+id+'.svg')];
export const V034B_NEW_FILES=['enemy-animation.js','enemy-sprite-catalog.js',...Object.keys(ENEMY_SHEETS).map(id=>'assets/enemies-v034b/'+id+'.svg')];
export const V033_NEW_FILES=[...V038B3_NEW_FILES,'hero-muzzle.js',...V038B2_NEW_FILES,...V038B1_NEW_FILES,...V036C_NEW_FILES,...V036B_NEW_FILES,'hero-animation.js','weapon-visuals.js','assets/combat-v033/hero-sheet.svg','assets/combat-v033/hero-idle.svg','assets/combat-v033/shotgun.svg','assets/combat-v033/smg.svg','assets/combat-v033/grisoux.svg','assets/combat-v033/vfx-atlas.svg',...V034B_NEW_FILES,...V035B_NEW_FILES];
export const V033_FILES=[...V036B_FILES,'room-scene.js','effects.js','menu/main-menu.js','enemies/view.js',...V033_NEW_FILES];


