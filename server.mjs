import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, sep, extname } from 'node:path';
import { networkInterfaces } from 'node:os';

const root = dirname(fileURLToPath(import.meta.url));
const host = process.argv.find(arg => arg.startsWith('--host='))?.slice(7) || '127.0.0.1';
const port = Number(process.env.PORT || 5177);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405); response.end(); return; }
  try {
    let route = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (route === '/') route = '/index.html';
    if (route === '/vendor/phaser.min.js') route = '/node_modules/phaser/dist/phaser.min.js';
    const allowed = ['/index.html', '/style.css', '/node_modules/phaser/dist/phaser.min.js'].includes(route) || route.startsWith('/src/');
    const path = resolve(root, '.' + route);
    if (!allowed || !path.startsWith(root + sep)) { response.writeHead(404); response.end(); return; }
    const body = await readFile(path);
    response.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404); response.end('Introuvable. Lance npm install si Phaser est absent.'); }
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Le port ${port} est occupé. Choisis un autre PORT.` : error.message); process.exitCode = 1; });
server.listen(port, host, () => {
  const listeningPort = server.address().port;
  console.log(`La Mine V2 · prototype V0.33 : http://127.0.0.1:${listeningPort}`);
  if (host === '0.0.0.0') for (const addresses of Object.values(networkInterfaces())) for (const address of addresses || []) {
    if (address.family === 'IPv4' && !address.internal) console.log(`Téléphone, même Wi-Fi : http://${address.address}:${listeningPort}`);
  }
  console.log('Aucun backend, aucune DB, progression locale. Ctrl+C pour arrêter.');
});
