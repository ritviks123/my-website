import { useRef } from 'react';
import { Link } from 'react-router';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { projects } from '../data/projects';
import './Projects.css';

/* ===== Swap these later ===== */
const LABEL = 'Projects';
const INTRO = 'Boards, firmware, and the cloud glue in between. Pick one to read the build log.';
/* ============================ */

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <div className="project-card-top">
        <h3 className="project-card-title">{project.title}</h3>
        <span className="project-year">{project.year}</span>
      </div>
      <p className="project-card-sub">{project.subtitle || project.blurb}</p>

      <div className="project-visual">
        {project.image ? (
          <img src={project.image} alt={project.imageAlt || ''} loading="lazy" />
        ) : (
          <div className="project-visual-empty" aria-hidden="true">
            <span>{project.category}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function Projects({
  heading = "Things I've built.",
  headingTag = 'h2',
  limit,
  showAllLink = false,
}) {
  const HeadingTag = headingTag;
  const trackRef = useRef(null);
  const featured = projects.filter((project) => project.featured);
  const shown = limit ? featured.slice(0, limit) : featured;

  // Arrow buttons: slide exactly one card (card width + gap)
  function slide(direction) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.project-card');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = card ? card.offsetWidth + gap : track.clientWidth * 0.8;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * step, behavior: reduce ? 'auto' : 'smooth' });
  }

  return (
    <section className="projects" id="projects">
      <div className="projects-inner">
        <div className="projects-top">
          <div className="projects-text">
            <p className="projects-label">{LABEL}</p>
            <HeadingTag className="projects-heading">{heading}</HeadingTag>
            <p className="projects-intro">{INTRO}</p>
          </div>

          <div className="projects-controls">
            {showAllLink && (
              <Link to="/projects" className="projects-all">
                All projects <span aria-hidden="true">→</span>
              </Link>
            )}
            <button type="button" className="projects-arrow" aria-label="Previous project" onClick={() => slide(-1)}>
              <FiArrowLeft aria-hidden="true" />
            </button>
            <button type="button" className="projects-arrow" aria-label="Next project" onClick={() => slide(1)}>
              <FiArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="projects-track" ref={trackRef}>
        {shown.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

export default Projects;