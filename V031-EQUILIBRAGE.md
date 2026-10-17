# La Mine V2 — V0.31 — Équilibrage global des armes

## Décision après analyse

**Un seul levier : falloff du Fusil légèrement renforcé hors proximité.** Pas de changement de cadence, de dégâts de base, de portée, de spread ou de perk. Aucun buff de Mitraillette ; aucun changement de Grisou X. Aucune zone, aucun ennemi, boss, système permanent, classement ou économie modifié. Aucun commit/push.

Le Fusil disposait déjà d’une forte perte avec la distance. Remplacer celle-ci par 60–70 % des dégâts à portée maximale aurait constitué un buff : il infligeait déjà seulement 5/12, soit 41,7 %, après arrondi. La V0.31 conserve ce fonctionnement et ajoute une petite pénalité progressive après les 45 premiers pixels parcourus par un plomb.

Analyse et mesures avant modification : `tests/v031-before-benchmark.json`, source figée dans `tests/v031-before-src/`, hashes `tests/v031-before-hashes.json`. Baseline **793/793 tests**. Les sauvegardes/snapshots antérieurs restent présents.

## Valeurs réelles avant modification

Valeurs sans Atelier, Talents ou perks ; intervalles nominaux. Le DPS idéal suppose que tous les projectiles touchent sans perte, avec tir continu à l’arrêt. Ce n’est pas le DPS d’une run mobile.

| Valeur | Fusil à pompe | Mitraillette | Grisou X |
| --- | --- | --- | --- |
| Dégâts de base / projectile | 12 | 5 | 11 |
| Projectiles / salve | 7 | 1 | 3 |
| Intervalle | 0,90 s | 0,12 s | 0,85 s |
| Attaques / seconde | 1,11 | 8,33 | 1,18 |
| Portée d’acquisition | 192 px | 280 px | 350 px |
| Vitesse projectile | 730 px/s | 850 px/s | 620 px/s |
| Spread total | 0,49 rad ≈ 28,1° | 0° | 0,10 rad ≈ 5,7° |
| DPS idéal maximal | 93,33 | 41,67 | 38,82 |
| Falloff initial | `arrondi(12 × (1 − 0,62 × distance/192))`, distance plafonnée | Aucun | Aucun |
| Pénétration sans perk | Aucune | Aucune | Aucune |

L’acquisition utilise la distance entre centres, strictement inférieure à la portée. La balle naît 16 px devant le joueur ; le calcul de dégâts utilise sa distance réellement parcourue jusqu’à l’intersection avec la hitbox (rayon ennemi + 2 px). La taille du boss, le spread et l’alignement changent donc sensiblement les dégâts effectifs. Une grande hitbox reçoit davantage de plombs, et plus tôt, qu’une petite.

### Fusil : interactions inspectées

- Chevrotine lourde : +4 plombs/rang, cadence ×0,8 et spread ×1,18, deux rangs. Contre les boss, chaque plomb supplémentaire ne compte que pour 0,5 plomb ; les sept initiaux gardent leur poids. Deux rangs donnent donc 11 plombs pondérés et une cadence ×0,64, presque le même DPS idéal boss qu’au départ, avant précision/falloff.
- Détente allégée : intervalle ×0,75/rang, deux rangs, soit cadence ×1,778 au maximum. Perk partagé.
- Double détente : 30/60 % de deuxième salve, sans récursion. Double Canon garantit la seconde et remplace cette probabilité. Contre un boss, la seconde salve a un poids de 0,75 : ×1,75 au maximum, pas ×2. Le Double Canon rend les points déjà investis en Double détente redondants.
- Canon scié : +60 % de dégâts proches/rang, portée ×0,8/rang ; proximité mesurée entre centres ≤70 px. À bout portant : +100 %. Le bonus cumulé contre boss reste plafonné à +120 %. Aucun de ces mécanismes ne change.
- Bottes après tir et Plaques réduisent le risque d’une alternance tir/esquive ; ce sont des atouts du style burst, pas un dépassement démontré des multiplicateurs.

**Conclusion :** pas de nerf des perks. Les grands chiffres à courte portée correspondent à l’identité voulue, avec des limitations boss déjà présentes.

### Mitraillette : Focus et synergies

Focus concerne uniquement le premier boss touché par la balle. Il gagne 3 points de pourcentage par impact, jusqu’à +25 % ; la dixième balle peut bénéficier du maximum. À cadence nominale, cela demande environ 1,1 s de tirs plus le trajet. Changer de cible primaire, tuer le boss ou se déplacer pendant une seconde réinitialise le Focus ; une courte esquive ne le vide pas. Les cibles secondaires perforées n’alimentent ni ne volent le Focus.

