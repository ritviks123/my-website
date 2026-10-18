import { Link } from 'react-router';
import { projects, homeProjectIds } from '../data/projects';
import ProjectThumb from './ProjectThumb';
import { projectUsesTool } from '../data/toolLinks';
import './Projects.css';

/* ===== Swap these later ===== */
const LABEL = '/projects';
const INTRO = 'Boards, firmware, and the cloud glue in between. Pick one to read the build log.';
/* ============================ */

function ProjectCard({ project, lit }) {
  return (
    <Link to={`/projects/${project.id}`} className={`project-card${lit ? ' is-lit' : ''}`} data-wire={project.id}>
      <div className="project-card-top">
        <h3 className="project-card-title">{project.title}</h3>
        <span className="project-year">{project.year}</span>
      </div>

      <div className="project-visual">
        <ProjectThumb project={project} />
      </div>

      {/* Unrolls below the card on hover (always visible on touch screens) */}
      <div className="project-reveal">
        <p className="project-card-sub">{project.summary || project.blurb}</p>
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

function Projects({ heading = "Things I've built.", headingTag = 'h2', activeTool }) {
  const HeadingTag = headingTag;
  // Home grid: these projects, in this order
  const shown = homeProjectIds.map((id) => projects.find((project) => project.id === id)).filter(Boolean);

  return (
    <section className="projects" id="projects">
      <div className="projects-inner">
        <div className="projects-top">
          <Link to="/projects" className="projects-label" aria-label="All projects">
            {LABEL}
          </Link>
          <HeadingTag className="projects-heading">{heading}</HeadingTag>
          <p className="projects-intro">{INTRO}</p>
        </div>

        <div className="projects-grid">
          {shown.map((project) => (
            <ProjectCard key={project.id} project={project} lit={projectUsesTool(project, activeTool)} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;