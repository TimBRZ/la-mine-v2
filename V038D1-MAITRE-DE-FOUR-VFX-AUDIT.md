# La Mine V2 — V0.38D.1 — Audit VFX du Maître de Four

Audit du 20 octobre 2026. **Audit uniquement, aucune intégration.**

Référence vérifiée : `main`, commit `46c7ee0a987f5c23861ef927c57daa2a39b5207f`. Working tree propre avant intervention. Racine de tous les chemins ci-dessous : `C:\LaMineV2\la-mine-v2-v01`.

**Conclusion : traiter Four tournant en premier.** Ses deux capsules de collision sont dessinées comme des rectangles sans leurs calottes. L’ultime demande ensuite une clarification des marges des bandes sûres. Les cinq attaques utilisent des hazards procéduraux ; aucune n’émet de projectile. « Secteurs » signifie ici rectangles, et « Marche à blanc » signifie trois disques ciblés successifs accompagnant un déplacement.

- [Galerie : 96 captures, deux formats mobiles](production-v038d1-maitre-four-audit/gallery.html)
- [États et mesures de simulation](production-v038d1-maitre-four-audit/notes/audit.json)
- [États exacts des captures](production-v038d1-maitre-four-audit/notes/browser.json)
- [Mesures des renderers et ancrages](production-v038d1-maitre-four-audit/notes/measurements.json)
- [Suite complète : 1 757/1 757](production-v038d1-maitre-four-audit/notes/tests.txt)
- [Intégrité : 3 637 fichiers sources/tests inchangés](production-v038d1-maitre-four-audit/notes/integrity.json)

## 1. Méthode et limites de preuve

Lecture du code au commit indiqué, exécution des vraies classes `Run`, `ForgeDungeonBoss`, `ForgeBossDirector`, `ForgeGround`, et captures avec `RoomScene`, Phaser 3.90.0 et les renderers/assets existants. Aucun remplacement de collision ou de télégraphe. Pas de nouvelle texture de jeu. Les JPEG sont des preuves d’audit.

Le banc isolé augmente uniquement les PV **du joueur** en mémoire, suspend son arme et considère les apparitions de la vague terminées. Il force le premier pattern pour l’examiner ; ses événements passent ensuite par le vrai director et ses admissions. Les séquences libres solo/triple durent 60 s chacune, en phases I et II, avec une trajectoire de joueur déterministe. Il ne s’agit ni d’une partie humaine ni d’une validation exhaustive de toutes les trajectoires.

Captures : Chrome bureau, viewport CSS 320×568 ou 390×844, DPR 1, renderer WebGL avec SwiftShader. Le banc masque son interface et l’indication de déplacement pour isoler l’arène ; il conserve terrain, héros, boss, labels, hazards et feedback de dégâts. Il ne constitue pas une mesure de FPS ou de GPU sur téléphone physique, ni une capture du HUD complet.

Surimpression debug : appel du **vrai** `forgeTouches` sur une grille de 4 unités avec rayon joueur 13. Points magenta = centres du joueur qui seraient touchés maintenant ; ambre = géométrie annoncée ; cyan = corps joueur ; blanc = collision du boss. Ce n’est pas un VFX proposé. « Dedans/dehors » repositionne le joueur après activation sans avancer le temps, puis vérifie le prédicat réel ; ce n’est pas une trajectoire d’esquive. Un redraw sans déplacement peut sélectionner la pose immobile correspondante.

Les secondes nominales du rapport viennent du plan. Les mesures à 60 Hz sont indiquées séparément : activation et expiration sont quantifiées par les ticks, et les admissions peuvent être retardées. Ne pas utiliser ces secondes comme horloge indépendante d’un futur VFX.

## 2. Localisation et architecture

Identifiant interne : **`furnace`**. Nom : `LE MAÎTRE DE FOUR`. Zone : `forge`, Les Forges Oubliées. Solo en vague 5 ; triple en vague 20. Base : 1 800 PV, rayon de contact 28, vitesse de référence 92 unités/s, contact 1. En triple : facteur PV 0,76, soit 1 368 PV.

| Responsabilité | Chemin exact depuis la racine |
|---|---|
| Factory effectivement utilisée | `src/bosses.js` : `createBoss` |
| Classe gameplay actuelle | `src/forge/dungeon-boss.js` |
| Classe de base / compatibilité historique | `src/forge/actors.js` |
| Stats / budgets / anciennes attaques | `src/forge/config.js` |
| Cinq plans et trois combos | `src/forge/boss-patterns.js` |
| Sélection, admissions, lock, horloge | `src/forge/boss-director.js` |
| Mouvement et transport des hazards | `src/forge/boss-mobility.js` |
| Distance, approche, corridors entre boss | `src/forge/boss-pressure.js` |
| Actions légères du troisième boss | `src/forge/boss-light.js` |
| Gestion chaleur / durée / dégâts / cleanup | `src/forge/combat.js` |
| Prédicats de collision | `src/forge/geometry.js`, `src/math.js` |
| Projection temporelle et voie d’évasion | `src/forge/boss-safety.js` |
| Vagues / composition triple | `src/forge/waves.js`, `src/zones.js` |
| Boucle réelle et contact balayé du boss | `src/run.js`, `src/player.js`, `src/config.js` |
| Rendu des hazards et bandes sûres | `src/forge/boss-view.js` |
| Rendu Zone 6 / dispatch des hazards | `src/forge/art.js` |
| Clipping polygonal partagé | `src/depths/boss-view.js` : `clipArenaPolygon` |
| Graphics partagé / ordre du terrain | `src/arena-view.js` |
| Corps, labels, liaison animation | `src/enemies/view.js`, `src/room-scene.js` |
| Chargement et rendu d’animation | `src/forge-animation.js`, `src/forge-animation-state.js` |
| Métadonnées atlas / frames | `src/forge-sprite-catalog.js`, `src/enemy-visual-frame.js` |
| Infrastructure animation partagée | `src/depths-animation.js`, `src/enemy-animation.js` |
| Deux traits et détente décorative | `src/forge-sprite-vfx.js` |
| Feedback générique joueur touché | `src/effects.js`, `src/room-scene.js` |
| Master historique approuvé | `v037a-maitre-four-final/master/maitre-four.svg` |
| Master statique historique chargé | `src/assets/boss-v037b/furnace.svg` |
| Atlas de production | `src/assets/enemies-v037c/furnace-35afc34b8a3f.svg` |
| Module atlas chargé dynamiquement | `src/assets/enemies-v037c/furnace-35afc34b8a3f.js` |
| Repli statique vérifié V037C | `src/assets/enemies-v037c/furnace-35afc34b8a3f-idle.svg` |

