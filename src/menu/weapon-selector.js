import { WEAPONS } from '../weapons.js';
import { kitImage } from './kit.js';

export function weaponSelector(selected, onSelect) {
  const section = document.createElement('section');
  section.className = 'home-weapons';
  section.setAttribute('aria-label', 'Choix de l’arme');
  section.innerHTML = '<div class="weapon-caption"><span>TON ARME</span><strong>PRÊT POUR LA DESCENTE</strong></div><div class="home-weapon-buttons"></div>';
  for (const weapon of Object.values(WEAPONS)) {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.weapon = weapon.id;
    button.setAttribute('aria-label', weapon.name);
    button.setAttribute('aria-pressed', String(weapon.id === selected));
    button.innerHTML = `<i class="equipped-marker" aria-hidden="true">✓</i>${kitImage(weapon.id, 'kit-weapon')}<span>${weapon.name}</span><small class="equipment-status">${weapon.id === selected ? 'ÉQUIPÉ' : 'ÉQUIPER'}</small>`;
    button.onclick = () => onSelect(weapon.id);
    section.querySelector('.home-weapon-buttons').append(button);
  }
  return section;
}
