#!/usr/bin/env node
// photos.mjs — sourcing d'images libres (Pexels) avec TRI PAR PALETTE.
//
//   node bin/photos.mjs --slug ref-10 --palette "#E33A22,#8A5732,#EDEAE3" \
//     --query "cow hide close up" --query "red satin jacket" --n 6
//
//   node bin/photos.mjs --slug hero --palette sys-08 --query "calm sea horizon" --n 8
//   node bin/photos.mjs --slug tout --query "cactus" --n 4 --any     # sans filtre de palette
//
// Pourquoi un tri par palette et pas « les 8 premières » : ce qui fait tenir une planche
// d'images, ce n'est pas la qualité de chaque photo, c'est leur CASTING commun (ref-10 tient
// parce que ses six photos portent toutes du rouge ou du brun). Le tri est donc la
// fonctionnalité, pas un bonus.
//
// L'API renvoie `avg_color` pour chaque résultat : le tri se fait donc sur les MÉTADONNÉES,
// avant tout téléchargement. Une recherche coûte 1 requête pour 80 candidats, et on ne
// rapatrie que les retenues.
//
// La clé ne vit ni ici ni dans un fichier de réglages : elle est lue dans l'environnement
// (PEXELS_API_KEY), fournie par le coffre le temps d'une commande :
//   node ~/Documents/Claude/Projects/cartographie-it/bw-get.mjs \
//     --item "Pexels — API" --field PEXELS_API_KEY --as PEXELS_API_KEY \
//     --exec 'node bin/photos.mjs …'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, DIRS, loadSystems } from './lib.mjs';

const KEY = process.env.PEXELS_API_KEY;
if (!KEY) {
  console.error(`PEXELS_API_KEY absente de l'environnement.
Passe par le coffre plutôt que par un fichier de réglages :
  node ~/Documents/Claude/Projects/cartographie-it/bw-get.mjs \\
    --item "Pexels — API" --field PEXELS_API_KEY --as PEXELS_API_KEY \\
    --exec 'node bin/photos.mjs …'`);
  process.exit(1);
}

// ————— arguments ————— //
const argv = process.argv.slice(2);
const queries = [];
let slug = null, palette = null, n = 6, tol = 42, orientation = null, any = false, size = 'large2x';
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--query') queries.push(argv[++i]);
  else if (a === '--slug') slug = argv[++i];
  else if (a === '--palette') palette = argv[++i];
  else if (a === '--n') n = Number(argv[++i]);
  else if (a === '--tol') tol = Number(argv[++i]);
  else if (a === '--orientation') orientation = argv[++i];
  else if (a === '--size') size = argv[++i];
  else if (a === '--any') any = true;
  else { console.error(`Argument inconnu : ${a}`); process.exit(1); }
}
if (!slug || !queries.length) {
  console.error('Usage : node bin/photos.mjs --slug <dossier> --query "<mots>" [--query …] [--n 6] [--palette sys-NN|"#hex,#hex"] [--tol 42] [--orientation portrait|landscape|square] [--any]');
  process.exit(1);
}

// ————— palette cible ————— //
// Soit un système du dépôt (on ne garde que ses tokens qui SONT des couleurs — les tokens de
// marge en px vivent dans le même objet), soit une liste de hex donnée à la main.
function resolvePalette(spec) {
  if (!spec) return [];
  if (spec.startsWith('#')) return spec.split(',').map((s) => s.trim()).filter((s) => /^#[0-9a-fA-F]{6}$/.test(s));
  const sys = loadSystems().find((s) => s.id === spec);
  if (!sys) { console.error(`Système "${spec}" inconnu.`); process.exit(1); }
  return Object.values(sys.tokens || {}).filter((v) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v));
}
const targets = any ? [] : resolvePalette(palette);
if (!any && !targets.length) {
  console.error('Aucune couleur cible : donne --palette (sys-NN ou "#hex,#hex"), ou assume --any.');
  process.exit(1);
}

