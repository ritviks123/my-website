import { useEffect, useRef, useState } from 'react';
import { sideBoard } from './sideBoard';
import './Circuitry.css';

/* ===== Swap these later ===== */
const SEED = 5; // change to reroll both sides
/* ============================ */

/*
  A strip of believable PCB in each side gutter of the article page (see sideBoard.js).
  Each side is one connected circuit tied into its own main rail; the sides never touch
  each other or the article.
*/
function measure(board) {
  const box = board.getBoundingClientRect();
  const content = board.querySelector('.project-container');
  if (!content) return null;
  const c = content.getBoundingClientRect();
  const top = 40;
  const bottom = box.height - 40;
  const left = sideBoard({ side: 'left', edge: 0, width: c.left - box.left, top, bottom, seed: SEED });
  const right = sideBoard({ side: 'right', edge: box.width, width: box.right - c.right, top, bottom, seed: SEED + 17 });
  const both = (key) => [...left[key], ...right[key]];
  return {
    width: box.width,
    height: box.height,
    top: both('top'),
    back: both('back'),
    vias: both('vias'),
    pads: both('pads'),
    bodies: both('bodies'),
    parts: both('parts'),
    joints: both('joints'),
    rails: [left.rail, right.rail].filter(Boolean),
  };
}

function ArticleCircuitry() {
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
          {/* Bottom layer first (dashed), so top-layer traces cross over it */}
          {geo.back.map((d, i) => (
            <path key={`back-${i}`} d={d} className="circuitry-doodle is-back" />
          ))}
          {geo.top.map((d, i) => (
            <path key={`top-${i}`} d={d} className="circuitry-doodle" />
          ))}
          {geo.rails.map((d, i) => (
            <path key={`rail-${i}`} d={d} className="circuitry-wire" />
          ))}
          {geo.bodies.map(([x, y, w, h], i) => (
            <rect key={`body-${i}`} x={x} y={y} width={w} height={h} rx="3" className="circuitry-doodle-body" />
          ))}
          {geo.parts.map(([x, y, w, h], i) => (
            <rect key={`part-${i}`} x={x} y={y} width={w} height={h} rx="1.5" className="circuitry-doodle-part" />
          ))}
          {geo.pads.map(([x, y], i) => (
            <circle key={`pad-${i}`} cx={x} cy={y} r="5" className="circuitry-doodle-via" />
          ))}
          {geo.vias.map(([x, y], i) => (
            <circle key={`via-${i}`} cx={x} cy={y} r="4" className="circuitry-doodle-via" />
          ))}
          {geo.joints.map(([x, y], i) => (
            <circle key={`joint-${i}`} cx={x} cy={y} r="3.5" className="circuitry-joint" />
          ))}
        </g>
      )}
    </svg>
  );
}

export default ArticleCircuitry;