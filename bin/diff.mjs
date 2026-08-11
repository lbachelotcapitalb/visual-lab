#!/usr/bin/env node
// Comparer le rendu à la SOURCE, côte à côte — au lieu de s'en remettre à ce qu'on croit se
// rappeler de l'image. C'est le contrôle qui a manqué sur ref-13 : la fidélité y reposait sur
// ma mémoire de l'image dans le contexte, et une couche de trop est passée.
// Suppose que la source est sur le disque : node bin/ingest.mjs ref-NN-<slug>
//
//   node bin/diff.mjs ref-13-glass-fintech-dashboard
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, DIRS, shot } from './lib.mjs';

const STAGE = [1600, 900];
const ref = process.argv[2];
const deck = join(DIRS.decks, `${ref || ''}.html`);
const src = join(ROOT, 'assets', 'refs', `${ref || ''}.png`);
if (!ref || !existsSync(deck)) { console.error(`usage : diff.mjs ref-NN-<slug>   (decks/${ref || 'ref-NN'}.html introuvable)`); process.exit(1); }
if (!existsSync(src)) { console.error(`Source absente : ${src}\n→ node bin/ingest.mjs ${ref}`); process.exit(1); }

// La scène n'est PAS toujours 1600×900 : une référence qui n'est pas une slide déclare la
// sienne (`vl:stage web`) et pose ses propres dimensions sur `.slide`. Tirer le rendu à
// 1600×900 quand même AMPUTE la page — et le contrôle de fidélité se met alors à comparer
// une source entière à un rendu tronqué, c'est-à-dire à mentir dans le sens rassurant.
// On lit donc les dimensions déclarées dans le deck avant de le tirer.
const html = readFileSync(deck, 'utf8');
const isSlide = !/<!--\s*vl:stage\s+(?!slide)/.test(html);
const decl = html.match(/\.slide\s*\{[^}]*?width:\s*([\d.]+)px[^}]*?height:\s*([\d.]+)px/s);
const [SW, SH] = isSlide || !decl ? STAGE : [Math.round(+decl[1]), Math.round(+decl[2])];

mkdirSync(DIRS.proofs, { recursive: true });
const rendu = join(DIRS.proofs, `.diff-rendu-${ref}.png`);
shot(deck, rendu, SW, SH);

const H = 620; // hauteur commune : c'est la seule façon de comparer deux cadrages différents
const page = join(ROOT, `.diff-${process.pid}.html`);
writeFileSync(page, `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;padding:24px;background:#15171c;color:#8b93a7;
font:500 13px/1.4 -apple-system,"Helvetica Neue",Arial,sans-serif;display:flex;gap:24px;align-items:flex-start}
figure{margin:0;display:flex;flex-direction:column;gap:10px}
img{height:${H}px;width:auto;display:block;box-shadow:0 0 0 1px #2c3040}
</style>
<figure><figcaption>SOURCE</figcaption><img src="file://${src}"></figure>
<figure><figcaption>RENDU — ${SW}×${SH}</figcaption><img src="file://${rendu}"></figure>`);
const out = join(DIRS.proofs, `diff-${ref}.png`);
shot(page, out, 2400, H + 90);
unlinkSync(page); unlinkSync(rendu);
console.log(`✓ ${out}  — à REGARDER, puis à supprimer : proofs/ est jetable.`);
