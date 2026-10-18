# V0.38C.4 — Chauffeur : plaque métallique chauffée

Variante A intégrée le 18 octobre 2026. Patch strictement visuel, arrêté après livraison. Aucun commit/push. Aucun chantier VFX suivant engagé.

## Référence et résultat

Référence humaine : `C:/Users/Tim Pro/Downloads/Planche VFX — Plaque chauffée Zone 6.png`, copiée sans modification dans [la galerie](production-v038c4-chauffeur-heat-plate/gallery.html). Le master conserve la plaque industrielle, le cadre sombre, les rivets simples et les fissures orange/jaune. Les volumes sont simplifiés en aplats SVG. Aucun glow diffus, shader, fumée, particule, projectile, cône ou jet ajouté.

La perspective illustrée de la planche ne remplace pas la géométrie réelle : rectangle **76 × 88 unités**, aligné aux axes, rotation nulle. Texture et contours restent dans cette surface. Le héros et les ennemis passent au-dessus du VFX.

## Contrat gameplay inchangé

| Élément | Valeur conservée |
|---|---|
| Télégraphe | 1,2 s, rectangle jaune, intérieur léger |
| Danger | 2,3 s, état `active` réel |
| Dégâts | 0,5 ; invulnérabilité globale existante |
| Surface | 76 × 88 ; aucun changement de hitbox |
| Position | Admission sur la grille existante, puis fixe |
| Fin | Refroidissement décoratif sur les 0,3 s déjà présentes ; aucun dégât |
| Chauffeurs | Cap existant de 2 avant vague 11, 3 ensuite |
| Caps de dangers | Chaleur partagée 3, total sol 5 ; réservations inchangées |

Le renderer ne modifie aucun hazard. Il lit `warning`, `active`, `elapsed`, `cooling`, `x`, `y`, `w`, `h`. Il ne dépend ni du timer d’animation du Chauffeur, ni de son déplacement. L’activation peut précéder d’une frame la fin de préparation visuelle du mob : le VFX suit correctement le hazard.

La collision originale tient compte du rayon du héros : `abs(dx) < 38 + radius` et `abs(dy) < 44 + radius`. Le contour représente la plaque 76 × 88, pas la zone élargie des positions possibles du centre du héros. Ce comportement n’est pas modifié.

Le petit accent de buse existant reste intact. Aucune liaison lumineuse avec la plaque. Aucun changement aux autres ennemis, boss, armes joueur, dégâts, timings, déplacements, ciblage, clamp, cadence ou compositions des vagues.

## Architecture de présentation

- `src/chauffeur-heat-plate-vfx.js` : chargement SVG, enregistrement/validation des six frames, sélection stricte des plaques Chauffeur, pool, rendu et cleanup.
- `src/room-scene.js` : un appel de preload.
- `src/arena-view.js` : création du pool, reset de visibilité avant chaque rendu et passage du callback à `drawForge`.
- `src/forge/art.js` : callback optionnel par hazard ; le rectangle procédural existant reste le chemin de repli.
- `src/assets/chauffeur-heat-plate-v038c4/plate-a1.svg` : atlas partagé et versionné.

Le filtre exige Zone 6 (`forge`), forme `plate`, chaleur active, dimensions exactes, owner vivant `kind=stoker` et `forgeType=stoker`. Il exclut les autres dangers thermiques, l’environnement, les boss et les dangers sans owner. Les autres renderers restent inchangés.

Les textures au sol sont à profondeur 7,9. Tous les contours sont sur le Graphics existant à profondeur 8 : un sprite de plaque ne masque donc pas le contour d’une autre. Les acteurs restent au-dessus. Aucun blend additif.

Le télégraphe est procédural : rectangle jaune et coins nets, sans plaque rouge. En mode mouvement réduit, la frame active reste fixe. L’état actif et la disparition restent pilotés par le hazard.

## Asset, animation et budget

