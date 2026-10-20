/* Background doodles: PCB traces and parts that fill empty space and lead nowhere.
   Each shape copies something real boards have a reason for (a chip's signals escaping to vias,
   a ground-stitching row, a length-matched trace), so it reads as designed rather than random.
   fillDoodles(areas, seed, density) returns { paths, vias, pads, bodies } in page coordinates. */

const P = 12; // px between parallel traces
const EDGE = 10; // px kept clear inside each area
const SKEW = 0.42; // tan(22.5°): keeps parallel traces evenly spaced through a 45° bend

const round = (n) => Math.round(n * 10) / 10;

// Corner points → SVG path (chamfer > 0 cuts each corner at 45°)
export function route(points, chamfer = 0) {
  let d = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = points[i];
    const next = points[i + 1];
    const [px, py] = points[i - 1];
    const inLen = Math.hypot(x - px, y - py);
    const outLen = next ? Math.hypot(next[0] - x, next[1] - y) : 0;
    if (!chamfer || !next || inLen === 0 || outLen === 0) {
      d += ` L${round(x)} ${round(y)}`;
      continue;
    }
    const c = Math.min(chamfer, inLen / 2, outLen / 2);
    d += ` L${round(x - ((x - px) / inLen) * c)} ${round(y - ((y - py) / inLen) * c)}`;
    d += ` L${round(x + ((next[0] - x) / outLen) * c)} ${round(y + ((next[1] - y) / outLen) * c)}`;
  }
  return d;
}

// Same "random" numbers every time for the same seed, so the layout doesn't jump around
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (rand, a, b) => a + rand() * (b - a);
const whole = (rand, a, b) => a + Math.floor(rand() * (b - a + 1)); // whole number from a to b

// A local drawing area: u runs along the area's long side, v across it, with random mirroring
function frame([x0, y0, x1, y1], rand, out, full = false, dense = false) {
  const w = x1 - x0;
  const h = y1 - y0;
  const horizontal = w >= h;
  const A = horizontal ? w : h;
  const B = horizontal ? h : w;
  const flipU = rand() < 0.5;
  const flipV = rand() < 0.5;
  const at = ([u, v]) => {
    const uu = flipU ? A - u : u;
    const vv = flipV ? B - v : v;
    return horizontal ? [x0 + uu, y0 + vv] : [x0 + vv, y0 + uu];
  };
  const rect = (list, [u, v], du, dv) => {
    const [x, y] = at([u, v]);
    const [rw, rh] = horizontal ? [du, dv] : [dv, du];
    list.push([x - rw / 2, y - rh / 2, rw, rh]);
  };
  return {
    A,
    B,
    full, // true = stretch to fill the whole area
    dense, // true = more traces per shape (for wide open gutters)
    trace: (pts, chamfer = 0) => out.paths.push(route(pts.map(at), chamfer)),
    via: (pt) => out.vias.push(at(pt)),
    pad: (pt, du, dv) => rect(out.pads, pt, du, dv),
    body: (pt, du, dv) => rect(out.bodies, pt, du, dv),
  };
}

// n parallel traces from u0 to u1 that shift sideways by amp at each stop (jogs = [[u, amp], ...])
function bundle(f, n, base, u0, u1, jogs) {
  for (let k = 0; k < n; k += 1) {
    let v = base + k * P;
    const start = u0 + (k % 2) * 14; // staggered vias at both ends, like a real via field
    const end = u1 - ((k + 1) % 2) * 14;
    const pts = [[start, v]];
    jogs.forEach(([u, amp]) => {
      const lead = (amp > 0 ? n - 1 - k : k) * P * SKEW;
      pts.push([u + lead, v], [u + lead + Math.abs(amp), v + amp]);
      v += amp;
    });
    pts.push([end, v]);
    f.trace(pts);
    f.via([start, base + k * P]);
    f.via([end, v]);
  }
}

/* ----- the shapes ----- */

// A bus between two via fields that steps sideways once (or twice, back again)
function jog(f, rand) {
  const { A, B } = f;
  const n = Math.min(Math.floor((B - 2 * EDGE - 16) / P) + 1, f.dense ? whole(rand, 4, 7) : whole(rand, 2, 4));
  if (n < 2 || A < 150) return false;
  const band = (n - 1) * P;
  const amp = Math.min(40, B - 2 * EDGE - band) * between(rand, 0.6, 1);
  if (amp < 16) return false;
  const len = f.full ? A - 2 * EDGE : A * between(rand, 0.6, 0.85);
  const u0 = (A - len) / 2;
  const sign = rand() < 0.5 ? -1 : 1;
  const base = (B - band - amp) / 2 + (sign < 0 ? amp : 0);
  const step = amp + band * SKEW;
  const jogs =
    len > 320 && rand() < 0.6
      ? [[u0 + len * 0.25, sign * amp], [u0 + len * 0.75 - step, -sign * amp]]
      : [[u0 + (len - step) / 2, sign * amp]];
  bundle(f, n, base, u0, u0 + len, jogs);
  return true;
}

