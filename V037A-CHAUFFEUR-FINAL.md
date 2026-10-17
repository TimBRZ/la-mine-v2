# La Mine V2 — V0.37A — Chauffeur, master statique

## Proposition pour validation humaine

**Variante 3 simplifiée uniquement**, vue trois quarts correspondant au deuxième personnage de la rangée principale de l'image fournie. Le master reprend la capuche, les deux lentilles orange, le respirateur, la combinaison de forge, la bonbonne et le diffuseur court tenu à deux mains. Il s'agit d'un mob standard, pas d'un boss.

- [Galerie de validation](v037a-chauffeur-final/gallery.html)
- [Master SVG](v037a-chauffeur-final/master/chauffeur.svg)
- [Silhouette SVG](v037a-chauffeur-final/silhouettes/chauffeur.svg)
- [Réductions couleur et silhouette](v037a-chauffeur-final/comparaisons/reductions.svg)
- [Comparaison héros / Lampiste / Boutefeu](v037a-chauffeur-final/comparaisons/famille.html)
- [Capture 320 × 568](v037a-chauffeur-final/captures/mobile-320.jpg) et [390 × 844](v037a-chauffeur-final/captures/mobile-390.jpg)

Serveur de revue uniquement : `node v037a-chauffeur-final/server.mjs`, puis http://127.0.0.1:5203/gallery.html. Écoute en boucle locale, sans modification du serveur du jeu.

## Référence et fidélité

Image : `C:/Users/Tim Pro/Downloads/Fiche concept du Chauffeur des Forges oubliées.png`. Copie originale intacte dans `v037a-chauffeur-final/references/variante-3.png`, empreinte dans `source.json`. Le recadrage de la vue trois quarts est réalisé uniquement par le CSS de la galerie ; l'image entière reste disponible en bas de page.

Le master est un dessin vectoriel autonome, sans image incorporée. Vue 3/4, outil vers la droite et légèrement vers le bas, posture stable, capuche haute, réservoir derrière l'épaule gauche du dessin. Pas d'ajout d'arme, de charge explosive ou de second réservoir. Aucun jet, flamme ou halo intégré. Une seule pose ; aucune frame d'animation créée.

## Gameplay réel inspecté, inchangé

Sources : `src/forge/config.js`, `src/forge/actors.js`, `src/forge/combat.js`, `src/forge/art.js`.

- Identifiant technique **stoker**, nom visible **Chauffeur** : 80 PV, rayon de collision 18, vitesse 84, dégâts de contact 0,5.
- Son pattern est **heat**, pas un lance-flammes. Il réserve une plaque disponible du réseau existant, choisie au plus près du joueur. Les plaques font 76 × 88 unités de scène.
- Avertissement de **1,2 s**, zone active pendant **2,3 s**, puis refroidissement visuel de **0,3 s**. Dégâts au contact de la zone : **0,5**, soumis au système existant.
- Après la préparation, `release()` ne crée aucun projectile pour ce pattern ; l'acteur entre dans sa récupération de **1 s**. Il reprend son repositionnement après 0,18 s de récupération, puis une attente de positionnement de 0,5 s.
- En déplacement, il cherche une distance d'environ **175–255 unités**, avec un mouvement latéral. Il n'est donc pas traité graphiquement comme un spécialiste de mêlée malgré cette mention sur la planche de référence.
- Les plafonds existants restent 3 zones de chaleur et 5 zones au sol ; la validation du chemin d'évasion reste intacte. Si aucune plaque ne peut être ajoutée, l'attaque attend selon la logique actuelle.

Ces chiffres sont documentaires : aucun fichier de simulation ni de rendu production n'est modifié. L'outil explique la diffusion de chaleur ; une animation future devra accompagner la plaque ciblée, sans inventer de nouveau jet continu.

## Nettoyage réalisé

- Grandes masses de la tenue conservées ; plis réduits à quelques aplats.
- Une seule bonbonne, une vanne elliptique et une conduite principale.
- Quatre perforations larges sur la buse ; aucune succession de minuscules trous.
- Masque réduit à une bouche filtrante ronde et deux séparations larges. Lentilles chaudes contenues dans leurs cerclages.
- Suppression des rayures, vis, reliefs peints, multiples sangles et rainures décoratives.
- Deux mains distinguées au contact de l'outil. Les contours restent épais et réguliers, avec des traits secondaires plus fins uniquement à l'intérieur.

Le pictogramme de chaleur sur la bonbonne est un repère secondaire. À 40 px, la silhouette du réservoir et la buse portent la fonction ; on ne dépend pas de la lecture de ce pictogramme.

