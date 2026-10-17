# La Mine V2 — VISUAL BIBLE V0.32

**13 octobre 2026 · Audit et prescriptions uniquement · Production actuelle V0.31.0 conservée.**

Cette bible prépare une refonte visuelle de **mine industrielle française rétro-futuriste**, lisible sur mobile. Elle ne livre aucun nouvel asset de jeu et ne change aucun comportement. Les palettes, dimensions cibles et étapes futures sont des prescriptions à valider, pas des fonctionnalités déjà implémentées.

Le travail a été réparti entre cinq audits spécialisés : [direction artistique](audit-v032/direction.md), [personnages et ennemis](audit-v032/entities.md), [environnements](audit-v032/environments.md), [UI/VFX](audit-v032/ui-vfx.md), [performance](audit-v032/performance.md). La présente bible rassemble leurs décisions ; les annexes conservent les détails de provenance.

**Livrables associés :** [inventaire complet des visuels](VISUAL-ASSET-INVENTORY-V032.md), [captures et observations](audit-v032/CAPTURES.md), [validation et périmètre](audit-v032/VALIDATION.md).

## Lecture de l'état actuel

Les captures du 13 octobre utilisent les vrais renderers actuels dans un banc isolé sur 127.0.0.1:5182, avec profil fictif et scènes arrêtées pour inspection. Elles documentent l'apparence ; elles ne constituent ni des runs naturelles, ni un benchmark Android, ni une mesure de fréquence des attaques. La petite mention « AUDIT V032 » appartient au banc, pas à la future UI. La progression et les ressources visibles sont fictives ; la sauvegarde habituelle n'a pas été utilisée.

Trois défauts prioritaires sont établis :

- **Langage graphique discontinu** : héros et acteurs Zones 1–2 en SVG modelé, acteurs Zones 3–6 principalement en pictogrammes ; plusieurs boss partagent le dessin du mob agrandi.
- **Hiérarchie mobile inégale** : le nom d'arme domine le HUD, tandis que des informations de choix restent à 6–9 px. Les grandes cibles tactiles ne compensent pas un petit texte.
- **Risque de masquage** : les effets à profondeur 40 sont dessinés au-dessus des avertissements à profondeur 8. Ce constat de couche ne prouve pas chaque occultation, mais impose une vérification des superpositions dès le premier lot.

Le socle à conserver est solide : fonds précalculés, pools bornés, télégraphes géométriques, extinction limitée au décor, trois armes distinctes, identité de Ravens et avant/arrière Rat/Wagon validés.

## Sommaire

1. Vision et construction graphique
2. Palette générale
3. Palettes des zones
4. Personnages
5. Ennemis
6. Boss
7. Armes
8. Environnements
9. UI
10. VFX
11. Animation
12. Performance
13. Priorités
14. Plan d'intégration

## 1. Vision et construction graphique

La Mine V2 doit évoquer une **mine industrielle française rétro-futuriste**, compacte et usée, où les travailleurs ont adapté leur équipement à une énergie souterraine difficile à contenir. Le rétro-futurisme vient des réservoirs, hublots, jauges, transformateurs et tuyaux qui rendent l'énergie compréhensible. Il ne vient ni de rouages décoratifs, ni de runes, ni de panneaux holographiques. Le charbon, la fonte, les tôles réparées et les lampes donnent le vocabulaire ; les silhouettes et les réactions mécaniques donnent la personnalité.

La cible « arcade premium » signifie ici : une menace comprise rapidement, une famille graphique reconnaissable, un petit nombre de détails bien placés, des animations accordées aux actions. Elle ne signifie pas plus de textures, de lueur ou de particules.

Le constat principal de l'audit est une rupture de langage : les SVG modelés des Zones 1–2 côtoient les pictogrammes procéduraux des Zones 3–6 ; les écrans méta n'emploient pas tous les mêmes plaques et icônes. La refonte doit **unifier construction, valeurs, perspective et états**, avant d'ajouter de la patine.

### Cinq règles qui tranchent les choix

1. Un acteur se reconnaît d'abord à son contour noir ; sa couleur et ses petits accessoires ne réparent pas une silhouette partagée.
2. Toute lumière de combat raconte un état réel : préparation, tir, impact, danger actif ou énergie contenue. Le décor lumineux reste périphérique et moins contrasté.
3. Une machine montre son outil, sa masse et ses appuis. Une bouche de tir, un butoir ou un racloir désigne clairement l'avant.
4. L'usure suit les usages : tranche polie, charnière grasse, suie autour d'un évent, plaque de réparation. Pas de bruit uniforme collé sur tout l'asset.
5. Le dessin suit la simulation. Une animation ne retarde jamais un tir, une collision, un kill ou la disparition d'un danger.

### Matières communes

| Matière | Construction graphique | À éviter |
|---|---|---|
| Fonte / acier | Une masse sombre, une face moyenne, une tranche claire courte ; joint ou vis à un point d'assemblage réel | Multiples reflets chromés, gradients sur chaque rivet, métal neuf partout |
| Charbon / roche | Trois ou quatre grandes cassures anguleuses ; reflets mats et rares | Bruit photographique, petits cristaux répétitifs, bord lumineux intégral |
| Toile / cuir | Une couleur principale, un pli à l'articulation, une réparation reconnaissable | Motifs fins de tissu qui scintillent lors du déplacement |
| Verre / énergie | Hublot sombre bordé de métal, petit cœur lumineux contenu | Globe magique flottant, bloom débordant sur toute la machine |
| Bois | Masse chaude, une ou deux fibres larges, bout ou attache sombre | Veinage intégral illisible sur mobile |

**Lumière :** éclairage principal constant en haut-gauche pour les volumes dessinés ; ombre courte au sol attachée au point actuel de l'entité. Les émissions changent localement une bouche, une jauge ou une fissure, pas toute la scène. Pour les machines qui tournent à 360°, préférer une vue de dessus légèrement modelée qui ne donne pas l'impression d'un profil mis tête en bas. Valider les huit caps avant de choisir un renderer ; ne pas appliquer ce changement indistinctement aux sprites déjà validés.

**Contours :** contour extérieur encre dominant, traits intérieurs plus fins et moins nombreux. Cible à la taille affichée de 320 px : environ 1,5–2 px pour le contour d'un acteur, **2 px minimum à vérifier pour un signal critique**, sous-contour compris. La texture source n'est pas le pixel écran : 2 unités du repère 450 deviennent environ 1,42 px à 320. La bordure décrit la limite logique et peut déborder graphiquement autour ; elle ne redéfinit jamais la zone de dégâts.

**Détail :** héros/ennemi = trois masses de valeur et un signe de rôle dominant ; une grande réparation ou accessoire plutôt que dix petites vis. Boss = silhouette à deux grandes masses et deux modules reconnaissables, pas simplement l'ennemi normal agrandi. À l'échelle réelle, éliminer tout détail qui ne contribue ni au rôle, ni à la matière, ni à la personnalité. C2G est un marquage discret sur grand visuel, pas un texte de combat à lire.

## 2. Palette générale

Les tokens ci-dessous sont une palette de référence, volontairement restreinte. Les variantes de zone modifient les matières et le décor ; elles ne recolorent pas librement les télégraphes hostiles.

| Fonction | Couleur de référence | Usage et interdiction |
|---|---|---|
| Encre / séparation | `#10191D` | Contour extérieur, sous-contour des signaux, creux. Éviter l'aplat noir intégral sur le héros. |
| Acier sombre | `#203139` | Panneaux, masses arrière, châssis. |
| Acier relevé | `#30434A` | Faces supérieures, UI surélevée ; pas de relief sur chaque cellule. |
| Tranche usée | `#718783` | Arête courte ou bord de panneau, pas texte essentiel. |
| Toile / texte principal | `#F0ECDF` | Visages éclairés, libellés, chiffres. Les grands aplats crème restent rares en combat. |
| Texte secondaire | `#BFCCC6` | Aide et métadonnées lisibles, jamais utilisées comme fond lumineux. |
| Cuivre / action UI | `#EEC274` | CTA et sélection accompagnés d'un mot ou d'une coche. Usage UI séparé de l'arène. |
| Peinture chantier | `#B3944F` | Casque, protection, bande usée. Moins brillante que la télégraphie ambre. |
| Rouille / réparation | `#8D5039` | Petites zones de matière, pièces anciennes, jamais signal seul. |
| Énergie alliée Grisou | `#82E8C2` | Traits énergétiques et impulsions alliées ; cœur court `#EEFFF7`. La forme reste indispensable. |
| Télégraphe hostile | `#FFC46B` | Bord d'attente, chevrons, marqueurs ; sous-contour encre. Jamais une particule ambiante. |
| Danger actif | `#FF795F` | Bord et noyau hostiles, accompagnés d'un motif plein distinct de l'attente. |
| Refroidissement inoffensif | `#8EB5B9` | Faible intensité, traits interrompus ; enlever le signe de danger actif. |
| Acquis / validation UI | `#97D6B5` | Coche et état textuel. Ne signifie pas invulnérabilité en combat. |
| Épique UI | `#B6A1E3` | Étiquette ÉPIQUE et cadre à double encoche. Pas de cristal, aura magique ou recoloration générale. |

**Attention au Grisou hostile :** une poche de gaz conserve un bord ambre/corail et une forme hostile, même si son intérieur est verdâtre. Le décor de la Faille emploie un vert plus terne et sans cœur blanc ; le projectile allié est un trait dirigé, le projectile ennemi un noyau compact à halo sombre. La couleur seule ne décide jamais de l'appartenance.

**Attention aux Forges :** la lumière de four `#C77446` reste dans les bouches périphériques. Le sol sûr n'émet pas d'étincelles orange. L'ambre vif est réservé à une préparation réelle et le corail vif au danger actif.

### Contraste vérifiable

Calcul sRGB sur ces aplats opaques proposés : texte principal sur panneau sombre **11,39:1** ; secondaire sur panneau relevé **6,25:1** ; CTA cuivre sur panneau sombre **8,08:1**. Le bord ambre sur acier des Forges `#37434A` atteint **6,47:1**, le corail **3,95:1**. Ce dernier a besoin du sous-contour et du motif ; ce chiffre n'autorise pas un texte essentiel corail de petite taille. Ces calculs ne prouvent pas le contraste d'une image compositée : contrôler les captures finales avec transparence et effets.

Objectifs de recette : texte utile ≥4,5:1 sur son fond effectif ; signe essentiel distinct du fond à ≥3:1 et doublé par forme/position ; pas d'information essentielle portée uniquement par saturation ou clignotement. Ce sont des seuils de conception, pas une déclaration de conformité globale.

## 3. Palettes des zones

La palette globale garde la priorité sémantique. Chaque zone doit présenter **deux signes indépendants de la couleur** : composition au sol et silhouette périphérique. Détails complets, lumières, props et hazards : [audit des environnements](audit-v032/environments.md).

| Zone | Matières / palette locale | Grande signature sans UI | Garde-fou |
|---|---|---|---|
| Galeries | Charbon `#171B1C`, roche `#34352F`, bois `#6C5135`, tranche bois `#967144`, lampe `#E9B963` | Étais épais + voie simple + poches de charbon ; petites lumières humaines chaudes | Bois et outils hors aire libre ; pas de feu central ni de pavés tous identiques. |
| Voies Abandonnées | Ballast `#1B2428`, rail `#415456`, rouille `#8D5039`, traverse `#554637`, signal terne `#91B5BD` | Faisceaux horizontaux + signal à capot + levier | Rail statique moins contrasté que charge/rail hostile ; aucun faux clignotement d'alerte. |
| Puits 59 | Vide `#111A20`, acier `#34434B`, tranche `#748589`, graisse `#262723`, sécurité `#B3944F` | Câbles verticaux + grand treuil partiellement hors cadre + passerelles longitudinales | Ne pas dessiner un trou là où le joueur peut marcher. |
| Faille de Grisou | Roche `#172725`, bloc `#30423A`, dépôt `#758364`, conduite `#6E6750`, lueur `#82CFA7` | Fracture asymétrique + conduite rompue + dépôts crustés | Pas de gemmes parfaites ; le vert de décor reste faible et sans trait blanc mobile. |
| Profondeurs Noires | Roche `#10151F`, acier `#29323E`, câble `#48484B`, poussière `#66707F`, lampe rare `#B9C8D7` | Installations mortes + câble affaissé + lampes qui s'éteignent réellement dans la présentation | Extinction limitée au décor ; acteurs, HUD et dangers gardent toute leur lisibilité. |
| Forges Oubliées | Fonte `#1D252B`, acier `#37434A`, calamine `#59453B`, cuivre brûlé `#91573F`, four `#C77446` | Deux grosses bouches chaudes + douze plaques froides + tuyaux lourds | Plaques aux positions et dimensions actuelles ; aucun feu sur le sol sûr. |

Le sol central possède moins de ruptures et de contraste que les acteurs. La majorité des détails narratifs se trouve à la périphérie. La vue reste celle d'une arène plane : ombres et perspective ne doivent pas inventer des murs, escaliers, trous ou obstacles jouables.

