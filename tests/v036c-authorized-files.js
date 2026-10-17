import fs from 'node:fs';
import {V037C_NEW_FILES} from './v037c-authorized-files.js';
export const V036C_NEW_FILES=[...V037C_NEW_FILES,'depths-animation.js','depths-sprite-catalog.js',...fs.readdirSync('src/assets/enemies-v036c').map(f=>'assets/enemies-v036c/'+f)];

