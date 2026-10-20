import {beforeSectorsVisual} from './sectors-visual-delta.js';
import assert from 'node:assert/strict';
import {V038B3_NEW_FILES} from './v038b3-authorized-files.js';
// Extend the historical inventory without editing its frozen D1C bytes.
// The exact D1D source hashes and all older assertions are checked separately.
for(const p of ['furnace-cone-vfx.js','assets/furnace-cone-v038d1d/cone-a.png'])if(!V038B3_NEW_FILES.includes(p))V038B3_NEW_FILES.push(p);
const edits={
 'room-scene.js':[
  ["import {preloadFurnaceCone} from './furnace-cone-vfx.js';\n",''],
  ['preload() { preloadFurnaceCone(this);','preload() {'],
 ],
 'arena-view.js':[
  ["import {FurnaceConeView} from './furnace-cone-vfx.js';\n",''],
  ['    this.furnaceCone=new FurnaceConeView(scene);\n',''],
  ['    this.furnaceCone.begin(run);\n',''],
  ['this.furnaceArm,this.whitehotPlates,this.furnaceCone)','this.furnaceArm,this.whitehotPlates)'],
 ],
 'forge/art.js':[
  ['whitehot=null,cone=null)','whitehot=null)'],
  ['if(cone?.drawHazard(h))continue;',''],
 ],
};
export function beforeConeVisual(file,bytes){
 bytes=beforeSectorsVisual(file,bytes);
 const pairs=edits[file.replaceAll('\\','/')];if(!pairs)return bytes;
 let s=bytes.toString();for(const [after,before]of pairs){assert.equal(s.split(after).length,2,'Exact D1D presentation delta: '+file);s=s.replace(after,before);}return Buffer.from(s);
}
