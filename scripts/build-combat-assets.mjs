// Authored SVG art source. Offline only: node scripts/build-combat-assets.mjs.
// No dependencies, fonts, filters or external images. Combat never runs this file.
import {mkdir,writeFile} from 'node:fs/promises';
const root=new URL('../src/assets/combat-v020/',import.meta.url);
await mkdir(root,{recursive:true});
const outline='#142a32',cream='#fff0bf';
const p=(d,fill,stroke=outline,width=3)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
const e=(x,y,rx,ry,fill,stroke=outline,w=3)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
const line=(d,color=cream,w=2)=>p(d,'none',color,w);
const bolts=points=>points.map(([x,y])=>e(x,y,2,2,'#d6d9bd',outline,1)).join('');
const wheel=(x,y,r=12)=>e(x,y,r,r,'#243b43')+e(x-1,y-2,r*.58,r*.58,'#728b89',outline,2)+e(x,y,2,2,'#dfc997',outline,1);
const visor=(x,y)=>p(`M${x-13} ${y-5} Q${x} ${y-10} ${x+14} ${y-3} L${x+11} ${y+5} Q${x} ${y+8} ${x-12} ${y+3}Z`,'#1d414b')+line(`M${x-8} ${y-2} L${x-3} ${y-3} M${x+4} ${y-3} L${x+9} ${y-1}`,'#dcf7db',3);
const defs=`<defs><linearGradient id="gold" x2=".3" y2="1"><stop stop-color="#ffe09a"/><stop offset=".5" stop-color="#d9a64c"/><stop offset="1" stop-color="#9c6031"/></linearGradient><linearGradient id="steel" x2=".35" y2="1"><stop stop-color="#bad0c7"/><stop offset=".4" stop-color="#6b9393"/><stop offset="1" stop-color="#304e5c"/></linearGradient><linearGradient id="teal" x2=".2" y2="1"><stop stop-color="#a1d7bc"/><stop offset=".4" stop-color="#4c968a"/><stop offset="1" stop-color="#285465"/></linearGradient><linearGradient id="rust" x2=".3" y2="1"><stop stop-color="#ffc17b"/><stop offset=".5" stop-color="#b46b47"/><stop offset="1" stop-color="#6d3c35"/></linearGradient><linearGradient id="skin" x2=".5" y2="1"><stop stop-color="#ffe1ac"/><stop offset="1" stop-color="#bd795e"/></linearGradient><linearGradient id="purple" x2=".4" y2="1"><stop stop-color="#d5bbd9"/><stop offset=".5" stop-color="#877698"/><stop offset="1" stop-color="#464864"/></linearGradient></defs>`;
const assets={};
assets.hero=
 p('M36 83 Q27 91 28 110 Q38 118 51 110 L57 91 M71 88 L75 110 Q93 120 102 109 L92 81','#283f4a')+
 p('M27 108 Q41 104 52 110 L50 119 L24 119 Q20 113 27 108 M77 108 Q93 106 103 113 L103 120 L76 120Z','#947552')+
 p('M32 55 Q17 59 19 77 L27 91 L40 80 L82 88 Q101 83 108 69 L96 51Z','url(#teal)')+
 p('M40 48 Q61 40 87 51 L93 87 Q70 103 37 85Z','url(#teal)')+
 p('M39 54 L48 49 L54 83 L76 85 L82 49 L91 54 L89 92 Q60 101 36 86Z','#315b6b')+
 p('M38 78 Q63 88 89 80 L89 89 Q63 98 36 86Z','#634e39')+
 p('M59 81 L70 83 L69 91 L57 89Z','url(#gold)',outline,2)+
 p('M35 32 Q33 19 53 16 Q82 12 93 37 L89 55 Q77 70 53 64 L40 53Z','url(#skin)')+
 p('M41 46 Q44 60 59 65 Q78 72 89 54 L77 54 Q62 62 57 51Z','#655247',outline,2)+
 p('M79 43 Q94 44 91 51 Q86 56 78 50','#ffd3a0',outline,2)+
 visor(67,39)+
 p('M30 31 Q29 8 57 6 Q89 5 96 30 L100 35 Q61 44 27 35Z','url(#gold)')+
 line('M38 22 Q46 10 62 12','#fff0c4',4)+
 p('M58 7 L70 7 L73 31 L58 33Z','#b7843b',outline,2)+e(69,23,10,10,'#294f56')+e(68,22,6,6,'#fff2bb',outline,1)+
 p('M22 73 Q12 71 12 82 Q15 93 26 90 L35 83 L32 75Z','url(#skin)')+
 p('M91 66 Q102 60 110 69 Q117 79 108 85 Q99 88 90 80Z','url(#skin)')+
 line('M45 70 L49 77 M79 71 L82 76','#bbdfc8',2);
