# V0.38C.5 — Audit du Scorificateur, Zone 6

Audit du code et du runtime local effectué le 18 octobre 2026. **Aucune création/intégration VFX, aucun changement de source, asset ou test, aucun commit/push.** Les validations Android C3/C4 communiquées par l’utilisateur restent acquises ; cet audit n’est pas un nouveau test sur téléphone.

## Conclusion qui doit guider la prochaine planche

Le Scorificateur est un **assaillant à ruée de contact qui laisse une trace thermique différée et fixe au sol**. Son seul pattern choisi par l’IA est `scorch`.

Il ne fait **ni coup de lame autonome, ni arc de coupe, ni balayage angulaire, ni projectile**. L’outil dessiné n’est pas utilisé pour les collisions ou pour calculer l’origine. La menace vient de deux mécanismes : le corps en déplacement et un segment thermique déjà fixé lors de la préparation. Le contact du corps reste également dangereux hors attaque.

Recommandation principale : **trace de scarification incandescente**, avec lecture distincte de la trajectoire de ruée et de la trace persistante. Ne pas concevoir une onde lancée depuis la lame.

## 1. Identité et chemins exacts

Racine de tous les chemins : `C:/LaMineV2/la-mine-v2-v01/`.

| Chemin | Responsabilité vérifiée |
|---|---|
| `src/zones.js` | Zone `forge`, Les Forges Oubliées ; liste des trois mobs et boss |
| `src/enemies/registry.js` | Création du `ForgeActor` pour l’id `scorifier` |
| `src/forge/config.js` | Stats, pattern `scorch`, caps, grille thermique |
| `src/forge/actors.js` | `nextPattern`, `update`, `reposition`, `recover`, angle verrouillé et charge |
| `src/forge/combat.js` | `ForgeCombat.begin`, `forgeLane`, `ForgeGround.request/update`, réservations et vie de la trace |
| `src/forge/geometry.js` | `forgeTouches` et `forgeEscapeReport` |
| `src/run.js` | `spawn`, ordre de simulation, collision de contact balayée, `damagePlayer` |
| `src/enemy.js`, `src/player.js`, `src/config.js`, `src/math.js` | Warmup, dégâts, invulnérabilité, limites, `segmentCircle` |
| `src/forge/waves.js` | Composition et plafonds réels des vingt vagues |
| `src/forge/art.js` | `drawForge`, deux couloirs, label « RUÉE · TRAÎNÉE » |
| `src/combat-art.js` | `dangerLane`, couleurs/traits/flèches actuels |
| `src/arena-view.js` | Graphics sol/télégraphes, profondeur 8 |
| `src/forge-sprite-vfx.js` | Deux petites étincelles pendant la ruée, profondeur 7 |
| `src/enemies/view.js` | Corps, label, cercle d’apparition, profondeur acteurs 15 |
| `src/forge-animation-state.js` | `forgePose`, `advanceForgeAnimation`, lecture des états gameplay |
| `src/forge-animation.js` | Chargement, vérification des sheets, sélection et fallback statique |
| `src/forge-sprite-catalog.js` | Métadonnées Scorificateur, clips, dimensions |
| `src/enemy-facing.js` | Orientation droite/gauche stabilisée ; aucune rotation du sprite |
| `src/room-scene.js` | Boucle scène et appels aux renderers, dt plafonné à 0,04 s |
| `src/projectile-attacks.js` | `isPureProjectile` retourne faux pour `scorch` |
| `src/forge/boss-director.js`, `src/forge/boss-patterns.js`, `src/forge/boss-view.js` | Boss actuels, circuits distincts à ne pas confondre avec `scorch` |

`kind = forgeType = scorifier`. Stats : PV **64**, rayon **19**, vitesse de repositionnement **113 unités/s**, contact **0,5**, warmup d’apparition **1 s**. Le `telegraph:1` de la fiche ennemi est le warmup, **pas** l’anticipation du pattern (1,05 s).

Assets existants, tous inchangés :

