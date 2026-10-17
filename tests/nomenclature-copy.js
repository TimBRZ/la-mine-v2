// Text-only migration. Deliberately excludes lowercase technical identifiers.
export function renameVisibleCopy(text) {
 const pairs=[['Contrats du Porion','Contrats de la Mine'],['Caisses du Porion','Caisses du Mineur'],['Caisse du Porion','Caisse du Mineur'],['Porion Ravens','Contremaître Ravens'],['du Porion','du Contremaître'],['Le Porion','Le Contremaître']];
 for(const [oldLabel,newLabel]of pairs)for(const [a,b]of [[oldLabel,newLabel],[oldLabel.toUpperCase(),newLabel.toUpperCase()],[oldLabel.toLowerCase(),newLabel.toLowerCase()]])text=text.replaceAll(a,b);
 return text.replaceAll('<em>PORION</em>','<em>CONTREMAÎTRE</em>').replaceAll('HUD, Porion,','HUD, Contremaître Ravens,');
}
export const NOMENCLATURE_FILES=['contracts.js','ravens.js','menu/contracts-view.js','menu/crates-view.js','menu/main-menu.js','menu/relief-view.js','menu/talents-view.js','ui.js','upgrade-overlay.js','upgrades.js','talents.js','workshop.js'];
