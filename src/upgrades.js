import {reinforceConduit} from './energy-build.js';
import { drawEpics } from './epic-upgrades.js';
export const UPGRADES = Object.freeze([
  {id:'conduit',maxRanks:1,title:'Conduit perforant',category:'GRISOU X',context:'shotgun',icon:'piercing',description:'Une impulsion traverse sa première cible.',stat:'2 CIBLES · 100 / 70 %',apply:r=>reinforceConduit(r.weapon)},
  {id:'reinforced-conduit',maxRanks:2,requires:'conduit',title:'Conduit renforcé',category:'GRISOU X',context:'shotgun',icon:'piercing',description:'Une cible supplémentaire par rang, jusqu’à quatre.',stat:'+1 CIBLE · MAX 4 · 100 / 70 / 50 / 35 %',apply:r=>reinforceConduit(r.weapon)},
  {id:'capacitor',maxRanks:2,title:'Condensateur',category:'GRISOU X',context:'shotgun',icon:'pellets',description:'Une salve plus large, aux impulsions plus légères.',stat:'+1 IMPULSION · −12 % DÉGÂTS / RANG',apply:r=>{r.weapon.pellets++;r.weapon.damageBoost*=.88;r.weapon.spread+=.035;}},
  {id:'energy-overload',maxRanks:1,requires:'conduit',title:'Surcharge énergétique',category:'GRISOU X',context:'shotgun',icon:'heat',description:'Après un kill direct, la perte vers la cible suivante est divisée par deux.',stat:'PÉNALITÉ DE TRAVERSÉE ÷2 APRÈS KILL',apply:r=>{r.weapon.energyOverload=true;}},
  {id:'rapid-coil',maxRanks:1,title:'Bobine rapide',category:'GRISOU X',context:'cadence',icon:'trigger',description:'Recharge le cœur plus rapidement.',stat:'+25 % CADENCE',apply:r=>{r.weapon.interval/=1.25;}},
  {id:'energy-arc',maxRanks:1,title:'Arc de Grisou',category:'GRISOU X',context:'explosions',icon:'explosion',description:'Un kill direct décharge sur un voisin. Aucun rebond en chaîne.',stat:'1 VOISIN · 35 % DÉGÂTS · PORTÉE 95',apply:r=>{r.weapon.energyArc=true;}},
  { id:'buckshot', maxRanks:2, title:'Chevrotine lourde', category:'FUSIL À POMPE', context:'shotgun', icon:'pellets',
    description:'Une salve plus large, plus lente.', stat:'+4 PLOMBS · −20 % CADENCE / RANG',
    apply:run=>{ run.weapon.pellets+=4; run.weapon.interval/=.8; run.weapon.spread*=1.18; } },
  { id:'boots', maxRanks:1, title:'Bottes du Contremaître', category:'MOBILITÉ', context:'mobility', icon:'boots',
    description:'Tire, puis repars plus vite.', stat:'+30 % VITESSE · 1,5 s APRÈS TIR',
    apply:run=>{ run.player.shotBoost=true; } },
  { id:'trigger', maxRanks:2, title:'Détente allégée', category:'CADENCE', context:'cadence', icon:'trigger',
    description:'Beaucoup moins d’attente entre les tirs.', stat:'−25 % DÉLAI DE TIR / RANG',
    apply:run=>{ run.weapon.interval*=.75; } },
  { id:'grisou', maxRanks:1, title:'Coup de Grisou', category:'SPÉCIAL', context:'explosions', icon:'explosion',
    description:'Cinq éliminations arment la suivante.', stat:'6e ÉLIMINATION : EXPLOSION GARANTIE',
    apply:run=>{ run.grisou.enabled=true; run.grisou.kills=0; } },
  { id:'sawn', maxRanks:2, title:'Canon scié', category:'FUSIL À POMPE', context:'close', icon:'sawn',
    description:'Colle-toi à ta cible. Ta portée diminue.', stat:'+60 % DÉGÂTS PROCHES · −20 % PORTÉE / RANG',
    apply:run=>{ run.weapon.closeBonus+=.6; run.weapon.range*=.8; } },
  { id:'double', maxRanks:2, title:'Double détente', category:'FUSIL À POMPE', context:'cadence', icon:'double',
    description:'Une seconde salve immédiate, sans récursion.', stat:'30 % DE DOUBLE TIR',
    apply:run=>{ run.weapon.doubleChance=Math.min(.6,run.weapon.doubleChance+.3); } },
  { id:'plates', maxRanks:2, title:'Plaques du Contremaître', category:'SURVIE', context:'survival', icon:'shield',
    description:'Chaque plaque annule entièrement un coup. Rechargée à chaque vague.', stat:'1 COUP BLOQUÉ / RANG · MAX 2',
    apply:run=>{ run.shieldRank++; run.refreshShield(); } },
  { id:'magazine', maxRanks:1, title:'Chargeur étendu', category:'MITRAILLETTE', context:'cadence', icon:'magazine',
    description:'Arrête-toi et lâche une rafale accélérée.', stat:'+30 % CADENCE PENDANT 2 s APRÈS L’ARRÊT',
    apply:run=>{ run.weapon.magazine=true; run.weapon.stoppedFor=0; } },
  { id:'heat', maxRanks:1, title:'Surchauffe', category:'MITRAILLETTE', context:'cadence', icon:'heat',
    description:'Tire sans bouger. Le mouvement dissipe tout.', stat:'+10 % DÉGÂTS / s · MAX +40 %',
    apply:run=>{ run.weapon.overheat=true; } },
  { id:'piercing', maxRanks:1, title:'Balles perforantes', category:'MITRAILLETTE', context:'shotgun', icon:'piercing',
    description:'Une balle peut atteindre deux ennemis alignés.', stat:'TRAVERSE 1 ENNEMI · 60 % SUR LE SECOND',
    apply:run=>{ run.weapon.piercing=true; } },
]);

