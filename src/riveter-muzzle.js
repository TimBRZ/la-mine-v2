// Presentation only. Coordinates measured at ellipse (310,261), rotated 10 degrees
// about (213,255), then transformed by each approved riveter-9ede66237e67 frame.
// Normalized relative to the centre of the 517.5 square master viewport.
import {FORGE_SHEETS} from './forge-sprite-catalog.js';
import {stableFacing} from './enemy-facing.js';
const anchors=[
 [0.2656704599,0.1019376227], // frame 0
 [0.2656704599,0.1001984922], // frame 1
 [0.2656704599,0.0984593619], // frame 2
 [0.2656704599,0.1001984922], // frame 3
 [0.2656704599,0.1019376227], // frame 4
 [0.2656704599,0.0982483474], // frame 5
 [0.2656704599,0.0967202313], // frame 6
 [0.2656704599,0.0982483474], // frame 7
 [0.2656704599,0.1019376227], // frame 8
 [0.2656704599,0.0982483474], // frame 9
 [0.2656704599,0.0967202313], // frame 10
 [0.2656704599,0.0982483474], // frame 11
 [0.2656704599,0.1019376227], // frame 12
 [0.2656244802,0.0895431995], // frame 13
 [0.2649298895,0.0771681688], // frame 14
 [0.2635885917,0.0648464498], // frame 15
 [0.2616042632,0.0526118153], // frame 16
 [0.2616042632,0.0526118153], // frame 17
 [0.253209792,0.0731252307], // frame 18
 [0.2543778271,0.0914454423], // frame 19
 [0.2653406381,0.1101945681], // frame 20
 [0.2649764694,0.1206229943], // frame 21
 [0.2654505216,0.1112841313], // frame 22
 [0.2656704599,0.1019376227], // frame 23
 [0.2552356771,0.1019376227], // frame 24
 [0.2656704599,0.1019376227], // frame 25
 [0.2656704599,0.1019376227], // frame 26
 [0.2605266776,0.1052387873], // frame 27
 [0.2552735158,0.1085724894], // frame 28
 [0.2499113714,0.1119400343], // frame 29
 [0.2444410999,0.1153440913], // frame 30
 [0.238863639,0.1187873015], // frame 31
 [0.2331794648,0.1222709451], // frame 32
];
export function riveterShotAngle(e){
 const angles=e.shotAngles,angle=angles?.[Math.floor(angles.length/2)]??e.attackAngle??e.angle;
 return Number.isFinite(angle)?angle:0;
}
export function faceRiveterShot(animation,enemy,released){
 if(released&&enemy.kind==='riveter'&&!enemy.dead){
  const angle=riveterShotAngle(enemy);
  stableFacing(animation,Math.cos(angle),Math.sin(angle));
 }
}
// Caller supplies scratch storage. Read the DISPLAYED frame, including approved
// static fallback, hit and reduced-motion poses; never guess a foreign texture.
export function getRiveterMuzzle(out,enemy,body){
 const sheet=FORGE_SHEETS.riveter;
 if(enemy?.kind!=='riveter'||!body||body.visible===false)return false;
 const key=body.texture?.key;
 const frame=key===sheet.idleKey?0:key===sheet.key?Number(body.frame?.name):-1;
 const anchor=anchors[frame];
 if(!Number.isInteger(frame)||!anchor||!(body.displayWidth>0)||!(body.displayHeight>0))return false;
 const x=((body.flipX?-1:1)*anchor[0]+.5-(body.originX??.5))*body.displayWidth;
 const y=((body.flipY?-1:1)*anchor[1]+.5-(body.originY??.5))*body.displayHeight;
 const angle=body.rotation||0,c=Math.cos(angle),s=Math.sin(angle);
 const localX=(body.x||0)+x*c-y*s,localY=(body.y||0)+x*s+y*c;
 const parent=body.parentContainer;
 if(parent?.getWorldTransformMatrix)parent.getWorldTransformMatrix().transformPoint(localX,localY,out);
 else {out.x=enemy.x+localX;out.y=enemy.y+localY;}
 out.angle=riveterShotAngle(enemy);
 return Number.isFinite(out.x)&&Number.isFinite(out.y);
}
// A fixed presentation cache, independent of the authoritative projectile pool.
// Freeze at the first displayed tick. Rejoin its unchanged collision path over
// 40 travelled units, as in the existing Lampist renderer. Never pull it along
// with its owner, and never reattach an already airborne shot after late loading.
export class RiveterMuzzleView{
 constructor(){this.records=Array.from({length:24},()=>({last:-1}));this.point={};this.run=null;}
 begin(run){
  const reset=this.run!==run;this.run=run;
  for(let i=0;i<this.records.length;i++)if(reset||!run.hostileProjectiles.pool[i]?.active)this.records[i].last=-1;
 }
 position(sprite,bolt,enemy,body){
  const r=this.records[bolt.id];if(!r)return;
  if(r.last<0||r.owner!==enemy.id||r.spec!==bolt.spec||bolt.distance<r.last){
   r.owner=enemy.id;r.spec=bolt.spec;r.start=bolt.distance;r.dx=0;r.dy=0;
   if(bolt.distance<=bolt.spec.speed*.04+1e-6&&getRiveterMuzzle(this.point,enemy,body)){
    r.dx=this.point.x-bolt.x;r.dy=this.point.y-bolt.y;
   }
  }
  r.last=bolt.distance;
  const blend=Math.max(0,1-(bolt.distance-r.start)/40);
  sprite.setPosition(bolt.x+r.dx*blend,bolt.y+r.dy*blend);
 }
}
