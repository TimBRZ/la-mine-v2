# La Mine V2 — V0.15 : équilibre des armes contre les boss

Projet exclusif : C:\LaMineV2\la-mine-v2-v01. Aucun commit/push. Arrêt après V0.15, aucune V0.16.

La V0.15 ajuste les dégâts contre les boss et ajoute un petit indicateur Focus. Les vingt vagues, spawns, arène, anti-camping, PV et comportements des boss restent ceux de V0.14. Perks disponibles, choix du Porion, drops, économie, Atelier, Relève, sauvegarde, DA et logique des menus sont conservés. Seul le badge de version des écrans existants change. Aucun lien avec CGWeb, aucune modification du backend.

## Diagnostic des multiplicateurs

Le build V0.14 mesuré à 22 s était Détente ×2, Chevrotine ×1, Plaques, Bottes et Double Canon. Il ne possédait ni Canon scié ni À bout portant : leur cumul n’explique donc pas cette mesure.

- Chevrotine : 11 plombs au lieu de 7, cadence ×0,8, soit environ ×1,257 de débit théorique si tous les plombs touchent. Deux rangs : 15 plombs et cadence ×0,64. La dispersion élargie réduit parfois le rendement réel.
- Détente ×2 : délai ×0,75², donc débit ×1,778.
- Double détente : 30 puis 60 % de chance, au maximum une salve supplémentaire. Double Canon remplace la chance par 100 %, sans addition ni récursion.
- Chevrotine ×1 + Détente ×2 + Double Canon produit environ **×4,47** le débit idéal du Fusil de base, avant pertes de portée/dispersion.
- Atelier : dégâts ×(1 + 0,05 × niveau puissance), délai ×(1 − 0,05 × niveau mécanique). Aux niveaux uniformes 2 et 5 : débit ×1,222 et ×1,667 ; le cumul précédent atteint ×5,46 et ×7,45. Aucun bonus Atelier ne change.
- Canon scié ajoute +60 % par rang à moins de 70 unités, et réduit la portée de 20 % par rang. À bout portant ajoute +100 % : addition, donc ×3,2 au maximum, pas multiplication récursive. Le falloff dépend toujours de la distance parcourue.
- Grisou instable : explosion à chaque mort, une fois par victime. Il peut accélérer la fin du trio, mais ne fait rien avant la première élimination et était absent du build à 22 s. Il reste inchangé.

## Réglages V0.15

Coefficients centralisés dans src/boss-weapon-balance.js, appliqués uniquement aux cibles boss.

**Fusil :** les sept plombs de base gardent leur valeur ; les plombs ajoutés par Chevrotine comptent pour 50 % contre boss. Ce poids est réparti uniformément sur toute la salve afin de ne pas favoriser un côté de la dispersion. La salve additionnelle vaut 75 % contre boss, avec Double détente comme Double Canon. Le bonus proche cumulé est plafonné à +120 % contre boss. Canon scié ×2 reste entier, À bout portant seul reste à +100 %, et leur cumul conserve un gain jusqu’au plafond. Sur les mobs, les dégâts, salves et bonus proches sont strictement inchangés.

Le cumul idéal Chevrotine ×1 / Détente ×2 / Double Canon passe de ×4,47 à **×3,20** contre boss. Aucun changement de cadence, timer minimum de survie ou adaptation cachée des PV au build.

**Mitraillette : Focus natif**, sans perk requis. Chaque impact primaire consécutif sur le même boss prépare +3 % pour le suivant ; plafond +25 % après neuf impacts. Premier impact sans bonus. Changement de cible touchée, mort de la cible, nouvelle vague ou mouvement continu d’une seconde : reset. Une courte esquive le conserve ; le freinage compte dans la durée d’interruption du tir. Une balle déjà en vol avant le reset ne peut pas rétablir l’ancien Focus.

Les impacts secondaires perforants ne construisent ni ne volent le Focus et gardent leurs dégâts habituels, 60 % ou 80/64 % avec l’épique. Le Focus ne bonifie aucun mob. Le petit texte FOCUS +N % apparaît uniquement pendant le combat sur un boss concerné.

