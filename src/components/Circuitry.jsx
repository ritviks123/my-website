import { useEffect, useRef, useState } from 'react';
import { tools } from '../data/work';
import { homeProjectIds } from '../data/projects';
import { projectsUsingTool } from '../data/toolLinks';
import './Circuitry.css';

/* ===== Swap these later ===== */
const BUS_GAP = 40; // px between each bus and the toolkit row's outer edge
const CHAMFER = 12; // size of the 45° corner cuts

// The MCU's two bottom traces, in its 1200 x 560 drawing (pin tip → bottom edge)
const MCU_LEFT_TRACE = [[560, 392], [560, 470], [530, 500], [530, 560]];
const MCU_RIGHT_TRACE = [[640, 392], [640, 470], [670, 500], [670, 560]];

// Parts in the gaps beside the projects grid and contact: [side, area, how far down (0 to 1), part]
const SLOTS = [
  ['left', 'row1', 0.22, 'heatsink'],
  ['left', 'row1', 0.8, 'button'],
  ['left', 'row2', 0.22, 'usb'],
  ['left', 'row2', 0.78, 'ecap'],
  ['right', 'row1', 0.24, 'northbridge'],
  ['right', 'row1', 0.8, 'crystal'],
  ['right', 'row2', 0.2, 'buzzer'],
  ['right', 'row2', 0.78, 'dram'],
  ['left', 'contact', 0.15, 'led'],
  ['right', 'contact', 0.88, 'res'],
];
/* ============================ */

// Width of each part, so it only appears where its gap has room
const PART_W = {
  heatsink: 84,
  northbridge: 72,
  usb: 52,
  button: 34,
  ecap: 32,
  buzzer: 40,
  crystal: 52,
  dram: 124,
  led: 22,
  res: 32,
};
const FIN_X = [-32, -24, -16, -8, 0, 8, 16, 24, 32];
const NB_PINS = [-24, -16, -8, 0, 8, 16, 24];

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

// Reads where everything sits on the page and plans every wire and part
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
  const contactInfo = rect('contact-info');
  const contactForm = rect('contact-form');
  const toolCards = tools.map((_, i) => rect(`tk-${i}`));
  const projectCards = homeProjectIds.map((id) => rect(id));
  if (!mcu || !grid || !contactInfo || !contactForm || toolCards.includes(null) || projectCards.includes(null)) {
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
  const leftEndY = contactInfo.top + contactInfo.height / 2;
  const rightEndY = contactForm.top + contactForm.height / 2;
  const leftEndX = contactInfo.left - 24;

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

  // Parts: centered in the gap between a bus and the content, fed by a thin trace
  const contactTop = Math.min(contactInfo.top, contactForm.top);
  const areas = {
    row1: projectCards[0],
    row2: projectCards[2] || projectCards[0],
    contact: { top: contactTop, height: Math.max(contactInfo.bottom, contactForm.bottom) - contactTop },
  };
  const edges = {
    left: { busX: L, grid: grid.left, contact: leftEndX },
    right: { busX: R, grid: grid.right, contact: contactForm.right },
  };

  const parts = [];
  SLOTS.forEach(([side, area, frac, part]) => {
    const { busX } = edges[side];
    const edge = area === 'contact' ? edges[side].contact : edges[side].grid;
    const w = PART_W[part];
    if (Math.abs(edge - busX) < w + 40) return; // gap too narrow on this screen

    const x = (busX + edge) / 2;
    const y = areas[area].top + areas[area].height * frac;
    const near = side === 'left' ? x - w / 2 : x + w / 2;
    parts.push({ key: `${side}-${area}-${part}`, part, x, y, d: route([[busX, y], [near, y]]) });
  });

  const vias = [
    [leftEndX, leftEndY],
    [contactForm.right, rightEndY],
  ];

  return { width: box.width, height: box.height, buses, branches, parts, vias };
}