| Mesure | Valeur |
|---|---|
| Clé | `chauffeur-heat-plate-v038c4-a1` |
| Format | SVG rasterisé une seule fois par Phaser |
| Atlas | 456 × 88 px ; 6 cellules de 76 × 88 |
| Actif | Frames 0–3, 200 ms chacune, boucle 0,8 s |
| Refroidissement | Frames 4–5, 150 ms chacune sur les 0,3 s existantes, fondu |
| Télégraphe | Procédural, pas de texture dédiée |
| Poids SVG | **10 628 octets** |
| Mémoire RGBA8 | **160 512 octets / 156,75 Kio**, hors overhead moteur/driver |
| Pool | **3 sprites préalloués**, une texture partagée |
| Allocation par frame | Aucune collection ou nouvel objet créé par le module VFX |
| Particules / blur / shader ajouté | 0 / 0 / 0 |

Le cadre et les fissures ne changent pas de position ; seules les couleurs internes varient légèrement. Aucun redimensionnement ou pulsation de la zone. Pas de texture supplémentaire pour les chevauchements.

Source reproductible : `production-v038c4-chauffeur-heat-plate/build-assets.mjs`. Les SVG `master.svg` et `frame-0.svg` à `frame-5.svg` sont des exports de validation ; seul l’atlas versionné est chargé en production. Les images de référence et fichiers de galerie ne peuvent pas être sélectionnés par le renderer.

## Fallback et cleanup

Le chargement, les dimensions du bitmap, les six découpes et leurs sources sont vérifiés. Atlas absent, mauvaise dimension, frame manquante/invalide ou pool saturé : retour à l’ancien rectangle procédural, sans emprunter de texture à une autre entité. Une seule frame manquante désactive le nouveau chemin pour conserver un rendu cohérent.

Chaque update masque d’abord le pool ; seuls les hazards admissibles le réutilisent. Fin du danger, mort de l’owner et changement de run ne laissent pas de plaque visible. `shutdown` détruit les trois sprites. Les tests comparent les commandes de fallback à celles de l’ancien renderer.

## Vérifications automatisées

**1 643 / 1 643 tests réussis ; 0 échec, 0 ignoré.** Durée de la dernière passe complète : 52 853,3465 ms. Baseline 1 610 conservée, **33 nouveaux tests**. [Journal complet](production-v038c4-chauffeur-heat-plate/notes/tests.txt).

Nouveau fichier : `tests/chauffeur-heat-plate-v038c4.test.js`.

Couverture : chargement/atlas ; six familles de défauts ; fallback identique ; aucune création de projectile/cône ; filtrage des owners et autres entités ; 76 × 88 et traits contenus ; phases, durée, dégâts et invulnérabilité ; 1/2/3 admissions ; plaque fixe et mob qui repart ; rejouage gameplay avec/sans rendu sur 720 frames ; chevauchements synthétiques ; pool sur 2 000 passages ; saturation ; coins/bords ; disparition, mort et shutdown.

Les assertions des fichiers `.test.js` antérieurs sont inchangées. Les gardes d’intégrité historiques sont adaptées uniquement aux hooks visuels explicitement autorisés :

- nouveau `tests/chauffeur-visual-delta.js`, retrait exact des trois hooks pour contrôle des sources antérieures ;
- `tests/cracheur-visual-delta.js`, composition de ce retrait avant son contrôle existant ;
- `tests/v038b3-authorized-files.js`, ajout des deux nouveaux chemins de production à l’autorisation de fichiers.

`tests/chauffeur-before-hashes-v038c4.json` fige les fichiers source et tests avant ce patch (copie de contrôle dans `notes/before-hashes.json`). Les tests ne dépendent donc pas du dossier de galerie ignoré par Git. Les modifications C3 et l’audit C4 préexistants ont été conservés.

## Contrôles navigateur

