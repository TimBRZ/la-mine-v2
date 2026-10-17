# V0.34A — Direction des concepts maîtres

Ces concepts prolongent le héros et les armes V0.33 validés, avec un dessin vectoriel local à aplats. Ils ont été reconstruits à partir des rôles et enveloppes du code, sans recolorer les anciens SVG. Trois sous-agents ont traité les familles par zone ; l'agent principal a harmonisé le format, les palettes, les gabarits et les planches de revue.

Références relues : VISUAL-BIBLE-V032.md, VISUAL-ASSET-INVENTORY-V032.md, audit-v032/CAPTURES.md, audit-v032/VALIDATION.md, V033-VISUAL-PRODUCTION.md. Les prescriptions historiques de conservation Rat/Wagon sont conciliées avec le nouveau brief : redesign proposé, acquis avant/arrière et orientation conservés, assets validés inchangés en production. Ravens est hors périmètre.

## Règles communes

Mine industrielle française rétro-futuriste : tôles réparées, vêtements de travail, charbon, outils, cuves, lampes capotées. Trois grandes valeurs ; un signe de rôle principal ; peu de pièces secondaires. Contour encre 3,5 unités au repère128, joints plus fins, aplats d'ombre et petites tranches usées. Aucun filtre, gradient, halo, texture photo, rouage décoratif ou code militaire. Les machines qui tournent privilégient une vue quasi de dessus ; les personnages conservent le miroir actuel.

La largeur de contour écran dépend de la réduction : environ .8px pour un mob de42unités à320, 1.7px pour un boss de88. C'est une limite connue de cette convention commune avec V033 : ne pas promettre 2px sur les petits mobs. Le signe principal repose aussi sur sa masse claire et son contour complet, pas sur un trait intérieur.

## Palette

Encre #10191D ; acier sombre #203139 ; face #30434A ; arête #718783 ; toile/crème #F0ECDF ; secondaire #BFCCC6 ; peinture chantier #B3944F ; rouille #8D5039.

- Galeries : charbon #171B1C, roche #34352F, bois #6C5135 / #967144, lampe limitée #E9B963.
- Voies : ballast #1B2428, rail #415456, traverse #554637, signal de service terne #91B5BD.
- Puits59 : vide #111A20, acier lourd #34434B, arête #748589, graisse #262723, peinture #B3944F.

Les maîtres sont neutres. Aucun grand glow hostile permanent. Les émissions futures resteront locales et calées sur les vrais états. Ambre #FFC46B réservé aux télégraphes ; corail #FF795F aux dangers actifs. Les accents #82E8C2 / #EEFFF7 du Grisou X allié sont absents des nouveaux concepts. Dans les fausses arènes : sous-contour et bord de danger dominent, projectile hostile compact ensuite, acteurs puis décor mat. Les signaux sont démonstratifs et ne remplacent pas les renderers existants.

## Identité des trois familles

Galeries : animal bas, humain trapèze, outil de forage court ; bosses découpe, four, portique. Voies : caisse de percussion, draisine ajourée, opérateur à palette, locomotive à chaudière, opérateur à leviers asymétriques. Puits59 : foret lourd, compas de sondage, porteur de réservoir ; cage d'extraction, bonbonnes asymétriques, cuve de confinement.

Les boss restent plus grands que les mobs, sans agrandissement du cadre actuel. Le supplément d'importance du Puits59 vient de la masse et des gros assemblages, pas d'une extension de hitbox ou d'un éclair géant.

## Fiches de conception et animation future

### Rat de galerie

**Rôle existant :** Petite menace rapide de contact ; poursuite et débordement selon la pression de la vague.

**Intention :** Redessiner les masses en aplats mats : arrière large, dos cassé et pattes ramassées ; conserver les corrections validées de direction.

**Signature :** Museau clair long à droite, croupe haute et queue recourbée uniquement à gauche.

**Posture / masse :** Profil bas en course ramassée, avant à +X. Hanche et cage thoracique autour de (59,68) ; queue sans masse collisionnelle.

**Lumière :** Aucune émission ; œil et museau en aplats mats.

