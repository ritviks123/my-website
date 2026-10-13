import './HeroVisual.css';

// Each trace's signal travels from its first point to its last
const TRACES = [
  'M60 130 H220 L260 170 H316',
  'M60 370 H200 L240 330 H316',
  'M484 210 H560 L600 170 H740',
  'M484 250 H740',
  'M484 290 H540 L590 340 H740',
  'M370 140 V80 H520',
  'M430 360 V420 H620',
];

const VIAS = [
  [60, 130],
  [60, 370],
  [740, 170],
  [740, 250],
  [740, 340],
  [520, 80],
  [620, 420],
];

const PIN_ROWS = [166, 206, 246, 286, 326];
const PULSE_SPACING_S = 0.4; // offset between pulses so they don't move in sync

function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="hero-visual-board">
        <svg className="circuit" viewBox="0 0 800 500" focusable="false">
          <defs>
            <pattern id="circuit-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.5" className="circuit-dot" />
            </pattern>
          </defs>

          {/* Board + perfboard dots */}
          <rect width="800" height="500" className="circuit-bg" />
          <rect width="800" height="500" fill="url(#circuit-dots)" />

          {/* Dim traces, then bright pulses on top */}
          {TRACES.map((d) => (
            <path key={d} d={d} className="circuit-trace" />
          ))}
          {TRACES.map((d, index) => (
            <path
              key={`pulse-${d}`}
              d={d}
              pathLength="100"
              className="circuit-pulse"
              style={{ animationDelay: `-${index * PULSE_SPACING_S}s` }}
            />
          ))}

          {/* Resistors */}
          <rect x="110" y="120" width="44" height="20" rx="4" className="circuit-part" />
          <rect x="620" y="240" width="44" height="20" rx="4" className="circuit-part" />

          {/* Chip */}
          <rect x="330" y="140" width="140" height="220" rx="8" className="circuit-chip" />
          {PIN_ROWS.map((y) => (
            <rect key={`left-${y}`} x="316" y={y} width="14" height="8" className="circuit-pin" />
          ))}
          {PIN_ROWS.map((y) => (
            <rect key={`right-${y}`} x="470" y={y} width="14" height="8" className="circuit-pin" />
          ))}
          <circle cx="350" cy="160" r="5" className="circuit-mark" />
          <text x="400" y="257" textAnchor="middle" className="circuit-label">MCU</text>
          <circle cx="446" cy="336" r="6" className="circuit-led" />

          {/* Vias */}
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
      </div>
    </div>
  );
}

export default HeroVisual;