Chrome local avec WebGL logiciel, tailles CSS **320 × 568 et 390 × 844**, DPR 1. [Relevés détaillés](production-v038c4-chauffeur-heat-plate/notes/browser.json), reproductibles avec `verify-browser.mjs`.

25 situations à chaque format, soit **50 captures d’état**, plus captures avant/fallback : télégraphe, activation, boucle, refroidissement, disparition, mob en déplacement, deux/trois Chauffeurs, plaques voisines, trois niveaux de superposition, joueur hors/bord/centre, quatre bords, quatre coins, grande distance. **Aucune erreur console** dans la passe finale. Entrée réelle du jeu chargée également.

La grille réelle espace les centres de 115/130 unités pour des plaques de 76/88 : le chevauchement ne se produit pas avec ces emplacements. Les superpositions partielles, fortes et exactes sont donc forcées uniquement dans le banc de validation. Les contours restent distincts sauf superposition exacte, où ils coïncident nécessairement ; aucune augmentation de luminosité.

Le banc utilise les classes gameplay et le renderer de production. Il suspend les tirs et apparitions supplémentaires et prolonge les PV du héros pour observer les phases. Ces réglages ne touchent pas le jeu livré. Le feedback rouge du héros blessé reste celui du jeu.

Atlas et frame supprimés volontairement à chaud : ancien rectangle visible, hazard toujours actif, pool masqué. Nettoyage après mort et réinitialisation : trois mêmes sprites, tous masqués. Une erreur d’affichage du rapport de contrôle après destruction de la texture a été corrigée dans `observe.js` avant la passe finale ; aucun changement de gameplay associé.

Contrôle complémentaire : échec réseau simulé dès le preload, fallback visible et aucune exception JavaScript. L’erreur réseau est attendue dans ce seul scénario injecté. La galerie finale a également été vérifiée à 1280 × 900, 320 × 568 et 390 × 844 : 37 images chargées dans les deux sélections de captures, aucun débordement horizontal ni erreur console. Résultats dans `notes/gallery-browser.json`.

### Performance desktop

Mesure CPU d’`ArenaView.update`, trois plaques actives, 80 lots × 100 appels après chauffe. Valeurs en millisecondes :

| Format | Ancien médiane / p95 | Nouveau médiane / p95 |
|---|---|---|
| 320 × 568 | 0,003 / 0,004 | **0,002 / 0,005** |
| 390 × 844 | 0,003 / 0,006 | **0,002 / 0,004** |

À ces ordres de grandeur, le bruit de mesure ne permet pas de conclure à un gain. Le coût CPU ne présente pas de régression notable dans cette mesure. Elle n’inclut pas le temps GPU et ne constitue pas un benchmark Android.

Échantillonnage de 180 intervalles requestAnimationFrame avec le renderer réel : moyenne/p95/max 10,955/12,9/16,4 ms à 320 ; 10,692/12,3/14,2 ms à 390. Ces intervalles dépendent de Chrome headless et de sa cadence ; ils ne constituent pas une promesse de FPS sur téléphone.

## Livrables et validation restante

- [Galerie](production-v038c4-chauffeur-heat-plate/gallery.html) : référence, master, frames/atlas, avant/après et toutes les scènes, bascule 320/390.
- [Banc interactif](production-v038c4-chauffeur-heat-plate/observe.html).
- [Master de validation](production-v038c4-chauffeur-heat-plate/assets/master.svg).
- Captures et mesures : `production-v038c4-chauffeur-heat-plate/captures/` et `notes/`.

**Android physique reste à valider** : recharger l’adresse habituelle du jeu sur le téléphone ; jouer en Zone 6, observer jaune → métal chauffé → extinction, traverser bord/centre, laisser le Chauffeur repartir, puis tester jusqu’à trois Chauffeurs et la fluidité. Vérifier que le nouveau rendu est chargé après rechargement, et que les menaces/héros restent lisibles. Aucun test physique Android n’est revendiqué ici.

Arrêt après ce correctif. Aucun commit, push ni modification d’historique Git.
