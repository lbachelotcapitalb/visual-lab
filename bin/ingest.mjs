#!/usr/bin/env node
// Poser sur le DISQUE l'image source d'un reverse — c'est le point qui débloque tout le reste
// (pipette, crop, comparaison rendu ↔ source, relecture après coup).
//
//   node bin/ingest.mjs ref-14-mon-visuel                 ← depuis le PRESSE-PAPIERS (défaut)
//   node bin/ingest.mjs ref-14-mon-visuel ~/Desktop/x.png ← depuis un fichier
//
// Pourquoi le presse-papiers : une image COLLÉE dans la conversation n'existe nulle part sur
// le disque — l'agent la voit, il ne peut pas l'écrire. Vérifié le 31/07 : aucune copie n'est
// déposée par l'app. Un ⌘C sur l'image (au lieu d'un ⌘V dans le chat) suffit à la rendre
// récupérable ici, sans dépendance : AppleScript sait sortir le flavor «class PNGf».
import { existsSync, mkdirSync, copyFileSync, writeFileSync, unlinkSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './lib.mjs';

const REFS = join(ROOT, 'assets', 'refs');
const [ref, src] = process.argv.slice(2);
if (!ref || !/^ref-\d{2}-[a-z0-9-]+$/.test(ref)) {
  console.error('usage : ingest.mjs ref-NN-<slug> [chemin-image]   (sans chemin → presse-papiers)');
  process.exit(1);
}
mkdirSync(REFS, { recursive: true });
const out = join(REFS, `${ref}.png`);

if (src) {
  if (!existsSync(src)) { console.error(`Fichier introuvable : ${src}`); process.exit(1); }
  copyFileSync(src, out);
} else {
  // AppleScript passé par FICHIER : les guillemets français de «class PNGf» ne survivent pas
  // proprement à une ligne de commande, et un -e mal échappé échoue en silence.
  const scpt = join(REFS, '.clip.applescript');
  writeFileSync(scpt,
    `set p to POSIX file "${out}"\n` +
    `try\n` +
    `  set img to (the clipboard as «class PNGf»)\n` +
    `on error\n` +
    `  return "NOPNG"\n` +
    `end try\n` +
    `set f to open for access p with write permission\n` +
    `set eof f to 0\n` +
    `write img to f\n` +
    `close access f\n` +
    `return "OK"\n`);
  let res = '';
  try { res = execFileSync('osascript', [scpt], { encoding: 'utf8' }).trim(); }
  catch (e) { res = 'ERR ' + String(e.stderr || e.message).split('\n')[0]; }
  finally { unlinkSync(scpt); }
  if (res !== 'OK') {
    console.error(
      res === 'NOPNG'
        ? 'Le presse-papiers ne contient pas d\'image.\n' +
          '→ fais ⌘C sur l\'image (pas ⌘V dans le chat), ou passe un chemin en argument.'
        : `Extraction impossible : ${res}`);
    process.exit(1);
  }
}

const dims = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', out], { encoding: 'utf8' });
const w = Number((dims.match(/pixelWidth:\s*(\d+)/) || [])[1]);
const h = Number((dims.match(/pixelHeight:\s*(\d+)/) || [])[1]);
console.log(`✓ ${out}  (${w}×${h} px · ${(statSync(out).size / 1024).toFixed(0)} Ko)`);
console.log(`   pipette / palette : node bin/palette.mjs ${ref}`);
console.log(`   comparaison       : node bin/diff.mjs ${ref}`);
