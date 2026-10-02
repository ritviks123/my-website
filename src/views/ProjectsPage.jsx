import { useEffect } from 'react';
import { projects } from '../data/projects';
import FeaturedProject from '../components/FeaturedProject';
import MoreWork from '../components/MoreWork';
import './ProjectsPage.css';

function ProjectsPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Projects | Ritvik Singh';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <main className="projects-page">
      <header className="projects-intro">
        <p className="projects-eyebrow">
          <span aria-hidden="true">// </span>projects
        </p>
        <h1>Hardware I've designed, built, and debugged.</h1>
        <p className="projects-lede">
          Circuits, embedded systems, and the software that ties them together.
          Open any project for the full write-up.
        </p>
      </header>

      <section className="projects-featured" aria-label="Featured projects">
        {featuredProjects.map((project, index) => (
          <FeaturedProject key={project.id} project={project} index={index} />
        ))}
      </section>

      <MoreWork />
    </main>
  );
}

export default ProjectsPage;