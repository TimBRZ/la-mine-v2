import {V021_FILES} from './v021-authorized-files.js';
import test from 'node:test';
import { COMBAT_APPEARANCES } from '../src/combat-appearances.js';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

test('real server serves every kit asset with the correct MIME and exact bytes, including Android requests', { timeout: 15000 }, async t => {
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: { ...process.env, PORT: '0' }, windowsHide: true,
    stdio: ['ignore','pipe','pipe'],
  });
  t.after(() => child.kill());
  const base = await new Promise((resolve,reject) => {
    let output = '';
    child.once('error',reject);
    child.once('exit',code=>reject(new Error('Server exited: '+code)));
    child.stderr.on('data',data=>reject(new Error(String(data))));
    child.stdout.on('data',data=>{
      output += data;
      const match=output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if(match)resolve(match[0]);
    });
  });
  const root = new URL('../src/assets/kit-da/',import.meta.url);
  const { assets } = JSON.parse(await readFile(new URL('manifest.json',root)));
  for(const {file} of assets) {
    const url = base+'/src/assets/kit-da/'+file;
    const response = await fetch(url, {headers:{'User-Agent':'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36'}});
    assert.equal(response.status,200,file);
    assert.equal(response.headers.get('content-type'),file.endsWith('.svg')?'image/svg+xml':'image/webp',file);
    assert.equal(response.headers.get('x-content-type-options'),'nosniff');
    assert.equal(response.headers.get('cache-control'),'no-store');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(new URL(file,root)),file);
    const head = await fetch(url,{method:'HEAD'});
    assert.equal(head.status,200);
    assert.equal(head.headers.get('content-type'),response.headers.get('content-type'));
    assert.equal((await head.arrayBuffer()).byteLength,0);
  }
  for(const art of Object.values(COMBAT_APPEARANCES)) {
    const response=await fetch(base+'/'+art.url.slice(2),{headers:{'User-Agent':'Mozilla/5.0 (Linux; Android 14) Chrome/130.0.0.0 Mobile'}});
    assert.equal(response.status,200,art.id);assert.equal(response.headers.get('content-type'),'image/svg+xml');
    assert.equal(response.headers.get('cache-control'),'no-store');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(new URL('../'+art.url.slice(2),import.meta.url)));
  }
  const png = await fetch(base+'/src/assets/porion-ravens.png');
  for(const file of ['world.js','bosses.js','epic-upgrades.js'].filter(f=>!V021_FILES.includes(f))) {
    const response=await fetch(base+'/src/'+file);
    assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'text/javascript; charset=utf-8');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(new URL('../src/'+file,import.meta.url)));
  }
  assert.equal(png.status,200);
  assert.equal(png.headers.get('content-type'),'image/png');
  for(const route of ['/src/assets/kit-da/missing.svg','/package.json','/tests/browser-qa.js']) {
    assert.equal((await fetch(base+route)).status,404);
  }
});