**À animer plus tard :** Deux appuis de course, pli de la patte arrière, petite flexion de queue sans extension de son enveloppe.

**À garder stable :** Museau et queue restent de côtés opposés ; centre du corps, pivot et orientation travel inchangés.

**États proposés :** idle bref, course, hit, mort. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** Conserver 42 × 36 et r10. Queue et museau dépassent nécessairement le disque de contact comme dans le dessin existant ; ils ne doivent pas devenir des signes de dégâts séparés. Aucun agrandissement proposé.

### Mineur grisouteux

**Rôle existant :** Poursuite lente et robuste ; menace de contact, sans nouvelle attaque d’outil.

**Intention :** Humain hostile voûté, trapèze d’épaules, casque cabossé gris et vêtements rouille. Écarter la silhouette du héros et son casque ocre lumineux.

**Signature :** Large dos tombant, tête enfoncée et outil porté en diagonale basse.

**Posture / masse :** Trois-quarts frontal, buste en avant, deux appuis larges. Bas du torse autour de (65,79), proche du pivot actuel.

**Lumière :** Lampe ocre mate étroite sous capot ; aucun halo et aucune couleur énergétique alliée.

**À animer plus tard :** Pas lourds, avant-bras et balancement court de l’outil ; casque et épaules peuvent accuser le poids.

**À garder stable :** Masse thoracique et position de la lampe ; l’outil reste porté et ne suggère pas une nouvelle frappe temporisée.

**États proposés :** idle, déplacement lourd, hit, mort. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** Même enveloppe 62 × 66, r20 et origine .62. L’outil et les gants restent périphériques comme l’actuel ; vérifier une future pose de marche pour ne pas allonger la portée visuelle.

### Foreuse autonome

**Rôle existant :** Machine à distance ; garde une distance moyenne, télégraphie et alterne projectile simple et éventail de trois tirs.

**Intention :** Dessus compact, moteur arrière à deux chenilles et foret conique à bouche de percussion coaxiale. Une foreuse, sans apparence de char militaire.

**Signature :** Long cône de forage à droite, petit bloc arrière presque carré et deux chenilles courtes.

**Posture / masse :** Machine de dessus dirigée à +X, chenilles parallèles. Moteur et carter autour de (51,65).

**Lumière :** Unique témoin ocre de service, petite surface ; futur warning peut animer ce témoin dans les durées existantes.

**À animer plus tard :** Défilement de chenilles, rotation limitée du foret, recul interne de la culasse pendant le tir réel.

**À garder stable :** Axe de forage et bouche, châssis et origine .52 ; aucune translation d’asset ne doit servir d’origine aux projectiles.

**États proposés :** idle, repositionnement, préparation tir, tir simple / éventail, récupération, hit, mort. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** 58 × 50 conservé, r16. Le nez demeure décoratif hors centre ; ne pas l’utiliser pour décaler l’origine gameplay. Vue proche du dessus compatible avec rotation continue.

### La Haveuse

**Rôle existant :** Boss de charge rectiligne. La direction est verrouillée durant le télégraphe ; pas de suivi pendant la charge.

**Intention :** Machine de taille massive en coin, moteur décalé et chaîne de coupe courbe à grandes dents. Masse lisible sans personnage ou visage ajouté.

**Signature :** Grande mâchoire mécanique incurvée vers +X, deux chenilles lourdes et carter ocre en coin.

**Posture / masse :** Dessus en coin, coupe vers +X ; pas de roue ou de visage inversable. Carter à (57,64), outil secondaire à l’avant.

**Lumière :** Petite jauge ocre encastrée. Pas de lueur générale de chaîne ni de faux danger permanent.

**À animer plus tard :** Chenilles, chaîne en deux poses, dents et effort de suspension ; bref relâchement des appuis en récupération.

**À garder stable :** Centre du carter, arc extérieur de la chaîne, pivot .5 et direction de charge.

