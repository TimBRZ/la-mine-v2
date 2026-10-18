// Read-only presentation journal. No callbacks and no fields added to combat objects.
import {ROOM} from './config.js';
export const PROJECTILE_END_CAPACITY=64;
const journals=new WeakMap();
export function projectileEndings(pool){
 let journal=journals.get(pool);
 if(!journal){journal={clock:0,dt:0,serial:0,floor:0,generation:0,records:Array.from({length:PROJECTILE_END_CAPACITY},()=>({serial:0}))};journals.set(pool,journal);}
 return journal;
}
export function advanceProjectileEndings(pool,dt){const j=journals.get(pool);if(j){j.clock+=dt;j.dt=dt;}}
export function clearProjectileEndings(pool){const j=journals.get(pool);if(!j)return;j.floor=j.serial;j.generation++;for(const e of j.records){e.serial=0;e.owner=0;}}
// Called with the SAME swept hit parameter and endpoint already computed by physics,
// before the existing writes. Hit priority mirrors update's existing onHit behavior.
export function recordProjectileEnding(pool,b,x,y,hit,step){
 const wall=x<ROOM.left||x>ROOM.right||y<ROOM.top||y>ROOM.bottom;
 if(hit===null&&!wall&&b.distance+step<b.spec.range)return;
 const j=projectileEndings(pool),event=j.records[j.serial++%PROJECTILE_END_CAPACITY];
 let t=hit===null?1:hit;
 if(hit===null&&wall){
  // Exact crossing of the arena centre bounds, not an invented decor collision.
  // A spawn already outside has no in-bounds intersection: retain its real endpoint.
  if(b.x>=ROOM.left&&b.x<=ROOM.right&&b.y>=ROOM.top&&b.y<=ROOM.bottom){
   if(x<ROOM.left)t=Math.min(t,(ROOM.left-b.x)/(x-b.x));
   if(x>ROOM.right)t=Math.min(t,(ROOM.right-b.x)/(x-b.x));
   if(y<ROOM.top)t=Math.min(t,(ROOM.top-b.y)/(y-b.y));
   if(y>ROOM.bottom)t=Math.min(t,(ROOM.bottom-b.y)/(y-b.y));
  }
 }
 event.serial=j.serial;event.time=j.clock-(1-t)*j.dt;event.owner=b.owner;
 event.orb=!!b.orb;event.bossMajor=!!b.bossMajor;event.angle=b.angle;
 event.x=b.x+(x-b.x)*t;event.y=b.y+(y-b.y)*t;
 event.reason=hit!==null?'player':wall?'wall':'range';
}
