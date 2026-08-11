#!/usr/bin/env node
// photos.mjs — sourcing d'images libres, TRIÉ PAR PALETTE, sur deux fonds.
//
//   node bin/photos.mjs --slug ref-10-campaign-board-red --palette ref-10-campaign-board-red --n 3 \
//     --query "cow hide close up" --query "red satin jacket"
//
//   node bin/photos.mjs --provider met --slug musee --palette "#1B44D8" --query "ceramic" --scan 40
//   node bin/photos.mjs --slug tout --query "cactus" --n 4 --any     # sans filtre de palette
//
// ————— pourquoi un tri par palette —————
// Ce qui fait tenir une planche d'images n'est pas la qualité de chaque photo, c'est leur
// CASTING commun : ref-10 tient parce que ses six photos portent toutes du rouge ou du brun.
// Le tri est donc la fonctionnalité, pas un bonus. Il se fait par ΔE76 en CIELAB contre une
// palette cible (un id de référence du dépôt, ou une liste de hex).
//
// ————— les deux fonds —————
//   pexels  photo éditoriale contemporaine. CLÉ REQUISE (gratuite, 25 000 req/mois,
//           attribution non requise). Publie `avg_color` : le tri se fait donc sur les
//           métadonnées, avant tout téléchargement — 1 requête pour 80 candidats.
//   met     Metropolitan Museum, œuvres en domaine public (CC0). SANS CLÉ. Ne publie AUCUNE
//           couleur : il faut donc télécharger la vignette et calculer la moyenne (via `sips`,
//           natif macOS). Coûte 1 requête de détail par candidat → `--scan` borne le balayage.
//           Œuvres de musée, pas photos de campagne : pour une matière, une texture, un fond.
//
// Fond ÉCARTÉ, et pourquoi (pour ne pas le retenter) : l'Art Institute of Chicago a la
// meilleure API du lot (sans clé, couleur dominante ET drapeau domaine public dans la réponse
// de recherche), mais son serveur d'images IIIF répond **403** à tout client non navigateur —
// y compris avec en-têtes Chrome complets et Referer. Métadonnées exploitables, fichiers non :
// un provider qui ne livre pas de fichier n'a pas sa place ici.
//
// La clé Pexels ne vit ni ici ni dans un fichier de réglages : elle est lue dans
// l'environnement, fournie par le coffre le temps d'une commande :
//   node ~/Documents/Claude/Projects/cartographie-it/bw-get.mjs \
//     --item "Pexels — API" --field PEXELS_API_KEY --as PEXELS_API_KEY \
//     --exec 'node bin/photos.mjs …'
import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { inflateSync } from 'node:zlib';
import { ROOT, loadSystems } from './lib.mjs';

// ————— arguments ————— //
const argv = process.argv.slice(2);
const queries = [];
let slug = null, palette = null, provider = 'pexels';
let n = 6, tol = 42, orientation = null, any = false, size = 'large2x', scan = 24;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--query') queries.push(argv[++i]);
  else if (a === '--slug') slug = argv[++i];
  else if (a === '--palette') palette = argv[++i];
  else if (a === '--provider') provider = argv[++i];
  else if (a === '--n') n = Number(argv[++i]);
  else if (a === '--tol') tol = Number(argv[++i]);
  else if (a === '--scan') scan = Number(argv[++i]);
  else if (a === '--orientation') orientation = argv[++i];
  else if (a === '--size') size = argv[++i];
  else if (a === '--any') any = true;
  else { console.error(`Argument inconnu : ${a}`); process.exit(1); }
}
if (!slug || !queries.length) {
  console.error(`Usage : node bin/photos.mjs --slug <dossier> --query "<mots>" [--query …]
  [--provider pexels|met] [--n 6] [--palette <ref-NN-…>|"#hex,#hex"] [--tol 42]
  [--orientation portrait|landscape|square] [--scan 24] [--any]`);
  process.exit(1);
}
if (!['pexels', 'met'].includes(provider)) {
  console.error(`Provider inconnu : ${provider} (pexels, met)`);
  process.exit(1);
}
const KEY = process.env.PEXELS_API_KEY;
if (provider === 'pexels' && !KEY) {
  console.error(`PEXELS_API_KEY absente de l'environnement. Passe par le coffre :
  node ~/Documents/Claude/Projects/cartographie-it/bw-get.mjs \\
    --item "Pexels — API" --field PEXELS_API_KEY --as PEXELS_API_KEY \\
    --exec 'node bin/photos.mjs …'
Ou reste sans clé : --provider met (Metropolitan, domaine public).`);
  process.exit(1);
}

