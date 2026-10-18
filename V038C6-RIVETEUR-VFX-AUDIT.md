# V0.38C.6 — Audit du Riveteur, Zone 6

Audit du 18 octobre 2026. **Aucune intégration, aucun asset créé, aucun code de production ni test modifié, aucun commit/push.** Les changements C3/C4/C5 déjà présents sont conservés. Les validations Android C3/C4/C5 annoncées par l’utilisateur sont prises comme contexte acquis ; les contrôles de cet audit sont des simulations et captures navigateur.

## Conclusion

Le Riveteur tire un **rivet unique** (`rivet`) avant la vague 11 et un **éventail simultané de trois rivets** (`rivets`) dès la vague 11. Tous ces projectiles utilisent bien **Rivet B** lorsque l’atlas et l’identité du propriétaire sont disponibles. Aucun projectile spécial, salve temporisée, radial, hazard ou arc de coupe propre au Riveteur.

Le défaut visuel utile à traiter ensuite est le **raccord bouche / départ / étincelles**, pas le design du projectile : la bouche dessinée est vers `(±13,6 ; +2,7)` au début du tir, les étincelles vers `(±22 ; +5)`, et le projectile apparaît à 23 unités du centre selon l’angle de visée. Le sprite a seulement un miroir gauche/droite ; il ne tourne pas avec le tir. Un changement de côté au tick de l’émission peut également conserver l’ancien miroir.

Le départ possède déjà deux petits traits procéduraux. Un nouvel asset de flash n’est donc pas indispensable avant correction d’ancrage. Il n’existe **aucun impact métallique propre au Rivet** : le joueur reçoit son feedback générique de dégâts ; mur, portée et suppression n’ajoutent rien. Un futur impact compact devrait être **commun à la famille Rivet B**, avec raccordements de muzzle adaptés à chaque entité.

Priorités : **P0 raccord visuel et miroir au tir**, **P1 impact commun compact**, **P2 nouveau flash ou amplification du recul**, **aucune refonte de Rivet B**.

## 1. Identité et chemins exacts

Racine : `C:/LaMineV2/la-mine-v2-v01/`. ID `riveter`, `kind='riveter'`, `forgeType='riveter'`, monde `forge`. Mob normal : 76 PV, rayon 17, vitesse de déplacement 88, warmup d’apparition 1 s, contact 0,5.

