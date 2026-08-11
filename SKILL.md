---
name: visual-lab
description: >-
  Bibliothèque de patterns visuels HTML/JSON réutilisables (~/visual-lab) — la MATIÈRE dans
  laquelle toute production visuelle vient piocher (slide, mailing, post, bannière, flyer),
  et la porte par laquelle on y VERSE de nouveaux visuels par reverse-engineering.
  Utilise-le quand Léo colle une image et dit « reverse ça », « transforme ce visuel en code »,
  « ajoute ça à la bibliothèque » ; quand il demande « qu'est-ce qu'on a déjà pour X »,
  « montre-moi ce qu'il y a en carte / en graphique », « propose-moi des visuels »,
  « sors-moi ce pattern » ; et OBLIGATOIREMENT avant d'inventer une composition
  visuelle de zéro, quel que soit le média — le plan de production se confronte à la
  bibliothèque avant d'écrire une ligne. Complète deck-builder (qui PRODUIT des slides),
  bestfront (la boucle de vérification front), frontend-design (qui INVENTE une direction)
  et theme-factory (qui applique un thème existant) : ici c'est la matière déjà validée à
  l'œil ET à la mesure, plus l'outillage qui la mesure, la rend et la range.
---

# visual-lab — consulter la bibliothèque, et y verser

Deux verbes, un seul dépôt : `~/visual-lab`. **CONSULTER** avant de produire quoi que ce soit de
visuel ; **VERSER** quand Léo apporte un visuel dont il faut garder la composition.

Ce fichier est le mode d'emploi opérateur. Ce qu'il ne recopie pas, parce que ça vit et que la
copie divergerait :

> **Ce fichier est le manuel de l'OPÉRATEUR, en français.** Un agent extérieur qui arrive sur
> le dépôt lit [`AGENTS.md`](AGENTS.md) (servi aussi comme `CLAUDE.md`) : court, en anglais,
> machine-facing. Ne pas dupliquer l'un dans l'autre — AGENTS.md dit comment CONSOMMER la
> bibliothèque, ce fichier dit comment l'OPÉRER et y verser.

| quoi | où |
|---|---|
| **la vitrine — les patterns VIVANTS, à ouvrir dans un navigateur** | [gallery.html](gallery.html) — **GÉNÉRÉ** par `bin/index.mjs` |
| le catalogue (une ligne par pattern, c'est là qu'on choisit) | [INDEX.md](INDEX.md) — **GÉNÉRÉ**, jamais édité |
| le même pour la machine (ratios, benchmarks, tokens) | `index.json` — **GÉNÉRÉ** |
| le contrat d'un pattern, la nomenclature, les outils | [README.md](README.md) |
| les lois de mise en page, tous médias | [DOCTRINE.md](DOCTRINE.md) |
| l'audit des références sources (les images n'existent PAS sur disque) | [SPEC-SOURCES.md](SPEC-SOURCES.md) |
| ce qui reste à faire, lot par lot | [ROADMAP.md](ROADMAP.md) |
| ce que la licence MIT ne couvre PAS (polices, images sources) | [NOTICE.md](NOTICE.md) — **à lire avant toute diffusion** |

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

### Choisir : le texte d'abord, la VITRINE HTML ensuite — jamais un PNG

Le routage se fait sur `INDEX.md` — du texte, pas cher, qui dit ce que chaque pattern FAIT.
Regarder trente-huit rendus à chaque production serait du gaspillage.

Pour l'étape d'après — arbitrer entre finalistes, passer une branche en revue, faire trancher
Léo — c'est [`gallery.html`](gallery.html) qui sert, et **rien d'autre** :

```bash
node bin/index.mjs && open gallery.html     # la vitrine se régénère AVEC l'index
node bin/gallery.mjs --family card          # ou filtrée
node bin/gallery.mjs ref-17 ref-18
```

**Une planche-contact en PNG est proscrite, et ce n'est pas une préférence.** Une image est une
COPIE MORTE : elle périme au premier changement de fragment sans que rien ne le signale, on ne
peut ni zoomer sans bouillie, ni inspecter le DOM, ni copier le code, ni voir le vrai rendu des
polices — et elle pèse du binaire dans un dépôt qui n'en accepte pas. `gallery.html` rend les
fragments EUX-MÊMES, chacun sur le sol et les tokens de sa charte, avec son code dépliable :
ce qu'on regarde est exactement ce qu'on collera.

