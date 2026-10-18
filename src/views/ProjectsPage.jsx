import { useEffect, useState } from 'react';
import { projects } from '../data/projects';
import FeaturedProject from '../components/FeaturedProject';
import ProjectsCircuitry from '../components/ProjectsCircuitry';
import './ProjectsPage.css';

// Swap later
const HEADING = 'Projects.';
const INTRO = "Hardware I've designed, built, and debugged: boards, firmware, and the cloud glue in between.";

function ProjectsPage() {
  const [activeId, setActiveId] = useState(null); // the card being hovered (its wire lights up)

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Projects | Ritvik Singh';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="projects-board">
      <ProjectsCircuitry activeId={activeId} />

      <main className="projects-page">
        <header className="projects-page-top">
          <h1 className={`projects-page-heading${activeId ? ' is-lit' : ''}`}>{HEADING}</h1>
          <p className="projects-page-intro">{INTRO}</p>
        </header>

        <section className="projects-page-list" aria-label="All projects">
          {projects.map((project, index) => (
            <FeaturedProject key={project.id} project={project} index={index} onActive={setActiveId} />
          ))}
        </section>
      </main>
    </div>
  );
}

export default ProjectsPage;