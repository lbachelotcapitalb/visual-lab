#!/usr/bin/env node
// Interroge la bibliothèque.
//   node bin/search.mjs "carte argument"        recherche plein texte
//   node bin/search.mjs --family card           filtre par famille
//   node bin/search.mjs --ref ref-03-bento-dark-pitch
//   node bin/search.mjs --media email           ce qui est destiné à un mailing
//   node bin/search.mjs --show card-03-stat-accent   le HTML + les tokens de sa référence
//   node bin/search.mjs --list                  tout, groupé par référence
import { existsSync } from 'node:fs';
import { DB, MEDIA, query, q, loadSystems, systemToCss } from './lib.mjs';

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
  `${r.id}\n   ${r.name}  ·  ${r.family}  ·  ${r.ref}  ·  ${r.media}` +
  `${r.bench ? `  ·  ${r.bench} bench` : ''}\n   ${r.intent}`;

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
  const sys = loadSystems().find((s) => s.id === p.ref);
  if (sys) console.log(`\n<style>\n${systemToCss(sys)}\n</style>`);
  console.log(`\n${p.html}`);
  if (p.notes) console.log(`\n<!-- notes : ${p.notes} -->`);
  process.exit(0);
}

let rows;
if (flag('list')) {
  rows = query('SELECT * FROM patterns ORDER BY ref, family, id');
} else if (flag('family')) {
  rows = query(`SELECT * FROM patterns WHERE family = ${q(flag('family'))} ORDER BY id`);
} else if (flag('ref')) {
  rows = query(`SELECT * FROM patterns WHERE ref LIKE ${q(`%${flag('ref')}%`)} ORDER BY id`);
} else if (flag('media')) {
  const m = flag('media');
  if (!MEDIA.includes(m)) {
    // Un média mal orthographié rendrait « 0 résultat », qu'on lirait comme « la bibliothèque
    // n'a rien pour ce canal » — le pire des silences. On refuse au lieu de répondre vide.
    console.error(`Média inconnu : "${m}". Vocabulaire : ${MEDIA.join(', ')}`);
    process.exit(1);
  }
  rows = query(
    `SELECT * FROM patterns WHERE media LIKE ${q(`%${m}%`)} ORDER BY family, id`
  );
} else if (argv.length) {
  // FTS5 assemble les termes en ET par défaut : une question posée en langage naturel
  // (« barres arrondies histogramme ») ne trouve alors jamais rien, car un seul mot absent
  // suffit à tout annuler. On passe en OU et on laisse `rank` remonter les patterns qui
  // matchent le plus de termes. Le suffixe * rattrape les variantes (arrondi/arrondies).
  const terms = argv
    .filter((a) => !a.startsWith('--'))
    .flatMap((a) => a.split(/\s+/))
    .filter((t) => t.length > 2)
    .map((t) => `"${t.replace(/"/g, '')}"*`)
    .join(' OR ');
  rows = query(
    `SELECT p.* FROM patterns_fts f JOIN patterns p ON p.id = f.id
     WHERE patterns_fts MATCH ${q(terms)} ORDER BY rank`
  );
} else {
  console.log(
    'usage : search.mjs "<termes>" | --family <f> | --ref <ref> | --media <m> | --show <id> | --list'
  );
  process.exit(0);
}

if (!rows.length) {
  console.log('Aucun pattern. `--list` pour tout voir.');
  process.exit(0);
}
let current = null;
for (const r of rows) {
  if (flag('list') && r.ref !== current) {
    current = r.ref;
    console.log(`\n── ${current} ──`);
  }
  console.log(brief(r) + '\n');
}
console.log(`${rows.length} résultat(s).`);
