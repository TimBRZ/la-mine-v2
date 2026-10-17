# V0.38C.1B — Projectiles ennemis immédiats

Patch appliqué le 17 octobre 2026. **Validation globale non acquise : la suite historique n’est pas verte.**

## Résultat ciblé

22 scénarios de tirs mesurés : première création dans l’update où le cooldown est prêt, soit **0 ms logique supplémentaire**. Les conditions de portée, l’apparition initiale de l’ennemi et l’admission par les plafonds restent nécessaires. Le projectile commence ensuite son déplacement par le système de simulation habituel, sans timer de préparation supplémentaire.

Les constantes de dégâts, vitesse, portée, rayon, dispersion, cooldown, récupération et plafonds ne changent pas. La fréquence effective des attaques augmente par suppression de la préparation : ce n’est pas une promesse de cadence globale identique. Les tirs du joueur, assets, sheets, profils et sauvegardes ne sont pas modifiés.

## Cause et correction

Les contrôleurs terminaient leur cooldown en entrant dans `warning`, puis attendaient entre 0,85 et 1,5 s. Plusieurs transitions ajoutaient aussi un update avant `burst`. Les renderers dessinaient des lignes ou rayons correspondant au futur projectile, et les animations sélectionnaient `prepare` à partir de cette phase.

Les contrôleurs émettent maintenant les attaques purement balistiques dans la même mise à jour. La classification part de la nature des patterns (`count`, absence de zone au sol ou charge), pas du seul libellé ni du drapeau `major`. Les directeurs de séquences composites restent exclus. Un refus d’admission ne devient pas une preview : les réessais existants sont conservés et les tirs purs réessayés ne reprennent pas une préparation complète.

Le signal d’animation est enregistré après une allocation réelle dans le pool, dans une WeakMap séparée de la simulation. L’animation suit l’émission ; aucun callback d’animation ne déclenche les projectiles. Les poses `prepare`, labels de visée et géométries de preview sont masqués pour les tirs purs, y compris pendant un refus de budget.

## Zone 2, vague 15

`tracks-15` désigne **L’Aiguilleur / `switchman`**. Tous les six patterns, son attaque `burst` sélectionne `circle`, six projectiles, puis éventuellement huit en solo sous 50 % selon l’alternance existante. Le code appelle `EnemyProjectiles.fireCircle` avec la même famille mécanique que les tirs ordinaires. Le drapeau `bossMajor` est un budget de concurrence, pas une nouvelle famille visuelle.

Le resolver Rivet rejetait auparavant tous les `bossMajor`. Il accepte désormais les cercles du Crachefer et de l’Aiguilleur. Vapeur du Compresseur, énergie du Grisou, lumière du Lampiste et projectiles de la Faille gardent leur rendu spécifique. Les fallbacks procéduraux restent disponibles si le sprite Rivet est indisponible ou incomplet.

## Audit des boss des six zones

Les délais ci-dessous désignent l’attente après disponibilité, avant le premier projectile ; les durées de télégraphe des dangers composites restent inchangées.

| Zone | Boss | Projectile / pattern | Preview avant | Attente avant | Après / famille |
|---|---|---|---|---|---|
| 1 | Haveuse | Aucun tir pur : charge | Télégraphe de charge | Conservée | Inchangé |
| 1 | Crachefer | Simple, éventail ×3, cercle ×6/×8 | Lignes / rayons | 1,1 s ; cercle 1,5 s | Immédiat, Rivet B y compris cercles |
| 1 | Effondreur | Éboulements au sol | Zones au sol | Conservée | Inchangé |
| 2 | Chef de Gare | Charge, invocation de Wagon | Charge / voie | Conservée | Inchangé |
| 2 | Locomotive | Bélier et vapeur au sol | Charge / zone | Conservée | Inchangé ; pas un projectile vapeur mobile |
| 2 | Aiguilleur | Rafale simple, éventail ×3, cercle ×6/×8 | Lignes / rayons | 1,25 s ; cercle 1,5 s, transition de burst | Immédiat, Rivet B ; rails/croix inchangés |
| 3 | Cageur | Charge, impact frontal, câble | Couloirs / zones | Conservée | Inchangé |
| 3 | Compresseur | Vapeur ×3, radial ×6/×8 | Lignes / rayons | 1,3 s / 1,5 s | Immédiat, vapeur existante ; pression au sol inchangée |
| 3 | Grisou | Énergie simple | Ligne | 1,3 s | Immédiat, énergie existante ; gaz/blast inchangés |
| 4 | Fendeuse (`splitter`) | Éventail ×8 | Rayons | 1,2 s | Immédiat, projectile Faille ; charge/fissures inchangées |
| 4 | Souffleur | Cercle ×8, salve conique ×5 | Rayons | 1,35 / 1,2 s | Immédiat, projectile Faille ; poches au sol inchangées |
| 4 | Cœur de Grisou | Double radial, orbe | Rayons / ligne | 1,5 / 1,15 s | Première salve/orbe immédiats ; explosion différée conservée |
| 5 | Lampiste Major | Directeur : faisceaux, zones, contrôle | Télégraphes composites | Conservée | Inchangé |
| 5 | Dynamiteur | Fragments après explosion d’une charge | Zone de charge | Conservée | Fragments à la fin de l’explosion, sans nouvelle préparation |
| 5 | Masse Noire | Charges, slams, combos | Télégraphes composites | Conservée | Inchangé |
| 6 | Maître de Four | Cônes thermiques, balayages, hazards | Télégraphes composites | Conservée | Inchangé |
| 6 | Marteau-Pilon | Impacts, ondes, combos | Télégraphes composites | Conservée | Inchangé |
| 6 | Chaudière | Pression, purge, ondes, ultimes | Télégraphes composites | Conservée | Inchangé |

