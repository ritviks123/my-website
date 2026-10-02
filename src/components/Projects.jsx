import { Link } from 'react-router';
import { projects } from '../data/projects';
import './Projects.css';

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className="project-card">
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
          <h3>{project.title}</h3>
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
    </Link>
  );
}

function Projects({
  heading = 'selected work',
  headingTag = 'h2',
  limit,
  showAllLink = false,
}) {
  const HeadingTag = headingTag;
  const featuredProjects = projects.filter((project) => project.featured);
  const shownProjects = limit
    ? featuredProjects.slice(0, limit)
    : featuredProjects;

  return (
    <section className="projects" id="projects">
      <div className="projects-top">
        <HeadingTag className="projects-heading">
          <span aria-hidden="true">// </span>
          {heading}
        </HeadingTag>

        {showAllLink && (
          <Link to="/projects" className="projects-all">
            All projects <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      <div className="projects-grid">
        {shownProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

export default Projects;