import Header from '../components/Header';
import Projects from '../components/Projects';
import Contact from '../components/Contact';

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Projects limit={3} showAllLink />
        <Contact />
      </main>
    </>
  );
}

export default HomePage;