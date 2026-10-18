import { useEffect, useRef, useState } from 'react';
import { tools } from '../data/work';
import { homeProjectIds } from '../data/projects';
import { projectsUsingTool } from '../data/toolLinks';
import { PowerSection, WirelessSection, GpioSection, IoRow } from './Boardsections.jsx';
import { fillDoodles } from './doodles';
import './Circuitry.css';

/* ===== Swap these later ===== */
const BUS_GAP = 40; // px between each bus and the toolkit row's outer edge
const CHAMFER = 12; // size of the 45° corner cuts

// The MCU's two bottom traces, in its 1200 x 560 drawing (pin tip → bottom edge)
const MCU_LEFT_TRACE = [
  [560, 392],
  [560, 470],
  [530, 500],
  [530, 560],
];
const MCU_RIGHT_TRACE = [
  [640, 392],
  [640, 470],
  [670, 500],
  [670, 560],
];

// Board sections: width in their own units, where the bus feed attaches, and the biggest scale allowed
const SECTION = {
  power: { w: 300, anchor: [-150, 30], max: 1.5 },
  wireless: { w: 300, anchor: [150, 0], max: 1.5 },
  gpio: { w: 540, anchor: [270, -15], max: 1.3 },
  io: { w: 170, max: 1.5 },
};

// User I/O rows beside the Contact box: [side, row, how far down the box (0 to 1)]
const IO_ROWS = [
  ['left', 'reset', 0.11],
  ['left', 'boot', 0.31],
  ['right', 'led', 0.11],
  ['right', 'buzzer', 0.86],
];

// Background doodles: random traces and parts that fill empty space and lead nowhere
const DOODLE = {
  seed: 7, // change to get a different random layout
  pad: 28, // empty space kept around every doodle area
  density: 0.85, // 1 = fill everything, lower = calmer (more empty spots)
};
/* ============================ */

const round = (n) => Math.round(n * 10) / 10;

// Turns corner points into a PCB-style path with 45° cut corners
function route(points, chamfer = CHAMFER) {
  let d = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = points[i];
    const next = points[i + 1];
    const [px, py] = points[i - 1];
    const inLen = Math.hypot(x - px, y - py);
    const outLen = next ? Math.hypot(next[0] - x, next[1] - y) : 0;
    if (!next || inLen === 0 || outLen === 0 || chamfer === 0) {
      d += ` L${round(x)} ${round(y)}`;
      continue;
    }
    const c = Math.min(chamfer, inLen / 2, outLen / 2);
    const ax = x - ((x - px) / inLen) * c;
    const ay = y - ((y - py) / inLen) * c;
    const bx = x + ((next[0] - x) / outLen) * c;
    const by = y + ((next[1] - y) / outLen) * c;
    d += ` L${round(ax)} ${round(ay)} L${round(bx)} ${round(by)}`;
  }
  return d;
}

