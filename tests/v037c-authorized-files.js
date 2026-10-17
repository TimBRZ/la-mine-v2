import fs from 'node:fs';
// V037C permits presentation only; its own byte-snapshot test guards all other files.
export const V037C_NEW_FILES=['enemy-facing.js','forge-sprite-vfx.js','forge-animation.js','forge-animation-state.js','forge-sprite-catalog.js',...fs.readdirSync('src/assets/enemies-v037c').map(f=>'assets/enemies-v037c/'+f)];

