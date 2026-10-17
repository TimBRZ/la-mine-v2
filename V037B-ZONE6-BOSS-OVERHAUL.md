# La Mine V2 — V0.37B : boss des Forges oubliées

Version de travail du 14 octobre 2026. Gameplay des trois boss uniquement ; masters statiques validés copiés à l’identique pour leur présentation temporaire. Aucun atlas définitif, aucune modification de CGWeb, des armes, des mobs, de la progression ou des autres zones. Aucun commit/push.

## Rythme et règles communes

- Télégraphe → géométrie verrouillée → exécution → recovery immobile. Une attaque n’est pas abandonnée si l’admission est refusée : nouvelle tentative après 0,20 s, avec télégraphe intégral.
- Phase I : recovery 1,10 s, repositionnement minimal 0,55 s entre deux séquences. Phase II sous 50 % : recovery 0,95 s, repositionnement 0,35 s ; télégraphes ×0,94. Aucun buff de PV ou dégâts.
- Ultime solo prioritaire au prochain début de séquence à ≤25 % PV, une seule tentative de séquence par boss vivant. La mort annule toujours ses hazards ; aucune invulnérabilité ni vie supplémentaire n’est accordée pour forcer la fin de l’ultime.
- Chaque ultime termine par 1,50 s de décompression. Dans le triple, les ultimes individuels sont désactivés, y compris sur le dernier survivant.
- Plafonds inchangés : **24 projectiles / 5 hazards / 3 surchauffes / 2 boss majeurs**. Chaque secteur, bras, cercle ou jet consomme un emplacement ; aucune collection cachée dans un seul hazard.
- Dégâts de zone : 0,5, soumis à l’invulnérabilité partagée existante. PV, rayon, contact et vitesse de base des boss restent ceux de la configuration précédente.
- Les nouveaux kits ne créent pas de projectiles hostiles : leurs dangers sont géométriques et bornés. Les projectiles des mobs et les anciens diagnostics conservent leur pool de 24.
- Admission sur une grille temporelle de 20 px / 0,10 s, déplacement de 200 px/s, marge de collision supplémentaire de 7 px. Projection identique à celle des bras et ondes actifs. Les grands volumes sont tronqués au rectangle de l’arène pour le rendu.


## Maître de Four

### SECTEURS DE CHAUFFE

Deux secteurs opposés ; trois sous 50 %. Passage central et contournements. Les secteurs sont des hazards distincts.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.35 | 1.80 | 2 | 2 |

Fin nominale de la séquence : 3.20 s, puis **1.10 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.
### CÔNE DE FOURNAISE

Cône de 225 px, demi-angle 0,66 rad. Suivi limité à 0,65 rad/s pendant 0,35 s, puis verrouillage définitif.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.40 | 0.65 | 1 | 1 |

Fin nominale de la séquence : 2.10 s, puis **1.10 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.
### FOUR TOURNANT

Deux bras opposés de 145 px, demi-largeur 14 px, rotation de 0,42 rad/s. Sens alterné entre utilisations sous 50 %, jamais pendant un balayage.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.40 | 2.50 | 2 | 2 |

Fin nominale de la séquence : 3.95 s, puis **1.10 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.
### MARCHE À BLANC

Trois disques de 47 px autour de la position échantillonnée du joueur. Espacement des annonces : 0,65 s ; disparition progressive.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.20 | 0.65 | 1 | 1 |
| 2 | 0.65 | 1.20 | 0.65 | 1 | 1 |
| 3 | 1.30 | 1.20 | 0.65 | 1 | 1 |

Fin nominale de la séquence : 3.20 s, puis **1.10 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.
### ULTIME · FOUR À BLANC

Trois secteurs couvrent une grande partie de l’arène et laissent deux bandes sûres bordées en vert d’eau. Deux vagues, bandes déplacées entre les vagues, puis cône final. Aucune chauffe totale.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.79 | 0.65 | 3 | 3 |
| 2 | 2.90 | 1.79 | 0.65 | 3 | 3 |
| 3 | 5.80 | 1.36 | 0.60 | 1 | 1 |

Fin nominale de la séquence : 7.81 s, puis **1.50 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.

## Marteau-Pilon

### FRAPPE CIBLÉE

Disque ciblé de 62 px, puis onde locale de 62 à 100 px. La cible est échantillonnée avant le télégraphe.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.25 | 0.22 | 1 | 0 |
| 2 | 1.45 | 0.35 | 0.50 | 1 | 0 |

Fin nominale de la séquence : 2.35 s, puis **1.10 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.
### DOUBLE BATTUE

