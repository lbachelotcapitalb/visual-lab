# ROADMAP — visual-lab

## Sommaire

- Le livrable d'un lot est un DECK AU FORMAT SLIDES
- Procédure d'un lot (identique à chaque fois)
- Acquis techniques à réutiliser (gagnés sur les lots faits)
- Lots
- Règles de travail, valables dans tous les lots
- Prompt de reprise (à coller dans une session nettoyée)
- Ce qui reste, en un coup d'œil

**But final : les 10 visuels du corpus reproduits en HTML**, et de chacun, les patterns
atomiques extraits en fragments réutilisables — pour pouvoir ensuite retravailler dessus et
composer d'autres slides, visuels ou pages.

Un lot = **une référence** = une session propre. Chaque lot se termine par une preuve PNG et
un commit. Le prompt de reprise est en fin de fichier.

Source de vérité du reverse-engineering : [SPEC-SOURCES.md](SPEC-SOURCES.md).
**Les images d'origine n'existent pas sur disque** — elles étaient collées dans le chat.
Ne jamais les redemander : la spec les remplace, elle contient palettes, échelles typo,
grilles, inventaire des éléments et pièges de fidélité.

## Le livrable d'un lot est un DECK AU FORMAT SLIDES

Un deck s'écrit **une `<section class="slide">` par slide, à sa taille réelle** (celle de la
spec, ex. 1600 × 900). Le fichier ne sait rien de la façon dont on le regarde : il n'y a ni
grille de vignettes ni `transform: scale()` dans `decks/ref-NN.html`. Les deux vues se
**dérivent** :

```bash
node bin/slides.mjs decks/ref-NN-<slug>.html
```

→ `proofs/ref-NN/slide-01.png` … une image par slide, pleine taille. **C'est la preuve qui
compte** : à 50 %, une micro-typo de 8 px est illisible et les écarts se cachent.

```bash
node bin/board.mjs decks/ref-NN-<slug>.html
```

→ `proofs/ref-NN.png`, la planche-contact. Elle sert à juger **le rythme d'ensemble** (ordre
des fonds, alternance, équilibre du deck), jamais à valider une slide.

**Ce qui est un deck, et ce qui n'en est pas un.** Le format slides vaut pour les 6 decks :
`ref-03` (4 slides) · `ref-04` (10) · `ref-05` (8) · `ref-06` (8) · `ref-09` (12) ·
`ref-10` (3). Les autres références n'ont pas de slides : `ref-01` est une couverture seule,
`ref-02` un visuel unique, `ref-07` et `ref-08` sont des pages web.

---

## Procédure d'un lot (identique à chaque fois)

1. Lire la section `ref-NN` de `SPEC-SOURCES.md`.
2. Écrire `systems/sys-NN.json` : les tokens (palette, typo, rayons, marges) **et** la note
   de charte — ce qui fait tenir le système, pas seulement ses valeurs.
3. Écrire `decks/ref-NN.html` **au format slides** (cf. section ci-dessus) : la
   reconstitution fidèle et **complète** — le deck doit compter exactement le nombre de
   slides annoncé par la spec, aucune n'est facultative. Le `:root` du système est en dur
   dans le fichier.
4. Exporter et **regarder chaque slide** : `node bin/slides.mjs decks/ref-NN-<slug>.html`, puis
   ouvrir les PNG un par un. Corriger, ré-exporter (`--only N` pour une seule slide).
   Finir par `node bin/board.mjs decks/ref-NN-<slug>.html` pour juger le rythme d'ensemble.
   Ne pas passer à l'étape 5 avant que ça ressemble.
