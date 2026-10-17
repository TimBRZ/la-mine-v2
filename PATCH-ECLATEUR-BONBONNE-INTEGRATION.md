# Patch Éclateur — intégration de la bonbonne validée

## Résultat

Le rendu de l’Éclateur (`burster`) utilise désormais exclusivement la bonbonne validée. Le master `v035a-eclateur-bonbonne-final/master/eclateur-bonbonne.svg` est inchangé. Les formes, l’orientation et les proportions sont conservées ; les mouvements restent internes à son cadre visuel de 48×48.

Seuls deux fichiers de production préexistants sont modifiés : `src/rift-sprite-catalog.js` (entrée Éclateur uniquement) et `src/burster-visual.js` (source et clés importées). Le sélecteur d’états, le rendu général, la logique de l’Éclateur et les cinq autres entités V0.35B ne sont pas modifiés.

## Ressources et budget

- Nouvelle sheet : `src/assets/enemies-v035b/burster-bonbonne-v1.svg`.
- Données embarquées et secours : `src/burster-bonbonne-art-v1.js`.
- Clé : `enemy-burster-bonbonne-v1-0f6a3bcc` ; secours : même clé suffixée `-idle`.
- SHA-256 : `0f6a3bccd5ee02f2c87368e1c7c1aaecbd0c00e43cc902f4bcb0f0f148ce1dbb`.
- **20 frames**, cellules **64×64**, sheet **384×256**.
- Poids SVG : **76 116 octets** ; secours SVG : **15 952 octets** ; module JavaScript embarquant les deux : **100 131 octets** (hors compression HTTP).
- Texture principale : **393 216 octets RGBA (384 Kio)** ; secours 64×64 : **16 384 octets (16 Kio)** ; total **400 Kio**. Budget texture identique au patch précédent, aucune texture supplémentaire pour un autre ennemi.

Les anciennes ressources `src/assets/enemies-v035b/burster.svg` et `src/burster-final-art-66fe46f1.js` sont conservées intactes comme historique. Elles ne sont pas un secours runtime. Le générateur dédié n’exécute pas l’ancien générateur global V0.35B et ne régénère pas les cinq autres sheets.

## Mapping visuel

| État lu | Frames | Rendu |
| --- | --- | --- |
| Idle | 0 | Pose exacte du master, jauge et voyant calmes |
| Move | 1–3 | Petits déplacements des marques de roues, vibration et tuyau discrets |
| Prepare / pressure | 4–8 | Cinq paliers indexés sur la progression du télégraphe réel ; aiguille jusqu’à +24°, voyant modulé, vibration croissante |
| Attack | 9–11 | Réaction maximale pendant la fenêtre visuelle existante de 0,25 s, sans effet de dégâts |
| Recovery | 12–13 | Retour de la jauge au calme, selon l’état existant |
| Hit | 14–15 | Petite vibration ; la teinte d’impact existante reste gérée par le renderer |
| Death | 16–19 | Affaissement léger du corps, retour d’aiguille, extinction des témoins puis cleanup |

Les cellules, le pivot central, la base et l’orientation restent fixes. La vibration du corps atteint environ 0,41 pixel monde ; celle du tuyau, combinée, reste inférieure à 0,6 pixel monde. La base est identique, sans transformation, dans les 20 frames. À la mort, seul le haut s’affaisse de 6,5 % autour de l’appui ; le châssis reste en place.

La galerie boucle artificiellement les démonstrations. En jeu, la préparation suit `phaseTime` et les fins d’états réelles. Une admission d’attaque retardée garde une frame de préparation, sans déclencher de tir depuis l’animation.

## Gameplay et mort préservés

Le mob conserve notamment 68 PV, un rayon de collision de 19, une vitesse de base de 48, l’accélération de proximité existante, le télégraphe `blast` de 1,25 s et la zone d’explosion de 0,5 s. Les vagues restent intactes.

Le code prévoit une salve post-mort après son avertissement de 1,1 s. Le patch ne la remplace pas par une seconde grosse explosion animée. Le cadavre visuel s’affaisse et disparaît en environ 0,4 s, comme le cleanup visuel précédent ; l’avertissement et la salve restent indépendants et continuent sans sprite. Aucun callback d’animation n’écrit dans l’acteur, ne crée un projectile ou ne déclenche des dégâts.

