import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { FaGithub } from 'react-icons/fa6';
import { projects } from '../data/projects';
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
  const links = (project.links ?? []).filter((link) => link.url);
  const badges = project.badges ?? [];
  const tags = project.tags ?? [];
  const highlights = project.highlights ?? [];
  const builtWith = project.builtWith ?? [];
  const article = project.article ?? [];

  return (
    <main className="project-page">
      <div className="project-container">
        {/* ===== Top: back link, meta, title, lede, links, chips ===== */}
        <Link to="/projects" className="project-back">
          <span aria-hidden="true">← </span>All projects
        </Link>

        <p className="project-topline">
          <span className="project-topline-year">{project.year}</span>
          {project.tagline && (
            <>
              <span className="project-topline-rule" aria-hidden="true" />
              <span>{project.tagline}</span>
            </>
          )}
          {project.status && (
            <>
              <span className="project-topline-rule" aria-hidden="true" />
              <span className="project-topline-status">
                <span className="project-topline-dot" aria-hidden="true">
                  ●
                </span>
                {project.status}
              </span>
            </>
          )}
        </p>

        <h1 className="project-title">{project.title}</h1>

        {(project.category || project.subtitle) && (
          <p className="project-subtitle">
            {project.category && (
              <span className="project-subtitle-category">{project.category}</span>
            )}
            {project.category && project.subtitle && <span aria-hidden="true"> · </span>}
            {project.subtitle}
          </p>
        )}

        {project.description && <p className="project-lede">{renderInline(project.description)}</p>}

        {links.length > 0 && (
          <ul className="project-links">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  className="project-link"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label === 'Source' && <FaGithub aria-hidden="true" />}
                  {link.label}
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {(badges.length > 0 || tags.length > 0) && (
          <ul className="project-chips" aria-label="Key facts and tags">
            {badges.map((badge) => (
              <li key={badge} className="project-chip">
                {badge}
              </li>
            ))}
            {tags.map((tag) => (
              <li key={tag} className="project-chip project-chip-tag">
                {tag}
              </li>
            ))}
          </ul>
        )}

        {/* ===== Hero frame: photo if you have one, otherwise the hero diagram ===== */}
        <div className="project-hero">
          <div className="project-hero-bar" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          {project.image ? (
            <img className="project-hero-image" src={project.image} alt={project.imageAlt} />
          ) : project.hero ? (
            <div className="project-hero-body">
              <ProjectDiagram diagram={project.hero} />
            </div>
          ) : (
            <div className="project-hero-empty" aria-hidden="true" />
          )}
        </div>

        {/* ===== Body: article left, sidebar right (stacked on phones) ===== */}
        <div className="project-layout">
          <article className="project-article">
            {article.map((section, i) => (
              <section key={i} className="project-section">
                {section.heading && <h2 className="project-section-heading">{section.heading}</h2>}
                {section.body?.map((paragraph, j) => (
                  <p key={j}>{renderInline(paragraph)}</p>
                ))}
                {section.diagram && <ProjectDiagram diagram={section.diagram} />}
                {section.table && (
                  <ProjectTable table={section.table} label={section.heading || 'Table'} />
                )}
              </section>
            ))}

            {project.footnote && <p className="project-footnote">{renderInline(project.footnote)}</p>}
          </article>

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
        </div>

        {/* ===== Next project ===== */}
        {next && next.id !== project.id && (
          <nav className="project-next" aria-label="Next project">
            <p className="project-label">
              <span aria-hidden="true">// </span>next project
            </p>
            <Link to={`/projects/${next.id}`} className="project-next-link">
              {next.title} <span aria-hidden="true">→</span>
            </Link>
          </nav>
        )}
      </div>
    </main>
  );
}

export default ProjectPage;