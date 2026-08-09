#!/usr/bin/env node
// embed-fonts.mjs — rendre un HTML AUTOPORTANT côté typographie.
//
// Lit le HTML, relève les glyphes qu'il utilise RÉELLEMENT (texte + `content:"…"`
// des règles CSS), sous-tire les .ttf du dépôt sur ce seul jeu, les compresse en
// woff2 et rend un bloc `@font-face` en data: URI, prêt à coller dans le <style>.
//
// POURQUOI un sous-tirage plutôt que le .ttf entier en base64 : Newsreader pèse
// 441 Ko, son italique 484 Ko — en base64 c'est 1,2 Mo pour deux fichiers. Sur le
// jeu réel d'un deck (≈ 170 glyphes) les mêmes fichiers tombent à 101 et 114 Ko.
//
// CONTREPARTIE, à connaître avant de s'en servir : le sous-tirage est calé sur le
// TEXTE DU MOMENT. Un caractère ajouté après coup au HTML sortira en police
// système, sans erreur ni rien dans la console. Ce script se relance donc à CHAQUE
// build, jamais une fois pour toutes — et il n'a de sens que sur un livrable figé.
// Pour une page qui vit, pointer `fonts/fonts.css` et garder les .ttf à côté.
//
//   node bin/embed-fonts.mjs deck.html                  # écrit deck.fonts.css
//   node bin/embed-fonts.mjs deck.html --inject         # remplace /*__FONTS__*/ en place
//   node bin/embed-fonts.mjs deck.html --family Newsreader --family "DM Mono"
//
// Sans `--family`, les familles sont déduites des `font-family` du HTML.
// Dépend de fontTools (python3 -m fontTools.subset), déjà présent sur le poste.

import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const FONTS = join(dirname(dirname(fileURLToPath(import.meta.url))), 'fonts');

// Le registre : une famille → ses fichiers, avec le poids et le style que chaque
// fichier porte VRAIMENT. DM Mono n'est pas variable : deux fichiers, deux règles.
// Déclarer `font-weight: 400 500` sur son seul Regular ferait synthétiser le 500.
const REGISTRY = {
  'Archivo':        [{ file: 'Archivo-variable.ttf',           weight: '100 900', stretch: '62% 125%' }],
  'Inter':          [{ file: 'Inter-variable.ttf',             weight: '100 900' }],
  'Montserrat':     [{ file: 'Montserrat-variable.ttf',        weight: '100 900' }],
  'Anton':          [{ file: 'Anton-Regular.ttf',              weight: '400' }],
  'Newsreader':     [{ file: 'Newsreader-variable.ttf',        weight: '200 800' },
                     { file: 'Newsreader-Italic-variable.ttf', weight: '200 800', style: 'italic' }],
  'Hanken Grotesk': [{ file: 'HankenGrotesk-variable.ttf',     weight: '100 900' }],
  'DM Mono':        [{ file: 'DMMono-Regular.ttf',             weight: '400' },
                     { file: 'DMMono-Medium.ttf',              weight: '500' }],
};

const argv = process.argv.slice(2);
const src = argv.find(a => !a.startsWith('--'));
const inject = argv.includes('--inject');
const wanted = argv.flatMap((a, i) => (a === '--family' ? [argv[i + 1]] : []));
if (!src) { console.error('usage: embed-fonts.mjs <fichier.html> [--inject] [--family "Nom"]'); process.exit(1); }

const html = readFileSync(src, 'utf8');

// ── Le jeu de glyphes ───────────────────────────────────────────────────────
// Le texte visible, PLUS le contenu injecté par CSS (`content:"—"` : un tiret qui
// n'apparaît nulle part dans le corps du document mais devant chaque puce).
// PLUS un socle ASCII + accents + ponctuation typographique : la marge qui évite
// qu'une correction d'une lettre fasse tomber un caractère en police système.
const stripped = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
const text = stripped.replace(/<[^>]+>/g, ' ')
  .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, m => {
    const t = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&nbsp;': ' ', '&#39;': "'" };
    if (t[m.toLowerCase()]) return t[m.toLowerCase()];
    const hex = /^&#x([0-9a-f]+);$/i.exec(m), dec = /^&#(\d+);$/.exec(m);
    return hex ? String.fromCodePoint(parseInt(hex[1], 16)) : dec ? String.fromCodePoint(+dec[1]) : m;
  });
