import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { FiMenu, FiX } from 'react-icons/fi';
import './Nav.css';

// Swap later: add Work and About here once those pages exist
const PAGE_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
];

// Logo mark: a tiny IC chip with pins (dot = pin 1)
function ChipMark() {
  return (
    <svg className="nav-mark" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="6" y="5" width="12" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="9" cy="8" r="1.1" fill="currentColor" />
      <path d="M2 8.5h4M2 12h4M2 15.5h4M18 8.5h4M18 12h4M18 15.5h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the menu with the Escape key
  useEffect(() => {
    if (!menuOpen) return;

    function handleKey(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  const navClass = ['nav', scrolled && 'is-scrolled', menuOpen && 'is-open']
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={navClass} aria-label="Main">
      <div className="nav-inner">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <ChipMark />
          ritvik.singh
        </Link>

        <div className="nav-actions">
          <ul className="nav-links">
            {PAGE_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="nav-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>          
          <Link to="/resume" className="nav-link nav-resume">
            Resume
          </Link>

          <Link to="/#contact" className="nav-cta">
            Get in touch
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div id="nav-menu" className="nav-menu" hidden={!menuOpen}>
        <ul className="nav-menu-links">
          {PAGE_LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="nav-menu-link" onClick={closeMenu}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/resume" className="nav-menu-link" onClick={closeMenu}>
              Resume
            </Link>
          </li>
          <li>
            <Link to="/#contact" className="nav-menu-link nav-menu-cta" onClick={closeMenu}>
              Get in touch
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Nav;