export interface ImmichCredentials {
  url: string;
  apiKey: string;
}

export interface ServerInfo {
  ok: boolean;
  raw: string;
  version?: string;
  url?: string;
}

export interface UploadOptions {
  paths: string[];
  recursive: boolean;
  includeHidden: boolean;
  skipHash: boolean;
  album: boolean;
  albumName?: string;
  ignore?: string;
  dryRun: boolean;
  concurrency: number;
  deleteAfter: boolean;
  deleteDuplicates: boolean;
  watch: boolean;
  jsonOutput: boolean;
}

export const defaultUploadOptions: UploadOptions = {
  paths: [],
  recursive: true,
  includeHidden: false,
  skipHash: false,
  album: false,
  albumName: undefined,
  ignore: undefined,
  dryRun: false,
  concurrency: 4,
  deleteAfter: false,
  deleteDuplicates: false,
  watch: false,
  jsonOutput: false,
};

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'cli';

export interface LogEvent {
  jobId: string;
  level: LogLevel;
  text: string;
  ts: number;
}

export interface JobStatus {
  jobId: string;
  status: 'starting' | 'running' | 'done' | 'failed' | 'cancelled';
  exitCode?: number;
  error?: string;
}

export interface UploadProgress {
  jobId: string;
  current?: number;
  total?: number;
  percent?: number;
  rate?: string;
  eta?: string;
  message?: string;
}

export interface DialogResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export type IpcChannel =
  | 'auth:get'
  | 'auth:save'
  | 'auth:clear'
  | 'immich:server-info'
  | 'immich:upload'
  | 'immich:cancel'
  | 'dialog:choose-dirs'
  | 'dialog:choose-files'
  | 'app:open-external'
  | 'app:get-version';
