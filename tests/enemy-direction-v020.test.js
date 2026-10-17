import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {COMBAT_APPEARANCES as ART,appearancePose,createAppearanceMotion} from '../src/combat-appearances.js';
import {MadWagon,WAGON_SPAWNS} from '../src/enemies/wagon.js';

function heading(pose,x,y) {
  const sign=pose.flipX?-1:1,length=Math.hypot(x,y);
  assert.ok(Math.abs(sign*Math.cos(pose.rotation)-x/length)<1e-8);
  assert.ok(Math.abs(sign*Math.sin(pose.rotation)-y/length)<1e-8);
  assert.ok(Math.abs(pose.rotation)<=Math.PI/2+1e-8,'profile never turns upside down');
}
test('rat nose follows actual movement in eight directions, including retreat under knockback',()=>{
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]) {
    const motion=createAppearanceMotion(200,300);
    const entity=Object.freeze({x:200+dx,y:300+dy,angle:0,active:true,radius:10,hp:3});
    const before=JSON.stringify(entity);
    heading(appearancePose(ART.rat,motion,entity,1/60),dx,dy);
    assert.equal(JSON.stringify(entity),before);
  }
});
test('stationary and newly spawned rats retain their intended facing without displacement',()=>{
  for(const angle of [0,Math.PI,-Math.PI/4,3*Math.PI/4]) {
    const entity={x:200,y:300,angle,active:false,warmup:.5};
    heading(appearancePose(ART.rat,createAppearanceMotion(200,300),entity,0),Math.cos(angle),Math.sin(angle));
  }
});
test('both rail directions stay upright from telegraph through charge and stop, without changing collisions',()=>{
  for(const [x,y] of WAGON_SPAWNS) {
    const wagon=new MadWagon(1,x,y),motion=createAppearanceMotion(x,y);
    const direction=Math.sign(wagon.endX-x),radius=wagon.radius,damage=wagon.contactDamage;
    const phases=new Set();
    for(let i=0;i<400;i++) {
      wagon.update(1/60);phases.add(wagon.phase);
      const before=JSON.stringify(wagon);
      const pose=appearancePose(ART.wagon,motion,wagon,1/60);
      heading(pose,direction,0);assert.equal(JSON.stringify(wagon),before);
      assert.equal(wagon.radius,radius);assert.equal(wagon.y,y);
      if(wagon.phase!=='stopped')assert.equal(wagon.contactDamage,damage);
    }
    assert.deepEqual([...phases],['warning','charge','stopped']);
    assert.equal(wagon.x,wagon.endX);assert.equal(wagon.contactDamage,0);
  }
});
test('wagon reads its locked charge heading even when a cosmetic angle differs',()=>{
  for(const chargeAngle of [0,Math.PI]) {
    const entity=Object.freeze({x:200,y:300,angle:Math.PI/2,chargeAngle,active:true});
    heading(appearancePose(ART.wagon,createAppearanceMotion(200,300),entity,.02),Math.cos(chargeAngle),0);
  }
});
test('only rat and wagon artwork changes; all other V0.20 SVGs remain byte-identical',async()=>{
  const root=new URL('../src/assets/combat-v020/',import.meta.url);
  for(const file of (await readdir(root)).filter(f=>f!=='grisoux.svg')) {
    const current=await readFile(new URL(file,root));
    const previous=await readFile(new URL('./v020-direction-before/src/assets/combat-v020/'+file,import.meta.url));
    if(['rat.svg','wagon.svg'].includes(file))assert.notDeepEqual(current,previous);
    else assert.deepEqual(current,previous,file);
  }
});
