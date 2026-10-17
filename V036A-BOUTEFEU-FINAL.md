# Boutefeu — master statique de la variante A

14 octobre 2026 — **master proposé pour validation humaine**, sans animation ni intégration.

## Intention

Petit mineur compact en trois quarts face, casque ocre, visage sombre à deux yeux chauds, charges rouges dans le dos et détonateur à poignée en T. La pose, les masses et leur placement reprennent la vue principale de la référence humaine : `C:/Users/Tim Pro/Downloads/Planche conceptuelle du Boutefeu.png`.

La source complète est copiée sans retouche dans `v036a-boutefeu-final/references/variante-A.png`. Le recadrage comparatif montre seulement la vue principale. Aucune nouvelle vue de profil n’a été dessinée. Le texte de la planche n’a pas servi à modifier le gameplay.

## Simplifications

- Gros contours sombres, aplats francs, transparence autour du personnage. Aucun fond illustré, halo, dégradé ou image raster dans le master.
- Deux grandes charges rouge/orange, deux sangles lisibles et une poignée de sac. Suppression des petites pièces, boulons, textures et rayures.
- Casque et lampe frontale séparés du visage. Lentille crème et deux yeux jaune chaud, sans lumière diffuse.
- Tablier brun, épaules simples, deux boucles sans détails intérieurs. Bottes larges et appui stable.
- Détonateur gris à poignée rouge en T, tige dégagée et cordon épais. Ni crosse, ni canon, ni arme à feu.

Le cadre du master et celui du recadrage de référence partagent `viewBox="75 225 690 650"`. Le dessin n’est pas recadré différemment en silhouette. La palette réutilise le charbon, l’ocre, la lumière chaude et le brun du langage visuel récent, avec du rouge/orange réservé aux explosifs et à la poignée.

## Parties stables et groupes futurs

| Ensemble | Usage futur envisagé |
| --- | --- |
| `corps-tenue` | Masse stable, tablier et bretelles |
| `sac-explosif` | Masse dorsale stable, légère oscillation possible |
| `tete`, `casque`, `lampe-frontale` | Ensemble de tête à déplacer solidairement ; lumière de préparation éventuelle contenue dans la lentille |
| `bras-gauche`, `bras-droit` | Mouvements courts, sans casser les contacts |
| `main-detonateur`, sous-groupe `detonateur` | Déplacement commun de la main et de l’outil ; poignée distincte |
| `cordon-detonateur` | Accompagner le déplacement de la main sans croiser le visage |
| `jambes` | Marche courte et appuis conservés |

Ces groupes sont une organisation du dessin, pas un rig ni une animation. Les masses principales restent stables ; aucune frame supplémentaire n’est créée.

## Lisibilité

Réductions couleur et silhouette dans des cadres de **40 × 40, 56 × 56 et 84 × 84 pixels CSS**. Ces dimensions de validation ne changent pas la taille d’affichage actuelle du jeu.

Les signes prioritaires sont la lampe haute, les charges rouges à gauche et le T du détonateur à droite. À 40 px, les mains, la tige et les boucles deviennent secondaires : ne pas les enrichir en micro-détails. La poignée reste isolée de la tête et les charges composent une masse dorsale distincte. La silhouette monochrome conserve les vides utiles autour du bras et du cordon.

Une comparaison avec le Lampiste et l’Éclateur bonbonne permet de juger la cohérence des aplats et des contours. Les copies de leurs masters sont identiques aux originaux. Le Boutefeu se différencie du Lampiste par le tablier brun, le paquet rouge et le petit outil vertical, plutôt qu’un gros projecteur horizontal.

## Livrables

- `v036a-boutefeu-final/master/boutefeu.svg`
- `v036a-boutefeu-final/silhouettes/boutefeu.svg`
- `v036a-boutefeu-final/gallery.html`
- `v036a-boutefeu-final/mobile.html`
- `v036a-boutefeu-final/comparaisons/reference-master.html`
- `v036a-boutefeu-final/captures/reference-master.jpg`
- `v036a-boutefeu-final/captures/mobile-320.jpg`
- `v036a-boutefeu-final/captures/mobile-390.jpg`

Galerie servie localement en lecture seule sur `http://127.0.0.1:5196/v036a-boutefeu-final/gallery.html` pendant que `node v036a-boutefeu-final/server.mjs` tourne. Les HTML restent consultables directement depuis le disque.

## Vérifications

- Suite existante conservée : **995 / 995 tests réussis**, aucun échec. Sortie dans `tests.txt`.
- Contrôle des empreintes SHA-256 de **5 314 fichiers préexistants** (hors `.git` et `node_modules`) : aucun changement ni suppression. Aucun ajout hors ce dossier et cette note. Rapport `scope-validation.json`.
- Vérification navigateur aux formats 320 × 568 et 390 × 844 : réductions aux dimensions demandées, images chargées, aucun débordement horizontal ni erreur console. Rapport `browser-validation.json`. Ce contrôle n’est pas un test sur téléphone physique.
- Aucun code, gameplay, comportement, hitbox, asset de production ou master antérieur modifié. Aucune sprite sheet, animation, intégration, aucun commit/push.

**Arrêt pour validation humaine du master.**
