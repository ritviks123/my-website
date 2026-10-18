import { useEffect, useRef, useState } from 'react';
import { tools } from '../data/work';
import { homeProjectIds } from '../data/projects';
import { projectsUsingTool } from '../data/toolLinks';
import { PowerSection, WirelessSection, GpioSection, IoRow } from './Boardsections.jsx';
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
  ['left', 'reset', 0.22],
  ['left', 'boot', 0.78],
  ['right', 'led', 0.16],
  ['right', 'buzzer', 0.84],
];
/* ============================ */

const round = (n) => Math.round(n * 10) / 10;

// Turns corner points into a PCB-style path with 45° cut corners
function route(points) {
  let d = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = points[i];
    const next = points[i + 1];
    const [px, py] = points[i - 1];
    const inLen = Math.hypot(x - px, y - py);
    const outLen = next ? Math.hypot(next[0] - x, next[1] - y) : 0;
    if (!next || inLen === 0 || outLen === 0) {
      d += ` L${round(x)} ${round(y)}`;
      continue;
    }
    const c = Math.min(CHAMFER, inLen / 2, outLen / 2);
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
  const rect = (key) => {
    const el = home.querySelector(`[data-wire="${key}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      left: r.left - box.left,
      right: r.right - box.left,
      top: r.top - box.top,
      bottom: r.bottom - box.top,
      width: r.width,
      height: r.height,
    };
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
  const headingY = (toolBottom + grid.top) / 2;

  // POWER: left of the Projects heading; its 3V3 rail feeds the left bus
  {
    const min = L + 24;
    const max = cx - 140;
    const s = fit(SECTION.power.w, min, max, SECTION.power.max);
    if (s >= 0.7) {
      const x = min + (SECTION.power.w * s) / 2; // hug the bus side, away from the heading
      const [ax, ay] = SECTION.power.anchor;
      sections.push({ key: 'power', kind: 'power', side: 'left', x, y: headingY - ay * s, s });
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
      feeds.push({ side: 'right', d: route([[x + ax * s, headingY], [R, headingY]]) });
    }
  }

  // GPIO: centered between Projects and Contact, fed from both buses
  {
    const s = fit(SECTION.gpio.w, L + 24, R - 24, SECTION.gpio.max);
    if (s >= 0.6) {
      const y = grid.bottom + (contactForm.top - grid.bottom) * 0.42; // nearer the cards than Contact
      const [ax, ay] = SECTION.gpio.anchor;
      sections.push({ key: 'gpio', kind: 'gpio', side: 'both', x: cx, y: y - ay * s, s });
      feeds.push({ side: 'left', d: route([[L, y], [cx - ax * s, y]]) });
      feeds.push({ side: 'right', d: route([[cx + ax * s, y], [R, y]]) });
    }
  }

  // USER I/O: rows of parts wired straight into the Contact box's sides
  IO_ROWS.forEach(([side, kind, at]) => {
    const edge = side === 'left' ? contactForm.left : contactForm.right;
    const room = side === 'left' ? edge - L - 24 : R - 24 - edge;
    const s = fit(SECTION.io.w, 0, room, SECTION.io.max);
    if (s < 0.6) return;
    const y = contactForm.top + contactForm.height * at;
    sections.push({ key: `io-${kind}`, kind: 'io', row: kind, dir: side === 'left' ? 1 : -1, x: edge, y, s });
  });

  const vias = [
    [leftEndX, leftEndY],
    [contactForm.right, rightEndY],
  ];

  // Last stretch of each bus, for the one-time power-on pulse into Contact
  const arrive = [
    route([[L, Math.max(turnY, leftEndY - 700)], [L, leftEndY], [leftEndX, leftEndY]]),
    route([[R, Math.max(turnY, rightEndY - 700)], [R, rightEndY], [contactForm.right, rightEndY]]),
  ];

  return { width: box.width, height: box.height, buses, branches, sections, feeds, vias, arrive };
}

// Draws one board section at its spot and scale; lit when its bus is lit
function Section({ section, litSides }) {
  const { kind, row, dir, x, y, s, side } = section;
  const lit = side === 'both' ? litSides.size > 0 : litSides.has(side);
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

  const wires = geo
    ? [
        ...Object.entries(geo.buses).map(([side, d]) => ({ key: `bus-${side}`, d, on: litSides.has(side), bus: true })),
        ...geo.branches.map((b) => ({ key: b.id, d: b.d, on: lit.has(b.id), bus: false })),
        ...geo.feeds.map((f, i) => ({ key: `feed-${i}`, d: f.d, on: litSides.has(f.side), bus: false })),
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