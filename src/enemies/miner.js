import { Enemy } from '../enemy.js';
import { MINER } from './stats.js';
export class FiredampMiner extends Enemy {
  constructor(id, x, y) { super(id, x, y, MINER); this.kind = 'miner'; }
}
