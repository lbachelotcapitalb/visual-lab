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

Le dépôt est lui-même un skill (`SKILL.md`, symlinké dans `~/.claude/skills/visual-lab`) : c'est
lui qui porte les deux verbes — **consulter** la bibliothèque avant d'inventer, et y **verser**
un visuel par reverse-engineering. Et il porte la doctrine commune ([DOCTRINE.md](DOCTRINE.md)) :
les lois de mise en page valent pour tous les médias, seuls les seuils et le gate changent.

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
SKILL.md               le mode d'emploi opérateur (skill `visual-lab`, symlinké dans ~/.claude/skills)
DOCTRINE.md            les lois de mise en page de la maison, TOUS MÉDIAS — et qui les mesure
INDEX.md               LE POINT D'ENTRÉE : catalogue de routage + détail — GÉNÉRÉ, jamais édité
index.json             le même pour la machine (ratios, benchmarks, tokens) — GÉNÉRÉ
patterns/<id>.json     métadonnées d'un pattern (intention, quand l'employer, quand l'éviter)
patterns/<id>.html     le fragment autonome correspondant
systems/<ref>.json     les tokens d'une référence (palette, typo, rayons, notes de charte)
decks/<ref>.html       la reconstitution fidèle de la référence, au format slides
SPEC-SOURCES.md   l'audit des 10 références — REMPLACE les images, qui n'existent pas sur disque
ROADMAP.md        le découpage en lots + le prompt de continuation
fonts/                 les 3 polices du corpus (OFL, dans le dépôt) + fonts.css
fonts/FONTS.md         quelle police pour quelle référence, et comment la brancher
assets/photos/<ref>/   récoltes d'images libres : manifest.json VERSIONNÉ, .jpg gitignorés
bin/                   les outils (index, recherche, rendu, export slides, planche, création, CHECK, ÉMETTEURS)
bin/contact-sheet.mjs  la planche-contact des PATTERNS : choisir à l'œil parmi 10-20 vignettes
bin/emit.mjs           sortir un pattern vers un autre média (inline, email) — refuse si ça ne tient pas
kit/vl_pptx.py         le pont vers le .pptx : émetteurs + audit mathématique (lit index.json)
patterns.db            index SQLite pour la recherche plein texte — REGÉNÉRABLE, gitignoré
proofs/                PNG de vérification — régénérables, gitignorés
proofs/<ref>/          un PNG par slide du deck (export bin/slides.mjs)
```

## Nomenclature

Deux séries de noms, et pas une de plus.

- **Un pattern** : `<famille>[-NN]-<mots simples>` — `card-03-stat-accent`, `chart-02-isotype`,
  `title-leading-rule`. Le numéro n'apparaît **que si la famille en compte plusieurs** ;
  `bin/new.mjs` renumérote l'existant tout seul quand un deuxième arrive. Les familles sont un
  vocabulaire fermé — `card`, `chart`, `layout`, `list`, `shape`, `tag`, `title` — et le préfixe
  du fichier DOIT être la famille déclarée : `bin/index.mjs` refuse d'indexer sinon. Le nom du
  fichier est la taxonomie, il n'y a pas de second champ qui pourrait la contredire.
- **Une référence** : `ref-NN-<slug>`, le NN étant celui de [SPEC-SOURCES.md](SPEC-SOURCES.md).
  Le même id nomme ses tokens (`systems/<ref>.json`), sa reconstitution (`decks/<ref>.html`),
  ses photos (`assets/photos/<ref>/`) et ses preuves (`proofs/<ref>/`). Les trous dans la
  numérotation sont les lots non faits, pas des oublis.

**Le disque est la source de vérité, pas la base.** `patterns.db`, `INDEX.md` et `index.json`
sont des index reconstruits à la demande par `bin/index.mjs` : ils se lisent, ils ne s'éditent
jamais. `patterns.db` sert la recherche plein texte (gitignoré, binaire) ; `INDEX.md` et
`index.json` sont VERSIONNÉS, parce qu'un agent qui arrive d'un autre skill doit pouvoir lire le
catalogue sans sqlite et sans lancer quoi que ce soit.

## Médias et émetteurs — un pattern, plusieurs sorties

Un pattern déclare un champ `media` : où il est censé servir, dans un vocabulaire fermé
(`slide`, `web`, `email`, `print`, `social`). C'est une **intention de routage**, pas une
garantie de rendu — un producteur de mailing filtre dessus (`node bin/search.mjs --media email`)
au lieu de dérouler tout le catalogue. Sans champ, un pattern vaut `slide web` : c'est ce que le
corpus EST, et les patterns antérieurs n'ont pas à être ré-annotés pour rester exacts.

La **faisabilité**, elle, se prouve. `bin/emit.mjs` sort le pattern vers une cible et refuse
quand la cible ne sait pas rendre ce que le fragment demande :

```bash
node bin/emit.mjs card-03-stat-accent --target inline    # variables résolues, styles sur les éléments
node bin/emit.mjs card-03-stat-accent --target email     # contraintes Outlook, sort en 1 si ça casse
node bin/emit.mjs --audit --target email                 # l'état de toute la bibliothèque
```

**Au 30/07/2026 : 17/17 en `inline`, 0/17 en `email`.** Ce n'est pas une panne, c'est le constat
— flex, `clip-path`, `calc()`, SVG inline : le corpus est de la matière slide/web. Pour un
mailing, deux issues honnêtes : écrire un pattern nativement email (tables, largeurs fixes), ou
rendre le pattern en image et poser l'image. **Quand `media` et l'audit divergent, c'est le JSON
qui a tort.**

Il n'y a **pas** d'émetteur `print` : un fragment HTML s'imprime tel quel (Chrome → PDF).
Annoncer un émetteur qui ne ferait que recopier le fragment mentirait sur ce que le dépôt sait
faire. Ce qui compte à l'impression est ailleurs — encre (aplats, ombres, dégradés) et polices
embarquées depuis `fonts/`.

## Choisir à l'œil : la planche-contact des patterns

Le routage se fait sur `INDEX.md` — du texte, pas cher. La planche sert l'étape d'après :
arbitrer entre les finalistes, ou passer une branche en revue pour en proposer trois.

```bash
node bin/contact-sheet.mjs                          # tout
node bin/contact-sheet.mjs --family card --cols 3
node bin/contact-sheet.mjs --media social --scale 0.4
```

Chaque vignette est rendue sur le `:root` de SA référence — une planche qui mélange les chartes
montre aussi si deux systèmes jurent l'un à côté de l'autre. **Les tailles sont MESURÉES dans
Chrome avant la mise en grille**, jamais devinées : sept patterns sur dix-sept ne déclarent pas
de `geometry.frame`, et une planche qui rogne ce qu'elle est censée montrer est pire qu'une
absence de planche. Une planche reste un dérivé : le pattern retenu se regarde en taille réelle
(`bin/render.mjs --pattern <id>`) avant d'être posé.

## Le contrôle : mathématique d'abord, visuel ensuite — en boucle

Un rendu qu'on regarde attrape les fautes grossières, pas les dérives de 6 % — et c'est là que
se joue l'écart entre une vignette qui tient et une qui sent le remplissage. Chaque pattern
déclare donc ses `benchmarks` : des expressions mesurées dans un vrai navigateur.

```bash
node bin/check.mjs                        # tous les patterns qui déclarent des benchmarks
node bin/check.mjs card-03-stat-accent    # un seul
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
node bin/search.mjs --show card-01-ghost-icon
```

Autres entrées : `--list` (tout, groupé par référence), `--family chart`, `--ref ref-03`.

Prouver un rendu en PNG (Chrome headless, aucun réseau) :

```bash
node bin/render.mjs decks/ref-02-ghost-icon-claim.html 1500 660
```

```bash
node bin/render.mjs --pattern card-01-ghost-icon
```

Un deck s'écrit **une slide par `<section class="slide">`, à sa taille réelle** ; les deux
vues se dérivent. Slide par slide, en pleine taille — c'est la preuve qui compte :

```bash
node bin/slides.mjs decks/ref-04-swiss-investor-blue.html
```

Planche-contact réduite, pour juger le rythme d'ensemble (jamais une slide) :

```bash
node bin/board.mjs decks/ref-04-swiss-investor-blue.html
```

Créer un pattern avec les champs obligatoires déjà en place :

```bash
node bin/new.mjs card stat-accent --ref ref-06-orange-notched
```

### Sourcer des photos : par PALETTE, jamais « les huit premières »

Ce qui fait tenir une planche d'images n'est pas la qualité de chaque photo, c'est leur
**casting commun** — ref-10 tient parce que ses six photos portent toutes du rouge ou du brun.
`bin/photos.mjs` interroge une banque d'images libres, classe les candidats par **ΔE76 CIELAB**
contre une palette cible, ne télécharge que les retenus, et écrit un manifeste de crédits.

Deux fonds, deux économies :

| fond | clé | couleur publiée ? | coût du tri | matière |
|---|---|---|---|---|
| `pexels` (défaut) | oui, gratuite (25 000 req/mois, attribution non requise) | `avg_color` dans la réponse | **1 requête pour 80 candidats** | photo éditoriale contemporaine |
| `met` (Metropolitan) | **aucune** | non | 1 requête de détail + sonde vignette par candidat (`--scan` borne) | œuvres domaine public (CC0) : matière, texture, fond |

```bash
node ~/Documents/Claude/Projects/cartographie-it/bw-get.mjs \
  --item "Pexels — API" --field PEXELS_API_KEY --as PEXELS_API_KEY \
  --exec 'node bin/photos.mjs --slug ref-10-campaign-board-red --palette ref-10-campaign-board-red --n 3 \
    --query "cow hide close up" --query "red satin jacket"'