DPS nominal à Focus maximal : **52,08**. Surchauffe ajoute +10 % de dégâts par seconde immobile, plafond +40 %, et disparaît dès le mouvement. À chaleur maximale, Surchauffe critique porte le multiplicateur total à ×2,4. Chargeur étendu accélère la cadence de 30 % pendant les deux premières secondes d’arrêt. Détente allégée se cumule avec ces mécanismes. Perforation : deux cibles à 100/60 %, ou trois à 100/80/64 % avec l’épique. Pluie de fer : cadence +50 %, dégâts −15 %.

**Conclusion :** DPS soutenu et builds stationnaires déjà forts. La difficulté en run vient aussi du temps réellement disponible à l’arrêt. Aucun micro-buff de dégâts ou de Focus n’est justifié par ces mesures isolées.

### Grisou X : synergies

Conduit ouvre deux cibles, puis Conduit renforcé trois/quatre : facteurs 100/70/50/35 %. Surcharge divise par deux la perte vers la cible suivante après un kill direct : première transition 100 → 85 % au lieu de 70 %. Arc inflige 35 % des dégâts du kill direct à un voisin à moins de 95 px, sans rebond récursif. La pénétration continue après un kill, dans sa limite de cibles.

Condensateur : +1 impulsion, dégâts ×0,88 et spread +0,035 rad/rang (deux rangs). Trois à quatre impulsions donnent +17,3 % de potentiel de salve, cinq avec deux rangs +29,1 %, sous réserve des impacts. Bobine rapide : cadence +25 %. Double Canon : deux salves. Avec quatre ennemis alignés et la pénétration maximale, le potentiel nominal sans autre bonus atteint `38,82 × 2,55 = 99 DPS` distribués, avant kills/Arc et temps de vol.

**Conclusion :** potentiel de groupes confirmé ; pas de changement.

## Réglage final avant / après

La nouvelle formule du Fusil est : dégâts précédents × `1 − 0,15 × clamp((distance − 45) / 147, 0, 1)`. La distance reste la longueur parcourue jusqu’à l’impact. Le résultat final peut être fractionnaire, déjà supporté par les multiplicateurs existants. Canon scié ne comprime pas cette courbe : il réduit toujours la portée et récompense toujours l’approche.

| Distance parcourue par le plomb | Avant | Après | Variation |
| --- | --- | --- | --- |
| 0 px | 12 | 12 | 0 % |
| 20 px | 11 | 11 | 0 % |
| 45 px | 10 | 10 | 0 % |
| 70 px | 9 | 8,77 | −2,55 % |
| 100 px | 8 | 7,55 | −5,61 % |
| 140 px | 7 | 6,32 | −9,69 % |
| 170 px | 5 | 4,36 | −12,76 % |
| 192 px | 5 | 4,25 | −15 % |

| Arme | Dégâts de base avant → après | Intervalle avant → après | Portée avant → après | DPS idéal maximal avant → après |
| --- | --- | --- | --- | --- |
| Fusil | 12 × 7 → identique | 0,90 → 0,90 s | 192 → 192 px | 93,33 → 93,33 ; perte supplémentaire uniquement loin |
| Mitraillette | 5 → 5 | 0,12 → 0,12 s | 280 → 280 px | 41,67 → 41,67 ; Focus max 52,08 inchangé |
| Grisou X | 11 × 3 → identique | 0,85 → 0,85 s | 350 → 350 px | 38,82 → 38,82 |

## Bancs DPS / TTK reproductibles

`node tests/v031-benchmark.mjs before` et `after`. Moteur réel Weapon/Projectiles, cible immobile non blindée, sans déplacement ni danger, pas de knockback intégré à sa position. Pas de stats permanentes. Pas de collision ou dégâts forcés. Simulation fine à 240 Hz pour limiter l’arrondi de cadence ; les runs sont à 60 Hz. DPS : dégâts pendant 30 s sur cible inépuisable, incluant temps de vol/installation. TTK : temps jusqu’à élimination, overkill exclu. La première attaque part immédiatement. Le groupe inépuisable ne reproduit pas les procs à la mort ; son TTK sur cibles mortelles complète cette mesure.

Cibles : A/B, 500 PV rayon 18 à 60/150 px ; C, trois cibles alignées de 120 PV à 60/110/160 px ; D/E/F, boss témoin de 1 800 PV rayon 28 à 150 px. Tous les DPS suivants sont **mesurés**, pas des plafonds nominaux.

