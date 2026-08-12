# INDEX — visual-lab en un fichier

**Généré par `node bin/index.mjs`. Ne jamais éditer à la main.**

43 patterns · 15 références · 36 vérifiés par benchmarks mesurés.

## Comment se servir de ce fichier

1. **Catalogue** : une ligne par pattern — c'est là qu'on choisit, sans rien dérouler.
2. **Détail** : pour le pattern retenu, quand l'employer, quand l'éviter, ce qu'il attend.
3. Le fragment est `patterns/<id>.html` ; il lui faut le bloc `:root` de sa référence —
   `node bin/search.mjs --show <id>` sort les deux d'un coup, prêts à coller.
4. Après toute modification : `node bin/index.mjs` → `node bin/check.mjs <id>` (vert obligatoire)
   → `node bin/render.mjs --pattern <id>` et REGARDER.

**Nomenclature** — un pattern se nomme `<famille>[-NN]-<mots>`, le numéro n'apparaissant que
si la famille en compte plusieurs. Familles : card, chart, diagram, layout, list, shape, tag, title. Une référence se nomme
`ref-NN-<slug>` et porte le même id dans `systems/` (ses tokens) et `decks/` (sa reconstitution).

**Médias** — où un pattern est censé servir : slide, web, email, print, social. C'est une INTENTION de
routage, pas une garantie de rendu : la faisabilité sur une cible contrainte se PROUVE avec
`node bin/emit.mjs <id> --target email` (ou `print`), qui refuse ce que la cible ne sait pas
rendre. Filtrer : `node bin/search.mjs --media email`.

## Catalogue

