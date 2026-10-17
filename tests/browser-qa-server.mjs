// Local QA only; the normal server never serves /tests/. No new dependency.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, extname, sep } from 'node:path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
http.createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    let route = new URL(req.url, 'http://localhost').pathname;
    if (route === '/') route = '/index.html';
    if (route === '/vendor/phaser.min.js') route = '/node_modules/phaser/dist/phaser.min.js';
    const allowed = ['/index.html', '/style.css', '/node_modules/phaser/dist/phaser.min.js', '/tests/browser-qa.js', '/tests/run-helpers.js', '/tests/tactical-pilot.js', '/tests/tracks-normal-qa.js', '/tests/rail-boss-pilot.js', '/tests/v021-pilot.js', '/tests/v022-pilot.js', '/tests/v023-pilot.js', '/tests/v024-pilot.js', '/tests/v027-pilot.js'].includes(route) || route.startsWith('/src/');
    const path = resolve(root, '.' + route);
    if (!allowed || !path.startsWith(root + sep)) { res.writeHead(404).end(); return; }
    let body = await readFile(path);
    if (route === '/index.html') body = body.toString().replace('./src/main.js', './tests/browser-qa.js');
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404).end(); }
}).listen(5178, '127.0.0.1', () => console.log('QA only: http://127.0.0.1:5178 · isolated QA profile · Ctrl+C to stop'));
