# V0.33 — Patch de tenue des armes

13 octobre 2026. Correction exclusivement visuelle, sans nouvelle version ni début de V0.34.

## Cause

`drawWeapon()` imposait à toutes les armes l'origine `(0, .45)`, sur le bord gauche de leur canevas 128². Ce point se trouvait loin de la poignée dessinée, particulièrement pour la poignée inférieure du Grisou X. La rotation faisait donc tourner la poignée autour du bord du sprite. La position du container restait au point logique du joueur, avec un simple décalage vertical de +3, alors que son gant avant est environ 12 unités sur le côté. En visée basse, le Grisou X descendait devant les jambes ; en visée haute il remontait devant le visage au lieu de rester tenu sur le côté.

Deux facteurs supplémentaires : le recul de l'arme déplaçait son container davantage que celui du héros ; une rotation vers la gauche retournait aussi le dessous de l'arme vers le haut, contrairement au miroir horizontal du corps.

## Correction retenue

Seulement deux fichiers de production modifiés :

- `src/weapon-visuals.js` : coordonnées de poignée et bouche propres à chaque arme, calcul pur de pose tenue.
- `src/room-scene.js` : ancrage effectif de l'image, position de tenue, miroir local, position du flash visuel.

Les six SVG V0.33 sont inchangés, ainsi que `hero-animation.js` et toutes les frames IDLE/RUN/SHOOT/HIT/DEATH. Aucune variante de pose n'a été nécessaire. Le héros conserve son origine `(.5, .62)`, ses dimensions 46 × 52 et son miroir existant (`cos(angle) < -.1`). Les armes conservent 34 × 34 / 32 × 32 / 34 × 34.

### Pivots exacts

Coordonnées dans le canevas source 128 × 128, origine coin supérieur gauche.

| Arme | Prise réelle choisie (px source) | Origine normalisée | Bouche visuelle (px source) |
|---|---|---|---|
| Fusil à pompe | **(24, 70)**, col de poignée/crosse | **(.1875, .546875)** | (124, 52) |
| Mitraillette | **(35, 72)**, poignée rouille | **(.2734375, .5625)** | (120, 55) |
| Grisou X | **(57, 81)**, poignée inférieure sous le cœur | **(.4453125, .6328125)** | (117, 57) |

Le catalogue d'apparence générique conserve ses origines historiques `.5/.45` pour compatibilité ; le renderer tenu utilise explicitement les coordonnées `grip`. Le pivot reste au même point dessiné pendant toute la rotation. À gauche, une réflexion locale Y du container autour de ce pivot préserve le dessous de l'arme et ne déplace pas la poignée. L'angle de visée reste exactement l'angle existant du joueur.

### Offsets et transitions

Le point tenu est relatif à la **position affichée du héros**, qui comprend déjà son recul visuel. En régime stable et sans recul supplémentaire :

| Direction | X relatif, côté droit | Y relatif |
|---|---:|---:|
| Haut vertical | +11,0 | −1,6 |
| Horizontal | +11,7 | −0,4 |
| Bas vertical | +11,0 | +0,8 |

À gauche, X est symétrique. Ces valeurs sont en unités de jeu, avant réduction à l'écran. Interpolation angulaire continue : `X = côté × (11.7 − .7 × abs(sin(angle)))`, `Y = −.4 + 1.2 × sin(angle)`. Aucun seuil haut/neutre/bas créant un saut à 35°. **Convention du moteur : Y descend, donc haut = angle négatif**, inverse des signes de l'exemple dans la demande.

Le passage d'une main de référence à l'autre lors du miroir borne le déplacement de l'ancrage horizontal à 90 unités/seconde et au plus 3 unités par image. L'angle du canon reste instantanément celui de la cible ; seul ce déplacement décoratif est adouci. Un grand changement de côté peut donc faire transiter brièvement l'arme devant le buste pendant que le corps conserve son miroir discret existant.

Le recul propre à l'arme est limité à `min(1, recoil × facteurVisuel × .12)` unité autour de la main ; le recul visuel commun au corps reste présent. Cela évite de créer un trou entre le gant et la poignée au moment du tir. Aucune modification du timer/recoil logique de l'arme.