## 4. Personnages

Les dimensions actuelles d'affichage servent de premier cadre, et **aucune proportion proposée ne modifie une hitbox**. Si une silhouette future occupe plus d'espace, la superposer à son cercle/volume logique en QA ; conserver son centre et ses points d'émission. Pas d'agrandissement automatique de tous les sprites.

- **Héros :** mineur trapu, environ trois têtes et demie de haut dans le dessin ; casque et lampe en masse supérieure, veste/protections au centre, bottes larges en bas. Trois signes à conserver sur petite vignette : casque ocre net, épaule renforcée asymétrique, arme détachée du buste. Batterie mate à la ceinture, équipement C2G discret. Ni armure militaire, ni épaulettes fantasy.
- **Ravens :** calvitie, lunettes, barbe courte/bouc et sourire légèrement moqueur sont invariants. Veste poussiéreuse, radio, gants et casque à lampe sous le bras restent son vocabulaire. Produire un visage de badge, un buste de dialogue et un portrait d'accueil depuis un même design ; ne pas laisser le recadrage automatique choisir la personnalité. Pas de costume ni de nœud papillon.
- **Mêlée :** masse compacte et avant lourd ; dos sombre, outil ou mâchoire distincte à l'avant. Une pose de préparation exprime la ruée existante, sans faire croire qu'elle a commencé avant le timer.
- **Tireur :** silhouette plus étroite, canon/buse sortant clairement du corps, réservoir ou magasin à l'arrière. L'organe de tir vise la direction décidée par la simulation. Les lampes permanentes restent moins vives que l'état armé.
- **Poseur de zones :** outil dirigé au sol, centre de gravité bas ou bras articulé ; aucune ligne laser décorative qui ressemble à un tir réel.
- **Machine lourde :** outil dominant + bloc moteur + appuis visibles ; roues, chenilles ou vérins ont une fonction lisible. Une réparation asymétrique suffit à lui donner du caractère.
- **Boss :** identifier le mécanisme principal en silhouette noire et le différencier des autres boss de sa zone. Donner à l'Effondreur un portique large, au Marteau-Pilon une masse centrale verticale ; au Crachefer une bouche unique, à la Chaudière des soupapes réparties. Les mêmes motifs ne sont pas simplement mis à l'échelle.

**Rat et Wagon Fou : dessins avant/arrière et logique d'orientation validés à préserver.** Ils ne constituent pas des candidats au redessin systématique. Toute retouche future de palette doit être comparée aux références actuelles, aux huit directions et à la trajectoire réelle ; ne pas toucher au flip, au `chargeAngle`, à l'ancrage ou aux rails pour une raison esthétique.

La liste exhaustive et les directions par entité sont dans [entities.md](audit-v032/entities.md), avec distinction entre assets habituels et rendus de secours. Un secours moins détaillé n'est pas nécessairement un asset à produire en double : décider son rôle technique avant de le refaire.

| Entité | État actuel et source | Problème / limite | Direction future concrète | Priorité |
|---|---|---|---|---|
| Héros | [hero.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/hero.svg), A/H. Mineur à casque ocre et lampe, vêtement vert, salopette bleutée, barbe, lunettes/visière et bottes. Affichage 46 × 52 unités du jeu, ancrage vertical .62 ; flip horizontal suivant l’angle, arme séparée. | Déjà un mineur, pas un soldat. Les nombreux dégradés et petits traits deviennent secondaires à petite taille. Bras et corps gardent la même pose pendant marche/tir. Pas de signe C2G identifiable dans l’asset. L’identité se confond partiellement avec les autres mineurs casqués. | Préserver casque/lampe et tenue ouvrière ; corps trapu, larges bottes et protections asymétriques, 3 grandes masses de valeur. Une épaule ocre et une batterie Grisou mate à la ceinture comme signatures ; petit marquage C2G uniquement visible aux grandes tailles, jamais un texte indispensable au combat. Arme reste au premier plan et à son ancrage actuel. Concevoir poses séparées jambes/corps et bras/visée sans déplacer la collision. | P0 |
| Contremaître Ravens | I, portrait réellement inspecté : chauve, grosses lunettes noires, barbe courte/bouc, sourire légèrement moqueur ; veste de travail sombre avec bandes jaunes sales, radio, gants pendus, casque à lampe sous le bras. Le texte des répliques soutient son caractère. | Identité conforme et à conserver. Densité picturale, grain et modelé bien plus réalistes que le jeu ; le badge recadre le même grand portrait, ses accessoires ne survivent pas aux petites dimensions. Portrait unique, expression constante. | Conserver exactement visage, calvitie, lunettes et barbe. Préparer un master simplifié en aplats modelés et trois cadrages manuels : visage badge, buste dialogue, portrait accueil. Deux ou trois expressions sobres (sourire, sourcil ironique, sérieux) ; casque sous bras permet de garder la calvitie visible. Aucun costume, nœud papillon ni ajout de rouages décoratifs. | P1 |

### Sources des tableaux entités

| Référence | Sources de production | Usage réel |
|---|---|---|
| A | [combat-appearances.js](C:/LaMineV2/la-mine-v2-v01/src/combat-appearances.js), [enemies/view.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/view.js) | 15 SVG chargés en 128 × 128 : héros, 5 ennemis Z1–2, 6 boss Z1–2, 3 armes. Images statiques avec transformation légère. |
| B | [enemies/registry.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/registry.js), [boss-catalog.js](C:/LaMineV2/la-mine-v2-v01/src/boss-catalog.js) | Liste exhaustive : 17 ennemis et 18 boss ; rattachement des renderers. |
| C | [enemies/textures.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/textures.js), [enemies/rail-textures.js](C:/LaMineV2/la-mine-v2-v01/src/enemies/rail-textures.js), [boss-art.js](C:/LaMineV2/la-mine-v2-v01/src/boss-art.js), [rail-boss-view.js](C:/LaMineV2/la-mine-v2-v01/src/rail-boss-view.js), [textures.js](C:/LaMineV2/la-mine-v2-v01/src/textures.js) | Dessins générés de secours pour héros/Z1–2 lorsque le SVG n’est pas disponible ; ne pas les confondre avec l’apparence habituelle. |
| D | [shaft-art.js](C:/LaMineV2/la-mine-v2-v01/src/shaft-art.js), [shaft-actors.js](C:/LaMineV2/la-mine-v2-v01/src/shaft-actors.js) | Apparences générées effectivement utilisées en Z3. |
| E | [rift/art.js](C:/LaMineV2/la-mine-v2-v01/src/rift/art.js), [rift/config.js](C:/LaMineV2/la-mine-v2-v01/src/rift/config.js) | Apparences générées effectivement utilisées en Z4. |
| F | [depths/art.js](C:/LaMineV2/la-mine-v2-v01/src/depths/art.js), [depths/config.js](C:/LaMineV2/la-mine-v2-v01/src/depths/config.js) | Apparences générées effectivement utilisées en Z5. |
| G | [forge/art.js](C:/LaMineV2/la-mine-v2-v01/src/forge/art.js), [forge/config.js](C:/LaMineV2/la-mine-v2-v01/src/forge/config.js) | Apparences générées effectivement utilisées en Z6. |
| H | [room-scene.js](C:/LaMineV2/la-mine-v2-v01/src/room-scene.js), [effects.js](C:/LaMineV2/la-mine-v2-v01/src/effects.js) | Animation du joueur, synchronisation des vues, impacts et disparition des entités. |
| I | [ravens.js](C:/LaMineV2/la-mine-v2-v01/src/ravens.js), [portrait](C:/LaMineV2/la-mine-v2-v01/src/assets/porion-ravens.png), [menu/menu.css](C:/LaMineV2/la-mine-v2-v01/src/menu/menu.css), [menu/kit.css](C:/LaMineV2/la-mine-v2-v01/src/menu/kit.css) | Portrait raster, badges recadrés et répliques. Identifiant technique « porion » conservé. |

**Constat majeur :** les Zones 1–2 bénéficient de sprites SVG modelés, ombrés et légèrement animés. Les Zones 3–6 utilisent des pictogrammes géométriques générés, sans `COMBAT_APPEARANCES`. Ce changement de langage explique mieux l’incohérence que le simple manque de détails. Une bible commune doit d’abord harmoniser volumes, contours, perspective et poses ; ajouter des textures fines partout ne suffirait pas.

![Accueil actuel 390 × 844 : héros de menu plus illustré que le sprite de combat, Ravens en badge.](audit-v032/captures/home-390.jpg)


## 5. Ennemis

Dimensions ci-dessous : tailles d’affichage nominales dans le repère de jeu 450 × 800, pas tailles CSS ni hitboxes. À 320 px de largeur, multiplier approximativement par 0,711 ; un détail de 2 unités devient environ 1,4 px. Les collisions doivent garder leurs valeurs actuelles indépendamment des nouvelles dimensions d’images.

| Entité / première zone | État actuel et source réelle | Problème / limite de lecture | Direction future concrète | Priorité |
|---|---|---|---|---|
| Rat de galerie `rat` / Z1 | [rat.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/rat.svg), 42 × 36, A. Profil museau long à droite, arrière large, queue à gauche ; orientation `travel` tirée du déplacement réel. | **Correction validée à conserver.** Le risque restant concerne surtout les petits détails et la réduction mobile, pas une orientation inversée constatée. | Garder dessin avant/arrière et algorithme actuels. Dans une future harmonisation de palette seulement : corps sombre compact, museau clair, queue lisible sans l’allonger ; pattes sur 2 poses si nécessaire. Toute redirection artistique doit être comparée aux huit directions validées. | P1 — conserver, pas refaire en priorité |
| Mineur grisouteux `miner` / Z1 | [miner.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/miner.svg), 62 × 66, A ; mineur casqué trapu, équipement brun, flip horizontal. | Très proche de la grammaire casque/lampe du héros ; pas de préparation corporelle spécifique, menace de contact surtout comprise par déplacement. | Dos plus large et voûté, outil industriel massif porté bas, casque cabossé à lampe masquée ; visage et salopette restent secondaires. Réserver le casque jaune net au héros. | P0 |
| Foreuse autonome `drill` / Z1 | [drill.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/drill.svg), 58 × 50, A ; chenilles, gros foret à droite, violet/acier, rotation entière. | La forme explique très bien le perçage mais moins bien son attaque à distance ; gros rivets et gradients rivalisent avec le canon. | Conserver foret et chenilles ; intégrer bouche de tir mécanique lisible près du foret et indicateur de charge ponctuel, sans changer origine réelle des tirs. Châssis bas ; éclairage uniquement à la préparation. | P0 |
| Wagon Fou `wagon` / Z2 | [wagon.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/wagon.svg), 59 × 52, A. Caisse arrière sombre, capot/phare/pare-chocs avant, `rail` fondé sur `chargeAngle`. | **Avant/arrière et orientation validés.** Aucun besoin démontré de redessin. Conserver la continuité phare → chevrons de rail → direction de charge. | Reprendre l’asset dans la palette commune sans changer silhouette, flip, ancrage ou comportement. Au plus rotation de roue discrète et secousse de suspension, qui ne modifie pas le départ ni la fin de charge. | P1 — préserver |
| Draisine `draisine` / Z2 | [draisine.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/draisine.svg), 58 × 53, A ; 4 roues, corps turquoise, canon long à droite, rotation. | Angle de dessin oblique tourné intégralement : aspect potentiellement renversé sur certains caps à examiner en planche 8 directions. Ne pas déclarer un bug sans capture. | Conserver le petit chariot ferroviaire et son canon ; trancher entre dessus légèrement incliné et profil à miroir. Séparer futur recul du canon du châssis, tout en gardant la trajectoire/timing actuels. | P0 |
| Foreur de fond `deepdriller` / Z3 | D, texture 60 × 48, boîte ocre et triangle métallique ; seul ennemi Z3 orienté par rotation de l’image. | Parenté avec Foreuse pertinente, mais le triangle simple manque de masse et de distinction de rôle de charge. | Foret conique plus large, moteur arrière lourd, protections latérales et pince de stabilisation ; silhouette flèche large, nez clairement lumineux avant ruée. | P0 |
| Sondeur `surveyor` / Z3 | D, 44 × 52, deux jambes en trépied, lentille cyan et antenne ; orientation fixe. | Reconnaissable comme instrument, mais glisse avec les jambes figées ; origine des zones d’impact peu exprimée par le corps. | Trépied à deux grandes jambes visibles et troisième courte, optique centrale large, tête inclinable ; compression mécanique pendant la télégraphie existante. Pas de laser décoratif confondu avec danger. | P0 |
| Grisouteux `gasminer` / Z3 | D, 42 × 50, jambes, corps vert/bidon, visière sombre et point clair frontal ; orientation fixe. | Son corps circulaire et son point clair ne suffisent pas à raconter la menace explosive ; ressemblance de nom avec Mineur grisouteux. | Porteur de réservoir dorsal gonflé, conduites rompues, masque de travail ; silhouette ballon supérieur et bottes minuscules. Valve qui se tend pendant la préparation, pas d’explosion avant l’activation réelle. | P0 |
| Rampant de Grisou `crawler` / Z4 | E, 48 × 48, noyau rond, six pattes et pointe haute ; orientation fixe (`null`). | Le dessin possède un avant vers le haut mais ne tourne pas avec le mouvement : risque de sensation de déplacement latéral/recul. Cercle porteur écrase la silhouette arachnéenne. | Masse basse asymétrique de schiste et câbles, trois appuis par côté ; pointe/mâchoire toujours alignée sur la direction réelle par un futur renderer dédié, sans changer `angle` ou déplacement logique. | P0 |
| Cracheur `spitter` / Z4 | E, 48 × 48, cercle central, trois points, conduit vertical ; même motif que Souffleur. | Orientation fixe et bouche peu séparée ; différence ennemi/boss repose surtout sur l’échelle. | Soufflet industriel étroit monté sur patins, une buse frontale claire et flexible arrière sombre ; dilatation du réservoir pendant télégraphie. | P0 |
| Éclateur `burster` / Z4 | E, 48 × 48, cercle avec deux éclats triangulaires et divisions radiales ; même motif que Cœur. | Se lit comme icône ou cristal fantasy plutôt que dispositif minier instable ; anatomie sans appuis. | Petite capsule de pression cerclée, fissures Grisou limitées et deux pieds courts ; trois secteurs de coque qui se tendent avant explosion, aucune nouvelle zone lumineuse hors danger réel. | P0 |
| Lampiste `lampist` / Z5 | F, 48 × 48, rectangle ouvrier à casque et grande lampe centrale ; orientation fixe. | Corps très symétrique, direction du faisceau surtout portée par télégraphe ; identique au Lampiste-Major agrandi. | Mineur voûté portant une lampe portative sur bras articulé ; petite tête décalée, énorme lentille tournée vers la visée réelle. | P0 |
| Boutefeu `blaster` / Z5 | F, 48 × 48, même base casquée que Lampiste, trois bâtons rouges verticaux. | Différence principalement à l’intérieur du contour ; les petits bâtons peuvent fusionner au mobile. | Gros sac de charges d’un côté, main/pince de pose de l’autre ; une charge maîtresse lisible, câble court. Préparation de pose calée sur le timer existant. | P0 |
| Gueule-Noire `blackmaw` / Z5 | F, 48 × 48, dos triangulaire, yeux clairs, crocs latéraux ; même motif que Masse Noire. | Lecture monstre possible, mais très proche d’un emblème symétrique ; bond non incarné par une pose spécifique. | Créature de charbon basse à dos cassé et mâchoire déportée ; posture ramassée, détente visuelle et retour au sol, ombre au point de collision conservé. | P0 |
| Chauffeur `stoker` / Z6 | G, 48 × 48, boîte acier encadrée d’orange, foyer et grille centrale ; même motif que Maître de Four. | Silhouette extérieure partagée avec Riveteur/Scorificateur ; foyer peut se confondre avec plaque active autour. | Petit four mobile ventru, cheminée latérale courte et trappe en ventre ; foyer moins lumineux hors attaque, volet qui s’ouvre seulement à la préparation. | P0 |
| Riveteur `riveter` / Z6 | G, 48 × 48, boîte acier, canon vertical vers le haut, deux appuis ; orientation fixe. | Arme orientée haut alors que la visée logique est variable : risque de mauvais sens visuel ; encore une boîte du même gabarit. | Silhouette longue et étroite, canon riveteur à l’avant, magasin latéral de gros rivets ; tête/canon tournés suivant la visée verrouillée, châssis lisible. | P0 |
| Scorificateur `scorifier` / Z6 | G, 48 × 48, barre horizontale, segment orange et triangle bas ; même motif que Marteau-Pilon. | Le motif marteau fait attendre un slam alors que le rôle est la ruée ; direction difficile à lire avec face fixe. | Racloir frontal en V, moteur compact à l’arrière, griffes de friction. Silhouette flèche basse, avant dans la direction de ruée verrouillée ; étincelles arrière discrètes, jamais en avance sur la traînée dangereuse. | P0 |

