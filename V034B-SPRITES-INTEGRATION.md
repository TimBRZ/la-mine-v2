# La Mine V2 — V0.34B — Sprites et intégration

Date : 13 octobre 2026. Production limitée aux 17 entités validées des Zones 1–3. Aucun changement de gameplay, aucun commit/push. CGWeb, environnement, UI globale, économie, progression et sauvegarde non modifiés. Les masters et anciennes ressources sont conservés.

[Galerie animée avant / master / après](production-v034b/gallery.html) · [Résultats structurés](production-v034b/validation.json) · [Tests finaux](production-v034b/tests-final.txt).

## Architecture

- Une sheet SVG par entité, rasterisée une seule fois par le loader Phaser existant. Cellules transparentes 128 × 128, 6 colonnes, lecture gauche → droite puis haut → bas. Une texture partagée par toutes les instances d’une même entité ; pas de texture par frame ou ennemi.
- Les chemins des masters sont repris intégralement dans les définitions SVG ; seules les transformations des pièces changent. La première frame idle reste la pose du master. Les masters V034A.1 de Crachefer, Effondreur et Foreur de fond sont obligatoires dans le catalogue. Le générateur conserve les silhouettes, couleurs et équipement.
- Pivots, enveloppes de rendu, sens +X et modes de miroir restent ceux du catalogue validé. Aucun effet ne déplace le conteneur physique. Les translations de pièces ont lieu dans leur cellule.
- `src/enemy-animation.js` ne référence aucun module de simulation. Il lit position, phase, phaseTime, flash, pattern et axe existants. PREPARE suit la fraction du warning ; le passage réel hors warning déclenche le bref relâchement visuel. La charge garde sa durée réelle. Aucun tir, dégâts, random ou transition de simulation n’est programmé par une animation.
- Hit : flash chaud existant de 0,09 s et une pose courte ; priorité visuelle laissée à la préparation/charge. Aucun stun supplémentaire.
- Mort : vue détachée uniquement sur un événement kill, positionnée au point réel de mort. 4 frames / 11 FPS pour mobs ; 6 / 10 FPS pour boss. Créature affaissée, humains basculant lourdement, machines comprimées avec pièces retombantes. Disparition en moins de 0,65 s. Retraite du Wagon ≠ mort.
- Au maximum 12 vues de mort ; la plus ancienne est libérée à saturation. Nettoyage au changement de vague, nouvelle run et fermeture de scène. Aucune attente de fin d’animation pour kills, drops, récompenses ou progression.
- Pas de nouveau système de particules : impacts existants réutilisés. Corpses au depth 7, sous les télégraphes depth 8 ; projectiles hostiles depth 24. Aucun brouillard décoratif permanent.
- Chargement vérifié, dimensions et chaque rectangle de frame contrôlés. En cas de sheet absente/corrompue : asset V020 existant, ou texture procédurale pour le Puits 59. Une frame devenue invalide en cours de jeu restaure aussi texture, dimensions et origine d’avant.
- Activation limitée à galleries / tracks / shaft59. Les mobs partagés gardent leur ancien rendu dans les Zones 4–6.

## Inventaire

Poids SVG en Kio, hors compression HTTP ; les noms internes sont conservés.

