# V0.37B.1 — activité et mobilité des boss Zone 6

Correctif limité aux trois boss. Les patterns validés, masters, HP, dégâts, rayons, armes, mobs, autres zones et systèmes de progression sont conservés. Aucun commit/push. Aucune sheet ni animation produite. Arrêt avant V0.37C.

## Cause mesurée

V037B immobilisait chaque boss pendant tout son plan. Le triple exigeait aussi que **tous** les boss aient quitté leur attaque et leur recovery, puis attendait un cooldown global de 8,2 / 7,2 s. Le troisième boss n’avait pas d’action légère. Sur 60 s, 45,15 s ne contenaient aucun danger actif, malgré les états de préparation et les réservations MAJOR.

Baseline vérifiée : **1103/1103**. Suite finale : **1124/1124**, aucun test existant retiré ni désactivé ; 21 nouveaux tests. Journaux : [baseline](v037b1-validation/baseline-tests.txt), [final](v037b1-validation/final-tests.txt).

## Mobilité retenue

Le coefficient est la **vitesse initiale maximale**, puis le déplacement ralentit progressivement vers une courte destination. Le vecteur est choisi au départ, latéralement vers l’intérieur de l’arène, sans correction en fonction du joueur. La distance est également bornée par les murs. Pas de pathfinding. Les catégories complètes du code sont ATTACK_STATIC, ATTACK_MOBILE, ATTACK_LOCKED_DIRECTION.

| Pattern | Catégorie | Coefficient | Distance plafond | Règle |
| --- | --- | --- | --- | --- |
| Four : secteurs | MOBILE | 40 % | 70 px | Pas latéral pendant la chauffe ; secteurs au sol fixes. |
| Four : cône | LOCKED_DIRECTION | 35 % | 20 px | Tracking initial 0,35 s inchangé ; cône fixé ensuite, petit pas indépendant. |
| Four : rotation | MOBILE | 35 % | 28 px | Centre dérivant avec le boss ; angle et vitesse de rotation prédéfinis. |
| Four : marche à blanc | MOBILE | 45 % | 65 px | Déplacement entre poses ; les trois cibles restent celles du départ. |
| Pilon : frappe ciblée | STATIC | 0 | 0 | Ancré dès la marque ; repositionnement normal avant le départ. |
| Pilon : double battue | MOBILE | 35 % | 16 px | Fenêtre 1,55–2,05 s au maximum ; arrêt avant le deuxième impact, y compris sous 50 %. |
| Pilon : rythme de forge | MOBILE | 35 % | 12 px | Micro-pas entre les deux premières frappes ; dernière frappe ancrée. |
| Pilon : contre-coup | LOCKED_DIRECTION | 35 % | 10 px | Très bref dégagement après l’onde ; aucun pas pendant l’impact. |
| Chaudière : soupapes | LOCKED_DIRECTION | 55 % | 34 px | Pas latéral ; axes et origines des jets annoncés restent fixes. |
| Chaudière : purge | MOBILE | 35 % | 32 px | Centre dérivant lentement ; rotation prédéfinie, indépendante du joueur. |
| Chaudière : surpression | MOBILE | 60 % | 65 px | Repositionnement pendant le pattern ; les trois zones V037B restent simultanées. |
| Chaudière : vague | LOCKED_DIRECTION | 40 % | 25 px | Pas pendant les 0,9 premières secondes puis ancrage avant émission. |
| Trois ultimes | STATIC | 0 | 0 | Ancrage intégral et usages uniques inchangés ; toujours désactivés dans le triple. |
| Combos / LIGHT | LOCKED_DIRECTION ou STATIC | Four 40 %, Chaudière 55 % | 40 px | Pilon ancré ; zones fixes. |

La dérive des deux rotations utilise exactement la même projection dans le rendu, les collisions et le contrôle de sortie. Les dangers fixes restent au sol même si le boss fait un petit pas. Cela évite tout changement de trajectoire après l’annonce. Les collisions de contact suivent les positions réelles et la logique existante.

Recoveries MAJOR strictement inchangées : **1,10 s / 0,95 s sous 50 %, 1,20 s pour les combos, 1,50 s pour les ultimes**, immobiles et vulnérables. Aucun appel du scheduler ne peut les interrompre. Seul le repositionnement après recovery dans le triple passe à 0,20 s / 0,12 s sous 50 %.