Compatibilité des anciens acteurs encore accessibles aux tests : les anciens patterns Zone 5 `fan`/`ring` (1,25/1,4 s) et Zone 6 `ring`/`steam`/`rivets` (1,35/1,25/1,1 s) suivent aussi la règle immédiate. Ils ne remplacent pas les directeurs de boss actuellement utilisés en production. Aucun mapping Rivet supplémentaire n’est imposé à ces anciennes familles.

## Audit des mobs

| Mobs | Décision |
|---|---|
| Foreuse autonome, y compris réutilisation Zones 1–4 | Simple / éventail ×3 immédiats ; préparation de 0,9 s supprimée ; Rivet B |
| Draisine | Éventail ×3 immédiat ; préparation de 0,85 s supprimée ; Rivet B |
| Riveteur | Simple / ×3 immédiats ; préparation de 1,1 s supprimée ; Rivet B |
| Lampiste | Salve lumineuse ×3 immédiate ; préparation de 1,1 s supprimée ; famille lumière |
| Rat, Mineur grisouteux | Mêlée : inchangés |
| Wagon Fou, Foreur de fond | Charges : télégraphes conservés |
| Sondeur, Grisouteux | Impact/explosion au sol : conservés |
| Rampant, Cracheur, Éclateur bonbonne | Mêlée/gaz au sol/explosion : conservés. Le nom « Cracheur » ne suffit pas à classifier son gaz comme tir mobile |
| Boutefeu, Gueule Noire | Charge posée / bond : conservés |
| Chauffeur, Scorificateur | Cône thermique / charge et chaleur au sol : conservés |

## Temporisations volontairement conservées

- Deuxième tir de la rafale de l’Aiguilleur : **0,32 s**, sous réserve du quota de projectiles de son propriétaire.
- Deuxième salve du Cœur : **0,65 s** ; réservation atomique des 16 projectiles conservée.
- Explosion de l’orbe arrivé à destination et explosion de mort de l’Éclateur : annonce de **1,1 s** conservée, avec zone/rayons de l’explosion.
- Détonation des charges du Dynamiteur et émission des fragments : séquence composite conservée.
- Tous les télégraphes de rails, croix, slams, pression, gaz, cônes thermiques, faisceaux, ultimes et hazards.
- Apparition/warmup, récupération, cooldown et refus de budget existants. Aucun bonus compensatoire de fairness.

## Mesures et preuves

`production-v038c1b-instant-fire/notes/timings.json` contient les 22 mesures avant/après à 120 Hz, avec les sources prépatch archivées dans `before/src`. Exemples : Foreuse 908 ms → 0 ; Draisine 858 ms → 0 ; Crachefer simple 1 108 ms → 0 ; Aiguilleur cercle 1 517 ms → 0. Les quelques millisecondes au-delà des constantes correspondent aux transitions discrètes des anciens contrôleurs.

Galerie : `production-v038c1b-instant-fire/gallery.html`. Serveur de validation en lecture seule : `node production-v038c1b-instant-fire/server.mjs`, port 5221. Ce serveur n’est pas le serveur de production.

Le banc importe Run, les contrôleurs et les renderers réels. Il fixe uniquement les conditions de test : cooldown prêt, ennemi vivant, tirs joueur désactivés, HP de diagnostic élevés. Les captures ne démontrent donc pas la gagnabilité. Aucun accès aux sauvegardes.

