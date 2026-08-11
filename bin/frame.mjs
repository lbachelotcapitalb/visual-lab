#!/usr/bin/env node
// CADRE — un pattern tient-il dans le format d'un canal, à la taille où on le regarde vraiment ?
//
//   node bin/frame.mjs card-03-stat-accent --target social   verdict détaillé sur un pattern
//   node bin/frame.mjs --audit --target social               l'état de toute la bibliothèque
//
// POURQUOI un outil de plus, à côté de bin/emit.mjs et bin/check.mjs. Les trois répondent à
// trois questions différentes, et confondre les réponses est précisément ce qui fait sortir un
// visuel illisible :
//   - bin/check.mjs   : le pattern est-il bien PROPORTIONNÉ ? (ratios internes, contraste)
//   - bin/emit.mjs    : le MOTEUR de la cible sait-il rendre ce qu'il demande ? (Outlook)
//   - bin/frame.mjs   : à la TAILLE où on le regarde dans ce canal, reste-t-il lisible et
//                       occupe-t-il son cadre ?
// Un pattern peut être parfaitement mesuré (check vert) et parfaitement rendu (emit vert) tout
// en étant illisible : une rangée de KPI réglée pour 1286 px de large, ramenée dans un post de
// 1080, sort ses libellés à 11 px sur un écran de sept centimètres. Rien dans les deux autres
// contrôles ne le voit — check mesure des RAPPORTS, qui survivent au changement d'échelle par
// construction, et c'est justement là que le trou se cachait.
//
// La mise à l'échelle est calculée ANALYTIQUEMENT (k = cadre utile ÷ taille du pattern) et
// jamais obtenue par `zoom` : sous `zoom`, Chrome renvoie une taille de police non zoomée à
// côté d'une boîte zoomée, et la mesure mentirait d'un facteur k sans rien signaler.
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, DIRS, MEDIA, loadPatterns, loadSystems, systemToCss, mediaOf, dumpJson } from './lib.mjs';

const argv = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? d : (argv[i + 1] ?? true);
};
const has = (n) => argv.includes(`--${n}`);

// Les seuils sont exprimés en FRACTION DE LA LARGEUR DU CADRE, jamais en pixels : c'est la
// seule écriture qui reste vraie quand la plateforme change de définition (1080 aujourd'hui,
// 1440 demain) — même raison que les benchmarks en ratios.
const FRAMES = {
  social: {
    label: 'post de fil 4:5 (1080 × 1350) — LinkedIn, Instagram',
    w: 1080,
    h: 1350,
    // Marge de sécurité : la zone que l'interface de la plateforme peut recouvrir ou rogner
    // (nom du compte, actions, recadrage carré de l'aperçu de fil).
    safe: 0.06,
    // Plancher de lisibilité, en fraction de la largeur du cadre. 2,2 % = 24 px sur 1080, soit
    // environ 1,4 mm de haut sur un téléphone de 6,5 cm de large. En dessous, le texte n'est
    // plus lu : il est deviné. C'est la loi n° 7 de DOCTRINE.md, exprimée dans l'unité du canal.
    minType: 0.022,
    // Occupation verticale minimale de la zone utile. En dessous, le visuel flotte dans son
    // cadre et la plateforme rend une bande vide — loi n° 1, « aucun vide oisif ».
    minFill: 0.45,
  },
};

const target = String(flag('target', 'social'));
if (!FRAMES[target]) {
  console.error(`Cadre inconnu : "${target}". Cadres : ${Object.keys(FRAMES).join(', ')}.`);
  process.exit(1);
}
const F = FRAMES[target];
const marge = F.w * F.safe;
const utileW = F.w - 2 * marge;
const utileH = F.h - 2 * marge;

const systems = loadSystems();
let patterns = loadPatterns().sort((a, b) => a.id.localeCompare(b.id));
const wanted = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--target');
if (!has('audit')) {
  if (!wanted.length) {
    console.error(
      `usage : frame.mjs <id> --target ${Object.keys(FRAMES).join('|')}\n` +
        `        frame.mjs --audit --target ${target}`
    );
    process.exit(1);
  }
  patterns = patterns.filter((p) => wanted.includes(p.id));
  if (!patterns.length) {
    console.error(`Pattern introuvable : ${wanted.join(', ')}`);
    process.exit(1);
  }
}

