# La Mine V2 — V0.38D.1F — Couches des projectiles

Correctif de composition du rendu uniquement. Aucun commit/push. Aucun travail sur Marche à blanc.

## Cause exacte

Les balles joueur existaient toujours : leurs objets de simulation étaient actifs, leurs sprites visibles, avec alpha 1 et la bonne texture. Elles étaient dessinées à **7**, sous les nouvelles surfaces opaques à **7,9**. Le matériau de lave les recouvrait lors de la composition finale. Aucune disparition du pool, aucun défaut de trajectoire ou de chargement n’a été constaté dans les reproductions.

Même défaut pour les impacts Shotgun/SMG à 7, les impacts Rivet à 7,6 et les flashes joueur/Riveteur à 7. Les contacts énergétiques à 16 restaient visibles. Les projectiles hostiles, y compris Rivet B et Lampiste, étaient déjà à 24 : **ils n’étaient pas masqués par ces surfaces**. Leur ordre est harmonisé à 11, entre sol et personnages.

Mesure directe : même framebuffer WebGL 450 × 800, même scène figée, mêmes objets ; comparaison avec/sans le groupe de sprites. Nombre de pixels RGB auxquels le groupe contribue :

| Scène / groupe | Avant | Après |
|---|---:|---:|
| 11 tirs joueur, Secteurs 2 plaques | 0 | 490 |
| 11 tirs joueur, Secteurs 3 plaques | 0 | 490 |
| 11 tirs joueur, Four à blanc vague 1 | 0 | 491 |
| 11 tirs joueur, Four à blanc vague 2 | 0 | 491 |
| 11 tirs joueur, Cône de fournaise | 0 | 493 |
| 11 tirs joueur, Four tournant | 93 | 491 |
| 11 tirs joueur, plaque Chauffeur | 0 | 489 |
| 11 tirs joueur, trace Scorificateur | 289 | 418 |
| 11 tirs joueur, gaz Cracheur | 460 | 488 |
| Impact Shotgun / SMG / Rivet | 0 / 0 / 0 | 225 / 99 / 156 |
| Impact énergétique | 149 | 149 |
| Flash SMG / Riveteur | 0 / 0 | 94 / 24 |
| Rivet B / Lampiste, Secteurs | 199 / 252 | 199 / 252 |
| Cinq projectiles génériques de Chaudron | 838 | 838 |

Ces chiffres décrivent les échantillons mesurés, pas une garantie de contraste dans toute composition possible. Le gaz atténuait les tirs ; les plaques opaques pouvaient les cacher complètement.

## Hiérarchie avant / après

| Famille | Avant | Profondeur finale après |
|---|---:|---:|
| Sol / décor | 0 et couches existantes | inchangé |
| Bases de lave | 7,8 | inchangé |
| Trace Scorificateur | 7,85 | inchangé |
| Matériaux des hazards | 7,9 | inchangé |
| Ancien composite sol + marquages | 8 | inchangé |
| Projectiles joueur, pellets, traceur, orbes | 7 | **10** |
| Projectiles hostiles, sprites et tracé de secours | 24 | **11** |
| Flashes joueur / Riveteur | 7 | **12** |
| Impacts Shotgun, SMG, balistiques / Rivet | 7 / 7,6 | **12** |
| Personnages ennemis | 15 | inchangé |
| Contacts Grisou X, Conduit, Arc, surcharge | 16 | **16**, conservé |
| Héros / arme tenue | 20 / 21 | inchangé |
| Contours dédiés des quatre attaques du Maître de Four | 16 | **30** |
| Contour / prévisualisation Scorificateur | 16 / 16,1 | **30 / 30,1** |
| Avertissements de `EnemyAttacksView` | 8 | **30** |
| UI, messages, barres | 50 et plus | inchangé |

Règle de vol : **SOL < DANGER AU SOL < PROJECTILE < PERSONNAGE < CONTOUR CRITIQUE / UI**.

Exceptions explicites :

- Les contacts énergétiques restent au-dessus des ennemis à 16, conformément au feedback validé ; ce ne sont pas les orbes en vol. Les poussières restent à 7.
- `ArenaView.warning` contient à la fois des remplissages de sol et des marquages historiques, notamment Chauffeur, gaz et chemins de secours. Ce composite reste à 8 : le remonter entier masquerait de nouveau les tirs. Ses marquages restent visibles, mais n’acquièrent pas la priorité 30 des contours dédiés. Pas de refonte des anciens dessins dans ce correctif.
- Les personnages peuvent cacher un projectile qui passe derrière eux, conformément à la hiérarchie demandée. Les matériaux de sol ne le peuvent plus.

## Mise en œuvre ciblée

`src/combat-render-layers.js` définit les couches communes et `applyCombatRenderLayers(scene)`. La scène applique cette politique **une fois à la fin de `drawActors`**, après les mises à jour des effets, de l’arène et du loot, avant le rendu Phaser.

Les renderers existants conservent leurs profondeurs locales historiques. La composition finale de la scène les normalise : cela couvre aussi les impacts réutilisés qui rétablissent leur ancienne profondeur et l’allocation tardive du pool d’impacts Rivet. Les appels `setDepth` sont évités lorsque la valeur finale est déjà correcte. Pas d’accès à `run`, pas de parcours des données de combat, pas de création d’objets par passage.

