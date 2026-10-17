# Cracheur — master final statique R6

**Choix humain validé : A, pulvérisateur à cuve verticale et buse courte.** Une seule version finale statique est livrée pour revue. Les propositions R5 restent intactes.

Une petite machine minière mobile qui libère du gaz sous pression.

[Galerie](v035a-r6-cracheur-final/gallery.html) · [Master 1024 px](v035a-r6-cracheur-final/master/cracheur-final.svg) · [Silhouette](v035a-r6-cracheur-final/silhouettes/cracheur-final.svg) · [A initiale → final](v035a-r6-cracheur-final/comparaisons/A-vers-final.html) · [Crachefer sans couleur](v035a-r6-cracheur-final/comparaisons/crachefer-monochrome.html)

## Choix et nettoyage

La cuve verticale et le chariot à deux roues conservent exactement les volumes de A. Pas de nouvelle famille, d'organe supplémentaire ou de variante.

- La fenêtre passe de 14×12 à 16×13 unités pour rester un accent lisible sur mobile ; toujours une seule fenêtre.
- Le conduit coudé est légèrement resserré : un raccord unique de cuve à buse, sans flexible libre.
- La buse se termine à x110 plutôt que x112. Son ouverture devient une surface sombre évasée, qui raconte la diffusion de gaz plutôt qu'un canon long.
- Le reflet décoratif vertical de la cuve est supprimé. La même couleur claire souligne seulement le bord supérieur utile de la buse.
- Contour structurel constant de 4 unités, raccords arrondis ; fenêtre et arête claire à 3 unités. Treize formes élémentaires, aucun effet actif.

## Proportions et fonctions

Dessin en viewBox 128×128, export SVG 1024×1024. Cadre cible **48×48 unités du monde**, origine centrale et rayon de collision actuel **18**, sans modification de production. Cuve : x31/y23, 43×66, rayon graphique 19. Roues : centres (32,97) et (81,97), rayon graphique 10. L'enveloppe de A reste conservée, avec une buse légèrement plus courte.

La cuve porte la réserve, sa large ceinture indique la retenue, le petit capot supérieur suggère une soupape fermée. Une fenêtre Grisou raconte le contenu sans manomètre miniature. Le conduit unique mène à la sortie évasée. Les roues et le chariot expliquent le repositionnement ; aucune chenille ou pièce de coupe du Rampant n'est reprise.

L'avant graphique est à droite. Le renderer actuel du Cracheur reste fixe (`rotationOffset:null`) ; aucune rotation ni nouveau miroir n'est ajouté. Une future mise en visée graphique devra faire l'objet d'une décision séparée, sans changer la position des dégâts.

## Palette

| Fonction | Couleur |
|---|---|
| Charbon / contours / ouverture | `#10191D` |
| Acier mat / cuve / châssis | `#718783` |
| Chantier / ceinture / conduit | `#B3944F` |
| Grisou, fenêtre unique | `#82CFA7` |
| Arête minimale de buse | `#F0ECDF` |

Cinq aplats. Pas d'aura, fumée, texture, gradient, éclair, cristal ou source lumineuse supplémentaire. Héros, armes V033, références V034 et Rampant final sont copiés sans retouche dans la galerie.

## Différenciation

La [planche monochrome](v035a-r6-cracheur-final/comparaisons/crachefer-monochrome.svg) compare les deux contours à cadre identique, puis à leur échelle de jeu. Le Cracheur est une **cuve élancée sur roues, sortie courte évasée** ; le Crachefer est un **four ventru, grande gueule latérale et appuis massifs**. La distinction ne repose pas sur la couleur. Leurs cadres restent respectivement 48² et 84².

Pour garder une identité de mob face aux futurs Souffleur et Chaudière, le Cracheur n'a ni turbine, ni cheminée, ni four, ni groupe de cuves, ni batterie de soupapes. Il porte un seul récipient et une seule sortie. Ces exclusions préservent de la place pour les futurs boss ; elles ne valent pas validation de leurs futurs designs, non créés ici.

