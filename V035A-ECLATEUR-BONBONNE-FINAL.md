# Éclateur — bonbonne de Grisou, master statique

**Statut : proposé pour validation humaine. Aucune intégration, aucune animation.**

## Référence officielle et intention

L’image humaine « Planche conceptuelle — Bonbonne de Grisou.png », variante A nettoyée, remplace la machine hydraulique comme référence de cette proposition. L’original est conservé octet par octet dans `v035a-eclateur-bonbonne-final/references/variante-A.png`. Le tracé reprend la machine de gauche, identifiée « Variante A », sans changement d’orientation.

Lecture recherchée : **une bonbonne de Grisou instable et mobile, prête à éclater**. La grande cuve verticale reste dominante ; les roues sont petites et secondaires. Le manomètre à gauche, le voyant supérieur et le tuyau à droite donnent une silhouette asymétrique propre à un dispositif industriel sous pression.

Le master est un vrai SVG transparent : formes vectorielles, aplats, contours, sans image embarquée, police externe, filtre, dégradé ou animation. L’image PNG est embarquée uniquement dans le cadrage de référence, jamais dans le master.

## Proportions, palette et nettoyage

Référence et master utilisent le même cadrage `180 155 410 470`. L’enveloppe est verticale, avec la cuve au centre, le cadran haut-gauche, le tuyau sur la droite et les trois roues visibles en bas. Même angle légèrement oblique et même disposition générale. La cuve occupe environ les deux tiers de la hauteur de la machine ; les roues environ un cinquième.

Palette : charbon `#0C1619`, acier sombre `#29373C`, acier moyen `#596568`, acier clair `#AAB8B5`, ocre `#D89D2D`, jaune chantier `#F3BD41`, éclairage plat `#FFE092`, rouille `#65554A`, repère de pression orange `#C67538`, cadran ivoire `#F0ECDF`, turquoise `#40D7B1` et son accent clair `#A1F4D5`. Ces couleurs se regroupent en quatre familles : métal, chantier, rouille et petits témoins de Grisou.

Simplifications : suppression des rayures, taches et reflets fins ; cerclages nets ; boulons secondaires supprimés ; graduations réduites ; tuyau à larges segments. Conservation des bandes chantier, du pictogramme de danger et de l’inscription GRISOU tracée en vecteurs. Aucun nouvel outil, aucune aura, aucun cristal, aucun équipement militaire.

À 40 px, l’inscription et les graduations ne sont plus des informations fiables. Les repères prioritaires restent la bonbonne ocre, le disque clair du manomètre, le voyant turquoise et la base roulante. La silhouette monochrome conserve le cadran saillant, le témoin supérieur et le jour entre la conduite et la cuve.

## Comportement existant, inchangé

Sources lues : `src/rift/config.js`, `src/rift/actors.js`, `src/rift/combat.js`, `src/rift/waves.js`, `src/rift-sprite-catalog.js`.

- Identifiant `burster`, mob standard : 68 PV, rayon de collision 19, vitesse de base 48, contact 0,5.
- Approche du joueur, avec vitesse multipliée par 1,9 à moins de 170 unités. Préparation possible à 95 unités ou lorsque les PV sont suffisamment bas, selon les conditions existantes.
- Pattern `blast` : télégraphe de 1,25 s, zone d’explosion de rayon 58 active pendant 0,5 s, dégâts 0,5. Le repère de danger existant reste la source de lecture du rayon.
- À la mort : avertissement distinct de 1,1 s avant six projectiles radiaux, soumis aux plafonds existants ; vitesse 95 et portée 230.
- Cadre visuel actuel 48×48, orientation fixe. La nouvelle proposition est évaluée dans ce même cadre, sans modifier le rayon de collision ni le système de rendu.

Ce document décrit le code présent ; aucune de ces valeurs ni la composition des vagues n’a été changée.

## Construction pour une future animation

