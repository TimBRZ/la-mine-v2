# V0.38C.4 — Audit du Chauffeur, avant création VFX

Date : 18 octobre 2026. Projet : `C:/LaMineV2/la-mine-v2-v01`.
Audit uniquement de l’état courant, incluant les changements C.3 préexistants. Aucun changement de simulation, rendu, assets ou tests. Aucun commit/push.

## Conclusion qui doit guider la prochaine planche

**Le Chauffeur (`stoker`) chauffe à distance une plaque rectangulaire du sol. Il ne projette rien.** Son attaque `heat` choisit la plaque libre la plus proche du joueur, annonce cette plaque pendant **1,2 s**, puis la rend dangereuse pendant **2,3 s**, avant **0,3 s** de refroidissement inoffensif. La plaque ne suit ni le joueur ni le Chauffeur. Le contact physique du mob inflige également des dégâts.

Classification : **E — hazard au sol**, **H — télégraphe**, **G — contact**. L’effet est thermique et persistant au sens de D, mais ce n’est pas une flamme canalisée depuis l’arme. Aucun projectile A, spray B, cône C ou onde F n’est utilisé par ce mob. Le diffuseur du master ne décrit donc pas la géométrie de son attaque actuelle.

**Direction recommandée : plaque de métal surchauffée, rectangulaire, orange/rouge, à contour net.** Un jet reliant le diffuseur à la plaque ferait croire à un trajet dangereux qui n’existe pas.

## 1. Identité et chemins exacts

Les liens ci-dessous pointent vers les fichiers audités, sans les modifier.

| Fonction | Source |
|---|---|
| Zone `forge`, Les Forges Oubliées, roster et vagues | [src/zones.js](C:/LaMineV2/la-mine-v2-v01/src/zones.js), [src/forge/waves.js](C:/LaMineV2/la-mine-v2-v01/src/forge/waves.js) |
| ID `kind=stoker`, `forgeType=stoker`, création `createEnemy → ForgeActor` | [src/enemies/registry.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/registry.js) |
| Stats, pattern `heat`, caps, grille des plaques | [src/forge/config.js](C:/LaMineV2/la-mine-v2-v01/src/forge/config.js) |
| `nextPattern`, `update`, `reposition`, `recover` | [src/forge/actors.js](C:/LaMineV2/la-mine-v2-v01/src/forge/actors.js) |
| `ForgeCombat.begin`, `nearestPlates`, `release`, `ForgeGround.request/update` | [src/forge/combat.js](C:/LaMineV2/la-mine-v2-v01/src/forge/combat.js) |
| Collision et admission de sécurité `forgeTouches`, `forgeEscapeReport` | [src/forge/geometry.js](C:/LaMineV2/la-mine-v2-v01/src/forge/geometry.js) |
| Ordre des updates, contact balayé, dégâts/invulnérabilité | [src/run.js](C:/LaMineV2/la-mine-v2-v01/src/run.js), [src/enemy.js](C:/LaMineV2/la-mine-v2-v01/src/enemy.js), [src/player.js](C:/LaMineV2/la-mine-v2-v01/src/player.js), [src/config.js](C:/LaMineV2/la-mine-v2-v01/src/config.js) |
| Classification des projectiles immédiats | [src/projectile-attacks.js](C:/LaMineV2/la-mine-v2-v01/src/projectile-attacks.js) |
| Fond, plaque, télégraphe et label `PLAQUE CHAUDE` | [src/forge/art.js](C:/LaMineV2/la-mine-v2-v01/src/forge/art.js) |
| Graphics terrain et labels des acteurs | [src/arena-view.js](C:/LaMineV2/la-mine-v2-v01/src/arena-view.js), [src/enemies/view.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/view.js) |
| Petit effet décoratif de la buse | [src/forge-sprite-vfx.js](C:/LaMineV2/la-mine-v2-v01/src/forge-sprite-vfx.js) |
| Orchestration visuelle et feedback de dégâts générique | [src/room-scene.js](C:/LaMineV2/la-mine-v2-v01/src/room-scene.js), [src/effects.js](C:/LaMineV2/la-mine-v2-v01/src/effects.js) |
| Sélection et chargement des animations | [src/forge-animation.js](C:/LaMineV2/la-mine-v2-v01/src/forge-animation.js), [src/forge-animation-state.js](C:/LaMineV2/la-mine-v2-v01/src/forge-animation-state.js), [src/enemy-facing.js](C:/LaMineV2/la-mine-v2-v01/src/enemy-facing.js) |
| Catalogue et master approuvé | [src/forge-sprite-catalog.js](C:/LaMineV2/la-mine-v2-v01/src/forge-sprite-catalog.js), [v037a-chauffeur-final/master/chauffeur.svg](C:/LaMineV2/la-mine-v2-v01/v037a-chauffeur-final/master/chauffeur.svg) |
| Sheet actuelle, chargée via module SVG embarqué | [stoker-8552dc9c950b.js](C:/LaMineV2/la-mine-v2-v01/src/assets/enemies-v037c/stoker-8552dc9c950b.js), [stoker-8552dc9c950b.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/enemies-v037c/stoker-8552dc9c950b.svg) |
| Fallback statique approuvé | [stoker-8552dc9c950b-idle.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/enemies-v037c/stoker-8552dc9c950b-idle.svg) ; source également embarquée dans le catalogue |

