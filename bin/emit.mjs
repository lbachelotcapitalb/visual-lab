#!/usr/bin/env node
// ÉMETTEUR — sort un pattern dans un autre format que son HTML de référence.
//
//   node bin/emit.mjs card-03-stat-accent --target inline    styles aplatis sur les éléments
//   node bin/emit.mjs card-03-stat-accent --target email     idem + contraintes mail, REFUSE si ça ne passe pas
//   node bin/emit.mjs card-03-stat-accent --target email --system ref-04-swiss-investor-blue
//   node bin/emit.mjs --audit --target email                 la faisabilité de TOUTE la bibliothèque
//
// Pourquoi un émetteur et pas « copier le fragment » : ce qui rend un pattern rejouable —
// les variables `--vl-*` et un bloc <style> à part — est précisément ce qu'un client mail ne
// sait pas lire (Outlook rend avec le moteur de Word). Le JSON reste la vérité, le HTML est
// UN rendu ; celui-ci en est un autre. Même principe que kit/vl_pptx.py côté .pptx : les
// pixels ne voyagent pas, les rapports et les intentions oui.
//
// Doctrine : on REFUSE bruyamment plutôt que de rendre du gris. Un fragment sorti « en email »
// qui se déchire dans Outlook coûte plus cher qu'un émetteur qui dit non.
import { existsSync } from 'node:fs';
import { MEDIA, loadPatterns, loadSystems, mediaOf } from './lib.mjs';

const argv = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? d : (argv[i + 1] ?? true);
};
const has = (n) => argv.includes(`--${n}`);

const TARGETS = {
  inline: {
    label: 'HTML à styles aplatis (artefact, aperçu, base d’un autre émetteur)',
    // Rien n'est bloquant : ce qui n'est pas inlinable reste dans un <style> résiduel.
    block: [],
  },
  email: {
    label: 'HTML de mailing (moteur Word d’Outlook = plus petit dénominateur)',
    block: [
      [/\bdisplay\s*:\s*(inline-)?(flex|grid)\b/i, 'display:flex/grid — Outlook rend en tables, pas en flux moderne'],
      [/\bgap\s*:/i, 'gap — sans flex/grid il n’a aucun effet, l’espacement doit venir des cellules'],
      [/\bclip-path\s*:/i, 'clip-path — ignoré : la forme (chanfrein, découpe) disparaît'],
      [/\b(-webkit-)?mask(-image)?\s*:/i, 'mask — ignoré'],
      [/\bbackdrop-filter\s*:/i, 'backdrop-filter — ignoré'],
      // Les préfixes comptent : `\b` place une frontière après un tiret, donc `\btransform:`
      // matche `text-transform:` — un faux bloquant sur toute vignette en capitales (vu à
      // l'écriture, 30/07). Un détecteur qui crie à tort est un détecteur qu'on finit par ignorer.
      [/(?<![-\w])filter\s*:/i, 'filter — ignoré'],
      [/(?<![-\w])transform\s*:/i, 'transform — ignoré, l’élément revient à sa position de flux'],
      [/\bposition\s*:\s*(absolute|fixed|sticky)/i, 'position absolue/fixe — non supportée, l’élément retombe dans le flux'],
      [/\baspect-ratio\s*:/i, 'aspect-ratio — non supporté'],
      [/\bmix-blend-mode\s*:/i, 'mix-blend-mode — non supporté'],
      [/\bwriting-mode\s*:/i, 'writing-mode — non supporté'],
      [/\bcalc\s*\(/i, 'calc() — non supporté par le moteur Word'],
    ],
    warn: [
      [/\bborder-radius\s*:/i, 'border-radius — coins carrés dans Outlook (dégradation acceptable)'],
      [/\bbox-shadow\s*:/i, 'box-shadow — ignoré dans Outlook'],
      [/\bopacity\s*:/i, 'opacity — pas d’alpha dans Outlook, la couleur sera pleine'],
      [/\bmax-width\s*:/i, 'max-width — non respecté hors table ; prévoir une largeur fixe'],
      [/\b\d+(\.\d+)?ch\b/i, 'unité ch — inégalement supportée, préférer px'],
      [/\bline-height\s*:\s*[\d.]+\s*[;}]/i, 'line-height sans unité — Outlook préfère une valeur en px'],
      [/\bletter-spacing\s*:/i, 'letter-spacing — appliqué de façon inégale'],
      [/\btext-transform\s*:/i, 'text-transform — non appliqué dans Outlook, écrire le texte déjà en capitales'],
    ],
  },
};

