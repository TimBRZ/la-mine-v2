# Grisou X — patch Orbe comprimée

## Périmètre livré

Référence absolue : `Planche concept du projectile Grisou X.png`, conservée dans `production-v038b3-grisoux-orb/assets/reference.png`.

Seul le projectile principal change : noyau circulaire blanc ivoire, bord jaune pâle, enveloppe turquoise, anneau cyan/blanc discontinu et courte queue électrique. Aplats SVG, aucun filtre, halo, fumée ou trace persistante. Le noyau et le diamètre restent fixes ; les interruptions de l'anneau et les deux petits éclats varient. Pas de cristal, de diamant ou de beam.

Flash, Impact, Conduit, Arc et Surcharge : mêmes sheets, mêmes clips, mêmes plafonds et même code d'effets, vérifiés par SHA256. Aucun VFX Condensateur ou Bobine ajouté. Fusil, Mitraillette, gameplay, perks, sauvegarde, hitboxes, collisions, portée, cadence et dégâts inchangés. Aucun critique ou impact décor.

## Asset et intégration

| Élément | Valeur |
|---|---|
| Sheet | `src/assets/grisoux-v038b3/orb-v1.svg` |
| Clé runtime | `grisoux-v038b3-orb` |
| Frames | 4, boucle 90 ms, soit 22,5 ms par frame |
| Dimensions sheet | 128 × 20 pixels |
| Cellule | 32 × 20 pixels |
| Taille affichée | 18 × 11,25 unités dans l'arène logique 450 × 800 |
| Diamètre extérieur de l'orbe | 9 unités de jeu |
| Poids SVG | 3 085 octets |
| Texture RGBA8 additionnelle | 10 240 octets, soit 10 Kio, hors surcoût moteur/driver |
| Total textures Grisou X avec ancien bolt en secours | 194 560 octets, soit 190 Kio |

Les cadres 40/56/84 px de la galerie sont des inspections agrandies du dessin, pas la taille affichée des tirs en combat. La résolution SVG est rasterisée une fois au chargement ; aucune génération d'image par tir.

Le centre du noyau est le socket `(20,10)` de chaque cellule, donc l'origine du sprite est `(0,625 ; 0,5)`. Le noyau, et non le milieu de la queue, est placé sur la position visuelle calculée par `hero-muzzle.js`. Ce fichier reste strictement inchangé. Rotation, miroir, recul et pont visuel vers la trajectoire physique restent les mêmes.

La seule modification dans `room-scene.js` consiste à respecter `stableShape` pour supprimer l'ancien étirement horizontal ×1,15 des tirs perçants sur cette orbe. Le bolt de secours et les projectiles des autres armes gardent leur affichage antérieur. Conduit ne déforme pas l'orbe.

## Perks et lisibilité

- Base : trois projectiles.
- Condensateur : quatre puis cinq projectiles ; aucune nouvelle lumière sur l'arme.
- Double Canon : dix projectiles dans le build vérifié. Les deux salves possèdent des trajectoires superposées dans le gameplay actuel. Dix projectiles actifs ne signifient donc pas dix noyaux distincts à chaque instant. Aucune fausse séparation graphique n'est ajoutée.
- Tous les tirs partagent la bouche à la naissance puis s'écartent suivant leurs angles existants. Un chevauchement bref à la sortie est normal.
- Conduit : l'orbe traverse et continue sans changer de diamètre. L'impact et le conduit existants s'affichent selon les événements réels.
- Arc : même liaison fine entre les deux cibles de l'événement ; aucun arc inventé.
- Surcharge : même nova sur un kill direct avec projectile continuant. Aucun dégât de zone ajouté.
- Bobine : cadence existante inchangée, même animation du projectile.

Les captures montrent les salves en vol et les télégraphes ennemis. La réduction garde le noyau clair, une enveloppe compacte et une queue courte. Aucun écran de cyan permanent. Les effets ennemis restent ceux de production.

## Sélection, secours et cache

Ordre strict : nouvelle orbe valide → ancien bolt énergétique valide → ancien atlas énergétique → fallback procédural énergétique existant. Ni Fusil, ni Mitraillette, ni texture d'une autre entité.

Le bolt ne peut être sélectionné lorsque la frame de l'orbe demandée est valide. Les dimensions, découpes et présence des frames sont contrôlées. Une texture manquante, de mauvaise taille ou une frame absente/invalide permet le secours. Rechargement : retour à l'orbe dès que son asset redevient disponible.

La clé et l'URL sont différentes de l'ancien bolt. Le serveur du jeu conserve son `Cache-Control: no-store`, sans modification de configuration. Les vérifications navigateur incluent une session neuve, reload, retrait de la texture d'orbe seule, puis retrait des frames seules : le flash reste sur sa sheet validée pendant ces tests. Aucun stockage utilisateur modifié.

## Vérifications

**1 347 / 1 347 tests réussis**, zéro échec/skip ; baseline 1 333 conservée, 14 tests nouveaux. Journal : `production-v038b3-grisoux-orb/notes/tests.txt`.

