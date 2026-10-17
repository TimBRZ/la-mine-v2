# V0.38C.2 — Famille lumineuse Lampiste / Lampiste Major

## Livraison

**1 578 / 1 578 tests réussis**, aucun échec, aucun test ignoré. Baseline de 1 525 conservée, 53 nouveaux tests. Journal : [tests-final.txt](production-v038c2-lampist-projectile/notes/tests-final.txt). Durée 56,61 s.

La variante B pointue est le rendu primaire des projectiles mobiles du Lampiste. Une seule texture fournit les deux tailles : **44 px** pour le Lampiste, **62 px** pour le Major, soit **+40,91 %** avec des proportions identiques. Aucun projectile rond de remplacement, aucune autre famille VFX créée.

**Limite importante révélée par l'audit : le Lampiste Major actuel n'émet pas ces tirs dans son cycle normal.** Son contrôleur V0.36B emploie les faisceaux, zones et séquences spéciales. Les chemins historiques `light` et `fan` existent toujours et reçoivent la version agrandie lorsqu'ils sont réellement exécutés ; la galerie les exerce explicitement dans des fixtures. Ils n'ont pas été ajoutés au cycle actuel. Le triple normal conserve donc exactement ses attaques, sans nouveau tir lumineux inventé.

- [Galerie de validation](production-v038c2-lampist-projectile/gallery.html)
- [Banc du renderer de production](production-v038c2-lampist-projectile/observe.html)
- [Master](production-v038c2-lampist-projectile/assets/master.svg), [silhouette](production-v038c2-lampist-projectile/assets/silhouette.svg), [sheet](production-v038c2-lampist-projectile/assets/sheet.svg)
- [Capture 320×568](production-v038c2-lampist-projectile/captures/mobile-320.jpg), [capture 390×844](production-v038c2-lampist-projectile/captures/mobile-390.jpg)
- [Référence humaine conservée](production-v038c2-lampist-projectile/assets/reference.png)

Serveur de lecture locale : `node production-v038c2-lampist-projectile/server.mjs`, puis `http://127.0.0.1:5223/production-v038c2-lampist-projectile/gallery.html`. Il n'expose que le projet et cette galerie, sans sauvegarde ou API distante.

## Audit des attaques

| Entité / chemin | Comportement existant | Conversion |
|---|---|---|
| Lampiste `light` | 3 projectiles mobiles, éventail centré sur la cible, ouverture totale 0,2π, vitesse 118, portée 300, rayon 5, dégâts 0,5 | Oui, standard 44 px |
| Major historique `light` | Même salve ×3, mêmes spécifications projectile | Oui, 62 px, uniquement si ce chemin est exécuté |
| Major historique `fan` | 6 projectiles, ouverture totale 0,7π, vitesse 110, portée 300, rayon 5, dégâts 0,5, majeur | Oui, 62 px, uniquement si ce chemin est exécuté |
| `major-sweep` — Balayage | Faisceau balayé, avertissement 1,2 s, actif 2,6 s | Exclu, inchangé |
| `major-aim` — Mise en joue | Suivi 0,8 s, verrouillage 0,65 s, ligne active 0,38 s | Exclu, inchangé |
| `major-dark` — Extinction générale | Avertissement 0,7 s, séquence 2 s / assombrissement | Exclu, inchangé |
| `major-cross` — Feux croisés | Lignes mobiles, avertissement 1,3 s, actif 2,2 s | Exclu, inchangé |
| `major-blackout` — BLACKOUT | Extinction, deux balayages, mise en joue | Exclu, séquence et timings inchangés |
| `beam`, `blackout`, combos, cônes, sols, autres ultimes | Géométries et télégraphes spécifiques | Exclus |
| Autres sources, Rivet B, joueur, Grisou X, orbes | Autres familles | Exclus |

Le sélecteur exige Zone 5 (`depths`), projectile actif, propriétaire identifié, absence d'orbe et de séquence spéciale, bon pattern et spécifications de famille. Il ne se fonde jamais sur la couleur seule. L'identité est mémorisée à la première observation du projectile pour survivre au changement de phase ou à la disparition de son propriétaire ; une réutilisation du slot réévalue cette identité.

### Fréquence et tir immédiat

Le Lampiste garde 1,45 s de récupération + 0,65 s de repositionnement, soumis aux conditions de distance et caps existants. Le multiplicateur de repos avancé (vagues 11–19) et celui d'extinction restent 1,12. Aucune valeur modifiée ; le scénario C1c isolé mesurait 2,108 s entre départs à 120 Hz. Le Major normal reste piloté par `DepthsBossDirector`, sans modification de fréquence.

