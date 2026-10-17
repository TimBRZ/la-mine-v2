import { WEAPONS } from '../weapons.js';

const EQUIPMENT = {
  shotgun: '<path d="M3 5h12l3-5h19v7H18l-3 3H5Z" fill="#263b47" stroke="#112532" stroke-width="1"/><path d="m3 5 9-2 4 4-5 6H3Z" fill="#b67943"/><path d="M14 0h23v4H14Z" fill="#b4cbd0"/><path d="M17 4h16v4H17Z" fill="#ca9151"/><path d="M34-1h4v9h-4Z" fill="#516f80"/><path d="M16 0h16" stroke="#eff9ed" stroke-width="1"/><path d="M20 5v3m4-3v3m4-3v3" stroke="#825032" stroke-width=".8"/>',
  smg: '<path d="M4 0h9v8H4l-2 4H0V1Z" fill="#5c7783"/><path d="M9-3h18l3 4v7H9Z" fill="#456576" stroke="#132c3b" stroke-width="1"/><path d="M11-3h15v3H11Z" fill="#acc7ce"/><path d="m18 6 7 0-2 11-6-1Z" fill="#839eaa" stroke="#233e4c" stroke-width="1"/><path d="m10 7 6 1-3 8-5-1Z" fill="#865d3e"/><path d="M29 0h8v5h-8Z" fill="#b9d1d5"/><path d="M34-1h4v7h-4Z" fill="#51727d"/><path d="M13 1h4m3 0h4" stroke="#192f40" stroke-width="1.5"/><path d="m19 10 4 1m-5 2 4 1" stroke="#415d6c" stroke-width="1"/>',
};
export function weaponArt(id) { return EQUIPMENT[id]; }

