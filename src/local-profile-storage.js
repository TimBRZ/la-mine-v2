import { sanitizeCrates } from './crates.js';
import {sanitizeContracts} from './contracts.js';
import { sanitizeProgress } from './zone-progress.js';
import { sanitizeTalents } from './talents.js';
import { emptyWallet } from './resources.js';
import { emptyLevels, MAX_LEVEL } from './permanent-upgrades.js';
import { validTimestamp } from './relief.js';

export const STORAGE_KEY = 'la-mine-v2:prototype-meta:v1';
export const MAX_RESOURCE = 999999;
export const emptyProfile = () => ({ version: 1, wallet: emptyWallet(), levels: emptyLevels() });
const bounded = (value, maximum) => Number.isSafeInteger(value) && value >= 0 ? Math.min(value, maximum) : 0;
export function sanitizeProfile(value) {
  const result = emptyProfile();
  if (!value || value.version !== 1) return result;
  for (const id of Object.keys(result.wallet)) result.wallet[id] = bounded(value.wallet?.[id], MAX_RESOURCE);
  for (const id of Object.keys(result.levels)) result.levels[id] = bounded(value.levels?.[id], MAX_LEVEL);
  // Optional extension of v1: old wallets and upgrade levels stay intact.
  if (validTimestamp(value.relief?.startedAt)) result.relief = { startedAt: value.relief.startedAt };
  if (value.talents !== undefined) result.talents = sanitizeTalents(value.talents);
  if (value.crates !== undefined) result.crates = sanitizeCrates(value.crates);
  if (value.progress !== undefined) result.progress = sanitizeProgress(value.progress);
  if (value.contracts !== undefined) result.contracts = sanitizeContracts(value.contracts);
  return result;
}
export class LocalProfileStorage {
  constructor(storage) {
    try { this.storage = storage === undefined ? window.localStorage : storage; }
    catch { this.storage = null; }
    this.available = Boolean(this.storage);
  }
  read() {
    try {
      if (!this.storage) return emptyProfile();
      const raw = this.storage.getItem(STORAGE_KEY);
      const profile = raw ? sanitizeProfile(JSON.parse(raw)) : emptyProfile();
      this.available = true;
      return profile;
    } catch { this.available = false; return emptyProfile(); }
  }
  write(profile) {
    try {
      if (!this.storage) return this.available = false;
      this.storage.setItem(STORAGE_KEY, JSON.stringify(sanitizeProfile(profile)));
      return this.available = true;
    } catch { return this.available = false; }
  }
}