## Scheduler et actions légères

- Deux réservations MAJOR maximum, même pendant leurs télégraphes. Aucun troisième pattern majeur caché.
- La paire d’un combo peut démarrer alors que le troisième boss récupère ou maintient une petite zone légère. On n’attend plus les trois recoveries.
- Cooldown minimal des combos : **2,8 s**, ou **2,4 s sous 50 % des PV globaux**. Ce seuil ne court-circuite jamais une recovery ou une attaque en cours.
- Rotation des trois combos avec anti-répétition. Une paire momentanément occupée n’est pas ignorée au profit du combo le plus court ; une paire devenue impossible après décès peut être sautée.
- Pendant deux MAJOR, le troisième boss peut préparer / poser un LIGHT. Une attente suffisamment longue du partenaire peut aussi être remplie par une petite action brève. Les attaques normales indépendantes restent disponibles quand la paire ne peut pas être formée ou que le cooldown n’est pas atteint.
- LIGHT réutilise les formes existantes : Four = carré de chauffe 48 × 48 ; Pilon = impact local rayon 34 ; Chaudière = pression locale rayon 32. Cible verrouillée au départ, dégâts existants de 0,5 et invulnérabilité commune. Pas de projectile ajouté.
- Télégraphe LIGHT : 1 s (Four / Chaudière), 1,2 s (Pilon). Durée du danger : Four 3 s, Chaudière 3,6 s, Pilon 0,65 s ; soutien de Pression cadencée réduit à 1,45 s ; remplissage bref 0,60 s.
- L’émission LIGHT se termine 0,25 s après le télégraphe, puis recovery immobile spécifique de **0,35 s**. La zone peut persister indépendamment. **Un seul effet LIGHT non refroidi par boss** : pas d’empilement. Un identifiant d’attaque sépare les zones persistantes des nouvelles préparations.
- Aucun MEDIUM artificiel : seulement MAJOR / LIGHT, avec intensité explicite.
- Caps conservés : **24 projectiles / 5 hazards / 3 surchauffes / 2 MAJOR**. L’admission reste atomique et est réessayée après 0,2 s avec un télégraphe complet en cas de saturation ou d’absence de sortie.
- Le triple conserve une grande région froide connectée et une sortie temporelle. Les projections sont vérifiées avant admission. Si une étape de Pression cadencée est retardée, l’exclusion onde / impact est revérifiée : leur alternance validée ne se transforme pas en collision simultanée.

## Instrumentation fixe — 60 secondes

Le même pilote d’entrées évite les dangers visibles ; les tirs sont désactivés et les dégâts au joueur neutralisés **uniquement dans le harnais** pour garder trois boss vivants durant une minute. Ce test ne compte pas comme une victoire. Les positions, patterns et télégraphes réels sont utilisés. Les données sont dans [before.json](v037b1-validation/before.json) et [after.json](v037b1-validation/after.json), première ligne.

« Actif » signifie un hazard réellement dangereux, pas une réservation ou une animation. « Offensif » comprend danger actif et plan en préparation. Les temps par boss sont exclusifs : actif MAJOR, actif LIGHT, prepare, recovery, mouvement seul, idle. Le mouvement pendant une attaque est classé dans l’attaque. L’absence de danger actif inclut les télégraphes et recoveries, pas seulement une attente inutile.

| Mesure / 60 s | Avant | Après |
| --- | --- | --- |
| Attaques démarrées | 14,00 | 39,00 |
| Combos démarrés | 7,00 | 12,00 |
| Sans danger actif (s) | 45,15 | 25,92 |
| Un boss avec danger actif (s) | 10,97 | 18,62 |
| Deux boss avec dangers actifs (s) | 3,88 | 12,17 |
| Trois boss avec dangers actifs (s) | 0,00 | 3,30 |
| Deux MAJOR réellement actives (s) | 3,88 | 5,67 |
| Épisodes de double MAJOR | 5,00 | 8,00 |
| Trois actions offensives, préparation comprise (s) | 0,00 | 31,10 |
| Danger actif + autre boss offensif (s) | 10,62 | 30,53 |
| Sans attaque active, mais déplacement (s) | 43,77 | 23,90 |
| Sans attaque active ni déplacement (s) | 1,38 | 2,02 |
| Plus longue période sans danger actif (s) | 6,12 | 3,78 |

