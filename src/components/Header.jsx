import HeroVisual from './HeroVisual';
import './Header.css';

/* Hero: just the MCU chip. Your name and intro are printed on it (see HeroVisual.jsx). */
function Header() {
  return (
    <header className="header">
      <div className="header-hero">
        <div className="header-media" data-wire="mcu">
          <HeroVisual />
        </div>
      </div>
    </header>
  );
}

export default Header;