**Surchauffe inchangée :** +10 %/s, maximum +40 %, reset au mouvement. Surchauffe critique reste à +140 % au maximum. Le Focus multiplie les dégâts de la balle déjà calculés avec sa chaleur ; son propre plafond reste +25 %. Les builds sans Surchauffe bénéficient également du Focus, avec une rampe indépendante.

## Mesures comparables

216 simulations : 9 builds × 4 rencontres × 3 niveaux Atelier × V0.14/V0.15. Même pilote, graine, build, PV de départ normaux et nombre légal de perks (préfixes de 2/3/4/6 choix pour les boss 5/10/15/20). La référence importe le snapshot source V0.14 dans tests/v014-src-snapshot. Les 108 rencontres V0.15 sont gagnées. Combats isolés, sans soin de test pendant le combat ; ils ne remplacent pas les runs intégrales.

Temps de combat en secondes hors introduction/collecte, **V0.14 → V0.15**, sans Atelier. Une défaite est signalée comme telle, jamais présentée comme un temps de kill.

| Build | Boss 5 | Boss 10 | Boss 15 | Final |
| --- | --- | --- | --- | --- |
| fusil-moyen | 19,77 → 19,77 | 32,00 → 32,00 | 30,90 → 37,17 | 46,20 → 58,07 |
| fusil-fort | 16,27 → 16,27 | 22,15 → 26,62 | 23,43 → 27,63 | défaite (26,45 s écoulées) → 54,30 |
| fusil-double-canon | 16,27 → 16,27 | 22,15 → 26,62 | 23,43 → 27,63 | 24,30 → 34,80 |
| fusil-proximite | 14,10 → 14,10 | 17,23 → 17,23 | 20,52 → 20,52 | 32,98 → 43,25 |
| fusil-grisou | 15,32 → 18,37 | 22,15 → 26,62 | 24,65 → 28,95 | défaite (26,45 s écoulées) → 54,30 |
| smg-moyen | 35,82 → 29,57 | 33,83 → 27,82 | 39,72 → 33,38 | 78,82 → 61,13 |
| smg-perforation | 35,20 → 30,03 | 33,83 → 27,82 | 37,82 → 31,62 | 68,82 → 57,75 |
| smg-surchauffe | 33,83 → 27,02 | 30,67 → 24,72 | 35,25 → 25,85 | 67,58 → 55,15 |
| smg-epique | 35,20 → 30,03 | 28,58 → 23,13 | 37,82 → 31,62 | 65,40 → 52,53 |

Final V0.15 selon les niveaux uniformes d’Atelier :

| Build | Atelier 0 | Atelier 2 | Atelier 5 |
| --- | --- | --- | --- |
| fusil-moyen | 58,07 | 45,40 | 40,18 |
| fusil-fort | 54,30 | 51,00 | 36,95 |
| fusil-double-canon | 34,80 | 28,87 | 23,70 |
| fusil-proximite | 43,25 | 30,25 | 30,97 |
| fusil-grisou | 54,30 | 48,05 | 35,08 |
| smg-moyen | 61,13 | 45,22 | 39,73 |
| smg-perforation | 57,75 | 42,52 | 38,15 |
| smg-surchauffe | 55,15 | 41,30 | 35,98 |
| smg-epique | 52,53 | 39,33 | 33,17 |

Listes exactes et ordre des perks : tests/v015-measure.mjs. « Fort » désigne Détente ×2 avec Chevrotine, puis l’épique indiqué ; les préfixes expliquent les mesures intermédiaires identiques.

**Réserves :** Double Canon sans Atelier passe de 24,30 à 34,80 s (+43 %), Perforation totale de 68,82 à 57,75 s (−16 %). Ratio réduit de 2,83 à 1,66. Surchauffe atteint 55,15 s, le build Surchauffe critique 52,53 s. Les cibles ne sont pas universelles : Fusil moyen jusqu’à 58 s, Mitraillette moyenne 61 s ; à Atelier 5, Double Canon reste rapide à 23,70 s. Aucun durcissement supplémentaire pour forcer toutes les combinaisons dans une fenêtre commune.

