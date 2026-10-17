# La Mine V2 — V0.36C — Zone 5 animée

Livraison du 14 octobre 2026. Les six masters approuvés deviennent les visuels de production des trois mobs et des trois boss. Gameplay V0.36B conservé. Aucun commit/push, aucune intervention CGWeb, aucune modification Zone 6.

## Livrables

- [Galerie animée](production-v036c/gallery.html) : masters, toutes les animations sélectionnables, 40/56/84 px, sheets complètes, captures combat.
- [Métadonnées des sheets](production-v036c/catalog.json), [contrôle des sources et budgets](production-v036c/validation.json), [contrôle raster des 412 frames](production-v036c/sheet-bounds.json).
- [Six runs navigateur](production-v036c/browser-runs.json), [mesure temps réel](production-v036c/realtime-performance.json), [tests complets](production-v036c/final-tests.txt).
- Serveur de revue isolé : `node production-v036c/server.mjs`, puis http://127.0.0.1:5202/production-v036c/gallery.html. Ce serveur de revue écoute uniquement en boucle locale. Le jeu normal conserve son serveur habituel.

## Masters, cellules et budget

| Entité | Frames | Cellule | Atlas | SVG disque | Texture RGBA |
|---|---:|---:|---:|---:|---:|
| Lampiste | 34 | 64² | 512 × 320 | 111.3 Kio | 0.63 Mio |
| Boutefeu | 39 | 64² | 512 × 320 | 139.1 Kio | 0.63 Mio |
| Gueule-Noire | 36 | 64² | 512 × 320 | 146.8 Kio | 0.63 Mio |
| Lampiste-Major | 88 | 96² | 768 × 1056 | 507.2 Kio | 3.09 Mio |
| Dynamiteur | 83 | 96² | 768 × 1056 | 384.2 Kio | 3.09 Mio |
| Masse Noire | 132 | 96² | 768 × 1632 | 407.2 Kio | 4.78 Mio |

Total : **412 frames**, **1.66 Mio SVG**. Les modules contenant les SVG pèsent **1.79 Mio avant compression HTTP** ; le runtime télécharge ces modules, pas une seconde copie des SVG externes. Estimation des six textures : **12.84 Mio RGBA**, plus **0.152 Mio** pour les six poses de secours. Hors allocation GPU/Phaser et autres textures du jeu.

Sources conservées byte pour byte :
- Lampiste : [master](v036a-lampiste-final/master/lampiste.svg) — SHA-256 4a56cd6a4fb7f7e262a7312283984dbdfffeb227d42959cd8caf89ccbf3d0266.
- Boutefeu : [master](v036a-boutefeu-final/master/boutefeu.svg) — SHA-256 6f828caebfdac9e017488f0894b3d2b4189266dde61f21a3746b6866279c2584.
- Gueule-Noire : [master](v036a-gueule-noire-final/master/gueule-noire.svg) — SHA-256 da33ec222b9467cc800f0d499e776a6df2069ef0e59c334069727a192e43176a.
- Lampiste-Major : [master](v036a-lampiste-major-final/master/lampiste-major.svg) — SHA-256 1c242fe1834fde36a6eacf60c1879438d4eb037e27ba3f80d599034ac3585db4.
- Dynamiteur : [master](v036a-dynamiteur-final/master/dynamiteur.svg) — SHA-256 f1c1a406dae8377f3cdef44d71940f070d78d8fe96257bde8f1b9afac1fc2028.
- Masse Noire : [master](v036a-masse-noire-final/master/masse-noire.svg) — SHA-256 8da92181b68a8ecc880ef43f353bc467511063664c895464b7cc29e086a33568.

## Construction et animations

Les tracés, aplats, ordre des formes et palette des masters sont réutilisés par un générateur SVG déterministe. Aucun redessin, aucune génération raster interprétative. Les blocs mobiles utilisent des pivots locaux : pieds, épaules, bras/outils, équipement dorsal. Les mains accompagnent le projecteur ou le marteau. Le cadre et l'origine centrée restent constants ; le corps n'est pas tourné en entier pour simuler le balayage.

Les cellules 64 px des mobs et 96 px des boss sont rasterisées une fois par Phaser. Le jeu utilise leurs dimensions d'affichage habituelles : aucune hitbox n'est déduite du dessin. La galerie agrandit volontairement certains aperçus raster ; juger la netteté aux tailles réelles 40/56/84 px. Les huit angles de déplacement sont couverts par une orientation gauche/droite stable, pas par huit redessins directionnels.

### Lampiste