| Entité | Sheet | Frames | Texture px | Kio | Taille jeu | Origine | Orientation |
|---|---|---:|---|---:|---|---|---|
| Rat de galerie | [rat.svg](src/assets/enemies-v034b/rat.svg) | 13 | 768 × 384 | 20.4 | 42 × 36 | 0,5 / 0.54 | travel |
| Mineur grisouteux | [miner.svg](src/assets/enemies-v034b/miner.svg) | 13 | 768 × 384 | 29.1 | 62 × 66 | 0,5 / 0.62 | flip |
| Foreuse autonome | [drill.svg](src/assets/enemies-v034b/drill.svg) | 21 | 768 × 512 | 25.6 | 58 × 50 | 0,5 / 0.52 | rotate |
| La Haveuse | [haveuse.svg](src/assets/enemies-v034b/haveuse.svg) | 24 | 768 × 512 | 30.3 | 88 × 88 | 0,5 / 0.5 | rotate |
| Le Crachefer | [crachefer.svg](src/assets/enemies-v034b/crachefer.svg) | 24 | 768 × 512 | 40.8 | 84 × 84 | 0,5 / 0.5 | rotate |
| L’Effondreur | [effondreur.svg](src/assets/enemies-v034b/effondreur.svg) | 24 | 768 × 512 | 39.2 | 86 × 86 | 0,5 / 0.5 | rotate |
| Wagon Fou | [wagon.svg](src/assets/enemies-v034b/wagon.svg) | 21 | 768 × 512 | 33.4 | 59 × 52 | 0,5 / 0.52 | rail |
| Draisine | [draisine.svg](src/assets/enemies-v034b/draisine.svg) | 21 | 768 × 512 | 31.1 | 58 × 53 | 0,5 / 0.52 | rotate |
| Le Chef de Gare | [stationmaster.svg](src/assets/enemies-v034b/stationmaster.svg) | 30 | 768 × 640 | 58.8 | 82 × 86 | 0,5 / 0.61 | flip |
| La Locomotive | [locomotive.svg](src/assets/enemies-v034b/locomotive.svg) | 30 | 768 × 640 | 33.1 | 88 × 88 | 0,5 / 0.5 | rotate |
| L’Aiguilleur | [switchman.svg](src/assets/enemies-v034b/switchman.svg) | 30 | 768 × 640 | 54.0 | 86 × 86 | 0,5 / 0.6 | flip |
| Foreur de fond | [deepdriller.svg](src/assets/enemies-v034b/deepdriller.svg) | 21 | 768 × 512 | 34.9 | 60 × 48 | 0,5 / 0.5 | rotate |
| Sondeur | [surveyor.svg](src/assets/enemies-v034b/surveyor.svg) | 21 | 768 × 512 | 36.6 | 44 × 52 | 0,5 / 0.5 | fixed |
| Grisouteux | [gasminer.svg](src/assets/enemies-v034b/gasminer.svg) | 21 | 768 × 512 | 43.2 | 42 × 50 | 0,5 / 0.5 | fixed |
| Le Cageur | [cager.svg](src/assets/enemies-v034b/cager.svg) | 30 | 768 × 640 | 36.5 | 84 × 84 | 0,5 / 0.5 | fixed |
| Le Compresseur | [compressor.svg](src/assets/enemies-v034b/compressor.svg) | 36 | 768 × 768 | 56.1 | 84 × 84 | 0,5 / 0.5 | fixed |
| Le Grisou | [firedamp.svg](src/assets/enemies-v034b/firedamp.svg) | 36 | 768 × 768 | 56.7 | 84 × 84 | 0,5 / 0.5 | fixed |

## États et cadences

Rat et Mineur n’ont pas d’attaque animée artificielle : leur contact reste inchangé. Le Sondeur effectue un impact au sol, pas un tir de projectile. Les variantes wagon, steam, vertical, cable, radial, pressure, gas et energy lisent les patterns déjà présents. Les autres attaques partagent une mécanique compatible ; leurs télégraphes conservent la distinction principale. Réduction des mouvements : frame fixe de l’état, dernière frame de mort, aucun timing du jeu changé.

### Rat de galerie

Petite menace rapide de contact ; poursuite et débordement selon la pression de la vague.

- **idle** : frames 0–1, 4 FPS ; boucle.
- **move** : frames 2–7, 14 FPS ; boucle.
- **hit** : frames 8–8, 18 FPS.
- **death** : frames 9–12, 11 FPS.

### Mineur grisouteux

Poursuite lente et robuste ; menace de contact, sans nouvelle attaque d’outil.

- **idle** : frames 0–1, 4 FPS ; boucle.
- **move** : frames 2–7, 8 FPS ; boucle.
- **hit** : frames 8–8, 18 FPS.
- **death** : frames 9–12, 11 FPS.

### Foreuse autonome

Machine à distance ; garde une distance moyenne, télégraphie et alterne projectile simple et éventail de trois tirs.