Stats du mob : 80 PV, rayon 18, vitesse 84 unités/s, apparition annoncée 1 s, contact 0,5. Le sprite est affiché dans un cadre de **52 × 52 unités**, sans rotation libre, avec retournement horizontal stabilisé. Ces dimensions graphiques ne définissent pas sa collision.

## 2. Attaques réellement utilisées

### `heat` — plaque chaude

- **Déclenchement :** mob vivant, warmup terminé, timer `positioning` écoulé. `nextPattern()` renvoie toujours `heat` pour `stoker`. Aucun autre pattern offensif n’est sélectionné.
- **Cible :** `nearestPlates(1)` trie les 12 plaques fixes par distance au joueur au moment de l’admission ; les plaques déjà occupées sont exclues, y compris pendant leur refroidissement. Ce n’est pas exactement la position du joueur.
- **Portée :** aucun seuil de distance au Chauffeur, aucun test de ligne de vue ou de direction. Le danger peut être posé à l’autre bout de l’arène. La bande 175–255 unités de `reposition()` guide son déplacement ; **ce n’est pas une portée d’attaque**.
- **Admission :** une seule zone par propriétaire ; au plus 5 hazards au total et 3 hazards `heat`. Un flood fill vérifie un espace froid connecté et accessible. En cas de refus, pas d’attaque alternative du Chauffeur : nouvel essai après 0,18 s. Un refus peut donc reporter l’attaque indéfiniment selon l’espace disponible. Le candidat n’est pas remplacé automatiquement par la deuxième plaque la plus proche si la sécurité refuse la première.
- **Préparation :** 1,2 s. Le mob reste planté, la plaque est déjà réservée et dessinée.
- **Activation :** timer du hazard dans `ForgeGround.update()`. `release()` retourne simplement `true` pour `heat` ; il n’émet pas de projectile et ne crée pas la plaque à ce moment.
- **Danger :** 2,3 s configurées. Test de collision chaque update. Chaque appel accepté inflige 0,5 PV, avec l’invulnérabilité globale du joueur de 1 s. **Aucun compteur de hits propre à la plaque.** Sans protection ni autre source, rester dedans produit jusqu’à 3 hits, soit 1,5 PV ; 3 hits observés à 60 Hz. Les dégâts de plusieurs plaques ne s’additionnent pas simultanément à travers l’invulnérabilité.
- **Après :** 0,3 s de refroidissement sans dégâts. La zone reste réservée et compte dans les caps jusqu’à suppression. Si le propriétaire meurt, sa zone disparaît au prochain update du ground, y compris avant activation.
- **Orientation / tracking :** rectangle aligné avec le sol, sans rotation ; cible verrouillée à l’admission. `attackAngle` est mémorisé vers le joueur pour la présentation, mais ne dirige pas la plaque.

