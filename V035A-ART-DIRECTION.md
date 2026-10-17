# V0.35A — Direction artistique

Phase concepts maîtres uniquement. Références : VISUAL-BIBLE-V032.md, V033-VISUAL-PRODUCTION.md, V034A-ASSET-INVENTORY.md, V034A-ART-DIRECTION.md, V034A-VALIDATION.md, V034A1-VALIDATION.md, V034B-SPRITES-INTEGRATION.md et les deux galeries V034A/V034B.

## Construction commune

SVG locaux 512×512, repère128×128. Aplats modelés, contour encre3,5u, grandes arêtes usées et trois valeurs. Ni photo, texture bruyante, filtre, dégradé, halo, rouage décoratif ou asset distant. Cette méthode prolonge les masters vectoriels validés ; il ne s’agit ni de sprite sheets ni de fichiers runtime. Concepts et masters contiennent la même image statique.

La silhouette prime sur la couleur. Mobs48² et boss84² conservent le gabarit actuel. Les nouveaux boss gagnent en mécanismes et masse, pas en taille physique. Z4 : pans fracturés, brides et conduites rompues. Z5 : arêtes froides, projecteurs, grilles et équipements de travail. Z6 : calamine, plaques épaisses, registres, pistons et soupapes. Aucun code militaire ni magie.

## Palette et lumières

Encre #10191D, acier #203139/#30434A, arête #718783, crème #F0ECDF, chantier #B3944F, rouille #8D5039.

- Z4 : roche #30423A, dépôt #758364, émission contenue #82CFA7 sur fond #172725. Pas du mint blanc #82E8C2/#EEFFF7 des tirs alliés.
- Z5 : coque #29323E, arête #66707F, optique #B9C8D7 sur fond #10151F. L’extinction assombrit seulement le décor ; acteurs et warnings restent intacts.
- Z6 : fonte #37434A, calamine #59453B, cuivre #91573F, chaleur locale #C77446 sur fond #1D252B. Pas de feu décoratif sur le sol sûr.

Les masters ne contiennent aucune zone de danger. Ambre #FFC46B / corail #FF795F sont réservés à la couche illustrative de danger des fausses arènes, jamais au contour permanent des acteurs. Les émissions de repos restent petites. À320, un trait3,5u du master fait environ0,93px sur un mob,1,63px sur un boss : les détails internes ne sont pas des signaux critiques. Leur rôle est porté par une masse ou une ouverture complète, pas par une micro-vis.

## Orientation, collisions et animation future

Les 18 nouveaux types ont actuellement un corps fixe, sans rotation ni miroir, dans enemies/view.js et registry.js. Leur angle logique pilote attaques et trajectoires. Les concepts conservent une présentation fixe3/4 ; aucun pivot/flip n’est intégré. Pour V035B, toute bouche directionnelle exigera une étude visuelle de sous-pièce si nécessaire, sans déplacer l’origine gameplay. Aucun dessin n’autorise à changer une hitbox.

Tous les cadres sont inchangés, mais leurs appendices dépassent le disque comme les textures procédurales actuelles. La superposition cyan de la galerie est un outil QA, pas un futur VFX. Plus forte vigilance : Rampant r14, Gueule-Noire r15, Lampiste/Riveteur r17 ; accessoires fins sans dégâts propres. Les grands vides des supports ne sont pas des passages jouables.

Le jeu déclenche l’effet ; le visuel le représente. Aucune future frame/onComplete ne doit déclencher un projectile. Le patch Crachefer reste intégralement conservé. Boutefeu : la charge est posée au begin, puis l’acteur recule sans warning persistant. Éclateur : le warning de fragmentation après mort reste géré par le combat. Cœur : deux émissions espacées, pas une seule animation à événement fragile.

## Fiches par entité

### Rampant de Grisou

- Rôle : Contact rapide, poursuite ondulante ; aucune attaque temporisée propre.
- Silhouette : Rampeur bas à six appuis anguleux, carapace de roche prise dans un masque de récupération.
- Langage : Petite machine de reconnaissance contaminée, ventre proche du sol ; dos cassé et tête-outil plate. Ni queue de rat, ni mandibules fantastiques.
- Menace : Contact et débordement.
- Lumière : Fissure terne du dos ; pas de traînée de gaz permanente.
- Parties futures à animer : Trois paires de jambes, flexibles courts et masque qui accuse les appuis.
- Invariants : Centre de la carapace, masque avant et enveloppe des pieds.
- États envisagés, non produits : idle, move ondulant, hit, death ; pas de PREPARE/ATTACK artificiel.
- Taille/hitbox : 48×48, r14. Pattes et masque dépassent le disque r14 ; aucune patte ne doit suggérer une hitbox séparée.

