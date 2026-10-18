import './ProjectThumb.css';

/* ===== Animated card visuals, one per project (matched by project id) ===== */

/* ---------- F.R.N.D.: drone relay, Wi-Fi reaching phones, LLM backup ---------- */
const DRONE = [200, 118];
const PHONES = [
  [56, 62],
  [48, 196],
  [344, 62],
  [352, 196],
];
const LLM = [200, 252];
const ROTORS = [
  [-34, -34],
  [34, -34],
  [-34, 34],
  [34, 34],
];
// Wi-Fi arcs drawn around a phone, opening toward the drone (outer arc lights first)
const WIFI_ARCS = [
  'M32.2 -20.1A38 38 0 0 1 32.2 20.1',
  'M26.3 -16.4A31 31 0 0 1 26.3 16.4',
  'M20.4 -12.7A24 24 0 0 1 20.4 12.7',
];
const WAVE_SPACING_S = 0.45; // each phone catches the signal a little later

function MeshThumb() {
  const [dx, dy] = DRONE;
  return (
    <svg className="thumb" viewBox="0 0 400 300" aria-hidden="true">
      {/* Phone links: messages travel phone → drone */}
      {PHONES.map(([x, y], i) => {
        const d = `M${x} ${y} L${dx} ${dy}`;
        return (
          <g key={d}>
            <path d={d} className="thumb-link" />
            <path d={d} pathLength="100" className="thumb-packet" style={{ animationDelay: `-${i * 0.7}s` }} />
          </g>
        );
      })}

      {/* LLM link: the answer travels drone → chip */}
      <path d={`M${dx} ${dy} L${LLM[0]} ${LLM[1]}`} className="thumb-link" />
      <path d={`M${dx} ${dy} L${LLM[0]} ${LLM[1]}`} pathLength="100" className="thumb-packet thumb-packet-slow" />

      {/* Phones, each with Wi-Fi arcs facing the drone */}
      {PHONES.map(([x, y], i) => {
        const angle = (Math.atan2(dy - y, dx - x) * 180) / Math.PI;
        const delay = i * WAVE_SPACING_S;
        return (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
            <g transform={`rotate(${angle})`}>
              {WIFI_ARCS.map((d, a) => (
                <path key={d} d={d} className="thumb-wave" style={{ animationDelay: `${delay + a * 0.18}s` }} />
              ))}
            </g>
            <rect x="-11" y="-18" width="22" height="36" rx="5" className="thumb-phone" />
            <rect
              x="-7.5"
              y="-12.5"
              width="15"
              height="22"
              rx="2"
              className="thumb-screen"
              style={{ animationDelay: `${delay + 0.4}s` }}
            />
          </g>
        );
      })}

      {/* LLM chip */}
      <g transform={`translate(${LLM[0]} ${LLM[1]})`}>
        <path d="M-34 -8h6M-34 0h6M-34 8h6M28 -8h6M28 0h6M28 8h6" className="thumb-pins" />
        <rect x="-28" y="-17" width="56" height="34" rx="5" className="thumb-chip" />
        <text x="0" y="1" textAnchor="middle" dominantBaseline="central" className="thumb-label thumb-label-ink">
          LLM
        </text>
      </g>

      {/* Drone (top view) with spinning props */}
      <g transform={`translate(${dx} ${dy})`}>
        <path d="M-34 -34L34 34M34 -34L-34 34" className="thumb-arm" />
        {ROTORS.map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
            <circle r="17" className="thumb-rotor" />
            <line x1="-14" y1="0" x2="14" y2="0" className="thumb-blade" />
          </g>
        ))}
        <rect x="-15" y="-15" width="30" height="30" rx="7" className="thumb-chip" />
        <circle r="4" className="thumb-led" />
      </g>
    </svg>
  );
}

/* ---------- Rover: sonar pings, obstacles light up, PD error + motor PWM react ---------- */
const ROVER_ROUTE =
  'M-30 170 L70 170 L110 118 L150 108 L190 118 L230 170 L270 218 L310 226 L350 214 L380 180 L430 170';
const BLOCKS = [
  { x: 130, y: 145, cls: 'thumb-block-a' },
  { x: 290, y: 160, cls: 'thumb-block-b' },
];
const PD_CURVE =
  'M0 48 L3 44.8 L6 39.6 L9 33.5 L12 27.6 L15 22.8 L18 19.6 L21 18.2 L24 18.6 L27 20.3 L30 22.9 ' +
  'L33 25.8 L36 28.6 L39 30.8 L42 32.2 L45 32.7 L48 32.4 L51 31.5 L54 30.3 L57 28.8 L60 27.6 L63 26.5 ' +
  'L66 25.9 L69 25.7 L72 25.9 L75 26.4 L78 27 L81 27.7 L84 28.3 L87 28.7 L90 29 L93 29.1 L96 29 L99 28.7 L102 28.4';
