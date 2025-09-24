import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true,
    // Modificação para permitir o host do ngrok
    allowedHosts: ['.ngrok-free.app'],
    // Configuração de proxy para Docker
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Configuração para produção
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});