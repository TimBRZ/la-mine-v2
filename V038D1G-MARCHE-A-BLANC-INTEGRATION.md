# La Mine V2 — V0.38D.1G — Marche à blanc

Variante A intégrée au Maître de Four. Périmètre : présentation de `whiteMarch` uniquement. Aucun commit ni push. Aucun équilibrage ni changement de simulation.

## Résultat et fidélité

La [galerie](production-v038d1g-marche-a-blanc/gallery.html) présente la référence complète, un détail de cette référence, le master de production et une capture du même matériau intégré au moteur. Elle contient les six étapes, la chauffe, l’extinction, le sol normal, une vidéo de la séquence, les zooms lave/contour, les positions du joueur, les comparaisons avant/après, les tirs et le triple boss aux deux formats mobiles.

- Télégraphe : cercle rouge/orange fin, intérieur sombre teinté, petit réticule central, repère d’ordre discret.
- Actif : grandes cellules organiques rouge/orange, fissures jaunes et bord incandescent continu. Pas de grille ni de bruit fin.
- Chauffe : apparition progressive de la matière sombre dans le télégraphe, sans changement de durée ou de taille.
- Extinction : matière assombrie et disparition progressive pendant le refroidissement déjà existant, sans dégâts supplémentaires.
- Aucun trail, chemin, projectile, explosion, vague radiale, colonne de flammes ou émetteur de particules.

La palette et les cellules larges reprennent la famille de lave de la référence et des VFX Four à blanc, Cône de fournaise et Secteurs de chauffe. La matière est une adaptation orthographique de la Variante A, pas une extraction pixel à pixel de l’infographie. Les cellules ne sont donc pas identiques une à une. Le master a été généré avec l’outil ImageGen intégré, à partir de la référence fournie, puis normalisé techniquement pour le disque gameplay. Aucun autre concept ou variante n’a été produit.

Provenance : [référence copiée](production-v038d1g-marche-a-blanc/assets/reference-a.png), [prompt exact ImageGen](production-v038d1g-marche-a-blanc/notes/imagegen-prompt.txt), [master généré](production-v038d1g-marche-a-blanc/assets/master-generated.png), [métadonnées de fabrication](production-v038d1g-marche-a-blanc/notes/material.json). Le script reproductible `scripts/build-white-march-v038d1g.mjs` prépare l’atlas à partir de ce master.

## Géométrie et ciblage inchangés

Sources de vérité : `src/forge/boss-patterns.js`, `boss-director.js`, `boss-mobility.js`, `combat.js` et `geometry.js`. Aucun de ces fichiers n’a été modifié par D1G.

Trois disques de rayon **47 unités**, ordre **1 → 2 → 3**. Chaque événement contient un cercle, index 0, style `furnace`. Les trois centres sont calculés et verrouillés à la création du plan :

```js
// t = aimPoint(player), initialement borné à x 90..360 / y 185..595
x = clamp(t.x + (i - 1) * 65, 85, 365)
y = clamp(t.y + (i - 1) * 35, 180, 600)
// i = 0, 1, 2
```

Exemple de contrôle : joueur initial (225, 500), centres (160, 465), (225, 500), (290, 535). Les centres restent fixes quand le boss ou le joueur bouge. Le rendu applique exactement `h.x`, `h.y`, sans rotation ni pulsation. Les disques restent dans l’arène ; aucun masque d’arène n’est nécessaire.

Le trait de largeur 1,5 est centré sur le rayon 46,25 : son bord extérieur est exactement à 47. Le matériau alpha est contenu dans le même rayon : aucun centre de pixel opaque au-delà de 47, rayon maximal mesuré 46,8028. Les six images ont exactement la même empreinte alpha.

La collision existante utilise `distance < hazard.radius + player.radius`. Pour le joueur de rayon 13, le seuil est donc 60 unités ; 60 exactement est hors collision. Être « entre » deux centres n’implique pas être en sécurité, car les disques peuvent se chevaucher. Les dégâts existants restent à 0,5.

## Ordre, timings et déplacement

| Paramètre | Phase normale | Sous 50 % PV |
|---|---:|---:|
| Événements des cibles | 0 / 0,65 / 1,30 s | identiques |
| Télégraphe par cible | 1,20 s | 1,128 s (× 0,94) |
| Actif par cible | 0,65 s | identique |
| Refroidissement | 0,30 s | identique |
| Récupération du plan | 1,10 s | 0,95 s |
| Fin nominale du plan | 3,20 s | 3,128 s |

Les phases sont lues sur les hazards réels ; aucun minuteur de gameplay n’est ajouté. Les petits groupes de un, deux ou trois points conservent le système d’ordre procédural existant, avec un fin fond sombre pour les distinguer de la lave.

**Écart de l’infographie avec le code :** le montage montre les trois disques actifs ensemble. Le code réel ne produit pas cet état. Jusqu’à trois disques sont visibles en phases différentes ; deux peuvent être actifs brièvement à une frontière de frame. Les captures et la vidéo reproduisent cette séquence réelle, sans prolonger les états pour imiter le montage.

