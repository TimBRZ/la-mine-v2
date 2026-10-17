# Besoins d’animation V0.37C — spécification seulement

Aucune animation ni sprite sheet créée dans V0.37B. Cette fiche accompagne la validation humaine du gameplay. Les masters V037A sont intacts. Ne pas démarrer la production sans une nouvelle demande.

## Contrat commun

Les événements de combat commandent l’animation, jamais l’inverse. `plan.events` porte les annonces et durées ; `h.order` indique le battement. `warning` doit pouvoir boucler pendant une admission retardée. `plan.locked` interdit tout suivi après verrouillage. `charge` signifie exécution ; le boss peut désormais marcher selon le profil V0.37B.1 décrit ci-dessous. `dungeonRecovery` garantit l’immobilité. Les décès interrompent toutes les poses/hazards.

Phase II : télégraphes ×0,94, recoveries ordinaires 0,95 au lieu de 1,10 s ; recalage par temps normalisé. Ultimes ci-dessous décrits à ≤25 % PV, donc avec leurs télégraphes de phase II. Prévoir idle 4–6 frames, marche 6–8, hit 2–3 et mort 6–8 séparément. Ne pas étirer les corps, ne pas déplacer les hitboxes.

## Masses stables

- Maître de Four : bassin, torse porteur, jambes et silhouette des épaules ; animation limitée au foyer, aux bras et cheminées.
- Marteau-Pilon : structure-pilon, carters, torse et pieds ; seule la chaîne piston-mobile → masse-mobile produit la frappe. Les marques d’impact distantes restent des VFX séparés.
- Chaudière : cuve-principale, colliers, conduites-dorsales et appuis ; aiguille et soupapes/foyer portent la pression. Aucune fumée permanente.


### Maître de Four — SECTEURS DE CHAUFFE

Deux secteurs opposés ; trois sous 50 %. Passage central et contournements. Les secteurs sont des hazards distincts.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.35 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 1.80 s à partir de 1.35 s. 4–6 frames de déclenchement puis boucle 4–6 frames pendant la durée active.
- Recovery : 1.10 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : torse-four, bras-proche, bras-lointain, cheminées. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 16–22 frames uniques avec réemploi de l’idle et du retour. Ce sont des recommandations, aucun atlas n’est produit.

### Maître de Four — CÔNE DE FOURNAISE

Cône de 225 px, demi-angle 0,66 rad. Suivi limité à 0,65 rad/s pendant 0,35 s, puis verrouillage définitif.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.40 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Visée mobile pendant 0,35 s, puis verrouillage ; ne pas animer un suivi après ce point.
- Attack : 1 : 0.65 s à partir de 1.40 s. 4–6 frames de déclenchement puis boucle 4–6 frames pendant la durée active.
- Recovery : 1.10 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : torse-four, bras-proche, bras-lointain, cheminées. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 16–22 frames uniques avec réemploi de l’idle et du retour. Ce sont des recommandations, aucun atlas n’est produit.

### Maître de Four — FOUR TOURNANT

Deux bras opposés de 145 px, demi-largeur 14 px, rotation de 0,42 rad/s. Sens alterné entre utilisations sous 50 %, jamais pendant un balayage.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.40 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 2.50 s à partir de 1.40 s. 4–6 frames de déclenchement puis boucle 4–6 frames pendant la durée active.
- Recovery : 1.10 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : torse-four, bras-proche, bras-lointain, cheminées. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 16–22 frames uniques avec réemploi de l’idle et du retour. Ce sont des recommandations, aucun atlas n’est produit.

### Maître de Four — MARCHE À BLANC

Trois disques de 47 px autour de la position échantillonnée du joueur. Espacement des annonces : 0,65 s ; disparition progressive.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.20 s ; étape 2, 1.20 s ; étape 3, 1.20 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 0.65 s à partir de 1.20 s ; 2 : 0.65 s à partir de 1.85 s ; 3 : 0.65 s à partir de 2.50 s. 4–6 frames de déclenchement puis boucle 4–6 frames pendant la durée active.
- Recovery : 1.10 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : torse-four, bras-proche, bras-lointain, cheminées. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 16–22 frames uniques avec réemploi de l’idle et du retour. Ce sont des recommandations, aucun atlas n’est produit.

### Maître de Four — ULTIME · FOUR À BLANC

Trois secteurs couvrent une grande partie de l’arène et laissent deux bandes sûres bordées en vert d’eau. Deux vagues, bandes déplacées entre les vagues, puis cône final. Aucune chauffe totale.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.79 s ; étape 2, 1.79 s ; étape 3, 1.36 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 0.65 s à partir de 1.79 s ; 2 : 0.65 s à partir de 4.69 s ; 3 : 0.60 s à partir de 7.16 s. 4–6 frames de déclenchement puis boucle 4–6 frames pendant la durée active.
- Recovery : 1.50 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : torse-four, bras-proche, bras-lointain, cheminées. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 24–32 frames uniques avec réemploi des boucles des patterns normaux. Ce sont des recommandations, aucun atlas n’est produit.