- Master : `v037a-scorificateur-final/master/scorificateur.svg`.
- Sheet : `src/assets/enemies-v037c/scorifier-567c72dce85a.svg`.
- Module réellement importé : `src/assets/enemies-v037c/scorifier-567c72dce85a.js`.
- Statique de repli : `src/assets/enemies-v037c/scorifier-567c72dce85a-idle.svg` (également embarqué au catalogue).
- Clé : `forge-v037c-scorifier-567c72dce85a`. Affichage **52 × 52**, cellules **64 × 64**, atlas **512 × 384**, **41 frames**.

## 2. Toutes les menaces réellement utilisées

| Menace | Classification | Déclenchement / durée | Collision et dégâts |
|---|---|---|---|
| Contact ordinaire | H : contact | Dès que le mob est actif ; toutes phases, y compris warning/recovery | Corps rayon 19 ; 0,5, invulnérabilité globale |
| Ruée `scorch` | G + H : charge de contact | Préparation 1,05 s, puis charge nominale 0,65 s à 275 unités/s | Corps mobile et collision balayée ; 0,5 ; aucun hitbox d’outil |
| Trace de `scorch` | D + F : ligne thermique au sol | Warning 1,05 + 0,65 = **1,70 s**, actif **1,30 s**, cooling **0,30 s** | Capsule fixe de rayon 12 autour du segment ; 0,5 |
| Couloirs et label | I : télégraphes | Warning puis indicateur rouge durant la charge | Graphiques seulement ; ils ne créent aucune collision |

A/B/C/E (mêlée dédiée, arc, sweep angulaire, projectile) ne sont pas des attaques du Scorificateur. Aucun `count` de projectiles dans `scorch`, aucune émission de pool à son déclenchement, aucun cône.

### Conditions, cadence et caps

En `positioning`, le mob se rapproche en biais (vecteur vers le joueur, composante latérale alternée ±0,85, normalisé). Il tente `scorch` quand son timer est prêt et la distance au joueur est **≤230 unités**, mesurée après ce déplacement. Aucune distance minimale d’admission, aucun test de bouche d’arme, aucune ligne de vue spécifique.

L’admission exige : moins de **2 Scorificateurs en warning/charge**, aucun hazard déjà réservé par cet owner, place sous le cap **5 dangers au sol / 3 thermiques**, et validation du passage sûr par `forgeEscapeReport`. Un refus ne produit pas d’attaque de remplacement pour ce mob : nouvelle tentative après **0,18 s**.

Recovery **0,70 s**, dont arrêt initial jusqu’à `recoveryElapsed > 0,18`, puis déplacement. Après recovery, retour en positioning avec **0,50 s**. Ces timers ne suffisent pas à déterminer la cadence : l’ancienne trace, y compris cooling, réserve encore l’owner jusqu’à environ **3,30 s après admission**. Le prochain départ attend sa disparition et une nouvelle tentative autorisée.

Rejeu isolé à 60 Hz : premières admissions à **0,800 s**, **4,26667 s**, **7,73333 s** environ, soit intervalle observé **3,46667 s** (warmup retiré dans le banc). Ce n’est pas une cadence garantie : portée, caps, sécurité, murs et quantification interviennent. À l’apparition normale, le warmup 1 s précède le timer initial `.8 + slot*.4` (slot 0 pour ce mob).

### Nombre de hits

Il n’existe pas de compteur « une cible déjà touchée par cette attaque ». Le contact et le hazard appellent tous deux `damagePlayer`, avec la même invulnérabilité globale de **1 s**.

- Charge de 0,65 s : au plus un hit de contact dans cette seule fenêtre si le joueur est vulnérable.
- Trace de 1,3 s : jusqu’à deux hits de 0,5 si le joueur y reste vulnérable assez longtemps.
- Ces maxima **ne s’additionnent pas automatiquement** : une touche de contact peut bloquer le début des dégâts thermiques. D’autres ennemis partagent la même invulnérabilité.
- Le contact reste actif avant/après la charge : son nombre de hits sur une durée arbitraire n’est pas borné par `scorch`. Les boucliers et talents passent par le pipeline existant.

## 3. Géométrie exacte, origine et outil