Relevé à pas fixe de 1/60 s, phase normale, identique en solo et pour les trois disques admis en triple :

| Temps observé | État des disques |
|---:|---|
| 0,016667 s | télégraphe 1 |
| 0,650000 s | télégraphes 1 + 2 |
| 1,200000 s | actif 1 + télégraphe 2 |
| 1,300000 s | actif 1 + télégraphes 2 + 3 |
| 1,833333 s | actifs 1 + 2 + télégraphe 3 |
| 1,850000 s | extinction 1 + actif 2 + télégraphe 3 |
| 2,166667 s | actif 2 + télégraphe 3 |
| 2,483333 s | extinction 2 + actif 3 |
| 2,800000 s | actif 3 |
| 3,133333 s | extinction 3 |
| 3,450000 s | aucun disque |

Sous 50 % : activations observées à 1,133333 / 1,766667 / 2,416667 s ; dernière extinction à 3,066667 s et nettoyage à 3,383333 s. Les écarts d’une frame reflètent l’ordre de mise à jour existant, pas des durées redéfinies.

Le déplacement réel est un couloir d’approche verrouillé, facteur de vitesse 0,45 (41,4 unités/s dans le contrôle), plafond de profil 150, limite effective 115 dans ce cas. Le boss ne recalcule pas une poursuite des trois centres comme trois nouveaux points de passage. Cette logique est intégralement conservée. Il ne laisse aucune traînée.

En triple, les trois événements de Marche à blanc sont admis. Les refus éventuels d’autres événements par le budget global existant restent identiques (six refus observés au total dans la scène triple à 3,66 s). Aucun budget ni comportement triple n’a été changé.

## Asset et architecture

Asset versionné : `src/assets/furnace-white-march-disc-v038d1g/disc-a.png`.

| Élément | Valeur |
|---|---|
| Atlas | PNG RGBA 288 × 192, 3 colonnes × 2 lignes |
| Cellule | 96 × 96 ; diamètre gameplay 94 |
| Images actives | 0, 1, 2, 3 |
| Image de chauffe | 4 |
| Image d’extinction | 5 |
| Boucle active | 0,8 s ; chaque image 0,2 s |
| Animation | modulation d’intensité très légère, ± 2,5 %, matière fixe |
| Mouvement réduit | image active 0 fixe |
| Poids PNG | **102 585 octets**, environ **100,18 Kio** |
| Pixels RGBA décodés | **221 184 octets = 216 Kio**, hors surcoûts moteur/GPU |
| Pool | **3 sprites + 6 Graphics = 9 objets** |
| Texture partagée | une seule, pas trois assets distincts |

`WhiteMarchView` choisit strictement `whiteMarch` du Maître de Four, cercle 47, style furnace, ordre 1..3, index 0, propriétaire vivant, coordonnées finies et bornées. Les slots sont indexés par ordre, donc la disparition du premier disque ne réaffecte pas les suivants. Les groupes incohérents, doublons ou tokens différents sont refusés. La géométrie Graphics est reconstruite aux seuls changements de phase et la frame n’est réaffectée que lorsqu’elle change.

Profondeurs D1F conservées : fond 7,8 ; lave 7,9 ; tirs du joueur 10 ; héros 20 ; contour/réticule/ordre 30. Le contour critique reste visible au-dessus du personnage, la surface de lave reste dessous. Le passage commun de composition D1F n’est pas modifié.

Le shutdown détruit les neuf objets de façon idempotente. Le décès du boss laisse zéro hazard et zéro instance visible. Pas de masque, de particules, de trail ou de création d’objet d’affichage à chaque frame.

## Fallback

La taille de l’atlas et les six découpes sont vérifiées, ainsi que leur source et texture. Si le fichier manque, si la texture disparaît ou si les frames sont invalides, le nouveau gestionnaire laisse le hazard au **rendu procédural historique de Marche à blanc**. Toutes ses commandes de dessin sont conservées exactement. Aucun renvoi vers Four à blanc, Secteurs, Cône ou un autre hazard.

Les objets du nouveau pool sont cachés au début de chaque passage ; ils ne laissent pas de disque fantôme pendant un échec ou un cleanup. La capture `screens/fallback.png` et les tests de sept modes d’échec vérifient ce chemin.

## Fichiers

Code de production ajouté : `src/furnace-white-march-vfx.js` et le PNG versionné.

Trois branchements limités dans les fichiers existants :

- `src/room-scene.js` : import et préchargement de l’asset.
- `src/arena-view.js` : création du gestionnaire, collecte avant dessin, passage au renderer Forge.
- `src/forge/art.js` : argument optionnel et délégation du seul hazard accepté ; chemin ancien conservé sinon.

