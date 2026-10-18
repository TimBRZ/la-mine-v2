# V0.38C.3 — Audit du Cracheur, Zone 4

Audit du 18 octobre 2026. Référence vérifiée : branche `main`, HEAD `e7053fb`, arbre Git propre avant intervention. Aucun code, test, asset ou réglage de production modifié. Deux livrables : ce rapport et la galerie facultative.

## Conclusion déterminante

**Le Cracheur (`spitter`) ne tire aucun projectile mobile.** Son unique attaque spéciale `spit` crée directement une **poche de gaz fixe au sol**, à la position du joueur verrouillée au début de la préparation, éventuellement rabattue dans l’arène. Elle est annoncée **1,3 s**, puis dangereuse **2 s**, de **rayon 38**, sans expansion.

Classification : **F — télégraphe**, puis **D — hazard au sol / E — gaz persistant**. Il possède également les dégâts de contact ordinaires (**G**). Aucun jet, cône, spray, salve, homing, projectile de gaz, Rivet B ou projectile Lampiste ne fait partie de son attaque.

Le futur chantier doit donc traiter **l’annonce et la présence d’une zone gazeuse**, pas fabriquer un projectile dont le comportement n’existe pas. La préparation est nécessaire au gameplay et compatible avec la règle du tir immédiat réservée aux projectiles purs.

## 1. Localisation précise

Racine de tous les chemins ci-dessous : `C:/LaMineV2/la-mine-v2-v01/`.

| Fichier relatif à cette racine | Responsabilité vérifiée |
|---|---|
| `src/zones.js:19` | Zone `rift`, La Faille de Grisou, roster incluant `spitter` |
| `src/rift/waves.js` | 20 vagues, composition, caps, gaz environnemental |
| `src/enemies/registry.js` | Création `RiftActor(id, 'spitter', x, y)`, texture initiale `spitter` |
| `src/rift/config.js:4` et `:22` | Statistiques du mob et pattern `spit` |
| `src/rift/actors.js` | `nextPattern`, `update`, `reposition`, `recover` |
| `src/rift/combat.js:48` | `RiftCombat.begin` : allocation de la zone, verrouillage de cible |
| `src/rift/combat.js:64` | `release` : retourne immédiatement `true` sans émission pour `spit` |
| `src/rift/combat.js:7` | `RiftGround.request/update/clear`, `riftHazardTouches` |
| `src/run.js:98`, `:166`, `:205`, `:234` | Admission des mobs, mise à jour des acteurs et hazards, dégâts du joueur |
| `src/enemy.js`, `src/player.js`, `src/config.js` | Warmup, contact, recul, rayon joueur et invulnérabilité |
| `src/projectile-attacks.js` | `isPureProjectile` : faux pour `spit` |
| `src/rift/art.js:24`, `src/combat-art.js` | `drawRift`, `dangerCircle`, couleurs et géométrie de l’effet |
| `src/arena-view.js` | Graphics de sol partagé, profondeur 8, effacé/redessiné chaque update |
| `src/enemies/view.js` | Corps du mob, label `GAZ !`, fallback et affichage des autres projectiles |
| `src/rift-animation.js` | Sélection des clips, lecture des phases, aucune commande de combat |
| `src/forge-animation.js`, `src/depths-animation.js` | Adaptateurs supérieurs déléguant les entités Rift |
| `src/rift-sprite-catalog.js:49` | Métadonnées de la sheet du Cracheur |
| `src/enemy-visual-frame.js` | Validation des frames, repli sur une frame idle moderne |
| `src/assets/enemies-v035b/spitter.svg` | Sheet réellement chargée : `enemy-v035b-spitter` |
| `v035a-r6-cracheur-final/master/cracheur-final.svg` | Master historique référencé par le catalogue, pas chargé comme VFX |
| `src/room-scene.js` | Préchargement et orchestration des vues de production |
| `src/enemy-rivet-vfx.js`, `src/lampist-projectile-vfx.js` | Familles voisines excluant le Cracheur |
| `src/shaft-actors.js`, `src/shaft-hazards.js` | Grisouteux/Sondeur et différences entre les zones 3 et 4 |