Corollaire : **on ne livre jamais un PNG à Léo, et on ne lui ouvre jamais un dossier d'images.**
On lui ouvre `gallery.html`, ou le deck concerné. Un pattern retenu se regarde ensuite à sa
taille réelle — `open decks/<ref>.html` — avant d'être posé quelque part : à 45 % on ne voit ni
un contraste limite, ni un corps sous le plancher.

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

**Au 11/08/2026, aucun des 38 patterns ne passe la cible `email`** (flex, `clip-path`, `calc()`,
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
réutilisable. **L'ordre compte, et les deux premiers points sont ceux qui coûtent le plus cher
quand on les saute.**

### 0. Poser l'image sur le DISQUE — sans elle, tout le reste se fait en aveugle

Une image **collée** dans la conversation n'existe nulle part sur le disque : je la vois, je ne
peux ni la pipetter, ni la zoomer, ni la relire après coup — et la comparaison rendu ↔ source
meurt avec la session. Vérifié le 31/07 : l'app n'en dépose aucune copie.

```bash
node bin/ingest.mjs ref-NN-<slug>                    # depuis le PRESSE-PAPIERS (⌘C sur l'image)
node bin/ingest.mjs ref-NN-<slug> ~/Desktop/x.png    # ou depuis un fichier
```

**Un ⌘C au lieu d'un ⌘V suffit** : `ingest.mjs` sort le flavor image du presse-papiers en
AppleScript et le range dans `assets/refs/` (gitignoré — ce sont des visuels tiers).

**Et si Léo a déjà collé plusieurs images d'un coup, elles sont récupérables sans rien lui
redemander** (établi le 11/08/2026, lot `ref-17`/`18`/`19`) : le transcript de la session les
porte en base64. Le presse-papiers ne garde que la dernière ; le transcript les garde toutes,
dans l'ordre.

```bash
python3 - <<'EOF'
import json, base64
p = '/Users/Leo/.claude/projects/<projet>/<session-id>.jsonl'
noms = ['ref-17-slug', 'ref-18-slug', 'ref-19-slug']   # dans l'ordre du collage
imgs = [b['source'] for l in open(p) if (d := json.loads(l)).get('message')
        for b in (d['message'].get('content') or []) if isinstance(b, dict) and b.get('type') == 'image']
for n, s in zip(noms, imgs):
    open(f'assets/refs/{n}.jpg', 'wb').write(base64.b64decode(s['data']))
EOF
cd assets/refs && for f in *.jpg; do sips -s format png "$f" --out "${f%.jpg}.png" && rm "$f"; done
```

Le `.png` n'est pas cosmétique : `palette.mjs` et `diff.mjs` construisent leur chemin en
`assets/refs/<ref>.png` et ne trouveront rien d'autre.

À partir de là, on RELÈVE au lieu de deviner :

```bash
node bin/palette.mjs ref-NN-<slug>                   # couleurs dominantes + part de surface
node bin/palette.mjs ref-NN-<slug> --at 120,340      # pipette : le hex EXACT d'un pixel
node bin/palette.mjs ref-NN-<slug> --crop 0,0,400,200 --zoom 3   # un zoom à REGARDER
```

Si Léo n'a que collé l'image, on travaille quand même — mais la spec porte des `≈` et le premier
`#hex` faux part dans un `systems/` pour toujours. **Demande le ⌘C.**

### 1. Isoler la vraie slide — l'image la noie presque toujours

Une image apportée contient rarement une slide et rien d'autre : plusieurs slides sur une même
planche, une slide posée **en petit dans un board plus grand**, une maquette photographiée en
perspective, des cartes coupées par le bord du cadre, un fond de présentation. **On reproduit la
slide, pas l'image.** Ce qui n'est là que pour présenter — fond de planche, ombre de maquette,
perspective, éléments amputés — ne se reconstruit pas ; on le note dans la spec pour mémoire.

**Compter les couches, et savoir en retirer.** Un écran en compte **trois au grand maximum**
(fond → panneau → module). La règle qui tranche :

> Quand deux couches **encadrent la même chose** — l'une contient l'autre avec une marge et rien
> d'autre — il n'y en a qu'**UNE**, et c'est **celle du dessus** qu'on garde.

Deux fautes payées sur `ref-13` : une planche intermédiaire qui n'encadrait que les quatre
modules, et la marge de page du deck (un fond de « table » contrasté). Chacune divisait l'écart
de blanc entre les couches et écrasait la profondeur — et **aucun alignement ne casse** quand on
en empile une de trop, donc rien ne le signale.

Corollaire, pendant toute la phase de fidélité : **n'ajoute AUCUN élément absent de la source.**
Deux halos flous inventés « pour donner de la matière au verre » ont coûté une reprise complète.
Si tu crois qu'il en faut un, tu le signales à Léo — tu ne le glisses pas.

### 2. Écrire la spec AVANT de coder — l'image ne survit pas à la session

L'image collée dans une conversation **n'existe pas sur disque** et personne ne pourra la
retrouver. Si la session est nettoyée avant que le pattern soit fini, tout est perdu. Donc :
d'abord une section dans `SPEC-SOURCES.md` (id `ref-NN-<slug>`, palette relevée en hex, typo,
géométrie, ce que fait chaque zone, **et ce qui a été écarté au point 1**), et c'est ELLE qui
remplace l'image pour toute la suite. Les lots déjà faits sont le gabarit à copier.