// Reads where everything sits on the page and plans every wire and section
function measure(home) {
  const box = home.getBoundingClientRect();
  const toLocal = (r) => ({
    left: r.left - box.left,
    right: r.right - box.left,
    top: r.top - box.top,
    bottom: r.bottom - box.top,
    width: r.width,
    height: r.height,
  });
  const rect = (key) => {
    const el = home.querySelector(`[data-wire="${key}"]`);
    return el ? toLocal(el.getBoundingClientRect()) : null;
  };

  const mcu = rect('mcu');
  const grid = rect('projects-grid');
  const contactForm = rect('contact-form');
  const toolCards = tools.map((_, i) => rect(`tk-${i}`));
  const projectCards = homeProjectIds.map((id) => rect(id));
  if (!mcu || !grid || !contactForm || toolCards.includes(null) || projectCards.includes(null)) {
    return null;
  }

  // Bus positions: just outside the toolkit row
  const L = toolCards[0].left - BUS_GAP;
  const R = toolCards[toolCards.length - 1].right + BUS_GAP;
  if (L < 16 || R > box.width - 16) return null; // no room for buses

  // MCU drawing coordinates → page coordinates
  const onMcu = ([x, y]) => [mcu.left + (mcu.width * x) / 1200, mcu.top + (mcu.height * y) / 560];
  const leftStart = MCU_LEFT_TRACE.map(onMcu);
  const rightStart = MCU_RIGHT_TRACE.map(onMcu);

  const turnY = mcu.bottom + 32;
  // Both buses land on the contact box's sides, level with its middle
  const leftEndY = contactForm.top + contactForm.height / 2;
  const rightEndY = leftEndY;
  const leftEndX = contactForm.left;

  // Buses: MCU pin → gutter → down the page → into Contact
  const buses = {
    left: route([...leftStart, [leftStart[3][0], turnY], [L, turnY], [L, leftEndY], [leftEndX, leftEndY]]),
    right: route([
      ...rightStart,
      [rightStart[3][0], turnY],
      [R, turnY],
      [R, rightEndY],
      [contactForm.right, rightEndY],
    ]),
  };

  const branches = [];

  // Project cards: left column from the left bus, right column from the right bus
  projectCards.forEach((r, i) => {
    const y = r.top + r.height / 2;
    const left = i % 2 === 0;
    const points = left ? [[L, y], [r.left, y]] : [[R, y], [r.right, y]];
    branches.push({ id: homeProjectIds[i], side: left ? 'left' : 'right', d: route(points), end: points[1] });
  });

  // Toolkit cards: a thin trace from under each card back to its side's bus
  toolCards.forEach((r, i) => {
    const side = i < toolCards.length / 2 ? 'left' : 'right';
    const busX = side === 'left' ? L : R;
    const outer = i === 0 || i === toolCards.length - 1;
    const y = r.bottom + (outer ? 20 : 36); // outer cards run closer, so traces never cross
    const cx = r.left + r.width / 2;
    const points = [[busX, y], [cx, y], [cx, r.bottom]];
    branches.push({ id: `tk-${i}`, side, d: route(points), end: points[2] });
  });

  // Board sections: each scaled to fit its open space, fed by a thin trace from a bus
  const sections = [];
  const feeds = [];
  const fit = (w, min, max, cap) => Math.min(cap, (max - min) / w);
  const cx = box.width / 2;
  const toolBottom = Math.max(...toolCards.map((r) => r.bottom)) + 36;
  // POWER and WIRELESS sit level with the Projects title (but never up in the toolkit traces)
  const title = home.querySelector('.projects-heading');
  const titleY = title ? toLocal(title.getBoundingClientRect()) : null;
  const headingY = Math.max(
    titleY ? titleY.top + titleY.height / 2 : (toolBottom + grid.top) / 2,
    toolBottom + 120,
  );

  let powerBottom = headingY;
  let wirelessBottom = headingY;

  // POWER: left of the Projects heading; its 3V3 rail feeds the left bus
  {
    const min = L + 24;
    const max = cx - 140;
    const s = fit(SECTION.power.w, min, max, SECTION.power.max);
    if (s >= 0.7) {
      const x = min + (SECTION.power.w * s) / 2; // hug the bus side, away from the heading
      const [ax, ay] = SECTION.power.anchor;
      sections.push({ key: 'power', kind: 'power', side: 'left', x, y: headingY - ay * s, s });
      powerBottom = headingY + 20 * s;
      feeds.push({ side: 'left', d: route([[L, headingY], [x + ax * s, headingY]]) });
    }
  }

  // WIRELESS: right of the Projects heading; feeds the right bus
  {
    const min = cx + 140;
    const max = R - 24;
    const s = fit(SECTION.wireless.w, min, max, SECTION.wireless.max);
    if (s >= 0.7) {
      const x = max - (SECTION.wireless.w * s) / 2; // hug the bus side, away from the heading
      const [ax, ay] = SECTION.wireless.anchor;
      sections.push({ key: 'wireless', kind: 'wireless', side: 'right', x, y: headingY - ay * s, s });
      wirelessBottom = headingY + 62 * s;
      feeds.push({ side: 'right', d: route([[x + ax * s, headingY], [R, headingY]]) });
    }
  }

  // GPIO: centered between Projects and Contact, fed from both buses (lights only when BOTH are on)
  let gpio = null;
  {
    const s = fit(SECTION.gpio.w, L + 24, R - 24, SECTION.gpio.max);
    if (s >= 0.6) {
      const y = grid.bottom + (contactForm.top - grid.bottom) * 0.42; // nearer the cards than Contact
      const [ax, ay] = SECTION.gpio.anchor;
      sections.push({ key: 'gpio', kind: 'gpio', side: 'both', x: cx, y: y - ay * s, s });
      feeds.push({ side: 'both', d: route([[L, y], [cx - ax * s, y]]) });
      feeds.push({ side: 'both', d: route([[cx + ax * s, y], [R, y]]) });
      gpio = { y, half: ax * s };
    }
  }

  // USER I/O: rows of parts wired straight into the Contact box's sides
  const ioRows = {}; // where each row sits, top to bottom of its parts
  const ioWidth = { left: 0, right: 0 }; // how far the parts stick out on each side
  IO_ROWS.forEach(([side, kind, at]) => {
    const edge = side === 'left' ? contactForm.left : contactForm.right;
    const room = side === 'left' ? edge - L - 24 : R - 24 - edge;
    const s = fit(SECTION.io.w, 0, room, SECTION.io.max);
    if (s < 0.6) return;
    const y = contactForm.top + contactForm.height * at;
    sections.push({ key: `io-${kind}`, kind: 'io', row: kind, dir: side === 'left' ? 1 : -1, x: edge, y, s });
    ioRows[kind] = [y - 30 * s, y + 42 * s];
    ioWidth[side] = Math.max(ioWidth[side], SECTION.io.w * s);
  });

  // ===== Background doodles: fill every empty area below the hero =====
  const pad = DOODLE.pad;
  // Where the heading text actually sits (just the words, not the full-width boxes around them)
  const textBox = (elements) => {
    const parts = elements.map((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return toLocal(range.getBoundingClientRect());
    });
    if (!parts.length) return { left: cx - 340, right: cx + 340 }; // fallback: keep the middle clear
    return { left: Math.min(...parts.map((r) => r.left)), right: Math.max(...parts.map((r) => r.right)) };
  };
  const tkSection = home.querySelector('[data-wire="tk-0"]')?.closest('section');
  const tkText = textBox(tkSection ? [...tkSection.querySelectorAll('h2, p')] : []);
  const prText = textBox([...home.querySelectorAll('.projects-intro')]);
  const toolTop = Math.min(...toolCards.map((r) => r.top));
  const rowY = (col) => projectCards.filter((_, i) => i % 2 === col).map((r) => r.top + r.height / 2);
  // Splits a tall area at the wires that cross it
  const splitY = (x0, x1, y0, y1, cuts) => {
    const ys = [y0, ...cuts.filter((c) => c > y0 && c < y1).sort((a, b) => a - b), y1];
    return ys.slice(1).map((y, i) => [x0, i === 0 ? ys[0] : ys[i] + pad, x1, i === ys.length - 2 ? y : y - pad]);
  };
  // Which shapes suit each part of the page (see doodles.js)
  const KINDS = {
    toolkit: ['chip', 'stitch', 'elbow', 'passives'], // calm and tidy near the headings
    projects: ['chip', 'passives', 'diagonal', 'stitch', 'serpentine', 'elbow'],
    middle: ['jog', 'diagonal', 'elbow', 'chip', 'passives'],
    contact: ['stitch', 'chip', 'passives', 'diagonal', 'serpentine'],
  };
  const areas = [];
  const add = (kinds, ...boxes) => boxes.forEach((b) => areas.push({ box: b, kinds }));
  const addFull = (kinds, ...boxes) => boxes.forEach((b) => areas.push({ box: b, kinds, full: true }));

  // Toolkit: beside the heading, above the cards (one shape stretched across, no gaps)
  addFull(
    KINDS.toolkit,
    [L + pad, turnY + pad, tkText.left - pad, toolTop - pad],
    [tkText.right + pad, turnY + pad, R - pad, toolTop - pad],
  );
  // Toolkit: under a short outer card, between its trace and the taller neighbor's trace
  [
    [toolCards[0], toolCards[1], 'left'],
    [toolCards[toolCards.length - 1], toolCards[toolCards.length - 2], 'right'],
  ].forEach(([outer, inner, side]) => {
    const top = outer.bottom + 20 + pad;
    const bottom = inner.bottom + 36 - pad;
    addFull(['chip'], side === 'left' ? [L + pad, top, outer.right, bottom] : [outer.left, top, R - pad, bottom]);
  });
  // Projects: under POWER and WIRELESS, and beside the cards (split by the card wires)
  add(
    KINDS.projects,
    [L + pad, powerBottom + pad, prText.left - pad, grid.top - pad],
    [prText.right + pad, wirelessBottom + pad, R - pad, grid.top - pad],
    ...splitY(L + pad, grid.left - pad, grid.top, grid.bottom, rowY(0)),
    ...splitY(grid.right + pad, R - pad, grid.top, grid.bottom, rowY(1)),
  );
  // Between the cards and Contact, beside GPIO (split by the GPIO feeds)
  add(
    KINDS.middle,
    ...splitY(L + pad, gpio ? cx - gpio.half - pad : cx - pad, grid.bottom + pad, contactForm.top - pad, gpio ? [gpio.y] : []),
    ...splitY(gpio ? cx + gpio.half + pad : cx + pad, R - pad, grid.bottom + pad, contactForm.top - pad, gpio ? [gpio.y] : []),
  );
  // Around Contact: one long bus that wraps under the box (down the left, across, up the right)
  const wrap = { n: 3, inset: 40 }; // traces, and px between the box and the inner trace
  const wrapLeft = contactForm.left - wrap.inset; // inner lane on each side
  const wrapRight = contactForm.right + Math.max(ioWidth.right, 60) + 30;
  const wrapBottom = contactForm.bottom + 26;
  const wrapOuter = (wrap.n - 1) * 12;
  const wrapFits = wrapLeft - wrapOuter > L + pad + 20 && wrapRight + wrapOuter < R - pad - 20;
  const wrapPaths = [];
  const wrapVias = [];
  if (wrapFits) {
    for (let k = 0; k < wrap.n; k += 1) {
      const xl = wrapLeft - k * 12;
      const xr = wrapRight + k * 12;
      const yb = wrapBottom + k * 12;
      const yl = leftEndY + 70 + k * 16; // staggered starts below the left bus
      const yr = rightEndY + 70 + (wrap.n - 1 - k) * 16; // staggered ends below the right bus
      wrapPaths.push(route([[xl, yl], [xl, yb], [xr, yb], [xr, yr]], 30));
      wrapVias.push([xl, yl], [xr, yr]);
    }
  }
  const leftEdge = wrapFits ? wrapLeft - wrapOuter - pad : contactForm.left - pad;
  const rightEdge = wrapFits ? wrapRight + wrapOuter + pad : contactForm.right + 60;

  // Around Contact: beside and under the I/O parts (split by the bus), outside the wrap
  add(
    KINDS.contact,
    [L + pad, contactForm.top, contactForm.left - ioWidth.left - pad, leftEndY - pad],
    [contactForm.left - ioWidth.left, (ioRows.boot?.[1] ?? contactForm.top) + pad, contactForm.left - pad, leftEndY - pad],
    [L + pad, leftEndY + pad, leftEdge, contactForm.bottom + 60],
    [contactForm.right + ioWidth.right + pad, contactForm.top, R - pad, rightEndY - pad],
    [contactForm.right + 60, (ioRows.led?.[1] ?? contactForm.top) + pad, contactForm.right + ioWidth.right, rightEndY - pad],
    [rightEdge, rightEndY + pad, R - pad, contactForm.bottom + 60],
  );
  const decor = fillDoodles(areas, DOODLE.seed, DOODLE.density);
  decor.paths.push(...wrapPaths);
  decor.vias.push(...wrapVias);

  const vias = [
    [leftEndX, leftEndY],
    [contactForm.right, rightEndY],
  ];

  // Last stretch of each bus, for the one-time power-on pulse into Contact
  const arrive = [
    route([[L, Math.max(turnY, leftEndY - 700)], [L, leftEndY], [leftEndX, leftEndY]]),
    route([[R, Math.max(turnY, rightEndY - 700)], [R, rightEndY], [contactForm.right, rightEndY]]),
  ];

  return { width: box.width, height: box.height, buses, branches, sections, feeds, vias, arrive, decor };
}

