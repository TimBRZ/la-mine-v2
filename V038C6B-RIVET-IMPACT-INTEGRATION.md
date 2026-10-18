# V0.38C.6B — Impact métallique Rivet B

Variante B « point chaud + étincelles » intégrée le 18 octobre 2026. Un seul atlas commun à la Foreuse autonome, la Draisine, le Crachefer, l’Aiguilleur et le Riveteur. Aucun commit/push. Arrêt du chantier après cette livraison.

## Audit et événements retenus

Le moteur `EnemyProjectiles.update` calcule un contact segment/cercle avec le joueur, avance le projectile, puis le désactive en cas de contact, fin de portée ou sortie des limites de l’arène. `RiftProjectiles` partage cette logique mais contient aussi des orbes, explicitement exclus de cet impact.

| Terminaison réelle | Traitement visuel |
|---|---|
| Contact joueur | Impact au centre du projectile au premier contact balayé, avec le paramètre exact déjà calculé par la collision. Jamais au centre du joueur. |
| Joueur invulnérable | Même impact de contact ; le refus de dégâts et le feedback existant restent sous le contrôle du gameplay. |
| Sortie des limites de l’arène | Impact à l’intersection exacte du segment avec la limite existante. Si le projectile était déjà hors limites, utilisation de sa position finale. |
| Décor intérieur | Pas de collision de projectile avec les obstacles intérieurs dans ce moteur ; aucun événement inventé. |
| Portée atteinte | Disparition silencieuse. Un choc en plein vide suggérerait un obstacle inexistant et augmenterait le bruit visuel. |
| `clear()`, nouvelle run, changement de zone, désactivation technique | Aucun nouvel impact. Les effets encore actifs sont nettoyés. |
| Orbe, projectile étranger, propriétaire inconnu | Aucun impact Rivet B. |

La priorité existante du contact joueur sur les autres conditions reste intacte. Le calcul visuel des points ne réécrit jamais les positions, distances, collisions ou callbacks de combat.

## Architecture et périmètre

`projectile-endings.js` observe les résultats de la simulation dans un journal circulaire de 64 enregistrements, indexé par gestionnaire dans une WeakMap. Les enregistrements contiennent des valeurs scalaires, sans référence persistante vers un acteur. Ils ne pilotent aucun dégât.

`RivetImpactView` consomme chaque événement une seule fois et utilise le sélecteur existant `rivetCompatible`. Le cache de propriétaires du rendu Rivet permet aussi de reconnaître un projectile dont le tireur vient de mourir. Les événements trop anciens ne sont pas rejoués.

Fichiers de production existants modifiés :

- `src/enemy-projectiles.js` : trois points d’observation — temps, terminaison et nettoyage. Les expressions et écritures de physique existantes sont conservées.
- `src/room-scene.js` : préchargement de l’atlas.
- `src/enemies/view.js` : création et mise à jour du pool visuel.

Nouveaux fichiers de production :

- `src/projectile-endings.js`.
- `src/rivet-impact-vfx.js`.
- `src/assets/rivet-impact-v038c6b/impact-b1.svg`.

Tests ajoutés : `tests/rivet-impact-v038c6b.test.js`, `tests/rivet-impact-before-hashes-v038c6b.json`, `tests/rivet-impact-visual-delta.js`. Les helpers `tests/riveter-muzzle-visual-delta.js` et `tests/v038b3-authorized-files.js` reconnaissent les seuls ajouts déclarés, sans assouplir les vérifications antérieures. Aucun ancien fichier `.test.js` modifié.

Le dossier `production-v038c6b-rivet-impact/` contient la galerie, la référence, les exports de contrôle, le générateur SVG, les captures, le banc isolé et les preuves de test. Les snapshots `before/` et les empreintes permettent de contrôler le delta exact.

Le projectile Rivet B, son atlas, son animation, son trail, ses dimensions, sa rotation et son pool restent inchangés. Les fichiers de muzzle/facing/miroir C6A sont inchangés. Aucun changement de vitesse, cadence, dégâts, portée, spread, hitbox, invulnérabilité, caps, apparitions ou comportement des cinq ennemis.

## Asset et animation

| Propriété | Valeur |
|---|---|
| Identifiant | `rivet-impact-v038c6b-b1` |
| Source | SVG natif, aplats chauds, sans filtre, blur, gradient ou dépendance externe |
| Atlas | 384 × 64 px, 6 cellules de 64 × 64 px |
| Animation | 6 × 30 ms = 180 ms |
| Affichage | 40 × 40 unités ; enveloppe de rayon 20 unités |
| Poids disque | 8 113 octets |
| Mémoire RGBA de base | 98 304 octets, soit 96 Kio ; hors objets moteur/driver |
| Orientation | Radiale, tournée avec la direction reçue du projectile |
| Réduction de mouvement | Deux poses sobres sur la même durée totale |

Séquence : point chaud, ouverture, pic, dispersion, réduction, extinction. Le centre disparaît à 120 ms. Les fragments restent petits et disparaissent à 180 ms. Aucune explosion, fumée, onde, halo ou trace permanente. Les bords de cellules sont transparents, sans débordement vers une frame voisine.

L’impact est à la profondeur 7,6 : sous le gaz (7,75), les plaques (7,8), les lignes thermiques (7,85), les télégraphes, les acteurs et les projectiles. L’ordre des couches existantes n’est pas modifié. Le personnage peut masquer une partie de l’impact : ce choix préserve sa lisibilité.

## Pool, saturation, fallback et nettoyage