Chaîne : `Run.update` → `ForgeCombat.updateActor` → boss/director → admission dans `ground.items` → `ForgeGround.update` (activation, projection, dégâts) → `RoomScene.drawActors` → animation/VFX → `ArenaView.update` → `drawForge` → `drawDungeonHazard`.

Les anciens `plates`, `jet`, `rivets` de `FORGE_CYCLES` ne sont **pas** le kit sélectionné par la factory actuelle. Les appels explicites historiques restent possibles dans les diagnostics. Le cône courant est 225 / 0,66 ; ne pas reprendre les paramètres du `jet` historique 180 / 0,6.

Les VFX Chauffeur et Scorificateur de V0.38C ne dessinent pas ces dangers : `drawForge` traite d’abord `h.dungeon` et continue immédiatement après `drawDungeonHazard`.

## 3. Contrat commun : sélection, durée, danger et mobilité

Le cycle nominal est `sectors → furnaceCone → furnaceTurn → whiteMarch`, indexé par `attackCount % 4`. À distance <115 et lorsque `attackCount % 3 === 1`, la sélection peut remplacer l’attaque par `sectors` ou `whiteMarch` en alternance. L’ultime solo a priorité à ≤25 % PV, une seule fois. La phase II ordinaire commence **strictement sous 50 %**, raccourcit les annonces ×0,94 et la recovery de 1,10 à 0,95 s.

Il n’existe pas de cooldown individuel à fréquence fixe. Après le plan, recovery immobile, puis repositionnement de 0,55 s en solo phase I / 0,35 en phase II ; en final 0,20 / 0,12 s. Échec de démarrage : nouvelle tentative après 0,20 s. Premier positioning de base 0,80 s, warmup 1,40 s dans les stats ; le banc met le warmup à zéro pour isoler les attaques. Le triple utilise aussi le stagger d’entrée de la factory.

Sans refus ni substitution, cycle nominal des quatre attaques ≈19,05 s phase I / 17,329 s phase II, incluant `end`, recoveries et repositionnements ; les ticks ajoutent de petits écarts. Ce sont des estimations de cycle, pas une garantie de réapparition de chaque pattern. Les simulations libres ont démarré 13 / 14 attaques en 60 s solo.

Chaque hazard porte `owner`, `planId`, `attackToken`, `order`, `warning`, `warningTotal`, `active`, `elapsed`, `remaining`, `duration`, `cooling`. Dégâts : **0,5 par contact accepté** pour toutes les formes des cinq patterns. Vérification à chaque tick actif ; l’invulnérabilité joueur de 1 s empêche un dégât à chaque frame ou par hazard superposé. Le contact corporel du boss reste séparé : 1, avec segment balayé et mouvement relatif. Le refroidissement dure 0,30 s, est visible, sans danger.

Le director n’admet pas plus de 5 objets au sol, 3 thermiques, 2 owners majeurs. Les objets encore en cooling comptent dans les caps d’admission. `bossEscapeRoute` vérifie un chemin temporel ; en triple un grand espace froid connecté est également contrôlé sur la géométrie projetée toutes les 0,2 s. Refus : `plan.retry=.2`, horloge du plan et translation suspendues ; les hazards déjà admis continuent leurs propres durées et rotations. La durée réelle totale peut donc dépasser le nominal, sans borne fixe si les refus persistent.

La direction de déplacement est préparée une fois : approche, recul si trop proche, ou tangente. Corridors limités par murs et autres boss, avec marge `rayonA + rayonB + 34`. **ATTACK_MOBILE ne signifie pas poursuite continue.** Aucun des déplacements d’attaque ne recalcule sa trajectoire sur le joueur.

| Pattern | Annonce phase I / II | Danger nominal | `plan.end` I / II | Recovery |
|---|---|---|---|---|
| Secteurs | 1,35 / 1,269 s | 1,80 s | 3,20 / 3,119 s | 1,10 / 0,95 s |
| Cône | 1,40 / 1,316 s | 0,65 s | 2,10 / 2,016 s | 1,10 / 0,95 s |
| Tournant | 1,40 / 1,316 s | 2,50 s | 3,95 / 3,866 s | 1,10 / 0,95 s |
| Marche | 1,20 / 1,128 s par disque | 0,65 s par disque | 3,20 / 3,128 s | 1,10 / 0,95 s |
| Ultime réel, phase II | 1,786 ; 1,786 ; 1,363 s | 0,65 ; 0,65 ; 0,60 s | 7,813 s | 1,50 s |

`end` est le dernier `at + warning + duration + .05`. Pour un majeur, la recovery attend aussi l’absence de hazard non refroidi du token. Elle n’attend pas la fin des 0,30 s de cooling.

## 4. Secteurs de chauffe — `sectors`

**Classification : A télégraphe au sol, B zone thermique, F hazard temporairement persistant ; J rectangles. D « secteur angulaire » absent. I décoration commune.**

Deux rectangles phase I, trois phase II, tous admis dans le même événement à `at=0`. Ordre de tableau ci-dessous, **activation simultanée**, chacun `order=1`. Aucune rotation, aucun rayon ou angle de secteur.

