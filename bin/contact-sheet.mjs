#!/usr/bin/env node
// PLANCHE-CONTACT DES PATTERNS — tous les fragments côte à côte, chacun rendu sur la charte
// de SA référence, légendé par son id.
//
//   node bin/contact-sheet.mjs                        → proofs/contact-sheet.png (tout)
//   node bin/contact-sheet.mjs --family card
//   node bin/contact-sheet.mjs --ref ref-06
//   node bin/contact-sheet.mjs --media social
//   node bin/contact-sheet.mjs --cols 4 --scale 0.42
//
// À quoi ça sert, et à quoi ça ne sert PAS. Le routage se fait sur INDEX.md / index.json :
// du texte, pas cher, qui dit ce que chaque pattern FAIT. La planche sert l'étape d'après —
// arbitrer entre les quelques finalistes, ou passer une branche entière en revue d'un coup
// d'œil pour en proposer trois. Rendre les patterns un par un à chaque production serait du
// gaspillage ; une planche régénérée à l'indexation coûte un rendu pour toute la maison.
//
// Une planche est un DÉRIVÉ : elle ne devient jamais la source de vérité. Un pattern se juge
// à sa taille réelle (node bin/render.mjs --pattern <id>) avant d'être posé quelque part.
//
// DEUX PASSES, et c'est le point délicat : la taille d'une vignette est MESURÉE dans Chrome
// avant d'être mise en grille, jamais devinée. Sept patterns sur dix-sept ne déclarent pas de
// `geometry.frame` — les caler sur une valeur de repli les recadrait en silence, et une
// planche qui rogne ce qu'elle est censée montrer est pire qu'une absence de planche.
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT, DIRS, FAMILIES, MEDIA, loadPatterns, loadSystems, systemToCss, mediaOf, shot, dumpJson,
} from './lib.mjs';

const argv = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? d : (argv[i + 1] ?? true);
};

let patterns = loadPatterns().sort((a, b) => a.id.localeCompare(b.id));
const systems = loadSystems();
let suffixe = '';

if (flag('family')) {
  const f = String(flag('family'));
  if (!FAMILIES.includes(f)) {
    console.error(`Famille inconnue : "${f}". Vocabulaire : ${FAMILIES.join(', ')}`);
    process.exit(1);
  }
  patterns = patterns.filter((p) => p.family === f);
  suffixe = `-${f}`;
} else if (flag('ref')) {
  const r = String(flag('ref'));
  patterns = patterns.filter((p) => p.ref.includes(r));
  suffixe = `-${r}`;
} else if (flag('media')) {
  const m = String(flag('media'));
  if (!MEDIA.includes(m)) {
    console.error(`Média inconnu : "${m}". Vocabulaire : ${MEDIA.join(', ')}`);
    process.exit(1);
  }
  patterns = patterns.filter((p) => mediaOf(p).includes(m));
  suffixe = `-${m}`;
}

if (!patterns.length) {
  console.error('Aucun pattern dans cette sélection — rien à rendre.');
  process.exit(1);
}

const cols = Number(flag('cols')) || (patterns.length <= 4 ? 2 : 3);
const scale = Number(flag('scale')) || 0.5;
const GAP = 40;
const PAD = 48;
const LEGENDE = 36; // hauteur réservée sous chaque vignette pour son id et ses médias