## Validation

**240/240 tests réussis** : les 220 précédents sont conservés et adaptés aux graines/builds de combat et aux seuls fichiers autorisés ; 20 tests V0.15 ajoutés. Plafond/reset du Focus, salves sans récursion, proximité, dégâts perforants, quatre boss battables et réduction de l’écart sur des rencontres appariées sont vérifiés. Les seize vagues normales avec les deux armes sont comparées intégralement au snapshot V0.14 : résultats identiques à état de départ identique. Empreintes des systèmes protégés inchangées.

Série exploratoire de 80 runs (graines 1–30 sans Atelier, 1–10 avec Atelier 2, par arme) : 1/0 victoires Fusil/Mitraillette sans Atelier, 1/4 avec Atelier 2. La recherche complémentaire avec la priorité Perforantes ne donne aucune victoire Mitraillette sans Atelier jusqu’à la graine 500. Une priorité Surchauffe critique gagne à la graine 5. Ce résultat décrit le pilote automatique, pas un taux de réussite humain ; aucune protection, guérison ou statistique artificielle n’est utilisée pour les victoires.

Trois runs complètes gagnées dans Phaser : vingt vagues, 235 éliminations, six choix, vingt collectes et aucun tir en mouvement.

| Run navigateur | Boss 5 | Boss 10 | Boss 15 | Final | Total / PV restants |
| --- | --- | --- | --- | --- | --- |
| Fusil, Atelier 0, graine 1, Double Canon | 13,18 | 25,17 | 24,67 | 31,87 | 347,23 s / 0,5 |
| Mitraillette, Atelier 0, graine 5, Surchauffe critique | 29,57 | 25,12 | 25,08 | 56,03 | 416,63 s / 1 |
| Mitraillette, Atelier 2, graine 5, Perforation totale | 22,45 | 17,48 | 20,70 | 39,53 | 317,32 s / 1 |

Ces builds différents ne sont pas un comparatif apparié avant/après : utiliser la matrice pour cela. Une autre run Perforantes/Chargeur/Surchauffe avec Atelier 5, graine 1, termine également dans les tests.

Formats **320 × 568** et **390 × 844** contrôlés : Focus sous les PV, au-dessus de la progression, sans chevauchement ni débordement. Console sans erreur/avertissement. Coût CPU local moyen des runs **0,578–0,698 ms** par frame QA, comprenant quatre pas de simulation et le pilote. Cette mesure exclut le GPU et ne démontre pas les FPS ou le ressenti sur Android physique, restant à valider manuellement.

## Utilisation et preuves

- Lancer : npm.cmd start -- --host=0.0.0.0 ; prototype http://127.0.0.1:5177/.
- Tests : npm.cmd test ; matrice : node tests/v015-measure.mjs.
- QA : node tests/browser-qa-server.mjs, port 5178, profil isolé la-mine-v2:qa-v015. Le serveur normal ne sert pas les tests.
- Rapports : tests/v015-final-tests.txt, tests/v015-boss-matrix.json, tests/v015-full-runs.json, tests/v015-smg-full-run.json, tests/v015-selected-runs.json, tests/v015-browser-report.json.
- Captures : tests/v015-focus-320.jpg, tests/v015-focus-390.jpg, tests/v015-smg-victory-390.jpg.
- Backups : tests/v014-src-snapshot, tests/v014-readme-backup.md, tests/v014-style-backup.css, tests/v014-browser-qa-backup.js ; toutes les anciennes sauvegardes restent conservées.

Les gains QA n’alimentent pas le portefeuille normal. Récompenses inchangées : 94 Charbon / 8 Fer garantis et mêmes tirages rares. Backend et correctif EADDRINUSE conservés ; la bannière historique du serveur peut encore mentionner V0.14, la version applicative est V0.15.

Arrêt après V0.15. Aucun commit ni push, aucune V0.16.
