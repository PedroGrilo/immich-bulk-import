import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import type { ImmichCredentials, ServerInfo as TServerInfo } from '@shared/types';

export function ServerInfo({ creds }: { creds: ImmichCredentials }) {
  const [info, setInfo] = useState<TServerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const i = await window.immich.serverInfo(creds);
    setInfo(i);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [creds.url, creds.apiKey]);

  return (
    <div className="p-8 max-w-3xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Server</h1>
          <p className="text-sm text-text-muted mt-1 selectable">{creds.url}</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="no-drag btn-glass flex items-center gap-2 px-3 py-2 rounded-xl text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>

      <div className="glass rounded-2xl p-6">
        {loading && !info ? (
          <div className="flex items-center gap-2 text-text-muted">
            <Loader2 size={16} className="animate-spin" />
            Querying server…
          </div>
        ) : info?.ok ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-ok" />
              <span className="font-medium">Server reachable</span>
              {info.version && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                  v{info.version}
                </span>
              )}
            </div>
            <pre className="glass-inset rounded-xl p-4 text-xs font-mono whitespace-pre-wrap break-words selectable text-text-muted max-h-96 overflow-auto">
              {info.raw || '(no response)'}
            </pre>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <XCircle size={18} className="text-err" />
              <span className="font-medium">Couldn’t connect</span>
            </div>
            <pre className="bg-err/5 border border-err/20 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap break-words selectable text-err max-h-96 overflow-auto">
              {info?.raw || 'No details'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