| Élément | Centre | Taille | Emprise exacte |
|---|---|---|---|
| 1 | (121,265) | 142×190 | x=[50,192], y=[170,360] |
| 2 | (329,520) | 142×190 | x=[258,400], y=[425,615] |
| 3, sous 50 % | (329,265) | 142×150 | x=[258,400], y=[190,340] |

Rayons circonscrits si nécessaires pour un outil : ≈118,6 / 118,6 / 103,3 ; **ils n’interviennent pas dans la collision**. Les rectangles restent fixes dans l’arène même quand le boss se déplace à 36,8 unités/s (`.4×92`), plafond de trajet 150 unités, éventuellement raccourci par le corridor. Orientation et cible joueur sans effet sur les plaques.

Corridor central x=192…258, largeur géométrique 66. Pour le centre d’un joueur de rayon 13, passage garanti par rapport à ces rectangles x=205…245, largeur 40. Les poches haut/bas et contournements sont possibles selon position ; les marges latérales de 22 unités au mur ne constituent pas un passage pour un corps de diamètre 26. Ne pas les styliser comme des issues.

Danger 1,80 s, cooling 0,30 s. Maximum simultané 2/3 hazards, tous actifs ensemble ; aucune répétition interne. Recovery mesurée 3,217 / 3,133 s au tick 60 Hz.

Rendu : polygones de quatre coins, clipping arène, aplats orange, contour et un point central. Les limites correspondent au rectangle physique pour un point ; la collision joueur ajoute son rayon sur **chaque axe**, avec des coins conservateurs, voir §9.

À préserver : largeur du corridor central, séparations entre plaques, simultanéité, troisième rectangle de phase II, différence annonce/actif/cooling. Prototype : plaques flottantes uniformes, pas de matière ni montée de chauffe ; les « secteurs » ne sont pas des tranches circulaires.

## 5. Cône de fournaise — `furnaceCone`

**Classification : A, B, C cône, F pendant 0,65 s, I décoration. Ni projectile ni onde.**

Un éventail circulaire de rayon **225**, demi-angle **0,66 rad = 37,815°**, ouverture complète **1,32 rad = 75,630°**. Origine : centre gameplay du boss, transporté avec sa translation, pas socket de bouche.

Angle initial `atan2(joueur.y-boss.y,joueur.x-boss.x)`. Suivi angulaire borné à **0,65 rad/s** pendant les **0,35 premières secondes du plan**, puis `locked=true`. Écart théorique maximal de suivi ≈0,2275 rad / 13,03°, avec quantification à la frame et particularité des refus d’admission avant progression du plan. Aucun tracking après lock. L’origine continue pourtant de translater : verrouillage **de direction**, pas de position.

Translation préparée : 32,2 unités/s (`.35×92`), plafond 80. Dans le cas capturé, origine y≈315,08 à l’activation, contre y=270 initialement ; déplacement ensuite pendant le danger. Annonce 1,40 / 1,316, actif 0,65, un seul élément. Recovery mesurée 2,117 / 2,017 s.

Collision réelle : avec distance d, écart angulaire δ et rayon joueur r,
`d < 225+r && (d <= r || δ < .66 + asin(min(1,r/max(d,1))))`.
Le domaine du **centre** joueur atteint donc 238 unités ; ce n’est pas une portée de VFX de 238 à ajouter arbitrairement.

Rendu : sommet + 25 points d’arc, donc 24 segments, mêmes centre/angle/rayon/ouverture. Clipping aux limites ROOM. **Correspondance globale correcte** pour le domaine de danger à rayon nul. Arc polygonal très légèrement intérieur au cercle analytique : flèche maximale ≈0,085 unité ; le contour visible déborde d’environ 1/1,5 unité par côté. Avec rayon 13, une collision peut commencer alors que le centre du héros reste hors du cône visible : conséquence du corps du joueur. La combinaison des marges radiale et angulaire est conservatrice près des coins arc/flanc ; ne pas l’assimiler à une dilatation euclidienne parfaite.

Pas de dépassement massif ou de cône inversé observé. L’origine anatomique est seulement approximative ; le sprite reste debout, miroir horizontal, jamais orienté sur 360°. Le lock n’a pas de changement visuel spécifique.

À préserver : les deux flancs, la portée, l’origine mobile, les 0,35 s de suivi puis lock. Le futur cœur lumineux doit rester décoratif à l’intérieur de cette forme.

## 6. Four tournant — `furnaceTurn`

**Classification : A, B, E balayage, F pendant 2,50 s, J bras/capsules, I décoration. Aucun anneau thermique plein.**

Deux bras opposés, angle initial vers le joueur et +π. Longueur des segments 145, **demi-largeur 14**, largeur pleine 28. Collision `segmentCircle` : capsule de rayon 14 autour de chaque segment. Les deux segments opposés forment ensemble une barre capsulaire de segment 290 ; portée physique au bout **159** depuis le centre, portée pour centre joueur **172**.

Rotation active uniquement : `angle = baseAngle + spin×elapsed`, vitesse **0,42 rad/s = 24,064°/s**, balayage de **1,05 rad = 60,161°** en 2,5 s. Sens positif horaire à l’écran (y vers le bas). Phase I toujours positif ; sous 50 %, sens négatif si le nombre d’utilisations précédentes de ce pattern est impair, positif sinon. Le sens ne change pas pendant l’attaque.

Annonce 1,40 / 1,316 s sans rotation, mais origine mobile : 32,2 unités/s, plafond 140. Deux bras toujours ancrés à cette origine, pas à leurs anciennes coordonnées. Aucun tracking de cible après préparation. Les flèches tangentielles de 16 unités annoncent le sens ; elles ne dessinent pas toute l’enveloppe balayée. Recovery mesurée 3,967 / 3,867 s.

Safe zones : côtés de la barre à l’instant courant, extérieurs à la portée capsulaire, sous réserve du mouvement de l’origine, des murs et du boss. **Pas de centre sûr**, pas de secteur sûr permanent garanti au même endroit. Le boss peut se rapprocher pendant annonce et actif.

