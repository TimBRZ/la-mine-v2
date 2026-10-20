# La Mine V2 — V0.38D.1C — Four à blanc

**Variante A « Contraste simple » intégrée aux deux vagues de plaques et à leurs passages froids. Le cône final est conservé intégralement.**

Validation du 20 octobre 2026 : **1 810 / 1 810 tests** — les **1 786 existants conservés + 24 nouveaux**, aucun échec ni test ignoré. Aucun commit ni push.

## Livrables

- [Galerie](production-v038d1c-four-a-blanc/gallery.html)
- [Banc interactif](production-v038d1c-four-a-blanc/observe.html)
- [Référence Variante A](production-v038d1c-four-a-blanc/assets/reference-variante-a.png)
- [Atlas de production](src/assets/furnace-whitehot-plates-v038d1c/plates-a.svg)
- [Audit précédent](V038D1-MAITRE-DE-FOUR-VFX-AUDIT.md)
- [Tests complets](production-v038d1c-four-a-blanc/notes/full-tests.txt)
- [Captures, géométrie, timings et identité du cône](production-v038d1c-four-a-blanc/notes/browser.json)
- [Mesures CPU, allocations et pixels froids](production-v038d1c-four-a-blanc/notes/performance.json)

Adresse locale : `http://127.0.0.1:5234/production-v038d1c-four-a-blanc/gallery.html`.

## 1. Audit technique avant intégration

Sources relues : `src/forge/boss-patterns.js`, `boss-director.js`, `boss-mobility.js`, `boss-view.js`, `geometry.js`, `combat.js`, `src/config.js` et `src/player.js`.

Le plan `whiteFurnace` contient **deux groupes de trois rectangles**, puis un cône. La référence visuelle représente des secteurs radiaux ; seule sa direction artistique est transposée. Aucune disposition circulaire n’a été introduite.

### Géométrie des plaques

Toutes les plaques occupent x=28…422, largeur **394**, centre x=225. Les dimensions ci-dessous sont celles des hazards et des collisions.

| Vague | Index | Centre y | Hauteur | Bord haut | Bord bas |
|---|---:|---:|---:|---:|---:|
| 1 | 0 | 178 | 124 | 116 | 240 |
| 1 | 1 | 390 | 110 | 335 | 445 |
| 1 | 2 | 606 | 120 | 546 | 666 |
| 2 | 0 | 153 | 74 | 116 | 190 |
| 2 | 1 | 350 | 110 | 295 | 405 |
| 2 | 2 | 576 | 180 | 486 | 666 |

L’arène va de (28,116) à (422,666). Les plaques atteignent exactement ses murs latéraux. Le centre du joueur est clampé aux murs avec son rayon.

### Collision et volume du joueur

Le rayon pertinent du joueur vaut **13 unités**. Pour une plaque, le code teste :

```js
Math.abs(player.x - plate.x) < plate.w / 2 + player.radius
&& Math.abs(player.y - plate.y) < plate.h / 2 + player.radius
```

Il s’agit d’une intersection par rectangle élargi sur les deux axes, avec comparaisons strictes. Ce n’est pas une collision avec les coins arrondis d’un rectangle, ni un simple point au centre du personnage. Le debug montre donc le cercle de rayon 13 et le carré correspondant à cette comparaison sur les axes.

### Passages bruts et positions sûres du centre

| Vague / passage | Bande brute y | Épaisseur brute | Centre joueur sûr y | Épaisseur utile |
|---|---|---:|---|---:|
| 1 haut | 240…335 | 95 | 253…322 | **69** |
| 1 bas | 445…546 | 101 | 458…533 | **75** |
| 2 haut | 190…295 | 105 | 203…282 | **79** |
| 2 bas | 405…486 | 81 | 418…473 | **55** |

Le centre peut occuper x=**41…409**, soit 368 unités de largeur. Les limites y indiquées sont incluses grâce aux comparaisons strictes du prédicat ; le trait de présentation est placé à l’intérieur de cette région.

L’ancien rendu utilisait un retrait de **4 unités**, au lieu de 13. Exemple : le centre à (225,249) apparaissait dans la bande verte de vague 1, mais le corps touchait la plaque se terminant à y=240. Il manquait **9 unités de retrait par bord** pour que ce marquage puisse promettre une position sûre du centre.

