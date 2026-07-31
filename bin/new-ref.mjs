#!/usr/bin/env node
// Ouvrir un lot de reverse : les trois fichiers d'un coup, avec le squelette EXACT attendu —
// la section de spec, le système de tokens, le deck au format PPT. C'est ici que le format et
// la structure du deck sont posés par l'OUTIL : les deux fautes de ref-13 (slide hors format,
// marge de page qui ajoute une couche) venaient d'un squelette écrit à la main.
//
//   node bin/new-ref.mjs ref-14-mon-visuel "Nom lisible de la charte"
import { existsSync, writeFileSync, appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, DIRS } from './lib.mjs';

export const STAGE = [1600, 900]; // format PPT 16:9 — la seule taille de slide du dépôt

const [ref, label] = process.argv.slice(2);
if (!ref || !/^ref-\d{2}-[a-z0-9-]+$/.test(ref)) {
  console.error('usage : new-ref.mjs ref-NN-<slug> ["Nom lisible"]');
  process.exit(1);
}
const sysPath = join(DIRS.systems, `${ref}.json`);
const deckPath = join(DIRS.decks, `${ref}.html`);
const specPath = join(ROOT, 'SPEC-SOURCES.md');
for (const p of [sysPath, deckPath]) if (existsSync(p)) { console.error(`Existe déjà : ${p}`); process.exit(1); }
if (readFileSync(specPath, 'utf8').includes(`## ${ref}`)) { console.error(`SPEC-SOURCES.md contient déjà ## ${ref}`); process.exit(1); }

const [W, H] = STAGE;
writeFileSync(sysPath, JSON.stringify({
  name: label || 'À NOMMER', notes: 'Ce que la charte FAIT, et ce qui la casse. Deux gestes maximum.',
  tokens: { '--vl-bg': '#FFFFFF', '--vl-ink': '#111111', '--vl-accent': '#000000',
            '--vl-radius-card': '24px', '--vl-gap': '22px', '--vl-margin': '44px' },
  type: { display: 'Inter, -apple-system, "Helvetica Neue", Arial, sans-serif',
          body: 'Inter, -apple-system, "Helvetica Neue", Arial, sans-serif',
          scale: { 'figure': '44px / 1 / 600 / -0.025em', 'title': '15px / 1.2 / 500', 'micro': '11px / 1.3 / 400' } },
}, null, 2) + '\n');

writeFileSync(deckPath, `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${ref} — reconstitution</title>
<style>
@import url("../fonts/fonts.css");

/* ${ref} — reconstitution fidèle. UNE <section class="slide"> par slide de la spec,
   au format PPT ${W}×${H}. Le nombre de COUCHES du rendu est celui de la source. */
:root {
  --vl-bg: #FFFFFF;
  --vl-ink: #111111;
  --vl-accent: #000000;
  --vl-radius-card: 24px;
  --vl-gap: 22px;
  --vl-margin: 44px;
  --vl-font: Inter, -apple-system, "Helvetica Neue", Arial, sans-serif;
}
* { box-sizing: border-box; }
/* Pas de « table » sous la slide : une marge de page contrastée AJOUTE une couche. */
body { margin: 0; padding: 0; display: flex; background: var(--vl-bg);
       font-family: var(--vl-font); color: var(--vl-ink); -webkit-font-smoothing: antialiased; }
.slide { position: relative; width: ${W}px; height: ${H}px; padding: var(--vl-margin);
         display: flex; flex-direction: column; gap: var(--vl-gap); overflow: hidden;
         background: var(--vl-bg); }
</style>
</head>
<body>

<section class="slide">
  <!-- les modules -->
</section>

</body>
</html>
`);

appendFileSync(specPath, `
---

## ${ref}

**Nature** — <ce que montre l'image : slide isolée ? planche de N slides ? crop ? photo en
perspective ? Et de quoi il s'agit.>

**Ce qu'il faut isoler** — <la slide, et rien qu'elle. Combien de COUCHES : rappel, trois au
grand maximum, et deux couches qui encadrent la même chose n'en font qu'une. Ce qui est écarté
et pourquoi : fond de planche, éléments coupés par le cadre, perspective, ombre de maquette.>

**Palette** (relevée par \`node bin/palette.mjs ${ref}\` — pipette \`--at x,y\`, pas à l'œil)

| rôle | valeur |
|---|---|
| fond | \`#______\` |

**Typo** — <famille, graisses, letter-spacing>. Échelle en **fraction de la largeur de slide**
(\`Ws\` = ${W}) — jamais d'un objet interne, qui peut disparaître à la première refonte :

| rang | ratio | ce que ça porte |
|---|---|---|
| chiffre héros | \`0.0___ Ws\` | |

**Géométrie** — <rangées, gouttière, marges, ce que porte chaque zone.>

**Patterns extraits**
- \`famille-NN-slug\` — <ce qu'il porte>
`);

console.log(`✓ ${sysPath}\n✓ ${deckPath}   (slide ${W}×${H})\n✓ SPEC-SOURCES.md → ## ${ref}`);
console.log(`\nEnsuite : node bin/ingest.mjs ${ref}  ·  node bin/palette.mjs ${ref}  ·  node bin/check-deck.mjs ${ref}`);
