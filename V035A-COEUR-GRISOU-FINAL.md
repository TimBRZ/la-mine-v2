# Cœur de Grisou — master statique, variante A

**Statut : master proposé pour validation humaine. Aucune intégration.**

## Intention et référence

La référence officielle est l’image fournie `Image ChatGPT 14 oct. 2026, 00_46_36.png`, conservée intégralement et copiée octet par octet. Le tracé reprend sa composition : chambre centrale, deux arceaux massifs, modules latéraux, conduites supérieures et deux bases chenillées courtes.

Le noyau est enfermé dans une chambre sombre bordée d’ocre, avec une capsule turquoise maintenue entre deux retenues. La lumière orange diffuse de la référence est simplifiée selon la palette demandée : **accent turquoise contenu, sans halo, particules ou flamme**. La menace vient du confinement et des masses de retenue, pas d’un organe ou d’un effet magique.

Nettoyage : aplats acier/ocre/charbon/rouille, contours homogènes, suppression des textures, rivets secondaires et petites découpes parasites. La capsule centrale a été clarifiée pour éviter une simple lecture de voyant miniature. Master SVG transparent et entièrement vectoriel ; aucun bitmap, filtre, gradient ou script. Seul le cadrage de la référence embarque le PNG original.

## Gabarit et différenciation

**Même cadre de présentation 84×84 que la Fendeuse et le Souffleur.** Aucun agrandissement : le profil du Cœur est légèrement plus bas et large. Le cadrage SVG commun à la référence et au tracé est `285 170 870 450`.

Sa chambre centrale encadrée de deux flancs constitue sa signature. La Fendeuse conserve sa roue crénelée, le Souffleur sa grande turbine, l’Éclateur son coin et ses mors. Le Cœur n’ajoute aucun outil frontal. Comparaison en couleur et monochrome, à cadre égal puis à l’échelle mobile existante.

## Construction et animation future

| Parties stables | Mouvements futurs possibles |
|---|---|
| Châssis, contour des chenilles | Galets et segments internes uniquement |
| Chambre, flancs, arceaux et traverses | Vibrations mécaniques très brèves, contenues dans l’enveloppe |
| Conduites et boîtier de contrôle | Témoins de pression secondaires, sans halo permanent |
| Fenêtre et retenues du noyau | Compression ou variation interne discrète de la capsule, sans changer son centre ni la taille du boss |

Préparation : tension interne suivant les télégraphes existants. Attaque : impulsion visuelle contenue. Hit : réaction brève du bloc central. Mort : extinction puis affaissement simple ; aucun éclat dangereux, projectile supplémentaire ou nouvelle explosion.

Les groupes SVG isolent les ensembles pour une future production. Aucune frame créée. L’animation devra suivre les états du jeu, sans déclencher les attaques ni modifier leurs timings.

## Gameplay conservé

Le boss Zone 4 `core` conserve son cadre 84² et son rayon 30. Ses patterns restent la double salve circulaire, les quatre impacts au sol et l’orbe lente qui se fragmente après avertissement. Télégraphes : 1,5 / 1,65 / 1,15 s ; décalage de la seconde salve : 0,65 s. Le déplacement, les accélérations, les plafonds et la coordination du triple restent inchangés.

## Livrables et contrôles

- [Galerie](v035a-coeur-grisou-final/gallery.html), [master SVG](v035a-coeur-grisou-final/master/coeur-grisou.svg), [silhouette](v035a-coeur-grisou-final/silhouettes/coeur-grisou.svg).
- [Référence / master](v035a-coeur-grisou-final/captures/reference-master.jpg), [gabarit et famille](v035a-coeur-grisou-final/captures/famille.jpg).
- Captures [320×568](v035a-coeur-grisou-final/captures/mobile-320.jpg) et [390×844](v035a-coeur-grisou-final/captures/mobile-390.jpg).

Contrôles en cadres **40 / 56 / 64 / 84 px CSS**. Les trois boss occupent le même cadre mobile : environ **59,7 px sur 320** et **72,8 px sur 390**. Le dessin est contenu sans étirement ; le cadre carré ne représente pas la hauteur réellement occupée par ce profil bas.

À 40 px, les galets et petits témoins deviennent secondaires. La chambre et ses deux arceaux restent prioritaires. Planches statiques dans Chromium ; pas de test sur téléphone physique ni d’intégration en combat. La lisibilité en animation et en mêlée devra être validée à une étape ultérieure autorisée.

**884/884 tests existants réussis**, zéro échec, zéro test ignoré, 43,51 s. [Journal](v035a-coeur-grisou-final/tests.txt). Les **4 866 fichiers préexistants** et les trois masters de référence sont inchangés : [empreintes](v035a-coeur-grisou-final/scope-validation.json). [Validation navigateur](v035a-coeur-grisou-final/browser-validation.json).

Validation finale dans Chromium : aucune erreur ni alerte console, aucune image manquante et aucun débordement horizontal sur la galerie en 320 et 390 px. Les deux aperçus mobiles occupent exactement 320×568 et 390×844 px. Master et silhouette SVG valides ; master vectoriel de 80 formes, 9 couleurs et 7 115 octets.

Seuls ce document et `v035a-coeur-grisou-final/` sont ajoutés. Aucun gameplay, hitbox, asset de production ou test existant modifié. Aucune animation, sprite sheet, intégration, opération commit/push. **Arrêt pour validation humaine.**
