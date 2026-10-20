import './ChipMark.css';

// Logo = the favicon file, so they always match.
// The hero MCU is a separate, more detailed drawing.
function ChipMark({ size = 32, className = '' }) {
  return (
    <img
      className={`chip-mark ${className}`.trim()}
      src="/favicon.svg"
      width={size}
      height={size}
      alt=""
    />
  );
}

export default ChipMark;