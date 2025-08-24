import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1/admin': {
        target: process.env.ADMIN_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/v1': {
        target: process.env.API_BASE_URL || 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true
  }
});
