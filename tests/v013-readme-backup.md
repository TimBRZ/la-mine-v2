# La Mine V2 — V0.13 : Les Galeries, vingt vagues

Projet exclusif : `C:\LaMineV2\la-mine-v2-v01`. Aucun commit/push. Aucune V0.14.

Une arène persistante, **20 vagues et 235 ennemis** au total. La Haveuse arrive en 5, le Crachefer en 10, l’Effondreur en 15 ; les trois machines combattent ensemble en 20. Les bosses intermédiaires n’arrêtent plus la run. La collecte au passage, la respiration, l’aspiration et la validation du butin restent celles du prototype précédent.

### Configuration et rythme

`src/world.js` centralise les quatre paliers, effectifs, plafonds, groupes, intervalles, points d’apparition, boss, PV du final et checkpoints. `Run` accepte cette configuration pour permettre un autre monde ultérieurement. Les quatre autres zones restent verrouillées.

| Vagues normales | Effectifs | Plafond simultané | Groupe maximum par apparition | Intervalle entre groupes |
| --- | --- | --- | --- | --- |
| 1–4 | 6, 8, 9, 10 | 3 → 5 | 2 | 0,95 → 0,77 s |
| 6–9 | 10, 12, 13, 14 | 5 → 7 | 3 | 0,80 → 0,62 s |
| 11–14 | 14, 16, 17, 18 | 7 → 9 | 3 | 0,65 → 0,47 s |
| 16–19 | 18, 20, 22, 22 | 9 → 11 | 4 | 0,55 → 0,37 s |

Les groupes s’ajoutent aux ennemis vivants, tant qu’un ancrage sûr est libre. Distance joueur >180 unités, séparation entre foreuses >140, télégraphe existant de 0,7 s. Une vague exige tous ses spawns et toutes ses éliminations avant la collecte. Aucun portail, déplacement de décor ou soin entre vagues.

Pour maintenir une durée mobile malgré les groupes superposés, les PV ordinaires utilisent un coefficient configurable de **0,45** : rat 10, mineur 41, foreuse 22. Vitesses, dégâts, télégraphes et comportements de base restent inchangés. C’est un ajustement volontaire de durée, sans modification des perks normaux V0.12.

### Trois boss

- **La Haveuse** : son module, ses 560 PV et son comportement individuel sont inchangés.
- **Le Crachefer** : 440 PV, positionnement à distance, visée verrouillée 1,1 s puis projectile lent à 145 unités/s, récupération. Canon violet distinct. Il partage le pool borné de 8 projectiles ennemis, au maximum un par propriétaire.
- **L’Effondreur** : 480 PV, approche lente, une zone verrouillée de rayon 56 annoncée 1,35 s, puis active 1,4 s. Marteau corail distinct. Sa mort supprime son danger ; les dégâts respectent l’invulnérabilité du joueur.
- **Final** : 60 % des PV individuels, soit 336 / 264 / 288. Introduction protégée de 2,2 s ; placement éloigné du joueur ; trois barres de vie et télégraphes simultanés.

### Choix du Porion

Choix normaux avant 1 et après 4 / 9 / 14 / 18. Après 19, trois cartes épiques exclusivement liées à l’arme, sans tirage dans le pool normal. Cadre violet, titre dédié et Ravens plus grand. Les indicateurs de perks occupent au maximum deux rangées sous l’arène.

| Fusil | Effet épique |
| --- | --- |
| Double Canon | Deux salves par tir, sans troisième proc ni récursion |
| Grisou instable | Chaque mort explose, rayon 130, dégâts 140, une explosion par victime ; chaînes bornées |
| À bout portant | +100 % des dégâts de base à moins de 70 unités, cumulable avec Canon scié |

| Mitraillette | Effet épique |
| --- | --- |
| Perforation totale | Trois cibles distinctes, dégâts 100 / 80 / 64 % |
| Surchauffe critique | Active aussi la chaleur si nécessaire ; +140 % de dégâts à chaleur maximale, dissipée en mouvement |
| Pluie de fer | +50 % cadence et −15 % dégâts par balle, soit +27,5 % de DPS théorique |

### Ressources et compatibilité

Les cinq budgets historiques sont répartis sur vingt vagues, sans multiplier les gains : **94 Charbon**, **8 Fer garantis**, mêmes tirages supplémentaires de Fer, Diamant et Jeton Grisou. Les tirages sont faits une fois par run, indépendamment du hasard de combat. Seules les vagues terminées créditent le registre ; un décès conserve ces gains et abandonne le butin provisoire. Le nombre de drops par élimination diminue pour respecter ce budget ; pool physique toujours limité à 20. Aucun changement des coûts, Atelier, Relève ou format de sauvegarde.

### Vérifications V0.13

Les tests précédents sont conservés et adaptés aux vingt vagues ; les tests dédiés couvrent checkpoints, pool épique, six effets, placement, chevauchement des spawns, zones, trois boss, budgets et conservation des ressources. Les fichiers historiques de validation et captures restent présents.

Les simulations complètes utilisent les vrais dégâts, HP, armes et règles, sans soin, invulnérabilité artificielle ni niveaux Atelier. Le pilote est uniquement dans `tests/`, jamais servi sur le port normal. Les paramètres de QA sont reproductibles, mais certaines trajectoires Fusil divergent entre Node et Chromium, y compris sans Phaser : les validations navigateur sont donc séparées des simulations Node. Les graines choisies pour les vérifications de victoire ne constituent pas un taux de réussite représentatif.

Les séries exploratoires montrent une difficulté élevée : 2 victoires sur 16 simulations Node, et 2 sur 18 simulations dans le moteur du navigateur. Une autre construction Mitraillette Chargeur/Perforantes/Surchauffe termine également les tests Node. Ce sont des résultats de pilote automatique, pas une estimation de réussite humaine. La sensation et les performances sur téléphone physique restent à confirmer.

**193/193 tests réussis.** Dans Phaser : victoire Fusil en **285,50 s**, 1 PV restant ; victoire Mitraillette en **305,27 s**, 1,5 PV restant. Toutes deux : 235 éliminations, six choix, vingt collectes, arène inchangée, aucun tir en mouvement, 94 Charbon / 8 Fer avec le tirage rare contrôlé à 0,99. Les trois boss, la vague 19 et le final sont parcourus sans modifier les règles de combat.

Affichage contrôlé en **320 × 568** et **390 × 844**, notamment les deux choix épiques, le résultat et les télégraphes du triple boss. La deuxième rangée de perks a été compactée pour laisser les instructions tactiles dégagées ; noms/détails complets restent accessibles aux lecteurs d’écran. Aucune erreur ou alerte console pendant les runs. Coût local moyen de mise à jour/préparation du rendu : **0,52–0,59 ms** par frame de fixture, avec quatre pas de simulation par frame. Ce chiffre exclut le GPU et ne mesure pas les FPS d’un téléphone Android.

Rapports : `tests/v013-simulation-report.json`, `tests/v013-browser-report.json`, `tests/v013-final-tests.txt`. Captures `v013-epic-*.jpg`, `v013-victory-*.jpg`, `v013-triple-320.jpg`, `v013-crachefer-320.jpg`, `v013-effondreur-320.jpg`. Les aperçus de boss sont des fixtures visuelles distinctes des runs complètes.

Lancer : `npm.cmd start -- --host=0.0.0.0`. Tests : `npm.cmd test`. QA isolée : `node tests/browser-qa-server.mjs`, port 5178, profil `la-mine-v2:qa-v013`. Le serveur normal ne sert pas `/tests/`.

Vérification locale du 6 octobre : `http://127.0.0.1:5177` et **`http://192.168.1.197:5177`** répondent en V0.13 ; les trois nouveaux modules JavaScript sont servis en HTTP 200 avec `text/javascript; charset=utf-8`. L’ancienne adresse Wi-Fi `192.168.1.15` ne répond plus. Le stockage navigateur dépend de l’origine (adresse et port) : changer d’IP ne transfère pas les données de l’ancienne origine, qui ne sont pas effacées. Sur l’origine localhost déjà utilisée, le portefeuille affiché avant/après rechargement reste identique.

---

## Historique V0.12 : pression et builds du Porion

Projet exclusif : `C:\LaMineV2\la-mine-v2-v01`. Aucun commit/push, aucune V0.13.

L’arène unique, les cinq vagues, les choix avant la première vague et après les vagues 2/4, les drops au passage et l’aspiration sont conservés. Économie, récompenses, Relève, Atelier, sauvegarde, menus et assets restent identiques (seul le numéro de version du menu change).

### Pression

