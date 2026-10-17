import {RoomScene} from '../src/room-scene.js';
import {localDebugEnabled} from '../src/debug-zones.js';
let serial=0;
class TempScene extends RoomScene{
 create(){
  super.create();
  if(!localDebugEnabled(location.href))return;
  const panel=document.createElement('details');panel.style.cssText='position:fixed;top:0;left:0;z-index:9999;max-height:55vh;overflow:auto;background:#142936;color:white;padding:4px;font:12px system-ui;max-width:100vw';
  const summary=document.createElement('summary');summary.textContent='QA V0.30 · TEMP';panel.append(summary);
  const report=document.createElement('pre');report.id='qa-report';report.style.cssText='white-space:pre-wrap;max-width:280px';
  const commands=[
   ['Session A',()=>fetch('/__test__/session/a',{method:'POST'})],['Session B',()=>fetch('/__test__/session/b',{method:'POST'})],
   ['Non connecté',()=>fetch('/__test__/session/none',{method:'POST'})],['Session invalide',()=>fetch('/__test__/session/invalid',{method:'POST'})],
   ['Panne TEMP',()=>fetch('/__test__/outage/on',{method:'POST'})],['Rétablir TEMP',()=>fetch('/__test__/outage/off',{method:'POST'})],
   ['Victoire test',()=>this.recordFixture(450000)],['Pire run test',()=>this.recordFixture(600000)],
   ['Double envoi test',()=>this.recordFixture(400000,true)],
   ['Classement',()=>{this.showMenu('leaderboard');return 'Classement ouvert';}],
   ['Défaite via scène',()=>{this.start('shotgun','galleries');this.run.elapsed=100;this.run.player.hp=0;super.update(0,1000/60);return 'Résultat réel de scène contrôlé';}],
   ['Mesures POST',async()=>await(await fetch('/__test__/metrics')).json()],
  ];
  for(const [name,action] of commands){const button=document.createElement('button');button.textContent=name;button.style.cssText='min-height:32px;margin:2px';button.onclick=async()=>{try{const value=await action();report.textContent=JSON.stringify(value instanceof Response?await value.json():value);if(this.menu.state.page==='leaderboard')await this.menu.leaderboardScreen?.refresh();}catch(error){report.textContent=String(error);}panel.open=false;};panel.append(button);}
  panel.append(report);document.body.append(panel);
 }
 async recordFixture(duration,double=false){
  const now=Date.now(),p={run_id:'browser-temp-'+now+'-'+(++serial),zone_id:'tracks',max_wave:20,completed:true,duration_ms:duration,depth_reached_ms:duration-1000,weapon_id:'grisoux',client_version:'0.29.0',run_started_at:new Date(now-duration).toISOString(),run_finished_at:new Date(now).toISOString(),kills:100};
  return double?Promise.all([this.leaderboard.recordPerformance(p),this.leaderboard.recordPerformance(p)]):this.leaderboard.recordPerformance(p);
 }
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:450,height:800,backgroundColor:'#182326',audio:{noAudio:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true,powerPreference:'low-power'},fps:{target:60},input:{activePointers:3},scene:[TempScene]});