// Top-view footprints, each centered on (x, y)
function Part({ part, x, y }) {
  return (
    <g className={`circuitry-part is-${part}`} transform={`translate(${round(x)} ${round(y)})`}>
      {part === 'heatsink' && (
        <>
          <rect x="-42" y="-32" width="84" height="64" rx="4" className="circuitry-body" />
          {FIN_X.map((fx) => (
            <line key={fx} x1={fx} y1="-25" x2={fx} y2="25" className="circuitry-fin" />
          ))}
          <circle cx="-36" cy="-26" r="2.5" className="circuitry-pad" />
          <circle cx="36" cy="26" r="2.5" className="circuitry-pad" />
        </>
      )}
      {part === 'northbridge' && (
        <>
          {NB_PINS.map((p) => (
            <g key={p}>
              <rect x={p - 1.5} y="-36" width="3" height="5" className="circuitry-pad" />
              <rect x={p - 1.5} y="31" width="3" height="5" className="circuitry-pad" />
              <rect x="-36" y={p - 1.5} width="5" height="3" className="circuitry-pad" />
              <rect x="31" y={p - 1.5} width="5" height="3" className="circuitry-pad" />
            </g>
          ))}
          <rect x="-30" y="-30" width="60" height="60" rx="4" className="circuitry-body" />
          <rect x="-17" y="-17" width="34" height="34" rx="2" className="circuitry-die" />
          <circle cx="-24" cy="-24" r="2" className="circuitry-pad" />
        </>
      )}
      {part === 'usb' && (
        <>
          <rect x="-26" y="-12" width="5" height="6" rx="1" className="circuitry-pad" />
          <rect x="21" y="-12" width="5" height="6" rx="1" className="circuitry-pad" />
          <rect x="-22" y="-9" width="44" height="18" rx="9" className="circuitry-metal" />
          <rect x="-13" y="-3.5" width="26" height="7" rx="3.5" className="circuitry-dark" />
        </>
      )}
      {part === 'button' && (
        <>
          <rect x="-17" y="-11" width="5" height="6" className="circuitry-pad" />
          <rect x="12" y="-11" width="5" height="6" className="circuitry-pad" />
          <rect x="-17" y="5" width="5" height="6" className="circuitry-pad" />
          <rect x="12" y="5" width="5" height="6" className="circuitry-pad" />
          <rect x="-13" y="-13" width="26" height="26" rx="3" className="circuitry-metal" />
          <circle r="8" className="circuitry-dark circuitry-edge" />
        </>
      )}
      {part === 'ecap' && (
        <>
          <circle r="16" className="circuitry-metal" />
          <path d="M0 -16A16 16 0 0 0 0 16A9 16 0 0 1 0 -16Z" className="circuitry-dark" />
          <path d="M-6 0H6M0 -6V6" className="circuitry-vent" />
        </>
      )}
      {part === 'buzzer' && (
        <>
          <circle r="20" className="circuitry-body" />
          <circle r="12" className="circuitry-groove" />
          <circle r="3" className="circuitry-hole" />
        </>
      )}
      {part === 'crystal' && (
        <>
          <rect x="-26" y="-2" width="4" height="4" className="circuitry-pad" />
          <rect x="22" y="-2" width="4" height="4" className="circuitry-pad" />
          <rect x="-22" y="-8" width="44" height="16" rx="8" className="circuitry-metal" />
        </>
      )}
      {part === 'dram' && (
        <>
          <rect x="-62" y="-13" width="7" height="26" rx="1.5" className="circuitry-metal" />
          <rect x="55" y="-13" width="7" height="26" rx="1.5" className="circuitry-metal" />
          <rect x="-55" y="-9" width="110" height="18" rx="2" className="circuitry-body" />
          <rect x="-48" y="-2.5" width="96" height="5" rx="1" className="circuitry-die" />
          <rect x="-6" y="-9" width="3" height="18" className="circuitry-hole" />
        </>
      )}
      {part === 'led' && (
        <>
          <rect x="-11" y="-6" width="22" height="12" rx="2" className="circuitry-body" />
          <rect x="-6" y="-3.5" width="12" height="7" rx="1.5" className="circuitry-lens" />
        </>
      )}
      {part === 'res' && (
        <>
          <path d="M-16 0h4M12 0h4" className="circuitry-lead" />
          <rect x="-12" y="-5" width="24" height="10" rx="2" className="circuitry-body" />
        </>
      )}
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
      {/* Thin feed traces to the parts, underneath everything */}
      {(geo?.parts || []).map((p) => (
        <path key={`feed-${p.key}`} d={p.d} className="circuitry-decor" />
      ))}

      {/* Copper wires, then gold pulses on top of the lit ones */}
      {wires.map((w) => (
        <path key={w.key} d={w.d} className={`circuitry-wire${w.on ? ' is-lit' : ''}${w.bus ? ' is-bus' : ''}`} />
      ))}
      {wires
        .filter((w) => w.on)
        .map((w) => (
          <path key={`pulse-${w.key}`} d={w.d} className={`circuitry-pulse${w.bus ? ' is-bus' : ''}`} />
        ))}

      {(geo?.parts || []).map((p) => (
        <Part key={p.key} part={p.part} x={p.x} y={p.y} />
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