| Responsabilité | Chemin exact |
|---|---|
| Enregistrement de l’ennemi | `C:/LaMineV2/la-mine-v2-v01/src/enemies/registry.js` |
| Phases, déplacement, sélection des tirs | `C:/LaMineV2/la-mine-v2-v01/src/forge/actors.js` |
| Paramètres des attaques | `C:/LaMineV2/la-mine-v2-v01/src/forge/config.js` |
| Admission, éventail, émission | `C:/LaMineV2/la-mine-v2-v01/src/forge/combat.js` |
| Pool et spawn hérités | `C:/LaMineV2/la-mine-v2-v01/src/rift/combat.js` |
| Déplacement, collision, expiration | `C:/LaMineV2/la-mine-v2-v01/src/enemy-projectiles.js` |
| Tir immédiat, garde de proximité, signal d’animation | `C:/LaMineV2/la-mine-v2-v01/src/projectile-attacks.js` |
| Vagues et caps | `C:/LaMineV2/la-mine-v2-v01/src/forge/waves.js` |
| Ordre de simulation et dégâts | `C:/LaMineV2/la-mine-v2-v01/src/run.js` |
| Mapping, atlas et pool Rivet B | `C:/LaMineV2/la-mine-v2-v01/src/enemy-rivet-vfx.js` |
| Rendu des projectiles / fallback | `C:/LaMineV2/la-mine-v2-v01/src/enemies/view.js` |
| Étincelles du Riveteur | `C:/LaMineV2/la-mine-v2-v01/src/forge-sprite-vfx.js` |
| Exclusion des previews de tirs purs | `C:/LaMineV2/la-mine-v2-v01/src/forge/art.js` |
| Catalogue des sprites validés | `C:/LaMineV2/la-mine-v2-v01/src/forge-sprite-catalog.js` |
| Chargement / fallback du mob | `C:/LaMineV2/la-mine-v2-v01/src/forge-animation.js` |
| Sélection des animations | `C:/LaMineV2/la-mine-v2-v01/src/forge-animation-state.js` |
| Miroir stable / bande morte | `C:/LaMineV2/la-mine-v2-v01/src/enemy-facing.js` |
| Feedback joueur touché | `C:/LaMineV2/la-mine-v2-v01/src/room-scene.js` |
| Pool des effets génériques | `C:/LaMineV2/la-mine-v2-v01/src/effects.js` |
| Textures génériques spark/ring | `C:/LaMineV2/la-mine-v2-v01/src/textures.js` |
| Atlas Rivet validé | `C:/LaMineV2/la-mine-v2-v01/src/assets/enemy-rivet-v038c1/rivet-v1.svg` |
| Sheet Riveteur runtime | `C:/LaMineV2/la-mine-v2-v01/src/assets/enemies-v037c/riveter-9ede66237e67.svg` |
| Module de la même sheet | `C:/LaMineV2/la-mine-v2-v01/src/assets/enemies-v037c/riveter-9ede66237e67.js` |
| Fallback statique validé du mob | `C:/LaMineV2/la-mine-v2-v01/src/assets/enemies-v037c/riveter-9ede66237e67-idle.svg` |
| Master du mob, lecture seule | `C:/LaMineV2/la-mine-v2-v01/v037a-riveteur-final/master/riveteur.svg` |
| Rig offline existant, non exécuté | `C:/LaMineV2/la-mine-v2-v01/production-v037c/rig.mjs` |

Les anciennes sheets `ed444c147ba0` et `d950c9ffcbca` présentes sur disque ne sont pas la référence sélectionnée par le catalogue actuel. Aucun nouvel asset n’a été produit pour cet audit.

## 2. Attaques réellement utilisées

| Classe | Code / condition | Nombre / dispersion | Vitesse, portée et dégâts |
|---|---|---|---|
| A — standard | `rivet`, vague < 11 | 1, axe exact vers le joueur | 165 u/s, 350 unités parcourues, 0,5 |
| B — éventail | `rivets`, vague ≥ 11 | 3 simultanés : −0,17 / 0 / +0,17 rad, ouverture totale 0,34 rad ≈ 19,48° | Idem pour les trois |
| F — contact | Corps actif du mob | Cercle de rayon 17 ; collision relative balayée | 0,5, invulnérabilité joueur existante 1 s |
| C / D / E / G / H | Salve, radial, spécial, hazard, autre | Aucun pattern utilisé par ce mob | Les patterns de boss du même fichier ne lui appartiennent pas |

Ciblage : position du joueur au moment de l’admission, sans anticipation de vitesse. Chaque direction est ensuite fixe ; aucun homing ni reciblage en vol. Le spread est un éventail spatial, **pas trois tirs espacés dans le temps**.

Collision projectile : disque de rayon 4, testé par segment relatif contre le joueur de rayon 13, rayon combiné 17. Pas de pénétration, rebond, explosion, effet de zone ni dégât au sol. Le projectile est consommé au contact même si l’invulnérabilité bloque les dégâts. Les plaques du décor dessiné ne sont pas des obstacles pour lui : l’update vérifie le joueur, la portée et les quatre limites `ROOM`.

### Cadence et tir immédiat

La valeur `warning:1.1` reste déclarée dans la configuration historique. Elle **n’ajoute pas 1,1 s avant le tir** : `isPureProjectile` rend la phase warning immédiatement éligible à release dans le même update. Le label et les previews sont également exclus par ce prédicat.

