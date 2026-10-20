import { useEffect, useState } from 'react';
import './HeroVisual.css';

/* ===== Swap later ===== */
const FIRST = ['R', 'itvik']; // initial + the letters that unfold after it
const LAST = ['S', 'ingh'];
const INTRO =
  'IoT Developer focused on building connected hardware. Experienced in embedded systems, PCB design, and AWS cloud integration.';
const CHIP_LABEL = 'RS-01 · REV B';
/* ====================== */

const NAME = `${FIRST.join('')} ${LAST.join('')}`;

/* ===== Hero MCU: the "RS" chip widens and the initials unfold into the name + intro ===== */

// Traces on the small RS chip (only shown during the intro, then they fade out)
const SIDE_SMALL = [
  'M458 178 H400 L360 138 H120',
  'M458 226 H300 L270 196 H40',
  'M458 274 H340 L300 314 H60',
  'M458 322 H420 L380 362 V440 L340 480 H180',
  'M742 178 H800 L840 138 H1080',
  'M742 226 H900 L930 196 H1160',
  'M742 274 H860 L900 314 H1140',
  'M742 322 H780 L820 362 V440 L860 480 H1020',
];

// Traces on the wide chip: same vias, starting from the wider chip's side pins
const SIDE_WIDE = [
  'M258 178 H220 L180 138 H120',
  'M258 226 H130 L100 196 H40',
  'M258 274 H160 L120 314 H60',
  'M258 322 H240 L220 342 V440 L180 480',
  'M942 178 H980 L1020 138 H1080',
  'M942 226 H1070 L1100 196 H1160',
  'M942 274 H1040 L1080 314 H1140',
  'M942 322 H960 L980 342 V440 L1020 480',
];

// Top pins don't move when the chip widens, so these stay the same
// (the two bottom pins' traces are drawn by Circuitry, so they only light with the toolkit)
const TOP = ['M544 108 V70 L514 40 H260', 'M656 108 V60 L686 30 H980'];

// Vias where traces end
const VIAS = [
  [120, 138], [40, 196], [60, 314], [180, 480],
  [1080, 138], [1160, 196], [1140, 314], [1020, 480],
  [260, 40], [980, 30],
];

const PULSE_SPACING_S = 0.25; // offset so pulses don't fire in sync

// The intro plays the first time the site opens in this tab (refreshing won't replay it)
const SEEN_KEY = 'hero-intro-seen';
function firstVisitThisTab() {
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false;
    sessionStorage.setItem(SEEN_KEY, '1');
    return true;
  } catch {
    return true; // storage blocked (private mode): just play it
  }
}
let playIntro = typeof window !== 'undefined' && firstVisitThisTab();

function Traces({ paths, offset = 0 }) {
  return (
    <>
      {paths.map((d) => (
        <path key={d} d={d} pathLength="1" className="circuit-trace" />
      ))}
      <g className="circuit-pulses">
        {paths.map((d, index) => (
          <path
            key={d}
            d={d}
            pathLength="100"
            className="circuit-pulse"
            style={{ animationDelay: `-${(index + offset) * PULSE_SPACING_S}s` }}
          />
        ))}
      </g>
    </>
  );
}

function HeroVisual() {
  const [play] = useState(playIntro);
  useEffect(() => () => {
    playIntro = false; // leaving the homepage: don't replay when you come back
  }, []);

  return (
    <div className={`hero-visual${play ? ' is-intro' : ''}`}>
      <svg className="circuit" viewBox="0 0 1200 560" focusable="false" aria-hidden="true">
        {/* Small chip's traces: only during the intro */}
        {play && (
          <g className="circuit-small">
            <Traces paths={SIDE_SMALL} />
            <rect x="150" y="186" width="40" height="20" rx="4" className="circuit-part" />
            <rect x="1000" y="304" width="40" height="20" rx="4" className="circuit-part" />
            <circle cx="820" cy="400" r="7" className="circuit-led" />
          </g>
        )}

        {/* Wide chip's traces: draw out from the pins once the chip has widened */}
        <g className="circuit-wide">
          <Traces paths={SIDE_WIDE} />
          <g className="circuit-parts">
            <rect x="160" y="216" width="40" height="20" rx="4" className="circuit-part" />
            <rect x="1000" y="216" width="40" height="20" rx="4" className="circuit-part" />
            <circle cx="980" cy="400" r="7" className="circuit-led" />
          </g>
        </g>

        <Traces paths={TOP} offset={8} />

        {VIAS.map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="7"
            className="circuit-via"
            style={{ animationDelay: `-${index * PULSE_SPACING_S}s` }}
          />
        ))}
      </svg>

      {/* The chip itself: pins, gold ring, pin-1 dot, and your name printed on it */}
      <div className="hero-chip">
        <span className="hero-chip-ring" aria-hidden="true" />

        {/* Part number under the "RS" it starts with (fades away as the name unfolds) */}
        <span className="hero-chip-label" aria-hidden="true">
          {CHIP_LABEL}
        </span>

        <div className="hero-chip-text">
          <h1 className="hero-chip-name">
            <span className="hero-sr">{NAME}</span>
            <span aria-hidden="true">
              {FIRST[0]}
              <span className="hero-unfold">
                <span>{FIRST[1]}{'\u00A0'}</span>
              </span>
              {LAST[0]}
              <span className="hero-unfold">
                <span>{LAST[1]}</span>
              </span>
            </span>
          </h1>
          <div className="hero-chip-more">
            <p className="hero-chip-intro">{INTRO}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroVisual;