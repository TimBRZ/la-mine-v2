# V0.38C.3 — Poche de gaz du Cracheur, variante A

Livraison locale du 18 octobre 2026, sur `main`, baseline `e7053fb`. **Intégration visuelle terminée ; validation humaine et Android physique restantes. Aucun commit/push.**

## Référence et résultat

Référence unique : `C:/Users/Tim Pro/Downloads/Planche VFX — Poche de gaz toxique.png`, « Poche de gaz toxique — Variante A ». Copie consultable dans `production-v038c3-cracheur-gas/assets/reference-a.png`.

Le rendu reprend une poche basse, de petites masses arrondies, un centre vert clair contenu, cinq bulles discrètes et une limite nette. Aucun projectile, jet, nouvelle attaque, impact joueur, halo ou filtre de flou. L’ellipse illustrative de la planche devient un cercle dans la vue de jeu pour respecter **exactement le rayon gameplay**. Les petits volumes bougent d’une unité dans l’atlas ; le contour ne change ni de taille ni de position.

La source graphique est un petit atlas SVG natif du projet, rasterisé une seule fois par Phaser. Ce n’est pas un recadrage bitmap de la planche ni une nouvelle variante artistique. Le master de présentation inclut un contour ; l’atlas de production contient uniquement le gaz, le contour étant dessiné séparément au-dessus de toutes les poches.

## Gameplay conservé

| Propriété | État livré |
|---|---|
| Projectile | Aucun créé ; `spit` reste un hazard au sol |
| Télégraphe | Valeur gameplay **1,3 s**, compteur et ordre d’update inchangés |
| Danger | Valeur gameplay **2,0 s**, dégâts et tick existants inchangés |
| Rayon | **38**, diamètre du sprite **76 unités de jeu**, contour centré sur le rayon 38 |
| Position | Coordonnées verrouillées du hazard ; aucun suivi du joueur ni du Cracheur |
| Clamp | x 78–372, y 166–616, identique au moteur |
| Simultanéité | Maximum **2 Cracheurs**, une zone par Cracheur ; plafond global de sol **4** inchangé |
| Ciblage / fréquence | Inchangés, aucun accès en écriture depuis le renderer |
| Activation | Lecture directe de `h.active`, même si l’acteur est encore en préparation |
| Fin | Sprite masqué dès que le hazard est retiré ; aucun résidu visuel ni timer supplémentaire |

Le décalage déjà audité d’un tick entre activation du hazard et animation du mob reste intact. Le nouveau rendu actif apparaît dès `h.active`, sans attendre la frame attack. Les dommages de fin de durée déjà audités sont également conservés : le VFX n’ajoute ni ne retire de dommage et ne pilote jamais `damagePlayer`.

## Architecture et fichiers

Racine des chemins suivants : `C:/LaMineV2/la-mine-v2-v01/`.

| Fichier | Modification |
|---|---|
| `src/cracheur-gas-vfx.js` | Nouveau module de présentation : chargement, validation, sélection par owner, pool de deux sprites, dessin du contour, cleanup |
| `src/assets/cracheur-gas-v038c3/active-a1.svg` | Nouvel atlas versionné, quatre frames |
| `src/room-scene.js` | Import et appel de préchargement de l’atlas uniquement |
| `src/arena-view.js` | Création du pool, masquage/réutilisation à chaque update, passage du callback à `drawRift` |
| `src/rift/art.js` | Callback facultatif pour chaque hazard ; si non traité, exécution de l’ancien rendu à l’identique |
| `tests/cracheur-gas-v038c3.test.js` | 32 tests nouveaux, dont replay simulation avec/sans renderer |
| `tests/cracheur-visual-delta.js` | Inversion exacte des seules additions visuelles pour les contrats historiques |
| `tests/lampist-visual-delta.js` | Chaînage de cet adaptateur avant le contrôle historique existant |
| `tests/v038b3-authorized-files.js` | Ajout explicite des deux nouveaux fichiers de production à la liste héritée des ajouts visuels autorisés |

Les fichiers de gameplay `rift/actors.js`, `rift/combat.js`, `rift/config.js`, `rift/waves.js`, `run.js`, les hitboxes, les armes joueur et les autres VFX restent inchangés. Aucune sheet de mob/boss remplacée. Aucune modification du rendu Lampiste, Rivet B ou Grisou X.

La sélection exige Zone `rift`, hazard `gas`, owner vivant de type **`spitter`**. Un simple `kind==='gas'` n’est pas suffisant : le gaz ambiant, le Grisouteux, le Sondeur et les boss restent sur leurs rendus précédents. L’intégration est bornée par deux slots ; toute entrée non prise en charge conserve le fallback, sans toucher aux budgets gameplay.

