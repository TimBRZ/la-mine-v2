import {aimPoint} from './boss-patterns.js';
// One small, locked danger, reusing the existing plate/circle geometry and .5 damage.
export function makeBossLight(e,p,{cadence=false,brief=false}={}){
 const target=aimPoint(p),heat=e.bossId==='furnace';
 const point=heat?{shape:'plate',...target,w:48,h:48}:{shape:'circle',...target,radius:e.bossId==='hammer'?34:32};
 const warning=e.bossId==='hammer'?1.2:1,duration=brief?.6:e.bossId==='hammer'?.65:cadence?1.45:e.bossId==='boiler'?3.6:3;
 return {id:'light-'+e.bossId,attackClass:'LIGHT',events:[{at:0,points:[{...point,style:e.bossId,order:1}],warning,duration,heat}],time:0,index:0,recovery:.35,tracking:0,locked:true,ultimate:false,target,end:warning+.25};
}
