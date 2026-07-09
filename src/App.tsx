import { useEffect, useState } from 'react';
import type { ImmichCredentials } from '@shared/types';
import { Sidebar, type View } from './components/Sidebar';
import { Login } from './components/Login';
import { ServerInfo } from './components/ServerInfo';
import { Upload } from './components/Upload';
import { About } from './components/About';

export default function App() {
  const [creds, setCreds] = useState<ImmichCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('upload');

  useEffect(() => {
    window.immich.authGet().then((c) => {
      setCreds(c);
      setLoading(false);
    });
  }, []);

  const handleLogin = async (c: ImmichCredentials) => {
    await window.immich.authSave(c);
    setCreds(c);
    setView('server');
  };

  const handleLogout = async () => {
    await window.immich.authClear();
    setCreds(null);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!creds) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-full w-full flex bg-bg">
      <Sidebar current={view} onChange={setView} onLogout={handleLogout} url={creds.url} />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="drag h-10 flex-shrink-0" />
        <div className="flex-1 overflow-auto">
          {view === 'upload' && <Upload creds={creds} />}
          {view === 'server' && <ServerInfo creds={creds} />}
          {view === 'about' && <About />}
        </div>
      </main>
    </div>
  );
}
