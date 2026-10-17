# La Mine V2 — V0.35B — Zone 4

14 octobre 2026. Six masters validés repris dans des sheets puis intégrés **dans l’ordre A → F**, avec contrôle à chaque lot. Aucun changement de combat, de difficulté, de hitbox, de progression, de sauvegarde ou d’UI. Aucun commit/push. Les concepts et tous les anciens assets restent disponibles.

[Galerie animée](production-v035b/gallery.html) · [Rapport vérifiable](production-v035b/validation.json) · [Tests finaux](production-v035b/tests-final.txt) · [Six runs navigateur](production-v035b/browser-runs.json).

## Sources et budget

| Lot / nom canonique | Master repris | Cellule | Sheet | Frames / clips | Disque | RGBA |
|---|---|---:|---:|---:|---:|---:|
| A — Rampant (`crawler`) | R4 B1, **outil corrigé** | 64² | 384×128 | 11 / 4 | 14,7 Kio | 0,188 Mio |
| B — Cracheur (`spitter`) | R6, cuve / buse courte | 64² | 384×256 | 19 / 7 | 13,9 Kio | 0,375 Mio |
| C — Éclateur (`burster`) | C0 corrigé fidèle à l’image | 64² | 384×256 | 19 / 7 | 49,9 Kio | 0,375 Mio |
| D — **LE FENDEUR** (`splitter`) | Fendeuse B validée | 88² | 528×440 | 28 / 11 | 81,4 Kio | 0,886 Mio |
| E — Souffleur (`blower`) | A validée, six pales | 88² | 528×440 | 28 / 11 | 86,8 Kio | 0,886 Mio |
| F — Cœur de Grisou (`core`) | A nettoyée, noyau confiné | 88² | 528×440 | 28 / 11 | 90,3 Kio | 0,886 Mio |

**133 frames, 51 clips, 345 086 octets SVG (~337 Kio), 3 770 880 octets RGBA (~3,60 Mio).** Environ 87 % de moins que les 27,75 Mio de V034B. Estimation sans mipmaps, sans surcoût du pilote GPU ni buffers temporaires de décodage ; ce n’est pas une mesure de RAM Android.

Une texture par entité, partagée par ses instances et ses morts visuelles. Pas de texture par frame ni de nouveau système de particules. Le loader actuel précharge les six petites sheets avec le reste du jeu : aucune allocation ou requête au changement de vague / triple. Les anciennes textures V034B restent chargées comme avant. Le chargement/déchargement par zone n’a pas été ajouté, pour ne pas élargir ce chantier au cycle de vie global du loader.

## Fabrication et fidélité

`production-v035b/generate.mjs F` régénère les six sheets. Les chemins des masters, leur palette, les groupes hérités et leur ordre de dessin sont recopiés. Seules les transformations des pièces varient. Aucun redraw ni bitmap génératif. La première frame idle reprend la pose du master.

Six colonnes, lecture gauche → droite puis haut → bas. Cellules transparentes identiques, origine **0,5 / 0,5**, cadre monde **48² pour les mobs, 84² pour les boss**. Les noms et ids de gameplay restent canoniques, notamment `splitter` / LE FENDEUR malgré le nom « Fendeuse » du master.

Contrôle des 133 cellules rasterisées dans Chromium : aucune cellule vide, aucun pixel opaque sur le bord externe après réduction de la poussée visuelle de l’Éclateur de 15 à 10 unités du dessin. [Mesures des marges](production-v035b/sheet-bounds.json).

## Animation et synchronisation

| Entité | Pièces animées / lecture |
|---|---|
| Rampant | Tambour en rotation projetée, repères internes des chenilles, petite réponse de chambre. **Aucun PREPARE/ATTACK inventé** : c’est une poursuite au contact. |
| Cracheur | Soupape et fenêtre sous pression ; recul bref de la buse. La poche de gaz distante demeure le danger réel, sans balle ni trajet visuel ajouté. |
| Éclateur | Vérin/coin en tension puis poussée ; mors en léger appui parallèle, sans ouverture de pince. Rupture/mort distinctes des projectiles différés existants. |
| Fendeur | Bloc roue complet, dents solidaires ; carter, moyeu et châssis stables. Activité plus forte en charge, ralentissement visuel en récupération. |
| Souffleur | Six pales en rotation dans leur plan elliptique, manomètre en préparation ; bonbonne et cerclage stables. Variantes liées à `pockets` et `cone`, radial par défaut. |
| Cœur | Compression/pulse du noyau à l’intérieur de l’enceinte, petit mouvement de galets. Variantes `rain` / `orb` ; **les deux émissions de `double` sont représentées**, y compris la sortie de `burst`. |

