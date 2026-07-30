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

## Le livrable d'un lot est un DECK AU FORMAT SLIDES

Un deck s'écrit **une `<section class="slide">` par slide, à sa taille réelle** (celle de la
spec, ex. 1600 × 900). Le fichier ne sait rien de la façon dont on le regarde : il n'y a ni
grille de vignettes ni `transform: scale()` dans `decks/ref-NN.html`. Les deux vues se
**dérivent** :

```bash
node bin/slides.mjs decks/ref-NN.html
```

→ `proofs/ref-NN/slide-01.png` … une image par slide, pleine taille. **C'est la preuve qui
compte** : à 50 %, une micro-typo de 8 px est illisible et les écarts se cachent.

```bash
node bin/board.mjs decks/ref-NN.html
```

→ `proofs/ref-NN.png`, la planche-contact. Elle sert à juger **le rythme d'ensemble** (ordre
des fonds, alternance, équilibre du deck), jamais à valider une slide.

**Ce qui est un deck, et ce qui n'en est pas un.** Le format slides vaut pour les 6 decks :
`ref-03` (4 slides) · `ref-04` (10) · `ref-05` (8) · `ref-06` (8) · `ref-09` (12) ·
`ref-10` (3). Les quatre autres références n'ont pas de slides : `ref-01` est une couverture
seule, `ref-02` un visuel unique, `ref-07` et `ref-08` sont des pages web.

---

## Procédure d'un lot (identique à chaque fois)

1. Lire la section `ref-NN` de `SPEC-SOURCES.md`.
2. Écrire `systems/sys-NN.json` : les tokens (palette, typo, rayons, marges) **et** la note
   de charte — ce qui fait tenir le système, pas seulement ses valeurs.
3. Écrire `decks/ref-NN.html` **au format slides** (cf. section ci-dessus) : la
   reconstitution fidèle et **complète** — le deck doit compter exactement le nombre de
   slides annoncé par la spec, aucune n'est facultative. Le `:root` du système est en dur
   dans le fichier.
4. Exporter et **regarder chaque slide** : `node bin/slides.mjs decks/ref-NN.html`, puis
   ouvrir les PNG un par un. Corriger, ré-exporter (`--only N` pour une seule slide).
   Finir par `node bin/board.mjs decks/ref-NN.html` pour juger le rythme d'ensemble.
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

---

## Lots

### ✅ Lot 0 — Socle (29/07/2026, complété le 30/07)
Dépôt, format de pattern, index SQLite régénérable, recherche plein texte, rendu PNG
headless, squelette de création. Audit écrit des 10 références → `SPEC-SOURCES.md`.
Ajout du 30/07 : `bin/slides.mjs` (export slide par slide, pleine taille) et
`bin/board.mjs` (planche-contact dérivée) — les deux vues d'un deck écrit en format slides.

### ✅ Lot 1 — `ref-02` ghost-icon-claim (29/07/2026)
`sys-02`, `decks/ref-02.html`, 3 patterns : `pat-card-ghost-icon-claim`,
`pat-type-mixed-family-emphasis`, `pat-icon-ghost` (règle).
**C'est le gabarit de forme** — le relire avant d'attaquer un lot.

### ✅ Lot 2 — `ref-03` bento-dark-pitch (29/07/2026)
`sys-03`, `decks/ref-03.html` — 4 slides 1120×410, déjà au format slides (vérifié le 30/07,
export dans `proofs/ref-03/`). 7 patterns : `pat-layout-bento-nested`,
`pat-badge-pill-outline`, `pat-tile-kpi`, `pat-chart-isotype`, `pat-chart-bars-stadium`,
`pat-type-inline-highlight-pill`, `pat-icon-circle-arrow`.

### ✅ Lot 3 — `ref-04` swiss-investor-blue (30/07/2026)
`decks/ref-04.html` — **10 slides 1600×900 au format slides**, rythme des fonds respecté,
exportées une par une dans `proofs/ref-04/`. 5 patterns :
`pat-layout-swiss-header-footer`, `pat-title-monster-caps`, `pat-list-numbered-giant`,
`pat-toc-two-column`, `pat-deck-rhythm-fullbleed` (`kind: rule`, pas de HTML).
`sys-04.json` était déjà écrit et n'a pas eu besoin d'être retouché.