5. **Extraire** les patterns listés pour cette référence : un `.html` (fragment autonome,
   couleurs en `--vl-*` uniquement) + un `.json` (intention, quand l'employer, quand
   l'éviter, notes de réglage) par pattern.
6. `node bin/index.mjs` (doit passer), puis `node bin/render.mjs --pattern <id>` sur chacun
   pour prouver qu'il tient **hors** de son deck.
7. Cocher le lot ici, mettre à jour la ligne « État » du README, committer.

## Acquis techniques à réutiliser (gagnés sur les lots faits)

- **Proportion d'abord.** Les planches du corpus ne sont pas toutes en 16:9 — `ref-03` est
  en bandes larges (~2,7:1). Construire une slide trop haute crée des vides que la charte
  d'origine n'a pas, et on est alors tenté d'étirer le contenu pour les combler. Vérifier le
  ratio dans la spec avant d'écrire une ligne de CSS.
- **La réduction est une VUE, pas le fichier.** Ne jamais écrire la grille de vignettes dans
  le deck : les slides restent à leur taille réelle et `bin/board.mjs` fabrique la planche.
  Un deck qui contient sa propre mise en vignettes ne s'exporte plus slide par slide, et on
  finit par valider un rendu à 50 % où rien de fin ne se voit.
- **Images.** Jamais d'URL distante : un `<div>` à ratio fixe rempli d'un dégradé gris
  (`--vl-ph-a` → `--vl-ph-b`) tient le rôle d'une photo N&B et ne périme pas.
- **Alignement des bas de bloc.** Dans une rangée de cartes, coller les libellés en bas
  (`margin-top: auto`) : sans ça la rangée se désaligne au premier changement de contenu.
- **Répartir n'est pas remplir.** Une slide trop vide ne se répare pas en étirant son
  contenu (`space-between` sur une liste éloigne chaque filet de son entrée : l'écart se lit
  comme un oubli). Deux gestes marchent : donner la hauteur restante à une IMAGE
  (`flex: 1` sur le bloc photo), ou **centrer un bloc compact** et assumer le vide autour.
- **Bloc de largeur bornée.** Un libellé à gauche et son chiffre à droite d'une slide de
  1600 px ne forment plus une paire. Borner le bloc (`max-width` + `margin-left: auto`)
  avant de s'en remettre à `justify-content: space-between`.
- **UN SEUL bloc `<style>`, et il porte tout.** `bin/slides.mjs` et `bin/board.mjs`
  reconstruisent la page à partir du **premier** bloc `<style>` du deck, et de lui seul. Un
  second bloc en fin de page ou une balise de lien dans l'en-tête sont perdus à l'export,
  **sans erreur** : ref-08 est sorti avec ses trois images vides (53 ko au lieu de 530), et un
  deck à police liée sortirait en police système. Les polices se branchent donc par
  `@import url("../fonts/fonts.css")` **dans** ce bloc (cf. `fonts/FONTS.md`), et les fichiers
  temporaires d'export sont écrits à côté du deck pour que ce chemin relatif tienne.
- **Ne jamais écrire la balise ouvrante d'une slide dans un commentaire.** L'extraction est
  une regex : elle prend la chaîne du commentaire pour le début de la slide 1 et exporte le
  commentaire comme contenu (vu sur ref-10). Décrire, ne pas citer.
- **La viewBox d'une image SVG se règle à la proportion de SA TUILE, pas du dessin.** Avec
  `preserveAspectRatio="slice"`, un écart de ratio recadre au centre ET grossit d'autant : la
  première veste de ref-10 perdait son ciel et ses boutons hors champ, et la robe de vache
  montrait 4 taches géantes au lieu d'une dizaine. Quand il faut peupler un cadre plus large,
  définir le motif une fois (`<g id>`) et le réinstancier décalé (`<use transform>`) plutôt
  que d'étirer.
- **Arrondir un polygone sans le redessiner** : `feGaussianBlur` franc, puis
  `feComponentTransfer` avec une rampe alpha raide (`slope 7 / intercept -2.1`), puis un flou
  de 0.7 pour l'antialiasing. Les angles fondent en lobes organiques, le bord reste net —
  c'est ce qui a transformé des taches en camouflage anguleux en vraies taches de robe.

---

## Lots

### ✅ Lot 0 — Socle (29/07/2026, complété le 30/07)
Dépôt, format de pattern, index SQLite régénérable, recherche plein texte, rendu PNG
headless, squelette de création. Audit écrit des 10 références → `SPEC-SOURCES.md`.
Ajout du 30/07 : `bin/slides.mjs` (export slide par slide, pleine taille) et
`bin/board.mjs` (planche-contact dérivée) — les deux vues d'un deck écrit en format slides.

### ✅ Lot 1 — `ref-02-ghost-icon-claim` (29/07/2026)
Tokens + deck, **1 pattern retenu** : `card-01-ghost-icon`. Les deux autres
(emphase par changement de famille typo, règle de l'icône fantôme) ont été élagués le 30/07 :
une idée qui tient dans sa phrase de description n'a pas besoin d'être archivée.
**C'est le gabarit de forme** — le relire avant d'attaquer un lot.

### ✅ Lot 2 — `ref-03-bento-dark-pitch` (29/07/2026)
Tokens + deck — 4 slides 1120×410, déjà au format slides (vérifié le 30/07).
**3 patterns retenus** : `layout-01-nested-bento`, `chart-01-stadium-bars`, `chart-02-isotype`.
Élagués le 30/07 : la pilule à filet, la tuile KPI, le surlignage en pilule, la flèche
dans un rond — quatre micro-éléments qu'on réécrit de tête.

### ✅ Lot 3 — `ref-04-swiss-investor-blue` (30/07/2026)
Deck — **10 slides 1600×900 au format slides**, rythme des fonds respecté, exportées une par
une. **3 patterns retenus** : `layout-02-swiss-frame`, `list-01-giant-numbers`,
`list-03-two-column-toc`. Élagués le 30/07 : le titre en grosses capitales et la règle de
rythme des fonds pleins (aucun rendu).

### ⬜ Lot 4 — `ref-05` proposal-acid-yellow
**8 slides** (format slides, une section par slide). Neutre + **un** accent fluo, header
tri-parti, astérisque de marque.
Patterns : `header-tripartite`, `mark-asterisk`, `cards-numbered-steps`,
`title-hyphen-break`, `accent-single-fluo` (règle éditoriale — à extraire seulement si elle a un rendu).

### ✅ Lot 5 — `ref-06` orange-notched (30/07/2026)
**8 slides.** La signature est le **coin chanfreiné** (`clip-path`).
Patterns : `shape-notched-corner`, `title-01-leading-rule`, `list-02-ruled-index`,
`card-03-stat-accent`, `card-02-notched-brief`.

**Fait le 30/07/2026 : la reconstitution.** `systems/ref-06-orange-notched.json` et `decks/ref-06-orange-notched.html` —
**8 slides 1600×900**, preuves `proofs/ref-06/slide-01..08.png` + planche `proofs/ref-06.png`.

Deux corrections CONTRE la spec, au vu du visuel source :
- **Échelle ×1,6.** Les corps de la spec (titre 46 / chiffre 40 / corps 11) ont été relevés
  sur une planche dont chaque slide fait ~1000 px de large. Reportés tels quels sur 1600×900,
  ils laissent des bandes mortes que la charte d'origine n'a pas — on est alors tenté
  d'étirer les cartes pour les combler. Le deck est donc en titre 74 / chiffre 64 / corps 17
  / micro 12 : proportions de la spec respectées, valeurs absolues non.
- **Le filet de titre a DEUX variantes.** `border-left` sur le bloc pour un titre aligné à
  gauche ; mais sur `SALES|STRATEGY` (aligné à droite, 2 lignes) un `border-right` dessine
  une barre le long des deux lignes et se lit comme un bord de cadre. Il faut un filet
  **en ligne** (`.tlr-inline`), posé après le dernier caractère du premier mot.

Troisième leçon, sur les cartes : ne PAS les laisser en `flex:1` dans leur rangée. Un
libellé en haut et son texte en bas d'une carte de 450 px de haut créent un vide intérieur
qui se lit comme un oubli. Hauteur bornée (300–340 px) et c'est la rangée qui cède la place.

**Patterns extraits le 30/07** — 5 au lieu des 4 prévus (Léo a pointé la carte de second rang
comme une vignette à part entière) : `shape-notched-corner`, `card-03-stat-accent`,
`card-02-notched-brief`, `title-01-leading-rule`, `list-02-ruled-index`. **41 benchmarks, tous verts** (`node bin/check.mjs`), rendus PNG regardés
un par un.

Ce lot a fait naître l'outillage que les suivants doivent réutiliser :
- `bin/check.mjs` — mesure la géométrie RÉELLE du fragment dans Chrome et confronte les
  `benchmarks` du .json. Sort en code 1 tant qu'un seuil n'est pas tenu.
- `INDEX.md` + `index.json` — générés par `bin/index.mjs` à chaque indexation, VERSIONNÉS, pour
  qu'un autre skill lise le catalogue sans sqlite.
- `kit/vl_pptx.py` — le pont vers le .pptx : mêmes ratios, mêmes seuils, un `audit()` qui lève.
  `deck-builder` y pioche désormais (sa doc a été mise à jour dans le même mouvement).

Trois pièges payés ici, à ne pas repayer :
1. `getComputedStyle().clipPath` ne résout NI les `%` NI les `calc()`. Une regex qui ne ramasse
   que les `px` fabrique des sommets fantaisistes — les mesures semblaient bonnes par
   coïncidence et l'orientation du chanfrein sortait fausse. Il faut découper le polygone
   (virgules, puis espaces, au premier niveau de parenthèses) et évaluer contre la boîte.
2. Une tuile de DÉMONSTRATION doit avoir la proportion d'un vrai usage : 4 cartes côte à côte
   sur 880 px donnaient 200 px de large, où le chanfrein de 34 px pèse 17 % au lieu de 7,5 %. La
   démo mentait sur le pattern qu'elle illustre.
3. `shape.shadow.inherit = False` ne suffit pas à retirer une ombre en .pptx : le `<p:style>`
   émis par python-pptx référence l'ombre du thème. Toutes les cartes sont sorties avec une
   ombre grise — invisible dans le proxy PIL, flagrante au rendu LibreOffice.

### ✅ Lot 6 — `ref-07` retro-brand-hero — SOLDÉ le 12/08/2026
Première **page web** du corpus : `systems/ref-07-retro-brand-hero.json` et
`decks/ref-07-retro-brand-hero.html` — scène **1440 × 900**, déclarée `<!-- vl:stage web -->`,
deux couches (sol photographique génératif → carte crème incrustée). Quatre patterns, aux noms
que `bin/new.mjs` impose : `layout-11-hero-card-on-photo`, `layout-12-nav-three-zone`,
`title-03-wordmark-bottom-left`, `layout-13-image-triptych`.

Aucune image source sur disque : `bin/diff.mjs` impossible, la fidélité tient à la spec, au
regard et à `check-deck.mjs`.

Deux chiffres de la spec ont été corrigés CONTRE elle, par la mesure :
- wordmark **0,465 Wc**, pas 0,51 — la spec estimait une largeur que le mot rendu ne fait pas.
  L'assertion qui en dépendait (« les deux blocs ne tiendraient pas côte à côte ») était donc
  fausse ; ce qui est vrai et mesuré, c'est la SATURATION de la rangée (96 % de la largeur).
- triptyque à largeurs **égales**, pas inégales — la table de géométrie de la spec (0.42 Wc,
  gouttière 12) le disait déjà, seule sa liste de patterns prétendait le contraire.

Piège d'outillage payé ici : `overflow()` compte le débord de la boîte de CONTENU d'une ligne,
que produit tout interligne sous 1 (à 0,82 sur Archivo, 24 px sous la boîte). Un pattern
parfaitement contenu sortait rouge. La containment se mesure sur les boîtes ; que le débord
soit du vide se prouve au canvas (`actualBoundingBoxDescent`), pas par affirmation.

### ✅ Lot 7 — `ref-08` swiss-studio-hero — SOLDÉ le 12/08/2026
**Fait le 30/07/2026, HORS ordre** (demande directe de Léo sur le visuel source) :
`systems/ref-08-swiss-studio-hero.json` et `decks/ref-08-swiss-studio-hero.html` — **la slide seule, 1140×848, bord à bord** :
pas de décor de maquette (photo d'intérieur, ombre portée) autour. Une première version le
portait ; retirée le 30/07 — un décor oblige à recadrer chaque export à la main, et ce n'est
pas la slide. Preuve `proofs/ref-08/slide-01.png`. Les trois photos sont remplacées par des
compositions **SVG génératives** (marine / fenêtre de cabine / bouée), sans réseau.

Un seul bloc `<style>`, dans le `<head>` : `bin/slides.mjs` ne reprend que le PREMIER bloc
du fichier. Un second bloc en fin de page (les classes de remplissage SVG vivaient là)
sortait un export aux images vides — 53 ko au lieu de 530.

Trois valeurs de la spec ont été corrigées CONTRE elle, au vu du visuel source — la spec
avait été écrite en supposant une carte plus petite :
- wordmark **204px**, pas 112 : il affleure les deux marges (≈ largeur utile / 5.2).
- statement **27px sur 3 lignes**, pas 15px sur 2.
- carte **#F6F5F2**, pas #FFFFFF : elle est éclairée par la pièce.

**Extraction faite le 12/08/2026** — deux patterns versés et un généralisé. Aucune image source
sur disque : `bin/diff.mjs` impossible, la fidélité tient à la spec (relevée SUR le deck, pas
supposée), au regard et à `check-deck.mjs`.

- `layout-14-statement-first` — l'ordre de lecture inversé : la phrase parle d'abord, la nav lui
  fait face, le nom n'arrive qu'ensuite mais prend toute la mesure. Ce qui tient la composition
  est le **saut d'échelle sans palier** (× 7,4 entre la phrase et le nom, et la nav est plus
  PETITE que la phrase, jamais entre les deux) plus le blanc, plus large avant le nom qu'après.
- `title-04-name-fills-measure` — le nom réglé pour affleurer les deux marges (99,6 % de l'encre
  sur la mesure) et son `®` calé sous la ligne de capitale. Il **absorbe**
  `type-registered-superscript`, que la spec annonçait seul : la calibration du signe est
  solidaire du réglage du corps, isolée elle tient dans sa propre phrase de description et ne
  survit pas au test d'utilité du 30/07.
- `layout-13-image-triptych` **généralisé** — c'est la preuve du lot.

**La preuve du lot, et ce qu'elle a corrigé.** L'attendu était que les patterns du lot 6
produisent ref-07 ET ref-08 par variables. Un seul le pouvait : `layout-11-hero-card-on-photo`
ne s'applique pas ici, et c'est son propre `avoid_when` qui le dit — `ref-08` n'a pas de sol
photographique, donc ni incrustation, ni marge de sol, ni ombre à mesurer. L'absence est un
arbitrage documenté, pas un manque.

Reste la bande, et sa loi était **mal énoncée** : « même ratio pour les trois cellules » n'est
pas ce qui fait une bande, c'est ce qu'on obtient à poids égaux — le cas particulier de `ref-07`.
La loi est la **hauteur commune**. `aspect-ratio` posé sur les trois cellules leur imposait
trois hauteurs différentes dès que les poids cessaient de l'être : la bande se disloquait, et
aucune variable ne pouvait la sauver. Posé sur la PREMIÈRE seule, il donne sa taille
transversale à la ligne flex et `align-items: stretch` la recopie. Un benchmark reparamètre
alors le fragment aux valeurs de `ref-08` (1060 de large, gouttière 16, hauteur 380, poids
1 / 1,31 / 1,14) et retrouve les cellules relevées sur le deck — 298 / 390,3 / 339,7 — à 0,2 %
près. Une seule bande, deux références, mesuré.

Deuxième acquis de forme, verrouillé lui aussi : **le corps d'un nom d'enseigne n'est pas une
taille, c'est une fonction de la largeur** (`calc(100cqw / chasse)`, la chasse étant le rapport
mesuré encre/corps de CE mot dans CETTE graisse). Reparamétrée à 700 px, la zone garde son taux
de remplissage ; contre-épreuve faite, un corps en dur y sort à 1,51 fois la mesure. Et le
contrôle qui le prouve mesure l'**encre au `Range`**, pas la boîte du `h1` : un `h1` est un bloc,
sa boîte fait la largeur utile quoi qu'on écrive dedans — elle ne peut donc rien prouver, et un
débord y passerait inaperçu.

La spec a été relevée sur le deck avant d'écrire une ligne, et elle a démenti deux de ses
propres affirmations : le triptyque de `ref-08` n'a pas de ratio commun (hauteur imposée à 380,
poids inégaux), et la liste de patterns annonçait un `hero-statement-first` hors nomenclature.
Corrigées toutes les deux.