**États proposés :** idle, poursuite, préparation charge, charge, récupération, hit, mort mécanique. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** 88 × 88 conservé, r30. Le volume extérieur de coupe reste dans le gabarit historique ; dents au bord de l’image sans agrandissement de hitbox. Vérifier les huit rotations avant animation.

### Le Crachefer

**Rôle existant :** Boss à projectiles : alternance de tirs simples, éventails et cercles de six à huit projectiles selon les états existants.

**Intention :** Four de chantier court et horizontal, vraie trémie à charbon, chambre de pression et bouche large. Éviter la chaudière ronde générique ou le lance-flammes.

**Signature :** Trémie carrée ouverte à gauche, cheminée coudée courte et bouche de projection large à droite.

**Posture / masse :** Vue presque du dessus ; axe bouche +X, charbon arrière visible. Chambre du four autour de (66,66).

**Lumière :** Un manomètre ocre ; gorge de projection rouille mate au repos, sans feu permanent.

**À animer plus tard :** Volets de bouche, soufflet interne court, roues et soupape de cheminée ; synchronisation aux tirs existants.

**À garder stable :** Corps du four et silhouette de trémie ; aucune flamme extérieure persistante.

**États proposés :** idle, repositionnement, télégraphe simple / éventail / cercle, projection, récupération, hit, mort mécanique. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** 84 × 84, r28 et origine .5 conservés. La bouche est un repère graphique, pas une nouvelle origine du projectile. La cheminée ne doit pas devenir une extension de collision.

### L’Effondreur

**Rôle existant :** Contrôle de zone par deux éboulements télégraphiés près du joueur et le long de sa trajectoire ; ce n’est pas une attaque de marteau au corps à corps.

**Intention :** Portique autonome de soutènement évidé, quatre appuis, vérins latéraux et sabot de pression. La structure explique le contrôle de terrain.

**Signature :** Arche carrée ouverte et large trou central ; quatre pieds écartés, sabot avant asymétrique.

**Posture / masse :** Portique de dessus, ouvert vers +X, sans perspective verticale qui deviendrait inversée en rotation. Centre géométrique (64,64), réparti dans le cadre et les quatre appuis.

**Lumière :** Témoin ocre ponctuel sur la traverse, pas de contour lumineux de toute l’arche.

**À animer plus tard :** Vérins latéraux et tassement court des quatre appuis ; traverse prête à vibrer uniquement pendant les états existants.

**À garder stable :** Grand vide central, rectangle de la structure et centre du gabarit ; aucun bloc de roche décoratif au sol qui pourrait simuler un obstacle.

**États proposés :** idle, déplacement, préparation éboulement, activation des zones, récupération, hit, mort mécanique. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** 86 × 86 et r28 inchangés. Le centre vide est un choix de silhouette mais reste dans la collision circulaire actuelle : risque de perception de passage au centre à confirmer humainement. Les quatre pieds ne sont pas quatre hitboxes.

### Wagon Fou

**Rôle existant :** Menace de ligne : rail horizontal choisi près du joueur, télégraphe 1,1 s, charge droite verrouillée, arrêt à l'autre bord.

**Intention :** Wagon de percussion compact : caisse de charbon haute à gauche, capot bas et nez pointu à droite. Redessin des volumes en aplats V0.33, organisation avant/arrière validée préservée.

**Signature :** Deux roues basses, caisse arrière rectangulaire, phare et chasse-pierre saillant à l'avant droit.

**Posture / masse :** Profil à droite, roues en bas, caisse verticale et pare-chocs tourné vers la charge. Bloc caisse/moteur central, autour de (64,67) dans le canevas128.

**Lumière :** Petit phare crème #F0ECDF contenu dans son capot, sans halo. Ocre mat #B3944F et tranches #718783 ; aucun ambre de danger permanent.

**À animer plus tard :** Roues, suspension, petite vibration de capot pendant charge ; aucun virage ou déplacement visuel latéral.

**À garder stable :** Caisse, phare avant, axe horizontal, origine .5/.52 et sens de chargeAngle. Miroir existant conservé.