/* ————— Une seule passe Chrome : tous les fragments dans un document, chacun sur SA charte ————— */

const fontsCss = existsSync(join(ROOT, 'fonts', 'fonts.css'))
  ? readFileSync(join(ROOT, 'fonts', 'fonts.css'), 'utf8')
      .replace(/url\(("|')?(?!https?:|data:|\/)/g, (m, quote) => `url(${quote || ''}${join(ROOT, 'fonts')}/`)
  : '';

const cells = patterns.map((p, i) => {
  const sys = systems.find((s) => s.id === p.ref);
  const cls = `vl-sys-${i}`;
  return { p, cls, css: sys ? systemToCss(sys).replace(/^:root/, `.${cls}`) : `.${cls}{}` };
});

mkdirSync(DIRS.proofs, { recursive: true });
// Écrit dans patterns/ : les chemins relatifs éventuels d'un fragment restent valides.
const tmp = join(DIRS.patterns, '.frame-probe.html');
writeFileSync(
  tmp,
  `<!doctype html><meta charset="utf-8"><style>${fontsCss}
*{box-sizing:border-box}
body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Inter,Arial,sans-serif}
.vl-probe{display:inline-block;vertical-align:top}
${cells.map((c) => c.css).join('\n')}
</style>
${cells.map((c, i) => `<div class="vl-probe ${c.cls}" id="vl-p${i}">${c.p.html}</div>`).join('\n')}
<pre id="vl-out"></pre>
<script>
// Le corps qui compte est celui des FEUILLES porteuses de texte : un conteneur hérite d'une
// taille qu'il n'affiche pas, la compter ferait échouer des patterns sains.
// ⚠️ Piège payé à la première passe : un fragment porte son CSS avec lui, donc son bloc
// <style> est une feuille dont le textContent n'est pas vide — sept patterns étaient déclarés
// sous le plancher à cause du corps hérité par leur propre feuille de style, qui n'affiche
// rien. On écarte donc les balises non visuelles ET tout ce qui n'a aucune boîte rendue.
const INVISIBLE = new Set(['STYLE', 'SCRIPT', 'TITLE', 'META', 'LINK', 'TEMPLATE', 'BR']);
const measure = (i) => {
  const el = document.getElementById('vl-p' + i);
  const b = el.getBoundingClientRect();
  let min = Infinity, who = '';
  for (const e of el.querySelectorAll('*')) {
    if (INVISIBLE.has(e.tagName) || !e.getClientRects().length) continue;
    // « Affiche du texte À SA taille » = possède un nœud texte DIRECT non vide. Tester
    // \`!e.children.length\` laissait passer tout élément mixte — un <p> de 12 px contenant un
    // <b> n'était compté ni pour lui-même (il a un enfant) ni par son enfant (plus gros) : un
    // faux négatif qui déclarait le pattern lisible sur un texte jamais mesuré.
    const propre = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!propre) continue;
    const fs = parseFloat(getComputedStyle(e).fontSize);
    if (fs > 0 && fs < min) {
      min = fs;
      who = e.className ? '.' + String(e.className).trim().split(/\\s+/).pop() : e.tagName.toLowerCase();
    }
  }
  // DÉBORDEMENT HORS RACINE. L'échelle est calculée sur la boîte de la racine ; si un
  // descendant sort de cette boîte (pastille en position absolue, poignée soudée au bord,
  // élément translaté), il sortira aussi de la zone sûre — et rien ne le signalerait, parce
  // que « le pattern tient dans la zone sûre » serait vrai de la RACINE et faux du rendu.
  // Une garantie « par construction » qui ne mesure pas son hypothèse est une garantie qui
  // se casse en silence.
  let bleed = 0;
  for (const e of el.querySelectorAll('*')) {
    if (INVISIBLE.has(e.tagName) || !e.getClientRects().length) continue;
    const r = e.getBoundingClientRect();
    bleed = Math.max(bleed, b.left - r.left, r.right - b.right, b.top - r.top, r.bottom - b.bottom);
  }
  return { w: b.width, h: b.height, minType: min === Infinity ? null : min, who, bleed: Math.max(0, bleed) };
};
document.getElementById('vl-out').textContent =
  JSON.stringify(${JSON.stringify(cells.map((_, i) => i))}.map(measure));
</script>`
);

let mesures;
try {
  mesures = dumpJson(tmp);
} finally {
  rmSync(tmp, { force: true });
}

/* ————— Verdicts ————— */

const lignes = [];
let ok = 0;
for (const [i, c] of cells.entries()) {
  const m = mesures[i];
  const probs = [];
  // Le pattern doit tenir ENTIER dans la zone sûre : c'est la plus contraignante des deux
  // dimensions qui fixe l'échelle.
  const k = Math.min(utileW / m.w, utileH / m.h);
  const fill = (m.h * k) / utileH;
  const typeRatio = m.minType === null ? null : (m.minType * k) / F.w;

  if (typeRatio !== null && typeRatio < F.minType) {
    probs.push(
      `plancher typographique : ${m.who} tombe à ${(m.minType * k).toFixed(1)} px sur ${F.w} ` +
        `(${(typeRatio * 100).toFixed(2)} %, minimum ${(F.minType * 100).toFixed(1)} %)`
    );
  }
  // La zone sûre n'est plus « garantie par construction » : ce qui la garantissait, c'est que
  // le rendu tienne dans la boîte de la racine. On le mesure au lieu de le supposer.
  if (m.bleed * k > marge) {
    probs.push(
      `zone sûre : un élément déborde de ${(m.bleed * k).toFixed(0)} px hors de la racine, ` +
        `soit plus que la marge de ${Math.round(marge)} px — il tombe dans la bande que la ` +
        `plateforme peut recouvrir ou rogner`
    );
  }
  if (fill < F.minFill) {
    probs.push(
      `occupation : le pattern ne remplit que ${(fill * 100).toFixed(0)} % de la hauteur utile ` +
        `(minimum ${(F.minFill * 100).toFixed(0)} %) — proportion ${(m.w / m.h).toFixed(2)}:1 contre ` +
        `${(utileW / utileH).toFixed(2)}:1 pour le cadre`
    );
  }
  if (!probs.length) ok++;
  const declare = mediaOf(c.p).includes(target);
  // Les mesures s'affichent AUSSI sur un succès. Un pattern sans aucun texte passe le plancher
  // typographique par absence de sujet, pas par mérite — et un ✓ dont on ne voit pas la marge
  // est un ✓ qu'on ne peut pas contester.
  const typo = typeRatio === null
    ? 'aucun texte — plancher non applicable'
    : `typo min ${(m.minType * k).toFixed(1)} px (${(typeRatio * 100).toFixed(2)} %) sur ${m.who}`;
  lignes.push(
    `${probs.length ? '✗' : '✓'} ${c.p.id.padEnd(30)} ` +
      `×${k.toFixed(2)} · ${typo} · remplit ${(fill * 100).toFixed(0)} % · ` +
      `${m.bleed > 0.5 ? `déborde ${(m.bleed * k).toFixed(0)} px hors racine · ` : ''}` +
      `${declare ? `déclaré ${target}` : `NON déclaré ${target}`}` +
      (probs.length ? `\n    ${probs.join('\n    ')}` : '')
  );
}

/* ————— Sortie VIVANTE : le pattern dans son cadre, à la largeur d'un téléphone ————— */
// Un chiffre de plancher typographique ne se conteste pas à l'œil ; ce qu'il PRÉDIT, si. Cette
// page rend le cadre à 390 px de large — la largeur CSS d'un téléphone courant — parce que
// c'est là que le visuel sera regardé. Un cadre montré à 100 % ou réduit « pour tenir » ment
// exactement sur la seule chose qu'on cherche à savoir.
// Ici `zoom` est légitime, contrairement à la passe de mesure : on ne mesure plus, on rend —
// et `zoom` reflue, là où `transform` laisserait une hauteur fantôme à réserver.
const out = flag('out');
if (out) {
  const AFFICHE = 390; // largeur CSS d'un téléphone courant
  const r = AFFICHE / F.w;
  const vues = cells.map((c, i) => {
    const m = mesures[i];
    const k = Math.min(utileW / m.w, utileH / m.h);
    const t = m.minType === null ? null : (m.minType * k) / F.w;
    const verdict = (t !== null && t < F.minType) || (m.h * k) / utileH < F.minFill;
    return `<figure class="vl-vue">
  <figcaption class="vl-vue__cap">${verdict ? '✗' : '✓'} ${c.p.id}<span class="vl-vue__sub">échelle ×${k.toFixed(2)} · ${
      t === null ? 'aucun texte' : `plus petit corps ${(m.minType * k).toFixed(0)} px sur ${F.w} (${(t * 100).toFixed(2)} %)`
    } · remplit ${(((m.h * k) / utileH) * 100).toFixed(0)} %</span></figcaption>
  <div class="vl-phone">
    <div class="vl-stage ${c.cls}">
      <div class="vl-safe"></div>
      <div class="vl-fit" style="zoom:${k}">${c.p.html}</div>
    </div>
  </div>
</figure>`;
  });
  writeFileSync(
    String(out),
    `<!doctype html><meta charset="utf-8"><title>visual-lab — cadre ${target}</title>
<style>${fontsCss}
/* Les tokens de CHAQUE charte, scopés par classe : quinze systèmes emploient les mêmes noms
   \`--vl-*\`, un :root global les ferait se contaminer d'un cadre à l'autre. */
${cells.map((c) => c.css).join('\n')}
*{box-sizing:border-box}
body{margin:0;padding:40px;background:#131313;color:#EDEDED;
  font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Inter,Arial,sans-serif}
h1{margin:0 0 6px;font-size:20px}
.vl-intro{margin:0 0 32px;max-width:70ch;font-size:14px;line-height:1.6;color:#9A9A9A}
.vl-vues{display:flex;flex-wrap:wrap;gap:36px;align-items:flex-start}
.vl-vue{margin:0;width:${AFFICHE}px}
.vl-vue__cap{margin:0 0 10px;font-size:13px;font-weight:700;line-height:1.4}
.vl-vue__sub{display:block;font-weight:400;color:#8E8E8E}
.vl-phone{width:${AFFICHE}px;height:${Math.round(F.h * r)}px;overflow:hidden;background:#fff}
.vl-stage{position:relative;width:${F.w}px;height:${F.h}px;zoom:${r};
  display:flex;align-items:center;justify-content:center;
  /* chaque charte nomme son fond autrement : on essaie les trois noms du corpus avant le blanc */
  background:var(--vl-bg,var(--vl-page,var(--vl-paper,#fff)))}
.vl-safe{position:absolute;inset:${Math.round(marge)}px;outline:2px dashed #FF3B3B80;pointer-events:none}
.vl-fit{display:inline-block}
</style>
<h1>Cadre « ${target} » — ${F.label}</h1>
<p class="vl-intro">Chaque cadre fait ${F.w} × ${F.h} px et il est rendu ici à ${AFFICHE} px de large,
la largeur d'un téléphone courant : c'est la taille à laquelle le visuel sera réellement regardé.
Le pointillé rouge est la zone sûre (marge de ${(F.safe * 100).toFixed(0)} %), que l'interface de la
plateforme peut recouvrir ou rogner. Plancher typographique : ${Math.round(F.minType * F.w)} px sur
${F.w}, occupation minimale ${(F.minFill * 100).toFixed(0)} % de la hauteur utile.</p>
<div class="vl-vues">
${vues.join('\n')}
</div>`
  );
  console.log(`✓ ${out}  (${cells.length} pattern(s) dans le cadre ${target})`);
  console.log(`   open ${out}   — du HTML vivant, jamais une image.`);
}

console.log(`Cadre « ${target} » — ${F.label}`);
console.log(
  `Zone sûre ${Math.round(utileW)} × ${Math.round(utileH)} px ` +
    `(marge ${(F.safe * 100).toFixed(0)} %) · plancher typo ${Math.round(F.minType * F.w)} px · ` +
    `occupation ≥ ${(F.minFill * 100).toFixed(0)} %\n`
);
console.log(lignes.join('\n'));
console.log(`\n${ok}/${cells.length} pattern(s) tiennent le cadre « ${target} ».`);
console.log(
  'Ce contrôle ne dit pas si le visuel est BEAU : il dit qu\'à la taille où on le regarde, ' +
    'son plus petit texte reste lisible et qu\'il ne flotte pas dans son cadre.'
);
process.exit(ok === cells.length ? 0 : 1);
