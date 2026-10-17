// Boss-only weapon rules. Ordinary enemies, weapon cadence and boss AI are untouched.
export const BOSS_WEAPON_BALANCE = Object.freeze({
  shotgun: Object.freeze({ extraPelletWeight:.5, extraVolleyWeight:.75, closeBonusCap:1.2 }),
  focus: Object.freeze({ hitsPerStep:1, step:.03, cap:.25, movementResetSeconds:1 }),
});

export function shotgunBossScale(pellets, basePellets, extraVolley) {
  const rule=BOSS_WEAPON_BALANCE.shotgun;
  const base=Math.min(pellets,basePellets);
  // Spread this weight evenly over the volley, so the left/right side of the
  // spread cannot accidentally receive a different bonus against a machine.
  return (base+(pellets-base)*rule.extraPelletWeight)/pellets * (extraVolley?rule.extraVolleyWeight:1);
}

export class BossFocus {
  constructor() { this.epoch=0;this.reset(); }
  reset() { this.targetId=null;this.hits=0;this.movingFor=0;this.movementReset=false;this.epoch++; }
  get bonus() {
    const rule=BOSS_WEAPON_BALANCE.focus;
    return Math.min(rule.cap,Math.floor(this.hits/rule.hitsPerStep)*rule.step);
  }
  update(dt,moving) {
    this.movingFor=moving?this.movingFor+dt:0;
    if(!moving)this.movementReset=false;
    if(this.movingFor>=BOSS_WEAPON_BALANCE.focus.movementResetSeconds&&!this.movementReset) {
      this.targetId=null;this.hits=0;this.epoch++;this.movementReset=true;
    }
  }
  hit(enemy,epoch,primary) {
    // Piercing followers neither build nor steal the primary target's focus.
    // A bullet fired before a prolonged move cannot restore a reset focus.
    if(!primary||epoch!==this.epoch||this.movementReset)return 0;
    if(enemy.kind!=='boss'){this.targetId=null;this.hits=0;return 0;}
    if(this.targetId!==enemy.id){this.targetId=enemy.id;this.hits=0;}
    const bonus=this.bonus;
    this.hits=Math.min(this.hits+1,Math.ceil(BOSS_WEAPON_BALANCE.focus.cap/BOSS_WEAPON_BALANCE.focus.step)*BOSS_WEAPON_BALANCE.focus.hitsPerStep);
    return bonus;
  }
}
