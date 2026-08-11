#!/usr/bin/env node
// LA VITRINE : une page HTML unique qui montre TOUTE la bibliothèque, vivante.
//
//   node bin/gallery.mjs                      → gallery.html (tout)
//   node bin/gallery.mjs ref-17 ref-18        → filtré sur des références
//   node bin/gallery.mjs --family card        → filtré sur une famille
//
// POURQUOI PAS UN PNG. Une planche-contact en image est une COPIE MORTE : elle périme au
// premier changement de fragment, on ne peut ni zoomer sans bouillie, ni inspecter le DOM,
// ni copier le code, ni voir le vrai rendu des polices — et elle pèse dans un dépôt qui
// n'accepte pas de binaire. La page ci-dessous rend les fragments EUX-MÊMES : ce qu'on
// regarde est exactement ce qu'on collera ailleurs. Le PNG reste un instrument de mesure
// interne (bin/render.mjs, proofs/, gitignoré, supprimé en fin de lot) ; il ne se livre pas.
//
// Chaque vignette porte les tokens de SA référence en style inline sur son propre conteneur :
// c'est ce qui permet à quinze chartes qui emploient les mêmes noms `--vl-*` de cohabiter
// dans une seule page sans se contaminer. Un `:root` global ne saurait pas faire ça.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, DIRS, loadPatterns, loadSystems, frameOf, mediaOf, splitFragment } from './lib.mjs';

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(`--${n}`); return i === -1 ? null : argv[i + 1]; };
const family = flag('family');
const refs = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));

const systems = new Map(loadSystems().map((s) => [s.id, s]));
let patterns = loadPatterns();
if (family) patterns = patterns.filter((p) => p.family === family);
if (refs.length) patterns = patterns.filter((p) => refs.some((r) => p.ref.startsWith(r)));
if (!patterns.length) { console.error('Aucun pattern à montrer.'); process.exit(1); }

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tokensOf = (refId) => Object.entries(systems.get(refId)?.tokens || {})
  .map(([k, v]) => `${k}:${v}`).join(';');

// LE SOL DU FRAGMENT. Beaucoup de patterns n'ont pas de fond propre : ils comptent sur celui
// de leur charte. Posés sur le fond de la vitrine, leur encre disparaît — et le défaut est
// imputé au pattern alors qu'il vient de la page qui le montre. On rend donc chaque vignette
// sur le fond que sa référence prévoit, dans cet ordre de priorité.
const GROUND = ['--vl-page', '--vl-app', '--vl-bg', '--vl-board', '--vl-paper', '--vl-sheet', '--vl-veil', '--vl-card'];
const groundOf = (refId) => {
  const t = systems.get(refId)?.tokens || {};
  for (const k of GROUND) if (t[k]) return t[k];
  return '#FFFFFF';
};

// Groupé par RÉFÉRENCE : c'est l'unité de charte, donc l'unité de lecture. Trier par famille
// mélangerait des systèmes qui n'ont rien à voir et rendrait la page illisible.
const byRef = new Map();
for (const p of patterns.sort((a, b) => a.id.localeCompare(b.id))) {
  if (!byRef.has(p.ref)) byRef.set(p.ref, []);
  byRef.get(p.ref).push(p);
}

const CARD_W = 620;   // largeur utile d'une vignette : le fragment y est mis à l'échelle

