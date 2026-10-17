# La Mine V2 — V0.33 — Héros, armes et effets

Première production visuelle issue de la bible V0.32 : héros animé, trois armes et mini-sheets de tirs/impacts. Aucun changement de gameplay ou de progression ; anciens assets conservés en fallback. Détails et validations : [V033-VISUAL-PRODUCTION.md](V033-VISUAL-PRODUCTION.md). V0.34 non commencée.

## Historique — V0.31 — Patch d’équilibrage des armes

**Un seul changement gameplay : falloff du Fusil à pompe renforcé progressivement après 45 px parcourus, jusqu’à −15 % supplémentaires à 192 px.** Burst proche, cadence, portée, spread et perks inchangés. Mitraillette et Grisou X inchangés. Aucune modification des zones, boss, ennemis, progression permanente, économie ou classement. Aucun commit/push.

L’analyse préalable, les tableaux avant/après, les bancs DPS/TTK, les 36 simulations comparatives Zones 4–6 et le protocole de test humain sont détaillés dans [V031-EQUILIBRAGE.md](V031-EQUILIBRAGE.md). Le Fusil reste excellent de près ; sur le boss témoin à 150 px, DPS 45,3 → 42,4 et TTK 39,9 → 43,6 s. Pas de deuxième passe automatique d’équilibrage.

La version package/UI est désormais `0.31.0`. Les versions mentionnées dans l’historique ci-dessous décrivent les validations passées.

Validation finale : **805/805 tests**, 793 existants conservés et 12 nouveaux. Trois armes testées dans le navigateur, formats 320 × 568 et 390 × 844 corrects, aucune erreur console. Rapport : `tests/v031-final-tests.txt` et `tests/v031-browser-validation.json`. Test humain Zone 6 recommandé avec les trois armes et les mêmes améliorations permanentes ; aucune seconde passe automatique d’équilibrage.

## Historique — Zone 6 : LES FORGES OUBLIÉES

Accessible après une victoire complète en Zone 5. Vingt vagues, Maître de Four en 5, Marteau-Pilon en 10, Chaudière en 15 et les trois en 20. Checkpoints du Contremaître et choix épique avant 20 conservés. La version package/UI reste `0.29.0`, aucune nouvelle version numérique n’ayant été demandée. Zone 7 est uniquement un emplacement verrouillé affiché après victoire ; aucun contenu Zone 7 développé.

## Surchauffe et identité

Douze plaques métalliques, fours latéraux orange, conduites et chaînes, générés dans les textures légères existantes. Aucun téléchargement d’asset supplémentaire. Les plaques gagnent progressivement en luminosité pendant **1,2–1,3 s**, deviennent dangereuses **2,2–2,4 s**, puis refroidissent visuellement pendant **0,3 s sans dégâts**. Les impacts, jets et traînées ont leurs propres durées plus courtes. Les plaques déjà occupées ne sont pas sélectionnées une seconde fois.

- **Chauffeur** : distance moyenne 175–255 px, repositionnement latéral, chauffe une plaque proche du joueur.
- **Riveteur** : préparation 1,1 s, tir verrouillé à 165 px/s, puis trois rivets à environ ±9,7° à partir de la vague 11. Aucun guidage après le tir.
- **Scorificateur** : approche mobile, ruée droite de 0,65 s à 275 px/s après 1,05 s de préavis. La courte traînée reste annoncée pendant le passage, s’active ensuite pour 1,3 s. Deux ruées en préparation/exécution maximum.
- **Maître de Four** : deux plaques (jusqu’à trois sous 50 %), cône frontal verrouillé, rivets et repositionnement.
- **Marteau-Pilon** : slam puis petite chaleur résiduelle, double impact décalé de 0,85 s, onde de sept projectiles avec une direction libre, charge lourde précédée de 1,6 s d’avertissement.
- **Chaudière** : éventail de vapeur, quatre soupapes annoncées en séquence, trois plaques, rivets. Sous 50 %, horloge de repos 1,12 → 1,32 (+17,9 %) et déplacements plus rapides ; les télégraphes ne sont pas raccourcis.

PV des ennemis : 80 / 76 / 64 ; boss : 1 800 / 2 160 / 2 540, avec facteur 0,76 dans le triple. Dégâts de contact 0,5 pour les ennemis, 1 pour les boss ; dangers et projectiles 0,5. La pression vient surtout du placement, des chevauchements et des vagues, sans changement des armes.

## Rythme et limites

| Vagues normales | Effectifs | Maximum simultané | Groupe / intervalle minimum |
| --- | --- | --- | --- |
| 1–4 | 5 / 5 / 8 / 11 | 5 | 2 / 0,60 s |
| 6–9 | 15 / 17 / 19 / 21 | 8 | 4 / 0,45 s |
| 11–14 | 23 / 25 / 27 / 28 | 10 | 4 / 0,35 s |
| 16–19 | 31 / 33 / 35 / 37 | 12 | 5 / 0,27 s |

Les trois premières vagues présentent séparément les trois ennemis. Les vagues suivantes mélangent leurs rôles ; la surchauffe ambiante débute en 4, puis revient toutes les 13 / 10 / 8 / 6,5 s selon le palier, sous réserve des places disponibles. Apparitions distantes et averties via le système existant.

Plafonds stricts : **24 projectiles hostiles, 5 dangers au sol, 3 surchauffes, 2 attaques boss majeures**. Réservations de projectiles atomiques ; avertissements et refroidissements occupent aussi les places au sol, par prudence. Les majeures restent comptées tant que leur danger ou leurs projectiles persistent. Le troisième boss peut bouger, préparer ou utiliser un tir/impact léger. Les refus ne forcent jamais un dépassement.

Avant d’accepter une combinaison de dangers au sol, un calcul de connexité à mailles de 24 px, élargies par le rayon du joueur, exige une région froide connectée d’au moins 35 % de l’arène, traversant celle-ci et située à moins de 135 px du joueur. Ce calcul est exécuté à l’admission des attaques. **C’est un contrôle conservateur des dangers au sol, pas une preuve d’esquive temporelle face aux corps et aux projectiles mobiles.**

## Progression, économie et compatibilité

Première victoire unique : **+2 Diamants**, sans Jeton Grisou supplémentaire. Budget ordinaire identique à Zone 5 : 123 Charbon et 12 Fer garantis pour une victoire, même faible chance de Diamant. Les systèmes existants de caisses, contrats et récompenses quotidiennes continuent normalement ; aucun bonus supplémentaire propre à Zone 6 n’y est ajouté.

Les nouveaux marqueurs de progression sont optionnels et dérivés d’une victoire Zone 5 ; les anciennes sauvegardes restent lisibles. Le debug local `src/debug.html?debug=1` complète les Zones 1–5 et rend Zone 6 accessible sans la terminer ni attribuer de récompense. Une vraie victoire Zone 6 déjà présente est conservée. RESET restaure la progression sauvegardée, y compris les anciennes sauvegardes de debug.

Classement local : sixième position, identifiant interne `forge`. **Déploiement futur du backend : autoriser Zone 6 (`zone_id=6` dans la nomenclature demandée ; le contrat client actuel utilise la chaîne `zone_id: 'forge'`) et son ordre 6.** Aucun backend distant, adaptateur distant, identité CGWeb ou configuration CORS modifié. Le backend actuel peut donc refuser cette nouvelle zone jusqu’à cette intervention séparée.

## Validation Zone 6 — 11 octobre 2026

**793/793 tests réussis** : 751 tests conservés, 42 nouveaux. Les assertions de catalogues ont été étendues à la nouvelle zone ; aucun test supprimé. Le snapshot avant changement est conservé dans `tests/zone6-before-src/`. Un garde SHA-256 protège tout le code hors des quinze points d’intégration explicitement déclarés ; les modules Zone 5 V2, armes, perks, systèmes de progression permanente et services distants sont inchangés. Des replays comparatifs couvrent les Zones 1–5.

Simulations réelles à 60 pas/s, dégâts actifs, choix légaux de perks, sans invulnérabilité ni élimination forcée. Le pilote a été adapté aux distances réelles aux plaques et cônes ; aucun réglage de jeu n’a été assoupli pour transformer ses défaites en victoires. Les deux premières séries exploratoires sont archivées séparément et exclues des résultats suivants.

| Arme — Atelier niveau 2, graines 1–3 | Victoires | Temps moyen de toutes les tentatives | Temps moyen des victoires | Dangers au sol moyens pendant le combat |
| --- | --- | --- | --- | --- |
| Fusil à pompe | 2/3 | 864 s | 884 s | 1,86 |
| Mitraillette | 0/3 | 486 s | — | 1,75 |
| Grisou X | 0/3 | 648 s | — | 1,70 |

Défaites : Fusil vague 19 ; Mitraillette vagues 12/12/11 ; Grisou X vagues 13/16/16. Avec **Atelier niveau 5**, une tentative supplémentaire par arme (graine 1) donne : Fusil victoire en 706 s sans dégât ; Mitraillette défaite vague 17 en 752 s ; Grisou X victoire en 789 s avec 3,5 dégâts. Ces équipements sont des niveaux légaux, pas des modifications d’arme. **Aucune victoire Mitraillette n’est démontrée par cet échantillon.**

Temps moyens des boss terminés 5 / 10 / 15 / 20 avec Atelier 2 : Fusil **40 / 30 / 48 / 42 s**, Mitraillette **37 / 55 / — / — s**, Grisou X **51 / 49 / 58 / — s**. Avec Atelier 5 : Fusil **34 / 18 / 29 / 33 s**, Mitraillette **30 / 44 / 34 / — s**, Grisou X **37 / 37 / 56 / 35 s**. Les défaites pendant un boss sont exclues de sa moyenne. Détails par vague, dégâts, déplacements et durée de chaleur dans les rapports JSON.

Sur les douze tentatives finales, aucun échantillon de sol sans région froide traversante ; minimum observé de région froide connectée **36,7 %**. Maximums observés **13 projectiles / 5 dangers / 3 surchauffes / 2 majeures**. La densité moyenne inclut les dangers annoncés et actifs, pas le refroidissement.

Stress triple dédié de 60 s, avec invulnérabilité explicitement réservée à cette mesure (ne compte pas comme victoire) : au moins deux boss menaçants pendant **59,3–59,6 s**, trois pendant **48,4–50,0 s**, calme continu maximal **0,034 s**. Plafonds respectés et région froide traversante conservée, y compris sous 50 % PV globaux. Le troisième boss reste aussi mobile lorsque ses attaques sont retardées.

Les résultats suggèrent une hausse sensible de pression par rapport aux 8/9 victoires du pilote Zone 5 V2 à Atelier 2. Ce n’est pas une comparaison contrôlée du ressenti humain : le pilote, les patterns et les choix de perks diffèrent. Le saut semble plus marqué que « légèrement au-dessus », particulièrement pour la Mitraillette. **Validation joueur recommandée avant tout nouvel équilibrage ; aucun nerf automatique appliqué.**

Navigateur Chromium, vraie scène avec pilote accéléré : Fusil Atelier 2/graine 1 perd en 19 (823 s), graine 2 gagne en **880 s / 1,5 dégât** ; Mitraillette Atelier 5 perd en 17 (752 s), Grisou X Atelier 5 gagne en **789 s / 3,5 dégâts**. Première victoire +2 Diamants, deuxième +0, total et progression conservés au rechargement. Classement local affichant les Forges en première position du profil de test, carte Zone 6 terminée et emplacement Zone 7 verrouillé vérifiés. Déblocage/reset debug vérifiés sur l’origine QA, sans ressources ajoutées.

Prévisualisations des trois ennemis, cône, double slam, soupapes, vagues 16–19, triple sous 50 % et cycle avertissement → actif → refroidissement examinés. **320 × 568 et 390 × 844 sans débordement horizontal, aucune erreur ni avertissement console.** Moyenne mesurée des mises à jour de la scène : 0,61–0,91 ms par pas ; pics de 36–52 ms pour un lot accéléré de seize pas. Ce banc sur PC ne mesure ni le coût GPU complet ni les performances d’un téléphone physique.

QA sur une origine temporaire distincte `127.0.0.1:5180`, sauvegarde isolée de l’origine de jeu habituelle. Serveur QA arrêté après validation ; serveur habituel inchangé. Rapport navigateur `tests/zone6-browser-validation.json`, captures `tests/zone6-victory-320.jpg`, `tests/zone6-heat-320.jpg`, `tests/zone6-triple-390.jpg` et `tests/zone6-furnace-320.jpg`.

Rapports reproductibles : `tests/zone6-final-tests.txt`, `tests/zone6-summary.json`, `tests/zone6-simulations.json`, `tests/zone6-atelier5-simulations.json`, `tests/zone6-boss-metrics.json`. Commandes : `npm.cmd test`, `node tests/zone6-simulation.mjs`, `node tests/zone6-metrics.mjs`, `node tests/zone6-report.mjs`. Inventaire des fichiers source modifiés : `tests/zone6-source-scope.json` (quinze intégrations, six nouveaux modules, 144 fichiers source existants inchangés).

## Historique — Zone 5 : LES PROFONDEURS NOIRES

Zone jouable après une victoire complète dans LA FAILLE DE GRISOU. Vingt vagues, boss aux vagues 5/10/15, triple final en 20, checkpoints du Contremaître et choix épique avant 20 conservés. Les versions package/UI/client restent `0.29.0` : aucune nouvelle nomenclature de version n’a été demandée pour cet ajout. Les notes V0.30 ci-dessous concernent l’intégration TEMP antérieure.

## Patch difficulté Zone 5 V2 — 11 octobre 2026

Ce patch remplace les réglages V1 décrits dans l’historique ci-dessous. Version package/UI toujours 0.29.0 ; aucune modification de CGWeb, des armes, de l’économie, de la sauvegarde ou des autres zones. Seuls `src/depths/actors.js`, `combat.js`, `pressure.js` et `waves.js` changent dans le code de jeu. PV, dégâts, hitboxes, vitesses des projectiles et durées de télégraphe restent identiques.

### Présence ennemie

| Vagues normales | Effectifs par vague | Maximum simultané | Groupe / intervalle |
| --- | --- | --- | --- |
| 1–4 | 5 / 5 / 9 / 11 | 5 | 2 / 0,62 s |
| 6–9 | 14 / 16 / 18 / 20 | 8 | 4 / 0,46 s |
| 11–14 | 22 / 24 / 26 / 27 | 10 | 4 / 0,38 s |
| 16–19 | 30 / 32 / 33 / 35 | 12 | 5 / 0,28 s |

La vague 1 présente le Lampiste seul, la 2 ajoute un Lampiste aux Boutefeu, la 3 combine Gueule-Noire et les deux soutiens. Les dernières vagues commencent par des groupes distincts : duo de Gueule-Noire + soutien, Boutefeu + duo + Lampiste, deux Boutefeu + Lampiste + Gueule-Noire, puis duo + Boutefeu + deux Lampistes. Les apparitions restent soumises aux points distants, préavis et plafonds par type ; ces intervalles sont des minimums, pas une garantie de spawn.

Les Gueule-Noire sont plus nombreux au total, mais **deux maximum préparent ou exécutent un bond simultanément**. Les autres se repositionnent ; leur approche, bond, télégraphe et récupération restent ceux de V1. Il peut y avoir davantage de corps présents (jusqu’à huit dans les dernières vagues).

Boutefeu : récupération 1,30 → **1,15 s**, repositionnement 0,58 → **0,51 s** (environ −12 %). Mèche toujours 1,5 s, aucun fragment ajouté. Lampiste : horloge de repos/repositionnement **+12 % en vagues 11–19**, cumulée avec le multiplicateur d’extinction existant de 1,12. Le préavis de tir n’est jamais accéléré.

### Extinction et boss

