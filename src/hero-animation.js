// V0.33 presentation only. No combat or Phaser dependency, timers are visual seconds.
export const HERO_SHEET = Object.freeze({
  key: 'combat-v033-hero-sheet', url: './src/assets/combat-v033/hero-sheet.svg',
  width: 640, height: 512, frameWidth: 128, frameHeight: 128, columns: 5, frames: 20,
});
const clip = (first, count, fps, loop = false) => Object.freeze({ first, count, fps, loop });
export const HERO_CLIPS = Object.freeze({
  idle: clip(0, 4, 4, true), run: clip(4, 6, 12, true),
  shoot: clip(10, 3, 20), hit: clip(13, 2, 16), death: clip(15, 5, 9),
});

export function preloadHeroAnimation(scene) {
  scene.load.svg(HERO_SHEET.key, HERO_SHEET.url, { width: HERO_SHEET.width, height: HERO_SHEET.height });
}

// SVG is rasterized once by the existing Phaser loader; frames share one texture.
export function registerHeroFrames(textures) {
  if (!textures?.exists(HERO_SHEET.key)) return false;
  const texture = textures.get(HERO_SHEET.key);
  const source = texture?.getSourceImage?.();
  if (source?.width !== HERO_SHEET.width || source?.height !== HERO_SHEET.height) return false;
  for (let i = 0; i < HERO_SHEET.frames; i++) {
    const x = i % HERO_SHEET.columns * HERO_SHEET.frameWidth;
    const y = Math.floor(i / HERO_SHEET.columns) * HERO_SHEET.frameHeight;
    if (!texture.has(i)) texture.add(i, 0, x, y, HERO_SHEET.frameWidth, HERO_SHEET.frameHeight);
    const frame = texture.get(i);
    if (frame?.cutX !== x || frame?.cutY !== y || frame?.cutWidth !== 128 || frame?.cutHeight !== 128) return false;
  }
  return true;
}

export function createHeroAnimationState() {
  return { state: 'idle', elapsed: 0, frame: 0, finished: false };
}

// shot/hit are one-render pulses from actual events; animation never schedules a shot.
export function advanceHeroAnimation(state, input = {}, dt = 0, reducedMotion = false) {
  const seconds = Number.isFinite(dt) ? Math.max(0, Math.min(dt, .1)) : 0;
  const current = HERO_CLIPS[state.state] || HERO_CLIPS.idle;
  const ended = state.elapsed >= current.count / current.fps;
  let next = state.state;
  if (input.dead || state.state === 'death') next = 'death';
  else if (input.hit) next = 'hit';
  else if (state.state === 'hit' && !ended) next = 'hit';
  else if (input.moving) next = 'run';
  else if (input.shot) next = 'shoot';
  else if (state.state === 'shoot' && !ended) next = 'shoot';
  else next = 'idle';
  const restart = next !== state.state || (next === 'shoot' && input.shot) || (next === 'hit' && input.hit);
  state.state = next;
  state.elapsed = restart ? 0 : state.elapsed + seconds;
  const active = HERO_CLIPS[next];
  const step = Math.floor(state.elapsed * active.fps + 1e-8);
  state.finished = !active.loop && step >= active.count;
  const offset = active.loop ? step % active.count : Math.min(active.count - 1, step);
  state.frame = active.first + (reducedMotion ? next === 'death' ? active.count - 1 : 0 : offset);
  return state;
}

// Registration is intentionally separate (once during create). Invalid/missing sheet
// leaves the legacy texture untouched, and never changes image pivot/scale/position.
export function applyHeroAnimation(image, textures, state, input, dt, reducedMotion = false) {
  const pose = advanceHeroAnimation(state, input, dt, reducedMotion);
  if (!textures?.exists(HERO_SHEET.key)) return null;
  const texture = textures.get(HERO_SHEET.key);
  if (!texture?.has(pose.frame)) return null;
  const frame = texture.get(pose.frame);
  if (frame?.cutWidth !== 128 || frame?.cutHeight !== 128) return null;
  image.setTexture(HERO_SHEET.key, pose.frame);
  return pose;
}