Les tirs mobiles purs restent créés au tick courant lorsque leurs conditions sont remplies. Aucun preview, ghost ou délai secondaire. Le renderer n'affiche que les slots actifs de la simulation. La condition de protection C1c au contact reste intacte. Les 51 tests C1b et les 107 contrôles C1c restent exécutés.

## Asset et animation

| Propriété | Valeur |
|---|---|
| Clé | `lampist-light-shot-v038c2` |
| Ressource runtime | `src/assets/lampist-light-shot-v038c2/shot-v1.svg` |
| Sheet | 384 × 32 px, 4 cases de 96 × 32 |
| Boucle | 160 ms, soit 40 ms par frame |
| Standard | 44 × 14,667 unités du jeu ; scale 44/96 = 0,45833 |
| Major | 62 × 20,667 unités du jeu ; scale 62/96 = 0,64583 |
| Ratio Major / standard | 1,40909, uniforme sur X et Y |
| Origine du sprite | X = 64/96, Y = 0,5 |
| Animation réduite | Frame 0 fixe |
| SVG runtime | **4 024 octets** |
| Surface RGBA8 | **49 152 octets = 48 Kio**, hors overhead driver / éventuel stockage CPU |

La pointe ivoire, l'enveloppe or, la bague brun-charbon et la structure anguleuse suivent la référence. Le corps principal est identique sur les quatre frames ; seule la petite traînée et deux micro-éclats varient. Pas de morphing, changement d'échelle, fumée, shader lumineux, flou, halo ou particules indépendantes. La silhouette de galerie emploie un filtre de couleur uniquement pour la présentation ; la sheet runtime n'utilise aucun filtre.

Les dimensions sont des unités du monde 450×800, et non une promesse de 44/62 pixels CSS dans toute fenêtre : le jeu est réduit par son mode FIT. La galerie présente aussi les deux footprints en pixels CSS réels. À 320 px de large, le rendu jeu correspond environ à 31 / 44 px de largeur ; à 390 px, environ à 38 / 54 px. La taille a été gardée compacte après inspection du groupe à 24 projectiles.

## Muzzle et orientation

Le point de collision existant reste `position propriétaire + direction × (rayon propriétaire + rayon projectile + 2)`. Aucun spawn gameplay déplacé.

L'inspection mobile a montré qu'utiliser directement ce point pour le dessin en visée basse faisait sortir la balle près des pieds. Le module visuel lit maintenant la position du projecteur dans le master approuvé :

- Lampiste : centre du projecteur (304, 500), viewport carré (30,15 ; 240,15 ; 359,7), soit un décalage normalisé (94/359,7 ; 80/359,7) depuis le centre.
- Major : centre du projecteur (679, 620), viewport carré (13,46 ; 20,46 ; 833,08), soit (249/833,08 ; 183/833,08).

Le socket suit la taille du corps et son miroir horizontal déjà rendu. Le décalage est figé au départ pour que les mouvements ou flips ultérieurs ne tirent pas le projectile en vol. Il décroît linéairement sur les **40 premières unités parcourues**, puis le sprite coïncide exactement avec la balle réelle. C'est un raccord de représentation, pas une nouvelle trajectoire de collision. L'angle de la pointe reste toujours `bolt.angle`, y compris aux huit orientations. Il existe donc une courte différence assumée entre position dessinée et collision pendant le raccord ; elle ne change ni les dégâts ni la portée.

Le socket est mesuré sur la pose approuvée, pas recalculé à partir de chaque pixel de chaque frame : les petites déformations d'animation restent des approximations visuelles. Sans corps moderne reconnu, le renderer conserve l'origine réelle, sans inventer de socket pour un asset de secours. La traînée est recadrée à la naissance puis révélée avec la distance ; aucun tracé n'existe avant le vrai tir.

Comparaison avant raccord : [before-socket-390.jpg](production-v038c2-lampist-projectile/captures/before-socket-390.jpg). Après : [mobile-390.jpg](production-v038c2-lampist-projectile/captures/mobile-390.jpg).

## Fallback, ressources et performances

L'ancien projectile était dessiné procéduralement dans `EnemyAttacksView` : traînée de 17 unités, cercles superposés et bord orange. Ce code est intact. Si la nouvelle texture manque, si ses dimensions sont invalides, ou si la frame attendue est absente/mal découpée, le nouveau sprite reste masqué et le dessin procédural d'origine prend le relais. Aucun fallback vers une autre famille. Aucun chargement d'asset conceptuel en runtime.

