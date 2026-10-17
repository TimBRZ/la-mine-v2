# Éclateur — V0.35A-R7, trois pistes statiques

[Galerie](v035a-r7-eclateur/gallery.html) · [Planche A/B/C](v035a-r7-eclateur/comparaisons/ABC.html) · [Mobile 320×568](v035a-r7-eclateur/captures/mobile-320.jpg) · [Mobile 390×844](v035a-r7-eclateur/captures/mobile-390.jpg)

**Aucun choix de piste, aucun master final.** Trois familles plausibles de dispositifs miniers, stylisées pour le jeu. Ce sont des recherches graphiques, pas des reproductions techniques d'équipements de sécurité réels.

## Rôle réel inspecté

Sources : `src/rift/actors.js`, `src/rift/config.js`, `src/rift/combat.js`, `src/rift/art.js`, `src/enemy.js`, `src/enemies/registry.js` et `src/enemies/view.js`. Aucun de ces fichiers n'est modifié.

| Point | Comportement actuel |
|---|---|
| Gabarit | Texture procédurale 48×48 ; collision circulaire r19 ; 68 PV ; contact 0,5. |
| Apparition | Warmup 1 s, puis positionnement initial 0,9 + slot×0,4 s. |
| Déplacement | Poursuite avec petite composante latérale 0,25, alternée selon le nombre d'attaques. Vitesse 48 u/s, multipliée par 1,9 sous 170 u : 91,2 u/s. Échappement vers le centre pendant 0,55 s près des bords. |
| Déclenchement | Si le temps de positionnement est écoulé : distance ≤95 u, **ou** PV ≤35 %, auquel cas la condition de proximité est levée. Pas de nouvelle accélération liée aux PV. |
| Attaque normale | `blast` réserve une zone au point de la machine au début de la préparation, borné aux limites de salle. Télégraphe 1,25 s, rayon 58, danger 0,5 s, dégâts 0,5 sous les règles d'invulnérabilité existantes. Aucun projectile mobile pendant cette attaque. |
| Survie et cadence | L'attaque normale ne tue pas l'Éclateur. Recovery 1,6 s, mouvement repris après 0,3 s ; positionnement suivant minimal 0,6 s. Cycle nominal minimal 3,45 s, allongé selon proximité et plafonds. Un refus d'admission est réessayé après 0,18 s. |
| Mort | La zone du propriétaire mort est retirée. Un avertissement séparé de 1,1 s précède six projectiles radiaux : vitesse 95 u/s, portée 230, rayon 5, dégâts 0,5. Si les places manquent, l'émission attend. Ce danger de mort ne doit pas être confondu avec le blast normal. |
| Orientation | Angle logique calculé, mais sprite fixe (`rotationOffset:null`). Aucun miroir ou nouveau pivot proposé dans le runtime. |
| Plafonds | 4 zones au sol globales, une par propriétaire ; pool de 24 projectiles ; admission des Éclateurs freinée lorsque les avertissements de mort s'accumulent. |

Lecture gameplay : petite menace de proximité qui accélère, prépare une rupture locale, peut recommencer, et laisse un danger radial après sa mort. Le dessin doit raconter confinement et rupture sans imposer de coup frontal, de tir de canon ou de suicide systématique.

L'image « actuel » reprend l'export SVG historique de la **texture procédurale encore en production**, contrôlé contre `riftTextures()` : cercles, deux triangles centraux, trois traits radiaux et témoin supérieur. Le viewBox 48×48 est conservé dans les comparaisons. Aucun concept V035A rejeté ne sert de référence de design.

## A — Cassette d'abattage