Cycle nominal après émission : recovery **1,1 s**, puis positioning **0,5 s**, soit **1,6 s minimum** hors discrétisation et blocage. Déplacement repris après **0,18 s** de recovery ; vitesse 88, approche si distance >255, éloignement si <175, composante latérale selon `attackCount`, correction de bord existante. Pas de mouvement de recul gameplay lié au tir. Avant le premier tir : warmup d’apparition 1 s et compteur positioning initial 0,8 s pour le mob standard, distincts d’une anticipation de projectile.

`RiftProjectiles.reserve` interdit un second paquet tant que le même owner possède un projectile actif, une réservation ou un burst. Une capacité insuffisante retient l’attaque. Le cooldown prêt ne garantit donc pas une émission si le muzzle est trop près du joueur ou le paquet précédent encore présent. Ces règles préexistaient à cet audit.

Mesures à 60 Hz sur une cible fixe, Run réel : **1,6167 s** entre tirs simples dans le scénario observé ; **2,1333 s** entre éventails lorsque les rivets latéraux atteignent leur durée de vie limite. Ce ne sont pas des cooldowns différents ajoutés au jeu. La durée de vol maximale théorique vaut `350/165 = 2,1212 s`, quantifiée par les ticks. Le premier projectile bouge déjà de **2,75 unités** au cours du même update à 60 Hz : sa première capture affichée n’est pas la coordonnée exacte du spawn.

## 3. Mapping et orientation de Rivet B

Clé : `enemy-rivet-standard-v038c1`. Atlas 120 × 24, trois cellules 40 × 24 ; taille affichée **26 × 15,6**, origine `(25/40, 0,5)`, trois frames sur **0,12 s**, frame 0 en mouvement réduit. L’angle affiché est exactement `bolt.angle`, avec le nez orienté vers le déplacement.

Les deux patterns du Riveteur sont non-orb, non-bossMajor, propriétaire `riveter` et zone `forge` : ils satisfont la même allowlist. Les huit directions contrôlées affichent le même atlas Rivet B, y compris les trois branches de l’éventail. Aucun ghost projectile, aucune preview, aucun délai décoratif avant allocation.

L’owner est conservé dans le cache de rendu tant qu’un projectile actif le référence, même après sa mort. Contrôle effectué avec 12 projectiles survivants : tous gardent Rivet B. Si atlas/frame invalide ou absent, ou identité non résolue, le fallback procédural existant reste possible volontairement. Cela ne constitue pas une variante normale sélectionnée au hasard. Aucune promesse d’absence de fallback en panne de chargement.

## 4. Origine réelle et bouche dessinée

À l’émission, pour chaque angle :

`P = centreMob + (rayonMob 17 + rayonProjectile 4 + marge 2) × direction = centreMob + 23 × direction`.

Pas de socket d’arme pour ce projectile. Les trois rivets d’un éventail naissent en trois points de ce cercle de rayon 23, pas en un unique point d’outil. L’ancrage du rendu de Rivet B est ensuite la position gameplay, sans offset visuel initial. La traînée fait partie de sa cellule validée.

Le sprite est 52 × 52, origine centrale, rotation 0, uniquement `flipX`. Son ouverture est l’ellipse `(310,261)` du groupe `riveteuse`, rotation initiale 10° autour de `(213,255)` dans le master. Mesure effectuée sur les transforms de la sheet **réellement sélectionnée**, avec viewport `[-88.75,-33.75,517.5,517.5]` :

| Frame | Bouche relative au centre, sans miroir |
|---|---|
| 0, idle | (+13,815 ; +5,301) |
| 17, début attack | (+13,603 ; +2,736) |
| 18 | (+13,167 ; +3,803) |
| 19 | (+13,228 ; +4,755) |
| 20 | (+13,798 ; +5,730) |
| 21, recovery | (+13,779 ; +6,272) |

Le miroir change le signe de X, pas Y. Comparaison au début du tir pour un sprite orienté à droite : départ est `(23,0)`, écart à la bouche ≈ **9,79 unités** ; départ sud `(0,23)`, écart ≈ **24,41** ; départ nord `(0,−23)`, écart ≈ **29,11**. Les diagonales varient selon côté et pose. Ce sont des écarts entre points d’origine, pas entre tous les pixels du projectile et de l’arme.