- `captures/aiguilleur-before.jpg` / `aiguilleur-after.jpg` : même premier update, 0 projectile avant / 6 après.
- `captures/mobile-320.jpg` : cercle en mouvement à 320×568.
- `captures/mobile-390.jpg` : cercle en mouvement à 390×844.
- `captures/riveteur-320.jpg` : éventail Zone 6 à 320×568.
- `notes/browser-audit-320.json` / `browser-audit-390.json` : 22 scènes × 6 s de simulation pour chacun des formats.

Ce sont des viewports navigateur, pas un nouveau test sur téléphone Android physique. Les deux bancs autonomes contrôlés n’ont émis aucune erreur ni avertissement console. La galerie finale utilise des captures statiques et des liens vers ces bancs ; une première galerie à iframes a été remplacée après une erreur MutationObserver observée pendant l’inspection navigateur (aucun MutationObserver dans le code du projet).

À courte portée : vérification des origines et collisions dans les huit directions à 65, 100 et 200 unités. Origine inchangée : rayon de l’émetteur + rayon du projectile + 2. Aucun spawn sur le joueur dans ces cas. À distance de contact inférieure à cette enveloppe, un chevauchement initial était et reste possible ; aucun décalage de muzzle/hitbox ni délai compensatoire n’a été ajouté. Ce cas doit faire partie du retour humain de fairness.

## Tests — résultat complet, sans masquer les échecs

**1 418 tests exécutés : 1 317 réussis, 101 échoués, aucun ignoré.** Les 1 367 tests existants ont été conservés ; 51 nouveaux tests ciblés ont été ajoutés, **51/51 réussis**. La suite entière a été relancée avec accès loopback pour les tests de serveur ; leurs deux erreurs EACCES du premier lancement sont résolues dans le bilan final.

Les nouveaux tests vérifient les 22 émissions au même update, les types et nombres, le cercle vague 15, le mapping, la physique et les dégâts identiques, les huit directions, les réservations/caps, les réessais du Crachefer, l’indépendance de l’animation, l’absence de previews dans les quatre renderers, les télégraphes non-projectiles et l’identité de tous les fichiers hors périmètre.

Les anciens tests ne sont ni supprimés, ni passés en `skip`, ni affaiblis. Plusieurs exigent désormais un comportement contradictoire avec la demande : préparation visible de 0,9/1,5 s, 100 poses PREPARE, absence de projectile au premier update, exclusion des cercles du Rivet, anciens hashes exacts de tous les contrôleurs, rejeu identique à des versions antérieures. La liste exhaustive et les assertions échouées sont conservées :

- `notes/tests-final.txt` : sortie complète de `npm test`.
- `notes/failing-tests.json` : les 101 intitulés et emplacements.
- `notes/targeted.txt` : tests nouveaux.

Des échecs portent également sur les métriques de chevauchement du triple (les métriques historiques comptent notamment l’entrée en `warning`) et sur des résultats de combat. **Deux parcours automatiques Zone 5 perdent avec les inputs inchangés : Mitraillette vague 16, Grisou X vague 14.** Ils ne sont pas assimilés à de simples conflits de snapshots. Aucune modification des dégâts, vitesses, cooldowns ou difficulté n’a été appliquée pour les faire passer. La validation d’équilibrage reste à faire humainement ; ce patch n’est pas déclaré entièrement validé.

## Fichiers de production concernés

- Contrôleurs : `src/enemies/drill.js`, `src/enemies/draisine.js`, `src/bosses.js`, `src/rail-bosses.js`, `src/shaft-actors.js`, `src/rift/actors.js`, `src/depths/actors.js`, `src/forge/actors.js`.
- Règle et admission : nouveau `src/projectile-attacks.js`, `src/boss-patterns.js`, `src/triple-pressure.js`, `src/run.js`.
- Signal de tir réel : `src/enemy-projectiles.js`, `src/rift/combat.js`.
- Visuels : `src/enemy-rivet-vfx.js`, `src/enemies/view.js`, `src/rift/art.js`, `src/depths/art.js`, `src/forge/art.js`.
- Animation : `src/enemy-animation.js`, `src/rift-animation.js`, `src/depths-animation.js`, `src/forge-animation-state.js`.
- Tests ajoutés : `tests/enemy-instant-fire.test.js`.
- Documentation, sources avant patch, banc et captures : ce document et `production-v038c1b-instant-fire/`.

Aucun asset, projectile joueur, configuration de dégâts/vitesse/cooldown, hitbox, master ou sheet modifié. Aucun commit/push. Arrêt sur ce patch, avec réserves de validation explicites.