assets.miner=
 p('M31 91 L26 112 Q39 124 54 115 L59 99 M72 99 L79 117 Q95 122 103 110 L95 90','#333c3d')+
 p('M20 63 Q8 67 9 91 Q14 104 27 100 L42 85 L86 92 Q104 112 119 94 L119 67 Q97 53 83 57Z','url(#rust)')+
 p('M29 53 Q53 39 85 49 Q107 65 102 100 Q70 114 24 94 Q22 73 29 53Z','url(#gold)')+
 p('M36 59 L47 53 L54 80 L72 81 L81 50 L91 57 L88 100 Q60 106 33 92Z','#515b53')+
 p('M38 31 Q34 16 57 15 Q88 13 94 38 L90 58 Q68 77 45 60Z','#a2ac82')+
 p('M48 49 Q72 44 88 48 L84 61 Q66 72 48 59Z','#405551')+
 p('M43 35 L61 39 L60 46 L43 43Z M70 40 L89 33 L87 43 L72 47Z','#ffe29a',outline,2)+
 p('M28 33 Q27 8 59 7 Q89 5 100 31 L103 40 Q62 46 25 39Z','url(#gold)')+
 line('M38 21 Q43 13 57 13','#fff2b8',4)+e(65,25,9,9,'#384d44')+e(65,24,5,5,'#edf0a9',outline,1)+
 p('M22 92 L107 73 L112 81 L26 102Z','#80563e')+
 p('M108 52 Q127 56 124 78 L113 86 L115 65 L101 62Z','url(#steel)')+
 p('M15 84 Q28 75 35 88 Q36 101 24 103 Q12 101 15 84 M97 79 Q102 73 111 79 Q119 90 108 97 L96 92Z','#b5a077')+
 line('M46 86 L50 87 M78 88 L82 87','#dfc091',3);
assets.rat=
 // A broad haunch and exposed pink tail lead into a narrow, pale snout (+X).
 p('M37 76 C13 92 3 75 12 59 C18 46 11 36 5 41','none',outline,9)+
 p('M37 76 C13 92 3 75 12 59 C18 46 11 36 5 41','none','#e3a58d',5)+
 p('M34 83 Q24 105 46 101 L57 86 M76 83 L87 101 L104 100 L95 90','#bc8872')+
 p('M24 64 Q22 35 48 30 Q71 26 82 47 L93 67 L89 86 Q68 100 39 90 Q25 85 24 64Z','#6a5652')+
 p('M30 58 Q35 34 55 37 Q72 38 76 55 Q48 53 48 82 L33 79Z','#a6826c',outline,2)+
 p('M70 56 Q87 49 101 62 L121 74 Q128 80 117 85 L92 91 L76 81Z','#dfb18c')+
 e(78,53,13,17,'#ab7c6e')+e(79,53,7,10,'#efb5a4',outline,1)+
 p('M88 63 L105 66 L98 74 L88 71Z','#fff1ae',outline,2)+e(99,68,2,3,outline,outline,1)+
 p('M115 74 Q127 73 125 82 L117 84 L112 79Z','#182e33')+
 p('M103 86 L103 94 L111 86Z','#fff4d1',outline,1)+
 line('M107 78 L124 68 M108 82 L124 91','#efd1a8',1.5)+
 line('M39 48 Q47 41 58 43','#dab59a',3);
