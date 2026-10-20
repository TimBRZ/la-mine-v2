# La Mine V2 — V0.38D.1E — Secteurs de chauffe

Variante A intégrée uniquement au pattern ordinaire `sectors` du Maître de Four. Il s’agit de rectangles au sol, jamais de secteurs radiaux. Aucun équilibrage, commit ou push. Marche à blanc n’est pas commencé.

## Géométrie réelle et seuil de PV

Valeurs lues dans `src/forge/boss-patterns.js`, conservé octet pour octet :

| Plaque | Centre | Dimensions | Limites réelles | Présence |
|---|---|---|---|---|
| 0 | (121, 265) | 142 × 190 | x 50–192 ; y 170–360 | Toujours |
| 1 | (329, 520) | 142 × 190 | x 258–400 ; y 425–615 | Toujours |
| 2 | (329, 265) | 142 × 150 | x 258–400 ; y 190–340 | Strictement sous 50 % PV |

**À exactement 50 % PV : deux plaques.** Le test du code est strictement `< 0.5`. La troisième plaque est ajoutée à la création du plan ; franchir le seuil pendant une attaque ne change pas les dangers déjà créés. Le renderer utilise ces dangers, sans recalculer leur nombre depuis les PV.

Un seul événement à `at = 0` porte tous les rectangles : ils annoncent et activent le danger simultanément. Ils restent fixes même si le boss se déplace.

| Paramètre | Valeur inchangée |
|---|---|
| Télégraphe, PV ≥ 50 % | 1,35 s |
| Télégraphe, PV < 50 % | 1,269 s (1,35 × 0,94) |
| Actif | 1,8 s |
| Fin du plan | 3,20 s / 3,119 s |
| Récupération | 1,10 s / 0,95 s |
| Extinction existante | 0,30 s, sans dégâts |
| Dégâts | 0,5 |
| Suivi / verrouillage | Aucun suivi ; plan verrouillé dès sa création |
| Mobilité du boss | `ATTACK_MOBILE`, facteur 0,4, vitesse 36,8 unités/s, plafond de déplacement 150, borné par les couloirs existants |
| Mobilité des plaques | Aucune ; pas de `drift` pour `sectors` |

Hitbox d’origine : AABB avec expansion par le rayon du joueur, comparaisons strictes `<`. Pour un rayon de 13, le passage central sûr pour le **centre** du héros est x = 205 à 245, soit 40 unités. À droite, entre la plaque haute courte et la plaque basse, il est y = 353 à 412, soit 59 unités. Ces espaces sont sûrs vis-à-vis des Secteurs de chauffe ; les autres dangers restent indépendants.

## Référence et contrôle de fidélité

Source finale : `Infographie des secteurs de chauffe du Maître de Four.png`, 1536 × 1024, fournie par l’utilisateur.

La matière provient directement des panneaux **progression** et **état actif** de cette référence. Le script de production retire la perspective de la plaque illustrée et extrait uniquement sa lave. Il n’extrait ni arène, ni boss, ni texte. Aucun appel à imagegen, aucune texture alternative ou grille procédurale.

Comparaison effectuée dans la galerie : référence complète → master de plaque → captures dans le jeu, avec zooms de matière et de bord.

| Critère | Résultat et adaptation |
|---|---|
| Rouge / orange | Couleurs de la lave de la référence, avec ses zones plus rouges et ses plages chaudes. |
| Fissures jaunes | Réseau original, conservé par rééchantillonnage ; pas de réseau géométrique ajouté. |
| Taille des cellules | Grandes cellules organiques à l’échelle native 142 × 190 ; recadrage de la plaque courte, sans compression verticale. |
| Densité | Même matière partagée, sans micro-bruit ni carreaux répétés ajoutés. |
| Contour | Droit, continu, orange/jaune, entièrement intérieur à la vraie hitbox. Coins carrés. |
| Contraste | Sol normal visible dans les passages ; lave uniquement dans les rectangles. |
| Progression | Voile rouge sombre, matière de chauffe de plus en plus visible, puis matière active vive. |
| Extinction | Rouge sombre, fissures éteintes et disparition rapide ; pas de fumée débordant dans les passages. |

La planche illustre des positions et proportions différentes de celles du jeu : seule sa matière et son identité visuelle sont reprises. Les rectangles techniques restent ceux du tableau ci-dessus. Les grosses nappes de fumée illustratives ne sont pas reproduites ; le retour sombre et la disparition suffisent à l’extinction sans contaminer les zones sûres.

## Architecture et fichiers

Nouveaux fichiers de production :

- `src/furnace-heating-sectors-vfx.js` : préchargement, validation stricte, groupe de rectangles, pool, phases et nettoyage.
- `src/assets/furnace-heating-sectors-v038d1e/sectors-a.png` : atlas partagé.
- `scripts/build-heating-sectors-v038d1e.mjs` : extraction hors jeu, depuis la référence jointe.

Raccords dans les fichiers existants :

