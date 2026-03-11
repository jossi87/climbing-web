import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(({ mode }) => ({
  envPrefix: 'REACT_APP_',
  plugins: [
    react(),
    tsconfigPaths(),
    mode === 'analyze' &&
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
  build: {
    outDir: 'build',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'leaflet-vendor': [
            'leaflet',
            'react-leaflet',
            '@react-leaflet/core',
            'leaflet.fullscreen',
            'leaflet.locatecontrol',
            'leaflet.markercluster',
          ],
          'swagger-ui': ['swagger-ui-react'],
          'heavy-libs': ['heic2any', 'remarkable', 'file-saver', '@sentry/react'],
          'utils-common': ['linkifyjs', 'linkify-react', 'suncalc'],
        },
      },
    },
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
