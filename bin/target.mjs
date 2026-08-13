#!/usr/bin/env node
// bin/target.mjs — où se trouve, EN PIXELS DE SLIDE, la cible d'une annotation.
//
//   node bin/target.mjs decks/ref-09-zine-annotated-blue.html 7 s7-mark
//   node bin/target.mjs decks/ref-09-zine-annotated-blue.html 9 s9-mark s9-note
//
// POURQUOI CET OUTIL EXISTE (lot 8, sous-tâche S8.3 — la leçon la plus chère du lot) :
// un harnais de mesure monté À CÔTÉ du deck ment. Il n'a pas chargé les mêmes polices au
// même moment, ses légendes tiennent sur une ligne au lieu de deux, et une image en `flex: 1`
// absorbe la différence sans rien signaler. Treize pixels d'écart mesurés — soit un ovale qui
// BARRE le mot qu'il devait entourer.
//
// Donc on ne mesure pas à côté du rendu : on mesure DANS le rendu. La slide passe par
// exactement le même chemin que `bin/slides.mjs` (même style, même corps, même Chrome, même
// taille), la cible reçoit un aplat de repérage, et sa boîte est relevée SUR LE PNG. Ce qui
// sort d'ici est donc vrai par construction : c'est la même image que celle qu'on regarde.
//
// Deux boîtes sont rendues, et elles ne servent pas à la même chose :
//   box — la boîte de LIGNE (corps × interligne). C'est l'emprise à encercler : un ovale se
//         cale dessus, parce qu'il doit contenir le demi-interligne.
//   ink — l'emprise des GLYPHES (jambages compris). C'est sur elle que se pose un
//         soulignement, une flèche ou un zigzag : ils visent l'encre, pas la boîte.
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, basename, resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { inflateSync } from 'node:zlib';
import { ROOT } from './lib.mjs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const [deckArg, slideArg, ...ids] = process.argv.slice(2);
const deck = resolve(ROOT, deckArg || '');
if (!existsSync(deck) || !slideArg || !ids.length) {
  console.error('Usage : node bin/target.mjs decks/ref-NN-<slug>.html <n° de slide> <id> [id…]');
  process.exit(1);
}

const src = readFileSync(deck, 'utf8');
const style = (src.match(/<style>[\s\S]*?<\/style>/) || [''])[0];
const slides = src.match(/<section class="slide[\s\S]*?<\/section>/g) || [];
const slide = slides[Number(slideArg) - 1];
if (!slide) {
  console.error(`slide ${slideArg} absente (${slides.length} slides dans ${basename(deck)})`);
  process.exit(1);
}
const decl = style.match(/\.slide\s*{[^}]*?width:\s*(\d+)px[^}]*?height:\s*(\d+)px/);
const W = Number(decl?.[1]) || 1600, H = Number(decl?.[2]) || 900;

// Aplats de repérage : des couleurs qu'aucune charte du dépôt ne pose, pour qu'aucun pixel de
// la slide ne puisse être confondu avec un repère.
const MARKS = [[255, 0, 255], [0, 255, 255], [0, 255, 0], [255, 128, 0], [255, 0, 128]];
if (ids.length > MARKS.length) {
  console.error(`${ids.length} cibles demandées, ${MARKS.length} repères disponibles — mesure en deux fois.`);
  process.exit(1);
}
const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
const paint = ids.map((id, i) => `#${id}{background:${hex(MARKS[i])} !important;}`).join('\n');

const tmpHtml = join(dirname(deck), `.target-${process.pid}.html`);
const tmpPng = join(ROOT, `.target-${process.pid}.png`);
writeFileSync(
  tmpHtml,
  `<!doctype html><meta charset="utf-8">${style}
<style>body{margin:0;padding:0;display:block;background:var(--vl-board,#fff)}
/* L'annotation elle-même est retirée : on mesure la CIBLE, pas le tracé déjà posé dessus. */
.ann{display:none !important}
${paint}</style>
${slide}`
);
execFileSync(
  CHROME,
  ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
   `--window-size=${W},${H}`, `--screenshot=${tmpPng}`, `file://${tmpHtml}`],
  { stdio: ['ignore', 'ignore', 'pipe'] }
);
rmSync(tmpHtml);
if (!existsSync(tmpPng)) { console.error('Chrome n’a produit aucun PNG.'); process.exit(1); }

