import { PLAYER } from './config.js';
import { waveProgress } from './waves.js';
import { UPGRADES } from './upgrades.js';
import { EPIC_UPGRADES } from './epic-upgrades.js';
import { BOSS_SPECS } from './boss-catalog.js';
import { Ravens, RavensDialogue } from './ravens.js';
import { resourceList } from './resources.js';
import { Workshop } from './workshop.js';
import { perkReadouts } from './perk-feedback.js';

export class UI {
  constructor(onStart, onResume, wallet, onHome = onStart) {
    this.overlay = document.querySelector('#overlay');
    this.button = document.querySelector('#play');
    this.title = document.querySelector('#screen-title');
    this.copy = document.querySelector('#screen-copy');
    this.kicker = document.querySelector('#screen-kicker');
    this.foot = document.querySelector('#screen-foot');
    this.health = document.querySelector('.health');
    this.hearts = document.querySelector('#hearts');
    this.mode = 'intro';
    this.hp = -1;
    this.ravens = new Ravens();
    this.ravens.element.classList.add('result-ravens');
    const signature = document.createElement('figcaption');
    signature.className = 'result-ravens-quote';
    const speaker = document.createElement('span');
    speaker.textContent = 'CONTREMAÎTRE RAVENS';
    this.resultQuote = document.createElement('p');
    signature.append(speaker, this.resultQuote);
    this.ravens.element.prepend(signature);
    this.ravens.show(false);
    this.overlay.append(this.ravens.element);
    this.dialogue = new RavensDialogue();
    this.progress = document.createElement('small');
    this.progress.className = 'run-progress';
    this.progress.setAttribute('aria-live', 'polite');
    document.querySelector('.hud > div').append(this.progress);
    this.focusStatus=document.createElement('small');
    this.focusStatus.className='boss-focus';this.focusStatus.hidden=true;
    this.focusStatus.title='Focus de tir : impacts répétés sur le même boss. Une courte esquive le conserve ; un déplacement prolongé le dissipe.';
    document.querySelector('.hud').append(this.focusStatus);
    this.track = document.createElement('ol');
    this.track.className = 'wave-track';
    this.track.setAttribute('aria-label', 'Progression des vagues');
    document.querySelector('.shell').append(this.track);
    this.perkStatus = document.createElement('div');
    this.perkStatus.className = 'perk-status';
    this.perkStatus.setAttribute('aria-label', 'Perks de la run');
    document.querySelector('.shell').append(this.perkStatus);
    this.lootStatus = document.createElement('p');
    this.lootStatus.className = 'loot-status';
    this.lootStatus.hidden = true;
    document.querySelector('.shell').append(this.lootStatus);
    this.bossNotice = document.createElement('aside');
    this.bossNotice.className = 'boss-notice';
    this.bossNotice.hidden = true;
    this.bossNotice.innerHTML = '<strong>LA HAVEUSE</strong><div class="boss-ravens-quote"><span>CONTREMAÎTRE RAVENS</span><p></p></div><div class="boss-ravens-portrait"></div>';
    const bossRavens = new Ravens();
    bossRavens.element.classList.add('boss-ravens');
    this.bossNotice.querySelector('.boss-ravens-portrait').append(bossRavens.element);
    document.querySelector('.shell').append(this.bossNotice);
    this.hearts.replaceChildren(...Array.from({ length: PLAYER.health }, () => document.createElement('i')));
    this.updateHealth(PLAYER.health);
    this.button.disabled = false;
    this.button.textContent = 'JOUER';
    this.click = () => this.mode === 'paused' ? onResume() : onStart();
    this.button.addEventListener('click', this.click);
    this.homeButton = document.createElement('button');
    this.homeButton.type = 'button'; this.homeButton.className = 'result-home';
    this.homeButton.textContent = 'RETOUR À L’ACCUEIL'; this.homeButton.hidden = true;
    this.homeButton.onclick = onHome; this.button.after(this.homeButton);
    this.wallet = wallet;
    this.rewards = document.createElement('section');
    this.rewards.className = 'run-rewards';
    this.rewards.hidden = true;
    this.button.before(this.rewards);
    this.workshopButton = document.createElement('button');
    this.workshopButton.type = 'button';
    this.workshopButton.className = 'atelier-button';
    this.workshopButton.textContent = 'ATELIER';
    this.workshopButton.hidden = true;
    this.button.before(this.workshopButton);
    this.workshop = new Workshop(document.querySelector('.shell'), wallet, () => {
      if (this.workshopReturn) { const callback = this.workshopReturn; this.workshopReturn = null; callback(); return; }
      this.overlay.hidden = false;
      this.saveNotice.textContent = this.saveMessage();
      this.workshopButton.focus({ preventScroll: true });
    });
    this.workshopButton.onclick = () => this.openWorkshop();
    this.saveNotice = document.createElement('p');
    this.saveNotice.className = 'meta-save';
    this.rewards.append(this.saveNotice);
  }
  openWorkshop(onClose = null) {
    this.workshopReturn = onClose;
    this.overlay.hidden = true;
    this.workshop.closeLabel = onClose ? 'RETOUR AU MENU' : 'RETOUR À LA DESCENTE';
    this.workshop.show();
  }
  updateHealth(hp, maxHealth = PLAYER.health) {
    if (hp === this.hp && maxHealth === this.maxHealth) return;
    this.hp = hp;
    this.maxHealth = maxHealth;
    this.health.setAttribute('aria-valuenow', hp);
    this.health.setAttribute('aria-valuemax', maxHealth);
    this.health.querySelector('span').textContent = 'PV ' + Number(hp.toFixed(1)) + '/' + Number(maxHealth.toFixed(1));
    [...this.hearts.children].forEach((heart, i) => {
      const fill = Math.max(0, Math.min(1, hp / maxHealth * PLAYER.health - i)) * 100;
      heart.style.background = 'linear-gradient(to top, #86ddc2 ' + fill + '%, #354449 ' + fill + '%)';
    });
  }
  hide() {
    this.overlay.classList.remove('meta-result');
    this.rewards.hidden = this.workshopButton.hidden = this.homeButton.hidden = true;
    this.ravens.show(false);
    this.overlay.classList.remove('with-ravens');
    this.mode = 'playing';
    this.overlay.hidden = true;
    document.querySelector('canvas')?.focus({ preventScroll: true });
  }
  updateRun(run) {
    const focus=run.weapon.focus;
    const focusedBoss=focus&&run.enemies.find(e=>e.id===focus.targetId&&e.alive&&e.kind==='boss');
    const percent=Math.round((focus?.bonus||0)*100);
    this.focusStatus.hidden=!(focusedBoss&&percent&&run.status==='playing'&&run.wavePhase==='combat');
    const focusLabel='FOCUS +'+percent+' %';
    if(this.focusStatus.textContent!==focusLabel)this.focusStatus.textContent=focusLabel;
    if(!this.focusStatus.hidden)this.focusStatus.setAttribute('aria-label','Focus de tir sur '+(BOSS_SPECS[focusedBoss.bossId]?.name||'boss')+' : +'+percent+' % dégâts');
    const readouts = perkReadouts(run);
    const perksKey = JSON.stringify(readouts);
    if (perksKey !== this.perksKey) {
      this.perksKey = perksKey;
      this.perkStatus.replaceChildren(...readouts.map(item => {
        const chip = document.createElement('div');
        chip.dataset.perk = item.id;
        chip.title=item.title+' : '+item.detail;
        chip.setAttribute('aria-label',chip.title);
        const title = document.createElement('strong'), detail = document.createElement('span');
        title.textContent = item.title; detail.textContent = item.detail;
        chip.append(title, detail); return chip;
      }));
    }
    const label = 'VAGUE ' + run.waveNumber + ' / ' + run.world.waves.length;
    if (this.progress.textContent !== label) this.progress.textContent = label;
    const steps = waveProgress(run).filter(step=>step.boss);
    const trackKey = run.waveNumber + ':' + steps.map(step => step.state).join(',');
    if (this.trackKey !== trackKey) {
      this.trackKey = trackKey;
      this.track.dataset.progress=run.waveNumber + '/' + run.world.waves.length;
      this.track.replaceChildren(...steps.map(step => {
        const item = document.createElement('li');
        item.dataset.state = step.state;
        item.textContent = (step.state === 'done' ? '✓ ' : '') + step.number + (step.final ? ' FINAL' : ' ◆');
        item.setAttribute('aria-label', 'Vague ' + step.number + (step.final ? ' · Triple boss' : ' · Boss') + ' · ' + ({done:'terminée',active:'actuelle',future:'à venir'}[step.state]));
        if (step.state === 'active') item.setAttribute('aria-current', 'step');
        return item;
      }));
    }
    const collecting = run.wavePhase === 'collecting';
    this.lootStatus.hidden = !collecting && run.wavePhase !== 'combat';
    const amounts = run.loot.collected;
    const picked = Object.values(amounts).some(value => value > 0);
    const lootLabel = collecting ? 'VAGUE NETTOYÉE · RÉCUPÉRATION…' : picked ? 'BUTIN PROVISOIRE · VALIDÉ EN FIN DE VAGUE' : '';
    const numbers = picked ? `⬟ ${amounts.coal}   ▰ ${amounts.iron}   ◇ ${amounts.diamond}   ✦ ${amounts.token}` : '';
    const lootText = lootLabel + (numbers ? '\n' + numbers : '');
    if (this.lootStatus.textContent !== lootText) this.lootStatus.textContent = lootText;
    this.bossNotice.hidden = !(run.wave.boss && run.wavePhase === 'preparing' && run.status === 'playing');
    if(!this.bossNotice.hidden)this.bossNotice.querySelector('strong').textContent=run.wave.final?'LES TROIS MACHINES':BOSS_SPECS[run.wave.bosses[0]].name;
    if(!this.bossNotice.hidden&&BOSS_SPECS[run.wave.bosses[0]].quote)this.bossNotice.querySelector('p').textContent='« '+(run.wave.final?'Bon… là, ça sent le retard cumulé.':BOSS_SPECS[run.wave.bosses[0]].quote)+' »';
  }
  bossIntro() { this.bossNotice.querySelector('p').textContent = '« ' + this.dialogue.phrase('boss') + ' »'; }
  pause() {
    this.ravens.show(false);
    this.overlay.classList.remove('with-ravens');
    this.mode = 'paused';
    this.kicker.textContent = 'PAUSE';
    this.title.textContent = 'ON REPREND ?';
    this.copy.textContent = 'La vague t’attend. Aucun dégât pendant la pause.';
    this.foot.textContent = 'Bouge pour esquiver. Arrête-toi pour tirer.';
    this.button.textContent = 'REPRENDRE';
    this.overlay.hidden = false;
  }
  saveMessage() { return this.wallet.saved ? 'Gains conservés · sauvegarde locale navigateur' : 'Stockage indisponible : gains perdus au rechargement.'; }
  result(run, gains) {
    this.mode = 'result';
    const total=run.world.waves.length;
    this.kicker.textContent = run.world.name + ' · ' + (run.status === 'won' ? `${total} / ${total} VAGUES` : `VAGUE ATTEINTE · ${run.waveNumber} / ${total}`);
    this.title.textContent = run.status === 'won' ? 'MONDE TERMINÉ.' : 'DESCENTE ÉCHOUÉE.';
    const context = gains.token ? 'token' : gains.diamond ? 'diamond' : gains.coal >= 64 ? 'haul' : run.status === 'won' ? 'victory' : 'death';
    this.resultQuote.textContent = '« ' + this.dialogue.phrase(context) + ' »';
    this.ravens.show(true);
    this.overlay.classList.add('with-ravens');
    const perks = [...UPGRADES,...EPIC_UPGRADES].filter(item => run.upgradeRanks[item.id]).map(item => item.title + ' ×' + run.upgradeRanks[item.id]).join(' · ');
    this.foot.textContent = `${run.completedWaves} vagues terminées · ${run.kills} ennemis · ${Math.round(run.elapsed)} s · ${Number(run.damageTaken.toFixed(1))} dégâts subis\n${perks || 'Aucun perk'}`;
    this.overlay.classList.add('meta-result');
    this.rewards.hidden = this.workshopButton.hidden = this.homeButton.hidden = false;
    const heading = document.createElement('h2');
    heading.textContent = 'RÉCOMPENSES';
    this.saveNotice.textContent = this.saveMessage();
    this.rewards.replaceChildren(heading, resourceList(gains, true), this.saveNotice);
    if(this.wallet.zoneClaims.get(run)?.firstDiamond) {
      const notice=document.createElement('p');notice.className='crate-award first-victory';
      const amount=this.wallet.zoneClaims.get(run).firstDiamond;
      notice.textContent=`PREMIÈRE VICTOIRE · +${amount} Diamant${amount>1?'s':''}`;this.rewards.append(notice);
    }
    const crates=this.wallet.crateClaims.get(run);
    if(crates?.daily||crates?.bonus) {
      const notice=document.createElement('p');notice.className='crate-award';
      notice.textContent=[crates.daily?'Première victoire du jour : +1 Caisse du Mineur':'',crates.bonus?'Bonus victoire : +1 Caisse du Mineur':''].filter(Boolean).join(' · ');
      this.rewards.append(notice);
    }
    this.button.textContent = 'REJOUER';
    this.overlay.hidden = false;
    this.button.focus({ preventScroll: true });
  }
  destroy() { this.button.removeEventListener('click', this.click); this.ravens.element.remove(); this.progress.remove(); this.focusStatus.remove(); this.track.remove(); this.perkStatus.remove(); this.lootStatus.remove(); this.bossNotice.remove(); this.workshop.destroy(); this.rewards.remove(); this.workshopButton.remove(); this.homeButton.remove(); }
}
