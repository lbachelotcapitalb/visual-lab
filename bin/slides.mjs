#!/usr/bin/env node
// Exporte un deck SLIDE PAR SLIDE, chacune à sa taille réelle.
//   node bin/slides.mjs decks/ref-04-swiss-investor-blue.html            → proofs/<deck>/slide-01.png …
//   node bin/slides.mjs decks/ref-03-bento-dark-pitch.html 1120 410   → dimensions forcées
//   node bin/slides.mjs decks/ref-04-swiss-investor-blue.html --only 4   → une seule slide (boucle de correction)
//
// C'est le livrable de référence d'un lot : une planche-contact réduite ne permet PAS de
// juger une slide (à 50 %, la micro-typo de 8 px devient illisible et les écarts se cachent).
// La planche-contact, elle, se dérive ensuite avec bin/board.mjs.
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, DIRS } from './lib.mjs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(CHROME)) {
  console.error(`Chrome introuvable (${CHROME}). Adapte la constante CHROME.`);
  process.exit(1);
}

const argv = process.argv.slice(2);
const deck = resolve(ROOT, argv[0] || '');
if (!existsSync(deck)) {
  console.error(`Deck introuvable : ${deck}\nUsage : node bin/slides.mjs decks/ref-NN-<slug>.html [w h] [--only N]`);
  process.exit(1);
}

const onlyAt = argv.indexOf('--only');
const only = onlyAt === -1 ? null : Number(argv[onlyAt + 1]);
const nums = argv.filter((a, i) => /^\d+$/.test(a) && i !== 0 && i !== onlyAt + 1).map(Number);

const src = readFileSync(deck, 'utf8');
const style = (src.match(/<style>[\s\S]*?<\/style>/) || [''])[0];
const slides = src.match(/<section class="slide[\s\S]*?<\/section>/g) || [];
if (!slides.length) {
  console.error(`Aucune <section class="slide"> dans ${basename(deck)} — un deck s'écrit une slide par section.`);
  process.exit(1);
}

// Dimensions : arguments, sinon celles déclarées par la règle .slide du deck lui-même.
const decl = style.match(/\.slide\s*{[^}]*?width:\s*(\d+)px[^}]*?height:\s*(\d+)px/);
const w = nums[0] || Number(decl?.[1]) || 1600;
const h = nums[1] || Number(decl?.[2]) || 900;

const name = basename(deck).replace(/\.html?$/, '');
const outDir = join(DIRS.proofs, name);
mkdirSync(outDir, { recursive: true });

// Le fichier temporaire est écrit À CÔTÉ du deck : les chemins relatifs du deck
// (@import d'une CSS de polices, asset local) doivent résoudre pareil à l'export.
const tmp = join(dirname(deck), `.slides-${name}.html`);
const wanted = only ? [only] : slides.map((_, i) => i + 1);

for (const n of wanted) {
  const slide = slides[n - 1];
  if (!slide) {
    console.error(`slide ${n} absente (${slides.length} slides dans ${name})`);
    process.exit(1);
  }
  // Le fond de planche du deck est conservé : certaines références posent des cartes sur un
  // fond coloré, et une slide rendue sur du transparent ne montrerait pas ce qu'on juge.
  writeFileSync(
    tmp,
    `<!doctype html><meta charset="utf-8">${style}
<style>body{margin:0;padding:0;display:block;background:var(--vl-board,var(--vl-bg,#fff))}</style>
${slide}`
  );
  const out = join(outDir, `slide-${String(n).padStart(2, '0')}.png`);
  execFileSync(
    CHROME,
    ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
     `--window-size=${w},${h}`, `--screenshot=${out}`, `file://${tmp}`],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );
  if (!existsSync(out)) {
    console.error(`Chrome n’a produit aucun PNG pour la slide ${n}.`);
    process.exit(1);
  }
  console.log(`✓ ${out}  (${w}×${h})`);
}

rmSync(tmp);
console.log(`→ ${wanted.length} slide(s) sur ${slides.length} · ${outDir}`);
