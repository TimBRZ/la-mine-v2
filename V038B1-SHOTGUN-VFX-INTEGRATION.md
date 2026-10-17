# V0.38B.1 — VFX du Fusil à pompe

Livraison du 17 octobre 2026. Les trois effets validés sont intégrés au rendu de production. Le gameplay du Fusil est inchangé. Aucun effet critique ni impact décor n'est ajouté. Mitraillette, Grisou X, VFX ennemis et boss restent inchangés. Aucun commit/push.

## Assets et animation

Les trois SVG sont des copies byte pour byte des sheets approuvées dans `v038-vfx-production-prep`. Aucune nouvelle interprétation graphique, aucun remplacement des masters.

| Effet | Asset sous `src/assets/shotgun-v038b1/` | Cellules | Durée | Taille monde | Origine normalisée |
|---|---|---|---|---|---|
| Flash B large | `flash-v1.svg` | 3 × 64×64 | 65 ms | 32×26 | (0 ; 0,5), bouche du canon |
| Plomb A trait simple | `pellet-v1.svg` | 1 × 64×64 | Suit le projectile réel | 18×18 | (0,5 ; 0,5) |
| Impact ennemi B mix sparks | `impact-v1.svg` | 4 × 64×64 | 120 ms | 23×23 | (0,5 ; 0,5), position d'impact existante |

L'âge de l'effet détermine la frame : aucune nouvelle minuterie. Le flash utilise la position et la rotation de bouche existantes, sans toucher au grip ni aux pivots de l'arme. Les traits suivent chaque projectile réel, y compris les configurations de perks. La salve de base reste de sept plombs ; aucun cône dessiné en remplacement des projectiles.

## Impacts multiples et repli

Le clip d'impact n'est demandé que pour les événements de contact ennemi `hit` / `kill`. Les événements létaux restent des contacts réels, avec leur feedback de mort existant. Aucun événement de mur/décor n'est créé.

Un même identifiant de cible ne reçoit pas un second clip Fusil pendant les 120 ms du premier. Huit clips d'impact Fusil au maximum peuvent coexister, dans le pool Effects existant de 48 sprites. Le feedback générique de contact est également évité lorsque ce clip est refusé, pour ne pas contourner la limite. Cette règle ne filtre aucun événement de simulation et ne fusionne aucun dégât.

Repli : sheet Fusil versionnée → effet correspondant de l'ancien atlas valide → secours procédural existant si les deux assets sont indisponibles. Le resolver vérifie dimensions de texture et coordonnées de frame avant sélection. Les cas texture absente, dimensions incorrectes, frame manquante et double absence sont couverts. Aucune texture d'une autre entité n'est utilisée.

## Fichiers de production

- `src/shotgun-vfx.js` : spécifications, chargement, frames et sélection avec repli.
- `src/room-scene.js` : raccordement au flash, aux plombs et aux contacts du Fusil.
- `src/effects.js` : clip d'impact, regroupement par cible et plafond visuel.
- Les trois SVG listés ci-dessus.

Tous les autres fichiers `src` préexistants sont contrôlés par SHA-256 contre `production-v038b1-shotgun/notes/before-hashes.json`. Les modifications concernent seulement les deux consommateurs visuels ci-dessus et les quatre nouveaux fichiers. Armes, collisions, dégâts, spread, falloff, portée, cadence, perks, comportement des ennemis et hitboxes sont inchangés.

## Validation automatique

**1 266 / 1 266 tests réussis ; zéro échec, zéro test ignoré.** Baseline conservée : 1 252 ; ajout : 14 tests. Suite complète : 53,53 s, sortie conservée dans `notes/tests.txt`.

Les nouveaux tests couvrent copie exacte des assets approuvés, chargement/frames/durées, repli, cap et regroupement, expiration/nettoyage, stabilité des sprites sur 1 800 ticks, contacts réels uniquement, orientation, projectile réel et perks. Le garde-fou immédiat par hash couvre tous les autres fichiers de production.

Les listes d'exceptions des contrôles historiques ont été étendues strictement aux deux consommateurs visuels et aux quatre nouveaux fichiers, pour permettre cette intégration. Aucun test ni snapshot historique n'a été supprimé. Fichiers de test concernés : `shotgun-vfx-v038b1.test.js`, `v038b1-authorized-files.js`, `v033-authorized-files.js`, `v037b-authorized-files.js`, `enemy-facing.test.js`, `enemy-facing-edge.test.js`, `forge-animation-v037c.test.js`, `v037b1-activity.test.js`, `v037b2-pressure.test.js`.

