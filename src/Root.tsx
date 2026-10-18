// ============================================================================
// Top-level router (no lib): Landing homepage <-> live App demo.
// The URL hash (#demo / #home) keeps the choice bookmarkable & back-button safe.
// ============================================================================
import { useEffect, useState } from 'react';
import Landing from './components/Landing';
import App from './App';

type Screen = 'home' | 'demo';

function screenFromHash(): Screen {
  return window.location.hash.replace('#', '') === 'demo' ? 'demo' : 'home';
}

export default function Root() {
  const [screen, setScreen] = useState<Screen>(() => screenFromHash());

  useEffect(() => {
    const onHash = () => setScreen(screenFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (s: Screen) => {
    window.location.hash = s === 'demo' ? 'demo' : 'home';
    setScreen(s);
    window.scrollTo(0, 0);
  };

  if (screen === 'demo') return <App onHome={() => go('home')} />;
  return <Landing onLaunch={() => go('demo')} />;
}
