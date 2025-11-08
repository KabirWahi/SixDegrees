import { useEffect, useState } from 'react';
import HomeView from './views/HomeView.jsx';
import QuickPlayView from './views/QuickPlayView.jsx';
import TimedModeView from './views/TimedModeView.jsx';
import ExplorerView from './views/ExplorerView.jsx';
import LearnMoreView from './views/LearnMoreView.jsx';
import { warmOnRender } from './utils/apiWarmup.js';

const App = () => {
  const [view, setView] = useState('home');

  useEffect(() => {
    warmOnRender();
  }, []);

  if (view === 'quick-play') {
    return <QuickPlayView onBack={() => setView('home')} />;
  }

  if (view === 'time-trial') {
    return <TimedModeView onBack={() => setView('home')} />;
  }

  if (view === 'explorer') {
    return <ExplorerView onBack={() => setView('home')} />;
  }

  if (view === 'learn') {
    return (
      <LearnMoreView
        onBack={() => setView('home')}
      />
    );
  }

  return (
    <HomeView
      onSelectMode={(modeView) => setView(modeView)}
      onLearnMore={() => setView('learn')}
    />
  );
};

export default App;