**Conclusion : muzzle non aligné de façon robuste.** Les trajectoires et le nez du projectile sont corrects dans les huit directions ; la bouche reste celle d’une vue latérale/3⁄4 fixe. Les étincelles n’épousent ni cette articulation ni l’angle vertical.

### Miroir au tick du tir

`mobileFacing` actualise le côté en positioning et à l’entrée de warning/charge. Un tir immédiat traverse positioning → warning → recovery dans le même update. Le rendu ne voit pas forcément warning. Contrôle reproductible : personnage déjà dessiné à gauche, cible déplacée à droite avant le tick de tir → projectile et étincelles à droite, `flipX` encore à gauche. Aucun tir erroné ni changement de ciblage : c’est un désaccord de présentation. Le seuil de stabilité vertical conserve aussi le dernier côté, conformément au correctif anti-jitter existant. Ne pas supprimer ce correctif global pour traiter ce cas.

## 5. Flash actuel

`ForgeSpriteVfx.update` dessine **deux segments** lorsque : owner vivant/actif, `forgeType==='riveter'`, phase recovery, `recoveryElapsed < 0,12`, et au moins un projectile de cet owner encore actif.

- Origine `(e.x + 22 × facing, e.y + 5)` ; `facing` est le signe de `cos(chargeAngle ?? attackAngle ?? angle)`.
- Segments vers `(5 × facing, −3)` et `(5 × facing, +3)` : longueur ≈5,83 unités chacun, épaisseur 1,5.
- Couleur `#FFD6A0`, alpha 0,6 ; aucun halo/cercle ni atlas de muzzle.
- Durée maximale 0,12 s, pouvant se terminer plus tôt si tous les rivets disparaissent ; ne persiste pas indépendamment de l’owner.
- Un Graphics réutilisé, profondeur 7, sous les personnages. Cap global **48 primitives** partagé avec les autres petites décorations Forge. Quatre Riveteurs → **8 traits** de départ.
- Désactivé en mouvement réduit. Aucun fallback d’asset nécessaire puisque c’est procédural ; ces traits restent indépendants de la disponibilité de l’atlas Rivet B.

**Besoin d’un nouveau flash ? Pas d’une nouvelle famille ni obligatoirement d’un nouvel asset.** Le besoin prioritaire est de placer le feedback existant au bon endroit et de le synchroniser au signal d’émission. Un petit flash mécanique orange partagé serait un polish facultatif après cela. Agrandir les traits actuels sans corriger l’origine rendrait le défaut plus visible.

## 6. Impacts et destructions

| Fin du projectile | Gameplay et rendu actuels |
|---|---|
| Touche le joueur, dégât accepté | `active=false`, callback dégâts ; événement `hurt` au **centre actuel du joueur**, pas au point de contact du rivet |
| Touche un joueur invulnérable | Projectile consommé ; pas d’événement hurt, donc pas de nouvel impact visuel |
| Bouclier bloque un dégât | Feedback générique `shield-hit` si émis par le système existant, distinct du Rivet |
| Dépasse un bord ROOM | `active=false`, pas d’événement d’impact, pas d’étincelle ou explosion |
| Distance parcourue atteint 350 | `active=false`, disparition sèche, pas de VFX |
| `clear` / nouvelle partie / transition / défaite | Pool désactivé, aucune explosion de suppression |
| Mort du tireur | Les projectiles déjà émis **continuent à voler**, mapping conservé ; pas de destruction automatique |

Le projectile ne teste pas les plaques décoratives intérieures. Les points x/y sont avancés jusqu’à la fin du pas puis le test balayé décide le contact. Le callback ne transmet ni position précise, normale, ID de projectile, ni raison de suppression au renderer. Un futur impact dédié nécessiterait une information de présentation fiable sur la fin du projectile ; il ne faut pas déduire « impact » de toute disparition ou de tout événement hurt.

Feedback `hurt` existant :

