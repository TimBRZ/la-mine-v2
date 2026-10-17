const spawns=Object.freeze([[65,154],[385,154],[65,300],[385,300],[65,460],[385,460],[65,605],[385,605]].map(Object.freeze));
const bosses=Object.freeze(['splitter','blower','core']);
const kinds=['crawler','spitter','burster','gasminer','surveyor','drill'];
const rows=[[7,0,0,0,0,0],[7,1,0,0,0,0],[8,1,0,0,0,0],[8,2,0,0,0,0],
[8,2,1,0,0,0],[9,2,2,1,0,0],[9,3,2,1,0,0],[10,3,3,1,1,0],
[10,3,3,1,1,1],[11,3,3,1,1,1],[11,4,3,1,1,1],[12,4,3,1,1,1],
[12,4,4,1,1,1],[13,4,4,1,1,1],[13,5,4,1,1,1],[14,5,4,1,1,1]];
export const RIFT_WAVES=Object.freeze(Array.from({length:20},(_,i)=>{
 const n=i+1,t=Math.floor(i/5);
 if(n%5===0)return Object.freeze({id:'rift-'+n,boss:true,final:n===20,bosses:n===20?bosses:[bosses[t]],total:n===20?3:1,maxAlive:n===20?3:1,healthScale:n===20?.76:1,enemies:[],spawns:n===20?[[110,210],[225,165],[340,210]]:[[225,220]]});
 const left=[...rows[t*4+i%5]],enemies=[];while(left.some(n=>n))for(let k=0;k<kinds.length;k++)if(left[k]){left[k]--;enemies.push(kinds[k]);}
 return Object.freeze({id:'rift-'+n,total:enemies.length,enemies:Object.freeze(enemies),maxAlive:[6,8,10,12][t],interval:[.68,.53,.46,.39][t],group:t?3:2,kindCaps:{spitter:2,burster:2,gasminer:1,surveyor:1,drill:1},gasInterval:n===1?0:[10,8,7,6][t],spawns,bosses:[]});
}));
