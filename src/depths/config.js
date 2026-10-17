export const DEPTHS_LIMITS=Object.freeze({projectiles:24,ground:5,charges:3,majors:2});
export const DEPTHS_ENEMIES=Object.freeze({
 lampist:{name:'Lampiste',health:80,radius:17,speed:78,color:0xffe49b,telegraph:1,contactDamage:.5},
 blaster:{name:'Boutefeu',health:76,radius:18,speed:84,color:0xffac79,telegraph:1,contactDamage:.5},
 blackmaw:{name:'Gueule-Noire',health:58,radius:15,speed:108,color:0xb6cdf7,telegraph:.9,contactDamage:.5},
});
export const DEPTHS_BOSSES=Object.freeze({
 lampmajor:{name:'LE LAMPISTE-MAJOR',health:1780,radius:28,speed:86,color:0xffe49b,telegraph:1.4,contactDamage:1,quote:'Garde les yeux sur les lignes lumineuses.'},
 dynamiter:{name:'LE DYNAMITEUR',health:2120,radius:29,speed:88,color:0xffac79,telegraph:1.4,contactDamage:1,quote:'Compte les charges. Garde une sortie.'},
 blackmass:{name:'LA MASSE NOIRE',health:2520,radius:31,speed:92,color:0xb6cdf7,telegraph:1.4,contactDamage:1,quote:'Même dans le noir, tu verras venir la charge.'},
});
export const DEPTHS_PATTERNS=Object.freeze({
 light:{warning:1.1,count:3,speed:118,major:false},
 plant:{warning:1.5,ground:1,duration:.35,radius:39,charge:true,major:false},
 leap:{warning:.9,speed:260,seconds:.52,major:false},
 beam:{warning:1.5,ground:1,duration:.45,width:15,major:true},
 fan:{warning:1.25,count:6,speed:110,major:true},
 blackout:{warning:.85,major:false},
 charges:{warning:1.7,ground:3,duration:.32,radius:39,charge:true,stagger:.2,major:true},
 chain:{warning:1.5,ground:3,duration:.32,radius:39,charge:true,stagger:.5,major:true},
 ring:{warning:1.4,count:7,speed:98,major:true},
 lob:{warning:1.5,ground:1,duration:.35,radius:43,charge:true,major:false},
 rush:{warning:1.6,speed:310,seconds:1,major:true},
 slam:{warning:1.55,ground:1,duration:.45,radius:94,major:true},
 cracks:{warning:1.5,ground:3,duration:.6,width:10,major:true},
});
export const DEPTHS_CYCLES={lampmajor:['beam','fan','blackout','light'],dynamiter:['charges','chain','ring','lob'],blackmass:['rush','slam','cracks','blackout']};
