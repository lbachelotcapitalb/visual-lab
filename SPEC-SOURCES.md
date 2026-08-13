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

**Piège de fidélité** — La photo est en perspective : ne PAS reproduire l'inclinaison ni
l'ombre. Reconstruire à plat. La perspective sera un pattern séparé (`fx-print-mockup`)
si Léo le demande un jour.

### Ce que le relevé ne disait pas, et qu'il fallait trancher avant de coder (12/08/2026)

**1. L'échelle. Le relevé donne des pixels sans donner la taille de la cellule** — sans elle,
`rayon 48`, `gap 18` et `corps 84` ne veulent rien dire, et aucun ratio n'est calculable. Elle
se DÉDUIT pourtant, de l'exigence que les primitives restent distinctes : le squircle est à
`0,30 × côté` et le teardrop à 48 px fixes. À côté = 180, les deux arrondis ne sont plus qu'à
11 % l'un de l'autre et les deux primitives se confondent — or la source les liste comme deux ;
à côté = 300, le teardrop tombe à 16 % et cesse de se lire comme « arrondi ». La cellule vaut
donc **220 ± 20**, et c'est cette fourchette, croisée avec la hauteur de slide, qui fige tout
le reste.

**2. `border-radius: 50%/50%` n'est PAS un stadium, c'est une ELLIPSE.** Les deux pourcentages
se résolvent sur des axes différents : sur une pilule de 483 × 232, `50%` donne 241,5 de rayon
horizontal contre 116 de vertical, soit un ovale complet — pas un rectangle à bouts ronds. Le
stadium s'écrit en LONGUEUR (`calc(hauteur / 2)`), exactement comme le chanfrein de
`shape-notched-corner` s'écrit en longueur pour rester à 45°. Même famille de piège, même
correction. C'est le seul endroit de la spec qui était faux, et il l'était sur la primitive la
plus fréquente de la planche (trois occurrences sur huit).

**3. Le micro-pied est deux fois sous le plancher, et le relevé ne le capitalise pas.**
`#C9C7C4` sur `#F5F4F2` mesure **1,28:1** — quatrième lot de suite où la source place son gris
secondaire sous le seuil (cf. `ref-08`, `ref-10`, `ref-13`). Et ≈ 10 px transposés à l'échelle
de la slide font 11 px là où le plancher de la scène 1600 est de **23 px** (DOCTRINE §7). Les
deux défauts ont la même cause : c'est un repère d'IMPRIMÉ, lu à 30 cm sur une feuille A4, où
7,5 pt gris pâle est un usage normal. Transposé sur une slide, il devient illisible deux fois.
Corrigé : **24 px** et **`#6E6C68`** (4,77:1 mesuré). DOCTRINE §7 offre l'autre issue — couper
le contenu — mais la rangée d'index porte la nature « couverture de rapport » de la planche :
sans elle, la mosaïque n'est plus qu'une mosaïque.

**4. Le bloc ne remplira JAMAIS un 16:9, et c'est démontrable.** Une grille de 4 colonnes × 3
rangées de cellules CARRÉES a pour aspect `(4c + 3g + 2m) / (3c + 2g + 2m)` : il vaut 4/3 à
gouttière et marge nulles, **décroît** vers 1 quand la marge grandit, et croît avec la gouttière
vers une borne de **3/2** qu'il n'atteint jamais (limite en `3g/2g`). Le maximum concevable est
donc 1,5, pour 1,778 demandés — et à gouttière raisonnable on est à 1,34. Poser 1,778 exigerait
une gouttière NÉGATIVE : aucun réglage ne comble l'écart, c'est une impossibilité, pas un
arbitrage. Les
cellules doivent rester carrées : deux discs et deux teardrops en dépendent (un disc dans une
cellule à 1,43 devient une ellipse, ou laisse 54 px de mou par côté qui détruit le serrage de la
mosaïque — c'est l'alternative essayée puis écartée). La reconstitution **cale donc le bloc sur
la HAUTEUR** de slide et le centre : bandes latérales de 307,5 px, qui sont le pourtour de la
feuille, pas un vide de composition. Précédents du corpus, mêmes raisons : `ref-15` (bande
centrée, 42 % de la surface) et `ref-12` (pile calée en hauteur).

**Géométrie retenue** (slide 1600 × 900, cellule **c = 232**, gouttière **g = 19**)

| objet | valeur | ratio |
|---|---|---|
| cellule | 232 | `0.1450 Wc` |
| gouttière, constante partout | 19 | `0.0119 Wc` — `0.0819 c`, le relevé (18/220) |
| mosaïque | 985 × 734 | `0.6156 Wc` — aspect **1,342**, le plafond démontré ci-dessus |
| marge haute et basse | 58,5 | `0.252 c`, le relevé (56/220) |
| bandes latérales | 307,5 | ce que la loi 4:3 laisse — pas une marge choisie |
| pilule / rail (2 cellules) | 483 × 232 | `2c + g`, aspect 2,08 |
| rayon stadium | 116 | `0.500 c` — hauteur / 2, en longueur |
| rayon squircle | 69,6 | `0.300 c` |
| rayon teardrop (3 coins sur 4) | 51,04 | `0.220 c` — 48 × 232/220 |
| inset du stadium emboîté | 15,78 | `0.068 c` — voir ci-dessous |
| rangée d'index, corps | 24 | `0.015 Wc`, plancher tenu |

**Trois valeurs unifiées ou posées, faute de relevé** :
- les deux insets relevés (≈ 14 et ≈ 16) sont à 12 % l'un de l'autre, sous la précision d'un
  relevé sur photo en perspective : **un seul token** les porte. Deux insets qui ne veulent rien
  dire, c'est la dette de DOCTRINE §9.
- la LONGUEUR de la barre en dégradé n'est nulle part dans le relevé — seulement « alignée à
  gauche », ce qui dit qu'elle ne remplit pas son rail. Elle est posée sur la **ligne de colonne
  invisible** : son bord droit tombe exactement sur la frontière c2/c3, soit `c − inset` de long
  (44,8 % du rail). DOCTRINE §3 — quand le relevé est muet, c'est le quadrillage qui tranche,
  pas le goût.
