# DOCTRINE — les lois de mise en page de la maison

## Sommaire

- 1. Remplir l'espace — aucun vide oisif
- 2. Alignement inter-cartes — même départ, on grandit vers le bas
- 3. Le quadrillage invisible
- 4. La forme ET la couleur encodent la catégorie
- 5. Un fait, un lieu
- 6. Titres assertifs, pas étiquettes
- 7. Plancher de lisibilité — et un plancher n'est pas une cible
- 8. Justification — un arbitrage MESURÉ, jamais un goût
- 9. Tokens — rien à la main
- 10. Mesurer d'abord, regarder ensuite — et poser l'assertion des DEUX côtés
- Les trous — ce que personne ne mesure encore

Ce fichier ne contient **que ce qui ne dépend pas du média**. Une vignette obéit aux mêmes lois
qu'elle finisse sur une slide, dans une page web, dans un mailing ou sur un flyer — ce qui
change, c'est le moteur qui la rend et l'outil qui la mesure, pas la loi.

**Ce fichier ne dit pas comment appliquer.** L'application détaillée — les seuils, les unités,
les pièges d'un moteur — vit chez le producteur du média, et c'est très bien ainsi : le plancher
typographique s'exprime en points côté .pptx et en pixels côté HTML, la même loi dans deux unités.
Ici on nomme la loi une fois, on dit qui la mesure, et on montre les trous.

| producteur | média | où vit l'application | ce qui mesure |
|---|---|---|---|
| `deck-builder` | slide (.pptx et HTML 1920×1080) | `~/.claude/skills/deck-builder/SKILL.md` | `bin/gate.sh` (vides, centrage, chevauchement, mesure typographique) |
| `bestfront` | page/app web | `~/.claude/skills/bestfront/SKILL.md` | `geo-audit.js` (chevauchement, vide de carte, bande morte, quasi-alignement) |
| `visual-lab` | le pattern lui-même | ce dépôt | `bin/check.mjs` (benchmarks déclarés par pattern) |
| `gtm-content` | visuel de comm + PSD | `~/.claude/skills/gtm-content/` | contrôle de vides (`maxVoidPct` / `fillPct`) |
| — | **mailing, flyer, post social** | **rien encore** | **rien encore** — cf. « Les trous » en fin de fichier |

---

## 1. Remplir l'espace — aucun vide oisif

Rien ne justifie une grande zone vide dans une carte, une vignette, une boîte. Si le contenu
flotte en haut avec du vide dessous, c'est raté. On corrige dans cet ordre : **grossir** le
contenu jusqu'à ce qu'il occupe la boîte ; **répartir** le reste en écarts égaux (avant, entre,
après) — jamais tout le mou en bas ; **ajouter de la substance** (un chiffre, une preuve, une
punchline). Centrer un petit bloc dans une grande carte n'est PAS remplir : ça coupe le vide en
deux.

La même loi vaut à l'échelle du support entier : le module le plus bas atteint la marge basse.
Un vide en pied de page/de slide est le même défaut qu'un vide dans une carte.

**Une vignette se calibre sur SON texte, jamais sur la bande qui l'accueille.** Étirer une
rangée de cartes pour remplir une bande produit une rangée de cartes à moitié vides — et à
l'échelle du support, la carte se lit comme une surface pleine, donc la mesure globale ne voit
rien. Trois conséquences : on laisse les cartes prendre leur hauteur naturelle et on centre la
rangée ; **même groupe = même taille**, le contenu le plus haut fixe la hauteur de tous ; pour
égaliser, on **colle le paragraphe en BAS** de la carte, les dernières lignes partagent alors
leur ligne de base et l'écart se voit au-dessus du paragraphe, jamais en pied de rangée.

## 2. Alignement inter-cartes — même départ, on grandit vers le bas

