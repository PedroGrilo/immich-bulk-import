import { Upload, Server, Info, LogOut } from 'lucide-react';

export type View = 'upload' | 'server' | 'about';

interface Props {
  current: View;
  onChange: (v: View) => void;
  onLogout: () => void;
  url: string;
}

const items: { id: View; label: string; icon: typeof Upload }[] = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'server', label: 'Servidor', icon: Server },
  { id: 'about', label: 'Sobre', icon: Info },
];

export function Sidebar({ current, onChange, onLogout, url }: Props) {
  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  })();

  return (
    <aside className="w-60 bg-bg-surface border-r border-bg-border flex flex-col flex-shrink-0">
      <div className="drag h-10 flex-shrink-0" />
      <div className="px-5 pb-4 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            i
          </div>
          <div>
            <div className="font-semibold text-sm leading-none">Immich GUI</div>
            <div className="text-[11px] text-text-muted mt-1 truncate max-w-[140px]" title={url}>
              {host}
            </div>
          </div>
        </div>
      </div>

      <nav className="px-3 flex-1 flex flex-col gap-1">
        {items.map(({ id, label, icon: Icon }) => {
          const active = current === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={[
                'no-drag flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left',
                active
                  ? 'bg-accent/15 text-text border border-accent/30'
                  : 'text-text-muted hover:text-text hover:bg-bg-elev border border-transparent',
              ].join(' ')}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3">
        <button
          onClick={onLogout}
          className="no-drag w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted hover:text-err hover:bg-err/10 transition-colors"
        >
          <LogOut size={16} />
          <span>Terminar sessão</span>
        </button>
      </div>
    </aside>
  );
}
