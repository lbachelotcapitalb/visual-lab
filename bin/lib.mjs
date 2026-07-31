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

/** Le vocabulaire fermé des familles. C'est AUSSI le préfixe du nom de fichier : un pattern
 *  `card-03-stat-accent` est de famille `card`, et bin/index.mjs le vérifie. Une taxonomie
 *  unique — l'ancien couple kind/famille disait deux fois la même chose et se contredisait.
 *  `diagram` ≠ `chart` : un `chart` porte des DONNÉES (une valeur mesurée décide de la
 *  géométrie), un `diagram` porte une STRUCTURE (couches, flux, appartenance) — rien n'y est
 *  proportionnel à quoi que ce soit. Les confondre ferait chercher un schéma d'architecture
 *  dans la famille des histogrammes. */
export const FAMILIES = ['card', 'chart', 'diagram', 'layout', 'list', 'shape', 'tag', 'title'];

/** Le vocabulaire fermé des MÉDIAS de destination. Un pattern déclare où il est censé servir ;
 *  c'est ce qui permet à un producteur (deck, mailing, flyer, post) de ne piocher que dans ce
 *  qui tient dans SON cadre. La déclaration est une INTENTION — la faisabilité, elle, se
 *  prouve par `bin/emit.mjs --target <média>`, qui refuse ce que la cible ne sait pas rendre.
 *  Deux champs séparés parce que deux questions différentes : « à quoi ça sert » et « est-ce
 *  que ça passe ». Un `media` déclaré sans émetteur qui tienne est un mensonge de catalogue. */
export const MEDIA = ['slide', 'web', 'email', 'print', 'social'];

/** Ce que le corpus EST par défaut : reversé de decks, collable dans une page. Les patterns
 *  antérieurs au champ n'ont pas à être ré-annotés pour rester exacts. */
export const MEDIA_DEFAULT = ['slide', 'web'];

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

/** Un pattern pointe sa référence par `ref` ; le fichier de tokens porte le même id. */
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

/** Les médias d'un pattern, défaut compris. Une seule fonction pour que l'index, la recherche
 *  et les émetteurs ne puissent pas diverger sur ce que « pas de champ media » veut dire. */
export function mediaOf(p) {
  return p.media?.length ? p.media : MEDIA_DEFAULT;
}

/** Le cadre déclaré d'un pattern (`geometry.frame`), ou une valeur de repli. Sert aux rendus
 *  qui doivent réserver une cellule AVANT de savoir ce que le fragment mesure vraiment. */
export function frameOf(p, fallback = [430, 340]) {
  const f = p.geometry?.frame;
  return Array.isArray(f) && f.length === 2 ? f : fallback;
}

export const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Capture un fichier local en PNG avec Chrome headless. Zéro réseau, zéro dépendance npm :
 *  un PNG produit par un simulateur ne prouverait rien (cf. bin/render.mjs). */
export function shot(file, out, w, h) {
  if (!existsSync(CHROME)) {
    console.error(`Chrome introuvable (${CHROME}). Adapte la constante CHROME dans bin/lib.mjs.`);
    process.exit(1);
  }
  execFileSync(
    CHROME,
    ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
     '--default-background-color=00000000', `--window-size=${w},${h}`,
     `--screenshot=${out}`, `file://${file}`],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );
  if (!existsSync(out)) {
    console.error('Chrome n’a produit aucun PNG.');
    process.exit(1);
  }
  return out;
}

/** Fait tourner une page locale dans Chrome et récupère le JSON qu'elle a écrit dans
 *  `<pre id="vl-out">`. C'est le seul canal de sortie d'un Chrome headless sans protocole de
 *  debug : la page calcule, dépose son résultat dans le DOM, `--dump-dom` le ramène.
 *  Même mécanique que bin/check.mjs — factorisée pour qu'un second outil qui MESURE ne
 *  réinvente pas un canal qui aurait ses propres pièges. */
export function dumpJson(file) {
  if (!existsSync(CHROME)) {
    console.error(`Chrome introuvable (${CHROME}). Adapte la constante CHROME dans bin/lib.mjs.`);
    process.exit(1);
  }
  const dom = execFileSync(
    CHROME,
    ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=1500',
     '--dump-dom', `file://${file}`],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }
  );
  const m = dom.match(/<pre id="vl-out">([\s\S]*?)<\/pre>/);
  if (!m) throw new Error('la page n’a rien écrit dans <pre id="vl-out">');
  const txt = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  return JSON.parse(txt);
}

/** Sépare un fragment en markup + contenu du bloc <style>. Les patterns portent leur CSS
 *  avec eux (c'est ce qui les rend autonomes) : tout émetteur doit savoir le récupérer. */
export function splitFragment(html) {
  const m = (html || '').match(/<style>([\s\S]*?)<\/style>/i);
  return { markup: (html || '').replace(/<style>[\s\S]*?<\/style>/i, '').trim(), css: m ? m[1] : '' };
}

export function sql(statements) {
  return execFileSync('sqlite3', [DB], { input: statements, encoding: 'utf8' });
}

export function query(sqlText) {
  const out = execFileSync('sqlite3', ['-json', DB, sqlText], { encoding: 'utf8' }).trim();
  return out ? JSON.parse(out) : [];
}

export const q = (s) => `'${String(s ?? '').replace(/'/g, "''")}'`;
