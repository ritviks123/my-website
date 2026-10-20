/* sideBoard.js: a believable strip of PCB for a page's side gutter.
   Footprints (chips with round pads) stacked down the gutter, buses linking each chip to the next,
   every chip's outer pins tied into one main rail, and dashed bottom-layer traces that cross
   under the top traces through vias. Returns everything in page coordinates. */
import { route } from './doodles';

const PITCH = 14; // px between pads on a footprint (and between parallel traces)
const SKEW = 0.414; // tan(22.5°): keeps parallel traces evenly spaced through a 45° bend

// Same "random" numbers every time for the same seed
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

/*
  side: 'left' or 'right'. edge: page x of the screen edge. width: px of gutter to use.
  top / bottom: page y range. Inside, u = distance in from the screen edge, y = page y.
*/
export function sideBoard({ side, edge, width, top, bottom, seed }) {
  const out = { top: [], back: [], vias: [], pads: [], bodies: [], parts: [], joints: [], rail: null };
  if (width < 200) return out; // gutter too narrow on this screen

  const rand = seeded(seed);
  const between = (a, b) => a + rand() * (b - a);
  const whole = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const X = (u) => (side === 'left' ? edge + u : edge - u);
  const P = ([u, y]) => [X(u), y];
  const trace = (pts, chamfer = 0) => out.top.push(route(pts.map(P), chamfer));
  const back = (pts) => out.back.push(route(pts.map(P)));
  const via = (pt) => out.vias.push(P(pt));
  const pad = (pt) => out.pads.push(P(pt));

  const rail = 30; // main rail, close to the screen edge
  const lane = rail + 24; // dashed bottom-layer lane next to the rail
  const usable = width - 40; // keep clear of the article

  /* ----- 1. Place footprints down the gutter ----- */
  const chips = [];
  let y = top + 30;
  while (true) {
    const kind = ['quad', 'quad', 'dual', 'header'][whole(0, 3)];
    const n = kind === 'header' ? whole(4, 7) : whole(3, 6); // pins per side
    const span = (n - 1) * PITCH; // pad row length
    const w = kind === 'header' ? 26 : span + 22; // body size across (u)
    const h = kind === 'header' ? span + 22 : kind === 'dual' ? 34 : span + 22; // body size down (y)
    const ring = kind === 'header' ? 0 : 12; // pads sit just outside the body
    if (y + h + 2 * ring > bottom - 30) break;
    // Keep the chip between the rail traces and the article, leaving room on both sides
    const minU = rail + 110 + w / 2;
    const maxU = usable - 40 - w / 2;
    if (maxU < minU) break;
    const cu = Math.min(maxU, Math.max(minU, usable * between(0.5, 0.68)));
    const cy = y + ring + h / 2;
    const offs = (count) => Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * PITCH);
    const chip = { kind, cu, cy, w, h, top: [], bottom: [], outer: [], inner: [] };
    if (kind === 'header') {
      chip.outer = offs(n).map((o) => [cu, cy + o]); // one column of pads
    } else {
      chip.top = offs(n).map((o) => [cu + o, cy - h / 2 - 9]);
      chip.bottom = offs(n).map((o) => [cu + o, cy + h / 2 + 9]);
      if (kind === 'quad') {
        chip.outer = offs(n).map((o) => [cu - w / 2 - 9, cy + o]);
        chip.inner = offs(n).map((o) => [cu + w / 2 + 9, cy + o]);
      }
    }
    chips.push(chip);
    y = cy + h / 2 + ring + between(150, 230); // room for the bus to the next chip
  }
  if (!chips.length) return out;

  /* ----- 2. Draw the footprints: outline + round pads ----- */
  chips.forEach((c) => {
    out.bodies.push([X(c.cu) - c.w / 2, c.cy - c.h / 2, c.w, c.h]);
    [...c.top, ...c.bottom, ...c.outer, ...c.inner].forEach(pad);
  });

  /* ----- 3. Buses: each chip's bottom pins down to the next chip's top pins ----- */
  for (let k = 0; k + 1 < chips.length; k += 1) {
    const a = chips[k].bottom;
    const b = chips[k + 1].top;
    const c = Math.min(a.length, b.length, 5);
    if (c < 2) continue;
    const pick = (row) => row.slice(Math.floor((row.length - c) / 2), Math.floor((row.length - c) / 2) + c);
    const from = pick(a);
    const to = pick(b);
    from.forEach(([u, ya], j) => {
      const [ub, yb] = to[j];
      const dx = ub - u;
      const bend = ya + 20;
      trace([[u, ya + 5], [u, bend], [ub, bend + Math.abs(dx)], [ub, yb - 5]]);
    });
  }

  /* ----- 4. Outer pins tie into the main rail (some stop short at a via) ----- */
  const joints = [];
  chips.forEach((c) => {
    if (!c.outer.length) return;
    const s = [0, 0, 14, -14, 28][whole(0, 4)]; // the whole group steps sideways together at 45°
    const startU = c.outer[0][0] - 5;
    const bendU = (startU + rail) / 2 + 12;
    const m = -Math.sign(s); // slope of the 45° step, travelling toward the rail
    c.outer.forEach(([, yy], j) => {
      const a = bendU - j * SKEW * PITCH * m; // stagger the bends so the spacing stays even
      const pts = [[startU, yy], [a, yy]];
      if (s) pts.push([a - Math.abs(s), yy + s]);
      const lastBend = a - Math.abs(s); // where the 45° step ends
      const stopShort = rand() < 0.25 && lastBend - rail > 60; // only if there's room for a via
      const endU = stopShort ? rail + 30 + rand() * (lastBend - rail - 50) : rail;
      pts.push([endU, yy + s]);
      trace(pts);
      if (stopShort) via([endU, yy + s]);
      else joints.push(yy + s);
    });
    // A series resistor sitting on one of the pin traces
    if (rand() < 0.6) {
      const j = whole(0, c.outer.length - 1);
      const pu = startU - 16;
      out.parts.push([X(pu) - 7, c.outer[j][1] - 4, 14, 8]);
    }
  });

  /* ----- 5. Inner pins: short stubs toward the article, ending in staggered vias ----- */
  chips.forEach((c) => {
    c.inner.forEach(([u, yy], j) => {
      const len = 18 + (j % 2) * 16;
      if (u + len > usable) return;
      trace([[u + 5, yy], [u + len, yy]]);
      via([u + len, yy]);
    });
  });
  // Unused top pins of the first chip and bottom pins of the last: short stubs to vias
  const first = chips[0];
  first.top.forEach(([u, yy], j) => {
    trace([[u, yy - 5], [u, yy - 18 - (j % 2) * 12]]);
    via([u, yy - 18 - (j % 2) * 12]);
  });
  const last = chips[chips.length - 1];
  last.bottom.forEach(([u, yy], j) => {
    trace([[u, yy + 5], [u, yy + 18 + (j % 2) * 12]]);
    via([u, yy + 18 + (j % 2) * 12]);
  });

  /* ----- 6. Bottom layer: dashed traces between gaps, crossing under the rail traces ----- */
  for (let k = 0; k + 1 < chips.length; k += 1) {
    if (rand() < 0.4) continue;
    const y1 = (chips[k].cy + chips[k].h / 2 + chips[k + 1].cy - chips[k + 1].h / 2) / 2;
    const y2 = k + 2 < chips.length ? (chips[k + 1].cy + chips[k + 1].h / 2 + chips[k + 2].cy - chips[k + 2].h / 2) / 2 : null;
    if (y2 === null) continue;
    back([[lane, y1], [lane, y2]]);
    via([lane, y1]);
    via([lane, y2]);
    trace([[rail, y1], [lane - 5, y1]]); // tie the via back to the rail
    joints.push(y1);
  }

  /* ----- 7. The main rail: one trace linking everything on this side ----- */
  if (joints.length) {
    const y0 = Math.min(...joints) - 30;
    const y1 = Math.max(...joints) + 30;
    out.rail = route([P([rail, y0]), P([rail, y1])]);
    via([rail, y0]);
    via([rail, y1]);
    joints.forEach((yy) => out.joints.push(P([rail, yy])));
  }
  return out;
}