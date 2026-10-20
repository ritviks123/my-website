import { useEffect, useState } from 'react';
import SideCircuitry from '../components/SideCircuitry';
import './AboutPage.css';

// Swap later: rewrite all text in your own voice
const ABOUT_IMAGE = '/projects/headshot.webp'; // e.g. '/about/portrait-v1.webp'
const ABOUT_ALT = 'Portrait of Ritvik Singh';

const HEADING = 'About.';
const HEADLINE = 'I design the board, then write the code that runs on it.';

const BIO = [
  "I'm a computer engineering student at UC Irvine who likes projects that cross the line between hardware and software. Most of what I build starts as a schematic in KiCad and ends as firmware running on a board I soldered myself.",
  "Right now I'm on the hardware subteam at ZotBins, designing a solar and battery power system so the bins can run off-grid. Before that, I spent a year in IEEE's Open Project Space, working through builds in embedded firmware, analog circuits, and wireless IoT, and finishing with an autonomous rover on a custom PCB.",
  'I like the unglamorous parts: power budgets, timing bugs, and the oscilloscope trace that finally explains why something broke.',
];

const FACTS = [
  { label: 'Based in', value: 'Irvine, CA' },
  { label: 'Studying', value: 'B.S. Computer Engineering, UCI' },
  { label: 'Graduating', value: 'May 2028' },
  { label: 'Currently', value: 'EE Intern, ZotBins' },
  { label: 'Focus', value: 'Embedded, PCB design, power' },
];

const NOW = [
  { label: 'Building', text: 'A solar power and battery subsystem for ZotBins.' },
  { label: 'Learning', text: 'MPPT behavior under partial shading.' },
  { label: 'Looking for', text: 'Hardware and embedded internships.' },
];

function AboutPage() {
  const [photoBroken, setPhotoBroken] = useState(false); // missing photo → show the placeholder

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'About | Ritvik Singh';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="page-board">
      <SideCircuitry content=".about" seed={12} />

      <main className="about">
        <header className="about-top">
          <h1 className="about-title">{HEADING}</h1>
          <p className="about-intro">{HEADLINE}</p>
        </header>

        <div className="about-layout">
          {/* Photo + quick facts: one card, stays in view on wide screens */}
          <aside className="about-side">
            {ABOUT_IMAGE && !photoBroken ? (
              <img className="about-photo" src={ABOUT_IMAGE} alt={ABOUT_ALT} onError={() => setPhotoBroken(true)} />
            ) : (
              <div className="about-photo about-photo-empty" aria-hidden="true">
                <span>Photo</span>
              </div>
            )}

            <dl className="about-facts">
              {FACTS.map((fact) => (
                <div className="about-fact" key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </aside>

          <div className="about-body">
            <div className="about-bio">
              {BIO.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <section className="about-now" aria-labelledby="about-now-heading">
              <h2 id="about-now-heading" className="about-heading">
                <span aria-hidden="true">// </span>now
              </h2>
              <ul className="about-now-list">
                {NOW.map((item) => (
                  <li key={item.label}>
                    <span className="about-now-label">{item.label}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AboutPage;