import { Link } from 'react-router';
import { FaGithub, FaLinkedin, FaEnvelope, FaFileLines } from 'react-icons/fa6';
import ChipMark from './ChipMark';
import './Footer.css';

// Swap later
const NAME = 'Ritvik Singh';
const TAGLINE = 'Computer engineering student';
const LOCATION = 'UC Irvine';
const BOARD_TAG = 'RS-01 · REV B'; // same label as the hero chip
const GITHUB_URL = 'https://github.com/ritviks123';
const LINKEDIN_URL = 'https://www.linkedin.com/in/singhritvik';
const EMAIL = 'ritvikchandersingh@gmail.com';

const YEAR = new Date().getFullYear();

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <ChipMark size={24} />
              ritvik.singh
            </Link>
            <p className="footer-tagline">{TAGLINE}, {LOCATION}</p>
          </div>

          <nav className="footer-pages" aria-label="Footer">
            <ul className="footer-links">
              <li><Link to="/projects" className="footer-link">Projects</Link></li>
              <li><Link to="/work" className="footer-link">Work</Link></li>
              <li><Link to="/about" className="footer-link">About</Link></li>
            </ul>
          </nav>

          <div className="footer-connect">
            <ul className="footer-links" aria-label="Social links">
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

            <Link to="/resume" className="footer-link">
              <FaFileLines className="footer-icon" aria-hidden="true" />
              Resume
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {YEAR} {NAME}</p>
          <p className="footer-tag">{BOARD_TAG}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;