[Vue principale](v035a-r7-eclateur/concepts/eclateur-A.svg) · [Silhouette](v035a-r7-eclateur/silhouettes/eclateur-A.svg) · [Comparaison avec l'actuel](v035a-r7-eclateur/comparaisons/actuel-A.html)

**Un petit chariot chenillé porte trois cartouches industrielles retenues par une sangle.** Les trois sommets et la ceinture de retenue racontent une énergie confinée, capable de se libérer autour de l'engin. Une unique fenêtre Grisou sur la retenue évite les trois « tubes lumineux ».

Avantage : objet d'abattage immédiatement identifiable, silhouette à trois cartouches différente du Rampant bas et de la cuve unique du Cracheur. Les volumes restent lisibles à 40 px sans câble, mèche, cristal ni texture.

Limite : le langage de cartouches peut évoquer un ennemi suicide. Une future animation devra montrer une décharge contenue pendant l'attaque normale, et réserver la rupture complète à la mort. Aucun changement de comportement pour faire correspondre le jeu au dessin.

## B — Caisson de décompression

[Vue principale](v035a-r7-eclateur/concepts/eclateur-B.svg) · [Silhouette](v035a-r7-eclateur/silhouettes/eclateur-B.svg) · [Comparaison avec l'actuel](v035a-r7-eclateur/comparaisons/actuel-B.html)

**Un caisson de pression mobile, fermé par un couvercle et deux gros verrous.** Le couvercle, les retenues et les deux joints latéraux expriment une pression interne susceptible de relâcher une onde autour du caisson. Une seule fenêtre technique indique le Grisou.

Avantage : silhouette rectangulaire basse sur roues, sans canon ni organe d'attaque dirigée. Les verrous et le couvercle pourraient porter une préparation claire, sans ajouter de pièces. Le volume fermé se distingue des bouteilles et du coin des autres pistes.

Limite : à 34 px, il peut être lu comme une caisse utilitaire. Les verrous et le joint de couvercle doivent rester plus importants que toute décoration. Ne pas ajouter un pictogramme minuscule pour tenter de résoudre cette limite.

## C — Éclateur hydraulique à coin

[Vue principale](v035a-r7-eclateur/concepts/eclateur-C.svg) · [Silhouette](v035a-r7-eclateur/silhouettes/eclateur-C.svg) · [Comparaison avec l'actuel](v035a-r7-eclateur/comparaisons/actuel-C.html)

**Un petit éclateur de roche chenillé : vérin central, coin et deux mors écarteurs.** La tige pousse un coin entre des mors mécaniques retenus par le bâti. Une fenêtre latérale étroite évite la lecture d'un visage sur le corps de vérin. Aucun membre articulé de créature, aucune patte d'araignée.

Avantage : la séparation mécanique est racontée par le coin, les mors et le vide central. La silhouette ouverte se distingue des deux enveloppes fermées. Le châssis chenillé reste celui d'un petit dispositif, sans gros foret de boss.

Limite : l'outil suggère une action vers le sol. Il ne doit créer ni attaque directionnelle, ni dégâts au bout du coin. Le danger réel reste le disque télégraphié existant ; sa fragmentation à la mort devra rester lisible sans multiplication de débris décoratifs.

## Style, échelle et mobile

Palette commune : charbon `#10191D`, acier mat `#718783`, ocre chantier `#B3944F`, fenêtre Grisou `#82CFA7`, repère clair minimal `#F0ECDF`. Contour principal 4 unités dans un dessin 128². Cinq aplats au maximum ; pas d'effet SF, aura, fumée, texture aléatoire ou surdétail. Aucune usure fine ajoutée, car elle disparaîtrait à taille jeu.

Chaque SVG statique est exporté en 768², avec un cadre proposé de **48×48 unités du monde** ; la hitbox actuelle r19 reste inchangée. Les petits débords de dessin ne constituent pas des collisions. Les silhouettes monochromes reprennent exactement les formes, avec leurs vides mécaniques.

La galerie montre chaque piste à 40 px, à côté de l'actuel, et sur le décor Zone 4. Les vues 320×568 et 390×844 donnent un cadre monde d'environ 34 et 42 px. Rampant final, Cracheur R6 et héros V033 sont copiés sans retouche comme repères. Vérification dans Chromium, pas sur téléphone physique ou en run : aucune intégration n'est réalisée.

## Validation et arrêt

**884/884 tests réussis**, aucun échec ni test ignoré, 44,75 s. [Journal](v035a-r7-eclateur/tests.txt). **4 700 fichiers préexistants inchangés octet pour octet**, aucun ajout dans `src`, références copiées à l'identique. [Contrôle des empreintes](v035a-r7-eclateur/scope-validation.json).

Pages finales vérifiées : aucune erreur ou alerte console, image manquante ou largeur débordante en 320×568 et 390×844. [Mesures](v035a-r7-eclateur/browser-validation.json). Tous les SVG du dossier sont valides XML. Les échantillons des cartes de galerie font exactement 40×40 px CSS ; les planches comparatives se réduisent pour tenir sur mobile.

Aucun asset de production remplacé, aucun gameplay modifié, tous les anciens concepts conservés. Seuls ce document et le dossier `v035a-r7-eclateur/` sont ajoutés. Aucun master choisi, aucune sheet, aucune animation, aucune intégration, aucun commit/push. **Arrêt avant le choix humain de A, B ou C.**
