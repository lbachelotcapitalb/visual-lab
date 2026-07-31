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

// La scène d'une SLIDE dans visual-lab : 16:9, et 1600 px de large parce que c'est la largeur
// que `kit/vl_pptx.py` suppose pour convertir un fragment en .pptx. deck-builder, lui, compose
// sur 1920×1080 : ce n'est pas une contradiction, seuls les RATIOS voyagent entre les deux.
const STAGE = [1600, 900];   // même constante que bin/new-ref.mjs
// Couches empilées AU-DESSUS de la scène. La scène (.slide) ne compte pas : c'est le support.
// 3 = carte → sous-carte → tuile, le maximum documenté du corpus (layout-01-nested-bento).
const MAX_DEPTH = 3;

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
  // Couleur EFFECTIVE d'une surface : les couches translucides sont compositées sur leurs
  // ancêtres, comme dans bin/check.mjs. Sans ça, deux verres à 30 % et 45 % se comparent à
  // leurs valeurs déclarées et paraissent très différents alors qu'ils se ressemblent.
  const effective = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const p = (getComputedStyle(e).backgroundColor.match(/[\\d.]+/g) || []).map(Number);
      if (p.length < 3) continue;
      const a = p.length === 4 ? p[3] : 1;
      if (a <= 0) continue;
      layers.push([p[0], p[1], p[2], a]);
      if (a >= 1) break;
    }
    let out = [255, 255, 255];
    for (let i = layers.length - 1; i >= 0; i--) {
      const [r, g, b, a] = layers[i];
      out = [r * a + out[0] * (1 - a), g * a + out[1] * (1 - a), b * a + out[2] * (1 - a)];
    }
    return out;
  };
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
        // Une couche 1:1 n'est redondante que si elle RESSEMBLE à celle qu'elle encadre.
        // Seuil calibré sur trois cas mesurés (somme des écarts RGB des couleurs EFFECTIVES) :
        //   ref-03 slides 2 et 4, carte blanche sur planche sombre      Δ = 627  → composition
        //   ref-03 slide 3, carte sombre sur planche sombre             Δ =  87  → redondance
        //   ref-13 fautif, planche translucide sur fond en dégradé      Δ =  82  → redondance
        // Le matte à fort contraste porte la signature du deck ; deux teintes voisines
        // empilées ne portent rien. 120 sépare les deux familles sans les frôler.
        let sole = false;
        if (kids.length === 1 && surfaceKids.length === 1 && !ownText) {
          const a = effective(el), b = effective(surfaceKids[0]);
          sole = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 120;
        }
        layers.push({
          sel: (el.className || el.tagName).toString().split(' ')[0] || el.tagName,
          depth, container, sole,
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

// visual-lab héberge des visuels de PLUSIEURS dimensions ; seule une référence qui est une
// SLIDE doit tenir le format PPT. Une référence d'un autre média (hero web, vignette social,
// affiche) déclare sa scène EN CLAIR dans son deck, avec sa raison :
//     <!-- vl:stage web — hero de page, le 16:9 n'a pas de sens ici -->
// Absent = slide, donc format PPT exigé. Un lint toujours rouge finit par être ignoré, mais
// une exemption muette est pire : la déclaration est visible dans le fichier qu'elle exempte.
const STAGE_DECL = /<!--\s*vl:stage\s+(slide|web|social|print)\s*(?:—\s*([^>]*?))?-->/;

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
  const decl = readFileSync(join(DIRS.decks, f), 'utf8').match(STAGE_DECL);
  const free = decl && decl[1] !== 'slide' ? `${decl[1]} — ${(decl[2] || 'scène propre à ce média').trim()}` : null;
  for (const s of probe(join(DIRS.decks, f))) {
    const t = (ok, msg) => { console.log(`  ${ok ? '✓' : '✗'} slide ${s.n + 1} · ${msg}`); if (!ok) fail++; };
    if (free) console.log(`  ~ vue ${s.n + 1} · média déclaré : ${free}  (${s.w}×${s.h})`);
    else {
      t(s.w === STAGE[0] && s.h === STAGE[1], `format PPT ${STAGE[0]}×${STAGE[1]} (mesuré ${s.w}×${s.h})`);
      t(Math.abs(s.w / s.h - 16 / 9) < 0.01, 'ratio 16:9');
    }
    // La marge de page n'est un défaut que sur un deck d'UNE slide : là, la page EST la slide
    // et le liseré contrasté se lit comme une couche de plus (faute de ref-13). Sur un deck
    // multi-slides, c'est l'espace ENTRE les slides — il n'existe pas dans l'export slide par
    // slide, et le signaler dix fois noierait les vrais défauts.
    if (s.slides === 1) t(!s.pageChrome, 'aucune marge de page sous la slide — elle se lit comme une couche');
    t(s.depth - 1 <= MAX_DEPTH, `couches au-dessus de la scène ≤ ${MAX_DEPTH} (mesuré ${s.depth - 1})`);
    t(!s.sole.length, s.sole.length
      ? `couche 1:1 redondante — ${s.sole.join(', ')} : n'encadre qu'UNE surface de teinte proche, garder celle du dessus`
      : 'aucune couche 1:1 redondante');
  }
}
console.log(fail ? `\n✗ ${fail} contrôle(s) de composition en échec.` : `\n✓ composition conforme (${decks.length} deck(s)).`);
process.exit(fail ? 1 : 0);
