// Concurrency is budgeted, not scheduled: each boss retains its own cycle.
export function nextTripleMajor(boss) {
  const n=(boss.attackCount||0)+1,id=boss.bossId;
  if(id==='compressor')return n%3!==1;
  if(id==='firedamp')return n%3!==0;
  if(id==='crachefer')return n%4===0;
  if(id==='switchman')return n%2===1||n%6===0;
  return true;
}
export function tripleOwners(run,majorOnly=false) {
  const owners=new Set(),bosses=run.enemies.filter(e=>e.kind==='boss'&&e.alive);
  for(const b of bosses){
    const attacking=['warning','charge','burst'].includes(b.phase);
    if(attacking&&(!majorOnly||b.tripleMajor))owners.add(b.id);
    if(b.hazards?.length||b.zones?.length)owners.add(b.id);
  }
  for(const h of run.shaftHazards?.items||[])if(h.owner)owners.add(h.owner);
  // Reservations cover the frame between warning completion and emission.
  // Bolts stay budgeted even when their owner has just died.
  for(const id of run.hostileProjectiles.reservations.keys())owners.add(id);
  for(const p of run.hostileProjectiles.pool)if(p.active&&(!majorOnly||p.bossMajor))owners.add(p.owner);
  for(const e of run.enemies)if(e.alive&&e.summoner)owners.add(e.summoner);
  return owners;
}
export function updateTripleBoss(run,boss,dt,attacks,context) {
  if(!run.wave.final||boss.kind!=='boss'){boss.update(dt,run.player,attacks,context);return;}
  const bosses=run.enemies.filter(e=>e.kind==='boss'&&e.alive);
  const health=bosses.reduce((s,b)=>s+b.hp,0);
  const late=health<run.tripleStartingHealth*.5;
  const idle=['positioning','chase'].includes(boss.phase);
  const ground=(boss.hazards?.length||boss.zones?.length||(run.shaftHazards?.items||[]).some(h=>h.owner===boss.id));
  // Only idle/recovery timers accelerate. Movement, warnings and attack lifetimes
  // still use real dt; active ground effects never lose their recovery phase.
  if(boss.active&&(idle||boss.phase==='recovery'&&!ground))boss.phaseTime-=dt*(1/(late?.55:.72)-1);
  if(boss.active&&idle&&boss.phaseTime<=dt){
    const major=nextTripleMajor(boss),others=tripleOwners(run,true);
    // A completed summon is emitted after all bosses update this frame.
    for(const attack of attacks)if(attack.type==='summon-wagon'||attack.pattern==='circle')others.add(attack.owner);
    others.delete(boss.id);
    if(major&&others.size>=2)boss.phaseTime=dt+.15;
    else boss.tripleMajor=major;
  }
  const attackCount=boss.attackCount;
  boss.update(dt,run.player,attacks,context);
  // A refused circle becomes a small volley. Classify what was actually chosen,
  // so a later projectile retry cannot resurrect a released major slot.
  if(idle&&boss.attackCount!==attackCount){
    if(boss.bossId==='crachefer')boss.tripleMajor=boss.projectilePattern==='circle';
    else if(boss.bossId==='switchman')boss.tripleMajor=boss.pattern!=='burst'||boss.projectilePattern==='circle';
    else if(boss.bossId==='compressor')boss.tripleMajor=boss.pattern==='pressure'||boss.projectilePattern==='circle';
    else if(boss.bossId==='firedamp')boss.tripleMajor=boss.pattern!=='energy';
  }
}
