// Reverse only the explicit C3 presentation integration, then compare historical
// snapshots as before. No stored baseline or historical assertion is renewed.
import assert from 'node:assert/strict';
import {beforeChauffeurVisual} from './chauffeur-visual-delta.js';
export const CRACHEUR_VISUAL_EDITS={
 'room-scene.js':[["import {preloadCracheurGas} from './cracheur-gas-vfx.js';\n",''],['preload() { preloadCracheurGas(this);','preload() {']],
 'arena-view.js':[["import {CracheurGasView} from './cracheur-gas-vfx.js';\n",''],['    this.cracheurGas=new CracheurGasView(scene);\n',''],['    this.cracheurGas.begin(run);\n',''],['drawRift(this.warning,run,this.cracheurGas.draw)','drawRift(this.warning,run)']],
 'rift/art.js':[['export function drawRift(g,run,drawGas=null){','export function drawRift(g,run){'],['for(const h of run.rift.ground.items){if(drawGas?.(g,h))continue;','for(const h of run.rift.ground.items){']],
};
export function beforeCracheurVisual(file,bytes){
 bytes=beforeChauffeurVisual(file,bytes);
 if(!CRACHEUR_VISUAL_EDITS[file])return bytes;
 let text=bytes.toString();
 for(const [after,before]of CRACHEUR_VISUAL_EDITS[file]){assert.equal(text.split(after).length,2,'Exact C3 presentation delta: '+file);text=text.replace(after,before);}
 return Buffer.from(text);
}
