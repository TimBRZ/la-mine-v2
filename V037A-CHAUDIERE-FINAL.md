# Chaudière — master statique V0.37A

## Référence et respect de la version A

Référence exclusive : `Chaudière _ fiche concept art du boss.png`, **Version A — rouge Zone 6**. Le grand personnage de gauche est la source du dessin. La pose trois quarts, la cuve ronde, les proportions, le manomètre, le coude dorsal, la cheminée, les bras lourds et les appuis courts sont repris sans ajout de pièce ni changement de direction artistique.

L'image originale est conservée dans `v037a-chaudiere-final/references/version-A.png` ; son recadrage dans la galerie est uniquement réalisé en CSS. La planche complète reste consultable. Les empreintes de la référence et du master figurent dans `source.json`.

La **fumée dessinée sur la référence est exclue du master**, conformément à la demande explicite. Aucun halo ni flamme n'est embarqué. Cette suppression concerne les effets permanents, pas l'architecture de la machine. La fidélité du résultat simplifié reste soumise à validation humaine.

## Traitement graphique

Aplats nets et contours sombres, sans gradient, filtre, texture ou image bitmap dans le SVG. Suppression des petits boulons, rayures, reflets multiples et découpes décoratives. Les colliers, grandes articulations et tuyaux utiles restent lisibles. Le manomètre conserve un fond clair et une aiguille simple ; trois ouvertures chaudes identifient le foyer rond.

Palette de huit couleurs : `#101719` contour, `#393D3D` charbon, `#514E49` acier sombre, `#74736E` acier clair, `#D64428` rouge forge, `#F16B3A` rouge éclairé, `#FFAD32` chaleur contenue, `#FFE395` cadran et accents internes. Pas de cyan, pas de jaune dominant.

Cadre de dessin 625 × 525, `viewBox="25 325 625 525"`. Les réductions utilisent des cadres carrés de 40, 56 et 84 px sans déformation. Ce cadre de dessin ne modifie pas la taille en jeu.

## Parties stables et mobiles futures

**Stables :** cuve principale, cadre circulaire du foyer, colliers, bassin et structure dorsale. Ces masses définissent la silhouette de la version A.

**Mobiles plus tard :** bras, mains, jambes ; aiguille du manomètre, petits raccords et cheminée avec inertie très faible. Le foyer interne peut varier en intensité par changement d'aplat. Aucun piston ni appendice absent de la référence n'est inventé.

Le SVG comporte 21 groupes nommés pour repérer les pièces. Ce n'est pas un rig : une future animation devra compléter les surfaces cachées et conserver les jonctions entre bras, colliers et cuve. Recommandations : marche lourde, légère compression à la préparation, aiguille qui monte en pression, courte réaction lors de l'attaque, relâchement puis affaissement à la mort. Aucun de ces mouvements n'est produit ici.

## Gameplay inspecté, inchangé

`src/forge/config.js`, `actors.js` et `combat.js` restent la source de vérité. Identifiant `boiler`, 2 540 PV, rayon 30, vitesse de base 96, dégâts de contact 1. Le cadre actuel des boss Zone 6 est de 84 × 84.

Cycle normal : `steam → valves → general → rivets`. Sous 50 % : `steam → general → valves → steam → rivets`.

- `steam` : préparation 1,25 s, cinq projectiles en éventail, vitesse 133, angles espacés de 0,28 rad.
- `valves` : quatre lignes orthogonales annoncées, longueur prévue 115 bornée par l'arène, départ après 1,25 s puis décalages de 0,4 s ; durée active 0,4 s par ligne.
- `general` : préparation 1,3 s, trois plaques chauffées durant 2,2 s lorsque le système peut les réserver.
- `rivets` : préparation 1,1 s, trois projectiles à vitesse 165 ; sert aussi de solution légère lorsque certaines attaques majeures sont refusées par les plafonds.

Repositionnement à distance et latéral, règles de santé et de triple, délais, plafonds et zones sûres intégralement conservés. La vapeur, les impacts et la chaleur au sol sont des effets/hazards séparés. Le dessin ne crée ni attaque, ni sortie de projectile, ni zone de collision supplémentaire.

## Livrables et contrôle

Dans `v037a-chaudiere-final/` :

- `master/chaudiere.svg`, `silhouettes/chaudiere.svg`.
- `gallery.html`, `mobile.html`.
- `comparaisons/reductions.svg` : couleur et silhouette 40 / 56 / 84 px.
- `comparaisons/boss-zone6.html` : cohérence avec Maître de Four et Marteau-Pilon, copiés sans modification.
- `captures/mobile-320.jpg`, `captures/mobile-390.jpg`, galerie et comparaison.
- `tests.txt`, `scope-validation.json`, `browser-validation.json`, `before-hashes.json`, `source.json` : preuves.

Galerie : `http://127.0.0.1:5208/gallery.html`. Serveur statique local dédié : `node v037a-chaudiere-final/server.mjs`. Aucun serveur du jeu modifié.

Les contrôles navigateur portent sur 320 × 568 et 390 × 844, les images chargées, le débordement horizontal et la console. Ils ne constituent pas une validation physique Android ni une intégration en combat. À 40 px, le cadran et les fentes deviennent de petits accents ; la cuve, la cheminée et les bras conservent la priorité. La silhouette est volontairement sans fumée.

**1 059 / 1 059 tests réussis**, zéro échec et zéro ignoré. Empreintes de **3 997 fichiers existants** suivis : aucune modification ni suppression. Les cinq contrôles navigateur ne montrent ni débordement horizontal, ni image cassée ; aucune erreur ou alerte console constatée. Rapports détaillés dans le dossier. Aucun gameplay, hitbox, timing, comportement ou asset de production modifié. Aucun commit/push.

**Arrêt pour validation humaine du master statique.** Aucune animation, sprite sheet ou intégration en production.
