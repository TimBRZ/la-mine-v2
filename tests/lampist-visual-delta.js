// Only reverse the five integration additions for historical source contracts.
// The C2 baseline test verifies the result byte-for-byte; no hashes are renewed.
export function beforeLampistVisual(file,bytes){
 if(!['room-scene.js','enemies/view.js'].includes(file))return bytes;
 let s=bytes.toString();
 if(file==='room-scene.js')s=s.replace("import {preloadLampistShot} from './lampist-projectile-vfx.js';\n",'').replace('preload() { preloadLampistShot(this);','preload() {');
 if(file==='enemies/view.js')s=s.replace("import {LampistShotView} from '../lampist-projectile-vfx.js';\n",'').replace('    this.lampistShots = new LampistShotView(scene);\n','').replace('    this.lampistShots.begin(run);\n','').replace('      if(this.lampistShots.draw(bolt,run.world?.id))continue;\n','');
 return Buffer.from(s);
}
export function beforeLampistTestAdapter(bytes){
 return Buffer.from(bytes.toString().replace("import {beforeLampistVisual} from './lampist-visual-delta.js';\n",'').replace("beforeLampistVisual(f.path.replace(/^src\\//,''),fs.readFileSync(f.path))",'fs.readFileSync(f.path)'));
}
