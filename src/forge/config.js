export const FORGE_LIMITS=Object.freeze({projectiles:24,ground:5,heat:3,majors:2,rushes:2});
export const FORGE_ENEMIES=Object.freeze({
 stoker:{name:'Chauffeur',health:80,radius:18,speed:84,color:0xffa66b,telegraph:1,contactDamage:.5},
 riveter:{name:'Riveteur',health:76,radius:17,speed:88,color:0xf2dfbe,telegraph:1,contactDamage:.5},
 scorifier:{name:'Scorificateur',health:64,radius:19,speed:113,color:0xeb8d72,telegraph:1,contactDamage:.5},
});
export const FORGE_BOSSES=Object.freeze({
 furnace:{name:'LE MAÎTRE DE FOUR',health:1800,radius:28,speed:92,color:0xffaf69,telegraph:1.4,contactDamage:1,quote:'Les plaques rougissent. Cherche le métal froid.'},
 hammer:{name:'LE MARTEAU-PILON',health:2160,radius:30,speed:98,color:0xeac7a1,telegraph:1.4,contactDamage:1,quote:'Un coup, puis un autre. Ne reviens pas trop vite.'},
 boiler:{name:'LA CHAUDIÈRE',health:2540,radius:30,speed:96,color:0xe5edf0,telegraph:1.4,contactDamage:1,quote:'Lis les soupapes. Il reste toujours un passage.'},
});
export const FORGE_PATTERNS=Object.freeze({
 heat:{warning:1.2,duration:2.3,ground:1,heat:true,major:false},
 rivet:{warning:1.1,count:1,speed:165,major:false},
 rivets:{warning:1.1,count:3,speed:165,major:false},
 scorch:{warning:1.05,seconds:.65,speed:275,ground:1,heat:true,duration:1.3,major:false},
 plates:{warning:1.25,duration:2.4,ground:2,heat:true,major:true},
 jet:{warning:1.3,duration:.55,ground:1,major:true},
 slam:{warning:1.4,duration:2.3,ground:1,heat:true,major:true},
 doubleSlam:{warning:1.4,stagger:.85,duration:.3,ground:2,major:true},
 ring:{warning:1.35,count:7,speed:104,major:true},
 ram:{warning:1.6,seconds:.85,speed:300,major:true},
 steam:{warning:1.25,count:5,speed:133,major:true},
 valves:{warning:1.25,stagger:.4,duration:.4,ground:4,major:true},
 general:{warning:1.3,duration:2.2,ground:3,heat:true,major:true},
 tap:{warning:1.2,duration:.3,ground:1,major:false},
});
export const FORGE_CYCLES={furnace:['plates','jet','rivets'],hammer:['slam','doubleSlam','ring','ram'],boiler:['steam','valves','general','rivets']};
export const FORGE_LATE_CYCLES={furnace:['plates','jet','rivets','jet'],hammer:['ram','doubleSlam','ring','slam'],boiler:['steam','general','valves','steam','rivets']};
export const FORGE_PLATES=Object.freeze([210,340,470,600].flatMap(y=>[110,225,340].map(x=>Object.freeze({x,y,w:76,h:88}))));
