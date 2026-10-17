import { clamp, stickVector } from './math.js';

export class MovementInput {
  constructor(scene, enabled) {
    this.scene = scene;
    this.enabled = enabled;
    this.pointerId = null;
    this.vector = { x: 0, y: 0 };
    this.keys = scene.input.keyboard.addKeys('W,A,S,D,Z,Q,UP,DOWN,LEFT,RIGHT');
    this.base = scene.add.circle(225, 719, 36, 0x86ddc2, .035).setStrokeStyle(1.5, 0x86ddc2, .2).setDepth(200);
    this.knob = scene.add.circle(225, 719, 13, 0x86ddc2, .15).setDepth(201);
    this.down = pointer => {
      if (!enabled() || this.pointerId !== null || pointer.y < 100) return;
      this.pointerId = pointer.id;
      this.origin = { x: pointer.x, y: pointer.y };
      this.base.setPosition(pointer.x, pointer.y).setRadius(44).setAlpha(1);
      this.knob.setPosition(pointer.x, pointer.y).setFillStyle(0x9de5cf, .65);
    };
    this.move = pointer => {
      if (pointer.id !== this.pointerId) return;
      const dx = pointer.x - this.origin.x, dy = pointer.y - this.origin.y;
      const distance = Math.hypot(dx, dy) || 1;
      this.vector = stickVector(dx, dy);
      this.knob.setPosition(this.origin.x + dx * Math.min(1, 44 / distance), this.origin.y + dy * Math.min(1, 44 / distance));
    };
    this.up = pointer => { if (pointer.id === this.pointerId) this.reset(); };
    this.cancel = () => this.reset();
    scene.input.on('pointerdown', this.down);
    scene.input.on('pointermove', this.move);
    scene.input.on('pointerup', this.up);
    scene.input.on('pointerupoutside', this.up);
    scene.input.on('gameout', this.cancel);
    scene.game.canvas.addEventListener('touchcancel', this.cancel);
  }
  read() {
    const k = this.keys;
    const x = Number(k.D.isDown || k.RIGHT.isDown) - Number(k.A.isDown || k.Q.isDown || k.LEFT.isDown);
    const y = Number(k.S.isDown || k.DOWN.isDown) - Number(k.W.isDown || k.Z.isDown || k.UP.isDown);
    if (x || y) return { x, y };
    return { x: clamp(this.vector.x, -1, 1), y: clamp(this.vector.y, -1, 1) };
  }
  reset() {
    this.pointerId = null;
    this.vector = { x: 0, y: 0 };
    this.base.setPosition(225, 719).setRadius(36);
    this.knob.setPosition(225, 719).setFillStyle(0x86ddc2, .15);
  }
  clear() { this.reset(); this.scene.input.keyboard.resetKeys(); }
  destroy() {
    this.scene.input.off('pointerdown', this.down).off('pointermove', this.move).off('pointerup', this.up)
      .off('pointerupoutside', this.up).off('gameout', this.cancel);
    this.scene.game.canvas.removeEventListener('touchcancel', this.cancel);
  }
}
