import { useEffect, useState } from 'react';
import Editor from './pages/Editor';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  const [currentView, setCurrentView] = useState(window.location.hash);

  useEffect(() => {
    const updateView = () => setCurrentView(window.location.hash);
    window.addEventListener('popstate', updateView);
    window.addEventListener('hashchange', updateView);
    return () => {
      window.removeEventListener('popstate', updateView);
      window.removeEventListener('hashchange', updateView);
    };
  }, []);

  function openEditor() {
    window.history.pushState({}, '', '#editor');
    setCurrentView('#editor');
  }

  if (currentView === '#editor') return <Editor />;
  if (currentView === '#about') return <About />;
  return <Home onCreate={openEditor} />;
}

export default App;