![Puits 59 actuel : cohabitation des SVG anciens et des acteurs procéduraux.](audit-v032/captures/combat-shaft59-390.jpg)


## 6. Boss

Les six boss Z1–2 utilisent les SVG du catalogue A (84 à 88 unités, Chef de Gare 82 × 86). Les douze boss Z3–6 sont des textures 84 × 84, face fixe ; elles ne bénéficient pas de l’animation `appearancePose`. Les propositions distinguent silhouette **et mécanique déjà existante**, sans ajouter d’attaque.

| Entité / zone | État actuel et source | Problème / limite | Direction future concrète | Priorité |
|---|---|---|---|---|
| La Haveuse / Z1 | [haveuse.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/haveuse.svg), A ; chenilles, carter ocre, grande lame dentée à droite, rotation. | Masse lisible mais denture figée ; rotation d’un volume pseudo-perspectif à tester sous tous les caps. | Garder carter et lame dominante ; animation de chaîne/dents limitée à deux poses et inclinaison d’effort pendant la charge, sans élargir collision ou lane. | P0 |
| Le Crachefer / Z1 | [crachefer.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/crachefer.svg), A ; four rond grillagé, cheminée, roues, volume violet/cuivre. | Source du tir moins lisible que le foyer central ; silhouette peut évoquer la future Chaudière. | Four horizontal court, bouche unique large, cheminée courte à l’arrière ; pulsation mécanique de bouche à la télégraphie, feu contenu dans le corps. | P0 |
| L’Effondreur / Z1 | [effondreur.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/effondreur.svg), A ; énorme traverse acier supérieure et deux pistons. | Masse supérieure pertinente mais aucun mouvement séparé de vérins ; parenté forte avec Marteau-Pilon. | Gros portique carré de soutènement et pieds très écartés ; vérins latéraux et poussière au sol pour l’éboulement existant. Réserver au Marteau-Pilon la masse centrale verticale. | P0 |
| Le Chef de Gare / Z2 | [stationmaster.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/stationmaster.svg), A ; homme en tenue de service, casquette, panneau rouge, flip horizontal. | Charge avec pose debout inchangée ; gilet or aussi brillant que celui du héros. | Carrure avant lourde, manteau de travail court, signal à palette porté comme bélier ; abaisser le buste uniquement dans le rendu durant préparation, retour visuel en récupération. | P0 |
| La Locomotive / Z2 | [locomotive.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/locomotive.svg), A ; chaudière, cabine arrière, roues, phare et chasse-pierre avant. | Machine identifiable ; vapeur et déplacement gagneraient à être liés à ses sorties physiques. Rotation complète à contrôler avec perspective. | Préserver locomotive compacte ; phare avant net, orifices vapeur séparés, bielles simples qui s’activent avec mouvement ; fumée périphérique faible, pas un nuage opaque sur les rails. | P0 |
| L’Aiguilleur / Z2 | [switchman.svg](C:/LaMineV2/la-mine-v2-v01/src/assets/combat-v020/switchman.svg), A ; ouvrier à lunettes, pupitre ventral et deux leviers, flip. | Silhouette déjà spécifique, mains/leviers immobiles malgré alternance horizontal/vertical. | Un levier à bras haut et un bas pour une silhouette asymétrique ; geste du levier associé à l’orientation déjà décidée, indicateur H/V cohérent avec les rails, sans délai ajouté. | P0 |
| Le Cageur / Z3 | D ; carré bordé ocre, barreaux, câbles supérieurs, triangle inférieur. | Aspect pictogramme de cage, profondeur et appui limités ; face fixe même en charge. | Cage suspendue basse, rails-guides latéraux et énorme butoir frontal, câbles coupés courts ; oscillation seulement interne à l’image, direction de charge incarnée par butoir/lampe. | P0 |
| Le Compresseur / Z3 | D ; deux cylindres verticaux, manomètre central, socle rectangle. | Bon motif de pression, mais quasi symétrique et statique ; souffle émis sans déformation propre. | Deux bonbonnes de hauteurs différentes, jauge centrale unique, gros tuyau latéral ; aiguille monte pendant warning, pistons se compriment sur activation existante. | P0 |
| Le Grisou / Z3 | D ; sphère verte cerclée cuivre avec éclair, socle et lampe haute. | Risque de lecture « boule magique » ; peu d’équipement pour ancrer énergie minière. | Réservoir sphérique sous cage de contention industrielle, soupape et câbles lourds ; énergie visible seulement dans les joints et hublot. | P0 |
| Le Fendeur / Z4 | E ; cercle porteur, bloc brun et deux triangles latéraux clairs. | Forme de pince suggérée mais cercle autour amoindrit l’ouverture ; orientation fixe malgré charge. | Machine de fracture à deux mâchoires réellement séparées, bras courts et piston central vert ; rupture asymétrique du capot, fermeture graphique calée sur charge. | P0 |
| Le Souffleur / Z4 | E ; grande variante du Cracheur, cercle et conduit. | Boss distingué principalement par taille ; silhouette et personnalité insuffisantes. | Grand soufflet industriel horizontal à deux sacs nervurés et unique cheminée coudée ; inspiration visuelle pendant warning, éventail déjà présent part d’une bouche claire. | P0 |
| Le Cœur de Grisou / Z4 | E ; grande variante de l’Éclateur, éclats verts/jaunes dans anneau. | Aspect cristal/runique possible ; flottement sans mécanique porteuse. | Ancien cœur de générateur brisé, trois étriers miniers et noyau énergique contenu ; fissures contrôlées, pas de gemme fantasy. Battement discret seulement intérieur. | P0 |
| Le Lampiste-Major / Z5 | F ; version agrandie du Lampiste avec grand cercle de lampe. | Distinction par taille quasi seule ; extinction ne change pas le corps, seul le fond s’assombrit actuellement. | Mineur massif portant projecteur de chantier sur épaulière et batterie dorsale ; contre-jour blanc froid autour de sa silhouette pendant extinction, sans assombrir dangers ou héros. | P0 |
| Le Dynamiteur / Z5 | F ; version agrandie du Boutefeu, trois bâtons rouges et casque. | Double du petit ennemi ; mécanique de charges séquentielles racontée surtout au sol. | Harnais asymétrique de charges et détonateur de mine tenu à deux mains ; trois cartouches grossières de forme distincte qui correspondent visuellement à la chaîne existante. | P0 |
| La Masse Noire / Z5 | F ; version agrandie de Gueule-Noire, triangle de dos et yeux clairs. | Hiérarchie de taille visible mais contour trop proche ; risque silhouette de monstre générique. | Masse de charbon et tôles écrasées, un bras/épaule colossal et dos irrégulier ; lourde pose de poussée, fissure froide comme repère de face, pas d’armure fantasy. | P0 |
| Le Maître de Four / Z6 | G ; version agrandie du Chauffeur, grille centrale et flammes triangulaires. | Se lit comme Chauffeur géant, pas responsable distinct de plaques/jet ; corps identique avant/après warning. | Four mobile large à porte frontale basculante, cheminée haute décalée et levier ; volet de souffle très lisible, foyer interne subordonné à la plaque télégraphiée. | P0 |
| Le Marteau-Pilon / Z6 | G ; version agrandie du Scorificateur, barre acier horizontale et triangle bas. | La barre donne peu de hauteur au pilon ; absence de mouvement vertical relatif ; trop voisin de l’Effondreur. | Grand vérin central vertical avec masse carrée suspendue, deux rails-guides fins et semelle courte ; masse monte pendant warning, descend à l’activation, corps/rayon immobiles. | P0 |
| La Chaudière / Z6 | G ; réservoir ovale, gros cadran central, tuyaux/soupapes latéraux. | Signature déjà distincte du duo four/pilon ; lecture de quatre soupapes repose actuellement sur ordre des hazards, pas quatre sorties clairement incarnées. | Chaudière ronde plus large que haute, quatre colliers de soupapes numérotables par formes/positions ; séquence lumineuse 1–4 strictement dérivée des timers existants. Vue du dessus oblique cohérente avec les deux autres. | P0 |

![Maître de Four actuel : silhouette géométrique, télégraphe de jet issu du renderer réel.](audit-v032/captures/boss-390.jpg)


![Triple Forges arrêté à 320 × 568 : trois silhouettes et deux préparations mises en scène par le banc, pas une mesure de difficulté.](audit-v032/captures/triple-320.jpg)


## 7. Armes

| Arme | Silhouette | Tir / impact futurs | Limite immuable |
|---|---|---|---|
| Fusil à pompe | Canon court large, crosse et pompe robustes ; matière acier/ocre | Éclair large très bref à la bouche, plombs fins séparés, petits éclats minéraux orientés ; recul de l'arme avec retour contrôlé | Ni cône dommageable ajouté, ni portée/falloff/cadence/dégât/pellets retouchés |
| Mitraillette | Corps étroit, tube allongé, magasin visible | Flash réduit, traits étroits réguliers, impacts ponctuels ; Focus visible sur repère local, pas par pulsation d'écran | Ni densité réelle ni cadence modifiées pour obtenir un meilleur effet |
| Grisou X | Tube et cœur d'énergie sous cage métallique, bloc compact | Impulsion de tube, cœur clair court menthe, anneau bref à une traversée réelle | La pénétration dépend de l'état/perks de production actuel ; aucun effet de continuation si `continuing` est faux |