### Contact du corps

Le Chauffeur inflige 0,5 PV par contact accepté pendant toute sa vie active, indépendamment de `heat`. Collision circulaire : distance des centres ≤ 18 + rayon joueur, donc **31 unités** avec le joueur de base. `sweptContact=true` ajoute le balayage relatif du segment de déplacement pour éviter les traversées entre frames. Même invulnérabilité globale de 1 s ; pas de cooldown ou de télégraphe de contact spécifique. Le warmup d’apparition empêche le contact tant que le mob n’est pas actif. Le feedback de blessure est générique, décrit plus bas.

## 3. Géométrie exacte et portée

Grille : centres `x ∈ {110,225,340}` et `y ∈ {210,340,470,600}`. Chaque plaque mesure **76 × 88**, soit demi-largeur 38 et demi-hauteur 44. Pas de rayon offensif, de cône, d’angle d’ouverture ni de trajet entre mob et plaque.

Le test réel est :

```js
Math.abs(player.x - h.x) < h.w / 2 + player.radius
&& Math.abs(player.y - h.y) < h.h / 2 + player.radius
```

Avec rayon joueur 13 : zone des **centres de joueur** touchés = rectangle ouvert **102 × 114**, seuils stricts `< 51` et `< 57`. Il s’agit d’une expansion rectangulaire conservatrice, même aux coins, et non d’un test exact cercle/rectangle. Le champ hérité `radius:36` existe sur l’objet mais est **ignoré** par la branche `shape==='plate'` : ne pas dessiner un disque de rayon 36.

Le contour futur doit représenter la surface 76 × 88, en tenant compte du rayon du héros pour l’esquive ; l’agrandir à 102 × 114 ferait croire que la surface dangereuse elle-même a changé.

Expérience d’admission éloignée : Chauffeur `(46,134)`, joueur et plaque `(340,600)`, distance entre centres **550,992 unités**, admission acceptée. Cette distance n’est pas un paramètre de portée : elle illustre l’absence de plafond. Une position extrême du joueur peut être refusée par la sécurité d’échappement ; ce refus ne prouve pas une limite de portée.

## 4. Timings, fréquence et synchronisation

| Étape | Durée / comportement |
|---|---|
| Apparition | 1 s de warmup ; acteur non actif |
| Premier positionnement | 0,8 s (`slot=0` dans la factory normale) |
| Préparation de `heat` | 1,2 s |
| Danger de la plaque | 2,3 s |
| Recovery du mob | 1 s après `release`, chevauche le danger |
| Mobilité pendant recovery | reprend après `recoveryElapsed > 0,18 s` |
| Positionnement suivant | 0,5 s, puis réessais toutes les 0,18 s si la plaque précédente existe encore |
| Refroidissement de la plaque | 0,3 s, inoffensif mais réservant encore son slot |

Il n’existe pas un simple cooldown de 1 s entre deux attaques. La réservation par propriétaire impose au moins environ **3,8 s entre admissions**, puis intervient la cadence des réessais et la quantification en frames. Sur 60 s à 60 Hz, un Chauffeur isolé sans concurrence a admis 15 attaques, **une toutes les 4,0 s**. Des caps occupés ou un refus de sécurité ralentissent cette cadence ; ils ne l’accélèrent pas.

