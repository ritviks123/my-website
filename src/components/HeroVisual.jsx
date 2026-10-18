import './HeroVisual.css';

/* ===== Hero MCU: pulses leave its pins and travel outward ===== */

// Each trace starts at a pin tip and runs outward (pulses go start → end)
const TRACES = [
  'M458 178 H400 L360 138 H120',
  'M458 226 H300 L270 196 H40',
  'M458 274 H340 L300 314 H60',
  'M458 322 H420 L380 362 V440 L340 480 H180',
  'M742 178 H800 L840 138 H1080',
  'M742 226 H900 L930 196 H1160',
  'M742 274 H860 L900 314 H1140',
  'M742 322 H780 L820 362 V440 L860 480 H1020',
  'M544 108 V70 L514 40 H260',
  'M656 108 V60 L686 30 H980',
  // The two bottom pins' traces are drawn by Circuitry, so they only light with the toolkit
];

// Vias where traces end
const VIAS = [
  [120, 138], [40, 196], [60, 314], [180, 480],
  [1080, 138], [1160, 196], [1140, 314], [1020, 480],
  [260, 40], [980, 30],
];

// 12 pins per side, measured from the chip body's top-left corner
const PIN_STEPS = Array.from({ length: 12 }, (_, i) => 32 + i * 16);
const CHIP_X = 480;
const CHIP_Y = 130;
const PULSE_SPACING_S = 0.25; // offset so pulses don't fire in sync

// Your "RS" (same shapes as the logo)
const RS_STROKES =
  'M0 2H11.75A4.25 4.25 0 0 1 11.75 10.5H0M2 8.5V20' +
  'M38 2H27.88A3.88 3.88 0 0 0 27.88 9.75H33.88A4.13 4.13 0 0 1 33.88 18H22';
const RS_LEG = 'M11.2 12H15.2L18 20H14Z';

function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <svg className="circuit" viewBox="0 0 1200 560" focusable="false">
        {/* Dim copper traces, then bright pulses on top */}
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

        {/* Resistors + status LED sitting on traces */}
        <rect x="150" y="186" width="40" height="20" rx="4" className="circuit-part" />
        <rect x="1000" y="304" width="40" height="20" rx="4" className="circuit-part" />
        <circle cx="820" cy="400" r="7" className="circuit-led" />

        {/* Pins on all four sides */}
        {PIN_STEPS.map((s) => (
          <g key={s} className="circuit-pin">
            <rect x={CHIP_X + s - 4} y={CHIP_Y - 22} width="8" height="22" />
            <rect x={CHIP_X + s - 4} y={CHIP_Y + 240} width="8" height="22" />
            <rect x={CHIP_X - 22} y={CHIP_Y + s - 4} width="22" height="8" />
            <rect x={CHIP_X + 240} y={CHIP_Y + s - 4} width="22" height="8" />
          </g>
        ))}

        {/* Chip body, gold ring, pin-1 dot */}
        <rect x={CHIP_X} y={CHIP_Y} width="240" height="240" rx="18" className="circuit-chip" />
        <rect x="505" y="155" width="190" height="190" rx="12" className="circuit-ring" />
        <circle cx="494" cy="144" r="4" className="circuit-mark" />

        {/* Markings */}
        <g transform="translate(540 205) scale(3)" className="circuit-rs">
          <path d={RS_STROKES} />
          <path d={RS_LEG} className="circuit-rs-leg" />
        </g>
        <text x="600" y="306" textAnchor="middle" className="circuit-label">
          RS-01 · REV B
        </text>

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
  );
}

export default HeroVisual;