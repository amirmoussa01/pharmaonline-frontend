import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [''],
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
      }
    }
  }
});
