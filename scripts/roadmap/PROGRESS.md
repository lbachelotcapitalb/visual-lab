# PROGRESS — visual-lab, solder la roadmap du corpus

STATE: RUNNING
<!-- RUNNING (continue) | AWAITING_DECISION (halt, présenter le tableau au mainteneur) | BLOCKED (gate rouge, halt) | DONE (fini) | STOPPED (coupé par le mainteneur via `roadmap stop` — ne jamais relancer soi-même) -->
CURRENT_STEP: S6
UPDATED: 2026-08-12
LAST_COMMIT: 39c5b7e

## Objectif

Verser la matière qui manque au corpus et solder les dettes d'outillage — **un lot par session**,
chaque session repartant d'une fenêtre de contexte propre. La liste vient du tableau « Ce qui
reste » de [ROADMAP.md](../../ROADMAP.md), qui reste la référence : ce fichier n'est que l'ordre
d'exécution et l'état vivant.

## Ce qui rend cette chaîne différente des autres roadmaps

Elle tourne **sur la machine du mainteneur**, pas sur le VPS. Trois conséquences, et ce sont des
règles dures :

1. **Le dépôt est la SOURCE, pas un cache jetable.** Jamais de `git reset --hard`. Une autre
   session — celle du mainteneur — peut travailler dans le même dossier au même moment. On
   synchronise par `git pull --ff-only` ; s'il échoue, c'est une divergence : `STATE: BLOCKED`.
2. **Le commit NOMME ses chemins.** Jamais `git add -A`, jamais `git add .` : c'est la doctrine
   du dépôt, et elle existe précisément parce qu'un `-A` emporte le travail en cours d'une autre
   session dans ton commit (vécu le 31/07).
3. **On travaille sur `main`,** parce que c'est le régime normal de ce dépôt : chaque lot crée
   des fichiers neufs, `gallery.html` doit rester à jour en continu, et rien ici ne se déploie.

## Règles dures (jamais transgressées)

- **Charger `SKILL.md` du dépôt AVANT d'agir**, à chaque session. C'est le manuel opérateur :
  il porte l'ordre des gestes d'un versement et les pièges déjà payés. Ne pas le relire, c'est
  les repayer.
- **Aucun PNG livré, jamais.** Le raster (`bin/render.mjs`, `bin/diff.mjs`, `bin/contact-sheet.mjs`)
  est un instrument de mesure POUR TOI : sorties dans `proofs/`, gitignoré, **supprimé en fin de
  lot**. La vue du mainteneur est `gallery.html` et les decks. Ne lui ouvre jamais un dossier
  d'images.
- **Gate avant le commit FINAL de chaque step** :
  `node bin/index.mjs && node bin/check.mjs && node bin/check-deck.mjs` (exit 0).
  Compter ~90 s pour `check.mjs`. Rouge et non réparable proprement dans l'itération ⇒ revert le
  step, `STATE: BLOCKED`, halt.
- **Un pattern se garde s'il porte une COMPOSITION ou une géométrie mesurée** ; pas s'il tient
  dans sa propre phrase de description. Neuf patterns ont été retirés le 30/07 pour cette raison.
  Mieux vaut 2 patterns solides que 5 qui ne servent jamais.
- **Les benchmarks s'écrivent en RATIOS de `geometry.root`**, jamais en pixels — sauf une
  largeur imposée par un canal (600 px en email), qui se justifie alors en `notes`.
- **Amender l'outil fait partie du lot.** Une référence qui casse un détecteur corrige le
  détecteur, dans le MÊME commit. Un faux positif se corrige dans le détecteur, jamais dans la
  source.
- **La doc touchée est à jour dans le MÊME commit** (README « État », ROADMAP, DOCTRINE si une
  loi bouge). Une doc en retard décide à la place du code.
- **Le rendu se REGARDE.** `check.mjs` vert ne dit pas que c'est juste : il dit que c'est la
  bonne géométrie. Rendre, ouvrir le PNG, comparer à la spec — puis supprimer `proofs/`.

## Frontières (halt, décision du mainteneur)

- Un lot exige une **image source absente du disque** : `SPEC-SOURCES.md` la remplace et fait
  foi — ce n'est PAS une frontière, on travaille depuis la spec (les 12 premiers lots ont été
  faits ainsi). Ce qui change : `bin/diff.mjs` est impossible, donc le contrôle de fidélité se
  limite au regard et à `check-deck.mjs`. Le noter dans le commit.
- La spec est **muette ou contradictoire** sur un point structurant (nombre de slides, palette
  absente) : frontière.
- Un step marqué **FRONTIÈRE** ci-dessous : frontière, sans discussion.

## Checklist des steps

- [x] **S1 — Dette : `pptx.emitter` sur `diagram-01-layer-stack`.** Déclarer l'émetteur dans
      `kit/vl_pptx.py` + le champ `pptx.emitter` du JSON, pour que le pattern existe enfin dans
      `deck-builder`. Petit lot volontairement placé en tête : il vérifie la chaîne de bout en
      bout (gate, commit nommé, doc, relance) sur un périmètre où l'erreur coûte peu.
- [x] **S2 — `ref-12-neon-capsule-tags` : le deck manquant.** Les patterns existent sans
      reconstitution — le seul trou du corpus en sens inverse. Écrire `decks/ref-12-….html` selon
      la spec, et vérifier que les patterns déjà extraits en sortent bien (s'ils divergent, c'est
      la spec qui tranche, et on corrige les patterns).
- [x] **S3 — `ref-10-campaign-board-red` : extraire les patterns.** Le deck existe, aucun pattern
      n'en est sorti. Viser 2 à 4 patterns qui portent une composition.
- [x] **S4 — `ref-07-retro-brand-hero`.** Page web, pas une slide : le deck déclare sa scène en
      clair (`<!-- vl:stage web — … -->`) sinon le lint la refuse. Patterns visés :
      `hero-card-on-photo`, `nav-three-zone`, `hero-wordmark-bottom-left`, `image-triptych`.
- [x] **S5 — `ref-08-swiss-studio-hero` : extraire les patterns.** DÉPEND DE S4. La preuve du lot
      est que `hero-card-on-photo` et `image-triptych` produisent ref-07 ET ref-08 **par
      variables**, sans duplication — le tableau des différences est dans la spec.
- [ ] **S6 — `ref-01-bento-pills-2030`.** Couverture seule, purement géométrique. Reconstruire
      **à plat** : ne reproduire ni la perspective ni l'ombre de la photo d'origine.
- [ ] **S7 — `ref-05-proposal-acid-yellow`.** 8 slides. Neutre + UN accent fluo, header tri-parti,
      astérisque de marque. `accent-single-fluo` est une règle éditoriale : ne l'extraire que si
      elle a un rendu.
- [ ] **S8 — `ref-09-zine-annotated-blue`.** 12 slides, le lot le plus lourd du corpus : prévoir
      plusieurs sessions et s'appuyer sur le checkpoint intra-step. `annotation-marker` est un
      générateur SVG de tracés manuscrits dont **l'irrégularité des points de contrôle EST la
      fonctionnalité** — un tracé régulier redevient une forme géométrique et l'effet tombe.
- [ ] **S9 — `bin/compose.mjs`.** Assembler une composition depuis des ids de patterns + un
      système + un contenu JSON, sans copier-coller. Porter la même exigence que `emit.mjs` :
      échouer bruyamment, laisser VISIBLE toute variable non résolue.
- [ ] **S10 — FRONTIÈRE : formats éditoriaux social.** Les 7 patterns `media: social` sont tous
      des vignettes de DONNÉE ; rien pour une citation plein cadre, un décryptage en trois temps,
      une vue de carousel. Écrire ces patterns demande d'abord de trancher ce qu'est « un post de
      la maison » — c'est une décision du mainteneur, pas une déduction. Présenter le tableau et
      s'arrêter.
- [ ] **S11 — Émetteur PSD live-text.** Reprendre `build-livetext-psd.mjs` (aujourd'hui dans
      `~/.claude/skills/gtm-content/psd/` <!-- cible --> ) comme quatrième sortie du dépôt.
      Le code source vit HORS du dépôt : la chaîne tourne sur la machine qui le porte, donc elle
      y a accès — mais la PREMIÈRE sous-tâche du step est de le recopier dans `kit/`, sinon le
      dépôt publie un émetteur dont la source n'est nulle part.
- [ ] **S12 — Commiter le mécanisme d'INBOX** : l'étape 1-bis de `CONTINUATION_PROMPT.md` et
      `scripts/roadmap/INBOX.md` lui-même. _Pourquoi_ : déposé à chaud sans commit pour ne pas
      faire diverger la chaîne. Tant que ce n'est pas commité, une autre machine n'aurait pas
      l'étape 1-bis et perdrait la file. _(entré par l'INBOX le 2026-08-12)_
- [ ] **S13 — Mettre `frame.mjs` (ou un contrôle équivalent) dans le gate** : un pattern qui
      déclare `media: social` doit encore tenir le cadre 1080×1350 après modification.
      _Pourquoi_ : 7 patterns portent `media: social` depuis une mesure du 11/08 que rien ne
      rejoue quand la géométrie bouge — `tag-01-gooey-capsule` est passé de 56 à 91 px d'unité
      en S2 sans que sa déclaration soit revalidée. Une déclaration adossée à une mesure doit
      tomber quand la mesure change, sinon le catalogue ment en silence.
      _(entré par l'INBOX le 2026-08-12)_
- [ ] **S14 — Documenter le piège `overflow()` DANS `bin/check.mjs`**, à côté des autres pièges
      du harnais (`getPropertyValue`, `clipPath`, `bgOf`). _Pourquoi_ : S4 a établi qu'`overflow()`
      compte le débord de la boîte de CONTENU d'une ligne, que produit tout interligne sous 1
      (24 px de faux débord sur Archivo à 0,82). C'est consigné dans les notes de `title-03`,
      pas là où le prochain qui écrit un benchmark le lira.
      _(entré par l'INBOX le 2026-08-12)_

## Checkpoint intra-step

CHECKPOINT_STEP: S6

- [x] **S6.1 — la spec `ref-01` corrigée avant tout code.** Quatre points à trancher dans
      `SPEC-SOURCES.md` : l'échelle (la spec donne des px sans dire la taille de la cellule),
      `border-radius: 50%/50%` qui donne une ELLIPSE et non un stadium, le micro-pied
      (`#C9C7C4` sur `#F5F4F2` = 1,3:1 et ≈ 10 px, deux fois sous le plancher), et la loi
      d'aspect du bloc (4 colonnes × 3 rangées de cellules CARRÉES plafonne à 4:3 — il ne
      remplira jamais un 16:9, et c'est démontrable). **Fait (0a9729b)** : la géométrie retenue,
      la disposition et l'arbitrage des patterns sont tous écrits dans la section `ref-01` de
      `SPEC-SOURCES.md` — S6.2 à S6.4 n'ont plus rien à décider, seulement à coder ce qui y est.
      Repères pour la suite : cellule 232, gouttière 19, mosaïque 985 × 734 centrée, rangée
      d'index 24 px `#6E6C68`, et le rail de la primitive 2 = celui de la primitive 7 (même
      objet, deux remplissages).
- [ ] **S6.2 — `systems/` + `decks/ref-01-bento-pills-2030.html`** : une slide 1600×900, à plat
      (ni perspective ni ombre), `check-deck.mjs` vert.
- [ ] **S6.3 — `layout-15-primitive-mosaic`** : la grille + les huit primitives, benchmarks en
      ratios, `check.mjs` vert.
- [ ] **S6.4 — `shape-02-teardrop-quadrant` + `shape-03-stadium-track`** : la forme à un seul
      coin droit (4 orientations) et le stadium emboîté (rail + pastille / rail + dégradé, qui
      absorbe le `fill-gradient-stadium` annoncé seul par la spec).
- [ ] **S6.5 — les rendus REGARDÉS** (deck + les 3 patterns), corrections, `proofs/` supprimé.
- [ ] **S6.6 — gate complet, doc à jour dans le même commit** (ROADMAP lot 10, README « État »,
      SPEC-SOURCES), commit final + MAJ de PROGRESS.

<!-- Une case par sous-tâche du step en cours, écrite AVANT de commencer, cochée au fur et à
     mesure et poussée en commit `wip(<step>): …`. C'est ce qui permet de reprendre au milieu
     d'un step après un relais sur seuil de contexte ou un crash. -->

## Journal (append-only, le plus récent en haut)

- 2026-08-12 — S5 fait (39c5b7e). `ref-08` est extraite, et avec elle **les 16 références du
  corpus sont complètes** : plus une seule sans deck, plus une seule sans patterns. Ce que le
  lot devait prouver — qu'un pattern de `ref-07` rend aussi `ref-08` par variables — a d'abord
  obligé à corriger ce que ce pattern AFFIRMAIT. « Même ratio pour les trois cellules » n'est
  pas la loi d'une bande : c'est ce qu'on obtient à poids égaux, le cas particulier de `ref-07`.
  La loi est la HAUTEUR COMMUNE. Écrit à l'ancienne, `aspect-ratio` sur les trois cellules leur
  imposait trois hauteurs dès que les poids cessaient de l'être — la bande se disloquait et
  aucune variable ne pouvait la sauver ; posé sur la première seule, il donne sa taille
  transversale à la ligne flex et `stretch` la recopie. Le benchmark reparamètre le fragment aux
  valeurs de `ref-08` (1060 large, gouttière 16, hauteur 380, poids 1 / 1,31 / 1,14) et retrouve
  298 / 390,3 / 339,7 à 0,2 % près. Second enseignement, de méthode celui-là : le pattern qui
  MANQUE peut être une preuve. `layout-11-hero-card-on-photo` ne s'applique pas ici, et c'est
  son propre `avoid_when` qui le dit — sans sol photographique, ni incrustation ni marge de sol.
  Deux patterns versés : `layout-14-statement-first` et `title-04-name-fills-measure`, qui
  absorbe le `type-registered-superscript` que la spec annonçait seul. Acquis d'outillage qui
  resservira : le corps d'un nom d'enseigne est une FONCTION de la largeur
  (`calc(100cqw / chasse)`) et non une taille de charte — et il se mesure à l'ENCRE, au `Range`,
  jamais à la boîte du `h1`, qui fait la largeur utile quoi qu'on écrive dedans et ne prouve
  donc rien. Aucune image source sur disque : `bin/diff.mjs` impossible.

- 2026-08-12 — S4 fait (b5aa899). `ref-07` est versée et le corpus porte enfin une PAGE WEB :
  scène 1440×900 déclarée `vl:stage web`, deux couches (sol photo génératif → carte crème
  incrustée), quatre patterns. Le lot a corrigé sa spec deux fois, et les deux fois c'est la
  MESURE qui a tranché contre le texte : le wordmark fait 0,465 Wc et non 0,51 — l'assertion
  qui en dépendait (« côte à côte les deux blocs ne tiendraient pas ») était donc fausse, ce
  qui est vrai est la SATURATION de la rangée à 96 % ; et le triptyque a des largeurs égales
  là où la liste de patterns annonçait l'inverse, contre la table de géométrie de la même
  spec. Effet de bord d'outillage, celui qui resservira : `overflow()` est le mauvais
  instrument dès qu'un interligne passe sous 1. La boîte de CONTENU d'une ligne est plus haute
  que sa boîte de ligne (1,15 em contre 0,82 sur Archivo, soit 24 px qui dépassent),
  `scrollHeight` le compte, et un pattern parfaitement contenu sort rouge. La containment se
  mesure sur les BOÎTES ; que le débord soit du vide se prouve au canvas
  (`actualBoundingBoxDescent` = 1,6 % du corps, le débord optique des capitales rondes, pas un
  jambage) plutôt que de s'affirmer. Aucune image source sur disque : `bin/diff.mjs`
  impossible.

- 2026-08-12 — S3 fait. `ref-10` est extraite, et elle rend **trois** patterns quand la spec en
  annonçait cinq : `type-condensed-stack`, `mark-paren-number` et `type-micro-caps-block`
  nommaient un ÉLÉMENT, pas une composition — chacun tient dans sa propre phrase de
  description. `title-02-condensed-overlay-stack` les absorbe et porte ce qu'ils perdent
  isolés : leur DISPOSITION mutuelle (fer unique partagé par le titre et le numéro, contrepoids
  au coin diagonalement opposé). Restent `layout-10-bleed-column-inset` et
  `list-07-hairline-spec-table`. Le lot a corrigé sa source deux fois, et les deux corrections
  ont échappé à des harnais différents. Le rouge relevé (#E33A22, 3,57:1) passait le plancher
  du gros titre et échouait pour les micro-caps de 13 px écrites du MÊME rouge — c'est le
  troisième lot de suite où la source place son secondaire juste sous 4,5:1. Le second défaut
  n'était visible d'aucune mesure : les cellules du tableau centrées dans leur ligne faisaient
  flotter un libellé d'une ligne au milieu d'une valeur de trois, au lieu de le faire pendre du
  filet qui l'ouvre. Sorti par le seul regard sur le rendu, corrigé dans le deck ET dans le
  pattern, verrouillé par une assertion sur l'écart des premières lignes. Effet de bord du
  step : `bin/emit.mjs` ne rend plus du noir en silence quand un `var()` reste non résolu.
  Aucune image source sur disque : `bin/diff.mjs` impossible.

- 2026-08-12 — S2 fait. `ref-12` a son deck : le corpus n'a plus une seule référence à patterns
  sans reconstitution. Le deck a DÉMENTI le pattern, ce qui est l'intérêt du sens inverse —
  `--vl-cap-u` valait 56 px, une valeur jamais confrontée à une slide, qui laissait la pile à
  26 % de la largeur (DOCTRINE §1). Posée sur 1600×900 l'unité n'est plus libre : 8,03 u de pile
  plafonnent u à 97 px, et c'est 91 qui est retenu parce que Chrome arrondit une bordure CSS au
  pixel entier là où il ne le fait pas d'un stroke SVG (contour 5,335 → 5 px à chaque soudure,
  douze fois par slide). Deuxième défaut du même genre : bout à bout, les deux traits laissent
  un trou de rastérisation de ~0,7 px — débord de 0,05 u aux extrémités, couverture 0,30 → ≥ 0,99.
  Les treize benchmarks sont restés verts d'un bout à l'autre sans qu'on en touche un : ils sont
  en RATIOS, donc structurellement aveugles à l'échelle et à la rastérisation. Aucune image
  source sur disque : `bin/diff.mjs` impossible, fidélité tenue par la spec, le regard et
  `check-deck.mjs`. Effet de bord : la spec annonçait un `stack-keyword-flush-right` qui n'a
  jamais existé, et un id hors nomenclature — les deux sont corrigés.

- 2026-08-12 — S1 fait (671de7c). `vl_pptx.layer_stack` livré : `diagram-01` sort en .pptx. Les
  dix mesures d'`audit()` étaient vertes sur un rendu FAUTIF — c'est le regard qui a sorti les
  trois défauts (alpha absent, ombre de thème sur les connecteurs, filet posé par-dessus son
  losange). Effet de bord du step : `bin/index.mjs` vérifie désormais qu'un `pptx.emitter` mène
  à une fonction réelle, et deux déclarations sur sept étaient fictives.

- 2026-08-12 — chaîne armée en mode LOCAL (première du genre : le driver `handoff` était
  VPS-first). Kit posé, gate vérifié à la main (34/34 benchmarks, 14/14 decks), dette des
  temporaires à nom fixe soldée au préalable — sans elle, deux sessions concurrentes produisent
  de faux échecs.