Deux grandes zones successives, annonces espacées de 0,85 s. Alternance gauche/droite puis haut/bas entre utilisations.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.25 | 0.30 | 1 | 0 |
| 2 | 0.85 | 1.25 | 0.30 | 1 | 0 |

Fin nominale de la séquence : 2.45 s, puis **1.10 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.
### RYTHME DE FORGE

Impacts de 38, 52 puis 70 px. Annonces espacées de 0,85 s (0,72 s sous 50 %), puis une seule onde finale de 125 px.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.20 | 0.22 | 1 | 0 |
| 2 | 0.85 | 1.20 | 0.22 | 1 | 0 |
| 3 | 1.70 | 1.20 | 0.22 | 1 | 0 |
| 4 | 3.10 | 0.40 | 0.70 | 1 | 0 |

Fin nominale de la séquence : 4.25 s, puis **1.10 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.
### CONTRE-COUP

Impact au pied du pilon de 62 px, puis onde de 62 à 190 px. Intérieur sûr après passage ; encoche permettant le franchissement.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.30 | 0.25 | 1 | 0 |
| 2 | 1.55 | 0.40 | 1.40 | 1 | 0 |

Fin nominale de la séquence : 3.40 s, puis **1.10 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.
### ULTIME · CADENCE ROUGE

Quatre impacts annoncés aux temps 0 / 1,05 / 1,95 / 2,72 s, de 48 / 48 / 48 / 76 px ; une seule onde finale de 225 px.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.22 | 0.24 | 1 | 0 |
| 2 | 1.05 | 1.22 | 0.24 | 1 | 0 |
| 3 | 1.95 | 1.22 | 0.24 | 1 | 0 |
| 4 | 2.72 | 1.22 | 0.24 | 1 | 0 |
| 5 | 4.25 | 0.47 | 1.50 | 1 | 0 |

Fin nominale de la séquence : 6.27 s, puis **1.50 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.

## Chaudière

### SOUPAPES LATÉRALES

Deux jets opposés de 165 px, demi-largeur 19 px. Les axes alternent entre utilisations ; les deux axes perpendiculaires restent libres.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.30 | 0.85 | 2 | 0 |

Fin nominale de la séquence : 2.20 s, puis **1.10 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.
### PURGE TOURNANTE

Un jet de 160 px, deux sous 50 %. Rotation de 0,40 rad/s, sens fixé au départ et alterné entre utilisations en phase II.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.35 | 2.30 | 1 | 0 |

Fin nominale de la séquence : 3.70 s, puis **1.10 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.
### SURPRESSION AU SOL

Trois cercles de 48 px, espacés dans l’arène ; activation courte simultanée.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.30 | 0.65 | 3 | 0 |

Fin nominale de la séquence : 2.00 s, puis **1.10 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.
### VAGUE DE PRESSION

Une seule onde de 40 à 215 px, demi-largeur 12 px, intérieur et extérieur libres ; encoche de sortie annoncée.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.40 | 1.65 | 1 | 0 |

Fin nominale de la séquence : 3.10 s, puis **1.10 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.
### ULTIME · RUPTURE DE SOUPAPE

Deux jets horizontaux, deux verticaux, puis une onde de 240 px ; décompression immobile de 1,50 s.

| Étape | Annonce à (s) | Télégraphe (s) | Danger actif (s) | Dangers séparés | Surchauffes |
|---|---:|---:|---:|---:|---:|
| 1 | 0.00 | 1.69 | 0.75 | 2 | 0 |
| 2 | 2.80 | 1.32 | 0.75 | 2 | 0 |
| 3 | 5.20 | 1.32 | 1.70 | 1 | 0 |

Fin nominale de la séquence : 8.27 s, puis **1.50 s de recovery immobile**. Les secondes de préparation en attente d’admission ne raccourcissent jamais un télégraphe.

## Triple final : trois combos exclusifs

| Combo | Coordination | Passage conservé |
|---|---|---|
| Forge sous pression | Maître de Four : deux secteurs, warning 1,50 s / actif 2,10 s. Chaudière : annonce d’un jet après 0,55 s, warning 1,45 s / actif 1,05 s. | Le jet entre dans une partie du secteur froid inférieur gauche ; le couloir central reste libre. |
| Pilon à blanc | Maître de Four : grand secteur gauche, warning 1,40 s / actif 2,10 s. Pilon : annonce après 0,80 s, warning 1,30 s / impact 0,35 s, sur le bord du secteur. | Large côté droit libre. |
| Pression cadencée | Chaudière : vagues aux annonces 0 et 3,25 s, warning 1,30 s / actif 0,75 s. Pilon : annonces 1,65 et 4,90 s, warning 1,20 s / impact 0,30 s. | Pression → impact → pression → impact, sans activation exactement simultanée. |

