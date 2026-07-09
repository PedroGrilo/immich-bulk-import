import { spawn, ChildProcess } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { app } from 'electron';
import type { ImmichCredentials } from '../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RunOpts {
  creds?: ImmichCredentials;
  args: string[];
  jobId?: string;
  onStdout?: (line: string) => void;
  onStderr?: (line: string) => void;
}

const running = new Map<string, ChildProcess>();

/**
 * Resolve the path to the @immich/cli entry script that was bundled inside
 * our app's node_modules. We run it via Electron itself (with
 * ELECTRON_RUN_AS_NODE=1) so the user doesn't need Node installed.
 */
function resolveImmichEntry(): string {
  // Candidate base paths to look for node_modules.
  const candidates: string[] = [];

  // app.getAppPath() works both in dev and packaged
  const appPath = app.getAppPath();
  candidates.push(appPath);

  // When asar is used, native binaries / scripts are unpacked to <asar>.unpacked
  if (appPath.endsWith('.asar')) {
    candidates.push(appPath + '.unpacked');
  }

  // Resources path on packaged macOS apps
  if (process.resourcesPath) {
    candidates.push(process.resourcesPath);
    candidates.push(path.join(process.resourcesPath, 'app.asar.unpacked'));
  }

  // Dev fallback: project root (two levels up from dist-electron)
  candidates.push(path.join(__dirname, '..'));
  candidates.push(path.join(__dirname, '..', '..'));

  for (const base of candidates) {
    const cliRoot = path.join(base, 'node_modules', '@immich', 'cli');
    const pkgPath = path.join(cliRoot, 'package.json');
    if (!existsSync(pkgPath)) continue;

    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

      // Strategy: prefer files with explicit .js/.mjs/.cjs extensions because
      // Node refuses to load extension-less files when "type": "module".
      // The bin field of @immich/cli points to "./bin/immich" which is
      // a tiny shim — we'd rather invoke the real entry.
      const candidatesRel: string[] = [];

      // 1. exports field (modern packages)
      if (typeof pkg.exports === 'string') candidatesRel.push(pkg.exports);
      else if (pkg.exports && typeof pkg.exports === 'object') {
        const dot = pkg.exports['.'] ?? pkg.exports;
        if (typeof dot === 'string') candidatesRel.push(dot);
        else if (dot && typeof dot === 'object') {
          for (const v of Object.values(dot)) {
            if (typeof v === 'string') candidatesRel.push(v);
          }
        }
      }
      // 2. main field
      if (pkg.main) candidatesRel.push(pkg.main);
      // 3. Common conventions
      candidatesRel.push('dist/index.js', 'dist/main.js', 'index.js');
      // 4. bin (last resort — may be extensionless)
      const binField = pkg.bin;
      if (typeof binField === 'string') candidatesRel.push(binField);
      else if (binField && typeof binField === 'object') {
        const v = binField.immich || Object.values(binField)[0];
        if (typeof v === 'string') candidatesRel.push(v);
      }

      for (const rel of candidatesRel) {
        const full = path.join(cliRoot, rel);
        // Skip extension-less files in module packages — Node will reject them.
        if (pkg.type === 'module' && !/\.(m?js|cjs)$/i.test(full)) continue;
        if (existsSync(full)) return full;
      }
    } catch {
      // ignore parse errors, try next candidate
    }
  }

  throw new Error(
    'Não consegui encontrar o @immich/cli dentro do bundle da app. ' +
      'Reinstala as dependências com `npm install`.'
  );
}

export function runImmich(opts: RunOpts): Promise<number> {
  return new Promise((resolve, reject) => {
    let entry: string;
    try {
      entry = resolveImmichEntry();
    } catch (e) {
      reject(e);
      return;
    }

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      // Force colour off so we don't get ANSI escape junk in the UI
      NO_COLOR: '1',
      FORCE_COLOR: '0',
      TERM: 'dumb',
    };

    const args = [entry];

    // Pass credentials via env vars to avoid putting the API key on the
    // command line (where it would show up in `ps`).
    if (opts.creds?.url) {
      env.IMMICH_INSTANCE_URL = opts.creds.url;
    }
    if (opts.creds?.apiKey) {
      env.IMMICH_API_KEY = opts.creds.apiKey;
    }

    args.push(...opts.args);

    const child = spawn(process.execPath, args, {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (opts.jobId) running.set(opts.jobId, child);

    let stdoutBuf = '';
    let stderrBuf = '';

    child.stdout?.on('data', (chunk: Buffer) => {
      stdoutBuf += chunk.toString('utf-8');
      let nl: number;
      while ((nl = stdoutBuf.indexOf('\n')) !== -1) {
        const line = stdoutBuf.slice(0, nl).replace(/\r$/, '');
        stdoutBuf = stdoutBuf.slice(nl + 1);
        if (line.length) opts.onStdout?.(line);
      }
      // Carriage-return-only progress lines (e.g. progress bars updated in place)
      if (stdoutBuf.includes('\r') && !stdoutBuf.includes('\n')) {
        const parts = stdoutBuf.split('\r');
        for (let i = 0; i < parts.length - 1; i++) {
          if (parts[i].trim()) opts.onStdout?.(parts[i]);
        }
        stdoutBuf = parts[parts.length - 1];
      }
    });

    child.stderr?.on('data', (chunk: Buffer) => {
      stderrBuf += chunk.toString('utf-8');
      let nl: number;
      while ((nl = stderrBuf.indexOf('\n')) !== -1) {
        const line = stderrBuf.slice(0, nl).replace(/\r$/, '');
        stderrBuf = stderrBuf.slice(nl + 1);
        if (line.length) opts.onStderr?.(line);
      }
    });

    child.on('error', (err) => {
      if (opts.jobId) running.delete(opts.jobId);
      reject(err);
    });

    child.on('close', (code) => {
      if (stdoutBuf.trim()) opts.onStdout?.(stdoutBuf.trim());
      if (stderrBuf.trim()) opts.onStderr?.(stderrBuf.trim());
      if (opts.jobId) running.delete(opts.jobId);
      resolve(code ?? 0);
    });
  });
}

export function cancelJob(jobId: string): boolean {
  const child = running.get(jobId);
  if (!child) return false;
  child.kill('SIGTERM');
  setTimeout(() => {
    if (running.has(jobId)) child.kill('SIGKILL');
  }, 2000);
  return true;
}
