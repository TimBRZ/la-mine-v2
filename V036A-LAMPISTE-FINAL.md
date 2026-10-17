# V036A — Lampiste, master statique de la variante A

Date : 14 octobre 2026. Statut : **livré pour validation humaine**, avant sprite sheet et intégration. Le choix humain porte sur la variante A ; le présent nettoyage reste à approuver.

## Intention et référence

« Un mineur des profondeurs spécialisé dans l’éclairage, équipé d’une lampe de casque et d’un puissant projecteur portatif. »

Source humaine : `C:/Users/TIMPRO~1/AppData/Local/Temp/codex-clipboard-d8250986-2152-4738-a116-e2064df7d30f.png`. Copie exacte conservée dans `v036a-lampiste-final/references/variante-A.png`. La galerie montre la planche complète et un simple recadrage du personnage A. Les variantes voisines et les petites vues directionnelles ne sont pas utilisées comme nouvelles poses.

Le master conserve la vue de trois quarts vers la droite, le casque ancien rond, sa lampe dominante, le visage charbon à deux petits points chauds, la tenue sombre, les bottes courtes et le sac dorsal. Le projecteur cylindrique est tenu devant le corps : une main au logement arrière, l’autre en appui sous le corps du projecteur. Aucun canon, viseur militaire ou effet Grisou ajouté.

## Construction et simplification

Un seul dessin SVG vectoriel transparent, sans image incorporée, dégradé, filtre, halo ni animation. 50 formes et 9 couleurs. Cadre `viewBox="55 255 310 330"`, partagé avec le recadrage de référence afin de comparer les masses sans changer la vue. Aucun recadrage automatique différent entre master et silhouette.

Les proportions sont reprises de l’image : masse du casque en haut, lampe haute à droite ; projecteur plus gros en bas à droite ; petit sac vertical à gauche et jambes courtes. Lampe de casque : ellipse extérieure 60 × 78 unités. Projecteur : ellipse extérieure 76 × 102 unités. Écart entre leurs centres : 168 unités verticales, 41 horizontales. La grosse lampe basse détermine l’orientation.

Suppressions : micro-rayures, petits boulons, usure aléatoire, câbles décoratifs et nombreuses nuances de matière. Un seul conduit au sac. Les volumes utilisent une face principale et un aplat secondaire utile. La lumière se limite à des lentilles pleines jaunes et crème, sans déborder du contour.

Palette :

| Fonction | Couleur |
| --- | --- |
| Contour / visage | `#0C1619` |
| Charbon / tenue | `#29373C` |
| Acier | `#596568` |
| Arête acier | `#AAB8B5` |
| Ocre | `#D89D2D` |
| Jaune chantier | `#F3BD41` |
| Brun discret | `#65554A` |
| Lumière chaude | `#FFE092` |
| Cœur clair / silhouette | `#F0ECDF` |

## Lecture du gameplay actuel — aucun changement

Inspection de `src/depths/config.js`, `actors.js`, `combat.js`, `pressure.js`, `art.js`, `src/enemies/registry.js`, `src/room-scene.js`, `src/main.js` et `style.css`.

- Identifiant interne `lampist`, ennemi de Zone 5. 80 PV, rayon de collision 17, vitesse 78, contact 0,5.
- Recherche une distance de 185–255 unités au joueur, avec déplacement latéral alterné. Peut préparer son attaque entre 145 et 310 unités une fois son délai écoulé.
- Pattern `light` : **préparation effective de 1,1 s**, puis trois projectiles sur un éventail total de 36° (centre et ±18°). L’angle est fixé au début de la préparation. Vitesse 118, portée 300, rayon 5. Le champ générique `telegraph: 1` des statistiques n’est pas le délai utilisé par ce pattern.
- **Le Lampiste standard n’a pas de faisceau continu.** Le projecteur est une intention graphique ; cette étape n’invente aucune attaque de lampe.
- Récupération de base 1,45 s, reprise du repositionnement après 0,3 s, puis délai de positionnement de 0,65 s. L’attaque attend si les emplacements nécessaires de projectiles ne sont pas disponibles.
- Pendant l’extinction, l’horloge de repos/repositionnement du Lampiste est accélérée ×1,12 ; sa vitesse de déplacement et son télégraphe ne sont pas accélérés. Les vagues 11–19 appliquent également un facteur ×1,12 sur ces phases. Ces facteurs peuvent se cumuler. Le fond seul est assombri, les entités de combat gardent leur contraste.
- Texture actuelle procédurale 48 × 48, affichée droite, sans nouveau master sélectionné. Héros actuel 46 × 52 unités de scène. **Aucun resolver, texture runtime, collision ou comportement modifié.**