### Marteau-Pilon — FRAPPE CIBLÉE

Disque ciblé de 62 px, puis onde locale de 62 à 100 px. La cible est échantillonnée avant le télégraphe.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.25 s ; étape 2, 0.35 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 0.22 s à partir de 1.25 s ; 2 : 0.50 s à partir de 1.80 s. Descente en 2 frames, compression en 2–3 frames ; une pose distincte par battement, sans fissure ajoutée.
- Recovery : 1.10 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : piston-mobile, masse-mobile, articulation-bras, collier-inferieur. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 16–22 frames uniques avec réemploi de l’idle et du retour. Ce sont des recommandations, aucun atlas n’est produit.

### Marteau-Pilon — DOUBLE BATTUE

Deux grandes zones successives, annonces espacées de 0,85 s. Alternance gauche/droite puis haut/bas entre utilisations.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.25 s ; étape 2, 1.25 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 0.30 s à partir de 1.25 s ; 2 : 0.30 s à partir de 2.10 s. Descente en 2 frames, compression en 2–3 frames ; une pose distincte par battement, sans fissure ajoutée.
- Recovery : 1.10 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : piston-mobile, masse-mobile, articulation-bras, collier-inferieur. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 16–22 frames uniques avec réemploi de l’idle et du retour. Ce sont des recommandations, aucun atlas n’est produit.

### Marteau-Pilon — RYTHME DE FORGE

Impacts de 38, 52 puis 70 px. Annonces espacées de 0,85 s (0,72 s sous 50 %), puis une seule onde finale de 125 px.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.20 s ; étape 2, 1.20 s ; étape 3, 1.20 s ; étape 4, 0.40 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 0.22 s à partir de 1.20 s ; 2 : 0.22 s à partir de 2.05 s ; 3 : 0.22 s à partir de 2.90 s ; 4 : 0.70 s à partir de 3.50 s. Descente en 2 frames, compression en 2–3 frames ; une pose distincte par battement, sans fissure ajoutée.
- Recovery : 1.10 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : piston-mobile, masse-mobile, articulation-bras, collier-inferieur. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 16–22 frames uniques avec réemploi de l’idle et du retour. Ce sont des recommandations, aucun atlas n’est produit.

### Marteau-Pilon — CONTRE-COUP

Impact au pied du pilon de 62 px, puis onde de 62 à 190 px. Intérieur sûr après passage ; encoche permettant le franchissement.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.30 s ; étape 2, 0.40 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 0.25 s à partir de 1.30 s ; 2 : 1.40 s à partir de 1.95 s. Descente en 2 frames, compression en 2–3 frames ; une pose distincte par battement, sans fissure ajoutée.
- Recovery : 1.10 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : piston-mobile, masse-mobile, articulation-bras, collier-inferieur. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 16–22 frames uniques avec réemploi de l’idle et du retour. Ce sont des recommandations, aucun atlas n’est produit.

### Marteau-Pilon — ULTIME · CADENCE ROUGE

Quatre impacts annoncés aux temps 0 / 1,05 / 1,95 / 2,72 s, de 48 / 48 / 48 / 76 px ; une seule onde finale de 225 px.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.22 s ; étape 2, 1.22 s ; étape 3, 1.22 s ; étape 4, 1.22 s ; étape 5, 0.47 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 0.24 s à partir de 1.22 s ; 2 : 0.24 s à partir de 2.27 s ; 3 : 0.24 s à partir de 3.17 s ; 4 : 0.24 s à partir de 3.94 s ; 5 : 1.50 s à partir de 4.72 s. Descente en 2 frames, compression en 2–3 frames ; une pose distincte par battement, sans fissure ajoutée.
- Recovery : 1.50 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : piston-mobile, masse-mobile, articulation-bras, collier-inferieur. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 24–32 frames uniques avec réemploi des boucles des patterns normaux. Ce sont des recommandations, aucun atlas n’est produit.

### Chaudière — SOUPAPES LATÉRALES

Deux jets opposés de 165 px, demi-largeur 19 px. Les axes alternent entre utilisations ; les deux axes perpendiculaires restent libres.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.30 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 0.85 s à partir de 1.30 s. 4–6 frames de déclenchement puis boucle 4–6 frames pendant la durée active.
- Recovery : 1.10 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : manometre, foyer-interne, voyants-pression, raccord-bas, poings. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 16–22 frames uniques avec réemploi de l’idle et du retour. Ce sont des recommandations, aucun atlas n’est produit.

### Chaudière — PURGE TOURNANTE