Soit le centre du mob à l’admission **A=(x,y)** et **a=atan2(joueur.y−y, joueur.x−x)**. `forgeLane` crée immédiatement un segment **A→B** de longueur :

`L = max(0, min(275 × 0,65, distance au bord X pour le centre, distance au bord Y pour le centre))`.

Donc **L nominal ≤178,75 unités**. Le clamp utilise le rayon 19 : centre autorisé entre **x=47…403**, **y=135…647** (arène 28…422 / 116…666). La trace porte `shape:'line', width:12` ; ici `width` est un **demi-épaisseur / rayon de capsule**, pas une largeur totale.

| Géométrie | Valeur exacte |
|---|---|
| Corps | Cercle rayon 19, diamètre 38 |
| Contact avec héros rayon 13 | Distance des centres ≤32 ; balayage relatif entre positions précédentes et actuelles |
| Trace fixe | Segment A→B, capsule rayon 12, largeur totale **24**, bouts arrondis |
| Longueur hors tout de la capsule | L + 24, donc jusqu’à **202,75** hors rayon du joueur |
| Collision trace avec héros | `segmentCircle(A,B,joueur,12+radius)` ; rayon effectif **25** pour le centre du héros, largeur 50 |
| Angle | `attackAngle`/`chargeAngle` verrouillés à l’admission ; pas d’ouverture angulaire |
| Vitesse trace | 0 : pas un projectile et pas une ligne qui progresse |

Le champ générique `radius:36` présent dans l’objet hazard est **ignoré par la branche `shape==='line'`**. Ne pas l’utiliser pour dessiner le futur VFX.

La position réelle de la lame n’est jamais consultée : aucun socket/anchor, aucun décalage avant le mob. Le futur danger au sol doit partir de **A**, centre mémorisé à l’admission. Un éventuel petit accent sur l’outil peut accompagner le sprite, mais ne doit pas devenir la source d’une nouvelle hitbox ou d’un trajet.

## 4. Synchronisation et mouvement

Chronologie nominale depuis l’admission :

| Temps | Actor | Hazard |
|---|---|---|
| 0 → 1,05 s | Warning immobile | Segment fixe jaune ; warning 1,70 s |
| 1,05 → 1,70 s | Charge droite à 275, angle verrouillé | Segment toujours fixe et encore non actif |
| 1,70 → 2,40 s | Recovery 0,70 s ; déplacement après 0,18 s | Trace active |
| 2,40 → 3,00 s | Positioning, poursuite possible | Trace active au point initial |
| 3,00 → 3,30 s | Déplacement/tentatives indépendants | Cooling décoratif |

Le mob s’arrête à un mur ; le warning de la trace **n’est pas raccourci** pour autant. Ni le mob ni le hazard ne retargetent après l’admission. Le mob ne pivote pas tardivement pendant warning/charge. En recovery il peut reprendre une direction vers la position actuelle du joueur, sans modifier la trace.

La séparation entre ennemis ne déplace pas les acteurs `fixedPosition` en warning/charge. La charge utilise directement x/y, pas le recul de `move`. Les collisions ne sont pas déclenchées par une frame du sprite.

### Mesures des timers indépendants

La boucle actor est exécutée avant le contact puis `ForgeGround.update`. Les phases sont discrètes ; ne pas synchroniser un futur VFX avec une égalité de temps supposée. Relevés par admission directe dans le banc :

| Cas | Charge commence | Recovery | Trace active | Trace refroidit |
|---|---|---|---|---|
| 60 Hz, trajet libre | 1,05 | 1,70 | 1,71667 | 3,01667 |
| dt=0,04 s | 1,08 | 1,76 | 1,72 | 3,04 |
| 60 Hz, 3 unités avant mur | 1,05 | 1,06667 | 1,71667 | 3,01667 |

En admission naturelle à l’intérieur du tick, le hazard est décrémenté immédiatement : le premier cycle observé commence warning à 0,8 s, charge à 1,85 s, recovery et ligne active à 2,5 s. Ces variations d’une frame sont réelles.

