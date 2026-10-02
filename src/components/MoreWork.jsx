import { Link } from 'react-router';
import { projects } from '../data/projects';
import './MoreWork.css';

function MoreWork() {
  const smallProjects = projects.filter((project) => !project.featured);

  if (smallProjects.length === 0) {
    return null;
  }

  return (
    <section className="morework" aria-labelledby="morework-heading">
      <div className="morework-top">
        <h2 id="morework-heading" className="morework-heading">
          <span aria-hidden="true">// </span>more work
        </h2>
        <p className="morework-hint" aria-hidden="true">
          scroll →
        </p>
      </div>

      <ul className="morework-track">
        {smallProjects.map((project) => (
          <li className="morework-item" key={project.id}>
            <Link to={`/projects/${project.id}`} className="morework-card">
              {project.image ? (
                <img
                  className="morework-image"
                  src={project.image}
                  alt={project.imageAlt || ''}
                  loading="lazy"
                />
              ) : (
                <div
                  className="morework-image morework-placeholder"
                  aria-hidden="true"
                >
                  <span>{project.category}</span>
                </div>
              )}

              <div className="morework-body">
                <div className="morework-meta">
                  <h3>{project.title}</h3>
                  <span className="morework-year">{project.year}</span>
                </div>
                {project.subtitle && (
                  <p className="morework-subtitle">{project.subtitle}</p>
                )}
                <p className="morework-blurb">{project.blurb}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default MoreWork;