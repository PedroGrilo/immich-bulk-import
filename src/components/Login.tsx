import { useState } from 'react';
import { KeyRound, Globe, Loader2, ExternalLink } from 'lucide-react';
import type { ImmichCredentials } from '@shared/types';

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
      if (!cleanUrl) throw new Error('Indica o URL do servidor');
      if (!cleanKey) throw new Error('Indica a tua API key');
      // Quick sanity check
      const info = await window.immich.serverInfo({ url: cleanUrl, apiKey: cleanKey });
      if (!info.ok) {
        throw new Error(info.raw || 'Não consegui falar com o servidor.');
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
          <div className="text-center mb-10">
            <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center text-white text-2xl font-bold mb-4 shadow-glow">
              i
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Immich GUI</h1>
            <p className="text-sm text-text-muted mt-2">
              Liga-te ao teu servidor Immich para fazer upload visualmente
            </p>
          </div>

          <form
            onSubmit={submit}
            className="bg-bg-surface border border-bg-border rounded-2xl p-6 shadow-card no-drag"
          >
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
              URL do servidor
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
                placeholder="https://immich.exemplo.pt"
                autoFocus
                className="focus-ring w-full bg-bg-elev border border-bg-border rounded-lg pl-10 pr-3 py-2.5 text-sm placeholder:text-text-subtle"
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
                className="focus-ring w-full bg-bg-elev border border-bg-border rounded-lg pl-10 pr-3 py-2.5 text-sm placeholder:text-text-subtle font-mono"
              />
            </div>

            {error && (
              <div className="mb-5 p-3 bg-err/10 border border-err/30 rounded-lg text-sm text-err break-words selectable">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  A verificar…
                </>
              ) : (
                'Ligar ao servidor'
              )}
            </button>

            <div className="mt-5 pt-5 border-t border-bg-border text-xs text-text-muted text-center">
              <button
                type="button"
                onClick={() =>
                  window.immich.openExternal(
                    'https://immich.app/docs/features/command-line-interface'
                  )
                }
                className="inline-flex items-center gap-1 hover:text-text"
              >
                Como obter uma API key
                <ExternalLink size={12} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
