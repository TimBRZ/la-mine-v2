import {beforeConeVisual} from './cone-visual-delta.js';
import assert from 'node:assert/strict';
const edits={
 'room-scene.js':[
  ["import {preloadWhitehotPlates} from './furnace-whitehot-plates-vfx.js';\n",''],
  ['preload() { preloadWhitehotPlates(this);','preload() {'],
 ],
 'arena-view.js':[
  ["import {WhitehotPlatesView} from './furnace-whitehot-plates-vfx.js';\n",''],
  ['    this.whitehotPlates=new WhitehotPlatesView(scene);\n',''],
  ['    this.whitehotPlates.begin(run);\n',''],
  ['this.scorifierTrail,this.furnaceArm,this.whitehotPlates)','this.scorifierTrail,this.furnaceArm)'],
 ],
 'forge/art.js':[
  ['furnaceArm=null,whitehot=null)','furnaceArm=null)'],
  ['if(!whitehot?.drawSafeZones())drawDungeonSafeZones(g,run);','drawDungeonSafeZones(g,run);'],
  ['if(whitehot?.drawHazard(h))continue;',''],
 ],
};
export function beforeWhitehotVisual(file,bytes){
 bytes=beforeConeVisual(file,bytes);
 const pairs=edits[file.replaceAll('\\','/')];if(!pairs)return bytes;
 let s=bytes.toString();for(const [after,before]of pairs){assert.equal(s.split(after).length,2,'Exact D1C presentation delta: '+file);s=s.replace(after,before);}return Buffer.from(s);
}