| Vague | Effectif | Maximum simultané | Intervalle d’apparition |
| --- | ---: | ---: | ---: |
| 1 | 6 rats | 3 | 1,8 s |
| 2 | 10 rats/mineurs | 4 | 1,4 s |
| 3 | 11 mineurs + 4 foreuses | 6 | 1 s |
| 4 | 10 rats + 4 mineurs + 4 foreuses | 8 | 0,75 s |
| 5 | La Haveuse | 1 | introduction existante |

Les foreuses apparaissent à plus de 140 unités des autres foreuses, et tous les ennemis ordinaires à plus de 180 unités du joueur. Télégraphes, dégâts ennemis et boss inchangés. La vague 4 est limitée à 18 ennemis pour rester dans le pool existant de 20 drops, même avec fer et diamant non ramassés. **50 éliminations** sur une victoire ; les budgets de ressources par vague ne changent pas.

### Perks

| Perk | Effet | Plafond |
| --- | --- | ---: |
| Chevrotine lourde · fusil | +4 plombs, dispersion élargie, −20 % cadence par rang (délai ÷0,8) | 2 |
| Canon scié · fusil | +60 % dégâts à ≤70 unités, portée ×0,8 par rang | 2 |
| Double détente · fusil | 30 %, puis 60 % de seconde salve immédiate ; jamais de troisième | 2 |
| Coup de Grisou · commun | Cinq éliminations arment la sixième : explosion garantie. Les victimes de l’explosion alimentent aussi le compteur. | 1 |
| Plaques du Porion · commun | Bouclier absorbant 1 dégât par rang, durant 8 s de combat au début de chaque vague ; accordé aussi à l’acquisition, sans soin | 2 |
| Bottes du Porion · commun | +25 % vitesse permanente pour la run | 1 |
| Détente allégée · commun | Délai de tir ×0,75 par rang | 2 |
| Chargeur étendu · mitraillette | +30 % cadence pendant les 2 premières secondes après immobilisation ; le mouvement ne remet pas le cooldown à zéro | 1 |
| Surchauffe · mitraillette | +10 % dégâts/seconde de tir immobile jusqu’à +40 % ; mouvement ou absence de cible à portée dissipe le bonus | 1 |
| Balles perforantes · mitraillette | Traverse un ennemi : 100 % dégâts sur la première cible, 60 % sur la seconde, jamais une troisième | 1 |

Chaque arme dispose de sept perks : trois spécifiques et quatre communs. Trois cartes distinctes, diversité de catégories, remplacement d’un trio identique au précédent lorsque possible ; poids d’apparition réduit pour un perk déjà cumulé. Rang proposé/plafond sur les cartes ; rangs possédés et compteurs visibles sous l’arène. Effets légers : bouclier bleu, chaleur orange, balles perforantes cyan et mentions brèves DOUBLE / GRISOU / BOUCLIER. Ravens conserve sa fréquence actuelle.

### Validation et limites V0.12

**175/175 tests** : les 158 cas existants sont conservés et adaptés aux règles reworkées, avec 17 nouveaux cas dédiés. Les hashes de `tests/v012-protected-baseline.json` protègent notamment les drops, budgets, sauvegarde, Relève, Atelier, boss et paramètres des trois ennemis. Les tests couvrent collisions perforantes sur une ou plusieurs frames, compteurs, cumuls, pauses, diversité et plusieurs builds complets.

Les démonstrations et runs navigateur utilisent exclusivement `tests/browser-qa.js`, sur 5178 avec le profil `la-mine-v2:qa-v012`, séparé du portefeuille normal. Les démonstrations isolées utilisent des cibles immobiles ; les runs complètes utilisent le combat réel et un pilote de test. Aucun pilote ni bouton QA n’est servi par le serveur normal.

Trois victoires navigateur : fusil Chevrotine/Détente en 79 s, mitraillette Perforantes/Détente/Chargeur en 127 s, mitraillette Détente/Bottes en 141 s. Chaque run valide 50 éliminations et les cinq collectes ; récompenses contrôlées 94 Charbon et 8 Fer avec le tirage rare de test fixé à 0,99. Moyenne locale de mise à jour/préparation du rendu : 0,86–0,99 ms par frame de fixture (quatre pas simulés), hors mesure GPU et hors benchmark Android.

Cartes, plafonds, compteurs, effets et résultats contrôlés en 320 × 568 et 390 × 844. Aucun débordement horizontal des cartes ou des trois indicateurs de perks, aucune erreur/alerte console. Huit simulations supplémentaires : sept victoires, une défaite en vague 4. Le pilote de test a été adapté à la portée de l’arme et autorise un arrêt de tir à 50 unités pour éviter de tourner sans fin autour des rats ; ce réglage n’entre pas dans le jeu.

Rapports : `tests/v012-browser-report.json`, `tests/v012-simulation-report.json`, `tests/v012-final-tests.txt`. Captures : `v012-choice-smg-320.jpg`, `v012-choice-smg-390.jpg`, `v012-smg-heat-320.jpg`, `v012-grisou-390.jpg`, `v012-shield-390.jpg` et les trois `v012-victory-*.jpg`.

La difficulté et le plaisir restent à évaluer sur téléphone physique. Le pilote privilégie l’esquive : un build Surchauffe/Chargeur demande une autre gestion des arrêts et ne garantit pas la victoire. Aucun soin, bonus caché ou nerf du boss n’est appliqué pour les validations.

Lancer : `npm.cmd start -- --host=0.0.0.0`. Tests : `npm.cmd test`.

---

## Historique V0.11 — une arène, cinq vagues

Projet exclusif : `C:\LaMineV2\la-mine-v2-v01`. Aucun commit/push. Pas de V0.12.

**Les Galeries** utilise une arène persistante : plus de porte, de sortie obligatoire, de fondu ou de changement de décor. Le joueur conserve sa position ; seule une position trop proche du point d’entrée du boss est replacée à distance sûre, sans soin.

- Vagues : 6 rats ; 10 rats/mineurs ; 12 mineurs/foreuses ; 16 ennemis mixtes ; La Haveuse seule.
- Fil conducteur : étapes terminées cochées, étape active dorée, étapes futures grisées, BOSS explicite.
- Dernière élimination → respiration et aspiration existantes → validation du butin → choix éventuel → vague suivante automatique.
- Choix du Porion avant la vague 1, après la 2 et après la 4. L’introduction de Ravens/La Haveuse suit le dernier choix.
- Préparation sans dégâts : 0,6 seconde entre vagues, 2,2 secondes pour le boss. Apparitions ordinaires toujours distantes et télégraphiées.
- PV, perks, arme, statistiques Atelier et comptage des ressources conservés. Atelier, Relève et sauvegarde locale inchangés.

Architecture : `src/waves.js` définit rencontres et progression ; `Run` gère combat, collecte, choix et préparation ; `src/arena-view.js` construit le terrain une seule fois. `wave-loot.js` réutilise le collecteur et les budgets existants. Les anciens modules `rooms.js` et `room-view.js` restent comme références historiques, sans import dans le jeu actuel. Les constantes géométriques ROOM désignent les limites de l’arène.

Validation : **158/158 tests**, dont les 150 cas précédents conservés et adaptés et huit contrôles supplémentaires. Le pilote de test marque ses arrêts au fusil plus tôt ; aucun réglage de combat n’a changé. Les fixtures navigateur utilisent le port 5178 et une clé QA séparée (`la-mine-v2:qa-v011`). Le serveur normal ne sert pas ces fixtures.

Validation navigateur : victoires avec les deux armes (fusil 84 s, mitraillette 130 s), 45 éliminations, trois choix, cinq aspirations terminées, aucune recréation du terrain. Contrôles visuels en 320 × 568 et 390 × 844 : progression, combat, choix, intro boss et résultats. Aucune erreur ou alerte console relevée. Le temps moyen mesuré de mise à jour/préparation du rendu reste inférieur à 1 ms par frame de la fixture accélérée (quatre pas simulés) ; ce n’est pas une mesure GPU ou un benchmark Android. Rapport : `tests/v011-browser-report.json`. Captures de référence : `v011-wave4-smg-390.jpg`, `v011-boss-intro-320.jpg`, `v011-choice4-320.jpg`, `v011-choice4-390.jpg`, `v011-victory-smg-390.jpg`, `v011-defeat-320.jpg`.

Lancement : `npm.cmd start -- --host=0.0.0.0`, puis http://127.0.0.1:5177 ou l’adresse Wi-Fi annoncée. Tests : `npm.cmd test`.