- **idle** : frames 0–1, 4 FPS ; boucle.
- **move** : frames 2–7, 8 FPS ; boucle.
- **prepare** : frames 8–10, progression du télégraphe réel.
- **attack** : frames 11–13, 12 FPS ; boucle.
- **recovery** : frames 14–15, 7 FPS.
- **hit** : frames 16–16, 18 FPS.
- **death** : frames 17–20, 11 FPS.

### La Haveuse

Boss de charge rectiligne. La direction est verrouillée durant le télégraphe ; pas de suivi pendant la charge.

- **idle** : frames 0–2, 4 FPS ; boucle.
- **move** : frames 3–8, 8 FPS ; boucle.
- **prepare** : frames 9–11, progression du télégraphe réel.
- **attack** : frames 12–14, 12 FPS ; boucle.
- **recovery** : frames 15–16, 7 FPS.
- **hit** : frames 17–17, 18 FPS.
- **death** : frames 18–23, 10 FPS.

### Le Crachefer

Boss à projectiles : alternance de tirs simples, éventails et cercles de six à huit projectiles selon les états existants.

- **idle** : frames 0–2, 4 FPS ; boucle.
- **move** : frames 3–8, 8 FPS ; boucle.
- **prepare** : frames 9–11, progression du télégraphe réel.
- **attack** : frames 12–14, 12 FPS ; boucle.
- **recovery** : frames 15–16, 7 FPS.
- **hit** : frames 17–17, 18 FPS.
- **death** : frames 18–23, 10 FPS.

### L’Effondreur

Contrôle de zone par deux éboulements télégraphiés près du joueur et le long de sa trajectoire ; ce n’est pas une attaque de marteau au corps à corps.

- **idle** : frames 0–2, 4 FPS ; boucle.
- **move** : frames 3–8, 8 FPS ; boucle.
- **prepare** : frames 9–11, progression du télégraphe réel.
- **attack** : frames 12–14, 12 FPS ; boucle.
- **recovery** : frames 15–16, 7 FPS.
- **hit** : frames 17–17, 18 FPS.
- **death** : frames 18–23, 10 FPS.

### Wagon Fou

Menace de ligne : rail horizontal choisi près du joueur, télégraphe 1,1 s, charge droite verrouillée, arrêt à l'autre bord.

- **idle** : frames 0–1, 4 FPS ; boucle.
- **move** : frames 2–7, 8 FPS ; boucle.
- **prepare** : frames 8–10, progression du télégraphe réel.
- **attack** : frames 11–13, 12 FPS ; boucle.
- **recovery** : frames 14–15, 7 FPS.
- **hit** : frames 16–16, 18 FPS.
- **death** : frames 17–20, 11 FPS.

### Draisine

Tireur mobile à distance160–205, repositionnement latéral et éventail de trois projectiles lents ±22°. Une seule émission remplace l'ancienne rafale de deux.

- **idle** : frames 0–1, 4 FPS ; boucle.
- **move** : frames 2–7, 8 FPS ; boucle.
- **prepare** : frames 8–10, progression du télégraphe réel.
- **attack** : frames 11–13, 12 FPS ; boucle.
- **recovery** : frames 14–15, 7 FPS.
- **hit** : frames 16–16, 18 FPS.
- **death** : frames 17–20, 11 FPS.

### Le Chef de Gare

Boss de charge ; invocation d'un Wagon toutes les trois attaques, repli charge si aucun rail sûr disponible.

- **idle** : frames 0–2, 4 FPS ; boucle.
- **move** : frames 3–8, 8 FPS ; boucle.
- **prepare** : frames 9–11, progression du télégraphe réel.
- **attack** : frames 12–14, 12 FPS ; boucle.
- **recovery** : frames 15–16, 7 FPS.
- **hit** : frames 17–17, 18 FPS.
- **death** : frames 18–23, 10 FPS.
- **prepare_wagon** : frames 24–26, progression du télégraphe réel.
- **attack_wagon** : frames 27–29, 12 FPS ; boucle.

### La Locomotive

Boss lourd alternant bélier verrouillé et poche de vapeur frontale. Machine lente entre attaques.

