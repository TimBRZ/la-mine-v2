export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const approach = (value, target, amount) => value < target ? Math.min(value + amount, target) : Math.max(value - amount, target);
export function clampToRoom(body, room) {
  body.x = clamp(body.x, room.left + body.radius, room.right - body.radius);
  body.y = clamp(body.y, room.top + body.radius, room.bottom - body.radius);
}
// Earliest intersection on a movement segment: pellets cannot tunnel through a
// target during a slow frame, or hit an enemy hidden behind a nearer enemy.
export function segmentCircle(ax, ay, bx, by, cx, cy, radius) {
  const dx = bx - ax, dy = by - ay, ox = ax - cx, oy = ay - cy;
  const c = ox * ox + oy * oy - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy;
  if (a === 0) return null;
  const b = 2 * (ox * dx + oy * dy), discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;
  const t = (-b - Math.sqrt(discriminant)) / (2 * a);
  return t >= 0 && t <= 1 ? t : null;
}
export function stickVector(dx, dy, radius = 44, deadzone = 6) {
  const distance = Math.hypot(dx, dy);
  if (distance <= deadzone) return { x: 0, y: 0 };
  const strength = clamp((distance - deadzone) / (radius - deadzone), 0, 1);
  return { x: dx / distance * strength, y: dy / distance * strength };
}