| pattern | ce que ça fait | médias | bench | référence |
|---|---|---|---|---|
| `card-01-ghost-icon` | Asséner UN seul argument sur toute une largeur, avec une icône énorme mais presque invisible qui donne du volume sans voler l'attention au titre. | slide social web | — | ref-02-ghost-icon-claim |
| `card-02-notched-brief` | Porter une catégorie nommée et son explication sur un aplat neutre, en rangée, sans jamais rivaliser avec la vignette d'accent posée à côté. | slide web | 10 | ref-06-orange-notched |
| `card-03-stat-accent` | Faire porter UN chiffre par un aplat d'accent chanfreiné, avec son cadrage (micro-libellé au-dessus) et son commentaire (corps collé en bas), de façon à ce que le chiffre se lise avant le texte. | slide social web | 12 | ref-06-orange-notched |
| `card-04-stat-barchart` | Porter UN KPI de premier rang (un total et sa tendance) sur un aplat noir, en-tête calé en haut et chiffre + mini-histogramme collés en bas, de façon à ce que le nombre se lise avant tout. | slide web | 10 | ref-11-finance-dashboard-mint |
| `card-05-balance-gauge` | Montrer un solde et sa progression dans un grand panneau menthe : une jauge « compteur » (part acquise en plein, part restante en hachures) surmonte un chiffre héros posé en bas, la tendance en regard. | slide web | 10 | ref-11-finance-dashboard-mint |
| `card-06-forecast-timeline` | Raconter une trajectoire dans une carte : une timeline verticale de jalons datés à gauche, et à droite deux sous-cartes teintées qui opposent la valeur constatée (menthe, présent) à la projection (lilas, futur). | slide web | 10 | ref-11-finance-dashboard-mint |
| `card-07-transactions` | Poser un intitulé de flux (badge + titre + acteurs) en haut d'une carte blanche et sa ligne de valeur unique sur aplat doux collée en bas, sans jamais faire de la carte un tableau. | slide web | 8 | ref-11-finance-dashboard-mint |
| `card-08-orb-chain-total` | Poser un total en chiffre héros et le décomposer juste en dessous en une chaîne de disques tangents dont un seul — le plus gros et le seul coloré — porte le support principal, les actions empilées à l'opposé. | slide web | 10 | ref-13-glass-fintech-dashboard |
| `card-09-gradient-metric-curve` | Faire de la seule carte colorée d'un écran le porteur d'un indicateur unique : la pile libellé / chiffre / cadrage en haut-gauche, une courbe sans axe qui traverse la carte derrière elle, annotée à ses deux extrémités seulement. | slide web | 10 | ref-13-glass-fintech-dashboard |
| `card-10-kpi-notch-tile` | Poser UNE preuve chiffrée dans une vignette presque carrée à silhouette de ticket — tuile d'icône en haut, chiffre et son suffixe sur la même ligne de base, libellé collé dessous, commentaire relégué en bas à droite — et n'en accentuer qu'une seule dans la rangée, par le fond et rien d'autre. | slide social web | 20 | ref-15-lilac-notched-kpi |
| `card-11-corner-arrow-tile` | Faire d'un module une ENTRÉE cliquable sans bouton ni liseré : le titre en haut à gauche, une flèche oblique ancrée au coin opposé — jamais alignée sur le titre — et l'illustration qui occupe tout le bas de la vignette au lieu d'être centrée dedans. | web slide | 17 | ref-17-mono-bento-legal |
| `card-12-inverted-kpi-row` | Ouvrir un tableau de bord par trois indicateurs de même nature dont UN SEUL est de premier rang, en lui appliquant deux fois le même geste de hiérarchie : l'aplat inversé ET une colonne 5 % plus large. Chaque carte range ses quatre informations dans le même ordre — libellé en haut, pastille de renvoi ancrée au coin opposé, chiffre poussé en bas, note collée dessous. | web slide | 16 | ref-18-lime-sales-dashboard |
| `card-13-email-figure-band` | Poser trois indicateurs de même nature en une bande dans un mail, sans aplat de carte ni encadrement : les colonnes sont des cellules à largeur en pourcentage sur une table à disposition fixe — la seule répartition en parts égales qu'Outlook respecte — et les séparateurs sont des filets de cellule, pas des colonnes intercalaires. La couleur ne fait qu'une chose : elle porte les chiffres. | email | 17 | ref-04-swiss-investor-blue |
| `chart-01-stadium-bars` | Un histogramme réduit à l'essentiel : des barres à sommet en demi-cercle, aucune ligne d'axe, des légendes en pilules. | slide social web | — | ref-03-bento-dark-pitch |
| `chart-02-isotype` | Raconter une proportion en unités comptables (24 pictogrammes sur 40) au lieu d'un pourcentage abstrait. | slide web | — | ref-03-bento-dark-pitch |
| `chart-03-accent-column-callout` | Donner la forme d'une série en quelques colonnes flottantes sans axe ni graduation, et n'en chiffrer qu'une seule — la courante — par une info-bulle sombre ancrée à sa colonne. | slide web | 11 | ref-13-glass-fintech-dashboard |
| `chart-04-unit-textured-bar` | Donner à un histogramme une UNITÉ visible sans lui faire porter le comptage : la hauteur de la barre est exactement proportionnelle à la valeur, la texture qui la remplit est un peigne dont la période vaut une unité déclarée, et le montant exact est écrit au-dessus — la texture donne l'échelle, elle ne compte jamais à la place du chiffre. | print slide social web | 9 | ref-16-cobalt-graph-paper |
| `chart-05-tile-heatmap` | Lire une matrice canal × période d'un seul coup d'œil, en faisant cohabiter DEUX échelles dans la même grille sans qu'elles se mélangent : une rampe de gris qui encode l'intensité (le noir est le maximum), et une couleur d'accent qui n'est PAS un cran de cette rampe mais une marque de catégorie posée par-dessus. Les cellules sont des tuiles arrondies largement espacées — jamais un damier jointif. | web slide | 16 | ref-18-lime-sales-dashboard |
| `diagram-01-layer-stack` | Montrer qu'un objet — un produit, une marque, un système logiciel — se décompose en couches ORDONNÉES dont le rang est l'information : des losanges isométriques empilés, d'opacité décroissante, chacun relié par un filet au nom de sa couche et à une ligne d'explication. | slide web | 15 | ref-14-layer-stack-coral |
| `diagram-02-branch-timeline` | Accrocher des objets de niveaux différents à une chronologie sans jamais tracer une diagonale : un rail horizontal daté, des jalons ronds accentués posés DESSUS, et des dérivations en équerre arrondie — descente verticale puis départ horizontal — qui mènent aux objets de la période. La diagonale dirait « transition » ; l'équerre dit « appartenance », et c'est la seule chose que ce diagramme a à dire. | web slide | 18 | ref-19-acid-clinical-timeline |
| `diagram-03-time-scrubber` | Donner à un écran sa position de lecture dans un axe plus long que lui : l'année entière tient dans une pilule claire — mois écrits, événements en pastilles rondes, comptage en exposant acide —, et une FENÊTRE SOMBRE À POIGNÉES posée dessus marque l'intervalle affiché au-dessus. La fenêtre reprend les mêmes pastilles en inverse : c'est ce qui dit qu'on regarde le même axe, et pas un second objet. | web | 18 | ref-19-acid-clinical-timeline |
| `layout-01-nested-bento` | Structurer une slide dense en trois niveaux (carte → sous-carte → tuile) sans une seule bordure ni ombre, en ne faisant décroître que le rayon et le padding. | slide web | — | ref-03-bento-dark-pitch |
| `layout-02-swiss-frame` | Poser le cadre d'une slide de deck : une marge unique, deux barres de micro-typo à trois zones et un filet d'un pixel — de quoi rendre une suite de slides reconnaissable sans y ajouter le moindre ornement. | slide web | — | ref-04-swiss-investor-blue |
| `layout-03-glass-board` | Emboîter les surfaces d'un écran dense en DEUX couches seulement, sans un trait ni une couleur de séparation : un fond en dégradé qui accueille, et des modules de blanc translucide posés dessus, flou d'arrière-plan compris. | slide web | 11 | ref-13-glass-fintech-dashboard |
| `layout-04-graph-paper-cells` | Faire d'une trame de papier millimétré le TON du fond, puis y poser des objets qui sont des cases de cette trame — pas de la matière posée dessus : le pas de la grille de cellules et la marge qui la centre sont des multiples entiers du pas de la trame, si bien que le contenu paraît découpé dans le papier. | print slide social web | 9 | ref-16-cobalt-graph-paper |
| `layout-05-nav-pill-bar` | Poser la navigation d'une page comme un OBJET posé dans la marge — un aplat arrondi qui flotte au lieu d'un bandeau collé au bord — et n'y employer qu'une seule ressource de hiérarchie : le rang de blanc, le badge de marque et le bouton d'action étant plus CLAIRS que la barre qui les porte. | web | 16 | ref-17-mono-bento-legal |
| `layout-06-bento-l-span` | Tenir cinq modules de tailles très différentes sur une VRAIE grille 3 × 3, en n'employant que deux enjambements — un vertical à gauche, un horizontal à droite — qui se CROISENT sans jamais se chevaucher : c'est ce croisement qui supprime toute frontière horizontale continue et fait qu'un écran dense cesse de se lire comme un tableau. | web slide | 17 | ref-17-mono-bento-legal |
| `layout-07-icon-rail-shell` | Poser le cadre d'un tableau de bord en ne dépensant AUCUNE couleur pour la navigation : un rail d'icônes étroit du même blanc que l'application — séparé par un filet d'un pixel et jamais par un aplat —, un en-tête à recherche en pilule, et un titre de page qui est le seul très grand corps de l'écran. Tout le budget de couleur reste disponible pour les données. | web | 16 | ref-18-lime-sales-dashboard |
| `layout-08-sheet-handle-tab` | Ouvrir un dossier par-dessus une application sans que la modale se lise comme « une carte de plus » : un voile sombre qui PORTE de l'interface (onglets, fermeture), une feuille claire qui saigne à quelques pixels des bords, et un onglet-poignée titré soudé à cette feuille par DEUX congés concaves — la seule courbe inversée du corpus, et ce qui fait que la poignée appartient à la feuille au lieu de flotter au-dessus d'elle. | web | 17 | ref-19-acid-clinical-timeline |
| `layout-09-email-envelope` | Poser la coquille d'un mailing avec ce que le moteur Word d'Outlook sait réellement rendre : une table de garde pleine largeur qui porte le fond, une colonne de 600 px centrée qui porte tout le contenu, et l'espacement entièrement délégué au padding des cellules — jamais à une gouttière, une position ou un calcul. Les trois zones (bandeau, corps, pied) sont trois aplats PLEINS et différents, ce qui est à la fois la signature de la charte et le seul modèle de hiérarchie qu'un client mail rende à l'identique partout. | email | 18 | ref-04-swiss-investor-blue |
| `layout-10-bleed-column-inset` | Faire porter une slide entière par les IMAGES, sans marge ni carte : deux photos à fond perdu qui touchent les quatre bords de la scène, séparées par une COUTURE unique de la couleur de page — jamais une gouttière symétrique —, et une troisième image beaucoup plus petite posée par-dessus l'une d'elles, sans partager une seule arête avec le lit. C'est cette incrustation flottante, et elle seule, qui donne de la profondeur à une composition entièrement plate. | slide web | 16 | ref-10-campaign-board-red |
| `list-01-giant-numbers` | Aligner trois à quatre arguments de même rang en colonnes, chacun ouvert par un numéro ou un chiffre démesuré qui sert à la fois de repère de lecture et de seule tache de couleur du bloc. | slide web | — | ref-04-swiss-investor-blue |
| `list-02-ruled-index` | Lister les sections d'un document en donnant à chacune son libellé, une ligne d'explication et son numéro à droite, séparées par un filet fin qui appartient à l'entrée qu'il suit. | slide web | 9 | ref-06-orange-notched |
| `list-03-two-column-toc` | Faire tenir un sommaire de dix à quatorze sections sur une seule slide, en deux colonnes numérotées, lisible d'un coup d'œil et refermable aussitôt. | slide web | — | ref-04-swiss-investor-blue |
| `list-04-due-rows` | Rendre une liste d'échéances balayable sans un seul filet : quatre zones tenues par une grille commune, une seule ligne surlignée, une seule pilule d'imminence, et le montant en unique colonne alignée à droite. | slide web | 12 | ref-13-glass-fintech-dashboard |
| `list-05-vitals-strip` | Aligner cinq mesures hétérogènes sur une seule ligne SANS aucun séparateur : chacune est un couple micro-libellé / valeur, l'unité étant un cran plus petite ET plus claire que le nombre qu'elle suit. C'est ce double affaiblissement de l'unité — taille et encre — qui permet de lire cinq valeurs d'affilée sans filet, sans carte et sans que l'œil confonde un nombre avec l'unité de son voisin. | web slide | 14 | ref-19-acid-clinical-timeline |
| `list-06-email-digest` | Aligner les trois à six entrées d'une lettre d'information dans un mail, chacune tenant en rubrique, titre, chapô et lien, sans qu'aucune ne se lise comme un encadré : la colonne du numéro est une CELLULE de largeur fixe et la séparation un filet posé en haut de chaque entrée — retiré sur la première, pour que le filet sépare au lieu d'encadrer. | email | 16 | ref-04-swiss-investor-blue |
| `shape-notched-corner` | Donner à un aplat coloré une signature de forme reconnaissable — UN coin coupé à 45° — sans rien ajouter au contenu ni recourir à un rayon, une ombre ou un liseré. | slide web | 3 | ref-06-orange-notched |
| `tag-01-gooey-capsule` | Faire d'un mot-clé un OBJET : un contour continu qui soude un cercle de glyphe à une pilule de texte par deux congés concaves, pour qu'un terme isolé pèse autant qu'un titre sans être plus gros. | slide social web | 13 | ref-12-neon-capsule-tags |
| `tag-02-centered-cloud` | Poser une dizaine de mots-clés de même rang au bas d'un module sans en faire une liste : chaque RANGÉE est centrée sur elle-même, si bien que les lignes de largeur inégale dessinent une silhouette de nuage — c'est le centrage par rangée, et pas le centrage du bloc, qui produit l'effet. | web slide | 13 | ref-17-mono-bento-legal |
| `tag-03-action-pill-bar` | Aligner filtres et action principale sur une même ligne sans hiérarchie typographique : toutes les commandes sont des pilules de MÊME hauteur, les filtres portent un puits d'icône plus clair que la pilule qui le contient, et UNE SEULE pilule — la dernière — est pleine. C'est la position et le remplissage qui disent le rang, jamais la taille. | web | 16 | ref-18-lime-sales-dashboard |
| `title-01-leading-rule` | Marquer le titre d'une slide d'un filet vertical d'accent sans ajouter ni couleur au texte ni élément décoratif : le filet est le seul accent du titre, et il est collé au mot. | slide web | 7 | ref-06-orange-notched |
| `title-02-condensed-overlay-stack` | Tenir une slide entière avec du TEXTE SEUL — aucun aplat, aucun trait, aucune boîte — en posant trois blocs sur la scène : un titre condensé noir à l'interligne écrasé, le numéro de section entre parenthèses au MÊME fer que lui mais à l'autre bout de la colonne, et un contrepoids en micro-capitales au coin diagonalement opposé. Le cadre est transparent : il se pose par-dessus des images sans rien leur enlever. | slide web | 21 | ref-10-campaign-board-red |

