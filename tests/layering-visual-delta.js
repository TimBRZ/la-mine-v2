import {beforeWhiteMarchVisual} from './white-march-visual-delta.js';
import assert from 'node:assert/strict';
import {V038B3_NEW_FILES} from './v038b3-authorized-files.js';
if(!V038B3_NEW_FILES.includes('combat-render-layers.js'))V038B3_NEW_FILES.push('combat-render-layers.js');
const edits={
 'room-scene.js':[
  ["import {applyCombatRenderLayers} from './combat-render-layers.js';\n",''],
  ['    applyCombatRenderLayers(this);\n',''],
 ],
 'forge-sprite-vfx.js':[
  ['this.muzzleGraphics=scene.add.graphics().setDepth(7);',''],
  ['this.muzzleGraphics.clear();let target=g;',''],
  ['target.lineStyle(1.5,c,a)','g.lineStyle(1.5,c,a)'],
  ['    target=this.muzzleGraphics;\n',''],
  ['   target=g;\n',''],
 ],
};
export function beforeLayeringVisual(file,bytes){
 bytes=beforeWhiteMarchVisual(file,bytes);
 const pairs=edits[file.replaceAll('\\','/')];if(!pairs)return bytes;let s=bytes.toString();
 for(const [after,before]of pairs){assert.equal(s.split(after).length,2,'Exact D1F composition hook: '+file);s=s.replace(after,before);}return Buffer.from(s);
}
