export const EPIC_UPGRADES = Object.freeze([
  {id:'double-cannon',weapon:'shotgun',title:'Double Canon',icon:'double',description:'Deux décharges à chaque tir.',stat:'100 % DOUBLE TIR',apply:r=>{r.weapon.doubleChance=1;}},
  {id:'unstable-grisou',weapon:'shotgun',title:'Grisou instable',icon:'explosion',description:'Chaque mort explose. Une explosion par victime.',stat:'EXPLOSION À CHAQUE ÉLIMINATION',apply:r=>{r.grisou.enabled=true;r.grisou.everyKill=true;}},
  {id:'point-blank',weapon:'shotgun',title:'À bout portant',icon:'sawn',description:'Approche-toi pour déchaîner le fusil.',stat:'+100 % DÉGÂTS TRÈS PROCHES',apply:r=>{r.weapon.closeBonus+=1;}},
  {id:'total-piercing',weapon:'smg',title:'Perforation totale',icon:'piercing',description:'Une rafale peut traverser les trois boss.',stat:'3 CIBLES · DÉGÂTS 100 / 80 / 64 %',apply:r=>{r.weapon.piercing=true;r.weapon.maxTargets=3;}},
  {id:'critical-heat',weapon:'smg',title:'Surchauffe critique',icon:'heat',description:'Reste immobile pour atteindre la chaleur maximale.',stat:'À CHALEUR MAX : +140 % DÉGÂTS',apply:r=>{r.weapon.overheat=true;r.weapon.criticalHeat=true;}},
  {id:'iron-rain',weapon:'smg',title:'Pluie de fer',icon:'magazine',description:'Un déluge rapide de balles plus légères.',stat:'+50 % CADENCE · −15 % DÉGÂTS',apply:r=>{r.weapon.interval/=1.5;r.weapon.damageBoost*=.85;}},
].map(item=>Object.freeze({...item,epic:true,maxRanks:1,rank:1,category:'ÉPIQUE · FINAL',context:'boss'})));
export function drawEpics(run) {
 const definition=run.weapon.definition;
 return EPIC_UPGRADES.filter(p=>definition.epicIds?definition.epicIds.includes(p.id):p.weapon===definition.id).map(p=>definition.id==='grisoux'?{
   ...p,...({'double-cannon':{description:'Deux salves énergétiques à chaque attaque.'},'iron-rain':{description:'Des salves plus rapides, aux impulsions plus légères.'}}[p.id]||{}),
 }:p);
}
