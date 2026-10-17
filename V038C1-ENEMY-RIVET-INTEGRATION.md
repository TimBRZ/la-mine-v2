# V0.38C.1 — Rivet perçant B intégré

Le projectile ennemi standard compatible utilise désormais le Rivet perçant B. Seuls le chargement de son asset et son rendu changent. Le gameplay, les impacts, les télégraphes et les familles spéciales restent inchangés. Aucun commit/push.

## Référence et rendu

Référence humaine : `C:/Users/Tim Pro/Downloads/Fiche conceptuelle du projectile ennemi.png`, copiée dans `production-v038c1-enemy-rivet/assets/reference.png`.

La pointe orange/jaune, le corps court en acier sombre, la bague cuivre et les deux ailettes reprennent la version B. Les micro-rayures et particules séparées sont retirées. La traînée rouge/orange reste courte derrière le corps ; aucune fumée, aucun halo ni filtre. Le corps est identique dans les trois frames.

- Galerie : [production-v038c1-enemy-rivet/gallery.html](production-v038c1-enemy-rivet/gallery.html).
- Banc réel : [observe.html](production-v038c1-enemy-rivet/observe.html), comparaison précédente : [before.html](production-v038c1-enemy-rivet/before.html).
- Serveur de contrôle : `node production-v038c1-enemy-rivet/server.mjs`, sur `http://127.0.0.1:5220/production-v038c1-enemy-rivet/gallery.html`.
- Master / silhouette / sheet : `production-v038c1-enemy-rivet/assets/`.

## Audit avant intégration et mapping exact

L'audit initial est conservé dans [notes/audit-before.md](production-v038c1-enemy-rivet/notes/audit-before.md). L'ancien visuel n'était pas une texture : `EnemyAttacksView` dessinait un trait de 17 unités, un disque et un centre clair d'après `bolt.spec`. Ce renderer était commun à plusieurs familles ; le partager ne suffit donc pas à autoriser une conversion.

| Entité / id | Zones réelles | Patterns convertis | Ancien → nouveau |
|---|---|---|---|
| Foreuse autonome / `drill` | 1, 2, 3, 4 | Simple alterné / éventail 3, ±22° | Procédural `DRILL_BOLT` → rivet |
| Draisine / `draisine` | 2 | Éventail 3, ±22° | Procédural `DRAISINE_BOLT` → rivet |
| Crachefer / `crachefer` | 1, solo et triple | Tirs ordinaires simples / éventail 3 | Procédural de sa spec → rivet |
| L'Aiguilleur / `switchman` | 2, solo et triple | `burst`, deux simples espacés / éventail 3 | Procédural `DRAISINE_BOLT` → rivet |
| Riveteur / `riveter` | 6 | `rivet` simple avant vague 11 ; `rivets` éventail 3 ensuite, ±0,17 rad | Procédural Forge → rivet |

Les angles et spreads ci-dessus sont ceux du code existant, pas de nouvelles valeurs.

Exclusions explicites : `orb`, `bossMajor`, gaz, vapeur du Compresseur, énergie du Grisou, attaques Rift, lumière du Lampiste, fragments du Dynamiteur, explosions, fissures et hazards. Les cercles spéciaux du Crachefer et de l'Aiguilleur restent exclus. Le Sondeur émet des impacts au sol, pas un tir standard, malgré son champ `projectileSpec`. Les anciens cycles Forge évoquant des rivets ne sont pas les cycles des boss `ForgeDungeonBoss` actuels : aucun boss Forge converti. Aucune entité Zone 5 convertie ; le titre de l'illustration ne remplace pas l'audit du code.

## Contrat technique

| Paramètre | Valeur |
|---|---|
| Clé | `enemy-rivet-standard-v038c1` |
| Fichier production | `src/assets/enemy-rivet-v038c1/rivet-v1.svg` |
| Texture | 120 × 24 px |
| Frames | 3 cellules de 40 × 24 px |
| Boucle visuelle | 120 ms, 40 ms/frame |
| Dimensions affichées | 26 × 15,6 unités dans l'arène logique 450 × 800 |
| Pivot local | (25,12), soit origine (0,625 ; 0,5) |
| Poids SVG exact | 3 388 octets |
| Mémoire pixels RGBA8 | 11 520 octets = 11,25 Kio, hors surcoût pilote/texture/objet |
| Pool visuel | 24 images créées une fois par scène |

La rotation utilise directement `bolt.angle`, la position `bolt.x/y`. L'âge visuel est dérivé de distance/vitesse ; aucun timer gameplay supplémentaire. Le mode mouvement réduit fige la frame 0. Les huit orientations sont vérifiées modulo 2π, Phaser normalisant sa rotation. Le pivot est centré sur le métal, sans déplacer la collision vers la pointe ou la traînée.

La sélection utilise l'identité de l'émetteur et des exclusions explicites, jamais la couleur. La provenance reste connue après la mort du tireur tant que ses tirs existent, puis est purgée. Un nouvel objet Run vide les anciennes associations. Un owner inconnu conserve le rendu historique par précaution.

## Fallback et cache

PRIMARY : nouvelle clé versionnée, dimensions exactes et rectangle de frame vérifiés. SECONDARY : le dessin procédural historique exact du `bolt.spec` concerné. Aucune sélection de texture joueur, Grisou X, Mitraillette ou autre famille. Chaque update masque d'abord les anciens sprites, y compris quand une slot est réutilisée.

Tests navigateur : texture supprimée → 0 rivet/3 tirs gameplay maintenus ; frames supprimées → même fallback ; rechargement → 3 rivets rétablis. Nettoyage de pool → 0 tir et 0 sprite visible. Tests unitaires supplémentaires : texture mal dimensionnée, mauvais rectangle, provenance après mort, réutilisation d'id et nouveau Run.

