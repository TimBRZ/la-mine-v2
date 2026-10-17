# Scorificateur — V0.37A, master statique à valider

## Référence et périmètre

Référence humaine exclusive : **Variante 1 — version standard**, planche `Planche conceptuelle du Scorificateur industriel.png`. Vue trois quarts, deuxième personnage de la rangée principale. L'original est conservé sans modification dans `v037a-scorificateur-final/references/variante-1.png` ; la galerie en montre un recadrage CSS et la planche complète. Empreinte dans `source.json`.

Un seul master vectoriel, sans animation ni intégration. Aucun fichier de production, aucune hitbox, règle de combat, récompense ou sauvegarde n'est modifié. Les références Chauffeur, Riveteur et héros sont des copies de comparaison. Aucun commit/push.

## Rôle réellement présent dans le code

Lecture de `src/forge/config.js`, `src/forge/actors.js` et `src/forge/combat.js` : identifiant interne `scorifier`, mob standard de mêlée, 64 PV, rayon 19, vitesse de déplacement 113, dégâts de contact 0,5. Ces valeurs servent à comprendre le rôle ; elles restent inchangées.

Le pattern `scorch` est préparé lorsque le joueur se trouve à portée de déclenchement (230 unités). L'angle est calculé au début de la préparation puis verrouillé : **1,05 s de télégraphe**, ruée de **0,65 s** à **275 unités/s**, sans correction vers le joueur. Les bords de l'arène peuvent interrompre la course. Récupération de 0,7 s ; repositionnement autorisé après les premières 0,18 s.

La zone chaude est une ligne précalculée dans `forgeLane`, bornée par l'arène, sur la trajectoire prévue de 178,75 unités maximum. Elle est réservée pendant la préparation et devient active après le délai combiné de 1,70 s, pour **1,3 s**, puis 0,3 s de refroidissement. Il ne s'agit pas d'une traînée peinte progressivement par l'animation. Les plafonds et contrôles de zones sûres restent ceux du jeu (notamment deux Scorificateurs maximum en préparation/charge).

**La chaleur au sol est un hazard séparé.** Aucun halo, flamme, projectile, arc de balayage ou sillage ne fait partie du master. Le code n'ajoute pas d'attaque autonome de balayage ; une future animation ne devra pas en suggérer une hors du comportement existant.

## Construction et simplifications

Intention : « ouvrier de forge agressif équipé d'un outil de coupe chauffé à blanc ». Silhouette humaine compacte, genoux fléchis, casque rond industriel, visière horizontale, masque inférieur, combinaison rouge, gants et bottes sombres. Module dorsal thermique vertical et conduite principale unique.

Le long outil est tenu bas, incliné vers l'avant, avec deux prises distinctes. Son bord chaud est continu et contenu dans la forme, sans dents de tronçonneuse, pointe d'épée ou ouverture de canon. Trois ouvertures larges suffisent à exprimer le métal chauffé.

Suppression des vis, petites rainures, textures, rayures, coutures et plis secondaires. Un seul tuyau lisse ; masque ramené à deux volumes de filtration ; grandes plaques plutôt qu'un assemblage de petites pièces. Les valeurs claires sont réservées à la visière, au bord de coupe et à quelques faces acier. La simplification reste soumise à validation humaine de la fidélité à la référence.

## Palette

Neuf couleurs au total, contours compris :

| Couleur | Usage |
| --- | --- |
| `#101719` | Contours et séparations |
| `#393D3D` | Charbon, gants et protections |
| `#514E49` | Acier sombre |
| `#88796A` | Faces acier éclairées |
| `#BF4627` | Combinaison et outil rouge forge |
| `#E3652F` | Aplats orange |
| `#873A26` | Ombres rouille |
| `#F4AD32` | Chaleur orange/ocre |
| `#FFE092` | Cœur clair de la visière et bord chauffé |

Pas de gradient, filtre, image bitmap embarquée, halo ou texture. Cadre SVG 340 × 450 ; contours principaux de 8 unités, secondaires de 4 à 7. Le cadre est une convention de dessin, pas une nouvelle taille en jeu.

## Différenciation

