# V0.34A — Validation des concepts maîtres

13 octobre 2026. **Phase de design terminée et livrée pour validation humaine.** Aucun passage à l'animation ou à V0.34B. La version du jeu reste 0.33.0 : V0.34A désigne ce dossier de travail séparé.

## Livrables

- [Galerie interactive locale](v034a-visual-enemies-bosses/gallery.html) : vue d'ensemble, trois zones, tous les mobs, tous les boss, silhouettes, tailles de jeu, orientations et fausses arènes.
- [Inventaire exact](V034A-ASSET-INVENTORY.md) : 17 entités, sources, dimensions, pivots, rayons et statut d'animation.
- [Direction artistique et fiches de conception](V034A-ART-DIRECTION.md) : palettes, matières, posture, masse, lumière, pièces mobiles/stables et futurs états pour chaque entité.
- [Index des captures](v034a-visual-enemies-bosses/CAPTURES.md).

La galerie peut être ouverte directement depuis le disque : données et script sont inclus, les images sont locales. Pour une revue HTTP, depuis la racine du projet : `node v034a-visual-enemies-bosses/server.mjs`, puis `http://127.0.0.1:5185/v034a-visual-enemies-bosses/gallery.html`. Ce serveur de revue est limité au loopback, séparé de celui du jeu, sans backend ni écriture de progression. Le processus de capture a été arrêté en fin de recette ; viewport rétabli et onglet temporaire fermé. Le serveur habituel du jeu n'a pas été touché.

## Liste exacte redesignée

| Famille d'origine | Ennemis | Boss |
|---|---|---|
| Zone 1 — Les Galeries | Rat de galerie, Mineur grisouteux, Foreuse autonome | La Haveuse, Le Crachefer, L'Effondreur |
| Zone 2 — Les Voies Abandonnées | Wagon Fou, Draisine | Le Chef de Gare, La Locomotive, L'Aiguilleur |
| Zone 3 — Le Puits 59 | Foreur de fond, Sondeur, Grisouteux | Le Cageur, Le Compresseur, Le Grisou |

Rat, Mineur et Foreuse sont également présents dans les Zones 2 et 3 : ils apparaissent dans ces galeries sans être comptés plusieurs fois. Le roster est comparé automatiquement aux trois entrées de ZONE_CONFIGS. Aucun ennemi inventé, aucune entité Zone 4–6 traitée, aucun changement Ravens.

## Concepts prêts pour revue

Les **17 masters sont proposés**, accompagnés de leur réduction, silhouette, comparaison et notes. SVG transparents de512², repère128², sans animation, filtre, image externe ou halo. Dessin vectoriel local cohérent avec le système V033 ; aucune image générée distante ni dépendance ajoutée.

La différenciation vient des formes : Rat bas à museau clair ; Mineur voûté ; Foreuse à cône court ; Haveuse en mâchoire de coupe ; Crachefer à trémie ; Effondreur en portique. Wagon à caisse et nez lumineux ; Draisine ajourée ; Chef à palette ; Locomotive à chaudière ; Aiguilleur à leviers asymétriques. Foreur à fourche arrière ; Sondeur en compas ; Grisouteux sous réservoir ; Cageur trapézoïdal ; Compresseur à bonbonnes inégales ; Grisou en cuve sous étriers.

La revue monochrome a conduit à renforcer les stabilisateurs séparés du Foreur. La différence avec la Foreuse est maintenant portée par deux encoches arrière visibles, sans changer son cadre60×48 ni son rayon20.

## Réserves et points à retravailler après avis humain

| Concept / ensemble | Observation | Condition avant animation |
|---|---|---|
| Effondreur | Le portique ouvert donne une silhouette forte, mais le vide central appartient toujours à la collision circulaire r28. Une lecture de passage libre serait trompeuse. | Confirmer la lecture avec le cercle affiché ; si elle gêne, ajouter un organe central sombre ou réduire l'ouverture, sans modifier la hitbox. |
| Rat | Museau et queue sont opposés aux huit caps testés ; son cadre mobile n'est que29,8×25,6px à320, avec une surface dessinée encore inférieure. | Vérification sur téléphone physique souhaitable pour le contraste de la queue ; ne pas agrandir le rayon ou inverser le miroir. |
| Crachefer / Locomotive | Mécaniques internes distinctes ; tous deux restent des masses horizontales à bouche avant. La trémie et la chaudière les distinguent mieux en couleur qu'en aplat seul. | Avis humain sur leur identification immédiate ; accentuer une encoche arrière si nécessaire avant de découper des pièces animées. |
| Machines et accessoires | Forets, roues, butoirs et leviers dépassent partiellement les cercles actuels ; ce sont des parties graphiques, pas des zones de dégâts supplémentaires. | Conserver cadres/pivots, contrôler les futures poses extrêmes avec les mêmes cercles. |
| Petits mobs | Les traits intérieurs deviennent secondaires, parfois inférieurs au pixel à320. | Ne pas ajouter de rivets ou de micro-lumières pour compenser ; privilégier masses et espaces négatifs. |