```

```bash
node bin/photos.mjs --provider met --slug musee --palette "#E33A22" --query "red lacquer"
```

La clé vit dans le coffre, **jamais** dans un fichier de réglages ni en argument. `--palette`
prend un id de référence ou une liste de hex ; `--any` assume l'absence de tri ; `--tol` règle le seuil
(42 par défaut) ; `--orientation portrait|landscape|square`.

Trois constats payés, à ne pas repayer :

- **Une cible neutre ne prouve aucun casting.** Le crème `#EDEAE3` de ref-10 a fait passer une
  route bleu-gris à la première récolte — un gris est à ΔE modéré de tous les gris du monde. Les
  cibles peu chromatiques sont écartées d'office (sauf palette entièrement neutre) ; passe les
  ACCENTS, pas la couleur du papier.
- **Quand un fond ne publie pas de couleur**, `sips` (natif macOS) réduit l'image à 1×1 : c'est
  la moyenne, calculée par le système. Un PNG d'un pixel se décode sans dépendance — tous les
  filtres PNG y référencent des voisins hors cadre, donc l'octet brut EST la valeur.
- **L'Art Institute of Chicago est écarté.** Sa meilleure API du lot (sans clé, couleur
  dominante ET drapeau domaine public dans la recherche) est inutilisable : son serveur d'images
  IIIF répond **403** à tout client non navigateur, en-têtes Chrome et Referer compris. Un fond
  qui ne livre pas de fichier n'a pas sa place dans l'outil.

