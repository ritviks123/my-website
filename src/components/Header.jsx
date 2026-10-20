import { useEffect, useState } from 'react';
import HeroVisual from './HeroVisual';
import './Header.css';

/* ===== Swap later ===== */
const FIRST = ['R', 'itvik']; // initial + the letters that unfold after it
const LAST = ['S', 'ingh'];
const INTRO =
  'IoT Developer focused on building connected hardware. Experienced in embedded systems, PCB design, and AWS cloud integration.';
/* ====================== */

const NAME = `${FIRST.join('')} ${LAST.join('')}`;
const SEEN_KEY = 'hero-intro-seen';

// True only the first time the site opens in this browser tab (refreshing won't replay it)
function firstVisitThisTab() {
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false;
    sessionStorage.setItem(SEEN_KEY, '1');
    return true;
  } catch {
    return true; // storage blocked (private mode): just play it
  }
}
let playIntro = typeof window !== 'undefined' && firstVisitThisTab();

/*
  Hero: "RS" lights up, unfolds into "Ritvik Singh", then the intro line fades in.
  Plays once per tab; coming back to the homepage later shows the finished hero right away.
*/
function Header() {
  const [play] = useState(playIntro);
  useEffect(() => () => {
    playIntro = false; // leaving the homepage: don't replay when you come back
  }, []);

  return (
    <header className={`header${play ? ' is-intro' : ''}`}>
      <div className="header-hero">
        <div className="header-text">
          <h1 className="header-title">
            <span className="header-sr">{NAME}</span>
            <span className="header-name" aria-hidden="true">
              <span className="header-initial">{FIRST[0]}</span>
              <span className="header-unfold">
                <span>{FIRST[1]}{' '}</span>
              </span>
              <span className="header-initial">{LAST[0]}</span>
              <span className="header-unfold">
                <span>{LAST[1]}</span>
              </span>
            </span>
          </h1>
          <p className="header-intro">{INTRO}</p>
        </div>
        <div className="header-media" data-wire="mcu">
          <HeroVisual />
        </div>
      </div>
    </header>
  );
}

export default Header;