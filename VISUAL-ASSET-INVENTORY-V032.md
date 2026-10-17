# Inventaire visuel complet — V0.32

Relevé du 13 octobre 2026. **Aucun asset remplacé ou supprimé.** La priorité concerne une future harmonisation, pas une suppression. P0 = reconnaissance/lecture combat ; P1 = cohérence/confort ; P2 = détail secondaire. Les secours, composants dormants et archives restent conservés.

Le périmètre comprend les 33 images physiques de src/assets, les 48 textures procédurales et les dessins/UI produits par JavaScript, SVG inline, CSS ou glyphes système. Les textures ne sont pas toutes affichées ensemble : 13 entrées sont des secours, tandis que 15 SVG combat préchargés constituent les apparences habituelles Z1–2. Les 18 boss réutilisés dans les triples ne sont pas comptés une seconde fois.

[Sources chiffrées physiques](audit-v032/file-inventory.json) · [Textures/dimensions RGBA](audit-v032/texture-inventory.json) · [Inventaire structuré complet](audit-v032/asset-inventory.json) · [Bible et plan](VISUAL-BIBLE-V032.md).

## 1. Images physiques — 33 fichiers, 2 247 825 octets

| Asset / clé | Fichier | Usage | État actuel | Priorité future |
|---|---|---|---|---|
| crachefer · 128 × 128 · 3909 octets | [src/assets/combat-v020/crachefer.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/crachefer.svg) | Le Crachefer ; combat-appearances.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| draisine · 128 × 128 · 3807 octets | [src/assets/combat-v020/draisine.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/draisine.svg) | Draisine ; combat-appearances.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| drill · 128 × 128 · 3411 octets | [src/assets/combat-v020/drill.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/drill.svg) | Foreuse autonome ; combat-appearances.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| effondreur · 128 × 128 · 3036 octets | [src/assets/combat-v020/effondreur.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/effondreur.svg) | L’Effondreur ; combat-appearances.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| grisoux · 128 × 128 · 2811 octets | [src/assets/combat-v020/grisoux.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/grisoux.svg) | Grisou X ; combat-appearances.js et menu/kit.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| haveuse · 128 × 128 · 4421 octets | [src/assets/combat-v020/haveuse.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/haveuse.svg) | La Haveuse ; combat-appearances.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| hero · 128 × 128 · 4080 octets | [src/assets/combat-v020/hero.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/hero.svg) | Héros ; combat-appearances.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| locomotive · 128 × 128 · 4340 octets | [src/assets/combat-v020/locomotive.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/locomotive.svg) | La Locomotive ; combat-appearances.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| miner · 128 × 128 · 3396 octets | [src/assets/combat-v020/miner.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/miner.svg) | Mineur grisouteux ; combat-appearances.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| rat · 128 × 128 · 3019 octets | [src/assets/combat-v020/rat.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/rat.svg) | Rat de galerie ; combat-appearances.js | SVG et sens avant/arrière validés : préserver silhouette/orientation | P1 — préserver |
| shotgun · 128 × 128 · 2299 octets | [src/assets/combat-v020/shotgun.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/shotgun.svg) | Fusil à pompe ; combat-appearances.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| smg · 128 × 128 · 2426 octets | [src/assets/combat-v020/smg.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/smg.svg) | Mitraillette ; combat-appearances.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| stationmaster · 128 × 128 · 3405 octets | [src/assets/combat-v020/stationmaster.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/stationmaster.svg) | Le Chef de Gare ; combat-appearances.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| switchman · 128 × 128 · 3617 octets | [src/assets/combat-v020/switchman.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/switchman.svg) | L’Aiguilleur ; combat-appearances.js | SVG 128² préchargé ; volume modelé, image statique transformée | P0 |
| wagon · 128 × 128 · 4209 octets | [src/assets/combat-v020/wagon.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/wagon.svg) | Wagon Fou ; combat-appearances.js | SVG et sens avant/arrière validés : préserver silhouette/orientation | P1 — préserver |
| carreau-depth · 360 × 270 · 4777 octets | [src/assets/kit-da/carreau-depth.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/carreau-depth.svg) | Décor en plans de l’accueil ; kit.css | Version affichée, silhouettes industrielles mais profondeur et illustration éloignées du combat | P1 |
| carreau · 360 × 270 · 1783 octets | [src/assets/kit-da/carreau.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/carreau.svg) | Ancien décor du carreau ; catalog.html | Conservé au catalogue, remplacé dans l’accueil par carreau-depth | Conserver — dormant |
| coal · 84 × 84 · 1084 octets | [src/assets/kit-da/coal.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/coal.svg) | Charbon, compteurs et coûts | SVG facetté du kit, distinct du glyphe résultat et du drop Graphics | P1 |
| cta-sign · 360 × 68 · 1406 octets | [src/assets/kit-da/cta-sign.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/cta-sign.svg) | CTA menu et boutons Atelier | Plaque jaune riche, répétition du cadre | P1 |
| diamond · 84 × 84 · 1073 octets | [src/assets/kit-da/diamond.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/diamond.svg) | Diamant, compteurs et coûts | Facettes lisibles, détails brillants à simplifier seulement si utiles | P1 |
| galeries-locked · 300 × 190 · 1943 octets | [src/assets/kit-da/galeries-locked.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/galeries-locked.svg) | Carte Zone 2 verrouillée | Image de verrouillage historique, même galerie plutôt que signature ferroviaire | P1 |
| galeries · 300 × 190 · 1605 octets | [src/assets/kit-da/galeries.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/galeries.svg) | Carte Zone 1 et illustration Relève | Entrée minière du kit, famille différente des autres cartes inline | P1 |
| iron · 84 × 84 · 1057 octets | [src/assets/kit-da/iron.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/iron.svg) | Fer, compteurs et coûts | Lingot du kit à harmoniser avec les variantes inline et drops | P1 |
| locked-sign · 140 × 58 · 1402 octets | [src/assets/kit-da/locked-sign.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/locked-sign.svg) | Fond des boutons future-nav désactivés | Règle CSS conditionnelle, les pages méta actuelles sont actives | P2 — conditionnel |
| miner · 400 × 600 · 41796 octets | [src/assets/kit-da/miner.webp](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/miner.webp) | Héros d’accueil, heroPresentation | Grand portrait WebP plus modelé/cartoonesque que le sprite ; harmonisation depuis le même design | P0 design / P1 menu |
| nav-active · 120 × 80 · 1321 octets | [src/assets/kit-da/nav-active.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/nav-active.svg) | Navigation et équipement sélectionnés | Plaque jaune ; état aussi indiqué par texte et coche | P1 |
| nav-idle · 120 × 80 · 1320 octets | [src/assets/kit-da/nav-idle.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/nav-idle.svg) | Navigation, équipement, râtelier, cartes | Cadre métallique détaillé utilisé à plusieurs proportions | P1 |
| podium · 360 × 100 · 1257 octets | [src/assets/kit-da/podium.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/podium.svg) | Socle sous héros de menu | Socle illustré décoratif | P2 |
| shotgun · 240 × 100 · 1444 octets | [src/assets/kit-da/shotgun.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/shotgun.svg) | Fusil au menu/râtelier | SVG différent de l’arme tenue en combat | P0 cohérence / P1 menu |
| smg · 240 × 100 · 1463 octets | [src/assets/kit-da/smg.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/smg.svg) | Mitraillette au menu/râtelier | SVG différent de l’arme tenue en combat | P0 cohérence / P1 menu |
| token · 84 × 84 · 1110 octets | [src/assets/kit-da/token.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/token.svg) | Jeton Grisou, compteurs et coûts | Médaille du kit ; conserver distinction de silhouette | P1 |
| upgrade-panel · 180 × 240 · 1423 octets | [src/assets/kit-da/upgrade-panel.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/kit-da/upgrade-panel.svg) | Fond des cartes Atelier et zone disponible | Illustration étirée avec beaucoup de bordures | P1 |
| porion-ravens · 1145 × 1374 · 2128375 octets | [src/assets/porion-ravens.png](C:/LaMineV2/la-mine-v2-v01/src/assets/porion-ravens.png) | Portrait/badge/répliques Contremaître Ravens | Identité validée ; fichier surdimensionné pour le badge, style plus pictural | P1 — identité protégée |