Rendu **procédural uniquement pour les bras**, associé au sprite animé du boss et aux petits traits décoratifs. Rectangles de longueur 145 et largeur 28, contour 2/3, plus flèche sur chaque bras. Le vrai rayon 14 des deux bouts extérieurs n’est pas dessiné. Pour un point axial à 150 ou 158 unités, `forgeTouches` est vrai, alors que le rectangle s’arrête à 145 (hors débord du trait). Écart maximal de forme : 14 unités, environ 12,5 au-delà du contour actif de 3.

**P0 : sous-représentation des calottes.** Le diamètre/rotation et la translation du tronc des bras correspondent. Ne pas « corriger » en agrandissant un rectangle ou en changeant la hitbox lors d’une future passe VFX : la forme à représenter est la capsule existante.

## 7. Marche à blanc — `whiteMarch`

**Classification : A, B, F disques temporaires ; J déplacement accompagné de frappes ciblées ; I décoration. Ce n’est ni une charge, ni une traînée laissée par les pieds.**

La cible t est échantillonnée une fois et clampée à x=90…360, y=185…595. Pour i=0,1,2 :
`centre = (clamp(t.x+(i-1)*65,85,365), clamp(t.y+(i-1)*35,180,600))`, rayon **47**.
Les centres sont fixés dès le plan ; aucun tracking. Ils ne sont pas échantillonnés le long du déplacement du boss.

Annonces aux temps **0 ; 0,65 ; 1,30**, de 1,20 s chacune / 1,128 sous 50 %. Activation nominale **1,20 ; 1,85 ; 2,50** / **1,128 ; 1,778 ; 2,428**. Chacun dure 0,65 s puis refroidit 0,30 s. Trois disques en tout, jusqu’à trois objets simultanés incluant annonces/cooling.

Nominalement les plages actives se succèdent sans recouvrement de durée. **Au tick 60 Hz, deux peuvent être actifs ensemble une frame** : observé à t=1,833 s, premier `elapsed=.6333`, deuxième tout juste actif. Ne pas programmer un futur effet en supposant une exclusivité stricte. Le troisième commence à 2,483 s dans le cas phase I mesuré. Recovery à 3,217 / 3,133 s.

Translation du boss : **41,4 unités/s** (`.45×92`), plafond 150, direction préparée et limitée par corridor, pas une ruée à 275/300. Le corps du boss garde son contact balayé de 1 dégât, distinct des disques à 0,5. Aucune collision de chemin ni hazard ajouté derrière lui.

Pour cible (225,500), centres (160,465), (225,500), (290,535), distance entre centres ≈73,82 < diamètre 94 : zones annoncées se recouvrent. Le clamp aux bords peut encore rapprocher les centres. Rendu : cercles approchés par 40 points, points d’ordre 1/2/3, même orange avant/pendant. Collision disque analytique rayon 47+r ; approximation de contour ≈0,145 unité, sans écart majeur observé.

À préserver : ordre et alternance, distinction disque actif / disque annoncé / refroidissement. Le chevauchement et les petits points de séquence sont les principaux risques mobiles. Une traînée sous les pieds suggérerait un danger inexistant : l’éviter.

## 8. Ultime Four à blanc — `whiteFurnace`

**Classification : A, B, F et J grandes bandes rectangulaires, puis C cône ; I décoration. Ni onde de pression ni embrasement global.**

Condition réelle : `!final && !ultimateUsed && hp <= maxHealth*.25`, au prochain choix libre. Pas d’interruption du pattern en cours. `ultimateUsed` passe à vrai au démarrage. Le boss reste immobile pendant tout le plan (`ATTACK_STATIC`) et sa recovery. Aucun tracking, y compris pour le cône final : celui-ci est préparé à la création du plan, environ 5,8 s avant son annonce.

| Étape | `at` | Formes | Annonce réelle | Plage active nominale |
|---|---:|---|---:|---|
| 1 | 0 | 3 plaques largeur 394, x=225 ; (y,h)=(178,124),(390,110),(606,120) | 1,786 | 1,786…2,436 |
| 2 | 2,9 | 3 plaques largeur 394 ; (153,74),(350,110),(576,180) | 1,786 | 4,686…5,336 |
| 3 | 5,8 | Cône rayon 225, demi-angle .66, origine/angle initiaux | 1,363 | 7,163…7,763 |

Largeur des plaques x=28…422, exactement la largeur de l’arène. Trois hazards simultanés maximum ; 7 hazards émis au total, deux groupes de trois puis un cône. Première et deuxième vague ne coexistent pas nominalement ; les 0,30 s de refroidissement s’intercalent avant la suivante.

Durée jusqu’à fin du plan **7,813 s**, plus recovery **1,50**, soit **9,313 s nominales** avant repositionnement. Mesuré à 60 Hz : recovery démarre 7,817 s ; activations 1,800 / 4,700 / 7,167. Les paramètres phase I théoriques sont 1,9 / 1,9 / 1,45 et fin 7,9, mais **ce n’est pas l’ultime sélectionné naturellement**, qui intervient sous 25 %.

| Vague | Bandes froides géométriques, y | Bande du centre joueur r=13 | Hauteur utile |
|---|---|---|---|
| 1 haute | 240…335 | 253…322 | 69 |
| 1 basse | 445…546 | 458…533 | 75 |
| 2 haute | 190…295 | 203…282 | 79 |
| 2 basse | 405…486 | 418…473 | 55 |

Le rendu vert remplit/borde la bande géométrique avec retrait **4 unités**, pas 13 : première bande verte y=244…331. À (225,249), le centre joueur est dans le vert mais son corps touche la plaque du haut : **collision vraie, reproduite dans la galerie**. Ce n’est pas un hazard qui mord arbitrairement une surface froide : le corps chevauche encore le danger. En revanche, le vert ressemble à une instruction de positionnement du centre, d’où une ambiguïté P0 de safe zone. Il manque 9 unités de marge par bord si cette promesse visuelle est retenue.