### Cracheur

- Rôle : Distance 180–235 u ; pose une poche de gaz r38 à la position du joueur, active 2 s après warning 1,3 s. Aucun projectile volant pour cette attaque.
- Silhouette : Bouteille verticale crustée sur deux longs pieds, col de projection en coude à droite.
- Langage : Confinement de gaz et roche, cuve haute sanglée ; buse étroite déportée. Opposé au four ventru et à la large bouche du Crachefer.
- Menace : Gaz au sol, attaque indirecte.
- Lumière : Deux fentes de gaz confinées au réservoir.
- Parties futures à animer : Soufflet de col, petit volet de buse, jambes en repositionnement.
- Invariants : Bouteille haute et deux grands vides latéraux ; point de gaz géré par la simulation.
- États envisagés, non produits : idle, move, prepare gaz, émission visuelle lors de l’activation réelle, recovery, hit, death.
- Taille/hitbox : 48×48, r18. Longs pieds hors r18 : garder la buse discrète, ne pas ajouter un jet continu qui semblerait infliger des dégâts.

### Éclateur

- Rôle : Approche accélérée près du joueur ; explosion locale r58, warning 1,25 s. À la mort : avertissement 1,1 s puis six fragments.
- Silhouette : Bloc minéral compact à trois ruptures larges, serré par trois brides disjointes.
- Langage : Charge géologique sous tension, gros pans asymétriques. Aucun globe lumineux ni cristal parfait.
- Menace : Explosion proche et fragmentation après décès.
- Lumière : Fissures internes en vert terne, sans bord extérieur lumineux.
- Parties futures à animer : Écartement court des pans, brides qui résistent ; fragments de mort bornés.
- Invariants : Centre, contour de repos et trois grandes lignes de rupture.
- États envisagés, non produits : idle, move, prepare blast, attack, recovery, hit, death ; l’effet de mort doit rester gouverné par le warning gameplay.
- Taille/hitbox : 48×48, r19. Le cercle explosif r58 dépasse fortement le corps r19 : il reste un télégraphe séparé, jamais une aura permanente.

### LE FENDEUR

- Rôle : Boss mobile : charge droite 330 u/s, éventail de huit projectiles, trois fissures. Plus de charges/éventails sous 50 % PV.
- Silhouette : Double coin fendeur en V devant un pont hydraulique, deux chenilles hautes.
- Langage : Machine de fracture, deux lames larges qui encadrent un jour étroit ; poids porté par le châssis, pas un gros Rampant.
- Menace : Percussion frontale puis couverture de terrain.
- Lumière : Petit voyant de vérin ; aucune fissure dessinée sur le sol de l’asset.
- Parties futures à animer : Deux coins, vérins du pont, chenilles et volet de dispersion.
- Invariants : Écart entre les coins, axe de charge logique et centre du pont.
- États envisagés, non produits : idle, move, prepare charge/éventail/fissures, attack correspondant, recovery, hit, death.
- Taille/hitbox : 84×84, r28. Coins hors r28 ; le jour entre eux est visuel et ne constitue pas un passage sûr.

### LE SOUFFLEUR

- Rôle : Distance : cercle de huit tirs, quatre poches de gaz, cône de cinq tirs. Déplacements latéraux.
- Silhouette : Cassette de soufflets oblique, cornet latéral ouvert et conduite haute coudée.
- Langage : Soufflerie mobile à accordéon ; ni bonbonnes du Compresseur, ni cuve à soupapes de la Chaudière.
- Menace : Dispersion de gaz et couverture radiale.
- Lumière : Manomètre ocre encastré, pas de nuage statique.
- Parties futures à animer : Soufflets, bouche de cornet, soupape et pieds.
- Invariants : Cassette rectangulaire, cornet unique et grands vides sous le châssis.
- États envisagés, non produits : idle pression, move, prepare radial/poches/cône, attack, recovery, hit, death.
- Taille/hitbox : 84×84, r29. Cornet et tube haut hors r29 ; gaz et cône restent indépendants du dessin.

### LE CŒUR DE GRISOU

