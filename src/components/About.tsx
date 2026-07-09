import { useEffect, useState } from 'react';
import { ExternalLink, Heart } from 'lucide-react';
import { AppMark, Wordmark } from './Logo';

export function About() {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    window.immich.getAppVersion().then(setVersion);
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto animate-slide-up">
      <div className="flex flex-col items-center text-center mb-8">
        <AppMark size={72} className="mb-4 drop-shadow-xl" />
        <Wordmark className="text-2xl" />
        {version && <p className="text-sm text-text-muted mt-2">Version {version}</p>}
      </div>

      <div className="glass rounded-2xl p-6 space-y-4 text-sm">
        <p className="text-text-muted leading-relaxed">
          A graphical interface for the official Immich CLI. Upload photos and videos in bulk,
          visually — without ever touching the terminal.
        </p>
        <div className="flex flex-col gap-1">
          <Link href="https://immich.app">Immich website</Link>
          <Link href="https://docs.immich.app/features/command-line-interface">
            CLI documentation
          </Link>
          <Link href="https://github.com/immich-app/immich">Immich source (GitHub)</Link>
        </div>
        <div className="pt-4 mt-4 border-t border-[var(--inset-border)] text-xs text-text-muted flex items-center justify-center gap-1.5">
          Made with <Heart size={12} className="text-err fill-err" /> for macOS.
        </div>
      </div>
    </div>
  );
}

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <button
      onClick={() => window.immich.openExternal(href)}
      className="flex items-center justify-between gap-2 text-left rounded-xl px-3 py-2 -mx-3 hover-wash transition-colors"
    >
      <span>{children}</span>
      <ExternalLink size={13} className="text-text-subtle" />
    </button>
  );
}
