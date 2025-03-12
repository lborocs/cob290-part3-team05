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
        target: 'http://34.147.242.96:8080',  // Backend API
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Remove `/api` before forwarding
      }
    }
  }
})