Deux acteurs sont réservés pendant chaque combo, le troisième se repositionne. Départs des combos espacés d’au moins 8,20 s, puis 7,20 s sous 50 % PV cumulés ; la fin de séquence et la recovery sont toujours respectées. Si un partenaire est mort, le directeur choisit une paire encore disponible. Le dernier survivant utilise ses quatre patterns normaux.

## Tests

**1103/1103 réussis**, dont les **1 059 tests préexistants conservés**. Les listes historiques d’exceptions aux hashes reconnaissent six fichiers d’intégration autorisés ; un nouveau garde-fou contrôle tous les autres fichiers source/assets contre le snapshot immédiat. Aucun ancien test de comportement n’a été supprimé.

Couverture ajoutée : les 15 séquences réelles, télégraphes et verrouillage, dégâts retardés/invulnérabilité, esquive à vitesse mobile, alternance entre cycles complets, phase II, ultimes uniques, géométrie des ondes, caps, retries, nettoyage à la mort, trois combos, et tirs effectifs des trois armes en recovery. Les anciens appels explicites aux patterns restent utilisables pour leurs tests historiques ; la factory et le directeur runtime sélectionnent le nouveau kit.

Commande : `npm.cmd test`. Rapport : [final-tests.txt](v037b-validation/final-tests.txt).

## Simulations reproductibles

Pilote d’entrées uniquement, graine 1, pas de god mode, pas d’édition des PV/dégâts, pas d’arme améliorée hors Atelier/perks ordinaires. Les solos et le triple démarrent directement sur leur vague avec le premier choix de perk ; les runs complètes commencent vague 1.

| Mode | Arme | Atelier | Résultat / vague | Durée (s) | Dégâts subis | Déplacement (s) | Arrêt risqué* (s) | Recovery sûre* (s) | Tirs en recovery |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|
| Maître de Four | shotgun | 2 | won / 5 | 29.45 | 0 | 4.93 | 2.47 | 5.35 | 7 |
| Maître de Four | smg | 2 | won / 5 | 42.45 | 0 | 8.62 | 4.43 | 7.75 | 66 |
| Maître de Four | grisoux | 2 | won / 5 | 42.27 | 0 | 4.25 | 2.95 | 7.37 | 9 |
| Marteau-Pilon | shotgun | 2 | won / 10 | 32.90 | 0.5 | 10.80 | 4.48 | 6.72 | 8 |
| Marteau-Pilon | smg | 2 | won / 10 | 49.87 | 1 | 10.47 | 6.38 | 9.87 | 86 |
| Marteau-Pilon | grisoux | 2 | won / 10 | 55.27 | 0 | 10.93 | 6.45 | 11.08 | 15 |
| Chaudière | shotgun | 2 | won / 15 | 48.05 | 0 | 1.88 | 0.67 | 10.02 | 13 |
| Chaudière | smg | 2 | won / 15 | 44.80 | 0 | 0.07 | 0.00 | 8.75 | 76 |
| Chaudière | grisoux | 2 | won / 15 | 55.40 | 0 | 0.00 | 0.00 | 11.92 | 16 |
| triple | shotgun | 2 | won / 20 | 98.52 | 0 | 17.90 | 1.83 | 22.77 | 25 |
| triple | smg | 2 | won / 20 | 119.85 | 0 | 24.62 | 2.22 | 27.97 | 179 |
| triple | grisoux | 2 | won / 20 | 123.18 | 0 | 17.93 | 2.28 | 28.98 | 36 |
| full | shotgun | 2 | lost / 19 | 874.62 | 5.5 | 326.55 | 93.93 | 17.50 | 24 |
| full | smg | 2 | lost / 13 | 589.75 | 5.5 | 189.20 | 50.77 | 14.50 | 123 |
| full | grisoux | 2 | lost / 17 | 807.57 | 5.5 | 268.47 | 66.25 | 30.07 | 40 |

Complément Atelier 5, sans retouche de combat :

| Mode | Arme | Atelier | Résultat / vague | Durée (s) | Dégâts subis | Déplacement (s) | Arrêt risqué* (s) | Recovery sûre* (s) | Tirs en recovery |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|
| full | shotgun | 5 | won / 20 | 716.20 | 3 | 245.93 | 79.90 | 18.42 | 37 |
| full | smg | 5 | lost / 16 | 600.25 | 6.25 | 187.65 | 58.08 | 16.70 | 167 |
| full | grisoux | 5 | won / 20 | 760.55 | 1.5 | 217.32 | 46.37 | 29.08 | 65 |

