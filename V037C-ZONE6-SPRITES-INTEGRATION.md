# La Mine V2 — V0.37C : sprites et intégration Zone 6

Intégration visuelle des six masters validés. Gameplay V0.37B/B.1/B.2 conservé. Aucun commit/push, aucune intervention sur CGWeb, aucune Zone 7.

## Livrables et source de vérité

- Galerie : [production-v037c/gallery.html](production-v037c/gallery.html).
- Prototype de contrôle : http://127.0.0.1:5212/ ; serveur normal : http://127.0.0.1:5177/.
- Atlas actifs, modules SVG et images de secours : src/assets/enemies-v037c/ ; sélection explicite dans src/forge-sprite-catalog.js.
- Générateur déterministe : production-v037c/generate.mjs et rig.mjs. Six lots A à F, dans l’ordre demandé ; A/B/C testés ensemble avant D.
- Snapshot antérieur complet : production-v037c/before/src/. Les anciens assets, les masters et les sauvegardes sont conservés.

Les masters utilisés sont v037a-chauffeur-final/master/chauffeur.svg, v037a-riveteur-final/master/riveteur.svg, v037a-scorificateur-final/master/scorificateur.svg, v037a-maitre-four-final/master/maitre-four.svg, v037a-marteau-pilon-final/master/marteau-pilon.svg et v037a-chaudiere-final/master/chaudiere.svg. Chaque tracé et chaque couleur d’origine est conservé dans les définitions des atlas ; seuls des blocs rigides sont déplacés/rotatés. Une modulation bornée des ouvertures chaudes accompagne préparation, émission et extinction. Aucun redessin des masters, aucun morphing de tracé.

## Budget final

| Entité | Frames | Cellule | Atlas | SVG disque | RGBA atlas |
|---|---:|---:|---:|---:|---:|
| chauffeur | 34 | 64² | 512 × 320 | 136.7 Kio | 0.63 Mio |
| riveteur | 33 | 64² | 512 × 320 | 135.9 Kio | 0.63 Mio |
| scorificateur | 41 | 64² | 512 × 384 | 179.1 Kio | 0.75 Mio |
| maitre-four | 118 | 96² | 768 × 1440 | 493.0 Kio | 4.22 Mio |
| marteau-pilon | 98 | 96² | 768 × 1248 | 408.2 Kio | 3.66 Mio |
| chaudiere | 107 | 96² | 768 × 1344 | 525.6 Kio | 3.94 Mio |

Total : **431 frames**, atlas SVG **1.83 Mio**, modules chargés **1.98 Mio**, secours SVG **116.0 Kio**. Fichiers actifs sur disque (SVG + modules + secours) : **3.93 Mio**. Le dossier contient aussi les versions de travail conservées : **13.38 Mio**, qui ne sont pas sélectionnées par le catalogue.

Textures RGBA : **13.81 Mio** d’atlas + **0.15 Mio** de secours = **13.96 Mio**. Estimation 4 octets/pixel, sans mipmaps ; ce chiffre exclut les autres zones, Phaser, les buffers GPU, les chaînes SVG et les copies transitoires de chargement. Les atlas Zone 5 sont libérés en entrant en Zone 6. Les atlas Zone 6 sont importés uniquement à l’entrée de cette zone et libérés en la quittant ; les petits secours restent préchargés.

Pivot constant au centre de chaque cellule, origine (0,5 ; 0,5), cadrage carré fixe avec marge 7,5 %. Taille d’affichage : mobs 52², boss 84² dans l’arène 450 × 800. Miroir gauche/droite avec zone morte ; pas de rotation globale des boss. Les hitboxes restent celles du gameplay.

## Mapping lecture seule

