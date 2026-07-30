# visual-lab

Bibliothèque de **patterns visuels HTML/CSS** reconstruits par reverse-engineering à partir
d'un corpus de 10 références (decks, planches de campagne, heros web). Objectif : quand il
faut produire une slide, un visuel ou une landing, partir d'un pattern qui a fait ses preuves
plutôt que d'une page blanche — et savoir *pourquoi* il marche.

## Ce que ce dépôt est, et n'est pas

- **Est** : un corpus de fragments HTML autonomes, thémables par variables CSS, indexés et
  interrogeables, chacun documenté par son intention, ses conditions d'emploi et — c'est ce qui
  le rend rejouable — ses **benchmarks** : des assertions mesurables sur sa géométrie.
- **N'est pas** : un framework CSS, un thème, ni un générateur de deck. Il n'y a rien à
  installer et rien à importer — on copie un fragment, on le remplit, on le rend.

Complémentarité avec les skills existants : `deck-builder` produit du **.pptx** (et vient
piocher ici, cf. le pont `kit/vl_pptx.py`), `theme-factory` applique un **thème existant** à un
artefact, `frontend-design` **invente** une direction, `bestfront` est la **boucle de
vérification**. visual-lab fournit la **matière** : des compositions concrètes déjà validées à
l'œil ET à la mesure.

## Ce qui est la source de vérité d'un pattern

Le choix qui structure tout le dépôt : **un pattern = un JSON de géométrie + un fragment HTML**,
et rien d'autre.

- Le **JSON** porte ce qui VOYAGE : l'intention, les tokens, les **ratios** (chanfrein ÷ largeur,
  marge ÷ largeur, saut typographique), les corps de référence, et les **benchmarks**. C'est lui
  qui est lu par les deux rendus.
- Le **HTML** est le rendu de référence, celui qu'on regarde et qu'on colle dans une page, une
  landing ou un artefact.
- Le **.pptx** est un SECOND rendu, produit par `kit/vl_pptx.py`, qui relit le même JSON. Le
  fragment HTML n'est jamais recopié dans le Python : seuls les ratios traversent.

Pourquoi pas « juste du HTML » : on ne colle pas du HTML dans un PowerPoint, et 90 % des decks
de Léo sont des .pptx — une bibliothèque HTML seule aurait laissé `deck-builder` réinventer
chaque vignette. Pourquoi pas « juste du code Python » : on ne relit pas un .pptx à l'œil en une
seconde, et le web/landing y perdait tout. **Les pixels ne voyagent pas, les rapports oui** :
un fragment réglé pour 1600 px de large donne un corps de 10,2 pt s'il est converti bêtement —
`vl_pptx.scale()` ancre donc l'échelle sur le corps en POINTS et dérive le reste des ratios.

## Arborescence

```
SPEC-SOURCES.md   l'audit des 10 références — REMPLACE les images, qui n'existent pas sur disque
ROADMAP.md        le découpage en lots + le prompt de continuation
systems/sys-NN.json    les tokens d'une référence (palette, typo, rayons, notes de charte)
patterns/pat-*.json    métadonnées d'un pattern (intention, quand l'employer, quand l'éviter)
patterns/pat-*.html    le fragment autonome correspondant
decks/ref-NN.html      la reconstitution fidèle d'une référence complète, au format slides
fonts/                 les 3 polices du corpus (OFL, dans le dépôt) + fonts.css
fonts/FONTS.md         quelle police pour quelle référence, et comment la brancher
bin/                   les outils (index, recherche, rendu, export slides, planche, création, CHECK)
kit/vl_pptx.py         le pont vers le .pptx : émetteurs + audit mathématique (lit index.json)
INDEX.md               le catalogue lisible — GÉNÉRÉ par bin/index.mjs, jamais édité à la main
index.json             le même, pour la machine (ratios, benchmarks, tokens) — GÉNÉRÉ
patterns.db            index SQLite — REGÉNÉRABLE, gitignoré
proofs/                PNG de vérification — régénérables, gitignorés
proofs/ref-NN/         un PNG par slide du deck (export bin/slides.mjs)
```

**Le disque est la source de vérité, pas la base.** `patterns.db`, `INDEX.md` et `index.json`
sont des index reconstruits à la demande par `bin/index.mjs` : ils se lisent, ils ne s'éditent
jamais. `patterns.db` sert la recherche plein texte (gitignoré, binaire) ; `INDEX.md` et
`index.json` sont VERSIONNÉS, parce qu'un agent qui arrive d'un autre skill doit pouvoir lire le
catalogue sans sqlite et sans lancer quoi que ce soit.

## Le contrôle : mathématique d'abord, visuel ensuite — en boucle

Un rendu qu'on regarde attrape les fautes grossières, pas les dérives de 6 % — et c'est là que
se joue l'écart entre une vignette qui tient et une qui sent le remplissage. Chaque pattern
déclare donc ses `benchmarks` : des expressions mesurées dans un vrai navigateur.

```bash
node bin/check.mjs                        # tous les patterns qui déclarent des benchmarks
node bin/check.mjs pat-stat-block-accent  # un seul
node bin/check.mjs --report               # avec les mesures brutes et l'expression
```

Les aides disponibles dans une expression `measure` : `W`/`H` (la racine du pattern),
`box(sel)`, `num(sel,prop)`, `cs(sel,prop)`, `text(sel)`, `overflow(sel)`, `notch(sel)`,
`notchCorner(sel)` et `contrast(sel)` (WCAG, fond effectif remonté par les ancêtres).

La boucle, dans cet ordre, sans en sauter :

1. `node bin/index.mjs` — refuse d'indexer un pattern hors contrat (benchmark sans seuil,
   benchmarks sans `geometry.root`, couleur en dur…).