| Entité | Tête / dos | Outil / posture |
| --- | --- | --- |
| Chauffeur | Capuche pointue, bonbonne | Diffuseur court, posture de projection |
| Riveteur | Casquette légère, petit bloc dorsal | Nez de rivetage court, silhouette fine |
| Scorificateur | Casque arrondi, module thermique à fente | Long bord chaud diagonal, genoux fléchis, appuis écartés |

Deux comparaisons directes couleur et monochrome, avec rappels à 48 px, sont fournies. La comparaison au héros utilise uniquement des cadres de présentation (héros 46 × 52, mobs 48 × 48) ; aucun gabarit runtime n'est changé. Le Scorificateur conserve une présence de mob standard.

## Parties et animation future — documentation uniquement

Les groupes SVG nommés séparent module dorsal, torse, casque, tête/masque, visière, conduite, bras, mains, jambes et outil. Ils constituent des repères de découpe, pas un rig ni une sprite sheet. Les raccords masqués devront être complétés lors d'une éventuelle production animée.

- **Masses stables :** torse, casque, masque et module dorsal. Préserver leurs proportions pendant le mouvement.
- **Parties mobiles futures :** jambes, bras/mains avec l'outil, tête légèrement, tuyau avec très faible inertie. Conserver les deux prises au même endroit sur l'outil.
- **Idle :** vibration thermique très faible, outil stable.
- **Move :** marche/course basse et agressive, sans gonflement de silhouette.
- **Prepare charge :** compression des appuis et petit recul de l'outil, dans le télégraphe existant.
- **Charge :** projection du corps, outil bas, cycle bref suivant l'angle verrouillé.
- **Recovery :** freinage et reprise d'appui. Une coupe visuelle ne peut accompagner que le contact déjà prévu ; aucune nouvelle fenêtre de dégâts.
- **Hit / death :** réaction brève puis chute simple ; outil lié aux mains jusqu'à sa libération visuelle.

Opportunités futures seulement : variation contenue de l'aplat chaud pendant la préparation, étincelle très courte au départ, friction/poussière au sol, petite inertie dorsale, impact thermique bref. Aucun de ces effets n'est créé ici. La zone de chaleur dangereuse reste un système séparé.

## Livrables

Tous les fichiers de validation sont dans `v037a-scorificateur-final/` :

- `master/scorificateur.svg` : master unique.
- `silhouettes/scorificateur.svg` : même géométrie en aplat ivoire.
- `gallery.html` : référence, master, tailles, comparaisons et construction.
- `mobile.html` : fiche compacte de contrôle.
- `comparaisons/reductions.svg` : couleur et silhouette en cadres 40 / 48 / 56 / 84 px.
- `comparaisons/chauffeur.html`, `riveteur.html`, `famille.html`.
- `captures/mobile-320.jpg`, `mobile-390.jpg`, comparaisons et galerie complète.
- `source.json`, `before-hashes.json`, `scope-validation.json`, `browser-validation.json`, `tests.txt` : preuves de contrôle.

Le serveur de validation dédié se lance depuis la racine avec `node v037a-scorificateur-final/server.mjs` ; galerie sur `http://127.0.0.1:5205/gallery.html`. Serveur statique local en lecture seule, sans cache. Il ne remplace pas le serveur du jeu.

## Vérifications et limites

**1 059 / 1 059 tests existants réussis**, zéro échec, zéro ignoré. Contrôle des empreintes de **3 907 fichiers existants** suivis (sources, tests, fichiers racine et dossiers des masters précédents) : aucune modification ni suppression.

Contrôle navigateur des fiches et de la galerie en **320 × 568** et **390 × 844**, des comparaisons et des images chargées ; tailles réelles CSS 40 / 48 / 56 / 84. Aucun débordement horizontal ou image cassée ; aucune erreur console constatée sur les pages finales. Les captures sont réalisées en viewport mobile du navigateur local, pas sur un téléphone physique.

À 40 px, la visière et la ligne chaude dominent volontairement ; les détails du masque et les fentes secondaires ne se lisent plus individuellement. La silhouette seule conserve le casque, le dos, les appuis et le long outil ; elle ne peut pas montrer une visière interne. Il reste à obtenir la validation humaine artistique et à confirmer ultérieurement la lecture dans une vraie scène de combat, lors d'une étape d'intégration autorisée.

Arrêt après ce master. Aucune sprite sheet, aucun boss de Zone 6 commencé, aucune intégration.
