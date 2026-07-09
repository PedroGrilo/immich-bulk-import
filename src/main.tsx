import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

async function boot() {
  // In a plain browser (dev preview) there is no Electron preload bridge —
  // install a stub so the UI can render. Stripped from production builds.
  if (import.meta.env.DEV && !window.immich) {
    const { installBrowserMock } = await import('./dev/browserMock');
    installBrowserMock();
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

boot();
