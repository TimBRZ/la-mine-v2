import {contractById,contractReady,contractDates,CONTRACT_REWARDS} from '../contracts.js';
const names={coal:'Charbon',iron:'Fer',diamond:'Diamant',token:'Jeton Grisou',crate:'Caisse du Mineur'};
export const contractRewardText=reward=>Object.entries(reward).map(([k,n])=>`${n} ${names[k]}`).join(' · ');
export function contractsView(wallet,onClaim,now=()=>Date.now()) {
 const element=document.createElement('section');element.className='contracts-view';element.setAttribute('aria-label','Contrats de la Mine');
 element.innerHTML='<header><p class="menu-eyebrow">LE TABLEAU DU CONTREMAÎTRE</p><h2>CONTRATS DE LA MINE</h2><p>« Le boulot manque pas. »</p></header><div class="contract-tabs" role="group" aria-label="Catégories de contrats"><button type="button" data-period="daily">QUOTIDIENS</button><button type="button" data-period="weekly">HEBDOMADAIRES</button></div><p class="contract-reset"></p><div class="contract-list"></div><p class="contract-message" role="status" aria-live="polite"></p><aside class="contract-future"><strong>CONTRATS C2G</strong><span>BIENTÔT</span></aside><p class="contract-note">Bonus facultatifs · sauvegarde locale. Les récompenses non récupérées expirent au reset du cycle.</p>';
 let period='daily',lastKey='';
 const list=element.querySelector('.contract-list'),message=element.querySelector('.contract-message');
 function claim(key,id){const result=wallet.claimContract(period,key,id,now());render();onClaim();message.textContent=result.ok?'Récupéré : '+contractRewardText(result.reward)+'.':({storage:'Sauvegarde indisponible. Réessaie sans perdre ta récompense.',full:'Stock plein. Fais de la place avant de récupérer.',unavailable:'Récompense déjà récupérée ou cycle terminé.',clock:'Date locale invalide.'})[result.reason];}
 function render(){
  const state=wallet.contractState(now()),cycle=state[period];list.replaceChildren();
  for(const button of element.querySelectorAll('[data-period]'))button.setAttribute('aria-pressed',String(button.dataset.period===period));
  if(!cycle){element.querySelector('.contract-reset').textContent='Contrats indisponibles : vérifie la date et le stockage local.';return;}
  lastKey=cycle.key;const dates=contractDates(new Date(cycle.key+'T12:00:00').getTime());
  element.querySelector('.contract-reset').textContent='Reset '+(period==='weekly'?'lundi ':'')+new Date(dates[period+'Reset']).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+' · heure locale';
  for(const row of cycle.rows){const c=contractById(row.id),ready=contractReady(row),card=document.createElement('article');card.className='contract-card'+(ready?' ready':'');
   card.innerHTML=`<div class="contract-card-top"><h3>${c.title}</h3><span>${row.claimed?'RÉCUPÉRÉ':ready?'TERMINÉ':'EN COURS'}</span></div><p>${row.value} / ${c.target}</p><progress max="${c.target}" value="${row.value}" aria-label="${c.title}"></progress><p class="contract-reward">${contractRewardText(c.reward)}</p>${c.note?'<small>'+c.note+'</small>':''}<button type="button" ${!ready?'disabled':''}>${row.claimed?'RÉCUPÉRÉ':'RÉCUPÉRER'}</button>`;
   card.querySelector('button').setAttribute('aria-label','RÉCUPÉRER · '+c.title);card.querySelector('button').onclick=()=>claim(cycle.key,row.id);list.append(card);
  }
  const done=cycle.rows.filter(r=>r.value===contractById(r.id).target).length,bonus=document.createElement('article');bonus.className='contract-bonus';
  bonus.innerHTML=`<h3>BONUS ${period==='daily'?'DU JOUR':'DE LA SEMAINE'}</h3><p>${done} / 3 terminés · ${contractRewardText(CONTRACT_REWARDS[period+'Bonus'])}</p><button type="button" ${done!==3||cycle.bonusClaimed?'disabled':''}>${cycle.bonusClaimed?'BONUS RÉCUPÉRÉ':'RÉCUPÉRER LE BONUS'}</button>`;
  bonus.querySelector('button').onclick=()=>claim(cycle.key,'bonus');list.append(bonus);
  if(!wallet.saved)message.textContent='Sauvegarde indisponible : récupération suspendue.';
 }
 for(const button of element.querySelectorAll('[data-period]'))button.onclick=()=>{period=button.dataset.period;message.textContent='';render();};
 render();return {element,refresh(){const state=wallet.contractState(now());if(state[period]?.key!==lastKey)render();}};
}