// Sonar arcs in front of the rover (inner arc fires first)
const SONAR_ARCS = [
  'M31.5 -8A14 14 0 0 1 31.5 8',
  'M39.7 -13.8A24 24 0 0 1 39.7 13.8',
  'M47.9 -19.5A34 34 0 0 1 47.9 19.5',
];

function RoverThumb() {
  return (
    <svg className="thumb" viewBox="0 0 400 300" aria-hidden="true">
      {/* Planned route (dashed) and the trail it has actually driven (solid) */}
      <path d={ROVER_ROUTE} className="thumb-route" />
      <path d={ROVER_ROUTE} pathLength="100" className="thumb-trail" />

      {/* Obstacles glow when the sensors pick them up */}
      {BLOCKS.map(({ x, y, cls }) => (
        <rect key={x} x={x} y={y} width="40" height="40" rx="6" className={`thumb-block ${cls}`} />
      ))}

      {/* PD error plot: big swing, then it settles */}
      <g transform="translate(272 20)">
        <rect width="110" height="66" rx="6" className="thumb-panel" />
        <text x="9" y="16" className="thumb-label">error</text>
        <path d="M4 36H106" className="thumb-zero" />
        <path d={PD_CURVE} transform="translate(4 8)" pathLength="100" className="thumb-trace" />
      </g>

      {/* Motor PWM: the outside wheel speeds up on each turn */}
      <g transform="translate(18 222)">
        <rect width="124" height="60" rx="6" className="thumb-panel" />
        <text x="9" y="16" className="thumb-label">pwm</text>
        <text x="9" y="34" className="thumb-label">L</text>
        <text x="9" y="50" className="thumb-label">R</text>
        <rect x="24" y="26" width="88" height="8" rx="2" className="thumb-meter-bg" />
        <rect x="24" y="42" width="88" height="8" rx="2" className="thumb-meter-bg" />
        <rect x="24" y="26" width="88" height="8" rx="2" className="thumb-meter thumb-meter-l" />
        <rect x="24" y="42" width="88" height="8" rx="2" className="thumb-meter thumb-meter-r" />
      </g>

      {/* Rover (drawn facing right, centered on 0,0) */}
      <g className="thumb-rover">
        <path d="M20 0H110" className="thumb-ir" />
        {SONAR_ARCS.map((d, i) => (
          <path key={d} d={d} className="thumb-sonar" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
        <rect x="-15" y="-19" width="11" height="6" rx="2" className="thumb-wheel" />
        <rect x="5" y="-19" width="11" height="6" rx="2" className="thumb-wheel" />
        <rect x="-15" y="13" width="11" height="6" rx="2" className="thumb-wheel" />
        <rect x="5" y="13" width="11" height="6" rx="2" className="thumb-wheel" />
        <rect x="-20" y="-13" width="40" height="26" rx="5" className="thumb-chip thumb-rover-body" />
        <rect x="-11" y="-6" width="14" height="12" rx="2" className="thumb-die" />
        <circle cx="13" cy="0" r="3" className="thumb-led" />
      </g>
    </svg>
  );
}
/* ---------- Weather station: wake, read, publish, deep sleep ---------- */
const BAR_HEIGHTS = [26, 40, 32, 48, 36, 54];

function WeatherThumb() {
  return (
    <svg className="thumb" viewBox="0 0 400 300" aria-hidden="true">
      {/* MQTT publish: node → broker, once per wake */}
      <path d="M134 150C180 84 228 74 266 90" className="thumb-link" />
      <path d="M134 150C180 84 228 74 266 90" pathLength="100" className="thumb-publish" />

      {/* Broker cloud */}
      <g className="thumb-cloud">
        <path d="M274 112H348A22 22 0 0 0 346 68A30 30 0 0 0 290 60A24 24 0 0 0 274 112Z" />
        <text x="312" y="92" textAnchor="middle" className="thumb-label thumb-label-ink">MQ</text>
      </g>

      {/* DHT11 sensor on its pins */}
      <path d="M58 150V164M67 150V164M76 150V164" className="thumb-pins" />
      <rect x="48" y="104" width="38" height="48" rx="4" className="thumb-sensor" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2].map((c) => (
          <rect key={`${r}-${c}`} x={55 + c * 9} y={111 + r * 9} width="6" height="6" rx="1" className="thumb-die" />
        ))
      )}

      {/* ESP32 board */}
      <rect x="40" y="164" width="100" height="56" rx="6" className="thumb-chip thumb-board" />
      <rect x="62" y="176" width="34" height="32" rx="3" className="thumb-die" />
      <path d="M108 172h22v8h-16v8h16" className="thumb-antenna" />
      <circle cx="122" cy="206" r="4" className="thumb-led thumb-led-wake" />

      {/* Deep-sleep z's */}
      <text x="150" y="196" className="thumb-label thumb-z">z</text>
      <text x="160" y="182" className="thumb-label thumb-z thumb-z2">z</text>
      <text x="170" y="168" className="thumb-label thumb-z thumb-z3">z</text>

      {/* Battery: weeks, not days */}
      <g transform="translate(42 246)">
        <rect width="46" height="20" rx="4" className="thumb-battery" />
        <rect x="46" y="6" width="4" height="8" rx="1" className="thumb-battery-cap" />
        <rect x="3" y="3" width="34" height="14" rx="2" className="thumb-battery-fill" />
        <text x="60" y="15" className="thumb-label">4 wks</text>
      </g>

      {/* Live dashboard */}
      <g transform="translate(212 160)">
        <rect width="164" height="104" rx="8" className="thumb-panel" />
        <text x="12" y="20" className="thumb-label">temp °C</text>
        {BAR_HEIGHTS.map((h, i) => (
          <rect
            key={i}
            x={14 + i * 24}
            y={90 - h}
            width="14"
            height={h}
            rx="2"
            className="thumb-bar"
            style={{ animationDelay: `-${i * 0.3}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
/* ---------- This website: page builds itself, Lighthouse fills to 100, branch merges ---------- */
const SITE_BLOCKS = [
  { x: 48, y: 86, w: 200, h: 54 },
  { x: 48, y: 150, w: 96, h: 60 },
  { x: 152, y: 150, w: 96, h: 60 },
  { x: 48, y: 220, w: 200, h: 20 },
];
const SCORES = [
  [310, 92],
  [358, 92],
  [310, 140],
  [358, 140],
];
const COMMITS = [
  [300, 222],
  [322, 206],
  [340, 206],
  [362, 222],
  [382, 222],
];

function WebsiteThumb() {
  return (
    <svg className="thumb" viewBox="0 0 400 300" aria-hidden="true">
      {/* Browser window */}
      <rect x="32" y="46" width="232" height="208" rx="10" className="thumb-chip" />
      <path d="M32 72H264" className="thumb-zero" />
      {[48, 60, 72].map((cx) => (
        <circle key={cx} cx={cx} cy="59" r="3" className="thumb-die" />
      ))}
      <rect x="92" y="52" width="150" height="14" rx="7" className="thumb-die" />
      <text x="167" y="63" textAnchor="middle" className="thumb-label thumb-url">ritviksingh.net</text>

      {/* The page assembles itself, block by block */}
      {SITE_BLOCKS.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx="4"
          className={`thumb-site${i === 0 ? ' thumb-site-hero' : ''}`}
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}

      {/* Lighthouse: four scores fill to 100 */}
      {SCORES.map(([cx, cy], i) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="18" className="thumb-score-track" />
          <circle
            cx={cx}
            cy={cy}
            r="18"
            pathLength="100"
            transform={`rotate(-90 ${cx} ${cy})`}
            className="thumb-score"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
          <text x={cx} y={cy + 4} textAnchor="middle" className="thumb-label thumb-label-ink thumb-score-num">100</text>
        </g>
      ))}

      {/* Git: a feature branch splits off main and merges back */}
      <path d="M288 222H392" className="thumb-route" />
      <path d="M300 222L316 206H346L362 222" className="thumb-route" />
      {COMMITS.map(([cx, cy], i) => (
        <circle key={cx} cx={cx} cy={cy} r="5" className="thumb-commit" style={{ animationDelay: `${i * 0.45}s` }} />
      ))}
    </svg>
  );
}

/* ===== Swap later: which animation each project id gets ===== */
const THUMBS = {
  frnd: MeshThumb,
  'autonomous-rc-rover': RoverThumb,
  'iot-weather-station': WeatherThumb,
  'ritviksingh-net': WebsiteThumb,
};

// Animated visual if the project has one, else its photo, else the perfboard placeholder
function ProjectThumb({ project }) {
  const Thumb = THUMBS[project.id];
  if (Thumb) return <Thumb />;

  if (project.image) {
    return <img src={project.image} alt={project.imageAlt || ''} loading="lazy" />;
  }

  return (
    <div className="project-visual-empty" aria-hidden="true">
      <span>{project.category}</span>
    </div>
  );
}

export default ProjectThumb;