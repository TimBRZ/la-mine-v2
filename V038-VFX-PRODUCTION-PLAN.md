# La Mine V2 — Préparation de production VFX

Référence humaine : **Planche VFX validée — La Mine V2.png**. Périmètre effectivement illustré et validé : **Fusil à pompe**. Cette préparation ne vaut pas validation du dessin des autres armes, mobs ou boss.

## Choix retenus et ordre de réalisation

| Ordre | Effet retenu | Rôle existant / priorité | Lisibilité attendue | Animation / complexité |
|---|---|---|---|---|
| 1 | Départ B — Large | Accusé de départ au canon ; P1 | Flash ouvert, ivoire au centre, jaune/orange, silhouette dentelée distincte d’une balle ; ne masque pas la visée | 3 images sur **65 ms**, ancrage à gauche, axe du canon ; faible |
| 2 | Plombs A — Traits simples | Représentation de chaque plomb réel ; P1 | Trait effilé clair, extrémité jaune, contour charbon. Un sprite par projectile, jamais un cône opaque | 1 image orientée selon vitesse ; aucune nouvelle traînée persistante ; faible |
| 3 | Impact ennemi B — Mix sparks | Confirmation de touche / kill au point visuel actuel ; P1 | Petit éclat central, quelques étincelles et fragments ; pas un disque de dégâts, pas de variante critique | 4 images sur **120 ms**, expansion puis extinction ; faible à moyenne |
| 4 | Impact décor C — Marqué | Réserve visuelle, **aucun événement décor/sol trouvé dans le runtime** ; P3 bloqué au raccordement | Quelques éclats minéraux et poussière brune brève ; plus mat que l’impact ennemi ; pas de nuage durable | 5 images, **180 ms proposés pour la prévisualisation seulement** ; moyenne |

Les trois vignettes dans une case de la planche ne sont pas interprétées comme trois nouvelles variantes gameplay, ni comme un nombre obligatoire de frames. La lecture la plus sobre est retenue : flash sans fumée, traits sans fragments permanents, impact jaune/orange sans accent rouge « critique ». La poussière demeure réservée à l’impact décor ponctuel.

## Étape exécutée maintenant

Un premier lot de préproduction vectorielle a été construit dans `v038-vfx-production-prep/` : **4 masters SVG transparents, 4 bandes SVG, un manifeste et une galerie animée**. Les trois premiers effets reprennent les durées et dimensions d’affichage du catalogue actuel. Le quatrième est explicitement hors runtime. Aucun fichier de production n’a été modifié.

Ces sources sont prêtes pour une revue technique et visuelle, puis un raccordement borné. Elles ne sont pas présentées comme déjà intégrées ou testées en run avec leur nouveau rendu. Le compte de quatre effets inclut la réserve décor ; seuls trois ont un point de raccordement existant.

## Contrat de fabrication

- Cellules 64×64, alignement régulier, fond transparent ; bandes respectives 192×64, 64×64, 256×64 et 320×64. Pas de filtres, de flou, de glow, d’image incorporée ou de texture externe dans les SVG.
- Palette : charbon `#10191d`, orange `#f38b18`, jaune `#ffcb45`, ivoire `#fff2b0`. Décor uniquement : roche `#71656a`, poussière `#916b43`. Contours foncés, aplats nets.
- Dimensions monde conservées : flash **32×26**, plomb **18×18**, impact **23×23**. Décor **28×28 proposé**, sans effet sur une collision. Les pixels occupés par le dessin sont plus petits que sa cellule.
- Origine flash **(0, 0.5)**, autres **(0.5, 0.5)**. Pas de translation du projectile simulé. Pas de modification du pivot de l’arme ou du héros.
- Durée totale issue de `src/weapon-visuals.js`, pas déduite d’une cadence vidéo : 3 intervalles de 21,67 ms pour le flash ; 4 de 30 ms pour l’impact. À 60 Hz le flash ne fournit qu’environ quatre rafraîchissements ; ajouter des frames n’allongerait pas sa lisibilité.
- Le fondu existant `Effects.update()` est reproduit dans l’aperçu d’impact. Ne pas cumuler un fondu encodé dans les frames avec un nouveau fondu supplémentaire.
- Les étincelles sont intégrées à la bande : **zéro émetteur de particules supplémentaire**. Pour l’intégration, vérifier le cumul avec les bursts existants avant toute décision ; ne pas ajouter le nombre de fragments dessinés à une collision.
- Sources SVG natives compatibles avec la chaîne actuelle. Si un PNG est nécessaire : rasteriser en RGBA, sans matte, depuis ces sources, aux dimensions déclarées ; prévoir extrusion de bord uniquement lors d’un regroupement d’atlas. Ne pas étirer les sprites monde pour augmenter leur résolution.
- Charge mémoire indicative en RGBA : 13 cellules ×64²×4 = **208 Kio**, hors objets et versions supplémentaires. C’est une estimation de texture, pas une mesure de performance.

## Raccordement futur : points à préserver

