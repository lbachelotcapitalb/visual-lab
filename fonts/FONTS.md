# FONTS — le registre typographique du corpus

Trois fichiers couvrent les dix références. Ils sont **dans le dépôt** (le réseau est
périssable, le rendu doit rester hors-ligne), sous licence **OFL** — licences à côté des
`.ttf`. Point d'entrée unique : [`fonts.css`](fonts.css).

## Brancher les polices

Les URL de `fonts.css` sont relatives à `fonts.css` lui-même : les deux profondeurs du dépôt
résolvent donc les mêmes fichiers, sans chemin absolu.

Dans un deck (`decks/ref-NN.html`) :

```html
<link rel="stylesheet" href="../fonts/fonts.css">
```

Dans un fragment de pattern rendu par `bin/render.mjs --pattern` (le fichier temporaire
est écrit à la racine) :

```html
<link rel="stylesheet" href="fonts/fonts.css">
```

Vérifié le 30/07/2026 : Chrome headless charge bien ces `.ttf` en `file://`, sans
`--allow-file-access-from-files` (`document.fonts.check()` → `true` pour les trois).

## Les trois familles embarquées

| famille | fichier | axes | ce qu'elle couvre |
|---|---|---|---|
| **Archivo** | `Archivo-variable.ttf` | `wght 100→900`, `wdth 62→125` | tous les titres du corpus, condensés compris — c'est le `wdth` qui évite d'embarquer une deuxième famille |
| **Inter** | `Inter-variable.ttf` | `wght 100→900`, `opsz` | le substitut d'Helvetica Neue pour les références « grotesk neutre » |
| **Anton** | `Anton-Regular.ttf` | une seule graisse | titre condensé quand Archivo à `wdth 62` manque encore de tension |

**`font-stretch` n'est pas décoratif** : sur une variable, il déplace un vrai axe de dessin.
Étirer une police non variable avec `transform: scaleX()` déforme les fûts et se voit
immédiatement sur les capitales — ne jamais le faire ici.

## Ce que chaque référence utilise

| réf | source réelle | ce qu'on écrit dans le deck | réglages qui comptent |
|---|---|---|---|
| 01, 02, 03 | Helvetica Neue / Inter | `"Helvetica Neue", Inter` | — |
| 04 | Helvetica Neue Black | `"Helvetica Neue", Inter` 900 | titre-monstre 76px / 0.92 / -0.02em / capitales |
| 05, 06 | grotesk bold | `"Helvetica Neue", Inter` | 06 : capitales, `letter-spacing: 0` |
| 07 | display rounded (Obviously Wide, Cooper Black) | `Archivo` 900 + `font-stretch: 112%` | à défaut du dessin rond d'origine, c'est la largeur qui porte l'effet |
| 08 | Helvetica Neue Bold | `"Helvetica Neue", Helvetica, Inter` 700 | wordmark **réglé à la largeur** : ≈ largeur utile / 5.2 pour `Studioform®` à `-0.035em`. Changer de police OU de largeur de carte oblige à recalculer — la valeur 204px ne se recopie pas |
| 09 | sans-serif tout en minuscules | `Inter` | jamais de capitales, y compris les titres |
| 10 | grotesk condensée Black | `Archivo` 900 + `font-stretch: 85%` | titre 104px / 0.84 / -0.01em / capitales ; micro-caps 13px / 1.45 / 700 / `0.02em` ; numéro de section 78px / 600 / largeur normale |

## Le piège des tailles de la spec

`SPEC-SOURCES.md` a été écrit à l'œil sur des captures, en supposant des slides plus petites
que celles qu'on construit. **Ses valeurs en px sont systématiquement basses d'un facteur
≈ 1.65** (vérifié sur ref-08 : wordmark 112 annoncé → 204 réel ; sur ref-10 : titre 58
annoncé → 104 réel). Les **rapports** de la spec sont bons, ses valeurs absolues non : régler
un titre à la **proportion de la largeur de slide** qu'il occupe dans la source, jamais en
recopiant le nombre.

## Charger les polices dans un DECK : @import, pas une balise de lien

`bin/slides.mjs` et `bin/board.mjs` reconstruisent la page à partir du **seul premier bloc
`<style>`** du deck. Une balise de lien posée dans l'en-tête est donc perdue à l'export, et
les slides sortent en police système — sans erreur, sans rien dans la console. La déclaration
doit vivre DANS la feuille de style :

```css
@import url("../fonts/fonts.css");
```

Vérifié le 30/07/2026 en `file://` (Chrome headless) : `@import` résout et charge les trois
familles. Les fichiers temporaires d'export sont écrits **à côté du deck** (patch du 30/07
dans les deux scripts) précisément pour que ce chemin relatif tienne à l'export.
