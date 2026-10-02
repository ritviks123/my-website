import './Header.css';

/* ===== Swap these later ===== */
const HERO_IMAGE = '/hero/hero-placeholder.svg';
const HERO_ALT = 'Placeholder illustration of a circuit board';
const HERO_WIDTH = 800;
const HERO_HEIGHT = 600;
const RESUME_URL = '/resume.pdf';
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
            Electrical and computer engineering student building circuits,
            embedded systems, and the occasional piece of software.
          </p>

          <div className="header-actions">
            <a href="#projects" className="header-button">
              See my projects
            </a>
            <a
              href={RESUME_URL}
              className="header-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Resume <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="header-media">
          <img
            src={HERO_IMAGE}
            alt={HERO_ALT}
            width={HERO_WIDTH}
            height={HERO_HEIGHT}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;