// Les polices vivent dans le dépôt ; la planche est écrite ailleurs que fonts/. On réancre les
// URL en absolu : une police qui ne charge pas ne se voit pas comme une erreur, elle se voit
// comme une planche « au rendu un peu différent » — le pire des cas.
const fontsCss = existsSync(join(ROOT, 'fonts', 'fonts.css'))
  ? readFileSync(join(ROOT, 'fonts', 'fonts.css'), 'utf8')
      .replace(/url\(("|')?(?!https?:|data:|\/)/g, (m, quote) => `url(${quote || ''}${join(ROOT, 'fonts')}/`)
  : '';

// Chaque vignette porte le :root de SA référence : une planche qui mélange les chartes ne peut
// pas se contenter d'un bloc global. Le scope de classe permet aussi de voir, sur une même
// image, si deux systèmes jurent l'un à côté de l'autre.
const cells = patterns.map((p, i) => {
  const sys = systems.find((s) => s.id === p.ref);
  const cls = `vl-sys-${i}`;
  return { p, cls, css: sys ? systemToCss(sys).replace(/^:root/, `.${cls}`) : `.${cls}{}` };
});

const BASE = `${fontsCss}
*{box-sizing:border-box}
body{margin:0;background:#F4F4F2;
  font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Inter,Arial,sans-serif}
${cells.map((c) => c.css).join('\n')}`;

/* ————— Passe 1 : MESURER la taille naturelle de chaque fragment ————— */
mkdirSync(DIRS.proofs, { recursive: true });
const name = `contact-sheet${suffixe}`;
// Écrit dans patterns/ : les chemins relatifs éventuels d'un fragment restent valides.
const tmp = join(DIRS.patterns, `.${name}-${process.pid}.html`);

writeFileSync(
  tmp,
  `<!doctype html><meta charset="utf-8"><style>${BASE}
.vl-probe{display:inline-block;vertical-align:top}
</style>
${cells.map((c, i) => `<div class="vl-probe ${c.cls}" id="vl-p${i}">${c.p.html}</div>`).join('\n')}
<pre id="vl-out"></pre>
<script>
document.getElementById('vl-out').textContent = JSON.stringify(
  ${JSON.stringify(cells.map((_, i) => i))}.map((i) => {
    const b = document.getElementById('vl-p' + i).getBoundingClientRect();
    return { w: Math.ceil(b.width), h: Math.ceil(b.height) };
  })
);
</script>`
);

let sizes;
try {
  sizes = dumpJson(tmp);
} catch (e) {
  console.error(`Mesure impossible : ${e.message}`);
  process.exit(1);
}

/* ————— Passe 2 : poser la grille aux tailles mesurées, puis capturer ————— */
const laid = cells.map((c, i) => ({
  ...c,
  cw: Math.round(sizes[i].w * scale),
  ch: Math.round(sizes[i].h * scale),
}));
const colW = Math.max(...laid.map((c) => c.cw));
const rows = [];
for (let i = 0; i < laid.length; i += cols) rows.push(laid.slice(i, i + cols));
const rowH = rows.map((r) => Math.max(...r.map((c) => c.ch)) + LEGENDE);
const pageW = cols * colW + (cols - 1) * GAP + 2 * PAD;
const pageH = rowH.reduce((a, b) => a + b, 0) + (rows.length - 1) * GAP + 2 * PAD;

writeFileSync(
  tmp,
  `<!doctype html><meta charset="utf-8"><style>${BASE}
body{padding:${PAD}px}
.vl-grid{display:grid;gap:${GAP}px;grid-template-columns:repeat(${cols},${colW}px);align-items:start}
.vl-frame{overflow:hidden;background:#fff;box-shadow:0 0 0 1px #00000012}
.vl-frame > *{transform:scale(${scale});transform-origin:top left}
/* Légende en deux DIV, jamais un span : les fragments cohabitent dans un seul document et
   apportent chacun leur bloc <style> — un sélecteur de balise nu venu d'un pattern écraserait
   un span de légende sans qu'on comprenne pourquoi (vu à la première planche : les deux
   lignes collées). Une classe propre par ligne, et la planche ne dépend de personne. */
.vl-cap{margin-top:8px;font-size:12px;line-height:1.4;color:#3A3A38;font-weight:600}
.vl-cap__sub{display:block;font-weight:400;color:#84847F}
</style>
<div class="vl-grid">
${laid
  .map(
    (c) => `<div>
  <div class="vl-frame ${c.cls}" style="width:${c.cw}px;height:${c.ch}px">${c.p.html}</div>
  <div class="vl-cap">${c.p.id}<div class="vl-cap__sub">${mediaOf(c.p).join(' · ')}</div></div>
</div>`
  )
  .join('\n')}
</div>`
);

const out = join(DIRS.proofs, `${name}.png`);
shot(tmp, out, pageW, pageH);
rmSync(tmp);

console.log(
  `✓ ${out}  (${pageW}×${pageH}) · ${patterns.length} pattern(s), ${cols} colonnes à ${Math.round(scale * 100)} %`
);
console.log('Planche = arbitrage entre finalistes. Le pattern retenu se REGARDE ensuite en taille réelle :');
console.log(`   node bin/render.mjs --pattern ${patterns[0].id}`);
