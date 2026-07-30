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
