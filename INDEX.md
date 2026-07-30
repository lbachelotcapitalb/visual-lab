# INDEX — la bibliothèque en un fichier

**Généré par `node bin/index.mjs`. Ne pas éditer à la main.**

20 patterns · 6 systèmes · 5 patterns vérifiables (`node bin/check.mjs <id>`)

Colonnes : `id` · nature/famille · ce que ça fait · nb de benchmarks · système.
Le fragment est dans `patterns/<id>.html`, ses métadonnées complètes dans `index.json`.

## ref-02-ghost-icon-claim

- **pat-card-ghost-icon-claim** · component/card · Asséner UN seul argument sur toute une largeur, avec une icône énorme mais presque invisible qui donne du volume sans voler l'attention au titre. · — · sys-02
  - employer : Bloc de réassurance ou de promesse produit (confidentialité, garantie, engagement) sur une landing ou une slide. Un argument par carte, jamais deux.
  - éviter : Il y a plus d'une idée à faire passer, ou l'icône doit être comprise (ici elle est décorative). Pour une rangée de 3 bénéfices, prendre un pattern de grille, pas celui-ci.
  - tags : carte, argument, reassurance, icone, confidentialite, landing, hero, monochrome, claim
- **pat-icon-ghost** · rule/icon · Régler une icône décorative de grande taille pour qu'elle porte le volume d'un bloc sans jamais concurrencer le texte. · — · sys-02
  - employer : Dès qu'une icône dépasse ~120 px dans une carte, une slide ou un hero. C'est la règle qui empêche le pictogramme géant de devenir le sujet.
  - éviter : L'icône est cliquable, porte un statut, ou remplace un mot (avertissement, erreur, état) : elle doit alors être lisible, donc contrastée, donc hors de cette règle.
  - tags : icone, regle, contraste, hierarchie, decoratif, accessibilite
- **pat-type-mixed-family-emphasis** · type/type · Accentuer un fragment de titre en basculant sa FAMILLE typographique (grotesk bold → serif italique) à corps égal, au lieu de le colorer ou de le grossir. · — · sys-02
  - employer : Un titre où un mot est un nom de produit, une nuance, un aparté (« (lite) », « nearly », « — vraiment »). Marche aussi en sens inverse : serif de titre avec un mot en grotesk.
  - éviter : La charte n'a qu'une seule famille disponible, ou le fragment porte l'information principale — dans ce cas il doit être plus GROS, pas juste différent.
  - tags : typographie, emphase, titre, serif, italique, contraste, editorial

## ref-03-bento-dark-pitch

- **pat-badge-pill-outline** · component/badge · Poser une étiquette de cadrage (période, unité, filtre) sous un titre, avec un poids visuel quasi nul. · — · sys-03
  - employer : Juste après un titre de slide, pour dire « 2025 », « by year », « Q3 » — l'information qui qualifie le titre sans le rallonger.
  - éviter : L'élément est cliquable (ça ressemble à un bouton et personne ne cliquera) ou porte un statut à surveiller (succès/erreur) : il faut alors du plein et de la couleur, pas un trait de 1px.
  - tags : badge, pilule, etiquette, outline, periode, titre, cadrage, chip
- **pat-chart-bars-stadium** · chart/chart · Un histogramme réduit à l'essentiel : des barres à sommet en demi-cercle, aucune ligne d'axe, des légendes en pilules. · — · sys-03
  - employer : Trois à six valeurs d'une même série sur un axe temporel, dans un deck. La progression doit se voir en une seconde, sans lecture de grille.
  - éviter : Il faut comparer plusieurs séries, lire des valeurs précises, ou les écarts sont faibles — le sommet arrondi mange quelques pixels de hauteur et fausse la comparaison fine. Dans ce cas : barres droites et axe gradué.
  - tags : graphique, barres, histogramme, dataviz, deck, revenus, progression, arrondi, axe
