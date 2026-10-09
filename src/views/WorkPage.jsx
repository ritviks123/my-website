import { useEffect } from 'react';
import { experience, education, certifications, tools } from '../data/work';
import './WorkPage.css';

// Swap later
const HEADLINE = "Where I've worked, studied, and built.";
const LEDE = 'Internship and club experience, coursework, and the tools I use most.';

function WorkPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Work | Ritvik Singh';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="work">
      <header className="work-intro">
        <p className="work-eyebrow">
          <span aria-hidden="true">// </span>work
        </p>
        <h1>{HEADLINE}</h1>
        <p className="work-lede">{LEDE}</p>
      </header>

      {/* Experience */}
      <section className="work-section" aria-labelledby="work-experience">
        <h2 id="work-experience" className="work-heading">
          <span aria-hidden="true">// </span>experience
        </h2>

        <ol className="work-timeline">
          {experience.map((job) => (
            <li className="work-item" key={job.id}>
              <div className="work-when">
                <span className="work-dates">
                  {job.current && <span className="work-dot" aria-hidden="true" />}
                  {job.dates}
                </span>
                <span className="work-location">{job.location}</span>
              </div>

              <div className="work-what">
                <h3 className="work-role">
                  {job.role} <span className="work-org">· {job.org}</span>
                </h3>
                <p className="work-summary">{job.summary}</p>
                <ul className="work-bullets">
                  {job.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Education + certifications */}
      <div className="work-split">
        <section className="work-section" aria-labelledby="work-education">
          <h2 id="work-education" className="work-heading">
            <span aria-hidden="true">// </span>education
          </h2>

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
        </section>

        <section className="work-section" aria-labelledby="work-certs">
          <h2 id="work-certs" className="work-heading">
            <span aria-hidden="true">// </span>certifications
          </h2>

          <ul className="work-certs">
            {certifications.map((cert) => (
              <li className="work-cert" key={cert.name}>
                <div>
                  <p className="work-cert-name">{cert.name}</p>
                  <p className="work-cert-issuer">{cert.issuer}</p>
                </div>
                <div className="work-cert-meta">
                  {cert.year && <span>{cert.year}</span>}
                  {cert.url && (
                    <a
                      href={cert.url}
                      className="work-cert-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Verify<span aria-hidden="true"> ↗</span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Tools */}
      <section className="work-section" aria-labelledby="work-tools">
        <h2 id="work-tools" className="work-heading">
          <span aria-hidden="true">// </span>tools i reach for
        </h2>

        <div className="work-tools">
          {tools.map((group) => (
            <div className="work-tool-group" key={group.group}>
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
  );
}

export default WorkPage;