Un jet de 160 px, deux sous 50 %. Rotation de 0,40 rad/s, sens fixé au départ et alterné entre utilisations en phase II.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.35 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 2.30 s à partir de 1.35 s. 4–6 frames de déclenchement puis boucle 4–6 frames pendant la durée active.
- Recovery : 1.10 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : manometre, foyer-interne, voyants-pression, raccord-bas, poings. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 16–22 frames uniques avec réemploi de l’idle et du retour. Ce sont des recommandations, aucun atlas n’est produit.

### Chaudière — SURPRESSION AU SOL

Trois cercles de 48 px, espacés dans l’arène ; activation courte simultanée.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.30 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 0.65 s à partir de 1.30 s. 4–6 frames de déclenchement puis boucle 4–6 frames pendant la durée active.
- Recovery : 1.10 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : manometre, foyer-interne, voyants-pression, raccord-bas, poings. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 16–22 frames uniques avec réemploi de l’idle et du retour. Ce sont des recommandations, aucun atlas n’est produit.

### Chaudière — VAGUE DE PRESSION

Une seule onde de 40 à 215 px, demi-largeur 12 px, intérieur et extérieur libres ; encoche de sortie annoncée.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.40 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 1.65 s à partir de 1.40 s. 4–6 frames de déclenchement puis boucle 4–6 frames pendant la durée active.
- Recovery : 1.10 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : manometre, foyer-interne, voyants-pression, raccord-bas, poings. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 16–22 frames uniques avec réemploi de l’idle et du retour. Ce sont des recommandations, aucun atlas n’est produit.

### Chaudière — ULTIME · RUPTURE DE SOUPAPE

Deux jets horizontaux, deux verticaux, puis une onde de 240 px ; décompression immobile de 1,50 s.

- État gameplay : `warning` → `charge` (exécution selon le profil de mobilité V0.37B.1) → `recovery`. Le booléen `plan.locked` distingue la visée initiale du cône du verrouillage.
- Anticipation : étape 1, 1.69 s ; étape 2, 1.32 s ; étape 3, 1.32 s. Prévoir 6–8 frames, maintenables si l’admission est retardée. Géométrie fixée dès l’annonce ; aucune animation ne recalcule la cible.
- Attack : 1 : 0.75 s à partir de 1.69 s ; 2 : 0.75 s à partir de 4.12 s ; 3 : 1.70 s à partir de 6.52 s. 4–6 frames de déclenchement puis boucle 4–6 frames pendant la durée active.
- Recovery : 1.50 s ; 6–8 frames de détente/remontée, conserver une silhouette immobile et une lecture « arrêt / tir possible ».
- Parties mobiles du master : manometre, foyer-interne, voyants-pression, raccord-bas, poings. Les hazard/VFX suivent le modèle ; leur animation ne déclenche jamais les dégâts.
- Budget indicatif : 24–32 frames uniques avec réemploi des boucles des patterns normaux. Ce sont des recommandations, aucun atlas n’est produit.

## Combos

Réemployer les poses normales avec l’horloge du directeur, sans créer trois ultimes parallèles. Forge sous pression : montée du foyer puis ouverture de soupape avec 0,55 s de décalage. Pilon à blanc : chaleur puis montée du piston à 0,80 s. Pression cadencée : deux purges alternées avec deux coups, sans déclenchement simultané. Prévoir une anticipation LIGHT réelle sur le troisième boss, puis une pose de relâchement. Une petite zone peut persister après sa recovery LIGHT ; ne pas garder artificiellement le bras en émission tant que cette zone existe.

## Vérification future

Comparer chaque anticipation/exécution/recovery aux timings de [V037B-ZONE6-BOSS-OVERHAUL.md](V037B-ZONE6-BOSS-OVERHAUL.md), à 320×568 et 390×844. Les ondes et bras sont déjà lisibles sans animation : ne pas les masquer par du glow, des fumées ou des fragments. Conserver les 84 px de présentation temporaire comme point de départ, sans croissance gratuite des bosses.


## Addendum V0.37B.1 — locomotion pendant attaque

Cette section remplace les anciennes hypothèses d’immobilité pendant toutes les attaques. C’est uniquement une spécification future : aucune sprite sheet ou animation créée ici.

La catégorie est portée par `plan.mobility.category` :
- `ATTACK_STATIC` : ancrage du bas du corps et appuis stables.
- `ATTACK_MOBILE` : locomotion lente du bas du corps pendant l’anticipation/exécution du haut ; centres des rotations entraînés par le modèle.
- `ATTACK_LOCKED_DIRECTION` : déplacement indépendant ; ne jamais réorienter la pose d’émission ou les dangers vers le joueur après le verrouillage.

Le mouvement ralentit progressivement et peut atteindre son plafond avant la fin du pattern. Ne pas utiliser `phase === charge` comme synonyme de marche. Déduire la locomotion du déplacement réel entre les deux positions, sans déplacer de hitbox depuis l’animation.

