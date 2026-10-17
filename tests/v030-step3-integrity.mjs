import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const root='C:/Users/Tim Pro/Documents/Sauvegarde CGWEB/CGWeb_BASE_VALIDEE_PHASE6G_02-09-2026/CoupDeGrisouWeb';
const file=new URL('./v030-step3-cgweb-before.json',import.meta.url),hashes={};
async function walk(dir){for(const entry of await fs.readdir(path.join(root,dir),{withFileTypes:true})){const name=dir+'/'+entry.name;if(entry.isDirectory()&&entry.name!=='__pycache__')await walk(name);else if(entry.isFile()&&/\.(py|sql|js|mjs|txt)$/.test(name))hashes[name]=createHash('sha256').update(await fs.readFile(path.join(root,name))).digest('hex');}}
for(const dir of ['backend/app','backend/tests','backend/docs','frontend/app/api','frontend/lib','frontend/tests'])await walk(dir);
for(const name of await fs.readdir(path.join(root,'backend/data')))if(/\.db($|-)/.test(name))hashes['backend/data/'+name]=createHash('sha256').update(await fs.readFile(path.join(root,'backend/data',name))).digest('hex');
if(process.argv.includes('--capture')){await fs.writeFile(file,JSON.stringify(hashes,null,2));console.log('CGWeb baseline captured; no SQLite connection.');}
else {assert.deepEqual(hashes,JSON.parse(await fs.readFile(file,'utf8')));const report={cgweb_files_unchanged:Object.keys(hashes).length,real_db_sha256:hashes['backend/data/carbon_league.db'],before_equals_after:true,no_production_service_commands:true};await fs.writeFile(new URL('./v030-step3-integrity.json',import.meta.url),JSON.stringify(report,null,2));console.log(report);}
