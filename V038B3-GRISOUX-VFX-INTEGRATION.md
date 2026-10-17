# V0.38B.3 — Grisou X : intégration des VFX validés

## Résultat et périmètre

Les six choix de la planche humaine sont intégrés : **Flash A, Bolt B, Impact A, Conduit B, Arc A, Surcharge C**. Masters et sheets SVG natifs, aplats francs, contour sombre, cyan/turquoise, blanc énergétique et accents jaune pâle. Pas de filtre, gradient, halo, fumée permanente ou effet critique ajouté. Aucun impact décor inventé.

Le feedback optionnel **Condensateur A n'est pas retenu** : un anneau discret a été essayé sur l'arme dans le banc en 320×568. À cette taille il se confond avec son cœur existant et son clignotement ajoute peu d'information. Le nombre de bolts donne le feedback utile. L'essai demeure uniquement dans le banc, avec capture ; aucun asset Condensateur ni animation de charge dans le jeu. Bobine n'a aucun effet dédié.

Production : `src/grisoux-vfx.js` ajouté, `src/room-scene.js` et `src/effects.js` raccordés, six sheets dans `src/assets/grisoux-v038b3/`. Tous les autres fichiers source préexistants sont inchangés octet pour octet, notamment `hero-muzzle.js`, les armes, perks, simulation, ennemis, hitboxes, timings, anciennes sheets et resolvers Fusil/Mitraillette. Vérification SHA-256 dans les tests. Aucun commit/push, aucun changement CGWeb.

## Source de vérité gameplay

Valeurs confirmées dans le code : 3 projectiles simultanés ; 11 dégâts ; intervalle 0,85 s ; portée 350 ; vitesse 620 ; dispersion 0,10 ; aucune pénétration native. Aucun de ces chiffres n'est modifié.

- **Conduit** : 2 cibles, puis 3 et 4 avec les deux rangs renforcés ; coefficients 100/70/50/35 %. Feedback sur les événements `hit`/`kill` portant `energy` et `continuing`, orienté selon l'angle du projectile. La dernière cible n'a pas de sortie fictive.
- **Condensateur** : +1 projectile, ×0,88 dégâts et +0,035 dispersion par rang, deux rangs. Cinq projectiles au maximum par salve ordinaire. Double Canon peut produire deux salves identiques, donc dix projectiles simultanés. Pas de décalage inventé pour séparer les trajectoires.
- **Surcharge** : après un kill direct, divise par deux la pénalité de dégâts vers la cible suivante. **Ce n'est pas une explosion de zone.** La nova courte ne donne ni dégâts ni rayon d'attaque. Elle exige un kill énergétique direct, `continuing:true`, le perk actif et une source différente d'Arc. Aucun proc sur un kill normal, une cible finale sans continuation, ou un kill secondaire d'Arc. Les perks ne changent pas pendant le vol dans le flux actuel ; le renderer lit le flag de l'arme, sans ajouter d'événement de simulation.
- **Arc** : un kill direct sélectionne un voisin à moins de 95 unités, dégâts 35 %, sans récursion. Le VFX écoute exclusivement `energy-arc`, fixe les deux coordonnées de l'événement et étire une chaîne fine entre elles. Il ne recherche aucune cible.
- **Bobine** : intervalle divisé par 1,25 ; Détente et les épiques existants restent identiques. Les builds avancés incluent séparément Double Canon, Pluie de fer et Grisou instable.

Les explosions du talent Grisou/Grisou instable conservent leur rendu historique `overload-energy`. La nova moderne utilise une clé distincte `overload-grisoux` : elle ne remplace pas les explosions des autres armes. Les particules énergétiques génériques redondantes et l'anneau doré des doubles salves sont retirés seulement pour le rendu Grisou X.

## Assets de production

