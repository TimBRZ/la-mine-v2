# La Mine V2 — V0.38D.1D — Cône de fournaise

Variante A intégrée uniquement pour le pattern ordinaire `furnaceCone` du Maître de Four, en solo et en triple Zone 6. Aucun équilibrage, commit ou push. Four tournant et Four à blanc restent ceux validés sur Android.

## Référence et fidélité

Source finale fournie : `Fiche VFX — Cône de fournaise.png` (1672 × 941).

La texture finale utilise **la matière de cette image**, et non une autre texture de lave. Le grand cône coloré est échantillonné puis remappé dans le secteur exact du jeu. Aucun appel à imagegen.

L’extraction exclut les panneaux, textes, fond et fumée extérieure. La conversion géométrique part de l’origine illustrée (81, 412), d’un arc elliptique de rayons 795 et 455 et d’un demi-angle de 0,5 radian. Elle produit un secteur circulaire de rayon 225 et de demi-angle 0,66. Ce changement de proportions est nécessaire pour respecter la hitbox ; il ne remplace pas le matériau.

| Critère | Référence → master → jeu |
|---|---|
| Palette | Pixels rouge/orange, jaune vif, jaune blanc et rouge sombre de la source conservés ; variation active locale limitée à ±2,5 %. |
| Cellules | Mêmes plaques organiques et mêmes zones sombres, rééchantillonnées dans le secteur réel. Aucun réseau régulier ajouté. |
| Fissures | Réseau jaune d’origine conservé ; pas de bruit ou de grille de remplacement. |
| Cœur | Pointe claire originale ; raccord lumineux très court, inscrit dans le cône, au centre du four. |
| Contour | Liséré jaune/orange recréé à l’intérieur de la limite analytique, continu et stable. |
| Arc terminal | Circulaire à 225 unités, contrairement à la perspective elliptique de la planche. Aucun halo extérieur. |
| Origine | Position du danger reprise directement, sans décalage décoratif ; lave sous le boss, petit raccord et contour au-dessus du boss. |

Contrôle visuel effectué sur le master, le jeu, les zooms et les deux tailles mobiles. La mosaïque et la répartition lumineuse retrouvent la Variante A. Les effets extérieurs de fumée/braises de la planche sont retirés pour ne pas annoncer une portée différente. Les petits points incandescents présents dans la matière sont conservés ; aucun émetteur de particules supplémentaire.

## Architecture

Nouveaux fichiers de production :

- `src/furnace-cone-vfx.js` : chargement, validation, sélection stricte, animation, contour et nettoyage.
- `src/assets/furnace-cone-v038d1d/cone-a.png` : atlas compact versionné.
- `scripts/build-furnace-cone-v038d1d.mjs` : production reproductible depuis la référence fournie, par rééchantillonnage Canvas hors jeu.

Trois raccords dans les fichiers existants :

- `src/room-scene.js` : préchargement de l’atlas.
- `src/arena-view.js` : création du renderer, début de frame et passage au dessin de Forge.
- `src/forge/art.js` : interception du seul cône reconnu ; sinon rendu précédent.

Le PNG est chargé directement : aucun SVG, shader, calcul de texture ou lecture de la référence pendant une partie. La référence et le master de comparaison sont uniquement dans la galerie de production.

Pool : **1 Image Phaser**, **1 Graphics de contour local**, **1 Graphics non affiché pour le masque d’arène**, **1 GeometryMask**, **1 texture partagée**. Aucun objet créé par danger. Le contour est reconstruit seulement au changement de phase ; ses transformations suivent le danger.

Profondeurs : lave **7,9**, télégraphes existants **8**, boss **15**, contour/raccord **16**, héros **20**, arme **21**. La lave reste au sol. Le clignotement d’invulnérabilité du héros reste celui du jeu.

## Géométrie et simulation conservées

