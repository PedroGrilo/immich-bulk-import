# Immich Bulk Import

A clean, native macOS app that wraps the [official Immich CLI](https://docs.immich.app/features/command-line-interface) in a modern, liquid-glass interface. Pick folders and photos with native dialogs, configure every option with toggles, and watch real-time progress and logs — all without touching the terminal.

## How it works

- **No external dependencies**: the app bundles `@immich/cli` inside the app bundle and runs it with the Electron runtime (via `ELECTRON_RUN_AS_NODE=1`). End users don't need Node, npm, or the `immich` CLI installed.
- **Credentials are stored locally** via [`electron-store`](https://github.com/sindresorhus/electron-store), encrypted at rest.
- **The API key is passed to the CLI as an environment variable** (`IMMICH_API_KEY`), never as a command-line argument — so it never shows up in `ps`.
- **Theme-aware**: the liquid-glass UI follows the macOS light / dark appearance automatically.
- **Built-in tutorial**: a five-step, in-app guide walks new users through connecting and their first upload.

## Features

| CLI feature | Where it lives in the app |
|-------------|---------------------------|
| `login` / API key | Sign-in screen |
| `logout` | Sidebar → "Sign out" |
| `server-info` | "Server" screen |
| `upload [paths…]` | "Upload" screen → "Add folder" / "Add photos / videos" |
| `--recursive` | "Recursive" toggle |
| `--include-hidden` | "Include hidden files" toggle (advanced) |
| `--skip-hash` | "Skip hash" toggle (advanced) |
| `--album` | "Create album per folder" toggle |
| `--album-name` | "Album name" field |
| `--ignore` | "Ignore pattern" field (advanced) |
| `--dry-run` | "Dry run" toggle |
| `--concurrency` | "Concurrency" stepper (advanced) |
| `--delete` | "Delete local after upload" toggle (advanced) |
| `--delete-duplicates` | "Delete local duplicates" toggle (advanced) |
| `--watch` | "Watch folder" toggle |
| `--json-output` | "JSON output" toggle (advanced) |

The app also shows a live preview of the equivalent `immich upload …` command, exactly as it would run in the terminal.

## Development

Requires **Node 20+** (tested with 24).

```bash
npm install
npm run dev          # Vite + Electron with hot reload
npm run dev:web      # plain web dev server (no Electron) for the in-browser UI preview
```

When run in a plain browser, a dev-only stub for the Electron bridge is installed automatically so the UI renders. Append `?login` to the URL to preview the signed-out state. This stub is stripped from production builds.

## Production build

```bash
npm run build        # bundles renderer + main + preload (into dist/ and dist-electron/)
npm run package      # produces a .dmg in release/
```

> Note: the build is unsigned (`identity: null` in `electron-builder.yml`). To distribute publicly you'll need to add an Apple developer certificate and configure notarization.

## App icon

The icon is generated from `assets/icon.svg`:

```bash
npm run icon         # renders build/icon.png via Electron's Chromium
```

electron-builder automatically picks up `build/icon.png` and generates the macOS `.icns`.

## Project structure

```
.
├── assets/
│   └── icon.svg             # source vector for the app icon
├── scripts/
│   └── make-icon.mjs        # renders assets/icon.svg → build/icon.png
├── electron/
│   ├── main.ts              # main process, IPC, dialogs
│   ├── immich-runner.ts     # spawns @immich/cli as a subprocess
│   └── preload.ts           # context-isolated bridge to the renderer
├── shared/
│   └── types.ts             # types shared between main ↔ renderer
├── src/
│   ├── App.tsx              # view router
│   ├── components/
│   │   ├── Logo.tsx         # brand mark + wordmark
│   │   ├── Login.tsx        # server URL + API key screen
│   │   ├── Sidebar.tsx
│   │   ├── ServerInfo.tsx   # shows `immich server-info`
│   │   ├── Upload.tsx       # upload screen (all the flag UI)
│   │   ├── Tutorial.tsx     # in-app getting-started guide
│   │   ├── LogPane.tsx      # real-time logs
│   │   ├── About.tsx
│   │   └── ui/              # Toggle, TextField, NumberField
│   ├── dev/browserMock.ts   # dev-only stub of the Electron bridge
│   └── index.css            # liquid-glass design system (light + dark)
├── electron-builder.yml
├── tailwind.config.js
└── vite.config.ts
```

## License

MIT (the app). The bundled `@immich/cli` keeps its own AGPLv3 license.
