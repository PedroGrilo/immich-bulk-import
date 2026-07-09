import { useEffect, useState } from 'react';
import { ExternalLink, Heart } from 'lucide-react';

export function About() {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    window.immich.getAppVersion().then(setVersion);
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto animate-slide-up">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-glow mb-4">
          i
        </div>
        <h1 className="text-2xl font-semibold">Immich GUI</h1>
        {version && <p className="text-sm text-text-muted mt-1">Versão {version}</p>}
      </div>

      <div className="bg-bg-surface border border-bg-border rounded-2xl p-6 space-y-4 text-sm">
        <p className="text-text-muted leading-relaxed">
          Uma interface gráfica para o CLI oficial do Immich. Faz upload de fotos e vídeos
          de forma visual, sem ter que tocar no terminal.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="https://immich.app">Site oficial do Immich</Link>
          <Link href="https://docs.immich.app/features/command-line-interface">
            Documentação do CLI
          </Link>
          <Link href="https://github.com/immich-app/immich">Código do Immich (GitHub)</Link>
        </div>
        <div className="pt-4 mt-4 border-t border-bg-border text-xs text-text-muted flex items-center justify-center gap-1.5">
          Feito com <Heart size={12} className="text-err fill-err" /> em macOS.
        </div>
      </div>
    </div>
  );
}

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <button
      onClick={() => window.immich.openExternal(href)}
      className="flex items-center justify-between gap-2 text-left rounded-lg px-3 py-2 -mx-3 hover:bg-bg-elev transition-colors"
    >
      <span>{children}</span>
      <ExternalLink size={13} className="text-text-subtle" />
    </button>
  );
}