- **4 particules `spark`** génériques `#FFBA85` ; texture blanche 6 × 4, échelle initiale 0,6–1,3, durée 0,15–0,35 s, vitesse initiale 35–145 unités/s puis freinage ; directions aléatoires déterministes du renderer.
- **1 ring** générique `#FF9576`, durée 0,22 s, texture 40 × 40 avec cercle de rayon 17, échelle 0,6 → 1,8 (diamètre du trait 20,4 →61,2 unités), alpha décroissant.
- Teinte / animation hit du héros, voile rouge `#DD6E62` alpha initial 0,12 décroissant à 0,8/s, shake de 100 ms amplitude 0,004 hors mouvement réduit.
- Pool **48 Images** global partagé avec armes, loot, talents et autres feedbacks ; au plus 5 places demandées pour ce hurt. La saturation peut réduire les particules ; aucune réservation propre au Rivet. En mouvement réduit, zéro particule mais le ring reste demandé.
- Aucun son dans cette configuration : Phaser utilise `audio.noAudio=true`.

**Impact métallique dédié pertinent : oui, P1, petit et commun à la famille.** Deux à quatre étincelles et un point chaud peuvent clarifier un contact réel, notamment au mur. Ne pas ajouter d’explosion, ne pas doubler fortement le hurt du héros, ne pas produire un impact à la simple expiration de portée ou à un reset.

## 7. Animation et recul

Sheet actuelle : **33 frames**, 8 colonnes, cellules 64 × 64, atlas 512 × 320, affichage 52 × 52.

| Clip | Frames | Usage |
|---|---|---|
| idle | 0–3, 5 fps en boucle | Repos ; le positionnement devient move dès déplacement |
| move | 4–11, 10 fps | Positionnement |
| prepare | 12–16, progression pilotée | Existe dans la sheet mais **non utilisé comme attente de tir pur** |
| attack | 17–20 | Signal après émission réelle, fenêtre visuelle 0,26 s |
| recovery | 21–23 | Progression `recoveryElapsed/1`, indépendante du déclenchement des tirs |
| hit | 24–25, 16 fps | Peut momentanément prendre priorité sur attack/recovery |
| death | 26–32, 12 fps | Mort |

`noteProjectileEmission(owner)` incrémente un serial dans une WeakMap après allocation réelle. `projectileAnimationReleased` le lit puis ouvre `release=0.26`. **Gameplay → animation**, jamais l’inverse. Le 14 fps du clip attack est dans le catalogue, mais ce chemin utilise la progression de la fenêtre 0,26 s plutôt qu’une attente de 4/14 s avant le tir.

Micro-recul déjà présent dans les transforms de la sheet : bras, mains et outil partagent un pivot `(185,275)`, rotation de −12° à +2°, translation horizontale maximale échantillonnée −5,8457 unités du master, soit ~**0,59 unité de jeu**. Le centre de l’ouverture se déplace d’environ 0,44 unité horizontalement entre frames 17/18 ; le déplacement vertical est plus visible. Ce recul est donc discret en mobile, mais n’est pas absent. Recovery ajoute une petite détente verticale.

Le corps reprend son déplacement après 0,18 s de recovery alors que l’animation attack peut encore durer jusqu’à ~0,26 s. Il n’existe pas de clip move_attack spécifique au Riveteur. Aucun déplacement gameplay ajouté par l’animation. Si la sheet ne charge pas, le master statique validé reste le fallback ; pas d’ancien personnage générique sélectionné volontairement.

## 8. Courte distance

Garde réelle : `distance > rayonMob + rayonJoueur + 2×5 + 2 = 42`. Le 5 est le rayon conservateur passé à `projectileMuzzleClear`, même si le projectile réel a un rayon 4.

Contrôles directs : 0 / 30 / 41 / 42 → aucun projectile, phase positioning et attaque prête conservée. À **42,001** : trois projectiles admis, écart minimum entre hitboxes au spawn **2,001 unités**, donc aucun spawn dans la hitbox joueur. À 43 : marge minimale 3. Le déplacement du mob et le contact existants peuvent éloigner le tireur et débloquer ensuite le tir ; ce n’est pas une nouvelle temporisation.

