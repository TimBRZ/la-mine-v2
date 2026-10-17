import {STORAGE_KEY,emptyProfile} from './local-profile-storage.js';
import {sanitizeProgress} from './zone-progress.js';

export const DEBUG_BACKUP_KEY=STORAGE_KEY+':debug-zones-backup';
export function localDebugEnabled(url) {
  const u=new URL(url);
  if(!['http:','https:'].includes(u.protocol)||u.searchParams.get('debug')!=='1')return false;
  if(['localhost','[::1]'].includes(u.hostname))return true;
  const parts=u.hostname.split('.');
  if(parts.length!==4||!parts.every(p=>/^\d+$/.test(p)&&Number(p)<=255))return false;
  const [a,b]=parts.map(Number);
  return a===127||a===10||a===192&&b===168||a===172&&b>=16&&b<=31;
}

// Standalone local tool: no Wallet.claim(), rewards, migrations or game hooks.
// Preserve every saved field verbatim except progress. Backup only that field.
export function changeDebugZones(storage,url,action) {
  if(!localDebugEnabled(url))throw Error('Debug réservé aux adresses locales avec ?debug=1.');
  if(!['unlock','reset'].includes(action))throw Error('Commande debug inconnue.');
  const raw=storage.getItem(STORAGE_KEY);
  const profile=raw===null?emptyProfile():JSON.parse(raw);
  if(!profile||profile.version!==1)throw Error('Format de sauvegarde inconnu : aucune modification.');
  const saved=storage.getItem(DEBUG_BACKUP_KEY);
  if(action==='unlock') {
    if(saved===null)storage.setItem(DEBUG_BACKUP_KEY,JSON.stringify({version:1,present:Object.hasOwn(profile,'progress'),progress:profile.progress}));
    // Consume skipped Zones 2–5 victory flags without crediting any rewards.
    // Zone 6 opens; preserve an existing genuine Zone 6 victory.
    profile.progress=sanitizeProgress({...profile.progress,galleriesCompleted:true,tracksCompleted:true,shaftCompleted:true,riftCompleted:true,depthsCompleted:true});
    storage.setItem(STORAGE_KEY,JSON.stringify(profile));
    return 'Zones de test débloquées. Aucune ressource ni récompense ajoutée. Retourne au jeu ou recharge son onglet.';
  }
  if(saved===null)return 'Aucun déblocage debug à réinitialiser.';
  const backup=JSON.parse(saved);
  if(backup?.version!==1||typeof backup.present!=='boolean'||backup.present&&(!backup.progress||typeof backup.progress!=='object'))throw Error('Sauvegarde debug invalide : aucune modification.');
  if(backup.present)profile.progress=backup.progress;else delete profile.progress;
  storage.setItem(STORAGE_KEY,JSON.stringify(profile));
  storage.removeItem(DEBUG_BACKUP_KEY);
  return 'Progression des zones restaurée à son état avant debug. Ressources et autres systèmes conservés.';
}

export function mountDebugZones(document,url,getStorage) {
  if(!localDebugEnabled(url))return;
  const panel=document.querySelector('#debug-tools');panel.hidden=false;
  document.querySelector('#debug-unavailable').hidden=true;
  for(const [id,action] of [['debug-unlock','unlock'],['debug-reset','reset']]) {
    document.querySelector('#'+id).onclick=()=>{
      try {document.querySelector('#debug-status').textContent=changeDebugZones(getStorage(),url,action);}
      catch(error){document.querySelector('#debug-status').textContent='Échec : '+error.message;}
    };
  }
}
