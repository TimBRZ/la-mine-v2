# La Mine V2 — V0.33 : production visuelle

Validation du 13 octobre 2026. Première production après la bible V0.32 : héros, trois armes et effets de combat. Aucun changement de règles, aucune intervention CGWeb, aucun commit/push. V0.34 n'est pas commencée.

## Résultat et périmètre

Le héros est un mineur trapu : casque avec lampe, protection d'épaule ocre, tenue de travail pétrole, sac-batterie et bottes. Le Fusil est massif, la Mitraillette compacte, le Grisou X possède un cœur mint visible, une conduite cuivre et une bouche fourchue. Les dessins sont vectoriels locaux, sans image distante, filtre, halo flou ni dépendance supplémentaire. Leur rasterisation utilise le loader SVG Phaser déjà présent.

Les sous-agents ont produit les lots personnage/animation, armes/VFX et direction artistique/Technical Art. Leurs notes et générateurs sont conservés dans `production-v033/`. Leurs arbitrages concernent la palette, les contours, les marges de cellules, les pivots et la lisibilité aux tailles réelles.

Seuls `src/room-scene.js` et `src/effects.js` changent le rendu existant. Deux modules de présentation sont ajoutés : `src/hero-animation.js` et `src/weapon-visuals.js`. Les autres modifications de production sont les libellés de version (`index.html`, `src/menu/main-menu.js`, `server.mjs`), `package.json`, `package-lock.json` et l'entrée README. Les huit nouveaux fichiers sous `src/` sont explicitement autorisés dans les gardes de tests V0.33.

Le snapshot `production-v033/before/` et son manifeste `before-hashes.json` conservent 171 fichiers de référence. Le test de périmètre vérifie les octets de tous les fichiers hors liste autorisée : simulation, statistiques V0.31, collisions, RNG, cadence, portée, progression, sauvegarde, classement, ennemis, boss, Ravens, Rat/Wagon, zones et anciens assets. Aucun ancien asset n'est supprimé ou retouché. Les documents V0.32 restent historiques et intacts.

## Liste exacte des nouveaux assets

Tous se trouvent dans `src/assets/combat-v033/` ; fond transparent.

| Fichier | Dimensions source | Usage | Octets |
|---|---:|---|---:|
| `hero-sheet.svg` | 640 × 512 | Héros animé, chargé en jeu | 81 966 |
| `hero-idle.svg` | 128 × 128 | Référence/galerie, non préchargée en jeu | 4 166 |
| `shotgun.svg` | 128 × 128 | Fusil à pompe tenu | 2 223 |
| `smg.svg` | 128 × 128 | Mitraillette tenue | 2 067 |
| `grisoux.svg` | 128 × 128 | Grisou X tenu | 2 870 |
| `vfx-atlas.svg` | 512 × 128 | Atlas partagé des tirs/impacts | 16 329 |
| **Total** | **6 fichiers** | **5 textures runtime** | **109 621** |

Les anciens `combat-v020/hero.svg`, `shotgun.svg`, `smg.svg`, `grisoux.svg` sont conservés et préchargés pour le repli. Les projectiles et effets procéduraux restent disponibles. Les images de sélection/menu n'ont pas été refaites : seule l'arme tenue en combat utilise le nouveau dessin.

## Sheet du héros

20 cellules uniformes **128 × 128**, cinq colonnes et quatre lignes, ordre gauche → droite puis haut → bas. Noms logiques documentés dans la galerie ; indices Phaser 0–19. Une texture partagée, aucun canvas par pose. Découpe et dimensions vérifiées à l'enregistrement.

| État | Indices | Frames | Cadence visuelle | Durée |
|---|---|---:|---:|---:|
| Idle | 0–3 | 4 | 4 fps | boucle 1 s |
| Run | 4–9 | 6 | 12 fps | boucle 500 ms |
| Shoot | 10–12 | 3 | 20 fps | 150 ms |
| Hit | 13–14 | 2 | 16 fps | 125 ms |
| Death | 15–19 | 5 | 9 fps | environ 556 ms |

Taille affichée inchangée **46 × 52 unités**, origine **(.5, .62)**. Le corps conserve le miroir horizontal de la visée, l'arme sa rotation continue. Pas de huit directions. Les genoux, bras et bottes changent de pose en course ; l'animation n'est pas un simple changement d'échelle. Le pivot et le canevas restent constants. Le C2G est un micro-détail décoratif, illisible à petite taille.

Les événements réels `shot` et `hurt` déclenchent les poses. Priorité : mort, réaction de hit, course, tir, idle. Le mouvement interrompt la pose de tir immédiatement. L'animation ne retarde aucune action. La mort continue visuellement après le résultat, sans tick de simulation ni seconde attribution de récompense ; l'overlay de résultat peut la masquer en partie. En réduction des mouvements, les états sont des poses fixes et la mort affiche sa dernière image.