- Extinction toujours 3 s / 2 s dans le triple, précédée de 0,3 s d’alerte, même éclairage et même bonus temporaire de pression. Intervalle automatique : **12 s** au début, **9,5 s** en vagues 11–15, **7,5 s** en 16–19. Premier déclenchement après 9 / 6 / 4,5 s. Délais partagés minimums : 9 / 8 / 6,5 s.
- Roches : **50 %** en vagues 11–19, 35 % ailleurs ; trois en 16–19 si trois places sont libres, sinon deux si deux places restent. Préavis 1,35 s, danger 0,4 s, mêmes dégâts. Aucun essai répété après un refus du plafond.
- Boss : récupération de base 0,95 s (charge lourde 1,65 s), horloge de repos à 1,12 au-dessus de 50 % PV et 1,32 en dessous, soit **+17,9 % sous le seuil par rapport au nouveau régime normal**. Cela concerne les temps morts, pas l’attaque complète. Reprise du déplacement après 0,18 s de cette horloge, ou 0,7 s après charge lourde. Les télégraphes et fenêtres d’esquive restent intacts.
- Cycles sous 50 % : Lampiste-Major avec davantage de faisceaux et faisceau après extinction ; Dynamiteur avec deux chaînes par cycle ; Masse Noire avec deux séquences charge → slam → fissures par cycle. Les plafonds peuvent retarder ou substituer une attaque légère.
- Triple : deux majeures maximum, troisième boss mobile ou en attaque légère selon disponibilité. Accélération additionnelle du repos de +0,20 unité/s, puis +0,35 sous 50 % PV globaux (hors récupération de charge lourde). Extinction toutes les **10 s**, puis **8,5 s** sous 50 % globaux, avec délai partagé de 8 / 7 s ; probabilité de roches 35 → 50 %. Les roches occupent aussi une place de pression majeure pour préserver la lisibilité.

Plafonds inchangés : **24 projectiles hostiles, 5 dangers au sol, 3 charges, 2 attaques majeures**. Pas de hausse des PV ni des dégâts, aucun nerf d’arme. Le troisième boss conserve un déplacement si ses attaques ne peuvent pas être réservées.

### Validation V2

`npm.cmd test` : **751/751**, les 739 tests existants conservés et 12 nouveaux. Trois assertions de l’ancien patch ont été adaptées aux nouvelles compositions et au nouveau repos du Boutefeu ; aucun test supprimé. Rapport : `tests/zone5-v2-final-tests.txt`. Snapshot intégral précédent : `tests/zone5-v2-before-src/`. Le garde de hashes vérifie tous les autres fichiers source, et les replays des autres zones restent identiques. Sauvegarde, première victoire unique et récompenses sont couverts par la suite existante.

Comparaison reproductible : `node tests/zone5-v2-simulation.mjs`, mêmes entrées du pilote, Atelier niveau 2 et graines 1–3 pour les deux versions ; aucune invulnérabilité ni dégâts forcés. Les situations dangereuses sont un indicateur de proximité d’au moins deux sources distinctes de menace engagée ; ce n’est pas une mesure du ressenti humain. Les épisodes sont séparés par deux secondes sans chevauchement. Le rapport conserve les durées de chaque vague et boss, les dégâts subis, le taux de victoire et les plafonds : `tests/zone5-v2-simulations.json`.

Le stress triple de 60 s confirme environ **56–57,5 s avec au moins deux boss menaçants**, **30,7–31,5 s avec trois**, au maximum deux attaques majeures. Les durées de calme maximales restent sous 0,2 s. Le stress comporte une invulnérabilité explicite pour observer tout le combat et ne compte pas comme une victoire.

Résultats sur trois graines par arme (avant → V2) :

| Arme | Victoires | Temps moyen des victoires | Dégâts moyens, toutes tentatives | Combat sous plusieurs menaces |
| --- | --- | --- | --- | --- |
| Fusil | 3/3 → 3/3 | 606 → 754 s | 0,50 → 0,17 PV | 58,4 → 63,0 % |
| Mitraillette | 3/3 → 3/3 | 859 → 1 037 s | 0,67 → 3,50 PV | 61,5 → 70,1 % |
| Grisou X | 3/3 → 2/3 | 699 → 799 s | 1,67 → 4,00 PV | 51,8 → 55,5 % |

**8/9 victoires**, une défaite Grisou X en vague 17. Le temps de victoire Grisou X V2 exclut cette défaite ; les dégâts et la part de combat sous menaces l’incluent. Les épisodes distincts par minute diminuent (Fusil 2,16 → 1,66, Mitraillette 1,60 → 1,29, Grisou X 2,04 → 1,82) car les chevauchements durent davantage. Leur durée relative, plus utile pour mesurer la continuité, augmente pour les trois armes. La part de déplacement en vagues 16–19 augmente également sur les victoires : 36,3 → 37,4 %, 31,3 → 34,3 %, 32,9 → 34,6 % respectivement.

Durées moyennes des boss 5 / 10 / 15 / 20 sur les runs gagnées : Fusil **30/31/30/42 → 38/36/29/46 s**, Mitraillette **33/37/49/76 → 29/33/50/71 s**, Grisou X **43/48/47/44 → 39/40/41/45 s**. Les boss ne deviennent donc pas uniformément plus longs malgré leur activité accrue. Le Fusil reste le plus sûr et le plus rapide pour ce pilote ; aucune arme n’a été modifiée. Les choix de perks peuvent diverger après les changements de consommation du hasard, malgré les mêmes graines de départ : cet échantillon n’isole pas chaque facteur d’équilibrage. Synthèse chiffrée : `tests/zone5-v2-comparison.json`.

Vérification Chromium avec la vraie scène et le pilote accéléré : **trois victoires complètes**, Fusil 814 s / 0 dégât, Mitraillette 1 046 s / 3 dégâts, Grisou X 833 s / 3 dégâts. Sauvegarde QA isolée : +2 Diamants à la première victoire, aucun bonus répété aux deux suivantes, progression et total de deux Diamants conservés au rechargement. Roches et triple examinés en **320 × 568 et 390 × 844**, boss solo sous 50 % examinés en 320 × 568, aucun débordement horizontal ni erreur/avertissement console. Maximum observé sur ces runs : 13 projectiles, 5 dangers, 3 charges, 2 majeures. Rapport `tests/zone5-v2-browser-validation.json` et captures `tests/zone5-v2-*.jpg`. Les previews forcées ne sont pas comptées dans les trois victoires. Le serveur QA 5179 est arrêté après validation ; le serveur normal 5177 reste intact. Les mesures de temps du banc accéléré ne constituent pas un benchmark de téléphone physique.

La difficulté humaine supérieure à Zone 4 doit être confirmée par un nouveau test joueur. Le pilote anticipe les trajectoires précisément ; aucun réglage n’est assoupli pour lui garantir une victoire. Aucun travail Zone 6, aucun commit/push.

## Historique : patch d’équilibrage Zone 5 V1 — 8 octobre 2026

- Pendant l’extinction uniquement : déplacement d’approche du Gueule-Noire **+12 %**, horloge de récupération **+12 %** (durée réduite d’environ 10,7 %). Le bond verrouillé, son préavis, les PV et les dégâts restent identiques. Les temps de repositionnement/récupération du Lampiste avancent aussi 12 % plus vite, sans accélérer ses projectiles ni raccourcir son télégraphe.
- **35 % de probabilité** par extinction de demander deux roches instables : préavis **1,35 s**, danger **0,4 s**, rayon 34 px. Un seul tirage, sans relance si le plafond empêche leur apparition. Les positions sont verrouillées et laissent de l’espace pour sortir. Les roches comptent dans les cinq dangers au sol ; dans le triple elles réservent également une place de pression majeure.
- Alerte visuelle avec baisse de lumière pendant **0,3 s**, puis extinction ; retour net au décor normal avec bref message. Aucun son ajouté. Joueur, ennemis, tirs et télégraphes gardent leur luminosité.
- Vagues **16–19 : 24 / 26 / 27 / 28 ennemis**, deux Gueule-Noire supplémentaires par vague, alternance rapprochée avec les soutiens, plafond simultané 12 (dont 8 Gueule-Noire) et intervalle de groupe 0,35 s. Première extinction après 5,5 s, puis intervalle automatique **8,5 s**. Les vagues 1–15 et 20 conservent leur composition.
- Boutefeu : récupération **1,3 s** et repositionnement **0,58 s**, contre 1,45 / 0,65 s ; mèche toujours **1,5 s**, trois charges maximum.
- Triple : intervalle automatique d’extinction **11 s**, délai partagé minimum 9 s. Lorsqu’une attaque majeure est empêchée, le Lampiste-Major peut tirer une petite salve et le Dynamiteur lancer une charge isolée, en respectant les plafonds. Les attaques déjà persistantes restent comptées.

Plafonds inchangés : **24 projectiles, 5 dangers au sol, 3 charges, 2 attaques majeures**. Fusil, Mitraillette, Grisou X, économie, progression, sauvegarde et Zones 1–4 inchangés ; seul le libellé d’extinction dans la vue commune a nécessité une dépendance hors des modules Zone 5.

### Validation du patch

**739/739 tests réussis**, les 715 tests précédents conservés (assertions adaptées au préavis et à la nouvelle densité), plus 24 tests ciblés. Rapport : `tests/zone5-balance-final-tests.txt`. Le contrôle des hashes compare tous les fichiers source au snapshot `tests/zone5-balance-before-src/`, et les replays des autres zones restent identiques.

**Neuf runs simulées complètes gagnées**, trois graines par arme, entrées normales, Atelier niveau 2, sans invulnérabilité ni dégâts forcés. Moyennes : **Fusil 606 s, Grisou X 699 s, Mitraillette 859 s**. Le Fusil reste clairement le plus rapide pour ce pilote et cet échantillon (environ 13 % devant Grisou X et 30 % devant la Mitraillette) ; aucune arme n’a été modifiée. Détails par vague : `tests/zone5-balance-simulations.json`.

Sur les stress comparatifs de 60 s des vagues 16–19, la présence moyenne passe de 8,82 à 11,71 ennemis, tandis que la moyenne de projectiles passe seulement de 4,42 à 4,61. L’extinction occupe 21 s contre 15,08 s auparavant. Ces stress bloquent volontairement les kills et forcent le tirage des roches pour vérifier les plafonds ; ils ne représentent pas une run normale ni la fréquence réelle de 35 %. Dans le stress triple, trois boss sont engagés pendant environ 23–24 s sur 60, contre 15–19 s avant le patch, sans dépasser deux attaques majeures.

Navigateur Chromium : une victoire complète supplémentaire au Fusil via la vraie scène, alerte, roches, triple et retour de lumière vérifiés, **320 × 568 et 390 × 844** sans débordement horizontal ; aucune erreur ni avertissement console. Origine et sauvegarde QA isolées. Rapport : `tests/zone5-balance-browser-validation.json`, captures `tests/zone5-balance-*.jpg`. Cela ne remplace pas la mesure des performances sur téléphone physique.

**Limite d’équilibrage :** le pilote anticipe très précisément les dangers. Ces résultats prouvent que les trois armes peuvent terminer la zone et que la pression a augmenté ; la cible humaine « au moins aussi difficile que Zone 4 » reste à confirmer par un nouveau test joueur. Aucun travail sur Zone 6, aucun commit/push.

## Combat et lisibilité

- **Lampiste** : distance moyenne 185–255 px, déplacements latéraux, éventail lumineux de trois tirs lents, direction verrouillée après 1,1 s de préavis.
- **Boutefeu** : approche à 65 px, pose une charge à portée de bras puis recule. Explosion après 1,5 s, sans fragments supplémentaires.
- **Gueule-Noire** : approche irrégulière, bond rectiligne verrouillé, préavis 0,9 s et récupération 0,75 s.
- **Lampiste-Major** : faisceau de 1,5 s de préavis, éventail de six tirs, extinction commandée et attaque légère.
- **Dynamiteur** : trois charges décalées, chaîne numérotée 1 → 2 → 3, onde lente avec un passage ouvert, charge ciblée au sol. Le lancer est représenté directement par sa zone de réception télégraphiée.
- **Masse Noire** : charge lourde (préavis 1,6 s), récupération 1,85 s / 1,5 s sous 50 % PV, slam local, trois fissures et extinction. Déplacements plus actifs sous 50 %, PV proches des boss Zone 4.

Les extinctions durent **3 s**, **2 s dans le triple**, après le préavis de 0,3 s. L’intervalle automatique est de 12 s normalement, 8,5 s en vagues 16–19, 11 s dans le triple ; le délai minimal partagé est respectivement de 9 / 7,5 / 9 s. Aucune prolongation en chaîne. **Seule la texture du décor est assombrie** : joueur, silhouettes lumineuses, télégraphes, projectiles, butin et HUD conservent leur luminosité. Pas de masque opaque ni de shader coûteux.

Plafonds : **24 projectiles hostiles, 5 dangers au sol, 3 charges, 2 attaques majeures de boss**. Les réservations portent sur le pattern complet et incluent les dangers persistants. Les boss empêchés d’attaquer continuent leur déplacement. Les trois nouveaux ennemis sont présentés séparément en vagues 1–3, puis combinés ; les vagues avancées autorisent un troisième Lampiste puis un troisième Boutefeu, sans augmenter les PV des mobs.

## Progression, debug et classement

Première victoire complète : **+2 Diamants une seule fois**, sauvegardés avec les drapeaux de progression existants. Budget normal déterministe : 123 Charbon / 12 Fer, règles de Jetons inchangées, petite chance supplémentaire de Diamant identique à Zone 4. Aucun changement des armes, perks, Atelier, Talents, Relève, Contrats ou Caisses. Les anciennes sauvegardes restent compatibles, sans nouvelle clé ni nouvelle version de profil.

Le debug local `/src/debug.html?debug=1` marque désormais les Zones 1–4 terminées et ouvre Zone 5 sans la terminer ni distribuer de ressource. Un ancien succès réel Zone 5 est conservé. Le reset restaure toujours uniquement la progression d’avant le premier déblocage debug. Après victoire Zone 5, une carte **ZONE 6 · À VENIR** apparaît, verrouillée, sans configuration de combat.

Le classement local reconnaît l’ordre Galeries → Voies → Puits 59 → Faille → Profondeurs Noires. **CGWeb, auth, adaptateurs distants et backend TEMP n’ont pas été modifiés.** Au futur déploiement après BV, il faudra autoriser **la zone d’ordre 5 (`zone_id: 'depths'` dans le contrat actuel à identifiants texte)** côté backend ; ne pas envoyer le nombre `5` sans migration concertée du contrat. Les résultats Zone 5 restent enregistrés localement ; le backend actuel peut refuser leurs soumissions/requêtes TEMP.

## Validation initiale Zone 5 — historique avant le patch

`npm.cmd test` : **715/715 tests**, dont les 678 existants conservés et 37 nouveaux. Les assertions de catalogue devenues obsolètes sont adaptées aux nouveaux ennemis / à la cinquième zone. Les snapshots précédents sont conservés ; `tests/zone5-before-src/` et le nouveau garde de hashes contrôlent notamment que tous les modules distants et les systèmes hors périmètre restent inchangés. Replays comparatifs réels des Zones 1–4 : mêmes événements et ennemis sur vagues normales et tous les boss.

Les simulations initiales à entrées normales, avec Atelier niveau 2, sans invulnérabilité ni dégâts forcés, terminaient Zone 5 avec les trois armes : Fusil **654 s**, Mitraillette **855 s**, Grisou X **773 s**. Ces anciens rapports sont conservés dans `tests/zone5-balance-before-zone5-run-*.json`. Le stress triple initial de 60 s observées donnait au moins deux boss engagés pendant 53–57 s et trois pendant 15–19 s, sans dépasser deux patterns majeurs ; plus longue fenêtre calme 0,15 s. Archive : `tests/zone5-balance-before-zone5-triple-metrics.json`.

Banc navigateur isolé : `node tests/zone5-qa-server.mjs`, puis `http://127.0.0.1:5179/`. Profils QA séparés, aucun serveur CGWeb, aucune modification du serveur normal 5177. Le panneau propose les ennemis, chaque boss, le triple, les extinctions et une run complète accélérée pour chacune des trois armes, exécutée par la vraie scène. Les captures et le compte rendu navigateur sont conservés sous `tests/zone5-*`.

Deux victoires complètes également exécutées dans Chromium avec la vraie scène : Grisou X puis Mitraillette. Première victoire : +2 Diamants ; seconde : +0, total conservé à 2. Rechargement, record local, carte future, lancement normal, déblocage/reset debug vérifiés sur l’origine QA. Aucun débordement horizontal aux deux tailles mobiles, aucune erreur ni avertissement console relevé. Preuves : `tests/zone5-browser-validation.json`, `tests/zone5-final-tests.txt`, `tests/zone5-review.json`. Serveur QA et onglets de test arrêtés après validation.

