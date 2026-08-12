# visual-lab

**Start here / Commencer ici**

```bash
node bin/index.mjs && open gallery.html   # la VITRINE : tous les patterns rendus, filtrables
node bin/search.mjs --show <id>           # un fragment + ses tokens, prêts à coller
```

> **AI agents: read [`AGENTS.md`](AGENTS.md) first** (also served as `CLAUDE.md`). It is the
> short, English, machine-facing entry point: what a pattern is, how to consume `index.json`,
> how to theme, how to verify, and what not to do. Nothing to install, no network, no build.
>
> **Humains** : [`gallery.html`](gallery.html) est la page de contrôle — les fragments rendus
> VIVANTS, une carte du corpus qui montre les trous, une recherche et un bouton « copier » par
> pattern. Régénérée par `bin/index.mjs`, jamais éditée à la main. Aucune image nulle part :
> une capture est une copie morte, elle périme en silence.

## Sommaire

- Start here / Commencer ici
- Ce que ce dépôt est, et n'est pas
- Ce qui est la source de vérité d'un pattern
- Arborescence
- Nomenclature
- Médias et émetteurs — un pattern, plusieurs sorties
- Le cadre — tenir dans le format d'un canal, à la taille où on le regarde
- Choisir à l'œil : la vitrine `gallery.html`
- Le contrôle : mathématique d'abord, visuel ensuite — en boucle
- Utilisation
- Contrat d'un pattern
- État

> Dépôt **public** sous [licence MIT](LICENSE). Trois réserves, détaillées dans
> [NOTICE.md](NOTICE.md) : les polices de `fonts/` restent sous OFL, les photographies ne sont
> pas dans le dépôt (seuls les manifestes le sont, crédits et licence par image), et les
> références reversées ne sont nommées nulle part — ce qui est capitalisé ici est une
> GÉOMÉTRIE, les textes de démonstration utilisant le nom fictif `northbeam`.