| Scénario | Fusil DPS / TTK avant → après | Mitraillette DPS / TTK inchangés | Grisou X DPS / TTK inchangés |
| --- | --- | --- | --- |
| A. Proche | 87,3 / 5,46 s → identique | 41,5 / 11,99 s | 39,6 / 12,85 s |
| B. Moyenne portée | 24,9 / 20,05 s → 23,1 / 21,86 s | 41,3 / 12,10 s | 38,5 / 13,00 s |
| C. Trois ennemis, sans build | TTK 9,22 → 9,22 s | TTK 8,73 s | TTK 8,75 s |
| D. Boss sans build | 45,3 / 39,94 s → 42,4 / 43,55 s | 51,5 / 34,93 s | 38,5 / 46,30 s |
| E. Boss build moyen | 55,0 / 33,13 s → 51,5 / 34,84 s | 93,0 / 19,56 s | 48,4 / 37,07 s |
| F. Boss build fort | 113,8 / 15,98 s → 106,4 / 16,77 s | 198,6 / 10,35 s | 129,8 / 14,01 s |
| Boss proche, sans build | 87,3 / 20,82 s → identique | 51,7 / 34,82 s | 39,6 / 46,15 s |
| Cible à 230 px | Aucune acquisition | 41,2 / 12,19 s | 38,5 / 13,13 s |

Builds moyens : Fusil Chevrotine/Détente/Plaques ; Mitraillette Surchauffe/Détente/Plaques ; Grisou X Conduit/Bobine/Plaques. Builds forts (cinq choix normaux + un épique) : Fusil Chevrotine×2/Détente×2/Double détente/Double Canon ; Mitraillette Surchauffe/Détente×2/Chargeur/Plaques/Surchauffe critique ; Grisou X Conduit/Conduit renforcé/Bobine/Détente/Plaques/Double Canon. Le choix de builds est explicite, pas une recherche exhaustive du build optimal.

Sur le groupe C sans build, le débit utile total (360 PV / TTK) est **39,0 / 41,2 / 41,1 DPS** pour Fusil / Mitraillette / Grisou X, inchangé. Groupe de trois avec les builds forts, après patch : TTK Fusil **2,55 s**, Mitraillette **3,93 s**, Grisou X **1,23 s**, soit **141,2 / 91,7 / 292,9 DPS utiles**. Variante énergétique légale Conduit/Conduit renforcé/Condensateur/Surcharge/Arc/Double Canon : **1,91 s**. Arc et Surcharge apportent une autre voie de construction sans changement de leurs règles.

Le Fusil conserve nettement le burst proche, au prix d’une marge de contact réduite. Il perd face à la régularité de la Mitraillette sur petite cible moyenne et sur boss immobile ; Grisou X domine l’alignement avec pénétration. **Aucune arme ne domine toutes ces situations**, mais les écarts ponctuels dépassent volontairement 20 %. Ces mesures ne démontrent pas une égalité globale ni une tolérance de 15–20 % dans chaque scénario.

## Zones 4–6 : comparaison appariée

**36 tentatives complètes jusqu’à victoire/défaite**, 18 avant et 18 après. Deux graines par arme et zone, Atelier niveau 2 identique, mêmes entrées du pilote et mêmes priorités légales de perks. Aucune invulnérabilité, aucun kill imposé. `node tests/v031-zones.mjs before` / `after`, puis `node tests/v031-summary.mjs`. Les seeds fixes n’empêchent pas des choix de perks ou trajectoires de diverger quand le timing de combat change. Ce pilote évalue les menaces et ne cherche pas spécifiquement à maximiser le nouveau falloff.

| Zone / arme | Victoires avant → après | Vague moyenne avant → après | Durée moyenne des tentatives avant → après | Dégâts reçus moyens avant → après |
| --- | --- | --- | --- | --- |
| 4 / Fusil | 2/2 → 2/2 | 20 → 20 | 855 → 877 s | 2,25 → 1,25 |
| 4 / Mitraillette | 2/2 → 2/2 | 20 → 20 | 957 → 957 s | 1,50 → 1,50 |
| 4 / Grisou X | 2/2 → 2/2 | 20 → 20 | 729 → 729 s | 1,75 → 1,75 |
| 5 / Fusil | 2/2 → 2/2 | 20 → 20 | 793 → 833 s | 0,25 → 1,75 |
| 5 / Mitraillette | 2/2 → 2/2 | 20 → 20 | 1 046 → 1 046 s | 3,50 → 3,50 |
| 5 / Grisou X | 1/2 → 1/2 | 18,5 → 18,5 | 753 → 753 s | 4,25 → 4,25 |
| 6 / Fusil | 1/2 → 1/2 | 19,5 → 19 | 852 → 848 s | 3,50 → 5,00 |
| 6 / Mitraillette | 0/2 → 0/2 | 12 → 12 | 518 → 518 s | 5,50 → 5,50 |
| 6 / Grisou X | 0/2 → 0/2 | 14,5 → 14,5 | 596 → 596 s | 5,50 → 5,50 |