La cible « attaque active + autre boss offensif » atteint **50,89 %** de la minute contre 17,69 %. Les doubles MAJOR se produisent en **8 épisodes/minute**, contre 5. Les trois boss ont une action offensive pendant 31,10 s.

| Boss | Version | MAJOR s | LIGHT s | Prepare s | Mouvement s | Idle s | Recovery s | Attaques | Épisodes avec chevauchement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| furnace | Avant | 10,58 | 0,00 | 7,55 | 34,40 | 1,47 | 6,00 | 5 | 5 |
| furnace | Après | 16,93 | 6,20 | 18,70 | 6,97 | 1,55 | 9,65 | 15 | 14 |
| hammer | Avant | 2,00 | 0,00 | 15,93 | 35,83 | 1,43 | 4,80 | 4 | 2 |
| hammer | Après | 3,37 | 2,60 | 36,03 | 8,12 | 1,48 | 8,40 | 12 | 4 |
| boiler | Avant | 6,15 | 0,00 | 13,92 | 32,47 | 1,47 | 6,00 | 5 | 3 |
| boiler | Après | 9,28 | 14,47 | 23,90 | 2,47 | 1,48 | 8,40 | 12 | 12 |

Combos observés sur cette minute : **Forge sous pression 3 → 4 ; Pilon à blanc 2 → 4 ; Pression cadencée 2 → 4**. Aucun combo répété immédiatement tant que les trois boss sont vivants.

## 30 simulations comparables avant et après

**60 combats au total** : pour chaque version, 3 armes × 10 seeds. Seeds 1–5 : Atelier rang 2 ; seeds 6–10 : rang 5. Positions de départ variées (x 150 / 225 / 300 ; y 470 / 540), choix de perk via le même pilote, mêmes règles. Aucun dégât/HP neutralisé dans ces 30 combats : déplacements et tirs à l’arrêt normaux. Limite 360 s, aucun timeout. Pas de modification du pilote entre versions.

| Version | Victoires | Durée moyenne s | Attaques/min moy. | Actif + autre, 3 vivants | Double MAJOR, 3 vivants | Actif + autre, combat entier | Double MAJOR, combat entier |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Avant | 30/30 | 96,19 | 15,12 | 17,86 % | 6,36 % | 14,18 % | 6,67 % |
| Après | 30/30 | 82,11 | 28,76 | 50,52 % | 9,44 % | 35,79 % | 6,16 % |

La phase avec trois boss vivants est la comparaison pertinente pour l’objectif de simultanéité : **50,52 %** d’attaque active + autre offensif, contre **17,86 %** ; doubles MAJOR **9,44 % contre 6,36 %**. Sur le combat entier, le taux de doubles MAJOR baisse légèrement (6,67 % → 6,16 %) : les morts successives et les fins en duel/solo sont incluses. Ce résultat est conservé dans le rapport, sans le masquer par la seule mesure fixe.

| Arme | Victoires avant → après | Durée moyenne avant → après (s) | Attaques/min avant → après | Dégâts reçus max après |
| --- | --- | --- | --- | --- |
| shotgun | 10/10 → 10/10 | 84,31 → 66,68 | 15,29 → 28,37 | 1.5 |
| smg | 10/10 → 10/10 | 97,75 → 82,76 | 14,98 → 29,48 | 0.5 |
| grisoux | 10/10 → 10/10 | 106,50 → 96,90 | 15,10 → 28,42 | 0.5 |

Les **30/30** combats après correctif montrent les trois combos. Ils durent en moyenne 82,11 s contre 96,19 s. La réduction de durée n’est pas une preuve de difficulté supérieure : le déplacement des boss les rapproche aussi des armes. Le pilote prédictif est meilleur qu’un joueur moyen ; le ressenti Android reste à valider humainement.

Maximum mesuré sur le lot après : 5 hazards, 3 surchauffes, 2 MAJOR, 0 projectile émis par ces nouveaux patterns. Le plafond de 24 projectiles reste inchangé et testé par la suite historique.

