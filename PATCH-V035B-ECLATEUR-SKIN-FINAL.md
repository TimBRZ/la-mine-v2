# Éclateur — verrouillage du skin final V0.35B

Validation du 14 octobre 2026. Correctif exclusivement visuel, sans commit ni push.

## Cause démontrée

Le patch précédent conservait un chemin de secours vers la texture procédurale historique `burster`. Si la feuille moderne était absente ou rejetée, `src/enemies/view.js` réaffichait ce dessin ancien, qui ne représente pas la machine validée. Ce défaut est reproduit dans Phaser avec le code précédent : texture finale retirée, texture `burster` visible. Preuve : `production-v035b/burster-final-lock/before-missing.json` et `before-missing.jpg`.

Autre faiblesse corrigée : les dimensions d'une texture ne prouvent pas son identité. Une image étrangère de mêmes dimensions, placée sous la bonne clé, pouvait passer ce contrôle. Le contrôle des frames ne garantissait pas non plus l'identité de leur source d'atlas.

La capture Android évoquée n'était pas jointe à cette demande. Le déclencheur exact sur ce téléphone (chargement, cache ou autre incident) n'est donc pas établi. Le chemin fautif dans le rendu est, lui, reproduit et corrigé.

## Sélection et sources

L'Éclateur conserve son identifiant `burster`, sa clé principale `enemy-v035b-burster`, sa feuille finale et ses frames. Les clés de la Foreuse (`drill`), du Sondeur (`surveyor`), du Rampant (`crawler`) et du Cracheur (`spitter`) restent distinctes. Aucun chemin de concept ou de référence n'est utilisé par le chargeur corrigé. Les métadonnées de masters du catalogue ne sont pas des sources de chargement.

Le contenu SVG de production est embarqué à l'identique dans un module dédié. SHA-256 du fichier original et de la copie embarquée :

`66fe46f1785166d3a3b835a2bdfc1d3a08da6c6e23806948fae922bf74e9b3a7`

Le chargeur marque en mémoire la texture et l'image réellement produites depuis ces données. Le rendu contrôle cette provenance, ainsi que la source de la frame. Une clé correcte ou des dimensions correctes ne suffisent plus. Une association accidentelle de l'Éclateur à une autre entité est ramenée à son descripteur officiel.

Une seconde texture indépendante contient exactement la première cellule de cette même feuille : `enemy-burster-final-idle-66fe46f1`. Elle est un secours statique, sans nouveau dessin. Comparaison dans Phaser : **0 octet différent sur 16 384 octets RGBA**.

| Situation | Résultat pour l'Éclateur |
| --- | --- |
| Chargement normal | Animation finale de production |
| Frame ou clip absent | Frame neutre finale reconstruite si possible |
| Feuille principale absente ou étrangère | Pose statique finale indépendante |
| Frame pointant vers une autre source d'atlas | Pose statique finale indépendante |
| Deux sources finales absentes ou invalides | Sprite masqué ; jamais de texture ancienne ou étrangère |

Cette dernière situation est une limite explicite : le correctif garantit l'identité du visuel affiché, pas la visibilité si toutes ses ressources sont détruites. Les collisions, dangers et données de l'acteur restent inchangés.

## Cache et chargement

L'Éclateur ne dépend plus d'une réponse HTTP SVG pouvant être ancienne ou partielle : les données proviennent du module nommé avec l'empreinte de l'asset. Le serveur existant conserve ses en-têtes `no-store` ; sa configuration n'est pas modifiée. Un onglet déjà ouvert avec l'ancien JavaScript doit être rechargé pour recevoir le correctif. Aucun stockage de progression n'est effacé.

Le rechargement normal a été vérifié dans le navigateur de test. Il ne s'agit pas d'une validation sur téléphone Android physique ni d'une purge du profil Chrome Android.

Coût supplémentaire : environ 64 Ko de source JavaScript et une texture statique 64 × 64, soit 16 Kio RGBA. La feuille de production reste inchangée.

## Fichiers

Code existant modifié :

- `src/rift-animation.js` : chargement, sélection et vérification de provenance.
- `src/enemies/view.js` : suppression du secours ancien pour l'Éclateur uniquement.

Code ajouté :

- `src/burster-visual.js` : chargeur dédié, vérification de texture/frame, pose de secours.
- `src/burster-final-art-66fe46f1.js` : copie exacte de la feuille finale et extraction de sa première cellule.

Tests ajoutés : `tests/burster-final-lock.test.js`, `tests/burster-texture-fixture.js`, `tests/burster-lock-compat.js`. Adaptations des fixtures et contrôles d'intégrité existants : `tests/rift-animation-v035b.test.js`, `tests/visual-diagnostic.test.js`, `tests/visual-diagnostic-compat.js`, `tests/v033-authorized-files.js`. Aucun test supprimé. Les comparaisons historiques restent épinglées par empreinte ; un contrôle supplémentaire vérifie tous les fichiers de production antérieurs hors les deux modules de rendu autorisés.

Outils, captures, copies avant correctif et rapports : `production-v035b/burster-final-lock/`. Le serveur de validation est isolé sur l'adresse de boucle locale, sans changement du serveur du jeu.

## Résultats

- `npm.cmd test` : **985/985 réussis**, 0 échec, 0 ignoré ; 975 tests antérieurs conservés, 10 ajoutés.
- Vérification ciblée : 100/100 réussis.
- 300 apparitions d'Éclateur, 90 000 mises à jour d'acteurs : aucun ancien skin sélectionné.
- 230 observations d'états sur 23 entités : aucune sélection incorrecte détectée.
- Injection d'une texture de Cracheur sous la clé de l'Éclateur : rejetée, secours final affiché.
- Absence de feuille, absence de frame, source d'atlas étrangère et absence des deux sources : comportements conformes au tableau ci-dessus.
- Formats 320 × 568 et 390 × 844 vérifiés ; captures `mobile-320.jpg` et `mobile-390.jpg`.
- Aucune erreur ni alerte console sur les pages finales testées (`console.json`).

Ces essais navigateur ne constituent pas une mesure de performance GPU sur Android physique. Après rechargement du client corrigé, le sélecteur de l'Éclateur n'accepte que les données du skin final approuvé. Aucun gameplay, hitbox, timing, master, feuille SVG de production, économie ou sauvegarde modifié. CGWeb et l'ancienne Mine non touchés.

Arrêt après ce correctif.
