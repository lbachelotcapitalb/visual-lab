---
name: visual-lab
description: >-
  Bibliothèque de patterns visuels HTML/JSON réutilisables (~/visual-lab) — la MATIÈRE dans
  laquelle toute production visuelle vient piocher (slide, mailing, post, bannière, flyer,
  landing), et la porte par laquelle on y VERSE de nouveaux visuels par reverse-engineering.
  Utilise-le quand Léo colle une image et dit « reverse ça », « transforme ce visuel en code »,
  « ajoute ça à la bibliothèque », « on en fait un pattern » ; quand il demande « qu'est-ce
  qu'on a déjà pour X », « montre-moi ce qu'il y a en carte / en graphique », « propose-moi
  des visuels », « sors-moi ce pattern » ; et OBLIGATOIREMENT avant d'inventer une composition
  visuelle de zéro, quel que soit le média — le plan de production se confronte à la
  bibliothèque avant d'écrire une ligne. Complète deck-builder (qui PRODUIT des slides et
  applique la doctrine côté .pptx/HTML), bestfront (la boucle de vérification front),
  frontend-design (qui INVENTE une direction) et theme-factory (qui applique un thème
  existant) : ici c'est la matière déjà validée à l'œil ET à la mesure, plus l'outillage
  qui la mesure, la rend, la range et l'émet vers un autre média.
---

# visual-lab — consulter la bibliothèque, et y verser

Deux verbes, un seul dépôt : `~/visual-lab`. **CONSULTER** avant de produire quoi que ce soit de
visuel ; **VERSER** quand Léo apporte un visuel dont il faut garder la composition.

Ce fichier est le mode d'emploi opérateur. Ce qu'il ne recopie pas, parce que ça vit et que la
copie divergerait :

| quoi | où |
|---|---|
| le catalogue (une ligne par pattern, c'est là qu'on choisit) | `INDEX.md` — **GÉNÉRÉ**, jamais édité |
| le même pour la machine (ratios, benchmarks, tokens) | `index.json` — **GÉNÉRÉ** |
| le contrat d'un pattern, la nomenclature, les outils | `README.md` |
| les lois de mise en page, tous médias | `DOCTRINE.md` |
| l'audit des références sources (les images n'existent PAS sur disque) | `SPEC-SOURCES.md` |
| ce qui reste à faire, lot par lot | `ROADMAP.md` |

---

## CONSULTER — se confronter à la bibliothèque avant d'inventer

**La règle qui donne sa valeur à tout le reste : un plan de production visuelle se confronte à
la bibliothèque AVANT d'écrire une composition, et laisse une trace écrite de l'arbitrage.** Soit
on prend un pattern, soit on écrit en une ligne pourquoi aucun ne convient. Sans trace, l'étape
est sautée — c'est le sort de toutes les étapes « recommandées ».

```bash
cd ~/visual-lab && node bin/index.mjs             # l'index se régénère AVANT d'être lu
sed -n "/## Catalogue/,/## Détail/p" INDEX.md      # routage : une ligne par pattern
node bin/search.mjs "carte chiffre preuve"         # plein texte (OU, classé par pertinence)
node bin/search.mjs --family card                  # une branche entière
node bin/search.mjs --media email                  # ce qui est destiné à un canal
node bin/search.mjs --show card-03-stat-accent     # le fragment + le :root de sa référence
```

### Choisir : le texte d'abord, l'image ensuite

Le routage se fait sur `INDEX.md` — du texte, pas cher, qui dit ce que chaque pattern FAIT.
Regarder les dix-sept rendus à chaque production serait du gaspillage.

L'image sert l'étape d'après : **arbitrer entre les finalistes, ou passer une branche en revue
pour en proposer trois à Léo**. C'est exactement l'usage : une planche, dix à vingt vignettes,
trois propositions, Léo tranche.

```bash
node bin/contact-sheet.mjs --family card --cols 3   # → proofs/contact-sheet-card.png
node bin/contact-sheet.mjs --media social
node bin/render.mjs --pattern card-03-stat-accent   # le finaliste, en TAILLE RÉELLE
```