**États proposés :** idle/arrêt, préparation sur rail, charge et roues, hit court, mort mécanique brève. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** Gabarit 59×52 conservé, rayon 18 inchangé. Caisse, roues et pare-chocs débordent naturellement le cercle ; ne pas agrandir la collision pour suivre le contour. Le nez termine à x124 dans le canevas128, contour compris sans rognage.

### Draisine

**Rôle existant :** Tireur mobile à distance160–205, repositionnement latéral et éventail de trois projectiles lents ±22°. Une seule émission remplace l'ancienne rafale de deux.

**Intention :** Petit chariot technique ajouré en H, vu presque du dessus pour accepter la rotation360°. Canon étroit indépendant, batterie arrière et arceau de conduite ; aucun coffre lourd de Wagon.

**Signature :** Vides latéraux autour du moyeu central et long tube à droite, quatre petites roues périphériques.

**Posture / masse :** Châssis vu du dessus, canon vers +X ; aucune orientation verticale préférentielle du corps. Moyeu de canon et batterie sur le centre (54,65), image ancrée à (64,66.56).

**Lumière :** Petit témoin terne #91B5BD sur arceau, aucun cœur mint ni halo. Canon rouille, châssis acier.

**À animer plus tard :** Roues, court recul du tube, détente de l'arceau limitée ; futur signe d'armement dérivé du vrai télégraphe.

**À garder stable :** Châssis H, pivot .5/.52, bouche +X, volume central ; trajectoires et cadence identiques.

**États proposés :** idle technique, repositionnement, préparation éventail, tir, récupération, hit, mort. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** Gabarit58×53 et rayon17 conservés. Tube/arceau sont des appendices graphiques, aucune zone de collision ajoutée. Vue quasi zénithale nécessaire sur tous les caps, contrairement au Wagon de profil.

### Le Chef de Gare

**Rôle existant :** Boss de charge ; invocation d'un Wagon toutes les trois attaques, repli charge si aucun rail sûr disponible.

**Intention :** Contremaître ferroviaire massif en manteau de travail court et casquette plate. Avant armé d'une palette ferroviaire utilisée comme bélier visuel, bras lourds et appuis écartés.

**Signature :** Casquette plate, manteau en coin et grande palette verticale à l'avant droit. Aucun casque ocre de héros ni outil de soldat.

**Posture / masse :** Trois-quarts face à droite, torse légèrement incliné, pied arrière ouvert et bras de palette prêt à pousser. Torse large autour de (61,75), porté entre les deux bottes ; poids visuel vers l'avant.

**Lumière :** Palette rouille avec repère crème mat ; pas de lampe rouge clignotante permanente. Veste acier et revers rouille moins brillants que le héros.

**À animer plus tard :** Buste qui se ramasse, épaule/palette en avant, semelles au départ ; geste de commandement pour l'invocation existante.

**À garder stable :** Point d'appui, ancrage .5/.61, centre du corps et orientation flip ; la palette n'ajoute ni attaque ni portée.

**États proposés :** idle, repositionnement, préparation charge, charge, signal d'invocation Wagon, récupération, hit, mort. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** 82×86 et rayon26 conservés. Palette haute et manche sont visuels ; conserver le couloir de charge calculé avec rayon26. Aucun élargissement du bélier gameplay.

### La Locomotive

**Rôle existant :** Boss lourd alternant bélier verrouillé et poche de vapeur frontale. Machine lente entre attaques.

**Intention :** Locomotive industrielle vue presque du dessus, chaudière centrale blindée, cabine arrière mate et chasse-pierre avant en V. Les sorties de pression sont courtes et distinctes des appuis.

**Signature :** Capsule de chaudière au centre, cabine carrée arrière à gauche, trois essieux et chasse-pierre à droite. Silhouette dense distincte du Wagon à caisse haute.

**Posture / masse :** Vue quasi zénithale, avant droit, essieux perpendiculaires au corps et chaudière basse compacte. Chaudière centrée autour de (68,65) ; cabine arrière compacte et masse poussant vers +X.

**Lumière :** Un phare crème compact devant. Soupapes en acier #91B5BD terne, aucune vapeur lumineuse statique ni cœur de feu.