**Les ratios s'ancrent sur la LARGEUR DE SLIDE, jamais sur un objet interne.** Sur `ref-13` ils
étaient exprimés en fraction de « largeur de planche » : la planche a disparu à la correction, et
les cinq patterns ont dû être réécrits. La largeur de slide est le seul invariant qui survit à
une refonte de composition.

Si la spec paraît plus mince que l'image, le seul recours est que Léo recolle l'image : personne
ne peut la deviner.

### 3. Reconstituer d'abord, généraliser ensuite — et TOUJOURS au format PPT

**visual-lab héberge des visuels de plusieurs dimensions** (slides, heros web, vignettes
social). Mais **une référence qui est une SLIDE se livre toujours en dimensions PPT** — c'est
la finalité, et ce n'est pas à écrire à la main, l'outil pose le squelette exact :

```bash
node bin/new-ref.mjs ref-NN-<slug> "Nom lisible de la charte"
```

Il crée la section de spec (rubriques obligatoires pré-remplies), `systems/<ref>.json` et
`decks/<ref>.html` avec :

```css
.slide { width: 1600px; height: 900px; }   /* 16:9 — non négociable pour une slide */
```

1600 px de large parce que c'est la largeur que `kit/vl_pptx.py` suppose pour convertir un
fragment en .pptx. `deck-builder`, lui, compose sur 1920×1080 : **ce n'est pas une
contradiction** — deux producteurs, deux scènes, et seuls les RATIOS voyagent de l'un à
l'autre (cf. `README.md`, « les pixels ne voyagent pas, les rapports oui »). Ne rouvre pas ce
faux débat.

Une référence qui **n'est pas** une slide déclare sa scène en clair dans son deck, sinon le
lint la refuse — l'exemption est visible dans le fichier qu'elle exempte :

```html
<!-- vl:stage web — hero de page, le format PPT n'a pas de sens ici -->
```

Une `<section class="slide">` par slide, autant de slides que la spec en annonce. **Le cadrage de
la source ne dicte rien** : un crop portrait, une photo inclinée, une bande horizontale se
remettent à plat DANS ce format. Et pas de « table » sous la slide (marge de page contrastée) :
c'est une couche de plus au sens du point 1.

**Fidélité d'abord**, ensuite seulement l'extraction : un pattern inventé avant d'avoir vu le
rendu entier est toujours faux, parce qu'on ne sait pas encore ce qui est une signature du
système et ce qui est un accident de cette slide-là.

Les tokens de la référence vont dans `systems/<ref>.json` : c'est le SYSTÈME qui porte l'échelle
et la palette, jamais le fragment.

### 4. Créer le pattern — solidaire de son deck, et sans doublon

```bash
node bin/new.mjs card stat-accent --ref ref-06-orange-notched
```

`bin/new.mjs` affiche ce que la famille contient déjà et **refuse** si un mot du slug est déjà
pris, sauf `--force`. Ce n'est pas de la bureaucratie : le 30/07, neuf patterns sur vingt-six ont
été retirés parce qu'ils ne portaient pas de composition qu'on ne réécrit pas de tête. Un pattern
se garde s'il porte une **composition** ou une **géométrie mesurée** ; pas s'il tient dans sa
propre phrase de description. Quand c'est une variante, on enrichit l'existant (tokens, slots)
plutôt que d'en créer un second.

**`geometry.frame` est la dimension RÉELLE du module sur la slide 1600×900** — pas une taille
choisie pour que la vignette soit jolie isolée. Conséquence directe : **si le deck change de
format, les extractions sont fausses. On les refait, on ne les rafistole pas.** (`ref-13` : cinq
patterns repris intégralement après le passage en PPT.)

Le champ `media` déclare où le pattern est censé servir — c'est une intention de routage, que
`bin/emit.mjs` confronte ensuite à la réalité de la cible.

### 5. La boucle de contrôle, sans en sauter une