*« Arrêt risqué » : projection des hazards annoncés aux horizons 0,15 / 0,40 / 0,80 s et proximité de contact. C’est un indicateur du pilote, pas une preuve qu’aucun autre placement ne permettrait de tirer. Le temps de déplacement inclut aussi ses choix de placement. « Recovery sûre » utilise le même indicateur. Les JSON donnent aussi la plus longue interruption et les patterns effectivement rencontrés.

Résultats bruts : [simulations.json](v037b-validation/simulations.json), [complément Atelier 5](v037b-validation/simulations-rank5.json). Tous les solos et triples testés sont gagnés avec les trois armes. Les défaites des runs complètes surviennent sur les vagues standards ; aucun nerf de ces vagues n’a été effectué. Aucun échantillon sans cellule sûre, aucun dépassement de cap. Ces contrôles discrets ne prouvent pas toutes les trajectoires humaines possibles.

## Navigateur et captures

36 captures : les 15 patterns et les 3 combos, en **320×568** et **390×844**. Télégraphes chauds, marques du pilon, jets/ondes bleu clair ; bandes sûres vert d’eau pour Four à blanc. Masters corrects, pas de débordement horizontal ni erreur console sur la version finale contrôlée.

- 390px : 18.78s de triple, moyenne simulation+rendu 0.45 ms / pas, pic 6.70 ms, caps observés {"ground":3,"heat":2,"major":2,"bolts":0}.
- 320px : 17.98s de triple, moyenne simulation+rendu 0.78 ms / pas, pic 13.80 ms, caps observés {"ground":3,"heat":2,"major":2,"bolts":0}.

Ces mesures proviennent du navigateur du PC, avec viewport mobile ; ce ne sont pas des mesures sur téléphone Android physique.

[Galerie des captures](v037b-validation/gallery.html) · [Rapport DOM et textures](v037b-validation/browser-captures.json) · [Exécution triple](v037b-validation/browser-runtime.json). Serveur QA isolé : `node v037b-validation/server.mjs`, puis http://127.0.0.1:5209/. Il utilise sa propre origine de test. Le serveur normal continue d’utiliser le code de production et ses sauvegardes habituelles.

## Limites à valider humainement

Les 18 séquences ont également été exécutées pendant 15 s chacune dans les deux viewports, soit 36 scénarios navigateur sur le code final : [320 px](v037b-validation/browser-sequences.json), [390 px](v037b-validation/browser-sequences-390.json). La [console finale](v037b-validation/browser-console.json) ne contient aucune erreur ni alerte. Ces scénarios prolongés atteignent 4 hazards et 3 surchauffes, toujours sous les plafonds.

- Les boss sont battables par le pilote ; le triple inflige peu ou pas de dégâts à ce pilote qui anticipe parfaitement les géométries. Valider surtout la pression réelle du triple et les possibilités de camper avant toute retouche.
- Les fenêtres DPS sont prouvées par des tirs et pertes de PV réels, mais leur confort au pouce reste à tester sur téléphone.
- Les ultimes n’empêchent pas une élimination rapide : une mort annule la séquence, même commencée. Pas de mécanique d’invulnérabilité ajoutée.
- Les masters restent statiques. Les impacts à distance sont expliqués par les marques au sol ; les mouvements expressifs du pilon et des soupapes seront à produire seulement après validation de ces timings.
- La sécurité temporelle est discrétisée et ne certifie pas une esquive après toute erreur de placement ou tout contact physique.

## Fichiers et arrêt

Six fichiers existants intégrés : `src/bosses.js`, `src/forge/combat.js`, `src/forge/geometry.js`, `src/forge/art.js`, `src/room-scene.js`, `src/enemies/view.js`. Nouveaux modules : `src/forge/boss-patterns.js`, `boss-safety.js`, `boss-director.js`, `dungeon-boss.js`, `boss-view.js`. Trois copies SVG exactes dans `src/assets/boss-v037b/`. Tests et outils de contrôle dans `tests/v037b-*` et `v037b-validation/`.

Voir [V037C-ANIMATION-REQUIREMENTS.md](V037C-ANIMATION-REQUIREMENTS.md). **V0.37C non commencée : uniquement ses besoins documentés. Arrêt après livraison V0.37B.**