### ⬜ Lot 8 — `ref-09` zine-annotated-blue
**12 slides** — la plus grosse planche du corpus, prévoir la session entière. Le lot le plus technique : `annotation-marker` est un générateur SVG de
tracés manuscrits (ovale d'encerclement, flèche courbe, soulignement ondulé, zigzag) dont
**l'irrégularité des points de contrôle est la fonctionnalité** — un tracé régulier
redevient une forme géométrique et l'effet tombe. C'est le plus fort différenciateur
anti-« AI slop » du corpus.
Patterns : `annotation-marker`, `type-lowercase-editorial`, `type-vertical-rail`.

### ✅ Lot 9 — `ref-10` campaign-board-red — SOLDÉ le 12/08/2026
**3 slides.** Typo condensée écrasée, collage d'images en overlay, tableau à filets.
Patterns versés : `layout-10-bleed-column-inset`, `title-02-condensed-overlay-stack`,
`list-07-hairline-spec-table` — **trois, pas les cinq annoncés** : `type-condensed-stack`,
`mark-paren-number` et `type-micro-caps-block` nommaient des ÉLÉMENTS, pas des compositions,
et sont absorbés par le cadre typographique qui porte leur DISPOSITION mutuelle (fer unique
partagé titre/numéro, contrepoids au coin opposé). Le lot a corrigé sa source deux fois : le
rouge relevé passait sous 4,5:1 pour les corps de 13 px écrits du même rouge (`#E33A22` →
`#C82C15`), et les cellules du tableau étaient centrées dans leur ligne au lieu de pendre du
filet qui les ouvre — ce dernier défaut n'a été vu que par le regard. Aucune image source sur
disque : `bin/diff.mjs` impossible, la fidélité tient à la spec, au regard et à
`check-deck.mjs`. Détail dans `SPEC-SOURCES.md`, section `ref-10-campaign-board-red`.

**Fait le 30/07/2026, hors ordre** (demande directe de Léo sur le visuel source) :
`systems/ref-10-campaign-board-red.json` et `decks/ref-10-campaign-board-red.html` — **3 slides 1600×900**, preuves
`proofs/ref-10/slide-01..03.png` + planche `proofs/ref-10.png`. Le fond de planche taupe et
la signature « @ALOHA DESIGN » ne sont PAS reproduits : décor de contact sheet, pas slides.
Les six photos sont des compositions SVG génératives (robe de vache, veste rouge satinée,
chemin de terre, main gantée à la fiole, pièce rouge, cactus à épines).

**Le lot a apporté les polices au dépôt** : `fonts/` (Archivo variable, Inter variable,
Anton, licences OFL) + `fonts/FONTS.md`, le registre « quelle police pour quelle référence ».
C'est ref-10 qui l'imposait — sa grotesk condensée Black n'existe pas sur le système.

Valeurs typo relevées à la proportion (titre 104px, micro-caps 13px, numéro 78px), pas
recopiées de la spec : cf. le piège documenté dans `fonts/FONTS.md`.

### ✅ Lot 10 — `ref-01` bento-pills-2030 (12/08/2026, CLOS)
1 slide de couverture, purement géométrique, reconstruite **à plat** — ni la perspective ni
l'ombre de la photo d'origine. **Trois patterns là où la spec en annonçait quatre** :
`layout-15-primitive-mosaic`, `shape-02-teardrop-quadrant`, `shape-03-stadium-track`.
`fill-gradient-stadium` n'est pas versé seul — il n'a pas d'existence propre, le dégradé EST
le remplissage de l'enfant emboîté ; et le « toggle » n'est pas une primitive de plus : c'est
le MÊME rail que la barre en dégradé, avec l'autre remplissage. C'est cette identité que
`shape-03` verse, et la spec la manquait en les listant à part.

Le lot est le seul du corpus qui ne porte **aucun texte** hormis l'année, donc tout s'y joue
sur des lois de forme, et trois d'entre elles ont dû être établies contre le relevé :

- `border-radius: 50%/50%` n'est **pas** un stadium mais une ELLIPSE — les deux pourcentages se
  résolvent sur des axes différents. Le rayon s'écrit en LONGUEUR, comme le chanfrein d'un
  coin coupé s'écrit en longueur pour rester à 45°. Le piège était dans le relevé, sur la
  primitive la plus fréquente de la planche (trois occurrences sur huit).
- une grille de 4 × 3 cellules **carrées** a un aspect borné par 3/2 : elle ne remplira jamais
  un 16:9. Ce n'est pas un arbitrage de cadrage, c'est une impossibilité arithmétique — le
  benchmark ne la calcule pas, il reparamètre le fragment de 0 à 1000 px de gouttière et
  constate. La mosaïque est donc calée sur la HAUTEUR et centrée.
- le corps de l'année n'est pas une taille de charte mais une **fonction de la largeur** de sa
  pilule. Corollaire sorti au contrôle visuel, et devenu la 16ᵉ assertion : un fragment dont la
  géométrie dépend d'une chasse doit ÉPINGLER sa police, sinon elle dépend du harnais qui
  l'ouvre — `check.mjs` sert « Helvetica Neue » en tête, `render.mjs` la police système, et le
  benchmark des 88 % restait vert pendant que le rendu saturait 97 %.

Aucune image source sur disque : `bin/diff.mjs` impossible, la fidélité tenue par la spec, le
regard et `check-deck.mjs`. Détail dans `SPEC-SOURCES.md`, section `ref-01-bento-pills-2030`.

### 🟡 Lot 11 — Composition
Ce qui transforme la collection en outil :
- ⬜ `bin/compose.mjs` — assembler une slide à partir d'ids de patterns + un `sys-*` + un
  contenu JSON, sans copier-coller manuel.
- ✅ Garde-fou « échouer bruyamment » : `bin/emit.mjs` refuse un pattern qui ne tient pas la
  cible, et laisse VISIBLE toute variable non résolue (token absent du système choisi) au lieu
  de rendre du gris. Reste à porter la même exigence dans `compose.mjs` quand il existera.
- ✅ `bin/contact-sheet.mjs` — planche-contact PNG (tout, ou `--family` / `--ref` / `--media`),
  chaque vignette sur le `:root` de sa référence, tailles MESURÉES dans Chrome avant la grille.

### ✅ Lot 12 — Skill + carte (31/07/2026, CLOS)
- ✅ Skill `visual-lab` : `SKILL.md` à la racine du dépôt, symlink `~/.claude/skills/visual-lab`
  (convention maison). Deux verbes — consulter / verser. Il situe `deck-builder`,
  `theme-factory`, `frontend-design` et `bestfront`.
- ✅ `DOCTRINE.md` : les lois de mise en page, sans média, avec le tableau « qui mesure quoi »
  et les TROUS assumés (mailing, flyer, social : rien ne les mesure). `deck-builder` et
  `bestfront` y renvoient au lieu de porter chacun leur copie.
- ✅ Enregistrement dans karto (`skills-collect.mjs` + `karto-db.mjs build`, 31/07).
- ✅ **Arbitrage tranché par Léo le 31/07 : dépôt GitHub PUBLIC, tout y vit, rien en local seul.**
  Trois gestes payés avant la publication, à ne pas défaire :
  1. **Licence MIT** à la racine, avec ses deux exceptions explicites — les polices restent sous
     OFL (leurs licences vivent à côté d'elles), et les photos ne sont pas dans le dépôt (seuls
     les manifestes le sont, avec auteur et licence par image).
  2. **Anonymisation.** Aucune source n'est nommée (`ref-NN-<slug>` seulement) et les textes de
     démonstration qui portaient encore un nom de marque réel sont passés au nom fictif
     `northbeam` — un contenu de remplissage n'a aucune raison de citer une marque, et il est
     recopié tel quel par le premier qui prend le fragment.
  3. **`decks/` reste publié**, contrairement à ce que cette ligne disait avant l'arbitrage : ce
     sont des reconstitutions à plat qui capitalisent une GÉOMÉTRIE, sans logo ni source citée,
     et elles sont dans l'historique depuis le premier commit — les retirer imposerait de
     réécrire tout l'historique pour un gain nul une fois l'anonymisation faite.

### ✅ Lot 14 — `ref-13` glass-fintech-dashboard (31/07/2026)
Référence apportée hors corpus initial, fournie **photographiée en perspective** dans un cadre
portrait, avec deux cartes coupées sur le bord gauche. Le travail d'isolement fait partie du lot :
**deux couches** — le fond en dégradé flou qui accueille, et les quatre modules posés dessus —
remises à plat, au format PPT ; les cartes amputées ne sont pas reconstruites (elles flottent
au-dessus, sans composition exploitable).
- ✅ `SPEC-SOURCES.md` § `ref-13`, écrite AVANT le code — palette, échelle typo en fraction de
  la largeur de planche, géométrie des quatre modules.
- ✅ `systems/ref-13-glass-fintech-dashboard.json` — premier système à tokens **translucides**.
- ✅ `decks/ref-13-glass-fintech-dashboard.html` — une slide **1600×900 (PPT)**, rendue et
  comparée à la source pendant qu'elle était encore dans le contexte.
- ✅ 5 patterns : `layout-03-glass-board`, `card-08-orb-chain-total`,
  `card-09-gradient-metric-curve`, `chart-03-accent-column-callout`, `list-04-due-rows` —
  55 benchmarks, tous verts. Leurs `geometry.frame` sont les dimensions RÉELLES des modules
  sur une slide 1600×900 : un pattern extrait d'un deck hors format aurait des ratios faux.
- ✅ Reprise après revue de Léo : la première version avait trois couches (fond + planche
  intermédiaire + modules) et deux halos flous ajoutés, sur une slide 1440×1040. Corrigé —
  deux couches, format PPT, extractions refaites derrière.
- ✅ Outillage : `bin/check.mjs` **composite** désormais les couches translucides pour établir
  le fond effectif d'une mesure de contraste (l'ancien seuil `alpha > 0.5` déclarait illisible
  tout système en verre). Les 10 patterns antérieurs restent verts — leurs fonds sont opaques.
