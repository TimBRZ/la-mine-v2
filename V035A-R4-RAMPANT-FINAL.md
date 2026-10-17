# Rampant de Grisou — master final issu de B1

**Choix humain : B1, mini-haveuse chenillée, outil frontal légèrement avancé et agrandi.** Le master R4 est livré pour validation de son nettoyage final. Une seule version ; aucun nouveau concept ni variante supplémentaire.

Petite mini-haveuse chenillée agressive alimentée au Grisou.

[Galerie](v035a-r4-rampant-final/gallery.html) · [Master SVG 1024 px](v035a-r4-rampant-final/master/rampant-final.svg) · [Silhouette](v035a-r4-rampant-final/silhouette/rampant-final.svg) · [B0 / B1 / final](v035a-r4-rampant-final/comparaisons/evolution.html) · [Références](v035a-r4-rampant-final/comparaisons/famille.svg)

## Nettoyage et proportions

Le châssis de B1 est conservé : corps bas, deux chenilles, bras court et tambour transversal à droite. Le tambour conserve son décalage de **+3 unités X, +1 Y et son échelle 1,06**, autour de (103,60) dans le dessin 128×128. Aucun agrandissement global. Cadre proposé 48×48 dans le monde, origine centrale et collision r14 inchangées dans le jeu.

- Deux repères larges par chenille remplacent les trois divisions ; pas de maillons individuels.
- Le contour du tambour passe de 16 à 14 sommets : crans secondaires retirés, mêmes extrêmes de silhouette, rainure de coupe et arête claire conservées.
- La ligne claire du capot est retirée ; elle faisait doublon avec l'arête utile du tambour.
- La fente devient une petite chambre de Grisou encastrée, 22×10 unités, contour 2 unités. Son intérieur visible reste limité à 20×8 unités, sans halo ni conduit ajouté.
- Contours structurels 4 unités, raccords et extrémités arrondis ; la chambre reste un détail secondaire. Bras, pivot mécanique et surfaces principales alignés sur B1.

Le SVG contient 15 formes élémentaires. L'outil explique le contact sans dents géantes ni apparence organique. Les deux chenilles racontent la propulsion ; la seule chambre colorée raconte l'alimentation. Avant à droite, arrière plat à gauche.

## Palette

| Fonction | Couleur |
|---|---|
| Charbon / contours / chenilles | `#10191D` |
| Acier mat | `#718783` |
| Ocre chantier | `#B3944F` |
| Grisou, uniquement la chambre | `#82CFA7` |
| Arête claire minimale | `#F0ECDF` |

Cinq aplats, sans texture, gradient, aura ou effet lumineux diffus. La silhouette monochrome utilise exactement les mêmes formes, en crème uniforme sur fond sombre.

## Lecture mobile et comparaison

[320×568](v035a-r4-rampant-final/captures/mobile-320.jpg) · [390×844](v035a-r4-rampant-final/captures/mobile-390.jpg) · [Échantillons 34 / 40 / 42 / 48 px](v035a-r4-rampant-final/mobile/taille-jeu.html) · [Comparaison B1 → final](v035a-r4-rampant-final/captures/B1-vers-final.jpg)

Les vues reprennent le fond Zone 4 existant. Rat, Foreuse autonome, Foreur de fond et héros sont copiés sans retouche. La planche conserve leurs cadres respectifs et propose des silhouettes voisines. Le Rat demeure organique, les deux foreuses portent un cône, le Rampant un tambour transversal, le héros une silhouette verticale.

Le cadre monde 48×48 devient environ 34 px sur 320 et 42 px sur 390 ; le dessin n'occupe pas tout le cadre transparent. À 34 px, la chambre est un accent de quelques pixels, pas un détail à lire. Les chenilles et le tambour portent donc l'identité principale. Les crans ne doivent pas recevoir de détails supplémentaires dans la future sheet.

Vérification dans Chromium aux dimensions demandées, **pas sur un Android physique ni dans une run**. Les vues restent statiques. La vérification de collision visuelle en mouvement appartient à une future étape d'intégration, non commencée ici.

## Préparation future animation — aucune frame créée

Les groupes SVG séparent `chenille-lointaine`, `carter`, `chambre-grisou`, `bras`, `tambour` et `chenille-proche`.

| Élément / état | Recommandation ultérieure |
|---|---|
| Chenilles | Faire défiler les deux repères internes ; maintenir le contour externe et les appuis. Aucun maillon supplémentaire. |
| Tambour | Suggérer la rotation par la rainure interne et l'arête, sans rotation complète du contour transversal ni changement d'enveloppe. |
| Moteur | Très petite vibration interne du carter, sans déplacer le pivot logique ou l'ombre. |
| Chambre de Grisou | Rester solidaire du carter ; éventuelle vibration contenue. Aucun conduit flottant, halo ou émission permanente. |
| Préparation d'attaque | Le Rampant actuel est une menace de contact en poursuite, sans attaque temporisée propre. Ne pas inventer de télégraphe, arrêt ou délai de dégâts. Une tension visuelle éventuelle devra suivre les états existants uniquement. |
| Hit | Réaction brève interne, sans déplacement de hitbox ni interruption logique supplémentaire. |
| Mort | Arrêt des chenilles et du tambour, extinction de la chambre, affaissement contenu. Durée et disparition à synchroniser avec le système existant, sans nouvelle explosion ou zone. |

Conserver le cadre 48×48, le centre, les statistiques, le comportement et l'orientation du renderer actuel. L'outil dépasse visuellement le disque de collision comme dans B1 ; il ne donne aucune portée supplémentaire. Ne pas ajouter de flip ou de rotation runtime à cette étape.

## Validation et arrêt

**884/884 tests réussis**, aucun échec, aucun ignoré, 49,52 s. [Journal](v035a-r4-rampant-final/tests.txt). La première exécution avait été bloquée par les permissions réseau locales du bac à sable ; la relance autorisée a passé toute la suite sans modification des tests.

**4 582 fichiers préexistants inchangés octet pour octet**, aucun ajout dans `src`, références B0/B1 et ennemis identiques. [Vérification](v035a-r4-rampant-final/scope-validation.json). Tous les SVG produits sont valides XML. Aucun script, asset externe ou animation dans le master.

Galerie et vues mobiles : images chargées, aucun débordement horizontal, aucune erreur ni avertissement console. [Mesures navigateur](v035a-r4-rampant-final/browser-validation.json).

Seuls le dossier `v035a-r4-rampant-final/` et ce document sont ajoutés. Gameplay et assets production inchangés, historiques conservés. Cracheur et Éclateur non traités. Aucune sprite sheet, intégration, modification CGWeb, commit ou push. **Arrêt pour validation humaine du master R4.**