// A bus that crosses the area on one long 45° run
function diagonal(f, rand) {
  const { A, B } = f;
  const n = f.dense ? whole(rand, 4, 6) : whole(rand, 2, 4);
  const band = (n - 1) * P;
  const D = Math.min(B - 2 * EDGE - band, A * 0.5);
  if (D < 50 || A < 170) return false;
  const len = f.full ? A - 2 * EDGE : A * between(rand, 0.7, 0.9);
  const u0 = (A - len) / 2;
  const base = (B - band - D) / 2;
  const at = u0 + (len - D - band * SKEW) * between(rand, 0.35, 0.65);
  bundle(f, n, base, u0, u0 + len, [[at, D]]);
  return true;
}

// A small bus where the outer trace snakes back and forth (length matching on real boards)
function serpentine(f, rand) {
  const { A, B } = f;
  const n = whole(rand, 2, 3);
  const band = (n - 1) * P;
  const amp = whole(rand, 14, 20);
  const bumps = whole(rand, 3, 6);
  const meander = bumps * 24;
  if (A < meander + 120 || B < band + amp + 2 * EDGE) return false;
  const len = Math.min(A - 2 * EDGE, meander + between(rand, 120, 260));
  const u0 = (A - len) / 2;
  const base = (B - band - amp) / 2;
  const mStart = u0 + (len - meander) / 2;
  for (let k = 0; k < n; k += 1) {
    const v = base + k * P;
    const start = u0 + (k % 2) * 14;
    const end = u0 + len - ((k + 1) % 2) * 14;
    const pts = [[start, v]];
    if (k === n - 1) {
      // Outer trace: square bumps pushed outward
      for (let b = 0; b < bumps; b += 1) {
        const u = mStart + b * 24;
        pts.push([u, v], [u, v + amp], [u + 12, v + amp], [u + 12, v]);
      }
    }
    pts.push([end, v]);
    f.trace(pts, k === n - 1 ? 3 : 0);
    f.via([start, v]);
    f.via([end, v]);
  }
  return true;
}

// A bus that turns a corner together (nested 45° corners)
function elbow(f, rand) {
  const { A, B } = f;
  const n = Math.min(f.dense ? whole(rand, 4, 7) : whole(rand, 3, 4), Math.floor((Math.min(A, B) - 80) / P) + 1);
  if (n < 2) return false;
  const band = (n - 1) * P;
  const wide = f.full ? A - 2 * EDGE : Math.min(A - 2 * EDGE, between(rand, 130, 240));
  const tall = f.full ? B - 2 * EDGE : Math.min(B - 2 * EDGE, between(rand, 90, 200));
  if (wide < band + 70 || tall < band + 60) return false;
  const u0 = (A - wide) / 2;
  const v0 = (B - tall) / 2;
  const uc = u0 + wide - band; // inner lane
  for (let k = 0; k < n; k += 1) {
    const v = v0 + k * P;
    const u = uc + (n - 1 - k) * P; // the bottom trace turns first
    const start = u0 + (k % 2) * 14;
    const end = v0 + tall - ((n - 1 - k) % 2) * 14;
    f.trace([[start, v], [u, v], [u, end]], 22);
    f.via([start, v]);
    f.via([u, end]);
  }
  return true;
}

// A ground trace with evenly spaced stitching vias (boards do this along their edges)
function stitch(f, rand) {
  const { A, B } = f;
  if (A < 140 || B < 50) return false;
  const len = f.full ? A - 2 * EDGE : Math.min(A - 2 * EDGE, between(rand, 160, 340));
  const u0 = (A - len) / 2;
  const v = B / 2 - 8;
  const gap = rand() < 0.5 ? 24 : 32;
  const stub = rand() < 0.5 ? 14 : 20;
  f.trace([[u0, v], [u0 + len, v]]);
  f.via([u0, v]);
  f.via([u0 + len, v]);
  for (let u = u0 + gap; u < u0 + len - gap / 2; u += gap) {
    f.trace([[u, v], [u, v + stub]]);
    f.via([u, v + stub]);
  }
  return true;
}

