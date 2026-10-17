// Official V0.6 firing rule. Braking and the short settling delay overlap.
export const STOP_SETTLE_SECONDS = .06;
export class StationaryFire {
  constructor() { this.settleScale=1; this.reset(); }
  reset() { this.releasedFor = 0; }
  update(dt, player, input) {
    this.releasedFor = input.x || input.y ? 0 : this.releasedFor + dt;
    return !input.x && !input.y && player.vx === 0 && player.vy === 0 && this.releasedFor >= STOP_SETTLE_SECONDS * this.settleScale;
  }
}
