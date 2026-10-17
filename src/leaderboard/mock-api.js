// Explicit local mock, never a CGWeb session or a real network request.
export function mockFetch(scenario='connected'){
 return async(path,{method}={})=>{
  if(scenario==='offline')throw Error('mock offline');
  if(path.endsWith('/__mine_temp__/status'))return Response.json({environment:'mine-leaderboard-temp-v030'});
  if(path.endsWith('/identity'))return Response.json(scenario==='anonymous'?{authenticated:false}:{authenticated:true,player_id:'mock-a',display_name:'MINEUR MOCK'});
  if(method==='POST')return Response.json(scenario==='post-error'?{detail:'Mock refusé'}:{ok:true},{status:scenario==='post-error'?503:200});
  const url=new URL(path,'http://localhost'),category=url.pathname.split('/').at(-1),zoneId=category==='time'?url.searchParams.get('zone_id'):'tracks';
  return Response.json({category,zone_id:category==='time'?zoneId:null,week_key:'2026-10-05',entries:[{rank:1,player_id:'mock-b',display_name:'MINEUR MOCK',zone_id:zoneId,max_wave:20,duration_ms:240000,weapon_id:'smg'},{rank:2,player_id:'mock-a',display_name:'MINEUR MOCK',zone_id:zoneId,max_wave:18,duration_ms:300000,weapon_id:'grisoux'}]});
 };
}
