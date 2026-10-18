import {beforeRiveterMuzzleVisual} from './riveter-muzzle-visual-delta.js';
import assert from 'node:assert/strict';
export const SCORIFIER_VISUAL_EDITS={
 'room-scene.js':[["import {preloadScorifierTrail} from './scorifier-thermal-trail-vfx.js';\n",''],['preload() { preloadScorifierTrail(this);','preload() {']],
 'arena-view.js':[["import {ScorifierTrailView} from './scorifier-thermal-trail-vfx.js';\n",''],['    this.scorifierTrail=new ScorifierTrailView(scene);\n',''],['    this.scorifierTrail.begin(run);\n',''],['drawForge(this.warning,run,this.chauffeurPlate.draw,this.scorifierTrail)','drawForge(this.warning,run,this.chauffeurPlate.draw)']],
 'forge/art.js':[['export function drawForge(g,run,drawPlate=null,trail=null){','export function drawForge(g,run,drawPlate=null){'],['if(trail?.drawHazard(h))continue;',''],['if(trail?.drawPreview(e))continue;','']],
};
export function beforeScorifierVisual(file,bytes){bytes=beforeRiveterMuzzleVisual(file,bytes);file=file.replaceAll('\\','/');if(!SCORIFIER_VISUAL_EDITS[file])return bytes;let s=bytes.toString();for(const [after,before]of SCORIFIER_VISUAL_EDITS[file]){assert.equal(s.split(after).length,2,'Exact C5 presentation delta: '+file);s=s.replace(after,before);}return Buffer.from(s);}