Une rangée de cartes s'aligne sur une grille PARTAGÉE, jamais carte par carte. Icônes sur une
ligne, libellés sur une ligne, titres sur une ligne, corps qui démarrent sur une ligne — pour
TOUTES les cartes. On réserve la hauteur du bloc de titre au MAXIMUM du groupe, pour qu'un titre
sur deux lignes ne pousse pas son corps sous celui du voisin.

Et jamais d'ancrage BAS carte par carte pour une ligne de méta (durée, prix, date, statut) : une
étiquette d'une ligne se poserait plus bas qu'une de deux lignes et la rangée zigzague. On ancre
en haut, à un décalage commun, en réservant la hauteur maximale. **Même départ, croissance vers
le bas.**

## 3. Le quadrillage invisible

Rien ne se pose « à peu près ». Textes, chiffres, pastilles s'alignent sur une grille implicite :
mêmes lignes de base d'une colonne à l'autre, mêmes colonnes d'une ligne à l'autre, mêmes points
de départ verticaux. L'œil doit sentir l'ordre sans voir de trait — c'est ce quadrillage latent
qui fait « soigné », pas la somme des éléments pris isolément.

Corollaire coûteux et systématiquement raté : **un élément posé dans un coin a le MÊME écart au
bord bas qu'au bord latéral.** Un conteneur au padding asymétrique (`26px 8px`) transmet son
déséquilibre à toute rangée enfant sans padding propre.

## 4. La forme ET la couleur encodent la catégorie

Même forme visuelle = « même nature ». Donc on fait varier la forme selon la catégorie, et
jamais l'inverse : deux éléments de même catégorie ne se scindent pas en deux formes.

**Le même droit gouverne la couleur.** Un changement de couleur doit encoder une distinction
réelle — jamais décorer. Alterner les accents carte par carte sans raison sous-jacente est un
DÉFAUT : ça dit au lecteur « ces choses diffèrent » alors qu'elles ne diffèrent pas. Un seul
accent structurel par défaut ; le second réservé à une vraie emphase. Dans le doute, uniforme.

Pour échapper à la monotonie sans partir en morceaux : on code l'accent **par chapitre** — une
identité par section, uniforme à l'intérieur, changeant seulement aux frontières (raison réelle :
narration + repérage). La lisibilité de l'accent suit la LUMINANCE du fond : un or brille sur
marine et meurt sur ivoire.

## 5. Un fait, un lieu

Avant d'écrire, chaque preuve récurrente (année de création, métrique phare, certification) est
attribuée à UN endroit et retirée partout ailleurs. La répétition se lit comme du remplissage et
érode la confiance.

## 6. Titres assertifs, pas étiquettes

Un titre est une phrase courte qui énonce le constat, pas un nom commun. « Power BI est le
standard qu'on a retenu », pas « Power BI ». Lus à la suite, les titres doivent raconter toute
l'histoire.

## 7. Plancher de lisibilité — et un plancher n'est pas une cible

Chaque média exprime le plancher dans son unité (14 pt côté .pptx = 28 px sur la scène 1920 de
`deck-builder` — 1 pt = 2 px exactement ; sur la scène 1600 de visual-lab, le même plancher vaut
23 px). **Le nombre absolu appartient à la scène du producteur, pas à la doctrine** : ce qui est
commun, c'est le plancher en points. Ce qui est transverse, c'est la conséquence : **un corps qui franchit
tout juste le plancher n'est pas lisible pour autant**, parce que l'œil le compare à son voisin,
pas à un tableau. Une légende autonome — sous un grand chiffre, sur une couverture — appartient
à l'échelle d'affichage, pas à celle du corps.

Et surtout : **construire des objets visuels, pas du texte posé.** Un chiffre + une légende qui
flottent sur le fond sont plus faibles que le même contenu en vignette réelle (surface, bord,
padding). Quand un support paraît maigre, on transforme le contenu en composants et on les laisse
grandir — on ne monte pas la typo de deux points.

Si le texte doit descendre sous le plancher pour tenir : **on coupe du contenu, on ne rétrécit pas.**

