import { useEffect, useState } from 'react';
import type { ImmichCredentials } from '@shared/types';
import { Sidebar, type View } from './components/Sidebar';
import { Login } from './components/Login';
import { ServerInfo } from './components/ServerInfo';
import { Upload } from './components/Upload';
import { Tutorial } from './components/Tutorial';
import { About } from './components/About';

const TUTORIAL_SEEN_KEY = 'ibi.tutorialSeen';

export default function App() {
  const [creds, setCreds] = useState<ImmichCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('upload');

  useEffect(() => {
    window.immich.authGet().then((c) => {
      setCreds(c);
      if (c && localStorage.getItem(TUTORIAL_SEEN_KEY) !== '1') {
        setView('tutorial');
      }
      setLoading(false);
    });
  }, []);

  const handleLogin = async (c: ImmichCredentials) => {
    await window.immich.authSave(c);
    setCreds(c);
    // First-time users land on the tutorial; returning users on upload.
    setView(localStorage.getItem(TUTORIAL_SEEN_KEY) === '1' ? 'upload' : 'tutorial');
  };

  const handleLogout = async () => {
    await window.immich.authClear();
    setCreds(null);
  };

  const markTutorialSeen = () => localStorage.setItem(TUTORIAL_SEEN_KEY, '1');

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="h-9 w-9 rounded-full border-[3px] border-accent/30 border-t-accent animate-spin" />
      </div>
    );
  }

  if (!creds) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-full w-full flex">
      <Sidebar current={view} onChange={setView} onLogout={handleLogout} url={creds.url} />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="drag h-10 flex-shrink-0" />
        <div className="flex-1 overflow-auto">
          {view === 'upload' && <Upload creds={creds} />}
          {view === 'server' && <ServerInfo creds={creds} />}
          {view === 'tutorial' && (
            <Tutorial
              onStart={() => {
                markTutorialSeen();
                setView('upload');
              }}
              onSeen={markTutorialSeen}
            />
          )}
          {view === 'about' && <About />}
        </div>
      </main>
    </div>
  );
}
