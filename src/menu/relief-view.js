import { RELIEF, reliefTime } from '../relief.js';
import { kitImage } from './kit.js';

export function reliefView(wallet, onClaim, now = () => Date.now()) {
  const element = document.createElement('section');
  element.className = 'relief-view';
  element.setAttribute('aria-label', 'La Relève');
  element.innerHTML = `<header><p class="menu-eyebrow">L’ÉQUIPE DE FOND</p><h2>LA RELÈVE</h2><p>Pendant ton absence, l’équipe de fond continue le travail.</p></header>
    <div class="relief-scene" aria-hidden="true"></div>
    <div class="relief-clock"><span>Temps de travail accumulé</span><strong data-relief="time"></strong><small>Capacité maximale : ${RELIEF.maxHours} h</small></div>
    <p class="relief-rates">${RELIEF.coalPerHour} Charbon / h <span>·</span> ${RELIEF.ironPerHour} Fer / h</p>
    <div class="relief-stock"><h3>À RÉCUPÉRER</h3><div>${kitImage('coal')}<strong data-relief="coal"></strong><span>Charbon</span></div><div>${kitImage('iron')}<strong data-relief="iron"></strong><span>Fer</span></div></div>
    <button class="menu-primary relief-claim" type="button">RÉCUPÉRER</button>
    <p class="relief-notice" role="status" aria-live="polite"></p>
    <p class="relief-ravens"><b>CONTREMAÎTRE RAVENS</b><span data-relief="ravens"></span></p>
    <p class="relief-save"></p>`;
  const claim = element.querySelector('.relief-claim');
  const notice = element.querySelector('.relief-notice');
  let claimed = false;
  function refresh() {
    const stock = wallet.reliefState(now());
    for (const key of ['coal','iron']) element.querySelector(`[data-relief="${key}"]`).textContent = stock.gains[key];
    element.querySelector('[data-relief="time"]').textContent = reliefTime(stock.elapsedMs);
    claim.disabled = !stock.available;
    if (!claimed) notice.textContent = stock.full ? 'Stock plein : l’équipe attend la récupération.' : stock.available ? 'Les gains attendent ici. À toi de les récupérer.' : 'L’équipe reprend le travail. Premier Charbon après 5 min.';
    element.querySelector('[data-relief="ravens"]').textContent = claimed ? '« Allez, retourne tout dépenser. »' : stock.full ? '« La relève a pas chômé. »' : '« T’étais pas là, mais eux oui. »';
    element.querySelector('.relief-save').textContent = wallet.saved ? 'Sauvegarde locale · gains entiers · nouvelle période après récupération.' : 'Sauvegarde indisponible : récupération suspendue tant que le navigateur ne peut pas enregistrer.';
  }
  claim.onclick = () => {
    const result = wallet.claimRelief(now());
    claimed = result.ok;
    refresh(); onClaim();
    if (result.ok) {
      notice.textContent = `Récupéré : +${result.gains.coal} Charbon · +${result.gains.iron} Fer.`;
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.querySelector('.relief-stock').animate([{ transform:'translateY(0)',opacity:1 },{ transform:'translateY(-5px)',opacity:.6 },{ transform:'translateY(0)',opacity:1 }],{duration:250});
      }
    } else {
      notice.textContent = ({storage:'Impossible d’enregistrer. Ton stock reste disponible : réessaie.',full:'Portefeuille plein. Utilise tes ressources avant de récupérer.',clock:'Horloge invalide : vérifie la date de ton appareil.',empty:'Aucune ressource à récupérer pour le moment.'})[result.reason];
    }
  };
  refresh();
  return { element, refresh };
}
