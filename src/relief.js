// Wall-clock production: no timer, backend or gameplay dependency.
export const RELIEF = Object.freeze({ coalPerHour: 12, ironPerHour: 1, maxHours: 24 });
export const HOUR_MS = 60 * 60 * 1000;
export const validTimestamp = value => Number.isSafeInteger(value) && value >= 0 && value <= 8640000000000000;
export function reliefStock(startedAt, now) {
  const elapsedMs = validTimestamp(startedAt) && validTimestamp(now)
    ? Math.min(RELIEF.maxHours * HOUR_MS, Math.max(0, now - startedAt)) : 0;
  const gains = {
    coal: Math.floor(elapsedMs * RELIEF.coalPerHour / HOUR_MS),
    iron: Math.floor(elapsedMs * RELIEF.ironPerHour / HOUR_MS),
    diamond: 0, token: 0,
  };
  return { elapsedMs, gains, available: gains.coal > 0 || gains.iron > 0, full: elapsedMs === RELIEF.maxHours * HOUR_MS };
}
export function reliefTime(elapsedMs) {
  const minutes = Math.floor(elapsedMs / 60000);
  return `${String(Math.floor(minutes / 60)).padStart(2,'0')} h ${String(minutes % 60).padStart(2,'0')}`;
}
