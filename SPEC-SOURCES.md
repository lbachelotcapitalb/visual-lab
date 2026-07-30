# SPEC-SOURCES — audit des 10 références visuelles

> **Ce fichier remplace les images.** Les visuels d'origine ont été fournis collés dans une
> session Claude Code (29/07/2026) : ils ne sont **pas** sur le disque et ne survivront pas à
> une session nettoyée. Tout le reverse-engineering des lots suivants se fait à partir de
> cette spec, pas à partir des images. Si une valeur est une estimation à l'œil, elle est
> notée `≈`. Les mesures sont exprimées pour une slide **1600 × 900** (ou une page 1440 de
> large pour les deux références web), à convertir en `rem`/`%` dans le code.

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

**Nature** — Planche de 10 slides 16:9 d'un « Investor Pitch Deck » (marque `+travel`),
sur fond de planche `#D9D2C7`.

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