export function drawUpgrades(run, random=Math.random, previous=[]) {
  // Weighted random ordering: accumulated perks remain possible but less frequent.
  const available=UPGRADES.filter(item=>run.weapon.definition.perks.includes(item.id) && (run.upgradeRanks[item.id]||0)<item.maxRanks && (!item.requires||run.upgradeRanks[item.requires]>0))
    .map(item=>({item,score:-Math.log(Math.max(1e-9,Math.min(1,random())))*(run.talents?.weight(run.upgradeRanks[item.id]||0) ?? (1+2*(run.upgradeRanks[item.id]||0)))}))
    .sort((a,b)=>a.score-b.score).map(entry=>entry.item);
  const group=item=>['boots','plates'].includes(item.id)?'survival':['trigger','grisou'].includes(item.id)?'general':'weapon';
  const chosen=[];
  for(const slot of ['weapon','general','survival']) {
    const item=available.find(item=>group(item)===slot);
    if(item)chosen.push(item);
  }
  for(const item of available)if(chosen.length<3&&!chosen.includes(item))chosen.push(item);
  if(chosen.length===3&&chosen.every(item=>previous.includes(item.id))) {
    const alternatives=available.filter(item=>!previous.includes(item.id));
    const alternative=alternatives.find(a=>chosen.some(c=>group(c)===group(a)))||alternatives[0];
    if(alternative) {
      const index=chosen.findIndex(c=>group(c)===group(alternative));
      chosen[index<0?chosen.length-1:index]=alternative;
    }
  }
  return chosen.map(item=>{
    const rank=(run.upgradeRanks[item.id]||0)+1;
    return {...item,rank,stat:item.id==='double'?rank*30+' % DE DOUBLE TIR':item.stat};
  });
}

// Choice state is local to one run; permanent talents only grant permissions.
export class UpgradeFlow {
  constructor(run, random = Math.random) { this.run = run; this.random = random; this.active = false; this.count = 0; this.history = []; this.offered = []; this.previousOffer = []; }
  open() {
    if (this.active || this.run.status !== 'playing') return false;
    const epic = this.run.choicePending && this.run.waveNumber === this.run.world.epicAfter;
    this.offered = epic ? drawEpics(this.run) : drawUpgrades(this.run, this.random, this.previousOffer);
    this.previousOffer = this.offered.map(item => item.id);
    if (!this.offered.length) { this.run.choicePending = false; return false; }
    this.active = true;
    this.run.paused = true;
    this.run.player.vx = this.run.player.vy = 0;
    return true;
  }
  reroll() {
    if(!this.active||!this.run.talents?.has('porion-eye')||this.run.talents.rerolled||this.offered.some(p=>p.epic))return false;
    this.offered=drawUpgrades(this.run,this.random,this.offered.map(p=>p.id));
    this.previousOffer=this.offered.map(p=>p.id);this.run.talents.rerolled=true;return true;
  }
  afterCombat() {
    if(this.initialExtraPending){this.initialExtraPending=false;return this.open();}
    if (!this.run.choicePending || this.run.wavePhase !== 'cleared' || this.run.status !== 'playing') return false;
    return this.open();
  }
  choose(id) {
    const upgrade = this.offered.find(item => item.id === id);
    if (!this.active || !upgrade || (this.run.upgradeRanks[id] || 0) >= upgrade.maxRanks) return false;
    upgrade.apply(this.run);
    this.run.upgradeRanks[id] = (this.run.upgradeRanks[id] || 0) + 1;
    this.history.push(id);
    this.count++;
    if(this.count===1&&this.run.talents?.has('good-start'))this.initialExtraPending=true;
    this.active = false;
    this.run.paused = Boolean(this.initialExtraPending);
    this.run.choicePending = false;
    return true;
  }
}