// ————— distance couleur —————
// ΔE76 en CIELAB. Pas de la colorimétrie de laboratoire : `avg_color` est une moyenne
// boueuse, mais elle suffit à dire « cette photo porte du rouge » vs « elle est bleue ».
// Une distance en RGB, elle, classerait un brun sombre plus près d'un bleu sombre que du rouge.
const srgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
function lab(hex) {
  const f = (c) => (c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92);
  const [r, g, b] = srgb(hex).map(f);
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const k = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [k(X), k(Y), k(Z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
const deltaE = (a, b) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));

// Un NEUTRE ne prouve aucun casting.
// Constaté à la première récolte : une route bleu-gris (#AFB9B7) est passée le filtre en
// matchant le crème #EDEAE3 de la charte — donc en étant froide, exactement ce que le tri
// devait écarter. Toute couleur peu chromatique est à ΔE modéré de tous les gris du monde.
// On retire donc les cibles neutres, sauf si la palette n'est QUE des neutres (cas d'un
// système N&B, où c'est alors la clarté qui porte l'intention).
const chroma = (hex) => Math.hypot(lab(hex)[1], lab(hex)[2]);
const chromatic = targets.filter((t) => chroma(t) >= 12);
const dropped = targets.filter((t) => chroma(t) < 12);
const effective = chromatic.length ? chromatic : targets;
if (dropped.length && chromatic.length) {
  console.log(`⚠︎ cibles neutres ignorées (elles ne prouvent aucun casting) : ${dropped.join(', ')}`);
}

function bestMatch(avg) {
  let best = { hex: null, dE: Infinity };
  for (const t of effective) {
    const dE = deltaE(avg, t);
    if (dE < best.dE) best = { hex: t, dE: Math.round(dE * 10) / 10 };
  }
  return best;
}

// ————— API ————— //
async function search(q) {
  const u = new URL('https://api.pexels.com/v1/search');
  u.searchParams.set('query', q);
  u.searchParams.set('per_page', '80');
  if (orientation) u.searchParams.set('orientation', orientation);
  const r = await fetch(u, { headers: { Authorization: KEY } });
  if (!r.ok) throw new Error(`Pexels ${r.status} sur « ${q} » : ${(await r.text()).slice(0, 160)}`);
  const j = await r.json();
  return { photos: j.photos || [], total: j.total_results || 0, left: r.headers.get('x-ratelimit-remaining') };
}

const outDir = join(ROOT, 'assets', 'photos', slug);
mkdirSync(outDir, { recursive: true });
const manifestPath = join(outDir, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { slug, photos: [] };
const known = new Set(manifest.photos.map((p) => p.id));

let quotaLeft = null;
for (const q of queries) {
  const { photos, total, left } = await search(q);
  quotaLeft = left ?? quotaLeft;
  const scored = photos
    .filter((p) => !known.has(p.id))
    .map((p) => ({ p, m: any ? { hex: null, dE: 0 } : bestMatch(p.avg_color) }))
    .filter((x) => any || x.m.dE <= tol)
    .sort((a, b) => a.m.dE - b.m.dE)
    .slice(0, n);

  console.log(`\n« ${q} » — ${total} résultats, ${photos.length} lus, ${scored.length} retenus (ΔE ≤ ${tol})`);
  for (const { p, m } of scored) {
    const file = `${slug}-${p.id}.jpg`;
    const url = p.src[size] || p.src.large2x;
    const res = await fetch(url);
    if (!res.ok) { console.log(`  ✗ ${p.id} : téléchargement ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(join(outDir, file), buf);
    known.add(p.id);
    manifest.photos.push({
      id: p.id, file, query: q, avg_color: p.avg_color,
      matched: m.hex, delta_e: m.dE,
      width: p.width, height: p.height, size_used: size,
      photographer: p.photographer, photographer_url: p.photographer_url,
      source: p.url, provider: 'pexels', license: 'Pexels License (usage libre, attribution non requise)',
      alt: p.alt || '', bytes: buf.length,
    });
    console.log(`  ✓ ${file}  ΔE ${m.dE}${m.hex ? ` → ${m.hex}` : ''}  ${p.avg_color}  ${p.width}×${p.height}  ${Math.round(buf.length / 1024)} ko`);
  }
}

// ————— manifeste + planche-contact —————
// Le manifeste est VERSIONNÉ (léger, texte, il porte les crédits et permet de re-télécharger
// à l'identique) ; les .jpg sont gitignorés — la doctrine du dépôt interdit le poids binaire
// dans l'historique, comme pour proofs/.
manifest.provider = 'pexels';
manifest.palette = any ? null : effective;
manifest.palette_neutrals_ignored = dropped.length ? dropped : undefined;
manifest.tolerance_delta_e = any ? null : tol;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const cells = manifest.photos.map((p) => `  <figure>
    <img src="${p.file}" alt="${p.alt.replace(/"/g, '&quot;')}">
    <figcaption>${p.query} · ΔE ${p.delta_e} · <span style="background:${p.avg_color}"></span> ${p.avg_color}</figcaption>
  </figure>`).join('\n');
writeFileSync(join(outDir, 'board.html'), `<!doctype html><meta charset="utf-8">
<title>récolte ${slug}</title>
<style>
body{margin:0;padding:24px;background:#111;color:#EEE;font:12px/1.4 -apple-system,Inter,Arial,sans-serif;
display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
figure{margin:0}
img{display:block;width:100%;height:260px;object-fit:cover;background:#222}
figcaption{margin-top:6px;opacity:.8}
figcaption span{display:inline-block;width:10px;height:10px;vertical-align:-1px;border-radius:2px}
</style>
${cells}
`);

console.log(`\n→ ${manifest.photos.length} photo(s) dans assets/photos/${slug}/ · manifest.json · board.html`);
if (quotaLeft) console.log(`   quota Pexels restant ce mois : ${quotaLeft}`);
console.log(`   regarder la récolte : node bin/render.mjs assets/photos/${slug}/board.html 1600 1100`);