Les moyennes de tentatives incluent les défaites : la légère diminution du temps moyen Fusil Zone 6 vient d’une mort plus tôt (18 au lieu de 19), **pas d’une meilleure efficacité**. Sa victoire prend 880 → **927 s**, +5,3 %. Les replays des deux autres armes sont strictement identiques avant/après (temps, dégâts, kills, perks et durées des vagues), pas seulement leurs moyennes.

Boss terminés 5 / 10 / 15 / 20, moyennes Fusil avant → après :

- Zone 4 : **26/45/49/39 → 26/49/49/43 s**.
- Zone 5 : **37/39/31/51 → 40/40/35/55 s**.
- Zone 6 : **40/30/45/42 → 44/26/52/47 s**.

Les durées exactes des boss des trois armes sont dans `tests/v031-zone-comparison.json`. Elles incluent le combat réellement simulé ; les boss non terminés sont exclus des moyennes. Variations non monotones possibles avec placement/perks. Le Fusil garde son avantage de run dans cet échantillon Zone 6 ; la baisse mesurée est modeste, conformément au patch ciblé. Aucun deuxième nerf ni buff automatique n’a été appliqué.

## Validation humaine proposée

Faire une tentative Zone 6 avec chaque arme, puis idéalement une seconde avec les mêmes niveaux Atelier/Talents. Noter arme, perks, vague atteinte, temps, morts par contact ou projectiles/sol et impression de marge d’esquive. Avec le Fusil, comparer volontairement des tirs très proches et des tirs à la limite de sa portée, sans changer les perks de proximité entre les observations. Avec la Mitraillette, observer si la stabilité nécessaire au Focus/Surchauffe est praticable ; avec Grisou X, noter les alignements et le build Conduit/Arc.

Ne pas conclure sur le seul ordre de trois défaites : le build et les erreurs de placement comptent. Le retour humain décidera d’un éventuel prochain patch ; cette V0.31 s’arrête ici.

## Périmètre technique et vérifications

Code de combat modifié uniquement dans `src/weapons.js` et `src/combat.js`. Libellé de version actualisé dans `package.json`, `package-lock.json`, `index.html`, `server.mjs` (message de démarrage uniquement) et `src/menu/main-menu.js`. Le `client_version` du classement distant reste inchangé conformément à l’interdiction de toucher au classement ; aucune intégration distante modifiée.

Douze nouveaux tests couvrent proximité, décroissance bornée, impacts balayés indépendants du pas, perks/cadence, Focus, absence de tir mobile, replays Mitraillette/Grisou X et compatibilité des sauvegardes. Trois contrôles existants adaptés au changement explicitement autorisé (extension de définition Fusil et deux vérifications du numéro de version), aucun test supprimé. Le garde de hashes historique suit l’autorisation V0.31 ; un nouveau garde strict protège tous les autres fichiers du snapshot immédiat, y compris toutes les Zones 4–6, boss, ennemis, perks et systèmes permanents.

**Suite finale : 805/805 réussis**, sans test ignoré, `tests/v031-final-tests.txt`. Les deux premières passes avec assertions historiques à adapter sont archivées séparément ; aucun échec de combat n’a été masqué. Inventaire `tests/v031-source-scope.json` : trois fichiers source modifiés (deux de combat et le libellé de menu), **162 fichiers source inchangés**.

Navigateur Chromium, vraie scène et pilote accéléré sur origine QA isolée `127.0.0.1:5181` : Fusil Atelier 2/graine 2, victoire en **927,05 s**, 4,5 dégâts ; Mitraillette Atelier 5/graine 1, défaite vague 17 en **751,78 s**, 6,25 dégâts ; Grisou X Atelier 5/graine 1, victoire en **788,82 s**, 3,5 dégâts. Ces équipements différents servent à la vérification fonctionnelle, pas à un classement comparatif entre armes. Les simulations appariées ci-dessus utilisent toutes Atelier 2.

Formats **320 × 568 et 390 × 844**, aucun débordement horizontal, aucune erreur ni avertissement console. Progression et portefeuille conservés après rechargement, +2 Diamants de première victoire non répétés à la deuxième victoire. Rapport `tests/v031-browser-validation.json`, captures `tests/v031-shotgun-320.jpg` et `tests/v031-grisoux-390.jpg`. Le serveur QA est arrêté et le format du navigateur rétabli après les contrôles. Le serveur et la sauvegarde de jeu habituels n’ont pas été utilisés par le banc. Ceci ne constitue pas une validation sur téléphone physique.