- le corps de l'année n'est pas 84 px : c'est une **fonction de la largeur de la pilule**
  (`calc(100cqw / chasse)`, l'acquis de `title-04`), réglée pour que l'encre sature 88 % de la
  pilule. À 84 px à l'échelle, « 20 » occupait 44 % de la largeur et 34 % de la hauteur d'une
  pilule de 483 — un petit bloc centré dans une grande boîte, ce que DOCTRINE §1 nomme
  précisément comme raté.

**Disposition** — Elle n'est pas inventée : elle est ce que l'inventaire ORDONNÉ (1 → 8) et ses
portées produisent en placement ligne par ligne.

| | c1 | c2 | c3 | c4 |
|---|---|---|---|---|
| r1 | 1 disc rouge | 2 rail + barre en dégradé (2 col.) | ↔ | 3 teardrop, coin droit **haut-droite** |
| r2 | 4 squircle | 5 pilule « 20 / 30 » (2 rangs) | 6 disc rouge | *creux* |
| r3 | 8 teardrop, coin droit **bas-gauche** | ↕ | 7 toggle (2 col.) | ↔ |

Onze cellules sur douze : **un seul creux**, en r2c4. Et les deux teardrops sont miroir l'un de
l'autre parce qu'ils occupent des coins diagonalement opposés — **le coin droit de chacun pointe
le coin de feuille qu'il occupe**. C'est ce qui interdit de les permuter.

**Patterns extraits — trois là où la spec en annonçait quatre** (12/08/2026)

`fill-gradient-stadium` n'est pas versé seul : « un dégradé directionnel contraint à une forme
stadium » tient dans sa propre phrase de description, ce que l'élagage du 30/07 interdit. Il
n'a d'ailleurs pas d'existence propre ici — le dégradé EST le remplissage de l'enfant emboîté.
Et la primitive 2 et la primitive 7 ne sont pas deux primitives : **c'est le même objet**, un
rail stadium portant un enfant en inset constant, une fois rempli d'un dégradé, une fois d'une
pastille. C'est cette identité que le pattern verse ; la spec la manquait en les listant à part.

| pattern | ce qu'il porte |
|---|---|
| `layout-15-primitive-mosaic` | la grille : 4 × 3 cellules carrées, gouttière unique, portées 2 col. / 2 rangs, onze douzièmes occupés, et la loi d'aspect qui interdit de l'étirer |
| `shape-02-teardrop-quadrant` | le carré arrondi à **un seul coin droit**, 4 orientations de même rayon, le coin droit comme pointeur d'orientation |
| `shape-03-stadium-track` | le rail stadium et son enfant emboîté : rayon en LONGUEUR (jamais `50%`), inset constant sur les quatre côtés, contours **concentriques** — et les deux remplissages (dégradé, pastille) comme deux rôles d'un seul objet |

**Corrigé au contrôle visuel (12/08/2026)** — `layout-15` ne déclarait aucune `font-family`, et
c'est le seul pattern du corpus dont une COTE dépend d'une police : le corps de l'année vaut
`calc(100cqw / 1,216)`, où 1,216 est la chasse d'encre de « 20 » dans le grotesk de la charte.
Servi dans une autre famille, le même calcul saturait 97 % de la pilule au lieu de 88 % et les
chiffres venaient lécher le bord. Le défaut était invisible au harnais parce que les deux outils
ne servent pas la même police par défaut — `check.mjs` met « Helvetica Neue » en tête,
`render.mjs` la police système — donc le benchmark des 88 % était vert sur un rendu faux. Le
fragment épingle désormais sa famille, et l'assertion a été doublée : la saturation est remesurée
après avoir imposé un serif à la racine du fragment, et doit être inchangée. Contre-épreuve
faite : rouge sans le correctif, verte avec.

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
L'image source n'existe pas sur disque : **cette section fait foi**, `bin/diff.mjs` est donc
impossible sur ce lot et le contrôle de fidélité se limite au regard et à `check-deck.mjs`.

**Palette**
- fond `#EFEFED`, carte blanche `#FFFFFF`, carte noire `#111111`
- jaune acide `#EAFF00` (aplat) — un seul accent, jamais deux
- gris de corps `#6C6C6C` — **corrigé** : le relevé donnait `#7A7A7A`, qui vaut **3,73:1** sur
  `#EFEFED` et 4,29:1 sur le blanc, sous le seuil de 4,5 des petits corps qu'il porte. Un
  demi-ton plus sombre remet le corps à 4,56:1 sur le fond et 5,25:1 sur le blanc. La
  bibliothèque ne capitalise pas le défaut de la source.
- gris atténué sur la carte noire `#9A9A9A` (6,71:1) — il n'existe pas dans le relevé, mais un
  bandeau noir portant deux niveaux de texte en a besoin ; c'est le seul token ajouté.
- filet `#11111118`

**Échelle — ×1,6, comme `ref-06`.** Les corps de la spec (titre ≈68 / chiffre ≈56 / corps 12 /
micro 8) ont été relevés sur une planche dont chaque slide fait ~1000 px de large. Reportés tels
quels sur une slide 1600×900, ils laissent des bandes mortes que la charte d'origine n'a pas, et
on est alors tenté d'étirer les cartes pour les combler. Les PROPORTIONS de la spec valent, ses
valeurs absolues non.

| rôle | relevé | slide 1600×900 |
|---|---|---|
| display (couverture, clôture) | 68 | **109** / 0.98 / 800 / `-0.03em`, casse mixte |
| titre de section | 42 | **67** / 1.02 / 800 / `-0.03em` |
| chiffre de carte | 56 | **90** / 1 / 800 / `-0.03em` |
| corps | 12 | **19** / 1.55 / 400 |
| label de carte | 12 | **19** / 1.3 / 700 |
| label `(01)` de carte de liste | 10 | **16** / 1.2 / 700 |
| micro (header, pied) | 8 | **13** / 1.4 / 700 / `0.12em` / CAPITALES |

Casse mixte partout **sauf** le micro : c'est la seule capitale de la charte, et c'est ce qui
rend le header lisible comme un appareil et non comme du texte.

**Header tri-parti** (présent sur les 8 slides, c'est la colonne vertébrale) :
`©NORTHBEAM` à gauche | `Our Company` / `March 28th, 2045` au centre |
`Business Proposal` / `Presentation` puis `2045` à droite. Micro 13, gris, filet fin dessous.
Le centre et la droite sont des piles de deux lignes ; la droite pousse `2045` à l'extrême bord.

**Éléments signature**
- **Astérisque ✳** à 6 branches, marqueur de marque : posé seul dans un carré noir
  radius 19, ou à côté d'un titre, ou en fin de phrase. **Jamais plus d'un par slide**, et
  toutes les slides n'en portent pas. Sa cote est une fraction de son support — **0,54 du côté
  du carré**, à toutes les tailles. Son ENCRE suit son SOL, elle n'est pas une propriété du
  marqueur : jaune dans le carré noir, **noir sur le fond clair**. Car —
- **Le jaune ne descend jamais sur le fond clair.** `#EAFF00` sur `#EFEFED` vaut **1,03:1** :
  luminances presque égales, il ne reste qu'un écart de teinte, qui vibre à l'écran et disparaît
  en gris comme à l'export PDF. Le jaune n'a donc que deux emplois : en **aplat** (l'encre qui
  s'y pose est le noir `#111111`, 16,91:1), ou en **encre SUR NOIR** (16,52:1). C'est la règle
  exacte ; « le jaune ne colore jamais du texte » était l'approximation qui a laissé passer un
  astérisque jaune en fin de titre sur le fond clair (slide 6, corrigé).
- **Cartes numérotées 01→04** : 4 cartes verticales radius 32, hauteur égale, chiffre en
  haut 90, label dessous 19. Une seule est jaune, une seule est noire, les autres blanches —
  le jaune marque l'étape courante.
- **Images « blob 3D »** noir et blanc (sphères, rubans, formes liquides) en carré radius 19.
  Aucune image n'existant sur disque, elles se reconstruisent en **dégradés radiaux** dans le
  carré — c'est un substitut assumé, noté ici pour qu'on ne le prenne pas pour un relevé.
- **Cartes de liste** : petites cartes jaunes ou noires radius 22, `(01)` label 16 en haut,
  paragraphe 19.
- Bandeau noir pleine largeur radius 26 contenant une texture + texte blanc + badge jaune.

**Géométrie** — slide 1600×900, marge 72 de tous côtés. Le header occupe le haut, filet à
`72 + 13·1,4·2 + 18` ≈ 126. La zone de contenu est donc 1456 × ~700. Gouttière commune **24**
entre cartes d'une même rangée, **32** entre blocs. Rayons : 19 (carré média / astérisque),
22 (carte de liste), 26 (bandeau), 32 (carte numérotée).

**La règle de l'accent, chiffrée.** « Neutre + UN accent fluo » se mesure : la surface jaune
d'une slide reste **≤ 12 %** de la surface de slide, et il n'y a **jamais deux objets jaunes**
qui ne soient pas le même objet. C'est ce qui distingue cette charte d'un deck « à couleur
d'accent » ordinaire, où l'accent finit par tapisser.

Deux corollaires, tous deux payés pendant la reconstitution :
- **C'est une contrainte de DIMENSION, pas seulement de compte.** Un objet peut être le SEUL
  jaune de sa slide et faire tomber la règle : la carte de total de la slide 7, laissée à pleine
  hauteur de colonne (460 × 669), couvrait 21,4 % de la slide. Bornée à 460 × 300 : 9,6 %. Même
  mécanique pour la rangée de cartes de la slide 4, bornée à 440 de haut plutôt que `flex: 1`.
- **Un objet borné ne peut pas tenir une colonne** — sorti du seul REGARD sur le rendu, et c'est
  le troisième corollaire. Bornée à 300 de haut puis laissée pendre en pied de la colonne droite,
  la carte de total respectait le plafond mais laissait 300 px de rien sous le titre de la slide 7 :
  la borne avait déplacé le défaut au lieu de le résoudre. Un objet dont la DIMENSION est
  contrainte doit changer de PLACE — le total remonte dans la bande de titre, dont il partage la
  ligne de départ, et le tableau de prix prend toute la hauteur restante. Aucune mesure ne voyait
  ce vide : `check-deck.mjs` compte les couches, pas les bandes mortes.
- **`≤ 12 %` est un PLAFOND, pas un quota.** Une slide a le droit de ne porter aucun jaune —
  c'est le cas de la slide 6 depuis que son astérisque a repris l'encre de son sol. Un deck où
  chaque slide place son accent parce que la charte « en a un » est exactement le deck que
  l'accent unique cherche à éviter.

**Plan des 8 slides** (arbitré ici — la spec d'origine annonçait 8 slides sans les décrire) :

| # | slide | ce qu'elle porte | l'accent jaune |
|---|---|---|---|
| 1 | Couverture | display césuré `Business-` / `Proposal`, `2045` en pied de titre, carré noir + astérisque jaune, carré média à droite | l'astérisque seul |
| 2 | Contents | titre de section + index numéroté `(01)`→`(05)` en lignes filetées, carré média | le filet de la ligne courante |
| 3 | About | titre + deux colonnes de corps, **bandeau noir pleine largeur** en bas avec badge jaune | le badge |
| 4 | How we work | la rangée **01→04** de cartes numérotées | la carte 02 |
| 5 | The challenge | quatre cartes de liste, une noire, une jaune, deux blanches | la carte jaune |
| 6 | What we deliver | trois cartes blanches hautes + carré média, astérisque **noir** en fin de titre | **aucun** — voir ci-dessous |
| 7 | Investment | bande de titre portant la carte de total en aplat (chiffre 90) à sa droite, puis trois lignes de prix filetées sur toute la hauteur restante | la carte de total, **bornée à 460 × 300** |
| 8 | Clôture | display césuré `Thank-` / `you`, coordonnées, astérisque | l'astérisque |

**Patterns à extraire** — la spec en annonçait cinq, il en sort **quatre** :
- `title-…-hyphen-break` — la césure volontaire dans un titre display (slides 1 et 8).
- `shape-…-asterisk-mark` — le marqueur de marque, ses trois emplois et sa règle du « un seul ».
- `card-…-numbered-steps` — la rangée 01→04 avec une seule carte accentuée.
- `layout-…-header-tripartite` — le header 3 zones, réutilisable hors de cette charte.

`accent-single-fluo` **n'est pas extrait** : c'est une règle éditoriale, pas une composition. Un
fragment qui ne serait qu'un aplat jaune tient dans sa propre phrase de description — le critère
de rétention du dépôt l'exclut. La règle est mesurée là où elle a un sens, c'est-à-dire sur la
SLIDE, par un benchmark de surface (≤ 12 %) porté par les patterns qui posent du jaune.

**Écarté de la reconstruction** : les photographies « blob 3D » (remplacées par des dégradés,
voir plus haut), et tout fond de planche — la source est une planche de 8 slides, on reproduit
les slides, pas la planche.

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

**Nature** — Maquette de page d'accueil « RAD HABITS », carte crème flottant sur une photo de
plage (ciel + mer + sable). Page ≈ 1440 de large, carte ≈ 78 % de la largeur.

**Ce qu'il faut isoler** — la PAGE, sol compris. Ici la photo n'est **pas** un décor de
maquette : c'est le fond de la page elle-même, à plat, sans perspective et sans ombre d'objet
physique. C'est exactement l'inverse de `ref-08`, dont la photo d'intérieur mettait la carte
en scène dans une pièce et a été retirée le 30/07 — voir la note « pourquoi les deux
références ne traitent pas leur photo pareil » plus bas. **Deux couches, pas trois** :
sol → carte. Les images du triptyque et le bouton sont des feuilles décorées, pas des couches.
Scène **1440 × 900**, déclarée `<!-- vl:stage web -->` : ce n'est pas une slide, le 16:9 PPT
n'a aucun sens pour un hero de page.

**Palette**

| rôle | valeur | note |
|---|---|---|
| carte | `#FBF7EC` | crème |
| rouge de marque | `#B2201C` | wordmark, bouton — **6,30:1 sur la carte**, il tient le corps |
| encre de nav | `#1E1B18` | 16:1 sur la carte |
| sol | photo | ciel `#BBD3DE` → mer `#5E8AA0` → sable mouillé `#C7B49A` → sable sec `#E4D5BC` |

Le sol est une **photo, jamais un aplat** : la carte crème posée sur un aplat crème perd son
bord, et le hero n'a plus de sol. Les quatre valeurs ci-dessus sont les dominantes de la
photo, reconstruites en dégradés SVG génératifs (aucune URL distante — même parti que `ref-08`).

**Typo** — display **rounded ultra-bold** (Obviously Wide / Cooper Black sans-serif / Recoleta
Black à la source ; ici `Archivo` `wght 900` + `wdth 125`, la seule variable du dépôt qui porte
un axe de largeur). Échelle en fraction de la largeur de **page** (`Wp` = 1440) :

| rang | px | ratio | ce que ça porte |
|---|---|---|---|
| wordmark | 148 | `0.103 Wp` | les deux lignes du nom, `line-height: 0.82`, capitales, rouge |
| logo de nav | 22 | `0.0153 Wp` | le nom au centre de la nav |
| liens de nav | 13 | `0.0090 Wp` | poids 500, casse mixte |
| bouton | 12 | `0.0083 Wp` | capitales, crème sur rouge |
| baseline du logo | **11** | `0.0076 Wp` | italique — **corrigé contre la source** (9 px) |

> **Corrigé contre la source.** La baseline italique sous le logo est relevée à 9 px. Une page
> web se lit à bout de bras dans un navigateur à l'échelle 1:1, pas projetée : à 9 px l'italique
> d'Archivo n'a plus d'œil. Portée à 11 px, elle reste secondaire (la moitié du logo) et
> redevient lisible. La bibliothèque ne capitalise pas le défaut de la source (§7 DOCTRINE).

**Géométrie** (page 1440 × 900)

| objet | valeur | ratio |
|---|---|---|
| carte | 1124 × 668, `radius 6`, ombre `0 24px 60px rgba(0,0,0,.18)` | `0.781 Wp` |
| marge de sol gauche/droite | 158 | `0.110 Wp` |
| marge de sol haut/bas | 116 | `0.129 Hp` |
| marge intérieure de carte | 44 | `0.039 Wc` |
| nav | 3 zones : liens à gauche, logo **optiquement centré sur la carte**, bouton à droite | — |
| triptyque | 3 images 3:4, `radius 8`, gouttière 12, calé **haut-droite** | `0.42 Wc` |
| wordmark | 2 lignes, fer à gauche, calé sur la marge **basse** | `0.51 Wc` |

Le geste de la composition est un **contrepoids diagonal** : le wordmark occupe le coin
bas-gauche, le triptyque le coin haut-droite, et les deux ne se croisent jamais en hauteur.
Le logo de nav est centré sur la CARTE, pas entre ses deux voisins : les liens (gauche) et le
bouton (droite) n'ont pas la même largeur, et centrer entre eux ferait dériver le nom.

**Ce qui est écarté** — rien : l'image source est une page complète, à plat. Aucune ombre de
maquette, aucun élément coupé par le cadre, aucune perspective.

**Pourquoi `ref-07` garde sa photo et `ref-08` non** — `ref-08` montrait la carte **posée dans
une pièce photographiée**, avec ombre portée d'objet physique : la photo mettait le design en
scène, elle n'en faisait pas partie, et l'inclure obligeait à recadrer chaque export. Ici la
photo est un fond de page plein cadre, à plat, sur lequel la carte est *incrustée* — la
retirer supprimerait le sujet du pattern `layout-11-hero-card-on-photo`. La frontière n'est pas
« photo ou pas », c'est **mise en scène du design** contre **fond de la page**.

**Patterns extraits**
- `layout-11-hero-card-on-photo` — la carte incrustée sur un sol photographique : marges de
  sol égales à gauche et à droite, rayon, ombre portée qui la fait flotter.
- `layout-12-nav-three-zone` — nav liens / logo centré sur le CONTENEUR / bouton.
- `title-03-wordmark-bottom-left` — wordmark de deux lignes calé bas-gauche, et son
  contrepoids diagonal en haut à droite.
- `layout-13-image-triptych` — 3 images, gouttière constante, bande pleine d'un bord à l'autre.
  **Largeurs ÉGALES ici**, contrairement à ce que disait cette ligne : la table de géométrie
  ci-dessus (0.42 Wc, gouttière 12) et la reconstitution donnent trois tiers exacts. **Et non,
  `ref-08` n'en fait pas autant** — corrigé le 12/08 en relevant son deck plutôt qu'en le
  supposant : ses cellules pèsent 1 / 1,31 / 1,14. Les poids sont donc un paramètre dont une
  référence sur deux se sert, et c'est ce qui a obligé le pattern à choisir sa vraie loi :
  hauteur commune, pas ratio identique.

---

## ref-08-swiss-studio-hero

**Nature** — Page d'accueil « Studioform® », grotesk neutre, sans aucun accent coloré.
**Jumelle de tempérament de `ref-07`, pas jumelle de structure** : les deux portent un
wordmark géant et une bande de trois images, mais `ref-07` a un SOL et `ref-08` n'en a pas
(voir « ce qui est écarté »).

**Ce qu'il faut isoler** — la PAGE, et elle seule. Le visuel source montrait la carte **posée
dans une pièce photographiée**, avec ombre portée d'objet physique : c'est un décor de
maquette, retiré le 30/07 — il obligeait à recadrer chaque export à la main. Ce qui reste est
la page, bord à bord, **1140 × 848** (ratio 1,344), déclarée `<!-- vl:stage web -->` : ce n'est
pas une slide. **UNE seule couche** : la page porte son fond, sa marge et sa mise en page ;
la bande d'images et le wordmark sont des feuilles, pas des couches.

**Palette** — trois valeurs, aucun accent. Toute la couleur du visuel vient des IMAGES.

| rôle | valeur | contraste |
|---|---|---|
| page | `#F6F5F2` | blanc cassé chaud — **corrigé contre la spec** (`#FFFFFF`) : la page est éclairée par la pièce du visuel source |
| encre | `#111111` | **17,4:1** — nav, wordmark |
| encre douce | `#2A2A28` | **13,3:1** — le statement |

Pas de correction de contraste à faire cette fois : c'est la première référence de la série
dont le secondaire ne passe pas sous 4,5:1. Les deux valeurs sont relevées, pas estimées.

**Typo** — Helvetica Neue / Inter. Échelle en fraction de la largeur de **page** (`Wp` = 1140) :

| rang | px | ratio | ce que ça porte |
|---|---|---|---|
| wordmark | **204** | `0.179 Wp` | `Studioform®`, poids 700, `-0.035em`, `line-height 0.92`, casse mixte |
| `®` | 53 | `0.26 em` du wordmark | exposant, remonté de `1.52 em` — voir plus bas |
| statement | **27** | `0.0237 Wp` | 3 lignes, `line-height 1.4`, poids 400, ≈ 46 caractères |
| nav | **18** | `0.0158 Wp` | `Work Index About Contact`, poids 400, gouttière 17 |

> **Trois valeurs corrigées contre la spec d'origine, au vu du visuel source** (30/07) :
> wordmark **204** et non 112 — il affleure les deux marges, c'est une largeur, pas une taille
> de charte ; statement **27 sur 3 lignes** et non 15 sur 2 ; page **#F6F5F2** et non blanc.
> Et **aucune taille intermédiaire n'existe entre 27 et 204** : c'est ce saut, sans palier,
> qui fait tout le visuel.

**Géométrie** (page 1140 × 848, marge 40 → largeur utile **1060**)

| objet | valeur | ratio |
|---|---|---|
| marge de page | 40 sur les quatre côtés | `0.0351 Wp` |
| rayon de page | 4 | `0.0035 Wp` |
| wordmark | encre de 40 à 1096 — **99,6 % de la largeur utile** | corps ≈ utile / 5,196 |
| bande d'images | 1060 × 380, calée en PIED (`margin-top: auto`) | `0.448 Hp` |
| cellules | 298 / 390,3 / 339,7 — poids **1 / 1,31 / 1,14** | hauteur COMMUNE, ratios 0,78 / 1,03 / 0,89 |
| gouttière | 16, constante | `0.0140 Wp` |
| rayon d'image | 8 | `0.0070 Wp` |

Le geste de la composition est un **ordre de lecture inversé** : la phrase parle en premier
(haut-gauche), la nav lui fait face (haut-droite), le nom n'arrive qu'ensuite — mais il prend
alors toute la largeur utile. La bande tombe en pied et ferme la page.

**Ce qui est écarté** — la mise en scène : photo d'intérieur, ombre portée d'objet physique,
fond de planche. Rien n'est coupé par le cadre, aucune perspective ne subsiste.

**Ce que `ref-08` NE prend PAS de `ref-07`** — `layout-11-hero-card-on-photo` ne s'applique
pas ici, et ce n'est pas un manque : sans sol photographique, il n'y a ni incrustation, ni
marge de sol, ni ombre à mesurer — le pattern refuse ce cas dans son propre `avoid_when`.
La frontière est **mise en scène du design** contre **fond de la page** (cf. `ref-07`), et
`ref-08` est du premier côté. Ce que les deux références partagent VRAIMENT, c'est la bande :
`layout-13-image-triptych`, et lui seul.

**Différences à conserver vs ref-07** (c'est ce qui rend le pattern paramétrable) :
| axe | ref-07 | ref-08 |
|---|---|---|
| sol | photo pleine page, carte incrustée | aucun — la page EST la surface |
| ordre de lecture | nom d'abord | phrase d'abord |
| bande | portrait 3:4, haut-droite, 42 % de la carte, poids ÉGAUX | hauteur fixe 380, pied, 100 % de la page, poids **1 / 1,31 / 1,14** |
| accent | rouge saturé | aucun |
| typo | display rounded (Archivo 900 / wdth 125) | grotesk neutre (Helvetica Bold) |
| radius de surface | 6 | 4 |

**Patterns extraits — deux, plus une généralisation** (12/08/2026)

`type-registered-superscript` n'est pas versé seul : le `®` calibré tient dans sa propre phrase
de description, ce que l'élagage du 30/07 interdit. Il est absorbé par le pattern de wordmark,
qui porte ce qu'il perd isolé — la calibration du signe est solidaire du réglage du corps.

| pattern | ce qu'il porte |
|---|---|
| `layout-14-statement-first` | l'ordre de lecture inversé : phrase + nav en haut, nom géant, bande en pied, et le saut d'échelle SANS palier entre les deux corps |
| `title-04-name-fills-measure` | le nom réglé pour saturer la mesure (≥ 99 % de la largeur utile) et son `®` en exposant, calé sous la hauteur de capitale |
| `layout-13-image-triptych` | **généralisé** : la loi de la bande est la HAUTEUR COMMUNE, pas le ratio identique — celui-ci n'en est que le cas particulier à poids égaux. `ref-07` et `ref-08` sortent du même pattern, par variables |

---

## ref-09-zine-annotated-blue

**Nature** — Planche de 12 slides d'un « project proposal », slides blanches sur fond de
planche `#D4D4D4`. L'image source n'existe pas sur disque : **cette section fait foi**,
`bin/diff.mjs` est donc impossible sur ce lot et le contrôle de fidélité se limite au regard
et à `check-deck.mjs`.

**Palette**
- papier `#FFFFFF` — la slide, et rien dessous : le fond de planche `#D4D4D4` n'est PAS
  reproduit (c'est le décor de la planche-contact, pas une couche de la slide).
- bleu `#2F3FE0` — les titres ET les annotations, la seule couleur de la charte (7,22:1 sur
  blanc, il passe même en corps).
- encre `#111111` (18,88:1).
- gris de corps `#6F6F6F` — **corrigé** : le relevé donnait `#8A8A8A`, qui vaut **3,45:1** sur
  blanc, très en dessous du seuil de 4,5 des corps qu'il porte. `#767676` remettrait tout juste
  à 4,54:1 ; on prend un demi-ton de plus (**5,02:1**) parce que ce gris porte ici le corps le
  plus exigeant du corpus — 20 px justifié sur des paragraphes longs — et qu'un plancher n'est
  pas une cible (DOCTRINE §7). Quatrième lot d'affilée où la source place son secondaire sous
  le seuil ; la bibliothèque ne capitalise pas le défaut de la source.
- filet `#DCDCDC` — décoratif, aucun texte ne s'y pose, donc hors seuil de contraste.

**Échelle — ×2.** Les corps du relevé (titre ≈40, corps ≈10, micro ≈8) ont été pris sur une
planche de **12** slides, donc environ 800 px par slide — deux fois plus dense que les planches
de 8 slides de `ref-05` et `ref-06`, relevées à ~1000 px et remises à l'échelle ×1,6. Reportés
tels quels sur 1600×900, ces corps seraient illisibles (un corps de 10 px). Les PROPORTIONS de
la spec valent, ses valeurs absolues non. Le contrôle croisé qui fixe le facteur : le corps
sort à **20**, à côté des 19 de `ref-05` — deux chartes de même nature ne peuvent pas porter
des corps à 16 et à 19.

| rôle | relevé | slide 1600×900 |
|---|---|---|
| titre (couverture ET sections) | ≈40 | **80** / 1.0 / 500 / `-0.02em`, bas de casse, bleu |
| intertitre de colonne | — (interpolé) | **32** / 1.25 / 600, bas de casse, encre |
| corps justifié | ≈10 | **20** / 1.45 / 400, gris |
| légende d'image, libellé de liste | — (interpolé) | **15** / 1.35 / 500 |
| micro du rail, folio | ≈8 | **16** / 1 / 500 / `0.18em`, bas de casse |

**Une seule marche de titre — la couverture n'a PAS de display.** Le relevé range
`project proposal` (la couverture) au même corps que `about us` et `our team`. C'est faithful
et c'est la signature : une planche qui n'escalade pas sur sa couverture se lit comme une page
IMPRIMÉE et non comme un deck. La couverture tient sa présence de son image et de son ovale
d'encerclement, pas d'un corps de 128.

**Bas de casse partout, sans exception** — titres compris. C'est la règle éditoriale de la
charte, et elle n'a pas de contre-exemple : aucune capitale, aucun `text-transform`.

**Géométrie** — slide 1600×900, marge **96** sur les quatre côtés. Zone de contenu
**1408 × 708** (y de 96 à 804). Grille de **6 colonnes de 208, gouttière 32**
(6 × 208 + 5 × 32 = 1408). Le rail vertical vit DANS la marge droite (bande de 96 collée au
bord, axe à x ≈ 1552) : il ne mange pas la zone de contenu et n'ajoute aucune couche.
**Aucun rayon dans cette charte** — tout est à angle vif, images comprises. C'est un imprimé.

**La mesure de texte — ce qui corrige la source.** Le relevé donne des colonnes justifiées de
≈34 caractères. DOCTRINE §8 est explicite : **sous ~45 caractères, la justification est perdue
d'avance**, et le recours nommé en premier est d'élargir la colonne. On garde donc la
justification (c'est la signature) et on élargit : une colonne de texte = **2 unités + 1
gouttière = 448 px**. Mesuré dans Chrome (Inter 20 px, bas de casse justifié) : **46,2
caractères** de moyenne sur les lignes pleines — 416 px n'en donnerait que 43,8, sous le seuil.
C'est cette mesure qui fixe l'unité de grille, pas l'inverse. Trois colonnes de texte tiennent
dans la zone de contenu, pas plus. La mesure est ASSERTÉE, pas supposée : le pattern éditorial porte un
benchmark « ≥ 45 caractères par ligne » mesuré dans Chrome.

**L'élément signature — les annotations manuscrites** (c'est le pattern qui compte) :
tracés SVG bleus posés **par-dessus** la typo, comme au marqueur.
- ovale d'encerclement autour d'un titre (ellipse ouverte, le trait dépasse et se recroise)
- flèche courbe avec pointe ouverte (2 traits), reliant un mot à une image
- soulignement simple ou double, légèrement ondulé, plus long que le mot
- gribouillis vertical (zigzag serré) le long d'un titre en colonne

Caractéristiques du trait : `stroke-width: 3.5`, `stroke-linecap: round`,
`stroke-linejoin: round`, `fill: none`, **irrégularité obligatoire** (les points de contrôle
Bézier décalés de ±3 % — sinon le tracé redevient une forme géométrique et l'effet tombe).
Rotation légère de l'ensemble (−2° à +3°).

**L'annotation est posée en SURIMPRESSION, jamais en conteneur.** Le SVG est un calque
`position: absolute` au-dessus de la typo, pas une boîte qui l'enveloppe : une boîte qui
n'encadre qu'un titre est exactement la couche 1:1 que `check-deck.mjs` refuse.

**La règle du « une par slide », chiffrée.** Au plus **une annotation par slide**, et
**quatre slides sur douze n'en portent aucune**. C'est la transposition directe de la leçon de
`ref-05` : une charte dont chaque slide place sa signature parce que « la charte en a une » est
exactement la charte que la signature cherchait à éviter. Chacun des quatre tracés sert **deux
fois** sur les douze — c'est ce qui prouve que la bibliothèque de tracés est une bibliothèque
et pas quatre dessins.

**Comment l'irrégularité se MESURE** (c'est ce qui fait de ce lot autre chose qu'un dessin) :
le fragment est du HTML statique, donc le désordre est cuit dans l'attribut `d` du tracé. Le
benchmark échantillonne le chemin (`getPointAtLength`) et compare les points à la forme
géométrique parfaite la plus proche (ellipse pour l'ovale, segment pour le soulignement) :
l'écart quadratique moyen doit tenir dans une **fourchette** — au moins 1,5 % de la largeur du
tracé (en dessous, c'est une forme géométrique), au plus 5 % (au-dessus, ce n'est plus une
annotation mais un gribouillis). La contre-épreuve est le vrai contrôle : remplacer le `d` par
l'ellipse parfaite ⇒ le benchmark sort ROUGE. Si `bin/check.mjs` n'a pas l'outil pour le dire,
c'est `bin/check.mjs` qu'on amende dans le même commit.

**Layout** — Très libre : images N&B de tailles inégales, texte en 1 à 3 colonnes, grands
blancs. Le déséquilibre est intentionnel — mais il se joue **sur la grille de 6** : sans elle,
rien ne distingue un déséquilibre voulu d'un défaut, et aucune mesure ne peut trancher.
Aucune image n'existant sur disque, les photographies N&B se reconstruisent en **dégradés et
formes SVG en niveaux de gris** dans leur cadre à angle vif — substitut assumé, noté ici pour
qu'on ne le prenne pas pour un relevé.

**Profondeur : 2 couches.** papier de slide → modules (bloc de texte, cadre d'image, ligne de
liste). Pas de panneau intermédiaire, pas de fond de planche, pas de marge de page.

**Plan des 12 slides** (arbitré ici — la spec d'origine annonçait 12 slides sans les décrire) :

| # | slide | ce qu'elle porte | l'annotation |
|---|---|---|---|
| 1 | Couverture | titre `project proposal`, ligne d'auteur et de date en micro, grande image N&B à droite (4 unités) | **ovale** autour du titre |
| 2 | `contents` | index numéroté `01`→`08`, deux colonnes de lignes filetées | aucune |
| 3 | `about us` | titre + **deux colonnes** de corps justifié + image carrée (2 unités) | **soulignement** ondulé sous deux mots du corps |
| 4 | `the problem` | titre + une colonne de corps + bande d'image N&B en pied (6 unités) | **zigzag** le long du titre |
| 5 | `our approach` | trois colonnes, chacune intertitre + corps justifié | aucune |
| 6 | `the process` | quatre étapes numérotées en lignes filetées + petite image | **flèche** courbe de l'étape 03 vers une note en marge |
| 7 | `our team` | trois portraits N&B, nom et rôle sous chacun | **ovale** autour d'un nom |
| 8 | `case study` | image pleine hauteur à gauche (3 unités) + colonne de corps à droite | aucune |
| 9 | `deliverables` | liste à filets : libellé à gauche, délai à droite | **soulignement double** sous un libellé |
| 10 | `timeline` | quatre jalons sur une ligne filetée horizontale | **flèche** vers le jalon final |
| 11 | `investment` | trois lignes de prix filetées + total | **zigzag** le long du total |
| 12 | Clôture | `thank you`, coordonnées en corps, image carrée | aucune |

Le rail vertical est présent sur les **12** slides (bord droit, lecture de bas en haut) : il
porte le nom de section en bas et le folio en haut, sur le même axe. C'est l'appareil de la
charte, l'équivalent du header tri-parti de `ref-05`.

**Patterns à extraire** — trois annoncés, et leurs noms de la spec d'origine
(`annotation-marker`, `type-lowercase-editorial`, `type-vertical-rail`) **ne portent aucune des
huit familles** de la nomenclature fermée. Renommés :

| annoncé | id retenu | pourquoi cette famille |
|---|---|---|
| `annotation-marker` | `shape-05-annotation-marker` | une bibliothèque de TRACÉS, aucune donnée, aucune structure — c'est une forme |
| `type-lowercase-editorial` | `layout-17-editorial-lowercase` | ce n'est pas un titre seul : c'est la DISPOSITION titre bas-de-casse ↔ colonnes justifiées, donc un layout |
| `type-vertical-rail` | à trancher en S8.7 | voir ci-dessous |

`bin/new.mjs` tranche le numéro et refuse un mot de slug déjà pris ; les ids ci-dessus sont
l'intention, pas un acquis.

**Le sort du rail se décide sur le critère de rétention du dépôt**, pas sur l'envie d'avoir
trois patterns : un fragment qui tient dans sa propre phrase de description ne se garde pas.
« Une micro-typo tournée à 90° sur le bord » tient dans sa phrase. Ce qui pourrait ne pas y
tenir : le rail porte DEUX contenus aux deux extrémités du même axe, à un décalage de bord
commun — c'est une composition, si le rendu le confirme. Sinon il est absorbé par le deck et
écrit comme tel, comme `accent-single-fluo` l'a été sur `ref-05`.

**Écarté de la reconstruction** : le fond de planche `#D4D4D4`, et les photographies N&B
(remplacées par des dégradés, voir plus haut).

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

**Patterns extraits — trois, et non les cinq annoncés** (12/08/2026)

La liste d'origine nommait des ÉLÉMENTS, pas des compositions ; trois d'entre eux tenaient
dans leur propre phrase de description, ce que l'élagage du 30/07 interdit. Ce qui a été versé :

| pattern | ce qu'il porte | ce qu'il absorbe de la liste d'origine |
|---|---|---|
| `layout-10-bleed-column-inset` | le lit d'images de la slide 1 : deux colonnes à fond perdu séparées par une seule COUTURE, et une incrustation posée par-dessus sans partager d'arête | `layout-image-collage-overlay` |
| `title-02-condensed-overlay-stack` | le cadre typographique : titre condensé à l'interligne écrasé, numéro de section au MÊME fer à l'autre bout de la colonne, contrepoids en micro-capitales au coin diagonalement opposé. Racine transparente : il se pose SUR le lit d'images | `type-condensed-stack`, `mark-paren-number`, `type-micro-caps-block` |
| `list-07-hairline-spec-table` | le tableau libellé/valeur dont les filets DÉBORDENT la marge de texte des deux côtés — une règle de page que le module traverse, pas la bordure d'un bloc | `table-hairline-rules` |

**Correction portée à la source** — le rouge relevé `#E33A22` tient 3,57:1 sur la crème. C'est
suffisant pour le titre de 104 px (plancher 3:1) et insuffisant partout ailleurs, or c'est le
MÊME rouge qui écrit les micro-capitales de 13 px et les libellés du tableau. La bibliothèque
ne capitalise pas le défaut de la source : `--vl-red` vaut **`#C82C15`** (4,57:1) dans
`systems/`, dans le deck et dans les trois patterns, et deux benchmarks de contraste par
pattern empêchent la correction de se reperdre au premier remappage de charte.

**Deuxième correction, sortie par le regard et non par la mesure** — les cellules du tableau
étaient centrées verticalement dans leur ligne : un libellé d'une ligne flottait au milieu
d'une valeur qui en fait trois, au lieu de pendre du filet qui l'ouvre. Aucun alignement ne
cassait. Corrigé dans le deck ET dans le pattern (`align-items: start`), verrouillé par une
assertion sur l'écart des premières lignes.

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
Corps ≈ 0,62 × l'unité de capsule. Le mot remplit la pilule : il n'y a pas de « petit texte
dans une grande forme ». L'échelle absolue ne se relève PAS sur la source (c'est un fragment
recadré, on ignore la largeur de la scène d'origine) : elle est **déduite** de la
reconstitution, ci-dessous — `u = 91 px`, donc capsule de 114 px et corps de 56 px sur une
slide 1600 × 900.

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
capsule pilotée par son mot. Le bord droit sort du cadre : c'est un accident de cadrage, pas une
intention. **On remet à plat** (cf. la règle « on reproduit la slide, pas l'image ») : la
reconstitution pose les six capsules entières, calées sur la marge droite.

**Reconstitution** — `decks/ref-12-neon-capsule-tags.html`, une slide, format PPT 1600 × 900 :
sol vert forêt, pile des six capsules alignée à droite, **rien d'autre**. Zéro couche au-dessus
de la scène — une capsule est un TRAIT, pas une surface, et lui poser un panneau sous elle
serait la couche de trop que `check-deck.mjs` refuse.

L'unité n'est pas un réglage libre, et c'est le deck qui l'a établie : six rangées de `1,255 u`
plus cinq écarts de `0,1 u` font `8,03 u`, donc la hauteur de slide plafonne `u ≤ 97 px`. Ce
n'est pourtant pas 97 qui est retenu mais **91** : le trait vaut `0,055 u` et Chrome ARRONDIT
une bordure CSS au pixel entier là où il ne le fait pas d'un stroke SVG — à 97 le contour passe
de 5,335 px (le SVG) à 5 px (la pilule) **à chaque soudure**, douze fois par slide, sur la seule
chose qui fasse la signature de cette charte. À 91 il vaut 5,005 px des deux côtés.

Second défaut, invisible à toute mesure de géométrie et sorti par le seul regard : bout à bout,
la bordure CSS et le stroke SVG laissent un trou de rastérisation d'environ 0,7 px — contour
continu en calcul, interrompu à l'œil. Les tracés débordent donc de `0,05 u` aux deux extrémités
(tête et calotte). Couverture des douze lignes droites : 0,30 avant, ≥ 0,99 après.

**Patterns extraits**
- `tag-01-gooey-capsule` — la capsule soudée (tête fixe + corps élastique + calotte) **et** la
  règle de pile : l'alignement à droite avec écart de `0,1 u` est porté par `.vl-capstack`, dans
  le même fragment. Il n'y a pas de second pattern de composition — une règle d'empilement qui
  tient dans sa propre phrase de description ne se garde pas.

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