## 8. Justification — un arbitrage MESURÉ, jamais un goût

Justifier met quatre exigences en concurrence : la forme justifiée, des espaces inter-mots
réguliers, un rythme de lignes régulier, et une taille de corps partagée par tout le groupe.
Elles ne peuvent pas toutes gagner. **Si la forme justifiée est hors d'atteinte, c'est ELLE qu'on
abandonne** — une rivière de blanc se voit plus qu'un bord droit irrégulier.

Le seuil : **sous ~45 caractères par ligne, la justification est perdue d'avance.** On élargit la
colonne (changement macro) ou on passe en drapeau.

## 9. Tokens — rien à la main

Espacements, couleurs, corps, rayons, ombres viennent d'une échelle ou de variables. Une valeur
ad hoc est une dette immédiate : c'est elle qui produit les couleurs « presque pareilles » et les
gouttières inégales. Dans ce dépôt, la règle est vérifiée mécaniquement — `bin/index.mjs` refuse
d'indexer un pattern qui porte une couleur en dur.

## 10. Mesurer d'abord, regarder ensuite — et poser l'assertion des DEUX côtés

Un rendu qu'on regarde attrape les fautes grossières, pas les dérives de 6 %. Une mesure qui
passe ne dit pas que c'est beau. Les deux contrôles sont obligatoires, dans cet ordre : mesurer,
corriger, **puis** regarder.

Et la règle qui a le plus rapporté : **quand un contrôle attrape ce que l'autre laisse passer,
l'assertion manquante se pose des DEUX côtés.** C'est comme ça que le contraste du corps sur
l'aplat orange (2,77:1, sous le seuil de 3:1) a été rattrapé — l'audit .pptx le testait, le
harnais HTML non.

Corollaire : un détecteur qui crie à tort est un détecteur qu'on finit par ignorer. Un faux
positif récurrent se corrige **dans le détecteur**, on ne l'ignore pas à la main. Deuxième cas
payé, 31/07 : le fond effectif du harnais de contraste remontait aux ancêtres jusqu'au premier
fond d'`alpha > 0.5`. Un verre à 0,45 était donc traité comme inexistant et un verre à 0,51
comme opaque — une falaise qui déclarait illisible tout un système en verre dépoli. Les couches
translucides sont maintenant **compositées** ; le seuil arbitraire a disparu. Ce qui reste vrai
en revanche, et qui n'est PAS un faux positif : sur un fond translucide, l'encre atténuée d'un
relevé passe très souvent sous 4,5:1 pour les petits corps qu'elle porte. C'est un défaut de la
source, il se corrige dans le **système** (token assombri), jamais en baissant le seuil.

---

## Les trous — ce que personne ne mesure encore

Nommer un trou vaut mieux que laisser croire à une couverture.

- **Mailing.** Aucun gate. `bin/emit.mjs --target email` dit si un pattern TIENT dans un client
  mail, pas si le mailing est bien composé. Au 30/07/2026, **0 pattern sur 17** passe la cible
  email : le corpus est de la matière slide/web. Pour un mailing, deux issues honnêtes — écrire
  des patterns nativement email (tables, largeurs fixes, zéro flex), ou **rendre le pattern en
  image** et poser l'image.
- **Flyer / impression.** Pas d'émetteur : un fragment HTML s'imprime tel quel (Chrome → PDF).
  Ce qui manque est une doctrine d'encre (aplats pleine page, ombres, dégradés) et l'obligation
  d'embarquer les polices de `fonts/` plutôt qu'une pile système.
- **Post social.** Le cadre (1080×1350) et la lisibilité au pouce ne sont vérifiés nulle part.
  `gtm-content` mesure les vides de SES cartes, ce n'est pas généralisé.

Quand l'un de ces trous se bouche, la ligne correspondante du tableau d'en-tête se remplit — et
c'est ce tableau, pas ce paragraphe, qui fait foi.
