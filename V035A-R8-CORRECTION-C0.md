# Éclateur — correction du master R8 depuis l’image C0

Statut : **proposition corrigée, en attente de validation humaine**. Le R8 frontal précédent est rejeté et conservé pour historique. Il ne sert plus de base visuelle.

## Référence absolue

Source fournie : `C:/Users/Tim Pro/Downloads/Image ChatGPT 13 oct. 2026, 23_35_48.png`.

L’image est copiée sans modification dans [references/C0-reference.png](v035a-r8-correction-c0/references/C0-reference.png). Elle remplace la précédente interprétation « C0 = SVG C de R7 ». Le nouveau dessin est un tracé vectoriel manuel de la machine de cette image, pas un nettoyage de l’ancien SVG frontal.

## Livrables

- [Galerie](v035a-r8-correction-c0/gallery.html)
- [Master SVG transparent](v035a-r8-correction-c0/master/eclateur-c0.svg)
- [Silhouette monochrome](v035a-r8-correction-c0/silhouettes/eclateur-c0.svg)
- [Comparaison image / SVG](v035a-r8-correction-c0/comparaisons/reference-svg.html)
- [Capture comparative](v035a-r8-correction-c0/captures/reference-svg.jpg)
- Captures [320×568](v035a-r8-correction-c0/captures/mobile-320.jpg) et [390×844](v035a-r8-correction-c0/captures/mobile-390.jpg)

## Fidélité et simplifications

La vue latérale vers la droite est conservée : carter industriel ocre à gauche, chenille principale basse, poignée supérieure, gros vérin horizontal, tige métallique visible, liaison avant grise, coin ocre central entre les deux mors massifs. Les appuis inférieurs, la fenêtre Grisou verte, les volumes et le placement des ensembles suivent l’image.

Les contours ont été tracés dans le repère pixel de la source. Le cadrage commun est `128 280 910 530` ; les deux vues comparatives utilisent exactement ce cadrage, sans déformation ni changement de perspective. Le SVG de cadrage de référence embarque le PNG original pour permettre son affichage autonome. **Le master lui-même ne contient aucune image bitmap**, uniquement des formes SVG.

Simplifications limitées aux aplats d’ombre, à l’usure et aux micro-détails. Les chanfreins utiles sur les mors, la tige et le coin sont conservés. Aucun effet lumineux, texture générée, pièce supplémentaire ou changement de composition.

Les groupes SVG nommés séparent les ensembles pour une production future éventuelle. Aucun état animé, frame ou sprite sheet n’est créé.

## Lecture mobile

Les cadres de contrôle sont de **40×40, 48×48 et 56×56 pixels CSS**, avec le profil latéral contenu sans étirement. Ces nombres désignent le cadre, pas la hauteur occupée : le dessin est naturellement plus large que haut. Le cadre 48 px rappelle le gabarit actuel sans le changer dans le jeu.

À 40 px, la silhouette, la chenille, la tige horizontale et les deux grandes masses des mors portent la lecture. Les petites ouvertures et chanfreins deviennent secondaires. La galerie affiche aussi la silhouette sans couleur et les deux vues mobiles sur le fond Zone 4 existant.

Il s’agit de planches statiques contrôlées dans Chromium, pas d’une intégration en combat ni d’une validation sur téléphone physique.

## Vérification

**884/884 tests existants réussis**, zéro échec, zéro test ignoré, durée 46,44 s. [Journal complet](v035a-r8-correction-c0/tests.txt).

Pages finales vérifiées dans Chromium : aucune erreur ni alerte console, aucune image manquante. Les planches mobiles occupent exactement 320×568 et 390×844 sans débordement ; les cadres 40/48/56 px sont mesurés dans le DOM. Le master est un SVG transparent de 5 109 octets (56 formes, 14 aplats), sans bitmap ni filtre. Tous les SVG livrés sont valides en XML.

Les empreintes des **4 776 fichiers préexistants** sont contrôlées, y compris les concepts précédents et la production. La copie de la référence est identique octet par octet. [Rapport de périmètre](v035a-r8-correction-c0/scope-validation.json). [Validation navigateur](v035a-r8-correction-c0/browser-validation.json).

Seuls ce document et le dossier `v035a-r8-correction-c0/` sont ajoutés. Aucun gameplay, ciblage, comportement, hitbox, asset de production ou test existant modifié. Aucune intégration, aucune sprite sheet, aucun commit/push. **Arrêt pour validation humaine.**