const cssContent = [...html.matchAll(/content\s*:\s*"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]).join('');
const ASCII = Array.from({ length: 0x5f }, (_, i) => String.fromCharCode(0x20 + i)).join('');
const FR = 'ÀÂÄÇÈÉÊËÎÏÔÖÙÛÜŸàâäçèéêëîïôöùûüÿŒœÆæ';
const TYPO = '—–‘’“”…«»€‰°²³×÷±≈≠≤≥→←↑↓•·§¶†‡№™©®';
const glyphs = [...new Set((text + cssContent + ASCII + FR + TYPO).replace(/[\n\r\t]/g, ''))].sort().join('');

// ── Les familles à embarquer ────────────────────────────────────────────────
const families = wanted.length ? wanted : Object.keys(REGISTRY).filter(f =>
  new RegExp(`font-family\\s*:[^;{}]*["']${f}["']`, 'i').test(html) ||
  new RegExp(`--[\\w-]+\\s*:\\s*["']${f}["']`, 'i').test(html));
if (!families.length) { console.error('✗ aucune famille reconnue — préciser --family'); process.exit(1); }

const tmp = mkdtempSync(join(tmpdir(), 'embed-fonts-'));
let css = `/* Polices embarquées — sous-tirage sur les ${glyphs.length} glyphes de ce document.\n`
        + `   Sources .ttf et licences OFL : ~/visual-lab/fonts/ · voir fonts/FONTS.md.\n`
        + `   Régénérer à chaque build : node bin/embed-fonts.mjs <fichier> --inject */\n`;
let total = 0;

for (const fam of families) {
  const faces = REGISTRY[fam];
  if (!faces) { console.error(`✗ ${fam} — absente du registre de bin/embed-fonts.mjs`); process.exit(1); }
  for (const f of faces) {
    const ttf = join(FONTS, f.file);
    if (!existsSync(ttf)) { console.error(`✗ ${f.file} introuvable dans fonts/`); process.exit(1); }
    const out = join(tmp, basename(f.file, '.ttf') + '.woff2');
    // `sups`/`ordn` sont retenus parce que le sous-tirage supprime sinon les glyphes
    // en exposant ET la table qui y mène : `font-feature-settings:"sups"` resterait
    // sans effet, silencieusement. Mesuré le 01/08/2026 sur les trois familles du
    // trio : leur `sups` ne couvre QUE des chiffres (0-4). Aucune ne dessine un « e »
    // supérieur — un ordinal français (« 13ᵉ ») se compose donc en CSS, pas en
    // OpenType. Retenir la fonctionnalité ne suffit jamais : vérifier qu'elle couvre
    // le caractère visé, sinon le rendu est identique et rien ne le signale.
    execFileSync('python3', ['-m', 'fontTools.subset', ttf, `--text=${glyphs}`,
      '--layout-features=kern,liga,calt,onum,tnum,frac,sups,ordn', '--flavor=woff2', '--with-zopfli',
      `--output-file=${out}`]);
    const b64 = readFileSync(out).toString('base64');
    total += statSync(out).size;
    css += `@font-face{font-family:"${fam}";`
         + `src:url(data:font/woff2;base64,${b64}) format("woff2");`
         + `font-weight:${f.weight};${f.stretch ? `font-stretch:${f.stretch};` : ''}`
         + `font-style:${f.style || 'normal'};font-display:block}\n`;
    console.log(`  ${(statSync(ttf).size / 1024).toFixed(0).padStart(5)} Ko →`
              + `${(statSync(out).size / 1024).toFixed(1).padStart(7)} Ko  ${f.file}`);
  }
}
rmSync(tmp, { recursive: true, force: true });

if (inject) {
  if (!html.includes('/*__FONTS__*/')) { console.error('✗ marqueur /*__FONTS__*/ absent du fichier'); process.exit(1); }
  writeFileSync(src, html.replace('/*__FONTS__*/', () => css));
  console.log(`✓ ${src} — ${families.length} famille(s), ${(total / 1024).toFixed(0)} Ko de woff2 embarqués`);
} else {
  const dst = src.replace(/\.html$/, '.fonts.css');
  writeFileSync(dst, css);
  console.log(`✓ ${dst} — ${(total / 1024).toFixed(0)} Ko de woff2, ${glyphs.length} glyphes`);
}
