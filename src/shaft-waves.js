const spawns=Object.freeze([[65,154],[385,154],[65,300],[385,300],[65,460],[385,460],[65,605],[385,605]].map(Object.freeze));
const bosses=Object.freeze(['cager','compressor','firedamp']);
const kinds=['deepdriller','surveyor','gasminer','miner','drill','rat'];
const rows=[ [5,0,0,2,0,0],[5,1,0,2,0,1],[6,1,0,3,0,0],[6,2,0,3,0,1],
 [6,2,2,2,0,0],[7,3,2,2,0,0],[7,3,3,2,1,0],[8,3,3,2,1,0],
 [8,4,3,2,1,0],[8,4,4,2,1,1],[9,4,4,2,1,1],[9,5,4,2,1,1],
 [9,5,5,2,1,1],[10,5,5,2,1,1],[10,5,6,2,1,2],[10,6,6,2,1,2] ];
export const SHAFT_WAVES=Object.freeze(Array.from({length:20},(_,i)=>{
  const n=i+1,t=Math.floor(i/5);if(n%5===0)return Object.freeze({id:'shaft59-'+n,boss:true,final:n===20,bosses:n===20?bosses:[bosses[t]],total:n===20?3:1,maxAlive:n===20?3:1,healthScale:n===20?.78:1,enemies:[],spawns:n===20?[[110,210],[225,165],[340,210]]:[[225,220]]});
  const counts=rows[t*4+i%5],left=[...counts],enemies=[];while(left.some(n=>n))for(let k=0;k<kinds.length;k++)if(left[k]){left[k]--;enemies.push(kinds[k]);}
  return Object.freeze({id:'shaft59-'+n,total:enemies.length,enemies:Object.freeze(enemies),maxAlive:[6,8,10,12][t],interval:[.82,.63,.55,.47][t],group:t<1?2:3,kindCaps:{surveyor:2,gasminer:t<2?2:3,drill:1},instability:[2,4,7,9,11,13,14,16,17,18,19].includes(n)?[10,9,8,7][t]:0,spawns,bosses:[]});
}));
