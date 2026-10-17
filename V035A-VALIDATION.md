# V0.35A — Validation visuelle

13 octobre 2026. **18 concepts maîtres statiques proposés à la validation humaine.** Aucun n’est approuvé automatiquement pour animation.

[Galerie](v035a-visual-enemies-bosses/gallery.html) · [Inventaire](V035A-ASSET-INVENTORY.md) · [Direction et fiches](V035A-ART-DIRECTION.md)

## Livrables et statut

18 nouveaux masters SVG 512×512, leurs concepts identiques, 18 silhouettes monochromes et 18 exports des assets procéduraux actuels. La galerie offre les avant/après, les réductions à taille jeu, la superposition de collision, les fiches de design et les futures pièces animables. Les 3 ennemis réutilisés en Zone 4 sont documentés avec leurs masters existants conservés.

| Zone | Ennemis proposés | Boss proposés |
|---|---|---|
| 4 | Rampant de Grisou, Cracheur, Éclateur | Fendeur, Souffleur, Cœur de Grisou |
| 5 | Lampiste, Boutefeu, Gueule-Noire | Lampiste-Major, Dynamiteur, Masse Noire |
| 6 | Chauffeur, Riveteur, Scorificateur | Maître de Four, Marteau-Pilon, Chaudière |

**Prêts pour revue humaine : 18/18. Approuvés humainement dans cette étape : 0/18. Prêts pour animation : NON pour les 18.** Aucun redessin n’est imposé par un échec technique ; les réserves artistiques suivantes restent à trancher avant toute production.

## Revue visuelle et réserves

- Crachefer/Cracheur : masse ventrue horizontale contre bouteille haute et col coudé. La différence de contour est nette dans la planche. Le Cracheur pose réellement une zone de gaz : sa buse est un élément de langage visuel, pas une promesse de projectile volant.
- Compresseur/Souffleur/Chaudière : bonbonnes, cassette à soufflets et cuve étagée. Valider particulièrement Souffleur/Chaudière en silhouette à 320 px : leurs conduites et appuis appartiennent à une même famille industrielle.
- Rampant/Gueule-Noire : six appuis bas contre jambes repliées et masque frontal. À 320 px, les petites extrémités s’amenuisent ; la Gueule-Noire doit être revue sur téléphone physique à luminosité faible avant animation. L’optique et la plaque d’épaule restent les repères visibles dans l’extinction simulée.
- Cœur de Grisou : le noyau minéral et les étriers lisent bien en couleur ; son contour compact seul est moins caractéristique. Faire valider sa présence de boss iconique et sa distinction avec les autres masses compactes.
- Hiérarchie des 18 boss : les nouveaux mécanismes sont distincts, notamment le portique du Marteau-Pilon. Leur gabarit runtime est conservé : l’impression de progression dépend de la structure et de la matière, pas d’un agrandissement. La force de cette progression reste un jugement humain.
- Zone 6 : chaleur localisée dans les corps ; la plaque dangereuse corail est une couche séparée de la composition. Aucun feu ni cercle de danger permanent n’appartient aux masters.

La revue a porté sur des compositions statiques dans Chromium, pas sur des runs avec ces nouveaux visuels. Elle ne prouve ni la lecture en mouvement ni celle d’un écran Android physique.

## Taille, orientation et collisions

Les 18 nouveaux types restent proposés dans leurs cadres actuels : mobs 48×48, boss 84×84, origine .5/.5, orientation fixe. À 320×568, leurs cadres occupent environ 34×34 et 60×60 pixels CSS ; à 390×844, environ 42×42 et 73×73. La composition 390 conserve les bandes verticales liées au ratio du monde 450×800.

Les appuis, tuyaux et outils peuvent dépasser le disque de collision sans posséder de collision autonome. Vigilance renforcée pour Rampant r14, Gueule-Noire r15, Lampiste/Riveteur r17 ; ne pas agrandir la hitbox pour suivre un accessoire. Les vides du Marteau-Pilon ou du Cœur ne sont pas des passages jouables. Le contrôle « Collisions » aide à juger cette convention.