```bash
node bin/check-deck.mjs <ref>             # la COMPOSITION : format, couches, marge de page
node bin/index.mjs                        # refuse d'indexer un pattern hors contrat ; régénère la vitrine
node bin/check.mjs <id>                   # sort en code 1 tant qu'un seuil n'est pas tenu
node bin/render.mjs --pattern <id>        # RASTER DE TRAVAIL — pour MON œil, jamais un livrable
node bin/diff.mjs <ref>                   # rendu ET source côte à côte — la fidélité
```

**Le raster reste nécessaire à l'agent et interdit au livrable.** Je ne peux pas « regarder » du
HTML : `render.mjs` et `diff.mjs` existent pour que JE voie, et leurs sorties vivent dans
`proofs/` — gitignoré, supprimé en fin de lot, jamais montré, jamais cité comme preuve à Léo.
Sa preuve à lui est `gallery.html` et les decks. Confondre les deux, c'est lui livrer une copie
morte de ce dont il a la version vivante.

Les benchmarks ne sont pas une formalité administrative : ce sont eux qui rendent le pattern
rejouable. Un pattern sans assertion mesurable est une capture d'écran avec des mots autour.
Écris-les en **ratios** de la racine (`geometry.root`), jamais en pixels : un ratio survit au
changement d'échelle, un pixel non.

**Un benchmark de pattern ne mesure que l'INTÉRIEUR d'un pattern — jamais la composition
d'ensemble.** Sur `ref-13`, 55 assertions étaient vertes sur un écran qui portait une couche de
trop. D'où les deux contrôles qui l'encadrent :

- `bin/check-deck.mjs` mesure la SLIDE : format PPT et ratio 16:9, absence de marge de page,
  profondeur des couches ≤ 3, et surtout **la couche 1:1** — une surface qui n'en encadre
  qu'une seule est redondante. Rejoué sur la version fautive de `ref-13`, il sort ses cinq
  fautes ; sur la corrigée, il est vert.
- `bin/diff.mjs` met le rendu et la source **côte à côte**. Tant que la source vivait seulement
  dans le contexte, la fidélité reposait sur ma mémoire — c'est exactement là que la couche de
  trop est passée.

Quand un défaut a malgré tout échappé au harnais, il devient une assertion
(`« DEUX couches et pas trois »` de `layout-03-glass-board` est née comme ça).

**Amender l'outil fait partie du lot.** Une référence qui casse un détecteur corrige le
détecteur, dans le MÊME commit — `ref-13` a obligé `bin/check.mjs` à compositer les couches
translucides pour établir un fond effectif, faute de quoi tout système en verre sortait illisible
à tort.

### 6. Clore — le livrable est du HTML et du JSON

**Ce que la bibliothèque porte : `patterns/*.html`, `patterns/*.json`, `systems/*.json`,
`decks/*.html`, et la vitrine `gallery.html`. Rien d'autre — et surtout aucune image.** Les PNG
servent PENDANT le reverse (voir, comparer à la source, arbitrer) ; après coup `proofs/` se
supprime, il est gitignoré et jetable.

`node bin/index.mjs` (qui régénère `INDEX.md`, `index.json` ET `gallery.html` d'un coup — un
catalogue à jour à côté d'une vitrine périmée est pire qu'une vitrine absente) · la case cochée
dans `ROADMAP.md` · la doc touchée à jour dans le MÊME commit · **autocommit sans demander**.

**Le commit nomme les chemins du lot — jamais `git add -A`.** Le dépôt est partagé : une autre
session peut travailler sur `ref-NN+1` en parallèle (vécu le 31/07), et un `-A` emporte son
travail en cours dans ton commit.

```bash
git add SPEC-SOURCES.md ROADMAP.md systems/ref-NN-<slug>.json decks/ref-NN-<slug>.html \
        patterns/<id>.json patterns/<id>.html INDEX.md index.json
```

Charge `verify` : la preuve (le rendu regardé, la sortie de `check`) est le livrable que Léo
review — il ne reteste pas derrière.

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

`bin/index.mjs` passe (donc `gallery.html` est à jour) · `bin/check.mjs` est vert sur le pattern
touché · son rendu a été **regardé** (et comparé à la source, pour un versement) · le deck est aux **dimensions PPT
1600×900** · le nombre de couches du rendu est celui de la source · `INDEX.md`/`index.json` sont
régénérés · la doc touchée est à jour dans le MÊME commit · les PNG de travail sont supprimés (aucun
n'est livré ni ouvert à Léo : sa vue, c'est `gallery.html`) · le commit nomme ses chemins et
part **sans demander**.
