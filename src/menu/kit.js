import { WEAPONS } from '../weapons.js';

// Presentation only: local assets cannot change equipment or wallet state.
export const KIT_ROOT = './src/assets/kit-da/';
export function kitImage(name, className = 'kit-icon') {
  if (!/^[a-z-]+$/.test(name)) throw new RangeError('Invalid asset name');
  return `<img class="${className}" src="${name==='grisoux'?'./src/assets/combat-v020/grisoux.svg':KIT_ROOT+name+'.svg'}" alt="" aria-hidden="true" decoding="async">`;
}
export function heroPresentation(id) {
  if (!Object.hasOwn(WEAPONS, id)) throw new RangeError('Unknown weapon');
  return `<div class="hero-presentation" role="img" aria-label="Mineur équipé : ${WEAPONS[id].name}"><img class="kit-miner" src="${KIT_ROOT}miner.webp" width="400" height="600" alt="" fetchpriority="high"><div class="hero-loadout">${kitImage(id, 'rack-weapon')}<span>ÉQUIPÉ</span></div></div>`;
}