`ForgeSpriteVfx` dispose d’un Graphics séparé pour les deux étincelles de bouche du Riveteur. Leurs positions, couleurs, opacités, durée et plafond de primitives sont inchangés. Les autres petites décorations de forge restent dans leur Graphics de sol à 7. Un seul Graphics supplémentaire est créé à la construction.

Fichiers de production de cette étape :

- `src/combat-render-layers.js` : nouveau module de composition.
- `src/room-scene.js` : import et appel final.
- `src/forge-sprite-vfx.js` : séparation du flash Riveteur des décorations au sol.

Aucun asset ni renderer de matériau validé n’a été modifié. Les modifications antérieures B/C/D/E présentes dans le workspace sont conservées.

## Vérifications automatiques

**1 874 / 1 874 tests réussis**, sans test ignoré : les **1 862 tests antérieurs sont conservés octet pour octet**, et 12 tests ciblés sont ajoutés.

Les nouveaux contrôles couvrent la hiérarchie joueur/hostile, les quatre VFX du Maître de Four et la trace Scorificateur, les contacts et poussières, la stabilité sur 5 000 compositions, le recyclage des impacts, l’allocation tardive, l’absence d’accès à la simulation et l’emplacement de l’appel final.

Le verrou SHA-256 compare tous les fichiers `src/` et `tests/` préexistants à l’état D1E. Seuls les deux points d’intégration de production décrits ci-dessus et le branchement exact de l’adaptateur de tests sont autorisés. L’adaptateur retire ces deltas textuels précis pour les anciens tests de non-régression ; il ne masque pas des fichiers entiers et ne modifie aucune assertion historique. Les anciens tests unitaires continuent de vérifier les profondeurs locales ; les nouveaux tests et le navigateur vérifient la composition finale.

Fichiers de tests : `tests/projectile-layering-v038d1f.test.js`, `tests/layering-before-v038d1f.json`, `tests/layering-visual-delta.js`, ajout du branchement dans `tests/sectors-visual-delta.js`.

Exécution : `node --test tests/*.test.js`. Sortie complète : [full-tests.txt](production-v038d1f-projectile-layering/notes/full-tests.txt).

## Vérifications visuelles et limites du banc

- Chrome / WebGL aux formats **320 × 568** et **390 × 844** : 50 captures principales, avant/après, effets, télégraphes et scène dense.
- 36 parcours, **2 340 images de vol** contrôlées : trois armes, Secteurs 2 et 3 plaques, chacune des trois positions du dernier cas, deux vagues de Four à blanc, froid → chaud et chaud → froid. Chaque image conserve autant de sprites visibles que de projectiles actifs, tous à 10.
- Plusieurs rectangles traversés avec les portées nominales. Pour le départ froid choisi, le Shotgun atteint une plaque ; depuis la plaque, il en traverse deux. SMG et Grisou X traversent deux plaques dans les deux directions testées. Aucune portée n’a été augmentée pour le banc.
- Émissions par `Weapon.discharge`, déplacements par `Projectiles.update`, représentation par les renderers de production. Les phases de hazards sont gelées pour isoler l’ordre de composition. Les captures comparées conservent exactement les mêmes objets et hazards ; seul l’ordre historique est rétabli pour « avant ».
- Le Lampiste appartient aux Profondeurs : sa superposition sur la lave est un banc croisé utilisant son renderer, son propriétaire et ses paramètres réels. Cela n’ajoute aucun Lampiste à la Forge. Les petits hazards Chauffeur/Scorificateur/gaz utilisent des fixtures isolées de géométrie validée. Ce ne sont pas des changements de rencontres.
- Flashes des trois armes, impacts Shotgun/SMG/énergie/Rivet, Conduit et Arc contrôlés séparément. Flash réel du Riveteur et cinq tirs génériques de vapeur de Chaudron contrôlés en complément.
- Télégraphes Secteurs et Four à blanc capturés pendant la préparation, avec le héros sur une limite : contours dédiés au-dessus de lui, surfaces sous les tirs.
- Scène dense : 34 projectiles joueur, tirs hostiles, plusieurs personnages et trois plaques. Aucun nouveau chargement de texture, aucune particule ajoutée.

Mesure de composition sur ce poste : médiane **0,00655 ms**, 95e percentile **0,013 ms** ; **286 objets avant et après 40 000 passages** dans le banc dense. Ce n’est pas une mesure de performances Android. Aucun téléphone Android physique/APK n’a été exécuté dans cette session.

Trajectoires, collisions, vitesses, dégâts, cadences, cooldowns, patterns, timings, zones sûres et hitboxes : **sources strictement inchangées**, couvertes par la suite existante et le verrou des sources. Les tests de rendu n’introduisent pas de réglage gameplay.

## Livrables

- [Galerie locale](http://127.0.0.1:5237/production-v038d1f-projectile-layering/gallery.html)
- [Galerie sur disque](production-v038d1f-projectile-layering/gallery.html)
- [Banc interactif](http://127.0.0.1:5237/production-v038d1f-projectile-layering/observe.html)
- [Rapport navigateur](production-v038d1f-projectile-layering/notes/browser.json)
- [Contrôles complémentaires](production-v038d1f-projectile-layering/notes/extra.json)

Relancer le serveur depuis la racine : `node production-v038d1f-projectile-layering/server.mjs`.

Fin du correctif V0.38D.1F. Aucun commit, aucun push, aucun pattern suivant commencé.
