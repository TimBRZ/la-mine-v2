// V0.5 comparison fixture retained for existing regressions, never shipped.
import { STOP_SETTLE_SECONDS } from '../src/stationary-fire.js';
export class LegacyFire {
  constructor(mode = 'A') { this.setMode(mode); }
  setMode(mode) { this.mode = mode; this.releasedFor = 0; }
  reset() { this.releasedFor = 0; }
  update(dt, player, input) {
    this.releasedFor = input.x || input.y ? 0 : this.releasedFor + dt;
    return this.mode === 'A' || (!input.x && !input.y && player.vx === 0 && player.vy === 0 && this.releasedFor >= STOP_SETTLE_SECONDS);
  }
}
