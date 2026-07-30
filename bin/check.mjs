#!/usr/bin/env node
// Vérification MATHÉMATIQUE d'un pattern : rend le fragment dans Chrome, mesure la géométrie
// RÉELLE du DOM, et confronte chaque assertion du bloc `benchmarks` de son .json.
//
//   node bin/check.mjs                        → tous les patterns qui déclarent des benchmarks
//   node bin/check.mjs card-03-stat-accent    → un seul
//   node bin/check.mjs --report               → mesures brutes en plus des verdicts
//
// POURQUOI : « regarder » un rendu attrape les fautes grossières, pas les dérives de 6 % —
// et c'est précisément là que vit l'écart entre une vignette qui tient et une qui sent le
// remplissage. Un chanfrein à 4 % de la largeur au lieu de 7,5 % ne se voit pas à l'œil sur
// une slide, se voit sur huit, et ne se rattrape plus quand le deck est écrit.
// Le contrôle visuel reste obligatoire APRÈS celui-ci (bin/render.mjs) : les chiffres ne
// disent pas si c'est beau, ils disent si c'est la bonne géométrie.
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, DIRS, loadPatterns, loadSystems, systemToCss } from './lib.mjs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(CHROME)) {
  console.error(`Chrome introuvable (${CHROME}). Adapte la constante CHROME.`);
  process.exit(1);
}

const argv = process.argv.slice(2);
const report = argv.includes('--report');
const wanted = argv.filter((a) => !a.startsWith('--'));

const systems = new Map(loadSystems().map((s) => [s.id, s]));
const patterns = loadPatterns()
  .filter((p) => p.benchmarks?.length)
  .filter((p) => !wanted.length || wanted.includes(p.id));

if (!patterns.length) {
  console.error(
    wanted.length
      ? `Aucun benchmark sur : ${wanted.join(', ')} (le .json doit porter un tableau "benchmarks").`
      : 'Aucun pattern ne déclare de benchmarks.'
  );
  process.exit(1);
}

