import { TALENTS } from '../talents.js';
import { resourceList } from '../resources.js';
import { decorateResources } from './art.js';

export function talentsView(wallet,onChange) {
  const element=document.createElement('section');element.className='talents-view';
  element.innerHTML='<header><p class="menu-eyebrow">APPRENDRE LE MÉTIER</p><h2>TALENTS</h2><p>Un achat, un avantage permanent. Actifs dès la prochaine run.</p></header><p class="talent-message" role="status"></p><div class="talent-grid"></div><p class="home-ravens">CONTREMAÎTRE RAVENS · « Le talent, ça aide. Le reste, faut courir. »</p>';
  const grid=element.querySelector('.talent-grid'),message=element.querySelector('.talent-message');
  const render=()=>{
    wallet.refreshSavedProfile();grid.replaceChildren();
    for(const t of TALENTS) {
      const active=wallet.snapshot.talents?.includes(t.id),card=document.createElement('article');
      card.className='talent-card'+(active?' unlocked':'');
      card.innerHTML=`<h3><span aria-hidden="true">${t.icon}</span> ${t.name}</h3><p>${t.description}</p><strong class="talent-state">${active?'ACTIF':'VERROUILLÉ'}</strong><div class="talent-cost" aria-label="Coût"></div>`;
      const costs=decorateResources(resourceList(t.cost));
      for(const id of ['coal','iron','diamond','token'])if(!t.cost[id])costs.querySelector('.resource-'+id).remove();
      card.querySelector('.talent-cost').append(costs);
      if(!active) {
        const button=document.createElement('button');button.type='button';button.textContent='DÉBLOQUER';
        button.setAttribute('aria-label','DÉBLOQUER '+t.name);button.disabled=!wallet.canBuyTalent(t.id);
        button.onclick=()=>{
          const ok=wallet.buyTalent(t.id);
          message.textContent=ok?t.name+' débloqué. Actif dès la prochaine run.':'Achat impossible. Vérifie les ressources et la sauvegarde locale.';
          onChange();render();
          message.tabIndex=-1;message.focus({preventScroll:true});
        };
        card.append(button);
      }
      grid.append(card);
    }
  };
  render();return element;
}
