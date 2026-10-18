import { useState } from 'react';
import Header from '../components/Header';
import Projects from '../components/Projects';
import Toolkit from '../components/Toolkit';
import Contact from '../components/Contact';

function HomePage() {
  // The tool currently lit by the toolkit (shared so project cards can glow too)
  const [activeTool, setActiveTool] = useState(null);

  return (
    <>
      <Header />
      <main>
        <Projects activeTool={activeTool} />
        <Toolkit activeTool={activeTool} onToolChange={setActiveTool} />
        <Contact />
      </main>
    </>
  );
}

export default HomePage;