// Original vector hero: faceted shading, larger face and an asymmetric stance.
export function minerPortrait(id) {
  return `<svg class="miner-portrait" viewBox="0 0 320 280" role="img" aria-label="Mineur équipé : ${WEAPONS[id].name}">
    <defs><linearGradient id="helmet-${id}" x2=".8" y2="1"><stop stop-color="#ffe39a"/><stop offset=".48" stop-color="#f5b944"/><stop offset="1" stop-color="#b87626"/></linearGradient><linearGradient id="coat-${id}" x2="1" y2="1"><stop stop-color="#67b9b1"/><stop offset="1" stop-color="#286273"/></linearGradient><linearGradient id="skin-${id}" x2=".8" y2="1"><stop stop-color="#ffdbab"/><stop offset="1" stop-color="#c68b61"/></linearGradient></defs>
    <ellipse cx="163" cy="257" rx="95" ry="14" fill="#0a1b29" opacity=".45"/>
    <path d="m56 238 73-23 129 15-29 30-103 12-71-17Z" fill="#354f5e" stroke="#142e3e" stroke-width="4"/>
    <path d="m57 236 72-24 128 16-32 22-94 8Z" fill="#799498"/><path d="m75 233 54-15 105 12-30 17-71 6Z" fill="#57737d"/>
    <path d="m88 247 6 8 8-1-6-8m100 5 9 5 9-1-9-5" fill="#d5b26b"/>
    <g stroke="#173244" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M106 119q-26 3-18 43l13 16 20-9Z" fill="#986d44"/><path d="M94 137h16m-12 12h11" stroke="#d1a16b"/>
      <path d="m116 173 39 7-10 48-37-4Z" fill="#334e65"/>
      <path d="m160 177 32-4 22 46-35 17-21-33Z" fill="#426a80"/>
      <path d="m112 209 33 4-1 20-9 10-44-5 1-16Z" fill="#b27a49"/><path d="m92 229 43 5 9-6v10l-9 7-44-5Z" fill="#293e4d"/>
      <path d="m176 216 28-7 26 18-1 17-51 5-12-9Z" fill="#c48b51"/><path d="m168 238 60-6 1 12-51 5Z" fill="#283e4d"/>
      <path d="m107 214 22 3m51 8 19-3" stroke="#edbb79" stroke-width="3"/>
      <path d="M113 114q30-16 65-2l19 54-9 22q-43 12-86-6Z" fill="url(#coat-${id})"/>
      <path d="m123 114-3 37 58-2-13-39" fill="none" stroke="#e4b467" stroke-width="8"/>
      <path d="m114 150 66-1 8 37q-42 15-87-4Z" fill="#3c6580"/><path d="m128 155 34-2-1 23-29 2Z" fill="#2c4e65"/>
      <path d="m110 177 77-4" stroke="#a27247" stroke-width="8"/><rect x="146" y="170" width="15" height="13" rx="2" fill="#e1b565" stroke-width="2"/>
      <path d="M116 116q-13-7-22 8l-11 28 22 13 25-25" fill="url(#coat-${id})"/>
      <path d="M175 114q19-8 26 10l13 24-24 18-20-27" fill="#438b94"/>
    </g>
    <g transform="rotate(-7 155 85)" stroke="#213748" stroke-width="3.5" stroke-linejoin="round">
      <ellipse cx="111" cy="82" rx="10" ry="15" fill="#d0956c"/><ellipse cx="199" cy="81" rx="10" ry="14" fill="#e0a979"/>
      <path d="M112 56q42-21 85 0l-1 40q-7 26-38 28-33-3-43-25Z" fill="url(#skin-${id})"/>
      <path d="M118 96q16 12 38 10 23 1 35-14l-3 17q-27 29-56 5Z" fill="#7d523b" stroke="none"/>
      <path d="M133 102q23 10 40-2-4 15-23 13Z" fill="#fff0cc" stroke="#80553d" stroke-width="2"/>
      <path d="M145 81q-10 16 5 16h9" fill="#e9ac77" stroke="#b97d58" stroke-width="2"/>
      <ellipse cx="134" cy="82" rx="5" ry="7" fill="#223445" stroke="none"/><ellipse cx="176" cy="80" rx="5" ry="7" fill="#223445" stroke="none"/>
      <circle cx="135" cy="80" r="1.8" fill="#fff5d9" stroke="none"/><circle cx="177" cy="78" r="1.8" fill="#fff5d9" stroke="none"/>
      <path d="m127 69 13-1m30-2 13 1" stroke="#71543f" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="125" cy="96" rx="7" ry="3" fill="#dd9274" stroke="none"/><ellipse cx="184" cy="94" rx="7" ry="3" fill="#dd9274" stroke="none"/>
      <path d="M106 55q2-49 49-49 47 2 49 47Z" fill="url(#helmet-${id})"/>
      <path d="M143 9q-8 18-5 37l30-1q5-19-2-35" fill="#ffe29a" stroke="#ce913a" stroke-width="2"/>
      <path d="M101 50q54-13 108-2l-1 14q-52-8-106 2Z" fill="#e8a639"/>
      <path d="M105 50q52-12 99-2" fill="none" stroke="#ffdf86" stroke-width="3"/>
      <path d="M119 39q5-17 15-21" fill="none" stroke="#ffe6a3" stroke-width="4" stroke-linecap="round"/>
      <circle cx="154" cy="40" r="18" fill="#496775"/><circle cx="154" cy="40" r="12" fill="#e4ad4c" stroke="#9c743a" stroke-width="2"/><circle cx="154" cy="40" r="8" fill="#fff5c4" stroke="none"/><path d="m149 36 5-2" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    </g>
    <g transform="translate(64 146) rotate(-13) scale(4)">${weaponArt(id)}</g>
    <path d="M103 160q-4-14 9-18l16 7q7 11-5 19Z M190 135q8-9 18 0l6 15q-5 11-17 4Z" fill="url(#skin-${id})" stroke="#203849" stroke-width="4" stroke-linejoin="round"/>
    <path d="m110 152 10 5m78-18 4 8" stroke="#fbe0af" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}
