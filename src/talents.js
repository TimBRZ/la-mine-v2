// Stable IDs and provisional costs: single-rank, always active on new runs.
export const TALENTS = Object.freeze([
  {id:'good-start',name:'BON DÉPART',icon:'✦',description:'Un deuxième Choix du Contremaître au départ.',cost:{coal:300}},
  {id:'porion-eye',name:'ŒIL DU CONTREMAÎTRE',icon:'◉',description:'Une relance gratuite des cartes normales par run.',cost:{coal:500,iron:20}},
  {id:'first-aid',name:'PREMIERS SECOURS',icon:'✚',description:'Récupère 10 % des PV max après les boss 5, 10 et 15.',cost:{coal:400,iron:15}},
  {id:'prospector',name:'PROSPECTEUR',icon:'⛏',description:'15 % de chance de +1 Fer par vague terminée.',cost:{coal:350,iron:10}},
  {id:'magnet',name:'AIMANT RENFORCÉ',icon:'↟',description:'Collecte à +30 % de distance ; aspiration +20 % rapide.',cost:{coal:250}},
  {id:'cold-blood',name:'SANG-FROID',icon:'❄',description:'Délai de stabilisation avant le tir réduit de 20 %. Cadence inchangée.',cost:{coal:500,iron:20}},
  {id:'last-breath',name:'DERNIER SOUFFLE',icon:'♥',description:'Survis à un coup fatal avec 1 PV, une fois par run.',cost:{iron:30,diamond:1}},
  {id:'lucky-hand',name:'MAIN HEUREUSE',icon:'♧',description:'Les perks déjà acquis apparaissent un peu moins souvent.',cost:{iron:25,diamond:1}},
].map(t=>Object.freeze({...t,cost:Object.freeze(t.cost)})));
export const sanitizeTalents = value => Array.isArray(value) ? TALENTS.filter(t=>value.includes(t.id)).map(t=>t.id) : [];
export const TALENT_RULES = Object.freeze({heal:.1,ironChance:.15,pickup:1.3,magnetSpeed:1.2,settle:.8});

export class RunTalents {
  constructor(ids=[],random=Math.random) { this.ids=new Set(sanitizeTalents(ids));this.random=random;this.revived=false;this.rerolled=false;this.completed=new Set(); }
  has(id) { return this.ids.has(id); }
  configure(run) {
    if(this.has('cold-blood'))run.fireControl.settleScale=TALENT_RULES.settle;
    this.configureLoot(run.loot);
  }
  configureLoot(loot) {
    if(this.has('magnet')){loot.pickupScale=TALENT_RULES.pickup;loot.magnetScale=TALENT_RULES.magnetSpeed;}
  }
  weight(rank) { return this.has('lucky-hand') ? 1+3*rank : 1+2*rank; }
  complete(run,events) {
    if(this.completed.has(run.waveNumber))return;
    this.completed.add(run.waveNumber);
    if(this.has('first-aid')&&[5,10,15].includes(run.waveNumber)) {
      const amount=Math.min(run.player.maxHealth-run.player.hp,run.player.maxHealth*TALENT_RULES.heal);
      run.player.hp+=amount;
      if(amount>0)events.push({type:'talent',label:'SECOURS +'+Number(amount.toFixed(2))+' PV'});
    }
    if(this.has('prospector')&&this.random()<TALENT_RULES.ironChance) {
      run.collectedRewards.iron++;events.push({type:'talent',label:'PROSPECTEUR +1 FER'});
    }
  }
  rescue(player,events) {
    if(player.hp>0||!this.has('last-breath')||this.revived)return false;
    this.revived=true;player.hp=1;
    // Keep only the ordinary hit grace period; no additional invincibility.
    events.push({type:'talent',label:'DERNIER SOUFFLE · 1 PV'});return true;
  }
}
