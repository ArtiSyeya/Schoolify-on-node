import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Прокси /api на бэкенд, чтобы фронт и сервер работали как одно целое в dev.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