assets.drill=
 p('M14 27 Q29 14 62 28 L72 42 L60 57 L15 48Z','#24323e')+
 p('M13 77 L61 76 L74 90 L62 106 Q36 116 11 102Z','#24323e')+
 Array.from({length:5},(_,i)=>line(`M${16+i*10} 91 L${20+i*10} 102 M${18+i*9} 29 L${23+i*9} 41`,'#7d8b94',4)).join('')+
 p('M12 41 Q14 31 42 28 Q69 27 83 44 L83 80 Q62 102 18 88 Q7 69 12 41Z','url(#purple)')+
 p('M21 42 Q42 32 65 39 L71 53 L32 58Z','#cab8d1',outline,2)+
 p('M26 60 L61 53 L65 77 L28 84Z','#2d4853')+
 line('M33 65 L55 61 M34 74 L57 69','#7ba9b0',3)+
 p('M68 50 L83 40 L125 62 L83 86 L67 74Z','url(#steel)')+
 line('M85 46 Q81 62 85 80 M98 51 Q94 62 98 74 M110 57 L110 68','#3d5c6b',3)+
 e(62,43,7,7,'#213d49')+e(63,42,4,4,'#ffdc8d',outline,1)+bolts([[19,48],[24,83],[64,83]]);
assets.wagon=
 // Flat rear box on the left; forward hood, large lamp and pointed bumper on the right.
 wheel(32,96,13)+wheel(87,96,13)+
 p('M12 80 L105 75 L111 92 L15 97Z','#334b53')+
 p('M12 34 L65 30 L76 78 L15 83Z','url(#rust)')+
 p('M17 39 L59 36 L66 58 L20 63Z','#293e44')+
 p('M20 53 L25 37 L38 35 L45 47 L54 38 L63 51 L64 58 L23 62Z','#536b6c')+
 p('M15 60 L68 56 L74 80 L16 84Z','url(#rust)')+
 line('M24 64 L26 77 M47 61 L50 78','#e7a971',4)+
 p('M8 35 L17 34 L19 85 L10 84Z','#687b78')+
 p('M66 49 Q87 40 102 52 L111 79 L97 88 L71 82Z','url(#gold)')+
 p('M69 54 L83 49 L95 54 L83 60Z','#fff0bf',outline,2)+
 p('M87 65 L103 61 L109 81 L92 85Z','#3c555b')+
 line('M96 68 L100 79 M101 67 L105 77','#9ebbb4',2)+
 p('M99 48 L110 46 L117 56 L109 69 L99 64Z','#223e48')+
 e(109,56,9,10,'#f9c65e')+e(111,55,5,6,'#fff6d2',outline,1)+
 p('M101 79 L124 84 L112 98 L96 96Z','url(#steel)')+
 p('M110 83 L122 85 L112 94Z','#ffdc80',outline,2)+
 bolts([[17,45],[22,78],[62,74],[80,70]]);
assets.draisine=
 wheel(27,27,11)+wheel(81,27,11)+wheel(27,96,11)+wheel(81,96,11)+
 p('M10 48 L80 32 L106 46 L96 86 L26 99 L10 81Z','url(#teal)')+
 p('M17 48 L76 38 L93 48 L78 75 L28 80Z','#b2cbb2')+
 p('M35 48 Q48 31 66 41 L75 67 L65 81 L34 77Z','url(#steel)')+
 p('M57 53 L92 43 L119 48 L123 66 L90 75 L63 71Z','#285361')+
 p('M69 55 L110 51 L112 58 L71 63Z','#94c7ba',outline,2)+
 p('M112 47 L125 49 L126 64 L114 68Z','#9baf9e')+e(121,56,4,5,'#152e39',outline,1)+
 line('M31 47 L29 24 L46 20 M26 24 L35 24','#d4b77d',4)+e(45,20,5,5,'#ffb465')+
 p('M17 71 L30 74 L30 90 L17 85Z','#b57443')+bolts([[20,54],[42,85],[84,80]]);
