#!/usr/bin/env node
// Planche-contact d'un deck : toutes les slides réduites, en grille, sur un seul PNG.
//   node bin/board.mjs decks/ref-04.html              → proofs/ref-04.png (2 colonnes, 50 %)
//   node bin/board.mjs decks/ref-09.html 3 0.34       → 3 colonnes à 34 %
//
// DÉRIVÉ, jamais source : le deck s'écrit une slide par section, à sa taille réelle. C'est
// ce script qui met les slides en grille — pas le HTML du deck, qui ne doit rien savoir de
// la façon dont on le regarde.
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
  console.error(`Deck introuvable : ${deck}\nUsage : node bin/board.mjs decks/ref-NN.html [colonnes] [échelle]`);
  process.exit(1);
}

const cols = Number(argv[1]) || 2;
const scale = Number(argv[2]) || 0.5;
const GAP = 32;
const PAD = 48;

const src = readFileSync(deck, 'utf8');
const style = (src.match(/<style>[\s\S]*?<\/style>/) || [''])[0];
const slides = src.match(/<section class="slide[\s\S]*?<\/section>/g) || [];
if (!slides.length) {
  console.error(`Aucune <section class="slide"> dans ${basename(deck)}.`);
  process.exit(1);
}

const decl = style.match(/\.slide\s*{[^}]*?width:\s*(\d+)px[^}]*?height:\s*(\d+)px/);
const w = Number(decl?.[1]) || 1600;
const h = Number(decl?.[2]) || 900;

const cw = Math.round(w * scale);
const ch = Math.round(h * scale);
const rows = Math.ceil(slides.length / cols);
const pageW = cols * cw + (cols - 1) * GAP + 2 * PAD;
const pageH = rows * ch + (rows - 1) * GAP + 2 * PAD;

const name = basename(deck).replace(/\.html?$/, '');
mkdirSync(DIRS.proofs, { recursive: true });
// Écrit à côté du deck : cf. la note dans bin/slides.mjs (chemins relatifs).
const tmp = join(dirname(deck), `.board-${name}.html`);
const out = join(DIRS.proofs, `${name}.png`);

writeFileSync(
  tmp,
  `<!doctype html><meta charset="utf-8">${style}
<style>
body{margin:0;padding:${PAD}px;display:grid;gap:${GAP}px;justify-content:center;
grid-template-columns:repeat(${cols},${cw}px);background:var(--vl-board,var(--vl-bg,#fff))}
.vl-cell{width:${cw}px;height:${ch}px;overflow:hidden}
.vl-cell > .slide{transform:scale(${scale});transform-origin:top left}
</style>
${slides.map((s) => `<div class="vl-cell">${s}</div>`).join('\n')}`
);

execFileSync(
  CHROME,
  ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
   `--window-size=${pageW},${pageH}`, `--screenshot=${out}`, `file://${tmp}`],
  { stdio: ['ignore', 'ignore', 'pipe'] }
);

rmSync(tmp);
if (!existsSync(out)) {
  console.error('Chrome n’a produit aucun PNG.');
  process.exit(1);
}
console.log(`✓ ${out}  (${pageW}×${pageH}) · ${slides.length} slides, ${cols} colonnes à ${Math.round(scale * 100)} %`);