## Détail

### card

**card-01-ghost-icon** — Carte-argument à icône fantôme

- employer : Bloc de réassurance ou de promesse produit (confidentialité, garantie, engagement) sur une landing ou une slide. Un argument par carte, jamais deux.
- éviter : Il y a plus d'une idée à faire passer, ou l'icône doit être comprise (ici elle est décorative). Pour une rangée de 3 bénéfices, prendre un pattern de grille, pas celui-ci.
- à remplir : icon, title, subtitle
- variables : --vl-surface, --vl-ghost, --vl-ink, --vl-muted, --vl-ghost-size, --vl-gutter
- tags : carte, argument, reassurance, icone, confidentialite, landing, hero, monochrome, claim

**card-02-notched-brief** — Carte chanfreinée de second rang

- employer : Deux à trois segments, audiences, motions commerciales ou options présentés côte à côte — typiquement à droite d'une vignette statistique qui, elle, porte le chiffre.
- éviter : Il n'y a qu'une seule carte (le second rang n'a plus de premier rang à côté, l'aplat neutre n'y sert à rien), ou l'explication dépasse quatre lignes — ce n'est plus un libellé commenté, c'est un paragraphe qui mérite sa colonne.
- à remplir : label, body
- variables : --vl-steel, --vl-black, --vl-ink-on-steel, --vl-notch
- .pptx : `kit/vl_pptx.py:brief_card`
- tags : carte, segment, audience, categorie, chanfrein, notch, second-rang, rangee, deck, libelle

**card-03-stat-accent** — Vignette statistique sur accent

- employer : Preuve chiffrée d'une slide : croissance, volume livré, part de marché. Une seule par slide, posée en tête de rangée ou en recouvrement du bas d'une photo pour ancrer l'accent.
- éviter : Le chiffre a besoin d'être comparé à d'autres (il faut un graphique), il n'y a pas de commentaire à mettre (la vignette se vide et le chanfrein devient un ornement seul), ou le texte descend sous 16 px — sur cet orange le contraste ne tient plus (3,4:1, valable seulement en grand corps).
- à remplir : kicker, figure, arrow, body
- variables : --vl-orange, --vl-white, --vl-ink-muted-invert, --vl-notch
- .pptx : `kit/vl_pptx.py:stat_block`
- tags : stat, chiffre, kpi, vignette, carte, accent, chanfrein, notch, flèche, deck, preuve

**card-04-stat-barchart** — Carte statistique à barres empilées

- employer : Carte d'accroche d'un dashboard ou d'une slide produit : le chiffre du mois et sa décomposition sur deux à quatre périodes. L'aplat noir la pose en premier rang face aux cartes blanches autour.
- éviter : Il faut comparer des valeurs précises entre séries (le sommet arrondi et l'absence d'axe faussent la lecture fine — passer à un vrai graphique gradué), ou il n'y a pas de tendance à montrer : sans les barres, la carte n'est plus qu'un chiffre isolé.
- à remplir : title, kicker, figure, bars
- variables : --vl-surface-dark, --vl-mint, --vl-lilac, --vl-radius-card
- tags : carte, stat, kpi, histogramme, barres, empile, dashboard, noir, premier-rang, menthe, lilas

**card-05-balance-gauge** — Carte solde à jauge compteur

- employer : Carte centrale d'un dashboard où un montant unique doit dominer ET porter une notion d'avancement vers un objectif. Le panneau teinté plein la distingue des cartes de détail.
- éviter : Il n'y a pas de progression à raconter (la jauge devient un ornement — un simple grand chiffre suffit), ou il faut plusieurs séries : une jauge ne lit qu'un ratio à la fois.
- à remplir : title, nav, gauge, trend, figure
- variables : --vl-mint, --vl-mint-deep, --vl-ink, --vl-lilac-deep, --vl-radius-sub
- tags : carte, solde, jauge, compteur, gauge, progression, dashboard, menthe, panneau, chiffre-hero

**card-06-forecast-timeline** — Carte prévision — timeline + sous-cartes

- employer : Carte « perspective » d'un dashboard : quelques jalons dans le temps plus deux chiffres clés, l'un acquis l'autre projeté. Le code couleur menthe/lilas fait lire présent vs futur sans légende.
- éviter : Il y a plus de cinq ou six jalons (les points se resserrent et la colonne devient illisible — passer à une frise horizontale), ou un seul chiffre à montrer : les deux sous-cartes n'ont alors plus d'opposition à porter.
- à remplir : head, timeline, tile-present, tile-forecast
- variables : --vl-mint, --vl-lilac, --vl-hairline, --vl-ink, --vl-radius-sub
- tags : carte, prevision, forecast, timeline, frise, jalons, sous-cartes, dashboard, menthe, lilas, projection

**card-07-transactions** — Carte transaction — identité + ligne de valeur

- employer : Bloc « dernière opération » ou « flux en cours » d'un dashboard : une identité, un groupe d'acteurs, une seule paire chiffrée. La pile d'avatars qui se recouvre signale un échange entre plusieurs parties.
- éviter : Il y a plus d'une ligne de valeur à montrer : au-delà d'une, ce n'est plus cette carte mais une LISTE, qui demande un séparateur et un rythme propres. Et sans acteurs à représenter, la pile d'avatars devient un ornement vide.
- à remplir : badge, title, avatars, value-row
- variables : --vl-surface-soft, --vl-surface-dark, --vl-lilac, --vl-radius-card
- tags : carte, transaction, avatars, pile, flux, dashboard, blanc, ligne-valeur, crypto

**card-08-orb-chain-total** — Solde total en chaîne d'orbes

- employer : Un montant unique domine l'écran ET se répartit sur 3 à 4 supports qu'il faut montrer d'un coup d'œil, avec une action primaire à offrir dans le même bloc.
- éviter : Les parts ne somment pas au total affiché (la chaîne devient un ornement mensonger), ou il y a plus de quatre supports : au-delà, les disques rétrécissent sous le corps lisible et un tableau fait mieux.
- à remplir : label, figure, fx, orbs, actions
- variables : --vl-surface-glass, --vl-surface-glass-strong, --vl-violet, --vl-violet-deep, --vl-violet-halo, --vl-surface-dark
- tags : carte, solde, total, orbe, disque, chaine, repartition, dashboard, verre, action-primaire, chiffre-hero

**card-09-gradient-metric-curve** — KPI sur aplat coloré à courbe annotée

- employer : Un indicateur de premier rang doit émerger d'un tableau de bord par ailleurs neutre, et sa trajectoire compte autant que sa valeur du jour.
- éviter : Deux indicateurs se disputent le premier rang (deux cartes colorées et il n'y en a plus aucune), ou les valeurs intermédiaires doivent être lisibles : ici la courbe n'a ni axe ni grille, elle donne une forme, pas des chiffres.
- à remplir : label, figure, sub, action, curve, tags
- variables : --vl-blue, --vl-blue-light, --vl-ink-invert, --vl-ink-invert-muted, --vl-surface-glass-soft
- tags : carte, kpi, indicateur, courbe, sparkline, degrade, aplat, annotation, trajectoire, dashboard, premier-rang

**card-10-kpi-notch-tile** — Vignette de preuve chiffrée à double chanfrein

- employer : Bande de trois à quatre preuves de même rang sur une landing ou une slide « pourquoi nous » : taux, gain de temps, volume. Une seule vignette prend la variante `--accent`, celle qu'on veut faire lire en premier.
- éviter : Il n'y a qu'un chiffre à montrer (la rangée n'existe plus, et l'accent n'a plus rien à surpasser), le commentaire dépasse deux lignes courtes (il rejoint le libellé et le décalage à droite devient illisible), ou plusieurs vignettes sont colorées — deux accents dans une rangée annulent le seul geste de hiérarchie du système.
- à remplir : tile, num, suffix, label, note
- variables : --vl-card, --vl-violet, --vl-violet-light, --vl-ink, --vl-ink-muted, --vl-tile, --vl-tile-invert, --vl-notch, --vl-radius
- tags : stat, chiffre, kpi, pourcentage, vignette, carte, rangee, accent, chanfrein, notch, icone, tuile, landing, preuve, saas

**card-11-corner-arrow-tile** — Vignette d'entrée à flèche de coin

- employer : Grille de services, sommaire de rubriques, tuiles d'entrée d'un accueil : trois à cinq vignettes de même rang dont chacune mène ailleurs. Le titre tient sur deux lignes courtes, l'illustration porte la respiration, et la flèche est le seul signe d'interaction de l'écran.
- éviter : La vignette porte un chiffre (elle devient une carte de KPI, cf. card-10-kpi-notch-tile : le chiffre veut l'aplomb du bas, l'illustration aussi, et les deux ne cohabitent pas), le titre dépasse trois lignes (il rejoint la flèche et le coin cesse d'être libre), ou la vignette n'est pas cliquable — une flèche qui ne mène nulle part est un mensonge d'interface.
- à remplir : title, art, sub
- variables : --vl-module, --vl-ink, --vl-ink-soft, --vl-line, --vl-radius-module
- tags : vignette, carte, tuile, entree, service, rubrique, fleche, arrow, coin, illustration, bento, accueil, landing, monochrome

**card-12-inverted-kpi-row** — Rangée de KPI dont un seul est inversé — et plus large

- employer : Bandeau d'ouverture d'un tableau de bord ou d'un rapport : trois à quatre valeurs comparables (un solde, un revenu, un volume) dont une seule commande l'attention. Le chiffre est court — quatre à six signes — et la note tient sur une ligne.
- éviter : Les valeurs ne sont pas comparables entre elles (la rangée suggère une lecture de gauche à droite qui n'existe pas), il y en a plus de quatre (la carte inversée cesse de dominer et la largeur différenciée devient un défaut d'alignement), ou plusieurs cartes doivent être mises en avant — deux aplats inversés dans une rangée annulent le seul geste de hiérarchie du système.
- à remplir : label, go, fig, note
- variables : --vl-module, --vl-invert, --vl-ink, --vl-ink-soft, --vl-on-invert, --vl-on-invert-soft, --vl-ramp-2, --vl-radius-module, --vl-gutter
- tags : kpi, chiffre, stat, rangee, dashboard, tableau-de-bord, carte, inverse, hierarchie, solde, revenu, accent, renvoi

**card-13-email-figure-band** — Bande de trois chiffres pour un mail — colonnes en cellules, filets d'un pixel

- employer : Ouvrir ou clore une lettre d'information par trois valeurs comparables (un encours, une variation, un horizon) que le lecteur doit pouvoir saisir sans lire le corps. Le chiffre est court — six signes au plus — et son libellé tient sur une ligne.
- éviter : Les valeurs ne sont pas comparables (la bande impose une lecture de gauche à droite qui n'existe pas), il y en a plus de trois (au-delà, les colonnes tombent sous 120 px et les chiffres se coupent sur mobile), ou la lettre est déjà dense en chiffres — une bande de chiffres au milieu d'un texte de chiffres ne hiérarchise plus rien.
- à remplir : label, fig, note
- variables : --vl-white, --vl-black, --vl-blue, --vl-ink-muted
- tags : email, mailing, newsletter, chiffre, kpi, indicateur, bande, colonnes, filet, outlook, table, stat, resume

### chart

**chart-01-stadium-bars** — Barres à sommet arrondi

- employer : Trois à six valeurs d'une même série sur un axe temporel, dans un deck. La progression doit se voir en une seconde, sans lecture de grille.
- éviter : Il faut comparer plusieurs séries, lire des valeurs précises, ou les écarts sont faibles — le sommet arrondi mange quelques pixels de hauteur et fausse la comparaison fine. Dans ce cas : barres droites et axe gradué.
- à remplir : values, bars, axis
- variables : --vl-accent, --vl-accent-2, --vl-accent-3, --vl-surface-tile
- tags : graphique, barres, histogramme, dataviz, deck, revenus, progression, arrondi, axe

**chart-02-isotype** — Isotype à taux de remplissage

- employer : Une part qui porte sur des ÊTRES ou des OBJETS dénombrables — clients, sièges, sites, jours. Le lecteur voit la quantité avant de lire le chiffre.
- éviter : La grandeur est continue (chiffre d'affaires, température, durée) : il n'y a rien à compter. Et au-delà d'environ 60 pictogrammes plus personne ne compte — passer à une barre.
- à remplir : figure, label, grid
- variables : --vl-accent-2, --vl-surface-light
- tags : graphique, isotype, pictogramme, proportion, pourcentage, dataviz, comptage, part

**chart-03-accent-column-callout** — Histogramme à colonne accentuée et info-bulle

- employer : Une série courte (4 à 7 périodes) sert de contexte à UNE valeur qui, elle, doit être lue exactement : mois en cours, dernier trimestre, pic à commenter.
- éviter : Plusieurs valeurs doivent être lues précisément (il faudrait autant d'info-bulles, et l'accent perd tout sens), ou les écarts entre colonnes sont faibles : sans axe, un écart de 5 % ne se voit pas.
- à remplir : title, period, columns, callout
- variables : --vl-surface-glass, --vl-surface-glass-strong, --vl-blue, --vl-blue-light, --vl-surface-dark
- tags : histogramme, barres, colonnes, accent, info-bulle, tooltip, serie, periode, dashboard, sans-axe, verre

**chart-04-unit-textured-bar** — Barre à unité déclarée

- employer : Sur une comparaison de deux à quatre montants dont l'écart EST le message (coût cumulé, budget, dette), quand le lecteur doit sentir l'ordre de grandeur avant de lire les chiffres. Excellent sur une charte à deux couleurs, où la texture remplace l'aplat plein sans rien coûter en palette.
- éviter : Au-delà de quatre barres — le peigne devient du bruit moiré ; sur une série temporelle, où l'unité de l'axe suffit ; ou quand la plus petite valeur descend sous deux périodes, la texture disparaissant alors dans un trait plein qui MENT sur l'échelle (un benchmark le refuse).
- à remplir : [object Object], [object Object], [object Object]
- variables : --vl-utb-period, --vl-ink, --vl-ink-faint, --vl-paper, --vl-near, --vl-rule
- tags : histogramme, barres, unité, échelle, texture, peigne, coût, comparaison, cumulé, isotype, deux couleurs, monochrome

**chart-05-tile-heatmap** — Heatmap en tuiles arrondies, rampe achromatique + marque de catégorie

- employer : Matrice de quatre à six lignes sur quatre à huit colonnes dont on veut la SILHOUETTE et non les valeurs : performance par canal et par semaine, densité d'activité, couverture. Les libellés de lignes vivent hors de la grille, à gauche, sans filet de séparation.
- éviter : Le lecteur doit relire une valeur précise (une heatmap ne se lit pas au chiffre près — il faut un tableau), la matrice dépasse huit colonnes (les tuiles deviennent des traits et le rayon n'a plus de sens), ou l'intensité est déjà encodée par une couleur : deux échelles chromatiques dans une même grille sont indémêlables, et c'est exactement ce que l'achromatisme de la rampe évite ici.
- à remplir : title, sub, tools, rows, cells
- variables : --vl-module, --vl-app, --vl-ramp-1, --vl-ramp-2, --vl-ramp-3, --vl-ramp-4, --vl-ramp-5, --vl-accent, --vl-ink, --vl-ink-soft, --vl-radius-tile
- tags : heatmap, matrice, grille, intensite, rampe, canal, dashboard, tuile, categorie, accent, achromatique, densite

### diagram

**diagram-01-layer-stack** — Pile de couches isométriques légendées

- employer : Trois à cinq couches, un ordre qui compte (ce qu'on touche en haut, ce qui porte en bas), et une phrase à dire sur chacune : interface / services / données, essence / valeur / vision, produit / méthode / recherche.
- éviter : Les éléments sont de même rang (une pile dit une hiérarchie, même quand on ne la pense pas), leur nombre dépasse cinq (les losanges du bas s'effacent avant d'être comptés), ou une grandeur doit se lire : ici rien n'est proportionnel à rien — c'est un schéma, pas un graphique.
- à remplir : name, note
- variables : --vl-coral, --vl-layer-alpha-1, --vl-layer-alpha-2, --vl-layer-alpha-3, --vl-ink, --vl-ink-muted, --vl-hairline, --vl-track-title, --vl-track-body
- .pptx : `kit/vl_pptx.py:layer_stack`
- tags : schema, diagramme, couches, layers, pile, empilement, isometrique, losange, architecture, stack, frontend, backend, hierarchie, filet, legende, opacite, profondeur

**diagram-02-branch-timeline** — Timeline à branches en équerre

- employer : Historique d'un dossier où chaque période porte plusieurs objets hétérogènes (un traitement, une mesure, un examen) : la position sur le rail donne la date, l'équerre donne le rattachement, et la taille de l'objet dérivé donne son rang. Deux à quatre branches par vue.
- éviter : Les objets sont tous de même nature et de même rang (une simple liste datée est plus lisible), les dates doivent être proportionnelles (rien ici n'est à l'échelle du temps : c'est une structure, pas un graphique), ou il y a plus de cinq branches — les équerres se croisent et l'appartenance redevient illisible.
- à remplir : rail, pins, branches, objects
- variables : --vl-sheet, --vl-accent, --vl-veil-deep, --vl-ink, --vl-ink-soft, --vl-module, --vl-module-hi, --vl-recover, --vl-alert
- tags : timeline, chronologie, branche, equerre, rail, jalon, historique, dossier, structure, derivation, diagramme

**diagram-03-time-scrubber** — Ruban temporel à fenêtre de sélection

- employer : Sous une vue détaillée qui ne montre qu'une tranche d'un historique long : dossier, journal, calendrier de production. L'axe entier reste lisible, la tranche courante est désignée, et le lecteur sait toujours où il est sans changer d'écran.
- éviter : L'axe tient entièrement dans la vue (le ruban ne désigne alors plus rien), les événements sont trop nombreux pour être des pastilles distinctes (il faut une densité, pas des objets), ou la sélection n'est pas déplaçable — des poignées qui ne se saisissent pas sont un mensonge d'interface.
- à remplir : now, scale, window
- variables : --vl-module-hi, --vl-module, --vl-veil-deep, --vl-accent, --vl-ink, --vl-ink-soft, --vl-on-veil
- tags : timeline, ruban, scrubber, brush, navigateur, selection, fenetre, axe, historique, mois, evenement, poignee, minimap

### layout

**layout-01-nested-bento** — Bento à cartes imbriquées

- employer : Slide de chiffres ou de preuves où il faut caser 4 à 8 informations sans que ça ressemble à un tableau. C'est le squelette par défaut d'un deck investisseur moderne.
- éviter : Il n'y a qu'une seule idée sur la slide — l'imbrication crée alors une hiérarchie qui ne correspond à rien. Et sur un support imprimé en petit format, les tuiles descendent sous le seuil de lisibilité.
- à remplir : title, body, tiles
- variables : --vl-radius-card, --vl-radius-sub, --vl-radius-tile, --vl-gap
- tags : bento, layout, slide, cartes, imbrication, rayon, hierarchie, deck, investisseur, grille

**layout-02-swiss-frame** — Cadre suisse header / footer

- employer : Deck de plus de trois slides qui doit tenir comme un document : le header rappelle la section, le footer numérote. C'est aussi ce qui autorise les fonds pleins à alterner sans que le deck se disloque.
- éviter : Slide unique, visuel de réseau social, ou support projeté de loin : à 8 px les barres ne se lisent pas, elles ne sont là que pour tenir la page.
- à remplir : mark, section, meta, body, footer-left, footer-center, footer-right
- variables : --vl-hairline, --vl-hairline-invert, --vl-white, --vl-blue, --vl-ink-muted
- tags : layout, cadre, header, footer, deck, slide, suisse, filet, micro-typo, grille, marge

**layout-03-glass-board** — Écran en verre dépoli — fond dégradé + modules

- employer : Dashboard, écran produit ou slide de démo où l'on veut de la profondeur sans ajouter de matière graphique — et où le fond doit rester visible à travers les modules (c'est lui qui donne la couleur de l'ensemble).
- éviter : Le support ne rend pas le flou d'arrière-plan (export .pptx, mailing, impression) : le verre s'aplatit en deux gris presque identiques et toute la hiérarchie disparaît. Éviter aussi sur un fond uni — sans dégradé derrière, le dépoli ne se voit pas.
- à remplir : modules, sub
- variables : --vl-grad-1, --vl-grad-3, --vl-surface-glass, --vl-surface-glass-strong, --vl-sheen, --vl-blur, --vl-margin
- tags : ecran, verre, glassmorphism, depoli, flou, backdrop, degrade, deux-couches, dashboard, translucide, profondeur

**layout-04-graph-paper-cells** — Papier millimétré et ses cases

- employer : Quand le sujet se compte en unités discrètes — demi-journées, sièges, jours, tickets, sites — et qu'on veut que le fond le dise avant le texte. Aussi comme socle de deck : la trame reste sur toutes les slides et fait la reconnaissance d'une slide à l'autre sans qu'aucun ornement ne soit ajouté.
- éviter : Quand le sujet est continu (une courbe, un flux, une durée), quand la charte a déjà un motif — deux trames se battent et aucune ne gagne — ou dès que du texte de lecture devrait passer PAR-DESSUS la trame à plus de ~14 % d'opacité : le fond ne réduit jamais la lisibilité du premier plan, c'est la seule loi que ce pattern peut faire tomber.
- à remplir : [object Object], [object Object], [object Object]
- variables : --vl-grid, --vl-grid-step, --vl-cell-pitch, --vl-cell-gap, --vl-paper, --vl-paper-2, --vl-ink, --vl-ink-faint, --vl-near, --vl-rule, --vl-margin
- tags : papier millimétré, graph paper, trame, grille, fond, calendrier, demi-journée, case, cellule, isotype, deux couleurs, monochrome, verdict, trois états

**layout-05-nav-pill-bar** — Barre de menu en pilule flottante

- employer : En-tête d'une landing ou d'une application dont le fond est déjà clair, quand la navigation ne doit pas se lire comme un chrome de navigateur : la barre reste dans la marge de page, à la même distance des bords que les modules qui la suivent, et le premier module commence juste dessous.
- éviter : La page défile sous un en-tête collant (une pilule flottante qui se fige au bord perd exactement ce qui la justifie), le fond est sombre ou photographique (le rang de blanc n'a plus de sens : le blanc devient la couleur la plus forte de l'écran), ou la navigation compte plus de cinq entrées — au-delà, les liens rattrapent le bouton et la respiration qui fait l'objet disparaît.
- à remplir : badge, mark, links, cta
- variables : --vl-module, --vl-object, --vl-ink, --vl-ink-soft, --vl-radius-bar, --vl-radius-pill
- tags : navigation, menu, barre, header, entete, pilule, landing, logo, wordmark, bouton, cta, monochrome, web, app

**layout-06-bento-l-span** — Bento 3 × 3 à deux enjambements en L

- employer : Accueil, sommaire de services, page d'entrée d'application : un contenu principal qui doit dominer sans occuper la moitié de l'écran, un contenu long à gauche (liste, nuage, sommaire), et deux entrées secondaires de même rang en haut. Le module dominant prend l'aplat inversé, et il est le SEUL.
- éviter : Les modules sont de même rang (une grille régulière dit alors la vérité et se refond sans douleur), le contenu du module haut à gauche varie beaucoup en longueur (l'enjambement vertical fige sa hauteur), ou l'écran doit se replier en une colonne sur mobile — les deux enjambements y perdent tout sens et il faut une autre composition, pas une adaptation de celle-ci.
- à remplir : a, b, c, hero, d
- variables : --vl-module, --vl-invert, --vl-ink, --vl-on-invert, --vl-gutter, --vl-radius-module
- tags : bento, grille, grid, layout, accueil, landing, dashboard, enjambement, span, module, monochrome, hierarchie, hero

**layout-07-icon-rail-shell** — Coque d'application à rail d'icônes

- employer : Application ou tableau de bord à navigation stable de six à dix entrées, sur fond clair : le rail donne l'accès, l'en-tête donne la recherche et le compte, le titre donne le contexte, et le contenu commence dessous en pleine largeur restante. L'entrée active est marquée par l'inversion, jamais par une teinte.
- éviter : La navigation a des libellés (le rail d'icônes seules devient illisible au-delà de huit entrées sans texte), l'application est sombre (le filet d'un pixel disparaît et il faut un vrai aplat de rail), ou la couleur de marque doit être visible en permanence — ce système la réserve aux données, et l'y ramener supprime sa seule règle.
- à remplir : nav, search, account, title, actions, content
- variables : --vl-app, --vl-module, --vl-hairline, --vl-invert, --vl-ink, --vl-ink-soft, --vl-on-invert, --vl-rail-w, --vl-radius-pill
- tags : coque, shell, rail, sidebar, navigation, dashboard, tableau-de-bord, recherche, header, entete, titre, application, icone

**layout-08-sheet-handle-tab** — Feuille modale à poignée soudée par congés concaves

- employer : Dossier, fiche détaillée ou vue plein écran ouverte depuis une liste, quand le contexte sous-jacent doit rester senti sans être lisible. Le voile accueille la navigation transverse (onglets de section, fermeture), la feuille accueille le contenu, et la poignée porte le titre de ce qu'on a ouvert.
- éviter : La feuille est blanche (les modules blancs qu'elle portera devront s'entourer d'un liseré, et le système n'en a nulle part), le voile ne porte rien (il redevient une simple opacité, et deux rectangles empilés suffisent), ou la vue est une PAGE et non une couche — la poignée dit « ceci est ouvert par-dessus », ce qui devient un mensonge sur une page de plein droit.
- à remplir : tabs, close, handle, content
- variables : --vl-veil, --vl-sheet, --vl-module-hi, --vl-ink, --vl-radius-sheet, --vl-notch, --vl-bleed
- tags : modale, sheet, feuille, voile, scrim, overlay, onglet, poignee, tab, congé, concave, dossier, fiche, application

**layout-09-email-envelope** — Enveloppe de mailing — garde, colonne de 600, trois aplats pleins

- employer : Toute lettre d'information ou mailing transactionnel à composer soi-même : c'est le squelette dans lequel on pose ensuite les blocs de contenu (list-06-email-digest, card-13-email-figure-band, tous deux calibrés sur le slot de 520 px). Le bandeau porte l'émetteur et le numéro d'édition, le pied porte les mentions et le désabonnement — deux zones qu'on ne peut pas omettre et qu'on réécrit sinon à chaque envoi.
- éviter : Le message est une page web déguisée (une landing dans un mail se lit mal et se coupe), il doit tenir plusieurs colonnes de contenu côte à côte au-delà de deux (elles ne s'empilent pas sur mobile sans requête de média, que la plupart des clients ignorent), ou la charte visée repose sur des rayons, des ombres ou des couleurs translucides — Outlook les rend en angles vifs, sans ombre et en couleur pleine, et le résultat n'est plus la charte.
- à remplir : wordmark, issue, kicker, title, body, cta, legal, unsub
- variables : --vl-bg, --vl-white, --vl-blue, --vl-black, --vl-ink-muted, --vl-ink-muted-invert
- tags : email, mailing, newsletter, lettre, coquille, gabarit, outlook, table, 600, bandeau, pied, desabonnement, bouton, cta, enveloppe

**layout-10-bleed-column-inset** — Lit d'images à fond perdu et incrustation

- employer : Slide de campagne, d'ouverture de chapitre ou de moodboard, où l'image EST le propos et le texte se pose dessus. Vaut aussi pour un hero web plein écran. La typographie ne fait pas partie de ce pattern : elle se pose par-dessus, avec title-02-condensed-overlay-stack.
- éviter : Les images n'ont pas de casting couleur commun — deux photos qui ne partagent aucune dominante à fond perdu se lisent comme deux slides collées, et la couture ne les rattrape pas. Écarter aussi quand il faut légender chaque image : ce lit n'a de place pour aucun texte sous les images, seulement dessus.
- à remplir : image-a, image-b, inset
- variables : --vl-slide, --vl-gutter
- tags : image, photo, collage, fond-perdu, bleed, incrustation, overlay, colonnes, hero, campagne, moodboard

### list

**list-01-giant-numbers** — Colonnes à numéro géant

- employer : Bas de slide : les trois causes d'un problème, les trois étapes d'une solution, les quatre chiffres d'une traction. Trois ou quatre colonnes ; à cinq, le numéro cesse d'être un repère et devient une texture.
- éviter : Les entrées ne sont pas de même rang (une hiérarchie déguisée en liste), ou chacune demande plus de trois lignes de texte : ce n'est alors plus une liste, c'est une section.
- à remplir : num, body
- variables : --vl-blue, --vl-hairline, --vl-hairline-invert, --vl-ink-muted
- tags : liste, numerotation, colonnes, chiffre, kpi, argument, deck, slide, filet, suisse, etapes

**list-02-ruled-index** — Sommaire à filets numérotés

- employer : Sommaire d'un deck ou d'une proposition, 3 à 6 entrées, en colonne de droite face au titre. Aussi valable pour une liste d'étapes ou de livrables numérotés.
- éviter : Plus de 6 entrées (les filets deviennent une trame et plus personne ne lit), ou les entrées n'ont pas d'explication — une liste de libellés nus n'a pas besoin de cette structure, un simple empilement suffit.
- à remplir : label, desc, number
- variables : --vl-hairline, --vl-black, --vl-ink-muted
- tags : sommaire, index, toc, liste, filet, numero, hairline, deck, etapes

**list-03-two-column-toc** — Sommaire numéroté 2 colonnes

- employer : Deck long qu'on présente à quelqu'un qui doit savoir combien de temps ça va durer : investisseur, comité, client. Idéalement 10 à 14 entrées.
- éviter : Moins de huit entrées (une seule colonne suffit et la deuxième sonne creux), ou entrées de longueur très inégale : à 11 px en capitales, une entrée qui passe sur deux lignes casse l'alignement des filets.
- à remplir : head, note, entries
- variables : --vl-blue, --vl-hairline-invert, --vl-ink-muted-invert
- tags : sommaire, toc, agenda, numerotation, colonnes, deck, slide, navigation, filet, suisse

**list-04-due-rows** — Liste d'échéances à quatre zones

- employer : Trois à six échéances, abonnements ou factures à venir, où l'œil doit trouver l'urgente et comparer les montants sans lire les lignes.
- éviter : Il faut plus de quatre informations par ligne (c'est un tableau qu'il faut, avec ses en-têtes), ou plus d'une ligne est urgente : la pilule d'imminence ne code quelque chose que tant qu'elle est unique.
- à remplir : title, action, rows
- variables : --vl-surface-glass, --vl-surface-glass-strong, --vl-blue, --vl-surface-dark, --vl-ink-muted
- tags : liste, echeances, paiements, abonnements, lignes, grille, montant, imminence, surlignage, dashboard, verre

**list-05-vitals-strip** — Bandeau de constantes, sans carte ni filet

- employer : Bandeau d'état en tête d'une fiche : constantes d'un patient, indicateurs d'une machine, chiffres-clés d'un dossier. La première mesure peut être qualitative et prendre un corps plus grand — c'est le sujet de la fiche, pas une valeur de plus.
- éviter : Les valeurs sont comparables entre elles (une rangée de cartes ou un tableau dit mieux la comparaison), il y en a plus de six (le bandeau se met à défiler et perd son unique atout, la lecture d'un seul coup d'œil), ou l'une d'elles est en alerte : ce bandeau n'a aucune ressource pour le dire, et l'y ajouter demande une couleur que le système réserve ailleurs.
- à remplir : items
- variables : --vl-ink, --vl-ink-soft
- tags : constantes, vitals, bandeau, strip, mesure, unite, micro-libelle, fiche, dossier, kpi, sans-filet

**list-06-email-digest** — Digest de newsletter — entrées numérotées séparées par un filet

- employer : Le corps d'une lettre d'information périodique : plusieurs sujets de même rang, chacun résumé en deux lignes et renvoyant vers un article. Le numéro donne un ordre de lecture explicite, ce qui vaut mieux qu'un tri implicite quand tous les titres pèsent le même poids.
- éviter : Une seule entrée (le numéro et le filet n'ont plus rien à séparer, une simple accroche suffit), plus de six (la lettre devient un sommaire et personne ne descend), ou les entrées ne sont pas de même nature — un digest suggère une lecture de haut en bas qui devient fausse dès qu'une entrée est d'un autre genre que les autres.
- à remplir : num, kicker, title, lede, link
- variables : --vl-white, --vl-black, --vl-blue, --vl-ink-muted
- tags : email, mailing, newsletter, digest, sommaire, entrees, articles, numerote, filet, separateur, chapo, lien, outlook, table

### shape

**shape-notched-corner** — Carte à coin chanfreiné

- employer : Sur les aplats d'accent d'un deck ou d'une landing qui doivent se reconnaître d'une slide à l'autre : carte statistique, carte de second rang, pastille de glyphe. Une seule orientation par famille de contenu.
- éviter : Sur une image (la coupe se lit comme un recadrage raté), sur une carte du même fond que la slide (la coupe devient invisible et le lecteur ne voit qu'un angle sale), ou sur plus d'un coin — deux coins coupés font un losange, pas une signature.
- variables : --vl-notch, --vl-orange, --vl-steel
- .pptx : `kit/vl_pptx.py:notched_rect`
- tags : chanfrein, notch, coin, clip-path, carte, aplat, forme, signature, deck, corporate

### tag

**tag-01-gooey-capsule** — Capsule néon soudée — mot-clé + glyphe

- employer : Valoriser des mots-clés, des noms de produits, de modules, d'offres ou de compétences sur une slide, un hero ou une couverture — seul, ou empilé en liste. C'est le pattern quand il faut donner du poids à des termes qui n'ont ni chiffre ni phrase autour.
- éviter : Le libellé dépasse deux mots (la pilule devient une barre et le cou n'est plus lisible), l'élément est cliquable (ça ressemble à un bouton et le cou casse la cible), ou l'icône doit être COMPRISE — à 0,6u dans un cercle, elle marque une catégorie, elle n'explique rien.
- à remplir : icon, label
- variables : --vl-neon, --vl-cap-u
- tags : capsule, pilule, etiquette, tag, mot-cle, keyword, neon, contour, outline, icone, soudure, gooey, sombre, slide, hero

**tag-02-centered-cloud** — Nuage de mots-clés centré rangée par rangée

- employer : Fin d'une vignette de service, pied d'une carte de rubrique, bandeau de compétences : dix à quinze termes courts qu'on veut donner à VOIR en volume plutôt qu'à lire un par un, sans hiérarchie entre eux et sans ordre significatif.
- éviter : L'ordre compte (un nuage le détruit visuellement), les termes sont cliquables et de longueurs très inégales (les cibles deviennent illisibles à balayer), il y en a moins de six — trois rangées sont le minimum pour qu'une silhouette existe — ou l'un d'eux doit être mis en avant : ce système n'a aucune ressource pour distinguer une pilule des autres.
- à remplir : items
- variables : --vl-object, --vl-ink, --vl-radius-pill
- tags : tag, mot-cle, keyword, nuage, cloud, pilule, pill, chip, competences, services, wrap, monochrome

**tag-03-action-pill-bar** — Barre d'actions en pilules, une seule pleine

- employer : Ligne de commandes d'un tableau de bord ou d'un rapport, posée à droite du titre de page : une à trois portées de filtre (période, segment, vue) suivies de l'action qui sort de l'écran (exporter, partager, créer). Un filtre peut porter deux lignes — son intitulé au-dessus de sa valeur — sans changer la hauteur de la barre.
- éviter : Il y a plus de quatre commandes (la ligne devient une barre d'outils et demande des groupes), deux actions sont de premier rang (deux pilules pleines annulent le seul geste de rang), ou les commandes doivent se replier sous le titre : la barre suppose qu'elle tient sur une ligne, et son alignement à droite n'a plus de sens dès qu'elle passe à la ligne.
- à remplir : filters, action
- variables : --vl-module, --vl-app, --vl-invert, --vl-ink, --vl-ink-soft, --vl-on-invert, --vl-radius-pill
- tags : action, filtre, pilule, pill, barre, toolbar, dashboard, export, periode, segment, cta, puits, icone

### title

**title-01-leading-rule** — Titre à filet d'accent collé

- employer : Titre de slide en capitales grasses sur 1 à 3 lignes, dans un deck qui répète ce marqueur d'une slide à l'autre — c'est sa répétition qui en fait une charte.
- éviter : Le titre est déjà coloré ou posé sur un aplat d'accent (deux accents se neutralisent), ou il est centré : un filet collé à un bloc centré désaxe la composition sans rien signifier.
- à remplir : title
- variables : --vl-orange, --vl-black
- .pptx : `kit/vl_pptx.py:title_leading_rule`
- tags : titre, filet, barre, accent, typo, capitales, deck, marqueur, leading-rule

**title-02-condensed-overlay-stack** — Cadre typographique condensé en overlay

- employer : Ouverture de chapitre, slide de campagne ou hero plein écran dont le fond est une image (ou un aplat) : ce cadre est la couche de texte, il se superpose à layout-10-bleed-column-inset. Il vaut aussi seul, sur une slide de couleur, quand un chapitre doit s'annoncer sans décor.
- éviter : Le titre dépasse trois ou quatre mots, ou la slide porte déjà du corps de texte à lire : ce cadre suppose que le titre EST le contenu et que tout le reste est une marque de coin. Écarter aussi quand la charte n'a pas de grotesque condensée — à largeur normale, l'interligne écrasé fait se toucher les lettres au lieu des lignes, et le bloc devient illisible.
- à remplir : title, num, note
- variables : --vl-red, --vl-white, --vl-cos-fer
- tags : titre, condensé, capitales, overlay, numéro, section, parenthèses, micro-caps, campagne, chapitre, typo

## Références

| référence | charte | patterns extraits | deck |
|---|---|---|---|
| `ref-02-ghost-icon-claim` | Gris fantôme — argument unique | `card-01-ghost-icon` | `decks/ref-02-ghost-icon-claim.html` |
| `ref-03-bento-dark-pitch` | Bento sombre — pitch investisseur | `chart-01-stadium-bars`, `chart-02-isotype`, `layout-01-nested-bento` | `decks/ref-03-bento-dark-pitch.html` |
| `ref-04-swiss-investor-blue` | Suisse maximaliste — investor deck bleu | `card-13-email-figure-band`, `layout-02-swiss-frame`, `layout-09-email-envelope`, `list-01-giant-numbers`, `list-03-two-column-toc`, `list-06-email-digest` | `decks/ref-04-swiss-investor-blue.html` |
| `ref-06-orange-notched` | Corporate orange chanfreiné | `card-02-notched-brief`, `card-03-stat-accent`, `list-02-ruled-index`, `shape-notched-corner`, `title-01-leading-rule` | `decks/ref-06-orange-notched.html` |
| `ref-08-swiss-studio-hero` | Suisse studio — hero web Studioform® | — | `decks/ref-08-swiss-studio-hero.html` |
| `ref-10-campaign-board-red` | Planche de campagne — condensée rouge | `layout-10-bleed-column-inset`, `title-02-condensed-overlay-stack` | `decks/ref-10-campaign-board-red.html` |
| `ref-11-finance-dashboard-mint` | Dashboard bento clair — menthe & lilas | `card-04-stat-barchart`, `card-05-balance-gauge`, `card-06-forecast-timeline`, `card-07-transactions` | `decks/ref-11-finance-dashboard-mint.html` |
| `ref-12-neon-capsule-tags` | Néon vert — étiquettes capsules sur fond sombre | `tag-01-gooey-capsule` | `decks/ref-12-neon-capsule-tags.html` |
| `ref-13-glass-fintech-dashboard` | Dashboard en verre dépoli — lavande & bleu | `card-08-orb-chain-total`, `card-09-gradient-metric-curve`, `chart-03-accent-column-callout`, `layout-03-glass-board`, `list-04-due-rows` | `decks/ref-13-glass-fintech-dashboard.html` |
| `ref-14-layer-stack-coral` | Schéma de couches — corail sur blanc cassé | `diagram-01-layer-stack` | `decks/ref-14-layer-stack-coral.html` |
| `ref-15-lilac-notched-kpi` | Lavande SaaS à vignettes chanfreinées | `card-10-kpi-notch-tile` | `decks/ref-15-lilac-notched-kpi.html` |
| `ref-16-cobalt-graph-paper` | Papier millimétré cobalt | `chart-04-unit-textured-bar`, `layout-04-graph-paper-cells` | `decks/ref-16-cobalt-graph-paper.html` |
| `ref-17-mono-bento-legal` | Bento monochrome, hiérarchie par la surface | `card-11-corner-arrow-tile`, `layout-05-nav-pill-bar`, `layout-06-bento-l-span`, `tag-02-centered-cloud` | `decks/ref-17-mono-bento-legal.html` |
| `ref-18-lime-sales-dashboard` | Tableau de bord achromatique à accent vert dosé | `card-12-inverted-kpi-row`, `chart-05-tile-heatmap`, `layout-07-icon-rail-shell`, `tag-03-action-pill-bar` | `decks/ref-18-lime-sales-dashboard.html` |
| `ref-19-acid-clinical-timeline` | Feuille clinique grise sur voile, accent acide | `diagram-02-branch-timeline`, `diagram-03-time-scrubber`, `layout-08-sheet-handle-tab`, `list-05-vitals-strip` | `decks/ref-19-acid-clinical-timeline.html` |

Ce que chaque référence fait, sa palette et sa typo : [SPEC-SOURCES.md](SPEC-SOURCES.md).