Bibliothèque de **patterns visuels HTML/CSS** reconstruits par reverse-engineering à partir
d'un corpus de 15 références (decks, planches de campagne, heros web, écrans d'application). Objectif : quand il
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
AGENTS.md              LE POINT D'ENTRÉE DES AGENTS (servi aussi comme CLAUDE.md) — court, en anglais
SKILL.md               le mode d'emploi OPÉRATEUR du mainteneur (français) — utile, pas nécessaire
DOCTRINE.md            les lois de mise en page de la maison, TOUS MÉDIAS — et qui les mesure
gallery.html           LA VITRINE : tous les patterns RENDUS, dans un navigateur — GÉNÉRÉ, jamais édité
INDEX.md               LE POINT D'ENTRÉE : catalogue de routage + détail — GÉNÉRÉ, jamais édité
index.json             le même pour la machine (ratios, benchmarks, tokens) — GÉNÉRÉ
patterns/<id>.json     métadonnées d'un pattern (intention, quand l'employer, quand l'éviter)
patterns/<id>.html     le fragment autonome correspondant
systems/<ref>.json     les tokens d'une référence (palette, typo, rayons, notes de charte)
decks/<ref>.html       la reconstitution fidèle de la référence, au format slides
SPEC-SOURCES.md   l'audit des références — REMPLACE les images quand elles ne sont pas, qui n'existent pas sur disque
ROADMAP.md        le découpage en lots + le prompt de continuation
fonts/                 les 3 polices du corpus (OFL, dans le dépôt) + fonts.css
fonts/FONTS.md         quelle police pour quelle référence, et comment la brancher
assets/photos/<ref>/   récoltes d'images libres : manifest.json VERSIONNÉ, .jpg gitignorés
bin/                   les outils (index, recherche, rendu, export slides, planche, création, CHECK, ÉMETTEURS)
bin/ingest.mjs         AMONT : pose l'image source sur le disque (presse-papiers ⌘C, ou fichier)
bin/palette.mjs        AMONT : palette quantifiée, pipette exacte (--at), zoom (--crop --zoom)
bin/new-ref.mjs        ouvre un lot : section de spec + systems/ + deck au format PPT 1600×900
bin/check-deck.mjs     le lint de COMPOSITION : format, couches, couche 1:1 redondante
bin/diff.mjs           rendu ET source côte à côte — le contrôle de fidélité
assets/refs/<ref>.png  les images sources des reverses — GITIGNORÉES (visuels tiers)
bin/gallery.mjs        LA VITRINE HTML : les fragments rendus tels quels, code dépliable — jamais un PNG
bin/contact-sheet.mjs  planche-contact PNG — instrument de mesure INTERNE, jamais un livrable
bin/emit.mjs           sortir un pattern vers un autre média (inline, email) — refuse si ça ne tient pas
bin/frame.mjs          le pattern tient-il dans le CADRE d'un canal (social 1080×1350), à la taille où on le regarde
kit/vl_pptx.py         le pont vers le .pptx : émetteurs + audit mathématique (lit index.json)
patterns.db            index SQLite pour la recherche plein texte — REGÉNÉRABLE, gitignoré
proofs/                PNG de vérification — régénérables, gitignorés
proofs/<ref>/          un PNG par slide du deck (export bin/slides.mjs)
```

## Nomenclature

Deux séries de noms, et pas une de plus.

- **Un pattern** : `<famille>[-NN]-<mots simples>` — `card-03-stat-accent`, `chart-02-isotype`,
  `shape-notched-corner`. Le numéro n'apparaît **que si la famille en compte plusieurs** ;
  `bin/new.mjs` renumérote l'existant tout seul quand un deuxième arrive. Les familles sont un
  vocabulaire fermé — `card`, `chart`, `diagram`, `layout`, `list`, `shape`, `tag`, `title` — et
  `diagram` n'est pas `chart` : un `chart` porte des DONNÉES (une valeur mesurée décide de la
  géométrie), un `diagram` porte une STRUCTURE (couches, flux, appartenance), où rien n'est
  proportionnel à quoi que ce soit. Le préfixe du fichier DOIT être la famille déclarée : `bin/index.mjs` refuse d'indexer sinon. Le nom du
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

**Au 11/08/2026 : 41/41 en `inline`, 3/41 en `email`** — et les trois qui passent sont les trois
qui ont été ÉCRITS pour ce canal (`layout-09-email-envelope`, `list-06-email-digest`,
`card-13-email-figure-band`). Les 38 autres ne passent pas, et ce n'est pas une panne : flex,
`clip-path`, `calc()`, SVG inline, couleurs à canal alpha — le reste du corpus est de la matière
slide/web. Un pattern reversé d'une slide ne devient pas émissible en mail parce qu'on l'a
souhaité ; pour un mailing, deux issues honnêtes : partir d'un pattern natif email, ou rendre le
pattern en image et poser l'image. **Quand `media` et l'audit divergent, c'est le JSON qui a
tort** — les trois patterns email déclarent `media: ["email"]` et le prouvent.

Écrire ces trois patterns a corrigé l'émetteur deux fois, dans le même lot :

- il **ignore désormais les commentaires HTML** avant de scanner. Un pattern écrit pour l'email
  documente forcément ce qu'il s'interdit — et `layout-09` a d'abord été déclaré non émissible à
  cause du mot `calc()` dans son propre commentaire. Un faux positif se corrige dans le
  détecteur, jamais dans la source ;
- il **bloque les couleurs à canal alpha** (`rgba(…, 0.55)`, `#00000018`). Outlook ignore la
  transparence et rend la couleur PLEINE : un filet à 10 % devient un trait noir, un verre dépoli
  devient un aplat. C'est destructeur, pas dégradé. Le contrôle ne pouvait pas le voir avant,
  parce qu'il ne cherchait que la propriété `opacity` alors que la transparence du corpus vit
  dans les TOKENS — il attrape maintenant 6 patterns de plus. Les entités numériques sont
  retirées avant ce test : `&#8599;` (↗) se lisait sinon comme un hex à quatre chiffres.

### Le cadre — tenir dans le format d'un canal, à la taille où on le regarde

Un émetteur répond à « le moteur de la cible sait-il rendre ça ». Il ne répond pas à « à la
taille où ce sera regardé, est-ce encore lisible ». C'est une autre question, et elle a son
outil :

