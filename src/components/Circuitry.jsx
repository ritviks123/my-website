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

// Accent parts around the page: [zone, part, how far down the zone (0 to 1), size]
const ACCENTS = [
  ['headingLeft', 'heatsink', 0.5, 1.3],
  ['headingRight', 'northbridge', 0.5, 1.2],
  ['bridge', 'dramPair', 0.5, 1],
  ['contactLeft', 'led', 0.18, 1.2],
  ['contactLeft', 'button', 0.72, 1.3],
  ['contactRight', 'buzzer', 0.24, 1.4],
  ['contactRight', 'ecap', 0.74, 1.3],
  ['contactRight', 'crystal', 0.9, 1],
];

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
  dramPair: 264,
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
  // Both buses land on the contact box's sides, level with its LED row
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

    // Accent parts: placed in open zones, each fed by a thin trace from a bus
  const cx = box.width / 2;
  const toolBottom = Math.max(...toolCards.map((r) => r.bottom)) + 36;
  const headingY = (toolBottom + grid.top) / 2;
  const zones = {
    headingLeft: () => ({ x: cx - (cx - L) * 0.62, y: headingY, from: [L], min: L + 16, max: cx - 110 }),
    headingRight: () => ({ x: cx + (R - cx) * 0.62, y: headingY, from: [R], min: cx + 110, max: R - 16 }),
    bridge: () => ({ x: cx, y: (grid.bottom + contactForm.top) / 2, from: [L, R], min: L + 16, max: R - 16 }),
    contactLeft: (at) => ({
      x: (L + contactForm.left) / 2,
      y: contactForm.top + contactForm.height * at,
      from: [L],
      min: L + 16,
      max: contactForm.left - 12,
    }),
    contactRight: (at) => ({
      x: (contactForm.right + R) / 2,
      y: contactForm.top + contactForm.height * at,
      from: [R],
      min: contactForm.right + 12,
      max: R - 16,
    }),
  };

  const parts = [];
  ACCENTS.forEach(([zone, part, at, scale]) => {
    const { x, y, from, min, max } = zones[zone](at);
    const half = (PART_W[part] * scale) / 2;
    if (x - half < min || x + half > max) return; // doesn't fit on this screen
    const feeds = from.map((busX) => route([[busX, y], [busX < x ? x - half : x + half, y]]));
    parts.push({ key: `${zone}-${part}-${at}`, part, x, y, scale, feeds });
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

  return { width: box.width, height: box.height, buses, branches, parts, vias, arrive };
}

// Top-view footprints, each centered on (x, y)
function Part({ part, x, y, scale = 1 }) {
  return (
    <g className={`circuitry-part is-${part}`} transform={`translate(${round(x)} ${round(y)}) scale(${scale})`}>
      {part === 'dramPair' &&
        [-16, 16].map((dy) => (
          <g key={dy} transform={`translate(0 ${dy})`}>
            <rect x="-132" y="-11" width="8" height="22" rx="1.5" className="circuitry-metal" />
            <rect x="124" y="-11" width="8" height="22" rx="1.5" className="circuitry-metal" />
            <rect x="-124" y="-8" width="248" height="16" rx="2" className="circuitry-body" />
            <rect x="-116" y="-2" width="232" height="4" rx="1" className="circuitry-die" />
            <rect x="-30" y="-8" width="3" height="16" className="circuitry-hole" />
          </g>
        ))}
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
      {(geo?.parts || []).flatMap((p) =>
        p.feeds.map((d, i) => <path key={`feed-${p.key}-${i}`} d={d} className="circuitry-decor" />)
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

      {(geo?.parts || []).map((p) => (
        <Part key={p.key} part={p.part} x={p.x} y={p.y} scale={p.scale} />
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