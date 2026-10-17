export const RESOURCES = Object.freeze([
  { id: 'coal', name: 'Charbon', icon: '⬟' },
  { id: 'iron', name: 'Fer', icon: '▰' },
  { id: 'diamond', name: 'Diamant', icon: '◇' },
  { id: 'token', name: 'Jeton Grisou', icon: '✦' },
]);
export const emptyWallet = () => Object.fromEntries(RESOURCES.map(({ id }) => [id, 0]));
export function resourceList(wallet, gains = false) {
  const list = document.createElement('div');
  list.className = 'resource-list';
  for (const resource of RESOURCES) {
    const item = document.createElement('div');
    item.className = 'resource resource-' + resource.id;
    const icon = document.createElement('i');
    icon.textContent = resource.icon;
    icon.setAttribute('aria-hidden', 'true');
    const amount = document.createElement('strong');
    amount.textContent = (gains ? '+' : '') + wallet[resource.id];
    const name = document.createElement('span');
    name.textContent = resource.name;
    item.append(icon, amount, name);
    if (gains && resource.id === 'token' && wallet.token > 0) item.classList.add('token-found');
    list.append(item);
  }
  return list;
}