// ——— décodage PNG (8 bits, RGB ou RGBA), sans dépendance ———
const buf = readFileSync(tmpPng); rmSync(tmpPng);
let p = 8, w = 0, h = 0, ct = 0, bd = 0; const idat = [];
while (p < buf.length) {
  const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8);
  if (type === 'IHDR') { w = buf.readUInt32BE(p + 8); h = buf.readUInt32BE(p + 12); bd = buf[p + 16]; ct = buf[p + 17]; }
  else if (type === 'IDAT') idat.push(buf.subarray(p + 8, p + 8 + len));
  else if (type === 'IEND') break;
  p += 12 + len;
}
if (bd !== 8 || (ct !== 2 && ct !== 6)) { console.error(`PNG non géré (bitDepth ${bd}, colorType ${ct})`); process.exit(1); }
const ch = ct === 6 ? 4 : 3, stride = w * ch, raw = inflateSync(Buffer.concat(idat)), px = Buffer.alloc(h * stride);
for (let y = 0, o = 0; y < h; y++) {
  const f = raw[o++];
  for (let i = 0; i < stride; i++) {
    const v = raw[o + i], a = i >= ch ? px[y * stride + i - ch] : 0, b = y ? px[(y - 1) * stride + i] : 0,
          c = i >= ch && y ? px[(y - 1) * stride + i - ch] : 0;
    let out;
    if (f === 0) out = v; else if (f === 1) out = v + a; else if (f === 2) out = v + b;
    else if (f === 3) out = v + ((a + b) >> 1);
    else { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c);
           out = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
    px[y * stride + i] = out & 0xff;
  }
  o += stride;
}

// ——— relevé des deux boîtes ———
let bad = 0;
for (const [i, id] of ids.entries()) {
  const [mr, mg, mb] = MARKS[i];
  const box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  const ink = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = y * stride + x * ch, r = px[o], g = px[o + 1], b = px[o + 2];
    // Un pixel appartient à la cible s'il est le repère OU s'il est très minoritairement
    // teinté par lui (bord antialiasé du glyphe posé dessus).
    const dm = Math.abs(r - mr) + Math.abs(g - mg) + Math.abs(b - mb);
    if (dm > 150) continue;
    if (x < box.x1) box.x1 = x; if (x > box.x2) box.x2 = x;
    if (y < box.y1) box.y1 = y; if (y > box.y2) box.y2 = y;
    if (dm > 30) { // pas le repère pur : c'est de l'encre posée dessus
      if (x < ink.x1) ink.x1 = x; if (x > ink.x2) ink.x2 = x;
      if (y < ink.y1) ink.y1 = y; if (y > ink.y2) ink.y2 = y;
    }
  }
  if (box.x1 === Infinity) {
    console.log(`✗ #${id} — aucun pixel de repère : l'id n'existe pas sur cette slide, ou il est masqué.`);
    bad++; continue;
  }
  const f = (o) => `${o.x1}…${o.x2} × ${o.y1}…${o.y2}  (${o.x2 - o.x1 + 1}×${o.y2 - o.y1 + 1}, centre ${Math.round((o.x1 + o.x2) / 2)},${Math.round((o.y1 + o.y2) / 2)})`;
  console.log(`#${id}`);
  console.log(`   box  ${f(box)}`);
  console.log(ink.x1 === Infinity ? '   ink  (aucune encre — cible vide)' : `   ink  ${f(ink)}`);
}
process.exit(bad ? 1 : 0);