- **idle** : 4 frame(s), 5 i/s nominales, boucle.
- **move** : 8 frame(s), 10 i/s nominales, boucle.
- **prepare** : 5 frame(s), 0 i/s nominales, lecture unique.
- **attack** : 4 frame(s), 14 i/s nominales, lecture unique.
- **recovery** : 4 frame(s), 10 i/s nominales, lecture unique.
- **hit** : 2 frame(s), 16 i/s nominales, lecture unique.
- **death** : 7 frame(s), 12 i/s nominales, lecture unique.

### Boutefeu

- **idle** : 4 frame(s), 5 i/s nominales, boucle.
- **move** : 8 frame(s), 10 i/s nominales, boucle.
- **prepare** : 6 frame(s), 0 i/s nominales, lecture unique.
- **attack** : 4 frame(s), 14 i/s nominales, lecture unique.
- **recovery** : 4 frame(s), 10 i/s nominales, lecture unique.
- **hit** : 2 frame(s), 16 i/s nominales, lecture unique.
- **death** : 7 frame(s), 12 i/s nominales, lecture unique.
- **detonate** : 4 frame(s), 12 i/s nominales, lecture unique.

### Gueule-Noire

- **idle** : 4 frame(s), 5 i/s nominales, boucle.
- **move** : 10 frame(s), 16 i/s nominales, boucle.
- **prepare** : 5 frame(s), 0 i/s nominales, lecture unique.
- **attack** : 4 frame(s), 14 i/s nominales, lecture unique.
- **recovery** : 4 frame(s), 10 i/s nominales, lecture unique.
- **hit** : 2 frame(s), 16 i/s nominales, lecture unique.
- **death** : 7 frame(s), 12 i/s nominales, lecture unique.

### Lampiste-Major

- **idle** : 5 frame(s), 5 i/s nominales, boucle.
- **move** : 8 frame(s), 10 i/s nominales, boucle.
- **prepare** : 7 frame(s), 0 i/s nominales, lecture unique.
- **attack** : 5 frame(s), 14 i/s nominales, lecture unique.
- **recovery** : 6 frame(s), 10 i/s nominales, lecture unique.
- **hit** : 2 frame(s), 16 i/s nominales, lecture unique.
- **death** : 10 frame(s), 12 i/s nominales, lecture unique.
- **sweep_prepare** : 7 frame(s), 0 i/s nominales, lecture unique.
- **sweep** : 10 frame(s), 10 i/s nominales, lecture unique.
- **extinction** : 5 frame(s), 0 i/s nominales, lecture unique.
- **aim** : 5 frame(s), 0 i/s nominales, lecture unique.
- **lock** : 1 frame(s), 0 i/s nominales, lecture unique.
- **fire** : 4 frame(s), 12 i/s nominales, lecture unique.
- **command** : 6 frame(s), 0 i/s nominales, lecture unique.
- **ultimate_recovery** : 7 frame(s), 8 i/s nominales, lecture unique.

### Dynamiteur

- **idle** : 5 frame(s), 5 i/s nominales, boucle.
- **move** : 8 frame(s), 10 i/s nominales, boucle.
- **prepare** : 7 frame(s), 0 i/s nominales, lecture unique.
- **attack** : 5 frame(s), 14 i/s nominales, lecture unique.
- **recovery** : 6 frame(s), 10 i/s nominales, lecture unique.
- **hit** : 2 frame(s), 16 i/s nominales, lecture unique.
- **death** : 10 frame(s), 12 i/s nominales, lecture unique.
- **throw_prepare** : 8 frame(s), 0 i/s nominales, lecture unique.
- **throw** : 6 frame(s), 15 i/s nominales, lecture unique.
- **detonate** : 5 frame(s), 12 i/s nominales, lecture unique.
- **chain_prepare** : 6 frame(s), 0 i/s nominales, lecture unique.
- **arm** : 8 frame(s), 0 i/s nominales, lecture unique.
- **reload** : 7 frame(s), 8 i/s nominales, lecture unique.

### Masse Noire

- **idle** : 5 frame(s), 5 i/s nominales, boucle.
- **move** : 10 frame(s), 10 i/s nominales, boucle.
- **prepare** : 7 frame(s), 0 i/s nominales, lecture unique.
- **attack** : 5 frame(s), 14 i/s nominales, lecture unique.
- **recovery** : 6 frame(s), 10 i/s nominales, lecture unique.
- **hit** : 2 frame(s), 16 i/s nominales, lecture unique.
- **death** : 10 frame(s), 12 i/s nominales, lecture unique.
- **charge_prepare** : 7 frame(s), 0 i/s nominales, lecture unique.
- **charge** : 5 frame(s), 14 i/s nominales, boucle.
- **impact** : 5 frame(s), 16 i/s nominales, lecture unique.
- **stun** : 7 frame(s), 8 i/s nominales, lecture unique.
- **slam_prepare** : 10 frame(s), 0 i/s nominales, lecture unique.
- **center_prepare** : 10 frame(s), 0 i/s nominales, lecture unique.
- **slam** : 4 frame(s), 16 i/s nominales, lecture unique.
- **hold** : 1 frame(s), 7 i/s nominales, lecture unique.
- **left_prepare** : 6 frame(s), 0 i/s nominales, lecture unique.
- **left** : 4 frame(s), 15 i/s nominales, lecture unique.
- **right_prepare** : 6 frame(s), 0 i/s nominales, lecture unique.
- **right** : 4 frame(s), 15 i/s nominales, lecture unique.
- **ultimate_prepare** : 10 frame(s), 0 i/s nominales, lecture unique.
- **ultimate_recovery** : 8 frame(s), 8 i/s nominales, lecture unique.