| Entité | Lecture du combat → animation |
|---|---|
| Chauffeur | positioning → idle/move ; warning → prepare ; émission confirmée par warning→recovery → attack ; recovery → repos ; hit / death séparés |
| Riveteur | visée → prepare ; émission réelle → recul court ; éventail existant de trois rivets = une émission, pas trois tirs inventés ; recovery |
| Scorificateur | warning → prepare ; charge → charge avec jambes actives ; recovery → freinage. Pas de balayage ajouté : il n’existe pas dans son gameplay |
| Maître de Four | secteurs → move_prepare / move_attack ; cône → préparation, direction verrouillée, émission mobile ; four tournant → rotor / move_rotor ; marche à blanc → march ; ultime → ultimate_prepare, impulsions, maintien entre admissions, cône, ultimate_recovery |
| Marteau-Pilon | avertissement réel → remontée ; 90 dernières ms → descente ; danger actif → impact ; rebond ; maintien ou préparation suivante ; recovery. Double battue, rythme et cadence rouge réutilisent chaque impact réellement admis, sans retour idle entre les coups |
| Chaudière | warning → pressurize / move_prepare ; jets → purge / move_attack ; onde → wave ; entre étapes → hold ; ultime → montée, jets, nouvelle montée, onde finale, ultimate_recovery ; manomètre et bras suivent la pression |

Le sélecteur utilise les hazards appartenant au boss et au token d’attaque courant, leur avertissement et leur temps actif. Une admission retardée ne produit pas d’impact visuel anticipé. Le plan, les locks, les cibles, les dégâts et les déplacements ne sont jamais écrits par l’animation. Les recoveries des boss restent immobiles et durent exactement 0,95–1,50 s selon le modèle. L’horloge de marche visuelle reste continue entre préparation et attaque mobile. Le Pressure Boss et l’approche +15 % conservent leurs contrôleurs existants.

Fréquences nominales : idle 5 i/s ; marche 10 i/s (Scorificateur 14) ; approche offensive 12 ; charge Scorificateur 16 ; hit 16 ; death 12 ; émissions courtes 14 ; rotor/marche thermique/purge 10 ; rebond 12. Les préparations, impacts et recoveries prennent leur progression dans les durées de gameplay plutôt que dans une minuterie d’animation. Le clip hold est une pose unique volontaire. Mode mouvement réduit : poses fixes, VFX décoratifs désactivés ; simulation inchangée. Le catalogue JSON fournit le détail complet par clip.

## VFX et hiérarchie

Un seul Graphics partagé, plafond de 48 primitives, profondeur 7 sous les télégraphes (8), les entités et projectiles. Impulsion de chaleur du Chauffeur, petit flash sur rivet réellement émis, friction du Scorificateur, chaleur du torse, poussière courte sur impact du Pilon, vapeur brève et décompression. Durées décoratives 0,12–0,18 s ; pas de halo permanent, d’émetteur permanent ou d’appel aléatoire. Les traînées, zones, jets et ondes existants restent les dangers principaux, inchangés. Pas de refonte globale des projectiles.

## Cache, secours et skins parasites

Chaque atlas porte une clé forge-v037c-ID-hash. Le module importé doit correspondre à l’identité, la clé, la longueur et l’empreinte FNV du SVG ; le catalogue archive aussi SHA-256. À la fin du chargement, on mémorise l’objet texture, sa source et ses dimensions. Une texture étrangère, une source remplacée ou une frame provenant d’une autre texture est rejetée. L’identité de l’acteur prime sur un sélecteur erroné.

Ordre : atlas vérifié → frame neutre reconstruite si possible → master statique vérifié → sprite masqué. Jamais de retour au skin procédural/conceptuel d’une entité Zone 6 prise en charge. Le contrôle navigateur a exercé les six cas : normal, frame manquante, frame étrangère, fallback, absence des deux ressources, restauration. Les corps de mort suivent le même secours et sont bornés à 12. Les autres zones délèguent leur animation et leur cleanup au rendu antérieur.

Le serveur normal a renvoyé **18/18 ressources exactes**, MIME SVG/JavaScript corrects, no-store et contenu identique au disque ; les routes de référence hors src sont refusées. Voir http-production.json. Le serveur de galerie emploie immutable pour les noms hashés et revalidation pour le code. Une nouvelle session et un rechargement ont chargé les nouvelles clés sans skin intermédiaire.

## Validation