// Les aides exposées aux expressions `measure`. Tout est en pixels CSS mesurés après layout ;
// W et H sont ceux de la racine du pattern, pour que les benchmarks s'écrivent en RATIOS —
// un ratio survit au changement d'échelle (1600×900 → 13,33 pouces), un pixel non.
const HARNESS_JS = `
const $ = (sel) => {
  const el = document.querySelector(sel);
  if (!el) throw new Error('sélecteur introuvable : ' + sel);
  return el;
};
const ROOT_EL = $(window.__VL_ROOT__);
const rootBox = ROOT_EL.getBoundingClientRect();
const W = rootBox.width, H = rootBox.height;
const box = (sel) => {
  const b = $(sel).getBoundingClientRect();
  return { x: b.left - rootBox.left, y: b.top - rootBox.top, w: b.width, h: b.height,
           top: b.top - rootBox.top, left: b.left - rootBox.left,
           right: b.right - rootBox.left, bottom: b.bottom - rootBox.top };
};
const num = (sel, prop) => parseFloat(getComputedStyle($(sel))[prop]) || 0;
const cs = (sel, prop) => getComputedStyle($(sel))[prop];
const text = (sel) => $(sel).textContent.trim();
// Débordement propre : ce que le contenu dépasse de son conteneur.
const overflow = (sel) => { const e = $(sel); return Math.max(0, e.scrollHeight - e.clientHeight); };
// Sommets d'un clip-path polygon(), RÉSOLUS en pixels.
// ⚠️ Piège payé : \`getComputedStyle().clipPath\` ne résout PAS les pourcentages ni les calc() —
// il rend \`polygon(0px 0px, 100% 0px, 100% calc(100% - 34px), …)\`. Une regex qui ne ramasse
// que les \`px\` produit une liste de sommets fantaisiste (elle appairait 0 et 34 comme un
// point) : les mesures semblaient bonnes par coïncidence, l'orientation du chanfrein sortait
// fausse. Il faut donc découper les points à la virgule, x/y à l'espace — tous deux au
// PREMIER niveau de parenthèses — puis évaluer chaque expression contre la boîte.
const splitTop = (s, sep) => {
  const out = []; let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === sep && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
};
const polyPoints = (sel) => {
  const el = $(sel), b = el.getBoundingClientRect();
  const m = (getComputedStyle(el).clipPath || '').match(/^polygon\\(([\\s\\S]*)\\)$/);
  if (!m) return [];
  const resolve = (expr, base) => {
    const s = expr
      .replace(/calc/g, '')
      .replace(/([\\d.]+)%/g, (_, n) => '(' + (Number(n) / 100) * base + ')')
      .replace(/([\\d.]+)px/g, '$1');
    if (!/^[-+*/().\\d\\s]+$/.test(s)) throw new Error('clip-path illisible : ' + expr);
    return eval(s);
  };
  return splitTop(m[1], ',').map((pt) => {
    const [xs, ys] = splitTop(pt, ' ');
    return [resolve(xs, b.width), resolve(ys, b.height)];
  });
};
// Taille du coin coupé : pour chacun des 4 coins, de combien le polygone s'en écarte le long
// des deux arêtes. Le chanfrein est la plus grande coupe trouvée.
const notch = (sel) => {
  const pts = polyPoints(sel);
  if (pts.length < 4) return 0;
  const b = $(sel).getBoundingClientRect();
  const corners = [[0, 0], [b.width, 0], [b.width, b.height], [0, b.height]];
  let cut = 0;
  for (const [cx, cy] of corners) {
    for (const p of pts) {
      const dx = Math.abs(p[0] - cx), dy = Math.abs(p[1] - cy);
      const lim = Math.min(b.width, b.height) * 0.5;
      // un sommet SUR l'arête, à moins de la moitié de la petite dimension du coin :
      // c'est une extrémité de la coupe
      if (dx > 1 && dx < lim && dy < 1) cut = Math.max(cut, dx);
      if (dy > 1 && dy < lim && dx < 1) cut = Math.max(cut, dy);
    }
  }
  return cut;
};
// Sur QUEL coin est la coupe : 'tl' | 'tr' | 'br' | 'bl' (ou '' si la forme n'est pas
// chanfreinée). L'orientation porte du sens dans le système — accent en bas-droit, second
// rang en haut-droit — donc elle se vérifie, elle ne se relit pas à l'œil.
const notchCorner = (sel) => {
  const pts = polyPoints(sel);
  if (pts.length < 5) return '';
  const b = $(sel).getBoundingClientRect();
  const names = ['tl', 'tr', 'br', 'bl'];
  const corners = [[0, 0], [b.width, 0], [b.width, b.height], [0, b.height]];
  // Le coin coupé est celui dont AUCUN sommet du polygone n'occupe la position exacte.
  for (const [i, [cx, cy]] of corners.entries()) {
    if (!pts.some((p) => Math.abs(p[0] - cx) < 1 && Math.abs(p[1] - cy) < 1)) return names[i];
  }
  return '';
};
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const parseRgb = (s) => (s.match(/[\\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
// Fond effectif : on remonte les ancêtres jusqu'au premier fond non transparent.
const bgOf = (el) => {
  for (let e = el; e; e = e.parentElement) {
    const c = getComputedStyle(e).backgroundColor;
    const p = (c.match(/[\\d.]+/g) || []).map(Number);
    if (p.length === 3 || (p.length === 4 && p[3] > 0.5)) return p.slice(0, 3);
  }
  return [255, 255, 255];
};
const contrast = (sel) => {
  const el = $(sel);
  const a = lum(parseRgb(getComputedStyle(el).color)), b = lum(bgOf(el));
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
};
window.__VL_EVAL__ = (expr) => eval(expr);
`;