### Condition, timings et transitions

L’ultime est choisi au prochain créneau libre si le boss est solo (`!final`), ne l’a pas encore utilisé et possède au plus 25 % de ses PV. Il n’interrompt pas le plan courant. La réduction de préavis de phase basse, facteur 0,94, s’applique donc dans le cas naturel. `ultimateUsed`, fréquence et admission restent inchangés.

| Étape | Départ planifié | Annonce réelle | Durée active | Plage active nominale |
|---|---:|---:|---:|---|
| Vague 1 | 0 | 1,786 s | 0,65 s | 1,786…2,436 s |
| Vague 2 | 2,9 s | 1,786 s | 0,65 s | 4,686…5,336 s |
| Cône final | 5,8 s | 1,363 s | 0,60 s | 7,163…7,763 s |

Les valeurs de préavis avant facteur de phase basse sont 1,9 / 1,9 / 1,45 s. L’extinction dure **0,30 s** selon l’horloge existante. Les deux vagues ne coexistent pas nominalement. Chaque extinction laisse ensuite un intervalle neutre nominal de **0,164 s** avant l’annonce suivante.

Fin nominale du plan : **7,813 s**, récupération **1,50 s**. Le boss est statique durant l’ultime (`ATTACK_STATIC`, vitesse 0), sans suivi de cible. Les dégâts restent à **0,5**. Les éventuels reports d’admission restent entièrement gérés par le directeur existant ; le renderer lit les hazards admis.

Mesures à 60 Hz : activation vague 1 **1,800 s**, extinction **2,450 s**, disparition **2,767 s**, annonce vague 2 **2,917 s**, activation **4,700 s**, extinction **5,350 s**, disparition **5,667 s**, annonce cône **5,817 s**, activation **7,167 s**, extinction **7,767 s**, disparition **8,083 s**. Les petits écarts viennent des pas de simulation et de l’ordre de mise à jour existants.

## 2. Correction visuelle des passages

La plaque conserve exactement son rectangle dangereux. Le fond chaud et toutes les lignes chaudes restent à l’intérieur.

Entre deux plaques :

1. La bande brute reçoit un métal **gris neutre**, avec de petites hachures dans les marges réservées au corps.
2. Seule la région admissible pour le **centre** reçoit le métal **bleu sombre**, délimitée par un trait froid discret.
3. Ce couloir est calculé avec le rayon actuel de `run.player.radius`, et non un retrait décoratif constant.

Formules :

```text
centreTop    = upper.y + upper.h / 2 + player.radius
centreBottom = lower.y - lower.h / 2 - player.radius
centreLeft   = ROOM.left + player.radius
centreRight  = ROOM.right - player.radius
```

Le trait froid de largeur 1 est centré à 0,5 unité à l’intérieur : il ne déborde pas sur une position de centre dangereuse. Les marges grises peuvent accueillir une partie du corps, mais ne promettent pas que son centre peut s’y placer.

La région indiquée est sûre **vis-à-vis de ces plaques**. Le contact avec un boss ou un autre danger conserve ses propres règles. Aucun changement de collision, agrandissement de passage ou réduction de plaque.

Les deux couloirs restent de largeur, position et couleur fixes pendant l’annonce et l’actif. Ils disparaissent à l’extinction ; aucun ancien marquage ne persiste sur la vague suivante. La couleur du matériau éteint devient immédiatement grise, puis s’efface.

## 3. Architecture et asset

Nouveau module : `src/furnace-whitehot-plates-vfx.js`, classe `WhitehotPlatesView`.

L’asset est un atlas vectoriel versionné à **six cellules de 394 × 180** :

- 0–3 : quatre images actives, différences légères de luminosité des fissures ;
- 4 : matériau rouge sombre d’annonce ;
- 5 : matériau gris d’extinction.

Atlas **788 × 540 px**, deux colonnes, trois rangées. Il représente un matériau de plaque réutilisable ; aucune texture globale de l’arène n’est créée.

### Dimensions variables sans déformation

Les trois sprites gardent une échelle 1:1 et une taille source de 394 × 180. Pour une plaque de hauteur `h`, l’intérieur est recadré :

