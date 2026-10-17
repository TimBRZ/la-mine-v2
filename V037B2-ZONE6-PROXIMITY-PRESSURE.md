# V0.37B.2 — pression de proximité des boss Zone 6

## Périmètre et résultat

Les trois boss réduisent la distance pendant leurs déplacements et leurs préparations compatibles. Aucun pattern supplémentaire, aucune modification de HP, dégâts, hitbox, cadence, récompenses, masters ou sheets. Les plafonds existants et les fins de séquence immobiles sont conservés. Aucun commit/push. V0.37C reste une spécification future.

Baseline : **1124/1124**. Résultat : **1140/1140**, dont 16 nouveaux tests. Les tests antérieurs restent intacts ; seul leur registre des nouveaux modules autorisés accueille boss-pressure.js.

## Distances et mouvement

Distances centre à centre, en pixels de l'arène logique 450 × 800 (pas en pixels CSS du téléphone).

| Boss | TOO_CLOSE | GOOD_RANGE | TOO_FAR | Marche de base utilisée |
|---|---:|---:|---:|---:|
| Maître de Four | < 115 | 115–190 | > 190 | 95 % de 92 px/s |
| Marteau-Pilon | < 75 | 75–130 | > 130 | 72 % de 98 px/s |
| Chaudière | < 90 | 90–155 | > 155 | 100 % de 96 px/s |

Les stats sources restent inchangées. Les trois classes déclenchent approche, placement latéral ou recul. Le presseur vise le bas de sa plage ; les autres visent son milieu. Une décision de marche est mémorisée 0,55 s. Pendant une attaque, direction et destination sont fixées à la préparation : aucun suivi permanent, aucune téléportation. Si un autre boss bloque l'approche, le contrôleur choisit un détour rectiligne à la préparation, puis le verrouille.

Anti-kite : après 2,5 s au-delà de sa plage, PRESSURE_APPROACH peut durer au plus 2,5 s. Bonus **+15 % sur la marche seulement**, jamais cumulé avec une accélération de phase II. Sortie au premier tick dans la plage, recharge 3 s. Aucun bonus de dégâts. Les coefficients de marche pendant les attaques restent entre 35 % et 60 %, sans ce bonus.

Un rôle PRESSURE BOSS tourne toutes les 5 s si le porteur reste disponible : Four → Chaudière → Pilon. Une récupération ou un ancrage impose un relais vers un boss disponible. Lorsque les trois sont loin, une approche est choisie dès le premier tick disponible. Cela ne casse jamais une recovery, un ultime ancré ni une frappe verrouillée. Sans boss disponible, le rôle attend ces fenêtres obligatoires plutôt que de les interrompre.

## Mobilité par boss

- **Four** : secteurs 40 %, marche à blanc 45 %, cône et rotation 35 %. Limites de trajet 150 / 150 / 80 / 140 px, réduites par la distance au joueur et les murs. Cône : tracking initial 0,35 s puis angle verrouillé ; le corps et l'origine du cône continuent une translation rectiligne. Le centre du four tournant dérive sur le même segment connu du contrôle d'esquive. Les plaques et zones déjà posées ne poursuivent personne.
- **Pilon** : marche lourde avant la frappe ciblée ; dès la marque, immobilité. Double battue : déplacement 35 % entre impacts. Rythme : deux fenêtres entre frappes, jusqu'à 30 px au total, finale ancrée. Contre-coup : pas limité à 12 px après la première frappe et avant l'activation de l'onde. En combo/LIGHT, courte approche de préparation à 35 %, arrêt avant la marque différée ou l'impact. Le même coefficient lourd est réutilisé, aucune course.
- **Chaudière** : soupapes 55 %, purge 35 % constants, surpression 60 %, onde 40 % avant émission. Trajets plafonnés à 140 / 140 / 130 / 35 px et à la distance utile. Les jets et la purge entraînent leur origine, sans changement des axes verrouillés. Les trois zones de surpression restent simultanées comme dans V0.37B : la machine avance pendant la séquence, sans transformer le pattern en trois attaques successives.

Les translations sont constantes puis s'arrêtent à destination, sans saut de position. Les bornes évitent de passer sur la position initiale du joueur. Les ultimes restent ancrés. Les fins MAJOR sont immobiles **1,10 s / 0,95 s en phase II**, combos **1,20 s**, ultimes **1,50 s**. Les LIGHT gardent leur récupération historique de **0,35 s**.

À courte distance, un choix sur trois favorise un pattern existant : secteurs/marche, contre-coup/frappe ciblée, soupapes/onde. L'ultime solo et le rythme de phase II gardent leur priorité. La cadence LIGHT n'a pas été augmentée.

## Méthode de comparaison