Les bouches et outils sont dessinés dans une pose fixe de trois quarts. Une future étude de sous-pièces directionnelles pourra être nécessaire pour certains tirs, sans modifier le pivot gameplay ni l’origine des projectiles. Aucun pivot, flip ou comportement n’a été changé ici.

## Preuves techniques

- **884/884 tests réussis**, 0 échec, 0 ignoré, 50,51 s pour le passage final. [Journal complet](v035a-visual-enemies-bosses/tests-final.txt). Les 884 tests de référence réussissaient également avant création.
- Construction du lot réussie avec `node v035a-visual-enemies-bosses/build.mjs`. Le package actuel ne possède pas de script `build` : aucune compilation de production inventée ou ajoutée. Les fichiers du jeu sont inchangés.
- **102 SVG valides XML**, JavaScript embarqué de la galerie syntaxiquement valide. Les nouveaux masters sont statiques, sans animation, script, image distante, filtre ou dégradé.
- Galerie : filtres Zones 4/5/6, tailles 320/390, affichage des collisions, silhouettes, hiérarchie et arènes contrôlés. Le défaut de lecture du champ d’animation des références réutilisées a été corrigé dans la galerie uniquement, puis revérifié.
- Six cadres d’arène exacts contrôlés : 320×568 et 390×844 pour chaque zone. Aucun débordement horizontal ni image manquante ; aucune erreur/alerte console lors du contrôle final. [Mesures navigateur](v035a-visual-enemies-bosses/browser-validation.json).
- **3 791 fichiers protégés inchangés octet pour octet**, dont src, tests, assets de production, galerie V034B et anciens concepts V034A. Aucune addition dans src. [Résultat du contrôle](v035a-visual-enemies-bosses/scope-validation.json) et [empreintes avant travail](v035a-visual-enemies-bosses/before-hashes.json).

## Comparaisons et captures

- [Zone 4 avant/après](v035a-visual-enemies-bosses/captures/concepts-zone4.png), [Zone 5](v035a-visual-enemies-bosses/captures/concepts-zone5.png), [Zone 6](v035a-visual-enemies-bosses/captures/concepts-zone6.png).
- [Planches monochromes et comparaisons sensibles](v035a-visual-enemies-bosses/captures/silhouettes.png).
- [Tous les boss Zones 1–6, couleur et silhouette](v035a-visual-enemies-bosses/captures/bosses-zones1-6.png).
- Zone 4 : [320×568](v035a-visual-enemies-bosses/captures/mobile-4-320.png) / [390×844](v035a-visual-enemies-bosses/captures/mobile-4-390.png).
- Zone 5, extinction : [320×568](v035a-visual-enemies-bosses/captures/mobile-5-320.png) / [390×844](v035a-visual-enemies-bosses/captures/mobile-5-390.png).
- Zone 6, surchauffe : [320×568](v035a-visual-enemies-bosses/captures/mobile-6-320.png) / [390×844](v035a-visual-enemies-bosses/captures/mobile-6-390.png).

## Recommandations pour une étape ultérieure, non commencée

Faire approuver les masters et les réserves ci-dessus avant réduction de production. Conserver ensuite les cadres, la lisibilité des grandes masses et les invariants documentés dans chaque fiche. Les futures animations doivent représenter les états du code sans déclencher les attaques : notamment pose immédiate du Boutefeu, fragmentation après mort de l’Éclateur et double émission du Cœur.

Ce lot reste entièrement hors production. Aucun asset de production remplacé ou supprimé, aucun changement de gameplay, sauvegarde, réseau du jeu ou Zones 1–3. CGWeb et backend distant non touchés. Aucune sprite sheet, aucune intégration, aucun commit/push. **Arrêt à V0.35A ; V0.35B non commencée.**
