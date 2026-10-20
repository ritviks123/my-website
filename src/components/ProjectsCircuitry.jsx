import { useEffect, useRef, useState } from 'react';
import { fillDoodles, route } from './doodles';
import './Circuitry.css';

/* ===== Swap these later ===== */
const BUS_GAP = 90; // px between each bus and the cards
const DOODLE = { seed: 3, pad: 28, density: 0.85 };
const KINDS = ['qfp', 'dip', 'jog', 'elbow', 'diagonal', 'chip']; // busy shapes for the wide gutters
/* ============================ */

// Reads where the cards sit and plans the buses, branches, and doodles
function measure(board) {
  const box = board.getBoundingClientRect();
  const local = (r) => ({
    left: r.left - box.left,
    right: r.right - box.left,
    top: r.top - box.top,
    bottom: r.bottom - box.top,
  });
  const cards = [...board.querySelectorAll('[data-wire]')].map((el) => ({
    id: el.dataset.wire,
    ...local(el.getBoundingClientRect()),
  }));
  if (!cards.length) return null;

  const left = Math.min(...cards.map((c) => c.left));
  const right = Math.max(...cards.map((c) => c.right));
  const L = left - BUS_GAP;
  const R = right + BUS_GAP;
  if (L < 40 || R > box.width - 40) return null; // no room for the buses

  const top = cards[0].top - 48;
  const bottom = cards[cards.length - 1].bottom + 48;

  // The buses start at the "Projects." title: a stub on each side of the word, then down the gutters
  const title = board.querySelector('.projects-page-heading');
  let words = null;
  if (title) {
    const range = document.createRange();
    range.selectNodeContents(title);
    words = local(range.getBoundingClientRect());
  }
  const titleY = words ? (words.top + words.bottom) / 2 : top;
  const stubL = words ? words.left - 28 : L;
  const stubR = words ? words.right + 28 : R;
  const buses = {
    left: route([[stubL, titleY], [L, titleY], [L, bottom]], 16),
    right: route([[stubR, titleY], [R, titleY], [R, bottom]], 16),
  };

  // One branch per card, alternating sides (matches the alternating layout)
  const branches = cards.map((c, i) => {
    const y = (c.top + c.bottom) / 2;
    const side = i % 2 === 0 ? 'left' : 'right';
    const end = side === 'left' ? [c.left, y] : [c.right, y];
    return { id: c.id, side, y, d: route([[side === 'left' ? L : R, y], end]), end };
  });

  // Doodles: beside the cards (split at each branch) and out past the buses
  const pad = DOODLE.pad;
  const cuts = (side) => branches.filter((b) => b.side === side).map((b) => b.y);
  const splitY = (x0, x1, y0, y1, ys) => {
    const all = [y0, ...ys.filter((y) => y > y0 && y < y1).sort((a, b) => a - b), y1];
    return all.slice(1).map((y, i) => [x0, i === 0 ? all[0] : all[i] + pad, x1, i === all.length - 2 ? y : y - pad]);
  };
  const areas = [
    // Between the buses and the cards (split at each branch)
    ...splitY(L + pad, left - pad, titleY + pad, bottom, cuts('left')),
    ...splitY(right + pad, R - pad, titleY + pad, bottom, cuts('right')),
    // Out past the buses: the whole height, busy like a real board
    [pad, pad, L - pad, box.height - pad],
    [R + pad, pad, box.width - pad, box.height - pad],
  ].map((b) => ({ box: b, kinds: KINDS, dense: true }));
  const decor = fillDoodles(areas, DOODLE.seed, DOODLE.density);

  const ends = [[L, bottom], [R, bottom]];
  const stubs = [[stubL, titleY], [stubR, titleY]];
  return { width: box.width, height: box.height, buses, branches, decor, ends, stubs };
}

function ProjectsCircuitry({ activeId }) {
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
      frame = requestAnimationFrame(() => setGeo(wide.matches ? measure(board) : null));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(board);
    wide.addEventListener('change', update);
    document.fonts?.ready.then(update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      wide.removeEventListener('change', update);
    };
  }, []);

  const activeSide = geo?.branches.find((b) => b.id === activeId)?.side;
  const wires = geo
    ? [
        ...Object.entries(geo.buses).map(([side, d]) => ({ key: `bus-${side}`, d, on: side === activeSide, bus: true })),
        ...geo.branches.map((b) => ({ key: b.id, d: b.d, on: b.id === activeId, bus: false })),
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
      {geo && (
        <g>
          {geo.decor.paths.map((d, i) => (
            <path key={`doodle-${i}`} d={d} className="circuitry-doodle" />
          ))}
          {geo.decor.bodies.map(([x, y, w, h], i) => (
            <rect key={`body-${i}`} x={x} y={y} width={w} height={h} rx="2" className="circuitry-doodle-body" />
          ))}
          {geo.decor.pads.map(([x, y, w, h], i) => (
            <rect key={`pad-${i}`} x={x} y={y} width={w} height={h} className="circuitry-doodle-pad" />
          ))}
          {geo.decor.vias.map(([x, y], i) => (
            <circle key={`dvia-${i}`} cx={x} cy={y} r="4" className="circuitry-doodle-via" />
          ))}
        </g>
      )}

      {/* Copper wires, then gold pulses on the lit ones */}
      {wires.map((w) => (
        <path key={w.key} d={w.d} className={`circuitry-wire${w.on ? ' is-lit' : ''}${w.bus ? ' is-bus' : ''}`} />
      ))}
      {wires
        .filter((w) => w.on)
        .map((w) => (
          <path key={`pulse-${w.key}`} d={w.d} className={`circuitry-pulse${w.bus ? ' is-bus' : ''}`} />
        ))}

      {/* Vias where branches land and where the buses end */}
      {(geo?.branches || []).map((b) => (
        <circle
          key={`via-${b.id}`}
          cx={b.end[0]}
          cy={b.end[1]}
          r="5"
          className={`circuitry-via${b.id === activeId ? ' is-lit' : ''}`}
        />
      ))}
      {(geo?.ends || []).map(([x, y]) => (
        <circle key={`end-${x}-${y}`} cx={x} cy={y} r="6" className="circuitry-via" />
      ))}
      {/* Where the buses meet the title: light up with any lit bus */}
      {(geo?.stubs || []).map(([x, y], i) => (
        <circle
          key={`stub-${x}-${y}`}
          cx={x}
          cy={y}
          r="6"
          className={`circuitry-via${activeSide === (i === 0 ? 'left' : 'right') ? ' is-lit' : ''}`}
        />
      ))}
    </svg>
  );
}

export default ProjectsCircuitry;