let failures = 0;
const tmp = join(ROOT, '.check.html');
mkdirSync(DIRS.proofs, { recursive: true });

for (const p of patterns) {
  const sys = systems.get(p.ref);
  if (!sys) {
    console.error(`✗ ${p.id} : référence "${p.ref}" inconnue — impossible de mesurer.`);
    failures++;
    continue;
  }
  const rootSel = p.geometry?.root;
  if (!rootSel) {
    console.error(`✗ ${p.id} : "geometry.root" manquant (le sélecteur de la racine mesurée).`);
    failures++;
    continue;
  }

  const exprs = p.benchmarks.map((b) => b.measure);
  writeFileSync(
    tmp,
    `<!doctype html><meta charset="utf-8">
<style>
  /* Le harnais est écrit à la RACINE du dépôt : le chemin des polices est donc relatif à ROOT,
     comme pour bin/render.mjs. C'est l'outil qui branche les polices, jamais le fragment —
     sinon le fragment ne serait plus collable ailleurs. */
  @import url("fonts/fonts.css");
${systemToCss(sys)}
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px; background: var(--vl-bg, #fff);
         font-family: "Helvetica Neue", Inter, Arial, sans-serif; }
</style>
${p.html}
<pre id="vl-out"></pre>
<script>
window.__VL_ROOT__ = ${JSON.stringify(rootSel)};
${HARNESS_JS}
const out = ${JSON.stringify(exprs)}.map((e) => {
  try { return { ok: true, value: window.__VL_EVAL__(e) }; }
  catch (err) { return { ok: false, error: String(err.message || err) }; }
});
document.getElementById('vl-out').textContent = JSON.stringify({ W, H, out });
</script>`
  );

  const dom = execFileSync(
    CHROME,
    ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=1500',
     '--dump-dom', `file://${tmp}`],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024 }
  );
  const raw = (dom.match(/<pre id="vl-out">([\s\S]*?)<\/pre>/) || [])[1];
  if (!raw) {
    console.error(`✗ ${p.id} : le harnais n'a rien mesuré (fragment cassé, ou sélecteur racine absent).`);
    failures++;
    continue;
  }
  const measured = JSON.parse(raw.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));

  console.log(`\n${p.id}  (racine ${rootSel} · ${Math.round(measured.W)}×${Math.round(measured.H)} px)`);
  for (const [i, b] of p.benchmarks.entries()) {
    const r = measured.out[i];
    if (!r.ok) {
      console.log(`  ✗ ${b.name}\n      erreur de mesure : ${r.error}`);
      failures++;
      continue;
    }
    const v = r.value;
    let ok, want;
    if (b.expect !== undefined) {
      const tol = b.tol ?? 0;
      ok = Math.abs(v - b.expect) <= tol;
      want = `${b.expect}${tol ? ` ±${tol}` : ''}`;
    } else {
      ok = (b.min === undefined || v >= b.min) && (b.max === undefined || v <= b.max);
      want = [b.min !== undefined ? `≥ ${b.min}` : null, b.max !== undefined ? `≤ ${b.max}` : null]
        .filter(Boolean).join(' et ');
    }
    if (!ok) failures++;
    const val = typeof v === 'number' ? v.toFixed(3).replace(/\.?0+$/, '') : JSON.stringify(v);
    console.log(`  ${ok ? '✓' : '✗'} ${b.name}${ok && !report ? '' : `\n      mesuré ${val} · attendu ${want}${report ? `  [${b.measure}]` : ''}`}`);
  }
}

rmSync(tmp, { force: true });
console.log(
  failures
    ? `\n✗ ${failures} benchmark(s) en échec — corrige le fragment, relance. Le pattern n'est pas livrable.`
    : `\n✓ tous les benchmarks passent (${patterns.length} pattern(s)). Contrôle VISUEL ensuite : node bin/render.mjs --pattern <id>`
);
process.exit(failures ? 1 : 0);