Le tracé visuel suit chaque projectile actuel ; il ne décide ni portée ni collision. Le projectile hostile reste une masse compacte entourée d'encre, l'allié un trait directionnel. Les débris de mort sont plus ternes, sans noyau hostile ni longue trajectoire lumineuse.

### Diagnostic des tirs actuels

Sources : `src/weapons.js`, `src/weapon.js`, `src/textures.js`, `src/room-scene.js`, `src/effects.js`. Valeurs ci-dessous en unités logiques Phaser ; aucune proposition de les modifier côté simulation.

| Arme | Projectile / muzzle / recul actuels | Impact / mort actuels | Direction visuelle future P0 |
|---|---|---|---|
| Fusil à pompe | 7 plombs ; texture commune16×6, noyau crème et trail ambre ; flash triangulaire65 ms, recoil5 ; camera65 ms amplitude.0017 ; seulement2 étincelles de départ réellement demandées malgré config particles3 | 3 étincelles par ennemi touché et frame ; ennemi tint crème ; kill anneau/gris commun | Décharge courte large à la bouche, 7 trajectoires fines intactes ; recul franc avec retour contrôlé de l'arme seulement ; petit éclat minéral orienté à l'impact. Ne pas rallonger la persistance au point de simuler un cône dommageable |
| Mitraillette | 1 projectile même texture16×6 ; intervalle120 ms, flash35 ms à échelle.5, recoil1, 1étincelle, pas de shake | 1 étincelle ; mêmes tint/mort que Fusil ; Focus décrit dans HUD | Trace étroite et régulière, bouche en petits éclats discrets, impacts ponctuels métal ; éviter un nuage continu. Focus possible par repère du HUD/arme, pas un écran pulsant |
| Grisou X | 3 impulsions texture24×10 menthe, cœur clair ; flash70 ms réutilise triangle recoloré, recoil2.5, pas de shake ; projectile plus grand avec pénétration | 2étincelles vertes ; anneau aux touches et kills continués ; arc perk composé de3petites gerbes | Bouche à impulsion de tube, non flamme de combustion recolorée ; 3 traits à cœur court, anneau de traversée bref et petit ; signal de passage entre cibles sans cacher la cible derrière |

Le recul s'amortit exponentiellement (`exp(-22*dt)`), l'arme suit l'angle de visée. Le feedback peut distinguer trois matières sans changer cooldown, nombre de projectiles, vitesse, dommages, portée, falloff ou pénétration. Attention au sens réel courant : Grisou X **construit sa pénétration par perks** ; sa description de l'ancien lancement V0.21 ne suffit pas à décrire la production V0.31. Ne pas dessiner une traversée sur un impact où `continuing` est faux.

Le traitement des impacts déduplique déjà par ennemi et frame ; garder cela pour éviter sept flashes complets par tir. Le pool d'effets commun48 éléments, maximum8particules par burst, refuse sans allocation lorsque plein : bon socle. La mort boss reprend le même anneau que la mort normale, taille3 contre1.15 ; pas de langage de rupture mécanique propre. Une future mort boss doit décomposer seulement la silhouette, rester brève, ne pas retarder victoire/drops ni faire passer un débris pour un projectile hostile.

## 8. Environnements

Les six fonds existent réellement sous forme de textures procédurales **450 × 800**. Ils sont dessinés une fois, puis affichés derrière les acteurs. La zone jouable reste le rectangle **x 28–422, y 116–666**. Le changement de zone sélectionne une autre texture, sans reconstruire le terrain à chaque vague : [arena-view.js](C:/LaMineV2/la-mine-v2-v01/src/arena-view.js:12), [config.js](C:/LaMineV2/la-mine-v2-v01/src/config.js:2), [combat-art.js](C:/LaMineV2/la-mine-v2-v01/src/combat-art.js:97).

Le socle est approprié au mobile : grandes formes, décor périphérique, aucun aléatoire de rendu consommant le RNG du combat. La faiblesse vient surtout de la répétition : cadres rectangulaires, petites cellules au sol, palette peu saturée gris-vert et objets périphériques minuscules. Puits 59 et Forges partagent la famille « grille de métal » ; Faille et Profondeurs partagent la famille « triangles de roche ». Un simple changement de teinte ne suffira pas.

**Décision P0 : identifier une zone par deux signes indépendants de sa couleur**, visibles sans UI : composition du sol + silhouette périphérique. Chaque zone doit posséder une grande forme lisible, des matériaux qui lui appartiennent et une distribution lumineuse particulière. Les détails de rivets, boulons et poussières restent secondaires.

### 1. Les Galeries — bois, charbon, lumière humaine

**État vérifié dans le code.** Fond `#101A1E`, sol `#303630`, pavés arrondis gris-vert en grille 8 × 11 ; une voie verticale au milieu ; montants latéraux bruns ; quatre lampes jaunes `#F5C169`. Source : [paintArena](C:/LaMineV2/la-mine-v2-v01/src/combat-art.js:50).

**Problème.** Le rail et les lampes établissent bien la mine, mais le charbon et le bois ont peu de présence. Le sol lit surtout « pierre verte régulière ». Les galeries et les voies partagent un même squelette décoratif. Priorité **P0**.

| Élément | Prescription future |
|---|---|
| Palette | Noir charbon `#171B1C` ; roche chaude `#34352F` ; bois brut `#6C5135` ; bois éclairé `#967144` ; lampe `#E9B963`. Réserver cette dernière aux petites sources lumineuses. |
| Matières | Charbon mat, pierre cassée en larges masses, bois équarri aux fibres rares, attaches en acier noir. Aucun filigrane cuivre ou engrenage décoratif. |
| Lumière | Quatre foyers chauds localisés, hachures d'ombre sous les étais, centre assez uniforme pour lire les dangers. |
| Sol | Quelques grandes pierres irrégulières et traces de charbon ; conserver le rail central simple, enfoui par endroits dans les salissures visuelles, jamais présenté comme un obstacle. |
| Périphérie / props | Trois paires d'étais épais ; une auge de charbon et une pelle dans le décor extérieur ; lampe sous cage métallique. Pas de wagon volumineux sur le sol circulable. |
| Particules | Poussière beige terne dans les faisceaux périphériques, lente, très rare. Les grains de charbon au sol sont statiques. |
| Signature | Masse bois chaude + voie unique + poches de charbon. La zone la moins mécanisée. |
| Hazards | Conserver les couloirs de charge et cercles existants. Poussière d'impact strictement à l'intérieur du danger, effacée vite ; aucune fissure décorative lumineuse qui ressemble à un avertissement. |
| Différence | Chaleur de petites lampes et matière organique, contrairement à la chaleur des fours de Zone 6. |

### 2. Les Voies Abandonnées — signalisation ferroviaire

**État vérifié.** Sol acier `#243438`, plaques carrées, trois voies horizontales aux y 215, 395, 585, périphérie rouille/cuivre ; mêmes lampes et disposition latérale que les Galeries. Source : [combat-art.js](C:/LaMineV2/la-mine-v2-v01/src/combat-art.js:54). Les dangers ferroviaires sont dessinés depuis les données de combat : [rail-boss-view.js](C:/LaMineV2/la-mine-v2-v01/src/rail-boss-view.js:4).

**Problème.** Les rails différencient déjà la zone ; le reste évoque encore une variante colorée des Galeries. Il manque les aiguillages, leviers et signaux comme objets reconnaissables. Priorité **P0**.

| Élément | Prescription future |
|---|---|
| Palette | Ballast sombre `#1B2428` ; acier patiné `#415456` ; rouille `#8D5039` ; traverses `#554637` ; signal de service bleu pâle `#91B5BD`. |
| Matières | Rail poli sur sa tranche, traverse noircie, ballast en grandes taches, métal peint écaillé. |
| Lumière | Signaux latéraux à lentille et capot ; lumière dirigée vers les voies, sans faux cône d'attaque. Aucun clignotement rouge décoratif à la cadence des télégraphes. |
| Sol | Conserver les rails lisibles mais moins contrastés que les couloirs dangereux. Présenter les traverses en groupes, ne pas multiplier les petites rayures. Les couloirs de combat autorisés restent la vérité, pas le tracé artistique. |
| Périphérie / props | Un signal à deux lentilles, un levier basculant, un butoir et le flanc coupé d'un wagon hors aire jouable. Aiguillage purement visuel en bordure. |
| Particules | Très peu de poussière de ballast ; une fuite de vapeur périphérique faible. Pas d'étincelles permanentes sur les rails. |
| Signature | Réseau de voies + silhouette de signal à capot + levier. Lecture ferroviaire immédiate. |
| Hazards | Couloir hostile avec contour sombre, doubles bords et chevrons orientés. Horizontal, vertical ou croix : toujours issus du pattern réel, aucune retouche des coordonnées ni du délai. Le rail statique ne doit jamais annoncer un danger actif à tort. |
| Différence | Organisation horizontale/ferroviaire ; éviter les grandes colonnes verticales et treuils réservés au Puits 59. |

### 3. Le Puits 59 — machine verticale monumentale

**État vérifié.** Fond `#111B20`, sol `#222D31`, petites plaques grises, conduites aux deux côtés, deux traits verticaux intérieurs, bandes de sécurité en haut/bas. Aucun gros treuil ni cage statique distincte dans le fond. Source : [shaft-art.js](C:/LaMineV2/la-mine-v2-v01/src/shaft-art.js:13).

**Problème.** Le vocabulaire industriel existe mais l'échelle et la verticalité sont insuffisantes. Les détails réduits ressemblent à des conduites génériques. Priorité **P0**.

| Élément | Prescription future |
|---|---|
| Palette | Vide du puits `#111A20` ; acier lourd `#34434B` ; tranche usée `#748589` ; graisse `#262723` ; peinture chantier terne `#B3944F`. |
| Matières | Tôle épaisse, câble tressé, graisse sombre, fonte, peinture de sécurité usée. |
| Lumière | Lumière froide descendante sur deux nervures verticales ; petits voyants jaunes en périphérie ; pas de nappe lumineuse chaude centrale. |
| Sol | Grandes sections de passerelle, joints longitudinaux, grilles peu contrastées. Ne pas dessiner d'abîme apparent dans la zone où le joueur peut marcher. |
| Périphérie / props | Deux faisceaux de câbles épais, roue de treuil partiellement coupée en haut, cage immobile en silhouette hors aire jouable, tuyaux raccordés à de gros vérins. |
| Particules | Deux sorties de vapeur latérales courtes, lentes et translucides ; poussière tombante uniquement contre les parois. |
| Signature | Câbles montant hors cadre + grandes poulies + sol longitudinal. L'échelle verticale doit exister même sans le Cageur. |
| Hazards | Instabilité : avertissement circulaire ou couloir vertical conservé ; poussière et éclats seulement après l'activation réelle. Les lignes de câbles décoratives ne doivent pas ressembler aux bords de ces couloirs. |
| Différence | Industrie mécanique froide et verticale ; les Forges sont thermiques, compartimentées et horizontales. |

La géométrie et les temps des hazards sont définis dans [shaft-hazards.js](C:/LaMineV2/la-mine-v2-v01/src/shaft-hazards.js:7), indépendamment de la future matière visuelle.

### 4. La Faille de Grisou — fracture et fuite énergétique

**État vérifié.** Sol `#202B2B`, triangles répétitifs, quatre fissures vertes latérales, petits triangles de dépôts sur les côtés. Cercles de danger enrichis d'un anneau vert interne. Source : [rift/art.js](C:/LaMineV2/la-mine-v2-v01/src/rift/art.js:4).

**Problème.** L'accent Grisou est présent, mais les petits triangles évoquent des cristaux fantasy ; la fissure n'organise pas encore la composition. Le triangle répété sera aussi réutilisé en Profondeurs. Priorité **P0**.

| Élément | Prescription future |
|---|---|
| Palette | Roche `#172725` ; masse cassée `#30423A` ; dépôt minéral `#758364` ; conduite oxydée `#6E6750` ; lueur Grisou `#82CFA7`, utilisée sur des surfaces très réduites. |
| Matières | Roche arrachée, conduites fendues, dépôts crustés plutôt que gemmes parfaites ; suintement minéral mat. |
| Lumière | Émission verte dans les fissures périphériques ; fond du centre faiblement éclairé, jamais de brouillard lumineux plein écran. |
| Sol | Larges blocs asymétriques reliés par des fractures sourdes. Une diagonale périphérique dominante suffit ; les microfissures ne constituent pas de faux obstacles. |
| Périphérie / props | Conduite sectionnée identifiable, joint industriel arraché, deux excroissances minérales irrégulières, renforts métalliques qui tentent de maintenir la faille. |
| Particules | Brume verte désaturée adossée aux parois, lente et clairsemée ; pas de billes lumineuses flottantes comparables aux projectiles. |
| Signature | Fracture asymétrique + conduite cassée + dépôts verts. L'énergie vient du sous-sol et d'une installation défaillante. |
| Hazards | Poche, souffle et fissure gardent la grammaire hostile ambre/corail, contour net et forme exacte ; gaz vert seulement en remplissage secondaire sous ces bords. Aucun nuage ne masque le chemin sûr. |
| Différence | Irrégularité organique verte, face à la géométrie industrielle des Zones 2/3/6 et au noir bleu silencieux de Zone 5. |

