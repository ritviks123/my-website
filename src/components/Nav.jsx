import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import './Nav.css';

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

        <div className="nav-links">
          <Link to="/projects">Projects</Link>
        </div>

        <Link to="/#contact" className="nav-cta">
          Get in touch
        </Link>
      </div>
    </nav>
  );
}

export default Nav;