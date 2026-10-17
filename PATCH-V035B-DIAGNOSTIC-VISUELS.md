# V0.35B — Diagnostic des anciens skins

14 octobre 2026. Patch limité au choix et à l’application des visuels. Aucun master, sheet, gameplay, hitbox, délai, dégât, pattern, difficulté, sauvegarde ou serveur de production modifié. Aucun commit/push.

## Conclusion et niveau de preuve

**Foreuse autonome et Sondeur : cause reproduite, corrigée.** `enemy-animation.js` autorisait V034B seulement dans `galleries`, `tracks`, `shaft59`. L’adaptateur V035B, en `rift`, ne consultait que son propre catalogue. Or les vagues Zone 4 utilisent réellement `drill`, `surveyor` et `gasminer`. Les sheets V034B étaient chargées et enregistrées, mais le sélecteur retournait `null`. Le renderer gardait donc `combat-v020-drill` ou `surveyor`. Ce n’était ni une attente réseau, ni un problème de cadence, ni un cache Android. Le même défaut affectait le Mineur grisouteux partagé (`gasminer`). Un test historique imposait explicitement cet ancien comportement ; son assertion a été adaptée à la nouvelle demande.

**Éclateur : le symptôme physique n’est pas reproduit en fonctionnement normal.** Le retour humain précise Zone 4, dès l’apparition, alternativement ancien et nouveau visuel. Son catalogue est bien sélectionné avant patch. Avec des ressources valides, 300 apparitions / 90 000 mises à jour de sa vraie logique passent sans ancien visuel avant comme après patch dans l’audit Node. Chromium vérifie aussi 300 apparitions / 90 000 mises à jour après patch, sans ancien skin. On ne peut donc pas attribuer honnêtement cet incident Android à la même restriction de zone.

**Un deuxième défaut réel, transversal, est reproduit par injection d’une frame invalide.** Avant patch, une seule frame refusée faisait retourner `false` au renderer ; `updateEnemyView()` remettait l’ancien visuel puis exécutait `view.sheet=null`. Même une texture redevenue valide ne pouvait plus être utilisée par cette instance. L’injection d’une frame PREPARE invalide de l’Éclateur reproduit ce verrouillage. Après patch, la même injection utilise la frame neutre moderne et n’abandonne plus la sheet. C’est un défaut confirmé du fallback, **pas la preuve qu’une telle corruption s’est produite sur le téléphone**.

À la construction, l’ancien code créait aussi l’image avec la texture historique, avant de lui appliquer sa sheet lors de `updateEnemyView()`. Les deux opérations ont lieu dans le même `drawActors()`, avant le rendu Phaser : ce constat seul n’explique pas un flash visible. Le constructeur applique désormais immédiatement le visuel moderne pour que l’invariant soit vrai dès le spawn.

## Audit des trois entités

| Entité | Master validé | Sheet attendue | Texture key | Ancien fallback |
|---|---|---|---|---|
| Foreuse | `v034a-visual-enemies-bosses/concepts/drill.svg` | `src/assets/enemies-v034b/drill.svg` | `enemy-v034b-drill` | `combat-v020-drill`, sinon texture procédurale `drill` |
| Sondeur | `v034a-visual-enemies-bosses/concepts/surveyor.svg` | `src/assets/enemies-v034b/surveyor.svg` | `enemy-v034b-surveyor` | texture procédurale `surveyor` |
| Éclateur | `v035a-r8-correction-c0/master/eclateur-c0.svg` | `src/assets/enemies-v035b/burster.svg` | `enemy-v035b-burster` | texture procédurale `burster` |

Les clips sont des plages de frames pilotées par le renderer, pas des animations Phaser déclenchant le combat. Les définitions exactes, FPS, plages et empreintes sont dans [audit.json](production-v035b/visual-diagnostic/audit.json).

Les trois entités disposent de `idle`, `move`, `prepare`, `attack`, `recovery`, `hit`, `death`. Leurs phases de combat réelles sont `positioning`, `warning`, `recovery`, avec warmup à l’apparition et flash de hit. ATTACK est la lecture visuelle de la sortie de warning ; la mort appartient à la vue détachée. Foreuse : éventail/tir ; Sondeur : impact au sol ; Éclateur : rupture et bursts différés, tous inchangés.