**Risque spécifique P0 :** le vert Grisou du décor peut se confondre avec les tirs amis du Grisou X. Réserver le cœur presque blanc et la traînée nette aux projectiles ; réduire saturation, mouvement et opacité du décor vert.

### 5. Les Profondeurs Noires — extinction et installations mortes

**État vérifié.** Fond `#0A1019`, sol `#232B39`, triangle roche répété, câbles sinueux latéraux, petites lampes chaudes, 36 points pâles intégrés à la texture. L'extinction teinte **uniquement le fond**, avec `#9298A5` en prélude puis `#505868` active. Acteurs et dangers ne sont pas assombris. Source : [depths/art.js](C:/LaMineV2/la-mine-v2-v01/src/depths/art.js:6).

**Problème.** Bonne distinction chromatique et excellente séparation de sécurité ; la bascule ressemble cependant à une teinte globale de décor plutôt qu'à l'arrêt d'une installation réelle. Les répétitions de pierre rappellent la Faille. Priorité **P0** pour l'extinction et les masses ; accessoires **P1**.

| Élément | Prescription future |
|---|---|
| Palette | Roche noire `#10151F` ; acier éteint `#29323E` ; câble `#48484B` ; poussière `#66707F` ; rare lampe froide `#B9C8D7`. |
| Matières | Charbon bleuté, métal couvert de suie, gaines épaisses, peinture effacée, verre opaque de lampes mortes. |
| Lumière | Trois sources industrielles rares et stables ; îlots de lumière sur la périphérie, sans réduire la lisibilité du centre. |
| Sol | Grandes masses sombres irrégulières, surfaces plus lisses et moins découpées qu'en Faille. Pas de points brillants distribués uniformément. |
| Périphérie / props | Gros câble affaissé, armoire électrique morte, lentilles opaques, silhouettes de conduits coupés. Le vide et les masses comptent davantage que le nombre d'objets. |
| Particules | Très peu de poussière froide visible près d'une lampe ; supprimable intégralement sans perte d'identité. |
| Signature | Installations mortes + câble lourd + rare lumière blanche ; extinction reconnaissable par l'arrêt simultané des sources, sans flash blanc. |
| Hazards | Conserver le contraste plein des faisceaux, charges numérotées, projectiles et ennemis. Aucun halo de lampe joueur qui cache ce qui se trouve hors du cône ; ce serait une modification de perception du gameplay. |
| Différence | Zone définie par absence lumineuse et silhouettes, pas simplement une version bleue de la Faille. |

**Extinction future, liée aux états existants :** au prélude, les lampes de décor baissent d'intensité ; à l'état actif, elles s'éteignent et les seules tranches périphériques restent perceptibles ; au retour, elles reprennent leur intensité. Pas de minuterie artistique indépendante. Ne pas allonger le prélude, le noir ni le retour, ne pas appliquer de vignette au HUD ou aux menaces. Les états de pression actuels restent intacts : [depths/pressure.js](C:/LaMineV2/la-mine-v2-v01/src/depths/pressure.js:1).

### 6. Les Forges Oubliées — plaques froides, foyers contenus

**État vérifié.** Fond `#14191C`, sol `#272D32`, 12 plaques `#343A3E` rivetées, fours étroits sur les bords, deux morceaux de chaîne en haut. La surchauffe distingue warning ambre `#FFD58C`, actif corail `#FF8050`, refroidissement bleu `#8EB5B9`. Source : [forge/art.js](C:/LaMineV2/la-mine-v2-v01/src/forge/art.js:3).

**Problème.** Les plaques donnent déjà un ancrage mécanique solide. Les fours sont trop petits pour porter l'identité ; grossir simplement la lueur orange ferait concurrence au signal de danger. Priorité **P0**.

| Élément | Prescription future |
|---|---|
| Palette | Fonte `#1D252B` ; acier froid `#37434A` ; calamine `#59453B` ; cuivre brûlé `#91573F` ; four périphérique `#C77446`. Éviter le jaune crème brillant dans le décor hors petite bouche de four. |
| Matières | Plaque massive rivetée, joints noirs, métal bleui, fonte rugueuse, tuyaux isolés ; métal rougi uniquement dans les bouches et conduites latérales. |
| Lumière | Deux grosses bouches de four latérales plutôt que huit petites flammes équivalentes. L'éclairage chaud se dépose sur la périphérie ; le centre conserve un gris froid favorable aux hazards. |
| Sol | Conserver les **12 plaques aux positions et dimensions réelles** ; quelques grandes griffures et rivets suffisent. Pas de lave, feu décoratif ou nouvelle fente au milieu. |
| Périphérie / props | Porte de four épaisse avec poignée, chaîne pendante hors aire jouable, tuyau coudé, soupape à volant. Le volant ne tourne pas à chaque attaque sans lien réel. |
| Particules | Petites étincelles uniquement près d'un four ; vapeur périphérique rare ; pas de particules rouges au-dessus des plaques sûres. Aucune distorsion thermique de toute l'image. |
| Signature | Grandes bouches chaudes encadrant des plaques froides + tuyaux lourds. |
| Hazards | Warning : bord ambre + hachures + intensité liée au temps restant ; actif : bord corail plus épais + remplissage chaud ; refroidissement : gris bleuté faible, sans symbole de danger persistant. Les trois états restent distincts sans se fier seulement à la teinte. |
| Différence | Chaleur mécanique dangereuse, à opposer au bois et à l'éclairage accueillant des Galeries. Le centre reste plus froid que le décor des fours. |

Les plaques ne sont pas une grille décorative libre : [forge/config.js](C:/LaMineV2/la-mine-v2-v01/src/forge/config.js:30) définit leurs centres et leur taille **76 × 88**, utilisés par les attaques. Même règle pour cônes, traînées, slams et soupapes : aucune modification géométrique ou temporelle pour arranger un dessin.

Les six captures de combat sont indexées dans [CAPTURES.md](audit-v032/CAPTURES.md). Les signatures ci-dessus se jugeront aussi sans HUD avant production définitive.

## 9. UI

Le système commun comprend une plaque principale, une carte de choix, un bouton, un onglet, un compteur et un badge. Aplat acier, chanfrein clair supérieur, ombre courte, **au plus deux rivets sur un grand panneau**. Pas de grain derrière les chiffres, pas de boulon dans chaque case. Rayon 4–6 px, quelques coins coupés pour les grandes plaques ; espacement 4/8/12/16/24 px.

Hiérarchie combat : PV et héros/dangers d'abord ; vague et boss ensuite ; états utiles ; butin et arme en secondaire. Hiérarchie méta : action du lieu → information permettant la décision → prix/état → décor. Un bouton « indisponible » conserve un texte lisible, une raison et un état de bord ; une sélection possède une coche et le mot ÉQUIPÉ, pas seulement une couleur.

Typographie : `system-ui`, chiffres tabulaires, poids 400/650/800 selon ce que la police du système rend effectivement ; capitales seulement pour titres courts et états. Cibles CSS : titres 24–30 px, cartes 15–17 px, corps 13–15 px, secondaire 12 px, exception 11 px pour compteurs courts. Aucun bénéfice, prix ou choix tactique à 6–9 px. Une fonte de titre condensée reste optionnelle après vérification de licence, accents français et rendu réel ; pas de dépendance réseau obligatoire pour ce chantier.

Icônes : SVG, contour nominal 2 px à 24 px CSS, deux masses et une découpe intérieure principale ; test monochrome à 20 px. Charbon = bloc cassé, fer = lingot, diamant = facette claire, Jeton Grisou = jeton marqué ; conserver une même silhouette entre menu, drop et résultat. Un pictogramme fonctionnel ne doit pas dépendre d'une micro-inscription. Contrats et Talents ont des signes différents. Les perks conservent nom et bénéfice textuel, l'icône ne remplace pas l'explication.

Cibles tactiles 44 ×44 px, CTA 48 px, écart souhaité 8 px ; faire défiler ou réduire l'illustration avant de rétrécir les textes. Pas de dépendance au survol. Tester focus visible, retour du focus, longs noms, grandes valeurs, accents, choix épique, panneau de résultat chargé et zone de sécurité des appareils à encoche. Le debug reste explicitement hors DA finale.

Nomenclature visible : **Contremaître Ravens, Choix du Contremaître, Contrats de la Mine, Caisse du Mineur, Plaques du Contremaître**. Les identifiants internes `porion` restent compatibles.

### Diagnostic mobile actuel

L'interface combine trois générations : panneaux illustrés SVG du kit V0.9 à l'accueil et dans l'Atelier ; cartes CSS plus simples dans Talents, Contrats et Classement ; écrans de combat verts/noirs avec accents cuivre puis violet pour l'épique. Ces générations ne partagent ni échelle typographique ni token de bordure commun. Il faut les harmoniser, pas ajouter une quatrième famille de cadres.

Sources principales : `style.css`, `src/menu/menu.css`, `src/menu/kit.css`, `src/menu/workshop.css`, `src/menu/relief.css`, `src/menu/contracts.css`, `src/leaderboard/view.css`. L'ordre de chargement dans `index.html` est important : `kit.css` remplace plusieurs règles de `menu.css` ; les valeurs originelles ne décrivent donc pas toujours le rendu final.

| Mesure calculée | 320 × 568 | 390 × 844 | Conséquence |
|---|---:|---:|---|
| Shell réelle, ratio 9/16 | 319,5 × 568 px | 390 × 693,33 px | À 390, la hauteur utile n'est pas 844 px ; environ 151 px hors shell |
| Facteur de réduction Phaser 450 × 800 | 0,71 | 0,867 | Ne pas juger une texture ou un texte à sa taille source |
| Noms des 3 armes, `max(8px,2.3cqw)` | 8 px | 8,97 px | Trop petits pour un choix majeur |
| « ÉQUIPÉ / ÉQUIPER », `2cqw` | 6,39 px | 7,8 px | Statut important traité comme microtexte |
| Catégorie d'un perk, `2.05cqw` | 6,55 px | 8 px | Étiquette quasi décorative à 320 |
| Description d'un perk, `3.5cqw` | 11,18 px | 13,65 px | Lisibilité inégale entre appareils |
| Stat d'un perk, `max(8px,2.35cqw)` | 8 px | 9,17 px | Valeur qui devrait aider la décision trop petite |
| Texte Phaser de télégraphe, 11 px logiques | 7,81 px | 9,53 px | Le mot ne peut pas être le seul canal de lecture |
| Libellés HUD perks | 9 px | 9 px | Ellipsis et `title` peu consultable au tactile |
| Relance des choix | 36 px de haut | 36 px | Exception au minimum tactile 44 px ailleurs |

La majorité des actions principales bénéficie déjà de `min-height:44px`, navigation principale au moins 48 px, Atelier 44 px, select Classement 44 px. Il ne s'agit donc pas d'une interface intégralement trop petite : les cibles et les textes doivent être distingués. Les trois cartes d'arme sont hautes d'environ 67/82 px mais leur légende est minuscule. Le header, le portefeuille et les sept destinations de pied de page restent fixes ; seul `.menu-content` défile. Cela réduit particulièrement la surface du héros et la découverte du Classement à 320 px.

Le système utilise `system-ui`, puis les polices système Apple/Segoe UI : aucune police `.woff`, `.ttf` ou `.otf` trouvée dans `src`. Pas de dépendance à un fournisseur de polices. `viewport-fit=cover` est présent, mais pas de règle `env(safe-area-inset-*)` trouvée dans les feuilles inspectées : contrôle réel sur appareil avec encoche à prévoir sans agrandir l'arène jouable.

Contrastes calculés sur couples de couleurs opaques déclarées (formule luminance sRGB ; pas une mesure des SVG, dégradés ou transparences composités) : texte principal `#ecede1 / #10191b` 15,10:1 ; texte Classement `#c7d9d6 / #192b3a` 9,89:1 ; secondaire `#a2b4b9 / #152e40` 6,52:1. La lisibilité souffre souvent davantage de la taille que du contraste. L'aide secondaire `#617b80 / #10191b` n'atteint que 3,95:1 ; ne pas conserver ce contraste pour une instruction essentielle. Les bords opaques de télégraphe `#ffc46b` sur sol `#303630` atteignent 7,88:1, sur plaque `#343a3e` 7,34:1 : préserver cette différence, sans l'interpréter comme une garantie sur les remplissages translucides.

### Écrans à harmoniser

