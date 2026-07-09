import { useState } from 'react';
import { KeyRound, Globe, Loader2, ExternalLink } from 'lucide-react';
import type { ImmichCredentials } from '@shared/types';
import { AppMark, Wordmark } from './Logo';

interface Props {
  onLogin: (c: ImmichCredentials) => Promise<void>;
}

export function Login({ onLogin }: Props) {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const cleanUrl = url.trim().replace(/\/+$/, '');
      const cleanKey = apiKey.trim();
      if (!cleanUrl) throw new Error('Enter your server URL.');
      if (!cleanKey) throw new Error('Enter your API key.');
      // Quick sanity check against the server.
      const info = await window.immich.serverInfo({ url: cleanUrl, apiKey: cleanKey });
      if (!info.ok) {
        throw new Error(info.raw || "Couldn't reach the server.");
      }
      await onLogin({ url: cleanUrl, apiKey: cleanKey });
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="drag h-10 flex-shrink-0" />
      <div className="flex-1 overflow-auto flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex flex-col items-center text-center mb-9">
            <AppMark size={76} className="mb-5 drop-shadow-xl" />
            <Wordmark className="text-2xl" />
            <p className="text-sm text-text-muted mt-3 max-w-xs">
              Connect to your Immich server to upload photos and videos in bulk — no terminal
              required.
            </p>
          </div>

          <form onSubmit={submit} className="glass rounded-3xl p-6 no-drag">
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
              Server URL
            </label>
            <div className="relative mb-5">
              <Globe
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
              />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://immich.example.com"
                autoFocus
                className="focus-ring w-full glass-inset rounded-xl pl-10 pr-3 py-2.5 text-sm placeholder:text-text-subtle"
              />
            </div>

            <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
              API key
            </label>
            <div className="relative mb-5">
              <KeyRound
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
              />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="••••••••••••••••"
                className="focus-ring w-full glass-inset rounded-xl pl-10 pr-3 py-2.5 text-sm placeholder:text-text-subtle font-mono"
              />
            </div>

            {error && (
              <div className="mb-5 p-3 bg-err/10 border border-err/30 rounded-xl text-sm text-err break-words selectable">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full rounded-xl py-2.5 font-medium text-sm flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying…
                </>
              ) : (
                'Connect'
              )}
            </button>

            <div className="mt-5 pt-5 border-t border-[var(--inset-border)] text-xs text-text-muted text-center">
              <button
                type="button"
                onClick={() =>
                  window.immich.openExternal(
                    'https://immich.app/docs/features/command-line-interface'
                  )
                }
                className="inline-flex items-center gap-1 hover:text-text transition-colors"
              >
                How to get an API key
                <ExternalLink size={12} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
