import { drawRoom } from './textures.js';
import { EXIT, TRANSITION_SECONDS } from './rooms.js';
import { HAVEUSE } from './boss.js';

export class RoomView {
  constructor(scene) {
    this.scene = scene;
    this.base = drawRoom(scene);
    this.details = scene.add.graphics().setDepth(-5);
    this.door = scene.add.graphics().setDepth(1);
    this.doorLabel = scene.add.text(225, 636, '', { fontFamily: 'system-ui', fontSize: '10px', fontStyle: 'bold', color: '#98ead0' }).setOrigin(.5).setDepth(2);
    this.warning = scene.add.graphics().setDepth(8);
    this.bossHealth = scene.add.graphics().setDepth(60);
    this.fade = scene.add.rectangle(225, 400, 450, 800, 0x080f12).setDepth(90).setAlpha(0);
    this.descending = scene.add.text(225, 370, 'DESCENTE…', { fontFamily: 'system-ui', fontSize: '23px', fontStyle: 'bold', color: '#edc681' }).setOrigin(.5).setDepth(91).setVisible(false);
  }
  change(run) {
    const room = run.room, g = this.details;
    this.base.label.setText(room.name);
    this.base.hint.setText('ARRÊTE-TOI POUR TIRER · BOUGE POUR ESQUIVER');
    g.clear();
    g.fillStyle(room.color, .65).fillRect(28, 116, 394, 550);
    // Wall decor and floor markings only: a consistently clear movement area.
    if (room.id === 'gallery') {
      for (const y of [190, 340, 490]) {
        g.fillStyle(0x756444).fillRect(17, y, 10, 12).fillRect(423, y, 10, 12);
        g.fillStyle(room.accent, .22).fillCircle(35, y + 6, 15).fillCircle(415, y + 6, 15);
      }
    } else if (room.id === 'rails') {
      g.lineStyle(3, 0x65716d, .5);
      for (const x of [140, 157, 293, 310]) g.lineBetween(x, 128, x, 600);
      for (let y = 140; y < 600; y += 35) {
        g.lineStyle(3, 0x917555, .3).lineBetween(134, y, 163, y).lineBetween(287, y, 316, y);
      }
      g.fillStyle(0x726555).fillRoundedRect(2, 275, 21, 58, 4).fillRoundedRect(427, 420, 21, 58, 4);
    } else if (room.id === 'pipes') {
      g.lineStyle(7, 0x658a8b, .7).lineBetween(20, 140, 20, 630).lineBetween(430, 140, 430, 630);
      for (const y of [210, 350, 490]) g.lineStyle(3, room.accent, .6).strokeCircle(20, y, 9).strokeCircle(430, y, 9);
      g.lineStyle(1, room.accent, .12);
      for (let y = 180; y < 620; y += 90) g.lineBetween(95, y, 355, y);
    } else if (room.id === 'danger') {
      for (const y of [160, 310, 460, 600]) {
        g.fillStyle(room.accent, .13).fillCircle(35, y, 22).fillCircle(415, y, 22);
        g.fillStyle(room.accent).fillRect(19, y - 4, 7, 8).fillRect(424, y - 4, 7, 8);
      }
      g.lineStyle(2, 0x11191d, .7).lineBetween(125, 170, 160, 205).lineBetween(160, 205, 145, 235);
    } else {
      g.lineStyle(3, room.accent, .23).strokeCircle(225, 340, 110).strokeCircle(225, 340, 96);
      for (let x = 65; x <= 385; x += 40) g.fillStyle(room.accent, .4).fillRect(x, 124, 18, 4);
      g.fillStyle(0x151d20).fillRect(40, 140, 42, 25).fillRect(368, 140, 42, 25);
    }
    this.doorState = null;
  }
  update(run) {
    const state = run.room.boss ? 'none' : run.exitOpen ? 'open' : run.roomPhase === 'collecting' ? 'collecting' : 'locked';
    if (state !== this.doorState) {
      this.doorState = state; this.door.clear();
      if (state !== 'none') {
        this.door.fillStyle(state === 'open' ? 0x214c43 : 0x20282a).fillRoundedRect(EXIT.x, EXIT.y, EXIT.width, EXIT.height, 4);
        this.door.lineStyle(2, state === 'open' ? 0x8de1bf : 0x5b6462).strokeRoundedRect(EXIT.x, EXIT.y, EXIT.width, EXIT.height, 4);
        this.doorLabel.setText(state === 'open' ? 'DESCENDRE ↓' : state === 'collecting' ? 'RÉCUPÉRATION…' : 'FERMÉ').setColor(state === 'open' ? '#98ead0' : '#6e7b78');
      } else this.doorLabel.setText('');
      this.base.hint.setText(state === 'open' ? 'SALLE NETTOYÉE · REJOINS LA SORTIE ↓' : 'ARRÊTE-TOI POUR TIRER · BOUGE POUR ESQUIVER');
    }
    const boss = run.enemies.find(enemy => enemy.kind === 'boss' && enemy.alive);
    this.warning.clear(); this.bossHealth.clear();
    if (boss) {
      this.bossHealth.fillStyle(0x121b20, .9).fillRect(125, 103, 200, 5);
      this.bossHealth.fillStyle(0xe6b65b).fillRect(125, 103, 200 * boss.hp / boss.maxHealth, 5);
      if (boss.phase === 'warning' || boss.phase === 'charge') {
        const dx = Math.cos(boss.chargeAngle) * HAVEUSE.chargeSpeed * HAVEUSE.chargeSeconds;
        const dy = Math.sin(boss.chargeAngle) * HAVEUSE.chargeSpeed * HAVEUSE.chargeSeconds;
        // Clip the warning to the same room boundaries as the machine.
        const tx = dx > 0 ? (392 - boss.x) / dx : dx < 0 ? (58 - boss.x) / dx : Infinity;
        const ty = dy > 0 ? (636 - boss.y) / dy : dy < 0 ? (146 - boss.y) / dy : Infinity;
        const t = Math.max(0, Math.min(1, tx, ty));
        const x = boss.x + dx * t, y = boss.y + dy * t;
        this.warning.lineStyle(60, 0xf0a04c, boss.phase === 'warning' ? .18 : .09).lineBetween(boss.x, boss.y, x, y);
        this.warning.lineStyle(2, 0xffce77, .8).lineBetween(boss.x, boss.y, x, y);
      }
    }
    const progress = 1 - run.transitionRemaining / TRANSITION_SECONDS;
    const alpha = run.roomPhase === 'transition' ? Math.min(1, progress * 2.5) :
      run.roomIndex > 0 ? Math.max(0, 1 - run.roomElapsed / .22) : 0;
    this.fade.setAlpha(alpha);
    this.descending.setVisible(run.roomPhase === 'transition').setAlpha(alpha);
  }
}