| Écran | État actuel / problème concret | Direction future | Priorité |
|---|---|---|---|
| Accueil | Héros sur podium, équipement sur râtelier, Ravens miniature, 3 armes, CTA, Classement puis 2 rangées de navigation ; plusieurs messages « prêt » redondants | Héros et arme équipés comme duo central ; un seul message Ravens ; CTA de descente dominant ; alléger les textes décoratifs avant toute réduction des textes utiles | P1 |
| Sélection d'arme | 3 cartes du kit homogènes mais noms 8 px ; aucune description tactique visible dans ce sélecteur (`weapon-selector.js`) | 3 silhouettes distinctes, nom ≥12 px, coche et mot ÉQUIPÉ ≥11 px ; détail court accessible sans dépendre de survol ; garder sélection et launch inchangés | P0 |
| Carte des zones | Bon principe de puits continu, profondeurs et verrous ; cartes et plaques inclinées, descriptions `3cqw`, longue liste de 6 zones | Conserver le puits, renforcer les silhouettes de chaque palier ; nom lisible sans rotation, état textuel clair verrouillé/disponible/terminé ; arme équipée secondaire | P1 |
| Ressources | 4 petits médaillons persistants, montants tronquables par ellipsis, labels 8 px ; variantes résultat non décorées | Une même silhouette de ressource partout ; compteur tabulaire et nombre intégral accessible au toucher ; typographie compacte ≥11 px ; ne jamais suggérer une récompense non obtenue | P1 |
| Atelier | 2 colonnes, 4 stations, rangs, achats et coûts ; panneaux SVG riches, descriptifs parfois 10 px | Plaques d'atelier sobres, icône par poste, bonus actuel puis prochain bonus, prix/action dans une zone stable ; état indisponible lisible sans tout griser | P1 |
| Talents | Liste de cartes CSS arrondies, 12 px descriptif, état acquis explicite ; semble un autre produit que l'Atelier | Même plaque et famille d'icônes, symbole poinçonné pour acquis ; conserver le catalogue et chaque coût | P1 |
| Relève | Temps dominant 8cqw, stock bien identifié ; nombreux petits textes de capacité/taux/sauvegarde ; illustration masquée sous 600 px | Feuille de poste avec grande horloge simple, stock à récupérer puis CTA ; capacité et taux secondaires mais ≥12 px ; supprimer décoration avant information | P1 |
| Caisse du Mineur | Coffre CSS, glow/lid shake distincts du kit ; bonnes commandes ouvrir/passer ; possibilités, sources, échange densifient | Caisse minière de même matière que les accessoires ; révélation courte, gain numérique stable, conservation du bouton passer et reduced-motion | P1 |
| Contrats de la Mine | Cartes sombres, progress HTML, boutons arrondis, badge 8 px ; même icône navigation que Talents | Fiches d'ordre numérotées, progression mécanique simple, récompense et récupérer dominants ; pictogramme propre Contrats sans changer la logique | P1 |
| Classement de la Mine | Liste HTML efficace, 3 onglets et select44 px ; détails 10 px, rang/chiffres/pseudo peu différenciés ; accès depuis accueil | Tableau de résultats de fosse, numéro de rang dominant, ligne personnelle marquée par barre/étiquette ; éviter rivets sur chaque cellule ; préserver messages local/distant et erreurs | P1 |
| HUD combat | Nom arme très dominant ; PV numériques et 5 segments ; vague et 4 jalons ; Focus + butin + jusqu'à plusieurs chips ; aide en bas ; barres boss fines sans noms | Priorité PV → dangers/arène → vague/boss → états déclenchables ; nom arme plus secondaire, symbole reconnaissable ; barres boss identifiées, stat perk sélectionnée plutôt qu'une multitude illisible ; aucune modification de donnée | P0 |
| Victoire / défaite | Gros titre, 4 ressources, sauvegarde, première victoire/caisses, 3 boutons, stats et liste de perks ; écran défilant, Ravens en bas | Résultat → butin validé → action ; mêmes plaques que méta ; stats détaillées ensuite ; ne pas confondre butin provisoire/permanent | P1 |
| Choix du Contremaître | Bonne carte cliquable entière, focus piégé, 3 cartes, portrait ; grand titre, petits bénéfices chiffrés ; relance36 px | Fiche physique à icône, nom et effet principal ; chiffre utile ≥12 px, description ≥13 px, relance≥44 px ; portrait adaptable à l'espace restant | P1 |
| Choix épique | Même structure, violet, ombres et grandes bordures ; distinction principalement chromatique | Garder le mot ÉPIQUE, marquage poinçonné/cadre à double encoche ; violet réservé à l'épique, ne pas produire une esthétique fantasy | P1 |
| Pause | Texte clair et un bouton ; déclenchée par Échap/perte focus, pas d'action pause tactile explicite dans le HUD actuel | Étudier une commande pause accessible de 44 px hors zone de déplacement, sans changer les règles de pause ni l'entrée mouvement | P1, à valider UX |

`src/weapon-overlay.js` conserve un ancien dialogue « Deux styles » ; aucune instanciation de `WeaponOverlay` trouvée dans le flux `RoomScene` actuel (le menu utilise `weaponSelector`). C'est une dette de composant dormant, pas la preuve d'un texte affiché aujourd'hui. Ne pas refaire cet écran historique comme s'il était le parcours actuel.

![Carte des zones actuelle : bonne métaphore de descente, une grande carte occupe le panneau défilant.](audit-v032/captures/zones-390.jpg)


![Atelier actuel : panneaux illustrés riches, deux colonnes et plusieurs niveaux de texte.](audit-v032/captures/atelier-390.jpg)


![Classement actuel local simulé : rendu de liste fonctionnel, distinct des cadres illustrés du menu.](audit-v032/captures/classement-390.jpg)


![Choix du Contremaître actuel à 320 × 568 : bonnes cartes entières, petites catégories et valeurs.](audit-v032/captures/choix-320.jpg)


## 10. VFX

### Hiérarchie obligatoire

**Télégraphe hostile > projectile hostile > personnage > effet décoratif.** Ce classement exprime une priorité perceptive, pas un ordre simpliste où tout le danger devient opaque devant les acteurs.

Aujourd'hui, warnings `depth 8`, ennemis 15, héros 20, arme 21, tirs alliés 22, muzzle 23, tirs hostiles 24, FX 40 : un effet décoratif peut donc recouvrir un signal. La tranche future doit séparer : remplissage de danger translucide sous les corps ; bord essentiel indépendant protégé des FX ; corps toujours identifiable ; impacts décoratifs sans grand aplat. Les couches HUD, feedback et contrôles restent hors de cette hiérarchie du sol. Tester avant de choisir les nombres finaux de profondeur.

Les avertissements gardent leurs emprises et timers actuels. Forme distincte entre attente hachurée, actif au bord franc, refroidi interrompu ; phase compréhensible sur capture fixe et en niveaux de gris. Les grands effets alliés et morts de boss ne doivent pas masquer un corridor, une zone sûre ou un projectile. La mort graphique ne retarde ni disparition logique, ni drop, ni victoire.

Les particules sont toujours sacrifiables ; le bord d'un danger ne l'est jamais. Réutiliser le pool existant et supprimer d'abord étincelles/anneaux décoratifs lorsqu'il sature. L'extinction ne s'applique qu'au décor. Les Plaques du Contremaître deviennent une protection segmentée locale, jamais une bulle opaque.

| Effet | État / risque actuel | Prescription visuelle sans modification temporelle |
|---|---|---|
| Télégraphes | Couloirs chevronnés, cercles crantés, contours noirs ; couleur ambre attente, corail actif. Lisibles mais presque tous partagent la même forme générique | Conserver exactement l'emprise calculée ; une bordure sombre + bord lumineux, symbole de type au centre ; progression graphique liée au timer existant, jamais un nouveau délai |
| Projectiles hostiles | Halo sombre, orange, petit noyau crème, contour rouge, traînée17 unités ; meilleure différenciation que la couleur seule | Conserver masse circulaire/noyau hostile distinct du trait allié ; diagonales lisibles ; ne pas épaissir le noyau pour suggérer une plus grande collision |
| Explosions / Coup de Grisou | Anneau ambre +8étincelles + shake90 ms ; texte « GRISOU ! » ; couleur proche des dangers | Éclair allié court sur noyau menthe/ambre local, contour fragmenté ; ne jamais dessiner un disque opaque couvrant un danger ; rayon de décor explicitement séparé du rayon de dommage |
| Bonds | Ligne de trajectoire et étiquette BOND ; les nouveaux acteurs n'ont pas une animation articulée de saut spécifique | Ombre reste au sol, corps en élévation dans la présentation seulement ; anneau de destination issu du danger réel ; atterrissage n'efface pas son contour |
| Slams / pilon | Cercles génériques, première grande empreinte puis résidu pour pilon ; poids surtout porté par texte/pattern | Préparation mécanique compressée, impact vertical et rebond local ; poussière vers l'extérieur et sous le contour ; aucun écran blanc |
| Gaz | Cercles plus anneau intérieur vert pour Faille, souvent proche langage Grisou allié | Garder contour hostile ambre/corail ; gaz verdâtre uniquement à l'intérieur ; texture en lobes clairsemés, pas de brouillard opaque ni particules vers joueur |
| Rails / charges | Chevrons orientés et corridor verrouillé, variants horizontal/vertical/croix | Chevrons + extrémité orientée, rails décoratifs de valeur nettement inférieure ; ne pas animer de virage absent de la simulation ; ne pas retoucher l'orientation validée Rat/Wagon |
| Surchauffe | Plaque arrondie,3stries, signe chaleur ; ambre→orange→bleu refroidi ; bord actif4unités ; progression de remplissage warning | Conserver trois états non ambigus, filaments orange seulement à l'activation ; refroidissement peu contrasté, symbole distinct ; étincelles confinées aux bords et limitées |
| Extinction | Seul le fond est teinté gris puis sombre ; acteurs, dangers, projectiles restent intacts ; texte d'alerte à depth60 | Préserver impérativement cette isolation. Identité par extinction des lampes périphériques et interruption de lumière décorative ; aucun voile noir au-dessus du gameplay |
| Drops / aspiration | Silhouettes simples, rebond5unités, pile ×N, trait d'aspiration20unités ; butin depth6–7 sous télégraphes | Conserver basse priorité pendant combat ; attraction plus fluide au ramassage mais nombre et vitesse de collecte inchangés ; ressources lisibles en silhouette, pas de beam de loot |
| Dégâts joueur | Tint pêche, invulnérabilité par alpha oscillant, wash rouge max.12, shake100 ms | Localiser le hit sur héros + bord HUD, ne pas blanchir l'arène ; garder visibilité du héros pendant invulnérabilité ; mode réduit stable |
| Plaques du Contremaître | Anneau cyan autour héros +petit rectangle ; absorption « COUP BLOQUÉ ! », ring cyan,6étincelles | Dessiner quelques plaques segmentées à contour court, rupture d'un segment au blocage ; pas de bulle remplie devant personnage/dangers |
| Mort ennemi / boss | Destruction du container puis anneau et spark ; bosses distingués surtout taille/couleur | Ennemi : écrasement ou rupture courte lisible sans cadavre interactif ; boss : décrochement mécanique bref et extincteur de lumière, conservant instant de kill et disponibilité du loot |

**Hiérarchie perceptive imposée : télégraphe hostile > projectile hostile > personnage > effet décoratif.** Elle ne signifie pas rendre opaque tout le sol par-dessus le héros. La bonne solution est un fond de danger translucide sous les corps, et un contour hostile indépendant qui résiste aux FX. Actuellement warnings depth8, ennemis15, héros20, arme21, tirs alliés22, flash23, tirs hostiles24, FX40, texte feedback50, bossHP60, wash80, joystick200. Les FX40 peuvent donc recouvrir tous les signaux de combat : point P0 à traiter visuellement, sans toucher aux géométries.

Proposition future : couche remplissage danger sous personnages ; contour danger au-dessus des effets décoratifs ; effets alliés/loot sans grand aplat ni mélange additif plein écran ; halo sombre de2px écran autour d'un signal essentiel. Budget visuel : pas plus de2étincelles au muzzle normal,8au burst lourd déjà plafonné ; si le pool sature, sacrifier spark/anneau décoratif avant un signal hostile. Ne jamais lier l'existence d'une collision à celle d'une particule.

## 11. Animation