Snapshot complet avant patch : v037b2-validation/before/src. Même pilote déterministe, armes, dix seeds, positions initiales et choix de build. Le pilote avant importe la projection des dangers de son snapshot : il ne projette pas l'ancienne décélération avec la nouvelle loi de déplacement. Rangs 2 pour seeds 1–5, rangs 5 pour 6–10. Le pilote consulte les dangers visibles et choisit parmi 32 directions ; ce n'est pas un joueur humain ni un test Android physique.

Le diagnostic de 60 s conserve les trois boss en vie, désactive les tirs et les dégâts reçus pour mesurer un même combat complet. Les 30 triples et neuf solos réels n'ont ni invulnérabilité ni dégâts modifiés. Les mesures de proximité des 30 triples portent uniquement sur la phase où les trois sont encore vivants, sauf la distance moyenne, calculée sur les boss vivants pendant tout le combat.

## Triple instrumenté — 60 secondes

| Mesure | V0.37B.1 | V0.37B.2 |
|---|---:|---:|
| Distance moyenne (px) | 208.97 | 191.60 |
| Au moins un boss à ≤ 140 px (s) | 20.37 | 40.55 |
| Trois boss au-delà de leurs plages préférées (s) | 36.27 | 5.02 |
| Trois boss à > 230 px chacun (s) | 1.63 | 1.42 |
| Au moins un rapprochement effectif (s) | 15.92 | 31.30 |
| Rapprochement avec attaque/préparation (s) | 11.93 | 27.85 |
| Attaques démarrées | 39.00 | 40.00 |
| Deux MAJOR effectivement actives (s) | 5.67 | 5.67 |
| Épisodes de chevauchement MAJOR | 8.00 | 8.00 |
| Fenêtre maximale sans danger actif (s) | 3.78 | 3.78 |

Le temps « tous loin » selon les plages de jeu recule de **86.17 %**. Le seuil sévère commun >230 px était déjà rare avant : sa baisse est seulement 0.22 s, principalement au début. Ces deux mesures sont distinguées pour ne pas surinterpréter le résultat.

Danger effectivement actif avec 0 / 1 / 2 / 3 propriétaires : avant 25.92 / 18.62 / 12.17 / 3.30 s ; après 25.83 / 18.60 / 12.38 / 3.18 s. Les « deux MAJOR actives » excluent les seules réservations de slots.

Combos : quatre Forge sous pression, quatre Pilon à blanc, quatre Pression cadencée dans chaque version. Attaques : 39 → 40, sans réduction de cooldown. Recoveries mesurées par boss : furnace 9.65 s, hammer 8.40 s, boiler 8.40 s ; identiques au diagnostic avant.

PRESSURE_APPROACH présent pendant 30.35 s (au moins un boss ; inclut les phases où le bonus est en attente). Rôle de presseur : furnace 24.00 s, hammer 16.32 s, boiler 18.17 s. Rapprochement effectif : mouvement du boss projeté vers le joueur >0,05 px/tick ; les déplacements du joueur ne suffisent pas à le compter.

Fréquence des approches : 138 → 42 débuts d'épisodes en 60 s. Le nombre baisse, mais leur durée cumulée augmente : les anciens allers-retours latéraux fragmentaient la mesure. Association approche effective + attaque/préparation : 46.42 % du temps. Elle progresse fortement mais reste sous une majorité stricte dans ce scénario ; la présence d'un boss proche atteint 67.58 %.

Fermeture d'un écart : déclenchement >280 px, fin ≤180 px. Avant : 22.35, 37.82 s ; après : 7.53, 16.25, 5.68 s. Épisodes non appariés, dépendants du mouvement du pilote : indicateur de tendance, pas garantie de délai maximal.

| Boss | Distance moyenne avant / après | Rapprochement avant / après |
|---|---:|---:|
| furnace | 225.54 / 169.47 px | 4.27 / 17.17 s |
| hammer | 169.66 / 222.19 px | 8.32 / 15.45 s |
| boiler | 231.71 / 183.13 px | 5.40 / 15.75 s |

Le Pilon se rapproche plus souvent mais sa distance moyenne augmente dans ce scénario : le joueur change de position sous la pression des deux autres. Son rôle lourd est conservé, pas de compensation artificielle en vitesse.

Temps cumulés boss-secondes à ≤140 / 140–230 / >230 px : avant 22.80 / 88.37 / 68.83 ; après 56.27 / 70.18 / 53.55 (total 180 boss-secondes).

## 30 triples par version

| Mesure | V0.37B.1 | V0.37B.2 |
|---|---:|---:|
| Victoires / 30 | 30.00 | 30.00 |
| Durée moyenne (s) | 82.11 | 84.94 |
| Distance moyenne (px) | 203.76 | 180.61 |
| Dégâts reçus moyens | 0.13 | 0.42 |
| Attaques par minute | 28.76 | 33.84 |
| Tous au-delà de leur plage (s cumulées) | 644.57 | 310.12 |
| Au moins un proche (s cumulées) | 412.67 | 1135.22 |

