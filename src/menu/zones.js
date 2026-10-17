import { zoneAvailable, zoneCompleted } from '../zone-progress.js';
import { kitImage } from './kit.js';
import { zoneIllustration, uiIcon } from './art.js';
import { ZONES } from './state.js';

export function zonesView(onLaunch, progress, selectedZone) {
  const view = document.createElement('section');
  view.className = 'zones-view';
  view.setAttribute('aria-label', 'Carte des zones');
  view.innerHTML = '<header><p class="menu-eyebrow">PLUS BAS, PLUS LOIN</p><h2>LA DESCENTE</h2><p>Ta première expédition commence ici.</p></header><div class="zone-track"></div>';
  const track = view.querySelector('.zone-track');
  for (const [index, zone] of ZONES.entries()) {
    if(zone.id==='future7'&&!zoneCompleted('forge',progress))continue;
    const card = document.createElement('article');
    card.dataset.zone = zone.id;
    const available=zone.playable && zoneAvailable(zone.id,progress), completed=zoneCompleted(zone.id,progress);
    if(zone.id===selectedZone)card.setAttribute('aria-label',zone.name+' · Dernière zone jouée');
    card.className = 'zone-stop' + (available ? ' available' : ' locked');
    card.innerHTML = `<span class="depth-marker">${zone.depth}</span>${index === 0 ? kitImage('galeries', 'zone-art') : index === 1 && !available ? kitImage('galeries-locked', 'zone-art') : zoneIllustration(index)}<div class="zone-panel"><span class="zone-number">ZONE ${index+1} · ${completed ? 'TERMINÉE' : available ? 'DISPONIBLE' : 'VERROUILLÉE'}</span><h3>${zone.name}</h3><p>${available ? zone.detail : zone.id==='tracks' ? 'Termine LES GALERIES pour débloquer cette zone.' : zone.id==='shaft59' ? 'Termine LES VOIES ABANDONNÉES pour débloquer cette zone.' : zone.id==='rift' ? 'Termine LE PUITS 59 pour débloquer cette zone.' : zone.id==='depths' ? 'Termine LA FAILLE DE GRISOU pour débloquer cette zone.' : zone.id==='forge' ? 'Termine LES PROFONDEURS NOIRES pour débloquer cette zone.' : 'À venir'}</p></div>`;
    if (available) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'menu-primary'; button.textContent = 'JOUER';
      button.setAttribute('aria-label', 'JOUER · ' + zone.name);
      button.onclick = () => onLaunch(zone.id);
      card.querySelector('.zone-panel').append(button);
    } else {
      const lock = document.createElement('span');
      lock.className = 'zone-lock'; lock.setAttribute('aria-hidden', 'true');
      lock.innerHTML = uiIcon('lock');
      card.querySelector('.zone-panel').append(lock);
    }
    track.append(card);
  }
  return view;
}
