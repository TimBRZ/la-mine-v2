const spawns=Object.freeze([[65,154],[385,154],[65,300],[385,300],[65,460],[385,460],[65,605],[385,605]].map(Object.freeze));
const bosses=Object.freeze(['lampmajor','dynamiter','blackmass']);
const kinds=['lampist','blaster','blackmaw'];
const rows=[[5,0,0],[1,4,0],[1,1,7],[3,1,7],[3,3,8],[4,3,9],[4,4,10],[4,4,12],[5,4,13],[5,5,14],[6,5,15],[6,5,16],[7,5,18],[7,6,19],[7,7,19],[8,7,20]];
export const DEPTHS_WAVES=Object.freeze(Array.from({length:20},(_,i)=>{
 const n=i+1,t=Math.floor(i/5);
 if(n%5===0)return Object.freeze({id:'depths-'+n,boss:true,final:n===20,bosses:n===20?bosses:[bosses[t]],total:n===20?3:1,maxAlive:n===20?3:1,healthScale:n===20?.76:1,enemies:[],spawns:n===20?[[110,210],[225,165],[340,210]]:[[225,220]]});
 const left=[...rows[t*4+i%5]],enemies=[],order=t===3?[2,0,2,1]:t?[2,0,1,2]:[0,1,2];
 if(t===3)for(const k of [[2,0,2,1],[1,2,2,0],[1,0,1,2],[2,0,1,2,0]][i%5]){left[k]--;enemies.push(kinds[k]);}
 while(left.some(n=>n))for(const k of order)if(left[k]){left[k]--;enemies.push(kinds[k]);}
 return Object.freeze({id:'depths-'+n,total:enemies.length,enemies:Object.freeze(enemies),maxAlive:[5,8,10,12][t],interval:[.62,.46,.38,.28][t],group:t===3?5:t?4:2,kindCaps:{lampist:t>=2?3:2,blaster:t>=2?3:2,blackmaw:t===3?8:7},spawns,bosses:[]});
}));
