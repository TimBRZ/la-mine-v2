import test from 'node:test';import assert from 'node:assert/strict';import{spawn}from'node:child_process';import{readFile}from'node:fs/promises';import{fileURLToPath}from'node:url';import{RIFT_SHEETS}from'../src/rift-sprite-catalog.js';
test('V035B production server serves six exact SVG sheets and renderer modules to Android user agents',{timeout:15000},async t=>{
 const child=spawn(process.execPath,['server.mjs'],{cwd:fileURLToPath(new URL('../',import.meta.url)),env:{...process.env,PORT:'0'},windowsHide:true,stdio:['ignore','pipe','pipe']});t.after(()=>child.kill());
 const base=await new Promise((resolve,reject)=>{let output='';child.once('error',reject);child.once('exit',code=>reject(Error('Server exited '+code)));child.stderr.on('data',d=>reject(Error(String(d))));child.stdout.on('data',d=>{output+=d;const m=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(m)resolve(m[0]);});});
 assert.equal(Object.keys(RIFT_SHEETS).length,6);
 for(const path of [...Object.values(RIFT_SHEETS).map(s=>s.url.slice(2)),'src/rift-animation.js','src/rift-sprite-catalog.js']){
  const response=await fetch(base+'/'+path,{headers:{'User-Agent':'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile'}});assert.equal(response.status,200,path);assert.equal(response.headers.get('content-type'),path.endsWith('.svg')?'image/svg+xml':'text/javascript; charset=utf-8');assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(new URL('../'+path,import.meta.url)));assert.equal(response.headers.get('cache-control'),'no-store');
 }
});