Pas de montée progressive des dégâts, du rayon ou d’une intensité globale ; progression par déplacement des bandes puis changement de forme. L’animation des ouvertures chauffe, mais les aplats des hazards ne portent pas de gradient progressif. Les safe zones vertes disparaissent dès que les plaques passent en cooling et n’apparaissent pas autour du cône final.

**Triple : cet ultime est exclu du jeu normal**, même avec un survivant encore marqué `final`. Aucun « Four à blanc + ultime des deux autres » à inventer. Les combinaisons utilisent des plans distincts décrits au §12.

## 9. Géométrie visuelle contre danger réel

Arène : monde 450×800 ; ROOM x=28…422, y=116…666. Tous les polygones sont clippés à ROOM ; le prédicat de collision n’est pas graphiquement clippé. Le centre joueur est lui-même clampé avec son rayon aux murs. Une portion extérieure au mur ne doit pas devenir un futur VFX visible ou une issue.

| Attaque | Correspondance | Écart / prudence |
|---|---|---|
| Secteurs | Mêmes rectangles, mêmes positions | Collision AABB élargie de r sur chaque axe : coins conservateurs ; contour 2/3 légèrement extérieur. Le vert n’est pas utilisé ici. |
| Cône | Même origine mobile, angle, ouverture, portée | Arc polygonal intérieur de ≤0,085 ; trait extérieur. Expansion de collision par rayon joueur, conservatrice au raccord arc/flanc. |
| Tournant | Axe, largeur centrale et rotation synchrones | **Bouts arrondis de rayon 14 absents du rendu**. Flèches décoratives ne remplacent pas les calottes. |
| Marche | Mêmes centres et rayons | Approximation du cercle ≤0,145 ; rayon joueur à considérer ; superposition de plusieurs phases et possible chevauchement actif d’un tick. |
| Ultime | Plaques et cône cohérents | **Bandes vertes non érodées par le rayon joueur** ; corners AABB communs aux plaques. |

Détail AABB : `abs(dx)<w/2+r && abs(dy)<h/2+r`. Au coin (192,360) d’une plaque, un centre en (204,372), rayon 13, est touché par ce test, alors que sa distance euclidienne au coin est ≈16,97. C’est une collision conservatrice rectangulaire, pas une intersection cercle/rectangle exacte. Ne pas masquer cet écart dans une promesse « forme parfaitement exacte ». Aucun ajustement gameplay n’a été fait.

Les contours sont eux-mêmes de l’encre, pas des hitboxes : débord habituel de 1 unité avant activation / 1,5 actif, limites strictes `<` pour plusieurs formes mais tangence acceptée par `segmentCircle`. Ces différences subpixel et de convention sont moins urgentes que les 14 unités des bras. Aucun correctif dans cet audit.

## 10. Rendu actuel et synchronisation

### Couleurs et primitives

Pour les cinq patterns, même style furnace : **`#ff8650`**, alpha annonce **0,13**, actif **0,36**. Contour : largeur 2 annoncé / 3 actif, alpha 0,95. Cooling : **`#97b9a4`**, fill 0,08 et contour alpha 0,30, pendant 0,30 s. Les points d’ordre ont rayon 2, espacement 7 et fill opaque. Ils désignent **l’étape**, pas un compte à rebours.

Plaques : `fillPoints/strokePoints`, 4 sommets avant clipping. Cône : 26 sommets. Disques : 40. Bras : 4 chacun et deux `lineBetween` par flèche. Pas de dégradé, masque de chaleur, bruit, particule physique ou sprite de hazard. L’alpha d’annonce reste constant ; il n’y a pas de remplissage temporel progressif dans ce renderer.

Safe zones de l’ultime : `fillRect/strokeRect`, `#8fd1bd`, fill 0,12, contour 2 / alpha 0,8, retrait 4 sur tous les côtés, seulement pour les intervalles de hauteur ≥50 entre plaques non refroidies du propriétaire.

Décoration commune : au premier hazard actif frais (`elapsed<.18`), **deux traits** depuis `(boss.x±10,boss.y−4)`, vecteurs `(±3,−2)`, largeur 1,5, `#ffad32`, alpha `(1−elapsed/.18)×.4`. Un groupe d’activation déclenche deux traits, pas deux par plaque. Première .18 s de recovery : deux points `(x±22,y−14)`, rayon 2, `#a7bfc2`, alpha .18. Réduction de mouvement : ces décors sont supprimés. Aucun emitter ni timer décoratif autonome.

### Ordre de rendu et hiérarchie

Terrain profondeur −10, détails −5 ; déco Forge 7 ; hazards et bandes sûres dans **un Graphics profondeur 8** ; ombre héros 9 ; container boss 15 (ombre/corps/labels) ; héros 20, arme 21 ; projectiles ennemis 24 ; barre PV boss 60 ; voile de dégât 80.

Dans `drawForge`, safe zones d’abord, puis hazards dans l’ordre d’insertion. Les décors restent correctement sous les télégraphes. **Boss au-dessus du sol : il peut cacher un bord critique ou l’origine des bras/cône** ; c’est un défaut de hiérarchie perceptive par rapport à SAFE/TÉLÉGRAPHES > DANGER > BOSS > DÉCO. Surtout Tournant, Cône et plaques traversées par les machines en triple. Le joueur est au-dessus des boss et de ces aplats : ils ne le masquent pas directement. Ses pieds et le fond peuvent néanmoins se confondre, et le voile de hit atténue tout l’écran.

### Autorité temporelle

Le rendu de sol lit **les objets réellement admis**, leurs coordonnées, angle, `active` et `cooling`. La projection de rotation/translation est commune à la sécurité et au gameplay ; le dessin n’a pas de timer concurrent. La déco lit `elapsed` réel et la recovery. L’animation lit `ground.items`, filtré par owner **et token**, prend le hazard actif le plus récent ou l’annonce la plus proche.

