const spawns=Object.freeze([[65,154],[385,154],[65,300],[385,300],[65,460],[385,460],[65,605],[385,605]].map(Object.freeze));
const bosses=Object.freeze(['furnace','hammer','boiler']),kinds=['stoker','riveter','scorifier'];
const rows=[[5,0,0],[0,5,0],[0,0,8],[3,2,6],[4,4,7],[4,5,8],[5,5,9],[5,6,10],[6,6,11],[6,7,12],[7,7,13],[7,8,13],[8,8,15],[8,9,16],[9,9,17],[9,10,18]];
export const FORGE_WAVES=Object.freeze(Array.from({length:20},(_,i)=>{
 const n=i+1,t=Math.floor(i/5);
 if(n%5===0)return Object.freeze({id:'forge-'+n,boss:true,final:n===20,bosses:n===20?bosses:[bosses[t]],total:n===20?3:1,maxAlive:n===20?3:1,healthScale:n===20?.76:1,enemies:[],spawns:n===20?[[110,210],[225,165],[340,210]]:[[225,220]]});
 const left=[...rows[t*4+i%5]],enemies=[],order=t?[2,1,0,2,1]:[0,1,2];while(left.some(n=>n))for(const k of order)if(left[k]){left[k]--;enemies.push(kinds[k]);}
 return Object.freeze({id:'forge-'+n,total:enemies.length,enemies:Object.freeze(enemies),maxAlive:[5,8,10,12][t],interval:[.6,.45,.35,.27][t],group:t===3?5:t?4:2,kindCaps:{stoker:t>=2?3:2,riveter:t>=2?4:3,scorifier:t>=2?5:4},heatInterval:n<4?0:[13,10,8,6.5][t],spawns,bosses:[]});
}));
