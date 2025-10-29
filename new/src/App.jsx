import { useCallback, useState } from 'react';
import HomeView from './views/HomeView.jsx';
import ModeSelectView from './views/ModeSelectView.jsx';
import QuickPlayView from './views/QuickPlayView.jsx';

const App = () => {
  const [view, setView] = useState('home');

  const handleSelectMode = useCallback(
    (mode) => {
      if (mode === 'Quick Play') {
        setView('quick-play');
      }
    },
    [],
  );

  if (view === 'modes') {
    return (
      <ModeSelectView
        onBack={() => setView('home')}
        onSelectMode={handleSelectMode}
      />
    );
  }

  if (view === 'quick-play') {
    return <QuickPlayView onBack={() => setView('modes')} />;
  }

  return (
    <HomeView
      onPlay={() => setView('modes')}
      onLearnMore={() => setView('learn')}
    />
  );
};

export default App;
