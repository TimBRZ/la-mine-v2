import { cratesView } from './crates-view.js';
import {leaderboardView} from '../leaderboard/view.js';
import {contractsView} from './contracts-view.js';
import {contractBadge} from '../contracts.js';
import { talentsView } from './talents-view.js';
import { uiIcon, decorateResources } from './art.js';
import { MenuState, FUTURE_SECTIONS } from './state.js';
import { heroPresentation } from './kit.js';
import { weaponSelector } from './weapon-selector.js';
import { zonesView } from './zones.js';
import { WEAPONS } from '../weapons.js';
import { resourceList } from '../resources.js';
import { reliefView } from './relief-view.js';

export class MainMenu {
  constructor(host, wallet, { onLaunch, onWorkshop, leaderboard }) {
    this.host = host;
    this.wallet = wallet;
    this.leaderboard=leaderboard;
    this.state = new MenuState();
    this.onLaunch = onLaunch;
    this.onWorkshop = onWorkshop;
    this.element = document.createElement('section');
    this.element.className = 'main-menu';
    this.element.hidden = true;
    this.element.setAttribute('aria-label', 'Accueil La Mine');
    this.element.innerHTML = '<header class="menu-brand"><div><span class="brand-lamp" aria-hidden="true">✦</span><h1>LA MINE <small>V2</small></h1></div><span class="menu-version">V0.33</span></header><div class="menu-wallet" aria-label="Tes ressources"></div><div class="menu-content"></div><footer class="menu-footer"><div class="future-nav" aria-label="La Relève et fonctionnalités à venir"></div><nav class="main-nav" aria-label="Navigation principale"></nav></footer>';
    this.content = this.element.querySelector('.menu-content');
    this.balance = this.element.querySelector('.menu-wallet');
    for (const [index, label] of ['TALENTS','LA RELÈVE','CAISSES'].entries()) {
      const button = document.createElement('button');
      button.type = 'button'; button.disabled = FUTURE_SECTIONS.includes(label);
      button.innerHTML = `${uiIcon(['talents','relief','crates'][index])}<span>${label}</span><small>BIENTÔT</small><i class="future-lock" aria-hidden="true">${uiIcon('lock')}</i>`;
      button.setAttribute('aria-label', label + ' · VERROUILLÉ · BIENTÔT');
      if (label === 'TALENTS') {
        button.dataset.page='talents';button.querySelector('small').textContent='PROGRESSER';button.querySelector('.future-lock').remove();
        button.setAttribute('aria-label','TALENTS');button.onclick=()=>this.navigate('talents');
      } else if (label === 'CAISSES') {
        button.dataset.page='crates';button.querySelector('.future-lock').remove();button.setAttribute('aria-label','CAISSES');
        button.onclick=()=>this.navigate('crates');this.cratesButton=button;
      } else if (!button.disabled) {
        button.className = 'relief-nav'; button.dataset.page = 'relief';
        button.querySelector('.future-lock').remove();
        button.setAttribute('aria-label','LA RELÈVE');
        button.onclick = () => this.navigate('relief');
        this.reliefButton = button;
      }
      this.element.querySelector('.future-nav').append(button);
    }
    for (const [page, label, icon] of [['home','PERSONNAGE','home'],['zones','ZONES','zones'],['contracts','CONTRATS','talents'],['workshop','ATELIER','workshop']]) {
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.page = page;
      button.setAttribute('aria-label', page === 'home' ? 'ACCUEIL · PERSONNAGE' : label);
      button.innerHTML = `<span class="nav-medallion">${uiIcon(icon)}</span><strong>${label}</strong>`;
      if(page==='contracts'){this.contractsButton=button;const badge=document.createElement('small');badge.className='contract-badge';badge.hidden=true;button.append(badge);}
      button.onclick = () => page === 'workshop' ? this.openWorkshop() : this.navigate(page);
      this.element.querySelector('.main-nav').append(button);
    }
    host.append(this.element);
    this.refreshRelief = () => {
      if(!this.element.hidden&&this.state.page==='leaderboard')this.leaderboardScreen?.refresh();
      this.refreshContracts();
      const stock = this.wallet.reliefState();
      this.reliefButton.classList.toggle('has-stock',stock.available);
      this.reliefButton.querySelector('small').textContent = stock.available ? 'À RÉCUPÉRER' : 'AU TRAVAIL';
      this.reliefButton.setAttribute('aria-label',stock.available ? 'LA RELÈVE · À RÉCUPÉRER' : 'LA RELÈVE');
      if (!this.element.hidden && this.state.page === 'relief') this.reliefScreen?.refresh();
    };
    // Save the start immediately, not on unreliable browser-close events.
    this.refreshRelief();
    this.reliefTick = setInterval(() => { if (!document.hidden && !this.element.hidden) this.refreshRelief(); },30000);
    this.reliefVisibility = () => { if (!document.hidden) this.refreshRelief(); };
    document.addEventListener('visibilitychange',this.reliefVisibility);
  }
  show(page = 'home') {
    this.state.returnTo(page);
    this.element.hidden = false;
    this.element.inert = false;
    this.host.classList.add('in-menu');
    this.render();
    this.focusPage();
  }
  hide() {
    this.element.hidden = true;
    this.host.classList.remove('in-menu');
  }
  navigate(page) {
    if (!this.state.navigate(page)) return;
    this.render();
    this.focusPage();
  }
  focusPage() {
    const heading = this.content.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  refreshBalance() {
    this.cratesButton.querySelector('small').textContent=this.wallet.crateCount?'● '+this.wallet.crateCount:'DÉCOUVRIR';
    this.balance.replaceChildren(decorateResources(resourceList(this.wallet.snapshot.wallet)));
    for (const item of this.balance.querySelectorAll('.resource')) item.title = item.textContent;
  }
  refreshContracts() {
    const count=contractBadge(this.wallet.contractState());
    const badge=this.contractsButton.querySelector('.contract-badge');badge.hidden=!count;badge.textContent=count;
    this.contractsButton.setAttribute('aria-label',count?'CONTRATS · '+count+' récompense(s) à récupérer':'CONTRATS');
    if(!this.element.hidden&&this.state.page==='contracts')this.contractsScreen?.refresh();
  }
  openWorkshop() {
    this.element.inert = true;
    this.onWorkshop(() => {
      this.element.inert = false;
      this.refreshBalance();
      this.element.querySelector('[data-page="workshop"]').focus({ preventScroll: true });
    });
  }
  launch(zoneId) {
    const options = this.state.launch(zoneId, this.wallet.snapshot.progress);
    if (!options) return false;
    this.hide();
    this.onLaunch(options.weaponId, zoneId);
    return true;
  }
  render() {
    this.leaderboardScreen?.destroy();this.leaderboardScreen=null;
    this.cratesScreen?.destroy();this.cratesScreen=null;
    this.contractsScreen=null;
    this.wallet.refreshSavedProfile();
    this.refreshBalance();
    this.reliefScreen = null;
    this.refreshRelief();
    this.content.replaceChildren();
    this.content.scrollTop = 0;
    for (const button of this.element.querySelectorAll('[data-page]')) {
      if (button.dataset.page === this.state.page) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    if(this.state.page==='contracts'){this.contractsScreen=contractsView(this.wallet,()=>{this.refreshBalance();this.refreshContracts();});this.content.append(this.contractsScreen.element);return;}
    if(this.state.page==='leaderboard'){this.leaderboardScreen=leaderboardView(this.leaderboard);this.content.append(this.leaderboardScreen.element);return;}
    if(this.state.page==='crates'){this.cratesScreen=cratesView(this.wallet,()=>{this.refreshBalance();this.refreshContracts();});this.content.append(this.cratesScreen.element);return;}
    if (this.state.page === 'talents') {
      this.content.append(talentsView(this.wallet,()=>this.refreshBalance()));return;
    }
    if (this.state.page === 'relief') {
      this.reliefScreen = reliefView(this.wallet,() => { this.refreshBalance(); this.refreshRelief(); });
      this.content.append(this.reliefScreen.element);
      return;
    }
    if (this.state.page === 'zones') {
      this.content.append(zonesView(id => this.launch(id), this.wallet.snapshot.progress, this.state.zoneId));
      const loadout = document.createElement('p');
      loadout.className = 'zone-loadout';
      loadout.textContent = 'ARME ÉQUIPÉE · ' + WEAPONS[this.state.weaponId].name;
      this.content.querySelector('header').append(loadout);
      return;
    }
    const home = document.createElement('div');
    home.className = 'home-view';
    home.innerHTML = '<header><p class="menu-eyebrow">LE CARREAU DE LA MINE</p><h2>PRÊT À DESCENDRE ?</h2></header><div class="hero-stage"><span class="stage-location" aria-hidden="true">FOSSE 01<br><b>LE CARREAU</b></span><div class="hero-miner"></div><span class="hero-tag">ÉQUIPEMENT PRÊT</span></div><p class="home-ravens"><span class="ravens-badge" aria-hidden="true"><img src="./src/assets/porion-ravens.png" alt=""></span><span><b>CONTREMAÎTRE RAVENS</b> « L’ascenseur t’attend. »</span></p>';
    home.querySelector('.hero-miner').innerHTML = heroPresentation(this.state.weaponId);
    home.append(weaponSelector(this.state.weaponId, id => {
      if (!this.state.selectWeapon(id)) return;
      home.querySelector('.hero-miner').innerHTML = heroPresentation(id);
      for (const button of home.querySelectorAll('[data-weapon]')) {
        const selected = button.dataset.weapon === id;
        button.setAttribute('aria-pressed', String(selected));
        button.querySelector('.equipment-status').textContent = selected ? 'ÉQUIPÉ' : 'ÉQUIPER';
      }
    }));
    const play = document.createElement('button');
    play.type = 'button'; play.className = 'menu-primary home-play';
    play.innerHTML = 'EXPLORER LA MINE <span aria-hidden="true">↓</span>';
    play.onclick = () => this.navigate('zones');
    home.append(play);
    const ranking=document.createElement('button');ranking.type='button';ranking.className='home-leaderboard';ranking.textContent='CLASSEMENT';ranking.onclick=()=>this.navigate('leaderboard');home.append(ranking);
    this.content.append(home);
  }
  destroy() {
    this.leaderboardScreen?.destroy();
    this.cratesScreen?.destroy();
    clearInterval(this.reliefTick);
    document.removeEventListener('visibilitychange',this.reliefVisibility);
    this.host.classList.remove('in-menu'); this.element.remove();
  }
}
