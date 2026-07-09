# Immich GUI

Uma app desktop nativa para macOS que envolve o [CLI oficial do Immich](https://docs.immich.app/features/command-line-interface) numa interface visual moderna. Escolhe pastas e fotos com seletores nativos, configura todas as opções com toggles, vê progresso e logs em tempo real — tudo sem tocar no terminal.

## Como funciona

- **Sem dependências externas**: a app traz o `@immich/cli` empacotado dentro do bundle e corre-o usando o runtime do Electron (com `ELECTRON_RUN_AS_NODE=1`). O utilizador final não precisa de ter Node, npm ou o `immich` instalados no sistema.
- **Credenciais persistidas** localmente via [`electron-store`](https://github.com/sindresorhus/electron-store), encriptadas em repouso.
- **API key** passada ao CLI por variável de ambiente (`IMMICH_API_KEY`) e nunca como argumento — não aparece em `ps`.

## Funcionalidades

| Funcionalidade do CLI | Onde está na GUI |
|-----------------------|------------------|
| `login` / API key | Ecrã de login |
| `logout` | Sidebar → "Terminar sessão" |
| `server-info` | Ecrã "Servidor" |
| `upload [paths…]` | Ecrã "Upload" → "Adicionar pasta" / "Adicionar fotos" |
| `--recursive` | Toggle "Recursivo" |
| `--include-hidden` | Toggle "Incluir ocultos" (avançado) |
| `--skip-hash` | Toggle "Saltar hash" (avançado) |
| `--album` | Toggle "Criar álbuns por pasta" |
| `--album-name` | Campo "Nome do álbum" |
| `--ignore` | Campo "Padrão a ignorar" (avançado) |
| `--dry-run` | Toggle "Dry run" |
| `--concurrency` | Stepper "Concorrência" (avançado) |
| `--delete` | Toggle "Apagar local após upload" (avançado) |
| `--delete-duplicates` | Toggle "Apagar duplicados locais" (avançado) |
| `--watch` | Toggle "Vigiar pasta" |
| `--json-output` | Toggle "Output em JSON" (avançado) |

A app mostra também uma pré-visualização do comando `immich upload …` exatamente como seria executado no terminal.

## Desenvolvimento

Requer **Node 20+** (testado com 24).

```bash
npm install
npm run dev          # arranca Vite + Electron com hot reload
```

## Build de produção

```bash
npm run build        # bundla renderer + main + preload (output em dist/ e dist-electron/)
npm run package      # produz um .dmg em release/
```

A app é construída para Apple Silicon (`arm64`) e Intel (`x64`). O .dmg sai em `release/`.

> Nota: o build não está assinado (`identity: null` no `electron-builder.yml`). Para distribuir publicamente terás que adicionar um certificado de developer Apple e configurar notarização.

## Adicionar um ícone

Coloca um ficheiro `icon.icns` (ou `icon.png` 1024×1024) em `build/` e o electron-builder usa-o automaticamente.

## Estrutura

```
.
├── electron/
│   ├── main.ts              # processo principal, IPC, dialogs
│   ├── immich-runner.ts     # spawn do @immich/cli como subprocesso
│   └── preload.ts           # bridge contextIsolated para o renderer
├── shared/
│   └── types.ts             # tipos partilhados main ↔ renderer
├── src/
│   ├── App.tsx              # router de vistas
│   ├── components/
│   │   ├── Login.tsx        # ecrã de URL + API key
│   │   ├── Sidebar.tsx
│   │   ├── ServerInfo.tsx   # mostra `immich server-info`
│   │   ├── Upload.tsx       # ecrã de upload (toda a UI dos flags)
│   │   ├── LogPane.tsx      # logs em tempo real
│   │   ├── About.tsx
│   │   └── ui/              # Toggle, TextField, NumberField
│   └── index.css            # tema escuro Tailwind
├── electron-builder.yml
├── tailwind.config.js
└── vite.config.ts
```

## Licença

MIT (a app). O `@immich/cli` empacotado mantém a sua licença AGPLv3.
