#!/usr/bin/env node
// Le lint de COMPOSITION — celui qui manquait. `bin/check.mjs` ne regarde que l'intérieur d'un
// pattern : sur ref-13, 55 assertions étaient vertes sur un écran qui portait une couche de
// trop. Ici on mesure la slide elle-même, dans un vrai navigateur.
//
//   node bin/check-deck.mjs ref-13-glass-fintech-dashboard
//   node bin/check-deck.mjs                       → tous les decks
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, DIRS, CHROME } from './lib.mjs';

const STAGE = [1600, 900];   // format PPT 16:9 — même constante que bin/new-ref.mjs
const MAX_DEPTH = 3;         // fond → panneau → module, et pas un de plus

const wanted = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const decks = readdirSync(DIRS.decks).filter((f) => f.endsWith('.html'))
  .filter((f) => !wanted.length || wanted.some((w) => f.startsWith(w)));
if (!decks.length) { console.error('Aucun deck à contrôler.'); process.exit(1); }

// La sonde vit dans la page : une couche se reconnaît à son FOND, pas à sa classe.
const PROBE = `(() => {
  const alpha = (c) => { const p = (c.match(/[\\d.]+/g) || []).map(Number);
    return p.length === 4 ? p[3] : (p.length === 3 ? 1 : 0); };
  const isSurface = (el) => { const s = getComputedStyle(el);
    return alpha(s.backgroundColor) > 0.02 || s.backgroundImage !== 'none'; };
  const out = [];
  const body = getComputedStyle(document.body);
  const pageChrome = ['Top','Right','Bottom','Left'].some((d) => parseFloat(body['padding'+d]) > 0);
  for (const [n, slide] of [...document.querySelectorAll('.slide')].entries()) {
    const b = slide.getBoundingClientRect(), layers = [];
    (function walk(el, depth) {
      const surface = isSurface(el);
      if (surface) {
        const kids = [...el.children].filter((c) => !['STYLE','SCRIPT'].includes(c.tagName));
        const surfaceKids = kids.filter(isSurface);
        const ownText = [...el.childNodes].some((k) => k.nodeType === 3 && k.textContent.trim());
        // Une COUCHE est une surface qui en CONTIENT une autre. Une pilule, une pastille de
        // logo, une orbe sont des feuilles décorées : elles ne créent pas de niveau
        // d'emboîtement, et les compter ferait crier le lint sur toute carte un peu vivante.
        const container = el.querySelector && [...el.querySelectorAll('*')].some(isSurface);
        layers.push({
          sel: (el.className || el.tagName).toString().split(' ')[0] || el.tagName,
          depth, container,
          sole: kids.length === 1 && surfaceKids.length === 1 && !ownText,
        });
      }
      for (const k of el.children) if (!['STYLE','SCRIPT'].includes(k.tagName)) walk(k, depth + (surface ? 1 : 0));
    })(slide, 1);
    out.push({ n, slides: document.querySelectorAll('.slide').length,
               w: Math.round(b.width), h: Math.round(b.height), pageChrome,
               depth: Math.max(...layers.filter((l) => l.container).map((l) => l.depth), 1),
               sole: layers.filter((l) => l.sole).map((l) => l.sel + ' (profondeur ' + l.depth + ')') });
  }
  return out;
})()`;

// Échappatoire assumée : une référence qui n'est PAS une slide (hero web, bandeau de landing)
// n'a pas à tenir le 16:9. Elle le déclare en clair dans son deck, avec sa raison — un lint
// toujours rouge est un lint qu'on finit par ignorer, mais une exemption muette est pire.
const FREE = /<!--\s*vl:stage\s+libre\s*—\s*([^>]*?)-->/;

function probe(src) {
  const tmp = join(ROOT, `.deckprobe-${process.pid}.html`);
  writeFileSync(tmp, readFileSync(src, 'utf8').replace('</body>',
    `<script>document.addEventListener('DOMContentLoaded',()=>{const o=document.createElement('pre');` +
    `o.id='vl-deck';o.textContent=JSON.stringify(${PROBE});document.body.appendChild(o);});</script></body>`));
  // La fenêtre DOIT faire la taille de la scène : par défaut Chrome headless est en 800×600
  // et une .slide en flex-item s'y COMPRIME — on mesurerait 756 px de large sur une slide 1600.
  const dom = execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--window-size=${STAGE[0]},${STAGE[1]}`, '--virtual-time-budget=1500', '--dump-dom', `file://${tmp}`],
    { encoding: 'utf8', maxBuffer: 32e6 });
  unlinkSync(tmp);
  const m = dom.match(/<pre id="vl-deck">([\s\S]*?)<\/pre>/);
  if (!m) { console.error(`Sonde muette sur ${basename(src)} — le deck a-t-il un <body> et une .slide ?`); process.exit(1); }
  return JSON.parse(m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
}

let fail = 0;
for (const f of decks) {
  console.log(`\n${basename(f, '.html')}`);
  const free = (readFileSync(join(DIRS.decks, f), 'utf8').match(FREE) || [])[1];
  for (const s of probe(join(DIRS.decks, f))) {
    const t = (ok, msg) => { console.log(`  ${ok ? '✓' : '✗'} slide ${s.n + 1} · ${msg}`); if (!ok) fail++; };
    if (free) console.log(`  ~ slide ${s.n + 1} · format libre assumé (${s.w}×${s.h}) — ${free.trim()}`);
    else {
      t(s.w === STAGE[0] && s.h === STAGE[1], `format PPT ${STAGE[0]}×${STAGE[1]} (mesuré ${s.w}×${s.h})`);
      t(Math.abs(s.w / s.h - 16 / 9) < 0.01, 'ratio 16:9');
    }
    // La marge de page n'est un défaut que sur un deck d'UNE slide : là, la page EST la slide
    // et le liseré contrasté se lit comme une couche de plus (faute de ref-13). Sur un deck
    // multi-slides, c'est l'espace ENTRE les slides — il n'existe pas dans l'export slide par
    // slide, et le signaler dix fois noierait les vrais défauts.
    if (s.slides === 1) t(!s.pageChrome, 'aucune marge de page sous la slide — elle se lit comme une couche');
    t(s.depth <= MAX_DEPTH, `profondeur des couches ≤ ${MAX_DEPTH} (mesurée ${s.depth})`);
    t(!s.sole.length, s.sole.length
      ? `couche 1:1 redondante — ${s.sole.join(', ')} : n'encadre qu'UNE surface, garder celle du dessus`
      : 'aucune couche 1:1 redondante');
  }
}
console.log(fail ? `\n✗ ${fail} contrôle(s) de composition en échec.` : `\n✓ composition conforme (${decks.length} deck(s)).`);
process.exit(fail ? 1 : 0);