## 2. Attaques réellement exécutées

### `spit` — gaz au sol

| Propriété | Comportement réel |
|---|---|
| Condition | Mob vivant, warmup terminé, phase `positioning`, `phaseTime <= 0`, distance centre joueur/mob comprise entre 150 et 300 après repositionnement |
| Premier départ | Warmup d’apparition 1 s, puis positionnement initial 0,9 s (`slot=0` pour un mob normal), sous réserve de portée et de place dans le budget sol |
| Admission | Une entrée au sol ; refus si quatre entrées déjà occupées ou si cet owner en possède déjà une |
| Refus d’admission | Reste en positionnement, retente après 0,18 s ; ni attaque perdue ni zone invisible préallouée |
| Préparation | 1,3 s ; zone et label visibles dès l’admission ; mob immobile pendant `warning` |
| Fréquence nominale | 1,3 s de préparation + 1,6 s de recovery + 0,6 s de positionnement = environ 3,5 s entre débuts, soit ~0,286 attaque/s. Ce n’est pas un cooldown de projectile ; distance et budget peuvent allonger le cycle |
| Direction | `attackAngle` mémorisé, mais ne dirige aucune géométrie `spit` ; `shotAngles=[]` |
| Nombre / spread | Zéro tir ; une zone ; aucun spread |
| Vitesse / trajet | Aucun mobile, aucune vitesse de projectile, aucun parcours jusqu’à la cible |
| Durée dangereuse | `remaining=2`, décompté après activation, avec quantification aux ticks |
| Rayon / collision | Disque constant 38 ; collision stricte `distance < 38 + player.radius`. Avec le joueur de rayon 13 : distance strictement inférieure à 51 |
| Dégâts | 0,5 par dommage accepté par `Run.damagePlayer` |
| Tracking | Cible verrouillée une fois ; ni suivi du joueur, ni suivi du Cracheur, ni prédiction |
| Collision décor | Pas de collision de trajet, pas de test de ligne de vue ; seules les bornes de placement au sol sont appliquées |
| Fin | Retrait à expiration ou mort/disparition du propriétaire ; pas de VFX de trajet ou d’impact |

Le Cracheur conserve 82 PV, rayon corporel 18, vitesse de déplacement 68. Son repositionnement vise une distance de 180–235 avec déplacement latéral ; il recule en dessous, approche au-dessus. La recovery dure 1,6 s ; le déplacement reprend après 0,3 s de cette recovery, donc pendant que la poche est encore active. Aucun changement de pattern à bas PV.

### Contact corporel — G, autre

0,5 dégât au contact, sans préparation dédiée ni attaque animée spécifique. Somme des rayons = 31 pour le joueur standard. `Run.update` vérifie le chevauchement et le segment relatif entre positions précédentes/courantes (`sweptContact=true`). Dégâts soumis à la même invulnérabilité globale ; un contact accepté applique aussi un recul au mob. Ce n’est ni le gaz ni un projectile.

## 3. Hazard : création, dommages et nettoyage

`begin` appelle `ground.request(e.id, [player], {warning:1.3, duration:2, radius:38, kind:'gas'})` et copie les coordonnées. Pour `ROOM={left:28,right:422,top:116,bottom:666}`, le centre est limité à **x 78–372, y 166–616**. Aux bords, le centre ne coïncide donc pas nécessairement avec le joueur.

Le gaz est du **gameplay réel** ; les petits motifs internes sont uniquement décoratifs. Pas d’expansion, dérive, propagation, collision avec les autres ennemis, accumulation de poison ou ralentissement. La forme du danger est un disque, pas une masse de particules.

