import { GAMIN } from './config.js';
export const WEAPONS = Object.freeze({
 shotgun: Object.freeze({ id:'shotgun', name:'FUSIL À POMPE', ...GAMIN, falloff:.62, distancePenaltyStart:45, distancePenalty:.15,
 description:'Une décharge puissante. Dévastateur de près.', detail:'7 plombs · courte portée · cadence lente',
 perks:['buckshot','boots','trigger','grisou','sawn','double','plates'],
 effects:{recoil:5,flash:.065,muzzle:1,particles:3,impact:3,shake:.0017},
 shape:[[20,2,21,9,0x0f2529],[23,0,23,7,0xb9c6bb],[16,4,12,5,0xba895c],[31,0,4,9,0x51696a]] }),
 smg: Object.freeze({ id:'smg', name:'MITRAILLETTE', damage:5,cooldown:.12,range:280,pelletSpeed:850,pellets:1,spread:0,knockback:8,falloff:0,
 description:'Une rafale précise. Maintiens la pression à distance.', detail:'Balle unique · moyenne portée · cadence rapide',
 perks:['magazine','heat','piercing','boots','trigger','grisou','plates'],
 effects:{recoil:1,flash:.035,muzzle:.5,particles:1,impact:1,shake:0},
 shape:[[17,1,18,10,0x263c42],[19,-2,18,5,0x86bbb9],[17,8,5,12,0x536c70],[28,0,8,4,0xb9c6bb]] }),
 grisoux: Object.freeze({ id:'grisoux', name:'GRISOU X', damage:11,cooldown:.85,range:350,pelletSpeed:620,pellets:3,spread:.10,knockback:12,falloff:0,
 description:'Une salve énergétique. Construis ta pénétration pendant la run.', detail:'3 impulsions · pénétration par perks',
 energy:true,perks:['conduit','reinforced-conduit','capacitor','energy-overload','rapid-coil','energy-arc','boots','trigger','grisou','plates'],
 epicIds:['double-cannon','unstable-grisou','iron-rain'],
 effects:{recoil:2.5,flash:.07,muzzle:.8,particles:2,impact:2,shake:0,color:0x86ffcf},
 shape:[[18,0,25,10,0x294d58],[22,0,15,5,0x86ffcf],[11,7,6,10,0x9a754c],[32,0,5,12,0xb9dad5]] }),
});
export function weaponDefinition(id='shotgun') {
 if (!Object.hasOwn(WEAPONS,id)) throw new RangeError('Unknown weapon: '+id);
 return WEAPONS[id];
}