const sections = [...byRef.entries()].sort().map(([refId, ps]) => {
  const sys = systems.get(refId);
  const deck = existsSync(join(DIRS.decks, `${refId}.html`)) ? `decks/${refId}.html` : null;
  const swatches = Object.entries(sys?.tokens || {})
    .filter(([, v]) => /^#|^rgb/.test(String(v)))
    .map(([k, v]) => `<i title="${esc(k)} ${esc(v)}" style="background:${esc(v)}"></i>`).join('');

  const cards = ps.map((p) => {
    const file = join(DIRS.patterns, `${p.id}.html`);
    if (!existsSync(file)) return '';
    const { markup, css } = splitFragment(readFileSync(file, 'utf8'));
    // Un pattern sans `geometry.frame` n'est pas mis à l'échelle du tout : mieux vaut une
    // vignette qui déborde et qu'on fait défiler qu'une vignette réduite au hasard d'une
    // valeur de repli — c'est cette valeur de repli qui rognait sept patterns en silence.
    const declared = Array.isArray(p.geometry?.frame) && p.geometry.frame.length === 2;
    const [fw, fh] = frameOf(p);
    const k = declared ? Math.min(1, CARD_W / fw) : 1;
    return `
<article class="pat">
  <header>
    <h3>${esc(p.id)}</h3>
    <p class="meta">${esc(p.family)} · ${esc(mediaOf(p).join(' '))} · ${p.benchmarks?.length || 0} benchmarks · ${declared ? `${fw}×${fh}` : 'cadre non déclaré'}</p>
    <p class="intent">${esc(p.intent)}</p>
  </header>
  <!-- Le fragment RÉEL, réduit par « zoom » et NON par « transform ». La différence n'est pas
       cosmétique : « transform » ne modifie pas le flux, il faut donc lui réserver une hauteur
       calculée à la main — et tout pattern qui ne déclare pas geometry.frame se retrouve
       rogné ou noyé dans du vide. « zoom » reflue : le parent prend la hauteur réelle du
       fragment mis à l'échelle, quelle que soit sa taille déclarée ou non. -->
  <div class="stage" style="background:${groundOf(p.ref)}">
    <div class="scaler" style="zoom:${k.toFixed(4)};${tokensOf(p.ref)}">
      ${markup}
    </div>
  </div>
  <details>
    <summary>le code — ${esc(p.id)}.html</summary>
    <pre><code>${esc(markup)}\n\n&lt;style&gt;${esc(css)}&lt;/style&gt;</code></pre>
  </details>
  <style>${css}</style>
</article>`;
  }).join('\n');

  return `
<section class="ref" id="${esc(refId)}">
  <div class="refhead">
    <h2>${esc(refId)}</h2>
    <p class="sysname">${esc(sys?.name || '')}</p>
    <div class="swatches">${swatches}</div>
    ${deck ? `<a class="decklink" href="${deck}">voir l'écran entier →</a>` : ''}
  </div>
  ${cards}
</section>`;
}).join('\n');

// Une charte sans pattern disparaîtrait purement et simplement de la page — et une vitrine
// qui tait ce qui manque ment par omission. On les nomme.
const orphelines = [...systems.keys()].filter((id) => !byRef.has(id)).sort();

const nav = [...byRef.keys()].sort()
  .map((r) => `<a href="#${esc(r)}">${esc(r.replace(/^ref-\d+-/, ''))}</a>`).join('');

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>visual-lab — la bibliothèque, vivante</title>
<link rel="stylesheet" href="fonts/fonts.css">
<style>
/* GÉNÉRÉ par bin/gallery.mjs — ne pas éditer à la main, la prochaine génération l'écrase.
   Cette page ne porte AUCUNE règle qui pourrait déteindre sur les fragments : tout son style
   est préfixé, et les fragments vivent dans .scaler avec leurs propres tokens inline. */
:root { color-scheme: light dark; }
* { box-sizing: border-box; }
body {
  margin: 0; padding: 0 0 80px;
  background: #F4F4F5; color: #17171A;
  font: 400 15px/1.5 Inter, -apple-system, "Helvetica Neue", Arial, sans-serif;
}
.top { position: sticky; top: 0; z-index: 10; background: #17171A; color: #FAFAFA; padding: 18px 40px; }
.top h1 { margin: 0 0 4px; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
.top p { margin: 0 0 12px; font-size: 13px; color: #A1A1AA; }
.top nav { display: flex; flex-wrap: wrap; gap: 6px; }
.top nav a {
  padding: 4px 11px; border-radius: 999px; text-decoration: none;
  background: rgba(255,255,255,0.09); color: #E4E4E7; font-size: 12px;
}
.top .orph { margin: 10px 0 0; font-size: 12px; color: #71717A; }
.ref { padding: 44px 40px 8px; }
.refhead { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
.refhead h2 { margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; }
.sysname { margin: 0; color: #52525B; }
.swatches { display: flex; gap: 3px; }
.swatches i { width: 17px; height: 17px; border-radius: 4px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12); }
.decklink { margin-left: auto; color: #17171A; font-weight: 500; }
.pat { background: #FFF; border-radius: 14px; padding: 22px 24px; margin: 0 0 18px; }
.pat h3 { margin: 0; font-size: 17px; font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.pat .meta { margin: 3px 0 8px; font-size: 12px; color: #71717A; }
.pat .intent { margin: 0 0 18px; max-width: 88ch; color: #3F3F46; }
/* La scène réserve la hauteur APRÈS mise à l'échelle : « transform » ne modifie pas le flux,
   et sans cette réserve les vignettes se chevaucheraient. */
/* « overflow-x: auto » et jamais « hidden » : un fragment plus large que la colonne se fait
   défiler, il ne se fait pas couper. Un rognage silencieux fait croire à un défaut de
   composition qui n'existe pas. */
.stage { overflow-x: auto; overflow-y: hidden; border-radius: 10px; padding: 18px; }
.pat details { margin-top: 16px; }
.pat summary { cursor: pointer; font-size: 13px; color: #71717A; }
.pat pre {
  margin: 10px 0 0; padding: 14px; overflow: auto; max-height: 420px;
  background: #17171A; color: #E4E4E7; border-radius: 10px;
  font: 400 12px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace;
}
@media (prefers-color-scheme: dark) {
  body { background: #101012; color: #ECECEE; }
  .pat { background: #1A1A1D; }
  .sysname, .pat .intent { color: #A1A1AA; }
  .decklink { color: #ECECEE; }
}
</style>
</head>
<body>

<header class="top">
  <h1>visual-lab — ${patterns.length} patterns vivants, ${byRef.size} chartes</h1>
  <p>Les fragments sont rendus TELS QUELS : ce que vous voyez est ce que vous collerez. Chaque vignette porte les tokens de sa charte ; « le code » déplie le fichier livré.</p>
  <nav>${nav}</nav>
  ${orphelines.length ? `<p class="orph">Chartes encore sans pattern extrait : ${orphelines.map(esc).join(' · ')}</p>` : ''}
</header>

${sections}

</body>
</html>
`;

const out = join(ROOT, 'gallery.html');
writeFileSync(out, html);
console.log(`✓ ${out}  (${patterns.length} pattern(s), ${byRef.size} référence(s))`);
console.log(`   open gallery.html   — c'est la page de contrôle : du HTML vivant, jamais une image.`);
