#!/usr/bin/env node
// Lit le corps d'une issue produite par .github/ISSUE_TEMPLATE/pattern.yml, en extrait une
// soumission, et la CONTRÔLE. Sort un verdict JSON sur stdout.
//
//   node scripts/submission/parse-issue.mjs corps.md          → { ok, errors, warnings, data }
//   node scripts/submission/parse-issue.mjs corps.md --markdown → le même verdict, en tableau
//
// Pourquoi contrôler par un script et pas à l'œil : une soumission refusée trois jours plus
// tard pour une virgule est une soumission perdue. Ici le contributeur sait dans la minute ce
// qui manque, et exactement où — c'est ce qui rend une porte ouverte réellement praticable.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const FAMILIES = ['card', 'chart', 'diagram', 'layout', 'list', 'shape', 'tag', 'title'];
const MEDIA = ['slide', 'web', 'email', 'print', 'social'];

/* Les libellés du formulaire, normalisés — accents et casse retirés des deux côtés, pour
   qu'un accent perdu dans un copier-coller ne fasse pas rater un champ obligatoire. */
const FIELDS = {
  'identifiant': 'id',
  'famille': 'family',
  'nom': 'name',
  'intention': 'intent',
  'employer quand': 'when_to_use',
  'eviter quand': 'avoid_when',
  'mots-cles': 'tags',
  'medias': 'media',
  'charte': 'ref',
  'jetons de la charte': 'tokens',
  'cadre': 'frame',
  'le fragment html': 'html',
  'engagement': 'engagement',
};

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const EMPTY = new Set(['', '_no response_', 'aucune réponse', '_aucune réponse_']);

/** Le corps d'une issue « Issue Form » est une suite de `### Libellé` puis de valeur. */
export function parseIssueBody(body) {
  const out = {};
  const parts = String(body).replace(/\r\n/g, '\n').split(/^### +/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const label = norm(nl === -1 ? part : part.slice(0, nl));
    const key = FIELDS[label];
    if (!key) continue;
    let value = (nl === -1 ? '' : part.slice(nl + 1)).trim();
    // Les champs `render:` arrivent dans une clôture ```html / ```css — on la retire.
    const fence = value.match(/^```[a-z]*\n([\s\S]*?)\n?```$/i);
    if (fence) value = fence[1];
    out[key] = EMPTY.has(norm(value)) ? '' : value;
  }
  return out;
}

const checked = (block) => String(block || '').split('\n')
  .filter((l) => /^\s*- \[[xX]\]/.test(l))
  .map((l) => l.replace(/^\s*- \[[xX]\]\s*/, '').trim())
  .filter(Boolean);

