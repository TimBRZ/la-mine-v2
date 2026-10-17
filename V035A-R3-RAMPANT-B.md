# Rampant — B0, B1 et B2 autour de la base B validée

**Choix humain acquis : B, mini-haveuse chenillée. Choix final de variante : en attente.** B0 est le master principal proposé ; B1/B2 restent deux raffinements de ce même engin. Aucun autre concept ou ennemi traité.

[Galerie](v035a-r3-rampant-b/gallery.html) · [B0/B1/B2 en grand](v035a-r3-rampant-b/comparaisons/variantes.html) · [Comparaison aux références](v035a-r3-rampant-b/captures/comparison.png)

| Version | Ce qui change et pourquoi | Avantage | Limite |
|---|---|---|---|
| [B0 — master propre](v035a-r3-rampant-b/rampant-B0/rampant-B0.svg) | Proportions de B conservées ; chenilles structurées, axe du bras explicite, tambour à une large arête de coupe. | Lecture équilibrée du châssis et de l’outil. | À 34 px, les petits repères mécaniques passent après les grandes masses. |
| [B1 — plus agressive](v035a-r3-rampant-b/rampant-B1/rampant-B1.svg) | Même corps ; tambour avancé de 3 unités et agrandi de 6 %, abaissé de 1 unité. | L’outil frontal domine davantage sans faire grossir le mob entier. | Débordement visuel plus important devant la collision, sans dégâts supplémentaires. |
| [B2 — plus compacte](v035a-r3-rampant-b/rampant-B2/rampant-B2.svg) | Arrière et chenilles raccourcis de 8 unités ; toit abaissé de 2 ; tambour rapproché de 3 et abaissé de 1. | Masse plus ramassée, sensation visuelle de nervosité. | Corps et outil se rapprochent ; vérifier leur séparation sur petit écran. Aucune augmentation réelle de vitesse. |

Les unités ci-dessus appartiennent au dessin 128×128. Les trois fichiers sont des SVG statiques 512×512. Le cadre proposé reste **48×48 dans le monde**, avec la même origine centrée et la même hitbox r14. Pas d’agrandissement artificiel de B2 lors de la comparaison. La base B d’origine est conservée à l’identique et montrée comme référence historique.

## Invariants visuels

Mini-haveuse basse, deux chenilles, bras court, tambour frontal transversal ; aucun foret conique, patte ou élément organique. Cinq aplats communs : charbon, acier, ocre chantier, Grisou et arête claire. Le Grisou se limite à une fente sur le carter. Aucun câble, texture, aura, cristal ou décoration ajoutée.

La segmentation des chenilles désigne la propulsion ; l’axe relie le bras au corps ; l’arête du tambour désigne la coupe. Les silhouettes monochromes proviennent des mêmes chemins et ne dépendent pas de ces détails internes.

L’avant graphique est à droite. Le renderer actuel reste fixe : aucun changement de rotation/miroir, comportement, vitesse, attaque, projectile, hitbox ou collision. Le dessin de coupe ne crée aucune attaque supplémentaire.

## Revue humaine recommandée

Comparer d’abord à 34 px, puis à 42 px : l’outil et le corps doivent rester séparés visuellement. Contrôler ensuite l’écart avec Rat, Foreuse autonome et Foreur de fond, dont les masters sont conservés sans retouche. Choisir selon le degré d’agressivité et de compacité souhaité ; **aucune version n’est déclarée finale automatiquement**.

Les compositions sur le décor Zone 4 comportent aussi le héros V033. Ce sont des vues statiques aux dimensions CSS exactes, pas des runs ni un test Android physique : [320×568](v035a-r3-rampant-b/captures/mobile-320.png) · [390×844](v035a-r3-rampant-b/captures/mobile-390.png).

## Contrôles et arrêt

**884/884 tests réussis**, 0 échec, 0 ignoré, 70,68 s. [Journal des tests](v035a-r3-rampant-b/tests.txt).

Construction réussie ; 15 SVG valides XML. Galerie et cadres mobiles contrôlés en navigateur : aucune erreur console, image manquante ou largeur débordante. [Mesures](v035a-r3-rampant-b/browser-validation.json).

**4 000 fichiers protégés inchangés octet pour octet**, dont src, tests, assets production et tous les historiques visuels. Aucun ajout dans src. [Contrôle des fichiers](v035a-r3-rampant-b/scope-validation.json).

Les dossiers précédents restent intacts. Aucun asset de production remplacé, aucun gameplay modifié, aucune sprite sheet, animation ou intégration. Aucun commit/push. **Arrêt pour validation humaine de B0/B1/B2.**
