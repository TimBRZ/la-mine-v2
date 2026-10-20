import {beforeLayeringVisual} from './layering-visual-delta.js';
import assert from 'node:assert/strict';
import {V038B3_NEW_FILES} from './v038b3-authorized-files.js';
for(const p of ['furnace-heating-sectors-vfx.js','assets/furnace-heating-sectors-v038d1e/sectors-a.png'])if(!V038B3_NEW_FILES.includes(p))V038B3_NEW_FILES.push(p);
const edits={
 'room-scene.js':[
  ["import {preloadHeatingSectors} from './furnace-heating-sectors-vfx.js';\n",''],
  ['preload() { preloadHeatingSectors(this);','preload() {'],
 ],
 'arena-view.js':[
  ["import {HeatingSectorsView} from './furnace-heating-sectors-vfx.js';\n",''],
  ['    this.heatingSectors=new HeatingSectorsView(scene);\n',''],
  ['    this.heatingSectors.begin(run);\n',''],
  ['this.whitehotPlates,this.furnaceCone,this.heatingSectors)','this.whitehotPlates,this.furnaceCone)'],
 ],
 'forge/art.js':[
  ['cone=null,sectors=null)','cone=null)'],
  ['if(sectors?.drawHazard(h))continue;',''],
 ],
};
export function beforeSectorsVisual(file,bytes){
 bytes=beforeLayeringVisual(file,bytes);
 const pairs=edits[file.replaceAll('\\','/')];if(!pairs)return bytes;let s=bytes.toString();
 for(const [after,before]of pairs){assert.equal(s.split(after).length,2,'Exact D1E visual hook: '+file);s=s.replace(after,before);}return Buffer.from(s);
}
