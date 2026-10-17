import { zoneAvailable } from '../zone-progress.js';
import { WEAPONS } from '../weapons.js';

export const ZONES = Object.freeze([
  { id:'galleries', name:'LES GALERIES', depth:'−50 m', playable:true, detail:'20 vagues · Boss 5 / 10 / 15 · Final 20' },
  { id:'tracks', name:'LES VOIES ABANDONNÉES', depth:'−180 m', playable:true, detail:'20 vagues · Machines ferroviaires · Final 20' },
  { id:'shaft59', name:'LE PUITS 59', depth:'−350 m', playable:true, detail:'20 vagues · Sol instable · Machines lourdes' },
  { id:'rift', name:'LA FAILLE DE GRISOU', depth:'−600 m', playable:true, detail:'20 vagues · Grisou instable · Boss mobiles' },
  { id:'depths', name:'LES PROFONDEURS NOIRES', depth:'−900 m', playable:true, detail:'20 vagues · Extinctions · Dangers lumineux' },
  { id:'forge', name:'LES FORGES OUBLIÉES', depth:'−1 200 m', playable:true, detail:'20 vagues · Surchauffe · Forges industrielles' },
  { id:'future7', name:'ZONE 7 · À VENIR', depth:'???', playable:false },
].map(Object.freeze));
export const FUTURE_SECTIONS = Object.freeze([]);

// Session-only navigation. Relève production lives in the wallet profile.
export class MenuState {
  constructor() { this.page = 'home'; this.weaponId = 'shotgun'; this.launching = false; }
  navigate(page) {
    if (!['home','zones','relief','talents','crates','contracts','leaderboard'].includes(page) || this.launching) return false;
    this.page = page;
    return true;
  }
  selectWeapon(id) {
    if (!Object.hasOwn(WEAPONS, id) || this.launching) return false;
    this.weaponId = id;
    return true;
  }
  launch(zoneId, progress) {
    if (!zoneAvailable(zoneId, progress) || this.launching || !ZONES.some(zone => zone.id === zoneId && zone.playable)) return null;
    this.launching = true;
    this.zoneId = zoneId;
    return zoneId === 'galleries' ? { weaponId: this.weaponId } : { weaponId: this.weaponId, zoneId };
  }
  returnTo(page = 'home') { this.launching = false; this.navigate(page); }
}
