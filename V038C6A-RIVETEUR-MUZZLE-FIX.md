# V0.38C.6A — Riveteur : raccord de bouche et miroir

Correctif intégré au rendu du **Riveteur de Zone 6 uniquement**. Aucun commit/push. Aucun impact, flash ou chantier P1 ajouté.

## Cause exacte

Trois repères indépendants étaient utilisés :

- Simulation : centre du mob + 23 unités dans **chaque** direction du tir, puis déplacement de 2,75 unités au premier tick de 1/60 s.
- Étincelles : centre + `(±22, 5)`, côté déduit de l’angle, sans lecture du sprite affiché.
- Bouche réelle : ouverture de l’outil animée, par exemple `(13,6034, 2,7358)` par rapport au centre au premier frame d’attaque, à l’échelle 52 × 52.

Le sélecteur de miroir lisait le mouvement ou l’entrée en préparation. Un tir pur traverse préparation et émission dans la même mise à jour : le renderer pouvait donc manquer cette entrée et conserver le côté précédent. Le cas gauche → droite est reproduit dans les captures avant/après.

## Correction

### Une bouche centralisée

`src/riveter-muzzle.js` définit `getRiveterMuzzle(out, enemy, body)`, partagé par les deux étincelles existantes et le renderer du Rivet B.

Les coordonnées des **33 frames** sont mesurées sur l’ouverture `ellipse(cx=310, cy=261)` du master validé : rotation locale de 10° autour de `(213,255)`, transformation du groupe outil dans chaque frame, puis normalisation dans le viewport carré 517,5, centré en `(170,225)`. Aucun SVG, sheet ou rig n’est modifié.

Le calcul utilise la **frame réellement affichée**, la texture approuvée, la taille affichée, l’origine, les miroirs, la rotation et la position du body, puis la matrice monde du conteneur. Le master statique de repli emploie l’ancre du frame 0. Une texture inconnue, un frame invalide ou un body masqué n’est pas interprété arbitrairement.

Quelques offsets à 52 × 52, avant miroir :

| Frame affichée | X | Y |
|---|---:|---:|
| Idle / master statique 0 | 13,8149 | 5,3008 |
| Attaque 17 | 13,6034 | 2,7358 |
| Attaque 18 | 13,1669 | 3,8025 |
| Attaque 19 | 13,2276 | 4,7552 |
| Attaque 20 | 13,7977 | 5,7301 |
| Hit 24 | 13,2723 | 5,3008 |

La pose 3/4 et les animations validées sont conservées. Le sprite choisit son côté gauche/droite ; les huit directions effectives restent celles des projectiles.

### Priorité au tir réellement émis

Le signal existant `projectileAnimationReleased` est lu une seule fois. Pour le Riveteur seulement, une émission réussie applique le côté de l’angle central de `shotAngles` avant l’affichage du frame. Aucun budget refusé ou simple changement de cible ne déclenche cette règle.

Le calcul réutilise `stableFacing` : **`enemy-facing.js` est strictement inchangé**. Dans sa bande verticale, le dernier côté valide est conservé. Il n’y a ni nouveau seuil, ni temporisation, ni correction du mouvement physique.

### Origine visuelle et origine physique

Le point d’ancrage du sprite Rivet B est positionné exactement à la bouche lors du **premier tick affiché**. Les trois tirs d’un éventail partagent ce même point ; leurs angles, rotations et autres paramètres restent distincts et inchangés.

Le décalage est mémorisé une seule fois par vol dans un cache de présentation fixe de 24 entrées. Il s’atténue linéairement sur **40 unités parcourues après ce premier affichage** (environ 242 ms à 165 u/s), pour rejoindre complètement la trajectoire physique existante. C’est un raccord de présentation, similaire au principe déjà employé par le Lampiste : il ne déplace jamais les coordonnées de simulation. Il implique une brève interpolation de la position dessinée, pas une modification de la vitesse ou de la trajectoire de collision.

Le projectile ne suit plus la bouche une fois parti : déplacement, retournement, hit ou mort du propriétaire ne tirent pas le projectile en vol vers le mob. Les vols découverts tardivement ne sont pas ramenés à l’arme. Le cache est réinitialisé au changement de run, à la libération ou à la réutilisation d’un slot.

Les étincelles suivent la bouche affichée pendant leur durée existante, avec les deux segments locaux `(5,-3)` et `(5,3)` tournés selon l’angle central réel. Leur nombre, épaisseur, couleur, alpha et fenêtre **< 0,12 s** restent identiques. Le mode mouvement réduit conserve leur désactivation.

## Périmètre et protections conservées

