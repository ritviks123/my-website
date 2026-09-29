import { useEffect, useState } from 'react';
import './Header.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`header-nav ${scrolled ? 'is-scrolled' : ''}`}
        aria-label="Main"
      >
        <div className="header-nav-inner">
          <a href="#top" className="header-logo">
            ritvik.singh
          </a>

          <div className="header-links">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
          </div>

          <a href="#contact" className="header-cta">
            Get in touch
          </a>
        </div>
      </nav>

      <header className="header">
        <div className="header-hero">
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
              href="/resume.pdf"
              className="header-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Résumé <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;