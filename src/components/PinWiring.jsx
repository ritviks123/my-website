import { useEffect, useRef, useState } from 'react';
import { route as chamfered } from './doodles';
import './PinWiring.css';

/* ===== Swap these later ===== */
const STUB_SHARE = 0.35; // share of free pins that get a short trace out to a via
const MAX_LINKS = 6; // most traces between two neighboring chips
const LOOP_GAP = 12; // px between nested traces that wrap around the outside
const WIDTHS = [1.4, 2, 2.6, 3.4, 4.2]; // trace thicknesses to pick from
const VIAS = [2.5, 3.2, 4, 5, 6]; // via sizes to pick from
/* ============================ */

/*
  Wires the chips (cards) on a page to each other, like a schematic:
    - neighboring chips connect pin to pin across the gap between them
    - chips stacked in a column wrap a few traces around their outer side
    - a few free pins run out into open space (some with a 45° jog or a long diagonal) and end in vias
  Wires only draw themselves in once the chips they touch have scrolled into view.
  Trace widths and via sizes vary a little so it looks hand-routed.
  It reads the same package rules as chips.css, so pins always line up with a drawn pin.
*/

// Which cards are which package (keep in sync with chips.css)
const PACKAGES = [
  // A: pins down both sides
  { kind: 'A', select: '.project-card, .project-sidebar, .project-section-chip, .work-job, .work-split div.work-card, .about-bio, .about-now', sides: ['left', 'right'], pitch: 26, inset: 14 },
  // A, turned: pins on top and bottom
  { kind: 'AV', select: '[data-wire^="tk-"], .project-stat', sides: ['top', 'bottom'], pitch: 26, inset: 14 },
  // B: quad package
  { kind: 'B', select: '.featured, .carousel, .resume-board, .work-tool-group, .about-side, .work-certs', sides: ['left', 'right', 'top', 'bottom'], pitch: 16, inset: 22 },
];
const PIN_LONG = 7; // matches --pin-long in chips.css

const round = (n) => Math.round(n * 10) / 10;
const pathOf = (pts) => `M${pts.map(([x, y]) => `${round(x)} ${round(y)}`).join(' L')}`;

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

// Pin tips along one side of a chip (centered rows, like the CSS draws them)
function pinsOn(chip, side) {
  const { rect: r, pkg, scale } = chip;
  const pitch = pkg.pitch * scale;
  const inset = pkg.inset * scale;
  const tip = PIN_LONG * scale;
  const vertical = side === 'left' || side === 'right';
  const length = vertical ? r.height : r.width;
  const center = vertical ? r.top + r.height / 2 : r.left + r.width / 2;
  const reach = length / 2 - inset - 4 * scale;
  const pins = [];
  for (let k = -Math.floor(reach / pitch); k * pitch <= reach; k += 1) {
    const along = center + k * pitch;
    if (side === 'left') pins.push({ x: r.left - tip, y: along });
    if (side === 'right') pins.push({ x: r.right + tip, y: along });
    if (side === 'top') pins.push({ x: along, y: r.top - tip });
    if (side === 'bottom') pins.push({ x: along, y: r.bottom + tip });
  }
  return pins;
}