Le pas de vol et le mouvement du joueur peuvent entraîner un contact dès le premier update après émission. Cela n’est pas un spawn illégal. En contrôle navigateur à 30 unités initiales, le contact existant repousse le mob, puis le tir part à 0,0833 s après écartement ; le feedback de contact peut alors prendre priorité sur son animation de tir. Ne pas modifier les dégâts de contact ni leur protection pour améliorer ce visuel.

## 9. Vagues et densité

Table extraite directement de `FORGE_WAVES` ; nombres **totaux prévus** dans la vague, pas tous présents simultanément :

| Vague | Riveteurs | Chauffeurs | Scorificateurs | Cap Riveteurs vivants | Cap tous mobs |
|---|---:|---:|---:|---:|---:|
| 2 | 5 | 0 | 0 | 3 | 5 |
| 4 | 2 | 3 | 6 | 3 | 5 |
| 6 | 4 | 4 | 7 | 3 | 8 |
| 7 | 5 | 4 | 8 | 3 | 8 |
| 8 | 5 | 5 | 9 | 3 | 8 |
| 9 | 6 | 5 | 10 | 3 | 8 |
| 11 | 6 | 6 | 11 | 4 | 10 |
| 12 | 7 | 6 | 12 | 4 | 10 |
| 13 | 7 | 7 | 13 | 4 | 10 |
| 14 | 8 | 7 | 13 | 4 | 10 |
| 16 | 8 | 8 | 15 | 4 | 12 |
| 17 | 9 | 8 | 16 | 4 | 12 |
| 18 | 9 | 9 | 17 | 4 | 12 |
| 19 | 10 | 9 | 18 | 4 | 12 |

Vague 1 Chauffeurs seuls, vague 3 Scorificateurs seuls. Vagues 5/10/15 : boss seuls, 20 : triple boss seul. **Aucune combinaison naturelle Riveteur + boss/triple dans cette table**. Les tirs de boss Forge présents ailleurs dans le code ne sont pas automatiquement Rivet B ; l’allowlist les exclut.

Avec les seuls owners vivants : avant vague 11, jusqu’à **3 rivets** ; ensuite **4 × 3 = 12 rivets**. Les deux pics ont été observés dans des simulations de 60 s avec le code réel ; le cas quatre mobs/douze rivets est aussi capturé aux deux formats. `reserve` empêche deux paquets simultanés par owner.

**Borne absolue : 24**, capacité du pool hostile de la Forge, héritée de `RIFT_LIMITS.projectiles`. Les rivets d’owners morts subsistent tandis que de nouveaux mobs peuvent être admis : 12 n’est donc pas un plafond universel incluant les tirs posthumes. Une fixture de remplissage sans temps écoulé, remplaçant les owners morts, accepte huit paquets de trois puis bloque le neuvième. Elle prouve la borne 24, **pas que 24 est une densité naturelle mesurée dans une vague**. Le maximum plausible courant et reproduit avec quatre tireurs vivants est 12 ; les pointes avec renouvellement des owners dépendent des morts, apparitions, murs et vols restants.

## 10. Budget, allocations et cleanup existants

