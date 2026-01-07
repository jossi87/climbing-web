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
    sourcemap: false,
    cssCodeSplit: true,
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'semantic-ui': ['semantic-ui-react'],
          'recharts-vendor': ['recharts'],
          'leaflet-vendor': [
            'leaflet',
            'react-leaflet',
            '@react-leaflet/core',
            'leaflet.fullscreen',
            'leaflet.locatecontrol',
            'leaflet.markercluster',
          ],
          'swagger-ui': ['swagger-ui-react'],
          'video-player': ['react-player'],
          'auth-provider': ['@auth0/auth0-react'],
          monitoring: ['@sentry/react'],
          'react-query': ['@tanstack/react-query'],
          'utils-heavy': ['heic2any', 'remarkable', 'file-saver'],
          'utils-light': ['linkifyjs', 'linkify-react', 'suncalc'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug', 'console.warn'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
