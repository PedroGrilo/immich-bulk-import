/**
 * Rasterise assets/icon.svg into build/icon.png (1024×1024) using Electron's
 * bundled Chromium — no external image tooling required.
 *
 *   npm run icon
 *
 * electron-builder auto-detects build/icon.png and generates the macOS .icns.
 */
import { app, BrowserWindow } from 'electron';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SIZE = 1024;

const svg = readFileSync(path.join(ROOT, 'assets', 'icon.svg'), 'utf-8');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;background:transparent;width:${SIZE}px;height:${SIZE}px;overflow:hidden}
  svg{display:block;width:${SIZE}px;height:${SIZE}px}
</style></head><body>${svg}</body></html>`;

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: SIZE,
    height: SIZE,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    useContentSize: true,
    webPreferences: { offscreen: false },
  });

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  // Give the compositor a beat to paint the vector art.
  await new Promise((r) => setTimeout(r, 400));

  const image = await win.webContents.capturePage();
  const png = image.toPNG();

  const buildDir = path.join(ROOT, 'build');
  mkdirSync(buildDir, { recursive: true });
  const out = path.join(buildDir, 'icon.png');
  writeFileSync(out, png);

  const { width, height } = image.getSize();
  console.log(`Wrote ${out} (${width}×${height}, ${(png.length / 1024).toFixed(1)} KB)`);

  app.quit();
});

app.on('window-all-closed', () => app.quit());
