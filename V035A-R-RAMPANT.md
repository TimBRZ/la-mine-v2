# V0.35A-R — Rampant : trois silhouettes, aucun choix

13 octobre 2026. **Phase 1 uniquement. Aucune piste sélectionnée, aucun master définitif.** La V0.35A est rejetée visuellement ; ses fichiers restent intacts comme historique et ne sont pas des références validées.

[Galerie](v035a-r-rampant/gallery.html) · [Comparaison avec les références](v035a-r-rampant/captures/comparison.png)

| Piste | Intention et avantage | Limite à juger |
|---|---|---|
| [A — Patins écartés](v035a-r-rampant/rampant-A/rampant-A.svg) | Machine très basse, carter large, quatre appuis carrés et lame frontale. Assise stable, distincte du Rat. | Les quatre appuis peuvent évoquer un crabe ; confirmer la lecture industrielle sans ajouter de détails. |
| [B — Traîneau de galerie](v035a-r-rampant/rampant-B/rampant-B.svg) | Masse longue sur patin, avant biseauté et tronqué. Profil bas, sens frontal clair. | Risque de rapprochement avec un outil de forage ; pas de foret ajouté. |
| [C — Rouleau pousseur](v035a-r-rampant/rampant-C/rampant-C.svg) | Masse compacte, rouleau arrière, sabot frontal ouvert. Propulsion et contact séparés dans le contour. | Le sabot peut évoquer une pince ; il ne promet aucune morsure ou nouvelle attaque. |

Chaque proposition utilise **4 chemins, 3 couleurs** : charbon #10191D, acier #718783 et une seule fente Grisou #82CFA7. Aucun boulon, câble, texture, halo ou détail d’usure. Les aplats monochromes utilisent les mêmes contours. Les références Rat, Foreuse et Foreur de fond sont copiées à l’identique des masters V034A/A.1 ; le héros V033 accompagne la simulation mobile.

## Source de vérité et taille

`src/rift/config.js`, `actors.js`, `art.js`, `src/enemies/registry.js` et `view.js` : 52 PV, vitesse 105 u/s, rayon 14, contact 0,5, apparition 0,85 s, poursuite ondulante, aucune attaque temporisée propre. Cadre 48×48, origine centrée, **sprite fixe sans rotation ni miroir**. Aucun de ces paramètres n’a changé.

L’avant graphique est à droite. Les propositions rendent l’avant/arrière du dessin distincts ; elles ne résolvent pas l’orientation en mouvement du renderer actuel. Les appuis et outils dépassent le disque de collision : ce sont des extensions visuelles sans dégâts propres. Le cadre n’est pas agrandi.

Présentation à 40 px ; cadres réels approximatifs de 34,08 px sur [320×568](v035a-r-rampant/captures/mobile-320.png), 41,6 px sur [390×844](v035a-r-rampant/captures/mobile-390.png). Contrôles Chromium aux dimensions CSS, pas téléphone physique ni run. Le fond est l’export du décor actuel, jamais un master rejeté.

## Validation technique et arrêt

- **884/884 tests réussis**, aucun échec ou test ignoré, 69,25 s. [Journal](v035a-r-rampant/tests.txt).
- Construction réussie ; 14 SVG valides XML. Galerie HTML statique, sans JavaScript applicatif. Contrôle final : aucune erreur console, image manquante ou largeur débordante aux deux formats. [Mesures](v035a-r-rampant/browser-validation.json).
- **3 932 fichiers protégés inchangés octet pour octet** : production, tests, références validées et historique V035A inclus. Aucun fichier ajouté dans src. [Preuve](v035a-r-rampant/scope-validation.json).

Seuls le nouveau dossier et cette note sont créés. Aucun gameplay ou asset de production modifié. Aucun autre ennemi traité, aucune animation, sheet, intégration, sélection automatique ou commit/push. **Arrêt pour choix humain A / B / C ou corrections.**