| État / transition | Foreuse après | Sondeur après | Éclateur après |
|---|---|---|---|
| Spawn / warmup, idle | NEW SHEET | NEW SHEET | NEW SHEET |
| Déplacement / repositionnement | NEW SHEET | NEW SHEET | NEW SHEET |
| Warning → PREPARE | NEW SHEET | NEW SHEET | NEW SHEET |
| Sortie warning → ATTACK | NEW SHEET | NEW SHEET | NEW SHEET |
| Recovery / retour positioning | NEW SHEET | NEW SHEET | NEW SHEET |
| Hit / death | NEW SHEET | NEW SHEET | NEW SHEET |
| État inconnu ou clip absent | neutre moderne | neutre moderne | neutre moderne |
| Frame demandée manquante/invalide | neutre moderne | neutre moderne | neutre moderne |

Avant patch en Zone 4, Foreuse/Sondeur restent OLD dans toutes ces phases ; Éclateur reste NEW après sa première mise à jour si la sheet est valide. [Relevé Chromium avant](production-v035b/visual-diagnostic/browser-before.json) et [après](production-v035b/visual-diagnostic/browser-after.json). Le relevé « spawn » avant est pris immédiatement après le constructeur, pas après une frame présentée à l’écran.

## Corrections

- `src/enemy-animation.js` : sélection V034B par identité, indépendamment de la zone ; clip absent → repos moderne ; validation de frame commune.
- `src/rift-animation.js` : catalogue V035B puis V034B pour les entités partagées ; mêmes garanties de clip/frame ; temps de warning absent traité sans NaN.
- `src/enemies/view.js` : sheet appliquée dès la construction ; absence d’un id dans le set initial ne suffit plus à bannir une texture disponible ; fallback réversible sans effacer le candidat ; diagnostic local optionnel.
- Nouveau `src/enemy-visual-frame.js` : vérifie existence/source/dimensions, utilise la frame demandée si valide, sinon le repos moderne. Les métadonnées de la frame neutre peuvent être reconstruites depuis l’image source vérifiée. Aucun pixel redessiné.

Les nouveaux visuels sont partagés partout où l’identité existe. Cela n’introduit aucun ennemi dans une zone qui ne le contient pas et n’intègre aucun nouveau concept Zone 5/6.

**Fallback après patch :** texture absente, source réellement invalide (dimensions incohérentes), ou erreur réelle du gestionnaire de texture empêchant son utilisation. Une anomalie de clip ou de frame seule n’utilise plus l’ancien skin tant que la frame neutre peut être obtenue depuis la source moderne. Si la texture réapparaît, le renderer la reprend à la mise à jour suivante. La mort neutre conserve une fin et le nettoyage.

Chemin exact : `makeEnemyView()` conserve le candidat et la description historique ; `applyEnemyAnimation()` consulte `modernFrame()` ; seulement sur échec réel, `updateEnemyView()` restaure `view.legacy`. Les morts visuelles échouées sont nettoyées, sans toucher l’entité de simulation.

## Cache, chargement et hypothèses A–H

- **A / E : confirmé** pour Foreuse/Sondeur (sélection de renderer historique malgré une sheet chargée).
- **B : aucun état réel non mappé reproduisant le défaut** ; tous les états sont désormais couverts par la sheet ou son repos.
- **C : aucune course de chargement constatée** : Phaser termine preload avant create/register/spawn. Le patch permet néanmoins de reprendre une texture rétablie.
- **D : aucune collision de clé trouvée** : namespaces `enemy-v034b-*` et `enemy-v035b-*`, 23 clés distinctes.
- **F : cache non incriminé dans les essais locaux**. Le serveur existant envoie déjà `Cache-Control: no-store`, `image/svg+xml`, `nosniff`. Aucun Service Worker ni Cache Storage dans le code. Les chemins sont versionnés V034B/V035B et distincts des anciens assets. Les sheets n’ont pas changé dans ce patch.
- **G : confirmé sous panne injectée** : ancienne désactivation définitive de `view.sheet`, supprimée.
- **H : erreurs du loader/texture auparavant silencieuses côté choix de rendu** ; diagnostic local ajouté, sans logs normaux.