Trace mesurée avec warmup naturel : admission à 1,783 s, danger à 2,967 s, recovery du mob à 2,983 s, retour au positionnement à 3,983 s, refroidissement à 5,283 s, suppression à 5,600 s, admission suivante à 5,783 s. Les fractions de frame et arrondis flottants expliquent l’écart avec les durées nominales : ne pas utiliser ces mesures comme nouveaux paramètres.

**Décalage existant à préserver/documenter :** le hazard consomme son premier `dt` lors de la frame où il est créé, tandis que `phaseTime` du mob vient d’être assigné. À 60 Hz la plaque devient active une frame avant le passage `warning → recovery` du mob. Ensuite, l’animation d’attaque se termine bien avant la plaque. Le futur VFX doit lire **`h.active`, `h.warning`, `h.remaining`, `h.cooling` et `h.owner`**, et non déduire le danger du clip de l’acteur. Aucun timer parallèle de dégâts ou d’activation ne doit être ajouté.

## 5. Rendu actuel : nature, couleurs et dimensions

Tout le danger est **procédural Phaser Graphics** dans `drawForge`. Aucun sprite VFX, SVG d’attaque, projectile générique, fumée, flamme animée ou émetteur de particules ne représente la plaque.

| Élément | Rendu exact |
|---|---|
| Plaque de fond | rectangle arrondi 76 × 88, rayon de coin 4 ; fond `#343a3e`, contour 2 `#101b22`, 4 rivets de rayon 2 `#788083` ; inclus dans la texture d’arène 450 × 800 |
| Préparation | même rectangle, `#ffd58c`, alpha `0,08 + 0,17 × (1 − warning/warningTotal)` ; contour 2 opaque ; 3 hachures de longueur horizontale 42, trait 2, alpha 0,9 ; 3 traits de chaleur `#ffefc9`, trait 2 |
| Active | rectangle 76 × 88, `#ff8050`, alpha 0,35 ; contour 4 opaque ; mêmes hachures et pictogramme thermique ; sans boucle d’animation de flamme |
| Refroidissement | rectangle `#8eb5b9`, alpha 0,12 ; contour 2 opaque ; hachures alpha 0,3 ; pictogramme thermique supprimé ; durée 0,3 s |
| Label du mob | `PLAQUE CHAUDE`, 11 px gras, `#ffe0a5`, contour sombre `#17282e` de 3 ; seulement pendant `warning` |
| Petit point près du diffuseur | disque `#d9844d`, rayon `2 + 2t`, alpha `(1−t) × 0,4`, `t=elapsed/0,18` ; seulement pendant les premières 0,18 s d’un hazard actif du propriétaire |

Plaques/télégraphes : Graphics de profondeur 8. Point décoratif : Graphics de profondeur 7, sous les plaques et les acteurs (15). En mouvement réduit, le point est supprimé ; le danger au sol reste dessiné. Aucun atlas d’attaque à charger, donc aucune dépendance à une frame VFX manquante pour lire la plaque.

**Retour de dégâts partagé :** quand `damagePlayer` produit `hurt`, `RoomScene` applique un flash écran rouge alpha 0,12, un tint/feedback héros, 4 particules génériques `#ffba85` (0,15–0,35 s), un anneau `#ff9576` (0,22 s), et un shake de 100 ms hors mouvement réduit. Ce feedback est celui du joueur blessé, pas une attaque supplémentaire du Chauffeur. Les particules réutilisent le pool global `Effects` de 48 entrées.

### Hitbox vs image

La surface et l’orientation du rectangle courant correspondent globalement aux dimensions physiques de la plaque. Détails : le contour actif déborde de 2 unités de part et d’autre de son tracé, et les coins arrondis ne montrent pas les coins carrés du test de collision. Le corps du joueur peut être touché alors que son centre est hors du contour ; l’expansion rectangulaire des coins est particulièrement conservatrice. Ne pas conclure à un rayon invisible de flamme autour du Chauffeur.