Limites : les pilotes anticipent les dangers plus précisément qu’un humain ; les simulations prouvent la faisabilité, pas une difficulté humaine supérieure à Zone 4. L’équilibrage fin et les performances d’un téléphone physique restent à confirmer par un test joueur. La validation mobile locale contrôle les viewports 320 × 568 et 390 × 844 dans Chromium, pas un appareil Android réel. Zone 6 non commencée ; aucun commit/push.

# Historique V0.30 étape 3 : classement distant TEMP

Lors de cette étape antérieure, le prototype de gameplay V0.29 et sa sauvegarde étaient restés inchangés. L’étape ajoutait uniquement les adaptateurs de classement et leur validation TEMP ; aucun déploiement ni activation en production. Les anciennes notes V0.29 ci-dessous décrivent le mode local et l'historique du projet.

## Modes local, distant TEMP et mock

`src/leaderboard/config.js` centralise `LEADERBOARD_CONFIG` : `mode: 'local'` par défaut, `baseUrl: ''` (même origine), délai réseau de 2 500 ms. Aucun paramètre d'identité ou secret dans la configuration. Aucun appel réseau de classement en mode local.

Pour les tests explicites seulement, sur une adresse locale avec `debug=1` :

- `?debug=1&leaderboard=remote` : vrai backend TEMP, via ses relais CGWeb.
- `?debug=1&leaderboard=mock` : réponses simulées, aucun réseau. Bandeau **DISTANT / MOCK** distinct de **DISTANT / TEMP**.
- Ajouter `&mock=anonymous`, `&mock=offline` ou `&mock=post-error` pour les erreurs simulées.
- Retirer les paramètres revient au mode local. **PASSER EN LOCAL** coupe également le distant pour la page courante, y compris les futures soumissions ; un rechargement avec les paramètres réactive le test.

Ces choix ne sont pas persistés. Une origine extérieure est refusée. Avant toute identité ou performance distante, `RemoteAPI` exige la marque du serveur de test `/__mine_temp__/status`. Le serveur habituel 5177 ne fournit pas cette marque. Ce contrôle est un verrou de développement, pas une authentification : le garde TEMP du backend reste l'autorité et n'a pas été modifié.

## Stockage, identité et soumission

`LeaderboardService` conserve `LocalLeaderboardStore` et peut recevoir `RemoteLeaderboardStore`. Les composants UI n'effectuent aucun fetch. `RemoteAPI` gère credentials, absence de cache, refus des redirections, timeout (y compris lecture JSON) et erreurs. `PlayerIdentityService` utilise `/api/player/identity` et garde en mémoire seulement les trois champs publics. Aucun cookie/token n'est lu par JavaScript ni copié dans localStorage. Sans session : **NON CONNECTÉ**, consultation autorisée, aucune tentative de POST par le store.

À la fin d'une run, `RunPerformance` fournit son résultat une seule fois. Le service met d'abord à jour les records locaux, puis tente le POST `/api/mine/runs` avec exactement `zone_id`, `max_wave`, `completed`, `duration_ms`, `weapon_id`, `client_version`. Aucun `player_id`, pseudo ou identifiant local de run n'est envoyé. Les bornes TEMP (durée minimale/maximum, victoire vague 20, etc.) sont vérifiées avant envoi ; une défaite trop courte reste locale.

Un garde en mémoire par `run_id` empêche les appels simultanés ou répétés de produire plusieurs POST pendant la page courante. Échec, timeout ou session absente ne déclenchent aucun retry automatique ; une réponse perdue reste un résultat distant **non confirmé**, même si le serveur a éventuellement reçu le POST. Le jeu et l'écran de résultat continuent, avec une notice discrète. Les identifiants de soumission ne sont pas persistés ; aucune ancienne run locale n'est téléversée à l'ouverture du classement.

Lecture distante : `/api/mine/leaderboard/depth`, `/time?zone_id=…`, `/weekly`. Le service conserve strictement l'ordre et les rangs du serveur ; aucune ligne locale ou démo n'est ajoutée. Le joueur courant est reconnu par `player_id`, jamais par pseudo. Les trois onglets et leur mise en page V0.29 sont conservés. En cas d'indisponibilité, le classement **LOCAL / SIMULÉ** est affiché avec une explication, et peut être choisi explicitement. Une vérification TEMP échouée est mémorisée jusqu'au rechargement ; pas de boucle de connexion.