Cadences : idle 3 FPS, move 9 FPS, attaque 12 FPS (variantes 10), recovery 7, hit 18, death 10. PREPARE n’a pas de cadence fixe : sa progression suit la durée réelle de `warning`. Si l’admission d’un tir est retardée, le visuel reste en préparation. Le relâchement visuel dure 0,25 s après la transition réelle ; il ne repousse jamais un projectile ou une récupération. La charge suit son état réel.

L’adaptateur `src/rift-animation.js` ne connaît aucun callback d’attaque et ne lance aucun timer de simulation. Il lit position, phase, temps restant, pattern et flash. Aucun changement dans `src/rift/`, `run.js`, les armes ou les projectiles. Les tests rejouent les combats avec des ticks visuels sautés et en réduction de mouvements.

Hit : tint existant et pose brève, pas de stun. Mort : affaissement mécanique contenu, 4 frames mob / 5 boss ; la vue est détachée de la simulation, jamais les dégâts/drops. Plafond existant de 12 morts visuelles, destruction au terme de l’animation et nettoyage entre vagues. Aucune explosion décorative ajoutée. Les corps restent sous les télégraphes, et les projectiles hostiles gardent leur couche prioritaire.

Pas de nouvelle phase sous 50 % pour le Cœur : ses patterns existants accélérés portent déjà cette intensité. Aucun faux danger visuel ajouté.

## Orientation et collision

Le renderer Zone 4 précédent était **fixe**, sans miroir ni rotation, pour les six ids. Ce mode est conservé et testé avec huit caps : les machines ne basculent pas en visant verticalement. Les télégraphes existants portent la direction de charge/tir. Il ne s’agit pas de nouvelles vues directionnelles.

Rayons inchangés : Rampant 14, Cracheur 18, Éclateur 19 ; Fendeur 28, Souffleur 29, Cœur 30. Cadres et conteneurs ne changent jamais de centre. Les outils et flancs dépassent parfois le disque : jusqu’à environ 10 unités par côté pour un mob dans un cadre 48², 14 pour un boss 84². Ce dépassement est **graphique seulement** : aucune portée de contact supplémentaire. Les réductions de mort sont internes à la cellule.

## Fallback et périmètre

Source absente, mauvaises dimensions ou frame invalide : retour au visuel procédural précédent, avec origine, taille et orientation restaurées. Le manque des six sheets a été provoqué via 404 sur le serveur QA ; les six anciennes textures apparaissent correctement. Ces 404 génèrent les diagnostics attendus du loader dans ce scénario volontaire. [Rapport fallback](production-v035b/browser-fallback-missing.json).

Les pages normales n’ont aucune erreur console. Les 192 fichiers source préexistants sont identiques, à l’exception de **deux imports de renderer** dans `room-scene.js` et `enemies/view.js`. Le code historique V034B est délégué tel quel. Les six masters sont intacts : [preuve](production-v035b/scope-validation.json).

Les tests existants sont conservés. Deux adaptations étroites de garde-fous : ajout des fichiers visuels V035B à la liste autorisée V033 ; normalisation des deux imports autorisés dans le contrôle d’empreintes du patch Crachefer. Toutes ses autres comparaisons restent actives. Une nouvelle vérification d’empreintes contre le snapshot immédiat V035B couvre tout l’ancien `src`.

**923/923 tests réussis**, zéro échec, zéro ignoré, 64,56 s : les 884 existants + 39 nouveaux. Validation commune des mobs : 905/905 ; contrôles ciblés D : 54/54, E : 59/59 ; puis suite complète des six lots. Le service HTTP réel vérifie aussi les six SVG et les deux modules avec un User-Agent Android. Les premiers essais réseau en bac à sable ont été bloqués par EACCES ; les validations complètes autorisées hors bac à sable passent.

