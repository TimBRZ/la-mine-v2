# Le Souffleur — master statique, variante A

**Statut : prêt pour validation humaine. Aucune intégration.**

## Référence et intention

Base absolue : l’image fournie `Image ChatGPT 14 oct. 2026, 00_20_49.png`, machine de gauche intitulée « Variante A ». Copie originale conservée octet par octet. Même vue latérale légèrement oblique, bonbonne arrière, moteur central, chenille basse et grande turbine frontale.

Une soufflerie industrielle lourde : couronne lisse, pales internes, moyeu court contenu dans l’ouverture. Le Souffleur n’adopte ni le coin entre deux mors de l’Éclateur, ni la couronne crénelée de la Fendeuse. Sa bonbonne alimente un moteur et un ventilateur ; elle ne devient pas une simple cuve à buse comme le Cracheur ni un four comme le Crachefer.

## Nettoyage retenu

Aplats ocre, acier froid et charbon repris de la famille validée ; petits accents vert d’eau et rouille. Contours harmonisés, textures et usure supprimées, ombres réduites. Six pales larges et courbes remplacent les petites découpes internes. Manomètre simplifié sans graduations fines. Les volumes, leur placement et les proportions générales de A sont conservés.

Le master SVG est transparent et entièrement vectoriel. Le cadrage comparatif `65 192 640 350` est identique pour la référence et le master ; le PNG n’est embarqué que dans le fichier de référence, jamais dans le master.

## Construction pour l’animation future

| Parties stables | Parties mobiles futures |
|---|---|
| Châssis, contours des chenilles | Segments internes des chenilles |
| Moteur, structure, bonbonne et conduite | Vibration brève du moteur, sans déplacement de l’enveloppe |
| Carter et couronne externe de la soufflerie | Six pales internes autour de `(634, 356)` |
| Cadran du manomètre | Aiguille facultative, secondaire à petite taille |

Prévoir la rotation des pales dans leur plan elliptique, sous un masque fixe de l’ouverture ; ne pas faire tourner le carter ni l’ellipse entière dans le plan de l’écran. Le capuchon du moyeu reste court. Aucun nouveau volet n’est nécessaire. Pour hit/mort : réaction contenue, décélération des pales, extinction du témoin, affaissement simple. Aucun état animé ni frame n’est créé maintenant.

## Gameplay conservé

Le boss Zone 4 `blower` reste inchangé : cadre 84×84, rayon 29, repositionnement à distance. Ses attaques restent le cercle de huit tirs, les quatre poches et le cône de cinq tirs, avec leurs télégraphes respectifs de 1,35 / 1,6 / 1,2 s. Les futures animations suivront ces états : aucune poussée physique, aspiration, collision de pale, attaque supplémentaire ou déclenchement par frame.

## Livrables et mobile

- [Galerie](v035a-souffleur-final/gallery.html), [master SVG](v035a-souffleur-final/master/souffleur.svg), [silhouette](v035a-souffleur-final/silhouettes/souffleur.svg).
- [Référence / master](v035a-souffleur-final/captures/reference-master.jpg) et [comparaison de famille](v035a-souffleur-final/captures/famille.jpg).
- Captures [320×568](v035a-souffleur-final/captures/mobile-320.jpg) et [390×844](v035a-souffleur-final/captures/mobile-390.jpg).

Contrôles en cadres **40 / 56 / 84 px CSS**, sans étirement. En projection mobile du cadre monde 84² : environ 59,7 px à 320 et 72,8 px à 390. Le profil latéral n’occupe pas toute la hauteur du cadre carré. À 40 px, le manomètre et le nombre de pales deviennent secondaires ; bonbonne et grand cerclage frontal restent les signes prioritaires.

Les comparaisons sont statiques dans Chromium, pas une run ni une validation sur téléphone physique. L’animation en combat restera à vérifier lors d’une future intégration autorisée.

## Vérification et arrêt

Galerie et pages mobiles contrôlées en 320×568 et 390×844 : aucune image manquante, aucune erreur ni alerte console, aucun débordement horizontal. Les planches mobiles tiennent dans les hauteurs demandées ; les cadres 40/56/84 sont mesurés dans le DOM. SVG valide : 66 formes, 9 aplats, environ 6,5 ko.

**884/884 tests existants réussis**, zéro échec, zéro test ignoré, 48,84 s. [Journal](v035a-souffleur-final/tests.txt). Les **4 834 fichiers préexistants** et les autres masters sont inchangés : [empreintes](v035a-souffleur-final/scope-validation.json). [Validation navigateur](v035a-souffleur-final/browser-validation.json).

Seuls ce document et `v035a-souffleur-final/` sont ajoutés. Aucun gameplay, hitbox, asset de production ou test existant modifié. Aucune animation, sprite sheet, intégration, opération commit/push. **Arrêt pour validation humaine.**
