import PinWiring from './PinWiring';
import './SideCircuitry.css';

/*
  Background circuitry for the inner pages (Work, About, Resume).
  It now draws the chip-to-chip wiring from PinWiring.jsx.
  Use it as the first child of a <div className="page-board">; change `seed` to reroll that page.
  (`content` is no longer needed; it's ignored so the pages don't have to change.)
*/
function SideCircuitry({ seed = 1 }) {
  return <PinWiring seed={seed} />;
}

export default SideCircuitry;