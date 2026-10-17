# La Mine V2 — V0.17 : Caisse du Porion

Projet exclusif : C:\LaMineV2\la-mine-v2-v01. Aucun commit/push. Arrêt après V0.17, aucune V0.18.

La page CAISSES est fonctionnelle : un seul type de Caisse du Porion, compteur et badge de navigation, grosse caisse illustrée en CSS, bouton OUVRIR, révélation et échange de Jetons. Aucun compte, backend, achat réel, publicité, cosmétique, nouvelle ressource ou boucle de récompenses ajoutés.

## Sources et contenu

- Première victoire complète des vingt vagues d’un jour local : **+1 caisse**, une seule fois par jour.
- Chaque victoire complète : **10 %** de chance indépendante de recevoir **+1 caisse bonus**, cumulable avec la quotidienne.
- **3 Jetons Grisou → 1 caisse**, sans autre coût. Bouton désactivé sous trois Jetons.
- Aucune caisse sur défaite. Les ressources habituelles de run restent calculées exactement comme auparavant.

Catalogue et réglages centralisés dans src/crates.js : CRATE_RULES et CRATE_REWARDS. Table proposée conservée, total 100 % :

| Probabilité | Récompense |
| --- | --- |
| 35 % | +100 Charbon |
| 25 % | +200 Charbon |
| 15 % | +10 Fer |
| 10 % | +20 Fer |
| 8 % | +1 Diamant |
| 5 % | +2 Diamant |
| 2 % | +1 Jeton Grisou |

Un seul lot par caisse ; aucune caisse supplémentaire dans le pool, aucun objet inconnu. Les tirages des caisses n’affectent ni le hasard du combat ni celui des drops normaux. Les quantités restent entières.

## Ouverture et persistance

Animation nominale de **1,1 seconde**, bouton OUVRIR temporairement désactivé, couvercle incliné, halo et deux petites oscillations. Le bouton PASSER L’ANIMATION révèle immédiatement le gain ; avec réduction des animations système, la révélation est immédiate. Pas de chargement d’image supplémentaire, de particules ou de boucle de rendu JavaScript. Ravens commente les récompenses rares ; une phrase commune apparaît occasionnellement.

Le retrait d’une caisse et l’ajout de sa récompense sont enregistrés ensemble dans **une seule écriture locale avant l’animation**. Celle-ci révèle un résultat déjà acquis : navigation, animation passée ou rechargement ne recréditent pas le lot et ne font pas perdre le gain. Quitter la page annule son timer. Plusieurs ouvertures successives sont possibles, sans ouverture automatique de tout le stock.

L’échange déduit les trois Jetons et ajoute la caisse en une écriture également. Si l’enregistrement échoue, aucune ressource ni caisse n’est consommée. Lecture du profil avant chaque transaction pour éviter les achats/ouvertures sur un ancien solde dans des instances utilisées successivement. Si une ressource atteint sa limite de sécurité, ouverture refusée avant le tirage plutôt que de tronquer un lot ou permettre des relances gratuites.

Même clé de sauvegarde version 1 ; extension optionnelle crates : count et lastDaily (YYYY-MM-DD local). Les anciennes sauvegardes migrent sans perte de ressources, Atelier, Relève ou Talents. Compteur borné à 999999 ; dates invalides ignorées. Les gains de fin de run et les caisses sont enregistrés ensemble. Le comportement mémoire et l’avertissement de stockage indisponible des gains de run existants sont conservés ; ouvrir/échanger exige un enregistrement réussi.

La récompense quotidienne compare la date locale au dernier jour crédité ; reculer l’horloge ne redonne pas une ancienne quotidienne. Changer artificiellement l’horloge vers le futur reste possible dans ce prototype local sans backend. Après une date future créditée, la quotidienne attend un jour ultérieur à cette date ; aucune synchronisation externe n’est ajoutée.

## Périmètre conservé

Combat, armes, équilibre boss V0.15, vingt vagues, spawns, ennemis, perks, Talents V0.16, coûts/bonus Atelier, calculs Relève et drops sont inchangés. Les tests comparent ces fichiers au snapshot V0.16. Accueil : activation de CAISSES et son badge, sans refonte. Résultat : simple ligne d’attribution de caisse. Dans l’Atelier, seule l’ancienne indication « aucun usage » du Jeton est remplacée par une mention de l’échange sur la page Caisses ; toutes ses règles restent protégées.

## Validation

