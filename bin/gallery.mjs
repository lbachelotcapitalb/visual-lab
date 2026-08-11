#!/usr/bin/env node
// LA VITRINE : une page HTML unique, autonome et hors-ligne, qui montre toute la
// bibliothèque VIVANTE — les fragments rendus tels quels, filtrables, avec leur code à copier.
//
//   node bin/gallery.mjs                      → gallery.html (tout)
//   node bin/gallery.mjs ref-17 ref-18        → filtré sur des références
//   node bin/gallery.mjs --family card        → filtré sur une famille
//
// POURQUOI PAS UN PNG. Une planche-contact en image est une COPIE MORTE : elle périme au
// premier changement de fragment, on ne peut ni zoomer sans bouillie, ni inspecter le DOM,
// ni copier le code, ni voir le vrai rendu des polices — et elle pèse du binaire dans un
// dépôt qui n'en accepte pas. Ici on rend les fragments EUX-MÊMES : ce qu'on regarde est
// exactement ce qu'on collera ailleurs. Le PNG reste un instrument de mesure interne
// (bin/render.mjs, proofs/, gitignoré, supprimé en fin de lot) ; il ne se livre jamais.
//
// Chaque vignette porte les tokens de SA référence en style inline sur son propre conteneur :
// c'est ce qui permet à quinze chartes qui emploient les mêmes noms --vl-* de cohabiter dans
// une seule page sans se contaminer. Un :root global ne saurait pas faire ça.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, DIRS, loadPatterns, loadSystems, frameOf, mediaOf, splitFragment, FAMILIES } from './lib.mjs';

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf('--' + n); return i === -1 ? null : argv[i + 1]; };
const family = flag('family');
const refsArg = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));

const systems = new Map(loadSystems().map((s) => [s.id, s]));
let patterns = loadPatterns();
if (family) patterns = patterns.filter((p) => p.family === family);
if (refsArg.length) patterns = patterns.filter((p) => refsArg.some((r) => p.ref.startsWith(r)));
if (!patterns.length) { console.error('Aucun pattern à montrer.'); process.exit(1); }

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const tokensOf = (refId) => Object.entries(systems.get(refId)?.tokens || {})
  .map(([k, v]) => k + ':' + v).join(';');
const rootBlockOf = (refId) => ':root {\n' + Object.entries(systems.get(refId)?.tokens || {})
  .map(([k, v]) => '  ' + k + ': ' + v + ';').join('\n') + '\n}';

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
const refIds = [...byRef.keys()].sort();
const orphelines = [...systems.keys()].filter((id) => !byRef.has(id)).sort();

const CARD_W = 620;   // largeur utile d'une vignette : le fragment y est mis à l'échelle

/* ─────────────────────────── LA CARTE D'UN PATTERN ─────────────────────────── */
const patCard = (p) => {
  const file = join(DIRS.patterns, p.id + '.html');
  if (!existsSync(file)) return '';
  const raw = readFileSync(file, 'utf8');
  const { markup, css } = splitFragment(raw);
  // Un pattern sans geometry.frame n'est pas mis à l'échelle du tout : mieux vaut une vignette
  // qui déborde et qu'on fait défiler qu'une vignette réduite au hasard d'une valeur de repli —
  // c'est cette valeur de repli qui rognait sept patterns en silence.
  const declared = Array.isArray(p.geometry?.frame) && p.geometry.frame.length === 2;
  const [fw, fh] = frameOf(p);
  const k = declared ? Math.min(1, CARD_W / fw) : 1;
  const media = mediaOf(p);
  const hay = [p.id, p.family, p.name, p.intent, p.when_to_use, p.avoid_when, (p.tags || []).join(' '), p.ref]
    .join(' ').toLowerCase();

  return `
<article class="pat" data-family="${attr(p.family)}" data-media="${attr(media.join(' '))}"
         data-ref="${attr(p.ref)}" data-hay="${attr(hay)}" id="p-${attr(p.id)}">
  <header class="pat__head">
    <h3><a href="#p-${attr(p.id)}">${esc(p.id)}</a></h3>
    <p class="meta">${esc(p.family)} · ${esc(media.join(' '))} · ${p.benchmarks?.length || 0} benchmarks · ${declared ? fw + '×' + fh : 'cadre non déclaré'}</p>
    <p class="intent">${esc(p.intent)}</p>
    <div class="acts">
      <button class="copy" data-target="src-${attr(p.id)}">copier le fragment</button>
      <button class="copy" data-target="tok-${attr(p.id)}">copier les tokens</button>
    </div>
  </header>
  <!-- Le fragment RÉEL, réduit par « zoom » et NON par « transform ». La différence n'est pas
       cosmétique : « transform » ne modifie pas le flux, il faut donc lui réserver une hauteur
       calculée à la main — et tout pattern sans geometry.frame se retrouve rogné ou noyé dans
       du vide. « zoom » reflue : le parent prend la hauteur réelle du fragment. -->
  <div class="stage" style="background:${attr(groundOf(p.ref))}">
    <div class="scaler" style="zoom:${k.toFixed(4)};${attr(tokensOf(p.ref))}">
      ${markup}
    </div>
  </div>
  <div class="rules">
    <p><b>Employer quand</b> — ${esc(p.when_to_use)}</p>
    <p><b>Éviter quand</b> — ${esc(p.avoid_when)}</p>
  </div>
  <details>
    <summary>le code — patterns/${esc(p.id)}.html</summary>
    <pre id="src-${attr(p.id)}"><code>${esc(raw.trim())}</code></pre>
  </details>
  <details>
    <summary>les tokens de ${esc(p.ref)} — systems/${esc(p.ref)}.json</summary>
    <pre id="tok-${attr(p.id)}"><code>${esc(rootBlockOf(p.ref))}</code></pre>
  </details>
  <style>${css}</style>
</article>`;
};

