import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        // Remove the following line if your backend already expects '/api' in the path
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  optimizeDeps: {
    include: ['jwt-decode']
  },
});