**À animer plus tard :** Essieux et bielles simplifiées, soupapes, court effort de chaudière ; vapeur seulement pendant l'attaque réelle, jamais nuage opaque décoratif.

**À garder stable :** Pivot central .5/.5, axe +X, largeur principale et phare frontal. Rotation complète actuelle conservée.

**États proposés :** idle pression, roulement, préparation bélier, bélier, préparation vapeur, vapeur, récupération, hit, mort. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** 88×88 et rayon32 conservés. Chasse-pierre et soupapes peuvent sortir du cercle32 sans agrandir ni charge ni vapeur ; comparaison du cercle nécessaire avant intégration future.

### L’Aiguilleur

**Rôle existant :** Contrôle de zone : alternance rails horizontaux/verticaux, tirs simples/éventail/cercle. Croix rare sous50% en solo seulement ; un rail au triple et aucune croix finale.

**Intention :** Opérateur compact portant un pupitre suspendu large, grand levier haut à gauche et commande basse à droite. Silhouette asymétrique de commande, lunettes isolées et acier froid mat.

**Signature :** Y asymétrique des leviers encadrant une petite tête et un pupitre trapézoïdal. Distinct de l'humain de charge et de la chaudière ferroviaire.

**Posture / masse :** Face trois-quarts droite, jambe arrière repliée, pupitre suspendu bas ; bras gauche relevé, bras droit ouvert en bas. Pupitre (62,82) porté par deux jambes ; tête petite autour de (60,33), laissant un vide sous chaque bras.

**Lumière :** Petit cadran acier terne #91B5BD sans glow ; lunettes foncées et commandes ocre/rouille. La télégraphie lumineuse future dépendra uniquement des vrais états.

**À animer plus tard :** Levier haut/bas associé à l'orientation de rails déjà choisie ; mains et pupitre pendant tir, retour bref en récupération.

**À garder stable :** Centre du pupitre, origine .5/.6, lunettes et appuis ; aucun rail décoratif dessiné sur le corps, aucune modification des dangers.

**États proposés :** idle, repositionnement, télégraphe rails H, télégraphe rails V, croix solo, tir simple/éventail/cercle, récupération, hit, mort. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** 86×86 et rayon27 conservés. Leviers/grips sont graphiques, ne doivent pas être lus comme des projectiles. Le trait haut reste à x20 et y6 dans le canevas, sans dépassement.

### Foreur de fond

**Rôle existant :** Approche lourde puis charge rectiligne. Préparation 1,3 s, ruée 320 u/s pendant 1,15 s, arrêt à la paroi. Aucun tir à distance.

**Intention :** Opposer à la Foreuse distante une flèche massive à arrière fourchu : un foret plein occupe le tiers avant et pousse un moteur court, compact, protégé par deux grands patins nettement écartés. La revue monochrome a conduit à ouvrir deux encoches transparentes entre patins et moteur : le contour se distingue maintenant du simple châssis triangulaire de la Foreuse. Vue presque dessus pour supporter la rotation complète sans jambes renversées.

**Signature :** Grand cône blindé clair à droite, moteur ocre court à gauche, deux longues branches arrière opposées avec vides visibles. Trois masses : fourche et bloc arrière, collier rouille, pointe acier.

**Posture / masse :** Neutre, mèche orientée à droite, patins parallèles, aucun effet d’attaque actif. Le foret large raconte la menace de charge sans faux télégraphe. Moteur autour de (45,65) ; pivot conservé (64,64). La pointe vers (122,67) contrebalance les patins arrière, centre physique inchangé.

**Lumière :** Unique petite lampe crème à (55,43), sans halo. Foret clair par matière, non lumineux. Aucun ambre vif ou corail actif au repos.

**À animer plus tard :** Futur collier de foret sur deux poses, patins qui se compriment à la préparation et léger recul interne à la récupération. Les rotations graphiques de foret ne doivent pas étendre la pointe ni modifier la direction de la ruée.

**À garder stable :** Pivot central, point de contact logique, extrémité avant et contour des patins. Aucun déplacement du container, aucune nouvelle traînée dangereuse.

