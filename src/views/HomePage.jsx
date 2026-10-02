import Header from '../components/Header';
import Projects from '../components/Projects';

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Projects limit={3} showAllLink />
      </main>
    </>
  );
}

export default HomePage;