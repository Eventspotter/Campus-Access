import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { reticle } from '@reticlehq/vite-plugin';
import path from 'node:path';
export default defineConfig({ plugins: [reticle(), react(), tailwindcss()], resolve: { alias: { '@': path.resolve('src') } }, server: {
  port: 5173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:4000' },
} });
