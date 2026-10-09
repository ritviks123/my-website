import { Link } from 'react-router';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa6';
import './Footer.css';

// Swap later
const NAME = 'Ritvik Singh';
const TAGLINE = 'Computer engineering student';
const LOCATION = 'UC Irvine';
const BOTTOM_LINE = 'Designed and coded by hand.';
const GITHUB_URL = 'https://github.com/ritviks123';
const LINKEDIN_URL = 'https://www.linkedin.com/in/your-handle';
const EMAIL = 'you@example.com';

const YEAR = new Date().getFullYear();

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">ritvik.singh</Link>
            <p className="footer-tagline">{TAGLINE}, {LOCATION}</p>
          </div>

          <nav className="footer-pages" aria-label="Footer">
            <ul className="footer-links">
              <li><Link to="/projects" className="footer-link">Projects</Link></li>
              <li><Link to="/about" className="footer-link">About</Link></li>
            </ul>
          </nav>

          <ul className="footer-links footer-socials" aria-label="Social links">
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="footer-link">
                <FaGithub className="footer-icon" aria-hidden="true" />
                GitHub
              </a>
            </li>
            <li>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="footer-link">
                <FaLinkedin className="footer-icon" aria-hidden="true" />
                LinkedIn
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="footer-link">
                <FaEnvelope className="footer-icon" aria-hidden="true" />
                Email
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-bottom">
          <p>© {YEAR} {NAME}</p>
          <p>{BOTTOM_LINE}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;