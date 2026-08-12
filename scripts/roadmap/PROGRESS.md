# PROGRESS — visual-lab, solder la roadmap du corpus

STATE: RUNNING
<!-- RUNNING (continue) | AWAITING_DECISION (halt, présenter le tableau au mainteneur) | BLOCKED (gate rouge, halt) | DONE (fini) | STOPPED (coupé par le mainteneur via `roadmap stop` — ne jamais relancer soi-même) -->
CURRENT_STEP: S1
UPDATED: 2026-08-12
LAST_COMMIT: (aucun)

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

- [ ] **S1 — Dette : `pptx.emitter` sur `diagram-01-layer-stack`.** Déclarer l'émetteur dans
      `kit/vl_pptx.py` + le champ `pptx.emitter` du JSON, pour que le pattern existe enfin dans
      `deck-builder`. Petit lot volontairement placé en tête : il vérifie la chaîne de bout en
      bout (gate, commit nommé, doc, relance) sur un périmètre où l'erreur coûte peu.
- [ ] **S2 — `ref-12-neon-capsule-tags` : le deck manquant.** Les patterns existent sans
      reconstitution — le seul trou du corpus en sens inverse. Écrire `decks/ref-12-….html` selon
      la spec, et vérifier que les patterns déjà extraits en sortent bien (s'ils divergent, c'est
      la spec qui tranche, et on corrige les patterns).
- [ ] **S3 — `ref-10-campaign-board-red` : extraire les patterns.** Le deck existe, aucun pattern
      n'en est sorti. Viser 2 à 4 patterns qui portent une composition.
- [ ] **S4 — `ref-07-retro-brand-hero`.** Page web, pas une slide : le deck déclare sa scène en
      clair (`<!-- vl:stage web — … -->`) sinon le lint la refuse. Patterns visés :
      `hero-card-on-photo`, `nav-three-zone`, `hero-wordmark-bottom-left`, `image-triptych`.
- [ ] **S5 — `ref-08-swiss-studio-hero` : extraire les patterns.** DÉPEND DE S4. La preuve du lot
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

## Checkpoint intra-step

CHECKPOINT_STEP: S1

- [ ] 1. `scale()` sait s'ancrer sur `note`, et `layer_stack()` est écrit dans `kit/vl_pptx.py`
- [ ] 2. le bloc `pptx` est déclaré dans `patterns/diagram-01-layer-stack.json`
- [ ] 3. lint : `bin/index.mjs` refuse un `pptx.emitter` dont la fonction n'existe pas dans le kit
- [ ] 4. contrôle : un .pptx de démonstration est produit, `audit()` est vert, le rendu est REGARDÉ
- [ ] 5. gate + doc à jour + commit final

<!-- Une case par sous-tâche du step en cours, écrite AVANT de commencer, cochée au fur et à
     mesure et poussée en commit `wip(<step>): …`. C'est ce qui permet de reprendre au milieu
     d'un step après un relais sur seuil de contexte ou un crash. -->

## Journal (append-only, le plus récent en haut)

- 2026-08-12 — chaîne armée en mode LOCAL (première du genre : le driver `handoff` était
  VPS-first). Kit posé, gate vérifié à la main (34/34 benchmarks, 14/14 decks), dette des
  temporaires à nom fixe soldée au préalable — sans elle, deux sessions concurrentes produisent
  de faux échecs.
