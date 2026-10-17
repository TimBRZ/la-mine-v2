// V0.36B: Zone 5 bosses only. Geometry is shared by collision, preview and QA.
import {ROOM} from '../config.js';
import {segmentCircle} from '../math.js';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const point=(p,margin=45)=>({x:clamp(p.x,ROOM.left+margin,ROOM.right-margin),y:clamp(p.y,ROOM.top+margin,ROOM.bottom-margin)});
export function ray(p,a,length=800,width=14){const dx=Math.cos(a),dy=Math.sin(a),tx=dx>0?(ROOM.right-p.x)/dx:dx<0?(ROOM.left-p.x)/dx:Infinity,ty=dy>0?(ROOM.bottom-p.y)/dy:dy<0?(ROOM.top-p.y)/dy:Infinity,l=Math.max(0,Math.min(length,tx,ty));return {shape:'line',x:p.x,y:p.y,x2:p.x+dx*l,y2:p.y+dy*l,width};}
export function bossHazardTouches(h,p){
 if(h.shape==='ring'){const d=Math.hypot(p.x-h.x,p.y-h.y);return d+p.radius>=h.inner&&d-p.radius<=h.radius;}
 if(h.shape==='rect')return p.x+p.radius>h.x&&p.x-p.radius<h.x+h.w&&p.y+p.radius>h.y&&p.y-p.radius<h.y+h.h;
 if(Number.isFinite(h.x2))return segmentCircle(h.x,h.y,h.x2,h.y2,p.x,p.y,h.width+p.radius)!==null;
 return Math.hypot(p.x-h.x,p.y-h.y)<h.radius+p.radius;
}
export const BOSS_KITS={lampmajor:['major-sweep','major-aim','major-dark','major-cross'],dynamiter:['demo-plan','demo-chain','demo-quadrants','demo-lob'],blackmass:['mass-charge','mass-slam','mass-triple','mass-fissures']};
export const LATE_KITS={lampmajor:['major-sweep','major-dark','major-aim','major-cross','major-dark'],dynamiter:['demo-chain','demo-plan','demo-lob','demo-chain','demo-quadrants'],blackmass:['mass-charge','mass-slam','mass-fissures','mass-charge','mass-triple']};
export const ULTIMATES={lampmajor:'major-blackout',dynamiter:'demo-demolition',blackmass:'mass-pit'};
export const PATTERN_LABELS={'major-sweep':'BALAYAGE DU MAJOR','major-aim':'MISE EN JOUE','major-dark':'EXTINCTION GÉNÉRALE','major-cross':'FEUX CROISÉS','major-blackout':'BLACKOUT','demo-plan':'PLAN DE TIR 1 → 4','demo-chain':'MÈCHE EN CHAÎNE','demo-quadrants':'QUADRANTS','demo-lob':'CHARGE PROJETÉE','demo-demolition':'DÉMOLITION CONTRÔLÉE','mass-charge':'CHARGE DE LA MASSE','mass-slam':'COUP DE MASSE','mass-triple':'TRIPLE FRAPPE','mass-fissures':'FISSURE DU FOND','mass-pit':'ÉCRASEMENT DU PUITS','combo-light':'SOUS LES PROJECTEURS','combo-corridor':'COULOIR DE LA MASSE','combo-heavy':'DÉMOLITION LOURDE'};
const circle=(p,radius)=>({shape:'circle',x:p.x,y:p.y,radius});
const ring=(p,inner,radius)=>({shape:'ring',x:p.x,y:p.y,inner,radius});
const step=(label,warning,duration,geometry,extra={})=>({label,warning,duration,geometry,...extra});
const center={x:225,y:391};
const aim=(e,p)=>Math.atan2(p.y-e.y,p.x-e.x);
const sweep=(offset=0)=>step('BALAYAGE · SENS INDIQUÉ',1.2,2.6,(e,p)=>{const angle=aim(e,p)-Math.PI*.39+offset;return [ray(e,angle,700,17)];},{sweep:Math.PI*.78});
const sight=()=>step('MISE EN JOUE',.65,.38,(e,p)=>[ray(e,aim(e,p),700,19)],{tracking:.8});
const dark=()=>step('EXTINCTION · REPÈRES',.7,2,()=>[],{dark:true,reposition:true,major:false});
const charges=(linked=false)=>step(linked?'MÈCHE 1 → 2 → 3 → 4':'PLAN 1 → 2 → 3 → 4',1.35,2.65,(e,p)=>{
 const c=point(p,120);return (linked?[[-100,-100],[-35,-35],[35,35],[100,100]]:[[-90,-75],[90,-75],[90,75],[-90,75]]).map(([x,y],i)=>({...circle(point({x:c.x+x,y:c.y+y},48),38),order:i+1,delay:i*.72,life:.32,charge:true}));
},{sequence:true,linked});
const slam=()=>[step('IMPACT INTÉRIEUR',1.25,.3,e=>[circle(e,87)]),step('ANNEAU · REVIENS AU CENTRE',.75,.4,e=>[ring(e,100,155)])];
const fissures=(angles=null)=>step('FISSURES · AXES VERROUILLÉS',1.15,.65,(e,p)=>(angles||[-.65,0,.65].map(a=>a+aim(e,p))).map(a=>ray(e,a,265,10)),{grow:true});
const rush=()=>step('CHARGE · LIGNE VERROUILLÉE',1.6,1.7,(e,p)=>[ray(e,aim(e,p),800,e.radius)],{rush:310});
function quadrants(safe){const midX=225,midY=391;return [0,1,2,3].filter(n=>n!==safe).map((n,i)=>({shape:'rect',x:n%2?midX+22:ROOM.left+8,y:n>=2?midY+22:ROOM.top+8,w:167,h:245,delay:i*.65,life:.36,order:i+1}));}
export function makeBossPlan(e,p,pattern){
 let steps=[],recovery=e.hp<e.maxHealth*.5?.85:1.05;
 switch(pattern){
 case 'major-sweep':steps=[sweep()];break;
 case 'major-aim':steps=[sight()];break;
 case 'major-dark':steps=[dark()];break;
 case 'major-cross':steps=[step('FEUX CROISÉS · FLÈCHES',1.3,2.2,()=>[{shape:'line',x:40,y:280,x2:410,y2:280,width:12},{shape:'line',x:160,y:140,x2:160,y2:640,width:12}],{cross:true})];break;
 case 'major-blackout':steps=[dark(),sweep(-.4),sweep(.7),sight()];recovery=1.5;break;
 case 'demo-plan':steps=[charges()];break;
 case 'demo-chain':steps=[charges(true)];break;
 case 'demo-quadrants':{const safe=e.attackCount%4;steps=[step('QUADRANTS · 1 → 3',1.4,1.9,()=>quadrants(safe),{sequence:true,safeQuadrant:safe}),step('ZONE SÛRE CHANGE',1.3,1.9,()=>quadrants((safe+1)%4),{sequence:true,safeQuadrant:(safe+1)%4})];break;}
 case 'demo-lob':steps=[step('CHARGE VERROUILLÉE',1.4,.4,(_,p)=>[{...circle(point(p,68),60),charge:true}],{fragments:6})];recovery=1.2;break;
 case 'demo-demolition':{const outward=e.attackCount%2===0;const bands=outward?[[0,65],[80,125],[140,180]]:[[140,180],[80,125],[0,65]];steps=bands.map(([inner,radius],i)=>step((outward?'INTÉRIEUR → EXTÉRIEUR':'EXTÉRIEUR → INTÉRIEUR')+' · '+(i+1),i?1:1.6,.35,()=>[{...ring(center,inner,radius),charge:true,order:i+1}],{ringCharges:true}));recovery=1.5;break;}
 case 'mass-charge':steps=[rush()];recovery=1.05;break;
 case 'mass-slam':steps=slam();break;
 case 'mass-triple':steps=[step('FRAPPE GAUCHE',1,.28,e=>[circle(point({x:e.x-75,y:e.y+35},70),60)]),step('FRAPPE DROITE',.8,.28,e=>[circle(point({x:e.x+75,y:e.y+35},70),60)]),step('SLAM CENTRAL',1.1,.35,e=>[circle(e,100)]),fissures()];recovery=1.3;break;
 case 'mass-fissures':steps=[fissures()];break;
 case 'mass-pit':steps=[step('VERS LE CENTRE',.6,2.2,()=>[],{toCenter:true}),step('ÉCRASEMENT · ÉCARTE-TOI',1.65,.35,e=>[circle(e,105)]),fissures([0,Math.PI/2,Math.PI,Math.PI*1.5]),fissures([.25,.75,1.25,1.75].map(a=>a*Math.PI)),step('ONDE FINALE',1,.7,e=>[ring(e,85,110)],{wave:true})];recovery=1.5;break;
 default:throw Error('Unknown Zone 5 boss pattern: '+pattern);
 }
 return {pattern,steps,recovery,ultimate:Object.values(ULTIMATES).includes(pattern)};
}