## Assets, animation et mémoire

| Élément | Valeur |
|---|---|
| Clé de texture | `cracheur-gas-v038c3-a1` |
| Atlas | `src/assets/cracheur-gas-v038c3/active-a1.svg` |
| Dimensions | **384×96 px**, quatre cellules **96×96 px** |
| Poids disque runtime | **4 788 octets** (atlas seul, hors code et documentation) |
| Mémoire raster RGBA nominale | **147 456 octets = 144 KiB**, partagés entre les deux sprites ; hors overhead moteur/GPU |
| Boucle | **4 frames / 0,8 s**, 200 ms par frame |
| Taille affichée | `hazard.radius * 2` sur les deux axes ; aucun pulse d’échelle |
| Origine | Centre (0,5 ; 0,5), position exactement `(h.x,h.y)` |
| Gaz | Clip interne de rayon 43/48 du rayon externe, sans dépassement massif |
| Contours | Graphics de l’arène, profondeur 8 ; gaz profondeur 7,9 ; héros profondeur 20 |
| Mouvement réduit | Frame active 0 fixe ; timing et contour identiques |

Le contour continu fin garantit la lecture de la limite ; des segments plus lumineux reprennent le rythme de la référence sans perdre la frontière entre les segments. Le télégraphe est vert/cyan pâle, intérieur à alpha 0,035, sans gaz. En actif, contour vert clair plus marqué, fond à alpha 0,09 et atlas contenu. Les petits dégradés SVG servent aux volumes ronds et sont rasterisés au chargement ; **aucun filtre GPU dynamique, blur ou système de particules**.

La disparition est volontairement **immédiate**, une option rapide et propre sans phase résiduelle : pas d’atlas dissipate ni de prolongation de perception du danger. Les références de tailles 40/48/56/84 dans la galerie ne modifient jamais les dimensions gameplay.

Génération reproductible : `node production-v038c3-cracheur-gas/build-assets.mjs`. Ce script produit l’atlas et le master de présentation, pas les animations de l’ennemi.

## Pooling, fallback et cycle de vie

Deux images créées une fois par `ArenaView`, réutilisées à chaque update. Aucun sprite/particule créé par frame. Le renderer ne conserve pas les hazards ni leurs propriétaires ; il lit la run actuelle et les coordonnées de chaque entrée. En début de rendu, les deux sprites sont masqués avant réaffectation. Un changement de run, retrait du hazard, nettoyage de vague ou mort du propriétaire ne laisse donc pas de poche active attachée à l’ancien état. À la fermeture de scène, destruction des deux images et suppression de la référence à la run.

Le chargement vérifie la clé, les dimensions et les quatre rectangles de frames. **Texture absente, dimensions incorrectes, frame absente ou coordonnées de frame incorrectes → ancien `dangerCircle` et cercle vert interne**, sans dessin primaire concurrent. Ce fallback vaut aussi pour le télégraphe si l’atlas actif est incomplet. Aucun fallback vers une famille de projectile. Les erreurs réseau éventuelles d’un chargement réellement indisponible restent des erreurs réseau du navigateur ; le comportement de secours a été testé en retirant la texture/une frame dans une scène chargée.

Les contours des deux zones sont tous dessinés au-dessus des deux sprites : une poche ne recouvre pas le bord de l’autre. En superposition exacte, les deux emprises sont naturellement identiques ; elles ne sont ni fusionnées dans le gameplay ni agrandies visuellement.

## Tests automatiques

**Suite finale : 1 610 / 1 610 tests réussis, 0 échec, 0 ignoré.** Durée du dernier passage : **52,983 s**. Baseline conservée : **1 578**, nouveaux tests : **32**.

Aucun ancien fichier `.test.js` modifié, aucune assertion historique supprimée, aucun snapshot/hachage historique régénéré. Les contrôles de bytes sont maintenus par inversion explicite des additions visuelles ; trois nouveaux contrôles comparent le résultat au commit `e7053fb` (normalisation des fins de ligne pour la comparaison Git uniquement). Les anciens contrôles conservent leurs comparaisons byte-à-byte. Le premier passage complet a signalé sept gardes d’inventaire ne connaissant pas les deux nouveaux fichiers ; l’ajout de leurs **deux chemins exacts** au registre existant a résolu ces écarts, sans exception globale.

