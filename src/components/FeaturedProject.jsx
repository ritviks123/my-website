import { Link } from 'react-router';
import ProjectThumb from './ProjectThumb';
import './FeaturedProject.css';

function FeaturedProject({ project, index, onActive }) {
  const number = String(index + 1).padStart(2, '0');
  const articleUrl = `/projects/${project.id}`;
  // Tell the page which card is hovered or focused, so its wire lights up
  const light = () => onActive?.(project.id);
  const unlight = () => onActive?.(null);

  return (
    <article
      className="featured"
      data-wire={project.id}
      onMouseEnter={light}
      onMouseLeave={unlight}
      onFocus={light}
      onBlur={unlight}
    >
      <Link to={articleUrl} className="featured-visual" aria-hidden="true" tabIndex={-1}>
        <ProjectThumb project={project} />
      </Link>

      <div className="featured-text">
        <p className="featured-meta">
          <span className="featured-number">{number}</span>
          <span aria-hidden="true">/</span>
          <span>{project.year}</span>
          <span aria-hidden="true">·</span>
          <span>{project.category}</span>
        </p>

        <h2 className="featured-title">
          <Link to={articleUrl}>{project.title}</Link>
        </h2>

        {project.subtitle && <p className="featured-subtitle">{project.subtitle}</p>}

        <p className="featured-description">{project.description || project.blurb}</p>

        {project.tags?.length > 0 && (
          <ul className="featured-tags">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}

        <div className="featured-links">
          <Link to={articleUrl} className="featured-link-main">
            Read the article <span aria-hidden="true">→</span>
          </Link>
          {project.repo && (
            <a href={project.repo} className="featured-link" target="_blank" rel="noopener noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
          )}
          {project.live && (
            <a href={project.live} className="featured-link" target="_blank" rel="noopener noreferrer">
              Live <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default FeaturedProject;