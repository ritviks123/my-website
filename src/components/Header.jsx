import { Link } from 'react-router';
import HeroVisual from './HeroVisual';
import SerialMonitor from './SerialMonitor';
import './Header.css';

/* ===== Swap these later ===== */
const RESUME_PAGE = '/resume';
/* ============================ */

function Header() {
  return (
    <header className="header">
      <div className="header-hero">
        <div className="header-text">
          <p className="header-status">
            <span className="header-status-dot" aria-hidden="true"></span>
            Open to internships
          </p>

          <h1 className="header-title">
            I turn schematics into working{' '}
            <span className="header-highlight">hardware.</span>
          </h1>

          <p className="header-intro">
            Computer engineering student building circuits,
            embedded systems, and the occasional piece of software.
          </p>

          <div className="header-actions">
            <a href="#projects" className="header-button">
              See my projects
            </a>
            <Link to={RESUME_PAGE} className="header-link">
              Resume <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="header-terminal" aria-hidden="true">
            <SerialMonitor />
          </div>
        </div>

        <div className="header-media">
          <HeroVisual />
        </div>
      </div>
    </header>
  );
}

export default Header;