**États proposés :** Idle court de moteur ; déplacement par vibration interne ; préparation par collier tendu ; charge et rotation discrète du foret ; récupération ; hit ; mort par arrêt puis carter affaissé. Timings de jeu lus uniquement, sans ajout de frames bloquantes.. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** Même rectangle 60×48 et rayon 20. Patins écartés vers y9–30 et y102–122 dans le canevas 128, contours compris à l’intérieur. Leur écart rend le contour plus identifiable sans modifier la taille de rendu. Pointe et patins dépassent visuellement le cercle, comme le foret actuel : ne pas les utiliser comme hitbox. Vérifier les huit caps et le cercle dans la future intégration, spécialement à 320 px.

### Sondeur

**Rôle existant :** Machine de distance : reste vers 190–245 u du joueur, se replace latéralement et recule. Son attaque est une zone de sonde au sol à la position verrouillée du joueur, rayon 36, télégraphe 1,5 s puis danger 0,7 s. Ce n’est pas un lance-projectiles.

**Intention :** Un instrument de géomètre industriel nerveux, beaucoup plus fin que le Foreur. Deux jambes de compas ouvertes dessinent la base et un troisième appui sombre suggère l’équilibre. La tête mécanique devient une optique physique et une poignée haute coudée, pas une antenne magique.

**Signature :** Silhouette en A évidée, corps étroit et optique décalée en bloc. Poignée haute cassée à gauche, grosse ouverture noire de l’objectif à droite.

**Posture / masse :** Neutre de mesure, tête inclinée modérément, deux grands pieds ouverts et troisième pied en retrait. Aucune zone au sol dans le concept. Tête/optique autour de (62,48), articulation autour de (63,72). Pivot logique (64,64), porté par le triangle des appuis.

**Lumière :** Lentille bleu-gris #8EB5B9 mate, sans cœur blanc émissif ni halo ; tranche crème minimale. Aucun faisceau cyan qui pourrait ressembler à une arme alliée.

**À animer plus tard :** Jambes alternées pendant le repositionnement, tête inclinable sur joint ocre, compression courte du support à la préparation de sonde. Aucune ligne lumineuse supplémentaire entre l’optique et le joueur.

**À garder stable :** Objectif dans le même volume, axe du support, pivot du sol et empreinte centrale. L’activation de la zone reste gérée par les hazards existants.

**États proposés :** Idle instrument ; marche/retraite sur appuis ; préparation par compression et inclinaison ; attaque de sonde ; récupération ; hit ; mort avec jambes qui se replient à l’intérieur du canevas. Pas de recul de canon ou de projectile inventé.. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** Même 44×52 et rayon 16. Les espaces entre jambes sont des espaces visuels, pas des trous de collision. Pieds décoratifs en bas du canevas : conserver ombre et pivot d’origine lors de la future animation.

### Grisouteux

**Rôle existant :** Poursuite rapide, puis explosion locale télégraphiée autour de lui à portée proche. Rayon de danger 62, warning 1,5 s, activité 0,7 s. L’attaque ne le tue pas : ce n’est pas un kamikaze.

**Intention :** Le poids d’une cuve trop grosse plie un petit ouvrier au masque industriel. Le réservoir dorsal en poire domine la silhouette ; la tête est basse et décentrée, les bottes restent minuscules. Il se distingue du Mineur grisouteux lourd sans dépendre d’une recoloration verte.

**Signature :** Ballon métallique incliné à droite, tête basse à gauche, valve rouge terne au sommet et tuyau court en boucle. Trois masses lisibles : cuve, masque, bottes.

**Posture / masse :** Neutre instable mais contenu, tête baissée, cuve fermée et pieds au sol. Pas de nuage, feu, particule ou éclat suggérant un danger déjà actif. Cuve haute vers (70,51), porteur vers (46,79), point logique (64,64). Le volume est volontairement porté en hauteur, sans déplacer la collision.

**Lumière :** Petite jauge #758364 mate, visière ocre #B3944F ; aucune menthe, aucun cœur blanc de Grisou X. Le grisou se raconte surtout par cuve/valve/pression.

