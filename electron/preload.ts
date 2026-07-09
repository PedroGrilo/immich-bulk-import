import { contextBridge, ipcRenderer } from 'electron';
import type {
  ImmichCredentials,
  ServerInfo,
  UploadOptions,
  DialogResult,
} from '../shared/types';

const api = {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:get-version'),

  // ---------- Auth ----------
  authGet: (): Promise<ImmichCredentials | null> => ipcRenderer.invoke('auth:get'),
  authSave: (c: ImmichCredentials): Promise<boolean> =>
    ipcRenderer.invoke('auth:save', c),
  authClear: (): Promise<boolean> => ipcRenderer.invoke('auth:clear'),

  // ---------- Dialogs ----------
  chooseDirs: (): Promise<DialogResult<string[]>> =>
    ipcRenderer.invoke('dialog:choose-dirs'),
  chooseFiles: (): Promise<DialogResult<string[]>> =>
    ipcRenderer.invoke('dialog:choose-files'),

  // ---------- Immich ----------
  serverInfo: (c: ImmichCredentials): Promise<ServerInfo> =>
    ipcRenderer.invoke('immich:server-info', c),

  startUpload: (jobId: string, creds: ImmichCredentials, opts: UploadOptions): void => {
    ipcRenderer.send('immich:upload', { jobId, creds, opts });
  },

  cancelJob: (jobId: string): Promise<boolean> =>
    ipcRenderer.invoke('immich:cancel', jobId),

  openExternal: (url: string): Promise<boolean> =>
    ipcRenderer.invoke('app:open-external', url),

  // ---------- Subscriptions ----------
  onJobLog: (cb: (e: { jobId: string; level: string; text: string; ts: number }) => void) => {
    const handler = (_: unknown, data: any) => cb(data);
    ipcRenderer.on('job:log', handler);
    return () => {
      ipcRenderer.removeListener('job:log', handler);
    };
  },
  onJobProgress: (cb: (e: { jobId: string; current?: number; total?: number; percent?: number; eta?: string; message?: string }) => void) => {
    const handler = (_: unknown, data: any) => cb(data);
    ipcRenderer.on('job:progress', handler);
    return () => {
      ipcRenderer.removeListener('job:progress', handler);
    };
  },
  onJobStatus: (cb: (e: { jobId: string; status: string; exitCode?: number; error?: string }) => void) => {
    const handler = (_: unknown, data: any) => cb(data);
    ipcRenderer.on('job:status', handler);
    return () => {
      ipcRenderer.removeListener('job:status', handler);
    };
  },
};

contextBridge.exposeInMainWorld('immich', api);

export type ImmichApi = typeof api;