const target = String(flag('target', 'inline'));
if (target === 'print') {
  // Pas de faux émetteur : l'impression n'a pas de contrainte de moteur, elle a une contrainte
  // de SUPPORT. Le fragment HTML se rend tel quel en PDF/PNG par Chrome — annoncer un émetteur
  // « print » qui ne ferait que recopier le fragment mentirait sur ce que le dépôt sait faire.
  console.error(
    'Pas d’émetteur « print » : un fragment HTML s’imprime tel quel.\n' +
      '  Rendu : node bin/render.mjs --pattern <id>  (PNG), ou Chrome → Imprimer → PDF sur la page qui le contient.\n' +
      '  À surveiller pour l’encre : aplats pleine page, ombres portées, dégradés — et les polices,\n' +
      '  qui doivent venir de fonts/ (embarquées) et non d’une pile système.'
  );
  process.exit(1);
}
if (!TARGETS[target]) {
  console.error(`Cible inconnue : "${target}". Cibles : ${Object.keys(TARGETS).join(', ')}, print.`);
  process.exit(1);
}

/* ————— CSS : découpe, variables, inlining ————— */

/** Découpe un bloc CSS en règles simples + at-rules (gardées à part : elles ne s'inlinent pas). */
function parseCss(css) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  const atRules = [];
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf('{', i);
    if (open === -1) break;
    const selector = src.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') depth--;
      j++;
    }
    const body = src.slice(open + 1, j - 1);
    if (selector.startsWith('@')) atRules.push({ selector, body });
    else for (const sel of selector.split(',')) rules.push({ sel: sel.trim(), body });
    i = j;
  }
  return { rules, atRules };
}

/** Découpe un corps de règle en déclarations, sans casser sur les `;` internes aux parenthèses
 *  (polygon(), calc(), rgba()…). Un split naïf sur `;` casse tout clip-path un peu réel. */
function parseDecls(body) {
  const out = [];
  let buf = '';
  let depth = 0;
  for (const ch of body) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ';' && depth === 0) {
      if (buf.trim()) out.push(buf.trim());
      buf = '';
    } else buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out.map((d) => {
    const k = d.indexOf(':');
    return k === -1 ? null : { prop: d.slice(0, k).trim(), value: d.slice(k + 1).trim() };
  }).filter(Boolean);
}

/** Remplace `var(--x, repli)` par sa valeur, en boucle (une variable peut en référencer une
 *  autre : `--vl-nc-size: var(--vl-notch, 32px)`). Le repli sert quand le token n'existe pas —
 *  c'est le comportement du navigateur, et le reproduire évite de sortir un fragment qui
 *  s'afficherait autrement dans le mail que dans l'aperçu. */
function resolveVars(value, map, seen = 0) {
  if (seen > 12 || !value.includes('var(')) return value;
  let out = '';
  let i = 0;
  while (i < value.length) {
    const at = value.indexOf('var(', i);
    if (at === -1) {
      out += value.slice(i);
      break;
    }
    out += value.slice(i, at);
    let depth = 1;
    let j = at + 4;
    while (j < value.length && depth > 0) {
      if (value[j] === '(') depth++;
      if (value[j] === ')') depth--;
      j++;
    }
    const inner = value.slice(at + 4, j - 1);
    const comma = (() => {
      let d = 0;
      for (let k = 0; k < inner.length; k++) {
        if (inner[k] === '(') d++;
        if (inner[k] === ')') d--;
        if (inner[k] === ',' && d === 0) return k;
      }
      return -1;
    })();
    const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma === -1 ? null : inner.slice(comma + 1).trim();
    const resolved = map[name] ?? fallback;
    if (resolved === null || resolved === undefined) {
      out += `var(${inner})`; // non résolu : on le laisse VISIBLE, l'audit le signalera
    } else {
      out += resolveVars(resolved, map, seen + 1);
    }
    i = j;
  }
  return out;
}

/** Un sélecteur est inlinable s'il désigne UN élément par sa classe ou sa balise, sans
 *  combinateur ni pseudo : `.a`, `p`, `p.a`. Tout le reste (descendance, `::before`, `:hover`)
 *  n'a pas d'équivalent dans un attribut style — on ne le devine pas, on le signale. */