La plaque est lisible dans les captures aux deux formats. La relation visuelle **Chauffeur → plaque éloignée** est faible : le petit point de buse ne l’explique pas. Aux bords, le label `PLAQUE CHAUDE` peut être partiellement coupé, constaté à gauche en 320 px ; le contour au sol reste visible. Ce constat n’a pas été corrigé dans cet audit.

## 6. Origine du danger et du décor de buse

**Danger réel et VFX principal : au sol, au centre de la plaque choisie.** Aucune naissance à la buse, aucun départ au centre du mob, aucune propagation intermédiaire, aucune trajectoire testée contre les obstacles.

Le point décoratif utilise `(e.x + 19 × facing, e.y + 5)`, où `facing` vaut ±1 selon le cosinus de `chargeAngle ?? attackAngle ?? angle`. Il n’utilise ni socket de buse, ni rotation complète selon l’angle, ni transform de la main/outillage animé. L’outil du sprite pivote pendant prepare/attack ; le point n’en suit pas précisément l’extrémité. De plus, le sprite applique `mobileFacing` avec une zone morte autour des directions verticales, tandis que le point utilise le seul signe du cosinus : les côtés peuvent différer près de la verticale. Il ne s’agit pas d’un mauvais spawn de projectile puisqu’aucun projectile n’existe ici.

Le futur effet principal doit rester attaché au hazard. Une éventuelle correction de l’accent de buse serait un travail visuel séparé, non réalisé ici ; elle ne doit pas créer un lien offensif fictif jusqu’à la plaque.

## 7. Télégraphes à conserver et règle des projectiles

1. **Apparition 1 s :** sprite atténué, anneau de rayon 26 (`radius+8`) `#ffa66b`, contour 2 alpha 0,8, variation d’échelle hors mouvement réduit. Pas de dégâts avant `active`.
2. **Plaque 1,2 s :** rectangle jaune pâle de plus en plus rempli, contour/hachures et label sur le mob. C’est l’avertissement permettant de quitter la future surface chaude. Il doit rester visible pendant toute la préparation admise.
3. **Orange actif :** signale que les dégâts sont possibles ; **refroidissement bleu-gris** : signale leur fin. Ne pas prolonger l’orange dangereux après `active=false`.

`isPureProjectile(stoker,'heat')` est faux : `ground=1`, aucun `count`, aucun projectile émis dans `release`. **La règle V0.38C.1c de tir immédiat ne s’applique pas.** Retirer les 1,2 s changerait le gameplay et supprimerait une fenêtre d’esquive nécessaire. Le pattern `jet` existe dans l’ancien catalogue Forge mais n’est jamais sélectionné par `stoker`.

## 8. Animations existantes

Sheet V0.37C : 34 frames, cellules 64 × 64, atlas 512 × 320, affichage 52 × 52. Aucun nouveau sheet créé.

| Clip | Frames | Pilotage |
|---|---|---|
| idle | 0–3 | boucle 5 fps, lorsqu’immobile hors phases prioritaires |
| move | 4–11 | boucle 10 fps, déplacement détecté |
| prepare | 12–16 | progression de `phaseTime` / durée de préparation ; pas un timer d’attaque autonome |
| attack | 17–20 | signal visuel de 0,26 s après transition warning → recovery ; progression normalisée, fps nominal 14 |
| recovery | 21–24 | progression de `recoveryElapsed / 1 s` après le bref clip attack |
| hit | 25–26 | 16 fps, feedback bref autorisé hors warning/charge |
| death | 27–33 | 12 fps, extinction du corps |

Le hazard peut donc être actif pendant `prepare` durant une frame, pendant `attack`, puis `recovery`, puis `move`. L’animation n’appelle aucun callback de dégâts. Fallback : atlas contrôlé par identité/empreinte ; master statique vérifié si atlas absent, acteur masqué si aucun master vérifié. Le dessin de la plaque ne dépend pas de ces fallbacks.

## 9. Densité réelle de Zone 6

