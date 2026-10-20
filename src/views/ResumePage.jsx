import { useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';
import SideCircuitry from '../components/SideCircuitry';
import './ResumePage.css';

// Swap later
const HEADING = 'Resume.';
const RESUME_URL = '/resume.pdf';
const RESUME_FILENAME = 'Ritvik-Singh-Resume.pdf';
const UPDATED = 'October 2026';
const SUMMARY =
  'Computer engineering student at UC Irvine focused on embedded systems, PCB design, and power.';
const HIGHLIGHTS = [
  'EE Intern, ZotBins hardware subteam',
  'B.S. Computer Engineering, GPA 3.83',
  'AWS Solutions Architect, Associate',
];

// Hide the viewer's sidebar and toolbar, fit the page to the width
const PREVIEW_URL = `${RESUME_URL}#toolbar=0&navpanes=0&view=FitH`;

function ResumePage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Resume | Ritvik Singh';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="page-board">
      <SideCircuitry content=".resume" seed={20} />

      <main className="resume">
        <header className="resume-top">
          <h1 className="resume-title">{HEADING}</h1>
          {/* Phones: date up here (the preview, and its date, are hidden there) */}
          <p className="resume-updated resume-updated-top">Updated {UPDATED}</p>
          <p className="resume-summary">{SUMMARY}</p>

          {/* Phones only: the preview is hidden there, so show the highlights instead */}
          <ul className="resume-highlights">
            {HIGHLIGHTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="resume-actions">
            <a href={RESUME_URL} download={RESUME_FILENAME} className="resume-button">
              <FiDownload aria-hidden="true" />
              Download PDF
            </a>
            <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="resume-link">
              Open in new tab <span aria-hidden="true">↗</span>
            </a>
          </div>

          <p className="resume-note">The preview shows on larger screens.</p>
        </header>

        {/* The PDF on a mini PCB, like the project carousel */}
        <div className="resume-preview">
          <div className="resume-board">
            <iframe src={PREVIEW_URL} title="Ritvik Singh's resume (PDF)" className="resume-frame" loading="lazy" />
            <p className="resume-updated resume-updated-board">Updated {UPDATED}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ResumePage;