- **idle** : frames 0–2, 4 FPS ; boucle.
- **move** : frames 3–8, 8 FPS ; boucle.
- **prepare** : frames 9–11, progression du télégraphe réel.
- **attack** : frames 12–14, 12 FPS ; boucle.
- **recovery** : frames 15–16, 7 FPS.
- **hit** : frames 17–17, 18 FPS.
- **death** : frames 18–23, 10 FPS.
- **prepare_steam** : frames 24–26, progression du télégraphe réel.
- **attack_steam** : frames 27–29, 12 FPS ; boucle.

### L’Aiguilleur

Contrôle de zone : alternance rails horizontaux/verticaux, tirs simples/éventail/cercle. Croix rare sous50% en solo seulement ; un rail au triple et aucune croix finale.

- **idle** : frames 0–2, 4 FPS ; boucle.
- **move** : frames 3–8, 8 FPS ; boucle.
- **prepare** : frames 9–11, progression du télégraphe réel.
- **attack** : frames 12–14, 12 FPS ; boucle.
- **recovery** : frames 15–16, 7 FPS.
- **hit** : frames 17–17, 18 FPS.
- **death** : frames 18–23, 10 FPS.
- **prepare_vertical** : frames 24–26, progression du télégraphe réel.
- **attack_vertical** : frames 27–29, 12 FPS ; boucle.

### Foreur de fond

Approche lourde puis charge rectiligne. Préparation 1,3 s, ruée 320 u/s pendant 1,15 s, arrêt à la paroi. Aucun tir à distance.

- **idle** : frames 0–1, 4 FPS ; boucle.
- **move** : frames 2–7, 8 FPS ; boucle.
- **prepare** : frames 8–10, progression du télégraphe réel.
- **attack** : frames 11–13, 12 FPS ; boucle.
- **recovery** : frames 14–15, 7 FPS.
- **hit** : frames 16–16, 18 FPS.
- **death** : frames 17–20, 11 FPS.

### Sondeur

Machine de distance : reste vers 190–245 u du joueur, se replace latéralement et recule. Son attaque est une zone de sonde au sol à la position verrouillée du joueur, rayon 36, télégraphe 1,5 s puis danger 0,7 s. Ce n’est pas un lance-projectiles.

- **idle** : frames 0–1, 4 FPS ; boucle.
- **move** : frames 2–7, 8 FPS ; boucle.
- **prepare** : frames 8–10, progression du télégraphe réel.
- **attack** : frames 11–13, 12 FPS ; boucle.
- **recovery** : frames 14–15, 7 FPS.
- **hit** : frames 16–16, 18 FPS.
- **death** : frames 17–20, 11 FPS.

### Grisouteux

Poursuite rapide, puis explosion locale télégraphiée autour de lui à portée proche. Rayon de danger 62, warning 1,5 s, activité 0,7 s. L’attaque ne le tue pas : ce n’est pas un kamikaze.

- **idle** : frames 0–1, 4 FPS ; boucle.
- **move** : frames 2–7, 14 FPS ; boucle.
- **prepare** : frames 8–10, progression du télégraphe réel.
- **attack** : frames 11–13, 12 FPS ; boucle.
- **recovery** : frames 14–15, 7 FPS.
- **hit** : frames 16–16, 18 FPS.
- **death** : frames 17–20, 11 FPS.

### Le Cageur

Boss vague 5 et triple final. Alterne charge verrouillée, impact devant lui et câble vertical au sol. Charge 275 u/s sur 0,55 s ; impact à 85 u devant, rayon 36 ; câble de 180 u sur demi-largeur 14.

- **idle** : frames 0–2, 4 FPS ; boucle.
- **move** : frames 3–8, 8 FPS ; boucle.
- **prepare** : frames 9–11, progression du télégraphe réel.
- **attack** : frames 12–14, 12 FPS ; boucle.
- **recovery** : frames 15–16, 7 FPS.
- **hit** : frames 17–17, 18 FPS.
- **death** : frames 18–23, 10 FPS.
- **prepare_cable** : frames 24–26, progression du télégraphe réel.
- **attack_cable** : frames 27–29, 12 FPS ; boucle.