| Valeur | Valeur réelle inchangée |
|---|---|
| Portée | 225 unités |
| Demi-angle | 0,66 radian |
| Ouverture totale | 1,32 radian = 75,63042895726866° |
| Origine | `h.x`, `h.y`, issus de la mobilité réelle du boss |
| Orientation | `h.angle`, sans interpolation ni suivi visuel supplémentaire |
| Suivi initial | 0,35 s de temps du plan |
| Vitesse angulaire de suivi | Borne ±0,65 rad/s |
| Télégraphe | 1,4 s ; 1,316 s sous 50 % PV |
| Actif | 0,65 s |
| Fin du plan | 2,10 s ; 2,016 s sous 50 % PV |
| Récupération | 1,1 s ; 0,95 s sous 50 % PV |
| Extinction de hazard | 0,3 s existante, sans dégâts |
| Dégâts | 0,5 |
| Mobilité | `ATTACK_LOCKED_DIRECTION`, facteur 0,35, vitesse 32,2 unités/s, parcours plafonné à 80 |

Après le verrouillage, **la direction reste fixe mais l’origine reste mobile** conformément au gameplay existant. Les éventuels délais d’admission du directeur restent inchangés.

La collision utilise toujours le rayon du héros (13). Un centre posé sur le contour peut donc être touché. Les captures « hors du bord » placent le corps entier hors du secteur ; « hors portée » place le centre au-delà de 225 + 13. Aucun guide graphique ne promet une zone sûre incompatible avec cette collision.

Contour critique : trait de 1,2 unité, décalé de 0,6 vers l’intérieur. Rayon de son axe 224,4 ; bord externe à 225. Les deux côtés et l’apex sont également rentrés d’un demi-trait. Masque d’arène inchangé : x 28–422, y 116–666.

## Images et animation

Atlas 3 colonnes × 2 lignes ; cellules **230 × 280**, origine locale **(2, 140)**.

- Images 0–3 : actives, boucle de **0,8 s**, 0,2 s par image.
- Image 4 : annonce rouge sombre, intensité progressive de 0,23 à 0,70.
- Image 5 : extinction sombre, alpha 0,30 puis décroissance selon le `cooling` existant.
- Mode mouvement réduit : image active 0.

Seule la lumière varie. Les cellules ne se déplacent pas, le contour ne pulse pas, l’angle et la portée ne changent pas.

Le rééchantillonnage est effectué à trois fois la résolution, puis réduit et **remasqué à la résolution native** pour éliminer les franges du filtre. Contrôle raster : aucun pixel au-delà de la tolérance d’anticrénelage d’un pixel ; alpha identique entre les quatre images actives.

## Poids, mémoire et performance

Atlas final : **420 731 octets** (410,87 Kio).

Dimensions : 690 × 560. Mémoire RGBA8 théorique : **1 545 600 octets**, soit **1,47 Mio**, hors surcoûts de décodage, pilote et moteur. Les cellules épousent la boîte du secteur, pas une grande image d’arène vide.

Mesures Chrome local, WebGL via SwiftShader ; ces valeurs ne représentent pas le GPU d’un téléphone Android :

| Mesure | Médiane | p95 |
|---|---:|---:|
| Mise à jour du renderer VFX seul | ≈ 0,001 ms | ≈ 0,001 ms |
| Scène solo, nouveau rendu | 0,70 ms | 1,50 ms |
| Scène solo, rendu précédent | 0,60 ms | 1,00 ms |
| Scène triple, nouveau rendu | 1,20 ms | 1,70 ms |
| Scène triple, rendu précédent | 1,00 ms | 1,30 ms |

Mesure VFX sur 60 lots de 100 appels après échauffement ; scène complète sur 120 appels après échauffement. Mesure CPU de soumission, pas un temps GPU ni une preuve de 60 FPS sur Android.

Sur **40 000 appels** : objets de scène **277 → 277**, même sprite et même buffer de contour. Heap retenu après GC : **−9 676 octets**. Échantillonnage des allocations : **1 117 984 octets** cumulés, intervalle de 32 768 octets ; il existe des allocations transitoires, sans croissance retenue observée. Pas de revendication « zéro allocation ».