Une seule sheet partagée par 24 sprites préalloués. Zéro création de sprite par tir ou par frame. Un petit objet de décalage est créé par nouvel emploi d'un slot, au maximum 24 objets retenus simultanément ; les tableaux sont fixes. Les maps de propriétaires sont purgées lorsqu'aucun ennemi ni projectile actif ne les référence. Les sprites sont masqués à chaque passe avant sélection, vidés au changement de Run et détruits à l'arrêt de scène. La texture partagée reste gérée par Phaser ; elle n'est pas détruite par chaque projectile.

Tests de pooling : identités inchangées sur 2 000 mises à jour, disparition du propriétaire, réutilisation d'un slot par une autre entité, reset, arrêt de scène. Les captures navigateur observent un pic de **24 sprites actifs** en groupe dense, 3 pour Lampiste isolé, 3/6 pour les fixtures du Major, et 0 pour les cinq spéciaux et le triple normal.

Mesures navigateur enregistrées dans [browser.json](production-v038c2-lampist-projectile/notes/browser.json) : 30 scènes × 480 ticks × 2 formats. P95 de l'appel de banc complet en groupe dense : environ **1,4 ms en 320** et **1,0 ms en 390** sur cette machine. Cette mesure inclut simulation, renderer et rapport DOM ; ce n'est ni un budget GPU isolé, ni un FPS Android. Aucun nombre d'octets de heap JavaScript n'est déduit artificiellement du nombre d'objets.

## Vérification

- **1 578 tests verts**, baseline 1 525 + 53 C2.
- Nouveau test d'intégrité : tous les anciens fichiers `src` restent identiques, sauf les ajouts exacts de preload et d'appel de renderer dans deux fichiers. Configurations, pools de collision, acteurs, directeurs, masters et sheets de personnages intacts.
- Même gameplay avec et sans dessin sur les tirs réels `light`, dont le chemin historique Major ; pools, dégâts, portée, vitesse, rayon, états de récupération et dangers comparés.
- Huit rotations × deux tailles, et huit sockets × deux tailles : position de naissance, proportions, miroir, convergence vers la position réelle et absence d'écriture gameplay vérifiés.
- Frames et boucles, corps stable, mouvement réduit, aucun rendu avant tir, texture absente, mauvaise taille, frame absente, mauvaises coordonnées, fallback et cleanup contrôlés.
- Contrats historiques conservés via inversion exacte des ajouts C2, sans recalcul de hashes. Le verrou d'octets C1b reçoit cet adaptateur ; ses 51 assertions sont conservées. Le contrôle C1c vérifie que l'adaptateur est la seule différence textuelle autorisée dans ce fichier.
- **320×568 et 390×844** : 30 scènes dans chaque format, huit angles, mouvement joueur, contact, longue portée, dense, comparaison standard/Major et spéciaux. Zéro erreur console sur les pages finales ; aucun débordement horizontal. Captures inspectées.

Fichiers runtime existants modifiés : `src/room-scene.js`, `src/enemies/view.js`. Nouveaux : `src/lampist-projectile-vfx.js` et `src/assets/lampist-light-shot-v038c2/shot-v1.svg`.

Tests/supports ajoutés ou adaptés : `tests/lampist-projectile-v038c2.test.js`, `tests/lampist-visual-delta.js`, `tests/instant-fire-compat.js`, `tests/enemy-instant-fire.test.js`, `tests/enemy-reconciliation.test.js`, `tests/grisoux-orb.test.js`, `tests/v038b3-authorized-files.js`. Aucun test supprimé ni marqué skip. Les changements aux anciens tests sont limités à la compatibilité exacte des verrous visuels / inventaire.

## Validation Android physique restante

1. Recharger le jeu depuis l'adresse locale habituelle ; vérifier la pointe lumineuse B sur les Lampistes, jamais le rond en chargement normal.
2. Observer les salves en haut/bas et diagonales, notamment le départ depuis le projecteur et le raccord court vers la trajectoire réelle.
3. Vérifier le groupe dense et le mouvement latéral du joueur : traînées courtes, tirs séparables, sols et passages sûrs visibles.
4. À courte distance, vérifier que la protection C1c reste perceptible, sans impact créé dans le joueur.
5. Tester le Major et le triple : Balayage, Mise en joue, Feux croisés et BLACKOUT restent inchangés. La comparaison du projectile agrandi se fait dans la fixture de galerie, car il n'est pas ajouté au cycle normal.
6. Contrôler la fluidité et le chargement sur le téléphone réel. Les tests Edge desktop en viewport mobile ne remplacent pas cette validation matérielle.

Aucun commit/push. Aucun nerf, changement de gameplay ou autre famille VFX. Arrêt après livraison.
