# La Mine V2 — V0.37A — Riveteur, master statique

## Proposition pour validation humaine

**Variante 3 légère / rapide uniquement.** La pose trois quarts reprend le deuxième personnage de la rangée principale de l'image fournie. Casquette basse, visière orange horizontale, masque bas, combinaison rouge forge, sac compact et riveteuse tenue à deux mains. Une seule pose, sans projectile, étincelle ni halo.

- [Galerie](v037a-riveteur-final/gallery.html)
- [Master SVG](v037a-riveteur-final/master/riveteur.svg) et [silhouette SVG](v037a-riveteur-final/silhouettes/riveteur.svg)
- [Réductions autonomes 40 / 48 / 56 / 84 px](v037a-riveteur-final/comparaisons/reductions.svg)
- [Chauffeur / Riveteur](v037a-riveteur-final/comparaisons/forges.html) et [comparaison héros / mobs](v037a-riveteur-final/comparaisons/famille.html)
- Captures [320 × 568](v037a-riveteur-final/captures/mobile-320.jpg) et [390 × 844](v037a-riveteur-final/captures/mobile-390.jpg)

Revue locale : `node v037a-riveteur-final/server.mjs`, puis http://127.0.0.1:5204/gallery.html. Serveur séparé, en boucle locale uniquement ; le serveur du jeu reste inchangé.

## Référence utilisée

`C:/Users/Tim Pro/Downloads/Fiche concept du Riveteur industriel.png`, copiée intacte dans `references/variante-3.png`. Empreinte et choix de vue dans `source.json`. Le recadrage du personnage est effectué à l'affichage par CSS ; la galerie propose également la planche originale complète.

Le SVG est autonome et vectoriel : aucun bitmap incorporé, filtre, dégradé ou texture. Il garde l'orientation vers la droite, l'outil presque horizontal légèrement incliné, les deux mains sur l'outil, les appuis et les grandes masses de la référence. Pas de nouvelle variante ni de vue alternative dessinée.

## Gameplay réel inspecté — inchangé

Sources : `src/forge/config.js`, `src/forge/actors.js`, `src/forge/combat.js`, `src/rift/combat.js` et le système de projectiles existant.

| Élément | Valeur / comportement actuel |
|---|---|
| Identifiant | `riveter`, Riveteur |
| PV / collision / vitesse | 76 PV, rayon 17, vitesse 88 |
| Dégâts | 0,5 au contact ; 0,5 par projectile |
| Positionnement | Distance recherchée 175–255 unités, repositionnement latéral |
| Attaque avant vague 11 | `rivet`, un projectile droit |
| Attaque à partir de vague 11 | `rivets`, trois projectiles émis simultanément |
| Angles de l'éventail | Centre et ±0,17 radian, soit environ ±9,74° |
| Télégraphe | 1,1 s |
| Projectile | Vitesse 165, portée 350, rayon 4 |
| Récupération | 1,1 s ; repositionnement après 0,18 s ; attente de positionnement suivante 0,5 s |

Les angles sont enregistrés au début de la préparation. Ils ne sont pas recalculés au départ des projectiles ; pas de homing ensuite. Les réservations du pool peuvent retarder une attaque : le dessin ne doit pas imposer une cadence différente.

La salve actuelle est **un éventail simultané**, pas une rafale temporelle de trois tirs. L'animation future devra représenter une impulsion unique pour cet éventail. Des reculs successifs ne seraient pertinents que si le gameplay changeait explicitement plus tard ; aucune modification de ce type n'est faite ici.

## Simplifications

- Casquette en trois masses : calotte charbon, bord orange, protection auditive simple. Suppression des coutures et rayures.
- Visière horizontale d'un seul tenant, claire au centre et contenue dans son cerclage. Pas d'yeux séparés ni de lumière extérieure.
- Protection basse du visage réduite à de grands pans, sans multitude de petits évents.
- Sac compact rectangulaire, deux bandes de maintien et une seule conduite. Aucun réservoir cylindrique ajouté.
- Riveteuse : corps rectangulaire, bloc avant rouge, nez métallique court et sortie sombre. Pas de crosse, viseur, chargeur de fusil ni canon long militaire.
- Deux mains distinctes ; vêtements réduits à quelques aplats, genouillères et appuis simples. Aucun micro-boulon ni accessoire flottant.

