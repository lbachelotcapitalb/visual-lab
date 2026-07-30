#!/usr/bin/env node
// Crée le squelette d'un pattern, avec les champs que bin/index.mjs exige.
//   node bin/new.mjs pat-tile-kpi --source ref-03-bento-dark-pitch --system sys-03 --kind component
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIRS, KINDS } from './lib.mjs';

const argv = process.argv.slice(2);
const id = argv[0];
const flag = (n, d = '') => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? d : argv[i + 1];
};

if (!id || !id.startsWith('pat-')) {
  console.error('usage : new.mjs pat-<famille>-<slug> --source ref-NN-… --system sys-NN --kind <kind>');
  console.error(`kinds : ${KINDS.join(', ')}`);
  process.exit(1);
}

const jsonPath = join(DIRS.patterns, `${id}.json`);
const htmlPath = join(DIRS.patterns, `${id}.html`);
if (existsSync(jsonPath)) {
  console.error(`${id} existe déjà.`);
  process.exit(1);
}

const kind = flag('kind', 'component');
writeFileSync(
  jsonPath,
  JSON.stringify(
    {
      name: 'À NOMMER',
      kind,
      family: id.split('-')[1],
      source: flag('source'),
      system: flag('system'),
      intent: 'Ce que ce pattern fait gagner, en une phrase.',
      when_to_use: 'Le cas où on le sort.',
      avoid_when: 'Le cas où il dessert.',
      tags: [],
      vars: [{ name: '--vl-accent', role: 'couleur d’accent', default: 'var(--vl-accent)' }],
      slots: [],
      // La géométrie et les benchmarks sont ce qui rend le pattern VÉRIFIABLE (bin/check.mjs)
      // et utilisable en .pptx (kit/vl_pptx.py). `root` est le sélecteur mesuré : W et H en
      // viennent, donc tous les benchmarks s'écrivent en RATIOS de cette boîte.
      geometry: {
        root: `.${id}`,
        frame: [430, 340],
        ratios: {},
        type_px: {},
        pad_ratio: { top: 0, x: 0, bottom: 0 },
      },
      benchmarks: [
        {
          name: 'À REMPLACER — une assertion mesurable, pas un avis',
          measure: `num('.${id}','paddingLeft') / W`,
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

if (kind !== 'rule') {
  writeFileSync(
    htmlPath,
    `<!-- ${id} — fragment autonome. Couleurs via --vl-* uniquement, aucune valeur en dur. -->\n` +
      `<div class="${id}">\n</div>\n\n<style>\n.${id} {\n}\n</style>\n`
  );
}

console.log(`✓ ${jsonPath}${kind !== 'rule' ? `\n✓ ${htmlPath}` : ''}`);
console.log(
  'Ensuite, dans cet ordre : node bin/index.mjs → node bin/check.mjs ' +
    id +
    ' (jusqu\'au vert) → node bin/render.mjs --pattern ' +
    id +
    ' (et REGARDER).'
);
