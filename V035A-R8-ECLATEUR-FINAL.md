# Éclateur — master final statique R8

**Choix humain validé : C0, machine de fendage hydraulique.** L'utilisateur a confirmé dans cette étape que C0 désigne exactement `v035a-r7-eclateur/concepts/eclateur-C.svg`. La planche présente donc C initiale et C0 comme deux désignations du même dessin, sans fabriquer de variante intermédiaire. C1 et C2 ne sont ni utilisés ni créés.

Une petite machine minière hydraulique qui force un coin entre deux mors pour provoquer une rupture / fragmentation.

[Galerie](v035a-r8-eclateur-final/gallery.html) · [Master 1024 px](v035a-r8-eclateur-final/master/eclateur-final.svg) · [Silhouette](v035a-r8-eclateur-final/silhouettes/eclateur-final.svg) · [C / C0 / final](v035a-r8-eclateur-final/comparaisons/C-C0-final.html) · [Famille](v035a-r8-eclateur-final/comparaisons/famille.html)

## Nettoyage du master

La famille de C0 est conservée : châssis chenillé bas, bâti à deux guides, vérin central, tige, coin et deux mors. Un seul master statique est proposé pour validation du nettoyage.

- Les mors deviennent deux blocs trapézoïdaux droits, à base plane. Les retours en crochet de C0 sont retirés : pas de doigt, dent, articulation de pince ou mandibule.
- Le coin passe de 20 à 24 unités de largeur, avec une pointe à y98 au lieu de y96. Sa face claire et sa face acier matérialisent un coin métallique, sans éclair ni émission lumineuse.
- La tige passe de 10 à 12 unités de largeur, reste centrée à x64 et relie le vérin au coin sans ajout de tuyau.
- Les petits pivots latéraux noirs sont supprimés : ils étaient secondaires à 40 px. Les guides du bâti suffisent à expliquer le support.
- Corps du vérin inchangé en dimensions 36×37, coins légèrement moins arrondis (rayon graphique 5 au lieu de 7). Fenêtre latérale réduite de 9×22 à 9×20, accent discret sans effet de visage.
- Chenille, base et emplacement général du mécanisme conservés. Contours structurels homogènes de 4 unités ; fenêtre à 3 unités. Onze formes élémentaires, comme C0, sans texture ou pièce décorative supplémentaire.

## Palette et proportions

| Fonction | Couleur |
|---|---|
| Contours, structure sombre, chenille | `#10191D` |
| Acier mat, guides, face secondaire du coin | `#718783` |
| Corps du vérin et mors de chantier | `#B3944F` |
| Fenêtre Grisou unique, latérale | `#82CFA7` |
| Tige et face métallique claire du coin | `#F0ECDF` |

Cinq aplats au maximum. Le métal clair est une matière, sans halo ni VFX. Aucun câble, boulon ajouté, cristal, aura, fumée permanente ou code visuel militaire.

SVG 1024×1024, viewBox 128×128. **Cadre cible 48×48 du monde**, origine centrale et hitbox r19 existantes. Le dessin reste dans l'enveloppe globale de C0 (châssis x20…108, y88…110 ; capot supérieur y16). Le coin élargi reste à l'intérieur de cette enveloppe. Il n'ajoute pas de collision.

L'axe de fendage est vertical dans le dessin : vérin en haut/arrière, coin en bas/avant. Vue frontale légèrement plongeante héritée de C0 ; pas de nouvelle direction ou rotation de rendu. Le renderer actuel reste fixe (`rotationOffset:null`). « Avant » décrit le mécanisme dessiné, jamais un nouveau secteur de dégâts.

## Comparaison et hiérarchie

Le [comparatif de famille](v035a-r8-eclateur-final/comparaisons/famille.svg) montre couleur et silhouette à la taille du monde : Éclateur 48², Rampant 48², Cracheur 48², Foreuse autonome 58×50, Foreur de fond 60×48, héros 46×52. Les références sont copiées à l'identique. Les armes V033 sont également visibles dans la galerie pour contrôler les aplats et les contours.

Le coin central distingue l'Éclateur du tambour du Rampant, de la cuve du Cracheur et des forets coniques. Les deux guides verticaux et les vides autour de la tige évitent une masse compacte confuse. Les mors sont des blocs de fendage soutenus par le bâti, sans membres organiques. Aucune augmentation du gabarit, aucun organe de boss.

## Gameplay et futures animations — aucune frame créée

