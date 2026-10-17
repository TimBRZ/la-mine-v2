// Compact readouts for the six choices owned in a world run.
export function perkReadouts(run) {
  const w = run.weapon;
  const labels = {
    buckshot: ['CHEVROTINE', w.pellets + ' plombs'],
    sawn: ['CANON SCIÉ', '+' + Math.round(w.closeBonus * 100) + ' % de près'],
    double: ['DOUBLE TIR', Math.round(w.doubleChance * 100) + ' %'],
    grisou: ['GRISOU', run.grisou.everyKill ? 'Chaque mort explose' : run.grisou.kills === 5 ? 'PRÊT À EXPLOSER' : run.grisou.kills + '/5 · armement'],
    plates: ['PLAQUES', run.shield > 0 ? '◆ '+run.shield+' coup(s) bloqué(s)' : 'Brisées · prochaine vague'],
    boots: ['BOTTES', run.player.boostSeconds>0?'+30 % · '+run.player.boostSeconds.toFixed(1)+' s':'Boost après tir'],
    conduit:['CONDUIT',w.maxTargets+' cibles · traversée'],
    'reinforced-conduit':['RENFORCÉ',w.maxTargets+' cibles · max 4'],
    capacitor:['CONDENSATEUR',w.pellets+' impulsions'],
    'energy-overload':['SURCHARGE','Kill : perte ÷2'],
    'rapid-coil':['BOBINE','+25 % cadence'],
    'energy-arc':['ARC','Kill : 1 voisin'],
    trigger: ['DÉTENTE', '−' + Math.round((1 - .75 ** (run.upgradeRanks.trigger || 0)) * 100) + ' % délai'],
    magazine: ['CHARGEUR', w.stoppedFor > 0 && w.stoppedFor < 2 ? '+30 % · ' + (2 - w.stoppedFor).toFixed(1) + ' s' : 'Au prochain arrêt'],
    heat: ['SURCHAUFFE', '+' + Math.floor((w.heat + (w.criticalHeat&&w.heat>=.4?1:0) + 1e-8) * 100) + ' % dégâts'],
    piercing: ['PERFORANTES', w.maxTargets===3 ? '3 cibles · épique' : '2 cibles · 100/60 %'],
    'double-cannon':['DOUBLE CANON','2 salves / tir'],
    'unstable-grisou':['GRISOU ÉPIQUE','Chaque mort explose'],
    'point-blank':['BOUT PORTANT','+100 % de près'],
    'total-piercing':['PERFO TOTALE','3 cibles'],
    'critical-heat':['CHALEUR MAX',w.heat>=.4?'MAX · +140 %':Math.floor(w.heat*250)+' % chaleur'],
    'iron-rain':['PLUIE DE FER','+50 % cadence'],
  };
  return Object.entries(run.upgradeRanks).filter(([,rank])=>rank>0).map(([id,rank])=>({
    id, title: labels[id][0] + ' ×' + rank, detail: labels[id][1],
  }));
}
