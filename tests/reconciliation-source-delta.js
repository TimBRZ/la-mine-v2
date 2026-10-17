// Explicit inverse of C.1c's admission-only changes. No hashes are regenerated.
// Any other byte change still fails the original C.1b fingerprint guard.
export function beforeReconciliation(file,bytes){
 let s=bytes.toString();
 const replace=(from,to)=>{if(!s.includes(from))throw Error('Missing reviewed C.1c delta: '+file);s=s.replace(from,to);};
 if(['enemies/drill.js','enemies/draisine.js','bosses.js','rail-bosses.js','shaft-actors.js'].includes(file))replace(`import {projectileMuzzleClear} from '${file.startsWith('enemies/')?'../':'./'}projectile-attacks.js';\n`,'');
 if(file==='enemies/drill.js')replace('distance <= DRILL.attackRange && projectileMuzzleClear(this,player))','distance <= DRILL.attackRange)');
 if(file==='enemies/draisine.js')replace('distance<=DRAISINE.attackRange&&projectileMuzzleClear(this,player))','distance<=DRAISINE.attackRange)');
 if(file==='bosses.js')replace("\n        if(this.bossId==='crachefer'&&!projectileMuzzleClear(this,player))return;",'');
 if(file==='rail-bosses.js')replace("if(this.phaseTime<=0){if(this.bossId==='switchman'&&(this.attackCount+1)%2===0&&!projectileMuzzleClear(this,player))return;this.beginWarning(player,context);}",'if(this.phaseTime<=0)this.beginWarning(player,context);');
 if(file==='shaft-actors.js'){
  replace('\n      const next=PATTERNS[this.shaftType][this.attackCount%PATTERNS[this.shaftType].length];','');
  replace("if(this.phaseTime<=0&&(!['steam','energy','radial'].includes(next)||projectileMuzzleClear(this,player))&&((ranged",'if(this.phaseTime<=0&&((ranged');
 }
 if(['rift/actors.js','depths/actors.js','forge/actors.js'].includes(file))replace('import {isPureProjectile,projectileMuzzleClear}','import {isPureProjectile}');
 if(file==='rift/actors.js')replace("if(isPureProjectile(this,pattern)&&!projectileMuzzleClear(this,p,pattern==='orb'?10:5))return;",'');
 if(file==='depths/actors.js'){
  replace('if(isPureProjectile(this,this.nextPattern())&&!projectileMuzzleClear(this,p,5))return;','');
  replace("if(this.pattern==='plant'){this.recover();return;}","if(this.pattern==='plant')this.recover();");
 }
 if(file==='forge/actors.js')replace('if(isPureProjectile(this,this.nextPattern(run))&&!projectileMuzzleClear(this,p,5))return;','');
 if(file==='projectile-attacks.js')replace(`
// Admission only: retain the ready attack while bodies touch. The muzzle and
// projectile geometry stay unchanged; no new cooldown or hidden preparation.
// The bound covers every direction of a fan/radial, including an orb's radius.
export function projectileMuzzleClear(e,p,radius=6){
 return Math.hypot(p.x-e.x,p.y-e.y)>e.radius+(p.radius||0)+2*radius+2;
}
`,'');
 if(file==="enemies/drill.js")replace("if (this.phase === 'warning') {\n        if(!projectileMuzzleClear(this,player))return;","if (this.phase === 'warning') {");
 if(file==="enemies/draisine.js")replace("if(this.phase==='burst') {\n      if(!projectileMuzzleClear(this,player))return;","if(this.phase==='burst') {");
 if(file==="bosses.js")replace("if(this.bossId==='crachefer'&&this.phase==='warning'){this.phaseTime=0;if(!projectileMuzzleClear(this,player))return;}","if(this.bossId==='crachefer'&&this.phase==='warning')this.phaseTime=0;");
 if(file==="rail-bosses.js")replace("if(this.phase==='burst'&&this.phaseTime<=0) {\n      if(!projectileMuzzleClear(this,player))return;","if(this.phase==='burst'&&this.phaseTime<=0) {");
 if(file==="shaft-actors.js")replace("if(this.phase==='warning'&&['steam','energy','radial'].includes(this.pattern)){this.phaseTime=0;if(!projectileMuzzleClear(this,player))return;}","if(this.phase==='warning'&&['steam','energy','radial'].includes(this.pattern))this.phaseTime=0;");
 if(file==="rift/actors.js")replace("if(this.phase==='warning'&&isPureProjectile(this)){this.phaseTime=0;if(!projectileMuzzleClear(this,p,this.pattern==='orb'?10:5))return;}","if(this.phase==='warning'&&isPureProjectile(this))this.phaseTime=0;");
 if(file==="depths/actors.js")replace("if(this.phase==='warning'&&isPureProjectile(this)){this.phaseTime=0;if(!projectileMuzzleClear(this,p,5))return;}","if(this.phase==='warning'&&isPureProjectile(this))this.phaseTime=0;");
 if(file==="forge/actors.js")replace("if(this.phase==='warning'&&isPureProjectile(this)){this.phaseTime=0;if(!projectileMuzzleClear(this,p,5))return;}","if(this.phase==='warning'&&isPureProjectile(this))this.phaseTime=0;");
 if(file==='rift/actors.js')replace("else if(this.phase==='burst'&&this.phaseTime<=0){if(!projectileMuzzleClear(this,p,5))return;if(context.rift","else if(this.phase==='burst'&&this.phaseTime<=0){if(context.rift");
 return Buffer.from(s);
}
