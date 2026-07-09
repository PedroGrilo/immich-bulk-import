import type { ImmichApi } from '../electron/preload';

declare global {
  interface Window {
    immich: ImmichApi;
  }
}

export {};