| Parties stables | Parties mobiles futures |
| --- | --- |
| Cuve, cerclages, structure de maintien | Vibration contenue de la cuve |
| Base et supports des roues | Roues, sans élargir l’enveloppe |
| Corps du manomètre et graduations | Aiguille autour de `(302, 237)` |
| Socle du voyant, boîtier de niveau | Courte variation du témoin turquoise |
| Conduite supérieure | Légère flexion du tuyau latéral, si utile |

Les groupes SVG sont nommés pour faciliter un découpage futur. Une éventuelle montée de l’aiguille et une vibration devront suivre le télégraphe existant, sans changer sa durée. Pas de pulsation permanente ni de halo. La réaction hit et l’extinction à la mort pourront être simples, avec un seul état d’affaissement. Ces recommandations ne créent aucune frame, sprite sheet ou attaque.

## Différenciation

L’ancien Éclateur est horizontal, chenillé, avec un coin hydraulique entre deux mors. La bonbonne proposée est verticale, sans chenilles ni outil frontal. Le Rampant conserve sa tête de coupe ; le Cracheur conserve sa cuve inclinée et sa buse ; le héros reste une silhouette humaine. Leurs SVG validés sont copiés sans modification pour la comparaison. Le nouveau master reste un mob compact, sans augmentation de taille vers un gabarit de boss.

## Livrables

- [Master SVG](v035a-eclateur-bonbonne-final/master/eclateur-bonbonne.svg).
- [Silhouette monochrome](v035a-eclateur-bonbonne-final/silhouettes/eclateur-bonbonne.svg).
- [Galerie de validation](v035a-eclateur-bonbonne-final/gallery.html).
- [Référence / master / réductions](v035a-eclateur-bonbonne-final/comparaisons/reference-master.html) et [capture](v035a-eclateur-bonbonne-final/captures/reference-master.jpg).
- [Comparaison de famille](v035a-eclateur-bonbonne-final/comparaisons/famille.html) et [capture](v035a-eclateur-bonbonne-final/captures/famille.jpg).
- Captures mobiles [320×568](v035a-eclateur-bonbonne-final/captures/mobile-320.jpg) et [390×844](v035a-eclateur-bonbonne-final/captures/mobile-390.jpg).

Contrôles en cadres 40, 48, 56 et 84 px CSS. 84 px est un agrandissement de contrôle, pas une proposition de taille en jeu. Les planches mobiles comparent les mobs dans le cadre monde de 48 px projeté sur une largeur de jeu de 450 : environ 34,1 px à 320 et 41,6 px à 390. Le héros utilise son cadre distinct de 46×52. Ce sont des comparaisons statiques en navigateur, pas une intégration ni une validation sur téléphone Android physique.

## Validation et arrêt

**985/985 tests existants réussis**, aucun échec, aucun test ignoré ; 52,92 s. Journal : `v035a-eclateur-bonbonne-final/tests.txt`. Le premier lancement en bac à sable a rencontré un blocage HTTP local EACCES ; le résultat complet provient de la relance autorisée hors de ce bac à sable.

Les pages mobiles tiennent dans 320×568 et 390×844 sans débordement. Les SVG chargent correctement, sans erreur ni alerte console sur les pages finales. Le contrôle navigateur et la console sont consignés dans `browser-validation.json`. Les **5 221 fichiers préexistants sont inchangés**, vérifiés par SHA-256 dans `scope-validation.json`. Le master comporte 74 formes pour 7 366 octets ; XML SVG valide.

Seuls ce document et `v035a-eclateur-bonbonne-final/` sont créés. Aucun fichier de production remplacé, aucune sheet ou master antérieur modifié, aucun changement de gameplay, de sauvegarde ou de test existant. L’Éclateur hydraulique reste affiché par le jeu jusqu’à une future intégration expressément autorisée. CGWeb et l’ancienne Mine non touchés.

**Arrêt pour validation humaine. Aucune sprite sheet, aucune intégration, aucun chantier Zone 5, aucun commit/push.**