- `src/room-scene.js` : préchargement.
- `src/arena-view.js` : construction du renderer, début de frame, passage au dessin Forge.
- `src/forge/art.js` : interception du seul groupe `sectors` reconnu.

Aucun fichier de simulation, collision, boss, mobilité ou timing n’est modifié.

Pool fixe : **3 Images Phaser + 2 Graphics** (fond et contours). Une texture partagée. Aucun shader, émetteur de particules ou masque d’arène supplémentaire. Les rectangles sont entièrement inclus dans l’arène.

Le matériau est affiché à **142 × 190** dans les trois sprites. Le recadrage intérieur est :

- Plaques de 190 : `(2, 2, 138, 186)`.
- Plaque de 150 : `(2, 22, 138, 146)`.

Le centre est recadré, sans écraser les cellules. Le fond et le contour sont dessinés aux dimensions exactes de chaque rectangle. Trait de 1,5 unité, axe rentré de 0,75 unité : aucun dépassement du bord de collision.

Profondeurs : fond 7,8 ; lave 7,9 ; télégraphes existants 8 ; boss 15 ; contour 16 ; héros 20 ; arme 21. Le joueur reste au-dessus du VFX. Le clignotement d’invulnérabilité préexistant est conservé.

## Animation et progression

Atlas **426 × 380**, 3 colonnes × 2 lignes, six cellules de **142 × 190** :

- 0–3 : quatre images actives, boucle de **0,8 s** (0,2 s/image).
- 4 : matière de chauffe issue de la référence.
- 5 : extinction rouge sombre.

Les quatre images actives ne changent que la luminosité locale, à ±2,2 %. Aucun scrolling, changement de silhouette ou mouvement des cellules. Les trois plaques partagent le même temps d’animation. Mouvement réduit : image active 0.

Télégraphe :

1. Fond rouge sombre à alpha 0,17 ; contour rouge/orange distinct.
2. Image de chauffe apparaissant selon `progress^1.7 × 0.85`.
3. Contour passant de 0,90 à 1 d’alpha, sans bouger.
4. Bascule sur l’état actif uniquement lorsque `h.active` le demande.

Extinction : lecture du `cooling` existant, image sombre à `0.65 × cooling / 0.3`, fond et contour également décroissants. Dès que le hazard cesse d’être actif, il ne cause plus de dégâts. Après retrait du hazard : aucun sprite, fond ou contour visible.

## Fallback et isolation

PRIMARY : nouveau matériau Variante A.

FALLBACK : appel inchangé au dessin procédural historique des Secteurs de chauffe. Jamais au Chauffeur, à Four à blanc, au cône ou au Scorificateur.

La validation vérifie monde Forge, plan `sectors`, style Maître de Four, danger thermique de donjon, auteur vivant, index, positions et dimensions exactes. Le groupe doit contenir deux ou trois plaques cohérentes, avec mêmes auteur, token et phase. Un groupe incomplet, doublonné ou invalide retourne intégralement au fallback. L’état du plan reste la source de vérité.

L’absence d’image, une mauvaise taille, une coupe incorrecte, une source ou texture incohérente sont également couvertes. Le préchargement de l’asset n’est jamais une dépendance de la simulation.

Four tournant, Four à blanc, Cône de fournaise, Marche à blanc, tous les combos et les autres boss restent inchangés. Les plaques de `forgePressure` et `whiteHammer` ne sont pas interceptées, même si elles ressemblent visuellement à des secteurs.

## Résultat du contrôle triple Zone 6

**Le code existant refuse les deux configurations de Secteurs de chauffe en triple.**

La vérification supplémentaire de `ForgeBossDirector.admit`, pour un boss final, impose une région froide traversante suffisamment large. Sur ces rectangles fixes, `forgeEscapeReport` renvoie :

- `spans: false`
- `largestColdFraction: 0.26666666666666666`

Ce résultat est déjà obtenu sans ajouter les dangers des autres boss, pour deux comme pour trois plaques. Le directeur reporte l’admission et le renderer n’affiche aucun secteur.

Le contrôle a été exécuté aux deux tailles mobiles, avec les deux niveaux de PV. Aucun garde-fou n’a été contourné, aucun hazard injecté, aucun combo modifié. La galerie montre les deux refus ainsi qu’un triple naturel avec les attaques autorisées. Il ne s’agit donc pas d’une validation de Secteurs de chauffe actifs au milieu du triple : leur apparition n’est pas autorisée par le gameplay actuel.

## Poids, mémoire, pool et CPU

- PNG : **316 446 octets** (309,03 Kio).
- RGBA8 : **647 520 octets** (0,62 Mio), hors surcoûts du moteur, du pilote et du décodage.
- Une texture ; trois sprites réservés, dont deux ou trois visibles suivant le plan.
- Deux Graphics réutilisés, reconstruits au changement de phase ou de nombre de plaques.
- Aucun objet JavaScript explicitement créé à chaque frame dans le chemin de mise à jour stable.

Mesures Chrome local avec WebGL / SwiftShader :