- Rivet B : même fichier SVG, 3 frames / 120 ms, 26 × 15,6, origine `(0,625; 0,5)`, rotation réelle du tir ; aucun recadrage du graphisme ni modification de sa traînée.
- Physique : spawn radial de 23, vitesse 165, portée 350, rayon 4, dégâts 0,5 ; aucune écriture du renderer sur un projectile ou un acteur.
- Tir simple avant vague 11, éventail de 3 ensuite, écarts ±0,17 rad, recovery 1,1 s et règles de réadmission inchangés.
- Protection à courte distance conservée : admission strictement au-delà de 42 unités avec le joueur de rayon 13 et le Riveteur de rayon 17 ; collisions balayées et contact inchangés.
- Pool physique toujours 24 ; quatre Riveteurs et 12 Rivets simultanés vérifiés.
- Foreuse autonome, Draisine, Crachefer et Aiguilleur : branche de rendu et position du Rivet inchangées.
- Replis existants conservés : si le Rivet ou un frame ne peut pas être rendu, le renderer procédural antérieur reste disponible. Si aucune bouche validée n’est affichée, aucun ancrage inventé n’est appliqué. Le master statique approuvé bénéficie du raccord.
- Aucun asset, gameplay, hitbox, dégâts, cadence, vitesse, portée, collision, cap, timing ou comportement d’autre mob modifié.

## Fichiers de ce patch

Production :

- `src/riveter-muzzle.js` — nouveau helper et cache de présentation.
- `src/forge-animation-state.js` — priorité au tir réel pour le miroir du Riveteur.
- `src/enemy-rivet-vfx.js` — application du décalage visuel au Riveteur seulement.
- `src/forge-sprite-vfx.js` — origine et direction communes pour les deux traits existants.

Tests :

- `tests/riveter-muzzle-v038c6a.test.js` — 29 tests ciblés.
- `tests/riveter-before-hashes-v038c6a.json` — empreintes avant patch.
- `tests/riveter-muzzle-visual-delta.js` — liste exacte et réversible des trois raccordements de rendu.
- `tests/scorifier-visual-delta.js`, `tests/v038b3-authorized-files.js` — extension explicite des contrôles historiques ; aucune assertion de test existante supprimée ou réécrite.

Validation : `production-v038c6a-riveter-muzzle/` contient le banc isolé, la galerie, les scripts de mesure/capture, les copies avant des trois fichiers et les preuves JSON. Ce dossier suit la convention existante des galeries `production-*`, ignorées par Git. Les travaux précédents déjà présents sont préservés.

## Résultats

- **1 703 / 1 703 tests réussis** : les 1 674 tests existants + 29 ciblés. Aucun test ignoré.
- Vérification des empreintes de tous les fichiers source antérieurs après retrait des trois modifications visuelles déclarées ; tous les assets, gameplay et assertions `.test.js` antérieurs identiques.
- Replays réels avant/après avec/sans renderer : acteurs, joueur, événements et pools identiques, y compris dégâts et cadence.
- **112 captures Chrome**, soit 28 scénarios × 2 formats × avant/après ; **56 comparaisons de gameplay strictement identiques**.
- Formats **320 × 568** et **390 × 844**, deviceScaleFactor 1 ; aucun débordement horizontal.
- Huit directions, quatre retournements brusques au même tick / ticks consécutifs, déplacement horizontal/vertical/diagonal, arrêt, bord d’arène, blocage et libération à courte distance, tir simple, éventail ×3, quatre Riveteurs / 12 Rivets, vol, hit et mouvement réduit.
- Origine du projectile et des deux étincelles vérifiée à moins de 0,00001 unité de la bouche au premier affichage, pour chaque tir contrôlé.
- Deux captures supplémentaires du fallback statique ; dix captures avec marqueur de bouche. Blanc = position physique ; rose = bouche visuelle ; cyan = rayon du mob.
- Aucune erreur console / JavaScript pendant ces contrôles.

Preuves : `notes/tests.txt`, `notes/browser.json`, `notes/anchors.json`.

## Validation humaine restante

Les captures mobiles utilisent Chrome desktop aux dimensions demandées. Il reste à confirmer sur **un téléphone Android physique**, après rechargement complet du jeu : fluidité du raccord en mouvement, salves ×3 et retournements rapides dans une vraie vague de Zone 6. Aucun test physique Android n’est revendiqué.

[Galerie](production-v038c6a-riveter-muzzle/gallery.html) · [Banc interactif](production-v038c6a-riveter-muzzle/observe.html)

Arrêt après ce correctif. Aucun commit/push. Aucun début de l’impact Rivet B.
