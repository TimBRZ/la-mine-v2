import {V038B1_CHANGED} from './v038b1-authorized-files.js';
// User-authorized Zone 6 boss overhaul. Independently guarded by v037b-bosses.test.js.
import {FACING_FILES} from './facing-patch-files.js';
export const V037B_FILES=[...V038B1_CHANGED,...FACING_FILES,'bosses.js','forge/combat.js','forge/geometry.js','forge/art.js','room-scene.js','enemies/view.js'];
export const V037B_NEW_FILES=['forge/boss-pressure.js','forge/boss-mobility.js','forge/boss-light.js','forge/boss-patterns.js','forge/boss-safety.js','forge/boss-director.js','forge/dungeon-boss.js','forge/boss-view.js','assets/boss-v037b/furnace.svg','assets/boss-v037b/hammer.svg','assets/boss-v037b/boiler.svg'];
export const v037bChanged=file=>V037B_FILES.includes(file.replace(/^src\//,''));