### Le Compresseur

Boss vague 10 et triple final. Alterne vapeur en éventail, cercle de projectiles et pression au sol. Cercle 6 projectiles, parfois 8 sous 50 % hors final ; pression rayon 52 pendant 1,4 s après préparation.

- **idle** : frames 0–2, 4 FPS ; boucle.
- **move** : frames 3–8, 8 FPS ; boucle.
- **prepare** : frames 9–11, progression du télégraphe réel.
- **attack** : frames 12–14, 12 FPS ; boucle.
- **recovery** : frames 15–16, 7 FPS.
- **hit** : frames 17–17, 18 FPS.
- **death** : frames 18–23, 10 FPS.
- **prepare_radial** : frames 24–26, progression du télégraphe réel.
- **attack_radial** : frames 27–29, 12 FPS ; boucle.
- **prepare_pressure** : frames 30–32, progression du télégraphe réel.
- **attack_pressure** : frames 33–35, 12 FPS ; boucle.

### Le Grisou

Boss vague 15 et triple final. Alterne poches de gaz autour de la position joueur, explosion locale et projectile énergie simple. Deux poches hors final, une en final ; pas de cercle propre à ce boss dans le code actuel.

- **idle** : frames 0–2, 4 FPS ; boucle.
- **move** : frames 3–8, 8 FPS ; boucle.
- **prepare** : frames 9–11, progression du télégraphe réel.
- **attack** : frames 12–14, 12 FPS ; boucle.
- **recovery** : frames 15–16, 7 FPS.
- **hit** : frames 17–17, 18 FPS.
- **death** : frames 18–23, 10 FPS.
- **prepare_gas** : frames 24–26, progression du télégraphe réel.
- **attack_gas** : frames 27–29, 12 FPS ; boucle.
- **prepare_energy** : frames 30–32, progression du télégraphe réel.
- **attack_energy** : frames 33–35, 12 FPS ; boucle.

## Validation progressive

| Lot | Entités | Validation avant le suivant |
|---|---|---|
| A | Rat, Mineur, Foreuse | 838 existants + 14 nouveaux isolés ; captures et combat, orientations |
| B | Haveuse, Crachefer, Effondreur | 855 / 855 ; captures 320/390 |
| C | Wagon, Draisine | 857 / 857 ; avant/arrière, charge et télégraphe |
| D | Chef de Gare, Locomotive, Aiguilleur | 860 / 860 ; rotation / miroirs, familles d’attaque |
| E | Foreur, Sondeur, Grisouteux | 863 / 863 ; poses et caps 320/390 |
| F | Cageur, Compresseur, Grisou | 866 / 866 ; captures des états et formats mobiles |

Les logs lot-A à lot-F sont conservés dans production-v034b. Après les lots : optimisation SVG sans perte des chemins, amplitude de marche rendue visible en petit format, rayons de roues non symétriques d’une frame à l’autre, nettoyage de mort à la fermeture. Les captures de lot constituent le journal intermédiaire ; la galerie et les triples montrent les ressources finales.

Les 838 tests sont conservés. Trois fichiers de garde historiques ont reçu uniquement la liste explicite des nouveaux fichiers de présentation / du renderer autorisé : v033-authorized-files.js, visual-integration-v033.test.js et weapon-grip-v033.test.js. Une nouvelle garde V034B contrôle tous les autres fichiers de la photographie initiale, y compris les tests, masters et snapshots. Aucun test n’est supprimé ou désactivé. Les 28 nouveaux tests couvrent le manifeste, chemins approuvés, frames, absence/corruption de texture, 8 caps, immutabilité, scopes de zones, préparation, morts bornées et replays exacts.

## Runs complètes dans le navigateur

Banc local séparé, Phaser réel, viewport 320 × 568. Six parcours de la vague 1 à la victoire, avec le pilote de mouvement déjà utilisé par les tests V024. Atelier niveau 2, seed 1, perks uniquement tirés et choisis par UpgradeFlow ; aucun changement de HP, dégâts, cadence, invulnérabilité, ennemis ou vitesse de simulation par tick. Exécution accélérée par paquets de ticks 1/60 ; chaque tick passe par le renderer. Aucun profil ou résultat envoyé à CGWeb ; banc isolé avec écriture de récompense et leaderboard neutralisée.

