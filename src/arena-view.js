import {ScorifierTrailView} from './scorifier-thermal-trail-vfx.js';
import {ChauffeurPlateView} from './chauffeur-heat-plate-vfx.js';
import {CracheurGasView} from './cracheur-gas-vfx.js';
import {drawForge} from './forge/art.js';
import {drawDepths,applyDepthsLighting} from './depths/art.js';
import {drawRift} from './rift/art.js';
import {drawShaftHazards} from './shaft-art.js';
import { dangerLane, dangerCircle } from './combat-art.js';
import { drawRoom } from './textures.js';
import { HAVEUSE } from './boss.js';
import { BOSS_SPECS } from './boss-catalog.js';
import { drawRailBoss } from './rail-boss-view.js';

// Constructed once by the scene. Wave changes never rebuild the terrain.
export class ArenaView {
  constructor(scene) {
    this.scorifierTrail=new ScorifierTrailView(scene);
    this.chauffeurPlate=new ChauffeurPlateView(scene);
    this.cracheurGas=new CracheurGasView(scene);
    this.base = drawRoom(scene);
    this.base.label.setVisible(false);
    this.extinctionLabel=scene.add.text(225,650,'EXTINCTION · GARDE LES DANGERS EN VUE',{fontFamily:'system-ui',fontSize:'11px',color:'#e6edff',stroke:'#0c1220',strokeThickness:3}).setOrigin(.5).setDepth(60).setVisible(false);
    this.warning = scene.add.graphics().setDepth(8);
    this.bossHealth = scene.add.graphics().setDepth(60);
  }
  update(run) {
    this.scorifierTrail.begin(run);
    this.chauffeurPlate.begin(run);
    this.cracheurGas.begin(run);
    applyDepthsLighting(this.base.background,run);this.extinctionLabel.setText(run.depths?.darkness.notice||'').setVisible(Boolean(run.depths?.darkness.notice)&&run.wavePhase==='combat');
    const texture=run.world.id==='forge'?'arena-forge':run.world.id==='depths'?'arena-depths':run.world.id==='rift'?'arena-rift':run.world.id==='shaft59'?'arena-shaft59':(run.world.id==='tracks'||run.world.theme==='rust-steel-copper')?'arena-tracks':'arena-galleries';
    if(this.base.background.texture.key!==texture)this.base.background.setTexture(texture);
    const hint = run.wavePhase === 'preparing' ? 'PRÉPARE-TOI · VAGUE ' + run.waveNumber :
      run.wavePhase === 'collecting' ? 'VAGUE NETTOYÉE · RÉCUPÉRATION…' : 'ARRÊTE-TOI POUR TIRER · BOUGE POUR ESQUIVER';
    if (this.base.hint.text !== hint) this.base.hint.setText(hint);
    const bosses = run.enemies.filter(enemy => enemy.kind === 'boss' && enemy.alive);
    this.warning.clear(); this.bossHealth.clear();if(run.forge)drawForge(this.warning,run,this.chauffeurPlate.draw,this.scorifierTrail);else if(run.depths)drawDepths(this.warning,run);else if(run.rift)drawRift(this.warning,run,this.cracheurGas.draw);else drawShaftHazards(this.warning,run);
    for (const [index,boss] of bosses.entries()) {
      drawRailBoss(this.warning,boss);
      const width=300/bosses.length-8,x=75+index*300/bosses.length;
      const color=BOSS_SPECS[boss.bossId||'haveuse'].color;
      this.bossHealth.fillStyle(0x121b20, .9).fillRect(x, 126, width, 5);
      this.bossHealth.fillStyle(color).fillRect(x, 126, width * boss.hp / boss.maxHealth, 5);
      for(const zone of boss.zones||[]) {
        const active=boss.phase==='recovery';
        dangerCircle(this.warning,zone.x,zone.y,zone.radius,active);
      }
      if ((!boss.bossId || boss.bossId==='haveuse') && (boss.phase === 'warning' || boss.phase === 'charge')) {
        const dx = Math.cos(boss.chargeAngle) * HAVEUSE.chargeSpeed * HAVEUSE.chargeSeconds;
        const dy = Math.sin(boss.chargeAngle) * HAVEUSE.chargeSpeed * HAVEUSE.chargeSeconds;
        // Clip the warning to the same arena boundaries as the machine.
        const tx = dx > 0 ? (392 - boss.x) / dx : dx < 0 ? (58 - boss.x) / dx : Infinity;
        const ty = dy > 0 ? (636 - boss.y) / dy : dy < 0 ? (146 - boss.y) / dy : Infinity;
        const t = Math.max(0, Math.min(1, tx, ty));
        const x = boss.x + dx * t, y = boss.y + dy * t;
        dangerLane(this.warning,boss.x,boss.y,x,y,HAVEUSE.radius,boss.phase==='charge');
      }
    }
  }
}