| Effet | Frames | Cellule | Taille jeu | Durée | SVG, octets | RGBA estimé |
|---|---:|---:|---:|---:|---:|---:|
| Flash A | 3 | 32×32 | 24×20 | 60 ms | 1 248 | 12 288 |
| Bolt B | 4 | 32×16 | 20×9 | 90 ms, boucle | 1 715 | 8 192 |
| Impact A | 4 | 32×32 | 20×20 | 90 ms | 1 371 | 16 384 |
| Conduit B | 4 | 64×16 | 34×10 | 90 ms | 1 589 | 16 384 |
| Arc A | 4 | 128×16 | longueur réelle ×8 | 90 ms | 1 602 | 32 768 |
| Surcharge C | 6 | 64×64 | 60×60 | 120 ms | 4 556 | 98 304 |

Total des six sheets : **12 081 octets (11,8 Kio)**. Mémoire raster RGBA8 : **184 320 octets (180 Kio)** supplémentaires, hors overhead du navigateur/pilote, copies CPU/GPU et éventuels mipmaps. La référence PNG et les captures de galerie ne sont pas chargées en production. `notes/assets.json` contient le détail exact.

Clés `grisoux-v038b3-*`, URLs `/src/assets/grisoux-v038b3/*-v1.svg`. Vérification des dimensions et rectangles de chaque frame avant utilisation. Masters et copies de sheets de validation dans `production-v038b3-grisoux/assets/`, identiques aux feuilles de production.

## Bouche, direction et profondeur

Le flash et chaque bolt utilisent **le socket existant de `hero-muzzle.js`**, conservé sans modification : grip, rotation, miroir, recul et fallbacks. Chaque naissance reste figée dans le monde puis rejoint la trajectoire de simulation par le raccord visuel validé. Aucun laser, homing ou nouvel espacement gameplay.

Les bolts restent à la profondeur 7, comme les autres projectiles joueur, sous les télégraphes. Les impacts, conduits, arcs et novas modernes sont à 16 pour éviter leur disparition derrière les corps ennemis (15) ; ils restent sous le héros (20) et les tirs hostiles (24). Les télégraphes au sol sont à 8 : les traits énergétiques peuvent brièvement passer devant une petite portion d'un marquage, d'où leurs formes ajourées, leur petite taille, leurs caps et leur extinction rapide. Aucun plein écran blanc. Les anciennes armes gardent leur profondeur ; chaque réutilisation du pool restaure explicitement la profondeur appropriée.

Les formes s'ouvrent puis se réduisent/se dissipent. La nova laisse son centre ouvert pendant l'expansion, avec deux petits fragments intégrés à la sheet ; aucun système de particules additionnel. À l'instant de naissance les bolts partagent naturellement la même bouche ; ils se séparent avec la dispersion existante. Double Canon superpose deux salves identiques, conformément au gameplay.

## Plafonds, réutilisation et fallback

- 6 impacts énergétiques simultanés, un par cible durant la vie du clip.
- 6 conduits, un par cible pendant la vie du clip.
- 3 arcs simultanés, chacun un sprite étiré entre ses points fixes.
- 2 novas simultanées, regroupées par victime.
- Pool partagé existant : **48 sprites**, sans croissance ; 84 vues de projectiles existantes. Un flash de bouche.

Quand un plafond est atteint, seul le feedback additionnel est omis. Aucun événement, dégât ou proc n'est supprimé ni retardé. `clear()` et l'expiration libèrent les mêmes slots. Même le fallback procédural respecte les plafonds énergétiques. Aucune allocation de sprite, timer ou liste de particules par proc ; le code parcourt le pool fixe. L'identité des 48 sprites reste stable dans les tests et dans le navigateur.

Fallback : sheet moderne → ancien effet énergétique valide du même rôle → étincelle énergétique procédurale existante si les deux niveaux sont absents. Arc réutilise l'ancienne conduction, ancrée à sa source. Flash/bolt retombent sur les anciens rendus Grisou X. Aucun VFX Fusil/Mitraillette substitué. Frames manquantes, dimensions incorrectes, textures manquantes et rechargement contrôlés.

## Tests et validation

La baseline réelle après le correctif de bouche était **1 299 tests**, et non 1 284. Résultat final : **1 333 / 1 333 réussis**, 34 nouveaux tests, aucun test supprimé/ignoré. Journal : `production-v038b3-grisoux/notes/tests.txt` (56,89 s).