Les poses lock/hold d'une frame sont des arrêts intentionnels, sans duplication de frames identiques. Les cadences ci-dessus servent aux boucles et à la galerie ; les phases d'attaque en jeu sont normalisées sur la durée réelle du gameplay.

## Correspondance au gameplay

- Lampiste : déplacement, avertissement, émission réelle puis bref recul, récupération. Projecteur conservé comme outil d'éclairage.
- Boutefeu : la pose de charge gameplay est instantanée dans le code validé. Sa gestuelle occupe les 0,3 premières secondes de récupération, puis il se retire. Le T du détonateur est actionné lorsqu'une charge appartenant réellement à cet ennemi devient active. Pas d'explosion des charges dorsales.
- Gueule-Noire : compression pendant warning, extension pendant charge/bond, puis réception. La fenêtre réelle de bond reste 0,52 s.
- Lampiste-Major : sweep_prepare/sweep pour Balayage ; extinction/move pour Extinction ; aim/lock/fire pour Mise en joue ; command et réutilisation des phases pour BLACKOUT, puis recovery ultime.
- Dynamiteur : préparation et appuis rythmés pour Plan de tir ; chain_prepare pour Mèche en chaîne ; throw_prepare/throw pour Charge projetée ; arm/detonate/reload pour Démolition contrôlée.
- Masse Noire : charge_prepare/charge puis impact et stun ; véritable levée pour slam ; left → right → center_prepare → slam pour Triple frappe, avec remontée depuis la pose précédente ; ultimate_prepare, slam, hold et ultimate_recovery pour Écrasement du puits.
- Les trois combos réutilisent ces états, y compris sous 50 % de PV. Le directeur V0.36B conserve entièrement les plafonds, dégâts, zones sûres, verrouillages et déclenchements.

L'adaptateur lit les acteurs et ne les écrit jamais. Aucun callback de frame/onComplete ne déclenche projectile, collision, hazard ou récompense. Les frames perdues/interrompues n'affectent pas le combat. Aucun nouveau son. Les VFX d'impact, obscurité, projectiles et avertissements existants sont conservés ; aucun VFX décoratif supplémentaire ne masque l'arène. L'assombrissement facultatif de la Masse Noire n'a pas été appliqué afin de conserver sa palette approuvée.

## Chargement, identité et cache

Les six gros atlases ne sont importés qu'à l'entrée de Zone 5. Les petites poses statiques approuvées sont disponibles dès le préchargement. Une sortie vers une autre zone détruit d'abord les vues/cadavres puis libère nos atlases. Un jeton d'époque annule une importation/fin de chargement tardive après cette sortie.

Les modules JavaScript déjà importés restent dans le cache de modules du navigateur : libérer la texture GPU ne libère pas nécessairement leur texte en RAM. Les autres zones gardent leur stratégie de préchargement existante ; leur déchargement global demanderait un refactor hors périmètre.

Chaque URL et clé contient un hash propre au contenu. Identité, clé, longueur et empreinte du SVG sont contrôlées avant décodage ; la texture est ensuite reconnue par l'objet image exact et ses dimensions. Le SHA-256 intégral est vérifié dans les tests/génération. Le sélecteur prend l'identité réelle de l'acteur comme autorité.

Ordre de secours : nouvelle sheet vérifiée → frame neutre reconstruite si métadonnée de frame absente → pose statique approuvée de la même entité. Aucun ancien skin ni texture étrangère n'est accepté. Si même le master de secours n'est pas disponible/vérifié, le corps est masqué plutôt que d'afficher un autre personnage ; ce cas anormal est identifié par missing_verified_master. Le décorateur n'invente jamais une identité.

Les anciens assets et les itérations de génération sont conservés. Seuls les noms du catalogue final sont sélectionnés. Les cadavres réutilisent le plafond existant de 12 vues et sont détruits après leur animation, y compris avec le fallback.