// Bosses use larger, unmistakably different masses; their pivots are specified in the catalogue.
assets.haveuse=
 p('M13 17 Q40 6 75 22 L86 41 L67 53 L9 40Z','#23363f')+
 p('M12 85 L76 75 L91 97 L75 119 Q36 126 9 111Z','#23363f')+
 Array.from({length:6},(_,i)=>line(`M${15+i*10} 97 L${20+i*10} 112 M${18+i*9} 22 L${23+i*9} 37`,'#83958e',5)).join('')+
 p('M16 38 Q24 17 52 24 Q79 22 93 44 L96 85 Q75 111 28 91 Q12 72 16 38Z','url(#gold)')+
 p('M27 36 Q48 25 70 36 L80 51 L35 62Z','#f3d386',outline,2)+
 p('M32 56 L73 48 L80 72 L39 82Z','#284952')+
 p('M40 59 L51 57 L53 65 L42 68Z M60 55 L71 54 L73 62 L61 65Z','#ffcf76',outline,2)+
 p('M74 38 L88 30 L96 83 L85 91Z','url(#steel)')+
 p('M91 23 Q112 19 116 32 L125 93 Q110 110 102 96Z','#384f55')+
 p('M92 30 L109 27 L119 90 L105 96Z','url(#steel)')+
 Array.from({length:6},(_,i)=>p(`M${107+i*1.5} ${27+i*12} L126 ${25+i*12} L${112+i*1.4} ${36+i*12}Z`,'#e6e5bd',outline,2)).join('')+
 bolts([[23,45],[34,86],[78,81],[91,39]]);
assets.crachefer=
 wheel(27,32,17)+wheel(31,100,17)+wheel(88,35,16)+wheel(89,97,16)+
 p('M19 45 Q25 24 61 25 Q92 25 103 50 L100 90 Q68 116 27 94Z','url(#purple)')+
 e(66,67,35,31,'#384a55')+e(67,65,28,25,'url(#rust)')+e(68,65,20,18,'#f7b45e')+
 line('M55 54 L55 80 M67 48 L68 84 M79 52 L81 77','#334851',5)+
 p('M50 40 L46 17 Q49 7 61 7 L85 11 L91 39Z','url(#steel)')+
 e(65,15,18,10,'#c8c9ad')+e(65,15,12,6,'#1b343e',outline,2)+
 p('M35 43 Q12 38 10 57 L15 69 L27 65 L24 54 L40 55Z','url(#steel)')+
 p('M92 48 L118 46 L122 73 L99 84Z','url(#gold)')+
 line('M112 52 L115 71','#fff0b2',3)+bolts([[36,34],[90,39],[35,91],[90,89]]);
assets.effondreur=
 p('M19 46 Q9 53 12 94 L27 114 L47 101 L45 54Z M79 48 L103 42 Q120 58 114 99 L94 116 L77 97Z','#324952')+
 p('M28 32 Q62 14 95 36 L97 93 Q71 111 35 93Z','url(#rust)')+
 p('M43 40 L76 32 L83 53 L47 61Z','#193d49')+
 p('M46 44 L57 42 L59 49 L47 53Z M66 39 L76 38 L78 46 L68 49Z','#ffd685',outline,2)+
 p('M18 58 L34 54 L41 94 L25 101Z M92 53 L105 51 L102 95 L87 94Z','url(#steel)')+
 p('M51 65 L73 61 L83 98 L56 108Z','#516f74')+
 p('M23 6 Q59 0 97 9 L112 30 L97 50 L21 42 L11 26Z','url(#steel)')+
 p('M20 29 L98 35 L97 50 L21 42Z','#3f5963')+
 line('M27 13 Q58 7 89 15','#f4ebc4',4)+
 p('M30 15 L40 15 L38 28 L28 28Z M53 16 L64 17 L61 30 L51 29Z M78 19 L89 21 L85 32 L75 31Z','url(#gold)',outline,2)+bolts([[22,23],[98,26],[38,79],[83,80]]);
