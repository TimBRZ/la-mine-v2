# La Mine V2 — V0.38D.1B — Four tournant, Version B

La Version B est intégrée au seul pattern `furnaceTurn` du Maître de Four. Les deux bras utilisent un matériau métallique incandescent, des extrémités arrondies complètes et un contour continu. Le gameplay et les autres rendus restent inchangés.

Validation du 20 octobre 2026 : **1 786 / 1 786 tests**, soit les **1 757 existants + 29 nouveaux**, sans test ignoré. Aucun commit ni push.

## Livrables

- [Galerie de production](production-v038d1b-four-tournant/gallery.html)
- [Banc interactif](production-v038d1b-four-tournant/observe.html)
- [Asset versionné](src/assets/furnace-rotating-arm-v038d1b/arm-b.svg)
- [Référence absolue Version B](production-four-tournant-version-b/four-tournant-version-b.png)
- [Audit d’origine](V038D1-MAITRE-DE-FOUR-VFX-AUDIT.md)
- [Résultat intégral des tests](production-v038d1b-four-tournant/notes/full-tests.txt)
- [Preuves navigateur, alignement et pixels](production-v038d1b-four-tournant/notes/browser.json)
- [CPU, allocations et mémoire](production-v038d1b-four-tournant/notes/performance-extra.json)

Galerie locale : `http://127.0.0.1:5233/production-v038d1b-four-tournant/gallery.html`.

## Style et géométrie

La planche définit le style : métal sombre, bagues industrielles, cœur jaune/orange, caps chauds et volumes simples. L’asset vectoriel est construit à la géométrie du jeu ; les miniatures 40/56/84 px de la planche ne déterminent aucune dimension technique.

| Propriété | Valeur conservée |
|---|---|
| Bras | 2 capsules opposées à π radians |
| Segment de chaque capsule | 145 unités |
| Rayon / largeur totale | 14 / 28 unités |
| Enveloppe locale d’un bras | x = −14 à 159, y = −14 à 14 |
| Origine | Centre actuel du danger, issu du déplacement du boss |
| Rotation active | +0,42 ou −0,42 rad/s, signe existant |
| Annonce | 1,4 s ; 1,316 s en phase basse |
| Danger actif | 2,5 s |
| Dégâts | 0,5 |
| Mobilité du plan | 32,2 unités/s, budget et contraintes existants |
| Récupération | 1,1 s ; 0,95 s en phase basse |

Une cellule mesure 177 × 32 unités et possède 2 unités de marge transparente. Le segment commence en (16,16), finit en (161,16), et les caps atteignent x=2 et x=175. L’origine du sprite vaut `(16/177, 0.5)`. Le moteur affiche la cellule à 177 × 32 et lui applique directement `h.x`, `h.y`, `h.angle`.

Pour tout point local `(u,v)`, sa position est :

```text
x = h.x + cos(h.angle) × (u − 16) − sin(h.angle) × (v − 16)
y = h.y + sin(h.angle) × (u − 16) + cos(h.angle) × (v − 16)
```

Il n’y a ni interpolation, ni seconde horloge de rotation, ni pulsation de taille. Le refroidissement suit le dernier centre du danger, conformément au comportement existant.

Les caps intérieurs sont dessinés aussi : ils se recouvrent au centre. Le contour supérieur représente l’extérieur de leur union, sans fausse séparation ni trou central. Le sprite existant du boss constitue l’ancrage compact. Aucun disque lumineux ne remplit les zones sûres.

## Architecture et phases

`FurnaceArmView` possède un pool fixe de **2 images**, **1 texture**, **1 Graphics de contours** et **1 Graphics de masque non affiché**, avec un masque géométrique partagé. La texture est chargée une seule fois puis découpée en six cellules.

Les aplats se trouvent à la profondeur 7,9, sous les télégraphes existants. Le contour est à 16, au-dessus du boss (15), sous le héros (20) et son arme (21). Le héros conserve sa priorité visuelle. Le masque respecte les limites existantes de l’arène ; il coupe les portions extérieures non accessibles.

Le renderer n’accepte que la paire complète et cohérente du Maître de Four : monde Forge, propriétaire vivant, `planId=furnaceTurn`, type capsule, longueur/rayon/vitesse attendus, même attaque, même phase, même centre et opposition correcte. Il n’emprunte aucun asset au Chauffeur, au Scorificateur, aux autres boss ou au joueur.

| Phase | Rendu |
|---|---|
| Annonce | Cellule 4, intérieur chaud à 8 %, contour discret, petites flèches tangentielles |
| Actif | Cellules 0–3, métal sombre, intérieur incandescent et caps lumineux |
| Animation | 4 images en boucle de 0,8 s ; variation intérieure uniquement |
| Mouvement réduit | Image active 0, rotation gameplay conservée |
| Refroidissement | Cellule 5, brun atténué selon le temps existant, sans flèches |
| Fin / mort / changement de monde | Images masquées, contours vidés, références réinitialisées |
| Arrêt de scène | Destruction idempotente du pool, du contour et du masque |

