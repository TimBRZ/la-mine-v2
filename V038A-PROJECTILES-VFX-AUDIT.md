# V0.38A — Audit projectiles et VFX

17 octobre 2026 · Observation uniquement · Projet La Mine V2

## Résultat et méthode de comptage

**162 entrées documentées**, dont **161 actives ou de secours** et un clip déclaré sans appel trouvé. Une entrée désigne un rendu partagé, un effet événementiel ou une variante fonctionnelle de pattern. Les différents boss réutilisant une primitive sont détaillés séparément : ce chiffre n’est ni un nombre de dessins uniques ni une commande de 162 assets. 19 familles actives.

Code actif suivi depuis main.js → RoomScene → ArenaView / EnemyAttacksView / Effects / renderers animés. Factories et compositions réelles des 20 vagues par zone consultées ; présence par entité extraite dans tables/zone-composition.json. Sources de combat Zones1–6 et directions des boss lues. Inventaire des clips du corps joint pour ne pas oublier une attaque intégrée à une sheet. package.json reste 0.33.0 : décalage documentaire historique, aucune mise à jour de version pendant l’audit.

## Familles

| Famille | Entrées actives / secours |
|---|---:|
| Départs de tir | 3 |
| Impacts et énergie | 4 |
| Projectiles joueur | 3 |
| Feedback et statuts | 19 |
| Secours et primitives | 5 |
| Télégraphes communs | 2 |
| Projectiles hostiles | 7 |
| Dangers Zones 1–3 | 11 |
| Gaz et pression | 5 |
| Dangers Zone 4 | 9 |
| Explosions et fragments | 2 |
| Dangers Zone 5 | 4 |
| Boss Zone 5 | 12 |
| Ultimes | 6 |
| Combinaisons | 6 |
| Forge et chaleur | 4 |
| Boss Zone 6 | 15 |
| Décorations Forge | 7 |
| Mort et animation | 37 |

## Constats prioritaires

1. **P1 — Projectiles joueur et impacts.** Trois identités atlas V0.33 ; impacts ballistic partagés Fusil/Mitraillette. Grisou X ajoute conduction, surcharge et anneaux. Départ visuel à la poignée/canon corrigé, origine simulée séparée : ne pas les recoupler.
2. **P1 — Projectiles ennemis.** Un renderer commun dessine pratiquement toutes les têtes en saumon/blanc et contour corail. Le paramètre color influe surtout sur la traînée. Rivets, lumière, gaz, fragments n’ont pas chacun une silhouette propre.
3. **P1 — Géométrie de danger.** dangerLane/dangerCircle structurent les Zones1–5 ; Zone6 ajoute des polygones et couleurs par boss. La surface, les trous sûrs et le début du danger sont plus importants que la décoration.
4. **P2 — Explosions / gaz / pression.** Nombreux rôles réutilisent un disque. Le Souffleur émet un éventail de cinq projectiles pour cone ; la vapeur de Locomotive est un disque. Aucun jet réaliste à inventer dans l’état des lieux.
5. **P2 — Mort.** Animations propres au corps + burst/anneau génériques. Les éclats de mort de l’Éclateur sont de vrais projectiles retardés, distincts de ces débris décoratifs.
6. **P3 — Ultimes.** Z5 et Z6 ont trois ultimes chacun et trois combinaisons chacun. Ils assemblent des primitives existantes, avec séquences et repères sûrs à conserver.

## Actif, secours, historique et absences