Les petits repères ocre sont secondaires : à 40 px, l'identité repose d'abord sur la casquette/visière, le sac et l'orientation de l'outil. Les détails qui s'effacent en réduction ne sont pas nécessaires pour reconnaître le mob.

## Palette

Même palette vectorielle que le Chauffeur :

| Rôle | Couleurs |
|---|---|
| Contour, creux | `#101719` |
| Charbon et acier sombre | `#393D3D`, `#514E49` |
| Acier clair | `#88796A` |
| Forge | `#BF4627`, `#E3652F` |
| Ombre rouille | `#873A26` |
| Accents / visière | `#F4AD32`, `#FFE092` |

Neuf aplats, aucun cyan dominant, aucun halo. La silhouette utilise uniquement `#F3EBD8` et reprend les contours/espaces négatifs du master.

## Différenciation et gabarit

**Chauffeur :** capuche haute, filtre rond, bonbonne et large diffuseur perforé. **Riveteur :** casquette basse à bord avancé, visière horizontale, bloc dorsal rectangulaire et outil plus allongé terminé par un petit nez de rivetage. Son torse, ses membres et sa tête sont plus fins. La distinction reste portée par les contours en monochrome.

Face au Lampiste, aucune grosse lampe ronde. Face au Boutefeu, aucune charge explosive ni détonateur. Face au héros, visage couvert et posture technique avec équipement dorsal compact.

Cadre de dessin : **340 × 450** transparent. Ce n'est ni une taille de texture production ni une nouvelle hitbox. Comparaisons dans des cadres 48 × 48 px pour les mobs et 46 × 52 pour le héros V0.33. Aucune augmentation de taille dans le jeu et aucune intégration.

## Préparation des animations futures

Groupes nommés dans le SVG, sans rig ni frames produits :

- **Stables :** `torse`, `casquette`, `bloc-dorsal` ; conserver leurs masses et proportions.
- **Mobiles futurs :** `jambe-proche`, `jambe-lointaine`, `bras-proche`, `bras-lointain`, `main-proche`, `main-lointaine`, `riveteuse`, `tete-protection`, `visiere`, `protection-auditive`, `conduite-principale`.

La tête et les protections doivent rester solidaires. Les deux mains doivent suivre la riveteuse ; prévoir des pivots aux prises lors du futur rig. Le câble pourra avoir une inertie très faible, sans devenir un appendice décoratif.

Intentions futures uniquement : idle respiré avec outil stable ; déplacement rapide et technique ; appuis verrouillés pendant le télégraphe ; impulsion et recul courts à l'émission réelle ; récupération rapide vers une posture mobile ; hit bref et chute/panne simple.

Opportunités VFX non produites : petite étincelle au départ, tracer métallique discret, impact sec, piston/culasse très court si lisible. Aucun flash permanent et aucun effet masquant le télégraphe. Le gameplay devra toujours commander les événements, indépendamment de la lecture des frames.

## Validation

- **1 059 / 1 059 tests existants réussis**, aucun échec, test ignoré ou test supprimé. [Rapport](v037a-riveteur-final/tests.txt).
- Réductions contrôlées **40 / 48 / 56 / 84 px**, couleur et silhouette.
- Contrôles navigateur **320 × 568** et **390 × 844** ; captures de la fiche mobile. Galerie, comparaison directe et comparaison de famille également contrôlées.
- Résultats DOM et console dans `v037a-riveteur-final/browser-validation.json` : aucune image cassée ni débordement horizontal, aucune erreur console finale.
- Empreintes des fichiers existants suivis avant/après : [rapport de périmètre](v037a-riveteur-final/scope-validation.json), aucune modification ni suppression. Le Chauffeur et les masters précédents restent intacts.
- Ces contrôles portent sur un master statique en navigateur PC aux formats mobiles, pas sur une intégration de combat ou un test Android physique.

## Arrêt

Seuls `v037a-riveteur-final/` et ce document sont créés. Aucun gameplay, projectile, timing, hitbox, vitesse ou asset de production modifié. Aucune sprite sheet, animation, intégration ou VFX. Aucun commit/push, aucune intervention CGWeb. Scorificateur et boss Zone 6 non commencés. **Arrêt pour validation humaine.**