Phase trois vivants : 1137.47 → 1761.18 s cumulées. Part « tous au-delà de leur plage » : 56.67 % → 17.61 %. Proximité ≤140 px : 36.28 % → 64.46 %.

| Arme | Victoires avant / après | Durée avant / après | Distance avant / après | Dégâts reçus avant / après |
|---|---:|---:|---:|---:|
| shotgun | 10/10 / 10/10 | 66.68 / 57.55 s | 166.94 / 156.40 px | 0.20 / 0.10 |
| smg | 10/10 / 10/10 | 82.76 / 95.13 s | 209.28 / 187.92 px | 0.15 / 0.65 |
| grisoux | 10/10 / 10/10 | 96.90 / 102.15 s | 235.04 / 197.52 px | 0.05 / 0.50 |

**Limite d'équilibrage** : 30/30 victoires du pilote prédictif restent 30/30. Cela prouve la faisabilité, pas un niveau de difficulté humain. La proximité aide aussi le fusil : ses combats raccourcissent. Aucun assouplissement automatique ni hausse des dégâts n'a été appliqué. Le test humain Android reste nécessaire pour juger la pression ressentie.

## Solos

| Boss | Arme | Avant | Après | Durée avant / après |
|---|---|---|---|---:|
| furnace | shotgun | won | won | 29.02 / 25.50 s |
| furnace | smg | won | won | 37.07 / 36.68 s |
| furnace | grisoux | won | won | 42.88 / 42.23 s |
| hammer | shotgun | won | won | 28.50 / 27.98 s |
| hammer | smg | won | won | 49.20 / 48.75 s |
| hammer | grisoux | won | won | 52.13 / 50.95 s |
| boiler | shotgun | won | won | 44.43 / 31.68 s |
| boiler | smg | won | won | 44.80 / 52.70 s |
| boiler | grisoux | won | won | 56.58 / 59.37 s |

## Sécurité, tests et captures

Plafonds observés sur les 30 triples : **2 MAJOR**, **5 zones**, **3 chaudes**, **0 projectiles hostiles** ; limite de projectiles 24 conservée. Aucun wagon ajouté. Admission temporelle des dangers et grande zone froide connectée conservées. Les projections de cône, jets et rotations connaissent leur translation verrouillée.

Le contrôleur réserve 34 px entre les corps pour laisser passer le joueur de diamètre 26 px. Un test de 60 s vérifie à chaque tick une sortie corporelle de 65 px parmi 32 directions, ainsi que les plafonds, déplacements bornés et recoveries immobiles. Ce contrôle et la route temporelle ne constituent pas une preuve exhaustive de toutes les positions humaines possibles.

16 nouveaux tests : distances, approche/recul, bonus temporaire et sortie, hiérarchie des vitesses, rotation/transfert, trois boss loin, trajectoires verrouillées, deux intervalles du Pilon, couloir entre corps, pré-marque, triple 60 s et intégrité de tous les autres fichiers source. **1140/1140 réussis**.

18 captures navigateur : neuf situations à **320×568** et **390×844**, dont chaque boss mobile, presseur, deux majeures + presseur, trois combos et récupération. Les annotations de presseur appartiennent uniquement au panneau QA, pas à l'UI joueur.

Deux observations supplémentaires : 390 px : 63.45 s, moyenne 0.42 ms/mise à jour, pointe 8.10 ms ; 320 px : 63.58 s, moyenne 0.39 ms/mise à jour, pointe 12.50 ms. Ces coûts sont ceux du navigateur de bureau avec viewport mobile et rendu Phaser, pas des FPS mesurés sur téléphone. **Aucune erreur/warning console** sur les pages finales.

## Fichiers

Production modifiée : src/forge/boss-director.js, src/forge/boss-mobility.js, src/forge/dungeon-boss.js. Nouveau : src/forge/boss-pressure.js. Aucun fichier source supprimé. Assets, masters et autres zones identiques octet pour octet au snapshot.

Tests : tests/v037b2-pressure.test.js ; registre tests/v037b-authorized-files.js. Validation et données brutes : v037b2-validation/. Animation future : V037C-ANIMATION-REQUIREMENTS.md, addendum V0.37B.2 seulement.

Ouvrir [la galerie](v037b2-validation/gallery.html) ou le serveur QA http://127.0.0.1:5211/v037b2-validation/gallery.html. Le prototype de QA n'est pas un réglage joueur et garde son origine locale isolée.

**Arrêt après livraison V0.37B.2. Aucun début de V0.37C, aucune sheet, aucun commit/push.**