- Rôle : Double cercle de huit tirs décalés de 0,65 s, quatre impacts au sol, orbe lente se fragmentant en six après avertissement. Repositionnement mobile.
- Silhouette : Noyau minéral vertical captif d’un cadre polygonal, trois étriers et appuis décalés.
- Langage : Source énergétique industrielle confinée ; cœur minéral anguleux bien matériel, sans organe vivant ni lévitation magique.
- Menace : Deux émissions successives et dangers différés.
- Lumière : Deux facettes vert terne confinées. Aucun trait mint blanc de projectile allié.
- Parties futures à animer : Étriers, obturateur central, petits appuis ; deux impulsions de tir distinctes.
- Invariants : Cadre, centre minéral et points d’ancrage ; aucune pulsation de hitbox.
- États envisagés, non produits : idle, move, prepare, attack double en deux temps/orbe/pluie, recovery, hit, death.
- Taille/hitbox : 84×84, r30. Étriers hors r30 ; ne pas confondre énergie permanente contenue et orbe hostile libérée.

### Lampiste

- Rôle : Distance 185–255 u ; trois projectiles lumineux en éventail étroit, warning 1,1 s. Ce n’est pas un faisceau continu.
- Silhouette : Projecteur rectangulaire dans un étrier bas sur trépied asymétrique.
- Langage : Équipement de galerie autonome plutôt qu’humain portant un gros casque. Une seule ouverture lumineuse rectangulaire.
- Menace : Salve de trois tirs en ligne de visée.
- Lumière : Petite fente ivoire froide, localisée ; extinction ne doit pas éteindre cet acteur.
- Parties futures à animer : Étrier, shutter optique, pieds ; inclinaison locale de l’optique à étudier sans rotation du corps.
- Invariants : Bloc-projecteur et ouverture rectangulaire.
- États envisagés, non produits : idle, move, prepare light, attack, recovery, hit, death.
- Taille/hitbox : 48×48, r17. Pieds hors r17 ; lampe visible pendant extinction sans halo qui masque le télégraphe.

### Boutefeu

- Rôle : S’approche à 65 u, pose une charge à 20 u devant lui, puis recule immédiatement. Explosion r39 après 1,5 s ; préparation portée par la charge au sol.
- Silhouette : Ouvrier accroupi, sacoche de charges en dos et pince basse déportée.
- Langage : Spécialiste de mine au masque court ; genou plié et main au sol racontent la pose puis le retrait. Pas de fusil ni d’équipement militaire.
- Menace : Charge au sol, pas tir direct.
- Lumière : Visière froide sous capuche, lue même sur fond éteint.
- Parties futures à animer : Pince, avant-bras, genou, sacoche lors du retrait.
- Invariants : Sacoche à gauche et silhouette basse. L’animation ne doit jamais retarder la pose.
- États envisagés, non produits : idle, approche, pose brève au begin réel, recul/recovery, hit, death ; ne pas attendre un état warning de l’acteur qui est immédiatement remplacé.
- Taille/hitbox : 48×48, r18. Pince et sacoche hors r18. Le chargeur porté n’est pas un danger permanent.

### Gueule-Noire

- Rôle : Approche rapide en zigzag puis bond rectiligne à 260 u/s pendant 0,52 s, warning 0,9 s. Plus mobile pendant extinction.
- Silhouette : Combinaison ramassée à jambes comprimées et grand masque respiratoire rectangulaire.
- Langage : Équipement de fond déformé, corps bas prêt à bondir ; mâchoire = grille industrielle, sans crocs ni griffes de fantasy.
- Menace : Bond et contact, direction verrouillée.
- Lumière : Fente froide large et deux arêtes du masque ; aucune aura.
- Parties futures à animer : Jambes repliées, dos et flexible ; masque reste solidaire du torse.
- Invariants : Fente de visière, grille et enveloppe de bond ; pas de translation graphique hors collision.
- États envisagés, non produits : idle, move zigzag, prepare ramassé, leap, recovery, hit, death.
- Taille/hitbox : 48×48, r15. Nez du masque et jambes hors r15. Comparer au Rampant : deux jambes épaisses contre six appuis fins.

### LE LAMPISTE-MAJOR

- Rôle : Faisceau au sol, éventail de six tirs, extinction et salve de trois. Faisceau plus fréquent sous 50 % PV.
- Silhouette : Grand projecteur rond à volets diagonaux porté dans un large berceau mobile.
- Langage : Tour de lumière lourde, deux boîtiers d’alimentation et roues basses. Opposée au petit projecteur rectangulaire à trépied.
- Menace : Ligne de faisceau et modification de la lumière du décor.
- Lumière : Lentille partiellement obturée ; surface claire moins large que le télégraphe réel.
- Parties futures à animer : Volets de l’optique, étrier, roues ; extinction figurée par obturation locale.
- Invariants : Grande lentille centrale, berceau et largeur de base.
- États envisagés, non produits : idle, move, prepare beam/fan/blackout/light, attack, recovery, hit, death.
- Taille/hitbox : 84×84, r28. Berceau hors r28 ; faisceau et extinction restent sur leurs couches de rendu séparées.

