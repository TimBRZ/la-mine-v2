# Lampiste Major — master statique de la variante B

14 octobre 2026. **Livraison pour validation humaine**, avant sprite sheet et intégration.

## Référence et intention

Référence unique : `C:/Users/Tim Pro/Downloads/Fiche conceptuelle du Lampiste-Major.png`. La grande vue de trois quarts, à gauche de la fiche, sert de base. Les petites vues face/profil/dos ne sont pas transformées en nouvelles poses.

Le master conserve la silhouette, la pose écartée, le gabarit massif et le placement des équipements : grande lampe de casque, visage sombre, bloc dorsal éclairé, épaules renforcées, tablier brun à pics croisés, sacoche latérale, grosses bottes et projecteur portatif. L’identité de supérieur hiérarchique repose sur ces masses et l’insigne déjà présent ; aucun nouvel accessoire n’est inventé.

L’image source complète est conservée sans retouche. Le recadrage de référence et le master partagent le cadre `80 84 700 706`. La planche montre la référence à gauche, le master à droite, les réductions et une silhouette claire en bas, sur fond sombre uni.

## Nettoyage et palette

Le dessin utilise des aplats, des contours charbon épais et des facettes simples. Les micro-rayures, boulons répétés, usure et reflets peints sont retirés. Les conduits qui contribuent à la silhouette sont conservés, avec peu de raccords. L’insigne est réduit à quelques formes de pics croisés. Les yeux sont légèrement dégagés sous le bord du casque pour rester entièrement visibles.

Les lumières sont contenues dans leurs lentilles ; aucun halo, filtre, dégradé, texture réaliste ou décor n’est créé. Le master est un SVG vectoriel transparent de 10,3 ko environ, organisé en groupes nommés, avec 10 couleurs.

Palette : contour `#0C1619`, charbon `#29373C`, acier `#596568` / `#AAB8B5`, brun `#655044` / `#866348`, ocre `#D89D2D` / `#F3BD41`, lumière chaude `#FFE092` / `#F0ECDF`. Elle reprend le langage des masters récents.

## Parties stables et mobiles futures

| Groupe | Rôle |
| --- | --- |
| `bloc-dorsal` | Masse stable du sac, boîtiers lumineux et conduits |
| `torse-stable`, `insigne-minier` | Masse principale du torse et signe hiérarchique |
| `tete-stable`, `casque-stable` | Tête et casque à déplacer ensemble |
| `lampe-frontale` | Lentille séparée, variation contenue de lumière possible |
| `bras-proche`, `main-proche` | Bras avant et contact sur la poignée du projecteur |
| `bras-lointain` | Bras arrière et main de soutien, partiellement occultée par le projecteur |
| `projecteur` | Équipement tenu, à déplacer en conservant les contacts des deux mains |
| `jambes` | Appuis et marche future |
| `sacoche` | Accessoire secondaire solidaire de la hanche |

Ce découpage prépare la suite ; il n’est pas un rig fonctionnel. Aucune pose supplémentaire, animation ou frame n’est créée. Toute animation future devra suivre le comportement existant, sans inventer de nouvelle attaque.

## Lecture mobile

Couleur et silhouette vérifiées dans des cadres de **40 × 40, 56 × 56 et 84 × 84 pixels CSS**, sans agrandissement artificiel. À 40 px, les grosses lampes, le bloc dorsal et les épaules restent les repères principaux. L’insigne, les boucles et les doigts ne se lisent plus individuellement ; ils restent secondaires. À 56 et 84 px, davantage de séparations sont visibles.

Les comparaisons avec Lampiste et Boutefeu utilisent des cadres égaux pour comparer la DA. Elles ne proposent pas de nouvelle taille de boss en jeu. Aucun gabarit ni hitbox n’est modifié.

Captures de navigateur aux formats **320 × 568** et **390 × 844** : images chargées, dimensions contrôlées et absence de débordement horizontal. Aucun test physique Android n’est revendiqué.

## Fichiers

- `v036a-lampiste-major-final/master/lampiste-major.svg`
- `v036a-lampiste-major-final/silhouettes/lampiste-major.svg`
- `v036a-lampiste-major-final/comparaisons/planche.html`
- `v036a-lampiste-major-final/captures/planche-validation.jpg`
- `v036a-lampiste-major-final/gallery.html`
- `v036a-lampiste-major-final/mobile.html`
- `v036a-lampiste-major-final/captures/mobile-320.jpg`
- `v036a-lampiste-major-final/captures/mobile-390.jpg`

Galerie locale : `http://127.0.0.1:5198/v036a-lampiste-major-final/gallery.html`, pendant que `node v036a-lampiste-major-final/server.mjs` tourne. Serveur de revue en lecture seule sur la boucle locale ; aucune route du jeu modifiée.

## Vérifications et arrêt

- **995 / 995 tests existants réussis**, aucun échec ou test ignoré ; sortie intégrale `tests.txt`.
- **5 358 fichiers préexistants vérifiés par SHA-256**, hors `.git` et `node_modules` : aucun modifié ou supprimé. Aucun ajout en dehors du dossier de livraison et de cette note. Rapport `scope-validation.json`.
- Référence humaine et copies des masters de comparaison inchangées.
- Pages finales sans erreur console ; contrôle détaillé dans `browser-validation.json`.
- Aucun gameplay, comportement, hitbox ou asset de production modifié. Aucune intégration, sprite sheet ou animation. Aucun commit/push.

**Arrêt pour validation humaine du master statique.**
