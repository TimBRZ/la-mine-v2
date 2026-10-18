// Reverse only C4's explicit presentation hooks. Historical assertions stay intact.
import assert from 'node:assert/strict';
import {beforeScorifierVisual} from './scorifier-visual-delta.js';
export const CHAUFFEUR_VISUAL_EDITS={
 'room-scene.js':[["import {preloadChauffeurPlate} from './chauffeur-heat-plate-vfx.js';\n",''],['preload() { preloadChauffeurPlate(this);','preload() {']],
 'arena-view.js':[["import {ChauffeurPlateView} from './chauffeur-heat-plate-vfx.js';\n",''],['    this.chauffeurPlate=new ChauffeurPlateView(scene);\n',''],['    this.chauffeurPlate.begin(run);\n',''],['drawForge(this.warning,run,this.chauffeurPlate.draw)','drawForge(this.warning,run)']],
 'forge/art.js':[['export function drawForge(g,run,drawPlate=null){','export function drawForge(g,run){'],['if(drawPlate?.(g,h))continue;','']],
};
export function beforeChauffeurVisual(file,bytes){
 bytes=beforeScorifierVisual(file,bytes);
 file=file.replaceAll('\\','/');
 if(!CHAUFFEUR_VISUAL_EDITS[file])return bytes;
 let text=bytes.toString();
 for(const [after,before]of CHAUFFEUR_VISUAL_EDITS[file]){assert.equal(text.split(after).length,2,'Exact C4 presentation delta: '+file);text=text.replace(after,before);}
 return Buffer.from(text);
}