Pool dédié de 32 sprites et 32 états, alloué une fois quand l’atlas est utilisable. Journal de 64 enregistrements réutilisés. Aucun sprite, état d’impact ou timer créé à chaque contact. Les recherches de propriétaire et les appels moteur peuvent avoir un coût transitoire JavaScript ; il ne s’agit pas d’une promesse de zéro allocation interne.

Le cas dense réel de quatre Riveteurs produit 12 impacts rapprochés, sous le cap de 32. La fixture mixte couvre les cinq sources, dont une salve ×3, soit 7 tirs. En saturation, recyclage circulaire contrôlé des emplacements visuels ; aucun projectile, callback, hit ou dégât n’est supprimé. Le journal borne également l’historique visuel si plus de 64 terminaisons arrivent entre deux rendus.

Atlas absent, dimensions incorrectes ou frames incohérentes : aucun nouvel impact. Les projectiles et le feedback joueur continuent. Aucun fallback vers une autre famille. Un chargement tardif permet les futurs impacts sans rejouer les événements consommés pendant l’absence.

À expiration : état remis à zéro, sprite masqué, texture remplacée par `__WHITE`. `clear()` incrémente une génération et invalide les événements. Changement de run/zone/pool : effets vidés, pas de rejeu de l’ancien journal. Arrêt de scène : destruction des sprites et libération des références. Aucun timer orphelin.

## Résultats des tests

Suite complète finale : **1 757 / 1 757 tests réussis**, zéro échec, zéro ignoré. Les **1 703 tests antérieurs sont conservés**, avec 54 nouveaux tests. Durée de la dernière exécution : 58,91 s. Preuve : `production-v038c6b-rivet-impact/notes/tests-final.txt` ; une première exécution réussie est aussi conservée dans `notes/tests.txt`. La suite finale a été exécutée avec accès au serveur HTTP local requis par certains tests, après un refus loopback `EACCES` du sandbox.

Couverture : atlas et frames ; vrais contacts balayés, joueur mobile et invulnérable ; quatre limites d’arène ; portée silencieuse ; cleanup ; 13 cas de tir réels issus des cinq sources ; éventails et cercles ; propriétaire mort ; 12 impacts ; saturation ; fallback/chargement tardif ; six frames et réduction de mouvement ; nouvelle run, changement de zone et arrêt de scène. Un stress de 60 collisions conserve les 60 callbacks, avec 32 effets maximum et 28 recyclages visuels.

Les tests rejouent la physique avant/après dans huit directions : mêmes états, trajectoires, terminaisons et callbacks. Les garde-fous par empreintes vérifient aussi le code et les assets antérieurs après retrait des seuls hooks autorisés.

Contrôle navigateur Chrome avec le renderer de production : **320 × 568 et 390 × 844**, DPR 1. 23 scénarios × 2 formats × avant/après = **92 captures**, avec **46 comparaisons d’états de combat identiques**. Deux captures supplémentaires couvrent joueur puis mur sur la même salve. Aucune erreur console/page observée ; aucun débordement horizontal dans le banc. Les captures contrôlent les cinq utilisateurs, le tir simple, l’éventail ×3, 12 impacts, les huit directions et la superposition avec les dangers. Reload, asset absent et nouvelle run vérifiés.

Le banc suspend les apparitions et le tir joueur et étend ses PV pour isoler le rendu. Les scènes dense et mixte forcent des émissions via les gestionnaires réels. Le mélange transversal des cinq familles est une fixture de contrôle, pas une nouvelle composition de vague.

La galerie elle-même a été contrôlée à 320 × 568, 390 × 844 et 1440 × 1000 : ses 23 situations dans les deux formats chargent leurs images, sans erreur console ni débordement horizontal. Le rapport lié répond correctement. Preuve : `notes/gallery-check.json` et captures `gallery-*.png`.

## Coût mesuré

Mesures indicatives sur ce PC, Chrome headless/SwiftShader ; elles ne remplacent pas une mesure Android :

| Mesure | Résultat |
|---|---|
| Mise à jour du rendu, 12 impacts | Médiane ≈ 0,003 ms ; p95 ≈ 0,009 ms |
| Enregistrement d’une terminaison, 100 000 échantillons | Médiane ≈ 0,0001 ms ; p95 ≈ 0,0002 ms |
| Identité des objets après 10 000 impacts | 64 records, 32 sprites, 32 états conservés |
| Pic forcé | 32 effets ; recyclage stable |
| Heap après fixture/échauffement et première série | +312 264 octets, incluant fixture et échauffement du moteur |
| Deuxième série de 10 000 impacts, même pool, après GC | −3 196 octets ; pas de croissance retenue observée sur cette série |

Ces mesures concernent le code d’impact et son journal, pas le coût GPU complet du jeu. Les fichiers `notes/browser.json`, `notes/extras.json` et `notes/metrics.json` contiennent les données.

## Livraison et validation humaine restante

Galerie : `production-v038c6b-rivet-impact/gallery.html` ; serveur local de validation sur `http://127.0.0.1:5231/production-v038c6b-rivet-impact/gallery.html`.

C6A était déjà validé sur Android et n’a pas été retouché. **C6B reste à vérifier sur téléphone Android physique** : lisibilité du petit impact sur joueur et aux murs, salves rapprochées, fluidité et absence de régression après rechargement du jeu. Les captures mobiles livrées proviennent du navigateur desktop aux dimensions demandées.

Aucun équilibrage, changement de gameplay, commit ou push. Aucun autre chantier VFX commencé.
