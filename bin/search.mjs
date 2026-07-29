#!/usr/bin/env node
// Interroge la bibliothèque.
//   node bin/search.mjs "carte argument"        recherche plein texte
//   node bin/search.mjs --kind chart            filtre par nature
//   node bin/search.mjs --source ref-03-bento-dark-pitch
//   node bin/search.mjs --show pat-tile-kpi     sort le HTML + les tokens du système
//   node bin/search.mjs --list                  tout, groupé par référence
import { existsSync } from 'node:fs';
import { DB, query, q, loadSystems, systemToCss } from './lib.mjs';

if (!existsSync(DB)) {
  console.error('patterns.db absent — lance d’abord : node bin/index.mjs');
  process.exit(1);
}

const argv = process.argv.slice(2);
const flag = (n) => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? null : argv[i + 1] ?? true;
};

const brief = (r) =>
  `${r.id}\n   ${r.name}  ·  ${r.kind}/${r.family}  ·  ${r.source}${r.system ? ` · ${r.system}` : ''}\n   ${r.intent}`;

if (flag('show')) {
  const id = flag('show');
  const [p] = query(`SELECT * FROM patterns WHERE id = ${q(id)}`);
  if (!p) {
    console.error(`Pattern "${id}" introuvable.`);
    process.exit(1);
  }
  console.log(`/* ${p.id} — ${p.name} */`);
  console.log(`/* quand : ${p.when_to_use || '—'} */`);
  if (p.avoid_when) console.log(`/* éviter : ${p.avoid_when} */`);
  const sys = loadSystems().find((s) => s.id === p.system);
  if (sys) console.log(`\n<style>\n${systemToCss(sys)}\n</style>`);
  console.log(`\n${p.html || '(pattern de type "rule" — pas de HTML, voir notes)'}`);
  if (p.notes) console.log(`\n<!-- notes : ${p.notes} -->`);
  process.exit(0);
}

let rows;
if (flag('list')) {
  rows = query('SELECT * FROM patterns ORDER BY source, kind, id');
} else if (flag('kind')) {
  rows = query(`SELECT * FROM patterns WHERE kind = ${q(flag('kind'))} ORDER BY id`);
} else if (flag('source')) {
  rows = query(`SELECT * FROM patterns WHERE source LIKE ${q(`%${flag('source')}%`)} ORDER BY id`);
} else if (argv.length) {
  const terms = argv.filter((a) => !a.startsWith('--')).join(' ');
  rows = query(
    `SELECT p.* FROM patterns_fts f JOIN patterns p ON p.id = f.id
     WHERE patterns_fts MATCH ${q(terms)} ORDER BY rank`
  );
} else {
  console.log('usage : search.mjs "<termes>" | --kind <k> | --source <ref> | --show <id> | --list');
  process.exit(0);
}

if (!rows.length) {
  console.log('Aucun pattern. `--list` pour tout voir.');
  process.exit(0);
}
let current = null;
for (const r of rows) {
  if (flag('list') && r.source !== current) {
    current = r.source;
    console.log(`\n── ${current} ──`);
  }
  console.log(brief(r) + '\n');
}
console.log(`${rows.length} résultat(s).`);
