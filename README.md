# visual-lab

Bibliothèque de **patterns visuels HTML/CSS** reconstruits par reverse-engineering à partir
d'un corpus de 10 références (decks, planches de campagne, heros web). Objectif : quand il
faut produire une slide, un visuel ou une landing, partir d'un pattern qui a fait ses preuves
plutôt que d'une page blanche — et savoir *pourquoi* il marche.

## Ce que ce dépôt est, et n'est pas

- **Est** : un corpus de fragments HTML autonomes, thémables par variables CSS, indexés et
  interrogeables, chacun documenté par son intention et ses conditions d'emploi.
- **N'est pas** : un framework CSS, un thème, ni un générateur de deck. Il n'y a rien à
  installer et rien à importer — on copie un fragment, on le remplit, on le rend.

Complémentarité avec les skills existants : `deck-builder` produit du **.pptx**,
`theme-factory` applique un **thème existant** à un artefact, `frontend-design` **invente**
une direction, `bestfront` est la **boucle de vérification**. visual-lab fournit la
**matière** : des compositions concrètes déjà validées à l'œil.

## Arborescence

```
SPEC-SOURCES.md   l'audit des 10 références — REMPLACE les images, qui n'existent pas sur disque
ROADMAP.md        le découpage en lots + le prompt de continuation
systems/sys-NN.json    les tokens d'une référence (palette, typo, rayons, notes de charte)
patterns/pat-*.json    métadonnées d'un pattern (intention, quand l'employer, quand l'éviter)
patterns/pat-*.html    le fragment autonome correspondant
decks/ref-NN.html      la reconstitution fidèle d'une référence complète
bin/                   les outils (index, recherche, rendu, création)
patterns.db            index SQLite — REGÉNÉRABLE, gitignoré
proofs/                PNG de vérification — régénérables, gitignorés
```

**Le disque est la source de vérité, pas la base.** `patterns.db` est un index reconstruit à
la demande : il se requête, il ne s'édite jamais. C'est ce qui garde l'historique git lisible
(des diffs de texte) tout en offrant une recherche plein texte.

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
   s'affiche correctement, sans dépendance ni réseau.

## État

4 lots sur 12 faits : socle, `ref-02` (3 patterns), `ref-03` (7 patterns dont la data-viz),
`ref-04` (5 patterns, planche de 10 slides).
Reste 7 références à reproduire, une par lot. Suite et prompt de reprise :
[ROADMAP.md](ROADMAP.md).