Il n’existe pas de timer autonome de « tick gaz ». La collision est évaluée à chaque update active et tente `damagePlayer(.5)`. Le joueur dispose de **1 s d’invulnérabilité globale** après un dommage accepté, partagée avec les autres sources. Bouclier et talents existants sont conservés. Deux zones superposées ne créent donc pas deux dommages acceptés dans la même frame.

**Détail de bord vérifié : ne pas promettre seulement deux ticks de dégâts.** `RiftGround.update` effectue le test de dommage avant le filtre final `remaining > 0`. Dans la fixture à 60 Hz, le joueur immobile reçoit 0,5 à 3,1667 s, 4,1667 s et 5,1667 s, puis la zone disparaît à 5,1833 s : trois dommages sont possibles avec cette quantification. Cela décrit le comportement existant, sans correction dans cet audit.

La présence d’un propriétaire vivant est vérifiée avant l’activation et les dégâts. Sa mort supprime aussi sa zone en préparation ou active à la mise à jour suivante ; un kill produit plus tôt dans le même `Run.update` annule ainsi le danger. `clear` retire toutes les zones, notamment au changement/nettoyage de vague. La fin de vie n’a ni fade-out ni nuage résiduel. Les corps morts peuvent encore disposer de leur animation de mort indépendante.

## 4. Télégraphes, timing réel et règle V0.38C.1c

| Signal | Moment / durée | Forme, couleur et rôle |
|---|---|---|
| Apparition du mob | Warmup 1 s | Anneau de rayon 26, couleur `#7fcbd3`, alpha de contour 0,8 ; corps à alpha 0,35 et anneau pulsant hors mode réduit. Annonce l’apparition, pas un tir |
| Zone `spit` en attente | À `begin`, 1,3 s configurée | Disque ambre `#ffc46b`, rayon 38, fond alpha 0,10, contour sombre puis liseré ambre ; marqueurs radiaux et centre. Télégraphe critique de la future zone dangereuse |
| `GAZ !` au-dessus du mob | `phase==='warning'` | Texte `#ffe0a5`, contour sombre ; prépare l’attribution de la menace au Cracheur |
| Danger actif | Après `h.warning <= 0`, 2 s configurées | Même emprise, corail `#ff795f`, fond alpha 0,22, bord net ; signal critique du danger actuel |

`dangerCircle` utilise un contour sombre de 6 unités à alpha 0,8 puis un contour coloré de 2,5 ; cercle intérieur à rayon 33 et alpha 0,4 ; huit repères radiaux ; croix centrale claire `#ffedd0` à alpha 0,85. `drawRift` ajoute un cercle vert `#92e8b0` de rayon 24,7, trait 2, alpha 0,5 avant activation et 0,9 après. L’état actif ajoute trois disques décoratifs fixes, alpha 0,09. Aucun bruit aléatoire, shader, blur, fumée animée ou particule permanente.

Le champ interne `label:'GRISOU !'` du hazard n’est pas dessiné par `drawRift`. Le texte réellement affiché près du mob vient de `riftLabel` : `GAZ !`. Aucun rayon de visée ni cône préparatoire : la boucle sur `shotAngles` ne dessine rien pour `spit`.

**Compatible avec V0.38C.1c :** `isPureProjectile(spitter,'spit') === false` car le pattern a `ground:1`, sans `count`. La préparation n’est pas une ancienne preview de projectile à retirer. La zone existe dès le début, inactive ; `release` n’alloue rien et passe simplement à la recovery.

### Trace mesurée à 60 Hz

Fixture : joueur fixe (225,480), Cracheur initial (225,250), warmup standard ; tir joueur neutralisé, PV de contrôle élevés ; `Run.update(1/60)` inchangé.

| Temps depuis début de fixture | Observation |
|---|---|
| 1,8833 s | `begin`, mob `warning`, zone créée ; son compteur vaut déjà 1,2833 après l’update sol du même tick |
| 3,1667 s | Zone active, premier dommage possible ; acteur encore en `warning`, temps restant 0,0167 |
| 3,1833 s | Acteur en `recovery`, sélection visuelle du clip attack |
| 4,8000 s | Acteur en `positioning`, poche encore active |
| 5,1833 s | Retrait de la poche |
| 5,4000 s | Nouvelle préparation, soit 3,5167 s entre débuts dans cette trace |

