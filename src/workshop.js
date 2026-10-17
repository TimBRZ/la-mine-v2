import { uiIcon, decorateResources, workbenchArt } from './menu/art.js';
import { RESOURCES, resourceList } from './resources.js';
import { PERMANENT_UPGRADES, MAX_LEVEL, upgradeCost } from './permanent-upgrades.js';

export class Workshop {
  constructor(host, wallet, onClose) {
    this.wallet = wallet;
    this.onClose = onClose;
    this.closeLabel = 'RETOUR À LA DESCENTE';
    this.element = document.createElement('section');
    this.element.className = 'workshop';
    this.element.hidden = true;
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-label', 'Atelier');
    host.append(this.element);
    this.keydown = event => {
      if (this.element.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); this.close(); }
      if (event.key === 'Tab') {
        const buttons = [...this.element.querySelectorAll('button:not(:disabled)')];
        const first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    this.element.addEventListener('keydown', this.keydown);
  }
  show() { this.render(); this.element.hidden = false; this.element.scrollTop = 0; this.element.querySelector('button:not(:disabled)').focus({ preventScroll: true }); }
  close() { this.element.hidden = true; this.onClose(); }
  render(message = '') {
    const { wallet, levels } = this.wallet.snapshot;
    this.element.innerHTML = '<header><p class="eyebrow">C2G · OUTILLAGE PERMANENT</p><h2>ATELIER</h2><p>Petits bonus. Dès ta prochaine descente.</p></header>';
    this.element.querySelector('header').insertAdjacentHTML('beforeend', workbenchArt());
    this.element.append(decorateResources(resourceList(wallet)));
    const list = document.createElement('div');
    list.className = 'workshop-upgrades';
    for (const upgrade of PERMANENT_UPGRADES) {
      const level = levels[upgrade.id], cost = upgradeCost(level);
      const card = document.createElement('article');
      card.dataset.station = upgrade.id;
      const emblem = document.createElement('div');
      emblem.className = 'station-emblem'; emblem.innerHTML = uiIcon(upgrade.id);
      const ranks = document.createElement('div'); ranks.className = 'station-ranks';
      ranks.setAttribute('aria-hidden', 'true');
      ranks.innerHTML = Array.from({length:MAX_LEVEL}, (_, i) => `<i class="${i < level ? 'filled' : ''}"></i>`).join('');
      const title = document.createElement('h3');
      title.textContent = upgrade.name + ' · ' + level + '/' + MAX_LEVEL;
      const description = document.createElement('p');
      description.textContent = upgrade.description;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.upgrade = upgrade.id;
      button.textContent = cost ? RESOURCES.filter(({ id }) => cost[id]).map(({ id, name }) => cost[id] + ' ' + name).join(' + ') : 'NIVEAU MAXIMUM';
      button.setAttribute('aria-label', cost ? 'Améliorer ' + upgrade.name + ' : ' + button.textContent : upgrade.name + ' au maximum');
      button.disabled = !this.wallet.canBuy(upgrade.id);
      button.onclick = () => {
        if (!this.wallet.buy(upgrade.id)) return;
        this.render(upgrade.name + ' améliorée. Bonus actif à la prochaine run.');
        const next = this.element.querySelector('[data-upgrade="' + upgrade.id + '"]');
        (next.disabled ? this.element.querySelector('.workshop-close') : next).focus({ preventScroll: true });
      };
      card.append(emblem, title, ranks, description, button); list.append(card);
    }
    this.element.append(list);
    const status = document.createElement('p');
    status.className = 'workshop-status';
    status.setAttribute('role', 'status');
    status.textContent = message || 'Jetons Grisou : échangeables contre une Caisse du Mineur sur la page Caisses.';
    const save = document.createElement('p');
    save.className = 'meta-save';
    save.textContent = this.wallet.saved ? 'Sauvegarde locale · ce navigateur uniquement' : 'Stockage indisponible : progression conservée uniquement jusqu’au rechargement.';
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'workshop-close'; close.textContent = this.closeLabel; close.onclick = () => this.close();
    this.element.append(status, save, close);
  }
  destroy() { this.element.removeEventListener('keydown', this.keydown); this.element.remove(); }
}