// Draws one board section at its spot and scale; lit when its bus is lit
function Section({ section, litSides }) {
  const { kind, row, dir, x, y, s, side } = section;
  const lit = side === 'both' ? litSides.has('left') && litSides.has('right') : litSides.has(side);
  const classes = ['circuitry-part', lit && 'is-lit', kind === 'io' && 'is-io'].filter(Boolean).join(' ');
  return (
    <g className={classes} transform={`translate(${round(x)} ${round(y)}) scale(${round(s * 100) / 100})`}>
      {kind === 'power' && <PowerSection />}
      {kind === 'wireless' && <WirelessSection />}
      {kind === 'gpio' && <GpioSection />}
      {kind === 'io' && <IoRow kind={row} dir={dir} />}
    </g>
  );
}

function Circuitry({ activeTool }) {
  const svgRef = useRef(null);
  const [geo, setGeo] = useState(null);

  // Measure now, then again whenever the page resizes or fonts finish loading
  useEffect(() => {
    const home = svgRef.current?.parentElement;
    if (!home) return undefined;

    const wide = window.matchMedia('(min-width: 900px)');
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setGeo(wide.matches ? measure(home) : null));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(home);
    wide.addEventListener('change', update);
    document.fonts?.ready.then(update);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      wide.removeEventListener('change', update);
    };
  }, []);

  // Which wires light up for the active tool
  const lit = new Set();
  if (activeTool) {
    const group = tools.findIndex((g) => g.items.includes(activeTool));
    if (group >= 0) lit.add(`tk-${group}`);
    projectsUsingTool(activeTool).forEach((project) => lit.add(project.id));
  }
  const litSides = new Set((geo?.branches || []).filter((b) => lit.has(b.id)).map((b) => b.side));
  const bothLit = litSides.has('left') && litSides.has('right');

  const wires = geo
    ? [
        ...Object.entries(geo.buses).map(([side, d]) => ({ key: `bus-${side}`, d, on: litSides.has(side), bus: true })),
        ...geo.branches.map((b) => ({ key: b.id, d: b.d, on: lit.has(b.id), bus: false })),
        ...geo.feeds.map((f, i) => ({ key: `feed-${i}`, d: f.d, on: f.side === 'both' ? bothLit : litSides.has(f.side), bus: false })),
      ]
    : [];

  return (
    <svg
      ref={svgRef}
      className="circuitry"
      width={geo?.width ?? 0}
      height={geo?.height ?? 0}
      viewBox={geo ? `0 0 ${geo.width} ${geo.height}` : undefined}
      aria-hidden="true"
      focusable="false"
    >
      {/* Background doodles: random traces and parts filling the empty space, under everything */}
      {geo && (
        <g className="circuitry-doodles">
          {geo.decor.paths.map((d, i) => (
            <path key={`doodle-${i}`} d={d} className="circuitry-doodle" />
          ))}
          {geo.decor.bodies.map(([x, y, w, h], i) => (
            <rect key={`doodle-body-${i}`} x={x} y={y} width={w} height={h} rx="2" className="circuitry-doodle-body" />
          ))}
          {geo.decor.pads.map(([x, y, w, h], i) => (
            <rect key={`doodle-pad-${i}`} x={x} y={y} width={w} height={h} className="circuitry-doodle-pad" />
          ))}
          {geo.decor.vias.map(([x, y], i) => (
            <circle key={`doodle-via-${i}`} cx={x} cy={y} r="4" className="circuitry-doodle-via" />
          ))}
        </g>
      )}

      {/* Copper wires, then gold pulses on top of the lit ones */}
      {wires.map((w) => (
        <path key={w.key} d={w.d} className={`circuitry-wire${w.on ? ' is-lit' : ''}${w.bus ? ' is-bus' : ''}`} />
      ))}
      {wires
        .filter((w) => w.on)
        .map((w) => (
          <path key={`pulse-${w.key}`} d={w.d} className={`circuitry-pulse${w.bus ? ' is-bus' : ''}`} />
        ))}

      {/* One-time power-on pulse, started by Contact's .is-on class */}
      {(geo?.arrive || []).map((d) => (
        <path key={`arrive-${d}`} d={d} pathLength="100" className="circuitry-arrive" />
      ))}

      {/* Board sections: power, wireless, GPIO, user I/O */}
      {(geo?.sections || []).map((section) => (
        <Section key={section.key} section={section} litSides={litSides} />
      ))}

      {/* Vias where wires land */}
      {(geo?.branches || []).map((b) => (
        <circle
          key={`via-${b.id}`}
          cx={b.end[0]}
          cy={b.end[1]}
          r="5"
          className={`circuitry-via${lit.has(b.id) ? ' is-lit' : ''}`}
        />
      ))}
      {(geo?.vias || []).map(([x, y]) => (
        <circle key={`end-${x}-${y}`} cx={x} cy={y} r="5" className="circuitry-via" />
      ))}
    </svg>
  );
}

export default Circuitry;