Le premier chargement utilise une nouvelle origine QA locale ; le reload normal réinitialise les textures Phaser. Le bouton QA Cache HTTP compare `default`, `force-cache`, `default` à nouveau, `reload` (chargement réseau forcé des ressources), `no-store`. **15 requêtes, 200 et une même empreinte par sheet**, sans ancien contenu. [Rapport cache](production-v035b/visual-diagnostic/browser-cache.json).

Cela teste le cache HTTP de Chromium et le rechargement forcé des ressources, **pas une purge du profil Android ni le raccourci natif hard-reload de toute la page Android**. Le profil du téléphone et ses requêtes lors de l’incident ne sont pas accessibles. Aucun cache désactivé davantage, aucune query version ajoutée sans nécessité, `server.mjs` inchangé. Les tests HTTP de la suite démarrent aussi le vrai serveur de production et vérifient MIME/octet/cache avec un User-Agent Android.

## Diagnostic Android optionnel

Ouvrir l’URL locale habituelle avec `?debug=1`, par exemple `http://IP_DU_PC:5177/?debug=1`. Les logs `[VISUAL]` indiquent `entity`, `state`, `texture`, `animation`, `fallback`, `fallback_reason` quand la sélection change. Aucune écriture de sauvegarde. Sans ce paramètre, ou sur une adresse publique, aucun log ajouté.

Raisons possibles : `missing_texture`, `invalid_source`, `texture_error`, `invalid_neutral_frames`. `neutral_modern_frame` indique une réparation visuelle moderne, **pas** un fallback historique. Un relevé de ces lignes sur Android, si l’Éclateur réapparaît ancien, permettra de distinguer l’identité exacte et une vraie indisponibilité ; il ne faut pas déduire la cause de sa seule couleur.

## Validation

- **975/975 tests**, dont les 923 existants et 52 dédiés. Les tests historiques sont conservés ; adaptations des assertions de zone et de panne pour la nouvelle règle, et exceptions de renderer strictement vérifiées par empreinte. Aucun garde-fou gameplay supprimé.
- 23 entités × 10 observations dans Chromium : **230/230 modernes** après patch, dont les transitions complètes demandées. Les tests automatisés couvrent aussi clips absents, sources invalides, réparation des métadonnées, récupération, huit directions et nettoyage de mort via les suites existantes.
- Fallback réel forcé sur les trois entités : ancienne texture quand la source est retirée ; nouvelle texture dès sa remise ; préparation corrompue → frame neutre moderne. [Preuve](production-v035b/visual-diagnostic/browser-fallback.json).
- Éclateur : 300 apparitions, 90 000 mises à jour après patch dans Chromium ; **zéro frame historique**. [Preuve](production-v035b/visual-diagnostic/browser-spawns.json).
- Captures inspectées aux dimensions exactes [320×568](production-v035b/visual-diagnostic/mobile-320.jpg) / [390×844](production-v035b/visual-diagnostic/mobile-390.jpg). [Dimensions](production-v035b/visual-diagnostic/mobile.json).
- Aucune erreur/alerte console sur la page finale. Le banc QA avait une collision de nom de méthode `cache` avec Phaser ; renommée avant validation finale. Les blocages réseau initiaux du bac à sable ont nécessité les lancements locaux autorisés. Aucun de ces incidents n’a modifié le serveur de jeu.

Artefacts dans `production-v035b/visual-diagnostic/` : snapshots, empreintes, audit reproductible (`node .../audit.mjs`), rapports, captures et logs de tests. Le banc `node production-v035b/visual-diagnostic/server.mjs` utilise seulement `127.0.0.1:5192` ; `?before=1` sélectionne les trois fichiers renderer sauvegardés avant patch, sans modifier les snapshots.

**Limite restante :** la cause précise de l’alternance constatée pour l’Éclateur sur le téléphone n’est pas établie. Les deux défauts reproduits sont corrigés et les contrôles locaux passent ; une confirmation Android reste nécessaire pour ce symptôme particulier.

Arrêt après ce patch. Aucune suite Zone 5, aucun commit/push.
