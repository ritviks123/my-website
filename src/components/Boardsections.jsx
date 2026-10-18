import './BoardSections.css';

/* ===== Board sections: small groups of real parts, wired to each other ===== */
// Each is drawn around (0, 0) in its own units; Circuitry places and scales them on the page.

const r1 = (n) => Math.round(n * 10) / 10;

// Short local trace with 45° corners (same look as the buses, thinner)
function trace(points) {
  let d = `M${r1(points[0][0])} ${r1(points[0][1])}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = points[i];
    const next = points[i + 1];
    const [px, py] = points[i - 1];
    const inLen = Math.hypot(x - px, y - py);
    const outLen = next ? Math.hypot(next[0] - x, next[1] - y) : 0;
    if (!next || inLen === 0 || outLen === 0) {
      d += ` L${r1(x)} ${r1(y)}`;
      continue;
    }
    const c = Math.min(6, inLen / 2, outLen / 2);
    d += ` L${r1(x - ((x - px) / inLen) * c)} ${r1(y - ((y - py) / inLen) * c)}`;
    d += ` L${r1(x + ((next[0] - x) / outLen) * c)} ${r1(y + ((next[1] - y) / outLen) * c)}`;
  }
  return d;
}

/* ----- tiny building blocks ----- */
function Label({ x, y, children, anchor = 'middle' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className="board-label">
      {children}
    </text>
  );
}

// 0805 resistor or cap: two pads + body (horizontal unless vertical)
function Chip0805({ x, y, vertical = false, cap = false }) {
  const body = cap ? 'board-cap' : 'board-res';
  return vertical ? (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-4" y="-10" width="8" height="6" rx="1" className="board-pad" />
      <rect x="-4" y="4" width="8" height="6" rx="1" className="board-pad" />
      <rect x="-3" y="-5" width="6" height="10" rx="1" className={body} />
    </g>
  ) : (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-10" y="-4" width="6" height="8" rx="1" className="board-pad" />
      <rect x="4" y="-4" width="6" height="8" rx="1" className="board-pad" />
      <rect x="-5" y="-3" width="10" height="6" rx="1" className={body} />
    </g>
  );
}

function Via({ x, y }) {
  return <circle cx={x} cy={y} r="3" className="board-via" />;
}

/* ----- POWER: USB-C in → LDO regulator → caps → 3V3 out (feed on the left) ----- */
export function PowerSection() {
  return (
    <g>
      {/* 5V from USB to the LDO input pin, 3V3 rail out to the bus */}
      <path
        d={trace([
          [108, 0],
          [80, 0],
          [80, 40],
          [52, 40],
          [52, 24],
        ])}
        className="board-trace"
      />
      <path
        d={trace([
          [28, 24],
          [28, 30],
          [-150, 30],
        ])}
        className="board-trace"
      />
      {/* Cap legs down to the rail */}
      {[-14, -46].map((x) => (
        <path key={x} d={`M${x} 18V30M${x} -2V-7`} className="board-trace" />
      ))}
      <path d="M-96 12V30" className="board-trace" />

      {/* J1: USB-C, standing on its side */}
      <rect x="104" y="-30" width="6" height="8" rx="1" className="board-pad" />
      <rect x="104" y="22" width="6" height="8" rx="1" className="board-pad" />
      <rect x="108" y="-24" width="26" height="48" rx="11" className="board-metal" />
      <rect x="117" y="-15" width="8" height="30" rx="4" className="board-dark" />
      <Label x={121} y={42}>
        J1
      </Label>

      {/* U2: SOT-223 LDO (big tab on top, 3 legs below) */}
      <rect x="22" y="-30" width="36" height="12" rx="1" className="board-pad" />
      {[28, 40, 52].map((x) => (
        <rect key={x} x={x - 2.5} y="12" width="5" height="12" rx="1" className="board-pad" />
      ))}
      <rect x="18" y="-16" width="44" height="28" rx="2" className="board-body" />
      <Label x={40} y={2}>
        U2
      </Label>
      <Label x={40} y={-36}>
        LDO 3V3
      </Label>

      {/* C1, C2: ceramic decoupling, grounded through vias */}
      <Chip0805 x={-14} y={8} vertical cap />
      <Chip0805 x={-46} y={8} vertical cap />
      <Via x={-14} y={-10} />
      <Via x={-46} y={-10} />
      <Label x={-14} y={-18}>
        C1
      </Label>
      <Label x={-46} y={-18}>
        C2
      </Label>

      {/* C3: bulk electrolytic */}
      <circle cx="-96" cy="-6" r="17" className="board-metal" />
      <path d="M-96 -23A17 17 0 0 0 -96 11A9 17 0 0 1 -96 -23Z" className="board-dark" />
      <path d="M-102 -6H-90M-96 -12V0" className="board-vent" />
      <Label x={-96} y={-30}>
        C3
      </Label>

      <Label x={-132} y={24} anchor="start">
        3V3
      </Label>
      {/* Silkscreen box around the section */}
      <rect x="-122" y="-50" width="264" height="100" rx="6" className="board-silk" />
      <Label x={-118} y={-56} anchor="start">
        POWER
      </Label>
    </g>
  );
}

/* ----- WIRELESS: Wi-Fi module under a shield can + meander antenna (feed on the right) ----- */
const CAN_PADS = [-30, -18, -6, 6, 18, 30];

export function WirelessSection() {
  return (
    <g>
      {/* UART out to the bus, RF out to the antenna through a matching network */}
      <path
        d={trace([
          [100, 0],
          [150, 0],
        ])}
        className="board-trace"
      />
      <path
        d={trace([
          [10, 26],
          [-20, 26],
        ])}
        className="board-trace"
      />
      <path
        d={trace([
          [-36, 26],
          [-56, 26],
        ])}
        className="board-trace"
      />
      <path
        d={trace([
          [-72, 26],
          [-100, 26],
          [-100, 8],
        ])}
        className="board-trace"
      />
      <Chip0805 x={-28} y={26} />
      <Chip0805 x={-64} y={26} cap />
      <Label x={-28} y={42}>
        L1
      </Label>
      <Label x={-64} y={42}>
        C4
      </Label>

      {/* ANT1: meandered PCB antenna inside a keep-out zone */}
      <rect x="-128" y="-44" width="104" height="44" rx="2" className="board-silk board-keepout" />
      <path d="M-100 8V-34H-88V-12H-76V-34H-64V-12H-52V-34H-40V-12H-30" className="board-antenna" />
      <Label x={-76} y={-50}>
        ANT1
      </Label>

      {/* U3: module with castellated pads and a shield can */}
      {CAN_PADS.map((y) => (
        <g key={y}>
          <rect x="6" y={y - 2} width="8" height="4" className="board-pad" />
          <rect x="96" y={y - 2} width="8" height="4" className="board-pad" />
        </g>
      ))}
      <rect x="10" y="-40" width="90" height="80" rx="4" className="board-metal" />
      {[
        [30, -24],
        [80, -24],
        [30, 24],
        [80, 24],
        [55, 0],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" className="board-dimple" />
      ))}
      <text x="55" y="-6" textAnchor="middle" className="board-etch">
        WIFI
      </text>
      <text x="55" y="8" textAnchor="middle" className="board-etch">
        2.4G
      </text>
      <Label x={55} y={54}>
        U3
      </Label>

      <rect x="-134" y="-62" width="250" height="124" rx="6" className="board-silk" />
      <Label x={112} y={-68} anchor="end">
        WIRELESS
      </Label>
    </g>
  );
}

/* ----- GPIO: 2×20 header + SPI flash fanning out to it (feeds on both sides) ----- */
const HEADER_X = Array.from({ length: 20 }, (_, i) => -209 + i * 22);
const FLASH = [-88, 50];
const FLASH_PINS = [-15, -5, 5, 15];
// Each flash pin fans out to a header pad: [pin x offset, turn height, pad x]
const FAN = [
  [-15, 24, -143],
  [-5, 14, -121],
  [5, 14, -77],
  [15, 24, -55],
];

export function GpioSection() {
  const [fx, fy] = FLASH;
  return (
    <g>
      {/* Bus feeds into each end of the header */}
      <path
        d={trace([
          [-270, -15],
          [-226, -15],
        ])}
        className="board-trace"
      />
      <path
        d={trace([
          [226, -15],
          [270, -15],
        ])}
        className="board-trace"
      />

      {/* Flash fan-out: 4 pins spread out to 4 header pads */}
      {FAN.map(([dx, turn, padX]) => (
        <path
          key={padX}
          d={trace([
            [fx + dx, fy - 19],
            [fx + dx, turn],
            [padX, turn],
            [padX, 3],
          ])}
          className="board-trace"
        />
      ))}

      {/* J2: 2×20 pin header, pin 1 square */}
      <rect x="-226" y="-38" width="452" height="46" rx="3" className="board-silk" />
      {HEADER_X.map((x, i) => (
        <g key={x}>
          {[-26, -4].map((y) =>
            i === 0 && y === -26 ? (
              <rect key={y} x={x - 6} y={y - 6} width="12" height="12" rx="1" className="board-pad" />
            ) : (
              <circle key={y} cx={x} cy={y} r="6" className="board-pad" />
            ),
          )}
          <circle cx={x} cy="-26" r="2.5" className="board-hole" />
          <circle cx={x} cy="-4" r="2.5" className="board-hole" />
        </g>
      ))}
      <Label x={-226} y={-46} anchor="start">
        J2 · GPIO
      </Label>

      {/* U4: SOIC-8 SPI flash */}
      {FLASH_PINS.map((dx) => (
        <g key={dx}>
          <rect x={fx + dx - 2} y={fy - 19} width="4" height="7" className="board-pad" />
          <rect x={fx + dx - 2} y={fy + 12} width="4" height="7" className="board-pad" />
        </g>
      ))}
      <rect x={fx - 22} y={fy - 12} width="44" height="24" rx="2" className="board-body" />
      <circle cx={fx - 15} cy={fy - 5} r="1.8" className="board-dimple" />
      <Label x={fx} y={fy + 4}>
        U4
      </Label>
      <Label x={fx + 36} y={fy + 4} anchor="start">
        FLASH
      </Label>

      {/* C5: decoupling right next to the flash */}
      <Chip0805 x={fx + 100} y={fy} vertical cap />
      <path d={`M${fx + 100} ${fy + 10}V${fy + 15}`} className="board-trace" />
      <Via x={fx + 100} y={fy + 18} />
      <path
        d={trace([
          [fx + 100, fy - 10],
          [fx + 100, fy - 22],
          [fx + 15, fy - 22],
        ])}
        className="board-trace"
      />
      <Label x={fx + 112} y={fy + 4} anchor="start">
        C5
      </Label>
    </g>
  );
}

/* ----- USER I/O rows: one chain of parts running from the Contact box outward ----- */
// Drawn with the box edge at x = 0, growing toward -x (dir = 1) or +x (dir = -1 mirrors it).
export function IoRow({ kind, dir }) {
  const X = (x) => -x * dir; // positive x = distance out from the box
  if (kind === 'reset' || kind === 'boot') {
    const sw = kind === 'reset' ? 'SW1' : 'SW2';
    const res = kind === 'reset' ? 'R1' : 'R2';
    const name = kind === 'reset' ? 'RST' : 'BOOT';
    return (
      <g>
        <path
          d={trace([
            [X(0), 0],
            [X(40), 0],
          ])}
          className="board-trace"
        />
        <path
          d={trace([
            [X(56), 0],
            [X(96), 0],
          ])}
          className="board-trace"
        />
        {/* Pull-up resistor up to the rail */}
        <path
          d={trace([
            [X(48), -4],
            [X(48), -18],
            [X(70), -18],
          ])}
          className="board-trace"
        />
        <Via x={X(70)} y={-18} />
        <Chip0805 x={X(48)} y={0} />
        <Label x={X(48)} y={16}>
          {res}
        </Label>

        {/* Tactile switch: 4 pads, metal body, round cap */}
        {[
          [-16, -12],
          [10, -12],
          [-16, 6],
          [10, 6],
        ].map(([px, py]) => (
          <rect key={`${px}-${py}`} x={X(118) + px} y={py} width="6" height="6" className="board-pad" />
        ))}
        <rect x={X(118) - 14} y="-14" width="28" height="28" rx="3" className="board-metal" />
        <circle cx={X(118)} cy="0" r="8.5" className="board-dark board-edge" />
        <Label x={X(118)} y={28}>{`${sw} ${name}`}</Label>
      </g>
    );
  }

  if (kind === 'led') {
    // LED fans out: its two tiny pads flare into the resistor and a ground via
    return (
      <g>
        <path
          d={trace([
            [X(0), 0],
            [X(40), 0],
          ])}
          className="board-trace"
        />
        <path
          d={trace([
            [X(56), 0],
            [X(74), 0],
            [X(84), -8],
            [X(92), -8],
          ])}
          className="board-trace"
        />
        <path
          d={trace([
            [X(122), -8],
            [X(130), -8],
            [X(142), 6],
            [X(154), 6],
          ])}
          className="board-trace"
        />
        <Via x={X(154)} y={6} />
        <Chip0805 x={X(48)} y={0} />
        <Label x={X(48)} y={16}>
          R3
        </Label>

        {/* D1: 0603 LED with a glowing lens */}
        <rect x={X(107) - 17} y="-13" width="6" height="10" rx="1" className="board-pad" />
        <rect x={X(107) + 11} y="-13" width="6" height="10" rx="1" className="board-pad" />
        <rect x={X(107) - 12} y="-16" width="24" height="16" rx="2" className="board-body" />
        <rect x={X(107) - 7} y="-12.5" width="14" height="9" rx="1.5" className="board-lens" />
        <Label x={X(107)} y={14}>
          D1
        </Label>
      </g>
    );
  }

  // Buzzer driven through a small transistor
  return (
    <g>
      <path
        d={trace([
          [X(0), 0],
          [X(40), 0],
        ])}
        className="board-trace"
      />
      <path
        d={trace([
          [X(58), -6],
          [X(78), -6],
          [X(88), 0],
          [X(98), 0],
        ])}
        className="board-trace"
      />
      {/* Q1: SOT-23 (2 legs one side, 1 the other) */}
      <rect x={X(46) - 2} y="-2" width="5" height="5" className="board-pad" />
      <rect x={X(46) + 6} y="-14" width="5" height="5" className="board-pad" />
      <rect x={X(46) - 10} y="-14" width="5" height="5" className="board-pad" />
      <rect x={X(46) - 9} y="-10" width="18" height="9" rx="1" className="board-body" />
      <Label x={X(46)} y={14}>
        Q1
      </Label>

      {/* BZ1: buzzer */}
      <circle cx={X(122)} cy="0" r="24" className="board-body" />
      <circle cx={X(122)} cy="0" r="15" className="board-groove" />
      <circle cx={X(122)} cy="0" r="3.5" className="board-hole" />
      <Label x={X(122)} y={36}>
        BZ1
      </Label>
    </g>
  );
}