Les clips en boucle/marche utilisent `walkClock`/`elapsed` du renderer ; les anticipations non bouclées utilisent la progression réelle de l’annonce. Ils n’émettent aucun dégât. `move_attack` remplace la pose `cone` pendant la translation ; `move_rotor` remplace `rotor` ; `march` est sa propre boucle. Ce ne sont donc pas des frames uniques à partir desquelles déclencher un VFX.

Décalage observé : le director met `e.phase` à jour **avant** `ground.update`. À l’activation d’un hazard, `e.phase` peut encore valoir `warning` pendant un tick (16,7 ms à 60 Hz ; dt de scène plafonné à 40 ms). Rendu de sol et animation sont déjà actifs, car ils lisent le hazard après update. Le label d’annonce, lui, dépend d’`e.phase` et peut rester une frame. À l’extinction, le corps peut avoir un bref état `hold`/`move_prepare` avant recovery. **Piloter les futurs VFX par le hazard, pas seulement par `e.phase`.**

Refus d’admission : `plan.time` se fige mais un effet déjà actif poursuit sa vie dans `ground`; la dérive de son origine reste à `driftTime`, alors que les bras peuvent encore tourner via `elapsed`. Respecter cette distinction. Cooling fige la dernière position/angle et ne suit plus le boss.

## 11. Sprite, four central et points d’ancrage

Atlas actuel : **118 frames**, cellules 96×96, grille 8 colonnes, image 768×1440 ; affichage **84×84**, origine (.5,.5), rotation 0. Miroir horizontal suivant la direction gameplay, avec seuil `abs(cos(angle))>.18`. Aucun pivot de bouche ni socket anatomique publié par le jeu. La silhouette rouge forge, les trois fentes chaudes et la cheminée sont déjà dans les sprites.

Clips : idle 0–4 ; move 5–12 ; prepare 13–20 ; attack 21–26 ; recovery 27–33 ; hit 34–35 ; death 36–45 ; pressure 46–53 ; move_prepare 54–61 ; move_attack 62–69 ; hold 70 ; ultimate_recovery 71–79 ; cone 80–85 ; rotor 86–93 ; move_rotor 94–101 ; march 102–109 ; ultimate_prepare 110–117. Métadonnées complètes dans `notes/audit.json`.

Repères **mesurés dans l’SVG, pas des sockets existants**, frame 0 sans miroir, offsets en unités du jeu par rapport au centre du boss :

| Raccord candidat | Offset approximatif | Preuve / limite |
|---|---|---|
| Fente gauche écran | (−3,155 ; −0,162) | Centre choisi dans le cœur clair du path `p51` |
| Fente centrale | (+0,351 ; 0) | Cœur clair central `p51` |
| Fente droite écran | (+3,857 ; 0) | Cœur clair droit `p51` |
| Bouche du four | Autour du groupe des trois fentes, proche (0,35 ; 0) | Il n’existe pas une quatrième bouche séparée |
| Sortie de cheminée | (−9,466 ; −30,029) | Repère choisi (171,40) du master, groupe `p5` |
| Pieds / sol | Repère de contact gameplay (0,0), ombre visuelle à y=+28 | Les pieds dessinés sont plus bas que le centre ; aucune trace gameplay |

Calcul : transform master `translate(-18,0) scale(1.08,1)`, transform `<use>` de la frame, puis `(coord−225)×84/517.5`. Au flip X, inverser l’offset x. Exemple frame 117 : fente centrale y≈+0,877, cheminée y≈−29,152. Les 76 mesures sur 19 frames clés figurent dans `notes/measurements.json`. Ce sont des points candidats au sein des formes, pas un relevé exhaustif de chaque pixel ou de tous les appuis.

Les deux traits décoratifs actuels x±10,y−4 ne coïncident pas avec les trois fentes, espacées d’environ 3,51 unités. Un futur raccord doit suivre la frame et le miroir ; ne pas déplacer l’origine collision `(boss.x,boss.y)` pour rejoindre le dessin. Cheminée : seulement ponctuel, pas une fumée opaque permanente. Pieds : effet bas non dangereux, sans trace persistante trompeuse.

## 12. Mobile et triple Zone 6

### Dimensions réelles à l’écran

Phaser FIT conserve 450×800. À 320×568 : échelle **0,71**, canvas ≈319,5×568. À 390×844 : échelle **0,8667**, canvas 390×693,33 avec marges verticales ≈75,33. Le deuxième viewport n’agrandit pas le monde ni ses safe zones.

| Élément | 320×568 | 390×844 |
|---|---:|---:|
| Sprite 84×84 (cadre, silhouette plus petite) | 59,64 px | 72,80 px |
| Diamètre joueur collision 26 | 18,46 px | 22,53 px |
| Contour annoncé / actif | 1,42 / 2,13 px | 1,73 / 2,60 px |
| Points d’ordre diamètre 4 | 2,84 px | 3,47 px |
| Label boss 9 unités | 6,39 px | 7,80 px |
| Corridor central secteurs, centre joueur 40 | 28,40 px | 34,67 px |
| Bande ultime la plus fine, centre joueur 55 | 39,05 px | 47,67 px |
| Calotte tournante manquante 14 | 9,94 px | 12,13 px |

Constats visuels des captures : les safe zones restent traversables, mais leur marge pour le centre est nettement plus petite que la surface verte. Les labels et points d’ordre sont trop petits pour être l’unique signal. Les disques de Marche se recouvrent avec le même orange ; seule leur alpha/épaisseur les distingue. Les bras tournants se perdent sous le torse et leurs bouts manquants représentent près de 10 px au petit format. Le cône est lisible dans son ensemble, mais sa pointe est cachée et aucun signe spécifique ne marque son lock.

