#!/usr/bin/env node
// bin/ann.mjs — générateur de tracés « au marqueur » : sort des attributs `d` CUITS.
//
//   node bin/ann.mjs oval      <cx> <cy> <rx> <ry> [seed]
//   node bin/ann.mjs underline <x1> <x2> <y>      [seed]
//   node bin/ann.mjs arrow     <x1> <y1> <x2> <y2> [seed]
//   node bin/ann.mjs zigzag    <x> <y1> <y2>      [seed]
//
// POURQUOI un outil et pas un script dans le fragment : un pattern est du HTML STATIQUE, il
// ne porte pas de JS. Le désordre doit donc exister dans les NOMBRES du `d`, pas dans un
// calcul au chargement. On le fabrique ici, une fois, avec une graine — et on colle.
//
// Les coordonnées attendues sont celles de la SLIDE (viewBox 0 0 1600 900) ou de la racine du
// pattern. Elles se MESURENT dans Chrome (Range + getClientRects sur la cible), jamais à
// l'estime : un ovale estimé rate son titre de 40 px, ce qui se voit immédiatement.
// Le fragment est du HTML statique : le désordre doit exister dans les nombres, pas
// dans un script. Ici on le fabrique une fois, avec une graine, et on colle le résultat.
// jitter = fraction du rayon (ou de la longueur) dont chaque point de contrôle est décalé.
const rng = (seed) => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const r2 = (n) => Math.round(n * 10) / 10;

// ——— ovale d'encerclement : ellipse OUVERTE, le trait dépasse et se recroise ———
export function oval(cx, cy, rx, ry, { jitter = 0.03, seed = 7, from = -0.35, to = 6.55, n = 7 } = {}) {
  const rnd = rng(seed);
  const j = () => 1 + (rnd() * 2 - 1) * jitter;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = from + (to - from) * (i / n);
    pts.push([cx + Math.cos(a) * rx * j(), cy + Math.sin(a) * ry * j()]);
  }
  // Catmull-Rom → cubiques, avec les poignées elles-mêmes bousculées.
  let d = `M ${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * j(), p1[1] + (p2[1] - p0[1]) / 6 * j()];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * j(), p2[1] - (p3[1] - p1[1]) / 6 * j()];
    d += ` C ${r2(c1[0])} ${r2(c1[1])}, ${r2(c2[0])} ${r2(c2[1])}, ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d;
}

// ——— soulignement ondulé : plus long que le mot des deux côtés ———
export function underline(x1, x2, y, { amp = 4, jitter = 0.03, seed = 11, over = 0.06, n = 5 } = {}) {
  const rnd = rng(seed);
  const w = x2 - x1, a = x1 - w * over, b = x2 + w * over, span = b - a;
  let d = `M ${r2(a)} ${r2(y + (rnd() * 2 - 1) * amp)}`;
  for (let i = 0; i < n; i++) {
    const xs = a + span * (i / n), xe = a + span * ((i + 1) / n), dx = (xe - xs) / 3;
    const s = i % 2 ? 1 : -1;
    const jy = () => (rnd() * 2 - 1) * span * jitter * 0.12;
    d += ` C ${r2(xs + dx)} ${r2(y + s * amp + jy())}, ${r2(xe - dx)} ${r2(y - s * amp + jy())}, ${r2(xe)} ${r2(y + jy())}`;
  }
  return d;
}

// ——— flèche courbe : un arc + deux traits ouverts en pointe ———
export function arrow(x1, y1, x2, y2, { bow = 0.28, jitter = 0.03, seed = 23, head = 26 } = {}) {
  const rnd = rng(seed);
  const j = (v) => v * (1 + (rnd() * 2 - 1) * jitter);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const nx = -(y2 - y1), ny = x2 - x1, len = Math.hypot(nx, ny) || 1;
  const c = [j(mx + nx / len * len * bow), j(my + ny / len * len * bow)];
  const body = `M ${r2(x1)} ${r2(y1)} Q ${r2(c[0])} ${r2(c[1])}, ${r2(x2)} ${r2(y2)}`;
  // la pointe part de la tangente finale, deux traits qui ne se ferment pas
  const ta = Math.atan2(y2 - c[1], x2 - c[0]);
  const w1 = ta + 2.5 + (rnd() * 2 - 1) * 0.12, w2 = ta - 2.5 + (rnd() * 2 - 1) * 0.12;
  const h1 = `M ${r2(x2)} ${r2(y2)} L ${r2(x2 + Math.cos(w1) * head)} ${r2(y2 + Math.sin(w1) * head)}`;
  const h2 = `M ${r2(x2)} ${r2(y2)} L ${r2(x2 + Math.cos(w2) * head)} ${r2(y2 + Math.sin(w2) * head)}`;
  return [body, h1 + ' ' + h2];
}

// ——— gribouillis vertical : zigzag serré le long d'un titre ———
export function zigzag(x, y1, y2, { w = 26, n = 9, jitter = 0.03, seed = 31 } = {}) {
  const rnd = rng(seed);
  const step = (y2 - y1) / n;
  let d = `M ${r2(x - w / 2)} ${r2(y1)}`;
  for (let i = 1; i <= n; i++) {
    const s = i % 2 ? 1 : -1;
    d += ` L ${r2(x + s * (w / 2) * (1 + (rnd() * 2 - 1) * jitter * 6))} ${r2(y1 + step * i + (rnd() * 2 - 1) * step * jitter)}`;
  }
  return d;
}

const [cmd, ...a] = process.argv.slice(2);
const n = (i, d) => (a[i] === undefined ? d : Number(a[i]));
if (cmd === 'oval') console.log(oval(n(0), n(1), n(2), n(3), { seed: n(4, 7) }));
// L'amplitude est exposée parce que le soulignement DOUBLE existe dans la charte : deux traits
// à 4 d'amplitude se croisent, à 3 ils se lisent comme une paire.
else if (cmd === 'underline') console.log(underline(n(0), n(1), n(2), { seed: n(3, 11), amp: n(4, 4) }));
else if (cmd === 'arrow') console.log(arrow(n(0), n(1), n(2), n(3), { seed: n(4, 23) }).join('\n'));
else if (cmd === 'zigzag') console.log(zigzag(n(0), n(1), n(2), { seed: n(3, 31) }));
else if (cmd) {
  console.error(`Tracé inconnu : ${cmd}. Attendu : oval | underline | arrow | zigzag.`);
  process.exit(1);
}
