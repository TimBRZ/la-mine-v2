import { CRATE_RULES } from '../crates.js';
import { RESOURCES } from '../resources.js';
import { kitImage } from './kit.js';

export function cratesView(wallet,onChange) {
  const element=document.createElement('section');element.className='crates-view';element.setAttribute('aria-label','Caisse du Mineur');
  element.innerHTML=`<header><p class="menu-eyebrow">LE PETIT EXTRA DU FOND</p><h2>CAISSE DU MINEUR</h2></header>
    <p class="crate-count" aria-live="polite"></p>
    <div class="crate-stage" aria-hidden="true"><div class="crate-glow"></div><div class="porion-crate"><div class="crate-lid"></div><div class="crate-body"><span>✦</span></div></div></div>
    <div class="crate-reveal" role="status" aria-live="polite"><p>Un peu de poussière. Peut-être une belle surprise.</p></div>
    <button type="button" class="menu-primary crate-open">OUVRIR</button>
    <button type="button" class="crate-skip" hidden>PASSER L’ANIMATION</button>
    <p class="crate-ravens"></p>
    <p class="crate-possibilities">Charbon ou Fer · parfois des Diamants · très rarement un Jeton Grisou.</p>
    <div class="crate-exchange"><h3>ÉCHANGER DES JETONS</h3><p>${CRATE_RULES.tokenCost} Jetons Grisou → 1 caisse</p><button type="button">ÉCHANGER</button></div>
    <p class="crate-sources">Première victoire du jour : +1 caisse.<br>Chaque victoire peut aussi offrir une caisse bonus.<br>Sans argent réel · sauvegarde locale.</p>`;
  const open=element.querySelector('.crate-open'),skip=element.querySelector('.crate-skip'),exchange=element.querySelector('.crate-exchange button'),reveal=element.querySelector('.crate-reveal');
  let busy=false,timer=null,pending=null,disposed=false,openings=0;
  const errors={storage:'Enregistrement impossible. Ta caisse et tes Jetons sont conservés : réessaie.',empty:'Aucune caisse disponible. Termine une descente ou échange des Jetons.',tokens:'Il faut 3 Jetons Grisou.',full:'Réserve de caisses pleine.',capacity:'Portefeuille presque plein : utilise tes ressources avant d’ouvrir.'};
  function refresh() {
    element.querySelector('.crate-count').textContent=wallet.crateCount+' CAISSE'+(wallet.crateCount===1?'':'S')+' DISPONIBLE'+(wallet.crateCount===1?'':'S');
    open.disabled=busy||wallet.crateCount===0;exchange.disabled=busy||wallet.snapshot.wallet.token<CRATE_RULES.tokenCost||wallet.crateCount>=CRATE_RULES.maxCount;
  }
  function finish() {
    if(!busy||disposed)return;
    clearTimeout(timer);timer=null;busy=false;skip.hidden=true;element.classList.remove('opening');element.classList.add('opened');
    const resource=RESOURCES.find(r=>r.id===pending.resource);
    reveal.innerHTML=`${kitImage(resource.id)}<strong>+${pending.amount} ${resource.name}${pending.amount>1&&resource.id==='diamond'?'s':''}</strong><small>Ajouté à tes ressources</small>`;
    element.querySelector('.crate-ravens').textContent=resource.id==='diamond'?'CONTREMAÎTRE RAVENS · « Ah. Là, c’est déjà plus intéressant. »':resource.id==='token'?'CONTREMAÎTRE RAVENS · « Celui-là, garde-le bien. »':openings%3===0?'CONTREMAÎTRE RAVENS · « Pas de quoi prendre ta retraite. »':'';
    pending=null;refresh();onChange();
  }
  open.onclick=()=>{
    if(busy||disposed)return;
    const result=wallet.openCrate();
    if(!result.ok){reveal.textContent=errors[result.reason];refresh();return;}
    pending=result.reward;openings++;busy=true;element.classList.remove('opened');element.classList.add('opening');
    reveal.textContent='Le Contremaître soulève le couvercle…';element.querySelector('.crate-ravens').textContent='';skip.hidden=false;refresh();
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)finish();
    else timer=setTimeout(finish,CRATE_RULES.animationMs);
  };
  skip.onclick=finish;
  exchange.onclick=()=>{
    if(busy||disposed)return;
    const result=wallet.exchangeTokens();
    reveal.textContent=result.ok?'Échange effectué : +1 Caisse du Mineur.':errors[result.reason];
    element.classList.remove('opened');refresh();onChange();
  };
  wallet.refreshSavedProfile();refresh();
  return {element,refresh,destroy(){disposed=true;clearTimeout(timer);}};
}