## 2. Textures générées — 48 clés, 9 330 016 octets RGBA théoriques

Une ligne désigne une clé de texture, pas un fichier image manquant. Les dimensions ne définissent jamais une hitbox.

| Asset / clé | Fichier | Usage | État actuel | Priorité future |
|---|---|---|---|---|
| wagon · 52 × 42 | [src/enemies/rail-textures.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/rail-textures.js) | Wagon Fou | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| draisine · 50 × 44 | [src/enemies/rail-textures.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/rail-textures.js) | Draisine | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| stationmaster · 84 × 84 | [src/rail-boss-view.js](C:/LaMineV2/la-mine-v2-v01/src/rail-boss-view.js) | Le Chef de Gare | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| locomotive · 84 × 84 | [src/rail-boss-view.js](C:/LaMineV2/la-mine-v2-v01/src/rail-boss-view.js) | La Locomotive | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| switchman · 84 × 84 | [src/rail-boss-view.js](C:/LaMineV2/la-mine-v2-v01/src/rail-boss-view.js) | L’Aiguilleur | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| rat · 34 × 40 | [src/enemies/textures.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/textures.js) | Rat de galerie | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| miner · 54 × 60 | [src/enemies/textures.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/textures.js) | Mineur grisouteux | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| drill · 54 × 42 | [src/enemies/textures.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/textures.js) | Foreuse autonome | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| deepdriller · 60 × 48 | [src/shaft-art.js](C:/LaMineV2/la-mine-v2-v01/src/shaft-art.js) | Foreur de fond | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| surveyor · 44 × 52 | [src/shaft-art.js](C:/LaMineV2/la-mine-v2-v01/src/shaft-art.js) | Sondeur | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| gasminer · 42 × 50 | [src/shaft-art.js](C:/LaMineV2/la-mine-v2-v01/src/shaft-art.js) | Grisouteux | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| cager · 84 × 84 | [src/shaft-art.js](C:/LaMineV2/la-mine-v2-v01/src/shaft-art.js) | Le Cageur | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| compressor · 84 × 84 | [src/shaft-art.js](C:/LaMineV2/la-mine-v2-v01/src/shaft-art.js) | Le Compresseur | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| firedamp · 84 × 84 | [src/shaft-art.js](C:/LaMineV2/la-mine-v2-v01/src/shaft-art.js) | Le Grisou | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| arena-shaft59 · 450 × 800 | [src/shaft-art.js](C:/LaMineV2/la-mine-v2-v01/src/shaft-art.js) | Fond arena-shaft59 | Fond statique précalculé ; signature à renforcer | P0 |
| arena-rift · 450 × 800 | [src/rift/art.js](C:/LaMineV2/la-mine-v2-v01/src/rift/art.js) | Fond arena-rift | Fond statique précalculé ; signature à renforcer | P0 |
| crawler · 48 × 48 | [src/rift/art.js](C:/LaMineV2/la-mine-v2-v01/src/rift/art.js) | Rampant de Grisou | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| spitter · 48 × 48 | [src/rift/art.js](C:/LaMineV2/la-mine-v2-v01/src/rift/art.js) | Cracheur | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| burster · 48 × 48 | [src/rift/art.js](C:/LaMineV2/la-mine-v2-v01/src/rift/art.js) | Éclateur | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| splitter · 84 × 84 | [src/rift/art.js](C:/LaMineV2/la-mine-v2-v01/src/rift/art.js) | Le Fendeur | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| blower · 84 × 84 | [src/rift/art.js](C:/LaMineV2/la-mine-v2-v01/src/rift/art.js) | Le Souffleur | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| core · 84 × 84 | [src/rift/art.js](C:/LaMineV2/la-mine-v2-v01/src/rift/art.js) | Le Cœur de Grisou | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| arena-depths · 450 × 800 | [src/depths/art.js](C:/LaMineV2/la-mine-v2-v01/src/depths/art.js) | Fond arena-depths | Fond statique précalculé ; signature à renforcer | P0 |
| lampist · 48 × 48 | [src/depths/art.js](C:/LaMineV2/la-mine-v2-v01/src/depths/art.js) | Lampiste | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| blaster · 48 × 48 | [src/depths/art.js](C:/LaMineV2/la-mine-v2-v01/src/depths/art.js) | Boutefeu | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| blackmaw · 48 × 48 | [src/depths/art.js](C:/LaMineV2/la-mine-v2-v01/src/depths/art.js) | Gueule-Noire | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| lampmajor · 84 × 84 | [src/depths/art.js](C:/LaMineV2/la-mine-v2-v01/src/depths/art.js) | Le Lampiste-Major | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| dynamiter · 84 × 84 | [src/depths/art.js](C:/LaMineV2/la-mine-v2-v01/src/depths/art.js) | Le Dynamiteur | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| blackmass · 84 × 84 | [src/depths/art.js](C:/LaMineV2/la-mine-v2-v01/src/depths/art.js) | La Masse Noire | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| arena-forge · 450 × 800 | [src/forge/art.js](C:/LaMineV2/la-mine-v2-v01/src/forge/art.js) | Fond arena-forge | Fond statique précalculé ; signature à renforcer | P0 |
| stoker · 48 × 48 | [src/forge/art.js](C:/LaMineV2/la-mine-v2-v01/src/forge/art.js) | Chauffeur | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| riveter · 48 × 48 | [src/forge/art.js](C:/LaMineV2/la-mine-v2-v01/src/forge/art.js) | Riveteur | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| scorifier · 48 × 48 | [src/forge/art.js](C:/LaMineV2/la-mine-v2-v01/src/forge/art.js) | Scorificateur | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| furnace · 84 × 84 | [src/forge/art.js](C:/LaMineV2/la-mine-v2-v01/src/forge/art.js) | Le Maître de Four | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| hammer · 84 × 84 | [src/forge/art.js](C:/LaMineV2/la-mine-v2-v01/src/forge/art.js) | Le Marteau-Pilon | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| boiler · 84 × 84 | [src/forge/art.js](C:/LaMineV2/la-mine-v2-v01/src/forge/art.js) | La Chaudière | Apparence actuelle procédurale ; silhouette géométrique | P0 |
| player · 40 × 40 | [src/textures.js](C:/LaMineV2/la-mine-v2-v01/src/textures.js) | Héros (secours) | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| enemy · 40 × 40 | [src/textures.js](C:/LaMineV2/la-mine-v2-v01/src/textures.js) | Ennemi générique (secours) | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| haveuse · 84 × 84 | [src/textures.js](C:/LaMineV2/la-mine-v2-v01/src/textures.js) | La Haveuse | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| energy · 24 × 10 | [src/textures.js](C:/LaMineV2/la-mine-v2-v01/src/textures.js) | Impulsions Grisou X | Petit élément réutilisé dans le pool de rendu | P0 |
| pellet · 16 × 6 | [src/textures.js](C:/LaMineV2/la-mine-v2-v01/src/textures.js) | Plombs Fusil / projectile Mitraillette | Petit élément réutilisé dans le pool de rendu | P0 |
| crachefer · 84 × 84 | [src/boss-art.js](C:/LaMineV2/la-mine-v2-v01/src/boss-art.js) | Le Crachefer | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| effondreur · 84 × 84 | [src/boss-art.js](C:/LaMineV2/la-mine-v2-v01/src/boss-art.js) | L’Effondreur | Texture cuite de secours, normalement remplacée par SVG ; enemy = repli générique | Conserver secours — validation avec le lot P0 |
| muzzle · 36 × 30 | [src/textures.js](C:/LaMineV2/la-mine-v2-v01/src/textures.js) | Flash de bouche partagé | Petit élément réutilisé dans le pool de rendu | P0 |
| spark · 6 × 4 | [src/textures.js](C:/LaMineV2/la-mine-v2-v01/src/textures.js) | Étincelle partagée | Petit élément réutilisé dans le pool de rendu | P0 |
| ring · 40 × 40 | [src/textures.js](C:/LaMineV2/la-mine-v2-v01/src/textures.js) | Anneau impact/kill/Grisou/bouclier | Petit élément réutilisé dans le pool de rendu | P0 |
| arena-galleries · 450 × 800 | [src/combat-art.js](C:/LaMineV2/la-mine-v2-v01/src/combat-art.js) | Fond arena-galleries | Fond statique précalculé ; signature à renforcer | P0 |
| arena-tracks · 450 × 800 | [src/combat-art.js](C:/LaMineV2/la-mine-v2-v01/src/combat-art.js) | Fond arena-tracks | Fond statique précalculé ; signature à renforcer | P0 |