La validation mobile ici porte sur les formats de navigateur. Le ressenti sur téléphone physique et l’équilibrage humain restent à confirmer en jouant.

---

## Historique V0.10 — La Relève

Projet exclusif : `C:\LaMineV2\la-mine-v2-v01`. Aucun accès à CGWeb ou à l’ancienne La Mine. Aucun commit/push. Les tests, captures et sauvegardes précédents sont conservés. État archivé avant V0.11.

## La Relève

Le bouton **LA RELÈVE** de l’accueil est actif. Talents et Caisses restent verrouillés. La présentation reprend le kit DA existant sans nouvelle refonte.

- Production fixe : **12 Charbon/h**, **1 Fer/h**, aucun Diamant ni Jeton Grisou.
- Capacité **24 h** : **288 Charbon + 24 Fer** maximum, même après 48 h ou davantage.
- Les gains restent en attente jusqu’à **RÉCUPÉRER**. Un badge apparaît dès qu’au moins une ressource entière est disponible (premier Charbon à 5 min).
- Récupérer crédite le portefeuille et démarre une nouvelle période. Retour visuel bref, désactivé si les animations réduites sont demandées, et trois phrases contextuelles de Ravens.
- Taux et plafond centralisés dans `src/relief.js` : `RELIEF`. Écran dans `src/menu/relief-view.js`, styles dans `relief.css`.

### Temps et sauvegarde

Le début de période est enregistré dès la première ouverture V0.10 et après chaque récupération, plutôt que d’attendre un événement de fermeture peu fiable sur mobile. Une ancienne sauvegarde démarre sans gain rétroactif. Le calcul utilise le temps réel écoulé depuis ce début, y compris si le jeu reste ouvert ; aucun service ne tourne pendant l’absence. Les heures affichées sont plafonnées et les ressources arrondies à l’entier inférieur. Les fractions sont abandonnées à la récupération, qui remet toute la période à zéro.

La clé locale existante `la-mine-v2:prototype-meta:v1` est conservée. Le champ optionnel `relief.startedAt` s’ajoute sans modifier les quatre soldes ni les quatre niveaux existants. Portefeuille et timestamp sont enregistrés en une seule écriture. En cas d’échec, la récupération ne crédite rien et conserve le stock ; un message invite à réessayer. Dates invalides/futures : période redémarrée sans récompense ; horloge courante invalide : récupération refusée.

Limites du prototype : horloge de l’appareil, pas d’anti-triche, pas de cloud ni synchronisation garantie entre onglets simultanés. Utiliser un seul onglet de jeu. Une ancienne instance relit néanmoins le profil avant une récupération, une récompense de run ou un achat afin de ne pas restaurer une période déjà réclamée. Si le plafond de sécurité du portefeuille (999999 unités) est atteint, le crédit est limité à la place disponible ; un portefeuille entièrement plein conserve le stock. Localhost et l’adresse Wi-Fi ont des sauvegardes distinctes, car ce sont des origines différentes.

### Validation V0.10

**150/150 tests** : les tests existants sont conservés, avec adaptation du contrôle de hashes des deux fichiers explicitement étendus (portefeuille et stockage). Combat, drops, armes, boss, perks, ressources et coûts d’Atelier restent protégés par les tests existants. Les 17 nouveaux cas couvrent les durées, l’arrondi, les plafonds, la migration, les dates invalides, l’échec de sauvegarde, le double clic, le rechargement et la navigation.

| Absence simulée | Charbon | Fer |
| --- | ---: | ---: |
| 1 h | 12 | 1 |
| 8 h | 96 | 8 |
| 24 h | 288 | 24 |
| 48 h | 288 | 24 |

Vérification navigateur : stock plafonné conservé après rechargement, récupération 288/24, nouveau rechargement sans double crédit, reprise de production, badge de l’accueil et achat Puissance 30 Charbon (288→258). Écran sans défilement en 320 × 568 et 390 × 844. Les simulations utilisent exclusivement la fixture locale `tests/browser-qa.js` sur 5178, avec sa clé `la-mine-v2:qa-v010`, séparée du profil normal. Les boutons de simulation ne sont pas servis par le serveur normal. Captures `v010-*.jpg` et rapport `tests/v010-browser-report.json`.

### Lancer

Run navigateur V0.10 validée à la mitraillette : victoire, 5 salles, 45 ennemis,
607 tirs dont 0 en mouvement, récompenses 94 Charbon / 8 Fer. Retour accueil avec
arme conservée. Aucune erreur console. Le profil réel a conservé 40 Charbon,
27 Fer, 1 Diamant, 0 Jeton Grisou et les niveaux 4/0/2/0 après migration.
Les formats mobiles ont été vérifiés dans le navigateur de bureau ; pas de
nouveau contrôle physique Android pour cette version.

