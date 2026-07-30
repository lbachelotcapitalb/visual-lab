#!/usr/bin/env node
// Reconstruit patterns.db depuis les fichiers du dépôt. Idempotent : la base est
// entièrement recréée à chaque passage. Sort en code 1 si un pattern est invalide —
// une bibliothèque à moitié indexée qui se tait est pire qu'une erreur.
import { unlinkSync, existsSync } from 'node:fs';
import { DB, KINDS, loadPatterns, loadSystems, sql, q } from './lib.mjs';

const SCHEMA = `
CREATE TABLE systems (
  id TEXT PRIMARY KEY, name TEXT, source TEXT, notes TEXT, tokens_json TEXT, type_json TEXT
);
CREATE TABLE patterns (
  id TEXT PRIMARY KEY, name TEXT, kind TEXT, family TEXT, source TEXT, system TEXT,
  intent TEXT, when_to_use TEXT, avoid_when TEXT, notes TEXT,
  html TEXT, html_path TEXT, vars_json TEXT, slots_json TEXT
);
CREATE TABLE tags (pattern_id TEXT, tag TEXT, PRIMARY KEY (pattern_id, tag));
CREATE VIRTUAL TABLE patterns_fts USING fts5(
  id UNINDEXED, name, family, intent, when_to_use, tags, html
);
CREATE INDEX idx_patterns_kind ON patterns(kind);
CREATE INDEX idx_patterns_source ON patterns(source);
`;

const errors = [];
const patterns = loadPatterns();
const systems = loadSystems();
const systemIds = new Set(systems.map((s) => s.id));

for (const p of patterns) {
  if (!p.name) errors.push(`${p.id} : champ "name" manquant`);
  if (!KINDS.includes(p.kind)) errors.push(`${p.id} : kind "${p.kind}" hors vocabulaire (${KINDS.join(', ')})`);
  if (!p.source) errors.push(`${p.id} : champ "source" manquant (quelle référence ?)`);
  if (!p.intent) errors.push(`${p.id} : champ "intent" manquant`);
  if (!(p.tags?.length)) errors.push(`${p.id} : aucun tag — il sera introuvable`);
  if (p.kind !== 'rule' && !p.html) errors.push(`${p.id} : aucun ${p.id}.html (obligatoire sauf kind=rule)`);
  if (p.system && !systemIds.has(p.system)) errors.push(`${p.id} : système "${p.system}" inconnu`);
  // Un pattern doit être thémable : pas de couleur hexadécimale en dur dans le HTML.
  // Les entités HTML numériques (`&#8599;` = ↗) ne sont PAS des couleurs : les retirer avant
  // le test, sinon un glyphe de flèche fait échouer l'indexation de tout le dépôt — vu le
  // 30/07 sur pat-stat-block-accent. Un faux positif récurrent se corrige dans le détecteur.
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
    `INSERT INTO systems VALUES (${q(s.id)},${q(s.name)},${q(s.source)},${q(s.notes)},` +
      `${q(JSON.stringify(s.tokens || {}))},${q(JSON.stringify(s.type || {}))});`
  );
}
for (const p of patterns) {
  rows.push(
    `INSERT INTO patterns VALUES (${q(p.id)},${q(p.name)},${q(p.kind)},${q(p.family)},` +
      `${q(p.source)},${q(p.system)},${q(p.intent)},${q(p.when_to_use)},${q(p.avoid_when)},` +
      `${q(p.notes)},${q(p.html)},${q(p.htmlPath)},${q(JSON.stringify(p.vars || []))},` +
      `${q(JSON.stringify(p.slots || []))});`
  );
  for (const t of p.tags) rows.push(`INSERT INTO tags VALUES (${q(p.id)},${q(t)});`);
  rows.push(
    `INSERT INTO patterns_fts VALUES (${q(p.id)},${q(p.name)},${q(p.family)},${q(p.intent)},` +
      `${q(p.when_to_use)},${q(p.tags.join(' '))},${q(p.html)});`
  );
}
rows.push('COMMIT;');
sql(rows.join('\n'));

console.log(`✓ ${patterns.length} pattern(s), ${systems.length} système(s) indexés → patterns.db`);
