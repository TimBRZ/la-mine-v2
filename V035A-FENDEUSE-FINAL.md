# La Fendeuse — master statique depuis la variante B

Statut : **master proposé pour validation humaine**. Aucune intégration ni animation.

## Intention et base officielle

La Fendeuse est une machine chenillée de fendage à grande roue verticale munie de blocs épais : elle broie et écarte la matière. La fiche « Fiche conceptuelle de la Fendeuse.png » fournie par l’utilisateur est la référence officielle, copiée à l’identique dans [references/variante-B.png](v035a-fendeuse-final/references/variante-B.png).

La vue latérale vers la droite, le châssis bas, les volumes supérieurs, le bloc moteur, le carter central ocre et la grande couronne sont conservés. Le dessin reprend les principales positions dans le repère de l’image source ; le cadrage partagé `80 345 890 530` facilite la comparaison.

Le nettoyage réduit les ombres à des aplats, supprime l’usure et les petits rivets décoratifs, harmonise les contours, simplifie les chanfreins et clarifie le dégagement sous le carter. L’acier froid, l’ocre chantier et la rouille suivent la palette du projet. La fenêtre Grisou reste petite, sans halo.

Le master est entièrement vectoriel, transparent, sans bitmap, filtre, gradient ou script. Seul le fichier de cadrage de la référence embarque le PNG original pour son affichage dans le navigateur.

## Livrables

- [Galerie](v035a-fendeuse-final/gallery.html)
- [Master SVG](v035a-fendeuse-final/master/fendeuse.svg)
- [Silhouette monochrome](v035a-fendeuse-final/silhouettes/fendeuse.svg)
- [Comparaison B / master](v035a-fendeuse-final/comparaisons/reference-master.html) et [capture](v035a-fendeuse-final/captures/reference-master.jpg)
- [Comparaison des silhouettes de la famille](v035a-fendeuse-final/comparaisons/famille.html) et [capture](v035a-fendeuse-final/captures/famille.jpg)
- Captures [320×568](v035a-fendeuse-final/captures/mobile-320.jpg) et [390×844](v035a-fendeuse-final/captures/mobile-390.jpg)

## Distinction avec les autres machines

| Entité | Signature visuelle |
|---|---|
| La Fendeuse | Grande roue verticale crénelée, blocs épais à sa périphérie, carter ocre couvrant le moyeu. |
| Éclateur corrigé | Tige horizontale longue, coin central et deux mors séparés. |
| Rampant validé | Petit châssis bas et petit tambour porté à l’avant. |
| Foreuse autonome | Foret conique pointu et châssis compact. |
| Foreur de fond | Foret conique sur structure longue à appuis. |
| Cracheur validé | Cuve verticale et bouche de projection. |

Les planches montrent couleur et silhouette dans des cadres égaux pour isoler la comparaison des formes. Les vues mobiles montrent séparément les rapports de taille existants. Les références des autres entités ne sont pas redessinées.

## Construction et animation future

| Ensemble | Traitement prévu ultérieurement |
|---|---|
| Châssis, bloc moteur, volumes supérieurs | Masses stables. Garder l’enveloppe et le centre visuel. |
| Chenille | Contour stable ; défilement des segments internes, sans déplacer la silhouette de collision. |
| Moyeu et grand carter ocre | Restent solidaires du châssis. Ils masquent la partie arrière de la roue. |
| Couronne et blocs de fendage | Un ensemble mécanique mobile, axe repéré à `(668, 615)` dans le SVG. Pour la vue légèrement oblique, préparer une rotation dans le plan de la roue sous le masque du carter, sans faire pivoter toute la silhouette de biais comme une hélice. Aucun dessin intermédiaire créé ici. |
| Préparation / impact / reprise | Vibration courte du mécanisme puis impulsion contenue, calées sur les états existants. Aucun nouveau vérin, bras ou mâchoire ajouté. |
| Hit | Réaction visuelle brève, sans déplacer l’origine gameplay. |
| Mort | Arrêt de la couronne, extinction de la fenêtre, affaissement simple des ensembles existants. Aucun nouveau projectile ni fragment dangereux. |

Les groupes SVG portent des noms stables pour faciliter un futur découpage. Aucun état animé ni sprite sheet n’est produit. Les frames futures suivront le jeu ; elles ne déclencheront pas ses attaques.

## Rôle existant, conservé

L’entité correspond techniquement au boss Zone 4 `splitter`, encore nommé `LE FENDEUR` dans `src/rift/config.js`. « La Fendeuse » est le nom de cette fiche artistique ; aucune nomenclature du jeu n’est modifiée ici.

État constaté : rayon 28, cadre visuel 84×84, 1 750 PV, vitesse de repositionnement 78. Cycle charge / éventail de huit projectiles / trois fissures. Charge verrouillée après 1,25 s de warning, vitesse 330 pendant au plus 1,1 s ; éventail précédé de 1,2 s ; fissures précédées de 1,55 s. Sous 50 % PV, davantage de charges et d’éventails. Sources lues : `src/rift/config.js`, `src/rift/actors.js`, `src/rift/combat.js` et inventaire V035A.

La roue illustre la fonction minière et l’intention de rupture. Elle ne crée **ni dégâts de dents, ni attaque de scie supplémentaire, ni nouvelle collision**. Les projectiles et zones existants restent les seuls signaux de danger associés à leurs attaques. Lors d’une intégration future autorisée, l’orientation et les ancrages devront être vérifiés séparément ; ce dessin n’en change aucun.

## Mobile et limites

Contrôle à **40×40**, **56×56** et **84×84 px CSS**, sans déformation. Ce sont des cadres carrés : le profil latéral occupe moins de hauteur que de largeur. La miniature agrandie de la fiche source n’est pas utilisée comme preuve de taille réelle.

Les vues mobiles prennent les cadres monde existants et les mettent à l’échelle de largeur 450 : Fendeuse environ **59,7 px à 320×568** et **72,8 px à 390×844** ; Éclateur et Rampant environ 34,1 / 41,6 px. Comparaison sur fond Zone 4, en couleur et monochrome.

À 40 px, les petites ouvertures et les chanfreins deviennent secondaires. La grande couronne dentée, le carter ocre et la chenille portent la reconnaissance. Le fonctionnement en animation et dans une mêlée réelle n’est pas évalué : il s’agit d’un master statique. Contrôle Chromium, pas téléphone physique.

## Validation et périmètre

**884/884 tests existants réussis**, zéro échec, zéro test ignoré, 44,12 s. [Journal](v035a-fendeuse-final/tests.txt).

Galerie et planches vérifiées dans Chromium en 320×568 et 390×844 : aucune image manquante, aucune erreur ni alerte console, aucun débordement horizontal. Les planches mobiles tiennent dans la hauteur demandée. Master SVG : 50 formes, 9 aplats, 5 180 octets ; XML valide.

Les **4 798 fichiers préexistants** sont protégés par empreinte ; aucun fichier de production ou test existant n’est modifié. La référence B est copiée octet par octet, les autres masters sont inchangés. [Rapport](v035a-fendeuse-final/scope-validation.json). [Vérification navigateur](v035a-fendeuse-final/browser-validation.json).

Seuls ce document et `v035a-fendeuse-final/` sont ajoutés. Aucun gameplay, sauvegarde, économie, nom technique, hitbox ou asset de production modifié. Aucune intégration, aucune sprite sheet, aucun commit/push. **Arrêt pour validation humaine.**
