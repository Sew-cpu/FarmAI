import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const projectRoot = path.resolve(import.meta.dirname || process.cwd(), '.');

export default defineConfig(() => {
  return {
    root: projectRoot,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': projectRoot,
      },
    },
    server: {
      fs: {
        strict: true,
        allow: [projectRoot],
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: null,
    },
  };
});
