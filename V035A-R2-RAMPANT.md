# Rampant de Grisou — nouvelles pistes issues de machines réelles

**Trois études non sélectionnées, aucun master définitif.** La V035A et les premières propositions A/B/C restent intactes mais sont annulées visuellement.

[Galerie](v035a-r2-rampant/gallery.html) · [Comparaison Rat / Foreuse / Foreur de fond](v035a-r2-rampant/captures/comparison.png)

| Piste | Ce que représente exactement l’engin | Repères conservés | Limite à valider |
|---|---|---|---|
| [A](v035a-r2-rampant/rampant-A/rampant-A.svg) | Robot chenillé d’inspection minière chargé au Grisou, avec caméra frontale. | Deux chenilles parallèles, carter plat, optique frontale, petit réservoir. | Optique à distinguer d’un canon ; séparation des chenilles à petite taille. |
| [B](v035a-r2-rampant/rampant-B/rampant-B.svg) | Mini-haveuse sur chenilles, équipée d’un bras court et d’un tambour de coupe frontal. | Chenilles, bras mécanique, tambour transversal denté plutôt que foret conique. | Proximité de famille avec les foreuses ; reconnaître la coupe sans évoquer un boss. |
| [C](v035a-r2-rampant/rampant-C/rampant-C.svg) | Petit tracteur minier à quatre roues, au capot lourd et au réservoir de Grisou intégré. | Roues, poste de conduite bas, capot, pare-chocs. | Profil plus haut ; confirmer qu’il reste un Rampant et non une voiture ordinaire. |

## Références fonctionnelles réelles

- A : **Inuktun VersaTrax 150**, configuration parallèle. La fiche du fabricant décrit deux modules chenillés, une caméra frontale et l’inspection de conduites/tunnels, notamment dans le secteur minier. [Fiche Eddyfi](https://eddyfi.com/doc/Downloadables/Inuktun-Versatrax-150-Analog-Specifications.pdf).
- B : famille **roadheader Sandvik MT721**, châssis chenillé et tête de coupe portée par un bras. [Fabricant Sandvik](https://www.mining.sandvik/en/products/equipment/mechanical-cutting/mt721-roadheader-for-tunneling/).
- C : famille **tracteur utilitaire souterrain Kovatera KM200**, complétée par le **MineTractor T4**. [Kovatera](https://kovatera.com/products/km200/) · [Brochure MineMaster](https://minemaster.com/wp-content/uploads/2021/09/MineMaster-Brochures-ALL-min-1.pdf).

Ce sont des références de fonction et de construction. Les dessins sont des adaptations cartoon originales, sans logo, photo intégrée ni reproduction à l’échelle d’un modèle commercial. La miniaturisation de B et l’énergie Grisou sont propres au jeu.

## Dessin et taille

Palette commune limitée : charbon #10191D, acier #718783, chantier #B3944F, Grisou #82CFA7, lumière #F0ECDF — cinq couleurs maximum, quatre pour B. Aplats et contours épais, aucune texture, aura, cristal, accumulation de tuyaux ou boulons décoratifs. Chaque pièce sert au déplacement, à l’inspection, à la coupe ou au transport.

Chaque piste possède une grande vue SVG 512×512, une silhouette monochrome et une réduction à 40 px. Même cadre de jeu 48×48 : environ 34 px sur [320×568](v035a-r2-rampant/captures/mobile-320.png), 42 px sur [390×844](v035a-r2-rampant/captures/mobile-390.png). Le fond et le héros sont des références existantes. Les trois références V034A/A.1 sont conservées sans redessin.

Avant graphique à droite. Le renderer actuel reste fixe : cette étude ne corrige pas l’orientation en run. Hitbox r14, vitesse 105 u/s, contact et poursuite ondulante inchangés. La caméra n’ajoute aucun tir ; le tambour n’ajoute aucune attaque. Roues, chenilles et outils ne créent pas de collisions nouvelles.

## Validation

Contrôles navigateur aux deux formats CSS : aucune erreur console, aucun asset manquant, aucun débordement horizontal. Ce ne sont pas des essais sur téléphone physique. [Mesures navigateur](v035a-r2-rampant/browser-validation.json).

14 SVG valides XML. Construction et contrôle du périmètre réussis : **3 965 fichiers protégés inchangés octet pour octet**, production et historiques compris ; aucun ajout dans src. [Empreintes et résultat](v035a-r2-rampant/scope-validation.json).

**884/884 tests réussis**, aucun échec ou test ignoré, 68,34 s. [Journal](v035a-r2-rampant/tests.txt).

**Arrêt pour validation humaine.** Aucune piste choisie, aucun master final, aucune sprite sheet ou intégration. Aucun gameplay ou asset production modifié. Aucun commit/push.
