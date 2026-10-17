# La Masse Noire — master statique final à valider

## Référence et périmètre

Variante B uniquement, d’après « Planche de référence du boss Masse Noire.png ». La comparaison utilise le personnage du panneau de gauche, recadré sans retoucher ses pixels. La source complète est conservée dans `v036a-masse-noire-final/references/variante-B.png`.

Master unique : `v036a-masse-noire-final/master/masse-noire.svg`. Vue trois quarts face, appuis écartés, prise à deux mains et grand marteau rectangulaire à droite. Le cadre vectoriel suit le recadrage de référence ; ce n’est pas une nouvelle taille de production.

## Exécution et simplification

Le dessin est construit en tracés vectoriels, sans image incorporée dans le master. Grandes masses d’armure ocre, charbon, acier gris et harnais brun. Contours sombres réguliers et aplats francs ; les yeux et la lampe sont des formes pleines sans halo.

Les rivets, fissures du marteau, rayures, rainures et textures ont été retirés. Deux bandes larges suffisent à la lecture du marteau. Les doigts sont regroupés, les plaques d’armure restent entières et le bloc dorsal se limite à ses masses utiles. Aucun équipement supplémentaire.

Les deux yeux ont été dégagés sous le bord du casque pour préserver leur lecture. Les différences par rapport à l’image relèvent de cette simplification des contours et des surfaces ; aucune autre variante n’a été développée.

## Construction pour les futures animations

- **Stables** : torse, ceinture et harnais, tête/casque, bloc dorsal, proportions globales.
- **Mobiles plus tard** : bras avant et arrière, mains, jambes/appuis, tête et marteau. Les groupes SVG sont nommés.
- Le manche et la tête du marteau doivent rester un outil rigide ; les deux prises devront être contraintes au manche. Une animation ultérieure nécessitera de compléter les surfaces cachées derrière les mains : ce master statique n’est pas une sheet ni un rig achevé.

La Masse Noire se distingue du Dynamiteur par le marteau à deux mains, du Lampiste Major par l’absence de projecteur tenu et du Boutefeu par ses épaules et ses appuis massifs. Les copies des autres masters dans la galerie sont inchangées.

## Lisibilité et validation

Réductions couleur et silhouette vérifiées dans des cadres de **40 × 40, 56 × 56 et 84 × 84 pixels CSS**, en conservant les proportions. À 40 px, la reconnaissance repose sur le casque, les épaules, les appuis et le marteau ; boucles et doigts ne constituent plus des détails lisibles individuellement.

Contrôles navigateur aux formats **320 × 568** et **390 × 844**, sans test sur téléphone physique. Captures :

- `v036a-masse-noire-final/captures/planche-validation.jpg`
- `v036a-masse-noire-final/captures/mobile-320.jpg`
- `v036a-masse-noire-final/captures/mobile-390.jpg`

Galerie : `v036a-masse-noire-final/gallery.html`. Planche : `v036a-masse-noire-final/comparaisons/planche.html`. Silhouette : `v036a-masse-noire-final/silhouettes/masse-noire.svg`.

**995 / 995 tests existants réussis**, aucun test supprimé ou adapté. Journal : `v036a-masse-noire-final/tests.txt`. Contrôle SHA-256 des **5 403 fichiers préexistants** : aucun modifié ou supprimé, aucun ajout hors dossier de livraison et présente documentation. Rapports : `scope-validation.json` et `browser-validation.json` dans le dossier de livraison.

Aucun gameplay, timing, hitbox, asset de production ou autre master modifié. Aucune intégration, animation ou sprite sheet. Aucun commit/push. Serveur de revue séparé, lecture seule, sur `http://127.0.0.1:5200/v036a-masse-noire-final/gallery.html`.

**Arrêt pour validation humaine du master.**