## Armes et atlas d'effets

Armes affichées à 34 × 34 (Fusil/Grisou X) et 32 × 32 (Mitraillette). Origine **effective tenue (0, .45)**, conservée par `drawWeapon()` ; le catalogue générique indique .5 en X mais ce point est remplacé par l'ancrage tenu existant. Recul graphique seulement : facteur 1,2 Fusil, 1 Mitraillette, 1,1 Grisou X. Aucune écriture dans la position du joueur ni les paramètres de l'arme.

Atlas VFX : 41 cellules utiles **32 × 32**, 16 colonnes, quatre lignes (cases restantes transparentes). Frames nommées `type-index`, base zéro. Origin .5/.5 pour effets et projectiles ; 0/.5 pour flashes.

| Série | Cellules | Frames | Durée visuelle | Taille logique |
|---|---|---:|---:|---:|
| muzzle-shotgun | 0–2 | 3 | 65 ms | 32 × 26 |
| muzzle-smg | 3–4 | 2 | 35 ms | 19 × 16 |
| muzzle-grisoux | 5–7 | 3 | 70 ms | 28 × 24 |
| impact-ballistic | 8–11 | 4 | 120 ms | 23 × 23 |
| impact-energy | 12–16 | 5 | 170 ms | 27 × 27 |
| overload-energy | 17–22 | 6 | 220 ms | 40 × 40 |
| spark | 23–26 | 4 | 140 ms | 10 × 10 |
| projectile-energy | 27–30 | 4 | boucle 160 ms | 24 × 24 |
| dust | 31–34 | 4 | 220 ms | 18 × 18 |
| conduction | 35–38 | 4 | 130 ms | 26 × 26 |
| projectile-shotgun | 39 | 1 | fixe | 18 × 18 |
| projectile-smg | 40 | 1 | fixe | 24 × 24 |

Le flash reste visible uniquement pendant le timer de tir actuel. Le projectile énergie utilise son âge dérivé de sa distance parcourue ; trajectoire, vitesse, pénétration et dégâts restent ceux de la simulation. Les impacts sont dessinés au bord d'entrée de la silhouette pour rester visibles sous l'acteur, sans déplacer la collision. La conduction accompagne la poursuite après impact et l'Arc existant ; la Surcharge accompagne les événements existants. La poussière de course est discrète, toutes les 180 ms, à 65 % de sa taille nominale. La série `spark` est produite mais réservée : les petites particules mobiles conservent le système procédural existant pour limiter le changement.

Pool partagé inchangé : **48 effets**, **84 vues de projectiles alliés**. Un pool plein ignore le décor supplémentaire. RNG artistique séparé. Les effets, flashes et projectiles alliés passent à profondeur **7**, sous les télégraphes existants **8** ; acteurs et projectiles hostiles conservent leurs couches. Aucun nouveau VFX n'est ajouté au-dessus des dangers. Les flashes ennemis existants restent le signal principal du hit ; aucun stun ajouté.

## Fallback

Une sheet absente, de mauvaise dimension ou un rectangle incohérent est refusé. Le héros reprend le SVG V0.20 puis le dessin procédural si nécessaire. Armes : ancien SVG puis dessin de secours. VFX : `muzzle`, `pellet`, `energy`, `spark`, `ring`. Un clip qui perd sa frame pendant sa vie est retiré proprement. Les tests couvrent textures manquantes et atlas tronqués ; les anciens assets ne dépendent pas des nouveaux. Le repli a aussi été vérifié en navigateur : cinq textures refusées par le serveur QA, ancien héros visible, tir/impact/kill réels, aucun plantage (voir browser-fallback.json).

## Tests

**832/832 réussis**, aucun test supprimé : 805 existants et 27 nouveaux (9 héros, 6 armes/atlas, 12 intégration). Les gardes historiques ont uniquement été étendues à la liste explicite V0.33 et aux libellés de version. Preuve : [sortie complète](production-v033/final-tests.txt).

Les neuf replays à pas fixe comparent les événements, joueur, projectiles complets, cooldown et recoil entre les imports du snapshot et la production, avec les mêmes seeds/entrées, sur Zones 1/4/6 × trois armes. Les objets de classes importés depuis deux copies ont des prototypes différents : les pools sont comparés par sérialisation exhaustive de leurs données, sans ignorer les champs. Tests supplémentaires : budget d'effets, expiration, RNG indépendant et mort sans simulation/récompense.