Une nouvelle page crée une nouvelle scène/TextureManager. Cache HTTP vérifié avec le serveur de contrôle servant le fichier versionné en `immutable` : premier transfert 3 688 octets avec en-têtes, corps 3 388 ; reload à chaud : `transferSize: 0`, corps 3 388, les 3 rivets sont toujours affichés. Preuve : [notes/cache.json](production-v038c1-enemy-rivet/notes/cache.json). La configuration du serveur normal du jeu n'a pas été modifiée.

## Validation en jeu et mobile

89 scénarios du banc ont été parcourus dans chacun des formats **320×568** et **390×844**, avec le vrai `Run`, les vraies attaques et le rendu `RoomScene`. Le banc isole les rencontres et augmente les PV pour observer les séquences ; ces réglages sont uniquement dans les fixtures, sans sauvegarde. Ce n'est pas une campagne jouée intégralement au doigt.

Cas ciblés : Foreuse Zones 1–4, Draisine, Riveteur simple et éventail, groupe Zone 2, huit Riveteurs simultanés, Crachefer/Aiguilleur solo et triples Zones 1/2, huit directions. Les autres scénarios couvrent aussi les familles exclues et boss spéciaux. Maximum observé : 24 tirs. Captures dans `production-v038c1-enemy-rivet/captures/` ; rapports `notes/audit-320.json`, `audit-390.json`, `scenes-320.json`, `directions.json`.

Contrôle visuel : les trois pointes de l'éventail restent distinctes, la traînée est contenue et les zones libres restent visibles. Les captures avant/après utilisent la même fixture déterministe et le même instant. Les dimensions de la galerie ont été vérifiées dans les deux formats sans débordement ni image manquante. Aucune erreur console sur les pages finales.

## Performance

Mesures navigateur sur ce PC, fenêtres de 10 s, huit Riveteurs, mêmes réglages avant/après, jusqu'à 24 projectiles. Il s'agit de la fréquence de la boucle observée, pas d'une garantie de FPS sur téléphone.

| Format | Ancien FPS | Rivet FPS | CPU update P95 ancien / rivet | Frame P95 |
|---|---:|---:|---:|---:|
| 320×568 | 164,75 | 164,63 | 2,0 / 1,9 ms | 6,09 ms |
| 390×844 | 164,72 | 164,28 | 1,9 / 1,9 ms | 6,09 ms |

Rapports bruts : `notes/bench-before-320.json`, `bench-320.json`, `bench-before-390.json`, `bench-390.json`. L'écart de ces essais est faible ; ils ne constituent pas un profilage statistique multi-appareils.

Allocations : exactement 24 images du nouveau pool, identités stables après 2 000 updates automatisés, aucune création d'image/particule/tableau dans sa boucle de rendu. Map/Set de provenance réutilisés et purgés ; les entrées et appels internes Phaser peuvent allouer. Le heap global mesuré varie avec le GC : nouveau 320 ≈65,98→64,73 Mo ; nouveau 390 ≈59,03→60,46 Mo. Il inclut le banc et Phaser : ce n'est ni une mesure isolée du module ni une preuve d'absence universelle de fuite. Cleanup fonctionnel vérifié par masquage de tous les sprites et purge des owners obsolètes.

Les télégraphes et leur dessin sont conservés octet pour octet. Le rivet garde la couche des anciens tirs ; sa surface et sa traînée restent petites, sans ajout de voile ou VFX couvrant l'arène.

## Fichiers et tests

Production ajoutée :
- `src/enemy-rivet-vfx.js` : sélection, validation texture/frame, pool, rotation, fallback.
- `src/assets/enemy-rivet-v038c1/rivet-v1.svg` : sheet versionnée.

Production modifiée :
- `src/room-scene.js` : import et preload seulement.
- `src/enemies/view.js` : instance du pool et branche de rendu compatible ; warnings et fallback préservés.

Validation ajoutée : `tests/enemy-rivet.test.js` (20 tests), dossier galerie/banc/captures/notes et cette documentation. Les listes d'autorisation des tests historiques V0.38B.1/B.2/B.3, muzzle et orb ont été étendues aux seuls nouveaux fichiers et insertions visuelles ; aucun test supprimé ni ignoré. Les snapshots/hash initiaux sont conservés dans `notes/`.

**`npm test` : 1 367 / 1 367 réussis, 0 échec, 0 skipped** (baseline 1 347 + 20), durée 53,64 s. Rapport : [notes/tests.txt](production-v038c1-enemy-rivet/notes/tests.txt).

Les tests verrouillent les sources hors périmètre par SHA-256, annulent exactement les insertions visuelles pour comparer les deux fichiers modifiés, et comparent deux simulations réelles avec/sans rendu. Vitesse, dégâts, collisions, spread, portée et pools restent identiques. Cadence, comportements et caps n'ont pas été édités.

## Validation Android physique restante

Depuis l'adresse LAN habituelle du jeu : recharger, observer la Foreuse/Draisine puis l'éventail du Riveteur, tester déplacement face aux tirs et une rencontre dense/triple. Confirmer lisibilité de la pointe, séparation des trois tirs et fluidité sur le téléphone réel, puis refaire après fermeture/réouverture de l'onglet. Le serveur de galerie 5220 est limité au PC ; les mêmes fichiers sont accessibles via le serveur mobile habituel du projet.

Cette validation matérielle n'a pas été effectuée ici. Aucun gameplay, impact, asset joueur ou master ennemi modifié. Arrêt après ce correctif ; aucune autre famille VFX commencée.