| Zone | Arme | Résultat | PV finaux | Kills | Tirs | Ticks | CPU P95 avant / après, ms |
|---|---|---|---:|---:|---:|---:|---:|
| galleries | shotgun | 20 / victoire | 5.5 | 235 | 510 | 26831 | 0.50 / 0.70 |
| galleries | smg | 20 / victoire | 2.5 | 235 | 2926 | 29631 | 0.70 / 0.70 |
| tracks | shotgun | 20 / victoire | 5.5 | 277 | 913 | 40339 | 0.50 / 0.60 |
| tracks | smg | 20 / victoire | 5.5 | 277 | 4778 | 42898 | 0.60 / 0.60 |
| shaft59 | shotgun | 20 / victoire | 5.5 | 284 | 871 | 40460 | 0.90 / 0.90 |
| shaft59 | smg | 20 / victoire | 4.5 | 284 | 5526 | 51510 | 0.80 / 0.80 |

Les mêmes six runs avec RoomScene issu de la sauvegarde avant V034B donnent exactement les mêmes ticks, PV, kills, tirs, ennemis rencontrés et patterns. Tous les 17 types sont rencontrés, ainsi que les quatre rencontres de boss par zone dont les triples finaux. Les JSON avant/après sont conservés. Console normale : aucune erreur ni avertissement observé.

Fallback navigateur : les 17 requêtes de nouvelles sheets sont volontairement refusées sur ?missing=1 ; 12 secondes de combat passent, 12 kills, arrivée en vague 2 et anciens assets visibles. Aucune exception JavaScript ; fichiers browser-fallback*.json et capture conservés.

## Poids et performance

- Anciennes ressources SVG ennemis réellement chargées : 11 fichiers, 40570 octets, plus les textures procédurales existantes. Toutes sont conservées comme fallback.
- Ajout V034B : 17 SVG, **675769 octets (659.9 Kio)**, 416 frames ; aucune dépendance nouvelle. Les définitions de pièces sont partagées dans chaque sheet.
- Texture maximale : 768 × 768. RGBA estimé pour les nouvelles textures : **27.75 Mio** supplémentaires. Ce chiffre exclut copies de rasterisation navigateur, pilotes GPU, anciennes textures, héros et arène ; ce n’est pas une mesure de RAM Android.
- Jusqu’à 12 ennemis vivants et 4 morts visuelles simultanées observés dans ces replays ; plafond de morts testé à 12. Pas de pools de gameplay agrandis.
- CPU P95 d’un tick scène sur le PC : environ 0,5–0,9 ms avant et 0,6–0,9 ms après dans ces parcours. Les lots tournent dans un navigateur desktop redimensionné, pas sur un téléphone physique. Ces mesures excluent présentation GPU et ne constituent pas une garantie FPS Android.
- Les deux formats 320 × 568 et 390 × 844 ont été contrôlés visuellement. Vérification matérielle Android à effectuer sur le téléphone du joueur, notamment mémoire et chauffe lors d’une longue session.

## Collisions et limites visuelles

Les orientations fixes du Sondeur, Grisouteux et des boss du Puits 59 restent fixes, conformément au rendu préexistant. La direction réelle des attaques vient toujours des télégraphes et projectiles ; aucune rotation nouvelle de ces corps n’est introduite. Les détails internes sont volontairement secondaires aux lignes / zones de danger. Les animations sont un premier passage de production à partir de pièces SVG, sans dessin de directions supplémentaires.

