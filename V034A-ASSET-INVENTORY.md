# V0.34A — Inventaire des concepts ennemis et boss

Relevé du 13 octobre 2026. **17 entités uniques : 8 ennemis, 9 boss.** Les trois ennemis communs sont dessinés une fois, puis réutilisés dans les vues des trois zones. Les mêmes boss solo/triple ne sont pas dupliqués. Aucune entité Zone 4–6 produite.

Source de vérité : src/zones.js, world.js, tracks-waves.js, shaft-waves.js, enemies/registry.js, combat-appearances.js, shaft-art.js, shaft-actors.js, rail-bosses.js, boss-patterns.js. Les dimensions ci-dessous sont des unités dans le monde 450 × 800, jamais des rayons physiques.

| Zone | Nom | Rôle existant | Asset actuel | Taille actuelle = proposée | Nouveau concept | Statut | Priorité | Prêt pour animation |
|---|---|---|---|---|---|---|---|---|---|
| Z1, Z2, Z3 | Rat de galerie | Petite menace rapide de contact ; poursuite et débordement selon la pression de la vague. | `src/assets/combat-v020/rat.svg` | 42 × 36 | [rat.svg](v034a-visual-enemies-bosses/concepts/rat.svg) | Maître statique proposé, validation humaine attendue | P1 — acquis directionnels protégés | NON |
| Z1, Z2, Z3 | Mineur grisouteux | Poursuite lente et robuste ; menace de contact, sans nouvelle attaque d’outil. | `src/assets/combat-v020/miner.svg` | 62 × 66 | [miner.svg](v034a-visual-enemies-bosses/concepts/miner.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z1, Z2, Z3 | Foreuse autonome | Machine à distance ; garde une distance moyenne, télégraphie et alterne projectile simple et éventail de trois tirs. | `src/assets/combat-v020/drill.svg` | 58 × 50 | [drill.svg](v034a-visual-enemies-bosses/concepts/drill.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z1 | La Haveuse | Boss de charge rectiligne. La direction est verrouillée durant le télégraphe ; pas de suivi pendant la charge. | `src/assets/combat-v020/haveuse.svg` | 88 × 88 | [haveuse.svg](v034a-visual-enemies-bosses/concepts/haveuse.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z1 | Le Crachefer | Boss à projectiles : alternance de tirs simples, éventails et cercles de six à huit projectiles selon les états existants. | `src/assets/combat-v020/crachefer.svg` | 84 × 84 | [crachefer.svg](v034a-visual-enemies-bosses/concepts/crachefer.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z1 | L’Effondreur | Contrôle de zone par deux éboulements télégraphiés près du joueur et le long de sa trajectoire ; ce n’est pas une attaque de marteau au corps à corps. | `src/assets/combat-v020/effondreur.svg` | 86 × 86 | [effondreur.svg](v034a-visual-enemies-bosses/concepts/effondreur.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z2 | Wagon Fou | Menace de ligne : rail horizontal choisi près du joueur, télégraphe 1,1 s, charge droite verrouillée, arrêt à l'autre bord. | `src/assets/combat-v020/wagon.svg` | 59 × 52 | [wagon.svg](v034a-visual-enemies-bosses/concepts/wagon.svg) | Maître statique proposé, validation humaine attendue | P1 — acquis directionnels protégés | NON |
| Z2 | Draisine | Tireur mobile à distance160–205, repositionnement latéral et éventail de trois projectiles lents ±22°. Une seule émission remplace l'ancienne rafale de deux. | `src/assets/combat-v020/draisine.svg` | 58 × 53 | [draisine.svg](v034a-visual-enemies-bosses/concepts/draisine.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z2 | Le Chef de Gare | Boss de charge ; invocation d'un Wagon toutes les trois attaques, repli charge si aucun rail sûr disponible. | `src/assets/combat-v020/stationmaster.svg` | 82 × 86 | [stationmaster.svg](v034a-visual-enemies-bosses/concepts/stationmaster.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z2 | La Locomotive | Boss lourd alternant bélier verrouillé et poche de vapeur frontale. Machine lente entre attaques. | `src/assets/combat-v020/locomotive.svg` | 88 × 88 | [locomotive.svg](v034a-visual-enemies-bosses/concepts/locomotive.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z2 | L’Aiguilleur | Contrôle de zone : alternance rails horizontaux/verticaux, tirs simples/éventail/cercle. Croix rare sous50% en solo seulement ; un rail au triple et aucune croix finale. | `src/assets/combat-v020/switchman.svg` | 86 × 86 | [switchman.svg](v034a-visual-enemies-bosses/concepts/switchman.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z3 | Foreur de fond | Approche lourde puis charge rectiligne. Préparation 1,3 s, ruée 320 u/s pendant 1,15 s, arrêt à la paroi. Aucun tir à distance. | Procédural `src/shaft-art.js` → `deepdriller` | 60 × 48 | [deepdriller.svg](v034a-visual-enemies-bosses/concepts/deepdriller.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z3 | Sondeur | Machine de distance : reste vers 190–245 u du joueur, se replace latéralement et recule. Son attaque est une zone de sonde au sol à la position verrouillée du joueur, rayon 36, télégraphe 1,5 s puis danger 0,7 s. Ce n’est pas un lance-projectiles. | Procédural `src/shaft-art.js` → `surveyor` | 44 × 52 | [surveyor.svg](v034a-visual-enemies-bosses/concepts/surveyor.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z3 | Grisouteux | Poursuite rapide, puis explosion locale télégraphiée autour de lui à portée proche. Rayon de danger 62, warning 1,5 s, activité 0,7 s. L’attaque ne le tue pas : ce n’est pas un kamikaze. | Procédural `src/shaft-art.js` → `gasminer` | 42 × 50 | [gasminer.svg](v034a-visual-enemies-bosses/concepts/gasminer.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z3 | Le Cageur | Boss vague 5 et triple final. Alterne charge verrouillée, impact devant lui et câble vertical au sol. Charge 275 u/s sur 0,55 s ; impact à 85 u devant, rayon 36 ; câble de 180 u sur demi-largeur 14. | Procédural `src/shaft-art.js` → `cager` | 84 × 84 | [cager.svg](v034a-visual-enemies-bosses/concepts/cager.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z3 | Le Compresseur | Boss vague 10 et triple final. Alterne vapeur en éventail, cercle de projectiles et pression au sol. Cercle 6 projectiles, parfois 8 sous 50 % hors final ; pression rayon 52 pendant 1,4 s après préparation. | Procédural `src/shaft-art.js` → `compressor` | 84 × 84 | [compressor.svg](v034a-visual-enemies-bosses/concepts/compressor.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |
| Z3 | Le Grisou | Boss vague 15 et triple final. Alterne poches de gaz autour de la position joueur, explosion locale et projectile énergie simple. Deux poches hors final, une en final ; pas de cercle propre à ce boss dans le code actuel. | Procédural `src/shaft-art.js` → `firedamp` | 84 × 84 | [firedamp.svg](v034a-visual-enemies-bosses/concepts/firedamp.svg) | Maître statique proposé, validation humaine attendue | P0 | NON |

## Dimensions, orientations et collisions conservées

Chaque master est un SVG transparent 512 × 512, avec un repère de dessin 128 × 128. Il sera rasterisable plus tard, après validation ; aucune texture runtime n'est chargée aujourd'hui. Le même master sert à la grande vue, la réduction et la silhouette, sans variante retouchée spécialement pour la planche.

| Nom | Origine X / Y actuelle | Orientation actuelle | Rayon physique | Cadre écran 320 × 568 | Cadre écran 390 × 844 |
|---|---|---|---:|---|---|
| Rat de galerie | .5 / 0.54 | travel | 10 | 29.8 × 25.6 px | 36.4 × 31.2 px |
| Mineur grisouteux | .5 / 0.62 | flip | 20 | 44.0 × 46.9 px | 53.7 × 57.2 px |
| Foreuse autonome | .5 / 0.52 | rotate | 16 | 41.2 × 35.5 px | 50.3 × 43.3 px |
| La Haveuse | .5 / 0.5 | rotate | 30 | 62.5 × 62.5 px | 76.3 × 76.3 px |
| Le Crachefer | .5 / 0.5 | rotate | 28 | 59.6 × 59.6 px | 72.8 × 72.8 px |
| L’Effondreur | .5 / 0.5 | rotate | 28 | 61.1 × 61.1 px | 74.5 × 74.5 px |
| Wagon Fou | .5 / 0.52 | rail | 18 | 41.9 × 36.9 px | 51.1 × 45.1 px |
| Draisine | .5 / 0.52 | rotate | 17 | 41.2 × 37.6 px | 50.3 × 45.9 px |
| Le Chef de Gare | .5 / 0.61 | flip | 26 | 58.2 × 61.1 px | 71.1 × 74.5 px |
| La Locomotive | .5 / 0.5 | rotate | 32 | 62.5 × 62.5 px | 76.3 × 76.3 px |
| L’Aiguilleur | .5 / 0.6 | flip | 27 | 61.1 × 61.1 px | 74.5 × 74.5 px |
| Foreur de fond | .5 / 0.5 | rotate | 20 | 42.6 × 34.1 px | 52.0 × 41.6 px |
| Sondeur | .5 / 0.5 | fixed | 16 | 31.2 × 36.9 px | 38.1 × 45.1 px |
| Grisouteux | .5 / 0.5 | fixed | 15 | 29.8 × 35.5 px | 36.4 × 43.3 px |
| Le Cageur | .5 / 0.5 | fixed | 29 | 59.6 × 59.6 px | 72.8 × 72.8 px |
| Le Compresseur | .5 / 0.5 | fixed | 31 | 59.6 × 59.6 px | 72.8 × 72.8 px |
| Le Grisou | .5 / 0.5 | fixed | 29 | 59.6 × 59.6 px | 72.8 × 72.8 px |

Facteur 320 : min(320/450, 568/800) = .710. Facteur 390 : 390/450 = .8667, monde affiché sur environ 693 px de haut. Les pixels indiquent le cadre entier ; l'encre occupée est plus petite selon les marges de chaque design.

Les anciennes images Z3 de la galerie sont des enregistrements SVG des commandes Graphics originales de shaftTextures(), aux dimensions natives. Elles ne sont pas des propositions ni des textures de secours. Les anciennes images Z1–2 sont les vrais SVG actuellement chargés. [Données structurées](v034a-visual-enemies-bosses/entities.json).

## Points de source à préserver

- Mineur grisouteux (miner) et Grisouteux (gasminer) sont deux ennemis différents.
- Draisine : éventail de trois, pas l'ancienne rafale double mentionnée dans une constante historique.
- Sondeur : impact ciblé au sol, aucun tir de projectile dans son pattern actuel.
- Grisouteux : explosion locale ; il ne se sacrifie pas.
- Aiguilleur : croix rare solo sous 50 % ; la croix est désactivée au triple actuel.
- Le Grisou : gaz, explosion, énergie simple ; le cercle est un pattern du Compresseur.

Tous les statuts « prêt pour animation » restent NON : validation humaine obligatoire, puis chantier ultérieur distinct. Aucun lot V0.34B n'a commencé.