Couverture nouvelle : atlas/frames, absence d’asset étranger, fallback original, télégraphe sans gaz, activation alors que l’acteur est encore warning, durée/rayon/position/clamp, deux zones et chevauchements, pool stable sur 2 000 réutilisations, limite des vagues, zéro projectile, absence de mutation de simulation, déplacement après verrouillage, retrait/mort/changement de run/shutdown et mouvement réduit.

Le replay comparatif exécute **720 ticks sur deux runs identiques**, avec et sans rendu, et compare les événements et l’état sérialisé complet de simulation. Il confirme notamment les mêmes dégâts et les mêmes transitions.

Journal complet : `production-v038c3-cracheur-gas/notes/tests-final.txt`.

## Contrôles navigateur et performance

Chrome de bureau, profil isolé, viewport **320×568** puis **390×844**, DPR 1. La scène utilise les renderers/acteurs de production (`RoomScene`, `ArenaView`, `Run`) avec tir joueur neutralisé et PV élevés ; les placements aux bords et les zones multiples sont des fixtures de consultation, pas de nouvelles vagues.

**12 scénarios × 2 formats = 24 contrôles** :

- cycle naturel d’un Cracheur et joueur dans la zone ;
- joueur sort avant activation, puis sort pendant le danger ;
- deux zones séparées, proches, partiellement superposées et exactement superposées ;
- murs gauche/droit, haut/bas et coin.

Résultats : aucun projectile ; positions constantes après verrouillage ; nombre de sprites actifs égal au nombre de hazards actifs à chaque tick ; limite visuelle calée sur le clamp ; joueur au-dessus du gaz ; contours distincts ; aucun halo géant. Le scénario naturel observe bien une activation pendant que le mob est encore warning. Le joueur sorti avant activation reste à 100 000 PV dans cette fixture ; sortie pendant danger : 99 999,5, conformément à un dommage initial de 0,5.

**Aucune erreur console** sur ces scènes, sur la galerie aux deux formats mobiles et en 1120×900, ni au démarrage normal du jeu. Aucun débordement horizontal de galerie. L’atlas est chargé une fois par page, y compris dans le démarrage normal de production.

Mesure ciblée de soumission CPU du rendu de deux zones, 2 000 passages par format : pool **2 stable**, **1 chargement d’atlas**, max observé **0,5 ms** (320) / **0,6 ms** (390). Le p95 est arrondi à 0 par la résolution du timer du navigateur : **cela signifie sous la résolution de mesure, pas un coût nul**. Cette mesure porte sur `begin + dessin Graphics`, pas sur le coût GPU complet ni les FPS Android. Aucun résultat matériel Android revendiqué.

Résultats détaillés : `production-v038c3-cracheur-gas/notes/browser.json` et `notes/gallery-browser.json`. Captures : `captures/mobile-320.jpg`, `captures/mobile-390.jpg`, phases, ancien/nouveau et douze cas par format.

## Livrables et validation Android restante

- Galerie : `C:/LaMineV2/la-mine-v2-v01/production-v038c3-cracheur-gas/gallery.html`.
- Scène interactive : même dossier, `observe.html` ; sélection des scénarios, pas-à-pas, lecture/pause, retrait de texture/frame et nettoyage des zones.
- Master : même dossier, `assets/master.svg` ; atlas runtime dans `src/assets/cracheur-gas-v038c3/active-a1.svg`.
- Galerie locale : <http://127.0.0.1:5224/production-v038c3-cracheur-gas/gallery.html>.

Les dossiers `production-*` restent ignorés par le `.gitignore` préexistant ; les livrables sont présents sur disque. Ce réglage n’a pas été modifié. L’ancien rapport d’audit et sa galerie sont conservés.

Sur Android physique, il reste à confirmer dans la Zone 4 : lecture du cercle pâle avant activation, passage immédiat au gaz, visibilité du héros/sol, distinction des deux contours, fluidité sans scintillement et retrait propre. Tester le mouvement avant/après activation et un bord d’arène. Utiliser le service du jeu déjà accessible au téléphone lorsqu’il est disponible ; cette livraison ne configure pas de nouvel accès réseau local.

**Limitation d’accès :** le contrôle automatique a refusé le lancement du serveur sur `0.0.0.0`, jugeant l’exposition du code et des assets au réseau local insuffisamment autorisée. Le serveur de validation a donc été lancé uniquement sur `127.0.0.1`. Son URL ne fonctionne pas directement depuis le téléphone ; une ouverture réseau supplémentaire nécessite une autorisation explicite. Aucune tentative de contournement effectuée.

**Arrêt après cette intégration. Validation humaine et Android restantes. Aucun autre VFX commencé. Aucun commit/push.**