- **RoomView** : Ancien rendu progression salles : non importé par RoomScene, utilise ArenaView. Source : src/room-view.js.
- **Z5 anciens cycles** : beam, fan, blackout, charges, chain, ring, lob, rush, slam, cracks : branches de compatibilité conservées ; factory et updateActor normaux passent par DepthsBossDirector et les nouveaux kits. light/plant/leap sont toujours actifs pour les mobs. Source : src/depths/config.js; src/depths/combat.js.
- **Z6 anciens cycles** : plates, jet, slam, doubleSlam, ring, ram, steam, valves, general, tap : diagnostics explicites / anciennes branches. Boss factory = ForgeDungeonBoss ; nouveaux kits + light-* en jeu normal. heat/rivet/rivets/scorch restent actifs pour mobs. Source : src/forge/config.js; src/forge/dungeon-boss.js.
- **Clip atlas spark** : Déclaré dans WEAPON_VFX ; aucun effects.clip("spark") trouvé. Le spark procédural de burst est actif. Source : src/weapon-visuals.js; src/effects.js.
- **Assets antérieurs et planches** : Dossiers v0*, production-*, tests/*snapshot* : archives / QA ; ne pas les choisir comme source runtime. Fichiers versionnés surnuméraires : seuls les catalogues/imports actuels font foi. Source : src/*sprite-catalog.js.
- **Impacts murs / sol** : Aucun événement à l’expiration d’un projectile, ni collision décor destructible : disparition simple. Ne pas inventer un impact existant. Source : src/combat.js; src/enemy-projectiles.js.
- **Fumée / flamme permanente** : Pas de système général d’émetteurs fumée ; gaz souvent disque. Vapeur décorative brève Z6 ; lumières intégrées aux sheets existent, ne pas les traiter comme projectile. Source : src/forge-sprite-vfx.js; src/rift/art.js.
- **Ultime joueur** : Aucun bouton d’ultime joueur trouvé dans la boucle ; Coup de Grisou = perk au kill. Ultimes nommés des boss Z5/Z6 répertoriés. Source : src/explosions.js; src/run.js.

### Résolution et cache

Atlas armes : dimensions512×128, cellule32, vérification frame/cut. En cas d’échec, balle→pellet, énergie→energy, flash→muzzle ; Effects.clip revient à un burst procédural. Une frame invalidée en cours de clip masque l’effet. Les dangers dessinés en Graphics n’ont pas de fallback d’image.

Chaîne d’entités : forge-animation → depths-animation → rift-animation → enemy-animation ; catalogues versionnés pour les sheets chargées. Z5/Z6 vérifient identité et source ; fallback master approuvé, sinon masquage. L’Éclateur a une voie de confiance bonbonne dédiée (burster-visual / override actuel), pas une sélection de concepts. Une animation de corps absente ne doit jamais supprimer le danger Graphics.

L’audit n’a pas provoqué une panne réseau ou vidé le cache Android. Les chemins de secours ont été lus, leurs tests existants exécutés ; un test matériel de cache reste distinct.

### Exceptions de suivi et de mobilité

- Les éventails communs (aimFan / enemyShot) suivent la position du joueur pendant le warning, puis fixent l’angle à l’émission. Les tirs déjà en vol ne tournent pas. Les autres couloirs ne doivent donc pas être documentés indistinctement comme « fixes dès le début ».
- Z5 major-aim suit .8s avant .65s de verrouillage. major-sweep pivote pendant l’activité ; major-cross translate ses axes. Ces mouvements sont des géométries de dégâts, pas un effet décoratif.
- Z6 furnaceCone suit au plus .65rad/s pendant ses premières .35s. furnaceTurn, rotatingPurge, furnaceCone et sideValves possèdent un drift : origine traduite suivant le mouvement préplanifié du boss. La direction de déplacement est gelée, mais la zone n’est pas immobile. Les ondes grandissent ; les bras tournent selon spin.
- Ultimes Z6 : sélection normale en solo sous25% ; pas sélectionnés normalement dans le triple. Les combos et light-* occupent ce rôle en final. Z5 : ultimes sous25% avec admission exclusive.
- Les valeurs numériques des fiches sont les plans de base, avant admission, mobilité et variantes sous50%. Source : forge/boss-mobility.js, boss-pressure.js, boss-director.js, boss-safety.js et enemy-volley.js.

## Séquencement proposé — à valider humainement

1. Planche projectiles joueur : Fusil, Mitraillette, Grisou X, version perçante et comparaison avec projectile hostile.
2. Planche impacts : ballistic, energy, continuité après kill, conduction, surcharge, explosion Grisou. Distinguer visuellement touche, kill et menace ennemie.
3. Planche mobs : Foreuse/Draisine, Sondeur/Grisouteux, Cracheur/Éclateur, Lampiste/Boutefeu, Riveteur/Chauffeur/Scorificateur. Commencer par les familles communes, pas un asset par variante de tir.
4. Planche langage des dangers : couloir/cercle, warning/actif/refroidissement ; puis grammaire gaz/rails/lumière/forge. Valider à320px avant toute déclinaison boss.
5. Boss réguliers : Zones1–4 puis kits Z5/Z6 ; garder repères directionnels, suivi/verrouillage, ordres et zones sûres.
6. Ultimes et combinaisons : six ultimes + six combos, tests de chevauchement et reducedMotion.
7. Seulement après validation : sheets/VFX, intégration bornée, preuves de non-régression. Aucun de ces travaux n’est commencé ici.

## Risques et limites

- **Hitbox perçue** : dangerLane utilise une demi-largeur ; sprites de balle plus grands que leur test de touche ; anneaux décoratifs ne représentent pas toujours un rayon de dégâts. Ne pas prendre le diamètre apparent comme nouveau collider.
- **Temps** : séparer préparation, tracking, verrouillage, activité, récupération et cooling. Les délais peuvent varier sous50% et être retardés par les budgets. Les valeurs détaillées sont celles des specs/plans, pas une horloge décorative.
- **Superpositions** : pool84 joueur,48 Effects ; hostile8 Zones1–3 puis24 Zones4–6 ; zones3 au Puits,4 Faille,5 Profondeurs/Forge ; heat3 ; majeurs2. Les fragments et réservations partagent ces budgets. VFX Forge48 primitives supplémentaires maximum.
- **Couches** : joueur VFX7, warnings8, acteurs15/20, hostile24, texte50/60. Un embellissement sous un sprite peut masquer un warning ; un glow au-dessus peut effacer les petits projectiles.
- **Mouvement réduit** : coupe des particules et mini-clips/ForgeVFX ; warnings restent. Ne pas rendre l’esquive dépendante d’un effet supprimé.
- **Lecture mobile** : les petits signes (ordre, flèches, traînées) sont plus fragiles que les grands volumes. Le même ambre avertit plusieurs types ; les couleurs seules ne doivent pas coder la sûreté.
- **Preuve visuelle** : galerie et banc utilisent les renderers actuels et des scénarios d’observation en mémoire. Captures représentatives, pas une revue image par image de toutes les occurrences ni une mesure de performance Android. Android physique non testé.
- **Absences** : pas d’impact décor/sol confirmé, pas de fumée permanente générale, pas d’ultime joueur. Ne pas confondre les textes de concepts avec un effet effectivement codé.

## Validation

- Tests existants : **1 252 / 1 252 réussis**, zéro échec, zéro test ignoré, 76,46 s (npm.cmd test).
- Intégrité : **3 574 fichiers src/ et tests/ identiques par SHA-256**, aucun fichier ajouté ou supprimé dans ces arbres ; preuve dans notes/integrity.json.
- Navigateur : 50 scénarios à320×568 et 50 à390×844, zéro erreur et zéro avertissement console sur le banc final. Chaque scénario avance au maximum 361 ticks à60Hz, ou jusqu’à la fin du combat.
- Galerie : 162 fiches ; six captures chargées ; recherche et ouverture de fiche vérifiées ; largeur de document égale à320 puis390px, sans débordement horizontal ; console finale vide.
- Captures représentatives : Zone1 Mitraillette ; Zone2 rails actifs ; Zone3 éventail vapeur ; Zone4 explosion/gaz ; Zone5 charges numérotées ; Zone6 onde de pression.
- La capture Zone4 à320px garde une limite circulaire nette ; les textes restent minuscules. La capture Zone5 montre bien quatre positions, mais la lecture des chiffres est fragile. La capture Zone6 montre clairement l’encoche sûre. Le tir de Mitraillette reste très fin.
- **Limites** : banc isolé sans HUD ni menus, joueur immobile, pas de run complète ; pas de contrôle image par image de chaque entrée ni de tous les ultimes longs. Android physique non testé. Les plafonds observés ne constituent pas un benchmark mobile.
- Reproduction : depuis la racine, lancer `node v038a-projectiles-vfx-audit/server.mjs`, puis ouvrir http://127.0.0.1:5213/v038a-projectiles-vfx-audit/gallery.html. Serveur de consultation local indépendant, aucune modification de server.mjs du jeu.

Voir notes/validation.json et notes/tests.txt pour les résultats mesurés, captures/ pour les vues navigateur. Le banc isolé ne persiste ni récompense, ni profil, ni leaderboard. Les fichiers source et assets sont contrôlés par SHA-256 avant/après ; aucune refonte graphique.

## Tableau récapitulatif

| ID | Élément | Zones | Source | Priorité | État |
|---|---|---|---|---|---|
| VFX-001 | muzzle-shotgun | 1–6 | Fusil à pompe | P1 | actif |
| VFX-002 | muzzle-smg | 1–6 | Mitraillette | P1 | actif |
| VFX-003 | muzzle-grisoux | 1–6 | Grisou X / perks énergie | P1 | actif |
| VFX-004 | impact-ballistic | 1–6 | Armes / héros | P1 | actif |
| VFX-005 | impact-energy | 1–6 | Grisou X / perks énergie | P1 | actif |
| VFX-006 | overload-energy | 1–6 | Grisou X / perks énergie | P2 | actif |
| VFX-007 | spark | 1–6 | Armes / héros | P2 | déclaré non appelé |
| VFX-008 | projectile-energy | 1–6 | Grisou X / perks énergie | P1 | actif |
| VFX-009 | dust | 1–6 | Armes / héros | P2 | actif |
| VFX-010 | conduction | 1–6 | Grisou X / perks énergie | P2 | actif |
| VFX-011 | projectile-shotgun | 1–6 | Fusil à pompe | P1 | actif |
| VFX-012 | projectile-smg | 1–6 | Mitraillette | P1 | actif |
| VFX-013 | pellet | 1–6 | Textures procédurales | P2 | secours actif |
| VFX-014 | energy | 1–6 | Textures procédurales | P2 | secours actif |
| VFX-015 | muzzle | 1–6 | Textures procédurales | P2 | secours actif |
| VFX-016 | spark | 1–6 | Textures procédurales | P2 | actif |
| VFX-017 | ring | 1–6 | Textures procédurales | P2 | actif |
| VFX-018 | hit / kill impact | 1–6 | Joueur / événements combat | P1 | actif |
| VFX-019 | continuing | 1–6 | Joueur / événements combat | P1 | actif |
| VFX-020 | energy-arc | 1–6 | Joueur / événements combat | P2 | actif |
| VFX-021 | explosion / GRISOU ! | 1–6 | Joueur / événements combat | P1 | actif |
| VFX-022 | extra / DOUBLE ! | 1–6 | Joueur / événements combat | P2 | actif |
| VFX-023 | shield / shield-hit | 1–6 | Joueur / événements combat | P1 | actif |
| VFX-024 | boostSeconds | 1–6 | Joueur / événements combat | P2 | actif |
| VFX-025 | heat / criticalHeat | 1–6 | Joueur / événements combat | P2 | actif |
| VFX-026 | hurt / damageWash | 1–6 | Joueur / événements combat | P1 | actif |
| VFX-027 | enemy.flash | 1–6 | Joueur / événements combat | P1 | actif |
| VFX-028 | hero invulnerability | 1–6 | Joueur / événements combat | P1 | actif |
| VFX-029 | spawn warmup / retirement | 1–6 | Joueur / événements combat | P1 | actif |
| VFX-030 | aimLabel | 1–6 | Joueur / événements combat | P1 | actif |
| VFX-031 | kill particles | 1–6 | Joueur / événements combat | P2 | actif |
| VFX-032 | talent / perkFlash | 1–6 | Joueur / événements combat | P2 | actif |
| VFX-033 | loot-collected / drops | 1–6 | Joueur / événements combat | P2 | actif |
| VFX-034 | camera shake | 1–6 | Joueur / événements combat | P2 | actif |
| VFX-035 | dangerLane | 1–6 | Géométrie partagée | P1 | actif |
| VFX-036 | dangerCircle | 1–6 | Géométrie partagée | P1 | actif |
| VFX-037 | EnemyAttacksView.bolts | 1–6 | Tous les pools hostiles | P1 | actif |
| VFX-038 | drill: simple / fan3 | 1, 2, 3, 4 | drill | P1 | actif |
| VFX-039 | draisine: fan3 | 2 | draisine | P1 | actif |
| VFX-040 | crachefer: simple / fan / circle6–8 | 1 | crachefer | P1 | actif |
| VFX-041 | switchman: burst / fan / circle | 2 | switchman | P1 | actif |
| VFX-042 | compressor: steam / radial | 3 | compressor | P1 | actif |
| VFX-043 | firedamp: energy | 3 | firedamp | P1 | actif |
| VFX-044 | haveuse: charge | 1 | haveuse | P2 | actif |
| VFX-045 | wagon: rail-charge | 2 | wagon | P2 | actif |
| VFX-046 | stationmaster: charge / wagon | 2 | stationmaster | P2 | actif |
| VFX-047 | locomotive: ram | 2 | locomotive | P2 | actif |
| VFX-048 | locomotive: steam | 2 | locomotive | P2 | actif |
| VFX-049 | switchman: rails horizontal / vertical / cross | 2 | switchman | P2 | actif |
| VFX-050 | effondreur: zones | 1 | effondreur | P2 | actif |
| VFX-051 | deepdriller: charge | 3 | deepdriller | P2 | actif |
| VFX-052 | surveyor: impact | 3, 4 | surveyor | P2 | actif |
| VFX-053 | gasminer: blast | 3, 4 | gasminer | P2 | actif |
| VFX-054 | cager: charge / front / cable | 3 | cager | P2 | actif |
| VFX-055 | compressor: pressure | 3 | compressor | P2 | actif |
| VFX-056 | firedamp: gas / blast | 3 | firedamp | P2 | actif |
| VFX-057 | shaft instability | 3 | Environnement | P2 | actif |
| VFX-058 | spitter: spit | 4 | spitter | P2 | actif |
| VFX-059 | burster: blast | 4 | burster | P2 | actif |
| VFX-060 | burster: death-burst | 4 | burster | P2 | actif |
| VFX-061 | splitter: charge | 4 | splitter | P2 | actif |
| VFX-062 | splitter: fan8 | 4 | splitter | P2 | actif |
| VFX-063 | splitter: fissures | 4 | splitter | P2 | actif |
| VFX-064 | blower: circle8 | 4 | blower | P2 | actif |
| VFX-065 | blower: pockets | 4 | blower | P2 | actif |
| VFX-066 | blower: cone | 4 | blower | P2 | actif |
| VFX-067 | core: double | 4 | core | P2 | actif |
| VFX-068 | core: rain | 4 | core | P2 | actif |
| VFX-069 | core: orb | 4 | core | P2 | actif |
| VFX-070 | rift environmental pockets | 4 | Environnement | P2 | actif |
| VFX-071 | lampist: light | 5 | lampist | P1 | actif |
| VFX-072 | blaster: plant | 5 | blaster | P1 | actif |
| VFX-073 | blackmaw: leap | 5 | blackmaw | P1 | actif |
| VFX-074 | extinction / return light | 5 | Zone / Lampiste-Major | P1 | actif |
| VFX-075 | extinction rocks | 5 | Environnement | P2 | actif |
| VFX-076 | major-sweep | 5 | lampmajor | P2 | actif |
| VFX-077 | major-aim | 5 | lampmajor | P2 | actif |
| VFX-078 | major-dark | 5 | lampmajor | P2 | actif |
| VFX-079 | major-cross | 5 | lampmajor | P2 | actif |
| VFX-080 | major-blackout | 5 | lampmajor | P3 | actif |
| VFX-081 | demo-plan | 5 | dynamiter | P2 | actif |
| VFX-082 | demo-chain | 5 | dynamiter | P2 | actif |
| VFX-083 | demo-quadrants | 5 | dynamiter | P2 | actif |
| VFX-084 | demo-lob | 5 | dynamiter | P2 | actif |
| VFX-085 | demo-demolition | 5 | dynamiter | P3 | actif |
| VFX-086 | mass-charge | 5 | blackmass | P2 | actif |
| VFX-087 | mass-slam | 5 | blackmass | P2 | actif |
| VFX-088 | mass-triple | 5 | blackmass | P2 | actif |
| VFX-089 | mass-fissures | 5 | blackmass | P2 | actif |
| VFX-090 | mass-pit | 5 | blackmass | P3 | actif |
| VFX-091 | Z5 combo-light | 5 | Deux boss coordonnés | P3 | actif |
| VFX-092 | Z5 combo-corridor | 5 | Deux boss coordonnés | P3 | actif |
| VFX-093 | Z5 combo-heavy | 5 | Deux boss coordonnés | P3 | actif |
| VFX-094 | stoker: heat | 6 | stoker | P1 | actif |
| VFX-095 | riveter: rivet / rivets | 6 | riveter | P1 | actif |
| VFX-096 | scorifier: scorch | 6 | scorifier | P1 | actif |
| VFX-097 | environment heat plate | 6 | Environnement | P2 | actif |
| VFX-098 | sectors | 6 | furnace | P2 | actif |
| VFX-099 | furnaceCone | 6 | furnace | P2 | actif |
| VFX-100 | furnaceTurn | 6 | furnace | P2 | actif |
| VFX-101 | whiteMarch | 6 | furnace | P2 | actif |
| VFX-102 | whiteFurnace | 6 | furnace | P3 | actif |
| VFX-103 | targetStrike | 6 | hammer | P2 | actif |
| VFX-104 | doubleBeat | 6 | hammer | P2 | actif |
| VFX-105 | forgeRhythm | 6 | hammer | P2 | actif |
| VFX-106 | counterStroke | 6 | hammer | P2 | actif |
| VFX-107 | redCadence | 6 | hammer | P3 | actif |
| VFX-108 | sideValves | 6 | boiler | P2 | actif |
| VFX-109 | rotatingPurge | 6 | boiler | P2 | actif |
| VFX-110 | groundPressure | 6 | boiler | P2 | actif |
| VFX-111 | pressureWave | 6 | boiler | P2 | actif |
| VFX-112 | valveRupture | 6 | boiler | P3 | actif |
| VFX-113 | Z6 forgePressure | 6 | Deux boss coordonnés | P3 | actif |
| VFX-114 | Z6 whiteHammer | 6 | Deux boss coordonnés | P3 | actif |
| VFX-115 | Z6 pressureCadence | 6 | Deux boss coordonnés | P3 | actif |
| VFX-116 | light-furnace | 6 | furnace | P2 | actif |
| VFX-117 | light-hammer | 6 | hammer | P2 | actif |
| VFX-118 | light-boiler | 6 | boiler | P2 | actif |
| VFX-119 | rivet flash | 6 | riveter | P2 | actif |
| VFX-120 | friction | 6 | scorifier | P2 | actif |
| VFX-121 | heat puff | 6 | stoker | P2 | actif |
| VFX-122 | impact dust | 6 | hammer | P2 | actif |
| VFX-123 | vapor | 6 | boiler | P2 | actif |
| VFX-124 | core sparks | 6 | furnace | P2 | actif |
| VFX-125 | decompression | 6 | bosses Z6 | P2 | actif |
| VFX-126 | rat: death | 1, 2, 3 | rat | P2 | actif |
| VFX-127 | miner: death | 1, 2, 3 | miner | P2 | actif |
| VFX-128 | drill: death | 1, 2, 3, 4 | drill | P2 | actif |
| VFX-129 | haveuse: death | 1 | haveuse | P2 | actif |
| VFX-130 | crachefer: death | 1 | crachefer | P2 | actif |
| VFX-131 | effondreur: death | 1 | effondreur | P2 | actif |
| VFX-132 | wagon: death | 2 | wagon | P2 | actif |
| VFX-133 | draisine: death | 2 | draisine | P2 | actif |
| VFX-134 | stationmaster: death | 2 | stationmaster | P2 | actif |
| VFX-135 | locomotive: death | 2 | locomotive | P2 | actif |
| VFX-136 | switchman: death | 2 | switchman | P2 | actif |
| VFX-137 | deepdriller: death | 3 | deepdriller | P2 | actif |
| VFX-138 | surveyor: death | 3, 4 | surveyor | P2 | actif |
| VFX-139 | gasminer: death | 3, 4 | gasminer | P2 | actif |
| VFX-140 | cager: death | 3 | cager | P2 | actif |
| VFX-141 | compressor: death | 3 | compressor | P2 | actif |
| VFX-142 | firedamp: death | 3 | firedamp | P2 | actif |
| VFX-143 | crawler: death | 4 | crawler | P2 | actif |
| VFX-144 | spitter: death | 4 | spitter | P2 | actif |
| VFX-145 | burster: death | 4 | burster | P2 | actif |
| VFX-146 | splitter: death | 4 | splitter | P2 | actif |
| VFX-147 | blower: death | 4 | blower | P2 | actif |
| VFX-148 | core: death | 4 | core | P2 | actif |
| VFX-149 | lampist: death | 5 | lampist | P2 | actif |
| VFX-150 | blaster: death | 5 | blaster | P2 | actif |
| VFX-151 | blackmaw: death | 5 | blackmaw | P2 | actif |
| VFX-152 | lampmajor: death | 5 | lampmajor | P2 | actif |
| VFX-153 | dynamiter: death | 5 | dynamiter | P2 | actif |
| VFX-154 | blackmass: death | 5 | blackmass | P2 | actif |
| VFX-155 | stoker: death | 6 | stoker | P2 | actif |
| VFX-156 | riveter: death | 6 | riveter | P2 | actif |
| VFX-157 | scorifier: death | 6 | scorifier | P2 | actif |
| VFX-158 | furnace: death | 6 | furnace | P2 | actif |
| VFX-159 | hammer: death | 6 | hammer | P2 | actif |
| VFX-160 | boiler: death | 6 | boiler | P2 | actif |
| VFX-161 | hero: hit / death / shoot | 1–6 | Héros | P2 | actif |
| VFX-162 | enemy prepare / attack / recovery / hit | 1–6 | Toutes les entités animées | P1 | actif |

## Fiches détaillées

### VFX-001 — muzzle-shotgun

- Famille : Départs de tir. Zone(s) : 1–6. Source : Fusil à pompe. **P1 — actif**.
- Rôle : Départ visuel du tir.
- Rendu : 32 × 26 unités ; atlas SVG V0.33, cellules 32 px. Couleur : Ivoire / ocre / gris. Animation : 3 frame(s), 0.065s.
- Réutilisation : Atlas partagé.
- Dépendance / sensibilité : Événement confirmé uniquement ; ne pas déplacer le départ gameplay. Depth 7, sous les warnings depth 8.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/weapon-visuals.js; src/room-scene.js; src/effects.js.

### VFX-002 — muzzle-smg

- Famille : Départs de tir. Zone(s) : 1–6. Source : Mitraillette. **P1 — actif**.
- Rôle : Départ visuel du tir.
- Rendu : 19 × 16 unités ; atlas SVG V0.33, cellules 32 px. Couleur : Ivoire / ocre / gris. Animation : 2 frame(s), 0.035s.
- Réutilisation : Atlas partagé.
- Dépendance / sensibilité : Événement confirmé uniquement ; ne pas déplacer le départ gameplay. Depth 7, sous les warnings depth 8.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/weapon-visuals.js; src/room-scene.js; src/effects.js.

### VFX-003 — muzzle-grisoux

- Famille : Départs de tir. Zone(s) : 1–6. Source : Grisou X / perks énergie. **P1 — actif**.
- Rôle : Départ visuel du tir.
- Rendu : 28 × 24 unités ; atlas SVG V0.33, cellules 32 px. Couleur : Turquoise / blanc / anthracite. Animation : 3 frame(s), 0.07s.
- Réutilisation : Atlas partagé.
- Dépendance / sensibilité : Événement confirmé uniquement ; ne pas déplacer le départ gameplay. Depth 7, sous les warnings depth 8.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/weapon-visuals.js; src/room-scene.js; src/effects.js.

### VFX-004 — impact-ballistic

- Famille : Impacts et énergie. Zone(s) : 1–6. Source : Armes / héros. **P1 — actif**.
- Rôle : Accusé visuel de touche / conduction / surcharge.
- Rendu : 23 × 23 unités ; atlas SVG V0.33, cellules 32 px. Couleur : Ivoire / ocre / gris. Animation : 4 frame(s), 0.12s.
- Réutilisation : Atlas partagé.
- Dépendance / sensibilité : Événement confirmé uniquement ; ne pas déplacer le départ gameplay. Depth 7, sous les warnings depth 8.
- Lisibilité : Effet bref, parfois sous les acteurs et warnings : sa durée et sa densité nécessiteront une validation animée dédiée ; aucune capture ne valide ici chaque frame.
- Code : src/weapon-visuals.js; src/room-scene.js; src/effects.js.

### VFX-005 — impact-energy

- Famille : Impacts et énergie. Zone(s) : 1–6. Source : Grisou X / perks énergie. **P1 — actif**.
- Rôle : Accusé visuel de touche / conduction / surcharge.
- Rendu : 27 × 27 unités ; atlas SVG V0.33, cellules 32 px. Couleur : Turquoise / blanc / anthracite. Animation : 5 frame(s), 0.17s.
- Réutilisation : Atlas partagé.
- Dépendance / sensibilité : Événement confirmé uniquement ; ne pas déplacer le départ gameplay. Depth 7, sous les warnings depth 8.
- Lisibilité : Effet bref, parfois sous les acteurs et warnings : sa durée et sa densité nécessiteront une validation animée dédiée ; aucune capture ne valide ici chaque frame.
- Code : src/weapon-visuals.js; src/room-scene.js; src/effects.js.

### VFX-006 — overload-energy

- Famille : Impacts et énergie. Zone(s) : 1–6. Source : Grisou X / perks énergie. **P2 — actif**.
- Rôle : Accusé visuel de touche / conduction / surcharge.
- Rendu : 40 × 40 unités ; atlas SVG V0.33, cellules 32 px. Couleur : Turquoise / blanc / anthracite. Animation : 6 frame(s), 0.22s.
- Réutilisation : Surcharge Grisou X ET explosion du perk Grisou.
- Dépendance / sensibilité : Événement confirmé uniquement ; ne pas déplacer le départ gameplay. Depth 7, sous les warnings depth 8.
- Lisibilité : Effet bref, parfois sous les acteurs et warnings : sa durée et sa densité nécessiteront une validation animée dédiée ; aucune capture ne valide ici chaque frame.
- Code : src/weapon-visuals.js; src/room-scene.js; src/effects.js.

### VFX-007 — spark

- Famille : Impacts et énergie. Zone(s) : 1–6. Source : Armes / héros. **P2 — déclaré non appelé**.
- Rôle : Clip déclaré sans appel runtime trouvé.
- Rendu : 10 × 10 unités ; atlas SVG V0.33, cellules 32 px. Couleur : Ivoire / ocre / gris. Animation : 4 frame(s), 0.14s.
- Réutilisation : Atlas partagé.
- Dépendance / sensibilité : Événement confirmé uniquement ; ne pas déplacer le départ gameplay. Depth 7, sous les warnings depth 8.
- Lisibilité : Effet bref, parfois sous les acteurs et warnings : sa durée et sa densité nécessiteront une validation animée dédiée ; aucune capture ne valide ici chaque frame.
- Code : src/weapon-visuals.js; src/room-scene.js; src/effects.js.

### VFX-008 — projectile-energy

- Famille : Projectiles joueur. Zone(s) : 1–6. Source : Grisou X / perks énergie. **P1 — actif**.
- Rôle : Suivi du projectile simulé.
- Rendu : 24 × 24 unités ; atlas SVG V0.33, cellules 32 px. Couleur : Turquoise / blanc / anthracite. Animation : 4 frame(s), 0.16s en boucle.
- Réutilisation : Atlas partagé.
- Dépendance / sensibilité : Position/rotation du projectile ; piercing élargit le visuel ×1,15 sans changer le test enemy.radius+2.
- Lisibilité : Atlas à silhouette distincte, mais petite empreinte écran. Capture Mitraillette Zone 1 à390px : tir fin, à préserver face aux grands dangers. Les trois armes ne sont pas toutes représentées par une capture de projectile en vol.
- Code : src/weapon-visuals.js; src/room-scene.js; src/effects.js.

### VFX-009 — dust

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Armes / héros. **P2 — actif**.
- Rôle : Poussière des pas.
- Rendu : 18 × 18 unités ; atlas SVG V0.33, cellules 32 px. Couleur : Ivoire / ocre / gris. Animation : 4 frame(s), 0.22s.
- Réutilisation : Atlas partagé.
- Dépendance / sensibilité : Événement confirmé uniquement ; ne pas déplacer le départ gameplay. Depth 7, sous les warnings depth 8.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/weapon-visuals.js; src/room-scene.js; src/effects.js.

### VFX-010 — conduction

- Famille : Impacts et énergie. Zone(s) : 1–6. Source : Grisou X / perks énergie. **P2 — actif**.
- Rôle : Accusé visuel de touche / conduction / surcharge.
- Rendu : 26 × 26 unités ; atlas SVG V0.33, cellules 32 px. Couleur : Turquoise / blanc / anthracite. Animation : 4 frame(s), 0.13s.
- Réutilisation : Traversée et arc entre ennemis.
- Dépendance / sensibilité : Événement confirmé uniquement ; ne pas déplacer le départ gameplay. Depth 7, sous les warnings depth 8.
- Lisibilité : Effet bref, parfois sous les acteurs et warnings : sa durée et sa densité nécessiteront une validation animée dédiée ; aucune capture ne valide ici chaque frame.
- Code : src/weapon-visuals.js; src/room-scene.js; src/effects.js.

### VFX-011 — projectile-shotgun

- Famille : Projectiles joueur. Zone(s) : 1–6. Source : Fusil à pompe. **P1 — actif**.
- Rôle : Suivi du projectile simulé.
- Rendu : 18 × 18 unités ; atlas SVG V0.33, cellules 32 px. Couleur : Ivoire / ocre / gris. Animation : 1 frame(s), 1s.
- Réutilisation : Atlas partagé.
- Dépendance / sensibilité : Position/rotation du projectile ; piercing élargit le visuel ×1,15 sans changer le test enemy.radius+2.
- Lisibilité : Atlas à silhouette distincte, mais petite empreinte écran. Capture Mitraillette Zone 1 à390px : tir fin, à préserver face aux grands dangers. Les trois armes ne sont pas toutes représentées par une capture de projectile en vol.
- Code : src/weapon-visuals.js; src/room-scene.js; src/effects.js.

### VFX-012 — projectile-smg

- Famille : Projectiles joueur. Zone(s) : 1–6. Source : Mitraillette. **P1 — actif**.
- Rôle : Suivi du projectile simulé.
- Rendu : 24 × 24 unités ; atlas SVG V0.33, cellules 32 px. Couleur : Ivoire / ocre / gris. Animation : 1 frame(s), 1s.
- Réutilisation : Atlas partagé.
- Dépendance / sensibilité : Position/rotation du projectile ; piercing élargit le visuel ×1,15 sans changer le test enemy.radius+2.
- Lisibilité : Atlas à silhouette distincte, mais petite empreinte écran. Capture Mitraillette Zone 1 à390px : tir fin, à préserver face aux grands dangers. Les trois armes ne sont pas toutes représentées par une capture de projectile en vol.
- Code : src/weapon-visuals.js; src/room-scene.js; src/effects.js.

### VFX-013 — pellet

- Famille : Secours et primitives. Zone(s) : 1–6. Source : Textures procédurales. **P2 — secours actif**.
- Rôle : Balle de secours.
- Rendu : Capsule 16×6. Couleur : Ocre / ivoire. Animation : Position / rotation.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Atlas manquant ou effet générique ; ne pas confondre spark procédural utilisé et clip atlas spark non appelé.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/textures.js; src/effects.js; src/room-scene.js.

### VFX-014 — energy

- Famille : Secours et primitives. Zone(s) : 1–6. Source : Textures procédurales. **P2 — secours actif**.
- Rôle : Énergie de secours.
- Rendu : Capsule 24×10. Couleur : Turquoise / blanc. Animation : Position / rotation.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Atlas manquant ou effet générique ; ne pas confondre spark procédural utilisé et clip atlas spark non appelé.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/textures.js; src/effects.js; src/room-scene.js.

### VFX-015 — muzzle

- Famille : Secours et primitives. Zone(s) : 1–6. Source : Textures procédurales. **P2 — secours actif**.
- Rôle : Flash de secours.
- Rendu : Triangles 36×30. Couleur : Ocre / ivoire. Animation : Position / rotation.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Atlas manquant ou effet générique ; ne pas confondre spark procédural utilisé et clip atlas spark non appelé.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/textures.js; src/effects.js; src/room-scene.js.

### VFX-016 — spark

- Famille : Secours et primitives. Zone(s) : 1–6. Source : Textures procédurales. **P2 — actif**.
- Rôle : Particule procédurale.
- Rendu : Rectangle 6×4. Couleur : Teinte événement. Animation : Vitesse amortie, alpha .15–.35s.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Atlas manquant ou effet générique ; ne pas confondre spark procédural utilisé et clip atlas spark non appelé.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/textures.js; src/effects.js; src/room-scene.js.

### VFX-017 — ring

- Famille : Secours et primitives. Zone(s) : 1–6. Source : Textures procédurales. **P2 — actif**.
- Rôle : Anneau procédural.
- Rendu : Cercle 40×40. Couleur : Teinte événement. Animation : Scale + alpha sur .22s.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Atlas manquant ou effet générique ; ne pas confondre spark procédural utilisé et clip atlas spark non appelé.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/textures.js; src/effects.js; src/room-scene.js.

### VFX-018 — hit / kill impact

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P1 — actif**.
- Rôle : Touche ennemi.
- Rendu : Clip à l’entrée (centre − rayon × .9) + éclats. Couleur : Ocre ou turquoise. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Une touche par ennemi/frame pour hit ; kill utilise aussi impactFeedback.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-019 — continuing

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P1 — actif**.
- Rôle : Traversée après cible / kill.
- Rendu : Petit anneau + conduction. Couleur : Turquoise. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Uniquement projectile énergie continuing ; aucune nouvelle collision visuelle.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-020 — energy-arc

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P2 — actif**.
- Rôle : Arc vers un voisin après kill.
- Rendu : 3 clips conduction répartis + anneau cible. Couleur : Turquoise. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Endpoints événement ; effet .13s, pas un laser continu.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-021 — explosion / GRISOU !

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P1 — actif**.
- Rôle : Coup de Grisou, explosion au kill.
- Rendu : Éclats + anneau + overload-energy + texte + shake. Couleur : Orange / turquoise. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Anneau endScale=radius/20 ; animation .22s non équivalente au disque de dégâts instantané.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-022 — extra / DOUBLE !

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P2 — actif**.
- Rôle : Double tir.
- Rendu : Anneau au canon + texte. Couleur : Jaune. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événement shot.extra ; ne pas annoncer un projectile supplémentaire avant émission.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-023 — shield / shield-hit

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P1 — actif**.
- Rôle : Bouclier puis coup bloqué.
- Rendu : Cercle 24 + rectangle ; rupture anneau et éclats. Couleur : Cyan. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : shield>0 et événement shield-hit.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-024 — boostSeconds

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P2 — actif**.
- Rôle : Bottes / vitesse.
- Rendu : Cercle 17 aux pieds. Couleur : Or. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Uniquement pendant boostSeconds>0.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-025 — heat / criticalHeat

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P2 — actif**.
- Rôle : Surchauffe Mitraillette.
- Rendu : Cercle 19, opacité variable. Couleur : Orange → violet pâle critique. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : heat>0 ; critique à .4 ; ne pas confondre avec hazard ennemi.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-026 — hurt / damageWash

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P1 — actif**.
- Rôle : Dégâts joueur.
- Rendu : Éclats + anneau + voile écran + shake. Couleur : Corail. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : hurt confirmé ; voile alpha .12 puis décroissance.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-027 — enemy.flash

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P1 — actif**.
- Rôle : Touche ennemi.
- Rendu : Tint bref du corps. Couleur : Ivoire #ffe3b9. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Durée flash simulée ; maintenu en mouvement réduit.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-028 — hero invulnerability

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P1 — actif**.
- Rôle : Invulnérabilité joueur.
- Rendu : Clignotement alpha du héros. Couleur : Palette héros. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Lire drawHero ; ne pas allonger la fenêtre visuelle au-delà du statut.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-029 — spawn warmup / retirement

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P1 — actif**.
- Rôle : Annonce apparition / retrait.
- Rendu : Anneau autour ennemi, pulsation puis disparition ; alpha retrait. Couleur : Couleur entité. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : warmup, active, retireRemaining ; aucun changement du moment de contact.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-030 — aimLabel

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P1 — actif**.
- Rôle : Annonce attaque / verrouillage / récupération.
- Rendu : Texte ancré à l’acteur et déplacé près du bord haut. Couleur : Ivoire. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Source pattern/phase ; VOIE, VISÉE, ÉVENTAIL, DÉCOMPRESSION… pas un timer indépendant.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-031 — kill particles

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P2 — actif**.
- Rôle : Mort mob/boss générique.
- Rendu : 4/8 éclats et anneau 1.15/3. Couleur : Gris vert / or boss. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Particules purement décoratives ; pool 48 ; aucun débris collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-032 — talent / perkFlash

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P2 — actif**.
- Rôle : Activation talent ou perk.
- Rendu : Texte temporaire au-dessus joueur. Couleur : Ivoire. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Texte .4s, talent 1.1s ; pas d’aura distincte par talent.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-033 — loot-collected / drops

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P2 — actif**.
- Rôle : Feedback périphérique de combat.
- Rendu : Traînée aspiration, rebond drop, anneau collecte ; jeton pulsant. Couleur : Couleur ressource. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : loot-view.js et événement loot-collected ; pas un éclat hostile.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-034 — camera shake

- Famille : Feedback et statuts. Zone(s) : 1–6. Source : Joueur / événements combat. **P2 — actif**.
- Rôle : Retour tir / explosion / hurt.
- Rendu : Translation brève caméra. Couleur : Sans couleur. Animation : Événement / durée / état.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 65–100ms selon événement ; désactivée reducedMotion.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/room-scene.js; src/effects.js; src/loot-view.js.

### VFX-035 — dangerLane

- Famille : Télégraphes communs. Zone(s) : 1–6. Source : Géométrie partagée. **P1 — actif**.
- Rôle : Préparer puis afficher un couloir.
- Rendu : Couloir à bords sombres, deux lignes et chevrons intérieurs. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Bascule active.
- Réutilisation : Charges, rails, fissures, câbles, visées de projectiles.
- Dépendance / sensibilité : Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/combat-art.js.

### VFX-036 — dangerCircle

- Famille : Télégraphes communs. Zone(s) : 1–6. Source : Géométrie partagée. **P1 — actif**.
- Rôle : Préparer puis afficher une zone.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Bascule active + 3 taches translucides.
- Réutilisation : Explosions, gaz, impacts, sol instable.
- Dépendance / sensibilité : Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/combat-art.js.

### VFX-037 — EnemyAttacksView.bolts

- Famille : Projectiles hostiles. Zone(s) : 1–6. Source : Tous les pools hostiles. **P1 — actif**.
- Rôle : Balle, rivet, énergie ou fragment selon émetteur.
- Rendu : Disque bordé + centre clair + traînée de 17 unités. Couleur : Cœur saumon #ffb481, contour #ff7658 ; traînée spec.color. Animation : Translation à angle fixe ; pas de sprite sheet.
- Réutilisation : RiftProjectiles → DepthsCombat / ForgeCombat ; couleurs ne distinguent surtout que les traînées..
- Dépendance / sensibilité : Rayon spec.radius, traînée décorative ; collision relative balayée. Même tête pour des rôles différents. Les éventails communs suivent la cible pendant le warning puis fixent leur angle au tir ; aucun homing en vol.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/enemies/view.js; src/enemy-projectiles.js.

### VFX-038 — drill: simple / fan3

- Famille : Projectiles hostiles. Zone(s) : 1, 2, 3, 4. Source : drill. **P1 — actif**.
- Rôle : Alternance tir unique et éventail ×3.
- Rendu : Tête / traînée partagée ; visées en dangerLane. Couleur : Saumon / ivoire + couleur source. Animation : Vol rectiligne + warning.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : .9s warning ; fan ±22°, vitesse plafonnée120, simple145 ; radius6. Les éventails communs suivent la cible pendant le warning puis fixent leur angle au tir ; aucun homing en vol.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/enemies/view.js; src/enemy-projectiles.js; src/enemy-volley.js.

### VFX-039 — draisine: fan3

- Famille : Projectiles hostiles. Zone(s) : 2. Source : draisine. **P1 — actif**.
- Rôle : Éventail de trois.
- Rendu : Tête / traînée partagée ; visées en dangerLane. Couleur : Saumon / ivoire + couleur source. Animation : Vol rectiligne + warning.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : .85s warning ; ancien burstCount2 en config mais émission actuelle unique ×3. Les éventails communs suivent la cible pendant le warning puis fixent leur angle au tir ; aucun homing en vol.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/enemies/view.js; src/enemy-projectiles.js; src/enemy-volley.js.

### VFX-040 — crachefer: simple / fan / circle6–8

- Famille : Projectiles hostiles. Zone(s) : 1. Source : crachefer. **P1 — actif**.
- Rôle : Alternance projectiles boss.
- Rendu : Tête / traînée partagée ; visées en dangerLane. Couleur : Saumon / ivoire + couleur source. Animation : Vol rectiligne + warning.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Cercle warning ≥1.5s ; réservation capacité ; tir bloqué réessayé (pas abandonné). Les éventails communs suivent la cible pendant le warning puis fixent leur angle au tir ; aucun homing en vol.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/enemies/view.js; src/enemy-projectiles.js; src/enemy-volley.js.

### VFX-041 — switchman: burst / fan / circle

- Famille : Projectiles hostiles. Zone(s) : 2. Source : switchman. **P1 — actif**.
- Rôle : Rafale double / éventail / cercle.
- Rendu : Tête / traînée partagée ; visées en dangerLane. Couleur : Saumon / ivoire + couleur source. Animation : Vol rectiligne + warning.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Deux simples à .32s, ou 1 fan/cercle ; lire phase et réservations. Les éventails communs suivent la cible pendant le warning puis fixent leur angle au tir ; aucun homing en vol.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/enemies/view.js; src/enemy-projectiles.js; src/enemy-volley.js.

### VFX-042 — compressor: steam / radial

- Famille : Projectiles hostiles. Zone(s) : 3. Source : compressor. **P1 — actif**.
- Rôle : Vapeur ×3 et cercle.
- Rendu : Tête / traînée partagée ; visées en dangerLane. Couleur : Saumon / ivoire + couleur source. Animation : Vol rectiligne + warning.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Vapeur = projectiles, pas fumée volumétrique ; radial6/8. Les éventails communs suivent la cible pendant le warning puis fixent leur angle au tir ; aucun homing en vol.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/enemies/view.js; src/enemy-projectiles.js; src/enemy-volley.js.

### VFX-043 — firedamp: energy

- Famille : Projectiles hostiles. Zone(s) : 3. Source : firedamp. **P1 — actif**.
- Rôle : Projectile énergie.
- Rendu : Tête / traînée partagée ; visées en dangerLane. Couleur : Saumon / ivoire + couleur source. Animation : Vol rectiligne + warning.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Projectile unique, speed105 radius6 range360. Les éventails communs suivent la cible pendant le warning puis fixent leur angle au tir ; aucun homing en vol.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/enemies/view.js; src/enemy-projectiles.js; src/enemy-volley.js.

### VFX-044 — haveuse: charge

- Famille : Dangers Zones 1–3. Zone(s) : 1. Source : haveuse. **P2 — actif**.
- Rôle : Charge Haveuse.
- Rendu : Couloir à bords sombres, deux lignes et chevrons intérieurs. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Trajet clippé à l’arène ; warning/charge. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-045 — wagon: rail-charge

- Famille : Dangers Zones 1–3. Zone(s) : 2. Source : wagon. **P2 — actif**.
- Rôle : Wagon sur rail horizontal.
- Rendu : Couloir à bords sombres, deux lignes et chevrons intérieurs. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.1s warning ; trajectoire verrouillée ; render jusqu’à endX. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-046 — stationmaster: charge / wagon

- Famille : Dangers Zones 1–3. Zone(s) : 2. Source : stationmaster. **P2 — actif**.
- Rôle : Charge et invocation Wagon.
- Rendu : Couloir à bords sombres, deux lignes et chevrons intérieurs. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : L’invocation réemploie le warning du Wagon ; pas portail dédié. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-047 — locomotive: ram

- Famille : Dangers Zones 1–3. Zone(s) : 2. Source : locomotive. **P2 — actif**.
- Rôle : Bélier.
- Rendu : Couloir à bords sombres, deux lignes et chevrons intérieurs. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Longueur spec.speed×seconds limitée par murs. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-048 — locomotive: steam

- Famille : Gaz et pression. Zone(s) : 2. Source : locomotive. **P2 — actif**.
- Rôle : Vapeur frontale.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Disque radius54 ; dure1.6s ; pas jet ni particules de vapeur dédiées. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-049 — switchman: rails horizontal / vertical / cross

- Famille : Dangers Zones 1–3. Zone(s) : 2. Source : switchman. **P2 — actif**.
- Rôle : Rails dangereux.
- Rendu : Couloir à bords sombres, deux lignes et chevrons intérieurs. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Largeur16 ; durée1.15s ; croix rare solo sous50%, warning1.85s, jamais final. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-050 — effondreur: zones

- Famille : Dangers Zones 1–3. Zone(s) : 1. Source : effondreur. **P2 — actif**.
- Rôle : Éboulements anticipés.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Plusieurs disques ; actifs pendant recovery ; pas roche tombante dédiée. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-051 — deepdriller: charge

- Famille : Dangers Zones 1–3. Zone(s) : 3. Source : deepdriller. **P2 — actif**.
- Rôle : Charge Foreur.
- Rendu : Couloir à bords sombres, deux lignes et chevrons intérieurs. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : speed320×1.15s ; ligne depuis corps. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-052 — surveyor: impact

- Famille : Dangers Zones 1–3. Zone(s) : 3, 4. Source : surveyor. **P2 — actif**.
- Rôle : Sonde au sol.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Disque radius36 ; warning1.5s. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-053 — gasminer: blast

- Famille : Dangers Zones 1–3. Zone(s) : 3, 4. Source : gasminer. **P2 — actif**.
- Rôle : Explosion Grisouteux.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Disque radius62 ; pas explosion à sa mort dans ce système. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-054 — cager: charge / front / cable

- Famille : Dangers Zones 1–3. Zone(s) : 3. Source : cager. **P2 — actif**.
- Rôle : Charge, impact frontal, câble.
- Rendu : Couloir à bords sombres, deux lignes et chevrons intérieurs. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Front radius36 à85 devant ; câble vertical ±90, demi-largeur14. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-055 — compressor: pressure

- Famille : Gaz et pression. Zone(s) : 3. Source : compressor. **P2 — actif**.
- Rôle : Pression au sol.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Disque radius52 ; actif1.4s. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-056 — firedamp: gas / blast

- Famille : Gaz et pression. Zone(s) : 3. Source : firedamp. **P2 — actif**.
- Rôle : Gaz / explosion.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Warning puis actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Gaz deux disques solo ou un final ; blast radius62. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/arena-view.js; src/rail-boss-view.js; src/shaft-art.js; src/shaft-actors.js; src/rail-bosses.js.

### VFX-057 — shaft instability

- Famille : Dangers Zones 1–3. Zone(s) : 3. Source : Environnement. **P2 — actif**.
- Rôle : Sol instable.
- Rendu : Disque radius42. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : 1.6s warning → 1s actif.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/shaft-hazards.js; src/shaft-art.js.

### VFX-058 — spitter: spit

- Famille : Gaz et pression. Zone(s) : 4. Source : spitter. **P2 — actif**.
- Rôle : Gaz posé sous joueur.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale + anneau intérieur vert. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / accents #92e8b0. Animation : États de combat puis translation ou maintien.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.3s →2s radius38 ; aucun projectile craché visible ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/config.js; src/rift/combat.js; src/rift/art.js.

### VFX-059 — burster: blast

- Famille : Dangers Zone 4. Zone(s) : 4. Source : burster. **P2 — actif**.
- Rôle : Explosion de proximité.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale + anneau vert. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / accents #92e8b0. Animation : États de combat puis translation ou maintien.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.25s →.5s radius58 ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/config.js; src/rift/combat.js; src/rift/art.js.

### VFX-060 — burster: death-burst

- Famille : Explosions et fragments. Zone(s) : 4. Source : burster. **P2 — actif**.
- Rôle : Six éclats après mort.
- Rendu : Disque25 + six rayons → six projectiles. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / accents #92e8b0. Animation : États de combat puis translation ou maintien.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.1s warning après kill ; speed95 range230 ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/config.js; src/rift/combat.js; src/rift/art.js.

### VFX-061 — splitter: charge

- Famille : Dangers Zone 4. Zone(s) : 4. Source : splitter. **P2 — actif**.
- Rôle : Charge.
- Rendu : Couloir à bords sombres, deux lignes et chevrons intérieurs. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / accents #92e8b0. Animation : États de combat puis translation ou maintien.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.25s, vitesse330, 1.1s ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/config.js; src/rift/combat.js; src/rift/art.js.

### VFX-062 — splitter: fan8

- Famille : Dangers Zone 4. Zone(s) : 4. Source : splitter. **P2 — actif**.
- Rôle : Éventail huit.
- Rendu : Huit couloirs courts puis projectiles. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / accents #92e8b0. Animation : États de combat puis translation ou maintien.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.2s ; arc .72π speed115 ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/config.js; src/rift/combat.js; src/rift/art.js.

### VFX-063 — splitter: fissures

- Famille : Dangers Zone 4. Zone(s) : 4. Source : splitter. **P2 — actif**.
- Rôle : Trois fissures.
- Rendu : Couloir à bords sombres, deux lignes et chevrons intérieurs. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / accents #92e8b0. Animation : États de combat puis translation ou maintien.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : H/V alterné ; largeur10 ; 1.55s →1.05s ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/config.js; src/rift/combat.js; src/rift/art.js.

### VFX-064 — blower: circle8

- Famille : Dangers Zone 4. Zone(s) : 4. Source : blower. **P2 — actif**.
- Rôle : Cercle huit.
- Rendu : Huit directions courtes + projectiles. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / accents #92e8b0. Animation : États de combat puis translation ou maintien.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.35s ; speed100 ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/config.js; src/rift/combat.js; src/rift/art.js.

### VFX-065 — blower: pockets

- Famille : Dangers Zone 4. Zone(s) : 4. Source : blower. **P2 — actif**.
- Rôle : Quatre poches explosives.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale + anneau vert. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / accents #92e8b0. Animation : États de combat puis translation ou maintien.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.6s →.55s radius34 ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/config.js; src/rift/combat.js; src/rift/art.js.

### VFX-066 — blower: cone

- Famille : Dangers Zone 4. Zone(s) : 4. Source : blower. **P2 — actif**.
- Rôle : Souffle en éventail.
- Rendu : Cinq visées / projectiles. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / accents #92e8b0. Animation : États de combat puis translation ou maintien.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.2s ; speed110 ; PAS cône surfacique ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/config.js; src/rift/combat.js; src/rift/art.js.

### VFX-067 — core: double

- Famille : Dangers Zone 4. Zone(s) : 4. Source : core. **P2 — actif**.
- Rôle : Deux cercles décalés.
- Rendu : 8 + 8 projectiles, visées tournées π/8 au second. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / accents #92e8b0. Animation : États de combat puis translation ou maintien.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.5s warning ; .65s entre salves ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/config.js; src/rift/combat.js; src/rift/art.js.

### VFX-068 — core: rain

- Famille : Dangers Zone 4. Zone(s) : 4. Source : core. **P2 — actif**.
- Rôle : Pluie de quatre explosions.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale + anneau vert. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / accents #92e8b0. Animation : États de combat puis translation ou maintien.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.65s →.55s ; pas projectile aérien ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/config.js; src/rift/combat.js; src/rift/art.js.

### VFX-069 — core: orb

- Famille : Explosions et fragments. Zone(s) : 4. Source : core. **P2 — actif**.
- Rôle : Orbe puis éclatement.
- Rendu : Gros projectile radius10 ; disque25 + six rayons puis éclats. Couleur : Traînée jaune vert, tête saumon. Animation : États de combat puis translation ou maintien.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.15s ; speed70 range160 ; warning éclats1.1s ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/config.js; src/rift/combat.js; src/rift/art.js.

### VFX-070 — rift environmental pockets

- Famille : Gaz et pression. Zone(s) : 4. Source : Environnement. **P2 — actif**.
- Rôle : Alternance deux poches gaz / explosion.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale + anneau vert. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : 1.65s →2.2s gaz ou .55s explosion.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/rift/combat.js; src/rift/art.js.

### VFX-071 — lampist: light

- Famille : Dangers Zone 5. Zone(s) : 5. Source : lampist. **P1 — actif**.
- Rôle : Éventail lampe ×3.
- Rendu : Trois couloirs + projectiles partagés. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Préparation → attaque.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.1s, speed118 ; traînée verte héritée de RiftProjectiles ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/art.js; src/depths/config.js; src/depths/actors.js.

### VFX-072 — blaster: plant

- Famille : Dangers Zone 5. Zone(s) : 5. Source : blaster. **P1 — actif**.
- Rôle : Charge déposée.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale + petit cercle9. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Préparation → attaque.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.5s →.35s radius39 ; propriétaire recule ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/art.js; src/depths/config.js; src/depths/actors.js.

### VFX-073 — blackmaw: leap

- Famille : Dangers Zone 5. Zone(s) : 5. Source : blackmaw. **P1 — actif**.
- Rôle : Bond rapide.
- Rendu : Couloir à bords sombres, deux lignes et chevrons intérieurs. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif. Animation : Préparation → attaque.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : .9s ; speed260 ×.52s ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/art.js; src/depths/config.js; src/depths/actors.js.

### VFX-074 — extinction / return light

- Famille : Feedback et statuts. Zone(s) : 5. Source : Zone / Lampiste-Major. **P1 — actif**.
- Rôle : Réduction de visibilité du fond.
- Rendu : Tint du fond uniquement + message haut contraste. Couleur : Fond #9298a5 prélude puis #505868. Animation : Prélude / extinction / retour.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Aucune couche de danger assombrie ; rocks conditionnels séparés.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/combat.js; src/depths/art.js.

### VFX-075 — extinction rocks

- Famille : Dangers Zone 5. Zone(s) : 5. Source : Environnement. **P2 — actif**.
- Rôle : Chutes de roches pendant extinction.
- Rendu : Disque translucide, contour sombre, graduations et croix centrale + triangle roche. Couleur : Ambre/corail, roche sombre bord ivoire. Animation : Warning puis zone brève.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 2 ou3 points selon vague/capacité ; pas animation de chute distincte.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/combat.js; src/depths/art.js.

### VFX-076 — major-sweep

- Famille : Boss Zone 5. Zone(s) : 5. Source : lampmajor. **P2 — actif**.
- Rôle : BALAYAGE DU MAJOR.
- Rendu : Couloir tournant + arc et flèche de sens. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 1.2/2.6s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-077 — major-aim

- Famille : Boss Zone 5. Zone(s) : 5. Source : lampmajor. **P2 — actif**.
- Rôle : MISE EN JOUE.
- Rendu : Couloir suivi .8s puis verrouillé .65s, actif .38s. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 0.65/0.38s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-078 — major-dark

- Famille : Boss Zone 5. Zone(s) : 5. Source : lampmajor. **P2 — actif**.
- Rôle : EXTINCTION GÉNÉRALE.
- Rendu : Fond assombri + deux repères lumineux fixes. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 0.7/2s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-079 — major-cross

- Famille : Boss Zone 5. Zone(s) : 5. Source : lampmajor. **P2 — actif**.
- Rôle : FEUX CROISÉS.
- Rendu : Deux couloirs perpendiculaires mobiles + flèches. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 1.3/2.2s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-080 — major-blackout

- Famille : Ultimes. Zone(s) : 5. Source : lampmajor. **P3 — actif**.
- Rôle : BLACKOUT.
- Rendu : Extinction, deux balayages puis tir verrouillé. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 0.7/2s, 1.2/2.6s, 1.2/2.6s, 0.65/0.38s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-081 — demo-plan

- Famille : Boss Zone 5. Zone(s) : 5. Source : dynamiter. **P2 — actif**.
- Rôle : PLAN DE TIR 1 → 4.
- Rendu : Quatre cercles numérotés, trois slots visibles maximum, explosions échelonnées. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 1.35/2.65s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Observé à390×844 : quatre positions se distinguent, mais les chiffres restent petits ; éviter un futur décor qui mange leur contraste.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-082 — demo-chain

- Famille : Boss Zone 5. Zone(s) : 5. Source : dynamiter. **P2 — actif**.
- Rôle : MÈCHE EN CHAÎNE.
- Rendu : Cercles reliés par mèche / trait, nombres1→4. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 1.35/2.65s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-083 — demo-quadrants

- Famille : Boss Zone 5. Zone(s) : 5. Source : dynamiter. **P2 — actif**.
- Rôle : QUADRANTS.
- Rendu : Trois rectangles numérotés ; quadrant sûr change. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 1.4/1.9s, 1.3/1.9s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-084 — demo-lob

- Famille : Boss Zone 5. Zone(s) : 5. Source : dynamiter. **P2 — actif**.
- Rôle : CHARGE PROJETÉE.
- Rendu : Disque ciblé puis six fragments radiaux ; aucune trajectoire de lancer dessinée. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 1.4/0.4s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-085 — demo-demolition

- Famille : Ultimes. Zone(s) : 5. Source : dynamiter. **P3 — actif**.
- Rôle : DÉMOLITION CONTRÔLÉE.
- Rendu : Trois bandes annulaires, petites charges carrées et flèche intérieur/extérieur. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 1.6/0.35s, 1/0.35s, 1/0.35s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-086 — mass-charge

- Famille : Boss Zone 5. Zone(s) : 5. Source : blackmass. **P2 — actif**.
- Rôle : CHARGE DE LA MASSE.
- Rendu : Couloir verrouillé puis déplacement de la masse. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 1.6/1.7s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-087 — mass-slam

- Famille : Boss Zone 5. Zone(s) : 5. Source : blackmass. **P2 — actif**.
- Rôle : COUP DE MASSE.
- Rendu : Disque intérieur puis anneau extérieur sûr au centre. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 1.25/0.3s, 0.75/0.4s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-088 — mass-triple

- Famille : Boss Zone 5. Zone(s) : 5. Source : blackmass. **P2 — actif**.
- Rôle : TRIPLE FRAPPE.
- Rendu : Trois frappes circulaires puis fissures. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 1/0.28s, 0.8/0.28s, 1.1/0.35s, 1.15/0.65s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-089 — mass-fissures

- Famille : Boss Zone 5. Zone(s) : 5. Source : blackmass. **P2 — actif**.
- Rôle : FISSURE DU FOND.
- Rendu : Trois lignes qui croissent sur axes verrouillés. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 1.15/0.65s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-090 — mass-pit

- Famille : Ultimes. Zone(s) : 5. Source : blackmass. **P3 — actif**.
- Rôle : ÉCRASEMENT DU PUITS.
- Rendu : Déplacement centre, disque, deux croix de fissures, onde annulaire expansive. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif ; repères sûrs ivoire. Animation : Séquence pilotée par DepthsBossDirector.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Étapes [warning/durée] : 0.6/2.2s, 1.65/0.35s, 1.15/0.65s, 1.15/0.65s, 1/0.7s. Géométrie partagée avec collision ; suivi, verrouillage, ordre, trous sûrs à conserver.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-patterns.js; src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-091 — Z5 combo-light

- Famille : Combinaisons. Zone(s) : 5. Source : Deux boss coordonnés. **P3 — actif**.
- Rôle : SOUS LES PROJECTEURS.
- Rendu : Bande claire mobile sûre + explosions rectangulaires hors bande. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / ivoire. Animation : Séquence décalée.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Même plan verrouillé pour les partenaires ; deux majeurs max ; aucun déplacement décoratif des zones sûres.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-092 — Z5 combo-corridor

- Famille : Combinaisons. Zone(s) : 5. Source : Deux boss coordonnés. **P3 — actif**.
- Rôle : COULOIR DE LA MASSE.
- Rendu : Flèche et couloir lumineux annonçant charge de la Masse. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / ivoire. Animation : Séquence décalée.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Même plan verrouillé pour les partenaires ; deux majeurs max ; aucun déplacement décoratif des zones sûres.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-093 — Z5 combo-heavy

- Famille : Combinaisons. Zone(s) : 5. Source : Deux boss coordonnés. **P3 — actif**.
- Rôle : DÉMOLITION LOURDE.
- Rendu : Deux explosions ordonnées puis slam retardé. Couleur : Ambre #ffc46b en préparation → corail #ff795f actif / ivoire. Animation : Séquence décalée.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Même plan verrouillé pour les partenaires ; deux majeurs max ; aucun déplacement décoratif des zones sûres.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/depths/boss-director.js; src/depths/boss-view.js.

### VFX-094 — stoker: heat

- Famille : Forge et chaleur. Zone(s) : 6. Source : stoker. **P1 — actif**.
- Rôle : Plaque chaude.
- Rendu : Rectangle arrondi hachuré + trois traits chaleur. Couleur : Ambre / orange puis acier froid. Animation : Intensité, activation, refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.2s warning →2.3s →.3s refroidissement ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/art.js; src/forge/combat.js; src/forge/config.js.

### VFX-095 — riveter: rivet / rivets

- Famille : Forge et chaleur. Zone(s) : 6. Source : riveter. **P1 — actif**.
- Rôle : Un rivet puis éventail ×3 dès vague11.
- Rendu : Traits de visée, balles partagées radius4. Couleur : Ambre / orange puis acier froid. Animation : Intensité, activation, refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 1.1s ; speed165 range350 ; fan ±.17rad ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/art.js; src/forge/combat.js; src/forge/config.js.

### VFX-096 — scorifier: scorch

- Famille : Forge et chaleur. Zone(s) : 6. Source : scorifier. **P1 — actif**.
- Rôle : Ruée puis traînée brûlante.
- Rendu : Couloir à bords sombres, deux lignes et chevrons intérieurs + traits de chaleur. Couleur : Ambre / orange puis acier froid. Animation : Intensité, activation, refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : warning1.05s ; charge.65s ; traînée après1.7s, dure1.3s ; Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/art.js; src/forge/combat.js; src/forge/config.js.

### VFX-097 — environment heat plate

- Famille : Forge et chaleur. Zone(s) : 6. Source : Environnement. **P2 — actif**.
- Rôle : Surchauffe d’une plaque proche.
- Rendu : Rectangle hachuré,76×88. Couleur : #ffd58c → #ff8050 → #8eb5b9. Animation : 1.3s warning →2.3s →.3s cooling.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Plafond heat3 / ground5 et contrôle sortie ; refroidissement non dangereux.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/combat.js; src/forge/art.js.

### VFX-098 — sectors

- Famille : Boss Zone 6. Zone(s) : 6. Source : furnace. **P2 — actif**.
- Rôle : SECTEURS DE CHAUFFE.
- Rendu : Deux ou trois grands secteurs rectangulaires. Couleur : Orange #ff8650. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.35/1.8s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-099 — furnaceCone

- Famille : Boss Zone 6. Zone(s) : 6. Source : furnace. **P2 — actif**.
- Rôle : CÔNE DE FOURNAISE.
- Rendu : Cône thermique suivi brièvement puis verrouillé. Couleur : Orange #ff8650. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.4/0.65s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision. Origine mobile : drift suivant la direction préplanifiée du boss ; ne pas immobiliser le rendu. furnaceCone suit aussi la visée pendant les premières .35s au plus .65rad/s.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-100 — furnaceTurn

- Famille : Boss Zone 6. Zone(s) : 6. Source : furnace. **P2 — actif**.
- Rôle : FOUR TOURNANT.
- Rendu : Deux bras opposés tournants + flèches. Couleur : Orange #ff8650. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.4/2.5s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision. Origine mobile : drift suivant la direction préplanifiée du boss ; ne pas immobiliser le rendu. furnaceCone suit aussi la visée pendant les premières .35s au plus .65rad/s.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-101 — whiteMarch

- Famille : Boss Zone 6. Zone(s) : 6. Source : furnace. **P2 — actif**.
- Rôle : MARCHE À BLANC.
- Rendu : Trois disques de chauffe échelonnés. Couleur : Orange #ff8650. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.2/0.65s, 0.65/1.2/0.65s, 1.3/1.2/0.65s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-102 — whiteFurnace

- Famille : Ultimes. Zone(s) : 6. Source : furnace. **P3 — actif**.
- Rôle : ULTIME · FOUR À BLANC.
- Rendu : Trois bandes chauffées ; deux couloirs sûrs turquoise ; seconde séquence puis cône. Couleur : Orange #ff8650. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.9/0.65s, 2.9/1.9/0.65s, 5.8/1.45/0.6s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-103 — targetStrike

- Famille : Boss Zone 6. Zone(s) : 6. Source : hammer. **P2 — actif**.
- Rôle : FRAPPE CIBLÉE.
- Rendu : Impact circulaire puis onde trouée. Couleur : Ivoire #ffe1a0. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.25/0.22s, 1.45/0.35/0.5s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-104 — doubleBeat

- Famille : Boss Zone 6. Zone(s) : 6. Source : hammer. **P2 — actif**.
- Rôle : DOUBLE BATTUE.
- Rendu : Deux plaques horizontales OU verticales successives. Couleur : Ivoire #ffe1a0. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.25/0.3s, 0.85/1.25/0.3s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-105 — forgeRhythm

- Famille : Boss Zone 6. Zone(s) : 6. Source : hammer. **P2 — actif**.
- Rôle : RYTHME DE FORGE.
- Rendu : Trois impacts croissants puis onde. Couleur : Ivoire #ffe1a0. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.2/0.22s, 0.85/1.2/0.22s, 1.7/1.2/0.22s, 3.0999999999999996/0.4/0.7s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-106 — counterStroke

- Famille : Boss Zone 6. Zone(s) : 6. Source : hammer. **P2 — actif**.
- Rôle : CONTRE-COUP.
- Rendu : Impact proche puis onde vers extérieur. Couleur : Ivoire #ffe1a0. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.3/0.25s, 1.55/0.4/1.4s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-107 — redCadence

- Famille : Ultimes. Zone(s) : 6. Source : hammer. **P3 — actif**.
- Rôle : ULTIME · CADENCE ROUGE.
- Rendu : Quatre frappes de cadence accélérée puis onde. Couleur : Ivoire #ffe1a0. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.3/0.24s, 1.05/1.3/0.24s, 1.95/1.3/0.24s, 2.72/1.3/0.24s, 4.25/0.5/1.5s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-108 — sideValves

- Famille : Boss Zone 6. Zone(s) : 6. Source : boiler. **P2 — actif**.
- Rôle : SOUPAPES LATÉRALES.
- Rendu : Deux bras de vapeur opposés H/V. Couleur : Bleu vapeur #b7e8ed. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.3/0.85s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision. Origine mobile : drift suivant la direction préplanifiée du boss ; ne pas immobiliser le rendu. furnaceCone suit aussi la visée pendant les premières .35s au plus .65rad/s.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-109 — rotatingPurge

- Famille : Boss Zone 6. Zone(s) : 6. Source : boiler. **P2 — actif**.
- Rôle : PURGE TOURNANTE.
- Rendu : Un bras tournant, deux possibles sous50%. Couleur : Bleu vapeur #b7e8ed. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.35/2.3s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision. Origine mobile : drift suivant la direction préplanifiée du boss ; ne pas immobiliser le rendu. furnaceCone suit aussi la visée pendant les premières .35s au plus .65rad/s.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-110 — groundPressure

- Famille : Boss Zone 6. Zone(s) : 6. Source : boiler. **P2 — actif**.
- Rôle : SURPRESSION AU SOL.
- Rendu : Trois poches de pression. Couleur : Bleu vapeur #b7e8ed. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.3/0.65s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-111 — pressureWave

- Famille : Boss Zone 6. Zone(s) : 6. Source : boiler. **P2 — actif**.
- Rôle : VAGUE DE PRESSION.
- Rendu : Anneau expansif interrompu par une encoche sûre. Couleur : Bleu vapeur #b7e8ed. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.4/1.65s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Observé à390×844 : anneau bleu clair et ouverture nettement visibles sur le sol sombre ; la capture ne valide pas toutes les superpositions.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-112 — valveRupture

- Famille : Ultimes. Zone(s) : 6. Source : boiler. **P3 — actif**.
- Rôle : ULTIME · RUPTURE DE SOUPAPE.
- Rendu : Soupapes H puis V puis grande onde trouée. Couleur : Bleu vapeur #b7e8ed. Animation : Plan temporel, rotation/expansion selon forme puis refroidissement.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements [départ/warning/durée] : 0/1.8/0.75s, 2.8/1.4/0.75s, 5.2/1.4/1.7s. Sous50% warning×.94, variantes et sens possibles. Respecter la géométrie verrouillée, le rayon/largeur et la transition warning/actif ; le contour ne doit pas promettre une autre collision.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js; src/forge/boss-view.js.

### VFX-113 — Z6 forgePressure

- Famille : Combinaisons. Zone(s) : 6. Source : Deux boss coordonnés. **P3 — actif**.
- Rôle : FORGE SOUS PRESSION.
- Rendu : Secteurs thermiques + petit couloir de vapeur décalé. Couleur : Orange / ivoire / bleu vapeur. Animation : Départs décalés.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Conserver passage froid et plafonds ; autres attaques légères possibles.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js.

### VFX-114 — Z6 whiteHammer

- Famille : Combinaisons. Zone(s) : 6. Source : Deux boss coordonnés. **P3 — actif**.
- Rôle : PILON À BLANC.
- Rendu : Secteur thermique puis impact à sa bordure. Couleur : Orange / ivoire / bleu vapeur. Animation : Départs décalés.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Conserver passage froid et plafonds ; autres attaques légères possibles.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js.

### VFX-115 — Z6 pressureCadence

- Famille : Combinaisons. Zone(s) : 6. Source : Deux boss coordonnés. **P3 — actif**.
- Rôle : PRESSION CADENCÉE.
- Rendu : Ondes de vapeur et impacts alternés. Couleur : Orange / ivoire / bleu vapeur. Animation : Départs décalés.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Conserver passage froid et plafonds ; autres attaques légères possibles.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-patterns.js; src/forge/boss-director.js.

### VFX-116 — light-furnace

- Famille : Boss Zone 6. Zone(s) : 6. Source : furnace. **P2 — actif**.
- Rôle : Pression mineure / anti-camping.
- Rendu : Petite plaque48×48. Couleur : Orange. Animation : Verrouillé puis actif et cooling.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Warning1s ou1.2s ; durée selon cadence/brief ; même rendu que majeur, taille moindre. Ne pas ignorer ces attaques entre deux plans.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-light.js; src/forge/boss-pressure.js; src/forge/boss-view.js.

### VFX-117 — light-hammer

- Famille : Boss Zone 6. Zone(s) : 6. Source : hammer. **P2 — actif**.
- Rôle : Pression mineure / anti-camping.
- Rendu : Disque34. Couleur : Ivoire. Animation : Verrouillé puis actif et cooling.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Warning1s ou1.2s ; durée selon cadence/brief ; même rendu que majeur, taille moindre. Ne pas ignorer ces attaques entre deux plans.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-light.js; src/forge/boss-pressure.js; src/forge/boss-view.js.

### VFX-118 — light-boiler

- Famille : Boss Zone 6. Zone(s) : 6. Source : boiler. **P2 — actif**.
- Rôle : Pression mineure / anti-camping.
- Rendu : Disque32. Couleur : Bleu vapeur. Animation : Verrouillé puis actif et cooling.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Warning1s ou1.2s ; durée selon cadence/brief ; même rendu que majeur, taille moindre. Ne pas ignorer ces attaques entre deux plans.
- Lisibilité : Revue structurelle : forme simple ; densité et superpositions à surveiller. Échantillons navigateur, pas validation de chaque occurrence.
- Code : src/forge/boss-light.js; src/forge/boss-pressure.js; src/forge/boss-view.js.

### VFX-119 — rivet flash

- Famille : Décorations Forge. Zone(s) : 6. Source : riveter. **P2 — actif**.
- Rôle : Complément sprite non dangereux.
- Rendu : Deux traits ocre après tir réellement présent, <.12s. Couleur : Ocre / ivoire / bleu gris. Animation : Très bref, alpha décroissant.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 48 primitives max, depth7 sous warning8 ; coupé reducedMotion ; aucune émission de dégâts.
- Lisibilité : Effet bref, parfois sous les acteurs et warnings : sa durée et sa densité nécessiteront une validation animée dédiée ; aucune capture ne valide ici chaque frame.
- Code : src/forge-sprite-vfx.js.

### VFX-120 — friction

- Famille : Décorations Forge. Zone(s) : 6. Source : scorifier. **P2 — actif**.
- Rôle : Complément sprite non dangereux.
- Rendu : Deux traits derrière les pieds pendant charge. Couleur : Ocre / ivoire / bleu gris. Animation : Très bref, alpha décroissant.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 48 primitives max, depth7 sous warning8 ; coupé reducedMotion ; aucune émission de dégâts.
- Lisibilité : Effet bref, parfois sous les acteurs et warnings : sa durée et sa densité nécessiteront une validation animée dédiée ; aucune capture ne valide ici chaque frame.
- Code : src/forge-sprite-vfx.js.

### VFX-121 — heat puff

- Famille : Décorations Forge. Zone(s) : 6. Source : stoker. **P2 — actif**.
- Rôle : Complément sprite non dangereux.
- Rendu : Point chaleur2→4px pendant .18s après activation. Couleur : Ocre / ivoire / bleu gris. Animation : Très bref, alpha décroissant.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 48 primitives max, depth7 sous warning8 ; coupé reducedMotion ; aucune émission de dégâts.
- Lisibilité : Effet bref, parfois sous les acteurs et warnings : sa durée et sa densité nécessiteront une validation animée dédiée ; aucune capture ne valide ici chaque frame.
- Code : src/forge-sprite-vfx.js.

### VFX-122 — impact dust

- Famille : Décorations Forge. Zone(s) : 6. Source : hammer. **P2 — actif**.
- Rôle : Complément sprite non dangereux.
- Rendu : Trois traits poussière au hazard frais non-wave. Couleur : Ocre / ivoire / bleu gris. Animation : Très bref, alpha décroissant.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 48 primitives max, depth7 sous warning8 ; coupé reducedMotion ; aucune émission de dégâts.
- Lisibilité : Effet bref, parfois sous les acteurs et warnings : sa durée et sa densité nécessiteront une validation animée dédiée ; aucune capture ne valide ici chaque frame.
- Code : src/forge-sprite-vfx.js.

### VFX-123 — vapor

- Famille : Décorations Forge. Zone(s) : 6. Source : boiler. **P2 — actif**.
- Rôle : Complément sprite non dangereux.
- Rendu : Deux points vapeur2→5px pendant .18s. Couleur : Ocre / ivoire / bleu gris. Animation : Très bref, alpha décroissant.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 48 primitives max, depth7 sous warning8 ; coupé reducedMotion ; aucune émission de dégâts.
- Lisibilité : Effet bref, parfois sous les acteurs et warnings : sa durée et sa densité nécessiteront une validation animée dédiée ; aucune capture ne valide ici chaque frame.
- Code : src/forge-sprite-vfx.js.

### VFX-124 — core sparks

- Famille : Décorations Forge. Zone(s) : 6. Source : furnace. **P2 — actif**.
- Rôle : Complément sprite non dangereux.
- Rendu : Deux traits orange internes au hazard frais. Couleur : Ocre / ivoire / bleu gris. Animation : Très bref, alpha décroissant.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 48 primitives max, depth7 sous warning8 ; coupé reducedMotion ; aucune émission de dégâts.
- Lisibilité : Effet bref, parfois sous les acteurs et warnings : sa durée et sa densité nécessiteront une validation animée dédiée ; aucune capture ne valide ici chaque frame.
- Code : src/forge-sprite-vfx.js.

### VFX-125 — decompression

- Famille : Décorations Forge. Zone(s) : 6. Source : bosses Z6. **P2 — actif**.
- Rôle : Complément sprite non dangereux.
- Rendu : Deux petits points vapeur au début de récupération. Couleur : Ocre / ivoire / bleu gris. Animation : Très bref, alpha décroissant.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : 48 primitives max, depth7 sous warning8 ; coupé reducedMotion ; aucune émission de dégâts.
- Lisibilité : Effet bref, parfois sous les acteurs et warnings : sa durée et sa densité nécessiteront une validation animée dédiée ; aucune capture ne valide ici chaque frame.
- Code : src/forge-sprite-vfx.js.

### VFX-126 — rat: death

- Famille : Mort et animation. Zone(s) : 1, 2, 3. Source : rat. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 4 frames, 11fps, 0.364s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/rat.svg.

### VFX-127 — miner: death

- Famille : Mort et animation. Zone(s) : 1, 2, 3. Source : miner. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 4 frames, 11fps, 0.364s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/miner.svg.

### VFX-128 — drill: death

- Famille : Mort et animation. Zone(s) : 1, 2, 3, 4. Source : drill. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 4 frames, 11fps, 0.364s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/drill.svg.

### VFX-129 — haveuse: death

- Famille : Mort et animation. Zone(s) : 1. Source : haveuse. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 6 frames, 10fps, 0.600s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/haveuse.svg.

### VFX-130 — crachefer: death

- Famille : Mort et animation. Zone(s) : 1. Source : crachefer. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 6 frames, 10fps, 0.600s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/crachefer.svg.

### VFX-131 — effondreur: death

- Famille : Mort et animation. Zone(s) : 1. Source : effondreur. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 6 frames, 10fps, 0.600s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/effondreur.svg.

### VFX-132 — wagon: death

- Famille : Mort et animation. Zone(s) : 2. Source : wagon. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 4 frames, 11fps, 0.364s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/wagon.svg.

### VFX-133 — draisine: death

- Famille : Mort et animation. Zone(s) : 2. Source : draisine. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 4 frames, 11fps, 0.364s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/draisine.svg.

### VFX-134 — stationmaster: death

- Famille : Mort et animation. Zone(s) : 2. Source : stationmaster. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 6 frames, 10fps, 0.600s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/stationmaster.svg.

### VFX-135 — locomotive: death

- Famille : Mort et animation. Zone(s) : 2. Source : locomotive. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 6 frames, 10fps, 0.600s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/locomotive.svg.

### VFX-136 — switchman: death

- Famille : Mort et animation. Zone(s) : 2. Source : switchman. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 6 frames, 10fps, 0.600s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/switchman.svg.

### VFX-137 — deepdriller: death

- Famille : Mort et animation. Zone(s) : 3. Source : deepdriller. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 4 frames, 11fps, 0.364s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/deepdriller.svg.

### VFX-138 — surveyor: death

- Famille : Mort et animation. Zone(s) : 3, 4. Source : surveyor. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 4 frames, 11fps, 0.364s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/surveyor.svg.

### VFX-139 — gasminer: death

- Famille : Mort et animation. Zone(s) : 3, 4. Source : gasminer. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 4 frames, 11fps, 0.364s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/gasminer.svg.

### VFX-140 — cager: death

- Famille : Mort et animation. Zone(s) : 3. Source : cager. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 6 frames, 10fps, 0.600s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/cager.svg.

### VFX-141 — compressor: death

- Famille : Mort et animation. Zone(s) : 3. Source : compressor. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 6 frames, 10fps, 0.600s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/compressor.svg.

### VFX-142 — firedamp: death

- Famille : Mort et animation. Zone(s) : 3. Source : firedamp. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 6 frames, 10fps, 0.600s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v034b/firedamp.svg.

### VFX-143 — crawler: death

- Famille : Mort et animation. Zone(s) : 4. Source : crawler. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 4 frames, 10fps, 0.400s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v035b/crawler.svg.

### VFX-144 — spitter: death

- Famille : Mort et animation. Zone(s) : 4. Source : spitter. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 4 frames, 10fps, 0.400s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v035b/spitter.svg.

### VFX-145 — burster: death

- Famille : Mort et animation. Zone(s) : 4. Source : burster. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 4 frames, 10fps, 0.400s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v035b/burster-bonbonne-v1.svg.

### VFX-146 — splitter: death

- Famille : Mort et animation. Zone(s) : 4. Source : splitter. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 5 frames, 10fps, 0.500s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v035b/splitter.svg.

### VFX-147 — blower: death

- Famille : Mort et animation. Zone(s) : 4. Source : blower. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 5 frames, 10fps, 0.500s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v035b/blower.svg.

### VFX-148 — core: death

- Famille : Mort et animation. Zone(s) : 4. Source : core. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 5 frames, 10fps, 0.500s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v035b/core.svg.

### VFX-149 — lampist: death

- Famille : Mort et animation. Zone(s) : 5. Source : lampist. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 7 frames, 12fps, 0.583s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v036c/lampist-8e0ed44bd6f8.svg.

### VFX-150 — blaster: death

- Famille : Mort et animation. Zone(s) : 5. Source : blaster. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 7 frames, 12fps, 0.583s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v036c/blaster-6a505d9404f5.svg.

### VFX-151 — blackmaw: death

- Famille : Mort et animation. Zone(s) : 5. Source : blackmaw. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 7 frames, 12fps, 0.583s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v036c/blackmaw-f5ee5e88e00b.svg.

### VFX-152 — lampmajor: death

- Famille : Mort et animation. Zone(s) : 5. Source : lampmajor. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 10 frames, 12fps, 0.833s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v036c/lampmajor-a70ff6fc4991.svg.

### VFX-153 — dynamiter: death

- Famille : Mort et animation. Zone(s) : 5. Source : dynamiter. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 10 frames, 12fps, 0.833s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v036c/dynamiter-9315afc7cc61.svg.

### VFX-154 — blackmass: death

- Famille : Mort et animation. Zone(s) : 5. Source : blackmass. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 10 frames, 12fps, 0.833s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v036c/blackmass-667a81a3d28f.svg.

### VFX-155 — stoker: death

- Famille : Mort et animation. Zone(s) : 6. Source : stoker. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 7 frames, 12fps, 0.583s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v037c/stoker-8552dc9c950b.svg.

### VFX-156 — riveter: death

- Famille : Mort et animation. Zone(s) : 6. Source : riveter. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 7 frames, 12fps, 0.583s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v037c/riveter-9ede66237e67.svg.

### VFX-157 — scorifier: death

- Famille : Mort et animation. Zone(s) : 6. Source : scorifier. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 7 frames, 12fps, 0.583s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v037c/scorifier-567c72dce85a.svg.

### VFX-158 — furnace: death

- Famille : Mort et animation. Zone(s) : 6. Source : furnace. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 10 frames, 12fps, 0.833s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v037c/furnace-35afc34b8a3f.svg.

### VFX-159 — hammer: death

- Famille : Mort et animation. Zone(s) : 6. Source : hammer. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 10 frames, 12fps, 0.833s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v037c/hammer-c016c8e4891e.svg.

### VFX-160 — boiler: death

- Famille : Mort et animation. Zone(s) : 6. Source : boiler. **P2 — actif**.
- Rôle : Destruction / mort propre au corps.
- Rendu : Pose(s) de sheet approuvée + fade du corps. Couleur : Palette du master. Animation : 10 frames, 12fps, 0.833s.
- Réutilisation : Éclats et anneau kill génériques superposés.
- Dépendance / sensibilité : Renderer détaché après kill ; cap de cadavres ; aucun dommage causé par le clip. Éclateur : éclats dangereux gérés séparément.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js ; asset : ./src/assets/enemies-v037c/boiler-feca0d64d31a.svg.

### VFX-161 — hero: hit / death / shoot

- Famille : Mort et animation. Zone(s) : 1–6. Source : Héros. **P2 — actif**.
- Rôle : Réaction aux événements de combat.
- Rendu : Clips du héros validé. Couleur : Palette héros. Animation : hit2f/16fps, death5f/9fps, shoot3f/20fps.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Événements one-render ; mouvement réduit sélectionne une frame ; ne pas piloter le gameplay par animation.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/hero-animation.js; src/room-scene.js.

### VFX-162 — enemy prepare / attack / recovery / hit

- Famille : Mort et animation. Zone(s) : 1–6. Source : Toutes les entités animées. **P1 — actif**.
- Rôle : Retour du cycle d’attaque.
- Rendu : Clips spécifiques du corps, dont pièces/outils/lumières intégrés. Couleur : Palettes des masters. Animation : Frames selon état / plan / release.
- Réutilisation : Voir famille / même renderer.
- Dépendance / sensibilité : Ne pas comptabiliser chaque frame comme VFX autonome ; conserver les masters et mapping d’état. Inventaire des clips joint.
- Lisibilité : Clips de production et durées recensés. Pas de validation visuelle exhaustive de chaque mort dans ce banc ; conserver les silhouettes validées.
- Code : src/forge-animation-state.js; src/depths-animation.js; src/rift-animation.js; src/enemy-animation.js.

## Arrêt

Aucun gameplay modifié. Aucun asset de production remplacé. Aucune sprite sheet produite. Aucun commit/push. Arrêt ici pour validation humaine avant toute refonte visuelle.
