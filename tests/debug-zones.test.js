import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {localDebugEnabled,changeDebugZones,mountDebugZones,DEBUG_BACKUP_KEY} from '../src/debug-zones.js';
import {STORAGE_KEY,emptyProfile,sanitizeProfile} from '../src/local-profile-storage.js';import {completeZone,zoneAvailable} from '../src/zone-progress.js';
const url='http://192.168.1.196:5177/src/debug.html?debug=1';
const fixture=()=>({...emptyProfile(),wallet:{coal:123,iron:42,diamond:7,token:3},levels:{power:2,health:1,mechanics:2,mobility:1},talents:['porion-eye'],relief:{startedAt:1700000000000},crates:{count:3,lastDaily:'2026-10-08'},custom:{keep:true}});
function memory(profile){const data=new Map(profile?[ [STORAGE_KEY,JSON.stringify(profile)] ]:[]);return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};}
const withoutProgress=p=>{const copy=structuredClone(p);delete copy.progress;return copy;};
test('debug requires explicit opt-in and a loopback or private IPv4 address',()=>{
 for(const host of ['localhost','127.0.0.1','[::1]','192.168.1.196','192.168.1.15','10.2.3.4','172.16.1.1','172.31.255.254'])assert.equal(localDebugEnabled('http://'+host+':5177/src/debug.html?debug=1'),true,host);
 for(const host of ['example.com','192.168.1.15.example.com','8.8.8.8','172.15.1.1','172.32.1.1'])assert.equal(localDebugEnabled('http://'+host+'/src/debug.html?debug=1'),false,host);
 for(const u of ['http://localhost/src/debug.html','http://localhost/src/debug.html?debug=0','file:///src/debug.html?debug=1'])assert.equal(localDebugEnabled(u),false);
});
test('normal mode does not touch DOM or storage, including direct command calls',()=>{
 let calls=0;const denied=new Proxy({}, {get(){calls++;throw Error('unexpected access');}});
 for(const u of ['http://localhost/','https://example.com/src/debug.html?debug=1']){mountDebugZones(denied,u,()=>denied);assert.throws(()=>changeDebugZones(denied,u,'unlock'),/réservé/);}assert.equal(calls,0);
});
test('unlock only changes zone progress, not resources or any meta system',()=>{
 const before=fixture(),s=memory(before);changeDebugZones(s,url,'unlock');const after=JSON.parse(s.getItem(STORAGE_KEY));assert.deepEqual(withoutProgress(after),before);
 const p=sanitizeProfile(after).progress;assert.equal(p.galleriesCompleted,true);assert.equal(p.tracksCompleted,true);assert.equal(p.shaftUnlocked,true);assert.equal(p.shaftCompleted,true);
 for(const id of ['galleries','tracks','shaft59','rift','depths'])assert.equal(zoneAvailable(id,p),true);
 assert.equal(p.riftCompleted,true);assert.equal(p.riftFirstVictoryClaimed,true);assert.equal(p.depthsCompleted,true);assert.equal(p.depthsFirstVictoryClaimed,true);assert.equal(zoneAvailable('depths',p),true);assert.equal(p.forgeCompleted,false);assert.equal(p.forgeFirstVictoryClaimed,false);assert.equal(zoneAvailable('forge',p),true);
 for(const id of ['tracks','shaft59'])assert.equal(completeZone(id,p).firstDiamond,0);
 assert.equal(completeZone('rift',p).firstDiamond,0);assert.equal(after.wallet.diamond,7);assert.deepEqual(after.crates,before.crates);
});
test('a new origin works with an empty profile and receives no resources',()=>{const s=memory();changeDebugZones(s,url,'unlock');assert.deepEqual(JSON.parse(s.getItem(STORAGE_KEY)).wallet,emptyProfile().wallet);});
test('repeated unlocks are idempotent and retain the initial progress backup',()=>{
 const s=memory(fixture());changeDebugZones(s,url,'unlock');const first=s.getItem(STORAGE_KEY),backup=s.getItem(DEBUG_BACKUP_KEY);changeDebugZones(s,url,'unlock');assert.equal(s.getItem(STORAGE_KEY),first);assert.equal(s.getItem(DEBUG_BACKUP_KEY),backup);
});
test('unlock preserves already completed Zone 3 and claimed victory flags',()=>{const p=fixture();p.progress={shaftCompleted:true,shaftFirstVictoryClaimed:true};const s=memory(p);changeDebugZones(s,url,'unlock');assert.equal(JSON.parse(s.getItem(STORAGE_KEY)).progress.shaftCompleted,true);});
test('extended unlock preserves an actual Zone 4 victory and its claimed reward',()=>{
 const p=fixture();p.progress={shaftCompleted:true,riftCompleted:true,riftFirstVictoryClaimed:true};const s=memory(p);changeDebugZones(s,url,'unlock');const after=JSON.parse(s.getItem(STORAGE_KEY));assert.equal(after.progress.riftCompleted,true);assert.equal(after.progress.riftFirstVictoryClaimed,true);assert.equal(completeZone('rift',after.progress).firstDiamond,0);assert.deepEqual(withoutProgress(after),withoutProgress(p));
});
test('extended unlock reuses a previous debug backup and reset restores pre-debug progress',()=>{
 const p=fixture();p.progress={galleriesCompleted:true};const s=memory(p);const backup=JSON.stringify({version:1,present:true,progress:p.progress});s.setItem(DEBUG_BACKUP_KEY,backup);s.setItem(STORAGE_KEY,JSON.stringify({...p,progress:{galleriesCompleted:true,tracksCompleted:true}}));
 changeDebugZones(s,url,'unlock');assert.equal(JSON.parse(s.getItem(STORAGE_KEY)).progress.riftUnlocked,true);assert.equal(s.getItem(DEBUG_BACKUP_KEY),backup);changeDebugZones(s,url,'reset');assert.deepEqual(JSON.parse(s.getItem(STORAGE_KEY)),p);
});
test('reset restores only original progress, preserving changes to resources and meta since unlock',()=>{
 const p=fixture();p.progress={galleriesCompleted:true,tracksCompleted:false};const s=memory(p);changeDebugZones(s,url,'unlock');const later=JSON.parse(s.getItem(STORAGE_KEY));later.wallet.coal=140;later.crates.count=4;later.levels.power=3;s.setItem(STORAGE_KEY,JSON.stringify(later));changeDebugZones(s,url,'reset');const restored=JSON.parse(s.getItem(STORAGE_KEY));assert.deepEqual(restored.progress,p.progress);assert.deepEqual(withoutProgress(restored),withoutProgress(later));assert.equal(s.getItem(DEBUG_BACKUP_KEY),null);
});
test('reset restores absent legacy progress and is harmless without a backup',()=>{const p=fixture(),s=memory(p);changeDebugZones(s,url,'reset');assert.deepEqual(JSON.parse(s.getItem(STORAGE_KEY)),p);changeDebugZones(s,url,'unlock');changeDebugZones(s,url,'reset');assert.deepEqual(JSON.parse(s.getItem(STORAGE_KEY)),p);});
test('malformed or unknown profiles are not overwritten',()=>{for(const raw of ['{bad','null','{"version":2}']){const s=memory();s.setItem(STORAGE_KEY,raw);assert.throws(()=>changeDebugZones(s,url,'unlock'));assert.equal(s.getItem(STORAGE_KEY),raw);}});
test('storage write failure does not alter the profile',()=>{const s=memory(fixture()),raw=s.getItem(STORAGE_KEY);s.setItem=()=>{throw Error('quota');};assert.throws(()=>changeDebugZones(s,url,'unlock'),/quota/);assert.equal(s.getItem(STORAGE_KEY),raw);});
test('local debug buttons execute explicit actions and report failures',()=>{
 const nodes=Object.fromEntries(['debug-tools','debug-unavailable','debug-unlock','debug-reset','debug-status'].map(id=>['#'+id,{hidden:true,textContent:''}]));const doc={querySelector:id=>nodes[id]},s=memory(fixture());mountDebugZones(doc,url,()=>s);assert.equal(nodes['#debug-tools'].hidden,false);nodes['#debug-unlock'].onclick();assert.match(nodes['#debug-status'].textContent,/débloquées/);nodes['#debug-reset'].onclick();assert.match(nodes['#debug-status'].textContent,/restaurée/);
 mountDebugZones(doc,url,()=>{throw Error('stockage inaccessible');});nodes['#debug-unlock'].onclick();assert.match(nodes['#debug-status'].textContent,/Échec.*stockage inaccessible/);
});
test('normal entry point and menu have no debug integration; standalone controls are hidden initially',async()=>{
 for(const f of ['index.html','src/main.js','src/room-scene.js','src/menu/main-menu.js'])assert.doesNotMatch(await readFile(new URL('../'+f,import.meta.url),'utf8'),/debug-zones|debug.html|DÉBLOQUER LES ZONES DE TEST/);
 const html=await readFile(new URL('../src/debug.html',import.meta.url),'utf8');assert.match(html,/id="debug-tools" hidden/);assert.match(html,/DEBUG LOCAL · TEMPORAIRE/);
});
