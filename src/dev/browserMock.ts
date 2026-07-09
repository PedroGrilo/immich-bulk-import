/**
 * Dev-only stub for the Electron `window.immich` bridge.
 *
 * It is imported *only* when running in a plain browser (e.g. the Preview
 * panel / `vite dev` opened outside Electron) and behind `import.meta.env.DEV`,
 * so it is tree-shaken out of the production bundle entirely. In the packaged
 * app the real bridge is always provided by electron/preload.ts.
 */
import type { ImmichApi } from '../../electron/preload';

export function installBrowserMock() {
  // `?login` starts signed-out so the login screen can be previewed.
  let creds: { url: string; apiKey: string } | null = new URLSearchParams(
    window.location.search
  ).has('login')
    ? null
    : { url: 'https://immich.example.com', apiKey: 'demo-api-key' };

  const listeners = {
    log: [] as ((e: any) => void)[],
    progress: [] as ((e: any) => void)[],
    status: [] as ((e: any) => void)[],
  };

  const api: ImmichApi = {
    getAppVersion: async () => '0.1.0-dev',
    authGet: async () => creds,
    authSave: async (c) => {
      creds = c;
      return true;
    },
    authClear: async () => {
      creds = null;
      return true;
    },
    chooseDirs: async () => ({
      ok: true,
      data: ['/Users/demo/Pictures/2024', '/Users/demo/Pictures/Trips'],
    }),
    chooseFiles: async () => ({
      ok: true,
      data: ['/Users/demo/Pictures/IMG_0001.jpg', '/Users/demo/Pictures/IMG_0002.heic'],
    }),
    serverInfo: async (c) => ({
      ok: true,
      raw: `Immich server: ${c.url}\nversion: 1.118.0\nstorage: 240 GB free`,
      version: '1.118.0',
      url: c.url,
    }),
    startUpload: (jobId) => {
      listeners.status.forEach((cb) => cb({ jobId, status: 'starting' }));
      let current = 0;
      const total = 24;
      listeners.status.forEach((cb) => cb({ jobId, status: 'running' }));
      const timer = setInterval(() => {
        current += 3;
        listeners.log.forEach((cb) =>
          cb({ jobId, level: 'cli', text: `Uploading assets | ${current}/${total}`, ts: Date.now() })
        );
        listeners.progress.forEach((cb) =>
          cb({
            jobId,
            current,
            total,
            percent: Math.round((current / total) * 100),
            eta: `${Math.max(0, total - current)}s`,
            message: `Uploading assets | ${current}/${total}`,
          })
        );
        if (current >= total) {
          clearInterval(timer);
          listeners.log.forEach((cb) =>
            cb({ jobId, level: 'success', text: 'Done. 24 uploaded, 0 skipped.', ts: Date.now() })
          );
          listeners.status.forEach((cb) => cb({ jobId, status: 'done', exitCode: 0 }));
        }
      }, 350);
    },
    cancelJob: async () => true,
    openExternal: async (url) => {
      window.open(url, '_blank');
      return true;
    },
    onJobLog: (cb) => {
      listeners.log.push(cb);
      return () => (listeners.log = listeners.log.filter((f) => f !== cb));
    },
    onJobProgress: (cb) => {
      listeners.progress.push(cb);
      return () => (listeners.progress = listeners.progress.filter((f) => f !== cb));
    },
    onJobStatus: (cb) => {
      listeners.status.push(cb);
      return () => (listeners.status = listeners.status.filter((f) => f !== cb));
    },
  };

  (window as any).immich = api;
}
