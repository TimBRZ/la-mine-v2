# V0.36B — Boss de Zone 5 : gameplay à valider

## Périmètre

Les trois masters statiques validés sont utilisés tels quels, copiés octet pour octet dans `src/assets/boss-v036b/`. Pas de sprite sheet finale, animation détaillée ou chantier Zone 6. Les PV restent **1 780 / 2 120 / 2 520**, les rayons **28 / 29 / 31**, le contact **1**, les hazards/fragments **0,5**. Armes, mobs standards, économie, progression, sauvegarde et autres zones inchangés. Aucun accès CGWeb, commit ou push.

L’orchestrateur `src/depths/boss-director.js` gère les étapes ; `boss-patterns.js` définit géométrie, timings et cycles ; `boss-view.js` dessine les télégraphes et charge les masters. `depths/combat.js` délègue uniquement les boss de Zone 5 à ce contrôleur. Les primitives anciennes restent testées et disponibles pour compatibilité des anciens outils QA, mais ne figurent plus dans les cycles automatiques de ces boss.

## Contrat commun

`pending → tracking éventuel → locked → active → étape suivante → recovery → positioning`.

- Une admission retardée par un plafond reste en préparation ; aucun tir n’est abandonné.
- Chaque étape verrouille sa propre géométrie avant l’activation. Seule Mise en joue suit le joueur durant ses **0,8 s** de visée ; le tracking cesse ensuite.
- Balayage, lignes mobiles et ondes suivent une évolution prédéfinie, jamais le joueur après verrouillage.
- Recovery immobile : **1,05 s**, réduit à **0,85 s** sous 50 %, sauf récupérations spécifiques ci-dessous. Contact toujours présent : la fenêtre de tir ne rend pas le boss traversable.
- Positionnement entre patterns : **0,6 s**, **0,4 s** sous 50 %, **0,35 s** en triple, prolongé si une admission attend.
- Sous 25 %, l’ultime d’un boss vivant est mise en attente prioritaire, une seule fois. Les attaques engagées finissent ; aucune nouvelle attaque majeure concurrente ne démarre. Pas d’invulnérabilité ajoutée : un boss tué avant son admission ne lance pas d’attaque posthume.

## Lampiste-Major

| Pattern | Télégraphe / verrouillage | Action | Recovery |
|---|---|---|---|
| Balayage du Major | 1,2 s, arc et sens annoncés | Ligne large, rotation de 140,4° en 2,6 s | 1,05 / 0,85 s |
| Mise en joue | suivi 0,8 s, puis ligne figée 0,65 s | Faisceau droit pendant 0,38 s | 1,05 / 0,85 s |
| Extinction générale | 0,7 s | 2 s de repositionnement ; éclairage réduit 3 s en solo, 2 s en triple | 1,05 / 0,85 s |
| Feux croisés | 1,3 s, flèches | Deux lignes progressent sur 110 px et 80 px en 2,2 s | 1,05 / 0,85 s |

L’extinction ne teinte que le fond. Joueur, boss, projectiles et dangers conservent leur contraste. Deux repères lumineux restent visibles ; ce sont des repères, pas des boucliers contre les autres boss.

Sous 50 %, le cycle contient deux extinctions pour cinq patterns, davantage de repositionnement et moins de temps mort, sans hausse des dégâts.

**BLACKOUT** : extinction/repositionnement → balayage décalé de −0,4 rad → deuxième balayage décalé de +0,7 rad → Mise en joue et faisceau final → **1,5 s** de récupération. L’obscurité est entretenue pendant la séquence ; les éboulements ambiants sont suspendus pendant les ultimes. Pas de superposition de plusieurs ultimes en triple.

## Dynamiteur

