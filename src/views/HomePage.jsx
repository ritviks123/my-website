import { useState } from 'react';
import './HomePage.css';

function HomePage() {
  const [showMore, setShowMore] = useState(false);

  return (
    <main className="home">
      <header className="home-hero">
        <h1>Hi, I'm Ritvik</h1>
        <p className="home-tagline">
          I build small projects to figure out how things work.
        </p>
      </header>

      <section className="home-about">
        <h2>About</h2>
        <p>
          I'm learning web development by building things I actually want to
          use. This site is one of them, and I coded it myself.
        </p>

        {showMore && (
          <p>
            Right now I'm working with React and Firebase. Coming next: a
            contact form and a newsletter signup, both built from scratch.
          </p>
        )}

        <button
          className="home-button"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? 'Show less' : 'Read more'}
        </button>
      </section>
    </main>
  );
}

export default HomePage;