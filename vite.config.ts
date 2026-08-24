import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const rootDir = __dirname;

  return {
    root: rootDir,
    plugins: [
      react(),
      tailwindcss(),
    ],
    optimizeDeps: {
      force: true,
    },
    resolve: {
      alias: {
        '@': rootDir,
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 3001,
      strictPort: true,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
