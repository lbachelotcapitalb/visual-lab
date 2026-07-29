// Fonctions partagées par les outils de visual-lab. Zéro dépendance npm : tout passe par
// le binaire `sqlite3` du système et par Chrome en headless.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const DB = join(ROOT, 'patterns.db');

export const DIRS = {
  patterns: join(ROOT, 'patterns'),
  systems: join(ROOT, 'systems'),
  decks: join(ROOT, 'decks'),
  proofs: join(ROOT, 'proofs'),
};

/** Les seules valeurs acceptées pour `kind`. Un vocabulaire fermé : une faute de frappe
 *  doit casser l'indexation, pas créer silencieusement une 7e famille. */
export const KINDS = ['primitive', 'component', 'layout', 'chart', 'type', 'rule'];

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Lit tous les patterns du disque. Le disque est la source de vérité ; patterns.db n'est
 *  qu'un index régénérable (et gitignoré). */
export function loadPatterns() {
  if (!existsSync(DIRS.patterns)) return [];
  return readdirSync(DIRS.patterns)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const id = basename(f, '.json');
      const meta = readJson(join(DIRS.patterns, f));
      const htmlPath = join(DIRS.patterns, `${id}.html`);
      const html = existsSync(htmlPath) ? readFileSync(htmlPath, 'utf8') : null;
      return { ...meta, id, html, htmlPath: existsSync(htmlPath) ? htmlPath : null };
    });
}

export function loadSystems() {
  if (!existsSync(DIRS.systems)) return [];
  return readdirSync(DIRS.systems)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ ...readJson(join(DIRS.systems, f)), id: basename(f, '.json') }));
}

/** Un système de tokens → un bloc `:root{}` collable dans n'importe quelle page. */
export function systemToCss(sys) {
  const lines = Object.entries(sys.tokens || {}).map(([k, v]) => `  ${k}: ${v};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

export function sql(statements) {
  return execFileSync('sqlite3', [DB], { input: statements, encoding: 'utf8' });
}

export function query(sqlText) {
  const out = execFileSync('sqlite3', ['-json', DB, sqlText], { encoding: 'utf8' }).trim();
  return out ? JSON.parse(out) : [];
}

export const q = (s) => `'${String(s ?? '').replace(/'/g, "''")}'`;