- ✅ Le token `--vl-ink-muted` s'écarte volontairement du relevé (#6B7186 → #565C72) : à la
  valeur de la source, dates et légendes sortent à 3,5:1 sur le verre. La bibliothèque ne
  capitalise pas le défaut de la source.

**Ce que le corpus gagne** : le verre dépoli, le fond en dégradé, et deux trous comblés de la
liste « ce que personne ne couvre » — un graphique en ligne (`card-09`) et une liste dense de
données alignées (`list-04`).

### ⬜ Lot 13 — Sortir du slide/web (ouvert le 31/07 · volet email SOLDÉ le 11/08)
Le constat mesuré à l'ouverture : `node bin/emit.mjs --audit --target email` donnait **0/22**.
Tant qu'aucun pattern n'est écrit POUR ces canaux, « bibliothèque tous médias » reste une
intention.
- ✅ **Trois patterns nativement `email`** — `layout-09-email-envelope` (garde + colonne de 600,
  bandeau / corps / pied, bouton, désabonnement), `list-06-email-digest` (entrées numérotées
  séparées par un filet) et `card-13-email-figure-band` (trois chiffres en cellules). Adossés à
  `ref-04-swiss-investor-blue` : la charte du corpus la plus nativement compatible avec le canal
  — aucun rayon, aucune ombre, aucune couleur translucide, trois aplats pleins qui alternent.
  Les deux blocs font 520 px = le slot `body` de l'enveloppe (600 − 2 × 40) : ils s'emboîtent
  sans réglage. **48 benchmarks, tous verts ; 3/41 à l'audit email, et ce sont exactement les
  trois déclarés `media: ["email"]`.**
  - Le lot a corrigé l'émetteur DEUX fois, dans le même commit : il ignore désormais les
    **commentaires HTML** avant de scanner (un pattern email documente ce qu'il s'interdit —
    `layout-09` était refusé à cause du mot `calc()` dans son propre commentaire), et il **bloque
    les couleurs à canal alpha**, qu'Outlook rend PLEINES (6 patterns de plus attrapés ; les
    entités numériques sont retirées avant ce test, `&#8599;` se lisant sinon comme un hex).
  - Ce que le lot n'a PAS fait, et qu'il ne prétend pas : les 38 autres patterns restent hors
    canal, et **rien ne mesure encore la composition d'un mailing** — seulement sa faisabilité.
