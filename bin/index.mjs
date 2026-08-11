#!/usr/bin/env node
// Reconstruit patterns.db + INDEX.md + index.json depuis les fichiers du dépôt. Idempotent :
// tout est entièrement recréé à chaque passage. Sort en code 1 si un pattern est invalide —
// une bibliothèque à moitié indexée qui se tait est pire qu'une erreur.
import { unlinkSync, existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, DB, FAMILIES, MEDIA, loadPatterns, loadSystems, mediaOf, sql, q } from './lib.mjs';

const SCHEMA = `
CREATE TABLE refs (
  id TEXT PRIMARY KEY, name TEXT, notes TEXT, tokens_json TEXT, type_json TEXT
);
CREATE TABLE patterns (
  id TEXT PRIMARY KEY, name TEXT, family TEXT, ref TEXT,
  intent TEXT, when_to_use TEXT, avoid_when TEXT, notes TEXT,
  html TEXT, html_path TEXT, vars_json TEXT, slots_json TEXT, bench INTEGER,
  media TEXT
);
CREATE TABLE tags (pattern_id TEXT, tag TEXT, PRIMARY KEY (pattern_id, tag));
CREATE VIRTUAL TABLE patterns_fts USING fts5(
  id UNINDEXED, name, family, intent, when_to_use, tags, html
);
CREATE INDEX idx_patterns_family ON patterns(family);
CREATE INDEX idx_patterns_ref ON patterns(ref);
`;

const errors = [];
const patterns = loadPatterns();
const systems = loadSystems();
const refIds = new Set(systems.map((s) => s.id));

