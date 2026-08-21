#!/usr/bin/env node
// bin/site.mjs — LA BIBLIOTHÈQUE EN LIGNE : génère `site/`, un site statique complet.
//
//   node bin/site.mjs                 → site/ (accueil, une page par pattern, chartes, contribuer)
//   node bin/site.mjs --no-zip        → saute la fabrication des archives (build rapide)
//   node bin/site.mjs --out /tmp/x    → ailleurs que dans site/
//
// POURQUOI PAS DE BASE DE DONNÉES. La source de vérité est `patterns/*.json` + `.html`, dans
// git. 57 patterns tiennent dans un index JSON de quelques dizaines de kilo-octets : la
// recherche se fait donc DANS LE NAVIGATEUR, sans requête, sans serveur, sans schéma à
// migrer. Une base n'apporterait de la valeur que le jour où des inconnus écriraient
// directement dedans — et ce jour-là il faudrait de la modération, pas du SQL. La
// contribution passe par une pull request : le dépôt EST le formulaire.
//
// POURQUOI DES IFRAMES. La vitrine locale (gallery.html) empile les fragments dans une seule
// page ; trois classes CSS sur 471 sont partagées par deux patterns et se contaminent en
// silence. Ici chaque rendu vit dans son propre document (`srcdoc`) : isolation totale, le
// fragment s'affiche exactement comme il s'affichera chez celui qui le colle, et le style du
// site ne peut pas déteindre dessus (ni l'inverse).
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import {
  ROOT, DIRS, loadPatterns, loadSystems, mediaOf, FAMILIES, MEDIA, CHROME,
} from './lib.mjs';
import { manifestes, cacheDe, lireIndex } from './harvest.mjs';

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf('--' + n); return i === -1 ? null : argv[i + 1]; };
const has = (n) => argv.includes('--' + n);
const OUT = flag('out') ? (flag('out').startsWith('/') ? flag('out') : join(process.cwd(), flag('out'))) : join(ROOT, 'site');
const MAKE_ZIP = !has('no-zip');

const REPO = 'https://github.com/lbachelotcapitalb/visual-lab';
const SITE_URL = 'https://visual.capitalb.fr';

/* ───────────────────────────── données ───────────────────────────── */

const systems = new Map(loadSystems().map((s) => [s.id, s]));
const patterns = loadPatterns().sort((a, b) => a.id.localeCompare(b.id));
if (!patterns.length) { console.error('Aucun pattern.'); process.exit(1); }

/* ─────────────── LE RAYON EXTÉRIEUR ───────────────
   Des bibliothèques tierces, déclarées dans `sources/*.json`, indexées par bin/harvest.mjs.
   Elles vivent à CÔTÉ du canon, jamais dedans : un élément tiers n'a ni intention déclarée,
   ni conditions d'emploi, ni benchmarks — l'appeler « pattern » viderait le mot. Une source
   dont le cache local est absent est simplement sautée : le site se construit quand même, et
   le dit. */
const sources = manifestes()
  .map((m) => ({ m, idx: lireIndex(m), cache: cacheDe(m) }))
  .filter((s) => s.idx && existsSync(s.cache));
const extTotal = sources.reduce((n, s) => n + s.idx.total, 0);

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
// srcdoc : l'attribut porte un document entier. Seuls & et " doivent fuir — laisser les
// chevrons intacts, sinon le fragment arrive au navigateur sous forme de texte.
const srcdoc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const tokensOf = (refId) => systems.get(refId)?.tokens || {};
const rootBlockOf = (refId) => ':root {\n' + Object.entries(tokensOf(refId))
  .map(([k, v]) => '  ' + k + ': ' + v + ';').join('\n') + '\n}';

// LE SOL DU FRAGMENT — même règle que la vitrine : beaucoup de patterns n'ont pas de fond
// propre et comptent sur celui de leur charte. Sur un fond arbitraire, leur encre disparaît
// et le défaut est imputé au pattern au lieu de la page qui le montre.
/** LE SOCLE MINIMAL D'UN FRAGMENT. Les patterns comptent sur `box-sizing: border-box` — la
 *  vitrine locale le pose globalement, un document isolé non : sans lui, une carte annoncée
 *  430×340 en mesure 498×408 (ses marges intérieures s'ajoutent au lieu de rentrer dedans) et
 *  la vignette se rogne. Ce n'est pas un style du site, c'est la condition d'emploi du
 *  fragment — d'où sa présence AUSSI en tête du .css téléchargé et dans le LISEZ-MOI. */
const RESET = '*,*::before,*::after{box-sizing:border-box}';

const GROUND = ['--vl-page', '--vl-app', '--vl-bg', '--vl-board', '--vl-paper', '--vl-sheet', '--vl-veil', '--vl-card'];
const groundOf = (refId) => {
  const t = tokensOf(refId);
  for (const k of GROUND) if (t[k]) return t[k];
  return '#FFFFFF';
};

/* ─────────────── le cadre : déclaré, sinon MESURÉ (jamais deviné) ───────────────
   Une vignette mise à l'échelle d'après une valeur de repli est rognée ou noyée dans du
   vide, sans que rien ne le signale. Les 7 patterns sans `geometry.frame` sont donc mesurés
   pour de vrai, dans Chrome, une fois par build — et le résultat est mis en cache. */
/** Même canal que bin/check.mjs — la page calcule, dépose son résultat dans le DOM, Chrome le
 *  ramène — mais avec un budget de temps virtuel taillé pour 57 documents imbriqués. */
function dumpProbe(file) {
  const dom = execFileSync(CHROME,
    ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=20000',
     '--dump-dom', `file://${file}`],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  const m = dom.match(/<pre id="vl-out">([\s\S]*?)<\/pre>/);
  if (!m || !m[1].trim()) throw new Error('la page de mesure n\u2019a rien écrit');
  return JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
}

const CACHE = join(ROOT, '.site-frames.json');
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(36); };

/** Mesure la boîte RÉELLE d'un fragment, dans un vrai navigateur, une fois par version du
 *  fichier. On ne se fie pas à `geometry.frame` pour le rendu : ce champ est le CONTRAT du
 *  pattern (ce qu'il promet), pas forcément ce que son texte de démonstration occupe — une
 *  ligne de plus déborde d'une hauteur fixe sans que rien ne le dise, et la vignette la
 *  rognait en silence. `scrollWidth/scrollHeight` compte le débordement ; les rectangles des
 *  enfants rattrapent les cas où la racine est plus petite que ce qu'elle laisse dépasser. */