Les tests historiques de V0.38B.3 sont adaptés uniquement à l'ajout d'une septième ressource chargée (le secours bolt), au chemin du nouveau master et à la liste autorisée des fichiers. Leurs assertions de gameplay, simulation, caps, cleanup et effets restent présentes. Les tests de fallback historique vérifient toujours le troisième niveau quand les deux premières ressources sont absentes.

Nouveaux tests : verrouillage des octets de tous les autres fichiers, limitation exacte du diff de scène, autres specs inchangées, noyau stable, boucle, clé/URL, priorité absolue à l'orbe, textures/frames défectueuses, absence de fallback étranger, origine du noyau dans huit directions avec recul/miroir et 3/5/10 tirs, continuité de pénétration et réutilisation des états.

Navigateur :

- Viewports confirmés par `innerWidth/innerHeight` : **320×568 et 390×844**.
- **48 départs** réels : 8 directions × 3 salves × 2 formats ; écart maximal avec le muzzle **0**.
- **19 builds par format**, avec Conduit aux trois niveaux, Condensateur, Arc, Surcharge, Bobine et combinaisons.
- **68 scènes par format**, dont zones 1, 4, 6, boss et triples, jusqu'à 360 ticks par scène. Fixtures avec classes Run et RoomScene de production ; ce ne sont pas des runs complètes de vingt vagues.
- Captures de 3, 5 et 10 projectiles actifs et des procs Conduit / Arc / Surcharge.
- Fallback texture absente, frame absente, recharge et nettoyage : 0 clip actif après clear, pool de 48 conservé.
- Aucun warning/erreur console sur le banc contrôlé.

## Performance et limites de mesure

Mesures de dix secondes dans le navigateur PC, scène dense Zone 6. Elles ne constituent pas une mesure sur Android physique.

| Cas | FPS | Frame p95 | CPU update p95 | Pic projectiles | Pic sprites effets |
|---|---:|---:|---:|---:|---:|
| Orbe, base 3, 320 | 23,68 | 42,76 ms | 3,9 ms | 3 | 6 |
| Orbe, Condensateur 5, 320 | 23,68 | 42,78 ms | 3,7 ms | 5 | 7 |
| Orbe, avancé + Double Canon, 320 | 23,42 | 42,78 ms | 4,4 ms | 20 | 11 |
| Ancien bolt, même build/scène, 320 | 23,04 | 46,99 ms | 4,5 ms | 20 | 11 |
| Orbe, avancé + Double Canon, 390 | 23,41 | 42,78 ms | 4,5 ms | 20 | 11 |

Deux salves peuvent coexister avec la cadence avancée, d'où vingt projectiles actifs au pic. La matrice complète atteint **28 éléments simultanés** (projectiles + sprites d'effets + flash). Les maxima séparés ne sont pas additionnés artificiellement.

Ce contexte navigateur tourne autour de 23 FPS avec les deux rendus. Aucun ralentissement mesuré lié à l'orbe ; cela ne prouve pas une fluidité à 60 FPS ni les performances d'un téléphone. La validation Android demeure nécessaire.

Les identités des 48 sprites d'effets sont stables, et les vues de projectiles déjà préallouées sont réutilisées. Aucun sprite, timer, tableau ou état nouveau par projectile dans le chemin modifié. Le nouveau coût permanent est une texture de 10 Kio. Les tests historiques stressent le pool sur 2 000 ticks.

Heap mesuré : base 320, 69,8→73,4 Mo ; cinq tirs, 69,0→66,0 Mo ; dix tirs avancés, 69,8→68,2 Mo ; 390 avancé, 63,4→74,3 Mo. Ces valeurs incluent Phaser, les fixtures et les journaux d'événements du banc ; leur variation dépend du GC. Elles ne mesurent pas isolément les allocations VFX et ne permettent pas de conclure à l'absence de fuite mémoire. Les fichiers JSON bruts conservent les mesures exactes.

## Fichiers et livrables

Production :

- `src/grisoux-vfx.js` : nouvelle spec, chargement/enregistrement et secours énergétique.
- `src/room-scene.js` : respect du flag visuel `stableShape` uniquement.
- `src/assets/grisoux-v038b3/orb-v1.svg` : nouvelle sheet.

Validation : `production-v038b3-grisoux-orb/gallery.html`, `observe.html`, captures, masters, référence et preuves JSON dans `notes/`. `build-assets.mjs` reconstruit uniquement cette orbe. Le banc `before.html` utilise une copie isolée de l'ancien sélecteur et de la scène antérieure, pour comparaison seulement, jamais chargée par le jeu.

Tests : `tests/grisoux-orb.test.js`, adaptation de `tests/grisoux-vfx-v038b3.test.js` et ajout du seul nouvel asset à `tests/v038b3-authorized-files.js`.

## Android physique — à valider humainement

1. Recharger l'adresse habituelle du jeu, puis démarrer Grisou X : noyau rond avec anneau, pas de diamant en fonctionnement normal.
2. Tester haut/bas/diagonales et vérifier le départ à la bouche de l'arme.
3. Vérifier les salves 3/5/10 et le confort visuel avec Bobine, Conduit, Arc et Surcharge.
4. Vérifier que les télégraphes restent prioritaires pendant un triple boss Zone 6 et que la fluidité est acceptable sur le téléphone réel.

Aucun commit/push. Arrêt après ce patch ; aucun autre chantier lancé.