2. `node bin/check.mjs <id>` — **sort en code 1 tant qu'un seuil n'est pas tenu**. On corrige le
   fragment, on relance. Pas de livraison avec un écart connu.
3. `node bin/render.mjs --pattern <id>` — et on REGARDE. Les chiffres ne disent pas si c'est
   beau, ils disent si c'est la bonne géométrie.
4. Côté .pptx : `vl_pptx.audit([...])` rejoue les mêmes ratios sur ce qui a réellement été posé
   sur la slide, puis rendu fidèle LibreOffice (le proxy PIL ne dessine ni les freeform ni les
   filets — il a laissé passer une ombre portée sur toutes les cartes).

**Quand un contrôle attrape ce que l'autre laisse passer, l'assertion se pose des DEUX côtés.**
C'est comme ça que le contraste du corps sur l'aplat orange (2,77:1, sous le seuil de 3:1) a été
rattrapé : l'audit .pptx le testait, le harnais HTML non.

## Utilisation

Indexer (à relancer après toute modification de `patterns/` ou `systems/`) :

```bash
node bin/index.mjs
```

Chercher, puis sortir un fragment prêt à coller (avec le bloc `:root` de son système) :

```bash
node bin/search.mjs "argument reassurance"
```

```bash
node bin/search.mjs --show pat-card-ghost-icon-claim
```

Autres entrées : `--list` (tout, groupé par référence), `--kind chart`, `--source ref-03`.

Prouver un rendu en PNG (Chrome headless, aucun réseau) :

```bash
node bin/render.mjs decks/ref-02.html 1500 660
```

```bash
node bin/render.mjs --pattern pat-card-ghost-icon-claim
```

Un deck s'écrit **une slide par `<section class="slide">`, à sa taille réelle** ; les deux
vues se dérivent. Slide par slide, en pleine taille — c'est la preuve qui compte :

```bash
node bin/slides.mjs decks/ref-04.html
```

Planche-contact réduite, pour juger le rythme d'ensemble (jamais une slide) :

```bash
node bin/board.mjs decks/ref-04.html
```

Créer un pattern avec les champs obligatoires déjà en place :

```bash
node bin/new.mjs pat-tile-kpi --source ref-03-bento-dark-pitch --system sys-03 --kind component
```

## Contrat d'un pattern

`bin/index.mjs` **refuse d'écrire la base** si un pattern ne respecte pas le contrat — une
bibliothèque à moitié indexée qui se tait coûte plus cher qu'une erreur bruyante.

1. `kind` dans le vocabulaire fermé : `primitive`, `component`, `layout`, `chart`, `type`, `rule`.
2. `name`, `source`, `intent` et au moins un `tag` renseignés (sans tag, il est introuvable).
3. Un fichier `.html` existe, sauf pour `kind: rule` (une règle éditoriale n'a pas de rendu).
4. **Aucune couleur hexadécimale en dur dans le HTML** : tout passe par une variable `--vl-*`.
   C'est ce qui rend un pattern rejouable sur une autre charte.
5. Le fragment est autonome : collé dans une page vide avec le `:root` de son système, il
   s'affiche correctement, sans dépendance ni réseau. Les polices sont branchées par l'OUTIL
   (`bin/check.mjs`, `bin/render.mjs`), jamais par le fragment.
6. Si le pattern porte des `benchmarks`, il porte aussi `geometry.root` — sans racine, il n'y a
   rien contre quoi calculer un ratio, et un contrôle qui ne mesure rien est pire qu'aucun.
   Chaque benchmark a un `name`, une expression `measure` et un seuil (`expect`+`tol`, ou
   `min`/`max`).

**Ce qu'un pattern déclare pour être utilisable en .pptx** (facultatif, mais c'est ce qui le rend
disponible dans `deck-builder`) : `geometry.ratios` (les rapports qui font la charte),
`geometry.type_px` (les corps du fragment, qui servent de RAPPORTS et non de valeurs),
`geometry.pad_ratio` (marges intérieures ÷ largeur) et `pptx.emitter` (la fonction de
`kit/vl_pptx.py` qui le pose sur une slide).

## État

4 lots sur 12 faits : socle, `ref-02` (3 patterns), `ref-03` (7 patterns dont la data-viz),
`ref-04` (5 patterns, planche de 10 slides).
`ref-08` (hero web « Studioform® ») a été reconstitué hors ordre le 30/07 — `sys-08` et
`decks/ref-08.html` sont là, ses patterns restent à extraire (ils dépendent du lot 6).
`ref-06` (pitch deck orange chanfreiné) est FINI depuis le 30/07 — `sys-06`, `decks/ref-06.html`
(8 slides prouvées) et ses **5 patterns extraits, tous vérifiés par benchmarks**
(`pat-shape-notched-card`, `pat-stat-block-accent`, `pat-card-notched-brief`,
`pat-title-leading-rule`, `pat-list-index-rules`). C'est le lot qui a apporté l'outillage de
mesure (`bin/check.mjs`), l'index versionné (`INDEX.md` / `index.json`) et le pont .pptx
(`kit/vl_pptx.py`).
`ref-10` (planche de campagne rouge) est reconstitué depuis le 30/07 — `sys-10` et
`decks/ref-10.html`, 3 slides prouvées ; ses 5 patterns restent à extraire.
Reste 4 références à reproduire, une par lot. Suite et prompt de reprise :
[ROADMAP.md](ROADMAP.md).

**Typographie** : les polices vivent dans le dépôt (`fonts/`, licences OFL) et se branchent
par `@import url("../fonts/fonts.css")` **dans** le bloc `<style>` du deck — jamais par une
balise de lien, que l'export slide par slide ne reprend pas. Registre et pièges de taille :
[fonts/FONTS.md](fonts/FONTS.md).
