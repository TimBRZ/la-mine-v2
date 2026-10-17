# La Mine V2 — V0.34A.1

Correction statique ciblée du 13 octobre 2026. **Trois variantes proposées à la validation humaine.** Aucun début de V0.34B, aucune sprite sheet, aucune intégration dans le jeu.

[Galerie mise à jour](v034a-visual-enemies-bosses/gallery.html) · [Comparaison avant/après](v034a-visual-enemies-bosses/v034a1/captures/avant-apres.jpg)

## Corrections retenues

| Concept | Modification proposée | Conservé |
|---|---|---|
| [L’Effondreur](v034a-visual-enemies-bosses/v034a1/concepts/effondreur.svg) | Parois intérieures inclinées, guides et retenues courtes autour d'un fond sombre. La cavité raconte une trémie/gueule industrielle, plutôt qu'un passage vide. | Contour extérieur carré, quatre appuis, grande ouverture visible en couleur, contrôle d'éboulements. Aucun marteau. |
| [Le Crachefer](v034a-visual-enemies-bosses/v034a1/concepts/crachefer.svg) | Chambre ventrue, cerclages, grosse bouche de projection, courte soupape et appuis courts. Plus de lecture de cabine/essieux. | Machine compacte à projectiles, gueule vers +X, palette existante. |
| [Foreur de fond](v034a-visual-enemies-bosses/v034a1/concepts/deepdriller.svg) | Deux longs patins parallèles, bras de liaison courts et moteur bas. Les espaces entre patins et moteur restent visibles en aplat. | Foret conique et colliers avant conservés, axe +X, machine lourde de charge. |
| Grisouteux | Master conservé après revue à petite taille : tête basse, bras décalés et réservoir asymétrique restent distincts. Une inclinaison globale risquerait de rapprocher ces masses ou de rogner le canevas. | Aucun redesign ni variante retenue. Une future animation pourra porter vitesse et instabilité. |

La Locomotive et la Foreuse autonome sont **strictement identiques** et servent de références côte à côte. Les onze concepts explicitement validés, ainsi que Draisine, Locomotive et Grisouteux, sont inchangés : **14 concepts actifs conservés, 3 corrigés**.

## Comparaisons et contrôle mobile

La galerie s'ouvre sur « Corrections V0.34A.1 ». Elle montre avant correction / après correction, puis pour chacun la couleur et la silhouette à taille jeu. Le bouton « Comparaison silhouettes » réunit Crachefer/Locomotive, Foreuse/Foreur, Effondreur avant/après.

| Vue | 320 × 568 | 390 × 844 |
|---|---|---|
| Planche monochrome | [Capture](v034a-visual-enemies-bosses/v034a1/captures/patch-silhouettes-320.jpg) | [Capture](v034a-visual-enemies-bosses/v034a1/captures/patch-silhouettes-390.jpg) |
| Avant/après avec taille jeu | [Capture](v034a-visual-enemies-bosses/v034a1/captures/patch-review-320.jpg) | [Capture](v034a-visual-enemies-bosses/v034a1/captures/patch-review-390.jpg) |

[Grisouteux conservé, contrôle390](v034a-visual-enemies-bosses/v034a1/captures/grisouteux-conserve-390.jpg).

Réduction du monde450×800 : .710 à320, .8667 à390. Dimensions proposées inchangées : Effondreur86×86/r28, Crachefer84×84/r28, Foreur60×48/r20. Tous les pivots et les orientations sont identiques à V0.34A. Aucune compensation d'échelle dans les vignettes de jeu.

Constats de revue : chambre arrondie du Crachefer distincte du profil à cabine de la Locomotive ; longs patins du Foreur distincts des chenilles courtes de la Foreuse ; cadre extérieur de l'Effondreur identique. En silhouette opaque, le fond sombre de sa trémie remplit logiquement le centre : la profondeur intérieure se lit dans la version couleur, et n'évoque plus une zone traversable. Cela ne déplace ni ne modifie sa collision.

Le premier contrôle320 a révélé un espacement trop large entre deux petites vignettes. L'espacement de la galerie a été réduit ; les quatre vues mobiles finales ne présentent **aucun débordement horizontal, aucune image manquante et aucune erreur/avertissement console collecté**. [Mesures finales](v034a-visual-enemies-bosses/v034a1/browser-validation.json).

Limite : contrôle dans Chromium aux viewports demandés, pas sur téléphone physique. L'identification humaine immédiate et l'aspect de trémie restent à approuver. Aucune animation ni performance du jeu n'est revendiquée sur ces planches statiques.

## Conservation et preuves

- Les **17 masters V0.34A originaux restent à leur emplacement, inchangés octet pour octet**. Les trois variantes sont exclusivement dans v034a-visual-enemies-bosses/v034a1/concepts/.
- L'ancienne galerie, son gabarit, son assembleur et ses données sont également conservés dans v034a1/before/ pour référence/restauration. Les captures et documents V0.34A précédents ne sont pas supprimés.
- La galerie principale utilise les trois variantes via v034a1/overrides.json. Aucun chemin d'asset chargé par le jeu n'a été changé.
- [Contrôle dédié](v034a-visual-enemies-bosses/v034a1/validation.json) : exactement3variantes,14concepts actifs identiques,17originaux préservés, mêmes cadres/pivots/rayons. Les empreintes initiales des masters sont conservées dans original-masters-hashes.json.
- Les **3 407 fichiers de production et de tests** suivis par le garde V034A restent identiques ; aucun ajout sous src. Aucun gameplay, hitbox, collision, pattern, timing, statistique, progression ou sauvegarde modifié. Aucun accès CGWeb/backend.

## Tests

**838/838 tests existants réussis**, zéro échec, zéro ignoré, durée43,51s. [Sortie complète](v034a-visual-enemies-bosses/v034a1/tests-final.txt).

Commande : npm.cmd test, avec l'autorisation réseau locale déjà nécessaire aux serveurs HTTP temporaires. Aucun test réécrit ou supprimé. Contrôle complémentaire : node v034a-visual-enemies-bosses/v034a1/verify.mjs ; trois XML valides, assemblage et syntaxe de la galerie valides.

Le serveur de revue temporaire sur127.0.0.1:5185 a été arrêté après les captures. L'onglet a été fermé et le viewport rétabli. Le serveur du jeu n'a pas été modifié.

**Arrêt après V0.34A.1.** Autres concepts validés provisoirement selon la demande ; ces trois corrections restent proposées à votre validation. Aucune sheet, aucune intégration, aucun commit/push.