Reproduction : <code>node v037b1-validation/measure.mjs before</code> puis <code>node v037b1-validation/measure.mjs after</code>. L’état V037B complet est conservé dans <code>v037b1-validation/before/src</code>. Les métriques détaillées de chaque seed, boss, combo et arme figurent dans les deux JSON.

## Solos et navigateur

| Boss | Arme | Résultat | Durée s | Dégâts reçus |
| --- | --- | --- | --- | --- |
| furnace | shotgun | won | 27,80 | 0 |
| furnace | smg | won | 37,38 | 0 |
| furnace | grisoux | won | 43,78 | 0 |
| hammer | shotgun | won | 25,83 | 0 |
| hammer | smg | won | 47,20 | 0 |
| hammer | grisoux | won | 51,32 | 0 |
| boiler | shotgun | won | 52,95 | 0 |
| boiler | smg | won | 44,80 | 0 |
| boiler | grisoux | won | 55,40 | 0 |

**18 captures** : neuf scénarios dans chaque format **320 × 568** et **390 × 844**. Trois solos mobiles, deux MAJOR, deux MAJOR + LIGHT, les trois combos, recovery MAJOR pendant l’activité des autres. Les recherches de chevauchement utilisent le scheduler réel, pas des attaques forcées. Les solos sont déclenchés volontairement pour examiner précisément la mobilité. Le compte rendu DOM atteste chaque état : [browser-captures.json](v037b1-validation/browser-captures.json).

Deux séquences supplémentaires de plus de 60 s dans Phaser, pilote actif et HP normaux : 390 px : 63,32 s, mise à jour moyenne 0,40 ms, pic 7,30 ms ; 320 px : 63,25 s, mise à jour moyenne 0,37 ms, pic 8,30 ms. Les captures isolées peuvent inclure un pic de chargement/JIT jusqu’à 24,50 ms. Ces chiffres sont des temps CPU de simulation/rendu sur PC, **pas une mesure de FPS sur téléphone physique**. Aucun débordement horizontal et aucune erreur/alerte console dans le navigateur de contrôle.

[Galerie et captures](v037b1-validation/gallery.html) · [Journal navigateur](v037b1-validation/browser-console.json) · [Mesures navigateur](v037b1-validation/browser-runtime.json).

## Périmètre vérifié et limites

Fichiers de production modifiés : `src/forge/boss-director.js`, `src/forge/boss-safety.js`, `src/forge/boss-view.js`, `src/forge/dungeon-boss.js`. Nouveaux modules : `src/forge/boss-light.js`, `src/forge/boss-mobility.js`. Le reste de src, les masters et les textures de production sont comparés octet par octet à la copie V037B. Les tables de patterns sont elles-mêmes inchangées. Tests ajoutés : <code>tests/v037b1-activity.test.js</code> ; registre des nouveaux modules adapté dans <code>tests/v037b-authorized-files.js</code> sans supprimer les anciennes assertions. [Empreintes et inventaire](v037b1-validation/scope.json).

- Une période sans danger actif peut encore durer 3,78 s sur la minute fixe ; elle inclut les préparations et les recoveries préservées. Les doubles MAJOR sont régulières mais restent brèves, surtout les impacts du Pilon. Ce correctif ne transforme pas les patterns validés en longues zones permanentes.
- La vérification de sortie tient compte des hazards et de leur dérive ; elle ne constitue pas une preuve mathématique de survie face aux corps des trois boss et aux décisions d’un joueur humain. Collisions de contact et invulnérabilité restent celles du jeu.
- Les corps utilisent toujours les masters statiques temporaires. Leur déplacement réel est visible, mais les jambes ne disposent pas encore de cycles de marche pendant attaque.
- Aucun test Android physique nouveau n’a été effectué. La validation précédente de V037B est un retour utilisateur distinct.

## Suite documentaire, sans démarrage V0.37C

Voir [V037C-ANIMATION-REQUIREMENTS.md](V037C-ANIMATION-REQUIREMENTS.md) : séparer locomotion du bas du corps et anticipation/exécution du haut, respecter le verrouillage et l’immobilité des recoveries. Aucun atlas, master ou timing d’animation produit. **Arrêt après V0.37B.1.**