**Décalage d’un tick établi :** le timer du hazard décrémente dès sa création ; celui de l’acteur commence le tick suivant. À 60 Hz, activation du danger 16,7 ms avant la transition d’animation. Ne pas synchroniser ultérieurement les dégâts ou leur visibilité sur la seule fin du clip prepare.

## 5. Assets actuels et origine visuelle

**Aucun asset de projectile du Cracheur.** Dimensions, rotation, animation de vol, traînée et impact mobile : sans objet. Le disque est dessiné avec `Graphics`, sans texture ni sheet de gaz. Le pool hostile partagé a 24 entrées mais `spit` n’en consomme aucune. Rivet B et lumière du Lampiste excluent cet owner ; aucun passage par leurs fallbacks n’est nécessaire pour son attaque actuelle.

Le corps utilise `src/assets/enemies-v035b/spitter.svg`, clé `enemy-v035b-spitter`, **14 229 octets**, atlas **384×256**, cellules **64×64**, **19 frames**, six colonnes. Affichage **48×48 unités de jeu**, origine (0,5 ; 0,5), position locale (0,0), **aucun flip ni rotation**, quel que soit le joueur. Raster RGBA nominal : **393 216 octets / 384 KiB**, commun aux instances.

Une frame manquante peut être reconstruite/repliée vers l’idle moderne par `modernFrame`. Si la texture ou ses dimensions sont invalides, l’adaptateur retourne `false` et `updateEnemyView` restaure le corps historique, ici la texture procédurale **`spitter` 48×48** créée dans `riftTextures`. Ce fallback est distinct de la sheet moderne. Le danger au sol ne dépend pas de cette sheet. Aucun changement de fallback effectué.

### Buse et spawn

La buse du dessin pointe à droite, pièce `p10`, bord à **(110,72)** environ dans l’espace source **128×128** (ouverture verticale y63–81). Avec le rendu 48×48 centré, le centre du bord de sortie est **(enemy.x + 17,25 ; enemy.y + 3)**. La frame attack centrale translate les pièces `p10/p11/p12` de −2 unités source, soit **−0,75 unité de jeu en x**. Ce sont des mesures géométriques de l’art, **pas un socket existant**.

**Le spawn réel de l’attaque est le point au sol verrouillé**, pas la buse ni le centre du mob. Il n’existe ni « muzzle origin » du Cracheur, ni connexion dessinée entre buse et cible, ni événement de départ de projectile. Le sprite restant fixe vers la droite, un futur jet tourné librement vers le joueur entrerait en contradiction avec sa pose. Ne pas le masquer en inventant une trajectoire dommageable ou un délai de vol : cela changerait la lecture du gameplay. Un discret accent de pression à la buse serait seulement cosmétique et devrait suivre son petit recul.

## 6. Animation actuelle et futurs points de déclenchement

| Clip | Frames | Lecture actuelle |
|---|---|---|
| idle | 0–1, 3 fps, boucle | Repos, variations très faibles |
| move | 2–5, 9 fps, boucle | Déplacement |
| prepare | 6–8 | Avancement piloté par la proportion de `phaseTime` restante, pas par une durée fixe d’animation |
| attack | 9–11, 12 fps, boucle | Fenêtre visuelle de 0,25 s après sortie de warning ; bref recul de buse |
| recovery | 12–13, 7 fps, non bouclé | Retour puis dernière frame tenue ; cette sélection reste prioritaire même si le mob recommence à se déplacer |
| hit | 14, 18 fps | Réaction brève, soumise aux priorités prepare/attack |
| death | 15–18, 10 fps, non bouclé | Affaissement, nettoyage visuel séparé |

