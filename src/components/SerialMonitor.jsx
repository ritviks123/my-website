import { useEffect, useState } from 'react';
import './SerialMonitor.css';

// Swap later: your boot log lines
const PORT_LABEL = 'COM3 · 115200 baud';
const LINES = [
  { kind: 'cmd', text: '> boot ritvik.singh v1.0' },
  { kind: 'ok', text: '[ OK ] 3V3 rail stable' },
  { kind: 'ok', text: '[ OK ] i2c: sensor found @ 0x76' },
  { kind: 'ok', text: '[ OK ] kicad: 2-layer board routed' },
  { kind: 'ok', text: '[ OK ] loading projects (3)' },
  { kind: 'cmd', text: '> status: open to internships' },
];

const START_DELAY_MS = 700; // wait for the page to settle
const CHAR_MS = 28; // typing speed
const LINE_PAUSE_MS = 380; // pause at the end of each line

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Colors the "[ OK ]" or ">" prefix, even while a line is half typed
function renderLine(text, kind) {
  const prefixLength = kind === 'ok' ? 6 : 1;
  return (
    <>
      <span className="serial-prefix">{text.slice(0, prefixLength)}</span>
      {text.slice(prefixLength)}
    </>
  );
}

function SerialMonitor() {
  const [reduced] = useState(prefersReducedMotion);
  const [lineIndex, setLineIndex] = useState(reduced ? LINES.length : 0);
  const [charIndex, setCharIndex] = useState(0);

  const done = lineIndex >= LINES.length;

  // Types one character at a time, like a microcontroller printing over UART
  useEffect(() => {
    if (done) return;

    const current = LINES[lineIndex].text;
    let delay;
    let step;

    if (charIndex < current.length) {
      delay = lineIndex === 0 && charIndex === 0 ? START_DELAY_MS : CHAR_MS;
      step = () => setCharIndex((count) => count + 1);
    } else {
      delay = LINE_PAUSE_MS;
      step = () => {
        setLineIndex((index) => index + 1);
        setCharIndex(0);
      };
    }

    const timer = setTimeout(step, delay);
    return () => clearTimeout(timer);
  }, [lineIndex, charIndex, done]);

  return (
    <div className="serial">
      <div className="serial-bar">
        <span className="serial-port">
          <span className="serial-led" />
          {PORT_LABEL}
        </span>
        <span className={`serial-rx ${done ? '' : 'is-active'}`}>RX</span>
      </div>

      <div className="serial-body">
        {LINES.map((line, index) => {
          let text = '';
          if (index < lineIndex) text = line.text;
          if (index === lineIndex) text = line.text.slice(0, charIndex);

          const showCursor =
            index === lineIndex || (done && index === LINES.length - 1);

          return (
            <span className="serial-line" key={line.text}>
              {text ? renderLine(text, line.kind) : '\u00A0'}
              {showCursor && <span className="serial-cursor" />}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default SerialMonitor;