Les contours des deux bras sont mémorisés en coordonnées locales. Leur reconstruction n’a lieu qu’au changement de phase ou de signe de rotation. Leur position et leur angle suivent la première capsule, l’autre restant opposée. Le buffer de 148 commandes est réutilisé.

## Asset et coûts

| Élément | Mesure |
|---|---|
| Fichier | `furnace-rotating-arm-v038d1b/arm-b.svg` |
| Poids disque SVG | **6 513 octets** |
| Module renderer | 6 364 octets |
| Rasterisation au chargement | 2 124 × 64 px, résolution ×2 |
| Cellule | 354 × 64 px |
| Mémoire RGBA du raster | **543 744 octets = 531 Kio** |
| Copies du matériau | 2 sprites partageant la même texture |
| Filtres / shaders spécifiques | Aucun |
| Rotation pré-rendue | Aucune |

La mémoire RGBA donnée est celle d’un raster RGBA8, pas une mesure du processus entier. Le navigateur peut conserver le raster source ainsi que la copie GPU ; deux copies représenteraient environ 1,04 Mio, auxquels s’ajoutent les structures du moteur. Le banc de bureau expose une limite de texture de 8 192 px. Vérifier la compatibilité et le chargement de cet atlas de 2 124 px sur l’appareil Android cible.

### CPU

Mesures locales dans Chrome de bureau headless avec WebGL/SwiftShader, viewport 390 × 844, sans mesure GPU synchronisée. Ce ne sont pas des résultats Android.

| Mesure | Médiane | P95 |
|---|---:|---:|
| Mise à jour du nouveau renderer, viewport 320 × 568 | 0,002 ms | 0,004 ms |
| Mise à jour du nouveau renderer, viewport 390 × 844 | 0,001 ms | 0,002 ms |
| Dessin des acteurs + soumission de la scène solo, Version B | 0,5 ms | 1,0 ms |
| Même scène solo, ancien rendu | 0,4 ms | 0,8 ms |
| Dessin des acteurs + soumission de la scène triple, Version B | 0,9 ms | 1,7 ms |
| Même scène triple, ancien rendu | 0,7 ms | 1,2 ms |

Le premier micro-benchmark utilise 1 000 échauffements puis 60 lots de 100 appels. Le second utilise 60 échauffements puis 120 soumissions par cas, sans avancer la simulation. Il inclut les autres acteurs et la préparation du moteur ; il ne mesure pas exclusivement le VFX et ne garantit pas un débit d’images sur téléphone.

### Allocations et nettoyage

Sur 40 000 appels en triple boss, les références des deux sprites et du buffer restent stables ; le nombre d’objets de scène reste **272 → 272**. Aucun objet de scène, tableau applicatif ou texture n’est créé à chaque mise à jour.

Le profil d’allocation Chrome, échantillonné tous les 32 Kio et incluant les objets collectés, estime **8 830 816 octets temporaires sur 40 000 appels**, soit environ **221 octets/appel**. Ces allocations résiduelles proviennent des setters, des nombres et du moteur ainsi que du banc ; « zéro allocation JavaScript » n’est donc pas revendiqué. La mise en cache évite de régénérer les chemins et flèches chaque image.

Après collecte, l’écart de heap observé vaut **79 196 octets**, incluant instrumentation et compilation. Ce seul échantillon n’est pas une preuve de fuite. Le stockage sous-jacent reste stable. Après mort du boss, le navigateur confirme **0 danger, 0 sprite visible, 0 commande de contour**.

## Repli

Si l’asset est absent, de dimensions incorrectes ou si une cellule est invalide, **les deux bras** repassent sur le dessin procédural préexistant. Aucun mélange de bras ancien/nouveau. Un chargement tardif valide récupère le pool sans le recréer.

Le repli a été testé avec sept défauts de texture et avec une requête réellement bloquée dans Chrome. Les commandes de l’ancien rendu sont comparées à l’identique. Le pattern conserve ses collisions, timings et dégâts. Limite assumée : ce repli conserve aussi le défaut visuel P0 de l’ancien rendu aux caps ; c’est le comportement de secours explicitement demandé.

## Preuves visuelles

**60 captures de contrôle**, soit 30 par format **320 × 568** et **390 × 844**, plus un master isolé et une capture d’échec de chargement. Les images avant/après sont prises au même instant sans avancer le gameplay entre les deux.

La galerie couvre annonce, activation, quatre images actives, fin, nettoyage, boss immobilisé puis mobile, cible déplacée, sens inverse, joueur près d’une extrémité, zone sûre, joueur près du centre, caps ×3, debug, bord de l’arène, triple Zone 6 et les trois combos existants.

La superposition debug trace la capsule analytique en magenta, l’axe et le centre en cyan, le centre de la calotte extérieure en blanc. Le cercle cyan du joueur représente son rayon de collision : le contact peut donc commencer avant que son centre ne pénètre dans la capsule.

Résultats navigateur, par format :

