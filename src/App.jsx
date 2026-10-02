import { Routes, Route } from 'react-router';
import './App.css';
import Nav from './components/Nav.jsx';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './views/HomePage';
import NotFoundPage from './views/NotFoundPage';

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;