```bash
node bin/frame.mjs --audit --target social                 # l'état de toute la bibliothèque
node bin/frame.mjs card-03-stat-accent --target social     # un pattern, mesures détaillées
node bin/frame.mjs card-03-stat-accent card-12-inverted-kpi-row --target social \
  --out proofs/social.html                                 # et le RENDU, à la largeur d'un téléphone
```

**Au 11/08/2026 : 10 patterns sur 41 tiennent le cadre `social` (1080 × 1350).** Ce que ça
mesure : le pattern est mis à l'échelle du cadre (`k = zone sûre ÷ taille du pattern`), puis on
vérifie que son plus petit corps reste au-dessus du plancher — **2,2 % de la largeur du cadre**,
soit 24 px sur 1080 — et qu'il occupe au moins 45 % de la hauteur utile. Un pattern peut être
vert au `check` et vert à l'`emit` tout en étant illisible ici : `check` mesure des RAPPORTS, qui
survivent au changement d'échelle par construction. C'est exactement là que le trou se cachait —
`card-12-inverted-kpi-row`, réglé pour 1286 px de large, sort ses notes à 11 px sur 1080 et
n'occupe que 13 % du cadre.

La sortie `--out` est du HTML : elle rend chaque cadre **à 390 px de large, la largeur d'un
téléphone**, avec la zone sûre en pointillés. Un cadre montré à 100 % ou réduit « pour tenir »
mentirait sur la seule chose qu'on cherche à savoir. Et la mise à l'échelle est calculée
analytiquement, jamais obtenue par `zoom` : sous `zoom`, Chrome renvoie une taille de police non
zoomée à côté d'une boîte zoomée, et la mesure mentirait d'un facteur k sans rien signaler.

**La mesure autorise la déclaration, elle ne la remplace pas.** Les 10 patterns qui tiennent le
cadre ont été rendus et REGARDÉS un par un ; **7 portent désormais `media: social`**. Trois ont
été écartés malgré un contrôle vert, et tous les trois pour la même raison, qui vaut d'être
nommée : **quand le fond du pattern est le même blanc que le sol du cadre et qu'il n'occupe pas
tout l'espace, le post n'a plus de bord** — dans un fil, on ne voit pas où le visuel commence
(`card-11-corner-arrow-tile`, `chart-05-tile-heatmap`). Le troisième, `shape-notched-corner`,
n'a aucun texte : il passe le plancher typographique par absence de sujet, pas par mérite —
l'outil le dit lui-même, et une primitive de forme ne devient pas un post parce qu'elle tient
dans le cadre. Aucun de ces trois défauts n'est mesuré aujourd'hui.

Le débordement, lui, EST mesuré depuis le 11/08 : un descendant qui sort de la boîte de la
racine (pastille absolue, poignée soudée au bord) sortirait aussi de la zone sûre, et « le
pattern tient dans la zone sûre » serait alors vrai de la racine et faux du rendu. **Aucun des
41 patterns ne déborde** — constat vérifié par contre-épreuve : le détecteur rend 0 sur un cas
sain et 45 px sur un cas construit qui déborde de 45 px.

Ce que `frame.mjs` ne dit toujours pas : si le post est bien COMPOSÉ, et s'il se détache de son
sol.

Il n'y a **pas** d'émetteur `print` : un fragment HTML s'imprime tel quel (Chrome → PDF).
Annoncer un émetteur qui ne ferait que recopier le fragment mentirait sur ce que le dépôt sait
faire. Ce qui compte à l'impression est ailleurs — encre (aplats, ombres, dégradés) et polices
embarquées depuis `fonts/`.

## Choisir à l'œil : la vitrine `gallery.html`

Le routage se fait sur `INDEX.md` — du texte, pas cher. La vitrine sert l'étape d'après :
arbitrer entre les finalistes, passer une branche en revue, voir ce qui manque.

```bash
node bin/index.mjs && open gallery.html     # elle se régénère AVEC le catalogue
node bin/gallery.mjs --family card          # ou filtrée à la génération
node bin/gallery.mjs ref-17 ref-18
```

Ce qu'elle porte, et qui n'existe nulle part ailleurs :