`npm test` puis `npm start` (PC : http://127.0.0.1:5177/).
Téléphone sur le même Wi-Fi : `npm.cmd start -- --host=0.0.0.0`, puis l’adresse affichée dans le terminal. Redémarrer le serveur si `server.mjs` change ; les SVG/WebP/PNG/JPEG gardent les bons MIME.

---

## Historique jusqu’à V0.9

Les sections ci-dessous documentent les versions précédentes ; leurs comptes de tests et mentions de fonctionnalités à venir sont historiques.

### État du prototype V0.9

Source de vérité : `C:\LaMineV2\la-mine-v2-v01`. Travail limité à ce dossier,
sans accès à CGWeb ni à l’ancienne La Mine. Aucun commit/push sans demande explicite.
Les tests et sauvegardes existants sont conservés. La V0.9 apporte une passe
visuelle aux menus, au personnage et à l’Atelier. Aucun changement de gameplay.
Aucune V0.10 engagée. Le sprint spécial **DA / Asset Kit / accueil** ajoute
16 assets locaux (15 SVG + héros WebP, environ 61 Kio) et met en scène le héros
sur le carreau de mine. Zones et Atelier réutilisent les ressources et panneaux.
Inventaire, direction artistique et provenance : [Kit DA 01](src/assets/kit-da/README.md).
Planche locale : http://127.0.0.1:5177/src/assets/kit-da/catalog.html.

Validation du sprint DA : **132/132 tests**, accueil sans défilement en 320 × 568
et 390 × 844, deux armes sélectionnables, états verrouillés conservés, Atelier
et retours vérifiés. Run navigateur pilotée par la fixture de test existante :
5 salles, 45 ennemis, victoire, 94 Charbon et 8 Fer, aucun tir en mouvement.
Achat en portefeuille mémoire : Puissance 0→1, Charbon 94→64. Défaite/Rejouer
revient aux zones avec l’arme sélectionnée. Aucune erreur console observée.
Rapport : `tests/kit-da-browser-report.json`. Captures : `kit-da-*.jpg`.
Les 18 fichiers protégés de combat, économie et sauvegarde sont identiques au
baseline V0.9. Sauvegarde réelle retrouvée après rechargement (aucun achat de test
sur ce profil). Le kit ne charge aucune ressource externe.

Limites : héros statique et arme sur râtelier ; sprites de combat inchangés.
Zones profondes et petits pictogrammes gardent une illustration plus simple.
Performance mesurée sur ce navigateur de bureau : 0,792 ms par frame de la
fixture (quatre pas de simulation), pas une mesure sur téléphone physique.

### Complément DA — service Android et profondeur du carreau

Le défaut Android provenait de deux processus écoutant le port 5177 :
l’un sur `127.0.0.1` avec les bons MIME, l’autre sur `0.0.0.0` avec une ancienne
table MIME encore en mémoire. Sur `192.168.1.15`, les SVG et WebP étaient servis
avec `application/octet-stream` et `nosniff`. Les URL étaient correctes et les
fichiers présents. Redémarrer le serveur Wi-Fi a résolu le défaut ; l’utilisateur
a confirmé sur Android/Chrome : « Tous les assets s’affichent ».

Le serveur déclare SVG, WebP, PNG, JPG et JPEG. Un test HTTP démarre un vrai serveur
et contrôle GET/HEAD, MIME, octets de chaque asset et réponses 404. Une requête
avec User-Agent Android teste les réponses serveur, pas le moteur Chrome Android.
Après toute modification de `server.mjs`, arrêter le serveur dans son terminal
(Ctrl+C), puis relancer depuis ce dossier : `npm.cmd start -- --host=0.0.0.0`.
Éviter de laisser simultanément un ancien serveur Wi-Fi et un serveur localhost.

Le nouveau `carreau-depth.svg` ajoute cage suspendue, bâtiments lointains, entrée
avec éclairage chaud, rails en perspective et wagonnet de premier plan. Le héros
est inchangé. Le râtelier possède des montants et un socle ; les plaques d’armes
reçoivent un léger relief, sans changer leur taille ni leurs actions. Aucune
animation ajoutée. Le kit passe à 17 assets / environ 66 Kio ; l’ancien décor et
les anciennes captures restent conservés. La scène reste une illustration
vectorielle statique : pas de parallaxe ni d’animation de cage ou de poussière.

Validation du complément : **133/133 tests**, accueil 320 × 568 et 390 × 844
sans débordement ni image cassée, sélection des deux armes et retour après run
vérifiés. Run fusil pilotée par la fixture existante : victoire, 45 ennemis,
94 Charbon / 8 Fer, 0 tir en mouvement, 0 erreur console. Coût moyen de la fixture
sur PC : 0,499 ms par frame (quatre pas de simulation), sans mesure de fluidité
sur téléphone physique. Captures `kit-da-depth-320.jpg`, `kit-da-depth-390.jpg` ;
rapport `tests/kit-da-depth-browser-report.json`.

Un projet Phaser **indépendant de CGWeb et de La Mine actuelle**. Cinq salles fixes,
un personnage, deux armes au choix, les Rats, les Mineurs, les Foreuses et La Haveuse. Aucun compte, aucune
base ni appel API. Seuls le portefeuille et quatre niveaux d’Atelier sont sauvegardés localement.
**Choix du Porion** : sept améliorations inchangées, trois choix locaux à la tentative.
Le dossier conserve son nom historique `la-mine-v2-v01` pour garder l’adresse
de lancement. Une copie des sources V0.1 et de ses assets est conservée dans
le dossier voisin `la-mine-v2-v01-snapshot` (sans node_modules).
La V0.2 avant cette évolution est aussi conservée dans `la-mine-v2-v02-snapshot`.

## Lancer sous Windows

Ouvrir PowerShell dans **ce dossier**, puis :

```powershell
npm.cmd install
npm.cmd start
```

`npm install` n’est nécessaire que lors de la première installation. Node.js 20+
est requis. Le jeu s’ouvre à **http://127.0.0.1:5177**. Arrêter le serveur avec
Ctrl+C. Il sert seulement les fichiers du prototype. Il ne lance pas CGWeb.
Phaser est livré par la dépendance locale, sans CDN pendant le jeu.

## Téléphone

Sur le PC, arrêter l’éventuel serveur précédent, puis lancer :

```powershell
npm.cmd run start:mobile
```

Le serveur affiche une adresse `http://192.168.…:5177` (selon le réseau).
Ouvrir cette adresse sur le téléphone connecté au **même Wi-Fi**. Le serveur
reste local, sans publication Internet. L’accès dépend du pare-feu et du réseau ;
aucun réglage réseau ou de sécurité n’est modifié par ce projet.

## Jouer

- Sur l’accueil, sélectionner **FUSIL À POMPE** ou **MITRAILLETTE**. Appuyer sur
  **EXPLORER LA MINE** (ou **ZONES**), puis **JOUER** dans **LES GALERIES**.
  Choisir ensuite une carte du Porion parmi celles compatibles avec l’arme.
- Les choix suivants surviennent après les salles 2 et 4. Aucun système d’XP
  ou de niveaux n’a été ajouté. Le combat est intégralement figé pendant le choix.
- Nettoyer la salle ouvre la sortie en bas, marquée **DESCENDRE**. Rejoindre
  cette zone au joystick ou au clavier déclenche le fondu de descente (0,6 s).
  Aucun passage automatique : les PV, PV maximum et perks sont conservés.
- **Chevrotine** ajoute 2 plombs, **Bottes du Porion** multiplie la vitesse par
  1,15, **Détente allégée** multiplie le délai entre tirs par 0,85. Choisir deux
  fois la même carte cumule son effet. Les perks sont remis à zéro en rejouant,
  tandis que les niveaux d’Atelier sont conservés.
- **Coup de Grisou** : 20 % de chance d’explosion à chaque mort, 28 dégâts dans un
  rayon de 76 pixels du monde. Les morts secondaires peuvent exploser à leur tour.
  Chaque ennemi ne déclenche qu’un jet, sans dégâts sur le joueur.
- **Canon scié** : +35 % de dégâts si la distance réelle joueur/cible à l’impact
  est au plus 70 pixels du monde. Le bonus est capturé au départ du projectile.
- **Double détente** : 20 % de chance d’une seconde salve immédiate, même
  dispersion, sans nouveau jet. Flash/recul renforcés et anneau au canon.
- **Plaques du Porion** : PV maximum multipliés par 1,2, en conservant exactement
  le ratio de vie. Les PV fractionnaires sont conservés ; l’affichage est arrondi
  à une décimale. Les cinq segments représentent le pourcentage de santé.

| Amélioration | Limite de cumul |
| --- | --- |
| Chevrotine | 5 rangs : 17 projectiles |
| Bottes du Porion | 3 rangs : environ 322 px/s |
| Détente allégée | 5 rangs : environ 0,40 s entre tirs |
| Coup de Grisou | 4 rangs : 80 % de chance |
| Canon scié | 3 rangs : +105 % à très courte portée |
| Double détente | 4 rangs : 80 % de chance |
| Plaques du Porion | 4 rangs : environ 10,37 PV maximum |

Les cartes au plafond sont exclues du tirage. Chaque choix est mélangé, sans
doublon, et privilégie trois catégories distinctes tant que le pool le permet.
Les probabilités cumulées sont affichées sur les cartes correspondantes.
Le rythme des choix est désormais lié aux salles : départ, fin de salle 2,
fin de salle 4. Les plafonds élevés sont testés mais pas tous atteignables avec
ces trois choix. Aucun soin gratuit n’est appliqué entre les salles.

- Les trois cartes sont accessibles au toucher, à la souris ou via Tab/Entrée.
  Échap ne permet pas de contourner un choix ; le changement d’onglet le conserve.
- **Mobile** : maintenir et glisser sur la salle ou le joystick. Le joystick
  apparaît sous le doigt. Relâcher pour s’arrêter.
- **PC** : maintenir WASD, ZQSD ou les flèches. Le joystick fonctionne aussi
  en glissant avec la souris.
- **Tir à l’arrêt** : l’arme vise l’ennemi actif le plus proche dans sa portée.
  Bouger bloque les nouvelles salves ; relâcher reprend le tir après le freinage
  et le bref délai conservé de V0.5. Se rapprocher concentre les plombs et augmente
  les dégâts. Le test A/B est terminé, son interface a été retirée.
- Les anneaux annoncent les apparitions. Les ennemis poursuivent le joueur et
  blessent au contact ; une courte invulnérabilité évite les dégâts en rafale.
- Vaincre La Haveuse en salle 5 pour gagner. Perdre tous les PV termine la tentative.
- **REJOUER** retourne à la carte des zones ; **RETOUR À L’ACCUEIL** revient au mineur.
  Le prochain lancement crée une nouvelle run avec l’arme sélectionnée, le portefeuille
  et les niveaux d’Atelier conservés. Échap ou sortie de l’onglet : pause, puis
  **REPRENDRE**. Aucun temps ni dégât n’est ajouté pendant la pause.

## Structure

| Fichier | Rôle |
| --- | --- |
| `src/config.js` | Valeurs de déplacement, PV, cadence, portée et dispersion |
| `src/player.js` | Déplacement, limites de salle, PV, invulnérabilité |
| `src/input.js` | Joystick, WASD/ZQSD/flèches, annulation des gestes |
| `src/weapon.js` | Moteur commun : ciblage, dispersion et salves |
| `src/weapons.js` | Paramètres, effets, silhouettes et perks compatibles des deux armes |
| `src/weapon-overlay.js` | Ancien écran V0.7 conservé, non utilisé par le flux V0.8 |
| `src/menu/` | Accueil, personnage SVG, navigation, armes et carte de zones |
| `src/enemy.js` | Socle partagé : vie, apparition, poursuite et knockback |
| `src/enemies/` | Paramètres, registre, trois comportements et placeholders |
| `src/enemy-projectiles.js` | Pool borné des tirs de Foreuse et collisions |
| `src/stationary-fire.js` | Tir à l’arrêt officiel |
| `src/combat.js` | Pool de projectiles, collisions continues et dégâts |
| `src/run.js` | Session unique, introductions progressives, victoire/défaite |
| `src/rooms.js` | Cinq définitions fixes, sortie, durée de transition |
| `src/room-view.js` | Décors, porte, télégraphe, barre boss et fondu |
| `src/boss.js` | La Haveuse : poursuite lente, charge annoncée, récupération |
| `src/room-scene.js` | Scène Phaser, rendu, synchronisation et pause |
| `src/effects.js` | Particules et anneaux réutilisés, sans effets lourds |
| `src/textures.js` | Formes et sprites placeholders générés localement |
| `src/ui.js` | PV, démarrage, pause et écran de fin |
| `src/upgrades.js` | Sept effets, tirages, plafonds, pause et sélection unique |
| `src/explosions.js` | Dégâts de zone et file bornée de réactions en chaîne |
| `src/upgrade-overlay.js` | Dialogue de sélection et navigation clavier |
| `src/upgrade-card.js` | Cartes, textes et icônes SVG |
| `src/ravens.js` | Mascotte et répliques contextuelles sans répétition immédiate |
| `src/assets/porion-ravens.png` | Illustration transparente de Ravens |
| `server.mjs` | Petit serveur statique Node, sans backend métier |
| `tests/game.test.js` | Tests du code réellement utilisé par le jeu |
| `tests/upgrades.test.js` | Tirages, sept effets, plafonds, synergies naturelles et pause |
| `tests/rooms.test.js` | Progression complète, persistance de run, choix et boss |

## Les cinq salles

| Salle | Rencontre | Repère visuel |
| --- | --- | --- |
| 1 | 6 Rats, 3 simultanés, intervalle 1,8 s | Galerie et lampes |
| 2 | 7 Rats + 3 Mineurs, 4 simultanés, intervalle 1,4 s | Rails au sol, wagonnets sur les bords |
| 3 | 9 Mineurs + 3 Foreuses, 5 simultanés, intervalle 1,1 s | Tuyaux, apparitions sur les flancs |
| 4 | 9 Rats + 4 Mineurs + 3 Foreuses, 7 simultanés, intervalle 0,85 s | Galerie sombre et balises rouges |
| 5 | La Haveuse, 560 PV | Chambre des machines |

Les décors sont des repères visuels, sans obstacles solides. Pas de génération
procédurale. Les 44 ennemis + le boss font 45 éliminations possibles.
Les ancrages de spawn restent fixes et vérifient la distance au joueur.

La Haveuse poursuit à 48 px/s, puis annonce une direction pendant 0,9 s.
La direction reste verrouillée pendant l’esquive ; la charge avance à 340 px/s
pendant au plus 0,65 s, s’arrête aux murs, puis récupère pendant 0,95 s.
La bande au sol indique sa trajectoire. Deux comportements seulement, aucune
phase 2 ni invocation. Une annonce de 2,2 s ne bloque pas les commandes.

Les écrans de fin affichent la salle atteinte, le temps actif, les éliminations,
les dégâts subis et les perks choisis, puis les récompenses V0.4. Rejouer réinitialise
la tentative et ses perks, mais conserve le portefeuille et les niveaux d’Atelier.

## Vérifier

```powershell
npm.cmd test
```

Les tests vérifient déplacement et collisions, clavier/joystick, ciblage, portée,
dispersion, cadence, dégâts, mort, apparition, limites de ressources et remise à
zéro. Les simulations de combat restent dans les tests : aucun bot ne pilote le
joueur dans le prototype.

## Limites volontaires

- Salle et acteurs géométriques temporaires ; Ravens illustré ; sans son.
- Équilibrage très court, destiné à évaluer le déplacement et le T2, pas un jeu fini.
- Pas de navigation complexe : sols dégagés, poursuite et séparation.
- Le rendu vise 60 images/s avec au plus 8 ennemis, 84 emplacements de projectiles
  et 96 particules réutilisables. La fluidité sur un téléphone physique reste à
  confirmer sur l’appareil ciblé ; un format mobile dans un navigateur PC n’est
  pas une mesure des performances d’un téléphone.
- Tout est local. Fermer ou recharger la page efface la tentative en cours.

Phaser 3.90.0 est épinglé dans `package.json` et `package-lock.json`.
Documentation : https://docs.phaser.io/api-documentation/3.90.0/ .

## Porion Ravens

Première apparition garantie, puis choix important garanti. Le sélecteur prévoit
30 % d’apparition pour un futur choix ordinaire. Boss, Jeton Grisou, victoire et
mort sont des contextes garantis. La V0.4 donne priorité à la réplique Jeton,
puis Diamant ou gros gain, dans le bilan déjà existant : aucune apparition supplémentaire.
Les choix contenant Grisou utilisent les phrases explosions ; sinon, la première
carte proposée fournit le contexte. Survie, courte portée et cadence disposent
de répliques dédiées, sans changer la fréquence des apparitions.

La mascotte est hors de la zone des cartes, sans réception des clics/touches.
Entrée de 380 ms, désactivée si le système demande de réduire les animations.
La pause couvre déplacements, tirs, projectiles, ennemis, dégâts et timers.
Les effets sont limités à la tentative et ne changent aucune constante globale.

Illustration générée avec l’outil ImageGen intégré, sans photographie fournie,
à partir des traits décrits (interprétation stylisée, pas de ressemblance vérifiée).
Prompt utilisé :

> Create a single game mascot asset, transparent background, waist-up character
> cutout, no text, no lettering, no scenery. Porion Ravens, a friendly confident
> middle-aged bald man with black rectangular glasses, short dark goatee, warm
> mischievous smile, stylized semi-cartoon illustration not photorealism. Mine
> foreman in anthracite work jacket with mining yellow accents, copper and steel
> industrial details, yellow hardhat tucked under one arm so his bald head remains
> clearly visible, other arm casually folded. Broad simple readable silhouette.
> Three-quarter view looking slightly toward left at the game upgrade cards.
> Entire head, shoulders and arms in frame, waist cropped cleanly at lower edge,
> minimal transparent margins. High-quality clean illustrated mobile game
> character, strong shapes, restrained cel shading, warm light, charming not
> grotesque. Designed to sit at bottom right of dark industrial game upgrade UI.

Correction vestimentaire demandée ensuite, appliquée à cette illustration avec
ImageGen intégré. Prompt d’édition :

> Edit only the clothing / field equipment of this existing Porion Ravens mascot.
> Preserve exactly his bald head, glasses, short goatee, friendly slightly mocking
> smile, confident relaxed pose, proportions, semi-cartoon illustration style,
> waist-up framing and transparent background. Make him look like an experienced
> hands-on underground mine foreman, not elegant or ceremonial. Replace the tidy
> uniform styling and decorative straps/emblem with a rugged heavy canvas
> anthracite work jacket, functional large stitched pockets, worn reinforced seams,
> modest dusty mining-yellow safety accents, steel fasteners. Add a compact
> practical radio clipped on chest and scuffed work gloves tucked into belt, light
> coal dust and realistic restrained wear on fabric and cuffs. Keep yellow mining
> hardhat with its obvious headlamp tucked under arm, scuffed and dusty. Palette
> anthracite, mining yellow, copper, steel. No suit lapels, no dress shirt, no shiny
> decorative buttons, no luxury leather styling. Clean readable silhouette for
> small mobile UI, no added background, no text. Do not change face or personality.

## V0.4 — Récompenses et Atelier

La V0.3 est conservée dans le dossier voisin `la-mine-v2-v03-snapshot`.
La progression est locale, sans compte ni serveur. Aucun fichier de CGWeb utilisé.

Chaque salle **terminée** ajoute son lot au bilan de fin. Une défaite conserve les
lots des salles terminées, jamais ceux d’une salle seulement atteinte. Abandonner
ou recharger pendant une run ne donne aucun gain : les runs ne sont pas sauvegardées.
Le résultat est crédité une seule fois avant l’ouverture de l’Atelier.

| Salle terminée | Charbon garanti | Fer | Diamant | Jeton Grisou |
|---|---:|---|---|---|
| 1 | 10 | — | — | — |
| 2 | 14 | 25 % : 1 | — | — |
| 3 | 18 | 60 % : 2 | — | — |
| 4 | 22 | 3 garantis | 5 % : 1 | — |
| Boss | 30 | 5 garantis | 12 % : 1 | 1 % : 1 |

Les jets sont indépendants. Une victoire donne 94 Charbon, 8–11 Fer, 0–2 Diamants
et 0–1 Jeton. Le Jeton a une carte dorée animée brièvement (sauf mouvement réduit)
et une réplique spéciale de Ravens. Aucun audio ajouté.

Après victoire/défaite : **ATELIER**, acheter, **RETOUR À LA DESCENTE**, **REJOUER**.
Quatre améliorations, chacune de 0 à 5 : Puissance (+5 % dégâts), Robustesse (+5 % PV),
Mécanique (−5 % intervalle de tir), Mobilité (+5 % vitesse). Pourcentages additifs
par rapport à la base : au maximum +25 % ou −25 %. Les sept perks restent inchangés.
Les explosions du perk Grisou conservent leurs dégâts fixes.

| Nouveau niveau | Coût identique pour chaque amélioration |
|---|---|
| 1 | 30 Charbon |
| 2 | 60 Charbon |
| 3 | 100 Charbon + 6 Fer |
| 4 | 150 Charbon + 12 Fer |
| 5 | 220 Charbon + 20 Fer + 1 Diamant |

Le Jeton reste sans usage. Aucun achat ne modifie une run déjà créée.

### Modules

- `resources.js` : quatre identités et icônes placeholders.
- `rewards.js` : barème et tirages indépendants du RNG de combat.
- `wallet.js` : crédits uniques par run, achats et coûts.
- `permanent-upgrades.js` : quatre contrats, coûts, application au constructeur Run.
- `local-profile-storage.js` : JSON versionné, clé `la-mine-v2:prototype-meta:v1`.
- `workshop.js` : Atelier, navigation clavier, défilement vertical.
- `ui.js` : bilan ; `room-scene.js` relie résultat, portefeuille et nouvelle run.

### Limites

Équilibrage provisoire. Sauvegarde limitée à ce navigateur et cette origine
(hôte + port) ; pas de cloud, export ou synchronisation entre onglets. Utiliser
une seule partie à la fois. Le stockage local peut être modifié manuellement.
Si le navigateur refuse le stockage, un message indique que les gains/achats ne
survivront pas au rechargement. Plafond : 999 999 par ressource. L’Atelier défile
sur petits écrans pour garder des cibles tactiles d’au moins 44 px.
Aucune nouvelle dépendance.

### Vérification V0.4

`npm.cmd test` : régression combat/perks, rareté sur 100 000 victoires déterministes,
crédits uniques, coûts, plafonds, refus d’achat, persistance, stockage indisponible,
dégâts effectifs et boucle combat → victoire → gains → achat → nouvelle run.
Vérifications navigateur des résultats et de l’Atelier à 320 × 568 et 390 × 844,
avec une fixture UI temporaire et une clé QA distincte du portefeuille de jeu.

## V0.5 — Historique : comparaison du tir et drops physiques

**Décision V0.6 : B retenu.** Le paragraphe de test A/B ci-dessous conserve
l’historique V0.5 ; ce bouton et le mode A ne sont plus présents dans le jeu.

### Tester A et B

Le bouton discret **TEST A/B** est disponible dans les écrans existants de départ,
pause et fin de run. Cliquer pour basculer, puis JOUER / REPRENDRE / REJOUER.
Sur téléphone, quitter puis retrouver l’onglet met la partie en pause.
Le choix est conservé entre les runs de cet onglet, mais revient à A au rechargement.
A sert uniquement de référence V0.4 : aucun choix définitif entre A et B n’est fait.

- **A — tir en mouvement** : comportement V0.4, même cadence et même arme.
- **B — tir à l’arrêt** : une commande de mouvement ou une vitesse résiduelle
  bloque toute nouvelle salve. Le ciblage et le cooldown continuent normalement.
  Après relâchement, le freinage existant et un délai de 60 ms se déroulent en
  parallèle : le tir reprend dès que les deux sont terminés et que l’arme est prête
  (environ 100 ms à vitesse de base, sans ajouter un délai après le freinage).
  Les projectiles déjà partis continuent leur course. Reprendre la marche bloque
  immédiatement les nouvelles salves, y compris Double détente.

`src/prototype-fire.js` isole le test et son bouton. Aucun réglage n’est sauvegardé.
Dispersion, dégâts, portée, cadence, perks et effets du T2 sont inchangés.

### Butin et économie

Le barème V0.4 ci-dessus reste identique. Chaque salle tire son budget une seule
fois avec un RNG indépendant du combat. Les morts répartissent ce budget :
petits tas de Charbon, un lot de Fer à mi-combat si prévu, Diamant éventuel sur
le dernier ennemi et Jeton éventuel sur le boss. Un symbole ×N représente un lot,
pas N objets. Les chances restent par salle, **pas par ennemi**.

Les drops restent au sol pendant le combat ; passer à proximité les ramasse.
Le compteur « butin provisoire » indique les objets déjà ramassés dans cette salle.
Ils sont validés seulement si la salle est terminée : mourir en cours de salle
annule ce butin provisoire, comme dans l’économie V0.4. Les gains des salles déjà
terminées sont conservés. Abandonner/recharger une run ne crédite toujours rien.

Dernier ennemi → respiration de 180 ms → aimantation accélérée → validation du
butin → Choix du Porion éventuel → sortie ouverte. Le joueur reste libre de bouger
pendant l’aspiration. Après le boss, la même collecte précède l’écran de victoire.
Pause et choix figent la simulation ; aucune animation de butin en temps réel
indépendante de la simulation n’est utilisée.

Le bilan et le portefeuille lisent le même registre des ressources collectées
et validées. Aucun second tirage ni cumul avec une autre récompense de salle.
La sauvegarde locale V0.4 reste compatible et l’Atelier est inchangé.

Placeholders : Charbon gris sombre, lingot de Fer brun métallique, Diamant cyan,
Jeton doré cerclé avec un symbole propre. Le Jeton utilise la réplique rare de
Ravens déjà présente au bilan ; aucune apparition supplémentaire pendant le combat.

### Limites techniques et vérification

- Pool de 20 emplacements, au plus 18 drops simultanés dans les salles actuelles.
  Les quantités ne multiplient pas les objets. Un seul Graphics Phaser pour les
  formes, 20 étiquettes réutilisées ; aucun blur, physique ou particules de butin.
- Aimantation de 160 à 1 400 px/s, accélération 1 800 px/s², respiration 180 ms.
  Le léger rebond d’apparition et le cercle pulsant du Jeton sont désactivés si
  le navigateur demande moins d’animations.
- Les 67 cas de test existants sont conservés ; les assertions de fin de salle
  attendent désormais la collecte. Nouveaux tests dans `fire-modes.test.js` et
  `loot.test.js` : absence de tirs parasites, reprise, perks, budgets, rareté,
  ramassage, aimantation, pause, transitions, victoire, défaite et crédit unique.
- Les tests simulent des runs complètes A et B sans modifier les statistiques.
  Le ressenti final A/B reste à décider après essai manuel ; la fluidité sur
  téléphone physique reste à vérifier sur l’appareil ciblé.

Le serveur QA a été adapté à la V0.6 (voir ci-dessous). Les anciens tests A/B
restent conservés, avec le comportement A isolé dans `tests/legacy-fire.js` ;
aucune option A n’est exposée dans les sources du jeu.

Validation V0.5 : **83/83 tests réussis** (67 cas conservés, 16 nouveaux).
Deux runs complètes dans le navigateur avec les fixtures de pilotage, chacune
avec 45 éliminations, trois perks et 94 Charbon + 8 Fer pour le tirage fixé :
A compte 86 salves en mouvement sur 87 ; B en compte 0 sur 83.
La collecte finale dure environ 0,4–0,7 s par salle dans ces scénarios.
Les scènes de 18 drops et des quatre ressources du boss ont aussi été aspirées
à vitesse normale. Affichage contrôlé en 320 × 568 et 390 × 844, bilan,
sélecteur A/B, Atelier et achat inclus ; aucune erreur console observée.
Captures `v05-drops-320.jpg`, `v05-drops-390.jpg`, `v05-ressources-390.jpg`,
`v05-victoire-b-320.jpg` et `v05-atelier-390.jpg`. Les scènes de drops sont des
fixtures visuelles, distinctes des runs complètes. Ces contrôles sur PC ne
constituent pas une mesure de performances sur téléphone physique.

### Vision future — documentation uniquement

Accueil en zones/mondes à débloquer ; cartes épaisses, volumes, ombres et direction
cartoon/2.5D ; personnage C2G visible dans les menus ; pistolet, fusil à pompe,
mitraillette, fusil d’assaut et laser ; page Talents ; progression passive
« La Relève » ; Caisse du Porion/coffres ; Contrats communautaires.
Ressources limitées à Charbon, Fer, Diamant et Jeton Grisou.
Aucun de ces systèmes n’est implémenté dans cette version.

## V0.6 — Trois menaces, tir à l’arrêt officiel

Le T2 Gamin, les sept perks, les cinq salles, leurs récompenses, les drops,
l’aspiration, les trois choix du Porion, l’Atelier et la sauvegarde locale
conservent leurs règles. Aucun changement du boss, aucune nouvelle arme.
Le tir à l’arrêt est obligatoire, y compris après rechargement et nouvelle run.
L’ancien mode A est conservé exclusivement comme fixture de régression des tests.

| Ennemi | PV | Vitesse (px/s) | Contact | Comportement / silhouette |
|---|---:|---:|---:|---|
| Rat de galerie | 22 | 118 | 0,5 PV | Poursuite directe, petit corps rose, oreilles et queue |
| Mineur grisouteux | 90 | 46 | 1,5 PV | Poursuite lente, carrure massive ocre, casque et bretelles |
| Foreuse autonome | 48 | 54 | 0,5 PV | Distance 125–155 px, chenilles violettes et foret métallique |

La Foreuse commence par se positionner ; elle s’immobilise, affiche **VISÉE**
et une ligne violette en pointillés pendant **0,9 s**. La direction est verrouillée
au début de cette annonce : elle ne suit pas une esquive. Elle lance ensuite un
seul projectile à **145 px/s**, pour 1 PV de dégâts, puis reste en récupération
0,6 s. Le prochain cycle exige 2,4 s de repositionnement avant une nouvelle visée.
Le projectile est plus lent que le joueur de base (212 px/s), sans poursuite,
ricochet, tir instantané ni attaque en éventail. Le T2 reste à portée en approchant.

Les impacts partagent l’invulnérabilité existante : plusieurs contacts ou tirs
simultanés ne cumulent pas leurs dégâts pendant cette fenêtre. Les tirs déjà
partis d’une Foreuse restent évitables après sa mort ; tous les tirs ennemis
restants sont retirés à la fin du combat, avant l’aspiration. Une Foreuse tuée
sur la frame où elle devait tirer n’émet pas de projectile posthume.

Les séquences de types sont fixes dans `src/rooms.js` (tableau des salles plus haut).
Les budgets de ressources dépendent toujours des salles, jamais du type tué.
La Haveuse reste seule en salle 5, avec ses statistiques et comportements précédents.
Ravens garde son rôle et sa fréquence d’apparition ; aucune réplique de spawn ajoutée.

### Architecture et limites

- Paramètres dans `src/enemies/stats.js` ; classes `rat.js`, `miner.js`, `drill.js` ;
  registre de création et d’affichage dans `registry.js`.
- Vie, apparition et réaction aux impacts partagées dans `src/enemy.js`.
  Placeholders séparés dans `textures.js`, rendu/télégraphes dans `view.js`.
- Au plus 7 ennemis simultanés, pool de **8 projectiles hostiles**, au plus un
  projectile actif par Foreuse. Les projectiles expirent aux murs ou à 420 px.
  IA vectorielle simple, aucun pathfinding, shaders, blur ou particules supplémentaires.
- Les quantités de drops et les pools de projectiles du joueur sont inchangés.
- Équilibrage initial à confirmer au ressenti. Les captures aux tailles mobiles
  sur PC ne certifient pas les performances sur téléphone physique.

### Vérifier

`npm.cmd test` conserve les **83 cas précédents**, adaptés au tir à l’arrêt,
et ajoute les tests V0.6 dans `tests/enemies.test.js`. Les pilotes automatiques
sont exclusivement dans `tests/`, sans modification des statistiques du joueur.

Pour vérifier le rendu : `node tests/browser-qa-server.mjs`, puis
`http://127.0.0.1:5178`. Menu QA : run complète, arrêt sur une salle 4 mixte,
trois silhouettes, visée/attaque de Foreuse et scènes de drops. La run automatique
avance à ×4 ; les démonstrations d’attaque et d’aspiration tournent à vitesse réelle.
La démonstration « Foreuse : esquive » désactive seulement le tir du joueur pour
observer son attaque et permet de se déplacer avec les commandes habituelles.
Le portefeuille QA reste en mémoire, sans créditer la sauvegarde du jeu.
Le serveur normal sur 5177 ne sert aucun fichier de `tests/`.

Validation V0.6 : **104/104 tests réussis**, dont les 83 cas antérieurs conservés
et 21 nouveaux. Une run complète navigateur avec pilotage de test atteint la
victoire en environ 98 s de simulation : 45 ennemis, 16 éliminations en salle 4,
les trois types simultanément observés, La Haveuse vaincue, trois choix du Porion,
94 Charbon + 8 Fer avec le tirage QA fixé, aucun drop restant ni tir en mouvement.
Les silhouettes et le télégraphe sont contrôlés en 320 × 568 et 390 × 844,
ainsi qu’une scène de sept ennemis et trois projectiles de Foreuse simultanés.
Le test de charge simule 40 s avec sept ennemis et un pool de huit projectiles.
Aucune erreur console observée. Rapport : `tests/v06-browser-report.json`.
Captures : `v06-ennemis-320.jpg`, `v06-ennemis-390.jpg`, `v06-salle4-390.jpg`,
`v06-victoire-390.jpg`, `v06-pression-320.jpg`.


## V0.7 — Deux armes, deux façons de descendre

JOUER et REJOUER ouvrent le choix FUSIL À POMPE / MITRAILLETTE, puis le
Choix du Porion initial. Les deux armes sont disponibles sans déblocage.
Le choix dure une run et ne modifie pas le format de sauvegarde.

| Paramètre | Fusil à pompe (V0.6 conservée) | Mitraillette |
| --- | --- | --- |
| Projectiles / tir | 7 | 1 |
| Dégâts / projectile | 12, décroissants avec la distance | 5 constants |
| Délai de base | 0,9 s | 0,12 s |
| Portée | 192 | 280 |
| Vitesse projectile | 730 | 850 |
| Dispersion | 0,49 rad | 0 |
| Recul visuel | 5 | 1 |
| Poussée à l’impact | 38 | 8 |

Les cadences sont quantifiées à la frame. La mitraillette utilise un petit flash,
un impact léger et aucun tremblement au tir. Le prototype reste sans audio ;
la différence de cadence est visuelle. Silhouette compacte avec chargeur,
sans asset final. Les paramètres et perks compatibles sont dans src/weapons.js ;
Weapon et Projectiles constituent le moteur commun. L’export historique Gamin
reste disponible pour les tests de régression.

Bottes, Détente allégée, Grisou et Plaques sont compatibles avec les deux armes.
Chevrotine, Canon scié et Double détente restent réservés au fusil. Aucun nouveau
perk. Les quatre améliorations permanentes s’appliquent à la base de l’arme choisie.
Ennemis, IA, boss, salles, économie, coûts, aspiration et stockage sont conservés.

### Validation V0.7

- **119/119 tests réussis**, dont les 104 cas existants conservés et 15 nouveaux
  dans tests/weapons.test.js : stats, tir à l’arrêt, cadence, collisions, portée,
  chaque ennemi, boss, perks, Grisou, bonus permanents et stress à cadence maximale.
- Deux runs complètes dans le vrai rendu Phaser, via le serveur QA local et ses
  boutons « Run complète fusil » / « Run complète mitraillette » : 45 ennemis,
  trois choix, La Haveuse vaincue, aucun tir en mouvement, aucun drop restant.
- Pilotes de test déterministes (seed 16), sans changement des stats ni guérison.
  Le pilote de la mitraillette utilise des rafales à distance et évite les lignes
  de tir. Ces pilotes ne sont pas servis par le serveur normal.
- Fusil : 97,8 s simulées, 4,5 PV restants, 89 salves ; mitraillette : 131,5 s,
  1,5 PV restants, 607 tirs. Chacun collecte 94 Charbon et 8 Fer avec le RNG de
  récompenses de test. Le portefeuille QA reste uniquement en mémoire.
- Temps moyen mesuré pour quatre pas simulation/rendu par frame QA : 0,622 ms
  au fusil, 0,863 ms à la mitraillette sur ce navigateur ; ce n’est pas une mesure
  de performance sur téléphone physique. Pools fixes de projectiles et d’effets.
- Choix des deux armes, perks filtrés, replay, écrans 320 × 568 et 390 × 844
  contrôlés dans le navigateur. Aucune erreur ni avertissement console relevé.
- Rapport : tests/v07-browser-report.json. Captures : v07-choix-320.jpg,
  v07-choix-390.jpg, v07-victoire-smg-320.jpg, v07-victoire-fusil-390.jpg.
  Les captures et rapports des versions précédentes sont conservés.

Équilibre à faire confirmer par le jeu humain : la mitraillette exige de garder
une sortie et de réagir aux Foreuses ; elle est moins efficace au contact des
Mineurs. Un Mineur prend 18 balles de base (plus de deux secondes de tir continu).
La portée aide contre les Foreuses et le boss, mais les runs de test ne suffisent
pas à prouver un équilibre général : leurs pilotes et perks diffèrent.
Aucun rééquilibrage du fusil ou des ennemis pendant cette étape V0.7.


## V0.8 — Accueil, personnage et descente par zones

Le lancement affiche maintenant le carreau de la mine : personnage cartoon SVG
original, portique minier, arme équipée, quatre ressources compactes et boutons
avec relief léger. Aucun téléchargement d’asset, shader, blur ou moteur 3D ajouté.
L’illustration est un placeholder ; le personnage en combat reste inchangé.

- **Personnage** : accueil et choix immédiat du fusil ou de la mitraillette.
  Le bouton sélectionné est surligné, expose aria-pressed et actualise le portrait.
- **Zones** : parcours vertical avec rails, profondeurs, panneaux décalés et cadenas.
  Les Galeries lance la run actuelle de cinq salles. Les quatre autres noms et
  profondeurs sont regroupés dans src/menu/state.js et restent à venir, même après
  une victoire. Aucun contenu supplémentaire ni progression persistante des zones.
- **Atelier** : même instance et même logique d’achat que précédemment. Accessible
  depuis l’accueil, les zones et le résultat. Le retour retrouve le menu d’origine
  et actualise le bandeau de ressources. Coûts, niveaux et bonus inchangés.
- **Talents, La Relève, Caisses** : emplacements explicitement verrouillés,
  boutons désactivés sans action ni système associé.
- Fin de run : REJOUER revient aux zones ; RETOUR À L’ACCUEIL revient au personnage.
  L’arme reste sélectionnée pendant la session. Un rechargement revient au fusil ;
  aucun nouveau champ n’est ajouté à la sauvegarde existante.

Architecture : main-menu.js coordonne uniquement le menu ; state.js protège
navigation et lancement (y compris double appui) ; zones.js compose le parcours ;
weapon-selector.js gère les choix ; character.js produit le SVG ; menu.css reste
séparé des styles de combat. RoomScene relie le lancement à la Run existante.
L’ancien WeaponOverlay V0.7 est conservé mais n’est plus appelé.

### Validation V0.8

**125/125 tests réussis** : les 119 tests précédents sont conservés, avec six
nouveaux tests de navigation, zones verrouillées, choix et transmission d’arme,
lancement unique, retour au menu et absence d’écriture de profil.

Vérifications navigateur :
- Accueil et zones aux dimensions 320 × 568 et 390 × 844 ; personnage et deux
  armes visibles, sélection marquée, quatre ressources lisibles, aucun débordement
  horizontal. Les boutons actifs ont une hauteur d’au moins 44 px. Le parcours
  des zones défile indépendamment du bandeau et de la navigation fixe.
- Les deux runs ont été lancées par le véritable parcours accueil → zones →
  Les Galeries → choix du Porion, puis conduites par le pilote QA déterministe.
  Mitraillette : victoire en 131,5 s simulées, 607 tirs, 1,5 PV. Fusil : victoire
  en 97,8 s, 89 salves, 4,5 PV. Même bilan que V0.7 : 45 morts, trois perks,
  94 Charbon et 8 Fer avec le RNG de test, aucun tir en mouvement.
- Retour aux zones après victoire, retour accueil après défaite de contrôle,
  sélection d’arme conservée ; aucune zone future débloquée.
- Achat Puissance vérifié dans l’Atelier avec portefeuille QA en mémoire :
  94 → 64 Charbon, niveau 0 → 1, prochain coût 60, bandeau du menu actualisé.
  La sauvegarde réelle du navigateur n’a pas été dépensée par ce test.
- Aucune erreur ni avertissement console relevé. Mesure QA simulation/rendu
  (quatre pas par frame) : 0,747 ms mitraillette, 0,715 ms fusil sur ce navigateur.
  Le menu est statique ; ces mesures ne remplacent pas un essai sur téléphone réel.

Rapport : tests/v08-browser-report.json. Captures : v08-accueil-320.jpg,
v08-accueil-390.jpg, v08-zones-320.jpg, v08-zones-390.jpg,
v08-victoire-320.jpg. Les anciens tests, rapports et captures restent conservés.

Limites volontaires : seul Les Galeries est jouable ; les autres zones, Talents,
La Relève et Caisses sont des aperçus verrouillés. Aucun changement des armes,
perks, ennemis, boss, salles, récompenses, économie ou format de stockage.
Fin de l’étape V0.8. Aucun commit/push.


## V0.9 — Direction artistique des menus

La structure V0.8 est conservée. Cette passe retravaille uniquement la présentation :

- Mineur original en SVG : tête plus grande, visage souriant, pose asymétrique,
  casque éclairé, vêtements ombrés et bottes épaisses. Armes dessinées séparément
  pour le menu, sans modifier leurs sprites ni leurs paramètres de combat.
- Carreau de mine : portique épais, rails en perspective, caisse et socle minier.
  Petite présence de Ravens utilisant son image existante, sans nouveau dialogue.
- Équipement : illustrations agrandies, carte dorée, coche et mention ÉQUIPÉ,
  état aria-pressed conservé. Deux armes, aucune statistique ou rareté nouvelle.
- Ressources : icônes facettées et compteurs compacts. Noms et montants restent
  du texte accessible ; seul le dessin décoratif est remplacé.
- Zones : puits continu, rails verticaux, paliers illustrés et enseignes inclinées.
  Wagon, voies, ascenseur, roches et cristaux différencient les cinq vignettes.
  Une seule zone jouable, quatre verrous : ce sont des illustrations de menu,
  pas de nouveaux environnements ou contenus de combat.
- Atelier : établi illustré, quatre stations distinctes, emblèmes et cinq témoins
  de niveau. Les titres, bonus, prix, conditions et handlers d’achat sont conservés.
- Navigation : icônes dessinées, état actif en relief et trois emplacements futurs
  illustrés, tous désactivés et étiquetés BIENTÔT.

Styles : menu.css est réorganisé par composants ; workshop.css remplace les
anciennes règles Atelier de style.css. Les illustrations partagées sont dans
src/menu/art.js, le héros et les armes dans character.js. Pas d’empilement de
correctifs, de dépendance ajoutée, d’image HD nouvelle, de filtre SVG/CSS lourd
ou de vraie 3D. Seule la perspective des rails utilise une transformation CSS.
Transitions de section de 160 ms, pression des boutons de 100 ms ; aucun cycle
animé permanent. prefers-reduced-motion supprime les animations de menu.

### Validation V0.9

**128/128 tests réussis** : les 125 tests existants sont conservés, avec trois
cas supplémentaires dans tests/menu-art.test.js (montants/labels préservés lors
de la décoration, petits SVG sans assets externes ni filtres, noms accessibles
et illustrations distinctes pour les armes).

Une empreinte SHA-256 de 18 fichiers protégés a été prise avant modification
(tests/v09-protected-baseline.json). La comparaison finale ne relève aucun
changement dans ces fichiers : armes, combat, ennemis, boss, perks, salles,
loot, économie, bonus permanents et stockage. L’Atelier reçoit uniquement des
éléments de présentation autour de sa logique d’achat existante.

Contrôles navigateur : accueil, sélection des deux armes, carte et défilement,
verrous, Atelier, lancement réel des Galeries, victoire et défaite de contrôle,
retours au menu, achat Atelier avec portefeuille QA uniquement en mémoire.
Dimensions 320 × 568 et 390 × 844 : accueil entièrement visible sans défilement,
aucun débordement horizontal, boutons actifs d’au moins 44 px. Les zones et
l’Atelier défilent ; leur contenu n’est pas rétréci pour tout tenir sur un écran.

Captures conservées sous v09-accueil-320.jpg / -390.jpg, v09-zones-320.jpg /
-390.jpg, v09-profondeurs-390.jpg et v09-atelier-320.jpg / -390.jpg.
Le rapport navigateur est dans tests/v09-browser-report.json. Tous les anciens
rapports, captures, tests et sauvegardes restent conservés.

Limites visuelles assumées : les personnages et lieux restent des illustrations
vectorielles de prototype, les cinq paliers partagent une construction de grotte
commune et le combat garde son habillage précédent. Le portrait de Ravens garde
son style existant. Cette étape améliore les menus, sans prétendre constituer
la direction artistique finale. Validation responsive en navigateur ; aucun
benchmark sur téléphone physique. Aucune V0.10, aucun commit/push.