## Contrôles navigateur

Galerie : `production-v038b1-shotgun/gallery.html`. Scènes interactives : `observe.html` ; lecture réelle, ralenti ×5, arrêt sur tir ou impact, progression image par image, mesure dix secondes. Le serveur de validation local facultatif se lance avec `node production-v038b1-shotgun/server.mjs` et écoute uniquement `127.0.0.1:5215`.

Les 61 scènes de la matrice ont été parcourues en 320×568 et 390×844 : huit orientations, mob isolé, groupes, boss et triples, zones 1/4/6 incluses. Scènes de six secondes maximum ou jusqu'à la fin du combat ; ce ne sont pas des runs complets de vingt vagues. Un démarrage dans le prototype complet avec Chevrotine (11 plombs) a aussi été vérifié jusqu'à la défaite normale, sans erreur console.

Captures de tir, impact, orientations et combat dense dans `captures/`. Les sept traits restent séparés après leur départ commun. Flash contenu à la bouche, impact compact, télégraphes ennemis conservés. La galerie donne aussi l'ancien/nouveau et le ralenti.

## Poids, mémoire et performance

- SVG : **6 114 octets** (5,97 Kio) au total.
- Textures supplémentaires estimées en RGBA8 : **131 072 octets / 128 Kio**, hors métadonnées et overhead moteur/GPU. L'ancien atlas partagé reste disponible (256 Kio) pour les autres armes et le repli.
- Pool Effects : **48 sprites**, inchangé ; pool visuel de projectiles : **84**, inchangé.
- Pic observé sur la matrice : **16 effets actifs** ; deux clips d'impact Fusil observés simultanément. Le plafond de huit est éprouvé dans les tests synthétiques.
- Stress avec perks : jusqu'à **30 projectiles joueur actifs** ; identité des sprites VFX stable, aucune création de sprite VFX supplémentaire pendant les mesures.

| Scène / viewport | Boucles Phaser par seconde | CPU update P95 | Intervalle maximal | Effets / impacts / plombs maximum |
|---|---:|---:|---:|---:|
| Galeries / 390×844 | 164,7 | 0,50 ms | 7,88 ms | 15 / 1 / 30 |
| Faille / 320×568 | 162,5 | 5,30 ms | 12,74 ms | 15 / 1 / 30 |
| Forge / 390×844 | 164,5 | 2,40 ms | 10,30 ms | 14 / 2 / 30 |

Mesures de dix secondes par scène dans le navigateur du PC ; les fixtures ont des PV élevés uniquement pour conserver un combat continu. La simulation avance à 60 pas/s. La valeur « boucles/s » mesure les callbacks du navigateur, **pas les images effectivement présentées par l'écran et pas les FPS Android**. Aucun long blocage visible dans ces échantillons ; ce n'est pas une garantie sur téléphone ni sur une longue session.

Le tas JS global augmente d'environ 3,0 à 4,9 Mo selon l'échantillon, avec simulation et tableaux de mesure inclus. Ce n'est pas un profil d'allocations exhaustif ni une preuve d'absence de fuite globale. Les vérifications déterministes portent sur la stabilité du pool VFX, l'absence de nouveaux sprites et la libération des clips ; aucune prétention de zéro allocation JS. Mesures brutes : `notes/perf-*.json`, matrices : `notes/scenarios-320.json` et `notes/scenarios-390.json`.

## Validation Android physique restante

Recharger l'adresse locale habituelle sur le téléphone (serveur jeu habituel, pas le serveur de galerie lié au loopback). Confirmer en zones 1/4/6 : nouveau flash, sept traits avec le Fusil de base, impacts courts, visée haute/basse/gauche, groupes et boss avec perks, absence de gêne des télégraphes et de saccades sur une session prolongée. Vérifier que les trois nouveaux SVG se chargent au premier démarrage et après rechargement/cache. Les contrôles navigateur PC aux dimensions mobiles ne remplacent pas cette validation physique.

Arrêt après V0.38B.1. Aucune autre famille VFX commencée.
