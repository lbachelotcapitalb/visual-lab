# ROADMAP — visual-lab

**But final : les 10 visuels du corpus reproduits en HTML**, et de chacun, les patterns
atomiques extraits en fragments réutilisables — pour pouvoir ensuite retravailler dessus et
composer d'autres slides, visuels ou pages.

Un lot = **une référence** = une session propre. Chaque lot se termine par une preuve PNG et
un commit. Le prompt de reprise est en fin de fichier.

Source de vérité du reverse-engineering : [SPEC-SOURCES.md](SPEC-SOURCES.md).
**Les images d'origine n'existent pas sur disque** — elles étaient collées dans le chat.
Ne jamais les redemander : la spec les remplace, elle contient palettes, échelles typo,
grilles, inventaire des éléments et pièges de fidélité.

---

## Procédure d'un lot (identique à chaque fois)

1. Lire la section `ref-NN` de `SPEC-SOURCES.md`.
2. Écrire `systems/sys-NN.json` : les tokens (palette, typo, rayons, marges) **et** la note
   de charte — ce qui fait tenir le système, pas seulement ses valeurs.
3. Écrire `decks/ref-NN.html` : la reconstitution **fidèle et complète** de la référence
   (toutes ses slides), avec son `:root` en dur dans le fichier.
4. Rendre et **regarder** : `node bin/render.mjs decks/ref-NN.html <w> <h>`, puis ouvrir le
   PNG. Corriger les écarts, re-rendre. Ne pas passer à l'étape 5 avant que ça ressemble.
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
- **Slides nombreuses = échelle CSS.** Pour une planche de 8 à 12 slides, écrire chaque
  slide à sa taille réelle (ex. 1600×900) et la réduire avec
  `transform: scale(.5); transform-origin: top left` dans une cellule de grille. Les valeurs
  typographiques du fichier restent alors celles de la spec, directement relisables.
- **Images.** Jamais d'URL distante : un `<div>` à ratio fixe rempli d'un dégradé gris
  (`--vl-ph-a` → `--vl-ph-b`) tient le rôle d'une photo N&B et ne périme pas.
- **Alignement des bas de bloc.** Dans une rangée de cartes, coller les libellés en bas
  (`margin-top: auto`) : sans ça la rangée se désaligne au premier changement de contenu.

---

## Lots

### ✅ Lot 0 — Socle (29/07/2026)
Dépôt, format de pattern, index SQLite régénérable, recherche plein texte, rendu PNG
headless, squelette de création. Audit écrit des 10 références → `SPEC-SOURCES.md`.

### ✅ Lot 1 — `ref-02` ghost-icon-claim (29/07/2026)
`sys-02`, `decks/ref-02.html`, 3 patterns : `pat-card-ghost-icon-claim`,
`pat-type-mixed-family-emphasis`, `pat-icon-ghost` (règle).
**C'est le gabarit de forme** — le relire avant d'attaquer un lot.

### ✅ Lot 2 — `ref-03` bento-dark-pitch (29/07/2026)
`sys-03`, `decks/ref-03.html` (4 slides), 7 patterns : `pat-layout-bento-nested`,
`pat-badge-pill-outline`, `pat-tile-kpi`, `pat-chart-isotype`, `pat-chart-bars-stadium`,
`pat-type-inline-highlight-pill`, `pat-icon-circle-arrow`.

### ⬜ Lot 3 — `ref-04` swiss-investor-blue
La plus grosse planche : **10 slides**. `systems/sys-04.json` est **déjà écrit** — reprendre
à l'étape 3 de la procédure.
Slides à reproduire, dans l'ordre (le rythme des fonds fait partie du livrable) :
couverture noire · PROBLEM blanc · PRODUCT blanc · TABLE OF CONTENT bleu · SOLUTION bleu ·
BUSINESS MODEL blanc · TEAM blanc · TRACTION bleu · ASK/CLOSING noir · UNIQUE VALUE blanc.
Patterns : `pat-layout-swiss-header-footer`, `pat-title-monster-caps`,
`pat-list-numbered-giant`, `pat-toc-two-column`, `pat-deck-rhythm-fullbleed` (`kind: rule`,
pas de HTML).

### ⬜ Lot 4 — `ref-05` proposal-acid-yellow
8 slides. Neutre + **un** accent fluo, header tri-parti, astérisque de marque.
Patterns : `pat-header-tripartite`, `pat-mark-asterisk`, `pat-cards-numbered-steps`,
`pat-title-hyphen-break`, `pat-accent-single-fluo` (`kind: rule`).