assets.stationmaster=
 p('M32 88 L23 113 Q37 125 53 116 L62 96 M71 94 L77 116 Q96 123 106 110 L94 87','#253d4b')+
 p('M26 56 Q9 60 14 88 L28 96 L40 78 L88 84 Q104 96 116 79 L105 54Z','url(#gold)')+
 p('M33 47 Q62 37 88 49 L101 97 Q65 113 25 96Z','#365965')+
 p('M38 50 L48 45 L62 80 L81 44 L92 52 L85 90 L40 89Z','url(#gold)')+
 p('M48 35 Q40 16 60 11 Q86 10 90 35 L85 53 Q61 66 48 47Z','url(#skin)')+
 p('M50 40 Q60 47 68 39 Q74 49 85 43 L82 52 Q64 58 52 49Z','#685344',outline,2)+
 p('M34 22 Q35 3 66 3 Q94 3 98 23 L91 33 L39 33Z','#274954')+
 p('M34 23 Q71 19 103 28 Q90 41 41 34Z','url(#gold)')+
 p('M64 7 L75 8 L72 20 L63 19Z','#e6c079',outline,2)+
 line('M55 37 L61 36 M76 36 L82 35','#243e44',3)+
 p('M10 62 L17 62 L22 119 L15 120Z','#9eaa98')+e(13,51,13,15,'#28414b')+e(13,50,8,10,'#f68856',outline,2)+
 p('M93 73 Q98 62 110 66 Q120 75 110 86 L98 86Z','url(#skin)')+bolts([[47,88],[83,87],[66,92]]);
assets.locomotive=
 wheel(28,31,16)+wheel(76,26,16)+wheel(28,101,16)+wheel(77,98,16)+
 p('M10 47 Q33 30 90 36 L109 51 L112 88 Q77 115 17 96Z','url(#rust)')+
 p('M19 30 L48 23 L60 42 L56 85 L21 90 L12 74Z','url(#gold)')+
 p('M22 39 L43 34 L47 54 L25 60Z','#204554')+line('M27 43 L38 40','#98cecc',3)+
 p('M53 37 Q81 22 103 41 Q120 67 103 87 Q80 103 54 83Z','url(#steel)')+
 e(101,64,16,23,'#345462')+e(104,62,9,13,'url(#gold)')+e(106,61,5,7,'#fff0b0',outline,1)+
 p('M72 36 L69 16 Q74 5 87 13 L91 42Z','#344e58')+e(79,15,14,8,'#c0cab7')+e(79,15,9,4,'#18333f',outline,1)+
 p('M110 79 L124 68 L125 110 L112 97 L96 100Z','url(#steel)')+
 line('M115 80 L119 95 M108 87 L112 96 M99 92 L104 99','#223e4b',3)+
 line('M62 43 Q54 65 65 86 M80 35 Q70 62 83 91','#d5b77b',4)+bolts([[18,69],[39,79],[61,94],[91,95]]);