Blocs : [27 tests ciblés](production-v033/new-tests.txt), [premier bloc d'intégration](production-v033/integration-block-tests.txt). La première exécution de référence a rencontré l'interdiction réseau du sandbox, puis le garde historique de nombre de fichiers pendant l'ajout des nouveaux assets. Ces sorties sont conservées ; elles ne sont pas présentées comme une référence verte. La suite finale autorisée avec serveurs HTTP temporaires passe intégralement.

## Validation navigateur et limites

Recette isolée dans `production-v033/browser-qa.js`, serveur local 5183, profil QA sur cette origine distincte, aucune utilisation de la sauvegarde 5177. Le jeu normal n'importe pas cette recette. Comparaison contre les vrais renderers du snapshot, puis production. Les contrôles de pose sont explicitement mis en scène ; les combats utilisent `Run`, les collisions, ennemis et projectiles réels avec le pilote de test existant.

Neuf combats de 12 secondes pour la référence 390 × 844, neuf après intégration 390 × 844, puis neuf après intégration 320 × 568. Zones 1, 4 et 6, chacune avec les trois armes : déplacements, arrêts, tirs, impacts et morts ennemies observés. Ce sont des séquences de combat, pas des runs complètes de vingt vagues. Les variations des résultats entre captures proviennent des pas de temps réels variables ; l'identité de simulation est prouvée par les replays fixes, pas par ces compteurs.

Les détails casque/lampe, épaule, bottes restent repérables ; les trois armes se distinguent par forme et émission. Le flash SMG est fin, celui du Fusil bref et plus large, l'énergie Grisou X mint reste distincte des ambres/corails hostiles. Les zones dangereuses restent lisibles dans les captures mobiles. La galerie fournit les silhouettes monochromes sur fond sombre et les vingt poses pour contrôler le rognage. Un screenshot ne démontre pas à lui seul la fluidité : les mesures ci-dessous complètent l'inspection.

**Limites :** viewports mobiles sous Chromium desktop, aucun Android physique testé dans cette étape ; pas de mesure fiable du GPU/heap mobile. La mort se déroule derrière le résultat existant. Le rendu reste en trois-quarts avec miroir ; aucune vue dos. Les armes de menu sont préservées. Les séries VFX restent modestes, sans refonte des ennemis ou du décor. Les effets d'Arc/Surcharge dépendent des perks existants et ne sont pas tous déclenchés dans les neuf séquences courtes ; leurs frames et leur routage ont été contrôlés en code.

## Performances et poids

Images physiques : **33 → 39**, **2 247 825 → 2 357 446 octets**, ajout **109 621 octets (+4,88 %)**, dont 4 166 octets de référence non chargée en jeu. Transfert runtime supplémentaire nominal **105 455 octets** hors compression HTTP. Cinq textures runtime ajoutées, aucune duplication par frame. Mémoire RGBA théorique supplémentaire : héros 1 310 720 + trois armes 196 608 + atlas 262 144 = **1 769 472 octets (1,6875 MiB)**, anciens secours conservés. Il s'agit d'un calcul de surfaces, pas d'une mesure mémoire réelle.

Les mesures détaillées par combat sont dans [avant](production-v033/browser-before.json), [après 390](production-v033/browser-after-390.json), [après 320](production-v033/browser-after-320.json). Le comptage de textures du navigateur inclut les textures de texte/UI variables ; l'ajout statique fiable est +5. Les intervalles sont ceux du navigateur sur écran PC à environ 165 Hz, malgré la cible Phaser 60 : ne pas convertir cela en promesse FPS Android. Le temps CPU comprend le pilote de test et le callback de rendu, pas l'ensemble du travail GPU.

| Mesure (9 combats chacune) | Intervalle frame P95 (ms) | CPU callback P95 (ms) | Frames >50 ms | Pic effets / 48 |
|---|---:|---:|---:|---:|
| Avant 390 × 844 | 6.07–6.08 | 1–2.1 | 0 | 19 |
| V0.33 390 × 844 | 6.08–6.09 | 0.9–2 | 0 | 24 |
| V0.33 320 × 568 | 6.08–6.09 | 0.8–1.6 | 0 | 24 |


## Captures avant/après

Le détail des preuves est dans [production-v033/CAPTURES.md](production-v033/CAPTURES.md). [Galerie de contrôle](production-v033/gallery.html) : anciennes/nouvelles silhouettes, armes, poses et dimensions. Les captures de pose ont un cadrage identique par couple ; les combats peuvent diverger légèrement selon le timestep.

| Avant : combat Grisou X | Après : combat Grisou X |
|---|---|
| ![Avant](production-v033/captures/before-combat-grisoux-390.jpg) | ![Après](production-v033/captures/after-combat-grisoux-390.jpg) |

## Plan V0.34 — préparation seulement

1. Inventorier les silhouettes ennemis/boss Zones 1–3 avec priorité danger, et conserver explicitement les Rat/Wagon déjà validés.
2. Proposer les poses et palettes par famille dans une planche de revue ; garder les états/hitboxes/patterns existants.
3. Produire une famille à la fois avec sheets bornées, repli et tests, puis validation 320/390 en combat réel.
4. Intégrer les boss séparément ; revalider les triples et le budget textures/effets avant de généraliser.

Aucun asset ennemi/boss V0.34 n'est produit ici. Arrêt après cette livraison.
