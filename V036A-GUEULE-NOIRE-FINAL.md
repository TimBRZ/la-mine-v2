# Gueule Noire — master statique, variante B

14 octobre 2026. **Master proposé pour validation humaine**, avant animation et intégration.

## Référence et intention

Source unique : `C:/Users/Tim Pro/Downloads/Planche conceptuelle « Gueule Noire ».png`, variante B. La galerie conserve l’image complète à l’identique et montre un recadrage du panneau de référence gauche. Aucun élément d’une autre variante n’a été utilisé.

Le master conserve la posture basse de trois quarts, le dos bombé équipé d’un conduit, les épaules lourdes, la jambe repliée, les bras d’appui et la tête inclinée vers l’avant. La menace se lit dans le visage sombre et la mâchoire métallique, sans nouvel outil ni effet lumineux diffus. Le gabarit est large et ramassé, distinct des postures plus verticales du Lampiste et du Boutefeu.

## Simplifications réalisées

- Aplats francs, contours charbon, une face principale et une facette utile par volume.
- Un conduit dorsal simplifié, sans accumulation de petits raccords.
- Quatre grands blocs de mâchoire, regroupés dans un élément SVG nommé. L’acier de la mâchoire est plus clair pour se détacher du visage ; les séparations internes sont moins épaisses que le contour extérieur.
- Trois doigts épais par main, sans petits boulons ni articulations décoratives.
- Suppression des stries, micro-rayures, petits reflets et variations de matière.
- Ocre limité au front, à l’épaule et aux bracelets ; yeux jaune chaud sans halo. Aucun outil ou équipement nouveau ajouté.

Le SVG contient uniquement du dessin vectoriel transparent. Ni image incorporée, ni filtre, ni dégradé, ni animation. Le recadrage de référence et le master partagent le cadre `80 235 610 430`, pour comparer la pose et les masses sans changer la vue. La silhouette utilise exactement le même tracé, en crème uniforme sur le fond sombre de la galerie ; les vides utiles entre les membres sont conservés.

Palette : charbon `#0C1619`, gris sombre `#293337` / `#42494C`, acier `#62696A` / `#9DA6A3`, face claire de mâchoire `#C4C9BE`, brun `#655044` / `#866348`, ocre `#D89D2D` / `#F3BD41`, yeux chauds `#FFE092`. La silhouette est en `#F0ECDF`.

## Parties stables et mobiles futures

| Groupe SVG | Rôle et préparation future |
| --- | --- |
| `corps-central` | Masse stable du dos et du torse |
| `conduit-dorsal` | Accessoire solidaire du dos, faible oscillation éventuelle |
| `tete-masse` | Masse stable du visage et du front, déplacement d’ensemble possible |
| `attache-tete`, `epaule-proche` | Articulations simples pour accompagner le mouvement |
| `machoire-mobile` | Quatre blocs solidaires ; ouverture / fermeture courte à prévoir |
| `bras-proche`, `bras-lointain` | Deux chaînes d’appui visuellement séparées |
| `main-proche`, `main-lointaine` | Appuis larges, maintien du contact au sol |
| `jambe-repliee` | Réserve de mouvement pour déplacement et impulsion |

La base générale est définie par les deux mains au sol et le membre replié. Elle n’est pas un nouvel équipement. Les groupes constituent un découpage graphique, pas un rig fonctionnel.

Après validation seulement : idle léger par compression du corps, déplacement par alternance des appuis, attaque par mouvement du corps et de la mâchoire, hit par recul court, mort par affaissement. Aucune de ces propositions ne définit de nouvelle attaque ou de nouveau timing ; elles devront suivre le gameplay existant. Aucune frame supplémentaire n’est créée ici.

## Lisibilité mobile

La galerie affiche couleur et silhouette dans des cadres de **40 × 40, 56 × 56 et 84 × 84 pixels CSS réels**. Ces tailles de contrôle ne modifient ni le gabarit du jeu ni la hitbox. Le dessin conserve ses proportions dans les cadres carrés.

À 40 px, les critères principaux sont la posture basse, le dos bombé, la séparation des membres, les yeux et la bande dentée claire de la bouche. Les facettes individuelles, doigts et raccords deviennent secondaires. À 56 et 84 px, les blocs de mâchoire et les appuis se distinguent davantage. La petite taille ne justifie pas l’ajout de détails.

Contrôles en navigateur redimensionné à **320 × 568** et **390 × 844** : dimensions des images vérifiées, toutes chargées, pas de débordement horizontal, aucune erreur console sur les pages finales. Il ne s’agit pas d’un test sur téléphone Android physique.

Journal de diagnostic : une erreur sans URL source (`Cannot use 'in' operator to search for 'animation' in undefined`) a été observée dans l’onglet ayant servi à inspecter directement le SVG. Elle n’a été reproduite sur aucune des trois pages HTML finales dans un nouvel onglet. Ces pages ne contiennent aucun script. Le journal initial et les contrôles finaux sont tous conservés dans `browser-validation.json` ; l’origine précise de ce message isolé n’a pas été établie.

## Livrables

- `v036a-gueule-noire-final/master/gueule-noire.svg`
- `v036a-gueule-noire-final/silhouettes/gueule-noire.svg`
- `v036a-gueule-noire-final/gallery.html`
- `v036a-gueule-noire-final/mobile.html`
- `v036a-gueule-noire-final/comparaisons/reference-master.html`
- `v036a-gueule-noire-final/captures/reference-master.jpg`
- `v036a-gueule-noire-final/captures/mobile-320.jpg`
- `v036a-gueule-noire-final/captures/mobile-390.jpg`
- `v036a-gueule-noire-final/browser-validation.json` et `scope-validation.json`

Galerie locale : `http://127.0.0.1:5197/v036a-gueule-noire-final/gallery.html`, tant que le serveur de revue est actif. Commande : `node v036a-gueule-noire-final/server.mjs`. Ce serveur est limité à la boucle locale et sert seulement les documents de validation. Les fichiers HTML peuvent aussi s’ouvrir depuis le disque.

## Tests et périmètre

- **995 / 995 tests existants réussis**, aucun échec, aucun ignoré. Sortie intégrale dans `tests.txt`.
- **5 336 fichiers préexistants contrôlés par SHA-256**, hors `.git` et `node_modules` : aucun modifié ou supprimé. Aucun nouveau fichier en dehors du dossier de livraison et de cette note.
- Référence humaine copiée à l’identique ; copies des masters Lampiste et Boutefeu inchangées.
- **Aucun gameplay modifié, aucune hitbox modifiée, aucun asset de production remplacé.** Aucune intégration, sprite sheet ou animation. **Aucun commit/push.**

**Arrêt pour validation humaine du master statique.**
