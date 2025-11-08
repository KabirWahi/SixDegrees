import { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import HomeView from './views/HomeView.jsx';
import QuickPlayView from './views/QuickPlayView.jsx';
import TimedModeView from './views/TimedModeView.jsx';
import ExplorerView from './views/ExplorerView.jsx';
import { warmOnRender } from './utils/apiWarmup.js';

const App = () => {
  const [view, setView] = useState('home');
  const toast = useToast();

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

  return (
    <HomeView
      onSelectMode={(modeView) => setView(modeView)}
      onLearnMore={() =>
        toast({
          title: 'Coming soon',
          description: 'A deeper dive into the dataset is on the way.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      }
    />
  );
};

export default App;
