import { Fragment, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { FaGithub, FaCirclePlay } from 'react-icons/fa6';
import { projects } from '../data/projects';
import MediaCarousel from '../components/MediaCarousel';
import ProjectThumb from '../components/ProjectThumb';
import ArticleCircuitry from '../components/ArticleCircuitry';
import NotFoundPage from './NotFoundPage';
import './ProjectPage.css';

/*
  Turns the mini-markdown in projects.js into real elements:
    **bold**   `code`   [link text](https://...)   [FILL: ...] (shown in red so you spot it)
*/
const INLINE_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|\[FILL[^\]]*\]|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text) {
  if (!text) return null;

  return text.split(INLINE_PATTERN).map((part, i) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('[FILL')) {
      return (
        <mark key={i} className="project-fill">
          {part}
        </mark>
      );
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a
          key={i}
          className="project-inline-link"
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link[1]} <span aria-hidden="true">↗</span>
        </a>
      );
    }

    return part;
  });
}

/* Draws a "flow" (row of steps) or a "compare" (two columns) from projects.js */
function ProjectDiagram({ diagram }) {
  if (diagram.type === 'compare') {
    return (
      <figure className="project-diagram">
        <div className="project-compare">
          {diagram.columns.map((column) => (
            <div key={column.title} className="project-compare-col">
              <p className="project-compare-title">{column.title}</p>
              <ul>
                {column.items.map((item) => (
                  <li key={item}>{renderInline(item)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {diagram.caption && <figcaption>{renderInline(diagram.caption)}</figcaption>}
      </figure>
    );
  }

  return (
    <figure className="project-diagram">
      <ol className="project-flow">
        {diagram.steps.map((step, i) => (
          <li key={step} className="project-flow-step">
            <span className="project-flow-num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{renderInline(step)}</span>
          </li>
        ))}
      </ol>
      {diagram.note && (
        <p className="project-flow-note">
          <span aria-hidden="true">↳ </span>
          {renderInline(diagram.note)}
        </p>
      )}
      {diagram.caption && <figcaption>{renderInline(diagram.caption)}</figcaption>}
    </figure>
  );
}

function ProjectTable({ table, label }) {
  return (
    <div className="project-table-wrap" tabIndex={0} role="region" aria-label={label}>
      <table className="project-table">
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{renderInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Small icon in front of a link: GitHub for source, play button for videos and demos
function LinkIcon({ label }) {
  if (/source|github/i.test(label)) return <FaGithub aria-hidden="true" />;
  if (/video|demo/i.test(label)) return <FaCirclePlay aria-hidden="true" />;
  return null;
}

// Previous / next project card with a mini animated thumbnail
function NearbyProject({ project, direction }) {
  const isNext = direction === 'next';
  return (
    <Link to={`/projects/${project.id}`} className={`project-nearby${isNext ? ' is-next' : ''}`}>
      <span className="project-nearby-thumb" aria-hidden="true">
        <ProjectThumb project={project} />
      </span>
      <span className="project-nearby-text">
        <span className="project-label">
          {isNext ? (
            <>
              Next <span aria-hidden="true">→</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">←</span> Previous
            </>
          )}
        </span>
        <span className="project-nearby-title">{project.title}</span>
      </span>
    </Link>
  );
}

export function ProjectPage() {
  const { projectId } = useParams();
  const index = projects.findIndex((p) => p.id === projectId);
  const project = projects[index];

  useEffect(() => {
    if (!project) return;
    const previousTitle = document.title;
    document.title = `${project.title} | Ritvik Singh`;
    return () => {
      document.title = previousTitle;
    };
  }, [project]);

  if (!project) {
    return <NotFoundPage />;
  }

  const next = projects[(index + 1) % projects.length];
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const links = (project.links ?? []).filter((link) => link.url);
  const highlights = project.highlights ?? [];
  const builtWith = project.builtWith ?? [];
  const article = project.article ?? [];
  const stats = project.stats ?? [];
  // Where the big diagram sits: 'top', 'bottom', or a number (after that paragraph)
  const heroAt = project.heroAt ?? 'top';
  const heroFigure = project.hero && (
    <div className="project-figure">
      <ProjectDiagram diagram={project.hero} />
    </div>
  );
  // Spec strip cells (like a datasheet header); empty ones are skipped
  const spec = [
    ['Role', project.role],
    ['Team', project.team],
    ['Timeline', project.timeline],
  ].filter(([, value]) => value);

  return (
    <div className="project-board">
      <ArticleCircuitry />
      <main className="project-page">
        <div className="project-container">
          {/* ===== Top: back link, meta, title, lede, chips ===== */}
          <Link to="/projects" className="project-back">
            <span aria-hidden="true">← </span>All projects
          </Link>

          <p className="project-topline">
            <span className="project-topline-year">{project.year}</span>
            {project.category && (
              <>
                <span aria-hidden="true">·</span>
                <span>{project.category}</span>
              </>
            )}
          </p>

          <h1 className="project-title">{project.title}</h1>

          {/* ===== Spec strip: role, team, timeline, status, links in one compact card ===== */}
          {(spec.length > 0 || project.status || links.length > 0) && (
            <dl className="project-spec">
              {spec.map(([label, value]) => (
                <div key={label} className="project-spec-cell is-short">
                  <dt>{label}</dt>
                  <dd>{renderInline(value)}</dd>
                </div>
              ))}
              {project.status && (
                <div className="project-spec-cell">
                  <dt>Status</dt>
                  <dd className="project-spec-status">
                    <span className="project-led" aria-hidden="true" />
                    {project.status}
                  </dd>
                </div>
              )}
              {links.length > 0 && (
                <div className="project-spec-cell">
                  <dt>Links</dt>
                  <dd>
                    <ul className="project-links">
                      {links.map((link) => (
                        <li key={link.label}>
                          <a className="project-link" href={link.url} target="_blank" rel="noopener noreferrer">
                            <LinkIcon label={link.label} />
                            {link.label}
                            <span aria-hidden="true">↗</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          )}

          {/* ===== Media: animation first, then photos (arrows, auto-advance) ===== */}
          <div className="project-media">
            <MediaCarousel project={project} />
          </div>

          {/* ===== Key numbers ===== */}
          {stats.length > 0 && (
            <ul className="project-stats" aria-label="Key numbers">
              {stats.map((stat) => (
                <li key={stat.label} className="project-stat">
                  <span className="project-stat-value">{stat.value}</span>
                  <span className="project-stat-label">{stat.label}</span>
                </li>
              ))}
            </ul>
          )}

          {/* ===== Body: article left, sidebar right (stacked on phones) ===== */}
          <div className="project-layout">
            <article className="project-article">
              {heroAt === 'top' && heroFigure}

              {article.map((section, i) => (
                <section key={i} className="project-section">
                  {section.heading && <h2 className="project-section-heading">{section.heading}</h2>}
                  {section.body?.map((paragraph, j) => (
                    <Fragment key={j}>
                      <p>{renderInline(paragraph)}</p>
                      {i === 0 && heroAt === j + 1 && heroFigure}
                    </Fragment>
                  ))}
                  {section.diagram && <ProjectDiagram diagram={section.diagram} />}
                  {section.table && <ProjectTable table={section.table} label={section.heading || 'Table'} />}
                </section>
              ))}

              {heroAt === 'bottom' && heroFigure}

              {project.footnote && <p className="project-footnote">{renderInline(project.footnote)}</p>}
            </article>

            {(highlights.length > 0 || builtWith.length > 0) && (
              <aside className="project-sidebar">
                {highlights.length > 0 && (
                  <section>
                    <h2 className="project-label">
                      <span aria-hidden="true">// </span>highlights
                    </h2>
                    <ul className="project-highlights">
                      {highlights.map((item) => (
                        <li key={item}>{renderInline(item)}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {builtWith.length > 0 && (
                  <section>
                    <h2 className="project-label">
                      <span aria-hidden="true">// </span>built with
                    </h2>
                    <ul className="project-built">
                      {builtWith.map((item) => (
                        <li key={item}>{renderInline(item)}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </aside>
            )}
          </div>

          {/* ===== Previous / next project ===== */}
          {next && next.id !== project.id && (
            <nav className="project-nearby-row" aria-label="More projects">
              <NearbyProject project={previous} direction="previous" />
              <NearbyProject project={next} direction="next" />
            </nav>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProjectPage;