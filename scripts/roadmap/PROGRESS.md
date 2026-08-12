# PROGRESS — visual-lab, solder la roadmap du corpus

STATE: RUNNING
<!-- RUNNING (continue) | AWAITING_DECISION (halt, présenter le tableau au mainteneur) | BLOCKED (gate rouge, halt) | DONE (fini) | STOPPED (coupé par le mainteneur via `roadmap stop` — ne jamais relancer soi-même) -->
CURRENT_STEP: S7
UPDATED: 2026-08-12
LAST_COMMIT: d3d8ba0

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
- [x] **S6 — `ref-01-bento-pills-2030`.** Couverture seule, purement géométrique. Reconstruire
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
- [ ] **S15 — Contrôler l'AUTONOMIE TYPOGRAPHIQUE d'un fragment DANS le harnais** : rejouer les
      benchmarks sous une famille hôte imposée (un serif, par exemple) et exiger que les ratios
      ne bougent pas. _Pourquoi_ : S6.5 a trouvé un pattern dont le corps dépendait de la police
      de la page HÔTE, et l'a épinglé — mais seulement pour lui. Le contrat du dépôt (README,
      point 5) AFFIRME qu'un fragment est autonome ; rien ne le vérifie. Un pattern qui hérite sa
      métrique de la page rendra autrement chez celui qui le colle, pendant que son benchmark
      reste vert — le harnais impose sa propre police, donc il ne peut pas voir le défaut qu'il
      est censé exclure. La contre-épreuve existe déjà, elle a servi une fois : il reste à en
      faire un contrôle. Point de départ mesuré le 12/08 : huit patterns portent du texte sans
      déclarer de famille (`card-02`, `card-03`, `chart-02`, `layout-01`, `layout-13`, `list-02`,
      `tag-01`, `title-01`). _(entré par l'INBOX le 2026-08-12)_

## Checkpoint intra-step

CHECKPOINT_STEP: S7

- [x] **S7.1 — la spec `ref-05` complétée avant tout code.** La section actuelle de
      `SPEC-SOURCES.md` tient en 35 lignes : elle donne la palette, la typo, le header et les
      éléments de signature, mais **pas le plan des 8 slides**, pas la géométrie, pas l'échelle
      — et son gris de corps est sous le seuil de contraste. Quatre points à trancher et à
      ÉCRIRE dans la spec : l'échelle (relevé sur une planche à ~1000 px/slide, comme ref-06),
      le contraste de `#7A7A7A` sur `#EFEFED`, le plan slide par slide, et le sort d'
      `accent-single-fluo` (règle éditoriale : n'a de rendu que si un objet la porte).
      **Fait** : les quatre sont tranchés et écrits dans `SPEC-SOURCES.md`, S7.2→S7.5 n'ont plus
      rien à décider. Échelle ×1,6 (display 109 / chiffre 90 / corps 19 / micro 13), gris de
      corps `#7A7A7A` → `#6C6C6C` (3,73:1 → 4,56:1 sur le fond ; il était sous le seuil des DEUX
      côtés, blanc compris à 4,29:1), plan des 8 slides en tableau avec l'objet jaune de chacune,
      et `accent-single-fluo` NON extrait — c'est une règle, pas une composition : elle devient
      un benchmark de surface (≤ 12 % de la slide) porté par les patterns qui posent du jaune.
      Repères pour la suite : marge 72, filet du header à ~126, zone de contenu 1456 × ~700,
      gouttières 24 (intra-rangée) et 32 (inter-blocs), rayons 19 / 22 / 26 / 32.
- [x] **S7.2 — `systems/ref-05-proposal-acid-yellow.json` + le deck, slides 1 à 4.** **Fait** :
      couverture (display césuré + carré noir à astérisque + carré média), contents (index fileté
      dont la ligne courante porte le seul filet jaune), about (deux colonnes + bandeau noir à
      badge jaune), how we work (rangée 01→04, la 02 jaune, la 04 noire). `check-deck.mjs` vert
      sur les 4. Police : « Hanken Grotesk » (variable 100–900), la seule grotesk du dépôt qui
      tienne le `0.12em` des capitales du header. La rangée de cartes est BORNÉE à 440 px de
      haut, pas en `flex:1` — leçon de ref-06, et ici elle a un second effet : à hauteur libre
      la carte jaune passait à 11,9 % de la slide, contre 10,6 % bornée, pour un plafond de 12 %.
- [x] **S7.3 — le deck, slides 5 à 8, `check-deck.mjs` vert** (une seule couche au-dessus de la
      scène, pas de marge de page, 1600×900). **Fait** : the challenge (4 cartes de liste, une
      noire, une jaune, deux blanches), what we deliver (3 cartes + carré média, astérisque en
      fin de titre), investment (prix filetés + carte de total en aplat jaune), clôture (display
      césuré `Thank-` / `you` + carré noir à astérisque). Les 32 contrôles de composition sont
      verts, zéro couche au-dessus de la scène sur 7 slides sur 8. Piège relevé en chemin, et
      c'est la leçon du lot : **la règle de l'accent unique est une contrainte de DIMENSION,
      pas seulement de compte.** La carte de total, laissée à pleine hauteur de colonne (460 ×
      669), couvrait 21,4 % de la slide — le double du plafond de 12 % — alors qu'elle était
      bien le SEUL objet jaune. Bornée à 460 × 300 : 9,6 %. Même mécanique que la rangée de
      cartes de la slide 4. Corrigé au passage dans la spec : sa ligne du plan annonçait une
      carte de total NOIRE dans une slide dont l'accent était « le total » — contradiction dans
      la même ligne du tableau.
- [x] **S7.4a — les DEUX patterns, verts et contre-éprouvés.** `title-05-hyphen-break` (13
      benchmarks) et `shape-04-asterisk-mark` (15). **Fait** : le titre n'est pas une césure mais
      une SOUDURE de locution — le trait remplace l'espace de deux mots entiers, et la loi de
      forme n'est pas l'égalité des lignes (`Thank-` / `you` la dément) mais que le trait d'union
      soit l'ENCRE LA PLUS À DROITE du bloc. L'astérisque se mesure sur la forme PEINTE : 720
      sondages comptent six arcs, puis l'axe de chaque branche est relevé au barycentre des
      points peints en travers d'elle. Le premier jet — six sondages à 0,7 R — restait vert sur
      une branche décalée de 10° ; contre-épreuves rejouées après correction (branche à 40°,
      branche retirée) : rouges. `--vl-ink` n'existe pas dans ce système, c'est `--vl-black`.
- [x] **S7.4b — LA CORRECTION QUI EN SORT, à porter dans le deck, le système et la spec.**
      Mesuré pendant S7.4a : `#EAFF00` sur `#EFEFED` vaut **1,03:1**. Or la slide 6 pose
      l'astérisque en JAUNE en fin de titre, sur le fond clair — invisible en gris, à l'export
      PDF, et vibrant à l'écran. Le système l'écrivait déjà à sa manière (« le jaune ne colore
      jamais du texte ») et rien ne le vérifiait. Règle exacte : **le jaune ne descend jamais
      sur le fond clair — il y est en aplat, ou en encre SUR NOIR.** Trois gestes :
      (1) `decks/…` slide 6 : l'astérisque en ligne passe à `var(--vl-black)` ; et les deux
      `.ast` des carrés se dimensionnent par CSS à `54%` du carré (loi du pattern) au lieu de
      `width=72` / `width=160` en attribut ;
      (2) `systems/ref-05….json` : reformuler la phrase sur le jaune (aplat OU encre sur noir),
      elle est fausse telle quelle puisque l'astérisque du carré EST une encre ;
      (3) `SPEC-SOURCES.md` : même reformulation dans « Éléments signature », et la ligne 6 du
      plan des 8 slides annonce un accent qui n'existe plus — cette slide n'en porte pas, ce que
      la charte autorise. Corriger comme S7.3 a corrigé la ligne 7.
      **Fait** : les trois gestes sont portés. L'astérisque en ligne de la slide 6 est en
      `--vl-black` (regardé : il se lit, là où le jaune vibrait) et les deux `.ast` des carrés
      se dimensionnent par `.ast-box > .ast { width: 54%; height: 54% }` — le 160 px du grand
      carré valait 0,533, pas 0,54. La slide 6 ne porte donc plus AUCUN accent, et c'est le
      second corollaire écrit dans la spec au passage : `≤ 12 %` est un PLAFOND, pas un quota,
      une slide a le droit de n'avoir aucun jaune. `check-deck.mjs` reste vert (32/32).
- [x] **S7.5a — `card-14-numbered-steps`** : la rangée 01→04 dont une seule carte est accentuée.
      _Scindé de S7.5 le 12/08 : deux patterns à benchmarks ne tiennent pas dans une fenêtre,
      et une case non cochée fait refaire le travail entier à la session suivante._
      **Fait**, 19 benchmarks verts. Ce que le pattern porte : DEUX RAILS obtenus d'un seul
      `justify-content: space-between` — les quatre chiffres pendent du même plafond, les
      quatre textes poussent du même plancher, ALORS QUE leurs blocs n'ont pas la même hauteur
      (rapport 1,4). C'est cette dissociation qui est assertée, pas l'alignement seul : une
      pile centrée aligne aussi tant que les textes font la même longueur. La contre-épreuve
      de la borne est le benchmark qui compte : `--vl-nsteps-h` reparamétré à 700 fait passer
      la carte accentuée à 1,40 × le plafond de 12 % — elle prouve que la borne SERT, au lieu
      de constater que la valeur par défaut passe. Deux pièges repayés du gabarit : un `var()`
      à FALLBACK hexadécimal est une couleur en dur pour `index.mjs` (à raison — le fallback
      est ce qui rend en silence quand le token manque), et un fragment sans largeur déclarée
      se mesure à la largeur du harnais (676 px au lieu de 1456) : 7 benchmarks rouges pour une
      raison qui n'était pas la leur.
- [x] **S7.5b — `layout-16-header-tripartite`** : le header 3 zones réutilisable hors charte.
      **Fait**, 20 benchmarks verts. Deux lois portées. (1) Le centre est sur l'AXE DU
      CONTENEUR par construction — deux rails `minmax(0, 1fr)` qui se font face — et non entre
      ses deux voisins : ici l'encre de gauche fait 0,4 fois celle de droite, un `space-between`
      décale donc le centre de 5,4 % de la largeur. (2) Un appareil n'est pas un titre : UN
      SEUL corps et DEUX niveaux d'encre dans toute la bande, le jeton de droite n'ayant que
      l'encre et la position pour se distinguer de la mention atténuée qui le précède. Deux
      pièges payés, tous deux d'écriture de benchmark. `box()` du harnais est en coordonnées
      RELATIVES À LA RACINE, un `getBoundingClientRect()` brut (le seul moyen de mesurer une
      encre, au `Range`) est en coordonnées de VUE : les mélanger a donné un rouge de 40 px sur
      une géométrie juste, et surtout un VERT sur un bord d'encre faux de 40 px dans l'autre
      sens. Et la contre-épreuve du `minmax(0, …)` a d'abord été écrite trop faible : un libellé
      long mais SÉCABLE se replie tout seul, si bien que `1fr` nu passait aussi — c'est un
      libellé INSÉCABLE plus large que son rail qui sépare les deux (54 px de dérive contre 0).
      Une contre-épreuve doit reparamétrer là où les constructions divergent, pas là où l'une
      est simplement plus confortable.
- [x] **S7.6 — les rendus REGARDÉS** (deck + patterns), corrections, `proofs/` supprimé.
      **Fait** : 8 slides et 4 patterns rendus et ouverts. Les quatre patterns sont justes tels
      quels — les deux rails de `card-14` tiennent (les libellés pendent à deux hauteurs, les
      paragraphes partagent leur plancher), le centre de `layout-16` est sur l'axe, l'astérisque
      prend bien l'encre de son sol dans ses trois emplois. Un seul défaut au deck, et il était
      invisible de toute mesure : **la slide 7 portait 300 px de bande morte** sous son titre,
      et ses deux blocs du bas ne partageaient aucune ligne de départ. Cause exacte : la borne
      de 300 px posée en S7.3 sur la carte de total avait DÉPLACÉ le défaut — un objet dont la
      dimension est contrainte ne peut pas tenir une colonne, il doit changer de PLACE. Le total
      remonte dans la bande de titre (dont il partage la ligne de départ) et le tableau de prix
      prend toute la hauteur restante ; plus une seule bande morte, `check-deck.mjs` reste vert
      (32/32). Corrigé au passage : l'en-tête du deck affirmait encore « le jaune n'est jamais
      une encre » — la formulation que S7.4b a précisément démentie, à trois lignes de la
      version juste. Une doc en retard DANS le fichier qu'elle décrit décide à la place du code.
- [ ] **S7.7 — gate complet, doc à jour dans le même commit** (ROADMAP lot 4, README « État »,
      SPEC-SOURCES), commit final + MAJ de PROGRESS.

<!-- Une case par sous-tâche du step en cours, écrite AVANT de commencer, cochée au fur et à
     mesure et poussée en commit `wip(<step>): …`. C'est ce qui permet de reprendre au milieu
     d'un step après un relais sur seuil de contexte ou un crash. -->

## Journal (append-only, le plus récent en haut)

- 2026-08-12 — S6 fait (d3d8ba0). `ref-01` est versée et le corpus compte **17 références
  complètes**. La spec annonçait quatre patterns, il en sort trois : le « toggle » et le rail à
  barre en dégradé ne sont pas deux primitives mais **le même objet à deux remplissages**, et
  c'est cette identité que `shape-03-stadium-track` verse — la spec la manquait en les listant à
  part. Trois lois établies, toutes réutilisables hors de ce lot. (1) Un rayon écrit en `%` se
  résout par AXE : `50%/50%` sur une boîte 2:1 est une ellipse, pas un stadium — et lire la
  valeur calculée ne le voit pas, Chrome rend le `%` tel quel, donc les benchmarks sondent la
  forme PEINTE au point sur cinq et six angles. (2) Une grille de cellules carrées a un aspect
  BORNÉ : 4 × 3 plafonne à 3/2, un 16:9 exigerait une gouttière négative — ce n'est pas un
  arbitrage de cadrage mais une impossibilité, et le benchmark ne la calcule pas, il reparamètre
  la gouttière de 0 à 1000 px et constate. (3) Sortie du seul CONTRÔLE VISUEL, et c'est
  l'enseignement de méthode du lot : **un fragment dont une cote dépend d'une chasse doit
  épingler sa police**. Le corps de l'année vaut `calc(100cqw / 1,216)` ; sans famille déclarée
  il saturait 88 % sous `check.mjs` — qui sert « Helvetica Neue » en tête — et 97 % sous
  `render.mjs`, qui sert la police système. Le benchmark était vert sur un rendu où les chiffres
  léchaient le bord de la pilule : **un harnais qui impose sa propre police ne peut pas voir le
  défaut qu'il est censé exclure.** Corrigé, et doublé d'une assertion qui remesure la saturation
  sous un serif imposé à la racine du fragment (contre-épreuve : rouge sans le correctif).
  Le mainteneur a enqueué la généralisation pendant le lot — elle est reportée en S15. Aucune
  image source sur disque : `bin/diff.mjs` impossible.

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
