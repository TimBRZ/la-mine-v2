import {RANKED_ZONES} from './records.js';
// Fictional view data only: never submitted to LocalLeaderboardStore.
const NAMES=['Ravens Démo','Lanterne','Cuivre','Pioche','Braise','Gravier','Étincelle','Boulon','Quartz','Suie'];
export function demoLeaderboard(category,zoneId) {
 return NAMES.map((name,i)=>{
  const order=category==='time'?RANKED_ZONES.find(z=>z.id===zoneId)?.order:4-Math.floor(i/3);
  const zone=RANKED_ZONES.find(z=>z.order===order);if(!zone)return null;
  return {playerId:'demo-'+i,name,isDemo:true,isLocal:false,performance:{zone_id:zone.id,max_wave:category==='time'?20:20-(i%3)*3,completed:category==='time'||i%3===0,duration_ms:(280+order*100+i*23)*1000,depth_reached_ms:(220+order*100+i*19)*1000,weapon_id:['shotgun','smg','grisoux'][i%3]}};
 }).filter(Boolean);
}
