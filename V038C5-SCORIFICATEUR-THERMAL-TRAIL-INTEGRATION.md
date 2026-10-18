# V0.38C.5 — Scorificateur : trace thermique intégrée

Livraison du 18 octobre 2026. Variante A uniquement. Rendu de production intégré, validation navigateur effectuée ; validation Android physique restante. Aucun commit/push.

## Résultat et périmètre

La trace est une capsule basse à surface rouge sombre, fissures orange et contour clair. La préparation utilise un couloir léger avec chevrons ; la surface chaude n’apparaît que lorsque le hazard devient actif. Pas de projectile, arc de coupe, flamme haute, fumée, halo diffus, shader ni particule supplémentaire. Les deux étincelles de déplacement préexistantes du Scorificateur sont conservées.

Référence humaine : `C:/Users/Tim Pro/Downloads/Guide technique du Scorificateur incandescent.png`, copiée dans la galerie. La planche fixe le style ; les données de collision fixent la géométrie.

Galerie : [production-v038c5-scorifier-thermal-trail/gallery.html](production-v038c5-scorifier-thermal-trail/gallery.html). Serveur local : http://127.0.0.1:5228/production-v038c5-scorifier-thermal-trail/gallery.html. Relance depuis la racine : `node production-v038c5-scorifier-thermal-trail/serve.mjs`.

## Gameplay conservé

| Contrat existant | Valeur conservée |
|---|---|
| Préparation | 1,05 s |
| Ruée | 275 unités/s pendant 0,65 s, direction verrouillée |
| Activation de la ligne | Horloge du hazard : avertissement 1,70 s |
| Danger actif | 1,30 s |
| Refroidissement décoratif | 0,30 s, aucun dégât prolongé |
| Largeur de la ligne | 24 unités, rayon 12 |
| Segment entre extrémités | Jusqu’à 178,75 unités, réduit aux murs |
| Origine | Centre du mob à l’admission, jamais la lame |
| Position après admission | Coordonnées fixes, indépendantes du mob et du joueur |
| Dégâts | Contact et ligne : 0,5, invulnérabilité existante inchangée |
| Limites | Jusqu’à 5 Scorificateurs, 2 préparations/charges, 3 réservations thermiques selon caps partagés |

Les fichiers de simulation, ciblage, caps, mouvement, collisions, récompenses et armes n’ont pas été modifiés. Les masters/sheets/animations des personnages restent identiques. Chauffeur, Riveteur et boss conservent leur rendu. Le test d’intégrité compare tous les fichiers `src` préexistants, en retirant seulement les trois raccordements visuels déclarés, et tous les anciens fichiers `.test.js` au snapshot pris avant ce patch.

## Deux défauts visuels corrigés

### Prévision de ruée

L’ancien indicateur repartait de la position courante en affichant à nouveau toute la longueur de charge. Le nouveau calcul utilise la direction `chargeAngle` verrouillée et :

- en préparation : `275 × 0,65` ;
- en charge : `275 × clamp(phaseTime, 0, 0,65)` ;
- dans les deux cas : minimum avec la distance au mur, aux mêmes bornes de centre de corps que `forgeLane`.

Le couloir représente l’enveloppe du corps, rayon 19. Il reste distinct de la ligne thermique, rayon 12. Déplacer le joueur après admission ne réoriente ni la prévision ni la trace.

**Limite de simulation préexistante préservée :** la ruée est intégrée par pas discrets, sans tronquer le dernier déplacement au temps restant. À pas constant de 0,04 s, 17 déplacements de 11 unités produisent 187 unités au lieu des 178,75 nominales hors mur. Le preview représente la distance de l’horloge restante, sans anticiper un prochain delta temps inconnu ni corriger le mouvement. L’écart maximal de dernier pas dépend donc du tick réel. Ce patch n’affirme pas une égalité pixel à pixel avec tous les futurs pas variables. La capsule thermique, elle, correspond exactement au segment stocké à l’admission. Modifier ce comportement dépasserait le correctif visuel autorisé.

### Extrémités de capsule

L’ancien rendu soulignait essentiellement le segment ; les deux bouts de collision étaient sous-représentés. Le nouveau rendu compose :

1. demi-disque gauche de 12 × 24, ancré à A, origine `(1, 0,5)` ;
2. milieu de longueur `distance(A,B)` et hauteur 24, origine `(0, 0,5)` ;
3. demi-disque droit de 12 × 24, ancré à B, origine `(0, 0,5)`.

Les trois pièces tournent selon AB. Seul le milieu s’étire ; les caps restent circulaires. À longueur nulle, le milieu est masqué et les deux caps forment un disque de rayon 12. Les traits de contour sont dessinés à l’intérieur du rayon 12.

**Interprétation exacte des dimensions :** dans le code, 178,75 désigne le segment entre centres des caps. L’encombrement complet maximal vaut donc **202,75 × 24**. Aucun raccourcissement artificiel des bouts pour faire rentrer la capsule dans 178,75. Les endpoints sont limités par le rayon de corps 19 contre le mur ; les caps de rayon 12 restent à l’intérieur des limites de l’arène.