- ✅ **Un cadre `social` (1080×1350)** — `bin/frame.mjs`, un troisième contrôle à côté de
  `check` (les rapports internes) et `emit` (le moteur de la cible) : **à la taille où on le
  regarde**, le plus petit corps reste-t-il au-dessus du plancher, et le pattern remplit-il son
  cadre ? Verdict : **10/41**. Ce qui casse, casse presque toujours pour la même raison — un
  pattern très large ne rentre pas dans un 4:5 : `card-12-inverted-kpi-row` (5,87:1) tombe à
  11 px de texte et 13 % d'occupation. Deux seuils, tous deux en fraction de la largeur du
  cadre : typo ≥ 2,2 % (24 px sur 1080), occupation ≥ 45 %.
  - `--out <fichier.html>` rend les cadres **à 390 px de large, la largeur d'un téléphone** :
    un cadre montré à 100 % ou réduit « pour tenir » mentirait sur la seule chose qu'on cherche
    à savoir. La zone sûre (6 %) est tracée en pointillés.
  - Deux pièges de mesure payés à l'écriture, tous deux corrigés dans le détecteur : le bloc
    `<style>` que chaque fragment porte avec lui était compté comme un texte (sept patterns
    déclarés sous le plancher à cause d'une feuille de style qui n'affiche rien), et un élément
    MIXTE — un `<p>` de 12 px contenant un `<b>` — n'était compté ni pour lui-même ni par son
    enfant, ce qui déclarait lisible un pattern sur un texte jamais mesuré. Le second faisait
    passer `layout-08` à tort.
  - ✅ **La zone sûre est mesurée, pas supposée** : un contrôle de débordement vérifie qu'aucun
    descendant ne sort de la boîte de la racine — sans quoi « le pattern tient dans la zone
    sûre » serait vrai de la racine et faux du rendu. Aucun des 41 n'en sort, et ce zéro est
    vérifié par CONTRE-ÉPREUVE (le détecteur rend 45 px sur un cas construit qui déborde de
    45 px) : un contrôle qui ne mord jamais doit prouver qu'il sait mordre.
  - ✅ **7 patterns portent désormais `media: social`**, sur les 10 qui tiennent le cadre —
    rendus et regardés un par un, parce que la mesure autorise la déclaration mais ne la
    remplace pas. Les trois écartés le sont pour un motif que rien ne mesure : `card-11` et
    `chart-05` ont un fond du même blanc que le sol du cadre, donc **le post n'a pas de bord**
    dans un fil ; `shape-notched-corner` n'a aucun texte et passe le plancher par absence de
    sujet, pas par mérite.
  - ⬜ Ce qui reste : **rien ne mesure la COMPOSITION d'un post**, ni son détachement du sol.
    Et aucun pattern natif social n'a été écrit — ce n'était pas le manque le plus urgent, le
    corpus en couvrant déjà sept ; le vrai trou est ailleurs et il est nommé ci-dessous.
  - ⬜ **Ce que les sept ne couvrent pas** : ce sont tous des vignettes de donnée (un chiffre,
    un histogramme, une trame). Aucun format ÉDITORIAL — la citation plein cadre, le décryptage
    en trois temps, la vue de carousel numérotée. C'est ce qu'il faudrait écrire nativement,
    et c'est un lot à part entière parce qu'il demande d'abord de trancher ce qu'est un post
    de la maison.
- ⬜ Reprendre l'émetteur **PSD live-text** déjà écrit dans `~/.claude/skills/gtm-content/psd/`
  (`build-livetext-psd.mjs`) comme quatrième sortie du dépôt, au lieu de le laisser prisonnier
  d'un skill de comm.

### ✅ Dette de format — résorbée le 31/07 (relevée et soldée le même jour)

`bin/check-deck.mjs` sortait **12 défauts sur 2 decks** antérieurs à la règle « une slide se
livre au format PPT 1600×900 ». Les deux sont repris :

| deck | avant | ce qui a été fait |
|---|---|---|
| `ref-11-finance-dashboard-mint` | 1160×900, marge de page, profondeur 4 | scène 1600×900, marge de page retirée, colonne gauche 556 → 776 ; les 4 patterns `card-04` à `card-07` recalés sur les dimensions RÉELLES de leurs modules (776×330, 776×494, 748×616, 748×208), benchmarks toujours verts |
| `ref-03-bento-dark-pitch` | 4 slides en 1120×410 | scène 1600×900 + liseré de planche ; échelle typo ×1,4 ; la data-viz suit la scène au lieu de flotter dans un vide (barres 56 → 96 px et hauteurs ×3,1, isotypes 13 → 30 px) ; la slide 3 fusionne sa carte sombre et sa planche sombre, qui ne faisaient qu'une couche |

Deux constats que le lot a payés :

- **La légende d'un axe appartient à SA colonne.** Elle vivait dans une rangée séparée avec sa
  propre gouttière : à la première variation de largeur de colonne, les pilules d'années
  dérivaient sous les mauvaises barres. Déplacée dans la colonne, elle reste centrée quelles
  que soient les mesures.
- **`chart-01`, `chart-02` et `layout-01` n'avaient rien à recaler** : contrairement à ce que
  cette entrée annonçait, ils ne déclarent ni `geometry.root` ni `geometry.frame`. Un pattern
  n'est solidaire de son deck que s'il déclare un cadre — c'est le cas des quatre de `ref-11`,
  pas de ceux de `ref-03`.

**Calibration du seuil de la couche 1:1**, mesurée et non devinée (somme des écarts RGB des
couleurs effectives) : carte blanche sur planche sombre `Δ = 627` (composition, le liseré porte
la signature du deck) · carte sombre sur planche sombre `Δ = 87` (redondance) · planche
translucide sur fond en dégradé, la faute de `ref-13`, `Δ = 82` (redondance). Le seuil est à
**120** : il sépare les deux familles sans les frôler.

`ref-08-swiss-studio-hero` **n'est pas une dette** : visual-lab héberge des visuels de plusieurs
dimensions, et seule une référence qui EST une slide doit tenir le format PPT. ref-08 est un hero
de page web ; il déclare son média en clair dans son deck (`<!-- vl:stage web — … -->`) et le lint
le range en `~`. Une exemption muette aurait été pire qu'un lint rouge.

Et pour couper court au faux débat qui a déjà été rouvert une fois : **la scène 1600×900 de
visual-lab et la scène 1920×1080 de `deck-builder` ne se contredisent pas.** 1600 est la largeur
que `kit/vl_pptx.py` suppose pour convertir un fragment en .pptx ; 1920 est celle sur laquelle
deck-builder compose. Les deux sont en 16:9, et seuls les RATIOS voyagent de l'un à l'autre.

**`node bin/check-deck.mjs` sans argument est vert : 16 decks conformes** (au 12/08/2026).

---

## Règles de travail, valables dans tous les lots

1. **Fidélité d'abord, généralisation ensuite.** On reconstruit le deck complet au plus près
   de la spec, PUIS on en extrait les patterns. Jamais l'inverse : un pattern inventé avant
   d'avoir vu le rendu entier est toujours faux.
2. **Zéro dépendance réseau.** Ni CDN, ni Google Fonts, ni image distante. Polices : pile
   système, avec les fallbacks déclarés dans le `sys-*`.
3. **Un pattern = un fragment autonome**, qui se colle dans une page vide et se voit.
   Couleurs en variables `--vl-*`, jamais en dur — `bin/index.mjs` le vérifie et refuse
   d'écrire la base sinon.
4. **Preuve obligatoire** (`/verify`) : un PNG regardé, pas seulement produit — et pour un
   deck, les PNG **de chaque slide**, pas la seule planche-contact.
5. **Le compte de slides n'est pas négociable.** Le deck en compte exactement autant que la
   spec en annonce. Une slide sautée parce qu'elle « ressemble » à une autre est la faute
   qui se voit à l'usage. Si la spec elle-même paraît plus mince que la référence d'origine,
   le seul recours est que Léo recolle l'image dans la session : elle n'est pas sur disque,
   et personne ne peut la deviner.
6. **Pas de tableau Markdown dans la réponse à Léo** (il lit sur Telegram, cf. son
   CLAUDE.md). Dans les fichiers du dépôt, les tableaux sont autorisés.

---

## Prompt de reprise (à coller dans une session nettoyée)

```
Reprends visual-lab (~/visual-lab). Lis ROADMAP.md, puis la section de SPEC-SOURCES.md
qui correspond au prochain lot non coché — les images d'origine n'existent pas sur
disque, la spec les remplace.

Fais ce lot et lui seul, en suivant la « Procédure d'un lot » de la ROADMAP.

Le livrable est un deck AU FORMAT SLIDES : une <section class="slide"> par slide, à sa
taille réelle, autant de slides que la spec en annonce (aucune n'est facultative), et
AUCUNE grille de vignettes dans le fichier. Gabarits de forme : decks/ref-04.html pour
la structure d'un deck, patterns/card-03-stat-accent.* pour un pattern.

Ne me rends pas la main avant d'avoir exporté `node bin/slides.mjs decks/ref-NN-<slug>.html`
et REGARDÉ chaque slide en pleine taille, écarts corrigés. Finis par
`node bin/board.mjs decks/ref-NN-<slug>.html` pour vérifier le rythme d'ensemble.

Termine par : node bin/index.mjs, les PNG de chaque pattern, la case cochée ici, et
un commit.
```

### ✅ Lot 15 — `ref-14` layer-stack-coral (31/07/2026)
Référence apportée hors corpus initial : un visuel unique (≈ 888 × 494, pas un deck) — une pile
de plans isométriques légendée, demandée pour **schématiser les couches d'un logiciel** (front,
services, données). Menée en parallèle du lot `ref-15` dans le même dépôt.
- ✅ `SPEC-SOURCES.md` § `ref-14`, écrite AVANT le code.
- ✅ `systems/ref-14-layer-stack-coral.json` — une seule teinte, et la profondeur portée par
  l'OPACITÉ : rapport constant (× 0,42) d'une couche à la suivante, jamais une soustraction
  régulière. À pas soustractif, la troisième couche reste trop dense et la pile paraît plate.
