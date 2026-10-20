import {beforeWhitehotVisual} from './whitehot-visual-delta.js';
import assert from 'node:assert/strict';
// Reverse only the three explicit presentation integration points. All earlier
// frozen-byte tests still inspect their original code, not an updated baseline.
export const FURNACE_TURN_EDITS={
 'room-scene.js':[
  ["import {preloadFurnaceArm} from './furnace-rotating-arm-vfx.js';\n",''],
  ['preload() { preloadFurnaceArm(this);','preload() {'],
 ],
 'arena-view.js':[
  ["import {FurnaceArmView} from './furnace-rotating-arm-vfx.js';\n",''],
  ['    this.furnaceArm=new FurnaceArmView(scene);\n',''],
  ['    this.furnaceArm.begin(run);\n',''],
  ['drawForge(this.warning,run,this.chauffeurPlate.draw,this.scorifierTrail,this.furnaceArm)','drawForge(this.warning,run,this.chauffeurPlate.draw,this.scorifierTrail)'],
 ],
 'forge/art.js':[
  ['export function drawForge(g,run,drawPlate=null,trail=null,furnaceArm=null){','export function drawForge(g,run,drawPlate=null,trail=null){'],
  ['if(furnaceArm?.drawHazard(h))continue;',''],
 ],
};
export function beforeFurnaceTurnVisual(file,bytes){
 bytes=beforeWhitehotVisual(file,bytes);
 const edits=FURNACE_TURN_EDITS[file.replaceAll('\\','/')];if(!edits)return bytes;
 let s=bytes.toString();for(const [after,before]of edits){assert.equal(s.split(after).length,2,'Exact D1B presentation delta: '+file);s=s.replace(after,before);}
 return Buffer.from(s);
}
