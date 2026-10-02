import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { projects } from '../data/projects';
import NotFoundPage from './NotFoundPage';
import './ProjectPage.css';

function ProjectPage() {
  const { projectId } = useParams();
  const project = projects.find((item) => item.id === projectId);

  useEffect(() => {
    if (!project) return;
    const previousTitle = document.title;
    document.title = `${project.title} | Ritvik Singh`;
    return () => {
      document.title = previousTitle;
    };
  }, [project]);

  if (!project) {
    return <NotFoundPage />;
  }

  return (
    <main className="article">
      <Link to="/projects" className="article-back">
        <span aria-hidden="true">← </span>All projects
      </Link>

      <header className="article-header">
        <p className="article-meta">
          <span className="article-category">{project.category}</span>
          <span aria-hidden="true">·</span>
          <span>{project.year}</span>
        </p>

        <h1>{project.title}</h1>
        <p className="article-blurb">{project.blurb}</p>

        {project.tags?.length > 0 && (
          <ul className="article-tags">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </header>

      {project.image ? (
        <img
          className="article-image"
          src={project.image}
          alt={project.imageAlt || ''}
        />
      ) : (
        <div className="article-image article-image-empty" aria-hidden="true">
          <span>{project.category}</span>
        </div>
      )}

      {project.article?.map((section) => (
        <section className="article-section" key={section.heading}>
          <h2>{section.heading}</h2>
          {section.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      ))}

      {project.repo && (
        <a
          href={project.repo}
          className="article-repo"
          target="_blank"
          rel="noopener noreferrer"
        >
          View code on GitHub <span aria-hidden="true">↗</span>
        </a>
      )}
    </main>
  );
}

export default ProjectPage;