import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FolderPlus,
  ImagePlus,
  X,
  Play,
  Square,
  Folder,
  File as FileIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import type { ImmichCredentials, UploadOptions } from '@shared/types';
import { defaultUploadOptions } from '@shared/types';
import { LogPane, type LogLine } from './LogPane';
import { Toggle } from './ui/Toggle';
import { TextField } from './ui/TextField';
import { NumberField } from './ui/NumberField';

type Status = 'idle' | 'starting' | 'running' | 'done' | 'failed' | 'cancelled';

export function Upload({ creds }: { creds: ImmichCredentials }) {
  const [opts, setOpts] = useState<UploadOptions>(defaultUploadOptions);
  const [status, setStatus] = useState<Status>('idle');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [progress, setProgress] = useState<{
    current?: number;
    total?: number;
    percent?: number;
    eta?: string;
    message?: string;
  }>({});
  const [exitCode, setExitCode] = useState<number | undefined>();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const jobIdRef = useRef<string>('');

  const update = <K extends keyof UploadOptions>(k: K, v: UploadOptions[K]) =>
    setOpts((o) => ({ ...o, [k]: v }));

  // ---------- Subscribe to events ----------
  useEffect(() => {
    const offLog = window.immich.onJobLog((e) => {
      if (e.jobId !== jobIdRef.current) return;
      setLogs((prev) => [...prev, { level: e.level as any, text: e.text, ts: e.ts }]);
    });
    const offProg = window.immich.onJobProgress((e) => {
      if (e.jobId !== jobIdRef.current) return;
      setProgress((p) => ({ ...p, ...e }));
    });
    const offStat = window.immich.onJobStatus((e) => {
      if (e.jobId !== jobIdRef.current) return;
      setStatus(e.status as Status);
      if (e.exitCode !== undefined) setExitCode(e.exitCode);
      if (e.error) {
        setLogs((prev) => [...prev, { level: 'error', text: e.error!, ts: Date.now() }]);
      }
    });
    return () => {
      offLog();
      offProg();
      offStat();
    };
  }, []);

  // ---------- Path management ----------
  const addDirs = async () => {
    const r = await window.immich.chooseDirs();
    if (r.ok && r.data) {
      setOpts((o) => ({ ...o, paths: dedupe([...o.paths, ...r.data!]) }));
    }
  };

  const addFiles = async () => {
    const r = await window.immich.chooseFiles();
    if (r.ok && r.data) {
      setOpts((o) => ({ ...o, paths: dedupe([...o.paths, ...r.data!]) }));
    }
  };

  const removePath = (p: string) =>
    setOpts((o) => ({ ...o, paths: o.paths.filter((x) => x !== p) }));

  const clearPaths = () => setOpts((o) => ({ ...o, paths: [] }));

  // ---------- Start / cancel ----------
  const start = () => {
    if (opts.paths.length === 0) return;
    if (running) return;
    jobIdRef.current = `job-${Date.now()}`;
    setLogs([]);
    setProgress({});
    setExitCode(undefined);
    setStatus('starting');
    window.immich.startUpload(jobIdRef.current, creds, opts);
  };

  const cancel = () => {
    if (!jobIdRef.current) return;
    window.immich.cancelJob(jobIdRef.current);
    setStatus('cancelled');
  };

  const running = status === 'running' || status === 'starting';
  const canStart = !running && opts.paths.length > 0;

  // Build a "preview" of the equivalent CLI command
  const cliPreview = useMemo(() => buildCliPreview(opts), [opts]);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-slide-up space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Upload</h1>
        <p className="text-sm text-text-muted mt-1">
          Pick folders or files and configure the run. Everything the CLI supports lives here.
        </p>
      </div>

      {/* ============== Sources ============== */}
      <Card title="Source" subtitle="Folders and files that will be uploaded">
        <div className="flex flex-wrap gap-2 mb-4">
          <ActionButton onClick={addDirs} icon={FolderPlus} label="Add folder" />
          <ActionButton onClick={addFiles} icon={ImagePlus} label="Add photos / videos" />
          {opts.paths.length > 0 && (
            <ActionButton onClick={clearPaths} icon={Trash2} label="Clear all" variant="ghost" />
          )}
        </div>

        {opts.paths.length === 0 ? (
          <button
            onClick={addDirs}
            className="w-full border-2 border-dashed border-[var(--inset-border)] rounded-2xl py-10 px-6 text-center hover:border-accent/60 hover:bg-accent/5 transition-colors group"
          >
            <FolderPlus
              size={32}
              className="mx-auto mb-3 text-text-subtle group-hover:text-accent transition-colors"
            />
            <div className="font-medium text-sm">Click to choose a folder</div>
            <div className="text-xs text-text-muted mt-1">
              Or use “Add photos / videos” to pick individual files
            </div>
          </button>
        ) : (
          <ul className="space-y-1.5 max-h-64 overflow-auto">
            {opts.paths.map((p) => {
              const isDir = !/\.[^/]+$/.test(p);
              return (
                <li
                  key={p}
                  className="flex items-center gap-2 glass-inset rounded-xl pl-3 pr-2 py-2 group"
                >
                  {isDir ? (
                    <Folder size={14} className="text-accent flex-shrink-0" />
                  ) : (
                    <FileIcon size={14} className="text-text-muted flex-shrink-0" />
                  )}
                  <span className="text-xs font-mono truncate flex-1 selectable" title={p}>
                    {p}
                  </span>
                  <button
                    onClick={() => removePath(p)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-err p-1 rounded transition-opacity"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* ============== Options ============== */}
      <Card title="Options" subtitle="Flags for the upload command">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Recursive"
            description="Include subfolders in the upload"
            checked={opts.recursive}
            onChange={(v) => update('recursive', v)}
          />
          <Toggle
            label="Dry run"
            description="Preview what would happen without uploading"
            checked={opts.dryRun}
            onChange={(v) => update('dryRun', v)}
          />
          <Toggle
            label="Create album per folder"
            description="--album: turn each source folder into an album"
            checked={opts.album}
            onChange={(v) => update('album', v)}
          />
          <Toggle
            label="Watch folder"
            description="Keep running and upload new files automatically"
            checked={opts.watch}
            onChange={(v) => update('watch', v)}
          />
        </div>

        <div className="mt-5 pt-5 border-t border-[var(--inset-border)]">
          <TextField
            label="Album name"
            placeholder="Leave empty to skip"
            description="--album-name: send everything to one specific album"
            value={opts.albumName ?? ''}
            onChange={(v) => update('albumName', v || undefined)}
          />
        </div>

        {/* ===== Advanced ===== */}
        <button
          onClick={() => setShowAdvanced((s) => !s)}
          className="mt-5 flex items-center gap-2 text-xs font-medium text-text-muted hover:text-text transition-colors"
        >
          {showAdvanced ? <EyeOff size={12} /> : <Eye size={12} />}
          {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
        </button>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-[var(--inset-border)] space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Toggle
                label="Include hidden files"
                description="--include-hidden"
                checked={opts.includeHidden}
                onChange={(v) => update('includeHidden', v)}
              />
              <Toggle
                label="Skip hash"
                description="--skip-hash: faster, less safe"
                checked={opts.skipHash}
                onChange={(v) => update('skipHash', v)}
              />
              <Toggle
                label="Delete local after upload"
                description={
                  <span className="text-warn">--delete: careful, removes the originals!</span>
                }
                checked={opts.deleteAfter}
                onChange={(v) => update('deleteAfter', v)}
                danger={opts.deleteAfter}
              />
              <Toggle
                label="Delete local duplicates"
                description="--delete-duplicates"
                checked={opts.deleteDuplicates}
                onChange={(v) => update('deleteDuplicates', v)}
                danger={opts.deleteDuplicates}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberField
                label="Concurrency"
                description="--concurrency: parallel uploads"
                value={opts.concurrency}
                min={1}
                max={32}
                onChange={(v) => update('concurrency', v)}
              />
              <TextField
                label="Ignore pattern"
                placeholder="e.g. **/.DS_Store"
                description="--ignore: glob pattern"
                value={opts.ignore ?? ''}
                onChange={(v) => update('ignore', v || undefined)}
              />
            </div>

            <Toggle
              label="JSON output"
              description="--json-output"
              checked={opts.jsonOutput}
              onChange={(v) => update('jsonOutput', v)}
            />
          </div>
        )}
      </Card>

      {/* ============== CLI Preview ============== */}
      <Card title="Equivalent command" subtitle="What will be executed">
        <pre className="glass-inset rounded-xl p-3 text-xs font-mono overflow-x-auto selectable text-text-muted">
          <span className="text-accent">$</span> {cliPreview}
        </pre>
      </Card>

      {/* ============== Run ============== */}
      <div className="sticky bottom-0 glass-strong rounded-2xl -mx-2 px-6 py-4 mt-2">
        <div className="flex items-center gap-4">
          {running ? (
            <button
              onClick={cancel}
              className="btn-danger flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium text-sm"
            >
              <Square size={14} fill="currentColor" />
              Cancel
            </button>
          ) : (
            <button
              onClick={start}
              disabled={!canStart}
              className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium text-sm"
            >
              <Play size={14} fill="currentColor" />
              {opts.dryRun ? 'Simulate upload' : 'Start upload'}
            </button>
          )}

          <StatusPill status={status} exitCode={exitCode} />

          {progress.message && (
            <span className="text-xs text-text-muted truncate flex-1 font-mono">
              {progress.message}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {(running || progress.percent !== undefined) && (
          <div className="mt-3">
            <ProgressBar
              percent={progress.percent}
              current={progress.current}
              total={progress.total}
              eta={progress.eta}
              indeterminate={running && progress.percent === undefined}
            />
          </div>
        )}
      </div>

      {/* ============== Logs ============== */}
      {(logs.length > 0 || running) && <LogPane logs={logs} />}
    </div>
  );
}

// ====================================================
// Helpers
// ====================================================
function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function buildCliPreview(o: UploadOptions): string {
  const parts: string[] = ['immich', 'upload'];
  if (o.recursive) parts.push('--recursive');
  if (o.includeHidden) parts.push('--include-hidden');
  if (o.skipHash) parts.push('--skip-hash');
  if (o.album) parts.push('--album');
  if (o.albumName) parts.push('--album-name', shellEscape(o.albumName));
  if (o.ignore) parts.push('--ignore', shellEscape(o.ignore));
  if (o.dryRun) parts.push('--dry-run');
  if (o.concurrency !== 4) parts.push('--concurrency', String(o.concurrency));
  if (o.deleteAfter) parts.push('--delete');
  if (o.deleteDuplicates) parts.push('--delete-duplicates');
  if (o.watch) parts.push('--watch');
  if (o.jsonOutput) parts.push('--json-output');
  for (const p of o.paths) parts.push(shellEscape(p));
  return parts.join(' ');
}

function shellEscape(s: string): string {
  if (/^[A-Za-z0-9_./@:=+-]+$/.test(s)) return s;
  return `'${s.replace(/'/g, "'\\''")}'`;
}

// ====================================================
// Local sub-components
// ====================================================
function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-2xl p-5">
      <header className="mb-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function ActionButton({
  onClick,
  icon: Icon,
  label,
  variant = 'solid',
}: {
  onClick: () => void;
  icon: typeof FolderPlus;
  label: string;
  variant?: 'solid' | 'ghost';
}) {
  const cls =
    variant === 'solid'
      ? 'btn-glass'
      : 'bg-transparent hover-wash border border-transparent text-text-muted hover:text-text';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl ${cls} text-sm transition-colors`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function ProgressBar({
  percent,
  current,
  total,
  eta,
  indeterminate,
}: {
  percent?: number;
  current?: number;
  total?: number;
  eta?: string;
  indeterminate?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-text-muted font-mono mb-1.5">
        <span>
          {current !== undefined && total !== undefined
            ? `${current} / ${total}`
            : indeterminate
            ? 'Processing…'
            : ''}
        </span>
        <span>
          {percent !== undefined && `${Math.round(percent)}%`}
          {eta && ` · ETA ${eta}`}
        </span>
      </div>
      <div className="h-2 glass-inset rounded-full overflow-hidden">
        {indeterminate ? (
          <div className="h-full w-1/3 bg-accent animate-pulse-slow rounded-full" />
        ) : (
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.max(0, percent ?? 0))}%`,
              backgroundImage:
                'linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent-2)))',
            }}
          />
        )}
      </div>
    </div>
  );
}

function StatusPill({ status, exitCode }: { status: Status; exitCode?: number }) {
  const conf: Record<Status, { label: string; cls: string; icon: React.ReactNode }> = {
    idle: { label: 'Ready', cls: 'glass-inset text-text-muted', icon: null },
    starting: {
      label: 'Starting…',
      cls: 'bg-accent/15 text-accent border border-accent/30',
      icon: <Loader2 size={11} className="animate-spin" />,
    },
    running: {
      label: 'Running',
      cls: 'bg-accent/15 text-accent border border-accent/30',
      icon: <Loader2 size={11} className="animate-spin" />,
    },
    done: {
      label: exitCode === 0 ? 'Completed' : `Completed (code ${exitCode})`,
      cls: 'bg-ok/15 text-ok border border-ok/30',
      icon: <CheckCircle2 size={11} />,
    },
    failed: {
      label: `Failed${exitCode !== undefined ? ` (${exitCode})` : ''}`,
      cls: 'bg-err/15 text-err border border-err/30',
      icon: <XCircle size={11} />,
    },
    cancelled: {
      label: 'Cancelled',
      cls: 'bg-warn/15 text-warn border border-warn/30',
      icon: <X size={11} />,
    },
  };
  const c = conf[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${c.cls}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}