- **Rat de galerie** : Conserver 42 × 36 et r10. Queue et museau dépassent nécessairement le disque de contact comme dans le dessin existant ; ils ne doivent pas devenir des signes de dégâts séparés. Aucun agrandissement proposé.
- **Mineur grisouteux** : Même enveloppe 62 × 66, r20 et origine .62. L’outil et les gants restent périphériques comme l’actuel ; vérifier une future pose de marche pour ne pas allonger la portée visuelle.
- **Foreuse autonome** : 58 × 50 conservé, r16. Le nez demeure décoratif hors centre ; ne pas l’utiliser pour décaler l’origine gameplay. Vue proche du dessus compatible avec rotation continue.
- **La Haveuse** : 88 × 88 conservé, r30. Le volume extérieur de coupe reste dans le gabarit historique ; dents au bord de l’image sans agrandissement de hitbox. Vérifier les huit rotations avant animation.
- **Le Crachefer** : Même84×84 et r28. La soupape et les appuis sont des accessoires contenus dans le cadre, sans nouveaux volumes de collision.
- **L’Effondreur** : Cadre86×86, origine .5/.5 et r28 conservés. La gueule est un volume interne dangereux de la machine, toujours dans le disque collisionnel ; aucune zone praticable n'est ajoutée.
- **Wagon Fou** : Gabarit 59×52 conservé, rayon 18 inchangé. Caisse, roues et pare-chocs débordent naturellement le cercle ; ne pas agrandir la collision pour suivre le contour. Le nez termine à x124 dans le canevas128, contour compris sans rognage.
- **Draisine** : Gabarit58×53 et rayon17 conservés. Tube/arceau sont des appendices graphiques, aucune zone de collision ajoutée. Vue quasi zénithale nécessaire sur tous les caps, contrairement au Wagon de profil.
- **Le Chef de Gare** : 82×86 et rayon26 conservés. Palette haute et manche sont visuels ; conserver le couloir de charge calculé avec rayon26. Aucun élargissement du bélier gameplay.
- **La Locomotive** : 88×88 et rayon32 conservés. Chasse-pierre et soupapes peuvent sortir du cercle32 sans agrandir ni charge ni vapeur ; comparaison du cercle nécessaire avant intégration future.
- **L’Aiguilleur** : 86×86 et rayon27 conservés. Leviers/grips sont graphiques, ne doivent pas être lus comme des projectiles. Le trait haut reste à x20 et y6 dans le canevas, sans dépassement.
- **Foreur de fond** : Même60×48 et r20 ; les patins restent dans le canevas128. Les vides sous les bras ne sont pas des couloirs jouables et les patins n'ajoutent aucune hitbox.
- **Sondeur** : Même 44×52 et rayon 16. Les espaces entre jambes sont des espaces visuels, pas des trous de collision. Pieds décoratifs en bas du canevas : conserver ombre et pivot d’origine lors de la future animation.
- **Grisouteux** : Même 42×50 et rayon 15. Cuve et flexible dépassent le disque : parties décoratives, sans augmentation de portée ni de collision. Aucun nuage permanent n’élargit artificiellement la présence.
- **Le Cageur** : Même 84×84 et rayon 29. Butoirs/patins occupent les bords du canevas et dépassent le disque physique. L’ancien rendu face fixe ne raconte pas tous les caps de charge : risque à traiter par poses ou élément orienté de rendu, jamais par changement de hitbox.
- **Le Compresseur** : Même 84×84 et rayon 31. Coude haut déporté dépasse le disque de collision : décor mécanique sans dégâts additionnels. Vérifier la cohabitation des trois boss et dangers au sol dans le lot d’intégration.
- **Le Grisou** : Même 84×84 et rayon 29. La coque est plus large visuellement que le disque, déjà le cas de l’ancien carré 84² ; les trois étriers sont décoratifs. Préserver zones sûres et visibilité des hazards lors de la future mort.

## Fichiers et reproduction

