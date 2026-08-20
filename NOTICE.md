# NOTICE — ce que la licence MIT ne couvre PAS

[LICENSE](LICENSE) est un MIT nu, exprès : GitHub ne reconnaît une licence que si son texte n'est
pas amendé, et une licence affichée « Other » n'informe personne. Les réserves vivent donc ici.

## 1. Les polices

Les fichiers de `fonts/` (Archivo, Inter, Anton) sont sous **SIL Open Font License 1.1**, chacun
avec sa licence à côté de lui (`fonts/LICENSE-*-OFL.txt`). Les redistribuer, c'est garder l'OFL —
pas le MIT de ce dépôt.

## 2. Les photographies

Aucune image n'est committée : `assets/photos/**/*.jpg` est gitignoré. Ce qui est versionné, ce
sont les **manifestes** (`manifest.json`), qui portent pour chaque photo son fournisseur, son
auteur, sa licence et sa couleur moyenne. C'est ce manifeste qui permet de re-télécharger à
l'identique — et c'est lui qui fait foi sur les droits, pas la licence de ce dépôt.

Fournisseurs utilisés par `bin/photos.mjs` : **Pexels** (clé d'API requise, jamais dans ce dépôt —
elle vit dans un coffre) et le **Metropolitan Museum of Art** (domaine public / CC0, sans clé).

## 3. Les références reversées

Les patterns sont des **reconstructions**. Ce qui est capitalisé est une **géométrie** — ratios,
échelles typographiques, seuils de contraste mesurés — à partir de visuels tiers qui ne sont
nommés nulle part et dont aucun fichier n'est distribué ici. Les identifiants sont opaques
(`ref-NN-<slug>`), et les textes de démonstration utilisent le nom fictif `northbeam`.

Si vous reconnaissez votre travail dans une reconstitution de `decks/` et que sa présence vous
gêne : ouvrez une issue, elle sera retirée.

## 4. Le rayon extérieur — des bibliothèques tierces, servies telles quelles

Depuis août 2026, le site publié (`visual.capitalb.fr`) sert aussi un **rayon extérieur** : des
bibliothèques libres, déclarées dans `sources/*.json`, récoltées par `bin/harvest.mjs` et rendues
vivantes à côté de la bibliothèque. C'est la seule partie du projet où du code écrit par des tiers
est **redistribué**, et elle obéit à trois règles strictes.

**Le code tiers n'entre pas dans l'historique de ce dépôt.** Les clones vivent dans `.sources/`,
qui est gitignoré. Ce qui est versionné, ce sont les **index** (`sources/*.index.json`) : la liste
de ce qui a été récolté, avec l'auteur de chaque élément et le commit exact de la source. Cloner ce
dépôt ne clone donc aucune bibliothèque tierce ; `node bin/harvest.mjs <id>` les reconstitue.

**Le crédit voyage avec le code.** Chaque élément servi par le site est un fichier autonome dont
l'en-tête porte la source, l'auteur, la licence et un lien vers l'original — parce qu'un fichier
se copie sans la page qui l'entourait. La licence de la source prime sur le MIT de ce dépôt.

**Ce ne sont pas des patterns.** Un élément tiers n'a ni intention déclarée, ni conditions
d'emploi, ni benchmarks. Il n'est pas dans `patterns/`, il n'est pas dans `index.json`, il ne
compte pas dans les totaux de la bibliothèque, et le site le dit sur chaque page où il apparaît.

Sources actuellement déclarées :

| source | licence | ce qui est servi |
|---|---|---|
| [Uiverse](https://uiverse.io) — [galaxy](https://github.com/uiverse-io/galaxy) | MIT | composants CSS de la communauté, crédit par auteur |

Si vous êtes l'auteur d'un élément et que sa présence ici vous gêne : ouvrez une issue, il sera
retiré de l'index.