- Pool gameplay : **24 objets réutilisés**, réservations Map, listes temporaires de `filter`, nouvelle petite `spec` à chaque projectile émis. Pas d’optimisation réalisée.
- Rendu Rivet : **24 Images** à profondeur 24, un atlas partagé, Map owners et Set seen réutilisés, masquage puis rendu des actifs à chaque update. Pas de nouveau sprite par tir. Les autres 24 Images de `LampistShotView` existent aussi dans le renderer commun, mais ne dessinent pas les rivets Forge.
- Rivet SVG : **3 388 octets**, bitmap 120 × 24 RGBA8 **11 520 octets = 11,25 Kio**, hors overhead GPU/pilote. Trois frames de trail déjà intégrées : aucune texture de traînée indépendante.
- Sheet du mob : **139 137 octets SVG**, module **149 826 octets**, bitmap **655 360 octets = 640 Kio**, plus master statique 64² RGBA8 =16 Kio. Textures partagées entre tous les Riveteurs.
- Muzzle : un Graphics Forge partagé, cap 48 primitives, **zéro sprite/texture dédié**. Le code crée ses closures `dot`/`spark` et des tableaux `filter` pour les hazards à chaque update : il n’est pas entièrement sans allocations. Aucun changement dans cet audit.
- Feedback hurt : pool global **48 Images**, textures `spark`/`ring` partagées ; aucun pool d’impact métallique dédié. Les particules réutilisent ces Images et le PRNG visuel local, sans toucher au hasard gameplay.
- Mesure navigateur, quatre Riveteurs/douze rivets/huit traits : `EnemyAttacksView.update + ForgeSpriteVfx.update`, 500 appels d’échauffement puis 80 lots de 100. CPU médian **0,007 ms** aux deux formats ; p95 **0,018 ms** en 320×568 et **0,014 ms** en 390×844. Chrome bureau sans interface, WebGL SwiftShader ; pas temps GPU, ni frame complète, ni performance Android garantie.
- Pool stable sur les rendus répétés. Mort des owners : douze rivets toujours mappés correctement. Après `clear` : tous invisibles, cache owners revenu à zéro. Nouveau Run : cache effacé. Les sprites sont détenus par la scène Phaser ; `EnemyRivetView` ne possède pas de destroy explicite comme `LampistShotView`, le nettoyage des objets graphiques à l’arrêt relève de la scène. Pas de profil de fuite long terme sur matériel physique dans cet audit.

## 11. Partage entre entités

| Entité | ID accepté par `rivetCompatible` | Famille de projectile |
|---|---|---|
| Foreuse autonome | `kind='drill'` | Rivet B |
| Draisine | `kind='draisine'` | Rivet B |
| Crachefer | boss `crachefer` | Rivet B, y compris ses tirs majeurs autorisés |
| Aiguilleur | boss `switchman` | Rivet B, y compris ses tirs majeurs autorisés |
| Riveteur | `kind='riveter'`, monde `forge` | Rivet B |

Les orbs sont exclus, de même que les autres boss majeurs. La couleur ou le pool commun ne suffit pas à définir une appartenance. Les cinq familles utilisent le renderer partagé et le cycle de vie de projectile hostile. Leur feedback de dégât accepté sur le joueur aboutit au même `hurt` générique.

Il n’existe actuellement **pas de muzzle commun Rivet B**. Les deux traits audités sont une branche explicitement `forgeType==='riveter'`. Les animations de tir des autres utilisateurs ne justifient pas d’appliquer ce décalage `(±22,+5)` partout. Le futur impact peut être **B — commun à toute la famille Rivet B**. Pour le muzzle : un petit langage visuel/asset commun est pertinent, mais **ancrage, orientation, scale et signal d’émission propres à chaque entité**, pas un offset universel. Les exemples déjà existants `src/hero-muzzle.js` et `src/lampist-projectile-vfx.js` montrent la séparation visual/gameplay, sans autoriser à changer ces armes ou entités.

## 12. Propositions limitées et ordre recommandé

| Priorité | Proposition pour une étape future | Justification / limites |
|---|---|---|
| P0 | Unifier l’origine visuelle du départ et des traits avec la bouche articulée ; vérifier le miroir au tir immédiat | Écart mesuré, particulièrement vertical/diagonal et changement de côté. Visuel uniquement ; conserver centre gameplay, trajectoire, spread, garde 42 et correctif anti-jitter. Aucune correction appliquée ici. |
| P1 | Impact métallique compact commun aux contacts réels de Rivet B | Aujourd’hui, aucune signature de collision dédiée, mur sans retour. Identifier correctement le motif de fin ; ne pas traiter expiration/reset comme impact. Préserver le hurt/bouclier existants et leur hiérarchie. |
| P2 | Petit flash mécanique orange partagé | Facultatif après raccordement : réutiliser/replacer les deux traits peut déjà suffire. Pas de gros cône, fumée ou halo. |
| P2 | Renforcer légèrement le micro-recul si encore peu perceptible après correction | Le recul existe ; éviter de rouvrir les sheets avant validation visuelle du raccord. |
| AUCUNE | Refaire Rivet B, ajouter preview, anticipation, spécial, salve ou hazard | Déjà validé, aucune nécessité constatée. Le projectile et ses paramètres restent entièrement conservés. |

