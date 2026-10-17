# V0.35A — Inventaire exact

13 octobre 2026. 18 nouveaux concepts statiques : 9 ennemis, 9 boss. 3 ennemis réutilisés en Zone 4 sont documentés sans redessin. Tous les identifiants proviennent des vagues de ZONE_CONFIGS. Aucun nouvel acteur inventé.

Le Crachefer appartient à la Zone 1 dans le code, malgré la mention « Z2 » du brief. Les trois mobs réutilisés gardent actuellement leurs anciens assets en Z4 : la sheet V034B est limitée aux Zones 1–3.

| Zone | Entité / ID | Rôle et attaques réels | Asset actuel | Concept | Taille proposée | Rayon | Orientation | Statut | Prêt pour animation |
|---|---|---|---|---|---|---:|---|---|---|
| 4 | Rampant de Grisou / crawler | Contact rapide, poursuite ondulante ; aucune attaque temporisée propre. | Procédural src/rift/art.js → crawler ; [export](v035a-visual-enemies-bosses/old/crawler.svg) | [Master](v035a-visual-enemies-bosses/masters/crawler.svg) | 48×48 | 14 | Fixe, origine .5/.5 | À valider humainement | NON |
| 4 | Cracheur / spitter | Distance 180–235 u ; pose une poche de gaz r38 à la position du joueur, active 2 s après warning 1,3 s. Aucun projectile volant pour cette attaque. | Procédural src/rift/art.js → spitter ; [export](v035a-visual-enemies-bosses/old/spitter.svg) | [Master](v035a-visual-enemies-bosses/masters/spitter.svg) | 48×48 | 18 | Fixe, origine .5/.5 | À valider humainement | NON |
| 4 | Éclateur / burster | Approche accélérée près du joueur ; explosion locale r58, warning 1,25 s. À la mort : avertissement 1,1 s puis six fragments. | Procédural src/rift/art.js → burster ; [export](v035a-visual-enemies-bosses/old/burster.svg) | [Master](v035a-visual-enemies-bosses/masters/burster.svg) | 48×48 | 19 | Fixe, origine .5/.5 | À valider humainement | NON |
| 4 | LE FENDEUR / splitter | Boss mobile : charge droite 330 u/s, éventail de huit projectiles, trois fissures. Plus de charges/éventails sous 50 % PV. | Procédural src/rift/art.js → splitter ; [export](v035a-visual-enemies-bosses/old/splitter.svg) | [Master](v035a-visual-enemies-bosses/masters/splitter.svg) | 84×84 | 28 | Fixe, origine .5/.5 | À valider humainement | NON |
| 4 | LE SOUFFLEUR / blower | Distance : cercle de huit tirs, quatre poches de gaz, cône de cinq tirs. Déplacements latéraux. | Procédural src/rift/art.js → blower ; [export](v035a-visual-enemies-bosses/old/blower.svg) | [Master](v035a-visual-enemies-bosses/masters/blower.svg) | 84×84 | 29 | Fixe, origine .5/.5 | À valider humainement | NON |
| 4 | LE CŒUR DE GRISOU / core | Double cercle de huit tirs décalés de 0,65 s, quatre impacts au sol, orbe lente se fragmentant en six après avertissement. Repositionnement mobile. | Procédural src/rift/art.js → core ; [export](v035a-visual-enemies-bosses/old/core.svg) | [Master](v035a-visual-enemies-bosses/masters/core.svg) | 84×84 | 30 | Fixe, origine .5/.5 | À valider humainement | NON |
| 5 | Lampiste / lampist | Distance 185–255 u ; trois projectiles lumineux en éventail étroit, warning 1,1 s. Ce n’est pas un faisceau continu. | Procédural src/depths/art.js → lampist ; [export](v035a-visual-enemies-bosses/old/lampist.svg) | [Master](v035a-visual-enemies-bosses/masters/lampist.svg) | 48×48 | 17 | Fixe, origine .5/.5 | À valider humainement | NON |
| 5 | Boutefeu / blaster | S’approche à 65 u, pose une charge à 20 u devant lui, puis recule immédiatement. Explosion r39 après 1,5 s ; préparation portée par la charge au sol. | Procédural src/depths/art.js → blaster ; [export](v035a-visual-enemies-bosses/old/blaster.svg) | [Master](v035a-visual-enemies-bosses/masters/blaster.svg) | 48×48 | 18 | Fixe, origine .5/.5 | À valider humainement | NON |
| 5 | Gueule-Noire / blackmaw | Approche rapide en zigzag puis bond rectiligne à 260 u/s pendant 0,52 s, warning 0,9 s. Plus mobile pendant extinction. | Procédural src/depths/art.js → blackmaw ; [export](v035a-visual-enemies-bosses/old/blackmaw.svg) | [Master](v035a-visual-enemies-bosses/masters/blackmaw.svg) | 48×48 | 15 | Fixe, origine .5/.5 | À valider humainement | NON |
| 5 | LE LAMPISTE-MAJOR / lampmajor | Faisceau au sol, éventail de six tirs, extinction et salve de trois. Faisceau plus fréquent sous 50 % PV. | Procédural src/depths/art.js → lampmajor ; [export](v035a-visual-enemies-bosses/old/lampmajor.svg) | [Master](v035a-visual-enemies-bosses/masters/lampmajor.svg) | 84×84 | 28 | Fixe, origine .5/.5 | À valider humainement | NON |
| 5 | LE DYNAMITEUR / dynamiter | Trois charges, chaîne de trois explosions décalées, anneau à sept tirs avec passage, charge isolée. Cycle plus agressif sous 50 %. | Procédural src/depths/art.js → dynamiter ; [export](v035a-visual-enemies-bosses/old/dynamiter.svg) | [Master](v035a-visual-enemies-bosses/masters/dynamiter.svg) | 84×84 | 29 | Fixe, origine .5/.5 | À valider humainement | NON |
| 5 | LA MASSE NOIRE / blackmass | Charge lourde 310 u/s, slam r94, trois fissures, extinction. Sous 50 % : davantage de charge/slam/fissures. | Procédural src/depths/art.js → blackmass ; [export](v035a-visual-enemies-bosses/old/blackmass.svg) | [Master](v035a-visual-enemies-bosses/masters/blackmass.svg) | 84×84 | 31 | Fixe, origine .5/.5 | À valider humainement | NON |
| 6 | Chauffeur / stoker | Chauffe une plaque existante proche du joueur : warning 1,2 s, danger 2,3 s. Se maintient à distance. | Procédural src/forge/art.js → stoker ; [export](v035a-visual-enemies-bosses/old/stoker.svg) | [Master](v035a-visual-enemies-bosses/masters/stoker.svg) | 48×48 | 18 | Fixe, origine .5/.5 | À valider humainement | NON |
| 6 | Riveteur / riveter | Tireur précis : un rivet, puis trois à partir de la vague 11. Warning 1,1 s ; vitesse 165 u/s. | Procédural src/forge/art.js → riveter ; [export](v035a-visual-enemies-bosses/old/riveter.svg) | [Master](v035a-visual-enemies-bosses/masters/riveter.svg) | 48×48 | 17 | Fixe, origine .5/.5 | À valider humainement | NON |
| 6 | Scorificateur / scorifier | Approche mobile puis ruée à 275 u/s pendant 0,65 s. Traînée chaude activée après la ruée, danger 1,3 s. | Procédural src/forge/art.js → scorifier ; [export](v035a-visual-enemies-bosses/old/scorifier.svg) | [Master](v035a-visual-enemies-bosses/masters/scorifier.svg) | 48×48 | 19 | Fixe, origine .5/.5 | À valider humainement | NON |
| 6 | LE MAÎTRE DE FOUR / furnace | Deux plaques (jusqu’à trois sous 50 %), cône thermique de rayon 180, trois rivets ; repli en rivets si gros pattern refusé. | Procédural src/forge/art.js → furnace ; [export](v035a-visual-enemies-bosses/old/furnace.svg) | [Master](v035a-visual-enemies-bosses/masters/furnace.svg) | 84×84 | 28 | Fixe, origine .5/.5 | À valider humainement | NON |
| 6 | LE MARTEAU-PILON / hammer | Impact initial large puis foyer réduit, double impact décalé 0,85 s, anneau à sept tirs et charge 300 u/s. Repli en impact léger si nécessaire. | Procédural src/forge/art.js → hammer ; [export](v035a-visual-enemies-bosses/old/hammer.svg) | [Master](v035a-visual-enemies-bosses/masters/hammer.svg) | 84×84 | 30 | Fixe, origine .5/.5 | À valider humainement | NON |
| 6 | LA CHAUDIÈRE / boiler | Éventail vapeur cinq tirs, quatre jets de soupapes séquencés, trois plaques de surchauffe et trois rivets. Cycle distinct sous 50 %. | Procédural src/forge/art.js → boiler ; [export](v035a-visual-enemies-bosses/old/boiler.svg) | [Master](v035a-visual-enemies-bosses/masters/boiler.svg) | 84×84 | 30 | Fixe, origine .5/.5 | À valider humainement | NON |
| 4, origine Z1 | Foreuse autonome / drill | Machine à distance ; garde une distance moyenne, télégraphie et alterne projectile simple et éventail de trois tirs. | ../src/assets/combat-v020/drill.svg | [Master existant](v034a-visual-enemies-bosses/concepts/drill.svg) | 58×50, inchangé | 16 | rotate / origine .5/0.52 | Conservé, non redessiné | NON pour intégration Z4 |
| 4, origine Z3 | Sondeur / surveyor | Machine de distance : reste vers 190–245 u du joueur, se replace latéralement et recule. Son attaque est une zone de sonde au sol à la position verrouillée du joueur, rayon 36, télégraphe 1,5 s puis danger 0,7 s. Ce n’est pas un lance-projectiles. | ../v034a-visual-enemies-bosses/old/surveyor.svg | [Master existant](v034a-visual-enemies-bosses/concepts/surveyor.svg) | 44×52, inchangé | 16 | fixed / origine .5/0.5 | Conservé, non redessiné | NON pour intégration Z4 |
| 4, origine Z3 | Grisouteux / gasminer | Poursuite rapide, puis explosion locale télégraphiée autour de lui à portée proche. Rayon de danger 62, warning 1,5 s, activité 0,7 s. L’attaque ne le tue pas : ce n’est pas un kamikaze. | ../v034a-visual-enemies-bosses/old/gasminer.svg | [Master existant](v034a-visual-enemies-bosses/concepts/gasminer.svg) | 42×50, inchangé | 15 | fixed / origine .5/0.5 | Conservé, non redessiné | NON pour intégration Z4 |

