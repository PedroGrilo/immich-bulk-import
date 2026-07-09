import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import Store from 'electron-store';
import { runImmich, cancelJob } from './immich-runner';
import type {
  ImmichCredentials,
  ServerInfo,
  UploadOptions,
  DialogResult,
} from '../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.APP_ROOT = path.join(__dirname, '..');
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

interface StoreSchema {
  credentials?: ImmichCredentials;
  lastUpload?: Partial<UploadOptions>;
  configDir?: string;
}

const store = new Store<StoreSchema>({
  name: 'immich-gui-config',
  encryptionKey: 'immich-gui-local-only',
});

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#0b0d12',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    vibrancy: 'under-window',
    visualEffectState: 'active',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
  if (process.env.IMMICH_GUI_DEBUG === '1') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error('[renderer] did-fail-load', { code, desc, url });
  });
  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    console.error('[renderer] render-process-gone', details);
  });
  mainWindow.webContents.on('console-message', (_e, level, message, line, source) => {
    console.log(`[renderer:${level}] ${source}:${line} ${message}`);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  registerIpc();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function registerIpc() {
  ipcMain.handle('app:get-version', () => app.getVersion());

  ipcMain.handle('auth:get', () => store.get('credentials') ?? null);

  ipcMain.handle('auth:save', (_e, creds: ImmichCredentials) => {
    store.set('credentials', creds);
    return true;
  });

  ipcMain.handle('auth:clear', () => {
    store.delete('credentials');
    return true;
  });

  ipcMain.handle('dialog:choose-dirs', async (): Promise<DialogResult<string[]>> => {
    if (!mainWindow) return { ok: false, error: 'No window' };
    const res = await dialog.showOpenDialog(mainWindow, {
      title: 'Escolher pastas para upload',
      properties: ['openDirectory', 'multiSelections', 'createDirectory'],
    });
    if (res.canceled) return { ok: false };
    return { ok: true, data: res.filePaths };
  });

  ipcMain.handle('dialog:choose-files', async (): Promise<DialogResult<string[]>> => {
    if (!mainWindow) return { ok: false, error: 'No window' };
    const res = await dialog.showOpenDialog(mainWindow, {
      title: 'Escolher fotos / vídeos para upload',
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'Imagens e vídeos',
          extensions: [
            'jpg', 'jpeg', 'png', 'heic', 'heif', 'gif', 'tif', 'tiff',
            'webp', 'avif', 'bmp', 'raw', 'arw', 'cr2', 'cr3', 'nef',
            'dng', 'orf', 'rw2', 'mp4', 'mov', 'avi', 'mkv', 'm4v',
            '3gp', 'webm', 'mpg', 'mpeg', 'wmv',
          ],
        },
        { name: 'Todos os ficheiros', extensions: ['*'] },
      ],
    });
    if (res.canceled) return { ok: false };
    return { ok: true, data: res.filePaths };
  });

  ipcMain.handle(
    'immich:server-info',
    async (_e, creds: ImmichCredentials): Promise<ServerInfo> => {
      const out: string[] = [];
      const exitCode = await runImmich({
        creds,
        args: ['server-info'],
        onStdout: (l) => out.push(l),
        onStderr: (l) => out.push(l),
      });
      const raw = out.join('\n');
      const versionMatch = raw.match(/version[^\d]*([\d.]+)/i);
      return {
        ok: exitCode === 0,
        raw,
        version: versionMatch?.[1],
        url: creds.url,
      };
    }
  );

  ipcMain.on(
    'immich:upload',
    async (event, payload: { jobId: string; creds: ImmichCredentials; opts: UploadOptions }) => {
      const { jobId, creds, opts } = payload;
      store.set('lastUpload', { ...opts, paths: [] });

      const args: string[] = ['upload'];
      if (opts.recursive) args.push('--recursive');
      if (opts.includeHidden) args.push('--include-hidden');
      if (opts.skipHash) args.push('--skip-hash');
      if (opts.album) args.push('--album');
      if (opts.albumName && opts.albumName.trim()) {
        args.push('--album-name', opts.albumName.trim());
      }
      if (opts.ignore && opts.ignore.trim()) {
        args.push('--ignore', opts.ignore.trim());
      }
      if (opts.dryRun) args.push('--dry-run');
      if (opts.concurrency && opts.concurrency !== 4) {
        args.push('--concurrency', String(opts.concurrency));
      }
      if (opts.deleteAfter) args.push('--delete');
      if (opts.deleteDuplicates) args.push('--delete-duplicates');
      if (opts.watch) args.push('--watch');
      if (opts.jsonOutput) args.push('--json-output');
      // We always want to see progress; the renderer parses it.
      // (CLI shows progress by default — only disable when explicitly asked)

      args.push(...opts.paths);

      const send = (channel: string, data: unknown) =>
        event.sender.send(channel, data);

      send('job:status', { jobId, status: 'starting' });

      try {
        const exitCode = await runImmich({
          creds,
          args,
          jobId,
          onStdout: (line) => {
            send('job:log', { jobId, level: 'cli', text: line, ts: Date.now() });
            const prog = parseProgress(line);
            if (prog) send('job:progress', { jobId, ...prog });
          },
          onStderr: (line) => {
            const level = /error|fail/i.test(line) ? 'error' : 'warn';
            send('job:log', { jobId, level, text: line, ts: Date.now() });
          },
        });

        send('job:status', {
          jobId,
          status: exitCode === 0 ? 'done' : 'failed',
          exitCode,
        });
      } catch (e) {
        send('job:status', {
          jobId,
          status: 'failed',
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
  );

  ipcMain.handle('immich:cancel', (_e, jobId: string) => {
    return cancelJob(jobId);
  });

  ipcMain.handle('app:open-external', (_e, url: string) => {
    shell.openExternal(url);
    return true;
  });
}

function parseProgress(line: string): {
  current?: number;
  total?: number;
  percent?: number;
  rate?: string;
  eta?: string;
  message?: string;
} | null {
  // CLI output examples we try to handle:
  //   "Uploading assets | ████████ | 12/100 (12%) | ETA: 0s"
  //   "100% |████████| 50/50"
  //   "Found 250 new files, 0 duplicates"

  const stripped = line.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '').trim();
  if (!stripped) return null;

  const fraction = stripped.match(/(\d+)\s*\/\s*(\d+)/);
  const percent = stripped.match(/(\d+(?:\.\d+)?)\s*%/);
  const eta = stripped.match(/ETA[:\s]+([0-9hms:.\s]+)/i);

  if (fraction || percent) {
    const cur = fraction ? parseInt(fraction[1], 10) : undefined;
    const tot = fraction ? parseInt(fraction[2], 10) : undefined;
    const pct = percent
      ? parseFloat(percent[1])
      : cur !== undefined && tot
      ? Math.floor((cur / tot) * 100)
      : undefined;
    return {
      current: cur,
      total: tot,
      percent: pct,
      eta: eta?.[1].trim(),
      message: stripped,
    };
  }

  // "Found 25 new files" style
  if (/found\s+\d+/i.test(stripped) || /uploaded|skipped|duplicates/i.test(stripped)) {
    return { message: stripped };
  }

  return null;
}
