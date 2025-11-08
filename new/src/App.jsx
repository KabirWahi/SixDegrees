import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import HomeView from './views/HomeView.jsx';
import ModeSelectView from './views/ModeSelectView.jsx';
import QuickPlayView from './views/QuickPlayView.jsx';
import TimedModeView from './views/TimedModeView.jsx';
import { pingForPlay, warmOnRender } from './utils/apiWarmup.js';

const App = () => {
  const [view, setView] = useState('home');
  const [playLoading, setPlayLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    warmOnRender();
  }, []);

  const handleSelectMode = useCallback(
    (mode) => {
      if (mode === 'Quick Play') {
        setView('quick-play');
      } else if (mode === 'Time Trial') {
        setView('time-trial');
      }
    },
    [setView],
  );

  const handlePlay = useCallback(async () => {
    if (playLoading) return;

    setPlayLoading(true);
    try {
      const success = await pingForPlay();
      if (success) {
        setView('modes');
        return;
      }

      toast({
        title: 'Server still waking up',
        description: 'Give it another try in a few seconds.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Unable to reach server',
        description: 'Please check your connection and try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setPlayLoading(false);
    }
  }, [playLoading, setView, toast]);

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

  if (view === 'time-trial') {
    return <TimedModeView onBack={() => setView('modes')} />;
  }

  return (
    <HomeView
      onPlay={handlePlay}
      onLearnMore={() => setView('learn')}
      isPlayLoading={playLoading}
    />
  );
};

export default App;
