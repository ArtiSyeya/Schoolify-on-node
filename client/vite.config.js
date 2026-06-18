import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Прокси /api на бэкенд, чтобы фронт и сервер работали как одно целое в dev.
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:4000',
    },
  },
});
