# Marteau-Pilon — V0.37A, master statique à valider

## Référence et périmètre

Base humaine exclusive : **Version B — rouge Zone 6**, `Planche conceptuelle du Marteau Pilon.png`. Le grand personnage de gauche est repris dans sa pose trois quarts : corps trapu, tête basse, épaules rouges, poing libre à gauche de l'image, colonne hydraulique verticale fixée au bras à droite, masse rectangulaire posée au sol.

L'original est copié sans retouche dans `v037a-marteau-pilon-final/references/variante-B.png`. La galerie montre un recadrage CSS et la planche complète. `source.json` enregistre les empreintes de la référence et du master.

Le dessin est construit à partir des positions de la référence : casque, épaules, bassin, genoux, pieds, fixation, hauteur du pilon et masse inférieure. Il ne constitue pas une nouvelle variante. Les différences recherchées concernent uniquement la simplification des aplats, l'homogénéisation des contours et la suppression des micro-détails ; la fidélité finale reste à valider humainement.

Aucun code ou asset de production modifié. Aucun changement gameplay, hitbox, timing, dégâts, PV ou échelle runtime. Pas d'animation, sprite sheet, intégration, commit ou push. Chaudière non commencée.

## Gameplay réellement inspecté

Sources : `src/forge/config.js`, `actors.js`, `combat.js`, `geometry.js`, `art.js`.

Identifiant `hammer`, boss de **2 160 PV**, rayon **30**, vitesse de base **98**, dégâts de contact **1**. Le rendu procédural actuel des boss de Zone 6 utilise un cadre **84 × 84**. Le master reste hors runtime.

| Pattern | Préparation | Comportement existant |
| --- | --- | --- |
| `slam` | 1,4 s | Impact proche du boss, rayon initial 86 pendant les premières 0,25 s actives, puis zone chaude de rayon 34 ; durée active totale 2,3 s |
| `doubleSlam` | 1,4 s puis décalage de 0,85 s | Deux impacts placés autour de la position observée du joueur, bornés à l'arène ; rayon 68, durée 0,3 s chacun |
| `ring` | 1,35 s | Sept projectiles à vitesse 104, angles espacés de π/4 avec un secteur absent |
| `ram` | 1,6 s | Ruée de 0,85 s à vitesse 300, direction verrouillée au départ de la préparation, arrêt possible aux bords |

Cycle normal : `slam → doubleSlam → ring → ram`. Sous 50 % PV : `ram → doubleSlam → ring → slam`. Le repositionnement est orienté mêlée avec composante latérale ; vitesse majorée de 12 % sous la moitié des PV.

Les compteurs de récupération sont réglés à 0,9 après les attaques ordinaires et 1,5 après la ruée, mais progressent selon les multiplicateurs de repos du boss et du triple. Ce ne sont donc pas des durées murales fixes. Le mouvement reprend après une partie de la récupération. Une future pose de récupération devra rendre cet état lisible **sans inventer de multiplicateur de dégâts ni nouvelle vulnérabilité**.

Le système limite les attaques majeures concurrentes et vérifie les sorties sûres. Si une attaque majeure ne peut pas être réservée, le Marteau-Pilon peut utiliser le pattern léger `tap` existant. Tous les plafonds, rayons, positions, collisions et délais sont conservés. Le pilon est ici une représentation visuelle, pas une nouvelle forme de collision.

## Construction du master

Cadre SVG **570 × 490**, `viewBox="110 150 570 490"`, conservant un repère de dessin proche du recadrage source. Le contenu est ensuite réduit dans les cadres carrés demandés sans étirement.

Le pilon est le signe dominant : montant vertical sombre, carter supérieur rouge, cylindre métallique, chemise à bandes rouges/noires, collier inférieur, piston et grosse masse rectangulaire au sol. Le tuyau principal rejoint le haut du montant ; l'articulation circulaire garde le lien au bras. Il n'y a ni hampe manuelle, ni deuxième arme, ni transformation en foreuse ou canon.

Le personnage conserve son casque rouge avec lampe frontale, deux yeux orange, visage sombre, épaules et avant-bras lourds, torse sobre à traverses rouges, jambes épaisses et pieds industriels larges. Aucun foyer incandescent ajouté au torse.

Simplifications : suppression des petits boulons, rayures, ébréchures, facettes secondaires et reflets multiples. Les articulations principales, bandes de sécurité et divisions des appuis restent présentes. Le tuyau ne garde que quelques séparations larges ; le piston utilise deux aplats acier. Pas de texture, gradient, filtre, bitmap embarqué ou halo.

## Palette Zone 6

Neuf couleurs, contours compris :

| Couleur | Usage |
| --- | --- |
| `#101719` | Contours et visage |
| `#393D3D` | Charbon, torse et structure |
| `#514E49` | Acier sombre |
| `#74736E` | Faces acier |
| `#C6BCAD` | Piston et arêtes métalliques claires |
| `#D64428` | Rouge principal |
| `#F16B3A` | Aplats rouges éclairés |
| `#FFAD32` | Yeux, lampe et petit accent supérieur |
| `#FFE395` | Centre contenu de la lampe |

