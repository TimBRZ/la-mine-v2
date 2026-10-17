import { upgradeCard } from './upgrade-card.js';
import { Ravens, RavensDialogue } from './ravens.js';

export class UpgradeOverlay {
  constructor(host, onChoose, onReroll) {
    this.dialogue = new RavensDialogue();
    this.onChoose = onChoose;
    this.element = document.createElement('section');
    this.element.className = 'porion-overlay';
    this.element.hidden = true;
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-labelledby', 'porion-title');
    this.element.innerHTML = '<header class="porion-heading"><p class="porion-kicker">C2G · ORDRE DU CONTREMAÎTRE</p><h2 id="porion-title">CHOIX DU<br><em>CONTREMAÎTRE</em></h2></header><div class="upgrade-cards"></div><footer class="porion-footer"><div class="porion-signature"><span>CONTREMAÎTRE RAVENS</span><p class="porion-quote"></p></div><div class="porion-portrait"></div></footer>';
    this.reroll=document.createElement('button');this.reroll.type='button';this.reroll.className='porion-reroll';
    this.reroll.onclick=()=>{if(this.active)onReroll?.();};
    this.element.querySelector('.upgrade-cards').after(this.reroll);
    this.quote = this.element.querySelector('.porion-quote');
    this.cards = this.element.querySelector('.upgrade-cards');
    this.ravens = new Ravens();
    this.element.querySelector('.porion-portrait').append(this.ravens.element);
    host.append(this.element);
    this.keydown = event => {
      if (!this.active) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); }
      if (event.key !== 'Tab') return;
      const buttons = [...this.element.querySelectorAll('button:not([disabled])')].filter(b=>!b.hidden);
      const index = buttons.indexOf(document.activeElement);
      event.preventDefault();
      buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
    };
    this.element.addEventListener('keydown', this.keydown);
  }
  show(options = {}, offered = []) {
    const epic=offered.some(item=>item.epic);
    this.element.classList.toggle('epic-choice',epic);
    this.element.querySelector('h2').innerHTML=epic?'CHOIX ÉPIQUE<br><em>DU CONTREMAÎTRE</em>':options.bonus?'BON DÉPART<br><em>CHOIX BONUS</em>':'CHOIX DU<br><em>CONTREMAÎTRE</em>';
    this.reroll.hidden=!options.rerollOwned;this.reroll.disabled=!options.rerollAvailable||epic;
    this.reroll.textContent=options.rerollUsed?'RELANCE UTILISÉE':epic?'RELANCE RÉSERVÉE AUX CHOIX NORMAUX':'RELANCER · 1 DISPONIBLE';
    this.cards.replaceChildren(...offered.map(upgrade => upgradeCard(upgrade, id => {
      if (!this.active) return;
      this.hide(); // latch before callback, which may open the extra initial choice
      if (this.onChoose(id) === false) { this.active=true;this.element.hidden=false; }
    })));
    this.active = true;
    this.quote.textContent = epic ? '« Là, j’te conseille de pas te tromper. »' : '« ' + this.dialogue.phrase(options.context) + ' »';
    this.ravens.show(epic || this.dialogue.appears(options));
    this.element.hidden = false;
    this.cards.querySelector('button').focus({ preventScroll: true });
  }
  hide() { this.active = false; this.element.hidden = true; }
  destroy() { this.element.removeEventListener('keydown', this.keydown); this.element.remove(); }
}