## Échelle mobile et différenciation

La galerie propose les réductions demandées de **40, 48 et 56 pixels CSS**, couleur et monochrome. Elles ne doivent pas être confondues avec les unités internes du jeu.

Le jeu utilise une scène 450 × 800 et un mode FIT dans une coque de largeur `min(100vw, 56.25dvh, 506.25px)`. La planche mobile reproduit aussi cette réduction réelle :

| Fenêtre | Coque de jeu calculée | Lampiste 48 unités | Héros 46 × 52 unités |
| --- | --- | --- | --- |
| 320 × 568 | 319,5 px | environ 34,08 × 34,08 px | 32,66 × 36,92 px |
| 390 × 844 | 390 px | environ 41,60 × 41,60 px | 39,87 × 45,07 px |

Le Lampiste reste distinguable par ses deux volumes ronds avancés, son dos chargé et sa posture voûtée. Le héros présente une silhouette plus verticale et symétrique. Les silhouettes sont comparées directement à dimensions de scène, puis à l’échelle mobile sur un décor Zone 5 archivé. Le Rampant, le Cracheur et l’Éclateur bonbonne sont également montrés, copies inchangées des masters validés.

À la plus petite échelle, les yeux et les mains deviennent des indications de couleur ; la lecture repose surtout sur le casque ocre et les deux lampes. Cette limite est assumée : ne pas rajouter de micro-détails pour la compenser.

## Animation future — documentation seulement

Groupes stables du SVG : `sac-stable`, `corps-stable`, `visage-stable`, `casque-stable`.

Groupes prévus pour des mouvements futurs : `jambes-futures`, `lampe-casque-future`, `bras-arriere-futur`, `projecteur-futur`, `bras-mains-futurs`. La séparation en groupes est une préparation de dessin, pas un rig fonctionnel.

Recommandations après validation humaine : garder ensemble le projecteur et ses points de contact lors d’une visée ; petite alternance de jambes pour move ; variation contenue de la lentille pour prepare ; recul très court du projecteur pour attack, sans allonger le délai existant. Idle, recovery, hit et death devront préserver la même silhouette et la même emprise. Aucun de ces états n’est créé ici.

## Livrables

- `v036a-lampiste-final/master/lampiste.svg` — master unique.
- `v036a-lampiste-final/silhouettes/lampiste.svg` — même tracé monochrome.
- `v036a-lampiste-final/gallery.html` — galerie complète et source d’origine.
- `v036a-lampiste-final/mobile.html` — planche compacte aux deux formats.
- `v036a-lampiste-final/comparaisons/heros-lampiste.html` — comparaison directe, couleur et silhouette.
- `v036a-lampiste-final/comparaisons/reference-master.html` — avant / après.
- `v036a-lampiste-final/captures/` — captures navigateur.
- `v036a-lampiste-final/tests.txt` — sortie intégrale de la suite existante.
- `v036a-lampiste-final/scope-validation.json` — contrôle SHA-256 des fichiers existants et des références.

Ouvrir `http://127.0.0.1:5195/v036a-lampiste-final/gallery.html` pendant que le serveur de validation tourne. Le serveur dédié est en lecture seule, sur boucle locale, et ne sert pas le jeu. Les fichiers HTML fonctionnent aussi localement.

## Validation et périmètre

- Suite existante : **995 tests réussis / 995**, 0 échec, 0 ignoré. Aucun test existant modifié ou supprimé.
- Contrôle de périmètre : **5 286 fichiers préexistants identiques**, aucun supprimé, aucun nouveau fichier en dehors du dossier de livraison et de cette documentation. Les empreintes excluent uniquement `.git` et `node_modules`.
- Validation navigateur : formats 320 × 568 et 390 × 844, tailles demandées et échelle FIT, images chargées, pas de débordement horizontal, aucune erreur console sur les pages finales. Il s’agit d’une vérification navigateur redimensionné, pas d’un nouveau test physique Android.
- Aucun asset de production remplacé, aucun gameplay ou hitbox modifié. Aucune animation, aucune sprite sheet, aucune intégration, aucun commit/push. Aucun travail sur Boutefeu ou Gueule-Noire.

**Arrêt pour validation humaine du master.**