Production : src/enemy-animation.js, src/enemy-sprite-catalog.js, src/assets/enemies-v034b/*.svg ; intégration ciblée dans src/enemies/view.js et src/room-scene.js. Aucun autre module de production modifié. Les libellés de version de l’UI et package.json restent inchangés dans ce chantier de sprites.

Outils hors production : production-v034b/generate.mjs, make-gallery.mjs, report.mjs, server.mjs et browser-qa.js. Snapshot complet des anciennes sources dans production-v034b/before ; empreintes dans before-hashes.json. Les petits scripts *qa.mjs documentent la construction progressive du banc, ils ne sont pas chargés par le jeu.

Depuis le dossier du projet :

```powershell
node production-v034b/generate.mjs F
node production-v034b/make-gallery.mjs
npm.cmd test
node production-v034b/server.mjs
```

Banc : http://127.0.0.1:5186/ ; galerie : http://127.0.0.1:5186/production-v034b/gallery.html. Serveur de revue local en lecture seule, distinct du serveur habituel 5177. La galerie HTML s’ouvre également depuis le disque. Aucun outil QA ajouté au menu joueur.

## Captures

- [A-attack-390.jpg](production-v034b/captures/A-attack-390.jpg)
- [A-combat-390.jpg](production-v034b/captures/A-combat-390.jpg)
- [A-death-390.jpg](production-v034b/captures/A-death-390.jpg)
- [A-left-320.jpg](production-v034b/captures/A-left-320.jpg)
- [A-move-320.jpg](production-v034b/captures/A-move-320.jpg)
- [A-prepare-390.jpg](production-v034b/captures/A-prepare-390.jpg)
- [B-attack-390.jpg](production-v034b/captures/B-attack-390.jpg)
- [B-death-390.jpg](production-v034b/captures/B-death-390.jpg)
- [B-diagonal-320.jpg](production-v034b/captures/B-diagonal-320.jpg)
- [B-move-390.jpg](production-v034b/captures/B-move-390.jpg)
- [B-prepare-390.jpg](production-v034b/captures/B-prepare-390.jpg)
- [C-attack-390.jpg](production-v034b/captures/C-attack-390.jpg)
- [C-death-390.jpg](production-v034b/captures/C-death-390.jpg)
- [C-left-320.jpg](production-v034b/captures/C-left-320.jpg)
- [C-move-390.jpg](production-v034b/captures/C-move-390.jpg)
- [C-prepare-390.jpg](production-v034b/captures/C-prepare-390.jpg)
- [D-attack-390.jpg](production-v034b/captures/D-attack-390.jpg)
- [D-death-390.jpg](production-v034b/captures/D-death-390.jpg)
- [D-left-320.jpg](production-v034b/captures/D-left-320.jpg)
- [D-move-390.jpg](production-v034b/captures/D-move-390.jpg)
- [D-prepare-390.jpg](production-v034b/captures/D-prepare-390.jpg)
- [E-attack-390.jpg](production-v034b/captures/E-attack-390.jpg)
- [E-death-390.jpg](production-v034b/captures/E-death-390.jpg)
- [E-diagonal-320.jpg](production-v034b/captures/E-diagonal-320.jpg)
- [E-move-390.jpg](production-v034b/captures/E-move-390.jpg)
- [E-prepare-390.jpg](production-v034b/captures/E-prepare-390.jpg)
- [F-attack-390.jpg](production-v034b/captures/F-attack-390.jpg)
- [F-death-390.jpg](production-v034b/captures/F-death-390.jpg)
- [F-move-320.jpg](production-v034b/captures/F-move-320.jpg)
- [F-move-390.jpg](production-v034b/captures/F-move-390.jpg)
- [F-prepare-390.jpg](production-v034b/captures/F-prepare-390.jpg)
- [fallback-320.jpg](production-v034b/captures/fallback-320.jpg)
- [gallery-before-after.jpg](production-v034b/captures/gallery-before-after.jpg)
- [gallery-mobile-320.jpg](production-v034b/captures/gallery-mobile-320.jpg)
- [triple-galleries-390.jpg](production-v034b/captures/triple-galleries-390.jpg)
- [triple-shaft59-320.jpg](production-v034b/captures/triple-shaft59-320.jpg)
- [triple-shaft59-390.jpg](production-v034b/captures/triple-shaft59-390.jpg)
- [triple-tracks-320.jpg](production-v034b/captures/triple-tracks-320.jpg)
- [triple-tracks-390.jpg](production-v034b/captures/triple-tracks-390.jpg)

Arrêt après V034B. Aucun chantier visuel Zones 4–6 ni environnement commencé.