- **les fragments RENDUS**, chacun sur le sol et les tokens de SA charte — quinze systèmes
  emploient les mêmes noms `--vl-*`, donc les tokens sont posés en style inline sur chaque
  vignette : un `:root` global les ferait se contaminer ;
- **une carte du corpus** (références × familles) dont les cases vides sont l'information utile —
  un catalogue en liste cache exactement ce que la bibliothèque ne couvre pas ;
- une **recherche** plein texte, des filtres famille/média, et un bouton **copier** par pattern ;
- les conditions d'emploi (`when_to_use` / `avoid_when`) sous chaque rendu, parce que c'est ce
  qui empêche de sortir un pattern dans le seul cas où il dessert.

L'échelle passe par `zoom` et non `transform` : `transform` ne reflue pas, il faudrait donc lui
réserver une hauteur calculée — et les sept patterns qui ne déclarent pas de `geometry.frame` se
retrouveraient rognés ou noyés dans du vide. **Aucune image nulle part** : une planche-contact en
PNG périme au premier changement de fragment sans que rien ne le signale. `bin/contact-sheet.mjs`
et `bin/render.mjs` subsistent comme instruments de mesure internes (sorties dans `proofs/`,
gitignoré) ; ils ne produisent pas de livrable.

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
`kit/vl_pptx.py` qui le pose sur une slide). **`pptx.emitter` est vérifié à l'indexation** : il
nomme une fonction qui doit exister dans le kit, sinon `bin/index.mjs` refuse. Une déclaration
sans fonction derrière est une promesse faite à `deck-builder` qui ne se découvre qu'à l'appel,
au milieu d'un deck — deux patterns en portaient une. Un pattern non émis se déclare comme tel
(`primitive` + une `note` sur ce que la conversion devra traiter), il ne s'invente pas d'émetteur.

## État

**57 patterns**, dont 50 mesurés par des benchmarks. Le décompte vient de `bin/index.mjs`, pas
d'ici : la ligne ci-dessus est un ordre de grandeur, [INDEX.md](INDEX.md) est la vérité.

**11/08/2026 — le corpus sort du slide/web : trois patterns écrits NATIVEMENT pour l'email**
(`layout-09-email-envelope`, `list-06-email-digest`, `card-13-email-figure-band`). Ils inversent
la méthode du dépôt : au lieu de reverser une composition puis de constater qu'elle ne passe pas
la cible, on part de ce que le moteur Word d'Outlook sait rendre — tables, largeurs de cellules,
padding, aplats pleins — et on compose avec cela seulement. Les trois sortent de
`bin/emit.mjs --target email` sans un seul bloquant, et se posent l'un dans l'autre : les deux
blocs de contenu font 520 px, soit exactement le slot de l'enveloppe (600 − 2 × 40).
Ils sont adossés à `ref-04-swiss-investor-blue` parce que c'est la charte du corpus la plus
nativement compatible avec le canal — aucun rayon, aucune ombre, aucune couleur translucide,
trois aplats pleins qui alternent : rien de ce qu'un client mail dégrade. Le lot a fait bouger
l'émetteur (deux corrections, cf. « Médias et émetteurs »), et il ne prétend rien de plus que ce qu'il mesure — les 38 autres
patterns restent hors canal.

Élagage du 30/07 toujours en vigueur : neuf entrées avaient été retirées parce qu'elles ne
survivaient pas au test d'utilité — une pilule à filet, une flèche dans un rond, un titre en
grosses capitales, trois « règles » qui n'avaient aucun rendu. Un pattern se garde s'il porte
une COMPOSITION qu'on ne réécrit pas de tête, ou une géométrie mesurée ; pas s'il tient dans sa
propre phrase de description.

**18 références, et depuis le 12/08/2026 elles sont toutes COMPLÈTES** — chacune a son deck ET
ses patterns. Aucune n'a plus de deck sans extraction, aucune n'a plus de patterns sans
reconstitution : c'était le dernier trou du corpus, dans les deux sens. Le décompte par
référence est dans le tableau « Références » d'[INDEX.md](INDEX.md), qui est GÉNÉRÉ : c'est la
seule version qui ne peut pas mentir.

