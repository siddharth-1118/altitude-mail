import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { app } from './server';

export default defineConfig(() => {
  const mailDir = __dirname;
  const rootDir = path.resolve(mailDir, '..');

  return {
    root: mailDir,
    cacheDir: path.join(rootDir, 'node_modules/.vite-mail'),
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'express-mail-api',
        configureServer(server) {
          server.middlewares.use(app);
        },
      },
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
      outDir: path.join(rootDir, 'dist'),
      emptyOutDir: false,
      rollupOptions: {
        input: path.resolve(mailDir, 'index.html'),
      },
    },
    server: {
      port: 3001,
      strictPort: true,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