**À animer plus tard :** Bottes rapides, réservoir légèrement contraint par les sangles, soupape qui se tend durant la préparation, flexion du tuyau. Au blast réel, ouverture brève de valve, pas d’explosion corporelle ni disparition inventée.

**À garder stable :** Point d’appui logique, masse du dos dans le canevas, volume de masque et longueur de flexible. Les VFX futurs restent séparés du rayon de dégâts.

**États proposés :** Idle sous pression ; course voûtée ; préparation par tension de valve ; décharge locale ; récupération ; hit ; mort distincte de l’attaque par affaissement du porteur et extinction de jauge.. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** Même 42×50 et rayon 15. Cuve et flexible dépassent le disque : parties décoratives, sans augmentation de portée ni de collision. Aucun nuage permanent n’élargit artificiellement la présence.

### Le Cageur

**Rôle existant :** Boss vague 5 et triple final. Alterne charge verrouillée, impact devant lui et câble vertical au sol. Charge 275 u/s sur 0,55 s ; impact à 85 u devant, rayon 36 ; câble de 180 u sur demi-largeur 14.

**Intention :** Cage d’extraction devenue machine mobile lourde : cadre trapézoïdal haut, énormes guides de puits et deux butoirs. Conserver des vides entre barreaux pour que la cage reste identifiable en petite taille, avec une masse de bélier en bas distincte des boss humanoïdes ou cylindriques.

**Signature :** Portique trapézoïdal à trois barreaux épais, treuil supérieur et grande traverse de choc rayée en bas. Deux câbles courts annoncent le puits sans déborder vers le HUD.

**Posture / masse :** Neutre frontal, cage basse comprimée dans son cadre, câble court tendu. Pas de posture d’attaque supplémentaire produite dans ce lot statique. Cage vers (64,68), grande traverse vers (64,99), treuil haut équilibré. Centre physique (64,64) conservé ; boss plus haut et plus lourd que les mobs à leur taille nominale.

**Lumière :** Petite lampe crème sous treuil, sécurité ocre mate sur trois barreaux et butoir. Pas de cône, halo ou gyrophares permanents.

**À animer plus tard :** Tambour du treuil, cage interne qui se comprime, guides et butoir sur quelques poses. Pour charge/front : préparation visuelle lisible dans la direction déjà verrouillée ; pour câble : traction du treuil. Ce rendu directionnel reste à concevoir ultérieurement, sans changer angle ou trajectoire.

**À garder stable :** Cadre externe, pivot central, position des appuis, longueur maximale des câbles. Les barreaux ne deviennent pas une nouvelle zone de collision et ne masquent pas durablement le télégraphe.

**États proposés :** Idle de cage suspendue contenue ; déplacement sur patins ; préparation charge ; charge ; impact frontal ; traction câble ; récupération ; hit ; mort par affaissement interne et treuil arrêté. Les temps restent ceux du code.. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** Même 84×84 et rayon 29. Butoirs/patins occupent les bords du canevas et dépassent le disque physique. L’ancien rendu face fixe ne raconte pas tous les caps de charge : risque à traiter par poses ou élément orienté de rendu, jamais par changement de hitbox.

### Le Compresseur

**Rôle existant :** Boss vague 10 et triple final. Alterne vapeur en éventail, cercle de projectiles et pression au sol. Cercle 6 projectiles, parfois 8 sous 50 % hors final ; pression rayon 52 pendant 1,4 s après préparation.

**Intention :** Deux bonbonnes massives volontairement inégales et un grand coude latéral forment une silhouette immédiatement mécanique. Grande jauge unique au centre, assise basse, pas de corps humain ni de cage. La machine raconte la montée de pression avec ses organes existants.

**Signature :** Tour acier haute à gauche, cuve ocre courte à droite, conduite en crochet en haut à droite, manomètre bas au milieu. Les hauteurs et les vides différencient le boss même sans couleurs.

