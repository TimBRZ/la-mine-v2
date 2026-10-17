# V0.38B.2 — Mitraillette : flash, traceur et impact

17 octobre 2026. Intégration visuelle terminée, validation Android physique restante. Aucun commit/push. Aucune autre famille VFX commencée.

## Choix humains et production

Référence : « Planche VFX mitraillette validée.png », conservée intégralement dans `production-v038b2-smg/assets/reference.png`. Seuls Flash A — Étoile courte, Traceur A — Ligne simple et Impact ennemi A — Étincelle compacte sont produits. Interprétation la plus sobre des variantes A : aplats jaune/orange, centre clair, contour sombre, aucune fumée, aucun halo diffus, aucun débris supplémentaire.

Masters vectoriels et sheets générés par `production-v038b2-smg/build-assets.mjs`. Les SVG de production sont des copies exactes des sheets de cette galerie, vérifiées par tests. Le flash décroît en trois poses ; l'impact s'ouvre puis se retire ; le traceur reste une seule ligne. Les dimensions ci-dessous désignent le cadre complet, les formes sont plus fines que leur cadre.

| Effet | Production sous `src/assets/smg-v038b2/` | Sheet / cellule | Frames | Durée visuelle | Taille monde | Pivot normalisé |
|---|---|---|---:|---|---|---|
| Flash A | `flash-v1.svg` | 96×32 / 32×32 | 3 | 50 ms | 19×16 | 0 ; 0,5 |
| Traceur A | `tracer-v1.svg` | 32×16 / 32×16 | 1 | Vie du projectile réel | 16×5 | 0,5 ; 0,5 |
| Impact A | `impact-v1.svg` | 96×32 / 32×32 | 3 | 75 ms | 16×16 | 0,5 ; 0,5 |

Le trait fin n'est ni un beam ni du hitscan. Il suit position, rotation et distance parcourue de chaque projectile actif ; il survit donc au premier contact avec le perk de perforation. L'échelle de perforation déjà existante (×1,15 en largeur) reste appliquée, sans nouvelle couleur ni aura.

## Gameplay audité, inchangé

Valeurs réelles : 5 dégâts de base, un projectile, spread nul, intervalle 0,12 s, vitesse 850 unités/s, portée 280, aucun falloff. Le perk Chargeur accélère de 30 % les deux premières secondes à l'arrêt ; Détente multiplie le délai par 0,75 par rang ; Surchauffe modifie les dégâts comme auparavant. Avec Chargeur et deux rangs de Détente, l'intervalle théorique minimum est environ 51,9 ms. Le flash de 50 ms reste bref à cette cadence, sans conditionner le prochain tir.

Le Focus concerne les boss : +3 % par touche primaire jusqu'à 25 %, réinitialisation selon les règles existantes de cible et de déplacement. Il n'accélère pas la cadence. Aucun feedback visuel spécifique Focus n'est ajouté.

Balles perforantes : deux cibles, 100 % puis 60 % des dégâts ; la touche secondaire ne construit pas le Focus de la cible primaire. Chaque contact conserve son événement et ses dégâts indépendants.

`Weapon.flash` garde sa valeur historique de 35 ms. La visibilité SMG utilise seulement `shotAge` côté rendu pour afficher ses trois poses pendant 50 ms. Aucune écriture du cooldown, aucun appel de gameplay depuis l'animation. Le calcul de grip, recul, miroir et bouche V0.33 est réutilisé tel quel, dans les huit directions. Origine gameplay des projectiles inchangée.

Les hash SHA-256 de tous les fichiers `src` préexistants sont enregistrés dans `notes/before-hashes.json`. Seuls `room-scene.js` et `effects.js` changent. Les quatre nouveaux fichiers sont `smg-vfx.js` et les trois SVG. `weapon.js`, `weapons.js`, `combat.js`, Focus, perks, ciblage, hitboxes, dégâts et tous les assets du Fusil/Grisou X restent identiques octet pour octet.

## Impacts, budget et pooling

Les événements `hit` et `kill` réels déclenchent l'étincelle compacte. Aucun événement de décor, expiration ou tir à vide ne crée un impact. La présentation utilise le point d'entrée visuel existant autour de la cible ; collision et événement ne sont pas déplacés.

Un seul clip SMG par cible pendant ses 75 ms ; six clips SMG simultanés au maximum. Ce filtre est uniquement visuel, jamais sur les dégâts. Le pool de 48 sprites Effects et les 84 sprites de projectiles restent fixes. Le flash utilise son unique sprite existant. Les particules génériques de départ/contact SMG sont retirées du rendu afin de ne pas cumuler une traînée/étincelle longue avec le nouveau clip court. Les feedbacks de mort et les effets de perks existants restent en place.

Profondeur des VFX conservée à 7 : télégraphes, projectiles hostiles et silhouettes restent prioritaires. Aucun effet critique n'est ajouté ; les noms techniques historiques de simulation restent intacts pour compatibilité.

## Repli et cache

Nouvelles clés `smg-v038b2-flash`, `smg-v038b2-tracer`, `smg-v038b2-impact`, nouvelles URLs dédiées. Sélection : sheet moderne si dimensions et frame valides → rendu SMG historique correspondant (`muzzle-smg`, `projectile-smg`, `impact-ballistic`) → secours procédural existant si les deux niveaux manquent. L'impact historique partagé est celui déjà employé par la Mitraillette ; jamais de sélection des nouveaux assets du Fusil.

Absence de texture, dimensions incorrectes, frame manquante et double absence testées automatiquement. Les boutons de diagnostic du banc permettent de retirer les textures ou frames modernes et de constater le repli dans le navigateur. Un rechargement rétablit les clés modernes.