/* ─────────────────────────── LA CARTE DU CORPUS ───────────────────────────
   Une matrice références × familles. Ce n'est pas un ornement : c'est la seule vue qui montre
   les TROUS — quelle charte n'a pas encore de graphique, quelle famille n'existe que dans un
   seul système. Un catalogue en liste cache exactement cette information. */
const famsUsed = FAMILIES.filter((f) => patterns.some((p) => p.family === f));
const mapRows = refIds.map((refId) => {
  const ps = byRef.get(refId);
  const cells = famsUsed.map((f) => {
    const n = ps.filter((p) => p.family === f).length;
    return `<td class="${n ? 'has' : 'nil'}">${n ? `<button class="jump" data-ref="${attr(refId)}" data-family="${attr(f)}">${n}</button>` : '·'}</td>`;
  }).join('');
  return `<tr><th><a href="#${attr(refId)}">${esc(refId)}</a></th>${cells}<td class="tot">${ps.length}</td></tr>`;
}).join('\n');
const mapTotals = famsUsed.map((f) => `<td class="tot">${patterns.filter((p) => p.family === f).length}</td>`).join('');

const corpusMap = `
<section class="map" id="map">
  <h2>La carte du corpus</h2>
  <p class="lede">Références en ligne, familles en colonne. Les cases vides sont l'information utile : elles disent ce que la bibliothèque ne couvre pas encore. Cliquer un chiffre filtre la page.</p>
  <div class="maptable">
    <table>
      <thead><tr><th>référence</th>${famsUsed.map((f) => `<th>${esc(f)}</th>`).join('')}<th class="tot">total</th></tr></thead>
      <tbody>${mapRows}</tbody>
      <tfoot><tr><th>total</th>${mapTotals}<td class="tot">${patterns.length}</td></tr></tfoot>
    </table>
  </div>
  ${orphelines.length ? `<p class="orph">Chartes sans aucun pattern extrait : ${orphelines.map(esc).join(' · ')}</p>` : ''}
</section>`;

