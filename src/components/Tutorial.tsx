import {
  KeyRound,
  PlugZap,
  FolderPlus,
  SlidersHorizontal,
  Rocket,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { AppMark } from './Logo';

interface Props {
  onStart: () => void;
  onSeen: () => void;
}

interface Step {
  icon: typeof KeyRound;
  title: string;
  body: ReactNode;
}

export function Tutorial({ onStart, onSeen }: Props) {
  const steps: Step[] = [
    {
      icon: KeyRound,
      title: 'Create an API key in Immich',
      body: (
        <>
          In the Immich web app, open{' '}
          <b>Account Settings → API Keys</b> and create a new key. Copy it — you’ll paste it into
          the app once.
        </>
      ),
    },
    {
      icon: PlugZap,
      title: 'Connect to your server',
      body: (
        <>
          Enter your server URL (e.g. <code className="code">https://immich.example.com</code>) and
          the API key on the sign-in screen. The app verifies the connection before saving it
          locally.
        </>
      ),
    },
    {
      icon: FolderPlus,
      title: 'Add photos and folders',
      body: (
        <>
          On the <b>Upload</b> screen, click <b>Add folder</b> to queue an entire directory, or{' '}
          <b>Add photos / videos</b> to pick individual files. Add as many as you like.
        </>
      ),
    },
    {
      icon: SlidersHorizontal,
      title: 'Choose your options',
      body: (
        <>
          Toggle <b>Recursive</b> to include subfolders, <b>Create album per folder</b> to organise
          automatically, or turn on a <b>Dry run</b> to preview without uploading. Advanced flags
          live under “Show advanced options”.
        </>
      ),
    },
    {
      icon: Rocket,
      title: 'Start the upload',
      body: (
        <>
          Hit <b>Start upload</b> and watch live progress, a running log, and the exact CLI command
          being executed. You can cancel at any time.
        </>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto animate-slide-up space-y-6">
      {/* Hero */}
      <div className="glass rounded-3xl p-7 flex items-center gap-5">
        <AppMark size={64} className="flex-shrink-0 drop-shadow-lg" />
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-accent bg-accent/10 border border-accent/25 rounded-full px-2.5 py-0.5 mb-2">
            <Sparkles size={11} />
            Getting started
          </div>
          <h1 className="text-2xl font-semibold leading-tight">
            Bulk-import your library in five steps
          </h1>
          <p className="text-sm text-text-muted mt-1.5">
            A visual front-end for the official Immich CLI. No terminal, no scripts — just point it
            at your photos.
          </p>
        </div>
      </div>

      {/* Steps */}
      <ol className="space-y-3">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <li key={i} className="glass rounded-2xl p-5 flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="h-9 w-9 rounded-xl btn-glass flex items-center justify-center text-accent">
                <Icon size={18} />
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 mt-2 bg-[var(--inset-border)]" />
              )}
            </div>
            <div className="pt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-text-subtle">
                  Step {i + 1}
                </span>
              </div>
              <h2 className="text-sm font-semibold mt-0.5">{title}</h2>
              <p className="text-sm text-text-muted leading-relaxed mt-1">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Safety note */}
      <div className="glass rounded-2xl p-5 flex gap-3">
        <ShieldCheck size={18} className="text-ok flex-shrink-0 mt-0.5" />
        <p className="text-sm text-text-muted leading-relaxed">
          <b className="text-text">Your originals are safe by default.</b> Uploading never deletes
          local files unless you explicitly enable <code className="code">Delete local after
          upload</code> in the advanced options. When in doubt, run a <b>Dry run</b> first.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          onClick={onStart}
          className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium text-sm"
        >
          Go to Upload
          <ArrowRight size={15} />
        </button>
        <button
          onClick={() => {
            onSeen();
            window.immich.openExternal(
              'https://docs.immich.app/features/command-line-interface'
            );
          }}
          className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-text-muted hover:text-text"
        >
          Read the CLI docs
          <ExternalLink size={13} />
        </button>
      </div>
    </div>
  );
}
