import {localDebugEnabled} from './debug-zones.js';
import {LocalLeaderboardStore,LEADERBOARD_KEY} from './leaderboard/local-store.js';
import {CLIENT_VERSION,nextMonday} from './leaderboard/records.js';
export const LEADERBOARD_DEBUG_BACKUP=LEADERBOARD_KEY+':debug-backup';
export function debugLeaderboard(storage,url,action,{name='JOUEUR TEST',now=Date.now()}={}) {
 if(!localDebugEnabled(url))throw Error('Debug réservé aux adresses locales avec ?debug=1.');
 if(!['depth','time','faster','week','name','reset'].includes(action))throw Error('Commande inconnue.');
 if(action==='reset') {
  const raw=storage.getItem(LEADERBOARD_DEBUG_BACKUP);if(raw===null)return 'Aucun classement debug à restaurer.';
  const backup=JSON.parse(raw);if(backup?.version!==1||!(backup.raw===null||typeof backup.raw==='string'))throw Error('Sauvegarde debug invalide.');
  if(backup.raw===null)storage.removeItem(LEADERBOARD_KEY);else storage.setItem(LEADERBOARD_KEY,backup.raw);
  storage.removeItem(LEADERBOARD_DEBUG_BACKUP);return 'Records locaux restaurés à leur état avant debug.';
 }
 if(storage.getItem(LEADERBOARD_DEBUG_BACKUP)===null)storage.setItem(LEADERBOARD_DEBUG_BACKUP,JSON.stringify({version:1,raw:storage.getItem(LEADERBOARD_KEY)}));
 const store=new LocalLeaderboardStore(storage);
 if(action==='name'){if(!store.rename(name))throw Error('Impossible d’enregistrer le pseudo.');}
 else if(action==='week') {
  const initial=store.read(now);if(!initial.available)throw Error('Stockage indisponible.');const next=store.read(nextMonday(initial.state.weekly.key)+1);if(!next.available)throw Error('Stockage indisponible.');
  return 'Semaine simulée : '+next.state.weekly.key+'. Hebdo vide, records permanents conservés. RESET CLASSEMENT DEBUG pour revenir à la date réelle.';
 }else {
  const duration=action==='depth'?420000:action==='time'?500000:450000;
  const p={run_id:'debug-'+action+'-'+now,zone_id:action==='depth'?'shaft59':'tracks',max_wave:action==='depth'?14:20,completed:action!=='depth',duration_ms:duration,depth_reached_ms:duration-30000,weapon_id:action==='depth'?'shotgun':'smg',run_started_at:new Date(now-duration).toISOString(),run_finished_at:new Date(now).toISOString(),client_version:CLIENT_VERSION,kills:100};
  const result=store.record(p,now);if(!result.ok)throw Error('Impossible d’enregistrer la performance.');
 }
 return 'Classement local mis à jour pour le test. Ressources et progression du jeu inchangées.';
}
export function mountDebugLeaderboard(document,url,getStorage) {
 if(!localDebugEnabled(url))return;
 document.querySelector('#debug-leaderboard').hidden=false;
 for(const button of document.querySelectorAll('[data-leaderboard-debug]'))button.onclick=()=>{
  try{document.querySelector('#debug-leaderboard-status').textContent=debugLeaderboard(getStorage(),url,button.dataset.leaderboardDebug,{name:document.querySelector('#debug-player-name').value});}
  catch(error){document.querySelector('#debug-leaderboard-status').textContent='Échec : '+error.message;}
 };
}