for (const p of patterns) {
  if (!p.name) errors.push(`${p.id} : champ "name" manquant`);
  if (!FAMILIES.includes(p.family)) {
    errors.push(`${p.id} : famille "${p.family}" hors vocabulaire (${FAMILIES.join(', ')})`);
  } else if (!p.id.startsWith(`${p.family}-`)) {
    // Le nom du fichier EST la taxonomie : si le préfixe ment, l'index ment aussi.
    errors.push(`${p.id} : le fichier devrait commencer par "${p.family}-" (nomenclature)`);
  }
  if (!p.ref) errors.push(`${p.id} : champ "ref" manquant (de quelle référence est-il extrait ?)`);
  else if (!refIds.has(p.ref)) errors.push(`${p.id} : référence "${p.ref}" inconnue (systems/)`);
  if (!p.intent) errors.push(`${p.id} : champ "intent" manquant`);
  if (!(p.tags?.length)) errors.push(`${p.id} : aucun tag — il sera introuvable`);
  // Le média est un vocabulaire fermé, comme la famille : un producteur (deck, mailing, flyer)
  // filtre dessus. Un média inventé ne remonterait dans AUCUN filtre — panne silencieuse.
  for (const m of p.media || []) {
    if (!MEDIA.includes(m)) {
      errors.push(`${p.id} : média "${m}" hors vocabulaire (${MEDIA.join(', ')})`);
    }
  }
  if (!p.html) errors.push(`${p.id} : aucun ${p.id}.html`);
  // Des benchmarks sans racine mesurable ne sont pas vérifiables : bin/check.mjs ne saurait
  // pas contre quoi calculer les ratios. Mieux vaut refuser que laisser croire au contrôle.
  if (p.benchmarks?.length && !p.geometry?.root) {
    errors.push(`${p.id} : "benchmarks" sans "geometry.root" — bin/check.mjs ne peut rien mesurer`);
  }
  for (const b of p.benchmarks || []) {
    if (!b.name || !b.measure) errors.push(`${p.id} : un benchmark sans "name" ou sans "measure"`);
    if (b.expect === undefined && b.min === undefined && b.max === undefined) {
      errors.push(`${p.id} : benchmark "${b.name}" sans seuil (expect / min / max)`);
    }
  }
  // Un pattern doit être thémable : pas de couleur hexadécimale en dur dans le HTML.
  // Les entités HTML numériques (`&#8599;` = ↗) ne sont PAS des couleurs : les retirer avant
  // le test, sinon un glyphe de flèche fait échouer l'indexation de tout le dépôt — vu le
  // 30/07 sur card-03-stat-accent. Un faux positif récurrent se corrige dans le détecteur.
  const htmlSansEntites = (p.html || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/&#x?[0-9a-fA-F]+;/g, '');
  if (p.html && /#[0-9a-fA-F]{3,8}\b/.test(htmlSansEntites)) {
    errors.push(`${p.id} : couleur en dur dans le HTML — passer par une variable --vl-*`);
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} erreur(s), base non écrite :`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

if (existsSync(DB)) unlinkSync(DB);

const rows = [SCHEMA, 'BEGIN;'];
for (const s of systems) {
  rows.push(
    `INSERT INTO refs VALUES (${q(s.id)},${q(s.name)},${q(s.notes)},` +
      `${q(JSON.stringify(s.tokens || {}))},${q(JSON.stringify(s.type || {}))});`
  );
}
for (const p of patterns) {
  rows.push(
    `INSERT INTO patterns VALUES (${q(p.id)},${q(p.name)},${q(p.family)},${q(p.ref)},` +
      `${q(p.intent)},${q(p.when_to_use)},${q(p.avoid_when)},${q(p.notes)},${q(p.html)},` +
      `${q(p.htmlPath)},${q(JSON.stringify(p.vars || []))},${q(JSON.stringify(p.slots || []))},` +
      `${p.benchmarks?.length || 0},${q(mediaOf(p).join(' '))});`
  );
  for (const t of p.tags) rows.push(`INSERT INTO tags VALUES (${q(p.id)},${q(t)});`);
  rows.push(
    `INSERT INTO patterns_fts VALUES (${q(p.id)},${q(p.name)},${q(p.family)},${q(p.intent)},` +
      `${q(p.when_to_use)},${q(p.tags.join(' '))},${q(p.html)});`
  );
}
rows.push('COMMIT;');
sql(rows.join('\n'));

// ————— Index LISIBLE, versionné, sans dépendance ————— //
// patterns.db est parfait pour chercher, inutile pour un agent qui n'a pas sqlite sous la main
// (ou qui lit le dépôt depuis un autre skill). On sort donc aussi, à CHAQUE indexation, deux
// fichiers de texte committés : INDEX.md pour lire, index.json pour la machine. Ils sont
// GÉNÉRÉS — ne jamais les éditer à la main, la prochaine indexation les écrase.
//
// L'ordre est celui de la DÉCISION, pas celui du stockage : un tableau de routage d'abord
// (une ligne par pattern, on choisit sans rien dérouler), le détail ensuite. Un agent qui
// cherche « une carte de chiffre » doit trancher en lisant 17 lignes, pas 300.
const byFamily = new Map(FAMILIES.map((f) => [f, []]));
for (const p of patterns.sort((a, b) => a.id.localeCompare(b.id))) byFamily.get(p.family).push(p);
const byRef = new Map(systems.map((s) => [s.id, []]));
for (const p of patterns) byRef.get(p.ref).push(p);
const withBench = patterns.filter((p) => p.benchmarks?.length);
const short = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const deckOf = (id) => (existsSync(join(ROOT, 'decks', `${id}.html`)) ? `decks/${id}.html` : null);

const md = [
  '# INDEX — visual-lab en un fichier',
  '',
  '**Généré par `node bin/index.mjs`. Ne jamais éditer à la main.**',
  '',
  `${patterns.length} patterns · ${systems.length} références · ` +
    `${withBench.length} vérifiés par benchmarks mesurés.`,
  '',
  '## Comment se servir de ce fichier',
  '',
  '1. **Catalogue** : une ligne par pattern — c\'est là qu\'on choisit, sans rien dérouler.',
  '2. **Détail** : pour le pattern retenu, quand l\'employer, quand l\'éviter, ce qu\'il attend.',
  '3. Le fragment est `patterns/<id>.html` ; il lui faut le bloc `:root` de sa référence —',
  '   `node bin/search.mjs --show <id>` sort les deux d\'un coup, prêts à coller.',
  '4. Après toute modification : `node bin/index.mjs` → `node bin/check.mjs <id>` (vert obligatoire)',
  '   → `node bin/render.mjs --pattern <id>` et REGARDER.',
  '',
  '**Nomenclature** — un pattern se nomme `<famille>[-NN]-<mots>`, le numéro n\'apparaissant que',
  `si la famille en compte plusieurs. Familles : ${FAMILIES.join(', ')}. Une référence se nomme`,
  '`ref-NN-<slug>` et porte le même id dans `systems/` (ses tokens) et `decks/` (sa reconstitution).',
  '',
  `**Médias** — où un pattern est censé servir : ${MEDIA.join(', ')}. C'est une INTENTION de`,
  'routage, pas une garantie de rendu : la faisabilité sur une cible contrainte se PROUVE avec',
  '`node bin/emit.mjs <id> --target email` (ou `print`), qui refuse ce que la cible ne sait pas',
  'rendre. Filtrer : `node bin/search.mjs --media email`.',
  '',
  '## Catalogue',
  '',
  '| pattern | ce que ça fait | médias | bench | référence |',
  '|---|---|---|---|---|',
];
for (const f of FAMILIES) {
  for (const p of byFamily.get(f)) {
    md.push(
      `| \`${p.id}\` | ${short(p.intent)} | ${mediaOf(p).join(' ')} | ` +
        `${p.benchmarks?.length || '—'} | ${p.ref} |`
    );
  }
}
md.push('', '## Détail', '');
for (const f of FAMILIES) {
  const list = byFamily.get(f);
  if (!list.length) continue;
  md.push(`### ${f}`, '');
  for (const p of list) {
    md.push(`**${p.id}** — ${p.name}`, '');
    md.push(`- employer : ${short(p.when_to_use) || '—'}`);
    md.push(`- éviter : ${short(p.avoid_when) || '—'}`);
    if (p.slots?.length) md.push(`- à remplir : ${p.slots.join(', ')}`);
    if (p.vars?.length) md.push(`- variables : ${p.vars.map((v) => v.name).join(', ')}`);
    if (p.pptx?.emitter) md.push(`- .pptx : \`${p.pptx.emitter}\``);
    md.push(`- tags : ${p.tags.join(', ')}`, '');
  }
}
md.push('## Références', '');
md.push('| référence | charte | patterns extraits | deck |', '|---|---|---|---|');
for (const s of systems.sort((a, b) => a.id.localeCompare(b.id))) {
  const list = byRef.get(s.id);
  const deck = deckOf(s.id);
  md.push(
    `| \`${s.id}\` | ${short(s.name)} | ${list.length ? list.map((p) => `\`${p.id}\``).join(', ') : '—'}` +
      ` | ${deck ? `\`${deck}\`` : '—'} |`
  );
}
md.push('');
md.push('Ce que chaque référence fait, sa palette et sa typo : [SPEC-SOURCES.md](SPEC-SOURCES.md).');
md.push('');
writeFileSync(join(ROOT, 'INDEX.md'), md.join('\n'));

writeFileSync(
  join(ROOT, 'index.json'),
  JSON.stringify(
    {
      generated_by: 'node bin/index.mjs',
      read_first: 'INDEX.md — le catalogue lisible. Ici : les ratios, les benchmarks et les tokens.',
      naming: '<famille>[-NN]-<mots> pour un pattern, ref-NN-<slug> pour une référence.',
      families: FAMILIES,
      media: MEDIA,
      counts: { patterns: patterns.length, refs: systems.length, checkable: withBench.length },
      patterns: patterns.map((p) => ({
        id: p.id, name: p.name, family: p.family, ref: p.ref, media: mediaOf(p),
        intent: p.intent, when_to_use: p.when_to_use, avoid_when: p.avoid_when,
        tags: p.tags, vars: p.vars || [], slots: p.slots || [],
        geometry: p.geometry || null, benchmarks: p.benchmarks || [], pptx: p.pptx || null,
        html: `patterns/${p.id}.html`,
      })),
      refs: systems.map((s) => ({
        id: s.id, name: s.name, patterns: byRef.get(s.id).map((p) => p.id),
        deck: deckOf(s.id), tokens: s.tokens || {}, type: s.type || {},
      })),
    },
    null,
    2
  ) + '\n'
);

// La VITRINE se régénère avec l'index, et non à la main : un catalogue à jour à côté d'une
// vitrine périmée est pire qu'une vitrine absente — on croit regarder l'état du dépôt.
execFileSync(process.execPath, [join(ROOT, 'bin', 'gallery.mjs')], { stdio: 'ignore' });

console.log(
  `✓ ${patterns.length} pattern(s), ${systems.length} référence(s) → patterns.db · ` +
    `INDEX.md · index.json · gallery.html  (${withBench.length} vérifiable(s) par bin/check.mjs)`
);
