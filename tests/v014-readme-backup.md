# La Mine V2 — V0.14 : pression et mouvement

Projet exclusif : `C:\LaMineV2\la-mine-v2-v01`. Aucun commit/push. Aucune V0.15.

La V0.14 renforce les rencontres dans les vingt vagues existantes. Le tir reste réservé à l’arrêt. Les armes, perks normaux et épiques, ressources, drops, économie, Atelier, Relève et sauvegarde sont inchangés. Accueil et zones sont conservés ; seul le badge de version passe à V0.14. Aucun lien avec CGWeb.

## Réglages

`src/difficulty.js` centralise les coefficients de pression, PV des boss, réduction de dégâts, cadences, intensification et paramètres du final. `src/world.js` conserve les effectifs, les points d’apparition et les vingt rencontres dans une seule arène.

| Vagues | Effectifs | Plafond simultané | Groupe maximum | Intervalle entre groupes |
| --- | --- | --- | --- | --- |
| 1–4 | 6 / 8 / 9 / 10 | 3 → 5 | 2 | 0,95 → 0,77 s |
| 6–9 | 10 / 12 / 13 / 14 | 6 → 8 | 4 | 0,70 → 0,52 s |
| 11–14 | 14 / 16 / 17 / 18 | 8 → 10 | 4 | 0,60 → 0,42 s |
| 16–19 | 18 / 20 / 22 / 22 | 10 → 12 | 5 | 0,50 → 0,32 s |

Les nouveaux groupes peuvent arriver avant la mort des précédents. Spawns à plus de 180 unités du joueur, télégraphe de 0,7 s, séparation minimale entre ennemis et entre Foreuses conservée. Aucune guérison entre vagues. Total inchangé : 235 éliminations.

- **Rats** : contournement léger à distance, alterné selon l’individu ; trajectoire directe à courte distance. Face au camping, contournement plus marqué et préférence pour un ancrage éloigné du dernier spawn. PV par palier : 10 / 11 / 12 / 13 ; vitesse et dégâts inchangés.
- **Mineurs** : PV 41 / 77 / 90 / 99. Ils occupent l’espace plus longtemps, sans hausse de vitesse ni de dégâts.
- **Foreuses** : PV 22 / 26 / 31 / 36 ; repos réduit progressivement, davantage face à un joueur immobile depuis 7 / 6 / 5,5 / 5 secondes selon le palier. Petite anticipation plafonnée à 40 unités. Visée verrouillée pendant les 0,9 s de télégraphe, projectile toujours à 145 unités/s, récupération inchangée.
- **Anti-camping** : agit uniquement sur les décisions ennemies. Aucun dégât déclenché par un compteur d’immobilité. Les zones de l’Effondreur ciblent la position annoncée du joueur ; bouger permet de les éviter.

## Boss

| Boss | PV individuels | Évolution |
| --- | --- | --- |
| Haveuse, vague 5 | 900 | poursuite 1,7 s, vitesse 60, récupération 0,7 s ; charge annoncée 0,9 s, vitesse et dégâts de charge conservés |
| Crachefer, vague 10 | 1320 | tirs plus réguliers, déplacement latéral alterné et léger ciblage anticipé ; annonce 1,1 s |
| Effondreur, vague 15 | 1560 | deux zones verrouillées de rayon 48, contenues dans l’arène ; annonce 1,35 s puis danger 1,4 s |

Réduction de dégâts reçus de **10 %**, sans invulnérabilité ajoutée. Sous 50 % des PV, les temps de repos/récupération raccourcissent de 20 % ; les avertissements et la durée des zones restent lisibles. Les dégâts infligés sont conservés.

Le final utilise **80 % des PV individuels** : 720 / 1056 / 1248. Les temps de repos sont allongés de 15 % par rapport aux rencontres individuelles, avec une base commune et un décalage initial de 0,65 s entre machines. Cela évite que leurs différentes cadences annulent le décalage. Introduction et trois barres de vie conservées. Le joueur peut orienter le ciblage automatique par son placement ; aucun nouveau sélecteur de cible.

## Validation technique

**220/220 tests réussis** : les 193 tests précédents sont conservés et adaptés aux changements autorisés, avec 27 tests V0.14. Vérifications des règles d’anti-camping, télégraphes, résistance des Mineurs, densité, fin de combat, intensification, final, tirs immobiles et invariants des systèmes protégés.

Les deux armes terminent une run complète dans les tests avec **Atelier 0**, sans soin, invulnérabilité de test ou modification des dégâts. Graines reproductibles : Fusil 3 et Mitraillette 20. Un autre build Mitraillette Perforantes/Chargeur/Surchauffe termine avec Atelier 5 (graine 3). Le stress à douze ennemis utilise une protection explicitement réservée à cette fixture afin de maintenir sa population ; ce test ne sert pas à prouver une victoire.

