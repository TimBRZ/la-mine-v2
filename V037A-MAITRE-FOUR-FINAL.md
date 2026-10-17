# Maître de Four — V0.37A, master statique pour validation humaine

## Référence et périmètre

Référence exclusive : **Variante A — palette rouge forge**, image `Maître de Four — Concept Art de Boss Forge.png` fournie par l'humain. Le personnage principal de gauche est la base : vue trois quarts, petite tête, très larges épaules, poitrine-four, cheminée haute, poing lourd et outil industriel porté à droite de l'image.

L'image originale est conservée sans retouche dans `v037a-maitre-four-final/references/variante-A.png`. La galerie présente un recadrage CSS et permet d'ouvrir la planche complète. `source.json` contient son empreinte SHA-256 ainsi que celle du master.

Un seul dessin SVG statique. Aucun gameplay, hitbox, timing, déplacement, dégât, PV ou asset de production modifié. Pas d'intégration, animation, sprite sheet ou commit/push. Aucun travail sur Marteau-Pilon ou Chaudière.

## Gameplay inspecté — source de vérité

Fichiers lus : `src/forge/config.js`, `src/forge/actors.js`, `src/forge/combat.js`, `src/forge/art.js`.

Identifiant `furnace` : boss de 1 800 PV, rayon de collision 28, vitesse de base 92, dégâts de contact 1. Le générateur visuel actuel de Zone 6 utilise des textures de **84 × 84 pour les boss** et **48 × 48 pour les mobs**. Les cadres de comparaison reprennent ces dimensions, sans changer le runtime.

| Pattern réel | Préparation | Effet existant |
| --- | --- | --- |
| `plates` | 1,25 s | Deux plaques chauffées durant 2,4 s ; jusqu'à trois sous 50 % PV, selon les places disponibles |
| `jet` | 1,3 s | Cône orienté vers la position du joueur au début de la préparation, rayon 180, paramètre `spread: 0.6`, durée 0,55 s |
| `rivets` | 1,1 s | Trois projectiles, vitesse 165, angles symétriques espacés de 0,17 rad, portée 350 |

Cycle normal : `plates → jet → rivets`. Cycle sous 50 % : `plates → jet → rivets → jet`. Le boss se repositionne latéralement et vise une distance de 175 à 255 unités ; il ne poursuit pas le joueur en mêlée comme le Marteau-Pilon. Sa vitesse de repositionnement augmente de 12 % sous 50 % PV. Les compteurs de repos/récupération sont accélérés selon la santé et le contexte du triple ; les avertissements restent ceux des patterns.

Les plafonds de zones, de chaleur et d'attaques majeures peuvent retarder ou remplacer une attaque par la salve légère existante. Aucun de ces mécanismes n'est changé. Les hazards sont séparés du sprite et soumis au contrôle de sortie sûre. **Le cycle du Maître de Four ne contient pas de frappe de marteau.** L'outil porté n'autorise donc pas à inventer un slam ou de nouveaux dégâts.

## Identité et simplification

« Un opérateur massif dont le torse lui-même est une fournaise. »

Hiérarchie du dessin : **torse-four → silhouette rouge et épaules → cheminée → outil secondaire**. La posture et les masses de la variante A sont conservées avec des volumes plus simples. Les bottes larges et les bras lourds restent séparés du bassin. La tête compacte porte seulement deux yeux orange, sans lampe ajoutée.

Le torse est encadré de métal sombre et comporte trois grandes ouvertures chaudes séparées. Le jaune clair est réservé à leur cœur et à la cheminée. L'outil conserve trois fentes plus orangées et moins claires : il accompagne l'identité thermique, sans dominer le four central ni devenir un marteau géant.

Suppression des petits boulons, rayures, reflets multiples, découpes secondaires et tuyaux décoratifs. Deux attaches larges suffisent pour les sangles. Les bottes utilisent une semelle et une face principale. Un aplat éclairé par grande pièce, sans texture, gradient, filtre, halo ou image raster embarquée. Aucun ajout d'équipement.

Le SVG utilise un cadre carré 450 × 450, 15 groupes nommés et des contours principaux de 8 unités. Les contours secondaires sont limités à quelques séparations utiles. Le cadre de travail ne définit pas une hitbox ni une échelle de production.

## Palette rouge forge

| Couleur | Usage |
| --- | --- |
| `#101719` | Contours, visage et fond du foyer |
| `#393D3D` | Charbon, articulations et masses sombres |
| `#514E49` | Acier sombre |
| `#74736E` | Faces métalliques claires |
| `#D64428` | Armure rouge forge |
| `#F16B3A` | Face éclairée rouge-orange, chaleur secondaire |
| `#8A4E31` | Attaches et bottes brunes |
| `#A96038` | Aplats bruns éclairés |
| `#FFAD32` | Incandescence orange |
| `#FFE395` | Cœur clair contenu dans les ouvertures |

