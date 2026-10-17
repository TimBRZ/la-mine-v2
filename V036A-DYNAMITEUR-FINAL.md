# Dynamiteur — master statique, variante B

14 octobre 2026. **Master proposé pour validation humaine**, avant toute animation ou intégration.

## Référence et intention

Source unique : la planche humaine « Planche de référence du dynamiteur…png », dont le chemin exact est conservé dans `v036a-dynamiteur-final/source.json`. Copie byte pour byte dans `references/variante-B.png` ; recadrage de la grande vue gauche, sans retouche. Les annotations de la planche ne changent aucune règle du jeu.

Le master reprend un artificier minier humanoïde massif en trois quarts : casque ocre à lampe chaude, visage sombre, charges rouges dorsales, torse protégé, large ceinture et détonateur rectangulaire à poignée en T. Le cadre commun référence/master est `90 150 590 510`.

La distinction avec le Boutefeu repose sur la largeur du torse, la ceinture, la disposition du paquet dorsal et le boîtier à triangle ocre, plutôt que sur des détails décoratifs. Contrairement au Lampiste Major, aucun gros projecteur ni bloc dorsal de lampes n’est ajouté. Les trois dessins sont comparés dans la galerie, à cadres égaux, sans modifier leur taille en jeu.

## Simplification

Aplats francs, contours charbon, palette ocre/brun/acier avec rouge-orange réservé aux charges et à la poignée. Suppression des boulons répétés, rainures, micro-rayures et textures. Grandes sangles et boucles simples ; triangle plein sur le boîtier. Les protections ocres sous la ceinture séparent le torse des jambes.

Lumière contenue dans la lentille et les yeux, sans halo. Le master est entièrement vectoriel et transparent, sans image intégrée, filtre, dégradé ou animation. La silhouette reprend exactement le même tracé et les mêmes dimensions.

## Parties stables et mobiles futures

| Ensemble | Groupes SVG |
| --- | --- |
| Masses stables | `torse-ceinture`, `tete-casque`, `charges-dorsales` |
| Bras avant | `bras-avant` |
| Bras et main portant le détonateur | `bras-detonateur`, `main-detonateur` |
| Boîtier et liaison | `detonateur`, `cordon` |
| Appuis | `jambes-appuis`, `cuisses` |
| Lumière | `lampe` |

Pour la suite : mouvements courts du corps en idle, alternance des appuis pour une marche lourde, maintien du contact main/boîtier pendant la préparation et le déclenchement, recul bref pour hit, affaissement pour death. Le T est graphiquement distinct, mais son éventuel découpage animé reste à faire. Ces suggestions devront suivre les attaques et timings existants ; elles ne créent aucune nouvelle logique.

## Lecture et vérifications

- Couleur et silhouette vérifiées en **40 / 56 / 84 pixels CSS**. À 40 px, les charges rouges, le T et le triangle du boîtier restent les repères prioritaires ; doigts et boucles ne se lisent plus individuellement.
- Pages contrôlées en navigateur à **320 × 568** et **390 × 844** : images chargées, tailles vérifiées, pas de débordement horizontal ni erreur console. Ce n’est pas un test physique Android.
- **995 / 995 tests existants réussis**, aucun échec ni test ignoré ; sortie dans `tests.txt`.
- **5 380 fichiers préexistants contrôlés par SHA-256**, hors `.git` et `node_modules` : aucun modifié ou supprimé. Aucun ajout hors ce dossier et cette note. Rapports `scope-validation.json` et `browser-validation.json`.

## Livrables

Dans `v036a-dynamiteur-final/` : `master/dynamiteur.svg`, `silhouettes/dynamiteur.svg`, `gallery.html`, `comparaisons/planche.html`, `captures/planche-validation.jpg`, `mobile.html`, `captures/mobile-320.jpg` et `captures/mobile-390.jpg`.

Galerie locale : `http://127.0.0.1:5199/v036a-dynamiteur-final/gallery.html`. Serveur de revue en lecture seule : `node v036a-dynamiteur-final/server.mjs`.

**Aucun gameplay, comportement, hitbox ou asset de production modifié. Aucune intégration, sprite sheet ou animation. Aucun commit/push. Arrêt pour validation humaine.**