## Runs et limites des mesures

Six runs complètes dans Chromium avec le vrai `RoomScene`, pilote de test existant, seed 1, Atelier rang 2 et aucun talent. Pas d’invincibilité ni de dégâts ajoutés dans ces runs. Contrats/récompenses de compte et leaderboard neutralisés **uniquement dans le banc QA sur une origine séparée**. Les récompenses internes de run sont comparées normalement.

| Arme | Ancien / nouveau | Durée simulée identique | PV finaux | Kills |
|---|---|---:|---:|---:|
| Fusil à pompe | Victoire / victoire | 910,02 s | 5 | 278 |
| Mitraillette | Victoire / victoire | 975,02 s | 2,5 | 278 |
| Grisou X | Victoire / victoire | 765,93 s | 2,5 | 278 |

Identité stricte des résultats, durée, perks, récompenses, patterns rencontrés et plafonds. Maximum observé : **18 projectiles, 4 zones au sol, 2 attaques majeures**, 12 ennemis. Ces runs sont accélérées par lots de ticks : leur FPS affiché ne mesure pas la fluidité d’une partie normale. Le CPU P95 d’un tick rendu observé se situe environ entre 1,4 et 3,8 ms sur ce PC, avec d’autres validations en parallèle ; ce n’est pas une mesure Android.

Le test d’endurance du triple, avant et sous 50 % de vie, compare chaque état d’ennemi, projectile, burst et zone au snapshot précédent. Il utilise une cible invulnérable **uniquement pour cette fixture**, afin de couvrir les cycles ; elle n’est pas comptée parmi les runs gagnées.

Une séquence supplémentaire du triple à **vitesse réelle**, pilotée avec le delta du navigateur, se termine par une victoire en 98,86 s, avec 5,5 PV et les neuf patterns rencontrés. Sur ce PC : CPU P95 1,0 ms, maximum CPU 3,9 ms ; dans la fenêtre glissante finale de 3 000 frames, intervalle P95 6,4 ms et maximum 7 ms. Deux boss engagés pendant 56,16 s, trois pendant 9,38 s ; maxima 22 projectiles, 4 zones et 2 attaques majeures. Ces mesures Chromium sur PC ne préjugent pas des performances Android. Les requêtes des six sheets prennent 10,2–12,8 ms sur loopback, hors décodage SVG et transfert GPU. [Profil complet](production-v035b/realtime-triple.json).

## Galerie et Android

La galerie rassemble masters, sheets transparentes, clips sélectionnables, cadres monde, captures ancien/nouveau par entité, mobs et triple en 320×568 / 390×844. Les captures réunies sont des rencontres placées dans le banc QA, utilisant les comportements réels ; les six runs séparées vérifient le parcours complet.

Les captures **du jeu** aux deux dimensions sont vérifiées. La galerie elle-même est contrôlée à 390×844 : 28 images chargées, aucune erreur console. L’outil de viewport n’a pas appliqué sa seconde demande de 320×568 à cet onglet ; cette vérification supplémentaire de la galerie n’est donc pas revendiquée.

Ouvrir `production-v035b/gallery.html` localement, ou démarrer `node production-v035b/server.mjs` puis ouvrir `http://127.0.0.1:5191/production-v035b/gallery.html`. Le port 5191 reste un serveur QA loopback, distinct du jeu normal.

Pour le téléphone : lancer comme d’habitude `npm.cmd start -- --host=0.0.0.0`, ouvrir l’IP affichée au port 5177 puis recharger. Le serveur de production sert les sheets SVG avec le bon MIME ; un test dédié les demande avec un User-Agent Android. La galerie QA n’est pas exposée par ce serveur normal.

À vérifier humainement sur Android physique : démarrage à froid, trois mobs, trois boss solo, triple final avec plusieurs patterns, netteté des outils et du noyau, absence de saccades perceptibles, chauffe et stabilité après plusieurs runs. Les dimensions mobiles Chromium ne simulent pas le GPU, la RAM ou la température du téléphone.

**Arrêt après V0.35B. Aucun concept Zone 5, aucune suite automatique.**
