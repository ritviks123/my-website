import { projects } from '../data/projects';
import './Projects.css';

function Projects() {
  return (
    <section className="projects" id="projects">
      <h2>Projects</h2>

      <div className="projects-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.id}>
            {project.image ? (
              <img
                className="project-image"
                src={project.image}
                alt={project.title}
                loading="lazy"
              />
            ) : (
              <div className="project-image project-image-empty">
                {project.category}
              </div>
            )}

            <div className="project-body">
              <div className="project-meta">
                <span className="project-category">{project.category}</span>
                <span>{project.year}</span>
              </div>

              <h3>{project.title}</h3>
              <p>{project.blurb}</p>

              {project.tags?.length > 0 && (
                <ul className="project-tags">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              )}

              {project.link && (
                <a className="project-link" href={project.link} target="_blank" rel="noreferrer">View project</a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Projects;