// A chip in a random size: one side's pins escape into a bus that runs to a via field,
// the other side's pins drop straight to vias
function chip(f, rand) {
  const { A, B } = f;
  let pins = whole(rand, 2, 6);
  const pitch = 10;
  const bodyH = whole(rand, 2, 4) * 8 + 4; // 20 to 36 px tall
  const room = (n) => bodyH + (n - 1) * P + 26 + 2 * EDGE + 30; // height a chip with n pins needs
  while (pins > 2 && (B < room(pins) || A < pins * pitch + 130)) pins -= 1; // smaller chip if it's tight
  const bodyW = pins * pitch + 10;
  const busRoom = (pins - 1) * P + 26; // space under the chip for the turning bus
  if (B < room(pins) || A < bodyW + 120) return false;

  const top = (B - bodyH - busRoom - 22) / 2 + 22; // body's top edge (22px above for the short stubs)
  const bottom = top + bodyH;
  const cu = EDGE + bodyW / 2 + (f.full ? 0 : between(rand, 0, Math.max(0, (A - bodyW - 120) * 0.4)));
  const pinU = (i) => cu + (i - (pins - 1) / 2) * pitch;
  f.body([cu, top + bodyH / 2], bodyW, bodyH);

  const runEnd = f.full ? A - EDGE : Math.min(A - EDGE, cu + bodyW / 2 + between(rand, 90, 220));
  for (let i = 0; i < pins; i += 1) {
    const u = pinU(i);
    // Top pins: short stubs straight to vias
    f.pad([u, top - 3], 4, 6);
    f.trace([[u, top - 6], [u, top - 16]]);
    f.via([u, top - 18]);
    // Bottom pins: down, then all turn together into a bus (the rightmost pin turns first)
    f.pad([u, bottom + 3], 4, 6);
    const lane = bottom + 14 + (pins - 1 - i) * P;
    const end = runEnd - (i % 2) * 14;
    f.trace([[u, bottom + 6], [u, lane], [end, lane]], 8);
    f.via([end, lane]);
  }
  return true;
}

// A power rail with decoupling capacitors hanging off it, each grounded through a via
function passives(f, rand) {
  const { A, B } = f;
  if (A < 140 || B < 70) return false;
  const len = f.full ? A - 2 * EDGE : Math.min(A - 2 * EDGE, between(rand, 150, 300));
  const u0 = (A - len) / 2;
  const v = B / 2 - 18;
  const parts = Math.max(2, Math.min(4, Math.floor(len / 56)));
  f.trace([[u0, v], [u0 + len, v]]);
  f.via([u0, v]);
  f.via([u0 + len, v]);
  for (let i = 1; i <= parts; i += 1) {
    const u = u0 + (len * i) / (parts + 1);
    f.trace([[u, v], [u, v + 8]]);
    f.pad([u, v + 11], 8, 5);
    f.body([u, v + 18], 6, 10);
    f.pad([u, v + 25], 8, 5);
    f.trace([[u, v + 28], [u, v + 38]]);
    f.via([u, v + 40]);
  }
  return true;
}

// A big square chip with pins on all four sides, each pin fanning out into its own trace
function qfp(f, rand) {
  const { A, B } = f;
  const q = 7; // px between pins on the chip
  let m = whole(rand, 6, 10); // pins per side
  const size = (pins) => {
    const half = ((pins - 1) / 2) * q + 7; // half the body width
    const spread = ((pins - 1) / 2) * (P - q); // how far the outer pins fan out
    const d0 = Math.max(10, ((pins - 1) / 2) * P - half + 8); // straight stub before the fan (keeps corners clear)
    return { half, spread, d0, reach: half + d0 + spread + 30 };
  };
  while (m > 4 && (2 * size(m).reach > A - 2 * EDGE || 2 * size(m).reach > B - 2 * EDGE)) m -= 1;
  const { half, spread, d0, reach } = size(m);
  if (2 * reach > A - 2 * EDGE || 2 * reach > B - 2 * EDGE) return false;

  const cu = A / 2 + between(rand, -0.3, 0.3) * (A - 2 * reach - 2 * EDGE) / 2;
  const cv = B / 2 + between(rand, -0.3, 0.3) * (B - 2 * reach - 2 * EDGE) / 2;
  f.body([cu, cv], half * 2, half * 2);

  // Each side: n = which way is "out", t = along the side
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([nu, nv]) => {
    const [tu, tv] = [-nv, nu];
    const at = (out, side) => [cu + nu * out + tu * side, cv + nv * out + tv * side];
    const room = nu > 0 ? A - EDGE - cu : nu < 0 ? cu - EDGE : nv > 0 ? B - EDGE - cv : cv - EDGE;
    const maxLen = room - half - d0 - spread - 14;
    if (maxLen < 8) return;
    const len = between(rand, f.dense ? 0.8 : 0.35, 1) * maxLen;
    for (let i = 0; i < m; i += 1) {
      const o = i - (m - 1) / 2;
      f.pad(at(half + 3, o * q), nu ? 6 : 3.5, nu ? 3.5 : 6);
      const fan = half + d0 + Math.abs(o) * (P - q);
      const end = half + d0 + spread + len - (i % 2) * 12;
      f.trace([at(half + 6, o * q), at(half + d0, o * q), at(fan, o * P), at(end, o * P)]);
      f.via(at(end, o * P));
    }
  });
  return true;
}

