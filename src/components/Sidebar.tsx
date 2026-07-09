import { Upload, Server, Info, LogOut, GraduationCap } from 'lucide-react';
import { AppMark, Wordmark } from './Logo';

export type View = 'upload' | 'server' | 'tutorial' | 'about';

interface Props {
  current: View;
  onChange: (v: View) => void;
  onLogout: () => void;
  url: string;
}

const items: { id: View; label: string; icon: typeof Upload }[] = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'server', label: 'Server', icon: Server },
  { id: 'tutorial', label: 'Tutorial', icon: GraduationCap },
  { id: 'about', label: 'About', icon: Info },
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
    <aside className="w-64 glass border-y-0 border-l-0 flex flex-col flex-shrink-0 rounded-none">
      <div className="drag h-10 flex-shrink-0" />

      <div className="px-5 pb-5 pt-1">
        <div className="flex items-center gap-3">
          <AppMark size={36} />
          <Wordmark className="text-[15px] leading-tight" />
        </div>
        <div
          className="text-[11px] text-text-subtle mt-2 pl-[3px] truncate"
          title={url}
        >
          {host}
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
                'no-drag flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition-colors',
                active
                  ? 'glass-inset text-text font-medium shadow-sm'
                  : 'text-text-muted hover:text-text hover-wash border border-transparent',
              ].join(' ')}
            >
              <Icon size={17} className={active ? 'text-accent' : ''} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3">
        <button
          onClick={onLogout}
          className="no-drag w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted hover:text-err hover:bg-err/10 transition-colors"
        >
          <LogOut size={17} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