Le **flash** suit maintenant la bouche transformée du sprite. Les projectiles physiques ET leurs vues restent à leurs positions habituelles : aucune modification de l'émission gameplay (16 unités depuis le joueur), trajectoire, vitesse, portée, cadence, dégâts, collision, hitbox ou ciblage. Les autres VFX restent inchangés.

Si l'ancien héros doit prendre le relais, la nouvelle arme reprend également l'origine/position de tenue historique ; si l'arme manque, le repli V0.33 existant reste disponible.

## Validation

**838/838 tests réussis** : les 832 existants et six tests supplémentaires, aucun test existant modifié ou supprimé. [Sortie finale complète](production-v033/weapon-grip-patch/all-tests-final.txt) · [Tests ciblés](production-v033/weapon-grip-patch/grip-tests.txt).

Les nouveaux tests vérifient :

1. Snapshot des 173 fichiers source avant patch : seuls les deux modules de rendu autorisés peuvent changer. Tous les sprites, animations et modules gameplay restent identiques octet pour octet.
2. Les trois pivots, leur proximité du gant et la position de bouche transformée dans huit directions, y compris avec recul fort.
3. Continuité autour des seuils ±35° et déplacement borné lors du changement de côté, à différents pas de rendu.
4. Appel du véritable `RoomScene.drawHero()` avec joueur, arme et pool de projectiles gelés : aucune mutation, application réelle des origines/mirrors et du flash ; repli vérifié avec la sheet indisponible.

Recette navigateur dédiée sur 5184, sans modifier le serveur normal 5177 ni sa sauvegarde. Elle appelle les vrais renderers avant/après et compose leurs images Phaser à la taille nominale du jeu. Marqueur discret = direction de cible. Matrice : **3 armes × 8 directions × 2 états de recul × 2 formats**, soit 96 poses de chaque version. Haut direct, haut-droite, droite, bas-droite, bas direct, haut-gauche, gauche, bas-gauche. Vérification supplémentaire en rotation continue du Grisou X.

Aucune erreur/warning console observée lors des poses et du contrôle de rotation. Le premier serveur lancé dans le sandbox était inaccessible au navigateur ; la validation finale a utilisé le serveur local autorisé hors sandbox. Aucun changement de pare-feu ou de réseau du jeu.

### Captures avant/après

Chaque planche contient **les trois armes** et toutes les directions demandées ; aucune image d'asset n'est retouchée après capture.

| Format / recul | Avant | Après |
|---|---|---|
| 390 × 844, sans recul | [avant](production-v033/weapon-grip-patch/captures/before-390.jpg) | [après](production-v033/weapon-grip-patch/captures/after-390.jpg) |
| 390 × 844, recul maximal | [avant](production-v033/weapon-grip-patch/captures/before-recoil-390.jpg) | [après](production-v033/weapon-grip-patch/captures/after-recoil-390.jpg) |
| 320 × 568, sans recul | [avant](production-v033/weapon-grip-patch/captures/before-320.jpg) | [après](production-v033/weapon-grip-patch/captures/after-320.jpg) |
| 320 × 568, recul maximal | [avant](production-v033/weapon-grip-patch/captures/before-recoil-320.jpg) | [après](production-v033/weapon-grip-patch/captures/after-recoil-320.jpg) |

Le Grisou X en visée basse reste près de la main sur le côté du héros, au lieu de descendre devant les pieds. En visée haute, le pivot reste près du gant ; le corps de l'arme pivote sur le côté. Aux diagonales et à gauche, le dessous de l'arme conserve une lecture cohérente. Les transitions d'offset restent de faible amplitude.

**Limites :** formats mobiles sous Chromium sur PC, pas de nouveau test sur téléphone physique dans cette étape. Les captures sont des poses contrôlées avec le renderer du jeu, pas des runs complètes. Le héros conserve sa pose trois-quarts et ses mains dessinées ; il ne s'agit pas d'un squelette à deux mains avec cinématique inverse. Une éventuelle retouche anatomique des poses reste hors de ce patch.

Le snapshot, la recette et ses captures sont conservés dans `production-v033/weapon-grip-patch/`. Les preuves V0.33 précédentes ne sont pas modifiées. Aucun commit/push. Arrêt, V0.34 non commencée.
