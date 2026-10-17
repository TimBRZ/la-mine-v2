export const RIFT_LIMITS=Object.freeze({projectiles:24,ground:4,fissures:3,majors:2,deathWarnings:6});
export const RIFT_ENEMIES=Object.freeze({
 crawler:{name:'Rampant de Grisou',health:52,radius:14,speed:105,color:0x9bdab4,telegraph:.85,contactDamage:.5},
 spitter:{name:'Cracheur',health:82,radius:18,speed:68,color:0x7fcbd3,telegraph:1,contactDamage:.5},
 burster:{name:'Éclateur',health:68,radius:19,speed:48,color:0xd4c76c,telegraph:1,contactDamage:.5},
});
export const RIFT_BOSSES=Object.freeze({
 splitter:{name:'LE FENDEUR',health:1750,radius:28,speed:78,color:0xdca16a,telegraph:1.4,contactDamage:1,quote:'T’as voulu descendre ? Maintenant assume.'},
 blower:{name:'LE SOUFFLEUR',health:2100,radius:29,speed:86,color:0x7bd9bd,telegraph:1.4,contactDamage:1,quote:'Là, l’air commence à coûter cher.'},
 core:{name:'LE CŒUR DE GRISOU',health:2500,radius:30,speed:94,color:0xe1df81,telegraph:1.4,contactDamage:1,quote:'Ça, faut surtout pas marcher dedans.'},
});
export const RIFT_PATTERNS=Object.freeze({
 charge:{warning:1.25,major:true,speed:330,seconds:1.1},
 fan8:{warning:1.2,major:true,count:8,speed:115},
 fissures:{warning:1.55,major:true,ground:3,duration:1.05},
 circle8:{warning:1.35,major:true,count:8,speed:100},
 pockets:{warning:1.6,major:true,ground:4,duration:.55},
 cone:{warning:1.2,major:false,count:5,speed:110},
 double:{warning:1.5,major:true,count:16,speed:100},
 rain:{warning:1.65,major:true,ground:4,duration:.55},
 orb:{warning:1.15,major:false,count:1,speed:70},
 spit:{warning:1.3,major:false,ground:1,duration:2},
 blast:{warning:1.25,major:false,ground:1,duration:.5},
});
export const RIFT_CYCLES={splitter:['charge','fan8','fissures'],blower:['circle8','pockets','cone'],core:['double','rain','orb']};
export const radialAngles=(angle,n)=>Array.from({length:n},(_,i)=>angle+i*Math.PI*2/n);
export const spreadAngles=(angle,n,spread)=>Array.from({length:n},(_,i)=>angle-spread/2+spread*i/(n-1));
