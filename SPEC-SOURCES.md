# SPEC-SOURCES — audit des 10 références visuelles

## Sommaire

- ref-01-bento-pills-2030
- ref-02-ghost-icon-claim
- ref-03-bento-dark-pitch
- ref-04-swiss-investor-blue
- ref-05-proposal-acid-yellow
- ref-06-orange-notched
- ref-07-retro-brand-hero
- ref-08-swiss-studio-hero
- ref-09-zine-annotated-blue
- ref-10-campaign-board-red
- Vue d'ensemble — ce que le corpus couvre
- ref-12-neon-capsule-tags
- ref-13-glass-fintech-dashboard
- ref-15-lilac-notched-kpi
- ref-14-layer-stack-coral
- ref-16-cobalt-graph-paper
- ref-17-mono-bento-legal
- ref-18-lime-sales-dashboard
- ref-19-acid-clinical-timeline

> **Ce fichier remplace les images.** Les visuels d'origine ont été fournis collés dans une
> session Claude Code (29/07/2026) : ils ne sont **pas** sur le disque et ne survivront pas à
> une session nettoyée. Tout le reverse-engineering des lots suivants se fait à partir de
> cette spec, pas à partir des images. Si une valeur est une estimation à l'œil, elle est
> notée `≈`. Les mesures sont exprimées pour une slide **1600 × 900** (ou une page 1440 de
> large pour les deux références web), à convertir en `rem`/`%` dans le code.

**Anonymisation (31/07/2026, avant publication du dépôt).** Les références sont des visuels
tiers, désignés uniquement par `ref-NN-<slug>` : aucune source n'est nommée, et ce qui est
capitalisé ici est la GÉOMÉTRIE (ratios, échelles, seuils de contraste), pas une création. Les
textes de démonstration qui portaient encore un nom de marque réel ont été remplacés par le nom
fictif `northbeam` — un contenu de remplissage n'a aucune raison de citer une marque, et il
serait recopié tel quel par le premier qui prend le fragment.

Convention d'identifiant : `ref-NN-slug` pour la référence (le même id nomme ses tokens dans
`systems/`, son deck dans `decks/`), `<famille>[-NN]-<mots>` pour un pattern — cf. la section
Nomenclature du README. **Les noms de patterns listés dans les références non traitées sont
indicatifs** : l'id définitif se fige à l'extraction, quand la famille est connue. Ancien
pattern atomique extrait, `sys-NN` pour le système de tokens d'une référence.

---

## ref-01-bento-pills-2030