function simpleSelector(sel) {
  if (!/^[a-zA-Z]?[\w-]*(\.[\w-]+)*$/.test(sel.replace(/^\./, '.'))) return null;
  if (/[ >+~:[\]*]/.test(sel)) return null;
  const cls = [...sel.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
  const tag = sel.startsWith('.') ? null : (sel.match(/^([a-zA-Z][\w-]*)/) || [])[1] || null;
  return { tag, cls };
}

/** Pose les déclarations sur les éléments du markup. Pas de DOM : on balaie les balises
 *  ouvrantes, ce qui suffit — un attribut `style` se pose sur une balise, pas sur un arbre. */
function inlineStyles(markup, rules, varMap) {
  const nonInlinable = [];
  const applicable = [];
  for (const r of rules) {
    const s = simpleSelector(r.sel);
    if (!s) {
      nonInlinable.push(r.sel);
      continue;
    }
    applicable.push({ ...s, decls: parseDecls(r.body) });
  }
  const out = markup.replace(/<([a-zA-Z][\w-]*)\b([^>]*)>/g, (whole, tag, attrs) => {
    if (/^\//.test(tag)) return whole;
    const classAttr = (attrs.match(/class\s*=\s*"([^"]*)"/i) || [])[1] || '';
    const classes = classAttr.split(/\s+/).filter(Boolean);
    const merged = new Map();
    for (const rule of applicable) {
      const tagOk = !rule.tag || rule.tag.toLowerCase() === tag.toLowerCase();
      const clsOk = rule.cls.every((c) => classes.includes(c));
      if (!tagOk || !clsOk || (!rule.tag && !rule.cls.length)) continue;
      for (const d of rule.decls) {
        if (d.prop.startsWith('--')) continue; // les variables sont résolues, pas transportées
        merged.set(d.prop, resolveVars(d.value, varMap));
      }
    }
    const existing = (attrs.match(/style\s*=\s*"([^"]*)"/i) || [])[1] || '';
    for (const d of parseDecls(existing)) merged.set(d.prop, resolveVars(d.value, varMap));
    if (!merged.size) return whole;
    const style = [...merged].map(([k, v]) => `${k}: ${v}`).join('; ');
    const cleaned = attrs.replace(/\s*style\s*=\s*"[^"]*"/i, '');
    return `<${tag}${cleaned} style="${style}">`;
  });
  return { html: out, nonInlinable };
}

/* ————— Émission ————— */

function emitOne(p, sys) {
  const { markup, css } = (() => {
    const m = (p.html || '').match(/<style>([\s\S]*?)<\/style>/i);
    return {
      markup: (p.html || '').replace(/<style>[\s\S]*?<\/style>/i, '').trim(),
      css: m ? m[1] : '',
    };
  })();
  const { rules, atRules } = parseCss(css);

  // Carte des variables : les tokens de la référence D'ABORD, puis les variables locales
  // déclarées par le fragment (qui peuvent s'appuyer sur les précédentes).
  const varMap = { ...(sys?.tokens || {}) };
  for (const r of rules) {
    for (const d of parseDecls(r.body)) if (d.prop.startsWith('--')) varMap[d.prop] = d.value;
  }

  // Dernière passe sur le MARKUP : une variable ne vit pas que dans une déclaration CSS, elle
  // vit aussi dans un attribut (`fill="var(--vl-mint)"` sur un SVG inline). Sans cette passe,
  // trois patterns de ref-11 étaient signalés « token absent » alors que le token existe —
  // un faux positif qui aurait fait corriger un système parfaitement sain.
  const inlined = inlineStyles(markup, rules, varMap);
  const html = resolveVars(inlined.html, varMap);
  const nonInlinable = inlined.nonInlinable;

  const problems = [];
  const cfg = TARGETS[target];
  const scanned = html + '\n' + atRules.map((a) => `${a.selector}{${a.body}}`).join('\n');
  for (const [re, why] of cfg.block || []) if (re.test(scanned)) problems.push({ level: 'bloquant', why });
  for (const [re, why] of cfg.warn || []) if (re.test(scanned)) problems.push({ level: 'dégradation', why });
  if (/<svg\b/i.test(html) && target === 'email') {
    problems.push({ level: 'bloquant', why: 'SVG inline — non rendu par Outlook ; exporter en PNG' });
  }
  if (/var\(--/.test(html)) {
    problems.push({ level: 'bloquant', why: 'variable CSS non résolue — token absent du système choisi' });
  }
  for (const sel of nonInlinable) {
    problems.push({
      level: target === 'email' ? 'bloquant' : 'dégradation',
      why: `sélecteur non inlinable : \`${sel}\` (descendance, pseudo-élément ou état)`,
    });
  }
  for (const a of atRules) {
    problems.push({
      level: target === 'email' ? 'bloquant' : 'dégradation',
      why: `at-rule \`${a.selector}\` — ne s’inline pas`,
    });
  }
  return { html, problems, atRules, nonInlinable, rules };
}

const patterns = loadPatterns();
const systems = loadSystems();

/* ————— Mode audit : la faisabilité de toute la bibliothèque, en un tableau ————— */
if (has('audit')) {
  const lignes = [];
  let ok = 0;
  for (const p of patterns.sort((a, b) => a.id.localeCompare(b.id))) {
    const sys = systems.find((s) => s.id === p.ref);
    const { problems } = emitOne(p, sys);
    const bloquants = problems.filter((x) => x.level === 'bloquant');
    // `inline` est une cible TECHNIQUE, pas un canal : personne ne « déclare » un pattern
    // inline. N'afficher la colonne que quand la cible est un média du vocabulaire.
    const estMedia = MEDIA.includes(target);
    const declare = mediaOf(p).includes(target);
    if (!bloquants.length) ok++;
    lignes.push(
      `${bloquants.length ? '✗' : '✓'} ${p.id.padEnd(28)} ` +
        `${estMedia ? (declare ? `déclaré ${target}` : `NON déclaré ${target}`) : ''}` +
        (bloquants.length ? `\n    ${[...new Set(bloquants.map((b) => b.why))].join('\n    ')}` : '')
    );
  }
  console.log(lignes.join('\n'));
  console.log(`\n${ok}/${patterns.length} pattern(s) passent la cible « ${target} ».`);
  console.log(
    'Le champ `media` du JSON déclare une INTENTION ; ce tableau dit ce qui TIENT. ' +
      'Quand les deux divergent, c’est le JSON qui a tort.'
  );
  process.exit(0);
}

const id = argv.find((a) => !a.startsWith('--') && !Object.values(TARGETS).includes(a) &&
  argv[argv.indexOf(a) - 1] !== '--target' && argv[argv.indexOf(a) - 1] !== '--system');
const p = patterns.find((x) => x.id === id);
if (!p) {
  console.error(
    `usage : emit.mjs <id> --target ${Object.keys(TARGETS).join('|')} [--system <ref>] [--force]\n` +
      '        emit.mjs --audit --target email\n' +
      (id ? `Pattern « ${id} » introuvable.` : '')
  );
  process.exit(1);
}
const refId = flag('system') || p.ref;
const sys = systems.find((s) => s.id === refId);
if (!sys) {
  console.error(`Système inconnu : systems/${refId}.json est absent.`);
  process.exit(1);
}

const { html, problems } = emitOne(p, sys);
const bloquants = problems.filter((x) => x.level === 'bloquant');
const degrade = problems.filter((x) => x.level === 'dégradation');

for (const d of degrade) console.error(`⚠︎  ${d.why}`);
if (bloquants.length && !has('force')) {
  console.error(`\n✗ ${p.id} ne tient pas la cible « ${target} » (${TARGETS[target].label}) :`);
  for (const b of bloquants) console.error(`   - ${b.why}`);
  console.error(
    '\nCe pattern n’est pas fait pour ce canal. Deux issues honnêtes : en choisir un autre\n' +
      `(node bin/search.mjs --media ${target}), ou le RENDRE EN IMAGE et poser l’image\n` +
      '(node bin/render.mjs --pattern ' + p.id + '). `--force` sort quand même le HTML, à tes risques.'
  );
  process.exit(1);
}

console.log(`<!-- ${p.id} · cible ${target} · système ${refId} · émis par bin/emit.mjs -->`);
console.log(html);
if (bloquants.length) console.error(`\n⚠︎  sorti avec --force malgré ${bloquants.length} bloquant(s).`);
