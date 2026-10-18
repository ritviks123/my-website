import Header from '../components/Header';
import Projects from '../components/Projects';
import Contact from '../components/Contact';

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Projects showAllLink />
        <Contact />
      </main>
    </>
  );
}

export default HomePage;