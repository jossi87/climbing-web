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
      modulePreload: {
        /**
         * Keep frontpage startup lean by avoiding eager modulepreload for route-only/heavy feature chunks.
         * Chunks still load on-demand when those routes/components are requested.
         */
        resolveDependencies: (_filename, deps) => {
          const preloadDenylist = [
            'vendor-auth',
            'vendor-charts',
            'vendor-date-fns',
            'vendor-datepicker',
            'vendor-leaflet',
            'vendor-flat',
            'vendor-select',
            'vendor-sentry',
          ];
          return deps.filter((dep) => !preloadDenylist.some((name) => dep.includes(name)));
        },
      },
      chunkSizeWarningLimit: 1000,
      // Rolldown output options (Vite 8). Both manualChunks and the oxc minifier
      // live here — providing `rolldownOptions` replaces the legacy `rollupOptions`
      // compat shim entirely.
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts')) return 'vendor-charts';
              if (id.includes('leaflet')) return 'vendor-leaflet';
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('react-datepicker')) return 'vendor-datepicker';
              if (id.includes('date-fns')) return 'vendor-date-fns';
              if (id.includes('react-select')) return 'vendor-select';
              if (id.includes('flat')) return 'vendor-flat';
              if (id.includes('@auth0')) return 'vendor-auth';
              if (id.includes('@sentry')) return 'vendor-sentry';
              const isReactCoreLib =
                /[\\/]node_modules[\\/]react[\\/]/.test(id) ||
                /[\\/]node_modules[\\/]react-dom[\\/]/.test(id) ||
                /[\\/]node_modules[\\/]react-router[\\/]/.test(id) ||
                /[\\/]node_modules[\\/]react-router-dom[\\/]/.test(id) ||
                /[\\/]node_modules[\\/]scheduler[\\/]/.test(id);
              if (isReactCoreLib) {
                return 'vendor-react-core';
              }
              return undefined;
            }
          },
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