- 269 images de suivi de l’attaque contrôlées dans une séquence de 600 pas.
- Écart de position sprite/danger : **0 unité**.
- Écart angulaire modulo 2π : **1,133 × 10⁻¹⁵ rad** au maximum, dû à la normalisation flottante de Phaser.
- Écart d’opposition et de position locale du cap : **0**.
- Déplacement et changement de direction observés dans la séquence réelle du directeur.
- **0 erreur console** sur les captures normales. Le test de panne produit intentionnellement une erreur de chargement.

Le raster réel fourni par Phaser a été relu pixel par pixel : aucune présence significative au-delà du rayon 14,5 (tolérance d’anticrénelage de 0,5 unité), aucun pixel actif manquant dans le rayon 13,5, caps intérieur et extérieur opaques, alpha strictement identique entre les quatre images actives.

**Quart / demi / tour complet :** ce sont des poses isolées du renderer à 90°, 180° et 360°, explicitement marquées dans le banc et la galerie. Le balayage actif réel vaut 0,42 × 2,5 = 1,05 rad, soit environ 60,2°. Il n’a pas été prolongé artificiellement.

**Triple :** Four tournant est admis par le vrai directeur avec le Pilon et la Chaudière. Pression de forge, Marteau à blanc et Cadence de pression sont contrôlés séparément ; aucun combo n’est forcé en concurrence avec un plan incompatible. Règles d’admission, budgets et rendus des combos sont conservés.

## Tests et invariants

Commande finale : `npm test`. Résultat : **1 786 tests, 1 786 réussis, 0 échec, 0 ignoré**.

Les 29 nouveaux tests couvrent le chargement, le découpage et le poids de l’asset, le repli, les deux capsules, leurs caps, six orientations, le sens des flèches, les zones sûres, les phases, la mobilité, les replays solo/triple dans les deux sens, le nettoyage, le chargement tardif et le cache des contours.

Les sources présentes avant cette étape sont contrôlées par empreinte. Seuls les trois branchements de présentation ci-dessous sont soustraits par un adaptateur exact avant comparaison. **Toutes les assertions des fichiers `.test.js` antérieurs restent inchangées.** Les adaptateurs historiques de validation ne désactivent pas les contrôles : ils retirent uniquement les insertions connues et exigent qu’elles soient présentes exactement une fois.

Le premier essai de suite complète dans le bac à sable a rencontré des refus réseau `EACCES` sur les serveurs de test locaux. La suite finale a été relancée avec accès localhost et a entièrement réussi.

## Fichiers

### Production

- Ajout `src/assets/furnace-rotating-arm-v038d1b/arm-b.svg`.
- Ajout `src/furnace-rotating-arm-vfx.js`.
- `src/room-scene.js` : import et préchargement.
- `src/arena-view.js` : création du renderer, préparation par frame et passage au rendu Forge.
- `src/forge/art.js` : interception de la paire admissible ; chemin historique conservé pour le reste.
- Ajout `scripts/build-furnace-turn-v038d1b.mjs` : génération reproductible du SVG.

Aucune modification de `boss-patterns.js`, `boss-mobility.js`, du directeur, des collisions, des dégâts, des cooldowns ou du catalogue de boss. Four à blanc, Cône de fournaise, Secteurs de chauffe et Marche à blanc ne sont pas modifiés.

### Vérification et documentation

- Ajouts `tests/furnace-rotating-arm-v038d1b.test.js`, `tests/furnace-turn-before-v038d1b.json`, `tests/furnace-turn-visual-delta.js`.
- `tests/rivet-impact-visual-delta.js` : raccord de l’adaptateur exact.
- `tests/v038b3-authorized-files.js` : autorisation des deux nouveaux fichiers source.
- `production-v038d1b-four-tournant/` : galerie, banc, serveur local, scripts de capture/mesure, preuves.
- Le présent rapport.

Les dossiers `production-*` sont déjà ignorés par le dépôt ; leurs livrables restent disponibles localement. Le rapport d’audit antérieur est préservé.

## Validation Android physique restante

1. Sur le même réseau local, démarrer le serveur depuis la racine avec `node production-v038d1b-four-tournant/serve.mjs --lan` après avoir arrêté sa version localhost si le port 5233 est occupé.
2. Ouvrir `http://<IP-du-PC>:5233/production-v038d1b-four-tournant/gallery.html`, puis le banc interactif.
3. Vérifier le chargement SVG et sa limite de texture sur le GPU cible, l’absence de repli involontaire et les deux bras visibles.
4. Lire les caps et le sens de rotation en mouvement, à luminosité réelle, en solo et en triple. Vérifier le héros au centre, aux extrémités et dans les zones sûres.
5. Dans le jeu normal, contrôler le déplacement au doigt, les collisions, les transitions de vague et les phases de combat. Le banc d’observation prolonge les PV et suspend l’arme ; il ne remplace pas ce passage.
6. Mesurer fluidité, pointes de temps d’image, chauffe et mémoire sur plusieurs minutes, puis mise en arrière-plan/reprise et changement d’orientation.
7. Confirmer le nettoyage après mort, relance et changement de zone, ainsi que le repli en cas de chargement interrompu.

L’étape s’arrête ici : seul Four tournant Version B est intégré, aucun chantier suivant engagé.