export function validate(raw) {
  const errors = [];
  const warnings = [];
  const err = (champ, quoi) => errors.push({ champ, quoi });
  const warn = (champ, quoi) => warnings.push({ champ, quoi });

  const id = (raw.id || '').trim();
  const family = (raw.family || '').trim();
  const html = raw.html || '';
  const ref = (raw.ref || '').trim();

  if (!id) err('Identifiant', 'manquant');
  else if (!/^[a-z]+(?:-[a-z0-9]+)+$/.test(id)) err('Identifiant', 'minuscules et tirets seulement — `card-20-prix-compare`');
  else if (!FAMILIES.includes(id.split('-')[0])) err('Identifiant', `doit commencer par une famille : ${FAMILIES.join(', ')}`);
  else if (family && id.split('-')[0] !== family) err('Identifiant', `commence par « ${id.split('-')[0]} » mais la famille déclarée est « ${family} »`);
  else if (existsSync(join(ROOT, 'patterns', id + '.json'))) err('Identifiant', 'déjà pris dans la bibliothèque');

  if (!FAMILIES.includes(family)) err('Famille', `hors du vocabulaire fermé (${FAMILIES.join(', ')})`);
  if (!(raw.name || '').trim()) err('Nom', 'manquant');
  if ((raw.intent || '').trim().length < 20) err('Intention', 'trop courte pour dire ce que la composition résout');
  if ((raw.when_to_use || '').trim().length < 20) err('Employer quand', 'trop court');
  if ((raw.avoid_when || '').trim().length < 25) {
    err('Eviter quand', 'trop court — c\'est le champ qui fait router le catalogue, il vaut le précédent');
  }

  const tags = (raw.tags || '').split(/[,\n]/).map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (tags.length < 3) err('Mots-cles', `${tags.length} fourni(s), trois au minimum`);

  const media = checked(raw.media).filter((m) => MEDIA.includes(m));
  if (!media.length) warn('Medias', 'aucun coché — la valeur par défaut « slide + web » sera appliquée');

  const knownRefs = existsSync(join(ROOT, 'systems'))
    ? readdirSync(join(ROOT, 'systems')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
    : [];
  const refExists = knownRefs.includes(ref);
  if (!ref) err('Charte', 'manquante');
  else if (!refExists && !/^ref-\d{2}-[a-z0-9-]+$/.test(ref)) err('Charte', 'inconnue, et le nom d\'une charte NOUVELLE doit suivre `ref-NN-slug`');
  else if (!refExists && !(raw.tokens || '').includes('--vl-')) {
    err('Jetons de la charte', `la charte « ${ref} » n'existe pas encore : son bloc \`:root\` est obligatoire`);
  }

  if (!html.trim()) err('Le fragment HTML', 'manquant');
  else {
    if (!/<style>[\s\S]*<\/style>/i.test(html)) err('Le fragment HTML', 'aucun bloc `<style>` — le CSS doit voyager avec le fragment');
    if (/<script/i.test(html)) err('Le fragment HTML', 'contient du JavaScript — un pattern est une composition, pas un composant');
    if (/@import/i.test(html)) err('Le fragment HTML', 'contient un `@import` — zéro requête sortante est un invariant du dépôt');
    const remote = html.match(/(?:src|href)\s*=\s*["']https?:|url\(\s*["']?https?:/gi);
    if (remote) err('Le fragment HTML', `${remote.length} ressource(s) distante(s) — polices et images doivent être locales ou absentes`);
    if (/<img\b/i.test(html)) err('Le fragment HTML', 'contient une `<img>` — une image est une copie morte, elle périme en silence');
    if (!/var\(--vl-/.test(html)) err('Le fragment HTML', 'aucune variable `--vl-*` — le fragment ne pourrait pas changer de charte');

    // Une couleur en dur passe, mais elle est SIGNALÉE : c'est le défaut le plus fréquent, et
    // il ne se voit qu'en changeant de thème, donc bien trop tard.
    const css = (html.match(/<style>([\s\S]*?)<\/style>/i) || [, ''])[1];
    // On retire d'abord les `var(...)` : une couleur de REPLI dedans est légitime, c'est
    // celles écrites hors de toute variable qui ne suivront jamais la charte.
    const bare = css.replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, '');
    const hard = [...bare.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)].map((m) => m[0]);
    if (hard.length) warn('Le fragment HTML', `${hard.length} couleur(s) écrite(s) en dur (${[...new Set(hard)].slice(0, 4).join(', ')}…) — à passer en \`--vl-*\` si elles doivent suivre la charte`);
  }

  const frame = (raw.frame || '').trim();
  let frameArr = null;
  if (frame) {
    const m = frame.match(/^(\d{2,4})\s*[x×*]\s*(\d{2,4})$/i);
    if (!m) err('Cadre', 'format attendu `430x340`');
    else frameArr = [Number(m[1]), Number(m[2])];
  } else {
    warn('Cadre', 'non déclaré — le pattern ne pourra pas être mesuré par `bin/check.mjs`');
  }

  if (checked(raw.engagement).length < 2) err('Engagement', 'les deux cases doivent être cochées');

  const data = {
    id, family, name: (raw.name || '').trim(),
    media: media.length ? media : ['slide', 'web'],
    intent: (raw.intent || '').trim(),
    when_to_use: (raw.when_to_use || '').trim(),
    avoid_when: (raw.avoid_when || '').trim(),
    tags,
    ref,
    refIsNew: !refExists,
    tokens: raw.tokens || '',
    frame: frameArr,
    html,
  };
  return { ok: errors.length === 0, errors, warnings, data };
}

/* ─── CLI ─── */
// Le garde n'est pas cosmétique : sans lui, `materialise.mjs` qui IMPORTE ce module déclenche
// son CLI (même argv), qui sort par process.exit avant d'avoir écrit quoi que ce soit.
const estLanceDirectement = import.meta.url === pathToFileURL(process.argv[1] || '').href;
const [, , file, ...rest] = process.argv;
if (estLanceDirectement && file) {
  const verdict = validate(parseIssueBody(readFileSync(file, 'utf8')));
  if (!rest.includes('--markdown')) {
    console.log(JSON.stringify(verdict, null, 2));
  } else {
    const rows = (list, icon) => list.map((e) => `| ${icon} | **${e.champ}** | ${e.quoi} |`).join('\n');
    if (verdict.ok) {
      console.log(`### ✅ Soumission recevable — \`${verdict.data.id}\`\n`);
      console.log('Le contrôle automatique passe. Un mainteneur relit, puis répond `/accepter` : la pull request se crée toute seule, à votre nom.\n');
      if (verdict.warnings.length) {
        console.log('Rien de bloquant, mais deux ou trois choses valent le coup d\'être regardées :\n');
        console.log('| | champ | remarque |\n|---|---|---|\n' + rows(verdict.warnings, '⚠️'));
      }
    } else {
      console.log(`### ❌ ${verdict.errors.length} point(s) à corriger\n`);
      console.log('Modifiez l\'issue (bouton **···** → *Edit*) : le contrôle se rejoue automatiquement.\n');
      console.log('| | champ | ce qui ne va pas |\n|---|---|---|\n' + rows(verdict.errors, '❌')
        + (verdict.warnings.length ? '\n' + rows(verdict.warnings, '⚠️') : ''));
    }
  }
  process.exit(verdict.ok ? 0 : 1);
}