// A through-hole chip: two rows of round pads, each row leaving as a bus that steps over at 45°
function dip(f, rand) {
  const { A, B } = f;
  const k = whole(rand, 4, 8); // pins per row
  const pitch = 18;
  const gap = 46; // px between the two rows
  const length = (k - 1) * pitch;
  if (A < length + 60 || B < gap + 140) return false;
  const cu = A / 2 + between(rand, -0.25, 0.25) * (A - length - 60);
  const cv = B / 2;
  const s = whole(rand, 2, 4) * 8 * (rand() < 0.5 ? -1 : 1); // sideways step of the buses
  f.body([cu, cv], length + 20, gap - 18);
  [-1, 1].forEach((dir) => {
    const row = cv + (dir * gap) / 2;
    const room = dir < 0 ? row - EDGE : B - EDGE - row;
    const len = between(rand, f.dense ? 0.8 : 0.4, 1) * (room - 20 - Math.abs(s) - 12);
    if (len < 10) return;
    for (let i = 0; i < k; i += 1) {
      const u = cu - length / 2 + i * pitch;
      const end = row + dir * (20 + Math.abs(s) + len - (i % 2) * 10);
      f.via([u, row]);
      f.trace([[u, row + dir * 5], [u, row + dir * 20], [u + s, row + dir * (20 + Math.abs(s))], [u + s, end]]);
      f.via([u + s, end]);
    }
  });
  return true;
}

const SHAPES = { jog, diagonal, serpentine, elbow, stitch, chip, passives, qfp, dip };
const LIMIT = { serpentine: 2, qfp: 3 }; // most of these per page, so nothing feels copy-pasted

// Splits big areas into smaller pieces, then puts one shape in each piece.
// areas: [{ box: [x0, y0, x1, y1], kinds: ['chip', ...], full }]
//   kinds = which shapes suit that spot, full = one shape stretched across the whole area,
//   dense = busier shapes with more traces (for wide open gutters)
export function fillDoodles(areas, seed, density = 0.85) {
  const rand = seeded(seed);
  const out = { paths: [], vias: [], pads: [], bodies: [] };

  // A shuffled "deck" of shapes, so neighbors rarely get the same one
  let deck = [];
  const draw = () => {
    if (!deck.length) {
      deck = Object.keys(SHAPES);
      for (let i = deck.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }
    return deck.pop();
  };

  const used = {};
  let last = '';
  const fill = (box, kinds, depth, full, dense) => {
    const [x0, y0, x1, y1] = box;
    const w = x1 - x0;
    const h = y1 - y0;
    if (Math.min(w, h) < 40 || Math.max(w, h) < 120) return;
    // Big areas get split in two (with a gap), so they hold more than one shape
    const splitOdds = dense ? 0.95 : 0.8 * density;
    if (!full && depth < (dense ? 3 : 2) && Math.max(w, h) > (dense ? 260 : 340) && Math.min(w, h) > 60 && rand() < splitOdds) {
      const t = between(rand, 0.4, 0.6);
      const gap = 20;
      if (w >= h) {
        const xm = x0 + w * t;
        fill([x0, y0, xm - gap, y1], kinds, depth + 1, full, dense);
        fill([xm + gap, y0, x1, y1], kinds, depth + 1, full, dense);
      } else {
        const ym = y0 + h * t;
        fill([x0, y0, x1, ym - gap], kinds, depth + 1, full, dense);
        fill([x0, ym + gap, x1, y1], kinds, depth + 1, full, dense);
      }
      return;
    }
    if (!full && !dense && rand() > density + 0.1) return; // leave a few spots empty on purpose
    for (let tries = 0; tries < 16; tries += 1) {
      const name = draw();
      const ok = kinds.includes(name) && (used[name] || 0) < (LIMIT[name] ?? Infinity) && (name !== last || kinds.length === 1);
      if (ok && SHAPES[name](frame(box, rand, out, full, dense), rand)) {
        used[name] = (used[name] || 0) + 1;
        last = name;
        return;
      }
    }
  };

  areas.forEach(({ box, kinds, full, dense }) => fill(box, kinds, 0, full, dense));
  return out;
}