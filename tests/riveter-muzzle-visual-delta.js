import {beforeRivetImpactVisual} from './rivet-impact-visual-delta.js';
import assert from 'node:assert/strict';
// Exact reversible presentation edits. Earlier frozen-baseline checks still
// verify every byte after removing this explicitly enumerated patch.
export const RIVETER_MUZZLE_EDITS={
  "forge-animation-state.js": [
    [
      " const released=projectileAnimationReleased(a,e);\n if(s.id==='riveter')faceRiveterShot(a,e,released);\n a.release=released||",
      " a.release=projectileAnimationReleased(a,e)||"
    ],
    [
      "import {mobileFacing} from './enemy-facing.js';\nimport {faceRiveterShot} from './riveter-muzzle.js';",
      "import {mobileFacing} from './enemy-facing.js';"
    ]
  ],
  "enemy-rivet-vfx.js": [
    [
      "draw(bolt,zone){\n  const sprite=this.sprites[bolt.id],owner=this.owners.get(bolt.owner);\n  if(!sprite||!rivetCompatible(bolt,owner,zone))return false;\n  const ready=useEnemyRivet(sprite,this.scene.textures,bolt,this.scene.reducedMotion);\n  if(owner.kind==='riveter'&&zone==='forge')this.muzzle.position(sprite,bolt,owner,this.scene.enemyViews?.get(bolt.owner)?.body);\n  return ready;\n }",
      "draw(bolt,zone){const sprite=this.sprites[bolt.id];return !!sprite&&rivetCompatible(bolt,this.owners.get(bolt.owner),zone)&&useEnemyRivet(sprite,this.scene.textures,bolt,this.scene.reducedMotion);}"
    ],
    [
      "begin(run){this.muzzle.begin(run);if(this.run!==run)",
      "begin(run){if(this.run!==run)"
    ],
    [
      "constructor(scene){this.scene=scene;this.muzzle=new RiveterMuzzleView();",
      "constructor(scene){this.scene=scene;"
    ],
    [
      "import {RiveterMuzzleView} from './riveter-muzzle.js';\n// Visual-only allowlist.",
      "// Visual-only allowlist."
    ]
  ],
  "forge-sprite-vfx.js": [
    [
      "    if(getRiveterMuzzle(this.muzzle,e,this.scene.enemyViews?.get(e.id)?.body)){\n     const m=this.muzzle,c=Math.cos(m.angle),s=Math.sin(m.angle);\n     for(const side of [-3,3])spark(m.x,m.y,5*c-side*s,5*s+side*c,0xffd6a0,.6);\n    }else{\n     spark(e.x+22*facing,e.y+5,5*facing,-3,0xffd6a0,.6);spark(e.x+22*facing,e.y+5,5*facing,3,0xffd6a0,.6);\n    }",
      "    spark(e.x+22*facing,e.y+5,5*facing,-3,0xffd6a0,.6);spark(e.x+22*facing,e.y+5,5*facing,3,0xffd6a0,.6);"
    ],
    [
      "constructor(scene){this.scene=scene;this.muzzle={};this.g=",
      "constructor(scene){this.g="
    ],
    [
      "import {getRiveterMuzzle} from './riveter-muzzle.js';\n// Small pooled",
      "// Small pooled"
    ]
  ]
};
export function beforeRiveterMuzzleVisual(file,bytes){bytes=beforeRivetImpactVisual(file,bytes);
 const edits=RIVETER_MUZZLE_EDITS[file.replaceAll('\\','/')];if(!edits)return bytes;
 let s=bytes.toString();for(const [after,before]of edits){assert.equal(s.split(after).length,2,'Exact C6A presentation delta: '+file);s=s.replace(after,before);}return Buffer.from(s);
}