## Palette

| Usage | Couleur |
|---|---|
| Contour / ouvertures | `#101719` |
| Charbon principal | `#393D3D` |
| Acier sombre | `#514E49` |
| Acier clair | `#88796A` |
| Rouge forge | `#BF4627` |
| Aplat orange | `#E3652F` |
| Ombre rouille | `#873A26` |
| Chaleur / ocre | `#F4AD32` |
| Centre des lentilles | `#FFE092` |

Neuf aplats au total, organisés autour de quatre familles : charbon, acier, forge, chaleur. Aucun dégradé, filtre, texture ou glow. Silhouette pleine `#F3EBD8`, avec les mêmes contours et espaces négatifs.

## Découpe et animation future

Le SVG possède des groupes nommés. Le cadre est **340 × 450**, transparent ; ces dimensions sont celles du dessin de travail, pas une nouvelle taille du mob en jeu.

**Masses stables :** torse, capuche, masque et réservoir principal. Garder leurs proportions et leur pose relative. La tête pourra respirer avec le corps sans déformer les lentilles.

**Parties mobiles futures :** jambes proche/lointaine, bras proche/lointain, mains, outil thermique, vanne et conduite. Les mains doivent accompagner le diffuseur, avec des pivots de prise à définir lors de la phase animation. La conduite peut suivre avec une très faible inertie. Le master n'est pas encore un rig d'animation finalisé.

Recommandations, sans animation produite :

- Idle : respiration discrète et vibration thermique très faible.
- Move : marche compacte, outil stable à deux mains.
- Prepare : appuis stabilisés, pression suggérée par la vanne, outil orienté vers la plaque choisie par le gameplay.
- Attack : impulsion courte et léger recul, sans créer de projectile supplémentaire.
- Recovery : relâchement de pression, synchronisé sur la récupération existante.
- Hit / death : réaction courte puis panne/chute, sans explosion ajoutée.

Idées de VFX séparés pour plus tard : faible lueur contenue dans la buse, soupape réactive, vapeur brève, distorsion thermique légère. La surchauffe du sol doit rester pilotée par les hazards existants. Aucun de ces effets n'est produit ici et aucun ne devra masquer les télégraphes.

## Différenciation et gabarit

- **Lampiste :** absence de casque-projecteur et de grande lampe ; la capuche et le masque remplacent la lecture d'éclairage.
- **Boutefeu / Dynamiteur :** une bonbonne cylindrique alimentant un diffuseur, sans faisceau de dynamite ni détonateur.
- **Riveteur futur :** buse courte, large et perforée ; aucun viseur, crosse ou équipement de précision.
- **Scorificateur futur :** identité de contrôle thermique de zone, sans outil de mêlée ni posture de ruée.

La comparaison utilise le héros V0.33 dans un cadre 46 × 52 px et les mobs dans des cadres 48 × 48 px. Ce sont des tailles de présentation : le master n'est ni importé dans le jeu ni affecté au sprite stoker. Le rapport « 1,3× héros » imprimé sur l'illustration n'a pas été utilisé pour agrandir un mob standard.

## Validation

- **1 059 / 1 059 tests existants réussis**, 0 échec, 0 ignoré. [Sortie complète](v037a-chauffeur-final/tests.txt).
- Lecture contrôlée aux cadres **40 / 48 / 56 / 84 px**, couleur et silhouette. Les signes prioritaires restent capuche, lentilles, bonbonne et buse.
- Contrôles navigateur **320 × 568** et **390 × 844** : aucune image cassée ni débordement horizontal ; captures dédiées de la fiche mobile.
- Galerie statique et comparaison de gabarits contrôlées. Résultats navigateur et console dans `browser-validation.json`.
- Empreintes des fichiers source/tests et des dossiers de masters précédents comparées à l'état initial : [rapport de périmètre](v037a-chauffeur-final/scope-validation.json). Aucun fichier contrôlé modifié ou supprimé.
- Le test physique Android et la validation artistique restent humains ; il ne s'agit pas d'un test d'intégration ou de combat, puisqu'aucune intégration n'a été faite.

## Arrêt

Livraison limitée au dossier `v037a-chauffeur-final/` et à ce document. Aucun asset production remplacé, aucun gameplay/hitbox modifié, aucune animation ni sprite sheet, aucun commit/push. Aucune intervention CGWeb. Riveteur et Scorificateur non commencés. **Arrêt pour validation humaine.**
