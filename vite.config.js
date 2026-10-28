import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze';

  return {
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    plugins: [
      tailwindcss(),
      react(),
      isAnalyze &&
        visualizer({
          open: true,
          filename: 'build/stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),
    server: {
      port: 3001,
      open: true,
    },
    define: {
      global: 'window',
    },
    build: {
      outDir: 'build',
      target: 'esnext',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      /**
       * **No hand-written chunk groups.** Grouping every library into a fixed `vendor-*` chunk made those chunks
       * import each other, because several of them share transitive dependencies (`clsx`, `date-fns`, `react-is`).
       * A chunk that only *needs one shared binding* from another chunk becomes a static import of it, so the
       * route-only libraries — recharts, react-datepicker, react-select — ended up in the entry's static graph and
       * therefore on the frontpage's critical path: 234 KB (brotli) of recharts/datepicker/select downloaded and
       * parsed before the first API request could even start, while `src/features/Problem` and
       * `src/features/Sector` — the only modules that import them — are `React.lazy` routes.
       *
       * Rolldown's default chunking follows the `React.lazy` boundaries instead, so a route-only library stays in
       * that route's chunk. It also cannot emit cross-vendor cycles, because it derives shared chunks itself.
       *
       * The former `modulePreload.resolveDependencies` denylist is gone with it: it only *hid* the eager chunks
       * from the preload list (they still loaded, just discovered late, which is strictly worse than either
       * preloading or not needing them), and its chunk-name matching would no longer resolve now that chunks are
       * named by Rolldown.
       */
      rolldownOptions: {
        output: {
          // Oxc minifier (Vite 8 default). Drop console/debugger in production builds.
          minify: {
            compress: {
              dropConsole: true,
              dropDebugger: true,
            },
          },
        },
      },
    },
  };
});
