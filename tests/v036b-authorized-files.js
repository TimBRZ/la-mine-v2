import {V037B_FILES,V037B_NEW_FILES,v037bChanged} from './v037b-authorized-files.js';
// V036B scoped gameplay overhaul; independently guarded by its immediate source snapshot.
export const V036B_FILES=[...V037B_FILES,'depths/combat.js','depths/art.js','room-scene.js','enemies/view.js'];
export const V036B_NEW_FILES=[...V037B_NEW_FILES,'depths/boss-patterns.js','depths/boss-director.js','depths/boss-view.js','assets/boss-v036b/lampmajor.svg','assets/boss-v036b/dynamiter.svg','assets/boss-v036b/blackmass.svg'];
export const v036bChanged=f=>V036B_FILES.includes(f.replace(/^src\//,''));