| Pattern | Télégraphe / verrouillage | Action | Recovery |
|---|---|---|---|
| Plan de tir | 1,35 s ; quatre destinations numérotées | Explosions 1 → 4, espacées de 0,72 s, chacune active 0,32 s | 1,05 / 0,85 s |
| Mèche en chaîne | 1,35 s ; destinations reliées | Propagation diagonale 1 → 4, mêmes délais | 1,05 / 0,85 s |
| Quadrants | 1,4 s puis 1,3 s au changement | Trois quadrants explosent successivement, 0,65 s d’écart ; le quadrant épargné change | 1,05 / 0,85 s |
| Charge projetée | destination du joueur figée 1,4 s | Zone de rayon 60 pendant 0,4 s, puis 6 fragments à 95 px/s, portée 210 | 1,2 s |

**Quatre charges avec un plafond de trois** : les quatre emplacements sont annoncés immédiatement. Trois charges sont posées ; la quatrième reste un repère de destination jusqu’à disparition de la première. Aucune hausse cachée du plafond.

Les quadrants conservent des passages centraux de 44 px. Sous 50 %, la chaîne revient deux fois dans le cycle de cinq attaques ; repos et positionnement sont raccourcis.

**DÉMOLITION CONTRÔLÉE** : trois couronnes centrées dans l’arène, successives, dans un sens annoncé intérieur → extérieur ou inverse. Rayons 0–65, 80–125, 140–180. Premier préavis **1,6 s**, suivants **1 s**, activation **0,35 s** chacun. Chaque couronne constitue un seul danger annulaire ; ses plots visuels ne sont pas des charges supplémentaires. **1,5 s** de récupération complète.

## Masse Noire

| Pattern | Télégraphe / verrouillage | Action | Recovery |
|---|---|---|---|
| Charge de la Masse | ligne figée 1,6 s | 310 px/s, maximum 1,7 s, arrêt au bord | 1,05 s immobile |
| Coup de masse | disque 1,25 s, puis anneau 0,75 s | Disque rayon 87 pendant 0,3 s ; anneau 100–155 pendant 0,4 s | 1,05 / 0,85 s |
| Triple frappe | gauche 1 s, droite 0,8 s, centre 1,1 s | Impacts 0,28 / 0,28 / 0,35 s ; puis fissures annoncées séparément | 1,3 s |
| Fissure du fond | trois axes figés 1,15 s | Progression sur 265 px en 0,65 s, éventail ±0,65 rad | 1,05 / 0,85 s |

Sous 50 %, deux charges par cycle de cinq patterns, positionnement plus actif et repos réduit. Aucun multiplicateur de dégâts ajouté.

**ÉCRASEMENT DU PUITS** : annonce 0,6 s → déplacement vers le centre jusqu’à 2,2 s à 140 px/s → slam rayon 105 (1,65 s / 0,35 s) → quatre fissures cardinales (1,15 / 0,65 s) → quatre diagonales (1,15 / 0,65 s) → onde annulaire finale (1 / 0,7 s, expansion de 85–110 à 195–220) → **1,5 s** de récupération. Toutes les étapes sont séquentielles.

## Triple final

Deux propriétaires d’attaques majeures maximum, incluant télégraphes, dangers actifs et projectiles persistants. Le troisième boss se repositionne ou prépare son prochain pattern ; il ne reçoit pas un kit complet supplémentaire simultané.

1. **Sous les projecteurs** : bande lumineuse sûre de 110 px, successivement centrée à x=130, 290 puis 180. Deux zones de démolition occupent les côtés sombres ; chaque changement est annoncé 1,3 s (1,4 s au départ), puis activé 0,35 s. Rester au centre ne suffit plus : il faut suivre la zone éclairée.
2. **Couloir de la Masse** : trajectoire partagée calculée une fois depuis la Masse vers la position du joueur ; le Major annonce exactement ce couloir, puis la Masse y charge sans correction.
3. **Démolition lourde** : deux explosions décalées, puis slam central après leur fin. Le slam est annoncé pendant la démolition mais ne frappe pas au même instant.

Ces combos reviennent dans un ordre cyclique lorsque les partenaires sont prêts. Délai nominal après admission : **8 s**, **6,5 s** sous 50 % PV globaux ; les autres patterns continuent entre eux. Une attente de regroupement est bornée à 2,2 s, avec repositionnement continu. Les ultimes ont une priorité exclusive, sans trois séquences lourdes simultanées.