Les aplats actifs à .36 n’occultent pas le héros, dessiné dessus. Plusieurs remplissages superposés sont plus opaques : deux donnent un alpha composite ≈.5904, trois ≈.7379 pour même couleur, sans pour autant être au-dessus du joueur. Le risque est le contraste du sol et la confusion des phases, particulièrement Marche et triple. Ce n’est pas un constat de perte totale du joueur derrière un sprite de boss.

### Combos réellement exécutés

| Combo | Maître de Four | Autre boss majeur | Troisième boss |
|---|---|---|---|
| Forge sous pression | À 0 : deux plaques (105,265),(345,520), 120×170, annonce 1,5, actif 2,1 | Chaudière à .55 : ligne (50,570)→(135,570), demi-largeur18, annonce1,45, actif1,05 | Marteau peut contribuer un impact léger |
| Pilon à blanc | À 0 : plaque (110,370),140×270, annonce1,4, actif2,1 | Marteau à .8 : disque (155,400),r52, annonce1,3, actif.35 | Chaudière peut contribuer une pression légère |
| Pression cadencée | **Pas membre de la paire majeure** ; point de chauffe léger | Chaudière : ondes r40→150, demi-largeur12, gap .6, at0 et3,25, annonce1,3, actif.75. Marteau : disques r52, at1,65 et4,9, annonce1,2, actif.3 | Furnace : petite plaque 48×48 ciblée |

Les plaques de combo restent fixes alors que les boss se déplacent. La ligne et les ondes de Chaudière dans ces combos ne sont pas des jets attachés automatiquement à sa nouvelle position. Blanc/jaune Marteau `#ffe1a0`, cyan Chaudière `#b7e8ed`, orange Furnace `#ff8650`. Ils partagent le Graphics et leurs traits ont la même famille d’épaisseur.

Le light furnace a annonce **1 s**, durée normale **3 s**, ou **1,45 s** pendant Pression cadencée, ou **0,60 s** en version brève ; recovery .35. Il conserve un danger après sa courte durée de plan (`end=1.25`), ce qui explique des croisements avec le cycle suivant. Ce n’est pas un sixième pattern majeur à produire sans décision.

Combo recovery 1,2 s. Prochain essai de combo au plus tôt 2,8 s après départ, 2,4 si PV cumulés <50 % ; cela ne garantit pas une fréquence de 2,8 s, car disponibilité des partenaires, hazards et recovery dominent. Pas d’accélération ×.94 des annonces des plans combo.

Exécution : 12 s en démarrant chacun des trois combos, puis deux sessions libres de triple de 60 s (PV hauts / bas). Tous les combos observés. Au cours des sessions libres : **maximum 5 objets au sol, 2 thermiques observés, 2 majeurs**, 12 départs de combo par session. Trois refus géométriques d’admission en session basse, aucun dans la haute ; ils ont été reportés, pas contournés. Détails horodatés dans `notes/audit.json`. Les caps restent 5/3/2, le « 2 thermiques » est une observation, pas une nouvelle limite.

Pression cadencée protège spécifiquement le non-recouvrement temporel onde/disque lors d’une admission retardée. L’onde conserve son encoche ; le light furnace utilise le budget restant. Les safe zones sont une propriété temporelle combinée, pas l’union statique de toutes les surfaces annoncées. Les contrôles d’évasion modélisent les hazards ; ils ne prouvent pas à eux seuls qu’aucun corps de boss ne gênera jamais un joueur.

Risques visuels : boss et labels traversant les plaques, petits signaux du troisième acteur, refroidissement vert qui peut être pris pour une safe zone explicitement balisée. Aucun combo n’a été modifié.

## 13. Performance, objets et cleanup

**Dangers furnace : zéro sprite dédié, un Graphics de sol partagé, un Graphics décoratif Forge partagé.** Aucun Graphics par rectangle/disque/bras, aucun emitter. Les arrays de hazards sont alloués par admission, sans pool ; maxima propres : secteurs 2/3, cône1, tournant2, Marche3, ultime3 simultanément (7 émis).

La vue boss comporte un container et six enfants : image corps, ellipse ombre, cercle d’apparition, deux rectangles PV, texte. Le corps réutilise l’atlas. Le banc triple complet compte 269 objets au niveau racine, dont 10 Graphics et 229 images, **incluant tous les pools génériques préalloués du jeu**, même invisibles. Ce n’est pas le coût incrémental du Maître de Four ; les objets enfants des containers ne sont pas tous comptés dans ce total racine.

Atlas furnace : 504 817 octets SVG ; module 543 596 octets ; estimation RGBA8 768×1440×4 = **4 423 680 octets ≈4,22 Mio**, hors overhead GPU, caches et mipmaps éventuelles. Les 118 frames sont dans cette seule texture, pas 118 images de jeu vivantes. Repli idle et master historique peuvent également être chargés.

Allocations par frame : points/arrays de polygones, quatre passes de clipping, `.filter`, `.sort`, objets de projection copiés ; le Graphics est vidé puis reconstruit. Avant clipping : 4 points/plaque, 26/cône, 4/bras, 40/disque ; maximum propre usuel Marche : 120 points avant clipping, plus intermédiaires. Les ondes Chaudière en triple sont plus coûteuses (40 petits quads et prévisualisations), sans être des VFX Furnace.

Mesure CPU bureau de `ArenaView.update + ForgeSpriteVfx.update`, après chauffe, 50 lots de 100 appels, temps par appel (ne comprend ni GPU, ni animation complète, ni simulation/sécurité) :

| État mesuré | Hazards | Médiane ms | p95 ms |
|---|---:|---:|---:|
| Secteurs phase II actifs | 3 | .005 | .010 |
| Cône actif | 1 | .008 | .014 |
| Tournant actif | 2 | .004 | .007 |
| Marche, phases superposées | 3 | .045 | .052 |
| Ultime, première vague | 3 | .008 | .016 |
| Forge sous pression + léger | 4 | .026 | .047 |
| Pression cadencée, onde active | 2 | .052 | .092 |