Il n’existe pas de clip `recoil` séparé : le recul est inclus dans attack. Le mode mouvement réduit conserve les premières frames pertinentes, sans changer les timers. Les animations lisent l’acteur ; elles ne déclenchent jamais la création du gaz.

Un futur VFX peut rester indépendant : lire l’apparition d’une entrée `ground.items` de `owner=spitter`, sa transition `active=false → true`, puis son retrait. Le danger visuel doit suivre **le hazard**, l’accent de buse peut suivre la présentation de l’acteur. Il n’existe pas d’événement `spit` dédié ; `rift-gas` concerne l’environnement, et le signal `noteProjectileEmission` ne s’exécute pas pour `spit`. Prévoir un état de présentation nettoyé à la mort/changement de run ; ne pas réarmer le combat depuis l’animation.

## 7. Vagues réelles et densité

Quantités ci-dessous = total programmé dans la vague, **pas nombre simultané**. R = Rampant ; C = Cracheur ; É = Éclateur ; G = Grisouteux (`gasminer`) ; S = Sondeur ; F = Foreuse autonome.

| Vague | R | C | É | G | S | F | Total | Cap tous mobs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 7 | 0 | 0 | 0 | 0 | 0 | 7 | 6 |
| 2 | 7 | 1 | 0 | 0 | 0 | 0 | 8 | 6 |
| 3 | 8 | 1 | 0 | 0 | 0 | 0 | 9 | 6 |
| 4 | 8 | 2 | 0 | 0 | 0 | 0 | 10 | 6 |
| 6 | 8 | 2 | 1 | 0 | 0 | 0 | 11 | 8 |
| 7 | 9 | 2 | 2 | 1 | 0 | 0 | 14 | 8 |
| 8 | 9 | 3 | 2 | 1 | 0 | 0 | 15 | 8 |
| 9 | 10 | 3 | 3 | 1 | 1 | 0 | 18 | 8 |
| 11 | 10 | 3 | 3 | 1 | 1 | 1 | 19 | 10 |
| 12 | 11 | 3 | 3 | 1 | 1 | 1 | 20 | 10 |
| 13 | 11 | 4 | 3 | 1 | 1 | 1 | 21 | 10 |
| 14 | 12 | 4 | 3 | 1 | 1 | 1 | 22 | 10 |
| 16 | 12 | 4 | 4 | 1 | 1 | 1 | 23 | 12 |
| 17 | 13 | 4 | 4 | 1 | 1 | 1 | 24 | 12 |
| 18 | 13 | 5 | 4 | 1 | 1 | 1 | 25 | 12 |
| 19 | 14 | 5 | 4 | 1 | 1 | 1 | 26 | 12 |

Aucun Cracheur dans les vagues boss 5, 10, 15 et 20. Cap `spitter:2` dans toutes les vagues normales, appliqué dans `Run.spawn`. Intervalle de groupe : 0,68 s, 0,53 s, 0,46 s, 0,39 s selon le quart de zone ; groupes de 2 puis 3. La file d’apparition peut attendre si le prochain type atteint son cap.

Plusieurs Cracheurs peuvent préparer/activer en même temps dès la vague 4 : aucune exclusivité pour `spit` (`major:false`), aucun déphasage imposé aux mobs. Ils ciblent souvent le même point si le joueur reste immobile. En jeu normal : **deux Cracheurs, donc au plus deux entrées de gaz du Cracheur** dans le budget global de quatre zones (préparations comprises). Les totaux 3, 4 ou 5 de certaines vagues correspondent à des remplacements après des morts.

Le sol ambiant est absent vague 1 ; ailleurs il commence avec `until=4`, puis intervalle 10/8/7/6 s. Deux points fixes par admission, warning 1,65 s, alternance explosion 0,55 s / gaz 2,2 s, rayon 40, owner 0. Il n’attaque pas pendant les boss. Une admission impossible est retentée après 0,5 s. Cela concurrence les zones des mobs et peut prolonger leur attente.

## 8. Partages à préserver