Comptages extraits de `FORGE_WAVES`, **totaux de vague**, distincts des caps simultanés :

| Vague | Chauffeurs | Riveteurs | Scorificateurs | Cap Chauffeurs | Cap mobs total |
|---|---:|---:|---:|---:|---:|
| 1 | 5 | 0 | 0 | 2 | 5 |
| 4 | 3 | 2 | 6 | 2 | 5 |
| 6 | 4 | 4 | 7 | 2 | 8 |
| 7 | 4 | 5 | 8 | 2 | 8 |
| 8 | 5 | 5 | 9 | 2 | 8 |
| 9 | 5 | 6 | 10 | 2 | 8 |
| 11 | 6 | 6 | 11 | 3 | 10 |
| 12 | 6 | 7 | 12 | 3 | 10 |
| 13 | 7 | 7 | 13 | 3 | 10 |
| 14 | 7 | 8 | 13 | 3 | 10 |
| 16 | 8 | 8 | 15 | 3 | 12 |
| 17 | 8 | 9 | 16 | 3 | 12 |
| 18 | 9 | 9 | 17 | 3 | 12 |
| 19 | 9 | 10 | 18 | 3 | 12 |

Aucun Chauffeur aux vagues 2, 3, 5, 10, 15, 20. Les vagues 5/10/15 ont respectivement Maître de Four / Marteau-Pilon / Chaudière ; la 20 réunit ces trois boss, sans mobs Chauffeurs.

Spawn configuré : groupes 2 toutes les 0,60 s aux vagues 1–4 ; groupes 4 toutes les 0,45 s aux 6–9 ; groupes 4 toutes les 0,35 s aux 11–14 ; groupes 5 toutes les 0,27 s aux 16–19. Les caps et la séquence limitent ces émissions.

**Maximum : deux attaques de Chauffeurs concurrentes avant la vague 11, trois ensuite**, chacune pouvant être en annonce, active ou refroidissement. Trois actives réellement observées sur trois plaques distinctes `(225,470)`, `(110,470)`, `(340,470)`. Au débit isolé mesuré de 4 s/cycle, l’ordre de grandeur est 0,5 ou 0,75 admission/s pour 2 ou 3 Chauffeurs, avec regroupements possibles et ralentissements dus à la concurrence. Ce n’est pas une garantie de cadence constante en combat.

Les Scorificateurs consomment aussi le budget `heat`. Le décor de Zone 6 réserve une plaque `owner=0` : première tentative après 5 s, warning 1,3 s, actif 2,3 s ; intervalle après succès 13 s en vague 4, 10 s en 6–9, 8 s en 11–14, 6,5 s en 16–19. Réessai après refus 0,65 s. Cette concurrence peut réduire le nombre de zones de Chauffeurs admises. Elle n’autorise jamais un quatrième hazard `heat`.

## 10. Réutilisations avec mobs et boss

- **Riveteur :** même `ForgeActor`, même couche d’animation et Graphics décoratif. Ses vrais projectiles utilisent le pool `RiftProjectiles` et leur renderer spécifique ; aucune émission de ce pool par le Chauffeur.
- **Scorificateur :** même acteur et `ForgeGround`, mais `scorch` est une ruée/traînée en ligne ; partage caps de chaleur et sécurité. Ne pas lui appliquer une plaque à la place de sa ligne.
- **Chaleur du décor :** même branche de dessin `plate` que le Chauffeur. Une future intégration doit filtrer explicitement le propriétaire vivant `stoker` si elle doit cibler uniquement ce mob.
- **Trois boss :** issus de `ForgeDungeonBoss`, sélection normale via `ForgeBossDirector`, avec leurs kits V0.37B. Ils partagent `ForgeGround.update`, `forgeTouches`, les limites globales et `ForgeSpriteVfx`. Leurs hazards `dungeon` sont dessinés par `drawDungeonHazard`, pas par la branche générique de plaque du Chauffeur.
- Les anciens patterns `plates`, `jet`, `general`, etc. restent présents pour compatibilité/diagnostics. Ils ne constituent pas le kit normal des boss actuels ni des attaques cachées du Chauffeur.