- **pat-chart-isotype** · chart/chart · Raconter une proportion en unités comptables (24 pictogrammes sur 40) au lieu d'un pourcentage abstrait. · — · sys-03
  - employer : Une part qui porte sur des ÊTRES ou des OBJETS dénombrables — clients, sièges, sites, jours. Le lecteur voit la quantité avant de lire le chiffre.
  - éviter : La grandeur est continue (chiffre d'affaires, température, durée) : il n'y a rien à compter. Et au-delà d'environ 60 pictogrammes plus personne ne compte — passer à une barre.
  - tags : graphique, isotype, pictogramme, proportion, pourcentage, dataviz, comptage, part
- **pat-icon-circle-arrow** · component/icon · Donner un point d'accroche au regard dans une zone vide et indiquer une direction de lecture, sans ajouter de texte. · — · sys-03
  - employer : Coin d'une carte, sous un titre, en tête d'un bloc : → pour la suite, ↗ pour la croissance, ↘ pour la sortie ou la conséquence.
  - éviter : L'élément est réellement cliquable — il faut alors une cible de 44px et un état au survol, ce que ce fragment purement décoratif n'a pas.
  - tags : icone, fleche, cercle, outline, direction, accroche, deck, ponctuation
- **pat-layout-bento-nested** · layout/layout · Structurer une slide dense en trois niveaux (carte → sous-carte → tuile) sans une seule bordure ni ombre, en ne faisant décroître que le rayon et le padding. · — · sys-03
  - employer : Slide de chiffres ou de preuves où il faut caser 4 à 8 informations sans que ça ressemble à un tableau. C'est le squelette par défaut d'un deck investisseur moderne.
  - éviter : Il n'y a qu'une seule idée sur la slide — l'imbrication crée alors une hiérarchie qui ne correspond à rien. Et sur un support imprimé en petit format, les tuiles descendent sous le seuil de lisibilité.
  - tags : bento, layout, slide, cartes, imbrication, rayon, hierarchie, deck, investisseur, grille
- **pat-tile-kpi** · component/tile · Loger un chiffre, son libellé et une icône facultative dans une tuile de hauteur fixe, alignable en rangée sans que la longueur des textes désaligne quoi que ce soit. · — · sys-03
  - employer : Rangée ou grille 2×2 de résultats chiffrés dans un deck ou un dashboard. Deux à six tuiles ; au-delà, plus personne ne lit.
  - éviter : Les chiffres doivent être comparés entre eux (là il faut un graphique, pas des tuiles) ou une tuile mérite trois lignes d'explication — ce n'est plus un KPI.
  - tags : kpi, tuile, chiffre, metrique, dashboard, deck, grille, bento, stat
- **pat-type-inline-highlight-pill** · type/type · Faire ressortir un membre de phrase en le posant dans une pilule pleine inversée, dans le flux du texte. · — · sys-03
  - employer : La condition ou le délai qui change tout dans une promesse (« within 5 years », « sans engagement », « dès le premier mois »). Un fragment par bloc.
  - éviter : Le fragment fait plus de quatre ou cinq mots : la pilule devient une barre et casse l'interligne. Utiliser alors une ligne à part.
  - tags : typographie, surlignage, emphase, pilule, inline, promesse, condition, highlight

## ref-04-swiss-investor-blue

- **pat-deck-rhythm-fullbleed** · rule/deck · Donner un tempo à un deck par la seule alternance des fonds pleins, sans ajouter un ornement, une carte ou une couleur d'accent. · — · sys-04
  - employer : Deck de 8 slides ou plus construit sur deux à trois fonds pleins. C'est la règle qui remplace les séparateurs de section : le changement de fond EST le séparateur.
  - éviter : Document imprimé (une slide bleue pleine coûte une cartouche et vire au violet sur du papier non couché), ou charte à plus de trois fonds : au-delà, l'alternance n'est plus un rythme, c'est du bruit.
  - tags : rythme, regle, fond, alternance, deck, tempo, sequence, editorial, couleur, suisse
- **pat-layout-swiss-header-footer** · layout/layout · Poser le cadre d'une slide de deck : une marge unique, deux barres de micro-typo à trois zones et un filet d'un pixel — de quoi rendre une suite de slides reconnaissable sans y ajouter le moindre ornement. · — · sys-04
  - employer : Deck de plus de trois slides qui doit tenir comme un document : le header rappelle la section, le footer numérote. C'est aussi ce qui autorise les fonds pleins à alterner sans que le deck se disloque.
  - éviter : Slide unique, visuel de réseau social, ou support projeté de loin : à 8 px les barres ne se lisent pas, elles ne sont là que pour tenir la page.
  - tags : layout, cadre, header, footer, deck, slide, suisse, filet, micro-typo, grille, marge
- **pat-list-numbered-giant** · component/list · Aligner trois à quatre arguments de même rang en colonnes, chacun ouvert par un numéro ou un chiffre démesuré qui sert à la fois de repère de lecture et de seule tache de couleur du bloc. · — · sys-04
  - employer : Bas de slide : les trois causes d'un problème, les trois étapes d'une solution, les quatre chiffres d'une traction. Trois ou quatre colonnes ; à cinq, le numéro cesse d'être un repère et devient une texture.
  - éviter : Les entrées ne sont pas de même rang (une hiérarchie déguisée en liste), ou chacune demande plus de trois lignes de texte : ce n'est alors plus une liste, c'est une section.
  - tags : liste, numerotation, colonnes, chiffre, kpi, argument, deck, slide, filet, suisse, etapes
- **pat-title-monster-caps** · type/type · Faire porter toute la hiérarchie d'une slide par un seul bloc typographique : un titre en capitales grasses calé haut-gauche, une phrase secondaire, et rien entre les deux. · — · sys-04
  - employer : Ouverture de section dans un deck, couverture, page de titre — dès qu'une slide n'a qu'une chose à dire et qu'on veut qu'elle se lise à trois mètres.
  - éviter : La slide porte plusieurs idées de même rang, ou le titre dépasse trois mots par ligne : à 76 px en capitales, une ligne longue devient un mur et l'effet s'inverse.
  - tags : titre, typographie, capitales, grotesk, deck, slide, suisse, emphase, hierarchie, couverture
- **pat-toc-two-column** · component/toc · Faire tenir un sommaire de dix à quatorze sections sur une seule slide, en deux colonnes numérotées, lisible d'un coup d'œil et refermable aussitôt. · — · sys-04
  - employer : Deck long qu'on présente à quelqu'un qui doit savoir combien de temps ça va durer : investisseur, comité, client. Idéalement 10 à 14 entrées.
  - éviter : Moins de huit entrées (une seule colonne suffit et la deuxième sonne creux), ou entrées de longueur très inégale : à 11 px en capitales, une entrée qui passe sur deux lignes casse l'alignement des filets.
  - tags : sommaire, toc, agenda, numerotation, colonnes, deck, slide, navigation, filet, suisse

## ref-06-orange-notched

- **pat-card-notched-brief** · component/card · Porter une catégorie nommée et son explication sur un aplat neutre, en rangée, sans jamais rivaliser avec la vignette d'accent posée à côté. · 10 bench · sys-06
  - employer : Deux à trois segments, audiences, motions commerciales ou options présentés côte à côte — typiquement à droite d'une vignette statistique qui, elle, porte le chiffre.
  - éviter : Il n'y a qu'une seule carte (le second rang n'a plus de premier rang à côté, l'aplat neutre n'y sert à rien), ou l'explication dépasse quatre lignes — ce n'est plus un libellé commenté, c'est un paragraphe qui mérite sa colonne.
  - tags : carte, segment, audience, categorie, chanfrein, notch, second-rang, rangee, deck, libelle
- **pat-list-index-rules** · component/list · Lister les sections d'un document en donnant à chacune son libellé, une ligne d'explication et son numéro à droite, séparées par un filet fin qui appartient à l'entrée qu'il suit. · 9 bench · sys-06
  - employer : Sommaire d'un deck ou d'une proposition, 3 à 6 entrées, en colonne de droite face au titre. Aussi valable pour une liste d'étapes ou de livrables numérotés.
  - éviter : Plus de 6 entrées (les filets deviennent une trame et plus personne ne lit), ou les entrées n'ont pas d'explication — une liste de libellés nus n'a pas besoin de cette structure, un simple empilement suffit.
  - tags : sommaire, index, toc, liste, filet, numero, hairline, deck, etapes
- **pat-shape-notched-card** · primitive/shape · Donner à un aplat coloré une signature de forme reconnaissable — UN coin coupé à 45° — sans rien ajouter au contenu ni recourir à un rayon, une ombre ou un liseré. · 3 bench · sys-06
  - employer : Sur les aplats d'accent d'un deck ou d'une landing qui doivent se reconnaître d'une slide à l'autre : carte statistique, carte de second rang, pastille de glyphe. Une seule orientation par famille de contenu.
  - éviter : Sur une image (la coupe se lit comme un recadrage raté), sur une carte du même fond que la slide (la coupe devient invisible et le lecteur ne voit qu'un angle sale), ou sur plus d'un coin — deux coins coupés font un losange, pas une signature.
  - tags : chanfrein, notch, coin, clip-path, carte, aplat, forme, signature, deck, corporate
- **pat-stat-block-accent** · component/card · Faire porter UN chiffre par un aplat d'accent chanfreiné, avec son cadrage (micro-libellé au-dessus) et son commentaire (corps collé en bas), de façon à ce que le chiffre se lise avant le texte. · 12 bench · sys-06
  - employer : Preuve chiffrée d'une slide : croissance, volume livré, part de marché. Une seule par slide, posée en tête de rangée ou en recouvrement du bas d'une photo pour ancrer l'accent.
  - éviter : Le chiffre a besoin d'être comparé à d'autres (il faut un graphique), il n'y a pas de commentaire à mettre (la vignette se vide et le chanfrein devient un ornement seul), ou le texte descend sous 16 px — sur cet orange le contraste ne tient plus (3,4:1, valable seulement en grand corps).
  - tags : stat, chiffre, kpi, vignette, carte, accent, chanfrein, notch, flèche, deck, preuve
- **pat-title-leading-rule** · type/title · Marquer le titre d'une slide d'un filet vertical d'accent sans ajouter ni couleur au texte ni élément décoratif : le filet est le seul accent du titre, et il est collé au mot. · 7 bench · sys-06
  - employer : Titre de slide en capitales grasses sur 1 à 3 lignes, dans un deck qui répète ce marqueur d'une slide à l'autre — c'est sa répétition qui en fait une charte.
  - éviter : Le titre est déjà coloré ou posé sur un aplat d'accent (deux accents se neutralisent), ou il est centré : un filet collé à un bloc centré désaxe la composition sans rien signifier.
  - tags : titre, filet, barre, accent, typo, capitales, deck, marqueur, leading-rule

## Systèmes

- **sys-02** — Gris fantôme — argument unique (ref-02-ghost-icon-claim)
- **sys-03** — Bento sombre — pitch investisseur (ref-03-bento-dark-pitch)
- **sys-04** — Suisse maximaliste — investor deck bleu (ref-04-swiss-investor-blue)
- **sys-06** — Corporate orange chanfreiné (ref-06-orange-notched)
- **sys-08** — Suisse studio — hero web Studioform® (ref-08-swiss-studio-hero)
- **sys-10** — Planche de campagne — condensée rouge (ref-10-campaign-board-red)