Les listes d'autorisation historiques sont étendues aux sept nouveaux fichiers ; le test de périmètre du correctif de bouche autorise désormais le changement visuel d'`effects.js`. Les anciennes assertions gameplay et assets restent conservées. Le nouveau verrou compare la totalité du source à la baseline immédiate, en n'autorisant que les deux consommateurs visuels et les sept ajouts.

Tests nouveaux : frames/durées/boucle, cap par cible/type, expiration, réutilisation, fallback complet/partiel, Arc exact/non récursif, nova sur proc seulement, traversées et atténuation aux quatre niveaux, trois/quatre/cinq bolts, délégation balistique intacte, restauration de profondeur, simulation avec/sans rendu strictement identique sur 17 builds incluant les trois épiques. Les tests de bouche existants sont conservés.

Navigateur :
- **48 contrôles de naissance** : 8 directions × 3, 5 et 10 bolts × deux formats. Écart nul avec la bouche/flash.
- **38 essais de builds** : 19 builds dans chaque format, avec événements réels archivés.
- **68 scènes par format** : mobs des six zones, boss, patterns et triples. Build avancé en 320, avancé + Double Canon en 390. Les scènes emploient Run/RoomScene réels, avec fixtures isolées ; ce ne sont pas des runs complets de vingt vagues.
- Captures 320×568 et 390×844, dont Zones 1/4/6 et les trois armes ; comparaison avant/après avec événements et positions de simulation strictement identiques.
- Nettoyage : zéro clip restant après `clear`, aucune augmentation du nombre de sprites. Rechargement après suppression volontaire des textures rétablit les nouvelles sheets.

Mesures PC, banc rendu en temps réel sur 10 s (pas une garantie Android) :

| Cas | FPS observés | Frame p95 | CPU update p95 | Bolts max | Pool VFX max |
|---|---:|---:|---:|---:|---:|
| 320×568, build avancé, dense Zone 6 | 69,6 | 14,27 ms | 4,8 ms | 10 | 9 |
| 390×844, avancé + Double Canon, dense Zone 6 | 69,5 | 14,31 ms | 3,7 ms | 20 | 11 |

Sur les matrices de 68 scènes, pic du pool d'effets : 12 en 320 et 13 en 390. Une seconde mesure frame par frame sur les 68 scènes relève un pic simultané exact de **28 éléments visibles** (bolts + pool d’effets + flash). Les maxima séparés 20/13/1 ne sont pas tous simultanés. Rapport : `notes/peak-total.json`. Le plafond théorique des seuls clips Grisou X est 17, dans le pool général 48.

Heap JS échantillonné : 56,2 → 59,4 Mo puis 60,8 → 64,1 Mo. Le banc conserve volontairement ses traces d'événements, charge Phaser et toutes les scènes ; ces différences ne mesurent ni la mémoire du seul VFX ni une fuite. Pas de GC forcé, pas de promesse de stabilité du heap global. Les objets de rendu sont réutilisés, et les allocations GPU additionnelles sont estimées séparément ci-dessus.

Le jeu normal a également été ouvert sur une origine de test neuve, Grisou X choisi au menu, puis Bobine rapide. Sans déplacement piloté, il a terminé trois vagues (30 ennemis en 35 s), puis échoué en vague 4 ; aucun avertissement ni erreur console. Ce contrôle confirme le chargement de production, pas une run complète ni une évaluation de difficulté.

## Android physique et arrêt

Sur le serveur Wi-Fi habituel, recharger le jeu puis vérifier : cyan visible, salves distinctes, huit directions, Arc fin entre les bonnes cibles, sortie Conduit, Surcharge brève après kill avec le perk, disparition complète des effets, lisibilité des télégraphes en Zones 4/6 et triple final. Vérifier surtout les cinq/dix bolts à courte distance et la fluidité prolongée sur l'appareil réel. Aucun Android physique accessible pendant cette validation PC.

Galerie : `production-v038b3-grisoux/gallery.html` ; serveur d'audit loopback `node production-v038b3-grisoux/server.mjs`, port 5218. Aucun changement de configuration du serveur Wi-Fi.

**Arrêt après V0.38B.3. Aucun chantier suivant, aucun commit/push.**