function measureFrames(list) {
  const todo = list.filter((p) => p.html && cache[p.id]?.k !== hash(p.html));
  if (!todo.length) return;
  const frames = todo.map((p) => {
    const doc = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="file://${join(ROOT, 'fonts/fonts.css')}">`
      + `<style>${RESET}html,body{margin:0;width:max-content}:root{${Object.entries(tokensOf(p.ref)).map(([k, v]) => k + ':' + v).join(';')}}</style>`
      + p.html;
    return `<iframe data-id="${attr(p.id)}" srcdoc="${srcdoc(doc)}" style="width:2600px;height:2600px;border:0"></iframe>`;
  }).join('');
  const probe = join(tmpdir(), `.vl-frames-${process.pid}.html`);
  writeFileSync(probe, `<!doctype html><meta charset="utf-8"><body style="margin:0;visibility:hidden">${frames}
<pre id="vl-out"></pre>
<script>
  function go() {
    var out = {};
    [].forEach.call(document.querySelectorAll('iframe'), function (f) {
      try {
        /* Surtout PAS documentElement : son scrollHeight vaut au moins la hauteur du
           cadre de mesure, et rendrait 2600 px pour une carte de 340. Le body, lui, se
           dimensionne sur son contenu — débordement des enfants compris. */
        var d = f.contentDocument;
        var w = d.body.scrollWidth, h = d.body.scrollHeight;
        [].forEach.call(d.body.children, function (el) {
          var b = el.getBoundingClientRect();
          w = Math.max(w, Math.ceil(b.right)); h = Math.max(h, Math.ceil(b.bottom));
        });
        out[f.dataset.id] = [Math.min(w, 2600) || 430, Math.min(h, 2600) || 340];
      } catch (e) { /* un fragment qui refuse de se mesurer garde son cadre déclaré */ }
    });
    document.getElementById('vl-out').textContent = JSON.stringify(out);
  }
  if (document.readyState === 'complete') go(); else addEventListener('load', go);
</script></body>`);
  try {
    const got = dumpProbe(probe);
    for (const p of todo) if (got[p.id]) cache[p.id] = { box: got[p.id], k: hash(p.html) };
    writeFileSync(CACHE, JSON.stringify(cache, null, 1));
    console.log(`   ${todo.length} fragment(s) mesuré(s) dans Chrome → .site-frames.json`);
  } catch (e) {
    console.warn(`   ⚠ mesure impossible (${e.message}) — repli sur le cadre déclaré`);
  } finally {
    try { rmSync(probe); } catch {}
  }
}

const declared = (p) => Array.isArray(p.geometry?.frame) && p.geometry.frame.length === 2;
measureFrames(patterns);
/** Ce qu'on RÉSERVE à l'écran : la mesure si on l'a, le contrat sinon. */
const frameOfPattern = (p) => cache[p.id]?.box || (declared(p) ? p.geometry.frame : [430, 340]);
/** Ce qu'on AFFICHE comme cadre : le contrat quand il existe — c'est lui qui engage le pattern. */
const labelFrame = (p) => (declared(p) ? p.geometry.frame : frameOfPattern(p));

/* ───────────────────────────── le rendu isolé ───────────────────────────── */

/** Le document autonome d'un pattern du canon — le fragment, ses jetons, son sol, et le même
 *  script de contenance que le rayon extérieur. Il sert la page « Collections », qui doit
 *  pouvoir rendre côte à côte un pattern d'ici et un élément tiers sans savoir lequel est
 *  lequel : une collection mélange les deux par nature, et deux mécaniques de rendu
 *  différentes dans une même grille, c'est deux fois plus de choses à casser. */
const fragDoc = (p) => `<!doctype html><meta charset="utf-8">
<title>${attr(p.id)} — visual-lab</title>
<link rel="stylesheet" href="../fonts/fonts.css">
<style>
  ${RESET}
  html,body{margin:0;height:100%;overflow:hidden;background:${attr(groundOf(p.ref))}}
  :root{${Object.entries(tokensOf(p.ref)).map(([k, v]) => k + ':' + v).join(';')}}
  #vl-f{position:absolute;top:50%;left:50%;width:max-content;height:max-content;
    transform:translate(-50%,-50%);transform-origin:center center}
</style>
<script>
  addEventListener('load', function () {
    var w = document.getElementById('vl-f'), r = w.getBoundingClientRect();
    var k = Math.min(1, (innerWidth - 18) / Math.max(1, r.width), (innerHeight - 18) / Math.max(1, r.height));
    w.style.transform = 'translate(-50%,-50%) scale(' + k.toFixed(3) + ')';
  });
</script>
<div id="vl-f">${p.html || ''}</div>
`;

/** Les deux boutons de rangement, posés sur chaque vignette. Ils portent avec eux TOUT ce
 *  qu'il faut pour reconstituer la carte ailleurs (titre, rendu, fiche, origine) : la page
 *  « Collections » n'a alors aucun index à charger ni à tenir à jour, et un élément rangé
 *  survit à sa disparition du catalogue. */
const rangement = (o) => `<button class="ic js-fav" type="button" aria-pressed="false"
    title="Mettre en favori" data-id="${attr(o.id)}" data-t="${attr(o.titre)}" data-u="${attr(o.rendu)}" data-h="${attr(o.fiche)}" data-s="${attr(o.origine)}">
  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.6l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.9l5-.7z"/></svg>
</button><button class="ic js-col" type="button"
    title="Ajouter à une collection" data-id="${attr(o.id)}" data-t="${attr(o.titre)}" data-u="${attr(o.rendu)}" data-h="${attr(o.fiche)}" data-s="${attr(o.origine)}">
  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4.5v11M4.5 10h11"/></svg>
</button>`;

function stage(p, base, maxH) {
  const [w, h] = frameOfPattern(p);
  const doc = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="${base}fonts/fonts.css">` +
    `<style>${RESET}html,body{margin:0;width:max-content}:root{${Object.entries(tokensOf(p.ref)).map(([k, v]) => k + ':' + v).join(';')}}</style>` +
    p.html;
  return `<div class="stage" style="background:${attr(groundOf(p.ref))}" data-w="${w}" data-h="${h}"${maxH ? ` data-maxh="${maxH}"` : ''}>` +
    `<iframe loading="lazy" title="${attr(p.name)}" srcdoc="${srcdoc(doc)}" style="width:${w}px;height:${h}px"></iframe></div>`;
}

/* ───────────────────────────── le châssis de page ───────────────────────────── */

/** L'EMPREINTE DES ASSETS. Le vhost met une semaine de cache sur /assets/* — sans empreinte,
 *  un déploiement qui change le CSS n'atteint pas les navigateurs ayant déjà visité le site
 *  (mesuré : une règle corrigée toujours absente après rsync). On empreinte la SOURCE du
 *  générateur plutôt que le CSS lui-même : le CSS est déclaré plus bas dans ce fichier, et il
 *  n'existe pas encore quand la première page se construit. Sur-invalider quand le générateur
 *  change est sans conséquence ; sous-invalider laisse un site cassé chez le visiteur.
 */
const STAMP = (() => {
  let h = 5381;
  const src = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  for (let i = 0; i < src.length; i++) h = ((h * 33) ^ src.charCodeAt(i)) >>> 0;
  return h.toString(36);
})();

const shell = ({ title, desc, base, active, body, bodyClass = '' }) => `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${attr(desc)}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%23101014'/><rect x='7' y='7' width='8' height='8' fill='%23FFF'/><rect x='17' y='7' width='8' height='18' rx='4' fill='%231A57FF'/><rect x='7' y='17' width='8' height='8' rx='4' fill='%23FFF'/></svg>">
<link rel="stylesheet" href="${base}fonts/fonts.css">
<link rel="stylesheet" href="${base}assets/site.css?v=${STAMP}">
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Aller au contenu</a>
<header class="nav">
  <a class="brand" href="${base}index.html"><span class="brand__mark"></span>visual<span>-lab</span></a>
  <nav>
    <a href="${base}index.html"${active === 'patterns' ? ' class="on"' : ''}>Patterns</a>
    <a href="${base}chartes.html"${active === 'chartes' ? ' class="on"' : ''}>Chartes</a>
    <a href="${base}sources.html"${active === 'sources' ? ' class="on"' : ''}>Sources</a>
    <a href="${base}collections.html"${active === 'collections' ? ' class="on"' : ''}>Collections<span id="navcount" class="navcount" hidden></span></a>
    <a href="${base}contribuer.html"${active === 'contribuer' ? ' class="on"' : ''}>Contribuer</a>
    <a href="${REPO}" rel="noopener">GitHub&nbsp;↗</a>
  </nav>
  <button id="theme" class="theme" type="button" title="Clair / sombre" aria-label="Basculer le thème"></button>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <p><b>visual-lab</b> — bibliothèque de patterns visuels HTML/CSS, sous licence MIT. Les polices restent sous OFL, les images sources ne sont pas redistribuées (voir <a href="${REPO}/blob/main/NOTICE.md" rel="noopener">NOTICE.md</a>).</p>
  <p>Rien à installer, rien à importer : on copie un fragment, on le remplit, on le rend. <a href="${REPO}" rel="noopener">Le dépôt</a> · <a href="${base}api/index.json">index.json</a> · <a href="${base}contribuer.html">verser un pattern</a></p>
</footer>
<script src="${base}assets/site.js?v=${STAMP}"></script>
</body>
</html>
`;

/* ───────────────────────────── accueil ───────────────────────────── */

const famUsed = FAMILIES.filter((f) => patterns.some((p) => p.family === f));
const medUsed = MEDIA.filter((m) => patterns.some((p) => mediaOf(p).includes(m)));

// L'index de recherche : tout ce sur quoi on cherche, rien de plus. Le HTML des fragments
// n'y est PAS — chercher « div » ramènerait la bibliothèque entière.
const searchRows = patterns.map((p) => ({
  id: p.id,
  n: p.name,
  f: p.family,
  m: mediaOf(p),
  r: p.ref,
  t: p.tags || [],
  i: p.intent || '',
  w: p.when_to_use || '',
  b: (p.benchmarks || []).length,
}));

const card = (p) => {
  const media = mediaOf(p);
  const [w, h] = labelFrame(p);
  return `<article class="card" id="c-${attr(p.id)}" data-id="${attr(p.id)}" data-family="${attr(p.family)}" data-media="${attr(media.join(' '))}" data-ref="${attr(p.ref)}">
  <a class="card__stage" href="p/${attr(p.id)}.html" aria-label="Ouvrir ${attr(p.name)}">${stage(p, '', 250)}</a>
  <div class="card__body">
    <p class="card__id">${esc(p.id)}</p>
    <h3><a href="p/${attr(p.id)}.html">${esc(p.name)}</a></h3>
    <p class="card__intent">${esc(p.intent)}</p>
    <p class="card__tags">${(p.tags || []).slice(0, 6).map((t) => `<button class="tag" data-tag="${attr(t)}" type="button">${esc(t)}</button>`).join('')}</p>
  </div>
  <div class="card__foot">
    <span class="badge">${esc(p.family)}</span>
    <span class="badge badge--soft" title="cadre de référence">${w}×${h}</span>
    ${p.benchmarks?.length ? `<span class="badge badge--ok" title="assertions mesurables sur sa géométrie">${p.benchmarks.length} bench</span>` : ''}
    <span class="spacer"></span>
    ${rangement({ id: 'p:' + p.id, titre: p.name, rendu: '/frag/' + p.id + '.html', fiche: '/p/' + p.id + '.html', origine: 'visual-lab' })}
    <button class="btn btn--ghost js-copy" type="button" data-src="raw/${attr(p.id)}.html">Copier</button>
  </div>
</article>`;
};

const home = shell({
  title: 'visual-lab — bibliothèque de patterns visuels HTML/CSS',
  desc: `${patterns.length} compositions HTML/CSS autonomes, thémables et mesurées — cartes, graphiques, mises en page, titres. À chercher, à regarder vivantes, à copier.`,
  base: '',
  active: 'patterns',
  bodyClass: 'is-home',
  body: `
<section class="hero">
  <h1>Des compositions qui <em>marchent</em>, prêtes à coller.</h1>
  <p class="lede">${patterns.length} fragments HTML/CSS autonomes, reversés de ${systems.size} chartes réelles. Chacun porte son intention, ses conditions d'emploi et&nbsp;— c'est ce qui le rend rejouable&nbsp;— des assertions mesurables sur sa géométrie. Aucune dépendance, aucun framework&nbsp;: on copie, on remplit, on rend.</p>
  <div class="search">
    <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5 18 18"/></svg>
    <input id="q" type="search" placeholder="kpi, timeline, heatmap, chanfrein, bento, jauge…" autocomplete="off" spellcheck="false">
    <button id="clear" type="button" title="Effacer" hidden>×</button>
  </div>
  <div class="filters">
    <div class="chips" data-kind="family"><span class="chips__label">famille</span>${famUsed.map((f) => `<button class="chip" type="button" data-value="${attr(f)}">${esc(f)}<i>${patterns.filter((p) => p.family === f).length}</i></button>`).join('')}</div>
    <div class="chips" data-kind="media"><span class="chips__label">média</span>${medUsed.map((m) => `<button class="chip" type="button" data-value="${attr(m)}">${esc(m)}<i>${patterns.filter((p) => mediaOf(p).includes(m)).length}</i></button>`).join('')}</div>
    <div class="chips" data-kind="origine"><span class="chips__label">origine</span>
      <span class="chip chip--fixed on" title="les patterns contractuels de la bibliothèque">bibliothèque<i>${patterns.length}</i></span>
      ${extTotal ? `<button class="chip" id="ext" type="button" title="des bibliothèques libres, sans contrat — voir Sources">sources tierces<i>${extTotal}</i></button>` : ''}
    </div>
    <div class="chips chips--sel"><span class="chips__label">charte</span>
      <select id="ref"><option value="">toutes (${systems.size})</option>${[...systems.keys()].sort().map((r) => `<option value="${attr(r)}">${esc(r)}</option>`).join('')}</select>
      <button id="reset" class="link" type="button">tout afficher</button>
      <span id="count" class="count"></span>
    </div>
  </div>
</section>

<section class="grid" id="grid">
${patterns.map(card).join('\n')}
</section>
<section id="extwrap" hidden>
  <h2>Sources tierces</h2>
  <p class="lede">Des bibliothèques libres, indexées ici. <b>Sans contrat</b> — ni intention déclarée, ni conditions d'emploi, ni benchmarks. Crédit de l'auteur sous chaque vignette, lien vers l'original. <a href="sources.html">Le rayon entier →</a></p>
  <div class="grid" id="extgrid"></div>
  <p class="mut" id="extmore"></p>
</section>
<p class="empty" id="empty" hidden>Rien ne correspond. <button class="link" id="reset2" type="button">Tout afficher</button> — ou <a href="contribuer.html">versez le pattern manquant</a>.</p>

<script id="vl-search" type="application/json">${JSON.stringify(searchRows)}</script>
`,
});

/* ───────────────────────────── page d'un pattern ───────────────────────────── */

/** La borne d'un benchmark s'écrit de quatre façons dans le corpus — `expect`, `expect`+`tol`,
 *  `min`/`max`, ou une seule des deux bornes. N'afficher que `expect` laissait 429 assertions
 *  sur 500 avec une colonne « attendu » vide : le site sous-déclarait la rigueur du dépôt. */
function expected(b) {
  if (b.expect != null) return esc(b.expect) + (b.tol == null ? '' : ' ± ' + esc(b.tol));
  if (b.min != null && b.max != null) return esc(b.min) + ' → ' + esc(b.max);
  if (b.max != null) return '≤ ' + esc(b.max);
  if (b.min != null) return '≥ ' + esc(b.min);
  return '—';
}

const kv = (rows) => `<table class="kv"><tbody>${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</tbody></table>`;

function patternPage(p) {
  const media = mediaOf(p);
  const sys = systems.get(p.ref);
  const [w, h] = labelFrame(p);
  const raw = p.html || '';
  const tokens = rootBlockOf(p.ref);
  const near = patterns.filter((o) => o.id !== p.id && (o.family === p.family || o.ref === p.ref)).slice(0, 6);
  const deck = existsSync(join(DIRS.decks, p.ref + '.html')) ? `../decks/${p.ref}.html` : null;
  const swatches = Object.entries(tokensOf(p.ref)).filter(([, v]) => /^#|^rgb/.test(String(v)))
    .map(([k, v]) => `<i title="${attr(k + ' ' + v)}" style="background:${attr(v)}"></i>`).join('');

  return shell({
    title: `${p.name} — visual-lab`,
    desc: p.intent,
    base: '../',
    active: 'patterns',
    bodyClass: 'is-pattern',
    body: `
<nav class="crumb"><a href="../index.html">Patterns</a> <span>/</span> <a href="../index.html?family=${encodeURIComponent(p.family)}">${esc(p.family)}</a> <span>/</span> <b>${esc(p.id)}</b></nav>

<header class="phead">
  <div>
    <p class="phead__id">${esc(p.id)}</p>
    <h1>${esc(p.name)}</h1>
    <p class="lede">${esc(p.intent)}</p>
    <p class="badges"><span class="badge">${esc(p.family)}</span>${media.map((m) => `<span class="badge badge--soft">${esc(m)}</span>`).join('')}<span class="badge badge--soft">${w}×${h}px</span>${p.benchmarks?.length ? `<span class="badge badge--ok">${p.benchmarks.length} benchmarks</span>` : '<span class="badge badge--warn">aucun benchmark</span>'}</p>
  </div>
  <div class="acts">
    <button class="btn btn--primary js-copy" type="button" data-src="../raw/${attr(p.id)}.html">Copier le fragment</button>
    <button class="btn js-copy" type="button" data-src="../raw/${attr(p.ref)}.tokens.css">Copier les tokens</button>
    <a class="btn" href="../dl/${attr(p.id)}.zip" download>Télécharger le .zip</a>
    ${rangement({ id: 'p:' + p.id, titre: p.name, rendu: '/frag/' + p.id + '.html', fiche: '/p/' + p.id + '.html', origine: 'visual-lab' })}
  </div>
</header>

${stage(p, '../', 0)}
<p class="stagenote">Le fragment RÉEL, dans son propre document, sur le sol de sa charte — pas une image. Ce que vous voyez est exactement ce que vous collerez.</p>

<div class="cols">
  <section class="col">
    <h2>Employer quand</h2>
    <p>${esc(p.when_to_use)}</p>
    <h2>Éviter quand</h2>
    <p>${esc(p.avoid_when)}</p>
    ${p.notes ? `<h2>Notes</h2><p>${esc(p.notes)}</p>` : ''}
    <h2>Mots-clés</h2>
    <p class="card__tags">${(p.tags || []).map((t) => `<a class="tag" href="../index.html?q=${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</p>
  </section>
  <aside class="col col--side">
    <h2>La charte</h2>
    <div class="refbox">
      <p class="refbox__id"><a href="../chartes.html#${attr(p.ref)}">${esc(p.ref)}</a></p>
      <p class="refbox__name">${esc(sys?.name || '')}</p>
      <div class="swatches">${swatches}</div>
      ${deck ? `<p><a class="btn btn--ghost" href="${deck}">Voir l'écran entier ↗</a></p>` : ''}
    </div>
    ${(p.vars || []).length ? `<h2>Variables</h2>${kv((p.vars || []).map((v) => [`<code>${esc(v.name)}</code>`, `${esc(v.role)}<br><span class="mut">défaut : <code>${esc(v.default)}</code></span>`]))}` : ''}
    ${(p.slots || []).length ? `<h2>Emplacements</h2><p class="card__tags">${(p.slots || []).map((s) => `<span class="tag">${esc(s)}</span>`).join('')}</p>` : ''}
  </aside>
</div>

${(p.benchmarks || []).length ? `<section class="bench">
  <h2>Benchmarks — la géométrie, en assertions vérifiables</h2>
  <p class="mut">Rejouables par <code>node bin/check.mjs ${esc(p.id)}</code> : le pattern se prouve, il ne se croit pas.</p>
  <table class="tbl"><thead><tr><th>assertion</th><th>mesure</th><th>attendu</th></tr></thead><tbody>
  ${p.benchmarks.map((b) => `<tr><td>${esc(b.name)}${b.notes ? `<br><span class="mut">${esc(b.notes)}</span>` : ''}</td><td><code>${esc(b.measure)}</code></td><td class="num">${expected(b)}</td></tr>`).join('')}
  </tbody></table>
</section>` : ''}

<section class="code">
  <h2>Le code</h2>
  <div class="panel">
    <div class="panel__head"><span>fragment — <code>patterns/${esc(p.id)}.html</code></span>
      <span><button class="btn btn--ghost js-copy" type="button" data-src="../raw/${attr(p.id)}.html">Copier</button> <a class="btn btn--ghost" href="../raw/${attr(p.id)}.html" download>Télécharger</a></span></div>
    <pre><code>${esc(raw.trim())}</code></pre>
  </div>
  <div class="panel">
    <div class="panel__head"><span>tokens de la charte — <code>systems/${esc(p.ref)}.json</code></span>
      <span><button class="btn btn--ghost js-copy" type="button" data-src="../raw/${attr(p.ref)}.tokens.css">Copier</button> <a class="btn btn--ghost" href="../raw/${attr(p.ref)}.tokens.css" download>Télécharger</a></span></div>
    <pre><code>${esc(tokens)}</code></pre>
  </div>
  <details class="panel">
    <summary>les métadonnées — <code>patterns/${esc(p.id)}.json</code> <a href="../raw/${attr(p.id)}.json" download>(télécharger)</a></summary>
    <pre><code>${esc(JSON.stringify({ ...p, html: undefined, htmlPath: undefined }, (k, v) => (v === undefined ? undefined : v), 2))}</code></pre>
  </details>
</section>

${near.length ? `<section class="near">
  <h2>À côté</h2>
  <div class="grid grid--small">${near.map((o) => `<article class="card"><a class="card__stage" href="${attr(o.id)}.html">${stage(o, '../', 180)}</a><div class="card__body"><p class="card__id">${esc(o.id)}</p><h3><a href="${attr(o.id)}.html">${esc(o.name)}</a></h3></div></article>`).join('')}</div>
</section>` : ''}
`,
  });
}

/* ───────────────────────────── chartes ───────────────────────────── */

const byRef = new Map();
for (const p of patterns) { if (!byRef.has(p.ref)) byRef.set(p.ref, []); byRef.get(p.ref).push(p); }

const chartesPage = shell({
  title: 'Les chartes — visual-lab',
  desc: `Les ${systems.size} systèmes de couleurs et de typographie dont les patterns sont issus : jetons, palette, écran d'origine.`,
  base: '',
  active: 'chartes',
  body: `
<section class="hero hero--tight">
  <h1>Les chartes</h1>
  <p class="lede">Un pattern ne vit pas dans le vide : il porte les <b>jetons</b> de la charte dont il est issu. Copier un fragment sans son bloc <code>:root</code>, c'est copier un dessin sans ses couleurs. Les cases vides du tableau sont l'information utile — elles disent ce que la bibliothèque ne couvre pas encore.</p>
</section>

<section class="mapwrap">
  <table class="tbl tbl--map">
    <thead><tr><th>charte</th>${famUsed.map((f) => `<th>${esc(f)}</th>`).join('')}<th class="num">total</th></tr></thead>
    <tbody>${[...byRef.keys()].sort().map((r) => `<tr><th><a href="#${attr(r)}"><code>${esc(r)}</code></a></th>${famUsed.map((f) => {
      const n = byRef.get(r).filter((p) => p.family === f).length;
      return `<td class="num${n ? '' : ' nil'}">${n ? `<a href="index.html?family=${encodeURIComponent(f)}&ref=${encodeURIComponent(r)}">${n}</a>` : '·'}</td>`;
    }).join('')}<td class="num b">${byRef.get(r).length}</td></tr>`).join('')}</tbody>
    <tfoot><tr><th>total</th>${famUsed.map((f) => `<td class="num b">${patterns.filter((p) => p.family === f).length}</td>`).join('')}<td class="num b">${patterns.length}</td></tr></tfoot>
  </table>
  ${[...systems.keys()].filter((id) => !byRef.has(id)).length ? `<p class="mut">Chartes sans aucun pattern extrait : ${[...systems.keys()].filter((id) => !byRef.has(id)).sort().map((s) => `<code>${esc(s)}</code>`).join(' · ')}</p>` : ''}
</section>

${[...byRef.keys()].sort().map((r) => {
    const sys = systems.get(r);
    const deck = existsSync(join(DIRS.decks, r + '.html')) ? `decks/${r}.html` : null;
    return `<section class="charte" id="${attr(r)}">
  <div class="charte__head">
    <div><p class="card__id">${esc(r)}</p><h2>${esc(sys?.name || r)}</h2></div>
    ${deck ? `<a class="btn btn--ghost" href="${deck}">Voir l'écran entier ↗</a>` : ''}
  </div>
  <div class="swatches swatches--big">${Object.entries(tokensOf(r)).filter(([, v]) => /^#|^rgb/.test(String(v))).map(([k, v]) => `<figure><i style="background:${attr(v)}"></i><figcaption><code>${esc(k)}</code><br><span class="mut">${esc(v)}</span></figcaption></figure>`).join('')}</div>
  <p class="charte__pats">${byRef.get(r).map((p) => `<a class="tag" href="p/${attr(p.id)}.html">${esc(p.id)}</a>`).join('')}</p>
  <p><button class="btn btn--ghost js-copy" type="button" data-src="raw/${attr(r)}.tokens.css">Copier le bloc :root</button> <a class="btn btn--ghost" href="raw/${attr(r)}.tokens.css" download>Télécharger .css</a></p>
</section>`;
  }).join('\n')}
`,
});

/* ───────────────────────────── contribuer ───────────────────────────── */

const gabarit = JSON.stringify({
  name: 'Nom court, en français, de ce que la composition FAIT',
  family: 'card',
  ref: 'ref-20-ma-charte',
  media: ['slide', 'web'],
  intent: 'Une phrase : le problème de composition que ce pattern résout.',
  when_to_use: 'Les conditions concrètes où on le prend.',
  avoid_when: 'Les conditions où il est le mauvais choix — cette ligne vaut la précédente.',
  tags: ['carte', 'chiffre', 'preuve'],
  vars: [{ name: '--vl-accent', role: 'aplat d\'accent', default: '#E8342A' }],
  slots: ['title', 'figure', 'body'],
  geometry: { root: '.vl-mon-pattern', frame: [430, 340] },
  benchmarks: [{ name: 'le chiffre fait ~5× le micro-libellé', measure: "size('.vl-x__figure') / size('.vl-x__kicker')", expect: 5, tol: 0.6 }],
}, null, 2);

const contribuerPage = shell({
  title: 'Contribuer — visual-lab',
  desc: 'Comment verser un pattern dans la bibliothèque : par formulaire sans cloner, ou par pull request. Le contrat, la nomenclature, le contrôle automatique.',
  base: '',
  active: 'contribuer',
  body: `
<section class="hero hero--tight">
  <h1>Verser un pattern</h1>
  <p class="lede">Deux portes, la même bibliothèque&nbsp;: un <b>formulaire</b> si vous ne voulez pas cloner, une <b>pull request</b> si git ne vous fait pas peur. Dans les deux cas un contrôle automatique répond dans la minute, champ par champ, et vous êtes crédité dans le pattern. Licence MIT.</p>
  <p class="acts"><a class="btn btn--primary" href="${REPO}/issues/new?template=pattern.yml" rel="noopener">Remplir le formulaire ↗</a> <a class="btn" href="${REPO}/fork" rel="noopener">Forker le dépôt ↗</a></p>
</section>

<section class="steps">
  <h2 class="col-h2">Sans git — le formulaire</h2>
  <ol>
    <li><b>Remplissez le formulaire.</b> Identifiant, famille, intention, conditions d'emploi, mots-clés, et le fragment HTML avec son <code>&lt;style&gt;</code>. Rien à installer.</li>
    <li><b>Un robot contrôle</b> dans la minute et commente ce qui manque&nbsp;: identifiant déjà pris, script ou image interdits, couleurs en dur, <code>avoid_when</code> trop court. Vous modifiez l'issue, le contrôle se rejoue.</li>
    <li><b>Un mainteneur répond <code>/accepter</code></b>&nbsp;: les fichiers sont écrits, l'index régénéré, et une pull request s'ouvre <b>à votre nom</b>. Elle se referme sur votre issue à la fusion.</li>
  </ol>
</section>

<section class="steps">
  <h2 class="col-h2">Avec git — la pull request</h2>
  <ol>
    <li><b>Forkez et clonez.</b> <code>gh repo fork lbachelotcapitalb/visual-lab --clone</code></li>
    <li><b>Écrivez le fragment</b> dans <code>patterns/&lt;famille&gt;-&lt;NN&gt;-&lt;slug&gt;.html</code>. Autonome&nbsp;: son CSS voyage dans un <code>&lt;style&gt;</code> à l'intérieur du fichier, ses couleurs passent par des variables <code>--vl-*</code>, jamais par des valeurs en dur. Aucun script, aucune police distante, aucune image.</li>
    <li><b>Écrivez le contrat</b> dans le <code>.json</code> du même nom (gabarit ci-dessous). <code>avoid_when</code> vaut <code>when_to_use</code>&nbsp;: un pattern qu'on ne sait pas refuser ne sert à rien.</li>
    <li><b>Régénérez et vérifiez.</b> <code>node bin/index.mjs &amp;&amp; node bin/check.mjs &lt;id&gt;</code> — l'index se reconstruit, les benchmarks se rejouent dans un vrai navigateur.</li>
    <li><b>Ouvrez la pull request.</b> Une pull request = un pattern (ou une charte + ses patterns). Décrivez ce que la composition résout, pas à quoi elle ressemble.</li>
  </ol>
  <p class="acts"><a class="btn" href="${REPO}/compare" rel="noopener">Ouvrir une pull request ↗</a></p>
</section>

<div class="cols">
  <section class="col">
    <h2>La nomenclature</h2>
    <p>Le nom de fichier porte la famille&nbsp;: <code>card-12-inverted-kpi-row</code> est de famille <code>card</code>, et l'index le vérifie. Le vocabulaire est <b>fermé</b> — huit familles, pas neuf&nbsp;:</p>
    <p class="card__tags">${FAMILIES.map((f) => `<span class="tag">${esc(f)}</span>`).join('')}</p>
    <p class="mut"><code>diagram</code> ≠ <code>chart</code>&nbsp;: un <code>chart</code> porte des <b>données</b> (une valeur mesurée décide de la géométrie), un <code>diagram</code> porte une <b>structure</b> (couches, flux, appartenance) où rien n'est proportionnel à quoi que ce soit.</p>
    <h2>Les médias</h2>
    <p>Un pattern déclare où il est censé servir&nbsp;— c'est une <b>intention</b>, la faisabilité se prouve par <code>bin/emit.mjs --target &lt;média&gt;</code>, qui refuse ce que la cible ne sait pas rendre&nbsp;:</p>
    <p class="card__tags">${MEDIA.map((m) => `<span class="tag">${esc(m)}</span>`).join('')}</p>
    <h2>Ce qui fait refuser une contribution</h2>
    <table class="tbl"><tbody>
      <tr><td>une couleur en dur au lieu d'un <code>--vl-*</code></td><td>le fragment ne se thème plus</td></tr>
      <tr><td>une police ou une image distante</td><td>zéro requête sortante est un invariant</td></tr>
      <tr><td>du JavaScript dans le fragment</td><td>un pattern est une composition, pas un composant</td></tr>
      <tr><td>un <code>avoid_when</code> vide ou décoratif</td><td>sans lui le catalogue ne route plus</td></tr>
      <tr><td>un binaire (PNG, capture)</td><td>une image est une copie morte, elle périme en silence</td></tr>
    </tbody></table>
  </section>
  <aside class="col col--side">
    <h2>Le gabarit JSON</h2>
    <div class="panel">
      <div class="panel__head"><span><code>patterns/&lt;id&gt;.json</code></span><button class="btn btn--ghost js-copy-text" type="button">Copier</button></div>
      <pre><code>${esc(gabarit)}</code></pre>
    </div>
    <h2>À lire avant</h2>
    <p><a href="${REPO}/blob/main/AGENTS.md" rel="noopener">AGENTS.md</a> — comment consommer la bibliothèque (court, machine-facing).<br>
    <a href="${REPO}/blob/main/DOCTRINE.md" rel="noopener">DOCTRINE.md</a> — les lois de mise en page, tous médias.<br>
    <a href="${REPO}/blob/main/README.md" rel="noopener">README.md</a> — le contrat d'un pattern, en détail.<br>
    <a href="${REPO}/blob/main/NOTICE.md" rel="noopener">NOTICE.md</a> — ce que le MIT ne couvre pas.</p>
  </aside>
</div>
`,
});

/* ───────────────────────────── CSS du site ─────────────────────────────
   Le site est le CADRE, pas le contenu : il ne doit jamais avoir l'air plus fort que ce
   qu'il montre. D'où un chrome quasi monochrome, un seul accent, et des fragments posés sur
   leur propre sol. Les jetons vivent sur :root, le sombre les redéfinit — aucune couleur
   n'est écrite en dur ailleurs, sinon elle ne bascule pas. */
const CSS = `/* GÉNÉRÉ par bin/site.mjs — ne pas éditer à la main. */
:root{
  --bg:#FAFAFA; --surface:#FFFFFF; --sunk:#F2F2F4; --ink:#0E0E12; --mut:#6C6C78;
  --line:#E5E5EA; --line-strong:#D3D3DA; --accent:#1A57FF; --accent-ink:#FFFFFF;
  --ok:#0E7A4A; --warn:#9A5B00; --code-bg:#14141A; --code-ink:#E7E7EC;
  --r:14px; --shadow:0 1px 2px rgba(16,16,24,.05), 0 8px 24px -16px rgba(16,16,24,.22);
  --ui:"Inter",-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;
  --title:"Archivo","Inter",-apple-system,Helvetica,Arial,sans-serif;
  --mono:"DM Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  color-scheme:light;
}
html[data-theme="dark"]{
  --bg:#0B0B0E; --surface:#141418; --sunk:#1B1B21; --ink:#F2F2F5; --mut:#9A9AA6;
  --line:#26262D; --line-strong:#35353E; --accent:#6E93FF; --accent-ink:#0B0B0E;
  --ok:#4ED08C; --warn:#E0A33E; --code-bg:#000; --code-ink:#DCDCE4;
  --shadow:0 1px 2px rgba(0,0,0,.5), 0 8px 24px -16px rgba(0,0,0,.8);
  color-scheme:dark;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:400 15px/1.6 var(--ui);
  font-feature-settings:"cv05" 1,"ss01" 1;}
a{color:inherit}
h1,h2,h3{font-family:var(--title);letter-spacing:-.022em;font-weight:650;margin:0}
code{font-family:var(--mono);font-size:.88em}
.mut{color:var(--mut)}
.num{text-align:right;font-variant-numeric:tabular-nums}
.b{font-weight:650}
.skip{position:absolute;left:-9999px}
.skip:focus{left:12px;top:12px;z-index:99;background:var(--accent);color:var(--accent-ink);padding:8px 14px;border-radius:8px}

/* ── barre de navigation ── */
.nav{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:24px;
  padding:0 clamp(16px,4vw,44px);height:58px;background:color-mix(in srgb,var(--bg) 88%,transparent);
  backdrop-filter:saturate(1.6) blur(12px);border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:9px;font-family:var(--title);font-weight:700;
  font-size:16px;letter-spacing:-.03em;text-decoration:none}
.brand span{color:var(--mut)}
.brand__mark{width:16px;height:16px;border-radius:4px;background:var(--accent);
  box-shadow:inset 0 0 0 4px var(--bg)}
.nav nav{display:flex;gap:20px;margin-left:auto;font-size:14px}
.nav nav a{text-decoration:none;color:var(--mut);padding:4px 0;border-bottom:1.5px solid transparent}
.nav nav a:hover{color:var(--ink)}
.nav nav a.on{color:var(--ink);border-color:var(--accent)}
.theme{width:30px;height:30px;border-radius:8px;border:1px solid var(--line);background:var(--surface);
  cursor:pointer;position:relative}
.theme::after{content:"";position:absolute;inset:8px;border-radius:50%;background:var(--ink);
  box-shadow:inset -4px -3px 0 0 var(--surface)}
html[data-theme="dark"] .theme::after{box-shadow:none;background:var(--ink)}

main{padding:0 clamp(16px,4vw,44px) 72px;max-width:1600px;margin:0 auto}
/* Sous 680 px la barre ne tient plus sur une ligne : elle passe à deux plutôt que de
   pousser la page en défilement horizontal — un site de bibliothèque visuelle qui déborde
   à l'horizontale se disqualifie tout seul. */
@media (max-width:680px){
  .nav{height:auto;flex-wrap:wrap;gap:8px;padding:10px 16px}
  .nav nav{order:3;width:100%;margin-left:0;gap:16px;font-size:13.5px;overflow-x:auto;
    scrollbar-width:none;padding-bottom:2px}
  .nav nav::-webkit-scrollbar{display:none}
  .theme{margin-left:auto}
  .chips__label{width:100%}
  #ref{max-width:100%}
}


/* ── accroche + recherche ── */
.hero{padding:clamp(36px,6vw,72px) 0 28px;max-width:74ch}
.hero--tight{padding-bottom:12px}
.hero h1{font-size:clamp(30px,4.6vw,50px);line-height:1.04;letter-spacing:-.035em}
.hero h1 em{font-family:"Newsreader",Georgia,serif;font-style:italic;font-weight:300;letter-spacing:-.01em}
.lede{margin:14px 0 0;color:var(--mut);font-size:clamp(15px,1.5vw,17px);max-width:70ch}
.search{position:relative;display:flex;align-items:center;margin:26px 0 0;max-width:620px}
.search svg{position:absolute;left:16px;width:18px;height:18px;fill:none;stroke:var(--mut);stroke-width:1.8;stroke-linecap:round}
#q{width:100%;height:50px;padding:0 44px;border-radius:999px;border:1px solid var(--line-strong);
  background:var(--surface);color:var(--ink);font:inherit;font-size:16px;box-shadow:var(--shadow)}
#q:focus{outline:2px solid var(--accent);outline-offset:1px;border-color:transparent}
#clear{position:absolute;right:8px;width:32px;height:32px;border:0;border-radius:50%;cursor:pointer;
  background:var(--sunk);color:var(--mut);font-size:19px;line-height:1}

.filters{display:flex;flex-direction:column;gap:8px;margin:22px 0 0}
.chips{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.chips__label{width:62px;flex:none;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
.chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line-strong);cursor:pointer;
  padding:5px 12px;border-radius:999px;font:inherit;font-size:13px;background:var(--surface);color:var(--ink)}
.chip i{font-style:normal;font-size:11px;color:var(--mut);font-variant-numeric:tabular-nums}
.chip:hover{border-color:var(--ink)}
.chip.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.chip.on i{color:var(--bg);opacity:.6}
#ref{height:30px;border-radius:999px;border:1px solid var(--line-strong);background:var(--surface);
  color:var(--ink);font:inherit;font-size:13px;padding:0 10px;max-width:280px}
.link{border:0;background:none;color:var(--mut);cursor:pointer;font:inherit;font-size:13px;text-decoration:underline;padding:0}
.count{margin-left:auto;font-size:13px;color:var(--mut);font-variant-numeric:tabular-nums}

/* ── grille ── */
.grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));margin:12px 0 0}
.grid--small{grid-template-columns:repeat(auto-fill,minmax(230px,1fr));margin-top:14px}
.card{display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--line);
  border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow)}
.card[hidden]{display:none}
.card__stage{display:block;text-decoration:none}
.stage{position:relative;overflow:hidden}
.stage iframe{position:absolute;left:50%;top:50%;transform-origin:center center;border:0;display:block;pointer-events:none}
.is-pattern > main > .stage{border-radius:var(--r);border:1px solid var(--line);padding:0;margin-top:8px}
.card__body{padding:14px 16px 4px;flex:1}
.card__id{margin:0;font-family:var(--mono);font-size:11.5px;color:var(--mut);letter-spacing:-.01em}
.card__body h3{margin:3px 0 6px;font-size:16px;line-height:1.25}
.card__body h3 a{text-decoration:none}
.card__body h3 a:hover{text-decoration:underline;text-decoration-color:var(--accent)}
.card__intent{margin:0;font-size:13.5px;color:var(--mut);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.card__tags{display:flex;flex-wrap:wrap;gap:5px;margin:10px 0 0}
.card__body .card__tags{flex-wrap:nowrap;overflow:hidden;
  -webkit-mask-image:linear-gradient(to right,#000 86%,transparent);mask-image:linear-gradient(to right,#000 86%,transparent)}
.tag{display:inline-block;padding:2px 8px;border-radius:6px;background:var(--sunk);color:var(--mut);
  font-size:11.5px;border:0;cursor:pointer;font-family:var(--ui);text-decoration:none}
.tag:hover{background:var(--ink);color:var(--bg)}
.card__foot{display:flex;align-items:center;gap:6px;flex-wrap:nowrap;overflow:hidden;padding:11px 14px;border-top:1px solid var(--line);margin-top:12px}
.spacer{flex:1}
.badge{display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;letter-spacing:.02em;
  background:var(--ink);color:var(--bg);font-family:var(--mono)}
.badge--soft{background:var(--sunk);color:var(--mut)}
.badge--ok{background:color-mix(in srgb,var(--ok) 16%,transparent);color:var(--ok)}
.badge--warn{background:color-mix(in srgb,var(--warn) 16%,transparent);color:var(--warn)}
.empty{padding:60px 0;text-align:center;color:var(--mut)}

.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:9px;
  border:1px solid var(--line-strong);background:var(--surface);color:var(--ink);
  font:inherit;font-size:13px;cursor:pointer;text-decoration:none;white-space:nowrap}
.btn:hover{border-color:var(--ink)}
.btn--primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.btn--primary:hover{filter:brightness(1.08)}
.btn--ghost{border-color:transparent;background:var(--sunk);color:var(--mut);padding:5px 10px;font-size:12.5px}
.btn--ghost:hover{color:var(--ink);border-color:transparent;background:var(--line)}

/* ── page d'un pattern ── */
.crumb{padding:22px 0 0;font-size:13px;color:var(--mut)}
.crumb a{text-decoration:none}.crumb a:hover{text-decoration:underline}
.crumb b{color:var(--ink);font-family:var(--mono);font-weight:400}
.crumb span{opacity:.5;margin:0 4px}
.phead{display:flex;gap:28px;align-items:flex-end;flex-wrap:wrap;padding:18px 0 20px}
.phead > div:first-child{flex:1 1 480px}
.phead__id{margin:0;font-family:var(--mono);font-size:13px;color:var(--mut)}
.phead h1{font-size:clamp(26px,3.4vw,38px);line-height:1.08;margin:4px 0 0}
.badges{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0 0}
.acts{display:flex;gap:8px;flex-wrap:wrap}
.stagenote{margin:10px 0 34px;font-size:13px;color:var(--mut)}
.cols{display:grid;gap:38px;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);align-items:start}
@media (max-width:900px){.cols{grid-template-columns:1fr}}
.col h2{font-size:15px;letter-spacing:.02em;text-transform:uppercase;color:var(--mut);margin:26px 0 8px;font-weight:600}
.col h2:first-child{margin-top:0}
.col p{margin:0;max-width:72ch}
.refbox{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px}
.refbox__id{margin:0;font-family:var(--mono);font-size:12.5px}
.refbox__name{margin:2px 0 12px;font-weight:600}
.swatches{display:flex;gap:4px;flex-wrap:wrap}
.swatches i{width:22px;height:22px;border-radius:5px;box-shadow:inset 0 0 0 1px rgba(128,128,128,.3)}
.swatches--big{gap:14px;margin:14px 0}
.swatches--big figure{margin:0;width:118px}
.swatches--big i{display:block;width:100%;height:52px;border-radius:8px}
.swatches--big figcaption{font-size:11px;color:var(--mut);margin-top:5px;line-height:1.35;word-break:break-all}
.kv{width:100%;border-collapse:collapse;font-size:13.5px}
.kv th{text-align:left;font-weight:400;padding:8px 12px 8px 0;vertical-align:top;white-space:nowrap;border-bottom:1px solid var(--line)}
.kv td{padding:8px 0;vertical-align:top;color:var(--mut);border-bottom:1px solid var(--line)}

.tbl{width:100%;border-collapse:collapse;font-size:13.5px;margin:10px 0 0;background:var(--surface);
  border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
.tbl th,.tbl td{padding:9px 14px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}
.tbl thead th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);font-weight:600}
.tbl tbody tr:last-child td{border-bottom:0}
.bench,.code,.near{margin-top:44px}
.bench h2,.code h2,.near h2{font-size:20px}
.bench p{margin:6px 0 0}

.panel{margin:14px 0 0;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
.panel__head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
  padding:9px 14px;font-size:12.5px;color:var(--mut);border-bottom:1px solid var(--line)}
.panel summary{padding:11px 14px;cursor:pointer;font-size:12.5px;color:var(--mut)}
.panel pre{margin:0;padding:16px;overflow:auto;max-height:520px;background:var(--code-bg);color:var(--code-ink);
  font:400 12.5px/1.6 var(--mono)}

/* ── chartes ── */
.mapwrap{overflow-x:auto;margin:8px 0 40px}
.tbl--map th a{text-decoration:none}
.tbl--map td.nil{color:var(--line-strong)}
.tbl--map td a{text-decoration:none;font-weight:650}
.charte{padding:28px 0;border-top:1px solid var(--line);scroll-margin-top:70px}
.charte__head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap}
.charte__head h2{font-size:24px;margin-top:2px}
.charte__pats{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0 14px}
.charte__pats .tag{font-family:var(--mono);font-size:11.5px}

/* ── contribuer ── */
.steps .col-h2{font-size:15px;letter-spacing:.02em;text-transform:uppercase;color:var(--mut);font-weight:600;margin:0 0 4px}
.steps ol{margin:14px 0 0;padding-left:22px;max-width:82ch}
.steps li{margin:0 0 12px;color:var(--mut)}
.steps li b{color:var(--ink)}
.steps .acts{margin:24px 0 8px}
.steps{margin-bottom:40px}

/* ── le rayon extérieur ── */
.licence{margin:14px 0 0;padding:12px 14px;border-radius:10px;background:var(--sur-warn,color-mix(in srgb,var(--warn) 9%,transparent));
  border:1px solid color-mix(in srgb,var(--warn) 26%,transparent);color:var(--mut);font-size:13px;max-width:96ch}
.licence b{color:var(--ink)}
.grid--cats{grid-template-columns:repeat(auto-fill,minmax(170px,1fr));margin-top:22px}
.catcard{display:flex;align-items:baseline;justify-content:space-between;gap:10px;text-decoration:none;
  background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:15px 17px;box-shadow:var(--shadow)}
.catcard:hover{border-color:var(--ink)}
.catcard span{color:var(--mut);font-variant-numeric:tabular-nums;font-size:13px}
.grid--src{grid-template-columns:repeat(auto-fill,minmax(310px,1fr));margin-top:22px}
.srccard{display:block;text-decoration:none;background:var(--surface);border:1px solid var(--line);
  border-radius:var(--r);padding:20px 22px;box-shadow:var(--shadow)}
.srccard:hover{border-color:var(--ink)}
.srccard b{font-family:var(--title);font-size:19px;letter-spacing:-.02em}
.srccard .badges{margin:9px 0 0}
.srccard p{margin:11px 0 0;color:var(--mut);font-size:13.5px}
/* Le rayon extérieur n'utilise PAS la mécanique de .stage : là c'est la page hôte qui
   met le fragment à l'échelle, ici c'est le document tiers qui se contient lui-même (on n'a
   pas le droit de le mesurer depuis dehors — l'iframe est sandboxée, donc opaque). D'où une
   classe à part : sans elle, l'iframe garde sa taille par défaut de 300×150 et l'élément se
   colle en haut à gauche d'une cellule trois fois trop grande. */
.st{position:relative;overflow:hidden;display:block}
.st iframe{width:100%;height:100%;border:0;display:block}
.st--ext{height:210px;background:var(--ext-sol,#111116)}
body.solclair .st--ext{--ext-sol:#F2F2F5}
.card--ext .card__foot{margin-top:0;font-size:11.5px}
.card--ext .card__foot b{font-weight:600}
.search--sm{max-width:420px;margin-top:18px}
.search--sm #qx{width:100%;height:40px;padding:0 40px;border-radius:999px;border:1px solid var(--line-strong);
  background:var(--surface);color:var(--ink);font:inherit;font-size:14px}
.search--sm svg{position:absolute;left:14px;width:16px;height:16px;fill:none;stroke:var(--mut);stroke-width:1.8;stroke-linecap:round}
#extwrap{margin-top:40px;padding-top:26px;border-top:1px solid var(--line)}
#extwrap h2{font-size:20px}
#extwrap .lede{margin:6px 0 16px;font-size:13.5px}

/* ── rangement : favoris et collections ── */
.ic{width:27px;height:27px;flex:none;display:inline-flex;align-items:center;justify-content:center;
  border:1px solid var(--line);background:var(--surface);border-radius:8px;cursor:pointer;padding:0;color:var(--mut)}
.ic svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linejoin:round;stroke-linecap:round}
.ic:hover{border-color:var(--ink);color:var(--ink)}
.ic.on{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.js-fav.on svg{fill:currentColor}
.navcount{display:inline-block;min-width:17px;padding:0 5px;margin-left:5px;border-radius:999px;
  background:var(--accent);color:var(--accent-ink);font-size:10.5px;line-height:16px;text-align:center;
  font-variant-numeric:tabular-nums;vertical-align:1px}

.colmenu{position:absolute;z-index:60;min-width:210px;max-height:320px;overflow:auto;
  background:var(--surface);border:1px solid var(--line-strong);border-radius:12px;padding:6px;
  box-shadow:0 10px 40px -12px rgba(0,0,0,.35)}
.colmenu__t{margin:4px 8px 6px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.colmenu__vide{margin:4px 8px 8px;font-size:13px;color:var(--mut)}
.colmenu button{display:flex;width:100%;align-items:center;gap:8px;border:0;background:none;color:var(--ink);
  font:inherit;font-size:13.5px;text-align:left;padding:7px 9px;border-radius:8px;cursor:pointer}
.colmenu button:hover{background:var(--sunk)}
.colmenu button i{margin-left:auto;font-style:normal;font-size:11px;color:var(--mut);font-variant-numeric:tabular-nums}
.colmenu__new{border-top:1px solid var(--line)!important;margin-top:4px;border-radius:0 0 8px 8px!important;color:var(--accent)!important}

#vl-toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,14px);z-index:80;
  display:flex;align-items:center;gap:12px;padding:11px 18px;border-radius:999px;
  background:var(--ink);color:var(--bg);font-size:13.5px;box-shadow:0 10px 36px -12px rgba(0,0,0,.5);
  opacity:0;pointer-events:none;transition:opacity .16s,transform .16s}
#vl-toast.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}
#vl-toast button{border:0;background:none;color:var(--bg);font:inherit;font-size:13px;
  text-decoration:underline;cursor:pointer;padding:0;opacity:.85}

.col-groupe{margin:34px 0 0}
.col-tete{display:flex;align-items:baseline;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:6px}
.col-tete h2{font-size:21px}
.is-cols .card__foot b{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.foot{border-top:1px solid var(--line);padding:28px clamp(16px,4vw,44px) 60px;color:var(--mut);font-size:13px}
.foot p{margin:0 0 6px;max-width:100ch}
`;

/* ───────────────────────────── JS du site ─────────────────────────────
   Zéro dépendance, zéro requête. La recherche travaille sur un index inline : à 57 patterns,
   filtrer le DOM est instantané et le résultat est PARTAGEABLE — l'état vit dans l'URL. */
const JS = String.raw`/* GÉNÉRÉ par bin/site.mjs — ne pas éditer à la main. */
(function () {
  /* ── thème : la préférence vit dans localStorage, jamais ailleurs ── */
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('vl-theme'); } catch (e) {}
  if (saved) root.setAttribute('data-theme', saved);
  else if (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) root.setAttribute('data-theme', 'dark');
  var tbtn = document.getElementById('theme');
  if (tbtn) tbtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('vl-theme', next); } catch (e) {}
  });

  /* ── mise à l'échelle des rendus ────────────────────────────────────────
     Le fragment vit dans un iframe à sa taille RÉELLE ; c'est le conteneur qui le réduit.
     On mesure la largeur disponible au lieu de la deviner : une échelle figée au build
     rognerait la vignette dès que la grille change de colonnes. */
  function fit(st) {
    var f = st.querySelector('iframe'); if (!f) return;
    var w = +st.dataset.w, h = +st.dataset.h, maxh = +st.dataset.maxh || 0;
    var avail = st.clientWidth || st.parentElement.clientWidth;
    if (!avail) return;
    /* CONTENIR, jamais rogner : une composition amputée dans une vignette se lit comme un
       défaut de composition. On tient dans la largeur ET dans la hauteur allouée, et le vide
       qui reste est centré — c'est la règle d'une planche-contact. */
    var k = maxh ? Math.min(avail / w, maxh / h) : Math.min(avail / w, 1);
    f.style.transform = 'translate(-50%,-50%) scale(' + k.toFixed(4) + ')';
    st.style.height = (maxh ? maxh : Math.ceil(h * k)) + 'px';
  }
  var stages = [].slice.call(document.querySelectorAll('.stage'));
  stages.forEach(fit);
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function (es) { es.forEach(function (e) { fit(e.target); }); });
    stages.forEach(function (s) { ro.observe(s); });
  } else {
    addEventListener('resize', function () { stages.forEach(fit); });
  }

/* ═══════════════ LE RANGEMENT — favoris et collections ═══════════════
     Où vit l'état : dans CE navigateur, nulle part ailleurs. Pas de compte à créer, pas de
     serveur à tenir, rien qui parte sur le réseau. Le prix est assumé et écrit sur la page :
     ça ne suit pas d'un appareil à l'autre, et un nettoyage du navigateur efface tout — d'où
     l'export, qui n'est pas un bonus mais le filet.

     Ce qu'on range : pas un identifiant, mais TOUT ce qu'il faut pour redessiner la carte
     (titre, URL du rendu, fiche, origine). Sinon la page « Collections » devrait charger les
     index de la bibliothèque ET de chaque source pour afficher trois vignettes — et un
     élément retiré d'un catalogue disparaîtrait des collections de tout le monde. */
  var CLE = 'visual-lab:collections';
  function lire() {
    try {
      var d = JSON.parse(localStorage.getItem(CLE) || '{}');
      return { v: 1, fav: d.fav || [], cols: d.cols || {}, meta: d.meta || {} };
    } catch (e) { return { v: 1, fav: [], cols: {}, meta: {} }; }
  }
  function ecrire(d) {
    try { localStorage.setItem(CLE, JSON.stringify(d)); } catch (e) { toast('Stockage plein ou refusé.'); }
    majBoutons(); majBadge();
    if (typeof rendreCollections === 'function') rendreCollections();
  }
  function nb(d) {
    var n = d.fav.length;
    for (var k in d.cols) n += d.cols[k].length;
    return n;
  }
  function fiche(b) {
    return { id: b.dataset.id, t: b.dataset.t, u: b.dataset.u, h: b.dataset.h, s: b.dataset.s };
  }

  var minuteur;
  function toast(txt, action) {
    var t = document.getElementById('vl-toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'vl-toast'; document.body.appendChild(t);
    }
    t.innerHTML = '';
    t.appendChild(document.createTextNode(txt));
    if (action) {
      var a = document.createElement('button');
      a.type = 'button'; a.textContent = action.texte;
      a.addEventListener('click', function () { action.faire(); t.classList.remove('on'); });
      t.appendChild(a);
    }
    t.classList.add('on');
    clearTimeout(minuteur);
    minuteur = setTimeout(function () { t.classList.remove('on'); }, action ? 6000 : 2600);
  }

  function majBadge() {
    var b = document.getElementById('navcount');
    if (!b) return;
    var n = nb(lire());
    b.textContent = n; b.hidden = !n;
  }
  /* Un favori déjà posé doit se VOIR sans avoir à cliquer pour s'en souvenir : l'état de
     l'étoile est relu à chaque rendu, y compris sur les cartes créées après coup par la
     recherche du rayon extérieur. */
  function majBoutons() {
    var d = lire();
    [].forEach.call(document.querySelectorAll('.js-fav'), function (b) {
      var on = d.fav.indexOf(b.dataset.id) !== -1;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.title = on ? 'Retirer des favoris' : 'Mettre en favori';
    });
    [].forEach.call(document.querySelectorAll('.js-col'), function (b) {
      var dans = [];
      for (var k in d.cols) if (d.cols[k].indexOf(b.dataset.id) !== -1) dans.push(k);
      b.classList.toggle('on', dans.length > 0);
      b.title = dans.length ? 'Dans : ' + dans.join(', ') : 'Ajouter à une collection';
    });
  }

  function basculerFavori(b) {
    var d = lire(), f = fiche(b), i = d.fav.indexOf(f.id);
    if (i === -1) { d.fav.unshift(f.id); d.meta[f.id] = f; toast('Ajouté aux favoris'); }
    else {
      d.fav.splice(i, 1);
      toast('Retiré des favoris', { texte: 'annuler', faire: function () {
        var e = lire(); e.fav.unshift(f.id); e.meta[f.id] = f; ecrire(e);
      } });
    }
    ecrire(d);
  }

  /* Le menu du « + ». Un prompt() pour tout aurait été plus court, mais il oblige à retaper
     le nom d'une collection existante à chaque ajout — donc à en créer des doublons. */
  var menu;
  function fermerMenu() { if (menu) { menu.remove(); menu = null; } }
  document.addEventListener('click', function (ev) {
    if (menu && !menu.contains(ev.target) && !ev.target.closest('.js-col')) fermerMenu();
  });
  addEventListener('keydown', function (ev) { if (ev.key === 'Escape') fermerMenu(); });

  function ouvrirMenu(b) {
    fermerMenu();
    var d = lire(), f = fiche(b), noms = Object.keys(d.cols).sort();
    menu = document.createElement('div');
    menu.className = 'colmenu';
    menu.innerHTML = '<p class="colmenu__t">Ranger dans…</p>'
      + (noms.length ? noms.map(function (n) {
          var dedans = d.cols[n].indexOf(f.id) !== -1;
          return '<button type="button" data-n="' + n.replace(/"/g, '&quot;') + '"' + (dedans ? ' class="on"' : '') + '>'
            + (dedans ? '✓ ' : '') + n + '<i>' + d.cols[n].length + '</i></button>';
        }).join('') : '<p class="colmenu__vide">aucune collection</p>')
      + '<button type="button" class="colmenu__new">+ Nouvelle collection…</button>';
    document.body.appendChild(menu);

    var r = b.getBoundingClientRect();
    // Repositionné si ça déborde : un menu à moitié hors écran est un menu inutilisable, et
    // ces boutons vivent souvent tout en bas ou tout à droite d'une grille.
    menu.style.top = (r.bottom + scrollY + 6) + 'px';
    menu.style.left = Math.max(8, Math.min(r.left + scrollX, innerWidth - menu.offsetWidth - 12)) + 'px';
    if (r.bottom + menu.offsetHeight + 20 > innerHeight) {
      menu.style.top = (r.top + scrollY - menu.offsetHeight - 6) + 'px';
    }

    [].forEach.call(menu.querySelectorAll('button[data-n]'), function (x) {
      x.addEventListener('click', function () {
        var e = lire(), n = x.dataset.n, i = e.cols[n].indexOf(f.id);
        if (i === -1) { e.cols[n].push(f.id); e.meta[f.id] = f; toast('Rangé dans « ' + n + ' »'); }
        else { e.cols[n].splice(i, 1); toast('Retiré de « ' + n + ' »'); }
        ecrire(e); fermerMenu();
      });
    });
    menu.querySelector('.colmenu__new').addEventListener('click', function () {
      var n = (prompt('Nom de la collection') || '').trim();
      if (!n) return;
      var e = lire();
      if (!e.cols[n]) e.cols[n] = [];
      if (e.cols[n].indexOf(f.id) === -1) e.cols[n].push(f.id);
      e.meta[f.id] = f;
      ecrire(e); fermerMenu(); toast('Rangé dans « ' + n + ' »');
    });
  }

  /* Délégation : les vignettes du rayon extérieur sont créées APRÈS le chargement, par la
     recherche. Accrocher les écouteurs une fois pour toutes sur le document est la seule
     façon qu'elles fonctionnent aussi. */
  document.addEventListener('click', function (ev) {
    var f = ev.target.closest && ev.target.closest('.js-fav');
    if (f) { ev.preventDefault(); ev.stopPropagation(); basculerFavori(f); return; }
    var c = ev.target.closest && ev.target.closest('.js-col');
    if (c) { ev.preventDefault(); ev.stopPropagation(); ouvrirMenu(c); }
  });
  majBoutons(); majBadge();

  /* ── copier ── */
  function flash(b, txt) {
    var o = b.getAttribute('data-label') || b.textContent;
    b.setAttribute('data-label', o); b.textContent = txt;
    setTimeout(function () { b.textContent = o; }, 1500);
  }
  function put(b, txt) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(txt).then(function () { flash(b, 'copié ✓'); }, function () { flash(b, 'copie refusée'); });
      return;
    }
    var ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); flash(b, 'copié ✓'); } catch (e) { flash(b, 'copie refusée'); }
    document.body.removeChild(ta);
  }
  [].forEach.call(document.querySelectorAll('.js-copy'), function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      fetch(b.dataset.src).then(function (r) { return r.text(); })
        .then(function (t) { put(b, t); })
        .catch(function () { flash(b, 'indisponible'); });
    });
  });
  [].forEach.call(document.querySelectorAll('.js-copy-text'), function (b) {
    b.addEventListener('click', function () {
      var pre = b.closest('.panel').querySelector('pre');
      put(b, pre ? pre.textContent : '');
    });
  });

  /* ── page de catégorie du rayon : filtre local + bascule de sol ──
     Beaucoup d'éléments tiers sont dessinés pour un fond noir et deviennent invisibles sur du
     blanc (et l'inverse). Sans bascule, on jugerait « raté » ce qui est simplement montré sur
     le mauvais sol. */
  var qx = document.getElementById('qx');
  if (qx) {
    var xs = [].slice.call(document.querySelectorAll('.card--ext'));
    var nx = document.getElementById('nx');
    var applyX = function () {
      var t = norm(qx.value).trim(), k = 0;
      xs.forEach(function (c) {
        var ok = !t || norm(c.dataset.hay).indexOf(t) !== -1;
        c.hidden = !ok; if (ok) k++;
      });
      nx.textContent = k + ' / ' + xs.length;
    };
    qx.addEventListener('input', applyX);
    var sol = document.getElementById('sol');
    sol.addEventListener('click', function () {
      document.body.classList.toggle('solclair');
      sol.textContent = document.body.classList.contains('solclair') ? 'sol sombre' : 'sol clair';
      sol.classList.toggle('on');
    });
    applyX();
  }

/* ═══════════════ LA PAGE « MES COLLECTIONS » ═══════════════ */
  var listes = document.getElementById('listes');
  if (listes) {
    var vide = document.getElementById('vide');

    window.rendreCollections = function () {
      var d = lire();
      var groupes = [];
      if (d.fav.length) groupes.push({ nom: 'Favoris', cle: null, ids: d.fav });
      Object.keys(d.cols).sort().forEach(function (n) { groupes.push({ nom: n, cle: n, ids: d.cols[n] }); });

      vide.hidden = groupes.length > 0;
      listes.innerHTML = groupes.map(function (g) {
        var cartes = g.ids.map(function (id) {
          var m = d.meta[id];
          if (!m) return '';
          return '<article class="card card--ext" data-id="' + id + '">'
            + '<a class="card__stage" href="' + m.h + '"><div class="st st--ext">'
            + '<iframe loading="lazy" sandbox="allow-scripts" title="' + m.t + '" src="' + m.u + '"></iframe>'
            + '</div></a><footer class="card__foot"><b>' + m.t + '</b>'
            + '<span class="mut"> · ' + m.s + '</span><span class="spacer"></span>'
            + '<button class="btn btn--ghost js-retirer" type="button" data-id="' + id + '" data-col="'
            + (g.cle === null ? '' : String(g.cle).replace(/"/g, '&quot;')) + '">retirer</button></footer></article>';
        }).join('');
        return '<section class="col-groupe">'
          + '<div class="col-tete"><h2>' + g.nom + ' <span class="mut">· ' + g.ids.length + '</span></h2>'
          + (g.cle === null ? '' :
              '<span><button class="btn btn--ghost js-renommer" type="button" data-n="' + String(g.cle).replace(/"/g, '&quot;') + '">renommer</button> '
            + '<button class="btn btn--ghost js-suppr" type="button" data-n="' + String(g.cle).replace(/"/g, '&quot;') + '">supprimer</button></span>')
          + '</div><div class="grid">' + (cartes || '<p class="mut">Collection vide.</p>') + '</div></section>';
      }).join('');
      majBoutons();
    };

    listes.addEventListener('click', function (ev) {
      var t = ev.target.closest && ev.target.closest('button');
      if (!t) return;
      var d = lire();
      if (t.classList.contains('js-retirer')) {
        ev.preventDefault();
        var col = t.dataset.col, id = t.dataset.id;
        var arr = col ? d.cols[col] : d.fav;
        var i = arr.indexOf(id);
        if (i !== -1) arr.splice(i, 1);
        ecrire(d);
      } else if (t.classList.contains('js-renommer')) {
        var av = t.dataset.n, ap = (prompt('Nouveau nom', av) || '').trim();
        if (!ap || ap === av) return;
        // On FUSIONNE si le nom cible existe déjà, au lieu d'écraser : renommer « A » en « B »
        // quand B existe ne doit pas faire disparaître le contenu de B.
        d.cols[ap] = (d.cols[ap] || []).concat(d.cols[av].filter(function (x) { return (d.cols[ap] || []).indexOf(x) === -1; }));
        delete d.cols[av];
        ecrire(d);
      } else if (t.classList.contains('js-suppr')) {
        var n = t.dataset.n, sauv = d.cols[n].slice();
        delete d.cols[n];
        ecrire(d);
        toast('« ' + n + ' » supprimée', { texte: 'annuler', faire: function () {
          var e = lire(); e.cols[n] = sauv; ecrire(e);
        } });
      }
    });

    document.getElementById('nouvelle').addEventListener('click', function () {
      var n = (prompt('Nom de la collection') || '').trim();
      if (!n) return;
      var d = lire();
      if (d.cols[n]) return toast('Cette collection existe déjà.');
      d.cols[n] = []; ecrire(d);
    });

    document.getElementById('exporter').addEventListener('click', function () {
      var b = new Blob([JSON.stringify(lire(), null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'visual-lab-collections.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });

    document.getElementById('fichier').addEventListener('change', function (ev) {
      var f = ev.target.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var e = JSON.parse(r.result);
          if (!e || typeof e !== 'object' || !('fav' in e) && !('cols' in e)) throw 0;
          // FUSION, jamais remplacement : importer sur un autre appareil ne doit pas effacer
          // ce qui y est déjà rangé — c'est précisément le geste qu'on ne peut pas annuler.
          var d = lire();
          (e.fav || []).forEach(function (id) { if (d.fav.indexOf(id) === -1) d.fav.push(id); });
          Object.keys(e.cols || {}).forEach(function (n) {
            d.cols[n] = d.cols[n] || [];
            e.cols[n].forEach(function (id) { if (d.cols[n].indexOf(id) === -1) d.cols[n].push(id); });
          });
          Object.assign(d.meta, e.meta || {});
          ecrire(d);
          toast('Importé et fusionné avec ce qui était déjà là.');
        } catch (x) { toast('Fichier illisible — attendu : un export de cette page.'); }
        ev.target.value = '';
      };
      r.readAsText(f);
    });

    document.getElementById('vider').addEventListener('click', function () {
      var d = lire();
      if (!nb(d)) return;
      var sauv = JSON.stringify(d);
      localStorage.removeItem(CLE);
      majBadge(); rendreCollections();
      toast('Tout effacé', { texte: 'annuler', faire: function () {
        localStorage.setItem(CLE, sauv); majBadge(); rendreCollections(); majBoutons();
      } });
    });

    rendreCollections();
  }

  /* ── recherche + filtres (accueil seulement) ── */
  var q = document.getElementById('q');
  if (!q) return;
  var data = JSON.parse(document.getElementById('vl-search').textContent);
  var byId = {}; data.forEach(function (d) { byId[d.id] = d; });
  var cards = [].slice.call(document.querySelectorAll('.card'));
  var grid = document.getElementById('grid');
  var count = document.getElementById('count');
  var empty = document.getElementById('empty');
  var refSel = document.getElementById('ref');
  var chips = [].slice.call(document.querySelectorAll('.chip[data-value]'));

  /* Sans accents et sans casse : « chanfrein » doit trouver « chanfreinée », et « KPI » « kpi ». */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""); }
  data.forEach(function (d) {
    d._id = norm(d.id); d._n = norm(d.n); d._t = norm(d.t.join(' '));
    d._i = norm(d.i + ' ' + d.w); d._r = norm(d.r);
  });

  /* Le score n'est pas cosmétique : il décide de l'ORDRE. Un mot trouvé dans l'identifiant ou
     le nom pèse plus qu'un mot noyé dans une phrase d'intention — sinon le pattern qui
     s'appelle « heatmap » se retrouve derrière trois patterns qui la mentionnent en passant.
     Tous les mots de la requête doivent matcher (ET), sur n'importe quel champ. */
  function score(d, words) {
    var total = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i], s = 0;
      if (d._id.indexOf(w) !== -1) s += d._id.split('-').indexOf(w) !== -1 ? 10 : 7;
      if (d._n.indexOf(w) !== -1) s += 6;
      if (d._t.indexOf(w) !== -1) s += d.t.some(function (t) { return norm(t) === w; }) ? 6 : 4;
      if (d._i.indexOf(w) !== -1) s += 2;
      if (d._r.indexOf(w) !== -1) s += 2;
      if (d.f === w) s += 5;
      if (!s) return 0;
      total += s;
    }
    return total + (d.b ? 0.5 : 0);
  }

  function active(kind) {
    return chips.filter(function (c) { return c.parentElement.dataset.kind === kind && c.classList.contains('on'); })
                .map(function (c) { return c.dataset.value; });
  }

/* ── le rayon extérieur, cherché à la demande ──────────────────────────────
     3 330 entrées ne sont pas embarquées dans l'accueil : elles seraient payées par chaque
     visiteur, y compris ceux qui ne cherchent que dans le canon. L'index n'arrive que si on
     l'ouvre — et une fois seulement. Le canon reste AU-DESSUS, toujours : c'est lui qui
     porte un contrat, et l'ordre d'une page est une affirmation sur ce qui compte. */
  var extBtn = document.getElementById('ext');
  var extWrap = document.getElementById('extwrap');
  var extGrid = document.getElementById('extgrid');
  var extMore = document.getElementById('extmore');
  var extData = null, extEnCours = false;
  var PLAFOND = 60;

  // Le même balisage que côté serveur — une seule définition, sinon les deux divergent et
  // seule la moitié des vignettes devient rangeable.
  function boutonsRangement(id, titre, rendu, fiche, origine) {
    var d = 'data-id="' + id + '" data-t="' + String(titre).replace(/"/g, '&quot;') + '" data-u="' + rendu + '" data-h="' + fiche + '" data-s="' + origine + '"';
    return '<button class="ic js-fav" type="button" aria-pressed="false" title="Mettre en favori" ' + d
      + '><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.6l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.9l5-.7z"/></svg></button>'
      + '<button class="ic js-col" type="button" title="Ajouter à une collection" ' + d
      + '><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4.5v11M4.5 10h11"/></svg></button>';
  }
  function extNom(id) {
    var s = (extData && extData.sources || []).filter(function (x) { return x.id === id; })[0];
    return s ? s.name : id;
  }

  function extRendu(words) {
    if (!extData) return;
    var out = [], n = 0;
    for (var i = 0; i < extData.els.length; i++) {
      var e = extData.els[i];                    // [source, cat, fichier, auteur, tags, nom]
      var hay = norm(e[3] + ' ' + e[4] + ' ' + e[5] + ' ' + e[2].replace(/[_.-]/g, ' '));
      var ok = true;
      for (var w = 0; w < words.length; w++) if (hay.indexOf(words[w]) === -1) { ok = false; break; }
      if (!ok) continue;
      n++;
      if (out.length >= PLAFOND) continue;
      var href = 'ext/' + e[0] + '/' + e[1] + '/' + e[2];
      out.push('<article class="card card--ext"><div class="st st--ext">'
        + '<iframe loading="lazy" sandbox="allow-scripts" title="' + e[3] + '" src="' + href + '"></iframe></div>'
        + '<footer class="card__foot"><b>@' + e[3] + '</b><span class="mut"> · ' + e[5] + '</span>'
        + '<span class="spacer"></span>'
        + boutonsRangement('x:' + e[0] + '/' + e[1] + '/' + e[2], e[2].replace(/^[^_]+_/, '').replace(/\.html$/, '') + ' · @' + e[3], '/' + href, '/s/' + e[0] + '/' + e[1] + '.html', extNom(e[0]))
        + '<a class="btn btn--ghost" href="' + href + '" download>code</a></footer></article>');
    }
    extGrid.innerHTML = out.join('');
    majBoutons();
    // Un plafond muet ferait croire à un corpus plus petit qu'il n'est : on dit ce qu'on coupe.
    extMore.textContent = n > PLAFOND
      ? (n - PLAFOND) + ' autres correspondances non affichées — affinez, ou ouvrez le rayon entier.'
      : (n ? '' : 'Aucune correspondance dans les sources tierces.');
  }

  function extApply(words) {
    if (!extBtn || !extBtn.classList.contains('on')) { extWrap.hidden = true; return; }
    extWrap.hidden = false;
    if (extData) return extRendu(words);
    if (extEnCours) return;
    extEnCours = true;
    extMore.textContent = 'chargement de l\'index des sources…';
    fetch('api/ext-index.json').then(function (r) { return r.json(); }).then(function (d) {
      extData = d; extEnCours = false; extRendu(words);
    }).catch(function () { extEnCours = false; extMore.textContent = 'index des sources indisponible.'; });
  }

  if (extBtn) extBtn.addEventListener('click', function () {
    extBtn.classList.toggle('on');
    apply();
  });

  function apply(push) {
    var text = norm(q.value).trim();
    var words = text ? text.split(/\s+/) : [];
    var fams = active('family'), meds = active('media'), ref = refSel.value;
    var keep = [];
    data.forEach(function (d) {
      var ok = (!fams.length || fams.indexOf(d.f) !== -1)
        && (!meds.length || meds.some(function (m) { return d.m.indexOf(m) !== -1; }))
        && (!ref || d.r === ref);
      var sc = ok && words.length ? score(d, words) : (ok ? 1 : 0);
      if (sc > 0) keep.push({ id: d.id, s: sc });
    });
    /* Trié par pertinence quand on cherche, alphabétique sinon : un ordre qui saute sans
       raison quand on efface la requête donne l'impression que la page a bougé toute seule. */
    if (words.length) keep.sort(function (a, b) { return b.s - a.s || a.id.localeCompare(b.id); });
    else keep.sort(function (a, b) { return a.id.localeCompare(b.id); });

    var shown = {};
    keep.forEach(function (k, i) { shown[k.id] = i; });
    cards.forEach(function (c) { c.hidden = !(c.dataset.id in shown); });
    keep.forEach(function (k) {
      var c = document.getElementById('c-' + k.id);
      if (c) { c.style.order = shown[k.id]; }
    });
    grid.style.display = keep.length ? '' : 'none';
    empty.hidden = keep.length > 0;
    count.textContent = keep.length + ' / ' + data.length;
    document.getElementById('clear').hidden = !q.value;
    /* Les vignettes qui viennent d'apparaître n'avaient pas de largeur : les remesurer. */
    stages.forEach(fit);
    extApply(words);
    if (push !== false) sync();
  }

  /* L'état de la recherche vit dans l'URL : un filtre trouvé se partage par copier-coller,
     et le bouton Retour du navigateur y revient. */
  function sync() {
    var p = new URLSearchParams();
    if (q.value) p.set('q', q.value);
    active('family').forEach(function (v) { p.append('family', v); });
    active('media').forEach(function (v) { p.append('media', v); });
    if (refSel.value) p.set('ref', refSel.value);
    if (extBtn && extBtn.classList.contains('on')) p.set('ext', '1');
    var s = p.toString();
    history.replaceState(null, '', s ? '?' + s : location.pathname);
  }
  function restore() {
    var p = new URLSearchParams(location.search);
    q.value = p.get('q') || '';
    refSel.value = p.get('ref') || '';
    if (extBtn) extBtn.classList.toggle('on', p.get('ext') === '1');
    var fams = p.getAll('family'), meds = p.getAll('media');
    chips.forEach(function (c) {
      var k = c.parentElement.dataset.kind;
      c.classList.toggle('on', (k === 'family' ? fams : meds).indexOf(c.dataset.value) !== -1);
    });
  }

  q.addEventListener('input', function () { apply(); });
  refSel.addEventListener('change', function () { apply(); });
  chips.forEach(function (c) { c.addEventListener('click', function () { c.classList.toggle('on'); apply(); }); });
  document.getElementById('clear').addEventListener('click', function () { q.value = ''; q.focus(); apply(); });
  function reset() {
    q.value = ''; refSel.value = '';
    chips.forEach(function (c) { c.classList.remove('on'); });
    if (extBtn) extBtn.classList.remove('on');
    apply();
  }
  document.getElementById('reset').addEventListener('click', reset);
  document.getElementById('reset2').addEventListener('click', reset);
  [].forEach.call(document.querySelectorAll('.tag[data-tag]'), function (t) {
    t.addEventListener('click', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      q.value = t.dataset.tag; apply();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
  /* « / » met le curseur dans la recherche : c'est le geste attendu sur une bibliothèque. */
  addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); q.select(); }
    if (e.key === 'Escape' && document.activeElement === q) { reset(); q.blur(); }
  });

  restore();
  apply(false);
})();
`;

/* ═══════════════ COLLECTIONS ═══════════════
   Tout est reconstruit dans le navigateur à partir du stockage local : la page ne connaît
   aucun élément à l'avance, et n'a donc pas à être régénérée quand on range quelque chose. */
const pageCollections = shell({
  title: 'Mes collections — visual-lab',
  desc: 'Vos favoris et vos collections, rangés dans ce navigateur.',
  base: '', active: 'collections',
  bodyClass: 'is-cols',
  body: `
<section class="hero hero--tight">
  <h1>Mes collections</h1>
  <p class="lede">Rangées dans <b>ce navigateur</b>, pas sur un serveur&nbsp;: rien n'est envoyé nulle part, rien ne demande de compte. Le revers est net&nbsp;— elles ne suivent pas d'un appareil à l'autre, et un nettoyage du navigateur les efface. D'où l'export ci-dessous, qui est le seul filet.</p>
  <p class="acts">
    <button class="btn" id="nouvelle" type="button">Nouvelle collection</button>
    <button class="btn" id="exporter" type="button">Exporter (.json)</button>
    <label class="btn" for="fichier">Importer…</label>
    <input id="fichier" type="file" accept="application/json" hidden>
    <button class="btn btn--ghost" id="vider" type="button">Tout effacer</button>
  </p>
</section>
<div id="vide" class="empty" hidden>
  Rien de rangé pour l'instant. Sur n'importe quelle vignette, l'étoile met en favori et le
  <b>+</b> range dans une collection. <a href="index.html">Retour à la bibliothèque</a>.
</div>
<div id="listes"></div>
`,
});

/* ═══════════════ LE RAYON EXTÉRIEUR — pages et fichiers ═══════════════ */

/** Le document autonome d'UN élément tiers. Trois protections, parce qu'on héberge du code
 *  écrit par 842 inconnus sur notre propre domaine :
 *   · l'iframe qui l'affiche est en `sandbox="allow-scripts"` → origine unique, aucun accès
 *     à la page hôte, ni cookie, ni stockage ;
 *   · une CSP `default-src 'none'` INTERDIT toute requête sortante — « zéro requête » cesse
 *     d'être une promesse pour devenir une contrainte que le navigateur applique ;
 *   · le crédit de l'auteur voyage DANS le fichier, pas seulement dans la page qui l'entoure :
 *     c'est ce que la licence MIT exige, et un fichier se copie sans son entourage. */
const extDoc = (src, e, raw) => `<!doctype html><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src 'none'">
<title>${attr(e.slug)} — ${attr(e.author)} · ${attr(src.name)}</title>
<!-- ${esc(src.name)} · @${esc(e.author)} · licence ${esc(src.licence)} · ${esc(e.permalink || src.url)}
     Repris tel quel, sans modification. Le crédit doit rester attaché au code. -->
<style>
  *,*::before,*::after{box-sizing:border-box}
  html,body{margin:0;height:100%;overflow:hidden}
  #vl-e{position:absolute;top:50%;left:50%;width:max-content;height:max-content;
    transform:translate(-50%,-50%);transform-origin:center center}
</style>
<script>
  // Contenir, jamais rogner : on ne connaît pas la taille de 3 330 éléments tiers, et une
  // cellule fixe en amputerait la moitié en silence.
  addEventListener('load', function () {
    var w = document.getElementById('vl-e'), r = w.getBoundingClientRect();
    var k = Math.min(1, (innerWidth - 18) / Math.max(1, r.width), (innerHeight - 18) / Math.max(1, r.height));
    w.style.transform = 'translate(-50%,-50%) scale(' + k.toFixed(3) + ')';
  });
</script>
<div id="vl-e">${raw.replace(/<!--[\s\S]*?-->/, '').trim()}</div>
`;

const extCell = (src, e, base) => `<article class="card card--ext" data-hay="${attr([e.cat, e.nom, e.author, ...e.tags].join(' ').toLowerCase())}">
  <div class="st st--ext"><iframe loading="lazy" sandbox="allow-scripts" title="${attr(e.slug)} par ${attr(e.author)}"
    src="${base}ext/${attr(src.id)}/${attr(e.cat)}/${attr(e.file)}"></iframe></div>
  <footer class="card__foot">
    <b>@${esc(e.author)}</b>${e.tags.length ? `<span class="mut"> · ${esc(e.tags.slice(0, 2).join(', '))}</span>` : ''}
    <span class="spacer"></span>
    ${rangement({ id: `x:${src.id}/${e.cat}/${e.file}`, titre: `${e.slug} · @${e.author}`, rendu: `/ext/${src.id}/${e.cat}/${e.file}`, fiche: `/s/${src.id}/${e.cat}.html`, origine: src.name })}
    <a class="btn btn--ghost" href="${base}ext/${attr(src.id)}/${attr(e.cat)}/${attr(e.file)}" download>code</a>
    ${e.permalink ? `<a class="btn btn--ghost" href="${attr(e.permalink)}" rel="noopener nofollow">source ↗</a>` : ''}
  </footer>
</article>`;

const bandeauLicence = (src) => `<p class="licence"><b>${esc(src.name)}</b> · licence <a href="${attr(src.licenceUrl)}" rel="noopener">${esc(src.licence)}</a> · ${esc(src.credit)}. Les éléments sont repris <b>tels quels</b>, crédit de leur auteur attaché au fichier. Ils n'ont ni intention déclarée, ni conditions d'emploi, ni benchmarks — ce ne sont pas des patterns de cette bibliothèque, c'est de la matière à regarder.</p>`;

function pageSource(src) {
  const cats = Object.entries(src.m.categories).filter(([c]) => src.idx.parCategorie[c]);
  return shell({
    title: `${src.m.name} — sources · visual-lab`,
    desc: src.m.resume,
    base: '../', active: 'sources',
    body: `
<nav class="crumb"><a href="../sources.html">Sources</a> <span>/</span> <b>${esc(src.m.name)}</b></nav>
<section class="hero hero--tight">
  <h1>${esc(src.m.name)}</h1>
  <p class="lede">${esc(src.m.resume)}</p>
  ${bandeauLicence(src.m)}
  <p class="badges"><span class="badge">${src.idx.total} éléments</span><span class="badge badge--soft">${src.idx.auteurs} auteurs</span>${Object.entries(src.idx.ecartes).map(([motif, n]) => `<span class="badge badge--warn" title="${attr(motif)}">${n} écartés</span>`).join('')}<a class="badge badge--soft" href="${attr(src.m.url)}" rel="noopener">${attr(src.m.url.replace(/^https?:\/\//, ''))} ↗</a></p>
</section>
<section class="grid grid--cats">
  ${cats.map(([c, nom]) => `<a class="catcard" href="${attr(src.m.id)}/${attr(c)}.html"><b>${esc(nom)}</b><span>${src.idx.parCategorie[c]}</span></a>`).join('')}
</section>
<p class="mut" style="margin-top:26px">Écartés à la récolte, et pourquoi : ${Object.entries(src.idx.ecartes).map(([motif, n]) => `<b>${n}</b> — ${esc(motif)}`).join(' · ')}. Un corpus qu'on filtre sans dire ce qu'on retire n'est pas un corpus, c'est une vitrine.</p>
`,
  });
}

function pageCategorie(src, cat) {
  const nom = src.m.categories[cat];
  const els = src.idx.elements.filter((e) => e.cat === cat);
  return shell({
    title: `${nom} — ${src.m.name} · visual-lab`,
    desc: `${els.length} ${nom.toLowerCase()} de ${src.m.name}, rendus vivants.`,
    base: '../../', active: 'sources',
    bodyClass: 'is-ext',
    body: `
<nav class="crumb"><a href="../../sources.html">Sources</a> <span>/</span> <a href="../${attr(src.m.id)}.html">${esc(src.m.name)}</a> <span>/</span> <b>${esc(nom)}</b></nav>
<section class="hero hero--tight">
  <h1>${esc(nom)} <span class="mut">· ${els.length}</span></h1>
  ${bandeauLicence(src.m)}
  <div class="search search--sm">
    <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5 18 18"/></svg>
    <input id="qx" type="search" placeholder="filtrer : auteur, tag, néon, verre…" autocomplete="off">
  </div>
  <p class="bar"><button class="chip" id="sol" type="button">sol clair</button><span id="nx" class="count"></span></p>
</section>
<section class="grid" id="gx">
${els.map((e) => extCell(src.m, e, '../../')).join('\n')}
</section>
`,
  });
}

const pageSources = shell({
  title: 'Sources — visual-lab',
  desc: 'Les bibliothèques tierces indexées ici : de la matière libre, rendue vivante, créditée — à côté du canon, jamais dedans.',
  base: '', active: 'sources',
  body: `
<section class="hero hero--tight">
  <h1>Les sources</h1>
  <p class="lede">Des bibliothèques <b>libres</b>, indexées et rendues vivantes ici pour qu'on puisse les fouiller d'un seul endroit. Elles sont <b>à côté</b> de la bibliothèque, jamais dedans&nbsp;: un pattern d'ici porte une intention, des conditions d'emploi et des assertions mesurables&nbsp;; un élément tiers porte un effet. Confondre les deux viderait le mot.</p>
  <p class="lede">Chaque élément garde le crédit de son auteur et un lien vers l'original. Rien n'est modifié, rien n'est revendiqué.</p>
</section>
${sources.length ? `<section class="grid grid--src">
${sources.map((s) => `<a class="srccard" href="s/${attr(s.m.id)}.html">
  <b>${esc(s.m.name)}</b>
  <span class="badges"><span class="badge">${s.idx.total}</span><span class="badge badge--soft">${esc(s.m.licence)}</span><span class="badge badge--soft">${s.idx.auteurs} auteurs</span></span>
  <p>${esc(s.m.resume)}</p>
</a>`).join('')}
</section>` : '<p class="empty">Aucune source récoltée. <code>node bin/harvest.mjs &lt;id&gt;</code>.</p>'}

<section class="steps" style="margin-top:34px">
  <h2 class="col-h2">Brancher une bibliothèque de plus</h2>
  <p class="mut">Rien dans le code ne connaît Uiverse&nbsp;: tout vient d'un manifeste — d'où cloner, comment lire l'auteur et les tags, quelles catégories garder, ce qu'on écarte et <b>pourquoi</b>. Une source de plus, c'est un fichier JSON dans <code>sources/</code>, puis <code>node bin/harvest.mjs &lt;id&gt;</code>. Aucune ligne à écrire.</p>
</section>
`,
});

/* ───────────────────────────── écriture ───────────────────────────── */

const write = (rel, content) => {
  const f = join(OUT, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, content);
};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

cpSync(join(ROOT, 'fonts'), join(OUT, 'fonts'), { recursive: true });
if (existsSync(DIRS.decks)) cpSync(DIRS.decks, join(OUT, 'decks'), { recursive: true });

write('assets/site.css', CSS);
write('assets/site.js', JS);
write('index.html', home);
write('chartes.html', chartesPage);
write('contribuer.html', contribuerPage);

for (const p of patterns) write(`p/${p.id}.html`, patternPage(p));
for (const p of patterns) write(`frag/${p.id}.html`, fragDoc(p));
write('collections.html', pageCollections);

// Les fichiers BRUTS : ce sont eux que « copier » va chercher et que « télécharger » sert.
// Une seule source pour les deux gestes — un bouton qui copie autre chose que ce qu'il
// télécharge est un piège qu'on ne verrait qu'en collant.
for (const p of patterns) {
  write(`raw/${p.id}.html`, p.html || '');
  write(`raw/${p.id}.json`, JSON.stringify({ ...p, html: undefined, htmlPath: undefined }, (k, v) => (v === undefined ? undefined : v), 2));
}
for (const r of systems.keys()) write(`raw/${r}.tokens.css`,
  `/* ${r} — les jetons de la charte, plus le socle que les fragments supposent.
   Sans la ligne box-sizing, les marges intérieures s'ajoutent aux dimensions et la
   composition ne rend pas ce que la bibliothèque montre. */\n` +
  RESET + '\n\n' + rootBlockOf(r) + '\n');

/* ── le rayon extérieur ──
   Un fichier par élément, servi tel quel : c'est l'iframe qui va le chercher, avec
   `loading="lazy"`. Une page par catégorie qui embarquerait 1 100 documents en `srcdoc`
   pèserait des mégaoctets avant le premier pixel ; ici la page ne pèse que ses liens, et le
   navigateur ne télécharge que ce que le regard atteint. */
let extFichiers = 0;
const extIndex = [];
for (const src of sources) {
  for (const e of src.idx.elements) {
    const brut = readFileSync(join(src.cache, e.cat, e.file), 'utf8');
    write(`ext/${src.m.id}/${e.cat}/${e.file}`, extDoc(src.m, e, brut));
    extFichiers++;
    extIndex.push([src.m.id, e.cat, e.file, e.author, e.tags.join(' '), e.nom]);
  }
  write(`s/${src.m.id}.html`, pageSource(src));
  for (const cat of Object.keys(src.m.categories)) {
    if (src.idx.parCategorie[cat]) write(`s/${src.m.id}/${cat}.html`, pageCategorie(src, cat));
  }
}
write('sources.html', pageSources);

// L'index de recherche du rayon n'est PAS inline dans l'accueil : 3 330 entrées y pèseraient
// plus que toute la bibliothèque, et seraient payées par chaque visiteur qui ne cherche que
// dans le canon. Il n'est chargé que quand on demande explicitement à chercher dehors.
write('api/ext-index.json', JSON.stringify({
  sources: sources.map((s) => ({ id: s.m.id, name: s.m.name, licence: s.m.licence, url: s.m.url })),
  champs: ['source', 'categorie', 'fichier', 'auteur', 'tags', 'nom'],
  els: extIndex,
}));

// L'API publique : le même index.json que consomment les agents, servi sur le web.
write('api/index.json', readFileSync(join(ROOT, 'index.json'), 'utf8'));
write('api/search.json', JSON.stringify(searchRows));
write('404.html', shell({
  title: 'Page introuvable — visual-lab',
  desc: 'Cette page n’existe pas.',
  base: '',
  active: '',
  body: `
<section class="hero">
  <h1>Rien ici.</h1>
  <p class="lede">Cette adresse ne correspond à aucun pattern. Un identifiant a peut-être changé de nom — la recherche, elle, retrouve tout.</p>
  <p class="acts"><a class="btn btn--primary" href="index.html">Retour à la bibliothèque</a> <a class="btn" href="chartes.html">Les chartes</a></p>
</section>`,
}));
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ['index.html', 'chartes.html', 'contribuer.html', 'sources.html', 'collections.html',
   ...patterns.map((p) => `p/${p.id}.html`),
   ...sources.flatMap((s) => [`s/${s.m.id}.html`,
     ...Object.keys(s.m.categories).filter((c) => s.idx.parCategorie[c]).map((c) => `s/${s.m.id}/${c}.html`)])]
    .map((u) => `  <url><loc>${SITE_URL}/${u}</loc></url>`).join('\n') + `\n</urlset>\n`);

// Une archive par pattern : le fragment, ses jetons, son contrat, et une note qui dit quoi
// en faire. Celui qui télécharge n'a pas le dépôt sous les yeux.
if (MAKE_ZIP) {
  let ok = 0;
  const staging = join(tmpdir(), `vl-zip-${process.pid}`);
  for (const p of patterns) {
    const d = join(staging, p.id);
    mkdirSync(d, { recursive: true });
    writeFileSync(join(d, 'fragment.html'), p.html || '');
    writeFileSync(join(d, 'tokens.css'), rootBlockOf(p.ref) + '\n');
    writeFileSync(join(d, 'pattern.json'), JSON.stringify({ ...p, html: undefined, htmlPath: undefined }, (k, v) => (v === undefined ? undefined : v), 2));
    writeFileSync(join(d, 'LISEZ-MOI.txt'),
      `${p.id} — ${p.name}\n${'='.repeat(60)}\n\n${p.intent}\n\n` +
      `EMPLOYER QUAND\n  ${p.when_to_use}\n\nÉVITER QUAND\n  ${p.avoid_when}\n\n` +
      `COMMENT S'EN SERVIR\n` +
      `  1. Collez le contenu de tokens.css dans votre page. Il porte deux choses : la règle\n` +
      `     box-sizing que le fragment SUPPOSE (sans elle la composition grossit et déborde),\n` +
      `     et les jetons --vl-* de la charte, à fusionner avec les vôtres.\n` +
      `  2. Collez fragment.html là où la composition doit apparaître. Son CSS voyage avec\n` +
      `     lui, dans son <style> : rien à importer, rien à installer.\n` +
      `  3. Remplacez les textes. Les emplacements prévus : ${(p.slots || []).join(', ') || '—'}.\n\n` +
      `POLICES\n  Le rendu de référence utilise les polices du dépôt (OFL) : ${REPO}/tree/main/fonts\n\n` +
      `Cadre de référence : ${frameOfPattern(p).join(' × ')} px. Charte : ${p.ref}.\n` +
      `Licence MIT — ${SITE_URL}/p/${p.id}.html\n`);
    mkdirSync(join(OUT, 'dl'), { recursive: true });
    try {
      execFileSync('zip', ['-q', '-r', '-j', join(OUT, 'dl', `${p.id}.zip`), d], { stdio: ['ignore', 'ignore', 'pipe'] });
      ok++;
    } catch { /* zip absent : les .html et .json bruts restent servis, le site ne casse pas */ }
  }
  rmSync(staging, { recursive: true, force: true });
  if (!ok) console.warn('   ⚠ aucune archive produite (binaire `zip` absent) — les fichiers bruts restent servis');
}

const files = execFileSync('bash', ['-c', `find ${JSON.stringify(OUT)} -type f | wc -l`], { encoding: 'utf8' }).trim();
const size = execFileSync('du', ['-sh', OUT], { encoding: 'utf8' }).split('\t')[0];
console.log(`✓ ${OUT}`);
console.log(`   ${patterns.length} patterns · ${systems.size} chartes · ${files} fichiers · ${size}`);
if (sources.length) {
  console.log(`   rayon extérieur : ${extFichiers} éléments de ${sources.length} source(s) — ${sources.map((s) => s.m.name + ' (' + s.m.licence + ')').join(', ')}`);
} else {
  console.log('   rayon extérieur : aucune source récoltée (node bin/harvest.mjs <id>)');
}
console.log(`   open ${join(OUT, 'index.html')}`);
