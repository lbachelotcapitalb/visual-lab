#!/usr/bin/env node
// Transforme une soumission VALIDÉE en fichiers du dépôt, puis régénère l'index.
//
//   node scripts/submission/materialise.mjs corps.md --author <login>
//
// Écrit `patterns/<id>.html`, `patterns/<id>.json`, et `systems/<ref>.json` si la charte est
// nouvelle. Ne commit rien : c'est le workflow (ou toi) qui décide de la branche.
//
// Le contributeur est inscrit dans le contrat (`credit`), pas seulement dans l'historique git :
// un pattern se relit des mois plus tard sans `git blame` sous les yeux.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseIssueBody, validate } from './parse-issue.mjs';

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--'));
const flag = (n) => { const i = argv.indexOf('--' + n); return i === -1 ? null : argv[i + 1]; };

if (!file) { console.error('usage: materialise.mjs <corps.md> [--author <login>] [--issue <n>]'); process.exit(2); }

const verdict = validate(parseIssueBody(readFileSync(file, 'utf8')));
if (!verdict.ok) {
  console.error('Soumission invalide — rien n\'a été écrit :');
  for (const e of verdict.errors) console.error(`  ✗ ${e.champ} : ${e.quoi}`);
  process.exit(1);
}
const d = verdict.data;

/* ── le fragment ── */
const header = `<!-- ${d.id} — ${d.name}.\n     ${d.intent}\n     Versé par soumission${flag('author') ? ` de @${flag('author')}` : ''}${flag('issue') ? `, issue #${flag('issue')}` : ''}. -->\n`;
const html = d.html.trim();
writeFileSync(join(ROOT, 'patterns', `${d.id}.html`),
  (html.startsWith('<!--') ? '' : header) + html + '\n');

/* ── le contrat ── */
const contract = {
  name: d.name,
  family: d.family,
  ref: d.ref,
  media: d.media,
  intent: d.intent,
  when_to_use: d.when_to_use,
  avoid_when: d.avoid_when,
  tags: d.tags,
  // `vars` se déduit du fragment : lister à la main ce que le CSS déclare déjà, c'est se
  // condamner à ce que les deux divergent au premier ajustement.
  vars: [...new Set([...html.matchAll(/var\((--vl-[a-z0-9-]+)/g)].map((m) => m[1]))]
    .sort().map((name) => ({ name, role: '', default: '' })),
  slots: [],
  ...(d.frame ? { geometry: { root: (html.match(/class="([a-z0-9_-]+)"/i) || [, ''])[1] ? '.' + html.match(/class="([a-z0-9_-]+)"/i)[1] : '', frame: d.frame } } : {}),
  benchmarks: [],
  ...(flag('author') ? { credit: `@${flag('author')}` } : {}),
};
writeFileSync(join(ROOT, 'patterns', `${d.id}.json`), JSON.stringify(contract, null, 2) + '\n');

/* ── la charte, si elle est nouvelle ── */
let newRef = false;
if (d.refIsNew) {
  const tokens = {};
  for (const m of d.tokens.matchAll(/(--vl-[a-z0-9-]+)\s*:\s*([^;\n}]+)/g)) tokens[m[1]] = m[2].trim();
  const sysPath = join(ROOT, 'systems', `${d.ref}.json`);
  if (!existsSync(sysPath)) {
    writeFileSync(sysPath, JSON.stringify({
      name: d.ref.replace(/^ref-\d+-/, '').replace(/-/g, ' '),
      notes: `Charte apportée avec ${d.id}${flag('author') ? ` par @${flag('author')}` : ''}.`,
      tokens,
      type: {},
    }, null, 2) + '\n');
    newRef = true;
  }
}

console.log(`écrit  patterns/${d.id}.html`);
console.log(`écrit  patterns/${d.id}.json  (${contract.vars.length} variable(s) détectée(s))`);
if (newRef) console.log(`écrit  systems/${d.ref}.json`);
console.log(`id=${d.id}`);
if (verdict.warnings.length) {
  console.log('réserves :');
  for (const w of verdict.warnings) console.log(`  ⚠ ${w.champ} : ${w.quoi}`);
}