| Entité / système | Relation effective |
|---|---|
| Rampant `crawler` | Même classe/config et catalogue Rift, mais court-circuit dans `update` vers le déplacement/contact : n’utilise pas `spit`, ni gaz |
| Éclateur `burster` | Même `RiftGround` et même `dangerCircle` pour `blast` : rayon 58, warning 1,25 s, durée 0,5 s, type explosion. Sa mort avertit puis émet six projectiles ; système distinct du Cracheur |
| Fendeuse `splitter` | Fissures via le même gestionnaire, forme en bande ; ses autres attaques sont charge/salve |
| Souffleur `blower` | Poches explosives avec le même gestionnaire ; son `cone` est réellement une salve de cinq mobiles, contrairement à `spit` |
| Cœur `core` | Pluie de zones, orbes et salves ; mêmes budgets et fonctions partagées, pas même attaque |
| Gaz ambiant de Zone 4 | Même type `gas` et même rendu, owner 0, dimensions et durée différentes |
| Grisouteux / Sondeur en Zone 4 | `ShaftActor`, respectivement blast/impact, passent par `context.shaftAttack` et donc **le RiftGround de cette run**. Sans `kind` fourni, ils héritent du type `gas` par défaut : ne pas sélectionner un futur asset avec `h.kind==='gas'` seul |
| Zone 3 gaz/pression | `ShaftHazards`, classe séparée, logique analogue et primitives de danger partagées |
| Zones 5/6 | Réutilisent `RiftProjectiles`, mais leurs gestionnaires de sol sont distincts (`DepthsGround`, `ForgeGround`) |
| Rivet B / Lampiste | Allowlists dédiées ; aucun Cracheur, aucun gaz au sol dans ces familles |

**Attribution recommandée pour un futur rendu propre au Cracheur :** vérifier Zone 4 + owner vivant avec `riftType==='spitter'` + pattern/type cohérents. Ne pas appliquer une retouche globale à `dangerCircle` ou à toutes les entrées `gas`. Les corps modernes ont des sheets distinctes ; le fallback procédural spitter/blower partage une recette, pas la même clé de texture.

## 9. Performance : ordres de grandeur vérifiés

- **Projectiles du Cracheur : 0**, y compris en simultané. Pool hostile de run : 24, partagé avec les autres attaques ; ne pas le dimensionner pour du gaz fictivement mobile.
- **Sol : un objet par attaque acceptée**, aucun pool de hazards. Une entrée maximum par owner, quatre entrées globales, deux de Cracheur maximum dans les vagues actuelles.
- Durée d’une entrée `spit` : environ 3,3 s annonce incluse, raccourcie par la mort du propriétaire. En cadence nominale, deux Cracheurs créent environ 0,57 entrée/s au total.
- `RiftGround.update` produit deux tableaux filtrés par tick (environ 120 petits tableaux/s à 60 Hz), plus les points temporaires et objets créés à l’admission. Recherche des owners en O(zones × ennemis), bornes courantes 4 × 12. Pas d’optimisation dans cet audit.
- Un sprite de corps par Cracheur, donc deux en combat normal, plus ses objets de présentation (ombre, anneau, deux barres, label, container), et éventuellement des corps en animation de mort pendant leur courte retraite. **Zéro sprite supplémentaire pour le gaz** : un Graphics partagé au sol.
- Un disque représente environ 15 primitives géométriques en préparation, 18 actif, cercle vert compris. Quatre zones rondes actives : environ 72 primitives/frame, hors autres signaux. Les superpositions augmentent l’opacité, même sans nouvel objet sprite.
- Texture Cracheur unique 384 KiB RGBA nominal, pas une texture par instance. Les pools de sprites Rivet/Lampiste préexistants (24 chacun) sont généraux ; leurs sprites restent cachés pour le Cracheur.
- Rendu actuel sans filtres/halos ni nuage de particules. Le risque principal d’une future refonte est la **couverture des zones sûres** et l’overdraw de gaz transparent superposé, avant le nombre de projectiles.