Ordre de grandeur de soumission de dessin : quelques microsecondes à ~0,1 ms sur ce poste, avec forte dépendance au nombre de sommets/ondes. **Ne pas convertir cela en promesse de FPS mobile.** Les appels du director pour la sécurité allouent également grilles/sets et font de nombreuses projections aux admissions ; leur coût est distinct et n’a pas été profilé en durée ici.

Cleanup observé : mort propriétaire → 2 hazards Tournant à 0 et buffer de commandes sol à 0 au prochain update, dans les deux formats. Expiration → cooling .30 → retrait `done`. Changement/reset : tableaux vidés, vues réutilisées ou détruites selon leur owner. `releaseForgeSheets` libère les atlases optionnels avec epoch pour éviter un chargement tardif. Historique director borné à 160 entrées. Pas de fuite démontrée ; pas de profiling heap prolongé ni de certification d’absence universelle de fuite.

## 14. Priorités et directions visuelles

Les recommandations ci-dessous sont des **directions pour une décision ultérieure**, pas une autorisation d’intégration.

| Pattern | Priorité du chantier | Motif | Directions possibles, sans asset créé |
|---|---|---|---|
| **Four tournant** | **P0 — premier** | Calottes dangereuses invisibles, origine mobile cachée, lecture du sens indispensable | 1. Bras thermiques capsulaires à contour net. 2. Barres de métal incandescent avec cœur clair étroit. 3. Petites marques directionnelles tangentielles sans remplir les zones froides. |
| **Four à blanc** | **P0 — deuxième** | Promesse ambiguë des bandes vertes, déplacements des issues entre deux vagues | 1. Trois grandes plaques de four avec bords chauds et bandes froides explicites. 2. Surchauffe ponctuelle du torse/cheminée liée à chaque admission. 3. Cône final au cœur clair, conservant une rupture nette avec la phase de bandes. |
| Secteurs de chauffe | **P1** | Géométrie largement lisible, grand gain de matière ; coins conservateurs à documenter | 1. Plaques de métal rougissant à contour exact. 2. Quelques stries intérieures de chaleur. 3. Extinction courte vers métal froid pendant le cooling. |
| Cône de fournaise | **P1** | Forme correcte mais aplat de prototype, origine/lock peu expressifs | 1. Éventail de chaleur à cœur jaune et flancs orange nets. 2. Stries radiales peu nombreuses. 3. Bref signal de verrouillage et raccord visuel au foyer, sans modifier origine ou portée. |
| Marche à blanc | **P1** | Trois disques semblables, phases superposées et séquence trop discrète | 1. Trois plaques circulaires de four frappées successivement. 2. Cœurs incandescents courts, bords stables. 3. Marques d’ordre plus lisibles, extinction basse et brève de chaque disque. |

**P2 transversal :** deux étincelles mieux raccordées, modulation sobre des trois fentes, souffle ponctuel de cheminée, légère détente au recovery. Facultatif après validation de la lecture. Aucun des cinq patterns ne doit commencer par une accumulation de particules.

Les coins conservateurs des plaques et l’expansion du rayon joueur sont un sujet de contrat visuel transversal à valider avant tout engagement d’exactitude. La recommandation ne consiste pas à changer les hitboxes. Si l’on exige une représentation du domaine du **centre joueur**, elle doit être identifiée comme telle et ne pas être confondue avec la surface chaude.

Hiérarchie à préserver : **SAFE ZONES / TÉLÉGRAPHES > DANGER ACTIF > BOSS > VFX DÉCORATIF**. Le décor actuel respecte déjà sa place sous le sol ; la priorité des contours critiques sur la silhouette n’est pas garantie par les profondeurs actuelles. La matière future ne doit ni combler le corridor central, ni suggérer une traînée dangereuse de Marche, ni couvrir l’encoche des ondes de Chaudière.

## 15. Validation et éléments à ne pas toucher

Suite complète `npm test` exécutée. Premier passage sandbox : **1 755 réussis / 2 échecs**, tous deux `fetch failed`, `connect EACCES 127.0.0.1`, dans `tests/rift-assets-v035b.test.js` et `tests/server-assets.test.js`. Relance complète avec réseau local autorisé : **1 757 tests, 1 757 réussis, 0 échec, 0 skipped**, ≈79,05 s. Aucun test modifié pour obtenir ce résultat.

Galerie : 48 états par format, **96 captures**, zéro erreur console/page pendant la capture ; joueur dedans/dehors vérifié par le prédicat réel, absence de débordement horizontal du banc. Voir aussi `notes/gallery-validation.json` pour la vérification de la page finale.

Hash SHA-256 de **3 637 fichiers de `src` et `tests`** identique avant/après. Le dépôt ignore déjà `production-*/` : la galerie existe localement mais est ignorée par Git ; `.gitignore` n’a pas été modifié. Rapport ajouté à la racine. Les scripts dans le dossier de galerie servent exclusivement à reproduire l’audit ; aucun import de production vers ce dossier.

Ne pas toucher lors de cet audit : stats, dégâts, invulnérabilité, timings, recovery, cooldowns, sélection, mobilité, trajectoires, lock/tracking, hitboxes, caps, règles de sécurité, combos, Marteau-Pilon, Chaudière, assets approuvés, tests. Aucun commit, aucun push, aucun asset de jeu créé, aucune intégration VFX.

Pour revoir la galerie : ouvrir `production-v038d1-maitre-four-audit/gallery.html` directement (captures relatives), ou lancer depuis la racine `node production-v038d1-maitre-four-audit/serve.mjs`, puis ouvrir `http://127.0.0.1:5231/production-v038d1-maitre-four-audit/gallery.html`. Le banc interactif nécessite ce serveur local. Reproduction des mesures : `audit.mjs`, `capture.mjs`, `measure.mjs` ; `audit.mjs --verify` contrôle l’intégrité.

**Fin de l’audit V0.38D.1. Aucun chantier visuel engagé.**