**Maître de Four** : secteurs (40 % au départ), marche à blanc (45 %) et rotation (35 %, dérive courte de 28 px) nécessitent des pas courts. Cône : 35 %, déplacement limité à 20 px ; tracking 0,35 s puis pose verrouillée. Four à blanc reste ancré. Les zones déjà posées restent indépendantes du corps.

**Marteau-Pilon** : ciblée ancrée dès la marque. Double battue : petit pas entre impacts, jamais pendant le second. Rythme : micro-pas entre les premières frappes, finale ancrée. Contre-coup : très bref dégagement après l’onde. Cadence rouge, combos et LIGHT restent ancrés. Garder le poids du pilon ; aucune animation de course pendant frappe.

**Chaudière** : soupapes 55 %, surpression 60 % au départ ; purge 35 % avec dérive lente de 32 px. Vague : petit pas avant émission, stabilisation avant l’onde. Rupture de soupape reste entièrement ancrée. Le manomètre/soupapes peuvent boucler indépendamment des jambes. Aucun retour de visée après annonce.

Les coefficients sont des plafonds initiaux, non des vitesses constantes : la loi de déplacement décélère vers une destination bornée. Les distances et fenêtres exactes sont dans [V037B1-ZONE6-BOSS-ACTIVITY.md](V037B1-ZONE6-BOSS-ACTIVITY.md).

**Recovery MAJOR** : toujours immobile et vulnérable, 1,10 / 0,95 s, combos 1,20 s, ultimes 1,50 s. Aucun cycle de marche sous cette pose. Les autres boss peuvent attaquer pendant ce temps : ne pas synchroniser leurs poses.

**LIGHT** : anticipation 1 s (Four/Chaudière), 1,2 s (Pilon), relâchement 0,25 s puis recovery courte de 0,35 s. Les petites zones persistantes sont des VFX séparés ; le boss peut ensuite marcher ou préparer une autre attaque. Un seul effet LIGHT non refroidi par boss. `attackToken` relie une zone à son attaque et évite de confondre un ancien effet avec la nouvelle pose.

Pour les futurs contrôles, reprendre les 18 captures et le prototype de [v037b1-validation/gallery.html](v037b1-validation/gallery.html), en particulier deux MAJOR + LIGHT et la récupération d’un seul boss au milieu du combat. Ne pas commencer V0.37C sans demande humaine.

## Addendum V0.37B.2 — proximité et approche offensive

Cette section remplace les distances courtes, la décélération et les ancrages de préparation mentionnés dans l'addendum V0.37B.1. Elle décrit uniquement les exigences pour une future V0.37C, sans créer d'animation ni de sheet.

- **Marche de préparation** : séparer les appuis du haut du corps. Le déplacement est décidé par le modèle et peut continuer pendant `warning`. N'animer des pas que lorsque la position change réellement ; un rôle PRESSURE BOSS ne suffit pas à déterminer la marche.
- **Approche offensive** : pas plus appuyés, sans pose de dash ni aura. Le bonus ponctuel est de 15 % sur la marche, avec retour immédiat au rythme normal à portée. Aucune animation ne peut déplacer un collider ou anticiper les dégâts.
- **Four** : pas constants à 35–45 % pendant les patterns compatibles. Cône et four tournant suivent la translation prévue ; après lock, le cône conserve son orientation. Les plaques et marches au sol demeurent des effets indépendants.
- **Pilon** : déplacement lourd, plus lent que Chaudière. Petite poursuite avant la marque ciblée, puis ancrage. Deux fenêtres de pas entre les trois impacts du rythme ; pas de marche sur l'impact final. Contre-coup : déplacement après la première frappe et avant l'onde. Approche courte à 35 % pendant la préparation des combos/LIGHT, puis stabilisation. Aucune course, aucun glissement imposé par les frames.
- **Chaudière** : locomotion continue lors de la purge (35 %), soupapes (55 %) et surpression (60 %). Jets et turbine conservent leurs axes/rotation prédéfinis pendant la translation. Ne pas ajouter de suivi du joueur à la pose d'émission.
- **Arrivée à destination** : la vitesse du modèle est constante puis nulle, sans saut de position. Une transition visuelle peut amortir les appuis, sans prolonger le déplacement réel.
- **Recovery** : corps et appuis totalement immobiles, 0,95–1,50 s après une séquence MAJOR ; les autres boss restent indépendants. Les récupérations LIGHT de 0,35 s sont inchangées.

Référence à utiliser : [V037B2-ZONE6-PROXIMITY-PRESSURE.md](V037B2-ZONE6-PROXIMITY-PRESSURE.md) et [captures mobiles V0.37B.2](v037b2-validation/gallery.html). Conserver les masters statiques et leur gabarit jusqu'à autorisation explicite de V0.37C.
