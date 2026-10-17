export const PHRASES = Object.freeze({
  general: ['Bon… prends pas encore un truc inutile.', 'Si j’étais toi, je prendrais la meilleure.'],
  shotgun: ['Plus t’es près, plus ils regrettent.', 'Le pompe, c’est une discussion courte.'],
  explosions: ['Si ça saute, c’est bon signe.', 'Là, on commence à parler sérieusement.'],
  mobility: ['Bouge un peu, on dirait un wagon rouillé.', 'Vivant, c’est mieux que courageux.'],
  survival: ['Du solide. Comme mon café.', 'Essaie quand même d’éviter les coups.'],
  close: ['Viens plus près. Pas trop non plus.', 'À cette distance, ils vont comprendre.'],
  cadence: ['Une cartouche ? C’est timide.', 'Moins de pause. Plus de plomb.'],
  boss: ['Bon. Là, faut arrêter de faire le malin.', 'Le gros au fond, il a pas l’air commode.'],
  token: ['Ça, tu le gardes au chaud.', 'Le montre pas à n’importe qui, celui-là.'],
  diamond: ['Un diamant. Essaie de pas le perdre.', 'Ça brille. Pour une fois, c’est bon signe.'],
  haul: ['Les poches pleines. Pas mal, le bleu.', 'Avec ça, on va retaper ton matériel.'],
  death: ['Techniquement, t’es descendu plus bas que prévu.', 'On va faire comme si c’était un repérage.'],
  victory: ['Pas mal. T’as presque l’air compétent.', 'Bon boulot. Pour une fois.'],
});

export class RavensDialogue {
  constructor(random = Math.random) { this.random = random; this.last = new Map(); }
  phrase(context = 'general') {
    const key = Object.hasOwn(PHRASES, context) ? context : 'general';
    const choices = PHRASES[key].filter(text => text !== this.last.get(key));
    const text = choices[Math.min(choices.length - 1, Math.floor(this.random() * choices.length))];
    this.last.set(key, text);
    return text;
  }
  appears({ first = false, important = false, context = 'general' } = {}) {
    return first || important || ['boss', 'token', 'death', 'victory'].includes(context) || this.random() < .3;
  }
}

export class Ravens {
  constructor() {
    this.element = document.createElement('figure');
    this.element.className = 'ravens';
    const portrait = document.createElement('img');
    portrait.src = './src/assets/porion-ravens.png';
    portrait.alt = 'Contremaître Ravens, contremaître chauve à lunettes, souriant, casque sous le bras';
    portrait.draggable = false;
    this.element.append(portrait);
  }
  show(visible) { this.element.hidden = !visible; }
}
