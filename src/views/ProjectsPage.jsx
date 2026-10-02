import { useEffect } from 'react';
import Projects from '../components/Projects';
import './ProjectsPage.css';

function ProjectsPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Projects | Ritvik Singh';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="projects-page">
      <Projects heading="all projects" headingTag="h1" />
    </main>
  );
}

export default ProjectsPage;