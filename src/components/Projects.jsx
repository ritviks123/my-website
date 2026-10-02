import { projects } from '../data/projects';
import './Projects.css';

function ProjectCardContent({ project }) {
  return (
    <>
      {project.image ? (
        <img
          className="project-image"
          src={project.image}
          alt={project.imageAlt || ''}
          loading="lazy"
        />
      ) : (
        <div className="project-image project-image-empty" aria-hidden="true">
          <span>{project.category}</span>
        </div>
      )}

      <div className="project-body">
        <div className="project-meta">
          <h3>
            {project.title}
            {project.link && (
              <span className="project-arrow" aria-hidden="true">
                {' '}↗
              </span>
            )}
          </h3>
          <span className="project-year">{project.year}</span>
        </div>

        <p>{project.blurb}</p>

        {project.tags?.length > 0 && (
          <ul className="project-tags">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function Projects() {
  return (
    <section className="projects" id="projects">
      <h2 className="projects-heading">
        <span aria-hidden="true">// </span>selected work
      </h2>

      <div className="projects-grid">
        {projects.map((project) =>
          project.link ? (
            <a
              key={project.id}
              className="project-card is-link"
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ProjectCardContent project={project} />
            </a>
          ) : (
            <article key={project.id} className="project-card">
              <ProjectCardContent project={project} />
            </article>
          )
        )}
      </div>
    </section>
  );
}

export default Projects;