```text
cropX = 4
cropY = (180 − h) / 2 + 4
cropW = 386
cropH = h − 8
sprite position = (hazard.x, hazard.y)
sprite origin   = (0.5, 0.5)
```

Le bord du matériau se trouve donc à quatre unités de chaque bord de plaque, indépendamment de la hauteur. Les fissures ne sont jamais étirées. Un fond métallique plein et des traits rectangulaires composent une bordure stable. La ligne chaude de largeur 1,5 est entièrement incluse dans la hitbox, coins carrés compris.

Le renderer exige une vague complète de trois plaques cohérentes : propriétaire Maître de Four vivant et non final, monde Forge, `planId=whiteFurnace`, `shape=plate`, indices 0–2, ordre 1 ou 2, géométries attendues, même attaque et même phase. Une vague partielle ou incorrecte repasse intégralement à l’ancien rendu.

Le cône, les autres patterns, les combos, les plaques normales du Chauffeur et les autres mondes sont exclus de cette interception.

### Profondeurs

- Fond métallique et passages : 7,8.
- Images du matériau : 7,9.
- Télégraphes existants : 8.
- Boss : 15.
- Traits de danger et de passage : 16.
- Héros : 20 ; arme : 21.

Le héros reste au-dessus. Les contours restent lisibles sur le boss. Un masque géométrique partagé respecte les limites de l’arène.

### Animation et progression

L’annonce utilise l’image 4 et une opacité de `0.4 + 0.6 × progression`, calculée à partir de `h.warning / h.warningTotal`. Les fissures deviennent progressivement lisibles ; le matériau reste beaucoup plus sombre que l’actif.

À l’activation : image active, opacité 1, contour chaud net. L’animation interne suit `h.elapsed`, quatre images en **0,8 s**. L’actif réel durant 0,65 s, chaque vague traverse les quatre images sans que sa durée soit prolongée pour boucler. Le mode mouvement réduit fixe l’image 0.

À l’extinction : image 5 neutre, opacité au plus 0,25, fond/contour atténués selon les 0,30 s existantes. Les passages indiqués sont retirés immédiatement. Les deux vagues utilisent la même intensité ; aucune montée de difficulté ou de puissance n’est suggérée artificiellement.

## 4. Coûts et mesures

| Élément | Valeur |
|---|---:|
| SVG de production | **8 667 octets** |
| Module renderer | 7 101 octets |
| Atlas raster | 788 × 540 px |
| Mémoire RGBA8 d’un raster | **1 702 080 octets**, soit **1,623 Mio** |
| Images visibles maximales / pool | **3 / 3** |
| Textures de matériau | **1**, partagée |
| Graphics affichés | 2 : fond/passages et contours |
| Masque | 1 Graphics non affiché + masque partagé |
| Commandes mémorisées, vague 2 active | 768 fond/passages, 180 contours |

La mémoire RGBA désigne un raster, pas le processus complet. Le navigateur peut conserver le raster source et sa copie GPU, soit environ **3,246 Mio** pour deux copies, plus les structures du moteur. Les dimensions restent sous 1 024 px sur chaque axe.

Les surfaces sont reconstruites uniquement au changement de vague, de phase ou de rayon du joueur. Le pool, les tableaux de références, les buffers de Graphics et la texture sont réutilisés. Le recadrage et le changement de cellule ne sont appliqués qu’en cas de changement effectif. Aucun blur, bloom ou shader spécifique.

### CPU, poste de contrôle

Chrome headless de bureau, WebGL/SwiftShader, viewport 390 × 844. Le micro-benchmark exécute 1 000 appels d’échauffement puis 60 lots de 100 mises à jour, au maximum de trois plaques.

| Mesure | Médiane | P95 |
|---|---:|---:|
| Mise à jour du nouveau renderer | **0,002 ms** | **0,004 ms** |
| Acteurs + soumission scène, vague 1 nouvelle | 0,7 ms | 1,7 ms |
| Même scène, ancien rendu | 0,8 ms | 1,6 ms |
| Acteurs + soumission scène, vague 2 nouvelle | 0,6 ms | 1,2 ms |
| Même scène, ancien rendu | 0,8 ms | 1,4 ms |