Le serveur du jeu et le serveur de validation renvoient `Cache-Control: no-store` : pas de cache HTTP persistant attendu. Les essais portent sur rechargement normal, retour après textures déjà chargées et nouvelle instance du jeu dans un autre onglet. Ils ne prétendent pas reproduire tous les caches/service workers d'un téléphone externe. Les URLs distinctes évitent une collision avec un ancien VFX.

## Tests

**1 284 / 1 284 tests réussis**, zéro échec, zéro ignoré. Les 1 266 tests existants sont conservés ; 18 tests ajoutés. Log complet : `production-v038b2-smg/notes/tests.txt` (52,46 s). Le premier lancement en bac à sable a rencontré EACCES sur les serveurs loopback des tests ; la suite complète a ensuite été relancée avec l'autorisation d'exécution locale appropriée et passe intégralement.

Les nouveaux tests vérifient assets, frames, timings, huit orientations avec recul, contacts réels, plafonds, expiration/nettoyage et stabilité du pool sur 3 600 ticks. Quatre simulations déterministes comparent rendu ancien/nouveau : base, Focus boss, perforation, cadence maximale avec chaleur/perforation. Elles comparent chaque tick, tir, événement, PV, instant de kill, cibles et Focus ; résultats strictement identiques. La perforation est aussi vérifiée explicitement après le premier contact, puis avec les dégâts 5 / 3 sur deux cibles.

Les listes de nouveaux fichiers autorisés de trois tests historiques ont été étendues aux quatre nouveaux fichiers (`v033-authorized-files.js`, `enemy-facing.test.js`, `shotgun-vfx-v038b1.test.js`). Aucun test ni snapshot supprimé. Le nouveau garde-fou immédiat verrouille tous les autres fichiers de production.

## Contrôles en navigateur et mesures

67 scènes parcourues en **320×568** et **390×844** : huit orientations, cible isolée/éloignée, groupes, Focus faible/maximal, perforation, boss et triples, dont les zones 1/4/6. Ces scènes durent jusqu'à six secondes ou jusqu'à leur fin de combat ; il ne s'agit pas de runs complets de vingt vagues. Les scènes de charge utilisent des PV de fixture élevés, exclusivement dans le banc hors production, pour tenir dix secondes continues.

Pic sur les deux matrices : **5 projectiles joueur actifs, 1 flash, 3 impacts SMG, 11 effets au total**. Le plafond de six impacts est atteint dans les tests synthétiques. Pool stable, zéro sprite VFX supplémentaire créé pendant les contrôles. Focus maximal observé : 25 %.

| Charge, 10 secondes | Boucles Phaser/s | CPU update P95 | Intervalle max | Effets / impacts / projectiles |
|---|---:|---:|---:|---:|
| Zone 1, 390×844 | 70,1 | 0,70 ms | 17,10 ms | 7 / 3 / 2 |
| Zone 4, 320×568 | 69,4 | 3,60 ms | 27,11 ms | 7 / 2 / 1 |
| Zone 6, 390×844 | 69,7 | 3,70 ms | 14,95 ms | 7 / 2 / 3 |

Ces fréquences mesurent les callbacks Phaser du navigateur PC, pas les images effectivement présentées à l'écran et pas les FPS Android. La simulation du banc avance à 60 pas/s. Pas de long blocage visible sur ces échantillons. La galerie précédente du Fusil avait un environnement de fréquence différent : ne pas comparer directement leurs valeurs de boucles/s.

Le tas JS global passe respectivement de 51,29 à 51,89 Mo, de 49,51 à 53,17 Mo et de 61,77 à 52,62 Mo, GC et instrumentation inclus. Ce delta n'est pas un profil d'allocations exhaustif ni une preuve d'absence de fuite globale. Vérifications solides : identité stable du pool, clips libérés, aucun nouveau sprite par tir, aucun timer par effet. Mesures brutes dans `notes/perf-*.json` et matrices dans `notes/scenarios-*.json`.

Poids des trois SVG production : **2 927 octets (2,86 Kio)**. Textures RGBA8 supplémentaires : **26 624 octets (26 Kio)**, hors overhead moteur/GPU. Détail : flash 1 305 octets / 12 Kio ; traceur 287 octets / 2 Kio ; impact 1 335 octets / 12 Kio. Atlas existants conservés pour les autres armes et le repli. Masters, planche et captures de validation ne sont pas chargés en jeu.

## Livrables et Android

- `production-v038b2-smg/gallery.html` : référence, masters, sheets, ancien/nouveau, comparaison Fusil, ralenti, captures.
- `production-v038b2-smg/observe.html` : banc interactif, cadence réelle, Focus, perforation, dense, boss, repli et mesures.
- `production-v038b2-smg/captures/` : contrôles mobiles et huit directions.
- `production-v038b2-smg/notes/` : tests, hashes, matrices, performance et contrôles navigateur.

Serveur de consultation : `node production-v038b2-smg/server.mjs`, uniquement `http://127.0.0.1:5216`. Sur téléphone, utiliser l'adresse réseau du serveur de jeu habituel.

Restent à valider sur Android physique : nouveau flash/traceur/impact après rechargement, huit orientations, trait visible sans former de rayon en cadence maximale, perforation, priorité des dangers en zones 4/6, fluidité sur session prolongée et comportement après interruption/reprise de Chrome. Aucun téléphone physique testé ici.

Arrêt après cette livraison. Aucun chantier Grisou X ouvert.
