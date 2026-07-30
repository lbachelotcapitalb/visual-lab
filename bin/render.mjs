#!/usr/bin/env node
// Preuve visuelle : rend un fichier HTML en PNG avec Chrome headless, en local, sans réseau.
//   node bin/render.mjs decks/ref-02-ghost-icon-claim.html  → proofs/<nom>.png (1600x900)
//   node bin/render.mjs decks/ref-04-swiss-investor-blue.html 1600 4800
//   node bin/render.mjs --pattern card-03-stat-accent    → le pattern seul sur sa référence
//
// Pourquoi Chrome et pas Playwright : rien à installer, et le rendu est celui d’un vrai
// moteur — un PNG produit par un simulateur ne prouverait rien.
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, DIRS, loadPatterns, loadSystems, systemToCss } from './lib.mjs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(CHROME)) {
  console.error(`Chrome introuvable (${CHROME}). Adapte la constante CHROME.`);
  process.exit(1);
}

const argv = process.argv.slice(2);
mkdirSync(DIRS.proofs, { recursive: true });

let file;
let name;
let tmp = null;

if (argv[0] === '--pattern') {
  const id = argv[1];
  const p = loadPatterns().find((x) => x.id === id);
  if (!p) {
    console.error(`Pattern "${id}" introuvable.`);
    process.exit(1);
  }
  const sys = loadSystems().find((s) => s.id === p.ref);
  tmp = join(ROOT, `.render-${id}.html`);
  writeFileSync(
    tmp,
    `<!doctype html><meta charset="utf-8"><style>
${sys ? systemToCss(sys) : ''}
*{box-sizing:border-box} body{margin:0;padding:64px;background:var(--vl-bg,#fff);
font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Inter,Arial,sans-serif}
</style>\n${p.html}`
  );
  file = tmp;
  name = id;
  argv.splice(0, 2);
} else {
  file = resolve(ROOT, argv[0] || '');
  name = basename(file).replace(/\.html?$/, '');
  argv.splice(0, 1);
}

if (!existsSync(file)) {
  console.error(`Fichier introuvable : ${file}`);
  process.exit(1);
}

const w = Number(argv[0]) || 1600;
const h = Number(argv[1]) || 900;
const out = join(DIRS.proofs, `${name}.png`);

execFileSync(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    `--window-size=${w},${h}`,
    `--screenshot=${out}`,
    `file://${file}`,
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] }
);

if (tmp) rmSync(tmp);
if (!existsSync(out)) {
  console.error('Chrome n’a produit aucun PNG.');
  process.exit(1);
}
console.log(`✓ ${out}  (${w}×${h})`);
