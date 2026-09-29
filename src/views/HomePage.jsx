import { useState } from 'react';
import Header from '../components/Header';
import Projects from '../components/Projects';
import './HomePage.css';

function HomePage() {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <Header />

      <main>
        <div className="home">
          <section id="about" className="home-about">
            <h2>About</h2>
            <p>
              I'm learning by building things I actually want to use. This site is
              one of them, and I coded it myself.
            </p>

            {showMore && (
              <p>
                Most of my work lives in analog and digital circuitry, with some
                firmware and tooling around it.
              </p>
            )}

            <button
              className="home-button"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? 'Show less' : 'Read more'}
            </button>
          </section>
        </div>

        <Projects />
      </main>
    </>
  );
}

export default HomePage;