Une planche est un **dérivé** : elle sert à choisir, jamais à juger. Un pattern retenu se regarde
à sa taille réelle avant d'être posé quelque part — à 45 % on ne voit ni un contraste limite, ni
un corps sous le plancher.

### Sortir le pattern vers un autre média que le web

Le fragment HTML est le rendu de référence. Pour les autres médias, on passe par un émetteur —
**on ne recopie jamais le fragment à la main** dans un autre format :

| cible | commande | remarque |
|---|---|---|
| page/landing/artefact | `node bin/search.mjs --show <id>` | le fragment + son `:root`, prêts à coller |
| .pptx | `kit/vl_pptx.py` (via `deck-builder`) | relit le JSON, ne recopie jamais le HTML |
| HTML à styles aplatis | `node bin/emit.mjs <id> --target inline` | variables résolues, styles posés sur les éléments |
| mailing | `node bin/emit.mjs <id> --target email` | **refuse** ce qu'Outlook ne sait pas rendre |
| impression / PNG | `node bin/render.mjs --pattern <id>` | un fragment HTML s'imprime tel quel |

**Au 30/07/2026, aucun des 17 patterns ne passe la cible `email`** (flex, `clip-path`, `calc()`,
SVG inline). Ce n'est pas une panne, c'est le constat : le corpus est de la matière slide/web.
Pour un mailing, deux issues honnêtes — écrire un pattern nativement email (tables, largeurs
fixes), ou **rendre le pattern en image et poser l'image**. `node bin/emit.mjs --audit --target
email` donne l'état de toute la bibliothèque en un tableau.

### Changer de charte

Un pattern est thémable par construction (aucune couleur en dur, tout en `--vl-*`). Pour le voir
sur une autre référence : `node bin/emit.mjs <id> --target inline --system ref-04-swiss-investor-blue`.
Si un token manque, la variable ressort **non résolue** et l'émetteur le signale — un pattern qui
rendrait du gris en silence serait pire qu'une erreur.

---

## VERSER — reverse-engineering d'un visuel apporté par Léo

Léo colle une image (une slide, une planche de campagne, un hero, une carte). On en tire du code
réutilisable. **L'ordre compte, et le premier point est celui qui coûte le plus cher quand on
l'oublie.**

### 1. Écrire la spec AVANT de coder — l'image ne survit pas à la session

L'image collée dans une conversation **n'existe pas sur disque** et personne ne pourra la
retrouver. Si la session est nettoyée avant que le pattern soit fini, tout est perdu. Donc :
d'abord une section dans `SPEC-SOURCES.md` (id `ref-NN-<slug>`, palette relevée en hex, typo,
géométrie, ce que fait chaque zone), et c'est ELLE qui remplace l'image pour toute la suite. Les
lots déjà faits sont le gabarit à copier.

Si la spec paraît plus mince que l'image, le seul recours est que Léo recolle l'image : personne
ne peut la deviner.

### 2. Reconstituer d'abord, généraliser ensuite

**Fidélité d'abord.** On reconstruit la référence complète au plus près de la spec — pour un deck,
une `<section class="slide">` par slide à sa taille réelle, autant de slides que la spec en
annonce — PUIS on en extrait les patterns. Jamais l'inverse : un pattern inventé avant d'avoir vu
le rendu entier est toujours faux, parce qu'on ne sait pas encore ce qui est une signature du
système et ce qui est un accident de cette slide-là.

Les tokens de la référence vont dans `systems/<ref>.json` : c'est le SYSTÈME qui porte l'échelle
et la palette, jamais le fragment.

### 3. Créer le pattern — et laisser l'outil refuser les doublons

```bash
node bin/new.mjs card stat-accent --ref ref-06-orange-notched
```

`bin/new.mjs` affiche ce que la famille contient déjà et **refuse** si un mot du slug est déjà
pris, sauf `--force`. Ce n'est pas de la bureaucratie : le 30/07, neuf patterns sur vingt-six ont
été retirés parce qu'ils ne portaient pas de composition qu'on ne réécrit pas de tête. Un pattern
se garde s'il porte une **composition** ou une **géométrie mesurée** ; pas s'il tient dans sa
propre phrase de description. Quand c'est une variante, on enrichit l'existant (tokens, slots)
plutôt que d'en créer un second.

Le champ `media` déclare où le pattern est censé servir — c'est une intention de routage, que
`bin/emit.mjs` confronte ensuite à la réalité de la cible.

### 4. La boucle de contrôle, sans en sauter une

```bash
node bin/index.mjs                        # refuse d'indexer un pattern hors contrat
node bin/check.mjs <id>                   # sort en code 1 tant qu'un seuil n'est pas tenu
node bin/render.mjs --pattern <id>        # et REGARDER
```

Les benchmarks ne sont pas une formalité administrative : ce sont eux qui rendent le pattern
rejouable. Un pattern sans assertion mesurable est une capture d'écran avec des mots autour.
Écris-les en **ratios** de la racine (`geometry.root`), jamais en pixels : un ratio survit au
changement d'échelle, un pixel non.

Et l'inverse est vrai aussi — les chiffres ne disent pas si c'est fidèle. **Compare le rendu à
l'image source pendant qu'elle est encore dans le contexte**, c'est le seul moment où c'est
possible.

### 5. Clore

`node bin/index.mjs`, la planche-contact régénérée si la sélection a bougé, la case cochée dans
`ROADMAP.md`, un commit. Charge `verify` : la preuve (le PNG regardé, la sortie de `check`) est le
livrable que Léo review — il ne reteste pas derrière.

---

## Pièges déjà payés

- **Un contrôle qui attrape ce que l'autre laisse passer ⇒ l'assertion se pose des DEUX côtés.**
  Le contraste du corps sur l'aplat orange (2,77:1) a été attrapé par l'audit .pptx, pas par le
  harnais HTML. Cf. `DOCTRINE.md` §10.
- **Un faux positif se corrige dans le DÉTECTEUR, jamais à la main.** `\btransform:` matche
  `text-transform:` (le tiret est une frontière de mot) : sans le lookbehind, toute vignette en
  capitales était déclarée incompatible email à tort.
- **Une variable ne vit pas que dans une déclaration CSS**, elle vit aussi dans un attribut
  (`fill="var(--vl-mint)"` d'un SVG inline). Trois patterns de `ref-11` ont été signalés « token
  absent » alors que le système était parfaitement sain.
- **Une planche-contact mesure ses vignettes dans Chrome avant de les mettre en grille.** Sept
  patterns sur dix-sept ne déclarent pas de `geometry.frame` ; les caler sur une valeur de repli
  les rognait en silence.
- **Les polices se branchent par l'OUTIL, jamais par le fragment** (`@import` dans le `<style>`
  du rendu, pas une balise `<link>` que l'export slide par slide ne reprend pas). Registre :
  `fonts/FONTS.md`.
- **Les images sourcées se trient par PALETTE, pas par pertinence** (`bin/photos.mjs`), et une
  cible neutre ne prouve aucun casting : passer les ACCENTS, pas la couleur du papier.

## Composition avec les autres skills

- `deck-builder` — produit les slides (.pptx et HTML) et applique la doctrine dans CE média ; il
  vient piocher ici. Ne réécris pas une vignette de slide sans avoir cherché dans la bibliothèque.
- `bestfront` — la boucle de vérification front (rendre, regarder, `geo-audit.js`). Un pattern
  posé dans une vraie page repasse par elle : la bibliothèque garantit le fragment, pas la page.
- `frontend-design` — invente une direction quand rien n'existe. Ici, on part de ce qui existe.
- `theme-factory` — applique un thème existant à un artefact ; les `systems/` d'ici sont l'objet
  équivalent pour le corpus reversé.
- `verify` — la gate de clôture. Aucun versement ne se déclare fini sans preuve regardée.

## Définition de « terminé »

`bin/index.mjs` passe · `bin/check.mjs` est vert sur le pattern touché · son PNG a été **regardé**
(et comparé à la source, pour un versement) · `INDEX.md`/`index.json` sont régénérés et commités ·
la doc touchée par le changement est à jour dans le MÊME commit.