Plafonds inchangés : **24 projectiles / 5 hazards / 3 charges / 2 majeures**. Aucun Wagon ajouté. La priorité à une ultime peut temporairement espacer les attaques pour laisser les dangers déjà engagés expirer.

## Validation et limites

Baseline : **995/995**. Résultat final : **1 027/1 027 réussis**, aucun échec ni test ignoré. Nouveaux tests : **32**, couvrant les quinze patterns/ultimes, les verrous, dégâts différés, zones sûres échantillonnées, fin de charge, récupération immobile, six fragments, phases, priorité/usage unique des ultimes, mort, saturation, combos, caps et identité des masters. Les anciens tests sont conservés ; leurs listes de fichiers autorisés et comparaisons désormais obsolètes de boss Zone 5 ont été adaptées. Les vagues ordinaires, autres zones, PV, dégâts et récompenses restent contrôlés. Aucun snapshot historique supprimé.

Simulations : Atelier 2, graines 1/2/3, entrées ordinaires, aucun god mode. **36/36 combats isolés gagnés** (3 armes × 4 rencontres × 3 graines). **8/9 runs complètes gagnées** : Fusil 3/3, Mitraillette 3/3, Grisou X 2/3 ; défaite Grisou X graine 2 à la vague 18, avant le triple. Aucune baisse de difficulté pour effacer cette défaite.

Durées isolées, avec le seul choix d’ouverture : Major **28–47 s**, Dynamiteur **33–51 s**, Masse **39–58 s**, triple **83–121 s**. Le pilote passe environ **6–25 %** du temps à se déplacer. Les recoveries des combats isolés représentent environ **5–11 s** par solo et **20–35 s** par triple. Ce pilote anticipe les géométries annoncées très précisément : ces chiffres ne prédisent pas les performances humaines.

Les premiers essais ont corrigé le pilote QA : il assimilait une phase active immobile à une charge, puis ignorait les anneaux/quadrants. Il prévoit maintenant uniquement les dangers déjà annoncés. Aucune trajectoire cachée future n’est lue.

Contrôles navigateur : trois boss seuls, triple final, trois armes, télégraphes, séquences, tailles 320×568 / 390×844. Triple final terminé sur la dernière version avec Fusil (74,22 s, 4,5 PV), Mitraillette (104,63 s, 1,5 PV) et Grisou X (116,13 s, 3,5 PV). Aucun avertissement ni erreur console relevé. Rapport : `v036b-validation/browser-validation.json` ; captures notamment `combo-light-320.jpg`, `combo-light-390.jpg`, `blackout-320.jpg`, `mass-slam-320.jpg` et `mass-slam-390.jpg`.

Mesures sur navigateur desktop redimensionné, pas sur téléphone Android physique. Les temps de simulation ne constituent pas une mesure du rendu GPU mobile. Les labels restent secondaires : les lignes, numéros, flèches et anneaux portent la lecture principale. Les zones sûres sont vérifiées sur grille et par les combats simulés, pas par une preuve exhaustive de toutes les trajectoires humaines possibles.

Les masters restent statiques : la levée du marteau, la rotation corporelle du projecteur et les gestes du détonateur sont pour V0.36C. Ici les télégraphes et les phases fournissent l’information de gameplay.

## Livrables

- `src/depths/boss-patterns.js`, `boss-director.js`, `boss-view.js` ; adaptation limitée de `combat.js` et `art.js`.
- Chargement dans `src/room-scene.js`, sélection/labels dans `src/enemies/view.js`.
- Trois copies des masters dans `src/assets/boss-v036b/`.
- `V036C-ANIMATION-REQUIREMENTS.md` : recommandations uniquement.
- `v036b-validation/` : baseline, tests, simulations détaillées, captures et QA locale (`node v036b-validation/server.mjs`, port 5201).

Arrêt après validation V0.36B. Aucune sheet finale commencée.
