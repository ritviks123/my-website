import { Routes, Route } from 'react-router';
import './App.css';
import Nav from './components/Nav';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './views/HomePage';
import ProjectsPage from './views/ProjectsPage';
import ProjectPage from './views/ProjectPage';
import NotFoundPage from './views/NotFoundPage';

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <Nav />
        <div className="App-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
    </div>
  );
}

export default App;