# Correctif visuel — origine des tirs du héros

## Diagnostic

`Weapon.discharge` crée chaque projectile à `joueur + direction × 16`. C'est une origine de collision volontaire, assez proche pour atteindre un ennemi au contact. Le rendu reprenait directement `pellet.x/y`, alors que le flash utilisait la bouche transformée de l'arme, décalée par la prise en main, le miroir et le recul. Ces deux points différaient particulièrement en vertical.

Mesure avant correction, Mitraillette vers le bas : bouche/flash **(240,25 ; 451,63)**, premier traceur **(225 ; 460,1667)**. Le trait se trouvait donc 15,25 unités trop à gauche. Les captures avant/après gardent le même scénario et la même simulation.

## Correction

- `src/hero-muzzle.js` calcule un socket de bouche depuis le sprite réellement affiché : coordonnées de canon existantes par arme, origine, dimensions, position locale, rotation et miroir du conteneur. Le recul est déjà inclus dans ce conteneur. Il n'y a aucune table de huit offsets indépendants.
- `src/room-scene.js` fait utiliser ce point unique par le flash et le premier rendu de chaque projectile, pour Mitraillette, Fusil et Grisou X.
- La naissance est mémorisée dans un petit état attaché à la **vue**, jamais dans la simulation. Un déplacement ou une nouvelle visée du héros ne tire pas les anciennes balles vers lui.
- L'identité de lancement est la référence `hitIds`, déjà renouvelée par `Projectiles.fire`. Cela distingue deux tirs utilisant le même emplacement du pool, même à angle et distance identiques. Ajouter une cible traversée à cette liste ne réinitialise pas la naissance.
- Le décalage visuel rejoint progressivement les coordonnées réelles sur les premières **64 unités parcourues**, ou davantage si un grand décalage de fallback l'exige (`max(64, 2 × décalage)`). Interpolation smoothstep, sans saut ni recul visuel. Après ce court raccord, le sprite suit exactement la position de simulation.

Le premier point affiché coïncide désormais exactement avec le flash : **(240,25 ; 451,63)** dans l'exemple. La position de simulation reste **(225 ; 460,1667)**. Le raccord visuel court n'est pas une nouvelle trajectoire de collision ; position, angle, vitesse, portée, dégâts, cadence, Focus, perks et événements restent inchangés.

Si une collision détruit un projectile pendant le raccord, il disparaît immédiatement selon la simulation ; aucune balle fictive ni prolongation n'est ajoutée. À très courte distance, le contact peut donc intervenir avant la fin du raccord. Les impacts restent aux événements réels existants.

## Fallbacks et stabilité

Les assets/animations validés et les resolvers VFX ne changent pas. Si le héros utilise son ancien rendu mais que l'arme moderne reste disponible, le socket est calculé avec l'origine réellement appliquée à cette arme. Pour l'ancien sprite d'arme, on prend son extrémité droite au milieu du canon. Pour l'arme procédurale, on utilise le bord droit de sa géométrie, transformé avec le conteneur.

Pas de correction gauche/droite spéciale à l'approche des verticales. Le miroir et la transition de grip validés restent ceux de l'arme. Les trois armes et la perforation utilisent la même fonction. Une structure réutilisée par vue (84 maximum), un point réutilisé pour le héros ; pas de sprite, asset ou timer supplémentaire. L'état est libéré à l'inactivité du projectile et réinitialisé à chaque réutilisation.

## Périmètre des fichiers

Production : `src/hero-muzzle.js` (ajout), `src/room-scene.js` (raccordement). Tous les autres fichiers `src` restent identiques octet pour octet, contrôlés contre `production-hero-muzzle-fix/notes/before-hashes.json`.

Tests : `tests/hero-muzzle.test.js` (15 nouveaux cas). Quatre listes historiques autorisent uniquement le nouveau helper (`v033-authorized-files.js`, `enemy-facing.test.js`, `shotgun-vfx-v038b1.test.js`, `smg-vfx-v038b2.test.js`). Le double Phaser de `weapon-grip-v033.test.js` expose désormais les propriétés publiques de transform réellement lues ; son contrôle de position garde une tolérance de 1e-9 contre l'arrondi des sommes flottantes. Aucune assertion gameplay supprimée, aucun snapshot supprimé.

Validation hors production : `production-hero-muzzle-fix/` contient le banc, une copie du renderer précédent, les captures et rapports. Aucun gameplay, asset, hitbox ou timing modifié. Aucun commit/push.

## Validation

Baseline : 1 284 tests réussis. Suite finale : **1 299 / 1 299 tests réussis**, aucun échec ni test ignoré (55,05 s). Résultat final et contrôles navigateur consignés dans `notes/validation.json`, `notes/tests.txt` et `notes/browser-checks.json`.

Tests ajoutés : trois armes × huit directions et recul ; même point flash/naissance ; variations d'origine/échelle ; fallbacks ; continuité autour des verticales ; héros déplacé après tir ; raccord sans retour arrière ; réutilisation immédiate du pool ; perforation ; rendus répétés sans temps écoulé ; simulations à pas variables strictement identiques avant/après pour les trois armes, incluant dégâts, cibles, Focus et éliminations.

Contrôles navigateur : 320×568 et 390×844, huit directions pour chaque arme, scènes réelles des six zones et matrice Mitraillette incluant groupes, boss et perforation. Les scènes ne sont pas des runs complets de vingt vagues. Les contrôles aux dimensions mobiles sur PC ne remplacent pas un essai Android physique.

Galerie : `production-hero-muzzle-fix/gallery.html`. Consultation locale : `http://127.0.0.1:5217/production-hero-muzzle-fix/gallery.html` (serveur `node production-hero-muzzle-fix/server.mjs`). Les pages avant/après n'écrivent aucune sauvegarde.

Arrêt après ce correctif ciblé.