Tous les champs **prêt pour animation restent NON**, puisque la validation humaine est une étape obligatoire. « Prêt pour revue » ne signifie pas « validé par le joueur ». Aucun problème de chargement ne bloque la revue.

## Contrôle mobile et orientation

Captures Chromium aux viewports réels **320×568** et **390×844**. Échelle du monde450×800 : .710 et .8667. Chaque composition contient les mobs de sa zone, ses trois boss et le héros V033 inchangé. Les boss ont environ60–62px de cadre à320 contre30–47px pour les mobs. Le gros signal ambre et les petits projectiles corail restent au-dessus du décor et visuellement prioritaires.

Les trois compositions et les galeries mobiles ne débordent pas horizontalement. Toutes les images inspectées sont chargées. Les 17 fiches ont été capturées en entier. Les huit caps de rotation des machines et du Rat, les deux sens du Wagon et les miroirs des personnages sont présentés séparément ; les acteurs Z3 à face fixe ne reçoivent pas artificiellement une rotation.

[Mesures DOM et console](v034a-visual-enemies-bosses/browser-checks.json) : **aucune erreur ni avertissement console collecté sur le parcours final**. [Cercles superposés](v034a-visual-enemies-bosses/captures/collision-envelopes.jpg).

Ces arènes sont des compositions statiques de revue, pas une intégration Phaser ni une preuve de difficulté, de fréquence d'attaques ou de performance FPS. Les trois boss réunis servent à comparer les silhouettes. Pas de recette sur Android physique dans ce lot, ni test de reconnaissance chronométré. Les concepts n'ont aucun coût runtime ajouté au jeu actuel.

## Tests et absence de modification du jeu

**838 / 838 tests réussis**, zéro échec, zéro ignoré, environ44,9s. Tous les tests existants sont conservés. [Sortie complète finale](v034a-visual-enemies-bosses/tests-final.txt).

La première exécution a rencontré EACCES sur les connexions HTTP temporaires du bac à sable. Elle est conservée dans tests-initial.txt et n'est pas considérée comme verte. La relance autorisée a passé la suite entière sans changement des assertions. Le serveur de revue a nécessité la même autorisation locale ; aucune configuration réseau, CORS ou serveur du jeu n'a changé.

Il n'existe pas de script build dans package.json. L'assemblage de la galerie et des documents a été exécuté ; la syntaxe JavaScript de la galerie a été compilée par Node, les XML des17masters et les JSON ont été parsés, puis le rendu a été ouvert en navigateur. Le contrôle indépendant `node v034a-visual-enemies-bosses/verify.mjs` vérifie aussi le roster, les fichiers de concepts et le périmètre de production.

[Preuve SHA-256](v034a-visual-enemies-bosses/scope-validation.json) : **3 407 fichiers relevés avant création, tous identiques après** (src, tests et leurs snapshots, package.json/package-lock, index.html, server.mjs). Aucun fichier ajouté sous src. Aucun asset de production supprimé ou remplacé. Les sauvegardes et archives existantes sont conservées. Les nouveaux fichiers sont exclusivement les trois documents racine et le dossier de revue V034A.

Aucun changement de gameplay, statistiques, collisions, attaques, timings, difficulté, économie, progression ou sauvegarde. Aucun accès CGWeb/backend. Aucun commit ni push.

## Proposition de lot V0.34B — non commencé

Après validation humaine, un premier petit lot pourrait porter sur **Mineur et Foreuse**, pour valider humanoïde en miroir et machine en rotation dans un même pipeline. Conserver Rat/Wagon comme références directionnelles protégées ; résoudre d'abord les réserves Effondreur et Crachefer/Locomotive. Ensuite seulement planifier les boss et le Puits59. Cette proposition ne déclenche aucune production ni intégration.

**Arrêt à V0.34A.**
