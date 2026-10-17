// Dedicated loopback QA page and isolated local profile. Never loaded by main.js.
import {RoomScene} from '../src/room-scene.js';import {Run} from '../src/run.js';import {UpgradeFlow} from '../src/upgrades.js';
import {Wallet} from '../src/wallet.js';import {LocalProfileStorage,emptyProfile} from '../src/local-profile-storage.js';import {RunPerformance} from '../src/leaderboard/run-performance.js';
import {LocalLeaderboardStore} from '../src/leaderboard/local-store.js';import {LeaderboardService} from '../src/leaderboard/service.js';
import {createEnemy} from '../src/enemies/registry.js';import {energyPilot} from './zone5-pilot.js';import {buildPriority} from './zone5-simulation.mjs';
class Zone5QA extends RoomScene {
 create(){
  super.create();this.hold=true;this.auto=false;
  this.qaStorage=new LocalProfileStorage({getItem:()=>localStorage.getItem('la-mine-v2:qa-zone5'),setItem:(_,s)=>localStorage.setItem('la-mine-v2:qa-zone5',s)});
  this.wallet=new Wallet(this.qaStorage);this.menu.wallet=this.ui.wallet=this.ui.workshop.wallet=this.wallet;
  this.leaderboard=new LeaderboardService(new LocalLeaderboardStore({getItem:()=>localStorage.getItem('la-mine-v2:qa-zone5-ranking'),setItem:(_,s)=>localStorage.setItem('la-mine-v2:qa-zone5-ranking',s)}));this.menu.leaderboard=this.leaderboard;
  const panel=document.createElement('details');panel.id='zone5-qa';panel.style='position:fixed;z-index:999;top:0;left:0;max-height:45vh;overflow:auto;background:#10202c;color:white;font:11px system-ui;max-width:100%';panel.innerHTML='<summary>QA Zone 5</summary>';
  this.report=document.createElement('pre');this.report.id='zone5-report';this.report.style='white-space:pre-wrap;max-width:310px';
  const actions=[['Nouvelle sauvegarde QA',()=>{this.wallet.profile={...emptyProfile(),progress:{riftCompleted:true}};this.qaStorage.write(this.wallet.snapshot);this.showMenu('zones');}],['Carte QA',()=>this.showMenu('zones')],['Débloquer QA',()=>{this.wallet.profile.progress={riftCompleted:true};this.qaStorage.write(this.wallet.snapshot);this.showMenu('zones');}],['Ennemis + extinction',()=>this.preview(1)],...[5,10,15,20].map(n=>['Boss '+n,()=>this.preview(n)]),['Extinction',()=>{this.run.depths.darkness.cooldown=0;this.run.depths.darkness.start(this.run.wave.final);this.drawActors(0);this.publish();}],['Observer 1 s',()=>{this.hold=false;for(let i=0;i<60;i++)super.update(0,1000/60);this.hold=true;this.publish();}],['Pause QA',()=>{this.hold=true;this.publish();}],['Reprendre QA',()=>{this.hold=false;}],...['shotgun','smg','grisoux'].map(id=>['Run complète '+id,()=>this.begin(id)]),['Classement QA',()=>this.showMenu('leaderboard')]];
  actions.push(['Extinction + roches',()=>{this.preview(1);const random=this.run.random;this.run.random=()=>.2;for(let i=0;i<21;i++)this.run.update(1/60);this.run.random=random;this.drawActors(0);}],['Avancer 0,1 s',()=>{for(let i=0;i<6;i++)super.update(0,1000/60);this.publish();}]);
  actions.push(...[16,17,18,19].map(n=>['Vague '+n,()=>{this.prepare();this.auto=false;this.hold=true;const r=this.run;r.waveIndex=n-2;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';r.weapon.cooldown=999;for(let i=0;i<80;i++)r.update(1/60);r.depths.darkness.start();this.drawActors(0);}]),['Trois roches',()=>{this.run.depths.ground.clear();this.run.depths.requestExtinctionRocks();this.drawActors(0);}],['Boss sous 50 %',()=>{for(const e of this.run.enemies)if(e.kind==='boss')e.hp=e.maxHealth*.49;this.drawActors(0);}]);
  for(const[label,fn]of actions){const b=document.createElement('button');b.textContent=label;b.style='font:12px system-ui;padding:7px';b.onclick=()=>{fn();this.publish();};panel.append(b);}panel.append(this.report);document.body.append(panel);this.showMenu('zones');this.publish();
 }
 prepare(weaponId='grisoux'){
  this.wallet.profile.progress={...this.wallet.profile.progress,riftCompleted:true};this.wallet.profile.levels={power:2,health:2,mechanics:2,mobility:2};this.qaStorage.write(this.wallet.snapshot);super.start(weaponId,'depths');
  let seed=1;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  this.run=new Run(random,this.wallet.snapshot.levels,{zoneId:'depths',weaponId,rewardRandom:()=>.99});this.runPerformance=new RunPerformance(this.run);this.upgrades=new UpgradeFlow(this.run,random);this.upgrades.open();this.autoChoose();this.drawWeapon();this.metrics={weaponId,maxBolts:0,maxGround:0,maxMajors:0,maxCharges:0,darkFrames:0,steps:0,updateMs:0,maxUpdateMs:0};this.movement.read=()=>this.auto?energyPilot(this.run):{x:0,y:0};
 }
 autoChoose(){if(this.upgrades.active){const priority=buildPriority(this.run.weapon.definition.id);this.upgrades.choose(priority.find(id=>this.upgrades.offered.some(p=>p.id===id))||this.upgrades.offered[0].id);this.choices.hide();this.ui.hide();this.mode='playing';}}
 begin(id){this.prepare(id);this.auto=true;this.hold=false;}
 preview(n){this.prepare();this.auto=false;this.hold=true;const r=this.run;r.weapon.cooldown=999;r.untilSpawn=999;r.player.x=320;r.player.y=540;
  if(n>1){r.waveIndex=n-2;r.wavePhase='cleared';r.enterNextWave();r.wavePhase='combat';for(const e of r.enemies)e.warmup=0;
   if(n===20){r.depths.begin(r.enemies[0],'beam',r.player);r.depths.begin(r.enemies[1],'charges',r.player);}
   else r.depths.begin(r.enemies[0],n===5?'fan':n===10?'chain':'cracks',r.player);
  }else {r.enemies=['lampist','blaster','blackmaw'].map((id,i)=>{const e=createEnemy(id,100+i,115+i*100,250+i*80);e.warmup=0;return e;});r.depths.begin(r.enemies[0],'light',r.player);r.depths.begin(r.enemies[1],'plant',r.player);r.depths.begin(r.enemies[2],'leap',r.player);}
  r.depths.darkness.start(r.wave.final);this.drawActors(0);this.publish();
 }
 publish(){if(!this.report)return;const r=this.run;this.report.textContent=JSON.stringify({...this.metrics,mode:this.mode,status:r.status,wave:r.waveNumber,hp:r.player.hp,seconds:+r.elapsed.toFixed(2),extinction:r.depths?.darkness.active,phases:r.enemies.map(e=>({type:e.depthsType,phase:e.phase,pattern:e.pattern})),progress:this.wallet.snapshot.progress,diamonds:this.wallet.snapshot.wallet.diamond},null,2);}
 update(t,ms){if(!this.run||this.hold)return;const started=performance.now();for(let i=0;i<(this.auto?16:1);i++){
   if(this.auto&&this.mode==='choice')this.autoChoose();if(this.mode==='paused'&&this.auto)this.resumeRun();super.update(t,this.auto?1000/60:ms);
   if(this.metrics){const r=this.run;this.metrics.steps++;this.metrics.maxBolts=Math.max(this.metrics.maxBolts,r.hostileProjectiles.pool.filter(b=>b.active).length);this.metrics.maxGround=Math.max(this.metrics.maxGround,r.shaftHazards?.items.length||0);this.metrics.maxMajors=Math.max(this.metrics.maxMajors,r.depths?.majorOwners().size||0);this.metrics.maxCharges=Math.max(this.metrics.maxCharges,r.shaftHazards?.items.filter(h=>h.charge).length||0);this.metrics.darkFrames+=r.depths?.darkness.active?1:0;}
   if(this.mode==='result'){this.hold=true;break;}
  }if(this.metrics){const spent=performance.now()-started;this.metrics.updateMs+=spent;this.metrics.maxUpdateMs=Math.max(this.metrics.maxUpdateMs,spent);}this.publish();}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:450,height:800,backgroundColor:'#182326',audio:{noAudio:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true,powerPreference:'low-power'},fps:{target:60},input:{activePointers:3},scene:[new URLSearchParams(location.search).get('normal')==='1'?RoomScene:Zone5QA]});