Les exports procéduraux reprennent les commandes Graphics de production ; ce ne sont pas des anciens concepts inventés. Les bosses solo et triple sont une même entité, jamais comptés deux fois.

## Cadres et warnings

Monde de référence 450×800. Échelle réelle 320×568 : min(320/450,568/800)=0,71. Échelle390×844 : 0,8667, avec bandes libres verticales. Les planches ne grossissent pas les petits mobs pour masquer une faiblesse.

| Entité | Cadre 320 | Cadre390 | Apparition | Warning(s) d’attaque |
|---|---|---|---|---|
| Rampant de Grisou | 34.1² px | 41.6² px | 0.85 s | Pas de warning d’attaque ; apparition 0.85 s |
| Cracheur | 34.1² px | 41.6² px | 1 s | spit : 1.3 s |
| Éclateur | 34.1² px | 41.6² px | 1 s | blast : 1.25 s |
| LE FENDEUR | 59.6² px | 72.8² px | 1.4 s | charge : 1.25 s ; fan8 : 1.2 s ; fissures : 1.55 s |
| LE SOUFFLEUR | 59.6² px | 72.8² px | 1.4 s | circle8 : 1.35 s ; pockets : 1.6 s ; cone : 1.2 s |
| LE CŒUR DE GRISOU | 59.6² px | 72.8² px | 1.4 s | double : 1.5 s ; rain : 1.65 s ; orb : 1.15 s |
| Lampiste | 34.1² px | 41.6² px | 1 s | light : 1.1 s |
| Boutefeu | 34.1² px | 41.6² px | 1 s | plant : 1.5 s |
| Gueule-Noire | 34.1² px | 41.6² px | 0.9 s | leap : 0.9 s |
| LE LAMPISTE-MAJOR | 59.6² px | 72.8² px | 1.4 s | beam : 1.5 s ; fan : 1.25 s ; blackout : 0.85 s ; light : 1.1 s |
| LE DYNAMITEUR | 59.6² px | 72.8² px | 1.4 s | charges : 1.7 s ; chain : 1.5 s ; ring : 1.4 s ; lob : 1.5 s |
| LA MASSE NOIRE | 59.6² px | 72.8² px | 1.4 s | rush : 1.6 s ; slam : 1.55 s ; cracks : 1.5 s ; blackout : 0.85 s |
| Chauffeur | 34.1² px | 41.6² px | 1 s | heat : 1.2 s |
| Riveteur | 34.1² px | 41.6² px | 1 s | rivet : 1.1 s ; rivets : 1.1 s |
| Scorificateur | 34.1² px | 41.6² px | 1 s | scorch : 1.05 s |
| LE MAÎTRE DE FOUR | 59.6² px | 72.8² px | 1.4 s | plates : 1.25 s ; jet : 1.3 s ; rivets : 1.1 s |
| LE MARTEAU-PILON | 59.6² px | 72.8² px | 1.4 s | slam : 1.4 s ; doubleSlam : 1.4 s ; ring : 1.35 s ; ram : 1.6 s ; tap : 1.2 s |
| LA CHAUDIÈRE | 59.6² px | 72.8² px | 1.4 s | steam : 1.25 s ; valves : 1.25 s ; general : 1.3 s ; rivets : 1.1 s |

Sources : src/{rift,depths,forge}/{config,actors,combat,art,waves}.js ; src/depths/pressure.js ; src/enemies/registry.js ; src/enemies/view.js ; src/enemy-animation.js. Les cercles collisionnels restent strictement identiques.
