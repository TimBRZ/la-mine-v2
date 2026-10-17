import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {LAMPIST_SHOT as S,lampistShotKind,lampistMuzzleOffset,preloadLampistShot,registerLampistShot,useLampistShot,LampistShotView} from '../src/lampist-projectile-vfx.js';
import {beforeLampistVisual} from './lampist-visual-delta.js';
import {Run} from '../src/run.js';import {createEnemy} from '../src/enemies/registry.js';import {createBoss} from '../src/bosses.js';
import {EnemyAttacksView} from '../src/enemies/view.js';import {BOSS_KITS,LATE_KITS,ULTIMATES} from '../src/depths/boss-patterns.js';
const hash=b=>createHash('sha256').update(b).digest('hex');
function fixture(){
 const frames=new Map(),t={source:[{width:384,height:32}],has:k=>frames.has(k),get:k=>frames.get(k),add:(k,_,x,y,w,h)=>frames.set(k,{cutX:x,cutY:y,cutWidth:w,cutHeight:h})},map=new Map([[S.key,t]]),textures={exists:k=>map.has(k),get:k=>map.get(k)};
 const images=[],logs=[];let cleanup;const scene={textures,reducedMotion:false,events:{once:(_,f)=>cleanup=f},add:{image:()=>{const p={};for(const m of ['setDepth','setVisible','setTexture','setOrigin','setDisplaySize','setPosition','setRotation','setCrop','destroy'])p[m]=(...a)=>{p[m+'Args']=a;return p;};images.push(p);return p;},graphics:()=>{const g={};for(const m of ['setDepth','clear','lineStyle','lineBetween','fillStyle','fillCircle','strokeCircle'])g[m]=(...a)=>{logs.push([m,...a]);return g;};return g;}}};
 registerLampistShot(textures);return{scene,frames,t,map,images,logs,cleanup:()=>cleanup()};
}
const enemy=(major=false)=>({id:1,kind:major?'boss':'lampist',bossId:major?'lampmajor':undefined,pattern:'light',x:200,y:300,radius:major?28:17,alive:true,active:true});
const bolt=()=>({id:0,owner:1,active:true,x:224,y:300,angle:0,distance:0,spec:{speed:118,radius:5,range:300,damage:.5}});
for(const major of [false,true])for(let direction=0;direction<8;direction++)test(`C2 actual projector socket ${major?'Major':'standard'} ${direction}, frozen offset joins true path`,()=>{
 const f=fixture(),b=bolt(),e=enemy(major),kind=major?'lampistMajor':'lampist',size=major?88:52,body={texture:{key:'depths-v036c-fixture'},displayWidth:size,displayHeight:size,flipX:direction>=3&&direction<=5,x:0,y:0},im=f.scene.add.image();b.angle=direction*Math.PI/4;b.x=e.x+Math.cos(b.angle)*(e.radius+7);b.y=e.y+Math.sin(b.angle)*(e.radius+7);
 const before=JSON.stringify(b),offset=lampistMuzzleOffset(e,body,b,kind);useLampistShot(im,f.scene.textures,b,kind,false,offset);
 const socket=[e.x+(body.flipX?-1:1)*(major?249/833.08:94/359.7)*size,e.y+(major?183/833.08:80/359.7)*size];assert.ok(im.setPositionArgs.every((v,i)=>Math.abs(v-socket[i])<1e-9));assert.equal(JSON.stringify(b),before);
 b.distance=40;b.x+=Math.cos(b.angle)*40;b.y+=Math.sin(b.angle)*40;body.flipX=!body.flipX;e.x+=100;useLampistShot(im,f.scene.textures,b,kind,false,offset);assert.deepEqual(im.setPositionArgs,[b.x,b.y]);assert.deepEqual(im.setRotationArgs,[b.angle]);
});
test('C2 every existing source byte unchanged except exact preload and render calls',()=>{
 for(const f of JSON.parse(fs.readFileSync('production-v038c2-lampist-projectile/notes/before-hashes.json')))assert.equal(hash(beforeLampistVisual(f.path.slice(4),fs.readFileSync(f.path))),f.hash,f.path);
});
test('C2 one versioned four-frame flat sheet, shared stable body and zero raster dependencies',()=>{
 const calls=[];preloadLampistShot({load:{svg:(...a)=>calls.push(a)}});assert.equal(calls.length,1);assert.equal(calls[0][0],S.key);assert.deepEqual(calls[0][2],{width:384,height:32});
 const svg=fs.readFileSync(S.url,'utf8');assert.equal(svg,fs.readFileSync('production-v038c2-lampist-projectile/assets/sheet.svg','utf8'));assert.doesNotMatch(svg,/filter|gradient|<image|animate/i);const bodies=[...svg.matchAll(/<g id="body"[\s\S]*?<\/g>/g)].map(m=>m[0]);assert.equal(bodies.length,4);assert.equal(new Set(bodies).size,1);assert.equal(fixture().frames.size,4);
});
for(const major of [false,true])for(let direction=0;direction<8;direction++)test(`C2 ${major?'Major':'Lampiste'} direction ${direction}, same muzzle, correct ratio, no gameplay write`,()=>{
 const f=fixture(),b=bolt(),e=enemy(major),im=f.scene.add.image();b.angle=direction*Math.PI/4;b.x=e.x+Math.cos(b.angle)*(e.radius+7);b.y=e.y+Math.sin(b.angle)*(e.radius+7);const before=JSON.stringify(b);
 const kind=lampistShotKind(b,e,'depths');assert.equal(kind,major?'lampistMajor':'lampist');assert.equal(useLampistShot(im,f.scene.textures,b,kind),true);assert.deepEqual(im.setPositionArgs,[b.x,b.y]);assert.deepEqual(im.setRotationArgs,[b.angle]);assert.deepEqual(im.setOriginArgs,[2/3,.5]);assert.deepEqual(im.setDisplaySizeArgs,[major?62:44,(major?62:44)/3]);assert.deepEqual(im.setCropArgs,[42,0,54,32]);assert.equal(JSON.stringify(b),before);
});
for(const pattern of ['major-sweep','major-dark','major-aim','major-cross','major-blackout','beam','blackout','combo-light','combo-corridor','combo-heavy'])test('C2 special excluded '+pattern,()=>{const e={...enemy(true),pattern};assert.equal(lampistShotKind(bolt(),e,'depths'),null);e.bossSequence={};e.pattern='light';assert.equal(lampistShotKind(bolt(),e,'depths'),null);});
test('C2 only legacy mobile Major light/fan eligible, normal Major kit has none',()=>{
 const e=enemy(true),b=bolt();e.pattern='fan';b.spec.speed=110;assert.equal(lampistShotKind(b,e,'depths'),'lampistMajor');
 assert.deepEqual(BOSS_KITS.lampmajor,['major-sweep','major-aim','major-dark','major-cross']);assert.equal(ULTIMATES.lampmajor,'major-blackout');assert.ok(!LATE_KITS.lampmajor.some(p=>['light','fan'].includes(p)));
 for(const kind of ['drill','riveter','spitter','blaster','dynamiter'])assert.equal(lampistShotKind(b,{...e,kind,bossId:kind},'depths'),null);
 assert.equal(lampistShotKind({...b,orb:true},e,'depths'),null);assert.equal(lampistShotKind(b,e,'forge'),null);
});
test('C2 loop160ms stable scale and reduced motion, trail revealed only after travel',()=>{const f=fixture(),im=f.scene.add.image(),b=bolt();for(let i=0;i<12;i++){b.distance=(i+.1)*.04*118;useLampistShot(im,f.scene.textures,b,'lampist');assert.equal(im.setTextureArgs[1],String(i%4));assert.deepEqual(im.setDisplaySizeArgs,[44,44/3]);}useLampistShot(im,f.scene.textures,b,'lampist',true);assert.equal(im.setTextureArgs[1],'0');assert.deepEqual(im.setCropArgs,[0,0,96,32]);});
for(const defect of ['missing','dimensions','frame','coordinates'])test('C2 '+defect+' uses original procedural fallback, never foreign asset',()=>{
 const f=fixture(),v=new EnemyAttacksView(f.scene),b=bolt(),r={enemies:[enemy()],world:{id:'depths'},hostileProjectiles:{pool:[b]}};v.update(r);assert.equal(v.lampistShots.sprites[0].setVisibleArgs[0],true);assert.equal(f.logs.some(x=>x[0]==='fillCircle'),false);
 if(defect==='missing')f.map.clear();if(defect==='dimensions')f.t.source[0].width=99;if(defect==='frame')f.frames.delete('0');if(defect==='coordinates')f.frames.get('0').cutX=9;f.logs.length=0;v.update(r);assert.equal(v.lampistShots.sprites[0].setVisibleArgs[0],false);assert.ok(f.logs.some(x=>x[0]==='fillCircle'&&x[3]===5));assert.ok(v.rivets.sprites.every(s=>!s.setVisibleArgs[0]));
});
test('C2 pool24 stable, source retained after death, reuse/run/cleanup safe',()=>{
 const f=fixture(),v=new LampistShotView(f.scene),b=bolt(),r={enemies:[enemy()],world:{id:'depths'},hostileProjectiles:{pool:[b]}},sprites=[...v.sprites];for(let i=0;i<2000;i++){v.begin(r);assert.equal(v.draw(b,'depths'),true);b.distance+=.01;}assert.equal(f.images.length,24);assert.deepEqual(v.sprites,sprites);
 r.enemies=[];v.begin(r);assert.equal(v.draw(b,'depths'),true);b.active=false;v.begin(r);assert.equal(v.owners.size,0);assert.ok(v.sprites.every(s=>!s.setVisibleArgs[0]));b.active=true;r.enemies=[{...enemy(),kind:'blaster'}];b.distance=0;v.begin(r);assert.equal(v.draw(b,'depths'),false);f.cleanup();assert.equal(v.sprites.length,0);assert.ok(sprites.every(s=>s.destroyArgs));
});
for(const type of ['lampist','lampmajor'])test('C2 real mobile '+type+' instant shot, muzzle safety and exact render/no-render replay',()=>{
 const make=()=>{const r=new Run(()=>.5,{}, {zoneId:'depths'});r.spawned=r.wave.total;r.weapon.cooldown=999;r.player.hp=999;r.player.invulnerable=999;r.player.x=225;r.player.y=470;const e=type==='lampist'?createEnemy(type,1,225,250):createBoss(1,type,[225,250]);e.warmup=0;e.phase='positioning';e.phaseTime=0;r.enemies=[e];if(type==='lampmajor'){r.depths.begin(e,'light',r.player);e.phaseTime=0;}return{r,e};};
 const a=make(),b=make(),f=fixture(),v=new LampistShotView(f.scene);a.r.update(0);b.r.update(0);const shots=a.r.hostileProjectiles.pool.filter(p=>p.active);assert.equal(shots.length,3);assert.equal(a.e.phase,'recovery');assert.equal(a.e.phaseTime,type==='lampist'?1.45:.95);
 for(const p of shots){assert.equal(p.spec.speed,118);assert.equal(p.spec.damage,.5);assert.equal(p.spec.radius,5);assert.equal(p.spec.range,300);assert.equal(p.distance,0);assert.ok(Math.hypot(p.x-a.r.player.x,p.y-a.r.player.y)>18);}
 for(let i=0;i<360;i++){v.begin(a.r);for(const p of a.r.hostileProjectiles.pool)if(p.active)v.draw(p,'depths');assert.deepEqual(a.r.hostileProjectiles.pool,b.r.hostileProjectiles.pool);assert.deepEqual(a.r.depths.ground.items,b.r.depths.ground.items);assert.equal(a.e.phaseTime,b.e.phaseTime);assert.equal(a.r.player.hp,b.r.player.hp);a.r.update(1/60,{x:.1,y:0});b.r.update(1/60,{x:.1,y:0});}
});