À dt=0,04 s, la charge fait 17 pas de 11 unités, soit **187 unités**, alors que le segment préparé fait **178,75** : dépassement observé de **8,25 unités** en terrain libre. L’actor vérifie l’expiration après son pas. Cette limite existante est signalée sans correction ; le VFX devra suivre chaque géométrie réelle et non supposer une correspondance parfaite.

## 5. Rendu actuel : deux couloirs distincts

Tout est procédural pour l’attaque. Le sprite de personnage est la sheet approuvée ; aucune sheet d’attaque VFX dédiée.

1. **Couloir fixe du hazard**, A→B, demi-largeur 12. Jaune jusqu’à 1,70 s, rouge lorsqu’actif 1,30 s, bleu-gris au cooling.
2. **Couloir mobile de l’actor**, pendant warning/charge : `forgeLane(e, chargeAngle, 178.75, e.radius)`, donc demi-largeur **19**. Jaune en warning, rouge en charge. Pendant la charge, il est recalculé depuis le centre **courant**, avec toute la longueur nominale, et non la distance restante.

`dangerLane` utilise :

- Jaune `#ffc46b` / rouge actif `#ff795f`.
- Bande centrale épaisseur `2×radius`, alpha **0,14 / 0,23**.
- Deux bordures longitudinales sombres `#10191d`, 5 px, alpha 0,8, puis couleur 2 px alpha 0,95.
- Chevrons directionnels tous les 44 unités, départ 26, traits 2 px alpha 0,8.
- Pas de bouchons arrondis ni de fermeture transversale.
- Cooling du hazard : ligne bleu-gris `#8eb5b9`, 24 px, alpha **0,15**, sans chevrons.
- Petit pictogramme thermique à A : trois traits `#ffefc9`, 2 px, durant warning/actif.
- Label « **RUÉE · TRAÎNÉE** » pendant warning, `#ffe0a5`, texte 11 px, contour sombre 3 px. Cercle d’apparition rayon 27 pendant warmup, couleur `#eb8d72` ; ce n’est pas un hitbox d’attaque.

Ordre : petites étincelles profondeur **7**, sol/télégraphes **8**, acteurs et label **15**, héros **20**, arme **21**. Le flash de blessure global du héros peut teinter une capture ; ce n’est pas un VFX Scorificateur.

### Décoration actuelle

En phase charge, deux étincelles de 1,5 px `#d8864d`, alpha 0,45, dessinées à `e.x−12*facing`, `e.y+15/19`, avec longueur horizontale 5 et décalage vertical ±2. `facing` ne distingue que droite/gauche. Elles suivent le corps et **ne suivent pas la position exacte de la lame ni la rotation de la trajectoire**. Elles sont absentes en mouvement réduit. Aucun émetteur, fumée ou glow.

### Correspondance visuel / collision

- La largeur centrale de la trace correspond au diamètre 24 ; il faut ensuite tenir compte du rayon du joueur pour raisonner sur son centre.
- Les bouts arrondis de rayon 12 ne sont pas dessinés : **sous-représentation aux extrémités**. Le liseré sombre peut dépasser latéralement le rayon de 2,5 px ; c’est de l’encre de contour, pas une collision supplémentaire.
- Pendant warning, couloir large 38 et couloir étroit 24 se superposent : les deux menaces ne sont pas expliquées séparément au joueur.
- Pendant charge, le rouge devant le mob représente un parcours prévisionnel ; **ce n’est pas une zone de dégâts immédiats sur toute sa longueur**. Sa longueur complète recalculée peut dépasser la charge restante ; la capture « Géométrie » le montre.
- La trace entière devient active d’un seul coup, pas progressivement derrière le mob. Le mot « traînée » ne doit pas conduire à inventer une activation par morceau.
- `dangerLane` retourne sans dessiner si L<1. La collision d’un segment nul reste un disque de rayon 12 (25 pour le centre du héros). Au mur x=403, admission possible vers un héros x=409 : **danger quasiment invisible**, hors petit pictogramme. Aucun correctif dans cet audit.

## 6. Animation actuelle

