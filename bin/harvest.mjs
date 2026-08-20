#!/usr/bin/env node
// LE RAYON EXTÉRIEUR : récolte une bibliothèque tierce déclarée dans `sources/<id>.json`,
// et en écrit l'INDEX (métadonnées seules) dans `sources/<id>.index.json`.
//
//   node bin/harvest.mjs uiverse            → récolte (clone si absent)
//   node bin/harvest.mjs uiverse --refresh  → re-clone la source
//   node bin/harvest.mjs --list             → les sources déclarées et leur état
//
// SOFTCODE. Rien de ce script ne connaît Uiverse : tout vient du manifeste — d'où on clone,
// comment lire l'auteur et les tags, quelles catégories garder et comment les nommer, ce
// qu'on écarte et POURQUOI. Brancher une deuxième bibliothèque = un fichier JSON de plus.
//
// CE QUI N'EST PAS VERSIONNÉ. Le code des éléments reste dans `.sources/` (ignoré par git) :
// le dépôt indexe une bibliothèque tierce, il ne la ré-héberge pas dans son historique. Ce
// qui EST versionné, c'est l'index — donc la récolte est auditable et rejouable sans avoir à
// faire confiance au clone local. Le site, lui, sert les fichiers depuis le cache au build.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const SOURCES = join(ROOT, 'sources');
export const CACHE = join(ROOT, '.sources');

export const manifestes = () => (existsSync(SOURCES) ? readdirSync(SOURCES) : [])
  .filter((f) => f.endsWith('.json') && !f.endsWith('.index.json'))
  .map((f) => JSON.parse(readFileSync(join(SOURCES, f), 'utf8')));

export const cacheDe = (m) => join(CACHE, m.id);
export const indexDe = (m) => join(SOURCES, `${m.id}.index.json`);
export const lireIndex = (m) => (existsSync(indexDe(m)) ? JSON.parse(readFileSync(indexDe(m), 'utf8')) : null);

function cloner(m, refresh) {
  const dir = cacheDe(m);
  if (refresh) rmSync(dir, { recursive: true, force: true });
  if (existsSync(dir)) return { dir, cloné: false };
  mkdirSync(CACHE, { recursive: true });
  console.log(`   clone ${m.fetch.git} …`);
  execFileSync('git', ['clone', '--depth', String(m.fetch.depth || 1), '--quiet', m.fetch.git, dir],
    { stdio: ['ignore', 'inherit', 'inherit'] });
  return { dir, cloné: true };
}

export function recolter(m, { refresh = false } = {}) {
  const { dir } = cloner(m, refresh);
  // Deux motifs indépendants : l'auteur et les tags ne vivent pas toujours dans le même
  // commentaire, ni dans la même syntaxe. Un motif unique qui exige les deux d'un coup rate
  // silencieusement TOUS les fichiers d'un format qu'on n'avait pas prévu — vécu : 3 330
  // éléments récoltés avec zéro tag, et la recherche du rayon vide sans que rien n'alerte.
  const reAuteur = new RegExp(m.element.author, 'i');
  const reTags = m.element.tags ? new RegExp(m.element.tags, 'i') : null;
  const slugRe = new RegExp(m.element.slugFrom);
  const exclusions = (m.exclude || []).map((x) => ({
    ...x,
    re: new RegExp(x.absent || x.present, 'i'),
    absent: Boolean(x.absent),
  }));

  const elements = [];
  const ecartes = {};
  for (const [cat, nom] of Object.entries(m.categories)) {
    let files;
    try { files = readdirSync(join(dir, cat)).filter((f) => f.endsWith('.html')).sort(); }
    catch { console.warn(`   ⚠ catégorie absente du clone : ${cat}`); continue; }

    for (const file of files) {
      const brut = readFileSync(join(dir, cat, file), 'utf8');
      const refus = exclusions.find((x) => (x.absent ? !x.re.test(brut) : x.re.test(brut)));
      if (refus) { ecartes[refus.motif] = (ecartes[refus.motif] || 0) + 1; continue; }

      const author = (brut.match(reAuteur) || [])[1] || file.split('_')[0];
      const slug = (file.match(slugRe) || [, file.replace(/\.html$/, '')])[1];
      const tagsBruts = reTags ? (brut.match(reTags) || [])[1] || '' : '';
      elements.push({
        cat, nom, file, slug, author,
        tags: tagsBruts.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
        permalink: (m.element.permalink || '').replace('{author}', author).replace('{slug}', slug),
      });
    }
  }

  const parCat = {};
  for (const e of elements) parCat[e.cat] = (parCat[e.cat] || 0) + 1;
  const auteurs = new Set(elements.map((e) => e.author));

  // La date vient du COMMIT récolté, pas de l'horloge : deux récoltes du même état doivent
  // produire le même index, sinon le diff git ment à chaque exécution.
  let commit = null;
  try {
    commit = execFileSync('git', ['-C', dir, 'log', '-1', '--format=%H %cI'], { encoding: 'utf8' }).trim();
  } catch { /* clone sans historique */ }

  const index = {
    source: m.id,
    commit,
    total: elements.length,
    auteurs: auteurs.size,
    parCategorie: parCat,
    ecartes,
    elements,
  };
  writeFileSync(indexDe(m), JSON.stringify(index, null, 1) + '\n');
  return index;
}

/* ─── CLI ─── */
const argv = process.argv.slice(2);
if (argv.length && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const tous = manifestes();
  if (argv.includes('--list')) {
    for (const m of tous) {
      const idx = lireIndex(m);
      console.log(`${m.id.padEnd(12)} ${m.licence.padEnd(6)} ${idx ? `${idx.total} éléments · ${idx.auteurs} auteurs` : 'jamais récolté'}`
        + `  ${existsSync(cacheDe(m)) ? '· cache présent' : '· cache absent'}`);
    }
    process.exit(0);
  }
  const id = argv.find((a) => !a.startsWith('--'));
  const m = tous.find((x) => x.id === id);
  if (!m) { console.error(`Source inconnue : ${id}. Déclarées : ${tous.map((x) => x.id).join(', ') || '(aucune)'}`); process.exit(1); }

  console.log(`→ ${m.name} (${m.licence})`);
  const idx = recolter(m, { refresh: argv.includes('--refresh') });
  console.log(`✓ ${idx.total} éléments · ${idx.auteurs} auteurs · ${Object.keys(idx.parCategorie).length} catégories`);
  for (const [motif, n] of Object.entries(idx.ecartes)) console.log(`   ${n} écarté(s) — ${motif}`);
  console.log(`   → sources/${m.id}.index.json`);
}