Dix couleurs, contours compris. Aucun cyan, vert ou aura orange.

## Différenciation et gabarit

- **Chauffeur :** capuche, bonbonne externe, silhouette étroite et diffuseur tenu devant. **Maître de Four :** épaules très larges, petite tête, cheminée et four dans le torse. La comparaison couleur/monochrome montre ces différences ; un rappel à 48/84 px restitue l'écart mob/boss.
- **Boss Zone 5 :** comparaison avec les masters Lampiste Major, Dynamiteur et Masse Noire en cadres égaux de 84 px. Le rouge et la poitrine-four remplacent la dominance jaune, la lampe, les explosifs ou la masse portée comme signes principaux.
- **Marteau-Pilon futur :** préserver la distinction en gardant l'outil thermique secondaire, sans longue hampe, énorme tête de marteau ni pose de frappe inventée. Son design et celui de Chaudière restent à valider séparément ; aucune différenciation définitive avec des masters futurs n'est prétendue ici.

## Découpe et animation future — recommandations seulement

**Parties stables :** torse, armure centrale, tête et bassin. **Parties mobiles futures :** épaules, bras/poing, module porté, jambes, cheminée et grille interne. Les groupes SVG facilitent le repérage mais ne constituent pas un rig ; les raccords occultés devront être complétés au moment d'une production animée autorisée.

| État futur | Intention compatible avec le jeu |
| --- | --- |
| Idle | Variation lente de l'aplat du foyer, très faible mouvement de cheminée |
| Move | Pas lourds et inertie brève des bras, sans déformer le torse |
| Prepare thermique | Appuis stables, épaules légèrement abaissées, foyer plus clair pendant le télégraphe existant |
| Jet | Brève impulsion du four ; le cône reste un hazard/VFX distinct et suit l'angle verrouillé |
| Plaques | Ancrage et montée de chaleur du torse ; aucun sol chaud peint dans le sprite |
| Salve | Contraction brève du bloc thermique accompagnant les trois projectiles existants, sans déplacer leur origine gameplay |
| Recovery | Diminution de l'incandescence, légère décompression visuelle |
| Hit | Réaction courte des masses principales |
| Death | Extinction du foyer et affaissement lourd |

Pas de frappe au marteau ajoutée. Flammes, fumée, cône, onde et sol chaud demeurent des effets séparés ; aucune frame ni aucun VFX n'est produit à cette étape.

## Livrables

Dossier `v037a-maitre-four-final/` :

- `master/maitre-four.svg` — master unique.
- `silhouettes/maitre-four.svg` — même géométrie en aplat ivoire.
- `gallery.html` — référence, master, réductions, comparaisons et notes.
- `mobile.html` — fiche compacte de contrôle.
- `comparaisons/reductions.svg` — couleur et silhouette, cadres 40 / 56 / 84 px.
- `comparaisons/chauffeur.html` — comparaison directe mob/boss.
- `comparaisons/gabarits.html` — mobs Zone 6 et boss Zone 5.
- `captures/mobile-320.jpg`, `captures/mobile-390.jpg` — viewports demandés ; captures de galerie et comparaisons dans le même dossier.
- `tests.txt`, `scope-validation.json`, `browser-validation.json` et empreintes — preuves de contrôle.

Galerie locale : `http://127.0.0.1:5206/gallery.html`. Serveur dédié en lecture seule, sans cache : `node v037a-maitre-four-final/server.mjs` depuis la racine du projet. Le serveur du jeu reste inchangé.

## Validation et limites

**1 059 / 1 059 tests existants réussis**, zéro échec, zéro ignoré. Contrôle d'empreintes de **3 938 fichiers existants** suivis : aucune modification ni suppression, sources et tests inclus.

Réductions 40, 56 et 84 px contrôlées. Galerie et fiche mobile vérifiées en **320 × 568** et **390 × 844** dans le navigateur local : images chargées, aucune erreur console, aucun débordement horizontal. Les comparaisons présentent des cadres réels CSS, pas des agrandissements étiquetés comme taille jeu.

À 40 px, priorité au torse incandescent, à la silhouette et aux épaules ; les attaches et le détail des doigts disparaissent volontairement. La silhouette monochrome ne montre pas les ouvertures internes du torse, uniquement le contour extérieur. Aucune validation physique Android ni test du nouveau dessin en combat n'est revendiqué : il n'est pas intégré. La fidélité artistique finale reste soumise à la validation humaine.

**Arrêt après livraison du master statique.** Aucun boss suivant commencé.
