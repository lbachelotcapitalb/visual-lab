#!/usr/bin/env node
// Relever une image source au lieu de la deviner : palette quantifiée, pipette exacte, zoom.
// C'est ce qui remplace les « ≈ » de SPEC-SOURCES.md par des valeurs.
//
//   node bin/palette.mjs ref-14-x                     → les 10 couleurs dominantes + leur part
//   node bin/palette.mjs ref-14-x --at 120,340        → pipette : le hex EXACT de ce pixel
//   node bin/palette.mjs ref-14-x --crop 0,0,400,200  → un zoom à REGARDER (proofs/)
//   node bin/palette.mjs ref-14-x --crop 0,0,200,100 --zoom 3
//
// Aucune dépendance : sips (natif) normalise l'entrée en PNG 8 bits, zlib (natif) fait le
// reste. Le recadrage est fait ICI et pas par sips : `sips --cropOffset` compte depuis le
// CENTRE de l'image, pas depuis son coin — un crop « 60,60 » y tombe en plein milieu et rend
// une plage uniforme qu'on croit être la bonne zone (piège payé le 31/07).
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { inflateSync, deflateSync } from 'node:zlib';
import { ROOT, DIRS } from './lib.mjs';

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const FLAGS = new Set(['at', 'crop', 'zoom', 'n']);
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && FLAGS.has(argv[i - 1].slice(2))));
const ref = positional[0];
const src = ref && existsSync(ref) ? ref : join(ROOT, 'assets', 'refs', `${ref}.png`);
if (!ref || !existsSync(src)) {
  console.error(`Image introuvable : ${src || '(aucune)'}\n→ node bin/ingest.mjs ${ref || 'ref-NN-<slug>'}`);
  process.exit(1);
}

function decode(path) {
  const tmp = join(ROOT, `.palette-${process.pid}.png`);
  execFileSync('sips', ['-s', 'format', 'png', path, '--out', tmp]);
  const buf = readFileSync(tmp); unlinkSync(tmp);
  let p = 8, W = 0, H = 0, ct = 0, bd = 0; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8);
    if (type === 'IHDR') { W = buf.readUInt32BE(p + 8); H = buf.readUInt32BE(p + 12); bd = buf[p + 16]; ct = buf[p + 17]; }
    else if (type === 'IDAT') idat.push(buf.subarray(p + 8, p + 8 + len));
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (bd !== 8 || (ct !== 2 && ct !== 6)) throw new Error(`PNG non géré (bitDepth ${bd}, colorType ${ct})`);
  const ch = ct === 6 ? 4 : 3, stride = W * ch, raw = inflateSync(Buffer.concat(idat)), px = Buffer.alloc(H * stride);
  for (let y = 0, o = 0; y < H; y++) {
    const f = raw[o++];
    for (let i = 0; i < stride; i++) {
      const v = raw[o + i], a = i >= ch ? px[y * stride + i - ch] : 0, b = y ? px[(y - 1) * stride + i] : 0,
            c = i >= ch && y ? px[(y - 1) * stride + i - ch] : 0;
      let out;
      if (f === 0) out = v; else if (f === 1) out = v + a; else if (f === 2) out = v + b;
      else if (f === 3) out = v + ((a + b) >> 1);
      else { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c);
             out = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      px[y * stride + i] = out & 0xff;
    }
    o += stride;
  }
  return { W, H, ch, px };
}

const CRC = (() => { const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return (b) => { let c = -1; for (const v of b) c = t[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
})();
function encodePng(W, H, rgb) {
  const chunk = (type, data) => {
    const b = Buffer.alloc(8 + data.length + 4);
    b.writeUInt32BE(data.length, 0); b.write(type, 4, 'ascii'); data.copy(b, 8);
    b.writeUInt32BE(CRC(b.subarray(4, 8 + data.length)), 8 + data.length); return b;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
  const rows = Buffer.alloc(H * (W * 3 + 1));
  for (let y = 0; y < H; y++) { rows[y * (W * 3 + 1)] = 0; rgb.copy(rows, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}

const img = decode(src);
const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0').toUpperCase()).join('');

const crop = flag('crop');
if (crop) {
  const [x, y, w, h] = crop.split(',').map(Number);
  const z = Math.max(1, Number(flag('zoom', 1)));
  if (x < 0 || y < 0 || x + w > img.W || y + h > img.H) { console.error(`Crop hors image (${img.W}×${img.H}).`); process.exit(1); }
  const out = Buffer.alloc(w * z * h * z * 3);
  for (let j = 0; j < h * z; j++) for (let i = 0; i < w * z; i++) {
    const s = ((y + (j / z | 0)) * img.W + (x + (i / z | 0))) * img.ch, d = (j * w * z + i) * 3;
    out[d] = img.px[s]; out[d + 1] = img.px[s + 1]; out[d + 2] = img.px[s + 2];
  }
  mkdirSync(DIRS.proofs, { recursive: true });
  // `ref` accepte aussi un CHEMIN (pipetter un rendu, pas seulement une source) : le nom de
  // sortie doit donc être construit sur le basename, sinon les `/` du chemin fabriquent un
  // sous-dossier inexistant et l'écriture échoue en ENOENT au dernier moment.
  const stem = ref.replace(/^.*\//, '').replace(/\.[a-z]+$/i, '');
  const f = join(DIRS.proofs, `crop-${stem}-${x}_${y}_${w}x${h}${z > 1 ? `@${z}x` : ''}.png`);
  writeFileSync(f, encodePng(w * z, h * z, out));
  console.log(`✓ ${f}  (${w * z}×${h * z}) — à REGARDER, puis à supprimer : proofs/ est jetable.`);
  process.exit(0);
}

const at = flag('at');
if (at) {
  const [x, y] = at.split(',').map(Number);
  if (x < 0 || y < 0 || x >= img.W || y >= img.H) { console.error(`Hors image (${img.W}×${img.H}).`); process.exit(1); }
  const i = (y * img.W + x) * img.ch;
  console.log(`${hex(img.px[i], img.px[i + 1], img.px[i + 2])}   (${x},${y}) sur ${img.W}×${img.H}`);
  process.exit(0);
}

const n = Number(flag('n', 10));
const bins = new Map();
for (let i = 0; i < img.W * img.H * img.ch; i += img.ch) {
  if (img.ch === 4 && img.px[i + 3] < 128) continue;
  const k = ((img.px[i] >> 3) << 10) | ((img.px[i + 1] >> 3) << 5) | (img.px[i + 2] >> 3);
  const e = bins.get(k) || [0, 0, 0, 0];
  e[0] += img.px[i]; e[1] += img.px[i + 1]; e[2] += img.px[i + 2]; e[3]++; bins.set(k, e);
}
const total = [...bins.values()].reduce((s, e) => s + e[3], 0);
const kept = [];
for (const e of [...bins.values()].sort((a, b) => b[3] - a[3])) {
  const c = [Math.round(e[0] / e[3]), Math.round(e[1] / e[3]), Math.round(e[2] / e[3])];
  if (kept.some((k) => Math.abs(k.c[0] - c[0]) + Math.abs(k.c[1] - c[1]) + Math.abs(k.c[2] - c[2]) < 24)) continue;
  kept.push({ c, n: e[3] });
  if (kept.length >= n) break;
}
console.log(`${ref} — ${img.W}×${img.H} px\n`);
for (const k of kept) console.log(`  ${hex(...k.c)}   ${(k.n / total * 100).toFixed(1).padStart(5)} %`);
console.log(`\nPipette : node bin/palette.mjs ${ref} --at x,y   ·   Zoom : --crop x,y,w,h [--zoom 3]`);