La série finale contient **106 simulations** : 80 runs complètes tentées, 8 boss isolés, 16 confrontations de camping contre mouvement sur les vagues 16–19, et 2 runs entièrement immobiles. Sur les 30 graines sans Atelier par arme : 1 victoire Fusil et 1 victoire Mitraillette. Sur les 10 graines avec Atelier 2 par arme : 3 et 6 victoires. Ces chiffres décrivent le pilote de test, pas le taux de réussite d’un humain. Les fixtures isolées commencent avec les PV de base et un nombre légal de perks ; elles ne remplacent pas les runs intégrales.

Sur les huit confrontations isolées des vagues 16–19, le pilotage mobile survit ; le même build immobile perd en **8 à 11 secondes**. Aucun tir en mouvement. Pics de la série : **12 ennemis, 6 projectiles hostiles, 8 drops**, dans des pools inchangés de 8 projectiles hostiles, 84 projectiles du joueur et 20 drops. Stress à douze ennemis pendant une minute : état fini et pools bornés.

### Vérification dans Phaser

Trois runs complètes gagnées dans le navigateur, avec les règles réelles : Fusil sans Atelier **393,08 s / 2 PV**, Mitraillette sans Atelier **498,07 s / 1 PV**, Mitraillette Atelier 2 **347,07 s / 1 PV**. Chacune parcourt vingt vagues, 235 éliminations, six choix et vingt collectes ; aucun tir en mouvement, arène conservée. Portefeuille normal vérifié avant/après rechargement : **114 Charbon / 53 Fer / 3 Diamants / 0 Jeton**, inchangé.

Formats **320 × 568** et **390 × 844** contrôlés : arène, indications de mouvement, perks, résultat, trois boss et leurs télégraphes. Console sans erreur ni avertissement. Coût CPU local moyen de mise à jour/préparation du rendu : **0,53 à 0,63 ms** par frame de QA, incluant quatre pas de simulation et le pilote. Cette mesure exclut le GPU et ne prouve pas les FPS ni la sensation sur Android physique ; ceux-ci restent à confirmer sur le téléphone.

### Durées observées et réserves d’équilibrage

Durées de combat, hors introduction et collecte, sur des runs complètes sélectionnées :

| Rencontre | Objectif | Fusil, Atelier 0, graine 3 | Mitraillette, Atelier 0, graine 20 | Mitraillette, Atelier 2, graine 2 |
| --- | --- | --- | --- | --- |
| Vague 5 | 20–30 s | 13,18 s | 47,28 s | 27,10 s |
| Vague 10 | 25–35 s | 22,15 s | 33,83 s | 26,25 s |
| Vague 15 | 30–40 s | 23,43 s | 41,58 s | 25,97 s |
| Vague 20 | 45–60 s | 22,08 s | 70,17 s | 52,33 s |

**Les objectifs de durée ne sont donc pas atteints pour tous les builds.** Le Fusil Détente ×2 / Chevrotine / Double Canon reste trop rapide sur les boss, particulièrement le final. La Mitraillette sans Atelier reste exigeante et ses rencontres peuvent être longues ; l’Atelier 2 rapproche nettement les durées des cibles, sans les garantir. Les perks et armes n’ont pas été affaiblis pour rapprocher artificiellement ces résultats. Les combats ne contiennent aucun timer minimum ni adaptation cachée des PV au build. Le prochain retour manuel doit particulièrement examiner cet écart entre armes.

Les récompenses restent à **94 Charbon et 8 Fer garantis**, mêmes tirages rares, mêmes coûts et même format de profil. Les gains des tests navigateur utilisent une origine et un profil QA isolés ; ils n’alimentent pas le portefeuille du prototype normal.

## Utilisation et preuves

- Lancer : `npm.cmd start -- --host=0.0.0.0`.
- Prototype local : http://127.0.0.1:5177/.
- Tests : `npm.cmd test`.
- Série mesurée : `node tests/v014-measure.mjs`.
- QA navigateur : `node tests/browser-qa-server.mjs`, port 5178 et profil `la-mine-v2:qa-v014`. Le serveur normal ne sert pas `/tests/`.

Rapports : `tests/v014-final-tests.txt`, `tests/v014-simulation-report.json` et `tests/v014-browser-report.json`. Captures `v014-victory-*.jpg` et `v014-triple-*.jpg`. Les aperçus de boss sont des fixtures visuelles, distinctes des runs complètes.

Les fichiers et captures des anciennes validations restent présents. L’ancien README est conservé dans `tests/v013-readme-backup.md`, ainsi que l’ancien pilote dans `tests/v013-run-helpers-backup.js`. Les empreintes protégées V0.14 garantissent que les armes, perks, drops, économie, Atelier, Relève, sauvegarde, textures et logique des menus n’ont pas changé.

Le correctif EADDRINUSE de `server.mjs` est conservé : un port volontairement occupé renvoie le message attendu, sans ReferenceError. Les nouveaux modules sont servis en HTTP 200 avec le MIME JavaScript correct depuis ce dossier.

Arrêt après cette V0.14. Aucune V0.15, aucun commit ni push.