Différences explicites : le distant départage la profondeur par la durée totale de la run (pas le temps d'arrivée à la vague) et utilise le lundi 00:00 **UTC** ; le local conserve intégralement ses règles V0.29. Les classements distants sont limités au top 50. « Absent du top 50 » ne signifie pas qu'aucun record n'existe. Les records locaux restent propres à l'origine du navigateur, indépendants de la session CGWeb sélectionnée en test.

## Banc TEMP reproductible (aucune modification CGWeb)

Depuis ce dossier, dans deux terminaux de test :

1. Lancer `tests/v030-temp-backend.py` avec le Python de l'environnement CGWeb et l'option `-B`. Il crée une base éphémère et deux comptes synthétiques, importe le backend existant, bloque toute connexion SQLite hors de cette fixture, désactive le lifespan et neutralise le chargement des secrets. Écoute uniquement `127.0.0.1:5186`.
2. `node tests/v030-temp-server.mjs` : hôte local `127.0.0.1:5185`, fichiers du prototype et véritables modules proxy CGWeb importés sans modification. L'origine 5185 est autorisée uniquement dans la mémoire du processus backend TEMP ; aucun CORS de production n'est modifié.
3. Ouvrir `http://127.0.0.1:5185/?debug=1&leaderboard=remote&qa=1`. Le panneau QA propose sessions synthétiques A/B, absence/session invalide, soumissions contrôlées, double appel et panne. Ces commandes sont absentes du serveur normal et ne se montrent qu'avec `debug=1`. Les boutons de victoire injectent des résultats de test ; ils ne constituent pas des parties jouées entièrement.
4. `node tests/v030-temp-integration.mjs` vérifie deux joueurs, cinq soumissions et les trois classements via HTTP et les vrais relais. Aucune vraie session n'est utilisée. `node --test tests/remote-leaderboard-v030.test.js`, puis `npm.cmd test`.
5. Arrêter uniquement ces deux processus (Ctrl+C). Le backend ferme/supprime sa fixture TEMP et écrit `tests/v030-temp-db-report.json`. Aucun serveur CGWeb réel ou serveur normal 5177 n'est redémarré.

Les chemins du projet CGWeb utilisés par ce banc sont explicites dans les scripts de test. Pour un autre poste, adapter ces chemins au checkout de test autorisé, jamais à une DB réelle. Le serveur normal, les sauvegardes et le gameplay n'utilisent aucun de ces scripts.

## Limites et étape 4 future — non réalisée

Validation anti-triche permissive du backend, résultats déclaratifs, pas d'idempotence serveur durable ni protection contre le rejeu la semaine suivante. Le garde local ne remplace pas un identifiant de run et un reçu serveur. Le mock ne prouve pas la connectivité réelle ; les tests TEMP réels sont documentés séparément. Aucun mode production n'est ajouté.

Avant toute production : validation humaine distincte, politique d'activation de base, migration approuvée, protection anti-rejeu serveur, sécurité/charge, origine commune et déploiement contrôlé. Ne pas retirer le garde TEMP ni ouvrir CORS 5177 à cette étape.

# Historique V0.29 : Classement de la Mine local

## V0.29 — Classement local / simulé

Entrée **CLASSEMENT** sur l'accueil, sous « Explorer la Mine ». Trois onglets : **PROFONDEUR**, **TEMPS**, **HEBDO**. Les dix profils fictifs portent le suffixe **DÉMO** ; **JOUEUR LOCAL · VOUS** est mis en avant et son rang reste indiqué au-dessus de la liste, même s'il est plus bas. Aucun compte joueur, backend, connexion CGWeb ni partage entre joueurs.

### Performances et classement

- Ordre central dans `src/leaderboard/records.js`, issu du catalogue de zones jouables : Galeries (1), Voies abandonnées (2), Puits 59 (3), Faille de Grisou (4). Les zones réservées sont exclues.
- Profondeur : zone décroissante, puis vague décroissante ; égalité départagée par le temps d'arrivée à cette vague, si connu, croissant. Une égalité parfaite partage le même rang. Le temps total passé ensuite à survivre ne pénalise pas ce record.
- Temps : meilleure **victoire complète de 20 vagues** par joueur et par zone, temps croissant. Sélecteur des quatre zones, arme affichée, précision à la milliseconde. Aucun filtre par arme.
- Hebdo : meilleure profondeur de la semaine locale, mêmes règles de tri. Lundi 00:00 à lundi suivant 00:00 exclusif. La semaine retenue est celle de la fin de run, y compris pour une run commencée la semaine précédente. Le nouveau cycle efface uniquement le record hebdomadaire ; les records permanents restent.
- Enregistrement automatique en fin de run, victoire ou défaite. Zone, vague maximale, succès, durée de jeu hors pauses, arme, début/fin horodatés, version et kills sont conservés. L'observateur mesure séparément le temps d'arrivée à la vague sans modifier `Run`, ses dégâts ou son hasard.
- Aucun historique illimité : une profondeur, au plus quatre meilleurs temps, un record hebdomadaire et la dernière run. Une run interrompue par fermeture/rechargement avant son résultat n'est pas enregistrée. Aucune reconstruction de vieilles runs à partir des zones déjà débloquées.

### Stockage et service

`LocalLeaderboardStore` utilise exclusivement **`la-mine-v2:leaderboard-local:v1`**. La sauvegarde de progression, les ressources, Contrats de la Mine, Talents, Atelier, Relève et Caisses du Mineur ne sont pas modifiés par le classement. Une ancienne sauvegarde commence simplement sans record. Les dix profils de `src/leaderboard/demo.js` sont des données de présentation en mémoire et ne sont jamais sauvegardés dans les records du joueur.

L'écran appelle `LeaderboardService.getBoard({category, zoneId}, now)` et ne connaît pas `localStorage`. Le service expose aussi `recordPerformance(performance, now)`. Interface du store : `read(now, query)` → `{state, available, entries?}` et `record(performance, now)` → `{ok, reason?}` ; retours immédiats ou promesses acceptés. `entries` pourra remplacer le jeu de démo via un futur `RemoteLeaderboardStore`, sans changer le contrat de données de l'écran. Aucun adaptateur réseau n'est implémenté.

Chaque mise à jour des records se fait en une écriture après relecture du stockage. Une écriture échouée ne remplace pas le record sauvegardé ; le service garde temporairement les meilleurs résultats en mémoire pour réessayer à l'ouverture du classement. Une sauvegarde illisible ou d'une version inconnue n'est pas écrasée. Le retour de l'horloge en arrière ne restaure pas une ancienne semaine.

### API future — documentation uniquement

Envoi envisagé, **non implémenté et jamais envoyé en V0.29** :

```json
{
  "player_id": "identité établie par le futur serveur",
  "zone_id": "rift",
  "max_wave": 20,
  "completed": true,
  "duration_ms": 765933,
  "weapon_id": "grisoux",
  "run_started_at": "2026-10-08T10:00:00.000Z",
  "run_finished_at": "2026-10-08T10:15:00.000Z",
  "client_version": "0.29.0"
}
```

Le format local ajoute `run_id`, `depth_reached_ms` et `kills`. Une future API devra définir une clé d'idempotence, une période serveur stable et des règles de départage partagées. Build/perks, checksum et métadonnées anti-triche pourront être ajoutés ensuite. Le serveur devra établir l'identité authentifiée et contrôler temps minimum plausible, zone réellement débloquée, vague valide, arme autorisée, version supportée, fréquence d'envoi, doublons et cohérence de progression. Une simple déclaration cliente « 2:03 » ne devra pas suffire.

### Debug et limites

Page locale `/src/debug.html?debug=1` : pseudo de test (24 caractères maximum), Puits 59 vague 14, victoire Voies en 8:20 puis amélioration à 7:30, nouvelle semaine et **RESET CLASSEMENT DEBUG**. Les simulations modifient uniquement les records locaux et sauvegardent leur état initial. Le reset le restaure exactement, sans toucher au reset des zones. Après une semaine avancée artificiellement, utiliser ce reset avant les vraies runs pour revenir au cycle réel. Les commandes restent masquées et refusées hors adresse locale ou sans `debug=1`.

Classement purement indicatif et modifiable via le navigateur ou l'horloge : aucun anti-triche local crédible, aucune synchronisation entre appareils ou IP. Les profils démo ne sont pas des performances humaines mesurées. Un échec de stockage suivi d'une fermeture peut perdre les résultats encore en mémoire ; plusieurs onglets écrivant strictement en même temps n'ont pas de transaction inter-onglets. Pas d'impact économique, pas de récompenses de classement. Essais mobiles émulés sur PC.

### Validation V0.29

Base : **628 tests conservés**. Tests ajoutés sur tri, temps, égalités, progression hebdomadaire, validation des données, volume borné, séparation démo/profil, rechargement, échecs d'écriture, adaptateur asynchrone, observateur passif, debug et absence de réseau. Empreintes de tous les modules de gameplay et systèmes non concernés comparées à `tests/v029-before-hashes.json`. Snapshot conservé : `tests/v029-before-src-snapshot`.

Résultat : **660/660 tests réussis** (32 nouveaux), rapport `tests/v029-final-tests.txt`. Navigateur : record Puits 59 / vague 14 conservé après rechargement ; temps Voies amélioré de 8:20 à 7:30 avec Mitraillette, passant de #2 à #1 dans la démo ; aucune victoire Puits créée par la simulation de défaite. Reset de semaine : hebdo vide, profondeur et temps permanents conservés. Pseudo debug et restauration des records initiaux vérifiés. Le branchement de fin de run est également contrôlé avec une défaite QA dans la vraie scène : apparition en Profondeur, exclusion des Temps.

Affichage et navigation vérifiés en **320 × 568** et **390 × 844**, sans débordement horizontal ni erreur console. Données bornées sous 5 Ko après 2 000 soumissions testées ; liste de 11 lignes au maximum et aucune nouvelle boucle de calcul en combat, hormis l'observation de la vague courante. Preuves : `tests/v029-browser-validation.json`, `tests/v029-scene-registration.txt`, `tests/v029-browser-console.json`, `tests/v029-times-320.jpg`, `tests/v029-times-390.jpg`, `tests/v029-week-reset-390.jpg`. Aucun essai sur téléphone physique dans cette validation.

Aucun commit/push. Aucun accès à CGWeb ni à l'ancienne La Mine. Arrêt après V0.29, sans V0.30.

## Historique V0.28 : Contrats de la Mine

## V0.28 — Contrats de la Mine

Page **CONTRATS** dans la navigation principale : trois quotidiens, trois hebdomadaires, progression, état, récompense et bouton **RÉCUPÉRER**. Un badge compte les récompenses disponibles, bonus compris. **CONTRATS C2G · BIENTÔT** est une simple réservation visuelle, sans lien ni service externe. Aucun changement au gameplay, aux armes, perks, boss, ennemis ou budgets des quatre zones.

### Cycles et suivi

- Date locale : reset quotidien à 00:00, hebdomadaire le lundi à 00:00. La date du prochain reset est affichée. Les gains non récupérés du cycle expiré sont perdus.
- Rotation déterministe : un objectif combat, un objectif progression, un objectif variété/activité. Pas de trois objectifs de kills ou de trois armes simultanés ; ensembles consécutifs différents. Le contrat Faille n'est proposé que si elle est accessible lors de la création du cycle.
- Éliminations et boss individuels, plus haute vague atteinte, arrivées à la vague 20, victoires, armes utilisées/gagnantes, collecte physique Charbon/Fer, Coup de Grisou, choix et perk épique, ouvertures de Caisses.
- « Jouer une run avec une arme » exige victoire ou défaite après au moins 60 secondes et une vague terminée. Les victoires exigent les 20 vagues. Le contrat épique compte sa sélection. Une arme gagnante compte une seule fois dans un objectif de diversité.
- L'observateur reste extérieur à `Run` et ne modifie ni son état ni ses tirages aléatoires. Les seuls événements de collecte en run alimentent les contrats de ressources : Relève, Caisses, première victoire et récompenses de contrats n'y contribuent pas.
- Sauvegarde de la progression aux événements pertinents, sans popup de combat. Une écriture en échec reste en attente en mémoire pour réessai pendant la session. Les récompenses et leur statut récupéré sont enregistrés dans une seule écriture ; un échec ou un portefeuille plein ne consomme pas le gain. Une réclamation relit le stockage et vérifie le cycle.
- Extension facultative du profil v1, anciennes sauvegardes compatibles. Le reset debug des zones reste inchangé et conserve les contrats. Pas de commandes de triche ajoutées au jeu ; les simulations navigateur restent dans le serveur QA local séparé.

### Récompenses et impact économique

Configuration centrale : `src/contracts.js`.

| Cycle complet | Gains directs des 3 contrats | Bonus manuel |
| --- | --- | --- |
| Quotidien | 10 Charbon + 2 Fer | 1 Caisse du Mineur |
| Hebdomadaire | 200 Charbon + 15 Fer + 1 Diamant | 1 Jeton Grisou |

Les gains quotidiens directs sont volontairement inférieurs aux exemples initiaux pour tenir compte du bonus Caisse. Avec la table de Caisses **inchangée**, une caisse représente en moyenne 85 Charbon, 3,5 Fer, 0,18 Diamant et 0,02 Jeton (récompenses alternatives). Le total quotidien moyen vaut donc **95 Charbon, 5,5 Fer, 0,18 Diamant et 0,02 Jeton**, bonus ouvert compris : environ une run des Galeries en Charbon, moins en Fer, une seule fois par jour et sous réserve de terminer les trois objectifs. Une caisse peut ponctuellement dépasser cette moyenne. L'hebdomadaire exige plusieurs runs et ajoute au maximum un Jeton garanti par semaine. Les valeurs restent à affiner avec l'usage humain ; pas de modification de l'économie des runs.

### Validation

Base conservée : **598 tests**. Tests dédiés : compteurs, rotation sur 400 jours, changement de semaine/année, rechargement, états incomplets, récupération unique depuis plusieurs instances, erreurs de stockage, capacité, bonus, exclusion des revenus hors run, compatibilité et empreintes de tous les modules sans lien avec cette intégration. Une run Faille complète avec Grisou X, Atelier 2, dégâts normaux et suivi actif vérifie les six boss, les 278 éliminations, les choix et les quantités collectées (`tests/v028-run.json`).

**627/627 tests réussis** (598 conservés, 29 ajoutés), rapport `tests/v028-final-tests.txt`. Dans le navigateur : simulations des quotidiens et hebdomadaires, récupération manuelle de chaque récompense et des deux bonus, rechargement sans duplication, changement de jour puis de semaine sans altérer les gains acquis (`tests/v028-browser-cycles.json`). Run réelle avec pilotage QA : victoire Faille / Grisou X en **765,93 s simulées**, 2,5 PV restants, les trois quotidiens naturellement terminés mais non réclamés ; hebdomadaires à 278 kills, une arme gagnante et 11 Fer. Rapport `tests/v028-browser-run.json`.

Affichage contrôlé en **320 × 568** et **390 × 844**, sans débordement horizontal ; page défilante, commandes de navigation toujours accessibles. Aucune erreur ni alerte console relevée (`tests/v028-browser-console.json`). Captures `tests/v028-contracts-320.jpg`, `tests/v028-contracts-390.jpg`, `tests/v028-weekly-bonus-390.jpg` et `tests/v028-victory-390.jpg`. Boucle QA moyenne : 4,69 ms pour huit pas simulation/rendu sur ce PC, sans valeur prédictive pour un téléphone physique.

Les sauvegardes et rapports précédents sont conservés. Snapshot avant V0.28 : `tests/v028-before-src-snapshot`, empreintes `tests/v028-before-hashes.json`. Les tests de versions historiques gardent leurs vérifications ; seules les autorisations d'intégration et les étiquettes de version sont adaptées.

Limites du prototype : cycles fondés sur l'horloge et le stockage locaux, sans synchronisation entre appareils/adresses. Un retour de l'horloge en arrière ne rouvre pas un cycle ancien ; avancer manuellement l'horloge ne peut pas être sécurisé sans serveur. Les essais mobiles sont émulés sur PC. Aucun commit/push, aucun accès à CGWeb ou à l'ancienne La Mine. Arrêt après V0.28, sans V0.29.

## Historique V0.27 : La Faille de Grisou

## V0.27 — La Faille de Grisou

Quatrième zone jouable, après une victoire complète au Puits 59. Les anciennes sauvegardes ayant terminé le Puits débloquent aussi la Faille. La cinquième zone, Les Profondeurs, reste fermée. Aucun changement aux combats des Zones 1/2/3 : leurs simulations normales, boss solo et triples sont comparées à la sauvegarde V0.26.

### Contenu

- 20 vagues, boss aux vagues 5/10/15 et triple à la vague 20 ; mêmes Choix du Contremaître, choix épique, trois armes, drops physiques et aspiration.
- Arène anthracite et cuivre, roche fissurée, cristaux et lueurs vertes. Décor et silhouettes générés une seule fois, sans asset externe lourd.
- **Rampant de Grisou** : 52 PV, poursuite à 105 px/s avec zigzag, sans pause d'attaque.
- **Cracheur** : 82 PV, déplacement à 68 px/s, maintien autour de 180–235 px ; poche ciblée verrouillée, télégraphe de 1,3 s, gaz actif 2 s.
- **Éclateur** : 68 PV, 48 px/s puis 91,2 px/s à proximité ; explosion au sol prévenue 1,25 s lorsqu'il est proche ou sous 35 % PV. À la mort : avertissement distinct de 1,1 s puis six éclats radiaux à 95 px/s. Les éclats ne déclenchent pas de nouvelle chaîne.
- Poches ambiantes sur les vagues prévues : deux emplacements, préavis de 1,65 s ; explosion courte (0,55 s) ou gaz persistant (2,2 s). Pas de réaction en chaîne environnementale dans cette version.

### Boss

| Boss | Patterns | Mouvement |
| --- | --- | --- |
| Fendeur | Charge verrouillée de 363 px maximum (330 px/s, 1,1 s), éventail frontal de 8 projectiles, 3 fissures | Approche avec décalage, 78 px/s |
| Souffleur | Cercle de 8 projectiles, 4 poches explosives, souffle conique de 5 projectiles | Distance et déplacement latéral, 86 px/s |
| Cœur de Grisou | Deux cercles de 8 décalés de 22,5°, espacés de 0,65 s ; pluie de 4 zones ; orbe lent éclatant en 6 projectiles après avertissement | Orbite à 94 px/s, +12 % sous 50 % PV |

Pause post-attaque : 0,30 s puis déplacement pendant le reste de la récupération. Télégraphes des boss : 1,15–1,65 s. Aucun projectile à tête chercheuse. Sous 50 % PV, récupération et cycles raccourcis ; Fendeur favorise charge/éventail et Cœur favorise la double salve. Les introductions reprennent les nouvelles répliques de Ravens.

Plafonds exclusifs à Zone 4 : **24 projectiles hostiles**, **4 dangers au sol** dont **3 fissures maximum**, **2 attaques majeures simultanées**. Réservation complète des volées avant leur télégraphe, y compris les 16 projectiles de la double salve. En cas de saturation, l'attaque attend et le boss se replace ; une attaque déjà télégraphiée conserve son avertissement jusqu'au tir. Un boss attend la fin de sa précédente attaque majeure avant d'en superposer une autre. Les six avertissements d'éclats de mort au maximum freinent l'apparition de nouveaux Éclateurs. La collecte attend la fin des dangers déjà déclenchés ; aucune nouvelle poche ambiante n'apparaît après le dernier ennemi.

Le triple utilise des cycles indépendants. Mesure sur 60 s après entrée, avec PV maintenus uniquement pour observer les cycles : **54,10 s** avec au moins deux menaces, **15,58 s** à trois ; sous 50 % globaux, **59,27 s** à deux et **18,63 s** à trois. Maximum de deux majeures, 24 projectiles et quatre zones ; chaque boss parcourt plus de 2 300 px entre ses attaques pendant cette observation. Ce diagnostic sans dégâts est distinct des runs de victoire.

### Progression et récompenses

118 Charbon garantis (+25,5 % vs Galeries), 11 Fer garantis, bonus Diamant de 7 % en plus du tirage existant. Jetons inchangés. **Première victoire : +1 Diamant unique**, enregistré avec la complétion. Le système habituel de Caisses reste inchangé. Atelier, Talents, Relève, perks, armes (dont le build pénétration de Grisou X) et outil debug local sont conservés.

Architecture : configuration, vagues, acteurs, dangers/projectiles et rendu regroupés sous `src/rift/`. Les plafonds existants des trois premières zones restent inchangés. Sauvegarde avant modifications : `tests/v027-before-src-snapshot`, `tests/v027-before-hashes.json` et fichiers associés ; toutes les archives antérieures sont conservées.

### Validation et limites

**596/596 tests réussis** : 557 tests existants conservés, 39 ajoutés. Les trois armes terminent les 20 vagues avec dégâts normaux, Atelier 2 et aucun Talent :

| Arme | Résultat | Durée simulée | PV restants |
| --- | --- | ---: | ---: |
| Fusil à pompe | Victoire | 967,92 s | 5 |
| Mitraillette | Victoire | 975,02 s | 2,5 |
| Grisou X | Victoire | 765,93 s | 2,5 |

Run navigateur complète : victoire Grisou X en **765,93 s**, 278 ennemis éliminés, six choix, quatre rencontres de boss ; maximum de 18 projectiles, quatre zones au sol et deux majeures. Trois boss engagés observés et capturés pendant le triple. Les nouveaux mobs et les neuf patterns de boss ont également été observés individuellement. Déblocage et complétion persistent après rechargement ; la deuxième victoire ne redonne pas le Diamant unique. Zone 5 toujours verrouillée.

Affichage contrôlé en **320 × 568** et **390 × 844**, sans débordement horizontal ni erreur console relevée. Moyenne CPU de la boucle QA : **9,91 ms pour huit pas simulation/rendu** sur ce PC ; ce chiffre ne mesure pas les performances d'un téléphone. Rapports navigateur : `tests/v027-browser-run.json`, `tests/v027-browser-triple.json`, `tests/v027-browser-observations.json`, `tests/v027-browser-console.json`. Captures : `tests/v027-victory-320.jpg`, `tests/v027-victory-390.jpg`, `tests/v027-run-320.jpg`, `tests/v027-triple-390.jpg` et fixtures par pattern.

Rapports : `tests/v027-final-tests.txt`, `tests/v027-run-shotgun.json`, `tests/v027-run-smg.json`, `tests/v027-run-grisoux.json`, `tests/v027-triples.json`. Les runs automatisées utilisent Atelier 2, aucun Talent, les PV/dégâts normaux et des choix déterministes. Les fixtures visuelles sans tir ni dégâts servent seulement à observer les patterns.

La cible de +20–30 % de pression ressentie reste une intention d'équilibrage, pas un résultat mesurable à partir d'un pilote automatique. La pression supplémentaire vient des déplacements, poches, volées et chevauchements, mais le ressenti tactile, les builds faibles et les performances sur téléphone physique restent à confirmer. Les tests mobiles sont émulés sur PC. Aucun commit/push, aucun accès à CGWeb ou à l'ancienne La Mine. Arrêt après V0.27, sans V0.28.

## Historique V0.26 : Mobilité du combat

V0.26 repart des 516 tests validés, après la correction des triples (package précédent 0.24.0).

## V0.26 — Déplacements entre les attaques

Les neuf boss reprennent leur mouvement après **0,25 à 0,40 s** de pause post-attaque. Le temps restant du cycle sert au repositionnement : les cadences, télégraphes, patterns et durées des dangers existants sont conservés. Les charges restent rectilignes et verrouillées. Les zones déjà posées restent à leurs coordonnées initiales.

- Haveuse / Chef de Gare / Cageur : approche et léger décalage pour changer d'angle.
- Crachefer / Aiguilleur : déplacements latéraux à distance cible ; Effondreur change de position entre ses zones.
- Locomotive : pression lente à 32 px/s ; Compresseur : déplacement latéral à 38 px/s.
- Grisou : orbite à 76 px/s, plus mobile que le Cageur (66) et le Compresseur (38).
- Foreur : charge verrouillée à **320 px/s pendant 1,15 s**, soit **368 px maximum**, arrêt propre au mur ; déclenchement possible jusqu'à 340 px. Télégraphe de 1,3 s conservé ; récupération de 0,45 s, déplacement dès 0,30 s.
- Sondeur : distance cible **190–245 px**, fuite à **86 px/s**, repositionnement à 62 px/s ; attaques possibles dans la bande 160–285 px. Il reste rattrapable et conserve ses zones de sonde.
- Grisouteux : **85 px/s** (+25 %), **95,2 px/s** à moins de 150 px. PV/dégâts inchangés, explosion toujours télégraphiée pendant 1,5 s.
- Foreuse / Draisine : pause de 0,30 s puis repositionnement pendant leur récupération ; volées et temps de recharge conservés.

Le déplacement utilise des vecteurs normalisés et une courte réorientation vers l'intérieur près des murs, sans pathfinding. Le coordinateur des triples, les patterns, plafonds (8 projectiles / 3 zones Puits / 2 Wagons), armes, hitbox, Rat, Mineur, Wagon, visuels et systèmes de progression restent inchangés. Les boss bloqués par les deux attaques majeures autorisées continuent à se replacer.

Validation automatisée : **545/545 tests** (516 conservés, 29 ajoutés). Les assertions anciennes liées à une récupération statique ont été adaptées ; les comparaisons historiques « seul le triple change » restent exécutées contre la sauvegarde antérieure, avec de nouveaux contrôles V0.26 sur le code courant. Une salve circulaire n'est plus exigée dans chaque victoire rapide : ses tests dédiés vérifient toujours son émission. Les neuf runs complètes courantes restent vérifiées avec Atelier 2, sans talents, sans invulnérabilité ni bonus de dégâts QA.

| Zone | Fusil | Mitraillette | Grisou X |
| --- | ---: | ---: | ---: |
| Galeries | victoire · 440,75 s | victoire · 493,85 s | victoire · 492,80 s |
| Voies abandonnées | victoire · 675,22 s | victoire · 714,97 s | victoire · 705,90 s |
| Puits 59 | victoire · 647,40 s | victoire · 858,50 s | victoire · 823,62 s |

Mesures des triples sur 60 s après entrée, à PV maintenus pour observer leurs cycles (diagnostic séparé des preuves de victoire) : deux boss engagés pendant 51,97 / 37,00 / 33,55 s en première moitié ; 55,58 / 47,33 / 43,37 s en seconde moitié. Quelques séquences à trois menaces dans chaque zone, deux majeures maximum ; plus longue accalmie observée : 0,80 s. Données : `tests/v026-triples.json`, `tests/v026-runs.json`, `tests/v026-final-tests.txt`.

Validation navigateur finale : run complète du Puits 59 avec Grisou X / Atelier 2, victoire en **823,62 s**, 284 kills, les quatre combats de boss remportés ; 8 projectiles et 3 zones au maximum. Les observations individuelles des neuf boss et cinq mobs sont séparées de cette run (fixtures sans tir ni dégâts uniquement pour observer les déplacements). Le triple a été capturé avec trois boss engagés et deux majeures. Affichage vérifié en **320 × 568** et **390 × 844**, sans débordement horizontal ni erreur console. Moyenne CPU de la boucle QA : **7,70 ms pour huit pas simulation/rendu** sur ce PC ; ce chiffre ne mesure pas les performances d'un téléphone. Rapports : `tests/v026-browser-run.json`, `tests/v026-browser-triple.json`, `tests/v026-browser-mobility-isolated.json` ; captures `tests/v026-victory-320.jpg`, `tests/v026-victory-390.jpg`.

Réserves : essais mobiles émulés sur PC ; ressenti tactile et performance Android physique à confirmer. Les victoires couvrent les trois armes avec Atelier 2 et des choix déterministes, pas tous les builds ni tous les niveaux d'Atelier. Les attaques conservent leurs phases immobiles justifiées (télégraphes, rafales, charges), seule l'attente entre les attaques est rendue mobile.

Sauvegarde antérieure : `tests/v026-before-src-snapshot`, empreintes `tests/v026-before-hashes.json` et fichiers de sauvegarde associés. Toutes les archives précédentes sont conservées. Aucun commit/push. Arrêt après V0.26, sans V0.27.

## Historique V0.24 — Le Puits 59

Projet exclusif : C:\LaMineV2\la-mine-v2-v01. Aucun commit/push.

## V0.24 — Le Puits 59

### Ajustement ciblé — triples simultanés

Cet ajustement concerne **les trois finales**, à la demande du test joueur. Leurs boss gardent des cycles indépendants, avec **deux propriétaires d'attaque majeure maximum**. Le troisième peut préparer/émettre un tir simple ou un éventail léger. Charges, Wagons, dangers au sol et cercles consomment ce budget jusqu'à la fin de leurs effets ; même les projectiles persistants d'un boss mort restent comptés. Il n'existe pas de tour de rôle imposé.

Les ouvertures démarrent à 0,9 / 1,35 / 1,8 s après l'apparition, avant accélération des temps d'attente. Seuls les compteurs de poursuite/repositionnement et de récupération sans danger au sol sont raccourcis : facteur **0,72**, puis **0,55 sous 50 % des PV initiaux cumulés**. Les boss tués comptent comme zéro PV pour ce seuil. Vitesses de déplacement, durées de charge, télégraphes et durées des dangers ne sont pas accélérés.

Une attaque majeure attend par petits délais si les deux places sont occupées. Au Puits, deux attaques au sol peuvent donc coexister, ou une zone et un cercle ; l'ancien verrou exclusif est retiré. Si un tir ne peut sortir à cause du plafond de projectiles, son télégraphe reste visible et il réessaie après **0,35 s**. Plafonds conservés : **8 projectiles hostiles, 3 zones dans le Puits, 2 Wagons invoqués**. Les cercles simultanés et les croix ferroviaires en triple restent interdits.

Observation déterministe de 60 secondes, trois boss maintenus vivants pour comparer les cycles (ce diagnostic ne sert pas de preuve de victoire). « Engagés » inclut préparation visible et effets encore présents :

| Finale | ≥2 engagés avant / après | ≥2 sous 50 % après | 3 engagés après, haut/bas PV | Plus longue pause après, haut/bas PV |
| --- | --- | --- | --- | --- |
| Galeries | 46,15 / 52,62 s | 55,85 s | 19,18 / 27,48 s | 0 / 0 s |
| Voies | 29,95 / 36,72 s | 46,02 s | 5,80 / 9,20 s | 0,72 / 0 s |
| Puits | 14,47 / 33,47 s | 42,80 s | 2,22 / 13,98 s | 0,63 / 1,12 s |

Les chevauchements ne se limitent pas aux avertissements : au Puits, au moins deux boss ont des effets **déjà dangereux** pendant 8,67 s (12,60 s à bas PV), contre 1,97 / 3,02 s avant. Deux attaques majeures maximum dans tous ces relevés. Rapport reproductible : `tests/v024-overlap-metrics.json` et `tests/triple-overlap-metrics.mjs`.

**516/516 tests réussis**, dont les 503 précédents conservés/adaptés et 13 contrôles supplémentaires. Les neuf runs complets actuels (trois armes × trois zones) gagnent sans neutralisation des dégâts. Des comparaisons déterministes confirment que vagues normales et boss solo restent identiques. Les trois fichiers de production modifiés sont `run.js`, `bosses.js`, `shaft-actors.js`, avec la nouvelle coordination centralisée dans `triple-pressure.js`. Sauvegarde : `tests/v024-pre-overlap-src-snapshot`, manifeste associé ; aucun ancien snapshot supprimé.

Validation navigateur du Puits avec Grisou X, Atelier 2, sans Talents et pilote QA légal : **victoire en 744,57 s**, triple en **41,42 s** (32,92 s avant l'ajustement), 5,5 PV restants. Capture réelle de charge + vapeur + gaz : trois boss engagés, deux majeurs. Formats **320 × 568 / 390 × 844**, aucune erreur ni avertissement console. Moyenne mise à jour/préparation du rendu **4,791 ms**, huit pas QA par image et pilote inclus, hors présentation GPU ; pics de huit projectiles, trois zones et 19 effets. Rapports : `tests/v024-overlap-final-tests.txt`, `tests/v024-overlap-browser.json`, captures `tests/v024-overlap-*.png`. Le dernier correctif d'invocation concerne uniquement les Voies et est couvert par le test d'émission en fin d'image.

Limites : mesures déterministes et formats mobiles émulés, sans téléphone physique. Le ressenti humain reste à confirmer ; la comparaison de cycles à PV fixes et la run jouée automatiquement sont deux validations distinctes. Aucun changement de boss solo, armes, économie, progression ou sauvegarde, aucun commit/push. Arrêt sur cette correction V0.24.

La description ci-dessous documente la livraison initiale V0.24 ; les règles de triple de ce paragraphe remplacent ses restrictions d'exclusivité et ses anciens temps de récupération.

Troisième zone jouable après une victoire complète dans **Les Voies Abandonnées**. Les anciennes sauvegardes ayant déjà cette victoire la débloquent automatiquement, sans nouveau diamant de Zone 2. La première victoire du Puits ajoute **un diamant unique**. Déblocage, achèvement et récompense sont enregistrés dans l'extension compatible du profil local v1 ; la Zone 4 reste verrouillée.

### Contenu et combat

**20 vagues**, boss aux vagues 5/10/15, triple à la vague 20, mêmes choix du Contremaître et choix épique. Le décor anthracite/acier, les poutres, câbles et marquages de sécurité ainsi que six silhouettes sont dessinés localement et mis en texture une seule fois. Aucun téléchargement, shader ou dépendance ajouté.

| Machine | Comportement |
| --- | --- |
| Foreur de fond | Mêlée lourde, 105 PV, vitesse 46 px/s. Charge droite de 0,4 s à 220 px/s, précédée de 1,3 s de préparation. Direction verrouillée. |
| Sondeur | 65 PV ; garde environ 170–235 px de distance. Marque un impact de rayon 36 px, avertissement de 1,5 s puis danger de 0,7 s. |
| Grisouteux | 48 PV, approche puis explosion de rayon 62 px. Avertissement de 1,5 s, danger de 0,7 s et récupération. Ne se sacrifie pas et ne déclenche pas de chaîne d'explosions ennemies. |
| Le Cageur | Charge lourde, impact frontal court, câble vertical de 180 px, télégraphié et limité en largeur. |
| Le Compresseur | Jet de vapeur en éventail de trois projectiles, souffle radial de six (parfois huit sous 50 % en solo), poche de pression temporaire. |
| Le Grisou | Deux petites poches de gaz en solo, explosion retardée, tir énergétique simple. |

Les PV des boss solo sont **1600 / 2100 / 2400**. Sous 50 % PV, leur récupération raccourcit de 14 %. En triple, PV à 78 %, ouvertures espacées de 1,7 s, récupération allongée, une seule poche de gaz et cercles de six seulement. Un seul propriétaire de danger au sol à la fois en triple ; réservation d'un cercle et nouvelles zones au sol s'excluent. Les tirs restent lents, fixes après émission et limités par le pool existant de huit.

**Instabilité :** présente sur 11 vagues normales, jamais pendant les boss. Premier avertissement après 5 s, puis intervalle de 10 à 7 s suivant la profondeur. Alternance entre la position du joueur et des points fixes de machinerie ; rayon 42 px, avertissement de 1,6 s, danger de 1 s, dégâts de 0,5. Tous les impacts sont verrouillés et disparaissent proprement. Le plafond partagé de **trois zones** inclut Sondeurs, Grisouteux et sol instable ; les zones des ennemis morts sont annulées. Les pauses et transitions suspendent/nettoient les dangers. Les tirs des trois armes, morts, drops et Coup de Grisou réutilisent les systèmes existants.

Les occasions d'apparition sont environ **20 % plus rapprochées** que la moyenne de chaque palier des Voies. Le plafond reste de **12 ennemis**, dont au plus deux Sondeurs et trois Grisouteux. Cette mesure est un réglage de rythme, pas une mesure de difficulté ressentie : les télégraphes et les plafonds priment sur la densité.

### Récompenses et validation

Budget garanti : **113 Charbon et 10 Fer**, contre 94/8 dans les Galeries et 108/9 dans les Voies. Chance supplémentaire de 5 % d'un diamant au final ; règles des Jetons et des Caisses inchangées. Le diamant de première victoire est distinct de ce petit bonus aléatoire.

**503/503 tests réussis** : les 478 existants sont conservés/adaptés et 25 tests couvrent le Puits, le déblocage, la compatibilité, les attaques, collisions, télégraphes, zones sûres, budgets et trois runs complets. Les six runs V0.23 des Zones 1 et 2 continuent de tester le code actuel et gagnent. Leurs configurations et leurs récompenses sont comparées directement au snapshot V0.23 ; armes, perks, Talents, Atelier, Relève, Caisses et anciens visuels restent protégés par SHA-256. Rapports : `tests/v024-baseline-tests.txt`, `tests/v024-final-tests.txt`. Les essais exploratoires sont conservés dans `tests/v024-initial-runs.json`.

**Navigateur :** run complète avec Grisou X, Atelier 2, sans Talents, pilotage QA par entrées de déplacement et choix légaux : victoire en **736,07 s**, 5,5 PV restants, 284 éliminations, six choix. Boss : environ **35,38 / 46,75 / 53,22 / 32,92 s**. Récompenses, diamant unique et état terminé vérifiés après rechargement sur un profil QA isolé. Les trois armes gagnent aussi le Puits dans les tests de simulation du code actuel. Le déblocage navigateur utilise une fin de run Zone 2 contrôlée ; la run complète du Puits utilise le vrai combat.

Contrôles visuels des trois ennemis, des trois boss, du triple et des dangers en **320 × 568 et 390 × 844**, sans erreur ni avertissement console. Moyenne navigateur de mise à jour/préparation du rendu : **6,625 ms**, avec huit pas de simulation et le pilote par image, hors présentation GPU. Pics : **3 dangers au sol, 8 projectiles, 20 effets** sur un pool de 48. Rapport : `tests/v024-browser.json`, captures : `tests/v024-*.png`.

**Limites :** silhouettes légères provisoires, vapeur représentée par un éventail de projectiles. Pas de dommages entre ennemis lors des explosions de Grisouteux. Le gain de difficulté ressentie de 15–25 % reste à confirmer en jeu humain : un pilote qui lit les télégraphes finit encore avec toute sa vie. Les tests couvrent quelques builds et graines, pas toutes les combinaisons. Aucun test sur téléphone physique ; les formats mobiles sont émulés sur PC.

Sauvegardes avant modification : `tests/v023-final-src-snapshot`, `tests/v023-final-hashes.json` et fichiers `.backup`, sans suppression des archives précédentes. Aucun changement de gameplay des Zones 1/2, aucun accès à CGWeb ou à l'ancienne La Mine, aucun commit/push. **Arrêt après V0.24, sans V0.25.**

## Historique — V0.23 — corrections et patterns retenus

**Chef de Gare :** le bug venait du garde global qui refusait toute nouvelle invocation dès qu'un Wagon invoqué était encore vivant. Les Wagons arrêtés conservaient également cette place. La reproduction préalable confirme une première invocation réussie et une seconde refusée (`tests/v023-wagon-bug-before.json`). La limite devient **deux Wagons invoqués simultanément**. À la limite, le boss choisit une charge télégraphiée. Si une position sûre devient indisponible pendant l'avertissement, une nouvelle charge reçoit son télégraphe complet : aucune invocation vide. Les Wagons invoqués terminent leur course au bord, deviennent inoffensifs puis s'effacent en 0,6 s. Leur disparition ne rapporte rien. Les Wagons ordinaires, leurs visuels, hitboxes et ciblage sont inchangés.

**Projectiles :** Crachefer tente un cercle toutes les quatre attaques ; l'Aiguilleur toutes les six, parmi ses attaques à distance. Les tirs simples et éventails de trois à ±22° restent présents. Les cercles comportent **six projectiles**, ou occasionnellement huit sous 50 % PV en solo (un cercle sur deux). Les cercles successifs alternent leur rotation de 0° à un demi-secteur (30° pour six, 22,5° pour huit). Avertissement de **1,5 s**, vitesse **105 px/s**, portée maximale **420 px**, dégâts **0,5**, sans guidage. Les directions sont verrouillées pendant le télégraphe.

Le pool reste limité à **huit projectiles hostiles**. Un cercle réserve ses places dès son avertissement ; il n'est jamais émis partiellement. Si la place manque, le boss conserve son petit pattern. Un seul gros cercle à la fois ; aucun éventail de boss ne vient s'y superposer. En triple, cercles de six uniquement, avec les décalages d'ouverture existants. Les autres boss gardent leur identité et leurs attaques.

**Aiguillage :** alternance stricte des rails horizontaux et verticaux, avec positions verrouillées sur le joueur au début de l'avertissement. Deux rails parallèles en solo, un en triple. Télégraphe de **1,25 s**, danger actif **1,15 s**, largeur **16 px**. Sous 50 % PV, une attaque de rails sur quatre peut former une croix : un rail horizontal et un vertical, avertissement allongé à **1,85 s**, quatre zones sûres. La croix est désactivée en triple et ne peut accompagner un autre gros cercle. Les collisions emploient les segments existants, dans les deux orientations.

### Validation V0.23

**478/478 tests réussis : 452 tests conservés/adaptés et 26 nouveaux.** Ils couvrent la reproduction du bug, deux invocations simultanées, le plafond, les replis télégraphiés, le nettoyage, les réservations de projectiles, les cercles et leur rotation, l'absence de guidage, l'esquive, les collisions verticales, la croix et ses zones sûres. Rapport : `tests/v023-final-tests.txt`.

Six runs complets de la version actuelle, **les trois armes dans chacune des deux zones**, se terminent par une victoire avec Atelier 2, sans Talents et avec choix légaux. Plafonds vérifiés : huit projectiles, deux Wagons invoqués, douze ennemis ; six choix du Contremaître et budgets de récompenses conservés. Les anciens replays à résultat strict restent explicitement historiques sur leur snapshot ; les six nouveaux importent directement le code actuel. Rapport initial : `tests/v023-initial-runs.json` ; tests vivants : `tests/boss-polish-v023.test.js` et `tests/v023-simulation.mjs`.

Dans le navigateur, deux runs complets avec Grisou X et pilote QA ont aussi gagné : **Galeries en 481,38 s, 1,5 PV ; Voies en 718,87 s, 5,5 PV**, sans modification des stats en cours de run. Les vingt vagues, les triples, les récompenses et le déblocage sont validés sur un profil isolé. Les fixtures contrôlées montrent deux Wagons simultanés, les rails horizontaux/verticaux, la croix et les cercles de six/huit, en **320 × 568 et 390 × 844**. Aucune erreur ni avertissement console. Rapport : `tests/v023-browser.json` ; captures : `tests/v023-*.png`.

Moyennes observées de mise à jour/préparation du rendu : **2,758 ms (Galeries) et 3,204 ms (Voies)**, avec huit pas de simulation QA par image et pilote inclus, hors présentation GPU. Maximum de huit projectiles et de 27/19 effets actifs (pool inchangé de 48). Ces mesures PC ne constituent pas une mesure de performance Android.

Les trois armes, Grisou X et ses perks, Bottes, Plaques (gameplay et représentation), ennemis normaux, économie, progression, zones et sauvegarde sont protégés par comparaison SHA-256 au snapshot V0.22. Aucun asset ni dépendance ajouté. Sauvegardes préalables : `tests/v022-final-src-snapshot`, `tests/v022-final-hashes.json` et fichiers `.backup`. Les sauvegardes précédentes sont conservées.

**Limites :** ces runs ne couvrent pas toutes les combinaisons de builds. Les triples défensifs restent longs (environ 82 s pour Mitraillette dans les Voies avec Atelier 2) ; aucune refonte générale d'équilibrage n'a été faite. Les formats mobiles sont émulés sur PC, sans mesure sur téléphone physique. Arrêt après V0.23, sans V0.24 ni commit/push.

## Historique — V0.22 : construire son énergie, affronter les machines

**Grisou X de base :** 3 impulsions de 11 dégâts, délai de 0,85 s, portée 350 px, vitesse 620 px/s. Tir uniquement à l’arrêt. Chaque projectile s’arrête sur sa première cible, même s’il la tue. Les projectiles d’une même salve sont indépendants : les suivants peuvent atteindre un autre ennemi si le premier est déjà mort.

### Perks et choix

| Perk Grisou X | Effet et limite |
| --- | --- |
| Conduit perforant | 2 cibles au total, dégâts 100 / 70 %. Un rang. |
| Conduit renforcé | Nécessite Conduit perforant. Deux rangs : 3 puis 4 cibles, dégâts 100 / 70 / 50 / 35 %. |
| Condensateur | +1 impulsion et −12 % dégâts par impulsion, multiplicatif, par rang. Deux rangs maximum : 5 impulsions à 77,44 % chacune. Salve légèrement élargie. |
| Surcharge énergétique | Nécessite Conduit perforant. Après un kill direct, réduit de moitié la perte relative vers la cible suivante : la première transition passe ainsi de 70 à 85 %. Ne prolonge ni la portée ni le nombre de cibles. Un rang. |
| Bobine rapide | +25 % cadence (délai ÷1,25). Un rang ; reste nettement plus lente que la Mitraillette. |
| Arc de Grisou | Un kill direct envoie 35 % des dégâts de l’impact vers le voisin actif le plus proche, à moins de 95 px. Une cible secondaire ; une mort par arc ne génère jamais un nouvel arc. Un rang. |

Le pool conserve Coup de Grisou, Détente allégée, Bottes et Plaques. Les projectiles traversants sont plus larges et les impacts de traversée gardent leur anneau vert. Les arcs utilisent quelques étincelles et le pool d’effets existant, sans texture ni dépendance supplémentaire. Les morts par arc passent par les systèmes de drops et de Coup de Grisou existants ; aucune chaîne d’arcs récursive.

**Bottes :** +30 % vitesse pendant 1,5 s après un tir effectif. Les tirs suivants rafraîchissent le délai sans cumuler le bonus. La vitesse permanente reste intacte ; un cercle discret et le compte à rebours du HUD indiquent le boost.

**Plaques :** une charge par rang, maximum deux. Chaque charge annule entièrement un coup, accorde la protection habituelle après impact, puis disparaît. Pas de minuterie ni de soin ; recharge à chaque nouvelle vague. Une plaque visible accompagne le cercle de protection et « COUP BLOQUÉ ! » avec éclats confirme son utilisation. La protection habituelle empêche plusieurs dégâts superposés de consommer toutes les charges dans la même image.

Chaque choix normal privilégie **une carte d’arme, une offensive générale et une survie/mobilité**. Si un groupe est épuisé, les autres complètent le choix. Cartes uniques, prérequis et rangs plafonnés ; poids réduit pour les perks déjà acquis et fortement stackés, avec Main heureuse conservée. Un trio identique au précédent est remplacé lorsqu’une alternative admissible existe. Les trois effets épiques Grisou X restent ceux de la V0.21 ; aucun changement d’Atelier ou de Talents.

### Boss

Réglages centralisés dans `src/boss-tuning.js` : Haveuse **+35 % PV**, Crachefer **+30 %**, Effondreur **+25 %**, Chef de Gare **+30 %**, Locomotive **+25 %**, Aiguilleur **+30 %**. Pas de plafond de dégâts, de minuterie de survie ni de nouvelle invulnérabilité.

Les délais de déplacement/récupération diminuent ; télégraphes, charges, dégâts individuels et dangers au sol gardent leurs durées et dimensions. Sur un contrôle de 300 secondes à pleine vie, cela représente **environ +10 à +21 % d’entrées en attaque**, selon le boss. Sous 50 % PV, les temps de repos raccourcissent encore. Crachefer et Aiguilleur passent de la moitié à deux tiers de leurs attaques à projectiles en éventail ; les tirs simples et les patterns spéciaux restent présents. Ouvertures des triples boss décalées, un seul éventail de boss actif, huit projectiles hostiles au maximum, comme en V0.21.

Durées mesurées du début du combat à la mort du dernier boss, **Atelier 2, sans Talents**, avec choix légaux et déplacement automatique lisant uniquement les dangers visibles :

| Zone / arme | Boss 5 | Boss 10 | Boss 15 | Triple 20 |
| --- | ---: | ---: | ---: | ---: |
| Galeries · Fusil | 28,0 s | 32,5 s | 38,6 s | 33,5 s |
| Galeries · Mitraillette | 40,0 s | 30,9 s | 36,6 s | 63,4 s |
| Galeries · Grisou X | 32,5 s | 42,1 s | 49,0 s | 41,5 s |
| Voies · Fusil | 40,9 s | 39,2 s | 57,4 s | 51,9 s |
| Voies · Mitraillette | 43,1 s | 39,5 s | 45,5 s | 83,4 s |
| Voies · Grisou X | 38,2 s | 51,0 s | 60,9 s | 55,8 s |

Ces six runs se terminent par une victoire. Sans Atelier, les trois armes ont également terminé chaque zone dans les essais ; Grisou X perd d’abord les Galeries à la vague 17 avec la graine 1, puis gagne avec la graine 2 à 0,5 PV. Avec Atelier 5 et cinq Talents (Bon départ, Premiers secours, Sang-froid, Dernier souffle, Main heureuse), les six runs gagnent. Les boss seuls durent alors environ **17 à 38 s** et les triples **23 à 61 s**. Les mesures ne sont pas des temps minimaux imposés.

### Validation et limites V0.22

**452/452 tests réussis : les 426 existants sont conservés/adaptés et 26 sont ajoutés.** Tests actuels de dégâts, traversée et poursuite après kill, caps, arcs sans récursion, boost, plaques, diversité, prérequis, timings/avertissements et huit replays complets V0.22. Les replays historiques qui exigent des résultats strictement identiques restent explicitement figés sur leurs règles précédentes via les snapshots ; ils ne servent pas à valider l’équilibrage V0.22. Les nouveaux replays importent directement `src/run.js`. Aucune assertion de victoire n’a été remplacée par une défaite attendue.

Rapports de simulation : `tests/v022-final-runs.json`, `tests/v022-shotgun-pilot-check.json`, `tests/v022-boss-frequency.json`. Rapport global : `tests/v022-final-tests.txt`. Le pilote Fusil V0.22 a été corrigé pour lire les dangers ferroviaires au sol avant de choisir sa direction ; il ne modifie aucun PV, dégât, ennemi ou récompense pendant les runs. Les premiers échecs sont conservés dans les rapports exploratoires.

Validation navigateur avec profil QA isolé : **Grisou X gagne les Galeries en 482 s (1,5 PV), puis les Voies en 702,48 s (5,5 PV)**, avec les mêmes choix et résultats que les simulations. Vingt vagues, quatre rencontres boss par zone, récompenses et déblocage conservés. Contrôles base sans traversée, Conduit III, Arc, boost après tir, casse des Plaques, nouvelles cartes longues et triple boss en **320 × 568** et **390 × 844**, sans erreur ni avertissement console. Les captures de trois cartes énergétiques sont une fixture de lecture des textes ; les vrais choix structurés sont dans les captures choice.

Moyennes observées de mise à jour/préparation du rendu : **2,521 ms / 4,390 ms** (Galeries / Voies), avec huit pas de simulation QA par image et pilote inclus, hors présentation GPU. Pics de 27 / 18 effets sur le pool inchangé de 48. Rapport : `tests/v022-browser.json`, captures : `tests/v022-*.png`. Cela ne constitue pas une mesure de performance sur téléphone physique.

Économie, ressources, vagues, zones, Atelier, Talents, Relève, Caisses, progression, sauvegarde, apparences validées et ennemis normaux sont protégés par comparaison SHA-256 à la V0.21. Aucune migration, aucun changement des tirs Foreuse/Draisine, aucune modification de CGWeb ou de l’ancienne La Mine. Snapshot préalable : `tests/v021-final-src-snapshot`, manifeste `tests/v021-final-hashes.json` et sauvegardes `.backup`. Tous les snapshots antérieurs restent conservés.

**Réserves d’équilibrage :** les durées visées sont approximatives. Les builds défensifs et l’obligation d’esquiver prolongent certains boss de Zone 2 au-delà de la cible (jusqu’à ~83 s pour le triple Mitraillette avec Atelier 2). Un build avancé peut finir le triple des Galeries en ~23 s, mais aucun boss du groupe mesuré ne tombe en 10 s. Les builds de test ne couvrent pas toutes les combinaisons ; les performances mobiles sont contrôlées par formats émulés sur PC, sans téléphone physique. Arrêt après V0.22, sans V0.23 ni commit/push.

## Historique — V0.21 : Grisou X et éventails

Troisième arme disponible dès le choix d’équipement : **Grisou X**, prototype énergétique minier à tube lumineux. Tir automatique après immobilisation, selon le même contrôle que les deux armes existantes. Une attaque lance **3 impulsions**, 11 dégâts chacune, toutes les **0,75 s**, avec un écart total de 0,10 rad (~5,7°), une portée de **350 px** et une vitesse de **620 px/s**.

Chaque impulsion traverse au plus **4 cibles distinctes**, dans l’ordre rencontré : **100 / 75 / 55 / 40 %** des dégâts (11 / 8,25 / 6,05 / 4,4 avant améliorations). Elle continue après une élimination comme après une touche non mortelle, puis disparaît à la quatrième cible, à sa portée maximale ou au bord. Une même cible ne peut être frappée deux fois par la même impulsion. Les collisions balayées et les pools existants sont réutilisés.

SVG local compact pour l’arme, cœur vert clair, impulsions lumineuses, impacts verts et anneau de traversée, y compris après une élimination. Les apparences Rat/Wagon validées restent identiques. Les trois cartes d’armes tiennent dans l’accueil mobile. Les perks compatibles et trois effets épiques existants sont réutilisés (Double Canon, Grisou instable, Pluie de fer), sans nouvelle mécanique de progression. Aucune migration de sauvegarde : comme auparavant, le choix d’arme appartient à la session et le bouton Rejouer conserve l’arme.

### Attaques ennemies

- **Foreuse :** alternance éventail / tir simple ; avertissement de 0,9 s conservé et récupération de 1,1 s après un éventail.
- **Draisine :** une salve simultanée de trois projectiles remplace les deux tirs successifs ; avertissement de 0,85 s conservé, récupération de 1,1 s et repositionnement existant.
- **Crachefer :** alternance simple / éventail. **Aiguilleur :** rails / simple / rails / éventail. Les autres patterns des boss restent conservés.

Éventails à **−22° / 0° / +22°**, avec trois trajectoires affichées pendant le télégraphe. La visée suit la position du joueur pendant cet avertissement et se verrouille au départ : aucun guidage ensuite. Vitesse plafonnée à **120 px/s**, dégâts par projectile plafonnés à **0,5 PV**. Le danger vient de la couverture de zone. Le pool reste limité à **8 tirs hostiles** et un seul éventail de boss peut être actif à la fois. Si trois places ne sont pas disponibles, la salve est omise en entier, sans tir partiel ni accumulation différée.

### Validation V0.21

**426/426 tests réussis : 409 tests conservés et adaptés, 17 supplémentaires.** Les tests unitaires utilisent le moteur actuel. Les replays historiques exigeant les anciennes trajectoires ou des résultats strictement identiques emploient explicitement `tests/legacy-volley-run.js` : seuls leurs comportements de tir ennemis sont ceux de la V0.20, tandis que collisions, armes, collecte et progression restent actuelles. Ils ne constituent donc pas une validation des nouveaux éventails. La nouvelle suite `grisou-x-v021.test.js` utilise directement le jeu V0.21 et couvre ces éventails, leur visée, les pools, l’esquive, la pénétration, les kills, les dégâts dégressifs et les runs complètes. Les fichiers de production hors périmètre sont protégés par SHA-256.

Runs complètes du jeu actuel, graine 1, Atelier niveau 2, choix légaux et aucun changement de PV/dégâts pendant la run :

| Zone | Arme | Résultat | Durée simulée | PV finaux |
| --- | --- | --- | --- | --- |
| Galeries | Grisou X | Victoire, 20 vagues, 235 ennemis | 252,78 s | 4,5 |
| Voies | Grisou X | Victoire, 20 vagues, 277 ennemis | 386,65 s | 5,5 |
| Voies | Fusil à pompe | Victoire, 20 vagues, 277 ennemis | 486,40 s | 2,5 |
| Voies | Mitraillette | Victoire, 20 vagues, 277 ennemis | 590,42 s | 3 |

Les deux runs Grisou X ont aussi été exécutées intégralement dans le navigateur avec le pilote QA, aux mêmes résultats. Profil QA isolé, déblocage de Zone 2 après victoire, récompenses et prime de première victoire conservés. Aucun tir en mouvement ; aucun avertissement ni erreur console. Menus, combat, télégraphes, projectiles et triple boss inspectés en **320 × 568** et **390 × 844**. Les 15 apparences chargent correctement. Moyennes de mise à jour/préparation du rendu : **5,247 / 6,252 ms** pour huit pas de simulation QA par image, pilote inclus et présentation GPU exclue ; pics de **22 / 25 effets** sur un pool de 48.

Rapports : `tests/v021-final-tests.txt`, `tests/v021-live-runs.json`, `tests/v021-browser-runs.json`. Captures : `tests/v021-*.png`. Sauvegardes préalables : `tests/v020-final-src-snapshot`, `tests/v020-final-hashes.json` et fichiers `.backup` correspondants. Tous les snapshots antérieurs sont conservés. Aucun commit/push.

**Limites :** première passe d’équilibrage, testée sur des builds et graines déterminés. Grisou X est particulièrement efficace contre les alignements ; les temps de victoire ci-dessus ne garantissent pas l’équivalence des armes sur tous les builds. Les formats mobiles sont émulés sur PC, sans mesure sur téléphone Android physique. Arrêt après V0.21, sans commencer V0.22.

## Historique — V0.20 : personnages et machines

14 nouveaux SVG locaux remplacent les corps de combat : mineur joueur au casque lumineux, Fusil à pompe, Mitraillette, Rat, Mineur grisouteux, Foreuse, Wagon fou, Draisine, Haveuse, Crachefer, Effondreur, Chef de Gare, Locomotive et Aiguilleur. Silhouettes courbes, visages, outils, roues, chenilles et métal ombré différencient les rôles. Les personnages restent debout et se retournent ; les machines et armes suivent leur direction de combat. Les visuels de menu sont conservés.

### Correctif ciblage du Wagon Fou — V0.20

Au spawn de chaque Wagon, le jeu classe les extrémités sûres des quatre rails horizontaux existants (y = 190, 310, 450, 580) selon leur distance verticale au joueur. Le rail le plus proche disponible est choisi ; en cas d’égalité, l’ordre existant départage les côtés. Les points encombrés sont écartés, et le spawn est différé si aucun point sûr n’est disponible. Le Chef de Gare utilise la même sélection pour ses Wagons, avec sa cadence et son plafond d’invocation inchangés.

La trajectoire est verrouillée dès la création, avant le télégraphe. Apparition de 0,7 s puis avertissement de 1,1 s inchangés, charge à 310 px/s, sans virage ni recalage si le joueur change de rail. Le véhicule termine sa course au bord opposé et devient inoffensif. Aucun changement de hitbox (rayon 18), de dégâts ou de visuel.

La marge de spawn est **140 px pour le Wagon seulement** (plus de 110 px entre les hitbox au départ), contre 180 px pour les autres ennemis. L’ancienne marge excluait les deux extrémités du rail exact lorsque le joueur se trouvait au centre de l’arène. Le rail ne se déplace jamais pour compenser une position occupée.

**409/409 tests**, dont les 401 conservés et 8 nouveaux contrôles : proximité du rail, extrémités sûres, obstacles, égalités, verrouillage, absence de poursuite, esquive retardée et invocation. Un manifeste SHA-256 protège tous les autres fichiers de production, y compris les visuels Rat/Wagon validés. Les comparaisons historiques excluent uniquement les lignes de cette politique de spawn.

Le pilote QA lit désormais toute la ligne télégraphiée et évite de traverser un Wagon déjà en charge. Les assertions de victoire, vagues et récompenses sont conservées ; le replay complet Fusil utilise la graine 2 au lieu de 1 après ce changement de comportement, celui de la Mitraillette conserve la graine 1. Aucun gain, PV ou dégât n’est forcé. Rapports : `tests/v020-wagon-target-final-tests.txt`, `tests/v020-wagon-target-browser.json`. Sauvegardes avant correction : `tests/v020-before-wagon-targeting/` et manifeste associé.

Validation navigateur du ciblage : formats 320 × 568 et 390 × 844, rail 310 ciblé puis conservé après esquive, rail 580 terminé sans poursuite et sans dégâts. Run complète Zone 2 à la Mitraillette, Atelier 2 : **victoire, 20 vagues, 277 éliminations, 588,13 s, 1 PV**. Aucune erreur console lors de la validation finale. Téléphone physique non testé ; les replays ne garantissent pas tous les builds. Aucun commit/push, arrêt après ce correctif.

### Correctif visuel Rat / Wagon — V0.20

Rat : arrière élargi, queue rose dégagée et museau clair prolongé. Son profil est retourné horizontalement puis incliné selon le déplacement réel ; il conserve sa direction prévue à l’arrêt. Wagon : caisse arrière plate, capot, gros phare frontal et pare-chocs pointu. Son profil reste debout et suit la direction de charge verrouillée, du télégraphe à la fin de course. Les autres apparences restent inchangées.

396 tests existants conservés, 5 contrôles supplémentaires : huit directions du Rat, état immobile, charge du Wagon dans les deux sens jusqu’à l’arrêt, direction verrouillée et identité des douze autres SVG. Aucun changement de modèle, hitbox, dégâts, collisions ou équilibrage. Sauvegardes avant correction dans `tests/v020-direction-before` ; validation dans `tests/v020-direction-final-tests.txt`, captures mobiles `tests/v020-direction-320.png` et `tests/v020-direction-390.png`.

Validation du correctif : **401/401 tests réussis**. Formats 320 × 568 et 390 × 844 inspectés ; aucune erreur console. Run navigateur complète Zone 2 à la Mitraillette, Atelier 2 : victoire en 581,13 s, 277 éliminations et 4,5 PV, identique au replay précédent. Rapport : `tests/v020-direction-browser.json`. Téléphone physique non testé. Arrêt après ce correctif.

### Remplacer ou ajuster une apparence

- Fichiers : `src/assets/combat-v020/<identifiant>.svg`, canevas de 128 × 128.
- Source des dessins : `scripts/build-combat-assets.mjs`. Reconstruction facultative : `node scripts/build-combat-assets.mjs` (écrase uniquement ces 14 SVG).
- Catalogue : `src/combat-appearances.js` contient clé, chemin, dimensions affichées, pivot, orientation et amplitude d’animation par entité. Les SVG peuvent aussi être remplacés directement en conservant le canevas et l’orientation.
- Intégration : `RoomScene.preload`, héros et arme dans `src/room-scene.js` ; corps ennemis dans `src/enemies/view.js`. Une seule image par corps, sans ajout de particules. Les anciennes textures V0.19 restent disponibles en secours si un asset ne charge pas.

Idle discret, démarrage/arrêt amorti, squash de déplacement et de touche, apparition progressive des boss. Le recul de tir, la teinte de dégâts et les morts avec effets V0.19 sont conservés. Le bob du nouveau corps reste inférieur à un pixel de jeu. Les mouvements réduits retirent ces nouvelles oscillations et déformations ; la direction et les avertissements restent lisibles. Aucun modèle, rayon de collision, projectile ou timing de combat n’est modifié.

Budget : **49 375 octets pour les 14 SVG**, rasterisés une fois au chargement en textures 128 × 128, soit **896 Kio RGBA** supplémentaires hors métadonnées GPU. Pas de filtre SVG, de police, d’image liée, de shader ou de dépendance ajoutée. Les assets sont servis en `image/svg+xml`, sans cache, avec contrôle de leurs octets sur le vrai serveur et un User-Agent Android.

### Validation V0.20

**396/396 tests réussis** : les 385 tests antérieurs sont conservés, 11 nouveaux tests protègent le catalogue, les budgets, le chargement, les pivots, les animations et leur indépendance du modèle/hasard de combat. La comparaison à `tests/v019-final-src-snapshot` garantit que tous les modules V0.19 restent identiques hors les deux renderers d’entités et le numéro visible. Elle couvre aussi arènes, télégraphes, impacts, morts, drops, aspiration, HUD, Contremaître Ravens, économie, progression et sauvegarde.

Runs navigateur intégrales sur profil QA isolé : **Galeries au Fusil, sans Atelier : 347,23 s, 235 éliminations, 0,5 PV** ; **Voies à la Mitraillette, Atelier 2 : 581,13 s, 277 éliminations, 4,5 PV**. Vingt vagues, six choix et les quatre rencontres boss de chaque zone. Résultats identiques aux replays V0.19, sans modifier PV ou dégâts pendant la run. Déblocage de la Zone 2 conservé après rechargement et prime unique +1 Diamant observée.

Affichages **320 × 568 et 390 × 844** inspectés : héros, deux armes, cinq ennemis, six boss, trajectoires, cercles d’impact, projectiles, choix normal et épique. Aucune erreur ou alerte console. Les 14 textures sont chargées. Moyennes observées de mise à jour/préparation du rendu : **1,743 ms / 2,094 ms** (Galeries / Voies), avec huit pas de simulation par image QA, hors présentation GPU. Pics d’effets 35 / 18, plafond inchangé de 48 ; une seule image par corps comme auparavant.

Rapports : `tests/v020-final-tests.txt`, `tests/v020-browser-runs.json`. Captures : `tests/v020-*.png`. Snapshots et sauvegardes antérieurs conservés, dont `tests/v019-final-src-snapshot`. Le portefeuille principal n’a pas servi aux essais.

**Limites :** illustrations vectorielles et animations procédurales simples, sans animation image par image ni articulations indépendantes. Les morts utilisent les effets V0.19 conservés. Formats mobiles émulés sur PC ; performance sur téléphone Android physique à confirmer. Les replays fixes ne couvrent pas tous les builds possibles. Aucun commit/push. Arrêt après V0.20, sans V0.21.

## Historique — V0.19 : passe visuelle du combat

Deux arènes différenciées : roche et lampes chaudes dans les Galeries ; plaques d’acier, rouille et traverses dans les Voies abandonnées. Décor périphérique sans collision, sol calme sous l’action. Deux textures de 450 × 800 sont dessinées une seule fois, puis réutilisées entre les vagues.

Les télégraphes partagent des contours sombres, une couleur ambre avant déclenchement et corail pendant les attaques actives. Chevrons directionnels pour charges et voies, cercles gradués pour les impacts et la vapeur. Positions, rayons et timings restent ceux du moteur existant.

Cinq ennemis et six boss dessinés localement : contours, métal biseauté, rivets, lampes et silhouettes spécifiques. Apparition translucide pendant le délai de spawn. Flash de touche teinté pour conserver les détails ; impacts et morts différenciés, salves plus nettes, collecte soulignée par une impulsion et de courtes traînées d’aspiration. Le Choix du Contremaître et le Choix Épique reprennent des cartes métal/cuivre, un encadrement et des accents plus distincts. Les menus hors combat sont conservés.

Budget visuel : pool fixe de 48 effets réutilisés, maximum 8 étincelles par gerbe, sprites de 88 pixels au plus, aucune nouvelle dépendance ni image téléchargée, aucun shader ou flou de combat. Les effets ont leur propre générateur aléatoire ; le dessin ne consomme pas le hasard du combat. Le mode mouvements réduits supprime gerbes, oscillations et traînées ; les avertissements restent visibles.

Les modules de combat, vagues, collisions, boss, armes, économie, progression et sauvegarde sont comparés octet par octet à la V0.18, hors fichiers de présentation explicitement autorisés. Aucun nouvel ennemi, boss, perk ou contenu jouable.

### Validation V0.19

**385/385 tests réussis** : les 373 existants sont conservés, avec adaptation ciblée des protections des fichiers visuels et de la version ; 12 nouveaux contrôles couvrent les dessins bornés, la géométrie des avertissements, la stabilité du modèle, les sprites, les effets et les traînées de collecte.

Runs navigateur intégrales sur profil QA distinct : Galeries au Fusil, sans Atelier, 347,23 s / 0,5 PV ; Voies à la Mitraillette, Atelier 2, 581,13 s / 4,5 PV. Aucune modification de PV ou dégâts pendant ces runs. Six choix, vingt vagues et les quatre rencontres boss exécutés dans chaque zone. Les suites Node conservent aussi les replays complets des deux armes.

Moyennes observées de mise à jour/préparation rendu sur ce PC : 1,58 ms (Galeries) et 2,15 ms (Voies), avec huit pas de simulation par image QA, hors présentation GPU. Pic observé : 35 / 18 effets actifs, plafond dur 48. Les deux textures d’arène représentent environ 2,9 Mo RGBA non compressés au total ; aucune image supplémentaire à télécharger.

Affichages 320 × 568 et 390 × 844 vérifiés : combat, ennemis, boss, avertissements, drops, Choix du Contremaître et Choix Épique. Pas de débordement horizontal, aucune erreur console pendant les runs. Les aperçus boss synchronisent volontairement les avertissements pour inspecter leur superposition ; les vrais timings restent décalés dans le jeu.

**Limites :** sprites industriels géométriques, animations simples et lumière statique ; cette passe ne remplace pas des sprites animés dessinés à la main. Mesures PC et formats mobiles émulés : fluidité sur téléphone Android physique encore à confirmer. Les graines retenues valident la non-régression et la faisabilité, pas tous les builds.

Rapports : `tests/v019-final-tests.txt`, `tests/v019-browser-runs.json`. Captures `tests/v019-*.png`. Sauvegardes et snapshots antérieurs conservés, dont `tests/v018-final-src-snapshot`. Aucun commit/push. Arrêt après V0.19, sans V0.20.

## Historique — V0.18 étape 5 : Zone 2 accessible

Les Galeries débloquent définitivement **LES VOIES ABANDONNÉES** après une victoire complète. La carte affiche disponible / verrouillée / terminée ; Le Puits 59 et les zones suivantes restent verrouillés. Les deux armes lancent les vingt vagues ferroviaires, avec les boss existants aux vagues 5/10/15/20, les Talents, l’Atelier et les choix du Contremaître. REJOUER relance la même zone avec la même arme.

Première victoire Zone 2 : **+1 Diamant unique**, inclus dans le bilan et identifié séparément. Le profil local v1 conserve désormais explicitement la prime réclamée ; les anciens profils sans progression restent compatibles, et une ancienne Zone 2 marquée terminée ne reçoit pas une seconde prime. Une victoire ancienne non enregistrée ne peut pas être déduite du portefeuille : il faut terminer Les Galeries pour débloquer la suite.

Les budgets préparés dans `src/zones.js` sont activés : 108 Charbon contre 94, +1 Fer garanti, +3 points de probabilité d’un Diamant supplémentaire, Jetons Grisou inchangés. Le bonus unique n’est jamais une prime récurrente. La Caisse quotidienne reste commune aux deux zones, une par jour ; le tirage bonus de caisse existant reste indépendant.

La sauvegarde conserve ensemble progression et gains, sans changement de clé ni perte des ressources, niveaux, Relève, Talents ou Caisses. En cas de stockage indisponible, l’avertissement existant indique que la session ne sera pas conservée au rechargement. La sauvegarde est locale au navigateur et à l’origine : localhost et l’URL Wi-Fi peuvent avoir des profils distincts.

Le nom de zone apparaît dans le HUD et le bilan, avec des rails légers dans l’arène. Les boss, armes, vagues et règles économiques globales sont inchangés depuis l’étape 4.

### Validation de l’étape 5

**373/373 tests réussis**, dont les 361 tests conservés (assertions adaptées uniquement aux points d’intégration autorisés et au budget Zone 2 activé) et 12 nouveaux contrôles. La comparaison aux sources figées de l’étape 4 protège les boss, vagues, armes et systèmes de méta-progression.

Parcours navigateur sur profil QA isolé : victoire Galeries sans Atelier (347 s), rechargement et déblocage, victoire Zone 2 fusil (524 s, Atelier 2), REJOUER dans la même zone, seconde victoire à la mitraillette (581 s, Atelier 2). Première prime +1 Diamant, seconde +0 ; portefeuille final 310 Charbon / 26 Fer / 1 Diamant / 0 Jeton, une seule Caisse quotidienne. Défaite contrôlée en Zone 2 et retours/rechargements vérifiés. Les deux zones restent terminées, les suivantes verrouillées.

Formats 320 × 568 et 390 × 844 contrôlés ; nom de zone compact pour éviter le débordement du HUD. Aucune erreur console pendant les parcours. Le pilote QA accélère à huit pas par image ; le coût moyen observé de mise à jour/préparation du rendu est 2,75 ms (fusil) / 2,28 ms (mitraillette) sur ce PC, hors présentation GPU. Aucun changement de PV/dégâts pendant les victoires. Les graines retenues prouvent la faisabilité, pas l’équilibre de tous les builds. Le téléphone Android physique n’a pas été retesté dans cette étape.

Rapports : `tests/v018-step5-final-tests.txt`, `tests/v018-step5-browser-report.json`. Banc QA non servi par le serveur normal. Sauvegarde principale préservée. Arrêt après l’étape 5 ; aucune V0.19 commencée.

## Historique conservé — étape 4 : boss ferroviaires

Les constats ci-dessous décrivent les étapes antérieures, avant l’activation de l’étape 5.

Les emplacements 5/10/15/20 sont maintenant exécutables en développement. **La Zone 2 reste inaccessible au menu**, la version publique affichée reste V0.17. Aucun bonus de première victoire ni nouvelle économie activé dans cette étape ; les modules économiques sont inchangés. Les bancs navigateur utilisent un identifiant de monde QA distinct pour ne pas déclencher la progression Zone 2.

- **Chef de Gare** : repositionnement à 84 px/s, charge verrouillée annoncée 1 s, passage périodique d’un Wagon ordinaire sur un bord sûr. Un seul Wagon invoqué vivant, aucun drop supplémentaire, disparition avec son propriétaire.
- **Locomotive** : 32 px/s, bélier frontal court annoncé 1,3 s, vapeur frontale limitée à 1,6 s après avertissement. Plus résistante que le Chef (1650 contre 1150 PV).
- **Aiguilleur** : placement latéral, deux rails horizontaux annoncés 1,25 s puis actifs 1,15 s ; rafale de deux projectiles lents. 1900 PV.
- **Triple** : PV à 95 %, départs espacés de 1,25 s, repos ×1,45, un seul rail de l’Aiguilleur. Plafonds : trois boss + un Wagon, deux zones sol, pool partagé de huit projectiles. Sur une sonde de 120 s, les trois grosses annonces/attaques coïncident 3,2 % du temps ; ce n’est pas une garantie d’absence de chevauchement.

Temps de combat isolé (hors introduction/aspiration), Atelier 2, sans Talents, préfixes de perks légaux et pilote lisant les dangers visibles :

| Rencontre | Fusil | Mitraillette | Cible indicative |
| --- | ---: | ---: | ---: |
| Chef de Gare | 21,1 s | 23,6 s | 20–30 s |
| Locomotive | 25,8 s | 24,7 s | 25–35 s |
| Aiguilleur | 37,7 s | 23,7 s | 30–40 s |
| Triple | 41,5 s | 51,8 s | 45–65 s |

**Réserves :** l’Aiguilleur est trop court avec le build mitraillette testé ; le triple fusil est légèrement sous la cible isolée et peut descendre à 31,5 s dans la run complète sélectionnée. Aucun timer forcé ni nerf global des armes. L’équilibrage n’est pas garanti pour tous les builds : la graine mitraillette 5 perd en vague 17, tandis que 1/7/9/16 terminent. Runs complètes retenues (graine 1, Atelier 2) : fusil 523,45 s / 1 PV restant ; mitraillette 581 s / 4,5 PV. Six choix, vingt vagues et budget actuel 94 Charbon / 8 Fer dans les tirages déterministes sans rareté.

**361/361 tests réussis.** Rapports : `tests/v018-step4-final-tests.txt`, `tests/v018-step4-simulation-report.json`, `tests/v018-step4-browser-report.json`. Les 338 tests antérieurs sont conservés, avec adaptation ciblée des anciennes protections à l’intégration des boss ; les runs des Galeries se rejouent toujours exactement. Placeholders générés localement, sans asset lourd. Les triples navigateur reproduisent 41,45 s au fusil et 51,85 s à la mitraillette, aucune erreur console, au plus quatre entités / deux projectiles actifs observés. Coût CPU moyen de mise à jour/préparation rendu : 1,11 / 1,21 ms par image sur PC, hors présentation GPU. Affichages 320 × 568 et 390 × 844 vérifiés, sans débordement ; téléphone physique non testé. Pas d’étape 5.

## Étape 3 conservée — réservations remplacées à l’étape 4

La configuration des vingt emplacements est centralisée dans `src/tracks-waves.js` : seize vagues normales, quatre réservations boss (5/10/15/20). Le moteur refuse d’entrer dans une réservation ; la Zone 2 reste inaccessible au menu. Aucun boss ni récompense finale ajouté dans cette étape.

Les vagues normales totalisent **271 ennemis contre 229** dans les Galeries (+18,3 %). La première vague présente six Mineurs et un Wagon ; les Rats arrivent en vague 2, une Draisine en vague 3, les Foreuses en vague 11. Les Mineurs/Wagons/Draisines sont majoritaires. Les groupes passent de 2 à 4, le plafond simultané de 4 à 12 et les intervalles de 1,05 à 0,50 seconde. Chaque vague borne aussi les types : au plus 1–2 Wagons, 2–3 Draisines et une Foreuse. Les télégraphes, PV et dégâts de l’étape 2 sont inchangés.

Validation automatisée : les deux armes terminent les seize vagues normales avec un Atelier niveau 2, sans Talents, sans soin ajouté ni modification des dégâts. Le pilote choisit des perks ordinaires aux checkpoints 1/4/9/14/18 et l’épique après 19. Le banc saute explicitement les boss sans les créditer, sans soigner ni annoncer une victoire de zone. Les récompenses collectées utilisent le budget existant des seules vagues normales ; la future fonction de récompense Zone 2 n’est pas branchée.

**Limites de difficulté :** +18,3 % mesure les entrants, pas une difficulté humaine. Les essais sans Atelier retenus dans le rapport échouent avant la fin ; Atelier 2 valide la faisabilité, pas tous les builds. La comparaison avec les Galeries dépend fortement de l’arme et du pilote. Le réglage final à +15–25 % et la difficulté d’une run avec boss restent à valider. Aucun test sur téléphone physique.

**338/338 tests réussis.** Le parcours navigateur au fusil termine les seize vagues normales en 421,2 s simulées, avec 1 PV restant, 271 éliminations, six choix et aucune erreur console. Maximum observé : 12 ennemis, 7 projectiles ennemis, 6 drops. Travail CPU mise à jour/préparation du rendu : 1,27 ms par frame QA accélérée (quatre pas de simulation), hors présentation GPU. Les captures en 320 × 568 et 390 × 844 ne présentent pas de débordement.

Rapports : `tests/v018-step3-simulation-report.json`, `tests/v018-step3-browser-report.json`, `tests/v018-step3-final-tests.txt`. Sur le serveur QA local (5178), les boutons « Voies : normales » exécutent les vraies vagues avec un pilote de test. Arrêt après l’étape 3, sans commencer l’étape 4. La version publique affichée reste V0.17.

## Étape 2 conservée

La version publique affichée reste V0.17. La configuration/progression de l’étape 1 est conservée ; la Zone 2 reste verrouillée dans le menu et ses vagues ne sont pas lancées. Aucun boss Zone 2 n’est implémenté.

- **Wagon Fou** : 48 PV, apparition de 0,7 s sur un bord de rail à plus de 180 pixels du joueur, avertissement fixe de 1,1 s, traversée droite à 310 pixels/s, 1 dégât de contact. Il s’immobilise au bord opposé, devient inoffensif et reste destructible pour obtenir ses drops. Le recul ne déplace pas son rail.
- **Draisine** : 54 PV, repositionnement latéral entre 160 et 205 pixels, visée verrouillée pendant 0,85 s, deux tirs séparés de 0,28 s, récupération de 0,7 s puis délai de 2,8 s. Projectiles à 125 pixels/s, 0,5 dégât chacun, deux actifs maximum par Draisine, huit maximum dans le pool partagé.
- Silhouettes générées une fois en code, sans téléchargement ni asset lourd. Les armes, Coup de Grisou, morts et drops utilisent les systèmes existants.
- 327 tests réussis, dont les 308 tests antérieurs conservés (assertions de catalogue/protection adaptées aux seuls points d’intégration autorisés). Les deux runs complètes des Galeries reproduisent exactement la V0.17.
- Vérification sur banc QA local isolé : deux armes, télégraphes et rafale, 320 × 568 et 390 × 844. Les mesures de performance PC ne constituent pas un test sur téléphone physique. Équilibrage des futures vagues Zone 2 encore à faire.

Preuves : `tests/v018-step2-final-tests.txt`, `tests/v018-step2-browser-report.json`, `tests/v018-step2-performance.json`, captures `tests/v018-step2-320.jpg` et `tests/v018-step2-390.jpg`. Banc QA : `node tests/browser-qa-server.mjs`, puis http://127.0.0.1:5178 (actions « Rail »). Le serveur normal ne sert pas les tests.

Arrêt après cette étape. Pas d’étape 3 ni de V0.19.

## V0.17 conservée

La page CAISSES est fonctionnelle : un seul type de Caisse du Mineur, compteur et badge de navigation, grosse caisse illustrée en CSS, bouton OUVRIR, révélation et échange de Jetons. Aucun compte, backend, achat réel, publicité, cosmétique, nouvelle ressource ou boucle de récompenses ajoutés.

## Sources et contenu

- Première victoire complète des vingt vagues d’un jour local : **+1 caisse**, une seule fois par jour.
- Chaque victoire complète : **10 %** de chance indépendante de recevoir **+1 caisse bonus**, cumulable avec la quotidienne.
- **3 Jetons Grisou → 1 caisse**, sans autre coût. Bouton désactivé sous trois Jetons.
- Aucune caisse sur défaite. Les ressources habituelles de run restent calculées exactement comme auparavant.

Catalogue et réglages centralisés dans src/crates.js : CRATE_RULES et CRATE_REWARDS. Table proposée conservée, total 100 % :

| Probabilité | Récompense |
| --- | --- |
| 35 % | +100 Charbon |
| 25 % | +200 Charbon |
| 15 % | +10 Fer |
| 10 % | +20 Fer |
| 8 % | +1 Diamant |
| 5 % | +2 Diamant |
| 2 % | +1 Jeton Grisou |

Un seul lot par caisse ; aucune caisse supplémentaire dans le pool, aucun objet inconnu. Les tirages des caisses n’affectent ni le hasard du combat ni celui des drops normaux. Les quantités restent entières.

## Ouverture et persistance

Animation nominale de **1,1 seconde**, bouton OUVRIR temporairement désactivé, couvercle incliné, halo et deux petites oscillations. Le bouton PASSER L’ANIMATION révèle immédiatement le gain ; avec réduction des animations système, la révélation est immédiate. Pas de chargement d’image supplémentaire, de particules ou de boucle de rendu JavaScript. Ravens commente les récompenses rares ; une phrase commune apparaît occasionnellement.

Le retrait d’une caisse et l’ajout de sa récompense sont enregistrés ensemble dans **une seule écriture locale avant l’animation**. Celle-ci révèle un résultat déjà acquis : navigation, animation passée ou rechargement ne recréditent pas le lot et ne font pas perdre le gain. Quitter la page annule son timer. Plusieurs ouvertures successives sont possibles, sans ouverture automatique de tout le stock.

L’échange déduit les trois Jetons et ajoute la caisse en une écriture également. Si l’enregistrement échoue, aucune ressource ni caisse n’est consommée. Lecture du profil avant chaque transaction pour éviter les achats/ouvertures sur un ancien solde dans des instances utilisées successivement. Si une ressource atteint sa limite de sécurité, ouverture refusée avant le tirage plutôt que de tronquer un lot ou permettre des relances gratuites.

Même clé de sauvegarde version 1 ; extension optionnelle crates : count et lastDaily (YYYY-MM-DD local). Les anciennes sauvegardes migrent sans perte de ressources, Atelier, Relève ou Talents. Compteur borné à 999999 ; dates invalides ignorées. Les gains de fin de run et les caisses sont enregistrés ensemble. Le comportement mémoire et l’avertissement de stockage indisponible des gains de run existants sont conservés ; ouvrir/échanger exige un enregistrement réussi.

La récompense quotidienne compare la date locale au dernier jour crédité ; reculer l’horloge ne redonne pas une ancienne quotidienne. Changer artificiellement l’horloge vers le futur reste possible dans ce prototype local sans backend. Après une date future créditée, la quotidienne attend un jour ultérieur à cette date ; aucune synchronisation externe n’est ajoutée.

## Périmètre conservé

Combat, armes, équilibre boss V0.15, vingt vagues, spawns, ennemis, perks, Talents V0.16, coûts/bonus Atelier, calculs Relève et drops sont inchangés. Les tests comparent ces fichiers au snapshot V0.16. Accueil : activation de CAISSES et son badge, sans refonte. Résultat : simple ligne d’attribution de caisse. Dans l’Atelier, seule l’ancienne indication « aucun usage » du Jeton est remplacée par une mention de l’échange sur la page Caisses ; toutes ses règles restent protégées.

## Validation

**303/303 tests réussis** : les 273 tests précédents sont conservés, avec 30 nouveaux tests. Vérifications de la somme et de chaque intervalle du pool, types de récompense, stock zéro, décompte/crédit, vingt ouvertures successives, échecs d’écriture, limites, instances successives, première/deuxième victoire, lendemain, retour d’horloge, défaite, échange, rechargement et coexistence Atelier/Relève/Talents.

Contrôles navigateur avec profil QA distinct :

- Première victoire simulée : une caisse ; seconde victoire le même jour : aucune quotidienne ; lendemain : une nouvelle ; défaite : aucune.
- **Six ouvertures** : lots Fer, Charbon, Diamant et Jeton vérifiés. Les cas rares ont été forcés uniquement via les boutons QA pour tester leur rendu, pas via une modification de la table normale.
- Révélation naturelle, animation passée et rechargement pendant l’ouverture testés. Après l’ouverture interrompue : caisse consommée et Jeton bien crédité, sans double gain.
- Deux échanges : 8 → 5 → 2 Jetons et 0 → 1 → 2 caisses ; troisième échange impossible.
- Une run complète réelle dans Phaser, sans Talent ni Atelier, Fusil graine 1 : **20 vagues, 235 éliminations, 347,23 s, 0,5 PV**, final **31,87 s**. Six choix, gains inchangés **94 Charbon / 8 Fer**, plus première caisse quotidienne visible sur le résultat. Même résultat de combat qu’en V0.16.
- Achat Puissance Atelier, déblocage Aimant Renforcé et récupération Relève, puis rechargement : états conservés ; la date quotidienne reste 2026-10-06 et une nouvelle victoire simulée ce jour n’ajoute rien.
- Formats **320 × 568** et **390 × 844** contrôlés : compteur, révélation, boutons, défilement de l’échange sur petit écran, aucun débordement horizontal. Aucun avertissement ou erreur console relevé sur les ouvertures, menus et run complète. La fluidité sur Android physique reste à confirmer manuellement.

Tous les crédits de test restent dans la clé QA la-mine-v2:qa-v017 sur l’origine 5178. Aucun achat ni gain de test dans le portefeuille normal.

## Impact économique estimé et réserves

Espérance par caisse : **85 Charbon, 3,5 Fer, 0,18 Diamant, 0,02 Jeton**. Ce sont des moyennes de lots exclusifs, pas le contenu simultané d’une caisse.

Une victoire après la quotidienne apporte en moyenne **8,5 Charbon et 0,35 Fer supplémentaires** via sa chance de 10 %, soit environ +9 % du Charbon garanti d’une run et +4,4 % du Fer garanti. Les runs restent la condition d’obtention principale et leur budget direct n’est pas modifié.

**La première victoire du jour est généreuse** : 1,1 caisse attendue, donc +93,5 Charbon / +3,85 Fer / +0,198 Diamant / +0,022 Jeton en moyenne. Cela ajoute presque autant de Charbon que les 94 garantis par la run et environ 48 % de son Fer garanti. Pour quelqu’un qui gagne une seule fois par jour, ce bonus pèsera fortement dans la progression : il ne faut pas le présenter comme négligeable. La table proposée est conservée pour le test de ressenti, sans retoucher l’économie principale. Un retour sur le rythme des achats Atelier/Talents et les Diamants sera utile.

L’échange consomme trois Jetons pour un retour moyen de 0,02 Jeton : pas de boucle rentable ni caisse qui en engendre une autre automatiquement. La réserve de Jetons existante peut néanmoins donner un bonus ponctuel. Le plaisir et l’envie de revenir ne se valident pas par les tests techniques ; ils demandent un essai joueur.

## Utilisation et preuves

- Lancer : npm.cmd start -- --host=0.0.0.0 ; prototype http://127.0.0.1:5177/.
- Tests : npm.cmd test.
- QA : node tests/browser-qa-server.mjs ; http://127.0.0.1:5178/. Les routes de tests sont interdites sur le serveur normal.
- Rapports : tests/v017-final-tests.txt, tests/v017-browser-report.json, tests/v017-economy-report.json.
- Captures : tests/v017-crate-320.jpg, tests/v017-crate-390.jpg.
- Sauvegardes : tests/v016-src-snapshot, tests/v016-readme-backup.md, tests/v016-style-backup.css, tests/v016-browser-qa-backup.js. Toutes les sauvegardes antérieures restent conservées.

Backend et correctif EADDRINUSE inchangés. Sa bannière historique peut encore mentionner V0.14 ; la version applicative est V0.17. Aucun commit/push, aucune V0.18.


## Outil DEBUG local temporaire — accès aux zones

Sur le téléphone, avec le serveur habituel déjà lancé, ouvrir `http://IP_DU_PC:5177/src/debug.html?debug=1` (remplacer IP_DU_PC par l'adresse affichée par le serveur). Aucun redémarrage nécessaire. La page n'active ses commandes que sur localhost, loopback ou une IPv4 privée, avec `debug=1`. Elle n'est ni liée ni chargée par les menus du jeu.

**DÉBLOQUER LES ZONES DE TEST** marque les Zones 1 et 2 terminées et débloque la Zone 3. Le script modifie uniquement le champ de progression des zones, sans passer par le traitement des victoires : aucun gain de ressources, diamant de première victoire ou caisse. Les autres champs restent intacts. Une Zone 3 déjà terminée le reste.

**RESET PROGRESSION DEBUG** restaure uniquement le champ de progression sauvegardé avant le premier déblocage debug sur cette origine. Il ne réinitialise pas tout le profil : ressources, Atelier, Talents, Relève et Caisses sont conservés dans leur état courant. Les déblocages répétés conservent la même sauvegarde de restauration. Revenir au jeu via le lien ou recharger son onglet après une commande. Chaque nouvelle IP conserve sa propre sauvegarde locale.

Validation : 557/557 tests (545 existants conservés + 12 tests debug), déblocage/reset vérifiés en navigateur sur une origine de test séparée, ressources restées à zéro, zones reverrouillées après reset, aucune erreur console. Aucun changement aux fichiers de gameplay, au serveur ou au menu normal ; aucune nouvelle version ni commit/push.