Le contour visualise la région de danger. La détection contre le joueur tient également compte de son rayon existant : son centre n’a pas besoin d’être à l’intérieur de la capsule pour que son corps la touche. Aucun changement de collision.

## Architecture de rendu

`RoomScene.preload` charge l’unique SVG versionné. `ScorifierTrailView` est créé une fois par `ArenaView`. Au début du rendu, il masque son pool, efface ses deux Graphics et vérifie l’atlas. `drawForge` lui délègue uniquement les hazards de Scorificateurs vivants, en Zone 6, forme ligne, chaleur active dans le contrat, rayon 12 ; les autres branches restent inchangées.

Le rendu lit `active`, `elapsed`, `cooling`, les endpoints et la largeur du hazard réel. Aucun timer parallèle, aucune dépendance à la frame de l’animation du mob. Activation sans attendre une frame décorative. La disparition lit le refroidissement déjà existant ; elle n’ajoute aucun danger.

| Couche | Profondeur |
|---|---:|
| Surface chaude | 7,85 |
| Corps des mobs existants | 15 |
| Contour des hazards | 16 |
| Prévision de ruée | 16,1 |
| Joueur / arme | 20 / 21 |

Les surfaces se superposent en mélange alpha normal, sans addition lumineuse. Chaque capsule dessine son propre contour au-dessus des surfaces et des mobs. Les croisements ne créent ni nouvelle forme de collision ni fusion de textures. Un personnage peut masquer une partie du sol ; le joueur reste prioritaire.

## Atlas et animation

Asset : `src/assets/scorifier-thermal-trail-v038c5/trail-a1.svg`.

| Mesure | Valeur |
|---|---:|
| Dimensions rasterisées | 88 × 144 px |
| Taille SVG disque | 4 741 octets |
| Frames | 6 lignes de 88 × 24 |
| Régions | 18 : gauche 12 × 24, milieu 64 × 24, droite 12 × 24 |
| Boucle active | Frames 0–3, 200 ms par frame, cycle 0,80 s |
| Refroidissement | Frames 4–5, 150 ms par frame sur les 0,30 s existantes, alpha décroissant |
| Mouvement réduit | Frame active 0 ; horloges et géométrie inchangées |
| Mémoire RGBA8 théorique | 50 688 octets = 49,5 Kio, hors overhead navigateur/pilote |

Les variations portent sur la couleur des fissures et du centre. Longueur, largeur, position, contours et caps restent fixes pour chaque hazard. Les exports `assets/frame-0.svg` à `frame-5.svg` sont des aperçus de validation, pas six textures de production supplémentaires.

## Pool et performance

Pool fixe **9 Images** (3 pièces × 3 traces) et **2 Graphics**. Aucune création de sprite, texture ou collection temporaire par le code de rendu à chaque frame ; les allocations internes de Phaser ne sont pas instrumentées. Aucun atlas par longueur. Les réservations en préparation occupent leur emplacement mais n’affichent pas de surface chaude. À longueur nulle, deux images seulement sont visibles.

Budget CPU mesuré dans Chrome de bureau sans interface, WebGL SwiftShader, 5 mobs / 3 longues traces actives / 9 images visibles : 1 000 appels d’échauffement, puis 80 lots de 100 appels `ArenaView.update`. Il s’agit du CPU de ce rendu d’arène, pas du temps total de frame, du GPU ou d’une mesure Android.

| Format | Avant médiane / p95 | Après médiane / p95 |
|---|---|---|
| 320 × 568 | 0,005 / 0,008 ms | 0,007 / 0,013 ms |
| 390 × 844 | 0,005 / 0,016 ms | 0,007 / 0,013 ms |

Surcoût médian observé ~0,002 ms ; valeurs très petites et sensibles au bruit de mesure. Les mesures ont précédé le remplacement d’un tableau temporaire de deux chaînes par deux comparaisons directes, optimisation sans changement visuel. Aucune extrapolation de ces chiffres à un téléphone physique.

Pool stable après 1 000 rendus, disparition, mort des owners et reset. À la fermeture de scène, destruction des 9 Images et des 2 Graphics, suppression de la référence au run. Pas de compteur mémoire long terme Android disponible.

## Fallback

L’atlas doit avoir les bonnes dimensions et 18 régions aux bons rectangles/sources. Une texture absente, de mauvais format, une région absente, mal découpée ou rattachée à une source étrangère désactive la branche nouvelle. Les appels retournent alors au rendu procédural antérieur de `drawForge`, tant pour la trace que pour la prévision.

Pas de substitution d’asset d’une autre entité. Le fallback conserve aussi les limites visuelles de l’ancien rendu ; les corrections de preview/caps décrites ici concernent le chemin primaire. Le danger reste jouable lorsque le chargement échoue.

Tests navigateur : retrait de `m2`, retrait de l’atlas complet aux deux formats ; également échec réseau forcé dès le preload. Le hazard reste actif, zéro image de la nouvelle famille est affichée et l’ancien rendu est visible. Aucun plantage JavaScript ; l’erreur réseau injectée au preload est intentionnelle.

## Tests et contrôles

