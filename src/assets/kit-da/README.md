# La Mine V2 — Kit DA 01

Sprint de présentation sur V0.9.0, sans V0.10 fonctionnelle.

17 assets locaux : 16 SVG éditables et un héros WebP avec transparence. Environ 66 Kio au total, dont 41 Kio pour le héros. Aucun paquet ajouté au projet, aucune requête externe. La planche `catalog.html` est consultable sur le serveur local : `/src/assets/kit-da/catalog.html`.

| Assets | Utilisation |
| --- | --- |
| `miner.webp` | Héros de l’accueil, 400 × 600, pose de salut |
| `shotgun.svg`, `smg.svg` | Sélecteur et râtelier de l’arme équipée |
| `coal.svg`, `iron.svg`, `diamond.svg`, `token.svg` | Ressources de l’accueil et de l’Atelier |
| `carreau-depth.svg`, `podium.svg` | Décor en plans : cage, bâtiments, entrée éclairée, rails et wagonnet ; socle du héros. `carreau.svg` conservé comme version précédente. |
| `cta-sign.svg` | Panneau jaune du CTA et des achats |
| `nav-active.svg`, `nav-idle.svg` | Navigation et choix d’arme |
| `locked-sign.svg` | Talents, La Relève et Caisses, toujours désactivés |
| `galeries.svg`, `galeries-locked.svg` | Zone 1 et premier exemple verrouillé |
| `upgrade-panel.svg` | Quatre améliorations de l’Atelier et panneau de Zone 1 |

## Continuer ce style

- Fond anthracite `#172b39`, acier bleu `#71899a`, jaune `#f7c344`, cuivre `#b57242`, lumière crème `#ffe9a1`.
- Lumière en haut à gauche, dessous foncé, silhouettes larges, angles coupés et petits rivets. Limiter les détails aux éléments lisibles à 320 px.
- Le héros est le point focal. Les bâtiments restent plus sombres et moins contrastés. Les armes associent acier, poignée cuivre et petite pièce jaune.
- SVG sans filtre, script, police intégrée ou animation. Garder les labels en HTML pour la lisibilité et l’accessibilité. Les panneaux extensibles ont `preserveAspectRatio="none"`; les objets gardent leurs proportions.
- Ajouter les nouveaux assets au manifeste, conserver le budget de test de 100 Kio ou justifier une évolution. Ne pas injecter de logique de jeu dans les illustrations.
- Présentation centralisée dans `src/menu/kit.js` et `kit.css`. Les anciennes illustrations vectorielles et leurs tests restent conservés.

## Provenance du héros

Création avec l’outil intégré image_gen, sans CLI ni clé API. Les prompts finaux sont conservés dans `prompts.json`. Export WebP compact avec canal alpha, sans dépendance de conversion à l’exécution. Les SVG sont dessinés directement dans le projet.

## Limites assumées

Le héros est une image statique : il ne tient pas l’arme, affichée sur le râtelier. Le combat garde ses sprites précédents. Les zones 3 à 5, les petits pictogrammes de navigation et ceux de l’Atelier réutilisent les visuels V0.9. La cohérence est renforcée, mais ces éléments restent plus simples que le héros ; ce kit constitue une première base, pas une DA finale complète.