- Baseline : 1 140/1 140. Final : **1 192/1 192**, 52 nouveaux tests, aucun test supprimé.
- Journaux par lot : lot-A-tests.txt à lot-F-tests.txt ; validation finale : final-tests.txt.
- Le test de snapshot compare octet par octet tous les anciens fichiers src hors les deux points d’intégration visuels room-scene.js et enemies/view.js. Stats, hitboxes, timings, patterns, locks, pression, armes, économie et progression restent identiques. Les anciennes gardes de périmètre ont été étendues uniquement à ces deux fichiers et aux nouveaux fichiers visuels.
- Tests de tous les patterns/ultimes, des trois combos, des recoveries, du plafond de deux MAJOR, des appels de rendu supplémentaires/sautés et des VFX sans écriture du combat.
- Les trois mobs puis les trois boss ont été observés dans le navigateur. Audit final des **15 patterns/ultimes** : final-patterns-browser.json ; trois combos dans les rapports nommés forgePressure, whiteHammer et pressureCadence. Les six atlas ont été rasterisés dans le navigateur : aucune frame vide, aucun bord coupé, chaque clip multi-frame possède des images distinctes. Voir atlas-audit-browser.json.
- Triple en viewport 390 × 844, horloge temps réel, 103.62 s simulées : coût CPU d’un pas de simulation+rendu p95 **1.60 ms**, pic **16.10 ms** ; intervalle RAF p95 **6.40 ms**, FPS remontés par Phaser **164.6** sur écran desktop à haute fréquence. Maximum observé : **2 MAJOR**, **5 zones**, trois boss visibles ; les états pressure des trois boss, move_prepare et move_attack ont été parcourus. Ces chiffres desktop incluent le banc de contrôle et ne mesurent pas Android. Le premier rapport nommé realtime-triple-320 utilisait un pas fixe par RAF ; il reste archivé mais n’est pas la mesure temps réel retenue.
- Aucune erreur/warning console dans les sessions finales du jeu normal, des runs, des secours et de la galerie. Un défaut du banc de test initial (retrait d’atlas avec un corps figé en pause) a été corrigé avant les validations finales ; il n’affectait pas la libération de zone en production.
- Comparaison ancien/nouveau à Atelier 2 : mêmes PV, temps, kills, perks, récompenses, vagues et résultats pour chaque arme. Fusil gagné ; mitraillette perdue vague 16 ; Grisou X perdu vague 17. Ces échecs sont conservés, pas masqués.
- Trois victoires complètes sur les atlas finalisés : shotgun 688.33 s, 5.75 PV ; grisoux 796.75 s, 0.25 PV ; smg 716.50 s, 1 PV. Fusil et Grisou X : Atelier 5, sans talents. Mitraillette : Atelier 5 + Bon départ, Premiers secours, Dernier souffle, choix ordinaires des cartes orientés pénétration/cadence. Pas d’invulnérabilité ni d’écriture forcée des PV dans ces runs. Les fixtures isolées de patterns utilisent une cible immortelle uniquement pour observer leurs séquences.
- Captures réelles 320 × 568 et 390 × 844 dans captures/. Pas de débordement de la galerie. Les dimensions du viewport sont contrôlées séparément des tailles de sprite.
- Aucun gameplay modifié, aucun master remplacé, aucun commit/push.

## Fichiers de production

Modifiés : src/room-scene.js, src/enemies/view.js. Ajoutés : src/forge-animation.js, src/forge-animation-state.js, src/forge-sprite-vfx.js, src/forge-sprite-catalog.js, atlas/modules/secours sous src/assets/enemies-v037c/. Générateur, galerie, snapshot, captures et rapports restent dans production-v037c/. Tests ajoutés : forge-animation-v037c.test.js, forge-render-replay-v037c.test.js, forge-vfx-v037c.test.js et liste d’autorisation ciblée.

## Android physique : validation humaine restante

Le navigateur desktop à viewport mobile ne prouve pas la mémoire GPU, la chauffe ou la fluidité du téléphone. À vérifier sur Android : chargement à froid de la Zone 6, entrée/sortie de zone, absence de micro-freezes, les trois boss simultanés, lisibilité et pression pendant plusieurs minutes. Démarrer le serveur depuis le dossier du projet avec npm.cmd start -- --host=0.0.0.0, puis utiliser l’IP affichée. Si le serveur local 5177 de cette validation tourne encore, l’arrêter avant de lancer le serveur Wi-Fi. Aucun changement CORS ou service externe n’est nécessaire.

Les petits détails (aiguille, grilles) deviennent secondaires à 320 px ; la silhouette, le piston, les poses et surtout les télégraphes portent la lecture. Les animations utilisent le miroir horizontal existant et ne prétendent pas fournir huit directions dessinées. Aucun rééquilibrage n’est déduit des résultats du pilote.

Arrêt après V0.37C. Aucun autre chantier commencé.
