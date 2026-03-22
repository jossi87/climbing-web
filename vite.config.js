import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const isAnalyze = mode === 'analyze';

  return {
    envPrefix: 'REACT_APP_',

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
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
      'process.env': {},
      global: 'window',
    },

    build: {
      outDir: 'build',
      target: 'esnext',
      cssMinify: 'esbuild',
      chunkSizeWarningLimit: 5000,

      commonjsOptions: {
        transformMixedEsModules: true,
      },

      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'COMMONJS_VARIABLE_IN_ESM' && warning.id?.includes('dashjs')) {
            return;
          }
          warn(warning);
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('swagger-ui-react')) return 'vendor-swagger';
              if (id.includes('recharts')) return 'vendor-charts';
              if (id.includes('dashjs') || id.includes('hls.js')) return 'vendor-video';
              if (id.includes('leaflet')) return 'vendor-leaflet';
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('linkifyjs') || id.includes('linkify-react')) return 'vendor-linkify';
              if (id.includes('react-datepicker') || id.includes('date-fns'))
                return 'vendor-datepicker';
              if (id.includes('@auth0')) return 'vendor-auth';
              if (id.includes('@sentry')) return 'vendor-sentry';
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('react-router-dom')
              ) {
                return 'vendor-react-core';
              }
            }
          },
        },
      },

      esbuild: {
        drop: isProd ? ['console', 'debugger'] : [],
      },
    },
  };
});