**303/303 tests réussis** : les 273 tests précédents sont conservés, avec 30 nouveaux tests. Vérifications de la somme et de chaque intervalle du pool, types de récompense, stock zéro, décompte/crédit, vingt ouvertures successives, échecs d’écriture, limites, instances successives, première/deuxième victoire, lendemain, retour d’horloge, défaite, échange, rechargement et coexistence Atelier/Relève/Talents.

Contrôles navigateur avec profil QA distinct :

- Première victoire simulée : une caisse ; seconde victoire le même jour : aucune quotidienne ; lendemain : une nouvelle ; défaite : aucune.
- **Six ouvertures** : lots Fer, Charbon, Diamant et Jeton vérifiés. Les cas rares ont été forcés uniquement via les boutons QA pour tester leur rendu, pas via une modification de la table normale.
- Révélation naturelle, animation passée et rechargement pendant l’ouverture testés. Après l’ouverture interrompue : caisse consommée et Jeton bien crédité, sans double gain.
- Deux échanges : 8 → 5 → 2 Jetons et 0 → 1 → 2 caisses ; troisième échange impossible.
- Une run complète réelle dans Phaser, sans Talent ni Atelier, Fusil graine 1 : **20 vagues, 235 éliminations, 347,23 s, 0,5 PV**, final **31,87 s**. Six choix, gains inchangés **94 Charbon / 8 Fer**, plus première caisse quotidienne visible sur le résultat. Même résultat de combat qu’en V0.16.
- Achat Puissance Atelier, déblocage Aimant Renforcé et récupération Relève, puis rechargement : états conservés ; la date quotidienne reste 2026-10-06 et une nouvelle victoire simulée ce jour n’ajoute rien.
- Formats **320 × 568** et **390 × 844** contrôlés : compteur, révélation, boutons, défilement de l’échange sur petit écran, aucun débordement horizontal. Aucun avertissement ou erreur console relevé sur les ouvertures, menus et run complète. La fluidité sur Android physique reste à confirmer manuellement.

Tous les crédits de test restent dans la clé QA la-mine-v2:qa-v017 sur l’origine 5178. Aucun achat ni gain de test dans le portefeuille normal.

## Impact économique estimé et réserves

Espérance par caisse : **85 Charbon, 3,5 Fer, 0,18 Diamant, 0,02 Jeton**. Ce sont des moyennes de lots exclusifs, pas le contenu simultané d’une caisse.

Une victoire après la quotidienne apporte en moyenne **8,5 Charbon et 0,35 Fer supplémentaires** via sa chance de 10 %, soit environ +9 % du Charbon garanti d’une run et +4,4 % du Fer garanti. Les runs restent la condition d’obtention principale et leur budget direct n’est pas modifié.

**La première victoire du jour est généreuse** : 1,1 caisse attendue, donc +93,5 Charbon / +3,85 Fer / +0,198 Diamant / +0,022 Jeton en moyenne. Cela ajoute presque autant de Charbon que les 94 garantis par la run et environ 48 % de son Fer garanti. Pour quelqu’un qui gagne une seule fois par jour, ce bonus pèsera fortement dans la progression : il ne faut pas le présenter comme négligeable. La table proposée est conservée pour le test de ressenti, sans retoucher l’économie principale. Un retour sur le rythme des achats Atelier/Talents et les Diamants sera utile.

L’échange consomme trois Jetons pour un retour moyen de 0,02 Jeton : pas de boucle rentable ni caisse qui en engendre une autre automatiquement. La réserve de Jetons existante peut néanmoins donner un bonus ponctuel. Le plaisir et l’envie de revenir ne se valident pas par les tests techniques ; ils demandent un essai joueur.

## Utilisation et preuves

- Lancer : npm.cmd start -- --host=0.0.0.0 ; prototype http://127.0.0.1:5177/.
- Tests : npm.cmd test.
- QA : node tests/browser-qa-server.mjs ; http://127.0.0.1:5178/. Les routes de tests sont interdites sur le serveur normal.
- Rapports : tests/v017-final-tests.txt, tests/v017-browser-report.json, tests/v017-economy-report.json.
- Captures : tests/v017-crate-320.jpg, tests/v017-crate-390.jpg.
- Sauvegardes : tests/v016-src-snapshot, tests/v016-readme-backup.md, tests/v016-style-backup.css, tests/v016-browser-qa-backup.js. Toutes les sauvegardes antérieures restent conservées.

Backend et correctif EADDRINUSE inchangés. Sa bannière historique peut encore mentionner V0.14 ; la version applicative est V0.17. Aucun commit/push, aucune V0.18.