| Clip | Frames | Pilotage |
|---|---|---|
| idle | 0–3 | 4 frames à 5 fps, boucle |
| move | 4–11 | 8 frames à 14 fps, horloge de marche |
| prepare | 12–16 | 5 frames selon progression réelle du warning |
| attack | 17–20 | 4 frames à 14 fps présentes dans l’atlas ; non sélectionnées dans le cycle normal `scorch` |
| recovery | 21–25 | 5 frames selon `recoveryElapsed / 0,7` |
| hit | 26–27 | 2 frames, sélection temporaire hors warning/charge |
| death | 28–34 | 7 frames à 12 fps |
| charge | 35–40 | 6 frames à 16 fps, boucle de marche |

Le gameplay sélectionne une phase et l’adaptateur la lit ; aucun événement de frame ne déclenche de dégâts. Le clip utilisé pendant la ruée est **charge**, pas attack. En mouvement réduit, frame initiale du clip (dernière pour death). Orientation sprite : flip X stabilisé, rotation 0, pas huit vues directionnelles.

Le futur VFX doit lire séparément **phase/positions actor pour la ruée** et **état/coordonnées hazard pour la trace**, avec cleanup à sa disparition. Ne pas se baser sur le clip `attack`, l’orientation du sprite ou la reprise de marche.

## 7. Densité réelle des vagues

Nombres ci-dessous = **totaux de la vague**, pas présence simultanée.

| Vague | Scorificateurs | Chauffeurs | Riveteurs | Cap total vivants | Cap Scorificateurs |
|---|---:|---:|---:|---:|---:|
| 3 | 8 | 0 | 0 | 5 | 4 |
| 4 | 6 | 3 | 2 | 5 | 4 |
| 6 | 7 | 4 | 4 | 8 | 4 |
| 7 | 8 | 4 | 5 | 8 | 4 |
| 8 | 9 | 5 | 5 | 8 | 4 |
| 9 | 10 | 5 | 6 | 8 | 4 |
| 11 | 11 | 6 | 6 | 10 | 5 |
| 12 | 12 | 6 | 7 | 10 | 5 |
| 13 | 13 | 7 | 7 | 10 | 5 |
| 14 | 13 | 7 | 8 | 10 | 5 |
| 16 | 15 | 8 | 8 | 12 | 5 |
| 17 | 16 | 8 | 9 | 12 | 5 |
| 18 | 17 | 9 | 9 | 12 | 5 |
| 19 | 18 | 9 | 10 | 12 | 5 |

Absent des vagues 1/2 et des vagues boss 5/10/15/20. Aucun Scorificateur ajouté aux boss par la composition actuelle. Chauffeur : cap 2 puis 3 à partir de 11 ; Riveteur : 3 puis 4 ; les sommes restent subordonnées au cap global.

**Maximum simultané pertinent pour les VFX :** jusqu’à 5 corps présents, mais **2 seulement en warning/charge**. Jusqu’à **3 réservations thermiques**, incluant warning/actif/cooling, partagées avec Chauffeur et chaleur ambiante. Une réservation par owner ; pas une trace pour chacun des cinq.

Rejeux 20 s avec cinq Scorificateurs : maximum 2 warning/charge, 3 hazards réservés, 2 actifs dans la scène ouverte. Le cas limite près du mur atteint **3 traces actives** : les charges écourtées libèrent plus tôt les slots de ruée, sans raccourcir le délai des traces. Ces plafonds ont été observés, pas déduits seulement des constantes. Le contact de tous les corps reste possible, indépendamment des deux slots.

La chaleur ambiante est déclenchée toutes les 13 / 10 / 8 / 6,5 s selon palier, à partir des vagues concernées, premier essai à 5 s, sous les mêmes caps. Elle peut réduire le nombre de traces disponibles. Les projectiles du Riveteur restent une famille séparée.

## 8. Partages de code à préserver

Chauffeur, Riveteur et Scorificateur partagent `ForgeActor`, `ForgeCombat`, renderer Forge, catalogue et adaptateur d’animation. Chauffeur et Scorificateur partagent le budget thermique ; **le nouveau VFX plaque C4 filtre strictement le Chauffeur et n’habille pas la ligne du Scorificateur**.