**Posture / masse :** Neutre sous pression faible, aiguille en bas, valves fermées, deux bonbonnes assises sur socle commun. Réservoir haut vers (35,60), court vers (82,68), socle vers (62,103), manomètre (59,79). Pivot du jeu (64,64), masse du dessin ancrée vers le bas.

**Lumière :** Aucune émission permanente. Jauge crème mate, bonbonne acier et ocre de chantier. Pas de vapeur décorative au repos, ni confusion avec un éventail actif.

**À animer plus tard :** Aiguille, pistons internes, soupape et petite compression des cylindres durant warnings. Le coude est une signature d’équipement, pas une nouvelle origine de projectile : émission visuelle future à synchroniser avec les événements et origines existants.

**À garder stable :** Dimensions extérieures, appuis, centre du manomètre et largeurs de réservoir. Aucun nuage opaque persistant ; souffle futur contenu et sous les signes hostiles prioritaires.

**États proposés :** Idle mécanique ; déplacement sur patins ; préparation de pression ; éventail vapeur ; cercle ; pression au sol ; récupération ; hit ; mort par arrêt des pistons puis affaissement de conduites à l’intérieur du cadre.. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** Même 84×84 et rayon 31. Coude haut déporté dépasse le disque de collision : décor mécanique sans dégâts additionnels. Vérifier la cohabitation des trois boss et dangers au sol dans le lot d’intégration.

### Le Grisou

**Rôle existant :** Boss vague 15 et triple final. Alterne poches de gaz autour de la position joueur, explosion locale et projectile énergie simple. Deux poches hors final, une en final ; pas de cercle propre à ce boss dans le code actuel.

**Intention :** Remplacer la sphère à éclair par une cuve industrielle ovoïde sous trois énormes étriers. Le danger vient d’un confinement trop tendu, pas d’une créature magique. Réservoir plus large et plus compact que le Compresseur, visière étroite plutôt que cœur lumineux exposé.

**Signature :** Gros œuf blindé, trois pinces longues et deux très petits patins ; valve de travers en haut à droite. Silhouette ovoïde crantée à distinguer de la poire dorsale du petit Grisouteux.

**Posture / masse :** Neutre, coque fermée et aucun gaz en fuite. Soupape oblique et hublot terne suffisent à exprimer l’instabilité sans danger instantané. Cuve centrée autour de (65,65), poids bas vers (64,88), petits pieds autour de y112. Pivot physique (64,64) conservé.

**Lumière :** Hublot réduit en vert minéral mat #758364, étriers acier, verrou ocre. Pas de mint #82E8C2, pas de blanc énergétique, pas d’éclair magique, pas de halo.

**À animer plus tard :** Tension légère des étriers, soupape, volet de hublot et compression intérieure ; préparation de gaz par valve, blast par tension des fixations, énergie par volet. Rien ne suit le joueur dans une animation décorative.

**À garder stable :** Forme extérieure blindée, ancrages de pince, pieds, pivot et limites de l’ouverture. Pas de croissance hors canevas ni d’anneau décoratif assimilable à un nouveau rayon dangereux.

**États proposés :** Idle de cuve ; déplacement lourd court ; préparation gaz ; relâche de gaz ; préparation et blast local ; tir énergie ; récupération ; hit ; mort par perte de pression et chute intérieure du volet. Aucune animation finale livrée maintenant.. Les ennemis de contact sans attaque temporisée n'ont pas de télégraphe artificiel à ajouter.

**Gabarit / risque :** Même 84×84 et rayon 29. La coque est plus large visuellement que le disque, déjà le cas de l’ancien carré 84² ; les trois étriers sont décoratifs. Préserver zones sûres et visibilité des hazards lors de la future mort.


## Passage éventuel à l'animation

Validation humaine du master, de la silhouette et de la taille mobile d'abord. Ensuite seulement : isoler les pièces mobiles, fixer les ancrages, tester les caps déjà utilisés, puis dériver des états de la simulation. Aucun timer, vitesse, direction, collision ou point d'émission ne peut être corrigé par la DA. Les futures réactions hit/mort devront suivre les événements et pools actuels. Aucun état animé, sheet ou intégration n'est produit dans ce lot.
