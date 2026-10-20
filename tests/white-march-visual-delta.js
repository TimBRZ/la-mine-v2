import assert from 'node:assert/strict';import {V038B3_NEW_FILES} from './v038b3-authorized-files.js';
for(const p of ['furnace-white-march-vfx.js','assets/furnace-white-march-disc-v038d1g/disc-a.png'])if(!V038B3_NEW_FILES.includes(p))V038B3_NEW_FILES.push(p);
const edits={
 'room-scene.js':[["import {preloadWhiteMarch} from './furnace-white-march-vfx.js';\n",''],['preload() { preloadWhiteMarch(this);','preload() {']],
 'arena-view.js':[["import {WhiteMarchView} from './furnace-white-march-vfx.js';\n",''],['    this.whiteMarch=new WhiteMarchView(scene);\n',''],['    this.whiteMarch.begin(run);\n',''],['this.heatingSectors,this.whiteMarch)','this.heatingSectors)']],
 'forge/art.js':[['sectors=null,whiteMarch=null)','sectors=null)'],['if(whiteMarch?.drawHazard(h))continue;','']],
};
export function beforeWhiteMarchVisual(file,bytes){const pairs=edits[file.replaceAll('\\','/')];if(!pairs)return bytes;let s=bytes.toString();for(const [after,before]of pairs){assert.equal(s.split(after).length,2,'Exact D1G render hook '+file);s=s.replace(after,before);}return Buffer.from(s);}
