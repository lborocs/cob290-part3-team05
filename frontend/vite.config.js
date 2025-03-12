import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Change this to where your backend is running
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')  // Rewrite to remove '/api' prefix if needed
      }
    }
  }
});

