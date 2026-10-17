# V0.36C — Animations futures des boss Zone 5

Recommandations issues des timings V0.36B ; **aucune sheet ni animation détaillée créée**. Les durées sont pilotées par le gameplay. Une pose peut être tenue ou interpolée : le nombre de frames n’impose jamais la cadence de l’attaque. Préserver les masters validés et la hitbox actuelle. Prévoir des points d’ancrage pour mains/outil, projecteur et charge projetée.

## États communs

| Animation | État gameplay | Durée | Frames utiles recommandées | Masses concernées |
|---|---|---|---|---|
| Idle / préparation admise tardivement | pending | variable | 3–4 en boucle | Torse léger, équipement stable |
| Déplacement | positioning | 0,35–0,6 s nominal, attente possible | 6–8 | Jambes, léger poids du torse |
| Hit | flash | 0,09 s | 1–2 ou teinte | Ne pas interrompre le verrouillage |
| Mort | hp ≤ 0 | à définir visuellement seulement | 6–8 | Affaissement, outil tombe court ; aucune explosion gameplay ajoutée |
| Récupération | recovery | 0,85–1,5 s | 4–6 | Posture ouverte, arme abaissée ; arrêt des pieds |

## Lampiste-Major

| Animation | État / durée gameplay | Frames recommandées | Éléments du master |
|---|---|---|---|
| Armer le balayage | locked, 1,2 s | 6 | bras-proche, bras-lointain, main-proche, projecteur |
| Balayer | active, 2,6 s / 140,4° | 8–10 + rotation continue | Projecteur et épaules ; corps ancré |
| Couper l’éclairage | locked 0,7 s | 4–5 | Main proche, projecteur, lampe-frontale |
| Repositionnement dans l’extinction | active 2 s | 6 | jambes ; conserver torse et bloc-dorsal compacts |
| Suivre puis verrouiller | tracking 0,8 s + locked 0,65 s | 4 de suivi + 2 de verrou | Projecteur lié à la visée puis figé |
| Faisceau | active 0,38 s | 3–4 | Petit recul des bras ; pas de saut de direction |
| Feux croisés | locked 1,3 s, active 2,2 s | 5 + 6 | Projecteur, épaules ; lignes de danger restent des VFX séparés |
| BLACKOUT | assemblage des clips précédents | 2–3 transitions dédiées | Réutiliser coupure, deux balayages, visée ; recovery finale 1,5 s, 6 frames |

Signaux audio futurs seulement : relais électrique avant verrouillage, moteur du projecteur pendant balayage, petit arrêt mécanique à la récupération. Aucun son ajouté ici.

## Dynamiteur

| Animation | État / durée gameplay | Frames recommandées | Éléments du master |
|---|---|---|---|
| Préparer Plan de tir / chaîne | locked 1,35 s | 6–8 | bras-avant, charges-dorsales, torse-ceinture |
| Appuyer en rythme 1 → 4 | active 2,65 s, explosions espacées 0,72 s | 3–4 par appui, réutilisables | main-detonateur, detonateur, bras-detonateur, cordon |
| Désigner les quadrants | locked 1,4 puis 1,3 s | 5–6 | bras-avant et tête-casque ; garder quatre zones séparées en VFX |
| Déclencher les quadrants | active 1,9 s par groupe | 4–6 en séquence | Détonateur ; pas d’animation imposant une autre explosion |
| Charge projetée | locked 1,4 s, impact après verrou | 6–8 de lancer | bras-avant, torse, main ; charge transitoire séparée |
| Impact / fragments | active 0,4 s puis 6 fragments | 3–4 + VFX | Projectile/impact indépendant du corps |
| Démolition contrôlée | locked 1,6 puis 1 puis 1 s ; actifs 0,35 s | 6 anticipation, 3 appui réutilisable | Détonateur, épaules ; couronnes restent des VFX |
| Recharger le détonateur | recovery ultime 1,5 s | 6 | Tête baissée, main-detonateur, outil |

Audio futur : clic distinct au verrouillage, mèche progressive et cadence 1–4. Pas de multiplication des charges physiques par les frames d’animation.

## Masse Noire

| Animation | État / durée gameplay | Frames recommandées | Éléments du master |
|---|---|---|---|
| Préparer la charge | locked 1,6 s | 6–8 | Jambes fléchies, torse en avant, marteau stable à deux mains |
| Charge | active ≤1,7 s à 310 px/s | 6–8 boucle | jambe-gauche, jambe-droite ; outil rigidement lié aux mains |
| Impact au mur | entrée recovery 1,05 s | 3 impact + 4 sonné | torse-stable, bras, marteau ; aucun nouveau cône de dégâts |
| Lever puis frapper | locked 1,25 s / active 0,3 s | 6 anticipation + 3 impact | bras-avant, bras-arriere, mains, marteau-manche et marteau-tete |
| Annoncer l’anneau | locked 0,75 / active 0,4 s | 3 tenue + 3 relâchement | Outil au sol ; onde séparée du corps |
| Triple frappe | gauche 1 / 0,28 s ; droite 0,8 / 0,28 ; centre 1,1 / 0,35 | 6–8 par frappe | Deux mains restent fixées à l’outil ; pivots de torse lisibles |
| Fissure du fond | locked 1,15 / active 0,65 s | 6 anticipation + 3 frappe | Bras, marteau ; progression des fissures hors sheet |
| Écrasement du puits | déplacement 2,2 s max ; slam 1,65 / 0,35 ; axes 1,15 / 0,65 chacun ; onde 1 / 0,7 | 8–10 anticipation signature, réutiliser impact ; 4–6 entre étapes | Torse stable, grande levée lisible ; ne pas synchroniser toutes les fissures sur une seule frame |
| Recovery ultime | 1,5 s | 6 | Marteau au sol, épaules basses, appuis immobiles |

Audio futur : appuis lourds, montée de tension avant frappe, impact court, grondement séquentiel des fissures.

## Triple et budget

Combos = synchronisation des clips existants, pas trois nouvelles animations lourdes. Couloir utilise une préparation du projecteur puis la charge de la Masse ; Démolition lourde garde le slam après les explosions. Sous les projecteurs utilise projecteur et appuis du détonateur.

Il n’y a pas de plafond arbitraire de 20–30 frames par boss. Prioriser les anticipations, verrous, impacts et recoveries ; partager les poses tenues et les appuis identiques. Estimer le budget atlas seulement après validation humaine des patterns. Vérifier les trois tailles mobiles, l’absence de changement de hitbox et la concordance exacte entre animation et collision avant toute intégration V0.36C.
