import assert from 'node:assert/strict';
export const RIVET_IMPACT_EDITS={
  "enemy-projectiles.js": [
    [
      "  clear() { clearProjectileEndings(this); for (const bolt",
      "  clear() { for (const bolt"
    ],
    [
      "      recordProjectileEnding(this,bolt,x,y,hit,step);\n      bolt.x = x; bolt.y = y; bolt.distance += step;",
      "      bolt.x = x; bolt.y = y; bolt.distance += step;"
    ],
    [
      "  update(dt, player, previous, onHit) {\n    advanceProjectileEndings(this,dt);",
      "  update(dt, player, previous, onHit) {"
    ],
    [
      "import {advanceProjectileEndings,recordProjectileEnding,clearProjectileEndings} from './projectile-endings.js';\nimport {noteProjectileEmission}",
      "import {noteProjectileEmission}"
    ]
  ],
  "room-scene.js": [
    [
      "  preload() { preloadRivetImpact(this); preloadScorifierTrail",
      "  preload() { preloadScorifierTrail"
    ],
    [
      "import {preloadRivetImpact} from './rivet-impact-vfx.js';\nimport {preloadScorifierTrail}",
      "import {preloadScorifierTrail}"
    ]
  ],
  "enemies/view.js": [
    [
      "    this.rivetImpacts.update(run,this.rivets.owners);\n    this.rivets.begin(run);",
      "    this.rivets.begin(run);"
    ],
    [
      "    this.rivets = new EnemyRivetView(scene);\n    this.rivetImpacts = new RivetImpactView(scene);",
      "    this.rivets = new EnemyRivetView(scene);"
    ],
    [
      "import {RivetImpactView} from '../rivet-impact-vfx.js';\nimport {isPureProjectile}",
      "import {isPureProjectile}"
    ]
  ]
};
export function beforeRivetImpactVisual(file,bytes){const edits=RIVET_IMPACT_EDITS[file.replaceAll('\\','/')];if(!edits)return bytes;let s=bytes.toString();for(const [after,before]of edits){assert.equal(s.split(after).length,2,'Exact C6B presentation delta: '+file);s=s.replace(after,before);}return Buffer.from(s);}