## Fallback et cache

Les garde-fous du patch précédent sont conservés : vérification de provenance de la texture et de sa source d’atlas, réparation vers la frame neutre si possible, puis secours statique issu de la nouvelle sheet. Si les deux sources modernes sont absentes ou invalides, le sprite est masqué. L’ancien véhicule ne peut pas être choisi par le chemin de rendu corrigé, même s’il existe encore dans le dépôt.

La sheet est embarquée depuis ses octets approuvés dans un nouveau module, sous une nouvelle clé portant une empreinte. Le chargement normal n’utilise pas l’ancienne URL SVG. Le fichier SVG versionné reste disponible pour l’inspection et les tests de cache. Le serveur de production n’a pas été modifié ; son comportement `no-store` est conservé.

Un onglet déjà ouvert avec l’ancien code doit être rechargé. Le patch ne modifie ni ne vide le stockage de progression.

## Validation

- **995/995 tests réussis**, 985 antérieurs conservés et 10 nouveaux ; zéro échec, zéro ignoré. Durée de la dernière suite complète : 65,91 s. Journal `production-eclateur-bonbonne/tests.txt`.
- Les tests historiques de fichiers immuables sont adaptés uniquement à cette modification visuelle autorisée : empreintes du patch épinglées et comparaison avec la copie précédente. Ils continuent de protéger tous les fichiers gameplay, les anciens assets et les autres entités.
- Nouveau test différentiel avec/sans ticks visuels : mêmes acteurs, zones de dégâts, salve post-mort et rayon de collision.
- **300 apparitions dans Phaser, 90 000 mises à jour**, zéro ancien skin ; états observés : déplacement, préparation, attaque, récupération.
- **230 observations d’états sur 23 entités**, aucune texture incorrecte.
- Mort : frames 16–19 puis container détruit, aucun cadavre restant.
- Secours comparé à la frame 0 dans Phaser : **0 différence sur 16 384 octets RGBA**.
- Texture étrangère injectée sous la bonne clé : refusée, bonbonne statique affichée. Absence des deux ressources : sprite masqué.
- Cache normal, forcé, reload et no-store : même empreinte de la nouvelle sheet, HTTP 200, MIME `image/svg+xml`. Rechargement de page : nouvelle clé bonbonne conservée.
- Phaser contrôlé en **320×568** et **390×844**, sans débordement ni erreur console. Captures dans `production-eclateur-bonbonne/captures/`.

Les preuves sont dans `browser-evidence.json`, `browser-final.json`, `manifest.json` et `scope-validation.json`. Le banc de validation utilise les modules Phaser réels avec une fixture locale contrôlée ; il ne constitue pas une run complète ni une mesure de performance sur GPU Android.

## Limites et validation humaine

La jauge et le voyant restent identifiables à taille mobile ; le mouvement de l’aiguille est volontairement subtil. La lettre GRISOU et les graduations ne doivent pas porter seules le danger : le télégraphe existant reste prioritaire.

**Validation Android physique confirmée par le joueur après rechargement : « Bonbonne visible, aucun ancien skin ».** Les captures et essais instrumentés ont été réalisés dans Chromium ; ce retour humain complète leur vérification visuelle, sans constituer une mesure instrumentée des performances Android. En cas de perte des deux ressources modernes, l’absence de sprite est le comportement volontaire, plutôt qu’un retour à l’ancien véhicule.

## Livrables et arrêt

- [Galerie](production-eclateur-bonbonne/gallery.html) : master, ancien rendu, sheet, 20 frames, animations, taille jeu et captures.
- [Sheet de production](src/assets/enemies-v035b/burster-bonbonne-v1.svg).
- [Capture 320×568](production-eclateur-bonbonne/captures/mobile-320.jpg) ; [390×844](production-eclateur-bonbonne/captures/mobile-390.jpg).
- Générateurs dédiés et copies des fichiers précédents dans `production-eclateur-bonbonne/`.

Aucune modification d’un autre mob/boss, de gameplay, hitbox, timing, dégât, vitesse, sauvegarde, composition des vagues ou master validé. Aucun accès à CGWeb. Aucun commit/push. **Arrêt après ce patch ; aucun chantier Zone 5.**