function measure(board, seed) {
  const box = board.getBoundingClientRect();
  const rand = seeded(seed);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const width = () => pick(WIDTHS);
  const viaSize = () => pick(VIAS);
  const bevel = () => pick([0, 6, 10, 14]); // 45° corner cut size for this group of traces

  // Every chip on the page, its package, and its box in board coordinates
  const chips = [];
  PACKAGES.forEach((pkg) => {
    board.querySelectorAll(pkg.select).forEach((el) => {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) return;
      const rect = {
        left: b.left - box.left,
        right: b.right - box.left,
        top: b.top - box.top,
        bottom: b.bottom - box.top,
        width: b.width,
        height: b.height,
      };
      chips.push({ el, pkg, rect, scale: b.width / (el.offsetWidth || b.width) });
    });
  });
  if (!chips.length) return null;
  chips.forEach((c) => {
    c.pins = {};
    c.pkg.sides.forEach((side) => {
      c.pins[side] = pinsOn(c, side).map((p) => ({ ...p, used: false }));
    });
  });

  // Text outside the chips (headings, paragraphs, figures) is an obstacle too, so traces never run through it
  const local = (el) => {
    const b = el.getBoundingClientRect();
    return { left: b.left - box.left, right: b.right - box.left, top: b.top - box.top, bottom: b.bottom - box.top };
  };
  const chipEls = chips.map((c) => c.el);
  const headings = [...board.querySelectorAll('h1, h2, h3, p, figure, dl, ul, ol, .project-figure, .project-spec, .project-nearby')]
    .filter((el) => !chipEls.some((c) => c.contains(el) || el.contains(c))) // skip text inside chips and lists that hold chips
    .map(local)
    .filter((r) => r.right > r.left && r.bottom > r.top);

  const wires = [];
  const vias = [];
  // Each wire remembers the chips it touches, so it only appears once they've scrolled in
  const shown = (...list) => list.filter(Boolean).every((c) => !c.el.closest('.reveal-pending'));
  let owners = [];
  const add = (pts, w = width(), cut = 0) => {
    const d = cut ? chamfered(pts, cut) : pathOf(pts);
    wires.push({ d, w, on: shown(...owners) });
  };
  // Adds a route only if it stays clear of every other chip and heading
  const route = (pts, w, A, B, cut = 0) => {
    owners = [A, B];
    const rects = [...chips.filter((c) => c !== A && c !== B).map((c) => c.rect), ...headings];
    const hit = pts.slice(1).some(([x, y], i) => {
      const [px, py] = pts[i];
      const [x0, x1, y0, y1] = [Math.min(x, px), Math.max(x, px), Math.min(y, py), Math.max(y, py)];
      return rects.some((r) => x1 > r.left - 6 && x0 < r.right + 6 && y1 > r.top - 6 && y0 < r.bottom + 6);
    });
    if (!hit) add(pts, w, cut);
    return !hit;
  };
  // Connects pin pairs with a route builder; a pair only counts as used if its route fits
  const link = (pairs, build, A, B, cut = 0) => {
    const w = width();
    pairs.forEach(([p, q]) => {
      if (route(build(p, q), w, A, B, cut)) {
        p.used = true;
        q.used = true;
      }
    });
  };
  const zip = (xs, ys, n) => Array.from({ length: n }, (_, k) => [xs[k], ys[k]]);
  const overlap = (a0, a1, b0, b1) => [Math.max(a0, b0), Math.min(a1, b1)];
  const middle = (list, n) => list.slice(Math.max(0, Math.floor((list.length - n) / 2)), Math.max(0, Math.floor((list.length - n) / 2)) + n);

  for (let i = 0; i < chips.length; i += 1) {
    for (let j = 0; j < chips.length; j += 1) {
      if (i === j) continue;
      const A = chips[i];
      const B = chips[j];
      const a = A.rect;
      const b = B.rect;

      // 1. Side by side: A's right pins to B's left pins across the gap
      if (a.right < b.left && b.left - a.right < 200 && A.pins.right && B.pins.left) {
        const [y0, y1] = overlap(a.top, a.bottom, b.top, b.bottom);
        if (y1 - y0 > 40) {
          const from = A.pins.right.filter((p) => !p.used && p.y > y0 + 6 && p.y < y1 - 6);
          const to = B.pins.left.filter((p) => !p.used && p.y > y0 + 6 && p.y < y1 - 6);
          const n = Math.min(MAX_LINKS, from.length, to.length);
          const gap = b.left - a.right;
          link(zip(middle(from, n), middle(to, n), n), (p, q) => [[p.x, p.y], [p.x + gap * 0.25, p.y], [q.x - gap * 0.25, q.y], [q.x, q.y]], A, B);
        }
      }

      // 2. Stacked (A above B)
      if (a.bottom < b.top && b.top - a.bottom < 240) {
        const gap = b.top - a.bottom;
        const [x0, x1] = overlap(a.left, a.right, b.left, b.right);

        // Straight down where they overlap: A's bottom pins to B's top pins
        if (A.pins.bottom && B.pins.top && x1 - x0 > 50) {
          const from = A.pins.bottom.filter((p) => !p.used && p.x > x0 + 8 && p.x < x1 - 8);
          const to = B.pins.top.filter((p) => !p.used && p.x > x0 + 8 && p.x < x1 - 8);
          const n = Math.min(MAX_LINKS, from.length, to.length);
          link(zip(middle(from, n), middle(to, n), n), (p, q) => [[p.x, p.y], [p.x, p.y + gap * 0.3], [q.x, q.y - gap * 0.3], [q.x, q.y]], A, B);
        }

        // Around the corners, as nested L shapes (the pins closest to each other pair up first)
        const lower = (pins, box2) => pins.filter((p) => !p.used && p.y > box2.top + box2.height / 2);
        const upper = (pins, box2) => pins.filter((p) => !p.used && p.y < box2.top + box2.height / 2);
        const corner = (sidePins, rowPins, n) =>
          link(zip(sidePins, rowPins, Math.min(4, n, sidePins.length, rowPins.length)), (p, q) => [[p.x, p.y], [q.x, p.y], [q.x, q.y]], A, B, bevel());
        // B sticks out to the right: A's right side drops onto B's top
        if (b.right > a.right + 40 && A.pins.right && B.pins.top) {
          const side = lower(A.pins.right, a).reverse();
          const row = B.pins.top.filter((p) => !p.used && p.x > a.right + 24);
          corner(side, row, 4);
        }
        // B starts further right: B's left side climbs onto A's bottom
        if (b.left > a.left + 40 && B.pins.left && A.pins.bottom) {
          const side = upper(B.pins.left, b);
          const row = A.pins.bottom.filter((p) => !p.used && p.x < b.left - 24).reverse();
          corner(side, row, 4);
        }
        // B sticks out to the left: A's left side drops onto B's top
        if (b.left < a.left - 40 && A.pins.left && B.pins.top) {
          const side = lower(A.pins.left, a).reverse();
          const row = B.pins.top.filter((p) => !p.used && p.x < a.left - 24).reverse();
          corner(side, row, 4);
        }
        // B ends further left: B's right side climbs onto A's bottom
        if (a.right > b.right + 40 && B.pins.right && A.pins.bottom) {
          const side = upper(B.pins.right, b);
          const row = A.pins.bottom.filter((p) => !p.used && p.x > b.right + 24);
          corner(side, row, 4);
        }

        // Same column, side pins only: wrap a few traces around the outer side (nested loops)
        ['left', 'right'].forEach((s) => {
          const aligned = Math.abs(s === 'left' ? a.left - b.left : a.right - b.right) < 30;
          if (!aligned || !A.pins[s] || !B.pins[s] || A.pins.bottom || B.pins.top) return;
          const ups = A.pins[s].filter((p) => !p.used).reverse(); // A's lowest pins first
          const downs = B.pins[s].filter((p) => !p.used); // B's highest pins first
          const n = Math.min(3, ups.length, downs.length);
          const dir = s === 'left' ? -1 : 1;
          const edge = s === 'left' ? Math.min(a.left, b.left) : Math.max(a.right, b.right);
          link(
            zip(ups, downs, n),
            (p, q) => {
              const k = ups.indexOf(p);
              const out = edge + dir * (22 + k * LOOP_GAP);
              return [[p.x, p.y], [out, p.y], [out, q.y], [q.x, q.y]];
            },
            A,
            B,
            bevel(),
          );
        });

        // A has side pins only, B (below) has top pins, and they share an edge:
        // A's side pins wrap out, down, and back in onto B's top pins (nested so nothing crosses)
        ['left', 'right'].forEach((s) => {
          const aligned = Math.abs(s === 'left' ? a.left - b.left : a.right - b.right) < 40;
          if (!aligned || !A.pins[s] || A.pins.bottom || !B.pins.top) return;
          const dir = s === 'left' ? -1 : 1;
          const ups = A.pins[s].filter((p) => !p.used).reverse(); // A's lowest pins first
          // B's top pins, the one farthest from this corner first
          const row = B.pins.top.filter((p) => !p.used);
          const tops = (s === 'right' ? row : [...row].reverse()).slice(0, 8);
          const n = Math.min(3, ups.length, tops.length);
          const edge = s === 'left' ? Math.min(a.left, b.left) : Math.max(a.right, b.right);
          const used = tops.slice(-n); // the n pins nearest the corner, farthest first
          link(
            zip(ups, used, n),
            (p, q) => {
              const k = ups.indexOf(p);
              const out = edge + dir * (22 + k * LOOP_GAP);
              const level = a.bottom + 14 + (k + 1) * ((gap - 28) / (n + 1)); // lower for each outer trace
              return [[p.x, p.y], [out, p.y], [out, level], [q.x, level], [q.x, q.y]];
            },
            A,
            B,
            bevel(),
          );
        });
      }
    }
  }

  // 3. A few free pins run out into open space and end in a via (never into another chip)
  const freeRun = (p, side) => {
    let run = side === 'left' ? p.x - 16 : side === 'right' ? box.width - 16 - p.x : side === 'top' ? p.y - 16 : box.height - 16 - p.y;
    [...chips.map((c) => c.rect), ...headings].forEach((r) => {
      if (side === 'left' && r.right <= p.x && p.y > r.top - 14 && p.y < r.bottom + 14) run = Math.min(run, p.x - r.right - 20);
      if (side === 'right' && r.left >= p.x && p.y > r.top - 14 && p.y < r.bottom + 14) run = Math.min(run, r.left - p.x - 20);
      if (side === 'top' && r.bottom <= p.y && p.x > r.left - 14 && p.x < r.right + 14) run = Math.min(run, p.y - r.bottom - 20);
      if (side === 'bottom' && r.top >= p.y && p.x > r.left - 14 && p.x < r.right + 14) run = Math.min(run, r.top - p.y - 20);
    });
    return run;
  };
  chips.forEach((c) => {
    const r = c.rect;
    // Side pins: straight stubs, or stubs that jog 45° away from the chip's middle
    ['left', 'right'].forEach((side) => {
      const free = (c.pins[side] || []).filter((p) => !p.used);
      const dir = side === 'left' ? -1 : 1;
      const jog = rand() < 0.6 ? 6 + rand() * (c.pkg.pitch * c.scale - 12) : 0; // same jog for the whole side
      const w = width();
      free.forEach((p) => {
        if (rand() > STUB_SHARE) return;
        const run = freeRun(p, side);
        if (run < 24) return;
        const len = Math.min(run, 18 + rand() * 120);
        const x = p.x + dir * len;
        const up = p.y < r.top + r.height / 2 ? -1 : 1;
        const bendAt = Math.min(len - jog - 6, 10 + rand() * 20);
        const pts =
          jog && bendAt > 6
            ? [[p.x, p.y], [p.x + dir * bendAt, p.y], [p.x + dir * (bendAt + jog), p.y + up * jog], [x, p.y + up * jog]]
            : [[p.x, p.y], [x, p.y]];
        if (route(pts, w, c, null)) {
          p.used = true;
          const [vx, vy] = pts[pts.length - 1];
          vias.push({ x: vx, y: vy, r: viaSize(), on: shown(c) });
        }
      });
      // The outermost free pins can escape on a long 45° diagonal
      const left = free.filter((p) => !p.used);
      [left[0], left[left.length - 1]].forEach((p, i) => {
        if (!p || rand() > 0.55) return;
        const up = i === 0 ? -1 : 1;
        const d = 30 + rand() * 80;
        const tail = 10 + rand() * 30;
        const pts = [[p.x, p.y], [p.x + dir * 12, p.y], [p.x + dir * (12 + d), p.y + up * d], [p.x + dir * (12 + d + tail), p.y + up * d]];
        if (route(pts, width(), c, null)) {
          p.used = true;
          vias.push({ x: pts[3][0], y: pts[3][1], r: viaSize(), on: shown(c) });
        }
      });
    });
    // Top / bottom pins: short stubs, with an occasional long diagonal from the end pins
    ['top', 'bottom'].forEach((side) => {
      const free = (c.pins[side] || []).filter((p) => !p.used);
      const dir = side === 'top' ? -1 : 1;
      const w = width();
      free.forEach((p) => {
        if (rand() > STUB_SHARE * 0.6) return;
        const run = freeRun(p, side);
        if (run < 24) return;
        const len = Math.min(run, 14 + rand() * 30);
        const pts = [[p.x, p.y], [p.x, p.y + dir * len]];
        if (route(pts, w, c, null)) {
          p.used = true;
          vias.push({ x: p.x, y: p.y + dir * len, r: viaSize(), on: shown(c) });
        }
      });
      const left = free.filter((p) => !p.used);
      [left[0], left[left.length - 1]].forEach((p, i) => {
        if (!p || rand() > 0.45) return;
        const out = i === 0 ? -1 : 1;
        const d = 24 + rand() * 60;
        const pts = [[p.x, p.y], [p.x, p.y + dir * 10], [p.x + out * d, p.y + dir * (10 + d)], [p.x + out * (d + 12 + rand() * 24), p.y + dir * (10 + d)]];
        if (route(pts, width(), c, null)) {
          p.used = true;
          vias.push({ x: pts[3][0], y: pts[3][1], r: viaSize(), on: shown(c) });
        }
      });
    });
  });

  return { width: box.width, height: box.height, wires, vias };
}

