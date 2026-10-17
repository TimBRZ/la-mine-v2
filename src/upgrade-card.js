const ICONS = {
  magazine: '<path d="M12 5h18v31H12zM17 12h8m-8 7h8m-8 7h8"/>',
  heat: '<path d="M22 4c5 10-6 12 2 18 4-3 5-7 5-7 13 16-2 26-10 23C3 33 9 21 14 15c-1 7 4 10 4 10-3-10 5-12 4-21z"/>',
  piercing: '<path d="M4 21h34m-7-6 7 6-7 6M13 10v22m12-22v22"/>',
  pellets: '<circle cx="12" cy="10" r="2"/><circle cx="22" cy="7" r="2"/><circle cx="31" cy="12" r="2"/><circle cx="16" cy="21" r="2"/><circle cx="27" cy="23" r="2"/><path d="m10 34 9-7m4 9 2-6m9 2-3-6"/>',
  boots: '<path d="M13 6h14l-2 18 9 5v7H8v-9l5-4zM9 31h24M15 13h9M15 19h8"/>',
  trigger: '<path d="M6 12h29v8H20l-4 15H7l5-16M23 20v7h7v-7M29 12V8h6"/>',
  explosion: '<path d="m21 3 4 11 11-6-6 12 9 5-13 2-2 12-7-11-12 5 7-12-9-7 13 1z"/>',
  sawn: '<path d="M5 14h23v9H18l-3 12H7l4-15M28 12v13m5-12 5-5m-5 11h6m-6 6 5 5"/>',
  double: '<path d="M5 12h22v6H16l-3 13H6l4-16M16 23h18v6H24l-2 8h-7M31 8l3-4m2 10 4-1"/>',
  shield: '<path d="m21 4 14 5v12c0 8-14 16-14 16S7 29 7 21V9zM21 12v15m-7-8h14"/>',
};

export function upgradeCard(upgrade, select) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'upgrade-card';
  button.dataset.upgrade = upgrade.id;
  const icon = document.createElement('span');
  icon.className = 'upgrade-icon';
  // Only static, developer-owned SVG paths; no player data enters markup.
  icon.innerHTML = '<svg viewBox="0 0 42 42" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[upgrade.icon] + '</svg>';
  const content = document.createElement('span');
  content.className = 'upgrade-content';
  for (const [className, text] of [['category', upgrade.category], ['upgrade-title', upgrade.title], ['upgrade-description', upgrade.description], ['upgrade-stat', upgrade.stat]]) {
    const line = document.createElement('span');
    line.className = className;
    line.textContent = text;
    content.append(line);
  }
  button.append(icon, content);
  content.querySelector('.category').textContent += ' · RANG ' + upgrade.rank + '/' + upgrade.maxRanks;
  button.addEventListener('click', () => select(upgrade.id));
  return button;
}