| État | Preuve actuelle | Effet perceptif / limite | Prescription future, sans toucher le gameplay |
|---|---|---|---|
| Idle | A : très léger sinus vertical et d’échelle ; seuls assets inscrits au catalogue l’utilisent. | Héros/Z1–2 respirent un peu ; Z3–6 restent des images fixes qui se déplacent. | Respiration humaine discrète ; pour machines, petite vibration d’un sous-ensemble, jamais tout le volume qui « respire ». Aucun mouvement décoratif du pivot de collision. |
| Marche | A : `move` lissé, sinusoïde d’échelle ±1,8 %, rebond 0,2 à 0,7 unité selon entité. Pas de sprite sheet de jambes. H : ombre joueur suit position logique. | Pas d’appuis alternés : sensation de glisse, accentuée Z3–6 sans animation. | Deux poses d’appui minimales ou pièces articulées ; fréquence liée à distance effectivement parcourue. Chaque pied peut bouger visuellement, jamais l’entité simulée. Ombre reste rattachée au centre logique. |
| Orientation | A : `travel` Rat = déplacement réel, `rail` Wagon = angle verrouillé ; `rotate` pour machines Z1–2 ; `flip` pour humanoïdes. B/D/E/F/G : la plupart des entités Z3–6 ont rotation fixe. | Des châssis à bouche/nez orienté haut peuvent tirer ailleurs. Le miroir reste acceptable pour humanoïde, moins pour canon asymétrique. | Fiche par entité : axe avant, pivot, direction de déplacement, direction de visée, direction verrouillée. Tests planche huit directions. Rat/Wagon sont des références validées, pas des éléments à corriger à nouveau. |
| Préparation d’attaque | B : labels et tracés via renderers ; corps principalement inchangé. | Danger lisible par le sol, intention corporelle moins forte ; l’œil doit lire du texte. | Armer visuellement l’organe responsable dans **le warning déjà disponible**, sans l’allonger ni le retarder. Télégraphe au sol demeure source d’information dominante. |
| Attaque | H : recul héros/arme, flash et particules ; charges ennemies déplacent la même image, jets et slams ne possèdent pas d’articulation spécifique. | Tir joueur plus incarné que machine adverse ; charge glissée, pilon sans poids propre. | Recul de canon, compression de suspension, piston ou bouche animés à l’événement existant. Aucun hit-stop global ajouté : il changerait perception/timing et demande une validation distincte. |
| Récupération | Les acteurs ont des phases logiques mais le renderer d’apparence ne les décline pas en poses. | Ennemi peut paraître prêt à attaquer alors que le système récupère. | Relâcher valve, ouvrir évent ou redresser buste durant la récupération réelle. Animation interrompable si phase suivante arrive ; pas de nouveau temps mort. |
| Hit | B : tint chaud commun ; A : micro-squash visuel de 2,5 % ; H : étincelles au premier hit par id/frame. | Un même flash pour matière organique, acier, roche. | Flash bref commun conservé comme confirmation ; 1 détail de matière (copeau, étincelle, poussière), budget partagé. Maintenir personnage perceptible sous plusieurs hits. |
| Mort ennemi | H : 4 particules et anneau ; vue détruite dès retrait de l’ennemi. Aucun cadavre ni animation de corps morte persistante. | Disparition très abstraite, pas d’identité de matière ; cependant arène reste propre. | Un fragment visuel ou aplatissement très court sur couche de décor, non collidable, non ciblable, pool borné. Pas de corps masquant télégraphes ou drops. |
| Mort boss | H : même système, 8 particules et anneau plus grand. | Pas de rupture mécanique spécifique, victoire visuellement modeste. | Extinction de moteur puis éclat contrôlé de coque en 2–3 morceaux, effets bornés ; victoire/drops dépendent toujours du kill réel, pas de la fin d’animation. |
| Boss déplacement | H/B : position de container suit exactement acteur, ombre générique boss 65 × 25, corps Z3–6 fixe. | Gabarits 84 × 84 proches, ombre identique et mobilité comparable peuvent affaiblir sentiment de masse. | Différencier silhouette, appuis et pièces secondaires ; garder même vitesse/trajectoire. Ombres proportionnées à la base du dessin, pas un indice trompeur de hitbox. |
| Mode mouvements réduits | A : supprime rebond/squash/spawn scale de l’apparence ; H : supprime secousses et majorité des bursts, garde repères principaux. | Bonne infrastructure existante à préserver. | Tout futur rig doit fournir pose statique lisible ; aucune attaque ne doit dépendre d’une oscillation ou de la secousse pour être comprise. |

### Contrat artistique

Chaque animation lit un état existant : idle, mouvement réel, warning, attaque, récupération, hit, kill. Les phases sont normalisées sur leurs durées actuelles ; aucune timeline artistique ne pilote la simulation. Préférer 2–4 poses de pieds/roues ou une articulation courte à un simple rebond de toute la boîte.

| État | Prescription |
|---|---|
| Idle | Mouvement très faible d'un organe vivant/moteur ; machines lourdes presque stables. Pas de lévitation générale. |
| Marche | Appuis alternés ou roues actives ; ombre et centre logique stables. L'amplitude ne change pas la vitesse perçue par grands sauts. |
| Orientation | Selon mouvement ou visée existants, par famille ; huit caps testés, avant/arrière visibles en noir. |
| Préparation | Compression, volet qui s'ouvre, levier armé ou jauge qui monte ; aucun tir avant événement. |
| Attaque | Action de l'outil au frame/événement réel ; recul visuel local ; projectile issu du point existant. |
| Récupération | Détente rapide ou purge locale contenue dans recovery ; ne pas laisser croire qu'un danger actif est déjà terminé. |
| Hit | Teinte locale et petit choc de matière, déduplication actuelle conservée ; pas de sept flashes complets pour les plombs du même impact. |
| Mort | Rupture courte, lumière éteinte, débris ternes sans collision ; l'entité logique disparaît à son instant actuel. |

Reduced-motion : supprimer bob, shake et éclats superflus ; conserver contour, motif et information de phase. Aucun feedback indispensable ne doit nécessiter oscillation ou flash. Vérifier notamment la branche d'arc énergétique repérée dans l'audit, sans modifier ses dégâts.

## 12. Performance

Les tailles sont les octets des fichiers sur disque, sans compression HTTP. L'inventaire physique ci-dessous couvre `src/assets`, pas les captures, sauvegardes, sources de tests ou dépendances. Les illustrations SVG intégrées aux modules et les graphismes générés sont comptés séparément ; leur absence de fichier image ne signifie pas une absence de coût.

| Ensemble | Quantité | Taille exacte | Dimensions / usage |
|---|---:|---:|---|
| SVG de combat `src/assets/combat-v020` | 15 | 52 186 octets | Tous `viewBox="0 0 128 128"` ; héros, 5 ennemis, 6 boss, 3 armes |
| SVG du kit `src/assets/kit-da` | 16 | 25 468 octets | Icônes 84×84, signes/cartes jusqu'à 360×270 ; HTML/CSS |
| Mineur du menu `src/assets/kit-da/miner.webp` | 1 | 41 796 octets | 400×600 |
| Contremaître `src/assets/porion-ravens.png` | 1 | 2 128 375 octets | 1145×1374 |
| **Total physique image** | **33** | **2 247 825 octets = 2,14 Mio** | 31 SVG, 1 WebP, 1 PNG |
| Bibliothèque Phaser minifiée, hors images | 1 | 1 196 122 octets | Version 3.90.0 installée ; pas un poids DA |

Le PNG Ravens représente **94,7 % du poids de ces images**. C'est le premier candidat à une déclinaison d'export adaptée à l'affichage, avant de compresser davantage les petits SVG. La compression et le redimensionnement de ce portrait ne sont pas réalisés pendant V0.32. Garder l'original comme source ; contrôler les lunettes, la barbe, la transparence et les bords après tout export.

Méthode pour les textures : exécution Node, en lecture seule, de `makeTextures(scene)` (`src/textures.js`) puis `createArenaArt(scene)` (`src/combat-art.js`) avec un objet Graphics simulé. Le proxy compte les appels `generateTexture(name,width,height)` ; il ne lance ni Phaser, ni navigateur, ni GPU. Résultat : **48 textures générées**, soit **9 330 016 octets / 8,90 Mio** à raison de quatre octets RGBA par pixel. Il existe 4 649 appels de méthodes du proxy lors de cette construction, styles et gestion inclus : ce nombre décrit le travail ponctuel de fabrication, **pas** des draw calls par frame ou une durée de chargement.

| Mémoire d'image estimée | RGBA brut, hors surcoûts | Interprétation |
|---|---:|---|
| Six arènes de 450×800 | 8 640 000 octets / 8,24 Mio | Générées et conservées dès la création ; une seule affichée à la fois |
| 42 autres textures générées | 690 016 octets / 0,66 Mio | Sprites 34–84 px, projectiles et VFX très petits ; certains servent de fallback |
| 15 SVG combat chargés en 128×128 | 983 040 octets / 0,94 Mio | Préchargement dans `preloadCombatAppearances` ; ne restent pas des chemins SVG dessinés chaque frame |
| **63 textures nommées de jeu** | **10 313 056 octets / 9,84 Mio** | 48 générées + 15 chargées ; pas le nombre total de textures internes Phaser |
| Ravens décodé, s'il est résident | 6 292 920 octets / 6,00 Mio | Image DOM, en dehors des 63 textures ci-dessus |
| Mineur du menu décodé | 960 000 octets / 0,92 Mio | Image DOM, également hors textures de combat |

**Cette addition n'est pas une mesure VRAM.** Canvas sources, caches de décodage du navigateur, copies CPU/GPU, allocations du pilote, buffers de rendu, éventuels mipmaps, textures internes Phaser et textes dynamiques ajoutent des coûts. Les images DOM peuvent être libérées ou partagées selon le navigateur. Le poids compressé d'un atlas ne permet donc pas d'en déduire la mémoire GPU.

Les limites ci-dessous sont des **budgets initiaux à faire respecter**, révisables seulement après mesure et validation visuelle. Les pixels sont des dimensions d'export, pas des rayons de collision. Aucune modification de hitbox, cadence, durée de télégraphe, densité d'ennemis ou dégâts n'est autorisée en échange d'un gain FPS.

| Catégorie | Dimension d'export cible / plafond courant | Poids cible par élément | Règle |
|---|---|---|---|
| Héros combat | frame 96×96 ou 128×128 ; plafond 128×128 | SVG statique ≤10 Ko, ou mutualisé dans atlas | Silhouette lisible à ~46×52 unités ; détails C2G dans les grosses masses, pas microtexte |
| Ennemi normal | frame 64×64 à 128×128 ; plafond 128×128 | SVG ≤8 Ko ; feuille incluse au budget zone | Plusieurs directions seulement si elles corrigent une ambiguïté réelle ; ne pas produire 16 orientations par défaut |
| Boss | frame 128×128, exceptionnellement 192×192 | SVG ≤15 Ko ; feuille incluse au budget zone | Exception motivée par une silhouette élargie ; hitbox toujours indépendante |
| Armes tenues | 64×64, plafond 128×128 | ≤8 Ko SVG | Partager avec les tirs et le héros par atlas si animé |
| Projectiles, impacts | frames 16–64 px ; impact boss exceptionnel 128 px | Feuille commune ≤150 Ko | Tracés nets ; éviter le grand carré transparent autour d'une minuscule étincelle |
| Fond d'arène | 450×800 nominal ; 900×1600 seulement si comparaison mobile justifie le double | 100–250 Ko WebP ou format validé pour l'image | 450×800 = 1,37 Mio RGBA ; doubler chaque dimension = **5,49 Mio**, ×4, pas ×2 |
| Portraits menu | 400×600 à 512×640 selon cadrage | 60–150 Ko pour grande illustration | Export WebP avec alpha si adapté, PNG si les arêtes l'exigent ; source maîtresse conservée |
| Ravens | déclinaisons petite vignette et grand portrait ; grand côté ≤640 px dans le build initial | ≤150 Ko grand portrait, petite version ≤30 Ko | Conserver intégralement son identité ; ne pas charger 1145×1374 pour une pastille |
| Icônes UI / ressources | SVG viewBox 48–96 px, ou raster64/96 px | ≤4 Ko SVG simple | Pas de filtres SVG animés, pas de polices embarquées par icône |
| Cartes de zone | 320×200 à 480×300 | ≤60 Ko chacune | Chargement à l'ouverture de la page ; illustrations harmonisées, décor sans animation continue |
| Atlas | pages **1024×1024** par défaut ; **2048×2048** maximum sur chemin standard | ≤500 Ko par page1024, ≤1,2 Mo page2048, à contrôler | 4 Mio / 16 Mio RGBA par page. Le budget de mémoire prime sur le fichier compressé |

Un atlas 1024² plein peut contenir jusqu'à 64 cellules 128² avant bordures/espacement ; réserver le padding anti-bleed et ne pas compter cette capacité théorique comme exploitable à 100 %. Préférer 2 px de bordure extrudée, frames rognées avec pivot constant, puis vérifier l'absence de couture lors du scale/flip. Les animations doivent partager l'origine artistique correspondant au point au sol ; pas de recentrage automatique des frames qui décale le corps par rapport à la collision.

### Enveloppe globale et streaming

