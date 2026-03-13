import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(({ mode }) => ({
  envPrefix: 'REACT_APP_',
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
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
    cssMinify: 'esbuild',
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