Pas de cyan ni de jaune dominant. Les points lumineux restent à l'intérieur des formes.

## Parties séparables et mécanique du pilon

Le master comporte **20 groupes nommés**. Masses stables : torse, tête/casque, bassin, volumes des jambes et structure du pilon. Parties mobiles futures : bras, articulation de fixation, piston, masse inférieure, conduite principale et jambes pendant le déplacement.

Groupes principaux du pilon : `structure-pilon`, `cylindre-superieur`, `carter-superieur`, `carter-raye`, `articulation-bras`, `collier-inferieur`, `piston-mobile`, `masse-mobile`, `tuyau-principal`.

Le piston inférieur et la masse partagent le même axe vertical. Pour une animation autorisée ultérieurement, leur déplacement devra être couplé ; les carters et colliers serviront de pièces fixes avec occultation de la tige. La masse ne doit pas pivoter comme un marteau manuel. Les groupes sont des repères de découpe, **pas un rig animé** : il faudra compléter les surfaces actuellement cachées et les masques de coulissement, sans déplacer l'origine gameplay des attaques.

## Recommandations d'animation — aucune frame créée

- **Idle :** vibration mécanique minimale, piston stable.
- **Move :** pas lourds ; colonne maintenue verticale, inertie faible.
- **Prepare :** ancrage, remontée de la masse avec la tige, compression du corps pendant l'avertissement déjà présent.
- **Slam :** descente verticale rapide à l'instant de l'impact existant, sans modifier la zone de dégâts.
- **Double impact :** deux impulsions visuelles calées sur le décalage réel de 0,85 s. Ne pas remplacer les zones gameplay par la position du pied du pilon.
- **Ring :** impulsion mécanique courte accompagnant l'émission existante ; projectiles et onde éventuelle séparés du sprite.
- **Ram :** corps penché et appuis rapides, pilon porté avec la masse dégagée du sol ; trajectoire verrouillée conservée.
- **Impact / recovery :** courte compression, vibration, remontée du piston et redressement lisibles dans les durées existantes.
- **Hit :** réaction brève, sans déplacement artificiel de collision.
- **Death :** perte de pression visuelle, pilon restant au sol, affaissement du corps.

Poussière, onde de choc, chaleur au sol et projectiles demeurent des effets/hazards séparés. Aucun de ces éléments n'est dessiné en permanence dans le master.

## Différenciation

**Masse Noire :** marteau manuel à longue hampe traversant le corps, tenu à deux mains. **Marteau-Pilon :** colonne hydraulique dressée au-dessus du casque, fixation latérale, masse au sol, un poing libre. La comparaison monochrome permet de lire cette architecture sans s'appuyer sur la couleur.

**Maître de Four :** foyer lumineux central et cheminée. **Marteau-Pilon :** torse sobre, hauteur concentrée dans le pilon, identité mécanique d'impact. Les deux restent rouges et cohérents avec Zone 6.

Les comparaisons utilisent les masters existants copiés à l'identique et des cadres de présentation égaux de 84 px ; aucun précédent master n'est retouché.

## Livrables

Dossier `v037a-marteau-pilon-final/` :

- `master/marteau-pilon.svg` — master unique.
- `silhouettes/marteau-pilon.svg` — même géométrie en aplat clair.
- `gallery.html` — référence/master, silhouettes, tailles et comparaisons.
- `mobile.html` — fiche compacte.
- `comparaisons/reductions.svg` — cadres réels 40 / 56 / 84 px, couleur et silhouette.
- `comparaisons/masse-noire.html`, `comparaisons/maitre-four.html`.
- `captures/mobile-320.jpg`, `captures/mobile-390.jpg`, captures des comparaisons et de la galerie.
- `source.json`, `before-hashes.json`, `scope-validation.json`, `browser-validation.json`, `tests.txt` — preuves.

Galerie locale : `http://127.0.0.1:5207/gallery.html`. Serveur dédié en lecture seule : `node v037a-marteau-pilon-final/server.mjs` depuis la racine. Le serveur et les assets du jeu restent inchangés.

## Contrôles et limites

**1 059 / 1 059 tests existants réussis**, aucun échec, aucun test ignoré. Empreintes de **3 969 fichiers existants** suivis : aucune modification ni suppression (sources, tests, fichiers racine et masters précédents inclus).

Contrôles navigateur en **320 × 568** et **390 × 844** : galerie, fiche compacte, images et console. Réductions contrôlées en **40 / 56 / 84 px**. Aucune image cassée, aucun débordement horizontal, aucune erreur console sur les pages finales.

À 40 px, la colonne, le contraste acier/rouge et la masse au sol dominent ; les yeux et traverses sont de petits accents. La silhouette conserve le contour et les espaces entre corps et machine, pas les éléments internes du piston. Aucune validation Android physique ni en combat du nouveau dessin n'est revendiquée : il n'est pas intégré.

Arrêt pour validation humaine de la fidélité au choix B. Aucune sprite sheet, intégration ou suite sur Chaudière.