## Vérifications

- Baseline annoncée : **1 027 tests**. Résultat final : **1059 tests réussis**, aucun test existant supprimé ou ignoré. Les ajouts vérifient identité/fallback, état en lecture seule, animations boss/ultimes/combos, phase sous 50 %, chargement différé, sortie en cours de chargement, nettoyage et replay identique.
- Lots successifs A/B/C puis D/E/F, avec contrôles navigateur et tests à chaque étape. Rapports lot-*-browser.json et lot-*-tests.txt conservés dans production-v036c.
- Six masters inchangés. Sur le snapshot immédiat avant intégration, **209 fichiers source antérieurs sont identiques** ; seuls room-scene.js et enemies/view.js sont modifiés pour brancher la présentation.
- **412 frames** : aucune vide, aucun pixel au bord de cellule, transparence propre. Orientation gauche/droite contrôlée pour chaque entité ; rotation globale nulle.
- Contrôles navigateur **320 × 568** et **390 × 844** : mobs, boss solos, triple et combos, lisibilité des avertissements. Captures dans production-v036c/captures/.
- Rechargement à cache chaud et nouvelle page : six textures correctes chargées ([preuve](production-v036c/cache-reload.json)). Les six modules sont aussi servis par le serveur normal sur 5177 avec HTTP 200, text/javascript et no-store ([en-têtes](production-v036c/production-http.json)).
- Session QA finale et galerie : **aucune erreur ni avertissement console**, aucune image cassée, aucun débordement horizontal aux deux formats. [Journal final](production-v036c/final-console.json) ; il conserve séparément une erreur initiale du banc QA corrigée avant les runs, sans erreur dans les sessions finales.

### Runs complètes, ancien contre nouveau

Pilotage de test dans le vrai RoomScene/Run, seed 1, Atelier niveau 2, choix de perks légaux, dégâts normaux. Pas d'invulnérabilité pendant les runs. Le portefeuille et les contrats sont neutralisés uniquement dans la page QA pour ne pas écrire de progression. Le résultat QA affiche des récompenses non persistées ; le jeu normal n'est pas modifié.

| Arme | Ancien | Nouveau | Durée simulée identique | PV finaux | Éliminations |
|---|---|---|---:|---:|---:|
| shotgun | victoire | victoire | 783.03 s | 5.5 | 333 |
| smg | victoire | victoire | 1093.83 s | 1.5 | 333 |
| grisoux | victoire | victoire | 808.07 s | 2 | 333 |

Même nombre de ticks, perks et récompenses pour chaque paire ; 123 charbon et 12 fer dans ces runs déterministes. Les six runs sont accélérées pour parcourir les 20 vagues : leur champ FPS n'est pas une mesure de fluidité mobile. Les plafonds observés sont 12 vues vivantes, 3 cadavres simultanés, 2 attaques majeures, 5 zones au sol et 9 projectiles.

### Performance temps réel

Triple animé sur navigateur PC à 390 × 844, 120.8 s simulées : CPU update/dessin P95 2.60 ms, maximum 29.00 ms ; intervalle entre frames P95 14.90 ms. FPS moteur relevé : 71.0. Le test inclut le panneau de diagnostic et les télégraphes réels. Ce chiffre n'est pas un benchmark Android.

### Validation Android physique à faire

1. Lancer le serveur habituel depuis ce projet avec `npm.cmd start -- --host=0.0.0.0`, ouvrir l'IP affichée sur le même Wi-Fi et recharger la page du jeu.
2. Entrer en Zone 5 à froid puis refaire un reload ; vérifier les trois mobs, la lampe, le détonateur et le bond.
3. Tester les trois solos/ultimes, le marteau levé puis au sol, les trois combos du triple et la lecture des zones sûres.
4. Quitter Zone 5 pour une autre zone puis revenir ; vérifier absence de mauvais skin, corps invisible ou freeze de chargement.
5. Observer chaleur, mémoire et micro-freezes sur le téléphone réel. Les vues mobiles PC et les tests de cache ne remplacent pas ce contrôle matériel.

## Périmètre et arrêt

Fichiers runtime ajoutés : src/depths-animation.js, src/depths-sprite-catalog.js et src/assets/enemies-v036c/. Connexions existantes : src/room-scene.js et src/enemies/view.js. Tests ajoutés : tests/depths-animation-v036c.test.js et liste d'autorisation V036C reliée au contrôle historique. Outils/captures/snapshot exclusivement dans production-v036c/.

Aucun HP, dégât, timing gameplay, arme, hitbox, économie, progression ni master approuvé modifié. Aucune suppression d'ancien asset. Arrêt à cette livraison V0.36C ; Zone 6 non commencée. Aucun commit/push.