**12/08/2026 — `ref-05-proposal-acid-yellow` est versée**, huit slides et quatre patterns
(`title-05-hyphen-break`, `shape-04-asterisk-mark`, `card-14-numbered-steps`,
`layout-16-header-tripartite`, 67 benchmarks). Sa charte tient en une phrase — neutre plus UN
accent fluo — et c'est ce que le lot a dû apprendre à MESURER, parce qu'une règle éditoriale
sans chiffre ne tient jamais. Ce qui en sort dépasse cette charte. **L'accent unique est une
contrainte de dimension avant d'être une contrainte de compte** : la carte de total de la
slide 7 était bien le seul objet jaune de sa slide, et couvrait 21,4 % de sa surface pour un
plafond de 12 % — parce qu'elle avait été laissée à pleine hauteur de colonne. **Mais un objet
borné ne peut pas tenir une colonne**, et c'est le regard, pas la mesure, qui l'a vu : bornée
à 300 px puis laissée pendre en pied, la même carte respectait le plafond et laissait 300 px de
bande morte sous le titre. La borne avait déplacé le défaut — un objet dont la dimension est
contrainte doit changer de PLACE. Troisième acquis, un contraste : **`#EAFF00` sur `#EFEFED`
vaut 1,03:1**, deux luminances presque égales séparées par une seule teinte, qui vibre à
l'écran et disparaît en gris. La charte l'écrivait de travers (« le jaune ne colore jamais du
texte » — faux, l'astérisque du carré noir EST une encre) et cette approximation avait laissé
passer un astérisque jaune sur le fond clair. La règle exacte est que **le jaune ne descend
jamais sur le fond clair** : il y est en aplat, ou en encre sur noir. Aucune image source sur
disque : `bin/diff.mjs` impossible.

**12/08/2026 — `ref-01-bento-pills-2030` est versée**, et c'est la seule planche du corpus qui
ne porte **aucun texte** hormis son année : tout y est dit par la forme, ce qui en fait le seul
endroit où les lois de forme sont le sujet et non le décor. Trois patterns —
`layout-15-primitive-mosaic` (4 × 3 cellules carrées, une seule gouttière, un seul creux placé),
`shape-02-teardrop-quadrant` (le carré à un seul coin droit, qui pointe le coin qu'il occupe) et
`shape-03-stadium-track` (le rail et son enfant emboîté, deux remplissages pour un seul objet).

Le lot a établi trois choses qui resservent partout ailleurs. **Un rayon écrit en `%` se résout
par AXE** : `border-radius: 50%/50%` sur une boîte 2:1 donne une ellipse, pas un stadium — et
lire la valeur calculée ne le voit pas, Chrome rend le `%` tel quel. Les benchmarks sondent donc
la forme PEINTE au point (`elementFromPoint`) sur cinq et six angles. **Une grille de cellules
carrées a un aspect borné** : 4 × 3 plafonne à 3/2 et ne remplira jamais un 16:9 ; le benchmark
ne le calcule pas, il reparamètre la gouttière de 0 à 1000 px et constate. Et **un fragment dont
la géométrie dépend d'une chasse doit épingler sa police** : le corps de l'année vaut
`calc(100cqw / 1,216)`, où 1,216 est la chasse d'un grotesk précis. Sans famille déclarée, le
même calcul saturait 88 % sous `check.mjs` (qui sert « Helvetica Neue » en tête) et 97 % sous
`render.mjs` (qui sert la police système) — vert au harnais, faux au rendu. C'est maintenant une
assertion : la saturation est remesurée après qu'un serif a été imposé à la racine du fragment.

**12/08/2026 — `ref-07-retro-brand-hero` est versée**, et c'est la première PAGE WEB du corpus :
scène 1440 × 900 déclarée `vl:stage web`, parce qu'un hero de page n'a rien à faire dans un
16:9 de projection. Quatre patterns : `layout-11-hero-card-on-photo` (la carte incrustée sur un
sol photographique — ici la photo n'est pas une mise en scène du design, c'est le fond de la
page, et l'ôter supprimerait le sujet), `layout-12-nav-three-zone` (le nom centré sur le
CONTENEUR, pas entre ses deux voisins), `title-03-wordmark-bottom-left` (le nom en pied et sa
masse de contrepoids en diagonale) et `layout-13-image-triptych` (trois images qui font une
bande). Les deux derniers ont démenti la spec sur un chiffre chacun : le wordmark mesure
0,465 de la largeur de carte et non 0,51, et les trois images ont des largeurs ÉGALES là où la
liste de patterns annonçait l'inverse — la table de géométrie de la même spec disait déjà le
contraire. Effet de bord mesuré : `overflow()` est le mauvais instrument pour un interligne
écrasé (à 0,82 la boîte de contenu de la ligne dépasse de 24 px sous sa propre boîte et
`scrollHeight` le compte), ce qui rendait rouge un pattern parfaitement contenu ; la containment
se mesure sur les BOÎTES, et le vide sous la ligne de base se prouve au canvas.

**12/08/2026 — `ref-08-swiss-studio-hero` est extraite, et c'est la PARAMÉTRABILITÉ qui y est
prouvée, pas le nombre de patterns.** Deux versés (`layout-14-statement-first`,
`title-04-name-fills-measure`), un généralisé — et c'est ce dernier qui porte le lot :
`layout-13-image-triptych`, écrit pour `ref-07`, rend maintenant les DEUX références **par
variables**. Sa loi était mal énoncée : « même ratio pour les trois cellules » n'est pas ce qui
fait une bande, c'est seulement ce qu'on obtient à poids égaux. La loi est la **hauteur
commune** ; le ratio n'est qu'un moyen de la déduire quand on la laisse libre. Écrit à
l'ancienne, `aspect-ratio` posé sur les trois cellules leur imposait trois hauteurs différentes
dès que les poids cessaient d'être égaux — la bande se disloquait, et aucune variable ne pouvait
la sauver. Posé sur la première seule, il donne sa taille transversale à la ligne flex, et
`align-items: stretch` la recopie : un benchmark reparamètre alors le fragment aux valeurs de
`ref-08` (1060 de large, gouttière 16, hauteur 380, poids 1 / 1,31 / 1,14) et retrouve les
cellules relevées sur le deck à 0,2 % près. Deux autres leçons du lot, mesurées :
`layout-11-hero-card-on-photo` ne s'applique PAS ici, et c'est son `avoid_when` qui le dit — sans
sol photographique il n'y a ni incrustation ni marge de sol, donc l'absence n'est pas un manque.
Et le corps d'un nom d'enseigne n'est pas une taille de charte mais une **fonction de la
largeur** (`calc(100cqw / chasse)`) : reparamétrée à 700 px, la zone de `title-04` garde
exactement son taux de remplissage, là où un corps en dur y sortirait à 1,51 fois la mesure. Le
contrôle qui le prouve mesure l'ENCRE au `Range` et non la boîte du `h1` — un `h1` est un bloc,
sa boîte fait la largeur utile quoi qu'on écrive dedans, donc elle ne peut rien prouver. Aucune
image source sur disque : `bin/diff.mjs` impossible.

**12/08/2026 — `ref-10-campaign-board-red` est extraite**, en trois patterns et non les cinq
que la spec annonçait. Les cinq de la spec étaient nommés par ÉLÉMENT (« le titre condensé »,
« le numéro entre parenthèses », « le bloc de micro-capitales ») ; trois d'entre eux tiennent
dans leur propre phrase de description et ne survivaient pas au test d'utilité du 30/07. Ils
sont donc absorbés dans `title-02-condensed-overlay-stack`, qui porte ce qu'ils ont en commun
et que chacun perd isolé : leur DISPOSITION mutuelle — un fer unique partagé par le titre et
le numéro, un contrepoids au coin diagonalement opposé. Restent
`layout-10-bleed-column-inset` (le lit d'images à fond perdu et son incrustation) et
`list-07-hairline-spec-table` (le tableau libellé/valeur dont les filets débordent la marge de
texte). Le lot a d'abord corrigé la source : son rouge relevé (`#E33A22`) tient 3,57:1 sur la
crème, ce qui passe pour un titre de 104 px mais échoue pour les micro-capitales de 13 px
écrites du MÊME rouge — descendu à `#C82C15`, 4,57:1. Et c'est le regard, pas la mesure, qui a
sorti le dernier défaut : les cellules du tableau étaient centrées dans leur ligne, si bien
qu'un libellé d'une ligne flottait au milieu d'une valeur qui en fait trois, au lieu de pendre
du filet qui l'ouvre. Corrigé dans le pattern ET dans le deck, et verrouillé par une assertion
d'alignement des premières lignes.

**31/07/2026 — `ref-14-layer-stack-coral`** : le premier **schéma** du corpus, au sens propre —
une figure qui explique une STRUCTURE et non une donnée. D'où la famille `diagram`, qui n'est pas
`chart`. Une pile de losanges isométriques dont la profondeur est encodée **sans ombre, sans
perspective et sans seconde teinte** : par l'ordre d'empilement et par une opacité qui décroît
d'un rapport constant (× 0,42). Les recouvrements ne sont jamais dessinés, ils sont composités —
c'est ce qui rend le schéma rejouable sur une autre charte en ne changeant qu'UNE couleur.

**12/08/2026 — `ref-12-neon-capsule-tags` a enfin son deck**, et c'est lui qui a corrigé le
pattern, pas l'inverse. `tag-01-gooey-capsule` existait depuis des semaines sans reconstitution :
son unité (`--vl-cap-u: 56px`) n'avait jamais été confrontée à une slide, et laissait la pile à
26 % de la largeur — le vide en pied de slide que DOCTRINE §1 interdit. Posée sur 1600 × 900,
l'unité n'est plus libre : six rangées de `1,255 u` et cinq écarts de `0,1 u` la plafonnent à
97 px. Les deux défauts qui ont suivi sont du même genre — invisibles à toute assertion de
géométrie, et sortis par le seul regard sur le rendu. **(a)** Chrome arrondit une bordure CSS au
pixel entier là où il ne le fait pas d'un stroke SVG : à `u = 97` le contour changeait
d'épaisseur (5,335 → 5 px) à chaque soudure, douze fois par slide, sur la seule chose qui fasse
la signature de cette charte ; `u = 91` égalise les deux à 5,005 px. **(b)** Bout à bout, les
deux traits laissent un trou de rastérisation d'environ 0,7 px — un contour continu en calcul,
interrompu à l'œil ; un débord de `0,05 u` aux extrémités des tracés porte la couverture des
douze lignes droites de 0,30 à ≥ 0,99. Les treize benchmarks du pattern sont restés verts d'un
bout à l'autre, sans qu'on en touche un seul : ils sont en RATIOS, donc structurellement aveugles
à l'échelle et à la rastérisation. C'est exactement le partage de travail que le dépôt assume —
la mesure tient la géométrie, le regard tient le reste.

**12/08/2026 — la pile de couches sort en .pptx** (`vl_pptx.layer_stack`) : `diagram-01` était
le seul pattern à géométrie complète sans émetteur, donc invisible dans `deck-builder`. Deux
choses s'y sont apprises. L'opacité n'y est pas un effet mais l'INFORMATION — or python-pptx
n'expose aucune transparence, elle s'écrit dans le XML du remplissage, faute de quoi les trois
plans sortent identiques et le rang disparaît. Et le pas de la pile est géométrique quand le
corps, lui, est ancré au plancher de lisibilité en points : les deux ne tiennent ensemble
qu'au-delà d'une largeur donnée, sous laquelle l'explication d'une couche mord sur le nom de la
suivante. L'émetteur la calcule et REFUSE de poser en dessous, en donnant la largeur minimale —
un texte qui déborde n'est pas une erreur en .pptx, personne ne l'aurait signalé.

**31/07/2026 — `ref-13-glass-fintech-dashboard`** : la première référence en **verre dépoli**
(deux couches — un fond en dégradé qui accueille, des modules translucides posés dessus — et
rien d'opaque sauf l'accent : la hiérarchie est portée par le taux de blanc et le flou
d'arrière-plan) et le premier **fond en dégradé** du corpus. Elle a fait bouger l'outillage :
`bin/check.mjs` composite désormais les couches translucides pour calculer un fond effectif, au
lieu de sauter tout fond d'`alpha ≤ 0.5` — sans quoi un système en verre sort illisible à tort.

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