### ⬜ Lot 4 — `ref-05` proposal-acid-yellow
**8 slides** (format slides, une section par slide). Neutre + **un** accent fluo, header
tri-parti, astérisque de marque.
Patterns : `pat-header-tripartite`, `pat-mark-asterisk`, `pat-cards-numbered-steps`,
`pat-title-hyphen-break`, `pat-accent-single-fluo` (`kind: rule`).

### 🟡 Lot 5 — `ref-06` orange-notched — reconstitution faite, patterns à extraire
**8 slides.** La signature est le **coin chanfreiné** (`clip-path`).
Patterns : `pat-shape-notched-card`, `pat-title-leading-rule`, `pat-list-index-rules`,
`pat-stat-block-accent`.

**Fait le 30/07/2026 : la reconstitution.** `systems/sys-06.json` et `decks/ref-06.html` —
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

**Reste à faire** : les patterns (étapes 5 à 7 de la procédure), puis `node bin/index.mjs`.

### ⬜ Lot 6 — `ref-07` retro-brand-hero
Page web, carte flottante sur photo, wordmark géant bas-gauche, triptyque portrait
haut-droite. Patterns : `pat-hero-card-on-photo`, `pat-nav-three-zone`,
`pat-hero-wordmark-bottom-left`, `pat-image-triptych`.

### 🟡 Lot 7 — `ref-08` swiss-studio-hero — reconstitution faite, patterns à extraire
**Fait le 30/07/2026, HORS ordre** (demande directe de Léo sur le visuel source) :
`systems/sys-08.json` et `decks/ref-08.html` — **la slide seule, 1140×848, bord à bord** :
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

**Reste à faire** : les patterns. `pat-hero-statement-first`,
`pat-type-registered-superscript`, et surtout la preuve du lot — que
`pat-hero-card-on-photo` et `pat-image-triptych` (lot 6, pas encore écrits) produisent
ref-07 ET ref-08 **par variables**, sans duplication. Le tableau des différences est dans
la spec. Faire le lot 6 d'abord, puis revenir extraire ici.

### ⬜ Lot 8 — `ref-09` zine-annotated-blue
**12 slides** — la plus grosse planche du corpus, prévoir la session entière. Le lot le plus technique : `pat-annotation-marker` est un générateur SVG de
tracés manuscrits (ovale d'encerclement, flèche courbe, soulignement ondulé, zigzag) dont
**l'irrégularité des points de contrôle est la fonctionnalité** — un tracé régulier
redevient une forme géométrique et l'effet tombe. C'est le plus fort différenciateur
anti-« AI slop » du corpus.
Patterns : `pat-annotation-marker`, `pat-type-lowercase-editorial`, `pat-type-vertical-rail`.

### ⬜ Lot 9 — `ref-10` campaign-board-red
**3 slides.** Typo condensée écrasée, collage d'images en overlay, tableau à filets.
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
la structure d'un deck, patterns/pat-tile-kpi.* pour un pattern.

Ne me rends pas la main avant d'avoir exporté `node bin/slides.mjs decks/ref-NN.html`
et REGARDÉ chaque slide en pleine taille, écarts corrigés. Finis par
`node bin/board.mjs decks/ref-NN.html` pour vérifier le rythme d'ensemble.

Termine par : node bin/index.mjs, les PNG de chaque pattern, la case cochée ici, et
un commit.
```

## Ce qui reste, en un coup d'œil

Decks à produire : `ref-05` (8 slides) · `ref-06` (8) · `ref-09` (12) · `ref-10` (3).
Non-decks à produire : `ref-07` et `ref-08` (pages web) · `ref-01` (couverture seule).
Puis les deux lots d'outillage : composition (11) et skill + carte (12).
