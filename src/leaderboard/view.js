import {RANKED_ZONES,nextMonday} from './records.js';
import {WEAPONS} from '../weapons.js';
export function formatRunTime(ms){const total=Math.floor(ms/1000);return Math.floor(total/60)+':'+String(total%60).padStart(2,'0')+'.'+String(ms%1000).padStart(3,'0');}
export function leaderboardView(service) {
 const element=document.createElement('section');element.className='leaderboard-view';element.setAttribute('aria-label','Classement de la Mine');
 element.innerHTML='<header><p class="menu-eyebrow">LES TRACES DE LA DESCENTE</p><h2>CLASSEMENT DE LA MINE</h2><p class="leaderboard-demo">LOCAL / SIMULÉ · 10 profils fictifs de démonstration. Aucun classement en ligne.</p></header><div class="leaderboard-tabs" role="group" aria-label="Catégories du classement"><button type="button" data-board="depth">PROFONDEUR</button><button type="button" data-board="time">TEMPS</button><button type="button" data-board="weekly">HEBDO</button></div><label class="leaderboard-zone">ZONE<select aria-label="Zone des meilleurs temps"></select></label><p class="leaderboard-rule"></p><p class="leaderboard-local" role="status"></p><ol class="leaderboard-rows" aria-label="Performances classées"></ol><p class="leaderboard-error" role="status"></p>';
 const select=element.querySelector('select');for(const zone of RANKED_ZONES){const option=document.createElement('option');option.value=zone.id;option.textContent=zone.name;select.append(option);}
 let category='depth',zoneId=RANKED_ZONES[0].id,sequence=0,destroyed=false;
 const list=element.querySelector('.leaderboard-rows'),local=element.querySelector('.leaderboard-local'),error=element.querySelector('.leaderboard-error');
 const fallback=document.createElement('button');fallback.type='button';fallback.className='home-leaderboard';fallback.textContent='PASSER EN LOCAL';fallback.hidden=true;fallback.onclick=()=>{service.useLocal();refresh();};element.append(fallback);
 async function refresh(){
  const request=++sequence;error.textContent='';local.textContent='Chargement du classement…';
  element.querySelector('.leaderboard-zone').hidden=category!=='time';
  for(const button of element.querySelectorAll('[data-board]'))button.setAttribute('aria-pressed',String(button.dataset.board===category));
  try{
   const board=await service.getBoard({category,zoneId});if(destroyed||request!==sequence)return;
   const remote=board.mode==='remote';
   element.querySelector('.leaderboard-demo').textContent=remote?(board.mock?'DISTANT / MOCK · réponses simulées, aucun serveur.':'DISTANT / TEMP · données du backend de test.'):'LOCAL / SIMULÉ · 10 profils fictifs de démonstration. Aucun classement en ligne.';
   fallback.hidden=!(remote||board.remoteUnavailable);
   element.querySelector('.leaderboard-rule').textContent=category==='weekly'?'Meilleure progression de la semaine. Réinitialisation lundi '+new Date(nextMonday(board.weekKey)).toLocaleDateString('fr-FR')+' à 00:00 local.':category==='time'?'Meilleurs temps · victoires uniquement · temps de jeu hors pauses.':'Zone, puis vague. À égalité : temps d’arrivée à cette vague, si connu.';
   local.textContent=board.local?`${board.localName} · VOUS · #${board.local.rank} dans ce classement simulé`:`${board.localName} · VOUS · ${category==='time'?'Aucune victoire enregistrée dans cette zone.':category==='weekly'?'Aucune run enregistrée cette semaine.':'Aucune run enregistrée. Termine une run pour apparaître ici.'}`;
   if(remote){
    element.querySelector('.leaderboard-rule').textContent=category==='weekly'?`HEBDOMADAIRE · semaine du ${board.weekKey} · lundi 00:00 UTC. Classement calculé par le serveur.`:category==='time'?'Meilleurs temps · victoires uniquement · classement serveur.':'Zone, puis vague, puis durée totale de la run · classement serveur.';
    local.textContent=!board.authenticated?'NON CONNECTÉ · consultation seule.':board.local?`${board.localName} · VOUS · #${board.local.rank}`:`${board.localName} · VOUS · absent du top 50 de ce classement.`;
   }
   list.replaceChildren();
   for(const row of board.rows){const p=row.performance,li=document.createElement('li');li.className='leaderboard-row'+(row.isLocal?' is-local':'');
    const rank=document.createElement('b');rank.className='leaderboard-rank';rank.textContent='#'+row.rank;
    const body=document.createElement('div'),name=document.createElement('strong'),detail=document.createElement('p'),extra=document.createElement('small');
    name.textContent=row.name+(row.isLocal?' · VOUS':row.isDemo?' · DÉMO':'');detail.textContent=RANKED_ZONES.find(z=>z.id===p.zone_id).name+' · Vague '+p.max_wave;
    extra.textContent=category==='time'?formatRunTime(p.duration_ms)+' · '+WEAPONS[p.weapon_id].name:'Arrivée : '+(p.depth_reached_ms===null?'temps inconnu':formatRunTime(p.depth_reached_ms));
    if(remote&&category!=='time')extra.textContent='Durée : '+formatRunTime(p.duration_ms);
    body.append(name,detail,extra);li.append(rank,body);list.append(li);
   }
   if(!board.available)error.textContent='Stockage local indisponible : tes records ne peuvent pas être enregistrés pour le moment. Les profils démo restent fictifs.';
   if(board.remoteUnavailable)error.textContent='Classement distant indisponible · classement local / simulé affiché.';
   if(service.submissionMessage)error.textContent+=(error.textContent?' ':'')+service.submissionMessage;
  }catch{if(!destroyed&&request===sequence){list.replaceChildren();local.textContent='Classement indisponible.';error.textContent='Impossible de lire les records. Réessaie en revenant sur cet écran.';}}
 }
 for(const button of element.querySelectorAll('[data-board]'))button.onclick=()=>{category=button.dataset.board;refresh();};
 select.onchange=()=>{zoneId=select.value;refresh();};
 refresh();return {element,refresh,destroy(){destroyed=true;sequence++;}};
}
