import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import path from 'node:path';

// Set NO_ELECTRON=1 to run a plain web dev server (used for the in-browser
// design preview). The packaged app and `npm run dev` still bundle Electron.
const withElectron = process.env.NO_ELECTRON !== '1';

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  plugins: [
    react(),
    withElectron &&
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', 'electron-store', '@immich/cli'],
            },
          },
          resolve: {
            alias: {
              '@shared': path.resolve(__dirname, 'shared'),
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'cjs',
                entryFileNames: 'preload.cjs',
                inlineDynamicImports: true,
              },
            },
          },
          resolve: {
            alias: {
              '@shared': path.resolve(__dirname, 'shared'),
            },
          },
        },
      },
      renderer: {},
    }),
  ],
  build: {
    outDir: 'dist',
  },
});
