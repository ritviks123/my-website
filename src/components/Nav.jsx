import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { FiMenu, FiX } from 'react-icons/fi';
import './Nav.css';

// Swap later: add Work and About here once those pages exist
const PAGE_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
];

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
          ritvik.singh
        </Link>

        <ul className="nav-links">
          {PAGE_LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="nav-link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
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