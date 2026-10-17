import { kitImage } from './kit.js';
// Small faceted vector components shared by the lobby and workshop only.
const SHAPES = {
 coal:'<path d="m7 12 10-7 12 3 6 15-9 12-17-4-5-10Z" fill="#324451"/><path d="m7 12 11 3 11-7-12-3Z" fill="#96aeb7"/><path d="m18 15 8 20 9-12-6-15Z" fill="#566d7b"/><path d="m7 12-3 9 5 10 17 4-8-20Z" fill="#21313d"/><path d="m9 14 7-3" stroke="#d2e5e9" stroke-width="2"/>',
 iron:'<path d="m4 16 9-9h19l5 19-10 7H6Z" fill="#955738"/><path d="m4 16 9-9h19l-9 9Z" fill="#f4c18c"/><path d="M4 16h19l4 17H6Z" fill="#cb895a"/><path d="m23 16 9-9 5 19-10 7Z" fill="#a96643"/><path d="M8 19h11" stroke="#ffe0a7" stroke-width="2"/>',
 diamond:'<path d="m4 14 8-9h16l8 9-16 23Z" fill="#62cce1"/><path d="m12 5 8 9 8-9Z" fill="#ddffff"/><path d="M4 14h16L12 5Z" fill="#9aeefa"/><path d="m20 14 8-9 8 9Z" fill="#b8ffff"/><path d="m4 14 16 23-7-23Z" fill="#419bb7"/><path d="m13 14 7 23 7-23Z" fill="#a9f7ff"/><path d="m29 1 2 4 4 1-4 2-2 4-1-4-4-2 4-1Z" fill="#fff"/>',
 token:'<ellipse cx="21" cy="23" rx="16" ry="16" fill="#a56529"/><circle cx="19" cy="18" r="15" fill="#efb843" stroke="#ffdf82" stroke-width="2"/><circle cx="19" cy="18" r="11" fill="#c98c2e"/><path d="m19 8 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#ffe9a5"/>',
 home:'<path d="M8 19a12 12 0 0 1 24 0l3 3H5Z" fill="#f5bd50"/><path d="M10 24h20v6l-6 6H16l-6-6Z" fill="#c38c62"/><path d="M12 25h16v5H12Z" fill="#27434e"/><circle cx="20" cy="17" r="5" fill="#fff2b5" stroke="#6b694d" stroke-width="2"/><path d="M12 10q6-6 12-2" fill="none" stroke="#ffeaab" stroke-width="2"/>',
 zones:'<path d="m5 29 7-20 8 9 6-14 10 25Z" fill="#7196a4"/><path d="m5 29 7-20 2 20 12-25 1 25Z" fill="#a5c5c9"/><path d="M15 34V24q5-8 10 0v10" fill="#172d39" stroke="#d5ae72" stroke-width="4"/>',
 workshop:'<path d="m9 7 15 5-3 10H8L4 14Z" fill="#97b5c2"/><path d="m9 7 15 5-4 4-16-2Z" fill="#d6e6e8"/><path d="m18 18 5 14-6 4-7-16Z" fill="#b77b49"/><path d="m29 5-3 6 5 5 6-3-1 8-7 3-8-9 1-8Z" fill="#dbad5e"/>',
 talents:'<path d="m20 3 5 11 12 2-9 8 3 13-11-7-11 7 3-13-9-8 12-2Z" fill="#ad9bcb"/><path d="m20 3 0 27-11 7 3-13-9-8 12-2Z" fill="#706788"/>',
 relief:'<circle cx="14" cy="14" r="8" fill="#9dada0"/><circle cx="28" cy="17" r="6" fill="#698478"/><path d="M2 35v-5q12-16 24 0v5Zm24 0v-8q6-9 12 0v8" fill="#657e75"/>',
 crates:'<path d="m4 11 15-5 17 6v21L20 38 4 32Z" fill="#9b7655"/><path d="m4 11 16 6 16-5-17-6Z" fill="#d8b87b"/><path d="M20 17v21l16-5V12Z" fill="#745c47"/><path d="m4 17 16 6 16-5M12 9v25m16-24v25" fill="none" stroke="#667880" stroke-width="4"/>',
 lock:'<path d="M12 17v-5a8 8 0 0 1 16 0v5" fill="none" stroke="#c9d4d1" stroke-width="4"/><rect x="7" y="15" width="26" height="22" rx="5" fill="#768d96"/><path d="M9 17h22" stroke="#afc3c5" stroke-width="2"/><circle cx="20" cy="25" r="3" fill="#233a46"/><path d="M20 25v5" stroke="#233a46" stroke-width="3"/>',
 power:'<path d="m23 2-17 22h12l-2 14L35 14H23Z" fill="#f5be50"/><path d="m23 2-5 22H6Z" fill="#ffed9f"/>',
 health:'<path d="m20 3 15 6v12q-2 10-15 16Q7 31 5 21V9Z" fill="#70afa0"/><path d="M20 3v34Q7 31 5 21V9Z" fill="#467c79"/><path d="M17 11h6v7h7v6h-7v7h-6v-7h-7v-6h7Z" fill="#d2f1d3"/>',
 mechanics:'<path d="m16 3 8 0 2 6 6-1 5 7-4 5 4 5-5 7-6-1-2 6h-8l-2-6-6 1-5-7 4-5-4-5 5-7 6 1Z" fill="#8eafc3"/><circle cx="20" cy="20" r="10" fill="#3d596d"/><circle cx="20" cy="20" r="5" fill="#c0d9df"/>',
 mobility:'<path d="m11 5 15 2-3 16 11 4 2 8-29 0-1-9 5-7Z" fill="#c88c55"/><path d="m11 5 15 2-1 5-15-2Z" fill="#ffe0a0"/><path d="m7 31 28 0v5H7Z" fill="#526775"/><path d="m12 15 8 1m-9 6 8 1" stroke="#e9bd79" stroke-width="3"/>',
};
export function uiIcon(name) {
  if (!Object.hasOwn(SHAPES,name)) throw new RangeError('Unknown visual icon: '+name);
  return `<svg class="ui-icon" viewBox="0 0 40 40" aria-hidden="true">${SHAPES[name]}</svg>`;
}
export function decorateResources(list) {
  for (const id of ['coal','iron','diamond','token']) list.querySelector('.resource-'+id+' i').innerHTML = kitImage(id);
  list.classList.add('polished-resources');
  return list;
}
export function zoneIllustration(index) {
  const accents=['#e8b65b','#a08164','#75999e','#708698','#94a08a','#edaa72'];
  const color=accents[index]||'#708698';
  const details=[
    '<path d="m170 88 38-8-4 22-27 4Z" fill="#9f6740" stroke="#304452" stroke-width="3"/><path d="m173 86 13-15 16 8 6 4" fill="#415768"/><circle cx="183" cy="107" r="6" fill="#192d3a"/><circle cx="201" cy="103" r="6" fill="#192d3a"/>',
    '<path d="m170 53 31-9 5 51-32 8Z" fill="#1c2e3a" stroke="#886a51" stroke-width="8"/><path d="m98 125 45-13 58-13m-90 35 42-14 53-11" fill="none" stroke="#8a989c" stroke-width="3"/>',
    '<path d="M165 26v83m35-94v83M165 38l35-12m-35 36 35-12m-35 37 35-12" stroke="#749094" stroke-width="5"/><path d="m173 55 19-6v29l-19 6Z" fill="#344e5c" stroke="#a2b9af" stroke-width="3"/><path d="M182 19v42" stroke="#c5b184" stroke-width="2"/>',
    '<path d="m27 95 13-40 13 28 7-9 17 37m97-6 13-53 15 29 8-9 12 28" fill="#668490"/><path d="m187 52 1 49 13-20Z" fill="#8aa6ae"/>',
    '<path d="m174 99 4-44 14-16 8 18-3 43Zm28-1 5-29 11-8 4 31M42 109l-5-33 9-15 9 16-1 29" fill="#6ea99a"/><path d="m178 55 14-16-5 61m20-31 11-8-8 34" fill="#a9d7b2"/>',
    '<path d="M161 111V58h47v53Z" fill="#414b50" stroke="#9eaaa9" stroke-width="3"/><path d="M175 60V27h13v32m14 28h20V43" fill="none" stroke="#857765" stroke-width="7"/><path d="M172 101V82q12-13 24 0v19Z" fill="#252019"/><path d="m175 100 5-19 7 9 4-12 5 22Z" fill="#f8ae62"/><path d="M174 106h24M169 73h32" stroke="#bf9d7c" stroke-width="4"/>',
  ][index]||'';
  return `<svg class="zone-art" viewBox="0 0 240 145" aria-hidden="true"><ellipse cx="126" cy="128" rx="107" ry="12" fill="#0a1a28" opacity=".5"/><path d="m15 106 26-14 29 3 48-17 38 10 51 1 23 23-19 20-73 9-64-10-44-9Z" fill="#3c5361"/><path d="m15 106 56 7 53 12 88-5 18-8-19 20-73 9-64-10-44-9Z" fill="#243c4d"/><path d="m45 102 5-38 23-27 44-12 35 15 20 62-38 17Z" fill="#4d6875"/><path d="m73 37 44-12 35 15-24 2-41 18Z" fill="#78909a"/><path d="m56 70 17-33 14 23-12 30Z" fill="#607e89"/><path d="M83 104V69q25-30 50-8v43Z" fill="#101f2d"/><path d="M78 105V62l55-10 8 50" fill="none" stroke="#6c4d35" stroke-width="14"/><path d="M77 101V61l57-10 7 50" fill="none" stroke="${color}" stroke-width="8"/><path d="m74 64 63-11" stroke="#f0d29b" stroke-width="2"/><path d="m108 70 3 27m-21 24 13-17 34-5 16 20m-55-5 48-7" fill="none" stroke="#617b88" stroke-width="3"/><path d="M111 47v11" stroke="#283842" stroke-width="3"/><rect x="105" y="56" width="12" height="13" rx="3" fill="${color}"/><rect x="108" y="59" width="6" height="7" rx="1" fill="#fff0ac"/>${details}</svg>`;
}
export function workbenchArt() {
  return `<svg class="bench-art" viewBox="0 0 180 100" aria-hidden="true"><ellipse cx="91" cy="88" rx="73" ry="9" fill="#122735"/><path d="M30 61v26m118-27v24" stroke="#895b39" stroke-width="12"/><path d="m15 48 92-14 60 24-90 21Z" fill="#be8c52"/><path d="m15 48 62 23 90-13v10L77 88 15 59Z" fill="#704b33"/><path d="m53 32 35-6 30 12-8 10-18 4-2 11-30-11 2-12-17-4Z" fill="#698895"/><path d="m53 32 35-6 30 12-37 7Z" fill="#c2d5d5"/><g transform="translate(114 8) rotate(20) scale(.9)">${SHAPES.workshop}</g><path d="m31 32 2-6m9 1 4-5m-17-2-2-5" stroke="#ffd06c" stroke-width="3" stroke-linecap="round"/></svg>`;
}