Un nouveau flash seul ne résoudrait pas le défaut principal. Un impact isolé ne résoudrait pas non plus la naissance éloignée de l’outil. Aucune intégration de ces propositions n’est commencée.

## 13. Contrôles, preuves et limites

**Suite complète : 1 674 / 1 674**, zéro échec, zéro test sauté, durée **51,76 s**. Aucun test ajouté/modifié. Snapshot SHA-256 de **3 627 fichiers src/tests**, vérifié après audit : aucun changement.

Contrôles hors suite, confinés au dossier de validation : tirs réels avec Run/ForgeCombat, huit angles, immédiateté à `dt=0`, garde courte distance, cadence, fins de projectiles, cache d’owners, pool et densité. Aucun stub ne remplace les collisions ou le renderer en production.

Navigateur : **44 états** aux formats **320×568 et 390×844**, plus **10 captures avec surimpression de mesure**. Idle/avant tir, émission simple/triple, vol, impact joueur, contact invulnérable, mur, portée, proximité, quatre Riveteurs, autres mobs, huit directions et retournement de cible. Aucune erreur console ou débordement de page. Les marqueurs cyan/blanc/rose de la galerie sont des mesures, pas des VFX proposés. Les captures d’impact utilisent le vrai feedback de RoomScene. La galerie finale a également été vérifiée en 1280×900, 320×568 et 390×844 : 29 images chargées, sélection des deux formats fonctionnelle, aucun débordement ni erreur console (`notes/gallery-browser.json`).

Le banc augmente les PV, suspend l’arme du héros, les spawns supplémentaires et la chaleur ambiante pour isoler les observations. Les coordonnées initiales/compteurs sont des fixtures ; ensuite la simulation et le rendu réels tournent. La fixture de changement instantané de côté sert à reproduire une transition visuelle extrême. Ce n’est pas une estimation de sa fréquence en combat.

Artefacts :

- Rapport : `C:/LaMineV2/la-mine-v2-v01/V038C6-RIVETEUR-VFX-AUDIT.md`.
- Galerie : `C:/LaMineV2/la-mine-v2-v01/production-v038c6-riveteur-audit/gallery.html`.
- URL locale : http://127.0.0.1:5229/production-v038c6-riveteur-audit/gallery.html.
- Mesures : `production-v038c6-riveteur-audit/notes/audit.json`, `browser.json`, `integrity.json`, `tests.txt`.
- Captures : `production-v038c6-riveteur-audit/captures/`.
- Scripts d’observation : `audit.mjs`, `build-harness.mjs`, `observe.js`, `verify-browser.mjs`, `build-gallery.mjs`, `serve.mjs`. Aucun script de construction d’asset de production.

Relance de la galerie : `node production-v038c6-riveteur-audit/serve.mjs` depuis la racine. Le serveur écoute uniquement 127.0.0.1:5229. Le dossier `production-*` suit la convention du projet et reste ignoré par Git. La validation Android physique de nouveaux VFX n’a pas lieu d’être ici : **aucun nouveau VFX n’est intégré**. Le diagnostic de lisibilité sur écran réel peut être corroboré ultérieurement, sans remettre en cause les validations Android existantes.

**Fin de l’audit. Aucun gameplay, Rivet B, master, sprite, animation, hitbox, cadence, test, Chauffeur, Scorificateur, boss ou arme du joueur modifié. Aucun commit/push.**
