#!/usr/bin/env node
// Crée le squelette d'un pattern, avec les champs que bin/index.mjs exige, et TIENT la
// nomenclature à ma place : `<famille>[-NN]-<mots>`, le numéro n'apparaissant que si la
// famille en compte plusieurs. Quand un deuxième arrive dans une famille qui n'en avait
// qu'un, l'existant est renuméroté en -01 — sinon la règle « numéroter s'il y en a
// plusieurs » se dégrade au premier ajout et personne ne repasse derrière.
//
//   node bin/new.mjs card stat-accent --ref ref-06-orange-notched
import { writeFileSync, existsSync, readdirSync, renameSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIRS, FAMILIES, MEDIA, MEDIA_DEFAULT, loadPatterns } from './lib.mjs';

const argv = process.argv.slice(2);
const flag = (n, d = '') => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? d : argv[i + 1];
};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) i++; // le flag consomme sa valeur
  else positional.push(argv[i]);
}
const [family, slug] = positional;
const ref = flag('ref');

if (!FAMILIES.includes(family) || !slug || !ref) {
  console.error('usage : new.mjs <famille> <mots-simples> --ref ref-NN-<slug> [--force]');
  console.error(`familles : ${FAMILIES.join(', ')} · médias : ${MEDIA.join(', ')}`);
  process.exit(1);
}
if (!existsSync(join(DIRS.systems, `${ref}.json`))) {
  console.error(`Référence inconnue : systems/${ref}.json est absent.`);
  process.exit(1);
}

const existing = readdirSync(DIRS.patterns)
  .filter((f) => f.endsWith('.json') && f.startsWith(`${family}-`))
  .map((f) => f.replace('.json', ''));

// Un seul existant, non numéroté → il devient -01 et le nouveau prend -02.
let n = 0;
for (const id of existing) {
  const m = id.match(new RegExp(`^${family}-(\\d{2})-`));
  if (m) n = Math.max(n, Number(m[1]));
}
if (existing.length === 1 && n === 0) {
  const old = existing[0];
  const renamed = `${family}-01-${old.slice(family.length + 1)}`;
  for (const ext of ['json', 'html']) {
    renameSync(join(DIRS.patterns, `${old}.${ext}`), join(DIRS.patterns, `${renamed}.${ext}`));
  }
  const h = join(DIRS.patterns, `${renamed}.html`);
  writeFileSync(h, readFileSync(h, 'utf8').replaceAll(old, renamed));
  console.log(`↻ ${old} → ${renamed} (la famille en compte désormais plusieurs)`);
  n = 1;
}
// ————— Garde-fou anti-doublon ————— //
// Le 30/07, neuf patterns sur vingt-six ont été retirés : ils ne portaient pas de composition
// qu'on ne réécrit pas de tête. Verser en volume regonfle cette dette en une semaine si rien
// ne s'y oppose AU MOMENT de la création. On montre donc systématiquement ce que la famille
// contient déjà — et on REFUSE quand un mot du slug est déjà pris dans la famille, sauf
// `--force`. Un doublon accepté doit être une décision, pas un oubli.
const others = loadPatterns().filter((p) => p.family === family);
if (others.length) {
  console.log(`\n── la famille « ${family} » contient déjà ${others.length} pattern(s) ──`);
  for (const p of others.sort((a, b) => a.id.localeCompare(b.id))) {
    console.log(`  ${p.id}\n     ${String(p.intent || '').replace(/\s+/g, ' ').trim()}`);
  }
  console.log('');
}
const mots = slug.split('-').filter((w) => w.length >= 4);
const proches = others.filter((p) => mots.some((w) => p.id.includes(w)));
if (proches.length && !argv.includes('--force')) {
  console.error(
    `✗ ${proches.length} pattern(s) proche(s) : ${proches.map((p) => p.id).join(', ')}\n` +
      '  Un pattern ne se garde que s’il porte une COMPOSITION qu’on ne réécrit pas de tête.\n' +
      '  Si c’est une variante, enrichis l’existant (tokens, slots) plutôt que d’en créer un\n' +
      '  second. Si c’est vraiment autre chose : relance avec --force.'
  );
  process.exit(1);
}

const id = n ? `${family}-${String(n + 1).padStart(2, '0')}-${slug}` : `${family}-${slug}`;

const jsonPath = join(DIRS.patterns, `${id}.json`);
const htmlPath = join(DIRS.patterns, `${id}.html`);
if (existsSync(jsonPath)) {
  console.error(`${id} existe déjà.`);
  process.exit(1);
}

const cls = `vl-${slug.split('-').slice(0, 2).join('-')}`;
writeFileSync(
  jsonPath,
  JSON.stringify(
    {
      name: 'À NOMMER',
      family,
      ref,
      intent: 'Ce que ce pattern fait gagner, en une phrase.',
      when_to_use: 'Le cas où on le sort.',
      avoid_when: 'Le cas où il dessert.',
      // Où ce pattern est censé servir. Vocabulaire fermé, cf. bin/lib.mjs :
      // slide, web, email, print, social. Ce qu'on déclare ici est une INTENTION de routage ;
      // la faisabilité sur une cible contrainte se prouve par `node bin/emit.mjs <id> --target …`.
      media: MEDIA_DEFAULT,
      tags: [],
      vars: [{ name: '--vl-accent', role: 'couleur d’accent', default: 'var(--vl-accent)' }],
      slots: [],
      // La géométrie et les benchmarks sont ce qui rend le pattern VÉRIFIABLE (bin/check.mjs)
      // et utilisable en .pptx (kit/vl_pptx.py). `root` est le sélecteur mesuré : W et H en
      // viennent, donc tous les benchmarks s'écrivent en RATIOS de cette boîte.
      geometry: {
        root: `.${cls}`,
        frame: [430, 340],
        ratios: {},
        type_px: {},
        pad_ratio: { top: 0, x: 0, bottom: 0 },
      },
      benchmarks: [
        {
          name: 'À REMPLACER — une assertion mesurable, pas un avis',
          measure: `num('.${cls}','paddingLeft') / W`,
          expect: 0.08,
          tol: 0.02,
        },
      ],
      notes: '',
    },
    null,
    2
  ) + '\n'
);

writeFileSync(
  htmlPath,
  `<!-- ${id} — fragment autonome. Couleurs via --vl-* uniquement, aucune valeur en dur. -->\n` +
    `<div class="${cls}">\n</div>\n\n<style>\n.${cls} {\n}\n</style>\n`
);

console.log(`✓ ${jsonPath}\n✓ ${htmlPath}`);
console.log(
  `Ensuite, dans cet ordre : node bin/index.mjs → node bin/check.mjs ${id} (jusqu'au vert) ` +
    `→ node bin/render.mjs --pattern ${id} (et REGARDER).`
);