### LE DYNAMITEUR

- Rôle : Trois charges, chaîne de trois explosions décalées, anneau à sept tirs avec passage, charge isolée. Cycle plus agressif sous 50 %.
- Silhouette : Opérateur à tablier blindé massif, deux magasins extérieurs verticaux et petit casque grillagé.
- Langage : Spécialiste de mine dans un harnais porte-charges ; mécanisme de distribution latéral, commande de détonateur distincte de la pince du Boutefeu.
- Menace : Séquences de charges imposant un trajet d’esquive.
- Lumière : Visière froide et cadran mat ; pas de mèches enflammées permanentes.
- Parties futures à animer : Magasins, poignée de commande, épaules et genoux.
- Invariants : Tablier en trapèze, petite visière haute et deux magasins.
- États envisagés, non produits : idle, move, prepare charges/chain/ring/lob, attack, recovery, hit, death.
- Taille/hitbox : 84×84, r29. Magasins hors r29 ; les charges numérotées 1→3 doivent rester des objets au sol séparés.

### LA MASSE NOIRE

- Rôle : Charge lourde 310 u/s, slam r94, trois fissures, extinction. Sous 50 % : davantage de charge/slam/fissures.
- Silhouette : Coin central très haut, deux énormes poings de percussion bas et patins courts.
- Langage : Masse de soutènement et de roche noire blindée ; deux bras-masses articulés expliquent le slam. Aucun blob mou.
- Menace : Charge lourde et grand impact au sol.
- Lumière : Visière et deux traits sur les bras restent présents en extinction.
- Parties futures à animer : Bras de percussion, suspensions, volet de visière.
- Invariants : Arête centrale haute, largeur des deux bras et point d’appui.
- États envisagés, non produits : idle lourd, move, prepare rush/slam/cracks/blackout, attack, recovery, hit, death.
- Taille/hitbox : 84×84, r31. Bras hors r31 ; grand slam r94 uniquement télégraphié au sol, pas de halo de 188 u dans le sprite.

### Chauffeur

- Rôle : Chauffe une plaque existante proche du joueur : warning 1,2 s, danger 2,3 s. Se maintient à distance.
- Silhouette : Générateur à peigne de refroidissement, buse courte pointée au sol et pieds ouverts.
- Langage : Groupe thermique de chantier, pas lance-flammes porté. Ailettes hautes et coude bas donnent un outil de chauffe indirecte.
- Menace : Plaque brûlante choisie dans les douze plaques fixes.
- Lumière : Petit foyer cuivre assourdi dans le boîtier ; pas rouge de danger au repos.
- Parties futures à animer : Volet thermique, vanne de conduite, pieds.
- Invariants : Peigne et buse basse. La plaque ciblée ne dépend pas d’une animation.
- États envisagés, non produits : idle, move, prepare heat, activation, recovery, hit, death.
- Taille/hitbox : 48×48, r18. Pieds hors r18 ; ne pas dessiner une flamme reliant la buse à une plaque distante.

### Riveteur

- Rôle : Tireur précis : un rivet, puis trois à partir de la vague 11. Warning 1,1 s ; vitesse 165 u/s.
- Silhouette : Long guide diagonal de riveteuse et bobine ronde latérale sur châssis étroit.
- Langage : Outil pneumatique de chantier à alimentation métallique ; deux pieds fins, sans canon de char.
- Menace : Tir rapide, direction fixée au départ.
- Lumière : Métal clair mat et petit témoin ocre ; aucun laser permanent.
- Parties futures à animer : Piston de rivet, bobine et pieds ; bouche locale future si nécessaire.
- Invariants : Guide long et bobine à gauche ; l’origine de projectile reste celle du code.
- États envisagés, non produits : idle, move, prepare, rivet/rivets, recovery, hit, death.
- Taille/hitbox : 48×48, r17. Guide hors r17 et oblique dans le concept fixe. L’orientation vers une cible devra être résolue en rendu, sans modifier la simulation.

### Scorificateur

