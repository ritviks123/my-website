import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import './Nav.css';

// Swap later: add Work and About here once those pages exist
const PAGE_LINKS = [
  { to: '/projects', label: 'Projects' },
];

function Nav() {
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
    <nav className={`nav ${scrolled ? 'is-scrolled' : ''}`} aria-label="Main">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
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
        </div>
      </div>
    </nav>
  );
}

export default Nav;