| Mesure CPU | Médiane | p95 |
|---|---:|---:|
| Mise à jour du VFX, trois plaques | ≈ 0,001 ms | ≈ 0,002 ms |
| Scène, deux plaques, nouveau rendu | 0,30 ms | 0,70 ms |
| Scène, deux plaques, ancien rendu | 0,50 ms | 0,90 ms |
| Scène, trois plaques, nouveau rendu | 0,30 ms | 0,60 ms |
| Scène, trois plaques, ancien rendu | 0,40 ms | 0,80 ms |

VFX : 60 lots de 100 appels après échauffement. Scène : 120 appels après échauffement. Ce sont des temps CPU locaux de mise à jour/soumission, pas des mesures GPU Android ni une garantie de fluidité sur téléphone.

Sur **40 000 appels** : objets de scène **282 → 282**, mêmes trois sprites et mêmes buffers de fond/contour. Échantillonnage d’allocations à intervalle 32 768 octets : **0 octet échantillonné**. Cela ne prouve pas l’absence absolue de petites allocations du moteur. Heap retenu après GC : **+9 600 octets** ; aucune augmentation du pool.

Mort du boss : dangers retirés, zéro sprite visible, fond et contour masqués. Destruction idempotente lors du shutdown.

## Tests et contrôles visuels

Suite finale : **1 862 / 1 862**, sans échec ni test ignoré. Baseline **1 833** conservée, **29 tests ajoutés**.

Les nouveaux tests couvrent notamment :

- Asset, coupes, taille et mémoire ; sept causes de fallback.
- Deux plaques au-dessus et à exactement 50 %, trois strictement sous 50 %.
- Positions, dimensions, timing, dommages et activation simultanée.
- Boss mobile avec plaques fixes ; franchissement des PV pendant un plan.
- Annonce, chauffe continue, quatre images synchronisées, mouvement réduit, extinction sans dégâts.
- Contours intérieurs et passages sûrs tenant compte du rayon du héros.
- Groupes incomplets/incohérents et exclusions de patterns/combos.
- Replays observationnels solo/triple, refus d’admission existant aux deux niveaux de PV.
- Pool stable, perte/récupération de texture, nettoyage et shutdown.

Tous les anciens fichiers `.test.js` sont conservés octet pour octet, vérifiés par SHA-256. Les anciens fichiers de production sont conservés après retrait des trois raccords visuels exacts. `tests/cone-visual-delta.js` compose le nouveau delta ; `tests/sectors-visual-delta.js` ajoute les deux nouveaux fichiers à l’inventaire historique en mémoire. Aucun ancien test n’est supprimé ou affaibli.

Contrôles navigateur :

- **76 cas capturés** couvrant les deux et trois plaques sur **320 × 568 et 390 × 844**.
- Annonce, chauffe, quatre images actives, fin active, extinction, retour au sol.
- Joueur dans la lave, sur le bord, corps juste dehors/encore en contact, passage central, passage entre les deux plaques droites.
- Zoom de matière et de contour, captures avant/après.
- **12 comparaisons strictement identiques** des patterns exclus : Four tournant, Cône de fournaise, Four à blanc, Marche à blanc, `forgePressure`, `whiteHammer`, aux deux tailles.
- Atlas bloqué au chargement : fallback visuellement identique à l’ancien rendu.
- **0 pixel modifié** dans les régions sûres échantillonnées : 22 250 pixels à deux plaques, 30 290 à trois, pour chacune des quatre phases.
- Aucun débordement horizontal ni erreur JavaScript observée.

Les comparaisons de passages désactivent seulement l’affichage des nouveaux objets, à simulation figée : le sol et les acteurs restent identiques. Les sondes de joueur figent le temps ; elles ne changent pas les prédicats de collision.

## Galerie, reproduction et Android

- `production-v038d1e-secteurs-chauffe/gallery.html`
- `production-v038d1e-secteurs-chauffe/observe.html`
- `production-v038d1e-secteurs-chauffe/assets/reference-a.png`
- `production-v038d1e-secteurs-chauffe/assets/master-plaque.svg`
- `production-v038d1e-secteurs-chauffe/captures/`
- `notes/browser.json`, `notes/performance.json`, `notes/full-tests.txt`, dans le dossier de la galerie.

Serveur de revue : `http://127.0.0.1:5236/production-v038d1e-secteurs-chauffe/gallery.html`.

Le banc suspend l’arme et étend les PV pour inspection, en mémoire, sans toucher au profil. Les collisions, le directeur, les acteurs et les renderers sont ceux du jeu.

Reste à vérifier sur **Android physique** : chargement de l’atlas, netteté des fissures et bords avec le GPU réel, lisibilité du héros et des passages au doigt, transitions sur plusieurs attaques, stabilité en session prolongée. Les viewports mobiles Chrome vérifiés ici ne remplacent pas cette validation matérielle.

**Arrêt à V0.38D.1E. Aucun commit/push. Aucun travail commencé sur Marche à blanc.**