### ⬜ Lot 5 — `ref-06` orange-notched
8 slides. La signature est le **coin chanfreiné** (`clip-path`).
Patterns : `pat-shape-notched-card`, `pat-title-leading-rule`, `pat-list-index-rules`,
`pat-stat-block-accent`.

### ⬜ Lot 6 — `ref-07` retro-brand-hero
Page web, carte flottante sur photo, wordmark géant bas-gauche, triptyque portrait
haut-droite. Patterns : `pat-hero-card-on-photo`, `pat-nav-three-zone`,
`pat-hero-wordmark-bottom-left`, `pat-image-triptych`.

### ⬜ Lot 7 — `ref-08` swiss-studio-hero
**Dépend du lot 6.** C'est le MÊME squelette réglé autrement (phrase avant le nom, images
paysage en bas, aucun accent, typo neutre). Le lot est réussi si `pat-hero-card-on-photo` et
`pat-image-triptych` produisent les deux rendus **par variables**, sans être dupliqués.
Le tableau des différences ref-07 / ref-08 est dans la spec.
Patterns nouveaux : `pat-hero-statement-first`, `pat-type-registered-superscript`.

### ⬜ Lot 8 — `ref-09` zine-annotated-blue
12 slides. Le lot le plus technique : `pat-annotation-marker` est un générateur SVG de
tracés manuscrits (ovale d'encerclement, flèche courbe, soulignement ondulé, zigzag) dont
**l'irrégularité des points de contrôle est la fonctionnalité** — un tracé régulier
redevient une forme géométrique et l'effet tombe. C'est le plus fort différenciateur
anti-« AI slop » du corpus.
Patterns : `pat-annotation-marker`, `pat-type-lowercase-editorial`, `pat-type-vertical-rail`.

### ⬜ Lot 9 — `ref-10` campaign-board-red
3 slides. Typo condensée écrasée, collage d'images en overlay, tableau à filets.
Patterns : `pat-type-condensed-stack`, `pat-mark-paren-number`, `pat-table-hairline-rules`,
`pat-layout-image-collage-overlay`, `pat-type-micro-caps-block`.

### ⬜ Lot 10 — `ref-01` bento-pills-2030
1 slide de couverture, purement géométrique. Reconstruire **à plat** : ne pas reproduire la
perspective ni l'ombre de la photo d'origine.
Patterns : `pat-layout-bento-primitives`, `pat-shape-teardrop`, `pat-shape-toggle`,
`pat-fill-gradient-stadium`.

### ⬜ Lot 11 — Composition
Ce qui transforme la collection en outil :
- `bin/compose.mjs` — assembler une slide à partir d'ids de patterns + un `sys-*` + un
  contenu JSON, sans copier-coller manuel.
- Garde-fou : un pattern posé sur un système incompatible (accent manquant, token absent)
  doit **échouer bruyamment**, pas rendre du gris.
- `bin/contact-sheet.mjs` — planche-contact PNG de tous les patterns, pour choisir à l'œil.

### ⬜ Lot 12 — Skill + carte
- Skill `visual-lab` dans `~/.claude/skills/` (symlink vers ce dépôt, convention maison —
  cf. `claude-config/skills/SOURCES.md`), écrit avec `/skill-dev`. Il doit dire en quoi il
  complète `deck-builder` (.pptx), `theme-factory` (appliquer un thème existant),
  `frontend-design` (inventer une direction) et `bestfront` (la boucle de vérification).
- Enregistrement dans karto via `/karto-sync`.
- Arbitrage à poser à Léo : dépôt GitHub distant ou local seul.

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
4. **Preuve obligatoire** (`/verify`) : un PNG regardé, pas seulement produit.
5. **Pas de tableau Markdown dans la réponse à Léo** (il lit sur Telegram, cf. son
   CLAUDE.md). Dans les fichiers du dépôt, les tableaux sont autorisés.

---

## Prompt de reprise (à coller dans une session nettoyée)

```
Reprends visual-lab (~/visual-lab). Lis ROADMAP.md, puis la section de SPEC-SOURCES.md
qui correspond au prochain lot non coché — les images d'origine n'existent pas sur
disque, la spec les remplace.

Fais ce lot et lui seul, en suivant la « Procédure d'un lot » de la ROADMAP. Prends
decks/ref-03.html et patterns/pat-tile-kpi.* comme gabarits de forme.

Ne me rends pas la main avant d'avoir REGARDÉ le PNG du deck et corrigé les écarts.
Termine par : node bin/index.mjs, les PNG de chaque pattern, la case cochée ici, et
un commit.
```