- Rôle : Approche mobile puis ruée à 275 u/s pendant 0,65 s. Traînée chaude activée après la ruée, danger 1,3 s.
- Silhouette : Corps de calamine bas, deux patins décalés et grand racloir latéral courbe.
- Langage : Machine de décrassage agressive : la tranche de friction chauffée désigne l’avant ; pas un petit Marteau-Pilon.
- Menace : Contact de ruée puis sol chaud laissé derrière.
- Lumière : Tranche cuivre chaude contenue, sans halo permanent.
- Parties futures à animer : Patins, suspension et racloir ; vibration seulement pendant l’effort.
- Invariants : Contour du racloir et centre du carter ; la traînée reste un hazard séparé.
- États envisagés, non produits : idle, move, prepare scorch, charge, recovery/refroidissement, hit, death.
- Taille/hitbox : 48×48, r19. Racloir hors r19 ; ne pas exagérer sa largeur au-delà du couloir de charge.

### LE MAÎTRE DE FOUR

- Rôle : Deux plaques (jusqu’à trois sous 50 %), cône thermique de rayon 180, trois rivets ; repli en rivets si gros pattern refusé.
- Silhouette : Four trapézoïdal à porte grillagée, trémie haute et deux bras-conduites bas.
- Langage : Four mobile en fonte plaquée, architecture carrée et lourde. À distinguer du four rond Crachefer par la porte frontale et les bras de distribution.
- Menace : Chauffe du terrain et jet conique.
- Lumière : Foyer cuivre limité derrière grille, distinct de la couleur active des plaques.
- Parties futures à animer : Porte/registre, conduites et trains bas.
- Invariants : Trapèze de four, trémie et porte grillagée ; aucune flamme extérieure persistante.
- États envisagés, non produits : idle pression, move, prepare plates/jet/rivets, attack, recovery, hit, death.
- Taille/hitbox : 84×84, r28. Conduites hors r28 ; cône et plaques ne font jamais partie du master.

### LE MARTEAU-PILON

- Rôle : Impact initial large puis foyer réduit, double impact décalé 0,85 s, anneau à sept tirs et charge 300 u/s. Repli en impact léger si nécessaire.
- Silhouette : Portique vertical en H, piston central long et gros sabot rectangulaire bas.
- Langage : Vraie presse mobile, vide vertical de chaque côté du piston. Aucune gueule centrale de trémie comme l’Effondreur.
- Menace : Percussion et deux impacts successifs, ruée.
- Lumière : Tranche chaude du sabot seulement, pas de disque de feu au repos.
- Parties futures à animer : Piston, sabot, vérins et pieds.
- Invariants : Traversée haute, montant H, axe du piston et point d’appui ; impact jamais déclenché par une frame.
- États envisagés, non produits : idle, move, prepare slam/double/ram, attack, recovery, hit, death.
- Taille/hitbox : 84×84, r30. Traversée et pieds hors r30. Les vides latéraux sont graphiques, pas des passages jouables.

### LA CHAUDIÈRE

- Rôle : Éventail vapeur cinq tirs, quatre jets de soupapes séquencés, trois plaques de surchauffe et trois rivets. Cycle distinct sous 50 %.
- Silhouette : Chambre étagée haute d’un côté, large ventre blindé et quatre sorties de soupapes inégales.
- Langage : Chaudière mobile asymétrique, cerclages et manomètre central. Ni simple cuve ronde, ni soufflet de Souffleur, ni paire de bonbonnes du Compresseur.
- Menace : Pression multidirectionnelle et terrain surchauffé.
- Lumière : Cadran ocre mat et bords froids ; vapeur absente du master de repos.
- Parties futures à animer : Quatre soupapes, cadran, suspensions ; ordre 1→4 porté par effets séparés.
- Invariants : Profil étagé, volume bas et emplacement des quatre raccords.
- États envisagés, non produits : idle pression, move, prepare vapeur/soupapes/surchauffe/rivets, attack, recovery, hit, death.
- Taille/hitbox : 84×84, r30. Soupapes hors r30 ; jets de 115 u restent des lanes séparées, jamais intégrées au contour.

## Différenciation à faire approuver

Crachefer rond ventru / Cracheur haut à col coudé. Compresseur à bonbonnes / Souffleur en cassette accordéon / Chaudière étagée à quatre soupapes. Mineur voûté / Chef de Gare à palette / Boutefeu accroupi ; Lampiste choisi comme équipement autonome, non comme quatrième mineur. Marteau-Pilon en H vertical / Effondreur en trémie carrée. Rampant à six appuis / Gueule-Noire à deux jambes repliées / Scorificateur à racloir. Les planches monochromes documentent ces paris graphiques ; seule la validation humaine confirmera leur reconnaissance immédiate.
