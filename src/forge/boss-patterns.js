// V0.37B. Timed, locked geometry; each physical danger is a separate hazard.
export const BOSS_KITS={furnace:['sectors','furnaceCone','furnaceTurn','whiteMarch'],hammer:['targetStrike','doubleBeat','forgeRhythm','counterStroke'],boiler:['sideValves','rotatingPurge','groundPressure','pressureWave']};
export const BOSS_ULTIMATES={furnace:'whiteFurnace',hammer:'redCadence',boiler:'valveRupture'};
export const BOSS_LABELS={sectors:'SECTEURS DE CHAUFFE',furnaceCone:'CÔNE DE FOURNAISE',furnaceTurn:'FOUR TOURNANT',whiteMarch:'MARCHE À BLANC',targetStrike:'FRAPPE CIBLÉE',doubleBeat:'DOUBLE BATTUE',forgeRhythm:'RYTHME DE FORGE',counterStroke:'CONTRE-COUP',sideValves:'SOUPAPES LATÉRALES',rotatingPurge:'PURGE TOURNANTE',groundPressure:'SURPRESSION AU SOL',pressureWave:'VAGUE DE PRESSION',whiteFurnace:'ULTIME · FOUR À BLANC',redCadence:'ULTIME · CADENCE ROUGE',valveRupture:'ULTIME · RUPTURE DE SOUPAPE',forgePressure:'FORGE SOUS PRESSION',whiteHammer:'PILON À BLANC',pressureCadence:'PRESSION CADENCÉE'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const aimPoint=p=>({x:clamp(p.x,90,360),y:clamp(p.y,185,595)});
const circle=(p,radius)=>({shape:'circle',x:p.x,y:p.y,radius});
const plate=(x,y,w,h)=>({shape:'plate',x,y,w,h});
export function arm(e,angle,length=150,width=15,spin=0){return {shape:'arm',x:e.x,y:e.y,angle,baseAngle:angle,length,width,spin};}
export function wave(e,radius=170){return {shape:'wave',x:e.x,y:e.y,radius:40,startRadius:40,endRadius:radius,width:12,gapAngle:Math.atan2(390-e.y,225-e.x),gap:.6};}
export function makeBossPlan(e,id,p){
 const use=e.patternUses?.[id]??e.attackCount;
 const late=e.hp<e.maxHealth*.5,t=aimPoint(p),angle=Math.atan2(p.y-e.y,p.x-e.x),turn=late&&use%2?-1:1,events=[];
 const add=(at,points,warning,duration,heat=false)=>events.push({at,points,warning:warning*(late?.94:1),duration,heat});
 const cone={shape:'cone',x:e.x,y:e.y,angle,spread:.66,radius:225};
 const axes=(vertical=false)=>[arm(e,vertical?Math.PI/2:0,165,19),arm(e,vertical?-Math.PI/2:Math.PI,165,19)];
 const sectors=(n)=>[plate(121,265,142,190),plate(329,520,142,190),plate(329,265,142,150)].slice(0,n);
 let recovery=late?.95:1.1,tracking=0;
 switch(id){
 case 'sectors':add(0,sectors(late?3:2),1.35,1.8,true);break;
 case 'furnaceCone':add(0,[cone],1.4,.65,true);tracking=.35;break;
 case 'furnaceTurn':add(0,[arm(e,angle,145,14,turn*.42),arm(e,angle+Math.PI,145,14,turn*.42)],1.4,2.5,true);break;
 case 'whiteMarch':for(let i=0;i<3;i++)add(i*.65,[circle({x:clamp(t.x+(i-1)*65,85,365),y:clamp(t.y+(i-1)*35,180,600)},47)],1.2,.65,true);break;
 case 'targetStrike':add(0,[circle(t,62)],1.25,.22);add(1.45,[{...wave(t,100),startRadius:62,radius:62}],.35,.5);break;
 case 'doubleBeat':for(let i=0;i<2;i++)add(i*.85,[use%2?plate(225,265+i*245,240,130):plate(127+i*196,390,138,235)],1.25,.3);break;
 case 'forgeRhythm':for(let i=0;i<3;i++)add(i*(late?.72:.85),[circle({x:clamp(t.x+(i-1)*70,100,350),y:clamp(t.y+(i-1)*50,210,570)},[38,52,70][i])],1.2,.22);add((late?1.44:1.7)+1.4,[wave({x:clamp(t.x+70,100,350),y:clamp(t.y+50,210,570)},125)],.4,.7);break;
 case 'counterStroke':add(0,[circle(e,62)],1.3,.25);add(1.55,[{...wave(e,190),startRadius:62,radius:62}],.4,1.4);break;
 case 'sideValves':add(0,axes(use%2===0),1.3,.85);break;
 case 'rotatingPurge':add(0,[arm(e,angle,160,17,turn*.4),...(late?[arm(e,angle+Math.PI,160,17,turn*.4)]:[])],1.35,2.3);break;
 case 'groundPressure':add(0,[circle({x:105,y:270},48),circle({x:345,y:390},48),circle({x:160,y:550},48)],1.3,.65);break;
 case 'pressureWave':add(0,[wave(e,215)],1.4,1.65);break;
 case 'whiteFurnace':{
  // Three separate heated sectors leave TWO full-width escape strips.
  add(0,[plate(225,178,394,124),plate(225,390,394,110),plate(225,606,394,120)],1.9,.65,true);
  add(2.9,[plate(225,153,394,74),plate(225,350,394,110),plate(225,576,394,180)],1.9,.65,true);
  add(5.8,[cone],1.45,.6,true);recovery=1.5;break;
 }
 case 'redCadence':{
  const times=[0,1.05,1.95,2.72];
  for(let i=0;i<4;i++)add(times[i],[circle({x:[130,320,145,300][i],y:[300,420,535,330][i]},i===3?76:48)],1.3,.24);
  add(4.25,[wave({x:300,y:330},225)],.5,1.5);recovery=1.5;break;
 }
 case 'valveRupture':add(0,axes(false),1.8,.75);add(2.8,axes(true),1.4,.75);add(5.2,[wave(e,240)],1.4,1.7);recovery=1.5;break;
 default:throw new Error('Unknown forge boss pattern: '+id);
 }
 events.forEach((ev,j)=>ev.points.forEach((h,i)=>{h.order=j+1;h.style=e.bossId;h.index=i;}));
 return {id,events,time:0,index:0,recovery,tracking,locked:!tracking,ultimate:Object.values(BOSS_ULTIMATES).includes(id),late,target:{...t},end:Math.max(...events.map(v=>v.at+v.warning+v.duration))+.05};
}

export const COMBO_NAMES=['forgePressure','whiteHammer','pressureCadence'];
export function makeComboPlans(name,bosses,p){
 const by=Object.fromEntries(bosses.map(e=>[e.bossId,e])),pairs=[];
 const plan=(e,events)=>{events.forEach((v,j)=>v.points.forEach(h=>{h.style=e.bossId;h.order=j+1;}));pairs.push([e,{id:name,events,time:0,index:0,recovery:1.2,tracking:0,locked:true,ultimate:false,late:false,target:aimPoint(p),end:Math.max(...events.map(v=>v.at+v.warning+v.duration))+.05}]);};
 const ev=(at,points,warning,duration,heat=false)=>({at,points,warning,duration,heat});
 if(name==='forgePressure'&&by.furnace&&by.boiler){
  plan(by.furnace,[ev(0,[plate(105,265,120,170),plate(345,520,120,170)],1.5,2.1,true)]);
  // Steam enters part of the cold lower-left sector, leaving the centre corridor.
  plan(by.boiler,[ev(.55,[{shape:'line',x:50,y:570,x2:135,y2:570,width:18}],1.45,1.05)]);
 }else if(name==='whiteHammer'&&by.furnace&&by.hammer){
  plan(by.furnace,[ev(0,[plate(110,370,140,270)],1.4,2.1,true)]);
  plan(by.hammer,[ev(.8,[circle({x:155,y:400},52)],1.3,.35)]);
 }else if(name==='pressureCadence'&&by.boiler&&by.hammer){
  plan(by.boiler,[ev(0,[wave(by.boiler,150)],1.3,.75),ev(3.25,[wave(by.boiler,150)],1.3,.75)]);
  plan(by.hammer,[ev(1.65,[circle(aimPoint(p),52)],1.2,.3),ev(4.9,[circle({x:clamp(p.x+70,90,360),y:clamp(p.y-60,185,595)},52)],1.2,.3)]);
 }
 return pairs;
}