## Fallback et périmètre

Si la texture manque, a une taille incorrecte, une coupe invalide ou une source incohérente, le renderer retourne `false` et le cône procédural existant est dessiné. Même résultat si la géométrie ne correspond pas, si l’auteur est mort/étranger, ou si plusieurs cônes incompatibles apparaissent. Le gameplay reste inchangé.

Interception limitée à : monde Forge, danger de donjon thermique, style Maître de Four, plan `furnaceCone`, forme cône, rayon 225, spread 0,66, auteur Maître de Four vivant.

Le cône final du plan `whiteFurnace` reste entièrement sur son ancien rendu. Four tournant, Four à blanc, Secteurs de chauffe, Marche à blanc, Marteau-Pilon, Chaudière, hitboxes, dégâts, timings, cooldowns, fréquence, mobilité et directeur ne sont pas modifiés.

## Vérifications

Suite complète : **1 833 / 1 833**, aucun échec, aucun test ignoré. Baseline **1 810** conservée ; **23 nouveaux tests**.

Les tests supplémentaires vérifient : asset et coupes, sept défauts de fallback, géométrie/timings aux deux niveaux de PV, suivi borné puis verrouillage, origine mobile, images et phases, contour et arc, collisions avec le rayon du héros, exclusions de patterns, entrées invalides, replays complets solo/triple, pool, nettoyage et récupération après perte de texture.

Les assertions de tous les anciens fichiers `.test.js` sont inchangées, vérifiées par SHA-256. Les sources antérieures sont également inchangées après retrait des trois raccords de présentation exacts. L’adaptateur `tests/whitehot-visual-delta.js` compose le nouveau delta ; `tests/cone-visual-delta.js` déclare les deux nouveaux fichiers dans l’inventaire historique en mémoire, sans réécrire les assertions ni le fichier d’inventaire gelé.

Vérifications navigateur :

- **320 × 568 et 390 × 844**, sans débordement horizontal.
- Annonce, chauffe, suivi, instant du verrouillage, après verrouillage, début/milieu/dernière image active, extinction et nettoyage.
- Joueur au centre, sur un côté, juste hors du côté, sur l’arc, hors portée et près de l’origine.
- Triple Zone 6 via le directeur réel, sans contournement de l’admission.
- **8 comparaisons de captures strictement identiques** pour les patterns exclus : Four tournant, Secteurs de chauffe, Marche à blanc et cône final de Four à blanc, sur les deux formats.
- Texture volontairement bloquée au chargement : capture strictement identique au fallback précédent.
- Aucune erreur JavaScript observée.
- Mort du boss : aucun danger restant, sprite et contour masqués.

Le banc étend les PV et suspend l’arme pour rendre les scénarios inspectables ; la simulation, les collisions et les renderers sont ceux de production. Les sondes de position figent le temps, sans avance de dégâts.

## Livrables et Android physique

- Galerie : `production-v038d1d-cone-fournaise/gallery.html`
- Banc interactif : `production-v038d1d-cone-fournaise/observe.html`
- Master : `production-v038d1d-cone-fournaise/assets/master-a.png`
- Référence conservée : `production-v038d1d-cone-fournaise/assets/reference-variante-a.png`
- Captures : `production-v038d1d-cone-fournaise/captures/`
- Résultats : `notes/browser.json`, `notes/performance.json`, `notes/full-tests.txt` dans la galerie.

Serveur de revue local : `http://127.0.0.1:5235/production-v038d1d-cone-fournaise/gallery.html`.

Reste à valider sur Android physique : chargement du PNG, netteté du contour avec le GPU réel, visibilité du héros pendant le clignotement existant, fluidité thermique sur une session longue et lisibilité des hazards simultanés du triple au doigt. Les tailles mobiles vérifiées ici sont des viewports Chrome locaux, pas une validation matérielle Android.

Arrêt à V0.38D.1D. **Aucun commit, aucun push, aucun pattern suivant commencé.**
