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

// Parts hanging off each bus: [how far down the bus (0 to 1), part, px out into the gutter]
const DECOR = []; // gutter parts get redone next step
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

// Reads where everything sits on the page and plans every wire
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
  const contactInfo = rect('contact-info');
  const contactForm = rect('contact-form');
  const toolCards = tools.map((_, i) => rect(`tk-${i}`));
  const projectCards = homeProjectIds.map((id) => rect(id));
  if (!mcu || !contactInfo || !contactForm || toolCards.includes(null) || projectCards.includes(null)) return null;

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

  // Decorative parts on short 45° stubs, out in the gutters (right side shifted for variety)
  const decor = [];
  [
    ['left', L, -1, leftEndY, 0],
    ['right', R, 1, rightEndY, 0.05],
  ].forEach(([side, busX, dir, endY, shift]) => {
    DECOR.forEach(([at, part, out], i) => {
      const y = turnY + (endY - turnY) * Math.min(0.95, at + shift);
      const jog = i % 2 === 0 ? -18 : 18;
      const x = busX + dir * out;
      if (x < 24 || x > box.width - 24) return; // no room on this screen
      decor.push({
        key: `${side}-${i}`,
        part,
        x,
        y: y + jog,
        d: route([[busX, y], [busX + dir * (out - 18), y], [x, y + jog]]),
      });
    });
  });

  const vias = [
    [leftEndX, leftEndY],
    [contactForm.right, rightEndY],
  ];

  return { width: box.width, height: box.height, buses, branches, decor, vias };
}

// Small footprints drawn at the end of each decorative stub
function Part({ part, x, y }) {
  return (
    <g className="circuitry-part" transform={`translate(${round(x)} ${round(y)})`}>
      {part === 'res' && (
        <>
          <path d="M-16 0h4M12 0h4" className="circuitry-lead" />
          <rect x="-12" y="-5" width="24" height="10" rx="2" className="circuitry-body" />
        </>
      )}
      {part === 'cap' && (
        <>
          <rect x="-8" y="-6" width="6" height="12" rx="1.5" className="circuitry-pad" />
          <rect x="2" y="-6" width="6" height="12" rx="1.5" className="circuitry-pad" />
        </>
      )}
      {part === 'tp' && (
        <>
          <circle r="6" className="circuitry-ring" />
          <circle r="2" className="circuitry-pad" />
        </>
      )}
      {part === 'chip' && (
        <>
          <path d="M-9 -14v4M-3 -14v4M3 -14v4M9 -14v4M-9 10v4M-3 10v4M3 10v4M9 10v4" className="circuitry-lead" />
          <rect x="-15" y="-10" width="30" height="20" rx="2" className="circuitry-body" />
          <circle cx="-10" cy="-5" r="1.5" className="circuitry-pad" />
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
      {/* Dim decorative stubs underneath everything */}
      {(geo?.decor || []).map((p) => (
        <path key={`stub-${p.key}`} d={p.d} className="circuitry-decor" />
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

      {/* Parts at the end of each stub */}
      {(geo?.decor || []).map((p) => (
        <Part key={`part-${p.key}`} part={p.part} x={p.x} y={p.y} />
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