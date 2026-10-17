// Test-only same-origin host. Uses the actual, unmodified CGWeb proxy modules.
import http from 'node:http';import {readFile} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cg='C:/Users/Tim Pro/Documents/Sauvegarde CGWEB/CGWeb_BASE_VALIDEE_PHASE6G_02-09-2026/CoupDeGrisouWeb';
process.env.API_INTERNAL_URL='http://127.0.0.1:5186';
async function moduleAt(file){return import('data:text/javascript;base64,'+Buffer.from(await readFile(path.join(cg,file))).toString('base64'));}
const {proxyMineRecords}=await moduleAt('frontend/lib/mine-records-proxy.js');
const identity=await moduleAt('frontend/app/api/player/[action]/route.js');
let outage=false,posts=0;
const origin='http://127.0.0.1:5185';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'};
async function send(res,response){res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,origin),route=url.pathname;
  if(route==='/__mine_temp__/status')return send(res,Response.json({environment:'mine-leaderboard-temp-v030'}));
  if(route==='/__test__/metrics')return send(res,Response.json({posts,outage}));
  let body;if(!['GET','HEAD'].includes(req.method)){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>4096)return send(res,Response.json({detail:'Too large'},{status:413}));chunks.push(chunk);}body=Buffer.concat(chunks);}
  const request=new Request(url,{method:req.method,headers:req.headers,...(body?{body}:{})});
  if(route.startsWith('/__test__/')){
   if(req.method!=='POST'||req.headers.origin!==origin)return send(res,Response.json({detail:'Forbidden'},{status:403}));
   if(route.startsWith('/__test__/outage/')){outage=route.endsWith('/on');return send(res,Response.json({outage}));}
   if(!/^\/__test__\/session\/(a|b|none|invalid)$/.test(route))return send(res,new Response(null,{status:404}));
   return send(res,await fetch('http://127.0.0.1:5186'+route,{method:'POST',headers:{Origin:origin}}));
  }
  if(route.startsWith('/api/')){
   if(route==='/api/mine/runs'&&req.method==='POST')posts++;
   if(outage)return send(res,Response.json({detail:'TEMP backend simulated unavailable'},{status:503}));
   if(route==='/api/player/identity')return send(res,await identity.GET(request,{params:Promise.resolve({action:'identity'})}));
   return send(res,await proxyMineRecords(request,route.slice('/api/mine/'.length)));
  }
  let file=route==='/'?'/index.html':route;
  if(file==='/vendor/phaser.min.js')file='/node_modules/phaser/dist/phaser.min.js';
  const allowed=['/index.html','/style.css','/node_modules/phaser/dist/phaser.min.js','/tests/v030-browser-qa.js'].includes(file)||file.startsWith('/src/');
  const resolved=path.resolve(root,'.'+decodeURIComponent(file));if(!allowed||!resolved.startsWith(root+path.sep))return send(res,new Response(null,{status:404}));
  let data=await readFile(resolved);if(file==='/index.html'&&url.searchParams.get('qa')==='1'&&url.searchParams.get('debug')==='1')data=Buffer.from(data.toString().replace('./src/main.js','./tests/v030-browser-qa.js'));
  res.writeHead(200,{'Content-Type':mime[path.extname(resolved)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(502,{'Content-Type':'application/json'});res.end('{"detail":"TEMP host unavailable"}');}
});
server.listen(5185,'127.0.0.1',()=>console.log('TEMP test host: '+origin+'/?debug=1&leaderboard=remote&qa=1'));