Comportement existant inchangé : poursuite à 48 u/s, accélération à 91,2 u/s sous 170 u ; préparation d'un `blast` à distance ≤95 u, ou à PV ≤35 % sans condition de proximité. Télégraphe 1,25 s, rayon 58, danger 0,5 s ; la machine survit à cette attaque. Recovery 1,6 s, déplacement repris après 0,3 s, puis positionnement minimal 0,6 s. À la mort : avertissement séparé 1,1 s puis six projectiles radiaux (95 u/s, portée 230, r5, dégâts 0,5), pouvant attendre une place dans le pool. Sources inchangées : `src/rift/actors.js`, `src/rift/config.js`, `src/rift/combat.js`.

Les groupes SVG isolent `chassis-chenille`, `bati`, `verin`, `temoin-grisou`, `tige`, `mors`, `coin` pour préparer une future production, **sans créer d'animation maintenant**.

| État futur | Recommandation de présentation |
|---|---|
| Déplacement | Défilement interne de la chenille ; léger mouvement contenu du bâti. Respecter vitesse, trajectoire et pivot existants. |
| Vibration hydraulique | Faible vibration interne, facultative en réduction de mouvements ; pas de tremblement permanent de tout le sprite. |
| Montée en pression | Petite tension du bloc vérin, sans nouveau signal de danger ni accumulation d'effets lumineux. |
| Préparation | Suivre les 1,25 s de warning, jamais retarder la zone ni déplacer son centre. Garder le cercle au sol prioritaire. |
| Vérin qui avance | Courte translation visuelle de tige/coin à l'intérieur du gabarit ; le sprite ne devient pas un projectile et l'attaque ne devient pas frontale. |
| Mors qui se tendent | Translation mécanique très limitée dans leurs guides, sans ouverture en pince ni bras pivotants. |
| Déclenchement / éclatement | Impulsion contenue du mécanisme synchronisée sur l'activation de la zone réelle. Aucun éclat décoratif confondu avec un projectile hostile. La machine ne meurt pas lors du blast normal. |
| Recovery | Retour de la tige sur le temps existant. Reprise de mouvement après 0,3 s autorisée visuellement, sans blocage de pose. |
| Hit | Réaction interne brève ; recul, invulnérabilité et dégâts inchangés. |
| Mort | Arrêt du vérin et du châssis, extinction du témoin, affaissement contenu. Ne pas masquer ni raccourcir le warning de mort de 1,1 s ; conserver exactement les six projectiles existants et leur admission différée. |

L'animation suivra les états du jeu. Aucun événement d'animation ne devra déclencher des dégâts, modifier la cadence ou piloter le déplacement.

## Mobile et limites

[320×568](v035a-r8-eclateur-final/mobile/320.html) · [390×844](v035a-r8-eclateur-final/mobile/390.html) · [Échantillons 34 / 40 / 42 / 48 px](v035a-r8-eclateur-final/mobile/taille-jeu.html).

Le cadre 48² devient environ 34 px sur 320 et 42 px sur 390. La tige claire et le coin bicolore portent la lecture au centre ; la fenêtre reste secondaire. Les planches de comparaison sont statiques sur fond Zone 4, sans zoom artificiel du master. À 34 px, le détail de la face acier du coin devient secondaire ; son contour clair reste prioritaire.

Vérification dans Chromium, **pas sur Android physique ni dans une run**. L'orientation mobile évaluée est celle du dessin statique ; le comportement de rendu en déplacement sera à vérifier lors d'une intégration future autorisée.

## Validation et arrêt

Validation terminée : **884/884 tests existants réussis**, zéro échec, zéro test ignoré (75,89 s). Les empreintes des **4 740 fichiers préexistants** sont inchangées ; aucun fichier ajouté à `src`.

Galerie et planches contrôlées dans Chromium en **320×568** et **390×844** : aucune image manquante, aucun débordement horizontal, aucune erreur ni alerte console relevée. Captures : [320×568](v035a-r8-eclateur-final/captures/mobile-320.jpg), [390×844](v035a-r8-eclateur-final/captures/mobile-390.jpg), [C / C0 / final](v035a-r8-eclateur-final/captures/C-C0-final.jpg), [grande vue](v035a-r8-eclateur-final/captures/master-grand.jpg).

[Tests existants](v035a-r8-eclateur-final/tests.txt) · [Empreintes et invariants](v035a-r8-eclateur-final/scope-validation.json) · [Pages mobiles et console](v035a-r8-eclateur-final/browser-validation.json).

Aucun asset de production remplacé, aucun gameplay modifié, concepts précédents conservés. Seuls ce document et `v035a-r8-eclateur-final/` sont ajoutés. Aucun autre mob, boss, sheet, animation ou intégration traité. Aucun commit/push. **Arrêt pour validation humaine du master R8.**