// ————— palette cible ————— //
function resolvePalette(spec) {
  if (!spec) return [];
  if (spec.startsWith('#')) return spec.split(',').map((s) => s.trim()).filter((s) => /^#[0-9a-fA-F]{6}$/.test(s));
  const sys = loadSystems().find((s) => s.id === spec);
  if (!sys) { console.error(`Référence "${spec}" inconnue (systems/).`); process.exit(1); }
  // Un système mélange couleurs et mesures dans le même objet de tokens : ne garder que les hex.
  return Object.values(sys.tokens || {}).filter((v) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v));
}
const targets = any ? [] : resolvePalette(palette);
if (!any && !targets.length) {
  console.error('Aucune couleur cible : donne --palette (ref-NN-… ou "#hex,#hex"), ou assume --any.');
  process.exit(1);
}

// ————— distance couleur —————
// ΔE76 en CIELAB. Pas de la colorimétrie de laboratoire : une couleur moyenne est boueuse,
// mais elle suffit à dire « cette image porte du rouge » vs « elle est bleue ». Une distance
// en RGB, elle, classerait un brun sombre plus près d'un bleu sombre que du rouge.
function lab(hex) {
  const f = (c) => (c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92);
  const [r, g, b] = [1, 3, 5].map((i) => f(parseInt(hex.slice(i, i + 2), 16) / 255));
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
// On retire donc les cibles neutres, sauf si la palette n'est QUE des neutres (système N&B,
// où c'est alors la clarté qui porte l'intention).
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

// ————— couleur moyenne d'un fichier, quand le fond n'en publie pas —————
// `sips` (natif macOS) réduit l'image à 1×1 : c'est la moyenne, calculée par le système.
// Un PNG de 1 pixel se décode sans dépendance — une seule scanline, et tous les filtres PNG
// référencent des voisins hors cadre (donc 0), si bien que l'octet brut EST la valeur.
const hex2 = (v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
function avgColorOfFile(file) {
  const tmp = join(ROOT, `.avg-1px-${process.pid}.png`);
  try {
    execFileSync('sips', ['-z', '1', '1', file, '-s', 'format', 'png', '--out', tmp], { stdio: 'ignore' });
    const d = readFileSync(tmp);
    let pos = 8, idat = [];
    let ct = 6;
    while (pos < d.length) {
      const len = d.readUInt32BE(pos);
      const typ = d.toString('ascii', pos + 4, pos + 8);
      if (typ === 'IHDR') ct = d[pos + 8 + 9];
      else if (typ === 'IDAT') idat.push(d.subarray(pos + 8, pos + 8 + len));
      pos += 12 + len;
    }
    const raw = inflateSync(Buffer.concat(idat));
    const bpp = ct === 6 ? 4 : ct === 2 ? 3 : 1;
    const px = raw.subarray(1, 1 + bpp);
    const [r, g, b] = bpp === 1 ? [px[0], px[0], px[0]] : [px[0], px[1], px[2]];
    return `#${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase();
  } finally {
    if (existsSync(tmp)) rmSync(tmp);
  }
}

// ————— les fonds —————
// Chaque provider rend une liste normalisée : { id, avg, url, width, height, credit… }.
// `avg` peut être null → il sera calculé après téléchargement de la vignette (cas du Met).
async function jget(url, headers = {}) {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`${r.status} sur ${url} : ${(await r.text()).slice(0, 140)}`);
  return { json: await r.json(), left: r.headers.get('x-ratelimit-remaining') };
}

const PROVIDERS = {
  async pexels(q) {
    const u = new URL('https://api.pexels.com/v1/search');
    u.searchParams.set('query', q);
    u.searchParams.set('per_page', '80');
    if (orientation) u.searchParams.set('orientation', orientation);
    const { json, left } = await jget(u, { Authorization: KEY });
    return {
      total: json.total_results || 0, left,
      items: (json.photos || []).map((p) => ({
        id: `pexels-${p.id}`, avg: p.avg_color, url: p.src[size] || p.src.large2x,
        width: p.width, height: p.height, alt: p.alt || '',
        credit: p.photographer, credit_url: p.photographer_url, source: p.url,
        license: 'Pexels License (usage libre, attribution non requise)',
      })),
    };
  },

  async met(q) {
    // Le Met ne publie aucune couleur : chaque candidat coûte une requête de détail, et sa
    // couleur moyenne devra être calculée sur la vignette. D'où --scan, qui borne le balayage.
    const s = new URL('https://collectionapi.metmuseum.org/public/collection/v1/search');
    s.searchParams.set('q', q);
    s.searchParams.set('hasImages', 'true');
    const { json: found } = await jget(s);
    const ids = (found.objectIDs || []).slice(0, scan);
    const items = [];
    for (const id of ids) {
      try {
        const { json: o } = await jget(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
        if (!o.isPublicDomain || !o.primaryImageSmall) continue;
        items.push({
          id: `met-${id}`, avg: null, url: o.primaryImage || o.primaryImageSmall,
          probe: o.primaryImageSmall, width: null, height: null,
          alt: [o.title, o.objectDate].filter(Boolean).join(' — '),
          credit: o.artistDisplayName || 'Metropolitan Museum of Art',
          credit_url: o.objectURL, source: o.objectURL,
          license: 'CC0 / domaine public (The Met)',
        });
      } catch { /* un objet indisponible ne casse pas le balayage */ }
    }
    return { total: found.total || 0, left: null, items };
  },
};

// ————— récolte ————— //
const outDir = join(ROOT, 'assets', 'photos', slug);
mkdirSync(outDir, { recursive: true });
const manifestPath = join(outDir, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { slug, photos: [] };
const known = new Set(manifest.photos.map((p) => p.id));

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(outDir, file), buf);
  return buf.length;
}

let quotaLeft = null;
for (const q of queries) {
  const { items, total, left } = await PROVIDERS[provider](q);
  quotaLeft = left ?? quotaLeft;
  const fresh = items.filter((it) => !known.has(it.id));

  // Les candidats sans couleur publiée : on sonde la vignette, on calcule, on jette la sonde.
  // Le tri reste donc le même pour les trois fonds — seul son COÛT change.
  let probed = 0;
  for (const it of fresh) {
    if (it.avg || any) continue;
    const probeFile = `.probe-${it.id}.jpg`;
    const ok = await download(it.probe || it.url, probeFile);
    if (ok) { it.avg = avgColorOfFile(join(outDir, probeFile)); probed++; }
    rmSync(join(outDir, probeFile), { force: true });
  }

  const scored = fresh
    .filter((it) => any || it.avg)
    .map((it) => ({ it, m: any ? { hex: null, dE: 0 } : bestMatch(it.avg) }))
    .filter((x) => any || x.m.dE <= tol)
    .sort((a, b) => a.m.dE - b.m.dE)
    .slice(0, n);

  console.log(`\n« ${q} » [${provider}] — ${total} résultats, ${items.length} candidats` +
    `${probed ? `, ${probed} sondés` : ''}, ${scored.length} retenus (ΔE ≤ ${tol})`);
  for (const { it, m } of scored) {
    const file = `${slug}-${it.id}.jpg`;
    const bytes = await download(it.url, file);
    if (!bytes) { console.log(`  ✗ ${it.id} : téléchargement échoué`); continue; }
    known.add(it.id);
    manifest.photos.push({
      id: it.id, file, query: q, provider, avg_color: it.avg, matched: m.hex, delta_e: m.dE,
      width: it.width, height: it.height, size_used: provider === 'pexels' ? size : 'natif',
      photographer: it.credit, photographer_url: it.credit_url, source: it.source,
      license: it.license, alt: it.alt, bytes,
    });
    console.log(`  ✓ ${file}  ΔE ${m.dE}${m.hex ? ` → ${m.hex}` : ''}  ${it.avg || '—'}  ${Math.round(bytes / 1024)} ko`);
  }
}

// ————— manifeste + planche-contact —————
// Le manifeste est VERSIONNÉ (léger, texte, il porte les crédits et permet de re-télécharger à
// l'identique) ; les .jpg sont gitignorés — la doctrine du dépôt interdit le poids binaire dans
// l'historique, comme pour proofs/.
manifest.providers = [...new Set(manifest.photos.map((p) => p.provider || 'pexels'))];
manifest.palette = any ? null : effective;
if (dropped.length) manifest.palette_neutrals_ignored = dropped;
manifest.tolerance_delta_e = any ? null : tol;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const cells = manifest.photos.map((p) => `  <figure>
    <img src="${p.file}" alt="${(p.alt || '').replace(/"/g, '&quot;')}">
    <figcaption>${p.provider || 'pexels'} · ${p.query} · ΔE ${p.delta_e} ·
      <span style="background:${p.avg_color}"></span> ${p.avg_color}</figcaption>
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

const files = readdirSync(outDir).filter((f) => f.endsWith('.jpg'));
console.log(`\n→ ${manifest.photos.length} image(s) au manifeste · ${files.length} fichier(s) dans assets/photos/${slug}/`);
if (quotaLeft) console.log(`   quota Pexels restant ce mois : ${quotaLeft}`);
console.log(`   regarder la récolte : node bin/render.mjs assets/photos/${slug}/board.html 1600 1180`);
