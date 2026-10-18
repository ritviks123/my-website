import HeroVisual from './HeroVisual';
import './Header.css';

/* ===== Swap these later ===== */
const NAME = 'Ritvik Singh';
const INTRO =
  'IoT Developer focused on building connected hardware. Experienced in embedded systems, PCB design, and AWS cloud integration.';
const META = ['UC Irvine', 'Computer Engineering', 'Located Southern California'];
const RESUME_FILE = '/resume.pdf';
const RESUME_DOWNLOAD_NAME = 'Ritvik_Singh_Resume.pdf';
/* ============================ */

function Header() {
  return (
    <header className="header">
      <div className="header-hero">
        <div className="header-text">
          <h1 className="header-title">{NAME}</h1>
          <p className="header-intro">{INTRO}</p>

          <div className="header-actions">
            <a href="#projects" className="header-button">
              View projects
            </a>
            <a href={RESUME_FILE} download={RESUME_DOWNLOAD_NAME} className="header-button header-button-ghost">
              Download resume <span aria-hidden="true">↓</span>
            </a>
          </div>

          <p className="header-meta">{META.join(' · ')}</p>
        </div>

        <div className="header-media">
          <HeroVisual />
        </div>
      </div>
    </header>
  );
}

export default Header;