Sources spécifiques : [dungeon-boss.js](C:/LaMineV2/la-mine-v2-v01/src/forge/dungeon-boss.js), [boss-director.js](C:/LaMineV2/la-mine-v2-v01/src/forge/boss-director.js), [boss-patterns.js](C:/LaMineV2/la-mine-v2-v01/src/forge/boss-patterns.js), [boss-view.js](C:/LaMineV2/la-mine-v2-v01/src/forge/boss-view.js), [rift/combat.js](C:/LaMineV2/la-mine-v2-v01/src/rift/combat.js).

## 11. Performance actuelle — ordre de grandeur

- **VFX offensif Chauffeur : 0 sprite supplémentaire, 0 emitter, 0 particule persistante.** Un objet hazard par attaque admise ; pas de pool pour ces objets, supprimés à expiration ou mort du propriétaire. Durée nominale totale 3,8 s.
- Deux Graphics **partagés**, créés une fois : plaques (ArenaView) et accents Forge (ForgeSpriteVfx), effacés/redessinés à chaque frame. Par plaque : 8 primitives géométriques pendant warning/actif, 5 au refroidissement. Trois plaques : environ 24 primitives, plus au plus 3 petits disques décoratifs pendant 0,18 s. Cap décoratif global Forge : 48 primitives par update, toutes entités confondues.
- Chaque Chauffeur dispose d’une image corps et des éléments de vue existants : ombre, anneau d’apparition, deux barres de santé, label, container. L’atlas animé est partagé : 655 360 octets RGBA théoriques (640 KiB), 139 995 caractères/octets ASCII de SVG, module de 150 742 octets. Le fallback 64 × 64 représente 16 KiB RGBA théoriques. Ces chiffres ne sont pas une mesure complète de mémoire GPU.
- `ForgeGround.update()` produit deux tableaux filtrés par update. Le décor Forge filtre les hazards par acteur actif ; pas de cache/pool de ces petits tableaux. `begin()` crée notamment un Set de propriétaires, des tableaux de tri/filtrage et une liste de candidats. `forgeEscapeReport()` construit **330 cellules** sur une grille de pas 24, un Set de parcours et des tableaux voisins temporaires : l’ordre de grandeur est des centaines de petits objets à chaque admission qui atteint cette vérification. Les refus pour cap/propriétaire sortent avant le flood fill. Aucune optimisation réalisée.
- Pool de projectiles Forge hérité de Rift : 24 entrées partagées, mais **0 projectile Chauffeur** observé pendant les 60 s de simulation isolée. Les valeurs `projectiles` et caps de rush/major ne transforment pas `heat` en tir.
- Mesure Chrome desktop headless, trois plaques actives et trois accents frais, 60 lots de 100 appels `ArenaView.update + ForgeSpriteVfx.update`, état figé : médiane environ **0,004 ms/appel**, p95 des moyennes de lots **0,006 ms** en 320 et **0,007 ms** en 390 ; maximum de ces moyennes 0,011 / 0,012 ms. Nombre d’entrées de premier niveau de la liste de scène stable à **222 avant/après** dans ce banc ; les enfants des containers ne sont pas comptés séparément. Ce chronométrage mesure la construction CPU des commandes, **pas le rendu GPU, le framerate réel ou les performances Android** ; le banc ne démontre pas l’absence d’allocations JavaScript temporaires.

## 12. Trois directions textuelles pour la prochaine planche