Les trois boss actuels utilisent `ForgeBossDirector`, leurs patterns et `drawDungeonHazard`, avec accès aux systèmes de sol/sécurité communs. Les anciens patterns boss présents dans `config.js` ne sont pas des attaques supplémentaires du Scorificateur. Ne pas confondre `ram` et `scorch`.

`dangerLane`, `segmentCircle`, contact, dégâts et couches d’affichage sont aussi utilisés par d’autres zones. `RiftProjectiles` fournit le pool partagé des tirs de la Forge ; il n’est pas utilisé par cette attaque. Les critères Rivet/Lampiste et le filtre Cracheur ne sélectionnent pas le Scorificateur.

La règle V0.38C.1c « projectile réel immédiat, aucune preview » **ne s’applique pas à `scorch`**. Supprimer son warning sous ce prétexte changerait son gameplay et sa lisibilité.

## 9. Performance actuelle, sans optimisation

Pas de sprite VFX Scorificateur. Deux Graphics partagés sont pertinents : `ArenaView.warning` profondeur 8 et `ForgeSpriteVfx.g` profondeur 7. Ils sont réutilisés et effacés/redessinés à chaque update, pas recréés par attaque. Un body sprite par mob, texture partagée. Décoration : 2 traits par charge, donc normalement **4** pour deux charges, limite globale **48 primitives**.

Le sol n’est **pas un pool fixe** : tableaux et hazards sont alloués lors de l’admission, puis filtrés. Chaque trace vit nominalement 1,70 + 1,30 + 0,30 = **3,30 s**, ou moins si l’owner meurt ; wave clear enlève les hazards. `ForgeGround.update` fait deux filtrages de tableau par tick. Le rendu actuel alloue notamment un objet `forgeLane` par actor warning/charge ; le décor crée deux closures et des tableaux de filtrage par update/actor. Il serait faux d’annoncer zéro allocation. Aucun profilage précis de GC n’est revendiqué.

La sheet existante pèse **183 410 octets SVG**, module JS **196 405 octets**, bitmap RGBA8 **786 432 octets = 768 Kio** ; fallback 64×64 soit 16 Kio RGBA8. Il s’agit du personnage, pas d’un nouveau budget VFX. Aucun asset ajouté.

Mesure Chrome desktop / WebGL logiciel : cinq acteurs, deux hazards, deux charges, quatre traits décoratifs. Après chauffe, 80 lots ×100 appels :

| Format | ArenaView médiane / p95 | Décor médiane / p95 |
|---|---|---|
| 320×568 | 0,004 / 0,008 ms | 0,001 / 0,002 ms |
| 390×844 | 0,004 / 0,009 ms | 0,001 / 0,002 ms |

228 objets de scène dans le banc, toujours 228 après 600 ticks supplémentaires. Ce total inclut héros, pools et autres systèmes ; ce n’est pas le nombre d’objets du seul Scorificateur. Mesure CPU d’émission des commandes, pas coût GPU ni garantie de fluidité Android. Aucune optimisation effectuée.

## 10. Fairness : constats techniques seulement

- **Réaction** : 1,05 s avant ruée, 1,70 s avant trace. À vitesse joueur 212, quitter latéralement la zone est généralement possible si un passage existe ; l’admission vérifie une zone froide connectée, pas une garantie individuelle d’esquive de tous les contacts.
- **Distance** : admission ≤230, parcours nominal ≤178,75 plus corps/rayon joueur. Le mob peut rater un joueur immobile assez loin ; aucune homing correction.
- **Très proche** : le contact de corps peut blesser immédiatement, même pendant le warning. Ce n’est pas une activation prématurée du hazard.
- **Verrouillage** : pas de tracking après warning, angle fixe. La trace ne suit ni outil ni mob. Le contact utilise le déplacement relatif du joueur et de l’ennemi, pour éviter de traverser un corps entre deux ticks.
- **Murs** : charge interrompue, trace retardée maintenue ; segment très court voire nul avec collision résiduelle peu lisible. Trois traces actives près d’un mur peuvent être difficiles à séparer.
- **dt élevé** : charge discrète pouvant dépasser légèrement la longueur préparée ; hazard et actor peuvent changer d’état dans un ordre visuel différent d’une frame.
- **Hors écran** : arène entière 450×800 ajustée au viewport, sans caméra poursuivante ; centres clampés dans l’arène, spawns fixes et distants >180. Pas de mécanisme normal d’attaque lancée par un Scorificateur hors arène. Les labels/chevrons près des limites peuvent néanmoins manquer de place et les effets se superposer.
- **Rendu** : double couloir, longue projection rouge en mouvement, capsules sans bouchons et sens seulement droite/gauche de l’outil sont les principales ambiguïtés. Aucune correction d’équilibrage ou de rendu appliquée.

