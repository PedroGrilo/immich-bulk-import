import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Trash2, Copy, Check } from 'lucide-react';

export interface LogLine {
  level: 'info' | 'warn' | 'error' | 'success' | 'cli';
  text: string;
  ts: number;
}

const colorByLevel: Record<LogLine['level'], string> = {
  info: 'text-text-muted',
  warn: 'text-warn',
  error: 'text-err',
  success: 'text-ok',
  cli: 'text-text',
};

export function LogPane({ logs }: { logs: LogLine[] }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const onScroll = () => {
    if (!ref.current) return;
    const el = ref.current;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
    setAutoScroll(atBottom);
  };

  const copy = async () => {
    const text = logs.map((l) => l.text).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-bg-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Logs
        </h2>
        <div className="flex items-center gap-1">
          {!autoScroll && (
            <button
              onClick={() => {
                setAutoScroll(true);
                if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
              }}
              className="text-xs text-text-muted hover:text-text flex items-center gap-1 px-2 py-1 rounded hover:bg-bg-elev"
              title="Voltar ao fim"
            >
              <ChevronDown size={12} />
              Seguir
            </button>
          )}
          <button
            onClick={copy}
            disabled={logs.length === 0}
            className="text-xs text-text-muted hover:text-text flex items-center gap-1 px-2 py-1 rounded hover:bg-bg-elev disabled:opacity-30"
            title="Copiar"
          >
            {copied ? <Check size={12} className="text-ok" /> : <Copy size={12} />}
          </button>
        </div>
      </header>
      <div
        ref={ref}
        onScroll={onScroll}
        className="bg-bg-elev font-mono text-[11px] leading-relaxed p-4 overflow-auto max-h-80 selectable"
      >
        {logs.length === 0 ? (
          <div className="text-text-subtle italic">Sem output ainda…</div>
        ) : (
          logs.map((l, i) => (
            <div key={i} className={`whitespace-pre-wrap break-all ${colorByLevel[l.level]}`}>
              {l.text}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