1. `muzzle-shotgun` et `projectile-shotgun` ont des clés propres. Garder l’origine visuelle issue de `heldWeaponPose`, sans déplacer l’origine gameplay ni prolonger la vie d’un projectile.
2. **`impact-ballistic` est partagé avec la Mitraillette.** `RoomScene.impactFeedback()` choisit aujourd’hui énergie/ballistique. Ne pas remplacer cette case partagée pour imposer la planche Fusil au SMG : créer une clé visuelle Fusil dédiée et la sélectionner depuis le contexte d’arme existant, sans changer les événements de combat.
3. Conserver l’ordre de rendu : VFX joueur profondeur7, warnings8 ; pools existants, clipping à l’arène, sortie des projectiles, pénétration et déduplication des touches inchangés. Garder les secours lorsque la texture ou une frame manque.
4. Aucun impact décor automatique à expiration, en bord de carte ou au contact d’un dessin de roche. Cela inventerait un événement absent. Le fichier décor reste une réserve jusqu’à décision explicite sur un événement réel.
5. Mode mouvement réduit : maintenir le signal de touche stable existant et les télégraphes ; ne pas rendre un avertissement dépendant de particules supprimées.
6. Aucun effet critique, aucun flash spécial pour une prétendue touche critique, aucune augmentation de dégâts associée à une couleur ou un éclat.

## Lots suivants : ordonnancement, sans validation graphique inventée

Les familles ci-dessous existent déjà dans l’audit V0.38A. Leur inclusion au planning ne constitue pas une nouvelle direction artistique validée par la planche Fusil.

| Lot | Effets à traiter | Rôle / priorité | Lisibilité requise | Complexité et support conseillé |
|---|---|---|---|---|
| 2 | Mitraillette : balle, flash, impact ; Grisou X : impulsion, flash, impact, continuité | Armes joueur fréquentes ; P1 | Distinguer énergie et balistique, puis cadence/direction ; aucune transposition automatique du grand flash Fusil | Faible à moyenne ; 1 image balistique, mini-clips énergie, durées actuelles conservées |
| 3 | Foreuse/Draisine, Sondeur/Grisouteux, Cracheur/Éclateur, Lampiste/Boutefeu, Riveteur/Chauffeur/Scorificateur | Projectile, fragment, gaz, attaque de proximité selon le runtime ; P1 puis P2 | Différencier joueur/hostile par forme et contour, puis matériau par accent ; pas uniquement la couleur | Faible à moyenne ; projectile 1–4 images, impact 3–5, sans augmenter les budgets |
| 4 | Couloir, cercle, éventail, rail, zone chaude et poche de gaz | Préparation / activité / sortie sûre ; P1 | Géométrie immédiatement fidèle aux dégâts ; trous sûrs visibles pendant toute l’attaque | Graphics/procédural à conserver pour limites variables ; petites textures décoratives seulement après revue |
| 5 | Impacts boss, slams, pression, vapeur, fissures, balayages lumière/Forge | Grandes menaces régulières ; P2 | Centre d’impact lisible mais limites et trajectoires prioritaires ; pas d’opacité pleine masquant les tirs | Moyenne ; noyaux animés courts + géométrie existante, pas de grande sheet couvrant une arène |
| 6 | Six ultimes et six combinaisons Z5/Z6, surcharge et arcs existants | Séquences rares ; P3 | Ordre, suivi/verrouillage, zones sûres et menaces secondaires toujours lisibles | Moyenne à forte pour composition ; réutiliser les primitives, ne pas fabriquer une nouvelle famille par boss |

## Effets à garder particulièrement sobres

- **Plombs** : pas de panache, pas de fumée par plomb ; la salve comporte déjà plusieurs tirs.
- **Flash** : 65 ms seulement, pas d’augmentation arbitraire de taille ; ne pas recouvrir une ligne ennemie.
- **Impacts** : éviter l’accumulation hit + kill + étincelles + poussière + explosion ; les animations n’attestent pas d’une nouvelle zone de dégâts.
- **Télégraphes** : pas de scintillement qui efface les limites, ni poussière sur les ouvertures sûres.
- **Vapeur/gaz** : opacité faible, contour utile ; pas de brouillard permanent ajouté.
- **Boss/ultimes** : réserver le plus fort contraste aux dégâts actifs ; garder le plafond de projectiles et les attaques simultanées lisibles, sans toucher au directeur d’attaques.

## Validation et livrables

- Galerie : `v038-vfx-production-prep/gallery.html` ; source humaine originale conservée dans `reference/`.
- Contrat machine : `manifest.json`, avec durée, pivot, dimensions, statut et chemins par clip.
- Masters et bandes : `assets/` ; générateur reproductible : `build.mjs`.
- Contrôles et captures : `notes/validation.json`, `notes/tests.txt`, `captures/mobile-320.jpg`, `captures/mobile-390.jpg`.
- Les contrôles navigateur portent sur les prévisualisations à temps réel et ralenti ; **ce n’est pas un test Android physique ni une validation d’intégration en run**.

Résultats : **1 252 / 1 252 tests réussis**, zéro échec ou test ignoré. Les **3 574 fichiers src/ et tests/** sont identiques à l’état audité V0.38A par SHA-256. Les huit SVG sont valides, sans filtre ni image incorporée. Neuf images chargées dans la galerie (huit SVG + référence), zéro erreur / avertissement console ; absence de débordement horizontal à320×568 et390×844. Les traits sont très fins à l’échelle réelle ; les éclats secondaires s’effacent à cette taille et ne portent aucune information indispensable. Le flash reste identifiable par sa masse ouverte, l’impact par son centre compact.

Consultation : lancer `node v038-vfx-production-prep/server.mjs`, puis ouvrir `http://127.0.0.1:5214/v038-vfx-production-prep/gallery.html`. Ce serveur de consultation est indépendant du serveur du jeu.

Aucun gameplay, timing, hitbox, comportement ou asset de production modifié. Aucun commit/push. Premier lot de préparation exécuté ; arrêt avant intégration et avant extension graphique aux autres armes.