## 3. Visuels sans fichier image propre

Les composants sont inventoriés à leur source, avec les variantes d'icônes nommées individuellement. Les textes variables, quantités, phases et duplications d'ennemis réutilisent ces composants ; ils ne constituent pas des assets supplémentaires.

| Asset / clé | Fichier | Usage | État actuel | Priorité future |
|---|---|---|---|---|
| uiIcon.coal | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline coal ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.iron | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline iron ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.diamond | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline diamond ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.token | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline token ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.home | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline home ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.zones | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline zones ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.workshop | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline workshop ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.talents | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline talents ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.relief | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline relief ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.crates | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline crates ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.lock | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline lock ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.power | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline power ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.health | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline health ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.mechanics | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline mechanics ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| uiIcon.mobility | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Pictogramme SVG inline mobility ; navigation/Atelier selon appel | Facettes de 40 unités ; ressources remplacées par kitImage dans les compteurs décorés, autres variantes conservées | P1 |
| zoneIllustration.0 | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Vignette zone Galeries | Entrée commune + accessoire ; index 0 supplanté par galeries.svg dans carte actuelle | Conserver — secours |
| zoneIllustration.1 | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Vignette zone Voies | Entrée commune + accessoire ; index 0 supplanté par galeries.svg dans carte actuelle | P1 |
| zoneIllustration.2 | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Vignette zone Puits59 | Entrée commune + accessoire ; index 0 supplanté par galeries.svg dans carte actuelle | P1 |
| zoneIllustration.3 | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Vignette zone Faille | Entrée commune + accessoire ; index 0 supplanté par galeries.svg dans carte actuelle | P1 |
| zoneIllustration.4 | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Vignette zone Profondeurs | Entrée commune + accessoire ; index 0 supplanté par galeries.svg dans carte actuelle | P1 |
| zoneIllustration.5 | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Vignette zone Forges | Entrée commune + accessoire ; index 0 supplanté par galeries.svg dans carte actuelle | P1 |
| workbenchArt | [src/menu/art.js](C:/LaMineV2/la-mine-v2-v01/src/menu/art.js) | Illustration étau/outils Atelier | Vectoriel facetté, lisible en gros | P2 |
| perkIcon.magazine | [src/upgrade-card.js](C:/LaMineV2/la-mine-v2-v01/src/upgrade-card.js) | Icône de cartes de perks, réutilisée selon le catalogue | SVG linéaire 42² ; distinct des icônes facettées menu | P1 |
| perkIcon.heat | [src/upgrade-card.js](C:/LaMineV2/la-mine-v2-v01/src/upgrade-card.js) | Icône de cartes de perks, réutilisée selon le catalogue | SVG linéaire 42² ; distinct des icônes facettées menu | P1 |
| perkIcon.piercing | [src/upgrade-card.js](C:/LaMineV2/la-mine-v2-v01/src/upgrade-card.js) | Icône de cartes de perks, réutilisée selon le catalogue | SVG linéaire 42² ; distinct des icônes facettées menu | P1 |
| perkIcon.pellets | [src/upgrade-card.js](C:/LaMineV2/la-mine-v2-v01/src/upgrade-card.js) | Icône de cartes de perks, réutilisée selon le catalogue | SVG linéaire 42² ; distinct des icônes facettées menu | P1 |
| perkIcon.boots | [src/upgrade-card.js](C:/LaMineV2/la-mine-v2-v01/src/upgrade-card.js) | Icône de cartes de perks, réutilisée selon le catalogue | SVG linéaire 42² ; distinct des icônes facettées menu | P1 |
| perkIcon.trigger | [src/upgrade-card.js](C:/LaMineV2/la-mine-v2-v01/src/upgrade-card.js) | Icône de cartes de perks, réutilisée selon le catalogue | SVG linéaire 42² ; distinct des icônes facettées menu | P1 |
| perkIcon.explosion | [src/upgrade-card.js](C:/LaMineV2/la-mine-v2-v01/src/upgrade-card.js) | Icône de cartes de perks, réutilisée selon le catalogue | SVG linéaire 42² ; distinct des icônes facettées menu | P1 |
| perkIcon.sawn | [src/upgrade-card.js](C:/LaMineV2/la-mine-v2-v01/src/upgrade-card.js) | Icône de cartes de perks, réutilisée selon le catalogue | SVG linéaire 42² ; distinct des icônes facettées menu | P1 |
| perkIcon.double | [src/upgrade-card.js](C:/LaMineV2/la-mine-v2-v01/src/upgrade-card.js) | Icône de cartes de perks, réutilisée selon le catalogue | SVG linéaire 42² ; distinct des icônes facettées menu | P1 |
| perkIcon.shield | [src/upgrade-card.js](C:/LaMineV2/la-mine-v2-v01/src/upgrade-card.js) | Icône de cartes de perks, réutilisée selon le catalogue | SVG linéaire 42² ; distinct des icônes facettées menu | P1 |
| talentIcon.good-start | [src/talents.js](C:/LaMineV2/la-mine-v2-v01/src/talents.js) | BON DÉPART : ✦ (menu/talents-view.js) | Glyphe système, dessin et fallback dépendants de la police | P1 |
| talentIcon.porion-eye | [src/talents.js](C:/LaMineV2/la-mine-v2-v01/src/talents.js) | ŒIL DU CONTREMAÎTRE : ◉ (menu/talents-view.js) | Glyphe système, dessin et fallback dépendants de la police | P1 |
| talentIcon.first-aid | [src/talents.js](C:/LaMineV2/la-mine-v2-v01/src/talents.js) | PREMIERS SECOURS : ✚ (menu/talents-view.js) | Glyphe système, dessin et fallback dépendants de la police | P1 |
| talentIcon.prospector | [src/talents.js](C:/LaMineV2/la-mine-v2-v01/src/talents.js) | PROSPECTEUR : ⛏ (menu/talents-view.js) | Glyphe système, dessin et fallback dépendants de la police | P1 |
| talentIcon.magnet | [src/talents.js](C:/LaMineV2/la-mine-v2-v01/src/talents.js) | AIMANT RENFORCÉ : ↟ (menu/talents-view.js) | Glyphe système, dessin et fallback dépendants de la police | P1 |
| talentIcon.cold-blood | [src/talents.js](C:/LaMineV2/la-mine-v2-v01/src/talents.js) | SANG-FROID : ❄ (menu/talents-view.js) | Glyphe système, dessin et fallback dépendants de la police | P1 |
| talentIcon.last-breath | [src/talents.js](C:/LaMineV2/la-mine-v2-v01/src/talents.js) | DERNIER SOUFFLE : ♥ (menu/talents-view.js) | Glyphe système, dessin et fallback dépendants de la police | P1 |
| talentIcon.lucky-hand | [src/talents.js](C:/LaMineV2/la-mine-v2-v01/src/talents.js) | MAIN HEUREUSE : ♧ (menu/talents-view.js) | Glyphe système, dessin et fallback dépendants de la police | P1 |
| resourceGlyph.coal | [src/resources.js](C:/LaMineV2/la-mine-v2-v01/src/resources.js) | Ressource coal en liste non décorée/résultat | Glyphe Unicode, remplacé par image sur écrans décorés | P1 |
| loot.coal | [src/loot-view.js](C:/LaMineV2/la-mine-v2-v01/src/loot-view.js) | Drop combat coal | Graphics partagés, silhouette, rebond, pile et aspiration ; faible priorité de couche | P1 |
| resourceGlyph.iron | [src/resources.js](C:/LaMineV2/la-mine-v2-v01/src/resources.js) | Ressource iron en liste non décorée/résultat | Glyphe Unicode, remplacé par image sur écrans décorés | P1 |
| loot.iron | [src/loot-view.js](C:/LaMineV2/la-mine-v2-v01/src/loot-view.js) | Drop combat iron | Graphics partagés, silhouette, rebond, pile et aspiration ; faible priorité de couche | P1 |
| resourceGlyph.diamond | [src/resources.js](C:/LaMineV2/la-mine-v2-v01/src/resources.js) | Ressource diamond en liste non décorée/résultat | Glyphe Unicode, remplacé par image sur écrans décorés | P1 |
| loot.diamond | [src/loot-view.js](C:/LaMineV2/la-mine-v2-v01/src/loot-view.js) | Drop combat diamond | Graphics partagés, silhouette, rebond, pile et aspiration ; faible priorité de couche | P1 |
| resourceGlyph.token | [src/resources.js](C:/LaMineV2/la-mine-v2-v01/src/resources.js) | Ressource token en liste non décorée/résultat | Glyphe Unicode, remplacé par image sur écrans décorés | P1 |
| loot.token | [src/loot-view.js](C:/LaMineV2/la-mine-v2-v01/src/loot-view.js) | Drop combat token | Graphics partagés, silhouette, rebond, pile et aspiration ; faible priorité de couche | P1 |
| minerPortrait / weaponArt | [src/menu/character.js](C:/LaMineV2/la-mine-v2-v01/src/menu/character.js) | Ancien héros et deux armes SVG inline | Non instanciés dans le parcours actuel, kit utilisé | Conserver — dormant |
| WeaponOverlay | [src/weapon-overlay.js](C:/LaMineV2/la-mine-v2-v01/src/weapon-overlay.js) | Ancienne sélection de deux armes | Composant dormant ; ne pas considérer son texte comme UI actuelle | Conserver — dormant |
| warnings communs | [src/combat-art.js](C:/LaMineV2/la-mine-v2-v01/src/combat-art.js) | Couloirs, cercles crantés, chevrons, télégraphes | Géométrie issue simulation ; protéger les contours | P0 |
| boss Z1 | [src/arena-view.js](C:/LaMineV2/la-mine-v2-v01/src/arena-view.js) | Warning charge/slam (projectiles : enemies/view.js) | Lire phases existantes ; aucune nouvelle durée | P0 |
| rails / vapeur Z2 | [src/rail-boss-view.js](C:/LaMineV2/la-mine-v2-v01/src/rail-boss-view.js) | Rails H/V/croix, corridor, vapeur | Géométrie verrouillée ; rail statique doit rester plus terne | P0 |
| charges ennemies | [src/enemies/view.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/view.js) | Foreuse/Draisine/Wagon et états des acteurs | Labels, corps, anneaux et barres ; warnings depth8 | P0 |
| Z3 hazards et pression | [src/shaft-art.js](C:/LaMineV2/la-mine-v2-v01/src/shaft-art.js) | Instabilité, sondes, zones et machines du Puits | Lignes/cercle sobres, intention mécanique peu incarnée | P0 |
| Z4 gaz / fissures | [src/rift/art.js](C:/LaMineV2/la-mine-v2-v01/src/rift/art.js) | Poches, souffle et couronnes de gaz | Vert interne voisin énergie alliée ; conserver bord hostile | P0 |
| Z5 faisceaux / charges / bonds | [src/depths/art.js](C:/LaMineV2/la-mine-v2-v01/src/depths/art.js) | Dangers et repères des Profondeurs | Signes fonctionnels ; silhouette/boss encore abstraits | P0 |
| Z5 extinction | [src/arena-view.js](C:/LaMineV2/la-mine-v2-v01/src/arena-view.js) | Teinte fond selon états de pression | Bonne isolation : aucun assombrissement des acteurs/dangers | P0 — préserver isolation |
| Z6 chaleur / slams / soupapes | [src/forge/art.js](C:/LaMineV2/la-mine-v2-v01/src/forge/art.js) | Plaques, cônes, résidus, traînées et séquences | Trois états et géométrie fonctionnels ; matériel à enrichir en périphérie | P0 |
| projectiles hostiles | [src/enemies/view.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/view.js) | Halo, noyau, contour, courte traînée | Compact et distinct des tirs amis ; rendu commun | P0 |
| recul / muzzle / tir | [src/room-scene.js](C:/LaMineV2/la-mine-v2-v01/src/room-scene.js) | Présentation des trois armes et événements | Arme séparée ; code temporel gameplay inchangé | P0 |
| sparks / rings / hit / kill | [src/effects.js](C:/LaMineV2/la-mine-v2-v01/src/effects.js) | Pool partagé des impacts et morts | 48 éléments ; depth40 au-dessus warnings, mort boss similaire mort mob | P0 |
| Coup de Grisou / arc / bouclier | [src/room-scene.js](C:/LaMineV2/la-mine-v2-v01/src/room-scene.js) | Feedback effets alliés, Plaques du Contremaître | Anneaux/gerbes ; arc à harmoniser reduced-motion | P0 |
| héros hit / invulnérabilité / wash | [src/room-scene.js](C:/LaMineV2/la-mine-v2-v01/src/room-scene.js) | Tint, alpha, bord rouge et shake | Retour lisible mais viewport à protéger des grands effets | P0 |
| bossHP / ombres / label attaque | [src/enemies/view.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/view.js) | Sous-éléments du container acteur | Barres sans noms, ombre générique et label réduit au mobile | P0 |
| HUD / jalons / perk chips | [src/ui.js](C:/LaMineV2/la-mine-v2-v01/src/ui.js) | HP, arme, vague, Focus, butin, progression | Nom arme dominant ; petits labels et puces | P0 |
| joystick | [src/input.js](C:/LaMineV2/la-mine-v2-v01/src/input.js) | Contrôle et disque de position tactile | Forme simple, haut dans les couches ; priorité à conserver | P0 — préserver |
| résultat / pause | [src/ui.js](C:/LaMineV2/la-mine-v2-v01/src/ui.js) | Victoire/défaite/pause, ressources, statistiques | Famille noire/verte, textes et cartes défilantes | P1 |
| choix normal / épique | [src/upgrade-overlay.js](C:/LaMineV2/la-mine-v2-v01/src/upgrade-overlay.js) | Cartes, portrait, relance et bord violet | Famille propre et chiffres réduits ; vocabulaire épique à industrialiser | P1 |
| home / nav / râtelier | [src/menu/main-menu.js](C:/LaMineV2/la-mine-v2-v01/src/menu/main-menu.js) | Structure accueil et destinations | Kit illustré ; plusieurs niveaux fixes | P1 |
| weaponSelector | [src/menu/weapon-selector.js](C:/LaMineV2/la-mine-v2-v01/src/menu/weapon-selector.js) | Trois cartes équipement | Nom 8–9 px et état 6–8 px | P0 |
| zones UI | [src/menu/zones.js](C:/LaMineV2/la-mine-v2-v01/src/menu/zones.js) | Échelle, profondeur, état et jouer | Puits cohérent ; grandes cartes défilantes | P1 |
| Atelier UI | [src/workshop.js](C:/LaMineV2/la-mine-v2-v01/src/workshop.js) | Quatre stations et achats | Cadres SVG du kit, bonne cible, texte plus petit | P1 |
| Talents UI | [src/menu/talents-view.js](C:/LaMineV2/la-mine-v2-v01/src/menu/talents-view.js) | Cartes avantages permanents | CSS arrondi plus générique que Atelier | P1 |
| Relève UI | [src/menu/relief-view.js](C:/LaMineV2/la-mine-v2-v01/src/menu/relief-view.js) | Horloge, stock, taux et collecte | Chrono hiérarchisé, nombreux petits textes | P1 |
| Caisse UI | [src/menu/crates-view.js](C:/LaMineV2/la-mine-v2-v01/src/menu/crates-view.js) | Coffre CSS, couvercle, glow, révélation | Famille différente ; bouton passer et reduced-motion à garder | P1 |
| Contrats UI | [src/menu/contracts-view.js](C:/LaMineV2/la-mine-v2-v01/src/menu/contracts-view.js) | Cartes, badges, barres et récompenses | Liste sobre, icône navigation empruntée à Talents | P1 |
| Classement UI | [src/leaderboard/view.js](C:/LaMineV2/la-mine-v2-v01/src/leaderboard/view.js) | Onglets, filtre, rang et ligne personnelle | Liste fonctionnelle ; état local/distant à conserver | P1 |
| styles transversaux | [style.css](C:/LaMineV2/la-mine-v2-v01/style.css) | Typographie, cards, résultat, portrait, choix | Styles de combat et responsive ; source visuelle sans image | P0 combat / P1 méta |
| styles menu | [src/menu/menu.css](C:/LaMineV2/la-mine-v2-v01/src/menu/menu.css) | Layout, nav, icônes et Talents | Styles ensuite surchargés par kit.css | P1 |
| styles kit | [src/menu/kit.css](C:/LaMineV2/la-mine-v2-v01/src/menu/kit.css) | Cadres et images du kit | Règles actives + quelques états dormants | P1 |
| styles Atelier | [src/menu/workshop.css](C:/LaMineV2/la-mine-v2-v01/src/menu/workshop.css) | Postes et boutons | Deux colonnes responsives | P1 |
| styles Relève | [src/menu/relief.css](C:/LaMineV2/la-mine-v2-v01/src/menu/relief.css) | Chrono et scène de galerie | Illustration secondaire masquée petit écran | P1 |
| styles Caisses | [src/menu/menu.css](C:/LaMineV2/la-mine-v2-v01/src/menu/menu.css) | Coffre et reveal | Animations CSS légères | P1 |
| styles Contrats | [src/menu/contracts.css](C:/LaMineV2/la-mine-v2-v01/src/menu/contracts.css) | Badges, cartes et progression | Famille sobre CSS | P1 |
| styles Classement | [src/leaderboard/view.css](C:/LaMineV2/la-mine-v2-v01/src/leaderboard/view.css) | Rangs et onglets | Petites métadonnées ; valeurs claires | P1 |

## 4. Archives, sources et éléments hors refonte

Les captures historiques et copies de sauvegarde ne sont pas des assets runtime à remplacer. Chaque fichier image hors src/assets (hors dépendances et nouvelles captures d'audit) est répertorié dans [archive-visual-files.json](audit-v032/archive-visual-files.json), avec état **archive conservée** et priorité **aucun remplacement**. Les documents catalog.html, manifest.json, README et prompts du kit servent de provenance ; leurs mentions historiques ne décrivent pas toujours le parcours actuel (ex. boutons autrefois désactivés). Ne pas réécrire ces historiques pour faire croire qu'ils ont été produits aujourd'hui.

Aucune police externe trouvée dans les sources : system-ui et polices de repli. Phaser est une dépendance de rendu, pas un asset DA. Debug et bancs de test sont hors UI joueur ; aucun travail esthétique dessus. Les originaux Ravens, snapshots et sources maîtresses restent conservés même si des exports plus légers sont produits plus tard.