## 11. Trois directions VFX compatibles, sans asset

1. **Trace de scarification incandescente — recommandée.** Une rainure thermique droite au sol, silhouette capsule de largeur 24 et longueur L, bords nets, centre rouge/orange avec très peu de stries. Warning ambre distinct ; activation de toute la trace à l’état `active`, extinction sur cooling. Un discret frottement au niveau du corps pendant charge peut rester secondaire.
2. **Sillon de métal chauffé.** Même géométrie et horloge, bandes d’acier sombres avec deux bords incandescents et quelques fragments immobiles internes. Plus industriel ; attention à ne pas devenir une longue plaque Chauffeur ou un rail décoratif.
3. **Trait de friction thermique sobre.** Bande rouge/orange compacte, bord sombre et deux/trois ruptures internes fixes. Très faible coût et bonne lecture en superposition ; moins descriptif de l’outil mais fidèle au gameplay.

Dans les trois cas : **séparer l’annonce de la ruée et la menace persistante**, origine du hazard A, longueur/clamp issus du code, aucune rotation indépendante, aucun projectile/arc/cone inventé, pas de fumée massive ni de flamme haute. Toute éventuelle réconciliation future du couloir mobile avec la distance restante doit être traitée explicitement dans le prochain cahier des charges, pas glissée dans cet audit.

## 12. Preuves et limites

- Suite existante exécutée sans modification : **1 643 / 1 643**, aucun échec/skip, durée **52 307,9345 ms**. [Journal](production-v038c5-scorificateur-audit/notes/tests.txt).
- Rejeux et tableaux : [gameplay.json](production-v038c5-scorificateur-audit/notes/gameplay.json), script `probe.mjs` dans le dossier d’audit. Les observations ne sont pas de nouveaux tests de production.
- **38 captures**, 19 situations à chacun des formats **320×568 / 390×844**, aucune erreur console : [browser.json](production-v038c5-scorificateur-audit/notes/browser.json).
- [Galerie d’audit](production-v038c5-scorificateur-audit/gallery.html) et [banc interactif](production-v038c5-scorificateur-audit/observe.html).
- Livraison vérifiée à 1280×900, 320×568 et 390×844 : 19 images chargées pour chacune des deux sélections, aucun débordement horizontal ni erreur console. Comparaison SHA-256 des **3 622 fichiers source/tests** avant/après : aucun fichier modifié ou ajouté dans `src/` et `tests/`. [Preuve d’intégrité](production-v038c5-scorificateur-audit/notes/delivery.json).
- Le banc importe les classes de production ; héros à PV étendus, tirs/spawns supplémentaires et chaleur ambiante suspendus, warmup retiré. Les scènes mur/courte distance/position de joueur sont des fixtures d’observation. La surimpression cyan expose la géométrie ; ce n’est pas un nouveau VFX ni une proposition d’asset.
- Contrôles desktop aux formats mobiles uniquement. Aucun test Android physique revendiqué pour C5.

## 13. À ne pas toucher

Stats, warmup, portée d’admission, timers actor/hazard, damage pipeline, invulnérabilité, contact balayé, angle verrouillé, clamp, mouvement/recovery, flood fill de sécurité, caps, compositions, masters/sheets, adaptateurs d’animation, fallbacks et critères des autres VFX. Ne pas appliquer la règle des projectiles immédiats à `scorch`.

**Audit livré. Aucun gameplay, source, asset ou test modifié. Aucun commit/push. Arrêt avant création ou intégration du futur VFX.**