function PinWiring({ seed = 1 }) {
  const svgRef = useRef(null);
  const [geo, setGeo] = useState(null);

  // Measure now, then again whenever the page resizes or fonts finish loading
  useEffect(() => {
    const board = svgRef.current?.parentElement;
    if (!board) return undefined;
    const wide = window.matchMedia('(min-width: 900px)');
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setGeo(wide.matches ? measure(board, seed) : null));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(board);
    wide.addEventListener('change', update);
    document.fonts?.ready.then(update);

    // Cards fade/slide in as you scroll (useScrollReveal), so measure again once they've settled
    let timer = 0;
    const settle = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const moving = document
          .getAnimations()
          .filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity);
        Promise.all(moving.map((a) => a.finished.catch(() => {}))).then(update);
      }, 120);
    };
    // (ignore changes inside this drawing itself, or it would keep re-measuring)
    const changes = new MutationObserver((list) => {
      if (list.some((m) => !svgRef.current?.contains(m.target))) settle();
    });
    changes.observe(board, { attributes: true, attributeFilter: ['class', 'style'], subtree: true });
    settle();

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      observer.disconnect();
      changes.disconnect();
      wide.removeEventListener('change', update);
    };
  }, [seed]);

  return (
    <svg
      ref={svgRef}
      className="pin-wiring"
      width={geo?.width ?? 0}
      height={geo?.height ?? 0}
      viewBox={geo ? `0 0 ${geo.width} ${geo.height}` : undefined}
      aria-hidden="true"
      focusable="false"
    >
      {geo?.wires.map((w, i) => (
        <path
          key={`w-${i}`}
          d={w.d}
          pathLength="1"
          className={`pin-wire${w.on ? ' is-on' : ''}`}
          style={{ strokeWidth: w.w }}
        />
      ))}
      {geo?.vias.map((v, i) => (
        <circle key={`v-${i}`} cx={v.x} cy={v.y} r={v.r} className={`pin-via${v.on ? ' is-on' : ''}`} />
      ))}
    </svg>
  );
}

export default PinWiring;