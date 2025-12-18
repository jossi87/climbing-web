import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import envCompatible from 'vite-plugin-env-compatible';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    envCompatible({ prefix: 'REACT_APP_' }),
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
    sourcemap: true,
    cssCodeSplit: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Large UI libraries
          'semantic-ui': ['semantic-ui-react', 'semantic-ui-css'],
          'recharts-vendor': ['recharts'],

          // Leaflet mapping
          'leaflet-vendor': [
            'leaflet',
            'react-leaflet',
            '@react-leaflet/core',
            'leaflet.fullscreen',
            'leaflet.locatecontrol',
            'leaflet.markercluster',
          ],

          // Heavy dependencies
          'swagger-ui': ['swagger-ui-react'],
          'video-player': ['react-player', 'hls.js'],

          // Auth & monitoring
          'auth-sentry': ['@auth0/auth0-react', '@sentry/react'],

          // React Query
          'react-query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],

          // Utilities
          utils: [
            'file-saver',
            'heic2any',
            'linkifyjs',
            'linkify-react',
            'remarkable',
            'suncalc',
            'svg-path-parser',
            'svg-path-properties',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