1. **Plaque métallique surchauffée — recommandée.** Conserver le rectangle 76 × 88 et son annonce jaune ; passer à un aplat orange/rouge net avec quelques fentes internes claires pendant le danger ; refroidissement désaturé. Lecture du bord prioritaire, centre assez transparent pour voir le joueur.
2. **Nappe thermique rectangulaire basse.** Quelques masses chaudes courtes contenues dans la plaque, contour invariable, très peu de variation interne. Aucun feu haut, débordement, fumée ou halo masquant les zones sûres.
3. **Grille de forge incandescente.** Trois grandes bandes internes et un liseré de danger ; la variation de température est exprimée par la couleur, sans particules. Solution la plus sobre en présence de trois Chauffeurs et de Scorificateurs.

Les trois directions restent des **hazards fixes du sol**, pas des familles de projectiles. Si une sheet est retenue ensuite, la boucler uniquement pendant `h.active`, l’arrêter immédiatement au refroidissement ou à la disparition du propriétaire, et conserver un contour procédural de secours indépendant des frames. La préparation doit couvrir les 1,2 s existantes et ne pas déclencher le hazard elle-même. Aucun asset, animation ou sheet n’a été produit pour ces propositions.

## 13. Validation, livrables et limites

- **Suite existante : 1 610 / 1 610 réussis**, 0 échec, 0 ignoré, 54 960,6901 ms. Aucun test ajouté ou modifié pour cet audit. Log conservé dans `production-v038c4-chauffeur-audit/notes/tests.txt`.
- Mesures de simulation dans [notes/simulation.json](C:/LaMineV2/la-mine-v2-v01/production-v038c4-chauffeur-audit/notes/simulation.json), relevés navigateur dans [notes/browser.json](C:/LaMineV2/la-mine-v2-v01/production-v038c4-chauffeur-audit/notes/browser.json).
- [Galerie](C:/LaMineV2/la-mine-v2-v01/production-v038c4-chauffeur-audit/gallery.html) : huit états × deux formats, captures **320 × 568 et 390 × 844**, sans nouvel asset artistique. Repos, préparation, première frame dangereuse, actif, reprise de déplacement, refroidissement, grande distance, trois Chauffeurs.
- Captures issues d’un banc isolé utilisant les classes et renderers de production. Il suspend les tirs du héros et les apparitions supplémentaires, étend les PV du héros, retire l’attente initiale d’apparition pour faciliter l’observation ; il n’écrit aucune sauvegarde. Le scénario de portée appelle directement `begin()` à des positions connues. Ce ne sont pas des captures d’une partie Android ni une traversée complète des vingt vagues.
- Aucun débordement horizontal de page dans les 16 états capturés ; aucune erreur JavaScript/console ni ressource HTTP en échec dans la passe finale. L’erreur initiale de montage du HUD du banc a été corrigée **dans la page d’audit uniquement** avant cette passe.
- Les rectangles restent identifiables aux deux formats. En jeu FIT 450 × 800, ils font environ **54 × 62,5 px** en 320 × 568, et **65,9 × 76,3 px** en 390 × 844. Le second format comporte des marges verticales ; ne pas confondre unités monde et pixels CSS.

## 14. Éléments à ne pas toucher

Conserver `heat`, ses 1,2 / 2,3 / 0,3 s, dégâts 0,5, invulnérabilité, collision rectangulaire, contact balayé, sélection des plaques, absence de portée/ligne de vue, admission de sécurité, caps, suppression à la mort, phases de mobilité et cooldowns. Conserver les masters/sheets validés et le kit de chaque autre mob/boss. Ne pas appliquer la règle des projectiles immédiats au Chauffeur.

Les changements C.3 déjà présents dans le checkout ont été laissés en place. La comparaison SHA-256 du dossier `src` et des fichiers `tests` entre début et fin de cet audit est consignée dans `notes/integrity.json`. Les seuls livrables nouveaux de ce chantier sont ce rapport et le dossier d’audit (galerie, banc, mesures et captures).

**Arrêt après audit. Aucune création d’asset, intégration, modification gameplay, commit ou push.**