Les soumissions de scène utilisent 60 échauffements puis 120 mesures. Elles comprennent d’autres éléments que ce VFX et ne synchronisent pas le GPU. Les petites différences ancien/nouveau ne constituent pas une promesse de gain ; ces chiffres ne sont pas des performances Android.

### Allocations et nettoyage

Après **40 000 appels**, références des trois sprites et des deux buffers inchangées, objets de scène **275 → 275**.

Le profil Chrome, avec pas d’échantillonnage de 32 Kio et objets collectés inclus, estime **121 568 octets temporaires** sur le lot. Ce résultat échantillonné ne signifie pas « zéro allocation moteur », ni une valeur exacte par image. Le test porte sur une phase active stable ; les reconstructions de phase et changements de frame restent bornés.

Heap après collecte : **−9 688 octets** par rapport au point de départ ; stockage sous-jacent stable. Aucun accroissement retenu n’est observé sur ce lot, sans prétendre remplacer un essai prolongé sur appareil.

Après mort du propriétaire : **0 hazard, 0 sprite visible, 0 commande de fond et 0 commande de contour**. Réinitialisation, disparition de texture, récupération et arrêt de scène sont testés ; destruction idempotente.

## 5. Cône final et gameplay conservés

Le module ne prend en charge que `shape=plate`. Lors de l’arrivée du cône, ses images et Graphics sont vidés/masqués ; `drawDungeonHazard` reçoit le cône inchangé.

Le cône garde son rayon **225**, son demi-angle **0,66 rad**, son origine et son orientation définies à la création du plan, sans tracking. Annonce, actif, extinction, ordre et dégâts sont conservés.

Deux preuves indépendantes :

- Relecture de la simulation réelle, rendu nouveau contre témoin : états gameplay identiques et commandes graphiques du cône identiques durant toute sa présence.
- Captures PNG du même instant : **identité SHA-256 avant/après** à l’annonce et en actif, sur **320 × 568 et 390 × 844**.

Les fichiers de patterns, mobilité, directeur, collisions, dégâts, progression et condition d’ultime sont inchangés. Le renderer et l’asset du **Four tournant** sont identiques à V0.38D.1B. Secteurs de chauffe, Cône de fournaise, Marche à blanc et combos ne sont pas modifiés. L’ultime reste exclu du triple normal.

## 6. Repli

En cas d’asset absent, dimensions incorrectes ou cellule invalide, le nouveau renderer refuse toute la vague. Le dessin procédural d’origine des **plaques et de leurs bandes** reprend intégralement.

Sept défauts de texture sont testés, ainsi qu’une requête SVG réellement bloquée dans Chrome. Aucun asset étranger n’intervient. Les collisions et toutes les horloges restent opérationnelles.

Limite explicite du repli demandé : il conserve aussi l’ancienne ambiguïté visuelle des bandes vertes. La correction P0 dépend du chargement de la Variante A.

## 7. Vérification visuelle

**88 captures de contrôle**, 44 par format, plus une capture de chargement bloqué. Zéro erreur console dans les cas normaux. Le test de panne provoque intentionnellement une erreur réseau.

La [vérification de la galerie](production-v038d1c-four-a-blanc/notes/gallery-checks.json) confirme ses contrôles avant/après, images et liens sur 1280 × 900, 320 × 568 et 390 × 844 : aucun débordement de page, aucune image manquante et aucune erreur console.

La galerie inclut :

- Référence A, masters des deux vagues et atlas.
- Annonce, chauffe, actif, quatre images intérieures, extinction et transition.
- Centres des quatre bandes, léger décalage x=220/230 autour de x=225.
- Bords haut/bas du passage : centre à 0,5 unité dedans et à 0,5 unité dehors.
- Ancienne position ambiguë à 9 unités du bord de plaque.
- Passage minimal de 55 unités, vue zoom ×2,3.
- Debug des plaques, des couloirs du centre et du volume joueur.
- Ancien/nouveau au même instant ; cône conservé et repli.

Les tests automatisés vérifient également le déplacement latéral jusqu’à x=41 et x=409, avec points intermédiaires x=80 et x=370. Pour les bandes horizontales, la contrainte de largeur dangereuse s’éprouve surtout en haut et en bas ; gauche/droite suivent leur longueur.