Chaque récolte écrit `manifest.json` (crédits, licence, `avg_color`, ΔE, dimensions) —
**versionné**, il permet de re-télécharger à l'identique — et un `board.html` pour regarder :

```bash
node bin/render.mjs assets/photos/ref-10-campaign-board-red/board.html 1600 1180
```

Les `.jpg` sont gitignorés : la doctrine du dépôt interdit le poids binaire dans l'historique,
comme pour `proofs/`.

## Contrat d'un pattern

`bin/index.mjs` **refuse d'écrire la base** si un pattern ne respecte pas le contrat — une
bibliothèque à moitié indexée qui se tait coûte plus cher qu'une erreur bruyante.

1. `family` dans le vocabulaire fermé (cf. Nomenclature) ET égale au préfixe du nom de fichier.
2. `name`, `ref`, `intent` et au moins un `tag` renseignés (sans tag, il est introuvable).
2-bis. `media`, s'il est présent, dans le vocabulaire fermé — un média inventé ne remonterait
   dans aucun filtre, et une panne silencieuse de routage se lit comme « la bibliothèque n'a
   rien pour ce canal ».
3. Un fichier `.html` existe : un pattern sans rendu n'est pas un pattern, c'est une note.
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

**17 patterns**, après l'élagage du 30/07 : neuf entrées ont été retirées parce qu'elles ne
survivaient pas au test d'utilité — une pilule à filet, une flèche dans un rond, un titre en
grosses capitales, trois « règles » qui n'avaient aucun rendu. Un pattern se garde s'il porte
une COMPOSITION qu'on ne réécrit pas de tête, ou une géométrie mesurée ; pas s'il tient dans sa
propre phrase de description.

8 références sur 12 reconstituées. Le décompte par référence — patterns extraits, deck présent —
est dans le tableau « Références » d'[INDEX.md](INDEX.md), qui est GÉNÉRÉ : c'est la seule
version qui ne peut pas mentir. Deux références ont leur deck mais pas encore leurs patterns
(`ref-08-swiss-studio-hero`, `ref-10-campaign-board-red`), et `ref-12-neon-capsule-tags` a ses
patterns sans deck.

`ref-06-orange-notched` est le lot qui a apporté le reste de l'outillage : la mesure
(`bin/check.mjs`), l'index versionné (`INDEX.md` / `index.json`) et le pont .pptx
(`kit/vl_pptx.py`). Suite et prompt de reprise : [ROADMAP.md](ROADMAP.md).

**31/07/2026 — le dépôt devient une bibliothèque partagée, pas seulement une réserve à slides** :
`SKILL.md` (les deux verbes, consulter / verser), `DOCTRINE.md` (les lois, tous médias, et qui
les mesure), le champ `media` avec son filtre, `bin/emit.mjs` (émetteurs + audit de faisabilité),
`bin/contact-sheet.mjs` (la revue à l'œil) et le garde-fou anti-doublon de `bin/new.mjs`.
`media` n'a été renseigné à la main sur aucun pattern existant : ils valent tous `slide web`, ce
qui est exact. Le remplir est un acte délibéré, adossé à un rendu sur le canal visé — le
déclarer « social » sans avoir jamais rendu la vignette en 1080×1350 serait un mensonge de
catalogue.

**Typographie** : les polices vivent dans le dépôt (`fonts/`, licences OFL) et se branchent
par `@import url("../fonts/fonts.css")` **dans** le bloc `<style>` du deck — jamais par une
balise de lien, que l'export slide par slide ne reprend pas. Registre et pièges de taille :
[fonts/FONTS.md](fonts/FONTS.md).
