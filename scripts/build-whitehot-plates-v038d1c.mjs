import fs from 'node:fs';
// A reusable 394 x 180 material. Shorter plates crop its centre; nothing scales.
const dir='src/assets/furnace-whitehot-plates-v038d1c';fs.mkdirSync(dir,{recursive:true});
const cracks=[
 'M0 39L24 43L42 29L61 34L76 15L98 22L113 0',
 'M42 29L46 57L68 69L64 94L82 109L76 134L92 153L88 180',
 'M61 34L93 44L112 37L134 53L159 45L176 62L196 55L214 69',
 'M134 53L129 80L146 99L140 124L163 139L156 165L170 180',
 'M0 118L23 111L43 122L64 94M82 109L110 115L140 124',
 'M196 0L202 25L187 39L196 55L190 83L214 102L208 128L224 145L220 180',
 'M214 69L243 60L260 76L285 67L308 82L334 70L357 83L394 74',
 'M260 76L253 103L276 122L268 148L285 163L282 180',
 'M308 0L297 23L311 42L300 58L308 82L306 108L327 123L321 151L345 169L341 180',
 'M146 99L170 92L190 83M208 128L237 137L268 148M327 123L351 114L370 132L394 124',
 'M394 21L373 29L350 20L330 32L311 42M23 111L18 87L0 79'
];
const hot=`<rect width="394" height="180" fill="#ea5827"/>
<path d="M0 52L46 57L68 69L64 94L43 122L0 118Z M129 80L146 99L170 92L190 83L196 55L159 45L134 53Z M253 103L276 122L306 108L308 82L285 67L260 76Z M327 123L351 114L370 132L394 124V180H341L345 169L321 151Z" fill="#ff8e31"/>
<path d="M93 44L112 37L134 53L129 80L110 91L76 77L68 69L46 57L61 34Z M214 102L253 103L237 137L208 128Z M311 42L330 32L350 20L373 29L394 21V74L357 83L334 70L308 82L300 58Z" fill="#f8752b"/>
<path d="M0 118L23 111L43 122L64 137L76 134L92 153L88 180H0Z M156 165L163 139L208 128L224 145L220 180H170Z" fill="#d84422"/>`;
const frames=[];
for(let f=0;f<6;f++){
 const active=f<4,colour=active?['#ffd16b','#ffdb83','#ffca60','#ffd87a'][f]:f===4?'#b3633d':'#676b67';
 const body=active?hot:`<rect width="394" height="180" fill="${f===4?'#702b22':'#383c3e'}"/>`;
 frames.push(`<g id="frame-${f}" transform="translate(${f%2*394} ${Math.floor(f/2)*180})">${body}<g fill="none" stroke="${colour}" stroke-width="${active?1.6:1}" stroke-linejoin="bevel" opacity="${active?.85:.65}">${cracks.map(d=>`<path d="${d}"/>`).join('')}</g>${active?`<g fill="#ffe49a" opacity="${[.6,.8,.55,.7][f]}"><circle cx="129" cy="80" r="2"/><circle cx="260" cy="76" r="2"/><circle cx="327" cy="123" r="1.7"/></g>`:''}</g>`);
}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="788" height="540" viewBox="0 0 788 540"><title>Four à blanc — Variante A — matériau de plaques</title><desc>Quatre images actives, annonce, extinction. Cellules 394 × 180. Recadrage central sans étirement ; bordures et passages gérés par le moteur.</desc>${frames.join('\n')}</svg>\n`;
fs.writeFileSync(dir+'/plates-a.svg',svg);console.log(Buffer.byteLength(svg)+' bytes');