Les échantillons du joueur sont repositionnés **sans avancer la simulation**. Le flash d’un contact antérieur est retiré uniquement dans cette fonction de contrôle afin de ne pas attribuer ce flash à la nouvelle position. Le résultat sûr/contact vient du véritable prédicat `forgeTouches`, sans changement de collision.

### Pixels des passages

Le framebuffer réel a été relu dans les deux bandes, pour les deux vagues, en début d’annonce, pendant la chauffe et sur les quatre images actives. Les zones échantillonnées x=70…89 évitent le boss et le héros :

- Aucun pixel chaud détecté dans ces passages.
- Centres constamment **RGBA (16,30,40,255)**.
- Largeur et position stables à toutes les phases comparées.

Ce contrôle isole le voile global de dégâts existant, qui colore tout l’écran après un contact ; ce voile n’a pas été modifié dans le jeu. Il mesure le matériau et son débordement, pas les effets globaux.

L’atlas chargé par Phaser a aussi été relu : les six cellules restent opaques, chaque frame contient 70 920 pixels opaques. L’annonce a une luminance moyenne de 57,85 contre environ 126,8 pour l’actif, avant sa modulation supplémentaire d’opacité.

## 8. Tests et fichiers

Commande finale : `npm test`. **1 810 réussis, 0 échec, 0 ignoré.**

Les 24 nouveaux tests couvrent : audit géométrique et timings, atlas, sept pannes, deux dispositions et recadrages, quatre bandes et positions de bord, rayon du joueur, progression, stabilité des couloirs, vagues invalides, exclusion des autres effets, relecture complète incluant le cône, nettoyage et réutilisation des buffers.

Toutes les assertions des `.test.js` existants sont conservées. Les empreintes des sources précédentes sont comparées après retrait exact des seuls branchements autorisés. Un adaptateur de validation compose cette étape avec le précédent adaptateur V0.38D.1B ; il exige la présence unique de chaque insertion, sans assouplir les protections du gameplay.

### Production

- Ajout `src/furnace-whitehot-plates-vfx.js`.
- Ajout `src/assets/furnace-whitehot-plates-v038d1c/plates-a.svg`.
- Ajout `scripts/build-whitehot-plates-v038d1c.mjs`, générateur reproductible.
- `src/room-scene.js` : import et préchargement.
- `src/arena-view.js` : construction, préparation et passage du renderer.
- `src/forge/art.js` : interception des plaques admissibles et remplacement conditionnel des bandes ; chemins historiques conservés.

### Vérification / documentation

- Ajouts `tests/furnace-whitehot-plates-v038d1c.test.js`, `tests/whitehot-before-v038d1c.json`, `tests/whitehot-visual-delta.js`.
- `tests/furnace-turn-visual-delta.js` : composition exacte de l’adaptateur.
- `tests/v038b3-authorized-files.js` : autorisation des deux nouveaux fichiers source.
- `production-v038d1c-four-a-blanc/` : référence copiée, banc, galerie, captures, mesures et scripts.
- Le présent rapport.

Les livrables `production-*` restent locaux, selon l’exclusion Git déjà présente. Les travaux V0.38D.1B et l’audit antérieur sont préservés.

## 9. Android physique restant

1. Arrêter le serveur localhost du banc si nécessaire, puis lancer depuis la racine : `node production-v038d1c-four-a-blanc/serve.mjs --lan`.
2. Sur le même réseau, ouvrir `http://<IP-du-PC>:5234/production-v038d1c-four-a-blanc/gallery.html`, puis le banc.
3. Confirmer le chargement SVG, les recadrages, l’absence de débordement aux bords et la lecture du passage bas de vague 2.
4. Vérifier les deux annonces, la chauffe, l’actif et les transitions à luminosité réelle, en mouvement, au centre et près des bords.
5. Jouer l’ultime dans le jeu normal avec commandes tactiles, PV normaux et arme active. Le banc d’observation ne remplace pas ce test.
6. Mesurer temps d’image, pics, mémoire et chauffe sur plusieurs minutes ; contrôler mise en arrière-plan/reprise et orientation.
7. Vérifier mort du boss, changement de zone, relance et chargement interrompu, puis constater que le cône final et Four tournant sont conservés.

L’étape s’arrête aux plaques et passages de Four à blanc Variante A. Aucun commit, aucun push et aucun chantier suivant.