/* ─────────────────────────── LES SECTIONS ─────────────────────────── */
const sections = refIds.map((refId) => {
  const ps = byRef.get(refId);
  const sys = systems.get(refId);
  const deck = existsSync(join(DIRS.decks, refId + '.html')) ? 'decks/' + refId + '.html' : null;
  const swatches = Object.entries(sys?.tokens || {})
    .filter(([, v]) => /^#|^rgb/.test(String(v)))
    .map(([k, v]) => `<i title="${attr(k + ' ' + v)}" style="background:${attr(v)}"></i>`).join('');
  return `
<section class="ref" id="${attr(refId)}" data-ref="${attr(refId)}">
  <div class="refhead">
    <h2>${esc(refId)}</h2>
    <p class="sysname">${esc(sys?.name || '')}</p>
    <div class="swatches">${swatches}</div>
    ${deck ? `<a class="decklink" href="${deck}">voir l'écran entier →</a>` : ''}
  </div>
  ${ps.map(patCard).join('\n')}
</section>`;
}).join('\n');

/* ─────────────────────────── LE FILTRE (JS de page) ───────────────────────────
   Aucune dépendance, aucun réseau : la page doit s'ouvrir en file:// sur une machine où rien
   n'est installé. Le filtre travaille sur des attributs data-*, pas sur un index JSON dupliqué —
   une seule source de vérité dans le DOM, rien à resynchroniser. */
const PAGE_JS = String.raw`
(function () {
  var q = document.getElementById('q');
  var chips = [].slice.call(document.querySelectorAll('.chip'));
  var pats = [].slice.call(document.querySelectorAll('.pat'));
  var refs = [].slice.call(document.querySelectorAll('.ref'));
  var count = document.getElementById('count');

  function active(kind) {
    return chips.filter(function (c) { return c.dataset.kind === kind && c.classList.contains('on'); })
                .map(function (c) { return c.dataset.value; });
  }
  function apply() {
    var text = (q.value || '').trim().toLowerCase();
    var fams = active('family'), meds = active('media');
    var shown = 0;
    pats.forEach(function (p) {
      var ok = (!text || p.dataset.hay.indexOf(text) !== -1)
        && (!fams.length || fams.indexOf(p.dataset.family) !== -1)
        && (!meds.length || meds.some(function (m) { return p.dataset.media.split(' ').indexOf(m) !== -1; }));
      p.hidden = !ok;
      if (ok) shown++;
    });
    // Une section dont tous les patterns sont masqués disparaît AUSSI : laisser son en-tête
    // seul ferait croire à une charte vide, ce qui est l'inverse de l'information.
    refs.forEach(function (s) {
      s.hidden = ![].slice.call(s.querySelectorAll('.pat')).some(function (p) { return !p.hidden; });
    });
    count.textContent = shown + ' / ' + pats.length;
    document.body.classList.toggle('filtered', shown !== pats.length);
  }
  q.addEventListener('input', apply);
  chips.forEach(function (c) {
    c.addEventListener('click', function () { c.classList.toggle('on'); apply(); });
  });
  document.getElementById('reset').addEventListener('click', function () {
    q.value = ''; chips.forEach(function (c) { c.classList.remove('on'); }); apply();
  });
  [].slice.call(document.querySelectorAll('.jump')).forEach(function (b) {
    b.addEventListener('click', function () {
      q.value = '';
      chips.forEach(function (c) {
        c.classList.toggle('on', c.dataset.kind === 'family' && c.dataset.value === b.dataset.family);
      });
      apply();
      var t = document.getElementById(b.dataset.ref);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  [].slice.call(document.querySelectorAll('.copy')).forEach(function (b) {
    b.addEventListener('click', function () {
      var src = document.getElementById(b.dataset.target);
      if (!src) return;
      var txt = src.textContent;
      var done = function () {
        var o = b.getAttribute('data-label') || b.textContent;
        b.setAttribute('data-label', o);
        b.textContent = 'copié ✓';
        setTimeout(function () { b.textContent = o; }, 1400);
      };
      // navigator.clipboard exige un contexte sécurisé : en file:// il n'existe pas, et un
      // bouton muet passerait pour un bouton cassé. On retombe sur execCommand.
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { b.textContent = 'copie refusée'; }
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, fallback);
      else fallback();
    });
  });
  apply();
})();
`;

const chipRow = (kind, values) => values
  .map((v) => `<button class="chip" data-kind="${attr(kind)}" data-value="${attr(v)}">${esc(v)}</button>`).join('');

const mediaUsed = ['slide', 'web', 'email', 'print', 'social']
  .filter((m) => patterns.some((p) => mediaOf(p).includes(m)));

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
:root { color-scheme: light dark; --g-bg:#F4F4F5; --g-fg:#17171A; --g-card:#FFF; --g-mut:#71717A; --g-line:#E4E4E7; }
@media (prefers-color-scheme: dark) {
  :root { --g-bg:#101012; --g-fg:#ECECEE; --g-card:#1A1A1D; --g-mut:#A1A1AA; --g-line:#2A2A2E; }
}
* { box-sizing: border-box; }
body { margin:0; padding:0 0 80px; background:var(--g-bg); color:var(--g-fg);
  font:400 15px/1.5 Inter,-apple-system,"Helvetica Neue",Arial,sans-serif; }
a { color: inherit; }

.top { position:sticky; top:0; z-index:20; background:#17171A; color:#FAFAFA; padding:16px 40px 14px; }
.top h1 { margin:0 0 3px; font-size:19px; font-weight:600; letter-spacing:-0.01em; }
.top .lede { margin:0 0 12px; font-size:13px; color:#A1A1AA; max-width:96ch; }
.bar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
#q { flex:0 0 320px; height:34px; padding:0 14px; border-radius:999px; border:0;
  background:rgba(255,255,255,0.1); color:#FAFAFA; font:inherit; font-size:13px; }
#q::placeholder { color:#8A8A93; }
.chip { border:0; cursor:pointer; padding:5px 12px; border-radius:999px; font:inherit; font-size:12px;
  background:rgba(255,255,255,0.09); color:#E4E4E7; }
.chip.on { background:#FAFAFA; color:#17171A; font-weight:600; }
#reset { border:0; cursor:pointer; background:none; color:#A1A1AA; font:inherit; font-size:12px; text-decoration:underline; }
#count { margin-left:auto; font-size:12px; color:#A1A1AA; font-variant-numeric:tabular-nums; }
.sep { width:1px; height:18px; background:rgba(255,255,255,0.16); }

.map { padding:36px 40px 0; }
.map h2 { margin:0 0 6px; font-size:22px; font-weight:600; letter-spacing:-0.02em; }
.map .lede { margin:0 0 16px; color:var(--g-mut); max-width:92ch; }
.maptable { overflow-x:auto; }
.map table { border-collapse:collapse; font-size:13px; background:var(--g-card); border-radius:12px; overflow:hidden; }
.map th, .map td { padding:8px 14px; text-align:center; border-bottom:1px solid var(--g-line); white-space:nowrap; }
.map thead th { font-weight:600; color:var(--g-mut); font-size:12px; }
.map tbody th, .map tfoot th { text-align:left; font-weight:500; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
.map td.nil { color:var(--g-line); }
.map td.tot, .map th.tot { font-weight:600; }
.map .jump { border:0; cursor:pointer; background:none; font:inherit; font-weight:600; color:inherit; text-decoration:underline; }
.map .orph { margin:12px 0 0; font-size:13px; color:var(--g-mut); }
body.filtered .map { display:none; }

.ref { padding:40px 40px 8px; }
.ref[hidden] { display:none; }
.refhead { display:flex; align-items:baseline; gap:16px; flex-wrap:wrap; margin-bottom:20px; }
.refhead h2 { margin:0; font-size:25px; font-weight:600; letter-spacing:-0.02em; }
.sysname { margin:0; color:var(--g-mut); }
.swatches { display:flex; gap:3px; }
.swatches i { width:17px; height:17px; border-radius:4px; box-shadow:inset 0 0 0 1px rgba(128,128,128,0.28); }
.decklink { margin-left:auto; font-weight:500; }

.pat { background:var(--g-card); border-radius:14px; padding:22px 24px; margin:0 0 18px; }
.pat[hidden] { display:none; }
.pat h3 { margin:0; font-size:17px; font-weight:600; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
.pat h3 a { text-decoration:none; }
.pat .meta { margin:3px 0 8px; font-size:12px; color:var(--g-mut); }
.pat .intent { margin:0 0 12px; max-width:88ch; }
.acts { display:flex; gap:8px; margin-bottom:16px; }
.copy { border:1px solid var(--g-line); background:none; color:inherit; cursor:pointer;
  padding:5px 12px; border-radius:999px; font:inherit; font-size:12px; }
/* « overflow-x: auto » et jamais « hidden » : un fragment plus large que la colonne se fait
   défiler, il ne se fait pas couper. Un rognage silencieux fait croire à un défaut de
   composition qui n'existe pas. */
.stage { overflow-x:auto; overflow-y:hidden; border-radius:10px; padding:18px; }
.rules { margin:14px 0 0; font-size:13px; color:var(--g-mut); max-width:100ch; }
.rules p { margin:0 0 4px; }
.rules b { color:var(--g-fg); font-weight:600; }
.pat details { margin-top:10px; }
.pat summary { cursor:pointer; font-size:13px; color:var(--g-mut); }
.pat pre { margin:10px 0 0; padding:14px; overflow:auto; max-height:420px;
  background:#17171A; color:#E4E4E7; border-radius:10px;
  font:400 12px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace; }
</style>
</head>
<body>

<header class="top">
  <h1>visual-lab — ${patterns.length} patterns vivants, ${byRef.size} chartes</h1>
  <p class="lede">Les fragments sont rendus TELS QUELS : ce que vous voyez est ce que vous collerez. Chaque vignette porte les tokens de sa charte, ses conditions d'emploi et son code à copier. Pour un agent : <code>AGENTS.md</code> puis <code>index.json</code>.</p>
  <div class="bar">
    <input id="q" type="search" placeholder="chercher : kpi, timeline, nuage, heatmap…" autocomplete="off">
    <span class="sep"></span>
    ${chipRow('family', famsUsed)}
    <span class="sep"></span>
    ${chipRow('media', mediaUsed)}
    <button id="reset">tout afficher</button>
    <span id="count"></span>
  </div>
</header>

${corpusMap}
${sections}

<script>${PAGE_JS}</script>
</body>
</html>
`;

const out = join(ROOT, 'gallery.html');
writeFileSync(out, html);
console.log('✓ ' + out + '  (' + patterns.length + ' pattern(s), ' + byRef.size + ' référence(s))');
console.log("   open gallery.html   — la page de contrôle : du HTML vivant, jamais une image.");
