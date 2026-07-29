# ROADMAP — visual-lab

Objectif : transformer 10 références visuelles en une **bibliothèque de patterns HTML/CSS
interrogeable**, réutilisable à la demande quand Léo veut produire des slides, un visuel ou
une landing.

Découpage en lots courts et indépendants : **un lot = une session propre**. Chaque lot se
termine par une preuve PNG et un commit. Le prompt de continuation est en fin de fichier.

Source de vérité du reverse-engineering : [SPEC-SOURCES.md](SPEC-SOURCES.md).
**Les images d'origine n'existent pas sur disque** — ne jamais les redemander, travailler
depuis la spec.

---

## Lot 0 — Socle ✅ (fait le 29/07/2026)

- [x] Audit écrit des 10 références → `SPEC-SOURCES.md`
- [x] Dépôt `~/visual-lab` + convention de nommage
- [x] Format de pattern sur disque : `patterns/<id>.html` + `patterns/<id>.json`
- [x] Index SQLite régénérable : `bin/index.mjs` → `patterns.db`
- [x] Recherche : `bin/search.mjs`
- [x] Rendu de preuve PNG headless (Chrome) : `bin/render.mjs`
- [x] Squelette de nouveau pattern : `bin/new.mjs`
- [x] Chaîne validée bout en bout sur **ref-02** (le plus petit)

## Lot 1 — ref-02 `ghost-icon-claim` ✅ (fait, sert de gabarit)

Fait dans le lot 0 pour valider le pipeline. À relire comme **modèle de forme** avant
d'attaquer le lot 2 : un `decks/ref-02.html` fidèle + 3 patterns atomiques + `systems/sys-02.json`.

## Lot 2 — ref-03 `bento-dark-pitch`

Le plus rentable : 7 patterns dont toute la data-viz.
Livrables : `systems/sys-03.json`, `decks/ref-03.html` (les 4 slides), patterns
`pat-layout-bento-nested`, `pat-badge-pill-outline`, `pat-tile-kpi`, `pat-chart-isotype`,
`pat-chart-bars-stadium`, `pat-type-inline-highlight-pill`, `pat-icon-circle-arrow`.

## Lot 3 — ref-04 `swiss-investor-blue`

Livrables : `sys-04`, `decks/ref-04.html` (10 slides), patterns
`pat-layout-swiss-header-footer`, `pat-title-monster-caps`, `pat-list-numbered-giant`,
`pat-toc-two-column`, `pat-deck-rhythm-fullbleed` (type `rule`, pas de HTML).

## Lot 4 — ref-05 `proposal-acid-yellow` + ref-06 `orange-notched`

Groupés : même squelette corporate, deux chartes. Force à paramétrer au lieu de dupliquer.
Livrables : `sys-05`, `sys-06`, 2 decks, patterns `pat-header-tripartite`,
`pat-mark-asterisk`, `pat-cards-numbered-steps`, `pat-title-hyphen-break`,
`pat-accent-single-fluo`, `pat-shape-notched-card`, `pat-title-leading-rule`,
`pat-list-index-rules`, `pat-stat-block-accent`.

## Lot 5 — ref-07 + ref-08 `hero web sur photo`

Groupés obligatoirement : ce sont deux réglages du **même** squelette. Le test de réussite
est qu'un seul `pat-hero-card-on-photo` produise les deux rendus par variables.
Livrables : `sys-07`, `sys-08`, 2 pages, patterns `pat-hero-card-on-photo`,
`pat-nav-three-zone`, `pat-hero-wordmark-bottom-left`, `pat-hero-statement-first`,
`pat-image-triptych`, `pat-type-registered-superscript`.

## Lot 6 — ref-09 `zine-annotated-blue`

Le lot technique : `pat-annotation-marker` (générateur SVG de tracés irréguliers) est le
morceau de code le plus long du dépôt et le plus fort différenciateur.
Livrables : `sys-09`, deck, patterns `pat-annotation-marker`,
`pat-type-lowercase-editorial`, `pat-type-vertical-rail`.

## Lot 7 — ref-10 `campaign-board-red` + ref-01 `bento-pills-2030`

Livrables : `sys-10`, `sys-01`, 2 planches, patterns `pat-type-condensed-stack`,
`pat-mark-paren-number`, `pat-table-hairline-rules`, `pat-layout-image-collage-overlay`,
`pat-type-micro-caps-block`, `pat-layout-bento-primitives`, `pat-shape-teardrop`,
`pat-shape-toggle`, `pat-fill-gradient-stadium`.

## Lot 8 — Composition

Ce qui transforme une collection en outil :
- `bin/compose.mjs` — assembler une slide/page à partir d'ids de patterns + un système de
  tokens + un contenu JSON, sans copier-coller manuel.
- Contrôle de cohérence : un pattern posé sur un `sys-*` incompatible (ex. accent manquant)
  doit échouer bruyamment, pas rendre du gris.
- `bin/contact-sheet.mjs` — planche-contact PNG de tous les patterns, pour choisir à l'œil.

## Lot 9 — Skill + carte

- Skill `visual-lab` dans `~/.claude/skills/` (symlink vers ce dépôt, convention maison —
  cf. `claude-config/skills/SOURCES.md`). Écrit avec `/skill-dev`.
  Doit dire explicitement en quoi il complète `deck-builder` (.pptx), `theme-factory`
  (appliquer un thème existant), `frontend-design` (inventer une direction) et `bestfront`
  (la boucle de vérification).
- Enregistrement dans karto via `/karto-sync`.
- Décision à prendre avec Léo : dépôt GitHub distant ou local seul.

---

## Règles de travail, valables dans tous les lots

1. **Fidélité d'abord, généralisation ensuite.** On reconstruit `decks/ref-NN.html` au plus
   près de la spec, PUIS on en extrait les patterns atomiques. Jamais l'inverse : un pattern
   inventé avant d'avoir vu le rendu complet est toujours faux.
2. **Zéro dépendance réseau.** Pas de CDN, pas de Google Fonts en `<link>`. Polices : pile
   système + fallbacks déclarés dans le `sys-*`. Images : `<div>` placeholder à ratio fixe,
   jamais une URL distante.
3. **Un pattern = un fragment autonome.** Il se colle dans une page vide et se voit.
   Ses couleurs viennent de variables CSS (`--vl-*`), jamais de valeurs en dur.
4. **Preuve obligatoire** (`/verify`) : chaque lot rend un PNG dans `proofs/` et
   `bin/index.mjs` doit passer sans erreur.
5. **Pas de tableau Markdown dans la réponse à Léo** (il lit sur Telegram) — cf. son
   CLAUDE.md. Dans les fichiers du dépôt, les tableaux sont autorisés.

---

## Prompt de continuation (à coller dans une session nettoyée)

```
Reprends le projet visual-lab (~/visual-lab). Lis d'abord ROADMAP.md, README.md et la
section correspondante de SPEC-SOURCES.md — les images d'origine n'existent pas sur
disque, la spec les remplace.

Fais le prochain lot non coché de la ROADMAP, et lui seul. Suis les « Règles de travail »
en fin de ROADMAP. Regarde patterns/pat-card-ghost-icon-claim.* et decks/ref-02.html :
c'est le gabarit de forme à respecter.

Termine par : node bin/index.mjs, une preuve PNG via node bin/render.mjs, la case cochée
dans ROADMAP.md, et un commit.
```