- ✅ `decks/ref-14-layer-stack-coral.html` — une planche **1600×900**, rendue et comparée à la
  source pendant qu'elle était encore dans le contexte, y compris la dérive des filets.
- ✅ **Nouvelle famille `diagram`** (`bin/lib.mjs`, README) : un `chart` porte des DONNÉES, un
  `diagram` porte une STRUCTURE. Les confondre ferait chercher un schéma d'architecture dans la
  famille des histogrammes. Premier membre : `diagram-layer-stack`, 15 benchmarks, tous verts.
- ✅ Écart assumé avec la source, écrit dans les notes du pattern : la référence laisse les
  filets DÉRIVER (les blocs de texte coulent, la correspondance repose sur l'ordre de lecture) ;
  le pattern verrouille chaque filet sur le centre de SA couche. « C'est le troisième donc c'est
  celui du bas » n'est pas une correspondance dès que le schéma est technique. Le benchmark
  « le centre d'une couche échappe au plan du dessus » tient le seuil de pas (> 0,5 Hp) sans
  lequel le filet ne peut plus sortir du losange.
- ✅ Outillage : `bin/render.mjs --pattern` importe désormais `fonts/fonts.css`, comme
  `bin/check.mjs` le faisait déjà. Sans ça, le contrôle mathématique mesurait Archivo et la
  preuve visuelle montrait Helvetica — deux harnais qui ne regardent pas le même rendu.
- ⚠️ Le piège du lot : **deux sessions qui mesurent en même temps dans le même dépôt se
  marchent dessus.** `bin/check.mjs` et `bin/render.mjs` écrivent leur fichier temporaire à la
  RACINE, sous un nom prévisible ; un `node bin/check.mjs` complet lancé pendant le lot parallèle
  a rendu 12 faux échecs sur `card-05` et `chart-03` (mesures croisées, cadres d'un autre
  pattern). Repassés verts à l'unité, sans un octet changé. Le correctif propre — un nom de
  temporaire unique par processus — reste à faire.
- ✅ **Émetteur `.pptx` livré le 12/08/2026** (`vl_pptx.layer_stack`) : le pattern est disponible
  dans `deck-builder`. Trois pièges payés au rendu, tous invisibles au contrôle mathématique —
  les dix mesures étaient vertes sur un premier rendu fautif. (1) python-pptx n'expose AUCUNE
  transparence : l'alpha s'écrit dans le XML du remplissage, sinon les trois plans sortent
  identiques et le rang, qui EST l'information, disparaît. (2) Le `<p:style>` du thème ne
  s'enlève pas qu'aux aplats : un connecteur naît avec le sien, et un filet de 0,75 pt doublé
  d'une ombre grise se lit comme un trait sale. (3) L'ordre d'insertion porte la composition —
  les filets AVANT les losanges, parce qu'ils naissent dessous et que leur longueur visible est
  dictée par la forme. Et une contrainte que le fragment n'a pas : le pas est géométrique quand
  le corps est ancré au plancher en points, donc sous ≈ 12 " de large les rangées se
  chevauchent — l'émetteur refuse et donne la largeur minimale.

### ✅ Lot 16 — `ref-15` lilac-notched-kpi (31/07/2026)
Référence apportée hors corpus initial, fournie en **crop horizontal** (≈ 813 × 297) : une bande
de trois preuves chiffrées d'une landing SaaS, sans le titre de section ni le reste de la page.
Numérotée `ref-15` et non `ref-14` — le numéro était déjà pris par un lot mené en parallèle dans
le même dépôt, constaté sur disque avant le commit.
- ✅ `SPEC-SOURCES.md` § `ref-15`, écrite AVANT le code — l'image collée n'existe pas sur disque.
- ✅ `systems/ref-15-lilac-notched-kpi.json` — deux gestes seulement : le double chanfrein sur la
  diagonale (là où `ref-06` n'en coupe qu'UN, sans rayon) et le contraste de rangée (une seule
  vignette colorée sur trois).
- ✅ `decks/ref-15-lilac-notched-kpi.html` — une slide **1600×900 (PPT)** portant la bande seule,
  rendue et comparée à la source pendant qu'elle était encore dans le contexte.
- ✅ 1 pattern : `card-10-kpi-notch-tile` — 20 benchmarks, tous verts. Créé avec `--force` :
  `bin/new.mjs` le rapprochait de `card-02-notched-brief` sur le mot « notch », mais celui-ci ne
  porte aucun chiffre, aucun accent et un chanfrein unique. L'arbitrage est écrit dans les notes
  du pattern, pas seulement dans un commit.
- ✅ `fonts/` : **Montserrat variable** (OFL) ajoutée — la première géométrique du dépôt. Inter
  rendait le `99` trop étroit, Archivo trop mécanique. Registre `fonts/FONTS.md` à jour.
- ✅ Le piège du lot, consigné : `bin/check.mjs` lit `background-color` et jamais
  `background-image`. Sur un aplat en dégradé, la couleur de repli doit donc être l'extrémité la
  plus CLAIRE (3,20:1 mesurés) et non le départ saturé (6,03:1) — sinon la mesure de contraste
  garde le point le plus flatteur au lieu du plus défavorable.
- ✅ `node bin/index.mjs` vert (24 patterns, 11 références) une fois le lot parallèle réparé de
  son côté. `INDEX.md` / `index.json` sont régénérés mais **laissés hors de ce commit** : ils
  décrivent aussi le pattern du lot parallèle, encore non versionné, et un index qui référence
  des fichiers absents du dépôt ment plus qu'un index en retard. Ils partent avec l'autre lot.

### ✅ Lot 17 — `ref-17`, `ref-18`, `ref-19` : trois écrans front-end (11/08/2026)

Trois captures d'interface apportées ensemble — une page d'accueil bento monochrome, un tableau
de bord de ventes, un dossier clinique en feuille modale. **Premier lot du corpus où les images
sources sont réellement SUR LE DISQUE** : elles ont été retrouvées en base64 dans le transcript
de la session (`~/.claude/projects/…/*.jsonl`) et déposées dans `assets/refs/`. Conséquence
directe sur la méthode : les palettes sont **pipettées** et les géométries **scannées** (runs de
couleur ligne par ligne), là où les seize lots précédents estimaient à l'œil.

- ✅ `SPEC-SOURCES.md` § `ref-17`, `ref-18`, `ref-19`, écrites AVANT le code.
- ✅ 3 systèmes + 3 decks au format **`vl:stage web`** (1440 × 1042, 1440 × 1025, 1440 × 929) :
  aucun des trois n'est une slide, et chacun le déclare dans son propre fichier.
- ✅ 12 patterns, **194 benchmarks, tous verts** :
  `layout-05-nav-pill-bar` · `layout-06-bento-l-span` · `card-11-corner-arrow-tile` ·
  `tag-02-centered-cloud` · `layout-07-icon-rail-shell` · `card-12-inverted-kpi-row` ·
  `chart-05-tile-heatmap` · `tag-03-action-pill-bar` · `layout-08-sheet-handle-tab` ·
  `list-05-vitals-strip` · `diagram-02-branch-timeline` · `diagram-03-time-scrubber`.
- ✅ **Ce qui a été écarté, et c'est le cœur du lot** : un carton de présentation sur `ref-17`,
  **deux** couches sur `ref-18` (fond noir de planche + bezel de tablette, qui encadraient la
  même chose), un carton jaune sur `ref-19`. Le voile sombre de `ref-19`, lui, est GARDÉ : il
  porte des onglets et un bouton de fermeture. Le test qui tranche entre un voile et un bezel
  est là — **un bezel ne porte jamais de contenu** —, pas dans l'apparence.
- ✅ **Un arbitrage anti-doublon écrit plutôt que rejoué** : l'histogramme de `ref-18` (colonnes
  sans axe, une seule accentuée, info-bulle sombre ancrée) n'est PAS extrait — il double
  `chart-03-accent-column-callout` de `ref-13`, dont il ne diffère que par des tokens.