Suite complète finale : **1 674 / 1 674**, soit les **1 643 tests préexistants + 31 nouveaux**, aucun test sauté, durée 52,85 s. Les anciens fichiers `.test.js` n’ont pas été modifiés. Les helpers de comparaison de sources ont été étendus par inversion exacte des seuls raccordements de présentation ; aucun assouplissement global des assertions.

Un lancement dans le bac à sable a rencontré deux erreurs `EACCES` sur les serveurs HTTP locaux de tests existants. La suite finale est relancée avec accès au loopback ; les tests ne sont pas modifiés pour contourner ces vérifications.

Nouveaux tests : atlas, six défauts de fallback, absence de texture étrangère, huit directions, projections aux murs, longueur 0 / 0,25 / 3 / 76 / 178,75, bouts fixes, états warning/active/cooling, mouvement réduit, exclusion des autres entités, quatre compositions de chevauchement, replay de simulation de 1 200 ticks avec/sans rendu, dégâts identiques, absence de projectile, lock, trace fixe, deux préparations, trois admissions réelles près du mur, mort/reset/shutdown et stabilité du pool.

**60 scènes navigateur** : 30 états pour chacun des formats **320 × 568** et **390 × 844**. Aucun débordement de page, aucune erreur console ou exception JavaScript dans les parcours normaux. Captures :

- préparation, ruée, activation, actif, refroidissement, extinction, mob reparti ;
- charge complète, mur frontal, capsule courte/nulle, coin, huit directions ;
- deux préparations, deux ruées croisées, trois traces réellement admises près du mur ;
- trois longues traces parallèles, perpendiculaires et superposées, explicitement des fixtures de rendu ;
- joueur au centre, sur le bord et au bout ; cohabitation Chauffeur/Riveteur ;
- avant/après au même instant pour anticipation, charge, actif et longueur nulle.

Galerie vérifiée en 1280 × 900, 320 × 568 et 390 × 844 : 50 images chargées, deux jeux de captures sélectionnables, aucun débordement ni erreur console. La réduction 40/56/84 affiche le master dans ces cadres CSS ; les captures de jeu montrent l’échelle réellement appliquée par la scène. L’entrée réelle `index.html` est également contrôlée : canvas chargé, atlas reçu en HTTP 200, aucun message fatal ni erreur console.

Les contrôles CPU et les captures utilisent les classes de production via une scène QA. Les cas synthétiques sont signalés pour ne pas les confondre avec une preuve de fréquence réelle des attaques. Le cas mixte peut comporter un projectile Riveteur inchangé ; le Scorificateur n’en produit aucun.

Preuves : `production-v038c5-scorifier-thermal-trail/notes/tests.txt`, `notes/browser.json`, `notes/gallery-browser.json`, `captures/`. Reproduction : `node --test tests/*.test.js`, `node production-v038c5-scorifier-thermal-trail/verify-browser.mjs`, `node production-v038c5-scorifier-thermal-trail/verify-gallery.mjs` (serveur 5228 actif, Chrome installé et Playwright du runtime local).

## Fichiers de ce patch

Production :

- `src/scorifier-thermal-trail-vfx.js` — nouveau renderer, preview, atlas, pool, fallback ;
- `src/assets/scorifier-thermal-trail-v038c5/trail-a1.svg` — atlas versionné ;
- `src/room-scene.js` — preload ;
- `src/arena-view.js` — construction et mise à jour du renderer ;
- `src/forge/art.js` — délégation sélective, ancien chemin intact.

Tests :

- `tests/scorifier-thermal-trail-v038c5.test.js` — 31 tests ;
- `tests/scorifier-before-hashes-v038c5.json` — état avant patch ;
- `tests/scorifier-visual-delta.js` — inversion exacte des trois raccordements ;
- `tests/chauffeur-visual-delta.js` — compose l’inversion C5 avant la comparaison C4 ;
- `tests/v038b3-authorized-files.js` — ajoute seulement les deux nouveaux chemins de production.

Validation : `production-v038c5-scorifier-thermal-trail/` (galerie, aperçu master/frames, référence, captures, mesures, scripts) et ce rapport. Le dossier de validation suit la convention `production-*` ignorée par Git ; il est livré sur disque. Les changements C3/C4 déjà présents avant ce travail sont préservés, notamment `src/rift/art.js` et les assets Cracheur/Chauffeur.

## Android physique restant

1. Sur le téléphone habituel, recharger le jeu servi par le projet puis entrer en Zone 6 avec Scorificateurs.
2. Confirmer la direction verrouillée et la prévision qui se raccourcit pendant la charge, horizontalement, verticalement et en diagonale.
3. Vérifier les traces courtes près des murs et les caps, puis la trace immobile après le départ du mob.
4. Observer deux charges / trois traces avec Chauffeur et Riveteur, vérifier que le joueur et les zones sûres restent lisibles en portrait.
5. Évaluer fluidité, chauffe, reprise après arrière-plan, cache réel et stabilité sur plusieurs vagues.

Les captures navigateur ne remplacent pas ces mesures matérielles. Aucun changement de gameplay, aucun commit/push, aucun autre chantier commencé.