Tests ajoutés : `tests/furnace-white-march-v038d1g.test.js` (24 contrôles), `tests/white-march-mock-v038d1g.js`, snapshot `tests/white-march-before-v038d1g.json`, adaptateur `tests/white-march-visual-delta.js`. `tests/layering-visual-delta.js` appelle ce nouvel adaptateur pour retirer les seuls branchements D1G avant les comparaisons historiques. Les assertions des 1 874 tests précédents ne sont pas modifiées.

Outillage : script de fabrication, galerie, laboratoire d’observation, scripts de captures/mesures et preuves dans `production-v038d1g-marche-a-blanc/`. Les modifications D1B à D1F déjà présentes ont été préservées. Ni les sources de gameplay ni les quatre autres VFX validés n’ont été retouchés par D1G.

## Validation

Suite complète exécutée : **1 898 tests / 1 898 réussis**, zéro échec, zéro ignoré, durée 98,43 s. [Log complet](production-v038d1g-marche-a-blanc/notes/full-tests.txt).

Les 24 nouveaux tests couvrent chargement et atlas, fallback exact, géométrie, ordre, timings normaux et bas PV, positions fixes, solo/triple, progression et refroidissement sans dégâts, aucune traînée, frames/mouvement réduit, couches, autres patterns inchangés, pool, cache et cleanup. Des replays appariés et un snapshot des anciens fichiers détectent toute modification de simulation ou des tests existants.

Chrome WebGL logiciel, vues **320 × 568** et **390 × 844**, canvas ajusté à la largeur réelle de chaque viewport :

- 46 captures/contrôles de phases et de positions du joueur ; 4 captures triple boss.
- Tous les états normaux et sous 50 % PV ; cibles 1, 2 et 3, chauffe, extinction, cleanup.
- Joueur au centre, au bord, entre les disques, dehors et en zone sûre.
- Deux sessions de déplacement tactile par événements tactiles CDP, avec déplacement réel du joueur.
- Six contrôles de tirs (fusil à pompe, mitraillette, Grisoux × deux tailles). Vérification du framebuffer : contributions visibles respectives de 312, 20 et 175 pixels dans le contrôle ciblé ; héros 1 204 pixels.
- Huit comparaisons des autres VFX (quatre patterns × deux phases de PV) : **zéro octet de pixel différent** avec le nouveau gestionnaire activé ou non.
- Quatre timelines solo/triple × normal/bas PV, centres fixes malgré le mouvement du boss.
- Asset retiré : pool caché, rendu procédural disponible ; zéro erreur navigateur dans le contrôle final.
- Vidéo WebM décodable, 450 × 800, 4,431726 s, 147 368 octets.

Preuves : [contrôles navigateur](production-v038d1g-marche-a-blanc/notes/browser.json), [alpha et contribution des objets](production-v038d1g-marche-a-blanc/notes/material-check.json). Les captures ont été inspectées pour la lave, le contour et la lisibilité du héros ; la comparaison source/master/jeu est présentée dans la galerie.

Galerie vérifiée à 1440, 390 et 320 pixels de large, en modes normal et bas PV : six configurations sans débordement horizontal, images chargées, 32 liens accessibles, vidéo en lecture et zéro erreur JavaScript. [Contrôle de la galerie](production-v038d1g-marche-a-blanc/notes/gallery-check.json). Le test de gel des anciens fichiers a été relancé après la préparation des livrables : réussi.

## CPU et limites des mesures

[Mesures brutes](production-v038d1g-marche-a-blanc/notes/performance.json), Chrome desktop headless, WebGL SwiftShader :

- `begin` + dessin de trois disques, 12 000 appels mesurés : **médiane 0,002 ms ; p95 0,003 ms**. Ce chiffre concerne la logique de mise à jour du module, pas le rendu GPU ni une frame complète.
- Après 40 000 appels, **292 objets de scène avant et après**, pool stable.
- Échantillonnage des allocations à 32 Kio : 2 132 728 octets échantillonnés sur l’ensemble du passage moteur, principalement Phaser. Aucune entrée échantillonnée attribuée à l’URL du nouveau module. Ce résultat ne démontre pas une absence absolue d’allocations. Le delta de heap retenu (−115 580 octets) est bruité par le GC.
- Soumission CPU de la scène complète en WebGL logiciel : ancien médiane **0,6 ms**, p95 **0,9 ms** ; nouveau médiane **1,2 ms**, p95 **9,3 ms**. Ce coût complet est supérieur dans ce contrôle et ne doit pas être masqué par le chiffre du seul module. Mesure ponctuelle en environnement logiciel, sans valeur de garantie FPS sur téléphone.

## Android physique restant

La géométrie, les phases, les contrôles tactiles émulés et les couches sont vérifiés dans Chrome aux deux dimensions demandées. Il reste à valider sur téléphone réel : coût GPU et p95/frame sur appareil Android modeste, stabilité prolongée en triple boss, lecture des petits repères en conditions d’écran réel, tactile physique, pause/reprise et retour après mise en veille. Aucun test Android physique n’est revendiqué.

Étape terminée ; pas de commit/push et aucune suite engagée.