1. **Visuels initiaux du menu : cible ≤1 Mo transféré**, bibliothèque/code séparés. **Pack de zone additionnel : cible ≤1 Mo**, plafond indicatif1,5 Mo si les mesures chargement restent satisfaisantes. **Catalogue visuel complet : cible ≤8 Mo**. Ce sont des octets de contenu ; relever ensuite les vrais `transferSize`/`encodedBodySize` en environnement publié pour les comparer correctement.
2. **Mémoire brute des images de combat actives : cible ≤24 Mio**, plafond revue32 Mio. Ce total inclut pages complètes d'atlas, fond, textures communes et fallback encore présents. **Total art décodé combat+UI : cible ≤32 Mio**, plafond revue48 Mio ; cela n'est toujours pas la mémoire totale du processus navigateur. Il ne faut pas charger toutes les zones animées au lancement pour respecter ces chiffres.
3. **Textures/atlases :** viser une page commune héros/armes/VFX, une ou deux pages acteurs de zone et un fond. Ce budget de **3 pages1024² d'acteurs/effets au plus pour une zone courante** laisse de la place aux petits éléments et au fond ; il ne signifie pas quatre draw calls. Conserver les couches de danger séparées quand leur géométrie l'exige. Ne pas supprimer les fallbacks actuels avant validation des nouveaux exports.
4. Charger la zone pendant un écran de préparation avant que le jeu reprenne ; ne jamais décoder un atlas au milieu d'un télégraphe. Décharger les packs non utilisés lors d'un changement de zone seulement après vérification que l'UI, les images et les effets n'y font plus référence. Un compteur de références explicite vaut mieux qu'un nettoyage indiscriminé du TextureManager.
5. Pour une livraison future, noms d'assets versionnés et cache durable ; HTML/manifeste revalidés. **La configuration locale `no-store` reste utile aux tests et inchangée dans cette phase.** Aucune modification de CGWeb/CDN/CORS n'est proposée ici comme action immédiate.

### Animation, couches et effets

- Une cadence d'animation artistique de **8–12 images/s** suffit comme point de départ pour une marche ou un moteur ; la position reste interpolée/rendue à la cadence du jeu. Idle2–4frames, marche4–6, attaque2–4, hit1–2, mort3–5 : budgets de travail proposés, pas nouvelles durées gameplay.
- Les phases artistiques suivent les événements existants : début/fin du warning, attaque, récupération, hit et mort. Une anticipation dessinée plus longue **ne doit pas retarder l'attaque** ; ajuster les frames au délai réel. Aucun événement d'animation ne doit devenir l'horloge du combat.
- Animation décorative environnement : une couche légère, au plus12 éléments simples visibles, cadence6–10images/s ou déplacement de quelques sprites. Compter ces éléments dans le budget VFX ; ne pas lancer une particule persistante par rivet, fissure, tuyau ou plaque.
- Conserver le pool48 existant comme plafond partagé d'étincelles/anneaux et donner la priorité aux retours utiles. Si rempli, abandonner un effet décoratif ; **jamais** un projectile, un warning ou un indicateur de dégât. Ne pas augmenter le pool par défaut pour enrichir la DA.
- Au plus une grande nappe translucide d'ambiance hors dangers, faible alpha ; pas de bloom/blur plein écran dans le chemin mobile standard. Lumières de lampes et métal chaud surtout intégrées au fond, renforcées par quelques formes simples. Le critère premier reste télégraphe hostile > projectile hostile > personnage > décor.
- Réduire les détails décoratifs et les frames d'animation si nécessaire, sans réduire fréquence de simulation, durées d'attaque ou visibilité des dangers. `prefers-reduced-motion` conserve tous les signaux essentiels via un état statique clair.

### Recette Android future

Définir le téléphone cible par **modèle, SoC/GPU, RAM, résolution, version Android/Chrome et fréquence écran réellement utilisés**, plutôt que l'expression ambiguë « Android moyen ». Choisir au minimum un téléphone courant de milieu de gamme4–6Go et un appareil plus ancien disponible ; inscrire les références dans le rapport. Les tests de viewport desktop320×568/390×844 servent à la composition, pas à simuler un GPU, l'autonomie ou la chauffe Android.

Scénario reproductible : même build, même sauvegarde de test, même arme/perks/scène, sans modifications gameplay ; menu froid puis chaud, combat ordinaire, vague dense, chacun des six triples, extinction, surchauffe et écran de choix. Relever sur3séquences de60s par scène critique après échauffement ; compléter par une session15minutes pour la dégradation thermique. Comparer avant/après sur le même téléphone et dans les mêmes conditions. Les simulations Node prouvent la logique, pas le coût graphique.

Critères initiaux : **cible60FPS**, budget frame16,7ms ; pas de nouvelle saccade répétée supérieure50ms ni interruption100ms pendant un danger. Mesurer médiane, p95/p99 des intervalles de frames, proportions >25ms et >50ms, longs travaux JS, mémoire d'images calculée, mémoire processus quand accessible, nombre de textures, réseau et temps jusqu'au menu jouable. Une médiane seule peut masquer une mauvaise régularité. Demander une explication/revue si p95 se dégrade de plus10% par rapport au témoin ; ne pas présenter ce seuil relatif comme une preuve de fluidité si le témoin est déjà lent.

Sur le téléphone ancien qui ne tient pas60FPS, établir un témoin stable puis limiter les seuls détails décoratifs. Un mode30FPS éventuel serait une décision distincte à valider : le `dt` courant est plafonné à40ms, donc une forte baisse de cadence pourrait affecter le temps simulé. **Ne pas changer ce plafond, la fréquence de combat ou le gameplay pour « réussir » la recette graphique.**

Vérifier aussi après dix cycles menu→run→résultat→menu : textures et DOM ne croissent pas indéfiniment ; aucun asset404, aucun mauvais MIME, console propre, pas de nouveau son hors budget, aucun chargement tiers. Prévoir une perte/reprise de visibilité et rotation d'écran, ainsi que l'échec de chargement d'un asset pour contrôler le fallback. Exporter des résultats avec leur appareil et leurs limites ; ne jamais annoncer « Android validé » à partir d'une simple émulation de taille.

## 13. Priorités

P0 regroupe reconnaissance et survie : héros, armes, silhouettes ennemies/boss, dangers et impacts, fonds distincts, HUD. P1 regroupe cohérence et confort : Ravens, accueil, carte, méta, choix. P2 regroupe détails secondaires, icônes mineures et ambiance. Un signal incompréhensible ou trop petit remonte en P0 même s'il appartient à un écran méta.



| Rang | Traitement décidé | Justification |
|---|---|---|
| P0 — premier lot | Héros, trois armes, tirs/impacts, protection des contours hostiles | Fixer un étalon et ne pas dégrader la survie par les nouveaux effets |
| P0 — déclinaisons | Silhouettes des 17 ennemis / 18 boss, hors refonte Rat/Wagon, puis six environnements | Fermer la rupture Z1–2 / Z3–6 ; distinguer boss et mobs en silhouette |
| P0 — interface utile | Lecture du choix d’arme et HUD ; tout prix/bénéfice illisible bloque son lot | La taille écran réelle prime sur la décoration |
| P1 | Accueil, carte, Atelier, Talents, Relève, Caisses, Contrats, Classement, choix/résultats, Ravens | Une famille de composants ; préserver la personnalité et les parcours |
| P1 — conservatoire | Rat/Wagon et orientation existante ; portrait maître Ravens | Références validées, aucune réinvention automatique |
| P2 | Micro-patine, variantes accessoires, particules et icônes secondaires | Seulement après lecture et coût mobile validés |

P0 désigne une importance, pas une permission de produire tous les éléments simultanément. Toute tranche doit se terminer par tests, captures et arrêt.

## 14. Plan d’intégration

| Version future | Périmètre proposé | Sortie exigée avant la suivante |
|---|---|---|
| **V0.33** | Héros + trois armes + VFX de tir ; établir les tokens et la protection des contours hostiles dès ce lot | Référence de style appliquée sur un combat actuel dense ; tirs identiques, trois armes distinctes, héros suivi à 320 px, huit caps et reduced-motion. Pas de refonte globale des monstres. |
| **V0.34** | Ennemis et boss Zones 1–3, par sous-lots zone par zone | Silhouettes, sens d'attaque, préparation/récupération ; Rat/Wagon conservés ; trois triples validés sans retimer les patterns. |
| **V0.35** | Ennemis et boss Zones 4–6, par sous-lots | Les textures procédurales actuelles rejoignent la même famille ; distinction outil/avant de chaque rôle ; chaleur et extinction intactes. |
| **V0.36** | Environnements 1–3 | Bois/rails/puits identifiables sans UI, aucune fausse collision, décor sous les dangers. |
| **V0.37** | Environnements 4–6 | Faille/obscurité/forges distinctes ; extinction mémorable et trois phases de surchauffe lisibles, géométrie inchangée. |
| **V0.38** | HUD combat + adaptation visuelle des choix/résultats | Typographie et hiérarchie mobile, boss identifiés, textes longs et interactions testés ; cohérence avec les composants définis. |
| **V0.39** | Accueil, carte, méta, Ravens et icônes fonctionnelles | Une seule famille de plaques, parcours actuels conservés, portrait immédiatement reconnaissable, pas de modification économie/progression. |
| **V0.40** | Polish ciblé animation/VFX + performance | Android réel, budget tenu, derniers chevauchements lisibles, détails inutiles retirés ; pas une nouvelle passe de gameplay. |

Cet ordre reprend la demande en remontant **le contrat de lisibilité des dangers** dès V0.33 : il serait trop tard de découvrir en V0.40 que les nouveaux effets cachent les attaques. Le HUD reçoit sa refonte complète en V0.38, mais tout signal de sécurité détérioré par un lot bloque immédiatement ce lot.

**V0.32 s'arrête à l'audit, à la bible, à l'inventaire et aux preuves de l'état actuel.** Les versions futures sont proposées, pas commencées ni autorisées par ce document.

### Recette et frontières techniques

**Interdits :** modifier stats d'armes/acteurs, hitboxes, dégâts, cadence, portée, pénétration, cooldown, patterns, trajectoires, timers, caps, progression, économie, sauvegarde ou connexion CGWeb. Le renderer ne consomme pas le RNG du combat. Les textures de rechange restent des présentations des mêmes états.

Avant chaque lot : captures actuelles et références d'orientation ; manifest des fichiers autorisés ; mêmes seeds/inputs et états attendus. Après le lot : tous les tests conservés, comparaison exacte des événements/positions/HP/timers/résultats, comparaison des hitboxes en surimpression QA, validation visuelle puis arrêt. Une capture belle ne remplace pas ces contrôles.

### Portes de validation

1. **Reconnaissance :** planche de silhouettes à taille mobile ; rôles et boss de chaque zone distincts. Les six décors sans UI sont mélangés pour un test humain ; cible proposée ≥5/6 associations après présentation des références. Aucun résultat actuel n'est revendiqué.
2. **Direction :** huit caps statiques et en mouvement ; axe arme/tir et avant/charge cohérents ; comparaison stricte Rat/Wagon aux références validées.
3. **Lecture réelle :** 320×568 et 390×844 à 100 %, combat normal puis triple. Repérer héros, prochain danger et passage sûr en couleur et niveaux de gris ; toutes les phases lisibles sur image fixe. Une zone sûre logique ne suffit pas si elle est masquée.
4. **Superposition :** rail+charge, chaleur+projectiles, gaz+onde, extinction+triple, protection+Grisou+aspiration. Les contours critiques survivent aux impacts et morts ; aucun nouveau faux obstacle.
5. **UI :** valeurs longues, noms longs, choix aux descriptions les plus longues, relance, résultat rempli, états verrouillé/acquis/erreur. Aucune information de décision rognée, cible tactile et contraste vérifiés.
6. **Fluidité :** profiler sur Android moyen réel avant d'accepter le lot. Les captures desktop redimensionnées ne prouvent pas les performances physiques. Les plafonds précis de textures/poids relèvent de l'audit performance ; privilégier fonds précalculés, formes peu nombreuses, cache et particules désactivables. Aucun shader plein écran indispensable.
7. **Non-régression :** tests et replays identiques, hors sorties explicitement visuelles ; aucun changement d'équilibrage masqué par le chantier DA. Mesures et limites consignées, sans promesse de performance non mesurée.

Chaque nouvel asset aura une fiche : rôle, source éditable, export/runtime, dimensions, pivot, taille affichée, référence de hitbox, palette, états/directions, poids, raison de remplacement et capture mobile de recette. Toute génération éventuelle d'image serait une matière première à harmoniser selon cette fiche, jamais une justification pour introduire un style différent.

### Organisation des petits lots

Chaque version commence par un échantillon étalon, puis un sous-lot limité et reviewable. Un manifeste liste les fichiers visuels autorisés ; les catalogues de stats et systèmes de progression ne font pas partie du lot. Garder sources maîtresses, exports précédents et captures. Après chaque sous-lot : tests conservés, comparaison des états simulés, rendu mobile, bilan puis arrêt pour retour utilisateur. Le plan ci-dessus ne déclenche aucune version automatiquement.

V0.32 se termine à cette documentation : **805/805 tests réussis**, captures des écrans demandés, aucun remplacement d’asset ni modification de production. Les performances sur Android physique et les futures silhouettes restent à valider après une autorisation de production distincte.
