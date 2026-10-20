import { useEffect } from 'react';
import { experience, education, certifications, tools } from '../data/work';
import SideCircuitry from '../components/SideCircuitry';
import './WorkPage.css';

// Swap later
const HEADING = 'Work.';
const INTRO = 'Internship and club experience, coursework, and the tools I use most.';

function WorkPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Work | Ritvik Singh';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="page-board">
      <SideCircuitry content=".work" seed={8} />

      <main className="work">
        <header className="work-top">
          <h1 className="work-title">{HEADING}</h1>
          <p className="work-intro">{INTRO}</p>
        </header>

        {/* Experience: one card per role */}
        <section className="work-section" aria-labelledby="work-experience">
          <h2 id="work-experience" className="work-heading">
            <span aria-hidden="true">// </span>experience
          </h2>

          <ol className="work-list">
            {experience.map((job) => (
              <li className="work-card work-job" key={job.id}>
                <div className="work-job-top">
                  <h3 className="work-role">
                    {job.role} <span className="work-org">· {job.org}</span>
                  </h3>
                  <span className="work-dates">
                    {job.current && <span className="work-led" aria-hidden="true" />}
                    {job.dates}
                  </span>
                </div>
                <p className="work-location">{job.location}</p>
                <p className="work-summary">{job.summary}</p>
                <ul className="work-bullets">
                  {job.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        {/* Education + certifications, side by side on wide screens */}
        <div className="work-split">
          <section className="work-section" aria-labelledby="work-education">
            <h2 id="work-education" className="work-heading">
              <span aria-hidden="true">// </span>education
            </h2>

            <div className="work-card">
              <h3 className="work-role">{education.degree}</h3>
              <p className="work-school">
                {education.school} · {education.dates}
              </p>
              <p className="work-gpa">
                GPA <strong>{education.gpa}</strong>
              </p>

              <p className="work-subheading">Relevant coursework</p>
              <ul className="work-tags">
                {education.coursework.map((course) => (
                  <li key={course}>{course}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="work-section" aria-labelledby="work-certs">
            <h2 id="work-certs" className="work-heading">
              <span aria-hidden="true">// </span>certifications
            </h2>

            <ul className="work-card work-certs">
              {certifications.map((cert) => (
                <li className="work-cert" key={cert.name}>
                  <div>
                    <p className="work-cert-name">{cert.name}</p>
                    <p className="work-cert-issuer">{cert.issuer}</p>
                  </div>
                  <div className="work-cert-meta">
                    {cert.year && <span>{cert.year}</span>}
                    {cert.url && (
                      <a href={cert.url} className="work-cert-link" target="_blank" rel="noopener noreferrer">
                        Verify<span aria-hidden="true"> ↗</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Tools: one card per group, like the homepage toolkit */}
        <section className="work-section" aria-labelledby="work-tools">
          <h2 id="work-tools" className="work-heading">
            <span aria-hidden="true">// </span>tools i reach for
          </h2>

          <div className="work-tools">
            {tools.map((group) => (
              <div className="work-card work-tool-group" key={group.group}>
                <h3 className="work-tool-label">{group.group}</h3>
                <ul className="work-chips">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default WorkPage;