- ✅ **Trois outils amendés dans le même lot**, chacun pour une faute qu'il laissait passer :
  - `bin/diff.mjs` tirait tous les rendus à 1600 × 900 et **amputait** donc toute référence
    non-slide : le contrôle de fidélité comparait une source entière à un rendu tronqué,
    c'est-à-dire mentait dans le sens rassurant. Il lit maintenant la scène déclarée.
  - `bin/check.mjs` : `getComputedStyle()['--vl-notch']` rend `undefined`, jamais la valeur —
    un benchmark écrit sur un token sortait 0 sans qu'aucune erreur ne le dise. Les propriétés
    personnalisées passent désormais par `getPropertyValue()`.
  - `bin/palette.mjs` fabriquait son nom de sortie à partir du chemin d'entrée : pipetter un
    RENDU (et pas une source) échouait en ENOENT au dernier moment.
- ✅ **Le piège CSS du lot, payé deux fois** : le minimum automatique d'une piste `fr` ET celui
  d'un item flex valent tous deux `auto`. Un module trop plein pousse donc sa rangée, puis la
  page — 669 px de rangée pour 560 attendus, mesuré au premier rendu, sans qu'aucun benchmark
  de pattern ne crie. Il faut les DEUX gardes : `minmax(0, …fr)` sur les pistes et
  `min-height: 0` sur la grille. Aucune ne remplace l'autre.
- ✅ Trois relevés de contraste corrigés (encre secondaire à 4,09 / 4,21:1 sur son propre fond) :
  **troisième lot de suite** où la source place son gris secondaire juste sous le seuil. Le
  relevé se vérifie systématiquement avant d'être recopié.
- ✅ `node bin/index.mjs` vert (38 patterns, 15 références) · `bin/check-deck.mjs` vert sur les
  14 decks · rendus regardés et comparés à la source.

## Ce qui reste, en un coup d'œil

**À jour au 11/08/2026.** Le lot 12 est CLOS (karto et l'arbitrage de publication sont tranchés
depuis le 31/07 — cette ligne l'annonçait encore comme ouvert), et le lot 13 a soldé ses volets
email et social.

| ce qui reste | nature | ce que ça débloque | poids |
|---|---|---|---|
| ~~`ref-07` retro-brand-hero (lot 6)~~ | **soldée le 12/08/2026** | 4 patterns versés ; deux chiffres de la spec corrigés par la mesure (largeur du wordmark, largeurs du triptyque), et `overflow()` disqualifié comme instrument de containment sur un interligne écrasé | — |
| ~~`ref-08` swiss-studio-hero (lot 7)~~ | **soldée le 12/08/2026** | 2 patterns versés + `layout-13-image-triptych` généralisé : une seule bande rend ref-07 ET ref-08 par variables, prouvé par reparamétrage. La loi de la bande n'était pas le ratio commun mais la HAUTEUR commune. Avec elle, **les 16 références du corpus sont complètes** — plus une seule sans deck ni sans patterns | — |
| ~~`ref-10` campaign-board-red (lot 9)~~ | **soldée le 12/08/2026** | 3 patterns versés au lieu des 5 annoncés — les trois « patterns » qui nommaient un ÉLÉMENT sont absorbés par celui qui porte leur disposition ; la source a été corrigée deux fois (contraste du rouge, cellules centrées au lieu de pendre du filet) | — |
| ~~`ref-12` neon-capsule-tags~~ | **soldée le 12/08/2026** | le deck existe ; il a démenti l'unité que le pattern portait sans écran (`--vl-cap-u` 56 → 91 px) et sorti deux défauts qu'aucune mesure ne voyait — l'arrondi de bordure Chrome à la soudure, et le trou de rastérisation bout à bout | — |
| `ref-05` proposal-acid-yellow (lot 4) | matière — 8 slides | 5 patterns, dont une règle éditoriale à n'extraire que si elle a un rendu | 1 session |
| `ref-09` zine-annotated-blue (lot 8) | matière — 12 slides | `annotation-marker` : le générateur de tracés manuscrits, **le plus fort différenciateur anti-« AI slop » du corpus** | 1 session entière |
| ~~`ref-01` bento-pills-2030 (lot 10)~~ | **soldée le 12/08/2026** | 3 patterns versés au lieu des 4 annoncés — le rail à dégradé et le « toggle » sont le même objet à deux remplissages. Trois lois établies contre le relevé : `50%` donne une ellipse et non un stadium, un 4 × 3 carré est borné à 3/2 d'aspect (donc jamais 16:9), et un fragment dont la géométrie dépend d'une chasse doit épingler sa police | — |
| Formats éditoriaux social (lot 13) | matière — natif canal | les 7 patterns `social` sont TOUS des vignettes de donnée : rien pour une citation, un décryptage, un carousel | 1 session, à cadrer d'abord |
| `bin/compose.mjs` (lot 11) | outillage | assembler une slide depuis des ids + un système + un contenu JSON, sans copier-coller | ½ session |
| Émetteur PSD live-text (lot 13) | outillage | reprendre `build-livetext-psd.mjs`, aujourd'hui prisonnier de `gtm-content` | ½ session |
| Nom de temporaire unique par processus | **dette** | deux sessions en parallèle se marchent dessus : 12 faux échecs déjà payés le 31/07 | 20 min |
| ~~`pptx.emitter` sur `diagram-01`~~ | **soldée le 12/08/2026** | `vl_pptx.layer_stack` ; au passage, `bin/index.mjs` refuse désormais un `pptx.emitter` sans fonction derrière — deux patterns en portaient un | — |
| Émetteur .pptx de `list-02-ruled-index` | **dette** | son `pptx.emitter` annonçait un `index_rows` jamais écrit ; la déclaration est retirée, la liste ne sort donc pas en .pptx | 30 min |

Ce que rien ne mesure encore, et qui n'est pas dans le tableau parce que ce ne sont pas des
lots mais des trous nommés : la COMPOSITION d'un mailing, celle d'un post, et le détachement
d'un visuel par rapport à son sol (cf. DOCTRINE.md, « Les trous »).
