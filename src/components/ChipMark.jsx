import './ChipMark.css';

// Pin positions along each side (viewBox is 32 x 32)
const PINS = [10.75, 14.25, 17.75, 21.25];

// Flat top-view chip with "RS" on top. Logo now, hero MCU later.
function ChipMark({ size = 30, className = '' }) {
  return (
    <svg
      className={`chip-mark ${className}`.trim()}
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <g className="chip-pins">
        {PINS.map((p) => (
          <g key={p}>
            <line x1={p} y1="3" x2={p} y2="7" />
            <line x1={p} y1="25" x2={p} y2="29" />
            <line x1="3" y1={p} x2="7" y2={p} />
            <line x1="25" y1={p} x2="29" y2={p} />
          </g>
        ))}
      </g>
      <rect className="chip-body" x="7" y="7" width="18" height="18" rx="2.5" />
      <circle className="chip-dot" cx="10" cy="10" r="0.9" />
      <text className="chip-label" x="16" y="16" textAnchor="middle" dominantBaseline="central">
        RS
      </text>
    </svg>
  );
}

export default ChipMark;