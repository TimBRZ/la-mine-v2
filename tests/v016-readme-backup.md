# La Mine V2 — V0.16 : Talents permanents

Projet exclusif : C:\LaMineV2\la-mine-v2-v01. Aucun commit/push. Arrêt après V0.16 ; aucune V0.17.

La page TALENTS est accessible depuis l’accueil et propose huit achats uniques. Chaque Talent débloqué s’applique automatiquement aux nouvelles runs, sans équipement, niveau supplémentaire ou respec. Coût, description et état verrouillé/actif sont visibles ; le bouton d’achat disparaît après déblocage. Le Jeton Grisou n’est jamais dépensé ici.

## Catalogue et règles

| Talent | Coût provisoire | Effet |
| --- | --- | --- |
| BON DÉPART | 300 Charbon | Un deuxième Choix du Porion au départ. |
| ŒIL DU PORION | 500 Charbon + 20 Fer | Une relance gratuite des cartes normales par run. |
| PREMIERS SECOURS | 400 Charbon + 15 Fer | Récupère 10 % des PV max après les boss 5, 10 et 15. |
| PROSPECTEUR | 350 Charbon + 10 Fer | 15 % de chance de +1 Fer par vague terminée. |
| AIMANT RENFORCÉ | 250 Charbon | Collecte à +30 % de distance ; aspiration +20 % rapide. |
| SANG-FROID | 500 Charbon + 20 Fer | Délai de stabilisation avant le tir réduit de 20 %. Cadence inchangée. |
| DERNIER SOUFFLE | 30 Fer + 1 Diamant | Survis à un coup fatal avec 1 PV, une fois par run. |
| MAIN HEUREUSE | 25 Fer + 1 Diamant | Les perks déjà acquis apparaissent un peu moins souvent. |

Catalogue, identifiants, coûts et coefficients : src/talents.js. Total des huit achats : **2300 Charbon, 120 Fer, 2 Diamants**.

- **Bon Départ** : deux vrais choix successifs avant le premier combat, sans perk aléatoire imposé. Le second écran est intitulé BON DÉPART / CHOIX BONUS. Sept choix au total au lieu de six.
- **Œil du Porion** : une relance normale par run, compteur disponible/utilisée. Le tirage évite le même ensemble de trois cartes lorsqu’une alternative respecte la diversité. Les choix épiques affichent déjà les trois seules cartes possibles : relance désactivée et non consommée sur cet écran. Le compteur se réinitialise à la prochaine run.
- **Premiers Secours** : soin une fois à la fin de la collecte des vagues 5, 10 et 15 ; jamais au final. 10 % des PV maximum actuels, plafonné aux PV max, compatible Atelier. Flash de soin bref.
- **Prospecteur** : tirage indépendant de celui des perks, des tirs et des drops normaux, une fois par vague entièrement terminée, finale incluse. +1 Fer ajouté aux gains de run, avec flash ; aucun drop physique supplémentaire, Diamant ou Jeton. Au maximum 20 Fer supplémentaires, espérance de 3 sur une run complète.
- **Aimant** : rayon 21 → 27,3 unités, vitesse d’aspiration ×1,2, budgets et quantités inchangés.
- **Sang-Froid** : stabilisation 60 → 48 ms ; le joueur doit toujours avoir totalement arrêté de bouger. Freinage, vitesse, cadence, dégâts, Focus et Surchauffe ne sont pas retouchés. Le bénéfice peut être imperceptible lorsque le freinage dure plus que ce délai : ce Talent ne permet pas de tirer en glissant.
- **Dernier Souffle** : première blessure létale ramenée à 1 PV ; indication de 1,1 s. Il conserve uniquement la protection ordinaire d’un coup reçu, sans durée ajoutée. Deuxième blessure létale : défaite normale.
- **Main Heureuse** : poids de tirage d’un perk déjà acquis renforcé de 1 + 2 × rang à 1 + 3 × rang, donc présence un peu réduite ; aucun nouveau perk garanti, plafonds inchangés. Les perks déjà au maximum sont toujours exclus comme auparavant.

## Architecture et sauvegarde

src/menu/talents-view.js affiche le catalogue ; Wallet réalise un unique enregistrement contenant le débit et le déblocage. Échec de sauvegarde : aucun débit ni Talent accordé, message d’échec et nouvelle tentative possible. Les doubles achats sont refusés, y compris depuis une instance de portefeuille plus ancienne.

Même clé locale et format version 1, avec extension optionnelle talents contenant uniquement les identifiants reconnus et dédupliqués. Une ancienne sauvegarde sans ce champ conserve exactement ressources, niveaux Atelier et horodatage Relève. Les Talents sont copiés à la création d’une run ; un achat ne modifie pas une run déjà créée. État temporaire (relance, sauvetage et vagues déjà récompensées) séparé de l’état sauvegardé.

Les effets de run sont regroupés dans RunTalents. Les intégrations concernent les points de création, fin de vague, blessure, tirage et collecte. Aucune modification des vingt rencontres, boss/ennemis, anti-camping, coefficients V0.15 des armes, coûts Atelier, calculs Relève, ressources, perks épiques, DA existante ou backend. Nouvelle page cohérente avec les composants existants. Caisses reste verrouillé.

## Validation technique

**273/273 tests réussis** : les 240 tests précédents sont conservés, leurs empreintes adaptées uniquement aux fichiers d’intégration autorisés, et 33 tests Talents sont ajoutés. Couverture des huit achats/débits/rechargements, migration, erreur de stockage, achat concurrent séquentiel, coexistence Atelier/Relève/gains de run, tous les effets, plafonds, relance, choix épique, probabilités et deux runs complètes avec huit Talents.

Une run complète **sans Talent reproduit exactement V0.15** : résultat, durée, PV, perks, récompenses et éliminations. Les tests V0.15 de dégâts/Focus, des seize vagues normales et des boss restent verts. Les modules de combat protégés sont aussi comparés au snapshot V0.15.

Validation navigateur sur profil QA isolé : achat Bon Départ, Œil du Porion et Premiers Secours, débit exact de 1200 Charbon + 35 Fer, rechargement avec trois cartes ACTIF et aucun bouton de rachat. Les 7 Jetons du profil QA restent intacts. Achat Puissance Atelier et récupération de la Relève conservent ces Talents. Choix bonus et relance unique testés par les vrais boutons.

Formats **320 × 568** et **390 × 844** vérifiés : liste défilante de huit cartes, coûts lisibles, navigation fixe, absence de débordement horizontal ; choix bonus et bouton de relance utilisables à 320 pixels. Une erreur de rendu des coûts partiels détectée pendant le développement a été corrigée avant les validations finales.

## Mesures et réserves

Série de **36 runs simulées** : deux armes, Atelier 0/2/5, graines 1/5/7, zéro ou huit Talents, mêmes priorités de sélection, pilote de déplacement inchangé. Bon Départ/Main Heureuse changent les choix et les consommations de hasard : ce sont des comparaisons de progression complète, pas une mesure de DPS à perks identiques. Le pilote n’utilise pas la relance dans cette série ; son effet est testé séparément.

Sans Talents : 10 victoires / 18. Avec huit Talents : 13 / 18, quatre défaites et une run non terminée à 900 s (Fusil, graine 1, Atelier 0 : le pilote tourne sans réussir à s’arrêter et finir les rats). Aucun changement de stats, soin de test ou invulnérabilité artificielle pour les runs gagnées. Ces résultats ne sont pas un taux de victoire humain.

Sur les sept paires où les deux runs gagnent, variation de durée totale **−12,9 % à +11,0 %**, généralement une réduction de 4,6–8,7 %. Exemple Mitraillette Atelier 2, graine 5 : **314,43 → 287,00 s**, final **39,48 → 39,45 s**. Fusil Atelier 5, graine 5 : **325,05 → 299,60 s**, final **24,18 → 21,80 s**. L’Atelier avancé et les perks forts peuvent donc encore produire un final rapide ; le combat n’a pas été durci pour compenser.

Runs navigateur de validation : Fusil sans Talent graine 1, **347,23 s**, final **31,87 s**, 0,5 PV ; Fusil huit Talents graine 7, **397,37 s**, final **33,15 s**, 0,5 PV. Les graines/builds différents ne prouvent pas que les Talents ralentissent le jeu. La Mitraillette huit Talents, graine 7, termine en **437,63 s**, final **56,22 s**, 1 PV. Les trois runs traversent vingt vagues et 235 éliminations ; six choix sans Talent, sept avec Bon Départ.

Aucune erreur/avertissement console lors des contrôles finaux de menus et des runs. Coût CPU moyen local : **0,658–0,850 ms** par frame QA comprenant quatre pas de simulation et le pilote, hors GPU ; ce n’est pas une mesure des FPS Android.

**Réserves :** Bon Départ est le Talent le plus transformant, puisqu’il ajoute un vrai perk. Prospecteur ajoute en moyenne 3 Fer aux 8 garantis, soit +37,5 % de Fer sur une run complète ; son gain absolu reste petit mais mérite un retour économique. Sang-Froid est volontairement discret et parfois masqué par le freinage. Le triple boss reste battable, avec pertes possibles et faible marge de PV sur les runs sans Atelier. Le ressenti mobile physique et l’envie de progression demandent encore un retour joueur.

## Lancement et preuves

- Prototype : npm.cmd start -- --host=0.0.0.0 ; http://127.0.0.1:5177/.
- Tests : npm.cmd test.
- Mesures reproductibles : node tests/v016-measure.mjs.
- QA locale : node tests/browser-qa-server.mjs, port 5178, clé distincte la-mine-v2:qa-v016. Les crédits/grants des boutons QA n’affectent jamais le profil normal.
- Rapports : tests/v016-final-tests.txt, tests/v016-run-comparison.json, tests/v016-browser-report.json.
- Captures : tests/v016-talents-320.jpg et tests/v016-talents-390.jpg.
- Sauvegardes V0.15 : tests/v015-src-snapshot, tests/v015-readme-backup.md, tests/v015-style-backup.css et tests/v015-browser-qa-backup.js. Les sauvegardes antérieures restent conservées.

Backend inchangé, correctif EADDRINUSE conservé. Sa bannière historique peut encore mentionner V0.14 ; package et écrans applicatifs indiquent V0.16. Aucun commit/push, aucune V0.17.