Mesure par exécution inchangée : fixture solo 30 s → max **1 zone / 0 projectile** ; fixture deux Cracheurs 60 s → max **2 zones / 0 projectile**. Ces contrôles ne constituent pas un benchmark FPS sur téléphone Android. Les budgets globaux et la table de vagues complètent ces observations ; aucune fréquence d’images mobile matérielle n’est revendiquée.

## 10. Directions visuelles proposées — texte uniquement

1. **Poche de grisou basse et contenue — recommandée.** Préserver le cercle d’annonce et le bord actif ; quelques lobes plats verts désaturés à l’intérieur, centre assez transparent pour voir le sol. Zone persistante immédiatement identifiable, aucun déplacement simulé.
2. **Bouffée de pression au point verrouillé.** Très bref accent au moment de l’activation, puis poche sobre fixe. L’expansion éventuelle de l’accent reste cosmétique, à l’intérieur du rayon réel ; pas de faux impact après un temps de vol.
3. **Fuite sous pression avec témoin discret à la buse.** Petite réaction locale liée au Cracheur, associée à la poche au sol existante, sans rayon continu entre les deux. Plus coûteuse en attribution ; secondaire par rapport à la frontière dangereuse.

Pour la suite seulement : préparer séparément annonce, activation, maintien et extinction de présentation. Priorité absolue au rayon, au passage inactif/actif et à l’effacement immédiat si le propriétaire meurt. Ne pas rendre dommageable la liaison avec la buse, inventer un projectile, conserver une fumée après disparition du danger, ou retarder le danger pour attendre une animation.

## 11. Validation et livrables

- `npm test` exécuté sur la suite existante, sans édition des tests : **1 578 tests, 1 578 réussis, 0 échec, 0 ignoré**, durée rapportée 66,247 s. Les fixtures HTTP ont tourné hors sandbox. Aucun écart au baseline annoncé.
- Probes ponctuelles en mémoire, sans nouveau fichier de test : classification non projectile ; clamp aux bords ; aucun projectile après `release` ; refus d’un deuxième hazard du même owner ; collision stricte à distance 51 ; refus de la cinquième zone ; annulation à la mort ; nettoyage par `clear`.
- Galerie : `C:/LaMineV2/la-mine-v2-v01/production-v038c3-cracheur-audit/gallery.html`. Sept vues, uniquement atlas et fonctions de dessin existants. Une annotation de cible remplace le joueur pour l’audit ; ce n’est pas une capture d’une partie complète. Aucune fausse étape de vol n’est inventée. La fixture contient un/deux Cracheurs isolés avec le sol ambiant désactivé via la vague 1 existante ; ce n’est pas la composition naturelle de cette vague.
- Contrôle Chrome dans un profil temporaire, **320×568, 390×844 et 1120×950** : sept vues chargées, **aucune erreur console, aucun débordement horizontal**. Captures de contrôle temporaires hors dépôt ; aucun nouvel asset livré. La galerie recadre la zone jouable 450×550 ; elle sert à comparer les phases, pas à certifier l’échelle d’un plein écran de jeu.
- Aucun fichier suivi de gameplay, de rendu, de tests ou d’assets modifié. Le dossier de galerie est ignoré par la règle existante `production-*/` du `.gitignore` ; il est bien présent localement. Aucun changement du `.gitignore`, aucun staging.

## 12. Éléments à ne pas toucher dans la suite sans demande explicite

Préparation 1,3 s ; durée et ordre d’update du gaz ; rayon 38 ; dégâts et invulnérabilité ; clamp et verrouillage de cible ; contact ; récupération et repositionnement ; cap par owner/global et caps des vagues ; annulation à la mort ; distinction entre dangers d’acteurs et d’environnement ; animation et sheet validées ; identité/fallback des autres entités ; familles Rivet B et Lampiste.

**Audit terminé. Aucun nouveau VFX, aucune intégration, aucun commit/push. Arrêt avant création pour validation humaine.**