assets.switchman=
 p('M26 41 L39 26 L52 39 L43 71 L25 69Z M86 31 L112 29 L119 56 L99 72Z','url(#rust)')+
 p('M24 83 L21 114 L44 117 L54 90 M74 87 L88 119 L110 109 L97 80','#344854')+
 p('M24 68 Q34 48 57 47 Q95 42 106 80 L97 99 Q55 114 28 93Z','url(#teal)')+
 p('M44 38 Q40 15 62 12 Q85 13 94 34 L87 57 L56 62Z','#b9ac86')+
 p('M38 32 Q38 6 66 8 Q93 8 99 34 L92 39 L41 40Z','#517b7b')+
 e(58,37,12,11,'#d7b881')+e(82,36,12,11,'#d7b881')+e(59,36,8,7,'#294b58',outline,2)+e(83,35,8,7,'#294b58',outline,2)+
 line('M56 33 L62 32 M80 32 L86 31','#c5eee1',2)+
 p('M62 49 L83 47 L84 59 L65 63Z','#34525a')+
 p('M17 76 L83 66 L111 81 L100 106 L29 112 L13 97Z','url(#steel)')+
 p('M27 82 L72 76 L90 86 L81 97 L33 103Z','#244b55')+
 line('M35 96 L44 90 L55 92 L65 83 L76 86','#b8edd1',3)+
 line('M25 81 L15 47 M93 82 L112 48','#263f47',7)+line('M25 81 L15 47 M93 82 L112 48','#d9b976',3)+
 e(14,44,7,7,'#ed9b62')+e(113,46,7,7,'#90d6b6')+bolts([[24,99],[97,96]]);
assets.shotgun=
 p('M7 49 Q23 38 39 47 L52 53 L48 66 L29 65 L21 86 L10 82 L18 64 L7 62Z','url(#rust)')+
 p('M38 47 L72 42 L120 47 L122 57 L70 61 L42 66Z','url(#steel)')+
 p('M61 59 L116 56 L117 64 L63 68Z','#354f57')+
 p('M48 60 L76 57 L78 72 L50 76Z','url(#gold)')+
 line('M56 62 L58 72 M64 61 L66 71 M71 60 L73 70','#7d543b',2)+
 p('M119 45 L126 47 L126 59 L120 60Z','#18323d')+
 line('M79 46 L114 49','#e3eee0',2)+bolts([[43,55],[91,53]]);
assets.smg=
 p('M5 53 L30 48 L41 54 L34 62 L17 61 L10 69 L4 65Z','#617d7d')+
 p('M33 43 L70 39 L91 48 L91 64 L37 67Z','url(#steel)')+
 p('M47 63 L59 65 L55 86 L42 85Z','#344e5a')+
 p('M69 63 L83 62 L90 88 Q81 93 70 89Z','url(#rust)')+
 p('M86 46 L115 47 L117 61 L88 62Z','#2a4e5a')+
 line('M94 49 L94 58 M102 49 L102 58 M110 50 L110 58','#9db9ae',2)+
 p('M116 47 L125 48 L126 60 L117 62Z','#719491')+
 p('M42 39 L70 34 L72 40 L43 46Z','#e3bb73',outline,2)+bolts([[41,54],[76,54]]);
assets.grisoux=
 p('M8 48 L32 42 L48 51 L40 66 L26 66 L20 87 L9 82 L15 63 L6 61Z','url(#rust)')+
 p('M31 40 L98 37 L119 49 L118 71 L42 75 L30 64Z','url(#steel)')+
 p('M43 43 L89 43 L94 63 L43 66Z','#143b43')+
 p('M49 48 L84 47 L86 59 L49 60Z','#75ffd2')+
 line('M53 51 L80 50','#eefff2',3)+
 p('M46 39 L51 40 L52 68 L47 69Z M83 39 L88 39 L94 66 L89 68Z','url(#gold)',outline,2)+
 p('M96 43 L119 47 L126 56 L119 71 L99 69Z','#355c67')+
 e(119,58,6,10,'#8effd9')+e(120,58,3,6,'#edfff5',outline,1)+
 p('M58 70 L72 70 L71 88 L58 89Z','#314b56')+bolts([[36,49],[39,65],[102,48],[104,64]]);
for(const [id,body] of Object.entries(assets))await writeFile(new URL(id+'.svg',root),`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>${id} — La Mine V2</title>${defs}<g>${body}</g></svg>\n`);
console.log(`${Object.keys(assets).length} SVG combat assets written.`);