## Gameplay respecté et future animation

Le code inspecté reste la source de vérité : `src/rift/actors.js`, `src/rift/config.js`, `src/rift/combat.js`, `src/enemies/registry.js` et `src/enemies/view.js`. **Aucun projectile mobile.** `spit` réserve une poche de gaz à la position du joueur lors de la préparation, bornée aux limites de salle : télégraphe 1,3 s, danger 2 s, rayon 38, dégâts 0,5 sous les règles existantes. La machine cherche 180–235 unités de distance et peut commencer entre 150 et 300. Vitesse 68, récupération 1,6 s, puis repositionnement minimal 0,6 s ; cycle nominal minimal 3,5 s, allongé selon distance et plafonds. Le délai de spawn 1 s n'est pas le délai d'attaque.

**Aucune frame créée.** Groupes séparés : `chassis`, `roue-arriere`, `roue-avant`, `cuve`, `soupape`, `fenetre-grisou`, `conduit`, `buse`.

| État futur | Recommandation, à synchroniser au gameplay existant |
|---|---|
| Déplacement | Rotation discrète des roues, petite oscillation du chariot contenue dans le cadre. Conserver les repositionnements latéraux et le pivot physique. |
| Vibration de pression | Très faible vibration interne du bloc cuve, sans agrandir sa silhouette ni déplacer collision/ombre. Compatible avec réduction des mouvements. |
| Montée en pression | Tension contenue de la soupape et de la fenêtre, sans nouvelle lumière ou état logique. |
| Préparation attaque | Suivre uniquement les 1,3 s de `warning`. La zone au sol télégraphiée reste la lecture prioritaire ; aucun délai supplémentaire ni déplacement de sa cible. |
| Émission de gaz | Bref indice de décharge à la buse au passage à l'activation existante. Ne pas inventer une balle, un trajet balistique, un faisceau ou un danger entre la buse et la poche distante. Aucun nuage permanent. |
| Recovery | Relâcher la soupape sur les 1,6 s existantes. Le déplacement reprend après 0,3 s de recovery : l'animation ne doit pas immobiliser la machine. |
| Hit | Réaction interne brève ; conserver le recul logique et les timings existants. |
| Mort | Arrêt des roues, extinction de la fenêtre, affaissement contenu. Aucune explosion nouvelle ni gaz persistant : le système retire déjà la poche du propriétaire mort. |

## Mobile et limites

[320×568](v035a-r6-cracheur-final/mobile/320.html) · [390×844](v035a-r6-cracheur-final/mobile/390.html) · [Échantillons taille jeu](v035a-r6-cracheur-final/mobile/taille-jeu.html).

Le cadre 48² devient environ 34 px sur 320 et 42 px sur 390 ; 40 px est également montré sans agrandissement. La cuve, les roues et la buse portent la lecture. La fenêtre et la petite soupape restent secondaires à 34 px. Les captures sont des compositions statiques sur le fond Zone 4, contrôlées dans Chromium, **pas sur téléphone physique ni dans une run**.

## Validation et arrêt

**884/884 tests réussis**, aucun échec ni test ignoré, 43,77 s. Journal dans [tests.txt](v035a-r6-cracheur-final/tests.txt). Galerie et vues 320×568 / 390×844 : aucune image manquante, aucun débordement horizontal, aucune erreur ou alerte console ; [mesures](v035a-r6-cracheur-final/browser-validation.json). Tous les SVG du dossier sont valides XML.

**4 664 fichiers préexistants inchangés octet pour octet**, aucun ajout dans `src`, références copiées à l'identique. [Contrôle des empreintes](v035a-r6-cracheur-final/scope-validation.json). Seuls ce document et le dossier `v035a-r6-cracheur-final/` sont ajoutés.

Aucun asset de production remplacé, aucun gameplay modifié. Anciennes propositions conservées. Aucune animation, sprite sheet, intégration ou autre entité traitée. Aucun commit/push. **Arrêt pour validation humaine du master R6.**
