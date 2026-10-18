import { useState } from 'react';
import Circuitry from '../components/Circuitry';
import Header from '../components/Header';
import Projects from '../components/Projects';
import Toolkit from '../components/Toolkit';
import Contact from '../components/Contact';

function HomePage() {
  // The tool currently lit by the toolkit (shared with the cards and the wires)
  const [activeTool, setActiveTool] = useState(null);

  return (
    <div className="home">
      <Circuitry activeTool={activeTool} />
      <Header />
      <main>
        <Projects activeTool={activeTool} />
        <Toolkit activeTool={activeTool} onToolChange={setActiveTool} />
        <Contact />
      </main>
    </div>
  );
}

export default HomePage;