**Nature** — Slide de couverture, photographiée imprimée en perspective (deux feuilles A4
posées, léger tilt, webcam d'un présentateur en bas à droite). Le contenu à reconstruire est
la feuille de droite, à plat.

**Intention** — Couverture « design system / rapport 2030 » : aucun texte hormis l'année.
Le message est porté par la **géométrie seule**.

**Palette**
- fond page `#F5F4F2` (blanc cassé chaud)
- noir `#0B0B0B`
- rouge vif `#E8342A`
- rouge sombre (fin de dégradé) `#8E1114`
- blanc pur `#FFFFFF` (pastille du toggle, texte de l'année)

**Typo** — Une seule occurrence : « 20 » / « 30 » sur deux lignes, grotesk bold (Helvetica
Neue Bold / Inter 700), ≈ 84 px, `line-height: 0.92`, blanc, centré dans la pilule verticale.
Micro-pied de page « 01 02 03 04 05 » en ≈ 10 px, gris `#C9C7C4`, `letter-spacing: 0.18em`.

**Grille** — 4 colonnes × 3 rangées, gap constant ≈ 18 px, marge de page ≈ 56 px. Les cellules
ne sont pas toutes de même taille : certaines primitives occupent 2 colonnes (pilules
horizontales) ou 2 rangées (pilule verticale).

**Inventaire des primitives (le cœur réutilisable)**
| # | primitive | description géométrique | remplissage |
|---|---|---|---|
| 1 | `disc` | cercle plein | rouge vif |
| 2 | `stadium-h` | rect. arrondi `border-radius: 50%/50%` → `radius = h/2`, 2 colonnes | noir, contient une `stadium-h` interne inset ≈ 14 px, alignée à gauche, en dégradé `linear-gradient(90deg,#FFF,#E8342A)` |
| 3 | `teardrop` | carré arrondi dont **un seul coin** reste droit (ici haut-droit) : `border-radius: 48px 0 48px 48px` | noir |
| 4 | `squircle` | carré, `border-radius: 30%` | noir |
| 5 | `stadium-v` | pilule verticale, 2 rangées, `radius = w/2` | dégradé `linear-gradient(180deg,#E8342A,#8E1114)`, porte le texte « 20 / 30 » |
| 6 | `disc` | cercle plein | rouge vif |
| 7 | `toggle` | `stadium-h` noire contenant un `disc` blanc collé à gauche, inset ≈ 16 px | noir + pastille blanche |
| 8 | `teardrop` (miroir) | coin droit en bas-gauche : `border-radius: 48px 48px 48px 0` | noir |

**Patterns à extraire**
- `layout-bento-primitives` — la grille + le jeu de 6 primitives paramétrables.
- `shape-teardrop` — le squircle à coin unique droit (4 orientations).
- `shape-toggle` — pilule + pastille (sert aussi de puce/indicateur).
- `fill-gradient-stadium` — dégradé directionnel contraint à une forme stadium.

**Piège de fidélité** — La photo est en perspective : ne PAS reproduire l'inclinaison ni
l'ombre. Reconstruire à plat. La perspective sera un pattern séparé (`fx-print-mockup`)
si Léo le demande un jour.

---

## ref-02-ghost-icon-claim

**Nature** — Une carte unique, pleine largeur, extraite d'une page produit (argument
« ego (lite) doesn't collect any data »). Format ≈ 1500 × 660.

**Intention** — Asséner **un seul argument**. Tout le design sert la hiérarchie :
icône énorme mais presque invisible, titre lourd, preuve en gris clair.

**Palette**
- fond page `#F7F7F7`
- carte `#EDEDED`
- icône `#E2E2E2` (à peine plus foncée que la carte — contraste volontairement sous le seuil)
- titre `#444444`
- sous-titre `#A9A9A9`

**Typo**
- Titre ≈ 52 px / poids 700 / grotesk (Inter, Helvetica Neue) / `line-height: 1.18` /
  `letter-spacing: -0.015em`, sur 2 lignes.
  **Le geste** : un fragment du titre — ici `(lite)` — bascule en **serif italique**
  (Times New Roman / Georgia italic), même corps, poids 400. Contraste famille + graisse
  dans la même ligne.
- Sous-titre ≈ 25 px / poids 400 / `line-height: 1.35`, 2 lignes, largeur max ≈ 46 caractères.

**Grille** — Carte `border-radius: 48px`, padding ≈ 60 px vertical / 76 px horizontal.
Deux colonnes : icône ≈ 250 px de large (colonne fixe), gouttière ≈ 90 px, texte sur le
reste. Les deux colonnes sont **centrées verticalement** l'une par rapport à l'autre.

**Icône** — Main ouverte « stop », paume de face, 5 doigts, tracé plein (pas d'outline),
angle légèrement penché (le pouce à gauche). Silhouette simple, coins très arrondis.

**Patterns à extraire**
- `card-ghost-icon-claim` — la carte complète (le pattern principal).
- `type-mixed-family-emphasis` — le fragment serif italique dans un titre grotesk.
- `icon-ghost` — règle de traitement : icône monochrome à `ΔL ≈ 4 %` du fond, taille
  ≥ 3× la hauteur du titre, jamais d'outline.

---

## ref-03-bento-dark-pitch

**Nature** — Planche de 4 slides d'un pitch deck, empilées verticalement sur fond
`#2E2E2E`. Format des slides ≈ 16:10.

**Intention** — Deck investisseur « bento » : chaque slide est une composition de cartes
imbriquées (carte → sous-cartes → tuiles), fond sombre, accents bleu pâle.

**Palette**
- planche / fond `#2E2E2E`
- carte claire `#FFFFFF`, carte sombre `#111111`, tuile grise `#3A3A3A`
- bleu pâle (accent principal) `#CFE3F5`
- bleu moyen (accent secondaire, barres) `#8FBBE4` → `#5E9BD6`
- texte sur clair `#111`, texte secondaire `#6B6B6B`, texte sur sombre `#FFF` / `#A0A0A0`

**Typo** — Grotesk unique (Helvetica Neue / Inter). Titres ≈ 44 px poids 500-600,
`letter-spacing: -0.02em`. Corps 14 px / `line-height: 1.5`. Micro-labels 11 px.
Chiffres KPI 22 px poids 700.

**Rayons** — carte 24 px, sous-carte 20 px, tuile 16 px, badge = pilule.

**Slide A — « Our Highlights »** (split 50/50)
- Gauche, carte blanche : titre 2 lignes, **badge pilule outline** « 2025 » (bordure 1 px
  `#D5D5D5`, padding 6/16, texte 12 px), paragraphe gris 4 lignes.
- Droite, carte noire : grille 2 × 2 de tuiles, gap 12.
  - tuile bleu pâle : `$2M` (22 px, 700) + `ARR achieved in 12 months` (11 px)
  - tuile grise : icône « people » 16 px + `30,000+` + `active users worldwide`
  - tuile grise : icône « layers » + `Expanded into 5 international markets`
  - tuile bleu pâle : `87%` + `Customer retention rate`
  L'icône est en haut à droite de la tuile ; le chiffre en haut à gauche ; le libellé collé
  en bas. Hauteur de tuile identique.

**Slide B — « Market Traction »** (carte blanche pleine)
- Bandeau haut : titre à gauche (2 lignes), paragraphe à droite (2 colonnes 45/55).
- Bandeau bas, 2 blocs (62 / 36, gap 12) :
  - carte noire : micro-label gris `60% of Main Goal already achieved` en haut à droite ;
    `4k` (56 px, 700, blanc) + `Clients to date` (11 px) en bas à gauche ; à droite un
    **isotype** : matrice de pictogrammes « bonhomme » (≈ 10 colonnes × 4 rangées), les
    60 % premiers en bleu `#8FBBE4`, le reste en blanc.
  - carte bleu pâle : **pilule-flèche** outline `→` en haut à gauche, icône barres en haut
    à droite, texte `Closed 12 enterprise clients in 90 days` 20 px en bas.

**Slide C — « Projected Revenue »** (carte noire pleine)
- Gauche 40 % : titre blanc 2 lignes, badge pilule outline `by year`, paragraphe gris.
- Droite 60 % : **bar chart à sommet arrondi**. 4 barres, `border-radius: 999px 999px 0 0`
  (sommet en demi-cercle complet, la barre est une « stadium-top »), largeur 56, gap 22.
  Hauteurs proportionnelles à 1.8 / 2.5 / 3.6 / 4.4. Couleurs : blanc, `#CFE3F5`,
  `#8FBBE4`, `#5E9BD6`. Étiquette de valeur au-dessus de chaque barre (13 px, blanc).
  Axe X : 4 **pilules grises** `#3A3A3A` contenant l'année (11 px, gris clair), pas de ligne
  d'axe.

**Slide D — « Exit Strategy »** (carte blanche)
- Gauche : titre 2 lignes + **flèche ↘ dans un cercle outline** (Ø 36, bordure 1 px) posée
  sous le titre + paragraphe.
- Droite haut, carte noire : micro-label `Investor ROI`, phrase `Expected 10x return` (24 px
  blanc), puis `within 5 years.` en **pilule blanche à texte noir posée en ligne** (le
  surlignage), puis micro-texte gris.
- Droite bas, 2 tuiles (55/43) : bleu pâle `$200M+` + micro-texte ; blanche `Market Timing`
  en badge pilule gris clair + icône graphique + micro-texte.

**Patterns à extraire**
- `layout-bento-nested` — carte → sous-cartes → tuiles, échelle de rayons décroissante.
- `badge-pill-outline` — le badge « 2025 » / « by year ».
- `tile-kpi` — tuile chiffre + libellé + icône d'angle, hauteur figée.
- `chart-isotype` — matrice de pictogrammes à taux de remplissage.
- `chart-bars-stadium` — barres à sommet arrondi + axe en pilules.
- `type-inline-highlight-pill` — mot surligné par une pilule inversée dans le flux.
- `icon-circle-arrow` — flèche dans un cercle outline (↗ ↘ →).

---

## ref-04-swiss-investor-blue

**Nature** — Planche de 10 slides 16:9 d'un « Investor Pitch Deck » (marque tierce, remplacée
partout par le nom fictif `northbeam` — cf. « Anonymisation » en tête de fichier), sur fond de
planche `#D9D2C7`.

**Intention** — Suisse maximaliste : titre-monstre en capitales, alternance de fonds pleins,
photos noir et blanc, aucune fioriture.

**Palette**
- bleu `#1B44D8` (dominante), noir `#0D0D0D`, blanc `#FFFFFF`
- gris de corps `#6E6E6E` sur fond clair, `#D3D3D3` sur fond sombre

**Typo** — Grotesk **Black** (Helvetica Neue Black, Archivo Black, Inter 900) en
**capitales** pour tous les titres : ≈ 76 px, `letter-spacing: -0.02em`, `line-height: 0.92`,
souvent sur 2 lignes, calé en haut à gauche. Corps 13 px / 1.5. Micro-typo header et footer
8 px capitales `letter-spacing: 0.12em`.

**Grille** — Marge 48 px. Header : 3 zones (logo gauche / meta centre / meta droite),
filet fin `#00000018` sous le header sur les slides claires. Footer symétrique. Zone de
contenu en 2 colonnes 50/50 ou 60/40.

**Rythme des fonds** (l'ordre compte, c'est lui qui donne le tempo) :
`noir` (couverture) → `blanc` (problem) → `blanc` (product) → `bleu` (sommaire) →
`bleu` (solution) → `blanc` (business model) → `blanc` (team) → `bleu` (traction) →
`noir` (ask/closing) → `blanc` (unique value).

**Éléments signature**
- **Numérotation géante** : `01 02 03` en ≈ 88 px bleu, poids 900, chaque numéro en tête de
  colonne, texte 13 px dessous, séparateurs verticaux 1 px entre colonnes.
- **Sommaire 2 colonnes** : 12 entrées `01 TABLE OF CONTENT` … `12 ASK/CLOSING`, 11 px
  capitales, colonne gauche 01-06, droite 07-12.
- **Glyphes flèches** `↗` et `↘` posés seuls, en coin de bloc, 20 px.
- **Emphase colorée dans le titre secondaire** : un mot bleu dans une phrase noire
  (`Designed for **simplicity** and **speed**`).
- **Photos N&B** en rectangle net (radius 0), jamais détourées.
- Puces à chevron `↘` alignées en 3 colonnes en bas de slide.

**Patterns à extraire**
- `layout-swiss-header-footer` — micro-header/footer 3 zones + filet.
- `title-monster-caps` — le titre-monstre calé haut-gauche.
- `list-numbered-giant` — colonnes 01/02/03 à numéro géant.
- `toc-two-column` — sommaire numéroté 2 colonnes.
- `deck-rhythm-fullbleed` — la règle d'alternance des fonds pleins (règle éditoriale,
  pas de HTML : stockée comme pattern de type `rule`).

---

## ref-05-proposal-acid-yellow

**Nature** — Planche de 8 slides d'une « Business Proposal 2045 » sur fond `#EFEFED`.

**Palette**
- fond `#EFEFED`, carte blanche `#FFFFFF`, carte noire `#111111`
- jaune acide `#EAFF00` (aplat) — un seul accent, jamais deux
- gris de corps `#7A7A7A`

**Typo** — Grotesk bold, casse mixte (pas de capitales), ≈ 68 px, `letter-spacing: -0.03em`,
`line-height: 0.98`. Césure typographique volontaire dans le titre
(`Business-` / `Proposal`). Corps 12 px / 1.55. Micro-header 8 px capitales.

**Header tri-parti** (présent sur les 8 slides, c'est la colonne vertébrale) :
`©COMPANY` à gauche | `Our Company / March 28th, 2045` au centre |
`Business Proposal / Presentation` puis `2045` à droite. 8 px, gris, filet fin dessous.

**Éléments signature**
- **Astérisque ✳ jaune** à 6 branches, marqueur de marque : posé seul dans un carré noir
  radius 12, ou à côté d'un titre, ou en fin de phrase. Jamais plus d'un par slide.
- **Cartes numérotées 01→04** : 4 cartes verticales radius 20, hauteur égale, chiffre en
  haut ≈ 56 px, label dessous 12 px. Une seule est jaune, une seule est noire, les autres
  blanches — le jaune marque l'étape courante.
- **Images « blob 3D »** noir et blanc (sphères, rubans, formes liquides) en carré radius 12.
- **Cartes de liste** : petites cartes jaunes ou noires radius 14, `(01)` label 10 px en
  haut, paragraphe 12 px.
- Bandeau noir pleine largeur radius 16 contenant image de texture + texte blanc + badge jaune.

**Patterns à extraire**
- `header-tripartite` — le header 3 zones (réutilisable hors de cette charte).
- `mark-asterisk` — le marqueur de marque et sa règle d'emploi (1 par slide).
- `cards-numbered-steps` — la rangée 01→04 avec une carte accentuée.
- `title-hyphen-break` — la césure volontaire dans un titre display.
- `accent-single-fluo` — règle : neutre + **un** accent fluo, ratio surface ≤ 12 %.

---

## ref-06-orange-notched

**Nature** — Planche de 8 slides d'un pitch deck corporate orange sur fond `#F0EFEC`.

**Palette**
- fond `#F0EFEC`, blanc `#FFFFFF`, noir `#141414`
- orange `#F2551E`
- gris-bleu (carte secondaire) `#C6D0CF`

**Typo** — Grotesk bold **capitales** pour les titres ≈ 46 px, `letter-spacing: 0`,
corps 11 px / 1.5, gris. Chiffres statistiques ≈ 40 px blanc sur orange.

**Éléments signature**
- **Coin chanfreiné (notch)** : les cartes orange et gris-bleu ont **un** coin coupé à 45°
  (≈ 22 px), via `clip-path: polygon(...)`. C'est LA signature de la charte.
- **Barre de titre collée** : un filet vertical 4 px orange collé sans espace devant le
  premier caractère du titre (`|PRESENTATION CONTENT INDEX`, `|EMPOWERING GROWTH`).
- **Index à filets** : liste `INTRODUCTION … 01`, libellé à gauche, numéro à droite, filet
  horizontal 1 px `#00000015` sous chaque ligne.
- **Bloc statistique** : carte orange chanfreinée, gros chiffre (`245+`, `156%`), micro-libellé
  au-dessus en 8 px capitales, flèche `↗` blanche en coin.
- Photos N&B d'architecture / d'ondulations, pleine largeur en haut de slide, radius 0.
- Glyphe `»` orange comme puce.

**Patterns à extraire**
- `shape-notched-card` — la carte à coin chanfreiné (4 orientations, taille du chanfrein
  paramétrable).
- `title-leading-rule` — le filet vertical collé au titre.
- `list-index-rules` — l'index libellé/numéro à filets.
- `stat-block-accent` — le bloc statistique sur aplat d'accent.

---

## ref-07-retro-brand-hero

**Nature** — Maquette de page d'accueil « RAD HABITS », carte flottant sur une photo de
plage (ciel + sable). Page ≈ 1440 de large, carte ≈ 78 % de la largeur.

**Palette**
- carte `#FBF7EC` (crème), rouge de marque `#B2201C`
- texte de nav `#1E1B18`
- l'arrière-plan est une **photo**, jamais un aplat

**Typo**
- Wordmark hero : display **rounded ultra-bold** (Obviously Wide, Cooper Black sans-serif,
  Recoleta Black — à défaut : `Archivo Black` + `font-stretch: expanded`), ≈ 148 px,
  `line-height: 0.82`, capitales, rouge, aligné **bas-gauche**, sur 2 lignes.
- Logo de nav : même famille, ≈ 22 px, centré, avec une baseline italique minuscule dessous
  (`life's a habit, baby!`, 9 px, italique).
- Nav : 13 px, poids 500, casse mixte.

**Layout** — Carte `border-radius: 6px`, ombre `0 24px 60px rgba(0,0,0,.18)`.
Nav en 3 zones (liens gauche / logo centre / bouton droite), bouton rouge plein radius 4,
texte crème 12 px. Corps : wordmark en bas-gauche ; **triptyque d'images portrait** (ratio
3:4, radius 8, gap 12) aligné **en haut à droite**, largeur totale ≈ 42 % de la carte.

**Patterns à extraire**
- `hero-card-on-photo` — la carte flottante sur photo (avec l'ombre et les proportions).
- `nav-three-zone` — nav liens / logo centré / bouton.
- `hero-wordmark-bottom-left` — wordmark géant bas-gauche + triptyque haut-droite.
- `image-triptych` — 3 images de ratio identique, gap constant, radius léger.

---

## ref-08-swiss-studio-hero

**Nature** — Maquette de page d'accueil « Studioform® », carte blanche flottant sur une
photo d'intérieur (fenêtre, lumière chaude). **Jumelle structurelle de ref-07** : même
squelette (carte flottante + wordmark + triptyque), tempérament opposé.

**Palette** — carte `#FFFFFF`, texte `#111111`, pas d'accent coloré.

**Typo**
- Statement d'intro : 15 px / poids 400 / `line-height: 1.45`, 2 lignes, ≈ 64 caractères,
  calé **en haut à gauche** — c'est lui qui parle en premier, avant le nom.
- Nav : `Work Index About Contact` en ligne, 13 px, calé en haut à droite.
- Wordmark : `Studioform®` en Helvetica/Inter **Bold** ≈ 112 px, `letter-spacing: -0.035em`,
  casse mixte, noir, aligné gauche. Le `®` en exposant ≈ 0.35 em.

**Layout** — Carte radius 4, ombre douce. Trois images **paysage** (ratio 4:3, radius 10,
gap 14) en bas, pleine largeur de la carte, hauteur ≈ 38 % de la carte.

**Différences à conserver vs ref-07** (c'est ce qui rend le pattern paramétrable) :
| axe | ref-07 | ref-08 |
|---|---|---|
| ordre de lecture | nom d'abord | phrase d'abord |
| images | portrait, haut-droite, 42 % | paysage, bas, 100 % |
| accent | rouge saturé | aucun |
| typo | display rounded | grotesk neutre |
| radius carte | 6 | 4 |

**Patterns à extraire**
- `hero-statement-first` — la variante « phrase avant le nom ».
- `type-registered-superscript` — le `®` en exposant calibré.
- réutilise `hero-card-on-photo` et `image-triptych` (paramétrés autrement).

---

## ref-09-zine-annotated-blue

**Nature** — Planche de 12 slides d'un « project proposal », slides blanches sur fond de
planche `#D4D4D4`.

**Palette** — blanc `#FFFFFF`, bleu `#2F3FE0`, texte noir `#111`, gris `#8A8A8A`.

**Typo** — Sans-serif **tout en minuscules**, y compris les titres (`project proposal`,
`about us`, `our team`). Titres ≈ 40 px bleu. Corps ≈ 10 px, **justifié**
(`text-align: justify; hyphens: auto`) en colonnes étroites (≈ 34 caractères), gris foncé,
`line-height: 1.45`. Micro-typo **tournée à 90°** sur le bord droit de la slide.

**L'élément signature — les annotations manuscrites** (c'est le pattern qui compte) :
tracés SVG bleus posés **par-dessus** la typo, comme au marqueur.
- ovale d'encerclement autour d'un titre (ellipse ouverte, le trait dépasse et se recroise)
- flèche courbe avec pointe ouverte (2 traits), reliant un mot à une image
- soulignement simple ou double, légèrement ondulé, plus long que le mot
- gribouillis vertical (zigzag serré) le long d'un titre en colonne
Caractéristiques du trait : `stroke-width: 3.5`, `stroke-linecap: round`,
`stroke-linejoin: round`, `fill: none`, **irrégularité obligatoire** (les points de contrôle
Bézier doivent être décalés de ±3 % sinon ça redevient une forme géométrique et l'effet
tombe). Rotation légère de l'ensemble (−2° à +3°).

**Layout** — Très libre : images N&B de tailles inégales, texte en 1 à 3 colonnes étroites,
grands blancs. Le déséquilibre est intentionnel.

**Patterns à extraire**
- `annotation-marker` — la bibliothèque de tracés (ellipse, flèche, soulignement,
  zigzag) + la règle d'irrégularité. **Priorité haute** : c'est le plus fort
  différenciateur anti-« AI slop » du corpus.
- `type-lowercase-editorial` — titres en minuscules + corps justifié étroit.
- `type-vertical-rail` — la micro-typo tournée sur le bord.

---

## ref-10-campaign-board-red

**Nature** — Planche de 3 slides d'un deck de campagne (« social media / deliverables »),
sur fond de planche taupe `#8A8078`. Slides crème.

**Palette** — slide `#EDEAE3`, rouge `#E33A22`, blanc `#FFFFFF`.
Les photos sont en **couleur** mais castées : elles contiennent toutes du rouge ou du brun,
ce qui fait tenir l'ensemble.

**Typo** — Grotesk **condensée Black** en capitales (Anton, Archivo Condensed Black,
Oswald Bold), `line-height: 0.84`, `letter-spacing: -0.01em`. Titres ≈ 58 px sur 2 lignes
(`SOCIAL` / `MEDIA`). Corps en **capitales rouges 9 px**, `line-height: 1.55`, colonnes
de ≈ 30 caractères, très dense. Numéro de section `(3)` ≈ 64 px, **parenthèses comprises**,
rouge.

**Layout**
- Slide 1 : 2 colonnes d'images (60/38), titre en overlay haut-gauche sur l'image de gauche,
  petite image incrustée en overlay au centre de l'image de droite, micro-caps en bas-droite,
  `(3)` en bas-gauche.
- Slide 2 : image à gauche (55 %) avec incrustation carrée rouge, colonne de texte à droite
  (3 blocs de micro-caps séparés par un blanc), `(3)` en bas-gauche.
- Slide 3 : titre géant `DELIVERABLES` en haut-gauche, **tableau à filets rouges** en
  dessous (2 lignes : `CONTENT:` / valeur, `FORMATS:` / valeur ; filet 1 px rouge au-dessus
  de chaque ligne ; label en colonne étroite gauche, valeur en colonne large droite),
  image à droite, `(4)` en bas-gauche.

**Patterns à extraire**
- `type-condensed-stack` — le titre condensé écrasé sur 2 lignes.
- `mark-paren-number` — le `(3)` de section.
- `table-hairline-rules` — le tableau label/valeur à filets fins.
- `layout-image-collage-overlay` — images en colonnes + incrustation en overlay.
- `type-micro-caps-block` — le bloc de texte en capitales 9 px, colonne étroite.

---

## Vue d'ensemble — ce que le corpus couvre

| famille | références qui l'alimentent |
|---|---|
| bento / cartes imbriquées | 01, 03 |
| suisse éditorial / titre-monstre | 04, 06, 08 |
| accent unique fluo ou saturé | 05, 06, 10 |
| hero web sur photo | 07, 08 |
| data-viz de deck | 03 |
| annotation manuscrite | 09 |
| formes non rectangulaires | 01 (teardrop), 06 (notch) |
| typographie expressive | 02 (mixte), 05 (césure), 09 (minuscules), 10 (condensée) |

**Trous du corpus** (à noter, pour ne pas croire la bibliothèque exhaustive) : aucune
référence sombre à accent chaud, aucune typo serif de titre, aucun tableau dense de données,
aucun graphique en ligne/aire, aucun état mobile.

---

# Ajouts hors corpus initial

> Les références `ref-11` et au-delà n'appartiennent pas à l'audit des 10 ci-dessus : elles
> sont arrivées après, une par une, au fil des besoins. Même règle qu'au-dessus — **l'image
> d'origine n'est pas sur le disque**, cette section la remplace.

## ref-12-neon-capsule-tags

**Nature** — Fragment de visuel (capture partielle, bord droit coupé) : une **pile
d'étiquettes-capsules** en contour néon sur fond vert forêt très sombre. Aucun autre élément
visible — ni titre, ni image, ni aplat. Six capsules, alignées sur leur bord **droit**, qui
déborde du cadre pour les deux premières.

**Palette**
- fond vert forêt sombre ≈ `#26331F`
- néon vert ≈ `#4FE383` — **la seule couleur** : trait et texte, jamais un fond
- contraste mesuré 8,9:1

**Typo** — Grotesk neutre, **capitales**, graisse moyenne (≈ 500), `letter-spacing` ≈ 0.
Corps ≈ 0,62 × l'unité de capsule, soit ~35 px pour une capsule de 70 px de haut. Le mot
remplit la pilule : il n'y a pas de « petit texte dans une grande forme ».

**Élément signature — la capsule soudée**
Un cercle porte-glyphe et une pilule de texte forment **un seul contour continu**, raccordés
par deux **congés concaves** (le « cou »). Ce n'est ni un chevauchement, ni deux formes
posées côte à côte : les arcs sont tangents, le trait ne s'interrompt jamais. Géométrie
relevée, en unités `u` (= hauteur de la pilule sans son trait) :

| grandeur | valeur |
|---|---|
| rayon du cercle (axe du trait) | `0,60 u` |
| rayon des calottes de la pilule | `0,50 u` |
| rayon des congés concaves | `0,28 u` |
| entraxe cercle ↔ calotte gauche | `1,20 u` |
| épaisseur du trait | `0,055 u` |
| hauteur de rangée (Ø extérieur du cercle) | `1,255 u` |
| glyphe | `0,62 u`, centré à `(0,6275 u ; 0,6275 u)` |

Les points de tangence en découlent : `x = 0,4563 u` sur le cercle, `x = 0,8597 u` sur la
calotte, centres des congés à `(0,6692 u ; ±0,5715 u)`. **Ces six nombres sont solidaires** —
changer le rayon du cercle sans recalculer les congés rouvre le contour.

**Glyphes** — quatre pictogrammes de contour dans les cercles : éclair (×3), croix
directionnelle à quatre flèches, rayons en couronne (12 traits), cadre à quatre équerres avec
une croix. Ils marquent une catégorie ; ils n'expliquent rien et sont **redessinés**.

**Composition** — pile alignée à droite, écart vertical serré (≈ `0,1 u`), largeur de chaque
capsule pilotée par son mot. Le bord droit sort du cadre : la liste montrée est un extrait.

**Patterns extraits**
- `tag-capsule-gooey` — la capsule soudée (tête fixe + corps élastique + calotte).
- `stack-keyword-flush-right` — la règle de composition de la pile.

**Ce que cette référence apporte au corpus** — le premier **fond sombre** de la bibliothèque,
et la première forme dont la signature est une **soudure** et non une coupe (`ref-06`) ou un
rayon (`ref-03`).

---

## ref-13-glass-fintech-dashboard

**Nature** — Écran de dashboard fintech, fourni **photographié en perspective** : la maquette
est inclinée d'environ −10° et fuyante vers la gauche, et le cadre est **portrait** (≈ 2:3),
donc plus étroit que l'écran qu'il montre. Deux cartes flottantes traînent sur le bord gauche,
coupées par le cadre (une liste de transactions blanche opaque : `-$50`, `-$100`, `$120`,
`-$100`, `-$75`, `-$250` ; et un fragment de carte « …acts / …end » = *Contacts / Send*).

**Ce qu'il faut isoler** — **DEUX couches, et pas une de plus** : le fond en dégradé flou qui
accueille, et les quatre modules rectangulaires en verre plus clair posés dessus. Remis à plat,
et au **format PPT (1600 × 900)** comme tout deck du dépôt. Les deux cartes de gauche
n'appartiennent pas à l'écran : elles flottent *au-dessus*, amputées, et n'ont ni composition ni
contenu complet exploitables — notées ici pour mémoire, elles ne sont **pas** reconstruites. La
perspective est un accident de prise de vue : aucun ratio ne se relève sur l'image inclinée,
tous ceux qui suivent sont exprimés en fraction de la largeur de slide (`Ws`).

**Palette** (relevés `≈`, la photo est floue et légèrement désaturée sur les bords)

| rôle | valeur |
|---|---|
| fond, haut-gauche (lavande bleutée) | `#A8B4D9` |
| fond, cœur saturé | `#9FAFD8` |
| fond, bas-droite (gris-bleu clair) | `#C8CEDA` |
| planche (blanc à ≈ 30 % sur flou d'arrière-plan) | perçue `#D9DEEA` |
| carte (blanc à ≈ 45 %) | perçue `#E6E9F1` |
| bleu d'accent | `#4F7CF7` |
| violet de l'orbe centrale | `#8B5CF6` → `#5B7CF0` |
| encre | `#1A1F2E` |
| encre atténuée | `#6B7186` |
| aplat noir des boutons | `#101625` |

Aucune bordure dessinée : les surfaces se séparent par un **liseré de lumière** (blanc à
≈ 45 % en haut/gauche, transparent en bas) — c'est lui, et non un trait, qui découpe le verre.

**Typo** — grotesk neutre (Inter / Helvetica Neue), graisses 400/500/600/700, `letter-spacing`
négatif sur les chiffres seulement (≈ `-0.02em`). Échelle, en **fraction de la largeur de
slide** (`Ws` = 1600) — cf. le piège des px de `fonts/FONTS.md` :

| rang | ratio | ce que ça porte |
|---|---|---|
| chiffre héros | `0.0275 Ws` | `$73,558.00` — le `$` est à `0.55 ×` du nombre, et **bleu** |
| chiffre de module | `0.020 Ws` | `85%` |
| chiffre d'orbe | `0.0125 Ws` | `$23,558` |
| titre de module | `0.0094 Ws` | `Expense statistic` |
| corps | `0.0081 Ws` | montants de liste, libellés de lignes |
| micro | `0.0069 Ws` | `Visa`, `MAY`, dates |

**Géométrie de l'écran** — 4 modules, 3 rangées sur une slide 16:9. Gouttière unique
`g = 0.0138 Ws`, marge de fond `= 2 g` (le fond respire deux fois plus que les modules ne
s'écartent — c'est ce liseré de dégradé qui les fait lire comme des objets posés). Rangées, en
fraction de la hauteur utile hors gouttières : solde `0.36`, duo `0.31`, échéances `0.33`. Le duo
se partage `47 / 53` — le module de santé est le plus large **parce qu'il est le seul coloré** :
il doit tenir le poids visuel du bleu plein.

Rayons décroissants avec l'imbrication, comme `ref-11` mais en verre : module `0.0175 Ws`,
sous-bloc `0.0113 Ws`, pilule `999px`, orbe `50 %`.

**Module 1 — solde et chaîne d'orbes** (pleine largeur)
- coin haut-droit : bascule de devise, `EUR` en encre atténuée nue + `USD` dans une pilule
  blanche pleine. L'état actif est **la pilule**, pas la couleur du texte.
- coin haut-gauche : micro-libellé `Total balance`, puis le chiffre héros.
- centre : **trois orbes tangentes en chaîne**, l'orbe centrale plus grosse (`1.24 ×` les
  latérales) et seule colorée (dégradé violet→bleu, halo diffus qui bave sur ses voisines).
  Diamètre latéral ≈ `0.10 Wp`. Chevauchement ≈ `0.06 ×` le diamètre : elles se **touchent**,
  elles ne se recouvrent pas. Chaque orbe porte un montant et, dessous, le nom du support.
  La somme des trois FAIT le chiffre héros — c'est la seule raison d'être de la chaîne.
- bord droit : deux actions empilées, `Receive Money` en verre et `Send Money` en aplat noir.
  Une seule action pleine : c'est elle, la primaire.

**Module 2 — statistique de dépense** (47 % de la rangée)
- en-tête : titre à gauche, pilule blanche `Monthly` à droite (sélecteur de période).
- 5 colonnes `MAY…SEP`, sommets ET pieds arrondis (`r = 0.42 ×` la largeur de colonne),
  colonnes en verre pâle sauf **une seule** en dégradé bleu (`JUL`), la colonne courante.
- la colonne d'accent porte une **info-bulle noire** `$45k` posée en haut-droite, avec un
  point de repère noir sur le sommet de la colonne. Hauteurs relevées (fraction de la plus
  haute) : `0.55 / 0.45 / 1 / 0.62 / 0.52`.

**Module 3 — santé financière** (53 % de la rangée) — la **seule carte opaque et colorée** de
la planche : dégradé bleu (haut-gauche `#4F7CF7` → bas-droite `#8FB6FA`).
- coin haut-droit : bouton rond translucide, glyphe de rafraîchissement.
- pile haut-gauche : libellé, `85%`, `since last month`.
- une **courbe blanche** traverse toute la carte, lissée, avec un point à chaque extrémité
  annotée : `7.26k` (bas-gauche, départ) et `16.75k` (haut-droite, arrivée). La courbe
  **repart en descendant** après le second point, en blanc atténué : ce qui est mesuré s'arrête
  au point, la suite est du décor et se lit comme tel.

**Module 4 — échéances** (pleine largeur)
- en-tête : titre à gauche, pilule noire `View All` à droite.
- 3 lignes, chacune en **quatre zones** : identité (pastille de logo + nom + date en dessous),
  échéance (pilule bleue `Today` pour l'imminente, sinon la date en encre atténuée), libellé
  d'offre, montant aligné à droite.
- **une seule ligne est surlignée** (fond blanc plus dense, rayon de carte) : le survol.

**Ce que cette référence apporte au corpus** — le premier **système en verre dépoli** :
aucune surface n'est opaque sauf l'accent, la hiérarchie ne se joue ni sur la couleur ni sur un
trait mais sur **le taux de blanc et le flou d'arrière-plan**. Et le premier fond en **dégradé**
(le corpus n'avait que des aplats).

**Le piège du lot, payé une fois** — la première reconstitution avait *trois* couches (fond,
planche intermédiaire, modules) et deux halos flous ajoutés « pour donner de la matière au
verre ». Résultat : le fond n'était jamais vu à nu, l'écart de blanc entre les couches se
divisait, et la profondeur s'écrasait. Rien ne le signalait — aucun alignement ne casse. Le
benchmark « DEUX couches et pas trois » de `layout-03-glass-board` existe pour ça.

**Patterns extraits**
- `layout-03-glass-board` — les deux couches (fond dégradé + modules) et leur écart de blanc.
- `card-08-orb-chain-balance` — le solde et sa chaîne d'orbes tangentes.
- `card-09-gradient-metric-curve` — le KPI sur aplat coloré avec sa courbe annotée aux deux bouts.
- `chart-03-accent-column-callout` — l'histogramme à colonne unique accentuée et info-bulle.
- `list-04-due-rows` — la liste d'échéances à quatre zones, une ligne surlignée.

## ref-15-lilac-notched-kpi

**Nature** — Bande de preuves chiffrées d'une landing SaaS (« pourquoi nous »), fournie en
**crop horizontal** (≈ 813 × 297) : on ne voit ni le titre de la section (coupé en haut) ni le
reste de la page. Trois vignettes de même rang alignées, la troisième — et elle seule — sur
aplat coloré. C'est la seule référence du corpus dont la source n'est pas une slide entière :
elle est remise à plat en **une slide 1600 × 900** portant la bande centrée, ce qui est la
lecture honnête de ce qui est visible, et rien de plus.

**Ce qu'il faut isoler** — la vignette, et le contraste de rangée qui lui donne son sens : deux
vignettes neutres, une accentuée. Le geste de forme est un **double chanfrein sur la
diagonale** (haut-droit + bas-gauche), les deux autres coins restant arrondis — une silhouette
de ticket, distincte du chanfrein UNIQUE de `ref-06` qui, lui, est une signature d'aplat.

**Palette** (relevés `≈`, l'image est un JPEG compressé)

| rôle | valeur |
|---|---|
| fond de section (lavande blanchie) | `#F4F4FB` |
| vignette neutre (blanc à peine teinté) | `#FCFBFF` |
| accent, départ du dégradé (haut-gauche) | `#6B3FE4` |
| accent, arrivée du dégradé (bas-droite) | `#9A7BF0` |
| chiffre sur vignette neutre | `#4C1FD6` |
| encre du libellé | `#2E2166` |
| encre de la note | relevé `≈ #9B96C4`, **posé à `#6E67A0`** |
| tuile d'icône, neutre | `#EBE7FB` |
| tuile d'icône, sur accent | blanc à ≈ 22 % |

La note relevée à `#9B96C4` sur blanc plafonne à **2,79:1** — sous le seuil de 4,5 exigé d'un
corps de ce rang. Elle est posée un ton plus sombre (`#6E67A0`, **5,18:1**), écart invisible à
l'œil. Même arbitrage que `ref-06` sur son encre grise : on ne recopie pas une faute de
contraste au nom de la fidélité.

**Typo** — grotesk géométrique à `g` simple (Poppins / Montserrat), graisses 500/700/800.
Échelle exprimée en **fraction de la largeur de vignette** (`Wc`), pas en px :

| rang | ratio | ce que ça porte |
|---|---|---|
| chiffre | `0.26 Wc` | `99` |
| suffixe | `0.42 ×` le chiffre | `%`, calé sur la même ligne de base |
| libellé | `0.082 Wc` | `Data Accuracy` |
| note | `0.047 Wc` | le commentaire de deux lignes, en bas à droite |

**Géométrie de la vignette** — ratio `Wc / Hc ≈ 0.93` (presque carrée, un rien plus haute).
Gouttière de rangée `= 0.102 Wc`. Chanfrein `= 0.11 Wc` sur les coins **haut-droit et
bas-gauche** ; rayon `= 0.04 Wc` sur les deux autres. Marge intérieure `= 0.09 Wc`.
Tuile d'icône carrée `= 0.188 Wc`, rayon `0.048 Wc`, glyphe en trait de `0.005 Wc`.

**Quatre zones dans un ordre fixe**, du haut vers le bas :
1. la tuile d'icône, seule sur sa ligne, calée en haut-gauche ;
2. le chiffre et son suffixe, sur la même ligne de base — le suffixe ne descend jamais à la
   ligne, sinon le chiffre perd son unité ;
3. le libellé, collé sous le chiffre (interligne serré : c'est UN bloc, pas deux) ;
4. la note, **collée en bas ET alignée à droite** — c'est le seul élément de la vignette qui
   n'est pas au fer à gauche, et c'est ce décalage qui la fait lire comme un aparté.

Le vide entre le libellé et la note (≈ 12 % de la hauteur) est assumé, comme dans
`card-03-stat-accent` : il sépare la donnée de son commentaire.

**Ce que cette référence apporte au corpus** — le **contraste de rangée** : trois vignettes de
même composition dont une seule change de fond, ce qui hiérarchise sans changer une taille ni
un mot. Et une deuxième grammaire de chanfrein (deux coins sur la diagonale, avec rayon sur les
autres), là où `ref-06` n'en connaissait qu'une (un coin, aucun rayon).

**Le piège du lot** — le dégradé rend la mesure de contraste optimiste : `bin/check.mjs` lit
`background-color`, jamais `background-image`. La couleur de repli déclarée est donc l'extrémité
**CLAIRE** du dégradé (`#9A7BF0`), pas la sombre : c'est le point le plus défavorable de la
carte, et c'est celui-là que le benchmark doit garder. Poser le repli à la couleur de départ
aurait mesuré 6,03:1 là où le coin bas-droite ne vaut que 3,20:1.

**Patterns extraits**
- `card-10-kpi-notch-tile` — la vignette elle-même, ses quatre zones et son double chanfrein.

---

## ref-14-layer-stack-coral

**Nature** — Visuel unique (planche de marque, ≈ 16:9), pas un deck : une **pile de plans
isométriques** à gauche, une colonne de trois libellés à droite, chacun relié à la pile par un
filet horizontal. Aucun cadre, aucune carte, aucune ombre — le fond est nu.

**Intention** — Dire qu'un objet se décompose en **couches empilées et ordonnées**, où le rang
compte : la couche du dessus est celle qu'on voit / qu'on touche, les suivantes la portent. La
sémantique n'est pas dans la couleur (une seule teinte) mais dans **l'opacité décroissante** —
plus on descend, plus la couche s'efface, exactement comme une fondation dont on ne parle pas.

**Palette** — une seule teinte, déclinée par transparence sur le fond.
- fond `#F1EFEC` (blanc cassé chaud)
- corail `#E4886A` — la SEULE couleur du visuel
- couche 1 (dessus) : corail à `1.00` → rendu `#E4886A`
- couche 2 : corail à `≈ 0.44` → rendu observé `≈ #F0BCA9`
- couche 3 : corail à `≈ 0.18` → rendu observé `≈ #F9DDD3`
- encre de titre `#3A3835`, corps `#6E6863`, filet `#97918C`

Le rapport d'une opacité à la suivante est **constant** (`≈ 0.42 ×`) : c'est une progression
géométrique, pas une soustraction régulière. C'est ce qui fait que la troisième couche est
presque un fantôme sans que la deuxième paraisse déjà pâle. Le recouvrement de deux couches
translucides **s'additionne** naturellement (`α₂ + α₃(1−α₂)`) : la zone commune est plus dense
que chacune — c'est le seul dégradé du visuel, et il est calculé par le compositeur, pas dessiné.

**Géométrie** (relevés sur l'image d'origine ≈ 888 × 494, convertis pour une slide 1600 × 900,
facteur `1.80` — les valeurs marquées `≈` sont estimées à l'œil)

| grandeur | valeur 1600 × 900 | en ratio |
|---|---|---|
| largeur d'un plan `Wp` | `508` | `0.318 Ws` |
| hauteur d'un plan `Hp` | `270` | `0.531 Wp` |
| pas vertical entre deux plans | `≈ 154` | `≈ 0.57 Hp` |
| hauteur totale de la pile (3 plans) | `≈ 578` | `Hp × (1 + 2 × 0.57)` |
| bord gauche de la pile | `177` | `0.111 Ws` |
| début des filets (x commun) | `510` | `0.319 Ws` |
| fin des filets = début des libellés | `766 / 805` | `0.479 / 0.503 Ws` |
| largeur de la colonne de libellés | `≈ 649` | `0.406 Ws` |

Un plan est un **losange** — un carré vu en projection isométrique, donc deux fois plus large
que haut à un cheveu près (`Hp/Wp = 0.53`, l'isométrie pure donnant `0.577`). Le pas à `0.57 Hp`
est le chiffre qui porte tout le visuel : au-dessus de `0.5 Hp`, le **centre** d'une couche
échappe au plan qui la surplombe — c'est ce qui laisse le filet en sortir. En dessous, les plans
se noient les uns dans les autres et la pile devient une tache.

**Les filets** partent tous du **même x**, situé au centre horizontal de la pile, et sont tracés
**sous** les plans : ils n'apparaissent qu'en sortant du losange, si bien que leur longueur
visible est dictée par la forme et non par une valeur posée à la main.

**La colonne de libellés** — trois blocs `titre + corps`, coulant les uns sous les autres avec un
écart constant (`≈ 0.046 Ws`), pas sur un pas fixe : le bloc du milieu a deux lignes de corps, le
premier une seule, et le visuel l'assume. La conséquence est que **les filets dérivent** par
rapport aux plans (le premier passe au-dessus du centre de son plan, le dernier en dessous) :
c'est l'ORDRE qui porte la correspondance, pas l'alignement. Colonne et pile occupent la même
bande verticale, centres à `≈ 3 %` près.

**Typo** — un grotesk clair, tout en capitales, sur deux niveaux seulement.
- titre : `≈ 34 px` (1600), graisse `300`, `letter-spacing: 0.13em`, encre `#3A3835`
- corps : `≈ 21 px`, graisse `400`, `letter-spacing: 0.05em`, `line-height: 1.75`, `#6E6863`
Aucun chiffre, aucune puce, aucune icône : le titre EST le repère de rang.

**Ce que cette référence apporte au corpus** — le premier **schéma** (au sens propre : une figure
qui explique une structure, pas une donnée) et la première fois que la **profondeur** est encodée
sans ombre, sans perspective et sans seconde couleur — seulement par l'opacité et par l'ordre
d'empilement. C'est aussi le premier visuel du corpus dont le sujet est un objet abstrait
(une marque, un produit, un logiciel) plutôt qu'un contenu.

**Patterns extraits**
- `diagram-layer-stack` — la pile de plans isométriques, ses filets de rappel et sa colonne de
  libellés. Le pattern **verrouille le filet sur le centre de SA couche**, là où la référence le
  laisse dériver : dans un schéma technique (front / service / données), « c'est le troisième
  donc c'est celui du bas » n'est pas une correspondance, c'est un pari.

---

## ref-16-cobalt-graph-paper

**Nature** — **Pas un reverse d'image tierce.** Composition maison, née d'une esquisse de deck
validée par Léo le 31/07/2026. La palette et le principe de trame permanente dérivent du modèle
`cobalt-grid` du pack `zarazhangrui/frontend-slides` (MIT) ; la composition en *cases de la
trame*, les trois états de case et la barre à unité déclarée sont ajoutés ici et n'existent pas
dans la source. Aucune image n'est donc à ingérer : cette section EST la source.

**Ce qu'il faut isoler** — **DEUX couches, jamais trois** : le papier (qui porte la trame) et
les modules posés dessus. Un panneau de groupement intermédiaire est explicitement écarté — il
n'encadrerait que les deux modules et serait une couche 1:1 redondante. Écarté aussi : toute
marge de page contrastée sous la slide.

**Palette**

| rôle | valeur | note |
|---|---|---|
| papier | `#F0EBDE` | crème chaud, jamais blanc |
| case neutralisée | `#E6E0CE` | le papier assombri de ~4 % — non ouvré, jour mort |
| encre d'accent | `#1F2BE0` | 6,9:1 sur le papier — titre, filet, chiffre, case pleine |
| liseré de case vide | `rgba(31,43,224,0.20)` | aplat, jamais du texte |
| trame | `rgba(31,43,224,0.10)` | **tenue entre 6 et 14 %** — au-delà elle traverse le texte |
| encre de lecture | `#14163A` | 14,6:1 — le même bleu poussé au noir, pour les paragraphes |

**Typo** — Newsreader (serif éditorial, titres et chiffres), Hanken Grotesk (corps), DM Mono
(chrome, libellés, unités). Échelle en fraction de la largeur de slide (`Ws` = 1600) :

| rang | ratio | ce que ça porte |
|---|---|---|
| titre de couverture | `0.0769 Ws` | 123 px |
| titre assertif | `0.0356 Ws` | 57 px |
| chiffre au-dessus d'une barre | `0.0294 Ws` | 47 px |
| corps | `0.0156 Ws` | 25 px |
| mono de chrome | `0.0138 Ws` | 22 px |

**Géométrie** — tout dérive d'une seule valeur, le **pas de trame** = `0.022 Ws` (35,2 px à
1600). Le pas d'une grille de cases vaut **2 pas de trame** ; la marge qui centre cette grille
en vaut **3**. C'est cette divisibilité, et elle seule, qui fait que les objets paraissent
découpés dans le papier au lieu d'y être posés — la retirer ne casse rien visiblement, elle
dissout simplement le système.

**Patterns extraits**
- `layout-04-graph-paper-cells` — la trame comme ton du papier, et les cases qui l'habitent ;
  trois états encodés par la FORME (pleine / à moitié / vide), la charte n'ayant pas de
  troisième couleur à dépenser.
- `chart-04-unit-textured-bar` — la barre dont la hauteur porte la valeur, la texture l'unité,
  et le texte le montant exact : trois rôles, trois porteurs, aucun qui fasse le travail d'un
  autre.


---

## ref-17-mono-bento-legal

**Nature** — Page d'accueil d'un cabinet juridique en ligne, fournie en **capture de
présentation 1200 × 900** : la page n'occupe pas l'image. Première fois du corpus où les images
sources sont **réellement sur le disque** (`assets/refs/ref-17…png`, gitignorées) : les valeurs
ci-dessous sont **pipettées et scannées**, pas estimées — les `≈` restants sont signalés comme
tels.

**Ce qui a été ÉCARTÉ au titre de la mise en scène** — une seule couche, et elle ne se
reconstruit pas :

- le **fond de planche gris `#C7C7C7`** qui entoure la page (66 px à gauche et à droite, 71 en
  haut, 57 en bas). C'est le carton de présentation du visuel, pas la page. Asymétrie verticale
  relevée : la page n'est même pas centrée dans son carton, ce qui suffit à prouver que le
  carton n'appartient pas à la maquette.

Une fois ce carton retiré il reste **trois couches et pas une de plus** : page blanche →
modules bento → objets posés dans un module (pilules de tags, badge du logo). C'est la
profondeur maximale documentée du corpus.

**Géométrie relevée** (scan de runs de couleur sur l'image source, en px de la source)

| objet | mesure source | ratio / largeur de page |
|---|---|---|
| page blanche | `x 66..1132`, `y 71..842` → **1067 × 772** | — |
| marge de page | 44 g. / 42 d. / 39 h. / 40 b. → **42 posés** | `0.039` |
| barre de menu | `x 110..1090`, `y 110..160` → **981 × 51** | h `0.048` |
| écart menu → bento | 27 px | `0.025` |
| gouttière du bento | 19 px | `0.0178` |
| colonnes du bento | **254 / 345 / 344** (somme 981 avec 2 gouttières) | `0.259 / 0.352 / 0.351` de la largeur utile |
| rangées du bento | **224 / 172 / 180** (total 614 avec 2 gouttières) | — |
| rayon de page | `≈ 28` | `0.026` |
| rayon d'un module | **18** (déduit de l'inset de 9 px à 2 px du bord) | `0.017` |
| rayon de la barre de menu | `≈ 15` | `0.014` |

**La grille est une vraie grille 3 × 3, et c'est ce qui n'était pas évident.** Les modules ne
partagent aucune ligne horizontale visible — quatre frontières différentes (`188`, `411/602`,
`432/620`, `802`) — au point qu'on la reconstruit spontanément en deux colonnes flex
indépendantes. C'est faux : en posant `r1 = 224`, `r2 = 172`, `r3 = 180` et la gouttière à 19,
les cinq modules retombent exactement sur les frontières relevées (`224+19+172 = 415` = hauteur
du module A, `172+19+180 = 371` = hauteur du hero). Le bento est **3 colonnes × 3 rangées** avec
deux enjambements en L :

```
┌─────────┬──────────┬──────────┐
│         │    B     │    C     │   r1  224
│    A    ├──────────┴──────────┤
│         │                     │   r2  172
├─────────┤        HERO         │
│    D    │                     │   r3  180
└─────────┴─────────────────────┘
   c1 254     c2 345    c3 344
```

`A` = colonne 1, rangées 1–2 · `D` = colonne 1, rangée 3 · `HERO` = colonnes 2–3, rangées 2–3.
Deux enjambements qui se croisent sans jamais se chevaucher : c'est la signature du système, et
elle disparaît dès qu'on modélise l'écran en deux colonnes.

**Palette** (quantification + pipette, image PNG non recompressée)

| rôle | valeur | part de surface |
|---|---|---|
| carton de présentation — **écarté** | `#C7C7C7` | 23,6 % |
| page | `#FEFEFE` | 22,7 % |
| module neutre / barre de menu | `#EDEDED` | 24,0 % |
| module hero | `#000000` | 22,3 % |
| pilule de tag (sur module neutre) | `#FFFFFF` | — |
| encre principale | `#111111` | — |
| encre secondaire (liens de menu, sous-titre) | relevé `≈ #6E6E6E`, **posé `#5F5F5F`** | — |

L'encre secondaire relevée à `#6E6E6E` sur le gris de module `#EDEDED` plafonne à **4,09:1** —
sous le seuil de 4,5 exigé d'un corps de ce rang. Elle est posée un ton plus sombre
(`#5F5F5F`, **4,83:1**), écart invisible à l'œil. Même arbitrage que `ref-06` et `ref-15` : on
ne recopie pas une faute de contraste au nom de la fidélité.

**Le système n'a AUCUNE couleur.** Trois valeurs de gris et du noir : la hiérarchie est portée
par la **surface** (un seul module noir sur cinq) et par le **rang de blanc** (page `#FEFEFE` >
pilule `#FFFFFF` > module `#EDEDED`, soit un blanc plus clair que la page pour les objets posés
DANS un module gris). Inverser ce rang — module blanc sur page grise — casse le système : les
pilules n'ont plus de blanc disponible au-dessus d'elles.

**Typo** — grotesk neutre à `g` simple, graisses 500/700 (rendue en **Inter**). Échelle relevée
sur la source puis exprimée en fraction de la largeur de page `Wp` :

| rang | ratio `Wp` | source (px) | ce que ça porte |
|---|---|---|---|
| claim du hero | `0.032` | `≈ 34` | « Упрощаем людям жизнь. » sur deux lignes |
| titre de module | `0.016` | `≈ 17` | titre de vignette, deux lignes max |
| wordmark | `0.021` | `≈ 22` | le nom dans la barre de menu |
| corps / lien de menu | `0.011` | `≈ 12` | liens, sous-titre de module |
| tag | `0.0075` | `≈ 8` | les douze pilules du nuage |

**Ce qu'il faut isoler** — quatre gestes, aucun décoratif :

1. **La barre de menu en pilule** : un aplat gris arrondi qui flotte DANS la marge de page, un
   badge circulaire blanc collé à gauche, les liens au centre-droit, et un seul bouton — lui
   aussi en pilule blanche, donc plus clair que la barre qui le porte.
2. **La grille bento à enjambements en L** décrite plus haut.
3. **La vignette à flèche de coin** : titre en haut à gauche, `↗` en haut à droite, illustration
   au ras du bas — jamais centrée, jamais encadrée.
4. **Le nuage de tags centré rangée par rangée** : les pilules se rangent en lignes de largeur
   inégale, chaque ligne centrée sur elle-même, l'ensemble collé au bas du module. C'est le
   centrage PAR RANGÉE (et pas du bloc) qui donne la silhouette de nuage.

Un cinquième geste est relevé mais **non extrait** : la revendication du hero porte un segment
de texte **surligné en inverse** (fond blanc, encre noire) sur une seule ligne du sous-titre.
C'est une variante de mise en avant de texte courant, trop mince pour un pattern à elle seule ;
elle est portée par le fragment du hero.

**Ce qui n'est PAS repris** — les illustrations au trait (spirale, planète, cubes isométriques,
escalier 3D) sont des visuels d'auteur : le deck les remplace par des compositions SVG
génératives de même cadrage et de même valeur de gris. Aucune URL distante.

---

## ref-18-lime-sales-dashboard

**Nature** — Tableau de bord d'analyse des ventes, fourni en capture de présentation
**1200 × 900** avec l'application enchâssée dans une maquette de tablette.

**Ce qui a été ÉCARTÉ** — **deux** couches de mise en scène, et c'est le point du lot :

- le **fond noir** de la planche (44 px à gauche/droite, 50 en haut/bas) ;
- le **bezel gris `#595959`** de la tablette (14–15 px tout autour, `x 45..59` et `1142..1154`).

Les deux encadrent la même chose. Appliquer la règle du skill — « quand deux couches encadrent
la même chose, il n'y en a qu'UNE, et c'est celle du dessus » — les fait tomber toutes les deux :
ce qui reste est l'application seule, `x 61..1138`, `y 67..833`, soit **1078 × 767**. Le bas de
l'écran est **coupé par le cadre** : le module « Transactions » n'est visible que sur 73 px. Il
est reconstruit à sa hauteur d'en-tête et rien de plus — inventer sa suite serait ajouter un
élément absent de la source.

**Géométrie relevée** (px de la source)

| objet | mesure source | ratio / largeur d'app |
|---|---|---|
| application | **1078 × 767** | — |
| rail d'icônes (gauche) | `x 61..131` → **71** | `0.066` |
| marge de contenu | `x 154..1116` → **963** utiles, 23 g. / 22 d. | `0.021` |
| en-tête (recherche + notifications) | `y 85..136` → h **52** | `0.048` |
| titre de page | `y 150..240` | — |
| rangée de KPI | `y 266..429` → h **164** | `0.152` |
| rangée de modules | `y 435..757` → h **323** | `0.30` |
| gouttière horizontale | 12–14 | `0.012` |
| gouttière verticale | ≈ 8 | `0.007` |
| rayon d'un module | `≈ 22` | `0.020` |
| rayon d'une tuile de heatmap | `≈ 20` | — |

**Colonnes des KPI** : `154..467` / `486..785` / `812..1116`, soit **314 / 300 / 305**. Le
premier — le seul noir — est **le plus large**, de 4 %. Ce n'est pas une erreur de mesure
reproductible à la légère : c'est le même geste que l'aplat noir, appliqué à la largeur. La
rangée se modélise `1.05fr 1fr 1fr`.

**Palette**

| rôle | valeur | part |
|---|---|---|
| fond noir de planche — **écarté** | `#000000` | (24,5 % avec le KPI) |
| bezel — **écarté** | `#595959` | 4,6 % |
| fond d'application | `#FEFEFE` | 25,2 % |
| module | `#F2F2F2` | 24,2 % |
| module « transactions » (crème) | `#FBF9EC` | — |
| aplat inversé (KPI, tuile forte) | `#000000` | — |
| **accent vert** | `#5FE85C` | **2,1 %** |
| rampe de heatmap | `#E3E3E3` → `#CCCCCC` → `#999999` → `#666666` → `#000000` | — |

**L'accent ne pèse que 2,1 % de la surface** et il ne sert qu'à DEUX choses : la barre courante
de l'histogramme (avec son libellé de jour, seul libellé coloré) et les cellules fortes de la
heatmap. Un vert de cette saturation posé sur plus de 5 % d'un écran cesse d'être un accent.

**La heatmap n'a pas de troisième dimension.** Elle encode une intensité sur **une rampe de
gris** dont le noir est le maximum, et le vert n'y est **pas** un cran de la rampe : c'est une
marque de catégorie posée par-dessus. Deux échelles cohabitent dans une même grille sans se
mélanger, parce que l'une est achromatique et l'autre non.

**Typo** — grotesk géométrique (rendue en **Montserrat**), graisses 400/500/700.

| rang | ratio / largeur d'app | source (px) | ce que ça porte |
|---|---|---|---|
| titre de page | `0.046` | `≈ 50` | « Your Sales Analysis », deux lignes |
| chiffre de KPI | `0.043` | `≈ 46` | `$16.4K` |
| titre de module | `0.019` | `≈ 20` | « Sales Funnel », « Orders » |
| libellé | `0.013` | `≈ 14` | libellés de ligne, jours |
| micro | `0.011` | `≈ 12` | sous-titres, notes de KPI |

**Ce qu'il faut isoler**

1. **La coque à rail d'icônes** : rail vertical étroit (6,6 % de la largeur), séparé du contenu
   par un filet et non par une couleur de fond, en-tête à barre de recherche en pilule, et
   ligne d'actions en pilules à droite du titre.
2. **La rangée de KPI dont un seul est inversé**, et qui est aussi le plus large.
3. **La heatmap en tuiles arrondies** avec libellés de lignes hors grille.

**Non extrait, et pourquoi** — l'histogramme (barres à grand rayon, une seule accentuée,
info-bulle sombre ancrée à la barre courante) est **trop proche de `chart-03-accent-column-callout`**
(ref-13), qui porte déjà « colonnes sans axe, une seule chiffrée par une info-bulle sombre ».
La différence tient au rayon des barres et à la couleur du libellé de l'axe : ce sont des
tokens, pas une composition. On enrichit `chart-03` d'une variante plutôt que d'ouvrir un
doublon — arbitrage écrit ici pour ne pas être rejoué.

---

## ref-19-acid-clinical-timeline

**Nature** — Dossier patient de cardiologie, ouvert **en feuille modale par-dessus un voile
sombre**. Capture de présentation **1200 × 900**.

**Ce qui a été ÉCARTÉ** — une seule couche : le **carton jaune acide `#F5FE49`** (57 px à
gauche/droite, 98 en haut, 101 en bas). Piège du lot : ce jaune est **aussi** la couleur
d'accent de l'interface (les pastilles de comptage, les zones de graphique). Le carton et
l'accent partagent le même hex — écarter le carton ne veut donc pas dire écarter la couleur.

**Le voile sombre, lui, RESTE.** Il ne se comporte pas comme un bezel : il porte les onglets et
le bouton de fermeture, c'est-à-dire de l'interface. Le tester correctement, c'est vérifier
qu'il porte du contenu — un bezel n'en porte jamais.

Trois couches donc : voile sombre → feuille claire → modules. Plus **l'onglet-poignée**, qui
n'est pas une quatrième couche mais une extension de la feuille (même valeur, même plan) —
séparée d'elle par une saignée de voile, et raccordée à sa droite par un **congé concave**.

**Géométrie relevée** (px de la source)

| objet | mesure source | ratio / largeur de voile |
|---|---|---|
| voile sombre | `x 57..1142`, `y 98..798` → **1086 × 701** | — |
| feuille claire | `x 72..1126` → **1055** de large | `0.971` |
| saignée voile / feuille | 15 px sur les côtés | `0.014` |
| bande d'onglets | `y 98..≈178` → h **80** | `0.074` |
| onglet-poignée (titre) | `x ≈122..387` | largeur `0.244` |
| bouton de fermeture ⌀ | `≈ 56`, à cheval sur le bord | `0.052` |
| ruban temporel | `y ≈ 726..782`, pleine largeur de feuille | h `0.052` |

**Palette**

| rôle | valeur | part |
|---|---|---|
| carton de présentation — **écarté** | `#F5FE49` | 13,7 % |
| feuille | `#DFDFD7` | 33,5 % |
| voile / ruban / fenêtre de sélection | `#4A4A48` → `#1B1D1D` | 2,4 % |
| module | `#F0EFEB` → `#FFFFFF` | 9,2 % |
| **accent acide** | `#F5FE49` (identique au carton) | — |
| encre | `#262C2C` | — |
| tracé « alerte » (ECG, tension) | `≈ #E8756B` |
| encre secondaire | relevé `≈ #7A7C79`, **posé `#5F615E`** |
| extrémité « amélioration » du rail | `≈ #7FA88C` | — |

L'encre secondaire relevée à `≈ #7A7C79` sur la feuille `#DFDFD7` plafonne à **4,21:1**. Elle est
posée à `#5F615E` (**4,61:1**), écart invisible à l'œil. Troisième lot de suite où la source
place son gris secondaire juste sous le seuil : le relevé se vérifie systématiquement avant
d'être recopié.

**La feuille est GRISE, pas blanche**, et c'est ce qui rend le système lisible : les modules
posés dessus sont blancs ou blanc-cassé, donc ils montent au lieu de disparaître. Sur une
feuille blanche, un module blanc doit s'entourer d'un liseré ou d'une ombre — deux ornements
que ce système n'a nulle part.

**Typo** — géométrique à `a` rond (rendue en **Montserrat**), graisses 400/500/600.

| rang | ratio / largeur de voile | source (px) | ce que ça porte |
|---|---|---|---|
| titre de feuille | `0.033` | `≈ 36` | « Cardiology » dans l'onglet-poignée |
| diagnostic | `0.026` | `≈ 28` | « Hypertension » |
| valeur de constante | `0.021` | `≈ 23` | `89 bpm`, `100/67` |
| libellé de module | `0.017` | `≈ 18` | « Blood Pressure » |
| micro-libellé | `0.010` | `≈ 11` | « Diagnosys », « Heart Rate » — au-dessus de la valeur |

**Ce qu'il faut isoler**

1. **La feuille modale à onglet-poignée** : voile qui porte des onglets, feuille claire, et la
   poignée titrée raccordée à la feuille par un congé **concave** — la seule courbe inversée du
   corpus, et ce qui distingue cette feuille d'une carte de plus.
2. **Le bandeau de constantes** : une rangée de couples micro-libellé / valeur, sans filet, sans
   carte, où l'unité est un cran plus petite et plus claire que le nombre qu'elle suit.
3. **La timeline à branches** : un rail horizontal daté, des jalons ronds accentués, et des
   dérivations en **équerre arrondie** qui descendent vers des cartes de niveau inférieur.
4. **Le ruban temporel à fenêtre de sélection** : l'axe complet en pilule claire, les événements
   en pastilles rondes sous leur mois, une pastille de comptage acide en exposant, et une
   **fenêtre sombre à poignées** posée sur l'intervalle affiché au-dessus. C'est le seul objet
   du corpus où un module donne la position de lecture d'un autre.

**Ce qui n'est PAS repris** — les photographies (portrait patient, silhouette anatomique) et les
tracés d'imagerie réels : le deck les remplace par des compositions SVG génératives de même
cadrage et de même valeur.
